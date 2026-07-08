// api/site-status.js — global on/off switches for the shop and the OSINT
// search tool. Default action (no `action` field) is public and returns the
// current state — the frontend needs it on every page load. `action:'set'`
// is staff-only (dev/admin) and flips a switch.
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getStatus() {
  const { data } = await supabase.from('site_status').select('*').eq('id', 1).single();
  return {
    shop_enabled: data ? data.shop_enabled : true,
    osint_enabled: data ? data.osint_enabled : true,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action, token, shop_enabled, osint_enabled } = req.body || {};

  if (action !== 'set') {
    const status = await getStatus();
    return res.json({ ok: true, ...status });
  }

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user } = await supabase.from('users').select('role').eq('id', user_id).single();
  if (!user || (user.role !== 'dev' && user.role !== 'admin')) {
    return res.status(403).json({ error: 'Accès réservé au staff.' });
  }

  const update = { updated_at: new Date().toISOString() };
  if (typeof shop_enabled === 'boolean') update.shop_enabled = shop_enabled;
  if (typeof osint_enabled === 'boolean') update.osint_enabled = osint_enabled;
  if (!('shop_enabled' in update) && !('osint_enabled' in update)) {
    return res.status(400).json({ error: 'Rien à mettre à jour.' });
  }

  const { data, error } = await supabase.from('site_status').update(update).eq('id', 1).select('*').single();
  if (error) return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });

  return res.json({ ok: true, shop_enabled: data.shop_enabled, osint_enabled: data.osint_enabled });
}
