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

export default function RobotAvatar({ color, state, size, shape, aspectRatio }: Props) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';
  const light = lighten(color, 0.25);
  const dark = darken(color, 0.15);

  const clipId = `robot-clip-${Math.random().toString(36).slice(2, 6)}`;

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
          <rect x="0" y="0" width="100" height="100" fill={dark} />
          <rect x="14" y="18" width="72" height="68" rx="12" fill={color} />
          <rect x="20" y="24" width="60" height="56" rx="8" fill={light} />

          {/* アンテナ */}
          <line x1="50" y1="18" x2="50" y2="8" stroke={dark} strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="6" r="4" fill={lighten(color, 0.5)} />

          {/* 目（四角・LED風） */}
          <g transform={isThinking ? 'translate(-2, 0)' : ''}>
            <rect x="28" y="38" width="14" height="12" rx="2" fill="white" />
            <rect x={isThinking ? '29' : '31'} y="40" width="8" height="8" rx="1" fill="#00FF88"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '35px 44px' }} />
            <rect x="58" y="38" width="14" height="12" rx="2" fill="white" />
            <rect x={isThinking ? '59' : '61'} y="40" width="8" height="8" rx="1" fill="#00FF88"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '65px 44px' }} />
          </g>

          {/* 口（スピーカーグリル） */}
          {isTalking ? (
            <g className="concierge-talk" style={{ transformOrigin: '50px 68px' }}>
              <rect x="36" y="62" width="28" height="12" rx="3" fill={dark} />
              {[0, 1, 2].map(i => (
                <line key={i} x1="40" y1={64 + i * 4} x2="60" y2={64 + i * 4} stroke={lighten(color, 0.4)} strokeWidth="1.5" />
              ))}
            </g>
          ) : isThinking ? (
            <rect x="40" y="64" width="20" height="8" rx="2" fill={dark} />
          ) : (
            <g>
              <rect x="36" y="62" width="28" height="12" rx="3" fill={dark} />
              {[0, 1, 2].map(i => (
                <line key={i} x1="40" y1={64 + i * 4} x2="60" y2={64 + i * 4} stroke={lighten(color, 0.3)} strokeWidth="1" />
              ))}
            </g>
          )}
        </g>
      </svg>

      {isThinking && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="concierge-dot-bounce block w-1.5 h-1.5 rounded-full" style={{ animationDelay: `${i * 0.2}s`, backgroundColor: '#00FF88' }} />
          ))}
        </div>
      )}
    </div>
  );
}
