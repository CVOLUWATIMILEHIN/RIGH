import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Filter, 
  MapPin, 
  Mail, 
  Phone, 
  Trash2, 
  Check, 
  Database, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Layers,
  BarChart2,
  BookmarkCheck,
  Plus,
  Play,
  Bell,
  LayoutDashboard,
  Megaphone,
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Maximize2,
  Minimize2
} from "lucide-react";

import { 
  getRegistrations, 
  Registration, 
  getMarqueeConfig, 
  saveMarqueeConfig, 
  MarqueeConfig,
  getVisitorCheckIns,
  VisitorCheckIn,
  updateRegistration,
  deleteRegistration,
  getFirebaseAuth,
  getFirestoreDb,
  saveAuditLog,
  getAuditLogs,
  clearAuditLogs,
  AuditLog,
  authenticateFallbackAdmin,
  registerFallbackAdmin,
  verifySaltedAdminDigest,
  createClientSignedSession,
  getFirebaseConfig,
  getFirebaseConfigInfo,
  getAdminOperators,
  saveAdminOperator,
  deleteAdminOperator,
  authenticateOperatorAccount,
  AdminOperatorRecord,
  ANCHOR_SUPER_ADMIN_EMAILS,
  getPortalApplications,
  getAdminWelcomeName,
  isAuthorizedAdminEmail
} from "../lib/db";

import AdminTerminal from "./AdminTerminal";
import AdminAnalytics from "./AdminAnalytics";
import AdminCandidateDrawer from "./AdminCandidateDrawer";
import CheckInModal from "./CheckInModal";
import AdminSidebar, {
  AdminTabType,
  ADMIN_MODULE_GROUPS,
  ALL_ADMIN_MODULES,
  SUPER_ADMIN_ONLY_TABS,
  DEFAULT_LIMITED_ADMIN_TABS,
  ADMIN_ACCESS_PRESETS
} from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardOverview from "./DashboardOverview";
import DatatableView from "./DatatableView";
import QuickCreateModal from "./QuickCreateModal";
import AdminVisitorMonitoring from "./AdminVisitorMonitoring";
import AdminUserManagement from "./AdminUserManagement";
import AdminEvents from "./AdminEvents";
import AdminResources from "./AdminResources";
import AdminPayments from "./AdminPayments";
import AdminGallery from "./AdminGallery";
import AdminNotifications from "./AdminNotifications";
import AdminCMS from "./AdminCMS";
import AdminBackup from "./AdminBackup";
import AdminCourses from "./AdminCourses";
import { AdminEmailSettings } from "./AdminEmailSettings";
import { AdminEmailLogs } from "./AdminEmailLogs";
import AdminRevenueDashboard from "./AdminRevenueDashboard";
import AdminLmsPaymentSettings from "./AdminLmsPaymentSettings";
import AdminLmsCoursePayments from "./AdminLmsCoursePayments";
import AdminLmsEnrollments from "./AdminLmsEnrollments";
import AdminLmsStudents from "./AdminLmsStudents";
import AdminLmsCertificates from "./AdminLmsCertificates";
import AdminLmsAnalytics from "./AdminLmsAnalytics";
import AdminSocialHub from "./AdminSocialHub";
import AdminMessages from "./AdminMessages";
import AdminTestimonials from "./AdminTestimonials";
import AdminPartners from "./AdminPartners";
import AdminGoogleForms from "./AdminGoogleForms";
import AdminLiveChat from "./AdminLiveChat";
import AdminTeenBootcamp from "./AdminTeenBootcamp";
import AdminWebsitePopups from "./AdminWebsitePopups";
import AdminBrandCloner from "./AdminBrandCloner";
import brandLogo from "../assets/images/brand_logo_official_new_1780385523572.png";
import { SYSTEM_PRD_DOCUMENT } from "../lib/prd";
import { useBrandConfig } from "../lib/brandConfig";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export function formatAuthError(err: any): string {
  if (!err) return "Authentication attempt failed. Please check your credentials.";
  const code = err.code || "";
  const msg = err.message || "";

  if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
    return "Invalid email address format. Please double check the email address.";
  }
  if (code === "auth/user-not-found" || msg.includes("user-not-found")) {
    return "No administrator user account was found with this email address.";
  }
  if (code === "auth/wrong-password" || code === "auth/invalid-credential" || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
    return "Incorrect password or email. Please verify your credentials or select 'Forgot Password?'.";
  }
  if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
    return "Too many consecutive login attempts. Access temporarily locked for security. Please try again later.";
  }
  if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
    return "Network connection error. Please check your internet connection and try again.";
  }
  if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
    return "Firebase Email/Password provider is pending activation. Local admin credentials applied.";
  }
  if (code === "auth/weak-password" || msg.includes("weak-password")) {
    return "Password is too weak. Please use at least 8 characters, including letters, numbers, and special symbols.";
  }
  if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
    return "An administrator account with this email address already exists.";
  }
  return msg || "Authentication attempt rejected. Please check your login credentials.";
}

export function validateStrongPassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number (0-9)." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character (e.g. !@#$%^&*)." };
  }
  return { isValid: true };
}

interface AdminPortalProps {
  onBack: () => void;
}

