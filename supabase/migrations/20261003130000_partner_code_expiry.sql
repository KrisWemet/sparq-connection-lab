-- Partner invite codes expire after 24 hours (Chris, 2026-10-03).
--
-- A code is valid only until partner_code_expires_at. The user makes a fresh
-- one with new_partner_code() whenever the last one has run out; a code also
-- stops working once it has been used to link. Existing codes have no expiry,
-- so they count as expired (no one had linked yet).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_code_expires_at timestamptz;

-- Clients may not set their own code, expiry or link directly (the profile
-- update policy would otherwise allow it); only the functions below do.
CREATE OR REPLACE FUNCTION public.guard_partner_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') AND (
       NEW.partner_code IS DISTINCT FROM OLD.partner_code
    OR NEW.partner_code_expires_at IS DISTINCT FROM OLD.partner_code_expires_at
    OR NEW.partner_id IS DISTINCT FROM OLD.partner_id
  ) THEN
    RAISE EXCEPTION 'partner link fields can only change through link functions';
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER profiles_guard_partner_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_partner_fields();

-- A fresh code, valid for 24 hours. Refuses while the current one is still
-- valid, so the code the user sent keeps working until it runs out.
CREATE OR REPLACE FUNCTION public.new_partner_code()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  me uuid := auth.uid();
  cur_code text;
  cur_exp timestamptz;
  fresh text;
BEGIN
  IF me IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_signed_in'); END IF;
  SELECT partner_code, partner_code_expires_at INTO cur_code, cur_exp FROM public.profiles WHERE id = me;
  IF cur_exp IS NOT NULL AND cur_exp > now() THEN
    RETURN jsonb_build_object('ok', true, 'code', upper(cur_code), 'expires_at', cur_exp);
  END IF;
  LOOP
    fresh := upper(encode(gen_random_bytes(4), 'hex'));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE upper(partner_code) = fresh);
  END LOOP;
  UPDATE public.profiles
     SET partner_code = fresh, partner_code_expires_at = now() + interval '24 hours'
   WHERE id = me
  RETURNING partner_code_expires_at INTO cur_exp;
  RETURN jsonb_build_object('ok', true, 'code', fresh, 'expires_at', cur_exp);
END;
$$;
REVOKE ALL ON FUNCTION public.new_partner_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.new_partner_code() TO authenticated;

CREATE OR REPLACE FUNCTION public.link_partner(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  my_partner uuid;
  target uuid;
  target_partner uuid;
  target_name text;
  target_exp timestamptz;
BEGIN
  IF me IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_signed_in'); END IF;

  SELECT p.id, p.partner_id, p.name, p.partner_code_expires_at
    INTO target, target_partner, target_name, target_exp
  FROM public.profiles p
  WHERE upper(p.partner_code) = upper(trim(code))
  LIMIT 1;

  IF target IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF target = me THEN RETURN jsonb_build_object('ok', false, 'reason', 'own_code'); END IF;

  SELECT p.partner_id INTO my_partner FROM public.profiles p WHERE p.id = me;
  IF my_partner = target AND target_partner = me THEN
    RETURN jsonb_build_object('ok', true, 'partner_name', target_name);
  END IF;
  IF target_exp IS NULL OR target_exp <= now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;
  IF my_partner IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'you_are_linked'); END IF;
  IF target_partner IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'they_are_linked'); END IF;

  UPDATE public.profiles SET partner_id = target WHERE id = me;
  -- The code is used up once it links.
  UPDATE public.profiles SET partner_id = me, partner_code_expires_at = now() WHERE id = target;

  RETURN jsonb_build_object('ok', true, 'partner_name', target_name);
END;
$$;
REVOKE ALL ON FUNCTION public.link_partner(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_partner(text) TO authenticated;
