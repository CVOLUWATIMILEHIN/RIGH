import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, CheckCircle2, ChevronRight, Users, 
  HeartHandshake, Landmark, ArrowRight, Star, ChevronDown,
  Palette, PenTool, Share2, MapPin, Clock, Briefcase, Heart, 
  ExternalLink, AlertCircle, Info, Check, UploadCloud, Search, 
  FileText, Activity, Server, Loader2, Calendar, ShieldCheck, CreditCard
} from "lucide-react";
import { 
  saveRegistration, 
  savePortalApplication, 
  getPortalApplications, 
  PortalApplication,
  getDonations,
  saveDonation,
  DonationRecord
} from "../../lib/db";
import { PageContainer } from "../PageContainer";
import VolunteerApplicationPage from "./VolunteerApplicationPage";

interface InvolvedViewsProps {
  subView: "community" | "volunteer" | "partner" | "donate";
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

type AppChannelType = "volunteer" | "internship" | "partner" | "facilitator" | "ambassador";

export default function InvolvedViews({ subView, onNavigate, onOpenJoin }: InvolvedViewsProps) {
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When volunteer is selected, seamlessly navigate to the dedicated full-screen volunteer-application view
  useEffect(() => {
    if (subView === "volunteer") {
      onNavigate("volunteer-application");
    }
  }, [subView, onNavigate]);

  // Application Channel Tabs State
  const [selectedChannel, setSelectedChannel] = useState<AppChannelType>("volunteer");

  // State Tracking Widget States
  const [trackerEmail, setTrackerEmail] = useState("");
  const [trackedApps, setTrackedApps] = useState<PortalApplication[]>([]);
  const [hasSearchedTracker, setHasSearchedTracker] = useState(false);
  const [isSearchingTracker, setIsSearchingTracker] = useState(false);

  // Drag & Drop visual indicators / states
  const [isDragging, setIsDragging] = useState(false);
  const [mockFile, setMockFile] = useState<{ name: string; size: string; status: "idle" | "uploading" | "success" }>({
    name: "",
    size: "",
    status: "idle"
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  // General field variables
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  
  // Specific channel states
  const [volunteerTrack, setVolunteerTrack] = useState("designer");
  const [commitmentHours, setCommitmentHours] = useState("5-10 hours/week");
  const [university, setUniversity] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [facilitatorFocus, setFacilitatorFocus] = useState("Growth-Mindset");
  const [interestReason, setInterestReason] = useState("");

  // DONATIONS STATES
  const [donationsList, setDonationsList] = useState<DonationRecord[]>([]);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donateAmount, setDonateAmount] = useState<number>(35);
  const [selectedPathway, setSelectedPathway] = useState<DonationRecord["type"]>("scholarship");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "crypto">("card");
  
  // Multi-step Checkout States:
  // "details" -> "review" -> "thank-you"
  const [checkoutStep, setCheckoutStep] = useState<"details" | "review" | "thank-you">("details");
  const [createdDonation, setCreatedDonation] = useState<DonationRecord | null>(null);

  // Load donations log
  const loadDonations = () => {
    getDonations().then(list => {
      setDonationsList(list);
    });
  };

  useEffect(() => {
    loadDonations();
  }, [subView]);

  // Volunteer Departments
  const volunteerDepartments = [
    { id: "designer", title: "Graphic Designer", icon: Palette },
    { id: "writer", title: "Content Writer & Creator", icon: PenTool },
    { id: "social_media", title: "Social Media Manager", icon: Share2 },
    { id: "facilitator", title: "Classroom Facilitator", icon: Users },
    { id: "coordinator", title: "State Command Coordinator", icon: MapPin }
  ];

  // Drag & Drop simulation triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDropSimulation = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    triggerMockUpload("RMA_Application_Resume.pdf", "1.6 MB");
  };

  const triggerMockUpload = (fileName: string, fileSize: string) => {
    setMockFile({ name: fileName, size: fileSize, status: "uploading" });
    setUploadProgress(10);
    
    // Smooth progress simulation
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setMockFile(m => ({ ...m, status: "success" }));
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMockFile({ name: "", size: "", status: "idle" });
    setUploadProgress(0);
  };

  // Submit careers application
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !location.trim()) {
      setErrorMsg("Please complete all personal contact parameters prior to submission.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Please provide a valid email format.");
      return;
    }

