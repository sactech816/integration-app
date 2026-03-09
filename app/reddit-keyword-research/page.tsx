import { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe, TrendingUp, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight, Search, Filter, Download,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'Redditキーワードリサーチ | 集客メーカー',
  description:
    'Redditのキーワード検索で人気投稿のスコア・コメント数・エンゲージメントを一括分析。海外マーケティング戦略に最適な無料ツール。',
  keywords: ['Reddit', 'キーワードリサーチ', '海外マーケティング', 'サブレディット分析', 'エンゲージメント', 'Reddit分析'],
  openGraph: {
    title: 'Redditキーワードリサーチ | 集客メーカー',
    description: 'Redditのキーワード検索で人気投稿を一括分析。海外マーケティング・トレンドリサーチに。',
    type: 'website',
    url: 'https://makers.tokyo/reddit-keyword-research',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'Redditキーワードリサーチ | 集客メーカー', description: 'Redditのキーワード検索で人気投稿を一括分析。' },
  alternates: { canonical: 'https://makers.tokyo/reddit-keyword-research' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Redditキーワードリサーチ',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Redditのキーワード検索結果を分析し、スコア・コメント数・エンゲージメント率をAIがレポートするツール。',
      url: 'https://makers.tokyo/reddit-keyword-research',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料で利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Redditキーワードリサーチとは？', acceptedAnswer: { '@type': 'Answer', text: 'RedditのパブリックAPIを使い、キーワードに関連する投稿のスコア・コメント数・upvote率・エンゲージメント率を一括分析するツールです。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' } },
        { '@type': 'Question', name: 'どんな分析ができますか？', acceptedAnswer: { '@type': 'Answer', text: 'サブレディット戦略、バズるタイトルの分析、関連キーワード提案、ペルソナ分析、コンテンツ企画など6種類のAI分析レポートが利用できます。' } },
        { '@type': 'Question', name: 'APIキーは必要ですか？', acceptedAnswer: { '@type': 'Answer', text: 'いいえ、APIキーの設定は不要です。キーワードを入力するだけで分析を開始できます。' } },
        { '@type': 'Question', name: 'どんな人に向いていますか？', acceptedAnswer: { '@type': 'Answer', text: '海外マーケティング担当者、英語圏のトレンドリサーチャー、海外向けコンテンツクリエイター、SaaS企業のマーケターなどに最適です。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'Redditキーワードリサーチ', item: 'https://makers.tokyo/reddit-keyword-research' },
      ],
    },
  ],
};

const features = [
  { icon: Search, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: 'キーワード検索', desc: 'Redditの検索結果を一括取得。人気投稿のスコア・コメント数・upvote率を比較分析できます。' },
  { icon: Globe, iconClass: 'text-red-600', bgClass: 'bg-red-50', title: 'サブレディット分析', desc: '投稿元のサブレディットを分析し、最適な投稿先を特定。クロスポスト戦略にも活用。' },
  { icon: TrendingUp, iconClass: 'text-orange-700', bgClass: 'bg-orange-50', title: 'エンゲージメント分析', desc: 'スコア/時間やコメント比率で急上昇中のトレンドを発見。バズの兆候を早期キャッチ。' },
  { icon: Filter, iconClass: 'text-amber-700', bgClass: 'bg-amber-50', title: '高度なフィルター', desc: '期間・スコア・サブレディットでフィルタリング。ターゲット市場のピンポイント分析に対応。' },
];

const steps = [
  { num: '01', title: 'キーワードを入力', desc: '調べたいテーマのキーワードを英語または日本語で入力します。', icon: Search },
  { num: '02', title: '検索結果を分析', desc: '人気投稿のスコア・コメント数・エンゲージメントがグラフ付きで表示されます。', icon: BarChart3 },
  { num: '03', title: 'AI分析レポート', desc: 'サブレディット戦略・タイトルパターン・ペルソナ分析などをAIが自動生成。', icon: Lightbulb },
];

const useCases = [
  { profession: '海外マーケター', title: 'グローバル市場のトレンド把握', desc: '英語圏の最新トレンドをRedditからキャッチ。ターゲット市場のニーズや関心事をデータで把握し、戦略立案に活用。', emoji: '🌍', badge: '海外展開に' },
  { profession: 'SaaS企業・スタートアップ', title: 'プロダクトの市場リサーチ', desc: '自社プロダクトに関連するRedditの投稿を分析。ユーザーの悩みやフィードバックを把握して、開発・マーケティングに活用。', emoji: '🚀', badge: 'プロダクト改善に' },
  { profession: 'コンテンツクリエイター', title: '海外向けコンテンツ企画', desc: 'Redditで話題のテーマやフォーマットを分析。海外ユーザーに響くコンテンツを企画・制作。', emoji: '✍️', badge: 'コンテンツ企画に' },
  { profession: 'リサーチャー・アナリスト', title: 'ソーシャルリスニング', desc: 'Redditのコミュニティの声をデータで収集・分析。消費者インサイトやブランド認知の調査に活用。', emoji: '📊', badge: '市場調査に' },
];

const faqs = [
  { q: 'Redditキーワードリサーチとは？', a: 'RedditのパブリックAPIを使い、キーワードに関連する投稿のスコア・コメント数・upvote率・エンゲージメント率を一括で分析するツールです。AIによる詳細な分析レポートも生成できます。' },
  { q: '無料で使えますか？', a: 'はい、基本的なリサーチ機能は無料でご利用いただけます。' },
  { q: 'どんな分析ができますか？', a: 'サブレディット戦略の提案、バズるタイトルパターンの分析、関連キーワード提案、ターゲットペルソナ分析、コンテンツ企画アイデアなど、6種類のAI分析レポートが利用できます。' },
  { q: 'APIキーは必要ですか？', a: 'いいえ、APIキーの設定は不要です。キーワードを入力するだけですぐに分析を開始できます。' },
  { q: 'サブレディットを指定して検索できますか？', a: 'はい、特定のサブレディットに絞って検索することができます。全体検索とサブレディット内検索の両方に対応しています。' },
];

export default function RedditKeywordResearchLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50 via-white to-red-50">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              海外マーケティング分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Redditを<br />
              <span className="text-orange-600">AIでリサーチ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              人気投稿のスコア・コメント数を一括分析。
              <br className="hidden sm:block" />
              海外マーケティング戦略やトレンドリサーチに最適です。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/reddit-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />
                リサーチを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold text-lg rounded-xl border border-orange-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />スコア分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />サブレディット分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AI分析レポート</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">Redditリサーチの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Redditのコミュニティデータを活用して、海外市場のインサイトを発掘。</p>
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
            <p className="text-gray-600 text-center mb-12">キーワードを入力するだけで、AIがReddit投稿の分析レポートを生成</p>
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
              <Link href="/reddit-keyword-research/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Search className="w-5 h-5" />リサーチを始める（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Redditのデータ分析で、海外市場のインサイトを効率的に収集</p>
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
          <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Redditリサーチを始めよう</h2>
            <p className="text-orange-100 mb-8 text-lg">AIが海外トレンドの分析をサポート。サブレディット戦略からペルソナ分析まで、すべて無料。</p>
            <Link href="/reddit-keyword-research/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Search className="w-5 h-5" />リサーチを始める
            </Link>
            <p className="text-orange-200 text-sm mt-4">無料で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
