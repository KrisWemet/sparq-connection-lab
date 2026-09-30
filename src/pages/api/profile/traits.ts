import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await ctx.supabase
      .from('profile_traits')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('confidence', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    if (req.query.include_partner !== 'true') {
      return res.status(200).json({ traits: data || [] });
    }

    // Fetch partner's conflict_style and love_language for personalized conflict guidance
    const { data: profileRow } = await ctx.supabase
      .from('profiles')
      .select('partner_id')
      .eq('user_id', ctx.userId)
      .maybeSingle();

    if (!profileRow?.partner_id) {
      return res.status(200).json({ traits: data || [], partner_traits: [] });
    }

    const { data: partnerTraits } = await ctx.supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, confidence')
      .eq('user_id', profileRow.partner_id)
      .in('trait_key', ['conflict_style', 'love_language'])
      .order('confidence', { ascending: false });

    return res.status(200).json({ traits: data || [], partner_traits: partnerTraits || [] });
  }

  if (req.method === 'PATCH') {
    const { trait_key, feedback } = req.body as {
      trait_key: string;
      feedback: 'yes' | 'not_really' | 'unsure';
    };

    if (!trait_key || !feedback) {
      return res.status(400).json({ error: 'trait_key and feedback are required' });
    }

    // Compute new effective_weight based on feedback
    const weightMap: Record<string, number> = {
      yes: 1.5,
      unsure: 1.0,
      not_really: 0.25,
    };

    if (!(feedback in weightMap)) {
      return res.status(400).json({ error: 'Invalid feedback value' });
    }
    const effectiveWeight = weightMap[feedback];

    // The user is the authority on themselves (constitution §2): "yes" turns
    // the hypothesis into a confirmed fact, "not really" retires it, and
    // "unsure" leaves it an open hypothesis. Inference never overrides these.
    const now = new Date().toISOString();
    const statusFields =
      feedback === 'yes'
        ? { status: 'confirmed', source: 'user_confirmed', confirmed_at: now }
        : feedback === 'not_really'
          ? { status: 'rejected', confirmed_at: now }
          : { status: 'hypothesis', confirmed_at: null };

    const { data, error } = await ctx.supabase
      .from('profile_traits')
      .update({
        user_feedback: feedback,
        effective_weight: effectiveWeight,
        ...statusFields,
        updated_at: now,
      })
      .eq('user_id', ctx.userId)
      .eq('trait_key', trait_key)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ trait: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
