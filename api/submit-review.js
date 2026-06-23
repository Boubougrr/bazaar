// api/submit-review.js
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, text, stars } = req.body;
  if (!text || !stars) return res.status(400).json({ error: 'Champs manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  // pseudo is derived from the authenticated account, never trusted from the client
  const { data: authUser } = await supabase.from('users').select('pseudo').eq('id', user_id).single();
  if (!authUser) return res.status(401).json({ error: 'Non autorisé.' });
  const pseudo = authUser.pseudo;

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

  const { data: authUserFull } = await supabase.from('users').select('avatar_url').eq('id', user_id).single();
  const avatar_url = authUserFull?.avatar_url || null;

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ user_id, pseudo, text, stars, ip, avatar_url, created_at: new Date().toISOString() }])
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'avis.' });

  return res.json({ ok: true, review: data });
}
