import type { SupabaseClient } from '@supabase/supabase-js';
import { trackEvent } from '@/lib/server/analytics';

export async function trackPrimaryPathServerError(
  supabase: SupabaseClient,
  userId: string,
  stage: string,
  error: unknown,
  context: Record<string, unknown> = {}
) {
  await trackEvent(supabase, userId, 'beta_primary_path_error', {
    beta_path: 'primary_signup_driven',
    stage,
    error_message: error instanceof Error ? error.message : String(error),
    error_name: error instanceof Error ? error.name : 'UnknownError',
    ...context,
  });
}
