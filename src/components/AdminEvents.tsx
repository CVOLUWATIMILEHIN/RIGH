import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Eye, 
  Upload, 
  AlertCircle,
  FileText,
  UserCheck,
  Power,
  ChevronRight,
  Sparkles,
  Layers,
  RefreshCw,
  TrendingUp,
  Settings,
  ArrowRight
} from "lucide-react";
import { getWebsitePopups, saveWebsitePopup, deleteWebsitePopup, saveEvents } from "../lib/db";
import { saveEventToSupabase, deleteEventFromSupabase, fetchAllCMSFromSupabase } from "../lib/supabaseCms";
import { uploadImageToSupabase, isSupabaseConfigured } from "../lib/supabase";
import { WebsitePopup } from "../types";
import teenBootcampFlyer from "../assets/images/teen_bootcamp_2026_flyer.png";

export interface EventModel {
  id: string;
  title: string;
  description: string;
  category: "YAP Conference" | "Right-Minded Teens" | "CII Programs" | "Leadership Hangouts" | "Outreach Programs";
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  status: "Draft" | "Published" | "Completed" | "Archived";
  bannerUrl: string;
  createdAt: string;
}

const DEFAULT_EVENTS: EventModel[] = [
  {
    id: "evt-1",
    title: "Youth Alignment Program (YAP) Annual Summit 2026",
    description: "Our flagship annual conference gathering over 1,500 young leaders, professionals, and change-makers in Lagos for deep spiritual alignment, executive career mentorship, and mindset re-engineering masterclasses.",
    category: "YAP Conference",
    date: "2026-11-14",
    time: "09:00 AM",
    venue: "Main Hall, University of Lagos (UNILAG) Guest House, Akoka, Lagos",
    capacity: 1500,
    registeredCount: 842,
    status: "Published",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&fit=crop&q=80",
    createdAt: "2026-05-15T09:00:00Z"
  },
  {
    id: "evt-2",
    title: "CII Leadership Orientation Camp & Career Boot Camp",
    description: "Equipping recently deployed NYSC corps members with advanced digital career tools, mock corporate panel reviews, WAEC mentorship training structures, and physical savings alignment blueprints.",
    category: "CII Programs",
    date: "2026-07-18",
    time: "10:00 AM",
    venue: "NYSC Secretariat Multipurpose Hall, Surulere, Lagos",
    capacity: 400,
    registeredCount: 156,
    status: "Published",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&fit=crop&q=80",
    createdAt: "2026-05-20T11:00:00Z"
  },
  {
    id: "evt-3",
    title: "Right-Minded Teens Growth Mindset Circle",
    description: "Formative character development, study habit audit spreadsheets, WAEC/JAMB anxiety resolution, and goal setting boards tailored specifically for secondary school teenagers.",
    category: "Right-Minded Teens",
    date: "2026-08-05",
    time: "02:00 PM",
    venue: "Community Development Hall, Ogbomoso, Oyo State",
    capacity: 200,
    registeredCount: 45,
    status: "Draft",
    bannerUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&fit=crop&q=80",
    createdAt: "2026-05-26T14:00:00Z"
  }
];

interface AdminEventsProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminEvents({ hasWriteAccess, onLogAction }: AdminEventsProps) {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Tab selector
  const [subTab, setSubTab] = useState<"events" | "popups">("events");

