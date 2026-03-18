# Test Fixtures — Reusable Mock Data

Copy-paste ready fixtures for all test types. Import these into tests rather than defining mock data inline.

---

## Mock User Profiles

One profile per attachment style, plus edge cases.

```typescript
// src/test/fixtures/profiles.ts

export const PROFILE_ANXIOUS = {
  id: 'user-anxious-001',
  full_name: 'Alex Anxious',
  email: 'alex@test.sparq.app',
  gender: 'prefer-not-to-say' as const,
  relationship_type: 'monogamous' as const,
  avatar_url: null,
  partner_id: 'user-partner-001',
  subscription_tier: 'premium' as const,
  subscription_expiry: '2027-01-01T00:00:00Z',
  is_onboarded: true,
  last_active: new Date().toISOString(),
  consent_given_at: new Date().toISOString(),
  created_at: '2026-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export const PROFILE_AVOIDANT = {
  ...PROFILE_ANXIOUS,
  id: 'user-avoidant-002',
  full_name: 'Avery Avoidant',
  email: 'avery@test.sparq.app',
  partner_id: 'user-partner-002',
};

export const PROFILE_SECURE = {
  ...PROFILE_ANXIOUS,
  id: 'user-secure-003',
  full_name: 'Sam Secure',
  email: 'sam@test.sparq.app',
  partner_id: 'user-partner-003',
};

export const PROFILE_SOLO = {
  ...PROFILE_ANXIOUS,
  id: 'user-solo-004',
  full_name: 'Jordan Solo',
  email: 'jordan@test.sparq.app',
  partner_id: null,
  subscription_tier: 'free' as const,
  subscription_expiry: null,
};

export const PROFILE_NEW_USER = {
  ...PROFILE_SOLO,
  id: 'user-new-005',
  full_name: 'New User',
  email: 'new@test.sparq.app',
  is_onboarded: false,
  created_at: new Date().toISOString(),
};

export const PROFILE_LONG_ABSENCE = {
  ...PROFILE_ANXIOUS,
  id: 'user-absent-006',
  full_name: 'Returning Riley',
  email: 'riley@test.sparq.app',
  last_active: '2026-01-15T00:00:00Z', // Weeks ago
};
```

---

## Mock Trait Data

```typescript
// src/test/fixtures/traits.ts

export const TRAITS_ANXIOUS = {
  user_id: 'user-anxious-001',
  attachment_style: 'anxious',
  love_language: 'words-of-affirmation',
  conflict_style: 'volatile',
  emotional_state: 'activated',
  last_analysis_at: new Date().toISOString(),
};

export const TRAITS_AVOIDANT = {
  user_id: 'user-avoidant-002',
  attachment_style: 'avoidant',
  love_language: 'quality-time',
  conflict_style: 'avoiding',
  emotional_state: 'neutral',
  last_analysis_at: new Date().toISOString(),
};

export const TRAITS_SECURE = {
  user_id: 'user-secure-003',
  attachment_style: 'secure',
  love_language: 'physical-touch',
  conflict_style: 'validating',
  emotional_state: 'positive',
  last_analysis_at: new Date().toISOString(),
};

export const TRAITS_UNKNOWN = {
  user_id: 'user-new-005',
  attachment_style: null,
  love_language: null,
  conflict_style: null,
  emotional_state: 'neutral',
  last_analysis_at: null,
};
```

---

## Mock Partnerships

```typescript
// src/test/fixtures/partnerships.ts

export const PARTNERSHIP_ACTIVE = {
  user: {
    id: 'user-anxious-001',
    partner_id: 'user-partner-001',
  },
  partner: {
    id: 'user-partner-001',
    partner_id: 'user-anxious-001',
    full_name: 'Partner Pat',
    email: 'pat@test.sparq.app',
    is_onboarded: true,
    last_active: new Date().toISOString(),
  },
};

export const PARTNERSHIP_PENDING = {
  invitation: {
    id: 'invite-001',
    sender_id: 'user-solo-004',
    recipient_email: 'pending-partner@test.sparq.app',
    invite_code: 'SPARQ-TEST-CODE',
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
};

export const PARTNERSHIP_NOT_ONBOARDED = {
  user: {
    id: 'user-secure-003',
    partner_id: 'user-partner-unonboarded',
  },
  partner: {
    id: 'user-partner-unonboarded',
    partner_id: 'user-secure-003',
    full_name: 'Not Onboarded Partner',
    email: 'unonboarded@test.sparq.app',
    is_onboarded: false,
    last_active: null,
  },
};
```

---

## Mock Daily Sessions

