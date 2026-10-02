import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SurfaceTag = 'article' | 'div' | 'section';

type EditorialSurfaceProps<T extends SurfaceTag> = {
  as?: T;
  children: ReactNode;
  className?: string;
  /** An optional decorative metaphor; it carries no status or user data. */
  metaphor?: 'bridge' | 'bloom' | 'flow';
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

function EditorialSurfaceFrame<T extends SurfaceTag = 'section'>({
  as,
  children,
  className,
  metaphor,
  ...props
}: EditorialSurfaceProps<T>) {
  const Component = (as ?? 'section') as ElementType;

  return (
    <Component
      className={cn(
        'rounded-3xl border border-brand-primary/10 shadow-sm',
        metaphor && 'relative overflow-hidden',
        className,
      )}
      {...props}
    >
      {metaphor && <SceneAccent kind={metaphor} quiet className="-mt-2 mb-2 h-20 w-full" />}
      {children}
    </Component>
  );
}

export function EditorialFeaturedSurface<T extends SurfaceTag = 'section'>({
  className,
  ...props
}: EditorialSurfaceProps<T>) {
  return (
    <EditorialSurfaceFrame
      className={cn(
        'emotion-featured emotion-surface bg-brand-parchment px-6 py-6 shadow-[0_20px_50px_hsl(var(--shadow)/0.08)]',
        className,
      )}
      {...props}
    />
  );
}

export function EditorialQuietSurface<T extends SurfaceTag = 'section'>({
  className,
  ...props
}: EditorialSurfaceProps<T>) {
  return (
    <EditorialSurfaceFrame
      className={cn(
        'emotion-paper bg-brand-linen/80 px-5 py-5 shadow-[0_14px_32px_hsl(var(--shadow)/0.05)]',
        className,
      )}
      {...props}
    />
  );
}

type EditorialEyebrowProps = ComponentPropsWithoutRef<'p'>;

export function EditorialEyebrow({ className, ...props }: EditorialEyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-widest text-brand-hover',
        className,
      )}
      {...props}
    />
  );
}
