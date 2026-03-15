'use client';

import type { AvatarState, AvatarShape } from '../types';
import { lighten, darken } from './colorUtils';

interface Props {
  color: string;
  state: AvatarState;
  size: number;
  shape: AvatarShape;
  aspectRatio: number;
}

export default function BusinessAvatar({ color, state, size, shape, aspectRatio }: Props) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';
  const light = lighten(color, 0.2);
  const dark = darken(color, 0.2);

  const clipId = `biz-clip-${Math.random().toString(36).slice(2, 6)}`;

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
          <rect x="12" y="12" width="76" height="76" rx="14" fill={light} />

          {/* メガネ */}
          <rect x="24" y="38" width="18" height="14" rx="3" fill="white" stroke={dark} strokeWidth="2" />
          <rect x="58" y="38" width="18" height="14" rx="3" fill="white" stroke={dark} strokeWidth="2" />
          <line x1="42" y1="45" x2="58" y2="45" stroke={dark} strokeWidth="2" />

          {/* 瞳 */}
          <g transform={isThinking ? 'translate(-2, 0)' : ''}>
            <circle cx="33" cy="45" r="3" fill="#1E3A5F"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '33px 45px' }} />
            <circle cx="67" cy="45" r="3" fill="#1E3A5F"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '67px 45px' }} />
          </g>

          {/* 口 */}
          {isTalking ? (
            <ellipse cx="50" cy="68" rx="6" ry="4" fill="#1E3A5F" className="concierge-talk" style={{ transformOrigin: '50px 68px' }} />
          ) : isThinking ? (
            <line x1="42" y1="68" x2="58" y2="68" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M 40 66 L 50 70 L 60 66" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
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
