/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserMinus, 
  UserCheck, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert,
  X,
  UserPlus,
  CheckCircle,
  XCircle,
  Send,
  Download,
  Lock,
  Check,
  ShieldCheck
} from "lucide-react";
import {
  PlatformUser,
  getPlatformUsers,
  savePlatformUser,
  deletePlatformUser,
  saveAdminOperator,
  deleteAdminOperator,
  ANCHOR_SUPER_ADMIN_EMAILS,
  getFirebaseConfig
} from "../lib/db";
import {
  ADMIN_MODULE_GROUPS,
  ADMIN_ACCESS_PRESETS,
  DEFAULT_LIMITED_ADMIN_TABS,
  AdminTabType
} from "./AdminSidebar";

const DEFAULT_USERS: PlatformUser[] = [
  {
    id: "usr-5",
    fullName: "Louis Olosunde (System Owner)",
    email: "olosundelouis@gmail.com",
    phone: "+234 815 678 9012",
    role: "Admin",
    status: "Active",
    joinedAt: "2026-06-01T10:00:00.000Z",
    location: "Lagos State",
    emailVerified: true,
    canWrite: true
  },
  {
    id: "usr-1",
    fullName: "Adebayo Adesina",
    email: "a.adesina@gmail.com",
    phone: "+234 803 111 2222",
    role: "Admin",
    status: "Active",
    joinedAt: "2026-05-10T11:00:00.000Z",
    location: "Lagos State",
    allowedTabs: ["dashboard", "reg-cii", "reg-rma", "events", "visitors-live"],
    canWrite: true
  },
  {
    id: "usr-2",
    fullName: "Miriam Eke",
    email: "miriam.eke@yahoo.com",
    phone: "+234 812 444 5555",
    role: "Mentor",
    status: "Active",
    joinedAt: "2026-05-12T14:30:00.000Z",
    location: "Enugu State",
    allowedTabs: ["dashboard", "reg-cii", "reg-rma", "lms-courses", "lms-students"],
    canWrite: false
  },
  {
    id: "usr-3",
    fullName: "Tunde Bakare",
    email: "tundebakare@outlook.com",
    phone: "+234 905 888 9999",
    role: "Viewer",
    status: "Suspended",
    joinedAt: "2026-04-20T09:15:00.000Z",
    location: "Ogun State",
    allowedTabs: ["dashboard", "visitors-analytics"],
    canWrite: false
  },
  {
    id: "usr-4",
    fullName: "Fatima Yusuf",
    email: "fatima.y@gmail.com",
    phone: "+234 703 555 6666",
    role: "Mentor",
    status: "Active",
    joinedAt: "2026-05-15T16:20:00.000Z",
    location: "Kaduna State",
    allowedTabs: ["dashboard", "teen-bootcamp", "events"],
    canWrite: false
  }
];

interface AdminUserManagementProps {
  hasWriteAccess: boolean;
  isSuperAdmin?: boolean;
  currentAdminEmail?: string;
  onLogAction: (msg: string) => void;
}