```typescript
// src/test/fixtures/daily-sessions.ts

export const SESSION_MORNING_READY = {
  id: 'session-001',
  user_id: 'user-anxious-001',
  session_local_date: '2026-03-15',
  timezone: 'America/New_York',
  day_index: 3,
  status: 'morning_ready',
  morning_story: null,
  morning_action: null,
  morning_viewed_at: null,
  evening_reflection: null,
  evening_peter_response: null,
  evening_completed_at: null,
  completed_local_date: null,
  is_locked_for_pause: false,
  pause_expires_at: null,
  created_at: '2026-03-15T08:00:00Z',
  updated_at: '2026-03-15T08:00:00Z',
};

export const SESSION_MORNING_VIEWED = {
  ...SESSION_MORNING_READY,
  id: 'session-002',
  status: 'morning_viewed',
  morning_story: 'Alex noticed Sam had been quieter than usual...',
  morning_action: 'Find one moment today to sit with your partner in silence.',
  morning_viewed_at: '2026-03-15T09:30:00Z',
};

export const SESSION_EVENING_READY = {
  ...SESSION_MORNING_VIEWED,
  id: 'session-003',
  status: 'evening_ready',
};

export const SESSION_COMPLETED = {
  ...SESSION_EVENING_READY,
  id: 'session-004',
  status: 'completed',
  evening_reflection: 'We tried sitting together. It was awkward at first but then it felt really peaceful.',
  evening_peter_response: "That's beautiful. The awkwardness is normal — it means you were both being real. 🦦",
  evening_completed_at: '2026-03-15T21:00:00Z',
  completed_local_date: '2026-03-15',
};

export const SESSION_PAUSED = {
  ...SESSION_MORNING_READY,
  id: 'session-005',
  is_locked_for_pause: true,
  pause_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
};

// A full 7-day streak for streak testing
export function buildStreakSessions(userId: string, streakLength: number) {
  return Array.from({ length: streakLength }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (streakLength - 1 - i));
    const localDate = date.toISOString().split('T')[0];
    return {
      ...SESSION_COMPLETED,
      id: `streak-session-${i}`,
      user_id: userId,
      day_index: i + 1,
      session_local_date: localDate,
      completed_local_date: localDate,
    };
  });
}
```

---

## Mock LLM Responses

```typescript
// src/test/fixtures/llm-responses.ts

export const MORNING_STORY_DEFAULT = {
  story: `Alex noticed Sam had been quieter than usual all day. Instead of asking "what's wrong?", Alex simply sat down next to Sam and said, "I'm here whenever you're ready."

Sam didn't say anything for a while. But after a few minutes, Sam leaned in a little closer. Sometimes the most powerful thing you can say is nothing at all.`,
  action: 'Find one moment today to sit with your partner in silence — no phones, no fixing. Just be present.',
};

export const MORNING_STORY_DAY7 = {
  story: `River had been carrying a grudge about the dishes for three days. "It's not about the dishes," River finally said. And that was the bravest sentence of the week.

Behind every complaint is a wish. Behind every frustration is a need that hasn't been spoken yet.`,
  action: 'Think of one thing that's been bothering you. Ask yourself: what am I actually wishing for underneath this?',
};

export const CHAT_RESPONSE_EMPATHETIC = {
  message: "That sounds really hard. I'm right here. 🦦 Can you tell me more about what that moment felt like for you?",
};

export const CHAT_RESPONSE_CELEBRATING = {
  message: "You did it! Another day of showing up for your relationship. 🦦 You're building something real, one day at a time.",
};

export const CHAT_RESPONSE_CURIOUS = {
  message: "Hmm, that's really interesting. When you say that, what feeling comes up for you?",
};

export const TRAIT_ANALYSIS_RESULT = {
  attachment_style: 'secure',
  love_language: 'quality-time',
  conflict_style: 'validating',
  emotional_state: 'positive',
  confidence: 0.72,
};

export const PARTNER_SYNTHESIS = {
  synthesis: "Both of you reflected on presence today. You noticed how silence can feel connecting, and your partner noticed how small gestures speak louder than words. There's a beautiful overlap: you're both learning that love doesn't always need words.",
};

export const GRADUATION_REPORT = {
  what_i_learned: 'You discovered that your need for reassurance is actually a strength — it shows how deeply you care.',
  biggest_growth: 'You went from shutting down during conflict to pausing and naming your feelings before responding.',
  relationship_superpower: 'Deep empathy — you naturally tune into your partner\'s emotional state.',
  focus_next: 'Building on your conflict repair skills through the Communication track.',
  recommended_track: 'communication',
};
```

---

## Mock Supabase Client Factory (for Vitest)

```typescript
// src/test/mocks/supabase.ts
import { vi } from 'vitest';

type MockData = Record<string, unknown>;

interface MockQueryBuilder {
  select: () => MockQueryBuilder;
  insert: () => Promise<{ data: unknown; error: null }>;
  update: () => MockQueryBuilder;
  upsert: () => Promise<{ data: unknown; error: null }>;
  delete: () => MockQueryBuilder;
  eq: () => MockQueryBuilder;
  neq: () => MockQueryBuilder;
  in: () => MockQueryBuilder;
  order: () => MockQueryBuilder;
  limit: () => MockQueryBuilder;
  range: () => MockQueryBuilder;
  single: () => Promise<{ data: unknown; error: null }>;
  maybeSingle: () => Promise<{ data: unknown; error: null }>;
  then: (resolve: (value: { data: unknown[]; error: null }) => void) => void;
}

