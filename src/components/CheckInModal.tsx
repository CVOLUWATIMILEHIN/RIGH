/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, MapPin, User, Bookmark, HeartHandshake } from "lucide-react";
import { saveVisitorCheckIn } from "../lib/db";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInCompleted?: (name: string, location: string) => void;
}

export default function CheckInModal({ isOpen, onClose, onCheckInCompleted }: CheckInModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("Just Browsing Programs");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      
      const width = window.innerWidth;
      const deviceType = width < 768 ? "Mobile Device" : "Desktop Computer";
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const brand = isIOS ? "Safari (iOS)" : isAndroid ? "Chrome (Android)" : "Web Browser";

      await saveVisitorCheckIn({
        name: name.trim(),
        location: location.trim() || "Remote Guest",
        deviceType: `${deviceType} - ${brand}`,
        purpose: purpose
      });

      setIsSuccess(true);
      if (onCheckInCompleted) {
        onCheckInCompleted(name, location);
      }

      // Hide after a brief moment
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setLocation("");
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0E3A2F]/30 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-[#0E3A2F] text-white p-5 flex justify-between items-center relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#E76F51]" />
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider">Visitor Check-In</h3>
                <p className="text-[9px] text-gray-300 font-mono tracking-widest uppercase">Sign the site Guestbook</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <Check size={24} className="animate-bounce" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Checked In Successfully!</h4>
                  <p className="text-[11px] text-slate-400">
                    Welcome, <strong className="text-slate-600">{name}</strong>. Your visit has been registered in the Administrator active session checks log.
                  </p>
                </motion.div>
              ) : (
                <motion.form key="form-state" onSubmit={handleCheckIn} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-normal">
                    Let us know you are on the site! Administrators can view live guestbooks, locations, and visit purposes.
                  </p>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Your Name:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Olosunde Louis"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#0E3A2F] rounded-xl text-xs outline-none focus:bg-slate-50/55 transition-all text-slate-800 placeholder-slate-400 font-medium"
                      />
                      <User size={12} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Your Location:</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Osun, Nigeria or Kano"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-[#0E3A2F] rounded-xl text-xs outline-none focus:bg-slate-50/55 transition-all text-slate-800 placeholder-slate-400 font-medium"
                      />
                      <MapPin size={12} className="absolute left-3 top-3 text-[#E76F51]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Purpose of visit:</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-[#0E3A2F] rounded-xl text-xs outline-none bg-white font-medium text-slate-700 transition-all cursor-pointer"
                    >
                      <option value="Just Browsing Programs">Just Browsing Programs</option>
                      <option value="Reserve YAP Conference Pass">Reserve YAP Conference Pass</option>
                      <option value="Applying for CII Fellowship">Applying for CII Fellowship</option>
                      <option value="Seeking HR Mentorship Support">Seeking HR Mentorship Support</option>
                      <option value="Mindset Training Inquiry">Mindset Training Inquiry</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0E3A2F] hover:bg-[#121A15] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-[#0E3A2F]/10 hover:scale-[1.01] transition-all"
                  >
                    <HeartHandshake size={14} /> {isLoading ? "Checking in..." : "Check In Now"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
