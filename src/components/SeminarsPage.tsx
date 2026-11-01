/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveRegistration } from "../lib/db";
import { PageContainer } from "./PageContainer";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  Gem
} from "lucide-react";
import brandLogo from "../assets/images/brand_logo_official_new_1780385523572.png";

interface SeminarsPageProps {
  onBack: () => void;
  onOpenJoin: (profile?: string) => void;
}

export default function SeminarsPage({ onBack, onOpenJoin }: SeminarsPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "Young Professional",
    selectedSeminar: "seminar-mindset",
    location: "",
    registrationPath: "Corporate/Company Registration (Team)",
    trainingDuration: "3-Day Intensive Block"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const seminarsList = [
    {
      id: "seminar-mindset",
      title: "Mindset Architecture & Corporate EQ Masterclass",
      badge: "PROFESSIONAL EXCELLENCE",
      date: "Saturday, June 6, 2026",
      time: "10:00 AM - 1:00 PM (GMT+1)",
      location: "Hybrid (Lagos Hub live-sync & Zoom Rooms)",
      seatsLeft: "34 seats remaining",
      description: "A professional development experience designed to demolish anxiety, rebuild workplace emotional intelligence (EQ), and train undergraduates and young executives on strategic task delivery and professional composure.",
      benefits: [
        "Eliminating corporate anxiety and self-doubt",
        "Developing elite soft skills & responsive coordination",
        "Frameworks for cross-team alignment and communication",
        "Resume and LinkedIn priority reviews with Gracious-Esther"
      ]
    },
    {
      id: "seminar-corporate",
      title: "Staff Peak-Efficiency & Operational Standards Training",
      badge: "CORPORATE & INDIVIDUAL PATHS",
      date: "Saturday, June 20, 2026",
      time: "9:00 AM - 12:30 PM (GMT+1)",
      location: "Physical Executive Suite, Lagos & Virtual Streaming",
      seatsLeft: "Registration open (Paths & blocks defined below)",
      description: "Dedicated corporate and individual capability building for mid-level managers, tech squads, and business professionals aiming for elite operational velocity, task transparency, and master productivity SOPs.",
      benefits: [
        "Corporate/Company Registration: Customized group sessions to upskill entire operational teams.",
        "Individual Registration: Intensive single-person enrollment for professional growth.",
        "Training duration blocks available: 3-Day Intensive, 1-Week Immersion, and 2-Week Masterclass.",
        "Practical tools: Notion operation models, task priority boards, and official RMA certificates."
      ]
    },
    {
      id: "seminar-undergrad",
      title: "Future-Readiness Roadmap (Undergraduates & Fresh Graduates)",
      badge: "GLOBAL SOURCING FREE CLASS",
      date: "Saturday, July 4, 2026",
      time: "11:00 AM - 1:30 PM (GMT+1)",
      location: "Zoom Online Broadcast",
      seatsLeft: "Unlimited virtual entries",
      description: "An intensive strategy session for Nigerian undergraduates and extremely recent graduates on how to side-step local job constraints and tap into global freelancing, contracting, and VA systems while serving.",
      benefits: [
        "Navigating international contractor portals",
        "Structuring ATS-optimized professional summaries",
        "Managing PPA tasks alongside continuous career projects",
        "Formulating weekly savings targets from service allowance"
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!formData.fullName || !formData.email || !formData.phone || !formData.location) {
      setSubmitError("Please fill in all required fields to register.");
      return;
    }

    try {
      setIsSubmitting(true);
      await saveRegistration({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        profileType: `seminar-${formData.selectedSeminar}`,
        location: formData.location,
        aspiration: `As a ${formData.status}, seeking key value from monthly educational seminar: ${formData.selectedSeminar}.${formData.selectedSeminar === "seminar-corporate" ? ` Path: ${formData.registrationPath}, Duration: ${formData.trainingDuration}.` : ""}`
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-950 font-sans pt-24 pb-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(67,97,238,0.05),transparent_40%)] pointer-events-none" />
      
      <PageContainer className="relative z-10">
        
        {/* TOP BAR BRAND CRUMB */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-12">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-705 border border-slate-200 shadow-sm rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Hub
            </button>
            <div className="h-6 w-[1.5px] bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-0.5 border border-slate-200 overflow-hidden shrink-0">
                <img
                  src={brandLogo}
                  alt="Right Minds Africa Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display font-black text-brand-blue text-xs sm:text-sm leading-none uppercase">RMA ACADEMY</span>
                <span className="text-[10px] font-black tracking-widest text-[#22c55e] leading-none uppercase mt-0.5">SEMINAR HUB</span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-black tracking-widest uppercase rounded-full font-mono">
            <Sparkles size={11} className="animate-pulse" /> NEW MONTHLY MASTERCLASSES
          </span>
        </div>

        {/* HERO HEADER */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black text-brand-blue uppercase tracking-widest bg-brand-blue/5 px-3 py-1.5 rounded-full border border-brand-blue/10">
            Professional Capacity Building
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-blue tracking-tight font-display uppercase leading-tight">
            MONTHLY LEADERSHIP & Operational <span className="text-brand-orange">SEMINARS</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            We deliver result-oriented leadership, operational peak-efficiency training, and mindset-reset classes. From corporate staff training modules to youth global readiness seminars.
          </p>
        </div>

        {/* PAGE GRID: MAIN LIST VS REGISTRATION FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT LIST: DYNAMIC CARDS */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-brand-orange" /> CALENDAR OF SCHEDULED MASTERCLASSES (2026)
            </h3>

            {seminarsList.map((sem) => (
              <div 
                key={sem.id}
                className="bg-white border-2 border-slate-150 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-brand-blue/25 transition-all relative group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-[9px] font-black tracking-wider uppercase rounded font-mono">
                    {sem.badge}
                  </span>
                  <span className="text-[11px] font-black tracking-widest text-[#22c55e] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                    {sem.seatsLeft}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-brand-blue font-display leading-snug group-hover:text-brand-orange transition-colors uppercase">
                  {sem.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  {sem.description}
                </p>

                {/* Logistics */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-[11px] font-bold text-slate-650 bg-slate-50/50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-brand-orange shrink-0" />
                    <span className="truncate">{sem.date}</span>
                  </div>
                  <div className="flex items-center gap-1 border-x border-slate-200 px-2">
                    <Clock size={12} className="text-brand-blue shrink-0" />
                    <span className="truncate">{sem.time}</span>
                  </div>
                  <div className="flex items-center gap-1 pl-1">
                    <MapPin size={12} className="text-[#22c55e] shrink-0" />
                    <span className="truncate">{sem.location}</span>
                  </div>
                </div>

                {/* Key Pillars */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-405 uppercase tracking-widest font-mono">CORE ACADEMIC OUTCOMES:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sem.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
                        <CheckCircle2 size={12} className="text-[#22c55e] mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Select trigger */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, selectedSeminar: sem.id }));
                      const el = document.getElementById("seminar-reg-box");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-brand-orange hover:text-brand-blue uppercase tracking-widest transition-all cursor-pointer"
                  >
                    SELECT THIS CLASS FOR REGISTRATION &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COL: REGISTER FORM */}
          <div className="lg:col-span-5" id="seminar-reg-box">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none" />
              
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-brand-blue uppercase tracking-wide">
                      RESERVATION SECURED SUCCESSFULLY!
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      Congratulations! Your seat for the selected monthly seminar has been securely reserved. We have transmitted the syllabus, calendar invite, and online link credentials to your email.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      REGISTER FOR ANOTHER CLASS
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-brand-blue uppercase tracking-wide flex items-center gap-1.5">
                      <Award size={16} className="text-brand-orange" /> MASTERCLASS SLOT RESERVATION
                    </h3>
                    <p className="text-[11px] text-slate-400">Fill standard corporate credentials below to lock your attendance portal instantly.</p>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-rose-50 border border-rose-220 text-rose-750 rounded-xl text-xs font-bold leading-normal">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">SELECT MONTHLY MASTERCLASS *</label>
                    <select
                      value={formData.selectedSeminar}
                      onChange={(e) => setFormData({...formData, selectedSeminar: e.target.value})}
                      className="w-full text-xs px-2.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-brand-blue font-black focus:outline-none focus:border-brand-blue font-display"
                    >
                      <option value="seminar-mindset">June 6 • Mindset Architecture Masterclass</option>
                      <option value="seminar-corporate">June 20 • Staff Efficiency & Operational Standards</option>
                      <option value="seminar-undergrad">July 4 • Undergrad Future-Readiness Roadmap</option>
                    </select>
                  </div>

                  {formData.selectedSeminar === "seminar-corporate" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block font-bold">REGISTRATION PATH *</label>
                        <select
                          value={formData.registrationPath}
                          onChange={(e) => setFormData({...formData, registrationPath: e.target.value})}
                          className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-amber-505"
                        >
                          <option value="Corporate/Company Registration (Team)">Corporate/Company Registration (Team upsell)</option>
                          <option value="Individual Registration (Single)">Individual Registration (Single enrollment)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block font-bold">TRAINING BLOCKS & DURATIONS *</label>
                        <select
                          value={formData.trainingDuration}
                          onChange={(e) => setFormData({...formData, trainingDuration: e.target.value})}
                          className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-amber-505"
                        >
                          <option value="3-Day Intensive Block">3-Day Intensive Block</option>
                          <option value="1-Week Immersion Block">1-Week Immersion Block</option>
                          <option value="2-Week Masterclass Block">2-Week Masterclass Block</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Company Represent"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:border-brand-blue focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:border-brand-blue focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">WhatsApp MOBILE *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +234 810 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:border-brand-blue focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">CURRENT STATUS *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full text-xs px-2 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-slate-705 font-bold focus:outline-none"
                      >
                        <option>Undergraduate Student</option>
                        <option>Active Corps Member</option>
                        <option>Young Professional</option>
                        <option>Company Rep / HR Officer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">CITY & STATE *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lagos, Abuja"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:border-brand-blue focus:outline-none transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      isSubmitting ? "opacity-75 cursor-wait" : ""
                    }`}
                  >
                    <Send size={14} /> {isSubmitting ? "RESERVING MY SLOT..." : "REGISTRATION COMPLETED SLOT"}
                  </button>
                  <p className="text-center text-[9px] text-slate-400 font-mono">Zoom and physical access passes will be dispatched within 4 hrs.</p>
                </form>
              )}
            </div>

            {/* TRUST CORPS BADGE FOOTER */}
            <div className="mt-6 bg-slate-100 border border-slate-200 p-4 rounded-2xl flex items-start gap-3">
              <Gem size={20} className="text-brand-orange shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue block">Academy Standards Verified</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  All seminar programs adhere directly to Right Minds Africa Hub's professional standards. Our curricula focus purely on mindset recalibration, hard soft skills, corporate EQ, and actual workplace efficiency. No generic motivational speeches.
                </p>
              </div>
            </div>
          </div>

        </div>

      </PageContainer>
    </div>
  );
}
