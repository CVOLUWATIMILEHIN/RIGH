import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Calendar, Clock, MapPin, 
  ChevronRight, ArrowRight, Video, Download, CheckCircle, ChevronDown, X, ExternalLink
} from "lucide-react";
import { getEvents } from "../../lib/db";
import { PageContainer } from "../PageContainer";
import teenBootcampFlyer from "../../assets/images/teen_bootcamp_2026_flyer.png";

interface EventViewsProps {
  subView: "upcoming" | "calendar" | "past";
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

const DUMMY_EVENTS = [
  {
    id: "evt-teen-bootcamp-2026",
    title: "Right-Minds Teen Leadership Bootcamp 2026",
    date: "17th–22nd August 2026 (Mon–Sat)",
    time: "6 Days Intensive Immersion",
    venue: "Physical Immersion Center • Kano, Nigeria",
    category: "Right-Minded Teens",
    description: "Empower your teenager with leadership, confidence, communication, digital, and future-ready skills needed to excel in today's world. Designed for teenagers aged 13–19 who are ready to discover their purpose and become impactful leaders.",
    bannerUrl: "teen_bootcamp_2026_flyer.png",
    price: "₦50,000",
    actionLink: "teen-bootcamp"
  },
  {
    id: "evt-1",
    title: "Youth Alignment Program (YAP) Annual Summit 2026",
    date: "Saturday, November 14, 2026",
    time: "09:00 AM - 04:00 PM",
    venue: "Main Hall, University of Lagos (UNILAG) Guest House, Akoka, Lagos",
    category: "YAP Conference",
    description: "Our flagship annual conference gathering over 1,500 young leaders, professionals, and change-makers in Lagos for deep spiritual alignment, executive career mentorship, and mindset re-engineering masterclasses.",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&fit=crop&q=80",
    price: "Free Admission"
  },
  {
    id: "evt-2",
    title: "Monthly Development Leadership Masterclass",
    date: "Saturday, June 13, 2026",
    time: "10:00 AM - 12:30 PM",
    venue: "Hybrid (WhatsApp Cohorts & Live Video Room)",
    category: "CII Programs",
    description: "An intensive session on cognitive agility, emotional boundaries in youth leadership, and standard personal goal auditing.",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&fit=crop&q=80",
    price: "Free Access"
  }
];

export default function EventViews({ subView, onNavigate, onOpenJoin }: EventViewsProps) {
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ticketData, setTicketData] = useState({ name: "", email: "", event: "Monthly Leadership Masterclass" });
  const [events, setEvents] = useState<any[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const loadAndSyncEvents = async () => {
      const data = await getEvents();
      if (data && data.length > 0) {
        // Ensure Teen Bootcamp is present in events list
        const hasTeen = data.some((e: any) => e.title?.toLowerCase().includes("teen") || e.id === "evt-teen-bootcamp-2026");
        if (!hasTeen) {
          setEvents([DUMMY_EVENTS[0], ...data]);
        } else {
          setEvents(data);
        }
      } else {
        setEvents(DUMMY_EVENTS);
      }
    };
    loadAndSyncEvents();

    window.addEventListener("rma_events_updated", loadAndSyncEvents);
    return () => window.removeEventListener("rma_events_updated", loadAndSyncEvents);
  }, []);

  const resolveFlyerImage = (evt: any) => {
    const url = evt.bannerUrl || evt.bannerImage || evt.imageUrl || evt.flyerUrl;
    if (
      !url ||
      url === "teen_bootcamp_2026_flyer.png" ||
      url === "teen_bootcamp" ||
      url.includes("teen_bootcamp") ||
      url.includes("teenager") ||
      evt.title?.toLowerCase().includes("teen")
    ) {
      return teenBootcampFlyer;
    }
    return url;
  };

  const handleBookTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.name || !ticketData.email) return;
    setSuccess(`Ticket Booked! Congratulations ${ticketData.name}, your virtual calendar slip has been registered for the ${ticketData.event}. Check your inbox (${ticketData.email}) for access coordinates.`);
    setTicketData({ name: "", email: "", event: "Monthly Leadership Masterclass" });
    setTimeout(() => setSuccess(""), 8000);
  };

  const upcomingEventsList = [
    {
      title: "Monthly Development Leadership Masterclass",
      date: "Saturday, June 13, 2026",
      time: "10:00 AM - 12:30 PM",
      location: "Hybrid (WhatsApp Cohorts & Live Video Room)",
      badge: "Monthly Seminar Series",
      desc: "An intensive session on cognitive agility, emotional boundaries in youth leadership, and standard personal goal auditing."
    },
    {
      title: "Summer Teenage Skill Bootcamp: Digital & Leadership Skills",
      date: "August 3 - August 31, 2026",
      time: "4 Weeks (Intensive Weekdays)",
      location: "Hybrid (Ogbomoso Center & Live Virtual Classroom)",
      badge: "Summer Youth Bootcamps",
      desc: "An intensive summer school designed specifically for teenagers to build highly practical competencies: graphic design basics, creative writing, digital literacy, time management SOPs, and confident public representation."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Background spotlights */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10 font-sans">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-905">Events</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-amber-550 capitalize">{subView.replace("-", " ")}</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="events-mobile-section-nav">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[#0E3A2F]/50 font-mono mb-1.5">
            📂 Events Subsections Navigation
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#FAF8F3]/60 border border-[#0E3A2F]/10 rounded-2xl text-xs font-black uppercase text-slate-800 tracking-wider shadow-sm focus:outline-none"
          >
            <span>
              {subView === "upcoming" && "Upcoming Leadership Sessions"}
              {subView === "calendar" && "RMA Operational Calendar"}
              {subView === "past" && "Past Event Archives & Memories"}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 text-slate-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1 text-left"
              >
                {[
                  { label: "Upcoming Leadership Sessions", view: "events-upcoming" },
                  { label: "RMA Operational Calendar", view: "events-calendar" },
                  { label: "Past Event Archives & Memories", view: "events-past" }
                ].map((option) => {
                  const isActive = "events-" + subView === option.view;
                  return (
                    <button
                      key={option.view}
                      onClick={() => {
                        onNavigate(option.view);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-[#0E3A2F] text-white" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section title */}
        <div className="max-w-3xl space-y-4 mb-12 border-l-4 border-slate-900 pl-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Sparkles size={11} /> Scheduling & Archives
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
            {subView === "upcoming" && "Upcoming Leadership Sessions"}
            {subView === "calendar" && "RMA Operational Calendar"}
            {subView === "past" && "Past Event Archives & Memories"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {subView === "upcoming" && "Stay aligned with active coaching schedules, emotional intelligence webinars, and physical commands conferences across states."}
            {subView === "calendar" && "Access our structured 12-month program planner covering seminars, bootcamps, outreaches, and the annual December G3 series."}
            {subView === "past" && "Revisit past highlights, annual conference mainstages, school book donations, and our high-resolution social hangouts."}
          </p>
        </div>

        {/* Active view layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* UPCOMING EVENTS */}
            {subView === "upcoming" && (
              <div className="space-y-8">
                {events.map((evt, id) => {
                  const title = evt.title || "";
                  const desc = evt.description || evt.desc || "";
                  const date = evt.date || "";
                  const time = evt.time || "";
                  const location = evt.venue || evt.location || "Online";
                  const badge = evt.category || evt.badge || "Event";
                  const flyerSrc = resolveFlyerImage(evt);
                  const isTeen = title.toLowerCase().includes("teen") || evt.id === "evt-teen-bootcamp-2026";

                  return (
                    <div key={id} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                      
                      {/* Event Flyer Banner Image */}
                      <div 
                        onClick={() => setLightboxImage({ src: flyerSrc, title })}
                        className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer group min-h-[220px] max-h-[420px] border-b border-slate-200"
                        title="Click to view full event flyer"
                      >
                        <img 
                          src={flyerSrc} 
                          alt={title}
                          className="w-full h-auto max-h-[420px] object-contain object-center transition-transform duration-300 group-hover:scale-[1.01]"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Hover Overlay Hint */}
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-4 py-2 bg-slate-900/90 text-amber-300 text-xs font-black uppercase tracking-widest rounded-full shadow-lg border border-amber-300/30 flex items-center gap-2">
                            <Sparkles size={13} /> Tap to expand flyer
                          </span>
                        </div>

                        {/* Top Badge Overlay */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md font-mono">
                            {badge}
                          </span>
                          {isTeen && (
                            <span className="px-3 py-1 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider rounded-full shadow-md font-mono">
                              2026 SPECIAL EDITION
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Event Details Content */}
                      <div className="p-6 sm:p-8 space-y-5">
                        <div className="space-y-2">
                          <h3 className="font-display font-extrabold text-slate-900 text-xl sm:text-2xl uppercase tracking-tight leading-tight">
                            {title}
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                            {desc}
                          </p>
                        </div>
                        
                        {/* Event Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/70 text-xs text-slate-700">
                          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-150">
                            <Calendar size={15} className="text-amber-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Event Date</span>
                              <span className="font-bold text-slate-900 text-xs">{date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-150">
                            <Clock size={15} className="text-amber-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Duration & Time</span>
                              <span className="font-bold text-slate-900 text-xs">{time}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-150">
                            <MapPin size={15} className="text-amber-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Venue Location</span>
                              <span className="font-bold text-slate-900 text-xs truncate">{location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <button
                            onClick={() => setLightboxImage({ src: flyerSrc, title })}
                            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <ExternalLink size={14} />
                            <span>Inspect Official Flyer</span>
                          </button>

                          <button
                            onClick={() => {
                              if (isTeen) {
                                onNavigate("teen-bootcamp");
                              } else {
                                onOpenJoin("student");
                              }
                            }}
                            className="px-6 py-3 bg-[#0E3A2F] hover:bg-[#09261f] text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
                          >
                            <span>{isTeen ? "Register Teenager (₦50,000)" : "Register / Reserve Seat"}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* EVENT CALENDAR */}
            {subView === "calendar" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                  <h3 className="font-bold text-slate-950 text-sm uppercase mb-4">Quarterly Roadmap Planner (2026)</h3>
                  <div className="space-y-4">
                    {[
                      { quarter: "Q1 Planner", months: "Jan • Feb • Mar", focus: "Corper Impact Initiative Launch & High-School Outreaches" },
                      { quarter: "Q2 Planner", months: "Apr • May • Jun", focus: "Monthly Mindset Audits, HR Worksite Standard Operating Procedures Seminars" },
                      { quarter: "Q3 Planner", months: "Jul • Aug • Sep", focus: "Digital Upskilling Bootcamps, Resume Clinics, Portfolio Setup Cycles" },
                      { quarter: "Q4 Planner", months: "Oct • Nov • Dec Planner", focus: "YAP Annual Conference (Nov) & 5-Weekend G3 Series (Dec)" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-150">
                        <span className="font-bold text-[10px] uppercase font-mono tracking-wider px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg shrink-0 h-fit">{item.quarter}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 font-mono">{item.months}</p>
                          <p className="text-xs text-slate-900 font-bold uppercase mt-1">{item.focus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* PAST ARCHIVES & MEMORIES */}
            {subView === "past" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "YAP Annual Conference 2025", category: "YAP Conference", info: "Gathered over 5,000 young leaders physically in Lagos, centering action-led career launching, HR excellence, and spiritual alignments.", sellarLink: "https://sellar.co/m/rightmindsafrica" },
                  { title: "Annual CII Hangout Group Memory (Dec 2025)", category: "CII Program", info: "A vibrant outdoor social gathering celebrating milestones of 3,500+ corps members in Nigeria. Browse the full high-res album instantly on Google Photos.", photoLink: "https://photos.google.com/share/AF1QipNcGoBwOfG3-01OTK8DrrpYAetSJKxTAbTgxXFWr5A89MHkqXmoizxP37BJTkcoiw?key=NEpJejVub2lQZ2dVb3JxNDBGSUxXT0lpMU1xMWNn", sellarLink: "https://sellar.co/m/rightmindsafrica" },
                  { title: "Secondary School Books Giveaway Program", category: "Right-Minded Teens", info: "Supplied over 500 academic books, daily study planners, and growth mindset outlines to high-school students in Ogbomoso.", sellarLink: "https://sellar.co/m/rightmindsafrica" }
                ].map((past, id) => (
                  <div key={id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold tracking-wider text-amber-600 uppercase font-mono">{past.category}</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase">{past.title}</h4>
                      <p className="text-slate-550 text-xs leading-relaxed font-normal">{past.info}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {past.photoLink && (
                        <a 
                          href={past.photoLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase"
                        >
                          View High-Res Album &rarr;
                        </a>
                      )}
                      {past.sellarLink && (
                        <a 
                          href={past.sellarLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                        >
                          Get Flyer & Records on Sellar &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Quick Registration / Booking tickets Form */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-3xl sticky top-28 shadow-sm">
            <div className="space-y-4">
              <span className="text-amber-600 font-bold font-mono text-[10px] tracking-widest uppercase block">SESSION ENTRY PASS</span>
              <h3 className="text-lg font-bold text-slate-900 uppercase">Book Secure Ticket</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Avoid missing out on active coaching masterclasses. Claim your access pass and secure your seat.
              </p>
            </div>

            {success ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                {success}
              </motion.div>
            ) : (
              <form onSubmit={handleBookTicket} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Select Session</label>
                  <select 
                    value={ticketData.event}
                    onChange={(e) => setTicketData({...ticketData, event: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  >
                    <option value="Monthly Leadership Masterclass">Monthly Leadership Masterclass (June 13)</option>
                    <option value="Summer Teenage Skill Bootcamp">Summer Teenage Skill Bootcamp: Digital & Leadership Skills (August 3)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Your Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={ticketData.name}
                    onChange={(e) => setTicketData({...ticketData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Your Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={ticketData.email}
                    onChange={(e) => setTicketData({...ticketData, email: e.target.value})}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer transition-all"
                >
                  Acquire Access Pass
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-[10px] text-slate-400">
              <Clock size={12} className="text-amber-500 animate-pulse" />
              <span>All tickets are strictly complimentary but registration is required.</span>
            </div>
          </div>

        </div>

        {/* High-Resolution Event Flyer Lightbox Modal */}
        <AnimatePresence>
          {lightboxImage && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col items-center justify-center p-2 sm:p-4"
              >
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-4 right-4 z-30 p-2.5 text-slate-100 hover:text-white bg-slate-800/90 hover:bg-slate-800 rounded-full cursor-pointer shadow-xl border border-slate-600 transition-all hover:scale-110"
                  title="Close flyer preview"
                >
                  <X size={20} />
                </button>
                <img
                  src={lightboxImage.src}
                  alt={lightboxImage.title}
                  className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-3 flex items-center justify-between w-full px-4 text-xs text-slate-400 font-mono">
                  <span>{lightboxImage.title}</span>
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Close Lightbox
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </PageContainer>
    </div>
  );
}
