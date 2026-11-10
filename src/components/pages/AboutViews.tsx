import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Target, Compass, Award, MapPin, 
  ChevronRight, Calendar, User, Heart, Star, 
  Users, Mail, Linkedin, Globe, Shield, RefreshCw, ChevronDown, X,
  Clock, BookOpen, Layers, CheckCircle2, TrendingUp, HelpCircle
} from "lucide-react";
import { getHistoricalRecords } from "../../lib/db";
import { HistoricalRecord } from "../../types";
import founderPortrait from "../../assets/images/FOUNDER.jpg";
import mediaLeadPortrait from "../../assets/images/vincent_oluwatimilehin_media_tech_team_lead.png";
import estherPortrait from "../../assets/images/abana_ogechukwu_esther_content_team_lead.jpg";
import godwinPortrait from "../../assets/images/godwin_admin_manager.jpg";
import { getCMSConfig } from "../AdminCMS";
import { PageContainer } from "../PageContainer";
import AboutOverviewRedesign from "./AboutOverviewRedesign";

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  credentials: string;
  role: string;
  photo: string | null;
  bio: string;
  hubs: string[];
  category: "executive" | "board" | "mentor" | "volunteer";
  socials: {
    email: string;
    linkedin: string;
    behance?: string;
  };
  accent: string;
}

