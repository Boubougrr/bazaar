import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, pseudo, email, new_password } = req.body || {};
    if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

    const update = {};
    if (pseudo && pseudo.length >= 2) update.pseudo = pseudo;
    if (email && email.includes('@')) update.email = email;
    if (new_password && new_password.length >= 8)
      update.password_hash = await bcrypt.hash(new_password, 10);

    if (Object.keys(update).length === 0)
      return res.status(400).json({ error: 'Rien à mettre à jour.' });

    const { data, error } = await sb.from('users').update(update).eq('id', user_id)
      .select('id,email,pseudo,plan,credits_max,credits_used,credits_exhausted_at,vip_active,total_searches,login_count,joined_at,last_login,last_verif,week_searches,month_searches').single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, user: data });
  } catch (e) {
    console.error('update-user error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
