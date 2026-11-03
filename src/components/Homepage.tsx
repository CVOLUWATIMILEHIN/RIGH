import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, Sparkles, BookOpen, Tv, Mic, 
  Smile, Award, Users, MapPin, Calendar, CheckSquare, Compass, Heart, Clock, ChevronDown,
  ChevronLeft, ChevronRight, Play, Pause, GraduationCap, Building2, UserCheck, Eye, MousePointerClick,
  Facebook, ThumbsUp, MessageCircle, Share2, ExternalLink
} from "lucide-react";
import { getCourses, LMSCourse } from "../lib/db";
import { PageContainer } from "./PageContainer";
import Hero from "./Hero";
import { getCMSConfig, CMSConfig, DEFAULT_CMS } from "./AdminCMS";
import { fetchAllCMSFromSupabase, subscribeToSupabaseCMSRealtime } from "../lib/supabaseCms";

function AnimatedNumber({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Extract numbers, keeping commas or decimals if any
    const numericString = value.replace(/[^0-9]/g, "");
    const num = parseInt(numericString) || 0;
    if (num === 0) {
      setDisplayValue(value);
      return;
    }

    // Capture suffix/prefix characters
    const suffix = value.replace(/[0-9,]/g, "");
    const hasCommas = value.includes(",");

    let start = 0;
    const duration = 1200; // ms
    const stepTime = 25; // ms
    const steps = duration / stepTime;
    const increment = num / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= num) {
        clearInterval(timer);
        setDisplayValue(value);
      } else {
        const currentInt = Math.floor(start);
        const formatted = hasCommas ? currentInt.toLocaleString() : currentInt.toString();
        setDisplayValue(`${formatted}${suffix}`);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

interface HomepageProps {
  onOpenJoin: (profile?: string) => void;
  onNavigate: (view: string) => void;
}

export default function Homepage({ onOpenJoin, onNavigate }: HomepageProps) {
  const [featuredCourses, setFeaturedCourses] = useState<LMSCourse[]>([]);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [facebookPosts, setFacebookPosts] = useState<any[]>([]);
  const [loadingFacebook, setLoadingFacebook] = useState(true);
  const [cms, setCms] = useState<CMSConfig | null>(null);
  const [isCmsLoading, setIsCmsLoading] = useState(true);
  const [cmsError, setCmsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCms = async () => {
      try {
        setIsCmsLoading(true);
        setCmsError(null);
        // 1. Fetch live shared CMS from Supabase
        const result = await fetchAllCMSFromSupabase();
        if (isMounted) {
          setCms(result.cmsConfig);
        }
      } catch (err: any) {
        console.warn("Failed fetching CMS from Supabase, loading fallback:", err);
        if (isMounted) {
          setCmsError("Could not reach live database. Viewing cached content.");
          setCms(getCMSConfig());
        }
      } finally {
        if (isMounted) {
          setIsCmsLoading(false);
        }
      }
    };

    loadCms();

    // 2. Setup Supabase Realtime Subscription
    // Visitors automatically see updates when an admin edits anything without refreshing!
    const unsubscribeRealtime = subscribeToSupabaseCMSRealtime((table, payload) => {
      console.log(`⚡ [SUPABASE REALTIME EVENT] ${table}:`, payload);
      loadCms();
    });

    const handleLocalUpdate = () => {
      loadCms();
    };

    window.addEventListener("rma_cms_updated", handleLocalUpdate);
    window.addEventListener("rma_supabase_cms_updated", handleLocalUpdate);

    return () => {
      isMounted = false;
      unsubscribeRealtime();
      window.removeEventListener("rma_cms_updated", handleLocalUpdate);
      window.removeEventListener("rma_supabase_cms_updated", handleLocalUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        setLoadingFacebook(true);
        const res = await fetch("/api/facebook/posts");
        const data = await res.json();
        if (data && data.status === "success") {
          setFacebookPosts(data.posts || []);
        }
      } catch (err) {
        console.warn("Could not fetch Facebook posts dynamically", err);
      } finally {
        setLoadingFacebook(false);
      }
    };
    fetchFacebookPosts();
  }, []);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const list = await getCourses();
        setFeaturedCourses(list.filter(c => c.status === "published").slice(0, 4));
      } catch (e) {
        console.warn("Could not load featured courses", e);
      }
    };
    loadFeatured();
  }, []);

  const handleCtaClick = (action: string) => {
    if (["corps_member", "student", "teen", "mentor"].includes(action)) {
      onOpenJoin(action);
    } else if (action === "courses") {
      onNavigate("courses");
    } else if (action === "programs-seminar") {
      onNavigate("programs-seminar");
    } else if (action === "initiatives-cii") {
      onNavigate("initiatives-cii");
    } else {
      const el = document.querySelector("#about-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans antialiased">
      
      <Hero onOpenJoin={onOpenJoin} onNavigate={onNavigate} />

      {/* 2. ABOUT SECTION (THINK • LIVE • LEAD) */}
      <section className="py-20 lg:py-24 bg-white dark:bg-[#070C0A] border-b border-slate-200/70 dark:border-slate-800/80 relative overflow-hidden" id="about-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
        <PageContainer>
          
          <div className="max-w-2xl text-left mb-12 sm:mb-16 space-y-2 border-l-4 border-brand-orange pl-4 sm:pl-5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
              Framework Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
              The Three Core Axes
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Our systematic methodology for personal reinvention, habit engineering, and continental leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Axis 1: Think Right */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-7 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between cursor-default transition-all shadow-sm hover:border-brand-orange/40 dark:hover:border-brand-orange/40 group relative overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-orange/30 group-hover:bg-brand-orange transition-colors" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 h-10 w-10 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">01 / COGNITIVE</span>
                </div>
                <h3 className="font-bold text-brand-blue dark:text-white text-base sm:text-lg uppercase tracking-tight font-display">
                  {cms?.aboutAxis1Title || "Think Right"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                  {cms?.aboutAxis1Desc || "Dismantling negative limiting patterns, retraining mindset confidence, and replacing old narratives with structured growth-oriented logic."}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/70">
                <span className="inline-block text-[10px] font-bold text-brand-orange dark:text-amber-400 font-mono uppercase">
                  {cms?.aboutAxis1Tag || "🧠 Mindset Re-engineering"}
                </span>
              </div>
            </motion.div>

            {/* Axis 2: Live Right */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-7 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between cursor-default transition-all shadow-sm hover:border-brand-orange/40 dark:hover:border-brand-orange/40 group relative overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-orange/30 group-hover:bg-brand-orange transition-colors" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 h-10 w-10 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-xl flex items-center justify-center">
                    <Compass size={18} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">02 / HABITS</span>
                </div>
                <h3 className="font-bold text-brand-blue dark:text-white text-base sm:text-lg uppercase tracking-tight font-display">
                  {cms?.aboutAxis2Title || "Live Right"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                  {cms?.aboutAxis2Desc || "Character development and system alignment. Creating daily goal-mapping trackers, personal SOP routines, and professional EQ habits."}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/70">
                <span className="inline-block text-[10px] font-bold text-brand-orange dark:text-amber-400 font-mono uppercase">
                  {cms?.aboutAxis2Tag || "🎯 Intentional Habits"}
                </span>
              </div>
            </motion.div>

            {/* Axis 3: Lead Right */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-7 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between cursor-default transition-all shadow-sm hover:border-brand-orange/40 dark:hover:border-brand-orange/40 group relative overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-orange/30 group-hover:bg-brand-orange transition-colors" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 h-10 w-10 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-xl flex items-center justify-center">
                    <Award size={18} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">03 / INFLUENCE</span>
                </div>
                <h3 className="font-bold text-brand-blue dark:text-white text-base sm:text-lg uppercase tracking-tight font-display">
                  {cms?.aboutAxis3Title || "Lead Right"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                  {cms?.aboutAxis3Desc || "Civic mobilization and remote excellence. Deploying upskilling capabilities to guide local commands, school book donation drives, and workplace agencies."}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/70">
                <span className="inline-block text-[10px] font-bold text-brand-orange dark:text-amber-400 font-mono uppercase">
                  {cms?.aboutAxis3Tag || "👑 Civic Influence"}
                </span>
              </div>
            </motion.div>
          </div>

        </PageContainer>
      </section>

      {/* 3. MONTHLY PROGRAMS (ONLY PROGRAM SECTION ON HOMEPAGE) */}
      <section className="py-20 lg:py-24 bg-slate-50 dark:bg-[#0c1210] border-b border-slate-200/70 dark:border-slate-800/80" id="program-preview-section">
        <PageContainer>
          
          <div className="max-w-2xl text-left mb-12 sm:mb-16 space-y-2 border-l-4 border-brand-orange pl-4 sm:pl-5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
              Vetted Academies
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
              Monthly Programs
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Accelerate your leadership maturity through open masterclasses and intensive cohort accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Program 1: Monthly Seminar */}
            <div className="p-8 sm:p-10 bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between text-left relative overflow-hidden group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[10px] font-bold uppercase font-mono tracking-wider">
                    Open Access
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">100% Free Sponsored</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-blue dark:text-white uppercase tracking-tight font-display">
                  {cms?.program1Title || "Monthly Leadership Seminar"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {cms?.program1Desc || "Deep personal leadership shift, character development, and emotional-intelligence (EQ) masterclasses for undergraduates, emerging leaders, and professionals."}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => onNavigate("programs-seminar")}
                  className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors self-start cursor-pointer font-mono inline-flex items-center gap-2"
                >
                  {cms?.program1BtnText || "Register For Seminar"} <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Program 2: Monthly Reinvention Program */}
            <div className="p-8 sm:p-10 bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-brand-blue/10 text-brand-blue dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider font-mono border border-brand-blue/15">
                    Accountability Cohort
                  </span>
                  <span className="text-[11px] font-mono text-brand-orange font-semibold">Intensive Track</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-brand-blue dark:text-white font-display">
                  {cms?.program2Title || "Monthly Reinvention Program"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {cms?.program2Desc || "Continuous habit audits, dashboard milestone trackers, and daily performance checks to escape procrastination loops under certified coordinators."}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 relative z-10">
                <a 
                  href="https://wa.link/fu76fd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2 font-mono shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {cms?.program2BtnWhatsappText || "Register with WhatsApp"}
                </a>
                <button 
                  onClick={() => onNavigate("programs-reinvention")}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200/80 text-brand-blue text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer border border-slate-200 flex items-center justify-center font-mono"
                >
                  {cms?.program2BtnDetailsText || "View Details Page"}
                </button>
              </div>
            </div>
          </div>

          {/* G3 Flagship Fellowship Spotlight Banner */}
          <div className="mt-8 p-6 sm:p-8 bg-white border-2 border-brand-orange/30 rounded-2xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 text-left group">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
              {/* Official Flyer Thumbnail */}
              <div
                onClick={() => onNavigate("initiatives-g3")}
                className="w-28 sm:w-32 aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0 cursor-pointer relative bg-slate-900 group/flyer hover:ring-2 hover:ring-brand-orange transition-all"
              >
                <img
                  src="/assets/aistudio/RMA_G3A_aa832557.png"
                  alt="Anticipate G3 Summit 2026/2027 Official Flyer"
                  className="w-full h-full object-cover transition-transform group-hover/flyer:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-1.5 inset-x-1.5 py-0.5 bg-black/75 backdrop-blur-xs text-[9px] font-bold text-center text-white rounded font-mono uppercase tracking-widest">
                  Summit Flyer
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange text-[10px] font-bold uppercase tracking-wider font-mono border border-brand-orange/20">
                    G3 SERIES 2026/2027 • THE RELEVANCE QUESTION
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    Every Saturday in Dec 2026 &amp; Jan 2, 2027 • God. Growth. Goals.
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-brand-blue font-display tracking-tight">
                  The Human Advantage: Who Will You Become in a Changing World?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Five progressive Saturday conversations exploring Identity, Skills &amp; Value Creation, Adaptability &amp; AI, Relationships &amp; Influence, and Intentional Living &amp; Execution—through the three interconnected dimensions of God, Growth, and Goals.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => onNavigate("initiatives-g3")}
                className="px-6 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer font-mono inline-flex items-center gap-2 shadow-sm"
              >
                Explore G3 Series 2026/2027 <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </PageContainer>
      </section>

      {/* NEW SECTION: FEATURED PREMIUM COURSES */}
      <section className="py-20 lg:py-24 bg-white dark:bg-[#070C0A] border-b border-slate-200/70 dark:border-slate-800/80" id="featured-courses-section">
        <PageContainer className="space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-brand-orange pl-4 sm:pl-5">
            <div className="space-y-2 text-left">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
                LMS Learning Platform
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
                Featured Premium Courses
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
                Acquire practical, verified competencies designed to bridge NYSC career paths into global placements, technology startups, and enterprise growth.
              </p>
            </div>
            
            <button
              onClick={() => onNavigate("courses")}
              className="px-5 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all self-start cursor-pointer flex items-center gap-1.5 leading-none shrink-0 font-mono"
            >
              Browse All Courses <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full">
            {featuredCourses.length === 0 ? (
              // High-fidelity fallback cards matching seed courses
              <>
                <div 
                  onClick={() => onNavigate("courses")}
                  className="group bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-left cursor-pointer hover:border-brand-orange/50 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[9px] font-bold uppercase tracking-wider font-mono">NYSC Success Training</span>
                    <h3 className="text-sm font-bold text-brand-blue dark:text-white uppercase tracking-tight line-clamp-2 leading-snug font-display group-hover:text-brand-orange transition-colors">NYSC Career Accelerator & Corporate Branding Blueprint</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-3">
                      Learn how to bridge the post-graduation talent gap. Build an executive resume, optimize LinkedIn globally, and master professional interview techniques.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-4 mt-auto">
                    <span className="text-xs font-mono font-bold text-brand-blue dark:text-white leading-none">₦15,000</span>
                    <span className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform font-mono">View Details <ArrowRight size={11} /></span>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigate("courses")}
                  className="group bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-left cursor-pointer hover:border-brand-orange/50 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[9px] font-bold uppercase tracking-wider font-mono">Personal Development</span>
                    <h3 className="text-sm font-bold text-brand-blue dark:text-white uppercase tracking-tight line-clamp-2 leading-snug font-display group-hover:text-brand-orange transition-colors">The Mindset Auditing & Self-Mastery Class</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-3">
                      Audit hidden cognitive models, escape structural procrastination loops, and deploy custom mental frameworks to drive extreme career performance.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-4 mt-auto">
                    <span className="text-xs font-mono font-bold text-brand-blue dark:text-white leading-none">₦10,000</span>
                    <span className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform font-mono">View Details <ArrowRight size={11} /></span>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigate("courses")}
                  className="group bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-left cursor-pointer hover:border-brand-orange/50 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[9px] font-bold uppercase tracking-wider font-mono">Digital Skills</span>
                    <h3 className="text-sm font-bold text-brand-blue dark:text-white uppercase tracking-tight line-clamp-2 leading-snug font-display group-hover:text-brand-orange transition-colors">UI/UX Product Design & Visual Identity Engineering</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-3">
                      Acquire high-touch UI designs and visual interface creation abilities using industry-leading guidelines and typography standards.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-4 mt-auto">
                    <span className="text-xs font-mono font-bold text-brand-blue dark:text-white leading-none">₦20,000</span>
                    <span className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform font-mono">View Details <ArrowRight size={11} /></span>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigate("courses")}
                  className="group bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-left cursor-pointer hover:border-brand-orange/50 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[9px] font-bold uppercase tracking-wider font-mono">Corporate Ethics</span>
                    <h3 className="text-sm font-bold text-brand-blue dark:text-white uppercase tracking-tight line-clamp-2 leading-snug font-display group-hover:text-brand-orange transition-colors">Executive EQ, Ethics & Corporate Leadership Framework</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-3">
                      Master advanced emotional intelligence, corporate communication etiquette, conflict management patterns, and enterprise-level growth alignment protocols.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-4 mt-auto">
                    <span className="text-xs font-mono font-bold text-brand-blue dark:text-white leading-none">₦12,500</span>
                    <span className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform font-mono">View Details <ArrowRight size={11} /></span>
                  </div>
                </div>
              </>
            ) : (
              // Render fetched courses dynamically
              featuredCourses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  onClick={() => onNavigate("courses")}
                  className="group bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-left cursor-pointer hover:border-brand-orange/50 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[9px] font-bold uppercase tracking-wider font-mono">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-bold text-brand-blue dark:text-white group-hover:text-brand-orange uppercase tracking-tight line-clamp-2 leading-snug transition-colors font-display">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-4 mt-auto">
                    <span className="text-xs font-mono font-bold text-brand-blue dark:text-white leading-none">
                      {course.price === 0 ? "FREE" : `₦${course.price.toLocaleString()}`}
                    </span>
                    <span className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform font-mono">
                      View Details <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </PageContainer>
      </section>

      {/* 4. IMPACT STATISTICS */}
      <section className="py-20 lg:py-24 bg-slate-50 dark:bg-[#070C0A] border-b border-slate-200/70 dark:border-slate-800/80" id="stats-section">
        <PageContainer>
          
          <div className="max-w-2xl text-left mb-12 sm:mb-16 space-y-2 border-l-4 border-brand-orange pl-4 sm:pl-5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
              Continental Reach
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
              Measured Continental Footprint
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Real community outcomes delivered through systematic training, youth development camps, and verified grassroots mentorship.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-200/80 lg:dark:divide-slate-800 w-full text-left lg:text-center">
              
              <div className="flex flex-col lg:items-center justify-center space-y-2 lg:px-6">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-orange font-mono tracking-tight leading-none">
                  <AnimatedNumber value="10,000" />+
                </span>
                <p className="text-xs sm:text-sm font-bold text-brand-blue dark:text-white uppercase tracking-wider font-display">
                  Youth Reached
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">Across all cohorts</p>
              </div>

              <div className="flex flex-col lg:items-center justify-center space-y-2 lg:px-6">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-blue dark:text-slate-100 font-mono tracking-tight leading-none">
                  <AnimatedNumber value="150" />+
                </span>
                <p className="text-xs sm:text-sm font-bold text-brand-blue dark:text-white uppercase tracking-wider font-display">
                  Events Hosted
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">Seminars & Masterclasses</p>
              </div>

              <div className="flex flex-col lg:items-center justify-center space-y-2 lg:px-6">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-orange font-mono tracking-tight leading-none">
                  <AnimatedNumber value="12" />+
                </span>
                <p className="text-xs sm:text-sm font-bold text-brand-blue dark:text-white uppercase tracking-wider font-display">
                  Communities Impacted
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">Grassroots deployments</p>
              </div>

              <div className="flex flex-col lg:items-center justify-center space-y-2 lg:px-6">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-blue dark:text-slate-100 font-mono tracking-tight leading-none">
                  <AnimatedNumber value="5" />+
                </span>
                <p className="text-xs sm:text-sm font-bold text-brand-blue dark:text-white uppercase tracking-wider font-display">
                  Countries Represented
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">Pan-African membership</p>
              </div>

            </div>
          </div>

        </PageContainer>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 lg:py-24 bg-white dark:bg-[#0c1210] border-b border-slate-200/70 dark:border-slate-800/80" id="testimonials-section">
        <PageContainer>
          
          <div className="max-w-2xl text-left mb-12 sm:mb-16 space-y-2 border-l-4 border-brand-orange pl-4 sm:pl-5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
              Transformation Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
              Community Stories
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Direct firsthand reflections from active corps members, student leaders, and academy alumni.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
            {(cms?.testimonials && cms.testimonials.length > 0
              ? cms.testimonials.filter(t => t.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
              : [
                  {
                    name: "Chidem Ebuka",
                    role: "Software Engineer Intern",
                    quote: "The Corper Impact Initiative (CII) redefined my career mapping during NYSC. I learned remote job prospecting, tailored my LinkedIn, and landed a role right after my Pop out!"
                  },
                  {
                    name: "Adebayo Adesina",
                    role: "Final Year Student (Unilag)",
                    quote: "YAP Conference was an absolute mental shift. Hearing from seasoned speakers who look like me made me realize background limitations don't define excellence."
                  },
                  {
                    name: "Tosin Alabi",
                    role: "Secondary School Graduate",
                    quote: "Under the Right-Minded Teens mentorship, I discovered essential growth mindset rules. My Waec study approach changed and I cleared WAEC in one sitting."
                  }
                ]
            ).map((test, index) => (
              <div 
                key={test.id || index} 
                className="p-7 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm text-left relative overflow-hidden group hover:border-brand-orange/40 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl text-brand-orange/30 font-serif leading-none select-none">“</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                      Verified Fellow
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                    {test.quote}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 md:mt-8 space-y-1 text-left">
                  <h4 className="font-bold text-brand-blue dark:text-white text-xs sm:text-sm uppercase font-display tracking-tight">
                    {test.name}
                  </h4>
                  <p className="text-brand-orange dark:text-amber-400 text-[10px] font-semibold tracking-wider font-mono uppercase">
                    {test.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </PageContainer>
      </section>

      {/* 6. RESOURCES PREVIEW */}
      <section className="py-20 lg:py-24 bg-slate-50 dark:bg-[#070C0A] border-b border-slate-200/70 dark:border-slate-800/80" id="resources-preview-section">
        <PageContainer>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 mb-12 sm:mb-16 border-b border-slate-200/70 dark:border-slate-800/80 pb-6">
            <div className="max-w-md text-left space-y-1 border-l-4 border-brand-orange pl-4 sm:pl-5">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
                Vetted Knowledge
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
                Materials Preview
              </h2>
            </div>
            <button 
              onClick={() => onNavigate("resources-articles")}
              className="px-5 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer font-mono self-start sm:self-auto transition-colors"
            >
              View All Resources
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
            {/* Item 1: Article */}
            <div className="p-7 sm:p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left group hover:border-brand-orange/40 transition-colors shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 font-mono text-[9px] font-bold">
                  <BookOpen size={13} className="text-brand-orange" />
                  <span className="tracking-wider">ARTICLE &bull; BLOG</span>
                </div>
                <h3 className="font-bold text-brand-blue dark:text-white text-sm sm:text-base uppercase tracking-tight leading-snug font-display group-hover:text-brand-orange transition-colors">
                  Mindset Re-Engineering: The Catalyst for African Youth
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] font-normal leading-relaxed">
                  How escaping default procrastination loops and setting daily audit metrics can drive physical behavioral change.
                </p>
              </div>
              <button 
                onClick={() => onNavigate("resources-articles")} 
                className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-orange dark:text-amber-400 hover:text-brand-orange/85 uppercase self-start cursor-pointer transition-colors"
              >
                Read Article &rarr;
              </button>
            </div>

            {/* Item 2: Video */}
            <div className="p-7 sm:p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left group hover:border-brand-orange/40 transition-colors shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 font-mono text-[9px] font-bold">
                  <Tv size={13} className="text-brand-orange" />
                  <span className="tracking-wider">VIDEO PRESENTATION</span>
                </div>
                <h3 className="font-bold text-brand-blue dark:text-white text-sm sm:text-base uppercase tracking-tight leading-snug font-display group-hover:text-brand-orange transition-colors">
                  Lagos YAP Conference Summit Mainstage Highlight
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] font-normal leading-relaxed">
                  Enjoy brief session recordings capturing professional executive EQ and spiritual purpose alignment workshops.
                </p>
              </div>
              <button 
                onClick={() => onNavigate("resources-videos")} 
                className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-orange dark:text-amber-400 hover:text-brand-orange/85 uppercase self-start cursor-pointer transition-colors"
              >
                Watch Video &rarr;
              </button>
            </div>

            {/* Item 3: Podcast/Resource */}
            <div className="p-7 sm:p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left group hover:border-brand-orange/40 transition-colors shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 font-mono text-[9px] font-bold">
                  <Mic size={13} className="text-brand-orange" />
                  <span className="tracking-wider">PODCAST EPISODE</span>
                </div>
                <h3 className="font-bold text-brand-blue dark:text-white text-sm sm:text-base uppercase tracking-tight leading-snug font-display group-hover:text-brand-orange transition-colors">
                  Avoiding Post-Graduation Anxieties Over NYSC
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] font-normal leading-relaxed">
                  Certified mindset coach Gracious-Esther details how to align your service year with career benchmarks.
                </p>
              </div>
              <button 
                onClick={() => onNavigate("resources-podcasts")} 
                className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-orange dark:text-amber-400 hover:text-brand-orange/85 uppercase self-start cursor-pointer transition-colors"
              >
                Listen Episode &rarr;
              </button>
            </div>
          </div>

        </PageContainer>
      </section>

      {/* NEW SECTION: AUTOMATIC LIVE FACEBOOK FEED */}
      <section className="py-20 lg:py-24 bg-white dark:bg-[#070C0A] border-b border-slate-200/70 dark:border-slate-800/80" id="homepage-facebook-section">
        <PageContainer>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 mb-12 sm:mb-16 border-b border-slate-200/70 dark:border-slate-800/80 pb-6">
            <div className="max-w-md text-left space-y-1 border-l-4 border-brand-orange pl-4 sm:pl-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
                  Live Facebook Updates
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight flex items-center gap-2 font-display">
                <Facebook size={26} className="text-[#1877F2] shrink-0 fill-[#1877F2]" /> Our Social Stream
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Synced automatically from our official Facebook Page. Stay up to date with our community activities.
              </p>
            </div>
            <a
              href="https://www.facebook.com/RightMAHub/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer font-mono flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 leading-none transition-colors"
            >
              Visit Page <ExternalLink size={13} />
            </a>
          </div>

          {loadingFacebook ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-7 sm:p-8 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  </div>
                  <div className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : facebookPosts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
              {/* Fallback Post 1 */}
              <div className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-7 sm:p-8 flex flex-col justify-between text-left overflow-hidden hover:border-brand-orange/40 transition-colors shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xs font-black font-mono">
                      RMA
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-blue dark:text-white text-xs uppercase tracking-tight leading-none font-display">
                        Right Minds Africa
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        Just now • Featured Update
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                    🎉 Big news! We are thrilled to celebrate the official graduation of our recent <strong>Summer Tech & Remote Skill Bootcamp</strong> cohort! Over 120 passionate youth completed training in UI/UX Product Design, Copywriting, and global freelancing mechanics. Ready to dominate the global remote workspace! 🚀 #RightMindsAfrica #YouthPower #Lagos
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-950">
                    <img
                      src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop"
                      alt="Summer Tech Bootcamp Graduation"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 font-mono text-[10px] font-semibold">
                  <div className="flex items-center gap-4">
                    <button type="button" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer">
                      <ThumbsUp size={13} /> <span>142 Likes</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer">
                      <MessageCircle size={13} /> <span>28 Comments</span>
                    </button>
                  </div>
                  <a
                    href="https://www.facebook.com/RightMAHub/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-orange dark:text-amber-400 hover:underline flex items-center gap-1 uppercase text-[9px] font-bold tracking-wider"
                  >
                    View Post <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Fallback Post 2 */}
              <div className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-7 sm:p-8 flex flex-col justify-between text-left overflow-hidden hover:border-brand-orange/40 transition-colors shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xs font-black font-mono">
                      RMA
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-blue dark:text-white text-xs uppercase tracking-tight leading-none font-display">
                        Right Minds Africa
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        Yesterday
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                    💡 <i>"The greatest tragedy is not that we aim too high and fail, but that we aim too low and succeed."</i> Highlights from the launch of our <strong>Corper Impact Initiative (CII)</strong>. Empowering active NYSC members to rethink leadership, build deep ethical character, and initiate community transformation projects during their service year!
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-950">
                    <img
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop"
                      alt="Corper Impact Initiative Launch"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 font-mono text-[10px] font-semibold">
                  <div className="flex items-center gap-4">
                    <button type="button" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer">
                      <ThumbsUp size={13} /> <span>98 Likes</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer">
                      <MessageCircle size={13} /> <span>15 Comments</span>
                    </button>
                  </div>
                  <a
                    href="https://www.facebook.com/RightMAHub/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-orange dark:text-amber-400 hover:underline flex items-center gap-1 uppercase text-[9px] font-bold tracking-wider"
                  >
                    View Post <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Fallback Post 3 */}
              <div className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-7 sm:p-8 flex flex-col justify-between text-left overflow-hidden hover:border-brand-orange/40 transition-colors shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xs font-black font-mono">
                      RMA
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-blue dark:text-white text-xs uppercase tracking-tight leading-none font-display">
                        Right Minds Africa
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        3 days ago
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                    📚 Our weekly Right Minds Mentorship Circles continue to inspire. We dove deep into the philosophy of alignment—specifically how our daily habits either feed our highest vision or validate our worst procrastination loops. Big thanks to all coordinators and fellows who showed up with 100% vulnerability! 🙌
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-950">
                    <img
                      src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop"
                      alt="Weekly Mentorship Circle"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 font-mono text-[10px] font-semibold">
                  <div className="flex items-center gap-4">
                    <button type="button" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer">
                      <ThumbsUp size={13} /> <span>112 Likes</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer">
                      <MessageCircle size={13} /> <span>21 Comments</span>
                    </button>
                  </div>
                  <a
                    href="https://www.facebook.com/RightMAHub/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-orange dark:text-amber-400 hover:underline flex items-center gap-1 uppercase text-[9px] font-bold tracking-wider"
                  >
                    View Post <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
              {facebookPosts.map((post) => (
                <div 
                  key={post.id}
                  className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-7 sm:p-8 flex flex-col justify-between text-left overflow-hidden hover:border-brand-orange/40 transition-colors shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Author Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xs font-black font-mono">
                        RMA
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-blue dark:text-white text-xs uppercase tracking-tight leading-none font-display">
                          Right Minds Africa
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 font-mono">
                          {new Date(post.createdTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                      {post.message}
                    </p>

                    {/* Image Attachment */}
                    {post.fullPicture && (
                      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-950">
                        <img
                          src={post.fullPicture}
                          alt="Facebook update attachment"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Social Interactivity Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 font-mono text-[10px] font-semibold">
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer"
                      >
                        <ThumbsUp size={13} /> <span>Like</span>
                      </button>
                      <button 
                        type="button"
                        className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer"
                      >
                        <MessageCircle size={13} /> <span>Comment</span>
                      </button>
                    </div>
                    <a
                      href={post.permalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange dark:text-amber-400 hover:underline flex items-center gap-1 uppercase text-[9px] font-bold tracking-wider"
                    >
                      View Post <ExternalLink size={10} />
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}

        </PageContainer>
      </section>

      {/* NEW FAQ ACCORDION SECTION */}
      <section className="py-20 lg:py-24 bg-slate-50 dark:bg-[#0c1210] border-b border-slate-200/70 dark:border-slate-800/80" id="homepage-faq-section">
        <PageContainer>
          <div className="w-full max-w-5xl mx-auto">
          
          <div className="max-w-2xl text-left mb-12 sm:mb-16 space-y-2 border-l-4 border-brand-orange pl-4 sm:pl-5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-brand-orange font-mono uppercase">
              Answers To Common Queries
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-blue dark:text-white uppercase tracking-tight font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Explore solutions regarding our community academies, premium accountability cohorts, registrations, or volunteer tracks.
            </p>
          </div>

          <div className="space-y-4">
            {(cms?.faqs && cms.faqs.length > 0
              ? cms.faqs.filter(f => f.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).map(f => ({ id: f.id, q: f.question, a: f.answer }))
              : [
                  {
                    id: "faq-1",
                    q: "Is Right Minds Africa Hub a religious or political organization?",
                    a: "We are an independent, non-political, vision-driven educational academy. While we focus heavily on purposeful living, moral character development, and general spiritual soundness as fundamentals of leadership, our programs are open to all passionate young Africans searching for a structured growth pathway."
                  },
                  {
                    id: "faq-2",
                    q: "How do I register or join the CII (Corper Impact Initiative)?",
                    a: "If you are an active corps member (or about to deploy), you can click on any 'Get Started' button, select 'NYSC Corps Member' or 'Recent Graduate', and complete your registration profile. Approved profiles are automatically boarded into regional cohorts under state leaders."
                  },
                  {
                    id: "faq-3",
                    q: "Do you charge fees for your programs or mentorship hubs?",
                    a: "Our core Monthly Leadership Seminars, standard mentoring boards, and Right-Minded Teens circles are 100% free of charge, sponsored by volunteer mentors and patrons. Conversely, high-touch intensive programs (including the Monthly Reinvention Program and regional Summer Bootcamps for Teenagers) involve structured enrollment fees to support personalized notebooks, goal-execution dashboards, and executive coaching slots."
                  },
                  {
                    id: "faq-4",
                    q: "Can I join as a Mentor or Volunteer partner?",
                    a: "Absolutely! We welcome young corporate professionals, certified teachers, and post-NYSC graduates who want to give back. Click on 'Contact Us' or access the Careers and Volunteer Application portals in the footer to register your profile with our management board."
                  }
                ]
            ).map((item) => {
              const isOpen = activeFaq === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900/60 ${isOpen ? 'border-brand-orange/40 shadow-xs' : 'border-slate-200/80 dark:border-slate-800 shadow-none'}`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : item.id)}
                    className="w-full px-6 sm:px-8 py-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white font-sans cursor-pointer focus:outline-none select-none transition-colors hover:text-brand-orange dark:hover:text-brand-gold"
                  >
                    <span className="text-xs sm:text-sm uppercase tracking-tight leading-normal text-brand-blue dark:text-slate-100 font-display">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-slate-400 dark:text-slate-500"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 sm:px-8 pb-6 pt-2 text-slate-600 dark:text-slate-300 font-sans font-normal text-sm sm:text-base leading-relaxed border-t border-slate-100 dark:border-slate-800 select-text bg-slate-50/70 dark:bg-[#070C0A]/40">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          </div>
        </PageContainer>
      </section>

      {/* 7. FINAL CTA SECTION */}
      <section className="py-20 lg:py-24 bg-white border-t border-slate-200/80 text-slate-900 relative overflow-hidden text-center" id="final-cta-section">
        <PageContainer className="relative z-10">
          <div className="max-w-4xl mx-auto p-8 sm:p-14 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-6">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest text-brand-orange uppercase font-mono font-bold bg-brand-orange/10 border border-brand-orange/20 px-3.5 py-1.5 rounded-md">
              <Sparkles size={11} /> {cms?.finalCtaBadge || "Generational Mandate"}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight font-display text-brand-blue">
              {cms?.finalCtaHeading || "Join Africa’s Next Generation of Leaders"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl mx-auto">
              {cms?.finalCtaDesc || "Become part of a highly coordinated peer command system. Establish discipline, configure professional standards, and elevate your calling."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onOpenJoin("corps_member")}
                className="px-7 py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer font-mono shadow-sm"
              >
                {cms?.finalCtaBtn1Text || "Get Started"}
              </button>
              <button
                onClick={() => onNavigate("contact")}
                className="px-7 py-3.5 bg-white hover:bg-slate-100 text-brand-blue border border-slate-200 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer font-mono shadow-2xs"
              >
                {cms?.finalCtaBtn2Text || "Contact Us"}
              </button>
            </div>
          </div>
        </PageContainer>
      </section>

    </div>
  );
}
