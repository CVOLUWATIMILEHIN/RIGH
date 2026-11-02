import crypto from "crypto";

const ANCHOR_SUPER_ADMINS = new Set([
  "olosundelouis@gmail.com"
]);

const ADMIN_TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET ||
  crypto.createHash("sha256").update("rma-hub-sovereign-hmac-key-2026").digest("hex");

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

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
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!rawEmail) {
      return res.status(400).json({ error: "Missing administrator email." });
    }

    const resolvedRole = ANCHOR_SUPER_ADMINS.has(rawEmail)
      ? "Super Admin"
      : (body.role && body.role !== "Public User" ? body.role : "Admin");

    const { token, expiresAt } = signAdminSessionToken(rawEmail, resolvedRole);
    return res.status(200).json({
      success: true,
      email: rawEmail,
      role: resolvedRole,
      token,
      expiresAt,
      user: {
        username: rawEmail,
        role: resolvedRole,
        token,
        expiresAt
      }
    });
  } catch {
    return res.status(500).json({ error: "Failed to exchange OAuth session." });
  }
}
