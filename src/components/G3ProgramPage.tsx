/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { PageContainer } from "./PageContainer";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  Target,
  TrendingUp,
  CheckCircle2,
  Award,
  Users,
  BookOpen,
  Compass,
  MapPin,
  Briefcase,
  ExternalLink,
  Loader2
} from "lucide-react";

const G3_GOOGLE_FORM_DIRECT_URL = "https://forms.gle/7h9muLz6rLnB2spV7";
const G3_GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdE1ggFc9mNCRqHb9odQnIdJLaLNs_ZoomB66JOBWFH5yOSSg/viewform?embedded=true";

interface G3ProgramPageProps {
  onBack: () => void;
  onOpenJoin: (profile?: string) => void;
}

export default function G3ProgramPage({ onBack, onOpenJoin }: G3ProgramPageProps) {
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>("ALL");
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);

  const pillars = [
    {
      number: "01",
      title: "God",
      subtitle: "Spiritual Alignment & Ethical Leadership",
      icon: Heart,
      description:
        "Establish deep moral clarity, purpose-driven conviction, and unshakeable ethical foundations as the bedrock for enduring leadership in career, enterprise, and society.",
      outcomes: [
        "Personal Conviction & Purpose Charter",
        "Values-Driven Decision Framework",
        "Spiritual & Emotional Resilience Disciplines"
      ]
    },
    {
      number: "02",
      title: "Growth",
      subtitle: "Mindset Reformation & Professional Mastery",
      icon: TrendingUp,
      description:
        "Upgrade your intellectual capacity, executive communication, and workplace readiness through intensive capacity building, career positioning, and peer accountability.",
      outcomes: [
        "ATS-Optimized Resume & Career Positioning",
        "High-Income Skill Acquisition Roadmap",
        "Executive Productivity & Habit Systems"
      ]
    },
    {
      number: "03",
      title: "Goals",
      subtitle: "Strategic Mapping & 12-Month Execution",
      icon: Target,
      description:
        "Translate ambitious annual visions into measurable quarterly milestones, structured financial systems, and weekly execution sprints backed by an accountability circle.",
      outcomes: [
        "12-Month Quarterly Execution Matrix",
        "Personal Finance & Savings Architecture",
        "Mastermind Accountability Circle Placement"
      ]
    }
  ];

  const weeksList = [
    {
      weekNumber: "Week 01",
      weekTitle: "The God Conviction & Purpose Architecture",
      date: "Saturday, December 5, 2026",
      time: "10:00 AM – 1:00 PM WAT",
      pillarTag: "GOD",
      keyPillar: "GOD • Spiritual Alignment",
      focus:
        "Spiritual grounding, establishing a sovereign leadership mindset, clarifying personal core values, and building deep ethical foundations for career and business excellence.",
      deliverable: "Personal Spiritual Convictions Journal & Purpose Charter"
    },
    {
      weekNumber: "Week 02",
      weekTitle: "The Growth Methodology & Career Positioning",
      date: "Saturday, December 12, 2026",
      time: "10:00 AM – 1:00 PM WAT",
      pillarTag: "GROWTH",
      keyPillar: "GROWTH • Mindset & Mastery",
      focus:
        "High-intensity capacity building. Overcoming intellectual and operational bottlenecks, mastering task-tracking systems, corporate coordination skills, and mindset-reset frameworks.",
      deliverable: "ATS Resume Overhaul & High-Income Skills Roadmap"
    },
    {
      weekNumber: "Week 03",
      weekTitle: "The Goal Congregation & Strategic Mapping",
      date: "Saturday, December 19, 2026",
      time: "10:00 AM – 1:00 PM WAT",
      pillarTag: "GOALS",
      keyPillar: "GOALS • Strategic Execution",
      focus:
        "Breaking ambitious annual targets into actionable quarterly and monthly milestones. Building structured personal finance, savings discipline, and execution scorecards for 2027.",
      deliverable: "Interactive Goals Blueprint (12-Month Execution Matrix)"
    },
    {
      weekNumber: "Week 04",
      weekTitle: "Velocity Preparation & High-Performance Systems",
      date: "Saturday, December 26, 2026",
      time: "10:00 AM – 1:00 PM WAT",
      pillarTag: "GROWTH",
      keyPillar: "GROWTH • Sustained Momentum",
      focus:
        "Building resilience under economic and professional pressure. Establishing weekly mastermind reviews, morning execution routines, and high-performance habits with peer groups.",
      deliverable: "Weekly Habits Tracker & Mastermind Circle Assignment"
    },
    {
      weekNumber: "Week 05",
      weekTitle: "The Deployment Moment & New Year Launch",
      date: "Saturday, January 2, 2027",
      time: "10:00 AM – 1:30 PM WAT",
      pillarTag: "DEPLOYMENT",
      keyPillar: "DEPLOYMENT • First Saturday Launch",
      focus:
        "Onboarding into active implementation groups, pairing with experienced alumni mentors, and signing professional covenants of accountability for the new year.",
      deliverable: "Official G3 Fellowship Certificate & Mentor Pairing"
    }
  ];

  const filteredWeeks =
    selectedPillarFilter === "ALL"
      ? weeksList
      : weeksList.filter((w) => w.pillarTag === selectedPillarFilter);

  const scrollToRegister = () => {
    const el = document.getElementById("g3-register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans pt-24 pb-20">
      {/* HERO SECTION (LIGHT MODE) */}
      <section className="bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-200/80 py-12 sm:py-16">
        <PageContainer>
          <div className="mb-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-blue transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <span>Annual Year-End Leadership & Strategy Accelerator</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-brand-blue font-display tracking-tight leading-[1.08]">
                Align Your Faith, Capability, and <span className="text-brand-orange">Execution Plan</span> for the New Year.
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                The <strong className="text-brand-blue font-semibold">G3 Series (God • Growth • Goals)</strong> is a structured 5-Saturday leadership and personal mastery summit and fellowship running throughout December and concluding on the first Saturday of January. Designed for young professionals, corps members, emerging executives, and founders determined to enter the new year with clarity and discipline.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <motion.button
                  onClick={scrollToRegister}
                  id="g3-hero-register-btn"
                  animate={{
                    y: [0, -3, 0],
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 4px 12px -2px rgba(234, 88, 12, 0.25)",
                      "0 10px 22px -4px rgba(234, 88, 12, 0.45)",
                      "0 4px 12px -2px rgba(234, 88, 12, 0.25)"
                    ]
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <span>Register Now</span>
                  <ArrowRight size={16} />
                </motion.button>
                <a
                  href="#g3-curriculum"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-brand-blue border border-slate-300 font-bold text-sm rounded-xl transition-all"
                >
                  Explore 5-Week Syllabus
                </a>
              </div>

              {/* KEY METADATA STRIP */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Duration</span>
                  <span className="text-sm font-bold text-brand-blue mt-0.5 block">5 Consecutive Saturdays</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Cohort Window</span>
                  <span className="text-sm font-bold text-brand-blue mt-0.5 block">Dec 5 – Jan 2</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Tuition</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block">100% Sponsored</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Format</span>
                  <span className="text-sm font-bold text-brand-blue mt-0.5 block">Live Virtual + Mastermind</span>
                </div>
              </div>
            </div>

            {/* RIGHT SUMMARY ARCHITECTURE CARD */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-orange block">
                      Program Blueprint
                    </span>
                    <h2 className="text-xl font-bold text-brand-blue font-display mt-0.5">
                      Why the G3 Architecture Works
                    </h2>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                    <Compass size={22} />
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Most New Year resolutions fail by February because they are built on momentary excitement rather than a coherent operating system. G3 replaces vague wishes with three interlocking pillars:
                </p>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      01
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-blue">God — Moral & Spiritual Anchor</h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Clarify your personal mission, core values, and ethical boundaries before setting career targets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      02
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-blue">Growth — Competence & Capacity</h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Build the professional skills, mental stamina, and personal systems required to sustain high performance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      03
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-blue">Goals — Measurable Execution</h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Convert your annual vision into a 12-month quarterly roadmap with peer accountability checks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-brand-orange" /> Open to youth & professionals across Africa
                  </span>
                  <button
                    onClick={scrollToRegister}
                    className="font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    Register Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* SECTION 2: THE 3 CORE PILLARS IN DETAIL */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <PageContainer>
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
              Core Philosophy
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight">
              Three Pillars of Holistic Leadership Transformation
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Every Saturday session is engineered around practical frameworks, live mentorship, and tangible worksheets you will use throughout the coming year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {pillars.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-brand-blue/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-orange">
                        <IconComponent size={22} />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        PILLAR {pillar.number}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-brand-blue font-display">
                        {pillar.title}
                      </h3>
                      <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mt-1">
                        {pillar.subtitle}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Outcomes
                    </span>
                    {pillar.outcomes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 size={14} className="text-brand-orange shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* SECTION 3: 5-WEEK CURRICULUM & FELLOWSHIP OVERVIEW */}
      <section id="g3-curriculum" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* LEFT: 5-WEEK SYLLABUS */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-1.5">
                    5-Weekend Roadmap
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-blue font-display tracking-tight">
                    Detailed Weekly Syllabus & Deliverables
                  </h2>
                </div>

                {/* FILTER TABS */}
                <div className="flex flex-wrap gap-1.5">
                  {["ALL", "GOD", "GROWTH", "GOALS", "DEPLOYMENT"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedPillarFilter(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPillarFilter === tag
                          ? "bg-brand-blue text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tag === "ALL" ? "All 5 Weeks" : tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredWeeks.map((wk, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 hover:border-brand-blue/25 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-brand-blue text-white text-xs font-bold rounded-lg font-mono">
                          {wk.weekNumber}
                        </span>
                        <span className="px-2.5 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold rounded-lg">
                          {wk.keyPillar}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-brand-blue" /> {wk.date}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                          <Clock size={13} /> {wk.time}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-brand-blue font-display leading-snug">
                      {wk.weekTitle}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {wk.focus}
                    </p>

                    <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-brand-blue font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                          Deliverable:
                        </span>
                        <span className="text-slate-800 font-semibold">{wk.deliverable}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: SUMMIT HIGHLIGHTS & ACCOUNTABILITY CARD */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block">
                      Fellowship Standards
                    </span>
                    <h3 className="text-base font-extrabold text-brand-blue font-display">
                      Certificate & Mentor Matching
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  G3 is a high-accountability leadership intensive. Participants who complete all 5 Saturday modules and submit their 12-Month Execution Matrix receive an official Certificate of Completion and placement into an active 2027 Peer Mastermind Circle.
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={14} className="text-brand-orange shrink-0" />
                    <span>5 Live Saturday Strategy Sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={14} className="text-brand-orange shrink-0" />
                    <span>Downloadable G3 Execution Workbooks</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={14} className="text-brand-orange shrink-0" />
                    <span>2027 Accountability Circle Placement</span>
                  </div>
                </div>

                <motion.button
                  onClick={scrollToRegister}
                  animate={{
                    y: [0, -2, 0],
                    scale: [1, 1.015, 1]
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-5 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Register Now</span>
                  <ArrowRight size={15} />
                </motion.button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* SECTION 4: DEDICATED GOOGLE FORM REGISTRATION SECTION */}
      <section
        id="g3-register"
        className="py-16 sm:py-20 bg-white border-b border-slate-200/80 scroll-mt-24"
      >
        <PageContainer>
          <div className="space-y-8">
            {/* Registration Heading & Supporting Text */}
            <div className="max-w-3xl space-y-3 text-left">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight uppercase">
                REGISTER FOR THE G3 SUMMIT
              </h2>
              <p className="text-brand-orange font-semibold italic text-base sm:text-lg">
                God. Growth. Goal.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Take the next step towards purposeful living, personal growth, and meaningful impact. Complete the registration form below to register your interest in the G3 Summit.
              </p>
            </div>

            {/* Native Embedded Google Form Container aligned with page content width */}
            <div className="w-full border border-slate-200 rounded-xl bg-white overflow-hidden">
              <div className="relative w-full bg-white min-h-[950px] sm:min-h-[1200px]">
                {isIframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-6 text-center">
                    <Loader2 size={28} className="text-brand-orange animate-spin mb-3" />
                    <p className="text-sm font-semibold text-brand-blue">
                      Loading G3 Summit Registration Form…
                    </p>
                  </div>
                )}

                <iframe
                  src={G3_GOOGLE_FORM_EMBED_URL}
                  title="Register for the G3 Summit"
                  className="w-full h-[1200px] sm:h-[1350px] md:h-[1450px] border-0 block"
                  frameBorder={0}
                  marginHeight={0}
                  marginWidth={0}
                  onLoad={() => setIsIframeLoading(false)}
                >
                  Loading…
                </iframe>
              </div>

              <div className="border-t border-slate-200 bg-slate-50/60 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  If the form does not display properly on your browser, you can open it directly:
                </span>
                <a
                  href={G3_GOOGLE_FORM_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-blue transition-colors"
                >
                  <span>Open Registration Form in a New Tab</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* SECTION 5: WHO SHOULD ATTEND & FELLOWSHIP BENEFITS */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">
                  Who Should Apply
                </span>
                <h3 className="text-2xl font-extrabold text-brand-blue font-display">
                  Built for Emerging Leaders Ready for Disciplined Growth
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Whether you are transitioning from university into the workforce, serving as an NYSC corps member, scaling a career, or leading a team, G3 equips you with the clarity and structure to excel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { icon: Briefcase, label: "Early & Mid-Career Professionals" },
                  { icon: Users, label: "NYSC Corps Members & Graduates" },
                  { icon: BookOpen, label: "Final-Year University Leaders" },
                  { icon: MapPin, label: "Founders & Community Builders" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">
                  Beyond December
                </span>
                <h3 className="text-2xl font-extrabold text-brand-blue font-display">
                  Year-Round Accountability & Community Support
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  G3 does not end on January 2nd. Graduates transition directly into Right-Minds Africa’s quarterly execution check-ins, Monthly Reinvention sessions, and career acceleration network.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  onClick={scrollToRegister}
                  animate={{
                    y: [0, -2, 0],
                    scale: [1, 1.015, 1]
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <span>Register Now</span>
                  <ArrowRight size={14} />
                </motion.button>
                <button
                  onClick={() => onOpenJoin("community")}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-brand-blue text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Join General RMA Community
                </button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

