import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Plus, 
  Menu, 
  UserPlus, 
  Calendar, 
  Megaphone, 
  Terminal,
  Volume2,
  RefreshCw,
  Lock
} from "lucide-react";
import { getAdminWelcomeName } from "../lib/db";

interface AdminHeaderProps {
  activeTab: string;
  isSuperAdmin: boolean;
  currentEmail: string;
  currentAdminName?: string;
  onOpenMobileSidebar: () => void;
  onQuickCreateMember: () => void;
  onQuickCreateEvent: () => void;
  onQuickCreateAnnouncement: () => void;
  onToggleTerminal: () => void;
  onOpenChangePasswordModal?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function AdminHeader({
  activeTab,
  isSuperAdmin,
  currentEmail,
  currentAdminName,
  onOpenMobileSidebar,
  onQuickCreateMember,
  onQuickCreateEvent,
  onQuickCreateAnnouncement,
  onToggleTerminal,
  onOpenChangePasswordModal,
  searchQuery,
  setSearchQuery
}: AdminHeaderProps) {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncingState, setIsSyncingState] = useState(false);

  const updateSyncStatus = () => {
    try {
      const queueData = localStorage.getItem("rma_offline_sync_queue");
      const queueList = queueData ? JSON.parse(queueData) : [];
      setPendingSyncCount(queueList.length);
      setIsSyncingState(!!(window as any).__rma_is_syncing);
    } catch (e) {
      console.warn("Error checking sync queue count:", e);
    }
  };

