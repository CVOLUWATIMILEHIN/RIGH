import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  X, 
  User, 
  Mail, 
  Phone, 
  Paperclip, 
  Smile, 
  Clock, 
  CheckCheck,
  Check,
  AlertCircle
} from "lucide-react";
import { getFirestoreDb, getFirebaseAuth } from "../lib/db";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  writeBatch 
} from "firebase/firestore";
import { ChatSettings, ChatConversation, ChatMessage } from "./chatTypes";

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

// Simple web audio helper to synthesize message chimes safely without depending on external asset files
function playChime(type: "sent" | "received") {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === "received") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.35);
    } else {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime + 0.08); // D5
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.25);
    }
  } catch (err) {
    // Web audio block standard failsafe
  }
}

export default function LiveChatWidget() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState({ name: "", email: "", phone: "" });
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const convUnsubRef = useRef<(() => void) | null>(null);
  const msgsUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (convUnsubRef.current) {
        convUnsubRef.current();
        convUnsubRef.current = null;
      }
      if (msgsUnsubRef.current) {
        msgsUnsubRef.current();
        msgsUnsubRef.current = null;
      }
    };
  }, []);

  // Common Emojis list
  const COMMON_EMOJIS = ["👋", "😊", "👍", "🙏", "❤️", "🔥", "🙌", "💡", "✨", "📝", "❓", "✅"];

  // 1. Listen to settings real-time and initialize Auth
  useEffect(() => {
    let unsubscribe = () => {};
    const initSettingsAndAuth = async () => {
      try {
        const auth = await getFirebaseAuth().catch(() => null);
        if (auth) {
          const { signInAnonymously } = await import("firebase/auth");
          if (!auth.currentUser) {
            await signInAnonymously(auth).catch((e) => {
              console.warn("Anonymous sign in failed:", e);
            });
          }
        }

        if (typeof window !== "undefined" && ((window as any).__rma_firestore_disabled || localStorage.getItem("rma_firestore_disabled") === "true")) {
          setIsDbLoaded(true);
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
                console.warn("Failed to auto-migrate whatsappNumber in database:", e);
              });
              setSettings({ ...data, whatsappNumber: "+2348039809016" });
            } else {
              setSettings(data);
            }
          } else {
            // Seed settings if they do not exist
            setDoc(settingsRef, DEFAULT_SETTINGS).then(() => {
              setSettings(DEFAULT_SETTINGS);
            }).catch(e => console.warn("Failed to seed default chat settings:", e));
          }
          setIsDbLoaded(true);
        }, (err) => {
          console.warn("Settings fetch failed (permissions/no database):", err);
          setIsDbLoaded(true);
        });
      } catch (err) {
        console.warn("Settings/Auth init outer failed:", err);
        setIsDbLoaded(true);
      }
    };

    initSettingsAndAuth();
    return () => unsubscribe();
  }, []);

  // 2. Load cached visitor & conversation id
  useEffect(() => {
    const cachedVisitor = localStorage.getItem("rma_chat_visitor_info");
    const cachedConversationId = localStorage.getItem("rma_chat_conversation_id");

    if (cachedVisitor) {
      try {
        const parsed = JSON.parse(cachedVisitor);
        setVisitorInfo(parsed);
        setHasOnboarded(true);

        if (cachedConversationId) {
          loadConversation(cachedConversationId, parsed);
        }
      } catch (e) {
        localStorage.removeItem("rma_chat_visitor_info");
      }
    }
  }, [isDbLoaded]);

  // Scroll to bottom on messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Monitor unread status
  useEffect(() => {
    if (!isOpen && conversation && conversation.unreadCount > 0) {
      setHasUnreadAlert(true);
    } else if (isOpen) {
      setHasUnreadAlert(false);
      markAllMessagesAsRead();
    }
  }, [conversation, isOpen, messages]);

  // Load an existing conversation and subscribe to its messages
  const loadConversation = async (conversationId: string, visitor: typeof visitorInfo) => {
    try {
      if (typeof window !== "undefined" && ((window as any).__rma_firestore_disabled || localStorage.getItem("rma_firestore_disabled") === "true")) {
        return;
      }
      const db = await getFirestoreDb();
      const convRef = doc(db, "chat_conversations", conversationId);
      
      // Clean up previous listeners
      if (convUnsubRef.current) {
        convUnsubRef.current();
        convUnsubRef.current = null;
      }
      if (msgsUnsubRef.current) {
        msgsUnsubRef.current();
        msgsUnsubRef.current = null;
      }

      // Listen to conversation changes
      convUnsubRef.current = onSnapshot(convRef, (snap) => {
        if (snap.exists()) {
          setConversation(snap.data() as ChatConversation);
        }
      }, (err) => {
        console.warn("Conversation snapshot notice:", err);
      });

      // Listen to messages
      const msgsQuery = query(
        collection(db, "chat_conversations", conversationId, "messages"),
        orderBy("timestamp", "asc")
      );

      msgsUnsubRef.current = onSnapshot(msgsQuery, (snapshot) => {
        const newMsgs: ChatMessage[] = [];
        snapshot.forEach((d) => {
          newMsgs.push(d.data() as ChatMessage);
        });

        // Trigger audio chime if the last message was from admin and is newly loaded
        if (newMsgs.length > 0) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.senderType === "admin" && !lastMsg.isRead) {
            playChime("received");
          }
        }
        setMessages(newMsgs);
      }, (err) => {
        console.warn("Messages snapshot notice:", err);
      });
    } catch (e) {
      console.error("Failed to load conversation:", e);
    }
  };

  // Mark all admin messages as read
  const markAllMessagesAsRead = async () => {
    if (!conversation) return;
    try {
      const db = await getFirestoreDb();
      const convRef = doc(db, "chat_conversations", conversation.id);
      
      // Update unreadCount for visitor to 0
      await updateDoc(convRef, { unreadCount: 0 });

      // Find any admin messages that are unread and mark them read
      const batch = writeBatch(db);
      let changed = false;
      
      messages.forEach((msg) => {
        if (msg.senderType === "admin" && !msg.isRead) {
          const msgRef = doc(db, "chat_conversations", conversation.id, "messages", msg.id);
          batch.update(msgRef, { isRead: true, read: true });
          changed = true;
        }
      });

      if (changed) {
        await batch.commit();
      }
    } catch (e) {
      // Quiet fail if network transient
    }
  };

  // Onboard new visitor & create conversation
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorInfo.name || !visitorInfo.email) return;

    try {
      const db = await getFirestoreDb();
      const auth = await getFirebaseAuth().catch(() => null);
      const visitorId = auth?.currentUser?.uid || "visitor-" + Math.floor(Math.random() * 1000000) + "-" + Date.now();
      const conversationId = "chat-conv-" + Math.floor(Math.random() * 1000000) + "-" + Date.now();

      const newConversation: ChatConversation & {
        conversationId: string;
        updatedAt: string;
        lastMessage: string;
        lastMessageTime: string;
      } = {
        id: conversationId,
        conversationId,
        visitorId,
        visitorName: visitorInfo.name,
        visitorEmail: visitorInfo.email,
        visitorPhone: visitorInfo.phone || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        lastMessageTime: new Date().toISOString(),
        lastMessageText: "Started a conversation",
        lastMessage: "Started a conversation",
        status: "active",
        unreadCount: 0,
        unreadAdminCount: 1 // Trigger alert for admin
      };

      // Create conversation document
      await setDoc(doc(db, "chat_conversations", conversationId), newConversation);

      // Save credentials locally
      localStorage.setItem("rma_chat_visitor_info", JSON.stringify(visitorInfo));
      localStorage.setItem("rma_chat_conversation_id", conversationId);

      setHasOnboarded(true);
      setConversation(newConversation);

      // Trigger automatic welcome reply
      setTimeout(async () => {
        const welcomeMessageId = "msg-welcome-" + Date.now();
        const welcomeMessage: ChatMessage & {
          messageId: string;
          senderRole: string;
          read: boolean;
          delivered: boolean;
          edited: boolean;
          deleted: boolean;
        } = {
          id: welcomeMessageId,
          messageId: welcomeMessageId,
          conversationId,
          senderId: "system",
          senderType: "admin",
          senderRole: "admin",
          senderName: "Right Minds Agent",
          message: settings.autoReplyMessage || DEFAULT_SETTINGS.autoReplyMessage,
          timestamp: new Date().toISOString(),
          isRead: false,
          read: false,
          delivered: true,
          edited: false,
          deleted: false
        };

        // Add to subcollection
        await setDoc(doc(db, "chat_conversations", conversationId, "messages", welcomeMessageId), welcomeMessage);
        
        // Also update conversation's last text
        await updateDoc(doc(db, "chat_conversations", conversationId), {
          lastMessageAt: new Date().toISOString(),
          lastMessageTime: new Date().toISOString(),
          lastMessageText: settings.autoReplyMessage,
          lastMessage: settings.autoReplyMessage,
          updatedAt: new Date().toISOString(),
          unreadCount: 1
        });
      }, 1000);

      // Subscribe to messages
      loadConversation(conversationId, visitorInfo);
    } catch (err) {
      console.error("Onboarding failed:", err);
    }
  };

  // Trigger Typing Indicators in Firestore
  const handleInputChange = (val: string) => {
    setInputText(val);
    
    if (!conversation) return;

    if (!isTyping) {
      setIsTyping(true);
      getFirestoreDb().then((db) => {
        updateDoc(doc(db, "chat_conversations", conversation.id), { visitorTyping: true });
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      getFirestoreDb().then((db) => {
        updateDoc(doc(db, "chat_conversations", conversation.id), { visitorTyping: false });
      });
    }, 2000);
  };

  // Send a regular text message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() || !conversation) return;

    const messageText = text.trim();
    if (textToSend === undefined) setInputText("");
    
    // Clear typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);

    try {
      const db = await getFirestoreDb();
      const messageId = "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      
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
        conversationId: conversation.id,
        senderId: conversation.visitorId,
        senderType: "visitor",
        senderRole: "visitor",
        senderName: visitorInfo.name,
        message: messageText,
        timestamp: new Date().toISOString(),
        isRead: false,
        read: false,
        delivered: true,
        edited: false,
        deleted: false
      };

      // 1. Save message under subcollection
      await setDoc(doc(db, "chat_conversations", conversation.id, "messages", messageId), newMessage);
      playChime("sent");

      // 2. Update conversation summary
      await updateDoc(doc(db, "chat_conversations", conversation.id), {
        lastMessageAt: new Date().toISOString(),
        lastMessageTime: new Date().toISOString(),
        lastMessageText: messageText,
        lastMessage: messageText,
        updatedAt: new Date().toISOString(),
        unreadAdminCount: (conversation.unreadAdminCount || 0) + 1,
        visitorTyping: false
      });

      // 3. Create Admin Alert Notification using the SystemNotification library
      const { publishSystemNotification } = await import("./AdminNotifications");
      publishSystemNotification(
        "registration",
        `New Chat Message from ${visitorInfo.name}`,
        messageText.length > 80 ? messageText.slice(0, 80) + "..." : messageText,
        "/admin"
      );

      // 4. Send Email notifications if Offline or Away
      if (settings.adminStatus === "offline" || settings.adminStatus === "away") {
        fetch("/api/email/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "OFFLINE_CHAT_MESSAGE",
            payload: {
              visitorName: visitorInfo.name,
              visitorEmail: visitorInfo.email,
              visitorPhone: visitorInfo.phone,
              messageText: messageText,
              adminEmail: settings.supportEmail
            }
          })
        }).catch(err => console.warn("Auto email dispatch failed:", err));
      }
    } catch (e) {
      console.error("Message send failed:", e);
    }
  };

  // Upload/Attach files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file || !conversation) return;

    // Check size limit: Let's limit base64 files to 500KB to stay safe under Firestore limits
    if (file.size > 500 * 1024) {
      alert("Attachment size too large. Please upload files smaller than 500 KB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = event.target?.result as string;
        const db = await getFirestoreDb();
        const messageId = "msg-file-" + Date.now();

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
          conversationId: conversation.id,
          senderId: conversation.visitorId,
          senderType: "visitor",
          senderRole: "visitor",
          senderName: visitorInfo.name,
          message: `Shared an attachment: ${file.name}`,
          timestamp: new Date().toISOString(),
          isRead: false,
          read: false,
          delivered: true,
          edited: false,
          deleted: false,
          attachments: [
            {
              name: file.name,
              type: file.type,
              url: base64Data
            }
          ]
        };

        await setDoc(doc(db, "chat_conversations", conversation.id, "messages", messageId), newMessage);
        playChime("sent");

        await updateDoc(doc(db, "chat_conversations", conversation.id), {
          lastMessageAt: new Date().toISOString(),
          lastMessageTime: new Date().toISOString(),
          lastMessageText: `📎 Attached file: ${file.name}`,
          lastMessage: `📎 Attached file: ${file.name}`,
          updatedAt: new Date().toISOString(),
          unreadAdminCount: (conversation.unreadAdminCount || 0) + 1
        });
      } catch (err) {
        console.error("Attachment upload failed:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleLaunchWhatsApp = () => {
    const num = settings.whatsappNumber.replace(/[^0-9+]/g, "");
    const encodedText = encodeURIComponent(settings.whatsappMessage);
    const url = `https://wa.me/${num}?text=${encodedText}`;
    window.open(url, "_blank");
  };

  if (!isDbLoaded) return null;

  // Determine floating configurations
  const isLeft = settings.chatPosition === "bottom-left";
  const alignmentClass = isLeft ? "left-6" : "right-6";

  return (
    <div className={`fixed bottom-6 ${alignmentClass} z-40 flex flex-col items-end gap-3 pointer-events-auto`}>
      {/* -------------------- MAIN LIVE CHAT WINDOW -------------------- */}
      {isOpen && settings.liveChatEnabled && (
        <div 
          id="rma_live_chat_window"
          className={`w-[360px] h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 transition-all transform scale-100 origin-bottom-${isLeft ? 'left' : 'right'} max-w-[calc(100vw-32px)]`}
        >
          {/* Header Panel */}
          <div 
            className="p-4 text-white flex items-center justify-between shadow-md"
            style={{ backgroundColor: settings.chatTheme || "#103D2E" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-amber-300 shrink-0 select-none">
                {settings.companyLogo ? (
                  <img src={settings.companyLogo} alt="Logo" className="w-7 h-7 object-contain" />
                ) : (
                  "RM"
                )}
              </div>
              <div className="text-left">
                <h3 className="font-sans font-bold text-sm tracking-tight leading-none text-white">Right Minds Hub</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full block ${
                    settings.adminStatus === "online" ? "bg-emerald-400" :
                    settings.adminStatus === "away" ? "bg-amber-400" :
                    settings.adminStatus === "busy" ? "bg-rose-400" : "bg-slate-400"
                  }`} />
                  <span className="text-[10px] font-mono capitalize tracking-wide text-white/80">
                    {settings.adminStatus} • {settings.officeHours || "Support Active"}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content Panel */}
          <div className="flex-1 bg-slate-50 overflow-y-auto flex flex-col">
            {!hasOnboarded ? (
              /* Visitor Registration Form */
              <form onSubmit={handleOnboard} className="p-6 flex-1 flex flex-col justify-center space-y-4 text-left">
                <div className="text-center space-y-2 mb-2">
                  <span className="text-2xl">👋</span>
                  <h4 className="font-sans font-extrabold text-slate-800 text-sm">Welcome to Live Support!</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Please provide your contact information to start a secure real-time discussion with our team.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Your Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. David Kolawole"
                      value={visitorInfo.name}
                      onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="email"
                      required
                      placeholder="e.g. david@domain.com"
                      value={visitorInfo.email}
                      onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Phone Number <span className="text-slate-400 text-[9px]">(Optional)</span></label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="tel"
                      placeholder="e.g. +234 810 000 0000"
                      value={visitorInfo.phone}
                      onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{ backgroundColor: settings.chatTheme || "#103D2E" }}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-md shadow-emerald-950/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer mt-2"
                >
                  Start Discussion
                </button>
              </form>
            ) : (
              /* Chat Thread Messages Screen */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderType === "visitor";
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <span className="text-[9px] text-slate-400 font-bold mb-0.5 select-none">{msg.senderName}</span>
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? "text-white rounded-tr-none text-right" 
                              : "bg-white text-slate-800 rounded-tl-none border border-slate-100 text-left"
                          }`}
                          style={{ backgroundColor: isMe ? (settings.chatTheme || "#103D2E") : undefined }}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          
                          {/* File Attachment Render */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/20">
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
                                        className="flex items-center gap-2 p-1.5 rounded bg-black/10 text-[10px] text-white hover:bg-black/20 font-bold font-mono transition-all"
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

                        {/* Read Status and Timestamp */}
                        <div className="flex items-center gap-1 mt-0.5 select-none">
                          <span className="text-[9px] font-mono text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            msg.isRead ? (
                              <CheckCheck size={11} className="text-emerald-500" />
                            ) : (
                              <Check size={11} className="text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Real-time remote Admin Typing Indicator */}
                  {conversation && (conversation as any).adminTyping && (
                    <div className="self-start flex flex-col items-start max-w-[80%]">
                      <span className="text-[9px] text-slate-400 font-bold mb-0.5 select-none">Support Agent</span>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Status Indicator Alerts (Away / Busy Alert Banner) */}
                {settings.adminStatus !== "online" && (
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-amber-800 text-[10px] leading-snug">
                    <AlertCircle size={12} className="shrink-0 text-amber-600" />
                    <span>
                      {settings.adminStatus === "offline" 
                        ? "We are currently offline. Leave a message and we'll reply by email!"
                        : "Support is currently busy or away. Replies may take longer."
                      }
                    </span>
                  </div>
                )}

                {/* Input Controls Bar */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 relative">
                  {/* Emoji Quick Picker Panel */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-3 bg-white border border-slate-150 p-2 rounded-2xl shadow-xl flex gap-1 flex-wrap max-w-[200px] z-50">
                      {COMMON_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleInsertEmoji(emoji)}
                          className="p-1.5 hover:bg-slate-50 rounded-md text-sm active:scale-95 transition-all cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer shrink-0"
                  >
                    <Smile size={16} />
                  </button>

                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.docx,.doc"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Paperclip size={16} className={isUploading ? "animate-spin text-emerald-600" : ""} />
                  </button>

                  <input 
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-slate-50 border border-slate-150 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:border-emerald-600 text-slate-800"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    style={{ backgroundColor: inputText.trim() ? (settings.chatTheme || "#103D2E") : "#cbd5e1" }}
                    className="p-2 rounded-full text-white transition-all cursor-pointer shrink-0 disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- FLOATING TRIGGER BUTTONS -------------------- */}
      <div className={`flex ${isLeft ? "flex-row-reverse" : "flex-row"} items-center gap-3`}>
        
        {/* 1. WhatsApp Button (Only shown if enabled) */}
        {settings.whatsappEnabled && (
          <div className="relative group">
            {/* Pulsing Backing Ring */}
            <span className="absolute -inset-0.5 rounded-full bg-[#25D366]/40 blur-xs animate-ping duration-1000" />
            
            <button
              onClick={handleLaunchWhatsApp}
              className="relative w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer hover:bg-[#20ba59] animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              {/* WhatsApp Vector Icon */}
              <svg 
                className="w-6 h-6 fill-current" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
            
            {/* Tooltip on hover */}
            <div className={`absolute bottom-14 ${isLeft ? "left-0" : "right-0"} hidden group-hover:block bg-[#000]/80 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none tracking-wide select-none`}>
              Chat with us on WhatsApp
            </div>
          </div>
        )}

        {/* 2. Live Chat Toggle Button (Only shown if enabled) */}
        {settings.liveChatEnabled && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ backgroundColor: settings.chatTheme || "#103D2E" }}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer relative"
          >
            {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
            
            {/* Unread Message Alert Badge */}
            {hasUnreadAlert && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-bounce border-2 border-white select-none">
                {conversation?.unreadCount || "!"}
              </span>
            )}
          </button>
        )}

      </div>
    </div>
  );
}
