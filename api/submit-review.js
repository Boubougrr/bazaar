// api/submit-review.js
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, text, stars, review_id } = req.body;
  if (!text || !stars) return res.status(400).json({ error: 'Champs manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  // UPDATE existing review
  if (review_id) {
    const { data: existing } = await supabase.from('reviews').select('user_id').eq('id', review_id).single();
    if (!existing || existing.user_id !== user_id) return res.status(403).json({ error: 'Non autorisé.' });
    const { data, error } = await supabase.from('reviews').update({ text, stars }).eq('id', review_id).select('*').single();
    if (error) return res.status(500).json({ error: 'Erreur mise à jour.' });
    return res.json({ ok: true, review: data });
  }

  const { data: authUser } = await supabase.from('users').select('pseudo, avatar_url').eq('id', user_id).single();
  if (!authUser) return res.status(401).json({ error: 'Non autorisé.' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const { count: userReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user_id);
  if (userReviews >= 2) return res.status(400).json({ error: 'Limite de 2 avis par compte atteinte.' });

  const { count: ipReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('ip', ip);
  if (ipReviews >= 2) return res.status(400).json({ error: 'Limite de 2 avis par IP atteinte.' });

  const { data, error } = await supabase.from('reviews')
    .insert([{ user_id, pseudo: authUser.pseudo, text, stars, ip, avatar_url: authUser.avatar_url || null, created_at: new Date().toISOString() }])
    .select('*').single();

  if (error) return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'avis.' });
  return res.json({ ok: true, review: data });
}
