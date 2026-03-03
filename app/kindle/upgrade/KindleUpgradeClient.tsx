'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  ArrowRight,
  FileDown,
  ImageIcon,
  Rocket,
  PenLine,
  BookOpen,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { supabase } from '@/lib/supabase';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';

// プラン定義（LP専用の期間集中プラン）
type LPPlanType = 'trial' | 'standard' | 'business';
interface LPPlan {
  id: LPPlanType;
  name: string;
  price: number;
  period: string;
  description: string;
}

const LP_PLANS: Record<LPPlanType, LPPlan> = {
  trial: {
    id: 'trial',
    name: '30日トライアル',
    price: 49800,
    period: '30日',
    description: '記念に1冊作ってみたい方へ',
  },
  standard: {
    id: 'standard',
    name: '90日スタンダード',
    price: 99800,
    period: '90日',
    description: '副業として印税を得たい方へ',
  },
  business: {
    id: 'business',
    name: '120日プレミアム',
    price: 198000,
    period: '120日',
    description: '本格的に出版を始めたい方へ',
  },
};

// LP専用プランのUnivaPayリンク（直接指定）
const LP_UNIVAPAY_LINKS: Record<LPPlanType, string> = {
  trial: 'https://univa.cc/FGpLA1',
  standard: 'https://univa.cc/E13YDx',
  business: 'https://univa.cc/6yL6zc',
};

