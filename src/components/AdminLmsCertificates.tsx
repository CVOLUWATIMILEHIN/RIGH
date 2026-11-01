import React, { useState, useEffect } from "react";
import { Sparkles, Search, RefreshCcw, Award, CheckCircle, Download } from "lucide-react";
import { getCourseCertificates, LMSCourseCertificate } from "../lib/db";

export default function AdminLmsCertificates({ onNotify }: { onNotify: (msg: string, type: "success" | "error") => void }) {
  const [certs, setCerts] = useState<LMSCourseCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCerts();
  }, []);

  const loadCerts = async () => {
    setLoading(true);
    try {
      const list = await getCourseCertificates();
      setCerts(list);
    } catch (err) {
      onNotify("Failed to load course certificates", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = certs.filter(c => 
    c.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.certificateCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left" id="admin-lms-certificates">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
            Certificate Registry
          </span>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Issued Course Certificates
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search and verify certificates awarded to students upon 100% course completion.
          </p>
        </div>

        <button
          onClick={loadCerts}
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
            placeholder="Search certificate by student, course, code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 font-mono tracking-wider">LOADING CERTIFICATES...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Sparkles size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-400">No certificates issued yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Certificate Code</th>
                  <th className="py-3.5 px-4">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{c.userName}</div>
                      <div className="text-3xs text-slate-400 font-mono">{c.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {c.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {c.certificateCode}
                    </td>
                    <td className="py-3.5 px-4 text-3xs font-mono text-slate-500">
                      {new Date(c.issuedAt).toLocaleDateString()}
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
