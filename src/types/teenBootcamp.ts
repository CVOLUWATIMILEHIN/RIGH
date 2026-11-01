/**
 * Types & Default Interfaces for Right-Minds Teen Leadership Bootcamp 2026 Microsite & CMS
 */

export interface BootcampFacilitator {
  id: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
  photo: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  featured?: boolean;
  order?: number;
}

export interface BootcampRegistration {
  id: string; // e.g. RMA-TB2026-4821
  teenName: string;
  teenAge: number;
  teenGender: string;
  schoolGrade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  cityState: string;
  tshirtSize: string;
  preferredTrack: string;
  specialDietaryHealth?: string;
  paymentMethod: "paystack" | "bank_transfer";
  paymentStatus: "paid" | "pending_transfer" | "verified" | "cancelled";
  paymentReference: string;
  transferReceiptNote?: string;
  amountPaid: number;
  registrationDate: string;
  notes?: string;
}

export interface BootcampLearningTrack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  topics: string[];
  icon: string;
  badgeColor?: string;
}

export interface BootcampDaySchedule {
  day: number;
  title: string;
  theme: string;
  summary: string;
  keyActivities: string[];
  icon: string;
}

export interface BootcampGalleryPhoto {
  id: string;
  url: string;
  title: string;
  category: "Leadership" | "Technology" | "Teamwork" | "Graduation" | "Activities";
  caption: string;
}

export interface BootcampTestimonial {
  id: string;
  name: string;
  role: string; // e.g. "Parent of 2025 Graduate" or "15yo Participant"
  category: "parent" | "student" | "school";
  quote: string;
  photo: string;
  rating?: number;
  videoUrl?: string;
}

export interface BootcampSponsor {
  id: string;
  name: string;
  logoUrl: string;
  tier: "Gold Partner" | "Silver Sponsor" | "Education Ally" | "Media Partner";
  websiteUrl?: string;
}

export interface BootcampFAQItem {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Registration & Payment" | "Safety & Accommodations" | "Curriculum";
}

export interface TeenBootcampConfig {
  id: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  eventDate: string;
  countdownTarget: string; // ISO String
  venue: string;
  ageGroup: string;
  registrationFee: number;
  earlyBirdFee?: number;
  currency: string;
  brochureUrl: string;
  heroFlyerImage: string;
  heroBannerImage: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;

  whyChoosePillars: Array<{
    title: string;
    icon: string;
    description: string;
  }>;

  learningTracks: BootcampLearningTrack[];

  whoShouldAttend: Array<{
    title: string;
    description: string;
    badge: string;
    icon: string;
  }>;

  sixDaySchedule: BootcampDaySchedule[];

  whatParticipantsReceive: Array<{
    title: string;
    description: string;
    icon: string;
  }>;

  parentsSection: {
    headline: string;
    description: string;
    pillars: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };

  facilitators: BootcampFacilitator[];
  galleryImages: BootcampGalleryPhoto[];
  testimonials: BootcampTestimonial[];
  faqs: BootcampFAQItem[];
  sponsors: BootcampSponsor[];

  eventDetails: {
    date: string;
    venue: string;
    ageRange: string;
    fee: string;
    accommodation: string;
    closingDate: string;
    contactPhone: string;
    contactEmail: string;
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };

  updatedAt: string;
  updatedBy?: string;
}
