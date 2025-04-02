/**
 * This file re-exports all Supabase services from the modular structure.
 * It maintains backward compatibility with existing code that imports from this file.
 */

// Re-export all services and types from the modular structure
export * from './supabase';

// For backward compatibility, we also export the individual services with their original names
import { 
  authService, 
  profileService, 
  partnerService, 
  journeyService, 
  goalService,
  adminService, 
  activityService
} from './supabase';

// Import types explicitly
import type {
  UserProfile,
  AuthCredentials,
  SignUpData,
  PartnerInvitation
} from './supabase';

// Legacy exports for backward compatibility
export { 
  authService,
  profileService,
  partnerService,
  journeyService,
  goalService,
  adminService
};

// Re-export types explicitly
export type {
  UserProfile,
  AuthCredentials,
  SignUpData,
  PartnerInvitation
};

// Helper functions
export const logUserActivity = activityService.logUserActivity.bind(activityService);
export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};