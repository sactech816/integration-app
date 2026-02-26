import { Metadata } from 'next';
import Link from 'next/link';
import { PartyPopper, Sparkles, Share2, Wand2, Image, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'エンタメ診断メーカー | 集客メーカー',
  description: 'AIと会話するだけで、楽しいエンタメ診断を簡単作成。どうぶつ占い、性格診断、脳内メーカーなど、SNSでバズる診断をすぐに作れます。',
};

export default function EntertainmentLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* ヒーロー */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-6">
          <PartyPopper className="w-4 h-4" />
          AIで簡単作成
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          エンタメ診断メーカー
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          AIと会話するだけで、どうぶつ占い・性格診断・脳内メーカーのような
          <br className="hidden sm:block" />
          楽しいエンタメ診断をすぐに作成できます
        </p>
        <Link
          href="/entertainment/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500
            text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl
            transition-all duration-200 active:scale-95 min-h-[44px]"
        >
          <Wand2 className="w-5 h-5" />
          無料で診断を作る
        </Link>
      </section>

      {/* 特長 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">3つの特長</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-pink-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-pink-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AIと会話するだけ</h3>
            <p className="text-sm text-gray-600">
              「どうぶつ占い作りたい」と伝えるだけ。AIが質問・結果・画像をすべて自動生成します
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Image className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AI画像も自動生成</h3>
            <p className="text-sm text-gray-600">
              結果タイプごとのイラストをAIが自動生成。SNS映えする結果カードが出来上がります
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Share2 className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">SNSでバズる</h3>
            <p className="text-sm text-gray-600">
              OGPカード自動生成・ワンタップシェア。「わたしは〇〇タイプでした！」で拡散されます
            </p>
          </div>
        </div>
      </section>

      {/* 作れる診断の例 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">こんな診断が作れます</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'どうぶつ占い', desc: 'あなたを動物に例えると？性格から動物タイプを診断', emoji: '🐱' },
            { title: '脳内メーカー', desc: 'あなたの頭の中を覗いてみよう！脳内タイプを診断', emoji: '🧠' },
            { title: '推しキャラ診断', desc: '性格から相性の良いキャラクタータイプを判定', emoji: '💫' },
            { title: '前世診断', desc: 'あなたの前世は何だった？性格から前世タイプを判定', emoji: '🔮' },
            { title: 'ラーメン診断', desc: '好みの傾向からピッタリのラーメンタイプを診断', emoji: '🍜' },
            { title: '恋愛パターン診断', desc: 'あなたの恋愛スタイルをタイプ別に診断', emoji: '💕' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{item.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          今すぐエンタメ診断を作ってみよう
        </h2>
        <p className="text-gray-600 mb-8">無料で作成・公開できます</p>
        <Link
          href="/entertainment/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500
            text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl
            transition-all duration-200 active:scale-95 min-h-[44px]"
        >
          <Sparkles className="w-5 h-5" />
          エンタメ診断を作る
        </Link>
      </section>
    </div>
  );
}