export default function AdminUserManagement({
  hasWriteAccess,
  isSuperAdmin = false,
  currentAdminEmail = "",
  onLogAction
}: AdminUserManagementProps) {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [resendStatus, setResendStatus] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [formNotice, setFormNotice] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: (isSuperAdmin ? "Admin" : "Student") as PlatformUser["role"],
    location: "",
    status: "Active" as PlatformUser["status"],
    canWrite: true,
    allowedTabs: [...DEFAULT_LIMITED_ADMIN_TABS] as string[]
  });

  // Load from Live Firestore
  const loadUsers = async () => {
    try {
      const liveUsers = await getPlatformUsers();
      if (liveUsers && liveUsers.length > 0) {
        setUsers(liveUsers);
      } else {
        setUsers(DEFAULT_USERS);
        for (const u of DEFAULT_USERS) {
          await savePlatformUser(u);
        }
      }
    } catch (err) {
      console.warn("Failed to load users from Firestore, using default fallback:", err);
      setUsers(DEFAULT_USERS);
    }
  };

  useEffect(() => {
    loadUsers();
    window.addEventListener("rma_platform_users_updated", loadUsers);
    window.addEventListener("rma_admin_operators_updated", loadUsers);
    return () => {
      window.removeEventListener("rma_platform_users_updated", loadUsers);
      window.removeEventListener("rma_admin_operators_updated", loadUsers);
    };
  }, []);

  const isTargetSuperAdminEmail = (email: string) =>
    ANCHOR_SUPER_ADMIN_EMAILS.includes((email || "").trim().toLowerCase());

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormNotice(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "+234 ",
      password: "",
      role: isSuperAdmin ? "Admin" : "Student",
      location: "Lagos State",
      status: "Active",
      canWrite: isSuperAdmin ? true : false,
      allowedTabs: [...DEFAULT_LIMITED_ADMIN_TABS]
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: PlatformUser) => {
    if ((user.role === "Admin" || isTargetSuperAdminEmail(user.email)) && !isSuperAdmin) {
      setFormNotice({
        text: "Only the System Owner (Super Admin) can modify Admin accounts or their permissions.",
        type: "error"
      });
      return;
    }
    setEditingUser(user);
    setFormNotice(null);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
      location: user.location,
      status: user.status,
      canWrite: user.canWrite ?? (user.role === "Admin"),
      allowedTabs:
        Array.isArray(user.allowedTabs) && user.allowedTabs.length > 0
          ? [...user.allowedTabs]
          : [...DEFAULT_LIMITED_ADMIN_TABS]
    });
    setIsModalOpen(true);
  };

  const toggleAllowedTab = (tabId: AdminTabType) => {
    setFormData((prev) => {
      const exists = prev.allowedTabs.includes(tabId);
      const next = exists
        ? prev.allowedTabs.filter((t) => t !== tabId)
        : [...prev.allowedTabs, tabId];
      return { ...prev, allowedTabs: next };
    });
  };

  const applyPreset = (tabs: AdminTabType[], canWrite: boolean) => {
    setFormData((prev) => ({
      ...prev,
      allowedTabs: [...tabs],
      canWrite
    }));
  };

  // Form Submit Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormNotice(null);

    if (!hasWriteAccess) {
      setFormNotice({ text: "Access Denied: You do not have permission to modify records.", type: "error" });
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const isAdminOrStaffRole = formData.role === "Admin" || formData.role === "Viewer" || formData.role === "Mentor";

    if (formData.role === "Admin" && !isSuperAdmin) {
      setFormNotice({
        text: "Access Denied: Only the System Owner (Super Admin) can create or configure Admin users.",
        type: "error"
      });
      return;
    }

    if (!editingUser && formData.role === "Admin" && formData.password.trim().length < 8) {
      setFormNotice({
        text: "Please set a login password of at least 8 characters for this new Admin user.",
        type: "error"
      });
      return;
    }

    if (isAdminOrStaffRole && formData.allowedTabs.length === 0) {
      setFormNotice({
        text: "Please select at least 1 module (e.g. Overview) that this user is allowed to access.",
        type: "error"
      });
      return;
    }

    setIsSavingUser(true);
    try {
      if (isAdminOrStaffRole && isSuperAdmin) {
        // Persist in Admin Operators Directory (`admins` collection + local cache + server)
        const opRecord = await saveAdminOperator({
          email: cleanEmail,
          fullName: formData.fullName.trim(),
          passwordInput: formData.password.trim() || undefined,
          role: formData.role === "Viewer" ? "Viewer (Read Only)" : "Admin",
          allowedTabs: formData.allowedTabs,
          canWrite: formData.role === "Viewer" ? false : formData.canWrite,
          status: formData.status === "Suspended" ? "Suspended" : "Active",
          createdBy: currentAdminEmail || "olosundelouis@gmail.com"
        });

        // Provision in Firebase Auth if password was provided
        if (formData.password.trim().length >= 8) {
          try {
            const { initializeApp, deleteApp, getApps } = await import("firebase/app");
            const { getAuth, createUserWithEmailAndPassword, signOut: fbSignOut } = await import("firebase/auth");
            const firebaseConfig = await getFirebaseConfig();
            const appName = "RMATempUserProvisionApp";
            const existingApp = getApps().find((a) => a.name === appName);
            const tempApp = existingApp || initializeApp(firebaseConfig, appName);
            const tempAuth = getAuth(tempApp);
            await createUserWithEmailAndPassword(tempAuth, cleanEmail, formData.password.trim()).catch(() => null);
            await fbSignOut(tempAuth).catch(() => null);
            await deleteApp(tempApp).catch(() => null);
          } catch {}
        }

        const updatedUser: PlatformUser = {
          id: editingUser?.id || `usr-${Date.now()}`,
          fullName: formData.fullName.trim(),
          email: cleanEmail,
          phone: formData.phone.trim(),
          role: formData.role,
          location: formData.location.trim(),
          status: formData.status,
          joinedAt: editingUser?.joinedAt || new Date().toISOString(),
          emailVerified: true,
          verificationDate: editingUser?.verificationDate || new Date().toISOString(),
          allowedTabs: formData.allowedTabs,
          canWrite: formData.role === "Viewer" ? false : formData.canWrite,
          passwordDigest: opRecord.passwordDigest || editingUser?.passwordDigest
        };
        await savePlatformUser(updatedUser);
      } else {
        const userRecord: PlatformUser = {
          id: editingUser?.id || `usr-${Date.now()}`,
          fullName: formData.fullName.trim(),
          email: cleanEmail,
          phone: formData.phone.trim(),
          role: isSuperAdmin ? formData.role : "Student",
          location: formData.location.trim(),
          status: formData.status,
          joinedAt: editingUser?.joinedAt || new Date().toISOString(),
          emailVerified: editingUser?.emailVerified ?? false,
          allowedTabs: formData.allowedTabs,
          canWrite: formData.canWrite
        };
        await savePlatformUser(userRecord);
      }

      onLogAction(
        editingUser
          ? `👥 [USERS] Super Admin updated ${formData.fullName} (${cleanEmail}) — Role: ${formData.role}, Modules: ${formData.allowedTabs.length}, Write: ${formData.canWrite}`
          : `👥 [USERS] Super Admin created new ${formData.role}: ${formData.fullName} (${cleanEmail}) with access to ${formData.allowedTabs.length} modules`
      );
      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setFormNotice({
        text: err?.message || "Failed to save user account.",
        type: "error"
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  // Toggle user suspension
  const handleToggleSuspend = async (user: PlatformUser) => {
    if (!hasWriteAccess) return;
    if (isTargetSuperAdminEmail(user.email)) return;
    if (user.role === "Admin" && !isSuperAdmin) return;

    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    const updatedUser: PlatformUser = {
      ...user,
      status: nextStatus
    };
    await savePlatformUser(updatedUser);
    if (user.role === "Admin" && isSuperAdmin) {
      await saveAdminOperator({
        email: user.email,
        fullName: user.fullName,
        role: "Admin",
        allowedTabs: user.allowedTabs,
        canWrite: user.canWrite,
        status: nextStatus === "Suspended" ? "Suspended" : "Active"
      }).catch(() => null);
    }
    onLogAction(`👥 [USERS] Account status toggled for ${user.fullName} to [${nextStatus}]`);
    loadUsers();
  };

  // Delete user
  const handleDeleteUser = async (user: PlatformUser) => {
    if (!hasWriteAccess) return;
    if (isTargetSuperAdminEmail(user.email)) return;
    if (user.role === "Admin" && !isSuperAdmin) return;

    await deletePlatformUser(user.id);
    if (user.role === "Admin" && isSuperAdmin) {
      await deleteAdminOperator(user.email).catch(() => null);
    }
    setDeleteConfirmId(null);
    onLogAction(`❌ [USERS] Revoked portal access for: ${user.fullName} (${user.email})`);
    loadUsers();
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Full Name", "Email", "Phone", "Role", "Write Access", "Allowed Modules Count", "Status", "Joined At", "Location"];
      const rows = filteredUsers.map(u => [
        u.id,
        u.fullName,
        u.email,
        u.phone,
        isTargetSuperAdminEmail(u.email) ? "Super Admin (Owner)" : u.role,
        isTargetSuperAdminEmail(u.email) ? "Full System Write" : (u.canWrite ? "Read & Write" : "View Only"),
        isTargetSuperAdminEmail(u.email) ? "All 33 Modules" : `${u.allowedTabs?.length || DEFAULT_LIMITED_ADMIN_TABS.length} Modules`,
        u.status,
        u.joinedAt,
        u.location
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `RMA_Users_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onLogAction(`📥 [USERS] Exported ${filteredUsers.length} users to CSV format`);
    } catch (err) {
      console.error("Failed to export users:", err);
    }
  };

  // Resend Verification Email
  const handleResendVerification = async (user: PlatformUser) => {
    setResendStatus({ id: user.id, success: true, message: "Sending..." });
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { getFirestoreDb } = await import("../lib/db");
      const db = await getFirestoreDb();

      const link = window.location.origin + "/?view=verify-email&email=" + encodeURIComponent(user.email) + "&uid=" + user.id;
      const res = await fetch("/api/email/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event: "EMAIL_VERIFICATION",
          payload: {
            fullName: user.fullName,
            email: user.email,
            verificationLink: link
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setResendStatus({ id: user.id, success: true, message: "Verification link sent!" });
        onLogAction(`✉️ [USERS] Dispatched verification link to: ${user.email}`);
        
        await updateDoc(doc(db, "users", user.id), {
          verificationSentAt: new Date().toISOString()
        }).catch(() => null);
      } else {
        throw new Error(data.error || "Mail transmission failed");
      }
    } catch (err: any) {
      setResendStatus({ id: user.id, success: false, message: err.message || "Failed to send." });
    }
    
    setTimeout(() => {
      setResendStatus(null);
    }, 4000);
  };

  // Filter & Search logics
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = u.fullName.toLowerCase().includes(q) || 
                          u.email.toLowerCase().includes(q) || 
                          u.location.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || u.status.toLowerCase() === statusFilter.toLowerCase();
    
    const isVerified = !!u.emailVerified;
    const matchesVerify = verifyFilter === "all" || 
                          (verifyFilter === "verified" && isVerified) || 
                          (verifyFilter === "unverified" && !isVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerify;
  });

  const configurableGroups = ADMIN_MODULE_GROUPS.map((grp) => ({
    ...grp,
    items: grp.items.filter((it) => !it.superAdminOnly)
  })).filter((grp) => grp.items.length > 0);

  const allConfigurableTabIds = configurableGroups.flatMap((g) => g.items.map((i) => i.id));

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
      
      {/* Title Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#103D2E]/10 text-[#103D2E] rounded-xl flex items-center justify-center font-black">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Administrative & Platform Users
              </h3>
              {isSuperAdmin ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  👑 Super Admin Sovereign Mode
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                  🔒 Limited Admin View
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
              {isSuperAdmin
                ? "Create Admin users, assign their login passwords, and choose the exact modules they can see & access"
                : "View platform users (Creating or modifying Admin accounts requires Super Admin authority)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all text-2xs font-extrabold uppercase tracking-widest rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <Download size={12} />
            Export CSV
          </button>

          {isSuperAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 hover:text-white transition-all text-2xs font-extrabold uppercase tracking-widest rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <UserPlus size={12} className="stroke-[2.5]" />
              Create New Admin / User
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          
          {/* Search */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Search Users:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lookup user name, email address or state..."
                className="w-full pl-8.5 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E] rounded-xl text-xs font-bold outline-none transition-all placeholder-slate-400"
              />
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Role Filter */}
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Role Type:
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="mentor">Mentor</option>
              <option value="viewer">Viewer</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Account Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#334155] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
              <option value="deactivated">Deactivated Accounts</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Verification Status:
            </label>
            <select
              value={verifyFilter}
              onChange={(e) => setVerifyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#334155] outline-none cursor-pointer"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified Emails</option>
              <option value="unverified">Unverified Emails</option>
            </select>
          </div>

        </div>
      </div>

      {/* Roster Grid Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-150 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black uppercase text-slate-450 tracking-widest font-mono">
                <th className="py-4 px-6">User / Contact Information</th>
                <th className="py-4 px-6">Role & Authority</th>
                <th className="py-4 px-6">Granted Modules / Access</th>
                <th className="py-4 px-6 text-center">Roster Status</th>
                <th className="py-4 px-6 text-center">Email Verification</th>
                <th className="py-4 px-6">Assigned On</th>
                {hasWriteAccess && <th className="py-4 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    No active user accounts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isOwner = isTargetSuperAdminEmail(user.email);
                  const isProtectedFromCaller = (user.role === "Admin" || isOwner) && !isSuperAdmin;
                  const grantedTabs = user.allowedTabs && user.allowedTabs.length > 0
                    ? user.allowedTabs
                    : DEFAULT_LIMITED_ADMIN_TABS;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Bio details */}
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          {user.fullName}
                          {isOwner && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-black uppercase">
                              Owner
                            </span>
                          )}
                        </p>
                        <div className="text-[9.5px] text-slate-450 flex items-center gap-1.5 font-mono mt-0.5">
                          <span className="flex items-center gap-0.5"><Mail size={9} /> {user.email}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin size={9} /> {user.location}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        {isOwner ? (
                          <span className="px-2.5 py-1 rounded border text-[8.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border-amber-300 inline-flex items-center gap-1">
                            👑 Super Admin
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className={`px-2.5 py-0.5 rounded border text-[8.5px] font-black uppercase tracking-wider inline-block ${
                              user.role === "Admin" ? "bg-red-50 text-red-600 border-red-150" :
                              user.role === "Mentor" ? "bg-amber-50 text-amber-700 border-amber-150" :
                              user.role === "Student" ? "bg-blue-50 text-blue-800 border-blue-150" :
                              "bg-emerald-50 text-emerald-800 border-emerald-150"
                            }`}>
                              {user.role === "Admin" ? "Limited Admin" : user.role}
                            </span>
                            {user.role !== "Student" && (
                              <span className="block text-[8.5px] font-mono font-bold text-slate-500">
                                {user.canWrite === false ? "👁️ View Only" : "✏️ Read & Write"}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Granted Modules */}
                      <td className="py-4 px-6">
                        {isOwner ? (
                          <span className="text-[10px] font-mono font-extrabold text-[#103D2E] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                            All 33 System Modules (Full Owner Access)
                          </span>
                        ) : user.role === "Student" ? (
                          <span className="text-[10px] font-mono text-slate-400">
                            Public Student Portal Only
                          </span>
                        ) : (
                          <div className="space-y-1 max-w-[230px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] font-mono font-extrabold text-[#103D2E] bg-slate-100 px-2 py-0.5 rounded">
                                {grantedTabs.length} Modules Enabled
                              </span>
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(user)}
                                  className="text-[9px] font-mono font-bold text-amber-700 hover:underline cursor-pointer"
                                >
                                  Configure
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 font-mono truncate" title={grantedTabs.join(", ")}>
                              {grantedTabs.slice(0, 4).join(", ")}
                              {grantedTabs.length > 4 ? ` +${grantedTabs.length - 4} more` : ""}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest ${
                          user.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          user.status === "Suspended" ? "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse" :
                          "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Email Verification */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {user.emailVerified || isOwner ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded text-[8px] font-black uppercase tracking-wider">
                              <CheckCircle size={8} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-150 rounded text-[8px] font-black uppercase tracking-wider">
                              <XCircle size={8} /> Pending
                            </span>
                          )}

                          {!user.emailVerified && !isOwner && hasWriteAccess && (
                            <button
                              onClick={() => handleResendVerification(user)}
                              disabled={resendStatus?.id === user.id}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-[#103D2E] rounded transition-colors cursor-pointer"
                              title="Resend verification email"
                            >
                              <Send size={10} />
                            </button>
                          )}
                        </div>
                        {resendStatus?.id === user.id && (
                          <p className={`text-[8px] font-bold mt-1 ${resendStatus.success ? "text-emerald-650" : "text-rose-500"}`}>
                            {resendStatus.message}
                          </p>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-slate-500 font-mono text-[9.5px] font-bold">
                        <div>
                          {new Date(user.joinedAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      </td>

                      {/* Action panel triggers */}
                      {hasWriteAccess && (
                        <td className="py-4 px-6 text-right">
                          {isOwner ? (
                            <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              Protected Owner
                            </span>
                          ) : isProtectedFromCaller ? (
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                              Super Admin Only
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleToggleSuspend(user)}
                                className={`p-1.5 rounded-lg border text-2xs font-extrabold cursor-pointer transition-all ${
                                  user.status === "Suspended"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                    : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                                }`}
                                title={user.status === "Suspended" ? "Enable Account" : "Suspend Account"}
                              >
                                {user.status === "Suspended" ? <UserCheck size={12} /> : <UserMinus size={12} />}
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="px-2.5 py-1.5 bg-[#103D2E]/10 border border-[#103D2E]/20 hover:bg-[#103D2E] hover:text-amber-300 text-[#103D2E] rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[10px] font-extrabold"
                                title="Configure Access & Edit User"
                              >
                                <Edit size={11} />
                                <span>Access</span>
                              </button>

                              {deleteConfirmId === user.id ? (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(user.id)}
                                  className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-all"
                                  title="Delete user account"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Form with Granular Module Access Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000]/50 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-8 shadow-2xl relative text-left my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#103D2E] text-amber-300 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-950">
                  {editingUser ? `Configure Access & Profile: ${editingUser.fullName}` : "Create New Admin & Assign Access"}
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  As System Owner (Super Admin), choose exactly what this Admin can see and do.
                </p>
              </div>
            </div>

            {formNotice && (
              <div className={`mb-4 p-3 rounded-xl border text-xs font-bold ${
                formNotice.type === "error"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                {formNotice.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Victor Chigozie"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-800 font-bold"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">Admin Login Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. victor.ch@gmail.com"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-800 font-bold font-mono"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +234 813 456 7890"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-800 font-bold"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">State / Chapter *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Lagos State"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">Assigned Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as PlatformUser["role"];
                      setFormData({
                        ...formData,
                        role: nextRole,
                        canWrite: nextRole === "Admin"
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-800 font-bold"
                  >
                    {isSuperAdmin && <option value="Admin">Admin (Limited Access)</option>}
                    <option value="Mentor">Mentor (Scoped)</option>
                    <option value="Viewer">Viewer (Read-Only)</option>
                    <option value="Student">Student (Public)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">Account Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PlatformUser["status"] })}
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-800 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>

                {/* Password */}
                {isSuperAdmin && formData.role !== "Student" && (
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-500">
                      {editingUser ? "Reset Password (Optional)" : "Admin Login Password *"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required={!editingUser && formData.role === "Admin"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingUser ? "Leave blank to keep current" : "Min 8 characters"}
                        className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-amber-50/40 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Granular Access Control Matrix (For Admin / Mentor / Viewer) */}
              {isSuperAdmin && formData.role !== "Student" && (
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-1.5">
                        <Lock size={13} />
                        Select Allowed Dashboard Modules ({formData.allowedTabs.length} Selected)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        This Admin will ONLY see and access the tabs you check below. System Owner tabs are never shared.
                      </p>
                    </div>

                    {/* Write Permission Toggle */}
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.canWrite}
                        onChange={(e) => setFormData({ ...formData, canWrite: e.target.checked })}
                        className="rounded text-[#103D2E] focus:ring-[#103D2E]"
                      />
                      <span className="text-[10px] font-mono font-black uppercase text-slate-800">
                        {formData.canWrite ? "✏️ Can Edit Records" : "👁️ Read-Only"}
                      </span>
                    </label>
                  </div>

                  {/* Quick Role Presets */}
                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider">
                      Quick Access Templates (1-Click):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ADMIN_ACCESS_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset.tabs, preset.canWrite)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#103D2E] text-slate-700 hover:text-amber-300 border border-slate-200 text-[9.5px] font-bold transition-all cursor-pointer"
                          title={preset.description}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, allowedTabs: [...allConfigurableTabIds] }))}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9.5px] font-bold transition-all cursor-pointer"
                      >
                        Select All Operational
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, allowedTabs: ["dashboard"] }))}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[9.5px] font-bold transition-all cursor-pointer"
                      >
                        Dashboard Only
                      </button>
                    </div>
                  </div>

                  {/* Checkboxes by Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {configurableGroups.map((grp) => (
                      <div key={grp.title} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                        <span className="block text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1">
                          {grp.title}
                        </span>
                        <div className="space-y-1.5">
                          {grp.items.map((item) => {
                            const checked = formData.allowedTabs.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer text-[11px] font-semibold transition-colors ${
                                  checked ? "bg-emerald-50/80 text-[#103D2E] font-bold" : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleAllowedTab(item.id)}
                                  className="rounded border-slate-300 text-[#103D2E] focus:ring-[#103D2E] w-3.5 h-3.5"
                                />
                                <span className="truncate">{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingUser}
                className="w-full py-3 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={14} />
                <span>
                  {isSavingUser
                    ? "Provisioning Access..."
                    : editingUser
                    ? "Save Access Permissions & User Profile"
                    : "Create Admin User & Grant Selected Access"}
                </span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

