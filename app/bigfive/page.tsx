'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import BigFiveQuiz from '@/components/bigfive/BigFiveQuiz';
import BigFiveResultView from '@/components/bigfive/BigFiveResultView';
import { QUESTIONS_SIMPLE, QUESTIONS_FULL, calculateBigFive } from '@/lib/bigfive';
import type { BigFiveResult } from '@/lib/bigfive';
import { supabase } from '@/lib/supabase';
import PremiumReportSection from '@/components/bigfive/PremiumReportSection';
import Footer from '@/components/shared/Footer';
import { Brain, Sparkles, Clock, FileText, Share2, ArrowRight, CheckCircle, Crown, Target } from 'lucide-react';

type Phase = 'landing' | 'quiz' | 'result';
type TestMode = 'simple' | 'full';

export default function BigFivePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('landing');
  const [testMode, setTestMode] = useState<TestMode>('simple');
  const [result, setResult] = useState<BigFiveResult | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const handleStartQuiz = (mode: TestMode) => {
    setTestMode(mode);
    setPhase('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizComplete = async (answers: Record<number, number>, durationSeconds: number) => {
    const questions = testMode === 'simple' ? QUESTIONS_SIMPLE : QUESTIONS_FULL;
    const calcResult = calculateBigFive(answers, questions, testMode);
    setResult(calcResult);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // ログイン済みなら自動保存
    if (user) {
      setSaving(true);
      try {
        const facetScores: Record<string, Record<string, number>> = {};
        for (const [trait, traitResult] of Object.entries(calcResult.traits)) {
          facetScores[trait] = {};
          for (const facet of traitResult.facets) {
            facetScores[trait][facet.name] = facet.percentage;
          }
        }

        const res = await fetch('/api/bigfive/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testType: testMode,
            traits: calcResult.traits,
            mbtiCode: calcResult.mbtiType.code,
            mbtiDimensions: calcResult.mbtiType.dimensions,
            facetScores,
            answers,
            durationSeconds,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setResultId(data.id);
        }
      } catch (e) {
        console.error('Save error:', e);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleShare = async () => {
    if (!resultId) return;

    // 公開設定にする
    await fetch('/api/bigfive/result', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resultId, is_public: true }),
    });

    const url = `${window.location.origin}/bigfive/result/${resultId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

          {/* === ランディング === */}
          {phase === 'landing' && (
            <div className="space-y-8">
              {/* ヒーロー */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">科学的性格診断</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Big Five 性格診断
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                  世界中の心理学研究で使われている「ビッグファイブ理論」に基づく性格診断です。
                  5つの性格特性と30のファセット、さらにMBTI風16タイプも分かります。
                </p>
              </div>

              {/* テストモード選択 */}
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* 簡易版 */}
                <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">無料</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">簡易診断（10問）</h3>
                  <p className="text-sm text-gray-600 mb-4">約1〜2分で完了。5つの性格特性の傾向がわかります。</p>
                  <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />5特性スコア</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />MBTI風タイプ判定</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />基本的な性格解説</li>
                  </ul>
                  <button
                    onClick={() => handleStartQuiz('simple')}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    簡易診断を始める
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 本格版 */}
                <div className="bg-white border border-indigo-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all ring-2 ring-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">おすすめ</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">本格診断（50問）</h3>
                  <p className="text-sm text-gray-600 mb-4">約5〜10分。30ファセットの詳細分析付き。</p>
                  <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />5特性 + 30ファセット分析</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />MBTI風タイプ判定</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />詳細な適職・人間関係アドバイス</li>
                    <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" />AIプレミアムレポート（¥500）</li>
                  </ul>
                  <button
                    onClick={() => handleStartQuiz('full')}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    本格診断を始める
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* プレミアムレポート紹介 */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl shadow-md p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full mb-3">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">プレミアムレポート</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    診断後、AI があなた専用のレポートを生成
                  </h2>
                  <p className="text-sm text-gray-600">
                    15ページ以上の詳細分析とAIメンターで、自分をもっと深く知る
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: FileText, title: '専門レポート', desc: '15ページ以上の詳細分析', color: 'text-blue-600', bg: 'bg-blue-100' },
                    { icon: Brain, title: 'パーソナリティマップ', desc: '5特性+30ファセット可視化', color: 'text-purple-600', bg: 'bg-purple-100' },
                    { icon: Target, title: '実用ガイダンス', desc: 'キャリア・人間関係の指針', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { icon: Sparkles, title: 'AIアシスタント', desc: 'あなた専用メンター', color: 'text-amber-600', bg: 'bg-amber-100' },
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
                <p className="text-center text-sm text-gray-500">
                  診断完了後に <span className="font-bold text-gray-900">¥500</span> で購入可能
                </p>
              </div>

              {/* 特徴セクション */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Big Five とは？</h2>
                <div className="grid sm:grid-cols-5 gap-4">
                  {[
                    { trait: '開放性', desc: '新しい経験や知的好奇心', emoji: '🎨' },
                    { trait: '誠実性', desc: '計画性や責任感', emoji: '🎯' },
                    { trait: '外向性', desc: '社交性やエネルギー', emoji: '🌟' },
                    { trait: '協調性', desc: '思いやりや協力', emoji: '🤝' },
                    { trait: '情緒安定性', desc: 'ストレス耐性や冷静さ', emoji: '🧘' },
                  ].map(({ trait, desc, emoji }) => (
                    <div key={trait} className="text-center p-3">
                      <span className="text-2xl">{emoji}</span>
                      <h3 className="font-semibold text-gray-900 text-sm mt-2">{trait}</h3>
                      <p className="text-xs text-gray-500 mt-1">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === クイズ === */}
          {phase === 'quiz' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                  {testMode === 'simple' ? '簡易診断（10問）' : '本格診断（50問）'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  それぞれの文が、どの程度あなたに当てはまるかお答えください
                </p>
              </div>
              <BigFiveQuiz
                questions={testMode === 'simple' ? QUESTIONS_SIMPLE : QUESTIONS_FULL}
                onComplete={handleQuizComplete}
              />
            </div>
          )}

          {/* === 結果 === */}
          {phase === 'result' && result && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたの診断結果</h2>
                {saving && <p className="text-sm text-gray-500">保存中...</p>}
              </div>

              <BigFiveResultView result={result} showFacets={testMode === 'full'} />

              {/* プレミアムレポート */}
              {user && resultId && (
                <PremiumReportSection
                  resultId={resultId}
                  isPurchased={false}
                />
              )}
              {!user && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                  <p className="text-sm text-blue-700 font-medium">
                    ログインすると、AI プレミアムレポートを購入できます
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                {resultId && (
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-lg text-gray-700 font-medium transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'コピーしました！' : '結果を共有'}
                  </button>
                )}

                {!user && (
                  <p className="text-sm text-gray-500 text-center w-full mt-2">
                    ログインすると結果が保存され、PDF レポートも購入できます
                  </p>
                )}

                <button
                  onClick={() => { setPhase('landing'); setResult(null); setResultId(null); }}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
                >
                  もう一度診断する
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
