'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ServiceSelector from '@/components/shared/ServiceSelector';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import { 
  Sparkles, 
  UserCircle, 
  Building2, 
  ArrowRight, 
  Check, 
  Zap,
  Loader2,
  Magnet,
  Target,
  Share2,
  LayoutGrid,
  BookOpen
} from 'lucide-react';

export default function HomePageClient() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email => 
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        // 認証状態の変更を監視
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        // 初期セッション取得
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      window.location.href = '/';
    } else if (page === 'create') {
      // 作成ページへのスクロール
      document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // 全てのページをルーティング
      window.location.href = `/${page}`;
    }
  };

  const handleServiceSelect = (service: string) => {
    navigateTo(`${service}/editor`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-bold text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner serviceType="all" />
      
      <Header 
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />
        
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        setUser={setUser} 
        onNavigate={navigateTo}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 animate-gradient-colors text-white">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* ロゴ */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
              <Magnet size={28} className="text-yellow-300" />
              <span className="text-xl font-bold">集客メーカー</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              顧客を引き寄せる
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                コンテンツ
              </span>
              を作ろう
            </h1>
            <p className="text-xl sm:text-2xl opacity-90 mb-10 font-medium">
              診断クイズ・プロフィールLP・ビジネスLP<br className="sm:hidden" />
              をAIで簡単作成。SNS拡散・SEO対策で集客を加速
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateTo('create')}
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Magnet size={22} />
                無料で作成する
              </button>
              {user ? (
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  マイページへ
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  ログイン
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 波形装飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* ポータルへの誘導 */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <LayoutGrid size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">みんなの作品を見る</h3>
                <p className="text-gray-600 text-sm">他のユーザーが作成した診断クイズ・LPをチェック</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('portal')}
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              <LayoutGrid size={18} />
              ポータルを見る
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Kindle出版サービスの誘導 */}
      <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">📚 キンドルダイレクトライト</h3>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                </div>
                <p className="text-gray-600 text-sm">AIがあなたのKindle出版をフルサポート。目次作成から執筆まで。</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('kindle/lp')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg"
            >
              <BookOpen size={18} />
              詳しく見る
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* サービス選択セクション */}
      <section id="create-section" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              何を作りますか？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              目的に合わせて最適なコンテンツタイプを選択してください
            </p>
          </div>

          <ServiceSelector 
            onSelect={handleServiceSelect}
            variant="cards"
            showDescription={true}
          />
          
          {/* ログイン案内 */}
          {!user && (
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 p-2 rounded-lg flex-shrink-0">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      ログインすると便利な機能が使えます！
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0" />
                        作成したコンテンツの編集・削除が可能
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0" />
                        マイページでアクセス解析を確認
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0" />
                        HTMLダウンロード・埋め込みコードなどの追加オプションが利用可能
                      </li>
                    </ul>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors text-sm"
                    >
                      ログイン / 新規登録
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              集客メーカーが選ばれる理由
            </h2>
            <p className="text-lg text-gray-600">
              顧客を引き寄せる3つの秘密
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI自動生成',
                description: 'テーマを入力するだけでAIが質問・結果・キャッチコピーを自動生成。プロ品質のコンテンツが数分で完成',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
              },
              {
                icon: Share2,
                title: 'SNS拡散設計',
                description: 'シェアされやすい診断結果、魅力的なOGP画像。オーガニックな拡散で広告費ゼロの集客を実現',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
              },
              {
                icon: Target,
                title: 'SEO・AI検索対応',
                description: '構造化データ対応でGoogle・ChatGPT両方からの流入を最大化。検索で見つかるコンテンツに',
                color: 'text-orange-500',
                bg: 'bg-orange-50'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bg} mb-6`}>
                  <feature.icon size={32} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サービス詳細セクション */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* 診断クイズ */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <Sparkles size={16} />
                診断クイズ
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                AIで診断クイズを<br />自動生成
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                性格診断、適職診断、心理テスト、検定クイズ、占いなど、
                様々なタイプの診断コンテンツをAIが自動生成。
                質問数や結果パターンもカスタマイズ可能です。
              </p>
              <ul className="space-y-3 mb-8">
                {['AI自動生成で数分で完成', '3つのモード（診断・検定・占い）', 'SNSシェア機能搭載', '分析ダッシュボード付き'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Check size={12} className="text-indigo-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('quiz/editor')}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                診断クイズを作成
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Sparkles size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">診断クイズプレビュー</p>
              </div>
            </div>
          </div>

          {/* プロフィールLP */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <UserCircle size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">プロフィールLPプレビュー</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <UserCircle size={16} />
                プロフィールLP
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                リンクまとめページを<br />おしゃれに作成
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                SNSプロフィールに最適なリンクまとめページを作成。
                ブロック形式で自由にレイアウトをカスタマイズ。
                おしゃれなテンプレートですぐに始められます。
              </p>
              <ul className="space-y-3 mb-8">
                {['ブロック形式の直感的な編集', 'おしゃれなテンプレート', 'LINE・YouTube埋め込み対応', 'カスタムドメイン対応'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('profile/editor')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                プロフィールLPを作成
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* ビジネスLP */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <Building2 size={16} />
                ビジネスLP
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                ビジネス向けLPを<br />簡単作成
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                商品・サービスの魅力を効果的にアピール。
                CV最適化されたテンプレートで、
                プロ品質のランディングページを簡単に作成できます。
              </p>
              <ul className="space-y-3 mb-8">
                {['AI Flyer機能搭載', 'CV最適化テンプレート', '料金表・FAQ対応', 'お問い合わせフォーム付き'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                      <Check size={12} className="text-amber-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('business/editor')}
                className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors"
              >
                ビジネスLPを作成
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Building2 size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">ビジネスLPプレビュー</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 animate-gradient-colors text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Magnet size={20} className="text-yellow-300" />
            <span className="font-bold">集客メーカー</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            今すぐ無料で集客を始めよう
          </h2>
          <p className="text-xl opacity-90 mb-10">
            アカウント登録不要で、すぐにコンテンツ作成を始められます
          </p>
          <button
            onClick={() => navigateTo('create')}
            className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-10 py-5 rounded-full text-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Magnet size={24} />
            無料で作成する
          </button>
        </div>
      </section>

      <Footer 
        setPage={navigateTo}
        onCreate={(service) => service && navigateTo(`${service}/editor`)}
        user={user} 
        setShowAuth={setShowAuth}
      />
    </div>
  );
}












