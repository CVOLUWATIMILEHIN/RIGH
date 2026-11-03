/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple database coordinator to store and fetch user registrations.
// Falls back gracefully to local-first (localStorage) when Firebase holds pending UI terms.

import { TeenBootcampConfig, BootcampRegistration } from "../types/teenBootcamp";
import { DEFAULT_TEEN_BOOTCAMP_CONFIG } from "../data/defaultTeenBootcamp";

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileType: string; // e.g., 'corps_member', 'teen', 'student', 'mentor', 'cii-*'
  location: string;
  referenceNumber?: string;
  registrationId?: string;
  programType?: string;
  programName?: string;
  applicantName?: string;
  submissionDate?: string;
  institution?: string;
  aspiration?: string;
  batch?: string;
  primaryGoal?: string;
  primaryRole?: string;
  contactMethod?: string;
  whatsappLink?: string;
  stateCode?: string;
  parentName?: string;
  parentPhone?: string;
  classCode?: string;
  class?: string;
  leadershipPhilosophy?: string;
  track?: string;
  mode?: string;
  tshirtSize?: string;
  preferredEvent?: string;
  eventDate?: string;
  venue?: string;
  time?: string;
  guestCount?: string | number;
  courseTitle?: string;
  paymentMethod?: string;
  experienceArea?: string;
  industry?: string;
  department?: string;
  availableHours?: string | number;
  organizationName?: string;
  partnershipType?: string;
  registeredAt: string; // ISO dates
  planType?: "waitlist" | "free" | "growth" | "impact";
  paymentReference?: string;
  paymentReceipt?: string; // base64 encoded string of receipt screenshot
  paymentStatus?: "pending" | "verified";
  status?: string; // dossier status e.g., 'Received', 'Reviewed', 'Shortlisted', 'Enrolled', 'Deferred'
  notes?: string; // dossier internal comments
  mentorTeachArea?: string;
  mentorTrainSkill?: string;
  mentorAudience?: string;
  mentorExperience?: string;
}

export interface VisitorCheckIn {
  id: string;
  name: string;
  location: string;
  deviceType: string;
  purpose: string;
  checkedInAt: string;
}

// Default seed data to make the Admin Registration Dashboard immediately viewable and realistic
const DEFAULT_REGISTRATIONS: Registration[] = [
  {
    id: "reg-1",
    fullName: "Chidimma Nwosu",
    email: "chidimma.nw@gmail.com",
    phone: "+234 813 456 7890",
    profileType: "cii",
    location: "Niger State",
    batch: "Cohort 6",
    primaryGoal: "career_positioning",
    registeredAt: "2026-05-25T14:30:00.000Z"
  },
  {
    id: "reg-2",
    fullName: "David Kolawole",
    email: "dkola.stud@unilag.edu.ng",
    phone: "+234 902 111 2222",
    profileType: "student",
    location: "Lagos, Nigeria",
    institution: "University of Lagos, 400L",
    aspiration: "Wants guidance on remote work and high-level technical positioning.",
    registeredAt: "2026-05-24T10:15:00.000Z"
  },
  {
    id: "reg-3",
    fullName: "Abubakar Sadiq",
    email: "sadiq.abu@yahoo.com",
    phone: "+234 805 777 8888",
    profileType: "corps_member",
    location: "Abuja (FCT)",
    institution: "Batch C Stream 1, FC/25C/1290",
    aspiration: "Financial intelligence and side income templates.",
    registeredAt: "2026-05-23T08:45:00.000Z"
  },
  {
    id: "reg-4",
    fullName: "Miracle Oyin",
    email: "miracle.oyin@gmail.com",
    phone: "+234 812 345 6789",
    profileType: "teen",
    location: "Ogbomoso, Oyo State",
    institution: "Command Day Secondary School, SS2",
    aspiration: "Managing WAEC prep stress and forming positive reading habits.",
    registeredAt: "2026-05-22T16:20:00.000Z"
  }
];

const DEFAULT_CHECKINS: VisitorCheckIn[] = [
  {
    id: "v-1",
    name: "Yusuf Ibrahim Alao",
    location: "Kano",
    deviceType: "Mobile - Chrome (Android)",
    purpose: "YAP Conference Pass Check",
    checkedInAt: "2026-05-27T10:05:00.000Z"
  },
  {
    id: "v-2",
    name: "Olosunde Louis",
    location: "Lagos, Nigeria",
    deviceType: "Desktop - Chrome (macOS)",
    purpose: "System Administrator Sync",
    checkedInAt: "2026-05-27T11:12:00.000Z"
  },
  {
    id: "v-3",
    name: "Anonymous Guest",
    location: "Zaria",
    deviceType: "Mobile - Safari (iOS)",
    purpose: "Just Browsing Programs",
    checkedInAt: "2026-05-27T11:45:00.000Z"
  },
  {
    id: "v-4",
    name: "Dr. Adeola Williams",
    location: "Osun State",
    deviceType: "Desktop - Edge (Windows)",
    purpose: "Assessor Session Check",
    checkedInAt: "2026-05-27T12:01:00.000Z"
  }
];

// Initialize localStorage if empty
if (typeof window !== "undefined") {
  const existing = localStorage.getItem("rma_registrations");
  if (!existing) {
    localStorage.setItem("rma_registrations", JSON.stringify(DEFAULT_REGISTRATIONS));
  }
  const existingCheckins = localStorage.getItem("rma_checkins");
  if (!existingCheckins) {
    localStorage.setItem("rma_checkins", JSON.stringify(DEFAULT_CHECKINS));
  }
}

// Function to save a new registration
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

async function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let authInfo: FirestoreErrorInfo['authInfo'] = {
    userId: null,
    email: null,
    emailVerified: null,
    isAnonymous: null,
    tenantId: null,
    providerInfo: []
  };

  try {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    if (auth && auth.currentUser) {
      authInfo = {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified,
        isAnonymous: auth.currentUser.isAnonymous,
        tenantId: auth.currentUser.tenantId,
        providerInfo: auth.currentUser.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      };
    }
  } catch (e) {
    // Auth might not be loaded, fallback is safe
  }

  const errText = error instanceof Error ? error.message : String(error);

  const isApiDisabled = 
    errText.includes("Cloud Firestore API has not been used") || 
    errText.includes("firestore.googleapis.com");

  if (isApiDisabled) {
    if (typeof window !== "undefined") {
      (window as any).__rma_firestore_disabled = true;
      try {
        localStorage.setItem("rma_firestore_disabled", "true");
      } catch (e) {}
      window.dispatchEvent(new Event("rma_firestore_status_changed"));
    }
    if (cachedDb) {
      import("firebase/firestore").then(({ disableNetwork }) => {
        disableNetwork(cachedDb).catch(() => null);
      }).catch(() => null);
    }
    console.warn("Cloud Firestore API is currently disabled in Google Cloud Project.");
    return;
  }

  const isPermissionOrNotFound =
    errText.includes("PERMISSION_DENIED") ||
    errText.includes("NOT_FOUND") ||
    errText.includes("5 NOT_FOUND") ||
    ((error as any)?.code === "not-found" || (error as any)?.code === "permission-denied" || (error as any)?.code === 5 || (error as any)?.code === 7);

  if (isPermissionOrNotFound) {
    console.warn(`Firestore operation [${operationType}] on path [${path}] returned permission/not-found:`, errText);
    return;
  }

  // Log non-fatal error into audit_logs collection if possible
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const logId = `error-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const errorLog = {
      id: logId,
      adminEmail: authInfo.email || "anonymous_system_error",
      action: "FIRESTORE_ERROR",
      details: `[Operation: ${operationType}] [Path: ${path}] Error text: ${errText}`,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, "audit_logs", logId), errorLog);
  } catch (logErr) {
    console.warn("Failed to write error log into Firestore:", logErr);
  }

  const errInfo: FirestoreErrorInfo = {
    error: errText,
    authInfo,
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let cachedDb: any = null;
let testConnectionPromise: Promise<void> | null = null;

if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("rma_firestore_disabled");
  } catch (e) {}
}

export function isFirestoreDisabled(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).__rma_firestore_disabled;
}

async function runTestConnection(db: any) {
  try {
    const { doc, getDocFromServer } = await import("firebase/firestore");
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore running in offline mode or connecting...");
    }
  }
}

let cachedAuth: any = null;

export async function getFirebaseConfig() {
  const configModule = await import("../firebase-applet-config.json").catch(() => null);
  const fileConfig = configModule?.default || {};

  const env = (import.meta as any).env || {};
  return {
    projectId: env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || "",
    apiKey: env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || "",
    firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || fileConfig.firestoreDatabaseId || "(default)",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || "",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || "",
    appId: env.VITE_FIREBASE_APP_ID || fileConfig.appId || "",
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || fileConfig.measurementId || "",
    recaptchaSiteKey: fileConfig.recaptchaSiteKey || "",
  };
}

export async function getFirebaseAuth() {
  if (cachedAuth) return cachedAuth;

  const config = await getFirebaseConfig();
  if (!config.projectId && !config.apiKey) {
    throw new Error("Firebase configuration not found.");
  }

  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");

  const app = getApps().length === 0 ? initializeApp(config) : getApp();

  cachedAuth = getAuth(app);
  return cachedAuth;
}

export async function getFirestoreDb() {
  if (cachedDb) return cachedDb;

  const config = await getFirebaseConfig();
  if (!config.projectId && !config.apiKey) {
    throw new Error("Firebase configuration not found.");
  }

  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { initializeFirestore, setLogLevel } = await import("firebase/firestore");

  try {
    setLogLevel("silent");
  } catch (e) {}

  const app = getApps().length === 0 ? initializeApp(config) : getApp();

  const dbId = (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)")
    ? config.firestoreDatabaseId
    : undefined;

  // Initialize Firestore with experimentalForceLongPolling to prevent 10s WebSocket timeouts in container sandboxes
  cachedDb = dbId
    ? initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true,
      }, dbId)
    : initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true,
      });

  // Enable Firestore offline persistence for users where appropriate (browser environments)
  // We bypass persistence inside iframes because cross-origin sandbox restrictions block IndexedDB and can hang Firestore connections.
  if (typeof window !== "undefined") {
    const isIframe = window.self !== window.top;
    if (!isIframe) {
      const { enableMultiTabIndexedDbPersistence } = await import("firebase/firestore");
      enableMultiTabIndexedDbPersistence(cachedDb).catch((err) => {
        console.warn("Firestore offline persistence failed to enable:", err.code);
      });
    } else {
      console.info("Firestore offline persistence skipped in iframe environment to prevent sandbox blockages.");
    }
  }

  if (!testConnectionPromise) {
    testConnectionPromise = runTestConnection(cachedDb);
  }

  return cachedDb;
}

// Memory queue for batched/debounced Firestore writes
interface WriteJob {
  type: "set" | "update" | "delete" | "setWithMerge";
  collection: string;
  docId: string;
  data?: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  createdAt: number;
}

let writeQueue: WriteJob[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

async function processQueue() {
  if (writeQueue.length === 0) return;

  const currentBatchJobs = [...writeQueue];
  writeQueue = []; // Clear queue immediately to accept new writes

  if (isFirestoreDisabled()) {
    for (const job of currentBatchJobs) {
      job.resolve(job.data);
    }
    return;
  }
  
  try {
    const { writeBatch, doc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const batch = writeBatch(db);
    
    // Process each job inside the batch
    for (const job of currentBatchJobs) {
      const docRef = doc(db, job.collection, job.docId);
      if (job.type === "set") {
        batch.set(docRef, job.data);
      } else if (job.type === "setWithMerge") {
        batch.set(docRef, job.data, { merge: true });
      } else if (job.type === "update") {
        batch.update(docRef, job.data);
      } else if (job.type === "delete") {
        batch.delete(docRef);
      }
    }
    
    await batch.commit();
    console.log(`Successfully committed a batch of ${currentBatchJobs.length} writes to Firestore`);
    currentBatchJobs.forEach(job => job.resolve(job.data));
  } catch (error: any) {
    const errText = error instanceof Error ? error.message : String(error);
    const isApiDisabled = 
      errText.includes("Cloud Firestore API has not been used") || 
      errText.includes("firestore.googleapis.com");

    if (isApiDisabled) {
      if (typeof window !== "undefined") {
        (window as any).__rma_firestore_disabled = true;
        window.dispatchEvent(new Event("rma_firestore_status_changed"));
      }
      try {
        const { disableNetwork } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        await disableNetwork(db).catch(() => null);
      } catch (e) {}
      console.warn("Cloud Firestore API not enabled on project. Data saved locally to browser cache.");
      // Resolve all queued jobs cleanly using local offline storage
      for (const job of currentBatchJobs) {
        job.resolve(job.data);
      }
      return;
    }

    console.warn(`Failed to commit batch of ${currentBatchJobs.length} writes:`, error);
    // If a batch commit fails, fallback to individual persistent retry/handlers to recover gracefully
    for (const job of currentBatchJobs) {
      try {
        const { doc, setDoc, updateDoc, deleteDoc } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        const docRef = doc(db, job.collection, job.docId);
        
        if (job.type === "set") {
          await setDoc(docRef, job.data);
        } else if (job.type === "setWithMerge") {
          await setDoc(docRef, job.data, { merge: true });
        } else if (job.type === "update") {
          await updateDoc(docRef, job.data);
        } else if (job.type === "delete") {
          await deleteDoc(docRef);
        }
        job.resolve(job.data);
      } catch (individualError: any) {
        const indText = individualError instanceof Error ? individualError.message : String(individualError);
        if (
          indText.includes("Cloud Firestore API has not been used") || 
          indText.includes("firestore.googleapis.com") ||
          indText.includes("PERMISSION_DENIED") ||
          indText.includes("NOT_FOUND") ||
          indText.includes("5 NOT_FOUND") ||
          (individualError && (individualError.code === "not-found" || individualError.code === "permission-denied" || individualError.code === 5 || individualError.code === 7))
        ) {
          if (typeof window !== "undefined") {
            (window as any).__rma_firestore_disabled = true;
            window.dispatchEvent(new Event("rma_firestore_status_changed"));
          }
          try {
            const { disableNetwork } = await import("firebase/firestore");
            const db = await getFirestoreDb();
            await disableNetwork(db).catch(() => null);
          } catch (e) {}
          job.resolve(job.data); // Fall back to local success
        } else {
          console.error(`Individual write fallback failed for ${job.type} on ${job.docId}:`, individualError);
          job.reject(individualError);
        }
      }
    }
  }
}

function saveOfflineQueueItem(item: { type: string; collection: string; docId: string; data?: any }) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("rma_offline_sync_queue");
    const queue = raw ? JSON.parse(raw) : [];
    
    // Check if duplicate job already exists
    const exists = queue.some((q: any) => q.collection === item.collection && q.docId === item.docId && q.type === item.type);
    if (!exists) {
      queue.push({
        id: `job-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: item.type,
        collection: item.collection,
        docId: item.docId,
        data: item.data,
        createdAt: Date.now()
      });
      localStorage.setItem("rma_offline_sync_queue", JSON.stringify(queue));
      window.dispatchEvent(new Event("rma_registration_submitted"));
      window.dispatchEvent(new Event("rma_checkin_updated"));
    }
  } catch (e) {
    console.error("Failed to write to persistent offline queue:", e);
  }
}

export async function autoSyncFirestore(): Promise<void> {
  if (typeof window === "undefined") return;

  // Prevent double sync cycles at the same time
  if ((window as any).__rma_is_syncing) {
    console.log("[SYNC] Synchronization already in progress, skipping duplicate batch execution.");
    return;
  }

  let queue: any[] = [];
  try {
    const raw = localStorage.getItem("rma_offline_sync_queue");
    queue = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading rma_offline_sync_queue:", e);
    return;
  }

  if (queue.length === 0) {
    return;
  }

  console.log(`[SYNC] Found ${queue.length} pending operations in persistent storage. Initiating auto-sync...`);
  (window as any).__rma_is_syncing = true;
  window.dispatchEvent(new Event("rma_registration_submitted")); // notify UI of sync start

  try {
    const { doc, setDoc, updateDoc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();

    const remainingQueue: any[] = [];
    let processedCount = 0;

    for (const job of queue) {
      try {
        const docRef = doc(db, job.collection, job.docId);

        if (job.type === "set") {
          await setDoc(docRef, job.data);
        } else if (job.type === "setWithMerge") {
          await setDoc(docRef, job.data, { merge: true });
        } else if (job.type === "update") {
          await updateDoc(docRef, job.data);
        } else if (job.type === "delete") {
          await deleteDoc(docRef);
        }

        console.log(`[SYNC] Job successfully synced: ${job.type} on ${job.collection}/${job.docId}`);
        processedCount++;
      } catch (err: any) {
        console.error(`[SYNC] Job failed to sync, holding in queue:`, err);
        // Keep in queue for next cycle unless rules explicitly forbid
        const errMsg = (err?.message || String(err)).toLowerCase();
        if (
          errMsg.includes("permission") || 
          errMsg.includes("unauthorized") || 
          errMsg.includes("denied") || 
          errMsg.includes("authorized")
        ) {
          console.warn("[SYNC] Operation rejected by security rules. Dropping invalid job.", job.docId);
        } else {
          remainingQueue.push(job);
        }
      }
    }

    localStorage.setItem("rma_offline_sync_queue", JSON.stringify(remainingQueue));
    console.log(`[SYNC] Synchronization cycle finished. Synced ${processedCount} operations. Remaining: ${remainingQueue.length}`);
    
    // Trigger window events to notify sub-views to refresh their local registries
    window.dispatchEvent(new Event("rma_registration_submitted"));
    window.dispatchEvent(new Event("rma_checkin_updated"));
  } catch (error) {
    console.error("[SYNC] Sync database batch failure:", error);
  } finally {
    (window as any).__rma_is_syncing = false;
    window.dispatchEvent(new Event("rma_registration_submitted")); 
    window.dispatchEvent(new Event("rma_checkin_updated"));
  }
}

// Bind online trigger for instant automatic sync execution
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[NETWORK] Device back online. Ingesting queued actions into cloud backend...");
    autoSyncFirestore().catch(err => console.error("Online handler auto-sync failed:", err));
  });
  
  // Auto sync on boot
  setTimeout(() => {
    autoSyncFirestore().catch(err => console.error("Boot-time auto-sync failed:", err));
  }, 3000);
}

function queueWrite(job: Omit<WriteJob, "resolve" | "reject" | "createdAt">): Promise<any> {
  saveOfflineQueueItem(job);

  return new Promise((resolve, reject) => {
    writeQueue.push({
      ...job,
      resolve,
      reject,
      createdAt: Date.now()
    });
    
    // Debounce processing to buffer highly concurrent operations
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }
    flushTimeout = setTimeout(() => {
      flushTimeout = null;
      processQueue().catch(err => console.error("Error in processQueue:", err));
    }, 250); // 250ms batch window
  });
}

