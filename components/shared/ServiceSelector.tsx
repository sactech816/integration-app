'use client';

import React from 'react';
import { Sparkles, UserCircle, Building2, ArrowRight } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/lib/types';

interface ServiceSelectorProps {
  onSelect: (service: ServiceType) => void;
  selectedService?: ServiceType;
  variant?: 'cards' | 'tabs' | 'buttons';
  showDescription?: boolean;
}

const serviceConfig = [
  {
    id: 'quiz' as ServiceType,
    icon: Sparkles,
    label: '診断クイズ',
    description: 'AIで診断・検定・占いを簡単作成。集客やエンゲージメント向上に最適',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-50',
    features: ['AI自動生成', '診断・検定・占い', 'SNSシェア対応'],
  },
  {
    id: 'profile' as ServiceType,
    icon: UserCircle,
    label: 'プロフィールLP',
    description: 'リンクまとめページを簡単作成。SNSプロフィールに最適なランディングページ',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    hoverBg: 'hover:bg-emerald-50',
    features: ['リンクまとめ', 'ブロック編集', 'おしゃれなデザイン'],
  },
  {
    id: 'business' as ServiceType,
    icon: Building2,
    label: 'ビジネスLP',
    description: 'ビジネス向けLPを簡単作成。商品・サービスの魅力を効果的にアピール',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI Flyer機能', 'テンプレート豊富', 'CV最適化'],
  },
];

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onSelect,
  selectedService,
  variant = 'cards',
  showDescription = true,
}) => {
  // カード形式
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceConfig.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`
              group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
              ${selectedService === service.id 
                ? `${service.bgLight} ring-2 ring-offset-2 ${service.borderColor.replace('border', 'ring')}` 
                : 'bg-white hover:shadow-xl border border-gray-100'
              }
            `}
          >
            {/* 背景グラデーション（ホバー時） */}
            <div className={`
              absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 
              group-hover:opacity-5 transition-opacity duration-300
            `} />

            {/* アイコン */}
            <div className={`
              w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} 
              flex items-center justify-center mb-4 
              group-hover:scale-110 transition-transform duration-300
            `}>
              <service.icon className="text-white" size={28} />
            </div>

            {/* タイトル */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
              {service.label}
            </h3>

            {/* 説明 */}
            {showDescription && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
            )}

            {/* 機能タグ */}
            <div className="flex flex-wrap gap-2 mb-4">
              {service.features.map((feature) => (
                <span 
                  key={feature}
                  className={`text-xs px-2 py-1 rounded-full ${service.bgLight} ${service.textColor} font-medium`}
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className={`
              flex items-center gap-1 ${service.textColor} font-semibold text-sm
              group-hover:gap-2 transition-all duration-300
            `}>
              <span>作成する</span>
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>
    );
  }

  // タブ形式
  if (variant === 'tabs') {
    return (
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {serviceConfig.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold
              transition-all duration-200
              ${selectedService === service.id 
                ? 'bg-white shadow-md text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <service.icon size={18} className={selectedService === service.id ? service.textColor : ''} />
            <span className="hidden sm:inline">{service.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // ボタン形式
  return (
    <div className="flex flex-wrap gap-3">
      {serviceConfig.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-semibold
            transition-all duration-200 border-2
            ${selectedService === service.id 
              ? `bg-gradient-to-r ${service.gradient} text-white border-transparent` 
              : `${service.bgLight} ${service.textColor} ${service.borderColor}`
            }
          `}
        >
          <service.icon size={18} />
          <span>{service.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ServiceSelector;


































































































