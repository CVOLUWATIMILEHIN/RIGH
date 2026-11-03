import crypto from "crypto";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, doc, getDoc } from "firebase/firestore";

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

const ANCHOR_SUPER_ADMINS = new Set([
  "olosundelouis@gmail.com"
]);

const ADMIN_TOKEN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_TOKEN_SECRET ||
  crypto.createHash("sha256").update("rma-hub-sovereign-hmac-key-2026").digest("hex");

function verifyAdminSessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false };
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return { valid: false };

  const expectedSig = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false };
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!decoded.expiresAt || Date.now() > decoded.expiresAt) {
      return { valid: false };
    }
    return {
      valid: true,
      email: decoded.email,
      role: decoded.role,
      allowedTabs: decoded.allowedTabs,
      canWrite: decoded.canWrite,
      expiresAt: decoded.expiresAt
    };
  } catch {
    return { valid: false };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : body?.token;
  const result = verifyAdminSessionToken(token);

  if (!result.valid || !result.email) {
    return res.status(401).json({ valid: false, error: "Invalid or expired administrative session." });
  }

  const cleanEmail = String(result.email).trim().toLowerCase();
  if (!ANCHOR_SUPER_ADMINS.has(cleanEmail)) {
    const db = getServerFirestore();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "admins", cleanEmail));
        if (!snap.exists()) {
          return res.status(401).json({ valid: false, error: "Account not created by Super Admin." });
        }
        const data = snap.data();
        if (data?.status === "Suspended" || !(data?.passwordHash || data?.passwordDigest)) {
          return res.status(401).json({ valid: false, error: "Account is unauthorized or suspended." });
        }
      } catch {}
    }
  }

  return res.status(200).json({
    valid: true,
    email: result.email,
    role: result.role,
    allowedTabs: result.allowedTabs,
    canWrite: result.canWrite,
    expiresAt: result.expiresAt,
    user: {
      username: result.email,
      role: result.role,
      allowedTabs: result.allowedTabs,
      canWrite: result.canWrite,
      expiresAt: result.expiresAt
    }
  });
}
