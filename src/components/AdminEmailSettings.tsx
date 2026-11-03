import React, { useState, useEffect } from "react";
import { Mail, User, Save, AlertCircle, FileText, Send, CheckCircle2, KeyRound, Copy, Check, ExternalLink, Code2 } from "lucide-react";
import { getEmailSettings, saveEmailSettings, EmailSettings } from "../lib/db";

interface AdminEmailSettingsProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

type TemplateKey =
  | "ciiWelcome"
  | "rmaWelcome"
  | "volunteerWelcome"
  | "adminNotification"
  | "paymentSubmitted"
  | "paymentApproved"
  | "paymentRejected"
  | "courseEnrollment";

export const AdminEmailSettings: React.FC<AdminEmailSettingsProps> = ({
  hasWriteAccess,
  onLogAction,
}) => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("ciiWelcome");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedWebhookScript, setCopiedWebhookScript] = useState<boolean>(false);
  const [testEmailInput, setTestEmailInput] = useState<string>("olosundelouis@gmail.com");
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    simulated?: boolean;
    hasResendKey?: boolean;
    hasSmtp?: boolean;
    senderEmail?: string;
    sandboxRedirectTo?: string | null;
    messageId?: string | null;
    error?: string | null;
  } | null>(null);

  const googleFormAppsScript = `// Paste into Google Form -> Extensions -> Apps Script, then add Trigger: From form -> On form submit
function onFormSubmit(e) {
  var responses = e && e.namedValues ? e.namedValues : {};
  if (!e && FormApp.getActiveForm()) {
    var items = FormApp.getActiveForm().getResponses();
    if (items.length > 0) {
      var latest = items[items.length - 1].getItemResponses();
      for (var i = 0; i < latest.length; i++) {
        responses[latest[i].getItem().getTitle()] = [latest[i].getResponse()];
      }
    }
  }
  UrlFetchApp.fetch("${typeof window !== "undefined" ? window.location.origin : "https://rightmindsafrica.org"}/api/email/trigger", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      event: "GOOGLE_FORM_WEBHOOK",
      namedValues: responses
    }),
    muteHttpExceptions: true
  });
}`;

  useEffect(() => {
    async function load() {
      try {
        const data = await getEmailSettings();
        setSettings(data);
        if (data?.notificationEmail) {
          setTestEmailInput(data.notificationEmail);
        }
      } catch (err) {
        console.error("Error fetching email settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      if (settings && hasWriteAccess) {
        await saveEmailSettings(settings);
      }
      const res = await fetch("/api/email/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "TEST_EMAIL_DISPATCH",
          payload: { email: testEmailInput.trim() }
        })
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        onLogAction(`✅ [EMAIL TEST] Diagnostic test email dispatched to ${testEmailInput.trim()} (Ref: ${data.messageId || "OK"})`);
      } else {
        onLogAction(`❌ [EMAIL TEST] Diagnostic test failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err?.message || "Failed to connect to /api/email/trigger"
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !hasWriteAccess) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveEmailSettings(settings);
      onLogAction(`📧 [SETTINGS UPDATE] Updated email templates and sender settings for user: ${settings.senderName}`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to commit settings:", err);
      onLogAction(`❌ [SETTINGS ERROR] Failed to save email settings: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EmailSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleTemplateChange = (templateKey: TemplateKey, subField: "Subject" | "Body", value: string) => {
    if (!settings) return;
    const fullKey = `${templateKey}${subField}` as keyof EmailSettings["templates"];
    setSettings({
      ...settings,
      templates: {
        ...settings.templates,
        [fullKey]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-150 text-center animate-pulse">
        <p className="text-xs font-mono text-slate-400">LOADING SENDER PROFILE CONFIGS...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-150 text-center flex flex-col items-center gap-2">
        <AlertCircle className="text-red-500" size={24} />
        <p className="text-xs font-mono text-slate-500">FAILED TO LOAD EMAIL SETTINGS DOCUMENT</p>
      </div>
    );
  }

  const templateMeta: Record<TemplateKey, { name: string; desc: string; vars: string[] }> = {
    ciiWelcome: {
      name: "CII Welcome Confirmation",
      desc: "Sent to applicant instantly upon successfully submitting a Corper Impact Initiative form.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{submissionDate}}", "{{whatsappLink}}"],
    },
    rmaWelcome: {
      name: "RMA Welcome Confirmation",
      desc: "Sent to applicant instantly upon successfully submitting a Right Minds Africa form.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{submissionDate}}", "{{whatsappLink}}"],
    },
    volunteerWelcome: {
      name: "Internship / Volunteer Confirmation",
      desc: "Sent to applicants after filling the Internship / Volunteer application form, including the official WhatsApp group link.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{department}}", "{{stateCode}}", "{{submissionDate}}", "{{whatsappLink}}"],
    },
    adminNotification: {
      name: "Admin Registration Notification",
      desc: "Sent to the principal administrator notifying them of a newly saved registration dossier.",
      vars: ["{{fullName}}", "{{email}}", "{{referenceNumber}}", "{{programName}}", "{{submissionDate}}"],
    },
    paymentSubmitted: {
      name: "Payment Submitted Receipt (Pending audit)",
      desc: "Dispatched when an applicant manual bank transfer screenshot receipt is submitted.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{amount}}", "{{paymentReference}}", "{{submissionDate}}"],
    },
    paymentApproved: {
      name: "Payment Verified & Placement Unlocked",
      desc: "Sent when an administrator audits and approves the applicant deposit placement reference.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{paymentReference}}", "{{submissionDate}}"],
    },
    paymentRejected: {
      name: "Payment Disapproved / Flagged Audit",
      desc: "Sent when deposit verification is disapproved during evaluation. Displays reviewer remarks.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{paymentReference}}", "{{remarks}}", "{{submissionDate}}"],
    },
    courseEnrollment: {
      name: "Course Enrollment welcome credentials",
      desc: "Sent to course purchasers detailing dashboard links and learning portal access keys.",
      vars: ["{{studentName}}", "{{studentEmail}}", "{{courseTitle}}", "{{paymentReference}}", "{{learningPortalLink}}", "{{dashboardLink}}"],
    },
  };

  const selectedMeta = templateMeta[selectedTemplate];
  const subjectKey = `${selectedTemplate}Subject` as keyof EmailSettings["templates"];
  const bodyKey = `${selectedTemplate}Body` as keyof EmailSettings["templates"];

  return (
    <div className="space-y-6 animate-fadeIn" id="email-settings-panel">
      {/* Sender Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4" id="email-configuration-section">
        <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
          <Mail size={16} className="text-[#103D2E]" />
          Email Configuration
        </h3>
        <p className="text-2xs text-slate-400 font-medium">
          Dynamically update the sender name, reply-to address, and internal principal admin notification email address stored in Firestore.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Sender Name */}
          <div className="space-y-1.5 text-left">
            <label className="block text-2xs font-extrabold uppercase text-slate-500 tracking-wider">
              Outbound Sender Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={13} />
              </span>
              <input
                type="text"
                disabled={!hasWriteAccess}
                value={settings.senderName}
                onChange={(e) => handleFieldChange("senderName", e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium transition-all"
                placeholder="e.g. Right Minds Africa"
              />
            </div>
          </div>

          {/* Reply-To Email */}
          <div className="space-y-1.5 text-left">
            <label className="block text-2xs font-extrabold uppercase text-slate-500 tracking-wider">
              Official Reply-To Routing
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={13} />
              </span>
              <input
                type="email"
                disabled={!hasWriteAccess}
                value={settings.replyTo}
                onChange={(e) => handleFieldChange("replyTo", e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium transition-all"
                placeholder="e.g. info@rightmindsafrica.org"
              />
            </div>
          </div>

          {/* Notification Email */}
          <div className="space-y-1.5 text-left">
            <label className="block text-2xs font-extrabold uppercase text-slate-500 tracking-wider">
              Internal Principal Admin Alert
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={13} />
              </span>
              <input
                type="email"
                disabled={!hasWriteAccess}
                value={settings.notificationEmail}
                onChange={(e) => handleFieldChange("notificationEmail", e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium transition-all"
                placeholder="e.g. olosundelouis@gmail.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Direct Delivery Gateway to ALL External Registrant Emails */}
      <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-4 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <KeyRound size={16} className="text-[#103D2E]" />
              Direct Inbox Delivery Gateway (Send to ALL External Registrant Emails)
            </h3>
            <p className="text-2xs text-slate-600 font-medium mt-1 leading-relaxed">
              <strong>Why an external registrant didn&apos;t receive a mail:</strong> Resend&apos;s default <code>onboarding@resend.dev</code> sandbox address blocks sending to external email addresses unless you either (Option A) enter a <strong>Gmail Address + 16-Character Gmail App Password</strong> below (works immediately for all <code>@gmail.com</code>, <code>@yahoo.com</code>, etc. registrants!), or (Option B) enter your verified domain sender address from Resend.
            </p>
          </div>
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#103D2E] hover:bg-[#1b503f] text-amber-300 rounded-xl text-2xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 self-start"
          >
            <span>Get Gmail App Password</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Option A1: Gmail / SMTP User */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider">
              Option A: Official Gmail Address (Recommended)
            </label>
            <input
              type="email"
              disabled={!hasWriteAccess}
              value={settings.smtpUser || ""}
              onChange={(e) => handleFieldChange("smtpUser", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-[#103D2E] rounded-xl text-xs font-medium transition-all"
              placeholder="e.g. rightmindsafrica@gmail.com"
            />
          </div>

          {/* Option A2: Gmail 16-Char App Password */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider">
              Gmail 16-Char App Password
            </label>
            <input
              type="password"
              disabled={!hasWriteAccess}
              value={settings.smtpPass || ""}
              onChange={(e) => handleFieldChange("smtpPass", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-[#103D2E] rounded-xl text-xs font-mono transition-all"
              placeholder="xxxx xxxx xxxx xxxx"
            />
          </div>

          {/* Option B: Verified Resend Custom Domain Sender */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider">
              Option B: Verified Domain Sender (Resend)
            </label>
            <input
              type="email"
              disabled={!hasWriteAccess}
              value={settings.senderEmail || ""}
              onChange={(e) => handleFieldChange("senderEmail", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-[#103D2E] rounded-xl text-xs font-medium transition-all"
              placeholder="e.g. info@rightmindsafrica.org"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-slate-600">
            Click <strong>Save Settings &amp; Templates</strong> after entering your Gmail App Password or Verified Domain Sender, then test with any external email below.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasWriteAccess}
            className="px-4 py-2 bg-[#103D2E] hover:bg-[#1b503f] disabled:bg-slate-300 text-amber-300 rounded-xl text-2xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={12} />
            <span>{saving ? "Saving..." : "Save Gateway Settings Now"}</span>
          </button>
        </div>
      </div>

      {/* Google Form Automatic Webhook Script Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-3 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Code2 size={16} className="text-[#103D2E]" />
              Google Form Automatic Email Webhook (Optional 1-Minute Setup)
            </h3>
            <p className="text-2xs text-slate-500 font-medium mt-0.5">
              Because Google Forms runs inside <code>docs.google.com</code>, you can paste this script into your Google Form (<strong>Extensions &rarr; Apps Script</strong>, then add a <strong>Trigger &rarr; On form submit</strong>) so Google Forms automatically sends the confirmation email + WhatsApp link the instant someone clicks Submit inside Google Forms.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(googleFormAppsScript);
              setCopiedWebhookScript(true);
              setTimeout(() => setCopiedWebhookScript(false), 2500);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-2xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedWebhookScript ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedWebhookScript ? "Webhook Script Copied!" : "Copy Google Form Script"}</span>
          </button>
        </div>
        <pre className="p-3.5 bg-slate-900 text-emerald-300 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
          {googleFormAppsScript}
        </pre>
      </div>

      {/* Dynamic Templates Editor Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subtabs Selection */}
        <div className="lg:col-span-1 space-y-1.5 border-r border-slate-100 pr-4">
          <span className="block text-3xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Select Template
          </span>
          {(Object.keys(templateMeta) as TemplateKey[]).map((key) => {
            const isSel = selectedTemplate === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-2xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSel ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText size={12} className={isSel ? "text-amber-300" : "text-slate-400"} />
                <span className="truncate">{templateMeta[key].name}</span>
              </button>
            );
          })}
        </div>

        {/* Template Form Inputs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border-b border-slate-100 pb-3 text-left">
            <h4 className="text-xs font-black text-slate-900 uppercase">
              {selectedMeta.name}
            </h4>
            <p className="text-2xs text-slate-400 font-medium mt-1">
              {selectedMeta.desc}
            </p>
          </div>

          {/* Subject Line */}
          <div className="space-y-1.5 text-left">
            <label className="block text-2xs font-extrabold uppercase text-slate-500 tracking-wider">
              Template Subject Header
            </label>
            <input
              type="text"
              disabled={!hasWriteAccess}
              value={settings.templates[subjectKey]}
              onChange={(e) => handleTemplateChange(selectedTemplate, "Subject", e.target.value)}
              className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium transition-all"
              placeholder="Enter subject header line"
            />
          </div>

          {/* Body Content */}
          <div className="space-y-1.5 text-left">
            <label className="block text-2xs font-extrabold uppercase text-slate-500 tracking-wider flex justify-between">
              <span>Text Body Editor Layout</span>
              <span className="text-[10px] text-slate-400 italic lowercase font-normal">Supports formatting & variables replacement</span>
            </label>
            <textarea
              disabled={!hasWriteAccess}
              rows={11}
              value={settings.templates[bodyKey]}
              onChange={(e) => handleTemplateChange(selectedTemplate, "Body", e.target.value)}
              className="w-full p-4 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono leading-relaxed transition-all resize-y"
              placeholder="Configure template text..."
            />
          </div>

          {/* Suggested Placeholders */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-left border border-slate-100">
            <span className="block text-3xs font-black uppercase text-slate-400 tracking-wide">
              Supported replacement variables tags:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedMeta.vars.map((v) => (
                <code
                  key={v}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-3xs font-bold font-mono text-[#103D2E]"
                >
                  {v}
                </code>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-medium">
              These tags will be securely replaced with true applicant metadata values at delivery runtime automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Live Email API Diagnostic & Test Dispatch Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Send size={15} className="text-[#103D2E]" />
              Live Auto Email API Test & Diagnostics
            </h3>
            <p className="text-2xs text-slate-400 font-medium mt-0.5">
              Verify end-to-end delivery of your automated confirmation & Internship WhatsApp link email pipeline.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="email"
            value={testEmailInput}
            onChange={(e) => setTestEmailInput(e.target.value)}
            placeholder="Enter recipient email to test (e.g. olosundelouis@gmail.com)"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium transition-all"
          />
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={sendingTest || !testEmailInput.trim()}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-2xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Send size={13} />
            {sendingTest ? "DISPATCHING TEST..." : "Send Live Test Email"}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              testResult.success
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-2xs">
              {testResult.success ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>
                    {testResult.simulated
                      ? "API Reachable (Simulation Mode – RESEND_API_KEY not set in environment)"
                      : "Live Resend Email Dispatched Successfully!"}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={15} className="text-red-600 shrink-0" />
                  <span>Email Dispatch Failed: {testResult.error}</span>
                </>
              )}
            </div>
            {testResult.success && (
              <div className="text-[11px] font-mono space-y-0.5 text-slate-700 pt-1">
                <div>• Message Reference ID: <strong>{testResult.messageId || "N/A"}</strong></div>
                <div>• Active Sender Address: <strong>{testResult.senderEmail || "onboarding@resend.dev"}</strong></div>
                {testResult.sandboxRedirectTo && (
                  <div className="text-amber-800 font-sans pt-1">
                    Note: Resend is using the sandbox sender (<code>onboarding@resend.dev</code>), so this email was delivered to your verified Resend owner inbox (<strong>{testResult.sandboxRedirectTo}</strong>). Once you verify your custom domain in Resend and set <code>SENDER_EMAIL</code> in Vercel Environment Variables, emails go directly to any external recipient.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-150 rounded-2xl">
        <span className="text-2xs font-mono text-slate-400 font-bold uppercase">
          {hasWriteAccess ? "SYSTEM WRITE PERMISSION ASSIGNED" : "SYSTEM ACTION ONLY READABLE"}
        </span>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-2xs font-bold text-emerald-600 animate-pulse uppercase tracking-wider mr-2">
              ✓ Email settings successfully synchronized
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !hasWriteAccess}
            className="px-4 py-2 bg-[#103D2E] hover:bg-[#1b503f] disabled:bg-slate-300 text-amber-300 rounded-xl text-2xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Save size={12} />
            {saving ? "SAVING..." : "Save Settings & Templates"}
          </button>
        </div>
      </div>
    </div>
  );
};
