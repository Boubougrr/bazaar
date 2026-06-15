// api/verify-otp.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, code, purpose } = req.body;
  if (!email || !code || !purpose) return res.status(400).json({ error: 'Paramètres manquants.' });

  const { data: otpRow } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!otpRow || otpRow.code !== code)
    return res.status(400).json({ error: 'Code invalide ou expiré.' });

  await supabase.from('otp_codes').update({ used: true }).eq('id', otpRow.id);
  return res.json({ ok: true });
}