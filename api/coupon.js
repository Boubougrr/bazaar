// api/coupon.js — Server-side coupon validation
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Codes are ONLY on the server — never in frontend code
const CODES = {
  [process.env.CODE_REFUND]: { type: 'refund', credits: 5 },
  [process.env.CODE_VIP]:    { type: 'vip' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, code } = req.body;
  if (!code) return res.status(400).json({ error: 'Paramètres manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const upperCode = code.toUpperCase().trim();
  const { data: user } = await supabase.from('users').select('*').eq('id', user_id).single();
  if (!user) return res.status(401).json({ error: 'Non autorisé.' });

  const coupon = CODES[upperCode];
  if (!coupon) return res.status(400).json({ error: 'Code invalide.' });

  const codeKey = `${upperCode}_${user.id}`;
  if ((user.used_codes||[]).includes(codeKey)) return res.status(400).json({ error: 'Code déjà utilisé.' });

  let update = { used_codes: [...(user.used_codes||[]), codeKey] };

  if (coupon.type === 'refund') {
    const left = (user.credits_max||5) - (user.credits_used||0);
    if (left > 0) return res.status(400).json({ error: 'Vous avez encore des crédits.' });
    update.credits_used = 0;
    update.credits_exhausted_at = null;
  } else if (coupon.type === 'vip') {
    update.vip_active = true;
  }

  const { data: updated } = await supabase.from('users').update(update).eq('id', user.id)
    .select('*').single();

  return res.json({ ok: true, type: coupon.type, user: safeUser(updated) });
}

function safeUser(u) {
  if (!u) return null;
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
    role: u.role || 'user'
  };
}