// api/coupon.js — Coupon validation (POST) & secure tool download (GET)
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Les codes promo sont désormais stockés dans la table Supabase `promo_codes`
// (voir migration: 2026_promo_codes_migration.sql), plus dans process.env.
// Types supportés : 'refund' (reset credits_used), 'vip' (active vip_active),
// 'discount' (réservé aux futurs codes de réduction boutique).

// Mapping tool ID → actual filename in api/tools/
// Pour ajouter un fichier : placez le .zip dans api/tools/ et ajoutez l'entrée ici
const TOOL_FILES = {
  t1: 'sherlock..zip',
  t2: 'boubou-tortools.zip',
  t3: 'Boubou-nuker.zip',
  t5: 'boubou-dmall.zip',
  t6: 'boubou-nitrogen.zip',
  t8: 'boubougrabber.zip',
  t11: 'searcher.zip',
};
// t4 (Verity Suite) is no longer a download — it's a dedicated page linking
// out to the real site (see #page-veritysuite in index.html).
// t12 (CrosshairX) is too large for this repo (184MB, GitHub's limit is 100MB) —
// it's hosted externally (MediaFire) via CONFIG.tools[].downloadUrl instead.
// t9/t10 (Database pack, Discord vocal) sont des avantages Discord, pas des fichiers —
// ajouter leur id ici seulement si un vrai fichier VIP est ajouté un jour.
const VIP_TOOLS = [];

export default async function handler(req, res) {
  // ── GET: Secure tool download (inchangé) ──
  if (req.method === 'GET') {
    const { toolId, token } = req.query;
    if (!toolId) return res.status(400).json({ error: 'Paramètre toolId requis.' });

    const filename = TOOL_FILES[toolId];
    if (!filename) return res.status(404).json({ error: 'Fichier introuvable pour cet outil.' });

    if (VIP_TOOLS.includes(toolId)) {
      if (!token) return res.status(401).json({ error: 'Authentification requise.' });
      const userId = verifySession(token);
      if (!userId) return res.status(401).json({ error: 'Session invalide.' });

      const { data: user, error } = await supabase
        .from('users')
        .select('vip_active, role')
        .eq('id', userId)
        .single();

      if (error || !user) return res.status(401).json({ error: 'Utilisateur introuvable.' });
      if (!user.vip_active && user.role !== 'dev') {
        return res.status(403).json({ error: '🔒 Accès Premium — abonnement VIP requis.' });
      }
    }

    const filePath = path.join(process.cwd(), 'api', 'tools', filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Fichier non trouvé.' });

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', stat.size);
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }

  // ── POST: Coupon validation ──
  if (req.method !== 'POST') return res.status(405).end();
  const { token, code } = req.body;
  if (!code) return res.status(400).json({ error: 'Paramètres manquants.' });

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  const upperCode = code.toUpperCase().trim();
  const { data: user } = await supabase.from('users').select('*').eq('id', user_id).single();
  if (!user) return res.status(401).json({ error: 'Non autorisé.' });

  // Recherche du code en base : actif et non expiré.
  // (starts_at et max_uses sont revérifiés juste après, car PostgREST ne permet
  // pas de comparer deux colonnes entre elles dans un filtre .or())
  const nowIso = new Date().toISOString();
  const { data: coupon, error: couponError } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', upperCode)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .maybeSingle();

  if (couponError || !coupon) return res.status(400).json({ error: 'Code invalide.' });

  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    return res.status(400).json({ error: 'Code invalide.' });
  }
  if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
    return res.status(400).json({ error: 'Code invalide.' });
  }

  // Discount codes (order-page promo field) are reusable on every order —
  // only refund/vip codes are limited to one redemption per account.
  const codeKey = `${upperCode}_${user.id}`;
  if (coupon.type !== 'discount' && (user.used_codes||[]).includes(codeKey)) {
    return res.status(400).json({ error: 'Code invalide.' });
  }

  let update = coupon.type === 'discount' ? {} : { used_codes: [...(user.used_codes||[]), codeKey] };

  if (coupon.type === 'refund') {
    const period = Math.floor((Date.now() - new Date('2026-01-01T00:00:00Z').getTime()) / (48 * 3600 * 1000));
    const left = (user.credits_max||5) - (user.credits_used||0);
    if (left > 0) return res.status(400).json({ error: 'Vous avez encore des crédits.' });
    update.credits_used = 0;
    update.credits_period = period;
  } else if (coupon.type === 'vip') {
    update.vip_active = true;
  }
  // 'discount' : pas de mutation directe sur users ici — réservé au futur flow boutique.

  // Incrémentation atomique de l'usage (revérifie is_active/max_uses côté DB
  // pour éviter toute race condition entre deux requêtes simultanées).
  const { data: usageOk, error: usageError } = await supabase.rpc('increment_promo_code_usage', {
    p_code_id: coupon.id,
  });
  if (usageError || !usageOk) return res.status(400).json({ error: 'Code invalide.' });

  const { data: updated, error: updateError } = await supabase.from('users').update(update).eq('id', user.id)
    .select('*').single();
  if (updateError || !updated) return res.status(500).json({ error: 'Erreur lors de l\'application du code.' });

  const response = { ok: true, type: coupon.type, user: safeUser(updated) };
  if (coupon.type === 'discount') {
    response.discount_percent = coupon.discount_percent;
    response.plan_id = coupon.plan_id;
  }
  return res.json(response);
}

function safeUser(u) {
  if (!u) return null;
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
    role: u.role || 'user'
  };
}