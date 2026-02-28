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
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

const tools = [
  {
    name: '診断クイズメーカー',
    description: '性格診断、適職診断、心理テスト、検定クイズなどをAIで簡単作成。SNSでバズる診断コンテンツを無料で作れます。',
    icon: Sparkles,
    href: '/quiz',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    features: ['AI自動生成', 'SNSシェア', '分析機能', '無制限作成'],
  },
  {
    name: 'アンケートメーカー',
    description: 'オンラインアンケート・投票・フィードバック収集を無料で作成。Googleフォームの代替として使えます。',
    icon: FileText,
    href: '/survey',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    features: ['簡単作成', '集計機能', 'リアルタイム更新', '無料'],
  },
  {
    name: '出欠表メーカー',
    description: '飲み会・イベントの日程調整を簡単に。調整さん風の出欠表を無料で何度でも作成できます。',
    icon: Users,
    href: '/attendance',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    features: ['ログイン不要', '無制限作成', 'リアルタイム集計', '無料'],
  },
  {
    name: '予約メーカー',
    description: 'ビジネス向け予約管理システム。スプレッドシート連動やExcelエクスポートで効率的な予約管理が可能。',
    icon: Calendar,
    href: '/booking',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    features: ['カレンダー連携', 'Excel出力', '通知機能', '高機能'],
  },
  {
    name: 'プロフィールメーカー',
    description: 'SNSプロフィールに最適なリンクまとめページを作成。lit.linkの代替として無料で使えます。',
    icon: UserCircle,
    href: '/profile',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    features: ['リンクまとめ', 'デザインテンプレート', 'アクセス解析', '無料'],
  },
  {
    name: 'LPメーカー',
    description: '商品・サービスのランディングページを無料で作成。CV最適化されたテンプレートで簡単にLPを作れます。',
    icon: Building2,
    href: '/business',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: ['テンプレート豊富', 'CV最適化', 'レスポンシブ', '無料'],
  },
  {
    name: 'セールスライター',
    description: 'セールスレター・LP文章をAIで自動生成。売れるコピーライティングを誰でも簡単に作成できます。',
    icon: PenTool,
    href: '/salesletter',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    features: ['AI自動生成', '売れる文章', 'テンプレート', '無料'],
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
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '診断クイズメーカー',
        description: '性格診断、適職診断、心理テスト、検定クイズなどをAIで簡単作成',
        url: `${siteUrl}/quiz`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'アンケートメーカー',
        description: 'オンラインアンケート・投票・フィードバック収集を無料で作成',
        url: `${siteUrl}/survey`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '出欠表メーカー',
        description: '飲み会・イベントの日程調整を簡単に。無料で何度でも作成可能',
        url: `${siteUrl}/attendance`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: '予約メーカー',
        description: 'ビジネス向け高機能予約管理システム',
        url: `${siteUrl}/booking`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'プロフィールメーカー',
        description: 'SNSプロフィールに最適なリンクまとめページを作成',
        url: `${siteUrl}/profile`,
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'LPメーカー',
        description: '商品・サービスのランディングページを無料で作成',
        url: `${siteUrl}/business`,
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: 'セールスライター',
        description: 'セールスレター・LP文章をAIで自動生成',
        url: `${siteUrl}/salesletter`,
      },
    ],
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
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              主要ツール
            </h2>
            <p className="text-lg text-gray-600">
              集客・マーケティングに必要な基本ツール
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
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