export async function saveRegistration(reg: Omit<Registration, "id" | "registeredAt">): Promise<Registration> {
  // Determine canonical program variables
  let programType = "cii";
  let programName = "Corper Impact Initiative (CII)";
  let prefix = "CII-2026-";

  const t = (reg.programType || reg.profileType || "").toLowerCase();

  if (t === "cii" || t.startsWith("cii")) {
    programType = "cii";
    programName = "Corper Impact Initiative (CII)";
    prefix = "CII-2026-";
  } else if (t.includes("teen") || t.includes("rmt")) {
    programType = "teens";
    programName = "Right-Minded Teens";
    prefix = "RMT-2026-";
  } else if (t.includes("young") || t.includes("leaders")) {
    programType = "young-leaders";
    programName = "Young Leaders Program";
    prefix = "YAP-2026-";
  } else if (t.includes("conference") || t.includes("yap-conf")) {
    programType = "yap-conference";
    programName = "YAP Conference";
    prefix = "YAP-2026-";
  } else if (t.includes("event") || t.includes("hangout") || t.includes("seminar")) {
    programType = "event";
    programName = "Events & Hangouts";
    prefix = "EVT-2026-";
  } else if (t.includes("course") || t.includes("lms") || t.includes("program")) {
    programType = "course";
    programName = "Premium Courses";
    prefix = "CRS-2026-";
  } else if (t.includes("mentor")) {
    programType = "mentorship";
    programName = "Mentorship Applications";
    prefix = "MNT-2026-";
  } else if (t.includes("volunteer") || t.includes("intern")) {
    programType = "volunteer";
    programName = reg.programName || "Internship & Volunteer Applications";
    prefix = "VOL-2026-";
  } else if (t.includes("partner")) {
    programType = "partnership";
    programName = "Partnership Requests";
    prefix = "PAR-2026-";
  } else {
    programType = t || "cii";
    programName = reg.programName || "General Participant Enrollment";
    const cleanPrefix = (programType.substring(0, 3).toUpperCase() || "RMA").padEnd(3, "X");
    prefix = `${cleanPrefix}-2026-`;
  }

  let referenceNumber = "";

  // 0. Auto-increment index lookup with 2-second timeout to prevent stalling
  try {
    const listPromise = getRegistrations().catch(() => []);
    const timeoutPromise = new Promise<Registration[]>((res) => setTimeout(() => res([]), 2000));
    const list = await Promise.race([listPromise, timeoutPromise]);
    
    let max = 0;
    if (list && list.length > 0) {
      for (const item of list) {
        const ref = item.registrationId || item.referenceNumber || "";
        if (ref.startsWith(prefix)) {
          const parts = ref.split("-");
          if (parts.length >= 3) {
            const idx = parseInt(parts[2], 10);
            if (!isNaN(idx) && idx > max) {
              max = idx;
            }
          }
        }
      }
    }
    const nextVal = String(max + 1).padStart(4, "0");
    referenceNumber = `${prefix}${nextVal}`;
  } catch (cntErr) {
    console.warn("Failed calculating dynamic sequence index, using random fallback:", cntErr);
    referenceNumber = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Clean any undefined fields so Firestore doesn't complain
  const newReg: Registration = JSON.parse(
    JSON.stringify({
      ...reg,
      id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registrationId: referenceNumber,
      referenceNumber,
      programType,
      programName,
      applicantName: reg.applicantName || reg.fullName || "",
      fullName: reg.fullName || reg.applicantName || "",
      registeredAt: new Date().toISOString(),
      submissionDate: new Date().toISOString(),
      status: reg.status || "Received"
    })
  );

  // 1. Persist to Local Storage FIRST (Guarantees data is never lost)
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_registrations");
      const list: Registration[] = localData ? JSON.parse(localData) : [];
      list.unshift(newReg); // Prepend to show newest first
      localStorage.setItem("rma_registrations", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_registration_submitted"));
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  }

  // 2. Direct write to Firestore with 5-second max timeout & non-blocking fallback
  const path = "registrations";
  const executeFirestoreSync = async () => {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docRef = doc(db, path, newReg.id);
    await setDoc(docRef, newReg);
    console.log("Successfully committed registration to Firestore:", newReg.id);

    // Create target-team system notification document
    try {
      const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      let adminTeam = "General Admins";
      let title = "New Registration Received";
      let message = `${newReg.fullName} registered for ${newReg.programName}.`;

      if (programType === "cii") {
        adminTeam = "CII admins";
        title = "New CII Registration";
        message = `[CII ADM] ${newReg.fullName} registered. Batch: ${newReg.batch || "N/A"}, State Code: ${newReg.location || "N/A"}.`;
      } else if (programType === "course") {
        adminTeam = "LMS admins";
        title = "New Course Enrollment";
        message = `[LMS ADM] ${newReg.fullName} enrolled in Course: ${newReg.programName || "Reinvention Blueprint"}.`;
      } else if (programType === "event") {
        adminTeam = "Event coordinators";
        title = "New Event Registration";
        message = `[EVT COORD] ${newReg.fullName} registered for Event: ${newReg.programName || "RMA Meetup"}.`;
      } else if (programType === "teens") {
        adminTeam = "Right-Minded Teens Team";
        title = "New RMT Application";
        message = `[RMT ADM] ${newReg.fullName} registered for Teens Program.`;
      } else {
        adminTeam = `${programName} Unit`;
        title = `New ${programName} Application`;
        message = `[${programType.toUpperCase()} ADM] ${newReg.fullName} created a new application.`;
      }

      const notifData = {
        id: notifId,
        type: "registration",
        title,
        message,
        timestamp: new Date().toISOString(),
        isRead: false,
        link: newReg.id,
        adminTeam
      };
      await setDoc(doc(db, "notifications", notifId), notifData);
    } catch (notifErr) {
      console.warn("Could not dispatch registration workspace notification to Firestore:", notifErr);
    }

    // Save audit log
    saveAuditLog({
      adminEmail: "anonymous_registrant",
      action: "REGISTRATION_SUCCESS",
      details: `Successful registration commit: id=${newReg.id}, code=${newReg.referenceNumber}, name=${newReg.fullName}, email=${newReg.email}, programType=${newReg.programType}`
    }).catch(aucErr => console.warn("Failed to create registration success audit log:", aucErr));
  };

  const firestoreTimeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Firestore write timeout (5000ms elapsed)")), 5000);
  });

  try {
    await Promise.race([executeFirestoreSync(), firestoreTimeoutPromise]);
  } catch (fsErr: any) {
    console.warn("[REGISTRATION] Firestore write delayed or offline. Queuing write for offline background sync:", fsErr?.message || fsErr);
    
    // Backup queue write so offline sync worker will persist to Firestore as soon as connection is live
    queueWrite({
      type: "set",
      collection: path,
      docId: newReg.id,
      data: newReg
    }).catch(qErr => console.error("Queue backup write error:", qErr));

    saveAuditLog({
      adminEmail: "anonymous_registrant",
      action: "REGISTRATION_QUEUED_OFFLINE",
      details: `Registration queued offline: id=${newReg.id}, code=${newReg.referenceNumber}, name=${newReg.fullName}, email=${newReg.email}. Reason: ${fsErr?.message || String(fsErr)}`
    }).catch(() => null);
  }

  // 3. SECURE BACKEND EMAIL TRIGGER (Authoritative Resend dispatch + Firestore email_logs persistence)
  try {
    fetch("/api/email/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "REGISTRATION_CREATED",
        registrationId: newReg.id,
        payload: newReg
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json().catch(() => null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("rma_email_logs_updated"));
        }
        return data;
      })
      .catch(async (err) => {
        console.warn("Background email dispatch network alert, recording offline fallback log:", err);
        const applicantName = newReg.fullName || "Applicant";
        const regId = newReg.registrationId || newReg.id;
        const whatsappUrl =
          (newReg as any).whatsappLink ||
          (programType === "g3"
            ? "https://chat.whatsapp.com/J4QmEIJbtPiCXLGm5ELHc5"
            : programType === "volunteer"
            ? "https://chat.whatsapp.com/HbcAPEL2tVMIZBrzIAsx4o?s=cl&p=a&mlu=4&ilr=4&iam=2"
            : programType === "cii"
              ? "https://chat.whatsapp.com/DoI8xpE60FeKMi4sEtE3wI"
              : "https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC");
        const fallbackSubject =
          programType === "volunteer"
            ? "Application Received – Right-Minds Africa Hub Internship & Volunteer Team"
            : `Application Received: Welcome to ${programName}`;
        const fallbackBody = `Dear ${applicantName},\n\nThank you for applying for ${programName}.\n\n* Application Reference ID: ${regId}\n* Official WhatsApp Link: ${whatsappUrl}\n\nJoin WhatsApp Community: ${whatsappUrl}\n\nWarm regards,\nRight-Minds Africa Hub Team`;
        const emailLogId = `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await saveEmailLog({
          id: emailLogId,
          registrationId: regId,
          programType,
          recipient: newReg.email,
          subject: fallbackSubject,
          status: "failed",
          sentTime: new Date().toISOString(),
          deliveryResult: `Offline queue fallback (${err?.message || "network unreachable"})`,
          body: fallbackBody
        }).catch(() => null);
      });
  } catch (apiErr) {
    console.warn("Background email dispatch error (non-blocking):", apiErr);
  }

  return newReg;
}

// Function to update registration in both local state and Firestore (fast sync)
export async function updateRegistration(id: string, updates: Partial<Registration>): Promise<void> {
  // Local storage update first (ultra fast UI)
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_registrations");
      if (localData) {
        const list: Registration[] = JSON.parse(localData);
        const updatedList = list.map(reg => reg.id === id ? { ...reg, ...updates } : reg);
        localStorage.setItem("rma_registrations", JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error("Local storage update error:", e);
    }
  }

  // Direct write to Firestore
  const path = "registrations";
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docRef = doc(db, path, id);
    await updateDoc(docRef, updates);
    console.log("Successfully committed update to Firestore:", id);
  } catch (err) {
    console.error("Direct Firestore update failed, fallback queuing:", err);
    queueWrite({
      type: "update",
      collection: path,
      docId: id,
      data: updates
    }).catch((queueErr) => {
      console.error("Queue backup update failed:", queueErr);
    });
    await handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Function to delete registration in both local storage and Firestore (fast sync)
export async function deleteRegistration(id: string): Promise<void> {
  // Local storage delete first
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_registrations");
      if (localData) {
        const list: Registration[] = JSON.parse(localData);
        const updatedList = list.filter(reg => reg.id !== id);
        localStorage.setItem("rma_registrations", JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error("Local storage delete error:", e);
    }
  }

  // Direct delete from Firestore
  const path = "registrations";
  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docRef = doc(db, path, id);
    await deleteDoc(docRef);
    console.log("Successfully committed deletion in Firestore:", id);
  } catch (err) {
    console.error("Direct Firestore deletion failed, fallback queuing:", err);
    queueWrite({
      type: "delete",
      collection: path,
      docId: id
    }).catch((queueErr) => {
      console.error("Queue backup delete failed:", queueErr);
    });
    await handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Function to load all registrations
export async function getRegistrations(forceFresh: boolean = false): Promise<Registration[]> {
  // Safe background trigger to sync any outstanding offline writes before loading
  autoSyncFirestore().catch(err => console.warn("[DB] Failed background pre-load auto sync:", err));

  const path = "registrations";
  const isOnline = typeof window !== "undefined" && navigator.onLine;

  if (isOnline) {
    try {
      const auth = await getFirebaseAuth().catch(() => null);
      if (auth && auth.currentUser) {
        const { collection, getDocs, getDocsFromServer, query, orderBy } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        
        const q = query(collection(db, path), orderBy("registeredAt", "desc"));
        
        // Force server fetch to completely bypass browser and SDK persistence caching
        const querySnapshot = await getDocsFromServer(q).catch(async (err) => {
          console.warn("getDocsFromServer failed, falling back to cached getDocs:", err);
          return await getDocs(q);
        });
        
        const fbList: Registration[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fbList.push({ id: doc.id, ...data } as Registration);
        });

        // Sync with local storage to keep offline state fresh
        if (typeof window !== "undefined") {
          localStorage.setItem("rma_registrations", JSON.stringify(fbList));
        }
        return fbList;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("permission") || errMsg.includes("Permission")) {
        await handleFirestoreError(err, OperationType.LIST, path);
      } else {
        console.warn("Could not retrieve documents from Firestore directly, relying on local cache fallback:", err);
      }
    }
  }

  // Fallback to local storage (only offline / when Firestore fetch failed)
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_registrations");
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.error("Failed to read registrations from localStorage:", e);
    }
  }

  return [];
}

// Helper to retrieve live Firebase configuration metadata for the admin diagnostics panel
export interface FirebaseConfigInfo {
  projectId: string;
  firestoreDatabaseId: string;
}

export async function getFirebaseConfigInfo(): Promise<FirebaseConfigInfo> {
  const config = await getFirebaseConfig();
  return {
    projectId: config.projectId || "Unknown",
    firestoreDatabaseId: config.firestoreDatabaseId || "Unknown"
  };
}

// Scrolling announcement settings state structure
export interface MarqueeConfig {
  enabled: boolean;
  messages: string[];
}

export const DEFAULT_MARQUEE_CONFIG: MarqueeConfig = {
  enabled: true,
  messages: [
    "🌟 RIGHTMINDS AFRICA MONTHLY SEMINAR: Discover Growth Mindset & Self-belief secrets • Saturday, June 6, 2026!",
    "🎓 YAP CONFERENCE 2026: Building Nigeria's Growth Elite — Scheduled for November 2026! Stall registrations open soon.",
    "⚡ CORPER IMPACT INITIATIVE (CII): Cohort 5 Applications are live. Transform your service year today!"
  ]
};

// Retrieve settings configuration
export async function getMarqueeConfig(): Promise<MarqueeConfig> {
  let config: MarqueeConfig = DEFAULT_MARQUEE_CONFIG;

  if (typeof window !== "undefined") {
    const local = localStorage.getItem("rma_marquee_config");
    if (local) {
      try {
        config = JSON.parse(local);
      } catch (e) {
        console.error("Local marquee config parsing error:", e);
      }
    } else {
      localStorage.setItem("rma_marquee_config", JSON.stringify(DEFAULT_MARQUEE_CONFIG));
    }
  }

  // Attempt sync with remote Firebase if provisioned
  const path = "settings/marquee";
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    
    const docRef = doc(db, "settings", "marquee");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const remoteData = docSnap.data() as Partial<MarqueeConfig>;
      if (remoteData.messages && Array.isArray(remoteData.messages)) {
        config = {
          enabled: remoteData.enabled ?? true,
          messages: remoteData.messages
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("rma_marquee_config", JSON.stringify(config));
        }
      }
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("permission") || errMsg.includes("Permission")) {
      await handleFirestoreError(err, OperationType.GET, path);
    } else {
      // Secondary safety fallback is silent
    }
  }

  return config;
}

// Update settings configuration
export async function saveMarqueeConfig(config: MarqueeConfig): Promise<MarqueeConfig> {
  if (typeof window !== "undefined") {
    localStorage.setItem("rma_marquee_config", JSON.stringify(config));
    // Dispatch custom event to notify all listeners instantly
    window.dispatchEvent(new Event("rma_marquee_updated"));
  }

  // Queue background write
  queueWrite({
    type: "setWithMerge",
    collection: "settings",
    docId: "marquee",
    data: {
      enabled: config.enabled,
      messages: config.messages,
      updatedAt: new Date().toISOString()
    }
  }).catch((err) => {
    console.warn("Firestore settings copy queue deferred:", err);
  });

  return config;
}

export const DEFAULT_PAYMENT_HUB_SETTINGS: PaymentHubSettings = {
  id: "payment_settings",
  bankName: "Zenith Bank PLC",
  accountName: "RightMinds Africa Development Trust",
  accountNumber: "1015694821",
  bankAccounts: [
    {
      id: "acc-1",
      bankName: "Zenith Bank PLC",
      accountName: "RightMinds Africa Development Trust",
      accountNumber: "1015694821",
      active: true
    },
    {
      id: "acc-2",
      bankName: "Guaranty Trust Bank (GTB)",
      accountName: "Corper Impact Initiative Operations Ltd",
      accountNumber: "0214894871",
      active: true
    }
  ],
  paystackSettings: {
    sandboxMode: true,
    publicKey: "",
    secretKey: ""
  },
  paymentInstructions: "Please make payment via Bank Transfer into the official bank account below. Include your Enrollment Reference Number in the transaction narration. After payment, upload your payment receipt (JPEG, PNG, or PDF). An administrator will review and verify your payment before granting full access.",
  acceptedFileTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxUploadSizeMB: 8,
  approvalWorkflow: "manual_admin",
  notificationEmail: "payments@rightmindsafrica.org",
  warningNotice: "WARNING: Do NOT transfer funds into any other account or personal individual. Only pay into the official RightMinds Africa accounts shown below."
};

export async function getPaymentHubSettings(): Promise<PaymentHubSettings> {
  let config: PaymentHubSettings = DEFAULT_PAYMENT_HUB_SETTINGS;

  if (typeof window !== "undefined") {
    const local = localStorage.getItem("rma_payment_hub_settings");
    if (local) {
      try {
        config = JSON.parse(local);
      } catch (e) {
        console.error("Local payment hub settings parsing error:", e);
      }
    } else {
      localStorage.setItem("rma_payment_hub_settings", JSON.stringify(DEFAULT_PAYMENT_HUB_SETTINGS));
    }
  }

  const fetchFs = async (): Promise<PaymentHubSettings> => {
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    
    const docRef = doc(db, "settings", "payment_settings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const remoteData = docSnap.data() as PaymentHubSettings;
      const updatedConfig = {
        ...DEFAULT_PAYMENT_HUB_SETTINGS,
        ...remoteData
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_payment_hub_settings", JSON.stringify(updatedConfig));
      }
      return updatedConfig;
    }
    return config;
  };

  const fsTimeout = new Promise<PaymentHubSettings>((resolve) =>
    setTimeout(() => resolve(config), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve payment settings from Firestore, using local:", err);
    return config;
  }
}

export async function savePaymentHubSettings(config: PaymentHubSettings): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rma_payment_hub_settings", JSON.stringify(config));
      window.dispatchEvent(new Event("rma_payment_hub_settings_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "settings", "payment_settings"), config);
  } catch (err) {
    console.error("Error saving payment settings to Firestore:", err);
  }
}

// Save visitor check-in
export async function saveVisitorCheckIn(checkIn: Omit<VisitorCheckIn, "id" | "checkedInAt">): Promise<VisitorCheckIn> {
  const newCheck: VisitorCheckIn = JSON.parse(
    JSON.stringify({
      ...checkIn,
      id: `v-${Date.now()}-${Math.floor(Math.random() * 1005)}`,
      checkedInAt: new Date().toISOString()
    })
  );

  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_checkins");
      const list: VisitorCheckIn[] = localData ? JSON.parse(localData) : [];
      list.unshift(newCheck);
      localStorage.setItem("rma_checkins", JSON.stringify(list));
      // Dispatch a storage or custom trigger to reload tabs instantly if Admin is open
      window.dispatchEvent(new Event("rma_checkin_updated"));
    } catch (e) {
      console.error("Local storage check-in save error:", e);
    }
  }

  // Direct write to Firestore
  const path = "checkins";
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docRef = doc(db, path, newCheck.id);
    await setDoc(docRef, newCheck);
    console.log("Successfully committed visitor check-in to Firestore:", newCheck.id);
  } catch (err) {
    console.error("Direct Firestore check-in failed, fallback queuing:", err);
    queueWrite({
      type: "set",
      collection: path,
      docId: newCheck.id,
      data: newCheck
    }).catch((queueErr) => {
      console.error("Queue backup check-in failed:", queueErr);
    });
    await handleFirestoreError(err, OperationType.WRITE, path);
  }

  return newCheck;
}

// Retrieve visitor check-ins
export async function getVisitorCheckIns(): Promise<VisitorCheckIn[]> {
  // Safe background trigger to sync any outstanding offline writes before loading checkins
  autoSyncFirestore().catch(err => console.warn("[DB] Failed background pre-load visitor sync:", err));

  const path = "checkins";
  const isOnline = typeof window !== "undefined" && navigator.onLine;

  if (isOnline) {
    try {
      const auth = await getFirebaseAuth().catch(() => null);
      if (auth && auth.currentUser) {
        const { collection, getDocs, getDocsFromServer, query, orderBy } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        
        const q = query(collection(db, path), orderBy("checkedInAt", "desc"));
        const querySnapshot = await getDocsFromServer(q).catch(async (err) => {
          console.warn("getDocsFromServer failed for checkins, falling back to cached getDocs:", err);
          return await getDocs(q);
        });
        
        const fbList: VisitorCheckIn[] = [];
        querySnapshot.forEach((doc) => {
          fbList.push({ id: doc.id, ...doc.data() } as VisitorCheckIn);
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("rma_checkins", JSON.stringify(fbList));
        }
        return fbList;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("permission") || errMsg.includes("Permission")) {
        await handleFirestoreError(err, OperationType.LIST, path);
      } else {
        console.warn("Could not retrieve check-ins directly from Firestore, falling back to cached local storage:", err);
      }
    }
  }

  // Fallback to local storage (only offline / when Firestore fetch failed)
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_checkins");
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.error("Failed to read check-ins from localStorage:", e);
    }
  }

  return [];
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

// Function to save an audit log
export async function saveAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
  const newLog: AuditLog = JSON.parse(
    JSON.stringify({
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    })
  );

  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_audit_logs");
      const list: AuditLog[] = localData ? JSON.parse(localData) : [];
      list.unshift(newLog);
      localStorage.setItem("rma_audit_logs", JSON.stringify(list));
    } catch (e) {
      console.error("Local storage audit log save error:", e);
    }
  }

  // Queue background write to Firestore
  queueWrite({
    type: "set",
    collection: "audit_logs",
    docId: newLog.id,
    data: newLog
  }).catch((err) => {
    console.warn("Firestore audit sync queue deferred:", err);
  });

  return newLog;
}

// Function to load all audit logs
export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = "audit_logs";
  const isOnline = typeof window !== "undefined" && navigator.onLine;

  if (isOnline) {
    try {
      const auth = await getFirebaseAuth().catch(() => null);
      if (auth && auth.currentUser) {
        const { collection, getDocs, getDocsFromServer, query, orderBy } = await import("firebase/firestore");
        const db = await getFirestoreDb();
        
        const q = query(collection(db, path), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocsFromServer(q).catch(async (err) => {
          console.warn("getDocsFromServer failed for audit logs, falling back to cached getDocs:", err);
          return await getDocs(q);
        });
        
        const fbList: AuditLog[] = [];
        querySnapshot.forEach((doc) => {
          fbList.push({ id: doc.id, ...doc.data() } as AuditLog);
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("rma_audit_logs", JSON.stringify(fbList));
        }
        return fbList;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("permission") || errMsg.includes("Permission")) {
        await handleFirestoreError(err, OperationType.LIST, path);
      } else {
        console.warn("Could not retrieve audit logs directly from Firestore, falling back to cached local storage:", err);
      }
    }
  }

  // Fallback to local storage (only offline / when Firestore fetch failed)
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_audit_logs");
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.error("Failed to read audit logs from localStorage:", e);
    }
  }

  return [];
}

export async function clearAuditLogs(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("rma_audit_logs");
  }

  try {
    const auth = await getFirebaseAuth().catch(() => null);
    if (!auth || !auth.currentUser) {
      console.log("No active Firebase Auth session to clear server audit logs.");
      return;
    }

    const { collection, getDocs, doc, writeBatch } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "audit_logs"));
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => {
      batch.delete(doc(db, "audit_logs", document.id));
    });
    await batch.commit();
  } catch (e) {
    console.warn("Failed to clear audit logs from server:", e);
  }
}

export interface FallbackAdminUser {
  email: string;
  fullName?: string;
  role: "Super Admin" | "Admin" | "Editor" | "Viewer" | "Viewer (Read Only)";
  allowedTabs?: string[];
  canWrite?: boolean;
  status?: "Active" | "Suspended";
  passwordDigest?: string;
  passwordHash?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AdminOperatorRecord = FallbackAdminUser;

const ADMIN_SALT_V1 = "rma_sovereign_salt_2026_v1";
const MASTER_ADMIN_SHA256_DIGESTS = new Set([
  "7b70f62577eb34778c7c4bcf00fa58bdd565363a72464398b928e39d295773f3",
  "be8dd9a445565a51721ffd152d962862bfd0b717de21fe112cc9b1ae1c41c097",
  "1f5c4b51b15be491b8fe4e9ec3160e60ab621658564beabe1e5a24df08dae564",
  "47baf060823e93958c790d07f5b607b23c47fb4372078dc7538833c50c0d3bca",
  "ddcf920b40a1eaf8bebc5b08495c3d3c80b8884c95f5d9a23816e66a64225ff6",
  "44766e280d04bcf49b16b7abacdb274f66ddc8dd7e7b72dd6aac09c5fa8783f5",
  "d9410381db92bfc9cd34d3269ab83e5a52f31116df5bf8c63643ed5d35ba47c5",
  "ad92119cf7ebd3eb958a6dd1c3f3de2b8eb87fa3ec0818cf4d023ccb27962f8b"
]);

export const ANCHOR_SUPER_ADMIN_EMAILS = [
  "olosundelouis@gmail.com"
];

export function getAdminWelcomeName(email?: string, fullName?: string): string {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (
    !cleanEmail ||
    cleanEmail === "rightmindsafrica@gmail.com" ||
    cleanEmail === "olosundelouis@gmail.com" ||
    cleanEmail.startsWith("rightminds") ||
    cleanEmail.includes("@rightmindsafrica")
  ) {
    return "Right Minds Africa";
  }

  const emailNamePart = cleanEmail.split("@")[0] || "Right Minds Africa";

  if (
    cleanEmail === "corpersimpactinitiative@gmail.com" ||
    emailNamePart === "corpersimpactinitiative"
  ) {
    return "Corpers Impact Initiative";
  }

  const genericNames = new Set([
    "admin",
    "super admin",
    "system owner",
    "system owner (super admin)",
    "right minds africa admin",
    "right minds africa",
    "corper impact initiative admin",
    "corpers impact initiative admin",
    "public user",
    "viewer",
    "viewer (read only)",
    "editor"
  ]);
  const trimmedFull = (fullName || "").trim();
  if (
    trimmedFull &&
    !genericNames.has(trimmedFull.toLowerCase()) &&
    !trimmedFull.includes("@")
  ) {
    return trimmedFull;
  }

  const formattedFromEmail = emailNamePart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

  return formattedFromEmail || emailNamePart || "Right Minds Africa";
}

const DEFAULT_EDITABLE_ADMIN_OPERATORS: AdminOperatorRecord[] = [];
const LEGACY_PRE_SEEDED_MOCK_IDS = new Set([
  "usr-admin-rightmindsafrica",
  "usr-admin-corpersimpactinitiative",
  "usr-1",
  "usr-2",
  "usr-3",
  "usr-4"
]);


function getDeletedAdminOperatorEmailsLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("rma_deleted_admin_operators");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((e: string) => String(e).toLowerCase());
    }
  } catch {}
  return [];
}

function saveDeletedAdminOperatorEmailsLocal(emails: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(emails.map((e) => e.toLowerCase())));
    localStorage.setItem("rma_deleted_admin_operators", JSON.stringify(unique));
  } catch {}
}

async function computeSha256Hex(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "";
}

export async function computeSaltedPasswordDigest(passwordInput: string): Promise<string> {
  const trimmed = (passwordInput || "").trim();
  if (!trimmed) return "";
  return computeSha256Hex(`${ADMIN_SALT_V1}:${trimmed}`);
}

export async function verifySaltedAdminDigest(passwordInput: string): Promise<boolean> {
  const trimmed = (passwordInput || "").trim();
  if (!trimmed) return false;
  const exactHex = await computeSha256Hex(`${ADMIN_SALT_V1}:${trimmed}`);
  if (exactHex && MASTER_ADMIN_SHA256_DIGESTS.has(exactHex)) return true;
  const lowerHex = await computeSha256Hex(`${ADMIN_SALT_V1}:${trimmed.toLowerCase()}`);
  if (lowerHex && MASTER_ADMIN_SHA256_DIGESTS.has(lowerHex)) return true;
  return false;
}

export async function createClientSignedSession(
  email: string,
  role: "Super Admin" | "Admin" | "Editor" | "Viewer" | "Viewer (Read Only)",
  allowedTabs?: any[],
  canWrite?: boolean,
  fullName?: string
): Promise<{ email: string; fullName?: string; role: any; allowedTabs?: any[]; canWrite?: boolean; token: string; expiresAt: number }> {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payloadObj = { email, role, allowedTabs, canWrite, expiresAt };
  const payloadB64 = typeof window !== "undefined"
    ? window.btoa(JSON.stringify(payloadObj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    : "session";
  const sigHex = await computeSha256Hex(`${ADMIN_SALT_V1}:${payloadB64}`);
  return {
    email,
    role,
    allowedTabs,
    canWrite,
    token: `${payloadB64}.${sigHex.slice(0, 43)}`,
    expiresAt
  };
}

export async function getAdminOperators(): Promise<AdminOperatorRecord[]> {
  const deletedEmails = new Set(getDeletedAdminOperatorEmailsLocal());
  let list: AdminOperatorRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_admin_operators_directory");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch {}
  }

  const map = new Map<string, AdminOperatorRecord>();
  for (const item of list) {
    const emailKey = (item.email || "").toLowerCase().trim();
    const isSovereignOwner = ANCHOR_SUPER_ADMIN_EMAILS.includes(emailKey);
    // Only keep non-Super-Admin operators that were explicitly created with a passwordDigest
    if (emailKey && !deletedEmails.has(emailKey) && (isSovereignOwner || Boolean(item.passwordDigest))) {
      const normalizedRole = isSovereignOwner
        ? "Super Admin"
        : item.role === "Super Admin"
        ? "Admin"
        : (item.role || "Admin");
      map.set(emailKey, {
        ...map.get(emailKey),
        ...item,
        email: emailKey,
        role: normalizedRole
      });
    }
  }
  list = Array.from(map.values());

  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const snap = await getDocs(collection(db, "admins"));
    const fbList: AdminOperatorRecord[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const email = (data.email || docSnap.id || "").toLowerCase().trim();
      const isSovereignOwner = ANCHOR_SUPER_ADMIN_EMAILS.includes(email);
      if (email && !deletedEmails.has(email)) {
        const normalizedRole = isSovereignOwner
          ? "Super Admin"
          : data.role === "Super Admin"
          ? "Admin"
          : (data.role || "Admin");
        fbList.push({
          email,
          fullName: data.fullName || email.split("@")[0],
          role: normalizedRole,
          allowedTabs: Array.isArray(data.allowedTabs) ? data.allowedTabs : undefined,
          canWrite: typeof data.canWrite === "boolean" ? data.canWrite : true,
          status: data.status || "Active",
          passwordDigest: data.passwordDigest || (data.passwordHash ? "server-scrypt" : "firestore-provisioned"),
          createdBy: data.createdBy,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt
        });
      }
    });
    if (fbList.length > 0) {
      for (const fbItem of fbList) {
        const emailKey = fbItem.email.toLowerCase();
        const existing = map.get(emailKey);
        map.set(emailKey, {
          ...existing,
          ...fbItem,
          allowedTabs: fbItem.allowedTabs || existing?.allowedTabs,
          passwordDigest: fbItem.passwordDigest || existing?.passwordDigest
        });
      }
      list = Array.from(map.values());
    }
  } catch (err) {
    console.warn("Could not fetch admins collection from Firestore, using cached directory:", err);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rma_admin_operators_directory", JSON.stringify(list));
    } catch {}
  }

  return list;
}

export async function authenticateOperatorAccount(
  email: string,
  passwordInput: string
): Promise<{
  email: string;
  fullName?: string;
  role: "Super Admin" | "Admin" | "Editor" | "Viewer" | "Viewer (Read Only)";
  allowedTabs?: string[];
  canWrite?: boolean;
  status?: "Active" | "Suspended";
} | null> {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (passwordInput || "").trim();
  if (!cleanEmail || !cleanPass) return null;

  const candidateDigest = await computeSaltedPasswordDigest(cleanPass);
  const candidateLowerDigest = await computeSaltedPasswordDigest(cleanPass.toLowerCase());

  const operators = await getAdminOperators();
  const matchedOp = operators.find((op) => op.email.toLowerCase() === cleanEmail);

  if (matchedOp) {
    if (matchedOp.status === "Suspended") {
      throw new Error("Access Revoked: Your administrator account has been suspended by the System Owner (Super Admin).");
    }
    if (
      matchedOp.passwordDigest &&
      matchedOp.passwordDigest !== "server-scrypt" &&
      (matchedOp.passwordDigest === candidateDigest || matchedOp.passwordDigest === candidateLowerDigest)
    ) {
      return {
        email: matchedOp.email,
        fullName: matchedOp.fullName,
        role: ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail) ? "Super Admin" : matchedOp.role,
        allowedTabs: matchedOp.allowedTabs,
        canWrite: matchedOp.canWrite ?? true,
        status: matchedOp.status || "Active"
      };
    }
  }

  // Also check PlatformUsers ONLY if an Admin was explicitly created there with a passwordDigest
  const users = await getPlatformUsers();
  const matchedUser = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.role !== "Student" && Boolean(u.passwordDigest)
  );
  if (matchedUser) {
    if (matchedUser.status === "Suspended" || matchedUser.status === "Deactivated") {
      throw new Error("Access Revoked: Your account has been suspended or deactivated by the System Owner (Super Admin).");
    }
    if (
      matchedUser.passwordDigest &&
      (matchedUser.passwordDigest === candidateDigest || matchedUser.passwordDigest === candidateLowerDigest)
    ) {
      return {
        email: matchedUser.email.toLowerCase(),
        fullName: matchedUser.fullName,
        role: ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail)
          ? "Super Admin"
          : matchedUser.role === "Admin"
          ? "Admin"
          : matchedUser.role === "Viewer"
          ? "Viewer (Read Only)"
          : "Editor",
        allowedTabs: matchedUser.allowedTabs,
        canWrite: matchedUser.canWrite ?? (matchedUser.role === "Admin"),
        status: "Active"
      };
    }
  }

  return null;
}

export async function isAuthorizedAdminEmail(email: string): Promise<{
  authorized: boolean;
  isSuperAdmin: boolean;
  operator?: AdminOperatorRecord;
  reason?: string;
}> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      authorized: false,
      isSuperAdmin: false,
      reason: "Please enter a valid Administrator email address."
    };
  }

  if (ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
    return {
      authorized: true,
      isSuperAdmin: true
    };
  }

  const deletedEmails = new Set(getDeletedAdminOperatorEmailsLocal());
  if (deletedEmails.has(cleanEmail)) {
    return {
      authorized: false,
      isSuperAdmin: false,
      reason: "Access Denied: This administrator account has been removed by the Super Admin."
    };
  }

  const operators = await getAdminOperators();
  const matchedOp = operators.find(
    (op) => op.email.toLowerCase() === cleanEmail && Boolean(op.passwordDigest)
  );
  if (matchedOp) {
    if (matchedOp.status === "Suspended") {
      return {
        authorized: false,
        isSuperAdmin: false,
        operator: matchedOp,
        reason: "Access Revoked: Your administrator account has been suspended by the System Owner (Super Admin)."
      };
    }
    return {
      authorized: true,
      isSuperAdmin: false,
      operator: matchedOp
    };
  }

  const users = await getPlatformUsers();
  const matchedUser = users.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail &&
      (u.role === "Admin" || u.role === "Viewer") &&
      Boolean(u.passwordDigest)
  );
  if (matchedUser) {
    if (matchedUser.status === "Suspended" || matchedUser.status === "Deactivated") {
      return {
        authorized: false,
        isSuperAdmin: false,
        reason: "Access Revoked: Your account has been suspended or deactivated by the System Owner (Super Admin)."
      };
    }
    return {
      authorized: true,
      isSuperAdmin: false,
      operator: {
        email: matchedUser.email.toLowerCase(),
        fullName: matchedUser.fullName,
        role: matchedUser.role === "Admin" ? "Admin" : "Viewer (Read Only)",
        allowedTabs: matchedUser.allowedTabs,
        canWrite: matchedUser.canWrite ?? (matchedUser.role === "Admin"),
        status: "Active",
        passwordDigest: matchedUser.passwordDigest,
        createdAt: matchedUser.joinedAt || new Date().toISOString()
      }
    };
  }

  return {
    authorized: false,
    isSuperAdmin: false,
    reason: `Access Denied: The email "${cleanEmail}" has not been created by the Super Admin. No unauthorized email is allowed to log in.`
  };
}

// Authenticate administrator session strictly via server-side or WebCrypto SHA-256 verification
export async function authenticateFallbackAdmin(email: string, passwordInput: string): Promise<"Super Admin" | "Admin" | "Editor" | "Viewer" | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = passwordInput.trim();
  if (!cleanEmail || !cleanPass) return null;

  // Purge any legacy client-side credential cache
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("rma_local_admin_credentials");
    } catch {}
  }

  const authCheck = await isAuthorizedAdminEmail(cleanEmail);
  if (!authCheck.authorized) {
    return null;
  }

  try {
    const opMatch = await authenticateOperatorAccount(cleanEmail, cleanPass);
    if (opMatch) {
      return opMatch.role === "Viewer (Read Only)" ? "Viewer" : opMatch.role;
    }
  } catch (err) {
    throw err;
  }

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: passwordInput })
    });
    if (response.ok) {
      const data = await response.json();
      const resolvedRole = data?.role || data?.user?.role;
      if (data?.success && resolvedRole) {
        return resolvedRole;
      }
    }
  } catch (err) {
    console.warn("Server admin authentication check failed:", err);
  }

  // Master password fallback is strictly reserved for the sole Super Admin (olosundelouis@gmail.com)
  if (ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail) && (await verifySaltedAdminDigest(passwordInput))) {
    return "Super Admin";
  }

  return null;
}

const ADMIN_TAB_LABELS_LOOKUP: Record<string, string> = {
  "dashboard": "Overview Dashboard",
  "reg-cii": "Corper Impact (CII) Registrations",
  "reg-rma": "Right-Minds (RMA) Registrations",
  "teen-bootcamp": "Teen Bootcamp 2026",
  "payments": "Payments Bureau",
  "events": "Events Manager",
  "resources": "Resources Vault",
  "gallery": "Photo Gallery",
  "website-popups": "Website Popups",
  "social-hub": "Social Hub Sync",
  "google-forms": "Google Forms Integrator",
  "messages": "Inbound Mailbox",
  "testimonials": "Testimonials Desk",
  "partners": "Sponsor Directory",
  "lms-courses": "LMS Courses",
  "lms-modules": "LMS Modules & Lessons",
  "lms-students": "LMS Students",
  "lms-payments": "LMS Course Payments",
  "lms-enrollments": "LMS Enrollments",
  "lms-certificates": "LMS Certificates",
  "lms-analytics": "LMS Analytics",
  "lms-payment-settings": "LMS Payment Settings",
  "visitors-live": "Live Guestbook",
  "notifications": "Alert Notifications",
  "visitors-analytics": "Web Analytics",
  "live-chat": "Live Chat Workspace",
  "user-management": "Users List",
  "security": "Admins & Access Control",
  "brand-cloner": "Brand & Cloner Hub",
  "activity": "Activity Trails",
  "settings": "System Settings",
  "prd-doc": "Specs (PRD)"
};

export async function sendAdminLoginCredentialsEmail(params: {
  email: string;
  fullName: string;
  password: string;
  role: string;
  canWrite: boolean;
  allowedTabs: string[];
  createdBy?: string;
  isPasswordUpdate?: boolean;
}): Promise<{ success: boolean; logId: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const displayName = params.fullName.trim() || cleanEmail.split("@")[0];
  const portalUrl =
    typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}/admin`
      : "https://rightmindsafrica.org/admin";

  const moduleLabels = (params.allowedTabs || []).map(
    (tabId) => ADMIN_TAB_LABELS_LOOKUP[tabId] || tabId
  );
  const accessModeLabel = params.canWrite
    ? "Read & Write (Can create, edit & manage records)"
    : "Read-Only (View & export only)";

  const subject = params.isPasswordUpdate
    ? "Updated Administrator Login Credentials – Right Minds Africa Portal"
    : "Your Administrator Login Credentials – Right Minds Africa Portal";

  const body = `Dear ${displayName},

You have been provisioned as an Administrator on the Right Minds Africa (RMA) & Corper Impact Initiative (CII) Operations Portal by the System Owner (Super Admin).

Below are your official administrator login credentials and assigned permissions:

* Admin Portal Login URL: ${portalUrl}
* Login Email Address: ${cleanEmail}
* Temporary / Login Password: ${params.password}
* Assigned Role: ${params.role}
* Access Permission Level: ${accessModeLabel}
* Authorized Modules (${moduleLabels.length}): ${moduleLabels.join(", ") || "Overview Dashboard"}

Access Admin Portal: ${portalUrl}

How to Sign In:
1. Click the button above or visit ${portalUrl} in your browser.
2. Enter your Login Email Address (${cleanEmail}) and your assigned password.
3. Once authenticated, your workspace will automatically load the ${moduleLabels.length} modules assigned to you.

Security Notice:
Please keep these login details strictly confidential and do not share your administrator password with unauthorized personnel.

Regards,
System Owner (Super Admin)
Right Minds Africa & Corper Impact Initiative`;

  const logId = `mail-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Immediately persist to local + Firestore email logs so it is visible in System Email Logs
  await saveEmailLog({
    id: logId,
    recipient: cleanEmail,
    subject,
    body,
    registrationId: `ADM-${Date.now().toString().slice(-5)}`,
    programType: "Admin Credentials",
    status: "success",
    sentTime: new Date().toISOString(),
    deliveryResult: "Dispatched Administrator Login Credentials"
  }).catch(() => null);

  // 2. Dispatch real email via backend /api/email/trigger endpoint
  let backendSuccess = true;
  try {
    const res = await fetch("/api/email/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ADMIN_CREATED",
        payload: {
          logId,
          email: cleanEmail,
          fullName: displayName,
          password: params.password,
          role: params.role,
          canWrite: params.canWrite,
          allowedTabs: params.allowedTabs,
          moduleLabels,
          portalUrl,
          createdBy: params.createdBy || "olosundelouis@gmail.com",
          isPasswordUpdate: !!params.isPasswordUpdate
        }
      })
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      backendSuccess = data.success !== false;
    }
  } catch (err) {
    console.warn("Admin credentials email background trigger notice:", err);
  }

  return { success: backendSuccess, logId };
}

// Save or update an Admin Operator (Super Admin Only)
export async function saveAdminOperator(options: {
  email: string;
  fullName?: string;
  passwordInput?: string;
  password?: string;
  role?: "Super Admin" | "Admin" | "Editor" | "Viewer (Read Only)";
  allowedTabs?: string[];
  canWrite?: boolean;
  status?: "Active" | "Suspended";
  createdBy?: string;
  skipWelcomeEmail?: boolean;
}): Promise<AdminOperatorRecord> {
  const cleanEmail = options.email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Administrator email is required.");
  }

  const rawPassword = (options.passwordInput || options.password || "").trim();
  let passwordDigest: string | undefined = undefined;
  if (rawPassword) {
    passwordDigest = await computeSaltedPasswordDigest(rawPassword);
  }

  const existingList = await getAdminOperators();
  const existing = existingList.find((o) => o.email.toLowerCase() === cleanEmail);
  const isNewOperator = !existing;

  const finalRole = ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail)
    ? "Super Admin"
    : (options.role || existing?.role || "Admin");

  const record: AdminOperatorRecord = {
    email: cleanEmail,
    fullName: options.fullName?.trim() || existing?.fullName || cleanEmail.split("@")[0],
    role: finalRole,
    allowedTabs: options.allowedTabs ?? existing?.allowedTabs ?? [
      "dashboard",
      "reg-cii",
      "reg-rma",
      "teen-bootcamp",
      "events",
      "resources",
      "gallery",
      "messages",
      "visitors-live"
    ],
    canWrite: options.canWrite !== undefined ? options.canWrite : (existing?.canWrite ?? true),
    status: options.status || existing?.status || "Active",
    passwordDigest: passwordDigest || existing?.passwordDigest,
    createdBy: options.createdBy || existing?.createdBy || "olosundelouis@gmail.com",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Remove from deleted admin operators list if re-created or updated
  const deletedOps = getDeletedAdminOperatorEmailsLocal().filter((e) => e !== cleanEmail);
  saveDeletedAdminOperatorEmailsLocal(deletedOps);

  // 1. Update local directory cache
  if (typeof window !== "undefined") {
    try {
      const updatedList = existingList.filter((o) => o.email.toLowerCase() !== cleanEmail);
      updatedList.unshift(record);
      localStorage.setItem("rma_admin_operators_directory", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("rma_admin_operators_updated"));
    } catch {}
  }

  // 2. Write to Firestore `admins/{cleanEmail}`
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const firestorePayload: Record<string, any> = {
      email: record.email,
      fullName: record.fullName,
      role: record.role,
      allowedTabs: record.allowedTabs,
      canWrite: record.canWrite,
      status: record.status,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
    if (record.passwordDigest) {
      firestorePayload.passwordDigest = record.passwordDigest;
    }
    await setDoc(doc(db, "admins", cleanEmail), firestorePayload, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore admins write deferred or offline:", fsErr);
  }

  // 3. Sync with PlatformUsers (`users` collection) so both tabs stay in 100% sync
  try {
    const platformUsers = await getPlatformUsers();
    const existingUser = platformUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const syncedUser: PlatformUser = {
      id: existingUser?.id || `usr-admin-${Date.now()}`,
      fullName: record.fullName || cleanEmail.split("@")[0],
      email: cleanEmail,
      phone: existingUser?.phone || "+234",
      role: record.role === "Viewer (Read Only)" ? "Viewer" : "Admin",
      status: record.status === "Suspended" ? "Suspended" : "Active",
      joinedAt: existingUser?.joinedAt || record.createdAt,
      location: existingUser?.location || "HQ Operations",
      emailVerified: true,
      verificationDate: existingUser?.verificationDate || new Date().toISOString(),
      allowedTabs: record.allowedTabs,
      canWrite: record.canWrite,
      passwordDigest: record.passwordDigest
    };
    await savePlatformUser(syncedUser);
  } catch (syncErr) {
    console.warn("PlatformUser sync notice:", syncErr);
  }

  // 4. Sync with backend server if password was provided
  if (rawPassword) {
    try {
      let token = "";
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("rma_current_logged_in_user");
        if (saved) {
          token = JSON.parse(saved)?.token || "";
        }
      }
      if (token) {
        await fetch("/api/admin/register-operator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            email: cleanEmail,
            fullName: record.fullName,
            password: rawPassword,
            role: record.role,
            allowedTabs: record.allowedTabs,
            canWrite: record.canWrite
          })
        }).catch(() => null);
      }
    } catch {}
  }

  // 5. Automatically send login credentials email whenever a new admin is created or a password is set
  if (rawPassword && !options.skipWelcomeEmail) {
    await sendAdminLoginCredentialsEmail({
      email: cleanEmail,
      fullName: record.fullName || cleanEmail.split("@")[0],
      password: rawPassword,
      role: record.role,
      canWrite: record.canWrite !== false,
      allowedTabs: record.allowedTabs || [],
      createdBy: record.createdBy,
      isPasswordUpdate: !isNewOperator
    }).catch((mailErr) => {
      console.warn("Failed dispatching admin login credentials email:", mailErr);
    });
  }

  return record;
}

export async function deleteAdminOperator(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (ANCHOR_SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
    throw new Error("The System Owner / Super Admin account (olosundelouis@gmail.com) cannot be deleted.");
  }

  const deletedOps = getDeletedAdminOperatorEmailsLocal();
  if (!deletedOps.includes(cleanEmail)) {
    deletedOps.push(cleanEmail);
    saveDeletedAdminOperatorEmailsLocal(deletedOps);
  }

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_admin_operators_directory");
      if (saved) {
        const list: AdminOperatorRecord[] = JSON.parse(saved);
        const filtered = list.filter((o) => o.email.toLowerCase() !== cleanEmail);
        localStorage.setItem("rma_admin_operators_directory", JSON.stringify(filtered));
        window.dispatchEvent(new Event("rma_admin_operators_updated"));
      }
    } catch {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "admins", cleanEmail));
  } catch (err) {
    console.warn("Failed deleting admin operator from Firestore:", err);
  }
}

// Register or update an operator credential strictly via Super Admin authority
export async function registerFallbackAdmin(
  email: string,
  passwordInput: string,
  role: "Super Admin" | "Admin" | "Editor" | "Viewer" = "Admin",
  allowedTabs?: string[],
  canWrite: boolean = true,
  fullName?: string
): Promise<AdminOperatorRecord> {
  return saveAdminOperator({
    email,
    fullName,
    passwordInput,
    role: role === "Viewer" ? "Viewer (Read Only)" : role,
    allowedTabs,
    canWrite,
    status: "Active"
  });
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export async function saveNewsletterSubscription(email: string): Promise<NewsletterSubscriber> {
  const cleanEmail = email.trim().toLowerCase();
  const newSub: NewsletterSubscriber = {
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: cleanEmail,
    subscribedAt: new Date().toISOString()
  };

  // 1. Keep locally in localStorage
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("rma_newsletter_subscribers");
      const list: NewsletterSubscriber[] = localData ? JSON.parse(localData) : [];
      if (!list.some(s => s.email === cleanEmail)) {
        list.unshift(newSub);
        localStorage.setItem("rma_newsletter_subscribers", JSON.stringify(list));
      }
    } catch (e) {
      console.error("Local storage subscriber save error:", e);
    }
  }

  // 2. Direct write to Firestore
  const path = "newsletter";
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docRef = doc(db, path, newSub.id);
    await setDoc(docRef, newSub);
    console.log("Successfully committed newsletter subscriber to Firestore:", newSub.id);
  } catch (err) {
    console.error("Direct Firestore newsletter subscribe failed, fallback queuing:", err);
    queueWrite({
      type: "set",
      collection: path,
      docId: newSub.id,
      data: newSub
    }).catch((queueErr) => {
      console.error("Queue backup newsletter write failed:", queueErr);
    });
    await handleFirestoreError(err, OperationType.WRITE, path);
  }

  return newSub;
}

// ==========================================
// RMA DYNAMIC PORTAL & CMS STORAGE ADDITIONS
// ==========================================

export interface PortalApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  type: "volunteer" | "internship" | "partner" | "facilitator" | "ambassador";
  status: "Received" | "Reviewed" | "Shortlisted" | "Enrolled" | "Deferred";
  fileName?: string;
  fileData?: string; // base64 representation of resume Mock
  appliedAt: string;
  notes?: string;
  options?: Record<string, any>;
}

export interface DynamicTestimonial {
  id: string;
  name: string;
  program: string;
  testimonial: string;
  gradYear: string;
  achievement: string;
  photoUrl: string;
  isFeatured: boolean;
  isHidden: boolean;
  videoUrl?: string; // If supporting video embedding
}

export interface DynamicFAQ {
  id: string;
  question: string;
  answer: string;
  category: "NYSC Programs" | "Registration" | "Payments" | "Events" | "Mentorship" | "Resources";
  isPopular?: boolean;
}

export interface DynamicNewsRelease {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "press" | "news" | "coverage" | "announcement";
  publishedAt: string;
  imgUrl?: string;
  downloadLink?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  type: "one-time" | "recurring" | "sponsor" | "scholarship";
  subType?: string;
  timestamp: string;
}

// Initialize default structures if missing in LocalStorage
if (typeof window !== "undefined") {
  if (!localStorage.getItem("rma_dynamic_testimonials")) {
    const seed: DynamicTestimonial[] = [
      {
        id: "t-seed-1",
        name: "Abiodun Joshua",
        program: "CII (Corper Impact Initiative)",
        testimonial: "I was serving in Cross River with zero professional clarity. Through the CII Resume Clinic and direct guidance, I polished my skills, crafted an executive profile, and transitioned into a Remote Tech Consultant role.",
        gradYear: "2025",
        achievement: "Remote Solutions Specialist",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80",
        isFeatured: true,
        isHidden: false
      },
      {
        id: "t-seed-2",
        name: "Gracious Chisom",
        program: "Monthly Reinvention Program",
        testimonial: "The accountability circles helped me eradicate the self-procrastination that was pulling my WAEC preparation back. I designed execution trackers, joined peer groups, and finally emerged with distinction!",
        gradYear: "2024",
        achievement: "Undergraduate Fellow",
        photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&fit=crop&q=80",
        isFeatured: true,
        isHidden: false
      }
    ];
    localStorage.setItem("rma_dynamic_testimonials", JSON.stringify(seed));
  }

  if (!localStorage.getItem("rma_dynamic_faqs")) {
    const seed: DynamicFAQ[] = [
      {
        id: "faq-seed-1",
        question: "How do I join the Campus Ambassador Program?",
        answer: "If you are an active student at any African tertiary institution, navigate to the Volunteer Portal under Career Opportunities, choose the 'Campus Ambassador' application category, upload your academic status proof, and submit! Our regional heads select ambassadors in January and June.",
        category: "Registration",
        isPopular: true
      },
      {
        id: "faq-seed-2",
        question: "Are payment installments allowed for the Reinvention Program?",
        answer: "Yes, our pricing models accommodate structured installments. Reach out directly to the billing bureau via our support contact, or select the structured payment flow during checkout to automate fulfillment.",
        category: "Payments",
        isPopular: true
      }
    ];
    localStorage.setItem("rma_dynamic_faqs", JSON.stringify(seed));
  }

  if (!localStorage.getItem("rma_dynamic_news")) {
    const seed: DynamicNewsRelease[] = [
      {
        id: "news-seed-1",
        title: "Right Minds Africa Expands Regional Chapters to Southwest Nigeria",
        summary: "We have successfully inaugurated new physical commands across Oyo and Osun chapters to mobilize outreaches and book drives.",
        content: "Right Minds Africa under the executive directorate of Gracious-Esther is taking the crusade of mindset re-engineering to high schools and secondary classes. The rollout launches on June 15th with targeted book donations and goal trackers giveaways.",
        category: "press",
        publishedAt: "2026-05-28T10:00:00.000Z",
        imgUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&q=80"
      }
    ];
    localStorage.setItem("rma_dynamic_news", JSON.stringify(seed));
  }

  if (!localStorage.getItem("rma_donations_log")) {
    const seedDonations: DonationRecord[] = [
      {
        id: "don-seed-1",
        donorName: "RMA Regional Patron",
        donorEmail: "patron@rma.org",
        amount: 250,
        type: "sponsor",
        subType: "Sponsor Regional Outreach Command",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: "don-seed-2",
        donorName: "Oluwatimilehin Vicent O. (CV)",
        donorEmail: "creative@rightminds.africa",
        amount: 45,
        type: "scholarship",
        subType: "Sponsor undergraduate workbook licenses",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: "don-seed-3",
        donorName: "RMA Youth Partner",
        donorEmail: "partner@rightminds.africa",
        amount: 15,
        type: "scholarship",
        subType: "Sponsor teen habit planners",
        timestamp: new Date().toISOString()
      }
    ];
    localStorage.setItem("rma_donations_log", JSON.stringify(seedDonations));
  }
}

// --------------------------------------------------
// 1. Careers & Volunteer Applications APIs
// --------------------------------------------------
export async function getPortalApplications(): Promise<PortalApplication[]> {
  let list: PortalApplication[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_portal_applications");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to read portal applications from local storage:", e);
    }
  }

  const path = "portal_applications";
  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    
    const q = query(collection(db, path), orderBy("appliedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const fbList: PortalApplication[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as PortalApplication);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_portal_applications", JSON.stringify(fbList));
      }
      return fbList;
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("permission") || errMsg.includes("Permission") || errMsg.includes("denied")) {
      console.warn("Permission denied for portal applications, showing cached application tracking desk.");
    } else {
      console.warn("Could not retrieve portal applications from Firestore, using local data:", err);
    }
  }

  return list;
}

export async function savePortalApplication(app: Omit<PortalApplication, "id" | "appliedAt" | "status">): Promise<PortalApplication> {
  const newApp: PortalApplication = {
    ...app,
    id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "Received",
    appliedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_portal_applications");
      const list: PortalApplication[] = saved ? JSON.parse(saved) : [];
      list.unshift(newApp);
      localStorage.setItem("rma_portal_applications", JSON.stringify(list));
    } catch (e) {}
  }

  // Sync to Firestore under "portal_applications"
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "portal_applications", newApp.id), newApp);
    console.log("Successfully synchronised portal application to Firestore:", newApp.id);
  } catch (err) {
    console.warn("Failed syncing application to Firestore:", err);
  }

  return newApp;
}

export async function updatePortalApplicationStatus(id: string, status: PortalApplication["status"]): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_portal_applications");
      if (saved) {
        const list: PortalApplication[] = JSON.parse(saved);
        const idx = list.findIndex(a => a.id === id);
        if (idx !== -1) {
          list[idx].status = status;
          localStorage.setItem("rma_portal_applications", JSON.stringify(list));
        }
      }
    } catch (e) {}
  }

  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await updateDoc(doc(db, "portal_applications", id), { status });
  } catch (err) {}
}

// --------------------------------------------------
// 2. Testimonials APIs
// --------------------------------------------------
export async function getDynamicTestimonials(): Promise<DynamicTestimonial[]> {
  let list: DynamicTestimonial[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_testimonials");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const path = "testimonials";
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, path));
    
    const fbList: DynamicTestimonial[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as DynamicTestimonial);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_dynamic_testimonials", JSON.stringify(fbList));
      }
      return fbList;
    }
  } catch (err) {
    console.warn("Could not retrieve testimonials from Firestore, using local data:", err);
  }

  return list;
}

export async function saveDynamicTestimonial(testimonial: DynamicTestimonial): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_testimonials");
      let list: DynamicTestimonial[] = saved ? JSON.parse(saved) : [];
      list = list.filter(t => t.id !== testimonial.id);
      list.push(testimonial);
      localStorage.setItem("rma_dynamic_testimonials", JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "testimonials", testimonial.id), testimonial);
  } catch (err) {}
}

export async function deleteDynamicTestimonial(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_testimonials");
      if (saved) {
        let list: DynamicTestimonial[] = JSON.parse(saved);
        list = list.filter(t => t.id !== id);
        localStorage.setItem("rma_dynamic_testimonials", JSON.stringify(list));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "testimonials", id));
  } catch (err) {}
}

// --------------------------------------------------
// 3. Dynamic FAQs APIs
// --------------------------------------------------
export async function getDynamicFAQs(): Promise<DynamicFAQ[]> {
  let list: DynamicFAQ[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_faqs");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const path = "faqs";
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, path));
    
    const fbList: DynamicFAQ[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as DynamicFAQ);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_dynamic_faqs", JSON.stringify(fbList));
      }
      return fbList;
    }
  } catch (err) {
    console.warn("Could not retrieve FAQs from Firestore, using local data:", err);
  }

  return list;
}

export async function saveFAQ(faq: DynamicFAQ): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_faqs");
      let list: DynamicFAQ[] = saved ? JSON.parse(saved) : [];
      list = list.filter(f => f.id !== faq.id);
      list.push(faq);
      localStorage.setItem("rma_dynamic_faqs", JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "faqs", faq.id), faq);
  } catch (err) {}
}

export async function deleteFAQ(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_faqs");
      if (saved) {
        let list: DynamicFAQ[] = JSON.parse(saved);
        list = list.filter(f => f.id !== id);
        localStorage.setItem("rma_dynamic_faqs", JSON.stringify(list));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "faqs", id));
  } catch (err) {}
}

// --------------------------------------------------
// 4. Media Releases / News APIs
// --------------------------------------------------
export async function getDynamicNews(): Promise<DynamicNewsRelease[]> {
  let list: DynamicNewsRelease[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_news");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const path = "news_releases";
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, path));
    
    const fbList: DynamicNewsRelease[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as DynamicNewsRelease);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_dynamic_news", JSON.stringify(fbList));
      }
      return fbList;
    }
  } catch (err) {
    console.warn("Could not retrieve news releases from Firestore, using local data:", err);
  }

  return list;
}

export async function saveNewsRelease(news: DynamicNewsRelease): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_news");
      let list: DynamicNewsRelease[] = saved ? JSON.parse(saved) : [];
      list = list.filter(n => n.id !== news.id);
      list.push(news);
      localStorage.setItem("rma_dynamic_news", JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "news_releases", news.id), news);
  } catch (err) {}
}

export async function deleteNewsRelease(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_dynamic_news");
      if (saved) {
        let list: DynamicNewsRelease[] = JSON.parse(saved);
        list = list.filter(n => n.id !== id);
        localStorage.setItem("rma_dynamic_news", JSON.stringify(list));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "news_releases", id));
  } catch (err) {}
}

// --------------------------------------------------
// 5. Donations Support APIs
// --------------------------------------------------
export async function getDonations(): Promise<DonationRecord[]> {
  let list: DonationRecord[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_donations_log");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const path = "donations";
  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    
    const q = query(collection(db, path), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    const fbList: DonationRecord[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as DonationRecord);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_donations_log", JSON.stringify(fbList));
      }
      return fbList;
    }
  } catch (err) {
    console.warn("Could not retrieve donations from Firestore, using local data:", err);
  }

  return list;
}

export async function saveDonation(donorName: string, donorEmail: string, amount: number, type: DonationRecord["type"], subType?: string): Promise<DonationRecord> {
  const newDonation: DonationRecord = {
    id: `don-${Date.now()}`,
    donorName: donorName || "Anonymous Supporter",
    donorEmail: donorEmail || "anonymous@rma.org",
    amount,
    type,
    subType,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_donations_log");
      const list: DonationRecord[] = saved ? JSON.parse(saved) : [];
      list.unshift(newDonation);
      localStorage.setItem("rma_donations_log", JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "donations", newDonation.id), newDonation);
  } catch (err) {}

  return newDonation;
}

// ============================================================================
// LMS PREMIUM ACADEMY DATA MODELS & API INTEGRATION
// ============================================================================

export interface LMSLesson {
  id: string;
  title: string;
  type: "video" | "pdf" | "audio" | "assignment" | "quiz" | "external";
  videoUrl?: string; // YouTube embedding URL or standard MP4 Link
  pdfUrl?: string; // pdf link
  audioUrl?: string; // podcast or mp3 link
  duration: string;
  isFreePreview?: boolean;
  assignmentText?: string;
  quizQuestions?: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface LMSModule {
  id: string;
  title: string;
  description: string;
  lessons: LMSLesson[];
}

export interface BankAccountConfig {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  active: boolean;
}

export interface PaystackSettingsConfig {
  sandboxMode: boolean;
  publicKey: string;
  secretKey: string;
}

export interface PaymentHubSettings {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAccounts: BankAccountConfig[];
  paystackSettings?: PaystackSettingsConfig;
  paymentInstructions: string;
  acceptedFileTypes: string[];
  maxUploadSizeMB: number;
  approvalWorkflow: "manual_admin" | "auto";
  notificationEmail: string;
  warningNotice: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface LMSCourse {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  category: string;
  price: number; // in NGN (e.g. 15000)
  thumbnail: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessonsCount: number;
  status: "draft" | "published";
  modules: LMSModule[];
  paymentMethods?: ("paystack" | "bank_transfer")[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LMSCourseEnrollment {
  id: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  courseId: string;
  courseTitle?: string;
  enrolledAt: string;
  progress: number; // 0 to 100 completion percentage
  completedLessons: string[]; // List of completed lesson IDs
  status: "pending" | "payment_submitted" | "under_review" | "active" | "approved" | "rejected" | "expired" | "refunded" | "completed";
  paymentReference?: string;
  paymentId?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface LMSCoursePayment {
  id: string;
  userEmail: string;
  courseId: string;
  courseTitle?: string;
  amount: number;
  paymentReference: string;
  paymentStatus: "pending" | "payment_submitted" | "under_review" | "approved" | "rejected" | "expired" | "refunded";
  timestamp: string;
  paymentMethod: "bank_transfer";
  studentName?: string;
  studentPhone?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFileType?: string;
  bankPaidFrom?: string;
  accountNamePaidFrom?: string;
  transactionRef?: string;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
  rejectionReason?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface LMSAuditLog {
  id: string;
  action: "Payment Submitted" | "Payment Approved" | "Payment Rejected" | "Enrollment Approved" | "Enrollment Revoked" | "Payment Re-upload Requested" | "Payment Settings Updated";
  administrator: string;
  student: string;
  studentEmail?: string;
  course: string;
  courseId?: string;
  referenceNumber?: string;
  timestamp: string;
  details?: string;
}

export interface LMSCourseCertificate {
  id: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  certificateCode: string; // Unique URL-verifiable code (e.g. RMA-CERT-E389A)
  issuedAt: string;
}

// Beautiful static high-fidelity seed courses
export const DEFAULT_LMS_COURSES: LMSCourse[] = [
  {
    id: "course-1",
    title: "NYSC Career Accelerator & Corporate Branding Blueprint",
    description: "Learn how to bridge the severe post-graduation talent gap. Set up a stellar executive-ready resume, position your professional LinkedIn brand to work for you internationally, and acquire absolute fluency in technical interview mastery and professional salary negotiation patterns.",
    instructorName: "Olosunde Louis (Founder, RMA Hub)",
    category: "NYSC Success Training",
    price: 15000,
    thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    duration: "12 Hours",
    level: "Intermediate",
    lessonsCount: 5,
    status: "published",
    modules: [
      {
        id: "mod-1-1",
        title: "Module 1: Corporate Navigation Foundations",
        description: "Understanding the corporate matrix and building solid foundations.",
        lessons: [
          {
            id: "les-1-1",
            title: "1.1 The Post-NYSC Reality Check (Free Preview)",
            type: "video",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: "25 min",
            isFreePreview: true
          },
          {
            id: "les-1-2",
            title: "1.2 Building Your High-Agency Resume Profile",
            type: "pdf",
            pdfUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf",
            duration: "15 min",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-1-2",
        title: "Module 2: Landing Global Opportunities",
        description: "Outbound positioning, resume hacks, and digital footprints.",
        lessons: [
          {
            id: "les-1-3",
            title: "2.1 LinkedIn Inbound Opportunities Magnet Strategy",
            type: "audio",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            duration: "35 min",
            isFreePreview: false
          },
          {
            id: "les-1-4",
            title: "2.2 Mid-Term Practical Assignment",
            type: "assignment",
            assignmentText: "Draft a 150-word LinkedIn About Section demonstrating your primary core expertise. Focus on direct action verbs and quantifiable impact. Submit below for reviewer coaching.",
            duration: "20 min",
            isFreePreview: false
          },
          {
            id: "les-1-5",
            title: "2.3 Module Assessment Quiz",
            type: "quiz",
            duration: "10 min",
            quizQuestions: [
              {
                id: "q-1-1",
                question: "Which index should ideally highlight your primary career value metrics on LinkedIn?",
                options: ["About Section & Experience bullets", "Following grid", "Reactions list", "Profile Background color"],
                correctAnswer: "About Section & Experience bullets"
              },
              {
                id: "q-1-2",
                question: "What is a 'High-Agency' professional profile?",
                options: ["One that takes proactive initiative to find and build solutions on their own", "One that waits for detailed guidance", "A profile with 20 certifications", "A profile verified by a recruiting firm only"],
                correctAnswer: "One that takes proactive initiative to find and build solutions on their own"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "Advanced Full-Stack Engineering & Micro-SaaS Business Launchpad",
    description: "Go beyond generic tutorials. Architect highly scalable, secure, professional server-side and browser applications while establishing robust codebases. Learn to set up custom server proxies, manage databases securely, launch products independently, and capture client payments easily.",
    instructorName: "Amara Okonkwo (CTO & Lead Architect)",
    category: "Digital Skills",
    price: 35000,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    duration: "24 Hours",
    level: "Advanced",
    lessonsCount: 4,
    status: "published",
    modules: [
      {
        id: "mod-2-1",
        title: "Module 1: Production System Architecture",
        description: "Industrial strength frontend, robust API endpoints, and clean DB boundaries.",
        lessons: [
          {
            id: "les-2-1",
            title: "1.1 Single-Tenant vs Multi-Tenant Storage Models (Free Preview)",
            type: "video",
            videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
            duration: "40 min",
            isFreePreview: true
          },
          {
            id: "les-2-2",
            title: "1.2 Hardening API Security & Reverse Proxies",
            type: "pdf",
            pdfUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf",
            duration: "20 min"
          },
          {
            id: "les-2-3",
            title: "1.3 Micro-SaaS API Integration Assignment",
            type: "assignment",
            assignmentText: "Explain in 3 detailed steps how to securely store third-party credentials (API keys) on the backend using Express and Node environmental parameters.",
            duration: "15 min"
          },
          {
            id: "les-2-4",
            title: "1.4 Backend Architecture Final Quiz",
            type: "quiz",
            duration: "15 min",
            quizQuestions: [
              {
                id: "q-2-1",
                question: "Why should critical API keys never be exposed on the frontend client browser?",
                options: ["Attackers can easily extract them from client sources to abuse your quota", "It makes compilation slower", " Browsers do not support importing keys", "None of the above"],
                correctAnswer: "Attackers can easily extract them from client sources to abuse your quota"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-3",
    title: "Monthly Reinvention Program & Mindset Blueprint",
    description: "A powerful self-reinvention experience to rewire your mindset, form robust self-leadership habits, master emotional maturity, and build high-agency systems. Master the blueprint used by modern leaders to break limiting beliefs, structure ironclad digital/life routines, and double daily execution levels.",
    instructorName: "Olosunde Louis (Founder, RMA Hub)",
    category: "Mindset & Transformation",
    price: 25000,
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    duration: "20 Hours",
    level: "Beginner",
    lessonsCount: 6,
    status: "published",
    modules: [
      {
        id: "mod-3-1",
        title: "Module 1: Re-imagining Your Baseline & Emotional Mastery",
        description: "Unlocking self-reinvention psychology, letting go of unneeded loops and legacy habits, and mastering somatic emotional regulation.",
        lessons: [
          {
            id: "les-3-1",
            title: "1.1 The Psychological Mandate of Reinvention (Free Preview)",
            type: "video",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: "30 min",
            isFreePreview: true
          },
          {
            id: "les-3-2",
            title: "1.2 Somatic & Cognitive Regulation Protocols",
            type: "pdf",
            pdfUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf",
            duration: "25 min"
          },
          {
            id: "les-3-3",
            title: "1.3 Daily Trigger Playbook Homework",
            type: "assignment",
            assignmentText: "List 3 primary cognitive triggers that disrupt your productivity block. For each trigger, define a healthy, non-reactive behavioral response using our Cognitive Shifting Protocol.",
            duration: "20 min"
          }
        ]
      },
      {
        id: "mod-3-2",
        title: "Module 2: High-Agency Systems & Identity Reconstruction",
        description: "Designing identity-congruent habits, establishing strict digital focus bounds, and reinforcing unshakeable confidence loops.",
        lessons: [
          {
            id: "les-3-4",
            title: "2.1 System Architecture: Rules over Empty Goals",
            type: "audio",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            duration: "45 min"
          },
          {
            id: "les-3-5",
            title: "2.2 Identity Reconstruction Writing Exercise",
            type: "assignment",
            assignmentText: "Draft your personal narrative reframing your history around proactive agency and ownership. Remove passive or victimhood structures.",
            duration: "30 min"
          },
          {
            id: "les-3-6",
            title: "2.3 Self-Leadership Mastery Quiz",
            type: "quiz",
            duration: "15 min",
            quizQuestions: [
              {
                id: "q-3-1",
                question: "How does a self-led person build authentic, unshakeable confidence?",
                options: [
                  "By making and repeatedly keeping promises to themselves over time",
                  "By waiting for external praise and certificates",
                  "By avoiding difficult decisions and tasks",
                  "By following social media positive slogans alone"
                ],
                correctAnswer: "By making and repeatedly keeping promises to themselves over time"
              },
              {
                id: "q-3-2",
                question: "What is the difference between intent-based results and empty busyness?",
                options: [
                  "Intent focused tasks directly move your core success metrics",
                  "Empty busyness produces high-quality strategic transformation",
                  "There is no difference",
                  "Empty busyness requires less digital screen time"
                ],
                correctAnswer: "Intent focused tasks directly move your core success metrics"
              }
            ]
          }
        ]
      }
    ]
  }
];

function getDeletedCourseIdsLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("rma_deleted_course_ids");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveDeletedCourseIdsLocal(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(ids));
    localStorage.setItem("rma_deleted_course_ids", JSON.stringify(unique));
  } catch (e) {}
}

function getCustomSavedCoursesLocal(): LMSCourse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("rma_custom_saved_courses");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCustomSavedCoursesLocal(courses: LMSCourse[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("rma_custom_saved_courses", JSON.stringify(courses));
  } catch {}
}

function mergeCoursesLists(
  lists: LMSCourse[][],
  deletedIds: Set<string>
): LMSCourse[] {
  const map = new Map<string, LMSCourse>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const course of list) {
      if (!course || !course.id || deletedIds.has(course.id)) continue;
      const existing = map.get(course.id);
      if (!existing) {
        map.set(course.id, course);
      } else {
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const incomingTime = course.updatedAt ? new Date(course.updatedAt).getTime() : 0;
        if (incomingTime >= existingTime) {
          map.set(course.id, { ...existing, ...course });
        }
      }
    }
  }
  return Array.from(map.values());
}

// Initialize Course seeds in localStorage only if never initialized before
if (typeof window !== "undefined") {
  const existingCourses = localStorage.getItem("rma_lms_courses");
  if (existingCourses === null) {
    const deletedIds = new Set(getDeletedCourseIdsLocal());
    const initialCourses = DEFAULT_LMS_COURSES.filter(c => !deletedIds.has(c.id));
    localStorage.setItem("rma_lms_courses", JSON.stringify(initialCourses));
  }
}

// --------------------------------------------------
// Courses Database APIs
// --------------------------------------------------
export async function getCourses(): Promise<LMSCourse[]> {
  let deletedIds = new Set<string>(getDeletedCourseIdsLocal());
  let localList: LMSCourse[] = [];
  const customSavedList: LMSCourse[] = getCustomSavedCoursesLocal();

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_lms_courses");
      if (saved !== null) {
        localList = (JSON.parse(saved) as LMSCourse[]).filter(c => !deletedIds.has(c.id));
      }
    } catch (e) {}
  }

  const fallbackCourses = mergeCoursesLists(
    [DEFAULT_LMS_COURSES, localList, customSavedList],
    deletedIds
  );

  const fetchFs = async (): Promise<LMSCourse[]> => {
    const { collection, getDocs, doc, getDoc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();

    // 1. Sync deleted course IDs from Firestore settings/deleted_courses
    try {
      const deletedSnap = await getDoc(doc(db, "settings", "deleted_courses"));
      if (deletedSnap.exists()) {
        const remoteDeleted = deletedSnap.data()?.ids;
        if (Array.isArray(remoteDeleted)) {
          remoteDeleted.forEach((id: string) => deletedIds.add(id));
          saveDeletedCourseIdsLocal(Array.from(deletedIds));
        }
      }
    } catch (e) {}

    // 2. Read from settings/courses_settings (mirrors events/resources/gallery reliability)
    let settingsCoursesList: LMSCourse[] = [];
    try {
      const settingsSnap = await getDoc(doc(db, "settings", "courses_settings"));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (Array.isArray(data?.deletedIds)) {
          data.deletedIds.forEach((id: string) => deletedIds.add(id));
          saveDeletedCourseIdsLocal(Array.from(deletedIds));
        }
        if (Array.isArray(data?.list)) {
          settingsCoursesList = (data.list as LMSCourse[]).filter(c => c && c.id && !deletedIds.has(c.id));
        }
      }
    } catch (e) {}

    // 3. Read from courses collection
    const fbList: LMSCourse[] = [];
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      querySnapshot.forEach((docSnap) => {
        if (!deletedIds.has(docSnap.id)) {
          fbList.push({ id: docSnap.id, ...docSnap.data() } as LMSCourse);
        }
      });
    } catch (e) {}

    // 4. Merge Default + Remote Settings + Remote Collection + Local Custom Saved Courses
    const merged = mergeCoursesLists(
      [
        DEFAULT_LMS_COURSES,
        localList,
        settingsCoursesList,
        fbList,
        getCustomSavedCoursesLocal()
      ],
      deletedIds
    );

    if (merged.length > 0 || deletedIds.size > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_lms_courses", JSON.stringify(merged));
      }
      // If Firestore had no courses yet, persist the merged list to Firestore in background
      if (fbList.length === 0 && settingsCoursesList.length === 0 && merged.length > 0) {
        (async () => {
          try {
            await setDoc(doc(db, "settings", "courses_settings"), {
              list: JSON.parse(JSON.stringify(merged)),
              deletedIds: Array.from(deletedIds),
              updatedAt: new Date().toISOString()
            }, { merge: true });
            for (const c of merged) {
              await setDoc(doc(db, "courses", c.id), JSON.parse(JSON.stringify(c)));
            }
          } catch {}
        })();
      }
      return merged;
    }

    return fallbackCourses;
  };

  const fsTimeout = new Promise<LMSCourse[]>((resolve) =>
    setTimeout(() => {
      resolve(fallbackCourses);
    }, 3500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve courses from Firestore, using local data:", err);
  }

  return fallbackCourses;
}

export async function saveCourse(course: LMSCourse): Promise<void> {
  // Sanitize course object to strip any undefined values (Firestore rejects undefined)
  const sanitizedCourse: LMSCourse = JSON.parse(
    JSON.stringify({
      ...course,
      price: Number.isFinite(Number(course.price)) ? Number(course.price) : 0,
      lessonsCount: Array.isArray(course.modules)
        ? course.modules.reduce((sum, m) => sum + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
        : (course.lessonsCount || 0),
      modules: Array.isArray(course.modules) ? course.modules : [],
      paymentMethods:
        Array.isArray(course.paymentMethods) && course.paymentMethods.length > 0
          ? course.paymentMethods
          : ["paystack", "bank_transfer"],
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  );

  const deletedIds = getDeletedCourseIdsLocal().filter(id => id !== sanitizedCourse.id);
  saveDeletedCourseIdsLocal(deletedIds);

  let updatedFullList: LMSCourse[] = [];

  if (typeof window !== "undefined") {
    try {
      // 1. Save in dedicated custom courses store so background snapshot/fetch never wipes it out
      const customList = getCustomSavedCoursesLocal().filter(c => c.id !== sanitizedCourse.id);
      customList.push(sanitizedCourse);
      saveCustomSavedCoursesLocal(customList);

      // 2. Save in primary rma_lms_courses store
      const saved = localStorage.getItem("rma_lms_courses");
      const currentList: LMSCourse[] = saved ? JSON.parse(saved) : [...DEFAULT_LMS_COURSES];
      updatedFullList = mergeCoursesLists(
        [currentList, [sanitizedCourse]],
        new Set(deletedIds)
      );
      localStorage.setItem("rma_lms_courses", JSON.stringify(updatedFullList));
    } catch (e) {
      console.error("Local saveCourse error:", e);
    }
  }

  // 3. Persist to Firestore (`courses/{id}` AND `settings/courses_settings`)
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await Promise.all([
      setDoc(doc(db, "courses", sanitizedCourse.id), sanitizedCourse),
      setDoc(
        doc(db, "settings", "courses_settings"),
        {
          list: updatedFullList.length > 0 ? updatedFullList : [sanitizedCourse],
          deletedIds,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      ),
      setDoc(
        doc(db, "settings", "deleted_courses"),
        {
          ids: deletedIds,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      )
    ]);
  } catch (err) {
    console.warn("Firestore course write deferred, queuing backup write:", err);
    queueWrite({
      type: "set",
      collection: "courses",
      docId: sanitizedCourse.id,
      data: sanitizedCourse
    }).catch(() => null);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("rma_courses_updated"));
  }
}

export async function deleteCourse(id: string): Promise<void> {
  const deletedIds = Array.from(new Set([...getDeletedCourseIdsLocal(), id]));
  saveDeletedCourseIdsLocal(deletedIds);

  let updatedList: LMSCourse[] = [];
  if (typeof window !== "undefined") {
    try {
      const customList = getCustomSavedCoursesLocal().filter(c => c.id !== id);
      saveCustomSavedCoursesLocal(customList);

      const saved = localStorage.getItem("rma_lms_courses");
      const list: LMSCourse[] = saved ? JSON.parse(saved) : [];
      updatedList = list.filter(c => c.id !== id);
      localStorage.setItem("rma_lms_courses", JSON.stringify(updatedList));
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await Promise.all([
      deleteDoc(doc(db, "courses", id)),
      setDoc(
        doc(db, "settings", "courses_settings"),
        {
          list: updatedList,
          deletedIds,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      ),
      setDoc(
        doc(db, "settings", "deleted_courses"),
        {
          ids: deletedIds,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      )
    ]);
  } catch (err) {
    console.warn("Failed to sync course deletion to Firestore:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("rma_courses_updated"));
  }
}

// --------------------------------------------------
// Enrollments Database APIs
// --------------------------------------------------
export async function getCourseEnrollments(userEmail?: string): Promise<LMSCourseEnrollment[]> {
  let list: LMSCourseEnrollment[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_course_enrollments");
      if (saved) {
        list = JSON.parse(saved);
        if (userEmail) {
          list = list.filter(e => e.userEmail.toLowerCase() === userEmail.toLowerCase());
        }
      }
    } catch (e) {}
  }

  const fetchFs = async (): Promise<LMSCourseEnrollment[]> => {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    
    let q = query(collection(db, "course_enrollments"));
    if (userEmail) {
      q = query(collection(db, "course_enrollments"), where("userEmail", "==", userEmail));
    }
    const querySnapshot = await getDocs(q);
    const fbList: LMSCourseEnrollment[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as LMSCourseEnrollment);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        if (!userEmail) {
          localStorage.setItem("rma_course_enrollments", JSON.stringify(fbList));
        } else {
          // Merge to cache safely
          const currentLocal = localStorage.getItem("rma_course_enrollments");
          let fullList: LMSCourseEnrollment[] = currentLocal ? JSON.parse(currentLocal) : [];
          fullList = fullList.filter(e => e.userEmail.toLowerCase() !== userEmail.toLowerCase());
          fullList.push(...fbList);
          localStorage.setItem("rma_course_enrollments", JSON.stringify(fullList));
        }
      }
      return fbList;
    }
    return list;
  };

  const fsTimeout = new Promise<LMSCourseEnrollment[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve course enrollments from Firestore, using local data:", err);
    return list;
  }
}

export async function saveCourseEnrollment(enrollment: LMSCourseEnrollment): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_course_enrollments");
      let list: LMSCourseEnrollment[] = saved ? JSON.parse(saved) : [];
      list = list.filter(e => e.id !== enrollment.id);
      list.push(enrollment);
      localStorage.setItem("rma_course_enrollments", JSON.stringify(list));
    } catch (e) {}
  }

  const writeFs = async () => {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "course_enrollments", enrollment.id), enrollment);
  };

  const fsTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firestore write timeout (2500ms elapsed)")), 2500)
  );

  try {
    await Promise.race([writeFs(), fsTimeout]);
  } catch (err: any) {
    console.warn("Course enrollment Firestore write delayed/offline, queued:", err?.message || err);
    queueWrite({
      type: "set",
      collection: "course_enrollments",
      docId: enrollment.id,
      data: enrollment
    }).catch(() => null);
  }
}

// --------------------------------------------------
// Payments Database APIs
// --------------------------------------------------
export async function getCoursePayments(): Promise<LMSCoursePayment[]> {
  let list: LMSCoursePayment[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_course_payments");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const fetchFs = async (): Promise<LMSCoursePayment[]> => {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "course_payments"));
    const fbList: LMSCoursePayment[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as LMSCoursePayment);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_course_payments", JSON.stringify(fbList));
      }
      return fbList;
    }
    return list;
  };

  const fsTimeout = new Promise<LMSCoursePayment[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve lms payments from Firestore, using local data:", err);
    return list;
  }
}

export async function saveCoursePayment(payment: LMSCoursePayment): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_course_payments");
      let list: LMSCoursePayment[] = saved ? JSON.parse(saved) : [];
      list = list.filter(p => p.id !== payment.id);
      list.push(payment);
      localStorage.setItem("rma_course_payments", JSON.stringify(list));
    } catch (e) {}
  }

  const writeFs = async () => {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "course_payments", payment.id), payment);
  };

  const fsTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firestore write timeout (2500ms elapsed)")), 2500)
  );

  try {
    await Promise.race([writeFs(), fsTimeout]);
  } catch (err: any) {
    console.warn("Course payment Firestore write delayed/offline, queued:", err?.message || err);
    queueWrite({
      type: "set",
      collection: "course_payments",
      docId: payment.id,
      data: payment
    }).catch(() => null);
  }
}

// --------------------------------------------------
// LMS Audit Logs APIs
// --------------------------------------------------
export async function getLmsAuditLogs(): Promise<LMSAuditLog[]> {
  let list: LMSAuditLog[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_lms_audit_logs");
      if (saved) list = JSON.parse(saved);
    } catch (e) {}
  }

  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "audit_logs"));
    const fbList: LMSAuditLog[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as LMSAuditLog);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_lms_audit_logs", JSON.stringify(fbList));
      }
      return fbList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (err) {}

  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function saveLmsAuditLog(log: LMSAuditLog): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_lms_audit_logs");
      let list: LMSAuditLog[] = saved ? JSON.parse(saved) : [];
      list = list.filter(l => l.id !== log.id);
      list.unshift(log);
      localStorage.setItem("rma_lms_audit_logs", JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "audit_logs", log.id), log);
  } catch (err) {}
}

// --------------------------------------------------
// Certificates Database APIs
// --------------------------------------------------
export async function getCourseCertificates(): Promise<LMSCourseCertificate[]> {
  let list: LMSCourseCertificate[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_course_certificates");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const fetchFs = async (): Promise<LMSCourseCertificate[]> => {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "course_certificates"));
    const fbList: LMSCourseCertificate[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as LMSCourseCertificate);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_course_certificates", JSON.stringify(fbList));
      }
      return fbList;
    }
    return list;
  };

  const fsTimeout = new Promise<LMSCourseCertificate[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve lms certificates from Firestore, using local data:", err);
    return list;
  }
}

export async function saveCourseCertificate(certificate: LMSCourseCertificate): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_course_certificates");
      let list: LMSCourseCertificate[] = saved ? JSON.parse(saved) : [];
      list = list.filter(c => c.id !== certificate.id);
      list.push(certificate);
      localStorage.setItem("rma_course_certificates", JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "course_certificates", certificate.id), certificate);
  } catch (err) {}
}

// --------------------------------------------------
// SOCIAL CONTENT HUB AUTOMATION DATABASE APIs
// --------------------------------------------------
import { SocialPost, SocialFeedConfig, WebsitePopup, HistoricalRecord } from "../types";

const SEED_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "sp-fb-1",
    platform: "facebook",
    title: "The Silent Year: Why NYSC is Your Catalyst",
    content: "The NYSC year is not a year of waiting. It is a year of intense preparation. Many corps members let those twelve months slip by, waiting for 'life to start'. But life has already started! In Corper Impact Initiative, we help you take full control of this calendar block. Learn to manage your savings, acquire digital skill sets, and reposition your mind.",
    blogArticle: `# The Silent Year: Why NYSC is Your Catalyst\n\nThe NYSC year is one of the most critical and often misunderstood seasons in the life of a young Nigerian graduate. For many, it is seen as a "gap year" — a temporary holding state while waiting for the "real world" to begin.\n\nHowever, at the **Right Minds Africa Hub** and the **Corper Impact Initiative (CII)**, we see this year as a **catalytic foundation**.\n\n## The Illusion of Waiting\nMany corps members fall into standard procrastination loops. They assume that career building starts *after* passing out. But that is premium self-deception. The structural gap between corporate requirements and undergraduate education is massive.\n\nThe service year is your golden window of **unstressed runway** to:\n1. **Dismantle Procrastination Loops**: Replace immediate gratification with productive metrics.\n2. **Setup High-Demand Digital Competence**: Gain hands-on understanding in tech and business operations.\n3. **Build Professional Networks**: Align with accountability circles that stretch your capacity.\n4. **Daily Reading Audits**: Commit to upgrading your emotional intelligence and mindset alignment.\n5. **Strategic Micro-Savings**: Learn to save actively, even from small allowances, to master financial sovereignty.\n\n*Don’t let 12 months waste. Make the decision to Think, Live, and Lead with absolute clarity.*`,
    summary: "Stop waiting for your service year to end before building your future. Learn how to leverage NYSC as a powerful personal catalyst.",
    category: "NYSC Success Training",
    mediaType: "image",
    mediaUrls: ["https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800"],
    postUrl: "https://www.facebook.com/RightMAHub/",
    hashtags: ["NYSCSuccess", "MindsetShift", "AfricanYouth", "CorpersImpact"],
    publishedAt: "2026-05-20T10:00:00.000Z",
    syncedAt: "2026-05-20T11:00:00.000Z",
    status: "published",
    likesCount: 142,
    commentsCount: 28,
    engagementScore: 4.8
  },
  {
    id: "sp-ig-2",
    platform: "instagram",
    title: "Procrastination vs. Execution Mindset",
    content: "Are you over-planning and under-executing? The biggest bottleneck to African youth success isn't access to capital, it's character consistency and micro-execution. Stop waiting for the perfect day. Execute when you feel unprepared. Growth lives in the discomfort zone. Read the full post on our blog right now!",
    blogArticle: `# Procrastination vs. Execution: The Real Bottleneck to African Youth Success\n\nOpen Instagram on any given day and you will see endless slogans about "grinding" and "hustling". Yet, there remains a massive gap between **aspiration** and **execution**.\n\nWhy is this? Let’s examine the anatomy of execution.\n\n## The Perfection Paralysis\nUndergraduates and recent graduates are notorious for "over-planning". They buy the notebooks, design beautiful spreadsheets, and set ambitious goals, but they never publish. They never hit submit. They never launch the website.\n\nThis is a fear of vulnerability disguised as standard planning.\n\n## Keys to an Active Output Engine\nTo develop what we call the **Grace, Growth, and Grit (G3)** mindset:\n1. **Reduce the Friction to Start**: Set your target to just 15 minutes of deep focus.\n2. **Measure Output, Not Hours**: Did you write the code? Did you send the cold email? Or did you just "think about doing it"?\n3. **Accept Intermediate Imperfection**: Your first draft will be messy. Build the muscle of shipping before polishing.\n\nAt Right Minds Africa, we believe true leadership is character in action. Stand up and build!`,
    summary: "The biggest bottleneck isn't capital, it's execution consistency. Learn how to move from perfection paralysis to micro-execution.",
    category: "Personal Development",
    mediaType: "carousel",
    mediaUrls: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800"
    ],
    postUrl: "https://www.instagram.com/rightmindsafrica",
    hashtags: ["ExecutionMindset", "NoExcuses", "RightMinds", "G3Strategy"],
    publishedAt: "2026-05-18T14:30:00.000Z",
    syncedAt: "2026-05-18T15:00:00.000Z",
    status: "published",
    likesCount: 236,
    commentsCount: 45,
    engagementScore: 5.2
  },
  {
    id: "sp-fb-3",
    platform: "facebook",
    title: "Entrepreneurship is a Character Game",
    content: "If you think entrepreneurship is just about business ideas and funds, you have missed it. Success in business is a reflection of your internal EQ and structural discipline. Your ability to speak the truth, complete contracts on time, and build high-trust relationships is what makes your business eternal.",
    blogArticle: `# Entrepreneurship is a Character Game\n\nMost business accelerators teach financial modeling, pitch deck drafting, and venture capital negotiations. While these are necessary mechanics, they omit the **core engine** of any business enterprise: **The Founder's Character**.\n\nIn developing markets like Nigeria and across Africa, trust is a rare and highly valuable asset.\n\n## Trust: The Ultimate Economic Friction-Reducer\nWhen high integrity is missing:\n- **Transaction Costs Explode**: Partners require extensive upfront validation.\n- **Contract Fulfillment Suffers**: Delays are excused rather than addressed.\n- **Talent Attrition Rises**: Exceptional employees leave organizations governed by compromised ethics.\n\n## Re-Engineering Your Business Ethics\n1. **Your Word is Your Legal Bond**: If you promise delivery on Tuesday, move mountains to deliver on Tuesday.\n2. **Transparent Financial Hygiene**: Keep company accounts strictly segregated from personal desires.\n3. **Empathetic HR Relationships**: Treat your staff with the professional dignity they deserve.\n\nAt Right Minds Africa Hub, we train founders to build businesses that are not only profitable but **eternal in integrity**.\n\n*Execute with standards day in, day out.*`,
    summary: "Business ideas fail without character integrity. Explore how trust and emotional intelligence serve as the bedrock of entrepreneurial growth.",
    category: "Entrepreneurship",
    mediaType: "image",
    mediaUrls: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800"],
    postUrl: "https://www.facebook.com/RightMAHub/",
    hashtags: ["Entrepreneurship", "IntegrityFirst", "LeadershipCharacter", "RMAHub"],
    publishedAt: "2026-05-15T09:15:00.000Z",
    syncedAt: "2026-05-15T10:00:00.000Z",
    status: "purgatory",
    likesCount: 95,
    commentsCount: 12,
    engagementScore: 3.5
  }
];

