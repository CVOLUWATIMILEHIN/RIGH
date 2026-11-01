/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Registration } from "../lib/db";
import { 
  X, 
  Mail, 
  Phone, 
  Trash2, 
  Check, 
  Building, 
  Briefcase, 
  Calendar, 
  ExternalLink,
  MessageSquare,
  Bookmark,
  ShieldAlert
} from "lucide-react";

interface AdminCandidateDrawerProps {
  registration: Registration | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, notes: string, extras?: any) => void;
  onDeleteCandidate: (id: string) => void;
  userRole?: string;
}

export default function AdminCandidateDrawer({ 
  registration, 
  onClose,
  onUpdateStatus,
  onDeleteCandidate,
  userRole
}: AdminCandidateDrawerProps) {
  
  const [status, setStatus] = useState("Received");
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copiedVolEmail, setCopiedVolEmail] = useState(false);

  const getVolunteerTracks = () => {
    if (!registration) return "Graphic Designer / Social Media Manager";
    if (!registration.aspiration) return "Graphic Designer / Social Media Manager";
    const match = registration.aspiration.match(/Volunteer Tracks:\s*\[\s*([^\]]+)\s*\]/);
    return match ? match[1] : "Graphic Designer / Social Media Manager";
  };

  // Sync state if selected nominee changes
  useEffect(() => {
    if (registration) {
      setStatus((registration as any).status || "Received");
      setNotes((registration as any).notes || "");
    }
    setIsSaved(false);
    setShowConfirmDelete(false);
  }, [registration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (registration) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [registration, onClose]);

  if (!registration) return null;

  const handleSave = () => {
    onUpdateStatus(registration.id, status, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleQuickToggle = () => {
    const nextStatus = status === "Shortlisted" ? "Enrolled" : "Shortlisted";
    setStatus(nextStatus);
    onUpdateStatus(registration.id, nextStatus, notes);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formattedDate = new Date(registration.registeredAt).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Preset communication templates
  const encodedEmailSubject = encodeURIComponent(`RightMinds Africa Training Update — Welcome, ${registration.fullName}!`);
  const encodedEmailBody = encodeURIComponent(
    `Hello ${registration.fullName},\n\n` +
    `Thank you for registering for the RightMinds Africa (RMA) leadership and mindset re-engineering programs.\n\n` +
    `An assessor was assigned to review your profile logs, and yours is currently status marked as [${status}]. We are excited about your career aspiration: "${registration.aspiration || 'N/A'}".\n\n` +
    `Expect more information shortly regarding the next operational sync!\n\n` +
    `Best regards,\nRightMinds Africa Administrative Registry Deck`
  );
  
  const encodedWhatsAppText = encodeURIComponent(
    `Hello ${registration.fullName}, this is RightMinds Africa. We have reviewed your register nomination as a ${registration.profileType === 'cii' ? 'CII Fellow' : 'Corps Member nominee'}. Let's discuss your training schedule!`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Content */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in overflow-hidden border-l border-slate-150">
        
        {/* Drawer Header */}
        <div className="bg-[#0E3A2F] text-white p-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-display font-black text-lg uppercase tracking-tight">Applicant Portfolio</h3>
            <p className="text-[10px] text-[#E76F51] font-mono tracking-widest uppercase">Registry Dossier Profile Review</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable details view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Visual Profile Card */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-brand-blue/10 border-2 border-brand-blue flex items-center justify-center text-brand-blue font-mono font-black text-lg shrink-0">
              {getInitials(registration.fullName)}
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 text-base">{registration.fullName}</h4>
              <p className="text-[10px] font-black uppercase text-brand-orange bg-[#E76F51]/10 border border-[#E76F51]/20 rounded px-1.5 py-0.5 w-max">
                {registration.profileType.toUpperCase()} APPLICANT
              </p>
            </div>
          </div>

          {/* Quick-Toggle Status Widget */}
          <div className="bg-[#FAF8F3] border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 font-mono">Dossier Quick-Action</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/70 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live DB Sync
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-150/70">
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono tracking-tight">Current Dossier Status</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black tracking-wide uppercase px-2 py-0.5 rounded-md ${
                    status === "Shortlisted" 
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-150" 
                      : status === "Enrolled" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickToggle}
                className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 select-none cursor-pointer duration-200 ${
                  status === "Shortlisted"
                    ? "bg-[#103D2E] hover:bg-[#0E3A2F] text-white"
                    : "bg-indigo-650 hover:bg-indigo-700 text-white"
                }`}
                id="quick-status-toggle-btn"
              >
                <span>🚀 Switch to </span>
                <strong className={status === "Shortlisted" ? "text-amber-300 font-black uppercase" : "text-amber-200 font-black uppercase"}>
                  {status === "Shortlisted" ? "Enrolled" : "Shortlisted"}
                </strong>
              </button>
            </div>
          </div>

          {/* Core Information Metrics */}
          <div className="space-y-3.5">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono border-b border-slate-100 pb-1">
              Nominative Credentials
            </h5>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-150/50">
                <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Email address:</span>
                <a 
                  href={`mailto:${registration.email}`} 
                  className="font-extrabold text-slate-800 hover:text-brand-blue select-all block break-all leading-tight"
                >
                  {registration.email}
                </a>
              </div>

              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-150/50">
                <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Phone number:</span>
                <a 
                  href={`tel:${registration.phone}`} 
                  className="font-extrabold text-slate-800 hover:text-brand-blue select-all block leading-tight"
                >
                  {registration.phone}
                </a>
              </div>

              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-150/50">
                <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Assigned Location:</span>
                <span className="font-extrabold text-slate-800 block">
                  {registration.location}
                </span>
              </div>

              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-150/50">
                <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Batch Cohort Detail:</span>
                <span className="font-extrabold text-slate-800 block">
                  {registration.batch || "Not specified."}
                </span>
              </div>
            </div>

            {registration.institution && (
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150/50 text-xs text-slate-700 space-y-1">
                <span className="text-slate-400 font-bold text-[9px] font-mono uppercase block">Institution / Affiliation:</span>
                <p className="flex items-center gap-1.5 font-bold">
                  <Building size={13} className="text-slate-400 shrink-0" /> {registration.institution}
                </p>
              </div>
            )}

            {registration.primaryGoal && (
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150/50 text-xs text-slate-700 space-y-1">
                <span className="text-slate-400 font-bold text-[9px] font-mono uppercase block">Primary Program Goal:</span>
                <p className="flex items-center gap-1.5 font-bold text-brand-blue uppercase">
                  <Briefcase size={13} className="text-brand-blue shrink-0" /> {registration.primaryGoal.replace(/_/g, " ")}
                </p>
              </div>
            )}

            {registration.aspiration && (
              <div className="p-4 bg-[#FAF8F3]/60 rounded-xl border border-slate-150 text-xs text-slate-700 leading-relaxed">
                <span className="text-slate-400 font-bold text-[9px] font-mono uppercase block mb-1">Stated Aspirations & Motivations:</span>
                <p className="font-medium italic text-slate-650">
                  "{registration.aspiration}"
                </p>
              </div>
            )}

            {/* MENTOR CONTRIBUTION INFO */}
            {(registration.mentorTeachArea || registration.mentorTrainSkill || registration.mentorAudience || registration.mentorExperience) && (
              <div className="p-4 bg-rose-50/50 border border-rose-150 rounded-2xl space-y-3 text-slate-900 text-left">
                <h5 className="text-[10px] font-black uppercase text-rose-700 tracking-widest font-mono border-b border-rose-100 pb-1">
                  MENTOR VALUE CONTRIBUTION DETAILS
                </h5>

                <div className="space-y-2 text-xs">
                  {registration.mentorTeachArea && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Teaching Focus Area:</span>
                      <p className="font-bold text-slate-800">{registration.mentorTeachArea}</p>
                    </div>
                  )}

                  {registration.mentorTrainSkill && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Skill Training Focus:</span>
                      <p className="font-bold text-slate-800">{registration.mentorTrainSkill}</p>
                    </div>
                  )}

                  {registration.mentorAudience && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Preferred Audience / Age Group:</span>
                      <p className="font-bold text-slate-800">{registration.mentorAudience}</p>
                    </div>
                  )}

                  {registration.mentorExperience && (
                    <div className="pt-1.5 border-t border-rose-100/65">
                      <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase mb-0.5">Mentoring & Teaching Experience:</span>
                      <p className="italic text-slate-705 bg-white p-2.5 rounded-lg border border-rose-200/50 leading-relaxed font-medium">
                        "{registration.mentorExperience}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150/50 text-xs text-slate-500 flex items-center gap-2">
              <Calendar size={12} className="shrink-0" />
              <span>Registered {formattedDate}</span>
            </div>

            {/* CII PROGRAM PLAN & PAYMENT STATUS SECTION */}
            {(registration.planType || registration.profileType?.startsWith("cii-")) && (
              <div className="p-4 bg-slate-100 border border-slate-250 rounded-2xl space-y-3 mt-4 text-slate-950 text-left">
                <h5 className="text-[10px] font-black uppercase text-[#E76F51] tracking-widest font-mono border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>CII FELLOWSHIP AUDIT DETAIL</span>
                  <span className="text-[9px] bg-[#E76F51]/15 text-[#E76F51] font-mono px-1.5 py-0.5 rounded-md capitalize">
                    {registration.planType || registration.profileType?.split("-")[1] || "Free"} Standard
                  </span>
                </h5>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Enrollment Plan:</span>
                    <span className="font-extrabold text-slate-800 capitalize leading-none block pt-0.5">
                      {registration.planType === "growth" ? "Growth Member" : registration.planType === "impact" ? "Impact Fellow" : "Free Discover"}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Audit Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider block mt-0.5 ${
                      registration.paymentStatus === "verified" || registration.planType === "free" || !registration.planType
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200/80"
                    }`}>
                      {registration.paymentStatus === "verified" || registration.planType === "free" || !registration.planType ? "APPROVED / VERIFIED" : "AUDIT PENDING"}
                    </span>
                  </div>
                </div>

                {registration.paymentReference && (
                  <div className="space-y-1 text-xs border-t border-slate-200/60 pt-2.5">
                    <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Transaction Reference & Sender:</span>
                    <p className="font-extrabold text-slate-800 select-all leading-tight bg-white px-2.5 py-2 rounded-xl border border-slate-200">
                      {registration.paymentReference}
                    </p>
                  </div>
                )}

                {(registration.planType && registration.planType !== "free") && (
                  <div className="space-y-1.5 border-t border-slate-200/60 pt-2.5 text-xs">
                    <span className="text-slate-400 font-bold block text-[9px] font-mono uppercase">Uploaded Screenshot Receipt:</span>
                    {registration.paymentReceipt ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-1">
                        <img src={registration.paymentReceipt} alt="Receipt proof" className="w-full max-h-48 object-contain rounded-lg" />
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No screenshot receipt picture was attached.</p>
                    )}

                    {registration.paymentStatus !== "verified" && (
                      <button
                        onClick={() => {
                          const updatedNotes = notes ? notes + "\n[System: Payment audit approved. Community link auto-dispatched.]" : "[System: Payment audit approved. Community link auto-dispatched.]";
                          onUpdateStatus(
                            registration.id,
                            "Enrolled",
                            updatedNotes,
                            { paymentStatus: "verified" }
                          );

                          // SECURE PAYMENT APPROVED TRIGGERS
                          try {
                            fetch("/api/email/trigger", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                event: "PAYMENT_APPROVED",
                                registrationId: registration.id,
                                payload: {
                                  ...registration,
                                  notes: updatedNotes
                                }
                              })
                            }).catch(err => console.error("Drawer confirm trigger error:", err));
                          } catch (err) {}
                        }}
                        className="w-full mt-2 py-2 px-3 bg-emerald-650 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check size={12} /> Verify Payment & Enroll
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LIVE DECISION ENGINE */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono border-b border-slate-100 pb-1">
              Assessor Admission Engine
            </h5>

            {/* Status Selecter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Admission / Review Status:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {["Received", "Reviewed", "Shortlisted", "Enrolled", "Deferred"].map(opt => {
                  const isActive = status === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setStatus(opt)}
                      className={`py-1.5 px-1 rounded-lg text-[9px] font-black uppercase text-center border cursor-pointer transition-all ${
                        isActive 
                          ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                          : "bg-white text-slate-600 border-slate-220 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assessment Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Internal Registry Comments:</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase font-mono">Persisted Locally</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="State your assessor interview impressions, qualifications, or chapter assignments here..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-220 rounded-xl focus:bg-white focus:border-brand-blue focus:outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isSaved 
                  ? "bg-emerald-600 hover:bg-emerald-600/95 text-white" 
                  : "bg-brand-blue hover:bg-[#121A15] text-white"
              }`}
            >
              {isSaved ? (
                <>
                  <Check size={14} /> Local Dossier Updated!
                </>
              ) : (
                <>
                  <Bookmark size={14} /> Update Decision Dossier
                </>
              )}
            </button>
          </div>

          {/* Dedicated Volunteer Onboarding Template */}
          {registration.profileType === "volunteer" && (
            <div className="bg-amber-50/45 border border-amber-200/50 p-4 rounded-2xl space-y-3 mt-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-mono">Volunteer Email Template</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-700 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/10">PRESET DRAFT</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                An email-ready template pre-configured with department placeholders (such as <strong>{getVolunteerTracks()}</strong>). You can customize and dispatch directly.
              </p>

              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-b border-slate-100 pb-1.5 font-mono">
                  <span>EMAIL PREVIEW DETAILS</span>
                  <span className="text-amber-600 block">SUBJ: Volunteer Engagement Coordination</span>
                </div>
                <div className="text-slate-700 leading-relaxed font-mono text-[10px] space-y-1 max-h-36 overflow-y-auto bg-slate-50/50 p-2 rounded-lg border border-slate-150 select-all whitespace-pre-wrap break-all">
{`Subject: Engagement Offer: Volunteer Department Onboarding (${getVolunteerTracks()})

Dear ${registration.fullName},

We are thrilled to receive your volunteering inquiry for RightMinds Africa (RMA) Hub!

Based on your credentials and stated experience, we are pleased to review and propose placing you as a volunteer within our [${getVolunteerTracks()}] department, operating closely with the Core Leadership committee.

Department Placeholder Role: [Graphic Designer / Social Media Manager / Lead Facilitator Hub Coordinator]

As a valued contributor to this track, you will facilitate digital and physical mobilization crusades, and participate in leadership development frameworks.

Please let us know your availability for our upcoming Operational Sync this weekend.

Warm regards,
RightMinds Africa Registry Deck`}
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${registration.email}?subject=${encodeURIComponent(`Volunteer Department Onboarding (${getVolunteerTracks()}) — RightMinds Africa`)}&body=${encodeURIComponent(
`Subject: Engagement Offer: Volunteer Department Onboarding (${getVolunteerTracks()})

Dear ${registration.fullName},

We are thrilled to receive your volunteering inquiry for RightMinds Africa (RMA) Hub!

Based on your credentials and stated experience, we are pleased to review and propose placing you as a volunteer within our [${getVolunteerTracks()}] department, operating closely with the Core Leadership committee.

Department Placeholder Role: [Graphic Designer / Social Media Manager / Lead Facilitator Hub Coordinator]

As a valued contributor to this track, you will facilitate digital and physical mobilization crusades, and participate in leadership development frameworks.

Please let us know your availability for our upcoming Operational Sync this weekend.

Warm regards,
RightMinds Africa Registry Deck`
                  )}`}
                  className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] uppercase font-black tracking-wider rounded-xl text-center transition-colors font-mono cursor-pointer flex items-center justify-center gap-1"
                >
                  <Mail size={12} /> Dispatch Onboarding Email
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
`Subject: Engagement Offer: Volunteer Department Onboarding (${getVolunteerTracks()})

Dear ${registration.fullName},

We are thrilled to receive your volunteering inquiry for RightMinds Africa (RMA) Hub!

Based on your credentials and stated experience, we are pleased to review and propose placing you as a volunteer within our [${getVolunteerTracks()}] department, operating closely with the Core Leadership committee.

Department Placeholder Role: [Graphic Designer / Social Media Manager / Lead Facilitator Hub Coordinator]

As a valued contributor to this track, you will facilitate digital and physical mobilization crusades, and participate in leadership development frameworks.

Please let us know your availability for our upcoming Operational Sync this weekend.

Warm regards,
RightMinds Africa Registry Deck`
                    );
                    setCopiedVolEmail(true);
                    setTimeout(() => setCopiedVolEmail(false), 2000);
                  }}
                  className={`py-2 px-3 text-[10px] font-bold uppercase rounded-xl transition-colors font-mono cursor-pointer border ${
                    copiedVolEmail 
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700" 
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {copiedVolEmail ? "Copied!" : "Copy Draft"}
                </button>
              </div>
            </div>
          )}

          {/* Quick Notification Despatch Deck */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono border-b border-slate-100 pb-1">
              Direct Communication Triggers
            </h5>
            <div className="grid grid-cols-2 gap-3.5">
              <a
                href={`mailto:${registration.email}?subject=${encodedEmailSubject}&body=${encodedEmailBody}`}
                className="py-2.5 px-4 rounded-xl border border-slate-220 hover:border-brand-blue hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="Send pre-filled updates via local email client"
              >
                <Mail size={13} className="text-brand-orange" /> Direct Dispatch Email
              </a>
              <a
                href={`https://wa.me/${registration.phone.replace(/[\s+()-]/g, "")}?text=${encodedWhatsAppText}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl border border-slate-220 hover:border-emerald-550 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="Trigger pre-filled WhatsApp message conversation"
              >
                <MessageSquare size={13} className="text-emerald-500" /> Start WhatsApp Chat
              </a>
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions (Delete) */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between shrink-0">
          {userRole !== "Operational Admin" && userRole !== "Viewer (Read Only)" ? (
            !showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="py-2 px-3 hover:bg-rose-50 rounded-lg text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 size={13} /> Delete Entry
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-100 w-full justify-between">
                <div className="flex items-center gap-1 text-[11px] text-rose-800 font-bold">
                  <ShieldAlert size={14} className="shrink-0 animate-bounce" /> Confirm deletion?
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-550 hover:text-slate-800 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteCandidate(registration.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-650 hover:bg-rose-700 text-white rounded-md text-[10px] font-black uppercase shadow-sm cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-100/80 text-slate-400 border border-slate-200 text-[9px] font-black uppercase font-mono tracking-wider flex items-center gap-1 selection:bg-transparent">
              <span>🔒</span> Delete Entry Restricted
            </div>
          )}
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">NOMINEE ID: {registration.id}</span>
        </div>

      </div>
    </div>
  );
}
