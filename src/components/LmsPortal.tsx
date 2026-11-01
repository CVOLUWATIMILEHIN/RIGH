import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Award, 
  Play, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Users, 
  Clock, 
  FileText, 
  Volume2, 
  HelpCircle, 
  ArrowLeft, 
  TrendingUp, 
  Search, 
  Filter, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Gift, 
  Download, 
  Share2, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  Send,
  X,
  RefreshCw
} from "lucide-react";
import { 
  getCourses, 
  getCourseEnrollments, 
  saveCourseEnrollment, 
  saveCoursePayment, 
  saveCourseCertificate, 
  LMSCourse, 
  LMSCourseEnrollment, 
  LMSLesson, 
  LMSModule 
} from "../lib/db";
import LmsBankCheckoutModal from "./LmsBankCheckoutModal";

// Paystack Inline checkout custom script loader helper
function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).PaystackPop) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const CATEGORIES = [
  "All Categories",
  "Leadership Development",
  "Career Growth",
  "Digital Skills",
  "Entrepreneurship",
  "NYSC Success Training",
  "Personal Development",
  "Financial Literacy",
  "Technology"
];

const DISCOUNTS: Record<string, { type: "percent" | "fixed"; value: number }> = {
  "RMA10": { type: "percent", value: 10 },
  "WELCOME55": { type: "fixed", value: 50 },
  "CORPMEMBER": { type: "percent", value: 15 },
  "LEADERSHIP20": { type: "percent", value: 20 }
};

interface LmsPortalProps {
  onBack: () => void;
  theme: "light" | "dark";
}