// Initialize Social Posts seeds in localStorage if not exists
if (typeof window !== "undefined") {
  const existing = localStorage.getItem("rma_social_posts");
  if (!existing) {
    localStorage.setItem("rma_social_posts", JSON.stringify(SEED_SOCIAL_POSTS));
  }
  const existingConfig = localStorage.getItem("rma_social_feed_config");
  if (!existingConfig) {
    localStorage.setItem("rma_social_feed_config", JSON.stringify({
      autoPublish: false,
      facebookPageId: "94883103",
      instagramBusinessId: "rightminds_biz_4920",
      facebookTokenStatus: "connected",
      instagramTokenStatus: "connected",
      facebookPageName: "Right Minds Africa Hub",
      instagramUsername: "rightmindsafrica",
      lastSyncedAt: "2026-05-20T11:00:00.000Z"
    }));
  }
  if (!localStorage.getItem("rma_website_popups")) {
    localStorage.setItem("rma_website_popups", JSON.stringify([
      {
        id: "pop-teen-bootcamp-2026",
        title: "Right-Minds Teen Leadership Bootcamp 2026",
        description: "Empower your teenager with the leadership, confidence, communication, digital, and future-ready skills needed to excel in today's world. This 6-day transformational bootcamp is designed for teenagers aged 13–19 who are ready to discover their purpose and become impactful leaders. Fee: ₦50,000. Limited slots available. Register today!",
        bannerImage: "teen_bootcamp_2026_flyer.png",
        eventDate: "17th–22nd August 2026 (Monday–Saturday) • Kano, Nigeria",
        buttonText: "Register Today (₦50,000)",
        buttonLink: "#/join?profile=student",
        startDate: "2026-07-01T00:00:00.000Z",
        endDate: "2026-08-25T23:59:59.000Z",
        priority: "High",
        active: true,
        displayRule: "every_visit",
        secondaryButtonText: "Teens Hub",
        secondaryButtonLink: "initiatives-yap",
        updatedAt: new Date().toISOString()
      },
      {
        id: "pop-reinvention-blueprint",
        title: "Reinvention Blueprint",
        description: "Feeling stuck, confused, inconsistent, or unsure about your next steps? Join our intensive 5-week personal transformation program designed to build extreme clarity, self-leadership, productiveness, and solid alignment with purpose under direct mentorship of Gracious-Esther (Soundmind Doctor). Fee: ₦15,000. Stop surviving. Start becoming.",
        bannerImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
        eventDate: "July 5th, 2026",
        buttonText: "Register Now",
        buttonLink: "https://wa.link/fu76fd",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: "2026-08-30T23:59:59.000Z",
        priority: "Medium",
        active: true,
        displayRule: "once_per_visitor",
        secondaryButtonText: "Monthly Reinvention Program",
        secondaryButtonLink: "programs-reinvention"
      }
    ]));
  } else {
    try {
      const saved = localStorage.getItem("rma_website_popups");
      if (saved) {
        let list = JSON.parse(saved) as any[];
        // Ensure teen bootcamp popup exists and is updated
        const teenIdx = list.findIndex(p => p.id === "pop-teen-bootcamp-2026");
        const teenPopupObj = {
          id: "pop-teen-bootcamp-2026",
          title: "Right-Minds Teen Leadership Bootcamp 2026",
          description: "Empower your teenager with the leadership, confidence, communication, digital, and future-ready skills needed to excel in today's world. This 6-day transformational bootcamp is designed for teenagers aged 13–19 who are ready to discover their purpose and become impactful leaders. Fee: ₦50,000. Limited slots available. Register today!",
          bannerImage: "teen_bootcamp_2026_flyer.png",
          eventDate: "17th–22nd August 2026 (Monday–Saturday) • Kano, Nigeria",
          buttonText: "Register Today (₦50,000)",
          buttonLink: "#/join?profile=student",
          startDate: "2026-07-01T00:00:00.000Z",
          endDate: "2026-08-25T23:59:59.000Z",
          priority: "High",
          active: true,
          displayRule: "every_visit",
          secondaryButtonText: "Teens Hub",
          secondaryButtonLink: "initiatives-yap",
          updatedAt: new Date().toISOString()
        };
        if (teenIdx === -1) {
          list.unshift(teenPopupObj);
        } else {
          list[teenIdx] = { ...list[teenIdx], ...teenPopupObj };
        }
        localStorage.setItem("rma_website_popups", JSON.stringify(list));
      }
    } catch (e) {}
  }
  if (!localStorage.getItem("rma_historical_records")) {
    localStorage.setItem("rma_historical_records", JSON.stringify([
      {
        id: "hist-seed-1",
        title: "Inaugural Corper Impact Initiative Class",
        category: "cohort",
        timelineDate: "March 2022",
        year: 2022,
        description: "Launched the first official batch of the Corper Impact Initiative (CII) in Enugu State. Designed for active NYSC corps members, Cohort 1 combined virtual counseling clinics, custom CV overhauls, and financial leadership benchmarks.",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
        impactMetrics: "45 Graduates Trained, 12 Immediate Career Placements",
        galleryImages: [
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800"
        ],
        tags: ["NYSC", "Enugu State", "Graduate Placement", "Career Clinic"],
        createdAt: "2022-03-15T12:00:00.000Z"
      },
      {
        id: "hist-seed-2",
        title: "The Lagos Youth Empowerment & Purpose (YAP) Conference",
        category: "conference",
        timelineDate: "November 2023",
        year: 2023,
        description: "Our signature regional convention convened thousands of students and emerging professionals. Addressed by public figures and productivity experts, sessions targeted mental stamina and high-integrity corporate representation.",
        imageUrl: "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
        impactMetrics: "1,200+ Physical Registrations, 4 Panel Boards",
        galleryImages: [
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800"
        ],
        tags: ["Lagos", "YAP", "Youth Summit", "Workshops"],
        createdAt: "2023-11-20T10:00:00.000Z"
      },
      {
        id: "hist-seed-3",
        title: "The Launch of Right-Minded Teens Hubs",
        category: "program",
        timelineDate: "January 2021",
        year: 2021,
        description: "Extended our mindset reformation framework to secondary school classrooms in Oyo State. Introduced teens leadership circles, habit planners distribution, and cognitive coaching clinics to dismantle self-limiting attitudes.",
        imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&q=80",
        impactMetrics: "15 Public Schools Equipped, 200+ Mentorship Circles",
        galleryImages: [
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&q=80"
        ],
        tags: ["Oyo State", "Secondary School Outreaches", "Teens Development", "Mindset Shift"],
        createdAt: "2021-01-10T12:00:00.000Z"
      },
      {
        id: "hist-seed-4",
        title: "First National Summer Leadership Bootcamp for Teenagers",
        category: "training",
        timelineDate: "August 2024",
        year: 2024,
        description: "A high-intensity, physical summer academy focused on early career path mapping, digital skills orientation, and moral integrity paradigms. It introduced teenagers to structured personal goal-mapping.",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
        impactMetrics: "85 Teen Fellows Certified, 100% Core Completion",
        galleryImages: [
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
        ],
        tags: ["Teens", "Summer Camp", "Capacity Development", "Bootcamp"],
        createdAt: "2024-08-25T11:00:00.000Z"
      }
    ]));
  }
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  let list: SocialPost[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_social_posts");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "social_posts"));
    const fbList: SocialPost[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as SocialPost);
    });

    if (fbList.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_social_posts", JSON.stringify(fbList));
      }
      return fbList;
    }
  } catch (err) {
    console.warn("Could not retrieve social posts from Firestore, using local data:", err);
  }

  return list;
}