// Highly comprehensive seeded profiles categorized into Executive, Board, Mentors, and Volunteers.
const teamMembers: TeamMember[] = [
  // EXECUTIVES
  {
    id: "gracious_esther",
    name: "Gracious-Esther",
    title: "Founder & Executive Director",
    credentials: "Soundmind-DOCTOR",
    role: "Growth-Mindset, Leadership & Productivity Coach",
    photo: founderPortrait,
    category: "executive",
    bio: "Gracious-Esther is at the heart of the youth growth crusade in Africa. Guided by a faith-driven commitment, she trains emerging professionals to rewrite cognitive blockades, embrace personal development, and build outstanding professional integrity frameworks. She has reached over 1,000+ young people dynamically, empowering them as the Founder and Executive Director (ED) of Right Minds Africa Hub.",
    hubs: ["Founder & Executive Director (ED)", "Abuja FCT", "Lagos"],
    socials: {
      email: "mentor@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-amber-500 text-amber-500"
  },
  {
    id: "olasunde_louis",
    name: "Oluwatimilehin Vicent O. (CV)",
    title: "Tech/Media Team Lead",
    credentials: "B.Ed. Guidance & Counseling",
    role: "Creative Brand & Visual Communication Architect",
    photo: mediaLeadPortrait,
    category: "executive",
    bio: "I am Olosunde Oluwatimilehin Vicent, a multidisciplinary creative professional and Product Designer (UI/UX Designer) with experience spanning graphic design, visual storytelling, video editing, media strategy, social media management, live streaming, and ICT operations.\n\nI currently work across product design and creative media, combining user-centred design with strong visual communication to create engaging digital experiences, brand assets, and content. My professional experience includes working with Brainbench Technology, RightMind Africa, Faiiya Tech Solution, Datame Solution, Ideal Solicitors, and CVSub, alongside leading creative projects and teams.\n\nAt Brainbench Technology, I work as a Graphics Designer and UI/UX Designer, contribute to digital product development, tutor UI/UX design, create visual content, and support media production and educational technology initiatives. I have also contributed to projects involving LMS platforms, CBT systems, digital learning products, and web applications.\n\nBeyond client and organisational work, I have led and participated in initiatives focused on digital skills development, creative education, and technology adoption, including Graphics Design Boot Camps, Digital Literacy programmes, and skill-acquisition initiatives. I am passionate about helping individuals and organisations use technology, design, and media to communicate better, solve problems, and grow.\n\nMy core tools include CorelDRAW, Figma, Canva, CapCut, Filmora, Final Cut Pro, After Effects, OBS Studio, and other UI/UX, creative, and livestreaming tools. I also have certifications and practical experience across Graphic Design, UI/UX Design, Video Editing, ICT, Solar Engineering, and Sound Engineering.\n\nI am continuously building and contributing to projects that combine design, technology, education, and digital transformation, while developing initiatives such as 1000SAM 5.0 and skill-development programmes designed to help people build practical, future-ready digital skills.",
    hubs: ["National Media & Tech Command HQ", "National Headquarters Hub", "Virtual Chapters Operations"],
    socials: {
      email: "creative@rightminds.africa",
      linkedin: "https://www.linkedin.com/in/vicentcv",
      behance: "https://www.behance.net/oluwatiimilehincv"
    },
    accent: "border-slate-850 text-slate-900"
  },
  {
    id: "godwin_admin",
    name: "Godwin",
    title: "Manager (Admin)",
    credentials: "Administrative Lead",
    role: "Admin & Operations Coordinator",
    photo: godwinPortrait,
    category: "executive",
    bio: "Godwin directs central administration and organizational logistics at Right Minds Africa Hub, managing communication systems, scheduling, and strategic state command administration. Under his oversight, workflows run with optimal operational precision.",
    hubs: ["National Headquarters Hub"],
    socials: {
      email: "admin@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-amber-500 text-amber-550"
  },
  {
    id: "ogeabana_esther",
    name: "Abana Ogechukwu Esther",
    title: "Content Team Lead & Project Coordinator",
    credentials: "Content Team Lead",
    role: "Content Strategy, Project Coordination & Creative Campaigns",
    photo: estherPortrait,
    category: "executive",
    bio: "Abana Ogechukwu Esther is the Content Team Lead and Project Coordinator at Right Minds Africa Hub. She steers organizational storytelling, multimedia content architecture, and strategic cross-chapter project rollouts across our student, youth corps, and professional development programs.",
    hubs: ["National Content Studio", "Project Operations Desk", "Virtual Chapters Hub"],
    socials: {
      email: "content@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-rose-500 text-rose-600"
  }
];

interface AboutViewsProps {
  subView: "overview" | "vision-mission" | "philosophy" | "team";
  onNavigate: (view: string) => void;
  onOpenJoin: () => void;
}

export default function AboutViews({ subView, onNavigate, onOpenJoin }: AboutViewsProps) {
  const [cms, setCms] = useState(getCMSConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setCms(getCMSConfig());
    };
    window.addEventListener("rma_cms_updated", handleUpdate);
    return () => window.removeEventListener("rma_cms_updated", handleUpdate);
  }, []);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "executive" | "board" | "mentor" | "volunteer">("all");

  const [records, setRecords] = useState<HistoricalRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("rma_historical_records");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<string>("all");

  useEffect(() => {
    const fetchRecords = async () => {
      const safetyTimer = setTimeout(() => {
        setLoadingRecords(false);
      }, 2000);
      try {
        const data = await getHistoricalRecords();
        const sorted = [...data].sort((a, b) => b.year - a.year);
        setRecords(sorted);
      } catch (err) {
        console.error("Error loading historical records", err);
      } finally {
        clearTimeout(safetyTimer);
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredTeam = selectedCategory === "all" 
    ? teamMembers 
    : teamMembers.filter(m => m.category === selectedCategory);

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Visual Backglow highlights */}
      <div className="absolute top-20 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-905 capitalize">About</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-amber-550 capitalize">{subView === "team" ? "Leadership Team" : subView.replace("-", " & ")}</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="about-mobile-section-nav">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[#0E3A2F]/50 font-mono mb-1.5">
            📂 About Subsections Navigation
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#FAF8F3]/60 border border-[#0E3A2F]/10 rounded-2xl text-xs font-black uppercase text-slate-800 tracking-wider shadow-sm focus:outline-none"
          >
            <span>
              {subView === "overview" && "Organization Overview"}
              {subView === "vision-mission" && "Vision & Mission"}
              {subView === "philosophy" && "Philosophy (Think • Live • Lead)"}
              {subView === "team" && "Leadership Team & Board"}
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
                  { label: "Organization Overview", view: "about-overview" },
                  { label: "Vision & Mission", view: "about-vision-mission" },
                  { label: "Philosophy (Think • Live • Lead)", view: "about-philosophy" },
                  { label: "Leadership Team & Board", view: "about-team" }
                ].map((option) => {
                  const isActive = "about-" + subView === option.view;
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

        {/* Desktop & Tablet Subnavigation Pill Tabs */}
        <div className="hidden lg:flex items-center gap-1.5 mb-8 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
          {[
            { label: "Organization Overview", view: "about-overview", key: "overview" },
            { label: "Vision & Mission", view: "about-vision-mission", key: "vision-mission" },
            { label: "Philosophy (Think • Live • Lead)", view: "about-philosophy", key: "philosophy" },
            { label: "Leadership Team & Board", view: "about-team", key: "team" }
          ].map((tab) => {
            const isActive = subView === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onNavigate(tab.view)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section Title (for Non-Overview Views) */}
        {subView !== "overview" && (
          <div className="max-w-3xl space-y-4 mb-12 border-l-4 border-slate-900 pl-6 text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <Sparkles size={11} /> RightMinds Africa Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
              {subView === "vision-mission" && "Vision & Mission"}
              {subView === "philosophy" && "Our Core Philosophy"}
              {subView === "team" && "Leadership Team & Advisors"}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {subView === "vision-mission" && "Discover our blueprint for African youth transition, from solitary thinking paradigms to regional, structured empowerment."}
              {subView === "philosophy" && "Unpacking our flagship 'Think Right • Live Right • Lead Right' formula for deliberate personal transformation."}
              {subView === "team" && "Introducing our executive trustees, advisory board specialists, and passionate field coordinators."}
            </p>
          </div>
        )}

        {/* Dynamic Inner Content Render */}
        <AnimatePresence mode="wait">
          <motion.div
            key={subView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* OVERVIEW SUB-VIEW */}
            {subView === "overview" && (
              <AboutOverviewRedesign
                onNavigate={onNavigate}
                onOpenJoin={onOpenJoin}
                records={records}
                loadingRecords={loadingRecords}
                timelineFilter={timelineFilter}
                setTimelineFilter={setTimelineFilter}
              />
            )}

            {/* VISION & MISSION SUB-VIEW */}
            {subView === "vision-mission" && (
              <div className="space-y-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Vision Card */}
                  <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-slate-800">
                    <div className="space-y-6">
                      <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-500 border border-white/20">
                        <Target size={24} />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wider font-mono text-amber-500">OUR VISION</h3>
                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal bg-transparent">
                        {cms.aboutVision || "To raise and stimulate the mindset of a generation to become purpose-driven, growth-minded, and impact-oriented individuals who will transform Africa and the globe through leadership, productivity, and personal development/excellence."}
                      </p>
                    </div>

                    <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider pt-6 border-t border-white/10 mt-10">
                      🌍 Raise, Shape, and Position Change Leaders
                    </div>
                  </div>

                  {/* Mission Card */}
                  <div className="bg-amber-500 text-slate-950 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-amber-400">
                    <div className="space-y-6">
                      <div className="h-12 w-12 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-900 border border-slate-900/10">
                        <Compass size={24} />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wider font-mono text-slate-900">OUR MISSION</h3>
                      <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal bg-transparent">
                        {cms.aboutMission || "To empower young people across Africa through leadership development, mindset reformation, and capacity-building programs that promote growth, productivity, and sustainable change."}
                      </p>
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider pt-6 border-t border-slate-900/10 mt-10">
                      🚀 Practical Capacity Over Theory
                    </div>
                  </div>
                </div>

                {/* Core Pillars Grid */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 mt-8">
                  <h3 className="text-lg font-bold text-slate-900 uppercase mb-6">Our Foundational Guiding Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { icon: Shield, title: "Integrity", desc: "Upholding absolute moral accountability, ethical models, and transparent operations in personal and business contexts." },
                      { icon: User, title: "Growth Mindset", desc: "Continuously training cognitive parameters to reject mental self-limitations and absorb dynamic modern workflows." },
                      { icon: Users, title: "Community First", desc: "Constructing strong, peer-monitored hubs across states to keep emerging youth leaders focused on collective impact." },
                      { icon: Award, title: "Excellence", desc: "Setting premier benchmarks in coaching execution, professional deliverables, and administrative competence." }
                    ].map((val, i) => {
                      const Icon = val.icon;
                      return (
                        <div key={i} className="space-y-3">
                          <div className="p-2 w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
                            <Icon size={18} />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm uppercase">{val.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-normal">{val.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* THINK • LIVE • LEAD PHILOSOPHY */}
            {subView === "philosophy" && (
              <div className="space-y-12 text-left">
                <div className="max-w-2xl">
                  <p className="text-sm sm:text-base text-slate-650 leading-relaxed font-normal">
                    {cms.aboutPhilosophy || "The core formula of RightMinds Africa Hub centers on an integrated tri-axis paradigm: Think Right • Live Right • Lead Right. Transformation isn't a checklist; it's a sequence. Shift your mind, adjust your habits, and extend change outward."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Think card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:border-amber-500/40 transition-all shadow-sm flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 uppercase font-display">1. Think Right</h3>
                      <p className="text-xs sm:text-sm text-slate-605 leading-relaxed font-normal">
                        Cognitive confidence and mindset re-engineering. We help young people dismantle self-defeating scripts, explore personal limiting beliefs, and replace them with strategic, resilient mental operating models.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-amber-605 block pt-6 border-t border-slate-200 mt-6 md:mt-8 uppercase">🧠 Mindset Re-Engineering</span>
                  </div>

                  {/* Live card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:border-amber-500/40 transition-all shadow-sm flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
                        <Compass size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 uppercase font-display">2. Live Right</h3>
                      <p className="text-xs sm:text-sm text-slate-605 leading-relaxed font-normal font-sans">
                        Character alignment and personal systems. Establishing healthy, structured daily habits, productivity pipelines, moral values, and goal-mapping trackers. Transforming high intellect into disciplined operational consistency.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-amber-655 block pt-6 border-t border-slate-200 mt-6 md:mt-8 uppercase">🎯 Intentional Habits</span>
                  </div>

                  {/* Lead card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:border-amber-500/40 transition-all shadow-sm flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
                        <Award size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 uppercase font-display">3. Lead Right</h3>
                      <p className="text-xs sm:text-sm text-slate-605 leading-relaxed font-normal font-sans">
                        Community mobilization and external excellence. Deploying acquired digital competencies, mentorship mechanisms, and project management skills to influence corporate spaces, schools, and civic communities.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-amber-660 block pt-6 border-t border-slate-200 mt-6 md:mt-8 uppercase">👑 Civic Influence</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-amber-500 uppercase tracking-tight text-sm">Philosophical Foundation</h4>
                      <p className="text-xs text-slate-350 max-w-xl">
                        &ldquo;Your thoughts shape your feelings, your feelings dictate your habits, and your habits write your leadership destiny. True development is sequence-perfect.&rdquo;
                      </p>
                    </div>
                    <button 
                      onClick={onOpenJoin}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs uppercase cursor-pointer"
                    >
                      Begin Mind Shift
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LEADERSHIP / TEAM SUB-VIEW */}
            {subView === "team" && (
              <div className="space-y-10 text-left">
                
                {/* Horizontal Category Tab Selector */}
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                  {[
                    { id: "all", label: "All Members" },
                    { id: "executive", label: "Executive Leadership" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-4 py-2.5 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedCategory === cat.id 
                          ? "bg-[#0E3A2F] text-[#FAF8F3]" 
                          : "bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredTeam.map((member) => (
                    <div
                      key={member.id}
                      className="group bg-slate-50 rounded-2xl border border-slate-105 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-amber-500/30 transition-all hover:shadow-lg"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div>
                        {/* Member avatar / monogram placeholder representation */}
                        <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#133F31]/10 via-transparent to-slate-950/70" />
                          
                          {member.photo ? (
                            <img 
                              src={member.photo} 
                              alt={member.name} 
                              className={`w-full h-full object-cover filter brightness-[90%] ${
                                member.id === "gracious_esther" 
                                  ? "object-[center_15%] scale-[1.2]" 
                                  : member.id === "olasunde_louis"
                                  ? "object-[center_18%]"
                                  : member.id === "ogeabana_esther"
                                  ? "object-[center_20%]"
                                  : "object-top"
                              }`}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-500/35 text-amber-500 rounded-2xl flex items-center justify-center text-xl font-black tracking-tighter shadow-md z-10 font-mono">
                              {member.name.split(" ").map(w => w[0]).join("")}
                            </div>
                          )}
                          
                          <span className="absolute bottom-2 left-3 bg-[#0E3A2F] text-[#FAF8F3] font-mono px-2 py-0.5 rounded text-[8px] tracking-wider uppercase z-10">
                            {member.category}
                          </span>
                        </div>

                        {/* Text Block */}
                        <div className="p-5 space-y-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-amber-600 font-mono font-bold tracking-widest uppercase block">{member.credentials}</span>
                            <h3 className="font-extrabold text-slate-900 text-sm uppercase leading-tight font-display">{member.name}</h3>
                            <p className="text-slate-500 text-2xs font-semibold leading-none">{member.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 italic">{member.role}</p>
                        </div>
                      </div>

                      {/* Card Bottom Panel */}
                      <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between mt-auto">
                        <span className="text-[9px] font-bold text-slate-550 uppercase truncate max-w-[120px]">{member.hubs[0]}</span>
                        <span className="text-[9px] text-[#0E3A2F] font-black uppercase leading-none hover:underline">Profile &rarr;</span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTeam.length === 0 && (
                    <div className="col-span-4 p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-250 text-slate-400 text-xs font-mono uppercase">
                      No registered contacts matching category filter.
                    </div>
                  )}
                </div>

                {/* Team Detail Modal with unified specifications */}
                <AnimatePresence>
                  {selectedMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMember(null)}
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-2xl bg-white border border-slate-200 overflow-hidden rounded-3xl shadow-2xl z-10 flex flex-col md:grid md:grid-cols-12 max-h-[85vh] text-left"
                      >
                        <button 
                          onClick={() => setSelectedMember(null)}
                          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-950 cursor-pointer shadow-md"
                        >
                          <X size={14} />
                        </button>

                        <div className="md:col-span-5 h-48 md:h-full relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden p-6 min-h-[192px] shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#133F31]/30 via-transparent to-slate-950/80 cursor-pointer" />
                          
                          {selectedMember.photo ? (
                            <img 
                              src={selectedMember.photo} 
                              alt={selectedMember.name} 
                              className={`w-full h-full object-cover filter brightness-[85%] absolute inset-0 ${
                                selectedMember.id === "gracious_esther" 
                                  ? "object-[center_15%] scale-[1.2]" 
                                  : selectedMember.id === "olasunde_louis"
                                  ? "object-[center_18%]"
                                  : selectedMember.id === "ogeabana_esther"
                                  ? "object-[center_20%]"
                                  : "object-top"
                              }`}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center text-2xl font-black tracking-tighter shadow-md z-10 mb-4 font-mono">
                              {selectedMember.name.split(" ").map(w => w[0]).join("")}
                            </div>
                          )}

                          <div className="absolute bottom-5 inset-x-5 flex flex-col text-white z-10 text-left">
                            <span className="text-[9px] font-mono tracking-widest font-extrabold text-amber-500 bg-amber-550/15 border border-amber-500/25 px-2 py-0.5 rounded self-start uppercase">{selectedMember.credentials}</span>
                            <h3 className="font-bold text-base mt-1.5 font-display uppercase">{selectedMember.name}</h3>
                          </div>
                        </div>

                        <div className="md:col-span-7 p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[50vh] md:max-h-[80vh]">
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#0E3A2F] font-black tracking-widest uppercase font-mono">{selectedMember.title}</span>
                            <h4 className="text-2xs font-semibold text-slate-805 uppercase leading-snug">{selectedMember.role}</h4>
                          </div>

                          <p className="text-2xs text-slate-650 leading-relaxed font-normal bg-slate-50 p-4 border border-slate-100 rounded-xl whitespace-pre-line font-sans">
                            &ldquo;{selectedMember.bio}&rdquo;
                          </p>

                          <div className="space-y-1 text-xs">
                            <span className="text-[9px] font-bold uppercase text-slate-400 block font-mono">Chapter Coordinates:</span>
                            <div className="flex flex-wrap gap-1">
                              {selectedMember.hubs.map((h, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100/80 rounded-lg text-[9px] text-slate-600 uppercase font-semibold">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-105 flex items-center justify-between text-2xs font-mono">
                            <a href={`mailto:${selectedMember.socials.email}`} className="text-slate-600 hover:text-amber-500 font-bold transition-colors">
                              Contact Email
                            </a>
                            <a href={selectedMember.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-650 hover:text-slate-900 font-bold transition-colors flex items-center gap-1">
                              <Linkedin size={11} className="text-blue-600" /> LinkedIn Profile
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </PageContainer>
    </div>
  );
}
