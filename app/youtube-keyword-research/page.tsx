import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Youtube, SlidersHorizontal,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'YouTubeキーワードリサーチ（上位動画分析）| 集客メーカー',
  description:
    'YouTubeキーワード検索で上位動画の再生数・登録者数・再生倍率を一括分析。競合動画のデータを比較チャートで可視化し、動画企画に活かせる無料ツール。',
  keywords: ['YouTubeキーワード', 'YouTube検索', '上位動画分析', '再生倍率', '競合分析', 'YouTubeリサーチ', '動画企画'],
  openGraph: {
    title: 'YouTubeキーワードリサーチ | 集客メーカー',
    description: 'キーワード検索で上位動画の指標を一括分析。再生数・登録者数・再生倍率でソート・比較。',
    type: 'website',
    url: 'https://makers.tokyo/youtube-keyword-research',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'YouTubeキーワードリサーチ | 集客メーカー', description: 'キーワード検索で上位動画の指標を一括分析。' },
  alternates: { canonical: 'https://makers.tokyo/youtube-keyword-research' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'YouTubeキーワードリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'YouTubeキーワード検索で上位動画の再生数・登録者数・再生倍率を一括分析するツール。',
      url: 'https://makers.tokyo/youtube-keyword-research',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'YouTubeキーワードリサーチとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: '任意のキーワードでYouTube検索し、上位に表示される動画の再生数・チャンネル登録者数・再生倍率などの指標を一括で取得・比較できるツールです。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なキーワードリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: '再生倍率とは何ですか？', acceptedAnswer: { '@type': 'Answer', text: '再生倍率は「再生数 ÷ チャンネル登録者数」で算出される指標です。1.0以上なら登録者数以上の再生数があることを意味し、動画のパフォーマンスを評価する重要な指標です。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'YouTubeキーワードリサーチ', item: 'https://makers.tokyo/youtube-keyword-research' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-rose-600', bgClass: 'bg-rose-100', title: 'キーワード検索で上位動画を一括取得', desc: '任意のキーワードでYouTube検索し、上位10〜20件の動画データを自動取得。手作業でのリサーチ時間を大幅に削減します。' },
  { icon: TrendingUp, iconClass: 'text-red-600', bgClass: 'bg-red-100', title: '再生倍率で動画のポテンシャルを判定', desc: '再生数÷登録者数の「再生倍率」でバズ度合いを数値化。登録者数が少なくても伸びている動画を発見できます。' },
  { icon: BarChart3, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: '比較チャートで可視化', desc: '上位動画の再生数・いいね数・コメント数をグラフで比較。どの動画が突出しているかを一目で把握できます。' },
  { icon: SlidersHorizontal, iconClass: 'text-rose-700', bgClass: 'bg-rose-50', title: '6種類の指標でソート', desc: '再生数・いいね数・コメント数・登録者数・再生倍率・公開日の6指標でソート。目的に合わせた分析が可能です。' },
];

const steps = [
  { num: '01', title: 'キーワードを入力', desc: '分析したいYouTubeキーワードを入力します。動画企画のテーマやジャンルを入力してください。', icon: Search },
  { num: '02', title: '上位動画を一括分析', desc: '上位10〜20件の動画データを自動取得。再生数・登録者数・再生倍率などの指標をまとめて表示します。', icon: BarChart3 },
  { num: '03', title: '企画・戦略に活用', desc: '分析結果を比較チャートで確認し、伸びている動画の傾向を把握。自分の動画企画に活かせます。', icon: Lightbulb },
];

const useCases = [
  { profession: 'YouTuber・動画クリエイター', title: '企画リサーチ', desc: '狙いたいキーワードで上位動画を調査。再生倍率が高い動画のタイトルやサムネイルを参考に、伸びる企画を立案。', emoji: '🎬', badge: '再生数アップに' },
  { profession: 'マーケター・広報担当', title: '市場調査・競合分析', desc: '自社の商品ジャンルのキーワードで検索し、どんな切り口の動画が伸びているかを把握。動画マーケティング戦略に活用。', emoji: '📊', badge: '動画マーケティングに' },
  { profession: 'コンサルタント・講師', title: '教育コンテンツの需要調査', desc: 'ターゲット層が検索するキーワードで上位動画を分析。需要のあるテーマを把握して、集客につながるコンテンツを企画。', emoji: '💼', badge: 'コンテンツ企画に' },
  { profession: 'ブロガー・アフィリエイター', title: 'コンテンツ連携', desc: 'ブログ記事と連動したYouTube動画のネタを調査。再生倍率の高いテーマをブログとYouTubeの両方で展開。', emoji: '✍️', badge: 'マルチメディア展開に' },
];

const faqs = [
  { q: 'YouTubeキーワードリサーチとは何ですか？', a: '任意のキーワードでYouTube検索し、上位に表示される動画の再生数・チャンネル登録者数・再生倍率などの指標を一括で取得・比較できるツールです。' },
  { q: '無料で使えますか？', a: 'はい、基本的なキーワードリサーチ機能は無料でご利用いただけます。' },
  { q: '再生倍率とは何ですか？', a: '再生倍率は「再生数 ÷ チャンネル登録者数」で算出される指標です。1.0以上なら登録者数以上の再生数があることを意味し、動画のパフォーマンスを評価する重要な指標です。' },
  { q: '何件まで表示できますか？', a: '1回の検索で最大20件の上位動画を取得・分析できます。10件または20件から選択可能です。' },
  { q: 'YouTubeリサーチとの違いは？', a: 'YouTubeリサーチは個別の動画URLを入力して詳細分析するツールです。キーワードリサーチはキーワード検索結果の上位動画をまとめて分析・比較するツールで、市場調査や企画立案に適しています。' },
];

export default function YouTubeKeywordResearchLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-rose-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold mb-6">
              <Youtube className="w-4 h-4" />
              キーワード分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              YouTubeキーワードで<br />
              <span className="text-rose-600">上位動画を一括分析</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              キーワード検索で上位動画の再生数・登録者数・再生倍率を
              <br className="hidden sm:block" />
              まとめて取得。比較チャートで伸びる動画の傾向を把握。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/youtube-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                キーワードリサーチを始める
              </Link>
              <Link href="/youtube-analysis" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-semibold text-lg rounded-xl border border-rose-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                動画分析ツールを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />上位20件を一括取得</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />再生倍率で比較</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />6指標でソート</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">キーワードリサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">データに基づいた動画企画で、効率的にチャンネルを成長させましょう。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで分析</h2>
            <p className="text-gray-600 text-center mb-12">キーワードを入力するだけで、上位動画のデータを一括取得</p>
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
              <Link href="/youtube-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />キーワードリサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">キーワードリサーチで、データに基づいた動画企画を立案しましょう</p>
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
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-rose-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">キーワードリサーチを始めよう</h2>
            <p className="text-rose-100 mb-8 text-lg">上位動画のデータを一括分析。データに基づいた動画企画で、チャンネル成長を加速させましょう。</p>
            <Link href="/youtube-keyword-research/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />キーワードリサーチを始める
            </Link>
            <p className="text-rose-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
