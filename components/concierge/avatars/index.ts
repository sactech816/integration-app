import type { AvatarType, AvatarState, AvatarShape } from '../types';
import MakerAvatar from './MakerAvatar';
import BusinessAvatar from './BusinessAvatar';
import YasashiiAvatar from './YasashiiAvatar';
import AnimeAvatar from './AnimeAvatar';
import RobotAvatar from './RobotAvatar';
import NekoAvatar from './NekoAvatar';

export interface AvatarPresetProps {
  color: string;
  state: AvatarState;
  size: number;
  shape: AvatarShape;
  aspectRatio: number;
}

type AvatarComponent = React.ComponentType<AvatarPresetProps>;

export const AVATAR_REGISTRY: Record<string, AvatarComponent> = {
  maker: MakerAvatar,
  business: BusinessAvatar,
  yasashii: YasashiiAvatar,
  anime: AnimeAvatar,
  robot: RobotAvatar,
  neko: NekoAvatar,
};

export function getAvatarComponent(type: AvatarType): AvatarComponent | null {
  return AVATAR_REGISTRY[type] || null;
}
