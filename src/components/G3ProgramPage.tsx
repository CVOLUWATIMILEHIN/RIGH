/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
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
  Sparkles,
  Brain,
  Layers,
  Mic,
  MessageSquare,
  ExternalLink,
  Loader2,
  HelpCircle,
  Mail,
  MessageCircle,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import { saveRegistration } from "../lib/db";

const G3_GOOGLE_FORM_DIRECT_URL = "https://forms.gle/7h9muLz6rLnB2spV7";
const G3_GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdE1ggFc9mNCRqHb9odQnIdJLaLNs_ZoomB66JOBWFH5yOSSg/viewform?embedded=true";
const G3_WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/HbcAPEL2tVMIZBrzIAsx4o?s=cl&p=a&mlu=4&ilr=4&iam=2";

const G3_ROLE_OPTIONS = [
  "Graphic Designer",
  "Video Editor",
  "Content Creator",
  "Social Media Manager",
  "Writer / Copywriter",
  "Programme Coordinator",
  "WhatsApp Community Manager",
  "Community Engagement Intern",
  "Research and Documentation Intern",
  "Public Speaker / Event Host",
  "Event Moderator",
  "Event Support Intern",
  "Student / Undergraduate",
  "NYSC Corps Member",
  "Young Professional",
  "Entrepreneur / Founder",
  "Other / General Participant"
];

interface G3ProgramPageProps {
  onBack: () => void;
  onOpenJoin: (profile?: string) => void;
}

