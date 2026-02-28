'use client';

import React from 'react';
import { Sparkles, UserCircle, Building2, ArrowRight, FileText, Users, Calendar, PenTool, Gamepad2, Lightbulb } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/lib/types';
import Link from 'next/link';

interface ServiceSelectorProps {
  onSelect: (service: ServiceType) => void;
  selectedService?: ServiceType;
  variant?: 'cards' | 'tabs' | 'buttons';
  showDescription?: boolean;
  showGamification?: boolean;
  ctaLabel?: string;
}

const serviceConfig = [
  {
    id: 'quiz' as ServiceType,
    icon: Sparkles,
    label: '診断クイズメーカー',
    description: 'AIで診断・検定・占いを簡単作成。集客やエンゲージメント向上に最適',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-50',
    features: ['AI自動生成', '診断・検定・占い', 'SNSシェア対応'],
  },
  {
    id: 'survey' as ServiceType,
    icon: FileText,
    label: 'アンケートメーカー',
    description: 'オンラインアンケート・投票・フィードバック収集を無料で作成',
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    hoverBg: 'hover:bg-teal-50',
    features: ['簡単作成', '集計機能', 'リアルタイム更新'],
  },
  {
    id: 'attendance' as ServiceType,
    icon: Users,
    label: '出欠表メーカー',
    description: '飲み会・イベントの日程調整を簡単に。調整さん風の出欠表を無料で作成',
    gradient: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    hoverBg: 'hover:bg-purple-50',
    features: ['ログイン不要', '無制限作成', 'リアルタイム集計'],
  },
  {
    id: 'booking' as ServiceType,
    icon: Calendar,
    label: '予約メーカー',
    description: 'ビジネス向け予約管理システム。効率的な予約管理が可能',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    hoverBg: 'hover:bg-blue-50',
    features: ['カレンダー連携', 'Excel出力', '通知機能'],
  },
  {
    id: 'profile' as ServiceType,
    icon: UserCircle,
    label: 'プロフィールメーカー',
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
    label: 'LPメーカー',
    description: 'ビジネス向けLPを簡単作成。商品・サービスの魅力を効果的にアピール',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI Flyer機能', 'テンプレート豊富', 'CV最適化'],
  },
  {
    id: 'salesletter' as ServiceType,
    icon: PenTool,
    label: 'セールスライター',
    description: 'セールスレター・LP文章をAIで自動生成。売れるコピーライティングを簡単作成',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    hoverBg: 'hover:bg-rose-50',
    features: ['AI自動生成', '売れる文章', 'テンプレート'],
  },
  {
    id: 'onboarding' as ServiceType,
    icon: Lightbulb,
    label: 'はじめかたメーカー',
    description: 'サイトに埋め込めるはじめかたガイドを簡単作成。外部サイトへの埋め込みにも対応',
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    hoverBg: 'hover:bg-orange-50',
    features: ['埋め込み対応', 'トリガー設定', 'JSスニペット'],
  },
];

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onSelect,
  selectedService,
  variant = 'cards',
  showDescription = true,
  showGamification = true,
  ctaLabel = '作成する',
}) => {
  // カード形式
  if (variant === 'cards') {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                {service.label}
              </h3>

              {/* 説明 */}
              {showDescription && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* 機能タグ */}
              <div className="flex flex-wrap gap-1 mb-4">
                {service.features.slice(0, 2).map((feature) => (
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
                <span>{ctaLabel}</span>
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* ゲーミフィケーションへのリンク */}
        {showGamification && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-2xl border border-purple-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Gamepad2 className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ゲーミフィケーション</h3>
                  <p className="text-sm text-gray-600">ガチャ・福引き・スロット・スクラッチ・スタンプラリー・ログインボーナス</p>
                </div>
              </div>
              <Link
                href="/gamification"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Gamepad2 size={20} />
                詳しく見る
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
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

























































































































