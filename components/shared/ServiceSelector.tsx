'use client';

import React, { useState } from 'react';
import { Sparkles, UserCircle, Building2, ArrowRight, FileText, Users, Calendar, PenTool, Gamepad2, Lightbulb, Crown, Image, Store, PartyPopper, Mail, GitBranch, Video, ClipboardCheck, Send, BookOpen, Share2, ListOrdered, MessageCircle, Search, TrendingUp } from 'lucide-react';
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
    label: 'ガイドメーカー',
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
  {
    id: 'sns-post' as ServiceType,
    icon: Send,
    label: 'SNS投稿メーカー',
    description: 'SNS投稿文をAIで自動生成。X・Instagram・Facebook等に最適な投稿を簡単作成',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI自動生成', 'SNS最適化', 'マルチ対応'],
    category: 'writing' as ServiceCategoryId,
    href: '/sns-post',
  },
  {
    id: 'kindle' as ServiceType,
    icon: BookOpen,
    label: 'Kindle執筆体験版',
    description: 'AIでKindle本を執筆体験。書籍執筆の第一歩をサポート',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI執筆', '体験版', '無料'],
    category: 'writing' as ServiceCategoryId,
    href: '/kindle/demo',
    isDemo: true,
  },
  {
    id: 'kindle-discovery' as ServiceType,
    icon: Lightbulb,
    label: 'ネタ発掘診断',
    description: 'あなたに合った執筆ネタをAIが診断。書籍・ブログのテーマ探しに',
    gradient: 'from-amber-400 to-yellow-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    features: ['AI診断', 'ネタ発掘', '無料'],
    category: 'writing' as ServiceCategoryId,
    href: '/kindle/discovery/demo',
    isDemo: true,
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
  {
    id: 'affiliate' as ServiceType,
    icon: Share2,
    label: 'アフィリエイト',
    description: '集客メーカーを紹介して報酬を獲得。紹介プログラムで収益化',
    gradient: 'from-purple-400 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    hoverBg: 'hover:bg-purple-50',
    features: ['紹介報酬', '簡単登録', '収益化'],
    category: 'monetization' as ServiceCategoryId,
    href: '/affiliate',
  },
  // 集客・イベント（追加ツール）
  {
    id: 'step-email' as ServiceType,
    icon: ListOrdered,
    label: 'ステップメール',
    description: 'シナリオ設計からメール配信まで自動化。見込み客を自動でナーチャリング',
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-50',
    features: ['自動配信', 'シナリオ設計', 'ナーチャリング'],
    isPro: true,
    category: 'marketing' as ServiceCategoryId,
    href: '/step-email',
  },
  {
    id: 'line' as ServiceType,
    icon: MessageCircle,
    label: 'LINE配信',
    description: 'LINE公式アカウントと連携してメッセージ配信。リッチメニュー・ステップ配信に対応',
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    hoverBg: 'hover:bg-green-50',
    features: ['LINE連携', 'ステップ配信', 'リッチメニュー'],
    isPro: true,
    category: 'marketing' as ServiceCategoryId,
    href: '/line',
  },
  // 集客・マーケティング（YouTube系ツール）
  {
    id: 'youtube-analysis' as ServiceType,
    icon: Search,
    label: 'YouTubeリサーチ',
    description: 'YouTube動画のリサーチ・分析をAIでサポート。競合分析やネタ探しに最適',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    hoverBg: 'hover:bg-red-50',
    features: ['AI分析', '競合リサーチ', 'ネタ探し'],
    category: 'marketing' as ServiceCategoryId,
    href: '/youtube-analysis',
  },
  {
    id: 'youtube-keyword-research' as ServiceType,
    icon: TrendingUp,
    label: 'YouTubeキーワードリサーチ',
    description: 'キーワード検索で上位動画の指標を一括分析。再生倍率でソート・比較',
    gradient: 'from-rose-500 to-red-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    hoverBg: 'hover:bg-rose-50',
    features: ['キーワード検索', '上位動画分析', '比較チャート'],
    category: 'marketing' as ServiceCategoryId,
    href: '/youtube-keyword-research',
  },
];

const categoryTabStyles: Record<ServiceCategoryId, string> = {
  page: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
  quiz: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  writing: 'bg-amber-100 text-amber-700 border border-amber-300',
  marketing: 'bg-cyan-100 text-cyan-700 border border-cyan-300',
  monetization: 'bg-purple-100 text-purple-700 border border-purple-300',
};

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onSelect,
  selectedService,
  variant = 'cards',
  showDescription = true,
  showGamification = true,
  ctaLabel = '作成する',
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | ServiceCategoryId>('all');

  // カード形式
  if (variant === 'cards') {
    const filteredServices = activeCategory === 'all'
      ? serviceConfig
      : serviceConfig.filter(s => s.category === activeCategory);

    return (
      <div>
        {/* カテゴリタブ */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? categoryTabStyles[cat.id]
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            const cardClassName = `
              group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
              ${selectedService === service.id
                ? `${service.bgLight} ring-2 ring-offset-2 ${service.borderColor.replace('border', 'ring')}`
                : `${service.bgLight} hover:bg-white hover:shadow-xl border border-gray-100`
              }
            `;

            const cardContent = (
              <>
                {/* PROバッジ / デモバッジ */}
                {service.isPro && (
                  <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Crown size={10} />PRO
                  </div>
                )}
                {'isDemo' in service && service.isDemo && !service.isPro && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    デモ
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
              </>
            );

            if ('href' in service && service.href) {
              return (
                <Link key={service.id} href={service.href} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            }

            return (
              <button key={service.id} onClick={() => onSelect(service.id)} className={cardClassName}>
                {cardContent}
              </button>
            );
          })}
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

























































































































