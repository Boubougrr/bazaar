// api/account.js — get / update / delete the logged-in user's own account, merged
// into one function (Vercel Hobby plan caps deployments at 12 Serverless Functions —
// see also api/auth.js, api/reviews.js, and api/otp.js for the same pattern).
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { verifySession } from './_session.js';

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
  if (action === 'update') return handleUpdate(req, res);
  if (action === 'delete') return handleDelete(req, res);
  return handleGet(req, res);
}

async function handleGet(req, res) {
  const { token } = req.body;
  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Session invalide.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Session invalide.' });

  // ── BAN CHECK ──
  if (user.is_banned) {
    if (!user.ban_expires_at) return res.status(403).json({ error: 'Compte suspendu définitivement.' });
    if (new Date() < new Date(user.ban_expires_at)) {
      const remaining = Math.ceil((new Date(user.ban_expires_at) - new Date()) / 3600000);
      return res.status(403).json({ error: `Compte suspendu. Expire dans ${remaining}h.` });
    }
  }

  // ── GLOBAL 48h PERIOD RESET ──
  let finalUser = user;
  const period = getCurrentPeriod();
  if ((user.credits_period || 0) !== period) {
    const { data: resetUser } = await supabase.from('users').update({
      credits_used: 0,
      credits_period: period
    }).eq('id', user.id).select('*').single();
    if (resetUser) finalUser = resetUser;
  }

  return res.json({ ok: true, user: safeUser(finalUser) });
}

async function handleUpdate(req, res) {
  const { token, pseudo, email, new_password, verify_password } = req.body;
  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (userError || !user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

  // Verify password if pseudo or email is changing
  if (pseudo || email) {
    if (!verify_password) return res.status(400).json({ error: 'Mot de passe requis pour confirmer les changements.' });
    const valid = await bcrypt.compare(verify_password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect.' });
  }

  const update = {};
  if (pseudo && pseudo.length >= 2) update.pseudo = pseudo;
  if (email && email.includes('@')) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing && existing.id !== user_id) return res.status(400).json({ error: 'Email déjà utilisé.' });
    update.email = email;
  }
  if (new_password) {
    if (new_password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });
    update.password_hash = await bcrypt.hash(new_password, 10);
  }

  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Rien à mettre à jour.' });

  const { data, error } = await supabase.from('users').update(update).eq('id', user_id).select('*').single();
  if (error) return res.status(400).json({ error: 'Erreur lors de la mise à jour.' });

  return res.json({ ok: true, user: safeUser(data) });
}

async function handleDelete(req, res) {
  const { token, password } = req.body;
  if (!password) return res.status(400).json({ error: 'Mot de passe requis.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user } = await supabase.from('users').select('password_hash').eq('id', user_id).single();
  if (!user) return res.status(404).json({ error: 'Compte introuvable.' });

  // Legacy accounts (pre-bcrypt migration) may still have the raw password
  // in password_hash — same fallback as the login flow, otherwise those
  // accounts could never pass this check and delete themselves.
  const isBcryptHash = typeof user.password_hash === 'string' && user.password_hash.startsWith('$2');
  const ok = isBcryptHash ? await bcrypt.compare(password, user.password_hash) : password === user.password_hash;
  if (!ok) return res.status(403).json({ error: 'Mot de passe incorrect.' });

  // Delete avatar from storage
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  for (const ext of extensions) {
    await supabase.storage.from('avatars').remove([`${user_id}.${ext}`]);
  }

  // Delete reviews then user
  await supabase.from('reviews').delete().eq('user_id', user_id);
  await supabase.from('users').delete().eq('id', user_id);

  return res.json({ ok: true });
}

function safeUser(u) {
  if (!u) return null;
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
