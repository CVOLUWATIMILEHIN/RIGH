import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  ShieldAlert, 
  History, 
  Settings, 
  LogOut,
  X,
  Compass,
  Award,
  FileText,
  CreditCard,
  Calendar,
  BookOpen,
  Image,
  Bell,
  Share2,
  Mail,
  MessageSquare,
  Briefcase,
  ClipboardList,
  Sparkles,
  Layers
} from "lucide-react";
import { useBrandConfig } from "../lib/brandConfig";

export type AdminTabType = 
  | "dashboard" 
  | "reg-cii" 
  | "reg-rma" 
  | "teen-bootcamp"
  | "payments" 
  | "events" 
  | "resources" 
  | "gallery" 
  | "website-popups"
  | "visitors-live" 
  | "notifications" 
  | "visitors-analytics" 
  | "activity" 
  | "user-management" 
  | "security" 
  | "settings" 
  | "prd-doc"
  | "brand-cloner"
  | "lms-courses"
  | "lms-modules"
  | "lms-students"
  | "lms-payments"
  | "lms-enrollments"
  | "lms-certificates"
  | "lms-analytics"
  | "lms-payment-settings"
  | "lms-revenue"
  | "social-hub"
  | "messages"
  | "testimonials"
  | "partners"
  | "google-forms"
  | "live-chat";

export interface AdminModuleItem {
  id: AdminTabType;
  label: string;
  category: string;
  superAdminOnly?: boolean;
}

export const SUPER_ADMIN_ONLY_TABS: AdminTabType[] = [
  "security",
  "brand-cloner"
];

export const DEFAULT_LIMITED_ADMIN_TABS: AdminTabType[] = [
  "dashboard",
  "reg-cii",
  "reg-rma",
  "teen-bootcamp",
  "events",
  "resources",
  "gallery",
  "messages",
  "visitors-live"
];

export const ADMIN_ACCESS_PRESETS: {
  id: string;
  label: string;
  description: string;
  tabs: AdminTabType[];
  canWrite: boolean;
}[] = [
  {
    id: "registrations-events",
    label: "Registrations & Events Admin",
    description: "Manage CII, RMA, Teen Bootcamp registrations, Events, and Google Forms",
    tabs: ["dashboard", "reg-cii", "reg-rma", "teen-bootcamp", "events", "google-forms", "visitors-live"],
    canWrite: true
  },
  {
    id: "content-media",
    label: "Content & Media Manager",
    description: "Manage Events, Resources, Photo Gallery, Website Popups, Social Hub, Testimonials & Sponsors",
    tabs: ["dashboard", "events", "resources", "gallery", "website-popups", "social-hub", "testimonials", "partners"],
    canWrite: true
  },
  {
    id: "lms-academy",
    label: "LMS Academy Coordinator",
    description: "Manage Courses, Modules, Students, Enrollments, Certificates & LMS Analytics",
    tabs: ["dashboard", "lms-courses", "lms-modules", "lms-students", "lms-enrollments", "lms-certificates", "lms-analytics"],
    canWrite: true
  },
  {
    id: "finance-payments",
    label: "Finance & Payments Officer",
    description: "Verify program payments, LMS course payments, and payment settings",
    tabs: ["dashboard", "payments", "lms-payments", "lms-payment-settings", "lms-analytics"],
    canWrite: true
  },
  {
    id: "support-comms",
    label: "Communications & Support Desk",
    description: "Handle Inbound Mailbox, Live Chat Workspace, Alert Notifications & Live Guestbook",
    tabs: ["dashboard", "messages", "live-chat", "notifications", "visitors-live"],
    canWrite: true
  },
  {
    id: "read-only-auditor",
    label: "Read-Only Auditor",
    description: "View-only access to dashboards, registries, and analytics without edit capabilities",
    tabs: ["dashboard", "reg-cii", "reg-rma", "teen-bootcamp", "visitors-live", "visitors-analytics", "lms-analytics"],
    canWrite: false
  }
];

