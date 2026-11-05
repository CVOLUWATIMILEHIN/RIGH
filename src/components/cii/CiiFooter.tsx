/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Facebook } from "lucide-react";
import CiiLogo from "../CiiLogo";

interface CiiFooterProps {
  onBack: () => void;
  onNavigateSection: (id: string) => void;
  onSelectTrack: (track: "career" | "finance" | "mindset") => void;
}

export default function CiiFooter({ onBack, onNavigateSection, onSelectTrack }: CiiFooterProps) {
  return (
    <footer className="bg-slate-950 text-white py-14 border-t border-slate-800" id="cii-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Col 1 */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center">
              <CiiLogo variant="dark" size="sm" showTagline={false} className="h-10" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Helping active Nigerian serving youth corps members make standard mental stamina transitions, align emergency allowance wealth, and secure global placement pipelines right from local lodge stations.
            </p>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Curriculum Focus
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    onSelectTrack("career");
                    onNavigateSection("cii-tracks");
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  CV Cliniques & Global Contractor Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTrack("finance");
                    onNavigateSection("cii-tracks");
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Emergency Savings Locks Allocation
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTrack("mindset");
                    onNavigateSection("cii-tracks");
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Anxiety Management Conditioning
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection("cii-journey")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  National Service Welfare Consulting
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Alliance Contact Desk
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              For alumni donations, sponsorship requests, corporate partnerships profiles, or to request talent dossiers:
            </p>
            <div className="text-xs font-mono text-slate-200 pt-1 space-y-1">
              <p>
                📧 <a href="mailto:corpersimpactinitiative@gmail.com" className="hover:text-amber-400 underline">corpersimpactinitiative@gmail.com</a>
              </p>
              <p>
                📞 <a href="tel:+2348039809016" className="hover:text-amber-400 underline">+234 803 980 9016</a>
              </p>
              <p className="text-slate-400">
                📍 Lagos City Hub, Right Minds Africa Hub Secretariat
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} Corper Impact Initiative (CII) & Right Minds Africa Hub. All rights reserved. Registered socio-youth development association.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <button onClick={onBack} className="hover:text-white transition-colors uppercase cursor-pointer">
              RMA Home
            </button>
            <span>&bull;</span>
            <a
              href="https://www.facebook.com/corperimpacti"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors uppercase flex items-center gap-1"
            >
              <Facebook size={12} className="fill-current" /> Forum
            </a>
            <span>&bull;</span>
            <button onClick={() => onNavigateSection("cii-about")} className="hover:text-white transition-colors uppercase cursor-pointer">
              Curriculum
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
