import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import AboutViews from "./components/pages/AboutViews";
import ProgramViews from "./components/pages/ProgramViews";
import InitiativeViews from "./components/pages/InitiativeViews";
import EventViews from "./components/pages/EventViews";
import ResourceViews from "./components/pages/ResourceViews";
import ImpactViews from "./components/pages/ImpactViews";
import InvolvedViews from "./components/pages/InvolvedViews";
import ContactView from "./components/pages/ContactView";
import CoursesView from "./components/pages/CoursesView";
import TeenBootcampPage from "./components/pages/TeenBootcampPage";
import VolunteerApplicationPage from "./components/pages/VolunteerApplicationPage";
import AdminPortal from "./components/AdminPortal";
import Footer from "./components/Footer";
import JoinModal from "./components/JoinModal";
import CheckInModal from "./components/CheckInModal";
import VerifyEmailPage from "./components/VerifyEmailPage";
import LiveChatWidget from "./components/LiveChatWidget";
import { getMarqueeConfig, MarqueeConfig, DEFAULT_MARQUEE_CONFIG, subscribeToRealtimeUpdates } from "./lib/db";
import { useBrandConfig } from "./lib/brandConfig";

const VIEW_TO_PATH: Record<string, string> = {
  "home": "/",
  "about-overview": "/about",
  "about-vision-mission": "/vision-mission",
  "about-philosophy": "/philosophy",
  "about-team": "/coreteam",
  "impact-dashboard": "/impact",
  "impact-stories": "/impact-stories",
  "impact-reports": "/impact-reports",
  "get-involved-community": "/community",
  "get-involved-volunteer": "/internship",
  "volunteer-application": "/internship",
  "get-involved-partner": "/partner",
  "get-involved-donate": "/donate",
  "programs-seminar": "/seminars",
  "programs-reinvention": "/monthly-reinvention",
  "programs-leadership": "/leadership",
  "programs-bootcamps": "/bootcamps",
  "teen-bootcamp": "/teen-bootcamp",
  "initiatives-cii": "/cii",
  "initiatives-yap": "/yap",
  "initiatives-g3": "/g3",
  "initiatives-projects": "/projects",
  "events-upcoming": "/events",
  "events-calendar": "/calendar",
  "events-past": "/past-events",
  "courses": "/courses",
  "my-learning": "/my-learning",
  "resources-articles": "/articles",
  "resources-videos": "/videos",
  "resources-podcasts": "/podcasts",
  "resources-downloads": "/downloads",
  "resources-gallery": "/gallery",
  "resources-faqs": "/faqs",
  "contact": "/contact",
  "admin": "/admin",
  "verify-email": "/verify-email",
  "verify-email-success": "/verify-email-success",
};

