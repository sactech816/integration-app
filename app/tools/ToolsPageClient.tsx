'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UserCircle,
  Building2,
  FileText,
  Calendar,
  Users,
  Gift,
  Gamepad2,
  Ticket,
  Star,
  Stamp,
  ArrowRight,
  TrendingUp,
  PenTool,
  Crown,
  Image,
  Store,
  Lightbulb,
  PartyPopper,
  Mail,
  GitBranch,
  Video,
  ClipboardCheck,
  Send,
  BookOpen,
  Share2,
  ListOrdered,
  MessageCircle,
  Search,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

type ToolCategoryId = 'page' | 'quiz' | 'writing' | 'marketing' | 'monetization';

type ToolDef = {
  name: string;
  description: string;
  icon: typeof Sparkles;
  href: string;
  color: string;
  bgColor: string;
  textColor: string;
  features: string[];
  isPro?: boolean;
  isDemo?: boolean;
  category: ToolCategoryId;
};

const toolCategories: { id: ToolCategoryId; label: string; color: string }[] = [
  { id: 'page', label: 'LP・ページ作成', color: 'text-indigo-600' },
  { id: 'quiz', label: '診断・クイズ', color: 'text-emerald-600' },
  { id: 'writing', label: 'ライティング・制作', color: 'text-amber-600' },
  { id: 'marketing', label: '集客・イベント', color: 'text-cyan-600' },
  { id: 'monetization', label: '収益化・販売', color: 'text-purple-600' },
];

