// api/delete-account.js
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, password } = req.body;
  if (!password) return res.status(400).json({ error: 'Mot de passe requis.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user } = await supabase.from('users').select('password_hash').eq('id', user_id).single();
  if (!user) return res.status(404).json({ error: 'Compte introuvable.' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(403).json({ error: 'Mot de passe incorrect.' });

  // Delete avatar from storage
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  for (const ext of extensions) {
    await supabase.storage.from('avatars').remove([`${user_id}.${ext}`]);
  }

  // Delete reviews then user
  await supabase.from('reviews').delete().eq('user_id', user_id);
  await supabase.from('users').delete().eq('id', user_id);

  return res.json({ ok: true });
}
