// api/update-user.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_id, pseudo } = req.body;
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const update = {};
  if (pseudo && pseudo.length >= 2) update.pseudo = pseudo;
  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Rien à mettre à jour.' });

  const { data } = await supabase.from('users').update(update).eq('id', user_id).select('*').single();

  return res.json({ ok: true, user: safeUser(data) });
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
    week_searches: u.week_searches || {}, 
    month_searches: u.month_searches || {},
  };
}