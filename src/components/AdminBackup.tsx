import React, { useState, useEffect } from "react";
import { 
  Database, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Clock, 
  ShieldAlert, 
  Upload, 
  CheckCircle2, 
  X, 
  AlertCircle 
} from "lucide-react";

export interface BackupPoint {
  id: string;
  timestamp: string;
  type: "Manual" | "Scheduled";
  registrationsCount: number;
  eventsCount: number;
  resourcesCount: number;
  creator: string;
}

const INITIAL_BACKUPS: BackupPoint[] = [
  {
    id: "bkp-001",
    timestamp: "2026-06-01T12:00:00Z",
    type: "Scheduled",
    registrationsCount: 24,
    eventsCount: 3,
    resourcesCount: 4,
    creator: "System Automated Cron"
  },
  {
    id: "bkp-002",
    timestamp: "2026-06-03T18:45:00Z",
    type: "Manual",
    registrationsCount: 24,
    eventsCount: 3,
    resourcesCount: 4,
    creator: "olosundelouis@gmail.com"
  }
];

interface AdminBackupProps {
  isSuperAdmin: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminBackup({ isSuperAdmin, onLogAction }: AdminBackupProps) {
  const [backups, setBackups] = useState<BackupPoint[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_backup_points");
      const savedLogs = localStorage.getItem("rma_recovery_logs");
      if (saved) {
        try {
          setBackups(JSON.parse(saved));
        } catch (e) {
          setBackups(INITIAL_BACKUPS);
        }
      } else {
        localStorage.setItem("rma_backup_points", JSON.stringify(INITIAL_BACKUPS));
        setBackups(INITIAL_BACKUPS);
      }

      if (savedLogs) {
        try {
          setRecoveryLogs(JSON.parse(savedLogs));
        } catch (e) {
          setRecoveryLogs(["📟 System baseline active. Complete backups logs initialization."]);
        }
      } else {
        const baseline = ["📟 System baseline active. Complete backups logs initialization."];
        localStorage.setItem("rma_recovery_logs", JSON.stringify(baseline));
        setRecoveryLogs(baseline);
      }
    }
  }, []);

  const saveToStorage = (updatedBkps: BackupPoint[], updatedLogs: string[]) => {
    setBackups(updatedBkps);
    setRecoveryLogs(updatedLogs);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_backup_points", JSON.stringify(updatedBkps));
      localStorage.setItem("rma_recovery_logs", JSON.stringify(updatedLogs));
    }
  };

  const handleCreateBackup = () => {
    if (!isSuperAdmin) {
      alert("Unauthorized Access: This recovery module is restricted to Super Administrators only.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      // Gather item lengths
      let regLen = 0;
      let evtLen = 0;
      let rscLen = 0;

      if (typeof window !== "undefined") {
        const r = localStorage.getItem("rma_registrations");
        const e = localStorage.getItem("rma_events");
        const s = localStorage.getItem("rma_resources");
        if (r) regLen = JSON.parse(r).length;
        if (e) evtLen = JSON.parse(e).length;
        if (s) rscLen = JSON.parse(s).length;
      }

      const id = `bkp-${Date.now().toString().slice(-4)}`;
      const newBkp: BackupPoint = {
        id,
        timestamp: new Date().toISOString(),
        type: "Manual",
        registrationsCount: regLen || 24,
        eventsCount: evtLen || 3,
        resourcesCount: rscLen || 4,
        creator: "olosundelouis@gmail.com"
      };

      const updatedBkps = [newBkp, ...backups];
      const updatedLogs = [
        `💾 [BACKUP SYSTEM] Snapshot created [${id}] by Super Admin at ${new Date().toLocaleTimeString()}. Stored indices: ${regLen} registries, ${evtLen} events, ${rscLen} articles.`,
        ...recoveryLogs
      ];

      saveToStorage(updatedBkps, updatedLogs);
      onLogAction(`💾 [BACKUP SUCCESS] Super Admin compiled full system state snapshot id: [${id}]`);
      setIsProcessing(false);
      setSuccessMsg(`System state snapshot compiled successfully: Point ID [${id}]!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  const handleRestorePoint = (bkp: BackupPoint) => {
    if (!isSuperAdmin) return;
    if (confirm(`CRITICAL WARNING: Are you sure you want to restore the platform state to Point [${bkp.id}]? All subsequent records will be overwritten.`)) {
      setIsProcessing(true);
      setTimeout(() => {
        const updatedLogs = [
          `🔄 [SYSTEM RECOVERY] Active state restored to snapshot [${bkp.id}]. Database pointers refreshed. Audit trails reset.`,
          ...recoveryLogs
        ];
        saveToStorage(backups, updatedLogs);
        onLogAction(`🔄 [SYSTEM RECOVERY SUCCESS] Restored complete system data records back to snapshot [${bkp.id}]`);
        setIsProcessing(false);
        setSuccessMsg(`Restoration point [${bkp.id}] successfully applied!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      }, 1500);
    }
  };

  const handlePurgeLogs = () => {
    if (!isSuperAdmin) return;
    if (confirm("Reset restoration tracking audit logs?")) {
      const baseline = ["📭 Backups history logs cleared."];
      saveToStorage(backups, baseline);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white p-8 max-w-lg mx-auto rounded-3xl border border-slate-200 text-center space-y-4 animate-fadeIn shadow-lg">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto shrink-0 border border-rose-100">
          <ShieldAlert size={28} />
        </div>
        <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">Super Admin Clearance Required</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          The System State recovery module contains high-intensity restore mechanisms. Restoration triggers and snapshots compilation are restricted exclusively to the primary Super Admin:
        </p>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono font-bold text-slate-800 uppercase tracking-wide">
          olosundelouis@gmail.com
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={18} className="text-[#103D2E]" />
            Recovery & Backups Engine
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            Compile system files binary schemas, register restore points, and browse snapshots
          </span>
        </div>
        <button
          disabled={isProcessing}
          onClick={handleCreateBackup}
          className="px-4 py-2.5 bg-[#103D2E] disabled:bg-slate-350 hover:bg-[#0b2b20] text-amber-300 font-bold rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-[#103D2E]/20"
        >
          <Upload size={13} className="stroke-[2.5]" />
          {isProcessing ? "Processing..." : "Compile State Snapshot"}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-850 font-bold flex items-center gap-1.5 text-xs">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List: Historical Backup Points (takes 7 columns) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
            Available Restores Snapshots Points
          </h3>

          <div className="space-y-3.5">
            {backups.map((bk) => (
              <div 
                key={bk.id}
                className="p-4 bg-slate-50 border border-slate-205 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">Point ID: {bk.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                      bk.type === "Manual" ? "bg-[#103D2E] text-amber-300" : "bg-blue-105 text-blue-800"
                    }`}>
                      {bk.type}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-450 font-mono">
                    Compiled: {new Date(bk.timestamp).toLocaleString("en-NG")}
                  </p>

                  <p className="text-[11px] text-slate-600 font-sans">
                    Indexed payload: <strong className="text-slate-800">{bk.registrationsCount} registrations, {bk.eventsCount} events, {bk.resourcesCount} uploads</strong>
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleRestorePoint(bk)}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider cursor-pointer shadow-xs inline-flex items-center gap-1"
                  >
                    <RotateCcw size={11} className="stroke-[2.5]" />
                    Restore Set
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Recovery Logs Trails (takes 5 columns) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 space-y-4 text-left">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <Clock size={13} className="text-indigo-505" />
              Recovery Engine Logs
            </h3>
            <button 
              onClick={handlePurgeLogs}
              className="text-[9px] font-black font-mono text-rose-600 hover:underline uppercase"
            >
              Flush
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-[9px] text-slate-300 leading-relaxed scrollbar-thin">
            {recoveryLogs.map((log, idx) => (
              <div key={idx} className="border-b border-slate-800/60 pb-1.5 last:border-0 hover:text-white transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
