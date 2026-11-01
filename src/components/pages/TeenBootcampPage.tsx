import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  Download,
  ShieldCheck,
  Award,
  BookOpen,
  Compass,
  Target,
  Mic,
  Video,
  Bot,
  TrendingUp,
  Zap,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Globe,
  Share2,
  Maximize2,
  X,
  Star,
  Shirt,
  Utensils,
  UserCheck,
  Building,
  Heart,
  Brain,
  Cpu,
  MessageSquare,
  Wallet,
  Lightbulb,
  HeartHandshake,
  GraduationCap,
  Crown,
  Lock,
  MessageCircle,
  Play
} from "lucide-react";
import { TeenBootcampConfig, BootcampFacilitator, BootcampFAQItem, BootcampGalleryPhoto, BootcampTestimonial } from "../../types/teenBootcamp";
import { getTeenBootcampConfig } from "../../lib/db";
import TeenBootcampRegistrationModal from "../TeenBootcampRegistrationModal";

interface Props {
  onNavigate?: (view: string) => void;
  onOpenJoin?: (profile?: string) => void;
}

export default function TeenBootcampPage({ onNavigate, onOpenJoin }: Props) {
  const [config, setConfig] = useState<TeenBootcampConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Interactivity State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [galleryCategory, setGalleryCategory] = useState<string>("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq_1");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const loadBootcampData = async () => {
    try {
      const data = await getTeenBootcampConfig();
      setConfig(data);
    } catch (e) {
      console.error("Error loading bootcamp data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBootcampData();
    window.addEventListener("rma_teen_bootcamp_updated", loadBootcampData);
    return () => window.removeEventListener("rma_teen_bootcamp_updated", loadBootcampData);
  }, []);

  // SEO Injection Effect
  useEffect(() => {
    if (!config) return;

    // Document title
    document.title = config.seo?.metaTitle || "Right-Minds Teen Leadership Bootcamp 2026";

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", config.seo?.metaDescription || "");

    // Schema.org Event Structured Data
    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationEvent",
      "name": config.title,
      "description": config.heroDescription,
      "startDate": "2026-08-17T09:00:00+01:00",
      "endDate": "2026-08-22T16:00:00+01:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
      "location": [
        {
          "@type": "Place",
          "name": "Right Minds Hub Kano Center",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kano",
            "addressRegion": "Kano State",
            "addressCountry": "NG"
          }
        },
        {
          "@type": "VirtualLocation",
          "url": "https://rightmindsafrica.org/teen-bootcamp"
        }
      ],
      "image": [config.heroFlyerImage],
      "offers": {
        "@type": "Offer",
        "price": config.registrationFee,
        "priceCurrency": "NGN",
        "availability": "https://schema.org/InStock",
        "url": "https://rightmindsafrica.org/teen-bootcamp"
      },
      "organizer": {
        "@type": "Organization",
        "name": "Right Minds Africa Hub",
        "url": "https://rightmindsafrica.org"
      }
    });
    document.head.appendChild(schemaScript);

    return () => {
      document.head.removeChild(schemaScript);
    };
  }, [config]);

  // Countdown Calculation Loop
  useEffect(() => {
    if (!config?.countdownTarget) return;

    const targetDate = new Date(config.countdownTarget).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Loading Bootcamp Microsite...</p>
        </div>
      </div>
    );
  }

  // Filtered FAQs
  const filteredFaqs = config.faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Filtered Gallery Photos
  const galleryCategories = ["All", "Leadership", "Technology", "Teamwork", "Graduation", "Activities"];
  const filteredGallery = galleryCategory === "All"
    ? config.galleryImages
    : config.galleryImages.filter((g) => g.category === galleryCategory);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldCheck": return <ShieldCheck size={24} className="text-emerald-600" />;
      case "Brain": return <Brain size={24} className="text-amber-600" />;
      case "Cpu": return <Cpu size={24} className="text-blue-600" />;
      case "MessageSquare": return <MessageSquare size={24} className="text-indigo-600" />;
      case "Sparkles": return <Sparkles size={24} className="text-purple-600" />;
      case "Wallet": return <Wallet size={24} className="text-emerald-600" />;
      case "Lightbulb": return <Lightbulb size={24} className="text-amber-500" />;
      case "HeartHandshake": return <HeartHandshake size={24} className="text-rose-600" />;
      case "Compass": return <Compass size={22} />;
      case "Target": return <Target size={22} />;
      case "Mic": return <Mic size={22} />;
      case "Video": return <Video size={22} />;
      case "Bot": return <Bot size={22} />;
      case "TrendingUp": return <TrendingUp size={22} />;
      case "Zap": return <Zap size={22} />;
      case "Shield": return <Shield size={22} />;
      case "Shirt": return <Shirt size={22} className="text-emerald-600" />;
      case "BookOpen": return <BookOpen size={22} className="text-blue-600" />;
      case "Utensils": return <Utensils size={22} className="text-amber-600" />;
      case "UserCheck": return <UserCheck size={22} className="text-purple-600" />;
      case "Award": return <Award size={22} className="text-rose-600" />;
      case "Globe": return <Globe size={22} className="text-teal-600" />;
      default: return <Sparkles size={22} className="text-emerald-600" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-900">
      
      {/* Registration Modal */}
      <TeenBootcampRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        config={config}
      />

      {/* Lightbox Image Viewer */}
      <AnimatePresence>
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={lightboxImage}
              alt="Expanded View"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          1. HERO SECTION
          =================================================================== */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase font-mono tracking-widest shadow-md">
                <Sparkles size={14} className="animate-pulse text-amber-950" />
                FLAGSHIP YOUTH MICROSITE
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.1] text-white">
                Right-Minds <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400">
                  Teen Leadership
                </span>{" "}
                Bootcamp 2026
              </h1>

              {/* Subheadline */}
              <p className="text-xl sm:text-2xl font-bold text-amber-300 font-display">
                {config.subtitle}
              </p>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {config.heroDescription}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Register Now (₦{config.registrationFee.toLocaleString()}) <ArrowRight size={18} />
                </button>

                <a
                  href="#about"
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={16} /> Download Prospectus
                </a>
              </div>

              {/* Countdown Timer Widget */}
              <div className="pt-6 border-t border-slate-800">
                <p className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider mb-3">
                  ⏳ EVENT COUNTDOWN TO 17TH AUGUST 2026:
                </p>
                <div className="grid grid-cols-4 gap-3 max-w-md">
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white block">{timeLeft.days}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Days</span>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white block">{timeLeft.hours}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white block">{timeLeft.minutes}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 block">{timeLeft.seconds}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Quick Event Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-medium">
                <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <Calendar size={16} className="text-amber-400 shrink-0" />
                  <span>{config.eventDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <MapPin size={16} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{config.venue.split(",")[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <Users size={16} className="text-blue-400 shrink-0" />
                  <span>{config.ageGroup.split("(")[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <ShieldCheck size={16} className="text-purple-400 shrink-0" />
                  <span>Fee: ₦{config.registrationFee.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Right Visual Flyer Image */}
            <div className="lg:col-span-5 relative">
              <div
                onClick={() => setLightboxImage(config.heroFlyerImage)}
                className="group relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900 cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
              >
                <img
                  src={config.heroFlyerImage}
                  alt={config.title}
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <span className="font-mono font-bold flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-400" /> OFFICIAL 2026 EVENT FLYER
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Maximize2 size={12} /> Click to Expand
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================
          2. TRUST SECTION
          =================================================================== */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-8">
            PROVEN TRACK RECORD OF IMPACT & EXCELLENCE
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 text-center">
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-emerald-600 dark:text-emerald-400">5+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Years of Impact</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-amber-600 dark:text-amber-400">4,000+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Teens Empowered</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-blue-600 dark:text-blue-400">120+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Programs Delivered</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-purple-600 dark:text-purple-400">85+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Schools Reached</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-indigo-600 dark:text-indigo-400">250+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Leadership Projects</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-rose-600 dark:text-rose-400">3,800+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Certificates Issued</p>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-teal-600 dark:text-teal-400">30+</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Community Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. ABOUT THE BOOTCAMP
          =================================================================== */}
      <section id="about" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image Collage */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                <img
                  src={config.aboutImage}
                  alt="About Right Minds Teen Bootcamp"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20">
                  <span className="text-xs font-bold font-mono text-amber-300 block">AUTHENTIC CLASSROOM EXPERIENCES</span>
                  <p className="text-xs text-slate-200">Interactive peer discussions and leadership labs.</p>
                </div>
              </div>
            </div>

            {/* Right Text Details */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                ABOUT THE FLAGSHIP BOOTCAMP
              </span>

              <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                {config.aboutTitle}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {config.aboutDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Experiential Curriculum
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Not boring lectures. Real-world drills, simulations, and group hackathons.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-600" /> Holistic Growth
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Combining character ethics, AI technology literacy, and emotional intelligence.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="px-6 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-not-allowed border border-slate-300 dark:border-slate-700 select-none"
                  title="Seat reservation is temporarily deactivated while registration form is undergoing maintenance"
                >
                  <Lock size={14} /> Seat Reservation Deactivated (Form Maintenance)
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================
          4. WHY THIS BOOTCAMP? (8 PILLARS)
          =================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
              CORE FOUNDATIONAL PILLARS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Why Parents & Schools Choose This Bootcamp
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Eight essential pillars designed to instill unshakeable confidence, leadership, and future-readiness in every teenager.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {config.whyChoosePillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {renderIcon(pillar.icon)}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. LEARNING TRACKS
          =================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              CURRICULUM BREAKDOWN
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Eight High-Impact Learning Tracks
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Each module is crafted by seasoned youth mentors and industry experts to provide actionable skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.learningTracks.map((track) => (
              <div
                key={track.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      {renderIcon(track.icon)}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      MODULE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {track.title}
                    </h3>
                    <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {track.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {track.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">KEY SKILLS</span>
                    {track.topics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Enroll in Track <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          6. WHO SHOULD ATTEND?
          =================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
              TARGET AUDIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Who Should Attend This Bootcamp?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Designed for driven young minds ready to stand out in school and life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.whoShouldAttend.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-4"
              >
                <div className="p-3 rounded-2xl bg-amber-400 text-amber-950 shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                    {item.badge}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          7. SIX-DAY EXPERIENCE
          =================================================================== */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              DAY-BY-DAY IMMERSIVE ROADMAP
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              The 6-Day Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Click through each day to explore the scheduled activities, hackathons, and key milestones.
            </p>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {config.sixDaySchedule.map((dayItem) => (
              <button
                key={dayItem.day}
                onClick={() => setActiveDay(dayItem.day)}
                className={`px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer font-mono ${
                  activeDay === dayItem.day
                    ? "bg-amber-400 text-amber-950 shadow-lg scale-105"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Day {dayItem.day}
              </button>
            ))}
          </div>

          {/* Active Day Detail Panel */}
          {(() => {
            const currentDayObj = config.sixDaySchedule.find((d) => d.day === activeDay) || config.sixDaySchedule[0];
            return (
              <div className="bg-slate-800/90 border border-slate-700 p-8 rounded-3xl max-w-4xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      DAY {currentDayObj.day} HIGHLIGHT
                    </span>
                    <h3 className="text-2xl font-display font-black text-white mt-1">
                      {currentDayObj.title}
                    </h3>
                    <p className="text-xs font-mono text-emerald-400 mt-0.5">
                      Theme: {currentDayObj.theme}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentDayObj.summary}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">KEY ACTIVITIES & DRILLS:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentDayObj.keyActivities.map((act, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ===================================================================
          8. MEET THE FACILITATORS
          =================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              INSPIRING SPEAKERS & MENTORS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Meet Your Bootcamp Facilitators
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Seasoned leaders, authors, technology creators, and certified youth coaches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.facilitators.map((fac) => (
              <div
                key={fac.id}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                    <img
                      src={fac.photo}
                      alt={fac.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {fac.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {fac.role}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {fac.bio}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-200 dark:border-slate-700/60 mt-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">ORGANIZATION</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fac.organization}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          9. WHAT PARTICIPANTS RECEIVE
          =================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
              DELEGATE PACKAGE & PERKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              What Every Participant Receives
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              A comprehensive toolkit valued at over ₦120,000 included in every registration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.whatParticipantsReceive.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {renderIcon(item.icon)}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          10. PARENTS & GUARDIANS SECTION
          =================================================================== */}
      <section className="py-20 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              <ShieldCheck size={14} /> DEDICATED TO PARENTS & GUARDIANS
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white">
              {config.parentsSection.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {config.parentsSection.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {config.parentsSection.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-max">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-base text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          11. PHOTO GALLERY
          =================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              MEMORY ARCHIVE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Previous Bootcamp Moments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Browse photo archives from our physical cohorts across Nigeria.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
                    galleryCategory === cat
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((img) => (
              <div
                key={img.id}
                onClick={() => setLightboxImage(img.url)}
                className="group relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-[4/3] cursor-pointer"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30">
                    {img.category}
                  </span>
                  <h4 className="font-bold text-sm">{img.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-1">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          12. TESTIMONIALS
          =================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
              STORIES OF TRANSFORMATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Hear From Parents, Students & Principals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.testimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          13. EVENT DETAILS SUMMARY
          =================================================================== */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-amber-400">LOGISTICS SUMMARY</span>
              <h3 className="text-2xl font-display font-black text-white">Event Snapshot & Deadlines</h3>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-amber-400 text-amber-950 font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer"
            >
              Register Participant
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-mono">DATES:</span>
              <strong className="text-white text-sm">{config.eventDetails.date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">PRIMARY VENUE:</span>
              <strong className="text-white text-sm">{config.eventDetails.venue}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">REGISTRATION FEE:</span>
              <strong className="text-amber-300 text-sm font-mono">{config.eventDetails.fee}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">ELIGIBLE AGE:</span>
              <strong className="text-white text-sm">{config.eventDetails.ageRange}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">ACCOMMODATIONS:</span>
              <strong className="text-white text-sm">{config.eventDetails.accommodation}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">REGISTRATION CLOSES:</span>
              <strong className="text-rose-400 text-sm font-mono">{config.eventDetails.closingDate}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          14. FAQ ACCORDION
          =================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              GOT QUESTIONS?
            </span>
            <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>

            {/* Search Input */}
            <div className="relative max-w-md mx-auto pt-2">
              <Search className="absolute left-3.5 top-5 text-slate-400" size={16} />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs (e.g. fee, venue, safety)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={18} className="text-emerald-600 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 mt-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          15. SPONSORS & PARTNERS
          =================================================================== */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            OFFICIAL PARTNERS & SPONSORS
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
            {config.sponsors.map((sp) => (
              <div
                key={sp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-2"
              >
                <img
                  src={sp.logoUrl}
                  alt={sp.name}
                  className="h-10 object-contain grayscale hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-mono font-bold text-slate-500">{sp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          16. REGISTRATION CTA
          =================================================================== */}
      <section className="py-20 bg-gradient-to-r from-emerald-900 via-slate-900 to-amber-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-950 bg-amber-400 px-3.5 py-1 rounded-full shadow-md">
            <Sparkles size={14} /> LIMITED SLOTS AVAILABLE FOR 2026
          </span>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Transform Your Teenager's Future Today
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Registration Fee: <strong className="text-amber-300 font-mono text-xl">₦{config.registrationFee.toLocaleString()}</strong> per delegate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-base shadow-xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              Register Now (₦{config.registrationFee.toLocaleString()}) <ArrowRight size={18} />
            </button>

            <a
              href={`tel:${config.eventDetails.contactPhone}`}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Phone size={16} /> Contact Admin Desk
            </a>
          </div>
        </div>
      </section>

      {/* ===================================================================
          17. CONTACT & MAP SECTION
          =================================================================== */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-left">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400">BOOTCAMP HELPDESK</span>
            <h3 className="text-2xl font-display font-black text-white">Contact & Venue Inquiries</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have questions regarding accommodations, group school discounts, or sponsorship inquiries? Reach our administrative team directly.
            </p>

            <div className="space-y-2 text-xs pt-2 font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone size={16} className="text-emerald-400" />
                <span>{config.eventDetails.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={16} className="text-amber-400" />
                <span>{config.eventDetails.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin size={16} className="text-blue-400" />
                <span>Right Minds Hub Center, Kano State, Nigeria</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">KANO HUB LOCATION MAP</h4>
            <div className="w-full h-48 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#103D2E_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="relative z-10 text-center space-y-1 p-4">
                <MapPin size={28} className="text-emerald-400 mx-auto animate-bounce" />
                <h5 className="font-bold text-sm text-white">Right Minds Hub Kano Center</h5>
                <p className="text-[10px] text-slate-400 font-mono">Verified Physical Host Venue & Broadcast Studio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
