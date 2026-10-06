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

// ── API temporaire brixhub.ru ────────────────────────────────────
// Suite à la maintenance du fournisseur principal, brixhub expose un
// endpoint unique et sans clé : POST /api/v1/search. Toutes les
// recherches du site passent désormais par là. Limites annoncées par le
// fournisseur : 300 req/min et 20 000 req/jour par IP, per_page <= 100.
// Voir BRIXHUB_FIELD_MAP pour le correspondance type de recherche → champ.
const BRIXHUB_URL = 'https://api.brixhub.ru/api/v1/search';
const BRIXHUB_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
const PER_PAGE_MAX = 100;

// Champs exposés par l'API temporaire. `single` = la requête part dans ce
// champ, `extra` = champs additionnels (PagesBlanches = nom + ville).
const TYPE_FIELDS = {
  email:            { field: 'email' },
  email_check:      { field: 'email' },
  phone:            { field: 'telephone' },
  phone_intel:      { field: 'telephone' },
  ip:               { field: 'adresse_ip' },
  ip_intel:         { field: 'adresse_ip' },
  name:             { field: 'nom_affichage' },
  lastname:         { field: 'nom_famille' },
  username_history: { field: 'nom_utilisateur' },
  gh:               { field: 'nom_utilisateur' },
  twitter:          { field: 'nom_utilisateur' },
  tiktok:           { field: 'nom_utilisateur' },
  reddit:           { field: 'nom_utilisateur' },
  social:           { field: 'nom_utilisateur' },
  pages_blanches:   { field: 'nom_famille', extra: 'ville' },
  name_city:        { field: 'nom_famille', extra: 'ville' },
};

// Types sans équivalent dans l'API temporaire : le fournisseur n'expose ni
// identifiant Discord / Xbox / Steam, ni domaine, ni empreinte machine.
// On les refuse explicitement plutôt que de renvoyer un 0 résultat trompeur.
const UNSUPPORTED_TYPES = {
  discord_user:   'Discord',
  discord_roblox: 'Discord → Roblox',
  roblox:         'Roblox',
  xbox:           'Xbox',
  minecraft:      'Minecraft',
  machine_id:     'Machine ID',
  domain_intel:   'Domain Intel',
  whois:          'WHOIS',
};

const UNSUPPORTED_MSG = 'La recherche « {label} » n\'est pas couverte par l\'API temporaire du fournisseur (maintenance en cours). Types disponibles pour le moment : identité (nom + ville), email, téléphone, IP et pseudo.';

// Détection serveur du type d'une saisie libre (mode Automated). Le client
// n'a pas son mot à dire : c'est le serveur qui décide du champ envoyé.
function autoDetectField(value) {
  const v = String(value).trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email';
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n => +n <= 255)) return 'adresse_ip';
  if (/^\+?[\d\s\-().]{7,}$/.test(v) && (v.match(/\d/g) || []).length >= 7) return 'telephone';
  if (/\s/.test(v)) return 'nom_affichage';
  return 'nom_utilisateur';
}

// Champs de travail de l'API, sans intérêt pour l'utilisateur : les clés
// "_*" sont des identifiants internes de recherche, telephone_digits est
// la version normalisée de telephone.
const INTERNAL_FIELDS = new Set(['telephone_digits']);

// L'API renvoie des champs internes préfixés par "_" (_all_text, _es_ids,
// _dedup_key, _source_files) qui n'ont aucun intérêt pour l'utilisateur.
// On les supprime, et on promeut la provenance en champs propres.
function normalizeResult(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith('_') || INTERNAL_FIELDS.has(k)) continue;
    if (v === null || v === undefined || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  if (Array.isArray(raw._sources) && raw._sources.length) {
    out.sources = [...new Set(raw._sources)];
    delete out._sources;
  }
  if (typeof raw._confidence === 'number') out.confidence = raw._confidence;
  return out;
}

