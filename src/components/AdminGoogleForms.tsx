import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  RefreshCw, 
  Search, 
  Plus, 
  ExternalLink, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  ArrowRight, 
  Download, 
  Check, 
  Cloud,
  Layers,
  Sparkles,
  Link2,
  Trash2,
  X,
  FileSpreadsheet,
  Globe
} from "lucide-react";
import { getFirebaseAuth, getFirestoreDb } from "../lib/db";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";

// Module level in-memory token cache (retained during SPA navigation but cleared on full refresh)
let cachedAccessToken: string | null = null;
let cachedUserInfo: { email: string; name: string; photoURL?: string } | null = null;

interface GoogleFormFile {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

interface FormQuestion {
  questionId: string;
  title: string;
  required: boolean;
  type?: string;
}

interface FormDetail {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle: string;
  };
  items?: Array<{
    itemId: string;
    title: string;
    description?: string;
    questionItem?: {
      question: {
        questionId: string;
        required?: boolean;
        choiceQuestion?: {
          type: string;
          options: Array<{ value: string }>;
        };
      };
    };
  }>;
}

interface FormResponse {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers: {
    [questionId: string]: {
      questionId: string;
      textAnswers: {
        answers: Array<{ value: string }>;
      };
    };
  };
}

interface AdminGoogleFormsProps {
  hasWriteAccess: boolean;
  onLogAction: (log: string) => void;
}

