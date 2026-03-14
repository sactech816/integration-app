'use client';

import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

const guidePages = [
  {
    subtitle: 'ガイドメーカーとは',
    items: [
      { icon: '📋', title: 'ステップ形式で「次にやること」を案内', description: '「STEP 1 → 2 → 3」の分かりやすい形式で、訪問者やお客様に次のアクションを明確に伝えます。' },
      { icon: '⚡', title: '最適なタイミングで自動表示', description: 'ページ読み込み・スクロール・ボタンクリックに連動して、最適な瞬間にガイドが表示されます。' },
      { icon: '🎨', title: 'デザインを自由にカスタマイズ', description: 'アイコン・カラー・ステップ数を御社のブランドに合わせて自由に設定できます。' },
    ],
  },
  {
    subtitle: '活用シーン',
    items: [
      { icon: '💻', title: 'SaaS・Webサービスの初期設定ガイド', description: '新規登録後のユーザーに「最初にやること」をステップで案内。早期離脱を防ぎ定着率を向上。' },
      { icon: '🎓', title: 'オンライン講座の受講開始ガイド', description: '受講者に「講座の受け方・教材の使い方」を丁寧に案内。迷いゼロで学習を加速します。' },
      { icon: '🏢', title: '既存HPの離脱防止', description: '訪問者が「次に何をすればいいか」を自動案内。離脱をコンバージョンに変えます。' },
    ],
  },
  {
    subtitle: '導入メリット',
    items: [
      { icon: '📈', title: 'コンバージョン率の向上', description: '「何をすればいいか」が分かれば、訪問者は次のステップへ進みます。問い合わせ到達率が向上。' },
      { icon: '👤', title: 'リピーターには自動で非表示', description: '「もう表示しない」機能で既存ユーザーには邪魔にならず、新規訪問者だけに案内します。' },
      { icon: '📊', title: '効果測定でガイドを改善', description: '表示回数・クリック率のデータを見ながら、ガイド内容を継続的に改善して成果を最大化。' },
    ],
  },
  {
    subtitle: '導入方法',
    items: [
      { icon: '✏️', title: 'ガイドを作成（最短5分）', description: 'タイトル・ステップ・説明文を入力するだけ。テンプレートから選んですぐに完成します。' },
      { icon: '📎', title: '埋め込みコードをコピー', description: '生成されたscriptタグ1行をコピー。WordPress・Wix・HTMLどんなサイトにも対応。' },
      { icon: '🚀', title: 'サイトに貼り付けて即稼働', description: '既存サイトのHTMLに貼り付けるだけ。Shadow DOM技術でデザインに影響ゼロ、即日稼働します。' },
    ],
  },
];

export default function OnboardingGuideButton() {
  const [showGuide, setShowGuide] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const page = guidePages[currentPage];
  const totalPages = guidePages.length;

  return (
    <>
      <button
        onClick={() => { setShowGuide(true); setCurrentPage(0); }}
        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold text-lg rounded-xl border border-orange-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px] cursor-pointer"
      >
        <BookOpen className="w-5 h-5" />
        ガイドを見る
      </button>

      {showGuide && page && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">ガイドメーカー活用ガイド</h3>
                  <p className="text-white/80 text-sm mt-1">{page.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/70 text-sm font-medium">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button onClick={() => setShowGuide(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                    <X size={18} />
                  </button>
                </div>
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
              {page.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div />
              <div className="flex items-center gap-2">
                {currentPage > 0 && (
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all min-h-[44px]"
                  >
                    戻る
                  </button>
                )}
                {currentPage < totalPages - 1 ? (
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md min-h-[44px]"
                  >
                    次へ
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowGuide(false); setCurrentPage(0); }}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md min-h-[44px]"
                  >
                    閉じる
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
