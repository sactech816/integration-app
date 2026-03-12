import { Metadata } from 'next';
import Link from 'next/link';
import {
  Share2, MessageSquare, Hash, Sparkles,
  CheckCircle2, ArrowRight, ChevronRight, Globe, PenTool, Copy,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'SNS投稿メーカー（SNS投稿文作成ツール）【無料】| 集客メーカー',
  description:
    'SNS投稿文を無料で作成。X（Twitter）・Instagram・Threads対応、AIが自動生成。プラットフォーム別の文字数最適化・ハッシュタグ提案・トーン選択で、効果的なSNS投稿を数秒で作成。',
  keywords: ['SNS投稿', 'SNS投稿作成', 'Twitter投稿', 'Instagram投稿', 'Threads', 'AI投稿生成', 'ハッシュタグ', '無料'],
  openGraph: {
    title: 'SNS投稿メーカー | 集客メーカー',
    description: 'X・Instagram・Threads対応。AIでSNS投稿文を自動生成。プラットフォーム最適化・ハッシュタグ提案付き。',
    type: 'website',
    url: 'https://makers.tokyo/sns-post',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'SNS投稿メーカー | 集客メーカー', description: 'AIでSNS投稿文を自動生成。X・Instagram・Threads対応。' },
  alternates: { canonical: 'https://makers.tokyo/sns-post' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'SNS投稿メーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'SNS投稿文作成ツール。X・Instagram・Threads対応。AIによる投稿文自動生成・ハッシュタグ提案・トーン選択機能。',
      url: 'https://makers.tokyo/sns-post',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'どのSNSに対応していますか？', acceptedAnswer: { '@type': 'Answer', text: 'X（Twitter）・Instagram・Threadsの3つのプラットフォームに対応しています。各プラットフォームの文字数制限に合わせて最適化された投稿文を生成します。' } },
        { '@type': 'Question', name: 'AIはどのように投稿文を生成しますか？', acceptedAnswer: { '@type': 'Answer', text: 'トピックを入力し、プラットフォームとトーン（ビジネス・カジュアル・教育・エンタメ・インスピレーション）を選択するだけで、AIが最適化された投稿文を自動生成します。' } },
        { '@type': 'Question', name: 'ハッシュタグも自動で提案されますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。投稿内容に関連するハッシュタグをAIが自動提案します。Instagramでは最大30個まで対応しています。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。SNS投稿の作成・公開は無料でご利用いただけます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'SNS投稿メーカー', item: 'https://makers.tokyo/sns-post' },
      ],
    },
  ],
};

const features = [
  { icon: Sparkles, iconClass: 'text-rose-600', bgClass: 'bg-rose-100', title: 'AIが投稿文を自動生成', desc: 'トピックを入力するだけで、プラットフォームに最適化された投稿文をAIが自動で作成。文字数制限も自動で調整します。' },
  { icon: Share2, iconClass: 'text-pink-600', bgClass: 'bg-pink-100', title: '3つのSNSに対応', desc: 'X（Twitter）・Instagram・Threadsに対応。各プラットフォームの文字数制限・特性に合わせた投稿文を生成します。' },
  { icon: Hash, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: 'ハッシュタグを自動提案', desc: '投稿内容に関連するハッシュタグをAIが自動提案。リーチを最大化する効果的なタグを選べます。' },
  { icon: MessageSquare, iconClass: 'text-rose-700', bgClass: 'bg-rose-50', title: '5つのトーンから選択', desc: 'ビジネス・カジュアル・教育・エンタメ・インスピレーションの5つのトーンから、目的に合った文体を選べます。' },
];

const steps = [
  { num: '01', title: 'トピックとプラットフォームを選択', desc: '投稿したいトピックを入力し、X・Instagram・Threadsからプラットフォームを選択。', icon: PenTool },
  { num: '02', title: 'AIが投稿文を自動生成', desc: 'トーンを選んで生成ボタンを押すだけ。数秒で最適化された投稿文が完成。', icon: Sparkles },
  { num: '03', title: 'コピーして投稿', desc: 'ワンクリックで投稿文をコピー。そのままSNSに貼り付けて投稿できます。', icon: Copy },
];

