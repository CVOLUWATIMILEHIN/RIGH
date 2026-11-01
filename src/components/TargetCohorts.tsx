/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  GraduationCap, 
  Users, 
  Sparkles, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  Activity, 
  CheckCircle,
  Building
} from "lucide-react";
import PageContainer from "./PageContainer";

interface TargetCohortsProps {
  onOpenJoin: (profile?: string, intent?: string) => void;
  onViewCii?: () => void;
}

export default function TargetCohorts({ onOpenJoin, onViewCii }: TargetCohortsProps) {
  const cohorts = [
    {
      id: "corps_member",
      title: "NYSC Corps Members Cohort (CII)",
      subtitle: "The Flagship Strategic Onramp",
      badge: "CII COHORT 5 LIVE",
      badgeColor: "bg-brand-orange/10 text-brand-orange border-brand-orange/20 animate-pulse",
      audience: "Deployed corps members & fresh graduates currently seeking transition guides.",
      focus: "Community onboarding, clarity systems, and structured support. Deep-dive transition strategy, remote job positioning, and purpose-driven career maps.",
      status: "ADMISSIONS OPEN",
      statusColor: "text-emerald-500",
      icon: GraduationCap,
      color: "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-brand-orange/40",
      iconColor: "text-brand-orange bg-brand-orange/10",
      ctaLabel: "Explore CII & Join"
    },
    {
      id: "teen",
      title: "Right-Minded Teens Academy",
      subtitle: "Formative Alignment Tracks",
      badge: "HIGH-SCHOOL COHORT",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      audience: "Secondary school students (SS1 - SS3) during prime developmental ages.",
      focus: "Formative alignment tracks: Overcoming peer drift, character molding, and early career path identification.",
      status: "SCREENING PROGRESS LIVE",
      statusColor: "text-indigo-500",
      icon: Sparkles,
      color: "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-purple-300",
      iconColor: "text-purple-600 bg-purple-50",
      ctaLabel: "Apply for Teenage Bootcamp"
    },
    {
      id: "student",
      title: "University Undergraduates Hub",
      subtitle: "Academic Excellence & Career Blueprinting",
      badge: "CAMPUS CHAPTERS ACTIVE",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      audience: "Current university students aiming for exceptional leadership and focus.",
      focus: "Undergraduate career blueprinting with Book a Clarity Session pathways. (Paid sessions with an introductory offer: Free for early sign-ups!)",
      status: "OPEN REGISTRATION",
      statusColor: "text-emerald-500",
      icon: Building,
      color: "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-emerald-300",
      iconColor: "text-emerald-600 bg-emerald-50",
      ctaLabel: "Book a Clarity Session"
    },
    {
      id: "student", // Maps to student/general student
      title: "Recent Graduates Mastermind",
      subtitle: "Transition to Workplace Competence",
      badge: "CAREER BOOTCAMP",
      badgeColor: "bg-blue-50 text-brand-blue border-blue-100",
      audience: "Graduates who recently completed degree work seeking job-readiness tracks.",
      focus: "Transition alignment, career positioning, and goal execution via Book a Clarity Session pathways. (Early applicants enjoy promotional free access!)",
      status: "COHORT FORMING",
      statusColor: "text-amber-500",
      icon: Briefcase,
      color: "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-brand-blue/40",
      iconColor: "text-brand-blue bg-blue-50",
      ctaLabel: "Book a Clarity Session"
    },
    {
      id: "mentor",
      title: "Volunteer Mentor Partner Circle",
      subtitle: "Generational Growth Builders",
      badge: "COACHES & LEADERS",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
      audience: "Professionals, teachers, and corporate leaders who want to give back.",
      focus: "Mentorship contribution, skill-based teaching, value contribution, and possible placement into structured growth circles.",
      status: "APPLICATIONS ACTIVE",
      statusColor: "text-rose-500",
      icon: Users,
      color: "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-rose-300",
      iconColor: "text-rose-600 bg-rose-50",
      ctaLabel: "Apply as Partner/Coach"
    }
  ];

  return (
    <section id="cohorts-highlight" className="py-20 bg-white relative overflow-hidden border-b border-gray-150/40">
      {/* Dynamic background blur elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-softblue/10 rounded-full blur-[120px] pointer-events-none" />
      
      <PageContainer className="relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-black tracking-widest rounded-full uppercase border border-brand-orange/20">
            <Activity size={12} className="animate-pulse" /> LIVE ENROLLMENT PATHWAYS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-blue tracking-tight font-display uppercase">
            ACTIVE TARGET COHORTS
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Our developmental paths are strictly optimized to resolve specific life stages. Meet the active cohorts currently shaping the future of young leaders across Nigeria.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort, index) => {
            const Icon = cohort.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(13,59,102,0.08)" }}
                className={`p-6 rounded-[2rem] border ${cohort.color} transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  {/* Top Line (Badge & Status indicator) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cohort.badgeColor}`}>
                      {cohort.badge}
                    </span>
                    <span className={`text-[9px] font-mono font-black uppercase flex items-center gap-1 ${cohort.statusColor}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                      {cohort.status}
                    </span>
                  </div>

                  {/* Icon & Heading Block */}
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-2xl shrink-0 ${cohort.iconColor}`}>
                      <Icon size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm sm:text-base leading-tight uppercase tracking-tight">
                        {cohort.title}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        {cohort.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Focus Details Container */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 font-bold block mb-0.5">Who this is for:</strong>
                      {cohort.audience}
                    </div>

                    <div className="p-3.5 bg-white/80 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#d97706] block">Core Curriculum & Mastery:</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {cohort.focus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Action button bottom */}
                <div className="pt-6">
                  {cohort.id === "teen" ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => onOpenJoin("teen", "bootcamp")}
                        className="flex-1 py-3 px-2 bg-brand-orange hover:bg-brand-orange/95 text-white rounded-xl flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        title="August Teenage Development Bootcamp - 2 Months"
                      >
                        Apply Bootcamp
                        <ArrowRight size={11} />
                      </button>
                      <button
                        onClick={() => onOpenJoin("teen", "clarity")}
                        className="flex-1 py-3 px-2 bg-white hover:bg-slate-50 border border-brand-blue/30 text-brand-blue rounded-xl flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        title="Book a dedicated Teenage Clarity Session"
                      >
                        Book Clarity
                        <Compass size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (cohort.id === "corps_member" && onViewCii) {
                          onViewCii();
                        } else {
                          onOpenJoin(cohort.id);
                        }
                      }}
                      className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-blue rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-brand-blue font-bold tracking-wide uppercase transition-all shadow-sm group cursor-pointer"
                    >
                      {cohort.ctaLabel}
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Core Trust Callout */}
        <div className="mt-12 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-6 text-center max-w-xl mx-auto">
          <p className="text-xs text-slate-550 leading-relaxed">
            All enrollment paths give individuals instant entry to accountability structures, monthly general mind rebuilding assemblies, and local state community chapters.
          </p>
        </div>

      </PageContainer>
    </section>
  );
}
