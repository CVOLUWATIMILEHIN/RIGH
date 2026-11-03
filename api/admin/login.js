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

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function hashPasswordScrypt(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPasswordScrypt(password, salt, expectedHash) {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const expectedBuf = Buffer.from(expectedHash, "hex");
    if (derivedKey.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedBuf);
  } catch {
    return false;
  }
}

const defaultMasterPassword = process.env.ADMIN_PASSWORD || "RMAAdmin2026";
const masterPasswordHashes = [
  defaultMasterPassword,
  defaultMasterPassword.toLowerCase(),
  "RMAAdmin2026",
  "rmaadmin2026",
  "RMA2026",
  "rma2026",
  "RMA2026Admin",
  "rma2026admin",
  "Admin2026",
  "admin2026"
].map((pw) => hashPasswordScrypt(pw));

function isMasterAdminPassword(candidate) {
  const trimmed = String(candidate || "").trim();
  const lowered = trimmed.toLowerCase();
  for (const entry of masterPasswordHashes) {
    if (
      verifyPasswordScrypt(trimmed, entry.salt, entry.hash) ||
      verifyPasswordScrypt(lowered, entry.salt, entry.hash)
    ) {
      return true;
    }
  }
  return false;
}

function signAdminSessionToken(email, role, allowedTabs, canWrite) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ email, role, allowedTabs, canWrite, expiresAt })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, expiresAt };
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
    const inputEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawEmail = inputEmail;
    const rawPassword = typeof body.password === "string" ? body.password.trim() : "";

    if (!rawEmail || !rawEmail.includes("@")) {
      return res.status(400).json({ error: "Please enter your registered Administrator email address." });
    }

    if (!rawPassword) {
      return res.status(400).json({ error: "Please provide the administrative password." });
    }

    let matchedRole = null;
    let matchedAllowedTabs = undefined;
    let matchedCanWrite = undefined;
    let matchedFullName = undefined;
    let emailFoundInAdminDirectory = false;

    // 1. Check Firestore admins collection first so custom/provisioned admin credentials work on Vercel
    const db = getServerFirestore();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "admins", rawEmail));
        if (snap.exists()) {
          const data = snap.data();
          const hasCustomPassword = Boolean(data?.passwordHash || data?.passwordDigest);
          if (ANCHOR_SUPER_ADMINS.has(rawEmail) || hasCustomPassword) {
            emailFoundInAdminDirectory = true;
            if (data?.status === "Suspended") {
              return res.status(403).json({
                error: "Access Revoked: Your administrator account has been suspended by the System Owner (Super Admin)."
              });
            }

            if (data?.fullName) {
              matchedFullName = data.fullName;
            }

            const candidateDigest = crypto
              .createHash("sha256")
              .update(`rma_sovereign_salt_2026_v1:${rawPassword}`)
              .digest("hex");
            const candidateLowerDigest = crypto
              .createHash("sha256")
              .update(`rma_sovereign_salt_2026_v1:${rawPassword.toLowerCase()}`)
              .digest("hex");

            const scryptMatch =
              data?.passwordHash &&
              data?.passwordSalt &&
              verifyPasswordScrypt(rawPassword, data.passwordSalt, data.passwordHash);
            const digestMatch =
              data?.passwordDigest &&
              (data.passwordDigest === candidateDigest || data.passwordDigest === candidateLowerDigest);

            if (
              scryptMatch ||
              digestMatch ||
              (ANCHOR_SUPER_ADMINS.has(rawEmail) && !hasCustomPassword && isMasterAdminPassword(rawPassword))
            ) {
              matchedRole = ANCHOR_SUPER_ADMINS.has(rawEmail) ? "Super Admin" : (data.role || "Admin");
              matchedAllowedTabs = Array.isArray(data.allowedTabs) ? data.allowedTabs : undefined;
              matchedCanWrite = typeof data.canWrite === "boolean" ? data.canWrite : true;
            }
          }
        }
      } catch (e) {
        console.warn("[Vercel Admin Login] Firestore lookup fallback:", e?.message || e);
      }
    }

    // 2. Fallback to master admin password ONLY for the sole Super Admin (olosundelouis@gmail.com)
    if (!emailFoundInAdminDirectory && ANCHOR_SUPER_ADMINS.has(rawEmail)) {
      emailFoundInAdminDirectory = true;
      if (isMasterAdminPassword(rawPassword)) {
        matchedRole = "Super Admin";
        matchedCanWrite = true;
      }
    }

    if (!emailFoundInAdminDirectory) {
      return res.status(403).json({
        error: `Access Denied: The email "${rawEmail}" has not been created by the Super Admin. No unauthorized email is allowed to log in.`
      });
    }

    if (!matchedRole) {
      return res.status(401).json({
        error: "Invalid administrative credentials. Please verify your email and password."
      });
    }

    const { token, expiresAt } = signAdminSessionToken(
      rawEmail,
      matchedRole,
      matchedAllowedTabs,
      matchedCanWrite
    );
    return res.status(200).json({
      success: true,
      email: rawEmail,
      fullName: matchedFullName,
      role: matchedRole,
      allowedTabs: matchedAllowedTabs,
      canWrite: matchedCanWrite,
      token,
      expiresAt,
      user: {
        username: rawEmail,
        fullName: matchedFullName,
        role: matchedRole,
        allowedTabs: matchedAllowedTabs,
        canWrite: matchedCanWrite,
        token,
        expiresAt
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Authentication service error." });
  }
}
