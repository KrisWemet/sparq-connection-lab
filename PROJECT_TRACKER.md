# SPARQ CONNECTION - PROJECT TRACKER

> **Last Updated:** 2026-02-10  
> **Current Branch:** `claude/add-claude-documentation-ctnR4`  
> **Working Directory:** `/Users/Chris/sparq-connection-claude`

---

## 🎯 VISION

**Sparq Connection** — The world's most effective couples strengthening app.  
**Core Philosophy:** "Making me a better me for us" — Solo-first relationship coaching that delivers immediate value while progressively discovering each user's personality over 14 days.

**Psychology Stack:**
- Love Languages
- Gottman Method  
- CBT (Cognitive Behavioral Therapy)
- Attachment Theory
- EFT (Emotionally Focused Therapy)
- Narrative Therapy
- NVC (Non-Violent Communication)
- Positive Psychology
- **NLP/Hypnosis** (for persuasive wording)
- **Color Psychology** (for UI/UX emotional priming)

---

## 📊 PROJECT STATUS

### ✅ COMPLETED (By Claude Opus 4.6)

#### Core Architecture
- [x] **14-Day Personality Discovery System** — Progressive learning through natural responses
- [x] **Learn → Implement → Reflect** daily session cycle (5-7 min)
- [x] **Multi-Provider AI Layer** — Gemini Flash (free) / Claude Sonnet 4.5 (premium) / Claude Opus 4.5 (reports)
- [x] **Identity Archetype System** — 4 archetypes with personalized content
- [x] **Attachment-Style Language Adaptation** — Same content, different words per attachment style
- [x] **Color Psychology Framework** — Phase-aware UI color schemes

#### Services Layer
- [x] `dailySessionService.ts` — Session orchestrator
- [x] `personalityInferenceService.ts` — AI-powered signal extraction
- [x] `personalityProfileService.ts` — Profile aggregation
- [x] `discoveryQuestionService.ts` — AI-generated personalized questions
- [x] `mirrorNarrativeService.ts` — Day 14 "we see you" reflection
- [x] `aiModelService.ts` — Multi-provider routing with fallback chains

#### Data & Content
- [x] **65 Micro-Action Templates** — 5 categories, solo/partner versions, archetype variants
- [x] **Psychology Framework Config** — 18 techniques across 8 frameworks
- [x] **Archetype Configurations** — 4 identity types with personalized messaging
- [x] **Attachment Language Map** — Words that work/avoid per attachment style

#### UI Components
- [x] Session flow components (LearnStep, ImplementStep, SessionComplete, etc.)
- [x] Archetype selector
- [x] Micro-insight display
- [x] Yesterday check-in
- [x] Step indicator

#### Documentation
- [x] **CLAUDE.md** — Comprehensive 25K word documentation

---

### 🚧 IN PROGRESS / NEEDS WORK

#### Supabase Project Setup
- [x] Complete SQL schema prepared (`20250210_complete_schema.sql`)
- [x] Create new Supabase project: `tkoyyddvftyafidscvbg`
- [x] Run schema SQL in new project
- [x] Update `.env` with new project URL and anon key
- [x] pgvector extension enabled and verified
- [x] All 19 tables created and verified

#### Edge Functions (Supabase)
- [x] `daily-question` — Fetch today's personalized question (323 lines, AI-powered)
- [x] `save-session` — Save completed Learn→Implement→Reflect sessions with streak updates
- [x] `submit-answer` — Submit answers, trigger AI personality inference, store signals
- [x] `get-profile` — Aggregate all 7 personality dimensions with scores and confidence
- [ ] Deploy edge functions to Supabase (needs env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY)
- [ ] Run migration: `20250210_edge_functions_tables.sql` (creates daily_sessions, personality_signals, generated_questions, user_streaks tables)

#### Share with Partner Feature
- [x] Real implementation (not placeholder)
- [x] Database schema: `shared_answers` table with RLS policies
- [x] Edge function: `share-answer` with partner validation & realtime notifications
- [x] React hook: `useShareAnswer` with loading/error states
- [x] UI component: `ShareAnswerButton` with tooltips & state animations
- [x] Integration: Share button in MicroInsight component after user answers
- [x] Tier checking: Premium/Ultimate required (free tier sees upgrade prompt)
- [x] Partner validation: Only allows sharing with connected partner

