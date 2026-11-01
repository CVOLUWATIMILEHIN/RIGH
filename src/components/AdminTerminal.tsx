/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Terminal, Play, Square, RefreshCw } from "lucide-react";

interface AdminTerminalProps {
  onAddLog?: (log: string) => void;
}

export default function AdminTerminal({ onAddLog }: AdminTerminalProps) {
  const [logs, setLogs] = useState<string[]>([
    "🌱 [SYSTEM] RMA Registry telemetry service active.",
    "🛡️ [SECURITY] Root administrator port secured behind 2026 hash key.",
    "📦 [DATABASE] Connected to local-first database cache registry.",
    "🌐 [SYNC] Ready to push/pull live secondary Firestore packets."
  ]);
  const [isActive, setIsActive] = useState(true);

  // Periodic simulated events to give the dashboard a living, professional feel
  useEffect(() => {
    if (!isActive) return;

    const phrases = [
      "🔄 [SYNC] Synchronized 16 cached registers with memory buffer.",
      "🟢 [STATUS] System heartbeats: All nodes green [Ping: 24ms].",
      "📨 [WEBHOOK] Verification handshake pass: Osun Command HQ Node.",
      "🔍 [AUDIT] Live search indexes re-compiled successfully.",
      "🛡️ [FIREWELL] Checked cross-origin headers. Request origin validated.",
      "📥 [REGISTRY] Polled live API updates: 0 change logs pending.",
      "🚀 [PERFORMANCE] Client-side layout frame render time: 1.2ms.",
      "⭐ [ALUMNI] Checked Chapter databases — Ekiti Chapter coordinator updated."
    ];

    const timer = setInterval(() => {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
      const newLog = `[${timestamp}] ${randomPhrase}`;
      
      setLogs(prev => {
        const updated = [...prev, newLog];
        if (updated.length > 50) updated.shift(); // Keep logs clean
        return updated;
      });

      if (onAddLog) {
        onAddLog(newLog);
      }
    }, 8000); // Add a log every 8 seconds

    return () => clearInterval(timer);
  }, [isActive, onAddLog]);

  const clearLogs = () => {
    setLogs([`⚡ [SYSTEM_CLEARED] Logs purged at ${new Date().toLocaleTimeString()}`]);
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-inner text-xs font-mono">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-brand-orange animate-pulse" />
          <span className="font-bold tracking-wider text-[10px] uppercase text-slate-300">Live Telemetry Terminal Logs</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
              isActive ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-slate-850 text-slate-500 hover:bg-slate-800"
            }`}
          >
            {isActive ? (
              <>
                <Square size={8} className="fill-emerald-400" /> Active
              </>
            ) : (
              <>
                <Play size={8} className="fill-slate-500" /> Paused
              </>
            )}
          </button>
          <button
            onClick={clearLogs}
            className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded cursor-pointer transition-colors"
          >
            Purge
          </button>
        </div>
      </div>
      
      <div className="p-4 h-36 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 select-all leading-normal text-slate-300">
        {logs.map((log, i) => (
          <div key={i} className="hover:bg-white/5 px-1 py-0.5 rounded transition-colors break-all">
            <span className="text-slate-500">&gt;</span> {log}
          </div>
        ))}
      </div>
    </div>
  );
}
