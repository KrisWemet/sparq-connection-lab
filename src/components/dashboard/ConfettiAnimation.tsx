import { CompletionLight } from '@/components/emotion/EmotionalEnvironment';
/** Adapter for the existing quiz completion flow. */
export function ConfettiAnimation({ show }: { show: boolean }) {
  return <CompletionLight show={show} />;
}
