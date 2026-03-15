'use client';

import type { AvatarState, AvatarStyle } from './types';
import { normalizeAvatarStyle } from './types';
import { getAvatarComponent } from './avatars';
import CustomImageAvatar from './avatars/CustomImageAvatar';

interface ConciergeAvatarProps {
  state: AvatarState;
  size?: number;
  avatarStyle?: any;
}

export default function ConciergeAvatar({ state, size = 48, avatarStyle }: ConciergeAvatarProps) {
  const style = normalizeAvatarStyle(avatarStyle);

  // カスタム画像の場合
  if (style.type === 'custom' && style.customImageUrl) {
    return (
      <CustomImageAvatar
        imageUrl={style.customImageUrl}
        state={state}
        size={size}
        imageShape={style.customImageShape || 'circle'}
        aspectRatio={style.aspectRatio}
      />
    );
  }

  // プリセットアバター
  const AvatarComponent = getAvatarComponent(style.type);
  if (AvatarComponent) {
    return (
      <AvatarComponent
        color={style.primaryColor}
        state={state}
        size={size}
        shape={style.shape}
        aspectRatio={style.aspectRatio}
      />
    );
  }

  // フォールバック: MakerAvatar
  const MakerFallback = getAvatarComponent('maker')!;
  return (
    <MakerFallback
      color={style.primaryColor}
      state={state}
      size={size}
      shape={style.shape}
      aspectRatio={style.aspectRatio}
    />
  );
}
