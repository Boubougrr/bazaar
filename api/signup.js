// api/signup.js — Vercel Serverless Function
// Runs SERVER-SIDE only. Never exposed to browser.
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { signSession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role — NEVER in frontend
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, pseudo, password } = req.body;

  if (!email || !pseudo || !password) return res.status(400).json({ error: 'Champs manquants.' });
  if (pseudo.length < 2) return res.status(400).json({ error: 'Pseudo trop court.' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });

  // Check if email already taken
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) return res.status(400).json({ error: 'Ce compte existe déjà.' });

  const password_hash = await bcrypt.hash(password, 10);

  // Create account
  const { data: user, error } = await supabase.from('users').insert({
    email,
    pseudo,
    password_hash,
    last_verif: new Date().toISOString(),
    joined_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    login_count: 1,
    credits_max: 5,
    credits_used: 0,
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

function safeUser(u) {
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
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
  };
}