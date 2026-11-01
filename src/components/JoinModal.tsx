/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Check, Users, Shield, Sparkles, Send, 
  GraduationCap, Award, BookOpen, AlertCircle, Heart, Calendar 
} from "lucide-react";
import { saveRegistration, getFirestoreDb } from "../lib/db";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProfile?: string;
}

export default function JoinModal({ isOpen, onClose, defaultProfile = "" }: JoinModalProps) {
  const [profileType, setProfileType] = useState<string>("cii");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [institution, setInstitution] = useState("");
  const [aspiration, setAspiration] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Google Forms Integration States
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeFormTitle, setActiveFormTitle] = useState<string | null>(null);
  const [useGoogleForm, setUseGoogleForm] = useState(false);

  React.useEffect(() => {
    const fetchActiveForm = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        const docRef = doc(db, "settings", "google_forms");
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().activeFormId) {
          setActiveFormId(snap.data().activeFormId);
          setActiveFormTitle(snap.data().activeFormTitle || "Official Program Form");
          setUseGoogleForm(true);
        } else {
          setActiveFormId(null);
          setUseGoogleForm(false);
        }
      } catch (err) {
        console.warn("Could not load active Google Form settings inside JoinModal:", err);
      }
    };
    if (isOpen) {
      fetchActiveForm();
    }
  }, [isOpen]);

  // Custom states for 9 separate workflows
  const [batch, setBatch] = useState("Batch A 2026");
  const [stateCode, setStateCode] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [leadershipPhilosophy, setLeadershipPhilosophy] = useState("");
  const [yapTrack, setYapTrack] = useState("Leadership");
  const [yapMode, setYapMode] = useState("Physical");
  const [tshirtSize, setTshirtSize] = useState("M");
  const [preferredEvent, setPreferredEvent] = useState("RMA Annual Summit 2026");
  const [eventDate, setEventDate] = useState("2026-11-20");
  const [venue, setVenue] = useState("RMA Executive Lounge, Lagos");
  const [eventTime, setEventTime] = useState("10:00 AM");
  const [guestCount, setGuestCount] = useState(1);
  const [courseTitle, setCourseTitle] = useState("Reinvention Blueprint Masterclass");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [experienceArea, setExperienceArea] = useState("");
  const [industry, setIndustry] = useState("");
  const [volunteerDepartment, setVolunteerDepartment] = useState("Content");
  const [availableHours, setAvailableHours] = useState("5-10 hours/week");
  const [organizationName, setOrganizationName] = useState("");
  const [partnershipType, setPartnershipType] = useState("Corporate sponsor");

  const profileOptions = [
    { id: "cii", label: "Corper Impact (CII)", icon: Award, color: "text-brand-orange bg-brand-orange/10 border-brand-orange/20" },
    { id: "teens", label: "Right-Minded Teens", icon: BookOpen, color: "text-purple-650 bg-purple-50 border-purple-150" },
    { id: "young_leaders", label: "Young Leaders Program", icon: GraduationCap, color: "text-brand-blue bg-brand-blue/10 border-brand-blue/20" },
    { id: "yap", label: "YAP Conference", icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-150" },
    { id: "event", label: "Events & Hangouts", icon: Calendar, color: "text-rose-600 bg-rose-50 border-rose-150" },
    { id: "course", label: "Premium Courses", icon: BookOpen, color: "text-emerald-600 bg-emerald-50 border-emerald-150" },
    { id: "mentorship", label: "Mentorship", icon: Shield, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { id: "volunteer", label: "Volunteer Application", icon: Heart, color: "text-pink-600 bg-pink-50 border-pink-100" },
    { id: "partnership", label: "Partnership Request", icon: Sparkles, color: "text-cyan-600 bg-cyan-50 border-cyan-100" }
  ];

  // Auto-set profile type if default changes
  React.useEffect(() => {
    if (defaultProfile) {
      const dp = defaultProfile.toLowerCase();
      if (dp === "corps_member" || dp === "cii") setProfileType("cii");
      else if (dp === "teen" || dp === "teens") setProfileType("teens");
      else if (dp === "mentor" || dp === "mentorship") setProfileType("mentorship");
      else if (dp === "volunteer") setProfileType("volunteer");
      else if (dp === "partner" || dp === "partnership") setProfileType("partnership");
      else if (dp === "student") setProfileType("young_leaders");
      else if (dp === "professional") setProfileType("young_leaders");
      else if (dp === "yap") setProfileType("yap");
      else if (dp === "event") setProfileType("event");
      else if (dp === "course") setProfileType("course");
    }
  }, [defaultProfile]);

  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("[JOIN MODAL] Submit initiated:", { fullName, email, phone, location, profileType });

    if (!fullName.trim() || !email.trim() || !phone.trim() || !location.trim()) {
      console.warn("[JOIN MODAL] Form validation failed: missing required fields");
      setError("Please fill out all required fields to register.");
      return;
    }

    if (!email.includes("@")) {
      console.warn("[JOIN MODAL] Form validation failed: invalid email format");
      setError("Please provide a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("[JOIN MODAL] Calling saveRegistration...");
      
      const result = await saveRegistration({
        fullName,
        applicantName: fullName,
        email,
        phone,
        location,
        profileType,
        programType: profileType,
        institution: institution || organizationName || "",
        aspiration: aspiration || experienceArea || "",
        
        // Custom parsed variables based on selected profileType workflow
        batch,
        stateCode,
        primaryGoal,
        parentName,
        parentPhone,
        classCode: classGrade,
        class: classGrade,
        leadershipPhilosophy,
        track: yapTrack,
        mode: yapMode,
        tshirtSize,
        preferredEvent,
        eventDate,
        venue,
        time: eventTime,
        guestCount,
        courseTitle,
        paymentMethod,
        paymentReference,
        experienceArea,
        industry,
        department: volunteerDepartment,
        availableHours,
        organizationName,
        partnershipType
      } as any);

      console.log("[JOIN MODAL] saveRegistration completed successfully:", result?.registrationId || result?.id);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("[JOIN MODAL] Registration submit error:", err);
      setError(err?.message || "Something went wrong saving your registration. Please try again.");
    } finally {
      console.log("[JOIN MODAL] Cleaning up submitting state...");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setLocation("");
    setInstitution("");
    setAspiration("");
    setParentName("");
    setParentPhone("");
    setClassGrade("");
    setPaymentReference("");
    setIsSubmitted(false);
    setError("");
    onClose();
  };

  const getProfileName = (id: string) => {
    return profileOptions.find(opt => opt.id === id)?.label || "Program Hub";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="join-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          id="join-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl z-10 max-h-[92vh] flex flex-col"
        >
          {/* Top Brand Stripe */}
          <div className="h-2 bg-gradient-to-r from-brand-orange via-brand-blue to-emerald-500 w-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-brand-dark hover:bg-gray-100 p-1.5 rounded-full transition-colors z-20"
            aria-label="Close Registration"
            id="close-modal-btn"
          >
            <X size={20} />
          </button>

          {!isSubmitted ? (
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-brand-orange uppercase mb-1">
                  <Sparkles size={12} /> CENTRALIZED REGISTRATION PORTAL
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight">
                  Start Your Purpose-Driven Growth Journey
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose your targeted program or registration track below to launch your customized enrollment workflow.
                </p>
              </div>

              {/* Form Option Tab Selector */}
              {activeFormId && (
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 mb-6 w-fit">
                  <button
                    type="button"
                    onClick={() => setUseGoogleForm(false)}
                    className={`px-4 py-1.5 rounded-lg text-3xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      !useGoogleForm 
                        ? "bg-white text-slate-800 shadow-xs font-bold" 
                        : "text-slate-400 hover:text-slate-600 font-semibold"
                    }`}
                  >
                    Standard Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseGoogleForm(true)}
                    className={`px-4 py-1.5 rounded-lg text-3xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      useGoogleForm 
                        ? "bg-white text-[#103D2E] shadow-xs font-black" 
                        : "text-slate-400 hover:text-slate-600 font-semibold"
                    }`}
                  >
                    Google Form Portal
                  </button>
                </div>
              )}

              {/* Form */}
              {useGoogleForm && activeFormId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-500/10 text-left">
                    <h4 className="text-3xs font-black uppercase tracking-widest text-emerald-800 font-mono">
                      Connected Survey: {activeFormTitle}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      This application is integrated with our cloud-connected Google Form. Your responses will be logged directly into our operations database.
                    </p>
                  </div>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white h-[480px]">
                    <iframe 
                      src={`https://docs.google.com/forms/d/${activeFormId}/viewform?embedded=true`} 
                      width="100%" 
                      height="100%" 
                      frameBorder="0"
                      className="bg-white"
                    >
                      Loading application portal...
                    </iframe>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" id="onboarding-form">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Profile Category Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    1. Select Program / Registration Type: <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {profileOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = profileType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setProfileType(opt.id)}
                          className={`flex flex-col items-center justify-center p-2.5 text-center border-2 rounded-xl transition-all ${
                            isSelected
                              ? "border-brand-blue bg-brand-blue/5 text-brand-blue shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg mb-1 ${opt.color}`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-3">
                    2. Primary Personal Credentials
                  </span>
                  
                  {/* Grid Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fname" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="fname"
                        type="text"
                        required
                        placeholder="e.g. Olutosin Adesewa"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="email-input" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="phone-input" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="phone-input"
                        type="tel"
                        required
                        placeholder="e.g. +234 81 2345 6789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="location-input" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        State / City Residence <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="location-input"
                        type="text"
                        required
                        placeholder="e.g. Lagos, Nigeria"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC SEPARATE PROGRAM WORKFLOWS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-3 border-b border-slate-200 pb-1">
                    3. Workflow Details: {getProfileName(profileType)}
                  </span>

                  {/* 1. Corper Impact Initiative (CII) workflow */}
                  {profileType === "cii" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">CII Cohort Batch</label>
                          <select 
                            value={batch} 
                            onChange={(e) => setBatch(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          >
                            <option value="Batch A 2026">Batch A 2026</option>
                            <option value="Batch B 2026">Batch B 2026</option>
                            <option value="Batch C 2026">Batch C 2026</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">NYSC Call-Up State Code</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. LA/25B/4321" 
                            value={stateCode} 
                            onChange={(e) => setStateCode(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Primary Community Project Dev Goal</label>
                        <textarea 
                          placeholder="What project do you want to implement in your local primary host community?" 
                          rows={2}
                          value={primaryGoal}
                          onChange={(e) => setPrimaryGoal(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Right-Minded Teens workflow */}
                  {profileType === "teens" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Parent / Guardian Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Mr. Olusolape Adesewa" 
                            value={parentName} 
                            onChange={(e) => setParentName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Parent Contact Phone</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="e.g. +234 81 5566 2201" 
                            value={parentPhone} 
                            onChange={(e) => setParentPhone(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Secondary School & Class Grade</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Grace High School, SS3 Class" 
                          value={classGrade} 
                          onChange={(e) => setClassGrade(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Young Leaders Program workflow */}
                  {profileType === "young_leaders" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">University / Organization</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. University of Lagos" 
                            value={institution} 
                            onChange={(e) => setInstitution(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Current Year / Level</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 400 Level" 
                            value={classGrade} 
                            onChange={(e) => setClassGrade(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Describe Your Leadership Philosophy</label>
                        <textarea 
                          required
                          placeholder="What core values define your perspective on public governance or social service?" 
                          rows={2}
                          value={leadershipPhilosophy}
                          onChange={(e) => setLeadershipPhilosophy(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. YAP Conference workflow */}
                  {profileType === "yap" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Conference Track</label>
                          <select 
                            value={yapTrack} 
                            onChange={(e) => setYapTrack(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-medium"
                          >
                            <option value="Governance & Policy">Governance & Policy</option>
                            <option value="Tech Innovation">Tech Innovation</option>
                            <option value="Agribusiness & Trade">Agribusiness & Trade</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Attendance Mode</label>
                          <select 
                            value={yapMode} 
                            onChange={(e) => setYapMode(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-medium"
                          >
                            <option value="Physical Venue">Physical Venue</option>
                            <option value="Virtual Live">Virtual Live</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">T-Shirt Size Selection</label>
                          <select 
                            value={tshirtSize} 
                            onChange={(e) => setTshirtSize(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-medium"
                          >
                            <option value="S">Small (S)</option>
                            <option value="M">Medium (M)</option>
                            <option value="L">Large (L)</option>
                            <option value="XL">Extra Large (XL)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Events & Hangouts workflow */}
                  {profileType === "event" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Target Event Hub</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Abuja Youth Executive Hangout" 
                            value={preferredEvent} 
                            onChange={(e) => setPreferredEvent(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Preferred Location / Venue</label>
                          <input 
                            type="text" 
                            required
                            value={venue} 
                            onChange={(e) => setVenue(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Scheduled Date</label>
                          <input 
                            type="date" 
                            value={eventDate} 
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Arrival Time</label>
                          <input 
                            type="text" 
                            value={eventTime} 
                            onChange={(e) => setEventTime(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Accompanied Guests</label>
                          <input 
                            type="number" 
                            min={1}
                            value={guestCount} 
                            onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. Premium Courses workflow */}
                  {profileType === "course" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Course Title Catalog</label>
                        <select 
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-semibold"
                        >
                          <option value="Reinvention Blueprint Masterclass">Reinvention Blueprint Masterclass ($35)</option>
                          <option value="High Income Freelance Bootcamp">High Income Freelance Bootcamp ($50)</option>
                          <option value="Moral Leadership Foundations">Moral Leadership Foundations (Scholarship Free)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Payment Channel</label>
                          <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          >
                            <option value="Transfer">Bank Direct Transfer</option>
                            <option value="Card">Visa/Mastercard Online gateway</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Teller / Transaction Reference</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. TR-938217-02" 
                            value={paymentReference} 
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. Mentorship Applications workflow */}
                  {profileType === "mentorship" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Academic / Career Phase</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Job Seeker / Pre-service" 
                            value={experienceArea} 
                            onChange={(e) => setExperienceArea(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Desired Mentorship Sector</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Tech Management, Public Sector" 
                            value={industry} 
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">What development area do you desire assistance in most?</label>
                        <textarea 
                          required
                          placeholder="e.g. Building personal character accountability systems under mentor guides..." 
                          rows={2}
                          value={aspiration}
                          onChange={(e) => setAspiration(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 8. Volunteer Applications workflow */}
                  {profileType === "volunteer" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Primary Volunteering Department</label>
                          <select 
                            value={volunteerDepartment} 
                            onChange={(e) => setVolunteerDepartment(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-semibold"
                          >
                            <option value="Content">Content Writer & Creator</option>
                            <option value="Graphics">Graphic Illustrator / Designer</option>
                            <option value="Operations">State Logistics Command</option>
                            <option value="Facilitators">School/Teens Facilitator</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Hours Available of Commitment</label>
                          <select 
                            value={availableHours} 
                            onChange={(e) => setAvailableHours(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          >
                            <option value="5-10 hours/week">5-10 hours/week</option>
                            <option value="10-20 hours/week">10-20 hours/week</option>
                            <option value="Over 20 hours/week">Over 20 hours/week</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 9. Partnership Requests workflow */}
                  {profileType === "partnership" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Organization / Brand Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Adesewa Corporate Foundation" 
                            value={organizationName} 
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Partnership Alignment Range</label>
                          <select 
                            value={partnershipType} 
                            onChange={(e) => setPartnershipType(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-medium"
                          >
                            <option value="Corporate sponsor">Corporate sponsor</option>
                            <option value="Academic partner">Academic partner</option>
                            <option value="NGO ally">NGO community ally</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Onboarding Affirmation */}
                <div className="bg-brand-softblue/80 rounded-xl p-3 border border-brand-blue/15 text-xs text-brand-blue flex items-start gap-2">
                  <span className="bg-brand-blue/15 p-1 rounded-md text-brand-blue text-center shrink-0 font-bold">RM</span>
                  <div>
                    <p className="font-semibold mb-0.5">Mindset Covenant:</p>
                    <p className="text-gray-600 leading-normal">
                      By joining, I commit to active learning, pursuing purposeful living, maintaining high ethical standards, and taking responsibility for my leadership and growth paths.
                    </p>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  id="submit-form-btn"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-brand-blue hover:bg-brand-blue/95 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-brand-blue/10 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSubmitting ? "opacity-75 cursor-wait" : ""
                  }`}
                >
                  <Send size={14} /> {isSubmitting ? "Registering and securing your seat..." : "Submit Registration & Lock Seat"}
                </button>
              </form>
              )}
            </div>
          ) : (
            /* Success Response Block */
            <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-50 shadow-inner"
              >
                <Check size={38} className="stroke-[3]" />
              </motion.div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold rounded-full uppercase tracking-widest">
                  Registration Successful
                </span>
                <h4 className="text-2.5xl sm:text-3xl font-bold text-brand-blue tracking-tight">
                  Welcome aboard, {fullName.split(" ")[0]}!
                </h4>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Your seat for the <strong className="text-brand-dark">{getProfileName(profileType)} Track</strong> was successfully locked.
                </p>
              </div>

              {/* HIGH VISIBILITY ACTION CARD (POP-UP COMMUNITY ACCESS) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
                className="bg-emerald-50/95 border-2 border-emerald-500 rounded-2xl p-5 w-full max-w-md text-center shadow-xl relative overflow-hidden"
              >
                {/* Glowing top label */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#0088cc]" />

                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white font-black text-[9px] rounded-full uppercase tracking-widest leading-none shadow-sm animate-pulse">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Action Required Immediately
                  </div>

                  <h5 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug tracking-tight">
                    Join the Official RMA Community Space Chat!
                  </h5>

                  <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
                    Click the official green button below to enter your community group chat and start interacting with your cohort mentors and peer leaders right away with zero delays.
                  </p>

                  <div className="w-full space-y-2 pt-1">
                    <a
                      href="https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba56] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.015] duration-200 active:scale-95"
                    >
                      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.636-1.023-5.115-2.884-6.978C16.53 1.9 14.05 1.171 11.413 1.171c-5.438 0-9.863 4.42-9.867 9.864 0 1.702.443 3.366 1.293 4.811L1.8 21.01l5.222-1.37a9.8 9.8 0 0 0 4.822 1.144z"/>
                      </svg>
                      Click to Join WhatsApp Group Room
                    </a>

                    <a
                      href="https://t.me/+_iA-Xr3CqEoyYzhk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-[#0088cc] hover:bg-[#0077b3] text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 opacity-90 hover:opacity-100 transition-all hover:shadow-[#0088cc]/10 shadow-sm"
                    >
                      <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.2-.01-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.2z"/>
                      </svg>
                      Alternative: Join Telegram Gateway
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Dynamic Action Details */}
              <div className="bg-brand-light border border-gray-200 rounded-2xl p-5 w-full max-w-md text-left space-y-3.5 shadow-sm text-sm">
                <h5 className="font-bold text-brand-blue flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <Sparkles size={16} className="text-brand-orange animate-pulse" /> Future Action Sequences:
                </h5>

                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-brand-blue/10 text-brand-blue font-bold rounded-full flex items-center justify-center text-xs shrink-0 self-start mt-0.5">1</div>
                  <p className="text-gray-600 leading-relaxed text-xs">
                    An automated confirmation welcome packet with learning curriculum PDFs will arrive at <strong className="text-brand-dark font-medium">{email}</strong> within seconds.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-brand-blue/10 text-brand-blue font-bold rounded-full flex items-center justify-center text-xs shrink-0 self-start mt-0.5">2</div>
                  <p className="text-gray-600 leading-relaxed text-xs">
                    Our team will review your application. Registered updates instantly synchronize across authorized dashboard systems.
                  </p>
                </div>
              </div>

              {/* Success Quote */}
              <p className="italic text-2xs text-slate-400 font-mono tracking-tight">
                "Small steps of disciplined thought translate to colossal strides of global influence."
              </p>

              <button
                onClick={handleReset}
                id="success-dismiss-btn"
                className="px-6 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Go Back to Right Minds Africa Portal
              </button>
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
