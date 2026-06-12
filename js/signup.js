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
    const { email, pseudo, password, otp } = req.body || {};
    if (!email || !pseudo || !password) return res.status(400).json({ error: 'Champs manquants.' });
    if (pseudo.length < 2) return res.status(400).json({ error: 'Pseudo trop court.' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });

    // ── STEP 1: send OTP ──
    if (!otp) {
      const { data: existing } = await sb.from('users').select('id').eq('email', email).maybeSingle();
      if (existing) return res.status(400).json({ error: 'Ce compte existe déjà.' });

      await sb.from('otp_codes').delete().eq('email', email).eq('purpose', 'signup');
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await sb.from('otp_codes').insert({ email, code, purpose: 'signup' });

      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE || 'service_bazaar',
          template_id: process.env.EMAILJS_TEMPLATE || 'template_7kiw3sb',
          user_id: process.env.EMAILJS_KEY || 'M-eHZGppCNRyWiLMi',
          template_params: { to_email: email, otp_code: code, from_name: 'Bazaar' }
        })
      }).catch(e => console.log('EmailJS:', e.message));

      return res.json({ ok: true, step: 'otp_sent' });
    }

    // ── STEP 2: verify OTP and create account ──
    const { data: rows } = await sb
      .from('otp_codes').select('*')
      .eq('email', email).eq('purpose', 'signup').eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1);

    const otpRow = rows && rows[0];
    if (!otpRow || otpRow.code !== String(otp).trim())
      return res.status(400).json({ error: 'Code invalide ou expiré.' });

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await sb.from('users').insert({
      email, pseudo, password_hash,
      last_verif: new Date().toISOString(),
      last_login: new Date().toISOString(),
      login_count: 1,
    }).select('*').single();

    if (error) return res.status(500).json({ error: 'Erreur création: ' + error.message });

    await sb.from('otp_codes').update({ used: true }).eq('id', otpRow.id);
    return res.json({ ok: true, user: safeUser(user) });

  } catch (e) {
    console.error('signup error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
