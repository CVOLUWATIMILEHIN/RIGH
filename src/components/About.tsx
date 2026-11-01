/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Sparkles, MapPin, Compass, ShieldCheck, HeartHandshake, RefreshCw, ArrowLeft, Target, Landmark, History, Calendar, Award } from "lucide-react";
import founderPortrait from "../assets/images/FOUNDER.jpg";
import PageContainer from "./PageContainer";

interface AboutProps {
  onBack?: () => void;
}

export default function About({ onBack }: AboutProps) {
  const pillars = [
    {
      icon: RefreshCw,
      title: "Corporate Staff Training",
      desc: "Providing high-impact capability building, workflow coordination metrics, and peak-efficiency standard operating procedures (SOPs) for forward-pointing companies.",
      color: "text-brand-orange bg-brand-orange/5 border-brand-orange/15"
    },
    {
      icon: HeartHandshake,
      title: "Elite Mentorship Pools",
      desc: "Strategic positioning pairing young professionals and undergraduates with corporate executives, system consultants, and global contracting directors.",
      color: "text-brand-blue bg-brand-softblue/80 border-brand-blue/15"
    },
    {
      icon: ShieldCheck,
      title: "Behavioral EQ & Character",
      desc: "Delivering targeted prevention seminars, cognitive adjustments, emotional intelligence (EQ) training, integrity structures, and spiritual grounding.",
      color: "text-brand-gold bg-brand-gold/10 border-brand-gold/15"
    },
    {
      icon: Compass,
      title: "Undergraduate Roadmap Clinic",
      desc: "Escaping post-graduation panic by arming students with high-end freelancer models, international contract acquisition, and resume overhauls.",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    }
  ];

  return (
    <div className="bg-brand-light relative min-h-screen pt-28 pb-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-brand-softblue/20 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10">
        
        {/* Back navigation option */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="group mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-brand-blue text-sm text-slate-600 hover:text-brand-blue font-bold shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home Page
          </motion.button>
        )}

        {/* Brand Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <span className="inline-flex items-center gap-1 text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-orange/10 border border-brand-orange/20 px-3.5 py-1 rounded-full">
            <Sparkles size={12} className="animate-pulse" /> CORE VALUE FRAMEWORK
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight font-display uppercase leading-tight">
            ABOUT RIGHTMINDS AFRICA
          </h1>
          <p className="text-lg text-slate-605 max-w-2xl font-medium leading-relaxed">
            At Right-Minds Africa, we’re building a generation that refuses to be ordinary. We help young Africans discover their unique calling, re-engineer cognitive mindsets, and live with peak intentional growth.
          </p>
        </div>

        {/* Grid layout for Main Story & Mission/Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-stretch">
          
          {/* Main Manifesto */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-150 p-6 sm:p-10 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-brand-blue uppercase font-display border-b border-slate-100 pb-3">
                Our Foundational Philosophy
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                At Right-Minds Africa, we’re building a generation that refuses to be ordinary. We believe transformation begins in the mind, cultivating young people who embrace continuous learning, see challenges as opportunities, and pursue excellence in everything they do. But growth without direction is wasted potential. 
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                That’s why we empower young Africans to discover their unique calling and live with intention—not just chasing success, but building significance.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                Our community is filled with impact-oriented individuals who don’t just consume, they create. They solve real problems, lead change in their communities, and leave every space better than they found it. When you think right, live right, and lead right, you don’t just transform yourself, you transform Africa.
              </p>
            </div>

            <div className="border-l-4 border-brand-orange pl-4 bg-brand-orange/5 p-4 rounded-r-2xl mt-6">
              <p className="text-xs font-black font-mono tracking-widest text-[#d97706] uppercase mb-1">
                OUR PROMISE
              </p>
              <p className="text-sm italic text-slate-700 leading-relaxed font-medium">
                "When you think right, live right, and lead right, you don't just transform yourself, you transform Africa."
              </p>
            </div>
          </div>

          {/* Right Column: Mission and Vision Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Vision block */}
            <div className="bg-brand-blue text-white rounded-[2rem] p-8 relative overflow-hidden flex-1 shadow-md flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-orange border border-white/20">
                  <Target size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider font-mono text-brand-orange">
                  OUR VISION
                </h3>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                  To raise and stimulate the mindset of a generation to become purpose-driven, growth-minded, and impact-oriented individuals who will transform Africa and the globe through leadership, productivity, and personal development/excellence.
                </p>
              </div>
              <div className="text-xs font-mono font-black text-brand-orange uppercase tracking-wider pt-4 border-t border-white/10 mt-6 md:mt-8">
                🧠 Thinking Better, Living Wisely
              </div>
            </div>

            {/* Mission block */}
            <div className="bg-brand-orange text-brand-dark rounded-[2rem] p-8 relative overflow-hidden flex-1 shadow-md flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-brand-dark/10 flex items-center justify-center text-brand-blue border border-brand-dark/10">
                  <Landmark size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider font-mono text-brand-blue">
                  OUR MISSION
                </h3>
                <p className="text-sm sm:text-base text-brand-dark/90 leading-relaxed font-normal">
                  To empower young people across Africa through leadership development, mindset reformation, and capacity-building programs that promote growth, productivity, and sustainable change.
                </p>
              </div>
              <div className="text-xs font-mono font-black text-brand-blue uppercase tracking-wider pt-4 border-t border-brand-dark/10 mt-6 md:mt-8">
                🚀 Dynamic Capacity Building
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Timeline of our movement - Editorial Layout */}
        <div className="mb-20">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-black tracking-widest text-[#d97706] uppercase block font-mono">
              Timeline & Genesis
            </span>
            <h2 className="text-3xl font-extrabold text-brand-blue font-display uppercase tracking-tight">
              THE BIRTH OF A MOVEMENT
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Trace the trajectory starting from solitary personal questions to a robust state-coordinated offline and online community chapter structure.
            </p>
          </div>

          <div className="relative border-l border-brand-blue/20 ml-4 md:ml-8 space-y-12">
            
            {/* Stage 1 */}
            <div className="relative pl-8 md:pl-12">
              <span className="absolute -left-3 h-6 w-6 rounded-full bg-brand-orange border-4 border-brand-light shadow-sm flex items-center justify-center text-white" />
              <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-shadow">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-wider uppercase font-mono">
                  2016 - 2017 &bull; The Seed of Mindset Shift
                </span>
                <h3 className="text-lg font-black text-brand-blue uppercase tracking-tight">
                  Solitary Questions In Youth
                </h3>
                <div className="text-slate-650 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                  <p>
                    Between 2016 and 2017, fresh out of secondary school, I found myself asking a simple yet defining question: <strong className="text-brand-blue">“What do I really want to do with my life?”</strong>
                  </p>
                  <p>
                    I knew I loved to talk but, I didn’t yet understand the world of public speaking or personal development. All I knew was that I wanted to be better — and help others become better too.
                  </p>
                  <p>
                    Growing up as the youngest in a family of older people exposed me early to mature conversations about life, choices, and consequences. Listening to those talks gave me a unique lens; I saw life not just as it was, but as it could be. When I looked at my peers, I could see the potential for more — if only we could think differently. That desire to inspire a shift in mindset became the seed of what would later grow into RightMinds Africa.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative pl-8 md:pl-12">
              <span className="absolute -left-3 h-6 w-6 rounded-full bg-brand-blue border-4 border-brand-light shadow-sm flex items-center justify-center text-white" />
              <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-shadow">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/10 text-[#d97706] text-[10px] font-black tracking-wider uppercase font-mono">
                  2020 &bull; The Pandemic Pandemic Catalyst
                </span>
                <h3 className="text-lg font-black text-brand-blue uppercase tracking-tight">
                  Intercepting Social Media Wave
                </h3>
                <div className="text-slate-650 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                  <p>
                    Fast-forward to 2020, when the world went still during the COVID-19 pandemic, and young people across Africa turned to social media to express themselves—dancing, creating, and connecting. I caught that same wave, but with a different fire burning inside me.
                  </p>
                  <p>
                    I didn’t just want to join the trend, I wanted to transform it. I wanted to speak to minds. To challenge young people like myself to think deeper, live better, and grow stronger.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative pl-8 md:pl-12">
              <span className="absolute -left-3 h-6 w-6 rounded-full bg-brand-blue border-4 border-brand-light shadow-sm flex items-center justify-center text-white" />
              <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-shadow">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-wider uppercase font-mono">
                  2021 &bull; Community Mobilization
                </span>
                <h3 className="text-lg font-black text-brand-blue uppercase tracking-tight">
                  The Birth of RightMinds Africa Community
                </h3>
                <div className="text-slate-650 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                  <p>
                    In 2021, that seed took form and RightMinds Africa was born. A community built to nurture growth-minded, purpose-driven, and impact-oriented young Africans.
                  </p>
                  <p>
                    At first, the vision wasn’t perfectly clear. I just knew I wanted to build a space for people who desired change, growth, and excellence. People who refused to be ordinary. I wanted to be the genesis of growth, sparking a movement of personal development across Africa.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="relative pl-8 md:pl-12">
              <span className="absolute -left-3 h-6 w-6 rounded-full bg-brand-orange border-4 border-brand-light shadow-sm flex items-center justify-center text-white" />
              <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-shadow">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-yellow-800 text-[10px] font-black tracking-wider uppercase font-mono">
                  2020 - 2023 &bull; Deep Training Block
                </span>
                <h3 className="text-lg font-black text-brand-blue uppercase tracking-tight">
                  The Growth Behind the Growth
                </h3>
                <div className="text-slate-650 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                  <p>
                    Between 2020 and 2023, I immersed myself in learning — consuming teachings from global voices like <strong className="text-brand-blue">Mel Robbins</strong>, <strong className="text-brand-blue">Gary Vaynerchuk</strong>, and <strong className="text-brand-blue">Linus Okorie</strong> (whose mentorship program I joined).
                  </p>
                  <p>
                    I attended leadership school (2021) and later became a Change Maker and SDG Advocate (2023) — all experiences that deepened my conviction and equipped me to lead RightMinds Africa into the future. I also completed comprehensive professional trainings on <strong className="text-brand-blue">Human Resource Management</strong> and <strong className="text-brand-blue">Project Management</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 5 */}
            <div className="relative pl-8 md:pl-12">
              <span className="absolute -left-3 h-6 w-6 rounded-full bg-emerald-500 border-4 border-brand-light shadow-sm flex items-center justify-center text-white" />
              <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-shadow">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wider uppercase font-mono">
                  PRESENT DAY &bull; Active State Commands
                </span>
                <h3 className="text-lg font-black text-emerald-800 uppercase tracking-tight">
                  Today's Rapidly Expanding Ecosystem
                </h3>
                <div className="text-slate-650 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                  <p>
                    Today, Right-Minds Africa Hub isn’t just a community, it’s a movement that has grown to over <strong className="text-emerald-700">250 young individuals</strong>. A growing ecosystem of young Africans committed to thinking right, growing right, and leading right.
                  </p>
                  <p>
                    Through mentorship sessions, virtual hangouts, and mindset-shifting conversations on WhatsApp, Telegram, and social media, we are raising a tribe of young people who are not waiting for change but are becoming it.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Leadership Spotlight Sub-section */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Founder Photo Panel (col-span-5) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative group max-w-sm w-full">
                {/* Decorative behind backdrop */}
                <div className="absolute -inset-2 bg-brand-blue/25 rounded-3xl blur-xl transition-all duration-300 group-hover:bg-brand-blue/35" />
                
                {/* Premium Frame */}
                <div className="relative bg-white p-3 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-50">
                    <img
                      src={founderPortrait}
                      alt="Gracious-Esther - Founder & Executive Director"
                      className="w-full h-full object-cover object-[center_15%] scale-[1.2] transition-transform duration-500 group-hover:scale-[1.25]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Micro branding label */}
                  <div className="absolute top-6 right-6 font-mono bg-brand-dark/95 backdrop-blur-md px-3 py-1 text-[9px] text-white tracking-widest font-black uppercase rounded-full border border-white/10">
                    FOUNDER & ED
                  </div>

                  <div className="mt-4 pb-1 text-center lg:text-left px-2">
                    <h4 className="text-lg font-black text-brand-dark font-display leading-tight">Gracious-Esther</h4>
                    <p className="text-xs font-bold text-brand-orange tracking-wide">Founder & Executive Director, RightMinds Africa Hub</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Message / Manifesto Panel (col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-brand-blue uppercase">
                <Sparkles className="text-brand-orange" size={12} /> LEADERSHIP SPOTLIGHT
              </span>
              
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight font-display">
                Meet the Founder & Coach
              </h3>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong>Gracious-Esther (Soundmind-DOCTOR)</strong> is a certified Growth-Mindset, Leadership, and Productivity Coach passionate about helping young people, professionals, and emerging leaders unlock clarity, purpose, and intentional growth. As the visionary founder of <strong>RightMinds Africa Hub</strong>, she is committed to raising a generation of purpose-driven individuals equipped with the mindset, discipline, and leadership skills needed to thrive in today’s world.
                </p>
                <p>
                  Through coaching programs, trainings, speaking engagements, and digital content, she helps individuals build confidence, improve productivity, develop leadership capacity, and grow intentionally in both life and purpose. She is also a certified SDGs Advocate and a faith-driven leader who believes transformation begins from within.
                </p>
                <p>
                  Through her social media platforms, trainings, programs, and presentations at events, she has impacted and reached over <strong>1,000+ young people</strong> with messages centered on growth, leadership, productivity, and intentional living.
                </p>
              </div>

              {/* Direct Letter excerpt */}
              <div className="bg-brand-orange/[0.02] border-l-4 border-brand-orange/40 p-5 rounded-r-2xl space-y-3">
                <p className="text-xs font-bold font-mono tracking-wider text-brand-orange uppercase">Her Core Commitment:</p>
                <p className="text-sm italic text-gray-700 font-normal leading-relaxed">
                  "Transformation begins from within. Raising a generation of purpose-driven individuals equipped with the mindset, discipline, and leadership skills is not just a plan—it is a critical necessity to see a better world. Think better, live intentionally, and lead with purpose."
                </p>
                <div className="text-right text-xs">
                  <strong className="text-brand-dark font-bold font-display">— Gracious-Esther (Soundmind-DOCTOR)</strong>
                  <span className="text-gray-400 font-medium block">Founder & Leadership Coach, RightMinds Africa Hub</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Pillars Bento Cards */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-black tracking-widest text-brand-blue uppercase block font-mono">
              Operational Mastery
            </span>
            <h2 className="text-3xl font-extrabold text-brand-blue font-display uppercase tracking-tight">
              FOUR CORE PILLARS OF PRACTICE
            </h2>
            <p className="text-slate-505 text-sm">
              We design specialized workshops and targeted curriculum plans centered in operational agility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(13,59,102,0.06)" }}
                  className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between cursor-default transition-all shadow-sm"
                >
                  <div>
                    <div className={`p-3 rounded-xl w-fit border ${p.color} mb-4`}>
                      <Icon size={20} className="stroke-[2.5]" />
                    </div>
                    
                    <h3 className="text-sm font-black text-brand-blue tracking-tight uppercase mb-2">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Global state structures influence section */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-black text-brand-orange uppercase block font-mono">
                🌏 STATE HIERARCHY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-blue font-display uppercase tracking-tight leading-tight">
                PHYSICAL AND DIGITAL CHAPTERS
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                RightMinds Africa is physical. Our structured state commands guide, peer monitor, and hold local members accountable to personal excellence plans.
              </p>
            </div>

            <div className="lg:col-span-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { name: "Lagos State", region: "Alausa-Ikeja Hub", color: "border-brand-blue text-brand-blue bg-brand-softblue/10" },
                  { name: "Oyo State", region: "Ogbomoso / Ibadan", color: "border-brand-orange text-[#d97706] bg-brand-orange/5" },
                  { name: "Osun State", region: "Osogbo Chapter", color: "border-amber-600 text-amber-700 bg-amber-50" },
                  { name: "Ekiti State", region: "Ado-Ekiti Chapter", color: "border-emerald-600 text-emerald-700 bg-emerald-50" },
                  { name: "Enugu State", region: "Eastern Command", color: "border-brand-blue text-brand-blue bg-blue-50/50" },
                  { name: "Port Harcourt", region: "South-South Circle", color: "border-indigo-600 text-indigo-700 bg-indigo-50/50" },
                  { name: "Abuja FCT", region: "National Headquarters", color: "border-purple-600 text-purple-700 bg-purple-50" },
                ].map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-left cursor-default hover:scale-[1.02] transition-transform ${st.color}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="shrink-0 animate-bounce" />
                      <span className="font-extrabold text-xs leading-tight tracking-tight uppercase">
                        {st.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1 leading-none">
                      {st.region}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </PageContainer>
    </div>
  );
}
