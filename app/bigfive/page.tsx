'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import BigFiveQuiz from '@/components/bigfive/BigFiveQuiz';
import BigFiveResultView from '@/components/bigfive/BigFiveResultView';
import { QUESTIONS_SIMPLE, QUESTIONS_FULL, QUESTIONS_DETAILED, calculateBigFive, ENNEAGRAM_QUESTIONS, calculateEnneagram } from '@/lib/bigfive';
import type { BigFiveResult, EnneagramResult } from '@/lib/bigfive';
import { supabase } from '@/lib/supabase';
import PremiumReportSection from '@/components/bigfive/PremiumReportSection';
import BigFiveGuideModal from '@/components/bigfive/BigFiveGuideModal';
import Footer from '@/components/shared/Footer';
import { Brain, Sparkles, Clock, FileText, Share2, ArrowRight, CheckCircle, Crown, Target, Download, ExternalLink, Mail, Loader2, X, UserPlus, HelpCircle, BookOpen } from 'lucide-react';
// メルマガリストID（Big Fiveサンプル申込者用）
const BIGFIVE_NEWSLETTER_LIST_ID = '2ee250e1-b763-4718-82b1-ef20ed86075a';

type Phase = 'landing' | 'quiz' | 'enneagram' | 'result';
type TestMode = 'simple' | 'full' | 'detailed';

// ブラウザセッションID（ファネル追跡用）
function getOrCreateSessionId(): string {
  const key = 'bigfive_session_id';
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

// ファネルイベント送信（fire-and-forget）
function trackFunnelEvent(eventType: string, extra?: { email?: string; metadata?: Record<string, any> }) {
  fetch('/api/bigfive/funnel-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      sessionId: getOrCreateSessionId(),
      email: extra?.email,
      metadata: extra?.metadata,
    }),
  }).catch(() => {});
}

