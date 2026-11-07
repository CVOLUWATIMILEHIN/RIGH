import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  FileEdit,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
  Upload,
  Linkedin,
  Mail,
  Calendar,
  Briefcase,
  AlertCircle,
  X,
  Database,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Globe,
  EyeOff,
  ChevronDown
} from "lucide-react";
import {
  VolunteerProfile,
  VolunteerStatus,
  getVolunteers,
  saveVolunteer,
  deleteVolunteer
} from "../lib/db";
import {
  isSupabaseConfigured,
  uploadVolunteerPhotoToSupabase
} from "../lib/supabase";
import {
  generateVolunteerSlug,
  RMA_MAIN_DEPARTMENTS,
  RMA_VOLUNTEER_DEPARTMENTS,
  getPositionsForDepartment,
  getPositionsForDepartments,
  parseVolunteerDepartments,
  formatVolunteerDepartmentsString,
  normalizeVolunteerPositionName
} from "../lib/supabaseCms";

interface AdminVolunteersProps {
  hasWriteAccess: boolean;
  onLogAction?: (msg: string) => void;
}

const VOLUNTEER_SQL_SNIPPET = `-- Run this in your Supabase SQL Editor to ensure the volunteers table & RLS policies exist:
CREATE TABLE IF NOT EXISTS public.volunteers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    position TEXT,
    department TEXT DEFAULT 'CREATIVES',
    departments TEXT[] DEFAULT ARRAY[]::TEXT[],
    biography TEXT NOT NULL,
    expertise TEXT[] DEFAULT ARRAY[]::TEXT[],
    photo_url TEXT NOT NULL,
    photo_path TEXT,
    linkedin_url TEXT,
    email TEXT,
    date_onboarded TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published volunteers" ON public.volunteers;
CREATE POLICY "Public can view published volunteers"
ON public.volunteers FOR SELECT USING (status = 'Published');

DROP POLICY IF EXISTS "Authenticated admins can view all volunteers" ON public.volunteers;
CREATE POLICY "Authenticated admins can view all volunteers"
ON public.volunteers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated admins can insert volunteers" ON public.volunteers;
CREATE POLICY "Authenticated admins can insert volunteers"
ON public.volunteers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can update volunteers" ON public.volunteers;
CREATE POLICY "Authenticated admins can update volunteers"
ON public.volunteers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can delete volunteers" ON public.volunteers;
CREATE POLICY "Authenticated admins can delete volunteers"
ON public.volunteers FOR DELETE TO authenticated USING (true);`;

