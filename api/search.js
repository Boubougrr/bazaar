import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SEEK_API_KEY = process.env.SEEK_API_KEY;

const EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
const PERIOD_MS = 48 * 3600 * 1000;
function getCurrentPeriod() { return Math.floor((Date.now() - EPOCH) / PERIOD_MS); }
function getPeriodEnd(period) { return EPOCH + (period + 1) * PERIOD_MS; }
const SEEK_API = 'https://see-know.eu/api/v1';

const TYPE_MAP = {
  'email': 'email',
  'username': 'username',
  'phone': 'phone',
  'ip': 'ip',
  'domain': 'domain',
  'name': 'name',
  'hash': 'hash',
  'url': 'url',
  'machine_id': 'machine_id',
};

// Specialized single-purpose lookups (each hits its own see-know.eu GET endpoint
// instead of the generic /search+/stealer flow used by TYPE_MAP above).
const SPECIAL_ENDPOINTS = {
  discord_user:     { path: '/discord/user',       param: 'discord_id' },
  discord_roblox:   { path: '/discord/to-roblox',  param: 'discord_id' },
  gh:               { path: '/username/github',    param: 'username' },
  twitter:          { path: '/username/twitter',   param: 'username' },
  tiktok:           { path: '/username/tiktok',    param: 'username' },
  reddit:           { path: '/username/reddit',    param: 'username' },
  social:           { path: '/username/social',    param: 'username' },
  username_history: { path: '/username/history',   param: 'username' },
  ip_intel:         { path: '/network/ip',         param: 'ip' },
  email_check:      { path: '/network/email-check',param: 'email' },
  phone_intel:      { path: '/network/phone',      param: 'phone' },
  domain_intel:     { path: '/domain/intel',       param: 'domain' },
  whois:            { path: '/domain/whois',       param: 'domain' },
  xbox:             { path: '/gaming/xbox',        param: 'gamertag' },
  roblox:           { path: '/gaming/roblox',      param: 'username' },
  minecraft:        { path: '/gaming/minecraft',   param: 'username' },
};

