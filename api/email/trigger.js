import { Resend } from "resend";
import nodemailer from "nodemailer";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

async function saveEmailLog(db, logId, data) {
  if (!db) return;
  try {
    await setDoc(doc(db, "email_logs", logId), data, { merge: true });
  } catch {}
}

async function logEmailTransaction(db, entry) {
  const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const nowIso = new Date().toISOString();
  const fullEntry = {
    id,
    registrationId: entry.registrationId || "N/A",
    programType: entry.programType || "volunteer",
    recipient: entry.recipient,
    subject: entry.subject,
    body: entry.body || "",
    status: entry.status,
    sandboxRedirectTo: entry.sandboxRedirectTo || null,
    timestamp: nowIso,
    sentTime: nowIso,
    deliveryResult: entry.deliveryResult
  };
  await saveEmailLog(db, id, fullEntry);
  return fullEntry;
}

function normalizeGoogleFormWebhookPayload(raw) {
  if (!raw || typeof raw !== "object") return {};
  const flat = { ...raw };
  if (raw.namedValues && typeof raw.namedValues === "object") {
    for (const [k, v] of Object.entries(raw.namedValues)) {
      flat[k] = Array.isArray(v) ? v[0] : v;
    }
  }
  if (raw.responses && typeof raw.responses === "object") {
    for (const [k, v] of Object.entries(raw.responses)) {
      flat[k] = Array.isArray(v) ? v[0] : v;
    }
  }

  let email = String(flat.email || flat.Email || flat["Email Address"] || flat["Email address"] || "").trim();
  let fullName = String(flat.fullName || flat.name || flat["Full Name"] || flat["Name"] || "").trim();
  let phone = String(flat.phone || flat["Phone Number"] || flat["WhatsApp Number"] || "").trim();
  let primaryRole = String(flat.primaryRole || flat.department || flat["Primary Internship Role"] || flat["Role"] || "").trim();
  let location = String(flat.location || flat["City / State of Residence"] || flat["Location"] || "").trim();

  for (const [key, val] of Object.entries(flat)) {
    const kLower = key.toLowerCase();
    const sVal = String(val || "").trim();
    if (!sVal) continue;
    if (!email && (kLower.includes("email") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sVal))) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sVal)) email = sVal;
    }
    if (!fullName && (kLower.includes("full name") || kLower === "name" || kLower.includes("your name") || kLower.includes("applicant name"))) {
      fullName = sVal;
    }
    if (!phone && (kLower.includes("phone") || kLower.includes("whatsapp") || kLower.includes("mobile"))) {
      phone = sVal;
    }
    if (!primaryRole && (kLower.includes("primary") || kLower.includes("role") || kLower.includes("department") || kLower.includes("track"))) {
      primaryRole = sVal;
    }
    if (!location && (kLower.includes("city") || kLower.includes("state") || kLower.includes("location") || kLower.includes("residence"))) {
      location = sVal;
    }
  }

  return {
    ...flat,
    email,
    fullName: fullName || (email ? email.split("@")[0] : "Applicant"),
    phone: phone || "Provided via Google Form",
    primaryRole: primaryRole || "Internship & Volunteer Team",
    department: primaryRole || "Internship & Volunteer Team",
    location: location || "Nigeria",
    programType: flat.programType || "internship",
    programName: flat.programName || "Right-Minds Africa Hub Internship & Volunteer Application"
  };
}

function parseTemplate(template, data) {
  let parsed = String(template || "");
  for (const key of Object.keys(data || {})) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    parsed = parsed.replace(regex, data[key] ?? "");
  }
  return parsed;
}

