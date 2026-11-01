/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  ExternalLink, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Lock
} from "lucide-react";
import { getFirebaseAuth, getFirestoreDb, saveAuditLog } from "../lib/db";

interface VerifyEmailPageProps {
  onNavigate: (view: string) => void;
  userEmail?: string;
}

export default function VerifyEmailPage({ onNavigate, userEmail }: VerifyEmailPageProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Load current unverified user email
  useEffect(() => {
    const loadUser = async () => {
      try {
        const auth = await getFirebaseAuth();
        if (auth.currentUser) {
          setEmail(auth.currentUser.email || "");
          
          // Get full name from Firestore
          const { doc, getDoc } = await import("firebase/firestore");
          const db = await getFirestoreDb();
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setFullName(userDoc.data().fullName || "");
          }
        } else if (userEmail) {
          setEmail(userEmail);
        } else {
          // If no user is logged in, redirect to home/login
          onNavigate("home");
        }
      } catch (err) {
        console.error("Error loading user on verification page:", err);
      }
    };
    loadUser();
  }, [userEmail]);

  // Auto-reload user to check email verification status every 3 seconds
  useEffect(() => {
    let intervalId: any = null;
    
    if (email && !isVerified) {
      intervalId = setInterval(async () => {
        try {
          const auth = await getFirebaseAuth();
          if (auth.currentUser) {
            await auth.currentUser.reload();
            const freshUser = auth.currentUser;
            
            if (freshUser.emailVerified) {
              setIsVerified(true);
              clearInterval(intervalId);
              
              // Sync Firestore
              const { doc, updateDoc } = await import("firebase/firestore");
              const db = await getFirestoreDb();
              await updateDoc(doc(db, "users", freshUser.uid), {
                emailVerified: true,
                verificationDate: new Date().toISOString()
              });

              // Create Audit Log
              await saveAuditLog({
                adminEmail: freshUser.email || "student",
                action: "EMAIL_VERIFIED",
                details: `Email verified successfully for ${freshUser.email}.`
              });

              // Trigger welcome notification
              try {
                const notifId = `notif-${Date.now()}`;
                const { setDoc } = await import("firebase/firestore");
                await setDoc(doc(db, "notifications", notifId), {
                  id: notifId,
                  type: "registration",
                  title: "Email Verified",
                  message: `${fullName || freshUser.email} has completed email verification.`,
                  timestamp: new Date().toISOString(),
                  isRead: false
                });
              } catch (notifErr) {
                console.warn("Could not dispatch verified notification:", notifErr);
              }

              // Send welcome email via backend
              try {
                await fetch("/api/email/trigger", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "EMAIL_VERIFICATION_SUCCESS",
                    payload: {
                      fullName: fullName || freshUser.email?.split("@")[0] || "Scholar",
                      email: freshUser.email
                    }
                  })
                });
              } catch (e) {
                console.warn("Could not trigger welcome email:", e);
              }

              setMessage({ text: "Email Successfully Verified! Redirecting to dashboard...", type: "success" });
              
              // Redirect to my-learning dashboard after 2.5 seconds
              setTimeout(() => {
                onNavigate("my-learning");
              }, 2500);
            }
          }
        } catch (err) {
          console.warn("Auto-check verification status error:", err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [email, isVerified, fullName]);

  // Handle Manual Refresh Status
  const handleRefreshStatus = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      const auth = await getFirebaseAuth();
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const freshUser = auth.currentUser;
        
        if (freshUser.emailVerified) {
          setIsVerified(true);
          
          // Sync Firestore
          const { doc, updateDoc } = await import("firebase/firestore");
          const db = await getFirestoreDb();
          await updateDoc(doc(db, "users", freshUser.uid), {
            emailVerified: true,
            verificationDate: new Date().toISOString()
          });

          await saveAuditLog({
            adminEmail: freshUser.email || "student",
            action: "EMAIL_VERIFIED",
            details: `Email verified successfully on manual refresh for ${freshUser.email}.`
          });

          setMessage({ text: "Email Successfully Verified! Redirecting to dashboard...", type: "success" });
          setTimeout(() => {
            onNavigate("my-learning");
          }, 2000);
        } else {
          setMessage({ text: "Email status is still unverified. Please check your inbox and click the verification link.", type: "info" });
        }
      } else {
        setMessage({ text: "No active user session detected. Please log in.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to check verification status.", type: "error" });
    }
    setIsChecking(false);
  };

  // Handle Resend Verification Link
  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage(null);
    try {
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No active user session found. Please log in again.");
      }

      // Check spam prevention and limits in Firestore
      const { doc, getDoc, updateDoc } = await import("firebase/firestore");
      const db = await getFirestoreDb();
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      
      let attempts = 0;
      let lastSent = "";
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        attempts = data.verificationAttempts || 0;
        lastSent = data.verificationSentAt || "";
      }

      const now = new Date();
      
      // Check if 15 minutes have passed since last batch
      const fifteenMins = 15 * 60 * 1000;
      const isWithinCoolDown = lastSent && (now.getTime() - new Date(lastSent).getTime() < fifteenMins);
      
      if (attempts >= 3 && isWithinCoolDown) {
        const timeRemaining = Math.ceil((fifteenMins - (now.getTime() - new Date(lastSent).getTime())) / (60 * 1000));
        throw new Error(`Spam control: Maximum 3 attempts within 15 minutes. Please retry in ${timeRemaining} minutes.`);
      }

      // Reset count if cooldown has elapsed
      const updatedAttempts = isWithinCoolDown ? attempts + 1 : 1;

      // Send Firebase email verification
      const { sendEmailVerification } = await import("firebase/auth");
      
      // Let's configure custom redirect link to verify-email
      const actionCodeSettings = {
        url: window.location.origin + "/?view=verify-email-success",
        handleCodeInApp: true,
      };

      await sendEmailVerification(user, actionCodeSettings);

      // Save custom log to Firestore
      await updateDoc(userDocRef, {
        verificationAttempts: updatedAttempts,
        verificationSentAt: now.toISOString(),
        lastVerificationEmail: now.toISOString()
      });

      // Send branded backup email via backend /api/email/trigger
      const link = window.location.origin + "/?view=verify-email&email=" + encodeURIComponent(user.email || "") + "&uid=" + user.uid;
      
      try {
        await fetch("/api/email/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "EMAIL_VERIFICATION",
            payload: {
              fullName: fullName || user.email?.split("@")[0] || "Scholar",
              email: user.email,
              verificationLink: link
            }
          })
        });
      } catch (triggerErr) {
        console.warn("Failed to trigger custom branded backup verification email:", triggerErr);
      }

      setMessage({ 
        text: `Verification link successfully resent to ${user.email}. (Attempt ${updatedAttempts}/3)`, 
        type: "success" 
      });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to resend verification email.", type: "error" });
    }
    setIsResending(false);
  };

  const handleLogout = async () => {
    try {
      const auth = await getFirebaseAuth();
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      localStorage.removeItem("rma_current_logged_in_user");
      window.dispatchEvent(new Event("rma_admin_session_changed"));
      onNavigate("home");
    } catch (err) {
      onNavigate("home");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8" id="verify-email-container">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-center">
        
        {/* Verification Illustration Container */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-amber-500/10 dark:bg-amber-500/5 text-amber-550 border border-amber-500/20 shadow-xs">
          {isVerified ? (
            <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
          ) : (
            <Mail className="w-12 h-12 text-amber-550 animate-pulse" />
          )}
          
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900">
            <Lock size={12} />
          </div>
        </div>

        <h2 className="font-display font-black text-slate-900 dark:text-white text-xl md:text-2xl tracking-tight leading-none mb-3">
          {isVerified ? "Email Verified Successfully" : "Verify Your Email Address"}
        </h2>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
          We've sent a professional verification link to your secure address{" "}
          <strong className="text-slate-800 dark:text-white">{email || "your registered inbox"}</strong>. 
          Please check your inbox and click the verification link before continuing.
        </p>

        {/* Feedback Messages */}
        {message && (
          <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed mb-6 border text-left flex gap-2 ${
            message.type === "success" 
              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-150 dark:border-emerald-900/30" 
              : message.type === "error"
              ? "bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-150 dark:border-red-900/30"
              : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-150 dark:border-blue-900/30"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Email Clients Quick Open Buttons */}
        <div className="space-y-2 mb-6" id="email-quick-links">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left mb-1.5">Open Email Client:</p>
          <div className="grid grid-cols-3 gap-2">
            <a 
              href="https://mail.google.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[11px] font-extrabold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Gmail</span>
              <ExternalLink size={10} className="opacity-60" />
            </a>
            <a 
              href="https://outlook.live.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[11px] font-extrabold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Outlook</span>
              <ExternalLink size={10} className="opacity-60" />
            </a>
            <a 
              href="https://mail.yahoo.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[11px] font-extrabold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Yahoo</span>
              <ExternalLink size={10} className="opacity-60" />
            </a>
          </div>
        </div>

        {/* Actions Button Stack */}
        <div className="space-y-2 mb-6">
          <button
            onClick={handleRefreshStatus}
            disabled={isChecking || isVerified}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {isChecking ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            <span>Refresh Status</span>
          </button>

          <button
            onClick={handleResendEmail}
            disabled={isResending || isVerified}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isResending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Mail size={13} />
            )}
            <span>Resend Verification Link</span>
          </button>
        </div>

        {/* Navigation Footer */}
        <div className="pt-4 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors flex items-center gap-1 bg-transparent cursor-pointer"
          >
            <ArrowLeft size={10} />
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 hover:underline transition-colors bg-transparent cursor-pointer"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}
