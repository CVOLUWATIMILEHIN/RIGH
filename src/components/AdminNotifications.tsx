import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Plus, 
  Search, 
  Megaphone, 
  Award, 
  ShieldCheck, 
  Calendar,
  X,
  Clock
} from "lucide-react";

export interface SystemNotification {
  id: string;
  type: "registration" | "payment" | "event" | "announcement" | "audit";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    type: "registration",
    title: "New Registration Received",
    message: "David Kolawole has successfully submitted NYSC Candidate dossier for Lagos State stream.",
    timestamp: "2026-05-24T10:15:00.000Z",
    isRead: false
  },
  {
    id: "notif-2",
    type: "payment",
    title: "Payment Approval requested",
    message: "Proof of Payment reference [PAY-9831-228] uploaded by Abubakar Sadiq (CII Abuja).",
    timestamp: "2026-05-23T08:45:00.000Z",
    isRead: false
  },
  {
    id: "notif-3",
    type: "event",
    title: "New Event published!",
    message: "Annual Youth Alignment Summit 2026 (YAP) has been scheduled and published for registrations.",
    timestamp: "2026-05-15T09:00:00Z",
    isRead: true
  },
  {
    id: "notif-4",
    type: "announcement",
    title: "Leadership Announcement broadcasted",
    message: "Founder's orientation update: 'Continuous goal auditing cycles begin Saturday December 6th.'",
    timestamp: "2026-05-01T11:00:00Z",
    isRead: true
  }
];

export function publishSystemNotification(
  type: SystemNotification["type"],
  title: string,
  message: string,
  link?: string
) {
  const newNotif = {
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    link
  };
  
  if (typeof window !== "undefined") {
    // 1. Optimistic Local Sync
    const saved = localStorage.getItem("rma_notifications");
    let current: SystemNotification[] = [];
    try {
      current = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      current = INITIAL_NOTIFICATIONS;
    }
    const optimisticNotif: SystemNotification = {
      id: `notif-opt-${Date.now()}`,
      ...newNotif
    };
    localStorage.setItem("rma_notifications", JSON.stringify([optimisticNotif, ...current]));
    window.dispatchEvent(new Event("rma_notifications_updated"));
  }

  // 2. Commit to Firestore
  import("firebase/firestore").then(async ({ doc, setDoc, collection }) => {
    try {
      const { getFirestoreDb } = await import("../lib/db");
      const db = await getFirestoreDb();
      const docId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await setDoc(doc(db, "notifications", docId), { id: docId, ...newNotif });
    } catch (err) {
      console.warn("Firestore remote push of notification failed, local was queued:", err);
    }
  }).catch((err) => console.warn("Could not import Firestore during publishSystemNotification:", err));
}

