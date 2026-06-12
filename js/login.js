import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function safeUser(u) {
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
    plan: u.plan, credits_max: u.credits_max,
    credits_used: u.credits_used,
    credits_exhausted_at: u.credits_exhausted_at,
    vip_active: u.vip_active, total_searches: u.total_searches,
    login_count: u.login_count, joined_at: u.joined_at,
    last_login: u.last_login, last_verif: u.last_verif,
    week_searches: u.week_searches, month_searches: u.month_searches,
  };
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Champs manquants.' });

    const { data: user, error } = await sb.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(400).json({ error: 'Compte introuvable.' });
    if (user.is_banned) return res.status(403).json({ error: 'Compte suspendu.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect.' });

    // Auto-reset credits if 24h passed
    let updates = {
      last_login: new Date().toISOString(),
      login_count: (user.login_count || 0) + 1,
    };
    if (user.credits_exhausted_at) {
      const elapsed = Date.now() - new Date(user.credits_exhausted_at).getTime();
      if (elapsed >= 24 * 3600 * 1000) {
        updates.credits_used = 0;
        updates.credits_exhausted_at = null;
        user.credits_used = 0;
        user.credits_exhausted_at = null;
      }
    }

    await sb.from('users').update(updates).eq('id', user.id);

    return res.json({ ok: true, user: safeUser({ ...user, ...updates }) });
  } catch (e) {
    console.error('login error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
