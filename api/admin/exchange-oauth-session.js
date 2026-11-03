import crypto from "crypto";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, doc, getDoc } from "firebase/firestore";

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

const ANCHOR_SUPER_ADMINS = new Set([
  "olosundelouis@gmail.com"
]);

const ADMIN_TOKEN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_TOKEN_SECRET ||
  crypto.createHash("sha256").update("rma-hub-sovereign-hmac-key-2026").digest("hex");

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function signAdminSessionToken(email, role, allowedTabs, canWrite) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ email, role, allowedTabs, canWrite, expiresAt })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, expiresAt };
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
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!rawEmail) {
      return res.status(400).json({ error: "Missing administrator email." });
    }

    let resolvedRole = null;
    let allowedTabs = undefined;
    let canWrite = undefined;

    if (ANCHOR_SUPER_ADMINS.has(rawEmail)) {
      resolvedRole = "Super Admin";
      canWrite = true;
    } else {
      const db = getServerFirestore();
      if (db) {
        try {
          const snap = await getDoc(doc(db, "admins", rawEmail));
          if (snap.exists() && snap.data()?.role) {
            const data = snap.data();
            if (data.status === "Suspended") {
              return res.status(403).json({
                error: "Your administrator account has been suspended by the Super Admin."
              });
            }
            if (data.passwordHash || data.passwordDigest) {
              resolvedRole = data.role;
              allowedTabs = Array.isArray(data.allowedTabs) ? data.allowedTabs : undefined;
              canWrite = typeof data.canWrite === "boolean" ? data.canWrite : true;
            }
          }
        } catch {}
      }
    }

    if (!resolvedRole || resolvedRole === "Public User") {
      return res.status(403).json({
        error: `Access Denied: The email "${rawEmail}" has not been created by the Super Admin. No unauthorized email is allowed to log in.`
      });
    }

    const { token, expiresAt } = signAdminSessionToken(rawEmail, resolvedRole, allowedTabs, canWrite);
    return res.status(200).json({
      success: true,
      email: rawEmail,
      role: resolvedRole,
      allowedTabs,
      canWrite,
      token,
      expiresAt,
      user: {
        username: rawEmail,
        role: resolvedRole,
        allowedTabs,
        canWrite,
        token,
        expiresAt
      }
    });
  } catch {
    return res.status(500).json({ error: "Failed to exchange OAuth session." });
  }
}