export const ADMIN_MODULE_GROUPS: {
  title: string;
  items: {
    id: AdminTabType;
    label: string;
    icon: any;
    roles: string[];
    superAdminOnly?: boolean;
  }[];
}[] = [
  {
    title: "Dashboard",
    items: [
      {
        id: "dashboard" as const,
        label: "Overview",
        icon: LayoutDashboard,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Mentor", "Editor"]
      }
    ]
  },
  {
    title: "Registrations",
    items: [
      {
        id: "reg-cii" as const,
        label: "Corper Impact (CII)",
        icon: Award,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Mentor", "Editor"]
      },
      {
        id: "reg-rma" as const,
        label: "Right-Minds (RMA)",
        icon: Users,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Mentor", "Editor"]
      },
      {
        id: "teen-bootcamp" as const,
        label: "Teen Bootcamp 2026",
        icon: Compass,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Mentor", "Editor"]
      },
      {
        id: "payments" as const,
        label: "Payments Bureau",
        icon: CreditCard,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      }
    ]
  },
  {
    title: "Content & Assets",
    items: [
      {
        id: "events" as const,
        label: "Events Manager",
        icon: Calendar,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Mentor", "Editor"]
      },
      {
        id: "resources" as const,
        label: "Resources Vault",
        icon: BookOpen,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "gallery" as const,
        label: "Photo Gallery",
        icon: Image,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "website-popups" as const,
        label: "Website Popups",
        icon: Sparkles,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "social-hub" as const,
        label: "Social Hub Sync",
        icon: Share2,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Mentor", "Editor"]
      },
      {
        id: "google-forms" as const,
        label: "Google Forms Integrator",
        icon: ClipboardList,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      }
    ]
  },
  {
    title: "Impact & Outreach",
    items: [
      {
        id: "messages" as const,
        label: "Inbound Mailbox",
        icon: Mail,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "testimonials" as const,
        label: "Testimonials Desk",
        icon: MessageSquare,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "partners" as const,
        label: "Sponsor Directory",
        icon: Briefcase,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      }
    ]
  },
  {
    title: "LMS Academy",
    items: [
      {
        id: "lms-courses" as const,
        label: "Courses",
        icon: BookOpen,
        roles: ["Super Admin", "Admin", "Standard Write", "Editor"]
      },
      {
        id: "lms-modules" as const,
        label: "Modules & Lessons",
        icon: ClipboardList,
        roles: ["Super Admin", "Admin", "Standard Write", "Editor"]
      },
      {
        id: "lms-students" as const,
        label: "Students",
        icon: Users,
        roles: ["Super Admin", "Admin", "Standard Write", "Editor"]
      },
      {
        id: "lms-payments" as const,
        label: "Course Payments",
        icon: CreditCard,
        roles: ["Super Admin", "Admin", "Standard Write", "Viewer (Read Only)", "Viewer", "Editor"]
      },
      {
        id: "lms-enrollments" as const,
        label: "Enrollments",
        icon: Award,
        roles: ["Super Admin", "Admin", "Standard Write", "Editor"]
      },
      {
        id: "lms-certificates" as const,
        label: "Certificates",
        icon: Sparkles,
        roles: ["Super Admin", "Admin", "Standard Write", "Editor"]
      },
      {
        id: "lms-analytics" as const,
        label: "Analytics",
        icon: Activity,
        roles: ["Super Admin", "Admin", "Standard Write", "Viewer (Read Only)", "Viewer", "Editor"]
      },
      {
        id: "lms-payment-settings" as const,
        label: "Payment Settings",
        icon: Settings,
        roles: ["Super Admin", "Admin"]
      }
    ]
  },
  {
    title: "Visitors & Alerts",
    items: [
      {
        id: "visitors-live" as const,
        label: "Live Guestbook",
        icon: Activity,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "notifications" as const,
        label: "Alert Notifications",
        icon: Bell,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "visitors-analytics" as const,
        label: "Web Analytics",
        icon: Compass,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      },
      {
        id: "live-chat" as const,
        label: "Live Chat Workspace",
        icon: MessageSquare,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      }
    ]
  },
  {
    title: "User Management",
    items: [
      {
        id: "user-management" as const,
        label: "Users List",
        icon: Users,
        roles: ["Super Admin", "Admin"]
      },
      {
        id: "security" as const,
        label: "Admins & Access Control",
        icon: ShieldAlert,
        roles: ["Super Admin"],
        superAdminOnly: true
      }
    ]
  },
  {
    title: "System Control",
    items: [
      {
        id: "brand-cloner" as const,
        label: "Brand & Cloner Hub",
        icon: Sparkles,
        roles: ["Super Admin"],
        superAdminOnly: true
      },
      {
        id: "activity" as const,
        label: "Activity Trails",
        icon: History,
        roles: ["Super Admin", "Admin"]
      },
      {
        id: "settings" as const,
        label: "System Settings",
        icon: Settings,
        roles: ["Super Admin", "Admin"]
      },
      {
        id: "prd-doc" as const,
        label: "Specs (PRD)",
        icon: FileText,
        roles: ["Viewer (Read Only)", "Standard Write", "Super Admin", "Admin", "Viewer", "Editor"]
      }
    ]
  }
];

