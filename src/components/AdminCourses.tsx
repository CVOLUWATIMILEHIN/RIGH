import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Clock, 
  User, 
  Layers, 
  ListOrdered,
  AlertCircle
} from "lucide-react";
import { 
  getCourses, 
  saveCourse, 
  deleteCourse, 
  LMSCourse, 
  LMSModule, 
  LMSLesson 
} from "../lib/db";

const COURSE_CATEGORIES = [
  "Leadership Development",
  "Career Growth",
  "Digital Skills",
  "Entrepreneurship",
  "NYSC Success Training",
  "Personal Development",
  "Mindset & Transformation",
  "Financial Literacy",
  "Technology"
];

interface AdminCoursesProps {
  onNotify: (msg: string, type: "success" | "error") => void;
}

export default function AdminCourses({ onNotify }: AdminCoursesProps) {
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states for creating / editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LMSCourse | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [category, setCategory] = useState("NYSC Success Training");
  const [price, setPrice] = useState<number>(15000);
  const [thumbnail, setThumbnail] = useState("");
  const [duration, setDuration] = useState("10 Hours");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [paymentMethods, setPaymentMethods] = useState<("paystack" | "bank_transfer")[]>(["paystack", "bank_transfer"]);
  
  // Interactive mini syllabus creation
  const [modules, setModules] = useState<LMSModule[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    const handleCoursesUpdate = () => {
      fetchCourses();
    };
    window.addEventListener("rma_courses_updated", handleCoursesUpdate);
    return () => window.removeEventListener("rma_courses_updated", handleCoursesUpdate);
  }, []);

  const fetchCourses = async () => {
    try {
      const list = await getCourses();
      setCourses(list);
    } catch (e) {
      onNotify("Error getting courses", "error");
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormError(null);
    setTitle("");
    setDescription("");
    setInstructorName("Olosunde Louis (Founder, RMA Hub)");
    setCategory("NYSC Success Training");
    setPrice(15000);
    setThumbnail("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80");
    setDuration("10 Hours");
    setLevel("Intermediate");
    setStatus("published");
    setModules([
      {
        id: `mod-${Date.now()}`,
        title: "Module 1: Introductory Blueprint",
        description: "Welcome to RMA Premium Academy",
        lessons: [
          {
            id: `les-${Date.now()}`,
            title: "1.1 Introduction Video (Free Preview)",
            type: "video",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: "15 min",
            isFreePreview: true
          }
        ]
      }
    ]);
    setPaymentMethods(["paystack", "bank_transfer"]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: LMSCourse) => {
    setEditingCourse(course);
    setFormError(null);
    setTitle(course.title || "");
    setDescription(course.description || "");
    setInstructorName(course.instructorName || "RMA Academy Staff");
    setCategory(course.category || "NYSC Success Training");
    setPrice(Number(course.price) || 0);
    setThumbnail(course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80");
    setDuration(course.duration || "10 Hours");
    setLevel(course.level || "Intermediate");
    setStatus(course.status || "published");
    setModules(course.modules || []);
    setPaymentMethods(course.paymentMethods || ["paystack", "bank_transfer"]);
    setIsModalOpen(true);
  };

  const handleAddModule = () => {
    const newMod: LMSModule = {
      id: `mod-${Date.now()}`,
      title: `Module ${modules.length + 1}: Custom Core Tract`,
      description: "Custom administrative teaching outlines",
      lessons: []
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (modId: string) => {
    setModules(modules.filter(m => m.id !== modId));
  };

  const handleAddLesson = (modId: string) => {
    setModules(modules.map(mod => {
      if (mod.id === modId) {
        const newLes: LMSLesson = {
          id: `les-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: "New Course Lesson Element",
          type: "video",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: "10 min"
        };
        return {
          ...mod,
          lessons: [...mod.lessons, newLes]
        };
      }
      return mod;
    }));
  };

  const handleRemoveLesson = (modId: string, lesId: string) => {
    setModules(modules.map(mod => {
      if (mod.id === modId) {
        return {
          ...mod,
          lessons: mod.lessons.filter(l => l.id !== lesId)
        };
      }
      return mod;
    }));
  };

  const handleLessonChange = (modId: string, lesId: string, key: keyof LMSLesson, val: any) => {
    setModules(modules.map(mod => {
      if (mod.id === modId) {
        return {
          ...mod,
          lessons: mod.lessons.map(l => l.id === lesId ? { ...l, [key]: val } : l)
        };
      }
      return mod;
    }));
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Please enter a course title.");
      onNotify("Course title is required.", "error");
      return;
    }
    if (!description.trim()) {
      setFormError("Please enter a course syllabus description.");
      onNotify("Course description is required.", "error");
      return;
    }

    const lessonsCount = modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
    const nowIso = new Date().toISOString();

    const targetId = editingCourse ? editingCourse.id : `course-${Date.now()}`;
    const targetCourse: LMSCourse = {
      id: targetId,
      title: title.trim(),
      description: description.trim(),
      instructorName: instructorName.trim() || "RMA Academy Staff",
      category: category || "NYSC Success Training",
      price: Number.isFinite(Number(price)) ? Number(price) : 0,
      thumbnail: thumbnail.trim() || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      duration: duration.trim() || "10 Hours",
      level: level || "Intermediate",
      lessonsCount,
      status: status || "published",
      modules: modules || [],
      paymentMethods: paymentMethods.length > 0 ? paymentMethods : ["paystack", "bank_transfer"],
      createdAt: editingCourse?.createdAt || nowIso,
      updatedAt: nowIso
    };

    setIsSaving(true);
    try {
      // Optimistically update local component state immediately so the course appears right away
      setCourses((prev) => {
        const exists = prev.some((c) => c.id === targetCourse.id);
        if (exists) {
          return prev.map((c) => (c.id === targetCourse.id ? targetCourse : c));
        }
        return [targetCourse, ...prev];
      });

      await saveCourse(targetCourse);
      onNotify(
        editingCourse
          ? `Course "${targetCourse.title}" updated successfully!`
          : `New course "${targetCourse.title}" added and published!`,
        "success"
      );
      setIsModalOpen(false);
      await fetchCourses();
    } catch (err: any) {
      const msg = err?.message || "Failed to save course.";
      setFormError(msg);
      onNotify(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    try {
      setConfirmDeleteId(null);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      await deleteCourse(id);
      onNotify(`Course "${name}" permanently deleted.`, "success");
      await fetchCourses();
    } catch (e) {
      onNotify("Failed to delete course", "error");
    }
  };

  const handleToggleStatus = async (course: LMSCourse) => {
    const nextStatus: "draft" | "published" = course.status === "published" ? "draft" : "published";
    const updated: LMSCourse = { ...course, status: nextStatus };
    try {
      await saveCourse(updated);
      onNotify(`Course "${course.title}" status changed to ${nextStatus}.`, "success");
      fetchCourses();
    } catch (e) {
      onNotify("Failed to save state", "error");
    }
  };

  return (
    <div className="space-y-6 text-left" id="admin-courses-module">
      
      {/* Top action header trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-display font-black tracking-tight text-slate-800 dark:text-white">Academy Premium Course Builder</h2>
          <p className="text-xs text-slate-400">Add, edit, structure syllabus, price, and publish interactive learning systems to subscribers.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-all"
        >
          <Plus size={14} /> Create Premium Course
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-slate-400 tracking-wider font-mono">LOADING UNIVERSITY CONTENT...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="border border-dashed border-slate-205 dark:border-slate-800 p-12 text-center rounded-3xl">
          <BookOpen className="mx-auto text-slate-400 mb-3" size={32} />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No courses created yet</h3>
          <p className="text-xs text-slate-405 mt-1 max-w-xs mx-auto">Get started by creating your very first premium certification pipeline for corps members and trainees.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Create first course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-[9px] font-bold uppercase rounded font-mono">
                      {course.category}
                    </span>
                    <span className="text-[9px] font-bold uppercase font-mono tracking-wider text-slate-400">
                      ₦{course.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug truncate pr-6">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
                    <span className="flex items-center gap-1"><Layers /> {course.modules?.length || 0} Modules</span>
                    <span className="flex items-center gap-1"><User /> {course.instructorName}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end border-t border-slate-100 md:border-none pt-4 md:pt-0">
                
                {/* Publish status toggle button */}
                <button
                  onClick={() => handleToggleStatus(course)}
                  className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                    course.status === "published"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-555"
                      : "border-slate-300 dark:border-slate-700 text-slate-500 bg-slate-50 dark:bg-slate-850"
                  }`}
                  title="Toggle publish state"
                >
                  {course.status === "published" ? <Eye size={12} /> : <EyeOff size={12} />}
                  {course.status}
                </button>

                <button
                  onClick={() => handleOpenEditModal(course)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-820 text-slate-600 dark:text-white hover:bg-slate-100 cursor-pointer"
                  title="Edit details & syllabus"
                >
                  <Edit3 size={13} />
                </button>

                {confirmDeleteId === course.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(course.id)}
                    className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/15 cursor-pointer"
                    title="Delete Course Permanently"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Heavy-Duty Course Editor Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-md">
                  {editingCourse ? `Edit: ${editingCourse.title}` : "Create Premium Certification Pipeline"}
                </h3>
                <p className="text-[10px] text-slate-400">Configure parameters, metadata, and lesson structures securely.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs font-semibold">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Row 1: Title and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Executive Corporate Branding & Success Blueprints"
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    {COURSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Instructor, Price, Thumbnail URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Instructor Name</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="e.g. Olosunde Louis"
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Pricing (NGN ₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Price in Naira NGN"
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Thumbnail URL Asset</label>
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Course Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 15 Hours"
                    className="w-full bg-slate-50 dark:bg-slate-850 p-2.5 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Full Syllabus Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Draft deep descriptions of academic takeaways, expected certificates, and career options..."
                  className="w-full bg-slate-50 dark:bg-slate-850 p-3 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Default Publish Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                    />
                    Published (Active in portal)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                    />
                    Draft (Hidden from subscribers)
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Permitted Payment Methods per Course</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.includes("paystack")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPaymentMethods([...paymentMethods, "paystack"]);
                        } else {
                          setPaymentMethods(paymentMethods.filter(m => m !== "paystack"));
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    💳 Pay Online (Paystack)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.includes("bank_transfer")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPaymentMethods([...paymentMethods, "bank_transfer"]);
                        } else {
                          setPaymentMethods(paymentMethods.filter(m => m !== "bank_transfer"));
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    🏦 Manual Bank Transfer
                  </label>
                </div>
                {paymentMethods.length === 0 && (
                  <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle size={10} /> Must select at least one method (will default to both if left empty).
                  </p>
                )}
              </div>

              {/* SYLLABUS BUILDER SECTIONS Accordion */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">Interactive Course Syllabus Structure</h4>
                    <p className="text-[10px] text-slate-400">Add modules containing video URLs, assessments, audio streams, or interactive quizzes.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-555 dark:text-indigo-400 font-bold uppercase text-[10px] tracking-wide rounded-xl cursor-pointer"
                  >
                    + Add syllabus module
                  </button>
                </div>

                <div className="space-y-6">
                  {modules.map((mod, mi) => (
                    <div key={mod.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) => {
                              const titleVal = e.target.value;
                              setModules(modules.map(m => m.id === mod.id ? { ...m, title: titleVal } : m));
                            }}
                            placeholder="e.g. Module 1: System foundations"
                            className="bg-transparent font-bold text-xs uppercase tracking-tight outline-none text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            value={mod.description}
                            onChange={(e) => {
                              const descVal = e.target.value;
                              setModules(modules.map(m => m.id === mod.id ? { ...m, description: descVal } : m));
                            }}
                            placeholder="Syllabus module description takeaways"
                            className="bg-transparent font-semibold text-xs outline-none text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveModule(mod.id)}
                          className="text-rose-500 hover:text-rose-700 text-[10px] font-bold uppercase tracking-wide cursor-pointer pl-4 shrink-0"
                        >
                          Remove Module
                        </button>
                      </div>

                      {/* Lesson checklist items details */}
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-bold text-indigo-500">Syllabus lessons inside ({mod.lessons?.length || 0})</span>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(mod.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[9px] px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            + Quick Lesson
                          </button>
                        </div>

                        {mod.lessons?.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">No lessons. Click "+ Quick Lesson" to append content.</p>
                        ) : (
                          <div className="space-y-4">
                            {mod.lessons.map((les, li) => (
                              <div key={les.id} className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                <div className="md:col-span-1 space-y-1">
                                  <span className="block text-[8px] font-mono font-bold uppercase tracking-wide text-theme-green">LESSON {li + 1} TITLE</span>
                                  <input
                                    type="text"
                                    value={les.title}
                                    placeholder="e.g. 1.2 Intro"
                                    onChange={(e) => handleLessonChange(mod.id, les.id, "title", e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 outline-none rounded-lg text-[11px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <span className="block text-[8px] font-mono font-bold uppercase tracking-wide text-theme-green">lesson format</span>
                                  <select
                                    value={les.type}
                                    onChange={(e) => handleLessonChange(mod.id, les.id, "type", e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 outline-none rounded-lg text-[11px]"
                                  >
                                    <option value="video">Streaming video</option>
                                    <option value="pdf">PDF textbook</option>
                                    <option value="audio">Podcast episode</option>
                                    <option value="assignment">Syllabus assignment</option>
                                    <option value="quiz">Interactive Quiz</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <span className="block text-[8px] font-mono font-bold uppercase tracking-wide text-theme-green">duration</span>
                                  <input
                                    type="text"
                                    value={les.duration}
                                    placeholder="e.g. 20 min"
                                    onChange={(e) => handleLessonChange(mod.id, les.id, "duration", e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 outline-none rounded-lg text-[11px]"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-3 md:pt-0">
                                  <label className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={les.isFreePreview || false}
                                      onChange={(e) => handleLessonChange(mod.id, les.id, "isFreePreview", e.target.checked)}
                                    />
                                    Free preview
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLesson(mod.id, les.id)}
                                    className="ml-auto text-rose-500 hover:text-rose-700 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    delete
                                  </button>
                                </div>

                                {/* Form settings depending on lesson format */}
                                <div className="md:col-span-4 border-t border-slate-50 dark:border-slate-900 pt-2 grid grid-cols-1 gap-2">
                                  {les.type === "video" && (
                                    <div className="space-y-1 text-left">
                                      <span className="block text-[8px] font-mono text-slate-400">EMBEDDABLE VIDEO URL (e.g. YouTube standard Embed Link)</span>
                                      <input
                                        type="text"
                                        value={les.videoUrl || ""}
                                        placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                        onChange={(e) => handleLessonChange(mod.id, les.id, "videoUrl", e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 outline-none rounded-lg text-[11px]"
                                      />
                                    </div>
                                  )}

                                  {les.type === "pdf" && (
                                    <div className="space-y-1 text-left">
                                      <span className="block text-[8px] font-mono text-slate-400">PDF TEXTBOOK RESOURCE LINK</span>
                                      <input
                                        type="text"
                                        value={les.pdfUrl || ""}
                                        placeholder="https://raw.githubusercontent.com/..."
                                        onChange={(e) => handleLessonChange(mod.id, les.id, "pdfUrl", e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 outline-none rounded-lg text-[11px]"
                                      />
                                    </div>
                                  )}

                                  {les.type === "assignment" && (
                                    <div className="space-y-1 text-left">
                                      <span className="block text-[8px] font-mono text-slate-400">ASSIGNMENT TAKEAWAY CHALLENGE PROMPT</span>
                                      <textarea
                                        value={les.assignmentText || ""}
                                        placeholder="Explain 3 primary resume goals..."
                                        onChange={(e) => handleLessonChange(mod.id, les.id, "assignmentText", e.target.value)}
                                        rows={2}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 outline-none rounded-lg text-[11px] focus:border-indigo-500 font-semibold"
                                      ></textarea>
                                    </div>
                                  )}

                                  {les.type === "quiz" && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 border border-slate-100/50 dark:border-slate-850">
                                      <span className="block text-[8px] font-mono text-indigo-550 font-bold uppercase tracking-wider">Mini Assessment Quiz Questions (Auto-grader Active)</span>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const prevQ = les.quizQuestions || [];
                                          const newQ = {
                                            id: `q-${Date.now()}`,
                                            question: "Sample Question Text",
                                            options: ["Sample Option A", "Sample Option B", "Sample Option C", "Sample Option D"],
                                            correctAnswer: "Sample Option A"
                                          };
                                          handleLessonChange(mod.id, les.id, "quizQuestions", [...prevQ, newQ]);
                                        }}
                                        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-555 text-[9px] font-bold uppercase px-2 py-1 rounded-md"
                                      >
                                        + Appended assessment question
                                      </button>

                                      {(les.quizQuestions || []).map((qItem, qi) => (
                                        <div key={qItem.id} className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-855 rounded-xl space-y-2 text-left">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-mono font-bold text-slate-400">QUESTION {qi + 1}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const prevQ = les.quizQuestions || [];
                                                handleLessonChange(mod.id, les.id, "quizQuestions", prevQ.filter(q => q.id !== qItem.id));
                                              }}
                                              className="text-rose-500 text-[8px] font-bold uppercase"
                                            >
                                              remove question
                                            </button>
                                          </div>
                                          
                                          <input
                                            type="text"
                                            value={qItem.question}
                                            placeholder="Question Content Title"
                                            onChange={(e) => {
                                              const updatedQuestions = (les.quizQuestions || []).map(q => q.id === qItem.id ? { ...q, question: e.target.value } : q);
                                              handleLessonChange(mod.id, les.id, "quizQuestions", updatedQuestions);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border p-1 rounded text-[10px]"
                                          />

                                          <div className="grid grid-cols-2 gap-2 text-[9px]">
                                            {qItem.options.map((opt, optIndex) => (
                                              <input
                                                key={optIndex}
                                                type="text"
                                                value={opt}
                                                placeholder={`Option ${optIndex + 1}`}
                                                onChange={(e) => {
                                                  const newOpts = [...qItem.options];
                                                  newOpts[optIndex] = e.target.value;
                                                  const updatedQuestions = (les.quizQuestions || []).map(q => q.id === qItem.id ? { ...q, options: newOpts } : q);
                                                  handleLessonChange(mod.id, les.id, "quizQuestions", updatedQuestions);
                                                }}
                                                className="bg-slate-50 dark:bg-slate-900 p-1 rounded"
                                              />
                                            ))}
                                          </div>

                                          <div className="pt-1.5 flex items-center justify-start gap-2">
                                            <span className="text-[8px] font-bold text-slate-500 uppercase">Correct option:</span>
                                            <select
                                              value={qItem.correctAnswer}
                                              onChange={(e) => {
                                                const updatedQuestions = (les.quizQuestions || []).map(q => q.id === qItem.id ? { ...q, correctAnswer: e.target.value } : q);
                                                handleLessonChange(mod.id, les.id, "quizQuestions", updatedQuestions);
                                              }}
                                              className="bg-slate-50 dark:bg-slate-900 text-[9px] p-1 rounded border"
                                            >
                                              {qItem.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions Footer overlay */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3 bg-white dark:bg-slate-900 sticky bottom-0 z-10 py-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 border border-slate-205 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={14} /> {isSaving ? "Saving Course..." : editingCourse ? "Update Syllabus & Course" : "Save & Publish Course"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
