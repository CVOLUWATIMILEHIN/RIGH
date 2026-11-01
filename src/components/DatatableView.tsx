import React from "react";
import { 
  Search, 
  MapPin, 
  Users, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileSpreadsheet,
  Plus,
  Upload
} from "lucide-react";
import { Registration } from "../lib/db";

interface DatatableViewProps {
  registrations: Registration[];
  filteredRegistrations: Registration[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProfileFilter: string;
  setSelectedProfileFilter: (p: string) => void;
  selectedLocationFilter: string;
  setSelectedLocationFilter: (l: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (s: string) => void;
  selectedDateFilter?: string;
  setSelectedDateFilter?: (d: string) => void;
  selectedPaymentStatusFilter?: string;
  setSelectedPaymentStatusFilter?: (p: string) => void;
  registryGroupFilter: "all" | "rma" | "cii";
  setRegistryGroupFilter: (g: "all" | "rma" | "cii") => void;
  uniqueLocations: string[];
  onSelectMember: (m: Registration) => void;
  onClearFilters: () => void;
  onQuickCreateMember: () => void;
  onExportCSV: () => void;
  onImportCSV: (file: File) => void;
  getProfileLabel: (type: string) => string;
  getProfileBadgeTheme: (type: string) => string;
  getStatusBadgeColor: (status: string) => string;
  forceSegment?: "cii" | "rma";
}

export default function DatatableView({
  registrations,
  filteredRegistrations,
  searchQuery,
  setSearchQuery,
  selectedProfileFilter,
  setSelectedProfileFilter,
  selectedLocationFilter,
  setSelectedLocationFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedDateFilter = "all",
  setSelectedDateFilter,
  selectedPaymentStatusFilter = "all",
  setSelectedPaymentStatusFilter,
  registryGroupFilter,
  setRegistryGroupFilter,
  uniqueLocations,
  onSelectMember,
  onClearFilters,
  onQuickCreateMember,
  onExportCSV,
  onImportCSV,
  getProfileLabel,
  getProfileBadgeTheme,
  getStatusBadgeColor,
  forceSegment
}: DatatableViewProps) {

  const isFiltered = searchQuery || 
    selectedProfileFilter !== "all" || 
    selectedLocationFilter !== "all" || 
    selectedStatusFilter !== "all" || 
    selectedDateFilter !== "all" || 
    selectedPaymentStatusFilter !== "all" || 
    (!forceSegment && registryGroupFilter !== "all");

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
      
      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 ">
            <Filter size={14} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
              {forceSegment === "cii" ? "CII Portal Registry Filter" : forceSegment === "rma" ? "RMA Portal Registry Filter" : "Database Filter Controls"}
            </h3>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Segment Controls: RMA vs CII */}
            {!forceSegment && (
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/40 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setRegistryGroupFilter("all")}
                  className={`flex-1 sm:flex-initial py-1 px-3.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    registryGroupFilter === "all"
                      ? "bg-white text-[#103D2E] shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  All Portals
                </button>
                <button
                  type="button"
                  onClick={() => setRegistryGroupFilter("rma")}
                  className={`flex-1 sm:flex-initial py-1 px-3.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    registryGroupFilter === "rma"
                      ? "bg-[#103D2E] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🎓 RMA
                </button>
                <button
                  type="button"
                  onClick={() => setRegistryGroupFilter("cii")}
                  className={`flex-1 sm:flex-initial py-1 px-3.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    registryGroupFilter === "cii"
                      ? "bg-[#E76F51] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🧡 CII
                </button>
              </div>
            )}
            
            <input
              type="file"
              id={`csv-import-input-${forceSegment || 'all'}`}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImportCSV(file);
                  e.target.value = "";
                }
              }}
            />
            <button
              onClick={() => {
                document.getElementById(`csv-import-input-${forceSegment || 'all'}`)?.click();
              }}
              title="Import CSV to bulk-populate database"
              className="px-3 py-2 bg-[#103D2E]/5 hover:bg-[#103D2E]/10 border border-[#103D2E]/15 text-[#103D2E] hover:text-[#103D2E] rounded-xl transition-all flex items-center justify-center cursor-pointer gap-1.5 text-[10px] font-black uppercase tracking-wider font-mono"
            >
              <Upload size={13} />
              <span>Import CSV</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Export database rows format"
              className="p-2 bg-slate-55/65 hover:bg-slate-100/80 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              <FileSpreadsheet size={15} />
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <div className="space-y-1">
            <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">
              Program Cohorts:
            </label>
            <select
              value={selectedProfileFilter}
              onChange={(e) => setSelectedProfileFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
            >
              {forceSegment === "cii" ? (
                <>
                  <option value="cii">Corper Impact Initiative (CII)</option>
                </>
              ) : forceSegment === "rma" ? (
                <>
                  <option value="all">View All RMA Cohorts</option>
                  <option value="teens">Right-Minded Teens</option>
                  <option value="young_leaders">Young Leaders Program</option>
                  <option value="yap">YAP Conference</option>
                  <option value="event">Events & Hangouts</option>
                  <option value="course">Premium Courses</option>
                  <option value="mentorship">Mentorship Applications</option>
                  <option value="volunteer">Volunteer Applications</option>
                  <option value="partnership">Partnership Requests</option>
                </>
              ) : (
                <>
                  <option value="all">View All Cohorts</option>
                  <option value="cii">Corper Impact Initiative (CII)</option>
                  <option value="teens">Right-Minded Teens</option>
                  <option value="young_leaders">Young Leaders Program</option>
                  <option value="yap">YAP Conference</option>
                  <option value="event">Events & Hangouts</option>
                  <option value="course">Premium Courses</option>
                  <option value="mentorship">Mentorship Applications</option>
                  <option value="volunteer">Volunteer Applications</option>
                  <option value="partnership">Partnership Requests</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">
              Regional Command:
            </label>
            <select
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="all">Everywhere (All Locations)</option>
              {uniqueLocations.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">
              Decision Status:
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
              id="status-filter-dropdown"
            >
              <option value="all">Any Status</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Received">Received</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Deferred">Deferred</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">
              Ingestion Date:
            </label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter?.(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">
              Payment Status:
            </label>
            <select
              value={selectedPaymentStatusFilter}
              onChange={(e) => setSelectedPaymentStatusFilter?.(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="all">Any Payment</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">
              Real-time Query Filter:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lookup candidates, states, institution..."
                className="w-full pl-8.5 pr-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl text-xs font-bold focus:bg-white focus:border-[#103D2E] outline-none transition-all text-slate-800 placeholder-slate-400 font-sans"
              />
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>
        </div>

        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
            <p className="text-[10.5px] text-slate-450 font-mono">
              Sync output: <strong className="text-[#103D2E]">{filteredRegistrations.length}</strong> of <strong>{registrations.length}</strong> matching rows.
            </p>
            <button
              onClick={onClearFilters}
              className="text-[10px] text-[#E76F51] hover:underline font-black uppercase tracking-wider cursor-pointer font-mono"
            >
              Reset active filters
            </button>
          </div>
        )}
      </div>

      {/* Primary Datable Layout Grid */}
      <div className="bg-white rounded-[1.5rem] border border-slate-150 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[9.5px] font-black uppercase text-slate-400 tracking-widest font-mono">
                <th className="py-4 px-6">NOMINEE / CONTACT BIO</th>
                <th className="py-4 px-6">PORTAL SOURCE</th>
                <th className="py-4 px-6 text-center">PROGRAM SEGMENT</th>
                <th className="py-4 px-6">REGIONAL LOCATION</th>
                <th className="py-4 px-6 text-center">DECISION STATUS</th>
                <th className="py-4 px-6 text-right">DATE INGESTED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-450">
                    <Users size={32} className="mx-auto text-slate-300 mb-2.5" />
                    <p className="font-bold text-slate-600">No Registry Rows Located</p>
                    <p className="text-slate-400 text-2xs mt-0.5">Try clearing active search queries or register a new member.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const currentStatus = reg.status || "Received";
                  return (
                    <tr 
                      key={reg.id} 
                      onClick={() => onSelectMember(reg)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Nominee name and email */}
                      <td className="py-4 px-6 space-y-1">
                        <p className="font-black text-slate-900 group-hover:text-[#103D2E] transition-colors leading-tight">
                          {reg.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tight font-medium leading-none">
                          {reg.email} • {reg.phone}
                        </p>
                      </td>

                      {/* Portal Source */}
                      <td className="py-4 px-6">
                        {reg.profileType?.startsWith("cii") ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded border bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/15 leading-none">
                            🧡 CII PORTAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded border bg-[#103D2E]/10 text-[#103D2E] border-[#103D2E]/10 leading-none">
                            🎓 RMA PORTAL
                          </span>
                        )}
                      </td>

                      {/* Program badge */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded border max-w-[170px] truncate leading-none ${getProfileBadgeTheme(reg.profileType)}`}>
                          {getProfileLabel(reg.profileType)}
                        </span>
                      </td>

                      {/* Location MapPin */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-slate-800 font-bold whitespace-nowrap leading-none">
                          <MapPin size={10.5} className="text-[#E76F51]" />
                          {reg.location}
                        </div>
                        {reg.batch && (
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[8.5px] font-bold mt-1 max-w-[80px] truncate">
                            {reg.batch}
                          </span>
                        )}
                      </td>

                      {/* Verification Decision Badge */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest rounded border leading-none ${getStatusBadgeColor(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </td>

                      {/* Ingestion Date */}
                      <td className="py-4 px-6 text-right text-slate-400 font-mono text-[10px] font-bold whitespace-nowrap">
                        {new Date(reg.registeredAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Database pagination bar info */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-3.5 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
          <span>Buffer node: Active cache synced partitions</span>
          <span className="font-bold">{filteredRegistrations.length} row registries parsed</span>
        </div>
      </div>

    </div>
  );
}
