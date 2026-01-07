'use client';

import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import {
  Code,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Gamepad2,
  Sparkles,
  Gift,
  Dice6,
} from 'lucide-react';

const gameTypes = [
  {
    id: 'gacha',
    title: 'ガチャ',
    description: 'カプセルトイ、ルーレット、おみくじの3種類のアニメーション',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'slot',
    title: 'スロット',
    description: 'スロットマシン形式のガチャゲーム',
    icon: <Dice6 className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'scratch',
    title: 'スクラッチ',
    description: '削って当たりを確認するスクラッチカード',
    icon: <Gift className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'fukubiki',
    title: '福引き',
    description: 'ガラガラ抽選形式の福引きゲーム',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500',
  },
];

export default function EmbedInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} onAuthClick={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Code className="w-4 h-4" />
            外部サイト埋め込み
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ゲーミフィケーションを<br />あなたのサイトに
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            集客メーカーで作成したガチャやスロットなどのゲームを、
            あなたのWebサイトやブログに簡単に埋め込むことができます。
          </p>
        </div>

        {/* 対応ゲーム */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">対応ゲーム</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {gameTypes.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-4`}>
                  {game.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{game.title}</h3>
                <p className="text-sm text-gray-600">{game.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 埋め込み方式 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">埋め込み方式</h2>
          <div className="space-y-6">
            {/* リンク方式 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">方式A: 直接リンク</h3>
                  <p className="text-gray-600 mb-4">
                    ゲームページへのリンクをボタンやテキストリンクとして設置します。
                    クリックすると集客メーカーのサイトに移動してゲームをプレイできます。
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      難易度: 簡単
                    </span>
                    <span className="text-sm text-gray-500">HTML/CSSの知識不要</span>
                  </div>
                </div>
              </div>
            </div>

            {/* iframe方式 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">方式B: iframe埋め込み</h3>
                  <p className="text-gray-600 mb-4">
                    iframeコードをHTMLに貼り付けることで、ページ内に直接ゲームを表示できます。
                    サイトのデザインに合わせてサイズやテーマをカスタマイズできます。
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      難易度: やや簡単
                    </span>
                    <span className="text-sm text-gray-500">基本的なHTML知識が必要</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">使い方</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">キャンペーンを作成</p>
                  <p className="text-sm text-gray-600">
                    ダッシュボードからガチャやスロットなどのキャンペーンを作成します。
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">埋め込みコードを取得</p>
                  <p className="text-sm text-gray-600">
                    キャンペーン詳細ページで「埋め込みコード」ボタンをクリックします。
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">サイトに設置</p>
                  <p className="text-sm text-gray-600">
                    リンクをコピーするか、iframeコードをHTMLに貼り付けます。
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* 注意事項 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">注意事項</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-yellow-800">ログインが必要なケース</p>
                  <p className="text-sm text-yellow-700">
                    ポイントを消費してプレイする場合は、ユーザーのログインが必要です。
                    未ログイン状態ではデモプレイ（ポイント消費なし）となります。
                  </p>
                </div>
                <div>
                  <p className="font-medium text-yellow-800">iframe内でのログイン</p>
                  <p className="text-sm text-yellow-700">
                    セキュリティ上の理由から、iframe内でのログインはサポートしていません。
                    ログインが必要な場合は、リンク方式をご利用ください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/gamification/new"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            キャンペーンを作成する
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

