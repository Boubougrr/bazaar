// api/auth.js — login, signup, and password reset merged into one function
// (Vercel Hobby plan caps deployments at 12 Serverless Functions — see also
// api/account.js, api/reviews.js, and api/otp.js for the same pattern.)
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { signSession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
const PERIOD_MS = 48 * 3600 * 1000;
function getCurrentPeriod() { return Math.floor((Date.now() - EPOCH) / PERIOD_MS); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { action } = req.body || {};
  if (action === 'signup') return handleSignup(req, res);
  if (action === 'reset') return handleReset(req, res);
  if (action === 'login') return handleLogin(req, res);
  return res.status(400).json({ error: 'Action invalide.' });
}

async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Champs manquants.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(400).json({ error: 'Compte introuvable.' });

  // ── BAN CHECK ──
  if (user.is_banned) {
    if (!user.ban_expires_at) return res.status(403).json({ error: 'Compte suspendu définitivement.' });
    if (new Date() < new Date(user.ban_expires_at)) {
      const remaining = Math.ceil((new Date(user.ban_expires_at) - new Date()) / 3600000);
      return res.status(403).json({ error: `Compte suspendu. Expire dans ${remaining}h.` });
    }
  }

  // Verify password. Legacy accounts created before password hashing was
  // fixed may still have the raw password in password_hash — detect that
  // (bcrypt hashes always start with $2) and transparently migrate them to
  // a real hash on successful login instead of locking everyone out.
  const isBcryptHash = typeof user.password_hash === 'string' && user.password_hash.startsWith('$2');
  const valid = isBcryptHash
    ? await bcrypt.compare(password, user.password_hash)
    : password === user.password_hash;
  if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect.' });

  // Update last_login + login_count + IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const updateFields = {
    last_login: new Date().toISOString(),
    login_count: (user.login_count || 0) + 1,
    last_ip: ip
  };
  if (!isBcryptHash) updateFields.password_hash = await bcrypt.hash(password, 10);

  // ── GLOBAL 48h PERIOD RESET ──
  const period = getCurrentPeriod();
  if ((user.credits_period || 0) !== period) {
    updateFields.credits_used = 0;
    updateFields.credits_period = period;
  }

  const { data: updatedUser } = await supabase.from('users').update(updateFields).eq('id', user.id).select('*').single();

  let token;
  try { token = signSession((updatedUser || user).id); }
  catch { return res.status(500).json({ error: 'Configuration serveur invalide (SESSION_SECRET manquant).' }); }

  return res.json({ ok: true, user: safeUser(updatedUser || user), token });
}

async function handleSignup(req, res) {
  const { email, pseudo, password, code } = req.body;

  if (!email || !pseudo || !password || !code) return res.status(400).json({ error: 'Champs manquants.' });
  if (pseudo.length < 2) return res.status(400).json({ error: 'Pseudo trop court.' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });

  // Check if email already taken
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) return res.status(400).json({ error: 'Ce compte existe déjà.' });

  // Verify the email confirmation code sent via /api/otp (purpose: 'signup')
  const { data: otpRow } = await supabase.from('otp_codes').select('*')
    .eq('email', email).eq('purpose', 'signup').eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(1).single();
  if (!otpRow) return res.status(400).json({ error: 'Code invalide ou expiré.' });
  if ((otpRow.attempts || 0) >= 5) return res.status(429).json({ error: 'Trop de tentatives. Redemandez un code.' });
  if (otpRow.code !== code) {
    await supabase.from('otp_codes').update({ attempts: (otpRow.attempts || 0) + 1 }).eq('id', otpRow.id);
    return res.status(400).json({ error: 'Code invalide ou expiré.' });
  }
  await supabase.from('otp_codes').update({ used: true }).eq('id', otpRow.id);

  const password_hash = await bcrypt.hash(password, 10);
  const period = getCurrentPeriod();

  const { data: user, error } = await supabase.from('users').insert({
    email,
    pseudo,
    password_hash,
    last_verif: new Date().toISOString(),
    joined_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    login_count: 1,
    credits_max: 12,
    credits_used: 0,
    credits_period: period,
    plan: 'standard',
    total_searches: 0,
    vip_active: false
  }).select('*').single();

  if (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Erreur création compte.' });
  }

  let token;
  try { token = signSession(user.id); }
  catch { return res.status(500).json({ error: 'Configuration serveur invalide (SESSION_SECRET manquant).' }); }

  return res.json({ ok: true, user: safeUser(user), token });
}

async function handleReset(req, res) {
  const { email, code, new_password } = req.body;
  if (!email || !code || !new_password) return res.status(400).json({ error: 'Champs manquants.' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });

  const { data: otpRow } = await supabase.from('otp_codes').select('*')
    .eq('email', email).eq('purpose', 'reset').eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(1).single();
  if (!otpRow) return res.status(400).json({ error: 'Code invalide ou expiré.' });
  if ((otpRow.attempts || 0) >= 5) return res.status(429).json({ error: 'Trop de tentatives. Redemandez un code.' });
  if (otpRow.code !== code) {
    await supabase.from('otp_codes').update({ attempts: (otpRow.attempts || 0) + 1 }).eq('id', otpRow.id);
    return res.status(400).json({ error: 'Code invalide ou expiré.' });
  }

  const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
  if (!user) return res.status(400).json({ error: 'Compte introuvable.' });

  const password_hash = await bcrypt.hash(new_password, 10);
  const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', user.id);
  if (updateError) return res.status(500).json({ error: 'Erreur lors de la réinitialisation.' });

  await supabase.from('otp_codes').update({ used: true }).eq('id', otpRow.id);

  return res.json({ ok: true });
}

function safeUser(u) {
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
    avatar_url: u.avatar_url || null,
    plan: u.plan || 'standard',
    credits_max: u.credits_max || 5,
    credits_used: u.credits_used || 0,
    credits_period: u.credits_period || 0,
    credits_exhausted_at: u.credits_exhausted_at,
    vip_active: u.vip_active || false,
    total_searches: u.total_searches || 0,
    login_count: u.login_count || 1,
    joined_at: u.joined_at,
    last_login: u.last_login,
    week_searches: u.week_searches || {},
    month_searches: u.month_searches || {},
    role: u.role || 'user',
    last_ip: u.last_ip || 'N/A'
  };
}
