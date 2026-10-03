// Vercel serverless function: /api/login
// Simple single-user password login. On success, sets an HttpOnly
// cookie that api/checklist.js checks on every request.
//
// Required environment variable:
//   SITE_PASSWORD

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { password } = req.body || {};
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return res.status(500).json({ ok: false, error: "server_not_configured" });
  }

  if (password && password === expected) {
    const maxAge = 60 * 60 * 24 * 30; // 30 Tage
    res.setHeader(
      "Set-Cookie",
      `session=${encodeURIComponent(expected)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: "wrong_password" });
}
