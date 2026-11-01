import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  UserPlus, 
  Activity, 
  Volume2, 
  Check, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  Bookmark,
  CalendarDays
} from "lucide-react";
import { Registration, VisitorCheckIn } from "../lib/db";

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "member" | "checkin" | "announcement";
  onSaveMember: (memberData: Omit<Registration, "id" | "registeredAt">) => void;
  onSaveCheckIn: (checkIn: Omit<VisitorCheckIn, "id" | "checkedInAt">) => void;
  onSaveAnnouncement: (msg: string) => void;
  uniqueLocations: string[];
}

export default function QuickCreateModal({
  isOpen,
  onClose,
  initialTab,
  onSaveMember,
  onSaveCheckIn,
  onSaveAnnouncement,
  uniqueLocations
}: QuickCreateModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"member" | "checkin" | "announcement">("member");

  // Sync sub tab when opened from different header triggers
  useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Member form state
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mProfile, setMProfile] = useState("cii");
  const [mLocation, setMLocation] = useState("Lagos State");
  const [mBatch, setMBatch] = useState("Cohort 6");
  const [mInstitution, setMInstitution] = useState("");
  const [mAspiration, setMAspiration] = useState("");

  // CheckIn form state
  const [cName, setCName] = useState("");
  const [cLocation, setCLocation] = useState("Lagos Command");
  const [cPurpose, setCPurpose] = useState("Evaluating Mindset Seminars");

  // Announcement state
  const [annText, setAnnText] = useState("");

  // Success messages
  const [successMsg, setSuccessMsg] = useState("");

  const resetForms = () => {
    setMName("");
    setMEmail("");
    setMPhone("");
    setMInstitution("");
    setMAspiration("");
    setCName("");
    setAnnText("");
    setSuccessMsg("");
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !mEmail) return;

    onSaveMember({
      fullName: mName.trim(),
      email: mEmail.trim(),
      phone: mPhone.trim() || "+234 800 000 0000",
      profileType: mProfile,
      location: mLocation,
      batch: mBatch,
      institution: mInstitution.trim() || undefined,
      aspiration: mAspiration.trim() || undefined,
      status: "Received",
      notes: "Administratively created entry using operations deck."
    });

    setSuccessMsg("🎉 Candidate dossier added successfully to registry!");
    setTimeout(() => {
      resetForms();
      onClose();
    }, 1500);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName) return;

    const deviceType = window.innerWidth < 768 ? "Mobile Node" : "Desktop Node";
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const brand = isIOS ? "Safari Terminal" : "Chrome Engine";

    onSaveCheckIn({
      name: cName.trim(),
      location: cLocation,
      deviceType: `${deviceType} - ${brand}`,
      purpose: cPurpose
    });

    setSuccessMsg("👋 Live check-in recorded successfully!");
    setTimeout(() => {
      resetForms();
      onClose();
    }, 1500);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annText.trim()) return;

    onSaveAnnouncement(annText.trim());

    setSuccessMsg("📢 Top marquee banner announcement push complete!");
    setTimeout(() => {
      resetForms();
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A1A14]/30 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-md overflow-hidden z-20 text-left border-t-4 border-t-[#103D2E]"
          >
            {/* Header banner */}
            <div className="bg-[#103D2E] text-white p-5 flex justify-between items-center relative">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#103D2E] flex items-center justify-center font-black">
                  ➕
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-amber-300">ADMIN QUICK TRIGGER</h3>
                  <p className="text-[10px] text-slate-350 font-mono tracking-widest uppercase">Direct Write-Into Datastore</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sub-tabs selections */}
            <div className="flex bg-slate-50 border-b border-slate-150 p-1">
              <button
                onClick={() => { setActiveSubTab("member"); setSuccessMsg(""); }}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSubTab === "member" ? "bg-white text-[#103D2E] shadow-xs border border-slate-200" : "text-slate-550 hover:text-slate-800"
                }`}
              >
                <UserPlus size={11} /> Nominee
              </button>
              <button
                onClick={() => { setActiveSubTab("checkin"); setSuccessMsg(""); }}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSubTab === "checkin" ? "bg-white text-[#103D2E] shadow-xs border border-slate-200" : "text-slate-550 hover:text-slate-800"
                }`}
              >
                <Activity size={11} /> Check-In
              </button>
              <button
                onClick={() => { setActiveSubTab("announcement"); setSuccessMsg(""); }}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSubTab === "announcement" ? "bg-white text-[#103D2E] shadow-xs border border-slate-200" : "text-slate-550 hover:text-slate-800"
                }`}
              >
                <Volume2 size={11} /> Announcement
              </button>
            </div>

            {/* Form body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {successMsg ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 text-center space-y-3.5"
                  >
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-150">
                      <Check size={24} className="animate-bounce" />
                    </div>
                    <p className="text-xs font-black text-slate-800 leading-normal">{successMsg}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tight font-medium">Auto-syncing real-time partitions buffer...</p>
                  </motion.div>
                ) : activeSubTab === "member" ? (
                  <motion.form key="member" onSubmit={handleMemberSubmit} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Full Nominee Name:</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={mName}
                          onChange={(e) => setMName(e.target.value)}
                          placeholder="e.g. Olosunde Louis"
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                        />
                        <User size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Email Address:</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={mEmail}
                            onChange={(e) => setMEmail(e.target.value)}
                            placeholder="louis@rma.org"
                            className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                          />
                          <Mail size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Phone Line:</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={mPhone}
                            onChange={(e) => setMPhone(e.target.value)}
                            placeholder="+234 810..."
                            className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                          />
                          <Phone size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Cohort Profile:</label>
                        <select
                          value={mProfile}
                          onChange={(e) => setMProfile(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-white font-medium text-slate-700 cursor-pointer"
                        >
                          <option value="cii">CII Fellow</option>
                          <option value="corps_member">Corps Member</option>
                          <option value="student">University Student</option>
                          <option value="teen">Teens Academy</option>
                          <option value="mentor">Assessor / Mentor</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Geographic Locale:</label>
                        <select
                          value={mLocation}
                          onChange={(e) => setMLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-white font-medium text-slate-700 cursor-pointer"
                        >
                          <option value="Lagos State">Lagos State</option>
                          <option value="Ogun State">Ogun State</option>
                          <option value="Osun State">Osun State</option>
                          <option value="Oyo State">Oyo State</option>
                          <option value="FCT Abuja">FCT Abuja</option>
                          <option value="Kano State">Kano State</option>
                          <option value="Enugu State">Enugu State</option>
                          <option value="Niger State">Niger State</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Current Batch:</label>
                        <input
                          type="text"
                          value={mBatch}
                          onChange={(e) => setMBatch(e.target.value)}
                          placeholder="e.g. Cohort 6"
                          className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Affiliation/Institution:</label>
                        <input
                          type="text"
                          value={mInstitution}
                          onChange={(e) => setMInstitution(e.target.value)}
                          placeholder="e.g. Unilag"
                          className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Primary Aspiration/Goal:</label>
                      <input
                        type="text"
                        value={mAspiration}
                        onChange={(e) => setMAspiration(e.target.value)}
                        placeholder="e.g. Remote work, Business branding"
                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 font-black uppercase tracking-wide rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-990/15 mt-2"
                    >
                      <UserPlus size={14} /> Commit Nominee Dossier
                    </button>
                  </motion.form>
                ) : activeSubTab === "checkin" ? (
                  <motion.form key="checkin" onSubmit={handleCheckInSubmit} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Visitor Guest Name:</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cName}
                          onChange={(e) => setCName(e.target.value)}
                          placeholder="e.g. Adebayo Daniel"
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                        />
                        <User size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Visitor Area Locale:</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cLocation}
                          onChange={(e) => setCLocation(e.target.value)}
                          placeholder="e.g. Lagos Command, Virtual Node"
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-800 font-medium"
                        />
                        <MapPin size={13} className="absolute left-3 top-2.5 text-[#E76F51]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Check-In Context / Purpose:</label>
                      <select
                        value={cPurpose}
                        onChange={(e) => setCPurpose(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-white font-medium text-slate-700 cursor-pointer"
                      >
                        <option value="Evaluating Mindset Seminars">Evaluating Mindset Seminars</option>
                        <option value="Enrolling in CII Cohort">Enrolling in CII Cohort</option>
                        <option value="Requesting Executive HR Mentorship">Requesting Executive HR Mentorship</option>
                        <option value="Browsing Community Accomplishments">Browsing Community Accomplishments</option>
                        <option value="General Support Service Consultation">General Support Service Consultation</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wide rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-600/15 mt-2"
                    >
                      <Activity size={14} /> Commit Live Check-In
                    </button>
                  </motion.form>
                ) : (
                  <motion.form key="announcement" onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    
                    <div className="space-y-1.5 text-left">
                      <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                        Administrators can rapidly broadcast important system updates or state announcements directly onto the public website's scrolling top marquee ticks banner.
                      </p>
                      
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-404 font-mono">Announcement Message Text:</label>
                      <textarea
                        required
                        rows={3}
                        value={annText}
                        onChange={(e) => setAnnText(e.target.value)}
                        placeholder="e.g. 📢 REGISTRATION NOTICE: Corper Impact Initiative (CII) Cohort 6 applications close this weekend. Actively secure your nomination pass..."
                        className="w-full p-3 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none focus:bg-slate-50/50 transition-all text-slate-805 font-medium placeholder-slate-400 resize-none font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#E76F51] hover:bg-[#cf5b3e] text-white font-black uppercase tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[#E76F51]/15 mt-2"
                    >
                      <Volume2 size={14} /> Publish Ticker Broadcaster
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
