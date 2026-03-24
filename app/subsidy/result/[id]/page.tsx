'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';
import type { SubsidyResult } from '@/lib/subsidy/types';
import { FileCheck, Loader2, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SubsidyResultCards from '@/components/subsidy/SubsidyResultCards';
import SubsidyPremiumReport from '@/components/subsidy/SubsidyPremiumReport';
import MakersPromoBanner from '@/components/shared/MakersPromoBanner';

function SubsidyResultContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const resultId = params.id as string;
  const subsidyParam = searchParams.get('subsidy');
  const paymentSuccess = searchParams.get('payment') === 'success';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SubsidyResult | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedSubsidy, setSelectedSubsidy] = useState<string | null>(subsidyParam);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    fetchResult();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subsidy_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error || !data) {
        console.error('Result fetch error:', error);
        return;
      }

      setResult(data as SubsidyResult);
      if (data.selected_subsidy) {
        setSelectedSubsidy(data.selected_subsidy);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/subsidy/result/${resultId}`;
    const text = '補助金適正診断の結果をチェック！';

    if (navigator.share) {
      navigator.share({ title: '補助金適正診断', text, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      alert('URLをクリップボードにコピーしました！');
    }
  };

  const handlePurchase = (subsidyKey: string) => {
    setSelectedSubsidy(subsidyKey);
    // SubsidyPremiumReportのhandlePurchaseが処理
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white">
        <Header user={user} onLogout={async () => { await supabase.auth.signOut(); setUser(null); }} setShowAuth={setShowAuth} />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">診断結果が見つかりません</h1>
          <Link href="/subsidy" className="text-teal-600 hover:text-teal-800 underline">
            診断ページへ戻る
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white">
      <Header
        user={user}
        onLogout={async () => { await supabase.auth.signOut(); setUser(null); }}
        setShowAuth={setShowAuth}
      />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between">
          <Link href="/subsidy" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={14} />
            新しい診断
          </Link>
          <button onClick={handleShare} className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 transition-colors">
            <Share2 size={14} />
            結果を共有
          </button>
        </div>

        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-teal-700 shadow-sm">
            <FileCheck size={16} className="text-teal-500" />
            診断結果
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">あなたの補助金適正診断結果</h1>
        </div>

        {/* 支払い成功メッセージ */}
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-green-700">ご購入ありがとうございます！下のボタンからAI申請書を生成できます。</p>
          </div>
        )}

        {/* 結果カード */}
        <SubsidyResultCards
          matches={result.matched_subsidies}
          resultId={resultId}
          onPurchase={handlePurchase}
        />

        {/* プレミアムレポート */}
        <SubsidyPremiumReport
          resultId={resultId}
          selectedSubsidy={selectedSubsidy}
          reportPurchased={result.report_purchased}
          reportContent={result.report_content}
          user={user}
          onSetShowAuth={setShowAuth}
        />

        <MakersPromoBanner />
      </main>

      <Footer />
    </div>
  );
}

export default function SubsidyResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white" />}>
      <SubsidyResultContent />
    </Suspense>
  );
}
