// api/analytics-summary.js — staff-only aggregated analytics (reads analytics_events)
// Two modes:
//  - no `range` in body → legacy fixed-window summary (used by the compact Settings card)
//  - `range` given ('24h'|'7d'|'30d'|'60d'|'180d'|'360d'|'all') → full breakdown with a
//    bucketed time series (hour/day/week/month, picked automatically) for the dedicated
//    analytics page's chart.
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const RANGE_SINCE = {
  '24h':  () => new Date(Date.now() - 24 * 3600 * 1000),
  '7d':   () => new Date(Date.now() - 7 * 24 * 3600 * 1000),
  '30d':  () => new Date(Date.now() - 30 * 24 * 3600 * 1000),
  '60d':  () => new Date(Date.now() - 60 * 24 * 3600 * 1000),
  '180d': () => new Date(Date.now() - 180 * 24 * 3600 * 1000),
  '360d': () => new Date(Date.now() - 360 * 24 * 3600 * 1000),
};
const RANGE_GRANULARITY = {
  '24h': 'hour', '7d': 'day', '30d': 'day', '60d': 'day',
  '180d': 'week', '360d': 'month', 'all': 'month',
};
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

function bucketKey(date, granularity) {
  const d = new Date(date);
  if (granularity === 'hour') return d.toISOString().slice(0, 13) + ':00';
  if (granularity === 'day') return d.toISOString().slice(0, 10);
  if (granularity === 'week') {
    const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - dow);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 7); // month YYYY-MM
}

function formatLabel(key, granularity) {
  if (granularity === 'hour') return key.slice(11, 13) + 'h';
  if (granularity === 'day' || granularity === 'week') {
    const [, m, dd] = key.split('-');
    return `${dd}/${m}`;
  }
  const [y, m] = key.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

function generateBucketKeys(sinceDate, granularity) {
  const keys = [];
  const now = new Date();
  if (granularity === 'hour') {
    const d = new Date(sinceDate); d.setUTCMinutes(0, 0, 0);
    while (d <= now) { keys.push(bucketKey(d, 'hour')); d.setUTCHours(d.getUTCHours() + 1); }
  } else if (granularity === 'day') {
    const d = new Date(sinceDate); d.setUTCHours(0, 0, 0, 0);
    while (d <= now) { keys.push(bucketKey(d, 'day')); d.setUTCDate(d.getUTCDate() + 1); }
  } else if (granularity === 'week') {
    const d = new Date(bucketKey(sinceDate, 'week'));
    while (d <= now) { keys.push(bucketKey(d, 'week')); d.setUTCDate(d.getUTCDate() + 7); }
  } else {
    const d = new Date(sinceDate); d.setUTCDate(1); d.setUTCHours(0, 0, 0, 0);
    while (d <= now) { keys.push(bucketKey(d, 'month')); d.setUTCMonth(d.getUTCMonth() + 1); }
  }
  return keys;
}

async function fetchEventsSince(iso, limit = 20000) {
  const { data } = await supabase.from('analytics_events')
    .select('event_type, page, session_id, created_at')
    .gte('created_at', iso)
    .order('created_at', { ascending: true })
    .limit(limit);
  return data || [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, range, page } = req.body || {};

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const { data: user } = await supabase.from('users').select('role').eq('id', user_id).single();
  if (!user || (user.role !== 'dev' && user.role !== 'admin')) return res.status(403).json({ error: 'Accès réservé au staff.' });

  if (range) return handleRange(res, range, page);
  return handleSummary(res);
}

async function handleSummary(res) {
  const now = Date.now();
  const since24h = new Date(now - 24 * 3600 * 1000).toISOString();
  const since7d  = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  const since30d = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
  const events30d = await fetchEventsSince(since30d);

  const pv24h = events30d.filter(e => e.event_type === 'pageview' && e.created_at >= since24h).length;
  const pv7d  = events30d.filter(e => e.event_type === 'pageview' && e.created_at >= since7d).length;
  const pv30d = events30d.filter(e => e.event_type === 'pageview').length;
  const search24h = events30d.filter(e => e.event_type === 'search' && e.created_at >= since24h).length;
  const search7d  = events30d.filter(e => e.event_type === 'search' && e.created_at >= since7d).length;
  const signup7d  = events30d.filter(e => e.event_type === 'signup' && e.created_at >= since7d).length;
  const login7d   = events30d.filter(e => e.event_type === 'login'  && e.created_at >= since7d).length;
  const uniq24h = new Set(events30d.filter(e => e.event_type === 'pageview' && e.created_at >= since24h).map(e => e.session_id)).size;
  const uniq7d  = new Set(events30d.filter(e => e.event_type === 'pageview' && e.created_at >= since7d).map(e => e.session_id)).size;

  const pageCounts = {};
  events30d.filter(e => e.event_type === 'pageview' && e.created_at >= since7d).forEach(e => { pageCounts[e.page] = (pageCounts[e.page] || 0) + 1; });
  const topPages7d = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, count]) => ({ page, count }));

  return res.json({
    ok: true,
    pageviews: { last24h: pv24h, last7d: pv7d, last30d: pv30d },
    searches: { last24h: search24h, last7d: search7d },
    signups7d: signup7d,
    logins7d: login7d,
    uniqueVisitors: { last24h: uniq24h, last7d: uniq7d },
    topPages7d,
  });
}

