// api/get-user.js
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
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

  // ── AUTO RESET CREDITS ──
  let finalUser = user;
  if (user.credits_exhausted_at) {
    const resetAt = new Date(user.credits_exhausted_at).getTime() + 48 * 3600 * 1000;
    if (Date.now() >= resetAt) {
      const { data: resetUser } = await supabase.from('users').update({
        credits_used: 0,
        credits_exhausted_at: null
      }).eq('id', user.id).select('*').single();
      if (resetUser) finalUser = resetUser;
    }
  }

  return res.json({ ok: true, user: safeUser(finalUser) });
}

function safeUser(u) {
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
    avatar_url: u.avatar_url || null,
    plan: u.plan || 'standard',
    credits_max: u.credits_max || 5,
    credits_used: u.credits_used || 0,
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