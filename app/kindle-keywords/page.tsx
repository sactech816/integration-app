import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Search, Palette,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'Kindleリサーチ（キーワード分析・市場調査）| 集客メーカー',
  description:
    'Amazon Kindleの市場をAIで分析。キーワード調査、競合分析、価格帯・表紙トレンドを把握してKindle出版を成功に導くリサーチツール。',
  keywords: ['Kindleリサーチ', 'Kindle出版', 'キーワード分析', 'Amazon分析', '市場調査', 'KDP', 'Kindle直接出版'],
  openGraph: {
    title: 'Kindleリサーチ | 集客メーカー',
    description: 'Amazon Kindleの市場をAIで分析。キーワード調査・競合分析でKindle出版を成功に。',
    type: 'website',
    url: 'https://makers.tokyo/kindle-keywords',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'Kindleリサーチ | 集客メーカー', description: 'Amazon Kindleの市場をAIで分析。キーワード調査・競合分析。' },
  alternates: { canonical: 'https://makers.tokyo/kindle-keywords' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Kindleリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Amazon Kindleの市場分析ツール。キーワード調査、競合分析、価格帯・表紙トレンドを把握。',
      url: 'https://makers.tokyo/kindle-keywords',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Kindleリサーチとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'Amazon Kindleストアのキーワード検索結果をスクレイピングし、AIが市場の飽和度・価格帯・表紙デザインのトレンドなどを分析するツールです。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: 'どんな分析ができますか？', acceptedAnswer: { '@type': 'Answer', text: '市場の飽和度スコア、推奨価格帯、タイトル案、表紙デザインのトレンド、カテゴリ推奨、キーワード最適化のアドバイスなどが得られます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'Kindleリサーチ', item: 'https://makers.tokyo/kindle-keywords' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: 'キーワードサジェスト', desc: 'Amazonの検索サジェストを自動取得。読者が実際に検索しているキーワードを一覧で確認できます。' },
  { icon: BarChart3, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: '市場飽和度分析', desc: 'キーワードごとの競合状況をスコアで可視化。参入しやすいブルーオーシャンを見つけられます。' },
  { icon: TrendingUp, iconClass: 'text-orange-700', bgClass: 'bg-orange-50', title: '価格帯・レビュー分析', desc: '上位書籍の価格帯、レビュー数、評価をまとめて分析。最適な価格設定の判断材料に。' },
  { icon: Palette, iconClass: 'text-amber-700', bgClass: 'bg-amber-50', title: '表紙トレンド分析', desc: 'AIが上位書籍の表紙デザインの傾向を分析。売れる表紙のカラー・レイアウトパターンを把握。' },
];

const steps = [
  { num: '01', title: 'キーワードを入力', desc: 'リサーチしたいジャンルやテーマのキーワードを入力します。', icon: Search },
  { num: '02', title: '上位書籍を自動分析', desc: 'Amazon Kindleストアの上位20冊を自動でスクレイピング・分析します。', icon: BarChart3 },
  { num: '03', title: 'AI分析レポート', desc: '市場の飽和度・推奨価格・タイトル案・表紙トレンドをAIがレポート。', icon: Lightbulb },
];

const useCases = [
  { profession: 'Kindle著者・作家', title: '新刊テーマの市場調査', desc: '出版前にキーワードの競合状況を分析。需要があって競合が少ないテーマを見つけて、売れる本を企画。', emoji: '📚', badge: '売上アップに' },
  { profession: 'KDP初心者', title: '最初の1冊のテーマ選び', desc: 'どんなジャンルが売れているか、どれくらい競合がいるかを把握。データに基づいた確実なテーマ選びに。', emoji: '🔰', badge: '初出版の参考に' },
  { profession: 'コンサルタント・コーチ', title: '出版ブランディング', desc: '自分の専門分野のKindle市場を分析。差別化ポイントを見つけて、権威性を高める書籍を出版。', emoji: '💼', badge: 'ブランディングに' },
  { profession: 'コンテンツクリエイター', title: 'コンテンツの横展開', desc: 'ブログやYouTubeのコンテンツをKindle化する際に、市場のニーズを確認。最適なタイトルと価格設定に。', emoji: '🎬', badge: 'コンテンツ活用に' },
];

const faqs = [
  { q: 'Kindleリサーチとは何ですか？', a: 'Amazon Kindleストアのキーワード検索結果を分析し、市場の飽和度・価格帯・表紙デザインのトレンドなどをAIがレポートするツールです。' },
  { q: '無料で使えますか？', a: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' },
  { q: 'どんな分析ができますか？', a: '市場の飽和度スコア、推奨価格帯、タイトル案、表紙デザインのトレンド、カテゴリ推奨、キーワード最適化のアドバイスなどが得られます。' },
  { q: 'Amazon APIの設定は必要ですか？', a: 'いいえ、APIの設定は不要です。キーワードを入力するだけで分析を開始できます。' },
  { q: 'どの国のAmazonに対応していますか？', a: '現在はAmazon.co.jp（日本）のKindleストアに対応しています。' },
];

export default function KindleKeywordsLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
              <BookOpen className="w-4 h-4" />
              Kindle市場分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Kindle市場を<br />
              <span className="text-orange-600">AIでリサーチ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              キーワード分析・競合調査・価格帯把握を
              <br className="hidden sm:block" />
              AIがサポート。Kindle出版を成功に導きます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/kindle-keywords/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                リサーチを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold text-lg rounded-xl border border-orange-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />市場分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />キーワード調査</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AI分析レポート</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">Kindleリサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいたKindle出版戦略で、売れる本を企画できます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでリサーチ</h2>
            <p className="text-gray-600 text-center mb-12">キーワードを入力するだけで、AIが市場分析レポートを生成</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-orange-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-orange-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-orange-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/kindle-keywords/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />リサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいたKindle出版戦略で、効率的に売れる本を企画しましょう</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-orange-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Kindleリサーチを始めよう</h2>
            <p className="text-orange-100 mb-8 text-lg">AIがあなたのKindle出版をサポート。市場分析からキーワード選定まで、すべて無料で使えます。</p>
            <Link href="/kindle-keywords/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />リサーチを始める
            </Link>
            <p className="text-orange-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
