import React, { useState, useEffect } from "react";
import { 
  Award, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  RefreshCcw, 
  ShieldCheck, 
  Trash2,
  Lock,
  Unlock,
  BarChart3
} from "lucide-react";
import { 
  getCourseEnrollments, 
  saveCourseEnrollment, 
  getCourses, 
  saveLmsAuditLog, 
  LMSCourseEnrollment, 
  LMSCourse 
} from "../lib/db";

interface AdminLmsEnrollmentsProps {
  onNotify: (msg: string, type: "success" | "error") => void;
  adminUserEmail?: string;
}

export default function AdminLmsEnrollments({ 
  onNotify, 
  adminUserEmail = "admin@rightmindsafrica.org" 
}: AdminLmsEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<LMSCourseEnrollment[]>([]);
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eList, cList] = await Promise.all([
        getCourseEnrollments(),
        getCourses()
      ]);
      setEnrollments(eList);
      setCourses(cList);
    } catch (err) {
      onNotify("Error loading course enrollments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (enrollment: LMSCourseEnrollment) => {
    try {
      const newStatus = enrollment.status === "active" || enrollment.status === "approved" ? "pending" : "active";
      const nowStr = new Date().toISOString();

      const updated: LMSCourseEnrollment = {
        ...enrollment,
        status: newStatus,
        approvedAt: newStatus === "active" ? nowStr : enrollment.approvedAt,
        approvedBy: newStatus === "active" ? adminUserEmail : enrollment.approvedBy
      };

      await saveCourseEnrollment(updated);
      await saveLmsAuditLog({
        id: `audit-${Date.now()}`,
        action: newStatus === "active" ? "Enrollment Approved" : "Enrollment Revoked",
        administrator: adminUserEmail,
        student: enrollment.userName || enrollment.userEmail,
        studentEmail: enrollment.userEmail,
        course: enrollment.courseTitle || enrollment.courseId,
        courseId: enrollment.courseId,
        referenceNumber: enrollment.paymentReference,
        timestamp: nowStr,
        details: `Enrollment status changed to ${newStatus}`
      });

      setEnrollments(prev => prev.map(e => e.id === enrollment.id ? updated : e));
      onNotify(`Student enrollment status changed to ${newStatus}.`, "success");
    } catch (err) {
      onNotify("Failed to update enrollment status", "error");
    }
  };

  const filtered = enrollments.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (e.userName || "").toLowerCase().includes(q) || 
      (e.userEmail || "").toLowerCase().includes(q) || 
      (e.courseTitle || "").toLowerCase().includes(q) || 
      (e.paymentReference || "").toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = e.status === "active" || e.status === "approved";
    else if (statusFilter === "pending") matchesStatus = e.status === "pending" || e.status === "payment_submitted" || e.status === "under_review";
    else if (statusFilter === "completed") matchesStatus = e.status === "completed" || e.progress === 100;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left" id="admin-lms-enrollments">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 uppercase">
              Student Enrollment Registry
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filtered.length} Total Records
            </span>
          </div>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Course Enrollments & Student Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor student course access, lesson progress, and manual enrollment authorizations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student email, course, ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Enrollment Statuses</option>
            <option value="active">✓ Active / Unlocked Access</option>
            <option value="pending">⏳ Pending Bank Verification</option>
            <option value="completed">🏆 Completed Courses (100%)</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 font-mono tracking-wider">LOADING ENROLLMENT RECORDS...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Award size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">No Enrollment Records Found</h3>
            <p className="text-xs text-slate-400 mt-1">Enrollments appear automatically when students initiate course purchase.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Payment Ref</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4">Access Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(e => {
                  const isActive = e.status === "active" || e.status === "approved" || e.status === "completed";
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {e.userName || e.userEmail.split("@")[0]}
                        </div>
                        <div className="text-3xs text-slate-400 font-mono">{e.userEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {e.courseTitle || e.courseId}
                      </td>

                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${e.progress || 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-3xs font-bold text-slate-600 dark:text-slate-300">
                            {e.progress || 0}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-3xs font-bold text-slate-600 dark:text-slate-300">
                        {e.paymentReference || "N/A"}
                      </td>

                      <td className="py-3.5 px-4 text-3xs text-slate-500 font-mono">
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle size={11} /> Unlocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse">
                            <Clock size={11} /> Locked (Pending)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(e)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto cursor-pointer transition-colors ${
                            isActive
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          }`}
                        >
                          {isActive ? <Lock size={12} /> : <Unlock size={12} />}
                          {isActive ? "Lock Access" : "Grant Access"}
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