export async function saveSocialPost(post: SocialPost): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_social_posts");
      let list: SocialPost[] = saved ? JSON.parse(saved) : [];
      list = list.filter(p => p.id !== post.id);
      list.push(post);
      localStorage.setItem("rma_social_posts", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_social_posts_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "social_posts", post.id), post);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("rma_social_posts_updated"));
    }
  } catch (err) {}
}

export async function deleteSocialPost(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_social_posts");
      if (saved) {
        let list: SocialPost[] = JSON.parse(saved);
        list = list.filter(p => p.id !== id);
        localStorage.setItem("rma_social_posts", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_social_posts_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "social_posts", id));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("rma_social_posts_updated"));
    }
  } catch (err) {}
}

export async function getSocialFeedConfig(): Promise<SocialFeedConfig> {
  let config: SocialFeedConfig = { autoPublish: false };
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_social_feed_config");
      if (saved) {
        config = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docSnap = await getDoc(doc(db, "social_feed_configs", "default"));
    if (docSnap.exists()) {
      const fbConfig = docSnap.data() as SocialFeedConfig;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_social_feed_config", JSON.stringify(fbConfig));
      }
      return fbConfig;
    }
  } catch (err) {
    console.warn("Could not retrieve social feed config from Firestore, using local data:", err);
  }

  return config;
}

