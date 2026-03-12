'use client';

import { useState } from 'react';
import { Sparkles, Star, BookOpen, TrendingUp } from 'lucide-react';
import { getTodayAllFortunes } from '@/lib/fortune/daily-fortune';

const DailyFortuneOmikuji = () => {
  const { nineStar, numerology, classical } = getTodayAllFortunes();

  const [showNineStar, setShowNineStar] = useState(false);
  const [showNumerology, setShowNumerology] = useState(false);
  const [showClassical, setShowClassical] = useState(false);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-purple-700 mb-4 shadow-sm">
          <Sparkles size={16} className="text-yellow-500" />
          今日の運勢おみくじ
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          今日のあなたの運勢
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          3つの占術から導き出す、今日一日の運勢とメッセージ
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* 1. 九星気学ベース */}
        <div className="relative">
          {!showNineStar ? (
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-8 shadow-md border border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Star className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">九星気学</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">伝統的な占術で<br />今日の運勢を占う</p>
              <button
                onClick={() => setShowNineStar(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Star size={18} />
                おみくじを引く
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-6 shadow-md border border-gray-300 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Star className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">九星気学</h3>
                  <p className="text-xs text-gray-500">伝統占術</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <div
                  className="inline-block px-6 py-3 rounded-lg mb-3 shadow-md"
                  style={{
                    backgroundColor: nineStar.luckyColor,
                    color: '#ffffff',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  <span className="text-3xl font-bold">{nineStar.level}</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-2">{nineStar.starName}</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{nineStar.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/50 rounded-lg p-2 text-center">
                  <p className="text-gray-500 mb-1">吉方位</p>
                  <p className="font-bold text-gray-800">{nineStar.luckyDirection}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-2 text-center">
                  <p className="text-gray-500 mb-1">幸運色</p>
                  <div className="flex items-center justify-center gap-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: nineStar.luckyColor }}
                    />
                    <span className="font-bold text-gray-800 text-xs">
                      {nineStar.starName.includes('水') ? '青' :
                       nineStar.starName.includes('土') ? '黄' :
                       nineStar.starName.includes('木') ? '緑' :
                       nineStar.starName.includes('金') ? '白' : '赤'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. 数秘術ベース */}
        <div className="relative">
          {!showNumerology ? (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-md border border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">数秘術</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">今日の数字から<br />運勢をチェック</p>
              <button
                onClick={() => setShowNumerology(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <TrendingUp size={18} />
                運勢を表示
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-md border border-gray-300 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">数秘術</h3>
                  <p className="text-xs text-gray-500">西洋占術</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 shadow-lg"
                  style={{ backgroundColor: numerology.color, color: '#ffffff' }}
                >
                  <span className="text-4xl font-bold">{numerology.number}</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-2">今日の数字</p>
              </div>

              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < numerology.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{numerology.message}</p>
              </div>

              <div className="text-center">
                <div
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white shadow-md"
                  style={{ backgroundColor: numerology.color }}
                >
                  今日のテーマ: {numerology.keyword}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. 古典格言ベース */}
        <div className="relative">
          {!showClassical ? (
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-8 shadow-md border border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">古典の教え</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">先人の知恵から<br />今日のメッセージ</p>
              <button
                onClick={() => setShowClassical(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Sparkles size={18} />
                運試し！
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 shadow-md border border-gray-300 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-amber-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">古典の教え</h3>
                  <p className="text-xs text-gray-500">先人の知恵</p>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-300">
                  <div className="text-center mb-3">
                    <Sparkles className="inline-block text-amber-500 mb-2" size={24} />
                  </div>
                  <p className="text-lg font-bold text-gray-800 text-center mb-3 leading-relaxed">
                    {classical.message}
                  </p>
                  <p className="text-xs text-amber-700 text-center font-medium">
                    ― {classical.source} ―
                  </p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1 font-medium">意味</p>
                <p className="text-sm text-gray-700 leading-relaxed">{classical.meaning}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-gray-500">
          ※この運勢は今日の日付に基づいて算出されています。参考としてお楽しみください。
        </p>
      </div>
    </section>
  );
};

export default DailyFortuneOmikuji;
