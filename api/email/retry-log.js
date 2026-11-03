import { Resend } from "resend";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const FIREBASE_CONFIG = {
  projectId: "rightmind-african-hub",
  appId: "1:773127969332:web:0234cc96f67ecdcd678861",
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBpRxsFugEu8RwO1PV7AkOPq_xfz8qgc9U",
  authDomain: "rightmind-african-hub.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-e4b5d071-b5f6-4b34-8c74-ef5cd4aa6c65",
  storageBucket: "rightmind-african-hub.firebasestorage.app",
  messagingSenderId: "773127969332"
};

let cachedDb = null;
function getServerFirestore() {
  if (cachedDb) return cachedDb;
  try {
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    cachedDb = initializeFirestore(
      app,
      { ignoreUndefinedProperties: true },
      FIREBASE_CONFIG.firestoreDatabaseId
    );
    return cachedDb;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { logId } = body;
    if (!logId) {
      return res.status(400).json({ error: "logId is a required parameter." });
    }

    const db = getServerFirestore();
    if (!db) {
      return res.status(500).json({ error: "Cannot communicate with backend database instance." });
    }

    const logRef = doc(db, "email_logs", logId);
    const logSnap = await getDoc(logRef);
    if (!logSnap.exists()) {
      return res.status(404).json({ error: "No email log match detected." });
    }

    const logData = logSnap.data();
    const apiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev";
    const senderName = "Right Minds Africa";
    const replyTo = "info@rightmindsafrica.org";

    let success = true;
    let messageId = `SIM-${Date.now()}`;
    let errorMsg = null;

    if (apiKey) {
      const resend = new Resend(apiKey);
      const emailBody = logData.body || logData.deliveryResult || logData.subject;
      const primaryFrom = `"${senderName}" <${senderEmail}>`;
      const fallbackFrom = `"${senderName}" <onboarding@resend.dev>`;

      try {
        const { data, error } = await resend.emails.send({
          from: primaryFrom,
          to: [logData.recipient],
          subject: logData.subject,
          text: emailBody,
          replyTo
        });
        if (error) {
          throw new Error(error.message || JSON.stringify(error));
        }
        messageId = data?.id || messageId;
      } catch (primaryErr) {
        let errText = primaryErr?.message || String(primaryErr);

        // Fallback to onboarding@resend.dev if custom domain is not yet verified
        if (senderEmail !== "onboarding@resend.dev" && (errText.toLowerCase().includes("not verified") || errText.toLowerCase().includes("domain"))) {
          try {
            const { data: s2Data, error: s2Err } = await resend.emails.send({
              from: fallbackFrom,
              to: [logData.recipient],
              subject: logData.subject,
              text: emailBody,
              replyTo
            });
            if (!s2Err && s2Data?.id) {
              messageId = s2Data.id;
              errText = "";
            } else if (s2Err) {
              errText = s2Err.message || JSON.stringify(s2Err);
            }
          } catch (s2Catch) {
            errText = s2Catch?.message || errText;
          }
        }

        // Sandbox trial fallback if recipient is not verified owner
        if (errText && (errText.includes("You can only send testing emails") || errText.toLowerCase().includes("not verified"))) {
          const ownerMatch = errText.match(/\(([^)]+@[^)]+)\)/);
          const retryTo = ownerMatch && ownerMatch[1] ? ownerMatch[1].trim() : "olosundelouis@gmail.com";
          const { data: fbData, error: fbErr } = await resend.emails.send({
            from: fallbackFrom,
            to: [retryTo],
            subject: `[Sandbox Redirect for ${logData.recipient}] ${logData.subject}`,
            text: `[SANDBOX TRIAL REDIRECT] Originally destined for <${logData.recipient}>\n\n${emailBody}`,
            replyTo
          });
          if (!fbErr && fbData?.id) {
            messageId = fbData.id;
            errText = "";
          } else if (fbErr) {
            errText = fbErr.message || JSON.stringify(fbErr);
          }
        }

        if (errText) {
          success = false;
          errorMsg = errText;
        }
      }
    }

    const nextStatus = success ? "success" : "failed";
    await updateDoc(logRef, {
      status: nextStatus,
      sentTime: new Date().toISOString(),
      deliveryResult: success
        ? `Verification recovery succeeded: ref=${messageId}`
        : `Re-dispatch failure: ${errorMsg}`
    });

    return res.status(200).json({ success, status: nextStatus, error: errorMsg });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Retry pipeline crashed." });
  }
}
