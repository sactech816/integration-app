'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Lightbulb, Edit3, Target, AlertTriangle, 
  CheckCircle, Sparkles, Heart, PenTool, MessageSquare
} from 'lucide-react';
import KdlHamburgerMenu from '@/components/kindle/shared/KdlHamburgerMenu';

export default function KindleGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KdlHamburgerMenu 
              buttonClassName="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              iconColor="text-amber-600"
            />
            <Link 
              href="/kindle" 
              className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">戻る</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600" size={24} />
            <span className="font-bold text-gray-900">まずお読みください</span>
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
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AIと一緒に、あなたらしい本を書こう</h1>
              <p className="text-sm opacity-80">Kindle出版メーカー</p>
            </div>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">
            このシステムはAIがあなたの執筆をサポートします。<br />
            ただし、AIが生成する文章は「たたき台」です。<br />
            あなたの言葉、あなたの想いを込めて、世界に一つだけの本を完成させましょう。
          </p>
        </div>

        {/* セクション1: AIを活用する心構え */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="text-amber-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AIを活用する心構え</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <CheckCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900">AIは「優秀なアシスタント」</p>
                <p className="text-sm mt-1">
                  AIは情報整理や文章の骨格作りが得意です。ただし、あなたの経験や独自の視点は、AIには書けません。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <CheckCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900">「たたき台」として活用する</p>
                <p className="text-sm mt-1">
                  AI生成文はそのまま使うのではなく、編集・リライトの出発点として考えましょう。あなたの言葉で書き換えることで、オリジナリティが生まれます。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
              <CheckCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900">時間短縮＝クオリティ向上の時間</p>
                <p className="text-sm mt-1">
                  AIで下書きが早くできる分、推敲や編集に時間を使えます。この「仕上げの時間」があなたの本の価値を高めます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* セクション2: 自分らしい本にするコツ */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Heart className="text-orange-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">自分らしい本にするコツ</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="text-amber-500" size={18} />
                <h3 className="font-bold text-gray-900">あなたの体験談を入れる</h3>
              </div>
              <p className="text-sm text-gray-600">
                実際にあった出来事、失敗談、成功体験など。読者が共感できるリアルなエピソードが本の価値を高めます。
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="text-amber-500" size={18} />
                <h3 className="font-bold text-gray-900">話し言葉を取り入れる</h3>
              </div>
              <p className="text-sm text-gray-600">
                AIの文章は堅くなりがち。「〜ですよね」「実は〜なんです」など、親しみやすい表現に書き換えましょう。
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="text-amber-500" size={18} />
                <h3 className="font-bold text-gray-900">例え話を追加する</h3>
              </div>
              <p className="text-sm text-gray-600">
                難しい概念も、身近な例えで分かりやすく。あなたならではの比喩表現が読者の理解を助けます。
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-amber-500" size={18} />
                <h3 className="font-bold text-gray-900">独自の見解を述べる</h3>
              </div>
              <p className="text-sm text-gray-600">
                一般論だけでなく「私はこう思う」という意見を。賛否があっても、それがあなたの本の個性になります。
              </p>
            </div>
          </div>
        </section>

        {/* セクション3: AI生成文の注意点 */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI生成文の注意点</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-800 mb-2">🔍 ファクトチェックは必須</h3>
              <p className="text-sm text-red-700">
                AIは事実と異なる情報を生成することがあります（ハルシネーション）。<br />
                数字、日付、人名、専門用語などは必ず確認してください。
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-800 mb-2">📝 一貫性の確認</h3>
              <p className="text-sm text-yellow-700">
                節ごとにAI生成すると、用語の使い方や論調にブレが出ることがあります。<br />
                全体を通して読み返し、統一感を確認しましょう。
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-2">🎯 ターゲット読者を意識</h3>
              <p className="text-sm text-blue-700">
                AIはターゲット設定に基づいて文章を生成しますが、完璧ではありません。<br />
                「この読者にとって分かりやすいか？」を常に意識しながら編集しましょう。
              </p>
            </div>
          </div>
        </section>

        {/* セクション4: 執筆のベストプラクティス */}
        <section className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">執筆のベストプラクティス</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <p className="text-gray-700">まずAIで<strong>全体の骨格</strong>を作る（目次生成→一括執筆）</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <p className="text-gray-700">各節を読み返し、<strong>あなたの言葉で書き換え</strong>る</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <p className="text-gray-700"><strong>体験談・具体例</strong>を追加する</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
              <p className="text-gray-700">全体を通して読み、<strong>一貫性・流れ</strong>を確認する</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
              <p className="text-gray-700">数日置いてから<strong>もう一度読み返す</strong>（推敲）</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 text-center">
          <p className="text-gray-700 mb-4">
            準備はできましたか？さっそく執筆を始めましょう！
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/kindle/new"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <Sparkles size={20} />
              新しい本を作成
            </Link>
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










