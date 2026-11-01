/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Plus, 
  Minus, 
  Lock, 
  Sun, 
  Moon, 
  Search, 
  Phone, 
  Calendar, 
  BookOpen, 
  HelpCircle, 
  ArrowRight,
  GraduationCap,
  Sparkles
} from "lucide-react";
import brandLogo from "../assets/images/brand_logo_official_new_1780385523572.png";
import { MarqueeConfig } from "../lib/db";
import { getCMSConfig } from "./AdminCMS";
import { useBrandConfig } from "../lib/brandConfig";

interface SearchResult {
  title: string;
  category: "event" | "resource" | "faq";
  description: string;
  view: string;
}

const SEARCH_DATABASE: SearchResult[] = [
  // Events & Programs
  {
    title: "YAP Conference (Youth Advisory Program)",
    category: "event",
    description: "Annual leadership and career acceleration bootcamp in Nigeria for change makers.",
    view: "initiatives-yap"
  },
  {
    title: "G3 Program (God • Growth • Goals)",
    category: "event",
    description: "Annual 5-Saturday December & January leadership and strategic execution fellowship.",
    view: "initiatives-g3"
  },
  {
    title: "Upcoming Events",
    category: "event",
    description: "View upcoming RMA and CII calendar schedules, times, and entry links.",
    view: "events-upcoming"
  },
  {
    title: "Event Calendar",
    category: "event",
    description: "Interactive calendar with times, batches, and locations for leadership summits.",
    view: "events-calendar"
  },
  {
    title: "Past Events Archive",
    category: "event",
    description: "Browse historical photos, record archives, and recaps of previous events.",
    view: "events-past"
  },
  {
    title: "Monthly Seminar Series",
    category: "event",
    description: "Foundational, 100% free leadership workshops hosted by right-minded mentors.",
    view: "programs-seminar"
  },
  {
    title: "Monthly Reinvention Program",
    category: "event",
    description: "Intensive premium paid track supporting high-touch coaching loops and resource guides.",
    view: "programs-reinvention"
  },
  {
    title: "Leadership Development Programs",
    category: "event",
    description: "Structured pathways to high moral character development and professional skills.",
    view: "programs-leadership"
  },
  {
    title: "Summer Skill Bootcamp",
    category: "event",
    description: "Hands-on tech skills and remote freelancing guide bootcamp during holidays.",
    view: "programs-bootcamps"
  },
  {
    title: "Teen Bootcamp 2026",
    category: "event",
    description: "Empowering teenagers with character, mindset, and academic leadership systems.",
    view: "teen-bootcamp"
  },
  {
    title: "Community Projects",
    category: "event",
    description: "Grassroots outreach, education charity projects, and youth community development.",
    view: "initiatives-projects"
  },

  // Courses
  {
    title: "Browse Courses & Masterclasses",
    category: "resource",
    description: "Explore accredited courses, digital modules, and career growth certifications.",
    view: "courses"
  },
  {
    title: "My Learning Dashboard",
    category: "resource",
    description: "Access your enrolled classes, syllabus modules, and course progress.",
    view: "my-learning"
  },

  // Resources
  {
    title: "Articles / Blog Posts",
    category: "resource",
    description: "Growth mindset guides, freelance business articles, and leadership systems.",
    view: "resources-articles"
  },
  {
    title: "Videos & Workshops",
    category: "resource",
    description: "Recorded masterclasses, digital workshops, and YouTube tutorials archive.",
    view: "resources-videos"
  },
  {
    title: "Podcasts Audio Broadcasts",
    category: "resource",
    description: "Audio recordings covering life lessons, habit audits, and startup strategies.",
    view: "resources-podcasts"
  },
  {
    title: "Downloads (PDFs & Workbooks)",
    category: "resource",
    description: "Downloadable PDF workbook files, habit tracking blueprints, and guides.",
    view: "resources-downloads"
  },
  {
    title: "Photo Gallery Hub",
    category: "resource",
    description: "Vibrant archives of past bootcamp graduates, corporate staff events, and social initiatives.",
    view: "resources-gallery"
  },
  {
    title: "CII Initiative (Corper Impact Initiative)",
    category: "resource",
    description: "Check the Corper Impact Initiative curriculum tiers, fellowship features, and mentorship.",
    view: "initiatives-cii"
  },

  // About & Impact
  {
    title: "About RMA Overview",
    category: "resource",
    description: "Learn about the mission, history, and founding story of Right Minds Africa Hub.",
    view: "about-overview"
  },
  {
    title: "Impact Dashboard & Statistics",
    category: "resource",
    description: "Verified metrics, youth reached, and commands mobilized across Nigeria.",
    view: "impact-dashboard"
  },
  {
    title: "Stories of Change",
    category: "resource",
    description: "Read first-hand accounts and career testimonials from RMA alumni.",
    view: "impact-stories"
  },
  {
    title: "Volunteer & Partner",
    category: "resource",
    description: "Apply as a volunteer, mentor, facilitator, or corporate partner with Right Minds Africa.",
    view: "get-involved-volunteer"
  },

  // FAQs
  {
    title: "Is Right Minds Africa Hub a religious or political organization?",
    category: "faq",
    description: "No. We are an independent, non-political educational academy open to all passionate youth.",
    view: "resources-faqs"
  },
  {
    title: "How do I register or join the CII (Corper Impact Initiative)?",
    category: "faq",
    description: "Click 'Join RMA Community' or visit the CII page to select your fellowship track.",
    view: "resources-faqs"
  },
  {
    title: "Do you charge fees for your programs or mentorship hubs?",
    category: "faq",
    description: "Seminars and standard hubs are 100% free. Specialized intensives have sponsored seats.",
    view: "resources-faqs"
  },
  {
    title: "Can I join as a Mentor or Volunteer partner?",
    category: "faq",
    description: "Yes! Young professionals and corporate partners can apply under the Volunteer option.",
    view: "resources-faqs"
  },
  {
    title: "Is the Corper Impact Initiative (CII) totally free?",
    category: "faq",
    description: "CII offers free tiers and high-touch VIP subscription options with placement guarantees.",
    view: "resources-faqs"
  }
];

