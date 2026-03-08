import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Globe, Zap,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'Googleキーワードリサーチ | 集客メーカー',
  description:
    'Googleサジェストキーワードの自動展開＋allintitle競合分析。穴場キーワードを発見し、SEO対策を効率化。AI分析でコンテンツ戦略も提案。',
  keywords: ['Googleキーワードリサーチ', 'キーワード分析', 'SEO対策', 'allintitle', 'サジェストキーワード', '穴場キーワード'],
  openGraph: {
    title: 'Googleキーワードリサーチ | 集客メーカー',
    description: 'Googleサジェスト展開＋allintitle競合分析。穴場キーワードを発見し、SEO対策を効率化。',
    type: 'website',
    url: 'https://makers.tokyo/google-keyword-research',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'Googleキーワードリサーチ | 集客メーカー', description: 'Googleサジェスト展開＋allintitle競合分析ツール' },
  alternates: { canonical: 'https://makers.tokyo/google-keyword-research' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Googleキーワードリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Google検索のサジェストキーワード展開＋allintitle競合分析ツール。穴場キーワードの発見とAI分析に対応。',
      url: 'https://makers.tokyo/google-keyword-research',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: 'Proプランで利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Googleキーワードリサーチとは？', acceptedAnswer: { '@type': 'Answer', text: 'Googleのサジェスト機能を使ってキーワードを自動展開し、allintitle検索で競合の少ないキーワードを発見するツールです。' } },
        { '@type': 'Question', name: 'allintitleとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'Google検索で「allintitle:キーワード」と検索すると、タイトルにそのキーワードを含むページの数がわかります。この数が少ないほど競合が少なく、上位表示しやすいキーワードです。' } },
        { '@type': 'Question', name: 'どんな分析ができますか？', acceptedAnswer: { '@type': 'Answer', text: 'サジェストキーワードの一括展開、allintitle件数による競合度分析、AI によるSEO戦略提案、コンテンツアイデアの提案などが可能です。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'Googleキーワードリサーチ', item: 'https://makers.tokyo/google-keyword-research' },
      ],
    },
  ],
};

const features = [
  {
    icon: Search,
    title: 'サジェスト一括展開',
    description: 'a〜z・あ〜わの全パターンでGoogleサジェストを自動展開。100件以上のキーワード候補を瞬時に取得。',
  },
  {
    icon: BarChart3,
    title: 'allintitle競合分析',
    description: '各キーワードのallintitle件数を自動取得。競合の少ない穴場キーワードを数値で可視化。',
  },
  {
    icon: TrendingUp,
    title: '穴場スコア判定',
    description: 'allintitle件数から独自の穴場スコアを算出。ブルーオーシャンから激戦区まで一目で判別。',
  },
  {
    icon: Lightbulb,
    title: 'AI戦略分析',
    description: 'AIがキーワードデータを分析し、SEO戦略・コンテンツアイデア・ペルソナ分析を自動提案。',
  },
  {
    icon: Globe,
    title: 'ロングテール発掘',
    description: '3語以上の複合キーワードを発掘。検索意図別に分類し、成約に繋がるキーワードを特定。',
  },
  {
    icon: Zap,
    title: 'CSV一括エクスポート',
    description: '分析結果をCSVで一括ダウンロード。他ツールとの連携やチームでの共有に便利。',
  },
];

const steps = [
  {
    step: 1,
    title: 'キーワードを入力',
    description: '調べたいキーワードを入力するだけ。展開方式（アルファベット・ひらがな・両方）を選択できます。',
  },
  {
    step: 2,
    title: 'サジェスト＆競合度を確認',
    description: 'Googleサジェストが自動展開され、allintitle件数と穴場スコアが表示されます。ソート・フィルターで絞り込み可能。',
  },
  {
    step: 3,
    title: 'AI分析で戦略立案',
    description: 'AIが競合データを分析し、具体的なコンテンツ戦略・タイトル案・ペルソナ分析を提案します。',
  },
];

export default function GoogleKeywordResearchLanding() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Globe size={16} />
            <span>Google検索キーワード競合分析ツール</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">
            穴場キーワードを
            <br className="md:hidden" />
            <span className="text-yellow-300">一瞬で</span>発見
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Googleサジェストを自動展開し、allintitle件数で競合度を数値化。
            <br className="hidden md:block" />
            AIが最適なSEO戦略を提案します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/google-keyword-research/editor"
              className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              無料で始める
              <ArrowRight size={20} />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              詳しく見る
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
              6つの主要機能
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              キーワード発掘から競合分析、コンテンツ戦略まで一貫してサポート
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
              かんたん3ステップ
            </h2>
          </div>
          <div className="space-y-8">
            {steps.map((s) => (
              <div
                key={s.step}
                className="flex gap-6 items-start bg-gray-50 rounded-2xl p-6 border border-gray-200"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black mb-4">
            穴場キーワードを今すぐ発見
          </h2>
          <p className="text-white/80 mb-8">
            競合が少ないキーワードを見つけて、SEOで上位表示を狙いましょう
          </p>
          <Link
            href="/google-keyword-research/editor"
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Search size={20} />
            キーワードリサーチを始める
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-4">
            {[
              { q: 'allintitleとは何ですか？', a: 'Google検索で「allintitle:キーワード」と検索すると、ページタイトルにそのキーワードを含むページの数がわかります。この数が少ないほど競合が少なく、上位表示しやすいキーワードです。' },
              { q: '無料で使えますか？', a: 'サジェストキーワードの展開は無料です。allintitle件数の取得とAI分析はProプラン限定の機能です。' },
              { q: '1日何回まで使えますか？', a: 'サジェスト展開は制限なし。allintitle件数の取得はGoogle Custom Search APIの制限（無料枠100クエリ/日）に依存します。' },
              { q: 'YouTubeキーワードリサーチとの違いは？', a: 'YouTube版はYouTube動画の再生回数やチャンネル登録者数を分析します。Google版はGoogle検索のサジェストとallintitle件数で、ブログやWebサイトのSEO対策に特化しています。' },
            ].map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5 group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; 集客メーカー. All rights reserved.</p>
      </footer>
    </>
  );
}
