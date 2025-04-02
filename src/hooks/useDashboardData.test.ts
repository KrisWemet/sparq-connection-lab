import { renderHook, waitFor, act } from '@testing-library/react'; // Added act
import { useDashboardData } from './useDashboardData';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import the actual services to get access to the mocked functions
import { profileService, sharedEventService, goalService, promptService } from '@/services/supabase'; // Corrected: sharedEventService
import type { UserProfile, SharedEvent, Goal, CommunicationPrompt } from '@/services/supabase/types'; // Corrected types

// Mock the services (synchronous factory)
vi.mock('@/services/supabase', () => ({
  profileService: {
    getCurrentProfile: vi.fn(),
  },
  sharedEventService: {
    getSharedEvents: vi.fn(),
  },
  goalService: {
    getUserGoals: vi.fn(),
  },
  promptService: {
    getRandomPrompt: vi.fn(),
  },
  // Assuming other exports from @/services/supabase aren't needed directly in this test file
}));

// Cast the imported services to their mocked types for type safety
const mockedProfileService = vi.mocked(profileService);
const mockedSharedEventService = vi.mocked(sharedEventService); // Corrected service name
const mockedGoalService = vi.mocked(goalService);
const mockedPromptService = vi.mocked(promptService);


describe('useDashboardData', () => {
  // Mock data - adjusted to match actual types
  const mockProfile: UserProfile = { id: 'user-1', username: 'Test User', email: 'test@example.com', partnerId: 'user-2', subscriptionTier: 'free', isOnboarded: true, lastActive: new Date() };
  const mockEvents: SharedEvent[] = [{ id: 'event-1', title: 'Date Night', eventDatetime: new Date().toISOString(), description: 'Movie', creatorId: 'user-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'planned' }];
  const mockGoals: Goal[] = [{ id: 'goal-1', userId: 'user-1', title: 'Save for vacation', description: 'Save $1000', dueDate: new Date(Date.now() + 86400000 * 30).toISOString(), category: 'finance', progress: 50, isCompleted: false, createdAt: new Date(), updatedAt: new Date(), isShared: false }];
  const mockDailyPrompt: CommunicationPrompt = { id: 'prompt-1', text: 'What are you grateful for today?', category: 'gratitude', createdAt: new Date().toISOString() };


  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup default successful mocks with corrected methods
    mockedProfileService.getCurrentProfile.mockResolvedValue(mockProfile);
    mockedSharedEventService.getSharedEvents.mockResolvedValue(mockEvents); // Corrected service/method
    mockedGoalService.getUserGoals.mockResolvedValue(mockGoals); // Corrected method
    mockedPromptService.getRandomPrompt.mockResolvedValue(mockDailyPrompt); // Corrected method
  });

  it('should be in a loading state initially', () => {
    let result;
    act(() => {
      result = renderHook(() => useDashboardData()).result;
    });

    act(() => {
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.events).toEqual([]);
      expect(result.current.goals).toEqual([]);
      expect(result.current.dailyPrompt).toBeNull();
    });
  });

  it('should fetch data successfully and update state', async () => {
    const { result } = renderHook(() => useDashboardData());

    // Wait for the loading state to become false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert final state
    expect(result.current.error).toBeNull();
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.goals).toEqual(mockGoals);
    expect(result.current.dailyPrompt).toEqual(mockDailyPrompt);

    // Verify services were called with corrected methods
    expect(mockedProfileService.getCurrentProfile).toHaveBeenCalledTimes(1);
    expect(mockedSharedEventService.getSharedEvents).toHaveBeenCalledTimes(1); // Corrected service/method
    expect(mockedGoalService.getUserGoals).toHaveBeenCalledTimes(1); // Corrected method
    expect(mockedPromptService.getRandomPrompt).toHaveBeenCalledTimes(1); // Corrected method
  });

  it('should handle errors during data fetching', async () => {
    // Arrange: Mock one service to throw an error
    const mockError = new Error('Failed to fetch profile');
    mockedProfileService.getCurrentProfile.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(mockError), 200); // Reject after 200ms
      });
    });

    // Act: Render the hook
    const { result } = renderHook(() => useDashboardData());

    // Assert: Wait for loading to finish and check error state
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 500ms
    });

    expect(result.current.error).toBe(mockError);
    // Other data should remain in initial state or be null/empty
    expect(result.current.profile).toBeNull();
    expect(result.current.events).toEqual([]);
    expect(result.current.goals).toEqual([]);
    expect(result.current.dailyPrompt).toBeNull();

    // Verify services were still called (or attempted)
    expect(mockedProfileService.getCurrentProfile).toHaveBeenCalledTimes(1);
    // Depending on implementation (e.g., Promise.all), other calls might still happen
    // or might be skipped after the first error. Let's assume they are called.
    expect(mockedSharedEventService.getSharedEvents).toHaveBeenCalledTimes(1);
    expect(mockedGoalService.getUserGoals).toHaveBeenCalledTimes(1);
    expect(mockedPromptService.getRandomPrompt).toHaveBeenCalledTimes(1);
  });

  it('should refetch data when refetchData is called', async () => {
    // Arrange: Initial render and fetch
    const { result } = renderHook(() => useDashboardData());

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify initial calls
    expect(mockedProfileService.getCurrentProfile).toHaveBeenCalledTimes(1);
    expect(mockedSharedEventService.getSharedEvents).toHaveBeenCalledTimes(1);
    expect(mockedGoalService.getUserGoals).toHaveBeenCalledTimes(1);
    expect(mockedPromptService.getRandomPrompt).toHaveBeenCalledTimes(1);

    // Clear mock call counts before refetching
    mockedProfileService.getCurrentProfile.mockClear();
    mockedSharedEventService.getSharedEvents.mockClear();
    mockedGoalService.getUserGoals.mockClear();
    mockedPromptService.getRandomPrompt.mockClear();

    // Optional: Prepare different data for refetch if needed
    const refetchProfile: UserProfile = { ...mockProfile, username: 'Refetched User' };
    mockedProfileService.getCurrentProfile.mockResolvedValue(refetchProfile);

    // Act: Call refetchData
    // Need to import `act` from '@testing-library/react'
    await act(async () => {
      result.current.refetchData();
    });

    // Assert: Wait for refetch loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert final state reflects refetched data
    expect(result.current.error).toBeNull();
    expect(result.current.profile).toEqual(refetchProfile); // Check for updated profile
    expect(result.current.events).toEqual(mockEvents); // Assuming others didn't change
    expect(result.current.goals).toEqual(mockGoals);
    expect(result.current.dailyPrompt).toEqual(mockDailyPrompt);

    // Verify services were called again
    expect(mockedProfileService.getCurrentProfile).toHaveBeenCalledTimes(1);
    expect(mockedSharedEventService.getSharedEvents).toHaveBeenCalledTimes(1);
    expect(mockedGoalService.getUserGoals).toHaveBeenCalledTimes(1);
    expect(mockedPromptService.getRandomPrompt).toHaveBeenCalledTimes(1);
  });
});