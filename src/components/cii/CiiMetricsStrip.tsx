/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function CiiMetricsStrip() {
  const stats = [
    { value: "3,500+", label: "Fellows Mentored" },
    { value: "₦85M+", label: "SAVINGS GENERATED" },
    { value: "78%", label: "PLACEMENT SUCCESS" },
    { value: "450+", label: "REMOTE PLACEMENTS" }
  ];

  const networkPartners = [
    "Google-Startups",
    "TechQuest",
    "Stripe Partners",
    "LagosBiz Hub",
    "NYSC Network"
  ];

  return (
    <section className="bg-slate-50 py-10 border-b border-slate-200" id="cii-social-proof">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Key Numerical Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {stats.map((stat, idx) => (
            <div key={idx} className={`p-2 ${idx > 0 ? "pt-4 md:pt-2" : ""}`}>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 font-display leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-slate-600 uppercase font-bold tracking-wider mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Global Teams Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600 uppercase font-bold tracking-wider mb-4">
            CII LEADERS INTERN & WORK WITH GLOBAL TEAMS FROM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600">
            {networkPartners.map((item, idx) => (
              <span key={idx} className="font-extrabold text-xs sm:text-sm tracking-wider uppercase font-mono">
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
