import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT } from '@/lib/peterService';
import { stripMarkdown } from '@/lib/strip-markdown';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Rate limit: hard daily cap of 3 sessions per user per UTC day
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await ctx.supabase
      .from('rehearsal_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.userId)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if ((count ?? 0) >= 3) {
      return res.status(429).json({
        error: 'daily_limit_reached',
        message: "You've done 3 rehearsals today. Come back tomorrow — you've prepared enough for now.",
      });
    }

    // Check for abandoned session (completed=false and created within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: abandoned } = await ctx.supabase
      .from('rehearsal_sessions')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('completed', false)
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (abandoned) {
      const recoveryMessage = await peterChat({
        messages: [
          { role: 'system', content: PETER_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Last time we started a rehearsal. Looks like you didn't finish — want to start fresh with a new one, or try a different approach to the same topic? Reply as Peter with this message exactly, warmly: "Last time we started a rehearsal. Looks like you didn't finish — want to start fresh with a new one, or try a different approach to the same topic?"`,
          },
        ],
        maxTokens: 80,
      });

      return res.status(200).json({
        session_id: abandoned.id,
        peter_message: stripMarkdown(recoveryMessage).trim(),
        abandoned: true,
      });
    }

    // Create new session row
    const { data: newSession, error: insertError } = await ctx.supabase
      .from('rehearsal_sessions')
      .insert({ user_id: ctx.userId, completed: false })
      .select('id')
      .single();

    if (insertError || !newSession) {
      console.error('Rehearsal session insert error:', insertError);
      return res.status(500).json({ error: 'Peter is having a moment. Please try again.' });
    }

    // Generate Peter's first setup question
    const firstQuestion = await peterChat({
      messages: [
        { role: 'system', content: PETER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `You're about to help someone practice a hard conversation. This one takes a bit longer than their usual session — usually 5–8 minutes. Worth it.

Start with a warm acknowledgment that you're here to help them prepare, mention it takes a bit longer than usual, then ask: "What's the situation — what's been on your mind?"

Keep it to 2–3 sentences total.`,
        },
      ],
      maxTokens: 120,
    });

    return res.status(200).json({
      session_id: newSession.id,
      peter_message: stripMarkdown(firstQuestion).trim(),
    });
  } catch (err) {
    console.error('Rehearsal start error:', err);
    return res.status(500).json({ error: 'Peter is having a moment. Please try again.' });
  }
}
