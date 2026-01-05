'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Rocket, Image, FileText, DollarSign, 
  CheckCircle, ExternalLink, Upload, Settings, Globe, Clock,
  Palette, Layout, Type, Sparkles
} from 'lucide-react';

export default function PublishGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/kindle" 
            className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <Rocket className="text-amber-600" size={24} />
            <span className="font-bold text-gray-900">出版準備ガイド</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* イントロ */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Rocket size={24} />
            </div>
            <h1 className="text-2xl font-bold">あなたの本を世界へ届けよう</h1>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">
            執筆お疲れさまでした！ここからは出版に向けた準備です。<br />
            表紙の作成からKDPへの登録まで、順を追って解説します。
          </p>
        </div>

        {/* ステップ1: 表紙作成 */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Image className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 1</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">表紙を作成する</h2>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            本の表紙は「顔」です。Canvaを使えば、デザイン初心者でもプロ級の表紙が作れます。
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Palette size={18} className="text-purple-500" />
              Canvaで表紙を作る
            </h3>
            <div className="space-y-3 text-sm text-gray-700 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span>Kindle表紙専用のテンプレートが豊富</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span>推奨サイズ: 1600 x 2560 ピクセル（縦横比 1:1.6）</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span>JPGまたはTIFF形式で書き出し</span>
              </div>
            </div>
            <a
              href="https://www.canva.com/ja_jp/create/ebook-covers/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
            >
              <ExternalLink size={18} />
              Canvaで表紙を作成
            </a>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Type size={16} className="text-gray-600" />
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
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 2</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">KDPアカウントを作成</h2>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Amazonのアカウントがあれば、KDP（Kindle Direct Publishing）にすぐ登録できます。
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
              <div>
                <p className="font-bold text-gray-900">KDPサイトにアクセス</p>
                <p className="text-sm text-gray-600">kdp.amazon.co.jp にアクセスし、Amazonアカウントでログイン</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
              <div>
                <p className="font-bold text-gray-900">税務情報の入力</p>
                <p className="text-sm text-gray-600">日本在住の場合は「日本」を選択し、マイナンバーを入力</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
              <div>
                <p className="font-bold text-gray-900">銀行口座の登録</p>
                <p className="text-sm text-gray-600">印税の受け取りに使用する銀行口座情報を登録</p>
              </div>
            </div>
          </div>

          <a
            href="https://kdp.amazon.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-5 py-2.5 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            <ExternalLink size={18} />
            KDPにアクセス
          </a>
        </section>

        {/* ステップ3: 本の登録 */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
              <Upload className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 3</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">本を登録する</h2>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            「新しい本の追加」から、Kindle電子書籍を選択して登録を始めます。
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-blue-500" size={18} />
                <h4 className="font-bold text-gray-900">本の詳細</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• タイトル・サブタイトル</li>
                <li>• 著者名（ペンネーム可）</li>
                <li>• 内容紹介（商品説明）</li>
                <li>• キーワード（最大7つ）</li>
                <li>• カテゴリー（最大2つ）</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="text-blue-500" size={18} />
                <h4 className="font-bold text-gray-900">コンテンツ</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 原稿ファイル（DOCX/EPUB）</li>
                <li>• 表紙画像（JPG/TIFF）</li>
                <li>• プレビューで表示確認</li>
                <li>• DRM設定（推奨：有効）</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 ヒント:</strong> 執筆画面の「✨ KDP情報生成」ボタンで、キーワード・紹介文・カテゴリーをAIが自動生成します。
            </p>
          </div>
        </section>

        {/* ステップ4: 価格設定 */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 4</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">価格を設定する</h2>
            </div>
          </div>
          
          <div className="space-y-4 mb-4">
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-2">印税率の選択</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="font-bold text-green-700">35%印税</p>
                  <p className="text-sm text-gray-600">99円〜20,000円で設定可能</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="font-bold text-green-700">70%印税</p>
                  <p className="text-sm text-gray-600">250円〜1,250円で設定可能<br />（KDPセレクト加入が必要）</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-yellow-800 mb-2">📚 KDPセレクトとは？</h4>
              <p className="text-sm text-yellow-700">
                Kindle Unlimited（読み放題）に参加するプログラム。<br />
                70%印税の適用、無料キャンペーン実施などのメリットがありますが、<br />
                90日間はAmazon独占販売となります。
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">価格設定のヒント</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 初めての本は <strong>250円〜499円</strong> で始めるのがおすすめ</li>
              <li>• 競合の本の価格をリサーチ</li>
              <li>• 後から価格変更も可能</li>
            </ul>
          </div>
        </section>

        {/* ステップ5: 審査・公開 */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP 5</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">審査・公開</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-4">
              <Clock className="text-violet-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900">審査期間</p>
                <p className="text-sm text-gray-600">
                  通常24〜72時間で審査が完了します。<br />
                  問題がなければ、自動的にAmazonで販売開始されます。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900">公開後にできること</p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• 内容の更新（誤字修正など）</li>
                  <li>• 価格の変更</li>
                  <li>• 無料キャンペーンの実施（KDPセレクト加入時）</li>
                  <li>• 販売レポートの確認</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* チェックリスト */}
        <section className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-amber-600" size={24} />
            出版前チェックリスト
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-gray-700">本文の誤字脱字チェック完了</span>
            </label>
            <label className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-gray-700">表紙画像を用意した</span>
            </label>
            <label className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-gray-700">Word形式で書き出した</span>
            </label>
            <label className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-gray-700">KDPアカウントを作成した</span>
            </label>
            <label className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-gray-700">キーワード・紹介文を準備した</span>
            </label>
            <label className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-gray-700">価格を決めた</span>
            </label>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            準備が整ったら、KDPで出版手続きを進めましょう！
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://kdp.amazon.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <Rocket size={20} />
              KDPで出版する
              <ExternalLink size={16} />
            </a>
            <Link
              href="/kindle"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all border border-gray-200"
            >
              <BookOpen size={20} />
              書籍一覧へ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}










