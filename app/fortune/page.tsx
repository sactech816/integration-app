'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';
import { calculateFortune, getSexagenaryName, STAR_INFO } from '@/lib/fortune';
import type { FortuneResult } from '@/lib/fortune';
import type { NineStar } from '@/lib/fortune/nine-star';
import { Sparkles, Star, Calendar, Share2, TrendingUp, BookOpen, Crown, Loader2, ChevronRight } from 'lucide-react';
import { trackFortuneEvent } from '@/lib/fortune/tracking';

// DB解釈文の表示データ型
type DisplayData = {
  nineStarYear: { key: string; title: string; description: string; source: string };
  nineStarMonth: { key: string; title: string; description: string; source: string };
  lifePath: { key: string; title: string; description: string; source: string };
  dayStem: { key: string; title: string; description: string; source: string };
  raw: FortuneResult;
};

function FortuneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [year, setYear] = useState<number>(
    Number(searchParams.get('year')) || new Date().getFullYear() - 30
  );
  const [month, setMonth] = useState<number>(
    Number(searchParams.get('month')) || 1
  );
  const [day, setDay] = useState<number>(
    Number(searchParams.get('day')) || 1
  );

  const [loading, setLoading] = useState(false);
  const [displayResult, setDisplayResult] = useState<DisplayData | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    trackFortuneEvent('page_view');
  }, []);

  // URLパラメータがある場合は自動診断
  useEffect(() => {
    if (searchParams.get('year') && searchParams.get('month') && searchParams.get('day')) {
      handleDiagnose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDiagnose = async () => {
    setLoading(true);
    trackFortuneEvent('quiz_start', { year, month, day });

    // URL更新
    router.push(`/fortune?year=${year}&month=${month}&day=${day}`, { scroll: false });

    try {
      // 1. ローカルで計算
      const result = calculateFortune(year, month, day);

      // 2. DBから表示用テキストを取得
      const { data: contentData } = await supabase
        .from('fortune_contents')
        .select('result_key, title, content_md, type_slug')
        .in('result_key', [
          result.nineStar.year,
          result.nineStar.month,
          result.numerology.lifePath,
          result.fourPillars.heavenlyStem,
        ]);

      const getContent = (key: string) => {
        const content = contentData?.find(c => c.result_key === key);
        const sourceMap: Record<string, string> = {
          'nine_star': '高島易断',
          'numerology': '西洋数秘術の古典解釈',
          'four_pillars': '淵海子平',
        };
        let desc = content?.content_md || '';
        desc = desc.replace(/^##\s+/gm, '').replace(/\*\*出典\*\*:.*$/m, '').trim();
        return {
          title: content?.title || key,
          description: desc,
          source: sourceMap[content?.type_slug as string] || '',
        };
      };

      // 3. API経由で保存
      const res = await fetch('/api/fortune/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthYear: year,
          birthMonth: month,
          birthDay: day,
          resultSnapshot: result,
        }),
      });
      const saveData = await res.json();
      if (saveData.id) {
        setResultId(saveData.id);
        trackFortuneEvent('quiz_complete', { resultId: saveData.id, year, month, day });
      }

      // 4. 表示用データセット
      setDisplayResult({
        nineStarYear: { key: result.nineStar.year, ...getContent(result.nineStar.year) },
        nineStarMonth: { key: result.nineStar.month, ...getContent(result.nineStar.month) },
        lifePath: { key: result.numerology.lifePath, ...getContent(result.numerology.lifePath) },
        dayStem: { key: result.fourPillars.heavenlyStem, ...getContent(result.fourPillars.heavenlyStem) },
        raw: result,
      });
    } catch (e) {
      console.error('診断エラー:', e);
      alert('診断中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = resultId
      ? `${window.location.origin}/fortune/result/${resultId}`
      : `${window.location.origin}/fortune?year=${year}&month=${month}&day=${day}`;
    const text = `生年月日占いで鑑定しました！\n${year}年${month}月${day}日生まれ`;

    if (navigator.share) {
      navigator.share({ title: '生年月日占い', text, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      alert('URLをクリップボードにコピーしました！');
    }
  };

  // 九星キーからラッキーカラー取得
  const getLuckyColors = (key: string) => {
    const info = STAR_INFO[key as NineStar];
    return info?.luckyColor || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
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
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-700 shadow-sm">
            <Sparkles size={16} className="text-yellow-500" />
            古典占術による本格鑑定
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">運勢鑑定システム</h1>
          <p className="text-gray-600">生年月日から、あなたの本質を読み解きます</p>
        </div>

        {/* 入力エリア */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-900">
              <Calendar className="text-indigo-600" size={20} />
              生年月日を入力
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">年（西暦）</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-center text-lg font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  min={1900}
                  max={2100}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">月</label>
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-center text-lg font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  min={1}
                  max={12}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">日</label>
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-center text-lg font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  min={1}
                  max={31}
                />
              </div>
            </div>

            <button
              onClick={handleDiagnose}
              className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  鑑定中...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  鑑定結果を見る
                </>
              )}
            </button>
          </div>
        </div>

        {/* 結果表示 */}
        {displayResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 結果ヘッダー */}
            <div className="text-center py-4 space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {year}年{month}月{day}日生まれ の鑑定結果
              </h2>
              <p className="text-gray-600">3つの古典占術から、あなたの本質を読み解きます</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all"
                >
                  <Share2 size={16} />
                  シェア
                </button>
              </div>
            </div>

            {/* 九星気学カード */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden border-l-4 border-l-blue-500">
              <div className="bg-blue-50/50 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Star className="text-blue-600" size={20} />
                  九星気学
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">本命星</span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-4xl font-bold text-blue-900">{displayResult.nineStarYear.title}</p>

                {/* ラッキーカラー */}
                {getLuckyColors(displayResult.nineStarYear.key).length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="font-medium">ラッキーカラー:</span>
                    {getLuckyColors(displayResult.nineStarYear.key).join('・')}
                  </div>
                )}

                {/* 月命星 */}
                {displayResult.nineStarMonth.title && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      月命星: {displayResult.nineStarMonth.title}
                    </p>
                    {displayResult.nineStarMonth.description && (
                      <p className="text-xs text-blue-700 leading-relaxed">{displayResult.nineStarMonth.description}</p>
                    )}
                  </div>
                )}

                {/* 同会・傾斜・最大吉方 */}
                {(displayResult.raw.nineStar.doukai || displayResult.raw.nineStar.keisha || displayResult.raw.nineStar.luckyDirections) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {displayResult.raw.nineStar.doukai && (
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">同会</p>
                        <p className="text-sm font-bold text-blue-900">
                          {STAR_INFO[displayResult.raw.nineStar.doukai as NineStar]?.name || displayResult.raw.nineStar.doukai}
                        </p>
                      </div>
                    )}
                    {displayResult.raw.nineStar.keisha && (
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">傾斜</p>
                        <p className="text-sm font-bold text-blue-900">
                          {STAR_INFO[displayResult.raw.nineStar.keisha as NineStar]?.name || displayResult.raw.nineStar.keisha}
                        </p>
                      </div>
                    )}
                    {displayResult.raw.nineStar.luckyDirections && displayResult.raw.nineStar.luckyDirections.length > 0 && (
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">最大吉方</p>
                        <p className="text-sm font-bold text-blue-900">
                          {displayResult.raw.nineStar.luckyDirections.map(k => STAR_INFO[k as NineStar]?.name || k).join('・')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {displayResult.nineStarYear.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{displayResult.nineStarYear.description}</p>
                )}
                {displayResult.nineStarYear.source && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <BookOpen size={14} />
                    出典: {displayResult.nineStarYear.source}
                  </div>
                )}
              </div>
            </div>

            {/* 数秘術カード */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden border-l-4 border-l-purple-500">
              <div className="bg-purple-50/50 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  <TrendingUp className="text-purple-600" size={20} />
                  数秘術
                </h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">人生の目的</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-purple-900">{displayResult.lifePath.title}</p>
                  {displayResult.lifePath.title.includes('マスターナンバー') && (
                    <Crown className="text-yellow-500" size={24} />
                  )}
                </div>
                {displayResult.lifePath.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{displayResult.lifePath.description}</p>
                )}
                {displayResult.lifePath.source && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                    <BookOpen size={14} />
                    出典: {displayResult.lifePath.source}
                  </div>
                )}
              </div>
            </div>

            {/* 四柱推命カード */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden border-l-4 border-l-green-500">
              <div className="bg-green-50/50 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
                  <BookOpen className="text-green-600" size={20} />
                  四柱推命
                </h3>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">日干</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <p className="text-4xl font-bold text-green-900">{displayResult.dayStem.title}</p>
                  <div className="text-sm bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium">
                    {getSexagenaryName(displayResult.raw.fourPillars.sexagenaryCycle)}
                  </div>
                </div>
                {displayResult.dayStem.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{displayResult.dayStem.description}</p>
                )}
                {displayResult.dayStem.source && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <BookOpen size={14} />
                    出典: {displayResult.dayStem.source}
                  </div>
                )}
              </div>
            </div>

            {/* Big Five性格診断への誘導 */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="text-violet-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">Big Five 性格診断もお試しください</h3>
                  <p className="text-sm text-gray-600 mt-1">科学的な性格特性診断で、さらに自分を深く知りましょう</p>
                </div>
                <button
                  onClick={() => router.push('/bigfive')}
                  className="flex items-center gap-1 px-4 py-2 bg-violet-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-violet-700 transition-all text-sm"
                >
                  診断する
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function FortunePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="animate-spin mx-auto mb-4 text-indigo-600" size={40} />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <FortuneContent />
    </Suspense>
  );
}