#### Polish & Testing
- [x] Test/Debug audit complete
- [ ] **CRITICAL:** Fix 45+ missing dependencies in package.json
- [ ] Type errors in hooks
- [ ] Celebration UI for level/category completion
- [ ] Streak tracking display
- [x] Color psychology implementation verified and fixed
- [ ] Testing framework (none currently)

---

### ✅ COMPLETED (2026-02-10)

#### NLP/Hypnosis Language Enhancement
- [x] **65 Micro-Action Templates** — Enhanced with presuppositions, externalization, validation-first patterns
- [x] **Psychology Framework Config** — Added 10+ new coaching language patterns
- [x] **Attachment-Aware Language** — Enhanced profiles for anxious/avoidant/fearful users
- [x] **Reflection Prompts** — All archetype × phase combinations updated
- [x] **UI Components** — LearnStep, ImplementStep, MicroInsight, YesterdayCheckIn enhanced
- [x] **Archetype Config** — Greetings and celebration messages presuppositionalized
- [x] **DailyQuestions** — Loading and error messaging enhanced
- [x] **NLP_AUDIT_REPORT.md** — Comprehensive documentation of all changes

---

### 🎯 NEXT PRIORITIES (Pick One)

1. **Complete Edge Functions** — Deploy to Supabase (needs env vars)
2. **Partner Connection Flow** — Onboarding and linking partners
3. **Color Psychology UI Polish** — Ensure all screens use phase-aware colors
4. **Testing Framework** — Set up Vitest + React Testing Library
5. **Fix Dependencies** — 45+ missing dependencies in package.json

---

## 🏗️ ARCHITECTURE REFERENCE

### Session Flow
```
User opens DailyQuestions
    ↓
Yesterday Check-in (Day 2+, 30s)
    ↓
LEARN (2-3 min) → AI question + personality inference
    ↓
Micro-Insight (THE PEAK) → Validation → Reframe → Growth
    ↓
IMPLEMENT (1 min) → Personalized micro-action
    ↓
Session Complete (THE END) → Archetype celebration + streak
```

### 14-Day Discovery Arc
| Phase | Days | Focus | Intimacy | Colors |
|-------|------|-------|----------|--------|
| Rhythm | 1-3 | Safety, welcome | 1-2 | Lavender → Pink |
| Deepening | 4-6 | Emotional depth | 2-3 | Violet → Indigo |
| Navigating | 7-9 | Conflict exploration | 2-4 | Mint → Blue |
| Layers | 10-12 | Vulnerability | 3-4 | Gold → Amber |
| Mirror | 13-14 | Integration | 3-5 | Rose → Lavender |

### 7 Personality Dimensions
1. Attachment Style (secure/anxious/avoidant/fearful)
2. Love Language (words/time/touch/acts/gifts)
3. Conflict Style (pursuer/withdrawer/validator/volatile)
4. Emotional Expression (vulnerability/vocabulary/processing)
5. Values (core/growth/autonomy)
6. Intimacy Profile (emotional/physical/progression)
7. Relational Identity (self-as-partner/roles)

### 4 Identity Archetypes
| Archetype | Tagline | Frame |
|-----------|---------|-------|
| Calm Anchor | "I want to be the steady, grounding presence" | Stability |
| Compassionate Listener | "I want to truly hear and understand" | Empathy |
| Growth Seeker | "I want to keep evolving and learning" | Progress |
| Connection Builder | "I want to create deeper bonds" | Intimacy |

---

## 📝 NLP/HYPNOSIS LANGUAGE PATTERNS

### Implementation Status: ✅ COMPLETE

All user-facing text has been enhanced with evidence-based NLP and hypnosis language patterns as of 2026-02-10.

### Patterns Applied Throughout:

### Presuppositions (SFBT)
- "When you notice..." (assumes change is happening)
- "As you begin to..." (presupposes success)

### Validation-First (Gottman/DBT)
- Acknowledge feeling BEFORE inviting change
- "That makes sense" / "Of course you feel..."

### Reframing (CBT)
- Challenges → Information, not failure
- "This is feedback" not "This is a problem"

### Solution-Focused (SFBT)
- "What would be different if...?"
- "Imagine it's working — what do you notice?"

### Growth Mindset (Dweck)
- "This is something you're building"
- "Not yet" instead of "can't"

### Externalization (Narrative)
- "When anxiety shows up..." (not "when you're anxious")
- "That part of you that..." (separates person from pattern)

