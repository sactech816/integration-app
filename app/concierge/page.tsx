import { Metadata } from 'next';
import Link from 'next/link';
import {
  Bot, MessageSquare, Palette, Code2,
  CheckCircle2, ChevronRight, Settings, Sparkles,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'コンシェルジュメーカー（AIチャットボット作成）| 集客メーカー',
  description:
    'AIコンシェルジュを簡単作成。あなたのサイトにAIチャットボットを設置して、訪問者の質問に24時間自動応答。カスタマイズ自在で、ブランドに合わせたデザイン・応答内容を設定できます。',
  keywords: ['AIチャットボット', 'コンシェルジュ', 'チャットボット作成', 'AI接客', '自動応答', 'カスタマーサポート'],
  openGraph: {
    title: 'コンシェルジュメーカー | 集客メーカー',
    description: 'AIコンシェルジュを簡単作成。サイト訪問者の質問に24時間自動応答。',
    type: 'website',
    url: 'https://makers.tokyo/concierge',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'コンシェルジュメーカー | 集客メーカー', description: 'AIコンシェルジュを簡単作成。サイト訪問者に24時間自動応答。' },
  alternates: { canonical: 'https://makers.tokyo/concierge' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'コンシェルジュメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AIコンシェルジュ作成ツール。サイトにAIチャットボットを設置して訪問者の質問に24時間自動応答。',
      url: 'https://makers.tokyo/concierge',
      offers: { '@type': 'Offer', priceCurrency: 'JPY', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'コンシェルジュメーカーとは？', acceptedAnswer: { '@type': 'Answer', text: 'AIを活用したチャットボットを作成し、あなたのWebサイトに設置できるツールです。訪問者の質問に24時間自動で応答し、顧客対応の効率化や離脱防止に貢献します。' } },
        { '@type': 'Question', name: 'プログラミング知識は必要ですか？', acceptedAnswer: { '@type': 'Answer', text: 'いいえ。管理画面から名前・挨拶文・応答ルール・デザインを設定するだけで、AIチャットボットが完成します。埋め込みコードをコピーするだけでサイトに設置できます。' } },
        { '@type': 'Question', name: 'どんな質問に答えられますか？', acceptedAnswer: { '@type': 'Answer', text: 'あなたが設定したナレッジ（FAQ・サービス情報など）をもとにAIが自動で回答します。回答内容はいつでも追加・編集可能です。' } },
        { '@type': 'Question', name: '料金はかかりますか？', acceptedAnswer: { '@type': 'Answer', text: 'コンシェルジュメーカーはプレミアムプランでご利用いただける機能です。まずは右下のメイカーくん（AIコンシェルジュ）でAI応答を体験してみてください。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'コンシェルジュメーカー', item: 'https://makers.tokyo/concierge' },
      ],
    },
  ],
};

const features = [
  { icon: Bot, iconClass: 'text-blue-600', bgClass: 'bg-blue-100', title: 'AIが24時間自動応答', desc: '訪問者の質問にAIが即座に回答。営業時間外でも顧客対応が可能になり、機会損失を防ぎます。' },
  { icon: Palette, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: 'ブランドに合わせたデザイン', desc: 'カラーテーマ・バブルサイズ・配置位置をカスタマイズ。あなたのサイトに自然に溶け込むデザインに。' },
  { icon: Settings, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: 'ナレッジ設定で的確な回答', desc: 'FAQ・サービス情報・よくある質問を登録するだけ。AIがコンテキストを理解して適切に回答します。' },
  { icon: Code2, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: 'コピペで簡単設置', desc: '埋め込みコードをコピーしてサイトに貼るだけ。WordPressやHTML、どんなサイトにも対応します。' },
];

const steps = [
  { num: '01', title: '基本情報を設定', desc: 'コンシェルジュの名前・挨拶文・性格を決めて、応答スタイルをカスタマイズ。', icon: MessageSquare },
  { num: '02', title: 'ナレッジ・デザインを設定', desc: 'FAQ情報を追加し、サイトのブランドに合ったカラーテーマを選択。', icon: Palette },
  { num: '03', title: '埋め込みコードで設置', desc: '生成された埋め込みコードをサイトに貼るだけ。すぐにAI応答が開始されます。', icon: Code2 },
];