    try {
      setIsSubmitting(true);

      const options: Record<string, any> = {
        location,
        interestReason: interestReason || "N/A"
      };

      if (selectedChannel === "volunteer") {
        options.volunteerTrack = volunteerTrack;
        options.commitmentHours = commitmentHours;
      } else if (selectedChannel === "internship") {
        options.university = university;
        options.fieldOfStudy = fieldOfStudy;
      } else if (selectedChannel === "facilitator") {
        options.facilitatorFocus = facilitatorFocus;
      } else if (selectedChannel === "ambassador") {
        options.university = university;
      }

      await savePortalApplication({
        fullName,
        email,
        phone,
        type: selectedChannel,
        fileName: mockFile.name || undefined,
        fileData: mockFile.status === "success" ? "MOCK_BASE64_CREDENTIALS" : undefined,
        notes: interestReason,
        options
      });

      setSuccess(`Application successfully transmitted! Reference logged under Email: ${email}. Monitor status changes above using the Live status tracking tab!`);
      
      setFullName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setInterestReason("");
      setMockFile({ name: "", size: "", status: "idle" });
      setUploadProgress(0);
    } catch (err) {
      setErrorMsg("An unexpected system exception occurred syncing document state.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tracking Search
  const handleTrackSearch = async () => {
    if (!trackerEmail.trim() || !trackerEmail.includes("@")) {
      return;
    }

    try {
      setIsSearchingTracker(true);
      setHasSearchedTracker(true);
      const list = await getPortalApplications();
      const matched = list.filter(app => app.email.trim().toLowerCase() === trackerEmail.trim().toLowerCase());
      setTrackedApps(matched);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingTracker(false);
    }
  };

  // Donation Submission Handling
  const handleDonationDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim() || donateAmount <= 0) {
      setErrorMsg("Please provide accurate name, email address and positive donation values.");
      return;
    }
    if (!donorEmail.includes("@")) {
      setErrorMsg("Please provide a valid email format.");
      return;
    }
    setErrorMsg("");
    setCheckoutStep("review");
  };

