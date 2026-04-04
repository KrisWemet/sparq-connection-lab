import React from 'react';
import PeterAvatar from './PeterAvatar';

interface PeterSpeechBubbleProps {
  message: string;
  userName?: string;
  className?: string;
  onTap?: () => void;
}

export default function PeterSpeechBubble({
  message,
  userName,
  className = '',
  onTap,
}: PeterSpeechBubbleProps) {
  const greeting = userName ? `Hi ${userName}, ` : '';

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* Peter avatar — small, anchored left */}
      <div className="flex-shrink-0 self-center">
        <PeterAvatar size="sm" mood="welcome" />
      </div>

      {/* Speech bubble */}
      <div
        style={{
          background: 'rgba(255, 243, 237, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(139, 92, 246, 0.10)',
          borderRadius: 28,
          padding: '24px 28px',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.04)',
          flex: 1,
          position: 'relative',
        }}
      >

        <p
          style={{
            margin: 0,
            fontStyle: 'italic',
            color: '#5C4A44',
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          {greeting && (
            <span style={{ fontWeight: 600, fontStyle: 'normal' }}>
              {greeting}
            </span>
          )}
          {message}
        </p>

        {onTap && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              color: '#8B5CF6',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Tap here to talk to me →
          </p>
        )}
      </div>
    </div>
  );
}
