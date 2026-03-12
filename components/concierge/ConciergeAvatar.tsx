'use client';

import type { AvatarState } from './types';

interface ConciergeAvatarProps {
  state: AvatarState;
  size?: number;
}

export default function ConciergeAvatar({ state, size = 48 }: ConciergeAvatarProps) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';

  return (
    <div
      className={`relative ${state === 'idle' ? 'concierge-float' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 頭（丸） */}
        <circle cx="50" cy="50" r="42" fill="#3B82F6" />
        <circle cx="50" cy="50" r="38" fill="#60A5FA" />

        {/* ハイライト */}
        <ellipse cx="38" cy="35" rx="12" ry="8" fill="#93C5FD" opacity="0.5" />

        {/* 左目 */}
        <g transform={isThinking ? 'translate(-3, 0)' : ''}>
          <ellipse
            cx="36"
            cy="45"
            rx="5"
            ry="6"
            fill="white"
          />
          <circle
            cx={isThinking ? '34' : '36'}
            cy="45"
            r="3"
            fill="#1E3A5F"
            className={!isThinking && !isTalking ? 'concierge-blink' : ''}
            style={{ transformOrigin: '36px 45px' }}
          />
        </g>

        {/* 右目 */}
        <g transform={isThinking ? 'translate(-3, 0)' : ''}>
          <ellipse
            cx="64"
            cy="45"
            rx="5"
            ry="6"
            fill="white"
          />
          <circle
            cx={isThinking ? '62' : '64'}
            cy="45"
            r="3"
            fill="#1E3A5F"
            className={!isThinking && !isTalking ? 'concierge-blink' : ''}
            style={{ transformOrigin: '64px 45px' }}
          />
        </g>

        {/* 口 */}
        {isTalking ? (
          <ellipse
            cx="50"
            cy="65"
            rx="8"
            ry="5"
            fill="#1E3A5F"
            className="concierge-talk"
            style={{ transformOrigin: '50px 65px' }}
          />
        ) : isThinking ? (
          // 考え中: 小さな口
          <ellipse cx="50" cy="65" rx="4" ry="3" fill="#1E3A5F" />
        ) : (
          // 通常: にっこり
          <path
            d="M 38 62 Q 50 75 62 62"
            fill="none"
            stroke="#1E3A5F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* ほっぺ */}
        <circle cx="28" cy="58" r="5" fill="#F472B6" opacity="0.3" />
        <circle cx="72" cy="58" r="5" fill="#F472B6" opacity="0.3" />
      </svg>

      {/* 考え中のドット */}
      {isThinking && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="concierge-dot-bounce block w-1.5 h-1.5 rounded-full bg-blue-400"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
