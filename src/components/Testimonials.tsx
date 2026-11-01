/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Quote, MessageSquare, Star, ArrowLeft, ArrowRight, Share2, Check, Link } from "lucide-react";
import { TESTIMONIALS as STATIC_TESTIMONIALS } from "../types";
import { useState, useEffect } from "react";
import PageContainer from "./PageContainer";
import { getTestimonials } from "../lib/db";

export default function Testimonials() {
  const [items, setItems] = useState<any[]>(STATIC_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndListen = async () => {
      try {
        const dbTestimonials = await getTestimonials();
        if (dbTestimonials && dbTestimonials.length > 0) {
          const mapped = dbTestimonials.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            location: (t as any).location || "Nigeria",
            cohort: (t as any).cohort || "CII Graduate",
            avatar: (t as any).avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80",
            quote: t.quote
          }));
          setItems(mapped);
        } else {
          setItems(STATIC_TESTIMONIALS);
        }
      } catch (err) {
        console.warn("Testimonials load error:", err);
      }
    };

    fetchAndListen();

    window.addEventListener("rma_testimonials_updated", fetchAndListen);
    return () => {
      window.removeEventListener("rma_testimonials_updated", fetchAndListen);
    };
  }, []);


  const handleCopyLink = (id: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#testimonials`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const currentTestimonial = items[activeIndex] || items[0] || STATIC_TESTIMONIALS[0];
  const shareText = `Read ${currentTestimonial?.name}'s inspiring story on RightMinds Africa! 🌟 "${currentTestimonial?.quote?.substring(0, 110)}..."`;
  const shareUrl = `${window.location.origin}${window.location.pathname}#testimonials`;

  return (
    <section id="testimonials" className="py-20 bg-white relative overflow-hidden">
      {/* Visual backdrop grid decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <PageContainer>
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-black tracking-widest rounded-full uppercase">
            <MessageSquare size={12} /> TESTIMONIAL HUBS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-blue tracking-tight font-display">
            Stories of Mindset Re-engineering & Life Breakthroughs
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Discover how Right Minds Africa Hub is equipping teenagers, students, and graduates with the clarity, competence, and connections required to lead change.
          </p>
        </div>

        {/* Featured Testimonials Layout Slider */}
        <div className="max-w-4xl mx-auto relative px-2 sm:px-4">
          
          {/* Active Card Body Wrapper */}
          <div className="relative z-10">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="bg-brand-softblue/40 border border-brand-blue/10 rounded-3xl p-6 sm:p-10 relative overflow-hidden"
            >
              {/* Background oversized double quote element */}
              <Quote className="absolute -top-6 -right-6 text-brand-blue/5 w-32 h-32 rotate-12 shrink-0 pointer-events-none" />

              <div className="space-y-6">
                
                {/* Peer Ratings and Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-brand-blue/10">
                  <div className="flex items-center gap-1 text-brand-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} className="fill-brand-gold stroke-1" />
                    ))}
                  </div>
                  
                  <span className="px-3 py-1 bg-white border border-brand-blue/15 text-brand-blue text-xs font-black rounded-lg uppercase tracking-wide">
                    {items[activeIndex]?.cohort}
                  </span>
                </div>

                {/* Testimonial Quote quote text */}
                <p className="text-brand-dark text-base sm:text-lg leading-relaxed font-normal italic relative">
                  "{items[activeIndex]?.quote}"
                </p>

                {/* Author Credentials & Share */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-6 border-t border-brand-blue/10">
                  <div className="flex items-center gap-4">
                    <img
                      src={items[activeIndex]?.avatar}
                      alt={items[activeIndex]?.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-brand-orange shrink-0 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-base font-extrabold text-brand-blue leading-none">
                        {items[activeIndex]?.name}
                      </h4>
                      <p className="text-xs text-brand-orange font-bold mt-1 tracking-wide uppercase">
                        {items[activeIndex]?.role}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">
                        {items[activeIndex]?.location}
                      </p>
                    </div>
                  </div>

                  {/* Elegant Sharing Panel */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <span className="text-[10px] sm:text-right font-black tracking-widest text-brand-blue uppercase flex items-center gap-1.5 md:self-end">
                      <Share2 size={11} className="text-brand-orange" /> SHARE SUCCESS STORY
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(items[activeIndex]?.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center ${
                          copiedId === items[activeIndex]?.id
                            ? "bg-brand-orange/10 border-brand-orange/20 text-brand-orange"
                            : "bg-white border-gray-200 text-gray-500 hover:text-brand-blue hover:border-brand-blue/30"
                        }`}
                        title="Copy Link to Clipboard"
                      >
                        {copiedId === items[activeIndex]?.id ? (
                          <div className="flex items-center gap-1">
                            <Check size={14} className="animate-bounce" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Copied</span>
                          </div>
                        ) : (
                          <Link size={14} />
                        )}
                      </button>

                      {/* Share on X (Twitter) */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-black/30 transition-all flex items-center justify-center cursor-pointer"
                        title="Share on X"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>

                      {/* Share on LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#0a66c2] hover:border-[#0a66c2]/30 transition-all flex items-center justify-center cursor-pointer"
                        title="Share on LinkedIn"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>

                      {/* Share on WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " ✨ Read more: " + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#25D366] hover:border-[#25D366]/30 transition-all flex items-center justify-center cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.636-1.023-5.115-2.884-6.978C16.53 1.9 14.05 1.171 11.413 1.171c-5.438 0-9.863 4.42-9.867 9.864 0 1.702.443 3.366 1.293 4.811L1.8 21.01l5.222-1.37a9.8 9.8 0 0 0 4.822 1.144z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Slider Controller Navigation Controls */}
          <div className="flex justify-between items-center mt-8 px-2">
            
            {/* Slide Pagination Dots */}
            <div className="flex gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? "bg-brand-blue w-8" : "bg-gray-200 w-2.5 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to client testimonial slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next/Prev Arrow Action triggers */}
            <div className="flex gap-2.5">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-brand-blue transition-colors cursor-pointer"
                aria-label="Previous Testimonial Profile"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-brand-blue transition-colors cursor-pointer"
                aria-label="Next Testimonial Profile"
              >
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>

        {/* Real-World Digital Mentee Insights Grid (Organic WhatsApp/Class Excerpts) */}
        <div className="mt-28 space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black tracking-widest text-[#d97706] uppercase font-mono bg-amber-50 border border-amber-100 px-3 py-1 rounded-md">
              💬 REAL-TIME COACHING FEEDBACK
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight font-display uppercase">
              ORGANIC MENTEE TELEGRAM
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Verbatim reflections shared directly with Gracious-Esther (Executive Director)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Tag 1: Valuable Knowledge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50/60 hover:bg-white rounded-[2rem] border border-slate-200/80 hover:border-brand-orange/30 p-6 relative transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-orange/15 text-brand-orange border border-brand-orange/10 font-mono">
                    Profitable Knowledge
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">11:14 PM</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-normal italic">
                  "Good evening ma. Thank you for taking out time to explain to detail how profitable this knowledge is to every individual per time. I’m glad all these sessions are in place. Thank you, it’s been amazing so far."
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wide">CII Cohort Member</span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> VERIFIED CHAT
                </span>
              </div>
            </motion.div>

            {/* Tag 2: Reflection and Assignments */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50/60 hover:bg-white rounded-[2rem] border border-slate-200/80 hover:border-emerald-300/30 p-6 relative transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
                    Practical Application
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">10:42 PM</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-normal italic">
                  "I won’t lie today’s class was quite a lot of practical. From the review of the assignment and the class in full, I can literally see my errors like a reflection. I’m ever grateful for this class, there’s intense growth and impact going on. Thank you."
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wide">University Hub Student</span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> VERIFIED CHAT
                </span>
              </div>
            </motion.div>

            {/* Tag 3: Self-Worth */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50/60 hover:bg-white rounded-[2rem] border border-slate-200/80 hover:border-brand-blue/30 p-6 relative transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-softblue/80 text-brand-blue border border-brand-blue/10 font-mono">
                    Identity & Self-Worth
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">Yesterday</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-normal italic">
                  "I will start first of all with an appreciation because Sunday's class shed light on all I have been ignoring. This identity talk, self worth, and self esteem is what I was shying away from. The class didn’t just bring clarity, it brought guidance and practical steps to take. What stood out for me more was self worth, because I could relate to everything in this class. Every step of the conversation was relatable and I can fully say I’m recovering. I now know the difference between self worth, self esteem, and identity. I enjoyed the session! 🔥"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wide">Academy Delegate</span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> VERIFIED CHAT
                </span>
              </div>
            </motion.div>

            {/* Tag 4: Boundaries */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50/60 hover:bg-white rounded-[2rem] border border-slate-200/80 hover:border-purple-300/30 p-6 relative transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100 font-mono">
                    Boundaries & Confidence
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">11:05 PM</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-normal italic">
                  "Good evening ma. Today’s class was quite interesting but deeply reflective for me. While we talked more on boundaries, self confidence, and self respect... With your examples I found out that most of the time I don’t set my boundaries. I just let people come and do what they want. I really don’t know how much it could affect until today’s class where I got to understand better and I’m working on it. And also on self confidence I got a whole different view in today’s session. Self respect: honouring boundaries and protecting peace (this stood out most, saying stop being a people pleaser)."
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wide">Teens Academy Class</span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> VERIFIED CHAT
                </span>
              </div>
            </motion.div>

            {/* Tag 5: Vision / Purpose */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50/60 hover:bg-white rounded-[2rem] border border-slate-200/80 hover:border-pink-300/30 p-6 relative transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-100 font-mono">
                    Vision & Alignment
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">Monday</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-normal italic">
                  "Yesterday’s session was deeply impactful. I learnt the difference between vision and purpose, and how also everything should be in alignment with my identity. Then what vision is and what it’s not, and what a healthy vision looks like. Also goals setting, why it’s important to set goals as a person. Then principles for a healthy goal setting, and the daily alignment questions stood out for me more."
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wide">CII Blueprint Track</span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> VERIFIED CHAT
                </span>
              </div>
            </motion.div>

            {/* Tag 6: 1-Month coaching summary */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-amber-50/40 hover:bg-amber-50/70 rounded-[2rem] border border-amber-200/70 p-6 relative transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/50 font-mono">
                    1-Month Coaching Reflection
                  </span>
                  <span className="text-[9px] text-amber-700 font-mono font-bold">Sunday</span>
                </div>
                
                <p className="text-xs text-amber-950/80 leading-relaxed font-normal italic">
                  "It’s been an amazing one month coaching with you ma. Over the month there has been massive improvement and growth both internally and physically. Changes that are noticeable to people around me. Looking back at everything I’m glad I started this journey because now I clearly understand why things went the way they did. From the first session to all ones with impactful teachings like: Self awareness, Self reinvention, Letting go of old versions, Identity, Self leadership, Emotional mastery, Productivity, Consistency, and many others. I would say that these teachings did a lot on my mindset. It was a season of unlearning and relearning for me and I’m glad I was enrolled for the classes. Thank you ma."
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-amber-200 flex items-center justify-between text-[10px] text-amber-800/80">
                <span className="font-bold uppercase tracking-wide">Executive Mentee</span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  ★ UNLEART & RELEARN
                </span>
              </div>
            </motion.div>

          </div>

        </div>

      </PageContainer>
    </section>
  );
}
