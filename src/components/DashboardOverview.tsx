import React from "react";
import { 
  Users, 
  Layers, 
  MapPin, 
  TrendingUp, 
  Activity, 
  Award, 
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Volume2,
  CheckCircle2,
  Eye,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  FileText
} from "lucide-react";
import { Registration, VisitorCheckIn } from "../lib/db";
import AdminAnalytics from "./AdminAnalytics";
import { SYSTEM_PRD_DOCUMENT } from "../lib/prd";

interface DashboardOverviewProps {
  registrations: Registration[];
  visitorCheckins: VisitorCheckIn[];
  isSuperAdmin: boolean;
  onNavigateTab: (tab: "dashboard" | "reg-cii" | "reg-rma" | "visitors-live" | "visitors-analytics" | "user-management" | "security" | "activity" | "settings" | "prd-doc") => void;
  onQuickCreateMember: () => void;
  onQuickCreateAnnouncement: () => void;
  latestLogs: string[];
  pendingSyncCount: number;
  failedSubmissionsCount: number;
}

export default function DashboardOverview({
  registrations,
  visitorCheckins,
  isSuperAdmin,
  onNavigateTab,
  onQuickCreateMember,
  onQuickCreateAnnouncement,
  latestLogs,
  pendingSyncCount,
  failedSubmissionsCount
}: DashboardOverviewProps) {
  
  // Totals calculations
  const totalCount = registrations.length;
  const ciiCount = registrations.filter(r => r.profileType?.startsWith("cii")).length;
  const nyscCount = registrations.filter(r => r.profileType === "corps_member").length;
  const studentCount = registrations.filter(r => r.profileType === "student").length;
  const teenCount = registrations.filter(r => r.profileType === "teen").length;
  const mentorCount = registrations.filter(r => r.profileType === "mentor").length;

  const todayStr = new Date().toDateString();
  const todaysRegistrationsCount = registrations.filter(r => {
    try {
      return new Date(r.registeredAt).toDateString() === todayStr;
    } catch (e) {
      return false;
    }
  }).length;

  const pendingApprovals = registrations.filter(r => r.paymentStatus === "pending").slice(0, 4);

  // Modern KPI Cards Specification
  const kpis = [
    {
      title: "Total Nominees",
      value: totalCount,
      change: "+12.4% MoM",
      isGrowth: true,
      color: "border-l-blue-600 text-blue-600 bg-blue-50/20",
      icon: Users
    },
    {
      title: "CII Registrations",
      value: ciiCount,
      change: "Real-time active",
      isGrowth: true,
      color: "border-l-rose-500 text-rose-500 bg-rose-50/20",
      icon: Award
    },
    {
      title: "Today's Registrations",
      value: todaysRegistrationsCount,
      change: "Active cycle",
      isGrowth: true,
      color: "border-l-emerald-600 text-emerald-600 bg-emerald-50/20",
      icon: Clock
    },
    {
      title: "Pending Sync Queue",
      value: pendingSyncCount,
      change: pendingSyncCount > 0 ? "Awaiting sync" : "Fully synced",
      isGrowth: pendingSyncCount === 0,
      color: pendingSyncCount > 0 ? "border-l-amber-500 text-amber-600 bg-amber-50/20" : "border-l-slate-300 text-slate-500 bg-slate-50/10",
      icon: Layers
    },
    {
      title: "Failed Submissions",
      value: failedSubmissionsCount,
      change: failedSubmissionsCount > 0 ? "Logged errors" : "Errors clear",
      isGrowth: failedSubmissionsCount === 0,
      color: failedSubmissionsCount > 0 ? "border-l-red-500 text-red-600 bg-red-50/20" : "border-l-slate-300 text-slate-500 bg-slate-50/10",
      icon: ShieldAlert
    },
    {
      title: "Approved Mentors",
      value: mentorCount,
      change: "Stable",
      isGrowth: true,
      color: "border-l-purple-500 text-purple-600 bg-purple-50/20",
      icon: MapPin
    }
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
      
      {/* 1. Welcoming Hero Restructure */}
      <div className="bg-[#0A1A14] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#133F31] via-[#0A1A14] to-[#040C0A] text-white p-6 sm:p-8 rounded-[2rem] border border-[#152e25] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-emerald-990/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-700/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2 text-left relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/20 text-[10px] font-black tracking-widest uppercase">
            <Sparkles size={10} className="text-amber-400" />
            ADMIN EXECUTIVE CENTRE
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-slate-100">
            Welcome back, Olosunde.
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Here is your live operations overview for today. Real-time registries stream synchronization is active, allowing you to manage candidate credentials, review dossiers, inspect check-ins, and authorize permissions.
          </p>
        </div>

        <div className="flex gap-2.5 relative z-10 w-full sm:w-auto shrink-0">
          <button
            onClick={onQuickCreateMember}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/15"
          >
            <Users size={12} className="stroke-[2.5]" />
            New Dossier
          </button>
          
          <button
            onClick={onQuickCreateAnnouncement}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-100 font-black rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
          >
            <Volume2 size={12} />
            Post Notice
          </button>
        </div>
      </div>

      {/* 2. Compact Uniform KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl bg-white/75 dark:bg-[#141E1A]/45 border border-slate-150 dark:border-slate-800/80 shadow-xs flex flex-col justify-between glass-premium premium-card-glow border-l-4 ${kpi.color} text-left cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-450 uppercase tracking-wider font-sans truncate pr-1">
                  {kpi.title}
                </span>
                <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  <IconComponent size={12} className="text-slate-500 dark:text-slate-400" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-display leading-none">
                  {kpi.value}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[9.5px] font-bold text-emerald-600 dark:text-amber-500">
                  <ArrowUpRight size={10} />
                  <span>{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Section: Distribution Charts & Activity widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Distribution Graphs (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex justify-between items-center bg-white/75 dark:bg-[#141E1A]/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800 glass-premium">
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">REGISTRY DISTRIBUTIONS</h3>
            <button 
              onClick={() => onNavigateTab("reg-cii")}
              className="text-[11px] font-black text-[#103D2E] dark:text-amber-450 hover:underline uppercase flex items-center gap-1 cursor-pointer"
            >
              View Full Datagrid
              <ChevronRight size={12} />
            </button>
          </div>
          <AdminAnalytics 
            registrations={registrations}
            onSelectFilter={() => {}}
            activeProfileFilter="all"
            activeLocationFilter="all"
          />
        </div>

        {/* Action Center, Pending verification and Quick alerts (takes 1 col) */}
        <div className="space-y-6 text-left">
          
          {/* Admin Alerts & Pending Approvals */}
          <div className="bg-white/75 dark:bg-[#141E1A]/40 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 glass-premium shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-[#E76F51]" />
                PENDING VERIFICATIONS
              </h4>
              <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-md font-mono text-[9px] font-black uppercase border border-rose-100 dark:border-rose-900">
                Action Required
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-2xs">
                All receipts verified. No pending approvals found!
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingApprovals.map((p) => (
                  <div 
                    key={p.id} 
                    className="p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-between text-xs hover:bg-[#FAF8F3]/50 dark:hover:bg-slate-800/50 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-800 dark:text-white truncate">{p.fullName}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate font-mono mt-0.5 uppercase tracking-wide">
                        {p.profileType} • {p.location}
                      </p>
                    </div>
                    <button 
                      onClick={() => onNavigateTab("reg-cii")}
                      className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Center */}
          <div className="bg-white/75 dark:bg-[#141E1A]/40 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 glass-premium shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              QUICK LAUNCH SHORTCUTS
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab("reg-cii")}
                className="p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-[#FAF8F3] dark:hover:bg-[#141E1A]/60 border border-slate-200 dark:border-slate-800 hover:border-[#103D2E]/35 rounded-xl transition-all cursor-pointer text-left premium-card-glow"
              >
                <Users size={16} className="text-[#103D2E] dark:text-amber-500 mb-2" />
                <span className="text-2xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-white block animate-pulse">Registry</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-mono">Dossier logs</span>
              </button>

              <button
                onClick={() => onNavigateTab("visitors-live")}
                className="p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-[#FAF8F3] dark:hover:bg-[#141E1A]/60 border border-slate-200 dark:border-slate-800 hover:border-[#103D2E]/35 rounded-xl transition-all cursor-pointer text-left premium-card-glow"
              >
                <Activity size={16} className="text-[#E76F51] mb-2" />
                <span className="text-2xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-white block">Guestbook</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-mono">Check ins stream</span>
              </button>

              <button
                onClick={() => onNavigateTab("security")}
                className="p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-[#FAF8F3] dark:hover:bg-[#141E1A]/60 border border-slate-200 dark:border-slate-800 hover:border-[#103D2E]/35 rounded-xl transition-all cursor-pointer text-left premium-card-glow"
              >
                <ShieldAlert size={16} className="text-indigo-505 mb-2" />
                <span className="text-2xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-white block">Access Control</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-mono">Admin credentials</span>
              </button>

              <button
                onClick={() => onNavigateTab("settings")}
                className="p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-[#FAF8F3] dark:hover:bg-[#141E1A]/60 border border-slate-200 dark:border-slate-800 hover:border-[#103D2E]/35 rounded-xl transition-all cursor-pointer text-left premium-card-glow"
              >
                <Volume2 size={16} className="text-amber-500 mb-2" />
                <span className="text-2xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-white block">Banner Ticker</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-mono">Marquee configurations</span>
              </button>
            </div>
          </div>

          {/* PRD Spec Card - Styled with premium-animated-gradient and premium glow */}
          <div className="premium-animated-gradient p-5 rounded-2xl text-white space-y-4 shadow-xl premium-card-glow text-left border-0 relative overflow-hidden">
            <p className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 text-white rounded font-mono text-[9px] font-black uppercase tracking-wider">
              SUITE SPECIFICATIONS
            </p>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">
                Product Requirements Doc (PRD)
              </h4>
              <p className="text-[10.5px] text-white/80 leading-relaxed font-normal mt-1">
                Review or export complete architectural boundaries and functional specs for public screens and administration consoles.
              </p>
            </div>
            
            <div className="pt-1 flex gap-2 w-full">
              <button
                onClick={() => {
                  try {
                    const blob = new Blob([SYSTEM_PRD_DOCUMENT], { type: "text/markdown;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "RMA_CII_Product_Requirements_Document.md");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (e) {
                    console.error("Error compiling and downloading PRD", e);
                  }
                }}
                className="flex-1 py-2 bg-white text-slate-950 font-black rounded-lg text-[9.5px] uppercase tracking-wider cursor-pointer text-center inline-flex items-center justify-center gap-1 transition-all shadow-md font-mono"
              >
                <Download size={11} className="stroke-[2.5]" />
                Download PRD
              </button>
              
              <button
                onClick={() => onNavigateTab("prd-doc")}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white font-black rounded-lg text-[9.5px] uppercase tracking-wider cursor-pointer text-center inline-flex items-center justify-center gap-1 transition-all border border-white/25 font-mono"
              >
                <FileText size={11} />
                Open Document
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Bottom Section: Modern Activity Feeds & Live website checkins overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Activity Panel (Replacing the raw Terminal logs aesthetic on home) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4 text-left">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-sans">
              <Clock size={14} className="text-indigo-500" />
              SYSTEM ACTIVITY TIMELINE
            </h4>
            <button 
              onClick={() => onNavigateTab("activity")}
              className="text-[10px] font-black text-slate-450 hover:text-slate-800 uppercase cursor-pointer"
            >
              Audits View
            </button>
          </div>

          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {latestLogs.slice(0, 7).map((log, idx) => {
              const isSecurity = log.includes("[SECURITY]");
              const isSync = log.includes("[SYNC]") || log.includes("[REFRESH]");
              const isCheckin = log.includes("[CHECK-IN]");
              
              let badgeColor = "bg-slate-100 text-slate-700";
              let badgeText = "System";

              if (isSecurity) {
                badgeColor = "bg-rose-50 text-rose-700 border-rose-100 border";
                badgeText = "Security";
              } else if (isSync) {
                badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100 border";
                badgeText = "Database";
              } else if (isCheckin) {
                badgeColor = "bg-blue-50 text-blue-700 border-blue-100 border";
                badgeText = "Guestbook";
              }

              // Strip timestamps or codes if present to make clean human-readable entries
              const cleanLog = log.replace(/^📟\s*\[[^\]]+\]\s*/i, "")
                                  .replace(/^⚠️\s*\[[^\]]+\]\s*/i, "")
                                  .replace(/^🛡️\s*\[[^\]]+\]\s*/i, "")
                                  .replace(/^👥\s*\[[^\]]+\]\s*/i, "")
                                  .replace(/^🌐\s*\[[^\]]+\]\s*/i, "");

              return (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-slate-350 mt-1.5 relative z-10"></span>
                    {idx < 6 && <span className="w-[1.5px] h-full bg-slate-200 mt-1"></span>}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <span className="text-[10.5px] text-slate-800 font-semibold leading-normal">
                        {cleanLog}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Guestbook check-ins stream (Interactive overview) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4 text-left">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-sans animate-pulse">
              <span className="inline-block w-2.5 h-2.5 bg-[#2ECC71] rounded-full"></span>
              LIVE VISITOR GUESTBOOK STREAM
            </h4>
            <button 
              onClick={() => onNavigateTab("visitors-live")}
              className="text-[11px] font-black text-[#103D2E] hover:underline uppercase flex items-center gap-1 cursor-pointer"
            >
              Sign guestbook
              <ChevronRight size={12} />
            </button>
          </div>

          {visitorCheckins.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20 text-xs">
              No active website visitor signatures found. Submit checks using the Top Quick Actions to test.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {visitorCheckins.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-start gap-4 p-2.5 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="flex gap-2.5">
                    <span className="text-base">👋</span>
                    <div>
                      <p className="font-extrabold text-[#103D2E] text-xs shrink-0 flex items-center gap-1.5">
                        {item.name}
                        <span className="font-normal text-[9.5px] text-slate-400 font-mono uppercase">
                          ({item.deviceType.split(" - ")[0]})
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 italic">
                        &ldquo;{item.purpose}&rdquo;
                      </p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-mono text-slate-400 shrink-0 font-bold whitespace-nowrap">
                    {new Date(item.checkedInAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
