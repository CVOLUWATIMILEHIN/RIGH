/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Mail, 
  Linkedin, 
  Globe, 
  ShieldCheck, 
  Award, 
  Heart, 
  MessageSquare,
  Sparkles,
  MapPin,
  ExternalLink,
  BookOpen
} from "lucide-react";
import founderPortrait from "../assets/images/FOUNDER.jpg";
import PageContainer from "./PageContainer";
import mediaLeadPortrait from "../assets/images/vincent_oluwatimilehin_media_tech_team_lead.png";
import estherPortrait from "../assets/images/abana_ogechukwu_esther_content_team_lead.jpg";
import godwinPortrait from "../assets/images/godwin_admin_manager.jpg";
import { TeamMember, getTeamMembers, saveTeamMember, deleteTeamMember } from "../lib/db";
import { fetchAllCMSFromSupabase, subscribeToSupabaseCMSRealtime } from "../lib/supabaseCms";

// Fallback / Seed array for team members
const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "gracious_esther",
    name: "Gracious-Esther",
    title: "Founder & Executive Director",
    credentials: "Soundmind-DOCTOR",
    role: "Growth-Mindset, Leadership & Productivity Coach",
    photo: founderPortrait,
    bio: "Gracious-Esther is a certified coach committed to raising a generation of purpose-minded individuals equipped with discipline, spiritual alignment, and focus. As the Founder and Executive Director (ED) of Right Minds Africa Hub, she has reached over 1,000+ young people dynamically, empowering them with a growth mindset.",
    hubs: ["Founder & Executive Director (ED)", "Abuja FCT", "Lagos"],
    socials: {
      email: "mentor@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-brand-orange text-brand-orange",
    order: 1
  },
  {
    id: "olasunde_louis",
    name: "Oluwatimilehin Vicent O. (CV)",
    title: "Tech/Media Team Lead",
    credentials: "B.Ed. Guidance & Counseling",
    role: "Creative Brand & Visual Communication Architect",
    photo: mediaLeadPortrait,
    bio: "I am Olosunde Oluwatimilehin Vicent, a multidisciplinary creative professional and Product Designer (UI/UX Designer) with experience spanning graphic design, visual storytelling, video editing, media strategy, social media management, live streaming, and ICT operations.\n\nI currently work across product design and creative media, combining user-centred design with strong visual communication to create engaging digital experiences, brand assets, and content. My professional experience includes working with Brainbench Technology, RightMind Africa, Faiiya Tech Solution, Datame Solution, Ideal Solicitors, and CVSub, alongside leading creative projects and teams.\n\nAt Brainbench Technology, I work as a Graphics Designer and UI/UX Designer, contribute to digital product development, tutor UI/UX design, create visual content, and support media production and educational technology initiatives. I have also contributed to projects involving LMS platforms, CBT systems, digital learning products, and web applications.\n\nBeyond client and organisational work, I have led and participated in initiatives focused on digital skills development, creative education, and technology adoption, including Graphics Design Boot Camps, Digital Literacy programmes, and skill-acquisition initiatives. I am passionate about helping individuals and organisations use technology, design, and media to communicate better, solve problems, and grow.\n\nMy core tools include CorelDRAW, Figma, Canva, CapCut, Filmora, Final Cut Pro, After Effects, OBS Studio, and other UI/UX, creative, and livestreaming tools. I also have certifications and practical experience across Graphic Design, UI/UX Design, Video Editing, ICT, Solar Engineering, and Sound Engineering.\n\nI am continuously building and contributing to projects that combine design, technology, education, and digital transformation, while developing initiatives such as 1000SAM 5.0 and skill-development programmes designed to help people build practical, future-ready digital skills.",
    hubs: ["National Media & Tech Command HQ", "National Headquarters Hub", "Virtual Chapters Operations"],
    socials: {
      email: "creative@rightminds.africa",
      linkedin: "https://www.linkedin.com/in/vicentcv",
      behance: "https://www.behance.net/oluwatiimilehincv"
    },
    accent: "border-brand-blue text-brand-blue",
    order: 2
  },
  {
    id: "godwin_admin",
    name: "Godwin",
    title: "Manager (Admin)",
    credentials: "Administrative Lead",
    role: "Admin & Operations Coordinator",
    photo: godwinPortrait,
    bio: "Godwin directs central administration and organizational logistics at Right Minds Africa Hub, managing communication systems, scheduling, and strategic state command administration. Under his oversight, workflows run with optimal operational precision.",
    hubs: ["National Headquarters Hub"],
    socials: {
      email: "admin@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-brand-gold text-brand-gold",
    order: 3
  },
  {
    id: "ogeabana_esther",
    name: "Abana Ogechukwu Esther",
    title: "Content Team Lead & Project Coordinator",
    credentials: "Content Team Lead",
    role: "Content Strategy, Project Coordination & Creative Campaigns",
    photo: estherPortrait,
    bio: "Abana Ogechukwu Esther is the Content Team Lead and Project Coordinator at Right Minds Africa Hub. She steers organizational storytelling, multimedia content architecture, and strategic cross-chapter project rollouts across our student, youth corps, and professional development programs.",
    hubs: ["National Content Studio", "Project Operations Desk", "Virtual Chapters Hub"],
    socials: {
      email: "content@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-rose-500 text-rose-600",
    order: 4
  },
  {
    id: "chioma_okoro",
    name: "Chioma Okoro",
    title: "Coordinator of Digital Cohorts & Teen Academy",
    credentials: "Lead Facilitator",
    role: "Digital Coach & Growth Mentor",
    photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400",
    bio: "Chioma oversees our online bootcamps and growth programs, coordinating over 4,000 teenagers. She models creative communications, social confidence, digital detox paradigms, and emotional resilience specifically designed for SS1-SS3 students.",
    hubs: ["Port Harcourt", "Lagos"],
    socials: {
      email: "teens@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-purple-500 text-purple-600",
    order: 5
  },
  {
    id: "david_ndubusi",
    name: "David Ndubusi",
    title: "Director of Career Bootcamps",
    credentials: "Corporate Placement Head",
    role: "Industry Placement Coordinator & CV Coach",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    bio: "David is an HR expert who bridges final year cohorts and NYSC members to employment rings. Under his stewardship, over 150+ graduates from past CII cohorts successfully transitioned directly into premium remote or physical roles in reputable global sectors.",
    hubs: ["Abuja", "Virtual Chapters Coordinator"],
    socials: {
      email: "careers@rightminds.africa",
      linkedin: "https://linkedin.com",
    },
    accent: "border-indigo-500 text-indigo-600",
    order: 6
  }
];

interface CoreTeamProps {
  onBack: () => void;
}

export default function CoreTeam({ onBack }: CoreTeamProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const loadMembers = async () => {
    try {
      const liveMembers = await getTeamMembers();
      if (liveMembers && liveMembers.length > 0) {
        let hasChanges = false;
        let hadAzeez = false;
        const updated = liveMembers.map(m => {
          if (m.id === "azeez_yusuf") {
            hasChanges = true;
            hadAzeez = true;
            return {
              id: "ogeabana_esther",
              name: "Abana Ogechukwu Esther",
              title: "Content Team Lead & Project Coordinator",
              credentials: "Content Team Lead",
              role: "Content Strategy, Project Coordination & Creative Campaigns",
              photo: estherPortrait,
              bio: "Abana Ogechukwu Esther is the Content Team Lead and Project Coordinator at Right Minds Africa Hub. She steers organizational storytelling, multimedia content architecture, and strategic cross-chapter project rollouts across our student, youth corps, and professional development programs.",
              hubs: ["National Content Studio", "Project Operations Desk", "Virtual Chapters Hub"],
              socials: {
                email: "content@rightminds.africa",
                linkedin: "https://linkedin.com",
              },
              accent: "border-rose-500 text-rose-600",
              order: 4
            };
          }
          if (m.id === "ogeabana_esther" || m.id === "abana_esther") {
            if (m.name !== "Abana Ogechukwu Esther" || !m.photo || m.photo !== estherPortrait) {
              hasChanges = true;
              return { 
                ...m, 
                name: "Abana Ogechukwu Esther",
                photo: estherPortrait,
                bio: "Abana Ogechukwu Esther is the Content Team Lead and Project Coordinator at Right Minds Africa Hub. She steers organizational storytelling, multimedia content architecture, and strategic cross-chapter project rollouts across our student, youth corps, and professional development programs."
              };
            }
          }
          if (m.id === "olasunde_louis") {
            // Force the updated portrait, name, national hubs, and complete bio
            const needsUpdate = 
              m.name !== "Oluwatimilehin Vicent O. (CV)" ||
              !m.photo || m.photo !== mediaLeadPortrait ||
              (m.hubs && m.hubs.some(h => h.includes("Ekiti"))) ||
              !m.bio?.startsWith("I am Olosunde Oluwatimilehin Vicent");
            if (needsUpdate) {
              hasChanges = true;
              return { 
                ...m, 
                name: "Oluwatimilehin Vicent O. (CV)",
                photo: mediaLeadPortrait,
                hubs: ["National Media & Tech Command HQ", "National Headquarters Hub", "Virtual Chapters Operations"],
                bio: "I am Olosunde Oluwatimilehin Vicent, a multidisciplinary creative professional and Product Designer (UI/UX Designer) with experience spanning graphic design, visual storytelling, video editing, media strategy, social media management, live streaming, and ICT operations.\n\nI currently work across product design and creative media, combining user-centred design with strong visual communication to create engaging digital experiences, brand assets, and content. My professional experience includes working with Brainbench Technology, RightMind Africa, Faiiya Tech Solution, Datame Solution, Ideal Solicitors, and CVSub, alongside leading creative projects and teams.\n\nAt Brainbench Technology, I work as a Graphics Designer and UI/UX Designer, contribute to digital product development, tutor UI/UX design, create visual content, and support media production and educational technology initiatives. I have also contributed to projects involving LMS platforms, CBT systems, digital learning products, and web applications.\n\nBeyond client and organisational work, I have led and participated in initiatives focused on digital skills development, creative education, and technology adoption, including Graphics Design Boot Camps, Digital Literacy programmes, and skill-acquisition initiatives. I am passionate about helping individuals and organisations use technology, design, and media to communicate better, solve problems, and grow.\n\nMy core tools include CorelDRAW, Figma, Canva, CapCut, Filmora, Final Cut Pro, After Effects, OBS Studio, and other UI/UX, creative, and livestreaming tools. I also have certifications and practical experience across Graphic Design, UI/UX Design, Video Editing, ICT, Solar Engineering, and Sound Engineering.\n\nI am continuously building and contributing to projects that combine design, technology, education, and digital transformation, while developing initiatives such as 1000SAM 5.0 and skill-development programmes designed to help people build practical, future-ready digital skills."
              };
            }
          }
          if (m.id === "gracious_esther") {
            if (!m.photo || m.photo.includes("unsplash.com")) {
              hasChanges = true;
              return { ...m, photo: founderPortrait };
            }
          }
          if (m.id === "godwin_admin") {
            if (!m.photo || m.photo !== godwinPortrait) {
              hasChanges = true;
              return { ...m, photo: godwinPortrait };
            }
          }
          return m;
        });

        const idsToPurge = ["board_adeleke", "board_nkem", "mentor_kolawole", "mentor_faithfulness", "vol_christianah", "vol_samuel", "azeez_yusuf"];
        for (const id of idsToPurge) {
          deleteTeamMember(id).catch(() => {});
        }

        const cleaned = updated.filter(m => 
          !idsToPurge.includes(m.id) &&
          !m.name.includes("Adeleke") &&
          !m.name.includes("Evelyn Nkem") &&
          !m.name.includes("Kolawole Solomon") &&
          !m.name.includes("Faithfulness Adebayo") &&
          !m.name.includes("Christianah Alao") &&
          !m.name.includes("Samuel Onifade") &&
          !m.name.includes("Azeez Yusuf")
        );

        setMembers(cleaned);

        if (hasChanges) {
          // Sync corrected profiles back to database & localStorage
          for (const m of cleaned) {
            if (m.id === "olasunde_louis" || m.id === "gracious_esther" || m.id === "ogeabana_esther" || m.id === "godwin_admin") {
              await saveTeamMember(m);
            }
          }
        }
      } else {
        // Seed Firestore if empty
        setMembers(DEFAULT_MEMBERS);
        for (const m of DEFAULT_MEMBERS) {
          await saveTeamMember(m);
        }
      }
    } catch (err) {
      console.warn("Failed loading team members, fallback active:", err);
      setMembers(DEFAULT_MEMBERS);
    }
  };

  useEffect(() => {
    // 1. Live load from Supabase
    fetchAllCMSFromSupabase().then((data) => {
      if (data && data.teamMembers && data.teamMembers.length > 0) {
        const synced = data.teamMembers.map((m) =>
          m.id === "godwin_admin" && !m.photo ? { ...m, photo: godwinPortrait } : m
        );
        setMembers(synced);
      } else {
        loadMembers();
      }
    }).catch(() => loadMembers());

    // 2. Realtime listener for cross-device updates
    const unsubscribeRealtime = subscribeToSupabaseCMSRealtime((table) => {
      if (table === "team_members") {
        fetchAllCMSFromSupabase().then((data) => {
          if (data && data.teamMembers && data.teamMembers.length > 0) {
            setMembers(data.teamMembers);
          }
        });
      }
    });

    window.addEventListener("rma_team_members_updated", loadMembers);
    return () => {
      unsubscribeRealtime();
      window.removeEventListener("rma_team_members_updated", loadMembers);
    };
  }, []);

  const founder = members.find(m => m.id === "gracious_esther") || DEFAULT_MEMBERS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 border-t-4 border-brand-orange pb-24">
      
      {/* Visual Backglow highlights */}
      <div className="absolute top-20 left-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="py-12 relative z-10">
        
        {/* navigation back link */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-orange transition-all border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 cursor-pointer shadow-sm active:translate-y-0.5"
          >
            <ArrowLeft size={13} /> Return to Home
          </button>
        </div>

        {/* Page Titles */}
        <div className="max-w-3xl space-y-3 mb-16 text-left border-l-4 border-brand-blue pl-6 py-2">
          <span className="inline-flex items-center gap-1 text-xs font-black tracking-widest text-brand-orange uppercase font-mono">
            <Sparkles size={12} /> THE PILLARS
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-brand-blue tracking-tight font-display uppercase">
            MEET THE CORE TEAM
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            A dedicated collective of Growth-Mindset certified coaches, platform architects, and regional facilitators driving systemic transformation across Nigeria.
          </p>
        </div>

        {/* Founder & Coach Special Spotlights */}
        <div className="bg-brand-blue rounded-[2.5rem] text-white p-8 md:p-12 border border-white/5 mb-16 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full shrink-0 -mr-20 -mt-20 blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Actual Founder photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-brand-orange bg-slate-950 flex flex-col items-center justify-center shadow-2xl shrink-0">
                {founder.photo ? (
                  <img
                    src={founder.photo}
                    alt={`${founder.name} - ${founder.title}`}
                    className="w-full h-full object-cover object-[center_15%] scale-[1.2] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-18 h-18 bg-white/5 border border-white/10 text-brand-orange rounded-2xl flex items-center justify-center text-3xl font-black tracking-tighter shadow-xl">
                    GE
                  </div>
                )}
                <div className="absolute bottom-4 inset-x-4 bg-slate-900/80 backdrop-blur-xs py-1 rounded-full text-center border border-white/10 z-10">
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-wider text-brand-orange font-black uppercase">FOUNDER & EXECUTIVE DIRECTOR</span>
                </div>
              </div>
            </div>

            {/* Content text */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight font-display font-sans">
                    {founder.name}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider rounded-md font-mono shrink-0">
                    {founder.credentials}
                  </span>
                </div>
                <p className="text-brand-orange font-bold text-sm sm:text-base tracking-wide font-sans">
                  {founder.role}
                </p>
              </div>

              <div className="text-slate-100 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{founder.bio}</p>
              </div>

              {/* Founder quote */}
              <blockquote className="border-l-4 border-brand-orange pl-4 italic text-sm text-brand-softblue/90 py-1.5 bg-white/5 rounded-r-xl">
                "Raising purpose-driven individuals is not an option—it is a generational directive. Changing a society starts by engineering correct, sound mindsets that resolve difficulties instead of expecting assistance."
              </blockquote>

              {/* Quick Contact & Details */}
              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-350">
                  <MapPin size={14} className="text-brand-orange" />
                  <span>{founder.hubs ? founder.hubs.join(" & ") : "Abuja HQ & Lagos Chapters"}</span>
                </div>
                {founder.socials?.email && (
                  <a href={`mailto:${founder.socials.email}`} className="flex items-center gap-1.5 text-slate-300 hover:text-brand-orange transition-colors">
                    <Mail size={14} />
                    <span>{founder.socials.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary team grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <ShieldCheck className="text-brand-orange" size={18} />
            <h3 className="font-display font-black text-slate-700 text-sm tracking-wider uppercase">
              Operational Facilitators & Board Officers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.filter(m => m.id !== "gracious_esther").map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ y: -10, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl"
                onClick={() => setSelectedMember(member)}
              >
                <div>
                  {/* Photo or Monogram Symbol */}
                  <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/15 via-transparent to-brand-blue/30 opacity-70" />
                    {member.photo ? (
                      <img 
                        src={member.photo}
                        alt={member.name}
                        className={`w-full h-full object-cover filter brightness-[95%] ${
                          member.id === "olasunde_louis" 
                            ? "object-[center_18%]" 
                            : member.id === "ogeabana_esther"
                            ? "object-[center_20%]"
                            : "object-top"
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-white/5 border border-white/10 text-brand-orange rounded-2xl flex items-center justify-center text-xl font-black tracking-tighter shadow-md z-10">
                        {member.name.split(" ").map(w => w[0]).join("")}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-brand-blue/95 backdrop-blur-md text-white text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 z-10">
                      {member.credentials}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-brand-blue uppercase tracking-tight font-display">{member.name}</h4>
                      <p className="text-brand-orange text-xs font-bold leading-none">{member.title}</p>
                    </div>

                    <p className="text-[11px] text-[#b45309] font-black uppercase tracking-widest font-mono">
                      {member.role}
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed font-normal line-clamp-3">
                      {member.bio}
                    </p>
                  </div>
                </div>

                {/* Footer details details */}
                <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] mt-auto">
                  <div className="flex items-center gap-1 leading-none text-slate-600 font-medium">
                    <MapPin size={11} className="text-brand-orange shrink-0" />
                    <span>{member.hubs && member.hubs.length > 0 ? member.hubs[0] : "Chapter Facilitator"}</span>
                  </div>

                  <span className="text-[10px] text-brand-blue font-extrabold uppercase flex items-center gap-1">
                    View profile details <ExternalLink size={10} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global operational integrity standard banner */}
        <div className="mt-20 bg-brand-orange/5 border border-brand-orange/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-600 max-w-4xl mx-auto">
          <Award size={36} className="text-brand-orange shrink-0" />
          <div className="space-y-1">
            <h5 className="font-bold text-slate-800 uppercase tracking-wide">Growth-Mindset Certified Officers</h5>
            <p className="text-slate-500">Every operational director and regional state chapter coordinator under our umbrella has been fully vetted and certified directly under Gracious-Esther's Core Mind Re-engineering curriculum benchmarks.</p>
          </div>
        </div>

      </PageContainer>

      {/* Member Details Overlay Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop layout */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm"
            />

            {/* Modal contents */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col md:grid md:grid-cols-12"
            >
              {/* Close Button positioned in a fixed overlay or high z-index header */}
              <div className="absolute top-4 right-4 z-30">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer shadow-lg backdrop-blur-sm transition-all hover:scale-105"
                  title="Close popup"
                  id="close-profile-modal-btn"
                >
                  <ArrowLeft size={16} className="rotate-90" />
                </button>
              </div>

              {/* Image or Monogram section */}
              <div className="md:col-span-5 h-48 sm:h-64 md:h-full relative bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 shrink-0 flex flex-col items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/25 via-transparent to-slate-950/70 opacity-90" />
                
                {selectedMember.photo ? (
                  <img 
                    src={selectedMember.photo}
                    alt={selectedMember.name}
                    className={`w-full h-full object-cover filter brightness-[90%] absolute inset-0 ${
                      selectedMember.id === "gracious_esther" 
                        ? "object-[center_15%] scale-[1.2]" 
                        : selectedMember.id === "olasunde_louis"
                        ? "object-[center_18%]"
                        : selectedMember.id === "ogeabana_esther"
                        ? "object-[center_20%]"
                        : "object-top"
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-18 h-18 bg-brand-orange/10 border-2 border-brand-orange/30 text-brand-orange rounded-3xl flex items-center justify-center text-3xl font-black tracking-tighter shadow-xl z-20 mb-10">
                    {selectedMember.name.split(" ").map(w => w[0]).join("")}
                  </div>
                )}

                <div className="absolute bottom-5 inset-x-5 flex flex-col text-white z-20">
                  <span className="text-[9px] font-mono tracking-widest font-extrabold text-[#E76F51] bg-[#E76F51]/10 border border-[#E76F51]/30 self-start px-2 py-0.5 rounded uppercase">{selectedMember.credentials}</span>
                  <h3 className="font-display font-black text-lg leading-tight mt-1.5">{selectedMember.name}</h3>
                </div>
              </div>

              {/* Body text details section: fully scrollable to avoid text cutting */}
              <div className="md:col-span-7 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[50vh] md:max-h-[80vh]">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#E76F51] font-black tracking-widest uppercase font-mono">{selectedMember.title}</span>
                  <h4 className="text-sm font-extrabold text-[#0E3A2F] uppercase tracking-tight">{selectedMember.role}</h4>
                </div>

                <div className="text-xs text-slate-650 leading-relaxed font-normal bg-[#FAF8F3] p-4 border rounded-xl border-slate-200/60 font-sans whitespace-pre-line">
                  "{selectedMember.bio}"
                </div>

                {/* State coordinates / chapters */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider block">Direct Regional Commands & Chapter Coordinations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.hubs.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 bg-brand-softblue rounded-lg border border-brand-blue/10 text-brand-blue font-bold text-[10px] uppercase">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reach core channels */}
                <div className="pt-4 border-t border-slate-150 flex flex-wrap items-center gap-4 text-xs font-mono">
                  <a 
                    href={`mailto:${selectedMember.socials.email}`} 
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-orange font-bold transition-colors"
                  >
                    <Mail size={13} /> Contact Email
                  </a>
                  
                  <a 
                    href={selectedMember.socials.linkedin} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0a66c2] font-bold transition-colors"
                  >
                    <Linkedin size={13} /> Professional Profile
                  </a>

                  {(selectedMember.socials as any).behance && (
                    <a 
                      href={(selectedMember.socials as any).behance} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 rounded bg-brand-orange/10 px-2 py-1 text-brand-orange hover:bg-brand-orange/15 transition-colors font-black"
                    >
                      <ExternalLink size={12} strokeWidth={2.5} /> Behance Portfolio
                    </a>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
