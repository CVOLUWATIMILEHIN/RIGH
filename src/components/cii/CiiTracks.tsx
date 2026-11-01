/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Briefcase, DollarSign, GraduationCap } from "lucide-react";
import { CII_TRACKS } from "./ciiData";

interface CiiTracksProps {
  activeTrack: "career" | "finance" | "mindset";
  onTrackChange: (track: "career" | "finance" | "mindset") => void;
}

export default function CiiTracks({ activeTrack, onTrackChange }: CiiTracksProps) {
  const currentTrackData = CII_TRACKS[activeTrack];

  return (
    <section className="bg-white py-16 lg:py-24 border-b border-slate-200" id="cii-tracks">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">
            Active Pathways
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight uppercase">
            THREE GROWTH TRACKS
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            All tracks share the same accountability engine. Members choose one primary track at onboarding. Impact Fellows access all three.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-2xl mx-auto mb-12 border border-slate-200">
          <button
            onClick={() => onTrackChange("career")}
            id="tab-track-career"
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTrack === "career"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-50"
            }`}
          >
            <Briefcase size={15} /> Track 1: Project Impact
          </button>

          <button
            onClick={() => onTrackChange("finance")}
            id="tab-track-finance"
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTrack === "finance"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-50"
            }`}
          >
            <DollarSign size={15} /> Track 2: Skill Dev
          </button>

          <button
            onClick={() => onTrackChange("mindset")}
            id="tab-track-mindset"
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTrack === "mindset"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-50"
            }`}
          >
            <GraduationCap size={15} /> Track 3: Volunteer
          </button>
        </div>

        {/* Selected Track Detailed Display */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Track Info */}
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-slate-200 text-slate-800">
                CURRICULUM MODULE
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display leading-tight">
                {currentTrackData.title}
              </h3>

              <p className="text-sm text-slate-600 italic">
                "{currentTrackData.tagline}"
              </p>

              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block font-mono">
                  ACCOUNTABILITY ENGINE & CADENCE
                </span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {currentTrackData.cadence}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ACTUAL METRIC TARGET:
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">
                  {currentTrackData.metrics}
                </p>
              </div>
            </div>

            {/* Right Column: Focus Points Grid */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Core Modules Included:
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentTrackData.focusPoints.map((point, pi) => (
                  <div key={pi} className="bg-white p-5 rounded-lg border border-slate-200 space-y-1.5 hover:border-slate-300 transition-colors">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      0{pi + 1} &bull; {point.label}
                    </span>
                    <p className="text-xs text-slate-600 leading-normal">
                      {point.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
