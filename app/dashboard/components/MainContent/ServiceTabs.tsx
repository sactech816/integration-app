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
              className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                selectedService === type
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                <Icon size={16} className={colors.text} />
              </div>
              <p className="font-bold text-gray-900 text-sm">{SERVICE_LABELS[type]}</p>
              <div className={`text-lg font-extrabold ${colors.text}`}>{count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
