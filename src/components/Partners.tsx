/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, GraduationCap, Globe, HeartHandshake } from "lucide-react";
import { PARTNERS } from "../types";

export default function Partners() {
  // Select helper icons for partners
  const getPartnerIcon = (type: string) => {
    switch (type) {
      case "gmi":
        return <Globe size={20} className="text-slate-400 group-hover:text-brand-orange transition-colors" />;
      case "nysc":
        return <GraduationCap size={20} className="text-slate-400 group-hover:text-brand-blue transition-colors" />;
      case "alu":
        return <ShieldCheck size={20} className="text-slate-400 group-hover:text-brand-blue transition-colors" />;
      default:
        return <HeartHandshake size={20} className="text-slate-400 group-hover:text-brand-gold transition-colors" />;
    }
  };

  // Duplicate list to create a seamless infinite carousel loop
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section id="partners" className="py-16 bg-slate-50/50 dark:bg-[#070C0A] border-y border-slate-100 dark:border-slate-900/40 overflow-hidden relative w-full">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee-scroll {
          display: flex;
          width: max-content;
          animation: scroll 25s linear infinite;
        }
        .animate-marquee-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-14 xl:px-16 2xl:px-[72px] max-w-full lg:max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1880px] 3xl:max-w-[2200px] mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono text-left">
          COLLABORATORS & COALITION BADGES
        </p>
      </div>

      {/* 100% Full Width Logo Carousel container */}
      <div className="relative w-full overflow-hidden">
        {/* Left/right shadow fade overlays */}
        <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#070C0A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#070C0A] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-scroll py-2 gap-6">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex items-center gap-4 px-6 py-4 border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/55 hover:border-brand-blue/30 dark:hover:border-brand-orange/40 shadow-sm transition-all cursor-default group shrink-0 min-w-[240px]"
            >
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 group-hover:shadow-inner shrink-0">
                {getPartnerIcon(partner.logoType)}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[12px] font-black text-brand-blue dark:text-white truncate uppercase tracking-wider font-display">
                  {partner.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 font-bold">
                  {partner.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