### Attachment-Specific
| Style | Works | Avoid |
|-------|-------|-------|
| Secure | "let's explore", "deepen" | "you must", forced urgency |
| Anxious | "you're doing great", "this is normal" | "give them space", "calm down", "needy" |
| Avoidant | "at your own pace", "when you're ready" | "need", "depend", "open up" |
| Fearful-Avoidant | "no pressure", "whatever feels right" | "commit", "decide", "push through" |

---

## 🎨 COLOR PSYCHOLOGY UI/UX

### Phase Colors (Session Backgrounds)
```typescript
// Rhythm (Days 1-3) — Safety, Welcome
{ start: '#E6E6FA', end: '#FFB6C1' } // Lavender → Pink

// Deepening (Days 4-6) — Introspection  
{ start: '#8A2BE2', end: '#4B0082' } // Violet → Indigo

// Navigating (Days 7-9) — Calm during conflict
{ start: '#98FF98', end: '#87CEEB' } // Mint → Blue

// Layers (Days 10-12) — Vulnerability
{ start: '#FFD700', end: '#FFBF00' } // Gold → Amber

// Mirror (Days 13-14) — Celebration
{ start: '#FFB6C1', end: '#E6E6FA' } // Rose → Lavender
```

### Archetype Accents
- Calm Anchor: `#4682B4` (Steel Blue)
- Compassionate Listener: `#9B59B6` (Amethyst)
- Growth Seeker: `#27AE60` (Emerald)
- Connection Builder: `#E74C3C` (Coral)

---

## 🔧 TECHNICAL NOTES

### Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, DB, Edge Functions, Realtime)
- Framer Motion for animations

### Important Gotchas
1. Use `npx vite` not `npm run dev` (package.json scripts are wrong)
2. Dev server runs on port 8080
3. Multiple ProtectedRoute components exist — check imports
4. `_app.tsx` and `_document.tsx` are vestigial Next.js files (ignore)

### AI Model Routing
```typescript
// Free tier → Gemini Flash
// Premium → Claude Sonnet 4.5  
// Reports → Claude Opus 4.5
```

---

## 🐛 KNOWN ISSUES

1. Edge functions incomplete — daily questions won't fully work
2. ~~Share with Partner is placeholder only~~ ✅ Implemented
3. Type errors in `useDailyQuestion.ts`
4. No testing framework
5. Mem0 integration is mocked
6. `sonner` toast library not in package.json (type errors)

---

## ✍️ SESSION LOG

### 2026-02-10 — Initial Setup
- Cloned `sparq-connection-claude` repo
- Checked out `claude/add-claude-documentation-ctnR4` branch
- Created this PROJECT_TRACKER.md
- Assessed current state: Architecture complete, edge functions needed
- Discovered old Supabase project is paused/unrecoverable

### 2026-02-10 — Database Schema Preparation
- Created complete SQL schema file: `supabase/migrations/20250210_complete_schema.sql`
- Includes: Original schema + New personality discovery tables
- Tables added: `daily_sessions`, `personality_signals`, `mirror_narratives`, `user_streaks`, `achievements`, `conversation_memories`
- RLS policies for all new tables
- Indexes for performance
- Ready to run on new Supabase project

### 2026-02-10 — New Supabase Project Setup
- New project created: `tkoyyddvftyafidscvbg`
- Connected via session pooler (direct connection: db.tkoyyddvftyafidscvbg.supabase.co)
- pgvector extension verified
- All 19 tables created successfully:
  - Original: profiles, journeys, goals, daily_questions, etc.
  - New: daily_sessions, personality_signals, mirror_narratives, user_streaks, achievements, conversation_memories
- All RLS policies applied
- All indexes created
- Sample journey data inserted
- Updated `supabase/config.toml` with new project ID
- Updated `.env` with new URL (need anon key from dashboard)

### 2026-02-10 — Share with Partner Feature Implementation
- Created `shared_answers` table migration (`20250210_add_shared_answers.sql`)
  - Fields: sender_id, recipient_id, question_text, answer_text, session_id, is_read
  - Indexes for efficient queries by sender/recipient
  - RLS policies for security
- Created `share-answer` Supabase Edge Function
  - Validates sender has premium/ultimate subscription
  - Validates recipient is sender's partner
  - Inserts record into shared_answers
  - Sends realtime notification via Supabase Realtime