const useCases = [
  { profession: '個人事業主・フリーランス', title: '毎日のSNS発信を効率化', desc: '忙しい日々でもAIが投稿文を提案。ビジネスの認知度向上に必要な継続的な発信をサポートします。', emoji: '💼', badge: '発信力の向上に' },
  { profession: 'ECショップ・ネットショップ', title: '商品紹介の投稿を作成', desc: '新商品・セール情報・キャンペーン告知の投稿文を素早く作成。複数SNSへの同時展開も簡単。', emoji: '🛍️', badge: '売上アップに' },
  { profession: 'コンテンツクリエイター', title: 'マルチプラットフォーム運用', desc: 'X・Instagram・Threadsそれぞれに最適化された投稿文を一度に生成。各SNSの特性を活かした発信ができます。', emoji: '🎨', badge: 'ファン獲得に' },
  { profession: 'コーチ・コンサルタント', title: '専門知識を発信', desc: '教育・インスピレーション系のトーンで専門知識をわかりやすく発信。信頼構築につながる投稿を効率的に作成。', emoji: '📚', badge: '権威性の構築に' },
];

const faqs = [
  { q: 'どのSNSに対応していますか？', a: 'X（Twitter）・Instagram・Threadsの3つのプラットフォームに対応しています。各プラットフォームの文字数制限（X: 280文字、Instagram: 2,200文字、Threads: 500文字）に合わせて最適化されます。' },
  { q: 'AIはどのように投稿文を生成しますか？', a: 'トピックを入力し、プラットフォームとトーン（ビジネス・カジュアル・教育・エンタメ・インスピレーション）を選択するだけで、AIが最適化された投稿文を自動生成します。' },
  { q: 'ハッシュタグも自動で提案されますか？', a: 'はい。投稿内容に関連するハッシュタグをAIが自動提案します。Instagramでは最大30個まで対応しています。' },
  { q: '作成した投稿を保存できますか？', a: 'はい。作成した投稿は下書きとして保存したり、公開URLを発行して共有することもできます。' },
  { q: '無料で使えますか？', a: 'はい。SNS投稿の作成・公開は無料でご利用いただけます。' },
];

export default function SNSPostLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="sns-post" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-rose-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold mb-6">
              <Share2 className="w-4 h-4" />
              X・Instagram・Threadsに対応
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              SNS投稿を<br />
              <span className="text-rose-600">AIで素早く作成</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              トピックを入力するだけで、各SNSに最適化された投稿文を自動生成。
              <br className="hidden sm:block" />
              ハッシュタグ提案・トーン選択で、効果的な発信をサポートします。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sns-post/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Sparkles className="w-5 h-5" />
                無料でSNS投稿を作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-semibold text-lg rounded-xl border border-rose-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AI自動生成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />ワンクリックコピー</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">SNS投稿メーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">AIの力で、プラットフォームに最適化されたSNS投稿を数秒で作成できます。</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className={`w-12 h-12 mb-4 ${f.bgClass} rounded-xl flex items-center justify-center`}>
                  <f.icon className={`w-6 h-6 ${f.iconClass}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでSNS投稿を作成</h2>
            <p className="text-gray-600 text-center mb-12">トピックを入力するだけ。数秒で投稿文が完成します</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-rose-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-rose-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-rose-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/sns-post/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Sparkles className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">あらゆる業種のSNSマーケティング・情報発信に活用できます</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-rose-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
                    <h3 className="font-bold text-gray-900 mb-2">「{uc.title}」</h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{uc.desc}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />{uc.badge}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <summary data-speakable="question" className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-rose-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐSNS投稿を作ってみよう</h2>
            <p className="text-rose-100 mb-8 text-lg">AIが最適な投稿文を自動生成。数秒で完成します。</p>
            <Link href="/sns-post/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Sparkles className="w-5 h-5" />無料でSNS投稿を作る
            </Link>
            <p className="text-rose-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
