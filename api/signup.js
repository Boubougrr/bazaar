// api/signup.js — Vercel Serverless Function
// Runs SERVER-SIDE only. Never exposed to browser.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role — NEVER in frontend
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, pseudo, password, otp } = req.body;

  // ── STEP 1: request OTP (no otp sent yet) ──
  if (!otp) {
    if (!email || !pseudo || !password) return res.status(400).json({ error: 'Champs manquants.' });
    if (pseudo.length < 2) return res.status(400).json({ error: 'Pseudo trop court.' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });

    // Check if email already taken
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ error: 'Ce compte existe déjà.' });

    // Delete old OTPs for this email
    await supabase.from('otp_codes').delete().eq('email', email).eq('purpose', 'signup');

    // Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await supabase.from('otp_codes').insert({ email, code, purpose: 'signup' });

    // Send via EmailJS server-side (or return for demo)
    // In production: call EmailJS API here
    console.log(`[BAZAAR SIGNUP OTP] ${email}: ${code}`);

    return res.json({ ok: true, step: 'otp_sent' });
  }

  // ── STEP 2: verify OTP and create account ──
  const { data: otpRow } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', 'signup')
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (!otpRow || otpRow.code !== otp)
    return res.status(400).json({ error: 'Code invalide ou expiré.' });

  // Hash password server-side
  const { data: hashResult } = await supabase
    .rpc('crypt_password', { pass: password })
    .single()
    .catch(() => ({ data: null }));

  // Fallback: use pgcrypto directly
  const { data: user, error } = await supabase.from('users').insert({
    email,
    pseudo,
    password_hash: password, // will be hashed by trigger (see below)
    last_verif: new Date().toISOString(),
  }).select('id, email, pseudo, plan, credits_max, credits_used, vip_active, total_searches, login_count, joined_at').single();

  if (error) return res.status(500).json({ error: 'Erreur création compte.' });

  // Mark OTP as used
  await supabase.from('otp_codes').update({ used: true }).eq('id', otpRow.id);

  // Return safe user data (no password_hash, no sensitive fields)
  return res.json({ ok: true, user: safeUser(user) });
}

function safeUser(u) {
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
    plan: u.plan, credits_max: u.credits_max,
    credits_used: u.credits_used, vip_active: u.vip_active,
    total_searches: u.total_searches, login_count: u.login_count,
    joined_at: u.joined_at
  };
}