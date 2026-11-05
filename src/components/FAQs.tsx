/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, Search, X, BookOpen, GraduationCap } from "lucide-react";

const RMA_FAQS = [
  {
    id: "rma-f1",
    question: "Is Right Minds Africa Hub a religious or political organization?",
    answer: "We are an independent, non-political, vision-driven educational academy. While we focus heavily on purposeful living, moral character development, and general spiritual soundness as fundamentals of leadership, our programs are open to all passionate young Africans searching for a structured growth pathway."
  },
  {
    id: "rma-f2",
    question: "How do I register or join the CII (Corper Impact Initiative)?",
    answer: "If you are an active corps member (or about to deploy), you can click on any 'Join Community' card on this page, choose 'NYSC Corps Member' or 'Recent Graduate', and complete your registration form. Form registrations are automatically parsed into active state cohorts, opening doors to mentorship groups and career sessions."
  },
  {
    id: "rma-f3",
    question: "Do you charge fees for your programs or mentorship hubs?",
    answer: "Our foundational Monthly Leadership Seminars, standard mentorship hubs, and Right-Minded Teens circles are 100% free of charge, sponsored by alumni mentors and philanthropic partners. However, our specialized intensive packages (such as the Monthly Reinvention Program, specialized Staff Peak/Staff Pick corporate training, and our Summer Leadership Bootcamp for Teenagers) are premium paid tracks. These enrollment fees support high-touch coaching loops, customized resource guides, and hands-on professional development toolkits."
  },
  {
    id: "rma-f4",
    question: "Can I join as a Mentor or Volunteer partner?",
    answer: "Absolutely! We welcome young corporate professionals, experienced teachers, and post-NYSC graduates who want to give back through physical workshops, digital cohorts, or review clinics. Use the Join Community form and check the 'Volunteer/Mentor' option."
  }
];

const CII_FAQS = [
  {
    id: "cii-f1",
    question: "Is the Corper Impact Initiative (CII) totally free?",
    answer: "While we offer entrance-level free tiers (Free Discover & PCM Waitlist) to ensure basic resources are open to everyone, our high-touch core training formats (Growth Member track and Impact Fellow VIP track) are subscription-based to sustain our high-accountability mentor pools, detailed CV overhauls, personal accountability Circles, and direct referral infrastructure."
  },
  {
    id: "cii-f2",
    question: "What is the difference between the Free, Growth, and Impact VIP tiers?",
    answer: "The Free Discover track includes access to basic general reading assets and public community announcements. The Growth Member track unlocks our full masterclass libraries and standard workshops. The VIP Impact Fellow track is our premium option: providing exclusive small accountability Circles, personalized resume critiques, individual industry mentors, reference letters, and verified Fellowship Certifications."
  },
  {
    id: "cii-f3",
    question: "What happens if I cannot afford the paid subscription tiers?",
    answer: "We are deeply committed to accessibility. Through our Alumni Funding pool, we provide a limited number of fully-funded sponsorships for exceptional candidates facing severe financial hurdles. If you require sponsorship, apply under 'Free Discover' or 'PCM Waitlist' and complete the socio-economic rationale section on your application form for selection review."
  },
  {
    id: "cii-f4",
    question: "How do the billing and payment plans function?",
    answer: "You can select to pay monthly or save by opting for our annual billing plan to fit your budget. All payments are safely processed, and your transaction reference is uploaded inside your profile portal for immediate Admin verification."
  },
  {
    id: "cii-f5",
    question: "Can I manage the curriculum alongside my active NYSC primary duties?",
    answer: "Absolutely! The entire CII framework was strategically designed for active corps members. Core masterclasses and labs take place on Saturdays and Sundays, and daily check-ins on our custom platform take less than 10 minutes. It perfectly enhances, rather than interrupts, your primary PPA assignments."
  },
  {
    id: "cii-f6",
    question: "Is there a refund or service guarantee for VIP Impact Fellows?",
    answer: "Yes. For our premium Impact Fellows, we guarantee structured placement support. If you complete 100% of your curriculum modules, attend all circle meetings, and do not receive professional placement referrals and career reviews within 60 days following your service pass-out, we provide a full, complimentary 1-month VIP extension."
  }
];

