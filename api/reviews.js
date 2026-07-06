// api/reviews.js — get / submit / delete reviews, merged into one function
// (Vercel Hobby plan caps deployments at 12 Serverless Functions — see also
// api/auth.js, api/account.js, and api/otp.js for the same pattern).
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Never select "ip" here — get is public and must not leak reviewer IPs.
const PUBLIC_FIELDS = 'id, user_id, pseudo, text, stars, avatar_url, created_at';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { action } = req.body || {};
  if (action === 'submit') return handleSubmit(req, res);
  if (action === 'delete') return handleDelete(req, res);
  return handleGet(req, res);
}

async function handleGet(req, res) {
  const { token, user_id: filter_uid } = req.body || {};
  let query = supabase.from('reviews').select(PUBLIC_FIELDS).order('created_at', { ascending: false });

  if (filter_uid) {
    // Filtering by user_id is only for "my reviews" — require the caller to own that id.
    const session_uid = verifySession(token);
    if (!session_uid || session_uid !== filter_uid) return res.status(403).json({ error: 'Non autorisé.' });
    query = query.eq('user_id', filter_uid);
  } else {
    query = query.limit(10);
  }
  const { data: reviews, error } = await query;
  if (error) return res.status(500).json({ error: 'Erreur lors de la récupération des avis.' });
  return res.json({ ok: true, reviews });
}

async function handleSubmit(req, res) {
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

async function handleDelete(req, res) {
  const { token, review_id } = req.body;
  if (!review_id) return res.status(400).json({ error: 'Champs manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user } = await supabase.from('users').select('role').eq('id', user_id).single();
  if (!user) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: review } = await supabase.from('reviews').select('user_id').eq('id', review_id).single();
  if (!review) return res.status(404).json({ error: 'Avis introuvable.' });
  if (review.user_id !== user_id && user.role !== 'dev') return res.status(403).json({ error: 'Non autorisé.' });

  const { error } = await supabase.from('reviews').delete().eq('id', review_id);
  if (error) return res.status(500).json({ error: 'Erreur lors de la suppression.' });

  return res.json({ ok: true });
}
