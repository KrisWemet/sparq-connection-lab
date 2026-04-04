export type JourneyDetailStartStage =
  | 'journey_detail_activation'
  | 'journey_detail_profile_persist'
  | 'journey_detail_start';

type JourneyActivationType = 'legacy_start' | 'starter_activate';

type MinimalResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

type MinimalSupabaseError = {
  message?: string;
  code?: string;
} | null;

export class JourneyDetailStartError extends Error {
  stage: JourneyDetailStartStage;
  context: Record<string, unknown>;

  constructor(stage: JourneyDetailStartStage, message: string, context: Record<string, unknown>) {
    super(message);
    this.name = 'JourneyDetailStartError';
    this.stage = stage;
    this.context = context;
  }
}

export async function requireJourneyActivationSuccess(
  response: MinimalResponse,
  input: {
    journeyId: string;
    activationType: JourneyActivationType;
  }
) {
  if (response.ok) return;

  let responseBody = '';
  try {
    responseBody = (await response.text()).slice(0, 200);
  } catch {
    responseBody = '';
  }

  throw new JourneyDetailStartError(
    'journey_detail_activation',
    `Journey activation failed for ${input.journeyId}`,
    {
      journey_id: input.journeyId,
      activation_type: input.activationType,
      response_status: response.status,
      ...(responseBody ? { response_body: responseBody } : {}),
    }
  );
}

export function requireOnboardingProfilePersistenceSuccess(input: {
  journeyId: string;
  userId: string;
  error: MinimalSupabaseError;
}) {
  if (!input.error) return;

  throw new JourneyDetailStartError(
    'journey_detail_profile_persist',
    input.error.message || `Failed to persist onboarding profile state for ${input.userId}`,
    {
      journey_id: input.journeyId,
      user_id: input.userId,
      ...(input.error.code ? { error_code: input.error.code } : {}),
    }
  );
}

export function resolveJourneyDetailStartFailure(
  error: unknown,
  fallbackContext: Record<string, unknown> = {}
) {
  if (error instanceof JourneyDetailStartError) {
    return {
      stage: error.stage,
      context: error.context,
    };
  }

  return {
    stage: 'journey_detail_start' as JourneyDetailStartStage,
    context: fallbackContext,
  };
}
