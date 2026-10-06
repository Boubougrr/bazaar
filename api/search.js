import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
const PERIOD_MS = 48 * 3600 * 1000;
function getCurrentPeriod() { return Math.floor((Date.now() - EPOCH) / PERIOD_MS); }
function getPeriodEnd(period) { return EPOCH + (period + 1) * PERIOD_MS; }

// Nouvelle API temporaire (brixhub.ru) - recherche par nom_famille + ville
const BRIXHUB_API = 'https://api.brixhub.ru/api/v1/search';
const BRIXHUB_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

function parseBrixhubError(status, text) {
  const looksLikeHtml = /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text);
  if (looksLikeHtml) {
    return 'Le service de recherche est temporairement bloqué par une protection anti-bot. Réessayez dans quelques instants.';
  }
  try {
    const errJson = JSON.parse(text);
    return errJson.message || errJson.error || ('Erreur ' + status);
  } catch (e) {
    return text || ('Erreur ' + status);
  }
}

// Types supportés par l'ancienne API (maintenant indisponible)
const LEGACY_TYPES = ['email', 'username', 'phone', 'ip', 'domain', 'hash', 'url', 'machine_id'];
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

// Nouveau type pour la recherche PagesBlanches (nom + ville)
const NEW_API_TYPES = ['pages_blanches', 'name_city'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action, token, query, mode, nom_famille, ville, per_page } = req.body;
  // Automated mode always auto-detects the target type server-side, regardless
  // of what the client sends — Manual mode costs 1 credit, Automated costs 2.
  const type = mode === 'automated' ? 'auto' : req.body.type;
  const cost = mode === 'automated' ? 2 : 1;

  // Free, public health check — no session/credits needed
  if (action === 'status') {
    return res.json({ ok: true, status: { operational: true, message: 'Service opérationnel (API temporaire)' } });
  }

  // Vérifier si c'est une recherche PagesBlanches (nouvelle API)
  const isPagesBlanches = type === 'pages_blanches' || type === 'name_city';
  
  // Pour PagesBlanches, on a besoin de nom_famille et ville
  if (isPagesBlanches) {
    if (!nom_famille || !ville) {
      return res.status(400).json({ error: 'Nom de famille et ville sont requis pour cette recherche.' });
    }
  } else if (!query) {
    return res.status(400).json({ error: 'Paramètres manquants.' });
  }

  const { data: status } = await supabase.from('site_status').select('osint_enabled').eq('id', 1).single();
  if (status && status.osint_enabled === false) {
    return res.status(503).json({ error: 'La recherche est temporairement désactivée par le staff.' });
  }

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

  if (isPagesBlanches) {
    // Nouvelle API brixhub.ru - recherche par nom_famille + ville
    category = 'pages_blanches';
    try {
      const body = {
        nom_famille: nom_famille.trim(),
        ville: ville.trim(),
        per_page: per_page || 20,
      };
      const response = await fetch(BRIXHUB_API, {
        method: 'POST',
        headers: BRIXHUB_HEADERS,
        body: JSON.stringify(body),
      });
      const text = await response.text();
      if (response.ok) {
        const data = JSON.parse(text);
        // L'API retourne {status, message, data: {results, meta}, timestamp}
        searchData = data.data?.results || data.results || [];
      } else {
        return res.status(502).json({ error: parseBrixhubError(response.status, text) });
      }
    } catch (e) {
      return res.status(502).json({ error: 'Impossible de contacter l\'API de recherche: ' + e.message });
    }
  } else {
    // Ancienne API (see-know.icu) - en maintenance
    return res.status(503).json({ 
      error: 'Les autres types de recherche (email, téléphone, IP, Discord, etc.) sont temporairement indisponibles car le fournisseur d\'API est en maintenance. Seule la recherche "PagesBlanches" (nom + ville) fonctionne pour le moment.' 
    });
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
