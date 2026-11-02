import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, CheckCircle2, ArrowRight, Clock, MapPin, 
  Video, Phone, Mail, FileText, ShieldCheck, AlertCircle, 
  Loader2, HelpCircle, ExternalLink, Briefcase, Users, 
  Palette, Share2, HeartHandshake, Info, Check, ChevronDown,
  FileSpreadsheet, Settings, RefreshCw, Globe, Maximize2, Minimize2, Download, Copy
} from "lucide-react";
import { saveRegistration, savePortalApplication, getPortalApplications, getFirestoreDb } from "../../lib/db";

interface VolunteerApplicationPageProps {
  onNavigate: (view: string) => void;
  onOpenJoin?: (profile?: string) => void;
}

export const VOLUNTEER_ROLES = [
  {
    category: "Creative and Media",
    roles: [
      { id: "Graphic Designer", label: "Graphic Designer", desc: "Designs flyers, campaign graphics, event materials and social media creatives." },
      { id: "Video Editor", label: "Video Editor", desc: "Edits event videos, interviews, promotional videos and short-form content." },
      { id: "Content Creator", label: "Content Creator", desc: "Develops content ideas, scripts, captions and educational content." },
      { id: "Social Media Manager", label: "Social Media Manager", desc: "Plans content calendars, schedules posts, manages engagement and supports online growth." },
      { id: "Writer / Copywriter", label: "Writer / Copywriter", desc: "Develops articles, newsletters, announcements and campaign copy." }
    ]
  },
  {
    category: "Programmes and Community",
    roles: [
      { id: "Programme Coordinator", label: "Programme Coordinator", desc: "Supports programme planning, scheduling, team coordination and execution." },
      { id: "WhatsApp Community Manager", label: "WhatsApp Community Manager", desc: "Welcomes members, shares approved updates, encourages engagement and moderates discussions." },
      { id: "Community Engagement Intern", label: "Community Engagement Intern", desc: "Supports outreach, member engagement and community growth." },
      { id: "Research and Documentation Intern", label: "Research and Documentation Intern", desc: "Researches relevant topics and documents programme activities and outcomes." }
    ]
  },
  {
    category: "Events and Operations",
    roles: [
      { id: "Public Speaker / Event Host", label: "Public Speaker / Event Host", desc: "Hosts events, introduces speakers and engages audiences." },
      { id: "Event Moderator", label: "Event Moderator", desc: "Facilitates discussions, manages Q&A sessions and maintains productive conversations." },
      { id: "Event Support Intern", label: "Event Support Intern", desc: "Assists with event planning, registration, logistics and coordination." },
      { id: "Outreach and Partnership Intern", label: "Outreach and Partnership Intern", desc: "Identifies potential collaborators and supports partnership development." },
      { id: "Administrative / Operations Intern", label: "Administrative / Operations Intern", desc: "Assists with scheduling, records and internal coordination." }
    ]
  },
  {
    category: "General",
    roles: [
      { id: "Other / Open to Opportunities", label: "Other / Open to Opportunities", desc: "Willing to contribute across general areas based on team requirements." }
    ]
  }
];

export const SKILL_OPTIONS = [
  "Graphic Design",
  "Video Editing",
  "Photography",
  "Content Creation",
  "Social Media Management",
  "Writing and Copywriting",
  "Programme Coordination",
  "Community Management",
  "Public Speaking",
  "Event Moderation",
  "Event Planning",
  "Research and Documentation",
  "Administration",
  "Partnership and Outreach",
  "Other"
];

// Default Google Form URL configured for Right-Minds Africa Hub Volunteer Applications
const DEFAULT_GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScq8FZgaFF_hYxLbKk0eLjLwuMW1iYRPjZpYfMljdQ3k_oCHQ/viewform?embedded=true";
const CONNECTED_GOOGLE_EMAIL = "olosundelouis@gmail.com";

