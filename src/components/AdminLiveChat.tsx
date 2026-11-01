import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Settings, 
  Search, 
  Users, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Download, 
  UserCheck, 
  Play, 
  Send, 
  Paperclip, 
  AlertTriangle, 
  Save,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  X,
  FileDown,
  Activity
} from "lucide-react";
import { getFirestoreDb } from "../lib/db";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch,
  getDocs
} from "firebase/firestore";
import { ChatSettings, ChatConversation, ChatMessage } from "./chatTypes";
import ChatDiagnostics from "./ChatDiagnostics";

const DEFAULT_SETTINGS: ChatSettings = {
  id: "chat_settings",
  whatsappNumber: "+2348039809016",
  whatsappMessage: "Hello Right Minds Africa,\n\nI would like to make an enquiry.",
  whatsappEnabled: true,
  liveChatEnabled: true,
  officeHours: "9:00 AM - 5:00 PM (GMT+1)",
  autoReplyMessage: "Hello 👋\n\nWelcome to Right Minds Africa. An administrator will be with you shortly.",
  chatPosition: "bottom-right",
  chatTheme: "#103D2E",
  supportEmail: "info@rightmindsafrica.org",
  adminStatus: "online"
};

interface AdminLiveChatProps {
  hasWriteAccess: boolean;
  onLogAction: (message: string) => void;
}

