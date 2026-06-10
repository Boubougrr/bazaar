// api/search.js — Server-side search handler
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_id, query, type } = req.body;
  if (!user_id || !query) return res.status(400).json({ error: 'Paramètres manquants.' });

  const { data: user } = await supabase.from('users').select('*').eq('id', user_id).single();
  if (!user) return res.status(401).json({ error: 'Non autorisé.' });

  const left = (user.credits_max || 5) - (user.credits_used || 0);
  if (left <= 0) return res.status(429).json({ error: 'Quota épuisé.' });

  // Track stats
  const now = new Date();
  const wk = `w_${now.getFullYear()}_${getWeek(now)}`;
  const mk = `m_${now.getFullYear()}_${now.getMonth()}`;
  const weekS = { ...(user.week_searches || {}), [wk]: ((user.week_searches||{})[wk]||0)+1 };
  const monthS= { ...(user.month_searches||{}), [mk]: ((user.month_searches||{})[mk]||0)+1 };

  const newUsed = (user.credits_used||0) + 1;
  const exhaustedAt = newUsed >= (user.credits_max||5) ? new Date().toISOString() : null;

  await supabase.from('users').update({
    credits_used: newUsed,
    credits_exhausted_at: exhaustedAt,
    total_searches: (user.total_searches||0) + 1,
    week_searches: weekS,
    month_searches: monthS,
  }).eq('id', user.id);

  return res.json({
    ok: true,
    credits_left: Math.max(0, (user.credits_max||5) - newUsed),
    exhausted_at: exhaustedAt
  });
}

function getWeek(d){ const s=new Date(d.getFullYear(),0,1); return Math.ceil(((d-s)/86400000+s.getDay()+1)/7); }