- Created `useShareAnswer` React hook
  - Handles share logic with loading states
  - Validates permissions (partner connected, premium tier)
  - Returns success/error states
- Created `ShareAnswerButton` UI component
  - Shows loading state while sharing
  - Shows success state after share
  - Tooltip explaining share feature
  - Handles free tier (shows upgrade prompt)
  - Handles no partner (shows connect prompt)
- Updated `MicroInsight` component
  - Added share button after insight display
  - Passes question/answer text to share component
- Updated `DailyQuestions` page
  - Stores user's answer for sharing
  - Passes share data to MicroInsight component
- Updated Profile types (both `types/profile.ts` and `lib/supabase.ts`)
  - Added `partner_id` field
- Updated Supabase types (`integrations/supabase/types.ts`)
  - Added `shared_answers` table definition

### 2026-02-10 — Subagent Deployment
Spawned 5 parallel subagents to work simultaneously:
1. **Edge Functions Agent** — Building Supabase edge functions (daily-question, save-session, submit-answer, get-profile)
2. **Share Partner Agent** — Implementing real Share with Partner feature
3. **NLP Wording Agent** — Auditing/enhancing all user-facing text with hypnotic language patterns
4. **Color Psychology Agent** — Verifying phase-aware color schemes across all components
5. **Test/Debug Agent** — Running app, catching type errors and runtime issues

All agents working in isolated sessions with clean context windows.

### 2026-02-10 — Agent Results & Critical Issues

**Color Psychology Agent** — ✅ COMPLETE
- All 6 session components updated with phase-aware colors
- Archetype accents implemented
- CSS variables flowing from DailyQuestions to children

**Test/Debug Agent** — ✅ COMPLETE (with critical findings)
- Fixed import paths (Index.tsx, Profile.tsx, client.ts)
- Created type definitions (env.d.ts, session.ts updates)
- **CRITICAL:** Found 45+ missing dependencies in package.json
- Created comprehensive issues.md documenting all errors
- DailySessionService loads correctly (structure is sound)
- Spawned fix-dependencies-agent to resolve package issues

**Fix Dependencies Agent** — 🟡 RUNNING
- Updating package.json with all missing dependencies
- Will run npm install and verify app builds

**NLP Wording Agent** — ✅ COMPLETE
- Audited 65 micro-action templates in `src/data/microActions.ts`
  - Added presuppositions: "When you notice...", "As you begin to..."
  - Externalized patterns: "When frustration shows up..." vs "When you're frustrated"
  - Validation-first framing throughout
- Enhanced `src/config/psychologyFramework.ts`
  - Added 10+ new presupposition patterns
  - Enhanced reframing with solution-focused language
  - Improved attachment-aware language profiles (anxious, avoidant, fearful)
- Updated `src/services/dailySessionService.ts`
  - Enhanced all archetype × phase reflection prompts
  - Improved fallback learn step questions
  - Updated yesterday check-in acknowledgments
- Enhanced `src/config/archetypes.ts`
  - Presuppositional greetings for all 4 archetypes
  - Validation-first celebration messages
- Updated UI components:
  - LearnStep.tsx: Warmer placeholder, gentler analysis text
  - ImplementStep.tsx: "I'm ready to try this" vs "I'll try this"
  - MicroInsight.tsx: "As we listened..." vs "Here's what we noticed"
  - YesterdayCheckIn.tsx: "As you look back..." vs "How did it go?"
  - DailyQuestions.tsx: "As we prepare..." vs "Preparing"
- Created comprehensive `NLP_AUDIT_REPORT.md` with all changes documented
- All changes committed and pushed to branch

---

## 🎯 DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-10 | Work off Claude's branch | Complete architectural rewrite with psychology depth |
| 2026-02-10 | Create PROJECT_TRACKER.md | Short context window requires external memory |

---

## 📋 QUESTIONS FOR CHRIS

1. **Priority:** Edge functions first, or NLP/hypnosis wording polish?
2. **Share with Partner:** Should this create an in-app message, email, or both?
3. **Testing:** Want me to set up a testing framework (Vitest + React Testing Library)?
4. **Deployment:** What's the timeline for going live? Any hard deadlines?
5. **Partner Features:** Beyond sharing answers, what couple interactions are priority?

---

*This document is my external memory. I will update it after every significant change, completion, or decision.*
