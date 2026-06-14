import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function getWeek(d) { const s = new Date(d.getFullYear(),0,1); return Math.ceil(((d-s)/86400000+s.getDay()+1)/7); }

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id } = req.body || {};
    if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

    const { data: user, error } = await sb.from('users').select('*').eq('id', user_id).single();
    if (error || !user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

    // Auto-reset if 24h passed
    if (user.credits_exhausted_at) {
      const elapsed = Date.now() - new Date(user.credits_exhausted_at).getTime();
      if (elapsed >= 24 * 3600 * 1000) {
        await sb.from('users').update({ credits_used: 0, credits_exhausted_at: null }).eq('id', user.id);
        user.credits_used = 0;
        user.credits_exhausted_at = null;
      }
    }

    const left = (user.credits_max || 5) - (user.credits_used || 0);
    if (left <= 0) return res.status(429).json({ error: 'Quota épuisé.' });

    const now = new Date();
    const wk = `w_${now.getFullYear()}_${getWeek(now)}`;
    const mk = `m_${now.getFullYear()}_${now.getMonth()}`;
    const weekS = { ...(user.week_searches || {}), [wk]: ((user.week_searches||{})[wk]||0)+1 };
    const monthS = { ...(user.month_searches||{}), [mk]: ((user.month_searches||{})[mk]||0)+1 };

    const newUsed = (user.credits_used||0) + 1;
    const exhaustedAt = newUsed >= (user.credits_max||5) ? new Date().toISOString() : null;

    await sb.from('users').update({
      credits_used: newUsed,
      credits_exhausted_at: exhaustedAt,
      total_searches: (user.total_searches||0) + 1,
      week_searches: weekS,
      month_searches: monthS,
    }).eq('id', user.id);

    return res.json({
      ok: true,
      credits_left: Math.max(0, (user.credits_max||5) - newUsed),
      exhausted_at: exhaustedAt,
    });
  } catch (e) {
    console.error('search error:', e);
    return res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
  }
}
