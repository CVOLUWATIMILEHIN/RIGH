import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCcw, BookOpen, Award, CreditCard, Mail, Phone, Calendar } from "lucide-react";
import { getCourseEnrollments, getCoursePayments, LMSCourseEnrollment, LMSCoursePayment } from "../lib/db";

interface StudentProfile {
  email: string;
  name: string;
  phone?: string;
  enrolledCoursesCount: number;
  totalSpent: number;
  completedCoursesCount: number;
  lastActive: string;
}

export default function AdminLmsStudents({ onNotify }: { onNotify: (msg: string, type: "success" | "error") => void }) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const [eList, pList] = await Promise.all([
        getCourseEnrollments(),
        getCoursePayments()
      ]);

      const map = new Map<string, StudentProfile>();

      eList.forEach(e => {
        const key = e.userEmail.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            email: e.userEmail,
            name: e.userName || e.userEmail.split("@")[0],
            phone: e.userPhone,
            enrolledCoursesCount: 0,
            totalSpent: 0,
            completedCoursesCount: 0,
            lastActive: e.enrolledAt || new Date().toISOString()
          });
        }

        const profile = map.get(key)!;
        profile.enrolledCoursesCount += 1;
        if (e.progress === 100 || e.status === "completed") {
          profile.completedCoursesCount += 1;
        }
      });

      pList.forEach(p => {
        const key = p.userEmail.toLowerCase();
        if (map.has(key) && p.paymentStatus === "approved") {
          map.get(key)!.totalSpent += p.amount || 0;
        }
      });

      setStudents(Array.from(map.values()));
    } catch (err) {
      onNotify("Failed to load students list", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left" id="admin-lms-students">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
            LMS Student Directory
          </span>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Enrolled Students Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View student profiles, total courses purchased, expenditure, and course completion rates.
          </p>
        </div>

        <button
          onClick={loadStudents}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 font-mono tracking-wider">LOADING STUDENTS...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-400">No students registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Enrolled Courses</th>
                  <th className="py-3.5 px-4">Completed</th>
                  <th className="py-3.5 px-4">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(s => (
                  <tr key={s.email} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-3xs text-slate-400 font-mono">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.phone || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {s.enrolledCoursesCount} Course(s)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {s.completedCoursesCount} Completed
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{s.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