export default function FAQs() {
  const [activeTab, setActiveTab] = useState<"rma" | "cii">("rma");
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cms, setCms] = useState<any>(null);

  useEffect(() => {
    const loadCms = () => {
      const saved = localStorage.getItem("rma_cms_config");
      if (saved) {
        try {
          setCms(JSON.parse(saved));
        } catch (e) {}
      }
    };
    loadCms();
    window.addEventListener("rma_cms_updated", loadCms);
    return () => window.removeEventListener("rma_cms_updated", loadCms);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const currentFaqs = useMemo(() => {
    if (cms?.faqs && cms.faqs.length > 0) {
      const filtered = cms.faqs.filter((f: any) => f.enabled !== false);
      const hasCategories = filtered.some((f: any) => f.category && (f.category.toLowerCase() === "rma" || f.category.toLowerCase() === "cii"));
      if (hasCategories) {
        return filtered
          .filter((f: any) => f.category && f.category.toLowerCase() === activeTab)
          .map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }));
      } else {
        // Distribute them evenly if no categories are set
        if (activeTab === "rma") {
          return filtered.slice(0, Math.ceil(filtered.length / 2)).map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }));
        } else {
          return filtered.slice(Math.ceil(filtered.length / 2)).map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }));
        }
      }
    }
    return activeTab === "rma" ? RMA_FAQS : CII_FAQS;
  }, [cms, activeTab]);

  const filteredFaqs = currentFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabChange = (tab: "rma" | "cii") => {
    setActiveTab(tab);
    setOpenId(null);
  };

  return (
    <section id="faqs" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute bottom-4 left-4 w-72 h-72 bg-brand-softblue/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-black tracking-widest rounded-full uppercase">
            <HelpCircle size={13} /> INFORMATION MATRIX
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-blue tracking-tight font-display">
            FAQs
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Have questions about registrations, mentor criteria, or session timelines? Select the category below to view specific answers.
          </p>
        </div>

        {/* Dual FAQ Category Button/Tabs Selector */}
        <div className="flex justify-center mb-8" id="faq-category-selector">
          <div className="inline-flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner gap-2">
            <button
              onClick={() => handleTabChange("rma")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "rma"
                  ? "bg-brand-blue text-white shadow-md scale-[1.02]"
                  : "text-slate-600 hover:text-brand-blue hover:bg-slate-200/50"
              }`}
              id="tab-faq-rma"
            >
              <BookOpen size={14} className={activeTab === "rma" ? "text-brand-orange animate-pulse" : "text-slate-400"} />
              Right Minds Africa
            </button>
            <button
              onClick={() => handleTabChange("cii")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "cii"
                  ? "bg-brand-blue text-white shadow-md scale-[1.02]"
                  : "text-slate-600 hover:text-brand-blue hover:bg-slate-200/50"
              }`}
              id="tab-faq-cii"
            >
              <GraduationCap size={14} className={activeTab === "cii" ? "text-brand-orange animate-pulse" : "text-slate-400"} />
              Corper Impact Initiative
            </button>
          </div>
        </div>

        {/* Search Bar Block */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab === "rma" ? "Right Minds Africa" : "Corper Impact"} FAQs...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 focus:border-brand-blue focus:ring-[6px] focus:ring-brand-blue/15 focus:shadow-md rounded-2xl text-sm focus:outline-none transition-all duration-350 placeholder-gray-400 font-medium shadow-sm hover:border-gray-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center text-xs text-brand-blue font-bold mt-3 font-mono tracking-wider bg-brand-blue/5 border border-brand-blue/10 py-1.5 px-4 rounded-full w-fit mx-auto transition-all shadow-xs animate-[fadeIn_0.25s_ease-out]">
              Found {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"} matching your query
            </p>
          )}
        </div>

        {/* Accordions Container */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-14 px-4 border border-dashed border-gray-200 rounded-3xl bg-gray-50/45 max-w-lg mx-auto">
            <HelpCircle className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-sm font-black text-brand-blue uppercase tracking-wide">No matching inquiries found</p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">Try searching for other terms or choose the other category tab.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 text-xs font-black tracking-wider text-white bg-brand-orange hover:bg-brand-orange/95 rounded-xl uppercase shadow-md transition-all cursor-pointer"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white border rounded-2xl transition-all duration-300 hover:shadow-md ${
                    isOpen
                      ? "border-brand-blue bg-brand-softblue/10 shadow-sm"
                      : "border-gray-200 hover:border-brand-blue/30 bg-white"
                  }`}
                  id={`faq-accordion-${faq.id}`}
                >
                  {/* Trigger Button bar */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-sm sm:text-base text-brand-blue tracking-tight pr-4">
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-lg shrink-0 transition-all duration-300 ${isOpen ? "bg-brand-blue/15 text-brand-blue rotate-180" : "bg-gray-50 text-gray-400"}`}>
                      <ChevronDown size={15} className="transform transition-transform duration-300 ease-out" />
                    </div>
                  </button>

                  {/* Animated Body panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden border-t border-brand-blue/5"
                      >
                        <motion.div 
                          className="p-5 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal bg-white/45"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          {faq.answer}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact fallback card */}
        <div className="mt-12 text-center p-6 bg-brand-light border border-gray-150 rounded-2xl max-w-xl mx-auto text-xs text-gray-500 space-y-2">
          <p className="font-bold text-gray-700">Didn't find your answer?</p>
          <p>We are fully responsive on WhatsApp and Email networks to guide your applications.</p>
          <div className="flex justify-center gap-4 text-brand-blue font-bold font-mono uppercase mt-2 select-all">
            <a href="mailto:rightmindsafrica@gmail.com" className="hover:text-brand-orange">rightmindsafrica@gmail.com</a>
            <span>&bull;</span>
            <a href="tel:+2348039809016" className="hover:text-brand-orange">+234 803 980 9016</a>
          </div>
        </div>

      </div>
    </section>
  );
}
