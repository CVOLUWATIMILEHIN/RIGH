import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Award, Star, Shield, Users, Mail, 
  MapPin, Clock, Calendar, CheckCircle2, ChevronRight, 
  Tv, Eye, Play, ExternalLink, ChevronDown
} from "lucide-react";
import CiiPage from "../CiiPage";
import YAPConference from "../YAPConference";
import G3ProgramPage from "../G3ProgramPage";
import { PageContainer } from "../PageContainer";

interface InitiativeViewsProps {
  subView: "cii" | "yap" | "g3" | "projects";
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

export default function InitiativeViews({ subView, onNavigate, onOpenJoin }: InitiativeViewsProps) {
  const [isCiiOnboarding, setIsCiiOnboarding] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    nyscState: "",
    callUpNo: "",
    batch: "Batch A 2026"
  });

  const handleSubmitCii = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSuccess(`Successfully Onboarded! Welcome, ${form.name}. You have been mapped to the ${form.nyscState} Command cohort of the Corper Impact Initiative. An admin confirmation has been sent to ${form.email} with WhatsApp and Telegram gateway links.`);
    setForm({
      name: "",
      email: "",
      nyscState: "",
      callUpNo: "",
      batch: "Batch A 2026"
    });
    setTimeout(() => {
      setSuccess("");
      setIsCiiOnboarding(false);
    }, 9000);
  };

  if (subView === "cii") {
    return <CiiPage onBack={() => onNavigate("home")} onOpenJoin={onOpenJoin} />;
  }

  if (subView === "yap") {
    return <YAPConference onBack={() => onNavigate("home")} onOpenJoin={onOpenJoin} />;
  }

  if (subView === "g3") {
    return <G3ProgramPage onBack={() => onNavigate("home")} onOpenJoin={onOpenJoin} />;
  }

  const subViewStr = subView as any;

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Background radial effects */}
      <div className="absolute top-20 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-brand-blue font-medium transition-colors cursor-pointer">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-700">Initiatives</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-brand-orange uppercase">{subViewStr} Page</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="initiatives-mobile-section-nav">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono mb-1.5">
            Initiatives Subsections Navigation
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase text-brand-blue tracking-wider shadow-xs focus:outline-none"
          >
            <span>
              {subViewStr === "cii" && "Corper Impact Initiative (CII)"}
              {subViewStr === "yap" && "Young Africans Purpose (YAP) Conference"}
              {subViewStr === "g3" && "G3 Program (God Growth Goals)"}
              {subViewStr === "projects" && "Community & Teen Outreach Projects"}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 text-slate-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 flex flex-col gap-1 text-left"
              >
                {[
                  { label: "Corper Impact Initiative (CII)", view: "initiatives-cii" },
                  { label: "Young Africans Purpose (YAP) Conference", view: "initiatives-yap" },
                  { label: "G3 Program (God Growth Goals)", view: "initiatives-g3" },
                  { label: "Community & Teen Outreach Projects", view: "initiatives-projects" }
                ].map((option) => {
                  const isActive = "initiatives-" + subViewStr === option.view;
                  return (
                    <button
                      key={option.view}
                      onClick={() => {
                        onNavigate(option.view);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-brand-blue text-white" 
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
        <div className="max-w-3xl space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-brand-orange uppercase bg-brand-orange/10 border border-brand-orange/20 px-3 py-1 rounded-lg">
            Flagship Initiative
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-blue font-display tracking-tight">
            {subViewStr === "cii" && "Corper Impact Initiative (CII)"}
            {subViewStr === "yap" && "Young Africans Purpose (YAP) Conference"}
            {subViewStr === "g3" && "G3 Series: God Growth Goals"}
            {subViewStr === "projects" && "Community & Teen Outreach Projects"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {subViewStr === "cii" && "Helping corps members strategically navigate NYSC life mentally, financially, and professionally. Transitioning from national service to global impact with clarity and competence."}
            {subViewStr === "yap" && "Our annual high-impact flagship conference gathering over 5,000+ African youth with industry speakers, career clinics, and leadership direction."}
            {subViewStr === "g3" && "A structured 5-weekend transformation fellowship running across December & January mapping spiritual conviction, professional systems, and 12-month execution plans."}
            {subViewStr === "projects" && "Dedicating hours to civic improvement, book giveaways, educational outreaches, and mentoring teenagers across secondary schools."}
          </p>
        </div>

        {/* Dynamic Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* Overview */}
            <div className="bg-slate-50 p-8 rounded-2xl space-y-4 border border-slate-200/80">
              <h3 className="font-bold text-brand-blue uppercase tracking-tight text-base">Overview</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {subViewStr === "cii" && "The Corper Impact Initiative (CII) is a structured academy designed for active NYSC corps members and recent graduates in Nigeria. Rather than losing momentum during the service year, we equip corps members to build exceptional digital skill sets, career positioning, and leadership discipline."}
                {subViewStr === "yap" && "The Young Africans Purpose (YAP) Conference is the flagship gathering for the next generation of African leaders. Young professionals, undergraduate cohorts, and industry experts meet to align leadership clarity, digital literacy plans, and professional excellence."}
                {subViewStr === "g3" && "G3 is our annual high-accountability system designed for goal execution. Operating across five Saturdays in December and January, G3 helps participants build strict operational systems, track weekly habit indicators, and join peer mastermind circles."}
                {subViewStr === "projects" && "We believe that sustainable transformation starts locally. Through community campaigns, book giveaways, school supplies, and mindset development sessions in secondary schools, Right-Minds Africa equips teenage students with leadership values, study systems, and growth character."}
              </p>
            </div>

            {/* Objectives */}
            <div className="space-y-6">
              <h3 className="font-bold text-brand-blue uppercase tracking-tight text-base">Strategic Objectives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Skill & Career Positioning", desc: "Acquiring high-demand professional competencies in communication, design, and project workflows." },
                  { title: "Financial Intelligence", desc: "Setting savings plans, career growth benchmarks, and sustainable income strategies." },
                  { title: "Accountability Mastery", desc: "Pairing cohorts into high-performance circles to track weekly productivity metrics." },
                  { title: "Generational Leadership", desc: "Encouraging peer mentorship, community volunteer chapters, and ethical excellence." }
                ].map((obj, i) => (
                  <div key={i} className="flex gap-3 text-left bg-white p-4 rounded-xl border border-slate-200/80">
                    <CheckCircle2 size={18} className="text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-brand-blue text-xs sm:text-sm">{obj.title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed mt-1">{obj.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Activities */}
            <div className="space-y-6">
              <h3 className="font-bold text-brand-blue uppercase tracking-tight text-base">Past Activities & Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Lagos State Career Bootcamp", info: "Reviewed 180+ CVs and matched 50+ recent graduates with active career opportunities." },
                  { title: "Ogbomoso Teen Mindset Outreach", info: "Donated 500+ books, leadership guides, and academic workbooks to public secondary school students." },
                  { title: "YAP Annual Mainstage", info: "Featured 24 industry speakers detailing leadership systems, career resilience, and execution." },
                  { title: "December G3 Mastermind", info: "Facilitated 12-month goal execution blueprints with weekly check-ins for 850+ fellows." }
                ].map((act, id) => (
                  <div key={id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <h4 className="font-bold text-brand-blue text-sm">{act.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{act.info}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Registration CTA */}
          <div className="lg:col-span-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl sticky top-28 shadow-sm">
            <div className="space-y-3">
              <span className="text-brand-orange font-bold font-mono text-xs tracking-wider uppercase block">Join Initiative</span>
              <h3 className="text-xl font-bold text-brand-blue">Apply / Register</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Join our regional and virtual cohorts to participate in upcoming outreach and mentorship activities.
              </p>
            </div>

            {subViewStr === "cii" && !isCiiOnboarding ? (
              <button 
                onClick={() => setIsCiiOnboarding(true)}
                className="mt-6 w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center block shadow-xs"
              >
                Onboard as NYSC Corper &rarr;
              </button>
            ) : subViewStr === "cii" && isCiiOnboarding ? (
              <form onSubmit={handleSubmitCii} className="space-y-4 mt-6">
                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                    {success}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-blue text-xs bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <input 
                    type="email" 
                    required
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-blue text-xs bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">NYSC Deployment State</label>
                  <input 
                    type="text" 
                    required
                    value={form.nyscState}
                    onChange={(e) => setForm({...form, nyscState: e.target.value})}
                    placeholder="e.g. Lagos, Oyo, Abuja"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-blue text-xs bg-white text-slate-900"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Onboard Cohort Now
                </button>
              </form>
            ) : (
              <button 
                onClick={() => onOpenJoin("corps_member")}
                className="mt-6 w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer block text-center shadow-xs"
              >
                Register & Join Now &rarr;
              </button>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2.5 text-[10px] text-slate-400">
              <Clock size={12} className="text-amber-500" />
              <span>We hold high-accountability standards. Vetting applies.</span>
            </div>
          </div>

        </div>

      </PageContainer>
    </div>
  );
}
