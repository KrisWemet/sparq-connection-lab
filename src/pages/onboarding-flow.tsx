import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PeterChat } from '@/components/PeterChat';
import { PeterMessage } from '@/lib/peterService';
import { buildAuthedHeaders } from '@/lib/api-auth';

const COMPLETE_AFTER_TURNS = 5; // Complete after user's 5th message

const INITIAL_MESSAGE: PeterMessage = {
  role: 'assistant',
  content: "Hey there! I'm Peter 🦦 — your friendly otter guide here at Sparq.\n\nHere's how this works: every day for 14 days, I'll share a short story about a couple going through something real — plus one small action you can try with your partner that day. In the evening I'll check back in to hear how it went.\n\nIt's not therapy. It's more like having a friend who knows a thing or two about relationships, walking with you day by day. By Day 15, you'll unlock your own personal Skill Tree — deeper exercises built around what I've learned about you.\n\nBut first things first — what's your name?",
};

function getSystemOverride(turnNumber: number): string | undefined {
  if (turnNumber === 1) {
    return `You are Peter, a warm otter companion for relationship growth. The user just told you their name. Warmly acknowledge their name, then ask what brought them to Sparq today — what's going on in their relationship that made them want to try something new? Keep it conversational and warm, 2-3 sentences max. No clinical language.`;
  }
  if (turnNumber === 2) {
    return `You are Peter, a warm otter companion. The user just shared what brought them here. Reflect back what you heard with empathy, normalize whatever they shared, then ask: "Can you tell me about a moment recently with your partner — could be something sweet, or something that felt a little off?" Keep it warm and curious, 2-3 sentences.`;
  }
  if (turnNumber === 3) {
    return `You are Peter, a warm otter companion. The user just shared a specific moment. Acknowledge it thoughtfully. Then ask: "When things feel off between you two, what do you usually do — do you tend to talk it out right away, give it some space, or something else?" 2-3 sentences.`;
  }
  if (turnNumber === 4) {
    return `You are Peter, a warm otter companion. Reflect on what they shared about how they handle tension. Normalize it completely. Then ask: "And what about the good stuff — how does your partner usually show you they care? Or how do you like to show them?" Keep it light and warm, 2-3 sentences.`;
  }
  if (turnNumber >= 5) {
    return `You are Peter, a warm otter companion. You've now learned a lot about this person. Warmly reflect back what you've learned about them and their relationship in one sentence. Tell them you're excited to be their guide for the next 14 days. Explain that each morning you'll share a short story about a couple facing something real — and a small action they can try that day. Each evening you'll check back in. Say "I'll have your first story waiting for you in the morning!" Warm, exciting, 3-4 sentences total.`;
  }
  return undefined;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<PeterMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleUserMessage = async (text: string) => {
    if (isLoading || isComplete) return;

    const newTurn = turnCount + 1;
    const userMessage: PeterMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTurnCount(newTurn);
    setIsLoading(true);

    try {
      const systemOverride = getSystemOverride(newTurn);
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const response = await fetch('/api/peter/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: updatedMessages, systemOverride }),
      });

      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();

      const assistantMessage: PeterMessage = { role: 'assistant', content: data.message };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      if (newTurn >= COMPLETE_AFTER_TURNS) {
        await completeOnboarding(finalMessages);
      }
    } catch (err) {
      console.error('Peter chat error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Oops, my paws slipped! Can you say that again?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (conversationMessages: PeterMessage[]) => {
    if (!user) return;
    setIsComplete(true);

    try {
      // Silently analyze conversation for profile insights
      const analyzeHeaders = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const analyzeResponse = await fetch('/api/peter/analyze', {
        method: 'POST',
        headers: analyzeHeaders,
        body: JSON.stringify({ messages: conversationMessages }),
      });

      let insights = {};
      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        insights = analyzeData.insights || {};
      }

      // Store insights in user_insights table (only known columns)
      const ins = insights as any;
      const userInsightsRow: Record<string, any> = {
        user_id: user.id,
        onboarding_day: 1,
        last_analysis_at: new Date().toISOString(),
      };
      if (ins.attachment_style) userInsightsRow.attachment_style = ins.attachment_style;
      if (ins.love_language) userInsightsRow.love_language = ins.love_language;
      if (ins.conflict_style) userInsightsRow.conflict_style = ins.conflict_style;
      if (ins.emotional_state) userInsightsRow.emotional_state = ins.emotional_state;

      await supabase.from('user_insights').upsert(
        userInsightsRow,
        { onConflict: 'user_id' }
      );

      // Write inferred traits to profile_traits for the trait display UI
      const traitKeys = ['attachment_style', 'love_language', 'conflict_style'] as const;
      const validValues: Record<string, string[]> = {
        attachment_style: ['anxious', 'avoidant', 'disorganized', 'secure'],
        love_language: ['words', 'acts', 'gifts', 'time', 'touch'],
        conflict_style: ['avoidant', 'volatile', 'validating'],
      };
      for (const key of traitKeys) {
        const value = ins[key];
        if (!value || !validValues[key]?.includes(value)) continue;
        await supabase.from('profile_traits').upsert(
          {
            user_id: user.id,
            trait_key: key,
            inferred_value: value,
            confidence: 0.3,
            effective_weight: 1.0,
          },
          { onConflict: 'user_id,trait_key' }
        );
      }

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_name: 'onboarding_conversation_completed',
        event_props: {
          turns: COMPLETE_AFTER_TURNS,
          completed_at: new Date().toISOString(),
        },
      });

      // Mark user as onboarded so they go straight to dashboard on future logins
      await supabase
        .from('profiles')
        .update({ isonboarded: true, isOnboarded: true })
        .eq('id', user.id);
    } catch (err) {
      console.error('Onboarding completion error:', err);
    }

    // Don't auto-redirect — let the user read Peter's final message
    // and tap a button when they're ready
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xl animate-pulse">
          🦦
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm">
            🦦
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Peter</p>
            <p className="text-xs text-teal-600">Your relationship guide</p>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: COMPLETE_AFTER_TURNS }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < turnCount ? 'bg-teal-400 scale-110' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <PeterChat
          messages={messages}
          onUserMessage={handleUserMessage}
          isLoading={isLoading}
          placeholder="Type your reply to Peter..."
          inputDisabled={isComplete}
        />
      </div>

      {isComplete && (
        <div className="bg-white border-t border-gray-100 px-6 py-4 text-center">
          <button
            onClick={() => router.push('/dashboard?from=onboarding')}
            className="w-full py-3.5 rounded-2xl font-semibold text-white text-base shadow-sm transition-colors"
            style={{ backgroundColor: '#C86A58' }}
          >
            Let&apos;s get started →
          </button>
        </div>
      )}
    </div>
  );
}
