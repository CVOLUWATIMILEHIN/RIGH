import React, { useState, useEffect } from "react";
import { 
  FileText, 
  RotateCcw, 
  Save, 
  Wrench, 
  Sparkles, 
  AlertCircle,
  Home,
  CheckCircle2,
  Phone,
  HelpCircle,
  Users,
  Image as ImageIcon,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Calendar,
  MapPin,
  Plus,
  Play,
  Pause,
  Clock,
  ExternalLink,
  Sliders,
  BarChart3,
  MousePointerClick
} from "lucide-react";
import { saveCMSConfig } from "../lib/db";
import { 
  saveCMSConfigToSupabase, 
  seedSupabaseDatabase, 
  fetchAllCMSFromSupabase 
} from "../lib/supabaseCms";
import { uploadImageToSupabase, isSupabaseConfigured } from "../lib/supabase";
import { Database, UploadCloud } from "lucide-react";

// Import all premium event images for preview and default loading
import imgAuditorium from "../assets/images/hero_academic_auditorium_1779788054219.png";
import imgCiiHangout from "../assets/images/cii_social_group_hangout_v2_1779792894578.png";
import imgClassroom from "../assets/images/hero_classroom_seminar_v2_1779787242101.png";
import imgConference from "../assets/images/nigerian_conference_1779791531024.png";
import imgTeensClassroom from "../assets/images/nigerian_teens_classroom_1779792832349.png";
import imgYapConference from "../assets/images/yap_conference_seminar_1779772540833.png";
import imgTeamDrills from "../assets/images/cii_team_building_drills_v2_1779792911218.png";
import imgCareerBootcamp from "../assets/images/nigerian_career_bootcamp_1779792857490.png";

// Map keys to the imported image urls
export const PRELOADED_HERO_IMAGES: Record<string, string> = {
  auditorium: imgAuditorium,
  cii_hangout: imgCiiHangout,
  classroom: imgClassroom,
  conference: imgConference,
  teens_classroom: imgTeensClassroom,
  yap_conference: imgYapConference,
  team_drills: imgTeamDrills,
  career_bootcamp: imgCareerBootcamp
};

// Friendly labels for dropdown or selection
export const PRELOADED_HERO_LABELS: Record<string, string> = {
  auditorium: "Academic Auditorium Mentorship Session",
  cii_hangout: "NYSC Corps Member Outreach Hangout",
  classroom: "Youth Digital Capacity Training Room",
  conference: "RMA Annual Youth Conference",
  teens_classroom: "Teens Mentorship Classroom Session",
  yap_conference: "Youth Action & Leadership Summit (YAP)",
  team_drills: "CII Team Building Drills & Teamwork",
  career_bootcamp: "Nigerian Youth Career Bootcamp"
};

export interface HeroSlide {
  id: string;
  imageUrl: string; // key from PRELOADED_HERO_IMAGES, or base64 data url, or external link
  caption: string;
  enabled: boolean;
  order: number;
  scheduleStart?: string; // YYYY-MM-DD format
  scheduleEnd?: string; // YYYY-MM-DD format
  duration?: number; // per-slide autoplay duration in seconds
  badge?: string;
  headline?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonAction?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: string;
  overlayOpacity?: number; // custom brightness adjustment
  showEventCard?: boolean;
  eventCardTitle?: string;
  eventCardName?: string;
  eventCardDate?: string;
  eventCardLocation?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  order: number;
  enabled: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  enabled: boolean;
}

export interface CMSConfig {
  id: string;
  // Hero Redesign parameters
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonLeft: string; // kept for legacy compatibility
  heroBtnPrimaryText: string;
  heroBtnPrimaryAction: string;
  heroBtnSecondaryText: string;
  heroBtnSecondaryAction: string;
  heroBtnTertiaryText: string;
  heroBtnTertiaryAction: string;

  // Floating Event Card
  heroEventTitle: string;
  heroEventName: string;
  heroEventDescription: string;
  heroEventDate: string;
  heroEventTime: string;
  heroEventLocation: string;
  heroEventSlots: number;
  heroEventCountdownEnabled: boolean;
  heroEventTargetDate: string;
  heroEventEndDate: string;
  heroEventThumbnail: string;
  heroEventScheduleStart: string;
  heroEventScheduleEnd: string;
  heroEventActionText: string;
  heroEventActionLink: string;
  heroEventEnabled: boolean;

  // Live Impact Statistics
  heroStat1Number: string;
  heroStat1Label: string;
  heroStat2Number: string;
  heroStat2Label: string;
  heroStat3Number: string;
  heroStat3Label: string;
  heroStat4Number: string;
  heroStat4Label: string;
  heroStat5Number: string;
  heroStat5Label: string;

  // Slider controls
  heroAutoplay: boolean;
  heroDisplayDuration: number; // default slider duration in seconds (5-7s)
  heroSlides: HeroSlide[];

  // About & Contact parameters (existing)
  aboutPhilosophy: string;
  aboutMission: string;
  aboutVision: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  announcementTicker: string;

  // Dynamic About Axes
  aboutAxis1Title: string;
  aboutAxis1Desc: string;
  aboutAxis1Tag: string;
  aboutAxis2Title: string;
  aboutAxis2Desc: string;
  aboutAxis2Tag: string;
  aboutAxis3Title: string;
  aboutAxis3Desc: string;
  aboutAxis3Tag: string;

  // Monthly Programs Content
  program1Title: string;
  program1Desc: string;
  program1BtnText: string;
  program2Title: string;
  program2Desc: string;
  program2BtnWhatsappText: string;
  program2BtnDetailsText: string;

  // Testimonials & FAQs Arrays
  testimonials: Testimonial[];
  faqs: FAQItem[];

  // Final CTA Banner Section
  finalCtaBadge: string;
  finalCtaHeading: string;
  finalCtaDesc: string;
  finalCtaBtn1Text: string;
  finalCtaBtn2Text: string;
}

export const RMA_INTRO_SLIDE: HeroSlide = {
  id: "slide-rma-intro",
  imageUrl: "conference",
  caption: "Who We Are — Right-Minds Africa",
  badge: "WELCOME TO RIGHT-MINDS AFRICA • THINK RIGHT • LIVE RIGHT • LEAD RIGHT",
  headline: "Shaping a Generation to Think Right, Live Right & Lead Right",
  description: "Right-Minds Africa (RMA) is a pan-African leadership, mindset re-engineering, and personal mastery movement dedicated to liberating young Africans from limiting narratives. Before we launch programs or train cohorts, we rebuild the inner architecture of teenagers, undergraduates, corps members, and emerging professionals to lead with character, clarity, and excellence across Africa.",
  primaryButtonText: "Discover Who We Are",
  primaryButtonAction: "about",
  secondaryButtonText: "Join Our Community",
  secondaryButtonAction: "corps_member",
  enabled: true,
  order: 1,
  duration: 10,
  overlayOpacity: 40,
  showEventCard: false
};

const DEFAULT_SLIDES: HeroSlide[] = [
  RMA_INTRO_SLIDE,
  {
    id: "slide-1",
    imageUrl: "yap_conference",
    caption: "YAP Annual Conference",
    badge: "WHAT WE DO • YAP CONFERENCE 2026",
    headline: "Building Africa's Growth Elite",
    description: "Join thousands of purpose-driven young leaders, seasoned mentors, and global speakers in Lagos for the continent's premier summit on corporate navigation, career branding, and personal sovereignty.",
    primaryButtonText: "Register for YAP",
    primaryButtonAction: "student",
    secondaryButtonText: "Explore Summit",
    secondaryButtonAction: "programs-seminar",
    enabled: true,
    order: 2,
    duration: 8,
    overlayOpacity: 45,
    showEventCard: true,
    eventCardTitle: "Flagship Summit",
    eventCardName: "YAP Annual Conference",
    eventCardDate: "Nov 14–15, 2026",
    eventCardLocation: "Mainstage Auditorium, Lagos"
  },
  {
    id: "slide-2",
    imageUrl: "career_bootcamp",
    caption: "CII Career Accelerator",
    badge: "WHAT WE DO • CORPER IMPACT INITIATIVE",
    headline: "Transform Your Service Year Into Global Action",
    description: "Don't let your NYSC year slide into passive waiting. We equip corps members with professional CV workshops, financial sovereignty training, and high-demand digital skills to bridge the post-graduation talent gap.",
    primaryButtonText: "Apply for CII",
    primaryButtonAction: "corps_member",
    secondaryButtonText: "Explore Curriculum",
    secondaryButtonAction: "initiatives-cii",
    enabled: true,
    order: 3,
    duration: 8,
    overlayOpacity: 35,
    showEventCard: true,
    eventCardTitle: "Cohort 6 Applications",
    eventCardName: "CII Leadership Accelerator",
    eventCardDate: "Starts December 2026",
    eventCardLocation: "Virtual Cohorts & Meetups"
  },
  {
    id: "slide-3",
    imageUrl: "auditorium",
    caption: "Personal Reinvention Coaching",
    badge: "WHAT WE DO • MONTHLY REINVENTION PROGRAM",
    headline: "Re-Engineer Your Mind, Focus, and Routines",
    description: "A high-touch monthly coaching and mastermind ecosystem. Audit your weekly progress, dismantle procrastination loops, and build high-agency execution habits under direct expert guidance.",
    primaryButtonText: "Enroll in Reinvention",
    primaryButtonAction: "programs-reinvention",
    secondaryButtonText: "Browse Courses",
    secondaryButtonAction: "courses",
    enabled: true,
    order: 4,
    duration: 8,
    overlayOpacity: 40,
    showEventCard: false
  },
  {
    id: "slide-4",
    imageUrl: "teens_classroom",
    caption: "Right-Minded Teens Initiative",
    badge: "WHAT WE DO • RIGHT-MINDED TEENS INITIATIVE",
    headline: "Nurturing Character & Growth Mindset Early",
    description: "Empowering the next generation with values-based mentorship, productivity tools, and growth-mindset training during their formative high school years.",
    primaryButtonText: "Sponsor a Teen",
    primaryButtonAction: "volunteer",
    secondaryButtonText: "Our Philosophy",
    secondaryButtonAction: "about",
    enabled: true,
    order: 5,
    duration: 8,
    overlayOpacity: 35,
    showEventCard: false
  },
  {
    id: "slide-5",
    imageUrl: "classroom",
    caption: "Monthly Leadership Seminars",
    badge: "WHAT WE DO • MONTHLY LEADERSHIP SEMINARS",
    headline: "Lead with Purpose, Character & Competence",
    description: "Deep-dive cognitive mastery sessions and corporate stamina workshops for undergraduates, young professionals, and corporate leaders aiming for maximum operational efficiency.",
    primaryButtonText: "Attend Next Seminar",
    primaryButtonAction: "programs-seminar",
    secondaryButtonText: "Watch Free Previews",
    secondaryButtonAction: "courses",
    enabled: true,
    order: 6,
    duration: 8,
    overlayOpacity: 35,
    showEventCard: false
  },
  {
    id: "slide-6",
    imageUrl: "conference",
    caption: "G3 Series 2026/2027 (God • Growth • Goals)",
    badge: "WHAT WE DO • G3 SERIES 2026/2027 — THE RELEVANCE QUESTION",
    headline: "The Human Advantage: Who Will You Become in a Changing World?",
    description: "Our annual 5-Saturday developmental programme every Saturday in December 2026 and January 2, 2027—exploring Identity, Skills, Adaptability, Relationships, and Execution through God, Growth, and Goals.",
    primaryButtonText: "Explore G3 Series",
    primaryButtonAction: "initiatives-g3",
    secondaryButtonText: "View Gallery",
    secondaryButtonAction: "gallery",
    enabled: true,
    order: 7,
    duration: 8,
    overlayOpacity: 40,
    showEventCard: true,
    eventCardTitle: "G3 Series 2026/2027",
    eventCardName: "The Relevance Question",
    eventCardDate: "Saturdays in Dec & Jan 2",
    eventCardLocation: "Right-Minds Africa Hub"
  }
];

