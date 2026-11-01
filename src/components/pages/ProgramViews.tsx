import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Calendar, Users, Award, 
  Layout, Compass, Laptop, ArrowRight, CheckCircle2, 
  MapPin, Clock, Star, HelpCircle, ChevronRight, ChevronDown
} from "lucide-react";
import SeminarsPage from "../SeminarsPage";
import { saveRegistration } from "../../lib/db";
import { PageContainer } from "../PageContainer";

const reinventionWeeks = [
  {
    week: "Week 1",
    title: "Awareness & Reinvention Foundations",
    theme: "Understanding Reinvention & Letting Go of the Old Version of Yourself",
    icon: Compass,
    topics: [
      {
        heading: "1. What Reinvention Means",
        bullets: [
          "Definition of self-reinvention & baseline psychology",
          "Why reinvention is absolutely mandatory for sustainable individual growth",
          "Distinguishing intentional reinvention from accidental shift"
        ]
      },
      {
        heading: "2. Understanding Personal Transformation",
        bullets: [
          "Internal vs external dimensions of transformation",
          "Reinvention as intentional, active design rather than passive reaction",
          "Addressing why people naturally resist behavioral change"
        ]
      },
      {
        heading: "3. Letting Go of the Old Self",
        bullets: [
          "Evaluating and releasing limiting beliefs and obsolete habits",
          "Moving away from unhealthy environments and validation dependency",
          "Navigating fear-based thinking, self-doubt, and toxic emotional loops"
        ]
      },
      {
        heading: "4. Deep Self-Awareness Frameworks",
        bullets: [
          "Auditing where you currently stand without self-deception",
          "Identifying underlying behavioral patterns, hidden triggers, and auto-habits",
          "Structured personal reflection and inventory exercises"
        ]
      },
      {
        heading: "5. Reinvention Reflection Exercises",
        bullets: [
          "Practical identity awareness journaling protocols",
          "In-depth personal growth and potential metrics self-assessment",
          "Drafting your raw current-state reflection essay"
        ]
      }
    ]
  },
  {
    week: "Week 2",
    title: "Self-Leadership & Emotional Mastery",
    theme: "Becoming a Self-Led Person with High Emotional Maturity",
    icon: Users,
    topics: [
      {
        heading: "1. Foundations of Self-Leadership",
        bullets: [
          "What self-leadership means in high-fluidity modern contexts",
          "Leading yourself intentionally before assuming authority over others",
          "Taking extreme internal ownership and personal status accountability"
        ]
      },
      {
        heading: "2. Emotional Mastery Protocols",
        bullets: [
          "Understanding and translating emotional sensations as metrics",
          "Developing proactive emotional awareness and naming precision",
          "Practical steps for somatic and cognitive emotional regulation",
          "Mastering the ability to respond intentionally instead of reacting blindly"
        ]
      },
      {
        heading: "3. Characteristics of a Self-Led Person",
        bullets: [
          "Establishing robust self-responsibility, boundaries, and internal approval",
          "Developing active emotional regulation templates and protocols",
          "Fostering self-discipline and hyper-consistency across conditions"
        ]
      },
      {
        heading: "4. Building Deep Self-Confidence",
        bullets: [
          "Demystifying confidence: Trusting your capabilities over superficial charisma",
          "Nurturing self-trust through repeated, clean promises kept to yourself",
          "Action-based loops to dismantle paralysis, fear, and intellectual self-doubt"
        ]
      },
      {
        heading: "5. Self-Esteem & Self-Worth Integration",
        bullets: [
          "Structuring internal validation to decouple worth from performance",
          "Rebuilding a healthy, objective, and resilient self-image",
          "Refusing to bargain your self-valuation in modern comparison metrics"
        ]
      },
      {
        heading: "6. Practical Emotional-Awareness Exercises",
        bullets: [
          "Interactive trigger mapping and trigger response playbook designs",
          "Daily active emotional-awareness reflection prompts",
          "Routine, lightweight emotional health check-ins"
        ]
      }
    ]
  },
  {
    week: "Week 3",
    title: "Systems, Productivity & Consistency",
    theme: "Building the Secure External Structure That Sustains Personal Transformation",
    icon: Layout,
    topics: [
      {
        heading: "1. Architecture of Systems vs. Goals",
        bullets: [
          "Why systems outlast goals (Why winners & losers have the exact same goals)",
          "Formulating frictionless identity-based processes over outcome-only goals",
          "Aligning micro-habit systems with the person you aspire to become"
        ]
      },
      {
        heading: "2. Productivity Redefined",
        bullets: [
          "Intentional results-delivery vs deceptive busyness",
          "Maintaining deep intellectual focus in a hyper-distracted digital market",
          "Aesthetic pacing, energy allocation, and stamina preservation",
          "Setting up the baseline sustainable productivity workflow"
        ]
      },
      {
        heading: "3. Engineering Personal Routines",
        bullets: [
          "Architecting elegant, distraction-free morning check-in rituals",
          "Constructing practical weekly/monthly planning and reviewing dashboards",
          "Executing with absolute focus on tasks that move your core metrics"
        ]
      },
      {
        heading: "4. Operating Principles & Hard Boundaries",
        bullets: [
          "Developing clear personal rules to secure focus and schedule",
          "Delineating emotional boundaries, time budgets, and physical spaces",
          "Configuring strict digital hygiene habits and focused device parameters",
          "Protecting personal time from external depletion or unscheduled noise"
        ]
      },
      {
        heading: "5. Mastery of Consistency",
        bullets: [
          "Understanding why consistency fails and how to bypass the resistance",
          "Overcoming toxic perfectionism and the 'all-or-nothing' trap",
          "The science of rapid recovery and bounce-back after standard setbacks"
        ]
      },
      {
        heading: "6. Practical Productivity Workouts",
        bullets: [
          "Configuring the 'Daily Top 3 Priorities' workflow template",
          "Creating focused blocks of uninterrupted space",
          "Mastering weekly planning audits and calendar tracking reviews"
        ]
      }
    ]
  },
  {
    week: "Week 4",
    title: "Identity, Self-Worth & Confidence",
    theme: "Rebuilding Who You Are Becoming & Re-shaping Your Internal Narrative",
    icon: Award,
    topics: [
      {
        heading: "1. Deconstructing Personal Identity",
        bullets: [
          "Unpacking how identity is formed and how it controls subconscious actions",
          "The powerful connection between identity, daily behavior, and big decisions",
          "Shedding unneeded habits by shifting how you define yourself internally"
        ]
      },
      {
        heading: "2. Anchoring Self-Worth",
        bullets: [
          "Cultivating steady self-worth that is independent of external achievement",
          "Detaching your internal value from grades, positions, or societal labels",
          "Overcoming dependency on praise and constant validation from peers"
        ]
      },
      {
        heading: "3. Elevating Self-Esteem",
        bullets: [
          "Adopting a healthy, appreciative, and realistic perception of yourself",
          "Rebuilding internal stability and self-respect in high-pressure seasons",
          "Techniques to cultivate quiet self-respect, self-trust, and internal honor"
        ]
      },
      {
        heading: "4. Cultivating Unshakeable Self-Confidence",
        bullets: [
          "Practicing confidence through continuous action, independent of feelings",
          "Synthesizing personal competence with bold, intentional action",
          "Dismantling discomfort and strategic fear through deliberate exposure"
        ]
      },
      {
        heading: "5. Identity Reconstruction Framework",
        bullets: [
          "Systematically releasing hand-me-down, limiting, and obsolete labels",
          "Rewriting your personal narrative from a position of agency and strength",
          "Reinforcing your new empowering beliefs and core standards daily"
        ]
      },
      {
        heading: "6. Identity Reinforcement Practices",
        bullets: [
          "Developing supportive self-talk and perspective refocusing habits",
          "Interactive identity journaling and weekly belief reviews",
          "Embarking on courageous action loops to solidify your new character"
        ]
      }
    ]
  },
  {
    week: "Week 5",
    title: "Vision, Purpose & Alignment",
    theme: "Creating Intended Direction & Alignment for the Life You Are Designing",
    icon: Sparkles,
    topics: [
      {
        heading: "1. Articulating True Vision",
        bullets: [
          "Distinguishing a functional vision from empty daydreams",
          "Creating a vivid, clear, and identity-aligned long-term plan",
          "Using your vision as an active filter for current opportunities"
        ]
      },
      {
        heading: "2. Uncovering Purpose & Calling",
        bullets: [
          "Deconstructing what purpose really means (it is a process, not a destination)",
          "Gaining a sense of purpose that goes beyond occupational performance",
          "Living a life governed by intent, impact, and high personal agency"
        ]
      },
      {
        heading: "3. Complete Alignment Architecture",
        bullets: [
          "Aligning core identity with visible external behavior and routines",
          "Ensuring your lifestyle matches your long-term aspirations",
          "Eliminating the exhaustion caused by gaps between values and actions"
        ]
      },
      {
        heading: "4. Strategic Goal Mapping",
        bullets: [
          "Applying effective, science-driven goal structures",
          "Formulating identity-based goals rather than outcome-only numbers",
          "Breaking large goals down into yearly, monthly, and weekly milestones"
        ]
      },
      {
        heading: "5. Systems and Daily Execution",
        bullets: [
          "Translating large visions into simple daily actions",
          "Pacing yourself to achieve steady, burnout-free execution",
          "Consistently tracking metrics to monitor growth over time"
        ]
      },
      {
        heading: "6. Practical Alignment Reviews",
        bullets: [
          "Participating in the comprehensive lifestyle audit assessment",
          "Drafting and refining your personal vision statement",
          "Aligning daily routines with long-term goals for execution"
        ]
      }
    ]
  }
];

