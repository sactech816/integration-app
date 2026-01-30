'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Rocket, Image, FileText, DollarSign, 
  CheckCircle, ExternalLink, Upload, Settings, Globe, Clock,
  Palette, Layout, Type, Sparkles
} from 'lucide-react';

export default function PublishGuideContent() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* イントロ */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Rocket size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">あなたの本を世界へ届けよう</h1>
        </div>
        <p className="text-white/90 text-sm md:text-base leading-relaxed">
          執筆が完了したら、いよいよ出版準備です！<br />
          表紙の作成からKDPへの登録まで、順を追って解説します。
        </p>
      </div>

      {/* ステップ1: 表紙作成 */}
      <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-5 md:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Image className="text-white" size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 1</span>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">表紙を作成する</h2>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          本の表紙は「顔」です。Canvaを使えば、デザイン初心者でもプロ級の表紙が作れます。
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <Palette size={16} className="text-purple-500" />
            Canvaで表紙を作る
          </h3>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
              <span>Kindle表紙専用のテンプレートが豊富</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
              <span>推奨サイズ: 1600 x 2560 ピクセル（縦横比 1:1.6）</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
              <span>JPGまたはTIFF形式で書き出し</span>
            </div>
          </div>
          <a
            href="https://www.canva.com/ja_jp/create/ebook-covers/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md text-sm"
          >
            <ExternalLink size={16} />
            Canvaで表紙を作成
          </a>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
            <Type size={14} className="text-gray-600" />
            表紙デザインのコツ
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• タイトルは大きく、読みやすいフォントで</li>
            <li>• サブタイトルで内容をさらに明確に</li>
            <li>• 背景はシンプルに、文字が映える配色を</li>
            <li>• サムネイルサイズでも読めるか確認</li>
          </ul>
        </div>
      </section>

      {/* ステップ2: KDPアカウント作成 */}
      <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-5 md:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 2</span>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">KDPアカウントを作成</h2>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          Amazonのアカウントがあれば、KDP（Kindle Direct Publishing）にすぐ登録できます。
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
            <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">KDPサイトにアクセス</p>
              <p className="text-xs text-gray-600">kdp.amazon.co.jp にアクセスし、Amazonアカウントでログイン</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
            <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">税務情報の入力</p>
              <p className="text-xs text-gray-600">日本在住の場合は「日本」を選択し、マイナンバーを入力</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
            <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">銀行口座の登録</p>
              <p className="text-xs text-gray-600">印税の受け取りに使用する銀行口座情報を登録</p>
            </div>
          </div>
        </div>

        <a
          href="https://kdp.amazon.co.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-4 py-2 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md text-sm"
        >
          <ExternalLink size={16} />
          KDPにアクセス
        </a>
      </section>

      {/* ステップ3: 本の登録 */}
      <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-5 md:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <Upload className="text-white" size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 3</span>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">本を登録する</h2>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          「新しい本の追加」から、Kindle電子書籍を選択して登録を始めます。
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="border border-gray-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-blue-500" size={16} />
              <h4 className="font-bold text-gray-900 text-sm">本の詳細</h4>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• タイトル・サブタイトル</li>
              <li>• 著者名（ペンネーム可）</li>
              <li>• 内容紹介（商品説明）</li>
              <li>• キーワード（最大7つ）</li>
              <li>• カテゴリー（最大2つ）</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="text-blue-500" size={16} />
              <h4 className="font-bold text-gray-900 text-sm">コンテンツ</h4>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 原稿ファイル（DOCX/EPUB）</li>
              <li>• 表紙画像（JPG/TIFF）</li>
              <li>• プレビューで表示確認</li>
              <li>• DRM設定（推奨：有効）</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-800">
            <strong>💡 ヒント:</strong> 執筆画面の「✨ KDP情報生成」ボタンで、キーワード・紹介文・カテゴリーをAIが自動生成します。
          </p>
        </div>
      </section>

      {/* ステップ4: 価格設定 */}
      <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-5 md:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <DollarSign className="text-white" size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 4</span>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">価格を設定する</h2>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-2 text-sm">印税率の選択</h4>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 border border-green-200">
                <p className="font-bold text-green-700 text-sm">35%印税</p>
                <p className="text-xs text-gray-600">99円〜20,000円で設定可能</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-green-200">
                <p className="font-bold text-green-700 text-sm">70%印税</p>
                <p className="text-xs text-gray-600">250円〜1,250円で設定可能<br />（KDPセレクト加入が必要）</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <h4 className="font-bold text-yellow-800 mb-1 text-sm">📚 KDPセレクトとは？</h4>
            <p className="text-xs text-yellow-700">
              Kindle Unlimited（読み放題）に参加するプログラム。70%印税の適用、無料キャンペーン実施などのメリットがありますが、90日間はAmazon独占販売となります。
            </p>
          </div>
        </div>
      </section>

      {/* ステップ5: 出版 */}
      <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-5 md:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center">
            <Globe className="text-white" size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 5</span>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">出版する</h2>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          全ての設定が完了したら、「Kindleストアで出版」ボタンをクリック！
        </p>

        <div className="bg-indigo-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 text-sm text-indigo-800">
            <Clock size={18} className="flex-shrink-0" />
            <p>
              審査には通常<strong>24〜72時間</strong>かかります。<br />
              承認されると、世界中のKindleストアで販売開始！
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl p-4 text-center">
          <Sparkles className="mx-auto mb-2" size={24} />
          <p className="font-bold text-lg">おめでとうございます！</p>
          <p className="text-sm opacity-90">あなたも今日から「著者」です</p>
        </div>
      </section>

      {/* チェックリスト */}
      <section className="bg-gradient-to-r from-gray-50 to-amber-50 rounded-2xl p-5 md:p-6 border border-amber-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📋 出版前チェックリスト</h2>
        <div className="space-y-2">
          {[
            '原稿の最終確認（誤字脱字チェック）',
            'Word形式でエクスポート',
            '表紙画像の準備（1600x2560px推奨）',
            'KDPアカウントの作成',
            'キーワード・紹介文の準備',
            '価格設定の決定',
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
