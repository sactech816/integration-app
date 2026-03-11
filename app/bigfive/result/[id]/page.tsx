'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/shared/Header';
import BigFiveResultView from '@/components/bigfive/BigFiveResultView';
import PremiumReportSection from '@/components/bigfive/PremiumReportSection';
import type { BigFiveResult, TraitResult } from '@/lib/bigfive';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/shared/Footer';
import { Loader2, AlertCircle } from 'lucide-react';

export default function BigFiveResultPage() {
  const params = useParams();
  const [result, setResult] = useState<BigFiveResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [reportHtml, setReportHtml] = useState<string | null>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/bigfive/result?id=${params.id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || '結果が見つかりません');
          return;
        }

        const { result: dbResult } = await res.json();

        // 所有者・購入状態チェック
        if (dbResult.user_id && user?.id && dbResult.user_id === user.id) {
          setIsOwner(true);
        }
        if (dbResult.pdf_purchased) {
          setIsPurchased(true);
        }
        if (dbResult.report_content) {
          setReportHtml(dbResult.report_content);
        }

        // DBデータからBigFiveResult型に変換
        const testType = dbResult.test_type as 'simple' | 'full';
        const facetScores = dbResult.facet_scores || {};

        const traits = {} as BigFiveResult['traits'];
        const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

        for (const key of traitKeys) {
          const percentage = dbResult[key] as number;
          const level = percentage <= 20 ? 'very_low' : percentage <= 40 ? 'low' : percentage <= 60 ? 'medium' : percentage <= 80 ? 'high' : 'very_high';

          const facets = facetScores[key]
            ? Object.entries(facetScores[key] as Record<string, number>).map(([name, pct]) => ({
              name,
              label: name,
              score: 0,
              maxScore: 0,
              percentage: pct,
            }))
            : [];

          traits[key] = { score: 0, maxScore: 0, percentage, level, facets } as TraitResult;
        }

        const mbtiType = {
          code: dbResult.mbti_code || '????',
          name: '',
          description: '',
          dimensions: dbResult.mbti_dimensions || {
            EI: { label: '', value: 'I', score: 0 },
            SN: { label: '', value: 'N', score: 0 },
            TF: { label: '', value: 'F', score: 0 },
            JP: { label: '', value: 'J', score: 0 },
          },
        };

        setResult({ traits, mbtiType, testType });
      } catch (e) {
        setError('結果の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchResult();
  }, [params.id, user]);

  return (
    <>
      <Header
        user={user}
        onLogout={async () => {
          await supabase?.auth.signOut();
          setUser(null);
        }}
        setShowAuth={setShowAuth}
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
              <p className="text-gray-500 mt-4">結果を読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Big Five 性格診断結果</h1>
              </div>
              <BigFiveResultView result={result} showFacets={result.testType === 'full'} />

              {/* プレミアムレポート（所有者のみ） */}
              {isOwner && (
                <PremiumReportSection
                  resultId={params.id as string}
                  isPurchased={isPurchased}
                  existingReportHtml={reportHtml}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
