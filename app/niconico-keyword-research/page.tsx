import { Metadata } from 'next';
import Link from 'next/link';
import {
  Tv, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Search, MessageCircle, Tag,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'ニコニコ動画キーワードリサーチ | 集客メーカー',
  description:
    'ニコニコ動画のキーワード検索で上位動画の再生数・コメント数・マイリスト数を一括分析。タグ文化やコメント傾向をAIが分析する無料ツール。',
  keywords: ['ニコニコ動画', 'キーワードリサーチ', '動画分析', 'コメント分析', 'タグ分析', 'マイリスト', 'ニコニコ'],
  openGraph: {
    title: 'ニコニコ動画キーワードリサーチ | 集客メーカー',
    description: 'ニコニコ動画のキーワード検索で上位動画を一括分析。コメント文化・タグ戦略をAIが分析。',
    type: 'website',
    url: 'https://makers.tokyo/niconico-keyword-research',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'ニコニコ動画キーワードリサーチ | 集客メーカー', description: 'ニコニコ動画のキーワード検索で上位動画を一括分析。' },
  alternates: { canonical: 'https://makers.tokyo/niconico-keyword-research' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'ニコニコ動画キーワードリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'ニコニコ動画のキーワード検索結果を分析し、再生数・コメント数・マイリスト数・タグ傾向をAIがレポートするツール。',
      url: 'https://makers.tokyo/niconico-keyword-research',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'ニコニコ動画キーワードリサーチとは？', acceptedAnswer: { '@type': 'Answer', text: 'ニコニコ動画のスナップショット検索APIを使い、キーワードに関連する動画の再生数・コメント数・マイリスト数などを一括分析するツールです。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: 'どんな分析ができますか？', acceptedAnswer: { '@type': 'Answer', text: 'コメント文化の分析、人気タグの傾向、エンゲージメント率の比較、タイトルパターンの分析、ペルソナ推定などがAIレポートで得られます。' } },
        { '@type': 'Question', name: 'APIキーは必要ですか？', acceptedAnswer: { '@type': 'Answer', text: 'いいえ、APIキーの設定は不要です。キーワードを入力するだけで分析を開始できます。' } },
        { '@type': 'Question', name: 'YouTubeリサーチとの違いは？', acceptedAnswer: { '@type': 'Answer', text: 'ニコニコ動画特有のコメント文化（弾幕コメント）やタグ文化、マイリスト数など、ニコニコ独自の指標を分析できます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'ニコニコ動画キーワードリサーチ', item: 'https://makers.tokyo/niconico-keyword-research' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: 'キーワード検索', desc: 'ニコニコ動画のスナップショット検索APIで上位動画を一括取得。再生数・コメント数・マイリスト数を比較分析。' },
  { icon: MessageCircle, iconClass: 'text-orange-700', bgClass: 'bg-orange-50', title: 'コメント文化分析', desc: 'ニコニコ特有の弾幕コメント文化を分析。コメント率やエンゲージメントの傾向をAIがレポート。' },
  { icon: Tag, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: 'タグ分析', desc: '人気動画に付けられているタグの傾向を分析。効果的なタグ戦略を立てるためのデータを提供。' },
  { icon: BarChart3, iconClass: 'text-amber-700', bgClass: 'bg-amber-50', title: 'エンゲージメント比較', desc: '再生数に対するコメント・マイリスト・いいね率を可視化。バズっている動画の特徴を発見。' },
];

const steps = [
  { num: '01', title: 'キーワードを入力', desc: '調べたいテーマのキーワードを入力します。日本語でそのまま検索できます。', icon: Search },
  { num: '02', title: '上位動画を自動分析', desc: 'ニコニコ動画の検索結果から上位動画の指標を自動でスクレイピング・比較。', icon: BarChart3 },
  { num: '03', title: 'AI分析レポート', desc: 'コメント文化・タグ傾向・タイトルパターンなどをAIがレポート。', icon: Lightbulb },
];

const useCases = [
  { profession: '動画投稿者・配信者', title: '投稿テーマのリサーチ', desc: '人気のテーマやタグを事前に分析。再生数が伸びやすいジャンルやタイトルパターンを把握して、効果的な動画を企画。', emoji: '🎬', badge: '再生数アップに' },
  { profession: 'ボカロP・音楽クリエイター', title: '楽曲トレンドの把握', desc: 'ボカロ曲やオリジナル楽曲のトレンドを分析。人気のタグやコメントの傾向から、聴かれやすい楽曲の特徴を発見。', emoji: '🎵', badge: 'トレンド把握に' },
  { profession: 'ゲーム実況者', title: '実況テーマの選定', desc: 'ゲーム実況の人気タイトルやフォーマットを分析。コメントが盛り上がりやすいゲームや実況スタイルを特定。', emoji: '🎮', badge: 'テーマ選びに' },
  { profession: 'マーケター・企業担当', title: 'ニコニコ市場の理解', desc: 'ニコニコ動画独自のコミュニティ文化を理解。ターゲット層の好みやコメント文化を把握した効果的なプロモーションに。', emoji: '📊', badge: 'マーケティングに' },
];

const faqs = [
  { q: 'ニコニコ動画キーワードリサーチとは？', a: 'ニコニコ動画のスナップショット検索APIを使い、キーワードに関連する動画の再生数・コメント数・マイリスト数などを一括で分析するツールです。AIによる詳細な分析レポートも生成できます。' },
  { q: '無料で使えますか？', a: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' },
  { q: 'どんな分析ができますか？', a: 'コメント文化の分析、人気タグの傾向、エンゲージメント率の比較、タイトルパターンの分析、ターゲット層のペルソナ推定など、6種類のAI分析レポートが利用できます。' },
  { q: 'APIキーは必要ですか？', a: 'いいえ、APIキーの設定は不要です。キーワードを入力するだけですぐに分析を開始できます。' },
  { q: 'YouTubeリサーチとの違いは？', a: 'ニコニコ動画特有の弾幕コメント文化やタグ文化、マイリスト数など、ニコニコ独自の指標を分析できる点が大きな違いです。日本のサブカルチャー・クリエイターコミュニティに特化した分析ができます。' },
];

export default function NiconicoKeywordResearchLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
              <Tv className="w-4 h-4" />
              ニコニコ動画分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              ニコニコ動画を<br />
              <span className="text-orange-600">AIでリサーチ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              再生数・コメント数・マイリスト数を一括分析。
              <br className="hidden sm:block" />
              ニコニコ動画のトレンドとコメント文化をAIが解析します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/niconico-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                リサーチを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold text-lg rounded-xl border border-orange-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />コメント分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />タグ分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AI分析レポート</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">ニコニコリサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">ニコニコ動画独自のコメント文化・タグ文化を活かした分析で、効果的な動画戦略を立案。</p>
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
            <p className="text-gray-600 text-center mb-12">キーワードを入力するだけで、AIがニコニコ動画の分析レポートを生成</p>
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
              <Link href="/niconico-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />リサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">ニコニコ動画のデータ分析で、効果的な動画投稿・プロモーション戦略を立案</p>
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
                  <summary data-speakable="question" className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-orange-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">ニコニコ動画リサーチを始めよう</h2>
            <p className="text-orange-100 mb-8 text-lg">AIがニコニコ動画の分析をサポート。コメント文化・タグ戦略まで、すべて無料で使えます。</p>
            <Link href="/niconico-keyword-research/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />リサーチを始める
            </Link>
            <p className="text-orange-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
