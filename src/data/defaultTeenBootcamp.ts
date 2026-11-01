import teenBootcampFlyer from "../assets/images/teen_bootcamp_2026_flyer.png";
import nigerianTeensClassImg from "../assets/images/nigerian_teens_classroom_1779792832349.png";
import heroAfricanYouths from "../assets/images/hero_african_youths_1779772519831.png";
import ciiHangoutDrills from "../assets/images/cii_team_building_drills_v2_1779792911218.png";
import ciiHangoutGroup from "../assets/images/cii_social_group_hangout_v2_1779792894578.png";
import nigerianConferenceImg from "../assets/images/nigerian_conference_1779791531024.png";
import nigerianCareerBootcampImg from "../assets/images/nigerian_career_bootcamp_1779792857490.png";
import founderPortrait from "../assets/images/founder_exact_portrait_1779785733736.png";
import mediaLeaderOlosunde from "../assets/images/media_leader_olosunde_1779880644547.png";
import vincentOluwatimilehin from "../assets/images/vincent_oluwatimilehin_media_tech_team_lead.png";
import { TeenBootcampConfig } from "../types/teenBootcamp";

export const DEFAULT_TEEN_BOOTCAMP_CONFIG: TeenBootcampConfig = {
  id: "teen_bootcamp_2026",
  title: "Right-Minds Teen Leadership Bootcamp 2026",
  subtitle: "Discover Purpose. Build Future-Ready Skills.",
  heroDescription: "An intensive 6-day transformational academy designed for teenagers aged 13–19 who are ready to discover their purpose, develop emotional intelligence, master digital tools, and step forward as ethical future leaders.",
  eventDate: "17th – 22nd August 2026",
  countdownTarget: "2026-08-17T09:00:00",
  venue: "Right Minds Hub Center, Kano State & Virtual Global Cohort",
  ageGroup: "13 – 19 Years (Secondary School & Post-UTME)",
  registrationFee: 50000,
  earlyBirdFee: 45000,
  currency: "NGN",
  brochureUrl: "#brochure",
  heroFlyerImage: teenBootcampFlyer,
  heroBannerImage: nigerianTeensClassImg,

  aboutTitle: "Building the Next Generation of Ethical African Leaders",
  aboutDescription: "The Right-Minds Teen Leadership Bootcamp is an international-standard youth development summit designed specifically to bridge the gap between academic education and real-world leadership, emotional resilience, and digital competence. During this 6-day immersive experience, teenagers participate in high-impact workshops, team drills, technology masterclasses, and direct peer mentorship designed to inspire clarity, self-worth, and purposeful execution.",
  aboutImage: nigerianTeensClassImg,

  whyChoosePillars: [
    {
      title: "Leadership & Character",
      icon: "ShieldCheck",
      description: "Cultivating moral integrity, ethical decision-making, and self-governance in everyday peer situations."
    },
    {
      title: "Critical Thinking",
      icon: "Brain",
      description: "Training young minds to analyze complex problems, evaluate information logically, and make wise choices."
    },
    {
      title: "Future Technology",
      icon: "Cpu",
      description: "Hands-on exposure to artificial intelligence, digital productivity tools, media creation, and safe online habits."
    },
    {
      title: "Public Communication",
      icon: "MessageSquare",
      description: "Mastering stage presence, articulate public speaking, debate skills, and persuasive writing."
    },
    {
      title: "Self-Confidence",
      icon: "Sparkles",
      description: "Overcoming stage fright, low self-esteem, peer pressure, and limited self-belief."
    },
    {
      title: "Financial Literacy",
      icon: "Wallet",
      description: "Understanding money management, budgeting, ethical entrepreneurship, and value creation early in life."
    },
    {
      title: "Creativity & Innovation",
      icon: "Lightbulb",
      description: "Unlocking creative problem-solving skills through real-world team challenges and design thinking."
    },
    {
      title: "Emotional Intelligence",
      icon: "HeartHandshake",
      description: "Building self-awareness, stress management, empathy, and healthy interpersonal relationships."
    }
  ],

  learningTracks: [
    {
      id: "track_1",
      title: "Leadership Development & Ethics",
      subtitle: "Self-Governance & Visionary Direction",
      description: "Learn how to lead yourself before leading others. Discover core principles of personal responsibility, goal setting, time management, and ethical decision-making.",
      topics: ["Personal Accountability & Habit Design", "Overcoming Peer Pressure", "Vision Boarding & Strategic Goal Setting", "Servant Leadership Principles"],
      icon: "Compass",
      badgeColor: "emerald"
    },
    {
      id: "track_2",
      title: "Purpose Discovery & Self-Awareness",
      subtitle: "Unlocking Unique Strengths",
      description: "A guided journey into understanding temperament, cognitive strengths, intrinsic motivations, and identifying academic and career paths aligned with purpose.",
      topics: ["Temperament & Personality Audits", "Career Path Alignment Workshops", "Overcoming Imposter Syndrome", "Building Unshakeable Self-Worth"],
      icon: "Target",
      badgeColor: "amber"
    },
    {
      id: "track_3",
      title: "Communication & Public Speaking",
      subtitle: "Articulating Ideas with Clarity",
      description: "Transform shy voices into articulate, persuasive speakers. Practice stage delivery, speech structuring, active listening, and constructive group debate.",
      topics: ["Speech Structuring & Storytelling", "Overcoming Stage Fright", "Body Language & Vocal Modulation", "Debate & Panel Discussion Drills"],
      icon: "Mic",
      badgeColor: "blue"
    },
    {
      id: "track_4",
      title: "Digital Media & Content Creation",
      subtitle: "Creative Communication Skills",
      description: "Master graphic design fundamentals, video editing basics, storytelling for social good, and building a responsible digital footprint.",
      topics: ["Canva & Graphic Design Basics", "Mobile Video Editing Workshops", "Digital Ethics & Online Safety", "Personal Branding for Youth"],
      icon: "Video",
      badgeColor: "purple"
    },
    {
      id: "track_5",
      title: "Artificial Intelligence & Future Tools",
      subtitle: "Navigating the Future of Work",
      description: "Practical introduction to AI productivity assistants, research tools, prompt engineering for academics, and critical evaluation of digital information.",
      topics: ["Ethical AI Usage for Students", "Prompt Engineering Essentials", "Research & Academic Efficiency Tools", "Future-Proofing Your Skillset"],
      icon: "Bot",
      badgeColor: "indigo"
    },
    {
      id: "track_6",
      title: "Entrepreneurship & Financial Literacy",
      subtitle: "Value Creation & Financial Stewardship",
      description: "Demystify money, savings, budgeting, and simple business ideation through interactive pitch games and real-life case studies.",
      topics: ["Understanding Money & Wealth Mindset", "Budgeting & Savings Strategies for Teens", "Business Model Generation Game", "Product Pitching & Value Delivery"],
      icon: "TrendingUp",
      badgeColor: "emerald"
    },
    {
      id: "track_7",
      title: "High-Performance Productivity",
      subtitle: "Study Systems & Digital Detox",
      description: "Equip students with scientific memory techniques, pomodoro focus methods, digital distraction management, and WAEC/JAMB preparation strategies.",
      topics: ["Time Boxing & Calendar Blocking", "Active Recall & Spaced Repetition", "Managing Screen Time & Smartphone Detox", "Academic Stress Management"],
      icon: "Zap",
      badgeColor: "orange"
    },
    {
      id: "track_8",
      title: "Personal Growth & Character Systems",
      subtitle: "Long-term Excellence Habits",
      description: "Cultivate spiritual grounding, emotional stamina, anger management, empathy, and building healthy lifelong friendships.",
      topics: ["Emotional Self-Regulation", "Conflict Resolution & Healthy Boundaries", "Building Mentorship Relationships", "Designing a 12-Month Personal Plan"],
      icon: "Shield",
      badgeColor: "rose"
    }
  ],

  whoShouldAttend: [
    {
      title: "Teenagers (Aged 13–19)",
      description: "Ambitious teens seeking clarity, self-belief, digital skills, and a strong moral anchor for their future.",
      badge: "Ages 13-19",
      icon: "User"
    },
    {
      title: "Secondary School Students",
      description: "JS3 to SS3 students wanting to excel academically while discovering their passion and future career paths.",
      badge: "High Schoolers",
      icon: "GraduationCap"
    },
    {
      title: "Post-UTME & High School Graduates",
      description: "Recent school leavers preparing to transition into university life, independent living, and global opportunities.",
      badge: "Pre-Varsity",
      icon: "Award"
    },
    {
      title: "Aspiring Young Creatives & Techies",
      description: "Youth fascinated by design, media, artificial intelligence, problem-solving, and community impact.",
      badge: "Innovators",
      icon: "Sparkles"
    },
    {
      title: "Student Leaders & Prefects",
      description: "Head prefects, club presidents, and class representatives aiming to hone executive team management skills.",
      badge: "Leaders",
      icon: "Crown"
    },
    {
      title: "Youth Group Members",
      description: "Church youth members, community volunteers, and peer mentors recommended by guardians.",
      badge: "Community",
      icon: "Users"
    }
  ],

  sixDaySchedule: [
    {
      day: 1,
      title: "Day One: Orientation & Growth Mindset Audit",
      theme: "Unpacking Potential & Setting Expectations",
      summary: "Participants check in, meet cohort mentors, participate in icebreakers, take their baseline Mindset Audit, and establish squad ground rules.",
      keyActivities: ["Welcome Keynote & Cohort Unpacking", "The Baseline Mindset & Habits Audit", "Squad Team Building & Icebreaker Drills", "Opening Evening Fireside Chat"],
      icon: "Compass"
    },
    {
      day: 2,
      title: "Day Two: Leadership & Purpose Discovery",
      theme: "Understanding Temperament & Values",
      summary: "Deep dive into self-governance, temperaments, identifying core strengths, overcoming peer pressure, and designing personal vision boards.",
      keyActivities: ["Temperament Assessment & Personality Workshop", "Vision Boarding & Purpose Mapping", "Overcoming Peer Pressure Panel Session", "Public Speaking Warm-up Drills"],
      icon: "Target"
    },
    {
      day: 3,
      title: "Day Three: Technology, AI & Digital Skills",
      theme: "Mastering Future Productivity Tools",
      summary: "Interactive workshops on artificial intelligence, graphic design, content creation ethics, and leveraging digital tools for academic excellence.",
      keyActivities: ["Hands-on AI & Prompt Engineering Lab", "Canva Graphic Design & Media Masterclass", "Digital Detox & Screen Time Management", "Cyber Safety & Personal Online Branding"],
      icon: "Cpu"
    },
    {
      day: 4,
      title: "Day Four: Entrepreneurship & Financial Intelligence",
      theme: "Creating Value & Stewardship",
      summary: "Fun entrepreneurship simulation where teen squads generate business ideas, build financial budgets, and prepare elevator pitches.",
      keyActivities: ["Money Principles & Budgeting for Youth", "The Teen Business Idea Generation Challenge", "Elevator Pitch & Public Speaking Drills", "Financial Stewardship & Value Creation"],
      icon: "Wallet"
    },
    {
      day: 5,
      title: "Day Five: Community Impact & Squad Projects",
      theme: "Collaborative Leadership in Action",
      summary: "Squads work on practical social innovation projects addressing real community challenges, culminating in pitch rehearsals.",
      keyActivities: ["Social Impact Project Hackathon", "Mentor Review & Pitch Clinic", "Peer Feedback & Collaboration Session", "Rehearsal for Graduation Presentations"],
      icon: "Users"
    },
    {
      day: 6,
      title: "Day Six: Grand Graduation, Exhibition & Awards",
      theme: "Celebrating Transformation & Commissioning",
      summary: "Parents, guardians, and guests join for final squad project exhibitions, keynote address, award recognitions, and certificate presentation.",
      keyActivities: ["Squad Project Showcase & Exhibition", "Parent & Guest Keynote Address", "Presentation of Official Certificates & Awards", "Commissioning into Teen Alumni Mentorship Network"],
      icon: "Trophy"
    }
  ],

  whatParticipantsReceive: [
    {
      title: "Official Custom T-Shirt",
      description: "High-quality Right-Minds Teen Leadership Bootcamp branded apparel.",
      icon: "Shirt"
    },
    {
      title: "Leadership Journal & Planner",
      description: "A 12-month structured workbook for tracking personal goals, daily habits, and reflections.",
      icon: "BookOpen"
    },
    {
      title: "Comprehensive Training Workbooks",
      description: "Step-by-step guides covering AI, public speaking, finance, and productivity.",
      icon: "FileText"
    },
    {
      title: "Daily Refreshments & Buffet Lunch",
      description: "Nutritious meals and snacks provided daily throughout the 6-day bootcamp.",
      icon: "Utensils"
    },
    {
      title: "1-on-1 Mentorship Session",
      description: "Personalized guidance with certified youth coaches during and post-bootcamp.",
      icon: "UserCheck"
    },
    {
      title: "Official Certificate of Excellence",
      description: "A prestigious, verifiable certificate highlighting skills and completion.",
      icon: "Award"
    },
    {
      title: "Lifetime Alumni Network Access",
      description: "Continuous entry into quarterly peer mastermind sessions and academic webinars.",
      icon: "Globe"
    }
  ],

  parentsSection: {
    headline: "An Investment That Yields Lifetime Dividends",
    description: "We understand that as a parent or guardian, your highest priority is providing your child with a safe, morally upright, and intellectually stimulating environment. The Right-Minds Teen Leadership Bootcamp is intentionally engineered to give your teenager the internal clarity, emotional stamina, and practical digital skills they need to excel in school, withstand negative peer pressure, and make responsible choices for life.",
    pillars: [
      {
        title: "Uncompromising Safety & Security",
        description: "Strict venue access, verified adult facilitators, medical emergency protocol, and continuous supervision at all times.",
        icon: "ShieldAlert"
      },
      {
        title: "Mentorship by Role Models",
        description: "Facilitators are accomplished, morally upright young leaders, tech experts, and educators who model integrity.",
        icon: "UserCheck"
      },
      {
        title: "Character & Moral Values",
        description: "We instill traditional African values of respect, honesty, hard work, discipline, and reverence for family.",
        icon: "Heart"
      },
      {
        title: "Long-Term Academic & Career Boost",
        description: "Participants leave with improved study habits, public speaking confidence, and digital skills that give them a competitive edge.",
        icon: "TrendingUp"
      }
    ]
  },

  facilitators: [
    {
      id: "fac_1",
      name: "Amb. Samuel Olosunde",
      role: "Founder & Lead Strategist, Right Minds Africa",
      organization: "Right Minds Africa Hub",
      bio: "Visionary youth developer, leadership consultant, and author who has empowered over 10,000 African youth across secondary schools, universities, and corporate institutions.",
      photo: founderPortrait,
      socials: {
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com"
      },
      featured: true,
      order: 1
    },
    {
      id: "fac_2",
      name: "Dr. Oluwatobiloba Daniel",
      role: "Lead Facilitator, Character & Purpose",
      organization: "Peak Mind Initiative",
      bio: "Seasoned leadership coach and youth mentor specializing in cognitive mindset transformation, emotional intelligence, and purpose discovery for secondary school teenagers.",
      photo: "https://images.unsplash.com/photo-1581382575275-97901c2635b7?w=400&fit=crop&q=80",
      socials: {
        linkedin: "https://linkedin.com"
      },
      featured: true,
      order: 2
    },
    {
      id: "fac_3",
      name: "Oluwatimilehin Vicent O. (CV)",
      role: "Media & Digital Skills Director",
      organization: "Right Minds Tech Labs",
      bio: "Digital product designer and media strategist leading workshops on artificial intelligence tools, mobile video creation, and healthy technology habits for youth.",
      photo: vincentOluwatimilehin,
      socials: {
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com"
      },
      featured: true,
      order: 3
    },
    {
      id: "fac_4",
      name: "Chioma Nwosu",
      role: "Teen Cohort Director & Life Coach",
      organization: "Right-Minded Teens Initiative",
      bio: "Chioma coordinates over 4,000 teenagers across Nigeria, facilitating workshops on public speaking, self-esteem building, study habits, and digital detox strategies.",
      photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&fit=crop&q=80",
      socials: {
        instagram: "https://instagram.com"
      },
      featured: true,
      order: 4
    }
  ],

  galleryImages: [
    {
      id: "gal_1",
      url: nigerianTeensClassImg,
      title: "Interactive Goal Mapping Session",
      category: "Leadership",
      caption: "Teenagers collaborating in small squads during the purpose discovery workshop."
    },
    {
      id: "gal_2",
      url: ciiHangoutDrills,
      title: "Team Alignment Drills",
      category: "Teamwork",
      caption: "Experiential outdoor leadership drills fostering trust and problem-solving grit."
    },
    {
      id: "gal_3",
      url: ciiHangoutGroup,
      title: "Bootcamp Cohort Celebration",
      category: "Activities",
      caption: "Participants and facilitators celebrating project milestones together."
    },
    {
      id: "gal_4",
      url: nigerianConferenceImg,
      title: "Public Speaking & Debate Stage",
      category: "Leadership",
      caption: "Teen delegates presenting their squad proposals to guest panelists."
    },
    {
      id: "gal_5",
      url: nigerianCareerBootcampImg,
      title: "Hands-on AI & Tech Workshop",
      category: "Technology",
      caption: "Students experimenting with digital design and productivity software."
    },
    {
      id: "gal_6",
      url: heroAfricanYouths,
      title: "Graduation & Certificate Ceremony",
      category: "Graduation",
      caption: "Proud graduates receiving their official certificates of excellence."
    }
  ],

  testimonials: [
    {
      id: "test_1",
      name: "Mrs. Folashade Adeyemi",
      role: "Parent of 2025 Graduate (Lagos)",
      category: "parent",
      quote: "Sending my 15-year-old son to the Right-Minds Teen Bootcamp was the best decision I made last year. Before the bootcamp, he struggled with public speaking and screen addiction. He returned with a clear daily schedule, newfound confidence, and incredible respect for family time!",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80",
      rating: 5
    },
    {
      id: "test_2",
      name: "Tosin Alabi",
      role: "16-year-old Secondary Student (SS2)",
      category: "student",
      quote: "I used to think that leadership was only for head prefects. The bootcamp taught me how to lead myself first. The public speaking practice gave me the courage to participate in inter-school debates, and I even learned how to design posters on Canva!",
      photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&fit=crop&q=80",
      rating: 5
    },
    {
      id: "test_3",
      name: "Rev. Dr. Emmanuel Okafor",
      role: "Principal, Grace Academy Kano",
      category: "school",
      quote: "We sponsored 12 students from our school to attend the Right-Minds bootcamp. The change in their attitude, academic focus, and peer mentorship when they resumed school was noticeable immediately. We recommend this program to every secondary school in Nigeria.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80",
      rating: 5
    }
  ],

  faqs: [
    {
      id: "faq_1",
      question: "What age range is eligible to attend the bootcamp?",
      answer: "The bootcamp is designed for teenagers aged 13 to 19 years, typically covering JS3 to SS3 students, post-UTME candidates, and recent high school graduates.",
      category: "General"
    },
    {
      id: "faq_2",
      question: "Where is the physical venue, and is there a virtual option?",
      answer: "The primary physical bootcamp takes place at the Right Minds Hub Center in Kano State, Nigeria. We also offer a live virtual interactive cohort for teenagers outside Kano or abroad who wish to participate remotely with dedicated online coaches.",
      category: "General"
    },
    {
      id: "faq_3",
      question: "What is the registration fee and what does it cover?",
      answer: "The registration fee is ₦50,000 per participant (Early Bird rate of ₦45,000 available until July 31). The fee includes full 6-day workshop access, custom T-shirt, 12-month Leadership Journal, training workbooks, daily buffet lunch/refreshments, 1-on-1 mentorship session, and official certificate.",
      category: "Registration & Payment"
    },
    {
      id: "faq_4",
      question: "What safety and security measures are in place for participants?",
      answer: "Safety is our topmost priority. The venue features 24/7 security personnel, mandatory visitor check-in, verified adult facilitators, a dedicated medical first-aid unit, and a strict no-unaccompanied-exit rule for all underage participants.",
      category: "Safety & Accommodations"
    },
    {
      id: "faq_5",
      question: "Is accommodation provided for participants coming from outside Kano?",
      answer: "Day attendance is standard. However, supervised partner hotel/hostel lodging options are available upon request for participants traveling from other states. Please contact our administrative desk for accommodation arrangements.",
      category: "Safety & Accommodations"
    },
    {
      id: "faq_6",
      question: "How can secondary schools, churches, or corporate sponsors register a group?",
      answer: "Organizations or schools registering 5 or more teenagers qualify for group discounts. You can complete the registration form or email our desk at bootcamp@rightmindsafrica.org for group invoices and custom onboarding.",
      category: "Registration & Payment"
    }
  ],

  sponsors: [
    {
      id: "sp_1",
      name: "Peak Mind Initiative",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&fit=crop&q=80",
      tier: "Gold Partner",
      websiteUrl: "https://rightmindsafrica.org"
    },
    {
      id: "sp_2",
      name: "Kano Youth Leadership Foundation",
      logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&fit=crop&q=80",
      tier: "Silver Sponsor",
      websiteUrl: "https://rightmindsafrica.org"
    },
    {
      id: "sp_3",
      name: "Growth Mindset Africa",
      logoUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&fit=crop&q=80",
      tier: "Education Ally",
      websiteUrl: "https://rightmindsafrica.org"
    },
    {
      id: "sp_4",
      name: "Purpose Center Foundation",
      logoUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&fit=crop&q=80",
      tier: "Media Partner",
      websiteUrl: "https://rightmindsafrica.org"
    }
  ],

  eventDetails: {
    date: "August 17th – 22nd, 2026 (Mon – Sat, 9:00 AM – 4:00 PM)",
    venue: "Right Minds Hub, Kano State & Virtual Zoom Cohort",
    ageRange: "13 – 19 Years (JS3 to SS3 & Pre-Varsity)",
    fee: "₦50,000 per participant (Early Bird ₦45,000)",
    accommodation: "Day Attendance (Supervised Lodging available on request)",
    closingDate: "August 10th, 2026",
    contactPhone: "+234 814 239 8841",
    contactEmail: "bootcamp@rightmindsafrica.org"
  },

  seo: {
    metaTitle: "Right-Minds Teen Leadership Bootcamp 2026 | Premier Youth Academy in Nigeria",
    metaDescription: "Join the flagship 6-day Teen Leadership Bootcamp in Kano, Nigeria. Empowering teenagers aged 13–19 with purpose, public speaking, artificial intelligence, financial literacy, and executive character.",
    keywords: "Teen Leadership Bootcamp Nigeria, Teenagers Training Kano, Youth Leadership Academy, High School Summer Bootcamp, Public Speaking for Teens Nigeria, AI for Teenagers, Right Minds Africa",
    ogImage: teenBootcampFlyer
  },

  updatedAt: new Date().toISOString(),
  updatedBy: "System Initializer"
};
