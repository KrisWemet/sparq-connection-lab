# Live Beta Evidence

Date: 2026-03-30
Target deployment: `https://sparq-connection-lab.vercel.app`

## 1. Live Supabase Schema

### Migration state

Command:

```bash
SUPABASE_ACCESS_TOKEN=... npx supabase migration list
```

Observed:
- remote includes many migrations not present locally
- local includes some migrations not present remotely
- migration history is not cleanly aligned between local repo and linked project

Conclusion:
- live migration drift exists
- repo and remote are not in perfect migration sync
- this is a risk for reproducibility, but not by itself proof that the beta tables are missing

### Required beta tables

Command pattern:

```bash
set -a
source .env.local
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/<table>?select=*&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

Observed:
- `daily_sessions` returned a live row with the expected beta fields
- `user_preferences` returned a live row
- `analytics_events` returned a live row
- `outcome_assessments` returned `[]`
- `conflict_episodes` returned `[]`

Interpretation:
- `[]` means the table exists and the query succeeded, but there are no rows yet
- all launch-blocker beta tables are present in the linked project

### `daily_sessions` field proof

Live query selected:
- `id`
- `user_id`
- `session_local_date`
- `day_index`
- `status`
- `morning_story`
- `morning_action`
- `morning_viewed_at`
- `evening_reflection`
- `evening_peter_response`
- `evening_completed_at`

Observed result:
- query succeeded and returned a live row

Conclusion:
- the live `daily_sessions` table supports the supported beta API shape

## 2. Deployed Environment

Command:

```bash
npx vercel env ls production
```

Observed production env names:
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

Not observed in production env list:
- `NEXT_PUBLIC_GOOGLE_API_KEY`

Interpretation:
- core auth and Peter AI env keys are present in production
- Google client key is not present in production based on Vercel env listing

## 3. Live Route Checks

Commands:

```bash
curl -I https://sparq-connection-lab.vercel.app/signup
curl -I https://sparq-connection-lab.vercel.app/login
curl -I https://sparq-connection-lab.vercel.app/onboarding
curl -I https://sparq-connection-lab.vercel.app/daily-growth
```

Observed:
- `/signup` -> `HTTP/2 500`
- `/login` -> `HTTP/2 200`
- `/onboarding` -> `HTTP/2 200`
- `/daily-growth` -> `HTTP/2 200`

Conclusion:
- production has a hard blocker on the public signup route
- other core routes are at least reachable at the HTTP level

## 4. Manual Browser Validation

### Public signup route

Evidence:
- screenshot: [signup-page.png](/Users/chris/sparq-connection-lab/artifacts/live-beta/2026-03-30/1774918062483-signup-page.png)
- route HTML returned the Next.js 500 page

Outcome:
- fail

Reason:
- the supported `/signup` entry route is broken in production

### Fallback account creation through `/login`

Evidence:
- screenshot: [login-page.png](/Users/chris/sparq-connection-lab/artifacts/live-beta/2026-03-30/1774918570451-login-page.png)
- screenshot: [login-create-account.png](/Users/chris/sparq-connection-lab/artifacts/live-beta/2026-03-30/1774918573580-login-create-account.png)
- screenshot: [dashboard-after-login-create-account.png](/Users/chris/sparq-connection-lab/artifacts/live-beta/2026-03-30/1774918573902-dashboard-after-login-create-account.png)

Outcome:
- partial pass

What worked:
- `/login` loaded
- create-account flow from login worked
- fresh account reached dashboard

### Daily loop after fallback account creation

Evidence:
- screenshot: [daily-growth-consent-block.png](/Users/chris/sparq-connection-lab/artifacts/live-beta/2026-03-30/daily-growth-consent-block.png)
- screenshot shows `/daily-growth` landing on a consent gate instead of the expected Day 1 home state

Outcome:
- fail

Reason:
- after dashboard entry, the daily loop does not reach `Start Morning Story`
- production appears to block the user at a consent gate on `/daily-growth`

## 5. Final Live Status

Current live beta status:
- not ready for public beta

Verified blockers:
1. `/signup` returns `500` in production
2. fallback account creation via `/login` reaches dashboard, but the live daily loop does not reach the Day 1 morning story

Verified strengths:
1. live Supabase launch-blocker tables exist
2. live `daily_sessions` supports the supported beta API fields
3. production has the main Supabase and Peter AI env keys present
