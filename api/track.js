// api/track.js — lightweight first-party analytics (no third-party service)
// Records anonymous pageview/event pings into Supabase. Never blocks or throws
// on the client side — analytics must never break the site.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_EVENTS = ['pageview', 'search', 'signup', 'login'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { event_type, page, session_id } = req.body || {};

  if (!ALLOWED_EVENTS.includes(event_type)) return res.status(400).json({ error: 'Événement invalide.' });
  if (!session_id || typeof session_id !== 'string' || session_id.length > 100) return res.status(400).json({ error: 'Session invalide.' });

  const referrer = (req.headers['referer'] || '').toString().slice(0, 300);

  try {
    await supabase.from('analytics_events').insert({
      event_type,
      page: (page || '').toString().slice(0, 100),
      session_id,
      referrer,
    });
  } catch (e) {}

  return res.json({ ok: true });
}
