import { test, expect } from '@playwright/test';
import {
  JourneyDetailStartError,
  requireJourneyActivationSuccess,
  requireOnboardingProfilePersistenceSuccess,
  resolveJourneyDetailStartFailure,
} from '@/lib/onboarding/journeyDetailStartPolicy';

test.describe('JourneyDetail fail-closed policy', () => {
  test('throws a narrow activation error when journey activation fails', async () => {
    const failingResponse = {
      ok: false,
      status: 500,
      text: async () => '{"error":"Failed to activate journey"}',
    };

    await expect(
      requireJourneyActivationSuccess(failingResponse, {
        journeyId: 'building-trust',
        activationType: 'starter_activate',
      })
    ).rejects.toBeInstanceOf(JourneyDetailStartError);

    try {
      await requireJourneyActivationSuccess(failingResponse, {
        journeyId: 'building-trust',
        activationType: 'starter_activate',
      });
    } catch (error) {
      expect(resolveJourneyDetailStartFailure(error)).toEqual({
        stage: 'journey_detail_activation',
        context: {
          journey_id: 'building-trust',
          activation_type: 'starter_activate',
          response_status: 500,
          response_body: '{"error":"Failed to activate journey"}',
        },
      });
    }
  });

  test('throws a narrow persistence error when onboarding profile write fails', async () => {
    expect(() =>
      requireOnboardingProfilePersistenceSuccess({
        journeyId: 'building-trust',
        userId: 'user-123',
        error: {
          message: 'row update failed',
          code: 'PGRST116',
        },
      })
    ).toThrow(JourneyDetailStartError);

    try {
      requireOnboardingProfilePersistenceSuccess({
        journeyId: 'building-trust',
        userId: 'user-123',
        error: {
          message: 'row update failed',
          code: 'PGRST116',
        },
      });
    } catch (error) {
      expect(resolveJourneyDetailStartFailure(error)).toEqual({
        stage: 'journey_detail_profile_persist',
        context: {
          journey_id: 'building-trust',
          user_id: 'user-123',
          error_code: 'PGRST116',
        },
      });
    }
  });

  test('allows success to continue when activation and persistence succeed', async () => {
    await expect(
      requireJourneyActivationSuccess(
        {
          ok: true,
          status: 200,
          text: async () => '',
        },
        {
          journeyId: 'building-trust',
          activationType: 'starter_activate',
        }
      )
    ).resolves.toBeUndefined();

    expect(() =>
      requireOnboardingProfilePersistenceSuccess({
        journeyId: 'building-trust',
        userId: 'user-123',
        error: null,
      })
    ).not.toThrow();
  });
});