const useCases = [
  { profession: 'ECサイト・オンラインショップ', title: '商品に関する質問を自動応答', desc: 'サイズ・在庫・配送・返品に関する質問にAIが即座に回答。カスタマーサポートの負荷を大幅軽減。', emoji: '🛒', badge: '問い合わせ削減に' },
  { profession: 'コンサル・コーチ・講師', title: 'サービス内容の質問に24時間対応', desc: '料金・プラン・申し込み方法に関する質問に自動応答。見込み客の離脱を防ぎ、申し込み率を向上。', emoji: '💼', badge: '成約率アップに' },
  { profession: 'SaaS・Webサービス', title: '使い方ガイドを自動案内', desc: '機能の使い方・トラブルシューティングをAIが案内。ユーザーのセルフサービス率を向上させます。', emoji: '💻', badge: 'サポート効率化に' },
  { profession: '飲食・美容・サロン', title: '予約・営業時間の自動案内', desc: '営業時間・メニュー・予約に関する質問に自動応答。電話対応の手間を削減し、本業に集中できます。', emoji: '✂️', badge: '電話対応削減に' },
];

const faqs = [
  { q: 'コンシェルジュメーカーとは？', a: 'AIを活用したチャットボットを作成し、あなたのWebサイトに設置できるツールです。訪問者の質問に24時間自動で応答し、顧客対応の効率化や離脱防止に貢献します。' },
  { q: 'プログラミング知識は必要ですか？', a: 'いいえ。管理画面から名前・挨拶文・応答ルール・デザインを設定するだけで、AIチャットボットが完成します。埋め込みコードをコピーするだけでサイトに設置できます。' },
  { q: 'どんな質問に答えられますか？', a: 'あなたが設定したナレッジ（FAQ・サービス情報など）をもとにAIが自動で回答します。回答内容はいつでも追加・編集可能です。' },
  { q: '料金はかかりますか？', a: 'コンシェルジュメーカーはプレミアムプランでご利用いただける機能です。まずはこのページ右下のメイカーくん（AIコンシェルジュ）で、AI自動応答を体験してみてください。' },
  { q: 'どんなサイトに設置できますか？', a: 'HTML・WordPress・Shopify・Wixなど、JavaScriptの埋め込みに対応したあらゆるWebサイトに設置できます。' },
];

export default function ConciergeLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="quiz" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Bot className="w-4 h-4" />
              AIコンシェルジュ作成ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              あなたのサイトに<br />
              <span className="text-blue-600">AIコンシェルジュ</span>を設置
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              訪問者の質問にAIが24時間自動応答。
              <br className="hidden sm:block" />
              カスタマイズ自在で、あなたのブランドに合わせたチャットボットを簡単作成。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/concierge/editor?new" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Bot className="w-5 h-5" />
                コンシェルジュを作成する
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />プログラミング不要</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />24時間自動応答</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" />プレミアムプラン機能</span>
            </div>

            {/* メイカーくん体験案内 */}
            <div className="mt-10 max-w-md mx-auto bg-white border border-blue-200 rounded-2xl shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">まずはメイカーくんを体験！</p>
                  <p className="text-xs text-gray-500">右下のチャットアイコンをクリック →</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                このページの右下にある<span className="font-semibold text-blue-600">メイカーくん（AIコンシェルジュ）</span>で、AI自動応答を体験できます。実際にメッセージを送って、コンシェルジュの応答をお試しください。
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">コンシェルジュメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">作成からサイト設置まで、AIチャットボットに必要な機能をすべて備えています。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでAIコンシェルジュ完成</h2>
            <p className="text-gray-600 text-center mb-12">数分で作成完了。すぐにサイトに設置できます</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-blue-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-blue-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/concierge/editor?new" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Bot className="w-5 h-5" />今すぐ作成する
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">あらゆる業種のWebサイトにAIコンシェルジュを導入できます</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
                    <h3 className="font-bold text-gray-900 mb-2">{uc.title}</h3>
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
                    <span className="text-blue-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">AIコンシェルジュを体験してみよう</h2>
            <p className="text-blue-100 mb-8 text-lg">まずは右下のメイカーくんでAI応答を体験。<br className="hidden sm:block" />プレミアムプランであなた専用のコンシェルジュを作成できます。</p>
            <Link href="/concierge/editor?new" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Bot className="w-5 h-5" />コンシェルジュを作成する
            </Link>
            <p className="text-blue-200 text-sm mt-4">プレミアムプラン限定機能</p>
          </div>
        </section>
      </div>
    </>
  );
}
