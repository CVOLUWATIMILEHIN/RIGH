/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Briefcase, DollarSign, GraduationCap, ChevronRight, X, Check } from "lucide-react";

interface CiiAboutAndPromiseProps {
  onSelectTrack: (track: "career" | "finance" | "mindset") => void;
}

export default function CiiAboutAndPromise({ onSelectTrack }: CiiAboutAndPromiseProps) {
  const driftItems = [
    "Spontaneous alawee spending on temporary deliverables",
    "Submitting cold, basic academic CVs directly to saturated portals",
    "Dreading pop quizzes, interviews, or professional business assessments",
    "Zero structured mentorship or daily professional habits",
    "Post-NYSC drift: Months or years searching for remote pathways"
  ];

  const ecosystemItems = [
    "Access to structured growth opportunities",
    "Financial stability through skill acquisition and monetization",
    "Exposure to impactful projects and leadership development",
    "Access to guidance, accountability, and career-building systems",
    "A clearer pathway toward post-service opportunities and sustainability"
  ];

  return (
    <>
      {/* SECTION: ABOUT CII (MISSION & VALUE PROPOSITIONS) */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-200" id="cii-about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">
              Core Mission
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              The Core Strategy Behind The Alliance
            </h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
              Right Minds Africa Hub launched CII to transform the average service year from an idle period of career panic into an active year of competitive preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Career Track Card */}
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white border border-slate-200 text-slate-800 rounded-lg flex items-center justify-center">
                  <Briefcase size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  SaaS-Standard Career Acceleration
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Unlike typical workshops, we tear down your existing CV piece by piece. We train you in hard, high-income remote skill sets (customer service, remote operations, digital marketing) and get you ready for top hiring campaigns.
                </p>
              </div>
              <button
                onClick={() => onSelectTrack("career")}
                className="pt-6 border-t border-slate-200 mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors uppercase tracking-wider text-left cursor-pointer"
              >
                CAREER TRACK <ChevronRight size={14} />
              </button>
            </div>

            {/* Financial Track Card */}
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white border border-slate-200 text-slate-800 rounded-lg flex items-center justify-center">
                  <DollarSign size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Stamina Wealth Accumulation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Most corps members enter the service year with the intention of saving from their monthly allowance alone, but many eventually spend everything. Through CII, financial growth is driven not just by saving, but by skill acquisition, skill monetization, financial education, and practical income-generation systems taught throughout the program.
                </p>
              </div>
              <button
                onClick={() => onSelectTrack("finance")}
                className="pt-6 border-t border-slate-200 mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors uppercase tracking-wider text-left cursor-pointer"
              >
                FINANCIAL TRACK <ChevronRight size={14} />
              </button>
            </div>

            {/* Mindset Track Card */}
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white border border-slate-200 text-slate-800 rounded-lg flex items-center justify-center">
                  <GraduationCap size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Mindset Powerhouse
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Post-university anxiety slaughters career potential. Under direct advisory circles led by Gracious-Esther, we teach mental toughness, cognitive resilience protocols, and standard public presentation skill sets.
                </p>
              </div>
              <button
                onClick={() => onSelectTrack("mindset")}
                className="pt-6 border-t border-slate-200 mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors uppercase tracking-wider text-left cursor-pointer"
              >
                MINDSET TRACK <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: CORE PROMISE (TWO PATHS: THE DRIFT VS LAUNCHPAD) */}
      <section className="bg-slate-50 py-16 lg:py-24 border-b border-slate-200" id="cii-promise">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-3 py-1 rounded-md">
              The Reality Check
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              Two Paths After Camp: Choose Wisely
            </h2>
            <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
              What does your 12-month timeline look like? Let's contrast popular service-year behavior against the CII trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Path A: The Drift */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    The Standard Drift
                  </h3>
                  <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider rounded font-mono">
                    RISK ZONE
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-normal">
                  Without structured guidelines, peer circles, or direction during NYSC:
                </p>

                <div className="space-y-3 pt-1">
                  {driftItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-50 text-red-600 rounded flex items-center justify-center shrink-0 mt-0.5">
                        <X size={13} className="stroke-[3]" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium leading-normal">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 bg-red-50/50 p-4 rounded-lg">
                <p className="text-xs font-bold text-red-800 leading-normal">
                  Financial outcome: ₦0 Saved. CV rejected by ATS systems within 2 seconds.
                </p>
              </div>
            </div>

            {/* Path B: The CII Launchpad */}
            <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    The CII Ecosystem
                  </h3>
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider rounded font-mono">
                    COHORT LAUNCHPAD
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-normal">
                  By submitting your enrollment and committing to active peer circles:
                </p>

                <div className="space-y-3 pt-1">
                  {ecosystemItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} className="stroke-[3]" />
                      </div>
                      <span className="text-sm text-slate-200 font-medium leading-normal">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-800 bg-slate-800/80 p-4 rounded-lg">
                <p className="text-xs font-bold text-amber-300 leading-normal">
                  Outcome: Access to guidance, a high-caliber network, stable financial foundations via skill monetization, and a clear path to post-service success.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
