-- Relationship Model + private/shared boundary (constitution §7, §8, §12;
-- spec: docs/RELATIONSHIP_MODEL.md).
--
-- Me & You  → each partner's private Person Model (existing tables, RLS own-row).
-- Us        → couple_spaces + shared_items: ONLY what a partner explicitly shared.
-- Cycles    → interaction_cycles: the pattern between two people, never a person.
-- Nothing here reads private tables; sharing is always an explicit insert by
-- the author, enforced by RLS rather than by prompts.

-- ── Couple space: one per mutually linked pair ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.couple_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_a_id < user_b_id),
  UNIQUE (user_a_id, user_b_id)
);
ALTER TABLE public.couple_spaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS couple_spaces_members_read ON public.couple_spaces;
CREATE POLICY couple_spaces_members_read ON public.couple_spaces
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
-- No client INSERT/UPDATE/DELETE: spaces are created only by
-- ensure_couple_space(), which verifies the link is mutual.

-- Returns the caller's couple space, creating it only when BOTH profiles
-- point at each other. SECURITY DEFINER because profiles RLS hides the
-- partner's row; it only ever acts on the caller's own mutual link.
CREATE OR REPLACE FUNCTION public.ensure_couple_space()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  partner uuid;
  space uuid;
BEGIN
  IF me IS NULL THEN RETURN NULL; END IF;
  SELECT p.partner_id INTO partner FROM public.profiles p WHERE p.id = me;
  IF partner IS NULL OR partner = me THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = partner AND p.partner_id = me) THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.couple_spaces (user_a_id, user_b_id)
  VALUES (LEAST(me, partner), GREATEST(me, partner))
  ON CONFLICT (user_a_id, user_b_id) DO NOTHING;
  SELECT id INTO space FROM public.couple_spaces
  WHERE user_a_id = LEAST(me, partner) AND user_b_id = GREATEST(me, partner);
  RETURN space;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_couple_space() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_couple_space() TO authenticated;

-- ── Us: things a partner explicitly chose to share ─────────────────────────
CREATE TABLE IF NOT EXISTS public.shared_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL
    CHECK (kind IN ('discovery', 'appreciation', 'need', 'value', 'ritual', 'agreement', 'memory', 'repair')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shared_items_space_idx ON public.shared_items (couple_space_id, created_at DESC);
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shared_items_members_read ON public.shared_items;
CREATE POLICY shared_items_members_read ON public.shared_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.couple_spaces cs
    WHERE cs.id = couple_space_id AND auth.uid() IN (cs.user_a_id, cs.user_b_id)
  ));
DROP POLICY IF EXISTS shared_items_author_insert ON public.shared_items;
CREATE POLICY shared_items_author_insert ON public.shared_items
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.couple_spaces cs
      WHERE cs.id = couple_space_id AND auth.uid() IN (cs.user_a_id, cs.user_b_id)
    )
  );
DROP POLICY IF EXISTS shared_items_author_delete ON public.shared_items;
CREATE POLICY shared_items_author_delete ON public.shared_items
  FOR DELETE USING (author_id = auth.uid());

-- ── Interaction cycles: the pattern between them, never a person ───────────
CREATE TABLE IF NOT EXISTS public.interaction_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),   -- e.g. "One of us reaches, one of us steps back"
  description text CHECK (char_length(description) <= 1000),
  what_helps text CHECK (char_length(what_helps) <= 1000),           -- Connection & Repair
  proposed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confirmed_by uuid[] NOT NULL DEFAULT '{}',                         -- a cycle is "ours" only when both confirm
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.interaction_cycles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS interaction_cycles_members ON public.interaction_cycles;
CREATE POLICY interaction_cycles_members ON public.interaction_cycles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.couple_spaces cs
    WHERE cs.id = couple_space_id AND auth.uid() IN (cs.user_a_id, cs.user_b_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.couple_spaces cs
    WHERE cs.id = couple_space_id AND auth.uid() IN (cs.user_a_id, cs.user_b_id)
  ));

COMMENT ON TABLE public.partner_syntheses IS
  'DEPRECATED (Relationship Model): auto-blended private reflections without explicit sharing (constitution §8). Superseded by shared_items.';
