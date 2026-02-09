/**
 * useSessionPsychology hook
 *
 * Provides phase-aware psychology features for the session UI:
 * - Color scheme based on discovery phase (color psychology)
 * - Priming messages for session start
 * - Archetype color accents
 * - CSS variables for dynamic theming
 *
 * Usage:
 * ```tsx
 * const { phaseColors, archetypeAccent, cssVars } = useSessionPsychology(phase, archetype);
 * return <div style={cssVars}>...</div>;
 * ```
 */

import { useMemo } from "react";
import type { DiscoveryPhase } from "@/types/personality";
import type { IdentityArchetype } from "@/types/session";
import {
  getPhaseColors,
  ARCHETYPE_COLOR_ACCENTS,
  getPrimingMessage,
  type PhaseColorScheme,
} from "@/config/psychologyFramework";

interface SessionPsychologyResult {
  /** Phase-specific color scheme */
  phaseColors: PhaseColorScheme;
  /** Archetype-specific accent colors */
  archetypeAccent: { glow: string; badge: string };
  /** CSS custom properties for dynamic theming */
  cssVars: React.CSSProperties;
  /** Background gradient class string */
  gradientClass: string;
  /** Priming message for session start */
  primingMessage: string;
}

export function useSessionPsychology(
  phase: DiscoveryPhase | undefined,
  archetype: IdentityArchetype | undefined
): SessionPsychologyResult {
  return useMemo(() => {
    const safePhase = phase || "rhythm";
    const safeArchetype = archetype || "growth-seeker";

    const phaseColors = getPhaseColors(safePhase);
    const archetypeAccent = ARCHETYPE_COLOR_ACCENTS[safeArchetype];
    const primingMessage = getPrimingMessage(safePhase);

    // Build CSS custom properties for dynamic theming
    const cssVars: React.CSSProperties = {
      "--session-primary": phaseColors.primary,
      "--session-gradient-from": phaseColors.gradientFrom,
      "--session-gradient-to": phaseColors.gradientTo,
      "--session-accent": phaseColors.accent,
      "--session-surface": phaseColors.surface,
      "--archetype-glow": archetypeAccent.glow,
      "--archetype-badge": archetypeAccent.badge,
    } as React.CSSProperties;

    // Tailwind doesn't support dynamic colors, so we provide inline gradient
    const gradientClass = "bg-gradient-to-br";

    return {
      phaseColors,
      archetypeAccent,
      cssVars,
      gradientClass,
      primingMessage,
    };
  }, [phase, archetype]);
}