export const ALL_ADMIN_MODULES: AdminModuleItem[] = ADMIN_MODULE_GROUPS.flatMap((grp) =>
  grp.items.map((item) => ({
    id: item.id,
    label: item.label,
    category: grp.title,
    superAdminOnly: item.superAdminOnly
  }))
);

interface AdminSidebarProps {
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  isSuperAdmin: boolean;
  hasWriteAccess: boolean;
  currentEmail: string;
  userRole: string;
  allowedTabs?: AdminTabType[];
  onSignOut: () => void;
  onGoBackToWebsite: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isSuperAdmin,
  hasWriteAccess,
  currentEmail,
  userRole,
  allowedTabs,
  onSignOut,
  onGoBackToWebsite,
  isOpen,
  onCloseMobile
}: AdminSidebarProps) {
  const { brand } = useBrandConfig();

  const effectiveAllowedTabs = isSuperAdmin
    ? null
    : (Array.isArray(allowedTabs) && allowedTabs.length > 0 ? allowedTabs : DEFAULT_LIMITED_ADMIN_TABS);

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#000]/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1A14] text-slate-105 flex flex-col border-r border-[#152e25] transition-transform duration-300 transform md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#143127] bg-[#07130F]">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="font-display font-black text-xs leading-none tracking-wider text-amber-400 uppercase truncate max-w-[170px]" title={brand.brandName}>
                {brand.brandName}
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-[#2ECC71] leading-none block mt-0.5 font-bold truncate max-w-[170px]">
                {brand.portalTitle}
              </span>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Access Scope Indicator Banner for Limited Admins */}
        {!isSuperAdmin && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Scoped Admin Access
            </span>
            <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200">
              {effectiveAllowedTabs?.length || 0} Modules
            </span>
          </div>
        )}

        {/* Sidebar Menu Items with Labeled Category Section Headers */}
        <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
          {ADMIN_MODULE_GROUPS.map((grp) => {
            const visibleItems = grp.items.filter((item) => {
              if (item.superAdminOnly && !isSuperAdmin) return false;
              if (isSuperAdmin) return true;
              if (effectiveAllowedTabs) {
                return effectiveAllowedTabs.includes(item.id);
              }
              return item.roles.includes(userRole);
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={grp.title} className="space-y-1">
                <span className="block px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none">
                  {grp.title}
                </span>

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isActive 
                            ? "bg-[#103D2E] text-amber-300 font-bold shadow-sm shadow-emerald-950/20" 
                            : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                        }`}
                      >
                        <IconComponent size={15} className={isActive ? "text-amber-400" : "text-slate-400 shrink-0"} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-[#143127] space-y-1">
            <button
              onClick={onGoBackToWebsite}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer border border-dashed border-amber-500/20"
            >
              <Compass size={15} className="text-amber-500 shrink-0" />
              <span>Public Website</span>
            </button>
          </div>
        </nav>

        {/* Bottom User Operations Profile Section */}
        <div className="p-4 border-t border-[#143127] bg-[#07130F]">
          <div className="flex items-center gap-3 mb-3 text-left">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 select-none ${isSuperAdmin ? "bg-amber-400 text-[#07130F]" : "bg-[#103D2E] text-slate-200"}`}>
              {currentEmail ? currentEmail.slice(0, 2).toUpperCase() : "OP"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-black uppercase text-slate-200 truncate leading-none">
                  {currentEmail === "olosundelouis@gmail.com" ? "System Owner (Super Admin)" : isSuperAdmin ? "Super Admin" : `${userRole} (Limited)`}
                </p>
              </div>
              <p className="text-[9.5px] font-mono text-slate-400 truncate mt-0.5 leading-tight">
                {currentEmail}
              </p>
              {!isSuperAdmin && (
                <span className="inline-block mt-1 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {hasWriteAccess ? "Read & Write" : "View Only"}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={onSignOut}
            className="w-full py-2.5 px-4 bg-[#E76F51]/10 hover:bg-[#E76F51] text-[#E76F51] hover:text-white transition-all text-2xs font-extrabold uppercase tracking-widest rounded-xl border border-[#E76F51]/15 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut size={12} />
            Lock Session
          </button>
        </div>

      </aside>
    </>
  );
}

