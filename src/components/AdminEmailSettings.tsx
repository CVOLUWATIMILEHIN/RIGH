import React, { useState, useEffect } from "react";
import { Mail, User, Save, ListFilter, AlertCircle, FileText } from "lucide-react";
import { getEmailSettings, saveEmailSettings, EmailSettings } from "../lib/db";

interface AdminEmailSettingsProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

type TemplateKey =
  | "ciiWelcome"
  | "rmaWelcome"
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

  useEffect(() => {
    async function load() {
      try {
        const data = await getEmailSettings();
        setSettings(data);
      } catch (err) {
        console.error("Error fetching email settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{submissionDate}}"],
    },
    rmaWelcome: {
      name: "RMA Welcome Confirmation",
      desc: "Sent to applicant instantly upon successfully submitting a Right Minds Africa form.",
      vars: ["{{fullName}}", "{{referenceNumber}}", "{{programName}}", "{{submissionDate}}"],
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
                placeholder="e.g. info@rightminds.org"
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
