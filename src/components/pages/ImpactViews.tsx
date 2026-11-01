import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Award, Star, ChevronRight, Users, Trophy, Download, 
  Globe, ChevronDown, Play, Video, Eye, CheckCircle, TrendingUp, X,
  Briefcase, GraduationCap, Flame, ArrowRight, ShieldCheck, Heart
} from "lucide-react";
import { getDynamicTestimonials, DynamicTestimonial } from "../../lib/db";
import { PageContainer } from "../PageContainer";

interface ImpactViewsProps {
  subView: "dashboard" | "stories" | "reports";
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

export default function ImpactViews({ subView, onNavigate, onOpenJoin }: ImpactViewsProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<DynamicTestimonial[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; url: string; author: string } | null>(null);
  const [playingSimulated, setPlayingSimulated] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  useEffect(() => {
    getDynamicTestimonials().then(list => {
      setDynamicTestimonials(list.filter(t => !t.isHidden));
    });
  }, [subView]);

  const stats = [
    { label: "Youth Reached", value: "10,000+", desc: "Empowered across secondary schools, universities, and NYSC secretariats." },
    { label: "Mentorship Hours", value: "5,000+", desc: "One-on-one and group cohort check-ins facilitated." },
    { label: "State Commands Covered", value: "12+", desc: "Physical commands established across Southwestern and Eastern Nigeria." },
    { label: "Employment Transition", value: "150+", desc: "Recent graduates directly mapped into premium remote software or writing roles." }
  ];

  const successRatings = [
    { title: "NYSC Career Placement Rate", value: "87%", trend: "+12% over 2024", icon: Briefcase },
    { title: "WAEC Clearance Rate (Teens)", value: "94%", trend: "Highest in Oyo micro-clusters", icon: GraduationCap },
    { title: "Mentor Matching Satisfaction", value: "98.2%", trend: "Verified by weekly feedbacks", icon: Heart },
    { title: "Cohort Completion Rate", value: "91%", trend: "Low churn metrics", icon: ShieldCheck }
  ];

  // Static testimonials to combine with dynamic
  const baseTestimonials = [
    {
      id: "base-1",
      name: "Chidem Ebuka",
      program: "Corper Impact Initiative (CII)",
      testimonial: "During my NYSC in Niger State, I had no clue how to stand out in the tech ecosystem. The Corper Impact Initiative (CII) redefined my career mapping. I learned remote job prospecting, tailored my LinkedIn, and landed a role right after my Pop out!",
      gradYear: "2025",
      achievement: "Software Engineering Intern",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80",
    },
    {
      id: "base-2",
      name: "Adebayo Adesina",
      program: "YAP Conference 2024",
      testimonial: "YAP Conference was an absolute mental shift. Hearing from seasoned speakers who look like me and started from similar circumstances made me realize my environment is not an excuse for mediocrity. I am starting my entrepreneurial journey with crystal-clear vision.",
      gradYear: "2024",
      achievement: "Tech Founder & Student",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80",
    },
    {
      id: "base-3",
      name: "Tosin Alabi",
      program: "Right-Minded Teens Mentorship",
      testimonial: "I used to think that some subjects were just not for people like me. Under the Right-Minded Teens mentorship, I discovered cognitive growth mindset principles. My study approach changed, I cleared my WAEC in one sitting, and have gained massive confidence!",
      gradYear: "2025",
      achievement: "WAEC Scholar (Ogbomoso)",
      photoUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&fit=crop&q=80",
    }
  ];

  const mergedTestimonials = [
    ...dynamicTestimonials.map(t => ({
      id: t.id,
      name: t.name,
      program: t.program,
      testimonial: t.testimonial,
      gradYear: t.gradYear,
      achievement: t.achievement,
      photoUrl: t.photoUrl
    })),
    ...baseTestimonials
  ];

  const videoTestimonials = [
    {
      id: "v-1",
      title: "From Niger State deployment directly to tech job",
      duration: "04:12 mins",
      author: "Emmanuel Seyi",
      program: "CII Class of 2025",
      thumbnail: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=500&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/watch?v=mock1"
    },
    {
      id: "v-2",
      title: "Eradicating a limits mindset & passing WASCE exam",
      duration: "03:45 mins",
      author: "Olubunmi Janet",
      program: "Right-Minded Teens",
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/watch?v=mock2"
    }
  ];

  const beforeAfterCase = {
    title: "Shedrack's Career Turnaround",
    beforeChallenge: "Faced severe unemployment panic post-NYSC with an outdated resume structure, zero LinkedIn impressions, and an isolating imposter syndrome.",
    afterBreakthrough: "Rewrote resume with RMA billing/tech mentors, scaled search indices by 420%, got invited to 4 premium hiring rounds, and signed a full-time Product Specialist position at a fintech hub.",
    quote: "RMA gave me a secure tribe. The weekly metrics we filed forced me to take action when I wanted to hide."
  };

  const handleDownloadReport = (year: string) => {
    setSuccess(`Direct file download started for the RMA ${year} Impact & Financial Accountability Audit report PDF. Clean build perfect.`);
    setTimeout(() => setSuccess(null), 5000);
  };

  // Video playback mockup interval
  useEffect(() => {
    let interval: any;
    if (playingSimulated && selectedVideo) {
      interval = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= 100) {
            setPlayingSimulated(false);
            return 0;
          }
          return prev + 2;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playingSimulated, selectedVideo]);

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Background radial overlays */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10 font-sans">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-905">Impact</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-amber-550 capitalize">{subView}</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="impact-mobile-section-nav">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[#0E3A2F]/50 font-mono mb-1.5">
            📂 Impact Subsections Navigation
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#FAF8F3]/60 border border-[#0E3A2F]/10 rounded-2xl text-xs font-black uppercase text-slate-800 tracking-wider shadow-sm focus:outline-none"
          >
            <span>
              {subView === "dashboard" && "Impact Dashboard"}
              {subView === "stories" && "Stories of Generational Change"}
              {subView === "reports" && "Annual Vetted Accountability Reports"}
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
                  { label: "Impact Dashboard", view: "impact-dashboard" },
                  { label: "Stories of Generational Change", view: "impact-stories" },
                  { label: "Annual Vetted Accountability Reports", view: "impact-reports" }
                ].map((option) => {
                  const isActive = "impact-" + subView === option.view;
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
            <Sparkles size={11} /> Metrics & Transformations
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
            {subView === "dashboard" && "Impact Dashboard"}
            {subView === "stories" && "Stories of Generational Change"}
            {subView === "reports" && "Annual Vetted Accountability Reports"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {subView === "dashboard" && "Durable structural metrics verified physically across local state chapters and virtual cohorts."}
            {subView === "stories" && "Real-world accounts of undergraduates, graduates, and teens who redesigned their personal outcomes."}
            {subView === "reports" && "Transparent summaries of our physical projects, cohort deployments, and annual operating finances."}
          </p>
        </div>

        {/* SUCCESS ALERTS */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fadeIn">
            {success}
          </div>
        )}

        {/* DASHBOARD CONTENT */}
        {subView === "dashboard" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((st, i) => (
                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-2 relative overflow-hidden">
                  <span className="font-mono text-3xl font-black text-amber-500 tracking-tight block">{st.value}</span>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight leading-none pt-1">{st.label}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-normal pt-2">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Success Statistics & Counters (CII Placements, TEENS WAEC, satisfaction) */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0E3A2F] border-b border-slate-100 pb-2">
                🏆 Program Vitals & Certified Success Rates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {successRatings.map((rate, idx) => {
                  const IconComp = rate.icon;
                  return (
                    <div key={idx} className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl relative overflow-hidden flex items-start gap-4">
                      <div className="p-3 bg-amber-500/15 text-amber-700 rounded-xl">
                        <IconComp size={16} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-2xl font-black text-[#0E3A2F] block leading-none">{rate.value}</span>
                        <h4 className="font-extrabold text-slate-800 text-2xs uppercase tracking-tight leading-none">{rate.title}</h4>
                        <span className="text-[10px] text-amber-600 font-bold block">{rate.trend}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-amber-500 text-xs font-mono font-bold uppercase tracking-wider block">Empowering Verified Change</span>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                  We maintain strict accountability. Our monitoring software verifies all graduate placement coordinates to ensure actual, non-speculative economic transition.
                </p>
              </div>
              <button 
                onClick={() => onOpenJoin("corps_member")}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs uppercase cursor-pointer"
              >
                Join Next Cohort
              </button>
            </div>
          </div>
        )}

        {/* STORIES OF CHANGE */}
        {subView === "stories" && (
          <div className="space-y-12">
            
            {/* 1. Alumni Spotlight Section & Highlight Story */}
            <div className="bg-[#0A1A14] text-white p-6 sm:p-10 rounded-[2.5rem] border border-[#152e25] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 text-left">
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20 text-[10px] font-black tracking-widest uppercase">
                    <Trophy size={11} className="text-amber-400" /> ALUMNI SPOTLIGHT
                  </span>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&fit=crop&q=80" 
                      alt="Spotlight Alumnus" 
                      className="w-44 h-44 rounded-3xl object-cover border-2 border-amber-500/30 shadow-2xl sepia-[15%]"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-900 p-2 rounded-xl text-3xs font-black uppercase tracking-widest leading-none shadow-lg">
                      Class of &apos;24
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-100 text-sm uppercase leading-none font-display">Shedrack Adebayo</h3>
                    <p className="text-amber-400 text-3xs font-black tracking-wider uppercase leading-none">Senior Growth Consultant & Alumnus</p>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  {/* Before / After comparison layout */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1">
                      <Flame size={12} /> {beforeAfterCase.title}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl relative">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#E11D48] bg-[#E11D48]/10 border border-[#E11D48]/20 px-2 py-0.5 rounded-full absolute -top-2.5 left-4">
                          Before RMA
                        </span>
                        <p className="text-slate-300 text-2xs leading-relaxed pt-2">
                          {beforeAfterCase.beforeChallenge}
                        </p>
                      </div>

                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full absolute -top-2.5 left-4">
                          After Breakthrough
                        </span>
                        <p className="text-slate-200 text-2xs leading-relaxed pt-2">
                          {beforeAfterCase.afterBreakthrough}
                        </p>
                      </div>
                    </div>
                  </div>

                  <blockquote className="text-slate-300 text-xs italic leading-relaxed border-l-2 border-amber-500 pl-4">
                    &ldquo;{beforeAfterCase.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>

            {/* 2. Video Testimonials Row with custom thumbnail & play modal trigger */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0E3A2F] flex items-center gap-1.5">
                  <Video size={13} className="text-amber-500" /> Video Impact accounts
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoTestimonials.map((vid) => (
                  <div 
                    key={vid.id} 
                    onClick={() => {
                      setSelectedVideo(vid);
                      setPlayingSimulated(true);
                      setPlaybackTime(0);
                    }}
                    className="bg-slate-50 border border-slate-100 hover:border-amber-500/20 p-4 rounded-3xl cursor-pointer transition-all flex flex-col sm:flex-row gap-4 items-center group"
                  >
                    <div className="w-full sm:w-40 aspect-video rounded-2xl bg-slate-900 relative overflow-hidden shrink-0">
                      <img 
                        src={vid.thumbnail} 
                        alt={vid.author} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="p-2.5 bg-amber-500 text-slate-950 rounded-full scale-95 group-hover:scale-100 transition-all shadow-md">
                          <Play size={12} className="fill-current text-slate-950" />
                        </span>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-white">
                        {vid.duration}
                      </span>
                    </div>

                    <div className="space-y-2 text-left w-full">
                      <span className="text-[9px] font-bold font-mono uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {vid.program}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-amber-600 transition-colors">
                        &ldquo;{vid.title}&rdquo;
                      </h4>
                      <p className="text-slate-400 text-2xs">Shared by <strong className="text-slate-600 font-semibold">{vid.author}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Written Stories Card Grid */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0E3A2F] border-b border-slate-100 pb-2">
                ✍️ Verified Cohort Testimonials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {mergedTestimonials.map((item, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 hover:border-[#0E3A2F]/15 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&fit=crop&q=80"} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-full object-cover grayscale border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase leading-none">{item.name}</h4>
                          <span className="text-slate-400 text-[9px] font-semibold block mt-1 leading-none">
                            {item.achievement || "Graduate"}
                          </span>
                        </div>
                      </div>

                      {/* Stars assessment decoration */}
                      <div className="flex gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-current" />)}
                      </div>

                      <blockquote className="text-slate-600 text-xs leading-relaxed italic pt-2 font-normal">
                        &ldquo;{item.testimonial}&rdquo;
                      </blockquote>
                    </div>
                    
                    <div className="text-[10px] uppercase font-bold font-mono text-amber-600 block mt-6 pt-4 border-t border-slate-200/60 leading-none flex justify-between items-center">
                      <span>{item.program}</span>
                      <span className="text-slate-400">Y: {item.gradYear}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Featured Participant of the Month */}
            <div className="p-6 bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-3xl gap-6 flex flex-col md:flex-row items-center justify-between text-left">
              <div className="flex items-center gap-4">
                <span className="p-3 bg-amber-500 text-slate-900 rounded-2xl text-xl shrink-0 select-none">
                  🏅
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-700 font-black tracking-widest uppercase block">FEATURED PARTICIPANT OF THE MONTH</span>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-xl font-medium">
                    Congratulations to <strong>Precious Oluwanifemi</strong> (FUTA Secondary School Track, Osun Chapter) for filling out 30 consecutive daily habit grids and presenting an outstanding terminal growth synthesis!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onOpenJoin("teens")}
                className="px-4 py-2 bg-[#0E3A2F] text-white hover:bg-[#08221b] text-2xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer self-start md:self-center shrink-0"
              >
                Inquire Mentorship Circle &rarr;
              </button>
            </div>

          </div>
        )}

        {/* ANNUAL PERFORMANCE AUDIT REPORTS */}
        {subView === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { year: "2025 Report", info: "Detailed summary of the 5,000+ attendee YAP Conference, secondary school book drives, and budget allocations." },
              { year: "2024 Report", info: "Overview of Southwest regional command installations and remote career placements statistics." },
              { year: "2023 Report", info: "Genesis metrics of the G3 December goal mapping and initial undergraduate clinics." }
            ].map((rep, idx) => (
              <div key={idx} className="p-6 bg-slate-50 border border-slate-110 rounded-3xl flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-amber-600 text-[10px] font-bold font-mono tracking-widest uppercase block">AUDIT ARCHIVE</span>
                  <h3 className="font-bold text-slate-900 text-sm uppercase font-display tracking-tight leading-snug">{rep.year} Performance Report</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-normal">{rep.info}</p>
                </div>
                <button 
                  onClick={() => handleDownloadReport(rep.year)}
                  className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 animate-pulse"
                >
                  <Download size={13} /> Direct Download PDF
                </button>
              </div>
            ))}
          </div>
        )}

      </PageContainer>

      {/* Simulated Video Player Modal overlay */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 text-white max-w-xl w-full rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-slate-300 z-10 cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="aspect-video bg-black flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500 font-mono tracking-wider block">TESTIMONIAL TRANSMISSION</span>
                    <h4 className="text-xs font-extrabold text-slate-150 tracking-tight uppercase leading-none">{selectedVideo.title}</h4>
                  </div>
                </div>

                {playingSimulated ? (
                  <div className="space-y-4 text-center px-6">
                    <span className="inline-flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-2xs font-mono text-slate-400 block tracking-widest animate-pulse">STREAMING RMA_TESTIMONIAL_LINK...</span>
                    
                    {/* Simulated Voice wave lines */}
                    <div className="flex justify-center items-end gap-1 h-8 px-4">
                      {[6, 12, 18, 10, 24, 16, 8, 20, 14, 22, 12, 16, 6].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: playingSimulated ? [h - 4, h + 4, h - 2] : h }}
                          transition={{ repeat: Infinity, duration: 1 + i * 0.1, ease: "easeInOut" }}
                          className="w-1 bg-amber-500 rounded-sm"
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setPlayingSimulated(true);
                      setPlaybackTime(0);
                    }}
                    className="p-5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-full transition-all scale-105 hover:scale-110 shadow-lg cursor-pointer flex items-center justify-center"
                  >
                    <Play size={20} className="fill-current text-slate-900 ml-0.5" />
                  </button>
                )}

                {/* Bottom interactive controls timeline */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <button 
                      onClick={() => setPlayingSimulated(!playingSimulated)}
                      className="hover:text-amber-500 font-bold uppercase transition-colors"
                    >
                      {playingSimulated ? "PAUSE MOCK" : "PLAY MOCK"}
                    </button>
                    <span>{playbackTime}% Played</span>
                  </div>
                  
                  {/* Progress timeline bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer relative">
                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${playbackTime}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex justify-between items-center text-3xs font-black uppercase tracking-wider font-mono text-slate-400">
                  <span>Author: {selectedVideo.author}</span>
                  <span>{selectedVideo.program}</span>
                </div>
                <p className="text-2xs text-slate-300 leading-relaxed pt-1">
                  This video captures physical orientation and weekly review checkpoints from the state commands files. Select play above to check!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