  // Popup Management state
  const [popups, setPopups] = useState<WebsitePopup[]>([]);
  const [loadingPopups, setLoadingPopups] = useState(false);
  const [popupSearchQuery, setPopupSearchQuery] = useState("");
  const [isPopupModalOpen, setIsPopupModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<WebsitePopup | null>(null);
  const [popupError, setPopupError] = useState("");
  const [isPopupDragging, setIsPopupDragging] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const popupFileInputRef = React.useRef<HTMLInputElement>(null);

  const [popupFormData, setPopupFormData] = useState<Omit<WebsitePopup, "id">>({
    title: "",
    description: "",
    bannerImage: "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
    eventDate: "",
    buttonText: "Register Now",
    buttonLink: "https://wa.link/fu76fd",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "High",
    active: true,
    displayRule: "once_per_visitor",
    secondaryButtonText: "Monthly Reinvention Program",
    secondaryButtonLink: "programs-reinvention"
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventModel | null>(null);
  const [formData, setFormData] = useState<Omit<EventModel, "id" | "registeredCount" | "createdAt">>({
    title: "",
    description: "",
    category: "YAP Conference",
    date: "",
    time: "",
    venue: "",
    capacity: 100,
    status: "Draft",
    bannerUrl: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Seed / load events
  const [operationFeedback, setOperationFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const initEvents = async () => {
      // 1. Fetch from Supabase shared database first
      try {
        const supaData = await fetchAllCMSFromSupabase();
        if (supaData && supaData.events && supaData.events.length > 0) {
          setEvents(supaData.events);
          return;
        }
      } catch (err) {
        console.warn("Could not retrieve Supabase events, falling back:", err);
      }

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("rma_events");
        if (saved) {
          try {
            setEvents(JSON.parse(saved));
          } catch (e) {
            setEvents(DEFAULT_EVENTS);
          }
        } else {
          // No events locally, seed defaults to cloud settings
          await saveEvents(DEFAULT_EVENTS);
          setEvents(DEFAULT_EVENTS);
        }
      }
    };
    initEvents();
    fetchPopups();

    const handleUpdate = () => {
      const saved = localStorage.getItem("rma_events");
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
        } catch (e) {}
      }
    };
    const handlePopupsUpdate = () => {
      fetchPopups();
    };
    window.addEventListener("rma_events_updated", handleUpdate);
    window.addEventListener("rma_website_popups_updated", handlePopupsUpdate);
    return () => {
      window.removeEventListener("rma_events_updated", handleUpdate);
      window.removeEventListener("rma_website_popups_updated", handlePopupsUpdate);
    };
  }, []);

  const fetchPopups = async () => {
    setLoadingPopups(true);
    try {
      const data = await getWebsitePopups();
      setPopups(data);
    } catch (err) {
      console.error("Error retrieving website popups", err);
    } finally {
      setLoadingPopups(false);
    }
  };

  const saveToStorage = async (updatedList: EventModel[]) => {
    setEvents(updatedList);
    await saveEvents(updatedList);
  };

  const handleOpenAddModal = () => {
    if (!hasWriteAccess) {
      alert("Access Denied: Only Admins can create events.");
      return;
    }
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      category: "YAP Conference",
      date: "",
      time: "",
      venue: "",
      capacity: 150,
      status: "Draft",
      bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&fit=crop&q=80"
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: EventModel) => {
    if (!hasWriteAccess) {
      alert("Access Denied: Only Admins can edit events.");
      return;
    }
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      venue: event.venue,
      capacity: event.capacity,
      status: event.status,
      bannerUrl: event.bannerUrl
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setOperationFeedback(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.venue.trim() || !formData.date || !formData.time) {
      setErrorMsg("Please populate all required fields correctly.");
      return;
    }

    let targetEvent: EventModel;

    if (editingEvent) {
      // Edit mode
      targetEvent = {
        ...editingEvent,
        ...formData,
        time: formData.time,
        date: formData.date
      };
      const updated = events.map(evt => evt.id === editingEvent.id ? targetEvent : evt);
      saveToStorage(updated);

      // Save to Supabase
      const supaRes = await saveEventToSupabase(targetEvent);
      if (!supaRes.success) {
        setOperationFeedback({ text: `Supabase Error: ${supaRes.error}`, type: "error" });
        onLogAction(`❌ [EVENT ERROR] Supabase update failed: ${supaRes.error}`);
      } else {
        setOperationFeedback({ text: `Event "${formData.title}" updated in Supabase successfully!`, type: "success" });
        onLogAction(`📝 [EVENT MODIFIED] Admin updated details for event id [${editingEvent.id}] in Supabase.`);
      }
    } else {
      // Create mode
      targetEvent = {
        id: `evt-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        capacity: Number(formData.capacity) || 100,
        registeredCount: 0,
        status: formData.status,
        bannerUrl: formData.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&fit=crop&q=80",
        createdAt: new Date().toISOString()
      };
      saveToStorage([targetEvent, ...events]);

      // Save to Supabase
      const supaRes = await saveEventToSupabase(targetEvent);
      if (!supaRes.success) {
        setOperationFeedback({ text: `Supabase Error: ${supaRes.error}`, type: "error" });
        onLogAction(`❌ [EVENT ERROR] Supabase creation failed: ${supaRes.error}`);
      } else {
        setOperationFeedback({ text: `New event "${formData.title}" created in Supabase!`, type: "success" });
        onLogAction(`📅 [EVENT CREATED] Admin spawned new event in Supabase: "${formData.title}"`);
      }
    }
    setIsModalOpen(false);
  };

  const handleTogglePublish = async (event: EventModel) => {
    if (!hasWriteAccess) return;
    const newStatus = event.status === "Published" ? "Draft" : "Published";
    const updatedEvt = { ...event, status: newStatus as any };
    const updated = events.map(evt => evt.id === event.id ? updatedEvt : evt);
    saveToStorage(updated);
    
    await saveEventToSupabase(updatedEvt);
    onLogAction(`📢 [EVENT STATUS SHIFTED] Event "${event.title}" [${event.id}] set to status: [${newStatus}] in Supabase`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Are you absolutely sure you want to permanently delete event: "${title}"?`)) {
      const updated = events.filter(evt => evt.id !== id);
      saveToStorage(updated);
      
      const supaRes = await deleteEventFromSupabase(id);
      if (!supaRes.success) {
        setOperationFeedback({ text: `Failed deleting from Supabase: ${supaRes.error}`, type: "error" });
        onLogAction(`❌ [EVENT DELETE ERROR] Supabase delete failed: ${supaRes.error}`);
      } else {
        setOperationFeedback({ text: `Event "${title}" deleted from Supabase.`, type: "success" });
        onLogAction(`🗑️ [EVENT DELETED] Admin purged event record in Supabase: "${title}" [${id}]`);
      }
    }
  };

  // Popup Campaign methods
  const handleOpenAddPopupModal = () => {
    if (!hasWriteAccess) {
      alert("Access Denied: Only Admins can create campaigns.");
      return;
    }
    setEditingPopup(null);
    setPopupFormData({
      title: "",
      description: "",
      bannerImage: "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
      eventDate: "",
      buttonText: "Register Now",
      buttonLink: "https://wa.link/fu76fd",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: "High",
      active: true,
      displayRule: "once_per_visitor",
      secondaryButtonText: "Monthly Reinvention Program",
      secondaryButtonLink: "programs-reinvention"
    });
    setPopupError("");
    setIsPopupModalOpen(true);
  };

  const handleOpenEditPopupModal = (popup: WebsitePopup) => {
    if (!hasWriteAccess) {
      alert("Access Denied: Only Admins can modify campaigns.");
      return;
    }
    setEditingPopup(popup);
    setPopupFormData({
      title: popup.title,
      description: popup.description,
      bannerImage: popup.bannerImage || "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
      eventDate: popup.eventDate || "",
      buttonText: popup.buttonText || "Register Now",
      buttonLink: popup.buttonLink || "https://wa.link/fu76fd",
      startDate: popup.startDate ? popup.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
      endDate: popup.endDate ? popup.endDate.split("T")[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: popup.priority || "High",
      active: popup.active,
      displayRule: popup.displayRule || "once_per_visitor",
      secondaryButtonText: popup.secondaryButtonText || "Monthly Reinvention Program",
      secondaryButtonLink: popup.secondaryButtonLink || "programs-reinvention"
    });
    setPopupError("");
    setIsPopupModalOpen(true);
  };

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopupError("");

    if (!popupFormData.title.trim() || !popupFormData.description.trim() || !popupFormData.buttonText.trim() || !popupFormData.buttonLink.trim()) {
      setPopupError("Please populate all required fields correctly.");
      return;
    }

    try {
      const popupId = editingPopup ? editingPopup.id : `pop-${Date.now()}`;
      
      let emailUser = "";
      try {
        const savedUser = localStorage.getItem("rma_current_logged_in_user");
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          emailUser = userObj?.email || userObj || "";
        }
      } catch (err) {}

      const newPopup: WebsitePopup = {
        ...popupFormData,
        id: popupId,
        imageUrl: popupFormData.bannerImage, // synchronize bannerImage to imageUrl key as requested!
        status: popupFormData.active ? "active" : "inactive", // status field requested
        updatedAt: new Date().toISOString(), // updatedAt field requested
        updatedBy: emailUser || "admin@rightmindsafrica.org" // updatedBy field requested
      };

      await saveWebsitePopup(newPopup);
      await fetchPopups();

      onLogAction(`✨ [POPUP CAMPAIGN UPDATED] Admin saved website popup: "${newPopup.title}" (Active: ${newPopup.active ? "YES" : "NO"}, Priority: ${newPopup.priority})`);
      setIsPopupModalOpen(false);
    } catch (err) {
      console.error(err);
      setPopupError("Failed to store database state. Please check internet connection.");
    }
  };

