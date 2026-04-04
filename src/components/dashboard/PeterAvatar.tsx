import React from 'react';
import { motion } from 'framer-motion';

export type PeterMood = 'morning' | 'afternoon' | 'evening' | 'celebrating' | 'curious';

interface PeterAvatarProps {
  /** Controls expression and props */
  mood?: PeterMood;
  /** Legacy prop — mapped to mood */
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  /** Pulsing glow when typing/thinking */
  isTyping?: boolean;
  /** Rendered size in px (width = height) */
  size?: number;
  /** Extra className for the wrapper */
  className?: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Eyes({ mood }: { mood: PeterMood }) {
  if (mood === 'evening') {
    // Calm half-closed eyes
    return (
      <>
        <ellipse cx="39" cy="40" rx="6" ry="4.5" fill="#2D1A12" />
        {/* Upper eyelid covering top half */}
        <ellipse cx="39" cy="37" rx="6.5" ry="4" fill="#F0D5B8" />
        <ellipse cx="61" cy="40" rx="6" ry="4.5" fill="#2D1A12" />
        <ellipse cx="61" cy="37" rx="6.5" ry="4" fill="#F0D5B8" />
        {/* Subtle sparkle still visible */}
        <circle cx="37" cy="40" r="1.2" fill="white" opacity="0.7" />
        <circle cx="59" cy="40" r="1.2" fill="white" opacity="0.7" />
      </>
    );
  }

  if (mood === 'celebrating') {
    // Eyes squeezed shut with joy — upward curves
    return (
      <>
        <path d="M 33 40 Q 39 34, 45 40" stroke="#2D1A12" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 55 40 Q 61 34, 67 40" stroke="#2D1A12" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Cheek blush */}
        <ellipse cx="33" cy="46" rx="5" ry="3" fill="#E8907A" opacity="0.35" />
        <ellipse cx="67" cy="46" rx="5" ry="3" fill="#E8907A" opacity="0.35" />
      </>
    );
  }

  if (mood === 'curious') {
    // Left eye slightly wider + raised brow effect
    return (
      <>
        <circle cx="39" cy="40" r="7" fill="#2D1A12" />
        <circle cx="37" cy="37.5" r="2.2" fill="white" />
        {/* Raised inner eyebrow */}
        <path d="M 34 33 Q 39 30, 45 33" stroke="#6B3A2A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="61" cy="40" r="5.5" fill="#2D1A12" />
        <circle cx="59" cy="37.5" r="1.8" fill="white" />
      </>
    );
  }

  // morning / afternoon — alert, friendly
  const sparkR = mood === 'morning' ? 2.2 : 1.8;
  const eyeR = mood === 'morning' ? 6.5 : 6;
  return (
    <>
      <circle cx="39" cy="40" r={eyeR} fill="#2D1A12" />
      <circle cx={39 - 1.5} cy={40 - 2} r={sparkR} fill="white" />
      <circle cx="61" cy="40" r={eyeR} fill="#2D1A12" />
      <circle cx={61 - 1.5} cy={40 - 2} r={sparkR} fill="white" />
      {mood === 'morning' && (
        /* Extra sparkle dot for alertness */
        <>
          <circle cx="42" cy="37" r="1" fill="white" opacity="0.6" />
          <circle cx="64" cy="37" r="1" fill="white" opacity="0.6" />
        </>
      )}
    </>
  );
}

function Mouth({ mood }: { mood: PeterMood }) {
  if (mood === 'celebrating') {
    // Big open smile
    return (
      <path d="M 40 57 Q 50 66, 60 57" stroke="#3D1A10" strokeWidth="2.5"
        fill="#C26B54" strokeLinecap="round" />
    );
  }
  if (mood === 'evening') {
    // Small relaxed smile
    return (
      <path d="M 44 57 Q 50 61, 56 57" stroke="#3D1A10" strokeWidth="2"
        fill="none" strokeLinecap="round" />
    );
  }
  if (mood === 'curious') {
    // Slight side-smile (left raised)
    return (
      <path d="M 43 58 Q 50 62, 57 57" stroke="#3D1A10" strokeWidth="2"
        fill="none" strokeLinecap="round" />
    );
  }
  // Default warm smile
  return (
    <path d="M 42 57 Q 50 64, 58 57" stroke="#3D1A10" strokeWidth="2"
      fill="none" strokeLinecap="round" />
  );
}

function Prop({ mood }: { mood: PeterMood }) {
  if (mood === 'morning') {
    // Small open journal/notebook
    return (
      <g transform="translate(32, 78)">
        {/* Journal cover */}
        <rect x="0" y="0" width="36" height="26" rx="3" fill="#8B5CF6" />
        {/* Spine */}
        <rect x="15" y="0" width="6" height="26" rx="1" fill="#A3513D" />
        {/* Pages left */}
        <rect x="2" y="3" width="12" height="20" rx="1" fill="#F5F3FF" />
        {/* Page lines */}
        <line x1="4" y1="7" x2="12" y2="7" stroke="#D4B896" strokeWidth="1" />
        <line x1="4" y1="10" x2="12" y2="10" stroke="#D4B896" strokeWidth="1" />
        <line x1="4" y1="13" x2="12" y2="13" stroke="#D4B896" strokeWidth="1" />
        <line x1="4" y1="16" x2="12" y2="16" stroke="#D4B896" strokeWidth="1" />
        {/* Pages right */}
        <rect x="22" y="3" width="12" height="20" rx="1" fill="#F5F3FF" />
        <line x1="24" y1="7" x2="32" y2="7" stroke="#D4B896" strokeWidth="1" />
        <line x1="24" y1="10" x2="32" y2="10" stroke="#D4B896" strokeWidth="1" />
        <line x1="24" y1="13" x2="32" y2="13" stroke="#D4B896" strokeWidth="1" />
      </g>
    );
  }

  if (mood === 'evening') {
    // Small mug / cup
    return (
      <g transform="translate(38, 82)">
        {/* Mug body */}
        <rect x="0" y="0" width="24" height="20" rx="4" fill="#D4795F" />
        {/* Handle */}
        <path d="M 24 5 Q 32 5 32 10 Q 32 15 24 15" stroke="#A3513D"
          strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Liquid */}
        <rect x="2" y="2" width="20" height="6" rx="2" fill="#E8A857" opacity="0.8" />
        {/* Steam */}
        <path d="M 8 -4 Q 10 -8, 8 -12" stroke="#8B5CF6" strokeWidth="1.5"
          fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 14 -4 Q 16 -8, 14 -12" stroke="#8B5CF6" strokeWidth="1.5"
          fill="none" strokeLinecap="round" opacity="0.5" />
      </g>
    );
  }

