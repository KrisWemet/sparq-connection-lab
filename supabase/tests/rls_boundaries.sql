-- Private/shared boundary check (constitution §8, §12, §13).
-- Run in the Supabase SQL editor (or the MCP execute_sql tool). It simulates
-- three users inside one DO block and always ends with RAISE EXCEPTION, so
-- the whole transaction rolls back and NOTHING is persisted.
--
-- Expected result (2026-09-30, reasons added the same day):
--   A space created=true | A forge-as-B=blocked | B sees shared=1 |
--   B sees A discoveries=0 | B sees A experiments=0 | B sees A reasons=0 | B sees A rejections=0 |
--   B sees A identity evidence=0 | B sees A growth arcs=0 |   (v1.2, after 20261001100000)
--   B sees A traits=0 | B sees A memories=0 | B deletes A item=0 | B same space=true |
--   C space=none | C sees shared=0 | C sees spaces=0 | C insert=blocked |
--   C create space directly=blocked
-- Any "ALLOWED(BAD)" or a non-zero "B sees A …" is a privacy leak.

DO $$
DECLARE
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  space uuid; space_c uuid; r text := ''; n int;
BEGIN
  INSERT INTO auth.users (id, email, aud, role) VALUES
    (a, a||'@rls.test', 'authenticated', 'authenticated'),
    (b, b||'@rls.test', 'authenticated', 'authenticated'),
    (c, c||'@rls.test', 'authenticated', 'authenticated');
  INSERT INTO public.profiles (id, name, email) VALUES (a, 'A', a||'@rls.test'), (b, 'B', b||'@rls.test'), (c, 'C', c||'@rls.test') ON CONFLICT (id) DO NOTHING;
  UPDATE public.profiles SET partner_id = b WHERE id = a;
  UPDATE public.profiles SET partner_id = a WHERE id = b;
  UPDATE public.profiles SET partner_id = a WHERE id = c;  -- one-sided claim

  -- A: private rows + a space + one explicitly shared item
  PERFORM set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  INSERT INTO public.self_discoveries (user_id, discovery) VALUES (a, 'private to A');
  INSERT INTO public.experiments (user_id, intention) VALUES (a, 'private plan of A');
  INSERT INTO public.user_reasons (user_id, reason_text) VALUES (a, 'private reason of A');
  INSERT INTO public.rejected_hypotheses (user_id, offered_text) VALUES (a, 'a guess A rejected');
  -- v1.2 (needs 20261001100000_transformation_engine.sql)
  INSERT INTO public.identity_evidence (user_id, identity_line, evidence_type, note) VALUES (a, 'someone who stays', 'experiment', 'private step of A');
  INSERT INTO public.growth_arcs (user_id, arc_key, carry_forward) VALUES (a, 'day_30', 'private arc of A');
  space := public.ensure_couple_space();
  r := r || 'A space created=' || (space IS NOT NULL);
  INSERT INTO public.shared_items (couple_space_id, author_id, kind, body) VALUES (space, a, 'appreciation', 'shared by A');
  BEGIN
    INSERT INTO public.shared_items (couple_space_id, author_id, kind, body) VALUES (space, b, 'appreciation', 'forged as B');
    r := r || ' | A forge-as-B=ALLOWED(BAD)';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN r := r || ' | A forge-as-B=blocked';
  END;
  EXECUTE 'RESET ROLE';

  -- B: sees what A shared, never A's private rows
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  SELECT count(*) INTO n FROM public.shared_items WHERE couple_space_id = space; r := r || ' | B sees shared=' || n;
  SELECT count(*) INTO n FROM public.self_discoveries; r := r || ' | B sees A discoveries=' || n;
  SELECT count(*) INTO n FROM public.experiments; r := r || ' | B sees A experiments=' || n;
  SELECT count(*) INTO n FROM public.user_reasons; r := r || ' | B sees A reasons=' || n;
  SELECT count(*) INTO n FROM public.rejected_hypotheses; r := r || ' | B sees A rejections=' || n;
  SELECT count(*) INTO n FROM public.identity_evidence; r := r || ' | B sees A identity evidence=' || n;
  SELECT count(*) INTO n FROM public.growth_arcs; r := r || ' | B sees A growth arcs=' || n;
  SELECT count(*) INTO n FROM public.profile_traits WHERE user_id = a; r := r || ' | B sees A traits=' || n;
  SELECT count(*) INTO n FROM public.memories WHERE user_id = a; r := r || ' | B sees A memories=' || n;
  DELETE FROM public.shared_items WHERE couple_space_id = space; GET DIAGNOSTICS n = ROW_COUNT; r := r || ' | B deletes A item=' || n;
  r := r || ' | B same space=' || (public.ensure_couple_space() = space);
  EXECUTE 'RESET ROLE';

  -- C: a one-sided claim gets no space and cannot get in
  PERFORM set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  space_c := public.ensure_couple_space(); r := r || ' | C space=' || coalesce(space_c::text, 'none');
  SELECT count(*) INTO n FROM public.shared_items; r := r || ' | C sees shared=' || n;
  SELECT count(*) INTO n FROM public.couple_spaces; r := r || ' | C sees spaces=' || n;
  BEGIN
    INSERT INTO public.shared_items (couple_space_id, author_id, kind, body) VALUES (space, c, 'memory', 'intruder');
    r := r || ' | C insert=ALLOWED(BAD)';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN r := r || ' | C insert=blocked';
  END;
  BEGIN
    INSERT INTO public.couple_spaces (user_a_id, user_b_id) VALUES (LEAST(a, c), GREATEST(a, c));
    r := r || ' | C create space directly=ALLOWED(BAD)';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN r := r || ' | C create space directly=blocked';
  END;
  EXECUTE 'RESET ROLE';

  RAISE EXCEPTION 'RLS_RESULT: %', r;  -- aborts: nothing is persisted
END $$;