export default function AdminPortal({ onBack }: AdminPortalProps) {
  const { brand } = useBrandConfig();
  // Database cache buffers
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [visitorCheckins, setVisitorCheckins] = useState<VisitorCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileFilter, setSelectedProfileFilter] = useState("all");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedPaymentStatusFilter, setSelectedPaymentStatusFilter] = useState("all");
  const [pendingPaymentsOnly, setPendingPaymentsOnly] = useState(false);
  const [registryGroupFilter, setRegistryGroupFilter] = useState<"all" | "rma" | "cii">("all");
  
  // feedback messaging state
  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "success" });

  // Diagnostics panel states
  const [projectId, setProjectId] = useState<string>("Loading...");
  const [databaseId, setDatabaseId] = useState<string>("Loading...");
  const [lastSyncTime, setLastSyncTime] = useState<string>("N/A");
  const [cacheStatus, setCacheStatus] = useState<string>("Streaming (Direct Bypass Enabled)");
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);
  const [listenerTriggerCount, setListenerTriggerCount] = useState<number>(0);

  // Marquee settings state
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);
  const [settingsSubTab, setSettingsSubTab] = useState<"cms" | "backup" | "email-settings" | "email-logs">("backup");
  const [marqueeMessages, setMarqueeMessages] = useState<string[]>([]);
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);

  // Layout navigation routing
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<Registration | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabType>("dashboard");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isLocalCheckInOpen, setIsLocalCheckInOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showTerminalConsole, setShowTerminalConsole] = useState(false);

  // Quick Create Modal controller state
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [quickCreateModalTab, setQuickCreateModalTab] = useState<"member" | "checkin" | "announcement">("member");

  // Volunteer Intake Form Backend Toolbar State
  const [volunteerFormMode, setVolunteerFormMode] = useState<"google_form" | "interactive">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_volunteer_form_mode");
      if (saved === "google_form" || saved === "interactive") return saved;
    }
    return "google_form";
  });
  const [volunteerFormUrl, setVolunteerFormUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_volunteer_google_form_url");
      if (saved && !saved.includes("1FAIpQLScXg5V3NqYqP_RMA_Volunteer_Intake")) return saved;
    }
    return "https://docs.google.com/forms/d/e/1FAIpQLScq8FZgaFF_hYxLbKk0eLjLwuMW1iYRPjZpYfMljdQ3k_oCHQ/viewform?embedded=true";
  });
  const [isVolunteerFullScreen, setIsVolunteerFullScreen] = useState(false);

  const handleSetVolunteerFormMode = async (mode: "google_form" | "interactive") => {
    setVolunteerFormMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_volunteer_form_mode", mode);
      window.dispatchEvent(new Event("rma_volunteer_form_config_updated"));
    }
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const db = await getFirestoreDb();
      await setDoc(doc(db, "settings", "google_forms"), {
        volunteerFormMode: mode,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showFeedback(`Volunteer page mode set to ${mode === "google_form" ? "Google Form" : "Direct Form"}`, "success");
      addTerminalLog(`⚙️ [VOLUNTEER FORM] Active mode set to: ${mode === "google_form" ? "Google Form" : "Direct Form"}`);
    } catch (err) {
      console.warn("Failed syncing volunteerFormMode:", err);
    }
  };

  const handleExportVolunteerApplicationsCSV = async () => {
    try {
      const apps = await getPortalApplications();
      const volunteerApps = apps.filter(a => a.type === "volunteer" || a.type?.includes("volunteer"));
      if (volunteerApps.length === 0) {
        showFeedback("No direct volunteer application submissions recorded yet.", "error");
        return;
      }
      const headers = ["Application ID", "Full Name", "Email Address", "Phone Number", "Location", "Primary Role", "Secondary Role", "Relevant Skills", "Why Volunteer", "Value Brought", "Video URL", "Availability", "Work Arrangement", "Submitted At"];
      const rows = volunteerApps.map(a => [
        `"${a.id}"`,
        `"${(a.fullName || '').replace(/"/g, '""')}"`,
        `"${(a.email || '').replace(/"/g, '""')}"`,
        `"${(a.phone || '').replace(/"/g, '""')}"`,
        `"${(a.options?.location || '').replace(/"/g, '""')}"`,
        `"${(a.options?.primaryRole || '').replace(/"/g, '""')}"`,
        `"${(a.options?.secondaryRole || '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(a.options?.relevantSkills) ? a.options.relevantSkills.join(', ') : '').replace(/"/g, '""')}"`,
        `"${(a.options?.whyVolunteer || a.notes || '').replace(/"/g, '""')}"`,
        `"${(a.options?.valueContribution || '').replace(/"/g, '""')}"`,
        `"${(a.options?.videoUrl || '').replace(/"/g, '""')}"`,
        `"${(a.options?.availability || '').replace(/"/g, '""')}"`,
        `"${(a.options?.workArrangement || '').replace(/"/g, '""')}"`,
        `"${a.appliedAt || a.options?.submittedAt || ''}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `RMA_Volunteer_Applications_Google_Sheets_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showFeedback(`Exported ${volunteerApps.length} volunteer applications to CSV!`, "success");
    } catch (err) {
      console.error("Volunteer CSV export error:", err);
    }
  };

  // Onboarding security roles inputs
  interface AdminUser {
    username: string;
    fullName?: string;
    role: "Super Admin" | "Admin" | "Viewer (Read Only)" | "Editor" | "Viewer";
    allowedTabs?: AdminTabType[];
    canWrite?: boolean;
    token?: string;
    expiresAt?: number;
  }

  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("rma_local_admin_credentials");
        const saved = localStorage.getItem("rma_current_logged_in_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.token && parsed?.expiresAt && parsed.expiresAt > Date.now()) {
            return parsed;
          }
          localStorage.removeItem("rma_current_logged_in_user");
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Verify stored session token cryptographically with the backend server and admin directory on mount
  useEffect(() => {
    if (!currentAdminUser?.token || !currentAdminUser?.username) return;
    let cancelled = false;

    if (currentAdminUser.expiresAt && currentAdminUser.expiresAt <= Date.now()) {
      setCurrentAdminUser(null);
      localStorage.removeItem("rma_current_logged_in_user");
      window.dispatchEvent(new Event("rma_admin_session_changed"));
      return;
    }

    // Verify that the stored session email is an authorized Admin created by Super Admin
    isAuthorizedAdminEmail(currentAdminUser.username)
      .then((check) => {
        if (cancelled) return;
        if (!check.authorized) {
          setCurrentAdminUser(null);
          localStorage.removeItem("rma_current_logged_in_user");
          window.dispatchEvent(new Event("rma_admin_session_changed"));
          setLoginError(
            check.reason ||
              "Access Denied: Your email is not registered as an Administrator."
          );
        }
      })
      .catch(() => null);

    fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentAdminUser.token}`
      },
      body: JSON.stringify({ token: currentAdminUser.token })
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          const data = await res.json().catch(() => ({}));
          if (data?.suspended === true) {
            setCurrentAdminUser(null);
            localStorage.removeItem("rma_current_logged_in_user");
            window.dispatchEvent(new Event("rma_admin_session_changed"));
            setLoginError(data?.error || "Your administrator account has been suspended by the Super Admin.");
          }
        } else if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.valid && data?.user) {
            setCurrentAdminUser((prev) => {
              if (!prev) return prev;
              const updated: AdminUser = {
                ...prev,
                role: data.user.role || prev.role,
                allowedTabs: Array.isArray(data.user.allowedTabs) ? data.user.allowedTabs : prev.allowedTabs,
                canWrite: typeof data.user.canWrite === "boolean" ? data.user.canWrite : prev.canWrite
              };
              localStorage.setItem("rma_current_logged_in_user", JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      .catch(() => {
        // Keep active if network hiccup or static deployment, token still has client expiry check
      });
    return () => {
      cancelled = true;
    };
  }, [currentAdminUser?.token, currentAdminUser?.username]);

  const [isFirebaseAuthActive, setIsFirebaseAuthActive] = useState(false);

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Change Password Modal States
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Secure Brute-Force lockout states
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_admin_failed_attempts");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_admin_lockout_until");
      if (saved) {
        const timestamp = parseInt(saved, 10);
        if (timestamp > Date.now()) {
          return timestamp;
        }
      }
    }
    return null;
  });

  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);

  // Countdown timer effect for lockout rate-limiting
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setLockoutUntil(null);
        setLockoutTimeLeft(0);
        if (typeof window !== "undefined") {
          localStorage.removeItem("rma_admin_lockout_until");
        }
      } else {
        setLockoutTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Register New Admin & Access Control State (Super Admin Only)
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminCanWrite, setNewAdminCanWrite] = useState(true);
  const [newAdminAllowedTabs, setNewAdminAllowedTabs] = useState<AdminTabType[]>([...DEFAULT_LIMITED_ADMIN_TABS]);
  const [editingOperatorEmail, setEditingOperatorEmail] = useState<string | null>(null);
  const [adminOperatorsList, setAdminOperatorsList] = useState<AdminOperatorRecord[]>([]);
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);
  const [adminRegisterError, setAdminRegisterError] = useState("");
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

  // System access security audits trails cache
  const [accessLogs, setAccessLogs] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const logs = localStorage.getItem("rma_backend_access_logs");
      return logs ? JSON.parse(logs) : [];
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [failedSubmissionsCount, setFailedSubmissionsCount] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      if (typeof window !== "undefined") {
        try {
          const rawQueue = localStorage.getItem("rma_offline_sync_queue");
          const queue = rawQueue ? JSON.parse(rawQueue) : [];
          setPendingSyncCount(queue.length);

          const rawFailed = localStorage.getItem("rma_failed_submissions");
          const count = rawFailed ? parseInt(rawFailed, 10) : 0;
          setFailedSubmissionsCount(count);
        } catch (e) {
          console.warn("Failed to load local operation statistics:", e);
        }
      }
    };
    updateStats();
    window.addEventListener("rma_registration_submitted", updateStats);
    window.addEventListener("rma_checkin_updated", updateStats);
    window.addEventListener("rma_failed_submissions_updated", updateStats);
    return () => {
      window.removeEventListener("rma_registration_submitted", updateStats);
      window.removeEventListener("rma_checkin_updated", updateStats);
      window.removeEventListener("rma_failed_submissions_updated", updateStats);
    };
  }, []);

  const isUnlocked = !!currentAdminUser;
  const currentEmail = currentAdminUser?.username || "";
  const userRole = currentAdminUser?.role || "Viewer (Read Only)";
  const isSuperAdmin = ANCHOR_SUPER_ADMIN_EMAILS.includes(currentEmail.toLowerCase().trim());

  const hasWriteAccess = isSuperAdmin
    ? true
    : (userRole === "Admin" || userRole === "Editor") && (currentAdminUser?.canWrite !== false);

  const hasContentWriteAccess = isSuperAdmin
    ? true
    : (userRole === "Admin" || userRole === "Editor") && (currentAdminUser?.canWrite !== false);

  const effectiveAllowedTabs: AdminTabType[] = isSuperAdmin
    ? ALL_ADMIN_MODULES.map((m) => m.id)
    : ((currentAdminUser?.allowedTabs && currentAdminUser.allowedTabs.length > 0
        ? currentAdminUser.allowedTabs
        : DEFAULT_LIMITED_ADMIN_TABS
      ).filter((tabId) => !SUPER_ADMIN_ONLY_TABS.includes(tabId as AdminTabType)) as AdminTabType[]);

  // Sync Admin Operators Directory and live-refresh limited admin permissions
  const refreshAdminOperatorsDirectory = async () => {
    try {
      const ops = await getAdminOperators();
      setAdminOperatorsList(ops);

      if (currentAdminUser && !ANCHOR_SUPER_ADMIN_EMAILS.includes(currentAdminUser.username.toLowerCase())) {
        const myRecord = ops.find(
          (o) => o.email.toLowerCase() === currentAdminUser.username.toLowerCase()
        );
        if (myRecord) {
          if (myRecord.status === "Suspended") {
            setCurrentAdminUser(null);
            localStorage.removeItem("rma_current_logged_in_user");
            showFeedback("Your administrator account has been suspended by the Super Admin.", "error");
            return;
          }
          const nextTabs = (myRecord.allowedTabs || DEFAULT_LIMITED_ADMIN_TABS) as AdminTabType[];
          const nextWrite = typeof myRecord.canWrite === "boolean" ? myRecord.canWrite : true;
          const prevTabsKey = (currentAdminUser.allowedTabs || []).join(",");
          const nextTabsKey = nextTabs.join(",");
          if (prevTabsKey !== nextTabsKey || currentAdminUser.canWrite !== nextWrite) {
            const updated: AdminUser = {
              ...currentAdminUser,
              fullName: myRecord.fullName || currentAdminUser.fullName,
              allowedTabs: nextTabs,
              canWrite: nextWrite
            };
            setCurrentAdminUser(updated);
            localStorage.setItem("rma_current_logged_in_user", JSON.stringify(updated));
          }
        }
      }
    } catch (e) {
      console.warn("Failed refreshing operators list:", e);
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;
    refreshAdminOperatorsDirectory();
    const handleOpsUpdated = () => refreshAdminOperatorsDirectory();
    window.addEventListener("rma_admin_operators_updated", handleOpsUpdated);
    return () => window.removeEventListener("rma_admin_operators_updated", handleOpsUpdated);
  }, [isUnlocked, activeTab]);

  // Enforce module restrictions so non-Super Admins cannot stay on unauthorized tabs
  useEffect(() => {
    if (!isUnlocked || isSuperAdmin) return;
    if (!effectiveAllowedTabs.includes(activeTab)) {
      const fallbackTab = effectiveAllowedTabs[0] || "dashboard";
      if (activeTab !== fallbackTab) {
        setActiveTab(fallbackTab);
      }
    }
  }, [isUnlocked, isSuperAdmin, activeTab, effectiveAllowedTabs.join(",")]);

  const checkWritePermission = (): boolean => {
    if (!hasWriteAccess) {
      showFeedback(`Access Denied: Your account has Read-Only permissions. Contact the Super Admin to request edit access.`, "error");
      addTerminalLog(`⚠️ [REJECTED] Write attempt blocked for read-only operator "${currentEmail}" [${userRole}].`);
      return false;
    }
    return true;
  };

  // Lazy-load activity trail logs when switching to the Activity Logs page
  useEffect(() => {
    if (activeTab === "activity" && isUnlocked && hasWriteAccess) {
      setIsLoadingLogs(true);
      getAuditLogs()
        .then((logs) => setAuditLogs(logs))
        .catch((err) => console.error("Error retrieving audits:", err))
        .finally(() => setIsLoadingLogs(false));
    }
  }, [activeTab, isUnlocked, hasWriteAccess]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = usernameInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLoginError("Please enter your registered Administrator email address.");
      return;
    }
    const cleanPass = passwordInput.trim();
    if (!cleanPass) {
      setLoginError("Please enter the administrative password.");
      return;
    }

    const isSuperAdminEmail = ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail);
    
    setIsAuthLoading(true);
    setLoginError("");

    // Safety watchdog timer: force reset loading state after 8 seconds under any circumstance
    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 8000);

    try {
      // 0. STRICT ADMIN DIRECTORY GATE: Only Super Admin (olosundelouis@gmail.com) or Admins explicitly created by Super Admin can log in
      const authCheck = await isAuthorizedAdminEmail(cleanEmail);
      if (!authCheck.authorized || (!isSuperAdminEmail && !authCheck.operator?.passwordDigest)) {
        throw new Error(
          authCheck.reason ||
            `Access Denied: The email "${cleanEmail}" has not been created by the Super Admin. No unauthorized email is allowed to log in.`
        );
      }

      // Non-Super-Admin accounts MUST authenticate with the password set for them by the Super Admin
      if (!isSuperAdminEmail && authCheck.operator?.passwordDigest && authCheck.operator.passwordDigest !== "server-scrypt") {
        const opMatch = await authenticateOperatorAccount(cleanEmail, cleanPass);
        if (!opMatch) {
          throw new Error("Invalid administrative credentials. Please enter the password assigned to your administrator account.");
        }
      }

      // 1. PRIMARY SERVER-SIDE CRYPTOGRAPHIC AUTHENTICATION (scrypt + HMAC-SHA256 token)
      let serverSession: {
        email: string;
        fullName?: string;
        role: any;
        allowedTabs?: AdminTabType[];
        canWrite?: boolean;
        token: string;
        expiresAt: number;
      } | null = null;
      let serverLockoutSeconds = 0;
      let serverErrorMsg = "";

      // Check Firestore/local operator directory first for non-Super-Admin accounts so edits/suspensions take precedence
      if (!isSuperAdminEmail) {
        try {
          const operatorAuth = await authenticateOperatorAccount(cleanEmail, cleanPass);
          if (operatorAuth && operatorAuth.email) {
            const clientSigned = await createClientSignedSession(
              operatorAuth.email,
              operatorAuth.role,
              operatorAuth.allowedTabs,
              operatorAuth.canWrite
            );
            serverSession = {
              email: operatorAuth.email,
              fullName: operatorAuth.fullName,
              role: operatorAuth.role,
              allowedTabs: (operatorAuth.allowedTabs as AdminTabType[]) || undefined,
              canWrite: operatorAuth.canWrite !== false,
              token: clientSigned.token,
              expiresAt: clientSigned.expiresAt
            };
          }
        } catch (opErr: any) {
          if (opErr?.message && opErr.message.toLowerCase().includes("suspended")) {
            throw opErr;
          }
        }
      }

      if (!serverSession) {
        try {
          const serverRes = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password: cleanPass })
          });
          const serverData = await serverRes.json().catch(() => ({}));
          const resolvedToken = serverData?.token || serverData?.user?.token;
          const resolvedEmail = serverData?.email || serverData?.user?.username || cleanEmail;
          const resolvedRoleFromServer = isSuperAdminEmail
            ? "Super Admin"
            : (serverData?.role === "Super Admin" ? "Admin" : (serverData?.role || serverData?.user?.role || "Admin"));
          const resolvedExpires = serverData?.expiresAt || serverData?.user?.expiresAt || (Date.now() + 12 * 60 * 60 * 1000);
          const resolvedTabs = serverData?.allowedTabs || serverData?.user?.allowedTabs;
          const resolvedWrite = typeof serverData?.canWrite === "boolean"
            ? serverData.canWrite
            : typeof serverData?.user?.canWrite === "boolean"
            ? serverData.user.canWrite
            : true;

          if (serverRes.ok && serverData?.success && resolvedToken) {
            let finalTabs = Array.isArray(resolvedTabs) ? resolvedTabs : undefined;
            let finalWrite = resolvedWrite;
            let finalFullName = serverData?.fullName || serverData?.user?.fullName;
            if (!isSuperAdminEmail) {
              const matchedOp = authCheck.operator;
              if (matchedOp) {
                if (matchedOp.status === "Suspended") {
                  throw new Error("Access Revoked: Your administrator account has been suspended by the System Owner (Super Admin).");
                }
                finalTabs = (matchedOp.allowedTabs as AdminTabType[]) || finalTabs;
                finalWrite = matchedOp.canWrite !== false;
                finalFullName = matchedOp.fullName || finalFullName;
              }
            }

            serverSession = {
              email: resolvedEmail,
              fullName: finalFullName,
              role: resolvedRoleFromServer,
              allowedTabs: finalTabs,
              canWrite: finalWrite,
              token: resolvedToken,
              expiresAt: resolvedExpires
            };
          } else if (serverRes.status === 429 && serverData?.lockoutSeconds) {
            serverLockoutSeconds = Number(serverData.lockoutSeconds);
            serverErrorMsg = serverData.error || "Too many failed login attempts.";
          } else if (serverData?.error) {
            serverErrorMsg = serverData.error;
          }
        } catch (srvErr: any) {
          if (srvErr?.message && (srvErr.message.includes("Suspended") || srvErr.message.includes("suspended") || srvErr.message.includes("assigned administrator password"))) {
            throw srvErr;
          }
          console.warn("Server authentication request error:", srvErr);
        }
      }

      // Master password fallback is ONLY allowed for the sole Super Admin (olosundelouis@gmail.com)
      if (!serverSession && isSuperAdminEmail && (await verifySaltedAdminDigest(cleanPass))) {
        const clientSigned = await createClientSignedSession(
          cleanEmail,
          "Super Admin",
          undefined,
          true
        );
        serverSession = {
          email: cleanEmail,
          role: "Super Admin",
          canWrite: true,
          token: clientSigned.token,
          expiresAt: clientSigned.expiresAt
        };
        serverLockoutSeconds = 0;
        serverErrorMsg = "";
      }

      if (serverLockoutSeconds > 0) {
        const lockoutTime = Date.now() + serverLockoutSeconds * 1000;
        setLockoutUntil(lockoutTime);
        if (typeof window !== "undefined") {
          localStorage.setItem("rma_admin_lockout_until", lockoutTime.toString());
        }
        throw new Error(serverErrorMsg || "Authentication failed too many times. Access temporarily locked for security.");
      }

      // 2. ATTEMPT SUPABASE AUTH ONLY FOR SUPER ADMIN IF SERVER SESSION DID NOT MATCH
      let supabaseUser: any = null;
      if (!serverSession && isSuperAdminEmail && supabase && isSupabaseConfigured) {
        addTerminalLog(`🔐 [SUPABASE AUTH] Authenticating ${cleanEmail} against Supabase GoTrue...`);
        try {
          const { data: supaAuthData, error: supaAuthError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass
          });

          if (supaAuthError) {
            console.warn("Supabase auth check:", supaAuthError.message);
          } else if (supaAuthData && supaAuthData.user) {
            supabaseUser = supaAuthData.user;
            addTerminalLog(`✅ [SUPABASE AUTH] Verified admin session for ${cleanEmail}!`);
          }
        } catch (supaErr: any) {
          console.warn("Supabase auth exception:", supaErr);
        }
      }

      // 3. ATTEMPT FIREBASE AUTH (Non-blocking background sync if serverSession already succeeded, or Super Admin fallback)
      let userCredential: any = null;
      if (serverSession) {
        (async () => {
          try {
            const getAuthPromise = getFirebaseAuth();
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
            const auth: any = await Promise.race([getAuthPromise, timeoutPromise]);
            if (auth) {
              const { signInWithEmailAndPassword } = await import("firebase/auth");
              await signInWithEmailAndPassword(auth, cleanEmail, cleanPass).catch(() => null);
            }
          } catch {}
        })();
      } else if (isSuperAdminEmail) {
        let auth: any = null;
        try {
          const getAuthPromise = getFirebaseAuth();
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
          auth = await Promise.race([getAuthPromise, timeoutPromise]);
        } catch (authErr) {
          console.warn("Firebase Auth not initialized:", authErr);
        }

        if (auth) {
          const { signInWithEmailAndPassword } = await import("firebase/auth");
          try {
            const signInPromise = signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
            const signInTimeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Auth sign-in request timed out (4s)")), 4000));
            userCredential = await Promise.race([signInPromise, signInTimeout]);
          } catch (err: any) {
            if (!supabaseUser) {
              throw new Error(serverErrorMsg || "Invalid administrative email or password.");
            }
          }
        } else if (!supabaseUser) {
          throw new Error(serverErrorMsg || "Invalid administrative email or password.");
        }
      } else {
        throw new Error(serverErrorMsg || "Invalid administrative credentials. Please verify your email and password.");
      }

      // Determine final active user role & scoped permissions
      let resolvedRole: "Super Admin" | "Admin" | "Viewer (Read Only)" | "Public User" | "Editor" | "Viewer" =
        isSuperAdminEmail ? "Super Admin" : (authCheck.operator?.role || "Public User");
      let resolvedAllowedTabs: AdminTabType[] | undefined =
        serverSession?.allowedTabs || (authCheck.operator?.allowedTabs as AdminTabType[]);
      let resolvedCanWrite: boolean =
        serverSession?.canWrite ?? (authCheck.operator?.canWrite !== false);
      let resolvedFullName: string | undefined =
        serverSession?.fullName || authCheck.operator?.fullName;

      if (serverSession) {
        resolvedRole = serverSession.role;
      }

      if (resolvedRole === "Public User") {
        throw new Error("Access Denied: Your account is designated under the 'Public User' authorization profile. Security clearance is required to unlock this operator's console.");
      }

      // Ensure we have a signed session token even if authenticated via Firebase/Supabase on static hosting
      if (!serverSession) {
        try {
          const exchangeRes = await fetch("/api/admin/exchange-oauth-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              uid: userCredential?.user?.uid || supabaseUser?.id || "verified-auth",
              role: resolvedRole,
              allowedTabs: resolvedAllowedTabs,
              canWrite: resolvedCanWrite
            })
          });
          const exchangeData = await exchangeRes.json().catch(() => ({}));
          const exToken = exchangeData?.token || exchangeData?.user?.token;
          const exRole = exchangeData?.role || exchangeData?.user?.role || resolvedRole;
          const exExpires = exchangeData?.expiresAt || exchangeData?.user?.expiresAt;
          if (exchangeRes.ok && exToken) {
            serverSession = {
              email: cleanEmail,
              fullName: resolvedFullName,
              role: exRole,
              allowedTabs: exchangeData?.allowedTabs || resolvedAllowedTabs,
              canWrite: typeof exchangeData?.canWrite === "boolean" ? exchangeData.canWrite : resolvedCanWrite,
              token: exToken,
              expiresAt: exExpires
            };
          }
        } catch {}

        if (!serverSession) {
          serverSession = await createClientSignedSession(
            cleanEmail,
            resolvedRole as any,
            resolvedAllowedTabs,
            resolvedCanWrite
          );
        }
      }

      // Clear failed attempts
      setFailedAttempts(0);
      setLockoutUntil(null);
      setLockoutTimeLeft(0);
      if (typeof window !== "undefined") {
        localStorage.removeItem("rma_admin_failed_attempts");
        localStorage.removeItem("rma_admin_lockout_until");
      }

      const matchedUser: AdminUser = {
        username: serverSession.email || cleanEmail,
        fullName: serverSession.fullName || resolvedFullName,
        role: resolvedRole,
        allowedTabs: serverSession.allowedTabs || resolvedAllowedTabs,
        canWrite: typeof serverSession.canWrite === "boolean" ? serverSession.canWrite : resolvedCanWrite,
        token: serverSession.token,
        expiresAt: serverSession.expiresAt
      };

      setCurrentAdminUser(matchedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_current_logged_in_user", JSON.stringify(matchedUser));
        window.dispatchEvent(new Event("rma_admin_session_changed"));
      }

      const newLog = {
        email: matchedUser.username,
        timestamp: new Date().toISOString(),
        role: resolvedRole
      };
      const updatedLogs = [newLog, ...accessLogs];
      setAccessLogs(updatedLogs);
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_backend_access_logs", JSON.stringify(updatedLogs));
      }

      showFeedback(`Welcome back, ${getAdminWelcomeName(matchedUser.username, matchedUser.fullName)}!`, "success");
      addTerminalLog(`🛡️ [SECURITY] Portal unlocked via Cryptographic Session. Operator: ${matchedUser.username} [${resolvedRole}].`);

      saveAuditLog({
        adminEmail: matchedUser.username,
        action: "Portal Authenticated",
        details: `Administrator logged into the administration console as: [${resolvedRole}]`
      }).catch(() => null);

    } catch (err: any) {
      console.warn("Administrative Auth Notice:", err?.message || err);
      
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_admin_failed_attempts", nextAttempts.toString());
      }

      let errMsg = formatAuthError(err);

      if (nextAttempts >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000;
        setLockoutUntil(lockoutTime);
        if (typeof window !== "undefined") {
          localStorage.setItem("rma_admin_lockout_until", lockoutTime.toString());
        }
        errMsg = "Authentication failed too many times. Access temporarily locked for security.";
        addTerminalLog(`🚨 [SECURITY LOCKED] Too many consecutive login failures. Terminal locked for: ${cleanEmail}`);
        
        saveAuditLog({
          adminEmail: cleanEmail,
          action: "Admin Portal Locked",
          details: `Security alert: Brute force lockout triggered.`
        }).catch(() => null);
      }

      setLoginError(errMsg);
      addTerminalLog(`⚠️ [SECURITY] Auth failure for email "${cleanEmail}": ${err.code || err.message}`);
    } finally {
      clearTimeout(safetyTimer);
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setLoginError("");

    // Watchdog timer to prevent infinite loading state
    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 12000);

    try {
      const getAuthPromise = getFirebaseAuth();
      const authTimeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Google Authentication initialization timed out.")), 5000));
      const auth = await Promise.race([getAuthPromise, authTimeout]);

      const { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      try {
        await setPersistence(auth, browserLocalPersistence).catch(() => null);
      } catch (pErr) {}

      let userCredential: any = null;
      try {
        console.log("[GOOGLE AUTH] Attempting primary Google popup sign-in...");
        userCredential = await signInWithPopup(auth, provider);
      } catch (firstErr: any) {
        console.warn("[GOOGLE AUTH] Primary popup failed or closed:", firstErr?.code || firstErr?.message);
        
        const isPopupErr = 
          firstErr?.code === "auth/popup-closed-by-user" ||
          firstErr?.code === "auth/cancelled-popup-request" ||
          firstErr?.code === "auth/popup-blocked" ||
          firstErr?.message?.includes("popup");

        if (isPopupErr) {
          console.log("[GOOGLE AUTH] Retrying Google popup sign-in once...");
          await new Promise(r => setTimeout(r, 600));
          try {
            userCredential = await signInWithPopup(auth, provider);
          } catch (retryErr: any) {
            console.warn("[GOOGLE AUTH] Retry Google popup failed:", retryErr?.code || retryErr?.message);
            if (retryErr?.code === "auth/popup-closed-by-user") {
              throw new Error("The Google sign-in window was closed before completing authentication. Please click 'Sign in with Google' again and select your account.");
            } else if (retryErr?.code === "auth/popup-blocked") {
              throw new Error("The Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
            }
            throw retryErr;
          }
        } else {
          throw firstErr;
        }
      }

      if (!userCredential || !userCredential.user) {
        throw new Error("Google Authentication returned no user profile.");
      }

      const user = userCredential.user;
      const cleanEmail = user.email ? user.email.toLowerCase().trim() : "";

      const isSuperAdminEmail = ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail);

      let resolvedRole: "Super Admin" | "Admin" | "Viewer (Read Only)" | "Editor" | "Viewer" | "Public User" = "Public User";
      let resolvedAllowedTabs: AdminTabType[] | undefined = undefined;
      let resolvedCanWrite: boolean = true;

      if (isSuperAdminEmail) {
        resolvedRole = "Super Admin";
      } else {
        try {
          const ops = await getAdminOperators();
          const localOp = ops.find((o) => o.email.toLowerCase() === cleanEmail);
          if (localOp) {
            if (localOp.status === "Suspended") {
              throw new Error("This administrator account has been suspended by the Super Admin.");
            }
            resolvedRole = localOp.role === "Super Admin" ? "Super Admin" : "Admin";
            resolvedAllowedTabs = (localOp.allowedTabs as AdminTabType[]) || DEFAULT_LIMITED_ADMIN_TABS;
            resolvedCanWrite = localOp.canWrite !== false;
          } else {
            const fetchRole = async () => {
              const { doc, getDoc } = await import("firebase/firestore");
              const db = await getFirestoreDb();
              const adminDocRef = doc(db, "admins", cleanEmail);
              const adminSnap = await getDoc(adminDocRef);
              if (adminSnap.exists()) {
                const data = adminSnap.data();
                const adminRole = data.role;
                return {
                  role:
                    adminRole === "Super Admin"
                      ? "Super Admin"
                      : adminRole === "Admin"
                      ? "Admin"
                      : adminRole === "Editor"
                      ? "Editor"
                      : adminRole === "Viewer" || adminRole === "Viewer (Read Only)"
                      ? "Viewer (Read Only)"
                      : "Public User",
                  allowedTabs: Array.isArray(data.allowedTabs) ? data.allowedTabs : undefined,
                  canWrite: typeof data.canWrite === "boolean" ? data.canWrite : true,
                  status: data.status
                };
              }
              return { role: "Public User" };
            };
            const timeoutRole = new Promise<any>((resolve) => setTimeout(() => resolve({ role: "Public User" }), 3000));
            const roleInfo = await Promise.race([fetchRole(), timeoutRole]);
            if (roleInfo?.status === "Suspended") {
              throw new Error("This administrator account has been suspended by the Super Admin.");
            }
            resolvedRole = roleInfo?.role || "Public User";
            resolvedAllowedTabs = roleInfo?.allowedTabs;
            resolvedCanWrite = typeof roleInfo?.canWrite === "boolean" ? roleInfo.canWrite : true;
          }
        } catch (dbErr: any) {
          if (dbErr?.message?.includes("suspended")) throw dbErr;
          console.warn("Failed checking admin existence in db:", dbErr);
          resolvedRole = "Public User";
        }
      }

      // Background non-blocking profile update in Firestore
      (async () => {
        try {
          const { doc, getDoc, setDoc, updateDoc } = await import("firebase/firestore");
          const db = await getFirestoreDb();
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            await setDoc(userDocRef, {
              id: user.uid,
              fullName: user.displayName || user.email?.split("@")[0] || "Public User",
              email: cleanEmail,
              phone: user.phoneNumber || "N/A",
              role: "Student",
              joinedAt: new Date().toISOString(),
              status: "Active",
              location: "N/A",
              emailVerified: user.emailVerified || false,
              verificationAttempts: 0,
              verificationSentAt: null,
              lastLogin: new Date().toISOString()
            });
            addTerminalLog(`👤 [USERS] Created new Firestore user profile for ${cleanEmail}`);
          } else {
            await updateDoc(userDocRef, {
              lastLogin: new Date().toISOString(),
              emailVerified: user.emailVerified || false
            }).catch(() => null);
            addTerminalLog(`👤 [USERS] Google User profile verified & updated for ${cleanEmail}`);
          }
        } catch (profileErr) {
          console.warn("Failed updating/creating Firestore user profile:", profileErr);
        }
      })();

      const authCheck = await isAuthorizedAdminEmail(cleanEmail);
      if (!authCheck.authorized || (!isSuperAdminEmail && !authCheck.operator?.passwordDigest)) {
        await auth.signOut().catch(() => null);
        throw new Error(
          authCheck.reason ||
            `Access Denied: The email "${cleanEmail}" has not been created by the Super Admin. No unauthorized email is allowed to log in.`
        );
      }

      if (resolvedRole === "Public User") {
        await auth.signOut().catch(() => null);
        throw new Error(
          `Access Denied: The email "${cleanEmail}" has not been created by the Super Admin. No unauthorized email is allowed to log in.`
        );
      }

      let googleSession: {
        email: string;
        role: any;
        allowedTabs?: AdminTabType[];
        canWrite?: boolean;
        token: string;
        expiresAt: number;
      } | null = null;
      try {
        const exchangeRes = await fetch("/api/admin/exchange-oauth-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            uid: user.uid,
            role: resolvedRole,
            allowedTabs: resolvedAllowedTabs,
            canWrite: resolvedCanWrite
          })
        });
        const exchangeData = await exchangeRes.json().catch(() => ({}));
        const googleToken = exchangeData?.token || exchangeData?.user?.token;
        const googleRole = exchangeData?.role || exchangeData?.user?.role || resolvedRole;
        const googleExpires = exchangeData?.expiresAt || exchangeData?.user?.expiresAt;
        if (exchangeRes.ok && googleToken) {
          googleSession = {
            email: cleanEmail,
            role: googleRole,
            allowedTabs: exchangeData?.allowedTabs || resolvedAllowedTabs,
            canWrite: typeof exchangeData?.canWrite === "boolean" ? exchangeData.canWrite : resolvedCanWrite,
            token: googleToken,
            expiresAt: googleExpires
          };
        }
      } catch {}

      if (!googleSession) {
        googleSession = await createClientSignedSession(
          cleanEmail,
          resolvedRole as any,
          resolvedAllowedTabs,
          resolvedCanWrite
        );
      }

      const matchedUser: AdminUser = {
        username: cleanEmail,
        fullName: user.displayName || undefined,
        role: googleSession.role,
        allowedTabs: googleSession.allowedTabs || resolvedAllowedTabs,
        canWrite: typeof googleSession.canWrite === "boolean" ? googleSession.canWrite : resolvedCanWrite,
        token: googleSession.token,
        expiresAt: googleSession.expiresAt
      };

      setCurrentAdminUser(matchedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_current_logged_in_user", JSON.stringify(matchedUser));
        window.dispatchEvent(new Event("rma_admin_session_changed"));
      }

      showFeedback(`Welcome back, ${getAdminWelcomeName(cleanEmail, user.displayName || matchedUser.fullName)}!`, "success");
      addTerminalLog(`🛡️ [SECURITY] Portal unlocked via Google Firebase Auth. Session: ${cleanEmail} [${resolvedRole}].`);

      saveAuditLog({
        adminEmail: cleanEmail,
        action: "Portal Authenticated via Google",
        details: `Administrator logged into the administration console using Google Sign-In as: [${resolvedRole}]`
      }).catch(() => null);

    } catch (err: any) {
      console.warn("Google Sign-In Notice:", err?.message || err);
      
      const isUnauthorizedDomain = 
        err?.code === "auth/unauthorized-domain" || 
        err?.message?.includes("unauthorized-domain") ||
        err?.message?.includes("auth/unauthorized-domain");

      if (isUnauthorizedDomain) {
        const domainName = typeof window !== "undefined" ? window.location.hostname : "this web domain";
        setLoginError(
          `Google Sign-In is restricted on this web domain (${domainName}). Please sign in using your authorized Admin Email & Password above, or add '${domainName}' under Authorized Domains in Firebase Console -> Authentication -> Settings.`
        );
      } else {
        setLoginError(err.message || "Google Authentication attempt failed.");
      }

      addTerminalLog(`🚨 [SECURITY] Google Auth Failure: ${err.code || err.message}`);
    } finally {
      clearTimeout(safetyTimer);
      setIsAuthLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = usernameInput.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError("Please enter your administrator email address first to receive a password reset link.");
      return;
    }
    setIsAuthLoading(true);
    setLoginError("");

    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 6000);

    try {
      const getAuthPromise = getFirebaseAuth();
      const authTimeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Auth initialization timed out.")), 3000));
      const auth = await Promise.race([getAuthPromise, authTimeout]);

      const { sendPasswordResetEmail } = await import("firebase/auth");
      const sendResetPromise = sendPasswordResetEmail(auth, cleanEmail);
      const resetTimeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Password reset email request timed out.")), 4000));
      await Promise.race([sendResetPromise, resetTimeout]);

      showFeedback(`Password reset email successfully dispatched to ${cleanEmail}!`, "success");
      addTerminalLog(`✉️ [SECURITY] Password reset email triggered for administrative user: ${cleanEmail}`);
      setIsForgotPasswordMode(false);
    } catch (err: any) {
      console.warn("Forgot password notice:", err?.message || err);
      setLoginError(formatAuthError(err));
    } finally {
      clearTimeout(safetyTimer);
      setIsAuthLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");

    if (!newPasswordInput) {
      setChangePasswordError("Please enter your new password.");
      return;
    }

    const validation = validateStrongPassword(newPasswordInput);
    if (!validation.isValid) {
      setChangePasswordError(validation.error || "Password does not meet strength requirements.");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      try {
        const auth = await getFirebaseAuth();
        if (auth.currentUser) {
          const { updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
          if (currentPasswordInput) {
            try {
              const credential = EmailAuthProvider.credential(auth.currentUser.email || currentEmail, currentPasswordInput);
              await reauthenticateWithCredential(auth.currentUser, credential);
            } catch (reAuthErr) {
              console.warn("Re-authentication notice:", reAuthErr);
            }
          }
          await updatePassword(auth.currentUser, newPasswordInput);
        }
      } catch (fbErr: any) {
        console.warn("Firebase Auth password update skipped/failed:", fbErr?.message || fbErr);
      }

      const pwRes = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentAdminUser?.token || ""}`
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput
        })
      });
      if (!pwRes.ok) {
        const pwData = await pwRes.json().catch(() => ({}));
        throw new Error(pwData?.error || "Failed to update password on server.");
      }

      showFeedback("Password updated successfully!", "success");
      addTerminalLog(`🔐 [SECURITY] Password updated for admin account: ${currentEmail}`);
      
      await saveAuditLog({
        adminEmail: currentEmail,
        action: "Password Changed",
        details: "Administrator changed their security account password."
      }).catch(() => null);

      setIsChangePasswordModalOpen(false);
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      console.warn("Change password notice:", err?.message || err);
      setChangePasswordError(formatAuthError(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRegisterAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setAdminRegisterError("Only the Super Admin (System Owner) can create or modify Admin accounts.");
      return;
    }

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    const password = newAdminPassword.trim();
    const cleanName = newAdminName.trim() || cleanEmail.split("@")[0];

    if (!cleanEmail) {
      setAdminRegisterError("Please enter the administrator's email address.");
      return;
    }

    if (!editingOperatorEmail && !password) {
      setAdminRegisterError("Please set an initial login password for this administrator.");
      return;
    }

    if (password && password.length < 6) {
      setAdminRegisterError("Password must be at least 6 characters long.");
      return;
    }

    const sanitizedTabs = newAdminAllowedTabs.filter(
      (t) => !SUPER_ADMIN_ONLY_TABS.includes(t)
    );
    if (sanitizedTabs.length === 0) {
      setAdminRegisterError("Please select at least 1 module tab for this administrator to access.");
      return;
    }

    setIsRegisteringAdmin(true);
    setAdminRegisterError("");
    try {
      await saveAdminOperator({
        email: cleanEmail,
        fullName: cleanName,
        password: password || undefined,
        role: "Admin",
        allowedTabs: sanitizedTabs,
        canWrite: newAdminCanWrite,
        status: "Active",
        createdBy: currentEmail
      });

      if (password) {
        try {
          const { initializeApp, deleteApp } = await import("firebase/app");
          const { getAuth, createUserWithEmailAndPassword, signOut: fbSignOut } = await import("firebase/auth");
          const firebaseConfig = await getFirebaseConfig();

          let tempApp;
          try {
            tempApp = initializeApp(firebaseConfig, "RMATempAdminRegisterApp");
          } catch (err) {
            const { getApps } = await import("firebase/app");
            const apps = getApps();
            tempApp = apps.find(app => app.name === "RMATempAdminRegisterApp") || initializeApp(firebaseConfig, "RMATempAdminRegisterApp");
          }

          const tempAuth = getAuth(tempApp);
          await createUserWithEmailAndPassword(tempAuth, cleanEmail, password);
          await fbSignOut(tempAuth);
          await deleteApp(tempApp);
        } catch (authErr: any) {
          console.warn("Firebase Auth Soft Registration skipped:", authErr.message);
        }
      }

      await refreshAdminOperatorsDirectory();

      const wasEditing = !!editingOperatorEmail;
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminCanWrite(true);
      setNewAdminAllowedTabs([...DEFAULT_LIMITED_ADMIN_TABS]);
      setEditingOperatorEmail(null);

      showFeedback(
        wasEditing
          ? password
            ? `Updated access for ${cleanEmail} and emailed their new login credentials!`
            : `Updated access permissions for ${cleanEmail} (${sanitizedTabs.length} modules)`
          : `Created new Admin account for ${cleanEmail} & emailed their login credentials!`,
        "success"
      );
      addTerminalLog(
        `🛡️ [SUPER ADMIN] ${wasEditing ? "Updated" : "Created"} Admin "${cleanEmail}" with ${sanitizedTabs.length} allowed modules [${newAdminCanWrite ? "Read & Write" : "Read-Only"}]${password ? " — Login credentials emailed to " + cleanEmail : ""}.`
      );

      await saveAuditLog({
        adminEmail: currentEmail,
        action: wasEditing ? "Admin Permissions Updated" : "Admin Created",
        details: `Super Admin configured ${cleanEmail} with ${sanitizedTabs.length} modules (${newAdminCanWrite ? "Read & Write" : "Read Only"}).`
      });
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "Failed to save administrator account.";
      setAdminRegisterError(errMsg);
    } finally {
      setIsRegisteringAdmin(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = await getFirebaseAuth();
      await auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setCurrentAdminUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rma_current_logged_in_user");
      window.dispatchEvent(new Event("rma_admin_session_changed"));
    }
    showFeedback("Logged out successfully.", "success");
    addTerminalLog("🛡️ [ACCESS] Admin session closed & security lock engaged.");
  };

  const handleClearAccessLogs = () => {
    if (!isSuperAdmin) {
      showFeedback("Only Super Administrators can clear access logs.", "error");
      return;
    }
    setAccessLogs([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rma_backend_access_logs");
    }
    showFeedback("Access entry history purged.", "success");
    addTerminalLog("🛡️ [SECURITY] Entrance logs cleared by Super Admin.");
  };

  const handleLocalCheckInSuccess = async (name: string, location: string) => {
    const checkList = await getVisitorCheckIns();
    setVisitorCheckins(checkList);
    addTerminalLog(`👥 [CHECK-IN] Registered dynamic check-in: ${name} from ${location || 'Unknown'}.`);
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initAuthListener = async () => {
      try {
        const auth = await getFirebaseAuth();
        unsubscribe = auth.onAuthStateChanged((user: any) => {
          setIsFirebaseAuthActive(!!user);
          if (isUnlocked) {
            addTerminalLog(`🔒 [SECURITY] Firebase Auth session changed: ${user ? user.email : "guest"}`);
            fetchData();
          }
        });
      } catch (e) {
        console.warn("Could not attach Firebase Auth state listener:", e);
        setIsFirebaseAuthActive(false);
        // Fallback to fetch data if Firebase Auth is not loaded
        if (isUnlocked) {
          fetchData();
        }
      }
    };
    
    if (isUnlocked) {
      initAuthListener();
    } else {
      // Fetch once if locked to clear or load offline cached state safely
      setRegistrations([]);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isUnlocked]);

  useEffect(() => {
    const handleCheckinsUpdate = async () => {
      if (isUnlocked) {
        const cList = await getVisitorCheckIns();
        setVisitorCheckins(cList);
      }
    };
    window.addEventListener("rma_checkin_updated", handleCheckinsUpdate);
    return () => window.removeEventListener("rma_checkin_updated", handleCheckinsUpdate);
  }, [isUnlocked]);

  useEffect(() => {
    const handleMarqueeUpdate = async () => {
      if (isUnlocked) {
        try {
          const config = await getMarqueeConfig();
          setMarqueeEnabled(config.enabled);
          setMarqueeMessages(config.messages);
        } catch (e) {}
      }
    };
    window.addEventListener("rma_marquee_updated", handleMarqueeUpdate);
    return () => window.removeEventListener("rma_marquee_updated", handleMarqueeUpdate);
  }, [isUnlocked]);

  // Load live Firebase configuration metadata for the diagnostics panel
  useEffect(() => {
    if (!isUnlocked) return;
    const fetchFirebaseConfig = async () => {
      try {
        const info = await getFirebaseConfigInfo();
        setProjectId(info.projectId);
        setDatabaseId(info.firestoreDatabaseId);
        setDbStatus("Online (Connected)");
      } catch (err) {
        console.warn("Failed to load Firebase Config Info:", err);
        setDbStatus("Firebase unreachable");
      }
    };
    fetchFirebaseConfig();
  }, [isUnlocked]);

  // Real-time listener for registrations collection
  useEffect(() => {
    if (!isUnlocked) return;

    let unsubscribeSnapshot: (() => void) | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    const setupOnSnapshot = async () => {
      try {
        if (typeof window !== "undefined" && ((window as any).__rma_firestore_disabled || localStorage.getItem("rma_firestore_disabled") === "true")) {
          setDbStatus("Offline Mode (Local Cache Active)");
          return;
        }
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        const q = query(collection(db, "registrations"), orderBy("registeredAt", "desc"));
        
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }

        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fbList: Registration[] = [];
          snapshot.forEach((docSnap) => {
            fbList.push({ id: docSnap.id, ...docSnap.data() } as Registration);
          });
          
          setRegistrations(fbList);
          if (typeof window !== "undefined") {
            localStorage.setItem("rma_registrations", JSON.stringify(fbList));
          }
          
          setLastSyncTime(new Date().toLocaleTimeString());
          setCacheStatus("Streaming Updates (Live Snapshot Listener Active)");
          setDbStatus("Online (Real-time Feed)");
        }, (err) => {
          console.warn("Real-time registration snapshot error:", err);
          setDbStatus("Permission / Sync blocked");
        });
      } catch (e) {
        console.warn("Failed to subscribe to registrations snapshot:", e);
      }
    };

    const initListener = async () => {
      try {
        setupOnSnapshot();
        const auth = await getFirebaseAuth().catch(() => null);
        if (auth) {
          unsubscribeAuth = auth.onAuthStateChanged((user: any) => {
            if (user) {
              setupOnSnapshot();
            }
          });
        }
      } catch (e) {
        console.warn("Failed initializing snapshot listener authentication trigger:", e);
      }
    };

    initListener();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [isUnlocked, currentAdminUser, listenerTriggerCount]);

  // Listen to live notification updates to trigger elegant operational popup toast notifications!
  useEffect(() => {
    if (!isUnlocked) return;

    let previousNotificationsRaw = "";
    
    // Set initial notifications key as read/seen when dashboard starts, to avoid toast spam on first load
    const initialRaw = localStorage.getItem("rma_notifications");
    if (initialRaw) {
      previousNotificationsRaw = initialRaw;
    }

    const handleNotificationsChange = () => {
      const currentRaw = localStorage.getItem("rma_notifications");
      if (!currentRaw) return;

      if (previousNotificationsRaw && currentRaw !== previousNotificationsRaw) {
        try {
          const prevList = JSON.parse(previousNotificationsRaw);
          const currList = JSON.parse(currentRaw);
          
          // Find if there is a newly added registration notification that is unread and not present in the previous list
          const prevIds = new Set(prevList.map((n: any) => n.id));
          const newEntries = currList.filter((n: any) => !prevIds.has(n.id) && !n.isRead);

          newEntries.forEach((notif: any) => {
            if (notif.type === "registration") {
              const timeFormatted = notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : "Just now";
              
              showFeedback(`🔔 NEW REGISTRATION RECEIVED: ${notif.message} (${timeFormatted})`, "success");
              addTerminalLog(`🔔 [REAL-TIME ALERT] ${notif.title}: "${notif.message}" received at ${timeFormatted}`);
            }
          });
        } catch (e) {
          console.warn("Error parsing or comparing real-time notification lists:", e);
        }
      }
      previousNotificationsRaw = currentRaw;
    };

    window.addEventListener("rma_notifications_updated", handleNotificationsChange);
    return () => {
      window.removeEventListener("rma_notifications_updated", handleNotificationsChange);
    };
  }, [isUnlocked]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [registrations, searchQuery, selectedProfileFilter, selectedLocationFilter, selectedStatusFilter, selectedDateFilter, selectedPaymentStatusFilter, pendingPaymentsOnly, registryGroupFilter]);

  // Automatic background sync trigger to update registrations from Firestore every 30 seconds
  useEffect(() => {
    if (!isUnlocked) return;
    
    const interval = setInterval(async () => {
      try {
        const data = await getRegistrations();
        setRegistrations(data);
        const checkList = await getVisitorCheckIns();
        setVisitorCheckins(checkList);
        
        // Sync diagnostics metadata
        setLastSyncTime(new Date().toLocaleTimeString());
        setCacheStatus("Background Pull Active (Automatic 30s Cycles)");
        setDbStatus("Online (Connected)");
        addTerminalLog("🌐 [SYNC] Background sync complete. Registry database updated from Firestore.");
      } catch (e) {
        console.warn("Background sync failed:", e);
        setDbStatus("Sync failure");
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isUnlocked]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Wait for Firebase Auth to initialize (up to 2.5 seconds) to restore current login state
      try {
        const auth = await getFirebaseAuth();
        await new Promise<void>((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user: any) => {
            unsubscribe();
            resolve();
          });
          setTimeout(resolve, 2500);
        });
      } catch (authErr) {
        console.warn("Could not wait for Firebase Auth initialization:", authErr);
      }

      const data = await getRegistrations();
      setRegistrations(data);

      const checkList = await getVisitorCheckIns();
      setVisitorCheckins(checkList);

      const config = await getMarqueeConfig();
      setMarqueeEnabled(config.enabled);
      setMarqueeMessages(config.messages);

      // Sync diagnostics metadata
      const stamp = new Date().toLocaleTimeString();
      setLastSyncTime(stamp);
      setCacheStatus("Initial Direct Load");
      setDbStatus("Online (Connected)");

      showFeedback("Live registry database synchronized.", "success");
      addTerminalLog("🌐 [SYNC] Databank synced cleanly. Loaded " + data.length + " candidate rows.");
      addTerminalLog("👥 [SYNC] Loaded " + checkList.length + " live guest check-ins.");
    } catch (e: any) {
      console.error(e);
      setDbStatus("Database offline");
      showFeedback("Loaded cached local registers.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Force actual cloud refresh directly from Firestore (bypassing local client DB SDK caching checks)
  const handleSyncNow = async () => {
    if (!isUnlocked) return;
    try {
      setIsRefreshingCloud(true);
      setDbStatus("Reconnecting...");
      addTerminalLog("🔄 [CLOUD] Initiating administrative Sync Now command...");
      
      // 1. Clear stale cache (keep rma_custom_saved_courses intact so custom courses are preserved)
      if (typeof window !== "undefined") {
        localStorage.removeItem("rma_registrations");
        localStorage.removeItem("rma_notifications");
        localStorage.removeItem("rma_events");
        localStorage.removeItem("rma_email_logs");
      }
      addTerminalLog("🧹 [CLOUD] Local browser caches and database index tables purged successfully.");

      // 2. Reconnect listeners
      setListenerTriggerCount(prev => prev + 1);
      addTerminalLog("⚡ [CLOUD] Unsubscribed and reconnected all live Firestore snapshot listeners.");

      // 3. Reload Firestore data directly bypassing caches
      const freshData = await getRegistrations(true); // force fresh directly from Firestore Server!
      setRegistrations(freshData);
      
      const checkList = await getVisitorCheckIns(); // refresh guest check-ins
      setVisitorCheckins(checkList);
      
      const stamp = new Date().toLocaleTimeString();
      setLastSyncTime(stamp);
      setCacheStatus("Bypassed SDK Cache (Forced Direct Cloud Pull)");
      setDbStatus("Online (Real-time Feed)");
      
      showFeedback("Forced synchronization complete! Real-time listeners reconnected and cache cleared.", "success");
      addTerminalLog(`🚀 [CLOUD] Synchronized ${freshData.length} live registration rows directly from Firestore.`);
    } catch (err: any) {
      console.error(err);
      setDbStatus("Offline");
      showFeedback(`Cloud sync failed: ${err.message || String(err)}`, "error");
      addTerminalLog(`❌ [CLOUD] Sync error occurred: ${err.message || String(err)}`);
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  const getConnectionIndicator = () => {
    const statusLower = dbStatus.toLowerCase();
    if (statusLower.includes("online") || statusLower.includes("streaming") || statusLower.includes("real-time") || statusLower.includes("connected") || statusLower.includes("active")) {
      return (
        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
          🟢 Connected to Firestore
        </span>
      );
    }
    if (statusLower.includes("connecting") || statusLower.includes("syncing") || statusLower.includes("reconnecting")) {
      return (
        <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block animate-pulse"></span>
          🟡 Reconnecting...
        </span>
      );
    }
    return (
      <span className="text-xs font-mono font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block"></span>
        🔴 Offline
      </span>
    );
  };

  const addTerminalLog = (log: string) => {
    setTerminalLogs(prev => [log, ...prev].slice(0, 20));
  };

  const handleSaveMarquee = async () => {
    if (!checkWritePermission()) return;
    try {
      setIsSavingMarquee(true);
      const cleanedMessages = marqueeMessages.map(msg => msg.trim()).filter(msg => msg.length > 0);
      if (cleanedMessages.length === 0) {
        showFeedback("Please provide at least one announcement message.", "error");
        return;
      }
      await saveMarqueeConfig({
        enabled: marqueeEnabled,
        messages: cleanedMessages
      });
      setMarqueeMessages(cleanedMessages);
      showFeedback("Marquee ticker scroller updated!", "success");
      addTerminalLog("📢 [SETTINGS] Updated scrolling announcements.");
      saveAuditLog({
        adminEmail: currentEmail,
        action: "Settings Updated",
        details: `Updated scrolling marquee marquee ticker`
      }).catch(console.error);
    } catch (e) {
      console.error(e);
      showFeedback("Failed to update announcement scroller.", "error");
    } finally {
      setIsSavingMarquee(false);
    }
  };

  const handleAddMessage = () => {
    setMarqueeMessages([...marqueeMessages, ""]);
  };

  const handleMessageChange = (index: number, val: string) => {
    const f = [...marqueeMessages];
    f[index] = val;
    setMarqueeMessages(f);
  };

  const handleRemoveMessage = (index: number) => {
    setMarqueeMessages(marqueeMessages.filter((_, i) => i !== index));
  };

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage({ text: "", type: "success" });
    }, 4000);
  };

  const applyFiltersAndSearch = () => {
    let result = [...registrations];

    if (pendingPaymentsOnly) {
      result = result.filter(reg => reg.paymentStatus === "pending");
    }

    if (registryGroupFilter === "rma") {
      result = result.filter(reg => !reg.profileType?.startsWith("cii"));
    } else if (registryGroupFilter === "cii") {
      result = result.filter(reg => reg.profileType?.startsWith("cii"));
    }

    if (selectedProfileFilter !== "all") {
      if (selectedProfileFilter === "cii") {
        result = result.filter(reg => reg.profileType?.startsWith("cii"));
      } else {
        result = result.filter(reg => reg.profileType === selectedProfileFilter);
      }
    }

    if (selectedLocationFilter !== "all" && selectedLocationFilter.trim() !== "") {
      result = result.filter(reg => reg.location.toLowerCase() === selectedLocationFilter.toLowerCase());
    }

    if (selectedStatusFilter !== "all" && selectedStatusFilter.trim() !== "") {
      result = result.filter(reg => (reg.status || "Received").toLowerCase() === selectedStatusFilter.toLowerCase());
    }

    if (selectedDateFilter !== "all") {
      const now = new Date("2026-06-17T16:38:22-07:00").getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      result = result.filter(reg => {
        const dateStr = reg.registeredAt || reg.submissionDate;
        if (!dateStr) return false;
        try {
          const itemTime = new Date(dateStr).getTime();
          const diffMs = now - itemTime;
          if (selectedDateFilter === "today") {
            return diffMs <= oneDay && diffMs >= 0;
          } else if (selectedDateFilter === "last7") {
            return diffMs <= 7 * oneDay && diffMs >= 0;
          } else if (selectedDateFilter === "last30") {
            return diffMs <= 30 * oneDay && diffMs >= 0;
          }
        } catch (e) {
          return false;
        }
        return true;
      });
    }

    if (selectedPaymentStatusFilter !== "all") {
      result = result.filter(reg => {
        const status = reg.paymentStatus || "pending";
        return status.toLowerCase() === selectedPaymentStatusFilter.toLowerCase();
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        reg => 
          reg.fullName.toLowerCase().includes(query) ||
          reg.email.toLowerCase().includes(query) ||
          reg.phone.includes(query) ||
          reg.location.toLowerCase().includes(query) ||
          (reg.institution && reg.institution.toLowerCase().includes(query)) ||
          (reg.batch && reg.batch.toLowerCase().includes(query))
      );
    }

    setFilteredRegistrations(result);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProfileFilter("all");
    setSelectedLocationFilter("all");
    setSelectedStatusFilter("all");
    setSelectedDateFilter("all");
    setSelectedPaymentStatusFilter("all");
    setRegistryGroupFilter("all");
    addTerminalLog("🧹 [FILTER] Active registry filters clear.");
  };

  const handleUpdateStatus = (id: string, status: string, notes: string, extras?: any) => {
    if (!checkWritePermission()) return;
    const updated = registrations.map(reg => {
      if (reg.id === id) {
        return { ...reg, status, notes, ...extras };
      }
      return reg;
    });
    setRegistrations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_registrations", JSON.stringify(updated));
    }
    
    updateRegistration(id, { status, notes, ...extras }).catch((err) => {
      console.error("Replication error for dossier update:", err);
    });
    
    setSelectedMemberProfile(prev => prev && prev.id === id ? { ...prev, status, notes, ...extras } : prev);
    showFeedback("Candidate dossier status updated!", "success");
    addTerminalLog(`📝 [DOSSIER] Nominee ID ${id} set to [${status}].`);

    const nominee = registrations.find(reg => reg.id === id);
    const nomineeName = nominee ? nominee.fullName : id;
    saveAuditLog({
      adminEmail: currentEmail,
      action: "Status Updated",
      details: `Nominee ${nomineeName} (ID: ${id}) set to ${status}. Details/Notes: ${notes || 'N/A'}`
    }).catch(console.error);
  };

  const handleDeleteCandidate = (id: string) => {
    if (!checkWritePermission()) return;
    const nominee = registrations.find(reg => reg.id === id);
    const nomineeDesc = nominee ? `${nominee.fullName} (${nominee.email})` : id;

    const updated = registrations.filter(reg => reg.id !== id);
    setRegistrations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("rma_registrations", JSON.stringify(updated));
    }
    
    deleteRegistration(id).catch((err) => {
      console.error("Replication error for dossier deletion:", err);
    });
    
    showFeedback("Dossier removed.", "success");
    addTerminalLog(`❌ [REGISTRY] Deleted nominee row from database: ${id}`);

    saveAuditLog({
      adminEmail: currentEmail,
      action: "Candidate Deleted",
      details: `Permanently removed candidate dossier: ${nomineeDesc}`
    }).catch(console.error);
    if (selectedMemberProfile && selectedMemberProfile.id === id) {
      setSelectedMemberProfile(null);
    }
  };

  const handleSeedMockData = async () => {
    if (!checkWritePermission()) return;
    const mockEntries: Registration[] = [
      {
        id: "reg-mock-1",
        fullName: "Oluwaseun Temitope",
        email: "stemitope@yahoo.com",
        phone: "+234 814 123 4567",
        profileType: "cii",
        location: "Ekiti State",
        batch: "Cohort 5",
        primaryGoal: "career_positioning",
        aspiration: "Hopes to build senior full-stack web architectures and secure global remote placements while serving in Ado-Ekiti.",
        institution: "Federal University of Technology, Akure (Computer Science)",
        registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "Reviewed",
        notes: "Excellent technical background. Fits CII Fellow criteria well."
      } as any,
      {
        id: "reg-mock-2",
        fullName: "Yusuf Ibrahim Alao",
        email: "yalao.b1@gmail.com",
        phone: "+234 905 555 4321",
        profileType: "corps_member",
        location: "Osun State",
        batch: "Cohort 6",
        primaryGoal: "entrepreneurship",
        aspiration: "Wants to structure digital agencies offering motion graphics and branding layout systems for standard SMEs.",
        institution: "Obafemi Awolowo University (M.B.A. Candidate)",
        registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: "Shortlisted",
        notes: "Ambitious startup profile."
      } as any,
      {
        id: "reg-mock-3",
        fullName: "Eberechi Chioma",
        email: "ebi_chioma@outlook.com",
        phone: "+234 803 987 6543",
        profileType: "student",
        location: "Enugu State",
        aspiration: "Transitioning from Guidance & Counseling theories into core digital designs.",
        institution: "University of Nigeria, Nsukka, 300L",
        registeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: "Received"
      } as any,
      {
        id: "reg-mock-4",
        fullName: "Olosunde Louis (Registry Demo)",
        email: "olosundelouis@gmail.com",
        phone: "+234 815 111 2222",
        profileType: "cii",
        location: "Lagos, Nigeria",
        batch: "Cohort 6",
        primaryGoal: "financial_intelligence",
        aspiration: "Looking for high-level technical mentorship and peer leadership networks.",
        institution: "University of Ibadan (Civil Engineering)",
        registeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: "Enrolled",
        notes: "Founding chapter member and core contact lead."
      } as any
    ];

    const existingEmails = new Set(registrations.map(r => r.email.toLowerCase()));
    const filteredMocks = mockEntries.filter(m => !existingEmails.has(m.email.toLowerCase()));

    if (filteredMocks.length === 0) {
      showFeedback("Registry database already has seed data listings.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const { saveRegistration } = await import("../lib/db");
      for (const mockItem of filteredMocks) {
        // Strip out mock id/registeredAt so database assigns fresh clean ids and timestamps
        const { id, registeredAt, ...restOfMock } = mockItem as any;
        await saveRegistration(restOfMock);
      }
      
      const refreshedData = await getRegistrations();
      setRegistrations(refreshedData);
      
      showFeedback("Injected and synchronized " + filteredMocks.length + " mock fellows!", "success");
      addTerminalLog("🌱 [SEED] Successfully pushed " + filteredMocks.length + " high-fidelity candidate registers to cloud sync queue.");
    } catch (err: any) {
      console.error("Failed to sync mock data:", err);
      // Fallback
      const compiled = [...filteredMocks, ...registrations];
      setRegistrations(compiled);
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_registrations", JSON.stringify(compiled));
      }
      showFeedback("Injected " + filteredMocks.length + " mock fellows locally (Cloud sync queue offline).", "success");
      addTerminalLog("🌱 [SEED] Appended " + filteredMocks.length + " mock candidate registers to local cache offline.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    let listToExport = filteredRegistrations;
    if (activeTab === "reg-cii") {
      listToExport = filteredRegistrations.filter(reg => reg.profileType?.startsWith("cii"));
    } else if (activeTab === "reg-rma") {
      listToExport = filteredRegistrations.filter(reg => !reg.profileType?.startsWith("cii"));
    }

    if (listToExport.length === 0) {
      showFeedback("No rows present in active queue to extract.", "error");
      return;
    }

    const headers = [
      "Full Name", 
      "Email Address", 
      "Phone", 
      "Profile Type", 
      "Strategic Location", 
      "Affiliated Institution", 
      "Batch/Cohort",
      "Goal / Primary Aspiration",
      "Plan Option",
      "Dossier Notes",
      "Review Status",
      "Date Ingested"
    ];

    const rows = listToExport.map(reg => [
      reg.fullName,
      reg.email,
      reg.phone,
      reg.profileType,
      reg.location,
      reg.institution || "N/A",
      reg.batch || "N/A",
      reg.primaryGoal || reg.aspiration || "N/A",
      reg.planType || "N/A",
      reg.notes || "N/A",
      reg.status || "Received",
      reg.registeredAt
    ]);

    const csvString = [headers.join(","), ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const fileNameScope = activeTab === "reg-cii" ? "CII" : "RMA";
    link.setAttribute("download", `RMA_${fileNameScope}_Candidates_Extract_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showFeedback("Extract compiled! CSV generation complete.", "success");
    addTerminalLog(`📊 [EXPORT] Extracted ${listToExport.length} rows to CSV format.`);
  };

  const handleImportCSV = async (file: File) => {
    if (!checkWritePermission()) return;
    
    setIsLoading(true);
    addTerminalLog(`📂 [IMPORT] Initiating bulk import processor for file: ${file.name}`);
    
    try {
      const text = await file.text();
      // Simple robust CSV line split and parsing
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = "";
      let inQuotes = false;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (inQuotes) {
          if (char === '"') {
            if (nextChar === '"') {
              // Escaped quote
              currentField += '"';
              i++; // skip next char
            } else {
              // Quote closed
              inQuotes = false;
            }
          } else {
            currentField += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            currentRow.push(currentField);
            currentField = "";
          } else if (char === '\r' || char === '\n') {
            currentRow.push(currentField);
            currentField = "";
            if (currentRow.some(field => field.trim() !== "")) {
              rows.push(currentRow);
            }
            currentRow = [];
            // Skip next char if Windows newline (\r\n)
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
          } else {
            currentField += char;
          }
        }
      }
      
      // Store final trailing field/row if any
      if (currentField !== "" || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.some(field => field.trim() !== "")) {
          rows.push(currentRow);
        }
      }
      
      if (rows.length < 2) {
        throw new Error("The CSV file is empty or does not contain more than 1 row (header + data).");
      }
      
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const dataRows = rows.slice(1);
      
      // Map columns (flexible lookup keywords)
      const findIndex = (keywords: string[]) => {
        return headers.findIndex(h => keywords.some(k => h.includes(k)));
      };
      
      const idxFullName = findIndex(["full name", "name", "candidate"]);
      const idxEmail = findIndex(["email address", "email", "mail"]);
      const idxPhone = findIndex(["phone", "tel", "contact", "mobile"]);
      const idxProfile = findIndex(["profile type", "profile", "segment", "type"]);
      const idxLocation = findIndex(["strategic location", "location", "region", "state"]);
      const idxInstitution = findIndex(["affiliated institution", "institution", "school", "university"]);
      const idxBatch = findIndex(["batch/cohort", "cohort", "batch"]);
      const idxGoal = findIndex(["goal", "aspiration", "primary goal", "primary aspiration"]);
      const idxPlanType = findIndex(["plan option", "plan type", "plan"]);
      const idxNotes = findIndex(["dossier notes", "notes", "note", "comment"]);
      const idxStatus = findIndex(["review status", "review decision", "status"]);
      
      if (idxFullName === -1 || idxEmail === -1) {
        throw new Error("Missing mandatory CSV headers. Please ensure the CSV has at least 'Full Name' and 'Email Address' columns.");
      }
      
      const { saveRegistration } = await import("../lib/db");
      let importCount = 0;
      let skipCount = 0;
      
      const existingEmails = new Set(registrations.map(r => r.email.toLowerCase()));
      
      for (const row of dataRows) {
        if (row.length === 0 || !row[idxFullName] || !row[idxEmail]) {
          continue;
        }
        
        const fullName = row[idxFullName]?.trim();
        const email = row[idxEmail]?.trim().toLowerCase();
        
        if (!fullName || !email) continue;
        
        // Skip duplicate email check to keep database clean
        if (existingEmails.has(email)) {
          skipCount++;
          continue;
        }
        
        const phone = idxPhone !== -1 ? (row[idxPhone]?.trim() || "+234") : "+234";
        const profileType = idxProfile !== -1 ? (row[idxProfile]?.trim() || "corps_member") : "corps_member";
        const location = idxLocation !== -1 ? (row[idxLocation]?.trim() || "Lagos, Nigeria") : "Lagos, Nigeria";
        const institution = idxInstitution !== -1 ? row[idxInstitution]?.trim() : undefined;
        const batch = idxBatch !== -1 ? row[idxBatch]?.trim() : undefined;
        const primaryGoal = idxGoal !== -1 ? row[idxGoal]?.trim() : undefined;
        let planType: "waitlist" | "free" | "growth" | "impact" | undefined = undefined;
        if (idxPlanType !== -1) {
          const rawPlan = row[idxPlanType]?.trim().toLowerCase();
          if (["waitlist", "free", "growth", "impact"].includes(rawPlan)) {
            planType = rawPlan as "waitlist" | "free" | "growth" | "impact";
          }
        }
        const notes = idxNotes !== -1 ? row[idxNotes]?.trim() : undefined;
        const status = idxStatus !== -1 ? (row[idxStatus]?.trim() || "Received") : "Received";
        
        await saveRegistration({
          fullName,
          email,
          phone,
          profileType,
          location,
          batch,
          primaryGoal,
          planType,
          notes,
          status,
          institution
        });
        
        importCount++;
      }
      
      // Refresh registrations listing
      const updatedData = await getRegistrations();
      setRegistrations(updatedData);
      
      showFeedback(`Parsing complete! Bulk imported ${importCount} nominee entries successfully.${skipCount > 0 ? ` Skipped ${skipCount} duplicates.` : ""}`, "success");
      addTerminalLog(`📊 [IMPORT] Bulk processed file: ${file.name}. Saved ${importCount} new rows to db.${skipCount > 0 ? ` Skipped ${skipCount} matched rows.` : ""}`);
      
      try {
        await saveAuditLog({
          adminEmail: currentAdminUser?.username || "Admin",
          action: "Bulk Data Imported",
          details: `Uploaded CSV file [${file.name}], successfully restored and bulk populated ${importCount} nominee dossiers.`
        });
      } catch (logErr) {
        console.warn("Failed to save audit log for import:", logErr);
      }
      
    } catch (err: any) {
      console.error("Bulk CSV import failure:", err);
      showFeedback(err?.message || "Error processing CSV file. Please verify CSV structural schema.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileBadgeTheme = (type: string) => {
    if (type?.startsWith("cii")) {
      return "bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/25 font-bold shadow-2xs";
    }
    switch (type) {
      case "corps_member":
        return "bg-teal-50 text-teal-800 border-teal-120";
      case "student":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "teen":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "mentor":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-gray-50 text-gray-750 border-gray-150";
    }
  };

  const getProfileLabel = (type: string) => {
    if (type?.startsWith("cii")) {
      return "CII Impact Fellow";
    }
    switch (type) {
      case "corps_member": return "RMA - Corps Member";
      case "student": return "RMA - Uni Student";
      case "teen": return "RMA - Teens Academy";
      case "mentor": return "RMA - Partner Coach";
      default: return type;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Reviewed":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Shortlisted":
        return "bg-indigo-50 text-indigo-700 border-indigo-150";
      case "Enrolled":
        return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "Deferred":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-gray-50 text-gray-650 border-gray-150";
    }
  };

  const uniqueLocations = Array.from(
    new Set(registrations.map(r => r.location).filter(Boolean))
  ) as string[];

  const handleQuickCreateMember = async (memberData: Omit<Registration, "id" | "registeredAt">) => {
    try {
      const { saveRegistration } = await import("../lib/db");
      await saveRegistration(memberData);
      const data = await getRegistrations();
      setRegistrations(data);
      addTerminalLog(`➕ [QUICK-CREATE] Created candidate dossier: ${memberData.fullName}`);
    } catch (e: any) {
      console.error(e);
      showFeedback("Failed to manually seed candidate.", "error");
    }
  };

  const handleQuickCreateCheckIn = async (checkInData: Omit<VisitorCheckIn, "id" | "checkedInAt">) => {
    try {
      const { saveVisitorCheckIn } = await import("../lib/db");
      await saveVisitorCheckIn(checkInData);
      const cList = await getVisitorCheckIns();
      setVisitorCheckins(cList);
      addTerminalLog(`➕ [QUICK-CREATE] Registered visitor check-in: ${checkInData.name}`);
    } catch (e: any) {
      console.error(e);
      showFeedback("Failed to manually register check-in.", "error");
    }
  };

  const handleQuickCreateAnnouncement = async (annText: string) => {
    try {
      const currentMessages = [...marqueeMessages, annText];
      setMarqueeMessages(currentMessages);
      
      const config = {
        enabled: marqueeEnabled,
        messages: currentMessages
      };
      await saveMarqueeConfig(config);
      addTerminalLog(`📢 [QUICK-CREATE] Added marquee ticker notice: "${annText.slice(0, 30)}..."`);
    } catch (e: any) {
      console.error(e);
      showFeedback("Failed to publish announcement ticker.", "error");
    }
  };

  // Secure locked login screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071310] via-[#0D251D] to-[#0E3A2F] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none border-t-8 border-amber-400">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/[0.045]/10 to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md bg-white/95 rounded-[2rem] border border-white/10 p-8 sm:p-10 shadow-2xl relative z-10 backdrop-blur-sm text-left"
        >
          {/* Back Trigger */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-slate-200 bg-slate-50 px-3 py-1 rounded-lg transition-all cursor-pointer shadow-xs select-none"
          >
            <ArrowLeft size={11} /> Exit Gate
          </button>

          <div className="text-center space-y-2 mt-4 mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-[#0E3A2F] text-amber-300 items-center justify-center text-2xl font-black shadow-md shadow-emerald-990/40 select-none">
              🔒
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 tracking-tight uppercase leading-none">
              {isForgotPasswordMode ? "RECOVER CREDENTIALS" : "ADMINISTRATIVE PORTAL"}
            </h2>
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-slate-400 font-mono block">
              Right Minds Africa Operations Deck
            </span>
          </div>

          <form onSubmit={isForgotPasswordMode ? handleForgotPasswordSubmit : handleLoginSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-widest font-mono">
                Registered Admin Email:
              </label>
              <input
                type="email"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your authorized administrator email"
                className="w-full px-4 py-3 border border-slate-200 focus:border-[#0E3A2F] rounded-xl text-xs outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all font-semibold shadow-xs"
              />
            </div>

            {!isForgotPasswordMode && (
              <div className="space-y-1">
                <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-widest font-mono">
                  Operational Secure Password:
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter operational secure password"
                  className="w-full px-4 py-3 border border-slate-200 focus:border-[#0E3A2F] rounded-xl text-xs outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all font-semibold shadow-xs"
                />
              </div>
            )}

            {!isForgotPasswordMode && (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#0E3A2F] focus:ring-[#0E3A2F] w-3.5 h-3.5"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(true);
                    setLoginError("");
                  }}
                  className="text-[#E76F51] hover:underline font-bold transition-all bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-red-50 text-red-650 border border-red-150 rounded-xl text-[10.5px] font-extrabold font-mono leading-relaxed">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading || lockoutTimeLeft > 0}
              className={`w-full py-3.5 transition-all text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer disabled:opacity-50 select-none flex items-center justify-center gap-2 mt-2 leading-none ${
                lockoutTimeLeft > 0 
                  ? "bg-red-950/90 text-red-100 hover:bg-red-950/90 cursor-not-allowed border border-red-900/30 font-bold" 
                  : "bg-[#0e3a2f] hover:bg-[#07130F] text-amber-300 hover:text-white"
              }`}
            >
              {lockoutTimeLeft > 0 ? (
                <>
                  <Lock size={12} className="shrink-0" />
                  <span>TEMPORARILY LOCKED: WAIT {lockoutTimeLeft}S</span>
                </>
              ) : (
                <>
                  <Unlock size={12} className="shrink-0" />
                  <span>{isAuthLoading ? "Verifying..." : isForgotPasswordMode ? "Send Password Reset Link" : "Establish Secure Session"}</span>
                </>
              )}
            </button>

            {isSupabaseConfigured && (
              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Supabase Auth Active (Cross-Device Shared Session)
                </span>
              </div>
            )}

            <div className="pt-2 text-center text-[10px]">
              {isForgotPasswordMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setLoginError("");
                  }}
                  className="text-slate-550 hover:text-[#0E3A2F] hover:underline font-bold transition-all bg-transparent border-none cursor-pointer"
                >
                  Return to gateway access
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Beautiful layout for authorized unlocked administrators
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none antialiased">
      
      {/* ⚠️ Dynamic floating Toast Messages */}
      {feedbackMessage.text && (
        <div className="fixed top-24 right-6 z-50 animate-[slideIn_0.25s_ease-out]">
          <div className={`p-4 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-bold leading-none ${
            feedbackMessage.type === "success" 
              ? "bg-[#103D2E] text-amber-300 border-[#103D2E]" 
              : "bg-red-900 text-white border-red-850"
          }`}>
            <span>{feedbackMessage.type === "success" ? "🛡️" : "⚠️"}</span>
            {feedbackMessage.text}
          </div>
        </div>
      )}

      {/* 1. Left Fixed Sidebar Layout */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!isSuperAdmin && !effectiveAllowedTabs.includes(tab)) {
            showFeedback("Access Restricted: The Super Admin has not enabled that module for your account.", "error");
            return;
          }
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        isSuperAdmin={isSuperAdmin}
        hasWriteAccess={hasWriteAccess}
        currentEmail={currentEmail}
        currentAdminName={currentAdminUser?.fullName}
        userRole={userRole}
        allowedTabs={effectiveAllowedTabs}
        onSignOut={handleSignOut}
        onGoBackToWebsite={onBack}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Right panel viewport logic */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* Sticky top Operations Header */}
        <AdminHeader
          activeTab={activeTab}
          isSuperAdmin={isSuperAdmin}
          currentEmail={currentEmail}
          currentAdminName={currentAdminUser?.fullName}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickCreateMember={() => {
            setQuickCreateModalTab("member");
            setIsQuickCreateModalOpen(true);
          }}
          onQuickCreateEvent={() => {
            setQuickCreateModalTab("checkin");
            setIsQuickCreateModalOpen(true);
          }}
          onQuickCreateAnnouncement={() => {
            setQuickCreateModalTab("announcement");
            setIsQuickCreateModalOpen(true);
          }}
          onToggleTerminal={() => setShowTerminalConsole(prev => !prev)}
          onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic page content panel frame */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* Real-time Firestore Diagnostics Console Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                  <Database className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    Live Registry Databank Status
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full animate-ping"></span>
                      Single Source of Truth Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time diagnostics and cache-bypass controls from Firestore.</p>
                </div>
              </div>
              
              <button
                onClick={handleSyncNow}
                disabled={isRefreshingCloud}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[#103D2E] bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-100 border border-emerald-200/50 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCloud ? "animate-spin" : ""}`} />
                {isRefreshingCloud ? "Syncing..." : "Sync Now"}
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Firebase Project ID</span>
                <span className="text-xs font-mono font-medium text-slate-900 truncate block" title={projectId}>{projectId}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Collection Queried</span>
                <span className="text-xs font-mono font-medium text-slate-900 block">registrations</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Total Documents</span>
                <span className="text-xs font-mono font-bold text-slate-900 block">{registrations.length} docs</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Last Server Sync</span>
                <span className="text-xs font-mono font-semibold text-[#103D2E] block">{lastSyncTime}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Cache Policy</span>
                <span className="text-xs font-semibold text-slate-700 truncate block" title={cacheStatus}>{cacheStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Firestore Connection</span>
                {getConnectionIndicator()}
              </div>
            </div>
          </div>

          {/* Internship Application Form & Spreadsheet Backend Toolbar */}
          {activeTab !== "google-forms" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-[#103D2E] font-mono tracking-widest bg-[#FAF8F3] border border-[#103D2E]/10 px-2.5 py-0.5 rounded-full">
                    Internship Intake Controls
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">
                    Internship Application Form &amp; Google Sheets
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Manage active Internship Form mode, access Google Sheets (olosundelouis@gmail.com), export CSV, or view Full Screen.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleSetVolunteerFormMode("google_form")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      volunteerFormMode === "google_form"
                        ? "bg-[#103D2E] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Google Form
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetVolunteerFormMode("interactive")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      volunteerFormMode === "interactive"
                        ? "bg-[#103D2E] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Direct Form
                  </button>
                </div>

                <a
                  href="https://docs.google.com/spreadsheets/u/0/?authuser=olosundelouis@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open Google Sheets for olosundelouis@gmail.com"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  <span>Google Sheet</span>
                </a>

                <button
                  type="button"
                  onClick={handleExportVolunteerApplicationsCSV}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Export volunteer submissions as CSV"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVolunteerFullScreen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open Google Form in Full Screen view"
                >
                  <Maximize2 size={13} />
                  <span>Full Screen</span>
                </button>
              </div>
            </div>
          )}

          {isVolunteerFullScreen && (
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col">
              <div className="w-full bg-[#103D2E] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-amber-300 font-mono tracking-widest bg-white/10 px-2.5 py-1 rounded-md">
                    Admin Fullscreen Preview
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                    Right-Minds Africa Hub — Volunteer Google Form
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVolunteerFullScreen(false)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Minimize2 size={13} />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
              <div className="flex-1 w-full bg-white relative">
                <iframe
                  src={volunteerFormUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="w-full h-full bg-white border-0"
                  title="Right-Minds Africa Hub Volunteer Application Fullscreen"
                >
                  Loading Google Form...
                </iframe>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            
            {/* Tab: Dashboard Overview */}
            {activeTab === "dashboard" && (
              <DashboardOverview
                key="dashboard"
                registrations={registrations}
                visitorCheckins={visitorCheckins}
                isSuperAdmin={isSuperAdmin}
                currentEmail={currentEmail}
                currentAdminName={currentAdminUser?.fullName}
                onNavigateTab={setActiveTab}
                onQuickCreateMember={() => {
                  setQuickCreateModalTab("member");
                  setIsQuickCreateModalOpen(true);
                }}
                onQuickCreateAnnouncement={() => {
                  setQuickCreateModalTab("announcement");
                  setIsQuickCreateModalOpen(true);
                }}
                latestLogs={terminalLogs}
                pendingSyncCount={pendingSyncCount}
                failedSubmissionsCount={failedSubmissionsCount}
              />
            )}

            {/* Tab: Corper Impact Initiative (CII) Registry */}
            {activeTab === "reg-cii" && (
              <DatatableView
                key="reg-cii"
                registrations={registrations.filter(reg => reg.profileType?.startsWith("cii"))}
                filteredRegistrations={filteredRegistrations.filter(reg => reg.profileType?.startsWith("cii"))}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedProfileFilter={selectedProfileFilter}
                setSelectedProfileFilter={setSelectedProfileFilter}
                selectedLocationFilter={selectedLocationFilter}
                setSelectedLocationFilter={setSelectedLocationFilter}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                selectedDateFilter={selectedDateFilter}
                setSelectedDateFilter={setSelectedDateFilter}
                selectedPaymentStatusFilter={selectedPaymentStatusFilter}
                setSelectedPaymentStatusFilter={setSelectedPaymentStatusFilter}
                registryGroupFilter={registryGroupFilter}
                setRegistryGroupFilter={setRegistryGroupFilter}
                uniqueLocations={uniqueLocations}
                onSelectMember={setSelectedMemberProfile}
                onClearFilters={handleClearFilters}
                onQuickCreateMember={() => {
                  setQuickCreateModalTab("member");
                  setIsQuickCreateModalOpen(true);
                }}
                onExportCSV={handleExportCSV}
                onImportCSV={handleImportCSV}
                getProfileLabel={getProfileLabel}
                getProfileBadgeTheme={getProfileBadgeTheme}
                getStatusBadgeColor={getStatusBadgeColor}
                forceSegment="cii"
              />
            )}

            {/* Tab: Right-Minds Africa (RMA) Registry */}
            {activeTab === "reg-rma" && (
              <DatatableView
                key="reg-rma"
                registrations={registrations.filter(reg => !reg.profileType?.startsWith("cii"))}
                filteredRegistrations={filteredRegistrations.filter(reg => !reg.profileType?.startsWith("cii"))}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedProfileFilter={selectedProfileFilter}
                setSelectedProfileFilter={setSelectedProfileFilter}
                selectedLocationFilter={selectedLocationFilter}
                setSelectedLocationFilter={setSelectedLocationFilter}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                selectedDateFilter={selectedDateFilter}
                setSelectedDateFilter={setSelectedDateFilter}
                selectedPaymentStatusFilter={selectedPaymentStatusFilter}
                setSelectedPaymentStatusFilter={setSelectedPaymentStatusFilter}
                registryGroupFilter={registryGroupFilter}
                setRegistryGroupFilter={setRegistryGroupFilter}
                uniqueLocations={uniqueLocations}
                onSelectMember={setSelectedMemberProfile}
                onClearFilters={handleClearFilters}
                onQuickCreateMember={() => {
                  setQuickCreateModalTab("member");
                  setIsQuickCreateModalOpen(true);
                }}
                onExportCSV={handleExportCSV}
                onImportCSV={handleImportCSV}
                getProfileLabel={getProfileLabel}
                getProfileBadgeTheme={getProfileBadgeTheme}
                getStatusBadgeColor={getStatusBadgeColor}
                forceSegment="rma"
              />
            )}

            {/* Tab: Live Visitors monitoring tool */}
            {activeTab === "visitors-live" && (
              <AdminVisitorMonitoring
                key="visitors-live"
                visitorCheckins={visitorCheckins}
              />
            )}

            {/* Tab: Web Analytics interactive data tables */}
            {activeTab === "visitors-analytics" && (
              <AdminAnalytics 
                key="visitors-analytics"
                registrations={registrations} 
                visitorCheckins={visitorCheckins}
                activeProfileFilter={selectedProfileFilter}
                activeLocationFilter={selectedLocationFilter}
                onSelectFilter={(type, val) => {
                  if (type === "profile") {
                    setSelectedProfileFilter(val);
                    // Route to correct registry segment
                    if (val === "cii") {
                      setActiveTab("reg-cii");
                    } else {
                      setActiveTab("reg-rma");
                    }
                  } else {
                    setSelectedLocationFilter(val);
                    setActiveTab("reg-rma");
                  }
                }}
              />
            )}

            {/* Tab: Platform User List and Action Provisioning */}
            {activeTab === "user-management" && (
              <AdminUserManagement
                key="user-management"
                hasWriteAccess={hasWriteAccess}
                isSuperAdmin={isSuperAdmin}
                currentAdminEmail={currentEmail}
                onLogAction={(msg) => {
                  addTerminalLog(msg);
                  refreshAdminOperatorsDirectory();
                  saveAuditLog({
                    adminEmail: currentEmail,
                    action: "Platform User Record Shifted",
                    details: msg
                  }).catch(console.error);
                }}
              />
            )}

            {/* Tab: Super Admin Access Roles & Operator Provisioning */}
            {activeTab === "security" && isSuperAdmin && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                            Super Admin Sovereign Control Center
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            System Owner Only
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          Create sub-administrators, set their login credentials, and choose the exact modules &amp; permissions they can access.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-2">
                    {/* Left Column (7 cols): Create / Edit Limited Admin & Module Matrix */}
                    <div className="xl:col-span-7 space-y-6">
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <h4 className="text-xs font-black uppercase text-[#103D2E] tracking-wider">
                              {editingOperatorEmail
                                ? `✏️ Editing Admin Permissions: ${editingOperatorEmail}`
                                : "➕ Create New Limited Admin Account"}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {editingOperatorEmail
                                ? "Update the modules, write capability, or reset the password for this Admin."
                                : "Provision a new Admin user with restricted access to only the sections you select below."}
                            </p>
                          </div>
                          {editingOperatorEmail && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOperatorEmail(null);
                                setNewAdminName("");
                                setNewAdminEmail("");
                                setNewAdminPassword("");
                                setNewAdminCanWrite(true);
                                setNewAdminAllowedTabs([...DEFAULT_LIMITED_ADMIN_TABS]);
                                setAdminRegisterError("");
                              }}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleRegisterAdminSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1">
                                Full Name / Title
                              </label>
                              <input
                                type="text"
                                value={newAdminName}
                                onChange={(e) => setNewAdminName(e.target.value)}
                                placeholder="e.g. Grace Okafor (Events Lead)"
                                className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1">
                                Admin Login Email *
                              </label>
                              <input
                                type="email"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                placeholder="admin.member@rightminds.org"
                                required
                                disabled={!!editingOperatorEmail}
                                className="w-full px-3 py-2 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-white font-mono disabled:bg-slate-100 disabled:text-slate-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1">
                                {editingOperatorEmail ? "New Password (optional)" : "Login Password *"}
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewAdminPassword ? "text" : "password"}
                                  value={newAdminPassword}
                                  onChange={(e) => setNewAdminPassword(e.target.value)}
                                  placeholder={editingOperatorEmail ? "Leave blank to keep existing" : "Set password (min 6 chars)"}
                                  required={!editingOperatorEmail}
                                  className="w-full px-3 py-2 pr-14 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-white font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewAdminPassword((v) => !v)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                                >
                                  {showNewAdminPassword ? "HIDE" : "SHOW"}
                                </button>
                              </div>
                              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                                📧 Login details (Portal URL, Email &amp; Password) will be emailed automatically to this admin.
                              </p>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1">
                                Action Authority Level
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setNewAdminCanWrite(true)}
                                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                                    newAdminCanWrite
                                      ? "bg-[#103D2E] text-amber-300 border-[#103D2E]"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  ✏️ Read &amp; Write
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewAdminCanWrite(false)}
                                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                                    !newAdminCanWrite
                                      ? "bg-amber-600 text-white border-amber-600"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  👁️ View Only
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 1-Click Role Presets */}
                          <div className="pt-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                                Quick Access Templates (1-Click Presets)
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setNewAdminAllowedTabs(
                                      ALL_ADMIN_MODULES.filter((m) => !m.superAdminOnly).map((m) => m.id)
                                    )
                                  }
                                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                  Select All Standard
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => setNewAdminAllowedTabs(["dashboard"])}
                                  className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                                >
                                  Minimal (Overview Only)
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {ADMIN_ACCESS_PRESETS.map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    setNewAdminAllowedTabs([...preset.tabs]);
                                    setNewAdminCanWrite(preset.canWrite);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold text-slate-700 transition cursor-pointer"
                                  title={preset.description}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Granular Module Access Checkboxes */}
                          <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                                Allowed Sidebar Modules ({newAdminAllowedTabs.length} selected)
                              </label>
                              <span className="text-[10px] font-mono text-amber-700 font-semibold">
                                Super Admin modules are locked automatically
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                              {ADMIN_MODULE_GROUPS.map((group, groupIdx) => {
                                const assignableItems = group.items.filter((i) => !i.superAdminOnly);
                                if (assignableItems.length === 0) return null;
                                return (
                                  <div
                                    key={group.title || `group-${groupIdx}`}
                                    className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2"
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-[#103D2E]">
                                        {group.title}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {assignableItems.map((mod, modIdx) => {
                                        const checked = newAdminAllowedTabs.includes(mod.id);
                                        return (
                                          <label
                                            key={mod.id || `mod-${modIdx}`}
                                            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition ${
                                              checked
                                                ? "bg-emerald-50/70 text-[#103D2E] font-bold"
                                                : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() => {
                                                setNewAdminAllowedTabs((prev) =>
                                                  prev.includes(mod.id)
                                                    ? prev.filter((id) => id !== mod.id)
                                                    : [...prev, mod.id]
                                                );
                                              }}
                                              className="rounded border-slate-300 text-[#103D2E] focus:ring-[#103D2E]"
                                            />
                                            <span className="truncate text-[11px]">{mod.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {adminRegisterError && (
                            <p className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
                              ⚠️ {adminRegisterError}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={isRegisteringAdmin}
                            className="w-full py-3 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                          >
                            {isRegisteringAdmin
                              ? "Saving Administrator Access..."
                              : editingOperatorEmail
                              ? `Save Updated Access for ${editingOperatorEmail}`
                              : `Create Limited Admin (${newAdminAllowedTabs.length} Modules Granted)`}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right Column (5 cols): Active Admin Directory + Sovereign Anchors + Entrance Audit */}
                    <div className="xl:col-span-5 space-y-5">
                      {/* Created Limited Admins Directory */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                              👥 Delegated Admins ({adminOperatorsList.filter((o) => !ANCHOR_SUPER_ADMIN_EMAILS.includes(o.email.toLowerCase())).length})
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              Click any Admin to customize what tabs they see or revoke access.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {adminOperatorsList.filter((o) => !ANCHOR_SUPER_ADMIN_EMAILS.includes(o.email.toLowerCase())).length === 0 ? (
                            <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                              <p className="text-xs font-bold text-slate-600">No delegated Admins created yet</p>
                              <p className="text-[11px] text-slate-400">
                                Use the form on the left to create an Admin account and assign their allowed modules.
                              </p>
                            </div>
                          ) : (
                            adminOperatorsList
                              .filter((o) => !ANCHOR_SUPER_ADMIN_EMAILS.includes(o.email.toLowerCase()))
                              .map((op) => {
                                const tabCount = op.allowedTabs?.length || DEFAULT_LIMITED_ADMIN_TABS.length;
                                const isSuspended = op.status === "Suspended";
                                return (
                                  <div
                                    key={op.email}
                                    className={`p-3.5 bg-white rounded-xl border transition space-y-2 ${
                                      editingOperatorEmail === op.email
                                        ? "border-[#103D2E] ring-2 ring-[#103D2E]/15"
                                        : "border-slate-200/80"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-900 truncate">
                                          {op.fullName || op.email.split("@")[0]}
                                        </p>
                                        <p className="text-[11px] font-mono text-[#103D2E] font-bold break-all">
                                          {op.email}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                            isSuspended
                                              ? "bg-red-100 text-red-700"
                                              : op.canWrite !== false
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-amber-100 text-amber-800"
                                          }`}
                                        >
                                          {isSuspended
                                            ? "Suspended"
                                            : op.canWrite !== false
                                            ? "Read & Write"
                                            : "View Only"}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-700">
                                          {tabCount} Modules
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingOperatorEmail(op.email);
                                          setNewAdminName(op.fullName || "");
                                          setNewAdminEmail(op.email);
                                          setNewAdminPassword("");
                                          setNewAdminCanWrite(op.canWrite !== false);
                                          setNewAdminAllowedTabs(
                                            ((op.allowedTabs && op.allowedTabs.length > 0
                                              ? op.allowedTabs
                                              : DEFAULT_LIMITED_ADMIN_TABS) as AdminTabType[])
                                          );
                                          setAdminRegisterError("");
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#103D2E] text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                                      >
                                        ⚙️ Configure Access
                                      </button>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            const nextStatus = isSuspended ? "Active" : "Suspended";
                                            await saveAdminOperator({
                                              email: op.email,
                                              fullName: op.fullName,
                                              role: "Admin",
                                              allowedTabs: op.allowedTabs || DEFAULT_LIMITED_ADMIN_TABS,
                                              canWrite: op.canWrite !== false,
                                              status: nextStatus,
                                              createdBy: currentEmail
                                            });
                                            await refreshAdminOperatorsDirectory();
                                            showFeedback(
                                              `${op.email} is now ${nextStatus}.`,
                                              nextStatus === "Active" ? "success" : "error"
                                            );
                                          }}
                                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                        >
                                          {isSuspended ? "Activate" : "Suspend"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await deleteAdminOperator(op.email);
                                            if (editingOperatorEmail === op.email) {
                                              setEditingOperatorEmail(null);
                                              setNewAdminEmail("");
                                            }
                                            await refreshAdminOperatorsDirectory();
                                            showFeedback(`Removed admin access for ${op.email}`, "success");
                                          }}
                                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold cursor-pointer"
                                        >
                                          Revoke
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>

                      {/* Sovereign Super Admin Owner */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide mb-1.5">
                          👑 Sovereign System Owner (Super Admin)
                        </h4>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed mb-3">
                          Sole protected System Owner identity with permanent unrestricted access to all modules and full authority to edit all other Admins.
                        </p>
                        <div className="space-y-2 font-mono text-slate-800">
                          {[
                            { email: "olosundelouis@gmail.com", role: "System Owner / Sole Super Admin 👑" }
                          ].map((ad) => (
                            <div
                              key={ad.email}
                              className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-[11px]"
                            >
                              <span className="font-extrabold break-all text-[#103D2E]">{ad.email}</span>
                              <span className="shrink-0 bg-amber-100 text-amber-900 rounded border border-amber-200 py-0.5 px-2 text-[9px] font-black">
                                {ad.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Entrance Audit Trail */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 border-dashed">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                            📋 Entrance Audit Trail
                          </h4>
                          {isSuperAdmin && accessLogs.length > 0 && (
                            <button
                              onClick={handleClearAccessLogs}
                              className="text-[9px] uppercase font-bold text-red-600 hover:underline cursor-pointer bg-transparent border-none"
                            >
                              Clear History
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {accessLogs.length === 0 ? (
                            <p className="text-slate-400 py-6 text-center font-mono text-xs">
                              No recent access sessions logged.
                            </p>
                          ) : (
                            accessLogs.map((lg, index) => (
                              <div
                                key={index}
                                className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center font-mono text-[10px]"
                              >
                                <div>
                                  <p className="font-extrabold text-[#103D2E] break-all leading-tight">{lg.email}</p>
                                  <p className="text-slate-400 text-[9px] leading-tight mt-0.5">
                                    Role: {lg.role || "Admin"}
                                  </p>
                                </div>
                                <span className="text-slate-400 text-[9px] shrink-0 font-bold">
                                  {new Date(lg.timestamp).toLocaleTimeString("en-NG", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false
                                  })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Activity Logs */}
            {activeTab === "activity" && (
              <motion.div
                key="activity shadow-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                        📋
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">Primary Operations Audit Logs</h3>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-404 block mt-0.5">Continuous ledger tracing all administrative actions</span>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          clearAuditLogs().then(() => setAuditLogs([]));
                          addTerminalLog("📋 [AUDIT] Operations log trail cleared by Super Admin.");
                          showFeedback("Audit logs cleared successfully!", "success");
                        }}
                        className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 font-black uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer border border-red-200"
                      >
                        Clear Operational History
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-2xs text-xs font-mono text-slate-700">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black uppercase text-slate-400 tracking-widest font-mono">
                            <th className="py-4 px-6">Administrative Identity</th>
                            <th className="py-4 px-6">Context Action</th>
                            <th className="py-4 px-6">Specific Details</th>
                            <th className="py-4 px-6 text-right">Timestamp Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {isLoadingLogs ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400">Querying logs trail schema from Cloud Store...</td>
                            </tr>
                          ) : auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-404">No transaction logs recorded inside this cache.</td>
                            </tr>
                          ) : (
                            auditLogs.map((lg, idx) => (
                              <tr key={lg.id || `${lg.timestamp}-${idx}`} className="hover:bg-slate-20/20 transition-all">
                                <td className="py-3 px-6 text-[#103D2E] font-extrabold">{lg.adminEmail}</td>
                                <td className="py-3 px-6 font-bold">{lg.action}</td>
                                <td className="py-3 px-6 text-slate-500 font-sans max-w-[280px] truncate" title={lg.details}>{lg.details}</td>
                                <td className="py-3 px-6 text-right text-slate-420 font-bold text-[10px]">
                                  {new Date(lg.timestamp).toLocaleString("en-NG", { hour12: false })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Payments Bureau */}
            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminPayments 
                  registrations={registrations} 
                  hasWriteAccess={hasWriteAccess} 
                  onRefresh={fetchData} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Events Manager */}
            {activeTab === "events" && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminEvents 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Resources Vault */}
            {activeTab === "resources" && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminResources 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Photo Gallery Catalogue */}
            {activeTab === "gallery" && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminGallery 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Website Popups Manager */}
            {activeTab === "website-popups" && (
              <motion.div
                key="website-popups"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminWebsitePopups
                  hasWriteAccess={hasContentWriteAccess}
                  onLogAction={addTerminalLog}
                />
              </motion.div>
            )}

            {/* Tab: Alert Notifications */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminNotifications 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Settings & Scrolling announcement editor */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Embedded subtabs for Backup vs Email Configurations */}
                <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-wrap gap-2">
                  <span className="text-xs font-mono font-black uppercase text-slate-400 self-center mr-4 select-none">
                    Settings Hub:
                  </span>
                  <button
                    onClick={() => {
                      setSettingsSubTab("backup");
                      setMarqueeEnabled(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      settingsSubTab === "backup" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Recovery & Backups Engine
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSubTab("email-settings");
                    }}
                    className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      settingsSubTab === "email-settings" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Email Configuration
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSubTab("email-logs");
                    }}
                    className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      settingsSubTab === "email-logs" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    System Outbound Mail Logs
                  </button>
                </div>
                
                {settingsSubTab === "backup" && (
                  <AdminBackup 
                    isSuperAdmin={currentEmail === "olosundelouis@gmail.com" || userRole === "Super Admin"} 
                    onLogAction={addTerminalLog} 
                  />
                )}

                {settingsSubTab === "email-settings" && (
                  <AdminEmailSettings
                    hasWriteAccess={hasWriteAccess}
                    onLogAction={addTerminalLog}
                  />
                )}

                {settingsSubTab === "email-logs" && (
                  <AdminEmailLogs
                    onLogAction={addTerminalLog}
                  />
                )}
              </motion.div>
            )}

            {/* Tab: System Product Requirements Document (PRD) */}
            {activeTab === "prd-doc" && (
              <motion.div
                key="prd-doc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Visual Header Feature card */}
                <div className="bg-[#0A1A14] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#133F31] via-[#0A1A14] to-[#040C0A] text-white p-6 sm:p-8 rounded-[2rem] border border-[#152e25] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-emerald-990/5">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-700/10 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="space-y-2 text-left relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/20 text-[10px] font-black tracking-widest uppercase">
                      <Layers size={10} className="text-amber-400" />
                      PRODUCT DESIGN STANDARDS
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-slate-100 uppercase">
                      System Product Specifications (PRD)
                    </h2>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      This formal Product Requirements Document (PRD) establishes the technical parameters, structural boundaries, access matrices, and operational workflows governing both public frontend screens and locked administration consoles of this system.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 relative z-10 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => {
                        try {
                          const blob = new Blob([SYSTEM_PRD_DOCUMENT], { type: "text/markdown;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", "RMA_CII_Product_Requirements_Document.md");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          addTerminalLog("📟 [PRD] Saved current system PRD document successfully to offline storage.");
                          showFeedback("PRD file downloaded successfully!", "success");
                          saveAuditLog({
                            adminEmail: currentEmail,
                            action: "Downloaded Platform PRD",
                            details: `Successfully compiled and downloaded RMA_CII_Product_Requirements_Document.md to physical storage.`
                          }).catch(console.error);
                        } catch (err) {
                          console.error("PRD Export Error:", err);
                          showFeedback("Failed to compile PRD to storage.", "error");
                        }
                      }}
                      className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-400/15 animate-pulse"
                    >
                      <Download size={12} className="stroke-[2.5]" />
                      Download Doc (.md)
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(SYSTEM_PRD_DOCUMENT);
                        showFeedback("Specs copied to system clipboard!", "success");
                        addTerminalLog("📋 [PRD] Copy of text specification saved directly to operator clipboard buffer.");
                      }}
                      className="px-4 py-3 bg-white/10 hover:bg-white/15 text-slate-150 font-extrabold rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-1.5"
                    >
                      Copy Raw Text
                    </button>
                  </div>
                </div>

                {/* Grid view of critical categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Specs Summary panel */}
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-light pb-2 flex items-center gap-1.5">
                        <BookmarkCheck size={14} className="text-emerald-600" />
                        PRD QUICK GLANCE
                      </h4>
                      
                      <div className="space-y-3.5 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="font-extrabold text-slate-800 uppercase text-[10px]">Target Modules</p>
                          <p className="text-slate-500 font-medium mt-1 leading-normal">
                            Covers both the public RMA/CII portal and the secure administrative control desk.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="font-extrabold text-[#103D2E] uppercase text-[10px]">Gallery & Memoir Module</p>
                          <p className="text-slate-500 font-medium mt-1 leading-normal">
                            Integrates High-Res Google Photos, dynamic UI search indexing, and a direct client-side Drag-and-Drop image upload system.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="font-extrabold text-rose-600 uppercase text-[10px]">Security Lockouts</p>
                          <p className="text-slate-500 font-medium mt-1 leading-normal">
                            Specifies 5 maximum consecutive authentication attempt threshold. Overages force a 900-second session lockout.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="font-extrabold text-indigo-600 uppercase text-[10px]">Access Auditing</p>
                          <p className="text-slate-500 font-medium mt-1 leading-normal">
                            Requires fully non-volatile auditing of all updates, status verification edits, logs clearing, and settings modifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F3]/60 p-5 rounded-2xl border border-[#FAF8F3] shadow-xs space-y-2 text-xs">
                      <h5 className="font-extrabold text-amber-800 uppercase tracking-tight text-[11px]">Download specifications</h5>
                      <p className="text-slate-500 font-medium leading-relaxed">
                        Need to share or keep a physical record of these technical requirements? Download the formal specifications as a structured Markdown file (\`.md\`) to attach directly to development sprints or GitHub wikis.
                      </p>
                      <button
                        onClick={() => {
                          const blob = new Blob([SYSTEM_PRD_DOCUMENT], { type: "text/markdown;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", "RMA_CII_Product_Requirements_Document.md");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          addTerminalLog("📟 [PRD] PRD file downloaded directly.");
                          showFeedback("PRD file downloaded!", "success");
                        }}
                        className="mt-2 w-full py-2 bg-[#103D2E] text-[#FCFBF8] text-[9.5px] font-black uppercase tracking-widest rounded-lg cursor-pointer text-center block hover:bg-[#071b14] transition-all"
                      >
                        Download Specifications Document
                      </button>
                    </div>
                  </div>

                  {/* Right specs document contents (Prose) */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-150 shadow-xs text-left">
                      <div className="flex items-center justify-between border-b border-light pb-3 mb-5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 px-2.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px] font-bold">
                            MARKDOWN RENDER
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          RMA-CII-PRD-2026-V1.0
                        </span>
                      </div>

                      {/* Display rendered content formatted with beautiful custom spacing */}
                      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6 text-slate-755 text-xs leading-relaxed font-sans scrollbar-thin text-left">
                        <h1 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-tight">
                          SYSTEM PRODUCT REQUIREMENTS DOCUMENT (PRD)
                        </h1>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-left">
                          <p className="grid grid-cols-2 gap-2 text-2xs font-mono font-extrabold text-slate-500 uppercase">
                            <span>Document Code:</span> <span className="text-slate-800 text-right">RMA-CII-PRD-2026-V1.0</span>
                            <span>Release Version:</span> <span className="text-slate-800 text-right">1.0.0</span>
                            <span>Status:</span> <span className="text-emerald-700 text-right flex justify-end">Approved / Live</span>
                            <span>Target Modules:</span> <span className="text-slate-800 text-right">Frontend and Admin panel</span>
                          </p>
                        </div>

                        <div className="space-y-3 text-left">
                          <h2 className="text-sm font-extrabold text-slate-900 border-l-4 border-emerald-600 pl-2">
                            1. Executive Summary & Vision
                          </h2>
                          <p>
                            The RMA & CII digital ecosystem serves as an integrated full-stack solution designed to catalyze leadership development, social orientation, and economic empowerment among youth in Africa. By combining the social impact outreach programs of <strong>Right Minds Africa</strong> with the specialized professional-transition resources of <strong>Corper Impact Initiative</strong>, the platform acts as an administrative operations centre and a public engagement portal.
                          </p>
                          <p>
                            <strong>Core Product Vision:</strong> To host a frictionless gateway that transforms Nigerian Youth Service Corps (NYSC) members, undergraduates, and teenagers into impact-driven leaders through vetted coursework, community orientations, physical hangouts, mentorship networks, and a transparent operations desk.
                          </p>
                        </div>

                        <div className="space-y-3 text-left">
                          <h2 className="text-sm font-extrabold text-slate-900 border-l-4 border-emerald-600 pl-2">
                            2. Technology Stack & Caches
                          </h2>
                          <p>
                            The platform is designed to guarantee high offline availability, robust security controls, and rich responsive aesthetics:
                          </p>
                          <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600 text-left">
                            <li><strong>Frontend Core:</strong> React 18 (Hooks-first functional syntax) featuring fluid animations and transitions in under 150 milliseconds.</li>
                            <li><strong>Design Rules:</strong> Tailwind CSS modern guidelines using Inter, Outfit, and JetBrains Mono display fonts.</li>
                            <li><strong>Database Framework:</strong> Firestore database schemas backed by robust local storage cache configurations (<code className="font-mono bg-slate-100 px-1 text-slate-800 rounded">localStorage</code>) and synchronous offline transaction queues.</li>
                            <li><strong>Visual Analytics:</strong> Recharts-driven graphs projecting visitor counts and candidates geo-distributions.</li>
                          </ul>
                        </div>

                        <div className="space-y-3 text-left">
                          <h2 className="text-sm font-extrabold text-slate-900 border-l-4 border-emerald-600 pl-2">
                            3. Frontend Public Specifications & Photos Memoir Gallery
                          </h2>
                          <p>
                            <strong>Core Features:</strong>
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-600 text-left">
                            <li><strong>Universal Announcement Ticker:</strong> Top horizontal marquee messages broadcasted in real-time.</li>
                            <li><strong>CII Portal Experience:</strong> Features a fully reactive multi-tier calculator, dynamic FAQ expanders, and NYSC orientation cohort registration grids.</li>
                            <li><strong>Memoir Photo Gallery Section [NEW]:</strong> Allows visitors to browse hangouts and ceremonies. Features categories tab-filtering (YAP Conferences, Teens, CII), standard HD overlays with lightbox captions, direct redirects to official Google Photos albums (100+ images), and a browser-based file-to-base64 upload system to stream new images on sandbox cards.</li>
                          </ul>
                        </div>

                        <div className="space-y-3 text-left">
                          <h2 className="text-sm font-extrabold text-slate-900 border-l-4 border-emerald-600 pl-2">
                            4. Isolated Operations Admin Console Specs
                          </h2>
                          <p>
                            <strong>High-Priority Guidelines:</strong>
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-600 text-left">
                            <li><strong>Brute-Force Rate Limiting Lock:</strong> Secures databases by tracking consecutive failed logins. Exceeding 5 unsuccessful entries automatically engages locks, blocking credential evaluations for 15 minutes.</li>
                            <li><strong>Web Telemetry Stream:</strong> Displays live browser client movements and guestbook signatures.</li>
                            <li><strong>Security Log Audits:</strong> Maintains completely non-volatile audit timelines of payment verifications, log clearings, and core settings modifications.</li>
                            <li><strong>Export Utilities:</strong> Prominent bulk conversions turning datagrids to CSV spreadsheets instantly.</li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-mono font-medium">
                          *** End of Product Specification Sheet ***
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* Tab: Teen Leadership Bootcamp 2026 CMS & Desk */}
            {activeTab === "teen-bootcamp" && (
              <motion.div
                key="teen-bootcamp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminTeenBootcamp />
              </motion.div>
            )}

            {/* Tab: LMS Course Management */}
            {(activeTab === "lms-courses" || activeTab === "lms-modules") && (
              <motion.div
                key="lms-courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminCourses 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                />
              </motion.div>
            )}

            {/* Tab: LMS Students */}
            {activeTab === "lms-students" && (
              <motion.div
                key="lms-students"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLmsStudents 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                />
              </motion.div>
            )}

            {/* Tab: LMS Course Payments Verification */}
            {activeTab === "lms-payments" && (
              <motion.div
                key="lms-payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLmsCoursePayments 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                  adminUserEmail={currentEmail}
                />
              </motion.div>
            )}

            {/* Tab: LMS Enrollments */}
            {activeTab === "lms-enrollments" && (
              <motion.div
                key="lms-enrollments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLmsEnrollments 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                  adminUserEmail={currentEmail}
                />
              </motion.div>
            )}

            {/* Tab: LMS Certificates */}
            {activeTab === "lms-certificates" && (
              <motion.div
                key="lms-certificates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLmsCertificates 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                />
              </motion.div>
            )}

            {/* Tab: LMS Analytics */}
            {activeTab === "lms-analytics" && (
              <motion.div
                key="lms-analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLmsAnalytics 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                />
              </motion.div>
            )}

            {/* Tab: LMS Payment Settings */}
            {activeTab === "lms-payment-settings" && (
              <motion.div
                key="lms-payment-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLmsPaymentSettings 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                  adminUserEmail={currentEmail}
                />
              </motion.div>
            )}

            {/* Tab: LMS Financials Dashboard */}
            {activeTab === "lms-revenue" && (
              <motion.div
                key="lms-revenue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminRevenueDashboard 
                  onNotify={(msg, type) => showFeedback(msg, type)} 
                />
              </motion.div>
            )}

            {/* Tab: Social Integration Hub */}
            {activeTab === "social-hub" && (
              <motion.div
                key="social-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminSocialHub 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Inbound Contact Messages */}
            {activeTab === "messages" && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminMessages 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Testimonials Desk */}
            {activeTab === "testimonials" && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminTestimonials 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Sponsors Directory */}
            {activeTab === "partners" && (
              <motion.div
                key="partners"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminPartners 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Google Forms Workspace Integrator */}
            {activeTab === "google-forms" && (
              <motion.div
                key="google-forms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminGoogleForms 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Live Chat Workspace */}
            {activeTab === "live-chat" && (
              <motion.div
                key="live-chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminLiveChat 
                  hasWriteAccess={hasContentWriteAccess} 
                  onLogAction={addTerminalLog} 
                />
              </motion.div>
            )}

            {/* Tab: Brand Cloner & Standalone Setup Hub */}
            {activeTab === "brand-cloner" && (
              <motion.div
                key="brand-cloner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <AdminBrandCloner 
                  isSuperAdmin={isSuperAdmin}
                  onLogAction={addTerminalLog}
                  onNotify={(msg, type) => showFeedback(msg, type === "error" ? "error" : "success")}
                />
              </motion.div>
            )}

          </AnimatePresence>

          {/* Floating diagnostic visual logs terminal at bottom */}
          {showTerminalConsole && (
            <AdminTerminal onAddLog={addTerminalLog} />
          )}

          {/* Single custom Drawer for detail candidate editing  */}
          <AdminCandidateDrawer 
            registration={selectedMemberProfile}
            onClose={() => setSelectedMemberProfile(null)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCandidate={handleDeleteCandidate}
            userRole={userRole}
          />

        </main>

        {/* Subtle, minimal footer with ONLY the brand text and logo */}
        <footer className="py-6 flex flex-col sm:flex-row justify-center items-center gap-2 border-t border-slate-100 bg-white">
          <img 
            src={brand.logoUrl || brandLogo} 
            alt="Brand Logo" 
            className="h-6 w-auto object-contain opacity-60 hover:opacity-100 transition-all" 
            referrerPolicy="no-referrer"
          />
          <span className="text-[10px] font-black text-slate-400 tracking-wider">
            {brand.brandName.toUpperCase()} {brand.portalTitle}
          </span>
        </footer>
      </div>

      {/* 3. Global Operations QuickCreate Trigger Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        initialTab={quickCreateModalTab}
        onSaveMember={handleQuickCreateMember}
        onSaveCheckIn={handleQuickCreateCheckIn}
        onSaveAnnouncement={handleQuickCreateAnnouncement}
        uniqueLocations={uniqueLocations}
      />

      {/* Change Password Dialog Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <button
              type="button"
              onClick={() => {
                setIsChangePasswordModalOpen(false);
                setChangePasswordError("");
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-emerald-50 text-[#103D2E] rounded-2xl">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wide font-mono">Change Account Password</h3>
                <p className="text-xs text-slate-500 font-medium">Update credentials for {currentEmail}</p>
              </div>
            </div>

            {changePasswordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                ⚠️ {changePasswordError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono font-black text-slate-500 mb-1">
                  Current Password (Optional if newly logged in)
                </label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#103D2E] focus:ring-1 focus:ring-[#103D2E]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono font-black text-slate-500 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#103D2E] focus:ring-1 focus:ring-[#103D2E]"
                />
                <p className="mt-1 text-[9px] text-slate-400">
                  Must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono font-black text-slate-500 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#103D2E] focus:ring-1 focus:ring-[#103D2E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    setChangePasswordError("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2 text-xs font-black uppercase tracking-wider text-amber-300 bg-[#103D2E] hover:bg-[#09251c] rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <span>Updating...</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
