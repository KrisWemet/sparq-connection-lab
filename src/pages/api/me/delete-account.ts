import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getAdminClient } from '@/lib/server/supabase-admin';

/**
 * Permanently deletes the signed-in person's account and everything stored
 * about them. Deleting the auth user cascades to every table keyed on them;
 * the few references without a cascade are cleared first. A linked partner
 * keeps their own account and private data; the shared space ends.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if ((req.body || {}).confirm !== 'DELETE') return res.status(400).json({ error: 'Confirmation required' });
  const admin = getAdminClient();
  if (!admin) return res.status(503).json({ error: 'Not available right now' });

  const uid = ctx.userId;
  // References that don't cascade and would block the delete.
  const steps = [
    admin.from('profiles').update({ partner_id: null }).eq('partner_id', uid),
    admin.from('notifications').delete().eq('sender_id', uid),
    admin.from('system_settings').update({ updated_by: null }).eq('updated_by', uid),
  ];
  for (const step of steps) {
    const { error } = await step;
    if (error) {
      console.error('[delete-account] cleanup failed', error.message);
      return res.status(500).json({ error: 'Could not delete account' });
    }
  }

  const { error } = await admin.auth.admin.deleteUser(uid);
  if (error) {
    console.error('[delete-account] delete failed', error.message);
    return res.status(500).json({ error: 'Could not delete account' });
  }
  return res.status(200).json({ deleted: true });
}
