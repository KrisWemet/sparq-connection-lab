import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The approved flowing S, shared with the browser and home-screen icons. */
export function SparqMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/brand/sparq-flowing-s.png"
      alt="Sparq"
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}

/** Approved flowing S and rounded wordmark, including Connection. */
export function SparqLogo({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/brand/sparq-connection-logo.png"
      alt="Sparq Connection"
      width={Math.round(size * 1566 / 655)}
      height={size}
      priority
      className={cn('block h-auto max-w-full shrink-0', className)}
    />
  );
}
