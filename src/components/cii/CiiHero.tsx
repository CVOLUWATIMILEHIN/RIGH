/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, ArrowUpRight, Activity } from "lucide-react";
import CiiLogo from "../CiiLogo";

interface CiiHeroProps {
  onApplyNow: () => void;
  onViewCurriculum: () => void;
}

export default function CiiHero({ onApplyNow, onViewCurriculum }: CiiHeroProps) {
  const bulletPoints = [
    "Standard Corporate Career Placement & CV Overhauls",
    "Alawee Wealth Multipliers and automated micro-savings templates",
    "Saturday Live Masterminds & mental stamina conditioning guides",
    "Direct talent network references with remote agencies",
  ];

  return (
    <section className="bg-white border-b border-slate-200 pt-8 pb-16 lg:py-20" id="cii-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Mission, Value, CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <div className="max-w-sm">
                <CiiLogo variant="full-color" size="lg" className="h-16 sm:h-20 w-auto" />
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold uppercase tracking-wider rounded-md">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                COHORT 5 APPLICATIONS ARE OPEN
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] uppercase font-display">
              THE ULTIMATE <span className="text-amber-600">12-MONTH</span> GROWTH ACCELERATOR
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Not an announcement board. Not a passive online course. CII is a fully funded, rigorous accountability ecosystem and hybrid career school that transforms your active NYSC service year into a springboard for remote placements, wealth building, and mental leadership.
            </p>

            {/* Bullets highlighting uniqueness */}
            <div className="space-y-2.5 pt-1">
              {bulletPoints.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium leading-normal">{bullet}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onApplyNow}
                id="hero-apply-btn"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                Apply for Admission <ArrowUpRight size={15} />
              </button>
              
              <button
                onClick={onViewCurriculum}
                id="hero-curriculum-btn"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                View curriculum
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                <a
                  href="https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hero-whatsapp-btn"
                  className="px-4 py-3 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  Join WhatsApp
                </a>
                <a
                  href="https://t.me/+_iA-Xr3CqEoyYzhk"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hero-telegram-btn"
                  className="px-4 py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  Join Telegram
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium pt-1">
              ⚡ Completely funded support. Absolutely no hidden fees or charges for verified active corps members.
            </p>
          </div>

          {/* Right Column: Clean Architectural Dashboard Interface */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 text-slate-100">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
                  <span className="text-xs text-slate-400 font-mono ml-2">cii-portal.rightmindafrica.org</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase rounded font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> LIVE SYNCING
                </span>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                
                {/* Member Identity Card */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center font-bold text-xs uppercase text-white">
                        CO
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Chidubem Okafor</h4>
                        <p className="text-xs text-slate-400">Cohort 5 | Lagos Lodge</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-700 text-slate-200 text-[10px] font-semibold uppercase tracking-wider rounded font-mono">
                      ACTIVE FELLOW
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-700/60 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lessons Done</span>
                      <p className="text-sm font-mono font-bold text-white mt-0.5">14 / 20</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Emergency Sav.</span>
                      <p className="text-sm font-mono font-bold text-amber-400 mt-0.5">₦145,000</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resume Score</span>
                      <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">94 / 100</p>
                    </div>
                  </div>
                </div>

                {/* Progress Velocity Bar */}
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Activity size={14} className="text-amber-500" /> Growth Program Velocity
                    </span>
                    <span className="text-slate-400 font-mono text-xs">75% Complete</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                {/* Next Live Encounter Card */}
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">NEXT LIVE ENCOUNTER</span>
                    <h5 className="text-xs font-bold text-white">Post-Graduation Anxiety Relief</h5>
                    <p className="text-[11px] text-slate-400">Interactive consultation with Gracious-Esther</p>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-center shrink-0">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">SUNDAY</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">6:00 PM</span>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                    ACCOUNTABILITY CIRCLE 12 ACTIVITY FEED
                  </span>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🚩 Tunde uploaded resume for clinic review.</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium">Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">💰 Mary created Alawee savings goal (₦15K/mo).</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium">Saved</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">📝 Musa scheduled mockup HR consulting prep.</span>
                      <span className="text-[10px] text-amber-400 font-mono font-medium">Pending</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
