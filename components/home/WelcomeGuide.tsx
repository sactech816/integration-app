'use client';

import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { ICON_MAP } from '@/components/onboarding/iconMap';

const STORAGE_KEY = 'sm_welcome_guide_banner';

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
};

type GuideItem = {
  iconName: string;
  iconColor: string;
  title: string;
  description: string;
};

type GuidePage = {
  subtitle: string;
  items: GuideItem[];
};

const GUIDE_PAGES: GuidePage[] = [
  {
    subtitle: 'ゲスト・無料・Proプランの違い',
    items: [
      { iconName: 'Users', iconColor: 'blue', title: 'ゲスト', description: '登録不要ですぐお試し。作品の保存はできません' },
      { iconName: 'Heart', iconColor: 'green', title: '無料プラン', description: 'メールで簡単登録。作品の保存・管理・共有が可能' },
      { iconName: 'Award', iconColor: 'amber', title: 'Proプラン', description: '埋め込み・HTML出力・アナリティクスなどフル機能を開放' },
    ],
  },
  {
    subtitle: 'いろんなツールが簡単に作れます',
    items: [
      { iconName: 'Sparkles', iconColor: 'indigo', title: '診断クイズ・プロフィール', description: 'お客様に合った提案を自動診断 / プロフィールLPを作成' },
      { iconName: 'Layout', iconColor: 'amber', title: 'LP・セールスライター', description: 'ランディングページやセールスレターをノーコードで作成' },
      { iconName: 'Clock', iconColor: 'blue', title: '予約・アンケート・出欠', description: 'ビジネスに必要な各種フォームを簡単作成' },
      { iconName: 'Gift', iconColor: 'purple', title: 'ゲーミフィケーション', description: 'ガチャ・スクラッチ・ルーレットで集客を楽しく' },
    ],
  },
  {
    subtitle: 'AI活用で書籍出版もサポート',
    items: [
      { iconName: 'BookOpen', iconColor: 'orange', title: 'Kindle出版 (KDL)', description: 'AIがあなたの書籍執筆をフルサポート' },
      { iconName: 'Lightbulb', iconColor: 'teal', title: 'ネタ発掘診断', description: '質問に答えるだけで最適な執筆テーマを発見' },
      { iconName: 'FileText', iconColor: 'rose', title: 'セールスライター', description: 'セールスレターやLPのコピーをAIでスピード作成' },
    ],
  },
  {
    subtitle: 'スキルを活かして収益化',
    items: [
      { iconName: 'ShoppingCart', iconColor: 'cyan', title: 'スキルマーケット', description: 'あなたのスキルやテンプレートを販売できるマーケット' },
      { iconName: 'Share2', iconColor: 'green', title: 'アフィリエイト', description: '紹介プログラムで報酬を獲得' },
      { iconName: 'Compass', iconColor: 'indigo', title: '活用レシピ', description: 'フリーランス・店舗・インフルエンサー向けの使い方ガイド' },
    ],
  },
  {
    subtitle: '進化し続けるプラットフォーム',
    items: [
      { iconName: 'Rocket', iconColor: 'purple', title: '新機能を随時追加中', description: 'AIサムネイル、はじめかたメーカーなど新ツールを順次リリース' },
      { iconName: 'Globe', iconColor: 'blue', title: 'みんなの作品ポータル', description: 'ユーザー同士の作品共有・発見ができるポータルサイト' },
      { iconName: 'Mail', iconColor: 'amber', title: 'ご要望・フィードバック', description: '新機能のリクエストやご意見をお気軽にお寄せください' },
    ],
  },
];

interface WelcomeGuideProps {
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function WelcomeGuide({ externalOpen, onOpenChange }: WelcomeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    setIsBannerVisible(localStorage.getItem(STORAGE_KEY) !== 'dismissed');
  }, []);

  // 外部からのopen制御
  useEffect(() => {
    if (externalOpen) {
      setCurrentPage(0);
      setIsOpen(true);
      onOpenChange?.(true);
    }
  }, [externalOpen]);

  const dismissBanner = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setIsBannerVisible(false);
  };

  const openGuide = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

  const closeGuide = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const totalPages = GUIDE_PAGES.length;
  const page = GUIDE_PAGES[currentPage];

  return (
    <>
      {/* バナー */}
      {isBannerVisible && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-orange-100 p-1.5 rounded-full shrink-0">
                <HelpCircle size={18} className="text-orange-600" />
              </div>
              <p className="text-sm font-bold text-gray-700 truncate">
                はじめての方へ — 集客メーカーの使い方をご紹介します
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={openGuide}
                className="text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: '#f97316' }}
              >
                ガイドを見る
              </button>
              <button
                onClick={dismissBanner}
                className="text-gray-400 hover:text-gray-600 transition p-1"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* モーダル */}
      {isOpen && page && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeGuide}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">はじめてガイド</h3>
                  <p className="text-white/80 text-sm mt-1">{page.subtitle}</p>
                </div>
                <span className="text-white/70 text-sm font-medium">
                  {currentPage + 1} / {totalPages}
                </span>
              </div>
              <div className="flex gap-1.5 mt-3">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-colors ${
                      i <= currentPage ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* コンテンツ */}
            <div className="px-6 py-5 space-y-4">
              {page.items.map((item, index) => {
                const colors = COLOR_MAP[item.iconColor] || COLOR_MAP.blue;
                const Icon = ICON_MAP[item.iconName] || ICON_MAP.Info;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={16} className={colors.text} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={closeGuide}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                閉じる
              </button>
              <div className="flex items-center gap-2">
                {currentPage > 0 && (
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    戻る
                  </button>
                )}
                {currentPage < totalPages - 1 ? (
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md"
                  >
                    次へ
                  </button>
                ) : (
                  <button
                    onClick={closeGuide}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md"
                  >
                    はじめる！
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
