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

const ALLOWED_VOLUNTEER_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Optimises an image file (JPG, JPEG, PNG, WEBP) for website performance using an offscreen HTML5 Canvas.
 * Resizes images larger than maxDimension (default 900px) and compresses to high-quality WebP/JPEG.
 */
export async function optimizeImageForWeb(
  file: File,
  maxDimension: number = 900,
  quality: number = 0.84
): Promise<{ blob: Blob; dataUrl: string; mimeType: string; ext: string }> {
  const lowerName = (file.name || "").toLowerCase();
  const isAllowedMime = ALLOWED_VOLUNTEER_IMAGE_TYPES.includes(file.type.toLowerCase());
  const isAllowedExt = /\.(jpe?g|png|webp)$/i.test(lowerName);

  if (!isAllowedMime && !isAllowedExt) {
    throw new Error("Unsupported image format. Please upload a JPG, JPEG, PNG, or WEBP photograph.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid or corrupted image file."));
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Browser canvas context unavailable for image optimisation."));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Try WebP first for best web performance, fallback to JPEG
          let targetMime = "image/webp";
          let dataUrl = canvas.toDataURL(targetMime, quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            targetMime = "image/jpeg";
            dataUrl = canvas.toDataURL(targetMime, quality);
          }
          const ext = targetMime === "image/webp" ? "webp" : "jpg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image for upload."));
                return;
              }
              resolve({ blob, dataUrl, mimeType: targetMime, ext });
            },
            targetMime,
            quality
          );
        } catch (err: any) {
          reject(new Error(err?.message || "Image optimisation failed."));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Optimises and uploads a volunteer profile photograph to Supabase Storage ('cms-media' bucket under 'volunteers/').
 * Reports granular progress via onProgress callback and gracefully preserves an optimised web image if storage bucket policies or env vars are pending.
 */
export async function uploadVolunteerPhotoToSupabase(
  file: File,
  volunteerSlugOrId?: string,
  onProgress?: (percent: number, stage: string) => void
): Promise<{
  url: string;
  path: string;
  storageSource: "supabase" | "optimized-inline";
  warning: string | null;
  error: string | null;
}> {
  try {
    onProgress?.(15, "Validating & optimising image for web...");
    const { blob, dataUrl, mimeType, ext } = await optimizeImageForWeb(file, 900, 0.84);
    onProgress?.(45, "Image optimised. Preparing upload...");

    const safePrefix = (volunteerSlugOrId || "volunteer")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    const storagePath = `volunteers/${safePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    if (supabase && isSupabaseConfigured) {
      onProgress?.(70, "Uploading to Supabase Storage (cms-media)...");
      const { data, error } = await supabase.storage
        .from("cms-media")
        .upload(storagePath, blob, {
          contentType: mimeType,
          cacheControl: "3600",
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("cms-media")
          .getPublicUrl(data.path);
        onProgress?.(100, "Upload complete!");
        return {
          url: publicUrlData.publicUrl,
          path: data.path,
          storageSource: "supabase",
          warning: null,
          error: null
        };
      }

      // If Supabase Storage returned an RLS or bucket error, still complete using the optimised web image so admin work is never lost
      onProgress?.(100, "Optimised image ready (Supabase bucket fallback)");
      return {
        url: dataUrl,
        path: storagePath,
        storageSource: "optimized-inline",
        warning: error?.message
          ? `Supabase Storage notice (${error.message}) — using optimised web image directly.`
          : null,
        error: null
      };
    }

    onProgress?.(100, "Optimised image ready");
    return {
      url: dataUrl,
      path: storagePath,
      storageSource: "optimized-inline",
      warning: null,
      error: null
    };
  } catch (err: any) {
    return {
      url: "",
      path: "",
      storageSource: "optimized-inline",
      warning: null,
      error: err?.message || "Failed to process and upload photograph."
    };
  }
}

