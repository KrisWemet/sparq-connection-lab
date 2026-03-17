#!/usr/bin/env npx tsx
/**
 * 14-Day Simulation Script
 *
 * Authenticates as a test user, loops through 14 days calling
 * session/start + complete, and verifies trait accumulation
 * and graduation report generation.
 *
 * Usage:
 *   npx tsx scripts/simulate-14-days.ts
 *
 * Environment variables (from .env.local or exported):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_USER_EMAIL    — email of existing test user (default: test@sparq.dev)
 *   TEST_USER_PASSWORD — password (default: testtest123)
 *   BASE_URL           — API base URL (default: http://localhost:3000)
 */

import { createClient } from '@supabase/supabase-js';

// Load env
const dotenv = await import('dotenv').catch(() => null);
dotenv?.config({ path: '.env.local' });
dotenv?.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@sparq.dev';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'testtest123';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function api(
  path: string,
  token: string,
  options: { method?: string; body?: any } = {},
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

function localDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (13 - offsetDays)); // Day 1 = 13 days ago
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log('=== Sparq 14-Day Simulation ===\n');

  // 1. Authenticate
  console.log(`Signing in as ${TEST_EMAIL}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError || !authData.session) {
    console.error('Auth failed:', authError?.message || 'No session');
    console.log('\nTip: Create the test user first:');
    console.log(`  In Supabase dashboard → Auth → Add User → ${TEST_EMAIL} / ${TEST_PASSWORD}`);
    process.exit(1);
  }

  const token = authData.session.access_token;
  const userId = authData.user.id;
  console.log(`Authenticated. User ID: ${userId}\n`);

  // 2. Simulate 14 days
  const sampleReflections = [
    "I tried listening without planning my response today. It felt strange but good.",
    "I told my partner I appreciate how they always make coffee in the morning.",
    "I asked instead of assuming why they were quiet. Turns out they had a tough day at work.",
    "I took a deep breath before reacting to something that annoyed me. It helped.",
    "I noticed three things my partner did right today. Usually I only notice the negatives.",
    "I shared something vulnerable about my childhood. It felt scary but they held space for me.",
    "I asked 'what do you need right now?' and they said just a hug. Simple but powerful.",
    "We celebrated finishing a home project together. Small win but felt like a big deal.",
    "I said sorry without adding 'but' for the first time. It felt more genuine.",
    "We had dinner with no phones. The conversation went places it hasn't in months.",
    "I checked in with myself before a hard conversation. Realized I was hungry and tired, so we postponed.",
    "We laughed about a silly argument from last week. Finding the funny side really helped.",
    "I told my partner one thing I admire about them — their patience with our kids.",
    "We planned a weekend breakfast date. Having something to look forward to feels good.",
  ];

  for (let day = 1; day <= 14; day++) {
    const date = localDate(day);
    console.log(`--- Day ${day} (${date}) ---`);

    // Start session
    const startRes = await api('/api/daily/session/start', token, {
      method: 'POST',
      body: { local_date: date },
    });
    if (!startRes.ok) {
      console.log(`  Start: ${startRes.status} — ${JSON.stringify(startRes.data)}`);
      // May already exist, try to continue
    } else {
      console.log(`  Started session: ${startRes.data.session?.id || 'ok'}`);
    }

    // Complete session with a reflection
    const reflection = sampleReflections[day - 1];
    const completeRes = await api('/api/daily/session/complete', token, {
      method: 'POST',
      body: {
        local_date: date,
        evening_reflection: reflection,
      },
    });
    if (!completeRes.ok) {
      console.log(`  Complete: ${completeRes.status} — ${JSON.stringify(completeRes.data)}`);
    } else {
      console.log(`  Completed. Day ${day}/14 done.`);
    }

    // Small delay to not overwhelm the API
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== Verification ===\n');

  // 3. Verify trait accumulation
  const traitsRes = await api('/api/profile/traits', token);
  const traits = traitsRes.data?.traits || [];
  console.log(`Profile traits: ${traits.length} found`);
  for (const t of traits) {
    console.log(`  ${t.trait_key}: ${t.inferred_value} (confidence: ${t.confidence}, observations: ${t.observation_count})`);
  }

  // 4. Check user_insights
  const { data: insights } = await supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  console.log(`\nUser insights onboarding_day: ${insights?.onboarding_day || 'not set'}`);

  // 5. Check graduation report
  const { data: gradReport } = await supabase
    .from('graduation_reports')
    .select('id, created_at')
    .eq('user_id', userId)
    .maybeSingle();
  console.log(`Graduation report: ${gradReport ? `generated at ${gradReport.created_at}` : 'not generated yet'}`);

  // 6. Check skill_tree_unlocked
  const { data: profile } = await supabase
    .from('profiles')
    .select('skill_tree_unlocked')
    .eq('id', userId)
    .maybeSingle();
  console.log(`Skill tree unlocked: ${profile?.skill_tree_unlocked ?? 'column not found'}`);

  // 7. Session count
  const { count } = await supabase
    .from('daily_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');
  console.log(`Completed sessions: ${count}`);

  console.log('\n=== Simulation Complete ===');
}

main().catch(console.error);
