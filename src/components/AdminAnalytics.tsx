/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Registration, VisitorCheckIn } from "../lib/db";
import { 
  TrendingUp, 
  Layers, 
  MapPin, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  PieChart, 
  Award, 
  Clock 
} from "lucide-react";

interface AdminAnalyticsProps {
  registrations: Registration[];
  visitorCheckins?: VisitorCheckIn[];
  onSelectFilter: (type: "profile" | "location", val: string) => void;
  activeProfileFilter: string;
  activeLocationFilter: string;
}

export default function AdminAnalytics({ 
  registrations, 
  visitorCheckins = [],
  onSelectFilter,
  activeProfileFilter,
  activeLocationFilter
}: AdminAnalyticsProps) {

  // For backward compatibility and classification mapping
  const getRegProgramType = (r: Registration) => {
    if (r.programType) return r.programType;
    const t = (r.profileType || "").toLowerCase();
    if (t.startsWith("cii") || t === "cii") return "cii";
    if (t.includes("teen") || t.includes("rmt")) return "teens";
    if (t.includes("student")) return "young-leaders";
    if (t.includes("mentor")) return "mentorship";
    return "course"; // Default or fallback
  };

  const ALL_PROGRAMS = [
    { type: "cii", name: "Corper Impact Initiative (CII)", color: "#E76F51" },
    { type: "teens", name: "Right-Minded Teens", color: "#2A9D8F" },
    { type: "young-leaders", name: "Young Leaders Program", color: "#F4A261" },
    { type: "yap-conference", name: "YAP Conference", color: "#E9C46A" },
    { type: "event", name: "Events & Hangouts", color: "#457B9D" },
    { type: "course", name: "Premium Courses", color: "#1D3557" },
    { type: "mentorship", name: "Mentorship Applications", color: "#22577A" },
    { type: "volunteer", name: "Volunteer Applications", color: "#103D2E" },
    { type: "partnership", name: "Partnership Requests", color: "#6A4C93" }
  ];

  const total = registrations.length || 1;

  // 1. Registrations by Program
  const programStats = ALL_PROGRAMS.map(prog => {
    const list = registrations.filter(r => getRegProgramType(r) === prog.type);
    const count = list.length;
    const percent = Math.round((count / total) * 100);
    return { ...prog, count, percent };
  }).sort((a, b) => b.count - a.count);

  // 2. Conversion pipeline metrics
  const totalSubmissions = registrations.length;
  const reviewedCount = registrations.filter(r => r.status && r.status !== "Received").length;
  const shortlistedCount = registrations.filter(r => r.status === "Shortlisted" || r.status === "Enrolled").length;
  const enrolledCount = registrations.filter(r => r.status === "Enrolled").length;

  const pipeline = [
    { stage: "Registered Submissions", count: totalSubmissions, percent: 100, color: "bg-slate-500" },
    { stage: "Reviewed / Processed", count: reviewedCount, percent: Math.round((reviewedCount / (totalSubmissions || 1)) * 100), color: "bg-amber-500" },
    { stage: "Shortlisted Dossiers", count: shortlistedCount, percent: Math.round((shortlistedCount / (totalSubmissions || 1)) * 100), color: "bg-[#2A9D8F]" },
    { stage: "Enrolled Cohorts", count: enrolledCount, percent: Math.round((enrolledCount / (totalSubmissions || 1)) * 100), color: "bg-[#103D2E]" }
  ];

  // 3. Revenue by Program
  const revenueStats = ALL_PROGRAMS.map(prog => {
    const matching = registrations.filter(r => getRegProgramType(r) === prog.type);
    let verified = 0;
    let pending = 0;

    matching.forEach(r => {
      let fee = 0;
      if (prog.type === "course") {
        fee = 55000; // Premium learning subscription (Naira/equivalent)
      } else if (prog.type === "event") {
        fee = 12000; // Event premium access
      } else if (prog.type === "cii" && r.planType === "growth") {
        fee = 25000;
      } else if (prog.type === "cii" && r.planType === "impact") {
        fee = 65000;
      }
      
      if (r.paymentStatus === "verified") {
        verified += fee;
      } else if (r.paymentStatus === "pending" || r.paymentReceipt) {
        pending += fee;
      }
    });

    return {
      ...prog,
      verified,
      pending,
      total: verified + pending
    };
  }).sort((a, b) => b.verified - a.verified);

  const totalVerifiedRevenue = revenueStats.reduce((acc, curr) => acc + curr.verified, 0);
  const totalPendingRevenue = revenueStats.reduce((acc, curr) => acc + curr.pending, 0);

  // 4. Attendance metrics (Visitor log)
  const totalCheckins = visitorCheckins.length;
  const locationMap: Record<string, number> = {};
  visitorCheckins.forEach(v => {
    if (v.location) {
      locationMap[v.location] = (locationMap[v.location] || 0) + 1;
    }
  });

  const hotspotStats = Object.entries(locationMap).map(([state, count]) => ({
    state,
    count,
    percent: Math.round((count / (totalCheckins || 1)) * 100)
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const purposeCounts: Record<string, number> = {};
  visitorCheckins.forEach(v => {
    const purp = v.purpose || "General Visit";
    purposeCounts[purp] = (purposeCounts[purp] || 0) + 1;
  });

  const topPurposes = Object.entries(purposeCounts).map(([name, count]) => ({
    name,
    count,
    percent: Math.round((count / (totalCheckins || 1)) * 100)
  })).sort((a, b) => b.count - a.count).slice(0, 3);

  // Top regions for registrations
  const regLocations: Record<string, number> = {};
  registrations.forEach(r => {
    if (r.location) {
      const loc = r.location.trim();
      regLocations[loc] = (regLocations[loc] || 0) + 1;
    }
  });

  const sortedRegLocations = Object.entries(regLocations)
    .map(([state, count]) => ({ state, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* Top Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Dossiers</p>
            <p className="text-xl font-black text-slate-800">{totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verified Income</p>
            <p className="text-xl font-black text-[#103D2E]">₦ {totalVerifiedRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Retrievable (Pending)</p>
            <p className="text-xl font-black text-amber-600">₦ {totalPendingRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Visitors</p>
            <p className="text-xl font-black text-rose-600">{totalCheckins} check-ins</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        
        {/* Module 1: Registrations by Program Type */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-50 pb-2">
            <div className="flex items-center gap-2">
              <PieChart size={15} className="text-[#E76F51]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Registrations by Program</h4>
            </div>
            <span className="text-[10px] text-slate-450 font-mono">Central source of truth</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {programStats.map(stat => (
              <div 
                key={stat.type}
                className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all"
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-2 leading-none">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                    {stat.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {stat.count} ({stat.percent}%)
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ backgroundColor: stat.color, width: `${Math.max(2, stat.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Conversion pipeline funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-50 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-[#2A9D8F]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Dossier Conversion Pipeline</h4>
            </div>
            <span className="text-[10px] text-slate-450 font-mono">Workflow conversion</span>
          </div>

          <div className="space-y-4.5 pt-1">
            {pipeline.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 font-mono">{item.stage}</span>
                  <span className="text-slate-550 font-mono">{item.count} rows ({item.percent}%)</span>
                </div>
                
                <div className="w-full bg-slate-50 border border-slate-150 h-5.5 rounded-lg overflow-hidden relative shadow-inner">
                  <div 
                    className={`${item.color} h-full transition-all duration-600 relative flex items-center pl-2.5`} 
                    style={{ width: `${Math.max(7, item.percent)}%` }}
                  >
                    {item.percent > 15 && (
                      <span className="text-[9.5px] font-mono text-white tracking-widest leading-none font-bold">
                        {item.percent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="p-3 bg-[#103D2E]/5 border border-[#103D2E]/10 rounded-xl">
              <p className="text-[10px] text-slate-700 leading-relaxed font-mono">
                📌 <strong>Enrollment conversion rate:</strong> Currently at <strong className="text-[#2A9D8F]">{pipeline[3].percent}%</strong> of all submitted candidates. Ensure decision status updates occur dynamically.
              </p>
            </div>
          </div>
        </div>

        {/* Module 3: Revenue by Program */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-55 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={15} className="text-[#103D2E]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Program Income Analysis</h4>
            </div>
            <span className="text-[10px] text-slate-450 font-mono">Billing reports</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {revenueStats.filter(stat => stat.total > 0).map(stat => {
              const totalAmount = stat.verified + stat.pending;
              const vPercent = Math.round((stat.verified / (totalAmount || 1)) * 100);
              return (
                <div key={stat.type} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                      {stat.name}
                    </span>
                    <span className="font-mono text-xs">₦ {totalAmount.toLocaleString()}</span>
                  </div>
                  
                  {/* Progress bars splits */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#103D2E] h-full" 
                      style={{ width: `${vPercent}%` }}
                      title={`Verified: ₦ ${stat.verified}`}
                    />
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${100 - vPercent}%` }}
                      title={`Pending: ₦ ${stat.pending}`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-450 uppercase tracking-wider">
                    <span>Verified: <strong className="text-[#103D2E]">₦ {stat.verified.toLocaleString()}</strong> ({vPercent}%)</span>
                    <span>Pending: <strong className="text-amber-600">₦ {stat.pending.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })}
            {revenueStats.filter(stat => stat.total > 0).length === 0 && (
              <div className="h-44 flex items-center justify-center text-slate-400 text-xs italic">
                No fee collection records found. Update planType or payment status to compute invoice data.
              </div>
            )}
          </div>
        </div>

        {/* Module 4: Attendance & Event Spots Check-ins */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-55 pb-2">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-[#0E3A2F]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Live Event Hotspots & Visitors</h4>
            </div>
            <span className="text-[10px] text-slate-450 font-mono">Visitor monitoring</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top hotspots */}
            <div className="space-y-2">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Popular Locations:</span>
              <div className="space-y-2">
                {hotspotStats.map(stat => (
                  <div key={stat.state} className="p-2 border border-slate-100 hover:bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      {stat.state}
                    </span>
                    <span className="font-mono font-bold text-slate-600">{stat.count} check-ins</span>
                  </div>
                ))}
                {hotspotStats.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic font-mono">No telemetry logs.</p>
                )}
              </div>
            </div>

            {/* Top purpose */}
            <div className="space-y-2">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Core Purpose splits:</span>
              <div className="space-y-2">
                {topPurposes.map(stat => (
                  <div key={stat.name} className="p-2 border border-slate-100 hover:bg-slate-50/50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span className="truncate max-w-[120px]">{stat.name}</span>
                      <span className="font-mono text-slate-500">{stat.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
                {topPurposes.length === 0 && (
                  <p className="text-[10px] text-slate-450 italic font-mono">No data check-ins.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
