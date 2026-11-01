import React, { useState, useEffect } from "react";
import { 
  getPartners, savePartner, deletePartner, PlatformPartner 
} from "../lib/db";
import { 
  Briefcase, Trash2, CheckCircle2, Link2, Plus, Edit2, Play, Pause,
  ChevronUp, ChevronDown, RefreshCw, X, Save, Image
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPartnersProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminPartners({ hasWriteAccess, onLogAction }: AdminPartnersProps) {
  const [partners, setPartners] = useState<PlatformPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PlatformPartner | null>(null);
  const [feedback, setFeedback] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formLogo, setFormLogo] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formPartnershipType, setFormPartnershipType] = useState("Corporate Sponsor");
  const [formEnabled, setFormEnabled] = useState(true);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const list = await getPartners();
      setPartners(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    
    const handleUpdate = () => {
      fetchPartners();
    };
    window.addEventListener("rma_partners_updated", handleUpdate);
    return () => window.removeEventListener("rma_partners_updated", handleUpdate);
  }, []);

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setFormName("");
    setFormLogo("");
    setFormWebsite("");
    setFormPartnershipType("Corporate Sponsor");
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PlatformPartner) => {
    setEditingPartner(p);
    setFormName(p.name);
    setFormLogo(p.logo || "");
    setFormWebsite(p.website || "");
    setFormPartnershipType(p.partnershipType || "Corporate Sponsor");
    setFormEnabled(p.enabled);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !hasWriteAccess) return;

    const targetId = editingPartner ? editingPartner.id : `partner-${Date.now()}`;
    const nextOrder = editingPartner ? editingPartner.order : partners.length + 1;

    const partnerData: PlatformPartner = {
      id: targetId,
      name: formName.trim(),
      logo: formLogo.trim() || null,
      website: formWebsite.trim() || "https://",
      partnershipType: formPartnershipType,
      enabled: formEnabled,
      order: nextOrder,
      timestamp: editingPartner ? editingPartner.timestamp : new Date().toISOString()
    };

    try {
      await savePartner(partnerData);
      setPartners(prev => {
        const filtered = prev.filter(p => p.id !== targetId);
        const next = [...filtered, partnerData];
        return next.sort((a, b) => a.order - b.order);
      });
      setIsModalOpen(false);
      setFeedback(editingPartner ? "Partner updated successfully!" : "New partner created successfully!");
      onLogAction(`🤝 [PARTNERS] ${editingPartner ? "Updated" : "Created"} partner catalog entry: ${partnerData.name}.`);
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEnabled = async (p: PlatformPartner) => {
    if (!hasWriteAccess) return;
    const updated: PlatformPartner = { ...p, enabled: !p.enabled };
    try {
      await savePartner(updated);
      setPartners(prev => prev.map(item => item.id === p.id ? updated : item));
      onLogAction(`🤝 [PARTNERS] Set visibility of ${p.name} partnership to ${updated.enabled ? "ACTIVE" : "INACTIVE"}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveOrder = async (idx: number, direction: "up" | "down") => {
    if (!hasWriteAccess) return;
    const list = [...partners];
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === list.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    // Save recalculated orders
    try {
      const reorderedList = list.map((item, i) => ({ ...item, order: i + 1 }));
      setPartners(reorderedList);
      
      // Save swap in Firestore background
      await savePartner(reorderedList[idx]);
      await savePartner(reorderedList[targetIdx]);
      
      onLogAction(`🤝 [PARTNERS] Re-ordered display hierarchy for sponsor and partners banner.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Are you sure you want to delete the partner association with ${name}?`)) {
      try {
        await deletePartner(id);
        setPartners(prev => prev.filter(p => p.id !== id));
        onLogAction(`🗑️ [PARTNERS] Removed partner listing row: ${name}`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase size={18} className="text-[#103D2E]" />
            Sponsors & Institutional Partners Directory
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-404 block mt-0.5">
            Administer relationships with companies, agencies, and non-profits sponsoring training and career incubation pipelines
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchPartners}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition duration-150 text-slate-600 cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
          {hasWriteAccess && (
            <button
              onClick={handleOpenCreate}
              className="py-1.5 px-3.5 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 font-extrabold text-2xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={12} className="stroke-[2.5]" />
              Add Partner
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-850 font-bold flex items-center gap-1.5 text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid of Partners */}
      {isLoading ? (
        <div className="text-center py-20 bg-white border border-slate-150 rounded-2xl text-slate-400 text-2xs font-mono">
          Querying partner matrix logs from Cloud Firestore...
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-2xs font-mono">
          No registered partner credentials present. Onboard corporate partners using the Action option above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p, index) => (
            <div 
              key={p.id} 
              className={`bg-white border p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm transition-all duration-150 relative ${
                p.enabled ? "border-slate-150" : "border-slate-200/50 opacity-60 bg-slate-50/50"
              }`}
            >
              {/* Status Badge */}
              <span className={`absolute top-4 right-4 text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase border ${
                p.enabled 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}>
                {p.enabled ? "Active" : "Hidden"}
              </span>

              <div className="flex gap-4 items-center">
                {/* Logo mock/preview */}
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center overflow-hidden text-slate-400 shrink-0">
                  {p.logo ? (
                    <img src={p.logo} alt={p.name} className="object-contain h-full w-full" onError={(e)=>{(e.target as HTMLElement).style.display='none'}} />
                  ) : (
                    <Briefcase size={20} className="text-slate-350" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-black uppercase text-slate-900 truncate leading-tight">{p.name}</h3>
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block mt-1">
                    {p.partnershipType}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center gap-3">
                <a 
                  href={p.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-2xs font-mono font-bold text-[#103D2E] hover:underline flex items-center gap-1 min-w-0 truncate"
                >
                  <Link2 size={10} className="shrink-0" />
                  <span className="truncate">{p.website.replace("https://", "").replace("http://", "")}</span>
                </a>

                {/* Administrative Operations */}
                <div className="flex items-center gap-1 shrink-0">
                  {hasWriteAccess && (
                    <>
                      <button
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-[#103D2E] disabled:opacity-30 cursor-pointer"
                        title="Increase display precedence"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={index === partners.length - 1}
                        className="p-1 text-slate-400 hover:text-[#103D2E] disabled:opacity-30 cursor-pointer"
                        title="Decrease display precedence"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(p)}
                        className={`p-1 rounded cursor-pointer ${p.enabled ? "text-slate-400 hover:text-amber-600" : "text-[#103D2E] hover:text-emerald-700"}`}
                        title={p.enabled ? "Temporarily Deactivate Partner" : "Activate Partner Listing"}
                      >
                        {p.enabled ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1 text-slate-400 hover:text-[#103D2E] cursor-pointer"
                        title="Edit Info"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
                        title="Delete Relationship"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal Popup Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-lg w-full overflow-hidden text-slate-800"
            >
              <div className="bg-[#0A1A14] p-5 text-white flex justify-between items-center border-b border-[#143127]">
                <div>
                  <h3 className="text-2xs font-mono text-[#2ECC71] uppercase tracking-widest font-bold leading-none">PARTNERSHIP COORDINATION PANEL</h3>
                  <h4 className="text-sm font-black uppercase text-slate-100 mt-1.5 leading-none">
                    {editingPartner ? "Modify Partner Credentials" : "Register Sponsoring Partner"}
                  </h4>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Partner / Institution Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Sterling Bank Plc"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Partnership Category:
                    </label>
                    <select
                      value={formPartnershipType}
                      onChange={(e) => setFormPartnershipType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-black uppercase text-slate-600"
                    >
                      <option value="Corporate Sponsor">🏢 Corporate Sponsor</option>
                      <option value="NGO Partner">🌸 NGO Partner</option>
                      <option value="Government Agency">🏛️ Government Agency</option>
                      <option value="Educational Institution">🎓 Educational Partner</option>
                      <option value="Regional Chapter">📍 Regional Chapter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Website URL Address:
                    </label>
                    <input
                      type="url"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      placeholder="https://sterling.ng"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Logo Image Link URL:
                    </label>
                    <input
                      type="url"
                      value={formLogo}
                      onChange={(e) => setFormLogo(e.target.value)}
                      placeholder="https://domain.com/logo.png"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Publish immediately:
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="accent-[#103D2E] h-4 w-4 rounded"
                    />
                    <span className="font-bold text-2xs uppercase text-slate-700">Display Live in Logo Marquee Banners</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-extrabold uppercase tracking-wider text-2xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 rounded-xl text-2xs uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={12} />
                    {editingPartner ? "Save Modifications" : "Publish Listing"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
