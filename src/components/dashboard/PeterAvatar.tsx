import { PeterCompanion, PeterCompanionProps } from '@/components/peter/PeterCompanion';
import { PeterState } from '@/lib/peter-presentation';

export type PeterMood = 'morning' | 'afternoon' | 'evening' | 'celebrating' | 'curious';
interface PeterAvatarProps extends PeterCompanionProps {
  mood?: PeterMood;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  isTyping?: boolean;
}
const states: Record<PeterMood, PeterState> = {
  morning: 'welcoming', afternoon: 'neutral', evening: 'reflective',
  celebrating: 'celebrating', curious: 'curious',
};

/** Compatibility entry point for existing screens. New callers can choose state directly. */
export function PeterAvatar({ mood, timeOfDay, isTyping = false, state, ...props }: PeterAvatarProps) {
  return <PeterCompanion {...props} state={state ?? (isTyping ? 'listening' : states[mood ?? timeOfDay ?? 'afternoon'])} />;
}
