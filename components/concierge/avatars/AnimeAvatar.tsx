'use client';

import type { AvatarState, AvatarShape } from '../types';
import { lighten } from './colorUtils';

interface Props {
  color: string;
  state: AvatarState;
  size: number;
  shape: AvatarShape;
  aspectRatio: number;
}

export default function AnimeAvatar({ color, state, size, shape, aspectRatio }: Props) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';
  const light = lighten(color, 0.3);
  const highlight = lighten(color, 0.6);

  const clipId = `anime-clip-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={`relative ${state === 'idle' ? 'concierge-float' : ''}`}
      style={{ width: size, height: size * aspectRatio }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ transform: `scaleY(${aspectRatio})` }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            {shape === 'circle' && <circle cx="50" cy="50" r="46" />}
            {shape === 'rounded' && <rect x="6" y="6" width="88" height="88" rx="20" />}
            {shape === 'egg' && <ellipse cx="50" cy="52" rx="42" ry="46" />}
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="100" height="100" fill={color} />
          <circle cx="50" cy="50" r="40" fill={light} />
          <ellipse cx="38" cy="32" rx="14" ry="10" fill={highlight} opacity="0.4" />

          {/* 大きな目 */}
          <g transform={isThinking ? 'translate(-2, 0)' : ''}>
            {/* 左目 */}
            <ellipse cx="35" cy="46" rx="9" ry="10" fill="white" />
            <ellipse cx={isThinking ? '33' : '35'} cy="46" rx="5" ry="6" fill={color}
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '35px 46px' }} />
            <circle cx={isThinking ? '32' : '34'} cy="43" r="2" fill="white" />

            {/* 右目 */}
            <ellipse cx="65" cy="46" rx="9" ry="10" fill="white" />
            <ellipse cx={isThinking ? '63' : '65'} cy="46" rx="5" ry="6" fill={color}
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '65px 46px' }} />
            <circle cx={isThinking ? '62' : '64'} cy="43" r="2" fill="white" />
          </g>

          {/* 口 */}
          {isTalking ? (
            <ellipse cx="50" cy="68" rx="5" ry="4" fill="#1E3A5F" className="concierge-talk" style={{ transformOrigin: '50px 68px' }} />
          ) : isThinking ? (
            <circle cx="50" cy="68" r="2" fill="#1E3A5F" />
          ) : (
            <path d="M 44 66 Q 50 72 56 66" fill="none" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />
          )}

          {/* ほっぺ */}
          <circle cx="22" cy="58" r="6" fill="#F472B6" opacity="0.25" />
          <circle cx="78" cy="58" r="6" fill="#F472B6" opacity="0.25" />

          {/* キラキラ */}
          <text x="16" y="32" fontSize="8" opacity="0.6">✦</text>
          <text x="78" y="28" fontSize="6" opacity="0.4">✦</text>
        </g>
      </svg>

      {isThinking && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="concierge-dot-bounce block w-1.5 h-1.5 rounded-full" style={{ animationDelay: `${i * 0.2}s`, backgroundColor: color }} />
          ))}
        </div>
      )}
    </div>
  );
}
