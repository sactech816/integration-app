import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingBag, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Search, Tags,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: '楽天リサーチ（市場分析・競合調査）| 集客メーカー',
  description:
    '楽天市場の商品リサーチ・競合分析をAIでサポート。価格帯・レビュー・キーワード分析で、出品戦略を最適化。',
  keywords: ['楽天リサーチ', '楽天市場', '商品リサーチ', '競合分析', '価格分析', '楽天出品', '市場調査'],
  openGraph: {
    title: '楽天リサーチ | 集客メーカー',
    description: '楽天市場の商品リサーチ・競合分析をAIでサポート。出品戦略を最適化。',
    type: 'website',
    url: 'https://makers.tokyo/rakuten-research',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: '楽天リサーチ | 集客メーカー', description: '楽天市場の商品リサーチ・競合分析をAIでサポート。' },
  alternates: { canonical: 'https://makers.tokyo/rakuten-research' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '楽天リサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: '楽天市場の商品リサーチ・競合分析ツール。価格帯・レビュー・キーワード分析に対応。',
      url: 'https://makers.tokyo/rakuten-research',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: '楽天リサーチとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: '楽天市場の商品データを分析し、価格帯・レビュー・キーワードの傾向をAIがレポートするツールです。出品戦略の立案に役立ちます。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: 'どんな分析ができますか？', acceptedAnswer: { '@type': 'Answer', text: '市場参入スコア、価格戦略、キーワード分析、ページ最適化、競合分析、アクションプランなどが得られます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: '楽天リサーチ', item: 'https://makers.tokyo/rakuten-research' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-rose-600', bgClass: 'bg-rose-100', title: '商品リサーチ', desc: '楽天市場の商品データを最大90件まで一括取得。価格・レビュー・評価・送料情報をまとめて分析できます。' },
  { icon: BarChart3, iconClass: 'text-pink-600', bgClass: 'bg-pink-100', title: '価格帯分析', desc: '平均価格・中央値・最高値・最低値を自動計算。トップ10の平均価格も表示して、最適な価格設定を判断。' },
  { icon: Tags, iconClass: 'text-rose-700', bgClass: 'bg-rose-50', title: 'キーワード抽出', desc: '売れ筋商品のタイトル・説明文から頻出キーワードを自動抽出。SEOに強い商品名の作成に活用。' },
  { icon: Lightbulb, iconClass: 'text-pink-700', bgClass: 'bg-pink-50', title: 'AIコンサルティング', desc: '市場参入スコア・価格戦略・差別化ポイント・具体的なアクションプランをAIが提案。' },
];

const steps = [
  { num: '01', title: 'キーワードを入力', desc: 'リサーチしたい商品ジャンルやキーワードを入力します。', icon: Search },
  { num: '02', title: '楽天市場を自動分析', desc: '楽天APIで最大90商品を取得し、価格・レビュー・キーワードを分析します。', icon: BarChart3 },
  { num: '03', title: 'AI戦略レポート', desc: '市場参入の判断・価格戦略・キーワード戦略をAIがコンサルティング。', icon: Lightbulb },
];

const useCases = [
  { profession: '楽天出品者・EC事業者', title: '新商品の市場調査', desc: '出品前にキーワードの競合状況と価格帯を分析。需要があって差別化できるポジションを見つけて、売れる商品を企画。', emoji: '🛒', badge: '売上アップに' },
  { profession: 'EC初心者・副業', title: '参入ジャンルの選定', desc: 'どんなジャンルが売れているか、競合の強さはどれくらいかを把握。データに基づいた確実なジャンル選びに。', emoji: '🔰', badge: '初出品の参考に' },
  { profession: 'メーカー・D2Cブランド', title: '価格戦略の最適化', desc: '競合商品の価格帯・レビュー数・評価を分析。適切な価格設定と差別化ポイントを見つけて売上を最大化。', emoji: '🏭', badge: '価格戦略に' },
  { profession: 'マーケター・コンサルタント', title: 'クライアントの市場分析', desc: 'クライアントの商品ジャンルの市場データを素早く収集。データに基づいた提案でコンサルティングの質を向上。', emoji: '💼', badge: '提案資料に' },
];

const faqs = [
  { q: '楽天リサーチとは何ですか？', a: '楽天市場の商品データを分析し、価格帯・レビュー・キーワードの傾向をAIがレポートするツールです。出品戦略の立案に役立ちます。' },
  { q: '無料で使えますか？', a: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' },
  { q: 'どんな分析ができますか？', a: '市場参入スコア、価格戦略（推奨価格帯・タクティクス）、キーワード分析（必須キーワード・タイトルテンプレート）、ページ最適化、競合の強み・弱み分析、アクションプランなどが得られます。' },
  { q: '楽天APIの設定は必要ですか？', a: 'いいえ、APIの設定は不要です。キーワードを入力するだけで分析を開始できます。' },
  { q: '取得できる商品データの上限はありますか？', a: '1回の検索で最大90商品のデータを取得し分析します。レビュー数順・評価順・価格順など複数のソートで網羅的にデータを収集します。' },
];

export default function RakutenResearchLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-rose-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold mb-6">
              <ShoppingBag className="w-4 h-4" />
              楽天市場分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              楽天市場を<br />
              <span className="text-rose-600">AIでリサーチ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              商品分析・価格調査・キーワード分析を
              <br className="hidden sm:block" />
              AIがサポート。楽天出品を成功に導きます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/rakuten-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                リサーチを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-semibold text-lg rounded-xl border border-rose-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />市場調査</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />価格分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AIコンサル</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">楽天リサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいた出品戦略で、楽天市場での売上を最大化します。</p>
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
              <Link href="/rakuten-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />リサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいた出品戦略で、効率的に楽天市場での売上を伸ばしましょう</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">楽天リサーチを始めよう</h2>
            <p className="text-rose-100 mb-8 text-lg">AIがあなたの楽天出品をサポート。市場分析から価格戦略まで、すべて無料で使えます。</p>
            <Link href="/rakuten-research/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />リサーチを始める
            </Link>
            <p className="text-rose-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
