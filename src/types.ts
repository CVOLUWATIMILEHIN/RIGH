/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ciiHangoutGroup from "./assets/images/cii_social_group_hangout_v2_1779792894578.png";
import ciiHangoutDrills from "./assets/images/cii_team_building_drills_v2_1779792911218.png";
import nigerianConferenceImg from "./assets/images/nigerian_conference_1779791531024.png";
import nigerianTeensClassImg from "./assets/images/nigerian_teens_classroom_1779792832349.png";
import nigerianCareerBootcampImg from "./assets/images/nigerian_career_bootcamp_1779792857490.png";

export interface Initiative {
  id: string;
  title: string;
  badge: string;
  description: string;
  objectives: string[];
  beneficiaries: string;
  stats: string;
  color: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  cohort: string;
  avatar: string;
  quote: string;
}

export interface Metric {
  id: string;
  value: number;
  suffix: string;
  label: string;
  iconName: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  url?: string;
  description: string;
  date: string;
  order?: number;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatar: string;
}

export interface Partner {
  id: string;
  name: string;
  logoType: string;
  category: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Structured data for Right Minds Africa Hub
export const INITIATIVES: Initiative[] = [
  {
    id: "cii",
    title: "CII (Corper Impact Initiative)",
    badge: "Graduates & Corps Members",
    description: "Helping corps members strategically navigate NYSC life mentally, financially, and professionally. Transitioning from national service to global impact with clarity and competence.",
    objectives: [
      "Financial intelligence & savings strategies during service year",
      "Career launching: CV writing, cover letters, and interview prep",
      "Mental resilience & overcoming post-graduation anxiety",
      "Skill acquisition & remote work positioning"
    ],
    beneficiaries: "Registered NYSC Corps Members & Recent Graduates",
    stats: "3,500+ Corps Members Trained",
    color: "brand-blue"
  },
  {
    id: "seminars",
    title: "Monthly Leadership Seminars",
    badge: "Undergraduates & Professionals",
    description: "Deep mindset-shift, professional capacity building, and emotional-intelligence (EQ) seminars for undergraduates, young professionals, and corporate leaders.",
    objectives: [
      "Executive Mindset Shift & Behavioral Integrity classes",
      "Corporate EQ & Workplace Stamina - Staff efficiency training",
      "Undergraduate and youth career-readiness masterclasses",
      "Continuous personal growth guidance & mentorship"
    ],
    beneficiaries: "Undergraduates, Young Professionals & C-level HR Squads",
    stats: "1,200+ Professionals Empowered",
    color: "brand-blue"
  },
  {
    id: "g3",
    title: "G3 Series 2026/2027 (God • Growth • Goals)",
    badge: "The Relevance Question",
    description: "The Human Advantage: Who Will You Become in a Changing World? Our annual 5-Saturday developmental programme across December and the first Saturday of January exploring Identity, Skills, Adaptability, Relationships, and Intentional Execution through God, Growth, and Goals.",
    objectives: [
      "Identity, self-awareness & personal responsibility",
      "Skills acquisition, capacity building & continuous value creation",
      "Adaptability, innovation & navigating AI and a changing world",
      "Intentional relationships, mental well-being & 2027 goal execution"
    ],
    beneficiaries: "Ambitious Youth & Purpose-driven Professionals",
    stats: "5 Progressive Saturdays (Dec & Jan 2)",
    color: "brand-orange"
  },
  {
    id: "teen-minds",
    title: "Right-Minded Teens Initiative",
    badge: "Secondary School Students",
    description: "Empowering teenagers through intentional mentorship, productivity hacks, purposeful goal setting, and growth mindset training during their formative secondary years.",
    objectives: [
      "Growth mindset: Overcoming 'I can't' attitudes and limited self-belief",
      "Value systems & character development: Integrity and honesty",
      "High-school productivity: Time management, study habits, and digital detox",
      "Early career path identification and academic excellence"
    ],
    beneficiaries: "Teenagers aged 13 - 19 & Secondary School Students",
    stats: "4,200+ Teenagers Mentored",
    color: "brand-orange"
  },
  {
    id: "reinvention",
    title: "Monthly Reinvention Program",
    badge: "Continuous Evolution",
    description: "Our core monthly Reinvention system built to help you continuously audit your mind, reset your focus parameters, design goals, and construct solid execution habits with high-accountability mentorship.",
    objectives: [
      "Mindset reset routines: Overcoming operational procrastination",
      "Personal life auditing & weekly career progress dashboards",
      "Continuous growth, habit mechanics & time boxing workshops",
      "Direct personalized cohort check-ins & premium mastermind alignment"
    ],
    beneficiaries: "Corps Members, Graduates & Professionals seeking active evolution",
    stats: "Monthly Enrollment Open",
    color: "brand-blue"
  }
];

export const YAP_STATS: Metric[] = [
  {
    id: "speakers",
    value: 24,
    suffix: "+",
    label: "Global Speakers",
    iconName: "Mic",
    description: "Industry leaders, spiritual mentors, and seasoned career professionals."
  },
  {
    id: "impacted",
    value: 5000,
    suffix: "+",
    label: "Youth Impacted",
    iconName: "Users",
    description: "Attendees from universities, organizations, and corporate institutions."
  },
  {
    id: "sessions",
    value: 12,
    suffix: "+",
    label: "Deep Dive Sessions",
    iconName: "Tv",
    description: "Focusing on corporate career, spiritual alignment, and entrepreneurship."
  }
];

export const GENERAL_METRICS: Metric[] = [
  {
    id: "reached",
    value: 10000,
    suffix: "+",
    label: "Youth Reached",
    iconName: "Award",
    description: "Empowered across secondary schools, universities, and NYSC secretariats."
  },
  {
    id: "sessions-held",
    value: 100,
    suffix: "+",
    label: "Mentorship Sessions",
    iconName: "Calendar",
    description: "One-on-one and group cohort sessions facilitated by certified mentors."
  },
  {
    id: "programs",
    value: 8,
    suffix: "+",
    label: "Growth Programs",
    iconName: "TrendingUp",
    description: "Structured pathways targeting distinct development phases."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Chidem Ebuka",
    role: "Software Engineer Intern",
    location: "Enugu, Nigeria",
    cohort: "CII Graduate 2025",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80",
    quote: "During my NYSC in Niger State, I had no clue how to stand out in the tech ecosystem. The Corper Impact Initiative (CII) redefined my career mapping. I learned remote job prospecting, tailored my LinkedIn, and landed a role right after my Pop out!"
  },
  {
    id: "t2",
    name: "Adebayo Adesina",
    role: "Final Year Student (Unilag)",
    location: "Lagos, Nigeria",
    cohort: "YAP Attendee 2024",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80",
    quote: "YAP Conference was a complete mental shifts. Hearing from seasoned speakers who look like me and started from similar circumstances, made me realize my environment is not an excuse for mediocracy. I am starting my entrepreneurial journey with crystal-clear vision."
  },
  {
    id: "t3",
    name: "Tosin Alabi",
    role: "Secondary School Graduate",
    location: "Ogbomoso, Nigeria",
    cohort: "Right-Minded Teens 2025",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&fit=crop&q=80",
    quote: "I used to think that some subjects were just not for people like me. Under the Right-Minded Teens mentorship, I discovered cognitive growth mindset principles. My study approach changed, I cleared my WAEC in one sitting, and have gained massive confidence!"
  },
  {
    id: "t4",
    name: "Aminu Yusuf",
    role: "Operations Specialist",
    location: "Abuja, Nigeria",
    cohort: "CII Alumni 2024",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&fit=crop&q=80",
    quote: "Right Minds Africa Hub doesn't just give you temporary motivation. They guide you step-by-step through productivity drills, moral value checks, and practical strategies. The community they provide is arguably the most supportive space for any ambitious young Nigerian."
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "YAP Annual Conference Mainstage",
    category: "YAP Conference",
    image: nigerianConferenceImg,
    description: "Young Africans gathered in Lagos for a multi-session leadership empowerment seminar focused on purpose-driven career building.",
    date: "November 2025"
  },
  {
    id: "g_hangout_1",
    title: "CII Annual Social Hangout Group Memory",
    category: "CII",
    image: ciiHangoutGroup,
    description: "Vibrant gathering of corps members, coordinators, and state leaders celebrating milestones at the annual RightMinds Africa CII Social Hangout. Browse the full high-res album of over 100+ hangout memories instantly on Google Photos at: https://photos.google.com/share/AF1QipNcGoBwOfG3-01OTK8DrrpYAetSJKxTAbTgxXFWr5A89MHkqXmoizxP37BJTkcoiw?key=NEpJejVub2lQZ2dVb3JxNDBGSUxXT0lpMU1xMWNn",
    date: "December 2025"
  },
  {
    id: "g2",
    title: "Teen Mentorship Boot Camp",
    category: "Right-Minded Teens",
    image: nigerianTeensClassImg,
    description: "Interactive classroom study detailing goal charting, digital tool habits, and building high integrity peer networks.",
    date: "August 2025"
  },
  {
    id: "g_hangout_2",
    title: "CII Hangout: Growth Mindset Icebreakers",
    category: "CII",
    image: ciiHangoutDrills,
    description: "Corps members and development coaches engaging in experiential team alignment and trust drills designed to foster deep community grit during the annual outdoor gathering.",
    date: "December 2025"
  },
  {
    id: "g3",
    title: "CII Career Bootcamp & Resume Clinic",
    category: "CII",
    image: nigerianCareerBootcampImg,
    description: "Corps members reviewing professional pitches and receiving mock panel reviews from corporate mentors.",
    date: "January 2026"
  },
  {
    id: "g4",
    title: "Community Outreach & Book Donations",
    category: "Right-Minded Teens",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&q=80",
    description: "Equipping young public school students with leadership text resources, mindset journals, and academic supplies.",
    date: "March 2026"
  }
];

export const SPEAKERS: Speaker[] = [
  {
    id: "s1",
    name: "Dr. Oluwatobiloba Daniel",
    role: "Growth Coach & Leadership Strategist",
    organization: "Peak Mind Initiative",
    avatar: "https://images.unsplash.com/photo-1581382575275-97901c2635b7?w=200&fit=crop&h=200&q=80"
  },
  {
    id: "s2",
    name: "Funmilayo Banjo",
    role: "VP of People Operations",
    organization: "Africa Talent Tech",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&fit=crop&h=200&q=80"
  },
  {
    id: "s3",
    name: "Pastor Samuel Ibekwe",
    role: "Purpose-Driven Activist & Author",
    organization: "Purpose Center Africa",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop&h=200&q=80"
  }
];

export const PARTNERS: Partner[] = [
  { id: "p1", name: "Growth Mindset International", logoType: "gmi", category: "Global Leadership Network" },
  { id: "p2", name: "NYSC Lagos State Command Chapter", logoType: "nysc", category: "Public Sector Integration" },
  { id: "p3", name: "African Leadership University Hubs", logoType: "alu", category: "Education Partner" },
  { id: "p4", name: "The Purpose Center Foundation", logoType: "pcf", category: "Civic Coalition" },
  { id: "p5", name: "Avent Career Accelerator", logoType: "aca", category: "Industry Mentor Group" }
];

export const FAQS: FAQ[] = [
  {
    id: "f1",
    question: "Is Right Minds Africa Hub a religious or political organization?",
    answer: "We are an independent, non-political, vision-driven educational academy. While we focus heavily on purposeful living, moral character development, and general spiritual soundness as fundamentals of leadership, our programs are open to all passionate young Africans searching for a structured growth pathway."
  },
  {
    id: "f2",
    question: "How do I register or join the CII (Corper Impact Initiative)?",
    answer: "If you are an active corps member (or about to deploy), you can click on any 'Join Community' card on this page, choose 'NYSC Corps Member' or 'Recent Graduate', and complete your registration form. Form registrations are automatically parsed into active state cohorts, opening doors to mentorship groups and career sessions."
  },
  {
    id: "f3",
    question: "Do you charge fees for your programs or mentorship hubs?",
    answer: "Our foundational Monthly Leadership Seminars, standard mentorship hubs, and Right-Minded Teens circles are 100% free of charge, sponsored by alumni mentors and philanthropic partners. However, our specialized intensive packages (such as the Monthly Reinvention Program, specialized Staff Peak/Staff Pick corporate training, and our Summer Leadership Bootcamp for Teenagers) are premium paid tracks. These enrollment fees support high-touch coaching loops, customized resource guides, and hands-on professional development toolkits."
  },
  {
    id: "f4",
    question: "Can I join as a Mentor or Volunteer partner?",
    answer: "Absolutely! We welcome young corporate professionals, experienced teachers, and post-NYSC graduates who want to give back through physical workshops, digital cohorts, or review clinics. Use the Join Community form and check the 'Volunteer/Mentor' option."
  }
];

export interface SocialPost {
  id: string;
  platform: "facebook" | "instagram" | "linkedin" | "twitter" | "youtube" | "manual";
  title: string;
  content: string;
  blogArticle?: string;
  summary?: string;
  category: string;
  mediaType: "image" | "carousel" | "video" | "reel" | "none";
  mediaUrls: string[];
  postUrl: string;
  hashtags: string[];
  publishedAt: string;
  syncedAt: string;
  status: "purgatory" | "published" | "draft" | "archived";
  likesCount?: number;
  commentsCount?: number;
  engagementScore?: number;
  seoKeywords?: string[];
  approvedBy?: string;
}

export interface SocialFeedConfig {
  id?: string;
  autoPublish: boolean;
  facebookPageId?: string;
  instagramBusinessId?: string;
  facebookTokenStatus?: "connected" | "expired" | "not_connected";
  instagramTokenStatus?: "connected" | "expired" | "not_connected";
  lastSyncedAt?: string;
  facebookPageName?: string;
  instagramUsername?: string;
}

export interface WebsitePopup {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  eventDate?: string;
  buttonText: string;
  buttonLink: string;
  startDate: string;
  endDate: string;
  priority: "High" | "Medium" | "Low";
  active: boolean;
  displayRule: "once_per_visitor" | "daily" | "every_visit" | "only_homepage" | "sitewide";
  targetPages?: string;
  imageUrl?: string;
  status?: string;
  updatedAt?: string;
  updatedBy?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  viewsCount?: number;
  clicksCount?: number;
  dismissesCount?: number;
}

export interface HistoricalRecord {
  id: string;
  title: string;
  category: "program" | "conference" | "training" | "cohort" | "success_story" | "leadership_program";
  timelineDate: string;
  year: number;
  description: string;
  imageUrl?: string;
  impactMetrics?: string;
  galleryImages?: string[];
  tags?: string[];
  createdAt: string;
}

