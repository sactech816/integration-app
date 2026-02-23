'use client';

import { useState } from 'react';
import { UserCircle, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'tab-freelance', label: '👤 フリーランス' },
  { id: 'tab-shop', label: '🏪 店舗・教室' },
  { id: 'tab-influencer', label: '📱 インフルエンサー' },
  { id: 'tab-marketer', label: '💼 マーケター' },
];

export default function RecipeTabSection() {
  const [activeTab, setActiveTab] = useState('tab-freelance');

  return (
    <section className="py-24 bg-white border-y" style={{ borderColor: '#ffedd5' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>
            あなたの「やりたいこと」別、活用レシピ
          </h2>
          <p className="text-gray-600">
            タブを切り替えて、実際の使い方を見てみましょう。
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-6 py-3 rounded-full font-bold transition"
                style={
                  activeTab === tab.id
                    ? { backgroundColor: '#f97316', color: 'white' }
                    : { backgroundColor: 'white', color: '#5d4037', border: '1px solid #ffedd5' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="bg-white rounded-3xl shadow-lg border-2 p-8 md:p-12 min-h-[300px]"
            style={{ borderColor: '#ffedd5' }}
          >
            {activeTab === 'tab-freelance' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>
                  👤 フリーランス（コーチ・ヨガ講師・コンサル等）
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  「プロフィールメーカー」で実績・経歴を魅力的に紹介し、「予約メーカー」で日程調整の手間をゼロに。「セールスライター」でAIが売れる文章を自動生成。
                </p>
                <div className="border-l-8 p-4 rounded-xl mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#f97316' }}>
                  <p className="text-sm font-bold" style={{ color: '#f97316' }}>こんな使い方も：</p>
                  <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                    ・オンライン相談の事前ヒアリングをアンケートで自動化<br />
                    ・セミナー後のフォローアップクイズでエンゲージメント向上
                  </p>
                </div>
                <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 text-white rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: '#5d4037' }}>キャリアコーチ × プロフィールLP</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        プロフィールに「予約機能」を統合し、<span className="font-bold" style={{ color: '#f97316' }}>事務作業が週10時間削減</span>。空いた時間を本業に充てられるように。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'tab-shop' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>
                  🏪 店舗・教室（飲食店・美容室・スクール等）
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  「診断クイズメーカー」でお客様を楽しませながら、結果ページに「おすすめメニュー」や「クーポン」を表示。「ガチャ」「福引き」「スクラッチ」でキャンペーンを盛り上げ。
                </p>
                <div className="border-l-8 p-4 rounded-xl mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#ec4899' }}>
                  <p className="text-sm font-bold" style={{ color: '#ec4899' }}>こんな使い方も：</p>
                  <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                    ・来店スタンプラリーで「リピーター特典」を自動配布<br />
                    ・ガチャやスロットで景品抽選イベントを開催<br />
                    ・お客様の声をアンケートで収集してGoogleレビュー誘導
                  </p>
                </div>
                <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 text-white rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: '#5d4037' }}>エステサロン × 診断クイズ</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        「美肌ケア診断」を公式LINEで配信し、<span className="font-bold" style={{ color: '#f97316' }}>診断実施者の42%が予約ページへ遷移</span>。従来のクーポン配布より高い反応率。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'tab-influencer' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>
                  📱 インフルエンサー（SNS発信者・アフィリエイター）
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  「プロフィールメーカー」に全SNSのリンクを集約し、「診断クイズメーカー」でフォロワーとの距離を縮める。「福引き」「スクラッチ」でキャンペーンを盛り上げ。
                </p>
                <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#8b5cf6' }}>
                  <p className="text-sm font-bold" style={{ color: '#8b5cf6' }}>こんな使い方も：</p>
                  <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                    ・「あなたは何タイプ？」診断でエンゲージメント率アップ<br />
                    ・福引きやスクラッチでプレゼント企画を開催<br />
                    ・診断結果に応じてアフィリエイト商品をレコメンド
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'tab-marketer' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>
                  💼 マーケター（Web制作・広告運用者）
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  「LPメーカー」をテンプレートで即作成、A/Bテストも簡単。「セールスライター」でAIが売れるコピーを自動生成。「診断コンテンツ」をLPに埋め込んでCVR改善。
                </p>
                <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#2563eb' }}>
                  <p className="text-sm font-bold" style={{ color: '#2563eb' }}>こんな使い方も：</p>
                  <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                    ・セールスライターでLP文章を自動生成<br />
                    ・クライアント向けにアンケートフォームを一元管理<br />
                    ・リード獲得用の診断LPを量産してテストマーケティング
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
