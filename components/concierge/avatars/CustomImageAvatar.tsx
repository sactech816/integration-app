'use client';

import type { AvatarState, CustomImageShape } from '../types';

interface Props {
  imageUrl: string;
  state: AvatarState;
  size: number;
  imageShape: CustomImageShape;
  aspectRatio: number;
}

const CLIP_STYLES: Record<CustomImageShape, string> = {
  circle: 'clip-path: circle(50%)',
  rounded: 'clip-path: inset(0 round 20%)',
  square: '',
};

export default function CustomImageAvatar({ imageUrl, state, size, imageShape, aspectRatio }: Props) {
  const clipStyle = CLIP_STYLES[imageShape] || '';

  return (
    <div
      className={`relative ${state === 'idle' ? 'concierge-float' : ''} ${state === 'talking' ? 'concierge-talk-pulse' : ''}`}
      style={{
        width: size,
        height: size * aspectRatio,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="アバター"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          transform: `scaleY(${aspectRatio})`,
          ...(clipStyle ? { clipPath: clipStyle.replace('clip-path: ', '') } : {}),
        }}
        className="block"
      />

      {/* 考え中ドット */}
      {state === 'thinking' && (
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