export function normalizeHeroSlides(slides?: HeroSlide[]): HeroSlide[] {
  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return DEFAULT_SLIDES;
  }

  const hasIntroSlide = slides.some(
    (s) =>
      s.id === "slide-rma-intro" ||
      (s.badge && s.badge.toUpperCase().includes("WELCOME TO RIGHT-MINDS AFRICA")) ||
      (s.headline && s.headline.toLowerCase().includes("think right, live right"))
  );

  let ordered: HeroSlide[];
  if (hasIntroSlide) {
    const intro =
      slides.find(
        (s) =>
          s.id === "slide-rma-intro" ||
          (s.badge && s.badge.toUpperCase().includes("WELCOME TO RIGHT-MINDS AFRICA")) ||
          (s.headline && s.headline.toLowerCase().includes("think right, live right"))
      ) || RMA_INTRO_SLIDE;
    const rest = slides.filter((s) => s !== intro);
    ordered = [{ ...RMA_INTRO_SLIDE, ...intro, enabled: true, order: 1 }, ...rest];
  } else {
    ordered = [RMA_INTRO_SLIDE, ...slides];
  }

  return ordered.map((s, idx) => ({
    ...s,
    order: idx + 1
  }));
}


export const DEFAULT_CMS: CMSConfig = {
  id: "cms-primary",
  heroBadge: "BUILDING AFRICA'S NEXT GENERATION OF LEADERS",
  heroTitle: "Transforming African Minds",
  heroSubtitle: "For Leadership, Innovation & Lasting Impact",
  heroDescription: "We empower teenagers, students, graduates, entrepreneurs and NYSC members with leadership development, digital skills, mentorship and transformational opportunities that prepare them to lead with purpose across Africa.",
  heroButtonLeft: "Join Our Community",
  heroBtnPrimaryText: "Join Our Community",
  heroBtnPrimaryAction: "corps_member", // maps to JoinModal profile trigger, or custom route/view
  heroBtnSecondaryText: "Explore Programs",
  heroBtnSecondaryAction: "programs-seminar",
  heroBtnTertiaryText: "Browse Courses",
  heroBtnTertiaryAction: "courses",

  // Floating Event Card Default
  heroEventTitle: "Upcoming Program",
  heroEventName: "Monthly Reinvention Program",
  heroEventDescription: "An intensive 5-week mindset and productivity masterclass designed to build high-performance, character-driven young African leaders.",
  heroEventDate: "July 5–August 9, 2026",
  heroEventTime: "06:00 PM (GMT+1)",
  heroEventLocation: "Virtual (Interactive Zoom Cohorts)",
  heroEventSlots: 50,
  heroEventCountdownEnabled: true,
  heroEventTargetDate: "2026-07-05",
  heroEventEndDate: "2026-08-09",
  heroEventThumbnail: "",
  heroEventScheduleStart: "2026-07-01",
  heroEventScheduleEnd: "2026-08-10",
  heroEventActionText: "Register for Cohort",
  heroEventActionLink: "corps_member",
  heroEventEnabled: true,

  // Live Impact Statistics
  heroStat1Number: "5,000+",
  heroStat1Label: "Young People Impacted",
  heroStat2Number: "500+",
  heroStat2Label: "NYSC Members Trained",
  heroStat3Number: "150+",
  heroStat3Label: "Mentors & Facilitators",
  heroStat4Number: "50+",
  heroStat4Label: "Programs Conducted",
  heroStat5Number: "15+",
  heroStat5Label: "States Reached",

  // Automatic Background Slider Default Config
  heroAutoplay: true,
  heroDisplayDuration: 6,
  heroSlides: DEFAULT_SLIDES,

  aboutPhilosophy: "Think Right, Live Right, Lead Right. Our framework dismantles limiting patterns, establishes moral EQ, and replaces internal narratives with peak execution goals.",
  aboutMission: "To raise a generation of highly competent, character-driven young Africans who take sovereignty over their careers, finances, and personal callings.",
  aboutVision: "A prosperous, values-centered Africa directed by high-performance young mentors, innovators, and leaders within physical regional chapters.",
  contactEmail: "rightmindsafrica@gmail.com",
  contactPhone: "+234 803 980 9016",
  contactAddress: "Lagos Hub, Oyo Chapter Secretariat, Nigeria",
  announcementTicker: "📢 Continuous goal auditing masterclasses begin this Saturday December 6th in all regional chapters. Complete your dossiers verification immediately!",

  // Dynamic About Axes defaults
  aboutAxis1Title: "Think Right",
  aboutAxis1Desc: "Dismantling negative limiting patterns, retraining mindset confidence, and replacing old narratives with structured growth-oriented logic.",
  aboutAxis1Tag: "🧠 Mindset Re-engineering",
  aboutAxis2Title: "Live Right",
  aboutAxis2Desc: "Character development and system alignment. Creating daily goal-mapping trackers, personal SOP routines, and professional EQ habits.",
  aboutAxis2Tag: "🎯 Intentional Habits",
  aboutAxis3Title: "Lead Right",
  aboutAxis3Desc: "Civic mobilization and remote excellence. Deploying upskilling capabilities to guide local commands, school book donation drives, and workplace agencies.",
  aboutAxis3Tag: "👑 Civic Influence",

  // Monthly Programs Content defaults
  program1Title: "Monthly Leadership Seminar",
  program1Desc: "Deep personal leadership shift, character development, and emotional-intelligence (EQ) masterclasses for undergraduates, emerging leaders, and professionals.",
  program1BtnText: "Register For Seminar",
  program2Title: "Monthly Reinvention Program",
  program2Desc: "Continuous habit audits, dashboard milestone trackers, and daily performance checks to escape procrastination loops under certified coordinators.",
  program2BtnWhatsappText: "Register with WhatsApp",
  program2BtnDetailsText: "View Details Page",

  // Testimonials defaults
  testimonials: [
    {
      id: "test-1",
      name: "Chidem Ebuka",
      role: "Software Engineer Intern",
      quote: "The Corper Impact Initiative (CII) redefined my career mapping during NYSC. I learned remote job prospecting, tailored my LinkedIn, and landed a role right after my Pop out!",
      order: 1,
      enabled: true
    },
    {
      id: "test-2",
      name: "Adebayo Adesina",
      role: "Final Year Student (Unilag)",
      quote: "YAP Conference was an absolute mental shift. Hearing from seasoned speakers who look like me made me realize background limitations don't define excellence.",
      order: 2,
      enabled: true
    },
    {
      id: "test-3",
      name: "Tosin Alabi",
      role: "Secondary School Graduate",
      quote: "Under the Right-Minded Teens mentorship, I discovered essential growth mindset rules. My Waec study approach changed and I cleared WAEC in one sitting.",
      order: 3,
      enabled: true
    }
  ],

  // FAQs defaults
  faqs: [
    {
      id: "faq-1",
      question: "Is Right Minds Africa Hub a religious or political organization?",
      answer: "We are an independent, non-political, vision-driven educational academy. While we focus heavily on purposeful living, moral character development, and general spiritual soundness as fundamentals of leadership, our programs are open to all passionate young Africans searching for a structured growth pathway.",
      order: 1,
      enabled: true
    },
    {
      id: "faq-2",
      question: "How do I register or join the CII (Corper Impact Initiative)?",
      answer: "If you are an active corps member (or about to deploy), you can click on any 'Get Started' button, select 'NYSC Corps Member' or 'Recent Graduate', and complete your registration profile. Approved profiles are automatically boarded into regional cohorts under state leaders.",
      order: 2,
      enabled: true
    },
    {
      id: "faq-3",
      question: "Do you charge fees for your programs or mentorship hubs?",
      answer: "Our core Monthly Leadership Seminars, standard mentoring boards, and Right-Minded Teens circles are 100% free of charge, sponsored by volunteer mentors and patrons. Conversely, high-touch intensive programs (including the Monthly Reinvention Program and regional Summer Bootcamps for Teenagers) involve structured enrollment fees to support personalized notebooks, goal-execution dashboards, and executive coaching slots.",
      order: 3,
      enabled: true
    },
    {
      id: "faq-4",
      question: "Can I join as a Mentor or Volunteer partner?",
      answer: "Absolutely! We welcome young corporate professionals, certified teachers, and post-NYSC graduates who want to give back. Click on 'Contact Us' or access the Careers and Volunteer Application portals in the footer to register your profile with our management board.",
      order: 4,
      enabled: true
    }
  ],

  // Final CTA Banner Section defaults
  finalCtaBadge: "Generational Mandate",
  finalCtaHeading: "Join Africa’s Next Generation of Leaders",
  finalCtaDesc: "Become part of a highly coordinated peer command system. Establish discipline, configure professional standards, and elevate your calling.",
  finalCtaBtn1Text: "Get Started",
  finalCtaBtn2Text: "Contact Us"
};

