# RLS Policies — Complete Reference

Every table in Sparq has Row Level Security enabled. This file documents every policy, organized by table.

---

## Helper Function

```sql
CREATE FUNCTION public.is_admin(user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'::public.user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

Used in admin override policies. `SECURITY DEFINER` means it runs as the function owner, bypassing RLS on `user_roles` itself.

---

## Pattern Reference

| Pattern | SQL Shape | Tables |
|---|---|---|
| **User-scoped** | `auth.uid() = user_id` | Most tables including memories (see below) |
| **Partner-visible** | `auth.uid() = user_a_id OR auth.uid() = user_b_id` | partner_syntheses, vulnerability_escrow |
| **User + partner read** | Own rows + partner's via subquery | profiles, profile_traits |
| **Admin override** | `public.is_admin(auth.uid())` | profiles, user_roles, partner_invitations, user_entitlements, user_insights, relationship_scores |
| **Public read** | `FOR SELECT USING (true)` | journeys, journey_questions, daily_questions, date_ideas, system_settings |

---

## Per-Table Policies

### profiles

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can view their partner's profile
CREATE POLICY "Users can view their partner's profile" ON profiles
  FOR SELECT USING (
    auth.uid() IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (public.is_admin(auth.uid()));
```

### user_roles

```sql
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (public.is_admin(auth.uid()));
```

### partner_invitations

```sql
CREATE POLICY "Users can manage own invitations" ON partner_invitations
  FOR ALL USING (auth.uid() = sender_id);

CREATE POLICY "Recipients can view invitations sent to them" ON partner_invitations
  FOR SELECT USING (
    recipient_email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all invitations" ON partner_invitations
  FOR ALL USING (public.is_admin(auth.uid()));
```

### journeys

```sql
CREATE POLICY "Anyone can view journeys" ON journeys
  FOR SELECT USING (true);
```

### journey_questions

```sql
CREATE POLICY "Anyone can view journey questions" ON journey_questions
  FOR SELECT USING (true);
```

### user_journeys

```sql
CREATE POLICY "Users access own journey progress" ON user_journeys
  FOR ALL USING (auth.uid() = user_id);
```

### journey_responses

```sql
CREATE POLICY "Users access own journey responses" ON journey_responses
  FOR ALL USING (auth.uid() = user_id);
```

### goals

```sql
CREATE POLICY "Users access own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);
```

### goal_milestones

```sql
CREATE POLICY "Users access own milestones" ON goal_milestones
  FOR ALL USING (
    goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid())
  );
```

### daily_questions

```sql
CREATE POLICY "Anyone can view daily questions" ON daily_questions
  FOR SELECT USING (true);
```

### daily_question_responses

```sql
CREATE POLICY "Users access own daily responses" ON daily_question_responses
  FOR ALL USING (auth.uid() = user_id);
```

### daily_sessions

```sql
CREATE POLICY "Users access own sessions" ON daily_sessions
  FOR ALL USING (auth.uid() = user_id);
```

### date_ideas

```sql
CREATE POLICY "Anyone can view date ideas" ON date_ideas
  FOR SELECT USING (true);
```

### user_date_ideas

```sql
CREATE POLICY "Users access own date ideas" ON user_date_ideas
  FOR ALL USING (auth.uid() = user_id);
```

### user_activities

```sql
CREATE POLICY "Users access own activities" ON user_activities
  FOR ALL USING (auth.uid() = user_id);
```

### system_settings

```sql
CREATE POLICY "Anyone can read settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL USING (public.is_admin(auth.uid()));
```

### user_preferences (migration 20260302120000)

```sql
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

### conflict_episodes (migration 20260302120000)

```sql
CREATE POLICY "Users access own conflict episodes" ON conflict_episodes
  FOR ALL USING (auth.uid() = user_id);
```

### outcome_assessments (migration 20260302120000)

```sql
CREATE POLICY "Users access own assessments" ON outcome_assessments
  FOR ALL USING (auth.uid() = user_id);
```

### analytics_events (migration 20260302120000)

```sql
CREATE POLICY "Users access own events" ON analytics_events
  FOR ALL USING (auth.uid() = user_id);
```

### vulnerability_escrow (migration 20260302213828)

```sql
CREATE POLICY "Users can insert own escrow" ON vulnerability_escrow
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read escrow they're part of" ON vulnerability_escrow
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can update escrow they're part of" ON vulnerability_escrow
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);
```

### weekly_insights (migration 20260303000000)

```sql
CREATE POLICY "Users access own weekly insights" ON weekly_insights
  FOR ALL USING (auth.uid() = user_id);
```

### partner_syntheses (migration 20260303000001)

```sql
CREATE POLICY "Users can read syntheses they are part of" ON partner_syntheses
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can insert syntheses they are part of" ON partner_syntheses
  FOR INSERT WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);
```

### graduation_reports (migration 20260303000002)

```sql
CREATE POLICY "Users access own graduation report" ON graduation_reports
  FOR ALL USING (auth.uid() = user_id);
```

### skill_progress (base schema)

```sql
CREATE POLICY "Users access own skill progress" ON skill_progress
  FOR ALL USING (auth.uid() = user_id);
