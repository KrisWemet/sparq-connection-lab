import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { emotionStyle, type EmotionalArea } from '@/lib/visual-emotion';
import { MetaphorVisual, type MetaphorKind } from './MetaphorVisual';
import { useVisualEmotion } from './VisualEmotionProvider';

/** The room follows the task, never an inferred psychological label. */
export function areaForRoute(path: string): EmotionalArea | null {
  if (['/', '/login', '/signup'].includes(path)) return null;
  if (path.startsWith('/onboarding')) return 'onboarding';
  if (['/conflict-first-aid', '/neutral-observer', '/rehearsal', '/translator'].includes(path)) return 'repair';
  if (['/journal', '/daily-growth', '/daily-questions', '/peter'].includes(path)) return 'journal';
  if (['/connect', '/us', '/messages', '/join-partner', '/go-connect'].includes(path)) return 'connect';
  if (['/date-ideas', '/journeys'].includes(path) || path.startsWith('/journeys/')) return 'discover';
  if (['/insight-profile', '/growth', '/weekly-insights', '/skill-tree'].includes(path)) return 'insights';
  if (path === '/dashboard') return 'retreat';
  return null;
}

export function SceneAccent({ kind, className, quiet = false, area }: {
  kind: MetaphorKind; className?: string; quiet?: boolean; area?: EmotionalArea;
}) {
  const { growth } = useVisualEmotion();
  return <div aria-hidden="true" style={area ? emotionStyle(area, growth) : undefined} className={cn('emotion-accent pointer-events-none select-none', quiet && 'emotion-accent-quiet', className)}>
    <MetaphorVisual kind={kind} growth={growth} quiet={quiet} paused={quiet} />
  </div>;
}

/** Two gradient fields and a small contour drawing; no full-screen blur/filter. */
export function AmbientScene({ className, quiet = false }: { className?: string; quiet?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let visible = true;
    const update = () => { node.dataset.paused = String(document.hidden || !visible); };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer?.observe(node);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <div ref={ref} aria-hidden="true" className={cn('emotion-atmosphere pointer-events-none', quiet && 'emotion-atmosphere-quiet', className)}>
    <div className="emotion-light-field emotion-light-field-plum" />
    <div className="emotion-light-field emotion-light-field-warm" />
    <svg className="emotion-contours" viewBox="0 0 1000 1000" fill="none" focusable="false">
      {[0, 1, 2, 3, 4].map(index => <path key={index} transform={`translate(${index * 18} ${index * 11})`} d="M-130 900C460 940 94 484 422 304S865 530 1050 80" />)}
    </svg>
  </div>;
}

export function CompletionLight({ show }: { show: boolean }) {
  return show ? <div aria-hidden="true" className="emotion-completion-light" /> : null;
}

export function EmotionalEnvironment({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();
  const area = areaForRoute(pathname);
  const { growth } = useVisualEmotion();
  const [celebration, setCelebration] = useState(0);
  useEffect(() => {
    const respond = () => setCelebration(value => value + 1);
    window.addEventListener('sparq:completion-glow', respond);
    return () => window.removeEventListener('sparq:completion-glow', respond);
  }, []);
  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(0), 4400);
    return () => window.clearTimeout(timer);
  }, [celebration]);
  return <div className="emotion-environment" data-emotion-area={area ?? undefined} style={emotionStyle(area ?? 'retreat', growth)}>
    {area && <AmbientScene className="emotion-app-atmosphere" quiet={area === 'repair' || area === 'journal'} />}
    <div className="emotion-content">{children}</div>
    <CompletionLight key={celebration} show={celebration > 0} />
  </div>;
}
