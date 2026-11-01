import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Layers, 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  X, 
  ArrowRight,
  Target,
  Compass,
  Check,
  Globe2,
  ChevronRight
} from "lucide-react";
import { HistoricalRecord } from "../../types";
import heroAfricanYouths from "../../assets/images/hero_african_youths_1779772519831.png";
import heroSeminar from "../../assets/images/hero_classroom_seminar_v2_1779787242101.png";

interface AboutOverviewRedesignProps {
  onNavigate: (view: string) => void;
  onOpenJoin: () => void;
  records: HistoricalRecord[];
  loadingRecords: boolean;
  timelineFilter: string;
  setTimelineFilter: (filter: string) => void;
}

export default function AboutOverviewRedesign({
  onNavigate,
  onOpenJoin,
  records,
  loadingRecords,
  timelineFilter,
  setTimelineFilter,
}: AboutOverviewRedesignProps) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{
    url: string;
    title: string;
    caption?: string;
  } | null>(null);

  const filteredRecords = records.filter(
    (r) => timelineFilter === "all" || r.category === timelineFilter
  );

  return (
    <div className="space-y-16 sm:space-y-24 text-left" id="about-overview-redesign-root">
      
      {/* =========================================================================
          1. HERO SECTION: Confident Editorial Entry Point with Authentic Imagery
         ========================================================================= */}
      <section 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0E2820] to-slate-950 text-white border border-slate-800/80 shadow-xl"
        id="about-hero-section"
      >
        {/* Subtle geometric backdrop pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Lead Statement */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles size={13} className="text-amber-400" />
                <span>RightMinds Africa Hub</span>
              </div>

              {/* H1 Main Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white font-display leading-[1.1]">
                Organization Overview
              </h1>

              {/* Exact Hero Lead Content */}
              <div className="border-l-2 border-amber-500/80 pl-4 sm:pl-6 py-1">
                <p className="text-base sm:text-lg lg:text-xl text-slate-200 leading-relaxed font-normal">
                  Raise and stimulate the mindset of a generation to become purpose-driven, growth-minded and highly productive leadership figures.
                </p>
              </div>

              {/* Quick Jump Anchors for Smooth In-Page UX */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <a
                  href="#who-we-are-section"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Who We Are</span>
                  <ChevronRight size={13} className="text-amber-400" />
                </a>
                <a
                  href="#core-value-promise-section"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Core Promise</span>
                  <ChevronRight size={13} className="text-amber-400" />
                </a>
                <a
                  href="#sdg-catalyst-section"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>SDG Catalyst</span>
                  <ChevronRight size={13} className="text-amber-400" />
                </a>
                <a
                  href="#historical-timeline-root"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Impact Timeline</span>
                  <ChevronRight size={13} className="text-amber-400" />
                </a>
              </div>
            </div>

            {/* Right Column: Authentic RMA Editorial Image Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
                <div className="aspect-[4/3] w-full bg-slate-800">
                  <img
                    src={heroAfricanYouths}
                    alt="RightMinds Africa young leaders and fellows in session"
                    className="w-full h-full object-cover object-center filter brightness-[95%] group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Subtle bottom gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Image caption badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white tracking-wide uppercase font-mono">
                      Continental Youth Leadership
                    </p>
                    <p className="text-[10px] text-slate-300">
                      RightMinds Africa Hub Cohort Sessions
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider">
                    RMA Hub
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ORGANIZATIONAL STORY: "Who We Are" in Balanced Editorial Composition
         ========================================================================= */}
      <section 
        className="relative pt-4 scroll-mt-24"
        id="who-we-are-section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Image Moment from Real Training Seminar */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-100">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={heroSeminar}
                  alt="RightMinds Africa interactive classroom seminar"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Capacity-Building in Action
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Empowering undergraduates, graduates, and young professionals across Nigeria.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Heading and Exact Narrative Text */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
                Identity & Origin
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 uppercase font-display tracking-tight">
                Who We Are
              </h2>
            </div>

            <div className="space-y-5 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              {/* Exact Paragraph 1 */}
              <p className="border-l-4 border-slate-900 pl-4 py-0.5">
                RightMinds Africa Hub is an independent, non-political youth development organization. We focus on personal transformation, mindset shifting, productivity coaching, and leadership training. We design programs specifically tailored to empower undergraduates, recent graduates, corps members, and young professionals.
              </p>
              
              {/* Exact Paragraph 2 */}
              <p className="text-slate-600">
                For years, Africa&apos;s potential has been hindered not by a lack of resources, but by a crisis of perspective. We believe systemic transformation begins internally—by cultivating young people who embrace lifelong resilience, reject mediocrity, and actively build character-led enterprises.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. OUR CORE VALUE PROMISE: High-Impact Editorial Feature Treatment
         ========================================================================= */}
      <section 
        className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 sm:p-12 lg:p-14 shadow-lg scroll-mt-24"
        id="core-value-promise-section"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center sm:text-left">
          
          {/* Section Subheading Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-widest">
            <Sparkles size={12} className="text-amber-400" />
            <span>OUR CORE VALUE PROMISE</span>
          </div>

          {/* Large Editorial Pull-Quote with Exact Quotation */}
          <blockquote className="relative">
            <span className="text-5xl sm:text-6xl text-amber-500/30 font-serif leading-none select-none block -mb-4">
              &ldquo;
            </span>
            <p className="text-lg sm:text-2xl lg:text-3xl text-white font-medium italic leading-relaxed sm:leading-snug tracking-tight">
              &ldquo;We refuse to allow young Africans to be defined by background limitations. We empower minds to design outstanding professional futures with self-belief, digital agility, and unwavering character.&rdquo;
            </p>
          </blockquote>

          <div className="pt-2 flex items-center gap-3">
            <div className="h-0.5 w-12 bg-amber-500" />
            <p className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              RightMinds Africa Founding Doctrine
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. GLOBAL ALIGNMENT & SDG CATALYST: Modern Structured Grid Composition
         ========================================================================= */}
      <section 
        className="relative rounded-3xl bg-slate-50 border border-slate-200/80 p-6 sm:p-10 lg:p-12 scroll-mt-24"
        id="sdg-catalyst-section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Paragraph, and CTA */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-2">
              <span className="text-amber-600 font-bold font-mono text-xs tracking-widest uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
                Global Alignment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-display tracking-tight text-slate-900">
                SDG Catalyst
              </h2>
            </div>

            {/* Exact Paragraph */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              RightMinds Africa is fully integrated with the United Nations Sustainable Development Goals (SDGs), focusing actively on:
            </p>

            {/* CTA Button with Exact Label & Function */}
            <div className="pt-2">
              <button 
                onClick={onOpenJoin}
                id="about-overview-join-cta"
                className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold rounded-xl transition-all duration-200 text-xs uppercase tracking-wider shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Join the Movement</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

          {/* Right Column: Structured SDG Goals Showcase */}
          <div className="lg:col-span-7 space-y-3.5">
            
            {/* SDG 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 transition-colors shadow-xs flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-rose-500 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
                <span className="text-[10px] font-mono leading-none opacity-80 uppercase">SDG</span>
                <span className="text-lg leading-none font-display">4</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600">Goal 4 Target</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Quality Education &amp; Mindset Development
                </h4>
              </div>
            </div>

            {/* SDG 8 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 transition-colors shadow-xs flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
                <span className="text-[10px] font-mono leading-none opacity-80 uppercase">SDG</span>
                <span className="text-lg leading-none font-display">8</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">Goal 8 Target</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Decent Work, Career Readiness &amp; Growth
                </h4>
              </div>
            </div>

            {/* SDG 17 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-colors shadow-xs flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
                <span className="text-[10px] font-mono leading-none opacity-80 uppercase">SDG</span>
                <span className="text-lg leading-none font-display">17</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">Goal 17 Target</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Partnerships for Generational Goals
                </h4>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. LEGACY & IMPACT RECORDS TIMELINE: Interactive Historical Milestones
         ========================================================================= */}
      <section className="space-y-8 scroll-mt-24" id="historical-timeline-root">
        
        {/* Section Header */}
        <div className="border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
              Archival Provenance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase font-display tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-amber-500" size={24} />
              Legacy &amp; Impact Records Timeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Browse our historical milestones, cohort success stories, core training sessions, and leadership summits since genesis.
            </p>
          </div>
        </div>

        {/* Horizontal Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none select-none">
          {[
            { id: "all", label: "All Achievements", icon: Layers },
            { id: "program", label: "Monthly Programs", icon: Clock },
            { id: "conference", label: "Conferences / YAP", icon: Award },
            { id: "training", label: "Trainings", icon: BookOpen },
            { id: "cohort", label: "CII Cohorts", icon: CheckCircle2 },
            { id: "success_story", label: "Success Stories", icon: TrendingUp },
            { id: "leadership_program", label: "Leadership Programs", icon: Sparkles },
          ].map((btn) => {
            const isActive = timelineFilter === btn.id;
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                id={`timeline-filter-${btn.id}`}
                onClick={() => setTimelineFilter(btn.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon size={14} className={isActive ? "text-amber-400" : "text-slate-500"} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeline Content */}
        {loadingRecords ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-slate-50 rounded-3xl border border-slate-100">
            <RefreshCw className="animate-spin text-amber-500" size={28} />
            <p className="text-xs text-slate-500 font-mono font-medium">Synchronizing legacy timelines...</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 pl-6 ml-4 sm:pl-10 sm:ml-6 space-y-12 pt-2">
            
            {filteredRecords.map((record) => (
              <div key={record.id} className="relative group transition-all">
                
                {/* Milestone Node on Left Timeline Bar */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white border-4 border-amber-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                  
                  {/* Left Column: Year and Timeline Date */}
                  <div className="lg:col-span-3">
                    <div className="sticky top-28 space-y-1">
                      <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 font-mono text-xs font-black rounded-lg uppercase tracking-widest border border-amber-500/20">
                        {record.year}
                      </span>
                      {record.timelineDate && (
                        <p className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                          {record.timelineDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Record Card Content */}
                  <div className="lg:col-span-9 bg-white border border-slate-200/90 hover:border-slate-300 p-6 sm:p-8 rounded-3xl transition-all duration-200 shadow-xs hover:shadow-sm">
                    <div className="space-y-4">
                      
                      {/* Title & Category Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg uppercase tracking-tight font-display">
                          {record.title}
                        </h4>
                        <span className="text-[9px] font-black uppercase font-mono tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded-md">
                          {record.category.replace("_", " ")}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {record.description}
                      </p>

                      {/* Impact Metrics & Tags */}
                      {(record.impactMetrics || (record.tags && record.tags.length > 0)) && (
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          {record.impactMetrics && (
                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                              <TrendingUp size={13} className="text-amber-600" />
                              <span>{record.impactMetrics}</span>
                            </div>
                          )}

                          {record.tags && record.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {record.tags.map((tag, tIdx) => (
                                <span 
                                  key={tIdx} 
                                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Legacy Gallery Showcase */}
                      {record.galleryImages && record.galleryImages.length > 0 && (
                        <div className="pt-4 mt-2">
                          <p className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span>📸 Legacy Gallery Artifacts ({record.galleryImages.length})</span>
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {record.galleryImages.map((img, gIdx) => (
                              <button
                                key={gIdx}
                                type="button"
                                onClick={() => setSelectedGalleryImage({ url: img, title: record.title })}
                                className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group/img cursor-zoom-in text-left block w-full"
                              >
                                <img
                                  src={img}
                                  alt={`${record.title} snapshot ${gIdx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=60";
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold">
                                  <span>View &rarr;</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="py-16 text-center text-slate-500 font-sans text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No matching legacy records found in this category.
              </div>
            )}

          </div>
        )}

      </section>

      {/* =========================================================================
          LIGHTBOX MODAL FOR GALLERY ARTIFACTS
         ========================================================================= */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    {selectedGalleryImage.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGalleryImage(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close image preview"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
                <img
                  src={selectedGalleryImage.url}
                  alt={selectedGalleryImage.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
