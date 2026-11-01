import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  CreditCard, 
  FileText, 
  Upload, 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Mail,
  Sliders,
  CheckCircle2,
  Lock
} from "lucide-react";
import { 
  getPaymentHubSettings, 
  savePaymentHubSettings, 
  saveLmsAuditLog, 
  PaymentHubSettings, 
  DEFAULT_PAYMENT_HUB_SETTINGS 
} from "../lib/db";

interface AdminLmsPaymentSettingsProps {
  onNotify: (msg: string, type: "success" | "error") => void;
  adminUserEmail?: string;
}

export default function AdminLmsPaymentSettings({ onNotify, adminUserEmail = "admin@rightmindsafrica.org" }: AdminLmsPaymentSettingsProps) {
  const [settings, setSettings] = useState<PaymentHubSettings>(DEFAULT_PAYMENT_HUB_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getPaymentHubSettings();
      setSettings(data);
    } catch (err) {
      onNotify("Error loading LMS payment settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: PaymentHubSettings = {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail
      };

      await savePaymentHubSettings(updated);
      await saveLmsAuditLog({
        id: `audit-${Date.now()}`,
        action: "Payment Settings Updated",
        administrator: adminUserEmail,
        student: "N/A (System Setting)",
        course: "All Courses",
        timestamp: new Date().toISOString(),
        details: `Updated Bank: ${updated.bankName}, Account No: ${updated.accountNumber}`
      });

      setSettings(updated);
      setHasChanges(false);
      onNotify("LMS Bank Payment Settings saved and published live!", "success");
    } catch (err) {
      onNotify("Failed to save payment settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileTypeToggle = (type: string) => {
    setSettings(prev => {
      const current = prev.acceptedFileTypes || ["image/jpeg", "image/png", "application/pdf"];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      return { ...prev, acceptedFileTypes: updated };
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono tracking-wider">LOADING PAYMENT SETTINGS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto" id="admin-lms-payment-settings">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
              Official Bank Transfer Channel
            </span>
            {hasChanges && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                Unsaved Changes
              </span>
            )}
          </div>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            LMS Bank Payment Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure official bank account details, transfer instructions, and upload proof restrictions. Changes reflect on all student checkout pages instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Reset
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save & Publish Settings
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Official Bank Account Credentials */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Primary Bank Account Credentials</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">This account information is displayed to students during checkout.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.bankName || ""}
                onChange={e => { setSettings({ ...settings, bankName: e.target.value }); setHasChanges(true); }}
                placeholder="e.g. Zenith Bank PLC"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.accountName || ""}
                onChange={e => { setSettings({ ...settings, accountName: e.target.value }); setHasChanges(true); }}
                placeholder="e.g. RightMinds Africa Development Trust"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.accountNumber || ""}
                onChange={e => { setSettings({ ...settings, accountNumber: e.target.value }); setHasChanges(true); }}
                placeholder="e.g. 1015694821"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Additional Backup Bank Accounts */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Secondary / Backup Bank Accounts</h4>
            <div className="space-y-3">
              {(settings.bankAccounts || []).map((acc, index) => (
                <div key={acc.id || index} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    value={acc.bankName}
                    onChange={e => {
                      const updatedAccs = [...(settings.bankAccounts || [])];
                      updatedAccs[index].bankName = e.target.value;
                      setSettings({ ...settings, bankAccounts: updatedAccs });
                      setHasChanges(true);
                    }}
                    placeholder="Bank Name"
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={acc.accountName}
                    onChange={e => {
                      const updatedAccs = [...(settings.bankAccounts || [])];
                      updatedAccs[index].accountName = e.target.value;
                      setSettings({ ...settings, bankAccounts: updatedAccs });
                      setHasChanges(true);
                    }}
                    placeholder="Account Name"
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={acc.accountNumber}
                    onChange={e => {
                      const updatedAccs = [...(settings.bankAccounts || [])];
                      updatedAccs[index].accountNumber = e.target.value;
                      setSettings({ ...settings, bankAccounts: updatedAccs });
                      setHasChanges(true);
                    }}
                    placeholder="Account Number"
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Instructions & Warning Disclaimer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Payment Instructions & Fraud Warning</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Custom instructions shown on student enrollment payment forms.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Instructions Text
            </label>
            <textarea
              rows={3}
              value={settings.paymentInstructions || ""}
              onChange={e => { setSettings({ ...settings, paymentInstructions: e.target.value }); setHasChanges(true); }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <ShieldAlert size={14} /> Security Warning Disclaimer
            </label>
            <textarea
              rows={2}
              value={settings.warningNotice || ""}
              onChange={e => { setSettings({ ...settings, warningNotice: e.target.value }); setHasChanges(true); }}
              className="w-full px-3.5 py-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-900 dark:text-rose-200 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Section 3: Upload Proof Rules & Workflow Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Proof Upload Rules & Approval Workflow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">File size, format constraints, and email notification parameters.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Accepted File Types for Payment Proof
              </label>
              <div className="space-y-2">
                {[
                  { id: "image/jpeg", label: "JPEG Images (.jpg, .jpeg)" },
                  { id: "image/png", label: "PNG Images (.png)" },
                  { id: "application/pdf", label: "PDF Documents (.pdf)" }
                ].map(item => {
                  const isChecked = (settings.acceptedFileTypes || []).includes(item.id);
                  return (
                    <label key={item.id} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFileTypeToggle(item.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum File Upload Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.maxUploadSizeMB || 8}
                onChange={e => { setSettings({ ...settings, maxUploadSizeMB: parseInt(e.target.value, 10) || 8 }); setHasChanges(true); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
              <p className="text-3xs text-slate-400 mt-1">Recommended: 8 MB limit for fast image/PDF uploading.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Mail size={13} className="text-slate-400" /> Admin Notification Email
              </label>
              <input
                type="email"
                value={settings.notificationEmail || "payments@rightmindsafrica.org"}
                onChange={e => { setSettings({ ...settings, notificationEmail: e.target.value }); setHasChanges(true); }}
                placeholder="e.g. payments@rightmindsafrica.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
              <p className="text-3xs text-slate-400 mt-1">New payment proof alerts will be sent to this email address.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Lock size={13} className="text-slate-400" /> Enrollment Access Workflow
              </label>
              <select
                value={settings.approvalWorkflow || "manual_admin"}
                onChange={e => { setSettings({ ...settings, approvalWorkflow: e.target.value as any }); setHasChanges(true); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="manual_admin">Strict Manual Admin Verification (Required for Bank Transfer)</option>
                <option value="auto">Instant Unlocking (Testing / Auto Approval)</option>
              </select>
              <p className="text-3xs text-slate-400 mt-1">Under strict mode, students cannot open lessons until verified.</p>
            </div>

          </div>
        </div>

        {/* Submit Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save & Publish Settings
          </button>
        </div>

      </form>
    </div>
  );
}
