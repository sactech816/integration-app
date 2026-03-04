'use client';

import React from 'react';
import { Briefcase, Smile, GraduationCap, PartyPopper, Flame } from 'lucide-react';
import { SNSPostTone } from '@/lib/types';

type ToneOption = {
  value: SNSPostTone;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
};

const TONE_OPTIONS: ToneOption[] = [
  {
    value: 'business',
    label: 'ビジネス',
    icon: Briefcase,
    description: 'プロフェッショナルな印象',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    value: 'casual',
    label: 'カジュアル',
    icon: Smile,
    description: 'フレンドリーで親しみやすい',
    color: 'bg-green-50 text-green-600 border-green-200',
  },
  {
    value: 'education',
    label: '教育・解説',
    icon: GraduationCap,
    description: 'わかりやすく学びのある',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    value: 'entertainment',
    label: 'エンタメ',
    icon: PartyPopper,
    description: '楽しく盛り上がる',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  {
    value: 'inspirational',
    label: 'インスピレーション',
    icon: Flame,
    description: 'モチベーションを高める',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
];

type ToneSelectorProps = {
  selected: SNSPostTone;
  onChange: (tone: SNSPostTone) => void;
};

export default function ToneSelector({ selected, onChange }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {TONE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = selected === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 min-h-[44px] ${
              isActive
                ? `${option.color} border-current shadow-md ring-2 ring-current/20`
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
