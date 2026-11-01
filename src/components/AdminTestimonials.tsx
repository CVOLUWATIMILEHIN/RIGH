import React, { useState, useEffect } from "react";
import { 
  getTestimonials, saveTestimonial, deleteTestimonial, PlatformTestimonial 
} from "../lib/db";
import { 
  saveTestimonialToSupabase, 
  deleteTestimonialFromSupabase, 
  fetchAllCMSFromSupabase 
} from "../lib/supabaseCms";
import { 
  Users, Trash2, CheckCircle2, Star, Plus, Edit2, Play, Pause,
  ChevronUp, ChevronDown, RefreshCw, X, Save, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminTestimonialsProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminTestimonials({ hasWriteAccess, onLogAction }: AdminTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<PlatformTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<PlatformTestimonial | null>(null);
  const [feedback, setFeedback] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formEnabled, setFormEnabled] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Supabase
      const supaData = await fetchAllCMSFromSupabase();
      if (supaData && supaData.testimonials && supaData.testimonials.length > 0) {
        setTestimonials(supaData.testimonials);
        setIsLoading(false);
        return;
      }
      const list = await getTestimonials();
      setTestimonials(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    
    const handleUpdate = () => {
      fetchTestimonials();
    };
    window.addEventListener("rma_testimonials_updated", handleUpdate);
    return () => window.removeEventListener("rma_testimonials_updated", handleUpdate);
  }, []);

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setFormName("");
    setFormRole("");
    setFormQuote("");
    setFormRating(5);
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: PlatformTestimonial) => {
    setEditingTestimonial(t);
    setFormName(t.name);
    setFormRole(t.role);
    setFormQuote(t.quote);
    setFormRating(t.rating || 5);
    setFormEnabled(t.enabled);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRole || !formQuote || !hasWriteAccess) return;

    const targetId = editingTestimonial ? editingTestimonial.id : `testi-${Date.now()}`;
    const nextOrder = editingTestimonial ? editingTestimonial.order : testimonials.length + 1;

    const testimonialData: PlatformTestimonial = {
      id: targetId,
      name: formName.trim(),
      role: formRole.trim(),
      quote: formQuote.trim(),
      rating: formRating,
      enabled: formEnabled,
      order: nextOrder,
      timestamp: editingTestimonial ? editingTestimonial.timestamp : new Date().toISOString()
    };

    try {
      await saveTestimonial(testimonialData);
      setTestimonials(prev => {
        const filtered = prev.filter(t => t.id !== targetId);
        const next = [...filtered, testimonialData];
        return next.sort((a, b) => a.order - b.order);
      });

      // Save to Supabase
      const supaRes = await saveTestimonialToSupabase(testimonialData);
      if (!supaRes.success) {
        setErrorMessage(`Failed saving to Supabase: ${supaRes.error}`);
        onLogAction(`❌ [TESTIMONIALS ERROR] Supabase error: ${supaRes.error}`);
      } else {
        setFeedback(editingTestimonial ? "Testimonial updated in Supabase successfully!" : "New testimonial created in Supabase successfully!");
        onLogAction(`⭐ [TESTIMONIALS] ${editingTestimonial ? "Updated" : "Created"} reviewer in Supabase: ${testimonialData.name}.`);
        setTimeout(() => setFeedback(""), 3500);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed saving testimonial");
    }
  };

  const handleToggleEnabled = async (t: PlatformTestimonial) => {
    if (!hasWriteAccess) return;
    const updated: PlatformTestimonial = { ...t, enabled: !t.enabled };
    try {
      await saveTestimonial(updated);
      await saveTestimonialToSupabase(updated);
      setTestimonials(prev => prev.map(item => item.id === t.id ? updated : item));
      onLogAction(`⭐ [TESTIMONIALS] Set visibility of ${t.name} testimonial to ${updated.enabled ? "ACTIVE" : "INACTIVE"}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveOrder = async (idx: number, direction: "up" | "down") => {
    if (!hasWriteAccess) return;
    const list = [...testimonials];
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === list.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    // Save recalculated orders
    try {
      const reorderedList = list.map((item, i) => ({ ...item, order: i + 1 }));
      setTestimonials(reorderedList);
      
      // Save swap in background
      await saveTestimonial(reorderedList[idx]);
      await saveTestimonial(reorderedList[targetIdx]);
      await saveTestimonialToSupabase(reorderedList[idx]);
      await saveTestimonialToSupabase(reorderedList[targetIdx]);
      
      onLogAction(`⭐ [TESTIMONIALS] Reordered testimonial display ranking indices.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Are you sure you want to delete the testimonial from ${name}?`)) {
      try {
        await deleteTestimonial(id);
        setTestimonials(prev => prev.filter(t => t.id !== id));
        const supaRes = await deleteTestimonialFromSupabase(id);
        if (!supaRes.success) {
          setErrorMessage(`Supabase delete error: ${supaRes.error}`);
        } else {
          setFeedback(`Testimonial from ${name} removed from Supabase.`);
          setTimeout(() => setFeedback(""), 3000);
        }
        onLogAction(`🗑️ [TESTIMONIALS] Removed testimonial reviewer row: ${name}`);
      } catch (e: any) {
        console.error(e);
        setErrorMessage(e.message || "Failed deleting testimonial");
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={18} className="text-[#103D2E]" />
            Alumni Testimonials & Reviews Desk
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-404 block mt-0.5">
            Onboard high-fidelity success testimonials, edit stories, toggle live statuses, and configure visual display order
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchTestimonials}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition duration-150 text-slate-600 cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
          {hasWriteAccess && (
            <button
              onClick={handleOpenCreate}
              className="py-1.5 px-3.5 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 font-extrabold text-2xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={12} className="stroke-[2.5]" />
              Add Testimonial
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center justify-between gap-1.5 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-500 hover:text-rose-700 text-xs font-mono">Dismiss</button>
        </div>
      )}

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-850 font-bold flex items-center gap-1.5 text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid of Testimonials */}
      {isLoading ? (
        <div className="text-center py-20 bg-white border border-slate-150 rounded-2xl text-slate-400 text-2xs font-mono">
          Querying alumni testimonials from Cloud Firestore...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-2xs font-mono">
          No success testimonials recorded. Add your first success story using the Action button above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div 
              key={t.id} 
              className={`bg-white border p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm transition-all duration-150 relative ${
                t.enabled ? "border-slate-150" : "border-slate-200/50 opacity-60 bg-slate-50/50"
              }`}
            >
              {/* Badge for visibility */}
              <span className={`absolute top-4 right-4 text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase border ${
                t.enabled 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}>
                {t.enabled ? "Live" : "Hidden"}
              </span>

              <div className="space-y-3">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      className={i < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs font-semibold text-slate-800 leading-relaxed italic select-all">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <h4 className="text-2xs font-black uppercase text-slate-900 truncate leading-none">{t.name}</h4>
                  <span className="text-[9.5px] font-mono text-slate-400 truncate block mt-1">{t.role}</span>
                </div>
                
                {/* Administration Options */}
                <div className="flex items-center gap-1 shrink-0">
                  {hasWriteAccess && (
                    <>
                      <button
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-[#103D2E] disabled:opacity-30 cursor-pointer"
                        title="Move Up Display Rank"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={index === testimonials.length - 1}
                        className="p-1 text-slate-400 hover:text-[#103D2E] disabled:opacity-30 cursor-pointer"
                        title="Move Down Display Rank"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(t)}
                        className={`p-1 rounded cursor-pointer ${t.enabled ? "text-slate-400 hover:text-amber-600" : "text-[#103D2E] hover:text-emerald-700"}`}
                        title={t.enabled ? "Deactivate Success Story" : "Activate Success Story"}
                      >
                        {t.enabled ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1 text-slate-400 hover:text-[#103D2E] cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
                        title="Delete Story"
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
                  <h3 className="text-2xs font-mono text-[#2ECC71] uppercase tracking-widest font-bold leading-none">TESTIMONIAL DESIGN PANEL</h3>
                  <h4 className="text-sm font-black uppercase text-slate-100 mt-1.5 leading-none">
                    {editingTestimonial ? "Modify Review Dossier" : "Draft Success Testimonial"}
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
                      Alumni Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Chinedu Okafor"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Role / Professional Title:
                    </label>
                    <input
                      type="text"
                      required
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. Lead Dev at Corporate Hub"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Rating Score (Stars):
                    </label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-black uppercase text-slate-600"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                      <option value={3}>⭐⭐⭐ 3 Stars</option>
                      <option value={2}>⭐⭐ 2 Stars</option>
                      <option value={1}>⭐ 1 Star</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Display Status:
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formEnabled}
                          onChange={(e) => setFormEnabled(e.target.checked)}
                          className="accent-[#103D2E] h-4 w-4 rounded"
                        />
                        <span className="font-bold text-2xs uppercase text-slate-700">Publish Immediately on Website</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Testimonial Success Story Narrative (The Quote):
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    placeholder="Write a clear success story outlining strategic benefits and long-term career outcome..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all resize-none leading-relaxed font-medium"
                  />
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
                    {editingTestimonial ? "Save Modifications" : "Publish Testimony"}
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
