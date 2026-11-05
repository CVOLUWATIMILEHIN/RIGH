import { useState, useEffect } from "react";
import brandLogoDefault from "../assets/images/brand_logo_official_new_1780385523572.png";

export interface BrandConfig {
  brandName: string;            // e.g. "Right Minds Africa" or "Brainbench Technology"
  brandShortName: string;       // e.g. "RightMinds"
  brandAcronym: string;         // e.g. "RMA" or "BBT"
  brandSubTitle: string;        // e.g. "AFRICA HUB" or "DIGITAL INNOVATION"
  tagline: string;              // e.g. "Leadership, Personal Transformation & Career Acceleration"
  portalTitle: string;          // e.g. "OPERATIONS CENTRE" or "COMMAND DASHBOARD"
  logoUrl: string;              // Base64 data URL or external URL
  primaryColor: string;         // Primary brand color, e.g. "#103D2E"
  accentColor: string;          // Accent color, e.g. "#F59E0B"
  secondaryColor: string;       // Secondary highlight, e.g. "#2ECC71"
  supportEmail: string;         // Official contact email
  supportPhone: string;         // Contact phone number
  officeAddress: string;        // Physical address or headquarters
  websiteUrl: string;           // Canonical website URL
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    whatsapp?: string;
  };
  metaTitle: string;            // SEO title
  metaDescription: string;      // SEO description
  superAdminEmail: string;      // Main super administrator email
  copyrightYear: string;        // e.g. "2026"
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: "Right Minds Africa",
  brandShortName: "RightMinds",
  brandAcronym: "RMA",
  brandSubTitle: "AFRICA HUB",
  tagline: "Empowering youth leadership, personal transformation, digital skills, and economic independence across Africa.",
  portalTitle: "OPERATIONS CENTRE",
  logoUrl: brandLogoDefault,
  primaryColor: "#103D2E",
  accentColor: "#F59E0B",
  secondaryColor: "#2ECC71",
  supportEmail: "rightmindsafrica@gmail.com",
  supportPhone: "+234 803 980 9016",
  officeAddress: "Lagos, Ibadan & Osogbo Hubs, Nigeria",
  websiteUrl: "https://rightmindsafrica.org",
  socialLinks: {
    twitter: "https://twitter.com/rightmindsafrica",
    linkedin: "https://linkedin.com/company/right-minds-africa",
    instagram: "https://instagram.com/rightmindsafrica",
    youtube: "https://youtube.com/@rightmindsafrica",
    facebook: "https://www.facebook.com/RightMAHub",
    whatsapp: "https://wa.me/2348039809016"
  },
  metaTitle: "Right Minds Africa Hub | Youth Leadership & Operations Portal",
  metaDescription: "Right Minds Africa Hub is a premier growth-mindset, leadership, and productivity training hub for young professionals, undergraduates, and corps members.",
  superAdminEmail: "olosundelouis@gmail.com",
  copyrightYear: "2026"
};

