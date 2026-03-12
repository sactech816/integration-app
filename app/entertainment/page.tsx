import { Metadata } from 'next';
import Link from 'next/link';
import { PartyPopper, Sparkles, Share2, Wand2, Image, MessageCircle } from 'lucide-react';

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'エンタメ診断メーカー（AIでバズる診断を無料作成）| 集客メーカー',
  description:
    'AIと会話するだけで、どうぶつ占い・性格診断・脳内メーカーなどSNSでバズるエンタメ診断を無料作成。AI画像自動生成・OGPカード対応でSNS拡散に最適。最短3分で作成・公開できます。',
  keywords: [
    'エンタメ診断',
    '診断メーカー',
    'AI診断',
    'どうぶつ占い',
    '脳内メーカー',
    '性格診断',
    'SNS診断',
    '診断作成',
    '無料診断メーカー',
    '診断コンテンツ',
    'バズる診断',
    'OGP対応',
  ],
  openGraph: {
    title: 'エンタメ診断メーカー | 集客メーカー',
    description:
      'AIでバズるエンタメ診断を無料作成。どうぶつ占い・性格診断・脳内メーカーなど、AI画像付きの診断をすぐに作成・公開。',
    type: 'website',
    url: 'https://makers.tokyo/entertainment',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'エンタメ診断メーカー | 集客メーカー',
    description: 'AIでバズるエンタメ診断を無料作成。どうぶつ占い・性格診断・脳内メーカーなど最短3分で作成・公開。',
  },
  alternates: {
    canonical: 'https://makers.tokyo/entertainment',
  },
};

// ─── 構造化データ（JSON-LD） ──────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'エンタメ診断メーカー',
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Web',
      description:
        'AIと会話するだけで、どうぶつ占い・性格診断・脳内メーカーなどのエンタメ診断を作成できるツール。AI画像自動生成・OGPカード対応でSNS拡散に最適。',
      url: 'https://makers.tokyo/entertainment',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'JPY',
        description: '無料で作成・公開可能',
      },
      featureList: [
        'AIとの会話だけで診断を自動生成',
        'AI画像の自動生成',
        'OGPカード対応でSNS映え',
        'ワンタップSNSシェア',
        'スマートフォン完全対応',
      ],
      provider: {
        '@type': 'Organization',
        name: '集客メーカー',
        url: 'https://makers.tokyo',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'エンタメ診断はどうやって作りますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AIに「どうぶつ占い作りたい」のように伝えるだけで、質問・結果タイプ・AI画像をすべて自動生成します。専門知識は不要で、最短3分で作成・公開できます。',
          },
        },
        {
          '@type': 'Question',
          name: 'エンタメ診断は無料で作れますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'はい、エンタメ診断の作成・公開は無料でご利用いただけます。AI画像の生成やOGPカードの自動生成もすべて無料です。',
          },
        },
        {
          '@type': 'Question',
          name: 'SNSでシェアできますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'はい、OGPカードが自動生成されるため、X（Twitter）・LINE・Instagram等でシェアすると結果画像付きで表示されます。「わたしは〇〇タイプでした！」のような拡散が期待できます。',
          },
        },
        {
          '@type': 'Question',
          name: 'どんな診断が作れますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'どうぶつ占い・脳内メーカー・推しキャラ診断・前世診断・恋愛パターン診断など、あらゆるジャンルのエンタメ診断が作れます。テーマを伝えるだけでAIが最適な設問と結果を生成します。',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'エンタメ診断', item: 'https://makers.tokyo/entertainment' },
      ],
    },
  ],
};

const faqs = [
  { q: 'エンタメ診断はどうやって作りますか？', a: 'AIに「どうぶつ占い作りたい」のように伝えるだけで、質問・結果タイプ・AI画像をすべて自動生成します。専門知識は不要で、最短3分で作成・公開できます。' },
  { q: 'エンタメ診断は無料で作れますか？', a: 'はい、エンタメ診断の作成・公開は無料でご利用いただけます。AI画像の生成やOGPカードの自動生成もすべて無料です。' },
  { q: 'SNSでシェアできますか？', a: 'はい、OGPカードが自動生成されるため、X（Twitter）・LINE・Instagram等でシェアすると結果画像付きで表示されます。「わたしは〇〇タイプでした！」のような拡散が期待できます。' },
  { q: 'どんな診断が作れますか？', a: 'どうぶつ占い・脳内メーカー・推しキャラ診断・前世診断・恋愛パターン診断など、あらゆるジャンルのエンタメ診断が作れます。テーマを伝えるだけでAIが最適な設問と結果を生成します。' },
];

export default function EntertainmentLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          楽しいエンタメ診断を無料ですぐに作成できます
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

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <summary data-speakable="question" className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                  <span>{faq.q}</span>
                  <span className="text-pink-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
              </details>
            ))}
          </div>
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
