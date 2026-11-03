export default function handler(req, res) {
  res.status(200).json({ status: "ok", runtime: "vercel", timestamp: new Date().toISOString() });
}