export interface BrandPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Partial<BrandConfig>;
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: "rma",
    name: "Right Minds Africa (Default)",
    description: "Original leadership, youth transformation, NYSC corper initiatives, and social impact hub.",
    category: "Non-Profit & Youth NGO",
    config: {
      brandName: "Right Minds Africa",
      brandShortName: "RightMinds",
      brandAcronym: "RMA",
      brandSubTitle: "AFRICA HUB",
      tagline: "Empowering youth leadership, personal transformation, digital skills, and economic independence across Africa.",
      portalTitle: "OPERATIONS CENTRE",
      logoUrl: brandLogoDefault,
      primaryColor: "#103D2E",
      accentColor: "#F59E0B",
      secondaryColor: "#2ECC71",
      supportEmail: "rightmindsafrica@gmail.com",
      supportPhone: "+234 803 980 9016",
      officeAddress: "Lagos, Ibadan & Osogbo Hubs, Nigeria",
      metaTitle: "Right Minds Africa Hub | Youth Leadership & Operations Portal"
    }
  },
  {
    id: "brainbench",
    name: "Brainbench Technology & Creative Studio",
    description: "Design-led ICT, UI/UX training academy, digital learning products, and media innovation lab.",
    category: "Tech Academy & Digital Agency",
    config: {
      brandName: "Brainbench Technology",
      brandShortName: "Brainbench",
      brandAcronym: "BBT",
      brandSubTitle: "CREATIVE & TECH LAB",
      tagline: "Inspiring digital innovation, cutting-edge UI/UX product design, technology adoption, and practical skills.",
      portalTitle: "STUDIO COMMAND",
      primaryColor: "#0F172A",
      accentColor: "#38BDF8",
      secondaryColor: "#6366F1",
      supportEmail: "hello@brainbenchtech.com",
      supportPhone: "+234 803 123 4567",
      officeAddress: "Brainbench Innovation Campus, Nigeria",
      metaTitle: "Brainbench Technology | Product Design & Creative Academy"
    }
  },
  {
    id: "technova",
    name: "TechNova Skills & Innovation Hub",
    description: "Modern software development bootcamp, engineering workshops, and career acceleration center.",
    category: "EdTech & Software Hub",
    config: {
      brandName: "TechNova Innovation Hub",
      brandShortName: "TechNova",
      brandAcronym: "TNH",
      brandSubTitle: "SKILLS ACADEMY",
      tagline: "Bridging the African tech talent gap through rigorous engineering programs and mentorship.",
      portalTitle: "CAMPUS CONTROL",
      primaryColor: "#1E1B4B",
      accentColor: "#EC4899",
      secondaryColor: "#8B5CF6",
      supportEmail: "admissions@technovahub.io",
      supportPhone: "+234 705 987 6543",
      officeAddress: "Victoria Island Tech Corridor, Lagos",
      metaTitle: "TechNova Hub | Premier Coding & Career Bootcamp"
    }
  },
  {
    id: "uplift",
    name: "Uplift Youth & Leadership Foundation",
    description: "Community empowerment, mentorship fellowships, scholarship matching, and grassroots outreach.",
    category: "Community Impact & Foundation",
    config: {
      brandName: "Uplift Africa Foundation",
      brandShortName: "Uplift",
      brandAcronym: "UAF",
      brandSubTitle: "FOUNDATION HUB",
      tagline: "Unlocking human potential through holistic mentorship, educational grants, and civic action.",
      portalTitle: "FOUNDATION DESK",
      primaryColor: "#064E3B",
      accentColor: "#FBBF24",
      secondaryColor: "#10B981",
      supportEmail: "info@upliftafrica.org",
      supportPhone: "+234 809 555 1212",
      officeAddress: "Abuja Central & Regional Chapters",
      metaTitle: "Uplift Africa Foundation | Leadership & Civic Empowerment"
    }
  },
  {
    id: "white_label",
    name: "Neutral White-Label Portal",
    description: "Clean slate baseline ready for any private business, corporate training department, or consulting firm.",
    category: "Corporate & White-Label",
    config: {
      brandName: "Enterprise Academy",
      brandShortName: "Enterprise",
      brandAcronym: "EA",
      brandSubTitle: "GLOBAL PORTAL",
      tagline: "Accelerate professional excellence and executive learning with our enterprise portal.",
      portalTitle: "ADMINISTRATION PORTAL",
      primaryColor: "#18181B",
      accentColor: "#2563EB",
      secondaryColor: "#10B981",
      supportEmail: "contact@enterpriseportal.com",
      supportPhone: "+234 800 000 0000",
      officeAddress: "Global Operations Center",
      metaTitle: "Enterprise Academy | CMS & LMS Portal"
    }
  }
];

const STORAGE_KEY = "rma_custom_brand_config";
const BRAND_EVENT_NAME = "brand_config_updated";

export function getBrandConfig(): BrandConfig {
  if (typeof window === "undefined") {
    return DEFAULT_BRAND_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_BRAND_CONFIG,
        ...parsed,
        socialLinks: {
          ...DEFAULT_BRAND_CONFIG.socialLinks,
          ...(parsed.socialLinks || {})
        }
      };
    }
  } catch (err) {
    console.warn("Failed to parse brand config from localStorage:", err);
  }
  return DEFAULT_BRAND_CONFIG;
}

export function saveBrandConfig(updated: Partial<BrandConfig>): BrandConfig {
  const current = getBrandConfig();
  const merged: BrandConfig = {
    ...current,
    ...updated,
    socialLinks: {
      ...current.socialLinks,
      ...(updated.socialLinks || {})
    }
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      // Dispatch an event so all mounted components update reactively
      window.dispatchEvent(new CustomEvent(BRAND_EVENT_NAME, { detail: merged }));
    } catch (err) {
      console.error("Failed to save brand config:", err);
    }
  }

  return merged;
}

export function resetBrandConfigToDefault(): BrandConfig {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(BRAND_EVENT_NAME, { detail: DEFAULT_BRAND_CONFIG }));
    } catch (err) {}
  }
  return DEFAULT_BRAND_CONFIG;
}

export function exportBrandConfigJSON(): string {
  const config = getBrandConfig();
  return JSON.stringify(config, null, 2);
}

export function importBrandConfigJSON(jsonText: string): BrandConfig {
  try {
    const parsed = JSON.parse(jsonText);
    return saveBrandConfig(parsed);
  } catch (err) {
    throw new Error("Invalid brand JSON format. Please verify the file contents.");
  }
}

/**
 * Custom React Hook to consume brand configuration with live reactivity
 */
export function useBrandConfig(): {
  brand: BrandConfig;
  updateBrand: (updated: Partial<BrandConfig>) => BrandConfig;
  resetBrand: () => BrandConfig;
} {
  const [brand, setBrand] = useState<BrandConfig>(() => getBrandConfig());

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<BrandConfig>;
      if (customEvent.detail) {
        setBrand(customEvent.detail);
      } else {
        setBrand(getBrandConfig());
      }
    };

    window.addEventListener(BRAND_EVENT_NAME, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(BRAND_EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    brand,
    updateBrand: saveBrandConfig,
    resetBrand: resetBrandConfigToDefault
  };
}
