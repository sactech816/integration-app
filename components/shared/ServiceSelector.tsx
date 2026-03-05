'use client';

import React from 'react';
import { Sparkles, UserCircle, Building2, ArrowRight, FileText, Users, Calendar, PenTool, Gamepad2, Lightbulb, Crown, Image, Store, PartyPopper, Mail, GitBranch, Video, ClipboardCheck, Send } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/lib/types';
import Link from 'next/link';

type ServiceCategoryId = 'page' | 'quiz' | 'writing' | 'marketing' | 'monetization';

interface ServiceSelectorProps {
  onSelect: (service: ServiceType) => void;
  selectedService?: ServiceType;
  variant?: 'cards' | 'tabs' | 'buttons';
  showDescription?: boolean;
  showGamification?: boolean;
  ctaLabel?: string;
}

const serviceCategories: { id: ServiceCategoryId; label: string }[] = [
  { id: 'page', label: 'LP・ページ作成' },
  { id: 'quiz', label: '診断・クイズ' },
  { id: 'writing', label: 'ライティング・制作' },
  { id: 'marketing', label: '集客・イベント' },
  { id: 'monetization', label: '収益化・販売' },
];

const serviceConfig = [
  // LP・ページ作成
  {
    id: 'profile' as ServiceType,
    icon: UserCircle,
    label: 'プロフィールメーカー',
    description: 'リンクまとめページを簡単作成。SNSプロフィールに最適なランディングページ',
    gradient: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-50',
    features: ['リンクまとめ', 'ブロック編集', 'おしゃれなデザイン'],
    category: 'page' as ServiceCategoryId,
  },
  {
    id: 'business' as ServiceType,
    icon: Building2,
    label: 'LPメーカー',
    description: 'ビジネス向けLPを簡単作成。商品・サービスの魅力を効果的にアピール',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-50',
    features: ['AI Flyer機能', 'テンプレート豊富', 'CV最適化'],
    category: 'page' as ServiceCategoryId,
  },
  {
    id: 'webinar' as ServiceType,
    icon: Video,
    label: 'ウェビナーLPメーカー',
    description: 'ウェビナー・オンラインセミナーの集客LPを簡単作成。申し込みフォーム付き',
    gradient: 'from-indigo-400 to-violet-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-50',
    features: ['LP作成', '申込フォーム', '参加者管理'],
    category: 'page' as ServiceCategoryId,
  },
  {
    id: 'onboarding' as ServiceType,
    icon: Lightbulb,
    label: 'はじめかたメーカー',
    description: 'サイトに埋め込めるはじめかたガイドを簡単作成。外部サイトへの埋め込みにも対応',
    gradient: 'from-indigo-400 to-blue-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-50',
    features: ['埋め込み対応', 'トリガー設定', 'JSスニペット'],
    isPro: true,
    category: 'page' as ServiceCategoryId,
  },
  // 診断・クイズ
  {
    id: 'quiz' as ServiceType,
    icon: Sparkles,
    label: '診断クイズメーカー',
    description: 'AIで診断・検定・占いを簡単作成。集客やエンゲージメント向上に最適',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    hoverBg: 'hover:bg-emerald-50',
    features: ['AI自動生成', '診断・検定・占い', 'SNSシェア対応'],
    category: 'quiz' as ServiceCategoryId,
  },
  {
    id: 'entertainment' as ServiceType,
    icon: PartyPopper,
    label: 'エンタメ診断メーカー',
    description: 'バズるエンタメ系診断コンテンツをAIで簡単作成。SNSで拡散される楽しい診断',
    gradient: 'from-emerald-400 to-green-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    hoverBg: 'hover:bg-emerald-50',
    features: ['AI自動生成', 'SNSバズ', 'エンタメ系'],
    category: 'quiz' as ServiceCategoryId,
  },
  // ライティング・制作
  {
    id: 'salesletter' as ServiceType,
    icon: PenTool,
    label: 'セールスライター',
    description: 'セールスレター・LP文章をAIで自動生成。売れるコピーライティングを簡単作成',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI自動生成', '売れる文章', 'テンプレート'],
    category: 'writing' as ServiceCategoryId,
  },
  {
    id: 'thumbnail' as ServiceType,
    icon: Image,
    label: 'サムネイルメーカー',
    description: 'YouTube・ブログ・Kindle用のサムネイル画像をAIで自動生成。プロ品質のビジュアルを簡単作成',
    gradient: 'from-amber-400 to-yellow-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI自動生成', 'YouTube対応', 'Kindle表紙'],
    isPro: true,
    category: 'writing' as ServiceCategoryId,
  },
  // 集客・イベント
  {
    id: 'booking' as ServiceType,
    icon: Calendar,
    label: '予約メーカー',
    description: 'ビジネス向け予約管理システム。効率的な予約管理が可能',
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-50',
    features: ['カレンダー連携', 'Excel出力', '通知機能'],
    category: 'marketing' as ServiceCategoryId,
  },
  {
    id: 'attendance' as ServiceType,
    icon: Users,
    label: '出欠表メーカー',
    description: '飲み会・イベントの日程調整を簡単に。調整さん風の出欠表を無料で作成',
    gradient: 'from-cyan-400 to-teal-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-50',
    features: ['ログイン不要', '無制限作成', 'リアルタイム集計'],
    category: 'marketing' as ServiceCategoryId,
  },
  {
    id: 'survey' as ServiceType,
    icon: FileText,
    label: 'アンケートメーカー',
    description: 'オンラインアンケート・投票・フィードバック収集を無料で作成',
    gradient: 'from-cyan-500 to-sky-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-50',
    features: ['簡単作成', '集計機能', 'リアルタイム更新'],
    category: 'marketing' as ServiceCategoryId,
  },
  {
    id: 'newsletter' as ServiceType,
    icon: Mail,
    label: 'メルマガメーカー',
    description: 'メールマガジンの作成・配信・管理を一元化。ステップメール配信にも対応',
    gradient: 'from-cyan-400 to-blue-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-50',
    features: ['メール配信', '読者管理', 'ステップメール'],
    category: 'marketing' as ServiceCategoryId,
  },
  {
    id: 'funnel' as ServiceType,
    icon: GitBranch,
    label: 'ファネルメーカー',
    description: '集客から成約までのセールスファネルを簡単構築。マーケティング自動化',
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-50',
    features: ['ファネル構築', 'マーケ自動化', '成約率UP'],
    category: 'marketing' as ServiceCategoryId,
  },
  // 収益化・販売
  {
    id: 'order-form' as ServiceType,
    icon: ClipboardCheck,
    label: 'フォームメーカー',
    description: '申し込み・決済フォームを簡単作成。Stripe連携でオンライン決済にも対応',
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    hoverBg: 'hover:bg-purple-50',
    features: ['申込フォーム', '決済連携', 'カスタマイズ'],
    category: 'monetization' as ServiceCategoryId,
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
              {/* PROバッジ */}
              {service.isPro && (
                <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  <Crown size={10} />PRO
                </div>
              )}

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

        {/* スキルマーケットへのリンク */}
        <div className="mt-4 p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-2xl border border-violet-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Store className="text-white" size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">スキルマーケット</h3>
                  <span className="flex items-center gap-0.5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Crown size={10} />PRO
                  </span>
                </div>
                <p className="text-sm text-gray-600">LP制作・診断クイズ・デザインなど、集客のプロに直接依頼できる</p>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all whitespace-nowrap"
            >
              <Store size={20} />
              詳しく見る
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
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

























































































