  const handleFinalizeDonation = async () => {
    try {
      setIsSubmitting(true);
      
      let subTypeDescription = "General Operating Audit";
      if (selectedPathway === "scholarship") {
        subTypeDescription = `Sponsor student workbook printouts ($${donateAmount})`;
      } else if (selectedPathway === "sponsor") {
        subTypeDescription = `Sponsor Graduate career upskilling seats ($${donateAmount})`;
      }

      const record = await saveDonation(donorName, donorEmail, donateAmount, selectedPathway, subTypeDescription);
      setCreatedDonation(record);
      setCheckoutStep("thank-you");
      loadDonations(); // refresh recent timeline feed!
    } catch (err) {
      setErrorMsg("Server error caching donation credentials to Cloud Firestore.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: PortalApplication["status"]) => {
    switch (status) {
      case "Received": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Reviewed": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Shortlisted": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Enrolled": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Deferred": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Custom Donor Wall Tags
  const getDonorBadge = (amount: number) => {
    if (amount <= 10) return { label: "Mindset Supporter", bg: "bg-slate-100 text-slate-700 border-slate-200" };
    if (amount <= 99) return { label: "Curriculum Sponsor", bg: "bg-amber-500/10 text-amber-700 border-amber-500/20" };
    return { label: "Civic Partner", bg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      <div className="absolute top-20 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10 font-sans">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-905">Get Involved</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-amber-550 capitalize">{subView}</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="involved-mobile-section-nav">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[#0E3A2F]/50 font-mono mb-1.5 font-sans">
            📂 Get Involved Subsections
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#FAF8F3]/60 border border-[#0E3A2F]/10 rounded-2xl text-xs font-black uppercase text-slate-800 tracking-wider shadow-sm focus:outline-none"
          >
            <span>
              {subView === "community" && "Join Our Fast-Growing Community"}
              {subView === "volunteer" && "Career Opportunities & Applications"}
              {subView === "partner" && "Partner With Our Agency"}
              {subView === "donate" && "Direct Donation & Support"}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 text-slate-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1 text-left"
              >
                {[
                  { label: "Community", view: "get-involved-community" },
                  { label: "Opportunities & Applications", view: "get-involved-volunteer" },
                  { label: "Partnership", view: "get-involved-partner" },
                  { label: "Direct Donation & Support", view: "get-involved-donate" }
                ].map((option) => {
                  const isActive = "get-involved-" + subView === option.view;
                  return (
                    <button
                      key={option.view}
                      onClick={() => {
                        onNavigate(option.view);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-[#0E3A2F] text-white" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section title */}
        <div className="max-w-3xl space-y-4 mb-12 border-l-4 border-slate-900 pl-6 text-left">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Sparkles size={11} /> Global Collaboration
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
            {subView === "community" && "Join Our Fast-Growing Community"}
            {subView === "volunteer" && "Opportunities Portal"}
            {subView === "partner" && "Partner With Our Agency"}
            {subView === "donate" && "Direct Donation & Support"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            {subView === "community" && "Connect with a tribe of over 250+ highly motivated, purpose-driven youth scaling regional commands."}
            {subView === "volunteer" && "Onboard as a physical volunteer, apply for internships, facilitator roles, or represent as campus ambassador."}
            {subView === "partner" && "Integrate your corporate values, sponsor specialized upskilling bootcamps, or secure recruitment channels."}
            {subView === "donate" && "Directly sponsor workbook printouts for teens, upskilling licenses for graduates, or general operating audits."}
          </p>
        </div>


        {/* =====================================================================
            DEDICATED VOLUNTEER APPLICATION PAGE
            ===================================================================== */}
        {subView === "volunteer" && (
          <VolunteerApplicationPage onNavigate={onNavigate} onOpenJoin={onOpenJoin} />
        )}

        {/* =====================================================================
            DIRECT DONATIONS & SUPPORT PANEL (With Checkout Flow & Donor Wall)
           ===================================================================== */}
        {subView === "donate" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Left Hand: Pathways Cards & Checkout Simulation */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Preset Pathways Selection cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0E3A2F] border-b pb-1.5">
                  💡 Select Sponsorship Pathway
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "scholarship", title: "Sponsor a Teen", val: 5, info: "Sponsors 1 secondary student daily habit journal & training workbook printing.", icon: Heart },
                    { id: "sponsor", title: "Sponsor a Graduate", val: 35, info: "Sponsors 1 graduate upskilling license, CV overhauled portfolio and mentor matching.", icon: ShieldCheck },
                    { id: "one-time", title: "Regional Sponsor", val: 150, info: "Directly funds physical school outreaches, textbooks giveaways, and state log.", icon: Landmark }
                  ].map((path) => {
                    const isSelected = selectedPathway === path.id;
                    const IconComp = path.icon;
                    return (
                      <button
                        key={path.id}
                        type="button"
                        onClick={() => {
                          setSelectedPathway(path.id as any);
                          setDonateAmount(path.val);
                          if (checkoutStep === "thank-you") setCheckoutStep("details");
                        }}
                        className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between h-44 ${
                          isSelected 
                            ? "bg-amber-500/5 border-[#0E3A2F] ring-2 ring-[#0E3A2F]/10 text-[#0E3A2F]" 
                            : "bg-white border-slate-150 hover:bg-slate-50/50 hover:border-slate-350"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className={`p-1.5 rounded-lg w-8 h-8 flex items-center justify-center border ${isSelected ? "bg-[#0E3A2F]/10 border-[#0E3A2F]/20 text-[#0E3A2F]" : "bg-slate-50 text-slate-450 border-slate-150"}`}>
                            <IconComp size={14} />
                          </div>
                          <h4 className="font-extrabold text-xs uppercase tracking-tight text-slate-900 leading-none">{path.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-normal font-sans line-clamp-3 leading-tight">{path.info}</p>
                        </div>
                        <span className="text-sm font-extrabold font-mono text-[#0E3A2F] block pt-3 border-t border-slate-100 mt-2">
                          ${path.val} USD
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHECKOUT FLOW FORM CONTAINER */}
              <div className="bg-slate-50 border border-slate-105 rounded-3xl p-6 sm:p-8 space-y-6">
                
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Support Settlement Form</h3>
                    <p className="text-slate-500 text-3xs font-mono uppercase tracking-wider block mt-0.5">Step: <span className="text-[#0E3A2F] font-black">{checkoutStep}</span></p>
                  </div>
                  <div className="h-6 w-12 rounded-md bg-[#0E3A2F]/10 flex items-center justify-center text-[#0E3A2F]">
                    <CreditCard size={12} />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-2xs rounded-xl flex items-center gap-1.5 font-medium animate-fadeIn">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form state toggler */}
                {checkoutStep === "details" && (
                  <form onSubmit={handleDonationDetailsSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Donor Name *</label>
                        <input 
                          type="text"
                          required
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="Dr. Johnson"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-205 text-xs bg-white text-slate-900 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Donor Email *</label>
                        <input 
                          type="email"
                          required
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder="donor@domain.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-205 text-xs bg-white text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Interactive Custom Amount field */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Sponsorship Investment (USD) *</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-slate-450 text-xs font-mono font-bold">$</span>
                          <input 
                            type="number"
                            required
                            min={1}
                            value={donateAmount}
                            onChange={(e) => setDonateAmount(Number(e.target.value))}
                            className="w-full pl-7 pr-3.5 py-2 rounded-xl border border-slate-210 text-xs bg-white text-slate-900 font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Payment Instrument</label>
                        <select 
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-205 text-xs bg-white text-slate-900 font-semibold"
                        >
                          <option value="card">Simulated Visa / Mastercard</option>
                          <option value="transfer">Direct Bank Transfer coordinates</option>
                          <option value="crypto">Bitcoin / USDT Web3 wallet</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      Continue To Review <ArrowRight size={13} />
                    </button>
                  </form>
                )}

                {checkoutStep === "review" && (
                  <div className="space-y-5 animate-fadeIn">
                    
                    {/* Locked details breakdown card */}
                    <div className="p-4 bg-amber-500/5 border border-dashed border-amber-500/35 rounded-2xl space-y-3.5 text-xs text-slate-800">
                      <div className="border-b pb-2 flex justify-between items-center text-3xs font-mono text-amber-720 uppercase font-black tracking-widest">
                        <span>Pledge Parameters</span>
                        <span>Locked Coordinates</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-2xs font-sans">
                        <span className="text-slate-500 font-bold">Donor Name:</span>
                        <span className="font-extrabold text-[#0E3A2F] text-right">{donorName}</span>
                        
                        <span className="text-slate-500 font-bold">Email Coordinate:</span>
                        <span className="font-extrabold text-slate-900 text-right">{donorEmail}</span>
                        
                        <span className="text-slate-500 font-bold">Sponsoring Track:</span>
                        <span className="font-extrabold text-slate-900 text-right uppercase tracking-wider">
                          {selectedPathway === "scholarship" && "Sponsor Teens"}
                          {selectedPathway === "sponsor" && "Sponsor Graduates"}
                          {selectedPathway === "one-time" && "Regional commands"}
                        </span>
                        
                        <span className="text-slate-500 font-bold">Settlement Instrument:</span>
                        <span className="font-extrabold text-slate-900 text-right capitalize">{paymentMethod}</span>
                        
                        <span className="text-slate-500 font-bold">Final Amount:</span>
                        <span className="font-black text-amber-600 text-right font-mono">${donateAmount} USD</span>
                      </div>
                    </div>

                    {/* Precise explanatory translation card */}
                    <div className="p-4 bg-white border border-slate-150 rounded-2xl flex gap-3 text-xs leading-relaxed text-slate-600 font-normal">
                      <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <p>
                        This direct contribution of <strong className="text-slate-900">${donateAmount} USD</strong> translates instantly into printing <strong>{Math.floor(donateAmount / 5)} physical high-quality, growth handbook journals</strong> or funding upskilling server allocations for undergraduates in our Oyo or Osun command structures.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("details")}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-250 text-slate-700 font-extrabold text-xs uppercase tracking-wide rounded-xl cursor-pointer text-center"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={handleFinalizeDonation}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-[#0E3A2F] hover:bg-[#0c3127] text-white font-extrabold text-xs uppercase tracking-wide rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Finalizing...
                          </>
                        ) : (
                          <>
                            Finalize Support <ShieldCheck size={13} />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                )}

                {checkoutStep === "thank-you" && createdDonation && (
                  <div className="space-y-6 animate-fadeIn py-4">
                    
                    {/* Visual Success Celebration banner */}
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                        <Check size={28} className="stroke-[3]" />
                      </div>
                      <h4 className="text-sm font-black uppercase text-emerald-800 tracking-wide font-display pt-2">Simulated Settlement Cleared Successfully!</h4>
                      <p className="text-3xs font-mono text-slate-400 uppercase tracking-widest leading-none">REF INDEX: {createdDonation.id}</p>
                    </div>

                    {/* Spectacular Certificate of Impact Letter with signatures */}
                    <div className="bg-white border-4 border-amber-500/20 p-6 sm:p-8 rounded-[2rem] shadow-xl text-center relative overflow-hidden font-sans">
                      <div className="absolute top-0 left-0 bg-amber-500 text-slate-900 border-r border-b border-amber-500/10 px-3.5 py-1 text-[9px] font-mono font-black uppercase tracking-widest leading-none">
                        Certificate Office
                      </div>

                      <div className="space-y-4 pt-6">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 font-mono block">RIGHT MINDS AFRICA HONOURS SYSTEM</span>
                        
                        <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed max-w-lg mx-auto font-medium">
                          &ldquo;This is to confirm that <h5 className="font-extrabold text-[#0E3A2F] text-base uppercase font-display inline-block not-italic pl-1 pr-1">{createdDonation.donorName}</h5> has successfully sponsored student transformation tracks under the RMA Hub directory.&rdquo;
                        </p>
                        
                        <p className="text-[10px] text-slate-500 max-w-md mx-auto leading-relaxed">
                          Your support prints key books, matches students to counselors, and breaks background variables blockades across regional chapters.
                        </p>
                      </div>

                      {/* Executive Directorate Sign-off coord */}
                      <div className="pt-6 mt-6 border-t border-dashed border-slate-150 flex justify-between items-center text-3xs font-mono text-slate-400 uppercase">
                        <div className="text-left space-y-1">
                          <span className="font-bold text-slate-700 block">Gracious-Esther</span>
                          <span className="block text-2xs leading-none">Executive Director (ED)</span>
                        </div>
                        <div className="text-right space-y-1 bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/15 text-amber-700 select-none font-bold">
                          SECURE COORD: {createdDonation.id.slice(0, 10)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutStep("details");
                        setDonorName("");
                        setDonorEmail("");
                        setCreatedDonation(null);
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wide rounded-xl cursor-pointer text-center"
                    >
                      Sponsor another student pathway
                    </button>

                  </div>
                )}

              </div>
            </div>

            {/* Right Hand: Dynamic Live Donor Wall Feed */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-6 bg-[#0E3A2F] text-white rounded-3xl space-y-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-[70px] pointer-events-none" />
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-amber-500 text-slate-950 font-black rounded text-[10px] uppercase font-mono tracking-widest leading-none">LIVE FEED</div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#FAF8F3]">Registered Donor Wall</h3>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed font-sans font-medium">
                  We celebrate our active trustees and general operations sponsors who enable free workbooks distribution.
                </p>
              </div>

              {/* Dynamic Donor Wall timelines list */}
              <div className="bg-white border rounded-3xl p-5 space-y-4 max-h-[360px] overflow-y-auto">
                {donationsList.length > 0 ? (
                  <div className="space-y-3">
                    {donationsList.map((don, dIdx) => (
                      <div key={don.id} className="p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 transition-colors text-left animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0 select-none text-xs">
                            ❤️
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase block truncate max-w-[150px] leading-tight">{don.donorName}</span>
                            <span className="text-[10px] text-slate-500 block leading-tight">{don.subType || "General operating support"}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1.5 shrink-0">
                          <span className="text-xs font-black text-slate-950 font-mono block leading-none">${don.amount}</span>
                          <span className={`inline-block text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${getDonorBadge(don.amount).bg} leading-none`}>
                            {getDonorBadge(don.amount).label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-400 text-3xs font-mono uppercase tracking-widest">
                    No donations registered in the local database. Only default structures exist.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* COMMUNITY PATHS RENDERING */}
        {subView === "community" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2 mb-4">
              <Users size={48} className="text-amber-550 mx-auto animate-pulse" />
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight font-display">Join the RMA Community</h3>
              <p className="text-slate-550 max-w-xl mx-auto leading-relaxed text-xs sm:text-sm font-normal">
                Choose how you want to connect with RightMinds Africa. You can register your official profile or join our active instant messaging groups directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Official RMA Registry Portal */}
              <div className="p-6 sm:p-8 bg-white border border-slate-150 rounded-3xl text-left space-y-5 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-brand-blue/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck size={12} /> Official Portal Registry
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">Create Your Official Profile</h4>
                  <p className="text-slate-550 text-xs sm:text-sm leading-relaxed">
                    Map your academic profile or NYSC command cohort to active regional hubs. Setup official coordinates, gain access to certified certificates, and assign mentorship pathways.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                      Map profiles to regional commands
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                      Unlock certification pipelines
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => onOpenJoin("corps_member")}
                  className="w-full mt-4 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all hover:scale-[1.01] active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  Configure My Profile <ArrowRight size={14} />
                </button>
              </div>

              {/* Option 2: Social Discussion Groups */}
              <div className="p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-3xl text-left space-y-5 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-emerald-600/25 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-100/70 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 size={12} /> Instant Messenger Groups
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">Join Live Chat Cohorts</h4>
                  <p className="text-slate-550 text-xs sm:text-sm leading-relaxed">
                    Get immediate access to active discussions, mindset-shifting insights, accountability loops, and real-time event updates inside WhatsApp and Telegram networks.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Participate in daily checking circles
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Real-time mentorship chats
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
                  <a 
                    href="https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm inline-flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-95 text-center"
                  >
                    Join WhatsApp
                  </a>
                  <a 
                    href="https://t.me/+_iA-Xr3CqEoyYzhk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm inline-flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-95 text-center"
                  >
                    Join Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS PATHS RENDERING */}
        {subView === "partner" && (
          <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto text-left">
            <h3 className="font-bold text-slate-900 text-base uppercase mb-4">
              Coordinate Partnership Proposals
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-normal mb-6">
              Please submit your credentials and objectives. Our directors will review alignment with our core values.
            </p>

            {success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                {success}
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Contact Person</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-205 text-xs bg-white text-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-205 text-xs bg-white text-slate-905 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-550">Primary Partnership Focus</label>
                  <select 
                    value={volunteerTrack}
                    onChange={(e) => setVolunteerTrack(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-205 text-xs bg-white text-slate-900 font-semibold"
                  >
                    <option value="sponsor">Sponsor an Upskilling bootcamp</option>
                    <option value="school">Undergraduate Placement Integration</option>
                    <option value="civic">Civic / Community outreach partner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-550">Describe your strategic objectives or values</label>
                  <textarea 
                    rows={4}
                    value={interestReason}
                    onChange={(e) => setInterestReason(e.target.value)}
                    placeholder="Detail your goals..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-205 text-xs bg-white text-slate-900 resize-none font-medium"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer transition-all"
                >
                  Submit Coordination Application
                </button>
              </form>
            )}
          </div>
        )}

      </PageContainer>
    </div>
  );
}