```

### user_skill_tracks (migration 20260303000003)

```sql
CREATE POLICY "Users access own skill tracks" ON user_skill_tracks
  FOR ALL USING (auth.uid() = user_id);
```

### profile_traits (created directly on remote — no migration file)

```sql
-- User-scoped: users can read/write their own traits
CREATE POLICY "Users access own traits" ON profile_traits
  FOR ALL USING (auth.uid() = user_id);

-- Partner-visible: users can read partner's traits (for conflict guidance)
-- Used by GET /api/profile/traits?include_partner=true
CREATE POLICY "Users can view partner traits" ON profile_traits
  FOR SELECT USING (
    user_id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );
```

**Notes:**
- Server-side writes (profile-analysis.ts) use service role, bypassing RLS
- Partner read is limited to specific trait_keys (`conflict_style`, `love_language`) at the API level, but the RLS policy allows all columns — API-layer filtering is intentional
- Admin access: not explicitly needed since admin APIs use service role

### user_insights (created directly on remote — no migration file)

```sql
-- User-scoped: users can read/write their own insights
CREATE POLICY "Users access own insights" ON user_insights
  FOR ALL USING (auth.uid() = user_id);

-- Admin override: beta-testers API reads all users' insights
CREATE POLICY "Admins can view all insights" ON user_insights
  FOR SELECT USING (public.is_admin(auth.uid()));
```

**Notes:**
- Most writes happen server-side via service role (session start/complete, profile analysis)
- Frontend reads via PostgREST use the user's JWT, so user-scoped policy is required
- The admin beta-testers API reads across all users, requiring admin override

### daily_entries (created directly on remote — no migration file)

```sql
-- User-scoped: users access their own cached daily entries
CREATE POLICY "Users access own daily entries" ON daily_entries
  FOR ALL USING (auth.uid() = user_id);
```

### relationship_scores (created directly on remote — no migration file)

```sql
-- User-scoped: users can read/write their own score history
CREATE POLICY "Users access own relationship scores" ON relationship_scores
  FOR ALL USING (auth.uid() = user_id);

-- Admin override: KPI dashboard reads aggregate scores
CREATE POLICY "Admins can view all scores" ON relationship_scores
  FOR SELECT USING (public.is_admin(auth.uid()));
```

### safety_events (created directly on remote — no migration file)

```sql
-- User-scoped: users can read their own safety events (not typically exposed in UI)
CREATE POLICY "Users access own safety events" ON safety_events
  FOR ALL USING (auth.uid() = user_id);
```

**Notes:**
- Inserts happen server-side via service role (peter/chat.ts fire-and-forget)
- Reads happen server-side via service role (relationship-score.ts)
- User-scoped policy exists for completeness but is rarely exercised client-side

### coach_usage_daily (created directly on remote — no migration file)

```sql
-- User-scoped: users can read/write their own usage records
CREATE POLICY "Users access own coach usage" ON coach_usage_daily
  FOR ALL USING (auth.uid() = user_id);
```

**Notes:**
- All reads/writes happen server-side (peter/chat.ts) using the user's JWT passed through `getAuthedContext()`
- The upsert uses `onConflict: 'user_id,usage_date'` so the user-scoped ALL policy covers both insert and update

### memories (migration 20260318000000)

```sql
-- User-scoped: users can read/write their own memories
CREATE POLICY "Users access own memories" ON memories
  FOR ALL USING (auth.uid() = user_id);
```

**Notes:**
- All production reads/writes go through `src/lib/server/memory.ts` which uses a **service-role client** (bypasses RLS)
- The user-scoped policy exists as a safety net for any future direct PostgREST access
- No admin override needed — admin APIs use service role
- No partner-visible policy — memories are strictly private to each user

### user_entitlements (migration 20260315000000)

```sql
CREATE POLICY "Users can read own entitlements" ON user_entitlements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage entitlements" ON user_entitlements
  FOR ALL USING (public.is_admin(auth.uid()));
```

---

## Writing New RLS Policies

### Checklist

1. **Enable RLS** immediately after creating the table:
   ```sql
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
   ```

2. **Choose the pattern** based on who needs access:
   - Only the owning user? → User-scoped (`auth.uid() = user_id`)
   - Both partners? → Partner-visible (`auth.uid() IN (user_a_id, user_b_id)`)
   - Public catalog data? → Public read (`FOR SELECT USING (true)`)
   - Admin management? → Add admin override policy

3. **Use `FOR ALL`** when the access rule is the same for SELECT, INSERT, UPDATE, DELETE.

4. **Split into separate policies** when access differs by operation (e.g., vulnerability_escrow: INSERT checks `user_id`, SELECT/UPDATE checks either side).

5. **Avoid subqueries in hot paths** — the `goal_milestones` pattern (subquery on `goals`) works because milestones are rarely queried. For high-frequency tables, prefer a direct `user_id` column.

6. **Test with two users** — always verify that User A cannot see User B's data, and that partner policies work bidirectionally.

### Common Mistakes

- Forgetting `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` — without this, RLS policies are defined but not enforced
- Using `FOR INSERT` with `USING` instead of `WITH CHECK` — inserts require `WITH CHECK`
- Not adding an admin override when the table needs admin dashboard access
- Forgetting that `service_role` key bypasses all RLS — Edge Functions using service role need no policies, but API routes using user JWT do
