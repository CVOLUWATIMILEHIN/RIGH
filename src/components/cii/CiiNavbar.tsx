/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import CiiLogo from "../CiiLogo";

interface CiiNavbarProps {
  onBack: () => void;
  onApplyNow: () => void;
  onNavigateSection: (id: string) => void;
}

export default function CiiNavbar({ onBack, onApplyNow, onNavigateSection }: CiiNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "About", id: "cii-about" },
    { name: "Promise", id: "cii-promise" },
    { name: "Tracks", id: "cii-tracks" },
    { name: "Engine", id: "cii-engine" },
    { name: "Journey", id: "cii-journey" },
    { name: "Pricing", id: "cii-pricing" },
    { name: "Outcomes", id: "cii-outcomes" },
    { name: "Gallery", id: "cii-gallery-section" },
    { name: "FAQs", id: "cii-faqs-section" }
  ];

  const handleLinkClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-16 sm:top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200" id="cii-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Hub back button & CII Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              id="cii-nav-back-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              title="Back to Right Mind Africa Home"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">RMA Hub</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center">
              <CiiLogo variant="light" size="sm" showTagline={false} className="h-10" />
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleLinkClick(item.id)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider relative py-1"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Right: Apply Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-semibold tracking-wide rounded-md">
              Cohort 5 Active
            </span>

            <button
              onClick={onApplyNow}
              id="cii-nav-apply-btn"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Apply Now
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="cii-mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pb-3">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className="text-left px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onApplyNow();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors text-center"
            >
              Apply for Admission
            </button>
            <button
              onClick={onBack}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors"
            >
              Return to RMA Home
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
