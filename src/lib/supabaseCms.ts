/**
 * Supabase CMS Service
 * 
 * Provides centralized fetching, saving, deleting, seeding, and real-time subscription
 * logic for all CMS content (site_settings, pages, events, programs, team_members, 
 * blog_posts, gallery, testimonials, announcements) using Supabase as the primary shared database.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { CMSConfig, DEFAULT_CMS } from "../components/AdminCMS";
import { EventModel } from "../components/AdminEvents";
import { TeamMember } from "./db";
import { PlatformTestimonial } from "./db";
import { WebsitePopup } from "../types";
import { GalleryItem, GALLERY_ITEMS } from "../types";

export interface SupabaseCMSState {
  cmsConfig: CMSConfig;
  events: EventModel[];
  teamMembers: TeamMember[];
  testimonials: PlatformTestimonial[];
  gallery: GalleryItem[];
  popups: WebsitePopup[];
  siteSettings: Record<string, any>;
  loading: boolean;
  error: string | null;
}

// Memory cache for instantaneous renders
let memoryCache: {
  cmsConfig?: CMSConfig;
  events?: EventModel[];
  teamMembers?: TeamMember[];
  testimonials?: PlatformTestimonial[];
  gallery?: GalleryItem[];
  popups?: WebsitePopup[];
  siteSettings?: Record<string, any>;
} = {};

/**
 * Fetch all CMS Content from Supabase with graceful fallback to defaults
 */
export async function fetchAllCMSFromSupabase(): Promise<{
  cmsConfig: CMSConfig;
  events: EventModel[];
  teamMembers: TeamMember[];
  testimonials: PlatformTestimonial[];
  gallery: GalleryItem[];
  popups: WebsitePopup[];
  siteSettings: Record<string, any>;
  source: "supabase" | "default";
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      cmsConfig: memoryCache.cmsConfig || DEFAULT_CMS,
      events: memoryCache.events || [],
      teamMembers: memoryCache.teamMembers || [],
      testimonials: memoryCache.testimonials || [],
      gallery: memoryCache.gallery || GALLERY_ITEMS,
      popups: memoryCache.popups || [],
      siteSettings: memoryCache.siteSettings || {},
      source: "default"
    };
  }

  try {
    const [
      pagesRes,
      eventsRes,
      teamRes,
      testimonialsRes,
      galleryRes,
      announcementsRes,
      settingsRes
    ] = await Promise.all([
      supabase.from("pages").select("*").eq("slug", "home").maybeSingle(),
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("team_members").select("*").order("order", { ascending: true }),
      supabase.from("testimonials").select("*").order("order", { ascending: true }),
      supabase.from("gallery").select("*").order("order", { ascending: true }),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*")
    ]);

    // Parse CMS Config
    let resolvedCmsConfig: CMSConfig = DEFAULT_CMS;
    if (pagesRes.data && pagesRes.data.content) {
      resolvedCmsConfig = {
        ...DEFAULT_CMS,
        ...(pagesRes.data.content as CMSConfig)
      };
      memoryCache.cmsConfig = resolvedCmsConfig;
    }

    // Parse Events
    let resolvedEvents: EventModel[] = [];
    if (eventsRes.data && eventsRes.data.length > 0) {
      resolvedEvents = eventsRes.data.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description || "",
        category: row.category || "YAP Conference",
        date: row.date || "",
        time: row.time || "",
        venue: row.venue || "",
        capacity: row.capacity || 100,
        registeredCount: row.registered_count || 0,
        status: row.status || "Published",
        bannerUrl: row.banner_url || "",
        createdAt: row.created_at || new Date().toISOString()
      }));
      memoryCache.events = resolvedEvents;
    }

    // Parse Team Members
    let resolvedTeam: TeamMember[] = [];
    if (teamRes.data && teamRes.data.length > 0) {
      resolvedTeam = teamRes.data.map((row: any) => ({
        id: row.id,
        name: row.name,
        title: row.title || "",
        credentials: row.credentials || "",
        role: row.role || "",
        photo: row.photo || "",
        bio: row.bio || "",
        hubs: row.hubs || [],
        socials: row.socials || {},
        accent: row.accent || "",
        order: row.order || 1
      }));
      memoryCache.teamMembers = resolvedTeam;
    }

    // Parse Testimonials
    let resolvedTestimonials: PlatformTestimonial[] = [];
    if (testimonialsRes.data && testimonialsRes.data.length > 0) {
      resolvedTestimonials = testimonialsRes.data.map((row: any) => ({
        id: row.id,
        name: row.name,
        role: row.role || "",
        quote: row.quote || "",
        rating: row.rating || 5,
        enabled: row.enabled ?? true,
        order: row.order || 1,
        timestamp: row.timestamp || new Date().toISOString()
      }));
      memoryCache.testimonials = resolvedTestimonials;
    }

    // Parse Gallery
    let resolvedGallery: GalleryItem[] = [];
    if (galleryRes.data && galleryRes.data.length > 0) {
      resolvedGallery = galleryRes.data.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category as any,
        image: row.image_url || row.image || "",
        url: row.image_url || row.image || "",
        description: row.description,
        date: row.date || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        order: row.order
      }));
      memoryCache.gallery = resolvedGallery;
    }

    // Parse Popups / Announcements
    let resolvedPopups: WebsitePopup[] = [];
    if (announcementsRes.data && announcementsRes.data.length > 0) {
      resolvedPopups = announcementsRes.data.map((row: any) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: (row.type || "announcement") as any,
        isActive: row.is_active ?? true,
        link: row.link,
        ...(row.metadata || {})
      }));
      memoryCache.popups = resolvedPopups;
    }

    // Parse Site Settings
    const resolvedSettings: Record<string, any> = {};
    if (settingsRes.data) {
      for (const item of settingsRes.data) {
        resolvedSettings[item.key || item.id] = item.data;
      }
      memoryCache.siteSettings = resolvedSettings;
    }

    return {
      cmsConfig: resolvedCmsConfig,
      events: resolvedEvents,
      teamMembers: resolvedTeam,
      testimonials: resolvedTestimonials,
      gallery: resolvedGallery,
      popups: resolvedPopups,
      siteSettings: resolvedSettings,
      source: "supabase"
    };
  } catch (err) {
    console.warn("Could not fetch CMS content from Supabase:", err);
    return {
      cmsConfig: memoryCache.cmsConfig || DEFAULT_CMS,
      events: memoryCache.events || [],
      teamMembers: memoryCache.teamMembers || [],
      testimonials: memoryCache.testimonials || [],
      gallery: memoryCache.gallery || GALLERY_ITEMS,
      popups: memoryCache.popups || [],
      siteSettings: memoryCache.siteSettings || {},
      source: "default"
    };
  }
}