interface ProgramViewsProps {
  subView: "seminar" | "reinvention" | "leadership" | "bootcamps";
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

export default function ProgramViews({ subView, onNavigate, onOpenJoin }: ProgramViewsProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [programFaqIndex, setProgramFaqIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeWeekIndex, setActiveWeekIndex] = useState<number | null>(0);
  const [completedWeeks, setCompletedWeeks] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem("rma_reinvention_completed_weeks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleWeekCompletion = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = { ...completedWeeks, [idx]: !completedWeeks[idx] };
    setCompletedWeeks(updated);
    try {
      localStorage.setItem("rma_reinvention_completed_weeks", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage write error", err);
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    cohort: subView,
    reason: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!formData.fullName.trim() || !cleanEmail || !formData.phone.trim() || !formData.location.trim()) {
      setSubmitError("Please fill in all the required registration fields.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      // Map cohort properly for DB reporting
      let profileTypeMapped = `programs-${subView}`;
      if (subView === "reinvention") {
        profileTypeMapped = "reinvention-blueprint";
      }

      await saveRegistration({
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        profileType: profileTypeMapped,
        aspiration: formData.reason.trim() || `Interested in joining the ${subView} program cohort.`
      });

      // Dispatch a secure hook event to reload live dashboards if they are open in parallel tabs
      window.dispatchEvent(new Event("rma_registration_submitted"));

      setSuccessMsg(`Congratulations ${formData.fullName.trim()}! Your application has been successfully submitted and verified. Our administrative coordinators will process your profile and contact you via email (${cleanEmail}) shortly.`);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        cohort: subView,
        reason: ""
      });
    } catch (err: any) {
      console.error("Reinvention page submit error:", err);
      setSubmitError(err?.message || "There was a network or server communication error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (subView === "seminar") {
    return <SeminarsPage onBack={() => onNavigate("home")} onOpenJoin={onOpenJoin} />;
  }

  const subViewStr = subView as any;

  const getModulesForProgram = () => {
    if (subViewStr === "bootcamps") {
      return [
        { num: "01", title: "Digital Fundamentals & Tech Literacy", desc: "Understanding core computer operations, file navigation, secure internet browsing, and digital file organization." },
        { num: "02", title: "Creative Writing & Written Expression", desc: "Developing paragraph organization, vocabulary richness, spelling agility, and clean essay compositions." },
        { num: "03", title: "Graphic Design Basics (Canva & Vector Layouts)", desc: "Understanding color theory, typography combinations, spatial alignments, and building elegant visual layouts." },
        { num: "04", title: "Time Management & Goal Systems", desc: "Academic study schedules, daily homework logs, focus routines, and productive study habits." },
        { num: "05", title: "Effective Communication & Presentation", desc: "Public speaking fundamentals, confidence loops, debate structures, presentation posture, and voice articulation." },
        { num: "06", title: "Responsible Media & Digital Detox", desc: "Understanding social media algorithms, building responsible tech utilization routines, and moral integrity principles." }
      ];
    }
    if (subViewStr === "leadership") {
      return [
        {
          num: "01",
          title: "Productivity & Performance",
          desc: "Unlocking peak operational output through smart time strategies and dismantling procedural procrastination workflows.",
          subTopics: [
            "Smart Work, Smart Results",
            "Time Management for Peak Performance",
            "Personal Effectiveness in the Workplace",
            "Overcoming Procrastination",
            "Goal Setting and Execution"
          ]
        },
        {
          num: "02",
          title: "Leadership Development",
          desc: "Nurturing resilient emerging corporate visionaries, servant leadership ethics, and emotional intelligence metrics.",
          subTopics: [
            "Emerging Leaders Training",
            "Servant Leadership",
            "Emotional Intelligence for Leaders",
            "Leading Teams Effectively",
            "Building a Leadership Culture"
          ]
        },
        {
          num: "03",
          title: "Growth Mindset & Personal Development",
          desc: "Harnessing continuous personal expansion, high adaptive capabilities, team-wide initiative, and resilience.",
          subTopics: [
            "Developing a Growth Mindset",
            "Adaptability and Resilience",
            "Building Confidence and Initiative",
            "Managing Change Successfully",
            "Continuous Learning and Improvement"
          ]
        },
        {
          num: "04",
          title: "Workplace Excellence",
          desc: "Upholding supreme corporate honor, effective communications alignment, and teamwork dynamics.",
          subTopics: [
            "Professional Ethics and Integrity",
            "Effective Communication Skills",
            "Teamwork and Collaboration",
            "Customer Service Excellence",
            "Workplace Organization and Efficiency"
          ]
        },
        {
          num: "05",
          title: "Youth-Focused Organizations & Schools",
          desc: "Structuring classroom leadership and mentorship values to build the next sequence of future leaders.",
          subTopics: [
            "Leadership for Educators",
            "Student Mentorship Skills",
            "Creating Productive Learning Environments",
            "Classroom Leadership and Management",
            "Raising Future Leaders"
          ]
        }
      ];
    }
    // Default: Monthly Reinvention Program
    return [
      { num: "01", title: "Self-Auditing & Focus Diagnostics", desc: "Identifying individual focus leaks, dismantling operational procrastination, and analyzing behavioral baselines of daily routines." },
      { num: "02", title: "Cognitive Agility & Mindset Re-Engineering", desc: "Dismantling negative mental feedback loops, addressing self-limiting beliefs, and configuring an active growth compass." },
      { num: "03", title: "Goal Mapping & SOP Execution", desc: "Formulating standard operating procedures (SOPs) for key monthly, quarterly, and 12-month goals with clear execution tracking." },
      { num: "04", title: "Time Boxing & Habit Mechanics", desc: "Building daily task pipelines, implementing strict time-boxing strategies, and configuring resilient physical and digital habit loop trackers." },
      { num: "05", title: "Financial Stewardship & Saving Structures", desc: "Constructing personalized budget parameters, setting up high-integrity savings systems, and planning post-service sustainable resources." },
      { num: "06", title: "Mastermind Alignment & Peer Audits", desc: "Participating in high-accountability mastermind review circles, maintaining weekly progress dashboards, and receiving direct coaching alignment." }
    ];
  };

  const getFaqsForProgram = () => {
    if (subViewStr === "reinvention") {
      return [
        {
          question: "Is the Monthly Reinvention Program free to join?",
          answer: "No. The Monthly Reinvention Program is a premium, high-intensity mindset coaching and routine alignment track. It requires a monthly tuition fee to cover your personal habit diagnostic audits, weekly live review labs, and continuous high-touch feedback loops."
        },
        {
          question: "What is included in the monthly registration fee?",
          answer: "Your tuition fee includes direct access to the 5-Week Reinvention Blueprint dynamic curriculum, daily accountability checkers inside focused WhatsApp circles, personalized goal-setting templates, continuous habit-alignment reviews, and lifelong post-graduation membership in our RightMinds Africa community."
        },
        {
          question: "Are there flexible payment options or installment plans?",
          answer: "We support single-term monthly pricing to keep administrative accounting clean. However, if you are registering a large group or require a sponsored slot, please contact our administrative coordinators at admin@rightminds.africa to discuss customized options."
        }
      ];
    }
    if (subViewStr === "bootcamps") {
      return [
        {
          question: "What is the training cost for the Summer Leadership Bootcamp?",
          answer: "To meet different needs, we offer two participation tiers: Online Participation and Physical Participation. Pricing is detailed below in the Program Investment section."
        },
        {
          question: "What does the Physical Participation fee include?",
          answer: "The Physical fee is fully comprehensive. It includes high-quality learning workbooks, professional study guides, custom development kits, healthy daily snacks/refreshments, and active on-site physical workshop sessions."
        },
        {
          question: "Where are the physical classes hosted?",
          answer: "Our physical bootcamp centers are located in verified corporate host locations in Abuja and Lagos commands. Upon successful registration verification, detailed check-in directories and session venues will be delivered directly to your contact address."
        },
        {
          question: "Is there a specific age structure for this bootcamp?",
          answer: "Yes, the Summer Leadership Bootcamp is specially designed for teenagers aged 13 to 19 (SS1 to SS3 students or equivalents). We focus on building fundamental computer basics, creative design, healthy screen-time limits, public confidence coaching, and moral character frameworks."
        }
      ];
    }
    if (subViewStr === "leadership") {
      return [
        {
          question: "Are the Leadership Development and Staff Training tracks free?",
          answer: "No. Our professional Leadership Development Programs—including our specialized Staff Peak/Staff Pick Trainings—are customized premium capacity-building services. We design and deliver bespoke curricula to meet distinct organizational benchmarks."
        },
        {
          question: "What customized training durations are available for organization packages?",
          answer: "We support four structured timeline blocks to match your company's operational velocity: 1-Day Training, 3-Day Intensive, 1-Week Program, and 4-Week Program."
        },
        {
          question: "How do we receive a pricing quote for our business or team?",
          answer: "Pricing is based on a custom-tailored quotation determined by your organization size and specific training needs. Simply fill out our 'Program Application' form (indicating your staff size) and our team will send a detailed curriculum proposal and quotation."
        }
      ];
    }
    return [
      {
        question: "Is this program free to attend?",
        answer: "Yes, our foundational leadership programs are 100% free, fully sponsored by alumni mentors and philanthropic partners."
      },
      {
        question: "Are there physical classes?",
        answer: "Most check-ins are digital (WhatsApp / Telegram cohorts), alongside hybrid physical workshops across major commands in Nigeria."
      }
    ];
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Background Gradients */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-905">Programs</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-amber-550 capitalize">{subViewStr.replace("-", " ")} Program</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="programs-mobile-section-nav">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[#0E3A2F]/50 font-mono mb-1.5">
            📂 Programs Subsections Navigation
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#FAF8F3]/60 border border-[#0E3A2F]/10 rounded-2xl text-xs font-black uppercase text-slate-800 tracking-wider shadow-sm focus:outline-none"
          >
            <span>
              {subViewStr === "seminar" && "Monthly Leadership Seminar"}
              {subViewStr === "reinvention" && "Monthly Reinvention Program"}
              {subViewStr === "leadership" && "Leadership Development Programs"}
              {subViewStr === "bootcamps" && "Summer Skill Bootcamp (Teenagers)"}
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
                  { label: "Monthly Leadership Seminar", view: "programs-seminar" },
                  { label: "Monthly Reinvention Program", view: "programs-reinvention" },
                  { label: "Leadership Development Programs", view: "programs-leadership" },
                  { label: "Summer Skill Bootcamp (Teenagers)", view: "programs-bootcamps" }
                ].map((option) => {
                  const isActive = "programs-" + subViewStr === option.view;
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
        <div className="max-w-3xl space-y-4 mb-12 border-l-4 border-slate-900 pl-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Sparkles size={11} /> Dedicated Program Suite
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
            {subViewStr === "seminar" && "Monthly Leadership Seminar"}
            {subViewStr === "reinvention" && "Monthly Reinvention Program"}
            {subViewStr === "leadership" && "Leadership Development Programs"}
            {subViewStr === "bootcamps" && "Summer Skill Bootcamp (Teenagers)"}
          </h1>
          <p className="text-slate-605 text-sm sm:text-base leading-relaxed">
            {subViewStr === "seminar" && "Empowering young Africans and corporate teams with emotional intelligence, mindset-shifting coaching, and robust character foundations."}
            {subViewStr === "reinvention" && "Continuous high-intensity mindset audits, career milestone tracking, and daily execution habit mentorship."}
            {subViewStr === "leadership" && "A physical and digital academy designed to train university undergraduates, graduates, and aspiring professional leaders."}
            {subViewStr === "bootcamps" && "An intensive summer academy built specifically for teenagers to foster tech literacy, computer basics, creative writing, graphic design, time-management, leadership fundamentals, and healthy digital habits."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main program description (Left) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Value Proposition */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl space-y-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-tight">Strategic Objectives & Framework</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                We believe standard educational degrees are insufficient in modern economies. Our curriculum aims to bridge the deep deficit in mindset confidence, execution systems, and professional integrity:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { title: "Mindset Reset", desc: "Dismantling limited thinking, building ultimate growth-oriented self-belief." },
                  { title: "SOP Execution", desc: "Formulating standard operating habits to execute goals without structural delays." },
                  { title: "Workplace EQ", desc: "Harnessing deep emotional intelligence, ethical boundaries, and corporate discipline." },
                  { title: "Market Readiness", desc: "Strategic positioning for career launches, digital freelancing, or national leadership." }
                ].map((obj, i) => (
                  <div key={i} className="flex gap-3 text-left">
                    <CheckCircle2 size={16} className="text-amber-550 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase">{obj.title}</h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-1 font-normal">{obj.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                  {subView === "reinvention" ? "Syllabus — The Reinvention Blueprint Outline" : "Key Modules of Learning"}
                </h3>
                {subView === "reinvention" && (
                  <span className="text-[10px] font-bold font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">5-WEEK PROGRAM</span>
                )}
              </div>

              {subView === "reinvention" ? (
                <>
                  {/* Interactive Syllabus step-progress visual indicator */}
                  <div className="bg-slate-50 border border-slate-200/65 rounded-3xl p-5 mb-6 space-y-4 shadow-xs text-left" id="syllabus-progress-indicator">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800 tracking-wider uppercase font-mono">Syllabus Completion Index</h4>
                        <p className="text-slate-500 text-[10.5px] mt-0.5 leading-tight">Mark each week as covered to monitor your alignment progress.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-mono border border-amber-100 uppercase">
                          {Object.values(completedWeeks).filter(Boolean).length} of {reinventionWeeks.length} Completed ({Math.round((Object.values(completedWeeks).filter(Boolean).length / reinventionWeeks.length) * 100)}%)
                        </span>
                        {Object.values(completedWeeks).filter(Boolean).length === reinventionWeeks.length && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full uppercase border border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600" /> SYLLABUS AUDITED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* The visual track line and circles */}
                    <div className="relative pt-4 pb-2 px-1">
                      {/* Background track line */}
                      <div className="absolute top-[28px] left-4 right-4 h-1 bg-slate-200 rounded-full" />
                      
                      {/* Filled track line based on percentage */}
                      <div 
                        className="absolute top-[28px] left-4 h-1 bg-[#0E3A2F] rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (Object.values(completedWeeks).filter(Boolean).length > 0 ? ((Object.values(completedWeeks).filter(Boolean).length - 1) / (reinventionWeeks.length - 1)) * 100 : 0)))}%` 
                        }} 
                      />

                      {/* Step Nodes */}
                      <div className="relative flex justify-between">
                        {reinventionWeeks.map((week, idx) => {
                          const isCompleted = !!completedWeeks[idx];
                          const isCurrentActive = activeWeekIndex === idx;
                          
                          return (
                            <div key={idx} className="flex flex-col items-center">
                              {/* Node circle */}
                              <button
                                type="button"
                                onClick={() => setActiveWeekIndex(idx)}
                                title={`Navigate to ${week.week}`}
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all relative z-10 cursor-pointer ${
                                  isCompleted
                                    ? "bg-[#0E3A2F] text-amber-300 border-2 border-amber-500/30"
                                    : isCurrentActive
                                    ? "bg-amber-550 text-white border-2 border-white ring-2 ring-amber-550"
                                    : "bg-white text-slate-500 border border-slate-300 hover:border-slate-400"
                                }`}
                              >
                                {isCompleted ? "✓" : idx + 1}
                              </button>
                              
                              {/* Node label */}
                              <span className={`text-[9.5px] font-extrabold uppercase mt-2 font-mono tracking-wider transition-colors ${
                                isCurrentActive ? "text-amber-600 font-black" : isCompleted ? "text-slate-800" : "text-slate-400"
                              }`}>
                                W{idx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action prompt */}
                    <div className="text-[9px] text-center text-slate-405 pt-1 font-mono uppercase tracking-wider">
                      👉 Click any step badge above to snap to its specific syllabus section
                    </div>
                  </div>

                  {/* Interactive Week-by-Week Accordion for Reinvention Program */}
                  <div className="space-y-4">
                    {reinventionWeeks.map((week, idx) => {
                      const isOpen = activeWeekIndex === idx;
                      const IconComponent = week.icon;
                      return (
                        <div 
                          key={idx} 
                          className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                            isOpen 
                              ? "border-amber-500/30 bg-amber-50/10 shadow-sm" 
                              : "border-slate-150 bg-white hover:border-slate-200"
                          }`}
                        >
                          {/* Accordion Header */}
                          <button
                            type="button"
                            onClick={() => setActiveWeekIndex(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-5 text-left transition-colors duration-200 cursor-pointer focus:outline-none"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-xl transition-colors ${
                                isOpen ? "bg-[#0E3A2F] text-amber-300" : "bg-slate-50 text-slate-550"
                              }`}>
                                <IconComponent size={16} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black font-mono text-amber-600 uppercase tracking-widest">{week.week}</span>
                                  {completedWeeks[idx] && (
                                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-750 border border-emerald-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Covered ✓</span>
                                  )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight leading-snug mt-0.5">{week.title}</h4>
                              </div>
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 mr-1 ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
                          </button>

                          {/* Accordion Content */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                              >
                                <div className="px-5 pb-5 pt-1 border-t border-slate-100/60 bg-slate-50/30 space-y-4">
                                  <div className="p-3 bg-[#0E3A2F]/5 border border-[#0E3A2F]/10 rounded-xl">
                                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-[#0E3A2F]/70 block leading-none">Weekly core theme:</span>
                                    <p className="text-slate-800 text-xs font-semibold leading-relaxed mt-1 text-left">{week.theme}</p>
                                  </div>

                                  {/* Completion Checkbox toggler */}
                                  <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl gap-2 shadow-xs">
                                    <div className="text-left w-full sm:w-auto">
                                      <h5 className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400">Week Audit Covered</h5>
                                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">Toggle if you have reviewed or attended this week's live lab.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => toggleWeekCompletion(idx, e)}
                                      className={`w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-3xs border transition-all flex items-center justify-center gap-1.5 ${
                                        completedWeeks[idx]
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                          : "bg-white text-slate-700 border-slate-250 hover:bg-slate-50"
                                      }`}
                                    >
                                      <CheckCircle2 size={12} className={completedWeeks[idx] ? "text-emerald-650" : "text-slate-450"} />
                                      {completedWeeks[idx] ? "WEEK COVERED ✓" : "MARK COVERED"}
                                    </button>
                                  </div>

                                  <div className="space-y-4 pt-1">
                                    <h5 className="text-[10px] font-black font-mono uppercase text-slate-400 tracking-wider text-left">Topics Covered</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {week.topics.map((topic, tIdx) => (
                                        <div key={tIdx} className="space-y-2 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                                          <h6 className="text-[11px] font-extrabold text-slate-900 uppercase leading-snug tracking-tight text-left">{topic.heading}</h6>
                                          <ul className="space-y-1.5 pl-1">
                                            {topic.bullets.map((bullet, bIdx) => (
                                              <li key={bIdx} className="flex gap-2 text-[10.5px] text-slate-500 leading-relaxed font-normal text-left">
                                                <span className="text-amber-500 mt-1 shrink-0">•</span>
                                                <span>{bullet}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Standard modules */
                <div className="space-y-6">
                  {getModulesForProgram().map((mod, idx) => (
                    <div key={idx} className="flex gap-6 items-start pb-6 border-b border-slate-100 text-left">
                      <span className="text-lg font-black text-amber-500 font-mono font-sans">{mod.num}</span>
                      <div className="space-y-2 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">{mod.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed font-normal">{mod.desc}</p>
                        {(mod as any).subTopics && (
                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {(mod as any).subTopics.map((sub: string, sIdx: number) => (
                              <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                <span className="font-medium leading-relaxed">{sub}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {subView === "reinvention" && (
              <>
                {/* Program Deliverables */}
                <div className="bg-[#0E3A2F]/5 border border-[#0E3A2F]/10 p-8 rounded-3xl space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black font-mono tracking-widest text-[#0E3A2F] uppercase">INCLUDED VALUE</span>
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm text-left">🌱 Program Deliverables</h3>
                    <p className="text-slate-550 text-[11px] leading-relaxed text-left">Every enrolled reinforcement student is provided with the full resource suite to navigate their transformation:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Weekly Coaching Sessions", desc: "Interactive mastermind assemblies with direct accountability checks." },
                      { title: "Reflection Exercises", desc: "Mindset audits, prompt logs, and intensive behavioral mapping sheets." },
                      { title: "Goal-Setting Templates", desc: "Systems-based mapping assets to coordinate daily routines." },
                      { title: "Daily Accountability Structure", desc: "Peer-led review check-ins inside active WhatsApp groups." },
                      { title: "Productivity & Identity Trackers", desc: "Actionable habits registers to benchmark performance daily." },
                      { title: "Weekly Review Systems", desc: "Scheduled intervals to audit personal milestones and address leaks." },
                      { title: "Direct Mentorship Support", desc: "Constructive feedback loops led by veteran growth specialists." },
                      { title: "Community/Accountability Access", desc: "Lifetime entry into our network of forward-thinking RightMinds alumni." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-white p-3.5 border border-slate-100 rounded-2xl shadow-xs text-left">
                        <span className="text-[#0E3A2F] font-bold font-sans">✓</span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-2xs uppercase tracking-wide">{item.title}</h4>
                          <p className="text-slate-500 text-[10.5px] leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program Outcomes */}
                <div className="bg-[#FAF8F3]/70 border border-amber-500/10 p-8 rounded-3xl space-y-6 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black font-mono tracking-widest text-amber-700 uppercase">GRADUATION EXPECTATIONS</span>
                    <h3 className="font-bold text-[#0E3A2F] uppercase tracking-tight text-sm">🌟 Program Outcomes</h3>
                    <p className="text-slate-600 text-[11px] leading-relaxed">By the end of the Reinvention Blueprint, active participants are guaranteed to realize these shifts:</p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-3.5">
                    {[
                      "Understand themselves and their behavioral patterns deeply",
                      "Develop healthy emotional awareness and conscious responses",
                      "Become self-led, highly disciplined daily practitioners",
                      "Build and deploy robust daily productivity systems",
                      "Improve consistency and recover rapidly from inevitable setbacks",
                      "Strengthen self-confidence and develop deep internal self-trust",
                      "Gain complete, unshakeable clarity on identity, career, and direction",
                      "Align their lifestyle goals intentionally with their core values",
                      "Nurture a consistent practice of sustainable personal growth"
                    ].map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-705 leading-relaxed font-semibold">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Quick FAQ block */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4 text-left">
              <h4 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wide">Frequently Asked Questions</h4>
              <div className="space-y-3">
                {getFaqsForProgram().map((faq, idx) => {
                  const isOpen = programFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-xs id-program-faq-${idx} ${
                        isOpen
                          ? "border-brand-blue bg-white shadow-sm"
                          : "border-slate-200 hover:border-brand-blue/30 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setProgramFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left px-5 py-3.5 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-850 hover:text-brand-blue transition-colors gap-3"
                      >
                        <span className="leading-snug">{faq.question}</span>
                        <div className={`p-1 rounded-lg shrink-0 transition-all duration-300 ${isOpen ? "bg-brand-blue/15 text-brand-blue rotate-180" : "bg-slate-50 text-slate-400"}`}>
                          <ChevronDown size={14} className="transform transition-transform duration-300 ease-out" />
                        </div>
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden border-t border-brand-blue/5"
                          >
                            <motion.div 
                              className="px-5 py-3.5 text-xs text-slate-600 leading-relaxed font-normal bg-white"
                              initial={{ y: -6, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {faq.answer}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Registration Form (Right Column) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-3xl sticky top-28 shadow-sm text-left">
            <div className="space-y-4">
              <span className="text-amber-600 font-bold font-mono text-[10px] tracking-widest uppercase block">JOIN NEXT COHORT</span>
              <h3 className="text-lg font-bold text-slate-900 uppercase">PROGRAM APPLICATION</h3>
              <p className="text-slate-605 text-xs leading-relaxed font-normal">
                Submit your direct coordinates below. Our administrative coordinators will verify your application profile to secure your seat.
              </p>
            </div>

            {/* Program Investment Price Banner */}
            {subViewStr === "reinvention" && (
              <div className="mt-4 p-4.5 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black tracking-widest uppercase text-brand-orange/80 font-mono">INVESTMENT SCHEME</span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-display">Reinvention Blueprint</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-950 font-display">₦15,000</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-none font-mono">/ participant • month</span>
                </div>
              </div>
            )}

            {subViewStr === "bootcamps" && (
              <div className="mt-4 p-4 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 space-y-3">
                <span className="text-[9px] font-black tracking-widest uppercase text-brand-orange/85 font-mono block">BOOTCAMP INVESTMENT PATHS</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex flex-col justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">Online Path</span>
                    <span className="text-base font-black text-slate-950 font-display mt-1">₦20,000</span>
                    <span className="text-[7px] font-bold text-slate-400 mt-1 leading-snug">Zoom sessions & online guides</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex flex-col justify-between">
                    <span className="text-[8px] font-black text-brand-orange uppercase tracking-wider font-mono">Physical Path</span>
                    <span className="text-base font-black text-slate-950 font-display mt-1">₦50,050</span>
                    <span className="text-[7px] font-bold text-slate-400 mt-1 leading-snug">*Includes workbook, snacks & onsite activities</span>
                  </div>
                </div>
              </div>
            )}

            {subViewStr === "leadership" && (
              <div className="mt-4 p-4.5 rounded-2xl bg-slate-950 text-white border border-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest uppercase text-brand-orange font-mono">STAFF CAPACITY TRAINING</span>
                  <span className="text-[8px] font-black bg-brand-orange text-white px-2 py-0.5 rounded uppercase font-mono">Request a Quote</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase font-sans">Staff Peak / Staff Pick formats:</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
                    Customized team programs available in: 1-Day Training, 3-Day Intensive, 1-Week Program, and 4-Week Program tracks.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[9px] font-mono tracking-wider text-brand-orange uppercase font-black">
                    <span>Starting from custom pricing</span>
                    <span>Corporate Proposals</span>
                  </div>
                </div>
              </div>
            )}

            {successMsg ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs leading-relaxed"
              >
                {successMsg}
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 mt-6">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold leading-relaxed font-mono">
                    ⚠️ {submitError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Full Name <span className="text-rose-550">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Email Address <span className="text-rose-550">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@yourdomain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Phone Number (WhatsApp Active) <span className="text-rose-550">*</span></label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+234..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">State or Location of Residence <span className="text-rose-550">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Lagos, Nigeria"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Why do you want to join this program?</label>
                  <textarea 
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows={3}
                    placeholder="Describe your current personal expectations..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs bg-white text-slate-900 resize-none font-semibold"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#0E3A2F] hover:bg-[#07130F] disabled:bg-slate-350 text-amber-300 disabled:text-slate-450 hover:text-white font-black uppercase tracking-widest rounded-xl text-xs transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? "Syncing Application..." : "Verify & Apply →"}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-3 text-[10px] text-slate-400">
              <Clock size={12} className="text-amber-500 animate-pulse" />
              <span>Cohort registration closes shortly. Apply today.</span>
            </div>
          </div>

        </div>

      </PageContainer>
    </div>
  );
}
