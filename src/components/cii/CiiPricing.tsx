/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check } from "lucide-react";

interface CiiPricingProps {
  onSelectPlan: (plan: "waitlist" | "free" | "growth" | "impact") => void;
}

export default function CiiPricing({ onSelectPlan }: CiiPricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="bg-slate-50 py-16 lg:py-24 border-b border-slate-200" id="cii-pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-3 py-1 rounded-md">
            Access Tiers & Investment
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
            Approved Membership Framework
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Choose the tier that fits your commitment. Free Discover and PCM Waitlist keep core resources accessible, while our premium tracks provide high-touch accountability.
          </p>

          {/* Billing Toggle for Paid Tiers */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-500"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors focus:outline-none"
              aria-label="Toggle annual or monthly billing"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-6 bg-slate-900" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${billingCycle === "annual" ? "text-slate-900" : "text-slate-500"}`}>
              Annual Billing <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">SAVE UP TO 35%</span>
            </span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Plan 1: PCM Waitlist */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Path A &bull; Prospective
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">PCM Waitlist</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  For prospective corps members preparing for camp mobilization and seeking early preparation.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-3xl font-black text-slate-900 font-display">₦0</span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ Pre-Mobilization Only</span>
              </div>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access to NYSC mobilization preparation guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Monthly pre-camp orientation webinars</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority notification when official Cohort opens</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>General WhatsApp community network</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan("waitlist")}
              className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Join PCM Waitlist
            </button>
          </div>

          {/* Plan 2: Free Discover */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Path A &bull; Community
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Free Discover</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  For active corps members wanting self-paced access to standard resources.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-3xl font-black text-slate-900 font-display">₦0</span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ Free Forever</span>
              </div>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access to public community webinars</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Standard monthly newsletter & updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Self-guided CV preparation checklist</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Open Telegram & WhatsApp general channels</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan("free")}
              className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Join Free Community
            </button>
          </div>

          {/* Plan 3: Growth Member (Popular) */}
          <div className="bg-white rounded-xl border-2 border-slate-900 p-6 flex flex-col justify-between shadow-sm relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
              POPULAR TIER
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Path B &bull; Core Accelerator
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Growth Member</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  For active corps members committed to weekly skill development and focused accountability.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline">
                  <span className="text-3xl font-black text-slate-900 font-display">
                    {billingCycle === "monthly" ? "₦3,500" : "₦30,000"}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-1">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>
                {billingCycle === "annual" && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Save ₦12,000 billed annually</p>
                )}
              </div>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                  <span className="font-semibold text-slate-800">Everything in Free Discover</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>1 Selected Community Focus Track (Project, Skill, or Volunteer)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Weekly group check-ins and peer accountability circles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Discounted partner-led skill courses and certifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Curated freelance & digital job opportunity alerts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan("growth")}
              className="mt-6 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Select Growth Plan
            </button>
          </div>

          {/* Plan 4: Impact Fellow (VIP) */}
          <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
              VIP FELLOWSHIP
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Path C &bull; Elite Track
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Impact Fellow</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Our most comprehensive experience with direct 1-on-1 mentorship, CV clinics, and project funding pathways.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-baseline">
                  <span className="text-3xl font-black text-amber-400 font-display">
                    {billingCycle === "monthly" ? "₦7,000" : "₦55,000"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>
                {billingCycle === "annual" && (
                  <p className="text-[11px] text-amber-300 font-semibold mt-0.5">Save ₦29,000 billed annually</p>
                )}
              </div>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5 font-bold" />
                  <span className="font-semibold text-white">Everything in Growth Member</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Access up to 2 Community Focus Tracks simultaneously</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Personalized 1-on-1 CV clinic & ATS optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Direct project funding guidance & microgrant lookouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Verified Fellowship Certificate & LinkedIn endorsement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Exclusive bi-weekly leadership masterminds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-amber-300 font-medium">60-Day Placement Guarantee or 1 Month Free Extension</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan("impact")}
              className="mt-6 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Apply as Impact Fellow
            </button>
          </div>

        </div>

        {/* Community Network Banner */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-slate-900">
              Want to connect with other corps members first?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Join our active community channels on WhatsApp and Telegram to participate in open discussions, get mobilization advice, and connect with peers nationwide.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Join WhatsApp Community
            </a>
            <a
              href="https://t.me/+_iA-Xr3CqEoyYzhk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Join Telegram Channel
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
