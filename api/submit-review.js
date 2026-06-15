// api/submit-review.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_id, pseudo, text, stars } = req.body;
  if (!user_id || !text || !stars) return res.status(400).json({ error: 'Champs manquants.' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Check limits: max 2 reviews per user
  const { count: userReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id);

  if (userReviews >= 2) return res.status(400).json({ error: 'Limite de 2 avis par compte atteinte.' });

  // Check limits: max 2 reviews per IP
  const { count: ipReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip);

  if (ipReviews >= 2) return res.status(400).json({ error: 'Limite de 2 avis par IP atteinte.' });

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ user_id, pseudo, text, stars, ip, created_at: new Date().toISOString() }])
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'avis.' });

  return res.json({ ok: true, review: data });
}
