/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Award, BookOpen, Clock, Users, ArrowUpRight, CheckCircle2, Trophy, Sparkles } from "lucide-react";
import { INITIATIVES } from "../types";
import CiiLogo from "./CiiLogo";
import PageContainer from "./PageContainer";

interface InitiativesProps {
  onOpenJoin: (profile?: string) => void;
  onViewCii?: () => void;
  onViewSeminars?: () => void;
  onViewG3?: () => void;
}

export default function Initiatives({ onOpenJoin, onViewCii, onViewSeminars, onViewG3 }: InitiativesProps) {
  return (
    <section id="initiatives" className="py-20 bg-brand-light relative overflow-hidden border-t border-b border-gray-150/40">
      {/* Visual background accents */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <PageContainer>
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.0 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-black tracking-widest uppercase">
            <Trophy size={12} className="text-brand-gold mr-1" /> OUR PROGRAM SUITE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-blue tracking-tight font-display">
            Targeted Development Pathways for Generational Leadership
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            We do not believe in one-size-fits-all mentorship. We design custom programs targeting specific developmental crossroads of African youths.
          </p>
        </div>

        {/* Dynamic Initiatives Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {INITIATIVES.map((item) => {
            const isCII = item.id === "cii";
            const isSeminars = item.id === "seminars";
            const isG3 = item.id === "g3";
            const isTeens = item.id === "teen-minds";
            const isReinvention = item.id === "reinvention";
            
            const Icon = isCII ? Award : isSeminars ? Users : isG3 ? Trophy : isReinvention ? Sparkles : BookOpen;
            const buttonProfile = isCII ? "corps_member" : isSeminars ? "young_professional" : isTeens ? "teen" : isReinvention ? "corps_member" : "mentor";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
              >
                {/* Visual Header Grid Accent */}
                <div className="p-6 md:p-8 space-y-5 flex-1">
                  
                  {/* Category badge & quick stats */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${
                      isCII || isSeminars || isReinvention ? "text-brand-blue bg-brand-blue/5" : "text-brand-orange bg-brand-orange/5"
                    }`}>
                      {item.badge}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      <Users size={12} /> {item.stats}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl shrink-0 ${
                      isCII || isSeminars || isReinvention ? "bg-brand-blue text-white" : "bg-brand-orange text-white"
                    }`}>
                      <Icon size={24} className="stroke-[2.5]" />
                    </div>
                    <div>
                      {isCII ? (
                        <div className="flex items-center">
                          <CiiLogo variant="light" size="sm" showTagline={false} className="h-10 -ml-2" />
                        </div>
                      ) : (
                        <h3 className="text-xl sm:text-2xl font-extrabold text-brand-blue tracking-tight hover:text-brand-orange transition-colors uppercase">
                          {item.title}
                        </h3>
                      )}
                      <p className="text-[11px] text-gray-400 font-bold tracking-wider uppercase mt-0.5 font-mono">
                        Primary Target: {item.beneficiaries}
                      </p>
                    </div>
                  </div>

                  {/* Long Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {/* Bullet Objectives */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">Key Directives & Skills:</p>
                    <ul className="space-y-2">
                      {item.objectives.map((obj, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-gray-600 items-start">
                          <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${
                            isCII || isSeminars || isReinvention ? "text-brand-blue" : "text-brand-orange"
                           }`} />
                          <span className="leading-relaxed">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Footer action trigger */}
                <div className="px-6 py-5 md:px-8 bg-zinc-50 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock size={13} /> Cohort active next month
                  </div>

                  <div className="flex items-center gap-2">
                    {isCII && onViewCii && (
                      <button
                        onClick={onViewCii}
                        className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-brand-blue/20 text-brand-blue bg-white hover:bg-brand-blue/5 transition-all flex items-center gap-1 cursor-pointer"
                        title="Explore Full Program Syllabus"
                      >
                        Explore Program Details
                      </button>
                    )}
                    {isSeminars && onViewSeminars && (
                      <button
                        onClick={onViewSeminars}
                        className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-brand-blue/20 text-brand-blue bg-white hover:bg-brand-blue/5 transition-all flex items-center gap-1 cursor-pointer"
                        title="View Seminaries Calendar"
                      >
                        View Seminar Schedule
                      </button>
                    )}
                    {isG3 && onViewG3 && (
                      <button
                        onClick={onViewG3}
                        className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-brand-orange/20 text-brand-orange bg-white hover:bg-brand-orange/5 transition-all flex items-center gap-1 cursor-pointer"
                        title="See December G3 Layout"
                      >
                        See G3 Schedule
                      </button>
                    )}
                    {!isCII && (
                      <button
                        onClick={() => {
                          if (isSeminars && onViewSeminars) {
                            onViewSeminars();
                          } else if (isG3 && onViewG3) {
                            onViewG3();
                          } else {
                            onOpenJoin(buttonProfile);
                          }
                        }}
                        id={`join-initiative-btn-${item.id}`}
                        className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md ${
                          isCII || isSeminars || isReinvention
                            ? "bg-brand-blue hover:bg-brand-blue/95 text-white"
                            : "bg-brand-orange hover:bg-brand-orange/95 text-white"
                        }`}
                      >
                        {isSeminars || isG3 ? "Register & Secures Pass" : "Join Cohort"} <ArrowUpRight size={13} />
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
