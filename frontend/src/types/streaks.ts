/**
 * Types for streak tracking and achievements
 */

export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  icon: string;
  type: string;
  awardedAt: string | null;
  createdAt: string | null;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streaks' | 'completions' | 'engagement';
  condition: (data: AchievementCheckData) => boolean;
  progress?: (data: AchievementCheckData) => number;
  maxProgress?: number;
}

export interface AchievementCheckData {
  currentStreak: number;
  longestStreak: number;
  sessionsCompleted: number;
  categoriesCompleted: string[];
  day14Viewed: boolean;
  answersShared: number;
  phasesCompleted: string[];
}

// Initial achievement definitions
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first session',
    icon: 'footprints',
    category: 'completions',
    condition: (data) => data.sessionsCompleted >= 1,
    progress: (data) => Math.min(data.sessionsCompleted, 1),
    maxProgress: 1,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    category: 'streaks',
    condition: (data) => data.currentStreak >= 7 || data.longestStreak >= 7,
    progress: (data) => Math.min(data.currentStreak, 7),
    maxProgress: 7,
  },
  {
    id: 'fortnight_champion',
    title: 'Fortnight Champion',
    description: 'Maintain a 14-day streak',
    icon: 'crown',
    category: 'streaks',
    condition: (data) => data.currentStreak >= 14 || data.longestStreak >= 14,
    progress: (data) => Math.min(data.currentStreak, 14),
    maxProgress: 14,
  },
  {
    id: 'phase_explorer',
    title: 'Phase Explorer',
    description: 'Complete a full phase',
    icon: 'compass',
    category: 'completions',
    condition: (data) => data.phasesCompleted.length > 0,
    progress: (data) => Math.min(data.phasesCompleted.length, 1),
    maxProgress: 1,
  },
  {
    id: 'mirror_gazer',
    title: 'Mirror Gazer',
    description: 'View the Day 14 narrative',
    icon: 'eye',
    category: 'engagement',
    condition: (data) => data.day14Viewed,
    progress: (data) => (data.day14Viewed ? 1 : 0),
    maxProgress: 1,
  },
  {
    id: 'sharer',
    title: 'Sharer',
    description: 'Share your first answer with your partner',
    icon: 'share-2',
    category: 'engagement',
    condition: (data) => data.answersShared >= 1,
    progress: (data) => Math.min(data.answersShared, 1),
    maxProgress: 1,
  },
];
