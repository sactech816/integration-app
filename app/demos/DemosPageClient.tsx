'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UserCircle,
  Building2,
  FileText,
  ArrowRight,
  Monitor,
  User,
  BookOpen,
  House,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

// 診断クイズデモ
const quizDemos = [
  {
    name: 'キンドル著者向け診断',
    description: 'あなたに最適なKindle出版ジャンルを診断します',
    href: '/quiz/demo/kindle-author',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    name: '講師向け診断',
    description: 'あなたの講師タイプと強みを診断します',
    href: '/quiz/demo/teacher',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    name: '店舗向け診断',
    description: 'あなたの店舗に最適な集客戦略を診断します',
    href: '/quiz/demo/shop',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    name: 'コンサル向け診断',
    description: 'あなたのコンサルティングスタイルを診断します',
    href: '/quiz/demo/consultant',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
];

// プロフィールLPデモ
const profileDemos = [
  {
    name: 'フルセット（15ブロック）',
    description: 'すべてのブロックを使った完全版プロフィール',
    href: '/profile/demo/full-set',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'コンサルタント・士業（8ブロック）',
    description: '信頼性を重視したプロフェッショナル向け',
    href: '/profile/demo/consultant',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'コーチ・講師（8ブロック）',
    description: '実績と専門性をアピールする構成',
    href: '/profile/demo/coach',
    color: 'from-green-500 to-teal-600',
  },
  {
    name: '物販・EC（8ブロック）',
    description: '商品の魅力を最大限に伝える構成',
    href: '/profile/demo/ec',
    color: 'from-pink-500 to-rose-600',
  },
  {
    name: '店舗ビジネス（9ブロック）',
    description: '店舗の雰囲気と強みを伝える構成',
    href: '/profile/demo/shop',
    color: 'from-orange-500 to-amber-600',
  },
  {
    name: 'カフェ・飲食店（9ブロック）',
    description: '美味しさと居心地の良さをアピール',
    href: '/profile/demo/cafe',
    color: 'from-yellow-500 to-orange-600',
  },
];

// ビジネスLPデモ
const businessDemos = [
  {
    name: '店舗ビジネス（9ブロック）',
    description: '地域密着型店舗向けの集客LP',
    href: '/business/demo/shop',
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'カフェ・飲食店（9ブロック）',
    description: '雰囲気とメニューで魅力を伝える',
    href: '/business/demo/cafe',
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'PASONA法則（12ブロック）',
    description: '問題提起から解決策まで論理的に訴求',
    href: '/business/demo/pasona',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'AIDOMA法則（12ブロック）',
    description: '注目→興味→欲求→動機→行動の王道構成',
    href: '/business/demo/aidoma',
    color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'QUEST法則（13ブロック）',
    description: '共感から行動喚起まで段階的に誘導',
    href: '/business/demo/quest',
    color: 'from-red-500 to-rose-600',
  },
  {
    name: '診断コンテンツ（11ブロック）',
    description: '診断を軸にした興味喚起型LP',
    href: '/business/demo/diagnosis',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    name: '書籍プロモーション（12ブロック）',
    description: '本の魅力を最大限に伝える構成',
    href: '/business/demo/book-promotion',
    color: 'from-teal-500 to-cyan-600',
  },
];

// アンケートデモ
const surveyDemos = [
  {
    name: '顧客満足度調査（5問）',
    description: 'サービス・商品への満足度を測定',
    href: '/survey/demo/customer-satisfaction',
    color: 'from-rose-500 to-pink-600',
  },
  {
    name: 'イベント・セミナーアンケート（5問）',
    description: 'イベント参加者の満足度と改善点を収集',
    href: '/survey/demo/event-seminar',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'NPS（推奨度）調査（4問）',
    description: '友人に薦める可能性を測定',
    href: '/survey/demo/nps',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    name: '商品・サービス改善アンケート（5問）',
    description: '改善に向けた具体的なフィードバックを収集',
    href: '/survey/demo/product-service',
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: '研修・講座評価アンケート（5問）',
    description: '研修内容と講師の評価を収集',
    href: '/survey/demo/training',
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: '従業員エンゲージメント調査（5問）',
    description: '職場環境と働きがいを匿名で調査',
    href: '/survey/demo/employee-engagement',
    color: 'from-purple-500 to-pink-600',
  },
];

export default function DemosPageClient() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };

    init();
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

  // 構造化データ - CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'デモ一覧 - 集客メーカー',
    description: '診断クイズ、プロフィールLP、ビジネスLP、アンケートの各種テンプレートのデモページ',
    url: `${siteUrl}/demos`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: quizDemos.length + profileDemos.length + businessDemos.length + surveyDemos.length,
      itemListElement: [
        ...quizDemos.map((demo, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: demo.name,
          url: `${siteUrl}${demo.href}`,
        })),
        ...profileDemos.map((demo, index) => ({
          '@type': 'ListItem',
          position: quizDemos.length + index + 1,
          name: demo.name,
          url: `${siteUrl}${demo.href}`,
        })),
        ...businessDemos.map((demo, index) => ({
          '@type': 'ListItem',
          position: quizDemos.length + profileDemos.length + index + 1,
          name: demo.name,
          url: `${siteUrl}${demo.href}`,
        })),
        ...surveyDemos.map((demo, index) => ({
          '@type': 'ListItem',
          position: quizDemos.length + profileDemos.length + businessDemos.length + index + 1,
          name: demo.name,
          url: `${siteUrl}${demo.href}`,
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />

        {/* ヒーローセクション */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Monitor size={48} className="text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                デモ一覧
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                各ツールのテンプレートを実際に体験できます。<br className="hidden sm:block" />
                デモを見て、あなたのビジネスに最適なものを見つけましょう
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

        {/* 診断クイズデモ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              診断クイズデモ
            </h2>
            <p className="text-lg text-gray-600">
              用途別の診断クイズテンプレートを体験
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quizDemos.map((demo, index) => (
              <Link
                key={index}
                href={demo.href}
                className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className={`text-lg font-bold text-gray-900 mb-2 group-hover:${demo.textColor} transition-colors`}>
                  {demo.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {demo.description}
                </p>
                <div className={`flex items-center gap-2 ${demo.textColor} font-bold text-sm group-hover:gap-4 transition-all`}>
                  デモを見る
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* プロフィールLPデモ */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <UserCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                プロフィールLPデモ
              </h2>
              <p className="text-lg text-gray-600">
                用途別のプロフィールページテンプレートを体験
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileDemos.map((demo, index) => (
                <Link
                  key={index}
                  href={demo.href}
                  className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <UserCircle size={28} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {demo.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {demo.description}
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-4 transition-all">
                    デモを見る
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ビジネスLPデモ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 size={32} className="text-amber-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              ビジネスLPデモ
            </h2>
            <p className="text-lg text-gray-600">
              マーケティング法則に基づいたLPテンプレートを体験
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessDemos.map((demo, index) => (
              <Link
                key={index}
                href={demo.href}
                className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Building2 size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {demo.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {demo.description}
                </p>
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm group-hover:gap-4 transition-all">
                  デモを見る
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* アンケートデモ */}
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText size={32} className="text-teal-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                アンケートデモ
              </h2>
              <p className="text-lg text-gray-600">
                用途別のアンケートテンプレートを体験
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveyDemos.map((demo, index) => (
                <Link
                  key={index}
                  href={demo.href}
                  className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <FileText size={28} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {demo.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {demo.description}
                  </p>
                  <div className="flex items-center gap-2 text-teal-600 font-bold text-sm group-hover:gap-4 transition-all">
                    デモを見る
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              気に入ったテンプレートが見つかりましたか？
            </h2>
            <p className="text-xl opacity-90 mb-8">
              今すぐ無料で作成を始めましょう
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quiz/editor"
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Sparkles size={22} />
                診断クイズを作成
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-purple-700 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-purple-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <House size={22} />
                トップページへ
              </Link>
            </div>
          </div>
        </section>

        <Footer setPage={navigateTo} />
      </div>
    </>
  );
}
