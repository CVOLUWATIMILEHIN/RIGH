/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface CiiLogoProps {
  className?: string;
  variant?: "light" | "dark" | "full-color";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function CiiLogo({ 
  className = "", 
  variant = "full-color", 
  showTagline = true,
  size = "md" 
}: CiiLogoProps) {
  
  // Dimensions based on size prop
  const scale = size === "sm" ? "scale-[0.8] origin-left" : size === "lg" ? "scale-[1.2] origin-left" : "";
  const heightClass = size === "sm" ? "h-10" : size === "lg" ? "h-20" : "h-14";

  return (
    <div className={`flex items-center select-none ${scale} ${heightClass} ${className}`} id="cii-official-custom-logo">
      <svg
        viewBox="0 0 540 160"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradients matching the user's uploaded logo exactly */}
        <defs>
          {/* Main green to yellow gradient for the letters CI */}
          <linearGradient id="ciiGreenYellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#41B629" />
            <stop offset="60%" stopColor="#89C916" />
            <stop offset="100%" stopColor="#FED226" />
          </linearGradient>

          {/* Golden/Yellowish gradient for the top segment of the logo if needed */}
          <linearGradient id="ciiYellowGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EFDC21" />
            <stop offset="100%" stopColor="#FFC107" />
          </linearGradient>

          <filter id="subtle-shadow" x="-5%" y="-5%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* ========================================================== */}
        {/* Letter 'C' */}
        {/* ========================================================== */}
        <path
          d="M100 24C60 24 24 54 24 96C24 138 60 160 100 160C140 160 152 135 152 135L118 115C118 115 110 126 98 126C80 126 62 112 62 94C62 76 80 58 98 58C110 58 118 69 118 69L152 49C152 49 140 24 100 24Z"
          fill="url(#ciiGreenYellowGradient)"
        />

        {/* ========================================================== */}
        {/* Letter 'I' */}
        {/* ========================================================== */}
        <path
          d="M180 24H250V52H228V132H250V160H180V132H202V52H180V24Z"
          fill="url(#ciiGreenYellowGradient)"
        />

        {/* ========================================================== */}
        {/* Letter 'i' (Stem) */}
        {/* ========================================================== */}
        <path
          d="M272 56H302V160H272V56Z"
          fill="url(#ciiGreenYellowGradient)"
        />

        {/* ========================================================== */}
        {/* NYSC Emblem / Crest acting as the dot of the lowercase 'i' */}
        {/* ========================================================== */}
        <g transform="translate(287, 28)" filter="url(#subtle-shadow)">
          {/* NYSC Outer Border Shield */}
          <circle cx="0" cy="0" r="23" fill="#0C4A11" />
          <circle cx="0" cy="0" r="21" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="19" fill="#1B8224" />
          
          {/* Internal Nigeria Flag Green/White sections */}
          <path d="M -12,0 A 12,12 0 0,1 12,0 L 12,12 A 12,12 0 0,1 -12,12 Z" fill="#EE1C25" />
          <circle cx="0" cy="0" r="14" fill="#EAD215" />
          
          {/* Outer yellow border crest shield shape */}
          <path d="M-8,-11 L8,-11 L13,-1 L0,14 L-13,-1 Z" fill="#FFFFFF" stroke="#0D5116" strokeWidth="2" />
          <path d="M-6,-9 L6,-9 L10,-1 L0,11 L-10,-1 Z" fill="#ECE11C" />

          {/* Tiny Nigeria Map representation / Torch inside */}
          <path d="M -3,-5 L 3,-5 L 4,-1 L 0,6 L -4,-1 Z" fill="#0E5B18" />
          {/* Torch flame (representing service and state leadership) */}
          <circle cx="0" cy="-6" r="2.5" fill="#EF233C" />
          <circle cx="0" cy="-6" r="1.5" fill="#FFC300" />
          
          {/* NYSC Text background wrap or representation */}
          <path d="M-12,-18 C-6,-22 6,-22 12,-18" stroke="#105716" strokeWidth="1.5" fill="none" />
          {/* Red small crown at the top */}
          <rect x="-3" y="-23" width="6" height="3" fill="#ED1C24" rx="1" />
          <line x1="-2" y1="-23" x2="-2" y2="-20" stroke="#FFFFFF" strokeWidth="0.5" />
          <line x1="2" y1="-23" x2="2" y2="-20" stroke="#FFFFFF" strokeWidth="0.5" />
        </g>

        {/* ========================================================== */}
        {/* RIGHT SIDE TEXT: "CORPERS Impact Initiative" */}
        {/* ========================================================== */}
        
        {/* "CORPERS" on dark / light */}
        <text
          x="320"
          y="90"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontWeight="900"
          fontSize="50"
          letterSpacing="0.02em"
          fill={variant === "light" ? "#1F2937" : "#4BB529"} // Beautiful brand green matching user uploaded image logo
          className="font-black uppercase tracking-tight"
        >
          CORPERS
        </text>

        {/* "Impact Initiative" */}
        <text
          x="321"
          y="126"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="33"
          letterSpacing="0.01em"
          fill={variant === "light" ? "#4B5563" : "#F4A261"} // Warm orange
        >
          Impact Initiative
        </text>

        {/* Tagline: "...impactful Service and Growth year..." */}
        {showTagline && (
          <text
            x="323"
            y="150"
            fontFamily="Georgia, Cambria, 'Times New Roman', Times, serif"
            fontStyle="italic"
            fontWeight="bold"
            fontSize="15"
            letterSpacing="0.08em"
            fill="#a3a3a3"
          >
            ...impactful Service and Growth year...
          </text>
        )}
      </svg>
    </div>
  );
}
