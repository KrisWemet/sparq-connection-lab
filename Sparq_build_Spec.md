# Sparq Connection Build Spec (Step-by-Step)

Status date: February 26, 2026
Source of truth: `Sparq_master_prd.md`

## Step 1: Safety + Trust Foundation (In Progress)
- [x] Add crisis-aware routing in Peter chat API (`/api/peter/chat`)
- [x] Add country-based crisis resource model for US/CA/UK/AU/NZ
- [x] Add Trust Center v1 page for:
  - insight visibility toggle
  - personalization toggle
  - AI memory window setting (90-day vs indefinite)
  - relationship mode selection (solo/partnered)
- [x] Add `user_preferences` migration with RLS and auto-create trigger
- [x] Add Conflict First Aid page with reset protocol + repair starters
- [x] Link Trust Center from Settings and Conflict First Aid from Dashboard

## Step 2: Trojan Horse Onboarding 14-Day Reliability
- [ ] Ensure day-state transitions are deterministic (`onboarding_day`, `daily_entries`)
- [ ] Add idempotent generation guard for morning stories
- [ ] Add fallback content for missing model responses
- [ ] Add user-facing completion signal for Day 14 graduation

## Step 3: Daily Loop Productization
- [ ] Add explicit Morning / Action / Evening timeline UI
- [ ] Add reflection quality checks (effort-based guidance)
- [ ] Add reminder preference plumbing (time + on/off)
- [ ] Add completion analytics events

## Step 4: Skill Tree Baseline
- [ ] Expand tracks to MVP list:
  - Communication
  - Conflict Repair
  - Emotional Intimacy
  - Trust & Security
  - Shared Vision & Rituals
- [ ] Track Basic -> Advanced -> Expert progression per track
- [ ] Add progress dashboard with self-only baselines

## Step 5: Privacy, Consent, and Data Controls
- [ ] Add consent capture and surfaced policy language at onboarding
- [ ] Add memory/export/delete controls wiring in Trust Center
- [ ] Add clear boundaries for private vs shared content

## Step 6: Monetization and Limits
- [ ] Enforce free tier limits:
  - 3 daily loops/week
  - 10 coach messages/day
  - 1-2 starter quests
- [ ] Add paid tier unlocks + subscription instrumentation

## Step 7: Observability + KPI Instrumentation
- [ ] Track activation metrics (Day 3 + goal set)
- [ ] Track 14-day completion and Day-30 retention cohorts
- [ ] Track repair-time and safety-response compliance

## Step 8: Phase 2 Entry Criteria
- [ ] Stabilize solo-first retention and safety metrics
- [ ] Add partner invite + shared daily prompt (opt-in only)
- [ ] Keep journals private by default and item-level sharing only
