/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Sparkles, Send, Award, ArrowUpRight } from "lucide-react";
import PageContainer from "./PageContainer";

interface CTABannerProps {
  onOpenJoin: (profile?: string) => void;
}

export default function CTABanner({ onOpenJoin }: CTABannerProps) {
  return (
    <section id="cta-banner" className="py-20 bg-brand-light relative overflow-hidden">
      <PageContainer className="relative z-10">
        
        {/* Rounded Full Gradient Frame */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-blue text-white shadow-xl py-12 px-6 sm:py-16 sm:px-12 text-center lg:text-left grid-mesh">
          {/* Radial color spotlight overlays */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Value Copy Block (Left-hand Column) */}
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1 text-xs font-black tracking-widest text-brand-orange uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Sparkles size={11} className="text-brand-gold" /> START YOUR ADVENTURE
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight font-display">
                Start Your Growth Journey Today
              </h2>

              <p className="text-brand-softblue/85 text-xs sm:text-sm leading-relaxed max-w-xl">
                Ready to re-engineer your mental frameworks, build exceptional character habits, and explore structured career pathways? Lock down your seat in our next mentorship cohort now. Let's build purposeful futures together.
              </p>
            </div>

            {/* CTA Trigger Column (Right-hand Column) */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3 w-full">
              <button
                onClick={() => onOpenJoin("corps_member")}
                id="cta-active-onboard-btn"
                className="w-full px-8 py-3.5 bg-brand-orange hover:bg-brand-orange/95 text-white text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.03] select-none active:scale-95 text-center"
              >
                Join RMA Community (Register) <ArrowUpRight size={16} />
              </button>

              <div className="grid grid-cols-2 gap-2 w-full font-sans">
                <a
                  href="https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba56] text-white text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md hover:scale-[1.02] text-center"
                >
                  Join WhatsApp
                </a>
                <a
                  href="https://t.me/+_iA-Xr3CqEoyYzhk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md hover:scale-[1.02] text-center"
                >
                  Join Telegram
                </a>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-brand-softblue/60 font-mono tracking-wider">
                <Award size={12} className="text-brand-gold" /> OVER 10,000+ YOUTH REACHED SO FAR
              </div>
            </div>

          </div>
        </div>

      </PageContainer>
    </section>
  );
}
