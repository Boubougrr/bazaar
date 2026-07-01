// api/upload-avatar.js
import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_session.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, imageBase64, mimeType = 'image/jpeg' } = req.body;

  const user_id = verifySession(token);
  if (!user_id) return res.status(401).json({ error: 'Non autorisé.' });
  if (!imageBase64) return res.status(400).json({ error: 'Image manquante.' });

  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 2 * 1024 * 1024)
    return res.status(400).json({ error: 'Image trop grande (max 2MB).' });

  const ext = mimeType.split('/')[1] || 'jpg';
  const filename = `${user_id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, buffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return res.status(500).json({ error: 'Erreur upload image.' });
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filename);

  await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user_id);
  // Sync avatar to all existing reviews from this user
  await supabase.from('reviews').update({ avatar_url: publicUrl }).eq('user_id', user_id);

  return res.json({ ok: true, avatar_url: publicUrl });
}
