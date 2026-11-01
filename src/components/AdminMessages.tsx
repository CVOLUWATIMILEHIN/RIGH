import React, { useState, useEffect } from "react";
import { 
  getContactMessages, saveContactMessage, deleteContactMessage, ContactMessage 
} from "../lib/db";
import { 
  Mail, Trash2, CheckCircle2, MessageSquare, Clock, Filter, 
  Search, Reply, FileText, ChevronRight, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminMessagesProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminMessages({ hasWriteAccess, onLogAction }: AdminMessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "replied">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const list = await getContactMessages();
      setMessages(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    const handleUpdate = () => {
      fetchMessages();
    };
    window.addEventListener("rma_contact_messages_updated", handleUpdate);
    return () => window.removeEventListener("rma_contact_messages_updated", handleUpdate);
  }, []);

  useEffect(() => {
    let result = [...messages];

    if (statusFilter !== "all") {
      result = result.filter(m => m.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m => 
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }

    setFilteredMessages(result);
  }, [messages, searchQuery, statusFilter]);

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setAdminNote(msg.notes || "");
    
    if (msg.status === "unread" && hasWriteAccess) {
      const updated: ContactMessage = { ...msg, status: "read" };
      try {
        await saveContactMessage(updated);
        setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
        onLogAction(`📨 [MESSAGES] Mark message from ${msg.name} as read.`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage || !hasWriteAccess) return;
    const updated: ContactMessage = { ...selectedMessage, notes: adminNote };
    try {
      await saveContactMessage(updated);
      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updated : m));
      setSelectedMessage(updated);
      setFeedback("Admin follow-up note saved successfully.");
      onLogAction(`📝 [MESSAGES] Saved admin note on message from ${selectedMessage.name}.`);
      setTimeout(() => setFeedback(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkReplied = async () => {
    if (!selectedMessage || !hasWriteAccess) return;
    const updated: ContactMessage = { ...selectedMessage, status: "replied" };
    try {
      await saveContactMessage(updated);
      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updated : m));
      setSelectedMessage(updated);
      onLogAction(`✉️ [MESSAGES] Set status to replied for message from ${selectedMessage.name}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasWriteAccess) return;
    if (confirm("Are you sure you want to permanently delete this message?")) {
      try {
        await deleteContactMessage(id);
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        onLogAction(`🗑️ [MESSAGES] Removed message entry ID: ${id}`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const unreadCount = messages.filter(m => m.status === "unread").length;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-[#103D2E]" />
            Official Contact Mailbox & Registry
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            Monitor real-time direct user messages, track read/replied states, attach follow-up notes, and correspond directly via mail
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-lg text-2xs font-extrabold font-mono uppercase animate-pulse">
              {unreadCount} Unread Message{unreadCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={fetchMessages}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition duration-150 text-slate-600 cursor-pointer"
            title="Refresh Box"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List Area (Left) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search mail directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none text-2xs font-semibold"
              />
            </div>
            
            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none text-2xs font-black uppercase text-slate-600"
            >
              <option value="all">📧 All Messages</option>
              <option value="unread">🔴 Unread</option>
              <option value="read">🟡 Read</option>
              <option value="replied">🟢 Replied</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-2xs font-mono">Querying mail logs trail from Firestore...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-2xs font-mono">No contact submissions found matching filters.</div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-start gap-3 ${
                      isSelected 
                        ? "bg-[#103D2E]/5 border-[#103D2E] shadow-xs" 
                        : "bg-white border-slate-150 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {msg.status === "unread" && (
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 animate-ping" />
                        )}
                        <span className={`text-2xs truncate block ${msg.status === "unread" ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>
                          {msg.name}
                        </span>
                      </div>
                      <span className={`text-[11px] block truncate ${msg.status === "unread" ? "font-extrabold text-slate-950" : "font-medium text-slate-500"}`}>
                        {msg.subject}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Clock size={10} />
                        {new Date(msg.timestamp).toLocaleDateString("en-NG", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase border shrink-0 ${
                      msg.status === "replied" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : msg.status === "read" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-red-50 text-red-700 border-red-250"
                    }`}>
                      {msg.status}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message View Area (Right) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-6 flex flex-col justify-between h-full min-h-[450px]"
              >
                <div className="space-y-4">
                  {/* Message Header */}
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-900 tracking-tight">{selectedMessage.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400 select-all font-bold block mt-0.5">{selectedMessage.email}</span>
                      <p className="text-2xs font-extrabold text-slate-700 mt-2">Subject: {selectedMessage.subject}</p>
                    </div>
                    {hasWriteAccess && (
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded-lg transition cursor-pointer"
                        title="Delete Message"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 leading-relaxed text-slate-800 text-xs font-medium whitespace-pre-wrap select-text">
                    {selectedMessage.message}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject)}`}
                      onClick={handleMarkReplied}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-2xs uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Reply size={11} />
                      Reply via Email Client
                    </a>
                    {selectedMessage.status !== "replied" && hasWriteAccess && (
                      <button
                        onClick={handleMarkReplied}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-xl text-2xs uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={11} />
                        Mark as Replied
                      </button>
                    )}
                  </div>
                </div>

                {/* Follow-up Notes Panel */}
                <div className="space-y-3 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 mt-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <FileText size={12} />
                    Internal Administration Follow-Up Notes
                  </h4>
                  
                  {feedback && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded-lg text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      {feedback}
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder="E.g. Assigned this ticket to Kaduna Hub lead. Standard partner dossier requested..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    disabled={!hasWriteAccess}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#103D2E]/40 rounded-xl outline-none text-2xs font-semibold leading-relaxed resize-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  {hasWriteAccess && (
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 rounded-xl text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                    >
                      Save Admin Note
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl h-full min-h-[450px] flex flex-col items-center justify-center text-center p-8">
                <Mail size={36} className="text-slate-300 mb-3" />
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">No Message Selected</h3>
                <p className="text-[10.5px] text-slate-450 mt-1 max-w-xs leading-normal">
                  Select an inbound message from the left folder catalog directory to inspect client communications, attach private annotations, or dispatch direct answers.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
