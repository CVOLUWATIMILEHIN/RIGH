import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  Image,
  Layers,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { TeenBootcampConfig, BootcampRegistration, BootcampFacilitator, BootcampFAQItem } from "../types/teenBootcamp";
import {
  getTeenBootcampConfig,
  saveTeenBootcampConfig,
  getTeenBootcampRegistrations,
  updateTeenBootcampRegistrationStatus
} from "../lib/db";

export default function AdminTeenBootcamp() {
  const [activeSubTab, setActiveSubTab] = useState<"registrations" | "hero" | "facilitators" | "tracks" | "schedule" | "faqs">("registrations");
  
  const [config, setConfig] = useState<TeenBootcampConfig | null>(null);
  const [registrations, setRegistrations] = useState<BootcampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReg, setSelectedReg] = useState<BootcampRegistration | null>(null);

  // Edit Facilitator Modal
  const [editingFacilitator, setEditingFacilitator] = useState<BootcampFacilitator | null>(null);
  const [isFacModalOpen, setIsFacModalOpen] = useState(false);

  // Edit FAQ Modal
  const [editingFaq, setEditingFaq] = useState<BootcampFAQItem | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfg, regs] = await Promise.all([
        getTeenBootcampConfig(),
        getTeenBootcampRegistrations()
      ]);
      setConfig(cfg);
      setRegistrations(regs);
    } catch (e) {
      console.error("Failed to load admin bootcamp data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("rma_teen_registrations_updated", loadData);
    return () => window.removeEventListener("rma_teen_registrations_updated", loadData);
  }, []);

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await saveTeenBootcampConfig(config);
      alert("Bootcamp microsite configuration saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Error saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: BootcampRegistration["paymentStatus"]) => {
    try {
      await updateTeenBootcampRegistrationStatus(id, status);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ["ID", "Teen Name", "Age", "Gender", "Grade", "Parent Name", "Parent Phone", "Parent Email", "City", "T-Shirt", "Track", "Status", "Amount", "Date"];
    const rows = registrations.map(r => [
      r.id,
      `"${r.teenName}"`,
      r.teenAge,
      r.teenGender,
      r.schoolGrade,
      `"${r.parentName}"`,
      r.parentPhone,
      r.parentEmail,
      `"${r.cityState}"`,
      r.tshirtSize,
      `"${r.preferredTrack}"`,
      r.paymentStatus,
      r.amountPaid,
      r.registrationDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Teen_Bootcamp_2026_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !config) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
        Loading Teen Bootcamp CMS...
      </div>
    );
  }

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.teenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-amber-950 p-6 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-950 bg-amber-400 px-3 py-1 rounded-full font-mono">
            <Sparkles size={12} /> FLAGSHIP CMS & DELEGATE DESK
          </span>
          <h1 className="text-2xl font-display font-black tracking-tight">
            Right-Minds Teen Leadership Bootcamp 2026
          </h1>
          <p className="text-xs text-slate-300">
            Manage registrations, payment verifications, and editable landing page sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Publish CMS Changes
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("registrations")}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "registrations"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Users size={16} /> Registrations ({registrations.length})
        </button>

        <button
          onClick={() => setActiveSubTab("hero")}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "hero"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText size={16} /> Hero & Event Details
        </button>

        <button
          onClick={() => setActiveSubTab("facilitators")}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "facilitators"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <UserCheck size={16} /> Facilitators & Speakers
        </button>

        <button
          onClick={() => setActiveSubTab("tracks")}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "tracks"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers size={16} /> Learning Tracks
        </button>

        <button
          onClick={() => setActiveSubTab("schedule")}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "schedule"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar size={16} /> 6-Day Roadmap
        </button>

        <button
          onClick={() => setActiveSubTab("faqs")}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === "faqs"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle size={16} /> FAQs Manager
        </button>
      </div>

      {/* ===================================================================
          SUB-TAB 1: REGISTRATIONS DIRECTORY
          =================================================================== */}
      {activeSubTab === "registrations" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teenager, parent, email or ID..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none font-semibold"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid & Confirmed</option>
                <option value="pending_transfer">Pending Bank Transfer</option>
              </select>

              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-mono font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Reg ID</th>
                    <th className="p-4">Teenager Participant</th>
                    <th className="p-4">Grade / Age</th>
                    <th className="p-4">Parent / Guardian</th>
                    <th className="p-4">T-Shirt & Track</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                        No registrations found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {reg.id}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          {reg.teenName}
                          <span className="block text-[10px] font-normal text-slate-400">{reg.cityState}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{reg.schoolGrade}</span>
                          <span className="block text-[10px] text-slate-400">{reg.teenAge} yrs ({reg.teenGender})</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-900 dark:text-white">{reg.parentName}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{reg.parentPhone}</span>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px]">
                            Shirt: {reg.tshirtSize}
                          </span>
                          <span className="block text-[10px] text-slate-500 truncate max-w-[150px]">{reg.preferredTrack}</span>
                        </td>
                        <td className="p-4 capitalize font-mono text-[11px]">
                          {reg.paymentMethod === "paystack" ? "Paystack" : "Bank Transfer"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase ${
                              reg.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            }`}
                          >
                            {reg.paymentStatus === "paid" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {reg.paymentStatus === "paid" ? "Confirmed" : "Pending Transfer"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {reg.paymentStatus !== "paid" && (
                            <button
                              onClick={() => handleUpdateStatus(reg.id, "paid")}
                              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Verify Paid
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-200 cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: HERO & EVENT DETAILS CMS
          =================================================================== */}
      {activeSubTab === "hero" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-sm font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
            Edit Hero Section & Logistics Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Bootcamp Main Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Subtitle / Slogan</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Registration Fee (₦)</label>
              <input
                type="number"
                value={config.registrationFee}
                onChange={(e) => setConfig({ ...config, registrationFee: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Event Date Text</label>
              <input
                type="text"
                value={config.eventDate}
                onChange={(e) => setConfig({ ...config, eventDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Venue Location</label>
              <input
                type="text"
                value={config.venue}
                onChange={(e) => setConfig({ ...config, venue: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Hero Description</label>
              <textarea
                rows={3}
                value={config.heroDescription}
                onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Flyer Image URL</label>
              <input
                type="text"
                value={config.heroFlyerImage}
                onChange={(e) => setConfig({ ...config, heroFlyerImage: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Registration Record: {selectedReg.id}
              </h3>
              <button onClick={() => setSelectedReg(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>Teenager:</strong> {selectedReg.teenName} ({selectedReg.teenAge} yrs, {selectedReg.teenGender})</p>
              <p><strong>School Grade:</strong> {selectedReg.schoolGrade}</p>
              <p><strong>Parent Name:</strong> {selectedReg.parentName}</p>
              <p><strong>Parent Phone:</strong> {selectedReg.parentPhone}</p>
              <p><strong>Parent Email:</strong> {selectedReg.parentEmail}</p>
              <p><strong>Location:</strong> {selectedReg.cityState}</p>
              <p><strong>T-Shirt Size:</strong> {selectedReg.tshirtSize}</p>
              <p><strong>Track:</strong> {selectedReg.preferredTrack}</p>
              <p><strong>Payment Reference:</strong> {selectedReg.paymentReference}</p>
              <p><strong>Payment Status:</strong> {selectedReg.paymentStatus}</p>
              <p><strong>Registration Date:</strong> {new Date(selectedReg.registrationDate).toLocaleString()}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedReg(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
