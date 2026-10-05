# Runbook: `20261004100000_journey_state.sql`

**Status:** written and verified on a local copy of the live schema (2026-10-04). **Not applied to production.** Applying it needs Chris's go-ahead.

## What it changes

This migration is mostly additive, but two steps are not:

| Change | Kind | Reversible? |
|---|---|---|
| **Drops the foreign key** `user_journeys_journey_id_fkey` (`user_journeys.journey_id → journeys.id`) | Structural | Yes, if every `journey_id` is a UUID that exists in `journeys` (it won't be after new code runs: see Recovery) |
| **Changes the type** of `user_journeys.journey_id` from `uuid` to `text` | Structural | `uuid → text` is lossless. `text → uuid` only works for rows that hold UUIDs |
| Adds `status`, `stage`, `journey_day`, `stage_progress`, `last_step_at`, `paused_at`, `left_at`, `updated_at` with defaults | Additive | Yes (drop columns) |
| Adds CHECK constraints on `status`, `stage`, `journey_day` | Additive | Yes |
| Adds unique partial index `user_journeys_one_active` (one active journey per user) | Additive | Yes |
| Rewrites `status` for rows written before it existed; pauses all but the newest active row per user | Data | Rows are restorable from the backup |
| **Backfills** one `user_journeys` row per user with `user_insights.active_journey_id`, and one `completed` row per `last_completed_journey_id` | Data | Yes (delete rows whose `journey_id` isn't a UUID). `user_insights` itself is not modified |
| Creates `journey_step_entries` (private answers, RLS own-row) | Additive | Yes (drop table, which loses answers saved after deploy) |

Why the type change and FK drop: every journey id in the app is a text slug (`building-trust`, `communication`). The `journeys` table that the FK points to has **0 rows**, so `user_journeys` could never hold a real journey. Live state on 2026-10-04: `user_journeys` 0 rows, `journeys` 0 rows, 15 users with an `active_journey_id`.

Nothing else references `user_journeys.journey_id` (no views, no other FKs, no triggers on the table). `journey_responses` and `ai_journey_content` still have UUID FKs to `journeys`; they're untouched.

## Pre-flight checks (read-only)

Run these first. Stop if any result is unexpected.

```sql
-- 1. Current shape: expect journey_id = uuid, FK present, no status column yet.
select column_name, data_type from information_schema.columns
 where table_schema='public' and table_name='user_journeys' order by ordinal_position;
select conname from pg_constraint where conrelid='public.user_journeys'::regclass;

-- 2. Row counts to compare after.
select (select count(*) from public.user_journeys) as user_journeys,
       (select count(*) from public.journeys) as journeys,
       (select count(*) from public.user_insights where active_journey_id is not null) as active_pointers,
       (select count(*) from public.user_insights where last_completed_journey_id is not null) as completed_pointers;

-- 3. Nothing else depends on the column (expect 0 rows).
select distinct v.relname from pg_depend d join pg_rewrite r on r.oid=d.objid
  join pg_class v on v.oid=r.ev_class
 where d.refobjid='public.user_journeys'::regclass and v.relname<>'user_journeys';

-- 4. Pointers that the new code won't recognize (expect 0 rows).
select active_journey_id, count(*) from public.user_insights
 where active_journey_id is not null
   and active_journey_id not in ('deepening-good','staying-grounded','building-trust','opening-heart','shared-language',
     'safe-in-love','calm-before-closeness','mixed-feelings','healing-old-wounds')
 group by 1;
```

## Backup

Take both:

1. **Platform backup.** In the Supabase dashboard go to Database → Backups and confirm a recent backup exists (or take one, if the plan allows). Note its timestamp in the PR.
2. **In-database copies** of everything the migration touches. They go in a private `backup` schema, never `public`: tables in `public` are served by the REST API, and a `CREATE TABLE AS` copy has no RLS.

```sql
create schema if not exists backup;
revoke all on schema backup from anon, authenticated;
create table backup.user_journeys_20261004 as table public.user_journeys;
create table backup.user_insights_journey_20261004 as
  select user_id, active_journey_id, last_completed_journey_id, journey_completion_state,
         recommended_next_journeys, onboarding_day
  from public.user_insights;
select (select count(*) from backup.user_journeys_20261004) as uj,
       (select count(*) from backup.user_insights_journey_20261004) as ui;
```

Drop the `backup` schema once the release has been stable for two weeks.

## Deployment order

Apply the migration **before** the new code is deployed, and deploy right after. Why that order:

- **New code on the old schema** degrades without breaking anything. Starter journeys keep working through the `user_insights` pointer (fallbacks in `journey-state.ts` and `session/complete.ts`). Staged journeys can't save progress (the API returns 503), and the browser import retries later, so nothing is lost. This is what happens if the deploy accidentally lands first.
- **Old code on the new schema** works, but it doesn't write `user_journeys`. A user who starts, leaves or finishes a journey in that window ends up with a `user_journeys` row that disagrees with `user_insights`. The reconcile step below fixes those rows. Keep the window short.

Steps:

1. Pre-flight checks (above).
2. Backups (above).
3. **Apply** `supabase/migrations/20261004100000_journey_state.sql` as one transaction (the Supabase migration tool or `psql -1 -f …`). If any statement fails, nothing is applied. The migration is idempotent, so a re-run is safe.
4. **Verify** (expected results in comments):
   ```sql
   select data_type from information_schema.columns
    where table_name='user_journeys' and column_name='journey_id';               -- text
   select count(*) from pg_constraint where conname='user_journeys_journey_id_fkey'; -- 0
   select status, count(*) from public.user_journeys group by 1;                  -- active = active_pointers from pre-flight
   select user_id, count(*) from public.user_journeys where status='active'
    group by 1 having count(*) > 1;                                                -- 0 rows
   select tablename, policyname from pg_policies where tablename='journey_step_entries'; -- journey_step_entries_own
   ```
5. **Merge the PR**. Vercel deploys `main` to production.
6. **Reconcile** whatever happened between steps 3 and 5. Safe to run more than once:
   ```sql
   -- Journeys started by old code in the gap: re-run the backfill (inserts only where no active row exists).
   insert into public.user_journeys (user_id, journey_id, status, is_active, journey_day, progress, start_date)
   select ui.user_id, ui.active_journey_id, 'active', true,
          coalesce((select max(ds.journey_day_index) from public.daily_sessions ds
                     where ds.user_id=ui.user_id and ds.journey_id=ui.active_journey_id and ds.status='completed'),0)+1,
          coalesce((select count(distinct ds.journey_day_index) from public.daily_sessions ds
                     where ds.user_id=ui.user_id and ds.journey_id=ui.active_journey_id and ds.status='completed'),0),
          now()
   from public.user_insights ui
   where ui.active_journey_id is not null
     and not exists (select 1 from public.user_journeys a where a.user_id=ui.user_id and a.status='active')
   on conflict (user_id, journey_id) do update set status='active', is_active=true;
   -- Journeys old code finished or left in the gap: the row says active but the pointer moved on.
   update public.user_journeys uj set status = case when ui.last_completed_journey_id = uj.journey_id then 'completed' else 'left' end,
          is_active=false, completed_at = case when ui.last_completed_journey_id = uj.journey_id then coalesce(uj.completed_at, now()) end,
          left_at = case when ui.last_completed_journey_id = uj.journey_id then null else now() end
   from public.user_insights ui
   where ui.user_id=uj.user_id and uj.status='active' and ui.active_journey_id is distinct from uj.journey_id;
   ```
7. **Smoke test** on production with a test account: open `/journeys`, start a staged journey, save one day, pause, resume; open `/dashboard` and check the journey title and day.

## Recovery

**First choice: roll back the app, keep the schema.** Use Vercel → Deployments → previous production deployment → Promote / Instant Rollback. The previous code runs correctly on the migrated schema: it reads and writes the `user_insights` pointer, which the new code keeps in step, and it never reads the new columns. No database change is needed, and nothing users saved is lost: their `user_journeys` and `journey_step_entries` rows stay in place for when the new code returns.

**Only if the schema itself must be reverted** (for example, the migration caused a problem the app rollback doesn't fix):

1. Roll back the app first (above). The new code requires the new schema.
2. Keep what users saved since deploy:
   ```sql
   create table backup.user_journeys_rollback as table public.user_journeys;
   create table backup.journey_step_entries_rollback as table public.journey_step_entries;
   ```
3. Revert, in one transaction:
   ```sql
   begin;
   drop table if exists public.journey_step_entries;
   drop index if exists public.user_journeys_one_active;
   alter table public.user_journeys
     drop constraint if exists user_journeys_status_check,
     drop constraint if exists user_journeys_stage_check,
     drop constraint if exists user_journeys_journey_day_check,
     drop column if exists status, drop column if exists stage, drop column if exists journey_day,
     drop column if exists stage_progress, drop column if exists last_step_at,
     drop column if exists paused_at, drop column if exists left_at, drop column if exists updated_at;
   -- Slug rows can't be UUIDs. They're all derived from user_insights (kept intact) or saved in step 2.
   delete from public.user_journeys where journey_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
   alter table public.user_journeys alter column journey_id type uuid using journey_id::uuid;
   alter table public.user_journeys add constraint user_journeys_journey_id_fkey
     foreign key (journey_id) references public.journeys(id) on delete cascade;
   commit;
   ```
4. If you need the exact pre-migration rows, restore from `backup.user_journeys_20261004` (it was empty on 2026-10-04).

The revert SQL was run against the local test database after the walkthrough. It succeeded, and re-applying the migration afterwards worked (see the PR).

## Verified locally

- A local Supabase stack built from the live schema as of 2026-10-04: tables, constraints, RLS, and the signup/session triggers taken from the live catalog.
- Pre-migration users were seeded, the migration was applied in one transaction, and the per-journey backfill was checked (2 completed days on a journey → next day 3).
- Browser walkthrough of onboarding, switching, pause/leave/resume, browser import, completion and choosing another journey (36 checks). The PR has details.
