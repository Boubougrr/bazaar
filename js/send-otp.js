import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, purpose } = req.body || {};
    if (!email || !purpose) return res.status(400).json({ error: 'Paramètres manquants.' });
    if (!email.includes('@')) return res.status(400).json({ error: 'Email invalide.' });

    await sb.from('otp_codes').delete().eq('email', email).eq('purpose', purpose);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const { error: insertErr } = await sb.from('otp_codes').insert({ email, code, purpose });
    if (insertErr) throw insertErr;

    // Send via EmailJS
    const ejRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  process.env.EMAILJS_SERVICE  || 'service_bazaar',
        template_id: process.env.EMAILJS_TEMPLATE || 'template_7kiw3sb',
        user_id:     process.env.EMAILJS_KEY      || 'M-eHZGppCNRyWiLMi',
        template_params: { to_email: email, otp_code: code, from_name: 'Bazaar' }
      })
    });

    if (!ejRes.ok) {
      // Still return ok — code is in DB, email just might fail in demo
      console.log(`[OTP] ${email} → ${code} (EmailJS status: ${ejRes.status})`);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('send-otp error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
