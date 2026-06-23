// api/send-otp.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, purpose } = req.body;
  if (!email || !purpose) return res.status(400).json({ error: 'Paramètres manquants.' });

  // Rate-limit: max 3 codes per email/purpose per 10 minutes, to stop email-bombing abuse.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recent } = await supabase
    .from('otp_codes')
    .select('*', { count: 'exact', head: true })
    .eq('email', email).eq('purpose', purpose)
    .gte('created_at', since);
  if ((recent || 0) >= 3) return res.status(429).json({ error: 'Trop de demandes, réessayez plus tard.' });

  // Delete old codes
  await supabase.from('otp_codes').delete().eq('email', email).eq('purpose', purpose);

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabase.from('otp_codes').insert({ email, code, purpose, expires_at });

  // Send via EmailJS
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  process.env.EMAILJS_SERVICE,
        template_id: process.env.EMAILJS_TEMPLATE,
        user_id:     process.env.EMAILJS_KEY,
        template_params: { to_email: email, otp_code: code, from_name: 'Bazaar' }
      })
    });
  } catch(e) { console.log('EmailJS error:', e); }

  return res.json({ ok: true });
}