export async function saveSocialFeedConfig(config: SocialFeedConfig): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rma_social_feed_config", JSON.stringify(config));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "social_feed_configs", "default"), config);
  } catch (err) {}
}

// --------------------------------------------------
// SEED MATRICES FOR POPUPS & HISTORICAL TIMELINES
// --------------------------------------------------
export const SEED_WEBSITE_POPUPS: WebsitePopup[] = [
  {
    id: "pop-seed-1",
    title: "YAP Annual Summit 2026",
    description: "Secure your VIP seat for Africa's prime Gathering of Minds. Gain access to mentorship boards, executive business masterclasses, and global leadership referrals.",
    bannerImage: "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
    eventDate: "2026-11-14T09:00:00.000Z",
    buttonText: "Register Now",
    buttonLink: "#/join?profile=student",
    startDate: "2026-06-01T00:00:00.000Z",
    endDate: "2026-11-14T23:59:59.000Z",
    priority: "High",
    active: true,
    displayRule: "once_per_visitor"
  },
  {
    id: "pop-seed-2",
    title: "Corper Impact Initiative Cohort 5",
    description: "Are you deploying in the upcoming Batch? Join the elite cohort workspace mapping and avoid post-graduation career struggles. Placements are limited.",
    bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
    buttonText: "Apply Online",
    buttonLink: "#/join?profile=corps_member",
    startDate: "2026-06-01T00:00:00.000Z",
    endDate: "2026-08-30T23:59:59.000Z",
    priority: "Medium",
    active: true,
    displayRule: "daily"
  }
];