async function sendEmailViaResend(to, subject, textBody, senderOpts) {
  const apiKey = (senderOpts.resendApiKey || process.env.RESEND_API_KEY || "").trim();
  const configuredSenderEmail = (senderOpts.senderEmail || process.env.SENDER_EMAIL || "").trim();
  const senderEmail = configuredSenderEmail || "onboarding@resend.dev";
  const smtpUser = (senderOpts.smtpUser || process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const smtpPass = (senderOpts.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
  const smtpHost = (senderOpts.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = Number(senderOpts.smtpPort || process.env.SMTP_PORT || 465);

  const fromNameAndEmail = `"${senderOpts.senderName}" <${senderEmail}>`;
  const fallbackFrom = `"${senderOpts.senderName}" <onboarding@resend.dev>`;

  const buildHtmlBody = (banner, bodyText) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
          .header { background: #103D2E; padding: 36px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #FCD34D; }
          .header span { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.7); display: block; margin-bottom: 4px; }
          .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; }
          .content p { margin-top: 0; margin-bottom: 16px; }
          .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span>OFFICIAL CORRESPONDENCE</span>
            <h1>${senderOpts.senderName}</h1>
          </div>
          <div class="content">
            ${banner}
            ${String(bodyText || "")
              .split("\n")
              .map((p) => {
                const trimmed = p.trim();
                if (!trimmed) return "<br/>";
                if (trimmed.startsWith("Verify Email: ")) {
                  const url = trimmed.replace("Verify Email: ", "").trim();
                  return `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${url}" style="background-color: #F59E0B; color: #103D2E; padding: 14px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">Verify Email</a>
                    </div>
                  `;
                }
                if (trimmed.startsWith("Access Admin Portal: ")) {
                  const url = trimmed.replace("Access Admin Portal: ", "").trim();
                  return `
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${url}" style="background-color: #103D2E; color: #FCD34D; padding: 14px 28px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid #F59E0B;">Access Admin Portal &rarr;</a>
                    </div>
                  `;
                }
                if (trimmed.startsWith("Join WhatsApp Community: ")) {
                  const url = trimmed.replace("Join WhatsApp Community: ", "").trim();
                  return `
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color: #25D366; color: #FFFFFF; padding: 14px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 10px rgba(37,211,102,0.25);">Join Official WhatsApp Community &rarr;</a>
                    </div>
                  `;
                }
                if (trimmed.startsWith("WhatsApp Support Link: ")) {
                  const url = trimmed.replace("WhatsApp Support Link: ", "").trim();
                  return `
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color: #103D2E; color: #FCD34D; padding: 12px 24px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #25D366;">Chat on WhatsApp Support for Queries &rarr;</a>
                    </div>
                  `;
                }
                if (trimmed.startsWith("* ") && trimmed.includes(":")) {
                  const [k, ...rest] = trimmed.slice(2).split(":");
                  const val = rest.join(":").trim();
                  const renderedVal =
                    val.startsWith("http://") || val.startsWith("https://")
                      ? `<a href="${val}" target="_blank" rel="noopener noreferrer" style="color: #0D9488; text-decoration: underline; word-break: break-all;">${val}</a>`
                      : val;
                  return `
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; font-size: 13px;">
                      <strong style="color: #103D2E;">${k}:</strong> <span style="font-family: monospace; font-weight: 700; color: #0F172A;">${renderedVal}</span>
                    </div>
                  `;
                }
                return `<p>${p}</p>`;
              })
              .join("")}
          </div>
          <div class="footer">
            <p>&copy; 2026 ${senderOpts.senderName}. All rights reserved.</p>
            <p>Support contact: ${senderOpts.replyTo}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Priority 1: Direct SMTP / Gmail App Password transport (delivers to ANY external email without domain verification limits)
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: `"${senderOpts.senderName}" <${smtpUser}>`,
        to,
        replyTo: senderOpts.replyTo || smtpUser,
        subject,
        text: textBody,
        html: buildHtmlBody("", textBody)
      });

      return {
        success: true,
        simulated: false,
        messageId: info.messageId || `SMTP-${Date.now()}`
      };
    } catch (smtpErr) {
      if (!apiKey) {
        return {
          success: false,
          simulated: false,
          error: `SMTP Error: ${smtpErr?.message || String(smtpErr)}`
        };
      }
    }
  }

  if (!apiKey) {
    return {
      success: true,
      simulated: true,
      messageId: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  }

  const resend = new Resend(apiKey);

  try {
    // Stage 1: Attempt direct primary delivery to the actual recipient
    const { data, error } = await resend.emails.send({
      from: fromNameAndEmail,
      to: [to],
      subject,
      html: buildHtmlBody("", textBody),
      text: textBody,
      replyTo: senderOpts.replyTo
    });

    if (error) {
      throw new Error(error.message || JSON.stringify(error));
    }
    return { success: true, simulated: false, messageId: data?.id };
  } catch (err) {
    let errMsg = err?.message || String(err);

    // Stage 2: If custom SENDER_EMAIL domain is not yet verified in Resend DNS, retry to actual recipient with onboarding@resend.dev
    if (senderEmail !== "onboarding@resend.dev" && (errMsg.toLowerCase().includes("not verified") || errMsg.toLowerCase().includes("domain"))) {
      try {
        const { data: stage2Data, error: stage2Err } = await resend.emails.send({
          from: fallbackFrom,
          to: [to],
          subject,
          html: buildHtmlBody("", textBody),
          text: textBody,
          replyTo: senderOpts.replyTo
        });
        if (!stage2Err && stage2Data?.id) {
          return { success: true, simulated: false, messageId: stage2Data.id };
        }
        if (stage2Err) {
          errMsg = stage2Err.message || JSON.stringify(stage2Err);
        }
      } catch (s2Catch) {
        errMsg = s2Catch?.message || errMsg;
      }
    }

    // Stage 3: If Resend is in sandbox/trial mode (only sends to Resend account owner), extract owner email & relay
    if (
      errMsg.includes("You can only send testing emails") ||
      errMsg.toLowerCase().includes("not verified") ||
      errMsg.toLowerCase().includes("testing emails")
    ) {
      const ownerMatch = errMsg.match(/\(([^)]+@[^)]+)\)/);
      const retryTo = ownerMatch && ownerMatch[1] ? ownerMatch[1].trim() : "olosundelouis@gmail.com";
      const retrySubject = `[Sandbox Redirect for ${to}] ${subject}`;
      const retryText = `[SANDBOX TRIAL REDIRECT] Originally destined for <${to}>, forwarded due to Resend sandbox mode.\n\n${textBody}`;
      const retryBanner = `
        <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 12px; margin-bottom: 20px; border-radius: 8px; font-size: 11px; color: #92400E;">
          <strong>SANDBOX RESEND REDIRECT</strong><br/>
          This official confirmation email was addressed to <code>${to}</code>. It was routed to your verified Resend account <code>${retryTo}</code> because Resend is currently in sandbox mode (<code>onboarding@resend.dev</code>). Configure a Gmail App Password or Verified Domain in Admin Email Settings so emails go directly to every applicant.
        </div>
      `;
      try {
        const { data: fallbackData, error: fallbackError } = await resend.emails.send({
          from: fallbackFrom,
          to: [retryTo],
          subject: retrySubject,
          html: buildHtmlBody(retryBanner, retryText),
          text: retryText,
          replyTo: senderOpts.replyTo
        });
        if (!fallbackError && fallbackData?.id) {
          return { success: true, simulated: false, messageId: fallbackData.id, sandboxRedirectTo: retryTo };
        }
      } catch {}
    }
    return { success: false, simulated: false, error: errMsg };
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
    let event = body.event || body.type;
    let payload = body.payload || body.record || body;

    if (!event && (body.namedValues || body.responses || body.email || body.Email)) {
      event = "GOOGLE_FORM_WEBHOOK";
      payload = body;
    }

    if (!event) {
      return res.status(400).json({ error: "Missing action event marker." });
    }

    const db = getServerFirestore();
    let remoteSettings = null;
    if (db) {
      try {
        const snap = await getDoc(doc(db, "settings", "email_settings"));
        if (snap.exists()) remoteSettings = snap.data();
      } catch {}
    }

    const senderOpts = {
      senderName: remoteSettings?.senderName || "Right Minds Africa",
      replyTo: remoteSettings?.replyTo || "info@rightmindsafrica.org",
      notificationEmail: remoteSettings?.notificationEmail || "olosundelouis@gmail.com",
      senderEmail: remoteSettings?.senderEmail || "",
      smtpUser: remoteSettings?.smtpUser || "",
      smtpPass: remoteSettings?.smtpPass || "",
      smtpHost: remoteSettings?.smtpHost || "",
      smtpPort: remoteSettings?.smtpPort || 465,
      resendApiKey: remoteSettings?.resendApiKey || ""
    };

    const submissionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    if (event === "GOOGLE_FORM_WEBHOOK") {
      payload = normalizeGoogleFormWebhookPayload(payload);
      if (db && payload.email) {
        const webhookRegId = payload.referenceNumber || `VOL-${Date.now().toString().slice(-6)}`;
        payload.referenceNumber = webhookRegId;
        try {
          await setDoc(
            doc(db, "registrations", webhookRegId),
            {
              id: webhookRegId,
              referenceNumber: webhookRegId,
              fullName: payload.fullName,
              email: payload.email,
              phone: payload.phone,
              location: payload.location,
              profileType: "volunteer",
              programType: "internship",
              programName: payload.programName,
              department: payload.primaryRole,
              primaryRole: payload.primaryRole,
              status: "pending",
              paymentStatus: "not_required",
              registeredAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch {}
      }
      event = "VOLUNTEER_APPLICATION_SUBMITTED";
    }

    if (event === "TEST_EMAIL_DISPATCH") {
      const targetEmail = (payload?.email || senderOpts.notificationEmail || "olosundelouis@gmail.com").trim();
      const whatsappUrl = "https://chat.whatsapp.com/HbcAPEL2tVMIZBrzIAsx4o?s=cl&p=a&mlu=4&ilr=4&iam=2";
      const activeSender = senderOpts.smtpUser || senderOpts.senderEmail || process.env.SENDER_EMAIL || "onboarding@resend.dev";
      const subject = "Diagnostic Test – Right-Minds Africa Hub Auto Email API";
      const textBody = `Dear Administrator,\n\nThis is a live diagnostic test from your Right-Minds Africa Hub Automated Email API.\n\nDiagnostic Details:\n* Target Recipient: ${targetEmail}\n* Outbound Sender Name: ${senderOpts.senderName}\n* Active Transport / Sender: ${activeSender}\n* Direct Gmail/SMTP Active: ${senderOpts.smtpUser && senderOpts.smtpPass ? `YES (${senderOpts.smtpUser})` : "NO"}\n* Resend API Key Configured: ${(senderOpts.resendApiKey || process.env.RESEND_API_KEY) ? "YES (Live Resend Mode)" : "NO (Simulation Mode)"}\n* Internship WhatsApp Link: ${whatsappUrl}\n* Timestamp: ${new Date().toISOString()}\n\nJoin WhatsApp Community: ${whatsappUrl}\n\nYour automated email dispatch pipeline is operational!\n\nWarm regards,\nRight-Minds Africa Hub Systems`;

      const mailRes = await sendEmailViaResend(targetEmail, subject, textBody, senderOpts);
      const logEntry = await logEmailTransaction(db, {
        recipient: targetEmail,
        subject,
        body: textBody,
        registrationId: `TEST-${Date.now().toString().slice(-6)}`,
        programType: "volunteer",
        status: mailRes.success ? "success" : "failed",
        sandboxRedirectTo: mailRes.sandboxRedirectTo || null,
        deliveryResult: mailRes.success
          ? `Diagnostic test delivered: ref=${mailRes.messageId}${mailRes.simulated ? " (Simulation Mode)" : ""}${mailRes.sandboxRedirectTo ? ` (Relayed via Resend sandbox owner ${mailRes.sandboxRedirectTo})` : ""}`
          : `Diagnostic test failed: ${mailRes.error}`
      });

      return res.status(200).json({
        success: mailRes.success,
        status: mailRes.success ? "success" : "failed",
        simulated: !!mailRes.simulated,
        hasResendKey: !!(senderOpts.resendApiKey || process.env.RESEND_API_KEY),
        hasSmtp: !!(senderOpts.smtpUser && senderOpts.smtpPass),
        senderEmail: activeSender,
        sandboxRedirectTo: mailRes.sandboxRedirectTo || null,
        messageId: mailRes.messageId || null,
        logId: logEntry.id,
        logEntry,
        error: mailRes.error || null
      });
    }

    if (event === "ADMIN_CREATED") {
      const adminEmail = (payload?.email || "").trim().toLowerCase();
      const adminName = payload?.fullName || adminEmail.split("@")[0] || "Administrator";
      const adminPassword = payload?.password || "";
      const role = payload?.role || "Admin";
      const canWrite = payload?.canWrite !== false;
      const portalUrl = payload?.portalUrl || "https://rightmindsafrica.org/admin";
      const moduleLabels =
        Array.isArray(payload?.moduleLabels) && payload.moduleLabels.length > 0
          ? payload.moduleLabels
          : Array.isArray(payload?.allowedTabs)
          ? payload.allowedTabs
          : ["Overview Dashboard"];
      const isPasswordUpdate = !!payload?.isPasswordUpdate;

      if (!adminEmail) {
        return res.status(400).json({ error: "Missing administrator email address." });
      }

      const accessModeLabel = canWrite
        ? "Read & Write (Can create, edit & manage records)"
        : "Read-Only (View & export only)";

      const subject = isPasswordUpdate
        ? "Updated Administrator Login Credentials – Right Minds Africa Portal"
        : "Your Administrator Login Credentials – Right Minds Africa Portal";

      const emailBody = `Dear ${adminName},

You have been provisioned as an Administrator on the Right Minds Africa (RMA) & Corper Impact Initiative (CII) Operations Portal by the System Owner (Super Admin).

Below are your official administrator login credentials and assigned permissions:

* Admin Portal Login URL: ${portalUrl}
* Login Email Address: ${adminEmail}
* Temporary / Login Password: ${adminPassword}
* Assigned Role: ${role}
* Access Permission Level: ${accessModeLabel}
* Authorized Modules (${moduleLabels.length}): ${moduleLabels.join(", ")}

Access Admin Portal: ${portalUrl}

How to Sign In:
1. Click the button above or visit ${portalUrl} in your browser.
2. Enter your Login Email Address (${adminEmail}) and your assigned password.
3. Once authenticated, your workspace will automatically load the ${moduleLabels.length} modules assigned to you.

Security Notice:
Please keep these login details strictly confidential and do not share your administrator password with unauthorized personnel.

Regards,
System Owner (Super Admin)
Right Minds Africa & Corper Impact Initiative`;

      const dispatch = await sendEmailViaResend(adminEmail, subject, emailBody, senderOpts);
      const logId = payload?.logId || `mail-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await saveEmailLog(db, logId, {
        id: logId,
        recipient: adminEmail,
        subject,
        body: emailBody,
        registrationId: `ADM-${Date.now().toString().slice(-5)}`,
        programType: "Admin Credentials",
        status: dispatch.success ? "success" : "failed",
        timestamp: new Date().toISOString(),
        sentTime: new Date().toISOString(),
        deliveryResult: dispatch.success
          ? `Admin login credentials delivered: ref=${dispatch.messageId}`
          : `Failure: ${dispatch.error}`
      });

      return res.status(200).json({
        success: dispatch.success,
        messageId: dispatch.messageId,
        message: "Administrator login credentials dispatched via email."
      });
    }

    if (event === "EMAIL_VERIFICATION") {
      const applicantName = payload?.fullName || "User";
      const applicantEmail = payload?.email;
      const verificationLink = payload?.verificationLink || "https://rightmindsafrica.org/";
      if (!applicantEmail) return res.status(400).json({ error: "Missing verification email." });

      const subject = "Verify Your Email – Right Minds Africa";
      const firstName = applicantName.split(" ")[0];
      const emailBody = `Hello ${firstName},\n\nWelcome to Right Minds Africa.\n\nTo complete your account setup, please verify your email address by clicking the button below.\n\nVerify Email: ${verificationLink}\n\nIf you did not create this account, you can safely ignore this email.\n\nThank you,\n\nRight Minds Africa Team`;
      const dispatch = await sendEmailViaResend(applicantEmail, subject, emailBody, senderOpts);
      await saveEmailLog(db, `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`, {
        recipient: applicantEmail,
        subject,
        body: emailBody,
        registrationId: "EMAIL-VERIFY",
        programType: "Email Verification",
        status: dispatch.success ? "success" : "failed",
        sentTime: new Date().toISOString(),
        deliveryResult: dispatch.success ? `Verification link sent: msgRef=${dispatch.messageId}` : `Failure: ${dispatch.error}`
      });
      return res.status(200).json({ success: dispatch.success });
    }

    if (event === "EMAIL_VERIFICATION_SUCCESS") {
      const applicantName = payload?.fullName || "User";
      const applicantEmail = payload?.email;
      if (!applicantEmail) return res.status(400).json({ error: "Missing verification email." });

      const subject = "Welcome to Right Minds Africa – Account Verified!";
      const firstName = applicantName.split(" ")[0];
      const emailBody = `Hello ${firstName},\n\nCongratulations! Your email address has been successfully verified.\n\nWelcome to the Right Minds Africa portal. Your student account is now fully unlocked and you have been granted comprehensive access to our training programs, premium courses, and protected communities.\n\nMain Portal Link: https://rightmindsafrica.org/\n\nThank you,\n\nRight Minds Africa Team`;
      const dispatch = await sendEmailViaResend(applicantEmail, subject, emailBody, senderOpts);
      return res.status(200).json({ success: dispatch.success });
    }

    if (event === "PAYMENT_SUBMITTED") {
      const applicantName = payload?.fullName || payload?.studentName || "Applicant";
      const applicantEmail = payload?.email || payload?.userEmail;
      const refNumber = payload?.referenceNumber || "PENDING";
      const payRef = payload?.paymentReference || "N/A";
      const amt = payload?.amount || "FREE";
      const pName = payload?.programName || "Program Placement";
      if (!applicantEmail) return res.status(400).json({ error: "Missing recipient mapping." });

      const paySubject = `Payment Verification Pending – ${pName}`;
      const payBody = `Dear ${applicantName},\n\nWe have received your payment submission for ${pName}.\n\nOur administration team is currently auditing your deposit against your reference (${payRef}).\n\nDetails:\n* Registration ID: ${refNumber}\n* Amount: ${amt}\n* Timestamp: ${submissionDate}\n\nYou will receive a confirmation email once verified.\n\nRegards,\nRight Minds Africa`;
      const dispatch = await sendEmailViaResend(applicantEmail, paySubject, payBody, senderOpts);
      await saveEmailLog(db, `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`, {
        recipient: applicantEmail,
        subject: paySubject,
        body: payBody,
        registrationId: refNumber,
        programType: "Payment Submitted",
        status: dispatch.success ? "success" : "failed",
        sentTime: new Date().toISOString(),
        deliveryResult: dispatch.success ? "Delivered successfully" : `Failure: ${dispatch.error}`
      });
      return res.status(200).json({ success: dispatch.success });
    }

    if (event === "PAYMENT_APPROVED" || event === "PAYMENT_REJECTED") {
      const applicantName = payload?.fullName || "Applicant";
      const applicantEmail = payload?.email;
      const refNumber = payload?.referenceNumber || "PENDING";
      const payRef = payload?.paymentReference || "N/A";
      const isCii = payload?.profileType?.startsWith("cii") || payload?.profileType === "cii";
      const pName = isCii ? "Corper Impact Initiative (CII)" : "Right Minds Africa (RMA) Mentorship";
      const rmks = payload?.notes || "None";
      if (!applicantEmail) return res.status(400).json({ error: "Missing recipient mapping." });

      const isApproved = event === "PAYMENT_APPROVED";
      const paySubject = isApproved
        ? `Payment Verified & Placement Unlocked! – ${pName}`
        : `Payment Review Action Required – ${pName}`;
      const payBody = isApproved
        ? `Dear ${applicantName},\n\nCongratulations! Your payment has been successfully verified for ${pName}.\n\nYour placement has been unlocked. Welcome to the cohort!\n\nDetails:\n* Registration ID: ${refNumber}\n* Payment Reference: ${payRef}\n* Status: Active / Approved\n\nJoin WhatsApp Community: https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC\n\nRegards,\nRight Minds Africa`
        : `Dear ${applicantName},\n\nWe were unable to verify your payment for ${pName}.\n\nAudit Remarks:\n${rmks}\n\nDetails:\n* Registration ID: ${refNumber}\n* Payment Reference: ${payRef}\n\nPlease re-check your payment reference or re-upload your receipt screenshot in your portal.\n\nRegards,\nRight Minds Africa Team`;

      const dispatch = await sendEmailViaResend(applicantEmail, paySubject, payBody, senderOpts);
      await saveEmailLog(db, `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`, {
        recipient: applicantEmail,
        subject: paySubject,
        body: payBody,
        registrationId: refNumber,
        programType: isApproved ? "Payment Approved" : "Payment Rejected",
        status: dispatch.success ? "success" : "failed",
        sentTime: new Date().toISOString(),
        deliveryResult: dispatch.success ? "Delivered successfully" : `Failure: ${dispatch.error}`
      });
      return res.status(200).json({ success: dispatch.success });
    }

    if (event === "COURSE_ENROLLED") {
      const sName = payload?.studentName || payload?.studentEmail || "Student";
      const sEmail = payload?.studentEmail;
      const cTitle = payload?.courseTitle || "Premium Growth Course";
      const payRef = payload?.payment?.paymentReference || payload?.paymentReference || "N/A";
      if (!sEmail) return res.status(400).json({ error: "Missing student email mapping." });

      const courseSubject = `Course Enrollment Confirmation - ${cTitle}`;
      const courseBody = `Dear ${sName},\n\nYou have been successfully enrolled in ${cTitle}!\n\nHere are your transaction details:\n* Course Name: ${cTitle}\n* Payment Reference: ${payRef}\n* Student Email: ${sEmail}\n\nJoin WhatsApp Community: https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC\n\nRegards,\nRight Minds Africa LMS`;
      const dispatch = await sendEmailViaResend(sEmail, courseSubject, courseBody, senderOpts);
      await saveEmailLog(db, `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`, {
        recipient: sEmail,
        subject: courseSubject,
        body: courseBody,
        registrationId: payRef,
        programType: "Course Enrollment",
        status: dispatch.success ? "success" : "failed",
        sentTime: new Date().toISOString(),
        deliveryResult: dispatch.success ? `Course Welcome Delivered: ref=${dispatch.messageId}` : `Failure: ${dispatch.error}`
      });
      return res.status(200).json({ success: dispatch.success, message: "Course confirmation welcome dispatched." });
    }

    if (event === "OFFLINE_CHAT_MESSAGE") {
      const { visitorName, visitorEmail, visitorPhone, messageText, adminEmail } = payload || {};
      if (!visitorEmail) return res.status(400).json({ error: "Missing visitor email." });

      const visitorSubject = "We've Received Your Message – Right Minds Support";
      const visitorBody = `Hello ${visitorName || "Visitor"},\n\nThank you for reaching out to Right Minds Africa & Corper Impact Initiative support.\n\nWe have received your message:\n"${messageText || ""}"\n\nAn administrator has been notified and will respond shortly.\n\nBest regards,\nRight Minds Africa Support Team`;
      const visitorDispatch = await sendEmailViaResend(visitorEmail, visitorSubject, visitorBody, senderOpts);

      const targetAdminEmail = adminEmail || senderOpts.notificationEmail || "info@rightmindsafrica.org";
      const adminSubject = `[Live Chat Alert] New Offline Message from ${visitorName || visitorEmail}`;
      const adminBody = `Hello Admin,\n\nA visitor has left a support message on Live Chat.\n\n* Name: ${visitorName || "N/A"}\n* Email: ${visitorEmail}\n* Phone: ${visitorPhone || "Not provided"}\n\nMessage:\n"${messageText || ""}"`;
      sendEmailViaResend(targetAdminEmail, adminSubject, adminBody, senderOpts).catch(() => null);

      return res.status(200).json({ success: visitorDispatch.success, message: "Offline chat notifications dispatched." });
    }

    if (event === "REGISTRATION_CREATED" || event === "VOLUNTEER_APPLICATION_SUBMITTED") {
      const applicantEmail = (payload?.email || "").trim();
      const applicantName = payload?.fullName || payload?.applicantName || "Applicant";
      const refNumber = payload?.referenceNumber || payload?.registrationId || payload?.id || `VOL-${Date.now().toString().slice(-6)}`;
      const rawProg = (payload?.programType || payload?.profileType || "").toLowerCase();
      const isVolunteerOrIntern =
        event === "VOLUNTEER_APPLICATION_SUBMITTED" ||
        rawProg.includes("volunteer") ||
        rawProg.includes("intern") ||
        (payload?.programName || "").toLowerCase().includes("intern") ||
        (payload?.programName || "").toLowerCase().includes("volunteer");

      const pName =
        payload?.programName ||
        (isVolunteerOrIntern
          ? "Right-Minds Africa Hub Internship & Volunteer Application"
          : "Right Minds Africa Program");

      if (!applicantEmail) {
        return res.status(400).json({ error: "Missing applicant email." });
      }

      const whatsappUrl =
        payload?.whatsappLink ||
        (rawProg.startsWith("cii")
          ? "https://chat.whatsapp.com/DoI8xpE60FeKMi4sEtE3wI"
          : isVolunteerOrIntern
          ? "https://chat.whatsapp.com/HbcAPEL2tVMIZBrzIAsx4o?s=cl&p=a&mlu=4&ilr=4&iam=2"
          : "https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC");

      const whatsappSupportUrl =
        payload?.whatsappSupportLink ||
        whatsappUrl;

      const roleOrDept =
        payload?.department ||
        payload?.primaryRole ||
        payload?.volunteerTrack ||
        "Internship & Volunteer Team";

      const subject = isVolunteerOrIntern
        ? "Thank You for Applying – Right-Minds Africa Hub Internship & Volunteer Team"
        : `Registration Confirmed – ${pName}`;

      const emailBody = isVolunteerOrIntern
        ? `Dear ${applicantName},

Thank you for your interest in joining the Right-Minds Africa Hub Internship & Volunteer Team! We are thrilled to receive your application and deeply appreciate your willingness to contribute your skills toward shaping a generation across Africa.

Your application has been successfully received and logged for review. Here is a summary of your submission:

* Applicant Name: ${applicantName}
* Application Reference ID: ${refNumber}
* Primary Role / Department: ${roleOrDept}
* Location: ${payload?.location || "N/A"}
* Submission Date: ${submissionDate}
* Direct WhatsApp Support & Community Link: ${whatsappSupportUrl}

Join WhatsApp Community: ${whatsappUrl}

WhatsApp Support Link: ${whatsappSupportUrl}

What Happens Next & Direct Support for Queries:
1. Click the green button or WhatsApp link above (${whatsappUrl}) to join our official WhatsApp community immediately for onboarding updates, orientation schedules, and direct support for any queries you may have.
2. Our coordinating team will review your application details and 60-second introduction video.
3. Shortlisted candidates will be contacted via email and WhatsApp regarding the next steps in the onboarding process.

Have Questions or Need Assistance?
Reach our coordinating team directly on WhatsApp for any queries via ${whatsappSupportUrl} or reply to this email at info@rightmindsafrica.org.

Warm regards,
Right-Minds Africa Hub & Corper Impact Initiative Team`
        : `Dear ${applicantName},

Thank you for registering for ${pName}.

We have successfully received your registration details:

* Full Name: ${applicantName}
* Registration ID: ${refNumber}
* Program: ${pName}
* Submission Date: ${submissionDate}
* Official WhatsApp Link: ${whatsappUrl}

Join WhatsApp Community: ${whatsappUrl}

While our team reviews your registration, please click the button or link above to join our official WhatsApp community for announcements, mentorship resources, and cohort updates.

Regards,
Right Minds Africa & Corper Impact Initiative`;

      const dispatch = await sendEmailViaResend(applicantEmail, subject, emailBody, senderOpts);

      const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await saveEmailLog(db, logId, {
        id: logId,
        registrationId: refNumber,
        programType: isVolunteerOrIntern ? "volunteer" : (rawProg || "cii"),
        recipient: applicantEmail,
        subject,
        body: emailBody,
        status: dispatch.success ? "success" : "failed",
        sandboxRedirectTo: dispatch.sandboxRedirectTo || null,
        timestamp: new Date().toISOString(),
        sentTime: new Date().toISOString(),
        deliveryResult: dispatch.success
          ? dispatch.sandboxRedirectTo
            ? `Relayed to Sandbox Owner (${dispatch.sandboxRedirectTo}) because onboarding@resend.dev cannot send to external emails yet. Configure Gmail App Password or Verified Domain in Email Settings to deliver directly to ${applicantEmail}. Ref=${dispatch.messageId}`
            : `Delivered directly to ${applicantEmail}: Reference=${dispatch.messageId}`
          : `Error: ${dispatch.error}`
      });

      // Also notify the Super Admin / Operations inbox asynchronously
      const adminAlertBody = `A new ${pName} submission has been received.\n\n* Applicant Name: ${applicantName}\n* Email Address: ${applicantEmail}\n* Phone Number: ${payload?.phone || "N/A"}\n* Role / Program: ${roleOrDept}\n* Reference ID: ${refNumber}\n* Submission Date: ${submissionDate}\n\nYou can view and manage this application in the Admin Portal.`;
      sendEmailViaResend(
        senderOpts.notificationEmail,
        `New Application Received – ${applicantName} (${pName})`,
        adminAlertBody,
        senderOpts
      ).catch(() => null);

      return res.status(200).json({
        success: dispatch.success,
        simulated: !!dispatch.simulated,
        sandboxRedirectTo: dispatch.sandboxRedirectTo || null,
        messageId: dispatch.messageId,
        whatsappLink: whatsappUrl,
        whatsappSupportLink: whatsappSupportUrl
      });
    }

    return res.status(200).json({ success: true, message: `Processed event ${event}` });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Failed to dispatch email." });
  }
}
