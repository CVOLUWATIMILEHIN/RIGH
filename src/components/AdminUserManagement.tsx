/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
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
  Download
} from "lucide-react";
import { PlatformUser, getPlatformUsers, savePlatformUser, deletePlatformUser } from "../lib/db";

const DEFAULT_USERS: PlatformUser[] = [
  {
    id: "usr-1",
    fullName: "Adebayo Adesina",
    email: "a.adesina@gmail.com",
    phone: "+234 803 111 2222",
    role: "Admin",
    status: "Active",
    joinedAt: "2026-05-10T11:00:00.000Z",
    location: "Lagos State"
  },
  {
    id: "usr-2",
    fullName: "Miriam Eke",
    email: "miriam.eke@yahoo.com",
    phone: "+234 812 444 5555",
    role: "Mentor",
    status: "Active",
    joinedAt: "2026-05-12T14:30:00.000Z",
    location: "Enugu State"
  },
  {
    id: "usr-3",
    fullName: "Tunde Bakare",
    email: "tundebakare@outlook.com",
    phone: "+234 905 888 9999",
    role: "Viewer",
    status: "Suspended",
    joinedAt: "2026-04-20T09:15:00.000Z",
    location: "Ogun State"
  },
  {
    id: "usr-4",
    fullName: "Fatima Yusuf",
    email: "fatima.y@gmail.com",
    phone: "+234 703 555 6666",
    role: "Mentor",
    status: "Active",
    joinedAt: "2026-05-15T16:20:00.000Z",
    location: "Kaduna State"
  },
  {
    id: "usr-5",
    fullName: "Louis Olosunde",
    email: "olosundelouis@gmail.com",
    phone: "+234 815 678 9012",
    role: "Admin",
    status: "Active",
    joinedAt: "2026-06-01T10:00:00.000Z",
    location: "Lagos State"
  }
];

