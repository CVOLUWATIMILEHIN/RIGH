/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GalleryItem, GALLERY_ITEMS } from "../types";
import { 
  Eye, Calendar, Tag, CornerDownRight, X, ArrowLeft, ArrowRight, 
  Share2, Check, Link, UploadCloud, Image, FileText, Sparkles, ExternalLink
} from "lucide-react";
import { getGallery, saveGallery } from "../lib/db";
import PageContainer from "./PageContainer";

interface GalleryProps {
  defaultCategory?: "All" | "YAP Conference" | "Right-Minded Teens" | "CII";
}

export default function Gallery({ defaultCategory = "All" }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);

  useEffect(() => {
    const loadAndSyncGallery = async () => {
      const saved = localStorage.getItem("rma_custom_gallery_items");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {}
      } else {
        setItems(GALLERY_ITEMS);
      }
    };
    loadAndSyncGallery();

    window.addEventListener("rma_gallery_updated", loadAndSyncGallery);
    return () => window.removeEventListener("rma_gallery_updated", loadAndSyncGallery);
  }, []);

  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload/Submission form states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("CII");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newImgUrl, setNewImgUrl] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleCopyLink = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}#gallery`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const categories = ["All", "YAP Conference", "Right-Minded Teens", "CII"];

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category === activeCategory);

  const handleNextLightbox = () => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex(item => item.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setSelectedItem(items[nextIndex]);
  };

  const handlePrevLightbox = () => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex(item => item.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setSelectedItem(items[prevIndex]);
  };

  // Drag-and-drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBase64Image(event.target.result as string);
          setNewImgUrl(""); // Prefer base64
          setUploadError("");
        }
      };
      reader.readAsDataURL(file);
    } else {
      setUploadError("Invalid file type. Please upload a standard image file (PNG, JPG, WEBP).");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setUploadError("Please provide a descriptive title for this event photo.");
      return;
    }
    if (!newDesc.trim()) {
      setUploadError("Please describe what is happening in this memory capsule.");
      return;
    }
    if (!newDate.trim()) {
      setUploadError("Please capture the timeline (e.g., June 2026).");
      return;
    }

    const finalImage = base64Image || newImgUrl.trim();
    if (!finalImage) {
      setUploadError("Please upload a picture file or configure a valid external image URL link.");
      return;
    }

    const newItem: GalleryItem = {
      id: "custom-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      image: finalImage,
      description: newDesc.trim(),
      date: newDate.trim(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveGallery(updated);

    setUploadSuccess("Memoir photo uploaded successfully! It is now live in the official gallery stream.");
    setNewTitle("");
    setNewDesc("");
    setNewDate("");
    setNewImgUrl("");
    setBase64Image(null);
    setUploadError("");

    setTimeout(() => {
      setUploadSuccess("");
      setIsUploadOpen(false);
    }, 2000);
  };

  const handleResetGallery = async () => {
    if (window.confirm("Are you sure you want to revert to the default official curated photo gallery stream?")) {
      await saveGallery(GALLERY_ITEMS);
    }
  };

  return (
    <section id="gallery" className="py-16 bg-brand-light relative overflow-hidden border-t border-b border-gray-150/40">
      <PageContainer>
        
        {/* Album Integration Banner Box */}
        <div className="mb-12 p-6 sm:p-8 bg-gradient-to-r from-brand-blue to-slate-900 rounded-3xl text-white relative overflow-hidden shadow-xl border border-brand-blue/30 text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black tracking-widest uppercase rounded-full font-mono">
                <Sparkles size={11} className="animate-pulse" /> HIGH-RES CLOUD DRIVE ARCHIVE
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight">
                CII Social Hangout Album Link
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                Browse our high-definition cloud archives on Google Photos! Experience over 100+ raw premium hangout memories, state cohort laughter, boardgames, dinner milestones, and physical team bonding drills instantly.
              </p>
            </div>
            <a
              href="https://photos.google.com/share/AF1QipNcGoBwOfG3-01OTK8DrrpYAetSJKxTAbTgxXFWr5A89MHkqXmoizxP37BJTkcoiw?key=NEpJejVub2lQZ2dVb3JxNDBGSUxXT0lpMU1xMWNn"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-black uppercase tracking-widest rounded-xl text-center shadow-lg hover:shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 flex items-center gap-2 border border-brand-orange/30 cursor-pointer"
            >
              Browse 100+ High-Res Photos <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl text-left space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-black tracking-widest rounded-full uppercase">
              <CornerDownRight size={13} /> GALLERY ARCHIVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-blue tracking-tight font-display uppercase">
              Impact & Previous Event Memories
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Explore previous cohorts, state orientation highlights, annual YAP assemblies, and community developmental outlays. Real action, real minds.
            </p>
          </div>

          {/* Controls Bar: Categories filtering + Upload Memoir photo trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:self-end">
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-gray-600 hover:text-brand-blue"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-slate-900/10 cursor-pointer text-center whitespace-nowrap"
              >
                <UploadCloud size={13} /> Upload Picture
              </button>

              {items.length > GALLERY_ITEMS.length && (
                <button
                  onClick={handleResetGallery}
                  className="px-3 py-2.5 bg-white border border-gray-200 hover:border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1 hover:bg-red-50 cursor-pointer"
                  title="Reset custom memory uploads stream"
                >
                  Reset Stream
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Dynamic Grid layout */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 max-w-lg mx-auto">
            <Image className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-xs font-black text-brand-blue uppercase tracking-wide">No picture capsules uploaded under category</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">Click 'Upload Picture' to append custom memory capsules to the local event registry immediately!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-150 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between text-left"
                >
                  {/* Visual Image container */}
                  <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-white/95 rounded-full text-brand-blue shadow-md scale-95 group-hover:scale-100 transition-transform">
                        <Eye size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black tracking-wide text-brand-orange uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-brand-blue leading-snug group-hover:text-brand-orange transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={11} /> {item.date}
                      </span>
                      
                      <button
                        onClick={(e) => handleCopyLink(item.id, e)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all cursor-pointer font-extrabold uppercase tracking-wide text-[9px] ${
                          copiedId === item.id
                            ? "bg-brand-orange/15 border-brand-orange/25 text-brand-orange"
                            : "bg-gray-50 border-gray-150 text-sky-700 hover:text-brand-orange hover:border-brand-orange/35"
                        }`}
                        title="Copy Share Link"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={9} className="animate-pulse" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Share2 size={9} />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Upload Memoir modal wrapper dialog */}
        <AnimatePresence>
          {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUploadOpen(false)}
                className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto text-left"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20 cursor-pointer"
                  aria-label="Dismiss Upload Form"
                >
                  <X size={18} />
                </button>

                <div className="space-y-1.5 mb-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest rounded-md">
                    Memoir Upload Portal
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-brand-blue tracking-tight uppercase">
                    Upload Event Photo
                  </h3>
                  <p className="text-slate-500 text-xs font-normal">
                    Share moments of physical meetings, cohort bootcamps, community handovers, or state hangout highlights. Your contributions enrich our collective story!
                  </p>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 leading-normal font-medium">
                    ⚠️ {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-850 text-xs rounded-xl mb-6 flex items-center gap-2 animate-bounce font-medium">
                    <Check size={16} className="text-emerald-600 font-extrabold shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {/* File Upload Zone */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 font-mono">
                      1. Image File Upload (PNG/JPG/WEBP - Drag or Browse)
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative flex flex-col items-center justify-center cursor-pointer min-h-[140px] focus-within:ring-2 focus-within:ring-brand-blue ${
                        dragActive 
                          ? "border-brand-orange bg-brand-orange/5" 
                          : base64Image 
                          ? "border-emerald-500 bg-emerald-50/10" 
                          : "border-gray-350 hover:border-brand-blue bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Upload Event Pic"
                      />
                      {base64Image ? (
                        <div className="space-y-2 flex flex-col items-center">
                          <img 
                            src={base64Image} 
                            alt="Preview base64 thumbnail" 
                            className="h-16 w-24 object-cover rounded-lg border border-emerald-200 shadow-sm" 
                          />
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Photo Loaded successfully</p>
                          <p className="text-[9px] text-slate-400">Click or drag again to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 flex flex-col items-center select-none pointer-events-none">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-450 border border-slate-200 shadow-sm">
                            <UploadCloud size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Drag & drop your picture here</p>
                            <p className="text-[10px] text-slate-450">or click to browse local files</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Or External Url */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        — OR Specify External Image URL (e.g. Unsplash URL)
                      </label>
                      {base64Image && <span className="text-[9px] bg-emerald-500 text-white font-bold uppercase py-0.5 px-2 rounded-full">Active File Selected</span>}
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newImgUrl}
                      disabled={!!base64Image}
                      onChange={(e) => setNewImgUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-gray-250 focus:border-brand-blue focus:ring-[4px] focus:ring-brand-blue/15 rounded-xl text-xs focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900"
                    />
                  </div>

                  {/* Title / Timeline Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 font-mono">
                        2. Capsule Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lagos Outreach Group Selfie"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-gray-250 focus:border-brand-blue focus:ring-[4px] focus:ring-brand-blue/15 rounded-xl text-xs focus:outline-none transition-all text-slate-900 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 font-mono">
                        3. Timeline / Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. December 2025"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-gray-250 focus:border-brand-blue focus:ring-[4px] focus:ring-brand-blue/15 rounded-xl text-xs focus:outline-none transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 font-mono">
                      4. Category Classification
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-gray-250 focus:border-brand-blue focus:ring-[4px] focus:ring-brand-blue/15 rounded-xl text-xs focus:outline-none transition-all text-slate-905 font-bold cursor-pointer"
                    >
                      <option value="CII">CII (Corper Impact Initiative)</option>
                      <option value="YAP Conference">YAP Conference</option>
                      <option value="Right-Minded Teens">Right-Minded Teens</option>
                    </select>
                  </div>

                  {/* Description Box */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 font-mono">
                      5. Memory Caption / Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Let everyone know the spirit, coordinators, activities, and purpose behind this moment..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-gray-250 focus:border-brand-blue focus:ring-[4px] focus:ring-brand-blue/15 rounded-xl text-xs focus:outline-none transition-all text-slate-600 leading-normal resize-none font-normal"
                    />
                  </div>

                  {/* Save button actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!!uploadSuccess}
                      className="w-1/2 py-3 bg-brand-orange hover:bg-brand-orange/95 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-orange/15 cursor-pointer text-center"
                    >
                      Post to Live Stream
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Interactive Fullscreen Lightbox Overlay */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md"
              />

              {/* Close Button top right */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-30 cursor-pointer animate-[fadeIn_0.35s_ease-out]"
                aria-label="Dismiss Lightbox View"
              >
                <X size={24} />
              </button>

              {/* Next and Prev overlay triggers */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-colors z-20 hidden md:block cursor-pointer"
                aria-label="View Previous Photo"
              >
                <ArrowLeft size={24} />
              </button>

              <button
                onClick={handleNextLightbox}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-colors z-20 hidden md:block cursor-pointer"
                aria-label="View Next Photo"
              >
                <ArrowRight size={24} />
              </button>

              {/* Lightbox Wrapper Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[85vh] shadow-2xl z-10 flex flex-col text-left"
              >
                <div className="aspect-[16/10] sm:aspect-[16/9] w-full bg-zinc-950 overflow-hidden relative">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-6 space-y-3 overflow-y-auto">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-brand-orange/10 text-brand-orange text-xs font-black rounded uppercase">
                      {selectedItem.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 font-bold">
                      <Calendar size={12} /> {selectedItem.date}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-brand-blue tracking-tight">
                    {selectedItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
                    {selectedItem.description}
                  </p>

                  {/* High Quality Album Alert Promo if clicking on hangout elements */}
                  {selectedItem.category === "CII" && (
                    <div className="mt-4 p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                      <div>
                        <p className="text-xs font-black text-brand-blue uppercase tracking-wider">CII Social Hangout Google Photos Live</p>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5">Explore the complete high-definition photos album of over 100+ raw hangout captures from states with interactive carousels instantly.</p>
                      </div>
                      <a
                        href="https://photos.google.com/share/AF1QipNcGoBwOfG3-01OTK8DrrpYAetSJKxTAbTgxXFWr5A89MHkqXmoizxP37BJTkcoiw?key=NEpJejVub2lQZ2dVb3JxNDBGSUxXT0lpMU1xMWNn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-brand-orange/15 shrink-0 block cursor-pointer"
                      >
                        Launch Drive ↗
                      </a>
                    </div>
                  )}

                  {/* Dynamic Premium Share Panel inside Lightbox */}
                  <div className="pt-4 mt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black tracking-widest text-brand-blue uppercase flex items-center gap-1.5 font-mono">
                        <Share2 size={11} className="text-brand-orange" /> SPREAD THE IMPACT
                      </p>
                      <p className="text-[11px] text-gray-400">Share this milestone story on your favorite social feeds.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyLink(selectedItem.id, e)}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 text-xs font-bold ${
                          copiedId === selectedItem.id
                            ? "bg-brand-orange/10 border-brand-orange/20 text-brand-orange"
                            : "bg-white border-gray-200 text-gray-500 hover:text-brand-blue hover:border-brand-blue/30"
                        }`}
                        title="Copy Share Link"
                      >
                        {copiedId === selectedItem.id ? (
                          <>
                            <Check size={12} className="text-brand-orange animate-bounce" />
                            <span className="text-[10px] uppercase font-black tracking-wide">Copied</span>
                          </>
                        ) : (
                          <>
                            <Link size={12} />
                            <span className="text-[10px] uppercase font-black tracking-wide">Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this update from RightMinds Africa! 🌟 "${selectedItem.title}"`)}&url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}#gallery`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-black/35 transition-all flex items-center justify-center cursor-pointer"
                        title="Share on X"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>

                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}#gallery`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#0a66c2] hover:border-[#0a66c2]/35 transition-all flex items-center justify-center cursor-pointer"
                        title="Share on LinkedIn"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this update from RightMinds Africa! 🌟 "${selectedItem.title}" — ${selectedItem.description.substring(0, 100)}... 👉 ` + `${window.location.origin}${window.location.pathname}#gallery`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#25D366] hover:border-[#25D366]/35 transition-all flex items-center justify-center cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.636-1.023-5.115-2.884-6.978C16.53 1.9 14.05 1.171 11.413 1.171c-5.438 0-9.863 4.42-9.867 9.864 0 1.702.443 3.366 1.293 4.811L1.8 21.01l5.222-1.37a9.8 9.8 0 0 0 4.822 1.144z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </PageContainer>
    </section>
  );
}
