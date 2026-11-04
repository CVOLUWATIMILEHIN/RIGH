import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Award, Lock, Send, CheckCircle, AlertCircle, Facebook, Linkedin, Instagram } from "lucide-react";
import { saveNewsletterSubscription } from "../lib/db";
import brandLogo from "../assets/images/brand_logo_official_new_1780385523572.png";
import { PageContainer } from "./PageContainer";
import { useBrandConfig } from "../lib/brandConfig";

interface FooterProps {
  onOpenJoin: (profile?: string) => void;
  onViewAdmin?: () => void;
  onViewTeam?: () => void;
  onViewAbout?: () => void;
  onViewYap?: () => void;
  onViewFaqs?: () => void;
}

export default function Footer({ onOpenJoin, onViewAdmin, onViewTeam, onViewAbout, onViewYap, onViewFaqs }: FooterProps) {
  const { brand } = useBrandConfig();
  const hasValidAdminToken = () => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("rma_current_logged_in_user");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.token && parsed?.expiresAt && parsed.expiresAt > Date.now());
    } catch {
      return false;
    }
  };

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(hasValidAdminToken);

  const [newsEmail, setNewsEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [secretClickCount, setSecretClickCount] = useState(0);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail.trim()) return;
    setSubmitting(true);
    setSubscribeStatus("idle");
    setErrorMessage("");

    try {
      await saveNewsletterSubscription(newsEmail);
      setSubscribeStatus("success");
      setNewsEmail("");
      // Automatically reset status back to idle after 5 seconds
      setTimeout(() => {
        setSubscribeStatus("idle");
      }, 5000);
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
      setSubscribeStatus("error");
      setErrorMessage("Could not subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  useEffect(() => {
    const checkSession = () => {
      setIsAdminLoggedIn(hasValidAdminToken());
    };

    window.addEventListener("rma_admin_session_changed", checkSession);
    window.addEventListener("storage", checkSession);
    return () => {
      window.removeEventListener("rma_admin_session_changed", checkSession);
      window.removeEventListener("storage", checkSession);
    };
  }, []);

  const handleCopyrightClick = () => {
    const nextCount = secretClickCount + 1;
    setSecretClickCount(nextCount);
    if (nextCount >= 5) {
      setSecretClickCount(0);
      if (onViewAdmin) {
        onViewAdmin();
      }
    }
  };
  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialChannels = [
    { name: "Facebook", url: "https://www.facebook.com/RightMAHub", handle: "@RightMAHub", Icon: Facebook },
    { name: "LinkedIn", url: "https://www.linkedin.com/company/rightmindafricahub", handle: "@rightmindafricahub", Icon: Linkedin },
    { name: "Instagram", url: "https://www.instagram.com/rightmindsafrica", handle: "@rightmindsafrica", Icon: Instagram }
  ];

  return (
    <footer id="footer-panel" className="bg-slate-50 text-slate-900 pt-16 pb-12 overflow-hidden border-t border-slate-200/90 relative font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-[110px] pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Main Footer columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 border-b border-slate-200/80 pb-12">
          
          {/* Brand & Mission column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#" onClick={handleScrollToTop} className="flex items-center gap-3 group" id="footer-logo-link">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-0.5 border border-slate-200 shadow-xs transition-transform group-hover:scale-105 overflow-hidden">
                <img
                  src={brand.logoUrl || brandLogo}
                  alt={`${brand.brandName} Logo`}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-brand-blue text-base sm:text-lg leading-none tracking-tight uppercase">
                  {brand.brandShortName}
                </span>
                <span className="text-[9px] font-bold text-brand-orange tracking-widest uppercase leading-none mt-1">
                  {brand.brandSubTitle}
                </span>
              </div>
            </a>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {brand.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/RightMAHub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-xl text-xs font-semibold transition-all border border-[#1877F2]/25"
                title="Follow RightMinds Africa Hub on Facebook"
              >
                <Facebook size={13} className="fill-current" />
                <span className="font-mono text-[10px]">@RightMAHub</span>
              </a>
              <a
                href="https://www.instagram.com/rightmindsafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-[#E4405F] text-slate-700 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200"
                title="Follow on Instagram"
              >
                <Instagram size={13} />
              </a>
              <a
                href="https://www.linkedin.com/company/rightmindafricahub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-[#0A66C2] text-slate-700 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200"
                title="Follow on LinkedIn"
              >
                <Linkedin size={13} />
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-xs font-extrabold tracking-widest text-brand-blue uppercase font-mono">
              Apply Cohorts:
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <button onClick={() => onOpenJoin("corps_member")} className="hover:text-brand-orange transition-colors cursor-pointer text-left block font-medium">
                  &bull; NYSC Corps
                </button>
              </li>
              <li>
                <button onClick={() => onOpenJoin("student")} className="hover:text-brand-orange transition-colors cursor-pointer text-left block font-medium">
                  &bull; Undergraduates
                </button>
              </li>
              <li>
                <button onClick={() => onOpenJoin("teen")} className="hover:text-brand-orange transition-colors cursor-pointer text-left block font-medium">
                  &bull; Secondary Teens
                </button>
              </li>
              <li>
                <button onClick={() => onOpenJoin("mentor")} className="hover:text-brand-orange transition-colors cursor-pointer text-left block font-medium">
                  &bull; Mentors
                </button>
              </li>
              <li>
                <button onClick={onViewFaqs} className="text-brand-orange hover:text-brand-orange/80 font-bold transition-colors cursor-pointer text-left block uppercase text-[10px] tracking-wider mt-1">
                  &bull; FAQs (RMA & CII)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-extrabold tracking-widest text-brand-blue uppercase font-mono">
              Administrative Links:
            </h4>
            
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex gap-2.5 items-start">
                <Mail className="text-brand-orange shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold text-[9px] uppercase text-brand-blue tracking-widest font-mono">Official Correspondence</p>
                  <a href="mailto:rightmindsafrica@gmail.com" className="hover:text-brand-orange select-all block mt-0.5 font-medium">
                    rightmindsafrica@gmail.com
                  </a>
                  <a href="mailto:corpersimpactinitiative@gmail.com" className="hover:text-brand-orange select-all block text-[10px] text-slate-500 transition-colors mt-1">
                    corpersimpactinitiative@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <Phone className="text-brand-orange shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold text-[9px] uppercase text-brand-blue tracking-widest font-mono">Helplines</p>
                  <p className="select-all block mt-0.5 font-medium">+234 (0) 803 980 9016</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <MapPin className="text-brand-orange shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold text-[9px] uppercase text-brand-blue tracking-widest font-mono">Main Chapter Headquarters</p>
                  <p className="leading-relaxed mt-0.5 font-medium">
                    37 Army Road, Sabon-gari, Zaria.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-extrabold tracking-widest text-brand-blue uppercase font-mono">
              Newsletter:
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Subscribe to stay updated with monthly mindset insights, mentorship bootcamps, and leadership alerts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1" id="newsletter-subscription-form">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={newsEmail}
                  onChange={(e) => setNewsEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-white outline-none text-slate-900 placeholder-slate-400 font-sans text-xs px-3 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all disabled:opacity-50"
                  id="newsletter-email-input"
                />
                <button
                  type="submit"
                  disabled={submitting || !newsEmail.trim()}
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
                  title="Subscribe Now"
                  id="newsletter-submit-btn"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={11} id="icon-newsletter-send" />
                  )}
                </button>
              </div>

              {subscribeStatus === "success" && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold pt-1 animate-fade-in" id="newsletter-success-notif">
                  <CheckCircle size={12} />
                  <span>Subscribed successfully!</span>
                </div>
              )}

              {subscribeStatus === "error" && (
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold pt-1" id="newsletter-error-notif">
                  <AlertCircle size={12} />
                  <span className="truncate">{errorMessage}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialChannels.map((channel, idx) => {
              const IconComp = channel.Icon;
              return (
                <a
                  key={idx}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-brand-blue transition-colors bg-white px-2.5 py-1 rounded-xl border border-slate-200 hover:border-brand-orange/40 text-[9px] font-mono uppercase font-semibold inline-flex items-center gap-1.5"
                >
                  <IconComp size={11} className={channel.name === "Facebook" ? "text-[#1877F2]" : channel.name === "Instagram" ? "text-[#E4405F]" : "text-[#0A66C2]"} />
                  <span>{channel.name}</span>
                </a>
              );
            })}
            {onViewAdmin && isAdminLoggedIn && (
              <button
                onClick={onViewAdmin}
                className="transition-all duration-200 p-1.5 rounded-xl border flex items-center justify-center cursor-pointer bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/30"
                title="System Control Panel (Logged In)"
              >
                <Lock size={11} className="animate-pulse" />
              </button>
            )}
          </div>

          <div className="text-center md:text-right space-y-1">
            <p 
              onClick={handleCopyrightClick} 
              className="cursor-default select-none transition-colors duration-200"
            >
              &copy; {new Date().getFullYear()} {brand.brandName}. All Rights Reserved.
            </p>
            {onViewAdmin && isAdminLoggedIn && (
              <button
                onClick={onViewAdmin}
                className="text-brand-blue hover:text-brand-orange text-[12px] flex items-center md:justify-end gap-1 block md:ml-auto transition-colors cursor-pointer pt-0.5 font-medium"
                title="Supervised Admin Panel Gateway"
              >
                <span>🔒 Settings Active</span>
              </button>
            )}
          </div>
        </div>

      </PageContainer>
    </footer>
  );
}
