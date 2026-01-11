'use client';

import React, { useState } from 'react';
import { Calendar, Check, Gift, Coins, Sparkles } from 'lucide-react';

interface LoginBonusPreviewProps {
  title: string;
  description: string;
  pointsPerDay: number;
  isTestMode: boolean;
}

export default function LoginBonusPreview({
  title,
  description,
  pointsPerDay,
  isTestMode,
}: LoginBonusPreviewProps) {
  const [claimed, setClaimed] = useState(false);
  const [mockPoints, setMockPoints] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  // 今日のログインボーナスを受け取る
  const handleClaim = () => {
    if (claimed) return;

    setShowAnimation(true);
    setClaimed(true);
    
    setTimeout(() => {
      setMockPoints(prev => prev + pointsPerDay);
      setShowAnimation(false);
    }, 1000);
  };

  // リセット
  const handleReset = () => {
    setClaimed(false);
    setMockPoints(0);
    setShowAnimation(false);
  };

  // 今日の日付
  const today = new Date();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];

  // カレンダー用の過去7日間
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.getDate(),
      isToday: i === 6,
      isPast: i < 6,
    };
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 pt-14 pb-6 px-4">
      {/* テストモード表示 */}
      {isTestMode && (
        <div className="absolute top-12 left-0 right-0 bg-blue-500 text-white text-center py-1 text-xs font-bold">
          テストモード
        </div>
      )}

      {/* タイトル */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          {title || 'ログインボーナス'}
        </h1>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
      </div>

      {/* ポイント表示 */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
          <Coins className="w-5 h-5 text-blue-500" />
          <span className="text-gray-800 font-bold">{mockPoints} pt</span>
          {isTestMode && (
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 hover:text-blue-800 ml-2 underline"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* カレンダー風表示 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-700">今週のログイン</span>
          <span className="text-xs text-gray-500">
            {today.getMonth() + 1}月{today.getDate()}日（{dayOfWeek}）
          </span>
        </div>

        {/* 週間カレンダー */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
          {last7Days.map((day, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-bold
                ${day.isToday 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' 
                  : day.isPast 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-gray-50 text-gray-300'}
              `}
            >
              {day.isPast && !day.isToday && <Check className="w-4 h-4 text-green-500" />}
              {day.isToday && day.day}
              {!day.isPast && !day.isToday && day.day}
            </div>
          ))}
        </div>
      </div>

      {/* ボーナス受け取りカード */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <div className="text-center">
          {/* ギフトアイコン */}
          <div className={`
            w-20 h-20 mx-auto mb-4 rounded-2xl
            flex items-center justify-center
            ${claimed 
              ? 'bg-green-100' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'}
            ${showAnimation ? 'animate-bounce' : ''}
          `}>
            {claimed ? (
              <Check className="w-10 h-10 text-green-600" />
            ) : (
              <Gift className="w-10 h-10 text-white" />
            )}
          </div>

          {/* テキスト */}
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {claimed ? '受け取り済み！' : '今日のボーナス'}
          </h3>
          <p className="text-2xl font-black text-blue-600 mb-4">
            +{pointsPerDay} pt
          </p>

          {/* ボタン */}
          <button
            onClick={handleClaim}
            disabled={claimed}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2
              transition-all
              ${claimed 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'}
            `}
          >
            {claimed ? (
              <>
                <Check className="w-5 h-5" />
                受け取り済み
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                ボーナスを受け取る
              </>
            )}
          </button>
        </div>
      </div>

      {/* 説明 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>毎日ログインしてポイントを貯めよう！</p>
      </div>
    </div>
  );
}















