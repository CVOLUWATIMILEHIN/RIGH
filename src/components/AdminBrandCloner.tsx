import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Palette, 
  Globe, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { 
  useBrandConfig, 
  BrandConfig, 
  BRAND_PRESETS, 
  exportBrandConfigJSON, 
  importBrandConfigJSON 
} from "../lib/brandConfig";

interface AdminBrandClonerProps {
  isSuperAdmin: boolean;
  onLogAction: (msg: string) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AdminBrandCloner({
  isSuperAdmin,
  onLogAction,
  onNotify
}: AdminBrandClonerProps) {
  const { brand, updateBrand, resetBrand } = useBrandConfig();
  const [activeSubTab, setActiveSubTab] = useState<"customizer" | "presets" | "guide" | "export">("customizer");
  const [formData, setFormData] = useState<BrandConfig>(brand);
  const [isCopied, setIsCopied] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Sync form data whenever brand changes from external sources
  React.useEffect(() => {
    setFormData(brand);
  }, [brand]);

  const handleInputChange = (field: keyof BrandConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand(formData);
    onNotify(`Brand configuration saved! Portal rebranded as "${formData.brandName}"`, "success");
    onLogAction(`🎨 [BRAND] Rebranded platform identity to "${formData.brandName}" (${formData.brandAcronym})`);
  };

  const handleApplyPreset = (presetId: string) => {
    const found = BRAND_PRESETS.find(p => p.id === presetId);
    if (!found) return;
    const merged: BrandConfig = {
      ...formData,
      ...found.config,
      socialLinks: {
        ...formData.socialLinks,
        ...(found.config.socialLinks || {})
      }
    };
    setFormData(merged);
    updateBrand(merged);
    onNotify(`Applied brand preset: ${found.name}`, "success");
    onLogAction(`🎨 [BRAND] Applied preset template: ${found.name}`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onNotify("Image size exceeds 2MB limit. Please upload a smaller logo.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
        onNotify("New brand logo uploaded and prepared for preview.", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadConfig = () => {
    const jsonStr = exportBrandConfigJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand.config.${formData.brandAcronym.toLowerCase() || "portal"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify("Exported brand configuration package!", "success");
    onLogAction(`📦 [EXPORT] Downloaded brand configuration package for ${formData.brandName}`);
  };

  const handleDownloadGuide = () => {
    window.open("/STANDALONE_CLONE_GUIDE.md", "_blank");
    onNotify("Opening Standalone Clone Guide...", "info");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importBrandConfigJSON(text);
        setFormData(imported);
        onNotify(`Successfully imported brand profile: ${imported.brandName}`, "success");
        onLogAction(`📥 [IMPORT] Imported brand configuration for ${imported.brandName}`);
      } catch (err: any) {
        onNotify(err.message || "Failed to parse brand configuration file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyJson = () => {
    const jsonStr = exportBrandConfigJSON();
    navigator.clipboard.writeText(jsonStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onNotify("Brand JSON copied to clipboard!", "info");
  };

  const handleWipeDemoData = () => {
    if (!isSuperAdmin) {
      onNotify("Only Super Administrators can perform a database clean slate.", "error");
      return;
    }
    // Clean demo registrations from local cache
    try {
      localStorage.removeItem("rma_registrations_cache");
      localStorage.removeItem("rma_visitor_checkins");
      localStorage.removeItem("rma_backup_points");
      onNotify("Demo records wiped clean! Ready for new brand onboarding.", "success");
      onLogAction("🧹 [CLEAN SLATE] Super Admin cleared demo candidate records for new brand launch.");
      setIsWipeConfirmOpen(false);
    } catch (e) {
      onNotify("Failed to wipe local cache records.", "error");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Feature Callout */}
      <div className="bg-[#0A1A14] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#133F31] via-[#0A1A14] to-[#040C0A] text-white p-6 sm:p-8 rounded-[2rem] border border-[#152e25] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-700/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="space-y-2 text-left relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/20 text-[10px] font-black tracking-widest uppercase">
            <Sparkles size={11} className="text-amber-400" />
            STANDALONE CLONE & WHITE-LABEL ENGINE
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-slate-100 uppercase">
            Brand Cloner & Standalone Setup Hub
          </h2>
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            Duplicate and configure this entire enterprise CMS, LMS Academy, and Operations Portal for any brand, company, or institution in minutes. Export turnkey brand profiles, connect an independent database, and deploy standalone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 relative z-10 w-full sm:w-auto shrink-0">
          <button
            onClick={handleDownloadConfig}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-2xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Download size={13} />
            Export Brand JSON
          </button>
          <a
            href="/STANDALONE_CLONE_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl text-2xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/10"
          >
            <FileText size={13} />
            Clone Guide (.md)
          </a>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-150 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab("customizer")}
          className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "customizer" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Palette size={13} />
          Live Brand Customizer
        </button>
        <button
          onClick={() => setActiveSubTab("presets")}
          className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "presets" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 size={13} />
          Brand Presets & Templates
        </button>
        <button
          onClick={() => setActiveSubTab("guide")}
          className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "guide" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers size={13} />
          Standalone Clone Checklist
        </button>
        <button
          onClick={() => setActiveSubTab("export")}
          className={`px-4 py-2 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "export" ? "bg-[#103D2E] text-amber-300 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Copy size={13} />
          Export / Import & Reset
        </button>
      </div>

      {/* 1. Brand Customizer Tab */}
      {activeSubTab === "customizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form on left (2 cols) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Brand Identity Parameters
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Customize your organization's name, logos, theme colors, and contacts. Changes update in real-time.
              </p>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-5">
              {/* Row 1: Brand Name, Short Name, Acronym */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Brand Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => handleInputChange("brandName", e.target.value)}
                    placeholder="e.g. Brainbench Technology"
                    required
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-semibold text-slate-800 outline-none bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Short Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brandShortName}
                    onChange={(e) => handleInputChange("brandShortName", e.target.value)}
                    placeholder="e.g. Brainbench"
                    required
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-semibold text-slate-800 outline-none bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Acronym / Code *
                  </label>
                  <input
                    type="text"
                    value={formData.brandAcronym}
                    onChange={(e) => handleInputChange("brandAcronym", e.target.value)}
                    placeholder="e.g. BBT"
                    required
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-mono font-bold text-slate-800 outline-none bg-slate-50/50 uppercase"
                  />
                </div>
              </div>

              {/* Row 2: Subtitle & Portal Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Brand Subtitle Badge (Navbar & Footer)
                  </label>
                  <input
                    type="text"
                    value={formData.brandSubTitle}
                    onChange={(e) => handleInputChange("brandSubTitle", e.target.value)}
                    placeholder="e.g. CREATIVE & TECH LAB"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-semibold text-slate-800 outline-none bg-slate-50/50 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Admin Portal Badge Title
                  </label>
                  <input
                    type="text"
                    value={formData.portalTitle}
                    onChange={(e) => handleInputChange("portalTitle", e.target.value)}
                    placeholder="e.g. OPERATIONS CENTRE"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-semibold text-slate-800 outline-none bg-slate-50/50 uppercase"
                  />
                </div>
              </div>

              {/* Row 3: Tagline */}
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                  Tagline / Mission Statement
                </label>
                <textarea
                  rows={2}
                  value={formData.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  placeholder="Summarize your brand's core mission or value proposition..."
                  className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-medium text-slate-800 outline-none bg-slate-50/50 resize-none"
                />
              </div>

              {/* Row 4: Logo Upload & URL */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-700 font-mono tracking-wider">
                    Brand Logo Asset
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-2xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Upload size={11} />
                    Upload Image
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                    <img 
                      src={formData.logoUrl} 
                      alt="Brand preview" 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                      placeholder="Paste image URL or data URI..."
                      className="w-full p-2 border border-slate-200 focus:border-[#103D2E] rounded-lg text-[10px] font-mono text-slate-700 outline-none bg-white"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Supports PNG, JPG, SVG, or Base64 data URLs up to 2MB.</span>
                  </div>
                </div>
              </div>

              {/* Row 5: Theme Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Primary Color (Dark/Forest)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Accent Color (Amber/Highlight)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange("accentColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange("accentColor", e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Secondary Color (Emerald/Tech)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Official Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Support / Inbound Email *
                  </label>
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => handleInputChange("supportEmail", e.target.value)}
                    placeholder="contact@yourbrand.com"
                    required
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-semibold text-slate-800 outline-none bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                    Official Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.supportPhone}
                    onChange={(e) => handleInputChange("supportPhone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-semibold text-slate-800 outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 7: Physical Address */}
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                  Headquarters / Operating Locations
                </label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => handleInputChange("officeAddress", e.target.value)}
                  placeholder="City, State, Country"
                  className="w-full p-2.5 border border-slate-200 focus:border-[#103D2E] rounded-xl text-xs font-medium text-slate-800 outline-none bg-slate-50/50"
                />
              </div>

              {/* Row 8: Social Links */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-700 font-mono tracking-wider block">
                  Social Channels & Handles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.socialLinks?.twitter || ""}
                    onChange={(e) => handleSocialChange("twitter", e.target.value)}
                    placeholder="X / Twitter URL"
                    className="p-2 border border-slate-200 rounded-lg text-2xs text-slate-700 outline-none bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={formData.socialLinks?.linkedin || ""}
                    onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                    placeholder="LinkedIn Company URL"
                    className="p-2 border border-slate-200 rounded-lg text-2xs text-slate-700 outline-none bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={formData.socialLinks?.instagram || ""}
                    onChange={(e) => handleSocialChange("instagram", e.target.value)}
                    placeholder="Instagram URL"
                    className="p-2 border border-slate-200 rounded-lg text-2xs text-slate-700 outline-none bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={formData.socialLinks?.whatsapp || ""}
                    onChange={(e) => handleSocialChange("whatsapp", e.target.value)}
                    placeholder="WhatsApp Direct Link (e.g. https://wa.me/...)"
                    className="p-2 border border-slate-200 rounded-lg text-2xs text-slate-700 outline-none bg-white font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md text-center"
                >
                  Apply Brand Configuration Live
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview on right (1 col) */}
          <div className="space-y-6">
            {/* Live Card Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono font-black uppercase text-slate-400">
                  Live Preview Mockup
                </span>
                <span className="p-1 px-2 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold">
                  Synchronous
                </span>
              </div>

              {/* Navbar Mockup */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400 block">Header / Navbar</span>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                    <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="font-black text-xs leading-none text-slate-900 tracking-tight">
                      {formData.brandShortName.toUpperCase()}
                    </p>
                    <p className="text-[7px] font-bold text-amber-500 font-mono tracking-wider mt-0.5">
                      {formData.brandSubTitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operations Centre Sidebar Header Mockup */}
              <div className="p-3 bg-[#0A1A14] text-white rounded-xl border border-[#152e25] space-y-1">
                <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400 block">Admin Sidebar Header</span>
                <div className="pt-1">
                  <p className="font-display font-black text-xs text-amber-400 uppercase tracking-wider">
                    {formData.brandName.toUpperCase()}
                  </p>
                  <p className="text-[8px] font-mono tracking-widest text-[#2ECC71] font-bold mt-0.5">
                    {formData.portalTitle}
                  </p>
                </div>
              </div>

              {/* Footer Mockup */}
              <div className="p-4 bg-slate-950 text-slate-300 rounded-xl space-y-2 text-xs">
                <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400 block">Footer Signature</span>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-7 h-7 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0">
                    <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="font-black text-white text-xs">{formData.brandShortName} {formData.brandSubTitle}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {formData.tagline}
                </p>
                <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500 font-mono flex justify-between">
                  <span>&copy; {formData.copyrightYear} {formData.brandName}</span>
                  <span className="text-amber-400">{formData.brandAcronym} Hub</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-amber-200/50 space-y-3 text-xs">
              <h4 className="font-black text-amber-900 uppercase text-[11px] tracking-tight">
                Quick Setup Actions
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed text-[11px]">
                Once you are satisfied with this brand setup, export the package to bundle it with your standalone deployment or test another preset.
              </p>
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleDownloadConfig}
                  className="w-full py-2 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 text-2xs font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={11} />
                  Download brand.config.json
                </button>
                <button
                  onClick={() => setActiveSubTab("guide")}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-2xs font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={11} />
                  View Standalone Deployment Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Brand Presets Tab */}
      {activeSubTab === "presets" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
              Pre-Configured Brand Templates
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Click "Apply Preset" to instantly populate and activate complete brand styling, titles, and themes for different use cases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BRAND_PRESETS.map((preset) => (
              <div 
                key={preset.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="p-1 px-2.5 bg-slate-100 text-slate-700 font-mono text-[9px] font-bold uppercase rounded-md">
                      {preset.category}
                    </span>
                    {formData.brandName === preset.config.brandName && (
                      <span className="p-1 px-2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-md flex items-center gap-1">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 leading-tight">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  
                  {/* Preset color swatches */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Colors:</span>
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" 
                      style={{ backgroundColor: preset.config.primaryColor || "#103D2E" }}
                      title="Primary"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" 
                      style={{ backgroundColor: preset.config.accentColor || "#F59E0B" }}
                      title="Accent"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" 
                      style={{ backgroundColor: preset.config.secondaryColor || "#2ECC71" }}
                      title="Secondary"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`w-full py-2.5 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
                    formData.brandName === preset.config.brandName
                      ? "bg-slate-100 text-slate-400 cursor-default"
                      : "bg-[#103D2E] hover:bg-[#07130F] text-amber-300 shadow-xs"
                  }`}
                >
                  {formData.brandName === preset.config.brandName ? "Currently Active" : "Apply This Preset"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Standalone Clone Checklist & Guide Tab */}
      {activeSubTab === "guide" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Standalone Clone Deployment Checklist
              </h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Step-by-step instructions for establishing an independent standalone instance with isolated data.
              </p>
            </div>
            <a
              href="/STANDALONE_CLONE_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-2xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <ExternalLink size={11} />
              Open Full Markdown Guide
            </a>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Duplicate AI Studio Applet or Clone Git Repository",
                desc: "Duplicate the applet from your AI Studio projects workspace (or fork the Git repository to your organization account). This gives you an isolated code runtime with full administrative privileges."
              },
              {
                step: "02",
                title: "Provision Dedicated Firebase Project & Firestore",
                desc: "Create a new Firebase Project in the Firebase Console (e.g. `yourbrand-portal`). Enable Firestore Database and Firebase Authentication (Email/Password & Google Provider). This ensures 100% data isolation from Right Minds Africa."
              },
              {
                step: "03",
                title: "Update firebase-applet-config.json",
                desc: "Paste your new Firebase project configuration into `src/firebase-applet-config.json` with the new apiKey, authDomain, projectId, and firestoreDatabaseId: '(default)'."
              },
              {
                step: "04",
                title: "Import Your Brand Profile (brand.config.json)",
                desc: "Use the Export / Import tab to drop in your new brand's `brand.config.json` (or customize directly via the Brand Customizer tab). The Navbar, Footer, CMS, and Operations headers immediately adapt."
              },
              {
                step: "05",
                title: "Configure Super Admin Access & Passwords",
                desc: "Set the new owner's email in `src/components/AdminPortal.tsx` and register the primary Super Admin account at `/rmaadmin`. From there, onboard additional instructors, mentors, or finance officers."
              },
              {
                step: "06",
                title: "Connect Custom Domain & Deploy",
                desc: "Deploy via `npm run build` and connect your custom domain (e.g. `portal.brainbenchtech.com` or `academy.yourbrand.org`). SSL certificates and production routes are fully supported on port 3000."
              }
            ].map((item) => (
              <div key={item.step} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150 flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-[#103D2E] text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Export / Import & Reset Tab */}
      {activeSubTab === "export" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Export & Package */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                  Export Brand Package
                </h3>
                <p className="text-2xs text-slate-400 font-medium">
                  Complete portable JSON profile for cloning
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJson}
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  {isCopied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownloadConfig}
                  className="py-1 px-2.5 bg-[#103D2E] hover:bg-[#07130F] text-amber-300 rounded-lg text-2xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  <Download size={11} />
                  Download
                </button>
              </div>
            </div>

            <pre className="max-h-72 overflow-y-auto p-4 bg-slate-900 text-amber-300 rounded-2xl text-[10px] font-mono leading-relaxed scrollbar-thin">
              {exportBrandConfigJSON()}
            </pre>
          </div>

          {/* JSON Import & Database Clean Slate */}
          <div className="space-y-6">
            {/* Import file card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                  Import Brand Package
                </h3>
                <p className="text-2xs text-slate-400 font-medium mt-0.5">
                  Upload an existing <code className="font-mono text-slate-700">brand.config.json</code> file to re-skin this instance immediately.
                </p>
              </div>

              <input
                type="file"
                ref={jsonImportRef}
                onChange={handleImportJsonFile}
                accept=".json,application/json"
                className="hidden"
              />

              <button
                onClick={() => jsonImportRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-slate-50/50"
              >
                <Upload size={18} className="text-slate-400" />
                <span className="text-xs font-black uppercase tracking-wider">Click to Select brand.config.json</span>
                <span className="text-[10px] text-slate-400 font-mono">Accepts JSON packages generated by this portal</span>
              </button>
            </div>

            {/* Clean Slate / Database Reset for new brand */}
            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={16} />
                <h4 className="text-xs font-black uppercase tracking-tight">
                  Clean Slate: Reset Demo Records
                </h4>
              </div>
              <p className="text-[11px] text-red-900/80 font-normal leading-relaxed">
                Starting fresh for a new client or brand? Wipe previous demo registrations and check-ins while keeping your full CMS page structures, course templates, and styling completely intact.
              </p>
              {isSuperAdmin ? (
                <button
                  onClick={() => setIsWipeConfirmOpen(true)}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-2xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Trash2 size={12} />
                  Reset Demo Records to Clean Slate
                </button>
              ) : (
                <span className="text-[10px] text-amber-800 font-medium block">
                  🔒 Restricted to Super Administrators.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Brand Defaults */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">Reset to Right Minds Africa Defaults?</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              This will restore all brand names, logos, colors, and contacts back to the original Right Minds Africa specifications.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const restored = resetBrand();
                  setFormData(restored);
                  setIsResetConfirmOpen(false);
                  onNotify("Restored original Right Minds Africa brand defaults.", "info");
                  onLogAction("🔄 [BRAND] Restored platform to original RMA brand baseline.");
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Wipe Demo Records */}
      {isWipeConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-red-600 uppercase">Wipe Demo Records for New Brand?</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              This will clear candidate registration caches and check-in signatures so your newly branded portal starts with a clean database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsWipeConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeDemoData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
