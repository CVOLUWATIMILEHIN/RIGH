import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Eye,
  Calendar,
  Clock,
  BarChart2,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  MousePointerClick,
  Monitor,
  Smartphone,
  Info
} from "lucide-react";
import { getWebsitePopups, saveWebsitePopup, deleteWebsitePopup, TEEN_BOOTCAMP_POPUP, YAP_CONFERENCE_POPUP } from "../lib/db";
import { WebsitePopup } from "../types";
import yapConferenceFlyer from "../assets/images/yap_conference_2026_flyer.png";
import teenBootcampFlyer from "../assets/images/teen_bootcamp_2026_flyer.png";

interface AdminWebsitePopupsProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminWebsitePopups({ hasWriteAccess, onLogAction }: AdminWebsitePopupsProps) {
  const [popups, setPopups] = useState<WebsitePopup[]>([]);
  const [selectedPopup, setSelectedPopup] = useState<WebsitePopup | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [feedback, setFeedback] = useState("");
  const [imageInputMethod, setImageInputMethod] = useState<"upload" | "url" | "preset">("upload");

  useEffect(() => {
    loadPopups();
    const handleUpdate = () => loadPopups();
    window.addEventListener("rma_website_popups_updated", handleUpdate);
    return () => window.removeEventListener("rma_website_popups_updated", handleUpdate);
  }, []);