export default function G3ProgramPage({ onBack, onOpenJoin }: G3ProgramPageProps) {
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>("ALL");
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const iframeLoadCount = useRef(0);
  const [googleFormSubmitted, setGoogleFormSubmitted] = useState<boolean>(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState<boolean>(false);

  // Quick Confirmation Email & WhatsApp Dispatch state
  const [gfName, setGfName] = useState<string>("");
  const [gfEmail, setGfEmail] = useState<string>("");
  const [gfPhone, setGfPhone] = useState<string>("");
  const [gfRole, setGfRole] = useState<string>("Graphic Designer");
  const [gfSending, setGfSending] = useState<boolean>(false);
  const [gfError, setGfError] = useState<string | null>(null);
  const [gfSuccess, setGfSuccess] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null>(null);

  const handleCopyWhatsappLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(G3_WHATSAPP_GROUP_URL);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2500);
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
      const reg = await saveRegistration({
        fullName: gfName.trim(),
        email: gfEmail.trim(),
        phone: gfPhone.trim() || "Provided via Google Form",
        location: "Nigeria",
        profileType: "student",
        programType: "g3",
        programName: "G3 Summit 2026/2027 — The Relevance Question",
        department: gfRole,
        primaryRole: gfRole,
        contactMethod: "WhatsApp",
        whatsappLink: G3_WHATSAPP_GROUP_URL,
        notes: `[G3 Summit 2026/2027 Registration] Role/Category: ${gfRole}`
      });

      setGfSuccess({
        id: reg?.referenceNumber || reg?.id || `G3-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: gfName.trim(),
        email: gfEmail.trim(),
        role: gfRole
      });
    } catch (err: any) {
      setGfError(err?.message || "Failed to send confirmation email. Please try again.");
    } finally {
      setGfSending(false);
    }
  };

  const dimensions = [
    {
      number: "01",
      title: "God",
      subtitle: "Spiritual Foundation, Values & Purpose",
      icon: Heart,
      description:
        "Our relationship with God, spiritual foundation, core moral values, and divine purpose—anchoring who we are before what we pursue.",
      points: [
        "Relationship with God & spiritual grounding",
        "Unshakeable values & moral conviction",
        "Clarifying purpose and God-given identity"
      ]
    },
    {
      number: "02",
      title: "Growth",
      subtitle: "Personal Development & Capacity Building",
      icon: TrendingUp,
      description:
        "Personal development, capacity building, continuous learning, and intentional self-improvement to become valuable and capable individuals in an evolving world.",
      points: [
        "Skills acquisition & human capital development",
        "Adaptability, innovation & critical thinking",
        "Developing our God-given abilities & competence"
      ]
    },
    {
      number: "03",
      title: "Goals",
      subtitle: "Intentional Living, Execution & Accountability",
      icon: Target,
      description:
        "Intentional living, practical direction, disciplined execution, and accountability systems that translate reflections and aspirations into measurable results.",
      points: [
        "Clear vision & practical direction for 2027",
        "Actionable systems for consistency & discipline",
        "Accountability & measuring real progress"
      ]
    }
  ];

  const weeklyTopics = [
    {
      id: "WEEK 1",
      weekNumber: "Week 01",
      date: "Saturday, December 5, 2026",
      time: "Every Saturday in December • Live Session",
      title: "THE RELEVANCE OF IDENTITY, SELF-AWARENESS AND PERSONAL RESPONSIBILITY",
      dimensionsTag: "God • Growth • Goals",
      description:
        "This conversation will explore the importance of understanding who we are, recognising our identity, taking responsibility for our development and becoming intentional about the people we are growing into.",
      keyAreas: [
        "Identity and self-discovery.",
        "Self-awareness and personal assessment.",
        "Understanding our gifts, strengths and weaknesses.",
        "Personal responsibility and intentional development."
      ]
    },
    {
      id: "WEEK 2",
      weekNumber: "Week 02",
      date: "Saturday, December 12, 2026",
      time: "Every Saturday in December • Live Session",
      title: "THE RELEVANCE OF SKILLS, CAPACITY, VALUE CREATION AND CONTINUOUS LEARNING",
      dimensionsTag: "God • Growth • Goals",
      description:
        "This conversation will examine the importance of developing ourselves to become valuable and capable individuals. It will explore the need to continuously learn, acquire relevant skills and build the capacity to create value in our different fields and communities.",
      keyAreas: [
        "Skills acquisition and competence.",
        "Human capital development.",
        "Value creation and problem-solving.",
        "Continuous learning and personal improvement.",
        "Developing our God-given abilities."
      ]
    },
    {
      id: "WEEK 3",
      weekNumber: "Week 03",
      date: "Saturday, December 19, 2026",
      time: "Every Saturday in December • Live Session",
      title: "THE RELEVANCE OF ADAPTABILITY, INNOVATION AND NAVIGATING A CHANGING WORLD",
      dimensionsTag: "God • Growth • Goals",
      description:
        "As the world continues to evolve, individuals must develop the ability to adapt, innovate and respond effectively to emerging realities. This conversation will examine how we can remain relevant in a world characterised by technological advancement, changing opportunities and evolving expectations.",
      keyAreas: [
        "Adaptability and navigating change.",
        "Innovation and critical thinking.",
        "Technology, AI and the future of work.",
        "Identifying and responding to emerging opportunities.",
        "Maintaining our values while embracing change."
      ]
    },
    {
      id: "WEEK 4",
      weekNumber: "Week 04",
      date: "Saturday, December 26, 2026",
      time: "Every Saturday in December • Live Session",
      title: "THE RELEVANCE OF RELATIONSHIPS, ENVIRONMENT, CHOICES AND PERSONAL INFLUENCE",
      dimensionsTag: "God • Growth • Goals",
      description:
        "Our relationships, environments and everyday choices play significant roles in shaping our lives and influencing our development. This conversation will explore the importance of being intentional about the people we associate with, the environments we inhabit and the influences we permit in our lives.",
      keyAreas: [
        "The influence of relationships and associations.",
        "The role of environment in personal development.",
        "Decision-making and personal choices.",
        "Mentorship, networking and meaningful connections.",
        "Becoming intentional about our influences."
      ]
    },
    {
      id: "WEEK 5",
      weekNumber: "Week 05 (Grand Finale)",
      date: "Saturday, January 2, 2027",
      time: "First Saturday of January • Two Special Sessions",
      title: "THE RELEVANCE OF INTENTIONAL LIVING, VISION, EXECUTION AND ACCOUNTABILITY",
      dimensionsTag: "God • Growth • Goals",
      description:
        "The final conversation will bring the entire series together by examining the importance of living intentionally and translating our aspirations into practical action. It will focus on moving beyond intentions and developing the discipline, systems and accountability required to achieve meaningful results.",
      keyAreas: [
        "Purpose, vision and direction.",
        "Intentional living and prioritisation.",
        "Goal-setting and execution.",
        "Discipline and consistency.",
        "Accountability and measuring progress."
      ]
    }
  ];

  const specialSessions = [
    {
      sessionBadge: "SESSION ONE • SATURDAY, JANUARY 2, 2027",
      title: "THE MIND BEHIND THE GOALS",
      subtitle: "Understanding the mental and emotional capacity required to pursue our aspirations.",
      speakerNote:
        "Handled by a Mental Health Advocate or Qualified Mental Health Professional.",
      icon: Brain,
      keyAreas: [
        "Understanding mental health and emotional well-being.",
        "Mental preparedness for new responsibilities and expectations.",
        "Managing pressure, uncertainty and self-doubt.",
        "Emotional resilience and healthy coping mechanisms.",
        "Building a healthy relationship with our ambitions and aspirations."
      ]
    },
    {
      sessionBadge: "SESSION TWO • SATURDAY, JANUARY 2, 2027",
      title: "FROM VISION TO EXECUTION",
      subtitle: "Turning intentions into measurable results.",
      speakerNote:
        "The closing conversation of the series focused on helping participants translate their reflections and aspirations into practical goals for 2027.",
      icon: Target,
      keyAreas: [
        "Developing a clear vision for the year.",
        "Setting meaningful and measurable goals.",
        "Breaking goals into actionable steps.",
        "Building systems for consistency and execution.",
        "Accountability and tracking progress."
      ]
    }
  ];

  const expectedOutcomes = [
    "A better understanding of their identity and personal responsibility.",
    "Greater awareness of the skills and capacities they need to develop.",
    "A stronger ability to navigate change and emerging opportunities.",
    "More intentionality about their relationships, environments and choices.",
    "A clearer vision and practical direction for 2027.",
    "A better understanding of the importance of mental and emotional well-being."
  ];

  const filteredWeeks =
    selectedWeekFilter === "ALL"
      ? weeklyTopics
      : weeklyTopics.filter((w) => w.id === selectedWeekFilter);

  const scrollToRegister = () => {
    const el = document.getElementById("g3-register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans pt-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-50/90 to-white border-b border-slate-200/80 py-12 sm:py-16">
        <PageContainer>
          <div className="mb-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-blue transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-black uppercase tracking-widest font-mono">
                  G3 SERIES 2026/2027
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider font-mono">
                  G3 — God. Growth. Goals.
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold text-brand-blue font-display tracking-tight leading-none uppercase">
                  G3 <span className="text-brand-orange">SUMMIT</span>
                </h1>

                <div className="pt-1 space-y-1.5 border-l-4 border-brand-orange pl-4">
                  <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand-orange font-mono">
                    2026/2027 THEME: THE RELEVANCE QUESTION
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-brand-blue font-display tracking-tight leading-snug">
                    The Human Advantage: Who Will You Become in a Changing World?
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                <strong className="text-brand-blue font-semibold">G3 Series</strong> is an annual developmental programme organised by <strong className="text-brand-blue font-semibold">Right-Minds Africa Hub</strong>, traditionally held every Saturday in December and the first Saturday of January. The series is designed as a reflective and developmental experience that prepares individuals to enter a new year with the right mindset, a strong spiritual foundation and practical direction.
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                For the <strong className="text-brand-blue">2026/2027 edition</strong>, we are adopting <em>The Relevance Question: The Human Advantage — Who Will You Become in a Changing World?</em> as our central theme—creating conversations that challenge participants to reflect on who they are, what they bring to the table, how they respond to an evolving world and what they must intentionally become to live meaningful and productive lives.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <motion.button
                  onClick={scrollToRegister}
                  id="g3-hero-register-btn"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md shadow-brand-orange/20"
                >
                  <span>Register for G3 Summit</span>
                  <ArrowRight size={16} />
                </motion.button>
                <a
                  href="#g3-curriculum"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-brand-blue border border-slate-300 font-bold text-sm rounded-xl transition-all"
                >
                  Explore 5-Week Conversations
                </a>
              </div>

              {/* KEY METADATA STRIP */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Schedule</span>
                  <span className="text-sm font-bold text-brand-blue mt-0.5 block">Saturdays in Dec & Jan 2</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Edition</span>
                  <span className="text-sm font-bold text-brand-blue mt-0.5 block">2026 / 2027</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Approach</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block">5 Progressive Weeks</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Organiser</span>
                  <span className="text-sm font-bold text-brand-blue mt-0.5 block">Right-Minds Africa Hub</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: THE OVERARCHING QUESTION & PROGRESSIVE APPROACH CARD */}
            <div className="lg:col-span-5 space-y-5">
              {/* Overarching Question Spotlight Card */}
              <div className="bg-brand-blue text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl relative overflow-hidden text-left">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-orange font-mono block">
                      2. The Overarching Question
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white font-display mt-0.5">
                      The Guiding Inquiry of the Series
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-brand-orange shrink-0">
                    <HelpCircle size={20} />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The entire G3 Series 2026/2027 seeks to answer one fundamental question that will guide the conversations throughout all five Saturdays:
                </p>

                <blockquote className="p-4 sm:p-5 rounded-xl bg-white/10 border-l-4 border-brand-orange text-white font-display text-base sm:text-lg font-bold leading-snug italic">
                  “How do I become the person capable of living the life, fulfilling the purpose and achieving the goals I desire in an ever-changing world?”
                </blockquote>

                <div className="pt-2 border-t border-white/15 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-orange block">
                    Progressive Edition Approach
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Rather than dedicating individual Saturdays to God, Growth, or Goals separately, this edition adopts a <strong className="text-white">progressive approach</strong>: each weekly topic explores <strong className="text-white">God, Growth, and Goals</strong> together within one complete, unified conversation.
                  </p>
                </div>
              </div>

              {/* Quick Programme Structure Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                    <Mic size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange font-mono block">
                      Speaker Arrangement
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-brand-blue font-display">
                      Unified Weekly Conversations + Dual Finale
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  One central speaker handles each weekly topic across Weeks 1–4, weaving <strong className="text-brand-blue">God, Growth, and Goals</strong> into one cohesive conversation. The final Saturday (<strong className="text-brand-blue">January 2, 2027</strong>) features <strong className="text-brand-blue">two speakers</strong> across two special sessions: Mental Health & Emotional Capacity, and From Vision to Execution.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. THE THREE INTERCONNECTED DIMENSIONS (GOD • GROWTH • GOALS) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <PageContainer>
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono block mb-2">
              1. Background & Three Interconnected Dimensions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight">
              God. Growth. Goals. — Integrated in Every Conversation
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              The series explores personal development through three interconnected dimensions. Each weekly Saturday conversation integrates all three dimensions so participants build spiritual depth, personal capacity, and disciplined execution simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {dimensions.map((dim) => {
              const IconComponent = dim.icon;
              return (
                <div
                  key={dim.number}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-brand-blue/30 transition-all flex flex-col justify-between text-left shadow-xs"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-orange">
                        <IconComponent size={22} />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        DIMENSION {dim.number}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-brand-blue font-display">
                        {dim.title}
                      </h3>
                      <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mt-1">
                        {dim.subtitle}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {dim.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Core Focus
                    </span>
                    {dim.points.map((item, idx) => (
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

      {/* 3. PROPOSED WEEKLY TOPICS (5 PROGRESSIVE CONVERSATIONS) */}
      <section id="g3-curriculum" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <PageContainer>
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6 text-left">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono block mb-1.5">
                  3. Proposed Weekly Topics (5 Progressive Conversations)
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight">
                  Weekly Conversations & Key Focus Areas
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  The structure consists of five progressive conversations across December 2026 and the first Saturday of January 2027, with each topic building on the previous one.
                </p>
              </div>

              {/* FILTER TABS */}
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4", "WEEK 5"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedWeekFilter(tag)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono ${
                      selectedWeekFilter === tag
                        ? "bg-brand-blue text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tag === "ALL" ? "All 5 Weeks" : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {filteredWeeks.map((wk) => (
                <div
                  key={wk.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-brand-blue/30 transition-all space-y-5 text-left shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-lg font-mono">
                        {wk.weekNumber}
                      </span>
                      <span className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold rounded-lg font-mono">
                        {wk.dimensionsTag}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-brand-orange" /> {wk.date}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                        <Clock size={13} /> {wk.time}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-extrabold text-brand-blue font-display leading-snug">
                    {wk.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {wk.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-orange block mb-3">
                      Key Areas of Conversation:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {wk.keyAreas.map((area, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 font-medium"
                        >
                          <CheckCircle2 size={15} className="text-brand-orange shrink-0 mt-0.5" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 4. SPECIAL SESSIONS — SATURDAY, JANUARY 2, 2027 */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <PageContainer>
          <div className="space-y-10">
            <div className="max-w-3xl text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono block mb-2">
                4. Special Sessions — Saturday, January 2, 2027
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight">
                Grand Finale Dual-Speaker Sessions
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
                The final Saturday of the G3 Series 2026/2027 (<strong className="text-brand-blue">Saturday, January 2, 2027</strong>) will feature two distinct sessions handled by two specialized speakers—combining mental and emotional readiness with practical goal execution for 2027.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {specialSessions.map((session, idx) => {
                const IconComp = session.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-md bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest font-mono">
                          {session.sessionBadge}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-blue shrink-0">
                          <IconComp size={20} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-brand-blue font-display">
                          {session.title}
                        </h3>
                        <p className="text-sm font-bold text-brand-orange mt-1">
                          {session.subtitle}
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 bg-white border border-slate-200/80 rounded-xl p-3.5 leading-relaxed">
                        <strong className="text-brand-blue">Session Facilitator Focus:</strong> {session.speakerNote}
                      </p>

                      <div className="space-y-2.5 pt-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                          The Conversation Will Explore:
                        </span>
                        {session.keyAreas.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 size={15} className="text-brand-orange shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 5 & 6. PROGRAMME STRUCTURE, EXPECTED OUTCOMES & PUBLICITY DIRECTION */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Expected Outcomes (6) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left shadow-xs">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono block">
                  6. Expected Outcome
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-blue font-display">
                  What Participants Will Gain by the End of G3 2026/2027
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ultimately, we want participants to move beyond merely making New Year resolutions to becoming more intentional about who they are, what they are developing and what they are working towards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {expectedOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-orange/15 text-brand-orange font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-slate-500">
                  G3 SERIES 2026/2027 — THE RELEVANCE QUESTION
                </span>
                <button
                  onClick={scrollToRegister}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-blue transition-colors cursor-pointer"
                >
                  Reserve Your Spot Below <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Programme Structure (5) & Flyer/Publicity Direction (7) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 text-left shadow-xs flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange font-mono block">
                      5. Programme Structure & Speaker Arrangement
                    </span>
                    <h3 className="text-lg font-extrabold text-brand-blue font-display">
                      One Cohesive Conversation Each Saturday
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  One central speaker handles each weekly topic, exploring it through the three dimensions of <strong className="text-brand-blue">God, Growth and Goals</strong>. This ensures that each topic is treated as one complete conversation rather than three separate presentations.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The final Saturday (<strong className="text-brand-blue">January 2, 2027</strong>) is the sole exception, featuring two speakers: one for the mental health conversation (<em>The Mind Behind the Goals</em>) and another for the vision and execution session (<em>From Vision to Execution</em>).
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 text-left shadow-xs flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange font-mono block">
                      Flyer, Publicity & Preparation Direction
                    </span>
                    <h3 className="text-lg font-extrabold text-brand-blue font-display">
                      Clear Weekly Topics & Dates Ahead of Time
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  All weekly topics and their corresponding Saturday dates are published clearly ahead of the programme so prospective participants understand what each Saturday&apos;s conversation covers and can anticipate, reflect, and prepare meaningfully for every session.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={scrollToRegister}
                    className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Register Now <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => onOpenJoin("community")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-blue text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Join RMA Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 7. DEDICATED GOOGLE FORM REGISTRATION SECTION */}
      <section
        id="g3-register"
        className="py-16 sm:py-20 bg-white scroll-mt-24"
      >
        <PageContainer>
          <div className="space-y-8">
            {/* Registration Heading & Supporting Text */}
            <div className="max-w-3xl space-y-3 text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange block">
                G3 SERIES 2026/2027 — THE RELEVANCE QUESTION
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight uppercase">
                REGISTER FOR G3 SERIES 2026/2027
              </h2>
              <p className="text-brand-orange font-semibold italic text-base sm:text-lg">
                The Human Advantage: Who Will You Become in a Changing World? (G3 — God. Growth. Goals.)
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Prepare to enter 2027 with the right mindset, a strong spiritual foundation, and practical direction. Complete the registration form below to secure your seat for all five Saturdays in December 2026 and January 2, 2027.
              </p>
            </div>

            {/* Native Embedded Google Form Container aligned with page content width */}
            <div className="w-full border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0E3A2F] via-emerald-700 to-amber-500" />

              {/* Top Quick Confirmation Email & WhatsApp Bar right ABOVE the Google Form */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0E3A2F] via-[#12493b] to-[#0b2e25] text-white border-b border-amber-400/40 space-y-3 text-left">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-mono">
                      <Mail size={11} /> Instant Email Confirmation &amp; WhatsApp Onboarding
                    </span>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                      Enter your Name &amp; Email here (before or right after submitting the Google Form below) to immediately receive your <strong>Confirmation Email</strong> and join our <strong>Official WhatsApp Community</strong>:
                    </p>
                  </div>
                  <a
                    href={G3_WHATSAPP_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 shadow-sm shrink-0 self-start lg:self-auto"
                  >
                    <MessageCircle size={14} className="fill-slate-950" />
                    <span>Join Official WhatsApp Group</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <form onSubmit={handleGoogleFormQuickConfirm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                  <input
                    type="text"
                    required
                    value={gfName}
                    onChange={(e) => setGfName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="email"
                    required
                    value={gfEmail}
                    onChange={(e) => setGfEmail(e.target.value)}
                    placeholder="Your Email Address *"
                    className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="tel"
                    value={gfPhone}
                    onChange={(e) => setGfPhone(e.target.value)}
                    placeholder="Phone / WhatsApp Number"
                    className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <select
                    value={gfRole}
                    onChange={(e) => setGfRole(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {G3_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={gfSending}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {gfSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    <span>{gfSending ? "Sending..." : "Send My Confirmation Mail"}</span>
                  </button>
                </form>
              </div>

              {googleFormSubmitted && (
                <div className="mx-4 sm:mx-8 mt-6 p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 font-mono block">
                        Form Response Detected
                      </span>
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Google Form Submitted! Join WhatsApp &amp; Receive Your Confirmation Mail
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Click the green button to join our official WhatsApp community immediately, and enter your email below to receive your official confirmation email.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <a
                      href={G3_WHATSAPP_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-sm"
                    >
                      <MessageCircle size={16} />
                      <span>Join WhatsApp Group</span>
                      <ExternalLink size={13} />
                    </a>
                    <a
                      href="#g3-post-submission-whatsapp-email"
                      className="px-4 py-3 bg-[#0E3A2F] hover:bg-[#0c3127] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Mail size={14} />
                      <span>Get Confirmation Email</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="relative w-full bg-white min-h-[950px] sm:min-h-[1200px]">
                {isIframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-6 text-center">
                    <Loader2 size={28} className="text-brand-orange animate-spin mb-3" />
                    <p className="text-sm font-semibold text-brand-blue">
                      Loading G3 Summit 2026/2027 Registration Form…
                    </p>
                  </div>
                )}

                <iframe
                  src={G3_GOOGLE_FORM_EMBED_URL}
                  title="Register for G3 Series 2026/2027"
                  className="w-full h-[1200px] sm:h-[1350px] md:h-[1450px] border-0 block"
                  frameBorder={0}
                  marginHeight={0}
                  marginWidth={0}
                  onLoad={() => {
                    setIsIframeLoading(false);
                    iframeLoadCount.current += 1;
                    if (iframeLoadCount.current >= 2) {
                      setGoogleFormSubmitted(true);
                      const confirmSection = document.getElementById("g3-post-submission-whatsapp-email");
                      if (confirmSection) {
                        confirmSection.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }
                  }}
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

              {/* FINAL STEP AFTER SUBMITTING THE FORM: GET YOUR CONFIRMATION EMAIL & JOIN OUR OFFICIAL WHATSAPP COMMUNITY */}
              <div
                id="g3-post-submission-whatsapp-email"
                className="p-6 sm:p-10 bg-gradient-to-br from-[#0E3A2F] via-[#12493b] to-[#0b2e25] text-white border-t-4 border-amber-400 space-y-8 scroll-mt-24 text-left"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
                  <div className="space-y-2 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#25D366]/20 text-emerald-300 border border-[#25D366]/40 px-3 py-1 rounded-full font-mono">
                      <CheckCircle2 size={12} /> Final Step After Submitting the Form
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold uppercase font-display tracking-tight text-white">
                      Get Your Confirmation Email &amp; Join Our Official WhatsApp Community
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                      Once you click <strong>Submit</strong> on the form above, enter your name and email below to immediately receive your <strong>Official Application Confirmation Mail</strong> and join our <strong>Internship &amp; Volunteer WhatsApp Community</strong>.
                    </p>
                  </div>

                  {/* Direct WhatsApp Join CTA */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                      Instant WhatsApp Onboarding Link:
                    </span>
                    <a
                      href={G3_WHATSAPP_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <MessageCircle size={18} className="fill-slate-950" />
                      <span>Join Official WhatsApp Group</span>
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyWhatsappLink}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedWhatsapp ? (
                        <>
                          <Check size={13} className="text-emerald-300" />
                          <span>WhatsApp Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy WhatsApp Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Confirmation Email Form */}
                {gfSuccess ? (
                  <div className="bg-emerald-950/70 border border-emerald-400/40 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={24} className="text-[#25D366] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                          Confirmation Email Dispatched • REF: {gfSuccess.id}
                        </span>
                        <h4 className="text-lg font-extrabold text-white">
                          Thank You, {gfSuccess.fullName}! Your Confirmation Mail Has Been Sent.
                        </h4>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                          We have sent your official confirmation email along with the WhatsApp invitation link to <strong>{gfSuccess.email}</strong>. Click below to open the official WhatsApp group directly:
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href={G3_WHATSAPP_GROUP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-md"
                      >
                        <MessageCircle size={16} className="fill-slate-950" />
                        <span>Open Official WhatsApp Group Now</span>
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setGfSuccess(null)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Send to Another Email
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGoogleFormQuickConfirm} className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        <Mail size={16} />
                        <span>Send My Official Confirmation Email &amp; WhatsApp Invitation</span>
                      </h4>
                      <span className="text-[11px] text-emerald-200 font-mono">
                        Instant Automated Dispatch
                      </span>
                    </div>

                    {gfError && (
                      <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-100 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-rose-300" />
                        <span>{gfError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          Primary Role Selected
                        </label>
                        <select
                          value={gfRole}
                          onChange={(e) => setGfRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          {G3_ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-[11px] text-emerald-100/80">
                        We will immediately send your confirmation mail with the WhatsApp group link (<a href={G3_WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="underline text-amber-300">{G3_WHATSAPP_GROUP_URL}</a>) to your email address.
                      </p>
                      <button
                        type="submit"
                        disabled={gfSending}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                      >
                        {gfSending ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Sending Confirmation Mail...</span>
                          </>
                        ) : (
                          <>
                            <Mail size={15} />
                            <span>Send Confirmation Email &amp; Open WhatsApp Link</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
