'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';
import { calculateSubsidyMatches } from '@/lib/subsidy/scoring';
import type { BusinessInfo, SubsidyMaster, SubsidyMatch } from '@/lib/subsidy/types';
import { FileCheck, Sparkles, Shield, Clock, Crown, FileText, TrendingUp, Award } from 'lucide-react';
import SubsidyDiagnosisForm from '@/components/subsidy/SubsidyDiagnosisForm';
import SubsidyResultCards from '@/components/subsidy/SubsidyResultCards';
import SubsidyPremiumReport from '@/components/subsidy/SubsidyPremiumReport';
import MakersPromoBanner from '@/components/shared/MakersPromoBanner';

function SubsidyContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [subsidyMaster, setSubsidyMaster] = useState<SubsidyMaster[]>([]);
  const [matches, setMatches] = useState<SubsidyMatch[] | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [selectedSubsidy, setSelectedSubsidy] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    // マスタデータ取得
    fetch('/api/subsidy/master')
      .then((res) => res.json())
      .then((data) => setSubsidyMaster(data.subsidies || []))
      .catch(console.error);
  }, []);

  const handleDiagnose = async (businessInfo: BusinessInfo) => {
    setLoading(true);
    try {
      // 1. スコアリング計算
      const scored = calculateSubsidyMatches(businessInfo, subsidyMaster);

      // 2. API経由で保存
      const res = await fetch('/api/subsidy/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo,
          matchedSubsidies: scored,
          resultSnapshot: { businessInfo, scored, calculatedAt: new Date().toISOString() },
        }),
      });
      const saveData = await res.json();

      // 3. resultIdとmatchesを同時にセット（ボタンが正しく表示されるように）
      if (saveData.id) {
        setResultId(saveData.id);
      }
      setMatches(scored);
    } catch (e) {
      console.error('診断エラー:', e);
      alert('診断中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (subsidyKey: string) => {
    setSelectedSubsidy(subsidyKey);
    // resultIdがある場合は結果ページへ遷移
    if (resultId) {
      router.push(`/subsidy/result/${resultId}?subsidy=${subsidyKey}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white">
      <Header
        user={user}
        onLogout={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
        setShowAuth={setShowAuth}
      />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-teal-700 shadow-sm">
            <FileCheck size={16} className="text-teal-500" />
            無料で診断できます
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">補助金適正診断</h1>
          <p className="text-gray-600">あなたの事業に最適な補助金を、AIがマッチングします</p>
        </div>

        {/* 特徴バッジ */}
        {!matches && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: '無料で診断', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: Clock, label: '約2分で完了', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Award, label: '主要補助金対応', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((b) => (
              <div key={b.label} className={`${b.bg} rounded-xl p-3 text-center`}>
                <b.icon size={20} className={`${b.color} mx-auto mb-1`} />
                <p className={`text-xs font-semibold ${b.color}`}>{b.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* プレミアム紹介（結果表示前） */}
        {!matches && (
          <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border border-teal-200 rounded-2xl shadow-md p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full mb-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">AI申請書作成</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                診断後、AIが補助金申請書のドラフトを自動生成
              </h2>
              <p className="text-sm text-gray-600">
                事業情報をもとに、申請書の主要セクション（全5章・約8〜12ページ相当）をAIが作成します
              </p>
            </div>

            {/* 料金 */}
            <div className="bg-white/90 border border-teal-200 rounded-xl p-4 mb-5 text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold text-teal-700">¥1,500</span>
                <span className="text-xs text-gray-500">（税込）/ 1補助金あたり</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Word（.docx）でダウンロード → お手元で自由に編集可能</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { icon: FileText, title: '事業計画', desc: '現状分析と成長戦略', color: 'text-teal-600', bg: 'bg-teal-100' },
                { icon: Sparkles, title: '事業内容', desc: '補助事業の具体的計画', color: 'text-cyan-600', bg: 'bg-cyan-100' },
                { icon: TrendingUp, title: '事業効果', desc: '定量的KPI・効果見込', color: 'text-blue-600', bg: 'bg-blue-100' },
                { icon: Award, title: '経費・計画', desc: '経費明細・スケジュール', color: 'text-indigo-600', bg: 'bg-indigo-100' },
              ].map((f) => (
                <div key={f.title} className="bg-white/80 border border-white rounded-xl p-3 text-center">
                  <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400">
              ※ まずは無料診断を行い、結果から申請書AI作成をご利用いただけます
            </p>
          </div>
        )}

        {/* 診断フォーム */}
        {!matches && (
          <SubsidyDiagnosisForm onSubmit={handleDiagnose} loading={loading} />
        )}

        {/* 診断結果 */}
        {matches && (
          <>
            <SubsidyResultCards
              matches={matches}
              resultId={resultId}
              onPurchase={handlePurchase}
            />

            {/* プレミアムレポートセクション */}
            <SubsidyPremiumReport
              resultId={resultId || ''}
              selectedSubsidy={selectedSubsidy}
              reportPurchased={false}
              reportContent={null}
              user={user}
              onSetShowAuth={setShowAuth}
            />

            {/* やり直しボタン */}
            <div className="text-center">
              <button
                onClick={() => {
                  setMatches(null);
                  setResultId(null);
                  setSelectedSubsidy(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                もう一度診断する
              </button>
            </div>
          </>
        )}

        <MakersPromoBanner />
      </main>

      <Footer />
    </div>
  );
}

export default function SubsidyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white" />}>
      <SubsidyContent />
    </Suspense>
  );
}
