import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  CreditCard, 
  Copy, 
  Check, 
  Upload, 
  FileText, 
  ShieldAlert, 
  X, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { 
  getPaymentHubSettings, 
  saveCoursePayment, 
  saveCourseEnrollment, 
  saveLmsAuditLog,
  PaymentHubSettings, 
  LMSCourse, 
  LMSCourseEnrollment, 
  LMSCoursePayment 
} from "../lib/db";

interface LmsBankCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: LMSCourse | null;
  studentEmail: string;
  studentName?: string;
  onSuccess: (enrollment: LMSCourseEnrollment, payment: LMSCoursePayment) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function LmsBankCheckoutModal({
  isOpen,
  onClose,
  course,
  studentEmail,
  studentName,
  onSuccess,
  onNotify
}: LmsBankCheckoutModalProps) {
  const [settings, setSettings] = useState<PaymentHubSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Checkout Steps: "bank_info" -> "upload_proof" -> "success"
  const [step, setStep] = useState<"bank_info" | "upload_proof" | "success">("bank_info");

  // Inputs
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [copied, setCopied] = useState(false);

  const [phone, setPhone] = useState("");
  const [bankPaidFrom, setBankPaidFrom] = useState("");
  const [accountNamePaidFrom, setAccountNamePaidFrom] = useState("");
  const [refCode, setRefCode] = useState("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setStep("bank_info");
      setPromoCode("");
      setDiscountAmount(0);
      setAppliedPromo("");
      setPhone("");
      setBankPaidFrom("");
      setAccountNamePaidFrom("");
      setReceiptFile(null);
      setReceiptDataUrl("");
      setReceiptFileName("");
      setUploadError("");
      const generatedRef = `RMA-REF-${Math.floor(100000 + Math.random() * 900000)}`;
      setRefCode(generatedRef);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const s = await getPaymentHubSettings();
      setSettings(s);
    } catch {
      onNotify("Using default bank transfer settings", "info");
    } finally {
      setLoadingSettings(false);
    }
  };

  if (!isOpen || !course) return null;

  const originalPrice = course.price;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyPromo = () => {
    const up = promoCode.trim().toUpperCase();
    if (up === "RMA10" || up === "TEENS2026") {
      const disc = up === "RMA10" ? Math.round(originalPrice * 0.1) : Math.round(originalPrice * 0.2);
      setDiscountAmount(disc);
      setAppliedPromo(up);
      onNotify(`Discount applied! Saved ₦${disc.toLocaleString()}`, "success");
    } else {
      onNotify("Invalid coupon code.", "error");
    }
  };

  const handleCopyAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopied(true);
    onNotify("Bank account number copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileSelect = (file: File) => {
    setUploadError("");
    const maxMB = settings?.maxUploadSizeMB || 8;
    if (file.size > maxMB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum allowed size is ${maxMB} MB.`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a JPEG, PNG image or PDF document.");
      return;
    }

    setReceiptFile(file);
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptDataUrl && !receiptFile) {
      setUploadError("Please upload your bank transfer payment proof / receipt.");
      return;
    }

    setSubmitting(true);
    setUploadError("");

    try {
      const paymentId = `pay-${Date.now()}`;
      const enrollmentId = `enroll-${Date.now()}`;
      const now = new Date().toISOString();

      const newPayment: LMSCoursePayment = {
        id: paymentId,
        userEmail: studentEmail,
        courseId: course.id,
        amount: finalPrice,
        paymentReference: refCode,
        paymentMethod: "bank_transfer",
        paymentStatus: "payment_submitted",
        receiptUrl: receiptDataUrl,
        bankPaidFrom: bankPaidFrom || "N/A",
        accountNamePaidFrom: accountNamePaidFrom || "N/A",
        timestamp: now
      };

      const newEnrollment: LMSCourseEnrollment = {
        id: enrollmentId,
        userEmail: studentEmail,
        userName: studentName || studentEmail.split("@")[0],
        userPhone: phone,
        courseId: course.id,
        enrolledAt: now,
        progress: 0,
        completedLessons: [],
        status: "pending"
      };

      await saveCoursePayment(newPayment);
      await saveCourseEnrollment(newEnrollment);

      await saveLmsAuditLog({
        id: `log-${Date.now()}`,
        action: "Payment Submitted",
        administrator: "Student Self-Service",
        student: studentName || studentEmail,
        studentEmail: studentEmail,
        course: course.title,
        courseId: course.id,
        referenceNumber: refCode,
        details: `Submitted bank transfer proof (Ref: ${refCode}) for ₦${finalPrice.toLocaleString()}`,
        timestamp: now
      }).catch(() => null);

      onSuccess(newEnrollment, newPayment);
      setStep("success");
    } catch (err: any) {
      setUploadError(err?.message || "Failed to submit bank transfer receipt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-left z-10 my-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
              Official Payment Gateway
            </span>
            <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mt-1">
              Course Enrollment Checkout
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {course.title}
            </p>
          </div>

          {/* Step 1: Bank Info */}
          {step === "bank_info" && (
            <div className="space-y-6">
              
              {/* Pricing summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Standard Tuition Fee:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₦{originalPrice.toLocaleString()}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Coupon ({appliedPromo}):</span>
                    <span className="font-mono">-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700 font-black">
                  <span className="text-slate-900 dark:text-white uppercase tracking-tight">Total Payable:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 text-lg">₦{finalPrice.toLocaleString()} NGN</span>
                </div>

                {/* Promo Code Input */}
                {!appliedPromo && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Promo Coupon Code"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Official Bank Account Card */}
              {loadingSettings ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Loading official bank details...
                </div>
              ) : (
                <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={13} /> BANK TRANSFER DETAILS
                    </span>
                    <span className="text-3xs font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      ONLY PAYMENT METHOD
                    </span>
                  </div>

                  <div className="space-y-2 font-mono">
                    <div>
                      <span className="text-3xs text-slate-500 dark:text-slate-400 uppercase block font-sans">Bank Name</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {settings?.bankName || "Zenith Bank PLC"}
                      </span>
                    </div>

                    <div>
                      <span className="text-3xs text-slate-500 dark:text-slate-400 uppercase block font-sans">Account Name</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {settings?.accountName || "RightMinds Africa Development Trust"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-500/30">
                      <div>
                        <span className="text-3xs text-slate-400 uppercase block font-sans">Account Number</span>
                        <span className="text-lg font-black tracking-widest text-amber-600 dark:text-amber-400">
                          {settings?.accountNumber || "1015694821"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(settings?.accountNumber || "1015694821")}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-2xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {settings?.backupAccountNumber && (
                      <div className="pt-2 border-t border-amber-500/20 text-xs">
                        <span className="text-3xs text-slate-500 block font-sans">Secondary Account:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {settings.backupBankName} — {settings.backupAccountNumber} ({settings.backupAccountName})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Instructions */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-amber-500/5 p-3 rounded-xl">
                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Transfer Instructions:</p>
                    <p>{settings?.instructions || "Transfer the exact tuition fee using your mobile banking app or ATM. Keep your receipt/teller for upload."}</p>
                  </div>

                  {/* Security Disclaimer */}
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-3xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-500" />
                    <span>
                      {settings?.disclaimer || "WARNING: Never pay into personal account numbers. Right Minds Africa will never ask for payment through personal phone numbers or direct cash."}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setStep("upload_proof")}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                I Have Made Payment — Proceed to Upload Receipt
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 2: Upload Proof */}
          {step === "upload_proof" && (
            <form onSubmit={handleSubmitProof} className="space-y-4">
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-3xs text-slate-400 block font-sans">Reference Code</span>
                  <span className="font-black text-blue-700 dark:text-blue-300">{refCode}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-sans">Payable</span>
                  <span className="font-black text-slate-900 dark:text-white">₦{finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-2xs font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                    Student Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-2xs font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                      Bank Paid From (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GTBank, Kuda"
                      value={bankPaidFrom}
                      onChange={e => setBankPaidFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                      Account Name Paid From
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={accountNamePaidFrom}
                      onChange={e => setAccountNamePaidFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-slate-600 dark:text-slate-300 uppercase block">
                  Upload Payment Receipt / Proof *
                </label>
                
                <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? "border-amber-500 bg-amber-500/10"
                      : receiptFile
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100"
                  }`}
                  onClick={() => document.getElementById("lms-receipt-file-input")?.click()}
                >
                  <input
                    id="lms-receipt-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />

                  {receiptFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText size={28} className="text-emerald-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {receiptFileName}
                        </p>
                        <p className="text-3xs text-emerald-600 dark:text-emerald-400 font-mono">
                          {(receiptFile.size / 1024 / 1024).toFixed(2)} MB • Selected
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={28} className="mx-auto text-slate-400" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Drag & Drop receipt or <span className="text-amber-600 dark:text-amber-400 underline">Browse File</span>
                      </p>
                      <p className="text-3xs text-slate-400">
                        JPEG, PNG images or PDF documents up to {settings?.maxUploadSizeMB || 8} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("bank_info")}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Submitting Receipt...
                    </>
                  ) : (
                    <>
                      Submit Bank Transfer Proof
                      <CheckCircle2 size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Confirmation */}
          {step === "success" && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <Clock size={32} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full text-xs font-mono font-bold uppercase">
                  STATUS: PENDING ADMIN VERIFICATION
                </span>
                <h4 className="text-xl font-display font-black text-slate-900 dark:text-white">
                  Payment Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your bank transfer proof (Ref: <strong className="font-mono text-slate-800 dark:text-slate-200">{refCode}</strong>) has been uploaded. An administrator will verify your payment and activate your enrollment.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Important Note:</p>
                <p className="leading-relaxed">
                  Course lessons, videos, and materials will remain locked until your bank payment status is marked <strong>"APPROVED"</strong> by admin. You will receive access as soon as verification completes.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                Close & Return to Courses
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
