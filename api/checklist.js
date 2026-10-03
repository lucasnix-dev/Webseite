// Vercel serverless function: /api/checklist
// Reads/writes the fitness-checklist state (which items are checked)
// in Vercel KV, so it's synced across devices instead of living only
// in localStorage. Protected by the session cookie set by /api/login.
//
// Required environment variables (auto-added when you create a
// Vercel KV database and connect it to this project):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN
//
// Also required:
//   SITE_PASSWORD (same one used by /api/login)

const KV_KEY = "fitness-checklist";

function isAuthed(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/session=([^;]+)/);
  const expected = process.env.SITE_PASSWORD;
  return Boolean(expected) && match && decodeURIComponent(match[1]) === expected;
}

async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  const data = await res.json();
  if (!data.result) return {};
  try {
    return JSON.parse(data.result);
  } catch {
    return {};
  }
}

async function kvSet(key, value) {
  await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    body: JSON.stringify(value),
  });
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  if (req.method === "GET") {
    const data = await kvGet(KV_KEY);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    await kvSet(KV_KEY, body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