export default function AdminLiveChat({ hasWriteAccess, onLogAction }: AdminLiveChatProps) {
  const [activeSubTab, setActiveSubTab] = useState<"conversations" | "settings" | "diagnostics">("conversations");
  
  // Settings State
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Conversations State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed" | "resolved">("active");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "mine" | "unassigned">("all");
  const [sortBy, setSortBy] = useState<"recent" | "unread" | "open" | "closed" | "resolved">("recent");

  const [currentUserEmail, setCurrentUserEmail] = useState("admin@rightmindsafrica.org");
  const [currentAdminUser, setCurrentAdminUser] = useState<any | null>(null);
  const [listenerTriggerCount, setListenerTriggerCount] = useState(0);
  const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Quick reply options
  const QUICK_REPLIES = [
    "Hello! How can I assist you today? 😊",
    "Thank you for contacting Right Minds Africa Hub. Let me look into that for you.",
    "Could you please share your registration reference number?",
    "Our NYSC career development programs are currently enrolling. Would you like a link?",
    "We have received your payment proof! It will be verified within 2 hours.",
    "Is there anything else I can help you with today?"
  ];

  // 1. Fetch current admin email and role from session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("rma_admin_session");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.email) {
            setCurrentUserEmail(parsed.email);
          }
        } catch (e) {
          // Quiet fallback
        }
      }
      
      const savedUser = localStorage.getItem("rma_current_logged_in_user");
      if (savedUser) {
        try {
          setCurrentAdminUser(JSON.parse(savedUser));
        } catch (e) {
          // Quiet fallback
        }
      }
    }
  }, []);

  // 2. Sync Chat Settings
  useEffect(() => {
    let unsubscribe = () => {};
    const initSettings = async () => {
      try {
        if (typeof window !== "undefined" && ((window as any).__rma_firestore_disabled || localStorage.getItem("rma_firestore_disabled") === "true")) {
          return;
        }
        const db = await getFirestoreDb();
        const settingsRef = doc(db, "settings", "chat_settings");
        
        unsubscribe = onSnapshot(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as ChatSettings;
            if (data.whatsappNumber === "+2348000000000") {
              // Migrate database config to the new requested number automatically
              updateDoc(settingsRef, { whatsappNumber: "+2348039809016" }).catch((e) => {
                console.warn("Failed to auto-migrate whatsappNumber in admin database:", e);
              });
              setSettings({ ...data, whatsappNumber: "+2348039809016" });
            } else {
              setSettings(data);
            }
          } else {
            setDoc(settingsRef, DEFAULT_SETTINGS).then(() => {
              setSettings(DEFAULT_SETTINGS);
            }).catch(e => console.warn("Failed seeding settings in admin:", e));
          }
        });
      } catch (err) {
        console.warn("Settings snap loading failed:", err);
      }
    };

    initSettings();
    return () => unsubscribe();
  }, [listenerTriggerCount]);

  // 3. Sync Conversations List
  useEffect(() => {
    let isMounted = true;
    let unsubSnapshot: (() => void) | null = null;

    const initConversations = async () => {
      try {
        if (typeof window !== "undefined" && ((window as any).__rma_firestore_disabled || localStorage.getItem("rma_firestore_disabled") === "true")) {
          if (isMounted) setIsConversationsLoaded(true);
          return;
        }
        const db = await getFirestoreDb();
        if (!isMounted) return;

        const convsQuery = query(
          collection(db, "chat_conversations"),
          orderBy("lastMessageAt", "desc")
        );

        unsubSnapshot = onSnapshot(convsQuery, (snapshot) => {
          if (!isMounted) return;
          const loadedConvs: ChatConversation[] = [];
          snapshot.forEach((d) => {
            loadedConvs.push(d.data() as ChatConversation);
          });
          setConversations(loadedConvs);
          setIsConversationsLoaded(true);

          // Update active selected conversation if it changes remotely
          if (selectedConv) {
            const updated = loadedConvs.find(c => c.id === selectedConv.id);
            if (updated) {
              setSelectedConv(updated);
            }
          }
        }, (err) => {
          console.warn("Conversations list listener notice:", err);
          if (isMounted) setIsConversationsLoaded(true);
        });

        if (!isMounted && unsubSnapshot) {
          unsubSnapshot();
        }
      } catch (err) {
        console.warn("Conversations init outer notice:", err);
        if (isMounted) setIsConversationsLoaded(true);
      }
    };

    initConversations();
    return () => {
      isMounted = false;
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [listenerTriggerCount]);

  // 4. Sync Messages for Selected Conversation
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    let unsubSnapshot: (() => void) | null = null;

    const initMessages = async () => {
      try {
        if (typeof window !== "undefined" && ((window as any).__rma_firestore_disabled || localStorage.getItem("rma_firestore_disabled") === "true")) {
          return;
        }
        const db = await getFirestoreDb();
        if (!isMounted) return;

        const msgsQuery = query(
          collection(db, "chat_conversations", selectedConv.id, "messages"),
          orderBy("timestamp", "asc")
        );

        unsubSnapshot = onSnapshot(msgsQuery, (snapshot) => {
          if (!isMounted) return;
          const loadedMsgs: ChatMessage[] = [];
          snapshot.forEach((d) => {
            loadedMsgs.push(d.data() as ChatMessage);
          });
          setMessages(loadedMsgs);

          // Clear administrative unread alert count if we are viewing this active thread
          if (selectedConv.unreadAdminCount > 0) {
            updateDoc(doc(db, "chat_conversations", selectedConv.id), {
              unreadAdminCount: 0
            }).catch(e => console.warn("Failed clearing unreadAdminCount:", e));
          }

          // Mark visitor messages as read
          const batch = writeBatch(db);
          let changed = false;
          loadedMsgs.forEach((msg) => {
            if (msg.senderType === "visitor" && !msg.isRead) {
              const msgRef = doc(db, "chat_conversations", selectedConv.id, "messages", msg.id);
              batch.update(msgRef, { isRead: true, read: true });
              changed = true;
            }
          });

          if (changed) {
            batch.commit().catch(e => console.warn("Failed marking visitor messages as read:", e));
          }
        });

        if (!isMounted && unsubSnapshot) {
          unsubSnapshot();
        }
      } catch (e) {
        console.warn("Messages list listener notice:", e);
      }
    };

    initMessages();
    return () => {
      isMounted = false;
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [selectedConv?.id]);

  // Scroll to bottom on thread updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save modified chat configurations
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return;

    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const db = await getFirestoreDb();
      await setDoc(doc(db, "settings", "chat_settings"), settings);
      
      setSettingsSuccess(true);
      onLogAction(`Updated Customer Live Chat settings to ${settings.adminStatus}`);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed saving chat settings:", err);
      alert("Error saving settings: " + (err.message || "Permissions denied"));
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Update administrative Status in-line
  const handleQuickStatusChange = async (status: ChatSettings["adminStatus"]) => {
    if (!hasWriteAccess) return;
    const updated = { ...settings, adminStatus: status };
    setSettings(updated);
    try {
      const db = await getFirestoreDb();
      await setDoc(doc(db, "settings", "chat_settings"), updated);
      onLogAction(`Admin status changed to ${status}`);
    } catch (err) {
      console.error("Failed setting status:", err);
    }
  };

  // Assign thread to myself or clear assignment
  const handleAssignConversation = async (email: string | null) => {
    if (!selectedConv || !hasWriteAccess) return;

    try {
      const db = await getFirestoreDb();
      const updatedAssigned = email || "";
      await updateDoc(doc(db, "chat_conversations", selectedConv.id), {
        assignedAdmin: updatedAssigned
      });

      // Inject system alert message inside conversation subcollection
      const systemMsgId = "sys-" + Date.now();
      const systemMsg: ChatMessage = {
        id: systemMsgId,
        conversationId: selectedConv.id,
        senderId: "system",
        senderType: "admin",
        senderName: "System Alert",
        message: email 
          ? `Conversation was assigned to ${email}`
          : "Conversation was unassigned.",
        timestamp: new Date().toISOString(),
        isRead: true
      };

      await setDoc(doc(db, "chat_conversations", selectedConv.id, "messages", systemMsgId), systemMsg);
      onLogAction(`Assigned conversation ${selectedConv.id} to ${email || 'Unassigned'}`);
    } catch (err) {
      console.error("Assignment update failed:", err);
    }
  };

  // Toggle thread open/closed state
  const handleToggleStatus = async () => {
    if (!selectedConv || !hasWriteAccess) return;

    const nextStatus = selectedConv.status === "active" ? "closed" : "active";

    try {
      const db = await getFirestoreDb();
      await updateDoc(doc(db, "chat_conversations", selectedConv.id), {
        status: nextStatus
      });

      // Inject system audit message
      const systemMsgId = "sys-" + Date.now();
      const systemMsg: ChatMessage = {
        id: systemMsgId,
        conversationId: selectedConv.id,
        senderId: "system",
        senderType: "admin",
        senderName: "System Alert",
        message: `Conversation status set to ${nextStatus.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        isRead: true
      };

      await setDoc(doc(db, "chat_conversations", selectedConv.id, "messages", systemMsgId), systemMsg);
      onLogAction(`Set conversation ${selectedConv.id} status to ${nextStatus}`);
    } catch (err) {
      console.error("Toggle status failed:", err);
    }
  };

  // Delete Chat Conversation
  const handleDeleteConversation = async () => {
    if (!selectedConv || !hasWriteAccess) return;
    if (!window.confirm("Are you absolutely sure you want to delete this conversation? This will permanently erase all message logs.")) return;

    try {
      const db = await getFirestoreDb();
      
      // Delete parent thread doc
      await deleteDoc(doc(db, "chat_conversations", selectedConv.id));
      
      onLogAction(`Permanently deleted chat session ${selectedConv.id}`);
      setSelectedConv(null);
    } catch (err) {
      console.error("Failed to delete chat conversation:", err);
    }
  };

  // Export Chat history to local file
  const handleExportChat = () => {
    if (!selectedConv) return;

    const chatHeader = `==================================================
RIGHT MINDS AFRICA LIVE SUPPORT SYSTEM
CONVERSATION LOG
==================================================
ID: ${selectedConv.id}
Visitor Name: ${selectedConv.visitorName}
Visitor Email: ${selectedConv.visitorEmail}
Visitor Phone: ${selectedConv.visitorPhone || "Not provided"}
Created At: ${new Date(selectedConv.createdAt).toLocaleString()}
Status: ${selectedConv.status.toUpperCase()}
Assigned Admin: ${selectedConv.assignedAdmin || "Unassigned"}
==================================================\n\n`;

    const chatBody = messages.map(msg => {
      const timeStr = new Date(msg.timestamp).toLocaleString();
      return `[${timeStr}] ${msg.senderName} (${msg.senderType.toUpperCase()}): ${msg.message}`;
    }).join("\n");

    const fullBlobText = chatHeader + chatBody;
    const blob = new Blob([fullBlobText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat_log_${selectedConv.visitorName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger typing in database
  const handleInputChange = (val: string) => {
    setInputText(val);

    if (!selectedConv) return;

    if (!isAdminTyping) {
      setIsAdminTyping(true);
      getFirestoreDb().then((db) => {
        updateDoc(doc(db, "chat_conversations", selectedConv.id), { adminTyping: true });
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsAdminTyping(false);
      getFirestoreDb().then((db) => {
        updateDoc(doc(db, "chat_conversations", selectedConv.id), { adminTyping: false });
      });
    }, 2000);
  };

  // Send message from Administrator
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() || !selectedConv) return;

    const messageText = text.trim();
    if (textToSend === undefined) setInputText("");

    // Clear typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsAdminTyping(false);

    try {
      const db = await getFirestoreDb();
      const messageId = "msg-admin-" + Date.now();

      const newMessage: ChatMessage & {
        messageId: string;
        senderRole: string;
        read: boolean;
        delivered: boolean;
        edited: boolean;
        deleted: boolean;
      } = {
        id: messageId,
        messageId: messageId,
        conversationId: selectedConv.id,
        senderId: currentUserEmail,
        senderType: "admin",
        senderRole: "admin",
        senderName: "Support Team Agent",
        message: messageText,
        timestamp: new Date().toISOString(),
        isRead: false,
        read: false,
        delivered: true,
        edited: false,
        deleted: false
      };

      // 1. Add message subcollection document
      await setDoc(doc(db, "chat_conversations", selectedConv.id, "messages", messageId), newMessage);

      // 2. Update parent conversation metadata
      await updateDoc(doc(db, "chat_conversations", selectedConv.id), {
        lastMessageAt: new Date().toISOString(),
        lastMessageTime: new Date().toISOString(),
        lastMessageText: messageText,
        lastMessage: messageText,
        updatedAt: new Date().toISOString(),
        unreadCount: (selectedConv.unreadCount || 0) + 1,
        adminTyping: false
      });
    } catch (e) {
      console.error("Failed sending admin message:", e);
    }
  };

  // Filter conversations matching active filter state
  const filteredConvs = conversations.filter((conv) => {
    // 1. Search filter (Search by: Visitor Name, Email, Conversation ID)
    const matchSearch = 
      conv.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.visitorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.visitorPhone && conv.visitorPhone.includes(searchTerm)) ||
      conv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((conv as any).conversationId && (conv as any).conversationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      conv.lastMessageText.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // 2. Status filter
    if (statusFilter !== "all" && conv.status !== statusFilter) return false;

    // 3. Assignment filter
    if (assignmentFilter === "mine" && conv.assignedAdmin !== currentUserEmail) return false;
    if (assignmentFilter === "unassigned" && conv.assignedAdmin) return false;

    return true;
  });

  // Sort conversations (Sort by: Unread, Recent Activity, Open, Closed, Resolved)
  const sortedConvs = [...filteredConvs].sort((a, b) => {
    if (sortBy === "unread") {
      const aUnread = a.unreadAdminCount || 0;
      const bUnread = b.unreadAdminCount || 0;
      if (aUnread !== bUnread) return bUnread - aUnread;
    } else if (sortBy === "open") {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
    } else if (sortBy === "closed") {
      if (a.status === "closed" && b.status !== "closed") return -1;
      if (a.status !== "closed" && b.status === "closed") return 1;
    } else if (sortBy === "resolved") {
      if (a.status === "resolved" && b.status !== "resolved") return -1;
      if (a.status !== "resolved" && b.status === "resolved") return 1;
    }

    // Default: Sort by Recent Activity (lastMessageAt / lastMessageTime)
    const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
    const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  const isSuperAdmin = currentUserEmail === "olosundelouis@gmail.com" || 
                       currentAdminUser?.role === "Super Admin" || 
                       (currentAdminUser?.role && currentAdminUser.role.toLowerCase().includes("super admin")) ||
                       currentUserEmail === "rightmindsafrica@gmail.com" ||
                       currentUserEmail === "corpersimpactinitiative@gmail.com";

  const handleReconnectListeners = async () => {
    setListenerTriggerCount(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const handleRefreshCache = async () => {
    setIsConversationsLoaded(false);
    setConversations([]);
    try {
      const db = await getFirestoreDb();
      const convsQuery = query(
        collection(db, "chat_conversations"),
        orderBy("lastMessageAt", "desc")
      );
      const snap = await getDocs(convsQuery);
      const loadedConvs: ChatConversation[] = [];
      snap.forEach((d) => {
        loadedConvs.push(d.data() as ChatConversation);
      });
      setConversations(loadedConvs);
    } catch (err) {
      console.error("Cache flush query failed:", err);
    } finally {
      setIsConversationsLoaded(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------- HEADER MENU BAR -------------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-150 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-xl text-[#0A1A14] tracking-tight uppercase">Live Support Terminal</h1>
            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[#E76F51]/10 text-[#E76F51] select-none uppercase">
              BETA • Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provide real-time support across WhatsApp and Live Website Chat system. Manage availability parameters instantly.
          </p>
        </div>

        {/* Tab Selector Controls */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab("conversations")}
            className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "conversations" ? "bg-[#103D2E] text-amber-300 shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MessageSquare size={13} />
            Inbox ({conversations.filter(c => c.unreadAdminCount > 0).length} Unread)
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "settings" ? "bg-[#103D2E] text-amber-300 shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Settings size={13} />
            Gateway Config
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveSubTab("diagnostics")}
              className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "diagnostics" ? "bg-amber-400 text-slate-900 shadow-xs font-black border border-amber-500 animate-pulse" : "bg-amber-50 text-amber-800 hover:bg-amber-100/80"
              }`}
            >
              <Activity size={13} />
              Diagnostics 🛠️
            </button>
          )}
        </div>
      </div>

      {/* -------------------- MAIN TAB CONTENT -------------------- */}
      {activeSubTab === "conversations" ? (
        /* ==================== CONVERSATIONS PANEL ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[580px]">
          
          {/* A. LEFT COLUMN: THREAD LIST */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-150 p-4 flex flex-col space-y-4 shadow-2xs">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search visitors, messages, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#103D2E] placeholder:text-slate-400"
              />
            </div>

            {/* Quick Filter Control Caps */}
            <div className="flex gap-1.5 border-b border-slate-100 pb-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === "active" ? "bg-emerald-50 text-emerald-700" : "text-slate-400 hover:bg-slate-55"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("closed")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === "closed" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-55"
                }`}
              >
                Closed
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === "resolved" ? "bg-purple-50 text-purple-700" : "text-slate-400 hover:bg-slate-55"
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === "all" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-55"
                }`}
              >
                All Threads
              </button>
            </div>

            {/* Quick Assignment Filters */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setAssignmentFilter("all")}
                className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase border transition-all cursor-pointer ${
                  assignmentFilter === "all" ? "bg-slate-100 border-slate-300 text-slate-700" : "border-slate-100 text-slate-400"
                }`}
              >
                All Assignments
              </button>
              <button
                onClick={() => setAssignmentFilter("mine")}
                className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase border transition-all cursor-pointer ${
                  assignmentFilter === "mine" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-slate-100 text-slate-400"
                }`}
              >
                Assigned To Me
              </button>
              <button
                onClick={() => setAssignmentFilter("unassigned")}
                className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase border transition-all cursor-pointer ${
                  assignmentFilter === "unassigned" ? "bg-amber-50 border-amber-200 text-amber-700" : "border-slate-100 text-slate-400"
                }`}
              >
                Unassigned
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-2">
              <span className="font-bold mr-1">SORT:</span>
              <button
                onClick={() => setSortBy("recent")}
                className={`px-1 rounded-sm transition-all cursor-pointer ${sortBy === "recent" ? "bg-[#103D2E] text-amber-300 font-bold" : "hover:text-slate-600"}`}
              >
                RECENT
              </button>
              <span>•</span>
              <button
                onClick={() => setSortBy("unread")}
                className={`px-1 rounded-sm transition-all cursor-pointer ${sortBy === "unread" ? "bg-[#103D2E] text-amber-300 font-bold" : "hover:text-slate-600"}`}
              >
                UNREAD
              </button>
              <span>•</span>
              <button
                onClick={() => setSortBy("open")}
                className={`px-1 rounded-sm transition-all cursor-pointer ${sortBy === "open" ? "bg-[#103D2E] text-amber-300 font-bold" : "hover:text-slate-600"}`}
              >
                OPEN
              </button>
              <span>•</span>
              <button
                onClick={() => setSortBy("closed")}
                className={`px-1 rounded-sm transition-all cursor-pointer ${sortBy === "closed" ? "bg-[#103D2E] text-amber-300 font-bold" : "hover:text-slate-600"}`}
              >
                CLOSED
              </button>
              <span>•</span>
              <button
                onClick={() => setSortBy("resolved")}
                className={`px-1 rounded-sm transition-all cursor-pointer ${sortBy === "resolved" ? "bg-[#103D2E] text-amber-300 font-bold" : "hover:text-slate-600"}`}
              >
                RESOLVED
              </button>
            </div>

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[420px] pr-1">
              {!isConversationsLoaded ? (
                <div className="text-center py-12 text-xs text-slate-400 animate-pulse">
                  Streaming conversations...
                </div>
              ) : sortedConvs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No chat conversations match.
                </div>
              ) : (
                sortedConvs.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const hasUnread = conv.unreadAdminCount > 0;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                        isSelected 
                          ? "bg-[#103D2E]/5 border-[#103D2E]/20 shadow-xs" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      {/* Avatar initial */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs select-none shrink-0 ${
                        isSelected ? "bg-[#103D2E] text-amber-300" : "bg-slate-100 text-slate-600"
                      }`}>
                        {conv.visitorName.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold truncate leading-none ${hasUnread ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                            {conv.visitorName}
                          </h4>
                          <span className="text-[9px] font-mono text-slate-400 select-none">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className={`text-[10px] truncate leading-normal ${hasUnread ? "text-slate-800 font-bold" : "text-slate-400"}`}>
                          {conv.lastMessageText}
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full block ${conv.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            {conv.status}
                          </span>
                          {conv.assignedAdmin && (
                            <span className="text-[8px] font-mono text-slate-500 bg-slate-100 px-1 rounded truncate max-w-[120px]">
                              @{conv.assignedAdmin.split("@")[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread Alert badge */}
                      {hasUnread && (
                        <div className="self-center shrink-0 w-2.5 h-2.5 bg-rose-500 rounded-full select-none" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* B. CENTER COLUMN: ACTIVE CONVERSATION OR INITIAL WELCOME SCREEN */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-150 flex flex-col overflow-hidden shadow-2xs">
            {selectedConv ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Active Header bar */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-slate-800">{selectedConv.visitorName}</h3>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{selectedConv.visitorEmail}</p>
                  </div>
                  
                  {/* Close conversation button */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleToggleStatus}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-mono font-black uppercase border transition-all cursor-pointer flex items-center gap-1 ${
                        selectedConv.status === "active" 
                          ? "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100" 
                          : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <CheckCircle2 size={11} />
                      {selectedConv.status === "active" ? "Close Thread" : "Reopen Thread"}
                    </button>
                  </div>
                </div>

                {/* Messages Feed View */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30 flex flex-col min-h-[300px]">
                  {messages.map((msg) => {
                    const isSystem = msg.senderId === "system";
                    const isMe = msg.senderType === "admin" && !isSystem;
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="self-center py-1 px-3 bg-slate-100/80 rounded-lg text-[9px] font-mono font-bold text-slate-500 select-none">
                          {msg.message} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <span className="text-[9px] text-slate-400 font-bold mb-0.5 select-none">{msg.senderName}</span>
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? "bg-[#103D2E] text-white rounded-tr-none text-right" 
                              : "bg-white text-slate-800 rounded-tl-none border border-slate-100 text-left"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          
                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              {msg.attachments.map((file, fIdx) => {
                                const isImage = file.type.startsWith("image/");
                                return (
                                  <div key={fIdx} className="space-y-1">
                                    {isImage ? (
                                      <img 
                                        src={file.url} 
                                        alt={file.name} 
                                        className="max-h-[140px] rounded-lg object-cover cursor-pointer"
                                        referrerPolicy="no-referrer"
                                        onClick={() => window.open(file.url, "_blank")}
                                      />
                                    ) : (
                                      <a 
                                        href={file.url} 
                                        download={file.name}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 p-1.5 rounded bg-slate-100 text-[10px] text-slate-700 hover:bg-slate-200 font-bold font-mono transition-all"
                                      >
                                        <Paperclip size={11} />
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-400 mt-0.5 select-none">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}

                  {/* Realtime Remote Visitor Typing Indicator */}
                  {selectedConv && (selectedConv as any).visitorTyping && (
                    <div className="self-start flex flex-col items-start max-w-[80%]">
                      <span className="text-[9px] text-slate-400 font-bold mb-0.5 select-none">Visitor is typing</span>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick replies block */}
                <div className="p-2 border-t border-slate-100 bg-slate-50 flex gap-1 overflow-x-auto select-none">
                  {QUICK_REPLIES.map((rep, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => handleSendMessage(rep)}
                      className="px-2.5 py-1 bg-white border border-slate-150 rounded-lg text-[9.5px] text-slate-600 font-medium hover:bg-slate-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {rep}
                    </button>
                  ))}
                </div>

                {/* Reply Input Bar */}
                <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={selectedConv.status === "closed" ? "This conversation is closed. Type to reopen and reply..." : "Type your reply..."}
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-slate-50 border border-slate-150 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#103D2E] text-slate-800"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="p-2 rounded-full bg-[#103D2E] text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* Conversation Welcome Screen */
              <div className="flex-1 flex flex-col justify-center items-center p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-[#103D2E]">
                  <MessageSquare size={26} />
                </div>
                <h4 className="font-sans font-extrabold text-slate-800 text-sm">Select a Conversation</h4>
                <p className="text-xs text-slate-400 leading-normal max-w-xs">
                  Choose an active visitor thread from the left menu panel to view complete logs, transfer threads, and chat in real-time.
                </p>
              </div>
            )}
          </div>

          {/* C. RIGHT COLUMN: VISITOR METADATA / ACTION CARD */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-150 p-5 flex flex-col space-y-6 shadow-2xs text-left">
            {selectedConv ? (
              <div className="space-y-6 h-full flex flex-col justify-between">
                
                {/* Profile header */}
                <div className="space-y-4">
                  <h3 className="font-sans font-extrabold text-[#0a1a14] text-xs uppercase tracking-wider">Visitor Profile</h3>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center font-bold text-sm select-none shrink-0">
                      {selectedConv.visitorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h4 className="text-xs font-black text-slate-800 truncate leading-none">{selectedConv.visitorName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">ID: <span className="font-mono text-[9px]">{selectedConv.id}</span></p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-slate-100 pt-4">
                    <div className="flex items-start gap-2.5">
                      <Mail size={12} className="text-slate-400 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono font-bold text-slate-400 uppercase leading-none">Email Address</span>
                        <a href={`mailto:${selectedConv.visitorEmail}`} className="text-[11px] text-[#103D2E] font-medium hover:underline truncate block mt-0.5">
                          {selectedConv.visitorEmail}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone size={12} className="text-slate-400 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono font-bold text-slate-400 uppercase leading-none">Phone Number</span>
                        <span className="text-[11px] text-slate-700 font-medium block mt-0.5 truncate">
                          {selectedConv.visitorPhone || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Calendar size={12} className="text-slate-400 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono font-bold text-slate-400 uppercase leading-none">First Contact Date</span>
                        <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                          {new Date(selectedConv.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations segment */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-sans font-extrabold text-[#0a1a14] text-xs uppercase tracking-wider">Action Desk</h3>

                  {/* Assignments control */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold font-mono text-slate-400 uppercase">Assigned Staff</label>
                    <div className="flex gap-1.5">
                      {selectedConv.assignedAdmin === currentUserEmail ? (
                        <button
                          onClick={() => handleAssignConversation(null)}
                          className="w-full py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <UserCheck size={11} />
                          Release Assignment
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignConversation(currentUserEmail)}
                          className="w-full py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <UserCheck size={11} />
                          Assign to Myself
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={handleExportChat}
                      className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-700 hover:text-slate-900 transition-all text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileDown size={11} />
                      Export Log
                    </button>
                    
                    <button
                      onClick={handleDeleteConversation}
                      className="py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-all text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      Delete Log
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center py-12 text-slate-400">
                <Users size={20} />
                <span className="text-[10px] font-mono mt-2">No active profile context</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ==================== CONFIGURATION DASHBOARD ==================== */
        <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-2xs max-w-4xl text-left">
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Quick availability status toggler */}
            <div className="space-y-2">
              <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                Current Support Availability Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "online" as const, label: "Online", color: "bg-emerald-500", desc: "Show active chimes" },
                  { id: "away" as const, label: "Away", color: "bg-amber-500", desc: "Replies slightly slower" },
                  { id: "busy" as const, label: "Busy", color: "bg-rose-500", desc: "Restricted staff availability" },
                  { id: "offline" as const, label: "Offline", color: "bg-slate-400", desc: "Request email fallback" }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleQuickStatusChange(st.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      settings.adminStatus === st.id 
                        ? "border-[#103D2E] bg-[#103D2E]/5 shadow-xs" 
                        : "border-slate-150 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full shrink-0 ${st.color}`} />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 leading-none">{st.label}</span>
                      <span className="block text-[9px] text-slate-400 font-medium leading-tight mt-1">{st.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              
              {/* WhatsApp Parameters Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] block" />
                  <h3 className="font-sans font-extrabold text-[#0a1a14] text-xs uppercase tracking-wider">WhatsApp Floating Gateway</h3>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Enable WhatsApp Button</label>
                  <select
                    value={settings.whatsappEnabled ? "true" : "false"}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsappEnabled: e.target.value === "true" }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] bg-white text-slate-700 font-medium"
                  >
                    <option value="true">Active & Visible</option>
                    <option value="false">Disabled / Hidden</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Official WhatsApp Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +234 810 000 0000"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] text-slate-800 bg-white"
                  />
                  <span className="text-[9.5px] text-slate-400 block mt-1">Provide country code prefix without spaces or brackets.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Default Welcome Pre-typed Message</label>
                  <textarea
                    rows={3}
                    required
                    value={settings.whatsappMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsappMessage: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Live Chat Parameters Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block" />
                  <h3 className="font-sans font-extrabold text-[#0a1a14] text-xs uppercase tracking-wider">Live Website Chat Widget</h3>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Enable Live Chat Widget</label>
                  <select
                    value={settings.liveChatEnabled ? "true" : "false"}
                    onChange={(e) => setSettings(prev => ({ ...prev, liveChatEnabled: e.target.value === "true" }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] bg-white text-slate-700 font-medium"
                  >
                    <option value="true">Active & Visible</option>
                    <option value="false">Disabled / Hidden</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Office Hours Banner Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9:00 AM - 5:00 PM (GMT+1)"
                    value={settings.officeHours}
                    onChange={(e) => setSettings(prev => ({ ...prev, officeHours: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] text-slate-800 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Automated Onboarding Welcome Msg</label>
                  <textarea
                    rows={3}
                    required
                    value={settings.autoReplyMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoReplyMessage: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] text-slate-800 bg-white"
                  />
                </div>
              </div>

            </div>

            {/* General Widget Display Aesthetics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Widget Screen Position</label>
                <select
                  value={settings.chatPosition}
                  onChange={(e) => setSettings(prev => ({ ...prev, chatPosition: e.target.value as any }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] bg-white text-slate-700 font-medium"
                >
                  <option value="bottom-right">Bottom-Right Corner</option>
                  <option value="bottom-left">Bottom-Left Corner</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Widget Theme Hex Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.chatTheme}
                    onChange={(e) => setSettings(prev => ({ ...prev, chatTheme: e.target.value }))}
                    className="w-10 h-8 rounded border border-slate-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. #103D2E"
                    value={settings.chatTheme}
                    onChange={(e) => setSettings(prev => ({ ...prev, chatTheme: e.target.value }))}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] text-slate-800 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Support Notifications Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@rightmindsafrica.org"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#103D2E] text-slate-800 bg-white"
                />
              </div>

            </div>

            {/* Submission triggers */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              {settingsSuccess && (
                <span className="text-2xl animate-bounce">✅</span>
              )}
              {settingsSuccess && (
                <span className="text-xs text-emerald-600 font-semibold">
                  Gateways Configuration Saved Successfully!
                </span>
              )}
              
              <button
                type="submit"
                disabled={isSavingSettings || !hasWriteAccess}
                className="px-6 py-2.5 rounded-xl bg-[#103D2E] text-white text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                {isSavingSettings ? "Saving Settings..." : "Commit Gateway Changes"}
              </button>
            </div>

          </form>

        </div>
      )}

      {activeSubTab === "diagnostics" && isSuperAdmin && (
        <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-2xs">
          <ChatDiagnostics 
            conversations={conversations} 
            onReconnectListeners={handleReconnectListeners}
            onRefreshCache={handleRefreshCache}
            onLogAction={onLogAction}
          />
        </div>
      )}

    </div>
  );
}
