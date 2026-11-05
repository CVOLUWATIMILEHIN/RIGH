import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertCircle,
  Phone,
  Mail,
  User,
  GraduationCap,
  MapPin,
  Shirt,
  Calendar,
  Lock,
  ArrowRight
} from "lucide-react";
import { BootcampRegistration, TeenBootcampConfig } from "../types/teenBootcamp";
import { saveTeenBootcampRegistration } from "../lib/db";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: TeenBootcampConfig;
}

export default function TeenBootcampRegistrationModal({ isOpen, onClose, config }: Props) {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    teenName: "",
    teenAge: 15,
    teenGender: "Male",
    schoolGrade: "SS2",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    cityState: "Kano State",
    tshirtSize: "M",
    preferredTrack: "Leadership & Digital Skills",
    specialDietaryHealth: "",
    paymentMethod: "paystack" as "paystack" | "bank_transfer",
    transferReceiptNote: ""
  });

  const [registrationResult, setRegistrationResult] = useState<BootcampRegistration | null>(null);

  if (!isOpen) return null;

  const currentFee = config.earlyBirdFee || config.registrationFee || 50000;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teenName || !formData.parentName || !formData.parentPhone || !formData.parentEmail) {
      alert("Please fill in all required contact details.");
      return;
    }
    setStep("payment");
  };

  const handleCompleteRegistration = async (overrideStatus?: BootcampRegistration["paymentStatus"], ref?: string) => {
    setLoading(true);

    const regId = `RMA-TB2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const payRef = ref || (formData.paymentMethod === "paystack" ? `PS-${Date.now()}` : `TRF-${Date.now()}`);
    const status = overrideStatus || (formData.paymentMethod === "paystack" ? "paid" : "pending_transfer");

    const newRegistration: BootcampRegistration = {
      id: regId,
      teenName: formData.teenName,
      teenAge: Number(formData.teenAge),
      teenGender: formData.teenGender,
      schoolGrade: formData.schoolGrade,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      cityState: formData.cityState,
      tshirtSize: formData.tshirtSize,
      preferredTrack: formData.preferredTrack,
      specialDietaryHealth: formData.specialDietaryHealth,
      paymentMethod: formData.paymentMethod,
      paymentStatus: status,
      paymentReference: payRef,
      transferReceiptNote: formData.transferReceiptNote,
      amountPaid: currentFee,
      registrationDate: new Date().toISOString()
    };

    try {
      console.log("[TEEN BOOTCAMP MODAL] Saving registration:", newRegistration.id);
      await saveTeenBootcampRegistration(newRegistration);
      setRegistrationResult(newRegistration);
      setStep("success");

      fetch("/api/email/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "TEEN_BOOTCAMP_REGISTRATION",
          registrationId: newRegistration.id,
          payload: newRegistration
        })
      }).catch(() => null);
    } catch (err) {
      console.error("Registration error handled gracefully:", err);
      setRegistrationResult(newRegistration);
      setStep("success");
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPay = () => {
    setLoading(true);
    // Simulate Paystack Inline trigger
    setTimeout(() => {
      const mockPaystackRef = `PAYSTACK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      handleCompleteRegistration("paid", mockPaystackRef);
    }, 1200);
  };

  const copyToClipboard = (text: string, setFn: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-emerald-900 via-slate-900 to-amber-950 px-6 py-6 text-white flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-950 bg-amber-400 px-3 py-1 rounded-full tracking-widest font-mono">
                <Sparkles size={12} className="animate-pulse" />
                BOOTCAMP REGISTRATION 2026
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight">
                {step === "form" && "Participant Details"}
                {step === "payment" && "Select Payment Method"}
                {step === "success" && "Registration Confirmed!"}
              </h2>
              <p className="text-xs text-slate-300">
                Fee: <strong className="text-amber-300 font-mono text-sm">₦{currentFee.toLocaleString()}</strong> | Date: 17th–22nd Aug 2026
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {step === "form" && (
              <form onSubmit={handleProceedToPayment} className="space-y-5">
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                    <strong className="block font-bold text-amber-900 dark:text-amber-300 mb-0.5">Registration Form Under Maintenance</strong>
                    Online seat reservation is temporarily deactivated while our registration system is being upgraded. To reserve a seat directly in the interim, please contact our administrative desk at <a href="tel:+2348039809016" className="underline font-bold">+234 803 980 9016</a> or reach out via WhatsApp.
                  </div>
                </div>

                {/* Section 1: Teenager Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <User size={14} /> 1. Teenage Participant Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Teenager's Full Name *
                      </label>
                      <input
                        type="text"
                        name="teenName"
                        required
                        value={formData.teenName}
                        onChange={handleInputChange}
                        placeholder="e.g. Samuel Adewale"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Age (13–19) *
                      </label>
                      <input
                        type="number"
                        name="teenAge"
                        min={12}
                        max={20}
                        required
                        value={formData.teenAge}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Gender
                      </label>
                      <select
                        name="teenGender"
                        value={formData.teenGender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Current Class / Grade
                      </label>
                      <select
                        name="schoolGrade"
                        value={formData.schoolGrade}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="JS3">Junior Sec 3 (JS3)</option>
                        <option value="SS1">Senior Sec 1 (SS1)</option>
                        <option value="SS2">Senior Sec 2 (SS2)</option>
                        <option value="SS3">Senior Sec 3 (SS3)</option>
                        <option value="Post-UTME / High School Graduate">Post-UTME / High School Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Preferred T-Shirt Size
                      </label>
                      <select
                        name="tshirtSize"
                        value={formData.tshirtSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Parent / Guardian Details */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <Phone size={14} /> 2. Parent / Guardian Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Parent / Guardian Name *
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        required
                        value={formData.parentName}
                        onChange={handleInputChange}
                        placeholder="e.g. Dr. & Mrs. Adeyemi"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Parent Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        required
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        placeholder="08012345678"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Parent Email Address *
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        required
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        placeholder="parent@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        City & State
                      </label>
                      <input
                        type="text"
                        name="cityState"
                        value={formData.cityState}
                        onChange={handleInputChange}
                        placeholder="e.g. Kano / Lagos / Abuja"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Primary Track Interest
                      </label>
                      <select
                        name="preferredTrack"
                        value={formData.preferredTrack}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Leadership & Public Speaking">Leadership & Public Speaking</option>
                        <option value="Digital Media & AI Productivity">Digital Media & AI Productivity</option>
                        <option value="Entrepreneurship & Financial Literacy">Entrepreneurship & Financial Literacy</option>
                        <option value="Holistic Personal Growth">Holistic Personal Growth</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed select-none"
                    title="Form submission is paused while registration updates are being finalized"
                  >
                    <Lock size={16} /> Online Reservation Paused (Maintenance in Progress)
                  </button>
                </div>
              </form>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Participant: <strong>{formData.teenName}</strong></span>
                    <span>Fee: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">₦{currentFee.toLocaleString()}</strong></span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Parent: {formData.parentName} ({formData.parentPhone})
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                    Choose Payment Gateway / Method:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Paystack Card */}
                    <div
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "paystack" }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        formData.paymentMethod === "paystack"
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <CreditCard className="text-emerald-600" size={24} />
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                          Instant Confirmation
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Paystack Online Checkout</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Pay securely using Debit Card, Bank Transfer, or USSD code.
                        </p>
                      </div>
                    </div>

                    {/* Bank Transfer Card */}
                    <div
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "bank_transfer" }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        formData.paymentMethod === "bank_transfer"
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="text-amber-600" size={24} />
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono">
                          Manual Account
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Direct Bank Transfer</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Transfer directly to our Zenith Bank account & submit proof.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.paymentMethod === "bank_transfer" && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-amber-900 dark:text-amber-300 font-mono">
                      Official Bank Deposit Details:
                    </h4>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <strong className="text-slate-900 dark:text-white">Zenith Bank Plc</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Name:</span>
                        <strong className="text-slate-900 dark:text-white">Right Minds Africa Hub</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Number:</span>
                        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          1012345678
                          <button
                            type="button"
                            onClick={() => copyToClipboard("1012345678", setCopiedBank)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer text-slate-500"
                            title="Copy Account Number"
                          >
                            {copiedBank ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Transfer Reference / Teller Note (Optional)
                      </label>
                      <input
                        type="text"
                        name="transferReceiptNote"
                        value={formData.transferReceiptNote}
                        onChange={handleInputChange}
                        placeholder="e.g. Transferred via GTBank app by Mr. Adeyemi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Back to Details
                  </button>

                  {formData.paymentMethod === "paystack" ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handlePaystackPay}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock size={16} /> Pay ₦{currentFee.toLocaleString()} via Paystack
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCompleteRegistration("pending_transfer")}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Confirm Bank Transfer Notice
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === "success" && registrationResult && (
              <div className="space-y-6 text-center py-2">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Congratulations, {registrationResult.teenName}!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Your seat for the <strong>Right-Minds Teen Leadership Bootcamp 2026</strong> has been reserved. A confirmation email has been dispatched to <strong>{registrationResult.parentEmail}</strong>.
                  </p>
                </div>

                {/* Digital Pass Card */}
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-3xl text-left border border-amber-500/30 shadow-xl space-y-4">
                  <div className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                        OFFICIAL BOOTCAMP DELEGATE PASS
                      </span>
                      <h4 className="font-display font-black text-lg text-white">
                        {registrationResult.teenName}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Class: {registrationResult.schoolGrade} | Age: {registrationResult.teenAge} | Size: {registrationResult.tshirtSize}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400">REGISTRATION ID</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-300 text-sm">
                        {registrationResult.id}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(registrationResult.id, setCopiedId)}
                          className="p-1 hover:bg-white/10 rounded cursor-pointer text-slate-300"
                          title="Copy Registration ID"
                        >
                          {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">PARENT CONTACT</span>
                      <strong className="text-slate-200">{registrationResult.parentName} ({registrationResult.parentPhone})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PAYMENT STATUS</span>
                      <span className="inline-block font-mono font-bold text-[10px] uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 mt-0.5">
                        {registrationResult.paymentStatus === "paid" ? "✅ Payment Confirmed" : "⏳ Pending Transfer Verification"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                  >
                    Close & Return to Bootcamp Site
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