const SLUG_TO_VIEW: Record<string, string> = {
  "": "home",
  "home": "home",
  "index.html": "home",

  // About & Core Team
  "about": "about-overview",
  "about-us": "about-overview",
  "aboutus": "about-overview",
  "overview": "about-overview",
  "about-overview": "about-overview",
  "about/overview": "about-overview",

  "vision-mission": "about-vision-mission",
  "vision": "about-vision-mission",
  "mission": "about-vision-mission",
  "visionandmission": "about-vision-mission",
  "about-vision-mission": "about-vision-mission",
  "about/vision-mission": "about-vision-mission",

  "philosophy": "about-philosophy",
  "our-philosophy": "about-philosophy",
  "about-philosophy": "about-philosophy",
  "about/philosophy": "about-philosophy",

  "coreteam": "about-team",
  "core-team": "about-team",
  "team": "about-team",
  "our-team": "about-team",
  "leadership-team": "about-team",
  "about-team": "about-team",
  "about/team": "about-team",
  "about/coreteam": "about-team",
  "about/core-team": "about-team",

  // Impact
  "impact": "impact-dashboard",
  "impact-dashboard": "impact-dashboard",
  "impact/dashboard": "impact-dashboard",

  "impact-stories": "impact-stories",
  "stories": "impact-stories",
  "stories-of-change": "impact-stories",
  "testimonials": "impact-stories",
  "impact/stories": "impact-stories",

  "impact-reports": "impact-reports",
  "reports": "impact-reports",
  "annual-reports": "impact-reports",
  "impact/reports": "impact-reports",

  // Get Involved
  "community": "get-involved-community",
  "join-community": "get-involved-community",
  "get-involved": "get-involved-community",
  "get-involved-community": "get-involved-community",
  "get-involved/community": "get-involved-community",

  "internship": "volunteer-application",
  "internships": "volunteer-application",
  "intern": "volunteer-application",
  "internship-application": "volunteer-application",
  "apply-for-internship": "volunteer-application",
  "volunteer": "volunteer-application",
  "volunteers": "volunteer-application",
  "volunteer-application": "volunteer-application",
  "apply-to-volunteer": "volunteer-application",
  "get-involved-volunteer": "volunteer-application",
  "get-involved/volunteer": "volunteer-application",
  "get-involved/internship": "volunteer-application",

  "partner": "get-involved-partner",
  "partners": "get-involved-partner",
  "partnership": "get-involved-partner",
  "partner-with-us": "get-involved-partner",
  "get-involved-partner": "get-involved-partner",
  "get-involved/partner": "get-involved-partner",

  "donate": "get-involved-donate",
  "donation": "get-involved-donate",
  "donations": "get-involved-donate",
  "support": "get-involved-donate",
  "give": "get-involved-donate",
  "get-involved-donate": "get-involved-donate",
  "get-involved/donate": "get-involved-donate",

  // Programs
  "seminars": "programs-seminar",
  "seminar": "programs-seminar",
  "monthly-seminar": "programs-seminar",
  "monthly-seminars": "programs-seminar",
  "programs": "programs-seminar",
  "programs-seminar": "programs-seminar",
  "programs/seminar": "programs-seminar",

  "monthly-reinvention": "programs-reinvention",
  "reinvention": "programs-reinvention",
  "programs-reinvention": "programs-reinvention",
  "programs/reinvention": "programs-reinvention",

  "leadership": "programs-leadership",
  "leadership-development": "programs-leadership",
  "programs-leadership": "programs-leadership",
  "programs/leadership": "programs-leadership",

  "bootcamps": "programs-bootcamps",
  "bootcamp": "programs-bootcamps",
  "summer-bootcamp": "programs-bootcamps",
  "skill-bootcamp": "programs-bootcamps",
  "programs-bootcamps": "programs-bootcamps",
  "programs/bootcamps": "programs-bootcamps",

  "teen-bootcamp": "teen-bootcamp",
  "teen-bootcamp-2026": "teen-bootcamp",
  "teenager": "teen-bootcamp",
  "teenagers": "teen-bootcamp",
  "teens": "teen-bootcamp",
  "teen": "teen-bootcamp",
  "teens-bootcamp": "teen-bootcamp",
  "teen-leadership": "teen-bootcamp",
  "teen-leadership-bootcamp": "teen-bootcamp",

  // Initiatives
  "cii": "initiatives-cii",
  "corper-impact": "initiatives-cii",
  "corper-impact-initiative": "initiatives-cii",
  "initiatives-cii": "initiatives-cii",
  "initiatives/cii": "initiatives-cii",

  "yap": "initiatives-yap",
  "yap-conference": "initiatives-yap",
  "youth-advisory-program": "initiatives-yap",
  "initiatives-yap": "initiatives-yap",
  "initiatives/yap": "initiatives-yap",

  "g3": "initiatives-g3",
  "g3-summit": "initiatives-g3",
  "g3summit": "initiatives-g3",
  "g3-program": "initiatives-g3",
  "initiatives-g3": "initiatives-g3",
  "initiatives/g3": "initiatives-g3",

  "projects": "initiatives-projects",
  "community-projects": "initiatives-projects",
  "initiatives": "initiatives-projects",
  "initiatives-projects": "initiatives-projects",
  "initiatives/projects": "initiatives-projects",

  // Events
  "events": "events-upcoming",
  "upcoming-events": "events-upcoming",
  "events-upcoming": "events-upcoming",
  "events/upcoming": "events-upcoming",

  "calendar": "events-calendar",
  "event-calendar": "events-calendar",
  "events-calendar": "events-calendar",
  "events/calendar": "events-calendar",

  "past-events": "events-past",
  "events-past": "events-past",
  "events-archive": "events-past",
  "events/past": "events-past",

  // Courses & Learning
  "courses": "courses",
  "academy": "courses",
  "lms": "courses",

  "my-learning": "my-learning",
  "mylearning": "my-learning",
  "student-dashboard": "my-learning",

  // Resources
  "articles": "resources-articles",
  "blog": "resources-articles",
  "posts": "resources-articles",
  "resources": "resources-articles",
  "resources-articles": "resources-articles",
  "resources/articles": "resources-articles",

  "videos": "resources-videos",
  "video": "resources-videos",
  "workshops": "resources-videos",
  "resources-videos": "resources-videos",
  "resources/videos": "resources-videos",

  "podcasts": "resources-podcasts",
  "podcast": "resources-podcasts",
  "audio": "resources-podcasts",
  "resources-podcasts": "resources-podcasts",
  "resources/podcasts": "resources-podcasts",

  "downloads": "resources-downloads",
  "workbooks": "resources-downloads",
  "ebooks": "resources-downloads",
  "guides": "resources-downloads",
  "resources-downloads": "resources-downloads",
  "resources/downloads": "resources-downloads",

  "gallery": "resources-gallery",
  "photo-gallery": "resources-gallery",
  "photos": "resources-gallery",
  "resources-gallery": "resources-gallery",
  "resources/gallery": "resources-gallery",

  "faqs": "resources-faqs",
  "faq": "resources-faqs",
  "help": "resources-faqs",
  "resources-faqs": "resources-faqs",
  "resources/faqs": "resources-faqs",

  // Contact & Admin
  "contact": "contact",
  "contact-us": "contact",
  "contactus": "contact",
  "reach-us": "contact",

  "admin": "admin",
  "rmaadmin": "admin",
  "portal": "admin",

  "verify-email": "verify-email",
  "verify-email-success": "verify-email-success",
};

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[#/]+/, "")
    .replace(/\/+$/, "")
    .split("?")[0]
    .trim();
}