  const handlePopupImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePopupImageUploadProcess(file);
    }
  };

  const handlePopupImageUploadProcess = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setPopupError("Maximum allowed size is 10MB limit. This file is too large (" + (file.size / (1024 * 1024)).toFixed(1) + "MB).");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setPopupError("Unsupported format. Please choose a JPG, JPEG, PNG or WEBP image.");
      return;
    }

    setPopupError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setPopupFormData(prev => ({
        ...prev,
        bannerImage: base64Data
      }));
      // Auto success log feedback
      onLogAction(`📤 [POPUP IMAGE UPLOADED] Transformed local file "${file.name}" to asset stream`);
    };
    reader.onerror = () => {
      setPopupError("Failed to read image file content stream.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePopupImageAction = () => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      setPopupFormData(prev => ({
        ...prev,
        bannerImage: ""
      }));
      onLogAction(`🗑️ [POPUP IMAGE REMOVED] Image reference cleared from current campaign form`);
    }
  };

  const handleTogglePopupActive = async (popup: WebsitePopup) => {
    if (!hasWriteAccess) {
      alert("Access Denied: Only Admins can modify campaigns.");
      return;
    }

    try {
      const updatedPopup: WebsitePopup = {
        ...popup,
        active: !popup.active
      };
      await saveWebsitePopup(updatedPopup);
      await fetchPopups();

      onLogAction(`🔔 [POPUP STATUS SHIFTED] Popup "${popup.title}" [${popup.id}] active state set to ${updatedPopup.active ? "ON" : "OFF"}`);
    } catch (err) {
      alert("Failed to commit live state toggle.");
    }
  };

  const handleDeletePopup = async (popupId: string, title: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Are you absolutely sure you want to permanently delete popup campaign: "${title}"?`)) {
      try {
        await deleteWebsitePopup(popupId);
        await fetchPopups();
        onLogAction(`🗑️ [POPUP DELETED] Admin purged popup campaign record: "${title}" [${popupId}]`);
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const handleAutofillFromPublicEvent = (eventId: string) => {
    if (!eventId) return;
    const selectedEvt = events.find(e => e.id === eventId);
    if (!selectedEvt) return;

    setPopupFormData(prev => ({
      ...prev,
      title: selectedEvt.title,
      description: selectedEvt.description,
      bannerImage: selectedEvt.bannerUrl || "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
      eventDate: selectedEvt.date,
      buttonText: "Register Now",
      buttonLink: `#/join?profile=student`
    }));

    onLogAction(`⚡ [POPUP AUTOFILL] Admin imported event details from Public Event id [${selectedEvt.id}] into campaign popup form`);
  };

  const filteredPopups = popups.filter(pop => {
    const matchesSearch = pop.title.toLowerCase().includes(popupSearchQuery.toLowerCase()) || 
                          pop.description.toLowerCase().includes(popupSearchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || evt.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || evt.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            {subTab === "events" ? (
              <>
                <Calendar size={18} className="text-[#103D2E]" />
                Events Master Director
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-amber-500 animate-pulse" />
                Website Campaign Popups
              </>
            )}
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            {subTab === "events" 
              ? "Post schedules, direct seating capacities, and toggle orientation campaigns"
              : "Control user acquisition modals, configure display rules, and activate popup event targets"
            }
          </span>
        </div>
        {hasWriteAccess && (
          <button
            onClick={subTab === "events" ? handleOpenAddModal : handleOpenAddPopupModal}
            className="px-4 py-2.5 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-305 text-amber-300 font-bold rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-[#103D2E]/20"
          >
            <Plus size={13} className="stroke-[2.5]" />
            {subTab === "events" ? "Create Event" : "Create Popup Campaign"}
          </button>
        )}
      </div>

      {operationFeedback && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold animate-fadeIn ${
          operationFeedback.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>{operationFeedback.text}</span>
          <button onClick={() => setOperationFeedback(null)} className="text-2xs font-mono opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Segmented Sub-Tabs */}
      <div className="flex bg-slate-100/60 p-1.5 rounded-xl border border-slate-200/80 gap-1 self-start inline-flex">
        <button
          onClick={() => setSubTab("events")}
          className={`px-5 py-2 text-2xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            subTab === "events"
              ? "bg-[#103D2E] text-amber-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar size={13} />
          <span>Scheduled Events ({events.length})</span>
        </button>
        <button
          onClick={() => setSubTab("popups")}
          className={`px-5 py-2 text-2xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            subTab === "popups"
              ? "bg-[#103D2E] text-amber-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles size={13} className={subTab === "popups" ? "text-amber-350" : "text-amber-500"} />
          <span>Website Popups ({popups.length})</span>
        </button>
      </div>

      {subTab === "events" ? (
        <>
          {/* Toolbar Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center justify-between">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#103D2E]/40 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto shrink-0 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="YAP Conference">YAP Conference</option>
                <option value="CII Programs">CII Programs</option>
                <option value="Right-Minded Teens">Right-Minded Teens</option>
                <option value="Leadership Hangouts">Leadership Hangouts</option>
                <option value="Outreach Programs">Outreach Programs</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="py-12 bg-white text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              No matches found. Create or republish events to populate tables.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <div 
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-150 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200"
                >
                  {/* Event Image */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={
                        !evt.bannerUrl || evt.bannerUrl === "teen_bootcamp_2026_flyer.png" || evt.bannerUrl.includes("teen") || evt.bannerUrl.includes("bootcamp")
                          ? teenBootcampFlyer
                          : evt.bannerUrl
                      } 
                      alt={evt.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = teenBootcampFlyer;
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border shadow-sm ${
                        evt.status === "Published" 
                          ? "bg-emerald-500 text-white border-emerald-450" 
                          : evt.status === "Draft"
                            ? "bg-amber-400 text-slate-900 border-amber-350"
                            : "bg-slate-400 text-white border-slate-350"
                      }`}>
                        {evt.status}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-slate-100 text-[8px] font-mono rounded">
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight uppercase">
                        {evt.title}
                      </h3>
                      <p className="text-slate-500 text-2xs leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3 text-[10.5px] text-slate-655 text-slate-600 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="text-slate-300">|</span>
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{evt.time}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mt-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-450">Capacity Reserved:</span>
                        <span className="text-[#103D2E]">{evt.registeredCount} / {evt.capacity} seats</span>
                      </div>
                    </div>

                    {/* Event Actions */}
                    {hasWriteAccess && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleTogglePublish(evt)}
                          className={`flex-1 py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg border cursor-pointer text-center inline-flex items-center justify-center gap-1 transition-all ${
                            evt.status === "Published"
                              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          <Power size={11} />
                          {evt.status === "Published" ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all"
                          title="Edit event details"
                        >
                          <Edit2 size={11} />
                        </button>

                        <button
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition-all"
                          title="Delete event record"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Popups System Diagnostics & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[#0d221b] text-slate-100 p-5 rounded-2xl border border-emerald-900 flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl text-amber-350">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-extrabold">Campaign Promotion Engine</h4>
                <p className="text-[10.5px] text-slate-350 leading-relaxed mt-1">
                  Active popups intercept public visitor routing based on targeting priority and dates. Toggling campaigns <strong>ON / OFF</strong> switches the spotlight layout instantly. Use the quick-link or public event cloning tools to direct audiences matching ongoing cohorts.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-150 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Engine Health Diagnostics</span>
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded font-mono text-[8px] font-black uppercase tracking-widest animate-pulse">SYSTEM ONLINE</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                  <span className="block text-2xs text-slate-400 font-mono">Total</span>
                  <span className="text-sm font-black text-slate-805">{popups.length}</span>
                </div>
                <div className="bg-[#103D2E]/5 p-2 rounded-xl text-center border border-emerald-150">
                  <span className="block text-2xs text-slate-500 font-mono text-[#103D2E]">Active</span>
                  <span className="text-sm font-black text-[#103D2E]">{popups.filter(p => p.active).length}</span>
                </div>
                <div className="bg-amber-400/5 p-2 rounded-xl text-center border border-amber-204">
                  <span className="block text-2xs text-amber-700 font-mono uppercase">High</span>
                  <span className="text-sm font-black text-amber-700">{popups.filter(p => p.priority === "High" && p.active).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popups Toolbar block */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search popup campaign titles, content..."
                value={popupSearchQuery}
                onChange={(e) => setPopupSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#103D2E]/40 focus:bg-white rounded-xl text-xs text-slate-805 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Popups Cards list */}
          {loadingPopups ? (
            <div className="py-12 bg-white text-center border border-slate-200 rounded-2xl text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-[#103D2E]" size={18} />
              <span>Querying database campaign catalogs...</span>
            </div>
          ) : filteredPopups.length === 0 ? (
            <div className="py-12 bg-white text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              No campaign popups available. Create a new campaign overlay card to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPopups.map((pop) => (
                <div 
                  key={pop.id}
                  className="bg-white rounded-2xl border border-slate-150 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200"
                >
                  {/* Banner image preview */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={pop.bannerImage} 
                      alt={pop.title}
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border shadow-sm ${
                        pop.active 
                          ? "bg-emerald-500 text-white border-emerald-450" 
                          : "bg-slate-400 text-white border-slate-350"
                      }`}>
                        {pop.active ? "● Live / Active" : "○ Inactive"}
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border shadow-sm ${
                        pop.priority === "High"
                          ? "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                          : pop.priority === "Medium"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-50 border-slate-205 text-slate-700"
                      }`}>
                        Priority: {pop.priority}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight uppercase flex items-center gap-1.5">
                        {pop.title}
                      </h3>
                      <p className="text-slate-500 text-2xs leading-relaxed line-clamp-3">
                        {pop.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[10.5px] text-slate-605 font-sans">
                      {pop.eventDate && (
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                          <Clock size={12} className="text-amber-500 shrink-0" />
                          <span>Event Target: {pop.eventDate}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[9.5px]">
                        <span className="font-bold text-slate-450 uppercase font-mono text-[8px]">Display rule:</span>
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded uppercase font-mono text-[8px] font-bold">
                          {pop.displayRule.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9.5px]">
                        <span className="font-bold text-slate-455 uppercase font-mono text-[8px]">Action CTA:</span>
                        <span className="truncate max-w-[150px] font-mono text-emerald-800 underline bg-emerald-50/55 px-1 py-0.5 rounded text-[8.5px]" title={pop.buttonLink}>
                          {pop.buttonText} → {pop.buttonLink}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-dashed border-slate-100">
                        <span>Campaign Schedule:</span>
                        <span>{pop.startDate.split("T")[0]} to {pop.endDate.split("T")[0]}</span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    {hasWriteAccess && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleTogglePopupActive(pop)}
                          className={`flex-1 py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg border cursor-pointer text-center inline-flex items-center justify-center gap-1 transition-all ${
                            pop.active
                              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          <Power size={11} />
                          {pop.active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleOpenEditPopupModal(pop)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all"
                          title="Edit popup campaign card"
                        >
                          <Edit2 size={11} />
                        </button>

                        <button
                          onClick={() => handleDeletePopup(pop.id, pop.title)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition-all"
                          title="Purge campaign"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Quick Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp">
            
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-black uppercase text-slate-800">
                {editingEvent ? "Modify Event Listing" : "Spawn New Event Segment"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Event Master Title:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Teens Mental Health & Character Academy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Date scheduled:</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Time scheduled:</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g., 09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Sponsorship Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  >
                    <option value="YAP Conference">YAP Conference</option>
                    <option value="CII Programs">CII Programs</option>
                    <option value="Right-Minded Teens">Right-Minded Teens</option>
                    <option value="Leadership Hangouts">Leadership Hangouts</option>
                    <option value="Outreach Programs">Outreach Programs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Maximum Seats capacity:</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Full description / Agenda breakdown:</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Outline key speakers, modules to cover, WAEC checklists, or registration benefits..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Venue Location Address:</label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="e.g., Surulere State NYSC Secretariat Hall, Lagos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Event Banner Image URL:</label>
                  <input
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Draft Launch State:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  >
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Published">Published (Public)</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
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
                  Save Event Listing
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Quick Add/Edit Popup Campaign Modal */}
      {isPopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" onClick={() => setIsPopupModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-5xl md:max-w-6xl w-full h-[90vh] overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp text-left flex flex-col">
            
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 font-display">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                {editingPopup ? "Modify Campaign Popup" : "Define New Popup Campaign"}
              </h3>
              <button onClick={() => setIsPopupModalOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400 cursor-pointer">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* LEFT SIDE: Form Inputs with advanced Image manager */}
              <form onSubmit={handlePopupSubmit} className="lg:w-1/2 p-6 overflow-y-auto space-y-4 text-xs font-medium border-r border-slate-100 flex flex-col justify-between">
                <div className="space-y-4">
                  {popupError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold flex items-center gap-1.5 animate-bounce">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{popupError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Campaign Title (Header Text):</label>
                      <input
                        type="text"
                        required
                        value={popupFormData.title}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Annual YAP December Summit"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Target Event Date Reminder (Optional):</label>
                      <input
                        type="text"
                        value={popupFormData.eventDate || ""}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                        placeholder="e.g., Dec 5th, 2026"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Short Description (Sub-text):</label>
                    <textarea
                      required
                      rows={2}
                      value={popupFormData.description}
                      onChange={(e) => setPopupFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Summarize the value and registration instructions..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none resize-none"
                    />
                  </div>

                  {/* Advanced Image Management Section */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400">Website Popup Banner Image:</span>
                      {popupFormData.bannerImage ? (
                        <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">IMAGE DETECTED</span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">NO IMAGE</span>
                      )}
                    </div>

                    {/* Drag and drop / file selector input */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsPopupDragging(true);
                      }}
                      onDragLeave={() => setIsPopupDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsPopupDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handlePopupImageUploadProcess(file);
                      }}
                      onClick={() => popupFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isPopupDragging
                          ? "border-[#103D2E] bg-emerald-50/50 text-emerald-800"
                          : "border-slate-200 hover:border-[#103D2E]/40 hover:bg-slate-100/30 text-slate-550"
                      }`}
                    >
                      <input
                        type="file"
                        ref={popupFileInputRef}
                        onChange={handlePopupImageFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                      />

                      {popupFormData.bannerImage ? (
                        <div className="space-y-2 w-full flex flex-col items-center">
                          <div className="relative group w-36 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                            <img
                              src={popupFormData.bannerImage}
                              alt="Current banner"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Replace Asset</span>
                            </div>
                          </div>
                          <p className="font-mono text-[8px] text-slate-450 truncate max-w-[240px]">
                            {popupFormData.bannerImage.startsWith("data:") ? "Local Binary Stream Upload" : "Linked via Web Resource URL"}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1.5 py-1.5">
                          <Upload size={22} className="text-slate-400 animate-bounce" />
                          <p className="text-slate-750 text-[11px] font-extrabold text-slate-700">Drag & Drop Popup Artwork Here</p>
                          <p className="text-slate-450 text-[10px]">or click to browse local files (JPG, PNG, WEBP &bull; Max 10MB)</p>
                        </div>
                      )}
                    </div>

                    {/* Image Action buttons */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => popupFileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 bg-white border border-slate-250 hover:border-slate-350 text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 font-bold shadow-xs cursor-pointer"
                      >
                        📤 Change Image
                      </button>
                      
                      {popupFormData.bannerImage && (
                        <button
                          type="button"
                          onClick={handleRemovePopupImageAction}
                          className="py-1.5 px-3 bg-red-50 border border-red-100 text-red-650 hover:bg-red-100/50 rounded-xl transition-all flex items-center justify-center gap-1 font-bold shadow-xs cursor-pointer"
                        >
                          🗑 Remove Image
                        </button>
                      )}

                      {popupFormData.bannerImage && (
                        <button
                          type="button"
                          onClick={() => window.open(popupFormData.bannerImage, "_blank")}
                          className="py-1.5 px-3 bg-slate-100 border border-slate-205 text-slate-700 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1 font-bold shadow-xs cursor-pointer"
                          title="Preview full quality picture in new window"
                        >
                          👁 Preview
                        </button>
                      )}
                    </div>

                    {/* Manual Override URL field explicitly available to avoid losing prior power-features */}
                    <div className="pt-2 border-t border-slate-150">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Direct Image URL Override Link:</label>
                      <input
                        type="url"
                        value={popupFormData.bannerImage}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, bannerImage: e.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:bg-white rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Start Active Date:</label>
                      <input
                        type="date"
                        required
                        value={popupFormData.startDate}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">End Expiration Date:</label>
                      <input
                        type="date"
                        required
                        value={popupFormData.endDate}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Priority Rank Weight:</label>
                      <select
                        value={popupFormData.priority}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Display Session Bounds:</label>
                      <select
                        value={popupFormData.displayRule}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, displayRule: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                      >
                        <option value="once_per_visitor">Once Per Visitor (Recommended)</option>
                        <option value="daily">Once Per Day</option>
                        <option value="every_visit">Every Visit Session</option>
                        <option value="only_homepage">Only on Homepage view</option>
                        <option value="sitewide">Sitewide (Every page)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Primary CTA Button Label:</label>
                      <input
                        type="text"
                        required
                        value={popupFormData.buttonText}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                        placeholder="e.g., Register Now"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Primary CTA Route / URL:</label>
                      <input
                        type="text"
                        required
                        value={popupFormData.buttonLink}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                        placeholder="e.g., https://wa.link/fu76fd"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-emerald-50/20 border border-emerald-500/10 p-3 rounded-2xl">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-bold text-emerald-800 mb-1">Secondary Button Label (Optional):</label>
                      <input
                        type="text"
                        value={popupFormData.secondaryButtonText || ""}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, secondaryButtonText: e.target.value }))}
                        placeholder="e.g., Monthly Reinvention Program"
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#103D2E]/40 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-bold text-emerald-800 mb-1">Secondary CTA Route / URL:</label>
                      <input
                        type="text"
                        value={popupFormData.secondaryButtonLink || ""}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, secondaryButtonLink: e.target.value }))}
                        placeholder="e.g., programs-reinvention"
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#103D2E]/40 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mt-1 font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={popupFormData.active}
                        onChange={(e) => setPopupFormData(prev => ({ ...prev, active: e.target.checked }))}
                        className="rounded border-slate-300 accent-[#103D2E] scale-110"
                      />
                      <span>Publish this campaign immediately (Active status online)</span>
                    </label>
                  </div>

                  {/* Autofill selector */}
                  {events.length > 0 && !editingPopup && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl space-y-1">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-amber-700">⚡ Autofill fast track from existing public event:</label>
                      <select
                        onChange={(e) => handleAutofillFromPublicEvent(e.target.value)}
                        defaultValue=""
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-500/15 text-slate-650 rounded-xl outline-none text-[11px]"
                      >
                        <option value="" disabled>-- Select a public event --</option>
                        {events.map((evt) => (
                          <option key={evt.id} value={evt.id}>{evt.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPopupModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl uppercase tracking-wider cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    {editingPopup ? "Save Changes" : "Create Campaign"}
                  </button>
                </div>
              </form>

              {/* RIGHT SIDE: Interactive Device Live Previews */}
              <div className="hidden lg:flex lg:w-1/2 bg-slate-100 flex-col h-full overflow-hidden select-none">
                
                {/* Viewport header toggles */}
                <div className="h-12 bg-white border-b border-slate-150 px-6 flex items-center justify-between shrink-0">
                  <span className="font-mono text-[8px] font-black uppercase tracking-widest text-[#103D2E] flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-500" />
                    Live Layout Simulation
                  </span>

                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[9px]">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider cursor-pointer ${
                        previewDevice === "desktop"
                          ? "bg-[#103D2E] text-amber-300 shadow-sm"
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                    >
                      Desktop Context
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider cursor-pointer ${
                        previewDevice === "mobile"
                          ? "bg-[#103D2E] text-amber-300 shadow-sm"
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                    >
                      Mobile App Frame
                    </button>
                  </div>
                </div>

                {/* Simulated Container Workspace */}
                <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
                  {previewDevice === "desktop" ? (
                    /* DESKTOP BROWSER FRAME MOCK */
                    <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 flex flex-col text-left animate-fadeIn">
                      
                      {/* Browser Mock Navigation Controls Row */}
                      <div className="h-8 bg-slate-100 border-b border-slate-150 px-4 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full inline-block bg-red-400"></span>
                        <span className="h-2 w-2 rounded-full inline-block bg-yellow-400"></span>
                        <span className="h-2 w-2 rounded-full inline-block bg-green-400"></span>
                        <div className="text-[8px] font-mono text-slate-400 ml-2 select-all truncate max-w-[200px]">
                          https://rightmindsafrica.org/home
                        </div>
                      </div>

                      {/* Top banner visual layout representation */}
                      <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden flex flex-col justify-end p-4">
                        {popupFormData.bannerImage ? (
                          <img
                            src={
                              popupFormData.bannerImage === "teen_bootcamp_2026_flyer.png" || popupFormData.bannerImage.includes("teen_bootcamp")
                                ? teenBootcampFlyer
                                : popupFormData.bannerImage
                            }
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = teenBootcampFlyer;
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#103D2E] to-slate-900" />
                        )}

                        <div className="relative z-10 space-y-1 text-left">
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full font-mono tracking-widest max-w-max shadow-sm">
                            <Sparkles size={8} className="animate-pulse text-amber-950" />
                            RMA SPECIAL EVENT
                          </span>
                          <h3 className="font-display font-black text-sm text-white uppercase tracking-tight leading-tight line-clamp-2">
                            {popupFormData.title || "CAMPAIGN HEADER TITLE"}
                          </h3>
                        </div>

                        {/* Top right close anchor mock */}
                        <div className="absolute top-3 right-3 z-20 p-1.5 text-white bg-slate-950/40 rounded-full border border-white/10">
                          <X size={12} />
                        </div>
                      </div>

                      {/* Content block representing overlay body */}
                      <div className="p-5 space-y-4">
                        <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-3">
                          {popupFormData.description || "Website popup campaign sub-text goes here. Change values in the left form panel to instantly update details."}
                        </p>

                        {popupFormData.eventDate && (
                          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-left">
                            <Calendar className="text-amber-600 shrink-0" size={13} />
                            <div className="flex flex-col">
                              <span className="text-[7.5px] font-mono font-bold text-amber-600 uppercase tracking-widest leading-none">Schedule Countdown</span>
                              <span className="text-[9.5px] font-bold text-slate-800 uppercase tracking-tight mt-0.5">{popupFormData.eventDate}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5 text-[9px] flex-wrap">
                          <span className="px-2.5 py-1.5 text-slate-400 font-bold uppercase tracking-wider cursor-pointer">
                            Dismiss
                          </span>
                          {popupFormData.secondaryButtonText && (
                            <div className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-200">
                              <span>{popupFormData.secondaryButtonText}</span>
                            </div>
                          )}
                          <div className="px-3.5 py-1.5 bg-[#103D2E] text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <span>{popupFormData.buttonText || "Get Started"}</span>
                            <ArrowRight size={10} />
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* SMARTPHONE DEVICE FRAME REPRESENTATION */
                    <div className="w-[260px] bg-slate-950 rounded-[36px] p-2.5 border-4 border-slate-800 shadow-xl flex flex-col text-left animate-fadeIn">
                      
                      {/* Speaker notch */}
                      <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        <div className="w-8 h-1 bg-slate-900 rounded-full"></div>
                      </div>

                      {/* Inner screen content */}
                      <div className="bg-white rounded-[24px] overflow-hidden flex flex-col h-[380px] justify-between">
                        
                        {/* Top aspect banner */}
                        <div className="relative aspect-[16/10] w-full bg-slate-920 overflow-hidden flex flex-col justify-end p-3">
                          {popupFormData.bannerImage ? (
                            <img
                              src={popupFormData.bannerImage}
                              alt="Banner Preview"
                              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format";
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#103D2E] to-slate-900 opacity-60 mix-blend-multiply" />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

                          <div className="relative z-10 text-left">
                            <span className="inline-flex items-center gap-0.5 text-[6px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded-full font-mono tracking-widest max-w-max mb-1">
                              RMA EVENT
                            </span>
                            <h3 className="font-display font-black text-[10px] text-white uppercase tracking-tight leading-tight line-clamp-2">
                              {popupFormData.title || "CAMPAIGN TITLE"}
                            </h3>
                          </div>

                          <div className="absolute top-2 right-2 p-1 text-white bg-slate-950/40 rounded-full">
                            <X size={10} />
                          </div>
                        </div>

                        {/* Middle descriptions */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <p className="text-slate-500 text-[8.5px] leading-relaxed line-clamp-4">
                            {popupFormData.description || "The subtext explaining details is formatted for small displays and responsive screen structures."}
                          </p>

                          {popupFormData.eventDate && (
                            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-150 rounded-lg text-left">
                              <Calendar className="text-amber-600 shrink-0" size={10} />
                              <span className="text-[8.5px] font-bold text-slate-800 uppercase tracking-tight truncate leading-none mt-0.5">{popupFormData.eventDate}</span>
                            </div>
                          )}

                          {/* CTA options */}
                          <div className="space-y-1 pt-1 text-[8.5px]">
                            <div className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1">
                              <span>{popupFormData.buttonText || "Get Started"}</span>
                              <ArrowRight size={8} />
                            </div>
                            {popupFormData.secondaryButtonText && (
                              <div className="w-full py-1 bg-slate-100 border border-slate-200 text-slate-750 font-bold uppercase tracking-wider text-center flex items-center justify-center rounded-lg">
                                <span>{popupFormData.secondaryButtonText}</span>
                              </div>
                            )}
                            <span className="block w-full text-slate-400 font-bold uppercase tracking-wide text-center pt-0.5">
                              Dismiss Notice
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