export default function LmsPortal({ onBack, theme }: LmsPortalProps) {
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [enrollments, setEnrollments] = useState<LMSCourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  
  // Student Context (Email-based auth session)
  const [studentEmail, setStudentEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rma_student_email") || "";
    }
    return "";
  });
  const [studentName, setStudentName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rma_student_name") || "";
    }
    return "";
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBankCheckoutOpen, setIsBankCheckoutOpen] = useState(false);
  const [bankCheckoutCourse, setBankCheckoutCourse] = useState<LMSCourse | null>(null);
  const [authEmailInput, setAuthEmailInput] = useState("");
  const [authNameInput, setAuthNameInput] = useState("");
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [authPhoneInput, setAuthPhoneInput] = useState("");
  const [authLocationInput, setAuthLocationInput] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  
  // Verification security states
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [showVerificationLockModal, setShowVerificationLockModal] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Secure Student Brute-Force lockout states
  const [studentFailedAttempts, setStudentFailedAttempts] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_student_failed_attempts");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [studentLockoutUntil, setStudentLockoutUntil] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rma_student_lockout_until");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [studentLockoutTimeLeft, setStudentLockoutTimeLeft] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (studentLockoutUntil <= 0) return;
    const updateCountdown = () => {
      const diff = Math.ceil((studentLockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setStudentLockoutTimeLeft(0);
        setStudentLockoutUntil(0);
        setStudentFailedAttempts(0);
        if (typeof window !== "undefined") {
          localStorage.removeItem("rma_student_failed_attempts");
          localStorage.removeItem("rma_student_lockout_until");
        }
      } else {
        setStudentLockoutTimeLeft(diff);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [studentLockoutUntil]);

  // Navigation / Interactive View states
  const [selectedCourse, setSelectedCourse] = useState<LMSCourse | null>(null);
  const [activeEnrolledCourse, setActiveEnrolledCourse] = useState<LMSCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<LMSLesson | null>(null);

  // Checkout and promotion codes state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  // Active Lesson Progress State
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Tab state inside learning classroom
  const [classroomTab, setClassroomTab] = useState<"content" | "materials" | "discuss">("content");

  // Notifications inside LMS
  const [lmsNotification, setLmsNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Timer for verification resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auth Listener & Verification Sync
  useEffect(() => {
    let unsubscribe: any = null;
    const initAuth = async () => {
      try {
        const { getFirebaseAuth, getFirestoreDb } = await import("../lib/db");
        const auth = await getFirebaseAuth();
        const db = await getFirestoreDb();
        const { doc, getDoc, updateDoc } = await import("firebase/firestore");

        unsubscribe = auth.onAuthStateChanged(async (user: any) => {
          if (user) {
            setStudentEmail(user.email || "");
            setStudentName(user.displayName || user.email?.split("@")[0] || "Scholar");
            setIsEmailVerified(user.emailVerified);
            localStorage.setItem("rma_student_email", user.email || "");
            localStorage.setItem("rma_student_name", user.displayName || user.email?.split("@")[0] || "Scholar");

            // Sync with Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef).catch(() => null);
            if (userSnap && userSnap.exists()) {
              const data = userSnap.data();
              if (data.emailVerified !== user.emailVerified) {
                await updateDoc(userDocRef, {
                  emailVerified: user.emailVerified,
                  verificationDate: user.emailVerified ? new Date().toISOString() : null
                }).catch(() => null);
              }
            }
          } else {
            // Keep local storage if it's there, but mark as unverified
            const savedEmail = localStorage.getItem("rma_student_email");
            const savedName = localStorage.getItem("rma_student_name");
            if (savedEmail) {
              setStudentEmail(savedEmail);
              setStudentName(savedName || "Scholar");
              setIsEmailVerified(false);
            } else {
              setStudentEmail("");
              setStudentName("");
              setIsEmailVerified(true);
            }
          }
        });
      } catch (err) {
        console.error("Firebase auth initialization failed:", err);
      }
    };

    initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await getCourses();
        setCourses(list.filter(c => c.status === "published"));
        
        if (studentEmail) {
          const enrolls = await getCourseEnrollments(studentEmail);
          setEnrollments(enrolls);
        }
      } catch (err) {}
      setLoading(false);
    };
    fetchData();
  }, [studentEmail]);

  // Load Paystack Script
  useEffect(() => {
    loadPaystackScript();
  }, []);

  const triggerNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    setLmsNotification({ text, type });
    setTimeout(() => {
      setLmsNotification(null);
    }, 4000);
  };

  const handleStudentGoogleLogin = async () => {
    setAuthErrorMessage("");
    try {
      const { getFirebaseAuth, getFirestoreDb } = await import("../lib/db");
      const auth = await getFirebaseAuth();
      const { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        await setPersistence(auth, browserLocalPersistence).catch(() => null);
      } catch (pErr) {}

      let userCredential;
      try {
        console.log("[LMS GOOGLE AUTH] Attempting student Google sign-in...");
        userCredential = await signInWithPopup(auth, provider);
      } catch (firstErr: any) {
        console.warn("[LMS GOOGLE AUTH] Primary popup failed/closed:", firstErr?.code || firstErr?.message);
        
        const isPopupErr = 
          firstErr?.code === "auth/popup-closed-by-user" ||
          firstErr?.code === "auth/cancelled-popup-request" ||
          firstErr?.code === "auth/popup-blocked" ||
          firstErr?.message?.includes("popup");

        if (isPopupErr) {
          console.log("[LMS GOOGLE AUTH] Retrying Google popup sign-in once...");
          await new Promise(r => setTimeout(r, 600));
          try {
            userCredential = await signInWithPopup(auth, provider);
          } catch (retryErr: any) {
            console.error("[LMS GOOGLE AUTH] Retry popup failed:", retryErr?.code || retryErr?.message);
            if (retryErr?.code === "auth/popup-closed-by-user") {
              throw new Error("The Google sign-in window was closed before completion. Please click 'Continue with Google' again.");
            } else if (retryErr?.code === "auth/popup-blocked") {
              throw new Error("The Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
            }
            throw retryErr;
          }
        } else {
          throw firstErr;
        }
      }

      const user = userCredential.user;
      const cleanEmail = user.email ? user.email.toLowerCase().trim() : "";

      const { doc, getDoc, setDoc, updateDoc } = await import("firebase/firestore");
      const db = await getFirestoreDb();

      // Create or update student profile in Firestore
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            id: user.uid,
            fullName: user.displayName || user.email?.split("@")[0] || "Student",
            email: cleanEmail,
            phone: user.phoneNumber || "N/A",
            role: "Student",
            joinedAt: new Date().toISOString(),
            status: "Active",
            location: "N/A",
            emailVerified: user.emailVerified || false,
            verificationAttempts: 0,
            verificationSentAt: null,
            lastLogin: new Date().toISOString()
          });
        } else {
          await updateDoc(userDocRef, {
            lastLogin: new Date().toISOString(),
            emailVerified: user.emailVerified || false
          }).catch(() => null);
        }
      } catch (pErr) {
        console.warn("Error setting user profile on Google student login:", pErr);
      }

      setStudentEmail(cleanEmail);
      setStudentName(user.displayName || user.email?.split("@")[0] || "Scholar");
      setIsEmailVerified(user.emailVerified);

      localStorage.setItem("rma_student_email", cleanEmail);
      localStorage.setItem("rma_student_name", user.displayName || user.email?.split("@")[0] || "Scholar");

      setIsAuthModalOpen(false);
      triggerNotification(`Welcome, ${user.displayName || "Scholar"}!`, "success");
    } catch (err: any) {
      console.error("Student Google Sign-In error:", err);
      
      const isUnauthorizedDomain = 
        err?.code === "auth/unauthorized-domain" || 
        err?.message?.includes("unauthorized-domain") ||
        err?.message?.includes("auth/unauthorized-domain");

      if (isUnauthorizedDomain) {
        const domainName = typeof window !== "undefined" ? window.location.hostname : "this web domain";
        setAuthErrorMessage(
          `Google Sign-In is restricted on this web domain (${domainName}). Please sign in using Email & Password or register an account above, or add '${domainName}' under Authorized Domains in Firebase Console -> Authentication -> Settings.`
        );
      } else {
        setAuthErrorMessage(err.message || "Google authentication failed. Please try again.");
      }
    }
  };

  const handleStudentSessionLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMessage("");
    
    if (studentLockoutTimeLeft > 0) {
      const mins = Math.ceil(studentLockoutTimeLeft / 60);
      setAuthErrorMessage(`Too many failed login attempts. This student portal is temporarily locked. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
      triggerNotification("Portal is temporarily locked for security.", "error");
      return;
    }

    const email = authEmailInput.trim().toLowerCase();
    if (!email) return;

    try {
      const { getFirebaseAuth, getFirestoreDb } = await import("../lib/db");
      const auth = await getFirebaseAuth();
      
      if (authMode === "login") {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const userCredential = await signInWithEmailAndPassword(auth, email, authPasswordInput);
        const user = userCredential.user;
        
        // Sync last login in Firestore
        const { doc, updateDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString()
        }).catch(() => null);

        // Reset failed login attempts on successful login
        setStudentFailedAttempts(0);
        if (typeof window !== "undefined") {
          localStorage.removeItem("rma_student_failed_attempts");
          localStorage.removeItem("rma_student_lockout_until");
        }

        setStudentEmail(user.email || "");
        setStudentName(user.displayName || user.email?.split("@")[0] || "Scholar");
        setIsEmailVerified(user.emailVerified);
        
        localStorage.setItem("rma_student_email", user.email || "");
        localStorage.setItem("rma_student_name", user.displayName || user.email?.split("@")[0] || "Scholar");
        
        setIsAuthModalOpen(false);
        setAuthPasswordInput("");
        triggerNotification(`Welcome back, ${user.displayName || "Student"}!`, "success");
        
        if (!user.emailVerified) {
          triggerNotification("Your email address is unverified. Verification required.", "info");
        }
      } else if (authMode === "signup") {
        const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import("firebase/auth");
        const { doc, setDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();

        const userCredential = await createUserWithEmailAndPassword(auth, email, authPasswordInput);
        const user = userCredential.user;

        // Update profile display name
        await updateProfile(user, { displayName: authNameInput });

        // Save platform user doc
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          fullName: authNameInput,
          email: email,
          phone: authPhoneInput || "N/A",
          role: "Student",
          joinedAt: new Date().toISOString(),
          status: "Active",
          location: authLocationInput || "N/A",
          emailVerified: false,
          verificationAttempts: 1,
          verificationSentAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });

        // Trigger standard verification email
        await sendEmailVerification(user).catch(() => null);

        // Dispatched custom professional backup confirmation email via the API
        const link = window.location.origin + "/?view=verify-email&email=" + encodeURIComponent(email) + "&uid=" + user.uid;
        await fetch("/api/email/trigger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event: "EMAIL_VERIFICATION",
            payload: {
              fullName: authNameInput,
              email: email,
              verificationLink: link
            }
          })
        }).catch(() => null);

        setStudentEmail(user.email || "");
        setStudentName(authNameInput);
        setIsEmailVerified(false);
        
        localStorage.setItem("rma_student_email", user.email || "");
        localStorage.setItem("rma_student_name", authNameInput);
        
        setIsAuthModalOpen(false);
        setAuthPasswordInput("");
        setAuthPhoneInput("");
        setAuthLocationInput("");
        
        triggerNotification("Account created! A verification link was dispatched to your inbox.", "success");
        setShowVerificationLockModal(true);
      } else if (authMode === "forgot") {
        const { sendPasswordResetEmail } = await import("firebase/auth");
        await sendPasswordResetEmail(auth, email);
        triggerNotification("Password reset instructions dispatched to your inbox.", "success");
        setAuthMode("login");
      }
    } catch (err: any) {
      console.error("Auth process error:", err);
      let friendlyMessage = "Authentication failed. Please verify your details.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email address or security password.";
        if (authMode === "login") {
          const nextAttempts = studentFailedAttempts + 1;
          setStudentFailedAttempts(nextAttempts);
          if (typeof window !== "undefined") {
            localStorage.setItem("rma_student_failed_attempts", nextAttempts.toString());
          }
          if (nextAttempts >= 5) {
            const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 mins
            setStudentLockoutUntil(lockoutTime);
            if (typeof window !== "undefined") {
              localStorage.setItem("rma_student_lockout_until", lockoutTime.toString());
            }
            friendlyMessage = "Too many failed login attempts. This student portal has been locked for 15 minutes to prevent unauthorized access.";
          } else {
            friendlyMessage = `Incorrect email address or security password. Attempt ${nextAttempts} of 5 before lockout.`;
          }
        }
      } else if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email address is already registered.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Security password should be at least 6 characters.";
      }
      setAuthErrorMessage(friendlyMessage);
      triggerNotification(friendlyMessage, "error");
    }
  };

  const handleStudentSignOut = async () => {
    try {
      const { getFirebaseAuth } = await import("../lib/db");
      const auth = await getFirebaseAuth();
      await auth.signOut();
    } catch (e) {}
    localStorage.removeItem("rma_student_email");
    localStorage.removeItem("rma_student_name");
    setStudentEmail("");
    setStudentName("");
    setEnrollments([]);
    setActiveEnrolledCourse(null);
    setActiveLesson(null);
    setIsEmailVerified(true);
    triggerNotification("Logged out of your learning portal successfully.", "info");
  };

  const handleResendStudentVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      const { getFirebaseAuth, getFirestoreDb } = await import("../lib/db");
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      if (user) {
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(user);
        
        // Custom trigger API
        const link = window.location.origin + "/?view=verify-email&email=" + encodeURIComponent(user.email || "") + "&uid=" + user.uid;
        await fetch("/api/email/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "EMAIL_VERIFICATION",
            payload: {
              fullName: studentName,
              email: user.email,
              verificationLink: link
            }
          })
        }).catch(() => null);

        // Update attempts in Firestore
        const { doc, getDoc, updateDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef).catch(() => null);
        const currentAttempts = userDoc?.exists() ? (userDoc.data().verificationAttempts || 1) : 1;
        await updateDoc(userDocRef, {
          verificationSentAt: new Date().toISOString(),
          verificationAttempts: currentAttempts + 1
        }).catch(() => null);

        setResendCooldown(60); // 60 seconds cooldown
        triggerNotification("New verification email dispatched successfully!", "success");
      } else {
        triggerNotification("No active session found. Please sign in again.", "error");
      }
    } catch (err: any) {
      triggerNotification("Could not resend email: " + (err.message || err.code), "error");
    }
  };

  const handleCheckAndReloadVerificationStatus = async () => {
    try {
      const { getFirebaseAuth } = await import("../lib/db");
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setIsEmailVerified(true);
          setShowVerificationLockModal(false);
          triggerNotification("Excellent! Your email is verified. Access unlocked.", "success");
          
          // Sync with Firestore
          const { doc, updateDoc } = await import("firebase/firestore");
          const { getFirestoreDb } = await import("../lib/db");
          const db = await getFirestoreDb();
          await updateDoc(doc(db, "users", user.uid), {
            emailVerified: true,
            verificationDate: new Date().toISOString()
          }).catch(() => null);
        } else {
          triggerNotification("Status is still unverified. Please check your inbox.", "info");
        }
      }
    } catch (err) {}
  };

  const applyPromoCode = () => {
    const upCode = promoCode.trim().toUpperCase();
    if (DISCOUNTS[upCode]) {
      const promotion = DISCOUNTS[upCode];
      setAppliedPromo(upCode);
      if (selectedCourse) {
        let saved = 0;
        if (promotion.type === "percent") {
          saved = Math.round((selectedCourse.price * promotion.value) / 100);
        } else {
          saved = promotion.value;
        }
        setDiscountAmount(saved);
        triggerNotification(`Coupon "${upCode}" applied successfully! Saved ₦${saved.toLocaleString()}`, "success");
      }
    } else {
      triggerNotification("Invalid or expired coupon code.", "error");
    }
  };

  const handleEnrollFreePreview = (course: LMSCourse) => {
    if (!studentEmail) {
      setAuthEmailInput("");
      setAuthNameInput("");
      setIsAuthModalOpen(true);
      return;
    }

    // Set first preview lesson as active immediately
    const firstPreviewLesson = course.modules
      .flatMap(m => m.lessons)
      .find(l => l.isFreePreview);

    if (firstPreviewLesson) {
      setSelectedCourse(null);
      setActiveEnrolledCourse(course);
      setActiveLesson(firstPreviewLesson);
      setClassroomTab("content");
      triggerNotification("Entering Free Preview Mode. Buy course to unlock full syllabus.", "info");
    } else {
      triggerNotification("No free preview lessons found for this course.", "error");
    }
  };

  const handleCoursePaymentAndEnrollment = async (course: LMSCourse) => {
    if (!studentEmail) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isEmailVerified) {
      setShowVerificationLockModal(true);
      return;
    }

    setBankCheckoutCourse(course);
    setIsBankCheckoutOpen(true);
  };

  const handleMarkLessonComplete = async (course: LMSCourse, lesson: LMSLesson) => {
    const currentEnroll = enrollments.find(e => e.courseId === course.id);
    if (!currentEnroll) {
      triggerNotification("You need to buy this course to track progress.", "error");
      return;
    }

    if (currentEnroll.completedLessons.includes(lesson.id)) {
      triggerNotification("Lesson already marked completed.", "info");
      return;
    }

    const updatedLessons = [...currentEnroll.completedLessons, lesson.id];
    
    // Count total syllabus lessons
    const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    const progress = Math.round((updatedLessons.length / totalLessons) * 100);
    const status = progress === 100 ? "completed" as const : "active" as const;

    const updatedEnrollment: LMSCourseEnrollment = {
      ...currentEnroll,
      completedLessons: updatedLessons,
      progress,
      status
    };

    await saveCourseEnrollment(updatedEnrollment);
    
    setEnrollments(prev => prev.map(e => e.id === updatedEnrollment.id ? updatedEnrollment : e));
    triggerNotification(`Lesson complete! Course progress: ${progress}%`, "success");

    // Automatically generate completion certificate if 100% completed
    if (progress === 100) {
      const certId = `cert-${Date.now()}`;
      const code = `RMA-CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await saveCourseCertificate({
        id: certId,
        userEmail: studentEmail,
        userName: studentName || studentEmail.split("@")[0],
        courseId: course.id,
        courseTitle: course.title,
        certificateCode: code,
        issuedAt: new Date().toISOString()
      });
      triggerNotification("Award earned! Graduation certificate has been unlocked.", "success");
    }
  };

  const handleQuizSubmit = (lesson: LMSLesson) => {
    if (!lesson.quizQuestions) return;
    
    let score = 0;
    lesson.quizQuestions.forEach(q => {
      if (selectedQuizAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const percent = Math.round((score / lesson.quizQuestions.length) * 100);
    setQuizScore(percent);

    if (percent >= 70) {
      triggerNotification(`Assessment passed with ${percent}% score!`, "success");
      if (activeEnrolledCourse) {
        handleMarkLessonComplete(activeEnrolledCourse, lesson);
      }
    } else {
      triggerNotification(`Assessment scored ${percent}%. Retake to score at least 70% to pass.`, "error");
    }
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentText.trim()) return;
    setAssignmentSubmitted(true);
    triggerNotification("Assignment uploaded for instructor review. Well done!", "success");
    if (activeEnrolledCourse && activeLesson) {
      handleMarkLessonComplete(activeEnrolledCourse, activeLesson);
    }
  };

  // Filter computation
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "All Levels" || c.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div id="lms-view-container" className={`min-h-screen pt-32 pb-16 bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating Notification */}
        <AnimatePresence>
          {lmsNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              id="lms-floating-notification"
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-white font-semibold text-xs ${
                lmsNotification.type === "success" ? "bg-emerald-600 border-emerald-500" :
                lmsNotification.type === "error" ? "bg-rose-600 border-rose-500" :
                "bg-blue-600 border-blue-500"
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{lmsNotification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Headers */}
        {!activeEnrolledCourse ? (
          <div>
            {studentEmail && !isEmailVerified && (
              <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/35 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="p-1 bg-amber-500/10 text-amber-600 rounded-lg mt-0.5">
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-850 dark:text-amber-400">EMAIL VERIFICATION REQUIRED</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-350/90 mt-0.5 leading-relaxed">
                      Your learning profile email (<strong>{studentEmail}</strong>) is currently unverified. Core certification features and active classrooms are locked.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleResendStudentVerification}
                    disabled={resendCooldown > 0}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Link"}
                  </button>
                  <button
                    onClick={handleCheckAndReloadVerificationStatus}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-350 dark:border-amber-700/50 text-slate-700 dark:text-amber-350 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={10} className="animate-spin-slow" /> Verify Status
                  </button>
                </div>
              </div>
            )}

            {/* Upper Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-205 dark:border-slate-800 pb-6">
              <div>
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer font-bold uppercase mb-2"
                >
                  <ArrowLeft size={14} /> Back to Hub
                </button>
                <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight flex items-center gap-2">
                  <Award className="text-amber-500" size={30} /> LeftBrain Premium Academy
                </h1>
                <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
                  Verified certifications by Right Minds Africa and Corper Impact Initiative.
                </p>
              </div>

              {/* Identity sync bar */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
                {studentEmail ? (
                  <div className="flex items-center justify-between gap-5 w-full">
                    <div className="text-left">
                      <span className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 leading-none">ACTIVE LEARNER</span>
                      <span className="font-bold text-xs block text-slate-800 dark:text-white truncate max-w-[150px] mt-1">{studentName}</span>
                    </div>
                    <button
                      onClick={handleStudentSignOut}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-[10px] font-bold rounded-lg uppercase cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthEmailInput("");
                      setAuthNameInput("");
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <Users size={12} /> Sign In to Track Learning
                  </button>
                )}
              </div>
            </div>

            {/* If Single Course Details Panel is active, center it */}
            {selectedCourse ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Outline/Details Column */}
                <div className="lg:col-span-2 space-y-6">
                  <button
                    onClick={() => { setSelectedCourse(null); setPromoCode(""); setAppliedPromo(null); setDiscountAmount(0); }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer font-bold uppercase"
                  >
                    <ArrowLeft size={12} /> Back to course list
                  </button>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-550 dark:text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wider rounded-lg">
                      {selectedCourse.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-3">
                      {selectedCourse.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 pb-6 border-b border-slate-100 dark:border-slate-850">
                      <span className="flex items-center gap-1"><Clock size={13} className="text-amber-550" /> {selectedCourse.duration}</span>
                      <span className="flex items-center gap-1"><BookOpen size={13} className="text-amber-550" /> {selectedCourse.lessonsCount} Modules/Lessons</span>
                      <span className="flex items-center gap-1"><Users size={13} className="text-amber-550" /> Instructor: {selectedCourse.instructorName}</span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-[10px] font-bold uppercase rounded-md">{selectedCourse.level}</span>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2">Primary Course Description</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed mb-6">
                        {selectedCourse.description}
                      </p>
                    </div>

                    {/* Syllabus Outline accordion list */}
                    <div>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <BookOpen size={16} className="text-amber-550" /> Course Syllabus List
                      </h3>
                      <div className="space-y-4">
                        {selectedCourse.modules.map((mod, mi) => (
                          <div key={mod.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
                            <h4 className="font-bold text-xs uppercase tracking-tight text-slate-800 dark:text-slate-205">
                              {mod.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 mb-2">{mod.description}</p>
                            
                            <div className="divide-y divide-slate-100 dark:divide-slate-850 mt-2">
                              {mod.lessons.map((les) => (
                                <div key={les.id} className="py-2.5 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    {les.type === "video" && <Play className="w-3.5 h-3.5 text-amber-550" />}
                                    {les.type === "pdf" && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                                    {les.type === "audio" && <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
                                    {les.type === "quiz" && <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />}
                                    {les.type === "assignment" && <CheckCircle className="w-3.5 h-3.5 text-violet-500" />}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{les.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                                    {les.isFreePreview && <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-550 dark:text-emerald-400 font-bold font-sans rounded text-[9px] uppercase tracking-wide">Free Preview</span>}
                                    <span>{les.duration}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Transactional Purchase Column */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-28">
                    <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 mb-4 bg-slate-100 dark:bg-slate-800">
                      <img src={selectedCourse.thumbnail} alt="Thumbnail representation" className="w-full h-full object-cover" />
                    </div>

                    <div className="mb-6">
                      <span className="block text-[11px] font-mono text-slate-400 font-bold tracking-wider uppercase">NGN PRICING TIER</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        {discountAmount > 0 ? (
                          <>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              ₦{Math.max(0, selectedCourse.price - discountAmount).toLocaleString()}
                            </span>
                            <span className="text-sm line-through text-slate-400 font-bold">
                              ₦{selectedCourse.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ₦{selectedCourse.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Promo code boxes */}
                    <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-850">
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide">HAVE A COUPON OR GIFT PROMO?</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Code e.g. RMA10"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={isProcessingPayment}
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 outline-none rounded-xl font-mono text-slate-800 dark:text-white focus:border-amber-500"
                        />
                        <button
                          onClick={applyPromoCode}
                          disabled={isProcessingPayment}
                          className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 select-none text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      
                      {appliedPromo && (
                        <div className="p-2 py-1.5 bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-medium flex items-center gap-1.5">
                          <Gift size={12} /> Coupon <strong>{appliedPromo}</strong> applied! Saved ₦{discountAmount.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-6 space-y-3">
                      {enrollments.some(e => e.courseId === selectedCourse.id) ? (
                        <button
                          onClick={() => {
                            if (!isEmailVerified) {
                              setShowVerificationLockModal(true);
                              return;
                            }
                            setSelectedCourse(null);
                            setActiveEnrolledCourse(selectedCourse);
                            const firstLesson = selectedCourse.modules[0]?.lessons[0];
                            if (firstLesson) setActiveLesson(firstLesson);
                          }}
                          className="w-full py-3.5 bg-[#0E3A2F] text-white hover:bg-emerald-800 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
                        >
                          Access Classroom Dashboard
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCoursePaymentAndEnrollment(selectedCourse)}
                            disabled={isProcessingPayment}
                            className="w-full py-3.5 bg-[#0A1A14] hover:bg-[#112d22] text-white dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                          >
                            <Lock size={12} />
                            {isProcessingPayment ? checkoutMessage : `Enroll & Pay ₦${Math.max(0, selectedCourse.price - discountAmount).toLocaleString()}`}
                          </button>

                          {selectedCourse.modules.some(m => m.lessons.some(l => l.isFreePreview)) && (
                            <button
                              onClick={() => handleEnrollFreePreview(selectedCourse)}
                              disabled={isProcessingPayment}
                              className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-white font-bold uppercase rounded-xl cursor-pointer"
                            >
                              Free Intro Preview
                            </button>
                          )}
                        </>
                      )}

                      <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5">
                        <p className="flex items-center gap-1 font-bold text-amber-550 dark:text-amber-400"><Award size={12} className="shrink-0" /> Verified LMS Certification Guaranteed</p>
                        <p className="leading-relaxed">Complete all tasks and score at least 70% in assessments to download your digital verification document.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Course Directory Grid list */
              <div>
                
                {/* Promo notice */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 bg-gradient-to-r from-amber-500/10 to-[#103D2E]/10 border border-amber-500/15 rounded-3xl mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-555">
                      <Gift size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-900 dark:text-white leading-tight">National Service Launch Celebration!</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Use code <strong className="font-mono text-amber-550">RMA10</strong> for 10% Off or <strong className="font-mono text-amber-550">CORPMEMBER</strong> for 15% Off all premium paths.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg font-bold text-slate-600 dark:text-slate-350">
                      RMA10
                    </span>
                    <span className="font-mono text-[10px] px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg font-bold text-slate-600 dark:text-slate-350">
                      CORPMEMBER
                    </span>
                  </div>
                </div>

                {/* Filter and Search Action Toolbar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-3xl mb-8 shadow-xs flex flex-col md:flex-row items-center gap-3.5">
                  <div className="relative flex items-center flex-1 w-full">
                    <Search className="absolute left-3.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search courses, instructors, topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 pl-11 pr-4 py-2.5 outline-none rounded-2xl border border-slate-205 dark:border-slate-750 text-xs font-semibold placeholder-slate-400 focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-3.5 py-2 rounded-2xl text-xs font-semibold">
                      <Filter size={13} className="text-slate-400" />
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-slate-600 dark:text-slate-300 pr-2"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-3.5 py-2 rounded-2xl text-xs font-semibold">
                      <Filter size={13} className="text-slate-400" />
                      <select 
                        value={selectedLevel} 
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-slate-600 dark:text-slate-300 pr-2"
                      >
                        <option value="All Levels" className="dark:bg-slate-900">All Levels</option>
                        <option value="Beginner" className="dark:bg-slate-900">Beginner</option>
                        <option value="Intermediate" className="dark:bg-slate-900">Intermediate</option>
                        <option value="Advanced" className="dark:bg-slate-900">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-mono">LOADING EDUCATION SERVICES...</span>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl shadow-2xs">
                    <AlertCircle className="mx-auto w-10 h-10 text-slate-350 mb-3" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">No courses match your active criteria</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try clearing search phrases or modifying filters to browse other Academy tracks.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => {
                      const isEnrolled = enrollments.some(e => e.courseId === course.id);
                      const currentEnrollment = enrollments.find(e => e.courseId === course.id);
                      
                      return (
                        <div 
                          key={course.id} 
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full"
                          id={`course-card-${course.id}`}
                        >
                          <div className="h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-lg">
                                 {course.category}
                              </span>
                            </div>
                            
                            {isEnrolled && (
                              <div className="absolute top-3 right-3">
                                <span className="px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-sm">
                                  <Check size={10} /> Enrolled
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono uppercase font-bold">
                                <span>{course.duration}</span>
                                <span>•</span>
                                <span>{course.level}</span>
                              </div>
                              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm.5 leading-tight tracking-tight mt-2 line-clamp-1">
                                {course.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                {course.description}
                              </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                              <div>
                                <span className="block text-[8px] font-mono tracking-wider font-bold text-slate-400">PRICING TIER</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">₦{course.price.toLocaleString()}</span>
                              </div>

                              <button
                                onClick={() => setSelectedCourse(course)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                              >
                                View syllabus
                              </button>
                            </div>

                            {/* Enrolled course progress metrics */}
                            {isEnrolled && currentEnrollment && (
                              <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                  <span className="text-slate-550 dark:text-slate-400">COURSE PROGRESS</span>
                                  <span className="text-amber-550 dark:text-amber-400 font-mono">{currentEnrollment.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-205 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${currentEnrollment.progress}%` }}></div>
                                </div>
                                
                                {currentEnrollment.progress === 100 && (
                                  <div className="text-[9px] text-[#2ECC71] font-bold uppercase tracking-wider flex items-center gap-1.5 mt-2 font-mono">
                                    <Award size={10} /> Certified Graduate
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Learning Classroom View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Classroom Navigation Index Menu */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm h-fit space-y-4">
              <button
                onClick={() => {
                  setActiveEnrolledCourse(null);
                  setActiveLesson(null);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-820 dark:hover:bg-slate-800 text-slate-700 dark:text-white text-xs font-bold rounded-xl uppercase tracking-wide cursor-pointer text-center flex items-center justify-center gap-1 border border-slate-205 dark:border-slate-780"
              >
                <ArrowLeft size={12} /> Syllabus Dashboard
              </button>

              <div className="pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-[10px] block font-mono text-slate-400 tracking-wider uppercase font-bold">COURSE SYLLABUS INDEX</span>
                <h3 className="font-bold text-xs leading-snug mt-1 text-slate-800 dark:text-white line-clamp-2">
                  {activeEnrolledCourse.title}
                </h3>
              </div>

              {/* Collapsible Syllabus Map */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {activeEnrolledCourse.modules.map((mod, mi) => (
                  <div key={mod.id} className="space-y-1">
                    <span className="block text-[9px] font-mono tracking-widest font-bold text-[#2ECC71] uppercase">{mod.title}</span>
                    <div className="space-y-1">
                      {mod.lessons.map((les) => {
                        const isCompleted = enrollments.find(e => e.courseId === activeEnrolledCourse.id)?.completedLessons.includes(les.id);
                        const isSelected = activeLesson?.id === les.id;
                        
                        return (
                          <button
                            key={les.id}
                            onClick={() => {
                              setActiveLesson(les);
                              setSelectedQuizAnswers({});
                              setQuizScore(null);
                              setAssignmentSubmitted(false);
                              setAssignmentText("");
                            }}
                            className={`w-full text-left p-2 px-3 rounded-xl transition-all font-semibold flex items-center justify-between text-xs cursor-pointer ${
                              isSelected 
                                ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-555" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              )}
                              <span className="truncate pr-1">{les.title}</span>
                            </div>
                            <span className="font-mono text-[9px] text-slate-405 shrink-0">{les.duration}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Active Lesson Player Area */}
            <div className="lg:col-span-3 space-y-6">
              {activeLesson ? (
                (() => {
                  const currentCourseEnrollment = enrollments.find(e => e.courseId === activeEnrolledCourse.id && e.userEmail.toLowerCase() === studentEmail.toLowerCase());
                  const isUnlocked = currentCourseEnrollment && (
                    currentCourseEnrollment.status === "active" || 
                    currentCourseEnrollment.status === "approved" || 
                    currentCourseEnrollment.status === "completed"
                  );
                  const isFreePreview = activeLesson.isFreePreview;

                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                      
                      {/* Media Frame Window */}
                      <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-slate-950 border border-slate-100 dark:border-slate-800 relative shadow-inner">
                        {!isUnlocked && !isFreePreview ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white">
                            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl mb-3">
                              <Lock size={36} />
                            </div>
                            
                            {currentCourseEnrollment?.status === "pending" || currentCourseEnrollment?.status === "payment_submitted" || currentCourseEnrollment?.status === "under_review" ? (
                              <div className="space-y-2 max-w-md">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 uppercase">
                                  PAYMENT UNDER REVIEW
                                </span>
                                <h4 className="font-bold text-sm text-white">Lesson Access Locked — Verification Pending</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  Your bank transfer payment receipt has been received and is awaiting administrator verification. Full lesson content will unlock as soon as payment is approved.
                                </p>
                              </div>
                            ) : currentCourseEnrollment?.status === "rejected" ? (
                              <div className="space-y-2 max-w-md">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 uppercase">
                                  PAYMENT REJECTED
                                </span>
                                <h4 className="font-bold text-sm text-rose-400">Payment Proof Verification Failed</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  {currentCourseEnrollment.rejectionReason || "Your payment receipt could not be verified. Please re-upload your valid bank transfer receipt."}
                                </p>
                                <button
                                  onClick={() => {
                                    setBankCheckoutCourse(activeEnrolledCourse);
                                    setIsBankCheckoutOpen(true);
                                  }}
                                  className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                                >
                                  Re-upload Payment Proof
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 max-w-md">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 uppercase">
                                  ENROLLMENT REQUIRED
                                </span>
                                <h4 className="font-bold text-sm text-white">Full Syllabus Locked</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  Enroll in this course via Bank Transfer to unlock full video lessons, quizzes, assignments, and graduation certificates.
                                </p>
                                <button
                                  onClick={() => {
                                    setBankCheckoutCourse(activeEnrolledCourse);
                                    setIsBankCheckoutOpen(true);
                                  }}
                                  className="mt-3 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                                >
                                  Enroll Now — ₦{activeEnrolledCourse.price.toLocaleString()} NGN
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {activeLesson.type === "video" && (
                              <iframe
                                src={activeLesson.videoUrl}
                                title={activeLesson.title}
                                className="w-full h-full"
                                allowFullScreen
                                referrerPolicy="no-referrer"
                              ></iframe>
                            )}

                            {activeLesson.type === "pdf" && (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
                                <FileText size={48} className="text-amber-550 mb-3" />
                                <h4 className="font-bold text-sm text-white">Interactive Reading Materials Available</h4>
                                <p className="text-xs text-slate-405 mt-1 max-w-sm">This lesson includes a premium accompanying textbook and workbook resource guide.</p>
                                <a
                                  href={activeLesson.pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 px-4 py-2 bg-amber-500/15 border border-amber-500/30 font-bold hover:bg-amber-600 hover:text-slate-950 font-sans transition-colors rounded-xl text-xs text-amber-400"
                                >
                                  Launch Material PDF
                                </a>
                              </div>
                            )}

                            {activeLesson.type === "audio" && (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-200 bg-[#0E3A2F]/10">
                                <Volume2 size={48} className="text-emerald-555 mb-3 animate-pulse" />
                                <h4 className="font-bold text-sm">Audio Broadcast Lesson</h4>
                                <audio
                                  controls
                                  src={activeLesson.audioUrl}
                                  className="mt-6 max-w-md w-full bg-slate-900 rounded-xl"
                                ></audio>
                              </div>
                            )}

                            {activeLesson.type === "assignment" && (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-slate-950">
                                <CheckCircle size={48} className="text-violet-500 mb-3" />
                                <h4 className="font-bold text-sm text-white">Practical Course Assignment Block</h4>
                                <p className="text-xs text-slate-405 mt-1 max-w-sm">Complete this task to test your understanding before continuing.</p>
                              </div>
                            )}

                            {activeLesson.type === "quiz" && (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-slate-950">
                                <HelpCircle size={48} className="text-indigo-500 mb-3" />
                                <h4 className="font-bold text-sm text-white">Module Comprehension Quiz</h4>
                                <p className="text-xs text-slate-405 mt-1 max-w-sm">Score at least 70% to pass and unlock syllabus progress.</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                  {/* Active Lesson Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-850">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest font-bold text-slate-400 uppercase">ACTIVE SYLLABUS ELEMENT</span>
                      <h2 className="text-lg font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
                        {activeLesson.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {enrollments.some(e => e.courseId === activeEnrolledCourse.id) ? (
                        <button
                          onClick={() => handleMarkLessonComplete(activeEnrolledCourse, activeLesson)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                        >
                          Mark lesson complete
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-amber-500/10 text-amber-550 dark:text-amber-400 font-bold text-[10px] font-sans tracking-wide uppercase rounded-xl">Preview Mode</span>
                      )}
                    </div>
                  </div>

                  {/* Lesson Interactive Forms / Materials Controls based on type */}
                  <div className="mt-6 space-y-6">
                    
                    {/* Classroom Custom Tabs Selection */}
                    <div className="flex gap-2.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                      <button
                        onClick={() => setClassroomTab("content")}
                        className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          classroomTab === "content" ? "border-amber-500 text-slate-900 dark:text-white" : "border-transparent text-slate-400"
                        }`}
                      >
                        Lesson Task / Assessment
                      </button>
                      <button
                        onClick={() => setClassroomTab("materials")}
                        className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          classroomTab === "materials" ? "border-amber-500 text-slate-900 dark:text-white" : "border-transparent text-slate-400"
                        }`}
                      >
                        Resources & Downloads
                      </button>
                      <button
                        onClick={() => setClassroomTab("discuss")}
                        className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          classroomTab === "discuss" ? "border-amber-500 text-slate-900 dark:text-white" : "border-transparent text-slate-400"
                        }`}
                      >
                        Q&A Forum
                      </button>
                    </div>

                    {classroomTab === "content" && (
                      <div className="space-y-4">
                        
                        {/* QUiZ Element form */}
                        {activeLesson.type === "quiz" && activeLesson.quizQuestions && (
                          <div className="space-y-6">
                            <div className="p-4.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                              <h4 className="font-bold text-xs text-indigo-500 uppercase tracking-wide">Comprehension Assessment Instruction</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed mt-1">Select the most appropriate answer to each question. Retake the quiz at any time until you master the content.</p>
                            </div>

                            <div className="space-y-6">
                              {activeLesson.quizQuestions.map((q, qi) => (
                                <div key={q.id} className="space-y-2">
                                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                    Question {qi + 1}: {q.question}
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.options.map((opt) => (
                                      <button
                                        key={opt}
                                        onClick={() => {
                                          setSelectedQuizAnswers(prev => ({ ...prev, [q.id]: opt }));
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs rounded-xl border transition-all ${
                                          selectedQuizAnswers[q.id] === opt
                                            ? "border-indigo-500 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400 font-bold"
                                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-850">
                              <button
                                onClick={() => handleQuizSubmit(activeLesson)}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer shadow-sm"
                              >
                                Submit Answers
                              </button>

                              {quizScore !== null && (
                                <div className={`text-xs font-bold uppercase tracking-wider font-mono px-3 py-1.5 rounded-lg border ${
                                  quizScore >= 70 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-555" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                }`}>
                                  Score: {quizScore}% {quizScore >= 70 ? "• PASSED" : "• RE-ATTEMPT NEEDED"}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Assignment Submission Box */}
                        {activeLesson.type === "assignment" && (
                          <div className="space-y-4">
                            <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                              <h4 className="font-bold text-xs text-violet-500 uppercase tracking-wide">PRACTICAL CHALLENGE TASK</h4>
                              <p className="text-xs text-slate-650 dark:text-slate-300 mt-1.5 italic leading-relaxed">
                                "{activeLesson.assignmentText}"
                              </p>
                            </div>

                            <div className="space-y-2">
                              <span className="block text-[10px] font-semibold text-slate-550 uppercase tracking-tight">Your Action Plan Submission</span>
                              <textarea
                                value={assignmentText}
                                onChange={(e) => setAssignmentText(e.target.value)}
                                disabled={assignmentSubmitted}
                                rows={6}
                                placeholder="Write your submission content here in detailed paragraphs..."
                                className="w-full bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-700 outline-none rounded-2xl text-xs font-medium focus:border-violet-500 text-slate-800 dark:text-white"
                              ></textarea>
                            </div>

                            {!assignmentSubmitted ? (
                              <button
                                onClick={handleAssignmentSubmit}
                                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
                              >
                                Submit Assignment
                              </button>
                            ) : (
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-555 font-bold flex items-center gap-1.5 uppercase font-mono">
                                <CheckCircle size={14} /> Submission Accepted. Outstanding Task Completed.
                              </div>
                            )}
                          </div>
                        )}

                        {/* General Lessons Description fallback */}
                        {activeLesson.type !== "quiz" && activeLesson.type !== "assignment" && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-350 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <h4 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-205 mb-1 text-[10px]">Lesson Core Concept Guidance</h4>
                            <p className="leading-relaxed">Listen to the instructions carefully, then toggle completion state once completed. Be sure to reference downloads and other materials.</p>
                          </div>
                        )}

                      </div>
                    )}

                    {classroomTab === "materials" && (
                      <div className="space-y-4">
                        <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Premium Learning Vault Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <a
                            href="https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 hover:border-amber-500/50 transition-all text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="text-rose-500" size={18} />
                              <div className="text-left select-none truncate">
                                <span className="font-bold block text-slate-800 dark:text-slate-100 truncate">Course Syllabus Outline & Checklist</span>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">PDF • 1.2 MB</span>
                              </div>
                            </div>
                            <Download size={14} className="text-slate-400" />
                          </a>

                          <a
                            href="https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 hover:border-amber-500/50 transition-all text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="text-[#103D2E]" size={18} />
                              <div className="text-left select-none truncate">
                                <span className="font-bold block text-slate-800 dark:text-slate-100 truncate">Habit Tracker Worksheet Blueprint</span>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">PDF • 850 KB</span>
                              </div>
                            </div>
                            <Download size={14} className="text-slate-400" />
                          </a>
                        </div>
                      </div>
                    )}

                    {classroomTab === "discuss" && (
                      <div className="space-y-4">
                        <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Student Discussion Board</h4>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                          
                          <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-780 rounded-xl text-xs text-left">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                              <span>Sadiq Abubakar (Cohort 6 Graduate)</span>
                              <span>2 Hours ago</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-normal">Building the resume following the checklist changed my response rate immediately. Highly recommend focusing on the Outbound positioning module!</p>
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-105 dark:border-slate-780 rounded-xl text-xs text-left">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                              <span>Miracle Oyin (Student)</span>
                              <span>1 Day ago</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-normal">Is there a specific template font that complies with standard ATS engines? Thanks!</p>
                          </div>
                        </div>

                        {/* QA Submission Form */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ask a question or post ideas to fellow students..."
                            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 outline-none rounded-xl border border-slate-200 dark:border-slate-700 focus:border-amber-500"
                          />
                          <button
                            onClick={() => triggerNotification("Comment successfully uploaded to discussion board.", "success")}
                            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold leading-none cursor-pointer"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })()
          ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
                  <Play className="mx-auto w-12 h-12 text-slate-350 mb-3 animate-bounce" />
                  <h3 className="font-bold text-slate-800 dark:text-white">Active session initialized</h3>
                  <p className="text-xs text-slate-405 mt-1 max-w-sm mx-auto">Select any video or task from the syllabus directory listing to start learning instantly.</p>
                </div>
              )}

              {/* Graduation Certificate box */}
              {enrollments.some(e => e.courseId === activeEnrolledCourse.id && e.progress === 100) && (
                <div className="bg-gradient-to-r from-amber-500/15 via-white/5 to-amber-500/5 dark:bg-slate-900 border-2 border-dashed border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 bg-amber-500/15 flex items-center justify-center rounded-2xl text-amber-550 shrink-0">
                      <Award size={34} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-slate-900 dark:text-white text-base leading-tight">Graduation Certificate Award Unlocked!</h4>
                      <p className="text-xs text-slate-450 dark:text-slate-400 leading-normal mt-0.5">Congratulations on scoring passing averages and completing all elements inside <strong>{activeEnrolledCourse.title}</strong>.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => {
                        triggerNotification("Launching Certificate PDF view...", "success");
                        // Generate mock verification code popup
                        alert(`RIGHT MINDS AFRICA ACADEMY CERTIFICATE\n\nGraduate Name: ${studentName}\nCourse Title: ${activeEnrolledCourse.title}\nVerification Code: RMA-CERT-88E39A\nStatus: VERIFIED SECURE\n\nCertificate is valid and globally referenceable.`);
                      }}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-all duration-200"
                    >
                      <Download size={13} className="inline mr-1" /> Download PDF
                    </button>
                    <button
                      onClick={() => triggerNotification("Verification web-key copied to clipboard successfully.", "success")}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 text-slate-600 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                      title="Share Certificate Code"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>
              )}

            </div>
            
          </div>
        )}

      </div>

      {/* Verification Required Intercept Modal */}
      <AnimatePresence>
        {showVerificationLockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVerificationLockModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-left z-10"
            >
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-850 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-550 mx-auto mb-3">
                  <ShieldAlert size={22} className="animate-bounce" />
                </div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base">Verification Required</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  To secure certification records and safeguard program slots, Right Minds Africa requires all student profiles to verify their email addresses before enrolling or accessing syllabus classrooms.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 text-[11px] text-slate-550 dark:text-slate-400">
                  <p><strong>Account:</strong> {studentEmail}</p>
                  <p className="mt-1"><strong>Status:</strong> <span className="text-amber-600 font-bold uppercase font-mono">Unverified pending confirmation</span></p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleResendStudentVerification}
                    disabled={resendCooldown > 0}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <Send size={12} />
                    {resendCooldown > 0 ? `Resend Verification Email (${resendCooldown}s)` : "Resend Verification Email Link"}
                  </button>

                  <button
                    onClick={handleCheckAndReloadVerificationStatus}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={12} />
                    Check Verification Status
                  </button>

                  <button
                    onClick={() => setShowVerificationLockModal(false)}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 text-2xs font-extrabold uppercase tracking-widest text-center cursor-pointer block mt-1"
                  >
                    Close & Keep Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgraded Enterprise Identity Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAuthModalOpen(false);
                setAuthErrorMessage("");
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-left z-10"
            >
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setAuthErrorMessage("");
                }}
                className="absolute top-5 right-5 p-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 hover:text-rose-500 text-slate-400 rounded-lg cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>

              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-850 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mx-auto mb-2">
                  <Lock size={18} />
                </div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                  {authMode === "login" ? "Sign In to Academy" : authMode === "signup" ? "Create Learn Profile" : "Reset Security Password"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {authMode === "login" ? "Access your courses, certificates, and learning syllabus." : 
                   authMode === "signup" ? "Set up your verified student account to begin study." : 
                   "Provide your email to receive recovery instructions."}
                </p>
              </div>

              {authErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-xl mb-4 text-center">
                  {authErrorMessage}
                </div>
              )}

              <form onSubmit={handleStudentSessionLogin} className="space-y-4">
                
                {authMode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victor Chigozie"
                      value={authNameInput}
                      onChange={(e) => setAuthNameInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 px-3.5 py-2 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:border-amber-500 text-slate-800 dark:text-white"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={authEmailInput}
                    onChange={(e) => setAuthEmailInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 px-3.5 py-2 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:border-amber-500 text-slate-800 dark:text-white"
                  />
                </div>

                {authMode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="+234..."
                        value={authPhoneInput}
                        onChange={(e) => setAuthPhoneInput(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 px-3.5 py-2 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:border-amber-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">State Location</label>
                      <input
                        type="text"
                        required
                        placeholder="Abuja, Lagos, etc"
                        value={authLocationInput}
                        onChange={(e) => setAuthLocationInput(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 px-3.5 py-2 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:border-amber-500 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {authMode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Security Password</label>
                      {authMode === "login" && (
                        <button
                          type="button"
                          onClick={() => setAuthMode("forgot")}
                          className="text-[10px] text-amber-550 dark:text-amber-400 hover:underline cursor-pointer font-bold"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPasswordInput}
                      onChange={(e) => setAuthPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 px-3.5 py-2 outline-none rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:border-amber-500 text-slate-800 dark:text-white"
                    />
                  </div>
                )}

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {authMode === "login" ? "Sign In" : authMode === "signup" ? "Register Account" : "Send Reset Link"}
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase">
                      Or
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleStudentGoogleLogin}
                    className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-850 text-2xs text-slate-400">
                  {authMode === "login" ? (
                    <p>
                      First time here?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signup");
                          setAuthErrorMessage("");
                        }}
                        className="text-amber-550 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                      >
                        Create an account
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setAuthErrorMessage("");
                        }}
                        className="text-amber-550 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                      >
                        Sign In instead
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bank Transfer Enrollment Checkout Modal */}
      <LmsBankCheckoutModal
        isOpen={isBankCheckoutOpen}
        onClose={() => setIsBankCheckoutOpen(false)}
        course={bankCheckoutCourse}
        studentEmail={studentEmail}
        studentName={studentName}
        onSuccess={(enrollment) => {
          setEnrollments(prev => [...prev.filter(e => e.id !== enrollment.id), enrollment]);
          triggerNotification("Bank payment proof uploaded! Enrollment status is now Pending Verification.", "success");
        }}
        onNotify={(msg, type) => triggerNotification(msg, type)}
      />

    </div>
  );
}