export default function BigFivePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('landing');
  const [testMode, setTestMode] = useState<TestMode>('simple');
  const [result, setResult] = useState<BigFiveResult | null>(null);
  const [enneagramResult, setEnneagramResult] = useState<EnneagramResult | null>(null);
  const [bigFiveAnswers, setBigFiveAnswers] = useState<Record<number, number>>({});
  const [bigFiveDuration, setBigFiveDuration] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sampleModal, setSampleModal] = useState<{ code: string; name: string } | null>(null);
  const [sampleEmail, setSampleEmail] = useState('');
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [sampleDone, setSampleDone] = useState(false);
  const [unlockedSamples, setUnlockedSamples] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

  // localStorage から解放済みサンプルを復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bigfive_unlocked_samples');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setUnlockedSamples(new Set(parsed));
      }
    } catch { /* ignore */ }
  }, []);

  const handleSampleClick = (code: string, name: string) => {
    if (unlockedSamples.has(code)) {
      window.open(`/api/bigfive/sample-pdf?type=${code}`, '_blank');
      return;
    }
    setSampleModal({ code, name });
    setSampleEmail('');
    setSampleError(null);
    setSampleDone(false);
  };

  const handleSampleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleModal) return;
    setSampleError(null);
    setSampleSubmitting(true);

    try {
      // メルマガリストに直接登録
      const res = await fetch(`/api/newsletter-maker/subscribe/${BIGFIVE_NEWSLETTER_LIST_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sampleEmail,
          source: 'bigfive_sample',
          metadata: { sample_type: sampleModal.code },
        }),
      });

      if (res.ok) {
        // ファネルイベント記録
        trackFunnelEvent('sample_request', {
          email: sampleEmail,
          metadata: { sample_type: sampleModal.code, sample_name: sampleModal.name },
        });
        setSampleDone(true);
        // 解放済みに追加 & localStorage に保存
        const next = new Set(unlockedSamples);
        next.add(sampleModal.code);
        setUnlockedSamples(next);
        localStorage.setItem('bigfive_unlocked_samples', JSON.stringify([...next]));
        // PDFを自動で開く
        window.open(`/api/bigfive/sample-pdf?type=${sampleModal.code}`, '_blank');
      } else {
        const data = await res.json().catch(() => ({}));
        setSampleError(data.error || '登録に失敗しました');
      }
    } catch {
      setSampleError('エラーが発生しました');
    } finally {
      setSampleSubmitting(false);
    }
  };

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const handleStartQuiz = (mode: TestMode) => {
    setTestMode(mode);
    setPhase('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackFunnelEvent('quiz_start', { metadata: { test_mode: mode } });
  };

  // エニアグラム完了ハンドラ
  const handleEnneagramComplete = async (enneaAnswers: Record<number, number>, enneaDuration: number) => {
    const enneaResult = calculateEnneagram(enneaAnswers);
    setEnneagramResult(enneaResult);

    // Big Five結果を計算（保存済みの回答を使用）
    const questions = QUESTIONS_DETAILED;
    const calcResult = calculateBigFive(bigFiveAnswers, questions, 'detailed');
    setResult(calcResult);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const totalDuration = bigFiveDuration + enneaDuration;

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
            testType: 'detailed',
            traits: calcResult.traits,
            mbtiCode: calcResult.mbtiType.code,
            mbtiDimensions: calcResult.mbtiType.dimensions,
            discType: calcResult.discType,
            enneagramResult: enneaResult,
            facetScores,
            answers: { ...bigFiveAnswers, ...enneaAnswers },
            durationSeconds: totalDuration,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setResultId(data.id);
          trackFunnelEvent('quiz_complete', {
            metadata: {
              test_mode: 'detailed',
              mbti_code: calcResult.mbtiType.code,
              disc_type: calcResult.discType.primary,
              enneagram_type: enneaResult.primaryType,
              result_id: data.id,
              duration_seconds: totalDuration,
            },
          });
        }
      } catch (e) {
        console.error('Save error:', e);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleQuizComplete = async (answers: Record<number, number>, durationSeconds: number) => {
    const questions = testMode === 'simple' ? QUESTIONS_SIMPLE : testMode === 'full' ? QUESTIONS_FULL : QUESTIONS_DETAILED;
    const calcResult = calculateBigFive(answers, questions, testMode);

    // 詳細モードの場合、エニアグラムフェーズへ遷移
    if (testMode === 'detailed') {
      setBigFiveAnswers(answers);
      setBigFiveDuration(durationSeconds);
      setResult(calcResult);
      setPhase('enneagram');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      trackFunnelEvent('quiz_bigfive_complete', { metadata: { test_mode: 'detailed' } });
      return;
    }

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
            discType: calcResult.discType,
            facetScores,
            answers,
            durationSeconds,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setResultId(data.id);
          trackFunnelEvent('quiz_complete', {
            metadata: {
              test_mode: testMode,
              mbti_code: calcResult.mbtiType.code,
              result_id: data.id,
              duration_seconds: durationSeconds,
            },
          });
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

          {/* ガイドモーダル（初回自動表示） */}
          {phase === 'landing' && (
            <BigFiveGuideModal
              forceOpen={showGuide}
              onClose={() => setShowGuide(false)}
            />
          )}

          {/* === ランディング === */}
          {phase === 'landing' && (
            <div className="space-y-8">
              {/* ヒーロー */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">科学的性格診断</span>
                  </div>
                  <button
                    onClick={() => setShowGuide(true)}
                    className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                    title="使い方ガイド"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                  </button>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Big Five 性格診断
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                  世界中の心理学研究で使われている「ビッグファイブ理論」に基づく性格診断です。
                  5つの性格特性と30のファセット、さらに16パーソナリティタイプも分かります。
                </p>
              </div>

              {/* テストモード選択 */}
              <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* 簡易版 */}
                <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">お試し</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">簡易診断（10問）</h3>
                  <p className="text-sm text-gray-600 mb-4">約1〜2分で完了。性格の傾向をサッと確認。</p>
                  <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />5特性スコア</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />16パーソナリティタイプ</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />DISC行動スタイル</li>
                    <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />AIプレミアムレポート（¥500）</li>
                  </ul>
                  <button
                    onClick={() => handleStartQuiz('simple')}
                    className="w-full py-3 mt-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    簡易診断を始める
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 本格版 */}
                <div className="bg-white border border-indigo-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all ring-2 ring-indigo-100 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">おすすめ</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">本格診断（50問）</h3>
                  <p className="text-sm text-gray-600 mb-4">約5〜10分。30ファセットの詳細分析付き。</p>
                  <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />5特性 + 30ファセット分析</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />16パーソナリティタイプ</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />DISC行動スタイル</li>
                    <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />AIプレミアムレポート（¥1,000）</li>
                  </ul>
                  <button
                    onClick={() => handleStartQuiz('full')}
                    className="w-full py-3 mt-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    本格診断を始める
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 詳細版 */}
                <div className="bg-white border border-amber-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all ring-2 ring-amber-100 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">最高精度</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">詳細診断（145問）</h3>
                  <p className="text-sm text-gray-600 mb-4">約15〜20分。全診断を網羅した完全版。</p>
                  <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />高精度30ファセット分析</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />16パーソナリティタイプ</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />DISC行動スタイル</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />エニアグラム9タイプ</li>
                    <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />AIプレミアムレポート（¥2,000）</li>
                  </ul>
                  <button
                    onClick={() => handleStartQuiz('detailed')}
                    className="w-full py-3 mt-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    詳細診断を始める
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
                  診断完了後に <span className="font-bold text-gray-900">¥500〜¥2,000</span> で購入可能（診断コースにより異なります）
                </p>
                <div className="text-center mt-4">
                  <Link href="/bigfive/sample-reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    <FileText className="w-4 h-4" />
                    レポートのサンプルを見る →
                  </Link>
                </div>
              </div>

              {/* サンプルレポート */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-3">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-700">サンプルレポート</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    診断結果レポートのサンプルを見る
                  </h2>
                  <p className="text-sm text-gray-500">
                    代表的な4タイプの診断レポートを無料でご覧いただけます
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { code: 'INTJ', name: '建築家', color: 'from-blue-500 to-indigo-600', desc: '戦略的な思考者' },
                    { code: 'ENFP', name: '広報運動家', color: 'from-pink-500 to-rose-600', desc: '情熱的な自由人' },
                    { code: 'ISTJ', name: '管理者', color: 'from-emerald-500 to-teal-600', desc: '実直な実務家' },
                    { code: 'INFJ', name: '提唱者', color: 'from-purple-500 to-violet-600', desc: '静かな影響者' },
                  ].map((t) => (
                    <button
                      key={t.code}
                      onClick={() => handleSampleClick(t.code, t.name)}
                      className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all text-center cursor-pointer"
                    >
                      <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-2`}>
                        <span className="text-white font-bold text-xs">{t.code}</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {unlockedSamples.has(t.code) ? (
                          <><ExternalLink className="w-3 h-3" />レポートを見る</>
                        ) : (
                          <><Download className="w-3 h-3" />無料で見る</>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
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
                <div className="text-center mt-4">
                  <a
                    href="/bigfive/about"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    診断手法について詳しく見る
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* === クイズ === */}
          {phase === 'quiz' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                  {testMode === 'simple' ? '簡易診断（10問）' : testMode === 'full' ? '本格診断（50問）' : '詳細診断（100問 + エニアグラム45問）'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  それぞれの文が、どの程度あなたに当てはまるかお答えください
                </p>
                {testMode === 'detailed' && (
                  <p className="text-xs text-indigo-500 mt-2">ステップ 1/2: Big Five 性格特性（100問）</p>
                )}
              </div>
              <BigFiveQuiz
                key={`quiz-${testMode}`}
                questions={testMode === 'simple' ? QUESTIONS_SIMPLE : testMode === 'full' ? QUESTIONS_FULL : QUESTIONS_DETAILED}
                onComplete={handleQuizComplete}
                milestones={
                  testMode === 'full' ? [
                    { at: 25, title: '折り返し地点！', message: '半分完了しました。この調子で残り25問も回答していきましょう。', icon: 'halfway' as const, buttonText: '後半も頑張る' },
                  ] : testMode === 'detailed' ? [
                    { at: 50, title: '50問完了！', message: '半分完了しました。残り50問で性格分析の精度がさらに高まります。', icon: 'halfway' as const, buttonText: '引き続き回答する' },
                  ] : []
                }
                completionModal={
                  testMode === 'simple' ? {
                    title: 'お疲れ様でした！',
                    message: '10問すべての回答が完了しました。あなたの性格タイプを分析しています...',
                    buttonText: '診断結果を見る',
                  } : testMode === 'full' ? {
                    title: '50問完了！お疲れ様でした！',
                    message: 'すべての質問に回答しました。30ファセットを含む詳細な性格分析をお楽しみください。',
                    buttonText: '診断結果を見る',
                  } : {
                    title: 'Big Five 100問完了！',
                    message: '性格特性の分析が完了しました。続いてエニアグラム診断（45問）に進みます。',
                    buttonText: 'エニアグラム診断へ',
                  }
                }
              />
            </div>
          )}

          {/* === エニアグラム（詳細モードのみ） === */}
          {phase === 'enneagram' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">エニアグラム診断（45問）</h2>
                <p className="text-sm text-gray-500 mt-1">
                  あなたの深層的な動機と行動パターンを分析します
                </p>
                <p className="text-xs text-indigo-500 mt-2">ステップ 2/2: エニアグラム性格タイプ</p>
              </div>
              <BigFiveQuiz
                key="quiz-enneagram"
                questions={ENNEAGRAM_QUESTIONS.map(q => ({
                  id: q.id,
                  text: q.text,
                  trait: 'openness' as const,
                  facet: '',
                  isReverse: false,
                }))}
                onComplete={handleEnneagramComplete}
                completionModal={{
                  title: '全145問完了！お疲れ様でした！',
                  message: 'Big Five + エニアグラムの総合分析が完了しました。あなたの多角的な性格プロファイルをご覧ください。',
                  buttonText: '診断結果を見る',
                }}
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

              <BigFiveResultView result={result} enneagramResult={enneagramResult ?? undefined} showFacets={testMode !== 'simple'} />

              {/* プレミアムレポート */}
              {user && resultId && (
                <PremiumReportSection
                  resultId={resultId}
                  isPurchased={false}
                  testType={testMode}
                />
              )}
              {!user && (
                <div className="mt-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl shadow-md p-6 sm:p-8">
                  <div className="text-center">
                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">AIプレミアムレポート</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      15ページ以上の詳細な性格分析レポートをAIが生成します
                    </p>
                    <p className="text-xs text-gray-500 mb-5">
                      キャリア適性・人間関係・自己成長のガイダンス付き
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                      {[
                        { icon: FileText, title: '専門レポート', color: 'text-blue-600', bg: 'bg-blue-100' },
                        { icon: Brain, title: 'パーソナリティマップ', color: 'text-purple-600', bg: 'bg-purple-100' },
                        { icon: Target, title: '実用ガイダンス', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                        { icon: Sparkles, title: 'AIメンター', color: 'text-amber-600', bg: 'bg-amber-100' },
                      ].map((f) => (
                        <div key={f.title} className="bg-white/80 rounded-lg p-2 text-center">
                          <f.icon className={`w-4 h-4 ${f.color} mx-auto mb-1`} />
                          <p className="text-xs font-medium text-gray-700">{f.title}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                    >
                      <UserPlus className="w-5 h-5" />
                      ログインして購入する
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      {testMode === 'simple' ? '¥500' : testMode === 'full' ? '¥1,000' : '¥2,000'}（税込）・Stripeによる安全な決済
                    </p>
                  </div>
                </div>
              )}

              {/* SNSシェア & アクションボタン */}
              {resultId && (
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-md p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">診断結果をシェア</h3>
                    <p className="text-xs text-gray-500">友達にも診断を勧めてみましょう</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {/* X (Twitter) */}
                    <button
                      onClick={async () => {
                        await handleShare();
                        const url = `${window.location.origin}/bigfive/result/${resultId}`;
                        const mbtiCode = result?.mbtiType?.code || '';
                        const text = `Big Five性格診断の結果は「${mbtiCode}」タイプでした！\n科学的な性格分析を無料で試せます。\n\n`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all text-sm shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      ポスト
                    </button>
                    {/* LINE */}
                    <button
                      onClick={async () => {
                        await handleShare();
                        const url = `${window.location.origin}/bigfive/result/${resultId}`;
                        const mbtiCode = result?.mbtiType?.code || '';
                        const text = `Big Five性格診断の結果は「${mbtiCode}」タイプでした！科学的な性格分析を無料で試せます👉`;
                        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#06C755] hover:bg-[#05b34d] text-white font-medium rounded-xl transition-all text-sm shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                      LINE
                    </button>
                    {/* Facebook */}
                    <button
                      onClick={async () => {
                        await handleShare();
                        const url = `${window.location.origin}/bigfive/result/${resultId}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-xl transition-all text-sm shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </button>
                    {/* URLコピー */}
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all text-sm shadow-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      {copied ? 'コピー済み!' : 'URLコピー'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {!user && (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl border border-blue-200 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    ログインして結果を保存
                  </button>
                )}

                <button
                  onClick={() => { setPhase('landing'); setResult(null); setResultId(null); setEnneagramResult(null); setBigFiveAnswers({}); setBigFiveDuration(0); }}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
                >
                  もう一度診断する
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* メールアドレス入力モーダル */}
      {sampleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => !sampleSubmitting && setSampleModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSampleModal(null)}
              disabled={sampleSubmitting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!sampleDone ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-sm">{sampleModal.code}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {sampleModal.name}タイプのサンプルレポート
                  </h3>
                  <p className="text-sm text-gray-500">
                    メールアドレスを登録して無料でご覧いただけます
                  </p>
                </div>

                <form onSubmit={handleSampleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={sampleEmail}
                        onChange={(e) => setSampleEmail(e.target.value)}
                        required
                        placeholder="example@email.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {sampleError && (
                    <p className="text-red-500 text-sm text-center">{sampleError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={sampleSubmitting || !sampleEmail}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {sampleSubmitting ? (
                      <><Loader2 className="animate-spin" size={18} />送信中...</>
                    ) : (
                      <><Download className="w-4 h-4" />無料でレポートを見る</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    登録いただいたメールアドレスに、性格診断に関する情報をお届けすることがあります
                  </p>
                </form>
              </>
            ) : (
              /* 登録完了 → 成功画面 + 集客メーカー登録CTA */
              <div className="text-center space-y-5">
                <div>
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">レポートを表示しました！</h3>
                  <p className="text-sm text-gray-500">
                    新しいタブでサンプルレポートが開きます。<br />
                    ポップアップがブロックされた場合は下のボタンからどうぞ。
                  </p>
                </div>

                <a
                  href={`/api/bigfive/sample-pdf?type=${sampleModal.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  レポートを開く
                </a>

                <div className="border-t border-gray-100 pt-5">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-gray-900">集客メーカーに無料登録</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      実際に診断を受けて、あなた専用のレポートを作成しませんか？<br />
                      無料で診断・結果保存ができます。
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSampleModal(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md text-sm transition-all"
                      >
                        診断を受ける
                      </button>
                      <button
                        onClick={() => setSampleModal(null)}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg text-sm hover:bg-gray-50 transition-all"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
