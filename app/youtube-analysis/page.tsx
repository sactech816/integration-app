import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, FileText, Youtube,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'YouTubeリサーチ（動画分析・競合調査）| 集客メーカー',
  description:
    'YouTube動画のリサーチ・分析をAIでサポート。競合チャンネル分析、トレンド把握、ネタ探しに最適。YouTube運営を効率化。',
  keywords: ['YouTubeリサーチ', 'YouTube分析', '動画分析', '競合調査', 'YouTube運営', 'ネタ探し', 'トレンド分析'],
  openGraph: {
    title: 'YouTubeリサーチ | 集客メーカー',
    description: 'YouTube動画のリサーチ・分析をAIでサポート。競合分析やネタ探しに最適。',
    type: 'website',
    url: 'https://makers.tokyo/youtube-analysis',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'YouTubeリサーチ | 集客メーカー', description: 'YouTube動画のリサーチ・分析をAIでサポート。' },
  alternates: { canonical: 'https://makers.tokyo/youtube-analysis' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTubeリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'YouTube動画のリサーチ・分析ツール。競合チャンネル分析、トレンド把握、ネタ探しに対応。',
      url: 'https://makers.tokyo/youtube-analysis',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'YouTubeリサーチとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'YouTube動画やチャンネルのデータをAIで分析し、競合調査やネタ探し、トレンド把握をサポートするツールです。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: 'どんな分析ができますか？', acceptedAnswer: { '@type': 'Answer', text: '動画のタイトル・サムネイル分析、競合チャンネルの調査、トレンドキーワードの把握、企画ネタの提案などが可能です。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'YouTubeリサーチ', item: 'https://makers.tokyo/youtube-analysis' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-red-600', bgClass: 'bg-red-100', title: '競合チャンネル分析', desc: '気になるチャンネルの動画データを分析。再生数・エンゲージメントのトレンドを把握して、自分のチャンネル運営に活かせます。' },
  { icon: TrendingUp, iconClass: 'text-rose-600', bgClass: 'bg-rose-100', title: 'トレンド把握', desc: '今注目されているトピックやキーワードを発見。トレンドに乗った動画企画で再生数アップを狙えます。' },
  { icon: Lightbulb, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: 'AIネタ提案', desc: 'AIがあなたのチャンネルに合った動画ネタを提案。ネタ切れの心配なく、継続的なコンテンツ制作をサポート。' },
  { icon: BarChart3, iconClass: 'text-red-700', bgClass: 'bg-red-50', title: 'データ分析レポート', desc: '動画のパフォーマンスデータを分かりやすくレポート。改善ポイントを可視化して、チャンネル成長を加速。' },
];

const steps = [
  { num: '01', title: 'リサーチ対象を入力', desc: '分析したいYouTubeチャンネルURLやキーワードを入力します。', icon: Search },
  { num: '02', title: 'AIが分析', desc: 'AIが動画データを分析し、トレンドや競合状況をレポートにまとめます。', icon: BarChart3 },
  { num: '03', title: '企画に活かす', desc: '分析結果をもとに、効果的な動画企画やタイトル・サムネイルを作成。', icon: Lightbulb },
];

const useCases = [
  { profession: 'YouTuber・動画クリエイター', title: 'ネタ探し&企画立案', desc: 'トレンドキーワードや競合の人気動画を分析して、再生されやすい動画企画を立案。ネタ切れを解消。', emoji: '🎬', badge: '再生数アップに' },
  { profession: 'マーケター・広報担当', title: '競合チャンネル調査', desc: '競合企業のYouTubeチャンネルを分析。どんなコンテンツが反響を得ているか把握して、自社の戦略に活かす。', emoji: '📊', badge: '戦略立案に' },
  { profession: 'コーチ・コンサルタント', title: '教育コンテンツ企画', desc: '教育系YouTubeチャンネルのトレンドを分析。視聴者が求めているテーマを把握して、集客につながるコンテンツを制作。', emoji: '💼', badge: '集客コンテンツに' },
  { profession: 'EC・D2Cブランド', title: '商品紹介動画の企画', desc: '同ジャンルの商品紹介動画を分析。再生されやすいタイトルやサムネイルの傾向を把握して、効果的な動画を制作。', emoji: '🛒', badge: '商品認知の向上に' },
];

const faqs = [
  { q: 'YouTubeリサーチとは何ですか？', a: 'YouTube動画やチャンネルのデータをAIで分析し、競合調査やネタ探し、トレンド把握をサポートするツールです。' },
  { q: '無料で使えますか？', a: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' },
  { q: 'どんな分析ができますか？', a: '動画のタイトル・サムネイル分析、競合チャンネルの調査、トレンドキーワードの把握、企画ネタの提案などが可能です。' },
  { q: 'YouTube APIの設定は必要ですか？', a: 'いいえ、APIの設定は不要です。URLやキーワードを入力するだけで分析を開始できます。' },
  { q: '他のツールとの連携はできますか？', a: 'サムネイルメーカーと連携して、分析結果をもとにサムネイルを作成したり、SNS投稿メーカーで動画の告知投稿を作成できます。' },
];

export default function YouTubeAnalysisLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="youtube-analysis" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-red-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-6">
              <Youtube className="w-4 h-4" />
              AIリサーチツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              YouTubeを<br />
              <span className="text-red-600">AIでリサーチ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              競合分析・トレンド把握・ネタ探しを
              <br className="hidden sm:block" />
              AIがサポート。YouTube運営を効率化。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/youtube-analysis/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                リサーチを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold text-lg rounded-xl border border-red-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />競合分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />トレンド把握</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AIネタ提案</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">YouTubeリサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいた動画企画で、チャンネル成長を加速させます。</p>
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
            <p className="text-gray-600 text-center mb-12">URLやキーワードを入力するだけで、AIが分析レポートを生成</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-red-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-red-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-red-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/youtube-analysis/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />リサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいた動画企画で、効率的にチャンネルを成長させましょう</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-red-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-red-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">YouTubeリサーチを始めよう</h2>
            <p className="text-red-100 mb-8 text-lg">AIがあなたのYouTube運営をサポート。競合分析からネタ探しまで、すべて無料で使えます。</p>
            <Link href="/youtube-analysis/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-red-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />リサーチを始める
            </Link>
            <p className="text-red-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
