// api/login.js — Vercel Serverless Function
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Champs manquants.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(400).json({ error: 'Compte introuvable.' });
  if (user.is_banned)  return res.status(403).json({ error: 'Compte suspendu.' });

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect.' });

  // Update last_login + login_count
  await supabase.from('users').update({
    last_login: new Date().toISOString(),
    login_count: (user.login_count || 0) + 1
  }).eq('id', user.id);

  return res.json({ ok: true, user: safeUser(user) });
}

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