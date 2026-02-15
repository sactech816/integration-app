/**
 * KDLアクセス案内モーダル
 * 未課金ユーザーがKindleメニューをクリックした際に表示
 */

'use client';

import React from 'react';
import { X, BookOpen, Sparkles, ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';

interface KdlAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KdlAccessModal({ isOpen, onClose }: KdlAccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* ヘッダー背景 */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Kindle出版メーカー</h2>
              <p className="text-white/80 text-sm">AIでKindle出版を簡単に</p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Crown size={18} />
              プラン加入が必要です
            </div>
            <p className="text-gray-600">
              Kindle執筆機能をご利用いただくには、<br />
              KDLプランへの加入が必要です。
            </p>
          </div>

          {/* 特徴リスト */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              KDLでできること
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>AIがあなたの執筆をサポート</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>質問に答えるだけで本が完成</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>KDP形式でエクスポート可能</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>初心者でも簡単に出版準備</span>
              </li>
            </ul>
          </div>

          {/* ボタン */}
          <div className="space-y-3">
            <Link
              href="/kindle/lp"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
              onClick={onClose}
            >
              <Sparkles size={20} />
              プランを見る
              <ArrowRight size={20} />
            </Link>
            
            <Link
              href="/kindle/demo"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              まずはデモを見る
            </Link>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
