import { createClient } from "@supabase/supabase-js";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

const FIREBASE_CONFIG = {
  projectId: "rightmind-african-hub",
  appId: "1:773127969332:web:0234cc96f67ecdcd678861",
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBpRxsFugEu8RwO1PV7AkOPq_xfz8qgc9U",
  authDomain: "rightmind-african-hub.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-e4b5d071-b5f6-4b34-8c74-ef5cd4aa6c65",
  storageBucket: "rightmind-african-hub.firebasestorage.app",
  messagingSenderId: "773127969332"
};

let cachedDb = null;
function getServerFirestore() {
  if (cachedDb) return cachedDb;
  try {
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    cachedDb = initializeFirestore(
      app,
      { ignoreUndefinedProperties: true },
      FIREBASE_CONFIG.firestoreDatabaseId
    );
    return cachedDb;
  } catch {
    return null;
  }
}

function isPlaceholder(val) {
  if (!val || typeof val !== "string") return true;
  const t = val.trim();
  if (!t) return true;
  if (
    t.includes("your-project-id.supabase.co") ||
    t.includes("your-anon-public-api-key") ||
    t === "undefined" ||
    t === "null"
  ) {
    return true;
  }
  return false;
}

async function resolveSupabaseClients(db) {
  let url =
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  let anonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if ((isPlaceholder(url) || isPlaceholder(anonKey)) && db) {
    try {
      const snap = await getDoc(doc(db, "settings", "supabase_config"));
      if (snap.exists()) {
        const data = snap.data();
        if (isPlaceholder(url) && !isPlaceholder(data?.supabaseUrl)) {
          url = data.supabaseUrl.trim();
        }
        if (isPlaceholder(anonKey) && !isPlaceholder(data?.supabaseAnonKey)) {
          anonKey = data.supabaseAnonKey.trim();
        }
      }
    } catch {}
  }

  const cleanUrl = isPlaceholder(url) ? "" : url.trim();
  const cleanAnonKey = isPlaceholder(anonKey) ? "" : anonKey.trim();
  const cleanWriteKey = !isPlaceholder(serviceKey) ? serviceKey.trim() : cleanAnonKey;

  if (!cleanUrl || !cleanWriteKey || !cleanUrl.startsWith("http")) {
    return {
      configured: false,
      client: null,
      publicUrl: "",
      publicAnonKey: ""
    };
  }

  const client = createClient(cleanUrl, cleanWriteKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return {
    configured: true,
    client,
    publicUrl: cleanUrl,
    publicAnonKey: cleanAnonKey
  };
}

function sanitizeVolunteerRecord(row, publicOnly = false) {
  const expertise = Array.isArray(row.expertise)
    ? row.expertise
    : typeof row.expertise === "string" && row.expertise.trim()
    ? row.expertise.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const departments = Array.isArray(row.departments) && row.departments.length > 0
    ? row.departments
    : typeof row.department === "string" && row.department.trim()
    ? row.department.split(" | ").map((s) => s.trim()).filter(Boolean)
    : ["CREATIVES"];

  const record = {
    id: row.id,
    full_name: row.full_name || "",
    slug: row.slug || row.id,
    role: row.position || row.role || "",
    position: row.position || row.role || "",
    department: row.department || departments.join(" | ") || "CREATIVES",
    departments,
    biography: row.biography || "",
    expertise,
    photo_url: row.photo_url || "",
    photo_path: row.photo_path || "",
    linkedin_url: row.linkedin_url || "",
    date_onboarded:
      row.date_onboarded ||
      (row.created_at ? String(row.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10)),
    status: row.status || "Draft",
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };

  record.email = publicOnly ? "" : row.email || "";

  return record;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const db = getServerFirestore();
  const supa = await resolveSupabaseClients(db);

  try {
    // =========================================================================
    // GET: Retrieve Volunteers (Public Published Only or Full CMS List)
    // =========================================================================
    if (req.method === "GET") {
      const publicOnly =
        req.query?.publicOnly === "true" ||
        req.query?.publicOnly === "1" ||
        req.query?.published === "true" ||
        req.query?.published === "1";

      const mergedMap = new Map();
      const deletedIds = new Set();
      let supabaseFetched = false;
      let firestoreFetched = false;
      let supabaseError = null;

      // 1. Read from Cloud Firestore first (tracks both active records and _deleted tombstones)
      if (db) {
        try {
          const snap = await getDocs(collection(db, "volunteers"));
          firestoreFetched = true;
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (!data) return;
            if (data._deleted) {
              deletedIds.add(docSnap.id);
              return;
            }
            const rec = sanitizeVolunteerRecord(
              { ...data, id: data.id || docSnap.id },
              publicOnly
            );
            if (!publicOnly || rec.status === "Published") {
              mergedMap.set(rec.id, rec);
            }
          });
        } catch (fbErr) {
          console.warn("[/api/volunteers] Firestore GET warning:", fbErr?.message || fbErr);
        }
      }

      // 2. Read from Supabase `volunteers` table
      if (supa.configured && supa.client) {
        try {
          const publicCols =
            "id, full_name, slug, role, department, biography, expertise, photo_url, photo_path, linkedin_url, date_onboarded, status, created_at, updated_at";
          const cols = publicOnly ? publicCols : `${publicCols}, email`;

          let query = supa.client
            .from("volunteers")
            .select(cols)
            .order("date_onboarded", { ascending: false });

          if (publicOnly) {
            query = query.eq("status", "Published");
          }

          const { data, error } = await query;
          if (error) {
            supabaseError = error.message;
          } else if (Array.isArray(data)) {
            supabaseFetched = true;
            for (const row of data) {
              if (deletedIds.has(row.id)) continue;
              const rec = sanitizeVolunteerRecord(row, publicOnly);
              const existing = mergedMap.get(rec.id);
              if (
                !existing ||
                new Date(rec.updated_at || 0).getTime() >=
                  new Date(existing.updated_at || 0).getTime()
              ) {
                mergedMap.set(rec.id, rec);
              }
            }
          }
        } catch (sErr) {
          supabaseError = sErr?.message || "Supabase query error";
        }
      }

      const volunteers = Array.from(mergedMap.values()).sort((a, b) => {
        const tA = new Date(a.date_onboarded || a.created_at || 0).getTime();
        const tB = new Date(b.date_onboarded || b.created_at || 0).getTime();
        return tB - tA;
      });

      return res.status(200).json({
        volunteers,
        supabaseConfigured: supa.configured,
        supabaseUrl: supa.publicUrl,
        supabaseAnonKey: supa.publicAnonKey,
        sources: {
          supabase: supabaseFetched,
          firestore: firestoreFetched
        },
        supabaseError
      });
    }

    // =========================================================================
    // POST / PUT: Save Volunteer Record (or Save Runtime Supabase Config)
    // =========================================================================
    if (req.method === "POST" || req.method === "PUT") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};

      // Allow admin to save shared Supabase URL + Anon Key in Cloud Settings so all devices connect
      if (body.action === "save_supabase_config") {
        const nextUrl = String(body.supabaseUrl || "").trim();
        const nextKey = String(body.supabaseAnonKey || "").trim();
        if (!nextUrl.startsWith("http") || !nextKey) {
          return res.status(400).json({
            success: false,
            error: "Please provide a valid Supabase Project URL (https://...) and Anon/Publishable Key."
          });
        }
        if (db) {
          await setDoc(
            doc(db, "settings", "supabase_config"),
            {
              supabaseUrl: nextUrl,
              supabaseAnonKey: nextKey,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
        return res.status(200).json({
          success: true,
          supabaseUrl: nextUrl,
          supabaseAnonKey: nextKey
        });
      }

      const rawVolunteer = body.volunteer || body;
      if (!rawVolunteer || !rawVolunteer.id || !rawVolunteer.full_name) {
        return res.status(400).json({
          success: false,
          error: "Invalid volunteer payload: id and full_name are required."
        });
      }

      const nowIso = new Date().toISOString();
      const record = sanitizeVolunteerRecord(
        {
          ...rawVolunteer,
          updated_at: nowIso,
          created_at: rawVolunteer.created_at || nowIso
        },
        false
      );

      let supabaseSynced = false;
      let firestoreSynced = false;
      let supabaseError = null;

      // 1. Persist to Supabase `volunteers` table
      if (supa.configured && supa.client) {
        try {
          const supaPayload = {
            id: record.id,
            full_name: record.full_name,
            slug: record.slug,
            role: record.role,
            department: record.department,
            biography: record.biography,
            expertise: record.expertise,
            photo_url: record.photo_url,
            photo_path: record.photo_path || "",
            linkedin_url: record.linkedin_url || "",
            email: record.email || "",
            date_onboarded: record.date_onboarded,
            status: record.status,
            updated_at: record.updated_at
          };

          let { error } = await supa.client
            .from("volunteers")
            .upsert(supaPayload, { onConflict: "id" });

          if (error && error.message && error.message.toLowerCase().includes("slug")) {
            const retryPayload = {
              ...supaPayload,
              slug: `${record.slug}-${Date.now().toString().slice(-4)}`
            };
            const retryRes = await supa.client
              .from("volunteers")
              .upsert(retryPayload, { onConflict: "id" });
            error = retryRes.error;
          }

          if (error) {
            supabaseError = error.message;
          } else {
            supabaseSynced = true;
          }
        } catch (sErr) {
          supabaseError = sErr?.message || "Supabase upsert exception";
        }
      }

      // 2. Persist to Cloud Firestore `volunteers` collection
      if (db) {
        try {
          await setDoc(doc(db, "volunteers", record.id), {
            ...record,
            _deleted: false
          });
          firestoreSynced = true;
        } catch (fbErr) {
          console.warn("[/api/volunteers] Firestore POST error:", fbErr?.message || fbErr);
        }
      }

      return res.status(200).json({
        success: supabaseSynced || firestoreSynced,
        supabaseSynced,
        firestoreSynced,
        supabaseError,
        volunteer: record
      });
    }

    // =========================================================================
    // DELETE: Remove Volunteer Record from Supabase & Cloud Firestore
    // =========================================================================
    if (req.method === "DELETE") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
      const id = req.query?.id || body.id;
      const photoPath = req.query?.photoPath || body.photoPath;

      if (!id) {
        return res.status(400).json({ success: false, error: "Volunteer id is required." });
      }

      let supabaseDeleted = false;
      let firestoreDeleted = false;
      let supabaseError = null;

      if (supa.configured && supa.client) {
        try {
          if (photoPath && String(photoPath).startsWith("volunteers/")) {
            await supa.client.storage.from("cms-media").remove([String(photoPath)]).catch(() => null);
          }
          const { error } = await supa.client.from("volunteers").delete().eq("id", String(id));
          if (error) {
            supabaseError = error.message;
          } else {
            supabaseDeleted = true;
          }
        } catch (sErr) {
          supabaseError = sErr?.message || "Supabase delete error";
        }
      }

      if (db) {
        try {
          await deleteDoc(doc(db, "volunteers", String(id)));
          firestoreDeleted = true;
        } catch (fbErr) {
          console.warn("[/api/volunteers] Firestore DELETE error:", fbErr?.message || fbErr);
        }
      }

      return res.status(200).json({
        success: supabaseDeleted || firestoreDeleted,
        supabaseDeleted,
        firestoreDeleted,
        supabaseError
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/volunteers] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Internal server error"
    });
  }
}
