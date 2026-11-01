import React, { useState, useEffect } from "react";
import { 
  Image, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  AlertCircle, 
  Download, 
  Share2, 
  Maximize2,
  Check,
  ChevronLeft,
  ChevronRight,
  UploadCloud
} from "lucide-react";
import { GALLERY_ITEMS, GalleryItem } from "../types";
import { saveGallery } from "../lib/db";
import { 
  saveGalleryItemToSupabase, 
  deleteGalleryItemFromSupabase, 
  fetchAllCMSFromSupabase 
} from "../lib/supabaseCms";
import { uploadImageToSupabase, isSupabaseConfigured } from "../lib/supabase";

const RUNTIME_ALBUM_KEY = "rma_gallery_persistent_album";

interface AdminGalleryProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminGallery({ hasWriteAccess, onLogAction }: AdminGalleryProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Upload drag state
  const [isDragActive, setIsDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form data
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("YAP Conference");
  const [descInput, setDescInput] = useState("");
  const [imageBlob, setImageBlob] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Lightbox selection
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const initGallery = async () => {
      // 1. Fetch from Supabase
      try {
        const supaData = await fetchAllCMSFromSupabase();
        if (supaData && supaData.gallery && supaData.gallery.length > 0) {
          setGallery(supaData.gallery);
          return;
        }
      } catch (err) {}

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(RUNTIME_ALBUM_KEY);
        if (saved) {
          try {
            setGallery(JSON.parse(saved));
          } catch (e) {
            setGallery(GALLERY_ITEMS);
          }
        } else {
          await saveGallery(GALLERY_ITEMS);
          setGallery(GALLERY_ITEMS);
        }
      }
    };
    initGallery();

    const handleUpdate = () => {
      const saved = localStorage.getItem(RUNTIME_ALBUM_KEY);
      if (saved) {
        try {
          setGallery(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener("rma_gallery_updated", handleUpdate);
    return () => window.removeEventListener("rma_gallery_updated", handleUpdate);
  }, []);

  const saveToStorage = async (updated: GalleryItem[]) => {
    setGallery(updated);
    await saveGallery(updated);
  };

  const compressAndSetFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file type only.");
      return;
    }

    // Try Supabase Storage upload
    if (isSupabaseConfigured) {
      onLogAction(`☁️ [SUPABASE STORAGE] Uploading gallery file "${file.name}" to bucket "cms-media"...`);
      const { url, error } = await uploadImageToSupabase(file, "cms-media");
      if (!error && url) {
        setImageBlob(url);
        onLogAction(`✅ [SUPABASE STORAGE] Gallery image uploaded! Public URL: ${url}`);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        // Simple canvas downscale compression / downscaling
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = img.height * scale;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImageBlob(compressedDataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndSetFile(e.target.files[0]);
    }
  };

  const handlePublishImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationFeedback(null);
    if (!titleInput.trim() || !descInput.trim() || !imageBlob) {
      setErrorMsg("Provide title, description, and drag an image file.");
      return;
    }

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: titleInput.trim(),
      category: categoryInput as any,
      image: imageBlob,
      url: imageBlob,
      description: descInput.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };

    saveToStorage([newItem, ...gallery]);
    
    // Save to Supabase
    const supaRes = await saveGalleryItemToSupabase(newItem);
    if (!supaRes.success) {
      setOperationFeedback({ text: `Supabase Error: ${supaRes.error}`, type: "error" });
      onLogAction(`❌ [GALLERY ERROR] Failed saving to Supabase: ${supaRes.error}`);
    } else {
      setOperationFeedback({ text: `Photo "${newItem.title}" saved to Supabase!`, type: "success" });
      onLogAction(`📸 [GALLERY UPLOAD] Admin uploaded memory image to Supabase: "${newItem.title}"`);
    }
    
    // clear form
    setTitleInput("");
    setDescInput("");
    setImageBlob("");
    setIsModalOpen(false);
    setSuccessMsg("Catalog photo uploaded and synchronized!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Remove image: "${title}" from catalog?`)) {
      const updated = gallery.filter(item => item.id !== id);
      saveToStorage(updated);

      const supaRes = await deleteGalleryItemFromSupabase(id);
      if (!supaRes.success) {
        setOperationFeedback({ text: `Failed deleting from Supabase: ${supaRes.error}`, type: "error" });
        onLogAction(`❌ [GALLERY DELETE ERROR] Supabase delete failed: ${supaRes.error}`);
      } else {
        setOperationFeedback({ text: `Image deleted from Supabase.`, type: "success" });
        onLogAction(`🗑️ [GALLERY PURGATION] Deleted image entry from Supabase: "${title}"`);
      }
    }
  };

  const filteredItems = gallery.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Image size={18} className="text-[#103D2E]" />
            Enhanced Gallery catalogue
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            Bulk upload photos, compress assets instantly, and organize historical event archives
          </span>
        </div>
        {hasWriteAccess && (
          <button
            onClick={() => {
              setErrorMsg("");
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-bold rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-[#103D2E]/20"
          >
            <Plus size={13} className="stroke-[2.5]" />
            Upload Photo
          </button>
        )}
      </div>

      {operationFeedback && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold animate-fadeIn ${
          operationFeedback.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>{operationFeedback.text}</span>
          <button onClick={() => setOperationFeedback(null)} className="text-2xs font-mono opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-850 font-bold flex items-center gap-1.5 text-xs">
          <Check size={14} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search titles, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#103D2E]/40 focus:bg-white rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
          >
            <option value="all">All Classifications</option>
            <option value="YAP Conference">YAP Conference</option>
            <option value="CII">CII Programs</option>
            <option value="Right-Minded Teens">Right-Minded Teens</option>
            <option value="Leadership Hangouts">Leadership Hangouts</option>
          </select>
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setActiveImage(item)}
                  className="p-2 bg-white text-slate-800 rounded-full shadow hover:bg-slate-550 hover:text-white transition-all cursor-pointer"
                  title="Fullscreen preview"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-amber-300 rounded font-bold font-mono text-[8.5px] uppercase tracking-wider border border-white/5">
                {item.category}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1 text-left">
                <h4 className="font-extrabold text-slate-900 text-xs leading-none uppercase">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9.5px] font-mono text-slate-400 font-bold">
                <span>{item.date}</span>
                {hasWriteAccess && (
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload modal popup with drag & drop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp">
            
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-black uppercase text-slate-800">Upload Memories Snapshots</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handlePublishImage} className="p-6 space-y-4 text-xs font-medium text-left">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-650 font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Drag & drop section */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragActive ? "border-[#103D2E] bg-emerald-50/20" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                }`}
              >
                {imageBlob ? (
                  <div className="relative aspect-video w-48 rounded-xl border overflow-hidden">
                    <img src={imageBlob} className="w-full h-full object-cover" alt="ready to upload" />
                    <button
                      type="button"
                      onClick={() => setImageBlob("")}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-slate-400" />
                    <div>
                      <p className="font-extrabold text-slate-850">Drag and drop file here</p>
                      <p className="text-[10px] text-slate-420 mt-0.5">Supports PNG, JPEG, scalable WebP layout scales</p>
                    </div>
                    <label className="px-3.5 py-1.5 bg-white border border-slate-205 rounded-lg text-2xs uppercase tracking-wider font-extrabold cursor-pointer hover:bg-slate-50">
                      Browse Files
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Photo Title:</label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g., Orientation trust icebreakers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Catalog Classification:</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none text-slate-700"
                  >
                    <option value="YAP Conference">YAP Conference</option>
                    <option value="CII">CII Programs</option>
                    <option value="Right-Minded Teens">Right-Minded Teens</option>
                    <option value="Leadership Hangouts">Leadership Hangouts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Short Description:</label>
                <textarea
                  required
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Summarize the core activities taking place here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-2xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Deploy memory file
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox pop up */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs" onClick={() => setActiveImage(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl z-10 text-left border border-slate-200">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-slate-800 hover:text-black p-1 rounded-full shadow cursor-pointer z-20"
            >
              <X size={16} />
            </button>

            <div className="aspect-video bg-zinc-950 overflow-hidden">
              <img src={activeImage.image} alt={activeImage.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-black rounded uppercase">
                  {activeImage.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{activeImage.date}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase leading-snug">{activeImage.title}</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-normal">{activeImage.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
