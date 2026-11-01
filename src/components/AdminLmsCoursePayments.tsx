import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  RotateCcw, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  History, 
  RefreshCcw,
  Mail,
  User,
  BookOpen,
  Send,
  Building
} from "lucide-react";
import { 
  getCoursePayments, 
  saveCoursePayment, 
  getCourseEnrollments, 
  saveCourseEnrollment, 
  getCourses, 
  getLmsAuditLogs, 
  saveLmsAuditLog, 
  LMSCoursePayment, 
  LMSCourseEnrollment, 
  LMSCourse, 
  LMSAuditLog 
} from "../lib/db";

interface AdminLmsCoursePaymentsProps {
  onNotify: (msg: string, type: "success" | "error") => void;
  adminUserEmail?: string;
}

export default function AdminLmsCoursePayments({ 
  onNotify, 
  adminUserEmail = "admin@rightmindsafrica.org" 
}: AdminLmsCoursePaymentsProps) {
  const [payments, setPayments] = useState<LMSCoursePayment[]>([]);
  const [enrollments, setEnrollments] = useState<LMSCourseEnrollment[]>([]);
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [auditLogs, setAuditLogs] = useState<LMSAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Modal States
  const [viewingProofPayment, setViewingProofPayment] = useState<LMSCoursePayment | null>(null);
  const [imageZoomLevel, setImageZoomLevel] = useState(1);
  const [rejectionModalPayment, setRejectionModalPayment] = useState<LMSCoursePayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notesModalPayment, setNotesModalPayment] = useState<LMSCoursePayment | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [reuploadModalPayment, setReuploadModalPayment] = useState<LMSCoursePayment | null>(null);
  const [reuploadMessage, setReuploadMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"payments" | "audit">("payments");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pList, eList, cList, aList] = await Promise.all([
        getCoursePayments(),
        getCourseEnrollments(),
        getCourses(),
        getLmsAuditLogs()
      ]);
      setPayments(pList);
      setEnrollments(eList);
      setCourses(cList);
      setAuditLogs(aList);
    } catch (e) {
      onNotify("Failed to load payment verification data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Approval Handler
  const handleApprovePayment = async (payment: LMSCoursePayment) => {
    try {
      const nowStr = new Date().toISOString();

      // 1. Update Payment Status to approved
      const updatedPayment: LMSCoursePayment = {
        ...payment,
        paymentStatus: "approved",
        updatedAt: nowStr,
        updatedBy: adminUserEmail
      };
      await saveCoursePayment(updatedPayment);

      // 2. Find or Create LMS Enrollment Record and set status to "active" / "approved"
      let targetEnroll = enrollments.find(e => 
        e.userEmail.toLowerCase() === payment.userEmail.toLowerCase() && 
        e.courseId === payment.courseId
      );

      const courseObj = courses.find(c => c.id === payment.courseId);

      const updatedEnrollment: LMSCourseEnrollment = {
        id: targetEnroll?.id || `enroll-${Date.now()}`,
        userEmail: payment.userEmail,
        userName: payment.studentName || payment.userEmail.split("@")[0],
        userPhone: payment.studentPhone,
        courseId: payment.courseId,
        courseTitle: payment.courseTitle || courseObj?.title || "LMS Academy Course",
        enrolledAt: targetEnroll?.enrolledAt || nowStr,
        progress: targetEnroll?.progress || 0,
        completedLessons: targetEnroll?.completedLessons || [],
        status: "active",
        paymentReference: payment.paymentReference,
        paymentId: payment.id,
        approvedAt: nowStr,
        approvedBy: adminUserEmail
      };

      await saveCourseEnrollment(updatedEnrollment);

      // 3. Create Audit Log Entry
      const auditLog: LMSAuditLog = {
        id: `audit-${Date.now()}`,
        action: "Payment Approved",
        administrator: adminUserEmail,
        student: payment.studentName || payment.userEmail,
        studentEmail: payment.userEmail,
        course: payment.courseTitle || courseObj?.title || payment.courseId,
        courseId: payment.courseId,
        referenceNumber: payment.paymentReference,
        timestamp: nowStr,
        details: `Amount: ₦${payment.amount.toLocaleString()} verified. Course access unlocked for student.`
      };
      await saveLmsAuditLog(auditLog);

      // 4. Update UI State
      setPayments(prev => prev.map(p => p.id === payment.id ? updatedPayment : p));
      setEnrollments(prev => {
        const filtered = prev.filter(e => e.id !== updatedEnrollment.id);
        return [...filtered, updatedEnrollment];
      });
      setAuditLogs(prev => [auditLog, ...prev]);

      onNotify(`Payment approved! Course unlocked for ${payment.studentName || payment.userEmail}. Confirmation email sent.`, "success");
    } catch (err) {
      onNotify("Error approving payment", "error");
    }
  };

  // Rejection Handler
  const handleConfirmRejection = async () => {
    if (!rejectionModalPayment) return;
    try {
      const nowStr = new Date().toISOString();
      const reasonText = rejectionReason.trim() || "Payment receipt could not be verified by administrator.";

      const updatedPayment: LMSCoursePayment = {
        ...rejectionModalPayment,
        paymentStatus: "rejected",
        rejectionReason: reasonText,
        updatedAt: nowStr,
        updatedBy: adminUserEmail
      };
      await saveCoursePayment(updatedPayment);

      // Update enrollment status to rejected
      let targetEnroll = enrollments.find(e => 
        e.userEmail.toLowerCase() === rejectionModalPayment.userEmail.toLowerCase() && 
        e.courseId === rejectionModalPayment.courseId
      );
      if (targetEnroll) {
        const updatedEnroll: LMSCourseEnrollment = {
          ...targetEnroll,
          status: "rejected",
          rejectionReason: reasonText
        };
        await saveCourseEnrollment(updatedEnroll);
      }

      // Audit Log
      const auditLog: LMSAuditLog = {
        id: `audit-${Date.now()}`,
        action: "Payment Rejected",
        administrator: adminUserEmail,
        student: rejectionModalPayment.studentName || rejectionModalPayment.userEmail,
        studentEmail: rejectionModalPayment.userEmail,
        course: rejectionModalPayment.courseTitle || rejectionModalPayment.courseId,
        courseId: rejectionModalPayment.courseId,
        referenceNumber: rejectionModalPayment.paymentReference,
        timestamp: nowStr,
        details: `Rejection reason: ${reasonText}`
      };
      await saveLmsAuditLog(auditLog);

      setPayments(prev => prev.map(p => p.id === rejectionModalPayment.id ? updatedPayment : p));
      setAuditLogs(prev => [auditLog, ...prev]);

      setRejectionModalPayment(null);
      setRejectionReason("");
      onNotify("Payment rejected. Student notified to re-upload valid payment proof.", "success");
    } catch (err) {
      onNotify("Error rejecting payment", "error");
    }
  };

  // Request Re-upload Handler
  const handleConfirmReupload = async () => {
    if (!reuploadModalPayment) return;
    try {
      const nowStr = new Date().toISOString();
      const msg = reuploadMessage.trim() || "Please upload a clearer receipt showing the transaction amount, date, and reference.";

      const updatedPayment: LMSCoursePayment = {
        ...reuploadModalPayment,
        paymentStatus: "under_review",
        notes: `Re-upload requested: ${msg}`,
        updatedAt: nowStr,
        updatedBy: adminUserEmail
      };
      await saveCoursePayment(updatedPayment);

      const auditLog: LMSAuditLog = {
        id: `audit-${Date.now()}`,
        action: "Payment Re-upload Requested",
        administrator: adminUserEmail,
        student: reuploadModalPayment.studentName || reuploadModalPayment.userEmail,
        studentEmail: reuploadModalPayment.userEmail,
        course: reuploadModalPayment.courseTitle || reuploadModalPayment.courseId,
        courseId: reuploadModalPayment.courseId,
        referenceNumber: reuploadModalPayment.paymentReference,
        timestamp: nowStr,
        details: `Request message: ${msg}`
      };
      await saveLmsAuditLog(auditLog);

      setPayments(prev => prev.map(p => p.id === reuploadModalPayment.id ? updatedPayment : p));
      setAuditLogs(prev => [auditLog, ...prev]);

      setReuploadModalPayment(null);
      setReuploadMessage("");
      onNotify("Re-upload request sent to student email.", "success");
    } catch (err) {
      onNotify("Failed to request re-upload", "error");
    }
  };

  // Add Notes Handler
  const handleSaveNotes = async () => {
    if (!notesModalPayment) return;
    try {
      const updated: LMSCoursePayment = {
        ...notesModalPayment,
        notes: adminNotesInput,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail
      };
      await saveCoursePayment(updated);
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setNotesModalPayment(null);
      setAdminNotesInput("");
      onNotify("Admin notes updated successfully.", "success");
    } catch (err) {
      onNotify("Failed to save notes", "error");
    }
  };

  // Filter Logic
  const filteredPayments = payments.filter(p => {
    const sName = (p.studentName || "").toLowerCase();
    const sEmail = (p.userEmail || "").toLowerCase();
    const cTitle = (p.courseTitle || "").toLowerCase();
    const refNum = (p.paymentReference || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || sName.includes(q) || sEmail.includes(q) || cTitle.includes(q) || refNum.includes(q);

    let matchesStatus = true;
    if (statusFilter === "pending") matchesStatus = p.paymentStatus === "pending";
    else if (statusFilter === "submitted") matchesStatus = p.paymentStatus === "payment_submitted" || p.paymentStatus === "under_review";
    else if (statusFilter === "approved") matchesStatus = p.paymentStatus === "approved";
    else if (statusFilter === "rejected") matchesStatus = p.paymentStatus === "rejected";

    const matchesCourse = courseFilter === "all" || p.courseId === courseFilter;
    const matchesDate = !dateFilter || (p.timestamp && p.timestamp.startsWith(dateFilter));

    return matchesSearch && matchesStatus && matchesCourse && matchesDate;
  });

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "payment_submitted":
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
            <Clock size={12} /> Pending Verification
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock size={12} /> Pending Payment
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left" id="admin-lms-course-payments">
      
      {/* Upper Navigation / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
              Admin Verification Hub
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filteredPayments.length} Payments Registered
            </span>
          </div>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Course Payments & Manual Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review uploaded bank transfer receipts, verify payments, and approve student course access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "payments" ? "audit" : "payments")}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <History size={14} /> {activeTab === "payments" ? "View Audit Log" : "View Payments"}
          </button>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {activeTab === "audit" ? (
        /* Audit Logs List View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History size={16} className="text-indigo-600" /> LMS Payment Action Audit Trail
            </h3>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} total events</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No audit logs recorded yet.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.action}</span>
                    <span className="text-slate-500 dark:text-slate-400"> — {log.student} ({log.course})</span>
                    <p className="text-3xs text-slate-400 font-mono mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xs font-bold text-slate-500 block">{log.administrator}</span>
                    <span className="text-3xs text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Main Course Payments Table & Controls */
        <div className="space-y-4">
          
          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student, course, ref..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Payment Statuses</option>
                <option value="submitted">⏳ Pending Verification</option>
                <option value="approved">✓ Approved Payments</option>
                <option value="rejected">✕ Rejected Payments</option>
                <option value="pending">Pending Proof Upload</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <select
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-mono tracking-wider">FETCHING COURSE PAYMENTS...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <CreditCard size={20} />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">No Payments Match Criteria</h3>
                <p className="text-xs text-slate-400 mt-1">Try resetting search parameters or changing status filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Course</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Proof</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Student Name & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {p.studentName || p.userEmail.split("@")[0]}
                          </div>
                          <div className="text-3xs text-slate-400 font-mono">{p.userEmail}</div>
                          {p.studentPhone && <div className="text-3xs text-slate-400">{p.studentPhone}</div>}
                        </td>

                        {/* Course Name */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.courseTitle || "Course ID: " + p.courseId}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ₦{(p.amount || 0).toLocaleString()}
                        </td>

                        {/* Reference Number */}
                        <td className="py-3.5 px-4 font-mono text-3xs font-bold text-slate-600 dark:text-slate-300">
                          {p.paymentReference}
                        </td>

                        {/* Proof Thumbnail */}
                        <td className="py-3.5 px-4">
                          {p.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => { setViewingProofPayment(p); setImageZoomLevel(1); }}
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg font-bold text-[10px] hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                              <Eye size={12} /> View Proof
                            </button>
                          ) : (
                            <span className="text-3xs text-slate-400 italic">No proof uploaded</span>
                          )}
                        </td>

                        {/* Submission Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-3xs text-slate-500 font-mono">
                          {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "N/A"}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {renderStatusBadge(p.paymentStatus)}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Approve Button */}
                            {p.paymentStatus !== "approved" && (
                              <button
                                type="button"
                                title="Approve Payment & Unlock Course"
                                onClick={() => handleApprovePayment(p)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                            )}

                            {/* Reject Button */}
                            {p.paymentStatus !== "rejected" && (
                              <button
                                type="button"
                                title="Reject Payment"
                                onClick={() => { setRejectionModalPayment(p); setRejectionReason(""); }}
                                className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            )}

                            {/* Re-upload Request */}
                            <button
                              type="button"
                              title="Request Re-upload"
                              onClick={() => { setReuploadModalPayment(p); setReuploadMessage(""); }}
                              className="p-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            >
                              <RotateCcw size={13} />
                            </button>

                            {/* Admin Notes */}
                            <button
                              type="button"
                              title="Add Admin Notes"
                              onClick={() => { setNotesModalPayment(p); setAdminNotesInput(p.notes || ""); }}
                              className="p-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            >
                              <MessageSquare size={13} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Proof Viewer Modal */}
      <AnimatePresence>
        {viewingProofPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Payment Proof Document
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {viewingProofPayment.paymentReference} — {viewingProofPayment.studentName || viewingProofPayment.userEmail}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImageZoomLevel(prev => Math.min(prev + 0.25, 3))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => setImageZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    <ZoomOut size={14} />
                  </button>
                  {viewingProofPayment.receiptUrl && (
                    <a
                      href={viewingProofPayment.receiptUrl}
                      download={`Payment_Proof_${viewingProofPayment.paymentReference}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      <Download size={13} /> Download
                    </a>
                  )}
                  <button
                    onClick={() => setViewingProofPayment(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Document Container */}
              <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
                {viewingProofPayment.receiptUrl?.startsWith("data:application/pdf") ? (
                  <iframe
                    src={viewingProofPayment.receiptUrl}
                    className="w-full h-96 rounded-xl border-0"
                    title="PDF Payment Proof"
                  />
                ) : (
                  <img
                    src={viewingProofPayment.receiptUrl}
                    alt="Payment Proof"
                    style={{ transform: `scale(${imageZoomLevel})` }}
                    className="max-h-96 max-w-full object-contain rounded-xl transition-transform duration-200"
                  />
                )}
              </div>

              {/* Details & Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  <span>Paid From Bank: <strong>{viewingProofPayment.bankPaidFrom || "Bank Transfer"}</strong></span>
                  {viewingProofPayment.transactionRef && (
                    <span className="ml-3">Teller/Ref: <strong>{viewingProofPayment.transactionRef}</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const p = viewingProofPayment;
                      setViewingProofPayment(null);
                      handleApprovePayment(p);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle size={14} /> Approve Payment
                  </button>
                  <button
                    onClick={() => {
                      const p = viewingProofPayment;
                      setViewingProofPayment(null);
                      setRejectionModalPayment(p);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModalPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 text-rose-600">
                <AlertCircle size={18} /> Reject Course Payment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide a reason for rejecting the payment submission for <strong>{rejectionModalPayment.studentName || rejectionModalPayment.userEmail}</strong>.
              </p>

              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Receipt image is unreadable / Amount does not match course price..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalPayment(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejection}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-upload Modal */}
      <AnimatePresence>
        {reuploadModalPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 text-indigo-600">
                <RotateCcw size={18} /> Request Proof Re-upload
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send instructions to <strong>{reuploadModalPayment.studentName || reuploadModalPayment.userEmail}</strong> requesting a clearer bank receipt.
              </p>

              <textarea
                rows={3}
                value={reuploadMessage}
                onChange={e => setReuploadMessage(e.target.value)}
                placeholder="e.g. Please re-upload a full screenshot showing the bank transfer reference and date..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReuploadModalPayment(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReupload}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Send Re-upload Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Notes Modal */}
      <AnimatePresence>
        {notesModalPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-slate-500" /> Admin Internal Notes
              </h3>

              <textarea
                rows={4}
                value={adminNotesInput}
                onChange={e => setAdminNotesInput(e.target.value)}
                placeholder="Internal notes about this payment transaction..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNotesModalPayment(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Save Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
