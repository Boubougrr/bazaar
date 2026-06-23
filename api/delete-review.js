// api/delete-review.js
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, review_id } = req.body;
  if (!review_id) return res.status(400).json({ error: 'Champs manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  // Verify if user is admin/dev
  const { data: user } = await supabase.from('users').select('role').eq('id', user_id).single();
  if (!user || user.role !== 'dev') return res.status(403).json({ error: 'Non autorisé.' });

  const { error } = await supabase.from('reviews').delete().eq('id', review_id);

  if (error) return res.status(500).json({ error: 'Erreur lors de la suppression.' });

  return res.json({ ok: true });
}