function detectType(query) {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query) && query.split('.').every(n => +n <= 255)) return 'ip';
  if (/^[0-9a-fA-F:]{2,}:[0-9a-fA-F:]{2,}$/.test(query)) return 'ip';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) return 'email';
  if (/^\d{17,19}$/.test(query)) return 'username';
  if (/^.+#\d{4}$/.test(query)) return 'username';
  if (/^\+?[\d\s\-().]{7,}$/.test(query) && (query.match(/\d/g) || []).length >= 7) return 'phone';
  if (/^[a-zA-Z0-9._\-]{3,}$/.test(query)) return 'username';
  return 'email';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action, token, query, mode } = req.body;
  // Automated mode always auto-detects the target type server-side, regardless
  // of what the client sends — Manual mode costs 1 credit, Automated costs 2.
  const type = mode === 'automated' ? 'auto' : req.body.type;
  const cost = mode === 'automated' ? 2 : 1;

  // Free, public health check — no session/credits needed, just proxies see-know.eu's own status.
  if (action === 'status') {
    try {
      const r = await fetch(`${SEEK_API}/status`, { headers: { 'X-API-Key': SEEK_API_KEY } });
      const data = await r.json();
      return res.json({ ok: true, status: data });
    } catch (e) {
      return res.status(502).json({ error: 'Impossible de contacter le service.' });
    }
  }

  if (!query) return res.status(400).json({ error: 'Paramètres manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user } = await supabase.from('users').select('*').eq('id', user_id).single();
  if (!user) return res.status(401).json({ error: 'Non autorisé.' });

  // Global 48h period check
  const period = getCurrentPeriod();
  const nextReset = getPeriodEnd(period);
  let creditsUsed = user.credits_used || 0;
  let creditsPeriod = user.credits_period || 0;

  if (creditsPeriod !== period) {
    creditsUsed = 0;
    creditsPeriod = period;
    await supabase.from('users').update({
      credits_used: 0,
      credits_period: period,
    }).eq('id', user.id);
  }

  const max = user.credits_max || 5;
  const left = max - creditsUsed;
  if (left < cost) return res.status(429).json({ error: 'Quota épuisé. Recharge tes crédits ou passe à un abonnement supérieur.' });

  let searchData = null;
  let stealerData = null;
  let category = null;

  const special = SPECIAL_ENDPOINTS[type];

  if (special) {
    category = type;
    try {
      const url = `${SEEK_API}${special.path}?${special.param}=${encodeURIComponent(query)}`;
      const specialRes = await fetch(url, { headers: { 'X-API-Key': SEEK_API_KEY } });
      if (specialRes.ok) {
        searchData = await specialRes.json();
      } else {
        const errText = await specialRes.text();
        let apiMsg = errText || 'Erreur ' + specialRes.status;
        try { const errJson = JSON.parse(errText); apiMsg = errJson.message || errJson.error || apiMsg; } catch (e) {}
        return res.status(502).json({ error: apiMsg });
      }
    } catch (e) {
      return res.status(502).json({ error: 'Impossible de contacter l\'API de recherche: ' + e.message });
    }
  } else {
    const apiType = TYPE_MAP[type] || (type === 'auto' ? detectType(query) : type);

    try {
      const searchRes = await fetch(`${SEEK_API}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type: apiType, limit: 100 }),
      });
      if (searchRes.ok) {
        searchData = await searchRes.json();
      } else {
        const errText = await searchRes.text();
        let apiMsg = errText || 'Erreur ' + searchRes.status;
        try { const errJson = JSON.parse(errText); apiMsg = errJson.message || errJson.error || apiMsg; } catch (e) {}
        return res.status(502).json({ error: apiMsg });
      }
    } catch (e) {
      return res.status(502).json({ error: 'Impossible de contacter l\'API de recherche: ' + e.message });
    }

    if (apiType === 'domain') {
      try {
        const stealerRes = await fetch(`${SEEK_API}/stealer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, type: 'domain' }),
        });
        if (stealerRes.ok) {
          stealerData = await stealerRes.json();
        }
      } catch (e) {}
    }
  }

  const now = new Date();
  const wk = `w_${now.getFullYear()}_${getWeek(now)}`;
  const mk = `m_${now.getFullYear()}_${now.getMonth()}`;
  const weekS = { ...(user.week_searches || {}), [wk]: ((user.week_searches || {})[wk] || 0) + 1 };
  const monthS = { ...(user.month_searches || {}), [mk]: ((user.month_searches || {})[mk] || 0) + 1 };
  const newUsed = creditsUsed + cost;

  const { data: updatedUser } = await supabase.from('users').update({
    credits_used: newUsed,
    credits_period: period,
    total_searches: (user.total_searches || 0) + 1,
    week_searches: weekS,
    month_searches: monthS,
  }).eq('id', user.id).select('*').single();

  return res.json({
    ok: true,
    user: safeUser(updatedUser || user),
    credits_left: Math.max(0, max - newUsed),
    next_reset: nextReset,
    results: searchData,
    stealer_results: stealerData,
    category,
  });
}

function safeUser(u) {
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
    plan: u.plan || 'standard',
    credits_max: u.credits_max || 5,
    credits_used: u.credits_used || 0,
    credits_period: u.credits_period || 0,
    credits_exhausted_at: u.credits_exhausted_at,
    vip_active: u.vip_active || false,
    total_searches: u.total_searches || 0,
    login_count: u.login_count || 1,
    joined_at: u.joined_at,
    last_login: u.last_login,
    week_searches: u.week_searches || {},
    month_searches: u.month_searches || {},
    role: u.role || 'user',
  };
}

function getWeek(d) {
  const s = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7);
}
