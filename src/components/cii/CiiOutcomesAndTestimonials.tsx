/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { CII_TESTIMONIALS, CII_PARTNERS } from "./ciiData";

export default function CiiOutcomesAndTestimonials() {
  const [selectedCohort, setSelectedCohort] = useState<"c3" | "c4" | "c5">("c5");
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const cohortData = {
    c3: {
      year: "2024",
      label: "Cohort 3 (2024)",
      completed: "420 Fellows",
      placed: "82% Hired",
      savings: "₦24.5M",
      topField: "Customer Ops"
    },
    c4: {
      year: "2025",
      label: "Cohort 4 (2025)",
      completed: "850 Fellows",
      placed: "86% Hired",
      savings: "₦38.2M",
      topField: "Product Support"
    },
    c5: {
      year: "2026",
      label: "Cohort 5 (2026)",
      completed: "1,200 Fellows",
      placed: "89% Hired",
      savings: "₦52.0M",
      topField: "Digital Marketing"
    }
  };

  const currentCohort = cohortData[selectedCohort];
  const currentTestimonial = CII_TESTIMONIALS[testimonialIndex];

  return (
    <>
      {/* SECTION: OUTCOMES & METRICS */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-200" id="cii-outcomes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">
              Performance Audits
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              Data-Backed Success Outcomes
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              We measure success by hard career and financial metrics, audited cohort by cohort.
            </p>
          </div>

          {/* Cohort Selector */}
          <div className="flex justify-center gap-2 mb-10">
            {(["c3", "c4", "c5"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCohort(key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  selectedCohort === key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cohortData[key].label}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-14">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Graduates</span>
              <p className="text-2xl font-black text-slate-900 font-display mt-1">{currentCohort.completed}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Placement Rate</span>
              <p className="text-2xl font-black text-emerald-600 font-display mt-1">{currentCohort.placed}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Savings Mobilized</span>
              <p className="text-2xl font-black text-amber-600 font-display mt-1">{currentCohort.savings}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Top Field</span>
              <p className="text-2xl font-black text-slate-900 font-display mt-1">{currentCohort.topField}</p>
            </div>
          </div>

          {/* Compensation Comparison Chart */}
          <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                COMPENSATION COMPARISON
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                Monthly Post-Service Compensation Comparison
              </h4>
            </div>

            <div className="space-y-4">
              {/* Drift */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">Non-CII Drift (Standard local role)</span>
                  <span className="font-mono font-bold text-slate-700">₦45,000 / mo</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              {/* Cohort 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">CII Certified (Cohort 3 - Remote Ops)</span>
                  <span className="font-mono font-bold text-slate-900">₦150,000 / mo</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: "68%" }} />
                </div>
              </div>

              {/* Cohort 4 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">CII Certified (Cohort 4 - Customer Success)</span>
                  <span className="font-mono font-bold text-slate-900">₦195,000 / mo</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full" style={{ width: "88%" }} />
                </div>
              </div>

              {/* Cohort 5 Target */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-900">CII Certified (Cohort 5 Target - Global Contractor)</span>
                  <span className="font-mono font-bold text-amber-600">₦220,000 / mo</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Partner Alliances Strip */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="text-center mb-8">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Organizations & Alliances in the CII Network
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CII_PARTNERS.map((partner, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-1">
                  <p className="text-xs font-bold text-slate-900">{partner.label}</p>
                  <p className="text-[11px] text-slate-500">{partner.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: TESTIMONIALS */}
      <section className="bg-slate-50 py-16 lg:py-24 border-b border-slate-200" id="cii-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-3 py-1 rounded-md">
              Fellow Perspectives
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              Alumni In Their Own Words
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Real corps members who turned their service year into career breakthroughs.
            </p>
          </div>

          {/* Testimonial Card & Carousel */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-8 sm:p-10 relative">
            <div className="space-y-6">
              
              {/* Stars & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(currentTestimonial.stars)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                  {currentTestimonial.badge}
                </span>
              </div>

              {/* Quote */}
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed italic font-normal">
                "{currentTestimonial.text}"
              </p>

              {/* Author & Result */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {currentTestimonial.initials}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{currentTestimonial.name}</h5>
                    <p className="text-xs text-slate-500">{currentTestimonial.role}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-auto">
                  {currentTestimonial.placement}
                </span>
              </div>

            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => setTestimonialIndex((prev) => (prev > 0 ? prev - 1 : CII_TESTIMONIALS.length - 1))}
                aria-label="Previous testimonial"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                {CII_TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestimonialIndex(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === testimonialIndex ? "w-6 bg-slate-900" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTestimonialIndex((prev) => (prev < CII_TESTIMONIALS.length - 1 ? prev + 1 : 0))}
                aria-label="Next testimonial"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
