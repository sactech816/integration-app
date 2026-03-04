'use client';

import React from 'react';
import { Twitter, Instagram, MessageCircle } from 'lucide-react';
import { SNSPlatform } from '@/lib/types';

type PlatformConfig = {
  label: string;
  icon: React.ElementType;
  charLimit: number;
  hashtagLimit: number | null;
  color: string;
  activeColor: string;
};

export const PLATFORM_CONFIG: Record<SNSPlatform, PlatformConfig> = {
  twitter: {
    label: 'X (Twitter)',
    icon: Twitter,
    charLimit: 280,
    hashtagLimit: null,
    color: 'text-gray-600',
    activeColor: 'bg-gray-900 text-white',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    charLimit: 2200,
    hashtagLimit: 30,
    color: 'text-gray-600',
    activeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  },
  threads: {
    label: 'Threads',
    icon: MessageCircle,
    charLimit: 500,
    hashtagLimit: null,
    color: 'text-gray-600',
    activeColor: 'bg-gray-900 text-white',
  },
};

type PlatformTabsProps = {
  selected: SNSPlatform;
  onChange: (platform: SNSPlatform) => void;
};

export default function PlatformTabs({ selected, onChange }: PlatformTabsProps) {
  const platforms: SNSPlatform[] = ['twitter', 'instagram', 'threads'];

  return (
    <div className="flex gap-2">
      {platforms.map((platform) => {
        const config = PLATFORM_CONFIG[platform];
        const Icon = config.icon;
        const isActive = selected === platform;

        return (
          <button
            key={platform}
            onClick={() => onChange(platform)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[44px] ${
              isActive
                ? `${config.activeColor} shadow-md`
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
            <span className={`text-xs ${isActive ? 'opacity-75' : 'text-gray-400'}`}>
              {config.charLimit}字
            </span>
          </button>
        );
      })}
    </div>
  );
}
