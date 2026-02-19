'use client';

import React from 'react';
import { Sparkles, UserCircle, Building2 } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/lib/types';

type ServiceTabsProps = {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
  };
};

const getServiceIcon = (type: ServiceType) => {
  const icons = {
    quiz: Sparkles,
    profile: UserCircle,
    business: Building2,
  };
  return icons[type];
};

// モバイル用の短いラベル
const SHORT_LABELS: Record<ServiceType, string> = {
  quiz: '診断',
  profile: 'プロフ',
  business: 'LP',
  salesletter: 'セールス',
  survey: 'アンケ',
  gamification: 'ゲーム',
  attendance: '出欠',
  booking: '予約',
  onboarding: 'モーダル',
  thumbnail: 'サムネ',
};

const getServiceColor = (type: ServiceType) => {
  const colors = {
    quiz: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    profile: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    business: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  };
  return colors[type];
};

export default function ServiceTabs({
  selectedService,
  onServiceChange,
  contentCounts,
}: ServiceTabsProps) {
  const services: ServiceType[] = ['quiz', 'profile', 'business'];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex gap-3">
        {services.map((type) => {
          const Icon = getServiceIcon(type);
          const colors = getServiceColor(type);
          const count = contentCounts[type];

          return (
            <button
              key={type}
              onClick={() => onServiceChange(type)}
              className={`flex-1 p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                selectedService === type
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                <Icon size={16} className={colors.text} />
              </div>
              {/* モバイル: 短いラベル、PC: フルラベル */}
              <p className="font-bold text-gray-900 text-xs sm:text-sm">
                <span className="sm:hidden">{SHORT_LABELS[type]}</span>
                <span className="hidden sm:inline">{SERVICE_LABELS[type]}</span>
              </p>
              <div className={`text-base sm:text-lg font-extrabold ${colors.text}`}>{count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