export function createMockSupabase(tableData: Record<string, MockData | MockData[] | null> = {}) {
  function buildQuery(table: string): MockQueryBuilder {
    const data = tableData[table];
    const query: MockQueryBuilder = {
      select: () => query,
      insert: async () => ({ data: Array.isArray(data) ? data : [data], error: null }),
      update: () => query,
      upsert: async () => ({ data: Array.isArray(data) ? data : [data], error: null }),
      delete: () => query,
      eq: () => query,
      neq: () => query,
      in: () => query,
      order: () => query,
      limit: () => query,
      range: () => query,
      single: async () => ({ data: Array.isArray(data) ? data[0] : data, error: null }),
      maybeSingle: async () => ({ data: Array.isArray(data) ? data[0] : data, error: null }),
      then: (resolve) => resolve({ data: Array.isArray(data) ? data : data ? [data] : [], error: null }),
    };
    return query;
  }

  return {
    from: vi.fn((table: string) => buildQuery(table)),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {}, session: {} }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: {}, session: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  };
}

// Convenience: pre-loaded with common test data
export function createMockSupabaseWithUser(profile: MockData, traits?: MockData) {
  return createMockSupabase({
    profiles: profile,
    profile_traits: traits ?? null,
    user_preferences: { user_id: profile.id, insights_visible: true, personalization_enabled: true },
    daily_sessions: null,
    user_skill_tracks: null,
  });
}
```

---

## Mock OpenRouter / LLM Factory

```typescript
// src/test/mocks/openrouter.ts
import { vi } from 'vitest';

export function createMockOpenRouter(response: string = 'Mock Peter response 🦦') {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: response } }],
        }),
      },
    },
  };
}

// For testing error handling
export function createFailingOpenRouter(errorMessage: string = 'Rate limit exceeded') {
  return {
    chat: {
      completions: {
        create: vi.fn().mockRejectedValue(new Error(errorMessage)),
      },
    },
  };
}
```

---

## E2E Helper: Mock Supabase for Playwright

Already exists in `e2e/helpers/mock-supabase.ts`. Quick reference:

```typescript
import { mockUserInsights, mockDailyEntries, mockSkillProgress } from '../helpers/mock-supabase';

// Mock user at Day 5, skill tree locked
await mockUserInsights(page, { onboarding_day: 5, skill_tree_unlocked: false });

// Mock no daily entry (morning phase)
await mockDailyEntries(page, null);

// Mock daily entry exists (evening phase)
await mockDailyEntries(page, {
  id: 'entry-1',
  status: 'morning_viewed',
  morning_story: 'Story content...',
});

// Mock skill progress (basic communication complete)
await mockSkillProgress(page, [
  { track: 'communication', level: 'basic', completed_at: new Date().toISOString() },
]);
```

---

## Usage Patterns

### Import fixtures in Vitest tests

```typescript
import { PROFILE_ANXIOUS, PROFILE_SOLO } from '@/test/fixtures/profiles';
import { TRAITS_ANXIOUS, TRAITS_UNKNOWN } from '@/test/fixtures/traits';
import { SESSION_MORNING_READY, buildStreakSessions } from '@/test/fixtures/daily-sessions';
import { MORNING_STORY_DEFAULT, CHAT_RESPONSE_EMPATHETIC } from '@/test/fixtures/llm-responses';
import { createMockSupabaseWithUser } from '@/test/mocks/supabase';

describe('DailyGrowthPage', () => {
  it('shows personalized content for anxious user', () => {
    const supabase = createMockSupabaseWithUser(PROFILE_ANXIOUS, TRAITS_ANXIOUS);
    // ... test with anxious profile
  });

  it('handles solo user gracefully', () => {
    const supabase = createMockSupabaseWithUser(PROFILE_SOLO, TRAITS_UNKNOWN);
    // ... test without partner
  });
});
```

### Testing streak scenarios

```typescript
import { buildStreakSessions } from '@/test/fixtures/daily-sessions';
import { PROFILE_ANXIOUS } from '@/test/fixtures/profiles';

describe('Streak calculation', () => {
  it('recognizes a 7-day streak', () => {
    const sessions = buildStreakSessions(PROFILE_ANXIOUS.id, 7);
    expect(sessions).toHaveLength(7);
    // All consecutive dates
    for (let i = 1; i < sessions.length; i++) {
      const prev = new Date(sessions[i - 1].session_local_date);
      const curr = new Date(sessions[i].session_local_date);
      const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
      expect(diffDays).toBe(1);
    }
  });
});
```