export default function AdminGoogleForms({ hasWriteAccess, onLogAction }: AdminGoogleFormsProps) {
  const [accessToken, setAccessToken] = useState<string | null>(cachedAccessToken);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; photoURL?: string } | null>(cachedUserInfo);
  
  // Workspace UI lists and loading states
  const [formsList, setFormsList] = useState<GoogleFormFile[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Active form inspect details
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormDetail | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"structure" | "responses" | "embed">("structure");

  // Dynamic integration state (saving linked intake form to Firestore)
  const [firestoreActiveFormId, setFirestoreActiveFormId] = useState<string | null>(null);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Create Form modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  // Auto-dismiss feedbacks
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Read active Google Form setting from Firestore on mount
  useEffect(() => {
    const fetchActiveFormId = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        const docRef = doc(db, "settings", "google_forms");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFirestoreActiveFormId(snap.data().activeFormId || null);
        }
      } catch (err) {
        console.warn("Could not load active Google Form settings from Firestore:", err);
      }
    };
    fetchActiveFormId();
  }, []);

  // Fetch Google Forms files from Google Drive
  const fetchForms = async (token: string) => {
    setIsLoadingForms(true);
    try {
      const query = encodeURIComponent("mimeType='application/vnd.google-apps.form' and trashed=false");
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&pageSize=100&orderBy=modifiedTime+desc`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Drive API responded with status ${res.status}`);
      }
      
      const data = await res.json();
      setFormsList(data.files || []);
      onLogAction(`📁 [WORKSPACE] Fetched ${data.files?.length || 0} Google Forms from Google Drive successfully.`);
    } catch (err: any) {
      console.error("Failed to fetch forms:", err);
      setFeedback({ text: "Failed to load Google Forms from your Drive. Please re-authenticate.", type: "error" });
    } finally {
      setIsLoadingForms(false);
    }
  };

  // Perform OAuth Sign-In with Firebase Auth
  const handleConnect = async () => {
    setFeedback({ text: "Opening Google authentication gateway...", type: "info" });
    try {
      const auth = await getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      
      // Request Workspace scopes
      provider.addScope("https://www.googleapis.com/auth/drive");
      provider.addScope("https://www.googleapis.com/auth/drive.file");
      provider.addScope("https://www.googleapis.com/auth/forms.body");
      provider.addScope("https://www.googleapis.com/auth/forms.responses.readonly");
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) {
        throw new Error("Did not receive an access token from Google Auth.");
      }

      // Store in memory
      cachedAccessToken = token;
      cachedUserInfo = {
        email: result.user.email || "",
        name: result.user.displayName || "Google Workspace Admin",
        photoURL: result.user.photoURL || undefined
      };

      setAccessToken(token);
      setCurrentUser(cachedUserInfo);
      setFeedback({ text: `Successfully connected Google account: ${cachedUserInfo.email}`, type: "success" });
      onLogAction(`🔐 [WORKSPACE] Authenticated Google Workspace sessions for ${cachedUserInfo.email}`);
      
      // Auto-fetch forms
      fetchForms(token);
    } catch (err: any) {
      console.error("Auth failed:", err);
      setFeedback({ text: err.message || "Google Authentication failed. Please accept required permissions.", type: "error" });
    }
  };

  // Disconnect Workspace Hub session
  const handleDisconnect = () => {
    cachedAccessToken = null;
    cachedUserInfo = null;
    setAccessToken(null);
    setCurrentUser(null);
    setFormsList([]);
    setSelectedForm(null);
    setSelectedFormId(null);
    setResponses([]);
    setFeedback({ text: "Disconnected Google Workspace Hub. In-memory tokens cleared.", type: "info" });
    onLogAction(`🔐 [WORKSPACE] Terminated and cleared active Google Workspace API session token.`);
  };

  // Auto load forms list if token is pre-cached
  useEffect(() => {
    if (accessToken) {
      fetchForms(accessToken);
    }
  }, [accessToken]);

  // Load selected form structure details and submissions responses
  const handleSelectForm = async (formId: string) => {
    if (!accessToken) return;
    setSelectedFormId(formId);
    setIsLoadingDetails(true);
    setSelectedForm(null);
    setResponses([]);

    try {
      // 1. Fetch form metadata
      const metaRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!metaRes.ok) throw new Error(`Forms API details call failed with status ${metaRes.status}`);
      const formDetail: FormDetail = await metaRes.ok ? await metaRes.json() : null;
      setSelectedForm(formDetail);

      // 2. Fetch submissions / responses
      const respRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (respRes.status === 403) {
        // May fail if user did not authorize forms.responses.readonly, but keep details
        onLogAction(`⚠️ [WORKSPACE] Insufficient scopes to fetch responses for Form ID: ${formId}`);
      } else if (respRes.ok) {
        const respData = await respRes.json();
        setResponses(respData.responses || []);
        onLogAction(`📊 [WORKSPACE] Fetched ${respData.responses?.length || 0} user responses for Google Form: "${formDetail.info.title}"`);
      }
      
    } catch (err: any) {
      console.error("Failed to fetch form details:", err);
      setFeedback({ text: "Failed to load Google Form details. Check if the file exists and you have permissions.", type: "error" });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Create a brand new Google Form in 1-Click
  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFormTitle.trim()) return;

    setIsCreatingForm(true);
    setFeedback({ text: "Generating new Google Form in your Drive...", type: "info" });
    try {
      const res = await fetch("https://forms.googleapis.com/v1/forms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          info: {
            title: newFormTitle
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to create Google Form: Status ${res.status}`);
      }

      const created: FormDetail = await res.json();
      onLogAction(`✨ [WORKSPACE] Created new Google Form in Drive: "${newFormTitle}" (ID: ${created.formId})`);
      setFeedback({ text: `Form "${newFormTitle}" successfully created!`, type: "success" });
      
      // Close modal & reset
      setIsCreateModalOpen(false);
      setNewFormTitle("");
      
      // Reload list and auto select the new form
      await fetchForms(accessToken);
      handleSelectForm(created.formId);
    } catch (err: any) {
      console.error("Create form failed:", err);
      setFeedback({ text: err.message || "Could not create form. Try again.", type: "error" });
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Register form ID to Firestore settings/google_forms document
  const handleSaveToFirestore = async () => {
    if (!selectedFormId || !selectedForm) return;

    const confirmSave = window.confirm(
      `Are you sure you want to map "${selectedForm.info.title}" as the Official Intake form in Firestore? This will link it dynamically across public application entry points.`
    );
    if (!confirmSave) return;

    setIsSyncingFirestore(true);
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const db = await getFirestoreDb();
      const docRef = doc(db, "settings", "google_forms");
      await setDoc(docRef, {
        activeFormId: selectedFormId,
        activeFormTitle: selectedForm.info.title,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || "Admin"
      }, { merge: true });

      setFirestoreActiveFormId(selectedFormId);
      setFeedback({ text: "Form successfully registered as active intake application inside Firestore!", type: "success" });
      onLogAction(`💾 [WORKSPACE] Linked Google Form "${selectedForm.info.title}" as official active registration gateway in cloud Firestore.`);
    } catch (err: any) {
      console.error("Firestore sync failed:", err);
      setFeedback({ text: "Failed to update Firestore settings.", type: "error" });
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Remove linked form mapping from Firestore
  const handleRemoveFirestoreLink = async () => {
    const confirmRemove = window.confirm(
      "Are you sure you want to clear the active Google Form integration from Firestore? Public portals will revert to fallback onboarding flows."
    );
    if (!confirmRemove) return;

    setIsSyncingFirestore(true);
    try {
      const { doc, updateDoc, deleteField } = await import("firebase/firestore");
      const db = await getFirestoreDb();
      const docRef = doc(db, "settings", "google_forms");
      await updateDoc(docRef, {
        activeFormId: deleteField()
      });
      setFirestoreActiveFormId(null);
      setFeedback({ text: "Cleared Google Form connection from cloud configurations.", type: "success" });
      onLogAction("💾 [WORKSPACE] Cleared Google Form registration mapping from central settings.");
    } catch (err) {
      console.error("Firestore update failed:", err);
      setFeedback({ text: "Failed to clear Firestore link.", type: "error" });
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Map Google Form questions for rendering responses
  const getQuestionsList = (): FormQuestion[] => {
    if (!selectedForm || !selectedForm.items) return [];
    
    const questions: FormQuestion[] = [];
    selectedForm.items.forEach(item => {
      if (item.questionItem) {
        questions.push({
          questionId: item.questionItem.question.questionId,
          title: item.title || "Untitled Question",
          required: !!item.questionItem.question.required,
          type: item.questionItem.question.choiceQuestion?.type || "TEXT"
        });
      }
    });
    return questions;
  };

  const questionsList = getQuestionsList();

  // Export form responses as CSV file
  const handleDownloadCSV = () => {
    if (!selectedForm || responses.length === 0) return;

    const headers = ["Response ID", "Submitted Time", ...questionsList.map(q => q.title)];
    const csvRows = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",")];

    responses.forEach(resp => {
      const row = [
        resp.responseId,
        new Date(resp.lastSubmittedTime || resp.createTime).toLocaleString(),
        ...questionsList.map(q => {
          const ans = resp.answers[q.questionId];
          const val = ans?.textAnswers?.answers?.map(a => a.value).join("; ") || "";
          return `"${val.replace(/"/g, '""')}"`;
        })
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedForm.info.title.replace(/\s+/g, "_")}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onLogAction(`📥 [WORKSPACE] Exported ${responses.length} responses for "${selectedForm.info.title}" to CSV.`);
  };

  const filteredFormsList = formsList.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Portal Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#103D2E]/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-[#103D2E]" />
            </div>
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">
              Google Forms Workspace Gateway
            </h2>
          </div>
          <p className="text-2xs text-slate-400 font-semibold tracking-wide uppercase mt-1">
            Connect surveys, admission rosters, and check-in audits directly from your drive
          </p>
        </div>

        {accessToken && currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="h-6 w-6 rounded-full border border-[#103D2E]/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-[#103D2E] text-amber-300 flex items-center justify-center text-3xs font-bold font-mono">
                  {currentUser.email.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <p className="text-3xs font-black text-slate-700 leading-none truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[9px] font-mono text-slate-400 mt-0.5 leading-none">{currentUser.email}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#2ECC71] animate-pulse shrink-0 ml-1" />
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-[#E76F51]/10 text-[#E76F51] hover:bg-[#E76F51] hover:text-white rounded-xl text-2xs font-extrabold uppercase tracking-wider cursor-pointer border border-[#E76F51]/10 transition-all"
            >
              Disconnect Session
            </button>
          </div>
        )}
      </div>

      {/* 2. Feedback Messages Overlay */}
      {feedback && (
        <div className={`p-4 rounded-xl text-2xs font-bold border flex items-center gap-2.5 ${
          feedback.type === "success" ? "bg-[#2ECC71]/10 border-[#2ECC71]/30 text-emerald-800" :
          feedback.type === "error" ? "bg-[#E76F51]/10 border-[#E76F51]/30 text-[#E76F51]" :
          "bg-blue-50 border-blue-100 text-blue-800"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2ECC71]" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 3. Main Dashboard Body Grid */}
      {!accessToken ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-[#FAF8F3] border border-amber-500/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ClipboardList className="h-8 w-8 text-[#103D2E]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-tight">
              Connect Google Workspace Directory
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Authenticate secure admin operations with your Google Drive account. This enables you to link forms, import student rosters, and track survey answers right inside the Operations Centre.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left max-w-md mx-auto space-y-2.5">
            <h4 className="text-3xs font-black tracking-widest text-slate-400 uppercase font-mono">
              Workspace Capabilities Enabled:
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex items-center gap-2 text-3xs font-extrabold text-slate-600">
                <Check className="h-3.5 w-3.5 text-[#2ECC71]" />
                <span>Browse and Search Google Forms inside your Drive</span>
              </div>
              <div className="flex items-center gap-2 text-3xs font-extrabold text-slate-600">
                <Check className="h-3.5 w-3.5 text-[#2ECC71]" />
                <span>Create surveys or intake applications with 1-click</span>
              </div>
              <div className="flex items-center gap-2 text-3xs font-extrabold text-slate-600">
                <Check className="h-3.5 w-3.5 text-[#2ECC71]" />
                <span>Inspect question schemas, choices, and requirements</span>
              </div>
              <div className="flex items-center gap-2 text-3xs font-extrabold text-slate-600">
                <Check className="h-3.5 w-3.5 text-[#2ECC71]" />
                <span>Retrieve response logs and export submissions to CSV</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-[#103D2E] hover:bg-[#0b2b20] text-[#E9C46A] font-black rounded-xl text-2xs uppercase tracking-wider cursor-pointer flex items-center gap-2 mx-auto shadow-md shadow-[#103D2E]/10 transition-all transform hover:-translate-y-0.5"
            >
              <Cloud className="h-4 w-4" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: File Listing & Controls (1/3 Width) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs flex flex-col h-[700px]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider font-display">
                Forms List
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-2.5 py-1 bg-[#103D2E] hover:bg-[#0b2b20] text-[#E9C46A] font-black rounded-lg text-3xs uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-xs transition-all"
              >
                <Plus size={12} />
                <span>New Form</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Google Forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F3]/60 border border-[#103D2E]/10 rounded-xl font-bold text-slate-700 text-3xs outline-none focus:border-[#103D2E]/35 focus:bg-white transition-all"
              />
            </div>

            {/* List scrollbox */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {isLoadingForms ? (
                <div className="py-20 text-center space-y-2.5">
                  <RefreshCw className="h-5 w-5 text-[#103D2E] animate-spin mx-auto" />
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-widest font-mono">Scanning Google Drive...</p>
                </div>
              ) : filteredFormsList.length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <AlertCircle className="h-5 w-5 mx-auto text-slate-350" />
                  <p className="text-3xs font-bold uppercase tracking-wide">No Google Forms matched.</p>
                </div>
              ) : (
                filteredFormsList.map((form) => {
                  const isSelected = selectedFormId === form.id;
                  const isRegistered = firestoreActiveFormId === form.id;
                  
                  return (
                    <div
                      key={form.id}
                      onClick={() => handleSelectForm(form.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-[#103D2E]/5 border-[#103D2E] shadow-xs" 
                          : "bg-white hover:bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-2xs font-bold text-slate-700 leading-snug line-clamp-2 max-w-[85%]">
                          {form.name}
                        </h4>
                        {isRegistered && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase font-mono tracking-wide shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[9px] font-mono text-slate-400">
                          ID: {form.id.slice(0, 10)}...
                        </span>
                        <span className="text-[9px] font-mono text-slate-450">
                          {new Date(form.modifiedTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom active state summary */}
            {firestoreActiveFormId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-emerald-600" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Firestore Active Key</span>
                  </div>
                  <p className="text-3xs font-bold text-slate-600 truncate mt-0.5">
                    ID: {firestoreActiveFormId}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFirestoreLink(); }}
                  disabled={isSyncingFirestore}
                  className="p-1 rounded text-[#E76F51] hover:bg-rose-50 border border-transparent hover:border-[#E76F51]/10 cursor-pointer transition-all"
                  title="Clear integration link"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Detail Inspector Desk (2/3 Width) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col h-[700px]">
            
            {isLoadingDetails ? (
              <div className="flex-1 flex flex-col justify-center items-center space-y-3">
                <RefreshCw className="h-7 w-7 text-[#103D2E] animate-spin" />
                <p className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                  Loading form schema & answers...
                </p>
              </div>
            ) : !selectedForm ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-12 space-y-4">
                <div className="w-14 h-14 bg-[#FAF8F3] rounded-2xl flex items-center justify-center border border-[#103D2E]/5 shadow-inner">
                  <Layers className="h-6 w-6 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider font-display">
                    Form Schema Inspector
                  </h3>
                  <p className="text-2xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Select any Google Form file on the left navigator panel to review questions, inspect live student submissions, or connect the registration fields.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full min-w-0">
                
                {/* Header Information Card */}
                <div className="border-b border-slate-100 pb-4 space-y-3 shrink-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase font-mono tracking-wider">
                          Google Forms API
                        </span>
                        {firestoreActiveFormId === selectedForm.formId && (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase font-mono tracking-wider">
                            Linked Portal Intake
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight mt-1 truncate">
                        {selectedForm.info.title}
                      </h3>
                      {selectedForm.info.description && (
                        <p className="text-2xs text-slate-400 mt-1 line-clamp-1 italic">
                          {selectedForm.info.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://docs.google.com/forms/d/${selectedForm.formId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 border border-slate-150 hover:bg-slate-50 text-slate-600 rounded-lg text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <span>Google Editor</span>
                        <ExternalLink size={10} />
                      </a>

                      {firestoreActiveFormId !== selectedForm.formId ? (
                        <button
                          onClick={handleSaveToFirestore}
                          disabled={isSyncingFirestore}
                          className="px-3 py-1.5 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-black rounded-lg text-3xs uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all shadow-xs"
                        >
                          <Link2 size={12} />
                          <span>Link Active Portal</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleRemoveFirestoreLink}
                          disabled={isSyncingFirestore}
                          className="px-3 py-1.5 bg-[#E76F51]/10 hover:bg-[#E76F51] text-[#E76F51] hover:text-white border border-[#E76F51]/20 font-black rounded-lg text-3xs uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <Trash2 size={12} />
                          <span>Unlink Portal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Navigation Sub-Tabs */}
                  <div className="flex border-b border-slate-100 pt-1">
                    {(["structure", "responses", "embed"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-3xs font-black uppercase tracking-wider border-b-2 -mb-px cursor-pointer transition-all ${
                          activeTab === tab 
                            ? "border-[#103D2E] text-[#103D2E]" 
                            : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {tab === "structure" ? "Form Questions" : tab === "responses" ? `Submissions (${responses.length})` : "IFrame Integration"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-tab viewport */}
                <div className="flex-1 overflow-y-auto pt-4 min-h-0">
                  
                  {/* Tab: Structure/Questions */}
                  {activeTab === "structure" && (
                    <div className="space-y-3.5 pr-1">
                      <div className="flex justify-between items-center text-left bg-[#FAF8F3]/60 p-3 rounded-xl border border-[#103D2E]/5">
                        <span className="text-3xs font-black uppercase tracking-widest text-slate-400 font-mono">
                          Question Registry Structure
                        </span>
                        <span className="text-3xs font-mono font-bold text-slate-500">
                          {questionsList.length} Input Fields
                        </span>
                      </div>

                      {questionsList.length === 0 ? (
                        <div className="py-12 text-center text-slate-450 space-y-1 bg-slate-50 rounded-xl">
                          <AlertCircle size={18} className="mx-auto text-slate-350" />
                          <p className="text-3xs font-extrabold uppercase">No question fields identified.</p>
                          <p className="text-[10px] text-slate-400">Open this form in the Google Forms editor to add some fields.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {questionsList.map((q, i) => (
                            <div key={q.questionId} className="p-3 border border-slate-100 bg-white rounded-xl text-left flex justify-between items-center hover:bg-slate-50/50 transition-all">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="h-4 w-4 rounded-full bg-slate-100 text-[10px] font-mono font-bold text-slate-500 flex items-center justify-center">
                                    {i + 1}
                                  </span>
                                  <h4 className="text-2xs font-extrabold text-slate-700">
                                    {q.title}
                                  </h4>
                                  {q.required && (
                                    <span className="text-[#E76F51] text-xs font-bold leading-none" title="Required field">*</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 pl-5">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-mono text-slate-400 uppercase">
                                    Type: {q.type}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    ID: {q.questionId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Submissions Responses */}
                  {activeTab === "responses" && (
                    <div className="space-y-4 h-full flex flex-col min-h-0">
                      
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-3xs font-black uppercase tracking-widest text-slate-400 font-mono">
                          Submissions Database
                        </span>
                        {responses.length > 0 && (
                          <button
                            onClick={handleDownloadCSV}
                            className="px-2.5 py-1 bg-emerald-550 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-lg text-3xs uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-xs transition-all"
                          >
                            <FileSpreadsheet size={12} />
                            <span>Export CSV</span>
                          </button>
                        )}
                      </div>

                      {responses.length === 0 ? (
                        <div className="flex-1 flex flex-col justify-center items-center py-20 text-center text-slate-400 space-y-2 bg-slate-50 rounded-xl">
                          <AlertCircle className="h-5 w-5 text-slate-350" />
                          <p className="text-3xs font-bold uppercase tracking-wide">No responses submitted yet.</p>
                          <p className="text-[10px] text-slate-450 max-w-xs">Share your form webLink or embed iframe on the public portal to collect applications.</p>
                        </div>
                      ) : (
                        <div className="flex-1 border border-slate-100 rounded-xl overflow-auto bg-white min-h-0">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 bg-[#07130F] text-slate-300 text-3xs uppercase font-mono font-bold tracking-wider z-10">
                              <tr>
                                <th className="p-3 border-b border-emerald-950 font-black">Submission ID</th>
                                <th className="p-3 border-b border-emerald-950 font-black">Timestamp</th>
                                {questionsList.map(q => (
                                  <th key={q.questionId} className="p-3 border-b border-emerald-950 font-black truncate max-w-[150px]" title={q.title}>
                                    {q.title}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold text-slate-600 text-3xs">
                              {responses.map((resp) => (
                                <tr key={resp.responseId} className="hover:bg-slate-50 transition-all">
                                  <td className="p-3 font-mono text-slate-400" title={resp.responseId}>
                                    {resp.responseId.slice(0, 8)}...
                                  </td>
                                  <td className="p-3 whitespace-nowrap">
                                    {new Date(resp.lastSubmittedTime || resp.createTime).toLocaleString()}
                                  </td>
                                  {questionsList.map(q => {
                                    const ans = resp.answers[q.questionId];
                                    const val = ans?.textAnswers?.answers?.map(a => a.value).join("; ") || "-";
                                    return (
                                      <td key={q.questionId} className="p-3 truncate max-w-[200px]" title={val}>
                                        {val}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: IFrame Embed integration parameters */}
                  {activeTab === "embed" && (
                    <div className="space-y-4 pr-1 text-left">
                      <div className="p-4 bg-[#FAF8F3]/60 rounded-xl border border-[#103D2E]/5 space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Globe size={14} className="text-[#103D2E]" />
                          <h4 className="text-2xs font-extrabold uppercase">Copy IFrame Embed Code</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          You can copy and embed this HTML snippet in any custom web views, or click link active portal button above to dynamically render this Google Form directly to applicants inside the registration flow.
                        </p>

                        <div className="bg-slate-900 rounded-xl p-3 text-left border border-slate-950 relative">
                          <code className="text-amber-400 font-mono text-[9px] block whitespace-pre-wrap select-all">
                            {`<iframe src="https://docs.google.com/forms/d/e/${selectedForm.formId}/viewform?embedded=true" width="100%" height="700" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`}
                          </code>
                        </div>
                      </div>

                      {/* Live preview section */}
                      <div className="space-y-2">
                        <h4 className="text-3xs font-black uppercase tracking-widest text-slate-400 font-mono">
                          Live Active Preview Frame
                        </h4>
                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50 h-[400px]">
                          <iframe 
                            src={`https://docs.google.com/forms/d/${selectedForm.formId}/viewform?embedded=true`} 
                            width="100%" 
                            height="100%" 
                            frameBorder="0"
                            className="bg-white"
                          >
                            Loading preview...
                          </iframe>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. Simple Modal: Generate New Form */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#103D2E]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Generate Google Form
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-3xs font-black uppercase tracking-wider text-slate-500 font-mono block">
                  Form Title / Program Survey Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RMA Cohort 6 Leadership Feedback"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF8F3]/60 border border-[#103D2E]/10 focus:bg-white rounded-xl focus:border-[#103D2E]/40 outline-none text-xs font-bold text-[#103D2E]"
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                This will automatically register a new empty Google Form document inside your Google Drive. You can then structure questions or add choice menus using the direct editor.
              </p>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-3xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingForm || !newFormTitle.trim()}
                  className="px-4 py-2 bg-[#103D2E] hover:bg-[#0b2b20] text-[#E9C46A] font-black rounded-xl text-3xs uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                >
                  {isCreatingForm ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Plus size={12} />
                  )}
                  <span>Create Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
