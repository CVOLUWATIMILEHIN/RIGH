import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  BookOpen, 
  Video, 
  Mic, 
  Download, 
  ExternalLink,
  X,
  AlertCircle,
  Archive,
  BarChart2
} from "lucide-react";
import { getResources, saveResources } from "../lib/db";

export interface ResourceModel {
  id: string;
  title: string;
  description: string;
  category: "Articles" | "PDFs" | "Videos" | "Audio" | "Downloads";
  author: string;
  sizeOrDuration: string; // e.g., "PDF (2.4 MB)", "15 mins read", "Video (45 mins)"
  link: string; // Direct Sellar link or media URL
  downloadsCount: number;
  featured: boolean;
  status: "Active" | "Archived" | "Draft";
  createdAt: string;
}

const DEFAULT_RESOURCES: ResourceModel[] = [
  {
    id: "rsc-1",
    title: "RMA 12-Month Goal Execution Workbook",
    description: "Our core G3 strategy worksheet. Fully interactive goal checklists, productivity box models, habit trackers, and personal life audit dashboards.",
    category: "Downloads",
    author: "RMA Development Committee",
    sizeOrDuration: "PDF Document (2.4 MB)",
    link: "https://sellar.co/m/rightmindsafrica",
    downloadsCount: 1240,
    featured: true,
    status: "Active",
    createdAt: "2026-05-10T12:00:00Z"
  },
  {
    id: "rsc-2",
    title: "Mindset Re-Engineering: The Catalyst for African Youth Growth",
    description: "A comprehensive article exploring cognitive re-structuring tactics, breaking standard procrastination cycles, and raising individual professional EQ benchmarks.",
    category: "Articles",
    author: "Gracious-Esther",
    sizeOrDuration: "12 mins read",
    link: "",
    downloadsCount: 948,
    featured: true,
    status: "Active",
    createdAt: "2026-05-12T10:00:00Z"
  },
  {
    id: "rsc-3",
    title: "Navigating National Service (NYSC) with Strategic Purpose",
    description: "Audio presentation guiding active youth on professional development pathways, remote digital skill setups, and savings strategies during service year.",
    category: "Audio",
    author: "Abana Ogechukwu Esther",
    sizeOrDuration: "Audio Clip (28 mins)",
    link: "https://sellar.co/m/rightmindsafrica",
    downloadsCount: 462,
    featured: false,
    status: "Active",
    createdAt: "2026-05-18T14:30:00Z"
  },
  {
    id: "rsc-4",
    title: "Workplace EQ and Behavioral Integrity Academy Seminar",
    description: "Re-broadcast of the dynamic physical seminar delivered to Lagos State corporate interns on building emotional capacity and executive competence.",
    category: "Videos",
    author: "Gracious-Esther",
    sizeOrDuration: "Video Session (54 mins)",
    link: "https://www.facebook.com/rightmindsafrica",
    downloadsCount: 318,
    featured: false,
    status: "Active",
    createdAt: "2026-05-22T09:15:00Z"
  }
];

