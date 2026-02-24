# Supabase Edge Functions

This directory contains Deno-based Edge Functions for Sparq Connection.

## Functions Overview

### 1. `daily-question`
**Purpose**: Fetch today's personalized question for the user

**Method**: `GET`

**Headers**:
- `Authorization: Bearer <jwt_token>`

**Response**:
```json
{
  "question": {
    "id": "...",
    "text": "What's one thing that always makes you feel connected...",
    "format": "open-ended",
    "modality": "Positive Psychology",
    "phase": "rhythm",
    "intimacyLevel": 1,
    "targetDimensions": ["values", "emotionalExpression"]
  },
  "insight": "Today we're exploring what connection means to you...",
  "archetypePersonalization": "Tailored for the growth-seeker archetype.",
  "discoveryDay": 1,
  "phase": "rhythm"
}
```

**Features**:
- Generates personalized questions using OpenAI GPT-4o-mini
- Considers user's identity archetype, discovery day, and phase
- Avoids repeating recently asked questions
- Stores generated questions for reference

---

### 2. `save-session`
**Purpose**: Save completed Learn→Implement→Reflect session

**Method**: `POST`

**Headers**:
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "session_date": "2026-02-10",
  "discovery_day": 1,
  "phase": "rhythm",
  "learn_response": "I feel connected when...",
  "micro_action": "Ask my partner about their day with full attention",
  "micro_action_accepted": true,
  "reflect_response": "Today I noticed...",
  "question_id": "...",
  "question_text": "...",
  "modality": "Positive Psychology",
  "points_earned": 0
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "...",
    "sessionDate": "2026-02-10",
    "discoveryDay": 1,
    "phase": "rhythm",
    "pointsEarned": 15
  },
  "streak": {
    "current": 5,
    "continued": true,
    "broken": false,
    "previous": 4,
    "milestone": null
  },
  "progress": {
    "totalPoints": 150,
    "nextDiscoveryDay": 2
  }
}
```

**Features**:
- Saves session to `daily_sessions` table
- Updates user streak (increments if consecutive day)
- Awards points with streak bonuses
- Updates profile with new discovery day

---

### 3. `submit-answer`
**Purpose**: Submit answer to Learn question and trigger personality inference

**Method**: `POST`

**Headers**:
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "session_id": "...",
  "answer_text": "I feel most connected when we spend quality time together...",
  "question_id": "...",
  "question_text": "What makes you feel connected?",
  "modality": "Positive Psychology",
  "discovery_day": 1,
  "question_category": "Emotional Intimacy",
  "question_intimacy_level": 2
}
```

**Response**:
```json
{
  "success": true,
  "microInsight": "Your response reveals that quality time is central to how you experience connection — this is valuable insight for understanding your relationship needs.",
  "signals": {
    "extracted": 3,
    "dimensions": ["loveLanguage", "values", "emotionalExpression"],
    "confidence": [
      {
        "dimension": "loveLanguage",
        "confidence": 65,
        "isReliable": true
      }
    ]
  },
  "discoveryDay": 1
}
```

**Features**:
- Analyzes response using OpenAI for personality signals
- Stores signals in `personality_signals` table
- Returns warm micro-insight to user
- Updates confidence scores for each dimension

---

### 4. `get-profile`
**Purpose**: Fetch aggregated personality profile

**Method**: `GET`

**Headers**:
- `Authorization: Bearer <jwt_token>`

**Response**:
```json
{
  "profile": {
    "attachment": {
      "style": "secure",
      "anxietyLevel": 0.3,
      "avoidanceLevel": 0.25,
      "observations": [...]
    },
    "loveLanguages": {
      "ranked": ["quality-time", "words-of-affirmation", "physical-touch", "acts-of-service", "receiving-gifts"],
      "scores": { ... }
    },
    "conflict": {
      "primaryPattern": "validator",
      "repairCapacity": 0.5,
      "criticismTendency": 0.5,
      "defensivenessTendency": 0.5
    },
    "emotional": {
      "opennessToVulnerability": 0.6,
      "vocabularyDepth": "moderate",
      "processingStyle": "reflective"
    },
    "values": {
      "coreValues": ["connection", "growth", "authenticity"],
      "growthOrientation": 0.7,
      "autonomyInterdependence": 0.5
    },
    "intimacy": {
      "emotionalComfort": 0.6,
      "physicalComfort": 0.4,
      "noveltyPreference": 0.5,
      "progressionRate": "moderate"
    },
    "relationalIdentity": {
      "selfAsPartner": "A growth-seeker partner",
      "growthAreas": ["conflict", "intimacy"],
      "strengths": ["values", "emotionalExpression"]
    }
  },
  "dimensions": [
    {
      "dimension": "attachment",
      "score": 0.45,
      "confidence": 0.65,
      "signalCount": 8,
      "isReliable": true,
      "description": "You tend to feel comfortable with both closeness and independence..."
    },
    ...
  ],
  "meta": {
    "totalSignals": 25,
    "discoveryDay": 5,
    "archetype": "growth-seeker",
    "profileComplete": false
  }
}
```

**Features**:
- Aggregates all 7 personality dimensions
- Calculates confidence scores
- Derives attachment style and love language rankings
- Tracks which dimensions are reliable vs still gathering data

---

## Environment Variables

These functions require the following environment variables in Supabase:

```
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
OPENAI_API_KEY=<your_openai_api_key>
```

## Database Tables

See `/supabase/migrations/20250210_edge_functions_tables.sql` for the required table schema.

### Tables Created:
- `daily_sessions` - Stores user session data
- `personality_signals` - Stores extracted personality insights
- `generated_questions` - Stores AI-generated questions
- `user_streaks` - Tracks user engagement streaks

## Testing

```bash
# Get a JWT token first (from your app or Supabase auth)
JWT="your_jwt_token"
SUPABASE_URL="your_supabase_url"

# Test daily-question
curl -X GET \
  "${SUPABASE_URL}/functions/v1/daily-question" \
  -H "Authorization: Bearer ${JWT}"

# Test save-session
curl -X POST \
  "${SUPABASE_URL}/functions/v1/save-session" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_date": "2026-02-10",
    "discovery_day": 1,
    "phase": "rhythm",
    "learn_response": "Test response",
    "micro_action": "Test action",
    "micro_action_accepted": true
  }'

# Test submit-answer
curl -X POST \
  "${SUPABASE_URL}/functions/v1/submit-answer" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "...",
    "answer_text": "I feel connected when..."
  }'

# Test get-profile
curl -X GET \
  "${SUPABASE_URL}/functions/v1/get-profile" \
  -H "Authorization: Bearer ${JWT}"
```

## Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy individual function
supabase functions deploy daily-question
supabase functions deploy save-session
supabase functions deploy submit-answer
supabase functions deploy get-profile
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client App    │────▶│  Edge Functions  │────▶│   OpenAI API    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Supabase DB     │
                        │  - profiles      │
                        │  - daily_sessions│
                        │  - personality_  │
                        │    signals       │
                        │  - user_streaks  │
                        └──────────────────┘
```

## Security

- All functions use Supabase Service Role Key for DB access
- User authentication via JWT tokens
- RLS policies protect user data
- CORS headers configured for web access
