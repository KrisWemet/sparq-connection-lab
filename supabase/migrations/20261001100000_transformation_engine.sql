-- Transformation Engine (constitution v1.2 §1A, §5B, §11A–§11D, §12;
-- docs/PERSON_MODEL.md §9, docs/TRANSFORMATION_ENGINE.md).
-- Additive only: every new column is nullable or defaulted, so code on main
-- keeps working. App code is fail-soft until this runs (it retries without
-- the new columns when they are missing).

-- ── 1. Experiments → Real-World Missions (§11A) ───────────────────────────
ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'experiment',
  ADD COLUMN IF NOT EXISTS cue text,                         -- the "when X" half, in their words
  ADD COLUMN IF NOT EXISTS skill_key text,                   -- practiced skill, for adaptive difficulty
  ADD COLUMN IF NOT EXISTS difficulty_level smallint,        -- step on that skill's ladder
  ADD COLUMN IF NOT EXISTS domain text NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS revised_from uuid REFERENCES public.experiments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS learning jsonb,                   -- {felt, what_helped, what_got_in_way, surprise}
  ADD COLUMN IF NOT EXISTS environment_note text,            -- what makes it easier/harder (their words)
  ADD COLUMN IF NOT EXISTS accepted_from_suggestion boolean NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE public.experiments ADD CONSTRAINT experiments_kind_check
    CHECK (kind IN ('experiment', 'mission'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.experiments ADD CONSTRAINT experiments_domain_check
    CHECK (domain IN ('self', 'partner', 'family', 'friends', 'work', 'community'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 'revised' = reshaped into a new version (adaptation, never failure).
ALTER TABLE public.experiments DROP CONSTRAINT IF EXISTS experiments_status_check;
ALTER TABLE public.experiments ADD CONSTRAINT experiments_status_check
  CHECK (status IN ('planned', 'tried', 'skipped', 'let_go', 'revised'));

CREATE INDEX IF NOT EXISTS experiments_user_skill_idx
  ON public.experiments (user_id, skill_key, resolved_at DESC) WHERE skill_key IS NOT NULL;

-- ── 2. Deep Why chains (§5B) ──────────────────────────────────────────────
ALTER TABLE public.user_reasons
  ADD COLUMN IF NOT EXISTS parent_reason_id uuid REFERENCES public.user_reasons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS depth smallint,
  ADD COLUMN IF NOT EXISTS is_bedrock boolean NOT NULL DEFAULT false;

ALTER TABLE public.user_reasons DROP CONSTRAINT IF EXISTS user_reasons_attached_type_check;
ALTER TABLE public.user_reasons ADD CONSTRAINT user_reasons_attached_type_check
  CHECK (attached_type IN ('value', 'north_star', 'discovery', 'experiment', 'intention',
                           'goal', 'mission', 'identity', 'relationship_intention', 'contribution'));
ALTER TABLE public.user_reasons DROP CONSTRAINT IF EXISTS user_reasons_source_check;
ALTER TABLE public.user_reasons ADD CONSTRAINT user_reasons_source_check
  CHECK (source IN ('evening', 'chat', 'mirror', 'ladder', 'onboarding', 'experiment_card', 'deep_why'));

-- ── 3. Identity evidence (§11B) ───────────────────────────────────────────
-- Only behavior the USER linked to the identity they named. Private.
CREATE TABLE IF NOT EXISTS public.identity_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_line text NOT NULL,                 -- the user's North Star words at the time
  direction text NOT NULL DEFAULT 'consistent' CHECK (direction IN ('consistent', 'inconsistent')),
  evidence_type text NOT NULL CHECK (evidence_type IN ('experiment', 'reflection', 'growth_moment')),
  evidence_id uuid,
  note text,                                   -- short, the user's words
  user_interpretation text,                    -- what they said it means, if anything
  asked_at timestamptz,                        -- when Sparq asked "does this change how you see yourself?"
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS identity_evidence_user_idx ON public.identity_evidence (user_id, created_at DESC);
ALTER TABLE public.identity_evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS identity_evidence_own ON public.identity_evidence;
CREATE POLICY identity_evidence_own ON public.identity_evidence
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 4. Growth arcs / rites of passage (§11C) ──────────────────────────────
-- Every field is written by the user. Peter supplies evidence, never meaning.
CREATE TABLE IF NOT EXISTS public.growth_arcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arc_key text NOT NULL,                       -- e.g. 'day_30', 'skill:stay_present'
  used_to text,
  discovered text,
  practiced text,
  changed text,
  still_struggle text,
  now_believe text,
  carry_forward text,
  ready_next text,
  who_benefits text,                           -- contribution (§11D), only if they choose to answer
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, arc_key)
);
ALTER TABLE public.growth_arcs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS growth_arcs_own ON public.growth_arcs;
CREATE POLICY growth_arcs_own ON public.growth_arcs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 5. Transformation metrics (§10; docs/METRICS.md) ──────────────────────
-- Aggregate counts only. Wraps the v1.1 function and adds v1.2 signals.
CREATE OR REPLACE FUNCTION public.transformation_metrics(window_days int DEFAULT 28)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since timestamptz := now() - make_interval(days => GREATEST(1, LEAST(window_days, 365)));
  missions_resolved int; missions_tried int; missions_with_learning int;
  missions_revised int; setbacks int; persisted int;
  user_designed int; accepted int;
  identity_steps int; arcs int; deep_whys int; contribution int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE status = 'tried'),
         count(*) FILTER (WHERE learning IS NOT NULL),
         count(*) FILTER (WHERE status = 'revised'),
         count(*) FILTER (WHERE status IN ('skipped', 'let_go', 'revised'))
    INTO missions_resolved, missions_tried, missions_with_learning, missions_revised, setbacks
    FROM experiments WHERE resolved_at >= since;

  -- Growth persistence: a setback followed by another attempt within 14 days.
  SELECT count(DISTINCT s.id) INTO persisted
    FROM experiments s
    JOIN experiments n ON n.user_id = s.user_id
      AND n.created_at > s.resolved_at AND n.created_at <= s.resolved_at + interval '14 days'
    WHERE s.resolved_at >= since AND s.status IN ('skipped', 'let_go', 'revised');

  SELECT count(*) FILTER (WHERE NOT accepted_from_suggestion), count(*) FILTER (WHERE accepted_from_suggestion)
    INTO user_designed, accepted FROM experiments WHERE created_at >= since;
  SELECT count(*) INTO identity_steps FROM identity_evidence WHERE created_at >= since AND direction = 'consistent';
  SELECT count(*) INTO arcs FROM growth_arcs WHERE completed_at >= since;
  SELECT count(DISTINCT attached_id) INTO deep_whys FROM user_reasons WHERE created_at >= since AND source = 'deep_why';
  SELECT count(*) INTO contribution FROM experiments
    WHERE created_at >= since AND domain IN ('family', 'friends', 'work', 'community');

  RETURN jsonb_build_object(
    'window_days', window_days,
    'missions_resolved', missions_resolved,
    'missions_tried', missions_tried,
    'reflection_rate', CASE WHEN missions_resolved > 0 THEN round(missions_with_learning::numeric / missions_resolved, 3) END,
    'missions_revised', missions_revised,
    'setbacks', setbacks,
    'adaptation_rate', CASE WHEN setbacks > 0 THEN round(missions_revised::numeric / setbacks, 3) END,
    'persistence_after_setback', CASE WHEN setbacks > 0 THEN round(persisted::numeric / setbacks, 3) END,
    'user_designed', user_designed,
    'accepted_from_suggestion', accepted,
    'user_designed_share', CASE WHEN user_designed + accepted > 0 THEN round(user_designed::numeric / (user_designed + accepted), 3) END,
    'identity_steps', identity_steps,
    'growth_arcs', arcs,
    'deep_whys', deep_whys,
    'contribution_missions', contribution
  );
END;
$$;
REVOKE ALL ON FUNCTION public.transformation_metrics(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transformation_metrics(int) TO authenticated;
