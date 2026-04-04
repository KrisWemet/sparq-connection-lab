import { analyticsService } from '@/services/analyticsService';
import { buildAuthedHeaders } from '@/lib/api-auth';

const PRIMARY_PATH_SOURCE_KEY = 'sparq_beta_primary_source';

export function markPrimarySignupDrivenPath(source: 'signup' | 'register' = 'signup') {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PRIMARY_PATH_SOURCE_KEY, source);
}

export function getPrimarySignupDrivenSource(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(PRIMARY_PATH_SOURCE_KEY);
}

export function isPrimarySignupDrivenPathActive(): boolean {
  return Boolean(getPrimarySignupDrivenSource());
}

export async function trackPrimaryPathClientEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
) {
  const source = getPrimarySignupDrivenSource();
  if (!source) return;

  await analyticsService.trackEvent(eventName, {
    beta_path: 'primary_signup_driven',
    beta_path_source: source,
    ...properties,
  });
}

export async function submitPrimaryPathFeedback(input: {
  stage: string;
  message: string;
  sentiment?: number | null;
  context?: Record<string, unknown>;
}) {
  const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch('/api/beta/feedback', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...input,
      beta_path_source: getPrimarySignupDrivenSource(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send beta feedback');
  }
}

export async function reportPrimaryPathClientError(
  stage: string,
  error: unknown,
  context: Record<string, unknown> = {}
) {
  const source = getPrimarySignupDrivenSource();
  if (!source) return;

  try {
    const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
    await fetch('/api/beta/client-error', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        stage,
        beta_path_source: source,
        error_message: error instanceof Error ? error.message : String(error),
        error_name: error instanceof Error ? error.name : 'UnknownError',
        context,
      }),
    });
  } catch (reportError) {
    console.error('Primary path client error reporting failed:', reportError);
  }
}

export function shouldReportPrimaryPathRouteError(error: unknown, url: string): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const isCancelled =
    typeof error === 'object' &&
    error !== null &&
    'cancelled' in error &&
    Boolean((error as { cancelled?: boolean }).cancelled);

  const isExpectedRegisterRedirect =
    url === '/login?mode=register' &&
    (isCancelled || message === 'Route Cancelled');

  return !isExpectedRegisterRedirect;
}
