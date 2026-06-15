import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, code } = req.body || {};
    if (!user_id || !code) return res.status(400).json({ error: 'Paramètres manquants.' });

    const upperCode = code.toUpperCase().trim();
    const { data: user } = await sb.from('users').select('*').eq('id', user_id).single();
    if (!user) return res.status(401).json({ error: 'Non autorisé.' });

    // Codes stored ONLY in env vars — never in frontend
    const CODES = {};
    if (process.env.CODE_REFUND) CODES[process.env.CODE_REFUND.toUpperCase()] = { type: 'refund' };
    if (process.env.CODE_VIP)    CODES[process.env.CODE_VIP.toUpperCase()]    = { type: 'vip' };

    const coupon = CODES[upperCode];
    if (!coupon) return res.status(400).json({ error: 'Code invalide.' });

    const codeKey = `${upperCode}_${user.id}`;
    if ((user.used_codes||[]).includes(codeKey))
      return res.status(400).json({ error: 'Code déjà utilisé sur ce compte.' });

    let update = { used_codes: [...(user.used_codes||[]), codeKey] };

    if (coupon.type === 'refund') {
      const left = (user.credits_max||5) - (user.credits_used||0);
      if (left > 0) return res.status(400).json({ error: 'Vous avez encore des crédits.' });
      update.credits_used = 0;
      update.credits_exhausted_at = null;
    } else if (coupon.type === 'vip') {
      update.vip_active = true;
    }

    const { data: updated } = await sb.from('users').update(update).eq('id', user.id)
      .select('credits_max,credits_used,credits_exhausted_at,vip_active').single();

    return res.json({ ok: true, type: coupon.type, user: updated });
  } catch (e) {
    console.error('coupon error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
