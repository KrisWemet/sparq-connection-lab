/** Compatibility for existing callers. Completion is a quiet wash of light,
 * with no particles or changes to the session/progress behavior. */
export function fireElegantConfetti() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('sparq:completion-glow'));
}
export function fireSubtleBurst() { fireElegantConfetti(); }