interface NavbarProps {
  onOpenJoin: (profile?: string) => void;
  currentView: string;
  setView: (view: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  marqueeConfig?: MarqueeConfig;
}

interface DropdownItem {
  label: string;
  view: string;
  description?: string;
  badge?: string;
}

interface DropdownGroup {
  heading?: string;
  items: DropdownItem[];
}

interface DropdownConfig {
  title: string;
  id: "about" | "programs" | "courses" | "resources";
  panelWidth: string;
  groups: DropdownGroup[];
}

export default function Navbar({ 
  onOpenJoin, 
  currentView, 
  setView, 
  theme, 
  onToggleTheme 
}: NavbarProps) {
  const { brand } = useBrandConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);

  const [cms, setCms] = useState(() => getCMSConfig());
  const dropdownCloseTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCms(getCMSConfig());
  }, [currentView]);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const matchingResults = globalSearchQuery.trim() === ""
    ? []
    : SEARCH_DATABASE.filter(item =>
        item.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(globalSearchQuery.toLowerCase())
      );

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchModalOpen(false);
        setGlobalSearchQuery("");
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Admin status check (requires valid server-signed session token)
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

  // Active state calculations
  const isHomeActive = currentView === "home";
  const isAboutActive = 
    currentView.startsWith("about-") || 
    currentView.startsWith("impact-") || 
    currentView.startsWith("get-involved-");
  const isProgramsActive = 
    currentView.startsWith("programs-") || 
    currentView === "initiatives-yap" || 
    currentView === "initiatives-g3" || 
    currentView === "initiatives-projects" || 
    currentView.startsWith("events-") || 
    currentView === "teen-bootcamp";
  const isCiiActive = currentView === "initiatives-cii";
  const isCoursesActive = currentView === "courses" || currentView === "my-learning";
  const isResourcesActive = currentView.startsWith("resources-");
  const isContactActive = currentView === "contact";

  // Dropdown Configurations grouped according to exact specification
  const DROPDOWNS: DropdownConfig[] = [
    {
      title: "About",
      id: "about",
      panelWidth: "w-[660px]",
      groups: [
        {
          heading: "Identity & Foundation",
          items: [
            { label: "Overview", view: "about-overview", description: "Our story, mission, and foundational principles" },
            { label: "Vision & Mission", view: "about-vision-mission", description: "Strategic mandates for continental youth impact" },
            { label: "Philosophy", view: "about-philosophy", description: "The Think • Live • Lead cognitive model" },
            { label: "Core Team", view: "about-team", description: "Executive directors, coaches, and advisory council" }
          ]
        },
        {
          heading: "Impact & Accountability",
          items: [
            { label: "Impact Dashboard", view: "impact-dashboard", description: "Verified metrics, youth reached, and coverage" },
            { label: "Stories of Change", view: "impact-stories", description: "Documented alumni transformations & testimonials" },
            { label: "Annual Reports", view: "impact-reports", description: "Annual operational and stewardship reviews" }
          ]
        },
        {
          heading: "Get Involved",
          items: [
            { label: "Join Community", view: "get-involved-community", description: "Register into local command cohorts" },
            { label: "Volunteer", view: "get-involved-volunteer", description: "Contribute skills to executive departments" },
            { label: "Partner With Us", view: "get-involved-partner", description: "Corporate and institutional alliances" },
            { label: "Donate", view: "get-involved-donate", description: "Support youth education scholarships" }
          ]
        }
      ]
    },
    {
      title: "Programs",
      id: "programs",
      panelWidth: "w-[720px]",
      groups: [
        {
          heading: "Flagship Programs",
          items: [
            { label: "Monthly Seminar", view: "programs-seminar", description: "Open foundational leadership workshops" },
            { label: "Monthly Reinvention", view: "programs-reinvention", description: "High-touch personal transformation sprints" },
            { label: "Leadership Development", view: "programs-leadership", description: "Character building and executive competence" },
            { label: "Summer Skill Bootcamp", view: "programs-bootcamps", description: "Practical tech and freelancing training" },
            { label: "Teen Bootcamp 2026", view: "teen-bootcamp", description: "Secondary school character and mindset camp" }
          ]
        },
        {
          heading: "Initiatives & Projects",
          items: [
            { label: "YAP Conference", view: "initiatives-yap", description: "Youth Advisory Program leadership summit" },
            { label: "G3 Program", view: "initiatives-g3", description: "God, Growth & Goals 5-Saturday leadership fellowship" },
            { label: "Community Projects", view: "initiatives-projects", description: "Grassroots SDG impact and local outreach" }
          ]
        },
        {
          heading: "Events & Calendar",
          items: [
            { label: "Upcoming Events", view: "events-upcoming", description: "Live schedules, dates, and access passes" },
            { label: "Event Calendar", view: "events-calendar", description: "Interactive timeline and schedule grid" },
            { label: "Past Events Archive", view: "events-past", description: "Historical gallery, recaps, and recaps" }
          ]
        }
      ]
    },
    {
      title: "Courses",
      id: "courses",
      panelWidth: "w-[340px]",
      groups: [
        {
          heading: "Digital Academy",
          items: [
            { label: "Browse Courses", view: "courses", description: "Explore digital curriculums, masterclasses & tracks" },
            { label: "My Learning Dashboard", view: "my-learning", description: "Access enrolled courses, modules & progress" }
          ]
        }
      ]
    },
    {
      title: "Resources",
      id: "resources",
      panelWidth: "w-[520px]",
      groups: [
        {
          heading: "Media & Learning",
          items: [
            { label: "Articles / Blog", view: "resources-articles", description: "Thought leadership, growth essays, and guides" },
            { label: "Videos & Workshops", view: "resources-videos", description: "Recorded masterclasses and video sessions" },
            { label: "Podcasts", view: "resources-podcasts", description: "Audio broadcasts on leadership and habits" }
          ]
        },
        {
          heading: "Tools & Knowledge",
          items: [
            { label: "Downloads & Workbooks", view: "resources-downloads", description: "PDF guides, blueprints, and templates" },
            { label: "Photo Gallery", view: "resources-gallery", description: "High-resolution archives of cohorts & summits" },
            { label: "FAQs (RMA & CII)", view: "resources-faqs", description: "Answers to common inquiries and guidelines" }
          ]
        }
      ]
    }
  ];

  const handleItemClick = (view: string) => {
    setView(view);
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileExpandedGroup(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMouseEnterDropdown = (id: string) => {
    if (dropdownCloseTimeout.current) {
      clearTimeout(dropdownCloseTimeout.current);
      dropdownCloseTimeout.current = null;
    }
    setActiveDropdown(id);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownCloseTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  const toggleMobileGroup = (id: string) => {
    setMobileExpandedGroup(prev => prev === id ? null : id);
  };

  return (
    <>
      <header
        id="global-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80"
            : "bg-white dark:bg-slate-950 border-b border-slate-150 dark:border-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[68px]">
            
            {/* BRAND LOGO */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => handleItemClick("home")}
                className="flex items-center gap-2.5 cursor-pointer text-left py-1 shrink-0 group"
                id="navbar-logo-btn"
                title={`${brand.brandName} Home`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden shrink-0 group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-colors">
                  <img
                    src={brand.logoUrl || brandLogo}
                    alt={`${brand.brandName} Logo`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display font-black text-sm sm:text-[15px] leading-none tracking-tight text-slate-900 dark:text-white uppercase">
                    {brand.brandShortName}
                  </span>
                  <span className="text-[7.5px] font-bold tracking-widest text-brand-orange uppercase leading-none mt-1 font-mono">
                    {brand.brandSubTitle}
                  </span>
                </div>
              </button>
            </div>

            {/* DESKTOP NAVIGATION ITEMS (Clean, Spacious, Professional) */}
            <nav 
              className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3 px-2" 
              id="navbar-desktop-nav"
              aria-label="Main Navigation"
            >
              {/* 1. Home */}
              <button
                onClick={() => handleItemClick("home")}
                className={`relative px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                  isHomeActive
                    ? "font-bold text-brand-blue dark:text-amber-400"
                    : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span>Home</span>
                {isHomeActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-blue dark:bg-amber-400 rounded-full" />
                )}
              </button>

              {/* 2. About ▾ */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMouseEnterDropdown("about")}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "about" ? null : "about")}
                  className={`relative flex items-center gap-1 px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                    isAboutActive
                      ? "font-bold text-brand-blue dark:text-amber-400"
                      : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                  aria-expanded={activeDropdown === "about"}
                >
                  <span>About</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "about" ? "rotate-180 text-brand-blue dark:text-amber-400" : "text-slate-400"
                    }`}
                  />
                  {isAboutActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-blue dark:bg-amber-400 rounded-full" />
                  )}
                </button>

                {/* About Mega Dropdown */}
                <AnimatePresence>
                  {activeDropdown === "about" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 mt-1 w-[680px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 p-5 z-50 text-left"
                    >
                      <div className="grid grid-cols-3 gap-5">
                        {DROPDOWNS.find(d => d.id === "about")?.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                              {group.heading}
                            </span>
                            <div className="space-y-0.5 pt-1">
                              {group.items.map((item) => (
                                <button
                                  key={item.view}
                                  onClick={() => handleItemClick(item.view)}
                                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors cursor-pointer group flex flex-col ${
                                    currentView === item.view
                                      ? "bg-slate-100 dark:bg-slate-800/80 text-brand-blue dark:text-amber-400 font-bold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                  }`}
                                >
                                  <span className="text-xs font-semibold group-hover:text-brand-blue dark:group-hover:text-amber-400 transition-colors">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                                      {item.description}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Programs ▾ */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMouseEnterDropdown("programs")}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "programs" ? null : "programs")}
                  className={`relative flex items-center gap-1 px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                    isProgramsActive
                      ? "font-bold text-brand-blue dark:text-amber-400"
                      : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                  aria-expanded={activeDropdown === "programs"}
                >
                  <span>Programs</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "programs" ? "rotate-180 text-brand-blue dark:text-amber-400" : "text-slate-400"
                    }`}
                  />
                  {isProgramsActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-blue dark:bg-amber-400 rounded-full" />
                  )}
                </button>

                {/* Programs Mega Dropdown */}
                <AnimatePresence>
                  {activeDropdown === "programs" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute -left-20 mt-1 w-[740px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 p-5 z-50 text-left"
                    >
                      <div className="grid grid-cols-3 gap-5">
                        {DROPDOWNS.find(d => d.id === "programs")?.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                              {group.heading}
                            </span>
                            <div className="space-y-0.5 pt-1">
                              {group.items.map((item) => (
                                <button
                                  key={item.view}
                                  onClick={() => handleItemClick(item.view)}
                                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors cursor-pointer group flex flex-col ${
                                    currentView === item.view
                                      ? "bg-slate-100 dark:bg-slate-800/80 text-brand-blue dark:text-amber-400 font-bold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                  }`}
                                >
                                  <span className="text-xs font-semibold group-hover:text-brand-blue dark:group-hover:text-amber-400 transition-colors">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                                      {item.description}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. CII (Dedicated Top-Level Item as specified) */}
              <button
                onClick={() => handleItemClick("initiatives-cii")}
                className={`relative px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5 ${
                  isCiiActive
                    ? "font-bold text-brand-orange dark:text-amber-400"
                    : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
                title="Corper Impact Initiative Fellowship"
              >
                <span>CII</span>
                <span className="px-1.5 py-0.5 bg-brand-orange/10 text-brand-orange dark:text-amber-400 text-[9px] font-bold rounded-md font-mono uppercase tracking-tight">
                  NYSC
                </span>
                {isCiiActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-orange dark:bg-amber-400 rounded-full" />
                )}
              </button>

              {/* 5. Courses ▾ */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMouseEnterDropdown("courses")}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "courses" ? null : "courses")}
                  className={`relative flex items-center gap-1 px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                    isCoursesActive
                      ? "font-bold text-brand-blue dark:text-amber-400"
                      : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                  aria-expanded={activeDropdown === "courses"}
                >
                  <span>Courses</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "courses" ? "rotate-180 text-brand-blue dark:text-amber-400" : "text-slate-400"
                    }`}
                  />
                  {isCoursesActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-blue dark:bg-amber-400 rounded-full" />
                  )}
                </button>

                {/* Courses Dropdown */}
                <AnimatePresence>
                  {activeDropdown === "courses" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 mt-1 w-[320px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 p-3 z-50 text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-3 py-1">
                          Digital Academy
                        </span>
                        {DROPDOWNS.find(d => d.id === "courses")?.groups[0].items.map((item) => (
                          <button
                            key={item.view}
                            onClick={() => handleItemClick(item.view)}
                            className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer group flex items-start gap-3 ${
                              currentView === item.view
                                ? "bg-slate-100 dark:bg-slate-800 text-brand-blue dark:text-amber-400"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-brand-blue/10 dark:group-hover:bg-amber-400/10 group-hover:text-brand-blue dark:group-hover:text-amber-400 transition-colors shrink-0">
                              <GraduationCap size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight group-hover:text-brand-blue dark:group-hover:text-amber-400 transition-colors">
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
                                {item.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 6. Resources ▾ */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMouseEnterDropdown("resources")}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "resources" ? null : "resources")}
                  className={`relative flex items-center gap-1 px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                    isResourcesActive
                      ? "font-bold text-brand-blue dark:text-amber-400"
                      : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                  aria-expanded={activeDropdown === "resources"}
                >
                  <span>Resources</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "resources" ? "rotate-180 text-brand-blue dark:text-amber-400" : "text-slate-400"
                    }`}
                  />
                  {isResourcesActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-blue dark:bg-amber-400 rounded-full" />
                  )}
                </button>

                {/* Resources Dropdown */}
                <AnimatePresence>
                  {activeDropdown === "resources" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute -left-12 mt-1 w-[520px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 p-5 z-50 text-left"
                    >
                      <div className="grid grid-cols-2 gap-5">
                        {DROPDOWNS.find(d => d.id === "resources")?.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                              {group.heading}
                            </span>
                            <div className="space-y-0.5 pt-1">
                              {group.items.map((item) => (
                                <button
                                  key={item.view}
                                  onClick={() => handleItemClick(item.view)}
                                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors cursor-pointer group flex flex-col ${
                                    currentView === item.view
                                      ? "bg-slate-100 dark:bg-slate-800/80 text-brand-blue dark:text-amber-400 font-bold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                  }`}
                                >
                                  <span className="text-xs font-semibold group-hover:text-brand-blue dark:group-hover:text-amber-400 transition-colors">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                                      {item.description}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 7. Contact */}
              <button
                onClick={() => handleItemClick("contact")}
                className={`relative px-3 py-2 text-xs xl:text-[13px] tracking-wide cursor-pointer transition-colors duration-150 whitespace-nowrap ${
                  isContactActive
                    ? "font-bold text-brand-blue dark:text-amber-400"
                    : "font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span>Contact</span>
                {isContactActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-blue dark:bg-amber-400 rounded-full" />
                )}
              </button>
            </nav>

            {/* RIGHT SIDE: UTILITY CONTROLS + PRIMARY CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Phone icon button (Call direct) */}
              <a
                href={`tel:${(cms.contactPhone || "+234 701 667 0172").replace(/[^0-9+]/g, "")}`}
                className="hidden xl:flex p-2 rounded-xl border transition-all cursor-pointer items-center justify-center bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                id="phone-cta-button"
                title={`Call Us: ${cms.contactPhone || "+234 701 667 0172"}`}
              >
                <Phone size={13} className="shrink-0" />
              </a>

              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 border rounded-xl transition-all text-xs font-semibold cursor-pointer bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Search Site (Ctrl+K)"
                id="search-trigger-desktop"
              >
                <Search size={14} className="shrink-0" />
                <span className="hidden xl:inline text-[11px] text-slate-400">Search</span>
                <kbd className="hidden xl:inline-flex px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[9px] font-mono rounded text-slate-500 dark:text-slate-400 select-none shadow-2xs leading-none">⌘K</kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl border transition-all cursor-pointer shrink-0 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                aria-label="Toggle visual theme"
              >
                {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              {/* Admin Dashboard shortcut when logged in */}
              {(isAdminLoggedIn || currentView === "admin") && (
                <button
                  onClick={() => handleItemClick("admin")}
                  className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    currentView === "admin"
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "bg-brand-blue/10 text-brand-blue border-brand-blue/35 font-bold"
                  }`}
                  title="Admin Settings Dashboard"
                >
                  <Lock size={13} />
                </button>
              )}

              {/* PRIMARY CTA (Exact existing text & action preserved) */}
              <button
                onClick={() => onOpenJoin("corps_member")}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-[12.5px] font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-xs shrink-0 active:scale-[0.98]"
                id="navbar-primary-cta"
              >
                Join RMA Community
              </button>

              {/* Mobile Menu Hamburger Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl border transition-all cursor-pointer shrink-0 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={isOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>

          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER (Clean Accordion System) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-y-auto max-h-[85vh]"
              id="mobile-navigation-drawer"
            >
              <div className="px-5 py-4 space-y-3">
                
                {/* Search in mobile drawer */}
                <div 
                  onClick={() => {
                    setIsOpen(false);
                    setIsSearchModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-400 text-xs cursor-pointer"
                >
                  <Search size={15} />
                  <span>Search pages, courses, programs...</span>
                </div>

                {/* 1. Home */}
                <button
                  onClick={() => handleItemClick("home")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                    isHomeActive
                      ? "text-brand-blue dark:text-amber-400 bg-slate-100 dark:bg-slate-800"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  Home
                </button>

                {/* 2. About + */}
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-1">
                  <button
                    onClick={() => toggleMobileGroup("about")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      isAboutActive
                        ? "text-brand-blue dark:text-amber-400 bg-slate-50 dark:bg-slate-800/40"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>About</span>
                    <span className="text-slate-400">
                      {mobileExpandedGroup === "about" ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {mobileExpandedGroup === "about" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-1 py-1 space-y-1 overflow-hidden"
                      >
                        {DROPDOWNS.find(d => d.id === "about")?.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-0.5 pt-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-3 py-1">
                              {group.heading}
                            </span>
                            {group.items.map((item) => (
                              <button
                                key={item.view}
                                onClick={() => handleItemClick(item.view)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                  currentView === item.view
                                    ? "text-brand-blue dark:text-amber-400 font-bold bg-slate-100 dark:bg-slate-800"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <span>{item.label}</span>
                                <ArrowRight size={12} className="opacity-40" />
                              </button>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Programs + */}
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-1">
                  <button
                    onClick={() => toggleMobileGroup("programs")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      isProgramsActive
                        ? "text-brand-blue dark:text-amber-400 bg-slate-50 dark:bg-slate-800/40"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>Programs</span>
                    <span className="text-slate-400">
                      {mobileExpandedGroup === "programs" ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {mobileExpandedGroup === "programs" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-1 py-1 space-y-1 overflow-hidden"
                      >
                        {DROPDOWNS.find(d => d.id === "programs")?.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-0.5 pt-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-3 py-1">
                              {group.heading}
                            </span>
                            {group.items.map((item) => (
                              <button
                                key={item.view}
                                onClick={() => handleItemClick(item.view)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                  currentView === item.view
                                    ? "text-brand-blue dark:text-amber-400 font-bold bg-slate-100 dark:bg-slate-800"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <span>{item.label}</span>
                                <ArrowRight size={12} className="opacity-40" />
                              </button>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. CII (Direct primary navigation item) */}
                <button
                  onClick={() => handleItemClick("initiatives-cii")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-between ${
                    isCiiActive
                      ? "text-amber-700 dark:text-amber-400 bg-amber-500/10 font-black"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>CII (Corper Impact Initiative)</span>
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-400 text-[9px] font-mono rounded font-bold">
                      NYSC
                    </span>
                  </div>
                  <ArrowRight size={14} className="opacity-60" />
                </button>

                {/* 5. Courses + */}
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-1">
                  <button
                    onClick={() => toggleMobileGroup("courses")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      isCoursesActive
                        ? "text-brand-blue dark:text-amber-400 bg-slate-50 dark:bg-slate-800/40"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>Courses</span>
                    <span className="text-slate-400">
                      {mobileExpandedGroup === "courses" ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {mobileExpandedGroup === "courses" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-1 py-1 space-y-1 overflow-hidden"
                      >
                        {DROPDOWNS.find(d => d.id === "courses")?.groups[0].items.map((item) => (
                          <button
                            key={item.view}
                            onClick={() => handleItemClick(item.view)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              currentView === item.view
                                ? "text-brand-blue dark:text-amber-400 font-bold bg-slate-100 dark:bg-slate-800"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <span>{item.label}</span>
                            <ArrowRight size={12} className="opacity-40" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 6. Resources + */}
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-1">
                  <button
                    onClick={() => toggleMobileGroup("resources")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      isResourcesActive
                        ? "text-brand-blue dark:text-amber-400 bg-slate-50 dark:bg-slate-800/40"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>Resources</span>
                    <span className="text-slate-400">
                      {mobileExpandedGroup === "resources" ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {mobileExpandedGroup === "resources" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-1 py-1 space-y-1 overflow-hidden"
                      >
                        {DROPDOWNS.find(d => d.id === "resources")?.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-0.5 pt-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-3 py-1">
                              {group.heading}
                            </span>
                            {group.items.map((item) => (
                              <button
                                key={item.view}
                                onClick={() => handleItemClick(item.view)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                  currentView === item.view
                                    ? "text-brand-blue dark:text-amber-400 font-bold bg-slate-100 dark:bg-slate-800"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <span>{item.label}</span>
                                <ArrowRight size={12} className="opacity-40" />
                              </button>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 7. Contact */}
                <button
                  onClick={() => handleItemClick("contact")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                    isContactActive
                      ? "text-brand-blue dark:text-amber-400 bg-slate-100 dark:bg-slate-800"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  Contact
                </button>

                {/* Mobile Primary CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenJoin("corps_member");
                    }}
                    className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    <span>Join RMA Community</span>
                  </button>
                </div>

                {/* Mobile Utility Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <button
                    onClick={onToggleTheme}
                    className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
                    <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                  </button>

                  <a
                    href={`tel:${(cms.contactPhone || "+234 701 667 0172").replace(/[^0-9+]/g, "")}`}
                    className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer text-center"
                  >
                    <Phone size={13} />
                    <span>Call Desk</span>
                  </a>

                  {(isAdminLoggedIn || currentView === "admin") && (
                    <button
                      onClick={() => handleItemClick("admin")}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                      title="Admin Dashboard"
                    >
                      <Lock size={13} />
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* GLOBAL SEARCH / COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[15vh] px-4" id="global-search-modal-container">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSearchModalOpen(false);
                setGlobalSearchQuery("");
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              id="search-backdrop"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-20 flex flex-col font-sans"
              id="search-box-modal"
            >
              {/* Search Bar Input Block */}
              <div className="relative flex items-center border-b border-slate-100 dark:border-slate-800 p-4">
                <Search className="absolute left-5 text-slate-400" size={18} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search pages, courses, programs & FAQs..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-12 outline-none border-none ring-0 text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 font-medium"
                />
                
                <div className="absolute right-4 flex items-center gap-1.5">
                  {globalSearchQuery && (
                    <button
                      onClick={() => setGlobalSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Clear Search"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono rounded text-slate-500 select-none shadow-2xs leading-none">ESC</kbd>
                </div>
              </div>

              {/* Dynamic Search Content area */}
              <div className="p-2 max-h-[380px] overflow-y-auto">
                {globalSearchQuery.trim() === "" ? (
                  <div className="py-6 px-4 text-center">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Suggested Topics</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {[
                        { label: "CII Initiative (NYSC)", view: "initiatives-cii" },
                        { label: "Courses & Academy", view: "courses" },
                        { label: "Monthly Reinvention", view: "programs-reinvention" },
                        { label: "YAP Conference", view: "initiatives-yap" },
                        { label: "Summer Bootcamp", view: "programs-bootcamps" },
                        { label: "Impact Dashboard", view: "impact-dashboard" },
                        { label: "Downloads & PDFs", view: "resources-downloads" },
                        { label: "FAQs", view: "resources-faqs" }
                      ].map((sug) => (
                        <button
                          key={sug.label}
                          onClick={() => {
                            handleItemClick(sug.view);
                            setIsSearchModalOpen(false);
                            setGlobalSearchQuery("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition-colors border border-slate-200/60 dark:border-slate-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{sug.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : matchingResults.length === 0 ? (
                  <div className="py-10 px-4 text-center">
                    <HelpCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={24} />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No matching pages found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try querying programs, bootcamps, courses, or resources.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {matchingResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleItemClick(item.view);
                          setIsSearchModalOpen(false);
                          setGlobalSearchQuery("");
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer flex items-start gap-3 group"
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.category === "event" && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                              <Calendar size={13} />
                            </span>
                          )}
                          {item.category === "resource" && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                              <BookOpen size={13} />
                            </span>
                          )}
                          {item.category === "faq" && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                              <HelpCircle size={13} />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-blue dark:group-hover:text-amber-400 truncate transition-colors">
                              {item.title}
                            </h5>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Utility Guide line */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Select a result to navigate instantly</span>
                <span className="font-mono">ESC to CLOSE</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