const tools: ToolDef[] = [
  // LP・ページ作成
  {
    name: 'プロフィールメーカー',
    description: 'SNSプロフィールに最適なリンクまとめページを作成。lit.linkの代替として無料で使えます。',
    icon: UserCircle,
    href: '/profile',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    features: ['リンクまとめ', 'デザインテンプレート', 'アクセス解析', '無料'],
    category: 'page',
  },
  {
    name: 'LPメーカー',
    description: '商品・サービスのランディングページを無料で作成。CV最適化されたテンプレートで簡単にLPを作れます。',
    icon: Building2,
    href: '/business',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    features: ['テンプレート豊富', 'CV最適化', 'レスポンシブ', '無料'],
    category: 'page',
  },
  {
    name: 'ウェビナーLPメーカー',
    description: 'ウェビナー・オンラインセミナーの集客LPを簡単作成。申し込みフォーム付きで参加者管理も楽々。',
    icon: Video,
    href: '/webinar/editor',
    color: 'from-indigo-400 to-violet-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    features: ['LP作成', '申込フォーム', '参加者管理', '無料'],
    category: 'page',
  },
  {
    name: 'はじめかたメーカー',
    description: 'サイトに埋め込めるはじめかたガイドを簡単作成。外部サイトへの埋め込みにも対応します。',
    icon: Lightbulb,
    href: '/onboarding',
    color: 'from-indigo-400 to-blue-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    features: ['埋め込み対応', 'トリガー設定', 'JSスニペット', 'PRO'],
    isPro: true,
    category: 'page',
  },
  // 診断・クイズ
  {
    name: '診断クイズメーカー',
    description: '性格診断、適職診断、心理テスト、検定クイズなどをAIで簡単作成。SNSでバズる診断コンテンツを無料で作れます。',
    icon: Sparkles,
    href: '/quiz',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    features: ['AI自動生成', 'SNSシェア', '分析機能', '無制限作成'],
    category: 'quiz',
  },
  {
    name: 'エンタメ診断メーカー',
    description: 'バズるエンタメ系診断コンテンツをAIで簡単作成。SNSで拡散される楽しい診断を作れます。',
    icon: PartyPopper,
    href: '/entertainment/create',
    color: 'from-emerald-400 to-green-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    features: ['AI自動生成', 'SNSバズ', 'エンタメ系', '簡単作成'],
    category: 'quiz',
  },
  // ライティング・制作
  {
    name: 'セールスライター',
    description: 'セールスレター・LP文章をAIで自動生成。売れるコピーライティングを誰でも簡単に作成できます。',
    icon: PenTool,
    href: '/salesletter',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: ['AI自動生成', '売れる文章', 'テンプレート', '無料'],
    category: 'writing',
  },
  {
    name: 'サムネイルメーカー',
    description: 'YouTube・ブログ・Kindle用のサムネイル画像をAIで自動生成。プロ品質のビジュアルを簡単に作成できます。',
    icon: Image,
    href: '/thumbnail',
    color: 'from-amber-400 to-yellow-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: ['AI自動生成', 'YouTube対応', 'Kindle表紙', 'PRO'],
    isPro: true,
    category: 'writing',
  },
  {
    name: 'SNS投稿メーカー',
    description: 'SNS投稿文をAIで自動生成。X・Instagram・Facebook等に最適な投稿を簡単作成。',
    icon: Send,
    href: '/sns-post',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: ['AI自動生成', 'SNS最適化', 'マルチプラットフォーム', '無料'],
    category: 'writing',
  },
  {
    name: 'Kindle執筆体験版',
    description: 'AIでKindle本を執筆体験。書籍執筆の第一歩をサポートします。',
    icon: BookOpen,
    href: '/kindle/demo',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: ['AI執筆', '体験版', '書籍作成', '無料'],
    isDemo: true,
    category: 'writing',
  },
  {
    name: 'ネタ発掘診断',
    description: 'あなたに合った執筆ネタをAIが診断。書籍・ブログのテーマ探しに最適。',
    icon: Lightbulb,
    href: '/kindle/discovery/demo',
    isDemo: true,
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: ['AI診断', 'ネタ発掘', 'テーマ探し', '無料'],
    category: 'writing',
  },
  // 集客・イベント
  {
    name: '予約メーカー',
    description: 'ビジネス向け予約管理システム。スプレッドシート連動やExcelエクスポートで効率的な予約管理が可能。',
    icon: Calendar,
    href: '/booking',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    features: ['カレンダー連携', 'Excel出力', '通知機能', '高機能'],
    category: 'marketing',
  },
  {
    name: '出欠表メーカー',
    description: '飲み会・イベントの日程調整を簡単に。調整さん風の出欠表を無料で何度でも作成できます。',
    icon: Users,
    href: '/attendance',
    color: 'from-cyan-400 to-teal-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    features: ['ログイン不要', '無制限作成', 'リアルタイム集計', '無料'],
    category: 'marketing',
  },
  {
    name: 'アンケートメーカー',
    description: 'オンラインアンケート・投票・フィードバック収集を無料で作成。Googleフォームの代替として使えます。',
    icon: FileText,
    href: '/survey',
    color: 'from-cyan-500 to-sky-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    features: ['簡単作成', '集計機能', 'リアルタイム更新', '無料'],
    category: 'marketing',
  },
  {
    name: 'メルマガメーカー',
    description: 'メールマガジンの作成・配信・管理を一元化。読者リスト管理からステップメール配信まで対応。',
    icon: Mail,
    href: '/newsletter/campaigns/new',
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    features: ['メール配信', '読者管理', 'ステップメール', '無料'],
    category: 'marketing',
  },
  {
    name: 'ファネルメーカー',
    description: '集客から成約までのセールスファネルを簡単構築。マーケティング自動化で売上アップ。',
    icon: GitBranch,
    href: '/funnel/new',
    color: 'from-cyan-500 to-teal-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    features: ['ファネル構築', 'マーケ自動化', '成約率UP', '無料'],
    category: 'marketing',
  },
  // 収益化・販売
  {
    name: 'フォームメーカー',
    description: '申し込み・決済フォームを簡単作成。Stripe連携でオンライン決済にも対応。',
    icon: ClipboardCheck,
    href: '/order-form/new',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    features: ['申込フォーム', '決済連携', 'カスタマイズ', '無料'],
    category: 'monetization',
  },
  {
    name: 'スキルマーケット',
    description: 'LP作成・診断クイズ・デザインなど集客のプロに依頼できるマーケット。ビジネスを加速させましょう。',
    icon: Store,
    href: '/marketplace',
    color: 'from-purple-400 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    features: ['プロに依頼', 'LP制作', 'デザイン', 'PRO'],
    isPro: true,
    category: 'monetization',
  },
  {
    name: 'アフィリエイト',
    description: '集客メーカーを紹介して報酬を獲得。紹介プログラムで簡単に収益化できます。',
    icon: Share2,
    href: '/affiliate',
    color: 'from-purple-400 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    features: ['紹介報酬', '簡単登録', '収益化', '無料'],
    category: 'monetization',
  },
  // 集客・イベント（追加ツール）
  {
    name: 'ステップメール',
    description: 'シナリオ設計からメール配信まで自動化。見込み客を段階的にナーチャリングして成約率をアップ。',
    icon: ListOrdered,
    href: '/step-email',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    features: ['自動配信', 'シナリオ設計', 'ナーチャリング', 'PRO'],
    isPro: true,
    category: 'marketing',
  },
  {
    name: 'LINE配信',
    description: 'LINE公式アカウントと連携してメッセージ配信。リッチメニュー・ステップ配信で顧客との関係を構築。',
    icon: MessageCircle,
    href: '/line',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    features: ['LINE連携', 'ステップ配信', 'リッチメニュー', 'PRO'],
    isPro: true,
    category: 'marketing',
  },
  // ライティング・制作（追加ツール）
  {
    name: 'YouTubeリサーチ',
    description: 'YouTube動画のリサーチ・分析をAIでサポート。競合分析やネタ探し、トレンド把握に最適。',
    icon: Search,
    href: '/youtube-analysis',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    features: ['AI分析', '競合リサーチ', 'ネタ探し', 'トレンド'],
    category: 'writing',
  },
];

