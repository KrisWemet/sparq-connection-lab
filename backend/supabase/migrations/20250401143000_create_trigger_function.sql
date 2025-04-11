-- Define the trigger function to set updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This function is SECURITY DEFINER if needed, but usually SECURITY INVOKER is fine for triggers.
-- If SECURITY DEFINER is required, add: SET search_path = public; inside the function or ensure the user running migrations has necessary privileges.