interface AdminUserManagementProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminUserManagement({ hasWriteAccess, onLogAction }: AdminUserManagementProps) {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [resendStatus, setResendStatus] = useState<{ id: string; success: boolean; message: string } | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Admin" as PlatformUser["role"],
    location: "",
    status: "Active" as PlatformUser["status"]
  });

  // Load from Live Firestore
  const loadUsers = async () => {
    try {
      const liveUsers = await getPlatformUsers();
      if (liveUsers && liveUsers.length > 0) {
        setUsers(liveUsers);
      } else {
        // If Firestore is empty, seed it with defaults
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

    // Listen to real-time events triggered by the central Firestore subscription
    window.addEventListener("rma_platform_users_updated", loadUsers);
    return () => {
      window.removeEventListener("rma_platform_users_updated", loadUsers);
    };
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "Admin",
      location: "",
      status: "Active"
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: PlatformUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      status: user.status
    });
    setIsModalOpen(true);
  };

  // Form Submit Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) {
      alert("Access Denied: You do not have permission to modify records.");
      return;
    }

    if (editingUser) {
      // Edit mode
      const updatedUser: PlatformUser = {
        ...editingUser,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        location: formData.location,
        status: formData.status
      };
      await savePlatformUser(updatedUser);
      onLogAction(`👥 [USERS] Updated access permissions for user: ${formData.fullName} (Role: ${formData.role}, Status: ${formData.status})`);
    } else {
      // Add mode
      const newUser: PlatformUser = {
        id: `usr-${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        location: formData.location,
        status: formData.status,
        joinedAt: new Date().toISOString()
      };
      await savePlatformUser(newUser);
      onLogAction(`👥 [USERS] Assigned new administrative credentials to: ${formData.fullName} (Role: ${formData.role})`);
    }
    setIsModalOpen(false);
    loadUsers();
  };

  // Toggle user suspension
  const handleToggleSuspend = async (user: PlatformUser) => {
    if (!hasWriteAccess) return;
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    const updatedUser: PlatformUser = {
      ...user,
      status: nextStatus
    };
    await savePlatformUser(updatedUser);
    onLogAction(`👥 [USERS] Account status toggled for ${user.fullName} to [${nextStatus}]`);
    loadUsers();
  };

  // Delete user
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Are you sure you want to permanently delete credentials for: ${name}?`)) {
      await deletePlatformUser(userId);
      onLogAction(`❌ [USERS] Revoked portal access for: ${name}`);
      loadUsers();
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Full Name", "Email", "Phone", "Role", "Status", "Joined At", "Location", "Email Verified", "Verification Date", "Last Login"];
      const rows = filteredUsers.map(u => [
        u.id,
        u.fullName,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.joinedAt,
        u.location,
        u.emailVerified ? "Verified" : "Unverified",
        u.verificationDate || "N/A",
        u.lastLogin || "N/A"
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
      // Lazy load Firebase Firestore
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

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
      
      {/* Title Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#103D2E]/10 text-[#103D2E] rounded-xl flex items-center justify-center font-black">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
              Administrative User Accounts
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">Control, audit, and provision portal accounts (Admin, Mentor, Viewer)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all text-2xs font-extrabold uppercase tracking-widest rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <Download size={12} />
            Export to CSV
          </button>

          {hasWriteAccess && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 hover:text-white transition-all text-2xs font-extrabold uppercase tracking-widest rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <UserPlus size={12} className="stroke-[2.5]" />
              New User Account
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
                <th className="py-4 px-6">User / contact information</th>
                <th className="py-4 px-6">Assigned role</th>
                <th className="py-4 px-6">Assigned State</th>
                <th className="py-4 px-6 text-center">Roster Status</th>
                <th className="py-4 px-6 text-center">Email Verification</th>
                <th className="py-4 px-6">Assigned on</th>
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
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Bio details */}
                    <td className="py-4 px-6">
                      <p className="font-extrabold text-slate-900">{user.fullName}</p>
                      <div className="text-[9.5px] text-slate-450 flex items-center gap-1.5 font-mono mt-0.5">
                        <span className="flex items-center gap-0.5"><Mail size={9} /> {user.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Phone size={9} /> {user.phone}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded border text-[8.5px] font-black uppercase tracking-wider ${
                        user.role === "Admin" ? "bg-red-50 text-red-600 border-red-150" :
                        user.role === "Mentor" ? "bg-amber-50 text-amber-700 border-amber-150" :
                        user.role === "Student" ? "bg-blue-50 text-blue-800 border-blue-150" :
                        "bg-emerald-50 text-emerald-800 border-emerald-150"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-[#E76F51]" />
                        {user.location}
                      </span>
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
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded text-[8px] font-black uppercase tracking-wider">
                            <CheckCircle size={8} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-150 rounded text-[8px] font-black uppercase tracking-wider">
                            <XCircle size={8} /> Pending
                          </span>
                        )}

                        {!user.emailVerified && hasWriteAccess && (
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
                      {user.emailVerified && user.verificationDate && (
                        <span className="block text-[8px] text-slate-400 font-mono mt-0.5 font-bold">
                          On: {new Date(user.verificationDate).toLocaleDateString("en-NG")}
                        </span>
                      )}
                    </td>

                    {/* Joined Date / Last Login */}
                    <td className="py-4 px-6 text-slate-500 font-mono text-[9.5px] font-bold">
                      <div>
                        {new Date(user.joinedAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </div>
                      {user.lastLogin && (
                        <div className="text-[8px] text-slate-400 mt-0.5 font-mono">
                          Last: {new Date(user.lastLogin).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      )}
                    </td>

                    {/* Action panel triggers */}
                    {hasWriteAccess && (
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleToggleSuspend(user)}
                            className={`p-1.5 rounded-lg border text-2xs font-extrabold cursor-pointer transition-all ${
                              user.status === "Suspended"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                            }`}
                            title={user.status === "Suspended" ? "Enable Account" : "Disable Account"}
                          >
                            {user.status === "Suspended" ? <UserCheck size={12} /> : <UserMinus size={12} />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer transition-all"
                            title="Edit user info"
                          >
                            <Edit size={12} />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-all"
                            title="Delete user account"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000]/40 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>

            <h3 className="text-sm font-black uppercase text-slate-950 border-b border-slate-100 pb-2.5 mb-4">
              {editingUser ? "Edit User Record" : "Register New Account"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[8.5px] uppercase tracking-wider font-mono font-black text-slate-400">Full Name:</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Victor Chigozie"
                  className="w-full p-2.5 border border-slate-250 focus:border-[#103D2E] rounded-lg text-xs outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-850 font-bold"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[8.5px] uppercase tracking-wider font-mono font-black text-slate-400">Email Address:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. victor.ch@gmail.com"
                  className="w-full p-2.5 border border-slate-250 focus:border-[#103D2E] rounded-lg text-xs outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-850 font-bold"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-[8.5px] uppercase tracking-wider font-mono font-black text-slate-400">Phone Connection:</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +234 813 456 7890"
                  className="w-full p-2.5 border border-slate-250 focus:border-[#103D2E] rounded-lg text-xs outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-850 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] uppercase tracking-wider font-mono font-black text-slate-400">Roster Role:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as PlatformUser["role"] })}
                    className="w-full p-2.5 border border-slate-250 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-700 font-bold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] uppercase tracking-wider font-mono font-black text-slate-400">Security Access:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PlatformUser["status"] })}
                    className="w-full p-2.5 border border-slate-250 focus:border-[#103D2E] rounded-xl text-xs outline-none bg-slate-50/50 text-slate-700 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-[8.5px] uppercase tracking-wider font-mono font-black text-slate-400">State Location:</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Kwara State"
                  className="w-full p-2.5 border border-slate-250 focus:border-[#103D2E] rounded-lg text-xs outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-850 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer mt-2"
              >
                {editingUser ? "Save Roster Entry Changes" : "Register Admin User Account"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