export default function KindleUpgradeClient() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // 決済フロー用のState
  const [selectedLPPlan, setSelectedLPPlan] = useState<LPPlanType | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    window.location.href = path === '/' || path === '' ? '/' : `/${path}`;
  };

  // プラン選択
  const handlePlanSelect = (planType: LPPlanType) => {
    setSelectedLPPlan(planType);
    setCheckoutError('');
    if (user?.email && !checkoutEmail) {
      setCheckoutEmail(user.email);
    }
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 決済実行
  const handleCheckout = async () => {
    if (!selectedLPPlan) {
      setCheckoutError('プランを選択してください');
      return;
    }
    if (!checkoutEmail || !checkoutEmail.includes('@')) {
      setCheckoutError('有効なメールアドレスを入力してください');
      return;
    }

    const univaPayLink = LP_UNIVAPAY_LINKS[selectedLPPlan];
    if (!univaPayLink) {
      setCheckoutError('決済リンクが設定されていません。お問い合わせください。');
      return;
    }

    setIsProcessing(true);
    setCheckoutError('');

    const refCode = getReferralCode();
    if (refCode) {
      try {
        await fetch('/api/affiliate/pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: checkoutEmail,
            referralCode: refCode,
            service: 'kdl',
            planTier: selectedLPPlan,
          }),
        });
      } catch (err) {
        console.warn('Failed to save pending affiliate:', err);
      }
    }

    const params = new URLSearchParams({ email: checkoutEmail });
    window.location.href = `${univaPayLink}?${params.toString()}`;
  };

  const upgradeReasons = [
    {
      icon: <FileDown size={24} className="text-blue-500" />,
      title: 'Word / EPUB エクスポート',
      description: '完成した原稿をWord・EPUB形式でダウンロード。そのままKDPにアップロードできます。',
    },
    {
      icon: <ImageIcon size={24} className="text-purple-500" />,
      title: 'AI表紙デザイン生成',
      description: 'プロ品質の表紙をAIが自動生成。テンプレートを選んでワンクリック。',
    },
    {
      icon: <Rocket size={24} className="text-orange-500" />,
      title: '書籍LP自動生成',
      description: '本のランディングページをAIが自動作成。SNSやブログでの告知に最適。',
    },
    {
      icon: <PenLine size={24} className="text-green-500" />,
      title: '文体変換',
      description: '全章一括で文体をリライト。説明文・対話形式・Q&Aなど自由に変換。',
    },
    {
      icon: <Sparkles size={24} className="text-amber-500" />,
      title: 'KDP出版情報の自動生成',
      description: 'カテゴリ・キーワード・紹介文をAIが最適化。Amazon検索で見つかりやすい本に。',
    },
    {
      icon: <TrendingUp size={24} className="text-red-500" />,
      title: 'AI回数の大幅拡張',
      description: '日次リセットで毎日たっぷり使える。プロプランなら1日120回以上。',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
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
        isPasswordReset={false}
        setShowPasswordReset={() => {}}
        onNavigate={navigateTo}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Crown size={16} className="text-yellow-200" />
            あなたの本を完成させましょう
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            有料プランで<br />
            <span className="text-yellow-200">全機能を解放</span>
          </h1>

          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            無料プランで作った本のデータはそのまま引き継がれます。<br className="hidden sm:block" />
            アップグレードするだけで、すぐにダウンロード・出版できます。
          </p>

          <a
            href="#pricing"
            className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-orange-50 transition-all shadow-2xl"
          >
            <Crown size={22} />
            プランを選ぶ
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* 無料プランで既に達成していること */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-green-200 rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-xl">
                <BookOpen size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">無料プランで作成したデータ</h2>
                <p className="text-sm text-gray-600">アップグレード後もすべて引き継がれます</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'タイトル・サブタイトル',
                'ターゲット読者設計',
                '章構成（目次）',
                '執筆した原稿データ',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
                  <Check size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* アップグレードで解放される機能 */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Zap size={16} />
              有料プランで解放
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              出版に必要なすべてが揃います
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgradeReasons.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-gray-50 p-3 rounded-xl w-fit mb-4">
                  {r.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="py-24 relative overflow-hidden border-t border-orange-100" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#5d4037' }}>
              あなたに合ったプランを選んでください
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              まずは1冊作ってみたい方も、しっかり収益化したい方も。<br />
              追加料金なしで始められます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan 1: 30日トライアル */}
            <div className="bg-white w-full rounded-3xl shadow-lg overflow-hidden border-4 border-orange-100 hover:shadow-xl transition duration-300 flex flex-col">
              <div className="py-3 font-bold text-center" style={{ backgroundColor: '#ffedd5', color: '#5d4037' }}>まずはお試し</div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>30日トライアル</h3>
                <p className="text-sm text-gray-500 mb-4">記念に1冊作ってみたい方へ</p>
                <div className="text-3xl font-extrabold mb-6" style={{ color: '#5d4037' }}>¥49,800 <span className="text-sm font-normal text-gray-400">（税込）</span></div>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> システム利用（30日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 本を１冊作れます</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> AI利用（10回/日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> AIモデル（標準）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版準備ガイド</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> Wordエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> EPUBエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版用キーワード提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版用カテゴリ提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版用の書籍紹介文作成</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> LINE招待（閲覧）</li>
                  <li className="flex items-center gap-2 text-gray-300">× アフィリエイト機能</li>
                  <li className="flex items-center gap-2 text-gray-300">× オプション割引</li>
                  <li className="flex items-center gap-2 text-gray-300">× もくもく会</li>
                  <li className="flex items-center gap-2 text-gray-300">× グループセッション</li>
                  <li className="flex items-center gap-2 text-gray-300">× 個別セッション</li>
                </ul>

                <button
                  onClick={() => handlePlanSelect('trial')}
                  className={`block w-full font-bold py-4 rounded-2xl shadow-md transition text-center ${
                    selectedLPPlan === 'trial'
                      ? 'text-white'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ backgroundColor: selectedLPPlan === 'trial' ? '#84cc16' : '#a1a1aa' }}
                >
                  {selectedLPPlan === 'trial' ? '✓ 選択中' : 'このプランで始める'}
                </button>
              </div>
            </div>

            {/* Plan 2: 90日スタンダード (Featured) */}
            <div className="bg-white w-full rounded-3xl shadow-xl overflow-hidden border-4 relative flex flex-col md:scale-105 md:z-10" style={{ borderColor: '#f97316' }}>
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">人気No.1</div>
              <div className="py-3 font-bold text-center text-white" style={{ backgroundColor: '#f97316' }}>しっかりサポート</div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>90日スタンダード</h3>
                <p className="text-sm text-gray-500 mb-4">副業として印税を得たい方へ</p>
                <div className="text-3xl font-extrabold mb-6" style={{ color: '#f97316' }}>¥99,800 <span className="text-sm font-normal text-gray-400">（税込）</span></div>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2 font-bold p-1 rounded" style={{ backgroundColor: '#fffbf0' }}><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> システム利用（90日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 本を３冊まで作成可</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> AI利用（20回/日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> AIモデル（高性能）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版準備ガイド</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> Wordエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> EPUBエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版用キーワード提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版用カテゴリ提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版用の書籍紹介文作成</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> LINE招待（質問可）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> アフィリエイト機能</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> オプション割引</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> もくもく会</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> グループセッション</li>
                  <li className="flex items-center gap-2 text-gray-300">× 個別セッション</li>
                </ul>

                <button
                  onClick={() => handlePlanSelect('standard')}
                  className={`block w-full font-bold py-4 rounded-2xl shadow-lg transition text-center text-white ${
                    selectedLPPlan === 'standard' ? '' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: selectedLPPlan === 'standard' ? '#84cc16' : '#f97316' }}
                >
                  {selectedLPPlan === 'standard' ? '✓ 選択中' : '今すぐ作家デビューする'}
                </button>
              </div>
            </div>

            {/* Plan 3: 120日プレミアム */}
            <div className="bg-white w-full rounded-3xl shadow-lg overflow-hidden border-4 border-purple-200 hover:shadow-xl transition duration-300 flex flex-col">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 font-bold text-center">本格派向け</div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>120日プレミアム</h3>
                <p className="text-sm text-gray-500 mb-4">本格的に出版を始めたい方へ</p>
                <div className="text-3xl font-extrabold text-purple-600 mb-6">¥198,000 <span className="text-sm font-normal text-gray-400">（税込）</span></div>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2 font-bold bg-purple-50 p-1 rounded"><Check className="text-purple-500 flex-shrink-0" size={16} /> システム利用（120日）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 本を１０冊まで作成可</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> AI利用（50回/日）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> AIモデル（最高性能）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版準備ガイド</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> Wordエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> EPUBエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版用キーワード提案</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版用カテゴリ提案</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版用の書籍紹介文作成</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> LINE招待（質問可）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> アフィリエイト機能</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> オプション割引</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> もくもく会</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> グループセッション参加</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 個別セッション</li>
                </ul>

                <button
                  onClick={() => handlePlanSelect('business')}
                  className={`block w-full font-bold py-4 rounded-2xl shadow-lg transition text-center text-white ${
                    selectedLPPlan === 'business' ? '' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: selectedLPPlan === 'business' ? '#84cc16' : undefined, backgroundImage: selectedLPPlan === 'business' ? undefined : 'linear-gradient(to right, #8b5cf6, #6366f1)' }}
                >
                  {selectedLPPlan === 'business' ? '✓ 選択中' : 'プレミアムプランで始める'}
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-8">※ サポート品質維持のため、毎月5名様までの限定募集です</p>

          {/* メールアドレス入力 & 決済ボタン */}
          {selectedLPPlan && (
            <div id="checkout-form" className="max-w-md mx-auto mt-10">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-4" style={{ borderColor: '#ffedd5' }}>
                <h3 className="text-lg font-bold mb-1 text-center" style={{ color: '#5d4037' }}>
                  {LP_PLANS[selectedLPPlan].name}プラン
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  ¥{LP_PLANS[selectedLPPlan].price.toLocaleString()}（税込）/ {LP_PLANS[selectedLPPlan].period}
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-orange-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    決済完了の通知とアカウント情報をお送りします
                  </p>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white shadow-md hover:-translate-y-1 transform'
                  }`}
                  style={isProcessing ? undefined : { backgroundColor: '#f97316' }}
                >
                  {isProcessing ? '処理中...' : '決済に進む'}
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  お支払いはUnivaPayで安全に処理されます
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            せっかく書いた原稿、<br className="sm:hidden" />
            出版しませんか？
          </h2>
          <p className="text-xl opacity-90 mb-10">
            アップグレードすれば、すぐにWord出力して出版できます
          </p>

          <a
            href="#pricing"
            className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-orange-50 transition-all shadow-2xl"
          >
            <Crown size={22} />
            プランを選ぶ
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <Footer setPage={navigateTo} />
    </div>
  );
}
