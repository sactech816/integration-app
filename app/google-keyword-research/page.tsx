import { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Search, Target,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'Googleリサーチ（キーワード分析・SEO調査）| 集客メーカー',
  description:
    'Google検索のキーワード調査をAIでサポート。allintitle分析でブルーオーシャンキーワードを発見。SEO対策・コンテンツ戦略に最適。',
  keywords: ['Googleリサーチ', 'キーワード調査', 'SEO分析', 'allintitle', 'ブルーオーシャン', 'キーワードリサーチ', 'SEO対策'],
  openGraph: {
    title: 'Googleリサーチ | 集客メーカー',
    description: 'Google検索のキーワード調査をAIでサポート。ブルーオーシャンキーワードを発見。',
    type: 'website',
    url: 'https://makers.tokyo/google-keyword-research',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'Googleリサーチ | 集客メーカー', description: 'Google検索のキーワード調査をAIでサポート。' },
  alternates: { canonical: 'https://makers.tokyo/google-keyword-research' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Googleリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Google検索のキーワード調査ツール。allintitle分析でブルーオーシャンキーワードを発見。',
      url: 'https://makers.tokyo/google-keyword-research',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Googleリサーチとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'Googleサジェストキーワードを自動展開し、allintitle検索で競合数を分析することで、ブルーオーシャン（競合が少ない穴場キーワード）を発見するツールです。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: 'allintitle分析とは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'allintitleはGoogle検索のコマンドで、タイトルにキーワードが含まれるページ数を調べます。この数が少ないほど競合が少なく、上位表示しやすいキーワードです。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'Googleリサーチ', item: 'https://makers.tokyo/google-keyword-research' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-teal-600', bgClass: 'bg-teal-100', title: 'サジェスト自動展開', desc: 'キーワードにa-z・あ-わを自動追加してGoogleサジェストを網羅的に取得。隠れたキーワードを発見します。' },
  { icon: Target, iconClass: 'text-cyan-600', bgClass: 'bg-cyan-100', title: 'allintitle競合分析', desc: '最大50キーワードのallintitle件数を一括取得。競合の少ないブルーオーシャンキーワードを自動判定。' },
  { icon: TrendingUp, iconClass: 'text-teal-700', bgClass: 'bg-teal-50', title: 'チャンススコア', desc: 'allintitle件数から0〜100のチャンススコアを算出。数値で穴場度合いを一目で把握できます。' },
  { icon: Lightbulb, iconClass: 'text-cyan-700', bgClass: 'bg-cyan-50', title: 'AI戦略分析（6種類）', desc: '市場分析・競合分析・コンテンツ案・ロングテール提案・ペルソナ分析・タイトルパターンの6つの分析を提供。' },
];

const steps = [
  { num: '01', title: 'キーワードを入力', desc: 'リサーチしたいメインキーワードを入力。展開方法（アルファベット/ひらがな）を選択します。', icon: Search },
  { num: '02', title: 'サジェスト＆allintitle分析', desc: 'Googleサジェストを自動展開し、allintitle件数で競合数を一括分析します。', icon: BarChart3 },
  { num: '03', title: 'AI戦略レポート', desc: 'ブルーオーシャンキーワードの特定・コンテンツ案・SEO戦略をAIが提案。', icon: Lightbulb },
];

const useCases = [
  { profession: 'ブロガー・アフィリエイター', title: '穴場キーワードの発掘', desc: '競合が少ないブルーオーシャンキーワードを発見。allintitle分析で上位表示しやすい記事テーマを効率的に選定。', emoji: '✍️', badge: 'SEO対策に' },
  { profession: 'Web担当者・マーケター', title: 'コンテンツマーケティング戦略', desc: 'サジェストキーワードを網羅的に分析し、ユーザーのニーズを把握。データに基づいたコンテンツ計画を立案。', emoji: '📊', badge: '戦略立案に' },
  { profession: 'コンサルタント・コーチ', title: '集客コンテンツの企画', desc: '見込み客が検索するキーワードを発見。競合が少ないテーマでブログやLPを作り、集客を加速。', emoji: '💼', badge: '集客強化に' },
  { profession: 'EC・D2Cブランド', title: '商品ページのSEO対策', desc: '商品に関連するキーワードの競合状況を分析。allintitle数の少ないキーワードで商品ページの検索順位を向上。', emoji: '🛍️', badge: '検索流入アップに' },
];

const faqs = [
  { q: 'Googleリサーチとは何ですか？', a: 'Googleサジェストキーワードを自動展開し、allintitle検索で競合数を分析することで、ブルーオーシャン（競合が少ない穴場キーワード）を発見するツールです。' },
  { q: '無料で使えますか？', a: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' },
  { q: 'allintitle分析とは何ですか？', a: 'allintitleはGoogle検索のコマンドで、タイトルにキーワードが含まれるページ数を調べます。この数が少ないほど競合が少なく、上位表示しやすいキーワードです。' },
  { q: 'どのくらいのキーワードを分析できますか？', a: '1回の分析で最大50キーワードのallintitle件数を一括取得できます。サジェストの展開数に制限はありません。' },
  { q: 'AI分析にはどんな種類がありますか？', a: '全体分析・競合分析・コンテンツアイデア・ロングテールキーワード提案・ペルソナ分析・タイトルパターン最適化の6種類の分析を提供しています。' },
];

export default function GoogleKeywordResearchLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-teal-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              SEOキーワード分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              ブルーオーシャンを<br />
              <span className="text-teal-600">AIで発見</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              サジェスト展開・allintitle分析で
              <br className="hidden sm:block" />
              競合の少ない穴場キーワードを自動発見。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/google-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                リサーチを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 font-semibold text-lg rounded-xl border border-teal-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />キーワード調査</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />allintitle分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />ブルーオーシャン発見</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">Googleリサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいたSEO戦略で、検索からの集客を最大化します。</p>
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
            <p className="text-gray-600 text-center mb-12">キーワードを入力するだけで、AIが競合分析レポートを生成</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-teal-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-teal-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/google-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />リサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいたSEO戦略で、効率的に検索からの集客を伸ばしましょう</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-teal-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-teal-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Googleリサーチを始めよう</h2>
            <p className="text-teal-100 mb-8 text-lg">AIがあなたのSEO戦略をサポート。ブルーオーシャンキーワードの発見からコンテンツ企画まで、すべて無料で使えます。</p>
            <Link href="/google-keyword-research/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />リサーチを始める
            </Link>
            <p className="text-teal-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
