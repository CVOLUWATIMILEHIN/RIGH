import crypto from "crypto";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, doc, setDoc } from "firebase/firestore";

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

function hashPasswordScrypt(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

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
      canWrite: decoded.canWrite
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const authHeader = req.headers?.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : body.token;
    const session = verifyAdminSessionToken(token);

    if (!session.valid || !session.email) {
      return res.status(401).json({ error: "Unauthorized session. Please sign in again." });
    }

    const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const { salt, hash } = hashPasswordScrypt(newPassword);
    const passwordDigest = crypto
      .createHash("sha256")
      .update(`rma_sovereign_salt_2026_v1:${newPassword}`)
      .digest("hex");
    const role = ANCHOR_SUPER_ADMINS.has(session.email) ? "Super Admin" : (session.role || "Admin");

    const db = getServerFirestore();
    if (db) {
      await setDoc(
        doc(db, "admins", session.email),
        {
          email: session.email,
          passwordSalt: salt,
          passwordHash: hash,
          passwordDigest,
          role,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update administrator password." });
  }
}
