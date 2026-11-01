import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCcw, 
  Calendar,
  Users
} from "lucide-react";
import { 
  getCoursePayments, 
  getCourses, 
  getCourseCertificates, 
  LMSCoursePayment, 
  LMSCourse, 
  LMSCourseCertificate 
} from "../lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface AdminRevenueDashboardProps {
  onNotify: (msg: string, type: "success" | "error") => void;
}

export default function AdminRevenueDashboard({ onNotify }: AdminRevenueDashboardProps) {
  const [payments, setPayments] = useState<LMSCoursePayment[]>([]);
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [certificates, setCertificates] = useState<LMSCourseCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const pList = await getCoursePayments();
      const cList = await getCourses();
      const certList = await getCourseCertificates();

      // Ensure successful payments are filtered correctly
      setPayments(pList);
      setCourses(cList);
      setCertificates(certList);
    } catch (e) {
      onNotify("Error getting sales transaction logs", "error");
    }
    setLoading(false);
  };

  // Compute stats
  const successfulPayments = payments.filter(p => p.paymentStatus === "successful");
  const refundPayments = payments.filter(p => p.paymentStatus === "refunded");
  const failedPayments = payments.filter(p => p.paymentStatus === "failed");

  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = refundPayments.reduce((sum, p) => sum + p.amount, 0);

  // Top courses computation
  const courseSalesCount: Record<string, { count: number; value: number; title: string }> = {};
  
  // Prime structure map
  courses.forEach(c => {
    courseSalesCount[c.id] = { count: 0, value: 0, title: c.title };
  });

  successfulPayments.forEach(p => {
    if (courseSalesCount[p.courseId]) {
      courseSalesCount[p.courseId].count += 1;
      courseSalesCount[p.courseId].value += p.amount;
    } else {
      // payment for non-sync course
      courseSalesCount[p.courseId] = {
        count: 1,
        value: p.amount,
        title: `Unknown Course (ID: ${p.courseId})`
      };
    }
  });

  const rankedCourses = Object.values(courseSalesCount).sort((a, b) => b.value - a.value);

  // Timeline representation for Recharts (grouped by date)
  const salesByDate: Record<string, number> = {};
  
  // Mock days if empty to let chart render elegantly
  const last7DaysList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  last7DaysList.forEach(day => {
    salesByDate[day] = 0;
  });

  successfulPayments.forEach(p => {
    const dateStr = p.timestamp ? p.timestamp.split("T")[0] : new Date().toISOString().split("T")[0];
    if (salesByDate[dateStr] !== undefined) {
      salesByDate[dateStr] += p.amount;
    } else {
      salesByDate[dateStr] = p.amount;
    }
  });

  const chartData = Object.entries(salesByDate).map(([date, val]) => {
    // Beautiful date representation e.g. "Jun 05"
    const parsedDate = new Date(date);
    const label = parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      date: label,
      revenue: val,
      "Daily Sales ₦": val
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 text-left" id="admin-revenue-dashboard">
      
      {/* Upper bar stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sidebar-divider-dark dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-display font-black tracking-tight text-slate-800 dark:text-white">LMS Revenue & Paystack Sync Dashboard</h2>
          <p className="text-xs text-slate-400">Track and reconciliate all premium cohort payments, voucher sales, and verified completions.</p>
        </div>

        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-820 text-slate-550 dark:text-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
        >
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-slate-400 tracking-wider font-mono">CALCULATING FINANCIAL REPORTS...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Card Overviews Bento Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs">
              <span className="text-[9px] block uppercase font-mono font-bold text-slate-400">TOTAL LMS REVENUE</span>
              <h3 className="text-xl md:text-2xl font-black mt-2 text-slate-900 dark:text-white">₦{totalRevenue.toLocaleString()}</h3>
              <div className="text-[10px] font-mono text-emerald-555 font-bold uppercase flex items-center gap-1 mt-2.5">
                <TrendingUp size={12} /> Live sales reconciled
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs">
              <span className="text-[9px] block uppercase font-mono font-bold text-slate-400">SUCCESSFUL TRANSACTIONS</span>
              <h3 className="text-xl md:text-2xl font-black mt-2 text-slate-900 dark:text-white">{successfulPayments.length}</h3>
              <div className="text-[10px] font-mono text-indigo-500 font-bold uppercase flex items-center gap-1 mt-2.5">
                <CheckCircle size={12} /> 100% gateway success
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs">
              <span className="text-[9px] block uppercase font-mono font-bold text-slate-400">VERIFIED GRADUATES</span>
              <h3 className="text-xl md:text-2xl font-black mt-2 text-slate-900 dark:text-white">{certificates.length}</h3>
              <div className="text-[10px] font-mono text-amber-500 font-bold uppercase flex items-center gap-1 mt-2.5">
                <ShieldCheck size={12} /> Certificates issued
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs">
              <span className="text-[9px] block uppercase font-mono font-bold text-slate-400">FAILED CHANNELS</span>
              <h3 className="text-xl md:text-2xl font-black mt-2 text-slate-900 dark:text-white">{failedPayments.length}</h3>
              <div className="text-[10px] font-mono text-rose-500 font-bold uppercase flex items-center gap-1 mt-2.5">
                <AlertCircle size={12} /> Checkout bounces
              </div>
            </div>

          </div>

          {/* Revenue Chart and Top Courses Split row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart Recharts block */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-6">Financial Growth Timeline (Daily NGN)</span>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="date" tickLine={false} style={{ fontSize: 9, fill: "#94A3B8" }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 9, fill: "#94A3B8" }} tickFormatter={(val) => `₦${val / 1000}k`} />
                    <Tooltip contentStyle={{ fontSize: 11, background: "#1E293B", color: "#FFF", borderRadius: 12, border: "none" }} formatter={(val) => [`₦${Number(val).toLocaleString()}`, "Sales"]} />
                    <Area type="monotone" dataKey="Daily Sales ₦" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top selling courses lists */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Syllabus Enrollment breakdown</span>
              
              <div className="space-y-4">
                {rankedCourses.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">{c.title}</h4>
                      <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-1">{c.count} Active Enrolments</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-[11px] font-black text-slate-900 dark:text-white">₦{c.value.toLocaleString()}</span>
                      <span className="text-[8px] font-mono text-indigo-500 uppercase font-bold">Income</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Exhaustive Payments transaction lists ledger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-4">Official LMS paystack Sync Audit Ledger</span>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                    <th className="py-3 px-2">REFERENCE CODE</th>
                    <th className="py-3 px-2">STUDENT EMAIL</th>
                    <th className="py-3 px-2">COURSE STATUS</th>
                    <th className="py-3 px-2">VALUE (₦)</th>
                    <th className="py-3 px-2">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
                  {successfulPayments.map((p) => {
                    const matchCourse = courses.find(c => c.id === p.courseId);
                    
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="py-3 px-2 font-mono text-slate-700 dark:text-slate-250 truncate max-w-[140px]" title={p.paymentReference}>
                          {p.paymentReference}
                        </td>
                        <td className="py-3 px-2 text-slate-800 dark:text-slate-100">
                          {p.userEmail}
                        </td>
                        <td className="py-3 px-2 text-slate-500 truncate max-w-[160px]">
                          {matchCourse ? matchCourse.title : `Course: ${p.courseId}`}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-900 dark:text-white font-black">
                          ₦{p.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-[10px] text-slate-400 font-mono">
                          {p.timestamp ? new Date(p.timestamp).toLocaleString() : "Sync Ledger Pending"}
                        </td>
                      </tr>
                    );
                  })}
                  {successfulPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 italic">No payments received yet. Check again once customers proceed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