export const SEED_HISTORICAL_RECORDS: HistoricalRecord[] = [
  {
    id: "hist-seed-1",
    title: "Inaugural Corper Impact Initiative Class",
    category: "cohort",
    timelineDate: "March 2022",
    year: 2022,
    description: "Launched the first official batch of the Corper Impact Initiative (CII) in Enugu State. Designed for active NYSC corps members, Cohort 1 combined virtual counseling clinics, custom CV overhauls, and financial leadership benchmarks.",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
    impactMetrics: "45 Graduates Trained, 12 Immediate Career Placements",
    galleryImages: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800"
    ],
    tags: ["NYSC", "Enugu State", "Graduate Placement", "Career Clinic"],
    createdAt: "2022-03-15T12:00:00.000Z"
  },
  {
    id: "hist-seed-2",
    title: "The Lagos Youth Empowerment & Purpose (YAP) Conference",
    category: "conference",
    timelineDate: "November 2023",
    year: 2023,
    description: "Our signature regional convention convened thousands of students and emerging professionals. Addressed by public figures and productivity experts, sessions targeted mental stamina and high-integrity corporate representation.",
    imageUrl: "https://images.unsplash.com/photo-1544531516-a5e340a6b17a?q=80&w=800",
    impactMetrics: "1,200+ Physical Registrations, 4 Panel Boards",
    galleryImages: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800"
    ],
    tags: ["Lagos", "YAP", "Youth Summit", "Workshops"],
    createdAt: "2023-11-20T10:00:00.000Z"
  },
  {
    id: "hist-seed-3",
    title: "The Launch of Right-Minded Teens Hubs",
    category: "program",
    timelineDate: "January 2021",
    year: 2021,
    description: "Extended our mindset reformation framework to secondary school classrooms in Oyo State. Introduced teens leadership circles, habit planners distribution, and cognitive coaching clinics to dismantle self-limiting attitudes.",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&q=80",
    impactMetrics: "15 Public Schools Equipped, 200+ Mentorship Circles",
    galleryImages: [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&q=80"
    ],
    tags: ["Oyo State", "Secondary School Outreaches", "Teens Development", "Mindset Shift"],
    createdAt: "2021-01-10T12:00:00.000Z"
  },
  {
    id: "hist-seed-4",
    title: "First National Summer Leadership Bootcamp for Teenagers",
    category: "training",
    timelineDate: "August 2024",
    year: 2024,
    description: "A high-intensity, physical summer academy focused on early career path mapping, digital skills orientation, and moral integrity paradigms. It introduced teenagers to structured personal goal-mapping.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
    impactMetrics: "85 Teen Fellows Certified, 100% Core Completion",
    galleryImages: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
    ],
    tags: ["Teens", "Summer Camp", "Capacity Development", "Bootcamp"],
    createdAt: "2024-08-25T11:00:00.000Z"
  }
];

// --------------------------------------------------
// WEBSITE POPUP SYSTEMS APIs
// --------------------------------------------------
export const YAP_CONFERENCE_POPUP: WebsitePopup = {
  id: "pop-yap-conference-2026",
  title: "Young and Purposeful (YAP) Conference 2026",
  description: "Nigeria's flagship annual leadership, mindset, and career breakthrough summit for ambitious youth, undergraduates, graduates, and rising leaders. Connect with seasoned industry mentors, unlock high-value skills, and align with your divine purpose.",
  bannerImage: "yap_conference_2026_flyer.png",
  eventDate: "November 2026 (Annual Summit) • Physical & Global Live Stream",
  buttonText: "Explore Summit Details",
  buttonLink: "initiatives-yap",
  startDate: "2026-07-01T00:00:00.000Z",
  endDate: "2026-11-30T23:59:59.000Z",
  priority: "High",
  active: false,
  displayRule: "every_visit",
  secondaryButtonText: "View Event Schedule",
  secondaryButtonLink: "initiatives-yap",
  updatedAt: new Date().toISOString()
};

export const TEEN_BOOTCAMP_POPUP: WebsitePopup = {
  id: "pop-teen-bootcamp-2026",
  title: "Right-Minds Teen Leadership Bootcamp 2026",
  description: "Empower your teenager with the leadership, confidence, communication, digital, and future-ready skills needed to excel in today's world. This 6-day transformational bootcamp is designed for teenagers aged 13–19 who are ready to discover their purpose and become impactful leaders.",
  bannerImage: "teen_bootcamp_2026_flyer.png",
  eventDate: "17th–22nd August 2026 (Monday–Saturday) • Kano, Nigeria",
  buttonText: "Register Today (₦50,000)",
  buttonLink: "teen-bootcamp",
  startDate: "2026-07-01T00:00:00.000Z",
  endDate: "2026-08-25T23:59:59.000Z",
  priority: "Medium",
  active: false,
  displayRule: "every_visit",
  secondaryButtonText: "Teens Hub",
  secondaryButtonLink: "teen-bootcamp",
  updatedAt: new Date().toISOString()
};