async function handleRange(res, range, pageFilter) {
  const granularity = RANGE_GRANULARITY[range] || 'day';
  let sinceDate;
  if (range === 'all') {
    const { data: earliest } = await supabase.from('analytics_events').select('created_at').order('created_at', { ascending: true }).limit(1).single();
    sinceDate = earliest ? new Date(earliest.created_at) : new Date();
  } else {
    sinceDate = (RANGE_SINCE[range] || RANGE_SINCE['7d'])();
  }
  const since = sinceDate.toISOString();

  const events = await fetchEventsSince(since);
  const pageviews = events.filter(e => e.event_type === 'pageview' && (!pageFilter || e.page === pageFilter));
  const searches = events.filter(e => e.event_type === 'search');
  const signupEvents = events.filter(e => e.event_type === 'signup');
  const loginEvents = events.filter(e => e.event_type === 'login');
  const signups = signupEvents.length;
  const logins = loginEvents.length;
  const uniqueVisitors = new Set(pageviews.map(e => e.session_id)).size;

  const buckets = {};
  const emptyBucket = () => ({ pageviews: 0, searches: 0, signups: 0, logins: 0, sessions: new Set() });
  pageviews.forEach(e => {
    const k = bucketKey(e.created_at, granularity);
    const b = buckets[k] || (buckets[k] = emptyBucket());
    b.pageviews++;
    if (e.session_id) b.sessions.add(e.session_id);
  });
  searches.forEach(e => {
    const k = bucketKey(e.created_at, granularity);
    (buckets[k] || (buckets[k] = emptyBucket())).searches++;
  });
  signupEvents.forEach(e => {
    const k = bucketKey(e.created_at, granularity);
    (buckets[k] || (buckets[k] = emptyBucket())).signups++;
  });
  loginEvents.forEach(e => {
    const k = bucketKey(e.created_at, granularity);
    (buckets[k] || (buckets[k] = emptyBucket())).logins++;
  });

  const allKeys = generateBucketKeys(sinceDate, granularity);
  const series = allKeys.map(k => ({
    key: k,
    label: formatLabel(k, granularity),
    pageviews: (buckets[k] && buckets[k].pageviews) || 0,
    searches: (buckets[k] && buckets[k].searches) || 0,
    uniqueVisitors: (buckets[k] && buckets[k].sessions.size) || 0,
    signups: (buckets[k] && buckets[k].signups) || 0,
    logins: (buckets[k] && buckets[k].logins) || 0,
  }));

  const pageCounts = {};
  events.filter(e => e.event_type === 'pageview').forEach(e => { pageCounts[e.page] = (pageCounts[e.page] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count }));

  return res.json({
    ok: true,
    range,
    granularity,
    pageFilter: pageFilter || null,
    totals: { pageviews: pageviews.length, uniqueVisitors, searches: searches.length, signups, logins },
    series,
    topPages,
  });
}
