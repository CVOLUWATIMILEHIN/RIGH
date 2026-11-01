import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { 
  BookOpen, Star, Clock, User, Shield, Lock, Play, Sparkles, AlertCircle, 
  CheckCircle2, ArrowRight, ArrowLeft, Download, Award, ChevronRight, 
  Grid, List, Filter, Search, DollarSign, Laptop, Check, HelpCircle, 
  CreditCard, RefreshCw, Send, FileText, Smartphone, Mic, X
} from "lucide-react";
import { 
  getCourses, 
  saveCourseEnrollment, 
  saveCoursePayment, 
  getCourseEnrollments,
  getCoursePayments,
  getCourseCertificates,
  saveCourseCertificate,
  getPaymentHubSettings,
  DEFAULT_LMS_COURSES,
  LMSCourse, 
  LMSModule, 
  LMSLesson, 
  LMSCourseEnrollment, 
  LMSCoursePayment, 
  LMSCourseCertificate 
} from "../../lib/db";
import LmsBankCheckoutModal from "../LmsBankCheckoutModal";
import { PageContainer } from "../PageContainer";
import { D3ProgressTracker } from "../D3ProgressTracker";

// Global standard categories list
const COURSE_CATEGORIES = [
  "Leadership Development",
  "Entrepreneurship",
  "Digital Skills",
  "Product Design (UI/UX)",
  "Graphic Design",
  "Video Editing",
  "NYSC Success Program",
  "Personal Development",
  "Career Growth",
  "Business Development"
];