export function getCMSConfig(): CMSConfig {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rma_cms_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...DEFAULT_CMS, 
          ...parsed,
          heroSlides: normalizeHeroSlides(parsed.heroSlides),
          testimonials: parsed.testimonials && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_CMS.testimonials,
          faqs: parsed.faqs && parsed.faqs.length > 0 ? parsed.faqs : DEFAULT_CMS.faqs
        };
      } catch (e) {
        return DEFAULT_CMS;
      }
    }
  }
  return DEFAULT_CMS;
}

interface AdminCMSProps {
  hasWriteAccess: boolean;
  onLogAction: (msg: string) => void;
}

export default function AdminCMS({ hasWriteAccess, onLogAction }: AdminCMSProps) {
  const [cms, setCms] = useState<CMSConfig>(DEFAULT_CMS);
  const [activeSubTab, setActiveSubTab] = useState<"hero-copy" | "hero-slider" | "hero-event" | "hero-stats" | "about" | "contact" | "announcements" | "about-axes" | "monthly-programs" | "testimonials" | "faqs" | "final-cta">("hero-copy");
  const [successMsg, setSuccessMsg] = useState("");
  const [saveStatus, setSaveStatus] = useState<"" | "Saving..." | "Syncing Cloud..." | "Success">("");
  
  // Local state for adding preloaded images popup
  const [showPreloadedSelector, setShowPreloadedSelector] = useState(false);
  // Sandbox preview slide state
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null);

  const [isSeedingDatabase, setIsSeedingDatabase] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Initial fetch from Supabase (or memory fallback)
    fetchAllCMSFromSupabase().then((data) => {
      if (data && data.cmsConfig) {
        setCms(data.cmsConfig);
      }
    }).catch(() => {
      setCms(getCMSConfig());
    });

    const handleUpdate = () => {
      setCms(getCMSConfig());
    };
    window.addEventListener("rma_cms_updated", handleUpdate);
    window.addEventListener("rma_supabase_cms_updated", handleUpdate);
    return () => {
      window.removeEventListener("rma_cms_updated", handleUpdate);
      window.removeEventListener("rma_supabase_cms_updated", handleUpdate);
    };
  }, []);

  // One-time Seed Database Handler
  const handleSeedDatabase = async () => {
    if (!hasWriteAccess) return;
    setIsSeedingDatabase(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await seedSupabaseDatabase({ cms });
      if (res.success) {
        setSuccessMsg(res.message);
        onLogAction(`🌱 [SUPABASE SEED] ${res.message}`);
      } else {
        setErrorMsg(res.message);
        onLogAction(`⚠️ [SUPABASE SEED ERROR] ${res.message}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to seed database");
    } finally {
      setIsSeedingDatabase(false);
    }
  };

  // Sandbox slider preview simulation effect
  useEffect(() => {
    if (!cms.heroAutoplay || cms.heroSlides.length === 0) return;
    const activeSlides = cms.heroSlides.filter(s => s.enabled);
    if (activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setPreviewSlideIdx(prev => (prev + 1) % activeSlides.length);
    }, (cms.heroDisplayDuration || 6) * 1000);

    return () => clearInterval(interval);
  }, [cms.heroAutoplay, cms.heroSlides, cms.heroDisplayDuration]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return;

    setSaveStatus("Saving...");
    setErrorMsg("");
    try {
      setSaveStatus("Syncing Cloud...");
      // Re-calculate slide orders
      const sortedSlides = [...cms.heroSlides].map((slide, index) => ({
        ...slide,
        order: index + 1
      }));
      
      const finalConfig = {
        ...cms,
        heroSlides: sortedSlides
      };

      // 1. Save to Supabase (primary cross-device database)
      const supaResult = await saveCMSConfigToSupabase(finalConfig);

      // 2. Also keep fallback local & firestore in sync
      await saveCMSConfig(finalConfig);
      
      if (!supaResult.success) {
        setErrorMsg(`Failed saving to Supabase: ${supaResult.error}`);
        onLogAction(`❌ [CMS ERROR] Supabase error: ${supaResult.error}`);
        setSaveStatus("");
      } else {
        onLogAction(`🛠️ [HERO CMS REDESIGN] Saved changes to Supabase & Live Server. Configured ${sortedSlides.length} slides.`);
        setSaveStatus("Success");
        setSuccessMsg("Changes saved to Supabase database successfully! All visitors and devices now see this content.");
        setTimeout(() => {
          setSaveStatus("");
          setSuccessMsg("");
        }, 4000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while saving.");
      setSaveStatus("");
    }
  };

  const handleRestoreDefaults = async () => {
    if (!hasWriteAccess) return;
    if (confirm("Reset layout text configurations and default slideshow back to hardcoded defaults? All custom images will be reset.")) {
      setCms(DEFAULT_CMS);
      await saveCMSConfig(DEFAULT_CMS);
      onLogAction(`🛠️ [CMS DEFAULTS RESTORED] Reset entire website Hero configuration to default state.`);
      setSuccessMsg("Restored original Hero Redesign configurations successfully.");
      setPreviewSlideIdx(0);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Slideshow Operations
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Image must be smaller than 15MB limit.");
      return;
    }

    setIsUploadingImage(true);
    let resolvedImageUrl = "";

    // If Supabase Storage is configured, upload to 'cms-media' bucket
    if (isSupabaseConfigured) {
      onLogAction(`☁️ [SUPABASE STORAGE] Uploading "${file.name}" to public bucket "cms-media"...`);
      const { url, error } = await uploadImageToSupabase(file, "cms-media");
      if (error) {
        onLogAction(`⚠️ [SUPABASE STORAGE] Bucket upload warning: ${error}. Falling back to base64 encoding.`);
      } else if (url) {
        resolvedImageUrl = url;
        onLogAction(`✅ [SUPABASE STORAGE] File uploaded successfully! Public URL saved: ${url}`);
      }
    }

    const finalizeSlide = (imgSrc: string) => {
      const newSlide: HeroSlide = {
        id: `slide-custom-${Date.now()}`,
        imageUrl: imgSrc,
        caption: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        enabled: true,
        order: cms.heroSlides.length + 1,
        duration: cms.heroDisplayDuration || 6,
        badge: "NEW OPPORTUNITY",
        headline: "Join Right Minds Africa",
        description: "Equipping young Africans with purpose, character, leadership competency and high-income skill development.",
        primaryButtonText: "Join Community",
        primaryButtonAction: "corps_member",
        secondaryButtonText: "Explore Programs",
        secondaryButtonAction: "programs-seminar",
        overlayOpacity: 35,
        showEventCard: false
      };

      setCms(prev => ({
        ...prev,
        heroSlides: [...prev.heroSlides, newSlide]
      }));

      setIsUploadingImage(false);
      onLogAction(`📤 [HERO SLIDER] Added slide "${file.name}" with public image storage.`);
    };

    if (resolvedImageUrl) {
      finalizeSlide(resolvedImageUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        finalizeSlide(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Clear input
    e.target.value = "";
  };

  const handleAddPreloadedImage = (key: string) => {
    const newSlide: HeroSlide = {
      id: `slide-preloaded-${Date.now()}`,
      imageUrl: key,
      caption: PRELOADED_HERO_LABELS[key],
      enabled: true,
      order: cms.heroSlides.length + 1,
      duration: cms.heroDisplayDuration || 6,
      badge: "NEW OPPORTUNITY",
      headline: "Join Right Minds Africa",
      description: "Equipping young Africans with purpose, character, leadership competency and high-income skill development.",
      primaryButtonText: "Join Community",
      primaryButtonAction: "corps_member",
      secondaryButtonText: "Explore Programs",
      secondaryButtonAction: "programs-seminar",
      overlayOpacity: 35,
      showEventCard: false
    };

    setCms(prev => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide]
    }));

    setShowPreloadedSelector(false);
    onLogAction(`🎨 [HERO SLIDER] Appended preloaded asset "${PRELOADED_HERO_LABELS[key]}" to slides.`);
  };

  const handleDeleteSlide = (id: string) => {
    setCms(prev => {
      const remaining = prev.heroSlides.filter(s => s.id !== id);
      return {
        ...prev,
        heroSlides: remaining
      };
    });
    onLogAction(`🗑️ [HERO SLIDER] Removed slide ID: ${id}`);
    setPreviewSlideIdx(0);
  };

  const handleToggleSlideEnabled = (id: string) => {
    setCms(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  const handleMoveSlide = (idx: number, direction: "up" | "down") => {
    const slides = [...cms.heroSlides];
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === slides.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const temp = slides[idx];
    slides[idx] = slides[targetIdx];
    slides[targetIdx] = temp;

    setCms(prev => ({
      ...prev,
      heroSlides: slides
    }));
  };

  const handleUpdateSlideField = (id: string, field: keyof HeroSlide, value: any) => {
    setCms(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  // Helper to render image source correctly (preloaded key vs base64/URL)
  const getSlideImageSrc = (imgUrl: string) => {
    if (PRELOADED_HERO_IMAGES[imgUrl]) {
      return PRELOADED_HERO_IMAGES[imgUrl];
    }
    return imgUrl;
  };

  const activeSlidesForPreview = cms.heroSlides.filter(s => s.enabled);
  const currentPreviewSlide = activeSlidesForPreview[previewSlideIdx] || activeSlidesForPreview[0];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders size={18} className="text-[#103D2E]" />
            RMA & CII Premium Hero Section Manager
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
            Modify unlimited slideshow layers, adjust cinematic typography size, configure live event cards, and dynamic statistics
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasWriteAccess && (
            <button
              onClick={handleSeedDatabase}
              disabled={isSeedingDatabase}
              type="button"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="Upload existing default CMS data into Supabase tables"
            >
              <Database size={11} className={isSeedingDatabase ? "animate-spin" : ""} />
              {isSeedingDatabase ? "Seeding..." : "Seed Database"}
            </button>
          )}

          {hasWriteAccess && (
            <button
              onClick={handleRestoreDefaults}
              type="button"
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-600 rounded-xl text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={11} />
              Reset Hero Defaults
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center justify-between gap-1.5 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-rose-500 hover:text-rose-700 text-xs font-mono">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-850 font-bold flex items-center gap-1.5 text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Settings Sidebar vs Dynamic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sub-Tab Sidebar Navigation */}
        <div className="bg-white p-3 rounded-2xl border border-slate-150 space-y-1 shadow-sm">
          <div className="px-3 py-1 text-[8px] font-black uppercase text-slate-400 tracking-widest font-mono">
            REDESIGNED HERO SECTIONS
          </div>
          {[
            { id: "hero-copy" as const, label: "1. Brand Copy & CTAs", icon: FileText },
            { id: "hero-slider" as const, label: "2. Slideshow Manager", icon: ImageIcon },
            { id: "hero-event" as const, label: "3. Floating Event Card", icon: Calendar },
            { id: "hero-stats" as const, label: "4. Live Impact Stats", icon: BarChart3 },
          ].map((sub) => {
            const Icon = sub.icon;
            const isSelected = activeSubTab === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubTab(sub.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-left ${
                  isSelected 
                    ? "bg-[#103D2E] text-[#E9C46A]" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-[#E9C46A] font-extrabold" : "text-slate-400 shrink-0"} />
                {sub.label}
              </button>
            );
          })}

          <div className="px-3 pt-3 pb-1 text-[8px] font-black uppercase text-slate-400 tracking-widest font-mono border-t border-slate-100 mt-2">
            OTHER HOME SECTIONS
          </div>
          {[
            { id: "about" as const, label: "Mission & Philosophy", icon: Users },
            { id: "about-axes" as const, label: "Framework (Three Axes)", icon: Sliders },
            { id: "monthly-programs" as const, label: "Monthly Programs Info", icon: Calendar },
            { id: "testimonials" as const, label: "Testimonials (Reviews)", icon: Users },
            { id: "faqs" as const, label: "FAQ Accordions", icon: HelpCircle },
            { id: "final-cta" as const, label: "Final Call To Action", icon: Sparkles },
            { id: "contact" as const, label: "Contact Details", icon: Phone },
            { id: "announcements" as const, label: "Ticker Notice Bar", icon: Sparkles }
          ].map((sub) => {
            const Icon = sub.icon;
            const isSelected = activeSubTab === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubTab(sub.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-left ${
                  isSelected 
                    ? "bg-[#103D2E] text-[#E9C46A]" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-[#E9C46A]" : "text-slate-400 shrink-0"} />
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* Content Configuration Form Area */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6 text-xs font-medium">
            
            {/* 1. BRAND COPY & CTAS */}
            {activeSubTab === "hero-copy" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <FileText size={16} />
                    Brand Copy & Typography Hierarchy Controls
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Configure the main headlines, badges, descriptions, and custom buttons with responsive styles
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Hero Upper Badge Text (e.g. BUILDING AFRICA'S NEXT GENERATION OF LEADERS):
                    </label>
                    <input
                      type="text"
                      value={cms.heroBadge}
                      onChange={(e) => setCms(prev => ({ ...prev, heroBadge: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-semibold"
                      placeholder="e.g. BUILDING AFRICA'S NEXT GENERATION OF LEADERS"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Hero Primary Heading Main Line (Extra Bold 72px–88px on Desktop):
                    </label>
                    <input
                      type="text"
                      value={cms.heroTitle}
                      onChange={(e) => setCms(prev => ({ ...prev, heroTitle: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-bold text-[#103D2E]"
                      placeholder="e.g. Transforming African Minds"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Hero Accent Heading (Highlighted with orange brand accent color):
                    </label>
                    <input
                      type="text"
                      value={cms.heroSubtitle}
                      onChange={(e) => setCms(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all font-bold text-[#E76F51]"
                      placeholder="e.g. For Leadership, Innovation & Lasting Impact"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Hero Central Supporting Description Block (20px–22px text readability):
                    </label>
                    <textarea
                      rows={4}
                      value={cms.heroDescription}
                      onChange={(e) => setCms(prev => ({ ...prev, heroDescription: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none transition-all resize-none leading-relaxed"
                      placeholder="Describe the organization's overarching purpose and target audience..."
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                      <MousePointerClick size={12} />
                      CTA Premium Navigation Buttons (Hover Animations Enabled)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-black text-[#E76F51] uppercase font-mono block mb-2">
                          Primary Button (Solid Green Style)
                        </span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={cms.heroBtnPrimaryText}
                            onChange={(e) => setCms(prev => ({ ...prev, heroBtnPrimaryText: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                            placeholder="Label text"
                          />
                          <select
                            value={cms.heroBtnPrimaryAction}
                            onChange={(e) => setCms(prev => ({ ...prev, heroBtnPrimaryAction: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[10px]"
                          >
                            <option value="corps_member">Join Cohort (Corps Member)</option>
                            <option value="student">Join Cohort (Student)</option>
                            <option value="teen">Join Cohort (Teenager)</option>
                            <option value="mentor">Apply as Mentor</option>
                            <option value="courses">LMS Courses Catalog</option>
                            <option value="programs-seminar">Explore Programs suite</option>
                            <option value="initiatives-cii">Corper Impact Initiative (CII)</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-black text-slate-650 uppercase font-mono block mb-2">
                          Secondary Button (Elegant White Outline)
                        </span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={cms.heroBtnSecondaryText}
                            onChange={(e) => setCms(prev => ({ ...prev, heroBtnSecondaryText: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                            placeholder="Label text"
                          />
                          <select
                            value={cms.heroBtnSecondaryAction}
                            onChange={(e) => setCms(prev => ({ ...prev, heroBtnSecondaryAction: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[10px]"
                          >
                            <option value="programs-seminar">Explore Programs suite</option>
                            <option value="courses">LMS Courses Catalog</option>
                            <option value="initiatives-cii">Corper Impact Initiative (CII)</option>
                            <option value="corps_member">Join Cohort (Corps Member)</option>
                            <option value="student">Join Cohort (Student)</option>
                            <option value="mentor">Apply as Mentor</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-black text-slate-650 uppercase font-mono block mb-2">
                          Tertiary Button (Subtle Text Highlight Link)
                        </span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={cms.heroBtnTertiaryText}
                            onChange={(e) => setCms(prev => ({ ...prev, heroBtnTertiaryText: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                            placeholder="Label text"
                          />
                          <select
                            value={cms.heroBtnTertiaryAction}
                            onChange={(e) => setCms(prev => ({ ...prev, heroBtnTertiaryAction: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[10px]"
                          >
                            <option value="courses">LMS Courses Catalog</option>
                            <option value="programs-seminar">Explore Programs suite</option>
                            <option value="initiatives-cii">Corper Impact Initiative (CII)</option>
                            <option value="corps_member">Join Cohort (Corps Member)</option>
                            <option value="student">Join Cohort (Student)</option>
                            <option value="mentor">Apply as Mentor</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. AUTOMATIC BACKGROUND SLIDER MANAGER */}
            {activeSubTab === "hero-slider" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <ImageIcon size={16} />
                    Cinematic Background Slideshow & Scheduler
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Provide unlimited background layers, reorder slideshow order, enable/disable slides, or schedule activation periods
                  </p>
                </div>

                {/* Slideshow General Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Slider Autoplay State:
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="autoplay"
                          checked={cms.heroAutoplay}
                          onChange={() => setCms(prev => ({ ...prev, heroAutoplay: true }))}
                          className="accent-[#103D2E] h-3.5 w-3.5"
                        />
                        <span className="font-extrabold uppercase text-[10px] text-[#103D2E] flex items-center gap-1"><Play size={10} /> Active Auto</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="autoplay"
                          checked={!cms.heroAutoplay}
                          onChange={() => setCms(prev => ({ ...prev, heroAutoplay: false }))}
                          className="accent-[#103D2E] h-3.5 w-3.5"
                        />
                        <span className="font-extrabold uppercase text-[10px] text-slate-500 flex items-center gap-1"><Pause size={10} /> Paused / Manual</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                      Default Transition Interval Display Duration (Seconds):
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min={3}
                        max={15}
                        value={cms.heroDisplayDuration}
                        onChange={(e) => setCms(prev => ({ ...prev, heroDisplayDuration: Math.max(3, parseInt(e.target.value) || 6) }))}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-black text-center"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Seconds per slide (Recommended: 5–7s)</span>
                    </div>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="relative">
                    <input
                      type="file"
                      id="hero-file-upload-input"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="hero-file-upload-input"
                      className="px-3 py-2 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-300 font-black rounded-xl text-2xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={12} className="stroke-[2.5]" />
                      Upload Custom Slide Image
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPreloadedSelector(prev => !prev)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-205 text-slate-600 font-bold rounded-xl text-2xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    <ImageIcon size={12} />
                    Choose Preloaded Event Photo
                  </button>
                </div>

                {/* Preloaded Photo Selections Overlay Grid */}
                {showPreloadedSelector && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fadeIn space-y-3">
                    <span className="text-[8px] font-black uppercase text-slate-400 font-mono tracking-widest block border-b pb-1.5">
                      Available actual RMA / CII event photographs:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.keys(PRELOADED_HERO_IMAGES).map((key) => (
                        <div 
                          key={key}
                          onClick={() => handleAddPreloadedImage(key)}
                          className="group relative cursor-pointer border-2 border-transparent hover:border-[#103D2E] bg-white rounded-xl overflow-hidden aspect-video transition-all shadow-xs"
                        >
                          <img 
                            src={PRELOADED_HERO_IMAGES[key]} 
                            alt={key} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-350"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-[8px] font-bold text-white truncate text-center font-mono">
                            {PRELOADED_HERO_LABELS[key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Slides Manager List */}
                <div className="space-y-3.5 pt-3">
                  <span className="text-[8px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                    Manage Slide Stack Order, Schedule & Active Visibility ({cms.heroSlides.length} total slides):
                  </span>

                  {cms.heroSlides.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-400 font-semibold border-2 border-dashed border-slate-200">
                      No slides currently configured. Please upload a file or select a preloaded event photograph to start!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {cms.heroSlides.map((slide, idx) => {
                        const imgSrc = getSlideImageSrc(slide.imageUrl);
                        return (
                          <div 
                            key={slide.id}
                            className={`p-4 bg-white border rounded-2xl flex flex-col gap-3 transition-all hover:border-slate-300 ${
                              slide.enabled ? "border-slate-150" : "border-slate-100 opacity-60 bg-slate-50/50"
                            }`}
                          >
                            {/* Top Row info, schedule & main actions */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
                              <div className="flex items-center gap-3 w-full lg:w-auto">
                                <div className="relative w-16 h-10 rounded-lg overflow-hidden border shrink-0 bg-slate-900">
                                  <img 
                                    src={imgSrc} 
                                    alt="Slide preview" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-0.5 left-0.5 bg-black/60 text-[8px] font-black text-white px-1 rounded-sm">
                                    #{idx + 1}
                                  </div>
                                </div>
                                
                                <div className="text-left min-w-0 flex-1">
                                  <input
                                    type="text"
                                    value={slide.caption}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "caption", e.target.value)}
                                    className="font-bold text-[11px] text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#103D2E] outline-none w-full truncate"
                                    placeholder="Slide caption/label"
                                  />
                                  <span className="text-[8px] font-mono uppercase text-slate-400 block mt-0.5 truncate">
                                    Source: {slide.imageUrl.startsWith("data:") ? "Uploaded local binary stream (base64)" : `Preloaded asset "${slide.imageUrl}"`}
                                  </span>
                                </div>
                              </div>

                              {/* Scheduling, display timer and controls */}
                              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                                {/* Display schedule dates if desired */}
                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-150 text-[10px] text-slate-500 font-bold font-mono">
                                  <Clock size={11} className="text-slate-400" />
                                  <span>Schedule:</span>
                                  <input
                                    type="date"
                                    value={slide.scheduleStart || ""}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "scheduleStart", e.target.value)}
                                    className="bg-transparent outline-none w-20 text-[9px]"
                                    placeholder="Start date"
                                  />
                                  <span className="text-[8px]">to</span>
                                  <input
                                    type="date"
                                    value={slide.scheduleEnd || ""}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "scheduleEnd", e.target.value)}
                                    className="bg-transparent outline-none w-20 text-[9px]"
                                    placeholder="End date"
                                  />
                                </div>

                                {/* Custom slide duration override */}
                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-150 text-[10px] text-slate-500 font-bold font-mono">
                                  <span>Time:</span>
                                  <input
                                    type="number"
                                    min={3}
                                    max={20}
                                    value={slide.duration || cms.heroDisplayDuration}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "duration", Math.max(3, parseInt(e.target.value) || 6))}
                                    className="bg-white border text-center font-black w-10 text-[9px] rounded-md py-0.5 outline-none"
                                  />
                                  <span>s</span>
                                </div>

                                {/* Reordering buttons */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveSlide(idx, "up")}
                                    className="p-1 text-slate-400 hover:text-slate-650 disabled:opacity-30 hover:bg-slate-50 rounded-lg"
                                    title="Move Up"
                                  >
                                    <ChevronUp size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === cms.heroSlides.length - 1}
                                    onClick={() => handleMoveSlide(idx, "down")}
                                    className="p-1 text-slate-400 hover:text-slate-650 disabled:opacity-30 hover:bg-slate-50 rounded-lg"
                                    title="Move Down"
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                </div>

                                {/* Toggle content edit panel */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedSlideId(expandedSlideId === slide.id ? null : slide.id)}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                                    expandedSlideId === slide.id 
                                      ? "bg-amber-100 border-amber-200 text-amber-800 font-bold" 
                                      : "bg-slate-50 border-slate-205 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {expandedSlideId === slide.id ? "Close Content Editor" : "Edit Slide Content"}
                                </button>

                                {/* Toggle active state */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlideEnabled(slide.id)}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                                    slide.enabled 
                                      ? "bg-emerald-50 border-emerald-150 text-emerald-650" 
                                      : "bg-slate-100 border-slate-200 text-slate-450"
                                  }`}
                                >
                                  {slide.enabled ? "Enabled" : "Disabled"}
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlide(slide.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Delete Slide"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Collapsible Content Editor Form Panel */}
                            {expandedSlideId === slide.id && (
                              <div className="w-full mt-3 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn text-left text-xs text-slate-600">
                                
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                    Slide Upper Badge (e.g. CORPER IMPACT INITIATIVE):
                                  </label>
                                  <input
                                    type="text"
                                    value={slide.badge || ""}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "badge", e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[10px] outline-none focus:bg-white"
                                    placeholder="e.g. CORPER IMPACT INITIATIVE"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                    Slide Headline (Main Line):
                                  </label>
                                  <input
                                    type="text"
                                    value={slide.headline || ""}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "headline", e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[10px] outline-none focus:bg-white text-[#103D2E]"
                                    placeholder="e.g. Transform Your Service Year"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                    Slide Description Paragraph:
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={slide.description || ""}
                                    onChange={(e) => handleUpdateSlideField(slide.id, "description", e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] outline-none focus:bg-white resize-none"
                                    placeholder="Describe this aspect of Right Minds Africa's impact story..."
                                  />
                                </div>

                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                  <span className="text-[9px] font-black text-[#E76F51] uppercase font-mono block mb-1.5">
                                    Primary Button Config
                                  </span>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={slide.primaryButtonText || ""}
                                      onChange={(e) => handleUpdateSlideField(slide.id, "primaryButtonText", e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold outline-none"
                                      placeholder="Label"
                                    />
                                    <select
                                      value={slide.primaryButtonAction || ""}
                                      onChange={(e) => handleUpdateSlideField(slide.id, "primaryButtonAction", e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold outline-none"
                                    >
                                      <option value="corps_member">Join Cohort (Corps Member)</option>
                                      <option value="student">Join Cohort (Student)</option>
                                      <option value="teen">Join Cohort (Teenager)</option>
                                      <option value="mentor">Apply as Mentor</option>
                                      <option value="courses">LMS Courses Catalog</option>
                                      <option value="programs-seminar">Explore Programs</option>
                                      <option value="initiatives-cii">CII Section</option>
                                      <option value="programs-reinvention">Monthly Reinvention</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                  <span className="text-[9px] font-black text-slate-650 uppercase font-mono block mb-1.5">
                                    Secondary Button Config
                                  </span>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={slide.secondaryButtonText || ""}
                                      onChange={(e) => handleUpdateSlideField(slide.id, "secondaryButtonText", e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold outline-none"
                                      placeholder="Label"
                                    />
                                    <select
                                      value={slide.secondaryButtonAction || ""}
                                      onChange={(e) => handleUpdateSlideField(slide.id, "secondaryButtonAction", e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold outline-none"
                                    >
                                      <option value="programs-seminar">Explore Programs</option>
                                      <option value="courses">LMS Courses Catalog</option>
                                      <option value="initiatives-cii">CII Section</option>
                                      <option value="corps_member">Join Cohort (Corps Member)</option>
                                      <option value="student">Join Cohort (Student)</option>
                                      <option value="mentor">Apply as Mentor</option>
                                      <option value="about">About RMA</option>
                                      <option value="gallery">Gallery</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                    Adaptive Overlay Opacity: {slide.overlayOpacity ?? 30}%
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="range"
                                      min="0"
                                      max="95"
                                      step="5"
                                      value={slide.overlayOpacity ?? 30}
                                      onChange={(e) => handleUpdateSlideField(slide.id, "overlayOpacity", parseInt(e.target.value))}
                                      className="w-full accent-[#103D2E]"
                                    />
                                  </div>
                                </div>

                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                  <div>
                                    <span className="font-extrabold text-[10px] text-slate-700 block">Show Floating Event Card:</span>
                                    <span className="text-[8px] text-slate-400 block uppercase font-mono">Toggle event card on this slide</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSlideField(slide.id, "showEventCard", !slide.showEventCard)}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                                      slide.showEventCard 
                                        ? "bg-[#103D2E] border-[#103D2E] text-amber-300" 
                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                                  >
                                    {slide.showEventCard ? "Showing" : "Hidden"}
                                  </button>
                                </div>

                                {slide.showEventCard && (
                                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 animate-fadeIn mt-1">
                                    <span className="md:col-span-2 text-[9px] font-black text-amber-800 uppercase font-mono flex items-center gap-1.5 border-b border-amber-100 pb-1 mb-1">
                                      <Sparkles size={11} className="text-[#E76F51]" />
                                      Event Card Override For This Slide
                                    </span>
                                    <div>
                                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                        Card Title Tag (e.g. Upcoming Program):
                                      </label>
                                      <input
                                        type="text"
                                        value={slide.eventCardTitle ?? "Upcoming Program"}
                                        onChange={(e) => handleUpdateSlideField(slide.id, "eventCardTitle", e.target.value)}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] outline-none"
                                        placeholder="e.g. Upcoming Program"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                        Program Name (e.g. Monthly Reinvention Program):
                                      </label>
                                      <input
                                        type="text"
                                        value={slide.eventCardName ?? "Monthly Reinvention Program"}
                                        onChange={(e) => handleUpdateSlideField(slide.id, "eventCardName", e.target.value)}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] outline-none"
                                        placeholder="e.g. Monthly Reinvention Program"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                        Date Interval (e.g. July 5–August 9, 2026):
                                      </label>
                                      <input
                                        type="text"
                                        value={slide.eventCardDate ?? "July 5–August 9, 2026"}
                                        onChange={(e) => handleUpdateSlideField(slide.id, "eventCardDate", e.target.value)}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] outline-none"
                                        placeholder="e.g. July 5–August 9, 2026"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                                        Location / Venue (e.g. Virtual Zoom Cohorts):
                                      </label>
                                      <input
                                        type="text"
                                        value={slide.eventCardLocation ?? "Virtual (Interactive Zoom Cohorts)"}
                                        onChange={(e) => handleUpdateSlideField(slide.id, "eventCardLocation", e.target.value)}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] outline-none"
                                        placeholder="e.g. Virtual"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. FLOATING EVENT CARD CONFIGURATION */}
            {activeSubTab === "hero-event" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <Calendar size={16} />
                    Floating Glassmorphism Event Card Manager & Scheduler
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Configure and schedule the dynamic upcoming program card floating on the right side of the Hero section.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-[11px] text-slate-700 block">Enable Upcoming Program Feature Card:</span>
                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5 uppercase">Toggle whether the Glassmorphism promo card should float on the Hero right side</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCms(prev => ({ ...prev, heroEventEnabled: !prev.heroEventEnabled }))}
                    className={`px-4 py-1.5 rounded-xl text-2xs font-black uppercase tracking-wider border cursor-pointer transition-all ${
                      cms.heroEventEnabled
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-100 border-slate-205 text-slate-500"
                    }`}
                  >
                    {cms.heroEventEnabled ? "Visible" : "Hidden"}
                  </button>
                </div>

                {cms.heroEventEnabled && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
                    
                    {/* Event Form Settings - Left Column (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4 shadow-2xs">
                        <h4 className="text-2xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                          <Wrench size={12} /> Event Card Content Settings
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Card Badge Text (e.g. Upcoming Event, Registration Open):
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventTitle || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventTitle: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-semibold text-slate-800"
                              placeholder="e.g. Upcoming Event"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Program Title / Headline:
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventName || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventName: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold text-slate-800"
                              placeholder="e.g. Monthly Reinvention Program"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                            Short Supporting Description (Maximum 2 Lines):
                          </label>
                          <textarea
                            rows={2}
                            value={cms.heroEventDescription || ""}
                            onChange={(e) => setCms(prev => ({ ...prev, heroEventDescription: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-medium text-slate-700 text-xs"
                            placeholder="Join hundreds of corps members and young professionals for an intensive leadership experience..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Event Date Label:
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventDate || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventDate: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-semibold text-slate-850"
                              placeholder="e.g. August 15–17, 2026"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Event Time Label:
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventTime || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventTime: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-semibold text-slate-850"
                              placeholder="e.g. 09:00 AM (GMT+1)"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Event Venue / Location:
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventLocation || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventLocation: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-semibold text-slate-850"
                              placeholder="e.g. Hybrid (Virtual & Physical)"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Available Admission Slots:
                            </label>
                            <input
                              type="number"
                              value={cms.heroEventSlots || 0}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventSlots: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold text-slate-850"
                              placeholder="e.g. 120"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Action Button Label:
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventActionText || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventActionText: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold text-slate-850"
                              placeholder="e.g. Register Now"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Button Action Destination:
                            </label>
                            <select
                              value={cms.heroEventActionLink || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventActionLink: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none text-xs font-semibold"
                            >
                              <option value="cii">Corper Impact Initiative Page (CII)</option>
                              <option value="corps_member">Join Cohort (Corps Member)</option>
                              <option value="student">Join Cohort (Student)</option>
                              <option value="teen">Join Cohort (Teenager)</option>
                              <option value="courses">LMS Courses Suite</option>
                              <option value="programs-seminar">General Seminars Page</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Optional Thumbnail URL / Resource Path:
                            </label>
                            <input
                              type="text"
                              value={cms.heroEventThumbnail || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventThumbnail: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-mono text-[10px]"
                              placeholder="e.g. https://... or leave empty"
                            />
                          </div>

                          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-150">
                            <div>
                              <span className="font-extrabold text-[10px] text-slate-700 block">Enable Countdown:</span>
                              <span className="text-[8px] text-slate-400 font-mono uppercase">Display Days Countdown Banner</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCms(prev => ({ ...prev, heroEventCountdownEnabled: !prev.heroEventCountdownEnabled }))}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                                cms.heroEventCountdownEnabled
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : "bg-slate-100 border-slate-200 text-slate-500"
                              }`}
                            >
                              {cms.heroEventCountdownEnabled ? "Countdown On" : "No Countdown"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Scheduling & Automation Sub-Card */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4 shadow-2xs">
                        <h4 className="text-2xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                          <Clock size={12} /> Smart Scheduling & Automation Rules
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Target Event Start Date (YYYY-MM-DD):
                            </label>
                            <input
                              type="date"
                              value={cms.heroEventTargetDate || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventTargetDate: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Event End Date (YYYY-MM-DD):
                            </label>
                            <input
                              type="date"
                              value={cms.heroEventEndDate || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventEndDate: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Visibility Start (YYYY-MM-DD):
                            </label>
                            <input
                              type="date"
                              value={cms.heroEventScheduleStart || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventScheduleStart: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">
                              Visibility End / Auto-Hide (YYYY-MM-DD):
                            </label>
                            <input
                              type="date"
                              value={cms.heroEventScheduleEnd || ""}
                              onChange={(e) => setCms(prev => ({ ...prev, heroEventScheduleEnd: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-mono text-xs"
                            />
                          </div>

                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <span className="text-[8px] uppercase font-mono font-bold text-indigo-600">Automation Engine Status:</span>
                            <span className="text-[10px] text-slate-600 font-semibold mt-0.5">
                              {(() => {
                                const today = new Date().toISOString().split("T")[0];
                                const start = cms.heroEventScheduleStart;
                                const end = cms.heroEventScheduleEnd;
                                const target = cms.heroEventTargetDate;
                                
                                if (start && today < start) return `Inactive (Will publish on ${start})`;
                                if (end && today > end) return "Expired (Hidden from public Hero)";
                                if (target && today === target) return "Active: Ongoing Event mode";
                                if (target && today > target) return "Active: event has passed";
                                return "Active: Showing Upcoming Countdown";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Card Live Preview - Right Column (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <div className="w-full sticky top-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 w-full">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <Eye size={12} className="text-emerald-500" /> Real-time Interactive Preview
                          </span>
                          <span className="text-[8px] font-semibold text-slate-300 font-mono">Live Sync</span>
                        </div>

                        {/* HIGH FIDELITY SIMULATION OF GLASSMORPHISM EVENT FEATURE CARD */}
                        <div className="w-full p-8 rounded-3xl bg-slate-950 border border-slate-900 overflow-hidden relative min-h-[420px] flex flex-col justify-center shadow-xl">
                          
                          {/* Background atmosphere simulation */}
                          <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-xs" style={{ backgroundImage: `url(${imgAuditorium})` }} />
                          <div className="absolute inset-0 bg-slate-950/70" />

                          {/* Float Card component preview */}
                          <div className="relative z-10 w-full bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                            
                            {/* Card badge text */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-orange text-[9px] font-black uppercase tracking-widest text-white font-mono shadow-md">
                              <Sparkles size={10} /> {(() => {
                                const today = new Date().toISOString().split("T")[0];
                                const target = cms.heroEventTargetDate;
                                if (target) {
                                  if (today === target) return "Ongoing Event";
                                  if (today > target) return "Ongoing Event";
                                  const diffTime = new Date(target).getTime() - new Date(today).getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  if (diffDays > 0) return `${cms.heroEventTitle || "Upcoming Event"}`;
                                }
                                return cms.heroEventTitle || "Upcoming Event";
                              })()}
                            </div>

                            {/* Program Title */}
                            <h3 className="text-lg font-bold uppercase tracking-tight text-white mt-4 leading-tight">
                              {cms.heroEventName || "Monthly Reinvention Program"}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-300 text-2xs mt-2 leading-relaxed font-normal line-clamp-2">
                              {cms.heroEventDescription || "An intensive 5-week mindset and productivity masterclass designed to build high-performance, character-driven young African leaders."}
                            </p>

                            {/* Divider line */}
                            <div className="w-10 h-0.5 bg-brand-orange rounded my-3" />

                            {/* Event details with icons */}
                            <div className="space-y-2 text-2xs text-slate-300 font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-brand-orange shrink-0" />
                                <span>{cms.heroEventDate || "July 5–August 9, 2026"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-brand-orange shrink-0" />
                                <span>{cms.heroEventTime || "06:00 PM (GMT+1)"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={12} className="text-brand-orange shrink-0" />
                                <span>{cms.heroEventLocation || "Virtual (Interactive Zoom Cohorts)"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={12} className="text-brand-orange shrink-0" />
                                <span>Available Admission Slots: <strong className="text-brand-gold font-mono">{cms.heroEventSlots || 50} Seats Left</strong></span>
                              </div>
                            </div>

                            {/* Smart automatic countdown banner */}
                            {cms.heroEventCountdownEnabled && cms.heroEventTargetDate && (
                              <div className="mt-4 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-brand-gold font-mono uppercase tracking-wider text-center font-bold">
                                {(() => {
                                  const today = new Date().toISOString().split("T")[0];
                                  const target = cms.heroEventTargetDate;
                                  if (today === target) return "⚡ Event begins today! Join room";
                                  if (today > target) return "🔥 Ongoing Seminar Course";
                                  const diffTime = new Date(target).getTime() - new Date(today).getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  return `⏱️ Starts in ${diffDays} Days`;
                                })()}
                              </div>
                            )}

                            {/* Primary Button */}
                            <div className="mt-5">
                              <button
                                type="button"
                                className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-brand-orange/15"
                              >
                                {cms.heroEventActionText || "Register Now"}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* 4. LIVE IMPACT STATISTICS EDITING */}
            {activeSubTab === "hero-stats" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <BarChart3 size={16} />
                    Live Impact Statistics Panel
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Configure up to 5 metrics that appear in the integrated high-contrast glass statistics bar directly below the Hero
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    
                    {/* Stat 1 */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-left space-y-2">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-slate-400 block">Metric Card 1</span>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Value:</label>
                        <input
                          type="text"
                          value={cms.heroStat1Number}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat1Number: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-black text-slate-800 text-xs"
                          placeholder="5,000+"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Label Name:</label>
                        <input
                          type="text"
                          value={cms.heroStat1Label}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat1Label: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none text-[9px]"
                          placeholder="Young People Impacted"
                        />
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-left space-y-2">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-slate-400 block">Metric Card 2</span>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Value:</label>
                        <input
                          type="text"
                          value={cms.heroStat2Number}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat2Number: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-black text-slate-800 text-xs"
                          placeholder="500+"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Label Name:</label>
                        <input
                          type="text"
                          value={cms.heroStat2Label}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat2Label: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none text-[9px]"
                          placeholder="NYSC Members Trained"
                        />
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-left space-y-2">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-slate-400 block">Metric Card 3</span>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Value:</label>
                        <input
                          type="text"
                          value={cms.heroStat3Number}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat3Number: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-black text-slate-800 text-xs"
                          placeholder="150+"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Label Name:</label>
                        <input
                          type="text"
                          value={cms.heroStat3Label}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat3Label: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none text-[9px]"
                          placeholder="Mentors & Facilitators"
                        />
                      </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-left space-y-2">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-slate-400 block">Metric Card 4</span>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Value:</label>
                        <input
                          type="text"
                          value={cms.heroStat4Number}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat4Number: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-black text-slate-800 text-xs"
                          placeholder="50+"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Label Name:</label>
                        <input
                          type="text"
                          value={cms.heroStat4Label}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat4Label: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none text-[9px]"
                          placeholder="Programs Conducted"
                        />
                      </div>
                    </div>

                    {/* Stat 5 */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-left space-y-2">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-slate-400 block">Metric Card 5</span>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Value:</label>
                        <input
                          type="text"
                          value={cms.heroStat5Number}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat5Number: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-black text-slate-800 text-xs"
                          placeholder="15+"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-slate-400 uppercase font-bold block mb-0.5">Label Name:</label>
                        <input
                          type="text"
                          value={cms.heroStat5Label}
                          onChange={(e) => setCms(prev => ({ ...prev, heroStat5Label: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none text-[9px]"
                          placeholder="States Reached"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* PREVIOUS TAB CONTENT: ABOUT, CONTACT, ANNOUNCEMENTS */}
            {activeSubTab === "about" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[#103D2E] border-b border-slate-100 pb-2">Philosophy & Mission statements</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Core Philosophy message:</label>
                    <textarea
                      rows={3}
                      value={cms.aboutPhilosophy}
                      onChange={(e) => setCms(prev => ({ ...prev, aboutPhilosophy: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none resize-none font-medium leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Core Mission description:</label>
                    <textarea
                      rows={3}
                      value={cms.aboutMission}
                      onChange={(e) => setCms(prev => ({ ...prev, aboutMission: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none resize-none font-medium leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Brand Vision statement:</label>
                    <textarea
                      rows={3}
                      value={cms.aboutVision}
                      onChange={(e) => setCms(prev => ({ ...prev, aboutVision: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none resize-none font-medium leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "contact" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[#103D2E] border-b border-slate-100 pb-2">Support & Address details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Official contact Email address:</label>
                    <input
                      type="email"
                      value={cms.contactEmail}
                      onChange={(e) => setCms(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Official contact Phone line:</label>
                    <input
                      type="text"
                      value={cms.contactPhone}
                      onChange={(e) => setCms(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#103D2E]/40 rounded-xl outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Regional HQ office Address string:</label>
                  <input
                    type="text"
                    value={cms.contactAddress}
                    onChange={(e) => setCms(prev => ({ ...prev, contactAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-medium"
                  />
                </div>
              </div>
            )}

            {activeSubTab === "announcements" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[#103D2E] border-b border-slate-100 pb-2">Active Top Ticker Announcement</h3>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Top Banner Marquee Announcement ticker message:</label>
                  <textarea
                    rows={4}
                    value={cms.announcementTicker}
                    onChange={(e) => setCms(prev => ({ ...prev, announcementTicker: e.target.value }))}
                    placeholder="Enter short headline message..."
                    className="w-full px-3 py-2 bg-[#FAF8F3]/60 border border-[#103D2E]/10 focus:bg-white rounded-xl focus:border-[#103D2E]/40 outline-none resize-none font-bold text-[#103D2E]"
                  />
                </div>
              </div>
            )}

            {activeSubTab === "about-axes" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <Sliders size={16} />
                    Framework Philosophy & Three Core Axes
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Configure titles, descriptions, and taglines for Think Right, Live Right, and Lead Right
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Axis 1 */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#103D2E] text-xs uppercase mb-3 font-mono">Axis 1: Think Right</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={cms.aboutAxis1Title || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, aboutAxis1Title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Tagline:</label>
                        <input
                          type="text"
                          value={cms.aboutAxis1Tag || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, aboutAxis1Tag: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Description:</label>
                      <textarea
                        rows={2}
                        value={cms.aboutAxis1Desc || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, aboutAxis1Desc: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Axis 2 */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#103D2E] text-xs uppercase mb-3 font-mono">Axis 2: Live Right</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={cms.aboutAxis2Title || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, aboutAxis2Title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Tagline:</label>
                        <input
                          type="text"
                          value={cms.aboutAxis2Tag || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, aboutAxis2Tag: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Description:</label>
                      <textarea
                        rows={2}
                        value={cms.aboutAxis2Desc || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, aboutAxis2Desc: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Axis 3 */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#103D2E] text-xs uppercase mb-3 font-mono">Axis 3: Lead Right</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={cms.aboutAxis3Title || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, aboutAxis3Title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Tagline:</label>
                        <input
                          type="text"
                          value={cms.aboutAxis3Tag || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, aboutAxis3Tag: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Description:</label>
                      <textarea
                        rows={2}
                        value={cms.aboutAxis3Desc || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, aboutAxis3Desc: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "monthly-programs" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <Calendar size={16} />
                    Monthly Programs Section Manager
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Configure titles, descriptions, and call-to-actions for the main landing page monthly seminars and reinvention programs
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Program 1 */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#103D2E] text-xs uppercase mb-3 font-mono">Program 1: Monthly Leadership Seminar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={cms.program1Title || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, program1Title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Register Button Text:</label>
                        <input
                          type="text"
                          value={cms.program1BtnText || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, program1BtnText: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Description:</label>
                      <textarea
                        rows={3}
                        value={cms.program1Desc || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, program1Desc: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Program 2 */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#103D2E] text-xs uppercase mb-3 font-mono">Program 2: Monthly Reinvention Program</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={cms.program2Title || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, program2Title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">WhatsApp Register Button Text:</label>
                        <input
                          type="text"
                          value={cms.program2BtnWhatsappText || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, program2BtnWhatsappText: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">View Details Button Text:</label>
                        <input
                          type="text"
                          value={cms.program2BtnDetailsText || ""}
                          onChange={(e) => setCms(prev => ({ ...prev, program2BtnDetailsText: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Description:</label>
                      <textarea
                        rows={3}
                        value={cms.program2Desc || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, program2Desc: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "testimonials" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                      <Users size={16} />
                      Community Testimonials Manager
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                      Configure, add, reorder, or toggle stories displayed in the transformation reviews block
                    </p>
                  </div>
                  {hasWriteAccess && (
                    <button
                      type="button"
                      onClick={() => {
                        const newTest = {
                          id: `test-${Date.now()}`,
                          name: "New Contributor",
                          role: "Corps Member / Graduate",
                          quote: "Write the testimonial story here...",
                          order: (cms.testimonials?.length || 0) + 1,
                          enabled: true
                        };
                        setCms(prev => ({
                          ...prev,
                          testimonials: [...(prev.testimonials || []), newTest]
                        }));
                      }}
                      className="px-3 py-1.5 bg-[#103D2E] text-[#E9C46A] hover:bg-[#0b2b20] text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={11} /> Add Testimonial
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(!cms.testimonials || cms.testimonials.length === 0) ? (
                    <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase font-mono text-2xs">
                      [No testimonials configured. Click Add Testimonial above.]
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {cms.testimonials.map((test, idx) => {
                        return (
                          <div key={test.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[9px] font-bold text-[#E76F51] uppercase font-mono">
                                Story #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const list = [...cms.testimonials];
                                    const temp = list[idx];
                                    list[idx] = list[idx - 1];
                                    list[idx - 1] = temp;
                                    setCms(prev => ({ ...prev, testimonials: list }));
                                  }}
                                  className="p-1 hover:bg-white border border-transparent hover:border-slate-200 rounded text-slate-500 disabled:opacity-30"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === cms.testimonials.length - 1}
                                  onClick={() => {
                                    const list = [...cms.testimonials];
                                    const temp = list[idx];
                                    list[idx] = list[idx + 1];
                                    list[idx + 1] = temp;
                                    setCms(prev => ({ ...prev, testimonials: list }));
                                  }}
                                  className="p-1 hover:bg-white border border-transparent hover:border-slate-200 rounded text-slate-500 disabled:opacity-30"
                                >
                                  <ChevronDown size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCms(prev => ({
                                      ...prev,
                                      testimonials: prev.testimonials.map(t => t.id === test.id ? { ...t, enabled: !t.enabled } : t)
                                    }));
                                  }}
                                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border cursor-pointer ${
                                    test.enabled ? "bg-emerald-50 border-emerald-150 text-emerald-700" : "bg-white border-slate-200 text-slate-400"
                                  }`}
                                >
                                  {test.enabled ? "Active" : "Disabled"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCms(prev => ({
                                      ...prev,
                                      testimonials: prev.testimonials.filter(t => t.id !== test.id)
                                    }));
                                  }}
                                  className="p-1 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Reviewer Name:</label>
                                <input
                                  type="text"
                                  value={test.name}
                                  onChange={(e) => {
                                    setCms(prev => ({
                                      ...prev,
                                      testimonials: prev.testimonials.map(t => t.id === test.id ? { ...t, name: e.target.value } : t)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Role / Tagline:</label>
                                <input
                                  type="text"
                                  value={test.role}
                                  onChange={(e) => {
                                    setCms(prev => ({
                                      ...prev,
                                      testimonials: prev.testimonials.map(t => t.id === test.id ? { ...t, role: e.target.value } : t)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Quote Description:</label>
                              <textarea
                                rows={2}
                                value={test.quote}
                                onChange={(e) => {
                                  setCms(prev => ({
                                    ...prev,
                                    testimonials: prev.testimonials.map(t => t.id === test.id ? { ...t, quote: e.target.value } : t)
                                  }));
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium text-xs animate-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === "faqs" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                      <HelpCircle size={16} />
                      Frequently Asked Questions (FAQ) Manager
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                      Configure, add, reorder, or toggle accordions displayed in the Frequently Asked Questions section
                    </p>
                  </div>
                  {hasWriteAccess && (
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq = {
                          id: `faq-${Date.now()}`,
                          question: "New Question Topic?",
                          answer: "Write the comprehensive answer detail here...",
                          order: (cms.faqs?.length || 0) + 1,
                          enabled: true
                        };
                        setCms(prev => ({
                          ...prev,
                          faqs: [...(prev.faqs || []), newFaq]
                        }));
                      }}
                      className="px-3 py-1.5 bg-[#103D2E] text-[#E9C46A] hover:bg-[#0b2b20] text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={11} /> Add FAQ Accordion
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(!cms.faqs || cms.faqs.length === 0) ? (
                    <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase font-mono text-2xs">
                      [No FAQs configured. Click Add FAQ Accordion above.]
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {cms.faqs.map((item, idx) => {
                        return (
                          <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[9px] font-bold text-[#E76F51] uppercase font-mono">
                                Accordion #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const list = [...cms.faqs];
                                    const temp = list[idx];
                                    list[idx] = list[idx - 1];
                                    list[idx - 1] = temp;
                                    setCms(prev => ({ ...prev, faqs: list }));
                                  }}
                                  className="p-1 hover:bg-white border border-transparent hover:border-slate-200 rounded text-slate-500 disabled:opacity-30"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === cms.faqs.length - 1}
                                  onClick={() => {
                                    const list = [...cms.faqs];
                                    const temp = list[idx];
                                    list[idx] = list[idx + 1];
                                    list[idx + 1] = temp;
                                    setCms(prev => ({ ...prev, faqs: list }));
                                  }}
                                  className="p-1 hover:bg-white border border-transparent hover:border-slate-200 rounded text-slate-500 disabled:opacity-30"
                                >
                                  <ChevronDown size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCms(prev => ({
                                      ...prev,
                                      faqs: prev.faqs.map(f => f.id === item.id ? { ...f, enabled: !f.enabled } : f)
                                    }));
                                  }}
                                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border cursor-pointer ${
                                    item.enabled ? "bg-emerald-50 border-emerald-150 text-emerald-700" : "bg-white border-slate-200 text-slate-400"
                                  }`}
                                >
                                  {item.enabled ? "Active" : "Disabled"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCms(prev => ({
                                      ...prev,
                                      faqs: prev.faqs.filter(f => f.id !== item.id)
                                    }));
                                  }}
                                  className="p-1 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Question Topic Text:</label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => {
                                  setCms(prev => ({
                                    ...prev,
                                    faqs: prev.faqs.map(f => f.id === item.id ? { ...f, question: e.target.value } : f)
                                  }));
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Answer Narrative Block:</label>
                              <textarea
                                rows={3}
                                value={item.answer}
                                onChange={(e) => {
                                  setCms(prev => ({
                                    ...prev,
                                    faqs: prev.faqs.map(f => f.id === item.id ? { ...f, answer: e.target.value } : f)
                                  }));
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === "final-cta" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase text-[#103D2E] flex items-center gap-2">
                    <Sparkles size={16} />
                    Final Call To Action (CTA) Banner Manager
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal uppercase">
                    Configure the main headlines, badges, descriptions, and buttons for the bottom newsletter and conversion banner
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Upper Badge Text:</label>
                      <input
                        type="text"
                        value={cms.finalCtaBadge || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, finalCtaBadge: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Main Headline Statement:</label>
                      <input
                        type="text"
                        value={cms.finalCtaHeading || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, finalCtaHeading: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Supporting Description Block:</label>
                    <textarea
                      rows={3}
                      value={cms.finalCtaDesc || ""}
                      onChange={(e) => setCms(prev => ({ ...prev, finalCtaDesc: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Primary Button Label (e.g. Get Started):</label>
                      <input
                        type="text"
                        value={cms.finalCtaBtn1Text || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, finalCtaBtn1Text: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-mono font-black text-slate-400 mb-1">Secondary Button Label (e.g. Contact Us):</label>
                      <input
                        type="text"
                        value={cms.finalCtaBtn2Text || ""}
                        onChange={(e) => setCms(prev => ({ ...prev, finalCtaBtn2Text: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE SANDBOX CHANGE PREVIEW PANEL */}
            {activeSubTab.startsWith("hero") && (
              <div className="border-t border-slate-150 pt-5 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#103D2E] tracking-wider flex items-center gap-1.5 font-sans">
                    <Eye size={14} className="text-[#E76F51]" />
                    Live Sandbox Real-time Changes Preview Mockup
                  </span>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase font-mono bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                    <span>Simulated Desktop Mode</span>
                  </div>
                </div>

                <div className="relative w-full aspect-video rounded-2xl border-4 border-[#103D2E]/15 overflow-hidden bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-white text-left">
                  
                  {/* Dynamic Slide Background with custom transitions simulated */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    {activeSlidesForPreview.length > 0 ? (
                      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
                        <img 
                          src={getSlideImageSrc(currentPreviewSlide ? currentPreviewSlide.imageUrl : "auditorium")}
                          alt="Preview slide"
                          className="w-full h-full object-cover scale-[1.01]"
                          referrerPolicy="no-referrer"
                        />
                        {/* Premium Dark overlay subtle gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/85 pointer-events-none" />
                        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center font-mono text-[10px] text-slate-400">
                        [No Slides Configured]
                      </div>
                    )}
                  </div>

                  {/* Header/Badge layer */}
                  <div className="relative z-10">
                    <div className="inline-block px-2 py-0.5 rounded bg-[#E76F51]/20 border border-[#E76F51]/30 text-[7px] font-black tracking-widest text-[#E9C46A] uppercase font-mono">
                      ⚡ {cms.heroBadge || "BUILDING AFRICA'S NEXT GENERATION OF LEADERS"}
                    </div>
                  </div>

                  {/* Main Grid Content splits */}
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 my-2">
                    
                    {/* Left text column */}
                    <div className="md:col-span-8 space-y-1.5">
                      <h1 className="text-md sm:text-xl md:text-2xl font-black uppercase tracking-tight leading-tight leading-[1.05] font-display max-w-sm">
                        {cms.heroTitle || "Transforming African Minds"}<br/>
                        <span className="text-[#E76F51]">{cms.heroSubtitle || "For Leadership, Innovation & Lasting Impact"}</span>
                      </h1>
                      <p className="text-[8px] sm:text-[9px] text-slate-350 max-w-md line-clamp-3 leading-normal">
                        {cms.heroDescription || "We empower teenagers, students, graduates, entrepreneurs and NYSC members with leadership development, digital skills, mentorship..."}
                      </p>

                      {/* Mock Buttons */}
                      <div className="flex gap-2 pt-1">
                        <span className="px-2.5 py-1 bg-[#0E3A2F] border border-emerald-950 text-[7px] text-white font-black uppercase tracking-wider rounded">
                          {cms.heroBtnPrimaryText}
                        </span>
                        <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-[7px] text-white font-black uppercase tracking-wider rounded">
                          {cms.heroBtnSecondaryText}
                        </span>
                        <span className="px-2.5 py-1 text-[7px] text-[#E9C46A] font-black uppercase tracking-wider flex items-center">
                          {cms.heroBtnTertiaryText}
                        </span>
                      </div>
                    </div>

                    {/* Right glassmorphism card */}
                    <div className="md:col-span-4">
                      {cms.heroEventEnabled ? (
                        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2 rounded-xl text-[7px] space-y-1">
                          <div className="inline-block px-1 py-0.5 bg-[#E76F51] rounded text-[6px] font-black uppercase tracking-widest text-white font-mono">
                            {cms.heroEventTitle}
                          </div>
                          <p className="font-extrabold text-white text-[8px] leading-tight leading-[1.1]">{cms.heroEventName}</p>
                          <div className="flex items-center gap-1 text-[6px] text-slate-300 font-semibold font-mono">
                            <Clock size={8} /> <span>{cms.heroEventDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[6px] text-slate-300 font-semibold">
                            <MapPin size={8} /> <span>{cms.heroEventLocation}</span>
                          </div>
                          <div className="text-[#E9C46A] font-black text-[7px] cursor-pointer pt-0.5">
                            {cms.heroEventActionText}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 border border-dashed border-white/10 text-slate-500 font-bold text-[8px] rounded-xl text-center">
                          [Event Card Hidden]
                        </div>
                      )}
                    </div>

                  </div>

                  {/* bottom bar statistics integrated preview */}
                  <div className="relative z-10 bg-black/60 backdrop-blur-md border border-white/10 p-1.5 rounded-lg grid grid-cols-5 text-center gap-0.5">
                    <div className="border-r border-white/10 last:border-none">
                      <p className="text-[10px] font-black text-[#E9C46A] font-mono">{cms.heroStat1Number}</p>
                      <p className="text-[5px] text-slate-400 font-bold uppercase truncate">{cms.heroStat1Label}</p>
                    </div>
                    <div className="border-r border-white/10 last:border-none">
                      <p className="text-[10px] font-black text-[#E9C46A] font-mono">{cms.heroStat2Number}</p>
                      <p className="text-[5px] text-slate-400 font-bold uppercase truncate">{cms.heroStat2Label}</p>
                    </div>
                    <div className="border-r border-white/10 last:border-none">
                      <p className="text-[10px] font-black text-[#E9C46A] font-mono">{cms.heroStat3Number}</p>
                      <p className="text-[5px] text-slate-400 font-bold uppercase truncate">{cms.heroStat3Label}</p>
                    </div>
                    <div className="border-r border-white/10 last:border-none">
                      <p className="text-[10px] font-black text-[#E9C46A] font-mono">{cms.heroStat4Number}</p>
                      <p className="text-[5px] text-slate-400 font-bold uppercase truncate">{cms.heroStat4Label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#E9C46A] font-mono">{cms.heroStat5Number}</p>
                      <p className="text-[5px] text-slate-400 font-bold uppercase truncate">{cms.heroStat5Label}</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Form Actions Footer */}
            {hasWriteAccess ? (
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2 text-2xs uppercase">
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase flex items-center gap-1">
                  <Clock size={11} /> 
                  {saveStatus ? saveStatus : "Ready to save live parameters"}
                </span>
                
                <button
                  type="submit"
                  disabled={saveStatus === "Saving..." || saveStatus === "Syncing Cloud..."}
                  className="px-6 py-3 bg-[#103D2E] hover:bg-[#0b2b20] text-amber-305 text-[#E9C46A] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#103D2E]/15 disabled:opacity-50"
                >
                  <Save size={13} className="stroke-[2.5]" />
                  Save live parameters
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl font-bold font-mono">
                🛡️ Operational Lock: Viewer-only access can inspect but not re-write CMS variables.
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}
