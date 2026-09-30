import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The Sparq mark: deep plum with a coral-to-gold spark. The spark is the
 * brightest thing in the identity — that's where the eye should land.
 * Keep in sync with public/favicon.svg.
 */
export function SparqMark({ size = 28, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="Sparq"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="14" y1="50" x2="50" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E97868" />
          <stop offset="1" stopColor="#F3B55A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#4B2E57" />
      <path
        d="M30 13 C31.6 27 35 30.4 49 32 C35 33.6 31.6 37 30 51 C28.4 37 25 33.6 11 32 C25 30.4 28.4 27 30 13 Z"
        fill={`url(#spark-${id})`}
      />
      <path
        d="M47 11 C47.6 15.4 48.6 16.4 53 17 C48.6 17.6 47.6 18.6 47 23 C46.4 18.6 45.4 17.6 41 17 C45.4 16.4 46.4 15.4 47 11 Z"
        fill="#F3B55A"
      />
    </svg>
  );
}

/** Mark + wordmark, for page headers. */
export function SparqLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 text-xl font-bold tracking-tight text-brand-primary', className)}>
      <SparqMark size={size} />
      Sparq
    </span>
  );
}