const gamificationTools = [
  {
    name: '福引き',
    description: 'デジタル福引きで景品抽選。イベントやキャンペーンに最適。',
    icon: Gift,
    href: '/fukubiki',
    color: 'from-pink-500 to-rose-600',
  },
  {
    name: 'ガチャ',
    description: 'オンラインガチャで景品をランダム抽選。楽しいコンテンツを提供。',
    icon: Gamepad2,
    href: '/gacha',
    color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'スロット',
    description: 'スロットゲームで景品抽選。エンターテイメント性抜群。',
    icon: Star,
    href: '/slot',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    name: 'スクラッチ',
    description: 'スクラッチカードで景品当選。リアルな削る体験。',
    icon: Ticket,
    href: '/scratch',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'スタンプラリー',
    description: 'デジタルスタンプラリーでリピート促進。店舗・イベントに最適。',
    icon: Stamp,
    href: '/stamp-rally',
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'ログインボーナス',
    description: '毎日のログインでポイント付与。継続利用を促進。',
    icon: TrendingUp,
    href: '/login-bonus',
    color: 'from-indigo-500 to-purple-600',
  },
];

export default function ToolsPageClient() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | ToolCategoryId>('all');

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });
        subscription = sub;

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (path: string) => {
    if (path === '/' || path === '') {
      window.location.href = '/';
    } else {
      window.location.href = `/${path}`;
    }
  };

  // 構造化データ - ItemList
  const toolsListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '集客メーカーの無料ツール一覧',
    description: '集客メーカーで利用できる全ツール',
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: `${siteUrl}${tool.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsListSchema) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />

        {/* ヒーローセクション */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                無料集客ツール一覧
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                診断クイズ、アンケート、予約システム、LP作成など、<br className="hidden sm:block" />
                あらゆる集客ツールが完全無料で使えます
              </p>
            </div>
          </div>

          {/* 波形装飾 */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
                fill="#f9fafb"
              />
            </svg>
          </div>
        </section>

        {/* メインツール */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              主要ツール
            </h2>
            <p className="text-lg text-gray-600">
              集客・マーケティングに必要な基本ツール
            </p>
          </div>

          {/* カテゴリタブ */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {toolCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === cat.id
                    ? cat.id === 'page' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : cat.id === 'quiz' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : cat.id === 'writing' ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : cat.id === 'marketing' ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                    : 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools
              .filter((tool) => activeTab === 'all' || tool.category === activeTab)
              .map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={index}
                  href={tool.href}
                  className={`group relative ${tool.bgColor} rounded-2xl border-2 border-gray-100 p-8 hover:bg-white hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* PROバッジ / デモバッジ */}
                  {tool.isPro && (
                    <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold">
                      <Crown size={11} className="mr-0.5" />PRO
                    </div>
                  )}
                  {tool.isDemo && !tool.isPro && (
                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
                      デモ
                    </div>
                  )}

                  {/* アイコン */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon size={32} className="text-white" />
                  </div>

                  {/* タイトル */}
                  <h3 className={`text-2xl font-bold text-gray-900 mb-3 group-hover:${tool.textColor} transition-colors`}>
                    {tool.name}
                  </h3>

                  {/* 説明 */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* 機能リスト */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.features.map((feature, i) => (
                      <span
                        key={i}
                        className={`${tool.bgColor} ${tool.textColor} px-3 py-1 rounded-full text-xs font-bold`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 ${tool.textColor} font-bold group-hover:gap-4 transition-all`}>
                    詳しく見る
                    <ArrowRight size={20} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ゲーミフィケーションツール */}
        <section className="bg-gradient-to-br from-gray-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                ゲーミフィケーションツール
              </h2>
              <p className="text-lg text-gray-600">
                楽しみながら集客・エンゲージメント向上
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {gamificationTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={index}
                    href={tool.href}
                    className="group bg-white rounded-2xl border-2 border-gray-100 p-6 text-center hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {tool.name}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              今すぐ無料で始めよう
            </h2>
            <p className="text-xl opacity-90 mb-8">
              すべてのツールが完全無料。<br className="sm:hidden" />
              会員登録も不要で今すぐ使えます
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Sparkles size={22} />
              無料で始める
            </Link>
          </div>
        </section>

        <Footer setPage={navigateTo} />
      </div>
    </>
  );
}
