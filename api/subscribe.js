/**
 * Subscribe API - Vercel Edge Function
 * POST { email } -> stores subscriber email in Vercel KV (deduped, timestamped).
 * GET with Authorization: Bearer <ADMIN_PASSWORD> -> returns full subscriber list.
 */

export const config = { runtime: 'edge' };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const RATE_LIMIT_MAX = 5; // subscribe attempts per IP per window
const RATE_LIMIT_WINDOW_SEC = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LEN = 254;

// ---------------------------------------------------------------------------
// Vercel KV helpers (REST API via fetch)
// ---------------------------------------------------------------------------

function kvHeaders() {
  return {
    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function kvCommand(cmd) {
  const res = await fetch(`${process.env.KV_REST_API_URL}`, {
    method: 'POST',
    headers: kvHeaders(),
    body: JSON.stringify(cmd),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ---------------------------------------------------------------------------
// Timing-safe string comparison
// ---------------------------------------------------------------------------

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.byteLength !== bufB.byteLength) {
    let x = 0;
    for (let i = 0; i < bufA.byteLength; i++) x |= bufA[i] ^ bufA[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < bufA.byteLength; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (!kvConfigured()) {
    return json(503, { error: 'Storage not configured' });
  }

  if (req.method === 'POST') {
    return handleSubscribe(req);
  }
  if (req.method === 'GET') {
    return handleList(req);
  }
  return json(405, { error: 'Method not allowed' });
}

async function handleSubscribe(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rlKey = `ratelimit:subscribe:${ip}`;
  const count = await kvCommand(['INCR', rlKey]);
  if (count === 1) await kvCommand(['EXPIRE', rlKey, RATE_LIMIT_WINDOW_SEC]);
  if (count !== null && count > RATE_LIMIT_MAX) {
    return json(429, { error: 'Too many attempts, try again in a minute' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return json(400, { error: 'Please enter a valid email' });
  }

  const added = await kvCommand(['SADD', 'subscribers', email]);
  if (added === 1) {
    await kvCommand([
      'HSET',
      'subscribers:meta',
      email,
      JSON.stringify({ subscribedAt: new Date().toISOString(), source: body?.source || 'publications' }),
    ]);
  }

  return json(200, { ok: true, alreadySubscribed: added === 0 });
}

async function handleList(req) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return json(503, { error: 'Admin access not configured' });

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!timingSafeEqual(token, adminPassword)) {
    return json(401, { error: 'Unauthorized' });
  }

  const emails = (await kvCommand(['SMEMBERS', 'subscribers'])) || [];
  const meta = (await kvCommand(['HGETALL', 'subscribers:meta'])) || [];

  // HGETALL returns a flat [field, value, field, value, ...] array
  const metaMap = {};
  for (let i = 0; i + 1 < meta.length; i += 2) {
    try {
      metaMap[meta[i]] = JSON.parse(meta[i + 1]);
    } catch {
      metaMap[meta[i]] = null;
    }
  }

  const subscribers = emails
    .map((email) => ({ email, ...(metaMap[email] || {}) }))
    .sort((a, b) => (b.subscribedAt || '').localeCompare(a.subscribedAt || ''));

  return json(200, { count: subscribers.length, subscribers });
}
