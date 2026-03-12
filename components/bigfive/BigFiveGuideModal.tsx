'use client';

import { useState, useEffect } from 'react';
import { X, Brain, Clock, Sparkles, Crown, FileText, Target, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'bigfive_guide_seen';

interface GuidePage {
  title: string;
  items: { icon: React.ElementType; color: string; bg: string; title: string; description: string }[];
}

const GUIDE_PAGES: GuidePage[] = [
  {
    title: 'Big Five 性格診断とは？',
    items: [
      { icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-100', title: '科学的根拠のある性格分析', description: '世界中の心理学研究で使われているビッグファイブ理論に基づき、5つの性格特性を測定します' },
      { icon: Target, color: 'text-purple-600', bg: 'bg-purple-100', title: '複数の診断フレームワーク', description: 'Big Five に加え、16パーソナリティタイプ・DISC行動スタイル・エニアグラムも分析できます' },
      { icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-100', title: '完全無料で診断', description: '診断とウェブ上での結果表示はすべて無料。気軽にお試しいただけます' },
    ],
  },
  {
    title: '3つの診断コース',
    items: [
      { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', title: '簡易診断（10問）約1〜2分', description: '5特性スコア・16パーソナリティタイプ・DISC行動スタイルが分かります' },
      { icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-100', title: '本格診断（50問）約5〜10分', description: '30ファセットの詳細分析付き。より正確な性格プロファイルを作成します' },
      { icon: Crown, color: 'text-amber-600', bg: 'bg-amber-100', title: '詳細診断（145問）約15〜20分', description: '高精度Big Five + エニアグラム9タイプ。あなたを多角的に分析する完全版です' },
    ],
  },
  {
    title: '結果の活かし方',
    items: [
      { icon: Target, color: 'text-green-600', bg: 'bg-green-100', title: '自己理解を深める', description: '自分の強み・弱みを客観的に把握し、キャリアや人間関係に活かせます' },
      { icon: FileText, color: 'text-rose-600', bg: 'bg-rose-100', title: 'AIプレミアムレポート', description: '15ページ以上の詳細分析PDF。AI メンター機能付きでさらに深い洞察を得られます' },
      { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100', title: '結果の共有', description: 'ログインすると結果を保存・共有できます。友人や同僚と比較して楽しめます' },
    ],
  },
];

interface BigFiveGuideModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function BigFiveGuideModal({ forceOpen, onClose }: BigFiveGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setCurrentPage(0);
      setIsOpen(true);
      return;
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'seen') {
        setIsOpen(true);
      }
    } catch { /* ignore */ }
  }, [forceOpen]);

  const closeGuide = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'seen');
    } catch { /* ignore */ }
    onClose?.();
  };

  if (!isOpen) return null;

  const totalPages = GUIDE_PAGES.length;
  const page = GUIDE_PAGES[currentPage];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={closeGuide}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <h3 className="text-xl font-bold">Big Five 性格診断ガイド</h3>
              </div>
              <p className="text-white/80 text-sm mt-1">{page.title}</p>
            </div>
            <button onClick={closeGuide} className="text-white/70 hover:text-white transition p-1">
              <X className="w-5 h-5" />
            </button>
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
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={18} className={item.color} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
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
            スキップ
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
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md"
              >
                次へ
              </button>
            ) : (
              <button
                onClick={closeGuide}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md"
              >
                診断を始める
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
