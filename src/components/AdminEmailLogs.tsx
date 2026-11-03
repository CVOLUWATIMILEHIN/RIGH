import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, Send, ShieldAlert, Search, ClipboardList, Calendar, Filter, CheckCircle2, XCircle, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { getEmailLogs, EmailLog, saveRegistration } from "../lib/db";

interface AdminEmailLogsProps {
  onLogAction: (msg: string) => void;
}

const DEFAULT_WHATSAPP_LINK = "https://chat.whatsapp.com/HbcAPEL2tVMIZBrzIAsx4o?s=cl&p=a&mlu=4&ilr=4&iam=2";

export const AdminEmailLogs: React.FC<AdminEmailLogsProps> = ({ onLogAction }) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Custom Filters state
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  // Active selected log modal for detailed view
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  // Quick Manual Confirmation Email Dispatch state (for sending immediately to any registrant who missed their mail)
  const [quickName, setQuickName] = useState<string>("");
  const [quickEmail, setQuickEmail] = useState<string>("");
  const [quickRole, setQuickRole] = useState<string>("Internship & Volunteer Team");
  const [quickSending, setQuickSending] = useState<boolean>(false);
  const [quickStatus, setQuickStatus] = useState<{ ok: boolean; msg: string; gmailUrl?: string } | null>(null);

  const buildGmailComposeUrl = (recipient: string, subject: string, body: string) => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleQuickSendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail.trim()) return;
    setQuickSending(true);
    setQuickStatus(null);
    const nameToUse = quickName.trim() || quickEmail.trim().split("@")[0];
    const mailSubject = "Thank You for Applying – Right-Minds Africa Hub Internship & Volunteer Team";
    const mailBody = `Dear ${nameToUse},\n\nThank you for your interest in joining the Right-Minds Africa Hub Internship & Volunteer Team! We deeply appreciate your willingness to contribute your skills toward shaping a generation across Africa.\n\n* Applicant Name: ${nameToUse}\n* Primary Role / Department: ${quickRole}\n* Official WhatsApp Community Link: ${DEFAULT_WHATSAPP_LINK}\n\nPlease click the link above to join our official WhatsApp community immediately for onboarding updates and orientation schedules.\n\nWarm regards,\nRight-Minds Africa Hub & Corper Impact Initiative Team`;
    const gmailComposeUrl = buildGmailComposeUrl(quickEmail.trim(), mailSubject, mailBody);

    try {
      await saveRegistration({
        fullName: nameToUse,
        email: quickEmail.trim(),
        phone: "Dispatched via Admin Quick Send",
        location: "Nigeria",
        profileType: "volunteer",
        programType: "internship",
        programName: "Right-Minds Africa Hub Internship & Volunteer Application",
        department: quickRole,
        primaryRole: quickRole,
        whatsappLink: DEFAULT_WHATSAPP_LINK
      });
      await fetchLogs();
      onLogAction(`✅ [QUICK DISPATCH] Confirmation email & WhatsApp link triggered for ${quickEmail.trim()}`);
      setQuickStatus({
        ok: true,
        msg: `Confirmation email triggered for ${quickEmail.trim()}! You can also click "Open in Gmail" on the right to send directly from your Gmail inbox if SMTP/Domain is not yet configured.`,
        gmailUrl: gmailComposeUrl
      });
    } catch (err: any) {
      setQuickStatus({
        ok: false,
        msg: err?.message || "Failed to trigger confirmation email.",
        gmailUrl: gmailComposeUrl
      });
    } finally {
      setQuickSending(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getEmailLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to query email logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRetrySend = async (logId: string) => {
    setRetryingLogId(logId);
    onLogAction(`⚡ [EMAIL SERVICE] Manually triggering re-dispatch of diagnostic logs unit id: ${logId}`);
    try {
      const response = await fetch("/api/email/retry-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLogAction(`✓ [EMAIL SERVICE] Email trace retry completed successfully match ID: ${logId}`);
        await fetchLogs();
      } else {
        const errorMsg = data.error || "Mail transmission declined by backend.";
        onLogAction(`❌ [EMAIL SERVICE] Re-dispatch failed for log ID ${logId}. Error: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Exception of email dispatch:", err);
      onLogAction(`❌ [EMAIL SERVICE] Network crash re-dispatching log ${logId}: ${err.message || String(err)}`);
    } finally {
      setRetryingLogId(null);
    }
  };

  // Modern UI lists for filtering options
  const programs = [
    { value: "all", label: "All Programs" },
    { value: "cii", label: "Corper Impact Initiative (CII)" },
    { value: "teens", label: "Right-Minded Teens" },
    { value: "young-leaders", label: "Young Leaders Program" },
    { value: "yap", label: "YAP Conference" },
    { value: "event", label: "Events & Hangouts" },
    { value: "course", label: "Premium Courses" },
    { value: "volunteer", label: "Volunteer Applications" },
    { value: "mentorship", label: "Mentorship Applications" },
    { value: "partnership", label: "Partnership Requests" }
  ];

  const filteredLogs = logs.filter((log) => {
    // 1. Status Filter
    if (statusFilter !== "all" && log.status !== statusFilter) return false;

    // 2. Program Filter
    if (programFilter !== "all") {
      const logProg = (log.programType || "").toLowerCase();
      const filterProg = programFilter.toLowerCase();
      if (filterProg === "young-leaders" && (logProg.includes("young") || logProg.includes("leader"))) {
        // match
      } else if (filterProg === "yap" && (logProg.includes("yap") || logProg.includes("conference"))) {
        // match
      } else if (logProg !== filterProg) {
        return false;
      }
    }

    // 3. Date Filter
    if (dateFilter !== "all") {
      const sentTime = new Date(log.sentTime).getTime();
      const now = new Date().getTime();
      const diffMs = now - sentTime;
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (dateFilter === "today" && diffMs > oneDayMs) return false;
      if (dateFilter === "week" && diffMs > 7 * oneDayMs) return false;
      if (dateFilter === "month" && diffMs > 30 * oneDayMs) return false;
    }

    // 4. Search Query
    const term = searchQuery.toLowerCase().trim();
    if (term) {
      const matchRecipient = log.recipient.toLowerCase().includes(term);
      const matchSubject = log.subject.toLowerCase().includes(term);
      const matchRegId = (log.registrationId || "").toLowerCase().includes(term);
      const matchDiagnostics = (log.deliveryResult || "").toLowerCase().includes(term);
      if (!matchRecipient && !matchSubject && !matchRegId && !matchDiagnostics) return false;
    }

    return true;
  });

  const getProgramBadgeColor = (type?: string) => {
    const p = (type || "").toLowerCase();
    if (p.includes("cii")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (p.includes("teen")) return "bg-sky-50 text-sky-800 border-sky-200";
    if (p.includes("leader")) return "bg-indigo-50 text-indigo-800 border-indigo-200";
    if (p.includes("yap")) return "bg-purple-50 text-purple-800 border-purple-200";
    if (p.includes("course")) return "bg-amber-50 text-amber-800 border-amber-200";
    if (p.includes("event")) return "bg-pink-50 text-pink-800 border-pink-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="email-logs-panel">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
            <ClipboardList size={16} className="text-[#103D2E]" />
            Outbound Mail Audits & Diagnostics
          </h3>
          <p className="text-2xs text-slate-400 font-medium mt-0.5">
            Audit, filter, and track outbound automated confirmation messages and retry failed transmissions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-[#103D2E] hover:bg-[#1b503f] disabled:bg-slate-300 text-amber-300 rounded-xl text-2xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-stretch md:self-auto justify-center"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Reload Audits
        </button>
      </div>

      {/* Quick Send Confirmation Email to Registrant Card */}
      <form
        onSubmit={handleQuickSendConfirmation}
        className="bg-gradient-to-r from-[#103D2E] to-[#16523e] p-5 rounded-2xl text-white space-y-3 text-left shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Send size={14} />
              Send Confirmation Email &amp; WhatsApp Link to Any Registrant Now
            </h4>
            <p className="text-[11px] text-emerald-100/90 mt-0.5">
              Did someone register on the Google Form and miss their confirmation mail? Enter their name and email below to dispatch their official confirmation email and WhatsApp link immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
          <input
            type="text"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Registrant Full Name"
            className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none"
          />
          <input
            type="email"
            required
            value={quickEmail}
            onChange={(e) => setQuickEmail(e.target.value)}
            placeholder="Registrant Email Address *"
            className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none"
          />
          <input
            type="text"
            value={quickRole}
            onChange={(e) => setQuickRole(e.target.value)}
            placeholder="Role / Program (e.g. Graphic Designer)"
            className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={quickSending || !quickEmail.trim()}
              className="flex-1 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-xl text-2xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={12} />
              <span>{quickSending ? "Sending..." : "Send Confirmation"}</span>
            </button>
            {quickEmail.trim() && (
              <a
                href={buildGmailComposeUrl(
                  quickEmail.trim(),
                  "Thank You for Applying – Right-Minds Africa Hub Internship & Volunteer Team",
                  `Dear ${quickName.trim() || "Applicant"},\n\nThank you for your interest in joining the Right-Minds Africa Hub Internship & Volunteer Team!\n\n* Applicant Name: ${quickName.trim() || "Applicant"}\n* Role / Track: ${quickRole}\n* Official WhatsApp Community Link: ${DEFAULT_WHATSAPP_LINK}\n\nPlease click the WhatsApp link above to join our official onboarding group immediately.\n\nWarm regards,\nRight-Minds Africa Hub Team`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-2xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shrink-0"
                title="Open pre-filled email in Gmail to send directly"
              >
                <span>Gmail</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>

        {quickStatus && (
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
            <span>{quickStatus.msg}</span>
            {quickStatus.gmailUrl && (
              <a
                href={quickStatus.gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-slate-950 font-black text-2xs uppercase tracking-wider rounded-lg inline-flex items-center gap-1"
              >
                <span>Send Directly in Gmail</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}
      </form>

      {/* Dynamic Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="block text-3xs font-extrabold uppercase text-slate-500 tracking-wider">
            Search Text
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={12} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipient, reg ID, diagnostics..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white focus:border-slate-400 rounded-xl text-2xs font-bold transition-all"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-3xs font-extrabold uppercase text-slate-500 tracking-wider">
            Delivery Status
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={12} />
            </span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white focus:border-slate-400 rounded-xl text-2xs font-bold uppercase tracking-wider transition-all cursor-pointer appearance-none"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="success">Success / Delivered</option>
              <option value="failed">Failed / Flagged</option>
            </select>
          </div>
        </div>

        {/* Program Filter */}
        <div className="space-y-1.5">
          <label className="block text-3xs font-extrabold uppercase text-slate-500 tracking-wider">
            Filter by Program
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ClipboardList size={12} />
            </span>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white focus:border-slate-400 rounded-xl text-2xs font-bold uppercase tracking-wider transition-all cursor-pointer appearance-none"
            >
              {programs.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1.5">
          <label className="block text-3xs font-extrabold uppercase text-slate-500 tracking-wider">
            Filter by Date
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar size={12} />
            </span>
            <select
              value={dateFilter}
              onChange={(e: any) => setDateFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white focus:border-slate-400 rounded-xl text-2xs font-bold uppercase tracking-wider transition-all cursor-pointer appearance-none"
            >
              <option value="all">Anytime (All Logs)</option>
              <option value="today">Today / Past 24 hours</option>
              <option value="week">Past 7 days</option>
              <option value="month">Past 30 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden text-left shadow-xs">
        {loading && logs.length === 0 ? (
          <div className="p-10 text-center animate-pulse">
            <p className="text-xs font-mono text-slate-400 uppercase">RETRIEVING DISPATCH AUDIT REGISTRIES...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <ShieldAlert size={20} className="text-slate-300" />
            <p className="text-xs font-mono text-slate-400 uppercase">NO OUTBOUND DISPATCH ENTRIES MATCH SEARCH PARAMS</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-3xs uppercase tracking-wider font-bold">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-401 font-black text-[9px] font-mono select-none">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Subject Trigger Target</th>
                  <th className="py-3 px-4">Program Type</th>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sent At (Local)</th>
                  <th className="py-3 px-4">Result / Diagnostics</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px] lowercase font-normal">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === "success";
                  const isRetrying = retryingLogId === log.id;
                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Recipient */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-40 block">{log.recipient}</span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 text-slate-600 normal-case min-w-44 font-medium leading-relaxed">
                        {log.subject}
                      </td>

                      {/* Program Type */}
                      <td className="py-3 px-4 text-slate-500 uppercase font-mono font-bold text-[9px]">
                        {log.programType ? (
                          <span className={`px-2 py-0.5 rounded-md border ${getProgramBadgeColor(log.programType)}`}>
                            {log.programType}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal italic">-</span>
                        )}
                      </td>

                      {/* Registration ID */}
                      <td className="py-3 px-4 text-slate-700 font-mono font-bold">
                        {log.registrationId || <span className="text-slate-300 font-normal italic">-</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-black uppercase ${
                              log.sandboxRedirectTo
                                ? "bg-amber-50 text-amber-800 border border-amber-300"
                                : isSuccess
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {log.sandboxRedirectTo ? (
                              <AlertTriangle size={9} />
                            ) : isSuccess ? (
                              <CheckCircle2 size={9} />
                            ) : (
                              <XCircle size={9} />
                            )}
                            {log.sandboxRedirectTo ? "sandbox relay" : log.status}
                          </span>
                        </div>
                      </td>

                      {/* Sent Time */}
                      <td className="py-3 px-4 text-slate-400 font-mono font-medium">
                        {new Date(log.sentTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Diagnostics */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[9px] max-w-56 leading-normal min-w-44 break-words">
                        {log.deliveryResult || "No delivery information logged"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleRetrySend(log.id)}
                            disabled={isRetrying}
                            className={`px-2.5 py-1.5 rounded-lg text-3xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-1xs ${
                              isSuccess
                                ? "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                                : "bg-rose-600 border border-rose-700 text-white hover:bg-rose-700"
                            }`}
                            title="Trigger instant manual retry or resend of confirmation email"
                          >
                            {isRetrying ? (
                              <RefreshCw size={10} className="animate-spin" />
                            ) : (
                              <Send size={10} />
                            )}
                            <span>{isRetrying ? "Resending..." : isSuccess ? "re-send" : "retry log"}</span>
                          </button>

                          <a
                            href={buildGmailComposeUrl(
                              log.recipient,
                              log.subject,
                              log.body || `Dear Applicant,\n\nThank you for applying to Right-Minds Africa Hub!\n\nOfficial WhatsApp Community Link: ${DEFAULT_WHATSAPP_LINK}\n\nWarm regards,\nRight-Minds Africa Hub Team`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1.5 rounded-lg text-3xs font-black uppercase tracking-wider bg-[#103D2E] text-amber-300 hover:bg-[#1b503f] inline-flex items-center gap-1"
                            title="Send this exact confirmation email directly via your Gmail inbox"
                          >
                            <span>Gmail</span>
                            <ExternalLink size={9} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Overlay Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-150 w-full max-w-2xl overflow-hidden shadow-xl text-left flex flex-col max-h-[85vh] animate-scaleUp">
            <div className="bg-[#103D2E] p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-amber-300" />
                <h4 className="text-xs font-black uppercase tracking-wider">Outbound Dispatch Detailed View</h4>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="text-white hover:text-amber-300 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Meta stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-2xs uppercase tracking-wider font-bold">
                <div>
                  <span className="text-slate-400 block mb-0.5">Recipient Address</span>
                  <span className="text-slate-800 break-all lowercase font-medium">{selectedLog.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Registration ID</span>
                  <span className="text-slate-800 font-mono">{selectedLog.registrationId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Program Category</span>
                  <span className="text-slate-800">{selectedLog.programType || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Outbound Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-3xs font-black uppercase ${
                    selectedLog.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>{selectedLog.status}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Subject Line</span>
                <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">{selectedLog.subject}</p>
              </div>

              {/* Delivery info */}
              <div className="space-y-1">
                <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Delivery Details / Error Log</span>
                <p className="text-2xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal">{selectedLog.deliveryResult || "None logged"}</p>
              </div>

              {/* Message Body Content if exists */}
              {selectedLog.body && (
                <div className="space-y-1">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider font-mono">Outbound Message Body</span>
                  <pre className="text-2xs bg-slate-900 text-slate-100 p-4 rounded-xl font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">{selectedLog.body}</pre>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-150 flex flex-wrap justify-end gap-2 shrink-0">
              <button 
                onClick={() => setSelectedLog(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-2xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Close View
              </button>
              <a
                href={buildGmailComposeUrl(
                  selectedLog.recipient,
                  selectedLog.subject,
                  selectedLog.body || `Dear Applicant,\n\nThank you for applying to Right-Minds Africa Hub!\n\nOfficial WhatsApp Community Link: ${DEFAULT_WHATSAPP_LINK}\n\nWarm regards,\nRight-Minds Africa Hub Team`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-2xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <span>Send Directly in Gmail</span>
                <ExternalLink size={12} />
              </a>
              <button 
                onClick={() => handleRetrySend(selectedLog.id)}
                disabled={retryingLogId !== null}
                className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedLog.status === "success" 
                    ? "bg-[#103D2E] hover:bg-[#1b503f] text-amber-300"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {retryingLogId === selectedLog.id ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                <span>{selectedLog.status === "success" ? "Resend Outbound Email" : "Retry Failed Transmission"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
