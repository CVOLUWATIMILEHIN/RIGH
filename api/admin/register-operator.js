import crypto from "crypto";

const ANCHOR_SUPER_ADMINS = new Set([
  "olosundelouis@gmail.com",
  "rightmindsafrica@gmail.com",
  "corpersimpactinitiative@gmail.com"
]);

const ADMIN_TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET ||
  crypto.createHash("sha256").update("rma-hub-sovereign-hmac-key-2026").digest("hex");

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false };
  }
  const [payload] = token.split(".");
  if (!payload) return { valid: false };
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!decoded.expiresAt || Date.now() > decoded.expiresAt) {
      return { valid: false };
    }
    return {
      valid: true,
      email: decoded.email,
      role: decoded.role
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
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : body.token;
    const session = verifyToken(token);

    const isSuperAdmin =
      session.valid &&
      (session.role === "Super Admin" || (session.email && ANCHOR_SUPER_ADMINS.has(session.email)));

    if (!isSuperAdmin) {
      return res.status(403).json({
        error: "Access Denied: Only the System Owner (Super Admin) can create or modify Admin accounts."
      });
    }

    return res.status(200).json({
      success: true,
      email: body.email,
      role: body.role || "Admin",
      allowedTabs: body.allowedTabs,
      canWrite: body.canWrite
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to register operator." });
  }
}
