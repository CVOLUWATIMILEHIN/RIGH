/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check } from "lucide-react";

export default function CiiEngineAndJourney() {
  const enginePillars = [
    {
      letter: "A",
      title: "Circle Masterminds (Every 10 Fellows)",
      desc: "You are placed into a custom circle of 10 active local corps members. Your circle meets weekly to crossexamine resume goals and submit savings metrics."
    },
    {
      letter: "B",
      title: "Weekly Submission Target Deadlines",
      desc: "No passive watching. Every Sunday, you submit concrete assignments: an initial resume draft, active budget charts, or your community service brief. Late entries are flagged."
    },
    {
      letter: "C",
      title: "Monthly HR Advisory critiques",
      desc: "Active corporate captains review submitted deliverables live. You receive candid feedback on where your profile slacks and how to scale it instantly."
    }
  ];

  const roadmapMilestones = [
    {
      period: "Camp Week",
      title: "Orientation & Psychological Alignment",
      desc: "Shedding academic safety assumptions. Immediately after leaving orientation camp, we introduce you to the 'Active Mindset Leader' thesis, helping you bypass the common 3-month post-camp procrastination drift."
    },
    {
      period: "Month 1-4",
      title: "Hard Skill Acquisition & Circle Launch",
      desc: "Choose and pursue masterclasses in verified virtual contractor tracks. Meet online with your appointed circle check-guide. Instantly set up automated, secure deposit locks tracking your allowance allocations."
    },
    {
      period: "Month 5-8",
      title: "Resume Teardowns & Remote Bidding clinics",
      desc: "Your personal information profile is overhauled inside the clinic. Work under global contractor coaches to set bid proposals on remote job networks, learning how to price roles in Dollars/Euros right from your lodge site."
    },
    {
      period: "Month 9-11",
      title: "Public CDS Consulting & Local Impact Projects",
      desc: "Apply leadership skill sets locally by launching visible community development service (CDS) projects that address global SDG directives, validating your coordination potential for future recruiters."
    },
    {
      period: "Discharge",
      title: "CII Talent Referral Gate Openings",
      desc: "Upon passing out, certified fellows receive direct entry into our private employer circle channel. We refer your vetted talent profiles directly, skipping saturated public pools for fast career positioning."
    }
  ];

  return (
    <>
      {/* SECTION: ACCOUNTABILITY ENGINE */}
      <section className="bg-slate-50 py-16 lg:py-24 border-b border-slate-200" id="cii-engine">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-3 py-1 rounded-md">
              Ecosystem Tech
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              The CII Accountability Engine
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Why does CII succeed where webinars fail? Because of our intensive accountability system. We do not let dry academic slacking slide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Engine */}
            <div className="lg:col-span-5 space-y-6">
              {enginePillars.map((pillar, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0 font-bold font-mono text-sm">
                    {pillar.letter}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {pillar.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Graphical Checklist */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider block">
                      YOUR ACTIVE ROADMAP
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Weekly Assignment Submission Grid
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider rounded font-mono">
                    DEADLINE: SUNDAY 11:59 PM
                  </span>
                </div>

                <div className="space-y-3">
                  
                  {/* Module 1 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-600 rounded text-white flex items-center justify-center shrink-0">
                        <Check size={13} className="stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Module 1: Mental Toughness & Cognitive Reframing
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Personal value matrix questionnaire uploaded
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      APPROVED
                    </span>
                  </div>

                  {/* Module 2 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-600 rounded text-white flex items-center justify-center shrink-0">
                        <Check size={13} className="stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Module 2: Resume Teardown Clinic
                        </p>
                        <p className="text-[11px] text-slate-500">
                          PDF copy of tailorable global contractor format
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      APPROVED
                    </span>
                  </div>

                  {/* Module 3 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-amber-500 rounded text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        !
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Module 3: Alawee Goal-Lock Budgeting
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Submit link to secure high-yield bank lock snapshot
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      UNDER REVIEW
                    </span>
                  </div>

                  {/* Module 4 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-lg border border-slate-200 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-slate-300 rounded text-slate-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        -
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600">
                          Module 4: Global Sourcing bid Campaigns
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Set active bidding profile on global contract boards
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      LOCK
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION: NYSC MEMBER JOURNEY */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-200" id="cii-journey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">
              Fellowship Roadmap
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              The NYSC Member Growth Lifecycle
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Take a look at how we align our intensive mentorship directly with the standard NYSC calendar, from camp check-in to POP discharge day.
            </p>
          </div>

          {/* Sequential Timeline List */}
          <div className="relative max-w-3xl mx-auto border-l-2 border-slate-200 pl-6 sm:pl-10 space-y-10">
            {roadmapMilestones.map((item, idx) => (
              <div key={idx} className="relative space-y-2">
                {/* Milestone dot marker */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-sm" />
                
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                  {item.period}
                </span>

                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  {item.title}
                </h4>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
