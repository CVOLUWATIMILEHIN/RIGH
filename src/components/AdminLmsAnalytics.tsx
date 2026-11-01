import React, { useState, useEffect } from "react";
import { Activity, CreditCard, Users, BookOpen, TrendingUp, RefreshCcw, DollarSign } from "lucide-react";
import { getCoursePayments, getCourseEnrollments, getCourses, LMSCoursePayment, LMSCourseEnrollment, LMSCourse } from "../lib/db";

export default function AdminLmsAnalytics({ onNotify }: { onNotify: (msg: string, type: "success" | "error") => void }) {
  const [payments, setPayments] = useState<LMSCoursePayment[]>([]);
  const [enrollments, setEnrollments] = useState<LMSCourseEnrollment[]>([]);
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, eList, cList] = await Promise.all([
        getCoursePayments(),
        getCourseEnrollments(),
        getCourses()
      ]);
      setPayments(pList);
      setEnrollments(eList);
      setCourses(cList);
    } catch (err) {
      onNotify("Failed to load LMS analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  const approvedPayments = payments.filter(p => p.paymentStatus === "approved");
  const totalRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.paymentStatus === "payment_submitted" || p.paymentStatus === "under_review").length;
  const activeEnrollments = enrollments.filter(e => e.status === "active" || e.status === "approved" || e.status === "completed").length;

  return (
    <div className="space-y-6 text-left" id="admin-lms-analytics">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
            LMS Analytics Dashboard
          </span>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Course Financials & Performance Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time analytics for bank transfer payments, active course access, and total platform revenue.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Verified Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={16} /></div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₦{totalRevenue.toLocaleString()}
          </div>
          <p className="text-3xs text-slate-400">{approvedPayments.length} verified transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Verification</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><CreditCard size={16} /></div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            {pendingPayments}
          </div>
          <p className="text-3xs text-slate-400">Awaiting admin review</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Students</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={16} /></div>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {activeEnrollments}
          </div>
          <p className="text-3xs text-slate-400">Unlocked course access</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Published Courses</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><BookOpen size={16} /></div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
            {courses.length}
          </div>
          <p className="text-3xs text-slate-400">Active catalog items</p>
        </div>

      </div>
    </div>
  );
}
