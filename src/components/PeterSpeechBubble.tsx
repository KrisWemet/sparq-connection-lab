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
          background: '#FFF3ED',
          borderLeft: '3px solid #C0614A',
          borderRadius: 16,
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(192, 97, 74, 0.08)',
          flex: 1,
          position: 'relative',
        }}
      >
        {/* Tail pointing left toward Peter */}
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '10px solid #FFF3ED',
          }}
        />

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
              color: '#C0614A',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Tap to chat with Peter →
          </p>
        )}
      </div>
    </div>
  );
}
