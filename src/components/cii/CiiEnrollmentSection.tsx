/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Upload, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Facebook, 
  ArrowUpRight 
} from "lucide-react";
import { saveRegistration } from "../../lib/db";

interface CiiEnrollmentSectionProps {
  selectedPlan: "waitlist" | "free" | "growth" | "impact";
  onPlanChange: (plan: "waitlist" | "free" | "growth" | "impact") => void;
}

export default function CiiEnrollmentSection({
  selectedPlan,
  onPlanChange
}: CiiEnrollmentSectionProps) {
  // Form values
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    stateOfService: "",
    batch: "Cohort 6",
    primaryGoal: "Project Impact",
    planType: selectedPlan
  });

  // Keep in sync if parent selected plan changed
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, planType: selectedPlan }));
  }, [selectedPlan]);

  const [selectedPillars, setSelectedPillars] = useState<string[]>(["project_impact"]);
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePillarToggle = (pillarId: string) => {
    let updated = [...selectedPillars];
    if (updated.includes(pillarId)) {
      updated = updated.filter(id => id !== pillarId);
    } else {
      if (formData.planType === "growth") {
        updated = [pillarId];
      } else if (formData.planType === "impact") {
        if (updated.length >= 2) {
          updated = [updated[1], pillarId];
        } else {
          updated.push(pillarId);
        }
      } else {
        updated.push(pillarId);
      }
    }
    setSelectedPillars(updated);
    setSubmitError("");
  };

  const handleSelectPlan = (newPlan: "waitlist" | "free" | "growth" | "impact") => {
    onPlanChange(newPlan);
    setFormData(prev => ({ ...prev, planType: newPlan }));
    setSubmitError("");

    if (newPlan === "growth") {
      if (selectedPillars.length > 1) {
        setSelectedPillars([selectedPillars[0]]);
        setSubmitError("Notice: Growth Members focus on one specific community track.");
      } else if (selectedPillars.length === 0) {
        setSelectedPillars(["project_impact"]);
      }
    } else if (newPlan === "impact") {
      if (selectedPillars.length > 2) {
        setSelectedPillars(selectedPillars.slice(0, 2));
        setSubmitError("Notice: Impact Fellows (VIP) focus on up to two community tracks simultaneously.");
      } else if (selectedPillars.length === 0) {
        setSelectedPillars(["project_impact", "skill_development"]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 300 * 1024) {
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setReceiptBase64(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
        setSubmitError("");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setReceiptBase64(dataUrl);
            setReceiptFile(file);
            setSubmitError("");
          } else {
            setReceiptFile(file);
            setReceiptBase64(event.target?.result as string);
          }
        };
        img.onerror = () => {
          setReceiptFile(file);
          setReceiptBase64(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.stateOfService.trim()) {
      setSubmitError("Please fill in all required fields to register.");
      return;
    }

    if (selectedPillars.length === 0) {
      setSubmitError("Please select at least one community focus pillar to register.");
      return;
    }

    if (formData.planType !== "free" && formData.planType !== "waitlist") {
      if (!paymentReference.trim()) {
        setSubmitError("Please fill in the Sender Name / Bank / Transaction Reference for payment verification.");
        return;
      }
      if (!receiptFile) {
        setSubmitError("Please choose and upload your payment receipt screenshot.");
        return;
      }
    }

    const pillarLabelsMap: Record<string, string> = {
      project_impact: "Project Impact",
      skill_development: "Skill Development",
      volunteering: "Volunteering"
    };
    const primaryGoalText = selectedPillars.map(p => pillarLabelsMap[p] || p).join(", ");

    try {
      setIsSubmitting(true);
      await saveRegistration({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        profileType: `cii-${formData.planType}`,
        location: formData.stateOfService,
        batch: formData.batch,
        primaryGoal: primaryGoalText,
        planType: formData.planType,
        paymentReference: (formData.planType !== "free" && formData.planType !== "waitlist") ? paymentReference : undefined,
        paymentReceipt: (formData.planType !== "free" && formData.planType !== "waitlist") ? receiptBase64 : undefined,
        paymentStatus: (formData.planType !== "free" && formData.planType !== "waitlist") ? "pending" : "verified",
        status: "Received"
      });
      setIsSubmitted(true);
    } catch (err: any) {
      let friendlyError = "There was a problem submitting your application. Please try again.";
      if (err?.message) {
        try {
          if (err.message.trim().startsWith("{")) {
            const parsed = JSON.parse(err.message);
            if (parsed.error) friendlyError = parsed.error;
          } else {
            friendlyError = err.message;
          }
        } catch {
          friendlyError = err.message;
        }
      }
      setSubmitError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-900 py-16 lg:py-24 text-white" id="cii-enroll-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Context & Overview */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-md">
              <Sparkles size={13} /> ADMISSION ACTIVE
            </span>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display uppercase tracking-tight leading-tight">
              Secure Your Spot in Cohort 6 Today
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Do not let this NYSC year drift away without structured competitive preparation. Secure your fully funded CII Fellowship and unlock immediate access to Saturday live clinics, personal circles, and templates.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold text-sm">✓</span>
                <span className="text-xs sm:text-sm text-slate-300">Fully Funded Scholarship Admission for Selected Candidates</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold text-sm">✓</span>
                <span className="text-xs sm:text-sm text-slate-300">Includes Verified PDF Certificate of Fellowship Completion</span>
              </div>
            </div>

            {/* Facebook Auxiliary Community Block */}
            <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
                  RMA DIGITAL MATRIC SYSTEM
                </span>
                <Facebook size={16} className="text-[#1877F2]" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We share webinars, workspace checklists, regional secretariats meetups photos, and cohort announcements inside our active 1,000+ member Facebook group.
              </p>
              <a
                href="https://www.facebook.com/corperimpacti"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-white font-bold uppercase tracking-wider transition-colors"
              >
                Visit CII Facebook <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          {/* Right Column: Admission & Enrollment Sheet */}
          <div className="lg:col-span-7">
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
              
              {isSubmitted ? (
                <div className="space-y-6 text-center py-4">
                  {formData.planType === "waitlist" ? (
                    <>
                      <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                          WELCOME TO THE PCM PRIORITIES QUEUE!
                        </h4>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-sm mx-auto">
                          Thank you, Prospective Corps Member! We have reserved your priority place for our pre-camp mobilization briefs and upcoming cohort orientation sessions.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                        <span className="font-mono font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                          Next Actions
                        </span>
                        <p className="text-slate-700">
                          Join our official prospective corps members' channels below to receive daily camp tips, kit advice, and early registration announcements.
                        </p>
                        <div className="pt-2 flex flex-col gap-2">
                          <a
                            href="https://chat.whatsapp.com/DoI8xpE60FeKMi4sEtE3wI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center"
                          >
                            Open Waitlist Group (WhatsApp)
                          </a>
                          <a
                            href="https://t.me/+_iA-Xr3CqEoyYzhk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 bg-[#0088cc] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center"
                          >
                            Open Waitlist Group (Telegram)
                          </a>
                        </div>
                      </div>
                    </>
                  ) : formData.planType === "free" ? (
                    <>
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                          APPLICATION CONFIRMED SUCCESSFULLY!
                        </h4>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-sm mx-auto">
                          Excellent choice, Leader! Your Free Discover Fellowship has been activated. We have triggered an automatic boarding message to your email.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                        <span className="font-mono font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                          Community Invitation Channels
                        </span>
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                          <a
                            href="https://chat.whatsapp.com/DoI8xpE60FeKMi4sEtE3wI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-3 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center"
                          >
                            WhatsApp Join
                          </a>
                          <a
                            href="https://t.me/+_iA-Xr3CqEoyYzhk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-3 bg-[#0088cc] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center"
                          >
                            Telegram Join
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                        <Clock size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                          PAYMENT EVIDENCE SUBMITTED
                        </h4>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-sm mx-auto">
                          Thank you, Leader! Your proof of payment for the <span className="font-bold capitalize">{formData.planType} Fellowship</span> has been logged to our registry database under candidate reference <span className="font-mono font-bold">#PROV-{Date.now().toString().substring(8)}</span>.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-3">
                        <h5 className="font-mono font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">
                          Registry Review Queue
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                            <span className="text-slate-700 font-semibold">Form Submission Logged</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                            <span className="text-slate-700 font-semibold">Payment Receipt Uploaded</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[10px] font-bold">●</span>
                            <span className="text-slate-900 font-bold">Finance Audit Verification</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-mono rounded px-1 ml-auto">Pending Approval</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-50">
                            <span className="w-4 h-4 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                            <span className="text-slate-600">Automatic Community Invitation Dispatched</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                          Note: Once verified (usually within 1 hour), our system will automatically email your unique community boarding and scheduling links to <strong>{formData.email}</strong>.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-slate-200 max-w-sm mx-auto flex flex-col gap-2">
                    <a
                      href="https://www.facebook.com/corperimpacti"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-[#1877F2] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center"
                    >
                      Go to Facebook Forum
                    </a>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setPaymentReference("");
                        setReceiptFile(null);
                        setReceiptBase64("");
                        setSelectedPillars(["project_impact"]);
                        setFormData({
                          fullName: "",
                          email: "",
                          phone: "",
                          stateOfService: "",
                          batch: "Cohort 6",
                          primaryGoal: "Project Impact",
                          planType: "free"
                        });
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors mt-2"
                    >
                      Fill Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold">
                      {submitError}
                    </div>
                  )}

                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <FileText size={16} className="text-amber-600" />
                      ADMISSION & ACCELERATOR ENROLLMENT SHEET
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please supply genuine, active credentials below to sync with RMA databases.
                    </p>
                  </div>

                  {/* 1. Track Selection */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      1. Select Your Community Focus Track(s) *
                    </label>
                    <p className="text-xs text-slate-600 leading-normal">
                      Free Discover & PCM Waitlist get general access. <strong className="text-slate-900">Growth Members focus on 1 track</strong>, while <strong className="text-amber-700">Impact Fellows can select up to 2 tracks</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      {[
                        { id: "project_impact", label: "Project Impact", desc: "Local community welfare, CDS execution & SDGs" },
                        { id: "skill_development", label: "Skill Development", desc: "Tech, design, monetization & wealth creation systems" },
                        { id: "volunteering", label: "Volunteering", desc: "Professional internships, placement & CV refinement" }
                      ].map((pillar) => {
                        const isSelected = selectedPillars.includes(pillar.id);
                        return (
                          <button
                            key={pillar.id}
                            type="button"
                            onClick={() => handlePillarToggle(pillar.id)}
                            className={`p-3 text-left border rounded-lg transition-colors flex flex-col justify-between ${
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {pillar.label}
                                </span>
                                {isSelected && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <p className={`text-[11px] mt-1 leading-snug ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {pillar.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Membership Tier */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      2. Choose Your Membership Access Tier *
                    </label>
                    <select
                      value={formData.planType}
                      onChange={(e) => handleSelectPlan(e.target.value as any)}
                      className="w-full text-xs px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-slate-900 cursor-pointer"
                    >
                      <option value="waitlist">Path A: PCM Waitlist (FREE - Future Cohorts Priority Slot)</option>
                      <option value="free">Path A: Free Discover (FREE - ₦0)</option>
                      <option value="growth">Path B: Growth Member (₦3,500/mo or ₦30,000/yr)</option>
                      <option value="impact">Path C: Impact Fellow (VIP - ₦7,000/mo or ₦55,000/yr)</option>
                    </select>

                    <p className="text-xs text-slate-600 leading-normal pt-1">
                      {formData.planType === "waitlist" && (
                        <span>✓ PCM Waitlist: General access to NYSC mobilization prep, basic CV guides & waitlist community chats.</span>
                      )}
                      {formData.planType === "free" && (
                        <span>✓ Free Discover: Basic reading resources, digital bulletin, and open WhatsApp networking channels.</span>
                      )}
                      {formData.planType === "growth" && (
                        <span className="font-semibold text-slate-900">⚡ Growth Member: Focused weekly core sprints, 1-on-1 performance audit, and full access to your selected community focus.</span>
                      )}
                      {formData.planType === "impact" && (
                        <span className="font-semibold text-amber-800">🏆 Impact Fellow (VIP): Premium mentorship, portfolio clinic, support for select 2 community tracks simultaneously, and project funding pipelines.</span>
                      )}
                    </p>
                  </div>

                  {/* Candidate Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">FULL NAME *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gracious-Esther"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-900 focus:outline-none transition-colors text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-900 focus:outline-none transition-colors text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">WhatsApp MOBILE *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +234 810 567 1234"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-900 focus:outline-none transition-colors text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">STATE OF NYSC SERVICE *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lagos, Abuja, Enugu"
                        value={formData.stateOfService}
                        onChange={(e) => setFormData({ ...formData, stateOfService: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-900 focus:outline-none transition-colors text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Payment Details for Paid Tiers */}
                  {formData.planType !== "free" && formData.planType !== "waitlist" && (
                    <div className="bg-amber-50/50 border border-amber-200 p-4 sm:p-5 rounded-xl space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                          SECURE ONBOARDING PAYMENT
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mt-1.5">
                          Pay {formData.planType === "growth" ? "₦3,500 (Growth Plan)" : "₦7,000 (Impact Plan)"} to secure your active license
                        </h5>
                        <p className="text-xs text-slate-600 mt-0.5">
                          To complete verification, please make a bank transfer using the official details below:
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-2 font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Bank Name:</span>
                          <span className="text-slate-900 font-bold">Providus Bank</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                          <span className="text-slate-500 font-medium">Account Name:</span>
                          <span className="text-slate-900 font-bold">Right Minds Africa Hub</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                          <span className="text-slate-500 font-medium">Account Number:</span>
                          <span className="text-amber-700 font-bold select-all tracking-wider">1023945829</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            SENDER ACCOUNT NAME & TRANSACTION REFERENCE *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Samuel Yusuf / GTBank / TxRef: 123456789"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            UPLOAD PAYMENT RECEIPT SCREENSHOT *
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              id="receipt-upload"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <label
                              htmlFor="receipt-upload"
                              className="cursor-pointer bg-white border border-slate-200 hover:border-slate-400 transition-colors text-xs font-bold px-4 py-2.5 rounded-lg text-slate-700 flex items-center justify-center gap-2 uppercase shrink-0"
                            >
                              <Upload size={14} />
                              {receiptFile ? "Change Screenshot" : "Choose Image File"}
                            </label>
                            <span className="text-xs text-slate-500 font-mono truncate">
                              {receiptFile ? receiptFile.name : "Screenshots, JPG, PNG allowed (Max 5MB)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cohort & Submit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        CII ADMISSION COHORT *
                      </label>
                      <select
                        value={formData.batch}
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none"
                      >
                        <option>Cohort 6</option>
                        <option>Cohort 7 (Upcoming)</option>
                        <option>Cohort 5 (Alumni)</option>
                        <option>Recent Graduate (Pre-Mobilization)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send size={14} />
                      {isSubmitting
                        ? "PROCESSING..."
                        : formData.planType === "waitlist"
                        ? "JOIN PCM PRIORITIES WAITLIST"
                        : formData.planType === "impact"
                        ? "APPLY FOR IMPACT FELLOW"
                        : formData.planType === "growth"
                        ? "BECOME A GROWTH MEMBER"
                        : "JOIN FREE DISCOVER COMMUNITY"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
