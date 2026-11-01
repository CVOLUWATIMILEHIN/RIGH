/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Briefcase, DollarSign, GraduationCap } from "lucide-react";

export interface TrackData {
  title: string;
  icon: typeof Briefcase;
  tagline: string;
  cadence: string;
  focusPoints: { label: string; desc: string }[];
  metrics: string;
}

export const CII_TRACKS: Record<"career" | "finance" | "mindset", TrackData> = {
  career: {
    title: "Track 1: Project Impact Track",
    icon: Briefcase,
    tagline: "For corpers who want to execute a visible, documented community or CDS project.",
    cadence: "Monthly Cadence: Week 1 — planning session; Week 2 — peer review; Week 3 — resource/funding support; Week 4 — progress report.",
    focusPoints: [
      { label: "CII Structured Project Canvas", desc: "Structured project canvas, milestone planning, and progress reviews." },
      { label: "CII Platform Visibility", desc: "Showcase your dynamic project logs and stats directly to global partners." },
      { label: "Project Completion Certificate", desc: "Earn a validated leadership award at the completion of your service project." },
      { label: "Guided Funding Lookouts", desc: "CII actively guides corps members in seeking microgrants, partnerships, and material support opportunities that can help fund and sustain their projects." }
    ],
    metrics: "KPI: Every member ships ONE completed, documented project before passing out."
  },
  finance: {
    title: "Track 2: Skill Monetization Track",
    icon: DollarSign,
    tagline: "For corpers learning or monetizing a skill (tech, design, writing, finance, trades, etc.).",
    cadence: "Accountability: weekly learning log, bi-weekly portfolio review, monthly income-readiness session.",
    focusPoints: [
      { label: "Vetted Partners & Facilitators", desc: "CII connects corps members to organization partners and facilitators who teach relevant skills at discounted rates." },
      { label: "Weekly Learning Log & Checks", desc: "Keep task metrics on track with peer circle checkpoints." },
      { label: "Portfolio Audit Reviews", desc: "Receive bi-weekly feedback on your public portfolio elements." },
      { label: "Freelancing & Digital Jobs", desc: "CII guides skilled members toward freelance opportunities, digital jobs, and income-generating platforms where their skills can be monetized." }
    ],
    metrics: "KPI: Member builds a public-facing portfolio OR earns their first paid income before NYSC ends."
  },
  mindset: {
    title: "Track 3: Volunteer & Experience Track",
    icon: GraduationCap,
    tagline: "For corpers seeking professional work experience in their career field.",
    cadence: "Accountability: weekly task log, monthly supervisor feedback, portfolio of deliverables.",
    focusPoints: [
      { label: "Volunteer CV & Profile Preparation", desc: "CII helps volunteers structure and refine their CVs and profiles into well-curated and professionally presented formats suitable for opportunities." },
      { label: "Placement Guarantee", desc: "Members receive a placement within 60 days or a free month extension." },
      { label: "Weekly Task Audits", desc: "Verify key learnings and deliverables with direct supervisor oversight." },
      { label: "Reference Letter & Strengthened CV", desc: "Exit with an authentic reference letter from certified organizations." }
    ],
    metrics: "KPI: Member exits with a verified reference letter, documented experience, and a strengthened CV."
  }
};

export const CII_FAQS = [
  {
    question: "Is the Corper Impact Initiative (CII) totally free?",
    answer: "While we offer entrance-level free tiers (Free Discover & PCM Waitlist) to ensure basic resources are open to everyone, our high-touch core training formats (Growth Member track and Impact Fellow VIP track) are subscription-based. These nominal fees sustain our high-accountability mentor pools, detailed CV overhauls, personal accountability Circles, and direct referral infrastructure."
  },
  {
    question: "What is the difference between the Free, Growth, and Impact VIP tiers?",
    answer: "The Free Discover track includes access to basic general reading assets and public community announcements. The Growth Member track unlocks our full masterclass libraries and standard workshops. The VIP Impact Fellow track is our premium option: providing exclusive small accountability Circles, personalized resume critiques, individual industry mentors, reference letters, and verified Fellowship Certifications."
  },
  {
    question: "What happens if I cannot afford the paid subscription tiers?",
    answer: "We are deeply committed to accessibility. Through our Alumni Funding pool, we provide a limited number of fully-funded scholarships for exceptional candidates facing severe financial hurdles. If you require sponsorship, apply under 'Free Discover' or 'PCM Waitlist' and complete the socio-economic rationale section on your application form for selection review."
  },
  {
    question: "How do the billing and payment plans function?",
    answer: "You can select to pay monthly or save by opting for our annual billing plan to fit your budget. All payments are safely processed, and your transaction reference is uploaded inside your profile portal for immediate Admin verification."
  },
  {
    question: "Can I manage the curriculum alongside my active NYSC primary duties?",
    answer: "Absolutely! The entire CII framework was strategically designed for active corps members. Core masterclasses and labs take place on Saturdays and Sundays, and daily check-ins on our custom platform take less than 10 minutes. It perfectly enhances, rather than interrupts, your primary PPA assignments."
  },
  {
    question: "Is there a refund or service guarantee for VIP Impact Fellows?",
    answer: "Yes. For our premium Impact Fellows, we guarantee structured placement support. If you complete 100% of your curriculum modules, attend all circle meetings, and do not receive professional placement referrals and career reviews within 60 days following your service pass-out, we provide a full, complimentary 1-month VIP extension."
  }
];

export const CII_TESTIMONIALS = [
  {
    name: "Tunde Alabi",
    initials: "TA",
    role: "Cohort 3 Alumnus",
    badge: "Lagos PPA",
    text: "Before CII, I felt incredibly anxious about life after NYSC. I followed Gracious-Esther's mental resilience frameworks, optimized my resume, and applied for the Remote Global Sourcing campaign. Today, I work as a Remote Virtual Assistant for a US real-estate firm, earning three times my previous allowance!",
    placement: "Placed at NextGen Solutions LLC",
    stars: 5,
  },
  {
    name: "Chidinma Okafor",
    initials: "CO",
    role: "Cohort 4 Alumna",
    badge: "Abuja PPA",
    text: "The Alawee savings multiplier module inside the wealth creation track changed how I view money. Instead of blowing my allowance, I launched an emergency fund and automated micro-investments. By pass-out, I had saved over ₦220,000, which funded my tech certification. Extremely recommended!",
    placement: "Built ₦220k+ Savings Portfolio",
    stars: 5,
  },
  {
    name: "Ibrahim Musa",
    initials: "IM",
    role: "Cohort 4 Alumnus",
    badge: "Kano PPA",
    text: "The Peer accountability circle saved me. Ten of us met online every Saturday to submit CV tasks and report local CDS initiative goals. When my motivation slumped, my circle coach stepped in. My team eventually completed an SDG education hub that won a local commendation badge!",
    placement: "Welfare Star Award Winner",
    stars: 5,
  }
];

export const CII_PARTNERS = [
  { label: "NYSC Local Chapters", desc: "Collaborating on local welfare" },
  { label: "Africa Tech Leaders", desc: "Digital contractor placement networks" },
  { label: "SDG Local Council", desc: "Sponsoring youth impact certificates" },
  { label: "RMA Alumni Fund", desc: "Sponsoring 100% tuition scholarships" },
  { label: "SaaS Recruiters", desc: "Vetting CV channels" }
];
