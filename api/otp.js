// api/otp.js — handles both send & verify (merged to stay under Hobby plan function limit)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { action, email, code, purpose } = req.body;
  if (!email || !purpose) return res.status(400).json({ error: 'Paramètres manquants.' });

  if (action === 'verify') {
    const { data: otpRow } = await supabase.from('otp_codes').select('*')
      .eq('email', email).eq('purpose', purpose).eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1).single();
    if (!otpRow || otpRow.code !== code) return res.status(400).json({ error: 'Code invalide ou expiré.' });
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRow.id);
    return res.json({ ok: true });
  }

  // Default: send
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recent } = await supabase.from('otp_codes').select('*', { count: 'exact', head: true })
    .eq('email', email).eq('purpose', purpose).gte('created_at', since);
  if ((recent || 0) >= 3) return res.status(429).json({ error: 'Trop de demandes, réessayez plus tard.' });

  await supabase.from('otp_codes').delete().eq('email', email).eq('purpose', purpose);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabase.from('otp_codes').insert({ email, code: otp, purpose, expires_at });

  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: process.env.EMAILJS_SERVICE, template_id: process.env.EMAILJS_TEMPLATE,
        user_id: process.env.EMAILJS_KEY, template_params: { to_email: email, otp_code: otp, from_name: 'Bazaar' } })
    });
  } catch(e) { console.log('EmailJS error:', e); }

  return res.json({ ok: true });
}
