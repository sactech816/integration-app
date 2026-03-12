'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';
import { getSexagenaryName, STAR_INFO } from '@/lib/fortune';
import type { FortuneResult } from '@/lib/fortune';
import type { NineStar } from '@/lib/fortune/nine-star';
import { Sparkles, Star, TrendingUp, BookOpen, Crown, Loader2, Share2, ArrowLeft } from 'lucide-react';
import FortunePremiumReport from '@/components/fortune/FortunePremiumReport';
import MakersPromoBanner from '@/components/shared/MakersPromoBanner';
import { trackFortuneEvent } from '@/lib/fortune/tracking';

export default function FortuneResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [contents, setContents] = useState<Record<string, { title: string; description: string; source: string }>>({});
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
  }, []);

  useEffect(() => {
    if (!id) return;
    loadResult();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadResult = async () => {
    try {
      const res = await fetch(`/api/fortune/result?id=${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '結果を読み込めませんでした');
        return;
      }

      setResult(data.result);

      // オーナー判定
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && data.result.user_id === currentUser.id) {
        setIsOwner(true);
      }

      // ファネルイベント
      trackFortuneEvent('page_view', { resultId: id });

      // 解釈テキスト取得
      const snapshot: FortuneResult = data.result.result_snapshot;
      const keys = [
        snapshot.nineStar.year,
        snapshot.nineStar.month,
        snapshot.numerology.lifePath,
        snapshot.fourPillars.heavenlyStem,
      ];

      const { data: contentData } = await supabase
        .from('fortune_contents')
        .select('result_key, title, content_md, type_slug')
        .in('result_key', keys);

      const sourceMap: Record<string, string> = {
        nine_star: '高島易断',
        numerology: '西洋数秘術の古典解釈',
        four_pillars: '淵海子平',
      };

      const map: Record<string, { title: string; description: string; source: string }> = {};
      for (const key of keys) {
        const c = contentData?.find(d => d.result_key === key);
        let desc = c?.content_md || '';
        desc = desc.replace(/^##\s+/gm, '').replace(/\*\*出典\*\*:.*$/m, '').trim();
        map[key] = {
          title: c?.title || key,
          description: desc,
          source: sourceMap[c?.type_slug as string] || '',
        };
      }
      setContents(map);
    } catch (e) {
      console.error('Fortune result load error:', e);
      setError('結果を読み込めませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = result
      ? `${result.birth_year}年${result.birth_month}月${result.birth_day}日生まれの運勢鑑定結果`
      : '運勢鑑定結果';
    if (navigator.share) {
      navigator.share({ title: '生年月日占い', text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('URLをクリップボードにコピーしました！');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={40} />
          <p className="text-gray-600">鑑定結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
        <Header user={user} onLogout={async () => { await supabase.auth.signOut(); setUser(null); }} setShowAuth={setShowAuth} />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600 mb-6">{error || '結果が見つかりません'}</p>
          <button
            onClick={() => router.push('/fortune')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-all"
          >
            <ArrowLeft size={16} />
            占いトップに戻る
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const snapshot: FortuneResult = result.result_snapshot;
  const { birth_year, birth_month, birth_day } = result;
  const yearContent = contents[snapshot.nineStar.year] || { title: snapshot.nineStar.year, description: '', source: '' };
  const monthContent = contents[snapshot.nineStar.month] || { title: snapshot.nineStar.month, description: '', source: '' };
  const lpContent = contents[snapshot.numerology.lifePath] || { title: snapshot.numerology.lifePath, description: '', source: '' };
  const stemContent = contents[snapshot.fourPillars.heavenlyStem] || { title: snapshot.fourPillars.heavenlyStem, description: '', source: '' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <Header user={user} onLogout={async () => { await supabase.auth.signOut(); setUser(null); }} setShowAuth={setShowAuth} />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* 結果ヘッダー */}
        <div className="text-center py-4 space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-700 shadow-sm">
            <Sparkles size={16} className="text-yellow-500" />
            鑑定結果
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {birth_year}年{birth_month}月{birth_day}日生まれ
          </h1>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              <Share2 size={16} />
              シェア
            </button>
            <button
              onClick={() => router.push('/fortune')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-indigo-700 transition-all"
            >
              自分も占う
            </button>
          </div>
        </div>

        {/* 九星気学 */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden border-l-4 border-l-blue-500">
          <div className="bg-blue-50/50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Star className="text-blue-600" size={20} />
              九星気学
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">本命星</span>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-4xl font-bold text-blue-900">{yearContent.title}</p>
            {monthContent.title && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">月命星: {monthContent.title}</p>
              </div>
            )}
            {(snapshot.nineStar.doukai || snapshot.nineStar.keisha || (snapshot.nineStar.luckyDirections && snapshot.nineStar.luckyDirections.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {snapshot.nineStar.doukai && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">同会</p>
                    <p className="text-sm font-bold text-blue-900">{STAR_INFO[snapshot.nineStar.doukai as NineStar]?.name || snapshot.nineStar.doukai}</p>
                  </div>
                )}
                {snapshot.nineStar.keisha && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">傾斜</p>
                    <p className="text-sm font-bold text-blue-900">{STAR_INFO[snapshot.nineStar.keisha as NineStar]?.name || snapshot.nineStar.keisha}</p>
                  </div>
                )}
                {snapshot.nineStar.luckyDirections && snapshot.nineStar.luckyDirections.length > 0 && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">最大吉方</p>
                    <p className="text-sm font-bold text-blue-900">
                      {snapshot.nineStar.luckyDirections.map(k => STAR_INFO[k as NineStar]?.name || k).join('・')}
                    </p>
                  </div>
                )}
              </div>
            )}
            {yearContent.description && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{yearContent.description}</p>}
            {yearContent.source && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <BookOpen size={14} /> 出典: {yearContent.source}
              </div>
            )}
          </div>
        </div>

        {/* 数秘術 */}
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
              <p className="text-4xl font-bold text-purple-900">{lpContent.title}</p>
              {lpContent.title.includes('マスターナンバー') && <Crown className="text-yellow-500" size={24} />}
            </div>
            {lpContent.description && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lpContent.description}</p>}
            {lpContent.source && (
              <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                <BookOpen size={14} /> 出典: {lpContent.source}
              </div>
            )}
          </div>
        </div>

        {/* 四柱推命 */}
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
              <p className="text-4xl font-bold text-green-900">{stemContent.title}</p>
              <div className="text-sm bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium">
                {getSexagenaryName(snapshot.fourPillars.sexagenaryCycle)}
              </div>
            </div>
            {stemContent.description && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{stemContent.description}</p>}
            {stemContent.source && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <BookOpen size={14} /> 出典: {stemContent.source}
              </div>
            )}
          </div>
        </div>

        {/* プレミアムレポート（オーナーのみ） */}
        {isOwner && (
          <FortunePremiumReport
            resultId={id}
            isPurchased={!!result.report_purchased}
            existingReportHtml={result.report_content || null}
          />
        )}

        {/* 集客メーカー導線 */}
        <MakersPromoBanner
          headline="運勢を味方に、ビジネスを加速させよう"
          description="あなたの特性を活かした集客戦略を。診断クイズやLP、予約フォームなど、ビジネスに必要なツールが揃う集客プラットフォームです。"
        />

        {/* CTA */}
        <div className="text-center py-6">
          <button
            onClick={() => router.push('/fortune')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all text-lg"
          >
            <Sparkles size={20} />
            自分の運勢を鑑定する
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