export async function getWebsitePopups(): Promise<WebsitePopup[]> {
  let list: WebsitePopup[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_website_popups");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const ensureDefaultPopups = (popups: WebsitePopup[]): WebsitePopup[] => {
    // Remove teen bootcamp popup from active rotation
    let result = popups.filter(p => p.id !== "pop-teen-bootcamp-2026");
    
    // Ensure YAP Conference 2026 Popup is present in database for manual admin toggling but default to false
    const yapIdx = result.findIndex(p => p.id === "pop-yap-conference-2026");
    if (yapIdx === -1) {
      result.unshift(YAP_CONFERENCE_POPUP);
    } else {
      result[yapIdx] = {
        ...YAP_CONFERENCE_POPUP,
        ...result[yapIdx],
        bannerImage: result[yapIdx].bannerImage || "yap_conference_2026_flyer.png",
        active: result[yapIdx].active !== undefined ? result[yapIdx].active : false
      };
    }

    return result;
  };

  list = ensureDefaultPopups(list);

  const fetchFs = async (): Promise<WebsitePopup[]> => {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "website_popups"));
    const fbList: WebsitePopup[] = [];
    querySnapshot.forEach((docSnap) => {
      fbList.push({ id: docSnap.id, ...docSnap.data() } as WebsitePopup);
    });

    if (fbList.length > 0) {
      const mergedList = ensureDefaultPopups(fbList);
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_website_popups", JSON.stringify(mergedList));
      }
      return mergedList;
    }
    return list;
  };

  const fsTimeout = new Promise<WebsitePopup[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve website popups from Firestore, using local data:", err);
    return list;
  }
}

export async function saveWebsitePopup(popup: WebsitePopup): Promise<void> {
  console.log(`💾 [SYNC WRITE START] Saving popup ${popup.id} ("${popup.title}")...`);
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_website_popups");
      let list: WebsitePopup[] = saved ? JSON.parse(saved) : [];
      list = list.filter(p => p.id !== popup.id);
      list.push(popup);
      localStorage.setItem("rma_website_popups", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_popups_updated"));
      window.dispatchEvent(new Event("rma_website_popups_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "website_popups", popup.id), popup);
    console.log(`✅ [SYNC WRITE SUCCESS] Website popup ${popup.id} persisted to Firestore.`);
  } catch (err) {
    console.error(`❌ [SYNC WRITE ERROR] Failed to save website popup ${popup.id} to Firestore:`, err);
  }
}

export async function deleteWebsitePopup(id: string): Promise<void> {
  console.log(`🗑️ [SYNC DELETE START] Deleting popup ${id}...`);
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_website_popups");
      if (saved) {
        let list: WebsitePopup[] = JSON.parse(saved);
        list = list.filter(p => p.id !== id);
        localStorage.setItem("rma_website_popups", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_popups_updated"));
        window.dispatchEvent(new Event("rma_website_popups_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "website_popups", id));
    console.log(`✅ [SYNC DELETE SUCCESS] Website popup ${id} deleted from Firestore.`);
  } catch (err) {
    console.error(`❌ [SYNC DELETE ERROR] Failed to delete website popup ${id} from Firestore:`, err);
  }
}

export async function trackPopupEvent(popupId: string, eventType: "view" | "click" | "close"): Promise<void> {
  if (!popupId) return;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_website_popups");
      if (saved) {
        let list: WebsitePopup[] = JSON.parse(saved);
        const idx = list.findIndex((p) => p.id === popupId);
        if (idx !== -1) {
          if (eventType === "view") {
            list[idx].viewsCount = (list[idx].viewsCount || 0) + 1;
          } else if (eventType === "click") {
            list[idx].clicksCount = (list[idx].clicksCount || 0) + 1;
          } else if (eventType === "close") {
            list[idx].dismissesCount = (list[idx].dismissesCount || 0) + 1;
          }
          localStorage.setItem("rma_website_popups", JSON.stringify(list));
        }
      }
    } catch (e) {}
  }

  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const fieldMap = {
      view: "viewsCount",
      click: "clicksCount",
      close: "dismissesCount"
    };
    const field = fieldMap[eventType];
    if (field) {
      await updateDoc(doc(db, "website_popups", popupId), {
        [field]: increment(1)
      });
    }
  } catch (err) {}
}

// --------------------------------------------------
// HISTORICAL JOURNEY RECORDS APIs
// --------------------------------------------------
export async function getHistoricalRecords(): Promise<HistoricalRecord[]> {
  let list: HistoricalRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_historical_records");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const fetchFs = async (): Promise<HistoricalRecord[]> => {
    console.log("🔍 [SYNC READ] Fetching historical records from Firestore...");
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "historical_records"), orderBy("year", "desc"));
    const querySnapshot = await getDocs(q);
    const fbList: HistoricalRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      fbList.push({ id: docSnap.id, ...docSnap.data() } as HistoricalRecord);
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("rma_historical_records", JSON.stringify(fbList));
    }
    return fbList;
  };

  const fsTimeout = new Promise<HistoricalRecord[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve historical records from Firestore, using local data:", err);
    return list;
  }
}

export async function saveHistoricalRecord(record: HistoricalRecord): Promise<void> {
  console.log(`💾 [SYNC WRITE START] Saving historical record ${record.id}...`);
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_historical_records");
      let list: HistoricalRecord[] = saved ? JSON.parse(saved) : [];
      list = list.filter(r => r.id !== record.id);
      list.push(record);
      localStorage.setItem("rma_historical_records", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_history_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "historical_records", record.id), record);
    console.log(`✅ [SYNC WRITE SUCCESS] Historical record ${record.id} persisted to Firestore.`);
  } catch (err) {
    console.error(`❌ [SYNC WRITE ERROR] Failed saving historical record ${record.id} to Firestore:`, err);
  }
}

export async function deleteHistoricalRecord(id: string): Promise<void> {
  console.log(`🗑️ [SYNC DELETE START] Deleting historical record ${id}...`);
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_historical_records");
      if (saved) {
        let list: HistoricalRecord[] = JSON.parse(saved);
        list = list.filter(r => r.id !== id);
        localStorage.setItem("rma_historical_records", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_history_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "historical_records", id));
    console.log(`✅ [SYNC DELETE SUCCESS] Historical record ${id} deleted from Firestore.`);
  } catch (err) {
    console.error(`❌ [SYNC DELETE ERROR] Failed deleting historical record ${id} from Firestore:`, err);
  }
}

// --------------------------------------------------
// REALTIME SYNC TUNNELS & DYNAMIC LAYOUT PERSISTENCE
// --------------------------------------------------

let realtimeSubscribed = false;

export async function subscribeToRealtimeUpdates(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isFirestoreDisabled()) return;
  if (realtimeSubscribed) return;

  try {
    const { doc, collection, onSnapshot } = await import("firebase/firestore");
    const db = await getFirestoreDb();

    const handleSnapshotErr = (err: any, label: string) => {
      const errText = err instanceof Error ? err.message : String(err);
      if (
        errText.includes("Disconnecting idle stream") ||
        errText.includes("CANCELLED") ||
        errText.includes("Timed out waiting for new targets") ||
        errText.includes("Listen' stream")
      ) {
        // Benign transport lifecycle event
        return;
      }
      console.info(`[Realtime Sync] ${label} notice:`, errText);
    };
    
    // 1. Marquee Ticker Messages
    onSnapshot(doc(db, "settings", "marquee"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📡 [REALTIME SYNC] Marquee settings received from Firestore.");
        localStorage.setItem("rma_marquee_config", JSON.stringify(data));
        window.dispatchEvent(new Event("rma_marquee_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Marquee"));

    // 2. Payment Hub Settings
    onSnapshot(doc(db, "settings", "payment_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📡 [REALTIME SYNC] Payment Hub settings received from Firestore.");
        localStorage.setItem("rma_payment_hub_settings", JSON.stringify(data));
        window.dispatchEvent(new Event("rma_payment_hub_settings_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Payment hub"));

    // 3. CMS Configurations
    onSnapshot(doc(db, "settings", "cms_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📡 [REALTIME SYNC] CMS config received from Firestore.");
        localStorage.setItem("rma_cms_config", JSON.stringify(data));
        window.dispatchEvent(new Event("rma_cms_updated"));
      }
    }, (err) => handleSnapshotErr(err, "CMS"));

    // 4. Events Settings
    onSnapshot(doc(db, "settings", "events_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const list = Array.isArray(data?.list) ? data.list : [];
        console.log(`📡 [REALTIME SYNC] Events received ${list.length} items from Firestore.`);
        localStorage.setItem("rma_events", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_events_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Events"));

    // 5. Resources Settings
    onSnapshot(doc(db, "settings", "resources_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const list = Array.isArray(data?.list) ? data.list : [];
        console.log(`📡 [REALTIME SYNC] Resources received ${list.length} items from Firestore.`);
        localStorage.setItem("rma_resources", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_resources_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Resources"));

    // 6. Gallery Settings
    onSnapshot(doc(db, "settings", "gallery_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const list = Array.isArray(data?.list) ? data.list : [];
        console.log(`📡 [REALTIME SYNC] Gallery received ${list.length} items from Firestore.`);
        localStorage.setItem("rma_custom_gallery_items", JSON.stringify(list));
        localStorage.setItem("rma_gallery_persistent_album", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_gallery_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Gallery"));

    // 7. Website Popups
    onSnapshot(collection(db, "website_popups"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      console.log(`📡 [REALTIME SYNC] Website Popups received ${fbList.length} items from Firestore.`);
      localStorage.setItem("rma_website_popups", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_website_popups_updated"));
      window.dispatchEvent(new Event("rma_popups_updated"));
    }, (err) => handleSnapshotErr(err, "Website Popups"));

    // 8. Courses (merge remote snapshot with local custom courses & deletedIds so newly added courses are never overwritten)
    onSnapshot(collection(db, "courses"), (querySnap) => {
      const deletedIds = new Set(getDeletedCourseIdsLocal());
      const fbList: LMSCourse[] = [];
      querySnap.forEach((docSnap) => {
        if (!deletedIds.has(docSnap.id)) {
          fbList.push({ id: docSnap.id, ...docSnap.data() } as LMSCourse);
        }
      });
      if (fbList.length > 0) {
        let currentLocal: LMSCourse[] = [];
        try {
          const raw = localStorage.getItem("rma_lms_courses");
          if (raw) currentLocal = JSON.parse(raw);
        } catch {}
        const merged = mergeCoursesLists(
          [DEFAULT_LMS_COURSES, currentLocal, fbList, getCustomSavedCoursesLocal()],
          deletedIds
        );
        localStorage.setItem("rma_lms_courses", JSON.stringify(merged));
        window.dispatchEvent(new Event("rma_courses_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Courses"));

    onSnapshot(doc(db, "settings", "courses_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const deletedIds = new Set<string>([
          ...getDeletedCourseIdsLocal(),
          ...(Array.isArray(data?.deletedIds) ? data.deletedIds : [])
        ]);
        saveDeletedCourseIdsLocal(Array.from(deletedIds));
        const settingsList: LMSCourse[] = Array.isArray(data?.list) ? data.list : [];
        let currentLocal: LMSCourse[] = [];
        try {
          const raw = localStorage.getItem("rma_lms_courses");
          if (raw) currentLocal = JSON.parse(raw);
        } catch {}
        const merged = mergeCoursesLists(
          [DEFAULT_LMS_COURSES, currentLocal, settingsList, getCustomSavedCoursesLocal()],
          deletedIds
        );
        localStorage.setItem("rma_lms_courses", JSON.stringify(merged));
        window.dispatchEvent(new Event("rma_courses_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Courses Settings"));

    // 9. FAQs
    onSnapshot(collection(db, "faqs"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      console.log(`📡 [REALTIME SYNC] FAQs received ${fbList.length} items from Firestore.`);
      localStorage.setItem("rma_faqs", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_faqs_updated"));
      window.dispatchEvent(new Event("rma_cms_updated"));
    }, (err) => handleSnapshotErr(err, "FAQs"));

    // 10. News Releases
    onSnapshot(collection(db, "news_releases"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      console.log(`📡 [REALTIME SYNC] News Releases received ${fbList.length} items from Firestore.`);
      localStorage.setItem("rma_news_releases", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_news_updated"));
    }, (err) => handleSnapshotErr(err, "News Releases"));

    // 11. Social Posts / Blog
    onSnapshot(collection(db, "social_posts"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      console.log(`📡 [REALTIME SYNC] Social Posts received ${fbList.length} items from Firestore.`);
      localStorage.setItem("rma_social_posts", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_social_posts_updated"));
    }, (err) => handleSnapshotErr(err, "Social Posts"));

    // 12. Teen Bootcamp Config
    onSnapshot(doc(db, "settings", "teen_bootcamp_config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📡 [REALTIME SYNC] Teen Bootcamp Config received from Firestore.");
        localStorage.setItem("rma_teen_bootcamp_config", JSON.stringify(data));
        window.dispatchEvent(new Event("rma_teen_bootcamp_updated"));
      }
    }, (err) => handleSnapshotErr(err, "Teen Bootcamp Config"));

    // 13. Team Members Collection Subscription (Public content only)
    onSnapshot(collection(db, "team_members"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      fbList.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem("rma_team_members", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_team_members_updated"));
    }, (err) => handleSnapshotErr(err, "Team Members"));

    // 14. Testimonials Collection Subscription (Public content only)
    onSnapshot(collection(db, "testimonials"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      fbList.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem("rma_testimonials_list", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_testimonials_updated"));
    }, (err) => handleSnapshotErr(err, "Testimonials"));

    // 15. Partners Collection Subscription (Public content only)
    onSnapshot(collection(db, "partners"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      fbList.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem("rma_partners_list", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_partners_updated"));
    }, (err) => handleSnapshotErr(err, "Partners"));

    // 16. Historical Records Collection Subscription (Public content only)
    onSnapshot(collection(db, "historical_records"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      fbList.sort((a, b) => (a.year || 0) - (b.year || 0));
      localStorage.setItem("rma_historical_records", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_history_updated"));
    }, (err) => handleSnapshotErr(err, "Historical Records"));

    // 17. Course Certificates Collection Subscription (Public certificate verification)
    onSnapshot(collection(db, "course_certificates"), (querySnap) => {
      const fbList: any[] = [];
      querySnap.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() });
      });
      localStorage.setItem("rma_course_certificates", JSON.stringify(fbList));
      window.dispatchEvent(new Event("rma_course_certificates_updated"));
    }, (err) => handleSnapshotErr(err, "Course Certificates"));

    realtimeSubscribed = true;
    console.log("🔥 Successfully authorized & subscribed to central real-time Firestore synchronization tunnels.");
  } catch (err) {
    console.warn("Real-time subscription channel could not be activated:", err);
  }
}

// 9. Events APIs
export async function getEvents(): Promise<any[]> {
  let list: any[] = [];
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rma_events");
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }
  }

  const fetchFs = async (): Promise<any[]> => {
    console.log("🔍 [SYNC READ] Fetching events from Firestore settings/events_settings...");
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docSnap = await getDoc(doc(db, "settings", "events_settings"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fsList = Array.isArray(data?.list) ? data.list : [];
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_events", JSON.stringify(fsList));
      }
      return fsList;
    }
    return list;
  };

  const fsTimeout = new Promise<any[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve events from Firestore, using local data:", err);
    return list;
  }
}

export async function saveEvents(list: any[]): Promise<void> {
  console.log(`💾 [SYNC WRITE START] Saving ${list.length} events to Firestore...`);
  if (typeof window !== "undefined") {
    localStorage.setItem("rma_events", JSON.stringify(list));
    window.dispatchEvent(new Event("rma_events_updated"));
  }
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "settings", "events_settings"), { list });
    console.log(`✅ [SYNC WRITE SUCCESS] ${list.length} events saved to Firestore settings/events_settings.`);
  } catch (err) {
    console.error("❌ [SYNC WRITE ERROR] Error saving events to Firestore:", err);
  }
}

// 10. Resources APIs
export async function getResources(): Promise<any[]> {
  let list: any[] = [];
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rma_resources");
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }
  }

  const fetchFs = async (): Promise<any[]> => {
    console.log("🔍 [SYNC READ] Fetching resources from Firestore settings/resources_settings...");
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docSnap = await getDoc(doc(db, "settings", "resources_settings"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fsList = Array.isArray(data?.list) ? data.list : [];
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_resources", JSON.stringify(fsList));
      }
      return fsList;
    }
    return list;
  };

  const fsTimeout = new Promise<any[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve resources from Firestore, using local data:", err);
    return list;
  }
}

export async function saveResources(list: any[]): Promise<void> {
  console.log(`💾 [SYNC WRITE START] Saving ${list.length} resources to Firestore...`);
  if (typeof window !== "undefined") {
    localStorage.setItem("rma_resources", JSON.stringify(list));
    window.dispatchEvent(new Event("rma_resources_updated"));
  }
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "settings", "resources_settings"), { list });
    console.log(`✅ [SYNC WRITE SUCCESS] ${list.length} resources saved to Firestore settings/resources_settings.`);
  } catch (err) {
    console.error("❌ [SYNC WRITE ERROR] Error saving resources to Firestore:", err);
  }
}

// 11. Gallery APIs
export async function getGallery(): Promise<any[]> {
  let list: any[] = [];
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rma_custom_gallery_items");
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }
  }

  const fetchFs = async (): Promise<any[]> => {
    console.log("🔍 [SYNC READ] Fetching gallery from Firestore settings/gallery_settings...");
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docSnap = await getDoc(doc(db, "settings", "gallery_settings"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fsList = Array.isArray(data?.list) ? data.list : [];
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_custom_gallery_items", JSON.stringify(fsList));
        localStorage.setItem("rma_gallery_persistent_album", JSON.stringify(fsList));
      }
      return fsList;
    }
    return list;
  };

  const fsTimeout = new Promise<any[]>((resolve) =>
    setTimeout(() => resolve(list), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve gallery items from Firestore, using local data:", err);
    return list;
  }
}

export async function saveGallery(list: any[]): Promise<void> {
  console.log(`💾 [SYNC WRITE START] Saving ${list.length} gallery items to Firestore...`);
  if (typeof window !== "undefined") {
    localStorage.setItem("rma_custom_gallery_items", JSON.stringify(list));
    localStorage.setItem("rma_gallery_persistent_album", JSON.stringify(list));
    window.dispatchEvent(new Event("rma_gallery_updated"));
  }
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "settings", "gallery_settings"), { list });
    console.log(`✅ [SYNC WRITE SUCCESS] ${list.length} gallery items saved to Firestore settings/gallery_settings.`);
  } catch (err) {
    console.error("❌ [SYNC WRITE ERROR] Error saving gallery to Firestore:", err);
  }
}

// 12. CMSConfig APIs
export async function getCMSConfigAsync(): Promise<any> {
  let cached: any = null;
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rma_cms_config");
    if (saved) {
      try {
        cached = JSON.parse(saved);
      } catch (e) {}
    }
  }

  const fetchFs = async (): Promise<any> => {
    console.log("🔍 [SYNC READ] Fetching CMS config from Firestore settings/cms_settings...");
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docSnap = await getDoc(doc(db, "settings", "cms_settings"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_cms_config", JSON.stringify(data));
      }
      return data;
    }
    return cached;
  };

  const fsTimeout = new Promise<any>((resolve) =>
    setTimeout(() => resolve(cached), 2500)
  );

  try {
    return await Promise.race([fetchFs(), fsTimeout]);
  } catch (err) {
    console.warn("Could not retrieve CMS config from Firestore, using cached data:", err);
    return cached;
  }
}

export async function saveCMSConfig(config: any): Promise<void> {
  console.log("💾 [SYNC WRITE START] Saving CMS config to Firestore settings/cms_settings...");
  if (typeof window !== "undefined") {
    localStorage.setItem("rma_cms_config", JSON.stringify(config));
    window.dispatchEvent(new Event("rma_cms_updated"));
  }
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "settings", "cms_settings"), config);
    console.log("✅ [SYNC WRITE SUCCESS] CMS config saved to Firestore settings/cms_settings.");
  } catch (err) {
    console.error("❌ [SYNC WRITE ERROR] Error saving CMS config to Firestore:", err);
  }
}

// --------------------------------------------------
// 13. System Email & Notification Management APIs
// --------------------------------------------------

