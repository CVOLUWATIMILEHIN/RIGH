import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, CheckCircle2, ArrowRight, Clock, MapPin, 
  Video, Phone, Mail, FileText, ShieldCheck, AlertCircle, 
  Loader2, HelpCircle, ExternalLink, Briefcase, Users, 
  Palette, Share2, HeartHandshake, Info, Check, ChevronDown,
  FileSpreadsheet, Settings, RefreshCw, Globe, Maximize2, Minimize2, Download, Copy, MessageCircle
} from "lucide-react";
import { saveRegistration, savePortalApplication, getPortalApplications, getFirestoreDb } from "../../lib/db";
import {
  RMA_MAIN_DEPARTMENTS,
  RMA_VOLUNTEER_DEPARTMENTS,
  getPositionsForDepartment,
  normalizeVolunteerDepartmentName,
  normalizeVolunteerPositionName,
} from "../../lib/supabaseCms";

interface VolunteerApplicationPageProps {
  onNavigate: (view: string) => void;
  onOpenJoin?: (profile?: string) => void;
}

export const VOLUNTEER_ROLES = RMA_MAIN_DEPARTMENTS.map((dept) => ({
  category: dept.name,
  roles: dept.positions.map((pos) => ({
    id: pos,
    label: pos,
    desc: `Contribute to ${dept.name} through ${pos}.`,
  })),
}));

export const SKILL_OPTIONS = [
  "Graphic Design & Branding",
  "Video Editing & Reels",
  "Photography & Videography",
  "Content Creation & Scriptwriting",
  "Social Media Growth & Community Management",
  "Article Writing, Blogging & Copywriting",
  "Programme Planning & Scheduling",
  "Event Coordination & Logistics",
  "WhatsApp Group Moderation & Community Engagement",
  "Public Speaking, MC & Panel Moderation",
  "Research, Report Writing & Data Documentation",
  "Office Administration & Records Management",
  "Strategic Partnerships & Sponsorship Outreach",
  "Corporate Relations & Stakeholder Engagement",
  "Other"
];

