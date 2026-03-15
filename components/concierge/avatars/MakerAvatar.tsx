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

export default function MakerAvatar({ color, state, size, shape, aspectRatio }: Props) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';
  const light = lighten(color, 0.3);
  const highlight = lighten(color, 0.5);

  const clipId = `maker-clip-${Math.random().toString(36).slice(2, 6)}`;

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
          {/* 背景 */}
          <rect x="0" y="0" width="100" height="100" fill={color} />
          <circle cx="50" cy="50" r="38" fill={light} />

          {/* ハイライト */}
          <ellipse cx="38" cy="35" rx="12" ry="8" fill={highlight} opacity="0.5" />

          {/* 左目 */}
          <g transform={isThinking ? 'translate(-3, 0)' : ''}>
            <ellipse cx="36" cy="45" rx="5" ry="6" fill="white" />
            <circle
              cx={isThinking ? '34' : '36'} cy="45" r="3" fill="#1E3A5F"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '36px 45px' }}
            />
          </g>

          {/* 右目 */}
          <g transform={isThinking ? 'translate(-3, 0)' : ''}>
            <ellipse cx="64" cy="45" rx="5" ry="6" fill="white" />
            <circle
              cx={isThinking ? '62' : '64'} cy="45" r="3" fill="#1E3A5F"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '64px 45px' }}
            />
          </g>

          {/* 口 */}
          {isTalking ? (
            <ellipse cx="50" cy="65" rx="8" ry="5" fill="#1E3A5F" className="concierge-talk" style={{ transformOrigin: '50px 65px' }} />
          ) : isThinking ? (
            <ellipse cx="50" cy="65" rx="4" ry="3" fill="#1E3A5F" />
          ) : (
            <path d="M 38 62 Q 50 75 62 62" fill="none" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* ほっぺ */}
          <circle cx="28" cy="58" r="5" fill="#F472B6" opacity="0.3" />
          <circle cx="72" cy="58" r="5" fill="#F472B6" opacity="0.3" />
        </g>
      </svg>

      {isThinking && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="concierge-dot-bounce block w-1.5 h-1.5 rounded-full bg-blue-400" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
