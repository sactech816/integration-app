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

export default function NekoAvatar({ color, state, size, shape, aspectRatio }: Props) {
  const isThinking = state === 'thinking';
  const isTalking = state === 'talking';
  const light = lighten(color, 0.3);
  const innerEar = lighten(color, 0.55);

  const clipId = `neko-clip-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={`relative ${state === 'idle' ? 'concierge-float' : ''}`}
      style={{ width: size, height: size * aspectRatio }}
    >
      <svg
        viewBox="0 0 100 110"
        width={size}
        height={size}
        style={{ transform: `scaleY(${aspectRatio})` }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            {shape === 'circle' && <circle cx="50" cy="58" r="46" />}
            {shape === 'rounded' && <rect x="6" y="12" width="88" height="88" rx="20" />}
            {shape === 'egg' && <ellipse cx="50" cy="60" rx="42" ry="46" />}
          </clipPath>
        </defs>

        {/* 猫耳（クリップ外に描画） */}
        <polygon points="18,38 30,12 42,38" fill={color} />
        <polygon points="22,36 30,18 38,36" fill={innerEar} />
        <polygon points="58,38 70,12 82,38" fill={color} />
        <polygon points="62,36 70,18 78,36" fill={innerEar} />

        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="10" width="100" height="100" fill={color} />
          <circle cx="50" cy="58" r="38" fill={light} />

          {/* 目 */}
          <g transform={isThinking ? 'translate(-2, 0)' : ''}>
            <ellipse cx="35" cy="52" rx="6" ry="7" fill="white" />
            <ellipse cx={isThinking ? '33' : '35'} cy="52" rx="4" ry="5" fill="#2D1B00"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '35px 52px' }} />
            <circle cx={isThinking ? '32' : '34'} cy="50" r="1.5" fill="white" />

            <ellipse cx="65" cy="52" rx="6" ry="7" fill="white" />
            <ellipse cx={isThinking ? '63' : '65'} cy="52" rx="4" ry="5" fill="#2D1B00"
              className={!isThinking && !isTalking ? 'concierge-blink' : ''}
              style={{ transformOrigin: '65px 52px' }} />
            <circle cx={isThinking ? '62' : '64'} cy="50" r="1.5" fill="white" />
          </g>

          {/* 鼻 */}
          <ellipse cx="50" cy="62" rx="3" ry="2" fill="#F9A8D4" />

          {/* 口（猫口 ω） */}
          {isTalking ? (
            <ellipse cx="50" cy="70" rx="6" ry="4" fill="#2D1B00" className="concierge-talk" style={{ transformOrigin: '50px 70px' }} />
          ) : isThinking ? (
            <circle cx="50" cy="68" r="2" fill="#2D1B00" />
          ) : (
            <g>
              <path d="M 44 65 Q 47 70 50 65" fill="none" stroke="#2D1B00" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 50 65 Q 53 70 56 65" fill="none" stroke="#2D1B00" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* ヒゲ */}
          <line x1="10" y1="56" x2="28" y2="60" stroke="#2D1B00" strokeWidth="1" opacity="0.4" />
          <line x1="10" y1="62" x2="28" y2="62" stroke="#2D1B00" strokeWidth="1" opacity="0.4" />
          <line x1="72" y1="60" x2="90" y2="56" stroke="#2D1B00" strokeWidth="1" opacity="0.4" />
          <line x1="72" y1="62" x2="90" y2="62" stroke="#2D1B00" strokeWidth="1" opacity="0.4" />

          {/* ほっぺ */}
          <circle cx="24" cy="66" r="6" fill="#F9A8D4" opacity="0.3" />
          <circle cx="76" cy="66" r="6" fill="#F9A8D4" opacity="0.3" />
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
