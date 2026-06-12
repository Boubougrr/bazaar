import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, code, purpose } = req.body || {};
    if (!email || !code || !purpose) return res.status(400).json({ error: 'Paramètres manquants.' });

    const { data: rows } = await sb
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    const otpRow = rows && rows[0];
    if (!otpRow || otpRow.code !== String(code).trim())
      return res.status(400).json({ error: 'Code invalide ou expiré.' });

    await sb.from('otp_codes').update({ used: true }).eq('id', otpRow.id);
    return res.json({ ok: true });
  } catch (e) {
    console.error('verify-otp error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
