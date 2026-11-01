import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Calendar, ArrowRight, MapPin, CreditCard, Users, ExternalLink } from "lucide-react";
import { getWebsitePopups, trackPopupEvent } from "../lib/db";
import { WebsitePopup } from "../types";
import yapConferenceFlyer from "../assets/images/yap_conference_2026_flyer.png";
import teenBootcampFlyer from "../assets/images/teen_bootcamp_2026_flyer.png";

interface WebsitePopupOverlayProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

// Memory set for popups dismissed in the current page load instance.
// Resets automatically whenever the page is reloaded in the browser.
const inMemoryDismissedPopups = new Set<string>();

export default function WebsitePopupOverlay({ currentView, onNavigate, onOpenJoin }: WebsitePopupOverlayProps) {
  const [activePopup, setActivePopup] = useState<WebsitePopup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullFlyerLightbox, setShowFullFlyerLightbox] = useState(false);

  useEffect(() => {
    const checkPopups = async () => {
      try {
        const list = await getWebsitePopups();
        // 1. Filter: must be active
        let candidates = list.filter((p) => p.active);

        if (candidates.length === 0) {
          setActivePopup(null);
          setIsOpen(false);
          return;
        }

        // 2. Filter: date range schedule check (if start/end dates specified)
        const now = new Date().getTime();
        candidates = candidates.filter((p) => {
          if (p.startDate) {
            const start = new Date(p.startDate).getTime();
            if (!isNaN(start) && now < start) return false;
          }
          if (p.endDate) {
            const end = new Date(p.endDate).getTime();
            if (!isNaN(end) && now > end) return false;
          }
          return true;
        });

        if (candidates.length === 0) {
          setActivePopup(null);
          setIsOpen(false);
          return;
        }

        // 3. Filter: target screen or page rule check
        candidates = candidates.filter((p) => {
          if (p.displayRule === "only_homepage" && currentView !== "home") {
            return false;
          }
          if (p.targetPages && p.targetPages !== "sitewide") {
            if (p.targetPages === "only_homepage" && currentView !== "home") return false;
            if (p.targetPages !== "sitewide" && p.targetPages !== currentView) {
              // Check partial path matches
              if (!currentView.includes(p.targetPages)) return false;
            }
          }
          return true;
        });

        if (candidates.length === 0) {
          setActivePopup(null);
          setIsOpen(false);
          return;
        }

        // 4. Filter: check dismissal rules
        candidates = candidates.filter((p) => {
          // If explicitly dismissed during this active page load session, hide until next reload/visit
          if (inMemoryDismissedPopups.has(p.id)) {
            return false;
          }

          // "every_visit" or "only_homepage" triggers every time the page is reloaded/visited
          if (p.displayRule === "every_visit" || p.displayRule === "only_homepage") {
            return true;
          }

          const dismissedAt = localStorage.getItem(`rma_popup_dismissed_${p.id}`);
          if (!dismissedAt) return true;

          const lastDismissed = parseInt(dismissedAt, 10);

          // If the popup has been updated since it was last dismissed, show it again
          if (p.updatedAt) {
            const updatedAtTime = new Date(p.updatedAt).getTime();
            if (updatedAtTime > lastDismissed) {
              return true;
            }
          }

          if (p.displayRule === "once_per_visitor") {
            return false;
          } else if (p.displayRule === "daily") {
            const oneDayMs = 24 * 60 * 60 * 1000;
            return Date.now() - lastDismissed > oneDayMs;
          }
          return true;
        });

        if (candidates.length === 0) {
          setActivePopup(null);
          setIsOpen(false);
          return;
        }

        // 5. Sort by priority (High -> Medium -> Low)
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        candidates.sort((a, b) => (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1));

        const selected = candidates[0];
        setActivePopup(selected);
        setImageError(false);

        // Immediate show with smooth entrance
        const timer = setTimeout(() => {
          setIsOpen(true);
          // Track view analytics event
          trackPopupEvent(selected.id, "view").catch(() => {});
        }, 300);

        return () => clearTimeout(timer);
      } catch (e) {
        console.warn("Could not synchronize popup overlays", e);
      }
    };

    checkPopups();

    const handleForceOpenYapFlyer = () => {
      import("../lib/db").then(({ YAP_CONFERENCE_POPUP }) => {
        setActivePopup(YAP_CONFERENCE_POPUP);
        setImageError(false);
        setIsOpen(true);
        trackPopupEvent(YAP_CONFERENCE_POPUP.id, "view").catch(() => {});
      });
    };

    window.addEventListener("rma_website_popups_updated", checkPopups);
    window.addEventListener("rma_open_yap_flyer", handleForceOpenYapFlyer);
    return () => {
      window.removeEventListener("rma_website_popups_updated", checkPopups);
      window.removeEventListener("rma_open_yap_flyer", handleForceOpenYapFlyer);
    };
  }, [currentView]);

  // Keyboard shortcut for closing via ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activePopup]);

  const handleDismiss = () => {
    if (!activePopup) return;
    setIsOpen(false);
    inMemoryDismissedPopups.add(activePopup.id);
    trackPopupEvent(activePopup.id, "close").catch(() => {});

    if (activePopup.displayRule === "once_per_visitor" || activePopup.displayRule === "daily") {
      localStorage.setItem(`rma_popup_dismissed_${activePopup.id}`, Date.now().toString());
    }
  };

  const handleAction = (targetLink: string) => {
    if (!activePopup || !targetLink) return;
    trackPopupEvent(activePopup.id, "click").catch(() => {});
    handleDismiss();

    const link = targetLink.toLowerCase();
    if (link.includes("yap") || link === "initiatives-yap" || link === "/yap") {
      onNavigate("initiatives-yap");
    } else if (link.includes("teen") || link.includes("bootcamp") || link === "teen-bootcamp" || link === "/teenager") {
      onNavigate("teen-bootcamp");
    } else if (link.includes("student") || link.startsWith("join") || link.includes("join")) {
      onOpenJoin("student");
    } else if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(targetLink, "_blank", "noopener,noreferrer");
    } else {
      onNavigate(targetLink);
    }
  };

  if (!activePopup) return null;

  const isYapEvent =
    activePopup.id === "pop-yap-conference-2026" ||
    activePopup.title.toLowerCase().includes("yap") ||
    activePopup.title.toLowerCase().includes("purposeful");

  const isTeenEvent =
    activePopup.id === "pop-teen-bootcamp-2026" ||
    activePopup.title.toLowerCase().includes("teen");

  // Resolve banner image url gracefully
  const resolveBannerImage = () => {
    if (imageError) {
      return isYapEvent ? yapConferenceFlyer : teenBootcampFlyer;
    }
    const img = activePopup.bannerImage || activePopup.imageUrl;
    if (!img) {
      return isYapEvent ? yapConferenceFlyer : teenBootcampFlyer;
    }
    if (
      img === "yap_conference_2026_flyer.png" ||
      img === "YAP B.png" ||
      img === "/yap_conference_2026_flyer.png" ||
      img === "/YAP B.png" ||
      img.toLowerCase().includes("yap")
    ) {
      return yapConferenceFlyer;
    }
    if (
      img === "teen_bootcamp_2026_flyer.png" ||
      img === "teen_bootcamp" ||
      img.toLowerCase().includes("teen")
    ) {
      return teenBootcampFlyer;
    }
    return img;
  };

  const bannerSrc = resolveBannerImage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-150 flex flex-col font-sans my-auto select-none max-h-[92vh] overflow-y-auto z-10"
          >
            {/* Top Close Button (Always floating above content) */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-30 p-2 text-slate-700 hover:text-slate-950 bg-white/90 hover:bg-white rounded-full cursor-pointer shadow-md border border-slate-200 transition-all hover:scale-110"
              title="Close popup"
              aria-label="Close promotion modal"
            >
              <X size={18} />
            </button>

            {/* Flyer Image Container (Fits complete flyer without cutoff or forced aspect ratio crop) */}
            <div 
              onClick={() => setShowFullFlyerLightbox(true)}
              className="relative w-full bg-slate-950 border-b border-slate-150 flex items-center justify-center overflow-hidden max-h-[48vh] sm:max-h-[54vh] cursor-pointer group"
              title="Click to view full high-resolution flyer"
            >
              <img
                src={bannerSrc}
                alt={activePopup.title}
                className="w-full h-auto max-h-[48vh] sm:max-h-[54vh] object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1.5 bg-slate-900/90 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-amber-300/30 flex items-center gap-1.5">
                  <Sparkles size={11} /> Tap to expand full flyer
                </span>
              </div>

              {/* Special Badge Header */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-950 bg-amber-400 shadow-md px-3 py-1 rounded-full font-mono tracking-widest backdrop-blur-md">
                  <Sparkles size={11} className="text-amber-950 animate-pulse" />
                  {isYapEvent ? "FLAGSHIP ANNUAL EVENT" : "RMA SPECIAL EVENT"}
                </span>
              </div>
            </div>

            {/* Campaign Details Body */}
            <div className="p-5 sm:p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 uppercase tracking-tight leading-tight">
                  {activePopup.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed">
                  {activePopup.description}
                </p>
              </div>

              {/* Event Quick-Facts Grid */}
              {isYapEvent ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-3 bg-amber-50/80 border border-amber-100 rounded-2xl">
                    <Calendar className="text-amber-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-amber-800 uppercase tracking-widest">
                        Date & Edition
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">
                        November 2026
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Annual Flagship Summit)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-blue-50/80 border border-blue-100 rounded-2xl">
                    <MapPin className="text-blue-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-blue-800 uppercase tracking-widest">
                        Summit Venue
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Nigeria & Virtual</span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Physical + Live Stream)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                    <CreditCard className="text-emerald-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-widest">
                        Delegate Admission
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Opening Soon</span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Registration Updating)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-purple-50/80 border border-purple-100 rounded-2xl">
                    <Users className="text-purple-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-purple-800 uppercase tracking-widest">
                        Target Audience
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Youth & Young Leaders</span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Undergrads, Grads & Pros)</span>
                    </div>
                  </div>
                </div>
              ) : isTeenEvent ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                    <Calendar className="text-emerald-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-widest">
                        Date & Duration
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">
                        17th–22nd August 2026
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Monday–Saturday • 6 Days)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-amber-50/80 border border-amber-100 rounded-2xl">
                    <MapPin className="text-amber-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-amber-800 uppercase tracking-widest">
                        Location Venue
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Kano, Nigeria</span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Physical Immersion)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-blue-50/80 border border-blue-100 rounded-2xl">
                    <CreditCard className="text-blue-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-blue-800 uppercase tracking-widest">
                        Registration Fee
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">₦50,000 per Teen</span>
                      <span className="text-[10.5px] font-medium text-slate-500">(All materials included)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-purple-50/80 border border-purple-100 rounded-2xl">
                    <Users className="text-purple-700 shrink-0 mt-0.5" size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-black text-purple-800 uppercase tracking-widest">
                        Target Audience
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Teenagers Aged 13–19</span>
                      <span className="text-[10.5px] font-medium text-slate-500">(Limited Seats Available)</span>
                    </div>
                  </div>
                </div>
              ) : activePopup.eventDate ? (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
                  <Calendar className="text-[#103D2E] shrink-0" size={18} />
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                      Event Schedule
                    </span>
                    <span className="text-xs font-bold text-slate-800">{activePopup.eventDate}</span>
                  </div>
                </div>
              ) : null}

              {/* Call-to-action bar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Dismiss
                </button>

                {activePopup.secondaryButtonText && (
                  <button
                    onClick={() => handleAction(activePopup.secondaryButtonLink || activePopup.buttonLink)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    {activePopup.secondaryButtonText}
                  </button>
                )}

                <button
                  onClick={() => handleAction(activePopup.buttonLink)}
                  className="px-6 py-3 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 text-xs font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-[1.02]"
                >
                  <span>{activePopup.buttonText || "View Details"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Full High-Resolution Flyer Lightbox Modal */}
          <AnimatePresence>
            {showFullFlyerLightbox && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col items-center justify-center p-2 sm:p-4"
                >
                  <button
                    onClick={() => setShowFullFlyerLightbox(false)}
                    className="absolute top-4 right-4 z-30 p-2.5 text-slate-100 hover:text-white bg-slate-800/90 hover:bg-slate-800 rounded-full cursor-pointer shadow-xl border border-slate-600 transition-all hover:scale-110"
                    title="Close flyer preview"
                  >
                    <X size={20} />
                  </button>
                  <img
                    src={bannerSrc}
                    alt={activePopup.title}
                    className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="mt-3 flex items-center justify-between w-full px-4 text-xs text-slate-400 font-mono">
                    <span>{activePopup.title}</span>
                    <button
                      onClick={() => setShowFullFlyerLightbox(false)}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Close Lightbox
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
