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

export default function YasashiiAvatar({ color, state, size, shape, aspectRatio }: Props) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';
  const light = lighten(color, 0.35);
  const highlight = lighten(color, 0.55);

  const clipId = `yasa-clip-${Math.random().toString(36).slice(2, 6)}`;

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
          <ellipse cx="50" cy="52" rx="38" ry="42" fill={light} />
          <ellipse cx="40" cy="34" rx="14" ry="8" fill={highlight} opacity="0.4" />

          {/* たれ目（アーチ型） */}
          <g transform={isThinking ? 'translate(-2, 0)' : ''}>
            {/* 左目 */}
            <path d="M 28 44 Q 34 50 40 44" fill="none" stroke="#3D2C1E" strokeWidth="2.5" strokeLinecap="round"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '34px 47px' }} />
            {/* 右目 */}
            <path d="M 60 44 Q 66 50 72 44" fill="none" stroke="#3D2C1E" strokeWidth="2.5" strokeLinecap="round"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '66px 47px' }} />
          </g>

          {/* 口 */}
          {isTalking ? (
            <ellipse cx="50" cy="65" rx="6" ry="4" fill="#3D2C1E" className="concierge-talk" style={{ transformOrigin: '50px 65px' }} />
          ) : isThinking ? (
            <circle cx="50" cy="65" r="3" fill="#3D2C1E" />
          ) : (
            <path d="M 42 62 Q 50 72 58 62" fill="none" stroke="#3D2C1E" strokeWidth="2" strokeLinecap="round" />
          )}

          {/* ほっぺ（大きめ、ピンク） */}
          <circle cx="26" cy="58" r="7" fill="#F9A8D4" opacity="0.4" />
          <circle cx="74" cy="58" r="7" fill="#F9A8D4" opacity="0.4" />
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
