/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Users, Tv, Calendar, MapPin, Ticket, Flame, Award, ArrowLeft, Sparkles, ZoomIn, X, Download, Clock } from "lucide-react";
import { YAP_STATS, SPEAKERS } from "../types";
import yapSeminarImg from "../assets/images/nigerian_conference_1779791531024.png";
import yapFlyerImg from "../assets/images/yap_conference_2026_flyer.png";
import { PageContainer } from "./PageContainer";

interface YAPConferenceProps {
  onOpenJoin: (profile?: string) => void;
  onBack?: () => void;
}

export default function YAPConference({ onOpenJoin, onBack }: YAPConferenceProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  // Map lucide icons dynamically using a lookup map
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Mic":
        return <Mic size={22} className="text-brand-orange" />;
      case "Users":
        return <Users size={22} className="text-brand-blue" />;
      case "Tv":
        return <Tv size={22} className="text-brand-gold" />;
      default:
        return <Flame size={22} />;
    }
  };

  const handleOpenPopupFlyer = () => {
    window.dispatchEvent(new CustomEvent("rma_open_yap_flyer"));
  };

  return (
    <section id="yap-conference" className="py-20 md:py-28 bg-brand-light relative overflow-hidden min-h-screen">
      {/* Visual glowing backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-brand-blue text-sm text-slate-600 hover:text-brand-blue font-bold shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home Page
            </motion.button>
          )}

          <button
            onClick={handleOpenPopupFlyer}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Sparkles size={14} className="animate-pulse" />
            Launch Interactive Flyer Popup
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Visual Presentation Column (Left-hand Column) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange/10 border border-brand-orange/25 text-brand-orange text-xs font-black rounded-full uppercase tracking-wider">
              <Flame size={12} className="animate-pulse" /> ANNUAL FLAGSHIP SUMMIT 2026
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue leading-tight tracking-tight font-display uppercase">
              Young & Purposeful (YAP) Annual Conference
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
              YAP is our premier flagship annual conference designed specifically for undergraduates, recent graduates, and ambitious rising leaders across Nigeria. Discover career breakthroughs, strategic mentoring, mindset reframing, and divine purpose alignment.
            </p>

            {/* Event Details Card */}
            <div className="bg-brand-softblue/60 p-5 rounded-2xl border border-brand-blue/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs shadow-inner">
              <div className="flex gap-2.5 items-center">
                <Calendar size={16} className="text-brand-blue shrink-0" />
                <div>
                  <p className="font-extrabold text-brand-blue font-mono uppercase">Date & Timing</p>
                  <p className="text-slate-500 font-medium">November 2026 (Annually)</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center">
                <MapPin size={16} className="text-brand-orange shrink-0" />
                <div>
                  <p className="font-extrabold text-brand-blue font-mono uppercase">Summit Venue</p>
                  <p className="text-slate-500 font-medium font-sans">Nigeria & Global Live Streaming</p>
                </div>
              </div>
            </div>

            {/* Official High-Resolution Event Flyer Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-[#d97706] uppercase font-mono flex items-center gap-1.5">
                  <Sparkles size={14} /> Official Conference Flyer
                </span>
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="text-xs font-bold text-brand-blue hover:text-brand-orange flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ZoomIn size={13} /> View High-Res
                </button>
              </div>

              <div 
                onClick={() => setShowLightbox(true)}
                className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl bg-slate-950 p-2 group cursor-pointer"
                title="Click to zoom flyer full size"
              >
                <img
                  src={yapFlyerImg}
                  alt="Young and Purposeful (YAP) Conference 2026 Official Flyer"
                  className="w-full h-auto max-h-[480px] object-contain rounded-[1.6rem] transition-transform duration-500 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center pointer-events-none">
                  <span className="px-4 py-2 bg-slate-900/90 text-amber-300 text-xs font-black uppercase tracking-widest rounded-full shadow-lg border border-amber-300/30 flex items-center gap-2">
                    <ZoomIn size={14} /> Tap to expand full flyer
                  </span>
                </div>

                <div className="absolute top-5 left-5 inline-flex items-center gap-1 py-1 px-3 bg-amber-400 text-amber-950 text-[10px] font-black tracking-wider uppercase rounded-full shadow-md font-mono">
                  <Sparkles size={11} className="text-amber-950 animate-pulse" /> 2026 EDITION FLYER
                </div>
              </div>
            </div>
          </div>

          {/* Action and Statistics Board Column (Right-hand Column) */}
          <div className="lg:col-span-6 space-y-8 lg:pl-4">
            
            {/* statistics cards requested */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-black tracking-widest text-[#d97706] uppercase font-mono">Conference Milestones:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {YAP_STATS.map((stat) => (
                  <motion.div
                    key={stat.id}
                    whileHover={{ scale: 1.03 }}
                    className="p-4 bg-white rounded-2xl border border-slate-250 flex flex-col justify-between shadow-sm"
                  >
                    <div className="p-2.5 bg-brand-light rounded-xl border border-gray-150 w-fit">
                      {getIcon(stat.iconName)}
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl sm:text-3xl font-black text-brand-blue leading-none tracking-tight">
                        {stat.value}{stat.suffix}
                      </p>
                      <p className="text-xs font-bold text-gray-700 mt-1 leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Featured Speakers Spotlights */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">Advisory Panel Highlights:</h3>
                <span className="text-[10px] font-bold text-brand-orange uppercase">YAP Core Alumni</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SPEAKERS.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-150/85 hover:border-brand-blue/35 transition-colors bg-white hover:shadow-sm"
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-brand-softblue shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand-blue truncate">{s.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{s.role} &bull; <span className="font-semibold text-brand-orange">{s.organization}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Value proposition paragraph */}
            <div className="p-5 border-2 border-dashed border-brand-orange/20 rounded-2xl bg-brand-orange/[0.01] space-y-3">
              <h4 className="text-xs font-black uppercase text-brand-orange tracking-wider flex items-center gap-1">
                🏆 YAP Impact Declaration:
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Attendees receive structural mentoring tracks (Corporate Job Prospecting, Startup Blueprinting, Integrity Code Alignment) led by distinguished leaders. Over 92% of graduates trace their initial career breakout or value-clarity directly back to the YAP weekend experience.
              </p>
            </div>

            {/* Event CTA Ticket Button */}
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-950 text-xs shadow-sm">
                <Clock size={18} className="text-amber-700 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold block uppercase tracking-wide text-amber-900">
                    Delegate Registration Opening Soon
                  </span>
                  <p className="text-amber-800 text-[11.5px] leading-relaxed">
                    The registration portal is currently being finalized. Seat reservation will be activated shortly.
                  </p>
                </div>
              </div>

              <button
                disabled
                id="yap-ticket-btn"
                className="w-full py-4 px-4 bg-slate-200 border border-slate-300 text-slate-500 font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed text-sm uppercase tracking-wide opacity-90 select-none"
              >
                <Ticket size={16} className="text-slate-400" /> Seat Reservations Opening Soon
              </button>

              <button
                onClick={handleOpenPopupFlyer}
                type="button"
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs uppercase tracking-wider shadow-sm"
              >
                <Sparkles size={14} className="text-amber-500" /> View Event Flyer & Announcement
              </button>
            </div>

          </div>

        </div>
      </PageContainer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col items-center justify-center p-2 sm:p-4"
            >
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 z-30 p-2.5 text-slate-100 hover:text-white bg-slate-800/90 hover:bg-slate-800 rounded-full cursor-pointer shadow-xl border border-slate-600 transition-all hover:scale-110"
                title="Close flyer preview"
              >
                <X size={20} />
              </button>
              <img
                src={yapFlyerImg}
                alt="YAP Conference 2026 Full Flyer"
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-3 flex items-center justify-between w-full px-4 text-xs text-slate-400 font-mono">
                <span>Young & Purposeful (YAP) Conference 2026</span>
                <button
                  onClick={() => setShowLightbox(false)}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Close Lightbox
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
