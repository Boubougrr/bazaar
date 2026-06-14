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
    const { email, pseudo, password } = req.body || {};
    if (!email || !pseudo || !password) return res.status(400).json({ error: 'Champs manquants.' });
    if (pseudo.length < 2) return res.status(400).json({ error: 'Pseudo trop court.' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (min 8 caractères).' });
    const { data: existing } = await sb.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.status(400).json({ error: 'Ce compte existe déjà.' });
    const password_hash = await bcrypt.hash(password, 10);
    const { data: user, error: createErr } = await sb.from('users').insert({
      email, pseudo, password_hash,
      last_verif: new Date().toISOString(),
      last_login: new Date().toISOString(),
      login_count: 1,
    }).select('*').single();
    if (createErr) return res.status(500).json({ error: 'Erreur création: ' + createErr.message });
    return res.json({ ok: true, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