const DEFAULT_GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScq8FZgaFF_hYxLbKk0eLjLwuMW1iYRPjZpYfMljdQ3k_oCHQ/viewform?embedded=true";
export const DEFAULT_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/HbcAPEL2tVMIZBrzIAsx4o?s=cl&p=a&mlu=4&ilr=4&iam=2";
export const INTERNSHIP_WHATSAPP_GROUP_URL = DEFAULT_WHATSAPP_GROUP_URL;
export const LEGACY_WHATSAPP_FALLBACK_URL = "https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC";
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

  // Dedicated Official Internship & Volunteer WhatsApp Community URL (completely separate from G3 Summit)
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_volunteer_whatsapp_url");
      if (
        saved &&
        saved.startsWith("http") &&
        saved !== LEGACY_WHATSAPP_FALLBACK_URL &&
        !saved.includes("J4QmEIJbtPiCXLGm5ELHc5") &&
        !saved.includes("Edz8GULjFbXEbT9e1K3Gfk")
      ) {
        return saved;
      }
      localStorage.setItem("rma_volunteer_whatsapp_url", INTERNSHIP_WHATSAPP_GROUP_URL);
    }
    return INTERNSHIP_WHATSAPP_GROUP_URL;
  });

  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const iframeLoadCount = useRef(0);
  const [googleFormSubmitted, setGoogleFormSubmitted] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(googleFormUrl);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Form input states for native interactive form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [contactMethod, setContactMethod] = useState<"WhatsApp" | "Phone Call" | "Email">("WhatsApp");

  const [selectedDepartment, setSelectedDepartment] = useState<string>(RMA_VOLUNTEER_DEPARTMENTS[0]);
  const [primaryRole, setPrimaryRole] = useState<string>(RMA_MAIN_DEPARTMENTS[0].positions[0]);
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
    department: string;
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
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  // Quick Confirmation Email & WhatsApp Dispatch state for embedded Google Form applicants
  const [gfName, setGfName] = useState("");
  const [gfEmail, setGfEmail] = useState("");
  const [gfPhone, setGfPhone] = useState("");
  const [gfDepartment, setGfDepartment] = useState<string>(RMA_VOLUNTEER_DEPARTMENTS[0]);
  const [gfRole, setGfRole] = useState<string>(RMA_MAIN_DEPARTMENTS[0].positions[0]);
  const [gfSending, setGfSending] = useState(false);
  const [gfError, setGfError] = useState<string | null>(null);
  const [showPostSubmitModal, setShowPostSubmitModal] = useState(false);

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
      const headers = ["Application ID", "Full Name", "Email Address", "Phone Number", "Location", "Main Department", "Position / Specialisation", "Secondary Position", "Relevant Skills", "Why Volunteer", "Value Brought", "Video URL", "Availability", "Work Arrangement", "Submitted At"];
      const rows = volunteerApps.map(a => {
        const rawDept = a.options?.department || a.options?.primaryRole || "";
        const rawPos = a.options?.position || a.options?.primaryRole || "";
        return [
          `"${a.id}"`,
          `"${(a.fullName || '').replace(/"/g, '""')}"`,
          `"${(a.email || '').replace(/"/g, '""')}"`,
          `"${(a.phone || '').replace(/"/g, '""')}"`,
          `"${(a.options?.location || '').replace(/"/g, '""')}"`,
          `"${normalizeVolunteerDepartmentName(rawDept, rawPos).replace(/"/g, '""')}"`,
          `"${normalizeVolunteerPositionName(rawPos, rawDept).replace(/"/g, '""')}"`,
          `"${(a.options?.secondaryRole || '').replace(/"/g, '""')}"`,
          `"${(Array.isArray(a.options?.relevantSkills) ? a.options.relevantSkills.join(', ') : '').replace(/"/g, '""')}"`,
          `"${(a.options?.whyVolunteer || a.notes || '').replace(/"/g, '""')}"`,
          `"${(a.options?.valueContribution || '').replace(/"/g, '""')}"`,
          `"${(a.options?.videoUrl || '').replace(/"/g, '""')}"`,
          `"${(a.options?.availability || '').replace(/"/g, '""')}"`,
          `"${(a.options?.workArrangement || '').replace(/"/g, '""')}"`,
          `"${a.appliedAt || a.options?.submittedAt || ''}"`
        ];
      });

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
          const savedWhatsapp = localStorage.getItem("rma_volunteer_whatsapp_url");
          if (
            savedWhatsapp &&
            savedWhatsapp.startsWith("http") &&
            savedWhatsapp !== LEGACY_WHATSAPP_FALLBACK_URL &&
            !savedWhatsapp.includes("J4QmEIJbtPiCXLGm5ELHc5") &&
            !savedWhatsapp.includes("Edz8GULjFbXEbT9e1K3Gfk")
          ) {
            setWhatsappGroupUrl(savedWhatsapp);
          } else {
            setWhatsappGroupUrl(DEFAULT_WHATSAPP_GROUP_URL);
            localStorage.setItem("rma_volunteer_whatsapp_url", DEFAULT_WHATSAPP_GROUP_URL);
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
          if (
            data.volunteerWhatsappUrl &&
            data.volunteerWhatsappUrl.startsWith("http") &&
            data.volunteerWhatsappUrl !== LEGACY_WHATSAPP_FALLBACK_URL &&
            !data.volunteerWhatsappUrl.includes("J4QmEIJbtPiCXLGm5ELHc5") &&
            !data.volunteerWhatsappUrl.includes("Edz8GULjFbXEbT9e1K3Gfk")
          ) {
            setWhatsappGroupUrl(data.volunteerWhatsappUrl);
            if (typeof window !== "undefined") {
              localStorage.setItem("rma_volunteer_whatsapp_url", data.volunteerWhatsappUrl);
            }
          } else {
            setWhatsappGroupUrl(INTERNSHIP_WHATSAPP_GROUP_URL);
            if (typeof window !== "undefined") {
              localStorage.setItem("rma_volunteer_whatsapp_url", INTERNSHIP_WHATSAPP_GROUP_URL);
            }
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

  const handleSelectDepartmentChange = (deptName: string) => {
    setSelectedDepartment(deptName);
    const positions = getPositionsForDepartment(deptName);
    if (positions.length > 0 && !positions.includes(primaryRole)) {
      setPrimaryRole(positions[0]);
    }
    if (fieldErrors.department || fieldErrors.primaryRole) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.department;
        delete next.primaryRole;
        return next;
      });
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
    if (!selectedDepartment) {
      errors.department = "Please select one of the 6 main departments.";
    }

    if (!primaryRole) {
      errors.primaryRole = "Please select your preferred position within the department.";
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
      const canonicalDepartment = normalizeVolunteerDepartmentName(selectedDepartment, primaryRole);
      const canonicalPosition = normalizeVolunteerPositionName(primaryRole, canonicalDepartment);

      const reg = await saveRegistration({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        profileType: "volunteer",
        programType: "internship",
        programName: "Internship Application",
        department: canonicalDepartment,
        primaryRole: canonicalPosition,
        contactMethod,
        availableHours: `${availability} (${workArrangement})`,
        whatsappLink: whatsappGroupUrl,
        notes: `[Internship Application] Main Department: ${canonicalDepartment} | Position: ${canonicalPosition}${secondaryRole ? ` | Second Choice: ${secondaryRole}` : ""} | Contact Method: ${contactMethod} | Video: ${videoUrl.trim()}`
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
          department: canonicalDepartment,
          position: canonicalPosition,
          primaryRole: canonicalPosition,
          secondaryRole: secondaryRole || "None",
          relevantSkills: selectedSkills,
          previousExperience: previousExperience.trim() || "N/A",
          whyVolunteer: whyVolunteer.trim(),
          valueContribution: valueBrought.trim(),
          availability,
          workArrangement,
          videoUrl: videoUrl.trim(),
          whatsappLink: whatsappGroupUrl,
          confirmedAccurate: true,
          consentAgreed: true,
          submittedAt: new Date().toISOString()
        }
      });

      setSubmittedApp({
        id: portalApp?.id || reg?.id || `VOL-${Date.now().toString().slice(-6)}`,
        fullName: fullName.trim(),
        email: email.trim(),
        department: canonicalDepartment,
        primaryRole: canonicalPosition,
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

  const handleCopyWhatsappLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(whatsappGroupUrl);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2500);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!submittedApp) return;
    setResendingEmail(true);
    setEmailResent(false);
    try {
      const payloadData = {
        id: submittedApp.id,
        referenceNumber: submittedApp.id,
        fullName: submittedApp.fullName,
        email: submittedApp.email,
        programType: "internship",
        programName: "Internship & Volunteer Application",
        department: submittedApp.department,
        primaryRole: submittedApp.primaryRole,
        contactMethod: submittedApp.contactMethod,
        whatsappLink: whatsappGroupUrl,
        whatsappSupportLink: whatsappGroupUrl
      };
      await fetch("/api/email/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "VOLUNTEER_APPLICATION_SUBMITTED",
          payload: payloadData
        })
      });
      setEmailResent(true);
      setTimeout(() => setEmailResent(false), 4000);
    } catch (err) {
      console.warn("Could not resend confirmation email:", err);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGoogleFormQuickConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setGfError(null);
    if (!gfName.trim()) {
      setGfError("Please enter your Full Name.");
      return;
    }
    if (!gfEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gfEmail.trim())) {
      setGfError("Please enter a valid Email Address to receive your confirmation mail and WhatsApp link.");
      return;
    }

    setGfSending(true);
    try {
      const canonicalDepartment = normalizeVolunteerDepartmentName(gfDepartment, gfRole);
      const canonicalPosition = normalizeVolunteerPositionName(gfRole, canonicalDepartment);

      const reg = await saveRegistration({
        fullName: gfName.trim(),
        email: gfEmail.trim(),
        phone: gfPhone.trim() || "Provided via Google Form",
        location: "Nigeria",
        profileType: "volunteer",
        programType: "internship",
        programName: "Internship Application",
        department: canonicalDepartment,
        primaryRole: canonicalPosition,
        contactMethod: "WhatsApp",
        whatsappLink: whatsappGroupUrl,
        notes: `[Google Form Internship Application] Main Department: ${canonicalDepartment} | Position: ${canonicalPosition}`
      });

      const portalApp = await savePortalApplication({
        fullName: gfName.trim(),
        email: gfEmail.trim(),
        phone: gfPhone.trim() || "Provided via Google Form",
        type: "volunteer",
        notes: `Submitted via Embedded Google Form — Department: ${canonicalDepartment} | Position: ${canonicalPosition}`,
        options: {
          department: canonicalDepartment,
          position: canonicalPosition,
          primaryRole: canonicalPosition,
          preferredContactMethod: "WhatsApp",
          whatsappLink: whatsappGroupUrl,
          submittedVia: "Google Form",
          submittedAt: new Date().toISOString()
        }
      });

      setSubmittedApp({
        id: portalApp?.id || reg?.id || `VOL-${Date.now().toString().slice(-6)}`,
        fullName: gfName.trim(),
        email: gfEmail.trim(),
        department: canonicalDepartment,
        primaryRole: canonicalPosition,
        contactMethod: "WhatsApp & Email",
        submittedAt: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      });
      setShowPostSubmitModal(false);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setGfError(err?.message || "Failed to send confirmation email. Please try again.");
    } finally {
      setGfSending(false);
    }
  };

  const departmentPositions = getPositionsForDepartment(selectedDepartment);
  const gfDepartmentPositions = getPositionsForDepartment(gfDepartment);

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

          <div className="p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-emerald-900 text-sm sm:text-base leading-relaxed font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <Mail size={15} className="text-emerald-600" />
                <span>Resend Confirmation Email &amp; WhatsApp Support Link Dispatched</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900">
                Thank you for your interest in Right-Minds Africa Hub! An official confirmation email thanking you for applying—complete with your reference ID (<strong>{submittedApp.id}</strong>) and a direct <strong>WhatsApp support &amp; community link for queries</strong>—has been sent to <strong>{submittedApp.email}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResendConfirmationEmail}
              disabled={resendingEmail}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-2xs"
            >
              {resendingEmail ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : emailResent ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Email Sent!</span>
                </>
              ) : (
                <>
                  <Mail size={13} />
                  <span>Resend Email</span>
                </>
              )}
            </button>
          </div>

          {/* OFFICIAL WHATSAPP COMMUNITY INVITE CARD */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-[#0E3A2F] via-[#12493b] to-[#0b2e25] text-white rounded-3xl shadow-lg border border-emerald-500/30 space-y-5 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#25D366]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#25D366]/20 text-emerald-300 border border-[#25D366]/40 px-3 py-1 rounded-full font-mono">
                  <MessageCircle size={12} /> Mandatory Next Step • Official WhatsApp Community
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold uppercase font-display tracking-tight text-white">
                  Join the Internship &amp; Volunteer WhatsApp Group
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Connect immediately with our onboarding coordinators, receive real-time orientation schedules, and meet fellow Right-Minds Africa Hub interns and volunteers in our official WhatsApp community.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-emerald-200/90 break-all">
                  <span>Official Link:</span>
                  <a
                    href={whatsappGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-amber-300 hover:text-amber-200 font-bold"
                  >
                    {whatsappGroupUrl}
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href={whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MessageCircle size={18} className="fill-slate-950" />
                  <span>Join WhatsApp Group Now</span>
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={handleCopyWhatsappLink}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedWhatsapp ? (
                    <>
                      <Check size={14} className="text-emerald-300" />
                      <span>WhatsApp Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy WhatsApp Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Applicant Name</span>
              <strong className="text-slate-900 text-sm">{submittedApp.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Main Department</span>
              <strong className="text-amber-700 text-xs uppercase">{submittedApp.department}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-3xs uppercase block">Position Applied For</span>
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
                1. Check your email inbox (<strong>{submittedApp.email}</strong>) for your official confirmation mail.<br />
                2. Click the green <strong>Join WhatsApp Group Now</strong> button above (or use the link inside your confirmation email) to join our official onboarding channel.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 items-center justify-between border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <MessageCircle size={15} />
                <span>Open WhatsApp Community</span>
                <ExternalLink size={13} />
              </a>
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
                ✨ Apply for Internship &amp; Volunteering
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
              Your Skills Can Shape a Generation.
            </h1>

            <div className="w-full max-w-5xl space-y-4 text-slate-700 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              <p>
                At Right-Minds Africa Hub, we believe that meaningful change happens when people use their skills, knowledge and passion to empower others. We are building a team of committed interns and volunteers who want to develop young people, strengthen our programmes and create lasting impact across Africa.
              </p>
              <p>
                Whether you are a creative professional, communicator, event organiser, community builder, researcher or partnership strategist, there is a place for you across our 6 Main Departments.
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
              2. 6 MAIN DEPARTMENTS & SPECIALISED POSITIONS SHOWCASE
              ========================================================================= */}
          <div className="w-full space-y-8 text-left">
            <div className="border-l-4 border-[#0E3A2F] pl-4">
              <span className="text-[10px] font-black uppercase text-[#0E3A2F] font-mono tracking-widest bg-[#FAF8F3] border border-[#0E3A2F]/10 px-3 py-1 rounded-full">
                💼 6 Main Departments &amp; Specialisations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display uppercase tracking-tight mt-2">
                Explore Where You Can Make an Impact
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Right-Minds Africa is structured into 6 Main Departments, each containing specialised positions and functions. Select a department or position below to apply.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RMA_MAIN_DEPARTMENTS.map((dept, deptIdx) => (
                <div
                  key={dept.name}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 hover:border-[#0E3A2F]/30 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#0E3A2F]/10 text-[#0E3A2F] rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                        {deptIdx + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide leading-snug">
                          {dept.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dept.positions.length} Specialised Positions
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700">
                      {dept.positions.map((pos) => (
                        <li
                          key={pos}
                          onClick={() => {
                            setSelectedDepartment(dept.name);
                            setPrimaryRole(pos);
                            setFormMode("interactive");
                            scrollToForm();
                          }}
                          className="p-2.5 bg-slate-50 hover:bg-[#0E3A2F]/5 rounded-xl border border-slate-100 hover:border-[#0E3A2F]/20 flex items-center justify-between gap-2 cursor-pointer transition-all group"
                        >
                          <span className="font-bold text-slate-800 group-hover:text-[#0E3A2F]">
                            {pos}
                          </span>
                          <ArrowRight size={13} className="text-slate-300 group-hover:text-[#0E3A2F] shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDepartment(dept.name);
                      setPrimaryRole(dept.positions[0]);
                      scrollToForm();
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-[#0E3A2F] hover:text-white text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    Apply to {dept.name} &darr;
                  </button>
                </div>
              ))}
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
              /* Native In-Page Google Form Embed + Automatic Post-Submission Email & WhatsApp Community Onboarding */
              <div className="w-full bg-white overflow-x-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#0E3A2F] via-emerald-700 to-amber-500" />

                {/* Clean Top Navigation Bar for Form */}
                <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Right-Minds Africa Hub — Official Internship Intake Form</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormMode("interactive")}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-2xs"
                    >
                      Switch to Direct Portal Form
                    </button>
                    <a
                      href={getEmbedUrl(googleFormUrl).replace("&embedded=true", "").replace("?embedded=true", "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Google Form Iframe with Submission Detection */}
                <div className="w-full relative min-h-[5096px] bg-white overflow-x-hidden">
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
                    onLoad={() => {
                      setIsIframeLoading(false);
                      iframeLoadCount.current += 1;
                      if (iframeLoadCount.current >= 2) {
                        setGoogleFormSubmitted(true);
                        setShowPostSubmitModal(true);
                      }
                    }}
                    className="block w-full min-h-[5096px] bg-white border-0 m-0 p-0 overflow-x-hidden"
                    title="Right-Minds Africa Hub Internship Application"
                  >
                    Loading…
                  </iframe>
                </div>

                {/* Bottom Helper Bar (triggers popup on click if browser didn't reload iframe) */}
                <div className="border-t border-slate-200 bg-slate-50 px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">
                      Already clicked Submit on the Google Form?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Your confirmation popup will trigger automatically upon submission. If it didn't open, click the button to get your email and WhatsApp link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPostSubmitModal(true)}
                    className="px-5 py-2.5 bg-[#0E3A2F] hover:bg-[#0c3127] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all shrink-0"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Get Confirmation Email &amp; WhatsApp Access &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Direct Interactive Form Mode (100% Full Width) */
              <div className="w-full space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-[#0E3A2F] font-mono tracking-widest bg-[#FAF8F3] border border-[#0E3A2F]/10 px-3 py-1.5 rounded-full">
                        📝 Official Internship &amp; Volunteer Application
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                      Internship &amp; Volunteer Intake Form
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Complete the official application form below to join one of the 6 Main Departments at Right-Minds Africa Hub.
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

                  {/* SECTION B — DEPARTMENT & SPECIALISED POSITION SELECTION */}
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                      <span className="w-6 h-6 rounded-full bg-[#0E3A2F] text-white text-xs font-black flex items-center justify-center">
                        B
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                        Section B — Main Department &amp; Specialised Position
                      </h4>
                    </div>

                    {/* Step 1: Select 1 of the 6 Main Departments */}
                    <div className="space-y-3" data-error-field="department">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-2xs font-black uppercase tracking-wider text-slate-700">
                          6. Step 1: Select Your Main Department (6 RMA Main Departments) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] font-bold text-[#0E3A2F]">
                          Selected: {selectedDepartment}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {RMA_MAIN_DEPARTMENTS.map((dept, idx) => {
                          const isSelected = selectedDepartment === dept.name;
                          return (
                            <button
                              key={dept.name}
                              type="button"
                              onClick={() => handleSelectDepartmentChange(dept.name)}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                isSelected
                                  ? "bg-[#0E3A2F] text-white border-[#0E3A2F] shadow-sm"
                                  : "bg-slate-50/80 text-slate-800 border-slate-200 hover:bg-white hover:border-[#0E3A2F]/40"
                              }`}
                            >
                              <div>
                                <span
                                  className={`text-[10px] font-mono uppercase tracking-widest block ${
                                    isSelected ? "text-amber-300" : "text-slate-400"
                                  }`}
                                >
                                  Department {idx + 1}
                                </span>
                                <span className="font-extrabold text-xs uppercase leading-snug block mt-0.5">
                                  {dept.name}
                                </span>
                                <span
                                  className={`text-[10px] block mt-1 ${
                                    isSelected ? "text-emerald-100" : "text-slate-500"
                                  }`}
                                >
                                  {dept.positions.length} specialised positions
                                </span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "bg-amber-400 text-slate-950"
                                    : "bg-white border border-slate-300 text-transparent"
                                }`}
                              >
                                <Check size={12} className="stroke-[3]" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Select Preferred Position within the Selected Main Department */}
                    <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4" data-error-field="primaryRole">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-2xs font-black uppercase tracking-wider text-slate-800 block">
                            7. Step 2: Select Your Preferred Position in {selectedDepartment} <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Choose the specific specialisation or position you are applying for within{" "}
                            <strong className="text-slate-700">{selectedDepartment}</strong>:
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {departmentPositions.map((pos) => {
                          const isSelected = primaryRole === pos;
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setPrimaryRole(pos)}
                              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-[#0E3A2F]/40"
                              }`}
                            >
                              <span>{pos}</span>
                              {isSelected && <Check size={13} className="stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Selected Position ({selectedDepartment})
                          </label>
                          <select
                            value={primaryRole}
                            onChange={(e) => setPrimaryRole(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E3A2F]"
                          >
                            {departmentPositions.map((pos) => (
                              <option key={pos} value={pos}>
                                {pos}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Secondary Position Choice (Optional)
                          </label>
                          <select
                            value={secondaryRole}
                            onChange={(e) => setSecondaryRole(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0E3A2F]"
                          >
                            <option value="">None / Open to Primary Position Only</option>
                            {RMA_MAIN_DEPARTMENTS.map((dept) => (
                              <optgroup key={dept.name} label={dept.name}>
                                {dept.positions.map((pos) => (
                                  <option key={`${dept.name}-${pos}`} value={pos}>
                                    {pos} ({dept.name})
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5" data-error-field="skills">
                      <label className="text-2xs font-black uppercase tracking-wider text-slate-600 block">
                        8. Relevant Skills (Select all that apply) <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
          AUTO-POPUP POST-SUBMISSION CONFIRMATION EMAIL & WHATSAPP MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showPostSubmitModal && !submittedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-gradient-to-br from-[#0E3A2F] via-[#12493b] to-[#0b2e25] text-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-left shadow-2xl space-y-6 relative"
            >
              <button
                type="button"
                onClick={() => setShowPostSubmitModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-2 pr-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#25D366]/20 text-emerald-300 border border-[#25D366]/40 px-3 py-1 rounded-full font-mono">
                  <CheckCircle2 size={12} /> Google Form Response Received!
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold uppercase font-display tracking-tight text-white">
                  Final Step: Get Your Confirmation Mail &amp; Join WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Enter your name, email, main department and position below so our automated system immediately sends your <strong>Official Application Confirmation Mail</strong> and opens our <strong>Official WhatsApp Community</strong>.
                </p>
              </div>

              <div className="p-4 bg-white/10 border border-white/15 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                    Direct WhatsApp Community Link:
                  </span>
                  <span className="text-xs text-emerald-100">Join the onboarding group right away:</span>
                </div>
                <a
                  href={whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <MessageCircle size={16} className="fill-slate-950" />
                  <span>Join WhatsApp Group</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <form onSubmit={handleGoogleFormQuickConfirm} className="space-y-3.5">
                {gfError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-100 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-300" />
                    <span>{gfError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-100 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={gfName}
                      onChange={(e) => setGfName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-100 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={gfEmail}
                      onChange={(e) => setGfEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-100 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={gfPhone}
                      onChange={(e) => setGfPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-100 mb-1">
                      Main Department
                    </label>
                    <select
                      value={gfDepartment}
                      onChange={(e) => {
                        const nextDept = e.target.value;
                        setGfDepartment(nextDept);
                        const positions = getPositionsForDepartment(nextDept);
                        if (positions.length > 0) {
                          setGfRole(positions[0]);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {RMA_MAIN_DEPARTMENTS.map((dept) => (
                        <option key={dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-100 mb-1">
                      Preferred Position
                    </label>
                    <select
                      value={gfRole}
                      onChange={(e) => setGfRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {gfDepartmentPositions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={gfSending}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  {gfSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Confirmation Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      <span>Send My Confirmation Email &amp; Open WhatsApp</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