  if (mood === 'celebrating') {
    // Confetti bursts
    return (
      <>
        <circle cx="18" cy="22" r="3" fill="#E8A857" opacity="0.8" />
        <circle cx="82" cy="18" r="2.5" fill="#8FAF8A" opacity="0.8" />
        <circle cx="88" cy="50" r="2" fill="#8B5CF6" opacity="0.7" />
        <circle cx="12" cy="55" r="2.5" fill="#D4795F" opacity="0.7" />
        <rect x="15" y="70" width="6" height="6" rx="1"
          fill="#E8A857" opacity="0.7" transform="rotate(30, 18, 73)" />
        <rect x="78" y="72" width="5" height="5" rx="1"
          fill="#8FAF8A" opacity="0.7" transform="rotate(-20, 80, 74)" />
        {/* Star bursts */}
        <text x="10" y="35" fontSize="10" fill="#E8A857" opacity="0.8">✦</text>
        <text x="80" y="30" fontSize="8" fill="#8B5CF6" opacity="0.7">✦</text>
      </>
    );
  }

  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PeterAvatar({
  mood: moodProp,
  timeOfDay,
  isTyping = false,
  size = 80,
  className = '',
}: PeterAvatarProps) {
  // Resolve mood from either prop
  const mood: PeterMood = moodProp ?? timeOfDay ?? 'afternoon';

  return (
    <motion.div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Ambient glow behind Peter */}
      <motion.div
        className="absolute inset-[-12%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
        animate={{ scale: isTyping ? [1, 1.18, 1] : [1, 1.06, 1] }}
        transition={{ duration: isTyping ? 1.4 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* The SVG illustration */}
      <svg
        viewBox="0 0 100 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
        style={{ overflow: 'visible' }}
        aria-label="Peter the Otter"
      >
        {/* ── Prop layer (behind body) ── */}
        <Prop mood={mood} />

        {/* ── TAIL (flat, behind body) ── */}
        <ellipse
          cx="50" cy="108" rx="28" ry="8"
          fill="#6B3A2A"
          transform="rotate(-5, 50, 108)"
        />

        {/* ── BODY ── */}
        <ellipse cx="50" cy="88" rx="24" ry="20" fill="#A0724E" />
        {/* Belly patch */}
        <ellipse cx="50" cy="90" rx="16" ry="16" fill="#F0D5B8" />

        {/* ── ARMS ── */}
        {/* Left arm */}
        <path
          d="M 27 80 Q 18 74, 26 66"
          stroke="#A0724E" strokeWidth="11" strokeLinecap="round" fill="none"
        />
        <circle cx="26" cy="66" r="5.5" fill="#8B6044" />
        {/* Right arm */}
        <path
          d="M 73 80 Q 82 74, 74 66"
          stroke="#A0724E" strokeWidth="11" strokeLinecap="round" fill="none"
        />
        <circle cx="74" cy="66" r="5.5" fill="#8B6044" />

        {/* ── HEAD ── */}
        <circle cx="50" cy="42" r="28" fill="#A0724E" />

        {/* ── EARS ── */}
        {/* Left ear */}
        <circle cx="26" cy="22" r="9" fill="#8B6044" />
        <circle cx="26" cy="22" r="5.5" fill="#C8886A" />
        {/* Right ear */}
        <circle cx="74" cy="22" r="9" fill="#8B6044" />
        <circle cx="74" cy="22" r="5.5" fill="#C8886A" />

        {/* ── FACE CREAM AREA (muzzle/face patch) ── */}
        <ellipse cx="50" cy="47" rx="20" ry="19" fill="#F0D5B8" />

        {/* ── EYES (mood-driven) ── */}
        <Eyes mood={mood} />

        {/* ── NOSE ── */}
        {/* Nose bridge */}
        <ellipse cx="50" cy="52" rx="5" ry="4" fill="#2D1A12" />
        {/* Nose shine */}
        <ellipse cx="48.5" cy="50.5" rx="1.8" ry="1.2" fill="#6B3A2A" opacity="0.5" />

        {/* ── MOUTH ── */}
        <Mouth mood={mood} />

        {/* ── WHISKERS ── */}
        <path d="M 28 53 L 43 55.5" stroke="#6B3A2A" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.45" />
        <path d="M 26 57 L 43 58.5" stroke="#6B3A2A" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.45" />
        <path d="M 28 61 L 43 60.5" stroke="#6B3A2A" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.35" />
        <path d="M 72 53 L 57 55.5" stroke="#6B3A2A" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.45" />
        <path d="M 74 57 L 57 58.5" stroke="#6B3A2A" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.45" />
        <path d="M 72 61 L 57 60.5" stroke="#6B3A2A" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.35" />

        {/* ── BLINK OVERLAY (CSS animation via style tag approach) ── */}
        {/* We use two eyelid rects that animate via CSS — only visible during blink */}
        <style>{`
          @keyframes peterBlink {
            0%, 90%, 100% { transform: scaleY(0); }
            93%, 97% { transform: scaleY(1); }
          }
          .peter-blink-left {
            transform-origin: 39px 40px;
            animation: peterBlink 6s ease-in-out infinite;
          }
          .peter-blink-right {
            transform-origin: 61px 40px;
            animation: peterBlink 6s ease-in-out infinite;
          }
        `}</style>
        {mood !== 'evening' && mood !== 'celebrating' && (
          <>
            <ellipse
              className="peter-blink-left"
              cx="39" cy="40" rx="7" ry="6.5" fill="#F0D5B8"
            />
            <ellipse
              className="peter-blink-right"
              cx="61" cy="40" rx="7" ry="6.5" fill="#F0D5B8"
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