  const loadPopups = async () => {
    try {
      const list = await getWebsitePopups();
      setPopups(list);
      if (list.length > 0 && !selectedPopup) {
        setSelectedPopup(list[0]);
      } else if (selectedPopup) {
        // preserve updated version of current selected
        const updated = list.find((p) => p.id === selectedPopup.id);
        if (updated) setSelectedPopup(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNew = () => {
    const newPopup: WebsitePopup = {
      id: `pop-${Date.now()}`,
      title: "New Promotional Campaign",
      description: "Brief campaign announcement or promotional message for website visitors.",
      bannerImage: "teen_bootcamp_2026_flyer.png",
      buttonText: "Register Now",
      buttonLink: "teen-bootcamp",
      startDate: new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + "T23:59:59.000Z",
      priority: "Medium",
      active: true,
      displayRule: "every_visit",
      viewsCount: 0,
      clicksCount: 0,
      dismissesCount: 0,
      updatedAt: new Date().toISOString()
    };
    setSelectedPopup(newPopup);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPopup || !hasWriteAccess) return;

    try {
      const popupToSave = {
        ...selectedPopup,
        updatedAt: new Date().toISOString()
      };
      await saveWebsitePopup(popupToSave);
      onLogAction(`📢 [POPUP MANAGER] Saved website popup "${popupToSave.title}"`);
      setFeedback("Popup saved and synced across website in real-time!");
      setIsEditing(false);
      loadPopups();
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      console.error(err);
      setFeedback("Error saving popup configuration");
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasWriteAccess) return;
    if (confirm("Are you sure you want to delete this promotional popup campaign?")) {
      await deleteWebsitePopup(id);
      onLogAction(`🗑️ [POPUP MANAGER] Deleted popup ID: ${id}`);
      setFeedback("Popup campaign deleted.");
      if (selectedPopup?.id === id) {
        setSelectedPopup(null);
        setIsEditing(false);
      }
      loadPopups();
      setTimeout(() => setFeedback(""), 3500);
    }
  };

  const handleToggleActive = async (popup: WebsitePopup) => {
    if (!hasWriteAccess) return;
    const updated = { ...popup, active: !popup.active, updatedAt: new Date().toISOString() };
    await saveWebsitePopup(updated);
    onLogAction(`⚡ [POPUP MANAGER] Toggled active state for "${popup.title}" to ${updated.active}`);
    loadPopups();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPopup) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be smaller than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64Data = evt.target?.result as string;
      setSelectedPopup({
        ...selectedPopup,
        bannerImage: base64Data
      });
      onLogAction(`📤 [POPUP MANAGER] Uploaded new flyer image for "${selectedPopup.title}"`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const resolveImage = (imgUrl?: string) => {
    if (!imgUrl) return yapConferenceFlyer;
    if (
      imgUrl === "yap_conference_2026_flyer.png" ||
      imgUrl === "YAP B.png" ||
      imgUrl.toLowerCase().includes("yap") ||
      imgUrl.toLowerCase().includes("purposeful")
    ) {
      return yapConferenceFlyer;
    }
    if (imgUrl === "teen_bootcamp_2026_flyer.png" || imgUrl.includes("teen_bootcamp") || imgUrl.toLowerCase().includes("teen")) {
      return teenBootcampFlyer;
    }
    return imgUrl;
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-[#103D2E]" />
            Website Promotional Popup System
          </h2>
          <span className="text-xs font-mono text-slate-400 block mt-0.5">
            Configure promotional popups, upload flyers, schedule display dates, set page rules, and track real-time analytics
          </span>
        </div>

        {hasWriteAccess && (
          <button
            onClick={handleCreateNew}
            type="button"
            className="px-4 py-2 bg-[#103D2E] hover:bg-[#0c2e22] text-amber-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Plus size={14} />
            Create New Popup
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2 text-xs shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Container: Left List / Editor & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Campaigns List & Edit Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Campaigns Card List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-[#103D2E]" />
                Configured Popups ({popups.length})
              </h3>
            </div>

            <div className="space-y-3">
              {popups.map((popup) => {
                const isSelected = selectedPopup?.id === popup.id;
                const views = popup.viewsCount || 0;
                const clicks = popup.clicksCount || 0;
                const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

                return (
                  <div
                    key={popup.id}
                    onClick={() => {
                      setSelectedPopup(popup);
                      setIsEditing(false);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "border-[#103D2E] bg-emerald-50/30 ring-2 ring-[#103D2E]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        <img
                          src={resolveImage(popup.bannerImage)}
                          alt={popup.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 leading-snug">
                            {popup.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono rounded-full ${
                              popup.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {popup.active ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {popup.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                          <span>👁️ {views} Views</span>
                          <span>🖱️ {clicks} Clicks</span>
                          <span className="text-emerald-700 font-bold">🎯 {ctr}% CTR</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(popup);
                        }}
                        type="button"
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                          popup.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {popup.active ? "Disable" : "Enable"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPopup(popup);
                          setIsEditing(true);
                        }}
                        type="button"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                        title="Edit Popup Details"
                      >
                        <Edit2 size={13} />
                      </button>

                      {popup.id !== "pop-teen-bootcamp-2026" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(popup.id);
                          }}
                          type="button"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                          title="Delete Popup"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Editor Card */}
          {selectedPopup && (
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Edit2 size={15} className="text-[#103D2E]" />
                  Edit Campaign: {selectedPopup.title}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">ID: {selectedPopup.id}</span>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Title & Description */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                    Popup Campaign Title:
                  </label>
                  <input
                    type="text"
                    value={selectedPopup.title}
                    onChange={(e) => setSelectedPopup({ ...selectedPopup, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#103D2E] font-bold"
                    placeholder="e.g. Right-Minds Teen Leadership Bootcamp 2026"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                    Description Body Text:
                  </label>
                  <textarea
                    rows={3}
                    value={selectedPopup.description}
                    onChange={(e) => setSelectedPopup({ ...selectedPopup, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#103D2E] leading-relaxed resize-none"
                    placeholder="Describe the campaign or offer for website visitors..."
                  />
                </div>

                {/* Flyer Image Selection */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-black uppercase text-slate-600 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#103D2E]" />
                      Promotional Flyer Image
                    </label>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("upload")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          imageInputMethod === "upload" ? "bg-[#103D2E] text-amber-300 font-bold" : "text-slate-500"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("url")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          imageInputMethod === "url" ? "bg-[#103D2E] text-amber-300 font-bold" : "text-slate-500"
                        }`}
                      >
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("preset")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          imageInputMethod === "preset" ? "bg-[#103D2E] text-amber-300 font-bold" : "text-slate-500"
                        }`}
                      >
                        Preset Flyer
                      </button>
                    </div>
                  </div>

                  {imageInputMethod === "upload" && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#103D2E] file:text-amber-300 hover:file:bg-[#0c2e22] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Supports JPG, PNG, WebP up to 8MB. Converts automatically for cloud storage.
                      </span>
                    </div>
                  )}

                  {imageInputMethod === "url" && (
                    <input
                      type="text"
                      value={selectedPopup.bannerImage}
                      onChange={(e) => setSelectedPopup({ ...selectedPopup, bannerImage: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      placeholder="Paste image URL (http://... or https://...)"
                    />
                  )}

                  {imageInputMethod === "preset" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPopup({
                            ...selectedPopup,
                            bannerImage: "yap_conference_2026_flyer.png"
                          })
                        }
                        className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedPopup.bannerImage === "yap_conference_2026_flyer.png"
                            ? "bg-[#103D2E] text-amber-300 border-[#103D2E]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#103D2E]"
                        }`}
                      >
                        ✨ YAP Conference 2026 Flyer
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPopup({
                            ...selectedPopup,
                            bannerImage: "teen_bootcamp_2026_flyer.png"
                          })
                        }
                        className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedPopup.bannerImage === "teen_bootcamp_2026_flyer.png"
                            ? "bg-[#103D2E] text-amber-300 border-[#103D2E]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#103D2E]"
                        }`}
                      >
                        🎯 Teen Leadership Bootcamp 2026 Flyer
                      </button>
                    </div>
                  )}

                  {/* Image Preview Box */}
                  <div className="relative w-full h-32 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                    <img
                      src={resolveImage(selectedPopup.bannerImage)}
                      alt="Flyer Preview"
                      className="h-full w-auto object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                      Image Preview
                    </div>
                  </div>
                </div>

                {/* Button & Destination Redirect URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      CTA Button Text:
                    </label>
                    <input
                      type="text"
                      value={selectedPopup.buttonText}
                      onChange={(e) => setSelectedPopup({ ...selectedPopup, buttonText: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-[#103D2E]"
                      placeholder="e.g. Register Today (₦50,000)"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      Destination Redirect Link / View:
                    </label>
                    <input
                      type="text"
                      value={selectedPopup.buttonLink}
                      onChange={(e) => setSelectedPopup({ ...selectedPopup, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                      placeholder="e.g. teen-bootcamp or /teenager or https://..."
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["teen-bootcamp", "/teenager", "student", "corps_member"].map((path) => (
                        <button
                          key={path}
                          type="button"
                          onClick={() => setSelectedPopup({ ...selectedPopup, buttonLink: path })}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[9.5px] font-mono text-slate-600 cursor-pointer"
                        >
                          {path}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Display Frequency Rule & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      Display Frequency:
                    </label>
                    <select
                      value={selectedPopup.displayRule}
                      onChange={(e) =>
                        setSelectedPopup({
                          ...selectedPopup,
                          displayRule: e.target.value as any
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    >
                      <option value="every_visit">Every Visit / Reload</option>
                      <option value="once_per_visitor">Once Per Visitor</option>
                      <option value="daily">Daily (Every 24 Hours)</option>
                      <option value="only_homepage">Only Homepage On Reload</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      Priority Level:
                    </label>
                    <select
                      value={selectedPopup.priority}
                      onChange={(e) =>
                        setSelectedPopup({
                          ...selectedPopup,
                          priority: e.target.value as any
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      Status:
                    </label>
                    <select
                      value={selectedPopup.active ? "true" : "false"}
                      onChange={(e) =>
                        setSelectedPopup({
                          ...selectedPopup,
                          active: e.target.value === "true"
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    >
                      <option value="true">Active (Enabled)</option>
                      <option value="false">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>

                {/* Schedule Start & End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      Schedule Start Date:
                    </label>
                    <input
                      type="date"
                      value={selectedPopup.startDate ? selectedPopup.startDate.slice(0, 10) : ""}
                      onChange={(e) =>
                        setSelectedPopup({
                          ...selectedPopup,
                          startDate: e.target.value ? new Date(e.target.value).toISOString() : ""
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-slate-500 mb-1">
                      Schedule End Date:
                    </label>
                    <input
                      type="date"
                      value={selectedPopup.endDate ? selectedPopup.endDate.slice(0, 10) : ""}
                      onChange={(e) =>
                        setSelectedPopup({
                          ...selectedPopup,
                          endDate: e.target.value ? new Date(e.target.value).toISOString() : ""
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {hasWriteAccess && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#103D2E] hover:bg-[#0c2e22] text-amber-300 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <Save size={14} />
                      <span>Save & Sync Popup</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Live Simulator Preview & Analytics Panel */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          {/* Live Simulator Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <Eye size={16} className="text-[#103D2E]" />
                Live Preview Simulator
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer ${
                    previewMode === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Monitor size={12} />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer ${
                    previewMode === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Smartphone size={12} />
                  Mobile
                </button>
              </div>
            </div>

            {/* Simulated Modal Wrapper */}
            <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-center min-h-[420px]">
              {selectedPopup ? (
                <div
                  className={`bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 transition-all ${
                    previewMode === "mobile" ? "w-[280px]" : "w-full max-w-md"
                  }`}
                >
                  {/* Flyer Banner Image */}
                  <div className="relative w-full bg-slate-900 overflow-hidden flex items-center justify-center max-h-[220px]">
                    <img
                      src={resolveImage(selectedPopup.bannerImage)}
                      alt="Preview"
                      className="w-full h-auto max-h-[220px] object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 font-mono font-black text-[8px] uppercase px-2 py-0.5 rounded-full">
                      ✨ RMA SPECIAL EVENT
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 text-left">
                    <h4 className="font-display font-black text-sm uppercase text-slate-900 leading-tight">
                      {selectedPopup.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {selectedPopup.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Dismiss</span>
                      <div className="px-4 py-2 bg-[#103D2E] text-amber-300 font-black text-[10px] uppercase rounded-xl shadow-xs">
                        {selectedPopup.buttonText || "View Details"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Select a popup to view live preview</span>
              )}
            </div>
          </div>

          {/* Analytics Summary */}
          {selectedPopup && (
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-[#103D2E]" />
                Analytics Performance
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-[9px] font-mono font-black uppercase text-slate-400 block">
                    Views
                  </span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {selectedPopup.viewsCount || 0}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-[9px] font-mono font-black uppercase text-slate-400 block">
                    Clicks
                  </span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {selectedPopup.clicksCount || 0}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150">
                  <span className="text-[9px] font-mono font-black uppercase text-emerald-800 block">
                    CTR Rate
                  </span>
                  <span className="text-base font-black text-emerald-900 mt-0.5 block">
                    {(selectedPopup.viewsCount || 0) > 0
                      ? (((selectedPopup.clicksCount || 0) / (selectedPopup.viewsCount || 1)) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
