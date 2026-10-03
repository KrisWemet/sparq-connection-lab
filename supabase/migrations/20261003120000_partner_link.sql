-- Partner linking by code (2026-10-03).
--
-- Linking never worked: the client wrote the inviter's profile row (blocked by
-- RLS) and used partner_invitations columns that don't exist. Every profile
-- already has a partner_code; sharing it is the consent to link. Either
-- partner can unlink at any time. Linking shares nothing by itself — "Us"
-- still holds only what each partner explicitly shares (RELATIONSHIP_MODEL.md).

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
BEGIN
  IF me IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_signed_in'); END IF;

  SELECT p.id, p.partner_id, p.name INTO target, target_partner, target_name
  FROM public.profiles p
  WHERE upper(p.partner_code) = upper(trim(code))
  LIMIT 1;

  IF target IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF target = me THEN RETURN jsonb_build_object('ok', false, 'reason', 'own_code'); END IF;

  SELECT p.partner_id INTO my_partner FROM public.profiles p WHERE p.id = me;
  IF my_partner = target AND target_partner = me THEN
    RETURN jsonb_build_object('ok', true, 'partner_name', target_name);
  END IF;
  IF my_partner IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'you_are_linked'); END IF;
  IF target_partner IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'they_are_linked'); END IF;

  UPDATE public.profiles SET partner_id = target WHERE id = me;
  UPDATE public.profiles SET partner_id = me WHERE id = target;

  RETURN jsonb_build_object('ok', true, 'partner_name', target_name);
END;
$$;
REVOKE ALL ON FUNCTION public.link_partner(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_partner(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.unlink_partner()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  partner uuid;
BEGIN
  IF me IS NULL THEN RETURN; END IF;
  SELECT p.partner_id INTO partner FROM public.profiles p WHERE p.id = me;
  UPDATE public.profiles SET partner_id = NULL WHERE id = me;
  -- Only clear the other side if it points back at me.
  IF partner IS NOT NULL THEN
    UPDATE public.profiles SET partner_id = NULL WHERE id = partner AND partner_id = me;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.unlink_partner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlink_partner() TO authenticated;