export default function VolunteerApplicationPage({ onNavigate }: VolunteerApplicationPageProps) {
  // Mode: synced from Admin Backend settings ("google_form" is default)
  const [formMode, setFormMode] = useState<"google_form" | "interactive">(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("rma_volunteer_form_mode");
      if (savedMode === "google_form" || savedMode === "interactive") {
        return savedMode;
      }
    }
    return "google_form";
  });

  // Google Form integration state
  const [googleFormUrl, setGoogleFormUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_volunteer_google_form_url");
      if (saved && !saved.includes("1FAIpQLScXg5V3NqYqP_RMA_Volunteer_Intake")) {
        return saved;
      }
    }
    return DEFAULT_GOOGLE_FORM_URL;
  });

  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(googleFormUrl);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Form input states for native interactive form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [contactMethod, setContactMethod] = useState<"WhatsApp" | "Phone Call" | "Email">("WhatsApp");

  const [primaryRole, setPrimaryRole] = useState("Graphic Designer");
  const [secondaryRole, setSecondaryRole] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [previousExperience, setPreviousExperience] = useState("");
  const [whyVolunteer, setWhyVolunteer] = useState("");
  const [valueBrought, setValueBrought] = useState("");
  const [availability, setAvailability] = useState("Weekdays");
  const [workArrangement, setWorkArrangement] = useState("Remote");

  const [videoUrl, setVideoUrl] = useState("");
  const [confirmedAccurate, setConfirmedAccurate] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Validation & Submission States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<{
    id: string;
    fullName: string;
    email: string;
    primaryRole: string;
    secondaryRole?: string;
    contactMethod: string;
    submittedAt: string;
  } | null>(null);

  // Privacy notice modal state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Fullscreen Google Form modal state (gives 100vw x 100vh unobstructed Google Form view)
  const [isFullScreenIframe, setIsFullScreenIframe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Export submissions to Google Sheets CSV format
  const handleExportToGoogleSheets = async () => {
    try {
      const apps = await getPortalApplications();
      const volunteerApps = apps.filter(a => a.type === "volunteer" || a.type?.includes("volunteer"));
      
      if (volunteerApps.length === 0) {
        alert("No volunteer application submissions recorded yet. Once candidates submit, they can be exported to your Google Spreadsheet here.");
        return;
      }

      // Convert to CSV
      const headers = ["Application ID", "Full Name", "Email Address", "Phone Number", "Location", "Primary Role", "Secondary Role", "Relevant Skills", "Why Volunteer", "Value Brought", "Video URL", "Availability", "Work Arrangement", "Submitted At"];
      const rows = volunteerApps.map(a => [
        `"${a.id}"`,
        `"${(a.fullName || '').replace(/"/g, '""')}"`,
        `"${(a.email || '').replace(/"/g, '""')}"`,
        `"${(a.phone || '').replace(/"/g, '""')}"`,
        `"${(a.options?.location || '').replace(/"/g, '""')}"`,
        `"${(a.options?.primaryRole || '').replace(/"/g, '""')}"`,
        `"${(a.options?.secondaryRole || '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(a.options?.relevantSkills) ? a.options.relevantSkills.join(', ') : '').replace(/"/g, '""')}"`,
        `"${(a.options?.whyVolunteer || a.notes || '').replace(/"/g, '""')}"`,
        `"${(a.options?.valueContribution || '').replace(/"/g, '""')}"`,
        `"${(a.options?.videoUrl || '').replace(/"/g, '""')}"`,
        `"${(a.options?.availability || '').replace(/"/g, '""')}"`,
        `"${(a.options?.workArrangement || '').replace(/"/g, '""')}"`,
        `"${a.appliedAt || a.options?.submittedAt || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `RMA_Volunteer_Applications_Google_Sheets_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + "/internship");
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Fetch active Google Form URL and Mode from Firestore settings
  useEffect(() => {
    const fetchFormSetting = async () => {
      try {
        if (typeof window !== "undefined") {
          const savedMode = localStorage.getItem("rma_volunteer_form_mode");
          if (savedMode === "google_form" || savedMode === "interactive") {
            setFormMode(savedMode);
          }
          const savedUrl = localStorage.getItem("rma_volunteer_google_form_url");
          if (savedUrl && !savedUrl.includes("1FAIpQLScXg5V3NqYqP_RMA_Volunteer_Intake")) {
            setGoogleFormUrl(savedUrl);
            setCustomUrlInput(savedUrl);
          }
        }

        const { doc, getDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        const docRef = doc(db, "settings", "google_forms");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.volunteerFormMode === "google_form" || data.volunteerFormMode === "interactive") {
            setFormMode(data.volunteerFormMode);
            if (typeof window !== "undefined") {
              localStorage.setItem("rma_volunteer_form_mode", data.volunteerFormMode);
            }
          }
          if (data.volunteerFormUrl && !data.volunteerFormUrl.includes("1FAIpQLScXg5V3NqYqP_RMA_Volunteer_Intake")) {
            setGoogleFormUrl(data.volunteerFormUrl);
            setCustomUrlInput(data.volunteerFormUrl);
          } else if (data.activeFormId) {
            const resolved = `https://docs.google.com/forms/d/${data.activeFormId}/viewform`;
            setGoogleFormUrl(resolved);
            setCustomUrlInput(resolved);
          }
        }
      } catch (err) {
        console.warn("Could not load Firestore google_forms setting, using local configuration:", err);
      }
    };

    fetchFormSetting();
    window.addEventListener("rma_volunteer_form_config_updated", fetchFormSetting);
    return () => window.removeEventListener("rma_volunteer_form_config_updated", fetchFormSetting);
  }, []);

  // Format Google Form URL for clean embedding (supports full <iframe> tags, URLs, or form IDs)
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return DEFAULT_GOOGLE_FORM_URL;
    let clean = rawUrl.trim();

    // Extract src if user pasted a full <iframe ...> snippet
    const srcMatch = clean.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      clean = srcMatch[1].trim();
    }
    
    // If user provided just an ID like 1FAIpQLSc...
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://docs.google.com/forms/d/e/${clean}/viewform`;
    }

    if (clean.includes("?")) {
      if (!clean.includes("embedded=true")) {
        clean = `${clean}&embedded=true`;
      }
    } else {
      clean = `${clean}?embedded=true`;
    }
    return clean;
  };

  const handleSaveCustomFormUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    let clean = customUrlInput.trim();
    const srcMatch = clean.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      clean = srcMatch[1].trim();
    }
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://docs.google.com/forms/d/e/${clean}/viewform`;
    }

    setGoogleFormUrl(clean);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_volunteer_google_form_url", clean);
    }

    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const db = await getFirestoreDb();
      const docRef = doc(db, "settings", "google_forms");
      await setDoc(docRef, {
        volunteerFormUrl: clean,
        connectedEmail: CONNECTED_GOOGLE_EMAIL,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Failed saving Google Form URL to Firestore:", err);
    }

    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
      setShowConfigModal(false);
    }, 1500);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
    if (fieldErrors.skills) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.skills;
        return next;
      });
    }
  };

  const scrollToForm = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById("volunteer-application-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Section A
    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (phone.trim().replace(/\D/g, "").length < 7) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }

    if (!location.trim()) {
      errors.location = "City / State of Residence is required.";
    }

    // Section B
    if (!primaryRole) {
      errors.primaryRole = "Please select a primary internship role.";
    }

    if (selectedSkills.length === 0) {
      errors.skills = "Please select at least one relevant skill.";
    }

    if (!whyVolunteer.trim()) {
      errors.whyVolunteer = "Please explain why you want to intern with Right-Minds Africa Hub.";
    }

    if (!valueBrought.trim()) {
      errors.valueBrought = "Please describe the value or skills you will bring to the organisation.";
    }

    // Section C - Introduction video URL validation
    if (!videoUrl.trim()) {
      errors.videoUrl = "Introduction video link is required.";
    } else {
      try {
        const parsed = new URL(videoUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.videoUrl = "URL must start with http:// or https://";
        }
      } catch {
        errors.videoUrl = "Please enter a valid video URL (e.g., https://youtu.be/... or Google Drive link).";
      }
    }

    // Section D - Consent
    if (!confirmedAccurate) {
      errors.confirmedAccurate = "You must confirm that the information provided is accurate.";
    }

    if (!consentAgreed) {
      errors.consentAgreed = "You must agree to the internship application privacy notice.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      const firstErrorKey = Object.keys(fieldErrors)[0];
      const errorEl = document.querySelector(`[data-error-field="${firstErrorKey}"]`);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const reg = await saveRegistration({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        profileType: "volunteer",
        programType: "internship",
        programName: "Internship Application",
        department: primaryRole,
        notes: `[Internship Application] Primary Role: ${primaryRole}${secondaryRole ? ` | Second Choice: ${secondaryRole}` : ""} | Contact Method: ${contactMethod} | Video: ${videoUrl.trim()}`
      });

      const portalApp = await savePortalApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        type: "volunteer",
        notes: whyVolunteer.trim(),
        options: {
          location: location.trim(),
          preferredContactMethod: contactMethod,
          primaryRole,
          secondaryRole: secondaryRole || "None",
          relevantSkills: selectedSkills,
          previousExperience: previousExperience.trim() || "N/A",
          whyVolunteer: whyVolunteer.trim(),
          valueContribution: valueBrought.trim(),
          availability,
          workArrangement,
          videoUrl: videoUrl.trim(),
          confirmedAccurate: true,
          consentAgreed: true,
          submittedAt: new Date().toISOString()
        }
      });

      setSubmittedApp({
        id: portalApp?.id || reg?.id || `VOL-${Date.now().toString().slice(-6)}`,
        fullName: fullName.trim(),
        email: email.trim(),
        primaryRole,
        secondaryRole: secondaryRole || undefined,
        contactMethod,
        submittedAt: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(
        err?.message || 
        "An unexpected error occurred while transmitting your application. Please check your internet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Full screen width container: stretches across the entire viewport without being shrunk into the middle
    <div className="w-full min-h-screen px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 space-y-10 text-slate-900">
      
      {/* =========================================================================
          CONFIRMATION SCREEN (Shown after successful submission)
          ========================================================================= */}
      {submittedApp ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white border border-emerald-200 rounded-3xl p-6 sm:p-10 md:p-12 text-left shadow-lg space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 font-mono tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Application Received • REF: {submittedApp.id}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase font-display tracking-tight mt-1">
                Thank You for Applying!
              </h2>
            </div>
          </div>

          <div className="p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-emerald-900 text-sm sm:text-base leading-relaxed font-medium">
            Thank you for applying for an internship with Right-Minds Africa Hub! Your application has been submitted successfully. Our team will review your information and contact you regarding the next steps.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Applicant Name</span>
              <strong className="text-slate-900 text-sm">{submittedApp.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Primary Role Applied For</span>
              <strong className="text-[#0E3A2F] text-sm">{submittedApp.primaryRole}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Preferred Contact Method</span>
              <span className="text-slate-700 font-semibold">{submittedApp.contactMethod} ({submittedApp.email})</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Submission Date</span>
              <span className="text-slate-700 font-semibold">{submittedApp.submittedAt}</span>
            </div>
          </div>

          <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">What to do next:</strong>
              <p>
                Please monitor your email address (<strong>{submittedApp.email}</strong>) and your preferred contact method ({submittedApp.contactMethod}) for updates regarding your review and onboarding scheduling.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 items-center justify-between border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onNavigate("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-[#0E3A2F] hover:bg-[#0c3127] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all inline-flex items-center gap-2 shadow-sm"
              >
                Return to Main Website <ArrowRight size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmittedApp(null);
                setFullName("");
                setEmail("");
                setPhone("");
                setLocation("");
                setSelectedSkills([]);
                setPreviousExperience("");
                setWhyVolunteer("");
                setValueBrought("");
                setVideoUrl("");
                setConfirmedAccurate(false);
                setConsentAgreed(false);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Submit another application
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* =========================================================================
              1. PAGE INTRODUCTION (Full Screen Width — Not Shrunk)
              ========================================================================= */}
          <div className="w-full bg-[#FAF8F3] border border-[#0E3A2F]/15 rounded-3xl p-6 sm:p-10 md:p-12 lg:p-14 text-left space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full font-mono">
                ✨ Apply for Internship
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
              Your Skills Can Shape a Generation.
            </h1>

            <div className="w-full max-w-5xl space-y-4 text-slate-700 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              <p>
                At Right-Minds Africa Hub, we believe that meaningful change happens when people use their skills, knowledge and passion to empower others. We are building a team of committed interns who want to develop young people, strengthen our programmes and create lasting impact across Africa.
              </p>
              <p>
                Whether you are a creative professional, communicator, event organiser, community builder or someone willing to contribute and learn, there may be a place for you on our team.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={scrollToForm}
                className="px-8 py-4 bg-[#0E3A2F] hover:bg-[#0c3127] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl cursor-pointer transition-all inline-flex items-center gap-2.5 shadow-md hover:shadow-lg"
              >
                <span>Apply for Internship</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Copy direct share link to this application page"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              2. INTERNSHIP ROLES SHOWCASE (Full Width Across All Columns)
              ========================================================================= */}
          <div className="w-full space-y-8 text-left">
            <div className="border-l-4 border-[#0E3A2F] pl-4">
              <span className="text-[10px] font-black uppercase text-[#0E3A2F] font-mono tracking-widest bg-[#FAF8F3] border border-[#0E3A2F]/10 px-3 py-1 rounded-full">
                💼 Internship Roles
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display uppercase tracking-tight mt-2">
                Explore Where You Can Make an Impact
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                We are recruiting committed interns across three key divisions. Review the opportunities below, then complete the application form to apply.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Creative and Media */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0E3A2F]/10 text-[#0E3A2F] rounded-xl">
                      <Palette size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">Creative and Media</h3>
                      <span className="text-[10px] text-slate-400 font-mono">5 Open Positions</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">1. Graphic Designer</strong>
                      Designs flyers, campaign graphics, event materials and social media creatives.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">2. Video Editor</strong>
                      Edits event videos, interviews, promotional videos and short-form content.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">3. Content Creator</strong>
                      Develops content ideas, scripts, captions and educational content.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">4. Social Media Manager</strong>
                      Plans content calendars, schedules posts, manages engagement and online growth.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">5. Writer / Copywriter</strong>
                      Develops articles, newsletters, announcements and campaign copy.
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryRole("Graphic Designer");
                    scrollToForm();
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-[#0E3A2F] hover:text-white text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Apply for Creative Roles &darr;
                </button>
              </div>

              {/* Programmes and Community */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0E3A2F]/10 text-[#0E3A2F] rounded-xl">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">Programmes & Community</h3>
                      <span className="text-[10px] text-slate-400 font-mono">4 Open Positions</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">6. Programme Coordinator</strong>
                      Supports programme planning, scheduling, team coordination and execution.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">7. WhatsApp Community Manager</strong>
                      Welcomes members, shares approved updates, and moderates discussions.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">8. Community Engagement Intern</strong>
                      Supports outreach, member engagement and community growth.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">9. Research & Documentation</strong>
                      Researches relevant topics and documents programme activities and outcomes.
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryRole("Programme Coordinator");
                    scrollToForm();
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-[#0E3A2F] hover:text-white text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Apply for Programme Roles &darr;
                </button>
              </div>

              {/* Events and Operations */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0E3A2F]/10 text-[#0E3A2F] rounded-xl">
                      <HeartHandshake size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">Events & Operations</h3>
                      <span className="text-[10px] text-slate-400 font-mono">5 Open Positions</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">10. Public Speaker / Event Host</strong>
                      Hosts events, introduces speakers and engages audiences.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">11. Event Moderator</strong>
                      Facilitates discussions, manages Q&A sessions and maintains conversations.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">12. Event Support Intern</strong>
                      Assists with event planning, registration, logistics and coordination.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">13. Outreach & Partnership Intern</strong>
                      Identifies potential collaborators and supports partnership development.
                    </li>
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="block text-slate-900 text-xs font-bold">14. Administrative / Operations</strong>
                      Assists with scheduling, records and internal coordination.
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryRole("Event Support Intern");
                    scrollToForm();
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-[#0E3A2F] hover:text-white text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Apply for Event Roles &darr;
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. NATIVE IN-PAGE APPLICATION CONTAINER (Seamless, Full Width, Responsive)
              ========================================================================= */}
          <div
            id="volunteer-application-form"
            className={`w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm text-left scroll-mt-20 overflow-hidden ${
              formMode === "google_form" ? "p-0" : "p-6 sm:p-8 md:p-10 lg:p-12 space-y-8"
            }`}
          >
            {formMode === "google_form" ? (
              /* Native In-Page Google Form Embed — Seamless, Flush Container, Zero Extra Padding/Headers */
              <div className="w-full relative min-h-[5096px] bg-white overflow-x-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#0E3A2F] via-emerald-700 to-amber-500" />
                {isIframeLoading && (
                  <div className="absolute inset-x-0 top-1.5 h-96 flex flex-col items-center justify-center bg-white/95 z-10 gap-3">
                    <Loader2 size={32} className="animate-spin text-[#0E3A2F]" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
                      Loading Internship Application Form...
                    </p>
                  </div>
                )}

                <iframe
                  src={getEmbedUrl(googleFormUrl)}
                  width="100%"
                  height="5096"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  scrolling="no"
                  onLoad={() => setIsIframeLoading(false)}
                  className="block w-full min-h-[5096px] bg-white border-0 m-0 p-0 overflow-x-hidden"
                  title="Right-Minds Africa Hub Internship Application"
                >
                  Loading…
                </iframe>
              </div>
            ) : (
              /* Direct Interactive Form Mode (100% Full Width) */
              <div className="w-full space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-[#0E3A2F] font-mono tracking-widest bg-[#FAF8F3] border border-[#0E3A2F]/10 px-3 py-1.5 rounded-full">
                        📝 Official Internship Application
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                      Internship Intake Form
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Complete the official application form below to join the Right-Minds Africa Hub internship team.
                    </p>
                  </div>
                </div>
                {submitError && (
                  <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5 font-medium animate-fadeIn">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* SECTION A */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                      <span className="w-6 h-6 rounded-full bg-[#0E3A2F] text-white text-xs font-black flex items-center justify-center">
                        A
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                        Section A — Personal Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="space-y-1.5" data-error-field="fullName">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          1. Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: "" }));
                          }}
                          placeholder="e.g. Oluwaseun Adeleke"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5" data-error-field="email">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          2. Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                          }}
                          placeholder="e.g. seun@gmail.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5" data-error-field="phone">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          3. Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: "" }));
                          }}
                          placeholder="e.g. +234 812 345 6789"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5" data-error-field="location">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          4. City / State of Residence <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            if (fieldErrors.location) setFieldErrors(prev => ({ ...prev, location: "" }));
                          }}
                          placeholder="e.g. Ibadan, Oyo State"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                        5. Preferred Contact Method
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {(["WhatsApp", "Phone Call", "Email"] as const).map((method) => (
                          <label
                            key={method}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                              contactMethod === method
                                ? "bg-[#0E3A2F] text-white border-[#0E3A2F]"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <input
                              type="radio"
                              name="contactMethod"
                              checked={contactMethod === method}
                              onChange={() => setContactMethod(method)}
                              className="sr-only"
                            />
                            <span>{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION B */}
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                      <span className="w-6 h-6 rounded-full bg-[#0E3A2F] text-white text-xs font-black flex items-center justify-center">
                        B
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                        Section B — Internship Interests
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5" data-error-field="primaryRole">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          6. Primary Internship Role <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={primaryRole}
                          onChange={(e) => setPrimaryRole(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E3A2F]"
                        >
                          {VOLUNTEER_ROLES.map((cat) => (
                            <optgroup key={cat.category} label={cat.category}>
                              {cat.roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          7. Secondary Internship Role (Optional)
                        </label>
                        <select
                          value={secondaryRole}
                          onChange={(e) => setSecondaryRole(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E3A2F]"
                        >
                          <option value="">None / Open to Primary Choice Only</option>
                          {VOLUNTEER_ROLES.map((cat) => (
                            <optgroup key={cat.category} label={cat.category}>
                              {cat.roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5" data-error-field="skills">
                      <label className="text-2xs font-black uppercase tracking-wider text-slate-600 block">
                        8. Relevant Skills (Select all that apply) <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {SKILL_OPTIONS.map((skill) => {
                          const isSelected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-[#0E3A2F] text-white border-[#0E3A2F]"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <span className="truncate pr-1">{skill}</span>
                              {isSelected && <Check size={14} className="shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5" data-error-field="whyVolunteer">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          10. Why do you want to intern with us? <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={whyVolunteer}
                          onChange={(e) => setWhyVolunteer(e.target.value)}
                          placeholder="Tell us what motivates you..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1.5" data-error-field="valueBrought">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          11. What value or skills will you bring? <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={valueBrought}
                          onChange={(e) => setValueBrought(e.target.value)}
                          placeholder="Describe specific strengths or skills..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 resize-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          12. Availability
                        </label>
                        <select
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E3A2F]"
                        >
                          <option value="Weekdays">Weekdays</option>
                          <option value="Weekends">Weekends</option>
                          <option value="Flexible">Flexible</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                          13. Preferred Working Arrangement
                        </label>
                        <select
                          value={workArrangement}
                          onChange={(e) => setWorkArrangement(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E3A2F]"
                        >
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION C */}
                  <div className="space-y-4 pt-4 border-t border-slate-100" data-error-field="videoUrl">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                      <span className="w-6 h-6 rounded-full bg-[#0E3A2F] text-white text-xs font-black flex items-center justify-center">
                        C
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                        Section C — Introduction Video Link
                      </h4>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-2xs font-black uppercase tracking-wider text-slate-600">
                        14. Share a link to your 60-second introduction video <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtu.be/... or Google Drive / Loom shareable link"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3A2F] text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* SECTION D */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <label className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmedAccurate}
                        onChange={(e) => setConfirmedAccurate(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#0E3A2F]"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        15. I confirm that the information provided is accurate. <span className="text-rose-500">*</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => setConsentAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#0E3A2F]"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        16. I have read and agree to the internship application privacy notice. <span className="text-rose-500">*</span>
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-[#0E3A2F] hover:bg-[#0c3127] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      <span>Submit Internship Application</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </>
      )}

      {/* =========================================================================
          PRIVACY NOTICE MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#0E3A2F]" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
                    Internship Application Privacy Notice
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-650 leading-relaxed max-h-80 overflow-y-auto pr-1">
                <p>
                  <strong>Right-Minds Africa Hub</strong> is committed to handling your personal data responsibly, respectfully, and securely.
                </p>
                <p>
                  <strong>How we use your data:</strong> The personal information, skills, video link, and contact details you provide in this form are gathered exclusively for evaluating your suitability for open internship tracks and contacting you regarding the application process.
                </p>
                <p>
                  <strong>Confidentiality:</strong> Your responses are accessible only to authorised administrative coordinators and team leads. We never sell, rent, or distribute candidate records to commercial third parties.
                </p>
                <p>
                  <strong>Data Storage & Retention:</strong> Application submissions are retained securely in our catalog database. You may request deletion or correction of your application records at any time by contacting our coordinating office at <em>info@rightmindsafrica.org</em>.
                </p>
              </div>

              <div className="pt-2 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-5 py-2.5 bg-[#0E3A2F] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Understood & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