function resolveViewFromUrl(): string {
  if (typeof window === "undefined") return "home";
  const pathSlug = normalizeSlug(window.location.pathname);
  const hashSlug = normalizeSlug(window.location.hash);
  const search = window.location.search.toLowerCase();

  const urlParams = new URLSearchParams(window.location.search);
  const queryView = normalizeSlug(urlParams.get("view") || "");

  if (queryView && SLUG_TO_VIEW[queryView]) {
    return SLUG_TO_VIEW[queryView];
  }
  if (hashSlug && SLUG_TO_VIEW[hashSlug]) {
    return SLUG_TO_VIEW[hashSlug];
  }
  if (pathSlug && SLUG_TO_VIEW[pathSlug]) {
    return SLUG_TO_VIEW[pathSlug];
  }

  // Fallback prefix matching for nested paths like /courses/123 or /admin/settings
  const firstSegment = pathSlug.split("/")[0];
  if (firstSegment && SLUG_TO_VIEW[firstSegment]) {
    return SLUG_TO_VIEW[firstSegment];
  }

  if (search.includes("rmaadmin")) return "admin";
  if (search.includes("internship") || search.includes("volunteer")) return "volunteer-application";
  if (search.includes("teen")) return "teen-bootcamp";

  return "home";
}

export default function App() {
  const { brand } = useBrandConfig();
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [modalProfile, setModalProfile] = useState<string>("corps_member");
  const [currentView, setCurrentView] = useState<string>(() => resolveViewFromUrl());
  const [marqueeConfig, setMarqueeConfig] = useState<MarqueeConfig>(DEFAULT_MARQUEE_CONFIG);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_theme");
      if (saved === "dark") return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const iconHref = brand.logoUrl || "/favicon.png";
    const rels = ["icon", "shortcut icon", "apple-touch-icon"];
    rels.forEach((rel) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        link.type = "image/png";
        document.head.appendChild(link);
      }
      link.href = iconHref;
    });
  }, [brand.logoUrl]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("rma_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const handleUrlRouting = () => {
      const hashLower = window.location.hash.toLowerCase();
      const pathLower = window.location.pathname.toLowerCase();
      if (hashLower.startsWith("#/join") || pathLower === "/join") {
        const queryPart = hashLower.includes("?") ? hashLower.split("?")[1] : window.location.search;
        const params = new URLSearchParams(queryPart);
        const profile = params.get("profile");
        if (profile) setModalProfile(profile);
        setIsJoinOpen(true);
        return;
      }

      const resolved = resolveViewFromUrl();
      setCurrentView(resolved);
    };

    // Run on initial mount
    handleUrlRouting();

    // Listen to changes
    window.addEventListener("hashchange", handleUrlRouting);
    window.addEventListener("popstate", handleUrlRouting);

    return () => {
      window.removeEventListener("hashchange", handleUrlRouting);
      window.removeEventListener("popstate", handleUrlRouting);
    };
  }, []);

  useEffect(() => {
    const targetPath = VIEW_TO_PATH[currentView] || "/";
    const currentResolved = resolveViewFromUrl();

    // If the current URL does not already resolve to currentView, or if a hash route was used, push the clean canonical path
    if (currentResolved !== currentView || (window.location.hash && !window.location.hash.toLowerCase().startsWith("#/join"))) {
      const preserveSearch =
        currentView === "verify-email" || currentView === "verify-email-success"
          ? window.location.search
          : "";
      window.history.pushState(null, "", `${targetPath}${preserveSearch}`);
    }
  }, [currentView]);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getMarqueeConfig();
      setMarqueeConfig(config);
    };
    loadConfig();

    // Boot real-time listener syncer
    subscribeToRealtimeUpdates();

    window.addEventListener("rma_marquee_updated", loadConfig);
    return () => window.removeEventListener("rma_marquee_updated", loadConfig);
  }, []);

  // Secure admin shortcut trigger: Ctrl+Shift+A (or Cmd+Shift+A) instantly opens the portal gateway
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setCurrentView("admin");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenJoin = (profile?: string) => {
    if (profile) {
      setModalProfile(profile);
    } else {
      setModalProfile("corps_member");
    }
    setIsJoinOpen(true);
  };

  const handleCloseJoin = () => {
    setIsJoinOpen(false);
  };

  const handleNavigate = (viewOrPath: string) => {
    const slug = normalizeSlug(viewOrPath);
    const resolved = SLUG_TO_VIEW[slug] || viewOrPath;
    setCurrentView(resolved);
    if (typeof window !== "undefined") {
      const targetPath = VIEW_TO_PATH[resolved] || "/";
      const preserveSearch =
        resolved === "verify-email" || resolved === "verify-email-success"
          ? window.location.search
          : "";
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState(null, "", `${targetPath}${preserveSearch}`);
      }
    }
  };

  // Subview parsing helpers
  const isAbout = currentView.startsWith("about-");
  const subAbout = isAbout ? (currentView.replace("about-", "") as "overview" | "vision-mission" | "philosophy" | "team") : "overview";

  const isProgram = currentView.startsWith("programs-");
  const subProgram = isProgram ? (currentView.replace("programs-", "") as "seminar" | "reinvention" | "leadership" | "bootcamps") : "seminar";

  const isInitiative = currentView.startsWith("initiatives-");
  const subInitiative = isInitiative ? (currentView.replace("initiatives-", "") as "cii" | "yap" | "g3" | "projects") : "cii";

  const isEvent = currentView.startsWith("events-");
  const subEvent = isEvent ? (currentView.replace("events-", "") as "upcoming" | "calendar" | "past") : "upcoming";

  const isResource = currentView.startsWith("resources-");
  const subResource = isResource ? (currentView.replace("resources-", "") as "articles" | "videos" | "podcasts" | "downloads" | "faqs" | "gallery") : "articles";

  const isImpact = currentView.startsWith("impact-");
  const subImpact = isImpact ? (currentView.replace("impact-", "") as "dashboard" | "stories" | "reports") : "dashboard";

  const isInvolved = currentView.startsWith("get-involved-") && currentView !== "get-involved-volunteer";
  const subInvolved = isInvolved ? (currentView.replace("get-involved-", "") as "community" | "volunteer" | "partner" | "donate") : "community";

  return (
    <div className="relative min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-brand-orange/20 selection:text-brand-blue overflow-x-hidden">
      
      {/* Global Join/Onboarding Modal */}
      <JoinModal
        isOpen={isJoinOpen}
        onClose={handleCloseJoin}
        defaultProfile={modalProfile}
      />

      {/* Sticky Navigation Header */}
      {currentView !== "admin" && (
        <Navbar 
          onOpenJoin={handleOpenJoin} 
          currentView={currentView} 
          setView={handleNavigate} 
          theme={theme}
          onToggleTheme={toggleTheme}
          marqueeConfig={marqueeConfig}
        />
      )}

      {/* Main Routing Screen */}
      <main className="relative z-10 min-h-screen transition-all">
        <AnimatePresence mode="wait">
          
          {currentView === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Homepage onOpenJoin={handleOpenJoin} onNavigate={handleNavigate} />
            </motion.div>
          )}

          {(currentView === "courses" || currentView === "my-learning") && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <CoursesView currentView={currentView} setView={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isAbout && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AboutViews subView={subAbout} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isProgram && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ProgramViews subView={subProgram} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isInitiative && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <InitiativeViews subView={subInitiative} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isEvent && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <EventViews subView={subEvent} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isResource && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ResourceViews subView={subResource} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isImpact && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ImpactViews subView={subImpact} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {isInvolved && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <InvolvedViews subView={subInvolved} onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {(currentView === "volunteer-application" || currentView === "get-involved-volunteer") && (
            <motion.div
              key="volunteer-application"
              className="w-full min-h-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <VolunteerApplicationPage onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {currentView === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ContactView onNavigate={handleNavigate} />
            </motion.div>
          )}

          {currentView === "teen-bootcamp" && (
            <motion.div
              key="teen-bootcamp"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <TeenBootcampPage onNavigate={handleNavigate} onOpenJoin={handleOpenJoin} />
            </motion.div>
          )}

          {currentView === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPortal 
                onBack={() => {
                  handleNavigate("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
              />
            </motion.div>
          )}

          {(currentView === "verify-email" || currentView === "verify-email-success") && (
            <motion.div
              key="verify-email"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <VerifyEmailPage 
                onNavigate={(view) => {
                  handleNavigate(view);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Simple Minimal Footer */}
      {currentView !== "admin" && (
        <>
          <Footer 
            onOpenJoin={handleOpenJoin}
            onViewAdmin={() => {
              handleNavigate("admin");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewTeam={() => {
              handleNavigate("about-team");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewAbout={() => {
              handleNavigate("about-overview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewYap={() => {
              handleNavigate("initiatives-yap");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewFaqs={() => {
              handleNavigate("resources-faqs");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <LiveChatWidget />
        </>
      )}

    </div>
  );
}
