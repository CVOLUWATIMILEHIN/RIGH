/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Award, Calendar, TrendingUp, Users, Target, ShieldCheck } from "lucide-react";
import { GENERAL_METRICS } from "../types";
import PageContainer from "./PageContainer";

export default function ImpactMetrics() {
  // Simple icon selector based on key
  const getIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case "Award":
        return <Award size={24} className={colorClass} />;
      case "Calendar":
        return <Calendar size={24} className={colorClass} />;
      case "TrendingUp":
        return <TrendingUp size={24} className={colorClass} />;
      default:
        return <Users size={24} className={colorClass} />;
    }
  };

  return (
    <section id="impact" className="py-20 relative overflow-hidden bg-brand-blue text-white grid-mesh">
      {/* Visual glowing highlights representing progress and focus */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-85 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Core Header Text */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-brand-orange text-xs font-black tracking-widest rounded-full uppercase">
            <Target size={12} className="text-brand-gold animate-spin-slow" /> METRIC REPORT
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            A Living Legacy of Empowered African Minds
          </h2>
          <p className="text-brand-softblue/70 text-sm sm:text-base leading-relaxed">
            Our numbers represent human stories—youth who replaced existential anxiety with purpose-driven career roadmaps and leadership clarity.
          </p>
        </div>

        {/* Counters & Visual Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {GENERAL_METRICS.map((metric, idx) => {
            // Distinguish the icons for gorgeous contrast
            const colorClass = idx === 0 
              ? "text-brand-orange" 
              : idx === 1 
              ? "text-brand-gold" 
              : "text-brand-softblue";

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
                whileHover={{ y: -5 }}
                className="glass-dark-effect p-6 md:p-8 rounded-3xl flex flex-col justify-between h-full hover:shadow-lg hover:shadow-brand-orange/5 transition-all outline-1 outline-white/5"
              >
                <div>
                  {/* Icon Badge */}
                  <div className="p-3 bg-white/10 w-fit rounded-2xl border border-white/15 mb-6">
                    {getIcon(metric.iconName, colorClass)}
                  </div>

                  {/* Gigantic Number display */}
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tight font-display">
                      {metric.value.toLocaleString()}
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-brand-orange font-display">
                      {metric.suffix}
                    </span>
                  </div>

                  {/* Label Title */}
                  <h3 className="text-base font-bold text-white tracking-wide mt-2 border-b border-white/10 pb-2">
                    {metric.label}
                  </h3>
                </div>

                {/* Subtext description */}
                <p className="text-brand-softblue/75 text-xs leading-relaxed mt-4">
                  {metric.description}
                </p>

              </motion.div>
            );
          })}
        </div>

        {/* Bottom Impact Quote / Affirmation Banner */}
        <div className="mt-16 bg-white/5 border border-white/10 p-5 rounded-2xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-full shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">Independent Advisory & Audit</p>
              <p className="text-brand-softblue/75">Registrations and impacts are audited in alignment with global educational transparency codes.</p>
            </div>
          </div>
          <span className="font-mono text-[9px] text-brand-orange font-bold px-2.5 py-1 bg-brand-orange/10 rounded border border-brand-orange/20 select-none uppercase shrink-0">
            Certified Growth Organization
          </span>
        </div>

      </PageContainer>
    </section>
  );
}
