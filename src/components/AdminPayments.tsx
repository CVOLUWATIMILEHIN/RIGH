import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  FileText, 
  Eye, 
  RefreshCw, 
  Download,
  Info
} from "lucide-react";
import { Registration, updateRegistration } from "../lib/db";

interface AdminPaymentsProps {
  registrations: Registration[];
  hasWriteAccess: boolean;
  onRefresh: () => void;
  onLogAction: (msg: string) => void;
}

export default function AdminPayments({ registrations, hasWriteAccess, onRefresh, onLogAction }: AdminPaymentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activePayment, setActivePayment] = useState<Registration | null>(null);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Filter registrations that have a payment reference or receipt
  const paymentRegistries = registrations.filter(reg => {
    // Show entries that need verification
    return reg.paymentReference || reg.paymentReceipt || reg.paymentStatus;
  });

  const filteredRegistries = paymentRegistries.filter(reg => {
    const matchesSearch = reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (reg.email && reg.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (reg.paymentReference && reg.paymentReference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const status = reg.paymentStatus || "pending";
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenVerifyModal = (reg: Registration) => {
    setActivePayment(reg);
    setAdminRemarks(reg.notes || "");
  };

  const handleUpdatePaymentStatus = async (approved: boolean) => {
    if (!activePayment) return;
    setIsVerifying(true);
    try {
      const stepStatus = approved ? "verified" : "rejected";
      const userState = approved ? "Enrolled" : "Reviewed";

      onLogAction(`💸 [PAYMENT STATUS UPDATE] Changing payment status for ${activePayment.fullName} to [${stepStatus}]`);

      await updateRegistration(activePayment.id, {
        paymentStatus: stepStatus as any,
        status: userState,
        notes: adminRemarks
      });

      // Secure payment status email dispatch triggers immediately
      try {
        fetch("/api/email/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: stepStatus === "verified" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
            registrationId: activePayment.id,
            payload: {
              ...activePayment,
              notes: adminRemarks
            }
          })
        }).catch(err => console.error("Failed to send payment status notification:", err));
      } catch (err) {}

      onRefresh();
      setActivePayment(null);
    } catch (e) {
      console.error("Error setting payment status:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#103D2E]" />
            Payment Verifications Hub
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-404 block mt-0.5">
            Audit applicant transaction receipts, approve cohorts placements, and flags erroneous references
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={11} />
          Reload Entries
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Payment Registries", value: paymentRegistries.length },
          { label: "Pending Review", value: paymentRegistries.filter(r => (r.paymentStatus || "pending") === "pending").length },
          { label: "Verified & Approved", value: paymentRegistries.filter(r => r.paymentStatus === "verified").length },
          { label: "Rejected / Flagged", value: paymentRegistries.filter(r => (r.paymentStatus as any) === "rejected").length }
        ].map((met, idx) => (
          <div key={idx} className="bg-white p-4 font-sans rounded-xl border border-slate-150 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{met.label}</span>
            <span className="text-lg font-black text-slate-905 font-display mt-1 block leading-none">{met.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#103D2E]/40 focus:bg-white rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Applicant Name & Cohort</th>
                <th className="py-4 px-3">State / Target Code</th>
                <th className="py-4 px-3">Transaction Reference</th>
                <th className="py-4 px-3">Plan selected</th>
                <th className="py-4 px-3">Audit status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredRegistries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No payment registries requiring verification matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRegistries.map((reg) => {
                  const payStatus = (reg.paymentStatus || "pending") as any;
                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-900">{reg.fullName}</p>
                        <p className="text-[10px] text-slate-450 font-mono lowercase mt-0.5">{reg.email}</p>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-700">{reg.location || "N/A"}</td>
                      <td className="py-4 px-3 font-mono font-bold text-slate-800">
                        {reg.paymentReference ? (
                          <span className="bg-slate-50 border border-slate-100 py-0.5 px-2 rounded text-[10px] break-all">
                            {reg.paymentReference}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Reference ID</span>
                        )}
                      </td>
                      <td className="py-4 px-3 capitalize font-bold text-slate-600">
                        {reg.planType || "Free Orientation"}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 font-bold rounded text-[9px] tracking-wide uppercase ${
                          payStatus === "verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : payStatus === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {payStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenVerifyModal(reg)}
                          className="px-3 py-1.5 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-black rounded-lg text-[9px] uppercase tracking-wider cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <Eye size={11} />
                          Inspect Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Receipt Modal Overlay */}
      {activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActivePayment(null)} />
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp text-left">
            
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-black uppercase text-slate-800">
                Payment Audit dossier for: {activePayment.fullName}
              </h3>
              <button onClick={() => setActivePayment(null)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
              
              {/* Left Column: Details & Receipt Screen */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-black uppercase text-slate-400 tracking-wider">Applicant Program Pathway:</span>
                  <p className="text-xs font-bold text-slate-800 capitalize bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {activePayment.profileType?.replace("cii-", "CII ") || "RMA General Participant"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-black uppercase text-slate-400 tracking-wider font-bold">Transaction reference code:</span>
                  <p className="text-xs font-mono font-black text-rose-800 bg-rose-50/40 p-2.5 rounded-xl border border-rose-100/50">
                    {activePayment.paymentReference || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-105 rounded-xl text-blue-750 flex gap-2 text-2xs font-medium">
                  <Info size={14} className="shrink-0 text-blue-600" />
                  <div>
                    <span className="font-extrabold block mb-0.5">Payment Verification Rules</span>
                    Verify bank settlement codes against Sellar or Paystack spreadsheets. Set notes on rejection.
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400">Dossier Internal Remarks / Notes:</label>
                  <textarea
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Provide details if rejecting, e.g. 'Reference ID invalid. Please re-upload proof of payment.'"
                    className="w-full p-2.5 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-xl focus:bg-white outline-none resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Screenshot upload proof view */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-404 mb-1">Uploaded Screenshot Ledger:</span>
                  
                  <div className="aspect-[4/5] bg-slate-900 border-2 border-slate-200 rounded-2xl overflow-hidden relative flex items-center justify-center">
                    {activePayment.paymentReceipt ? (
                      <img 
                        src={activePayment.paymentReceipt} 
                        alt="Proof of payment screenshot receipt uploaded by member"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-2xs space-y-2">
                        <span>📷</span>
                        <p className="font-bold uppercase tracking-wider text-slate-400">No screenshot receipt uploaded</p>
                        <p className="font-normal text-slate-600 text-[10px]">Reference code verification is required solely.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Actions */}
                {hasWriteAccess ? (
                  <div className="flex gap-2 pt-4 border-t border-slate-100 text-2xs font-extrabold uppercase">
                    <button
                      disabled={isVerifying}
                      onClick={() => handleUpdatePaymentStatus(false)}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X size={12} className="stroke-[2.5]" />
                      Flag / Reject
                    </button>
                    <button
                      disabled={isVerifying}
                      onClick={() => handleUpdatePaymentStatus(true)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10"
                    >
                      <Check size={12} className="stroke-[2.5]" />
                      Approve & Enroll
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 text-2xs rounded-xl font-bold">
                    🛡️ Viewer Role Lock: You do not hold Operational Auth clearance to set payment marks.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
