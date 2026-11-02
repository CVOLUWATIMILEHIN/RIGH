async function sendEmailViaResend(to, subject, textBody, senderOpts) {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev";
  const fromNameAndEmail = `"${senderOpts.senderName}" <${senderEmail}>`;

  let finalTo = to;
  let finalSubject = subject;
  let finalTextBody = textBody;
  let redirectBanner = "";

  const isSandboxEmail = senderEmail === "onboarding@resend.dev";
  const isSelf = (to || "").toLowerCase().trim() === "olosundelouis@gmail.com";
  let isRedirected = false;

  if (isSandboxEmail && !isSelf && apiKey) {
    finalTo = "olosundelouis@gmail.com";
    finalSubject = `[Sandbox Redirect for ${to}] ${subject}`;
    finalTextBody = `[SANDBOX TRIAL REDIRECT] Originally destined for <${to}>, but forwarded due to Resend trial limits.\n\n${textBody}`;
    isRedirected = true;
    redirectBanner = `
      <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 12px; margin-bottom: 20px; border-radius: 8px; font-size: 11px; color: #92400E; line-height: 1.4; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <strong>SANDBOX RESEND REDIRECT</strong><br/>
        This official template was originally addressed to <code>${to}</code>. It was redirected to your verified account <code>olosundelouis@gmail.com</code> because the <code>onboarding@resend.dev</code> trial sender is in use.
      </div>
    `;
  }

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
                if (trimmed.startsWith("* ") && trimmed.includes(":")) {
                  const [k, ...rest] = trimmed.slice(2).split(":");
                  const val = rest.join(":").trim();
                  return `
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; font-size: 13px;">
                      <strong style="color: #103D2E;">${k}:</strong> <span style="font-family: monospace; font-weight: 700; color: #0F172A;">${val}</span>
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

  if (!apiKey) {
    return {
      success: true,
      messageId: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromNameAndEmail,
        to: [finalTo],
        subject: finalSubject,
        html: buildHtmlBody(redirectBanner, finalTextBody),
        reply_to: senderOpts.replyTo
      })
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || JSON.stringify(resData));
    }
    return { success: true, messageId: resData.id };
  } catch (err) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("You can only send testing emails") && !isRedirected) {
      const retryTo = "olosundelouis@gmail.com";
      const retrySubject = `[Sandbox Redirect for ${to}] ${subject}`;
      const retryText = `[SANDBOX TRIAL REDIRECT] Originally destined for <${to}>, but forwarded due to Resend trial limits.\n\n${textBody}`;
      const retryBanner = `
        <div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 12px; margin-bottom: 20px; border-radius: 8px; font-size: 11px; color: #92400E;">
          <strong>SANDBOX RESEND REDIRECT</strong><br/>
          This email was destined for <code>${to}</code> but was redirected to <code>olosundelouis@gmail.com</code> due to Resend trial limits.
        </div>
      `;
      try {
        const fallbackResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: fromNameAndEmail,
            to: [retryTo],
            subject: retrySubject,
            html: buildHtmlBody(retryBanner, retryText),
            reply_to: senderOpts.replyTo
          })
        });
        const fallbackResData = await fallbackResponse.json();
        if (fallbackResponse.ok) {
          return { success: true, messageId: fallbackResData.id };
        }
      } catch {}
    }
    return { success: false, error: errMsg };
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
    const { event, payload } = body;
    if (!event) {
      return res.status(400).json({ error: "Missing action event marker." });
    }

    const senderOpts = {
      senderName: "Right Minds Africa",
      replyTo: "info@rightmindsafrica.org",
      notificationEmail: "olosundelouis@gmail.com"
    };

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
      return res.status(200).json({ success: dispatch.success });
    }

    if (event === "REGISTRATION_CREATED") {
      const applicantEmail = payload?.email;
      const applicantName = payload?.fullName || payload?.applicantName || "Applicant";
      const refNumber = payload?.referenceNumber || payload?.registrationId || "PENDING";
      const pName = payload?.programName || "Right Minds Africa Program";
      if (!applicantEmail) return res.status(400).json({ error: "Missing applicant email." });

      const subject = `Registration Confirmed – ${pName}`;
      const emailBody = `Dear ${applicantName},\n\nThank you for registering for ${pName}.\n\n* Full Name: ${applicantName}\n* Registration ID: ${refNumber}\n* Program: ${pName}\n\nRegards,\nRight Minds Africa & Corper Impact Initiative`;
      const dispatch = await sendEmailViaResend(applicantEmail, subject, emailBody, senderOpts);
      return res.status(200).json({ success: dispatch.success });
    }

    return res.status(200).json({ success: true, message: `Processed event ${event}` });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Failed to dispatch email." });
  }
}
