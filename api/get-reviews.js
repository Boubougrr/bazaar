// api/get-reviews.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id: filter_uid } = req.body || {};
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (filter_uid) {
    query = query.eq('user_id', filter_uid);
  } else {
    query = query.limit(10);
  }
  const { data: reviews, error } = await query;
  if (error) return res.status(500).json({ error: 'Erreur lors de la récupération des avis.' });
  return res.json({ ok: true, reviews });
}