function parseUpstreamError(status, text, retryAfter) {
  let payload = null;
  try { payload = JSON.parse(text); } catch (e) { /* réponse non JSON */ }

  if (status === 429) {
    const wait = retryAfter ? ` Retry after ${retryAfter}s.` : '';
    return {
      code: 429,
      error: `Limite de requêtes atteinte sur l'API du fournisseur. Réessaie dans quelques instants.${wait}`,
    };
  }
  if (status === 503) {
    return {
      code: 503,
      error: "Moteur de recherche du fournisseur temporairement indisponible (maintenance). Réessaie dans une minute.",
    };
  }
  if (status === 400) {
    return {
      code: 400,
      error: payload?.message || 'Requête invalide : vérifie les champs saisis et la profondeur de pagination.',
    };
  }
  if (/^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
    return { code: 502, error: "Le service de recherche est bloqué par une protection anti-bot. Réessaie dans quelques instants." };
  }
  return { code: 502, error: payload?.message || `Erreur ${status} du fournisseur de recherche.` };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    action, token, query, mode, type: reqType,
    nom_famille, ville, page, per_page, flexible,
  } = req.body || {};

  // Free, public health check — no session/credits needed
  if (action === 'status') {
    return res.json({ ok: true, status: { operational: true, message: 'Service opérationnel (API temporaire)' } });
  }

  const isAutomated = mode === 'automated';
  // Automated mode always auto-detects the target field server-side, regardless
  // of what the client sends — Manual mode costs 1 credit, Automated costs 2.
  const type = isAutomated ? 'auto' : reqType;
  const cost = isAutomated ? 2 : 1;

  if (!isAutomated && UNSUPPORTED_TYPES[reqType]) {
    return res.status(503).json({
      error: UNSUPPORTED_MSG.replace('{label}', UNSUPPORTED_TYPES[reqType]),
      unsupported: true,
    });
  }

  // Assemble the payload sent to brixhub, keyed by its own field names.
  let searchBody = null;
  let category = null;

  if (isAutomated) {
    const q = String(query || '').trim();
    if (!q) return res.status(400).json({ error: 'Paramètres manquants.' });
    searchBody = { [autoDetectField(q)]: q };
    category = 'auto';
  } else {
    const mapping = TYPE_FIELDS[reqType];
    if (!mapping) {
      return res.status(400).json({ error: 'Type de recherche inconnu.' });
    }
    searchBody = {};

    if (mapping.extra === 'ville') {
      if (!nom_famille || !ville) {
        return res.status(400).json({ error: 'Nom de famille et ville sont requis pour cette recherche.' });
      }
      searchBody[mapping.field] = String(nom_famille).trim();
      searchBody[mapping.extra] = String(ville).trim();
    } else {
      if (!query) return res.status(400).json({ error: 'Paramètres manquants.' });
      searchBody[mapping.field] = String(query).trim();
    }
    category = mapping.extra === 'ville' ? 'pages_blanches' : reqType;
  }

  searchBody.per_page = Math.min(Math.max(parseInt(per_page, 10) || 20, 1), PER_PAGE_MAX);
  const wantedPage = parseInt(page, 10);
  if (Number.isFinite(wantedPage) && wantedPage > 0) searchBody.page = wantedPage;
  if (flexible) searchBody.flexible = true;

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

  // ── Appel au fournisseur temporaire ──────────────────────────
  let upstream;
  try {
    upstream = await fetch(BRIXHUB_URL, {
      method: 'POST',
      headers: BRIXHUB_HEADERS,
      body: JSON.stringify(searchBody),
    });
  } catch (e) {
    return res.status(502).json({ error: "Impossible de contacter l'API de recherche : " + e.message });
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    const { code, error } = parseUpstreamError(upstream.status, text, upstream.headers.get('retry-after'));
    return res.status(code).json({ error });
  }

  let payload;
  try { payload = JSON.parse(text); }
  catch (e) { return res.status(502).json({ error: 'Réponse illisible du fournisseur de recherche.' }); }

  const rawResults = payload?.data?.results || [];
  const results = rawResults.map(normalizeResult);
  const meta = payload?.meta || {};

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
    results,
    category,
    meta: {
      total: meta.total ?? results.length,
      page: meta.page ?? (searchBody.page || 1),
      pages: meta.pages ?? 1,
      per_page: meta.per_page ?? searchBody.per_page,
      total_is_capped: !!meta.total_is_capped,
      query: meta.query || searchBody,
      took_ms: meta.took_ms,
      maintenance: meta.maintenance !== false,
    },
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