interface AdminNotificationsProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminNotifications({ hasWriteAccess, onLogAction }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Broadcast Notification modal inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadTitle, setBroadTitle] = useState("");
  const [broadMessage, setBroadMessage] = useState("");
  const [broadType, setBroadType] = useState<SystemNotification["type"]>("announcement");

  useEffect(() => {
    const loadNotifs = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("rma_notifications");
        if (saved) {
          try {
            setNotifications(JSON.parse(saved));
          } catch (e) {
            setNotifications(INITIAL_NOTIFICATIONS);
          }
        } else {
          localStorage.setItem("rma_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
          setNotifications(INITIAL_NOTIFICATIONS);
        }
      }
    };

    loadNotifs();
    window.addEventListener("rma_notifications_updated", loadNotifs);
    return () => {
      window.removeEventListener("rma_notifications_updated", loadNotifs);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic inline update
    const updated = notifications.map(not => {
      if (not.id === id) return { ...not, isRead: true };
      return not;
    });
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_notifications", JSON.stringify(updated));
    }

    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { getFirestoreDb } = await import("../lib/db");
      const db = await getFirestoreDb();
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (err) {
      console.warn("Could not update notification state on Firestore:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const updated = notifications.map(not => ({ ...not, isRead: true }));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_notifications", JSON.stringify(updated));
    }

    const unread = notifications.filter(not => !not.isRead);
    if (unread.length === 0) return;

    try {
      const { writeBatch, doc } = await import("firebase/firestore");
      const { getFirestoreDb } = await import("../lib/db");
      const db = await getFirestoreDb();
      const batch = writeBatch(db);
      unread.forEach(not => {
        batch.update(doc(db, "notifications", not.id), { isRead: true });
      });
      await batch.commit();
      onLogAction(`🔔 [NOTIFICATIONS] Marked all unread system alerts in console as cleared.`);
    } catch (err) {
      console.warn("Could not batch clear notifications on Firestore:", err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!hasWriteAccess) return;
    const updated = notifications.filter(not => not.id !== id);
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_notifications", JSON.stringify(updated));
    }

    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { getFirestoreDb } = await import("../lib/db");
      const db = await getFirestoreDb();
      await deleteDoc(doc(db, "notifications", id));
      onLogAction(`🗑️ [NOTIFICATIONS CLEAR] Deleted alert notification: "${title}"`);
    } catch (err) {
      console.warn("Could not delete notification from Firestore:", err);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadTitle.trim() || !broadMessage.trim()) return;

    publishSystemNotification(broadType, broadTitle.trim(), broadMessage.trim());
    
    onLogAction(`📢 [BROADCAST CREATED] Disseminated manual push announcement: "${broadTitle}"`);
    setIsModalOpen(false);
    setBroadTitle("");
    setBroadMessage("");
  };

  const filteredNotifs = notifications.filter(not => {
    const matchesSearch = not.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          not.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || not.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(not => !not.isRead).length;

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Bell size={18} className="text-[#103D2E] animate-bounce" />
            System Notifications Center
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            You hold <strong className="text-amber-500 font-extrabold">{unreadCount} unread notifications</strong> requiring operational actions
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 rounded-xl text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check size={11} />
            Mark All Read
          </button>
          
          {hasWriteAccess && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-bold rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-[#103D2E]/20"
            >
              <Plus size={13} className="stroke-[2.5]" />
              Trigger Broadcast
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts, content details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#103D2E]/40 focus:bg-white rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
          >
            <option value="all">All Channels</option>
            <option value="registration">Registrations channel</option>
            <option value="payment">Payments Channel</option>
            <option value="event">Events Channel</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No notification records matching filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifs.map((not) => {
              let iconSymbol = "🔔";
              let badgeColor = "bg-slate-50 text-slate-700 border-slate-150";

              if (not.type === "registration") {
                iconSymbol = "👥";
                badgeColor = "bg-blue-50 text-blue-800 border-blue-100 border";
              } else if (not.type === "payment") {
                iconSymbol = "💸";
                badgeColor = "bg-amber-50 text-amber-800 border-amber-200 border";
              } else if (not.type === "event") {
                iconSymbol = "📅";
                badgeColor = "bg-emerald-50 text-emerald-850 border-emerald-150 border";
              } else if (not.type === "announcement") {
                iconSymbol = "📢";
                badgeColor = "bg-rose-50 text-rose-800 border-rose-200 border";
              }

              return (
                <div 
                  key={not.id}
                  className={`p-4 flex gap-4 items-start transition-all hover:bg-slate-50/50 ${!not.isRead ? "bg-slate-50/30 font-bold border-l-4 border-l-[#103D2E]" : "font-normal"}`}
                >
                  <span className="p-2.5 bg-slate-100 rounded-xl text-base shrink-0 select-none">
                    {iconSymbol}
                  </span>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-905">{not.title}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded ${badgeColor}`}>
                        {not.type}
                      </span>
                      {!not.isRead && (
                        <span className="bg-[#103D2E] text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                          New Alert
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-550 leading-relaxed font-sans max-w-2xl font-medium">
                      {not.message}
                    </p>

                    <div className="flex items-center gap-1 text-[9.5px] font-mono text-slate-400 font-bold pt-1">
                      <Clock size={10} />
                      <span>{new Date(not.timestamp).toLocaleString("en-NG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 self-center">
                    {!not.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(not.id)}
                        className="p-1 px-2.5 bg-slate-105 hover:bg-white border border-slate-200 hover:border-[#103D2E]/25 text-slate-600 hover:text-[#103D2E] rounded font-bold text-[9px] uppercase tracking-wider"
                      >
                        Acknowledge
                      </button>
                    )}
                    {hasWriteAccess && (
                      <button
                        onClick={() => handleDelete(not.id, not.title)}
                        className="p-1 text-slate-405 hover:text-rose-600 rounded transition-colors"
                        title="Purged record"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Broadcast Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp">
            
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-black uppercase text-slate-800">
                Disseminate Operations Broadcast
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="p-6 space-y-4 text-xs font-medium">
              
              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Broadcast Channel Route:</label>
                <select
                  value={broadType}
                  onChange={(e) => setBroadType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                >
                  <option value="announcement">Announcements Channel</option>
                  <option value="event">Events Bulletin Channel</option>
                  <option value="payment">Payments Desk Channel</option>
                  <option value="registration">Dossier Registry Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Broadcast Headline Title:</label>
                <input
                  type="text"
                  required
                  value={broadTitle}
                  onChange={(e) => setBroadTitle(e.target.value)}
                  placeholder="e.g., Founders Orientations Cohorts Update"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Broadcasting Core Message:</label>
                <textarea
                  required
                  rows={4}
                  value={broadMessage}
                  onChange={(e) => setBroadMessage(e.target.value)}
                  placeholder="Enter full announcement details here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-2xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Broadcast Push Notification
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
