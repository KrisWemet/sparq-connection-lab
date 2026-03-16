import React from 'react';
import Image from 'next/image';

const SIZES = {
  sm: 60,
  md: 90,
  lg: 140,
  xl: 220,
} as const;

export type PeterMood = 'welcome' | 'celebrate' | 'calm' | 'thinking';
export type PeterSize = keyof typeof SIZES;

interface PeterAvatarProps {
  size?: PeterSize;
  mood?: PeterMood;
  className?: string;
  priority?: boolean;
}

export default function PeterAvatar({
  size = 'md',
  mood = 'welcome',
  className = '',
  priority = false,
}: PeterAvatarProps) {
  const px = SIZES[size];

  return (
    <Image
      src="/images/peter-default.png"
      alt="Peter the Otter"
      width={px}
      height={px}
      priority={priority}
      className={className}
      style={{
        width: px,
        height: px,
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
        animation: 'peterFadeIn 300ms ease forwards',
        transition: 'transform 200ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
      }}
    />
  );
}
