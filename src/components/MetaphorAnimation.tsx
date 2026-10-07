import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MetaphorVisual, type MetaphorKind } from '@/components/emotion/MetaphorVisual';
import { emotionStyle } from '@/lib/visual-emotion';

export interface MetaphorAnimationProps {
  title: string;
  description: string;
  metaphorType: 'flower' | 'bridge' | 'tree' | 'river' | 'flame';
  onComplete: () => void;
}

const metaphorKinds: Record<MetaphorAnimationProps['metaphorType'], MetaphorKind> = {
  bridge: 'bridge', flower: 'bloom', tree: 'bloom', river: 'flow', flame: 'bloom',
};

/** Existing journey callers retain their callback. The experience is self-paced,
 * keyboard accessible and dismissible; no timer gates a person's next step. */
export function MetaphorAnimation({ title, description, metaphorType, onComplete }: MetaphorAnimationProps) {
  const [returnFocusTarget] = useState<HTMLElement | null>(() => typeof document === 'undefined' ? null : document.activeElement as HTMLElement);
  return <Dialog open onOpenChange={open => { if (!open) onComplete(); }}>
    <DialogContent className="emotion-metaphor-dialog max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-3xl max-h-[90dvh] overflow-y-auto p-7" style={emotionStyle('onboarding')}
      onCloseAutoFocus={event => {
        if (returnFocusTarget?.isConnected) { event.preventDefault(); returnFocusTarget.focus({ preventScroll: true }); }
      }}>
      <div className="pt-3 text-center">
        <DialogTitle className="font-serif text-3xl font-medium leading-tight">{title}</DialogTitle>
        <DialogDescription className="mt-3 leading-relaxed">{description}</DialogDescription>
      </div>
      <MetaphorVisual kind={metaphorKinds[metaphorType]} />
      <Button onClick={onComplete} className="w-full min-h-[48px] rounded-2xl">Continue your journey</Button>
    </DialogContent>
  </Dialog>;
}
