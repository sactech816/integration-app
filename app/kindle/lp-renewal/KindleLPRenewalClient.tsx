'use client';

// 継続顧客向けLP - 月額プランのみ表示（料金プランセクション以下）

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Crown,
  Check,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import SubscriptionPlans from '@/components/kindle/SubscriptionPlans';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

export default function KindleLPRenewalClient() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [prices, setPrices] = useState<{ monthly: number; yearly: number } | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // 認証状態を取得
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }

      // 価格設定を取得
      try {
        const res = await fetch('/api/settings/kdl-prices');
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } catch (e) {
        console.error('Failed to fetch prices:', e);
      }
      
      // アフィリエイト紹介コードを取得（Cookieから）
      const refCode = getReferralCode();
      if (refCode) {
        setReferralCode(refCode);
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

  const faqData = [
    {
      question: 'AI生成した文章はそのまま出版しても大丈夫ですか？',
      answer: 'AI生成文はあくまで「たたき台」です。必ずご自身の経験や知見を加えて編集してください。Amazonのガイドラインでは、AI生成コンテンツを利用する場合、人間による編集と監修が求められています。Kindle出版メーカーは、その編集作業を効率化するツールとしてご活用ください。'
    },
    {
      question: 'Kindle出版の経験がなくても使えますか？',
      answer: 'はい、全く問題ありません。Kindle出版メーカーは初心者の方でも安心してご利用いただけるよう、KDPアカウント開設から出版までの全工程をステップバイステップでガイドします。わからないことがあれば、マニュアルやサポートをご活用ください。'
    },
    {
      question: '何冊まで本を作成できますか？',
      answer: 'すべてのプランで書籍作成数は無制限です。何冊でも作成・管理できます。'
    },
    {
      question: 'AIの執筆機能はどのくらい使えますか？',
      answer: 'プランによって1日あたりのAI利用回数が異なります。ライトプラン20回/日、スタンダード50回/日、プロ100回/日、ビジネス無制限です。執筆スピードに合わせてプランをお選びください。'
    },
    {
      question: 'どんなジャンルの本が書けますか？',
      answer: 'ビジネス書、自己啓発、ハウツー、専門書、エッセイなど、ほぼすべてのジャンルに対応しています。小説や詩集などの創作物には向いていません。'
    },
    {
      question: '解約はいつでもできますか？',
      answer: 'はい、いつでも解約可能です。解約後も契約期間内はサービスをご利用いただけます。解約手数料などは一切かかりません。'
    }
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

      {/* アフィリエイト追跡 */}
      <Suspense fallback={null}>
        <AffiliateTracker />
      </Suspense>

      {/* ヒーローセクション - シンプル */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-6">
            継続プランで<br className="sm:hidden" />
            さらに多くの本を出版しよう
          </h1>
          <p className="text-xl opacity-90 mb-8">
            月額プランなら、毎月コストを抑えながら<br className="hidden sm:block" />
            継続的にKindle出版をサポートします
          </p>
        </div>
      </section>

      {/* 料金プラン - 月額プランのみ */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Crown size={16} />
              料金プラン
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              あなたに合ったプランを選択
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              すべてのプランで書籍数無制限・KDP形式エクスポート対応
            </p>
          </div>

          {/* 月額プランのみ表示 */}
          <div>
            <SubscriptionPlans 
              userEmail={user?.email}
              customPrices={prices || undefined}
              referralCode={referralCode}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <HelpCircle size={16} />
              よくある質問
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`flex-shrink-0 text-slate-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            今すぐプランを選んで<br className="sm:hidden" />
            出版を再開しよう
          </h2>
          <p className="text-xl opacity-90 mb-8">
            継続プランで、あなたの知識を資産に変え続けましょう
          </p>
          <a
            href="#pricing"
            className="inline-block bg-white text-blue-900 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition shadow-xl"
          >
            プランを見る
          </a>
        </div>

        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20" />
      </section>

      <Footer setPage={navigateTo} />
    </div>
  );
}
