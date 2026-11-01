import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from Vite environment variables or window/fallback
// Checks both VITE_ prefixed and standard variables for maximum flexibility
const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : ({} as Record<string, string>);

export const SUPABASE_URL: string = 
  env.VITE_SUPABASE_URL || 
  env.SUPABASE_URL || 
  (typeof window !== "undefined" && (window as any).__SUPABASE_URL__) || 
  "";

export const SUPABASE_ANON_KEY: string = 
  env.VITE_SUPABASE_ANON_KEY || 
  env.SUPABASE_ANON_KEY || 
  (typeof window !== "undefined" && (window as any).__SUPABASE_ANON_KEY__) || 
  "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.trim().length > 0 && 
  SUPABASE_ANON_KEY && 
  SUPABASE_ANON_KEY.trim().length > 0 &&
  SUPABASE_URL.startsWith("http")
);

// Create Supabase singleton client
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

/**
 * Helper to upload images directly to Supabase Storage in the public bucket 'cms-media'.
 * Returns the public URL of the uploaded asset.
 */
export async function uploadImageToSupabase(
  fileOrBlob: File | Blob, 
  bucket: string = "cms-media",
  customPath?: string
): Promise<{ url: string; error: string | null }> {
  if (!supabase) {
    return { url: "", error: "Supabase client is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY." };
  }

  try {
    const fileExt = fileOrBlob instanceof File && fileOrBlob.name ? fileOrBlob.name.split(".").pop() : "png";
    const fileName = customPath || `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileOrBlob, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      return { url: "", error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: "", error: err.message || "Failed to upload image" };
  }
}
