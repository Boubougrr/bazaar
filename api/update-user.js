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

  const { data } = await supabase.from('users').update(update).eq('id', user_id)
    .select('id,email,pseudo,plan,credits_max,credits_used,vip_active,total_searches,login_count,joined_at,last_login,last_verif,week_searches,month_searches,credits_exhausted_at').single();

  return res.json({ ok: true, user: data });
}