/**
 * Save CMS Config (Hero, copy, about, contact) to Supabase
 */
export async function saveCMSConfigToSupabase(config: CMSConfig): Promise<{ success: boolean; error: string | null }> {
  memoryCache.cmsConfig = config;
  window.dispatchEvent(new CustomEvent("rma_supabase_cms_updated", { detail: config }));

  if (!supabase || !isSupabaseConfigured) {
    return { success: true, error: "Note: Saved locally. Add SUPABASE_URL and SUPABASE_ANON_KEY to sync across devices." };
  }

  try {
    const { error } = await supabase.from("pages").upsert({
      id: "page-home",
      slug: "home",
      title: "Homepage CMS Configuration",
      content: config
    }, { onConflict: "slug" });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save CMS configuration" };
  }
}

/**
 * Save Events to Supabase
 */
export async function saveEventToSupabase(event: EventModel): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true, error: "Saved locally. Supabase credentials not set." };
  }

  try {
    const { error } = await supabase.from("events").upsert({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      venue: event.venue,
      capacity: event.capacity,
      registered_count: event.registeredCount,
      status: event.status,
      banner_url: event.bannerUrl
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save event" };
  }
}

/**
 * Delete Event from Supabase
 */
export async function deleteEventFromSupabase(eventId: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save Team Member to Supabase
 */
export async function saveTeamMemberToSupabase(member: TeamMember): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: "Saved locally." };

  try {
    const { error } = await supabase.from("team_members").upsert({
      id: member.id,
      name: member.name,
      title: member.title,
      credentials: member.credentials,
      role: member.role,
      photo: member.photo,
      bio: member.bio,
      hubs: member.hubs || [],
      socials: member.socials || {},
      accent: member.accent,
      order: member.order || 1
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete Team Member from Supabase
 */
export async function deleteTeamMemberFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save Testimonial to Supabase
 */
export async function saveTestimonialToSupabase(testimonial: PlatformTestimonial): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: "Saved locally." };

  try {
    const { error } = await supabase.from("testimonials").upsert({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      rating: testimonial.rating || 5,
      enabled: testimonial.enabled ?? true,
      order: testimonial.order || 1
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete Testimonial from Supabase
 */
export async function deleteTestimonialFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save Gallery Item to Supabase
 */
export async function saveGalleryItemToSupabase(item: GalleryItem): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: "Saved locally." };

  try {
    const { error } = await supabase.from("gallery").upsert({
      id: item.id,
      title: item.title,
      category: item.category,
      image_url: item.url,
      description: item.description,
      order: item.order || 1
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete Gallery Item from Supabase
 */
export async function deleteGalleryItemFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Subscribe to Supabase Realtime changes for all CMS tables.
 * When any table changes, callback is fired immediately so visitors see updates without page refresh.
 */
export function subscribeToSupabaseCMSRealtime(onUpdate: (table: string, payload: any) => void): () => void {
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel("cms-realtime-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "pages" }, (payload) => {
      onUpdate("pages", payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
      onUpdate("events", payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, (payload) => {
      onUpdate("team_members", payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "testimonials" }, (payload) => {
      onUpdate("testimonials", payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "gallery" }, (payload) => {
      onUpdate("gallery", payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, (payload) => {
      onUpdate("announcements", payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, (payload) => {
      onUpdate("site_settings", payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * ONE-TIME "Seed Database" ACTION
 * Seeds default CMS config, sample events, team members, testimonials, gallery, and site settings into Supabase
 */
export async function seedSupabaseDatabase(initialData?: {
  cms?: CMSConfig;
  events?: EventModel[];
  team?: TeamMember[];
  testimonials?: PlatformTestimonial[];
  gallery?: GalleryItem[];
}): Promise<{ success: boolean; seededCount: number; message: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      seededCount: 0,
      message: "Supabase client is not connected. Please define SUPABASE_URL and SUPABASE_ANON_KEY first.",
      error: "Missing credentials"
    };
  }

  try {
    let count = 0;

    // 1. Seed Pages / CMS Config
    const targetCms = initialData?.cms || DEFAULT_CMS;
    const { error: pageErr } = await supabase.from("pages").upsert({
      id: "page-home",
      slug: "home",
      title: "Homepage CMS Configuration",
      content: targetCms
    }, { onConflict: "slug" });
    if (pageErr) throw new Error(`Pages table error: ${pageErr.message}`);
    count++;

    // 2. Seed Events
    const defaultEventsList: EventModel[] = [
      {
        id: "evt-1",
        title: "Youth Alignment Program (YAP) Annual Summit 2026",
        description: "Our flagship annual conference gathering over 1,500 young leaders, professionals, and change-makers in Lagos for deep spiritual alignment, executive career mentorship, and mindset re-engineering masterclasses.",
        category: "YAP Conference",
        date: "2026-11-14",
        time: "09:00 AM",
        venue: "Main Hall, University of Lagos (UNILAG) Guest House, Akoka, Lagos",
        capacity: 1500,
        registeredCount: 842,
        status: "Published",
        bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&fit=crop&q=80",
        createdAt: "2026-05-15T09:00:00Z"
      },
      {
        id: "evt-2",
        title: "CII Leadership Orientation Camp & Career Boot Camp",
        description: "Equipping recently deployed NYSC corps members with advanced digital career tools, mock corporate panel reviews, WAEC mentorship training structures, and physical savings alignment blueprints.",
        category: "CII Programs",
        date: "2026-07-18",
        time: "10:00 AM",
        venue: "NYSC Secretariat Multipurpose Hall, Surulere, Lagos",
        capacity: 400,
        registeredCount: 156,
        status: "Published",
        bannerUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&fit=crop&q=80",
        createdAt: "2026-05-12T10:00:00Z"
      }
    ];

    const targetEvents = (initialData?.events && initialData.events.length > 0) ? initialData.events : defaultEventsList;
    for (const evt of targetEvents) {
      const { error: evtErr } = await supabase.from("events").upsert({
        id: evt.id,
        title: evt.title,
        description: evt.description,
        category: evt.category,
        date: evt.date,
        time: evt.time,
        venue: evt.venue,
        capacity: evt.capacity,
        registered_count: evt.registeredCount,
        status: evt.status,
        banner_url: evt.bannerUrl
      });
      if (evtErr) console.warn("Event seed error:", evtErr.message);
      else count++;
    }

    // 3. Seed Team Members
    const defaultTeamList: TeamMember[] = [
      {
        id: "gracious_esther",
        name: "Gracious-Esther",
        title: "Founder & Executive Director",
        credentials: "Soundmind-DOCTOR",
        role: "Growth-Mindset, Leadership & Productivity Coach",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&fit=crop&q=80",
        bio: "Gracious-Esther is a certified coach committed to raising a generation of purpose-minded individuals equipped with discipline, spiritual alignment, and focus. As Founder and Executive Director of Right Minds Africa Hub, she has reached over 1,000+ young people dynamically.",
        hubs: ["Founder & Executive Director (ED)", "Abuja FCT", "Lagos"],
        socials: { email: "mentor@rightminds.africa", linkedin: "https://linkedin.com" },
        accent: "border-brand-orange text-brand-orange",
        order: 1
      },
      {
        id: "olasunde_louis",
        name: "Oluwatimilehin Vicent O. (CV)",
        title: "Tech/Media Team Lead",
        credentials: "B.Ed. Guidance & Counseling",
        role: "Creative Brand & Visual Communication Architect",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop&q=80",
        bio: "Olosunde Oluwatimilehin Vicent is a multidisciplinary creative professional and Product Designer (UI/UX Designer) with experience spanning graphic design, visual storytelling, video editing, media strategy, social media management, live streaming, and ICT operations.",
        hubs: ["National Media & Tech Command HQ", "National Headquarters Hub", "Virtual Chapters Operations"],
        socials: { email: "creative@rightminds.africa", linkedin: "https://www.linkedin.com/in/vicentcv" },
        accent: "border-brand-blue text-brand-blue",
        order: 2
      }
    ];

    const targetTeam = (initialData?.team && initialData.team.length > 0) ? initialData.team : defaultTeamList;
    for (const mem of targetTeam) {
      const { error: teamErr } = await supabase.from("team_members").upsert({
        id: mem.id,
        name: mem.name,
        title: mem.title,
        credentials: mem.credentials,
        role: mem.role,
        photo: mem.photo,
        bio: mem.bio,
        hubs: mem.hubs || [],
        socials: mem.socials || {},
        accent: mem.accent || "",
        order: mem.order || 1
      });
      if (teamErr) console.warn("Team seed error:", teamErr.message);
      else count++;
    }

    // 4. Seed Testimonials
    const defaultTestimonialsList: PlatformTestimonial[] = [
      {
        id: "test-1",
        name: "Chidem Ebuka",
        role: "Software Engineer Intern",
        quote: "The Corper Impact Initiative (CII) redefined my career mapping during NYSC. I learned remote job prospecting, tailored my LinkedIn, and landed a role right after my Pop out!",
        order: 1,
        enabled: true,
        rating: 5,
        timestamp: new Date().toISOString()
      },
      {
        id: "test-2",
        name: "Adebayo Adesina",
        role: "Final Year Student (Unilag)",
        quote: "YAP Conference was an absolute mental shift. Hearing from seasoned speakers who look like me made me realize background limitations don't define excellence.",
        order: 2,
        enabled: true,
        rating: 5,
        timestamp: new Date().toISOString()
      },
      {
        id: "test-3",
        name: "Tosin Alabi",
        role: "Secondary School Graduate",
        quote: "Under the Right-Minded Teens mentorship, I discovered essential growth mindset rules. My WAEC study approach changed and I cleared WAEC in one sitting.",
        order: 3,
        enabled: true,
        rating: 5,
        timestamp: new Date().toISOString()
      }
    ];

    const targetTestimonials = (initialData?.testimonials && initialData.testimonials.length > 0) ? initialData.testimonials : defaultTestimonialsList;
    for (const t of targetTestimonials) {
      const { error: tErr } = await supabase.from("testimonials").upsert({
        id: t.id,
        name: t.name,
        role: t.role,
        quote: t.quote,
        rating: t.rating || 5,
        enabled: t.enabled ?? true,
        order: t.order || 1
      });
      if (tErr) console.warn("Testimonial seed error:", tErr.message);
      else count++;
    }

    // 5. Seed Gallery Items
    const targetGallery = (initialData?.gallery && initialData.gallery.length > 0) ? initialData.gallery : GALLERY_ITEMS;
    for (const g of targetGallery) {
      const { error: gErr } = await supabase.from("gallery").upsert({
        id: g.id,
        title: g.title,
        category: g.category,
        image_url: g.url,
        description: g.description,
        order: g.order || 1
      });
      if (gErr) console.warn("Gallery seed error:", gErr.message);
      else count++;
    }

    // 6. Seed Site Settings
    const { error: setErr } = await supabase.from("site_settings").upsert({
      id: "general",
      key: "general",
      data: {
        siteName: "Right Minds Africa Hub & Corper Impact Initiative",
        tagline: "Building Africa's Next Generation of Purpose-Driven Leaders",
        supportEmail: "rightmindsafrica@gmail.com",
        supportPhone: "+234 803 980 9016",
        officeAddress: "Lagos Hub, Oyo Chapter Secretariat, Nigeria",
        seededAt: new Date().toISOString()
      }
    });
    if (!setErr) count++;

    return {
      success: true,
      seededCount: count,
      message: `Successfully seeded ${count} default CMS documents into Supabase! Public website and admin are now synced.`
    };
  } catch (err: any) {
    return {
      success: false,
      seededCount: 0,
      message: `Failed to seed database: ${err.message || err}`,
      error: err.message
    };
  }
}