  useEffect(() => {
    updateSyncStatus();
    
    // Listen to custom local storage/socket/dispatch sync events
    window.addEventListener("rma_registration_submitted", updateSyncStatus);
    window.addEventListener("rma_checkin_updated", updateSyncStatus);
    window.addEventListener("storage", updateSyncStatus);
    
    const interval = setInterval(updateSyncStatus, 4000);
    return () => {
      window.removeEventListener("rma_registration_submitted", updateSyncStatus);
      window.removeEventListener("rma_checkin_updated", updateSyncStatus);
      window.removeEventListener("storage", updateSyncStatus);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case "dashboard": return "OPERATIONAL OVERVIEW";
      case "reg-cii": return "CII REGISTRATION MANAGEMENT";
      case "reg-rma": return "RMA REGISTRATION MANAGEMENT";
      case "visitors-live": return "LIVE VISITOR MONITORING";
      case "visitors-analytics": return "WEBSITE TRAFFIC ANALYTICS";
      case "user-management": return "PLATFORM MEMBER ROSTER";
      case "security": return "ACCESS CONTROLS";
      case "activity": return "ACTIVITY TIMELINE";
      case "brand-cloner": return "BRAND & STANDALONE CLONER HUB";
      case "settings": return "SAAS PLATFORM SETTINGS";
      case "prd-doc": return "PRODUCT REQUIREMENTS DOCUMENT (PRD)";
      default: return "OPERATIONS CENTRE";
    }
  };

  const getBreadcrumbCategory = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboards";
      case "reg-cii": return "CII Registrations";
      case "reg-rma": return "RMA Operations";
      case "visitors-live": return "Telemetry Stream";
      case "visitors-analytics": return "Traffic Visualizers";
      case "user-management": return "Users";
      case "security": return "System Security";
      case "activity": return "Security Logs";
      case "brand-cloner": return "White-Label & Cloning";
      case "settings": return "Configuration";
      case "prd-doc": return "Documentation";
      default: return "Portal";
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-201 shadow-xs flex items-center justify-between px-4 sm:px-6 md:px-8 w-full">
      {/* Left section: Breadcrumbs and Mobile menu toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 -ml-1 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block text-left">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 font-sans tracking-wide uppercase">
            <span>Platform</span>
            <span className="text-slate-300">/</span>
            <span>{getBreadcrumbCategory()}</span>
          </div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight font-display mt-0.5 uppercase">
            {getBreadcrumb()}
          </h2>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registrations, names, locations..."
            className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl py-1.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-[#103D2E] focus:bg-white text-slate-800 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right section: Quick Create + Toggles + User Avatar */}
      <div className="flex items-center gap-3.5">
        
        {/* Dynamic Database Sync Indicator */}
        <button
          type="button"
          onClick={async () => {
            if (isSyncingState) return;
            setIsSyncingState(true);
            try {
              const { autoSyncFirestore } = await import("../lib/db");
              await autoSyncFirestore();
            } catch (e) {
              console.warn("Manual sync trigger error:", e);
            } finally {
              setIsSyncingState(false);
              updateSyncStatus();
            }
          }}
          disabled={isSyncingState}
          title={pendingSyncCount > 0 ? `Upload ${pendingSyncCount} pending offline action(s)` : "All registrations and operations cloud-synced"}
          className={`flex items-center gap-1.5 px-3 py-1 border rounded-xl cursor-pointer select-none transition-all duration-305 text-[10px] uppercase font-mono tracking-tight font-extrabold focus:outline-none ${
            isSyncingState 
              ? "bg-amber-50 text-amber-700 border-amber-200" 
              : pendingSyncCount > 0 
                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 animate-pulse font-black" 
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <RefreshCw 
            size={11} 
            className={`stroke-[3.5] ${isSyncingState ? "animate-spin text-amber-600" : pendingSyncCount > 0 ? "text-rose-600" : "text-[#2ECC71]"}`} 
          />
          <span className="hidden xs:inline">
            {isSyncingState 
              ? "Syncing..." 
              : pendingSyncCount > 0 
                ? `${pendingSyncCount} pending` 
                : "Cloud Synced"
            }
          </span>
        </button>

        {/* Terminal Toggle Button */}
        <button
          onClick={onToggleTerminal}
          title="Terminal Telemetry"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer relative"
        >
          <Terminal size={16} />
        </button>

        {/* Change Password Button */}
        {onOpenChangePasswordModal && (
          <button
            onClick={onOpenChangePasswordModal}
            title="Change Account Password"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer relative"
          >
            <Lock size={16} />
          </button>
        )}

        {/* Quick Create Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="px-3.5 py-1.5 bg-[#103D2E] hover:bg-[#082018] text-amber-300 hover:text-amber-200 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-990/10"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span className="hidden sm:inline">QUICK ACTIONS</span>
          </button>

          {/* Quick Create Dropdown Menu */}
          {isQuickCreateOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 text-left border-t-2 border-t-[#103D2E] animate-[fadeIn_0.15s_ease-out]">
              <div className="px-3 py-1 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono">
                Rapid Entry Menu
              </div>
              
              <button
                onClick={() => {
                  setIsQuickCreateOpen(false);
                  onQuickCreateMember();
                }}
                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#103D2E] flex items-center gap-2.5 cursor-pointer"
              >
                <UserPlus size={14} className="text-emerald-600" />
                Add Member Dossier
              </button>

              <button
                onClick={() => {
                  setIsQuickCreateOpen(false);
                  onQuickCreateEvent();
                }}
                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#103D2E] flex items-center gap-2.5 cursor-pointer"
              >
                <Calendar size={14} className="text-amber-500" />
                Register Check-In Entry
              </button>

              <button
                onClick={() => {
                  setIsQuickCreateOpen(false);
                  onQuickCreateAnnouncement();
                }}
                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#103D2E] flex items-center gap-2.5 cursor-pointer"
              >
                <Volume2 size={14} className="text-[#E76F51]" />
                Post Site Marquee Action
              </button>

              {onOpenChangePasswordModal && (
                <button
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    onOpenChangePasswordModal();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#103D2E] flex items-center gap-2.5 cursor-pointer border-t border-slate-100 mt-1 pt-2"
                >
                  <Lock size={14} className="text-slate-600" />
                  Change Password
                </button>
              )}
            </div>
          )}
        </div>

        {/* Compact Admin Badge */}
        <div
          className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl"
          title={currentEmail ? `Logged in as ${currentEmail}` : "Right Minds Africa"}
        >
          <span className="relative flex h-2 w-2 select-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]"></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-tight text-slate-700 truncate max-w-[160px]">
            {getAdminWelcomeName(currentEmail, currentAdminName)}
          </span>
        </div>

      </div>
    </header>
  );
}
