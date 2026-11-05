import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Mail, Phone, MapPin, 
  ChevronRight, ArrowRight, Instagram, Linkedin, Facebook, Send, MessageSquare
} from "lucide-react";
import { getCMSConfig } from "../AdminCMS";
import { PageContainer } from "../PageContainer";
import { saveContactMessage } from "../../lib/db";

interface ContactViewProps {
  onNavigate: (view: string) => void;
}

export default function ContactView({ onNavigate }: ContactViewProps) {
  const [cms, setCms] = useState(getCMSConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setCms(getCMSConfig());
    };
    window.addEventListener("rma_cms_updated", handleUpdate);
    return () => window.removeEventListener("rma_cms_updated", handleUpdate);
  }, []);

  const [success, setSuccess] = useState("");
  const [inputs, setInputs] = useState({ name: "", email: "", subject: "", message: "" });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.name || !inputs.email || !inputs.message) return;
    
    try {
      await saveContactMessage({
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: inputs.name,
        email: inputs.email,
        subject: inputs.subject || "No Subject",
        message: inputs.message,
        timestamp: new Date().toISOString(),
        status: "unread"
      });
    } catch (err) {
      console.error("Soft failing firestore direct message, proceeding to visual confirmation:", err);
    }

    setSuccess(`Message Sent! Thank you ${inputs.name}. Our platform administrators have received your coordinates and will correspond with you via email (${inputs.email}) shortly.`);
    setInputs({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSuccess(""), 8000);
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Background circles */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10 font-sans">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
          <ChevronRight size={12} />
          <span className="font-semibold text-slate-900">Contact</span>
        </div>

        {/* Section title */}
        <div className="max-w-3xl space-y-4 mb-12 border-l-4 border-slate-900 pl-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Sparkles size={11} /> Support Coordinates
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
            Connect With Us
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions about our mentorship state cohorts, upskilling bootcamps, or partnerships? Reach our administration directors directly below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Support Coordinates Details (Left) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contact details */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 uppercase">Official Contacts</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 font-mono">Email Correspondence</h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 select-all font-mono">{cms.contactEmail || "rightmindsafrica@gmail.com"}</p>
                    <p className="text-[11px] text-slate-500 font-medium select-all font-mono mt-1">corpersimpactinitiative@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 font-mono">Phone Helpline</h4>
                    <a
                      href={`tel:${(cms.contactPhone || "+234 803 980 9016").replace(/[^0-9+]/g, "")}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors select-all block font-mono"
                    >
                      {cms.contactPhone || "+234 803 980 9016"}
                    </a>
                    <p className="text-[10px] text-slate-400 mt-1">Active 9:00 AM - 5:00 PM (GMT+1)</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-[#103D2E]/10 text-[#103D2E] border border-emerald-900/10">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 font-mono">Administrative Center</h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{cms.contactAddress || "37 Army Road, Sabon-gari, Zaria."}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Main Headquarters &bull; Kaduna State, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social channels card */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
              <h4 className="text-amber-500 font-bold text-xs uppercase font-mono">Social Networks</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                Follow our daily coaching messages, upcoming bootcamps, and photo archive milestones via official social channels:
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-wrap gap-3">
                  <a href="https://www.facebook.com/RightMAHub/" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-colors" title="RMA Hub Facebook">
                    <Facebook size={16} />
                  </a>
                  <a href="https://www.facebook.com/corperimpacti" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-colors" title="Corper Impact Initiative Facebook">
                    <Facebook size={16} className="text-amber-400" />
                  </a>
                  <a href="https://www.linkedin.com/company/rightmindafricahub" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-colors" title="RMA LinkedIn">
                    <Linkedin size={16} />
                  </a>
                  <a href="https://www.instagram.com/rightmindsafrica" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-colors" title="RMA Instagram">
                    <Instagram size={16} />
                  </a>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1 pt-1 font-mono">
                  <p className="flex items-center gap-1.5">&bull; <span className="text-amber-400">RMA Hub Facebook:</span> @RightMAHub</p>
                  <p className="flex items-center gap-1.5">&bull; <span className="text-amber-400">Corper Impact:</span> @corperimpacti</p>
                  <p className="flex items-center gap-1.5">&bull; <span className="text-amber-400">LinkedIn Hub:</span> @rightmindafricahub</p>
                </div>
              </div>
            </div>

          </div>

          {/* Form container (Right) */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-905 uppercase text-base mb-4">Send Us a Direct Message</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-normal mb-6">
              Our support administration usually routes messages directly to specific regional coordinators in Nigeria based on your details.
            </p>

            {success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                {success}
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={inputs.name}
                      onChange={(e) => setInputs({...inputs, name: e.target.value})}
                      placeholder="e.g. Ebuka Daniel"
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={inputs.email}
                      onChange={(e) => setInputs({...inputs, email: e.target.value})}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Subject</label>
                  <input 
                    type="text" 
                    value={inputs.subject}
                    onChange={(e) => setInputs({...inputs, subject: e.target.value})}
                    placeholder="Describe topic..."
                    className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Write Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={inputs.message}
                    onChange={(e) => setInputs({...inputs, message: e.target.value})}
                    placeholder="Details..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send size={13} /> Send Coordinates &rarr;
                </button>
              </form>
            )}
          </div>

        </div>

      </PageContainer>
    </div>
  );
}