interface CoursesViewProps {
  currentView: string;
  setView: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

export default function CoursesView({ currentView, setView, onOpenJoin }: CoursesViewProps) {
  const [courses, setCourses] = useState<LMSCourse[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("rma_lms_courses");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((c: any) => c.status === "published");
          }
        }
      } catch (e) {}
    }
    return DEFAULT_LMS_COURSES.filter(c => c.status === "published");
  });
  const [enrollments, setEnrollments] = useState<LMSCourseEnrollment[]>([]);
  const [payments, setPayments] = useState<LMSCoursePayment[]>([]);
  const [certificates, setCertificates] = useState<LMSCourseCertificate[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Subview states for active course or learning module
  const [activeCourseSlug, setActiveCourseSlug] = useState<string | null>(null);
  const [curriculumActiveModule, setCurriculumActiveModule] = useState<string | null>(null);

  // Playback preview video modal
  const [previewLesson, setPreviewLesson] = useState<LMSLesson | null>(null);

  // Active student logged-in simulation (or current Firebase user)
  const [studentEmail, setStudentEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedAdmin = localStorage.getItem("rma_current_logged_in_user");
      if (savedAdmin) {
        try {
          const parsed = JSON.parse(savedAdmin);
          return parsed.email || "olosundelouis@gmail.com";
        } catch {
          return "olosundelouis@gmail.com";
        }
      }
      return "scholar.sandbox@rightminds.org";
    }
    return "scholar.sandbox@rightminds.org";
  });

  // State for active course rendering in details
  const [activeCourse, setActiveCourse] = useState<LMSCourse | null>(null);

  // Bank Transfer Checkout states
  const [isBankCheckoutOpen, setIsBankCheckoutOpen] = useState(false);
  const [bankCheckoutCourse, setBankCheckoutCourse] = useState<LMSCourse | null>(null);

  // Checkout modal states
  const [checkoutCourse, setCheckoutCourse] = useState<LMSCourse | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"method_selection" | "form" | "paystack" | "bank_transfer" | "loading" | "success">("method_selection");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentName, setPaymentName] = useState("Louis Olosunde");
  const [paystackCardNumber, setPaystackCardNumber] = useState("4081 0291 9382 0182");
  const [paystackExpiry, setPaystackExpiry] = useState("12/28");
  const [paystackCVV, setPaystackCVV] = useState("091");
  const [paymentError, setPaymentError] = useState("");
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Custom payment hub settings states
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"paystack" | "bank_transfer">("paystack");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [receiptReference, setReceiptReference] = useState<string>("");
  const [receiptFileBase64, setReceiptFileBase64] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");

  // Learning dashboard details
  const [learningActiveCourse, setLearningActiveCourse] = useState<LMSCourse | null>(null);
  const [learningActiveLesson, setLearningActiveLesson] = useState<LMSLesson | null>(null);

  // Static stats definition
  const stats = {
    totalStudents: 1420,
    totalCourses: 12,
    certificatesIssued: 385
  };

  useEffect(() => {
    fetchLMSData();
    const handleCoursesUpdate = () => {
      fetchLMSData();
    };
    window.addEventListener("rma_courses_updated", handleCoursesUpdate);
    return () => window.removeEventListener("rma_courses_updated", handleCoursesUpdate);
  }, [studentEmail]);

  // Synchronize path slug on url trigger
  useEffect(() => {
    const checkSlugRouting = () => {
      const path = window.location.pathname;
      if (path.startsWith("/courses/")) {
        const slug = path.split("/")[2];
        if (slug) {
          setActiveCourseSlug(slug);
        }
      } else if (path === "/my-learning") {
        setActiveCourseSlug(null);
      }
    };
    checkSlugRouting();
    window.addEventListener("popstate", checkSlugRouting);
    return () => window.removeEventListener("popstate", checkSlugRouting);
  }, []);

  const fetchLMSData = async () => {
    if (courses.length === 0) {
      setLoading(true);
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    try {
      const [courseList, activeEnrollments, pays, certs, hubSettings] = await Promise.all([
        getCourses().catch(() => DEFAULT_LMS_COURSES),
        getCourseEnrollments(studentEmail).catch(() => []),
        getCoursePayments().catch(() => []),
        getCourseCertificates().catch(() => []),
        getPaymentHubSettings().catch(() => null)
      ]);

      const published = courseList.filter(c => c.status === "published");
      if (published.length > 0) {
        setCourses(published);
      }
      setEnrollments(activeEnrollments);
      setPayments(pays.filter(p => p.userEmail.toLowerCase() === studentEmail.toLowerCase()));
      setCertificates(certs.filter(c => c.userEmail.toLowerCase() === studentEmail.toLowerCase()));
      setPaymentSettings(hubSettings);

      if (hubSettings?.bankAccounts?.length > 0) {
        const firstActive = hubSettings.bankAccounts.find((a: any) => a.active);
        setSelectedBankId(firstActive ? firstActive.id : hubSettings.bankAccounts[0].id);
      }

      // If active course slug is specified, find matching course
      const path = window.location.pathname;
      if (path.startsWith("/courses/")) {
        const slug = path.split("/")[2];
        const matched = courseList.find(c => generateSlug(c.title) === slug || c.id === slug);
        if (matched) {
          setActiveCourse(matched);
        }
      }
    } catch (err) {
      console.error("Error reading LMS modules:", err);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Safe enrollment and verify status checkers
  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId && e.status === "active");
  };

  const getEnrollmentRecord = (courseId: string) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  const getCoursePaymentStatus = (courseId: string) => {
    const match = payments.find(p => p.courseId === courseId);
    return match ? match.paymentStatus : null;
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPaymentError("Receipt image size must be less than 2MB.");
        return;
      }
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessBankTransfer = async () => {
    if (!checkoutCourse || !paymentSettings) return;
    if (!paymentName.trim()) {
      setPaymentError("Depositor full name is required.");
      return;
    }
    if (!receiptFileBase64 && !receiptReference.trim()) {
      setPaymentError("Please upload a receipt screenshot OR enter transfer transaction reference.");
      return;
    }

    setCheckoutStep("loading");
    setPaymentError("");

    try {
      const selectedBank = paymentSettings.bankAccounts.find((b: any) => b.id === selectedBankId);
      const payRef = `PAY-MANUAL-${Date.now()}`;
      
      const newPayment: LMSCoursePayment = {
        id: `pay-${Date.now()}`,
        userEmail: studentEmail,
        courseId: checkoutCourse.id,
        amount: checkoutCourse.price,
        paymentReference: receiptReference.trim() || payRef,
        paymentStatus: "under_review",
        timestamp: new Date().toISOString(),
        paymentMethod: "bank_transfer",
        studentName: paymentName.trim(),
        studentPhone: paymentPhone || "08012345678",
        receiptUrl: receiptFileBase64 || "",
        bankName: selectedBank ? `${selectedBank.bankName}` : "General Direct Bank",
        accountNumber: selectedBank ? selectedBank.accountNumber : ""
      };

      await saveCoursePayment(newPayment);
      
      // Trigger automatic email alert for payment submitted (under review)
      try {
        fetch("/api/email/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "PAYMENT_SUBMITTED",
            registrationId: newPayment.id,
            payload: {
              fullName: paymentName.trim(),
              email: studentEmail,
              referenceNumber: `CRS-${checkoutCourse.id.substring(0, 4).toUpperCase()}`,
              programName: checkoutCourse.title,
              amount: `$${newPayment.amount || checkoutCourse.price}`,
              paymentReference: newPayment.paymentReference
            }
          })
        }).catch(err => console.error("Billing trigger fail:", err));
      } catch (err) {}

      await fetchLMSData();
      setCheckoutStep("success");
      showNotification(`Manual bank transfer submission received, awaiting audit!`, "success");
    } catch (e: any) {
      console.error(e);
      setPaymentError(e.message || "Failed to submit bank transfer details.");
      setCheckoutStep("bank_transfer");
    }
  };

  // Navigate to course slug
  const handleViewDetails = (course: LMSCourse) => {
    const slug = generateSlug(course.title);
    setActiveCourse(course);
    setActiveCourseSlug(slug);
    window.history.pushState(null, "", `/courses/${slug}`);
  };

  const handleBackToCatalog = () => {
    setActiveCourse(null);
    setActiveCourseSlug(null);
    window.history.pushState(null, "", "/courses");
  };

  // Dual payment secure flow triggers
  const handleEnrollOrReview = (course: LMSCourse) => {
    if (isEnrolled(course.id)) {
      setLearningActiveCourse(course);
      if (course.modules?.length > 0 && course.modules[0].lessons?.length > 0) {
        setLearningActiveLesson(course.modules[0].lessons[0]);
      }
      setView("my-learning");
      window.history.pushState(null, "", "/my-learning");
    } else {
      setBankCheckoutCourse(course);
      setIsBankCheckoutOpen(true);
    }
  };

  // Simulated paystack verification endpoint proxy call
  const handleProcessSimulatedPayment = async () => {
    if (!checkoutCourse) return;
    if (!paymentName.trim()) {
      setPaymentError("Cardholder name is required.");
      return;
    }

    setCheckoutStep("loading");
    setPaymentError("");

    try {
      // Direct payment reference generation code (secure system logger)
      const payRef = `PAY-PAYSTACK-${Date.now()}`;
      
      // Make transaction verification call to the Full-Stack Express backend
      const response = await fetch("/api/courses/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: checkoutCourse.id,
          userEmail: studentEmail,
          paymentReference: payRef,
          amount: checkoutCourse.price,
          phone: paymentPhone || "08012345678",
          name: paymentName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Payment verification declined by system proxy.");
      }

      await response.json();

      // Successful verification path synchronizes the state locally to avoid latency gaps
      const newEnrollment: LMSCourseEnrollment = {
        id: `enroll-${Date.now()}`,
        userEmail: studentEmail,
        courseId: checkoutCourse.id,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        status: "active"
      };

      const newPayment: LMSCoursePayment = {
        id: `pay-${Date.now()}`,
        userEmail: studentEmail,
        courseId: checkoutCourse.id,
        amount: checkoutCourse.price,
        paymentReference: payRef,
        paymentMethod: "bank_transfer",
        paymentStatus: "approved",
        timestamp: new Date().toISOString()
      };

      await saveCourseEnrollment(newEnrollment);
      await saveCoursePayment(newPayment);

      // Trigger automatic course enrolled welcome credentials notification email
      try {
        fetch("/api/email/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "COURSE_ENROLLED",
            registrationId: newEnrollment.id,
            payload: {
              studentName: paymentName || studentEmail,
              studentEmail: studentEmail,
              courseTitle: checkoutCourse.title,
              paymentReference: payRef
            }
          })
        }).catch(err => console.error("Enrollment trigger fail:", err));
      } catch (err) {}

      // Re-fetch to coordinate latest collection mappings
      await fetchLMSData();

      setCheckoutStep("success");
      showNotification(`Successfully unlocked course: ${checkoutCourse.title}!`, "success");
    } catch (e: any) {
      console.error(e);
      setPaymentError(e.message || "Failed to establish validation hook with Paystack API.");
      setCheckoutStep("form");
    }
  };

  // Lesson interactive completion tracker
  const handleMarkLessonComplete = async (courseId: string, lessonId: string) => {
    const enrollment = getEnrollmentRecord(courseId);
    if (!enrollment) return;

    let updatedCompleted = [...(enrollment.completedLessons || [])];
    if (updatedCompleted.includes(lessonId)) {
      // Toggle off
      updatedCompleted = updatedCompleted.filter(id => id !== lessonId);
    } else {
      updatedCompleted.push(lessonId);
    }

    // Get total lesson structure count inside current course to establish proper progress index
    const matched = courses.find(c => c.id === courseId);
    if (!matched) return;

    const totalLessons = matched.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    const progressPercentage = Math.round((updatedCompleted.length / (totalLessons || 1)) * 100);

    const updatedEnrollment: LMSCourseEnrollment = {
      ...enrollment,
      completedLessons: updatedCompleted,
      progress: progressPercentage,
      status: progressPercentage === 100 ? "completed" : "active"
    };

    await saveCourseEnrollment(updatedEnrollment);
    await fetchLMSData();
    showNotification("Progress saved safely.", "success");

    // Automatically issue verifiable certificate upon 100% curriculum completion
    if (progressPercentage === 100 && !certificates.some(c => c.courseId === courseId)) {
      const certId = `cert-${Date.now()}`;
      const certCode = `RMA-CERT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const newCert: LMSCourseCertificate = {
        id: certId,
        userEmail: studentEmail,
        userName: paymentName || "Louis Olosunde",
        courseId: courseId,
        courseTitle: matched.title,
        certificateCode: certCode,
        issuedAt: new Date().toISOString()
      };
      await saveCourseCertificate(newCert);
      await fetchLMSData();
      showNotification(`🏆 Congratulations! You have earned a verifiable Certificate for ${matched.title}!`, "success");
    }
  };

  // Searching and category filtering parameters
  const filteredCourses = courses.filter(item => {
    const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="relative pt-32 min-h-screen text-slate-800 dark:text-slate-100 font-sans antialiased text-left" id="courses-section-wrapper">
      
      {/* Floating notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold leading-normal ${
              notification.type === "success" 
                ? "bg-slate-900 text-[#A3E635] border-[#A3E635]/20" 
                : "bg-red-950 text-red-200 border-red-800/40"
            }`}
          >
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW 1: USER-FACING COURSES LANDING PAGE */}
      {currentView === "courses" && !activeCourseSlug && (
        <div className="space-y-16 py-12">
          
          {/* A. PLATFORM HERO HEADER */}
          <PageContainer className="py-0">
            <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 text-white rounded-3xl px-8 py-16" id="courses-hero">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 left-0 w-80 h-80 bg-[#1D4ED8]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold rounded-lg border border-amber-500/20 uppercase tracking-widest">
                <Sparkles size={11} className="animate-pulse" /> SMA & CII premium Academy
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight leading-[1.05] uppercase">
                Learn, Grow and Build <br/><span className="text-amber-500">Real-World Skills</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Access premium leadership, career, entrepreneurship, technology, and NYSC-focused training designed to help you succeed. Protected with secure, recognized digital certification upon graduation.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-3">
                <a href="#catalog-grid" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 leading-none">
                  Browse Courses <ArrowRight size={13} />
                </a>
                <button 
                  onClick={() => onOpenJoin("corps_member")} 
                  className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all leading-none"
                >
                  Become a Student
                </button>
              </div>

              {/* Course Platform Metrics Stats section */}
              <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-800 w-full max-w-lg">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-amber-500 font-mono leading-none">{stats.totalStudents}+</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total Students</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white font-mono leading-none">{stats.totalCourses}+</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Premium Courses</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-[#A3E635] font-mono leading-none">{stats.certificatesIssued}+</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Certificates Issued</p>
                </div>
              </div>
            </div>
          </section>
          </PageContainer>

          {/* B. CATALOG CONTROL HUB AND FILTERS */}
          <PageContainer className="space-y-8" id="catalog-grid">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 dark:border-slate-800 pb-6">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white uppercase">Course Marketplace</h2>
                <p className="text-xs text-slate-500">Filter courses across major competencies or search titles directly.</p>
              </div>

              {/* Interactive Search input */}
              <div className="relative w-full md:max-w-xs">
                <Search size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search course blueprints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0F1714] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Interactive category buttons carousel style */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap border cursor-pointer transition-all ${
                  selectedCategory === "All"
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#0F1714] dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                All Categories
              </button>
              {COURSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap border cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#0F1714] dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* C. CATALOG CARDS GRID */}
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-amber-500" />
                <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Synchronizing active catalogs...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <HelpCircle className="mx-auto text-slate-300 dark:text-slate-700" size={40} />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase">No Matching Materials</h3>
                <p className="text-xs text-slate-400">There are no courses currently published under the chosen category or search metrics. Try clearing criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, idx) => {
                  const alreadyOwns = isEnrolled(course.id);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ y: -6 }}
                      className="group bg-white dark:bg-[#0F1714] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between"
                    >
                      {/* Image Thumbnail section */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden shrink-0">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-103 duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-slate-900/90 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-widest">
                          {course.category}
                        </span>
                        {alreadyOwns && (
                          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-[#0E3A2F]/90 text-[#A3E635] text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                            <Check size={9} /> Enrolled
                          </span>
                        )}
                      </div>

                      {/* Info Panel */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2 text-left">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase font-mono">
                            <User size={12} className="text-slate-300" />
                            <span>{course.instructorName}</span>
                          </div>
                          <h3 
                            onClick={() => handleViewDetails(course)}
                            className="text-sm font-bold text-slate-905 group-hover:text-amber-500 leading-snug uppercase tracking-tight line-clamp-2 cursor-pointer transition-colors"
                          >
                            {course.title}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-normal line-clamp-2">
                            {course.description}
                          </p>
                        </div>

                        {/* Metadata labels row */}
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono border-y border-slate-100 dark:border-slate-800 py-3">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock size={11} /> {course.duration}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <BookOpen size={11} /> {course.lessonsCount} lessons
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-bold uppercase shrink-0">
                            {course.level}
                          </span>
                        </div>

                        {/* Price Tag & Active triggers */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div className="text-left">
                            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Tuition Fee</span>
                            <p className="text-base font-black text-slate-900 dark:text-white font-mono leading-none">
                              {course.price === 0 ? "FREE" : `₦${course.price.toLocaleString()}`}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleViewDetails(course)}
                              className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-850 cursor-pointer transition-colors"
                            >
                              Preview
                            </button>
                            {alreadyOwns ? (
                              <button
                                onClick={() => handleEnrollOrReview(course)}
                                className="px-4 py-2 text-xs font-bold rounded-lg cursor-pointer bg-[#0E3A2F]/10 text-emerald-800 hover:bg-[#0E3A2F]/20 dark:bg-emerald-950/20 dark:text-emerald-400 font-sans"
                              >
                                Enter Course
                              </button>
                            ) : getCoursePaymentStatus(course.id) === "under_review" ? (
                              <button
                                disabled
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-605 border border-amber-500/20 flex items-center gap-1 cursor-not-allowed font-sans font-semibold"
                              >
                                Pending Review
                              </button>
                            ) : getCoursePaymentStatus(course.id) === "rejected" ? (
                              <button
                                onClick={() => handleEnrollOrReview(course)}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-sans cursor-pointer"
                              >
                                Retake Pay
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnrollOrReview(course)}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 font-sans cursor-pointer"
                              >
                                Enroll Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </PageContainer>
        </div>
      )}

      {/* RENDER VIEW 2: COURSE DETAILS PAGE */}
      {currentView === "courses" && activeCourseSlug && activeCourse && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 space-y-8 text-left" id="course-details">
          
          <button
            onClick={handleBackToCatalog}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </button>

          {/* Core Outline details card */}
          <div className="bg-white dark:bg-[#0F1714] border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            {/* Banner Section */}
            <div className="relative aspect-video sm:aspect-21/9 bg-slate-900 w-full overflow-hidden border-b border-slate-100 dark:border-slate-800">
              <img
                src={activeCourse.thumbnail}
                alt={activeCourse.title}
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-6 sm:p-10">
                <div className="space-y-3 text-left w-full max-w-3xl">
                  <span className="px-2.5 py-1 bg-amber-550/25 border border-amber-500/30 text-amber-500 text-[10px] font-mono font-bold uppercase rounded-lg tracking-widest shrink-0">
                    {activeCourse.category}
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-display uppercase tracking-tight leading-tight">
                    {activeCourse.title}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-mono flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                    <span className="flex items-center gap-1"><User size={13} /> Instructor: <strong>{activeCourse.instructorName}</strong></span>
                    <span className="flex items-center gap-1"><Clock size={13} /> Duration: <strong>{activeCourse.duration}</strong></span>
                    <span className="flex items-center gap-1"><BookOpen size={13} /> Syllabus: <strong>{activeCourse.lessonsCount} lessons</strong></span>
                  </p>
                </div>
              </div>
            </div>

            {/* Core Info panels split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
              {/* Left Details block */}
              <div className="lg:col-span-8 space-y-8 text-left">
                {/* Course overview */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-3 border-amber-500 pl-3">Course Overview</h3>
                  <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed font-normal">
                    {activeCourse.description}
                  </p>
                </div>

                {/* Course Syllabus / Curriculum structure */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Curriculum Outline</h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{activeCourse.modules?.length || 0} Modules</span>
                  </div>

                  <div className="space-y-4" id="curriculum-accordion">
                    {activeCourse.modules?.map((mod, modIdx) => (
                      <div key={mod.id} className="border border-slate-150 dark:border-slate-805 rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#141E1A]/40">
                        {/* Module header trigger */}
                        <div 
                          onClick={() => setCurriculumActiveModule(curriculumActiveModule === mod.id ? null : mod.id)}
                          className="px-5 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/20 flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-[9px] font-bold uppercase font-mono text-amber-605">Module {modIdx + 1}</span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug uppercase mt-0.5">{mod.title}</h4>
                            <p className="text-[10px] text-slate-400 font-normal leading-relaxed mt-1">{mod.description}</p>
                          </div>
                          <ChevronRight 
                            size={14} 
                            className={`transform transition-transform text-slate-400 ${curriculumActiveModule === mod.id ? "rotate-90 text-amber-500" : ""}`} 
                          />
                        </div>

                        {/* Lessons list folder */}
                        {curriculumActiveModule === mod.id && (
                          <div className="border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-[#0F1714] divide-y divide-slate-100 dark:divide-slate-800/50">
                            {mod.lessons?.map((les, lesIdx) => (
                              <div key={les.id} className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs font-semibold">
                                <div className="flex items-start gap-3 min-w-0">
                                  {les.isFreePreview ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5" title="Free preview available">
                                      <Play size={10} fill="currentColor" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                                      <Lock size={10} />
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-slate-800 dark:text-slate-200 font-bold truncate">{les.title}</p>
                                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{les.duration} &bull; {les.type.toUpperCase()}</span>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  {les.isFreePreview ? (
                                    <button
                                      onClick={() => setPreviewLesson(les)}
                                      className="px-2.5 py-1 bg-amber-550/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-405 font-bold text-[10px] uppercase rounded-md cursor-pointer transition-colors"
                                    >
                                      Preview
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 px-2 py-0.5 rounded-md select-none shrink-0">
                                      🔒 Locked
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements & Target Audience columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2.5 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Requirements</h4>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-xs">
                      <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={13} className="text-amber-500 shrink-0 mt-0.5" /> Stable internet connecting system</li>
                      <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={13} className="text-amber-500 shrink-0 mt-0.5" /> Passion to grow leadership skills</li>
                      <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={13} className="text-amber-500 shrink-0 mt-0.5" /> PC/Smartphone with video support</li>
                    </ul>
                  </div>
                  <div className="space-y-2.5 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Target Audience</h4>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-xs font-medium">
                      <li className="flex items-start gap-1.5"><CheckCircle2 size={13} className="text-[#A3E635] shrink-0 mt-0.5" /> NYSC Corps Members seeking placement</li>
                      <li className="flex items-start gap-1.5"><CheckCircle2 size={13} className="text-[#A3E635] shrink-0 mt-0.5" /> Undergraduates planning graduation</li>
                      <li className="flex items-start gap-1.5"><CheckCircle2 size={13} className="text-[#A3E635] shrink-0 mt-0.5" /> High-agency professionals and grads</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Block holding payment triggers */}
              <div className="lg:col-span-4 text-left">
                <div className="border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#141E1A]/20 p-6 space-y-6 sticky top-28 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase font-mono text-slate-400 tracking-wider">Tuition Fee</span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {activeCourse.price === 0 ? "FREE" : `₦${activeCourse.price.toLocaleString()}`}
                    </p>
                    <p className="text-[10px] text-[#A3E635] font-bold font-mono uppercase">Full Lifetime Access Guarantee</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {isEnrolled(activeCourse.id) ? (
                      <button
                        onClick={() => handleEnrollOrReview(activeCourse)}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        Enter Course <ArrowRight size={14} />
                      </button>
                    ) : getCoursePaymentStatus(activeCourse.id) === "under_review" ? (
                      <div className="space-y-2">
                        <button
                          disabled
                          className="w-full py-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Clock size={14} className="animate-pulse" /> Verification Pending
                        </button>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-405 text-center leading-normal font-semibold">
                          Your transfer receipt has been uploaded and is being audited by Academy administrators.
                        </p>
                      </div>
                    ) : getCoursePaymentStatus(activeCourse.id) === "rejected" ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleEnrollOrReview(activeCourse)}
                          className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          Rejected - Try Again <ArrowRight size={14} />
                        </button>
                        {payments.find(p => p.courseId === activeCourse.id)?.notes && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[10.5px] text-rose-600 dark:text-rose-400 font-medium leading-relaxed font-semibold">
                            <span className="font-bold block uppercase text-[8px] tracking-wider text-rose-500 mb-1">Reason for Rejection:</span>
                            {payments.find(p => p.courseId === activeCourse.id)?.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnrollOrReview(activeCourse)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {activeCourse.price === 0 ? "Enroll Now" : "Unlock Curriculum"} <ArrowRight size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => onOpenJoin("corps_member")}
                      className="w-full py-3.5 bg-white hover:bg-slate-50 dark:bg-[#0F1714] dark:hover:bg-[#141E1A] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-205 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors"
                    >
                      Socio-Economic Sponsorship info
                    </button>
                  </div>

                  {/* Bullet perks list section */}
                  <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4 space-y-3 text-xs text-slate-500 font-medium">
                    <h5 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">Included Core Perks:</h5>
                    <p className="flex items-center gap-2"><Award size={13} className="text-amber-500 shrink-0" /> Verifiable SSL Digital Certificate</p>
                    <p className="flex items-center gap-2"><Laptop size={13} className="text-amber-500 shrink-0" /> Unlimited mobile and computer access</p>
                    <p className="flex items-center gap-2"><Download size={13} className="text-amber-500 shrink-0" /> Downloadable PDF slides and blueprints</p>
                    <p className="flex items-center gap-2"><Shield size={13} className="text-[#A3E635] shrink-0" /> Secure payment via Paystack verification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 3: STUDENT DASHBOARD ("MY LEARNING") */}
      {currentView === "my-learning" && (
        <PageContainer className="py-12 space-y-12 text-left" id="student-learning-dashboard">
          
          {/* Header context card */}
          <section className="bg-slate-900 border-b border-slate-800 text-white rounded-3xl p-8 relative overflow-hidden" id="learning-header">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider">Student Console</span>
                <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white leading-none">My Learning Hub</h1>
                <p className="text-xs text-slate-350 font-medium">Access your purchased course curriculums, download workbook PDFs, track your learning percentage, and download SSL digital certificates.</p>
              </div>

              <div className="shrink-0 font-mono border-l sm:border-l-2 border-amber-500/30 pl-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Active Session Account:</span>
                <span className="text-xs font-black text-amber-500 uppercase tracking-tight block">{studentEmail}</span>
              </div>
            </div>
          </section>

          {/* If the user is currently viewing/taking a specific course curriculum */}
          {learningActiveCourse ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left" id="learning-player">
              
              {/* Left Column: Interactive media / content player */}
              <div className="lg:col-span-8 space-y-6">
                <button
                  onClick={() => setLearningActiveCourse(null)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={12} /> Dashboard overview
                </button>

                <div className="bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-sm">
                  {/* Title and metadata */}
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-605 text-[9px] font-bold uppercase">{learningActiveCourse.category}</span>
                    <h2 className="text-base sm:text-lg font-bold uppercase text-slate-900 dark:text-white leading-tight">
                      {learningActiveCourse.title}
                    </h2>
                  </div>

                  {/* Active Lesson Display details */}
                  {learningActiveLesson ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase font-mono text-slate-400">CURRENT LESSON</span>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase leading-snug">{learningActiveLesson.title}</h3>
                        <p className="text-[10px] text-slate-405 font-mono uppercase font-bold">TYPE: {learningActiveLesson.type.toUpperCase()} &bull; DURATION: {learningActiveLesson.duration}</p>
                      </div>

                      {/* Render simulated high-fidelity visual player depending on resource type */}
                      {learningActiveLesson.type === "video" && (
                        <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                          {/* Embedded iframe video simulation */}
                          <iframe
                            src={learningActiveLesson.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                            title={learningActiveLesson.title}
                            className="absolute inset-0 w-full h-full border-none"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {learningActiveLesson.type === "pdf" && (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-10 text-center space-y-4">
                          <FileText size={36} className="mx-auto text-amber-500" />
                          <h4 className="text-xs font-bold uppercase tracking-tight text-slate-800 dark:text-slate-250">Downloadable Lesson Worksheet Blueprint</h4>
                          <p className="text-[11px] text-slate-450 leading-relaxed font-normal max-w-sm mx-auto">This lesson includes a premium downloadable handbook PDF system. Learn and complete activities offline to audit performance.</p>
                          <a 
                            href={learningActiveLesson.pdfUrl || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-550 dark:text-slate-950 text-xs font-bold uppercase rounded-lg shadow cursor-pointer transition-colors"
                          >
                            <Download size={13} /> Complete & Download PDF (820 KB)
                          </a>
                        </div>
                      )}

                      {learningActiveLesson.type === "audio" && (
                        <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-8 rounded-2xl flex flex-col items-center gap-5">
                          <Mic size={36} className="text-bold text-amber-505" />
                          <div className="text-center w-full max-w-sm space-y-1">
                            <h4 className="text-xs font-bold uppercase tracking-tight text-slate-850 dark:text-slate-200">{learningActiveLesson.title}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold font-mono uppercase">Audio Podcast Lecture Masterclass</p>
                          </div>
                          {/* HTML5 audio element simulation */}
                          <audio 
                            controls 
                            src={learningActiveLesson.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                            className="w-full max-w-md accent-amber-500"
                          />
                        </div>
                      )}

                      {/* Lock action logic triggers */}
                      <div className="border-t border-slate-100 dark:border-slate-850 pt-5 flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleMarkLessonComplete(learningActiveCourse.id, learningActiveLesson.id)}
                          className={`px-4 py-2.5 text-xs font-bold uppercase rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            getEnrollmentRecord(learningActiveCourse.id)?.completedLessons?.includes(learningActiveLesson.id)
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-white hover:bg-slate-50 dark:bg-[#141E1A] dark:hover:bg-[#1A2822] border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-250 font-bold"
                          }`}
                        >
                          {getEnrollmentRecord(learningActiveCourse.id)?.completedLessons?.includes(learningActiveLesson.id) ? (
                            <>
                              <CheckCircle2 size={13} /> Marked Completed
                            </>
                          ) : (
                            "Mark Lesson Complete"
                          )}
                        </button>
                        
                        <div className="flex items-center gap-3.5" id={`player-progress-badge-wrapper-${learningActiveCourse.id}`}>
                          <D3ProgressTracker 
                            progress={getEnrollmentRecord(learningActiveCourse.id)?.progress || 0} 
                            size={44} 
                            strokeWidth={4.5} 
                            courseId={`player-${learningActiveCourse.id}`} 
                          />
                          <div className="text-right" id={`player-progress-percentage-wrapper-${learningActiveCourse.id}`}>
                            <p className="text-[10px] text-slate-400 font-bold uppercase font-mono leading-none">Course progress</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-1">
                              {getEnrollmentRecord(learningActiveCourse.id)?.progress || 0}% Done
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center max-w-sm mx-auto space-y-2">
                      <BookOpen size={30} className="mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-bold text-slate-500 uppercase">Class has not started</p>
                      <p className="text-[11px] text-slate-400">Select any lesson in the curriculum sidebar to display the study materials and trigger video sessions.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic curriculum sidebar folder */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="space-y-1 text-left">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-905">Curriculum Checklist</h3>
                    <p className="text-[10px] text-slate-405 leading-relaxed">Select lesson modules to expand and toggle content screens.</p>
                  </div>

                  <div className="space-y-3">
                    {learningActiveCourse.modules?.map((mod, modIdx) => (
                      <div key={mod.id} className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-[#141E1A]/20">
                        {/* Title of Module */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-850">
                          <span className="text-[8px] font-bold text-slate-400 font-mono uppercase">MODULE {modIdx + 1}</span>
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase leading-snug line-clamp-1 mt-0.5">{mod.title}</h4>
                        </div>
                        
                        {/* Lessons folders */}
                        <div className="bg-white dark:bg-[#0F1714] divide-y divide-slate-100 dark:divide-slate-850">
                          {mod.lessons?.map((les) => {
                            const isCompleted = getEnrollmentRecord(learningActiveCourse.id)?.completedLessons?.includes(les.id);
                            const isActive = learningActiveLesson?.id === les.id;
                            return (
                              <button
                                key={les.id}
                                onClick={() => setLearningActiveLesson(les)}
                                className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between gap-3 font-semibold transition-colors cursor-pointer ${
                                  isActive 
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold" 
                                    : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isCompleted ? (
                                    <CheckCircle2 size={13} className="text-emerald-555 shrink-0" />
                                  ) : (
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                                  )}
                                  <span className="truncate">{les.title}</span>
                                </div>
                                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase shrink-0 px-1 bg-slate-50 dark:bg-slate-800 rounded">{les.duration}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            // Core learning overview dashboard grid (Overview lists of active student courses)
            <div className="space-y-10" id="learning-overview">
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-display font-black tracking-tight uppercase text-slate-900 dark:text-white border-l-4 border-slate-900 dark:border-amber-500 pl-4">Enrolled Course Blueprints</h2>
                
                {enrollments.length === 0 ? (
                  <div className="border border-slate-150 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#0F1714] p-12 text-center max-w-sm mx-auto space-y-4 shadow-sm">
                    <BookOpen size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                    <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-205">No Active Enrollments</h3>
                    <p className="text-[11px] text-slate-450 leading-relaxed font-normal">You are not currently registered in any premium classrooms. View our active Course catalogs to unlock paths.</p>
                    <button 
                      onClick={() => {
                        setView("courses");
                        window.history.pushState(null, "", "/courses");
                      }} 
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-bold uppercase rounded-xl shadow cursor-pointer transition-colors leading-none"
                    >
                      Browse Catalogs <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {enrollments.map((enr) => {
                      // Lookup matching course details
                      const course = courses.find(c => c.id === enr.courseId);
                      if (!course) return null;
                      return (
                        <div key={enr.id} className="bg-white dark:bg-[#0F1714] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow" id={`enrolled-course-${enr.id}`}>
                          <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
                            <div className="space-y-4 flex-1 text-left min-w-0">
                              <div>
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-605 text-[9px] font-bold uppercase tracking-wider">{course.category}</span>
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-905 dark:text-white uppercase line-clamp-1 leading-snug">{course.title}</h3>
                              <p className="text-[10px] text-slate-450 dark:text-slate-350 leading-relaxed font-normal font-sans line-clamp-2">{course.description}</p>
                              
                              {/* Learning parameters indicator */}
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">
                                  <span>Curriculum Progress</span>
                                  <span>{enr.progress}% Completed</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${enr.progress}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* D3 visual progress tracker container */}
                            <div className="shrink-0 mx-auto sm:mx-0" id={`d3-circle-tracker-container-${enr.id}`}>
                              <D3ProgressTracker 
                                progress={enr.progress} 
                                size={96} 
                                strokeWidth={8} 
                                courseId={`dashboard-${enr.id}`} 
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 text-xs text-slate-650" id={`enrolled-course-actions-${enr.id}`}>
                            <button
                              onClick={() => {
                                setLearningActiveCourse(course);
                                if (course.modules?.length > 0 && course.modules[0].lessons?.length > 0) {
                                  setLearningActiveLesson(course.modules[0].lessons[0]);
                                }
                              }}
                              className="px-4 py-2 hover:bg-slate-800 bg-slate-900 border border-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors flex items-center gap-1 leading-none"
                              id={`button-continue-${enr.id}`}
                            >
                              <Play size={10} fill="currentColor" /> Continue Class
                            </button>
                            
                            <span className="text-[9px] font-bold font-mono uppercase bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-slate-400" id={`enrolled-date-${enr.id}`}>
                              Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Secure purchase history ledger section */}
              {payments.length > 0 && (
                <div className="space-y-4 pt-4 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-4 border-slate-900 pl-3">Purchase Transactions History Log</h3>
                  <div className="border border-slate-150 dark:border-slate-805 rounded-2xl bg-white dark:bg-[#0F1714] overflow-hidden shadow-2xs">
                    <table className="w-full text-xs font-medium text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#141E1A] text-[9px] font-mono text-slate-440 uppercase tracking-widest border-b border-slate-150 dark:border-slate-800 whitespace-nowrap">
                          <th className="p-4 font-bold">Transaction Reference ID</th>
                          <th className="p-4 font-bold">Course Item</th>
                          <th className="p-4 font-bold">Amount Invoiced</th>
                          <th className="p-4 font-bold">Billing Date</th>
                          <th className="p-4 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {payments.map((p) => {
                          const matchedC = courses.find(c => c.id === p.courseId);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-[11px]">
                              <td className="p-4 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">{p.paymentReference}</td>
                              <td className="p-4 font-sans font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">{matchedC?.title || "Premium Academy Course"}</td>
                              <td className="p-4 font-bold text-slate-805">₦{p.amount.toLocaleString()}</td>
                              <td className="p-4 text-slate-400 whitespace-nowrap">{new Date(p.timestamp).toLocaleDateString()}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px] select-none leading-none">
                                  {p.paymentStatus.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Earned digital Certificates overview shelf */}
              {certificates.length > 0 && (
                <div className="space-y-4 pt-4 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-4 border-slate-900 pl-3">Verifiable SSL Professional Certificates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="border border-amber-500/15 rounded-2xl bg-white dark:bg-[#0F1714] p-6 space-y-4 flex flex-col justify-between shadow-2xs relative overflow-hidden">
                        {/* Background security emblem */}
                        <div className="absolute right-3 bottom-3 text-amber-500/5 rotate-12 select-none pointer-events-none">
                          <Award size={100} />
                        </div>
                        
                        <div className="space-y-2 text-left relative z-10">
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold font-mono text-amber-605 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                            <Award size={10} /> Certified Scholar
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-normal">{cert.courseTitle}</h4>
                          <p className="text-[10px] text-slate-400 font-bold font-mono leading-none">ID Code: <span className="text-slate-600 dark:text-slate-300 font-bold">{cert.certificateCode}</span></p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-4 text-[10px] font-mono text-slate-405 relative z-10 leading-none">
                          <span>Verified: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => {
                              showNotification("Certificate compilation download finalized in system storage.", "success");
                            }}
                            className="text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-305 font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} /> Download PDF (2.1 MB)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </PageContainer>
      )}

      {/* OVERLAY COMPONENT: PAYSTACK CHECKOUT SIMULATED MODAL */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {checkoutCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutCourse(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              id="payment-backdrop"
            />

            {/* Main Checkout Panel Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-20 flex flex-col font-sans"
              id="paystack-overlay-panel"
            >
              {/* Header */}
              <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest font-mono text-slate-400 uppercase">Secure Paystack pay gateway</span>
                </div>
                <button 
                  onClick={() => setCheckoutCourse(null)} 
                  className="p-1 rounded-full text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Core Area */}
              <div className="p-6 overflow-y-auto max-h-[85vh] divide-y divide-slate-100 dark:divide-slate-850">
                
                {checkoutStep === "method_selection" && (
                  <div className="space-y-5 text-left pb-1">
                    <div className="space-y-1 text-center pb-2">
                      <span className="text-[9px] font-bold uppercase font-mono text-slate-400">Classroom Target</span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-normal">{checkoutCourse.title}</h3>
                      <p className="text-lg font-black text-emerald-600 dark:text-[#A3E635] font-mono mt-1">₦{checkoutCourse.price.toLocaleString()}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="block text-[10px] font-bold uppercase font-mono text-slate-400 text-center tracking-wider">Select Payment Option</span>
                      
                      {/* Paystack Option Button */}
                      {(!checkoutCourse.paymentMethods || checkoutCourse.paymentMethods.includes("paystack")) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutPaymentMethod("paystack");
                            setCheckoutStep("form");
                          }}
                          className="w-full p-4 border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-505/10 dark:hover:bg-indigo-950/20 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all border-dashed"
                        >
                          <div className="flex items-center gap-3 w-[90%]">
                            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500"><CreditCard size={18} /></span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Pay Online with Paystack</p>
                              <p className="text-[10px] text-slate-450 mt-0.5 truncate">Instant activation. Card or USSD.</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 shrink-0" />
                        </button>
                      )}

                      {/* Manual Bank Transfer Option Button */}
                      {(!checkoutCourse.paymentMethods || checkoutCourse.paymentMethods.includes("bank_transfer")) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutPaymentMethod("bank_transfer");
                            setCheckoutStep("form");
                          }}
                          className="w-full p-4 border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-505/10 dark:hover:bg-emerald-950/20 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all border-dashed"
                        >
                          <div className="flex items-center gap-3 w-[90%]">
                            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-605"><Send size={18} /></span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">🏦 Bank Transfer Payment</p>
                              <p className="text-[10px] text-slate-450 mt-0.5 truncate">Manual review. Upload receipt proof.</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {checkoutStep === "form" && (
                  <div className="space-y-5 text-left pb-1">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase font-mono text-slate-400">Classroom Target</span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase line-clamp-1 leading-snug">{checkoutCourse.title}</h3>
                      <p className="text-base font-black text-slate-950 dark:text-white font-mono">₦{checkoutCourse.price.toLocaleString()}</p>
                    </div>

                    {paymentError && (
                      <div className="p-3 bg-red-950 border border-red-800/30 text-red-200 rounded-xl flex items-start gap-2.5 text-[10.5px] leading-normal font-medium max-w-full">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <div className="space-y-3.5">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold uppercase font-mono tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded inline-block mb-2">
                          PAYMENT INSTANCE: {checkoutPaymentMethod === "paystack" ? "PAYSTACK ONLINE" : "MANUAL BANK TRANSFER"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Registered Student Email Address</label>
                        <input
                          type="email"
                          readOnly
                          value={studentEmail}
                          className="w-full text-xs font-bold font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold font-mono text-slate-450 uppercase">Student Full Name</label>
                        <input
                          type="text"
                          required
                          value={paymentName}
                          onChange={(e) => setPaymentName(e.target.value)}
                          placeholder="Louis Olosunde"
                          className="w-full text-xs font-semibold bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold font-mono text-slate-450 uppercase">Phone Number</label>
                        <input
                          type="tel"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="e.g. 08031234567"
                          className="w-full text-xs font-semibold bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {(!checkoutCourse.paymentMethods || checkoutCourse.paymentMethods.length > 1) ? (
                        <button
                          type="button"
                          onClick={() => setCheckoutStep("method_selection")}
                          className="py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 leading-none text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Change Method
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCheckoutCourse(null)}
                          className="py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 leading-none text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (checkoutPaymentMethod === "paystack") {
                            setCheckoutStep("paystack");
                          } else {
                            setCheckoutStep("bank_transfer");
                          }
                        }}
                        className="py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#103D2E] dark:hover:bg-[#154637] text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 leading-none shadow-xs text-center font-sans"
                      >
                        Continue <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === "paystack" && (
                  <div className="space-y-5 text-left pb-1">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-3">
                      <div>
                        <span className="text-[8px] font-mono text-slate-400 font-bold uppercase block leading-none">Merchant</span>
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-tight block mt-1 leading-none">RMA & CII ADMISSIONS</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-mono text-slate-400 font-bold uppercase block leading-none">Billing</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-[#A3E635] font-mono block mt-1 leading-none">₦{checkoutCourse.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold font-mono text-slate-455 uppercase flex items-center gap-1">
                          <CreditCard size={12} /> ENTER CARD NUMBER
                        </label>
                        <input
                          type="text"
                          required
                          value={paystackCardNumber}
                          onChange={(e) => setPaystackCardNumber(e.target.value)}
                          placeholder="4081 0291 9382 0182"
                          className="w-full text-xs font-bold font-mono bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">EXPIRY DATE</label>
                          <input
                            type="text"
                            required
                            value={paystackExpiry}
                            onChange={(e) => setPaystackExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full text-xs font-bold font-mono bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">CVV SECURITY CODE</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={paystackCVV}
                            onChange={(e) => setPaystackCVV(e.target.value)}
                            placeholder="***"
                            className="w-full text-xs font-bold font-mono bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] text-slate-450 leading-relaxed font-normal rounded-xl">
                      🔒 Secured client connection. Payments are processed through automated billing gateways safely. Verifiable SSL signatures verified server-side.
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("form")}
                        className="py-3.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 leading-none text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        Go Back
                      </button>
                      <button
                        type="button"
                        onClick={handleProcessSimulatedPayment}
                        className="py-3.5 bg-[#0e3a2f] hover:bg-[#154d3e] text-white font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer"
                      >
                        Authorize Charge
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === "bank_transfer" && (
                  <div className="space-y-4 text-left pb-1">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-455 font-bold uppercase block leading-none">Billing Tuition Fee</span>
                      <span className="text-md font-bold text-emerald-600 dark:text-[#A3E635] font-mono block mt-1 leading-none">₦{checkoutCourse.price.toLocaleString()}</span>
                    </div>

                    {paymentError && (
                      <div className="p-3 bg-red-950 border border-red-800/30 text-red-205 rounded-xl flex items-start gap-2 text-[10px] font-medium leading-relaxed">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Choose Bank Account Config Section */}
                    {paymentSettings?.bankAccounts?.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Select Destination Account</label>
                        <select
                          value={selectedBankId}
                          onChange={(e) => setSelectedBankId(e.target.value)}
                          className="w-full text-xs font-semibold bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                        >
                          {paymentSettings.bankAccounts.filter((b: any) => b.active).map((b: any) => (
                            <option key={b.id} value={b.id}>{b.bankName} — {b.accountNumber}</option>
                          ))}
                        </select>

                        {/* Card display for chosen bank */}
                        {paymentSettings.bankAccounts.find((b: any) => b.id === selectedBankId) && (
                          <div className="mt-2.5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-left space-y-2">
                            <div>
                              <p className="text-[8px] font-mono text-emerald-600 dark:text-[#A3E635] font-bold uppercase tracking-wider leading-none">Bank Name</p>
                              <p className="font-bold text-slate-900 dark:text-white uppercase mt-0.5">
                                {paymentSettings.bankAccounts.find((b: any) => b.id === selectedBankId).bankName}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[8px] font-mono text-emerald-600 dark:text-[#A3E635] font-bold uppercase tracking-wider leading-none">Account Number</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono font-black text-slate-950 dark:text-emerald-305">
                                    {paymentSettings.bankAccounts.find((b: any) => b.id === selectedBankId).accountNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentSettings.bankAccounts.find((b: any) => b.id === selectedBankId).accountNumber);
                                      showNotification("Account number copied seamlessly!", "success");
                                    }}
                                    className="px-1 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded font-mono text-[8px] uppercase font-bold text-emerald-600 cursor-pointer text-center leading-none"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <div>
                                <p className="text-[8px] font-mono text-emerald-600 dark:text-[#A3E635] font-bold uppercase tracking-wider leading-none">Account Name</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-300 truncate mt-0.5 leading-snug">
                                  {paymentSettings.bankAccounts.find((b: any) => b.id === selectedBankId).accountName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Formatted payment instructions */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold rounded-xl">
                      <span className="font-mono font-extrabold text-[8.5px] tracking-wider text-slate-455 uppercase block mb-1">Payment Instructions</span>
                      {paymentSettings?.paymentInstructions || "Please upload a bank payment receipt below."}
                    </div>

                    {/* Receipt image file upload */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold font-mono text-slate-405 uppercase">Attach Transfer Receipt / Screenshot</label>
                      <div className="border border-dashed border-slate-205 dark:border-slate-800 hover:border-emerald-555/50 rounded-2xl p-4 bg-white dark:bg-[#0D1311] text-center transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReceiptFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        />
                        <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                          <span className="p-2 bg-emerald-500/10 text-emerald-650 rounded-xl"><Download size={14} /></span>
                          <p className="text-2xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                            {receiptFileName ? receiptFileName : "Upload receipt screenshot (Max 2MB)"}
                          </p>
                          <p className="text-[8.5px] text-[#2ECC71] leading-none font-sans font-normal">Supports PNG, JPG, or PDF file types</p>
                        </div>
                      </div>
                      
                      {receiptFileBase64 && (
                        <div className="p-1 px-2.5 bg-emerald-500/10 rounded-lg text-emerald-705 dark:text-[#A3E635] text-[9.5px] font-mono flex items-center justify-between font-bold leading-none">
                          <span>✓ File Encoded Successfully</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptFileName("");
                              setReceiptFileBase64("");
                            }}
                            className="text-rose-500 font-sans cursor-pointer hover:underline text-[9px]"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Transfer reference field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Transaction ID / Sender Name (Optional)</label>
                      <input
                        type="text"
                        value={receiptReference}
                        onChange={(e) => setReceiptReference(e.target.value)}
                        placeholder="e.g. TF/ZO-20260606-93021 or John Doe Transfer"
                        className="w-full text-xs font-semibold bg-white dark:bg-[#0F1714] border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("form")}
                        className="py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 leading-none text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center font-sans"
                      >
                        Go Back
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleProcessBankTransfer}
                        className="py-3 bg-emerald-605 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 leading-none shadow-xs text-center font-sans"
                      >
                        Submit Payment <Send size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === "loading" && (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <RefreshCw size={32} className="animate-spin text-emerald-650" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-widest">SUBMITTING ADMISSION REQUEST...</p>
                      <p className="text-[10.5px] text-slate-450 font-normal">Contacting RightMinds Africa academy databases. Please keep browser secure.</p>
                    </div>
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="py-8 text-center flex flex-col items-center gap-6">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-655 dark:text-[#A3E635] flex items-center justify-center p-1.5 shadow-sm">
                      <CheckCircle2 size={32} />
                    </div>

                    <div className="space-y-2 text-left">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white text-center">
                        {checkoutPaymentMethod === "paystack" ? "Payment Successful" : "Bank Transfer Logged"}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-xs mx-auto text-center">
                        {checkoutPaymentMethod === "paystack" 
                          ? "Congratulations! Your course subscription has been unlocked. Proceed to your learning dashboard to begin learning." 
                          : "Thank you! Your manual transfer details have been submitted. Our administrators will verify the receipt and authorize your course access shortly."}
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => setCheckoutCourse(null)}
                        className="px-5 py-3 border border-slate-205 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl uppercase"
                      >
                        Close
                      </button>
                      
                      {checkoutPaymentMethod === "paystack" && (
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutCourse(null);
                            setLearningActiveCourse(checkoutCourse);
                            if (checkoutCourse.modules?.length > 0 && checkoutCourse.modules[0].lessons?.length > 0) {
                              setLearningActiveLesson(checkoutCourse.modules[0].lessons[0]);
                            }
                            setView("my-learning");
                            window.history.pushState(null, "", "/my-learning");
                          }}
                          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#A3E635] dark:text-slate-950 dark:hover:bg-amber-400 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        >
                          Start Learning
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
        document.body
      )}

      {/* RENDER VIEW: PLAYBACK PREVIEW VIDEO DIALOG */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {previewLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewLesson(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              id="preview-backdrop"
            />

            {/* Video Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-20 flex flex-col"
              id="preview-player-modal"
            >
              {/* Media Title Bar */}
              <div className="bg-slate-900/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-white font-semibold">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="shrink-0 text-amber-500 font-mono text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">Free Preview</span>
                  <p className="truncate font-bold uppercase text-[10.5px]">{previewLesson.title}</p>
                </div>
                <button
                  onClick={() => setPreviewLesson(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Player element */}
              <div className="relative aspect-video bg-slate-950">
                <iframe
                  src={previewLesson.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                  title={previewLesson.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allowFullScreen
                />
              </div>

              {/* Status footer banner */}
              <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-900/80 text-[10px] text-slate-400/90 font-mono leading-relaxed text-left flex items-center justify-between shrink-0">
                <span>Curriculum duration preview: {previewLesson.duration}</span>
                <span className="text-amber-500 font-bold uppercase">🔒 Join VIP track to unlock full syllabus reviews</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
        document.body
      )}

      {/* Bank Transfer Checkout Modal */}
      <LmsBankCheckoutModal
        isOpen={isBankCheckoutOpen}
        onClose={() => setIsBankCheckoutOpen(false)}
        course={bankCheckoutCourse}
        studentEmail={studentEmail}
        studentName={paymentName}
        onSuccess={() => {
          fetchLMSData();
          showNotification("Payment receipt uploaded successfully! Awaiting admin approval.", "success");
        }}
        onNotify={(msg, type) => showNotification(msg, type === "error" ? "error" : "success")}
      />

    </div>
  );
}
