// api/_session.js — signed session tokens (HMAC-SHA256, no extra dependency)
// Replaces the old "trust the user_id sent by the client" model: every
// protected route must call verifySession(token) and use the returned id,
// never a user_id taken directly from the request body.
import crypto from 'crypto';

const MAX_AGE_MS = 30 * 24 * 3600 * 1000; // 30 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET non configuré.');
  return secret;
}

export function signSession(userId) {
  const secret = getSecret();
  const payload = Buffer.from(JSON.stringify({ uid: userId, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  let secret;
  try { secret = getSecret(); } catch { return null; }

  const [payload, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.uid || Date.now() - data.iat > MAX_AGE_MS) return null;
    return data.uid;
  } catch {
    return null;
  }
}
