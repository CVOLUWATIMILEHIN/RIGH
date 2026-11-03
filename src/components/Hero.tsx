/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Calendar, Clock, MapPin, Users, Sparkles, ChevronRight, ChevronLeft, Pause, Play, Video, Compass, Award } from "lucide-react";
import { getCMSConfig, PRELOADED_HERO_IMAGES, normalizeHeroSlides, RMA_INTRO_SLIDE } from "./AdminCMS";
import { fetchAllCMSFromSupabase, subscribeToSupabaseCMSRealtime } from "../lib/supabaseCms";

interface HeroProps {
  onOpenJoin: (profile?: string) => void;
  onNavigate?: (view: string) => void;
}

function AnimatedNumber({ value }: { value: string }) {
  const numericVal = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9,]/g, "");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const end = numericVal;
    if (end === 0) return;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = Math.ceil(end / steps);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [numericVal]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const getSlideImageSrc = (imgUrl: string) => {
  if (PRELOADED_HERO_IMAGES[imgUrl]) {
    return PRELOADED_HERO_IMAGES[imgUrl];
  }
  return imgUrl;
};

export default function Hero({ onOpenJoin, onNavigate }: HeroProps) {
  const [cms, setCms] = useState(getCMSConfig());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    // 1. Initial live load from Supabase
    fetchAllCMSFromSupabase().then((data) => {
      if (data && data.cmsConfig) {
        setCms({
          ...data.cmsConfig,
          heroSlides: normalizeHeroSlides(data.cmsConfig.heroSlides)
        });
      }
    }).catch(() => {
      setCms(getCMSConfig());
    });

    // 2. Realtime subscription for instant updates across devices
    const unsubscribeRealtime = subscribeToSupabaseCMSRealtime((table, payload) => {
      if (table === "pages") {
        fetchAllCMSFromSupabase().then((data) => {
          if (data && data.cmsConfig) {
            setCms({
              ...data.cmsConfig,
              heroSlides: normalizeHeroSlides(data.cmsConfig.heroSlides)
            });
          }
        });
      }
    });

    const handleUpdate = () => {
      setCms(getCMSConfig());
    };

    window.addEventListener("rma_cms_updated", handleUpdate);
    window.addEventListener("rma_supabase_cms_updated", handleUpdate);
    return () => {
      unsubscribeRealtime();
      window.removeEventListener("rma_cms_updated", handleUpdate);
      window.removeEventListener("rma_supabase_cms_updated", handleUpdate);
    };
  }, []);

  // Filter slides that are active/enabled based on dates
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const normalizedSlides = normalizeHeroSlides(cms.heroSlides);

  const activeSlides = normalizedSlides.filter(slide => {
    if (!slide.enabled) return false;
    if (slide.scheduleStart && todayStr < slide.scheduleStart) return false;
    if (slide.scheduleEnd && todayStr > slide.scheduleEnd) return false;
    return true;
  });

  const slidesToRender = activeSlides.length > 0 ? activeSlides : normalizedSlides;
  
  // Guard currentSlide state when active slides length changes
  useEffect(() => {
    if (currentSlide >= slidesToRender.length) {
      setCurrentSlide(0);
    }
  }, [slidesToRender.length, currentSlide]);

  // Safeguard index boundaries
  const slideIndex = currentSlide >= slidesToRender.length ? 0 : currentSlide;
  const slide = slidesToRender[slideIndex] || RMA_INTRO_SLIDE;
  const isIntroSlide =
    slideIndex === 0 ||
    slide.id === "slide-rma-intro" ||
    (slide.badge && slide.badge.toUpperCase().includes("WELCOME TO RIGHT-MINDS AFRICA"));

  // Dynamic automatic slideshow transition effect
  useEffect(() => {
    if (!isPlaying || slidesToRender.length <= 1) return;
    const duration = slide.duration || cms.heroDisplayDuration || 6;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
    }, duration * 1000);
    
    return () => clearInterval(timer);
  }, [slidesToRender.length, isPlaying, slideIndex, slide.duration, cms.heroDisplayDuration]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesToRender.length) % slidesToRender.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
  };

  const handleActionClick = (action: string) => {
    if (!action) return;
    if (action === "volunteer" || action === "volunteer-application") {
      if (onNavigate) {
        onNavigate("volunteer-application");
      } else {
        onOpenJoin("volunteer");
      }
    } else if (["corps_member", "student", "teen", "young-leaders", "mentor"].includes(action)) {
      onOpenJoin(action);
    } else if (action === "courses" || action === "programs-seminar" || action === "about" || action === "gallery" || action === "initiatives-cii" || action === "initiatives-g3" || action === "programs-reinvention") {
      if (onNavigate) {
        onNavigate(action);
      } else {
        const idMap: Record<string, string> = {
          "initiatives-cii": "#cii-section",
          "initiatives-g3": "#program-preview-section",
          "programs-seminar": "#programs",
          "about": "#about-section"
        };
        const el = document.querySelector(idMap[action] || "#about-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const el = document.querySelector(`#${action}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        onOpenJoin("corps_member");
      }
    }
  };

  const handleCardCtaClick = () => {
    const link = cms.heroEventActionLink || "cii";
    handleActionClick(link);
  };

  // 4 Core High-Impact Stats
  const stats = [
    { label: "Youth Reached", value: cms.heroStat1Number || "5,000+" },
    { label: "Corps Members Trained", value: cms.heroStat2Number || "500+" },
    { label: "Expert Mentors", value: cms.heroStat3Number || "150+" },
    { label: "Programs Conducted", value: cms.heroStat4Number || "50+" }
  ];

  return (
    <div className="w-full flex flex-col bg-white dark:bg-[#070C0A]">
      {/* FULL SCREEN HERO SECTION WITH ROTATING PHOTOGRAPHS */}
      <section 
        className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#0A1E33] text-white pt-28 pb-10" 
        id="hero-section"
      >
        {/* Full screen background image slideshow with smooth cross-fade & Ken Burns effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 5.5, ease: "linear" }
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={getSlideImageSrc(slide.imageUrl)}
                alt={slide.caption}
                className="w-full h-full object-cover object-center md:object-[75%_center] filter brightness-95"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Smooth left-to-right executive Navy Blue gradient overlay for high text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1E33]/95 via-[#0F2942]/75 to-transparent z-10 pointer-events-none" />
          
          {/* Dynamic brightness overlay corresponding to each specific image */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none transition-all duration-700 bg-[#0A1E33]" 
            style={{ opacity: (slide.overlayOpacity ?? 35) / 100 }}
          />
          
          {/* Soft bottom vignette to ground layout elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E33]/95 via-transparent to-transparent z-10 pointer-events-none" />
        </div>

        {/* Floating Left & Right manual navigation arrows */}
        {slidesToRender.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-4 sm:left-6 lg:left-8 z-20 flex items-center pointer-events-none">
              <button
                onClick={handlePrev}
                className="w-11 h-11 rounded-full border border-white/10 bg-black/25 hover:bg-black/50 hover:border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs hover:scale-105 active:scale-95 group pointer-events-auto shadow-md"
                title="Previous Slide"
              >
                <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-4 sm:right-6 lg:right-8 z-20 flex items-center pointer-events-none">
              <button
                onClick={handleNext}
                className="w-11 h-11 rounded-full border border-white/10 bg-black/25 hover:bg-black/50 hover:border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs hover:scale-105 active:scale-95 group pointer-events-auto shadow-md"
                title="Next Slide"
              >
                <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </>
        )}

        {/* Clean, spacious main text content & Grid layout with Left-Center 8-10% padding */}
        <div className="w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-14 xl:pl-[8%] xl:pr-16 2xl:pl-[10%] 2xl:pr-[72px] max-w-full lg:max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1880px] flex-1 flex flex-col justify-between relative z-15">
          
          {/* Inner Centered Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center my-auto py-8 sm:py-12 w-full">
            
            {/* Left Column (Content slideshow synchronized) */}
            <div className={`text-left ${(slide.showEventCard || isIntroSlide) ? "lg:col-span-7" : "lg:col-span-12"}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col max-w-[680px] w-full"
                >
                  {/* Eyebrow */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold tracking-widest text-brand-orange uppercase font-mono">
                      {slide.badge || "WELCOME TO RIGHT-MINDS AFRICA • THINK RIGHT • LIVE RIGHT • LEAD RIGHT"}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[62px] font-extrabold tracking-tight leading-[1.08] text-white font-display mt-4">
                    {slide.headline || "Shaping a Generation to Think Right, Live Right & Lead Right"}
                  </h1>

                  {/* Supporting description */}
                  <p className="text-slate-200 text-base sm:text-lg xl:text-xl leading-relaxed font-normal max-w-[620px] opacity-95 mt-5">
                    {slide.description || "Right-Minds Africa (RMA) is a pan-African leadership, mindset re-engineering, and personal mastery movement dedicated to liberating young Africans from limiting narratives."}
                  </p>

                  {/* On the 1st Slider (About Right-Minds Africa), show the 3 Core Identity Pillars before What We Do */}
                  {isIntroSlide && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-6 max-w-[620px]">
                      <div className="bg-white/8 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-md">
                        <div className="flex items-center gap-1.5 text-brand-orange font-mono text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles size={12} /> 01. Think Right
                        </div>
                        <p className="text-slate-200 text-xs mt-1 leading-snug">
                          Mindset re-engineering & liberating young minds from limiting beliefs.
                        </p>
                      </div>
                      <div className="bg-white/8 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-md">
                        <div className="flex items-center gap-1.5 text-brand-orange font-mono text-[10px] font-bold uppercase tracking-wider">
                          <Compass size={12} /> 02. Live Right
                        </div>
                        <p className="text-slate-200 text-xs mt-1 leading-snug">
                          Character mastery, intentional daily habits & personal accountability.
                        </p>
                      </div>
                      <div className="bg-white/8 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-md">
                        <div className="flex items-center gap-1.5 text-brand-orange font-mono text-[10px] font-bold uppercase tracking-wider">
                          <Award size={12} /> 03. Lead Right
                        </div>
                        <p className="text-slate-200 text-xs mt-1 leading-snug">
                          Purpose-driven influence across campuses, NYSC & corporate Africa.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Synchronized Action buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8">
                    <motion.button
                      onClick={() => handleActionClick(slide.primaryButtonAction || "about")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 sm:px-7 py-3.5 bg-brand-orange hover:bg-brand-orange/95 hover:shadow-lg hover:shadow-brand-orange/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wider shrink-0"
                    >
                      {slide.primaryButtonText || "Discover Who We Are"} <ArrowRight size={15} />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleActionClick(slide.secondaryButtonAction || "corps_member")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 sm:px-7 py-3.5 bg-white/10 hover:bg-white/15 border border-white/25 hover:border-white/40 text-white font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md shrink-0"
                    >
                      {slide.secondaryButtonText || "Join Our Community"}
                    </motion.button>

                    <motion.button
                      onClick={() => setIsVideoOpen(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 sm:px-6 py-3.5 bg-transparent hover:bg-white/10 border border-white/20 text-slate-100 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wider shrink-0"
                    >
                      <Play size={14} className="fill-brand-orange text-brand-orange" /> Watch Video
                    </motion.button>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: On Slide 1 (About RMA), show the Identity & Mandate Card; on subsequent slides, show the Event Card if enabled */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end w-full">
              <AnimatePresence mode="wait">
                {isIntroSlide ? (
                  <motion.div
                    key="rma-intro-mandate-card"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[340px] sm:max-w-[370px]"
                  >
                    <div className="w-full bg-slate-900/55 border border-white/15 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left">
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-orange/15 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-orange text-[10px] font-black uppercase tracking-widest text-white font-mono">
                          <Sparkles size={10} /> Who We Are
                        </span>
                        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                          Slide 01 / Identity
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-white mt-3.5 leading-snug font-display">
                        About Right-Minds Africa
                      </h3>

                      <p className="text-slate-200 text-xs sm:text-[13px] mt-2 leading-relaxed">
                        {cms.aboutMission || "We exist to raise a generation of highly competent, character-driven young Africans who take sovereignty over their minds, careers, finances, and callings."}
                      </p>

                      <div className="border-t border-white/10 my-3.5" />

                      <div className="space-y-2 text-xs text-slate-200">
                        <div className="flex items-start gap-2">
                          <Users size={14} className="text-brand-orange shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-white">Who We Empower:</strong> Teenagers, Undergraduates, NYSC Corps Members & Young Professionals.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Compass size={14} className="text-brand-orange shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-white">Our Vision:</strong> A prosperous, values-centered Africa led by transformed minds across regional chapters.
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          onClick={handleNext}
                          className="w-full py-2.5 px-4 bg-white/10 hover:bg-brand-orange text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/15 hover:border-brand-orange"
                        >
                          Next: See What We Do <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : slide.showEventCard ? (
                  <motion.div
                    key={slideIndex}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[215px] sm:max-w-[230px]"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full bg-slate-900/40 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-white/20 text-left"
                    >
                      {/* Subtle background glow */}
                      <div className="absolute -top-12 -right-12 w-20 h-20 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />

                      {/* Small badge */}
                      <div className="flex items-center gap-1.5 self-start">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-orange text-[8px] font-black uppercase tracking-widest text-white font-mono shadow-sm">
                          <Sparkles size={8} /> {slide.eventCardTitle || "Upcoming Program"}
                        </span>
                      </div>

                      {/* Program Name */}
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-white mt-2 leading-snug font-display">
                        {slide.eventCardName || "Monthly Reinvention Program"}
                      </h3>

                      {/* One short sentence */}
                      <p className="text-slate-300 text-[10px] mt-0.5 leading-relaxed font-normal">
                        Applications close soon. Secure your seat today.
                      </p>

                      {/* Minimal Divider line */}
                      <div className="border-t border-white/5 my-2" />

                      {/* Simplified Event details */}
                      <div className="space-y-1 text-[10px] text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-brand-orange shrink-0" />
                          <span className="text-slate-250 truncate">{slide.eventCardDate || "July 5–August 9, 2026"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-brand-orange shrink-0" />
                          <span className="text-slate-250 truncate">{slide.eventCardLocation || "Virtual (Interactive Zoom)"}</span>
                        </div>
                      </div>

                      {/* Registration button */}
                      <div className="mt-3">
                        <motion.button
                          onClick={handleCardCtaClick}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-lg text-[9px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/10"
                        >
                          Register Now
                        </motion.button>
                      </div>

                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom stats block pinned perfectly to the bottom of the viewport with a divider */}
          <div className="w-full mt-auto relative z-20 pb-2">
            {/* Thin, elegant horizontal divider line exactly like the reference image */}
            <div className="w-full h-[1px] bg-white/10 mb-6 sm:mb-8" />

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              {/* Integrated Statistics Row exactly matching the reference layout: raw text, left-aligned, no cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-left flex-1">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-orange font-mono tracking-tight leading-none">
                      <AnimatedNumber value={stat.value} />
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Slider dots and play/pause controls */}
              {slidesToRender.length > 1 && (
                <div className="flex items-center gap-3.5 bg-slate-900/60 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md self-start lg:self-auto shrink-0 font-mono text-xs shadow-xl">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-brand-orange transition-colors cursor-pointer flex items-center justify-center w-4 h-4"
                    title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                  >
                    {isPlaying ? <Pause size={12} className="fill-white" /> : <Play size={12} className="fill-white" />}
                  </button>
                  <div className="w-[1px] h-3.5 bg-white/25" />
                  <div className="flex items-center gap-2">
                    {slidesToRender.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentSlide === idx 
                            ? "w-5 bg-brand-orange" 
                            : "w-2 bg-white/35 hover:bg-white/60"
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Full-screen video modal for a professional immersive experience */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 md:p-10"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white hover:text-brand-orange transition-all cursor-pointer border border-white/10"
                title="Close Video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* YouTube Embed of an inspiring leadership academy clip */}
              <iframe 
                src="https://www.youtube.com/embed/g09a9_I3Nro?autoplay=1&rel=0" 
                title="Right-Minds Africa Leadership Academy" 
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
