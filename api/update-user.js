// api/update-user.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, pseudo, email, new_password, verify_password } = req.body;
  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });

  // Get current user to verify password
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (userError || !user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

  // Verify password if pseudo or email is changing
  if (pseudo || email) {
    if (!verify_password) return res.status(400).json({ error: 'Mot de passe requis pour confirmer les changements.' });
    const valid = await bcrypt.compare(verify_password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect.' });
  }

  const update = {};
  if (pseudo && pseudo.length >= 2) update.pseudo = pseudo;
  if (email && email.includes('@')) {
    // Check if email already exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing && existing.id !== user_id) return res.status(400).json({ error: 'Email déjà utilisé.' });
    update.email = email;
  }
  if (new_password) {
    if (new_password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court.' });
    update.password_hash = await bcrypt.hash(new_password, 10);
  }

  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Rien à mettre à jour.' });

  const { data, error } = await supabase.from('users').update(update).eq('id', user_id).select('*').single();
  if (error) return res.status(400).json({ error: 'Erreur lors de la mise à jour.' });

  return res.json({ ok: true, user: safeUser(data) });
}

function safeUser(u) {
  if (!u) return null;
  return {
    id: u.id, email: u.email, pseudo: u.pseudo,
    plan: u.plan || 'standard', 
    credits_max: u.credits_max || 5,
    credits_used: u.credits_used || 0, 
    credits_exhausted_at: u.credits_exhausted_at,
    vip_active: u.vip_active || false, 
    total_searches: u.total_searches || 0,
    login_count: u.login_count || 1, 
    joined_at: u.joined_at,
    last_login: u.last_login,
    role: u.role || 'user'
  };
}