interface AdminResourcesProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminResources({ hasWriteAccess, onLogAction }: AdminResourcesProps) {
  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceModel | null>(null);
  const [formData, setFormData] = useState<Omit<ResourceModel, "id" | "downloadsCount" | "createdAt">>({
    title: "",
    description: "",
    category: "Downloads",
    author: "RMA Hub Team",
    sizeOrDuration: "",
    link: "",
    featured: false,
    status: "Active"
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const initResources = async () => {
      try {
        const cloudResources = await getResources();
        if (Array.isArray(cloudResources) && cloudResources.length > 0) {
          setResources(cloudResources as ResourceModel[]);
          if (typeof window !== "undefined") {
            localStorage.setItem("rma_resources", JSON.stringify(cloudResources));
          }
          return;
        }
      } catch (err) {
        console.warn("Could not retrieve Firestore resources, falling back:", err);
      }

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("rma_resources");
        if (saved !== null) {
          try {
            setResources(JSON.parse(saved));
          } catch (e) {
            setResources(DEFAULT_RESOURCES);
          }
        } else {
          await saveResources(DEFAULT_RESOURCES);
          setResources(DEFAULT_RESOURCES);
        }
      }
    };
    initResources();

    const handleUpdate = () => {
      const saved = localStorage.getItem("rma_resources");
      if (saved) {
        try {
          setResources(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener("rma_resources_updated", handleUpdate);
    return () => window.removeEventListener("rma_resources_updated", handleUpdate);
  }, []);

  const saveToStorage = async (updatedList: ResourceModel[]) => {
    setResources(updatedList);
    await saveResources(updatedList);
  };

  const handleOpenAddModal = () => {
    if (!hasWriteAccess) return;
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      category: "Downloads",
      author: "RMA Hub Academy",
      sizeOrDuration: "PDF Document (1.5 MB)",
      link: "https://sellar.co/m/rightmindsafrica",
      featured: false,
      status: "Active"
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (resource: ResourceModel) => {
    if (!hasWriteAccess) return;
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      author: resource.author,
      sizeOrDuration: resource.sizeOrDuration,
      link: resource.link,
      featured: resource.featured,
      status: resource.status
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title.trim() || !formData.description.trim() || !formData.sizeOrDuration.trim()) {
      setErrorMsg("Please populate the required fields correctly.");
      return;
    }

    if (editingResource) {
      // Edit
      const updated = resources.map(rsc => {
        if (rsc.id === editingResource.id) {
          return {
            ...rsc,
            ...formData
          };
        }
        return rsc;
      });
      saveToStorage(updated);
      onLogAction(`📝 [RESOURCE MODIFIED] Admin edited resource "${formData.title}" [${editingResource.id}]`);
    } else {
      // Create
      const newRsc: ResourceModel = {
        id: `rsc-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        author: formData.author,
        sizeOrDuration: formData.sizeOrDuration,
        link: formData.link,
        downloadsCount: 0,
        featured: formData.featured,
        status: formData.status,
        createdAt: new Date().toISOString()
      };
      saveToStorage([newRsc, ...resources]);
      onLogAction(`📚 [RESOURCE CREATED] Admin added library resource: "${formData.title}" (${formData.category})`);
    }
    setIsModalOpen(false);
  };

  const handleToggleArchive = (resource: ResourceModel) => {
    if (!hasWriteAccess) return;
    const newStatus = resource.status === "Archived" ? "Active" : "Archived";
    const updated = resources.map(rsc => {
      if (rsc.id === resource.id) {
        return { ...rsc, status: newStatus as any };
      }
      return rsc;
    });
    saveToStorage(updated);
    onLogAction(`📦 [RESOURCE LIFE CYCLE] Resource "${resource.title}" status shifted to [${newStatus}]`);
  };

  const handleDelete = (id: string, title: string) => {
    if (!hasWriteAccess) return;
    if (confirm(`Clean purge resource: "${title}" from the cloud library?`)) {
      const updated = resources.filter(rsc => rsc.id !== id);
      saveToStorage(updated);
      onLogAction(`🗑️ [RESOURCE PURGED] Admin deleted physical library resource: "${title}"`);
    }
  };

  const handleToggleFeature = (resource: ResourceModel) => {
    if (!hasWriteAccess) return;
    const updated = resources.map(rsc => {
      if (rsc.id === resource.id) {
        return { ...rsc, featured: !rsc.featured };
      }
      return rsc;
    });
    saveToStorage(updated);
    onLogAction(`⭐ [RESOURCE FEATURED] Toggled featured highlights for resource: "${resource.title}"`);
  };

  const filteredResources = resources.filter(rsc => {
    const matchesSearch = rsc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rsc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rsc.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || rsc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || rsc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={18} className="text-[#103D2E]" />
            Digital Resource Vault
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            Audit study outlines, coordinate PDFs workbook attachments, and monitor Sellar downloads
          </span>
        </div>
        {hasWriteAccess && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-bold rounded-xl text-2xs uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-[#103D2E]/20"
          >
            <Plus size={13} className="stroke-[2.5]" />
            Upload Resource
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#103D2E]/40 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Downloads">Downloads</option>
            <option value="Articles">Articles</option>
            <option value="PDFs">PDFs</option>
            <option value="Videos">Videos</option>
            <option value="Audio">Audio</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:outline-none text-slate-650 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Dashboard Metrics summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Artifacts", value: resources.length },
          { label: "Active Downloads", value: resources.filter(r => r.category === "Downloads").length },
          { label: "Articles in library", value: resources.filter(r => r.category === "Articles").length },
          { label: "Direct Sellar Clicks", value: resources.reduce((acc, r) => acc + r.downloadsCount, 0) }
        ].map((met, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-150 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{met.label}</span>
            <span className="text-lg font-black text-slate-900 font-display leading-none mt-1.5 block">{met.value}</span>
          </div>
        ))}
      </div>

      {/* Resource Table List */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Resource Title & Category</th>
                <th className="py-4 px-3">Creator / Author</th>
                <th className="py-4 px-3">Size / Format</th>
                <th className="py-4 px-3">Downloads</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredResources.map((rsc) => {
                let badgeTheme = "bg-amber-50 text-amber-700";
                if (rsc.category === "Downloads") badgeTheme = "bg-emerald-50 text-emerald-800 border-emerald-100 border";
                if (rsc.category === "Videos") badgeTheme = "bg-blue-50 text-blue-800 border-blue-100 border";
                if (rsc.category === "Articles") badgeTheme = "bg-indigo-50 text-indigo-800 border-indigo-100 border";

                return (
                  <tr key={rsc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${badgeTheme}`}>
                            {rsc.category}
                          </span>
                          {rsc.featured && (
                            <span className="bg-amber-100 border border-amber-350 text-amber-900 text-[8.5px] font-black px-1.5 py-0.5 rounded">
                              ★ Featured
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 font-mono">ID: {rsc.id}</span>
                        </div>
                        <p className="font-extrabold text-slate-900 leading-normal hover:text-[#103D2E] text-xs">
                          {rsc.title}
                        </p>
                        <p className="text-[10.5px] text-slate-450 line-clamp-1 italic font-normal">
                          {rsc.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-800 font-semibold">{rsc.author}</td>
                    <td className="py-4 px-3 font-mono text-slate-500 font-bold">{rsc.sizeOrDuration}</td>
                    <td className="py-4 px-3">
                      <span className="font-display font-black text-slate-900">{rsc.downloadsCount}</span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 font-bold rounded text-[9px] ${
                        rsc.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : rsc.status === "Archived"
                            ? "bg-slate-100 text-slate-550 border border-slate-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {rsc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {hasWriteAccess && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleFeature(rsc)}
                            className="p-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-700 rounded-lg transition-all"
                            title="Toggle feature list status"
                          >
                            ★
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(rsc)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg"
                            title="Edit content parameters"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => handleToggleArchive(rsc)}
                            className="p-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-700 rounded-lg"
                            title="Archive / Unarchive"
                          >
                            <Archive size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(rsc.id, rsc.title)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg"
                            title="Delete permanently"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp">
            
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-black uppercase text-slate-800">
                {editingResource ? "Modify Library Resource" : "Create New Resource Entry"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Resource / Book Title:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., G3 Goal-Mapping Notebook 2026 Edition"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Author / Speaker:</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Vault Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  >
                    <option value="Downloads">Downloads</option>
                    <option value="PDFs">PDFs (Legacy)</option>
                    <option value="Articles">Articles</option>
                    <option value="Videos">Videos</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">File Size or Duration label:</label>
                  <input
                    type="text"
                    required
                    value={formData.sizeOrDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizeOrDuration: e.target.value }))}
                    placeholder="e.g., PDF (2.1 MB) or 15 mins read"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Direct Sellar Checkout URL:</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="e.g., https://sellar.co/m/right..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Library description:</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Outline key lessons, table of contents, and actionable results..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-[#103D2E] focus:ring-0 rounded border-slate-300"
                  />
                  <label htmlFor="featured" className="text-xs text-slate-700 font-extrabold cursor-pointer">
                    Highlight as Featured ★
                  </label>
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Active State:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none"
                  >
                    <option value="Active">Active (Library Hub)</option>
                    <option value="Archived">Archived (Stored)</option>
                    <option value="Draft">Draft (Secret)</option>
                  </select>
                </div>
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
                  Save Resource Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
