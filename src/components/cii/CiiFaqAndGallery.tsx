/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown, HeartHandshake } from "lucide-react";
import { CII_FAQS } from "./ciiData";
import Gallery from "../Gallery";

export default function CiiFaqAndGallery() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <>
      {/* SECTION: GALLERY */}
      <section className="bg-slate-50 py-16 lg:py-24 border-b border-slate-200" id="cii-gallery-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-3 py-1 rounded-md">
              COHORT MEMORIES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
              CII Social & Orientation Memories Live
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Flip through memories of our physical events, local orientation groups, skill camps, and group hangout moments. You can upload your own customized photos directly and preserve them in the official gallery!
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm p-4 sm:p-6">
            <Gallery defaultCategory="CII" />
          </div>

        </div>
      </section>

      {/* SECTION: FAQS */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-200" id="cii-faqs-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Intro */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">
                Inquiries Matrix
              </span>
              
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display uppercase tracking-tight">
                FAQs
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed">
                Detailed answers regarding NYSC mobilization cycles, active schedules, allowances, local states, and alumni referrals.
              </p>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-600">
                <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <HeartHandshake size={15} className="text-amber-600" /> Lifelong Fellowship Access
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Even after national service pass-out, certified fellows retain access to active job updates, circles, and alumni meetups.
                </p>
              </div>
            </div>

            {/* Right Column: Accordion */}
            <div className="lg:col-span-7 space-y-3">
              {CII_FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-colors ${
                      isOpen
                        ? "border-slate-400 bg-slate-50/70"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left px-5 py-4 cursor-pointer flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-900"
                    >
                      <span className="leading-snug">{faq.question}</span>
                      <div className={`p-1 rounded-md shrink-0 transition-transform ${isOpen ? "rotate-180 bg-slate-200" : "bg-slate-100"}`}>
                        <ChevronDown size={16} className="text-slate-600" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 mt-1">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