export default function AdminVolunteers({
  hasWriteAccess,
  onLogAction
}: AdminVolunteersProps) {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | VolunteerStatus>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewVolunteer, setPreviewVolunteer] = useState<VolunteerProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VolunteerProfile | null>(null);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Form fields (10 required/optional fields from specification)
  const [fullName, setFullName] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPath, setPhotoPath] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    RMA_VOLUNTEER_DEPARTMENTS[0]
  ]);
  const [role, setRole] = useState<string>(RMA_MAIN_DEPARTMENTS[0].positions[0]);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState<boolean>(false);
  const [biography, setBiography] = useState<string>("");
  const [expertiseInput, setExpertiseInput] = useState<string>("");
  const [linkedinUrl, setLinkedinUrl] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dateOnboarded, setDateOnboarded] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<VolunteerStatus>("Published");

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission & feedback states
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const list = await getVolunteers();
      setVolunteers(list);
    } catch (err) {
      console.error("Failed to load volunteers:", err);
      showToast("Could not load volunteers list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
    const handleUpdate = () => {
      getVolunteers().then(setVolunteers).catch(() => null);
    };
    window.addEventListener("rma_volunteers_updated", handleUpdate);
    return () => window.removeEventListener("rma_volunteers_updated", handleUpdate);
  }, []);

  // Summary metrics
  const stats = useMemo(() => {
    const total = volunteers.length;
    const published = volunteers.filter((v) => v.status === "Published").length;
    const draft = volunteers.filter((v) => v.status === "Draft").length;
    const archived = volunteers.filter((v) => v.status === "Archived").length;
    return { total, published, draft, archived };
  }, [volunteers]);

  // Available positions based on the currently selected Main Department(s) in the Add/Edit form
  const availablePositionsForForm = useMemo(() => {
    return getPositionsForDepartments(selectedDepartments);
  }, [selectedDepartments]);

  // Positions available in the toolbar Position filter (scoped to departmentFilter if selected)
  const filterPositions = useMemo(() => {
    if (departmentFilter !== "ALL") {
      return [...getPositionsForDepartment(departmentFilter)];
    }
    return RMA_MAIN_DEPARTMENTS.flatMap((d) => d.positions);
  }, [departmentFilter]);

  // Filtered volunteers for management table (by Status, Main Department, Position, and Search)
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;

      const vDepartments = parseVolunteerDepartments(v.department, v.departments);
      const vPosition = normalizeVolunteerPositionName(v.position || v.role, v.department);

      if (departmentFilter !== "ALL") {
        const matchesDept =
          vDepartments.some(
            (d) => d.toLowerCase() === departmentFilter.toLowerCase()
          ) ||
          (v.department || "")
            .toLowerCase()
            .includes(departmentFilter.toLowerCase());
        if (!matchesDept) return false;
      }

      if (positionFilter !== "ALL") {
        const matchesPos =
          vPosition.toLowerCase().includes(positionFilter.toLowerCase()) ||
          (v.role || "").toLowerCase().includes(positionFilter.toLowerCase());
        if (!matchesPos) return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = v.full_name.toLowerCase().includes(q);
        const matchRole =
          vPosition.toLowerCase().includes(q) ||
          (v.role || "").toLowerCase().includes(q);
        const matchDept =
          (v.department || "").toLowerCase().includes(q) ||
          vDepartments.some((d) => d.toLowerCase().includes(q));
        const matchExpertise = (v.expertise || []).some((e) =>
          e.toLowerCase().includes(q)
        );
        return matchName || matchRole || matchDept || matchExpertise;
      }

      return true;
    });
  }, [volunteers, statusFilter, departmentFilter, positionFilter, searchQuery]);

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setPhotoUrl("");
    setPhotoPath("");
    setSelectedDepartments([RMA_VOLUNTEER_DEPARTMENTS[0]]);
    setRole(RMA_MAIN_DEPARTMENTS[0].positions[0]);
    setIsDeptDropdownOpen(false);
    setBiography("");
    setExpertiseInput("");
    setLinkedinUrl("");
    setEmail("");
    setDateOnboarded(new Date().toISOString().slice(0, 10));
    setStatus("Published");
    setUploadingImage(false);
    setUploadProgress(0);
    setUploadStage("");
    setUploadError(null);
    setUploadNotice(null);
    setFormError(null);
  };

  const handleOpenAddForm = () => {
    if (!hasWriteAccess) {
      showToast("Read-only account: You do not have permission to add volunteers.", "error");
      return;
    }
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (v: VolunteerProfile) => {
    if (!hasWriteAccess) {
      showToast("Read-only account: You do not have permission to edit volunteers.", "error");
      return;
    }
    resetForm();
    setEditingId(v.id);
    setFullName(v.full_name);
    setPhotoUrl(v.photo_url);
    setPhotoPath(v.photo_path || "");

    const parsedDepts = parseVolunteerDepartments(v.department, v.departments);
    const activeDepts =
      parsedDepts.length > 0 ? parsedDepts : [RMA_VOLUNTEER_DEPARTMENTS[0]];
    setSelectedDepartments(activeDepts);

    const resolvedPos = normalizeVolunteerPositionName(
      v.position || v.role,
      v.department
    );
    setRole(resolvedPos);

    setBiography(v.biography);
    setExpertiseInput(Array.isArray(v.expertise) ? v.expertise.join(", ") : "");
    setLinkedinUrl(v.linkedin_url || "");
    setEmail(v.email || "");
    setDateOnboarded(v.date_onboarded || new Date().toISOString().slice(0, 10));
    setStatus(v.status === "Archived" ? "Draft" : v.status);
    setIsFormOpen(true);
  };

  const handlePrimaryDepartmentChange = (chosenDept: string) => {
    const nextDepts =
      selectedDepartments.length <= 1
        ? [chosenDept]
        : [chosenDept, ...selectedDepartments.slice(1).filter((d) => d !== chosenDept)];
    setSelectedDepartments(nextDepts);

    const nextPositions = getPositionsForDepartments(nextDepts);
    if (nextPositions.length > 0 && !nextPositions.includes(role)) {
      setRole(nextPositions[0]);
    }
  };

  const toggleDepartmentSelection = (deptName: string) => {
    setSelectedDepartments((prev) => {
      const next = prev.includes(deptName)
        ? prev.filter((d) => d !== deptName)
        : [...prev, deptName];
      const safeNext = next.length > 0 ? next : [RMA_VOLUNTEER_DEPARTMENTS[0]];
      const nextPositions = getPositionsForDepartments(safeNext);
      if (nextPositions.length > 0 && !nextPositions.includes(role)) {
        setRole(nextPositions[0]);
      }
      return safeNext;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadNotice(null);

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validExt = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!validTypes.includes(file.type.toLowerCase()) && !validExt) {
      setUploadError("Please select a valid JPG, JPEG, PNG, or WEBP photograph.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Image file exceeds 15MB. Please choose a smaller photograph.");
      return;
    }

    setUploadingImage(true);
    setUploadProgress(5);
    setUploadStage("Preparing image...");

    const result = await uploadVolunteerPhotoToSupabase(
      file,
      fullName || editingId || "volunteer",
      (percent, stage) => {
        setUploadProgress(percent);
        setUploadStage(stage);
      }
    );

    setUploadingImage(false);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    setPhotoUrl(result.url);
    setPhotoPath(result.path);
    if (result.warning) {
      setUploadNotice(result.warning);
    } else if (result.storageSource === "supabase") {
      setUploadNotice("Optimised & uploaded to Supabase Storage (cms-media).");
    } else {
      setUploadNotice("Photograph optimised for high-speed web display.");
    }
  };

  const buildDraftProfileFromForm = (overrideStatus?: VolunteerStatus): VolunteerProfile => {
    const id = editingId || `vol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const activeDepts =
      selectedDepartments.length > 0
        ? selectedDepartments
        : [RMA_VOLUNTEER_DEPARTMENTS[0]];
    const resolvedDepartmentString = formatVolunteerDepartmentsString(activeDepts);
    const resolvedPosition = role.trim() || getPositionsForDepartment(activeDepts[0])[0];
    const parsedExpertise = expertiseInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const existing = editingId ? volunteers.find((v) => v.id === editingId) : undefined;
    const nowIso = new Date().toISOString();

    return {
      id,
      full_name: fullName.trim(),
      slug:
        existing?.slug ||
        generateVolunteerSlug(fullName.trim(), id.slice(-4)),
      role: resolvedPosition,
      position: resolvedPosition,
      department: resolvedDepartmentString,
      departments: activeDepts,
      biography: biography.trim(),
      expertise: parsedExpertise,
      photo_url: photoUrl,
      photo_path: photoPath,
      linkedin_url: linkedinUrl.trim(),
      email: email.trim(),
      date_onboarded: dateOnboarded || nowIso.slice(0, 10),
      status: overrideStatus || status,
      created_at: existing?.created_at || nowIso,
      updated_at: nowIso
    };
  };

  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Full Name is required.";
    if (!photoUrl.trim()) return "Profile Photograph is required. Please upload a JPG, PNG, or WEBP photo.";
    if (selectedDepartments.length === 0) {
      return "Please select one of the 6 Main Right-Minds Africa Departments.";
    }
    if (!role.trim()) return "Volunteer Position / Specialisation is required.";
    if (!biography.trim()) return "Professional Biography is required.";
    if (linkedinUrl.trim() && !/^https?:\/\//i.test(linkedinUrl.trim())) {
      return "LinkedIn Profile URL should start with https:// (e.g., https://www.linkedin.com/in/...).";
    }
    return null;
  };

  const handleSaveVolunteer = async (targetStatus?: VolunteerStatus) => {
    if (!hasWriteAccess) return;
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    try {
      const record = buildDraftProfileFromForm(targetStatus);
      const res = await saveVolunteer(record);
      await loadVolunteers();
      setIsFormOpen(false);
      resetForm();

      const actionWord = editingId ? "Updated" : "Registered";
      showToast(
        `${actionWord} volunteer "${record.full_name}" (${record.status}).`,
        "success"
      );
      onLogAction?.(
        `🤝 [VOLUNTEERS CMS] ${actionWord} volunteer "${record.full_name}" — Dept: ${record.department}, Position: ${record.role}, Status: ${record.status}${
          res.supabaseSynced ? " (Synced to Supabase)" : ""
        }`
      );
    } catch (err: any) {
      setFormError(err?.message || "Failed to save volunteer profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewFromForm = () => {
    setFormError(null);
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    const draft = buildDraftProfileFromForm();
    setPreviewVolunteer(draft);
  };

  const handleQuickStatusChange = async (
    v: VolunteerProfile,
    nextStatus: VolunteerStatus
  ) => {
    if (!hasWriteAccess) {
      showToast("Read-only account: Cannot modify volunteer status.", "error");
      return;
    }
    const updated: VolunteerProfile = {
      ...v,
      status: nextStatus,
      updated_at: new Date().toISOString()
    };
    await saveVolunteer(updated);
    await loadVolunteers();
    showToast(`"${v.full_name}" is now marked as ${nextStatus}.`, "success");
    onLogAction?.(
      `🤝 [VOLUNTEERS CMS] Changed status for "${v.full_name}" from ${v.status} to ${nextStatus}.`
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !hasWriteAccess) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await deleteVolunteer(target.id, target.photo_path);
    await loadVolunteers();
    showToast(`Deleted volunteer profile for "${target.full_name}".`, "info");
    onLogAction?.(
      `🗑️ [VOLUNTEERS CMS] Permanently deleted volunteer "${target.full_name}" (${target.role}).`
    );
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(VOLUNTEER_SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm transition-all ${
            toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : toastMessage.type === "info"
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {toastMessage.type === "error" ? (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/5 border border-brand-blue/15 text-brand-blue text-[10px] font-mono font-bold uppercase tracking-widest">
              <Users size={12} className="text-brand-orange" />
              <span>Right-Minds Africa • Volunteer Management CMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-brand-blue tracking-tight">
              Volunteer Directory &amp; Onboarding Registry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Manage onboarded volunteers across the 6 Official Right-Minds Africa Main Departments and their specialised positions, upload web-optimised photographs to Supabase Storage, and control public profiles on{" "}
              <a
                href="/volunteers"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
              >
                /volunteers <ExternalLink size={11} />
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/volunteers"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Globe size={14} className="text-brand-blue" />
              <span>View Public Page</span>
            </a>

            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer"
              title="View Supabase Table & RLS Policy SQL"
            >
              <Database size={14} className="text-emerald-600" />
              <span>Supabase RLS &amp; Schema</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddForm}
              disabled={!hasWriteAccess}
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              id="cms-add-new-volunteer-btn"
            >
              <Plus size={16} />
              <span>Add New Volunteer</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Cards: Total, Published, Draft, Archived */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  statusFilter === "ALL" ? "text-slate-200" : "text-slate-500"
                }`}
              >
                Total Volunteers
              </span>
              <Users
                size={16}
                className={statusFilter === "ALL" ? "text-brand-orange" : "text-brand-blue"}
              />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black mt-2">
              {stats.total}
            </p>
            <span
              className={`text-[11px] block mt-1 ${
                statusFilter === "ALL" ? "text-slate-200" : "text-slate-500"
              }`}
            >
              All registered records
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("Published")}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "Published"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/70 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  statusFilter === "Published" ? "text-emerald-100" : "text-emerald-800"
                }`}
              >
                Published Volunteers
              </span>
              <CheckCircle2
                size={16}
                className={statusFilter === "Published" ? "text-white" : "text-emerald-600"}
              />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black mt-2">
              {stats.published}
            </p>
            <span
              className={`text-[11px] block mt-1 ${
                statusFilter === "Published" ? "text-emerald-100" : "text-emerald-700"
              }`}
            >
              Live on /volunteers page
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("Draft")}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "Draft"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-50/60 hover:bg-amber-50 border-amber-200/70 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  statusFilter === "Draft" ? "text-amber-100" : "text-amber-800"
                }`}
              >
                Draft Volunteers
              </span>
              <FileEdit
                size={16}
                className={statusFilter === "Draft" ? "text-white" : "text-amber-600"}
              />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black mt-2">
              {stats.draft}
            </p>
            <span
              className={`text-[11px] block mt-1 ${
                statusFilter === "Draft" ? "text-amber-100" : "text-amber-700"
              }`}
            >
              Hidden until published
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("Archived")}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "Archived"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-100/80 hover:bg-slate-200/60 border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  statusFilter === "Archived" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Archived Volunteers
              </span>
              <Archive
                size={16}
                className={statusFilter === "Archived" ? "text-amber-400" : "text-slate-500"}
              />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black mt-2">
              {stats.archived}
            </p>
            <span
              className={`text-[11px] block mt-1 ${
                statusFilter === "Archived" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              Removed from public view
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar (Filter by Main Department, Position, and Status) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteers by name, main department, position, or expertise..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters: 6 Main Departments + Specialised Positions + Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Main Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPositionFilter("ALL");
              }}
              className="max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue cursor-pointer truncate"
              title="Filter by Main Department"
            >
              <option value="ALL">All 6 Main Departments</option>
              {RMA_MAIN_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.number}. {dept.name}
                </option>
              ))}
            </select>

            {/* Position / Specialisation Filter */}
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue cursor-pointer truncate"
              title="Filter by Position / Specialisation"
            >
              <option value="ALL">
                {departmentFilter === "ALL"
                  ? "All Positions / Specialisations"
                  : `All ${departmentFilter} Positions`}
              </option>
              {departmentFilter === "ALL"
                ? RMA_MAIN_DEPARTMENTS.map((dept) => (
                    <optgroup key={dept.id} label={`${dept.number}. ${dept.name}`}>
                      {dept.positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </optgroup>
                  ))
                : filterPositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | VolunteerStatus)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="ALL">All Statuses ({stats.total})</option>
              <option value="Published">Published ({stats.published})</option>
              <option value="Draft">Draft ({stats.draft})</option>
              <option value="Archived">Archived ({stats.archived})</option>
            </select>

            <button
              type="button"
              onClick={loadVolunteers}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Refresh volunteer records"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Volunteer Management Table */}
        <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Volunteer</th>
                  <th className="py-3.5 px-4">Main Department</th>
                  <th className="py-3.5 px-4">Position / Specialisation</th>
                  <th className="py-3.5 px-4">Date Onboarded</th>
                  <th className="py-3.5 px-4">Publication Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading volunteer profiles...
                    </td>
                  </tr>
                ) : filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 px-4 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto">
                          <Users size={22} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {volunteers.length === 0
                            ? "No Volunteers Registered Yet"
                            : "No Matching Volunteers Found"}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {volunteers.length === 0
                            ? "Click 'Add New Volunteer' to onboard your first volunteer profile into the Right-Minds Africa directory."
                            : "Try clearing your search query or switching the department/position/status filter."}
                        </p>
                        {volunteers.length === 0 && hasWriteAccess && (
                          <button
                            type="button"
                            onClick={handleOpenAddForm}
                            className="mt-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Add New Volunteer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((v) => {
                    const vDepartments = parseVolunteerDepartments(
                      v.department,
                      v.departments
                    );
                    const vPosition = normalizeVolunteerPositionName(
                      v.position || v.role,
                      v.department
                    );
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Photograph + Full Name + Private Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {v.photo_url ? (
                                <img
                                  src={v.photo_url}
                                  alt={v.full_name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-blue text-white font-bold text-xs">
                                  {v.full_name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {v.full_name}
                              </p>
                              {v.email ? (
                                <p
                                  className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5"
                                  title="Private admin email (hidden on public website)"
                                >
                                  <Mail size={10} />
                                  <span>{v.email}</span>
                                  <span className="text-[9px] px-1 py-0.2 bg-slate-100 text-slate-500 rounded font-mono">
                                    Private
                                  </span>
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  /{v.slug}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Main Department (from the 6 Main RMA Departments) */}
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="flex flex-wrap gap-1">
                            {(vDepartments.length > 0
                              ? vDepartments
                              : [RMA_VOLUNTEER_DEPARTMENTS[0]]
                            ).map((dept, dIdx) => (
                              <span
                                key={dIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-blue/5 text-brand-blue font-bold text-[11px] leading-snug"
                              >
                                <Briefcase
                                  size={11}
                                  className="text-brand-orange shrink-0"
                                />
                                <span className="truncate max-w-[200px]" title={dept}>
                                  {dept}
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Specific Position / Role */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {vPosition}
                          </span>
                          {v.expertise && v.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {v.expertise.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                              {v.expertise.length > 2 && (
                                <span className="text-[10px] text-slate-400">
                                  +{v.expertise.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Date Onboarded */}
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {v.date_onboarded
                            ? new Date(v.date_onboarded).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })
                            : "—"}
                        </td>

                        {/* Publication Status */}
                        <td className="py-3.5 px-4">
                          {v.status === "Published" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Published
                            </span>
                          )}
                          {v.status === "Draft" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Draft
                            </span>
                          )}
                          {v.status === "Archived" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              Archived
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Preview Action */}
                            <button
                              type="button"
                              onClick={() => setPreviewVolunteer(v)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Preview Volunteer Profile"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(v)}
                              disabled={!hasWriteAccess}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-blue/10 hover:bg-brand-blue hover:text-white text-brand-blue font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                              title="Edit Volunteer Profile"
                            >
                              <FileEdit size={12} />
                              <span>Edit</span>
                            </button>

                            {/* Publish / Unpublish toggle */}
                            {v.status === "Published" ? (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(v, "Draft")}
                                disabled={!hasWriteAccess}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                                title="Unpublish (Move to Draft)"
                              >
                                <EyeOff size={12} />
                                <span>Unpublish</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(v, "Published")}
                                disabled={!hasWriteAccess}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                                title="Publish Profile to Website"
                              >
                                <CheckCircle2 size={12} />
                                <span>Publish</span>
                              </button>
                            )}

                            {/* Archive / Restore Action */}
                            {v.status !== "Archived" ? (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(v, "Archived")}
                                disabled={!hasWriteAccess}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                                title="Archive Volunteer"
                              >
                                <Archive size={12} />
                                <span>Archive</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(v, "Draft")}
                                disabled={!hasWriteAccess}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                                title="Restore Archived Volunteer"
                              >
                                <RotateCcw size={12} />
                                <span>Restore</span>
                              </button>
                            )}

                            {/* Delete Action with Confirmation */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(v)}
                              disabled={!hasWriteAccess}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer disabled:opacity-40"
                              title="Delete Volunteer Profile"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================================================================
          ADD / EDIT VOLUNTEER MODAL FORM
          =================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-brand-blue text-white px-6 py-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-orange block">
                  {editingId ? "Edit Volunteer Profile" : "Manual Volunteer Onboarding"}
                </span>
                <h3 className="text-lg font-display font-extrabold tracking-tight mt-0.5">
                  {editingId ? `Update ${fullName || "Volunteer"}` : "Register New Onboarded Volunteer"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Adewale Pelumi Grace"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* 2. Profile Photograph Upload (JPG, JPEG, PNG, WEBP) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Image Preview Box */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0 relative shadow-2xs">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Volunteer preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Upload size={22} className="mx-auto mb-1 text-brand-orange" />
                        <span className="text-[10px] font-semibold block">Photo Preview</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div>
                      <label className="block text-xs font-extrabold text-brand-blue uppercase tracking-wider">
                        2. Profile Photograph <span className="text-rose-600">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accepted formats: <strong>JPG, JPEG, PNG, WEBP</strong>. Automatically optimised for fast website loading and uploaded to Supabase Storage.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={14} />
                        <span>
                          {uploadingImage
                            ? "Uploading..."
                            : photoUrl
                            ? "Replace Photograph"
                            : "Upload Photograph"}
                        </span>
                      </button>

                      {photoUrl && !uploadingImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl("");
                            setPhotoPath("");
                            setUploadNotice(null);
                          }}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {uploadingImage && (
                      <div className="space-y-1 pt-1">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-orange transition-all duration-200 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-brand-blue font-semibold">
                          {uploadProgress}% — {uploadStage}
                        </p>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle size={13} />
                        <span>{uploadError}</span>
                      </p>
                    )}

                    {uploadNotice && !uploadError && (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>{uploadNotice}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Main Department & 4. Specific Volunteer Position / Role (Stored Separately) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                {/* Step 1: Select Main Department (6 Official RMA Main Departments) */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-extrabold text-brand-blue uppercase tracking-wider">
                        3. Main Department (6 Official RMA Departments){" "}
                        <span className="text-rose-600">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        First select one of the 6 Main Right-Minds Africa Departments. Relevant positions will appear below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDeptDropdownOpen((prev) => !prev)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-brand-blue inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                    >
                      <span>
                        {isDeptDropdownOpen
                          ? "Hide Multi-Department Selection"
                          : `Multi-Department (${selectedDepartments.length})`}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform ${
                          isDeptDropdownOpen ? "rotate-180 text-brand-orange" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Primary Main Department Selector */}
                  <select
                    value={selectedDepartments[0] || RMA_VOLUNTEER_DEPARTMENTS[0]}
                    onChange={(e) => handlePrimaryDepartmentChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-blue cursor-pointer"
                  >
                    {RMA_MAIN_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.number}. {dept.name}
                      </option>
                    ))}
                  </select>

                  {/* Optional Multi-Department Checkboxes */}
                  {isDeptDropdownOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {RMA_MAIN_DEPARTMENTS.map((dept) => {
                        const isChecked = selectedDepartments.includes(dept.name);
                        return (
                          <label
                            key={dept.id}
                            onClick={() => toggleDepartmentSelection(dept.name)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                              isChecked
                                ? "bg-brand-blue/5 border-brand-blue text-brand-blue font-bold"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-slate-300 text-brand-orange focus:ring-brand-orange cursor-pointer"
                            />
                            <span>
                              <span className="font-mono text-[10px] text-brand-orange font-bold mr-1">
                                {dept.number}.
                              </span>
                              {dept.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Main Department Pills */}
                  {selectedDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDepartments.map((dept, idx) => (
                        <span
                          key={dept}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-brand-blue/20 text-brand-blue text-[11px] font-bold shadow-2xs"
                        >
                          <Briefcase size={11} className="text-brand-orange shrink-0" />
                          <span>
                            {idx === 0 && selectedDepartments.length > 1 ? "Primary: " : ""}
                            {dept}
                          </span>
                          {selectedDepartments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleDepartmentSelection(dept)}
                              className="p-0.5 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 cursor-pointer"
                              title="Remove department"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Select Specialised Position within the Chosen Department */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-extrabold text-brand-blue uppercase tracking-wider">
                      4. Volunteer Position / Specialisation{" "}
                      <span className="text-rose-600">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select the volunteer&apos;s specialised position within{" "}
                      <strong>{selectedDepartments.join(" & ")}</strong> (stored separately from the main department).
                    </p>
                  </div>

                  {/* Interactive Specialised Position Pills for the Selected Department */}
                  <div className="flex flex-wrap gap-2">
                    {availablePositionsForForm.map((pos) => {
                      const isSelected = role.toLowerCase() === pos.toLowerCase();
                      return (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setRole(pos)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <Check size={13} className="text-brand-orange shrink-0" />
                          )}
                          <span>{pos}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Position Dropdown + Custom Title Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Department Positions Dropdown
                      </span>
                      <select
                        value={
                          availablePositionsForForm.includes(role)
                            ? role
                            : availablePositionsForForm[0] || ""
                        }
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-blue cursor-pointer"
                      >
                        {availablePositionsForForm.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Selected Position Title (Editable)
                      </span>
                      <input
                        type="text"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Graphic Design & Branding"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Professional Biography */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    5. Professional Biography <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {biography.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Write a clear, human, and inspiring summary of the volunteer's background, dedication, and contributions to Right-Minds Africa..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 leading-relaxed focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* 6. Areas of Expertise & 9. Date Onboarded */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    6. Areas of Expertise{" "}
                    <span className="text-[11px] font-normal text-slate-400">
                      (Comma-separated skills)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder="e.g., Canva, Brand Identity, Event Coordination, Copywriting"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    9. Date Onboarded
                  </label>
                  <input
                    type="date"
                    value={dateOnboarded}
                    onChange={(e) => setDateOnboarded(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              {/* 7. LinkedIn Profile & 8. Private Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    7. LinkedIn Profile{" "}
                    <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      8. Email Address
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck size={11} />
                      Private (Admin Only)
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="volunteer@example.com (Never shown publicly)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              {/* 10. Publication Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-brand-blue uppercase tracking-wider">
                    10. Publication Status
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Only volunteers marked as <strong>Published</strong> appear on the public <code>/volunteers</code> page.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("Draft")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === "Draft"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("Published")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === "Published"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePreviewFromForm}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye size={14} />
                <span>Preview Profile</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving || uploadingImage}
                  onClick={() => handleSaveVolunteer("Draft")}
                  className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={saving || uploadingImage}
                  onClick={() => handleSaveVolunteer(status)}
                  className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  <span>
                    {saving
                      ? "Saving..."
                      : status === "Published"
                      ? editingId
                        ? "Update & Publish"
                        : "Publish Volunteer"
                      : "Save Volunteer"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          PROFILE PREVIEW MODAL (ADMIN PREVIEW BEFORE PUBLISHING)
          =================================================================== */}
      {previewVolunteer && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            <div className="bg-brand-blue text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-orange text-white">
                  Public Card &amp; Profile Preview
                </span>
                <span className="text-xs text-slate-200 font-medium">
                  Status: <strong>{previewVolunteer.status}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVolunteer(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-brand-orange/30 shadow-md shrink-0 bg-slate-100">
                  <img
                    src={previewVolunteer.photo_url}
                    alt={previewVolunteer.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {parseVolunteerDepartments(
                      previewVolunteer.department,
                      previewVolunteer.departments
                    ).map((dept, i) => (
                      <span
                        key={i}
                        className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[11px] font-bold"
                      >
                        Department: {dept}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-brand-blue">
                    {previewVolunteer.full_name}
                  </h3>
                  <p className="text-sm font-bold text-brand-orange">
                    Position: {previewVolunteer.position || previewVolunteer.role}
                  </p>
                  {previewVolunteer.date_onboarded && (
                    <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                      <Calendar size={12} />
                      <span>
                        Onboarded:{" "}
                        {new Date(previewVolunteer.date_onboarded).toLocaleDateString("en-GB", {
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Biography
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {previewVolunteer.biography}
                </p>
              </div>

              {previewVolunteer.expertise && previewVolunteer.expertise.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previewVolunteer.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Private email address is hidden on the public website.
                </span>

                <button
                  type="button"
                  onClick={() => setPreviewVolunteer(null)}
                  className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          DELETE CONFIRMATION DIALOG
          =================================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-slate-900">
                  Delete Volunteer Profile?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Are you sure you want to permanently delete{" "}
                  <strong>{deleteTarget.full_name}</strong> ({deleteTarget.role})? If you only want to hide them from the public website, you can <strong>Archive</strong> or <strong>Unpublish</strong> them instead.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = deleteTarget;
                  setDeleteTarget(null);
                  handleQuickStatusChange(target, "Archived");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Archive Instead
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUPABASE SQL & RLS VERIFICATION MODAL
          =================================================================== */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database size={18} className="text-brand-orange" />
                <h3 className="text-base font-display font-black text-brand-blue">
                  Supabase Volunteers Table &amp; Row Level Security (RLS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Supabase connection status:{" "}
              <strong className={isSupabaseConfigured ? "text-emerald-700" : "text-amber-700"}>
                {isSupabaseConfigured
                  ? "Connected to Supabase Client"
                  : "Using Cloud Firestore + Local Sync (Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in Vercel/env to sync directly with Supabase)"}
              </strong>
              . Run the SQL below in your Supabase SQL Editor if you have not yet created the{" "}
              <code>public.volunteers</code> table.
            </p>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                {VOLUNTEER_SQL_SNIPPET}
              </pre>
              <button
                type="button"
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSql ? "Copied SQL" : "Copy SQL"}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
