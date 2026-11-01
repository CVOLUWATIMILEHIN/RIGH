/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import CiiNavbar from "./cii/CiiNavbar";
import CiiHero from "./cii/CiiHero";
import CiiMetricsStrip from "./cii/CiiMetricsStrip";
import CiiAboutAndPromise from "./cii/CiiAboutAndPromise";
import CiiTracks from "./cii/CiiTracks";
import CiiEngineAndJourney from "./cii/CiiEngineAndJourney";
import CiiPricing from "./cii/CiiPricing";
import CiiOutcomesAndTestimonials from "./cii/CiiOutcomesAndTestimonials";
import CiiFaqAndGallery from "./cii/CiiFaqAndGallery";
import CiiEnrollmentSection from "./cii/CiiEnrollmentSection";
import CiiFooter from "./cii/CiiFooter";

interface CiiPageProps {
  onBack: () => void;
  onOpenJoin?: (profile?: string) => void;
}

export default function CiiPage({ onBack }: CiiPageProps) {
  const [activeTrack, setActiveTrack] = useState<"career" | "finance" | "mindset">("career");
  const [selectedPlan, setSelectedPlan] = useState<"waitlist" | "free" | "growth" | "impact">("free");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleApplyNow = () => {
    scrollToSection("cii-enroll-section");
  };

  const handleSelectPlan = (plan: "waitlist" | "free" | "growth" | "impact") => {
    setSelectedPlan(plan);
    scrollToSection("cii-enroll-section");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-500 selection:text-white pt-16 sm:pt-[68px]">
      {/* Redesigned Minimal & Professional Header */}
      <CiiNavbar
        onBack={onBack}
        onApplyNow={handleApplyNow}
        onNavigateSection={scrollToSection}
      />

      {/* Main Content Area */}
      <main className="pt-2 sm:pt-4">
        {/* Section 1: Hero */}
        <CiiHero
          onApplyNow={handleApplyNow}
          onViewCurriculum={() => scrollToSection("cii-tracks")}
        />

        {/* Section 2: Verified Metrics & Global Network */}
        <CiiMetricsStrip />

        {/* Section 3 & 4: Core Mission Strategy & The Reality Check */}
        <CiiAboutAndPromise
          onSelectTrack={(track) => {
            setActiveTrack(track);
            scrollToSection("cii-tracks");
          }}
        />

        {/* Section 5: Three Growth Tracks */}
        <CiiTracks
          activeTrack={activeTrack}
          onTrackChange={setActiveTrack}
        />

        {/* Section 6 & 7: Accountability Engine & NYSC Member Growth Lifecycle */}
        <CiiEngineAndJourney />

        {/* Section 8: Approved Membership Framework */}
        <CiiPricing onSelectPlan={handleSelectPlan} />

        {/* Section 9 & 10: Performance Audits & Fellow Perspectives */}
        <CiiOutcomesAndTestimonials />

        {/* Section 11 & 12: Cohort Memories Gallery & Inquiries FAQ Accordion */}
        <CiiFaqAndGallery />

        {/* Section 13: Admission & Accelerator Enrollment Sheet */}
        <CiiEnrollmentSection
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
        />
      </main>

      {/* Section 14: Brand Footer Appendices */}
      <CiiFooter
        onBack={onBack}
        onNavigateSection={scrollToSection}
        onSelectTrack={(track) => {
          setActiveTrack(track);
          scrollToSection("cii-tracks");
        }}
      />
    </div>
  );
}
