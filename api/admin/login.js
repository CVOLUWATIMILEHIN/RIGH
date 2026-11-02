import crypto from "crypto";

const ANCHOR_SUPER_ADMINS = new Set([
  "olosundelouis@gmail.com"
]);

const ADMIN_TOKEN_SECRET =
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

function signAdminSessionToken(email, role) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ email, role, expiresAt })).toString("base64url");
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
    const rawEmail = inputEmail.includes("@") ? inputEmail : "rightmindsafrica@gmail.com";
    const rawPassword = typeof body.password === "string" ? body.password.trim() : "";

    if (!rawPassword) {
      return res.status(400).json({ error: "Please provide the administrative password." });
    }

    let matchedRole = null;
    if (isMasterAdminPassword(rawPassword)) {
      matchedRole = ANCHOR_SUPER_ADMINS.has(rawEmail) ? "Super Admin" : "Admin";
    }

    if (!matchedRole) {
      return res.status(401).json({
        error: "Invalid administrative credentials. Please verify your email and password."
      });
    }

    const { token, expiresAt } = signAdminSessionToken(rawEmail, matchedRole);
    return res.status(200).json({
      success: true,
      email: rawEmail,
      role: matchedRole,
      token,
      expiresAt,
      user: {
        username: rawEmail,
        role: matchedRole,
        token,
        expiresAt
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Authentication service error." });
  }
}
