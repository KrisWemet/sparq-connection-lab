import type { NextApiRequest, NextApiResponse } from 'next';
import {
  loadUserState,
  determineCheckin,
  wasDeliveredToday,
  recordCheckin,
} from '@/lib/peterCheckinService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body as { userId: string };

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Load current user state
    const state = await loadUserState(userId);
    if (!state) {
      return res.status(200).json({ checkin: null });
    }

    // Determine what (if any) checkin to show
    const checkin = determineCheckin(state);
    if (!checkin) {
      return res.status(200).json({ checkin: null });
    }

    // Don't deliver the same type twice in one day
    const alreadyDelivered = await wasDeliveredToday(userId, checkin.type);
    if (alreadyDelivered) {
      return res.status(200).json({ checkin: null });
    }

    // Record and return
    await recordCheckin(userId, checkin, state.currentDay);

    return res.status(200).json({ checkin });
  } catch (error) {
    console.error('Checkin error:', error);
    return res.status(500).json({ error: 'Checkin failed' });
  }
}
