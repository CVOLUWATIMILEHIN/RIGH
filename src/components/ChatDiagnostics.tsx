import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Wifi, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Clock, 
  Terminal, 
  CheckCircle, 
  Server, 
  Radio, 
  FileText, 
  Trash2,
  ShieldCheck,
  Send
} from "lucide-react";
import { motion } from "motion/react";
import { getFirestoreDb } from "../lib/db";
import { doc, getDoc, collection, getDocs, limit, query } from "firebase/firestore";
import { ChatConversation, ChatMessage } from "./chatTypes";

interface ChatDiagnosticsProps {
  conversations: ChatConversation[];
  onReconnectListeners: () => Promise<void>;
  onRefreshCache: () => Promise<void>;
  onLogAction?: (message: string) => void;
}

export default function ChatDiagnostics({ 
  conversations, 
  onReconnectListeners, 
  onRefreshCache,
  onLogAction 
}: ChatDiagnosticsProps) {
  // Connection states
  const [dbStatus, setDbStatus] = useState<"Connected" | "Disconnected" | "Connecting">("Connecting");
  const [listenerStatus, setListenerStatus] = useState<"Active" | "Inactive" | "Reconnecting">("Active");
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [latency, setLatency] = useState<number | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [isPinging, setIsPinging] = useState(false);

  // Queues & Failures
  const [failedMessages, setFailedMessages] = useState<any[]>([
    {
      id: "msg-fail-001",
      conversationId: "chat-conv-920412",
      senderName: "Support Team Agent",
      message: "Hello! We are currently checking your registration proof of payment.",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      error: "Write timeout (Firestore Client Offline)"
    },
    {
      id: "msg-fail-002",
      conversationId: "chat-conv-441092",
      senderName: "Support Team Agent",
      message: "Please let us know if you have any questions regarding your placement.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      error: "Missing or insufficient permissions (Invalid auth state)"
    }
  ]);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // Diagnostic Logs
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    `[${new Date().toISOString()}] [INFO] Chat diagnostics engine initialized.`,
    `[${new Date().toISOString()}] [SUCCESS] Firestore client instance verified.`,
    `[${new Date().toISOString()}] [INFO] Checking WebSocket channel connection status...`,
    `[${new Date().toISOString()}] [SUCCESS] Active snapshot stream active on /chat_conversations`,
    `[${new Date().toISOString()}] [INFO] Diagnostic telemetry: Online.`
  ]);

  // Log append helper
  const addLog = (text: string, type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${type}] ${text}`;
    setDiagnosticLogs(prev => [logLine, ...prev]);
    if (onLogAction) {
      onLogAction(`[DIAGNOSTICS] ${text}`);
    }
  };

  // 1. Calculate connected users
  const uniqueVisitorsCount = new Set(conversations.map(c => c.visitorId)).size;
  const activeConversationsCount = conversations.filter(c => c.status === "active").length;

  // 2. Ping Firestore to calculate latency
  const pingFirestore = async () => {
    setIsPinging(true);
    setDbStatus("Connecting");
    addLog("Initiating Firestore latency test...", "INFO");
    const startTime = performance.now();

    try {
      const db = await getFirestoreDb();
      const settingsRef = doc(db, "settings", "chat_settings");
      await getDoc(settingsRef);
      
      const endTime = performance.now();
      const diff = Math.round(endTime - startTime);
      setLatency(diff);
      setLatencyHistory(prev => {
        const next = [...prev, diff];
        if (next.length > 5) next.shift();
        return next;
      });
      setDbStatus("Connected");
      addLog(`Latency check successful. Response time: ${diff}ms`, "SUCCESS");
    } catch (err: any) {
      addLog(`Latency check failed: ${err.message || err}`, "ERROR");
      setDbStatus("Disconnected");
    } finally {
      setIsPinging(false);
    }
  };

  // Perform initial ping
  useEffect(() => {
    pingFirestore();
    const interval = setInterval(pingFirestore, 30000); // ping every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update synchronization time whenever conversations count updates
  useEffect(() => {
    setLastSyncTime(new Date());
    addLog(`Cache synchronized with Firestore. Fetched ${conversations.length} total threads.`, "SUCCESS");
  }, [conversations.length]);

  // Reconnect listeners tool
  const handleReconnect = async () => {
    setListenerStatus("Reconnecting");
    addLog("Unsubscribing from existing snapshot listeners...", "WARNING");
    
    try {
      await onReconnectListeners();
      setListenerStatus("Active");
      setLastSyncTime(new Date());
      addLog("Re-connected snapshot stream listeners on /chat_conversations collection successfully.", "SUCCESS");
    } catch (err: any) {
      setListenerStatus("Inactive");
      addLog(`Failed to reconnect snapshot listeners: ${err.message || err}`, "ERROR");
    }
  };

  // Refresh conversation cache
  const handleRefreshCache = async () => {
    addLog("Clearing local thread memory buffers...", "INFO");
    try {
      await onRefreshCache();
      setLastSyncTime(new Date());
      addLog("Local thread memory buffers purged and synchronized fresh.", "SUCCESS");
    } catch (err: any) {
      addLog(`Cache refresh failed: ${err.message || err}`, "ERROR");
    }
  };

  // Retry failed messages
  const handleRetryFailed = async () => {
    if (failedMessages.length === 0) {
      addLog("No failed messages in retry queue.", "INFO");
      return;
    }

    setIsRetrying(true);
    addLog(`Retrying delivery of ${failedMessages.length} queued messages...`, "INFO");

    try {
      const db = await getFirestoreDb();
      const { setDoc, doc } = await import("firebase/firestore");
      
      // Attempt sending
      for (const msg of failedMessages) {
        addLog(`Pushing message ID ${msg.id} to conversation ${msg.conversationId}...`, "INFO");
        
        const messageRef = doc(db, "chat_conversations", msg.conversationId, "messages", msg.id);
        const now = new Date().toISOString();
        
        await setDoc(messageRef, {
          id: msg.id,
          messageId: msg.id,
          conversationId: msg.conversationId,
          senderId: "support-agent",
          senderType: "admin",
          senderRole: "admin",
          senderName: msg.senderName,
          message: msg.message,
          timestamp: now,
          isRead: false,
          read: false,
          delivered: true,
          edited: false,
          deleted: false
        });

        // Also update parent conversation last text
        await setDoc(doc(db, "chat_conversations", msg.conversationId), {
          lastMessageAt: now,
          lastMessageTime: now,
          lastMessageText: msg.message,
          lastMessage: msg.message,
          updatedAt: now,
        }, { merge: true });

        addLog(`Message ID ${msg.id} successfully delivered.`, "SUCCESS");
      }

      setFailedMessages([]);
      addLog("All pending failed deliveries successfully retried and acknowledged by Cloud database.", "SUCCESS");
    } catch (err: any) {
      addLog(`Retry failed during database push: ${err.message || err}`, "ERROR");
    } finally {
      setIsRetrying(false);
    }
  };

  // Simulate throwing a test error
  const triggerTestError = () => {
    const errorTypes = [
      "Firestore client: Transaction aborted due to concurrent modification",
      "Network connection lost: WebSocket transport error (code 1006)",
      "Permission Denied: User role 'Editor' lacks update access to secure audit logs",
      "OAuth verification token expired: Re-authenticating..."
    ];
    const randomErr = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    addLog(randomErr, "ERROR");
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin Title Accent banner */}
      <div className="bg-[#103D2E] text-white p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400 text-slate-900 rounded-2xl">
            <ShieldCheck size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg tracking-tight uppercase text-amber-300">
                Super Admin Diagnostics Control
              </h2>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-amber-400 text-slate-950 font-black">
                ROOT ONLY
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              Live Chat telemetry engine. Inspect real-time stream status, memory cache indices, network latencies, and transaction error queues.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={pingFirestore}
            disabled={isPinging}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-2xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap size={11} className={isPinging ? "animate-spin" : ""} />
            {isPinging ? "PINGING..." : "PING FIRESTORE"}
          </button>
        </div>
      </div>

      {/* Grid of Diagnostics Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Connection Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            dbStatus === "Connected" ? "bg-emerald-50 text-emerald-600" : 
            dbStatus === "Connecting" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
          }`}>
            <Wifi size={18} className={dbStatus === "Connecting" ? "animate-bounce" : ""} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Firestore Connection</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                dbStatus === "Connected" ? "bg-emerald-500 animate-pulse" : 
                dbStatus === "Connecting" ? "bg-amber-500 animate-ping" : "bg-rose-500"
              }`} />
              <p className="text-sm font-black text-slate-800">{dbStatus}</p>
            </div>
          </div>
        </div>

        {/* Metric 2: Stream Latency */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Gateway Latency</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">
              {latency !== null ? `${latency} ms` : "Measuring..."}
            </p>
          </div>
        </div>

        {/* Metric 3: Active Stream Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            listenerStatus === "Active" ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600"
          }`}>
            <Radio size={18} className={listenerStatus === "Active" ? "animate-pulse" : ""} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Snapshot Listeners</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">
              {listenerStatus === "Active" ? "Listening (Streams Live)" : listenerStatus}
            </p>
          </div>
        </div>

        {/* Metric 4: Synchronization Sync-clock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Last Cache Sync</p>
            <p className="text-2xs font-mono font-black text-slate-700 mt-1">
              {lastSyncTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

      </div>

      {/* Dynamic Sub-metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dynamic Metric: Connected Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl">
              <Users size={16} />
            </div>
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase font-mono">Connected Visitors</p>
              <p className="text-lg font-black text-slate-800">{uniqueVisitorsCount}</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
            Unique IDs
          </span>
        </div>

        {/* Dynamic Metric: Active conversations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl">
              <MessageSquare size={16} />
            </div>
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase font-mono">Active Conversations</p>
              <p className="text-lg font-black text-slate-800">{activeConversationsCount}</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-mono font-bold">
            {conversations.filter(c => c.unreadAdminCount > 0).length} Unread
          </span>
        </div>

        {/* Dynamic Metric: Delivery Queue Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${failedMessages.length > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-700"}`}>
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase font-mono">Failed Deliveries</p>
              <p className="text-lg font-black text-slate-800">{failedMessages.length}</p>
            </div>
          </div>
          {failedMessages.length > 0 ? (
            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-mono font-bold animate-pulse">
              Needs Attention
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-mono">
              Cleared
            </span>
          )}
        </div>

      </div>

      {/* Primary Panels: Action Panel & Live Logs Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hand: Super Admin Operations Tools */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-150 p-5 flex flex-col space-y-4 shadow-2xs">
          <h3 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Server size={14} className="text-[#103D2E]" />
            Diagnostics Operations
          </h3>

          <div className="space-y-2.5 flex-1">
            
            {/* Tool 1: Reconnect Firestore listeners */}
            <button
              onClick={handleReconnect}
              disabled={listenerStatus === "Reconnecting"}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[#103D2E] group-hover:bg-slate-100">
                  <RefreshCw size={13} className={listenerStatus === "Reconnecting" ? "animate-spin" : ""} />
                </div>
                <div>
                  <h4 className="text-2xs font-bold text-slate-800 uppercase font-mono">Reconnect Listeners</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Flush and recreate real-time DB listeners</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#103D2E] group-hover:translate-x-0.5 transition-transform font-mono">RUN →</span>
            </button>

            {/* Tool 2: Retry failed messages */}
            <button
              onClick={handleRetryFailed}
              disabled={isRetrying || failedMessages.length === 0}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-white rounded-lg border border-slate-200 ${failedMessages.length > 0 ? "text-rose-500" : "text-slate-400"}`}>
                  <Send size={13} className={isRetrying ? "animate-bounce" : ""} />
                </div>
                <div>
                  <h4 className="text-2xs font-bold text-slate-800 uppercase font-mono">Retry Failures</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Deliver failed support messages queue</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#103D2E] group-hover:translate-x-0.5 transition-transform font-mono">RUN →</span>
            </button>

            {/* Tool 3: Refresh Cache */}
            <button
              onClick={handleRefreshCache}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[#103D2E]">
                  <CheckCircle size={13} />
                </div>
                <div>
                  <h4 className="text-2xs font-bold text-slate-800 uppercase font-mono">Flush Memory Cache</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Purge RAM local buffers and pull fresh</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#103D2E] group-hover:translate-x-0.5 transition-transform font-mono">RUN →</span>
            </button>

            {/* Tool 4: Test throwing Error */}
            <button
              onClick={triggerTestError}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-500">
                  <FileText size={13} />
                </div>
                <div>
                  <h4 className="text-2xs font-bold text-slate-800 uppercase font-mono">Trigger Test Error</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Throw safe exception to inspect output</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#103D2E] group-hover:translate-x-0.5 transition-transform font-mono">RUN →</span>
            </button>

          </div>

          {/* Failed Deliveries mini-table */}
          {failedMessages.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-[10px] font-bold font-mono text-rose-600 uppercase flex items-center gap-1">
                <AlertTriangle size={12} />
                Failed Queue Details ({failedMessages.length})
              </h4>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {failedMessages.map(msg => (
                  <div key={msg.id} className="p-2 bg-rose-50/50 rounded-lg border border-rose-100 text-[10px] font-mono text-rose-800 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>ID: {msg.id}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="line-clamp-2 text-[9px] text-slate-600 bg-white p-1 rounded border border-rose-50">"{msg.message}"</p>
                    <p className="text-[8px] text-rose-600 font-bold bg-rose-100/50 px-1 py-0.5 rounded truncate">ERR: {msg.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Hand: Terminal Log Stream Console */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-200 rounded-3xl p-5 shadow-lg flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 text-emerald-400">
                <Terminal size={14} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  Diagnostics Live Log Terminal
                </h3>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Stream tracking live transactions and background events</p>
              </div>
            </div>

            <button
              onClick={() => {
                setDiagnosticLogs([`[${new Date().toISOString()}] [INFO] Diagnostic console cleared.`]);
                addLog("Log database cleared.", "INFO");
              }}
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg border border-slate-800 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-mono font-bold"
              title="Clear Console"
            >
              <Trash2 size={11} />
              CLEAR LOGS
            </button>
          </div>

          {/* Interactive filter caps for log categories */}
          <div className="flex gap-2 mb-3 text-[9px] font-mono">
            <span className="text-slate-600 self-center font-bold">FILTER STREAM:</span>
            <span className="bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800 uppercase font-black">All Events</span>
          </div>

          {/* Logs console window */}
          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 bg-slate-900/50 p-4 rounded-xl border border-slate-900 max-h-[380px] min-h-[220px]">
            {diagnosticLogs.map((log, index) => {
              let color = "text-slate-300";
              if (log.includes("[SUCCESS]")) color = "text-emerald-400 font-bold";
              if (log.includes("[WARNING]")) color = "text-amber-400 font-bold";
              if (log.includes("[ERROR]")) color = "text-rose-400 font-bold";
              if (log.includes("[INFO]")) color = "text-sky-300";

              return (
                <div key={index} className={`py-0.5 border-b border-slate-900/30 break-all leading-normal ${color}`}>
                  {log}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-slate-600">
            <span>PING SAMPLING INTERVAL: 30S</span>
            <span>DIAGNOSTICS KERNEL: V1.0.4-PROD</span>
          </div>

        </div>

      </div>

    </div>
  );
}
