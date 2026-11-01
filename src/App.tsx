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

function resolveViewFromUrl(): string {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  const urlParams = new URLSearchParams(window.location.search);
  const queryView = urlParams.get("view")?.toLowerCase();

  if (queryView === "verify-email") {
    return "verify-email";
  }
  if (queryView === "verify-email-success") {
    return "verify-email-success";
  }
  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    hash === "#/admin" ||
    hash === "#admin" ||
    hash.includes("admin") ||
    path === "/rmaadmin" ||
    path.endsWith("/rmaadmin") ||
    hash.includes("rmaadmin") ||
    search.includes("rmaadmin") ||
    queryView === "admin"
  ) {
    return "admin";
  }
  if (path === "/courses" || path.startsWith("/courses/") || hash === "#/courses" || queryView === "courses") {
    return "courses";
  }
  if (path === "/my-learning" || hash === "#/my-learning" || queryView === "my-learning") {
    return "my-learning";
  }
  if (path === "/monthly-reinvention" || hash === "#/monthly-reinvention") {
    return "programs-reinvention";
  }
  if (
    path === "/cii" ||
    path.startsWith("/cii/") ||
    hash === "#/cii" ||
    hash === "#/initiatives-cii" ||
    hash.includes("initiatives-cii") ||
    search.includes("view=cii")
  ) {
    return "initiatives-cii";
  }
  if (
    path === "/g3" ||
    path === "/g3-summit" ||
    path.startsWith("/g3/") ||
    hash === "#/g3" ||
    hash === "#/g3-summit" ||
    hash === "#/initiatives-g3" ||
    hash.includes("initiatives-g3") ||
    queryView === "g3" ||
    queryView === "initiatives-g3"
  ) {
    return "initiatives-g3";
  }
  if (
    path === "/yap" ||
    path.startsWith("/yap/") ||
    hash === "#/yap" ||
    hash === "#/initiatives-yap" ||
    hash.includes("initiatives-yap") ||
    queryView === "yap" ||
    queryView === "initiatives-yap"
  ) {
    return "initiatives-yap";
  }
  if (
    path === "/teen-bootcamp" ||
    path === "/teen-bootcamp-2026" ||
    path === "/teenager" ||
    path === "/teenagers" ||
    path === "/teens" ||
    path === "/teen" ||
    path === "/teens-bootcamp" ||
    path === "/teen-leadership" ||
    path === "/teen-leadership-bootcamp" ||
    path.startsWith("/teen") ||
    hash.includes("teen") ||
    search.includes("teen") ||
    queryView === "teen-bootcamp" ||
    queryView === "teen" ||
    queryView === "teenager" ||
    queryView === "teens"
  ) {
    return "teen-bootcamp";
  }
  if (
    path === "/volunteer" ||
    path === "/volunteer-application" ||
    path === "/apply-to-volunteer" ||
    path.startsWith("/volunteer") ||
    hash === "#/volunteer" ||
    hash === "#/volunteer-application" ||
    hash.includes("volunteer") ||
    search.includes("volunteer") ||
    queryView === "volunteer" ||
    queryView === "volunteer-application"
  ) {
    return "volunteer-application";
  }
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
      const resolved = resolveViewFromUrl();
      setCurrentView(prev => {
        if (resolved !== "home") return resolved;
        return prev;
      });
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
    if (currentView === "admin") {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path !== "/admin" && !path.startsWith("/admin/") && !path.endsWith("/rmaadmin") && !hash.includes("admin")) {
        window.history.pushState(null, "", "/admin");
      }
    } else if (currentView === "courses") {
      const path = window.location.pathname.toLowerCase();
      if (path !== "/courses" && !path.startsWith("/courses/")) {
        window.history.pushState(null, "", "/courses");
      }
    } else if (currentView === "my-learning") {
      if (window.location.pathname.toLowerCase() !== "/my-learning") {
        window.history.pushState(null, "", "/my-learning");
      }
    } else if (currentView === "programs-reinvention") {
      if (window.location.pathname.toLowerCase() !== "/monthly-reinvention") {
        window.history.pushState(null, "", "/monthly-reinvention");
      }
    } else if (currentView === "initiatives-cii") {
      if (window.location.pathname.toLowerCase() !== "/cii") {
        window.history.pushState(null, "", "/cii");
      }
    } else if (currentView === "initiatives-g3") {
      if (window.location.pathname.toLowerCase() !== "/g3") {
        window.history.pushState(null, "", "/g3");
      }
    } else if (currentView === "teen-bootcamp") {
      if (window.location.pathname.toLowerCase() !== "/teen-bootcamp") {
        window.history.pushState(null, "", "/teen-bootcamp");
      }
    } else if (currentView === "volunteer-application" || currentView === "get-involved-volunteer") {
      if (window.location.pathname.toLowerCase() !== "/volunteer-application") {
        window.history.pushState(null, "", "/volunteer-application");
      }
    } else if (currentView === "home") {
      if (window.location.pathname.toLowerCase() !== "/" && window.location.pathname.toLowerCase() !== "/index.html") {
        window.history.pushState(null, "", "/");
      }
    } else {
      if (window.location.hash.toLowerCase().includes("rmaadmin") || window.location.hash.toLowerCase().includes("admin")) {
        window.history.pushState(null, "", window.location.pathname + window.location.search);
      }
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
          setView={setCurrentView} 
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
              <Homepage onOpenJoin={handleOpenJoin} onNavigate={setCurrentView} />
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
              <CoursesView currentView={currentView} setView={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <AboutViews subView={subAbout} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <ProgramViews subView={subProgram} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <InitiativeViews subView={subInitiative} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <EventViews subView={subEvent} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <ResourceViews subView={subResource} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <ImpactViews subView={subImpact} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <InvolvedViews subView={subInvolved} onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <VolunteerApplicationPage onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
              <ContactView onNavigate={setCurrentView} />
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
              <TeenBootcampPage onNavigate={setCurrentView} onOpenJoin={handleOpenJoin} />
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
                  setCurrentView("home");
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
                  setCurrentView(view);
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
              setCurrentView("admin");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewTeam={() => {
              setCurrentView("about-team");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewAbout={() => {
              setCurrentView("about-overview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewYap={() => {
              setCurrentView("initiatives-yap");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewFaqs={() => {
              setCurrentView("resources-faqs");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <LiveChatWidget />
        </>
      )}

    </div>
  );
}