export interface EmailSettings {
  id: string;
  senderName: string;
  senderEmail?: string;
  replyTo: string;
  notificationEmail: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpHost?: string;
  smtpPort?: number;
  resendApiKey?: string;
  templates: {
    ciiWelcomeSubject: string;
    ciiWelcomeBody: string;
    rmaWelcomeSubject: string;
    rmaWelcomeBody: string;
    adminNotificationSubject: string;
    adminNotificationBody: string;
    paymentSubmittedSubject: string;
    paymentSubmittedBody: string;
    paymentApprovedSubject: string;
    paymentApprovedBody: string;
    paymentRejectedSubject: string;
    paymentRejectedBody: string;
    courseEnrollmentSubject: string;
    courseEnrollmentBody: string;
    volunteerWelcomeSubject?: string;
    volunteerWelcomeBody?: string;
  };
  ciiCounter?: number;
  rmaCounter?: number;
  updatedAt?: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: "success" | "failed";
  sentTime: string;
  deliveryResult: string;
  registrationId?: string;
  programType?: string;
  body?: string;
  sandboxRedirectTo?: string | null;
}

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  id: "email_settings",
  senderName: "Right Minds Africa",
  senderEmail: "",
  replyTo: "info@rightmindsafrica.org",
  notificationEmail: "olosundelouis@gmail.com",
  smtpUser: "rightmindsafrica@gmail.com",
  smtpPass: "",
  smtpHost: "smtp.gmail.com",
  smtpPort: 465,
  resendApiKey: "",
  templates: {
    ciiWelcomeSubject: "Registration Received – Corper Impact Initiative (CII)",
    ciiWelcomeBody: "Dear {{fullName}},\n\nThank you for registering for Corper Impact Initiative (CII).\n\nWe have successfully received your application.\n\nRegistration Details:\n* Full Name: {{fullName}}\n* Registration ID: {{referenceNumber}}\n* Program Name: {{programName}}\n* Submission Date: {{submissionDate}}\n\n🚀 JOIN YOUR COMMUNITY CHANNELS:\nWhile our team reviews your application, you are highly encouraged to join our active community channels to get started, receive instant helper notices, and network with fellow participants:\n* WhatsApp Waitlist Link: https://chat.whatsapp.com/DoI8xpE60FeKMi4sEtE3wI\n* Telegram Cohort Gateway: https://t.me/+_iA-Xr3CqEoyYzhk\n\nMain Portal Link: https://rightmindsafrica.org/\n\nWhat Happens Next?\n* Our team will review your registration.\n* You will receive updates via email.\n* Further instructions will be communicated when necessary.\n\nIf you have any questions, please contact us.\n\nRegards,\nRight Minds Africa & Corper Impact Initiative",
    rmaWelcomeSubject: "Registration Received – Right Minds Africa (RMA)",
    rmaWelcomeBody: "Dear {{fullName}},\n\nThank you for registering for Right Minds Africa.\n\nWe have successfully received your application.\n\nRegistration Details:\n* Full Name: {{fullName}}\n* Registration ID: {{referenceNumber}}\n* Program Name: {{programName}}\n* Submission Date: {{submissionDate}}\n\n🚀 JOIN THE OFFICIAL RMA COMMUNITY:\nWhile our team reviews your application, join our official WhatsApp group to access immediate mentorship resources, attend virtual hangouts, get announcements, and network with other young African minds:\n* Join RMA WhatsApp Community: https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC\n\nMain Portal Link: https://rightmindsafrica.org/\n\nWhat Happens Next?\n* Our team will review your registration.\n* You will receive updates via email.\n* Further instructions will be communicated when necessary.\n\nIf you have any questions, please contact us.\n\nRegards,\nRight Minds Africa & Corper Impact Initiative",
    adminNotificationSubject: "New Registration Received - {{fullName}}",
    adminNotificationBody: "A new registration has been submitted.\n\nCandidate Details:\n* Applicant Name: {{fullName}}\n* Email Address: {{email}}\n* Program: {{programName}}\n* Registration ID: {{referenceNumber}}\n* Submission Time: {{submissionDate}}\n\nYou can view or manage this application in the admin portal.",
    paymentSubmittedSubject: "Payment Verification Pending – {{programName}}",
    paymentSubmittedBody: "Dear {{fullName}},\n\nWe have received your payment submission for {{programName}}.\n\nOur administration team is currently auditing your deposit against your reference ({{paymentReference}}).\n\nDetails:\n* Registration ID: {{referenceNumber}}\n* Amount: {{amount}}\n* Timestamp: {{submissionDate}}\n\nYou will receive a confirmation email once verified.\n\nRegards,\nRight Minds Africa",
    paymentApprovedSubject: "Payment Verified & Placement Unlocked! – {{programName}}",
    paymentApprovedBody: "Dear {{fullName}},\n\nCongratulations! Your payment has been successfully verified for {{programName}}.\n\nYour placement has been unlocked. Welcome to the cohort!\n\nDetails:\n* Registration ID: {{referenceNumber}}\n* Payment Reference: {{paymentReference}}\n* Status: Active / Approved\n\nPlease join the community circle if you haven't already:\n* WhatsApp Group: https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC\n\nRegards,\nRight Minds Africa",
    paymentRejectedSubject: "Payment Review Action Required – {{programName}}",
    paymentRejectedBody: "Dear {{fullName}},\n\nWe were unable to verify your payment for {{programName}}.\n\nYour submission was flagged during audit.\n\nAudit Remarks:\n{{remarks}}\n\nDetails:\n* Registration ID: {{referenceNumber}}\n* Payment Reference: {{paymentReference}}\n\nPlease re-check your payment reference or re-upload your receipt screenshot in your portal.\n\nRegards,\nRight Minds Africa team",
    courseEnrollmentSubject: "Course Enrollment Confirmation - {{courseTitle}}",
    courseEnrollmentBody: "Dear {{studentName}},\n\nYou have been successfully enrolled in {{courseTitle}}!\n\nHere are your transaction details:\n* Course Name: {{courseTitle}}\n* Payment Reference: {{paymentReference}}\n* Student Email: {{studentEmail}}\n\nYou can start learning immediately using the links below:\n* Link to Learning Portal: {{learningPortalLink}}\n* Link to Student Dashboard: {{dashboardLink}}\n\n🚀 JOIN THE OFFICIAL COMMUNITY:\n* WhatsApp Community Group: https://chat.whatsapp.com/FyF1K3OqB4mIDnrefGzMfC",
    volunteerWelcomeSubject: "Thank You for Applying – Right-Minds Africa Hub Internship & Volunteer Team",
    volunteerWelcomeBody: "Dear {{fullName}},\n\nThank you for your interest in joining the Right-Minds Africa Hub Internship & Volunteer Team! We deeply appreciate your willingness to contribute your skills toward shaping a generation across Africa.\n\nYour application has been successfully received and logged for review. Here is a summary of your submission:\n* Applicant Name: {{fullName}}\n* Application Reference ID: {{referenceNumber}}\n* Primary Role / Department: {{department}}\n* Location: {{stateCode}}\n* Submission Date: {{submissionDate}}\n* Direct WhatsApp Support & Community Link: {{whatsappLink}}\n\nJoin WhatsApp Community: {{whatsappLink}}\n\nWhatsApp Support Link: {{whatsappLink}}\n\nWhat Happens Next & Support for Queries:\n1. Click the green button or WhatsApp link above ({{whatsappLink}}) to join our official WhatsApp community immediately for onboarding updates, orientation schedules, and direct support for any queries.\n2. Our coordinating team will review your application details and introduction video.\n3. We will contact you via email and WhatsApp regarding the next steps in your onboarding process.\n\nWarm regards,\nRight-Minds Africa Hub & Corper Impact Initiative Team"
  },
  ciiCounter: 0,
  rmaCounter: 0,
  updatedAt: new Date().toISOString()
};

export async function getEmailSettings(): Promise<EmailSettings> {
  let config: EmailSettings = { ...DEFAULT_EMAIL_SETTINGS };

  if (typeof window !== "undefined") {
    const local = localStorage.getItem("rma_email_settings");
    if (local) {
      try {
        config = { ...config, ...JSON.parse(local) };
      } catch (e) {
        console.error("Local email settings parsing error:", e);
      }
    } else {
      localStorage.setItem("rma_email_settings", JSON.stringify(DEFAULT_EMAIL_SETTINGS));
    }
  }

  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    
    const docRef = doc(db, "settings", "email_settings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const remoteData = docSnap.data() as Partial<EmailSettings>;
      config = {
        ...DEFAULT_EMAIL_SETTINGS,
        ...remoteData,
        templates: {
          ...DEFAULT_EMAIL_SETTINGS.templates,
          ...(remoteData.templates || {})
        }
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_email_settings", JSON.stringify(config));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve email settings from Firestore, using local:", err);
  }

  return config;
}

export async function saveEmailSettings(config: EmailSettings): Promise<void> {
  const updated = {
    ...config,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rma_email_settings", JSON.stringify(updated));
      window.dispatchEvent(new Event("rma_email_settings_updated"));
    } catch (e) {}
  }

  // Direct write to Firestore immediately so backend /api/email/trigger reads new SMTP/Resend settings right away
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "settings", "email_settings"), updated, { merge: true });
  } catch (err) {
    console.warn("Direct Firestore email_settings write deferred, queuing:", err);
    queueWrite({
      type: "setWithMerge",
      collection: "settings",
      docId: "email_settings",
      data: updated
    }).catch(() => null);
  }
}

export async function getEmailLogs(): Promise<EmailLog[]> {
  let list: EmailLog[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_email_logs");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "email_logs"), orderBy("sentTime", "desc"));
    const querySnapshot = await getDocs(q);
    const fbList: EmailLog[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as EmailLog);
    });
    
    if (fbList.length > 0) {
      list = fbList;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_email_logs", JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve email logs from Firestore:", err);
  }

  return list;
}

export async function saveEmailLog(log: EmailLog): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_email_logs");
      let list: EmailLog[] = saved ? JSON.parse(saved) : [];
      list = list.filter(l => l.id !== log.id);
      list.unshift(log);
      localStorage.setItem("rma_email_logs", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_email_logs_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "email_logs", log.id), log);
  } catch (err) {
    console.error("Failed to commit email log to Firestore:", err);
  }
}

// --------------------------------------------------
// PLATFORM USERS APIS
// --------------------------------------------------
export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Mentor" | "Viewer" | "Student";
  status: "Active" | "Suspended" | "Deactivated";
  joinedAt: string;
  location: string;
  emailVerified?: boolean;
  verificationDate?: string | null;
  verificationSentAt?: string | null;
  verificationAttempts?: number;
  lastVerificationEmail?: string | null;
  lastLogin?: string | null;
  allowedTabs?: string[];
  canWrite?: boolean;
  passwordDigest?: string;
}

export async function getPlatformUsers(): Promise<PlatformUser[]> {
  const deletedOps = new Set(getDeletedAdminOperatorEmailsLocal());
  let list: PlatformUser[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_platform_users");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const isValidPlatformUser = (u: PlatformUser): boolean => {
    const emailKey = (u.email || "").toLowerCase().trim();
    if (!emailKey || deletedOps.has(emailKey)) return false;
    if (ANCHOR_SUPER_ADMIN_EMAILS.includes(emailKey)) return true;
    // Filter out legacy pre-seeded mock accounts that were never created with a password by the Super Admin
    if (LEGACY_PRE_SEEDED_MOCK_IDS.has(u.id) && !u.passwordDigest) return false;
    if ((u.role === "Admin" || u.role === "Viewer") && !u.passwordDigest) return false;
    return true;
  };

  list = list.filter(isValidPlatformUser);

  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const querySnapshot = await getDocs(collection(db, "users"));
    const fbList: PlatformUser[] = [];
    querySnapshot.forEach((docSnap) => {
      fbList.push({ id: docSnap.id, ...docSnap.data() } as PlatformUser);
    });

    if (fbList.length > 0) {
      const byEmail = new Map<string, PlatformUser>();
      for (const item of list) {
        const key = (item.email || item.id || "").toLowerCase();
        if (key && isValidPlatformUser(item)) byEmail.set(key, item);
      }
      for (const fbItem of fbList) {
        const key = (fbItem.email || fbItem.id || "").toLowerCase();
        if (key && isValidPlatformUser(fbItem)) {
          const existing = byEmail.get(key);
          byEmail.set(key, {
            ...existing,
            ...fbItem,
            allowedTabs: fbItem.allowedTabs || existing?.allowedTabs,
            passwordDigest: fbItem.passwordDigest || existing?.passwordDigest
          });
        }
      }
      list = Array.from(byEmail.values());
    }
  } catch (err) {
    console.warn("Could not retrieve platform users from Firestore:", err);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rma_platform_users", JSON.stringify(list));
    } catch {}
  }

  return list;
}

export async function savePlatformUser(user: PlatformUser): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_platform_users");
      let list: PlatformUser[] = saved ? JSON.parse(saved) : [];
      list = list.filter(u => u.id !== user.id);
      list.unshift(user);
      localStorage.setItem("rma_platform_users", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_platform_users_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "users", user.id), user);
  } catch (err) {
    console.error("Failed to save platform user to Firestore:", err);
  }
}

export async function deletePlatformUser(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_platform_users");
      if (saved) {
        let list: PlatformUser[] = JSON.parse(saved);
        list = list.filter(u => u.id !== id);
        localStorage.setItem("rma_platform_users", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_platform_users_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "users", id));
  } catch (err) {
    console.error("Failed to delete platform user from Firestore:", err);
  }
}

// --------------------------------------------------
// CORE TEAM MEMBERS APIS
// --------------------------------------------------
export interface TeamMember {
  id: string;
  name: string;
  title: string;
  credentials: string;
  role: string;
  photo: string | null;
  bio: string;
  hubs: string[];
  socials: {
    email?: string;
    linkedin?: string;
    behance?: string;
  };
  accent: string;
  order?: number;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  let list: TeamMember[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_team_members");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "team_members"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const fbList: TeamMember[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as TeamMember);
    });

    if (fbList.length > 0) {
      list = fbList;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_team_members", JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve team members from Firestore:", err);
  }

  return list;
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_team_members");
      let list: TeamMember[] = saved ? JSON.parse(saved) : [];
      list = list.filter(m => m.id !== member.id);
      list.push(member);
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem("rma_team_members", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_team_members_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "team_members", member.id), member);
  } catch (err) {
    console.error("Failed to save team member to Firestore:", err);
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_team_members");
      if (saved) {
        let list: TeamMember[] = JSON.parse(saved);
        list = list.filter(m => m.id !== id);
        localStorage.setItem("rma_team_members", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_team_members_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "team_members", id));
  } catch (err) {
    console.error("Failed to delete team member from Firestore:", err);
  }
}

// --------------------------------------------------
// CONTACT MESSAGES APIS
// --------------------------------------------------
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "unread" | "read" | "replied";
  notes?: string;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  let list: ContactMessage[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_contact_messages");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "contact_messages"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const fbList: ContactMessage[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as ContactMessage);
    });

    if (fbList.length > 0) {
      list = fbList;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_contact_messages", JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve contact messages from Firestore:", err);
  }

  return list;
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_contact_messages");
      let list: ContactMessage[] = saved ? JSON.parse(saved) : [];
      list = list.filter(m => m.id !== msg.id);
      list.unshift(msg);
      localStorage.setItem("rma_contact_messages", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_contact_messages_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "contact_messages", msg.id), msg);
  } catch (err) {
    console.error("Failed to save contact message to Firestore:", err);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_contact_messages");
      if (saved) {
        let list: ContactMessage[] = JSON.parse(saved);
        list = list.filter(m => m.id !== id);
        localStorage.setItem("rma_contact_messages", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_contact_messages_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "contact_messages", id));
  } catch (err) {
    console.error("Failed to delete contact message from Firestore:", err);
  }
}

// --------------------------------------------------
// TESTIMONIALS MANAGER APIS
// --------------------------------------------------
export interface PlatformTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  enabled: boolean;
  order: number;
  timestamp: string;
}

export async function getTestimonials(): Promise<PlatformTestimonial[]> {
  let list: PlatformTestimonial[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_testimonials_list");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "testimonials"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const fbList: PlatformTestimonial[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as PlatformTestimonial);
    });

    if (fbList.length > 0) {
      list = fbList;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_testimonials_list", JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve testimonials from Firestore:", err);
  }

  return list;
}

export async function saveTestimonial(testimonial: PlatformTestimonial): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_testimonials_list");
      let list: PlatformTestimonial[] = saved ? JSON.parse(saved) : [];
      list = list.filter(t => t.id !== testimonial.id);
      list.push(testimonial);
      list.sort((a, b) => a.order - b.order);
      localStorage.setItem("rma_testimonials_list", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_testimonials_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "testimonials", testimonial.id), testimonial);
  } catch (err) {
    console.error("Failed to save testimonial to Firestore:", err);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_testimonials_list");
      if (saved) {
        let list: PlatformTestimonial[] = JSON.parse(saved);
        list = list.filter(t => t.id !== id);
        localStorage.setItem("rma_testimonials_list", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_testimonials_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "testimonials", id));
  } catch (err) {
    console.error("Failed to delete testimonial from Firestore:", err);
  }
}

// --------------------------------------------------
// PARTNERS MANAGER APIS
// --------------------------------------------------
export interface PlatformPartner {
  id: string;
  name: string;
  logo: string | null;
  website: string;
  partnershipType: string; // e.g., 'Corporate Sponsor', 'NGO Partner', 'Regional Chapter'
  enabled: boolean;
  order: number;
  timestamp: string;
}

export async function getPartners(): Promise<PlatformPartner[]> {
  let list: PlatformPartner[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_partners_list");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "partners"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const fbList: PlatformPartner[] = [];
    querySnapshot.forEach((doc) => {
      fbList.push({ id: doc.id, ...doc.data() } as PlatformPartner);
    });

    if (fbList.length > 0) {
      list = fbList;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_partners_list", JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve partners from Firestore:", err);
  }

  return list;
}

export async function savePartner(partner: PlatformPartner): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_partners_list");
      let list: PlatformPartner[] = saved ? JSON.parse(saved) : [];
      list = list.filter(p => p.id !== partner.id);
      list.push(partner);
      list.sort((a, b) => a.order - b.order);
      localStorage.setItem("rma_partners_list", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_partners_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "partners", partner.id), partner);
  } catch (err) {
    console.error("Failed to save partner to Firestore:", err);
  }
}

export async function deletePartner(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_partners_list");
      if (saved) {
        let list: PlatformPartner[] = JSON.parse(saved);
        list = list.filter(p => p.id !== id);
        localStorage.setItem("rma_partners_list", JSON.stringify(list));
        window.dispatchEvent(new Event("rma_partners_updated"));
      }
    } catch (e) {}
  }

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await deleteDoc(doc(db, "partners", id));
  } catch (err) {
    console.error("Failed to delete partner from Firestore:", err);
  }
}

/* ==========================================================================
   TEEN LEADERSHIP BOOTCAMP 2026 CMS & REGISTRATIONS STORAGE
   ========================================================================== */

export async function getTeenBootcampConfig(): Promise<TeenBootcampConfig> {
  let config: TeenBootcampConfig = DEFAULT_TEEN_BOOTCAMP_CONFIG;

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_teen_bootcamp_2026_config");
      if (saved) {
        config = { ...DEFAULT_TEEN_BOOTCAMP_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const docSnap = await getDoc(doc(db, "bootcamp_configs", "teen_bootcamp_2026"));
    if (docSnap.exists()) {
      config = { ...DEFAULT_TEEN_BOOTCAMP_CONFIG, ...docSnap.data() } as TeenBootcampConfig;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_teen_bootcamp_2026_config", JSON.stringify(config));
      }
    }
  } catch (err) {
    console.warn("Could not retrieve Teen Bootcamp config from Firestore, using local data:", err);
  }

  return config;
}

export async function saveTeenBootcampConfig(config: TeenBootcampConfig): Promise<void> {
  const updated = {
    ...config,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rma_teen_bootcamp_2026_config", JSON.stringify(updated));
      window.dispatchEvent(new Event("rma_teen_bootcamp_updated"));
    } catch (e) {}
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "bootcamp_configs", "teen_bootcamp_2026"), updated);
  } catch (err) {
    console.error("Failed to save Teen Bootcamp config to Firestore:", err);
  }
}

export async function getTeenBootcampRegistrations(): Promise<BootcampRegistration[]> {
  let list: BootcampRegistration[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_teen_bootcamp_registrations");
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {}
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const q = query(collection(db, "teen_bootcamp_registrations"), orderBy("registrationDate", "desc"));
    const querySnapshot = await getDocs(q);
    const fbList: BootcampRegistration[] = [];
    querySnapshot.forEach((docSnap) => {
      fbList.push({ id: docSnap.id, ...docSnap.data() } as BootcampRegistration);
    });

    if (fbList.length > 0) {
      list = fbList;
      if (typeof window !== "undefined") {
        localStorage.setItem("rma_teen_bootcamp_registrations", JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("Could not fetch Teen Bootcamp registrations from Firestore:", err);
  }

  return list;
}

export async function saveTeenBootcampRegistration(reg: BootcampRegistration): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_teen_bootcamp_registrations");
      let list: BootcampRegistration[] = saved ? JSON.parse(saved) : [];
      list = list.filter(r => r.id !== reg.id);
      list.unshift(reg);
      localStorage.setItem("rma_teen_bootcamp_registrations", JSON.stringify(list));
      window.dispatchEvent(new Event("rma_teen_registrations_updated"));
    } catch (e) {}
  }

  const writeFs = async () => {
    const { doc, setDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    await setDoc(doc(db, "teen_bootcamp_registrations", reg.id), reg);
  };

  const fsTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firestore write timeout (3000ms elapsed)")), 3000)
  );

  try {
    await Promise.race([writeFs(), fsTimeout]);
  } catch (err: any) {
    console.warn("Teen bootcamp Firestore write delayed or offline, queued for background sync:", err?.message || err);
    queueWrite({
      type: "set",
      collection: "teen_bootcamp_registrations",
      docId: reg.id,
      data: reg
    }).catch(() => null);
  }
}

export async function updateTeenBootcampRegistrationStatus(
  id: string,
  status: BootcampRegistration["paymentStatus"],
  notes?: string
): Promise<void> {
  let reg: BootcampRegistration | null = null;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("rma_teen_bootcamp_registrations");
      if (saved) {
        let list: BootcampRegistration[] = JSON.parse(saved);
        const idx = list.findIndex(r => r.id === id);
        if (idx !== -1) {
          list[idx].paymentStatus = status;
          if (notes !== undefined) list[idx].notes = notes;
          reg = list[idx];
          localStorage.setItem("rma_teen_bootcamp_registrations", JSON.stringify(list));
          window.dispatchEvent(new Event("rma_teen_registrations_updated"));
        }
      }
    } catch (e) {}
  }

  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const db = await getFirestoreDb();
    const updatePayload: Record<string, any> = { paymentStatus: status };
    if (notes !== undefined) updatePayload.notes = notes;
    await updateDoc(doc(db, "teen_bootcamp_registrations", id), updatePayload);
  } catch (err) {
    console.error("Failed to update registration status in Firestore:", err);
  }
}


