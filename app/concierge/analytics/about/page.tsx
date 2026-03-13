import { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, Users, MessageSquare,
  CheckCircle2, ArrowRight, ChevronRight, PieChart, Activity, Search,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'コンシェルジュ分析（AIチャットボット分析）| 集客メーカー',
  description:
    'AIコンシェルジュの会話データを可視化。ユーザーの質問傾向・応答品質・利用状況をリアルタイムで分析し、チャットボットの改善に活用できます。',
  keywords: ['AIチャットボット分析', 'コンシェルジュ分析', 'チャットボット改善', '会話分析', 'ユーザー行動分析'],
  openGraph: {
    title: 'コンシェルジュ分析 | 集客メーカー',
    description: 'AIコンシェルジュの会話データを可視化。質問傾向・応答品質をリアルタイムで分析。',
    type: 'website',
    url: 'https://makers.tokyo/concierge/analytics/about',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'コンシェルジュ分析 | 集客メーカー', description: 'AIコンシェルジュの会話データを可視化・分析。' },
  alternates: { canonical: 'https://makers.tokyo/concierge/analytics/about' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'コンシェルジュ分析',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AIコンシェルジュの会話データを可視化・分析するツール。質問傾向・応答品質・利用コストをリアルタイムで確認。',
      url: 'https://makers.tokyo/concierge/analytics/about',
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'コンシェルジュ分析とは？', acceptedAnswer: { '@type': 'Answer', text: 'AIコンシェルジュの会話ログ・質問傾向・応答品質・利用コストを可視化するダッシュボードです。データに基づいてチャットボットを継続的に改善できます。' } },
        { '@type': 'Question', name: 'どんなデータが見られますか？', acceptedAnswer: { '@type': 'Answer', text: 'メッセージ数・セッション数・ユーザー属性・よくある質問ランキング・応答コスト・日別推移グラフなどを確認できます。' } },
        { '@type': 'Question', name: '分析データはリアルタイムですか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。会話が行われるたびにデータが更新され、ダッシュボードにリアルタイムで反映されます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'コンシェルジュメーカー', item: 'https://makers.tokyo/concierge' },
        { '@type': 'ListItem', position: 3, name: 'コンシェルジュ分析', item: 'https://makers.tokyo/concierge/analytics/about' },
      ],
    },
  ],
};

const features = [
  { icon: BarChart3, iconClass: 'text-blue-600', bgClass: 'bg-blue-100', title: '会話データの可視化', desc: 'メッセージ数・セッション数・日別推移をグラフで一目で把握。チャットボットの利用状況をリアルタイムで確認できます。' },
  { icon: Search, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: 'よくある質問の自動抽出', desc: 'ユーザーから寄せられる質問を自動分類・ランキング表示。FAQの追加や改善すべきポイントが明確になります。' },
  { icon: Users, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: 'ユーザーセグメント分析', desc: '新規・リピーター・会員・ゲストなど、ユーザー属性ごとの利用傾向を分析。ターゲットに合わせた応答改善に活用。' },
  { icon: Activity, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: 'コスト・パフォーマンス管理', desc: 'AI応答にかかるコストを日別・月別で追跡。予算管理と費用対効果の最適化をサポートします。' },
];

const steps = [
  { num: '01', title: 'コンシェルジュを作成', desc: 'まずはコンシェルジュメーカーでAIチャットボットを作成・設置します。', icon: MessageSquare },
  { num: '02', title: '会話データが蓄積', desc: 'サイト訪問者との会話が自動的に記録・分析されます。', icon: TrendingUp },
  { num: '03', title: 'データに基づき改善', desc: '質問傾向やユーザー行動を確認し、FAQや応答を継続的に改善。', icon: BarChart3 },
];

const dashboardPanels = [
  { title: 'オーバービュー', desc: 'メッセージ数・セッション数・ユニークユーザー数の日別推移をグラフで確認', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'セグメント分析', desc: '会員・ゲスト・新規・リピーターごとの利用傾向を円グラフで可視化', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'コスト管理', desc: 'AI応答にかかるトークン消費量・コストを日別・累計で追跡', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: '会話ログ', desc: 'すべての会話を検索・閲覧。個別セッションの詳細をフルテキストで確認', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: '質問ランキング', desc: 'よくある質問をAIが自動分類・ランキング。未対応の質問も一目で把握', icon: Search, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const faqs = [
  { q: 'コンシェルジュ分析とは？', a: 'AIコンシェルジュの会話ログ・質問傾向・応答品質・利用コストを可視化するダッシュボードです。データに基づいてチャットボットを継続的に改善できます。' },
  { q: 'どんなデータが見られますか？', a: 'メッセージ数・セッション数・ユーザー属性・よくある質問ランキング・応答コスト・日別推移グラフなどを確認できます。' },
  { q: '分析データはリアルタイムですか？', a: 'はい。会話が行われるたびにデータが更新され、ダッシュボードにリアルタイムで反映されます。' },
  { q: 'コンシェルジュを作成していなくても使えますか？', a: 'いいえ。分析機能はコンシェルジュメーカーでAIチャットボットを作成・設置した後にご利用いただけます。' },
];

export default function ConciergeAnalyticsAboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="quiz" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <BarChart3 className="w-4 h-4" />
              AIコンシェルジュ分析ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              チャットボットの効果を<br />
              <span className="text-indigo-600">データで可視化</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              ユーザーの質問傾向・応答品質・利用コストをリアルタイムで分析。
              <br className="hidden sm:block" />
              AIコンシェルジュを継続的に改善し、顧客満足度を最大化します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/concierge/editor?new" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <BarChart3 className="w-5 h-5" />
                コンシェルジュを作成して始める
              </Link>
              <Link href="/concierge" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold text-lg rounded-xl border border-indigo-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                コンシェルジュメーカーとは <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />リアルタイム分析</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />質問傾向の自動抽出</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />コスト管理機能</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">コンシェルジュ分析の特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">チャットボットの改善に必要なデータをすべて一元管理。</p>
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

        {/* Dashboard Panels */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">5つの分析パネル</h2>
            <p className="text-gray-600 text-center mb-12">あらゆる角度からチャットボットのパフォーマンスを把握</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dashboardPanels.map((panel) => (
                <div key={panel.title} className={`${panel.bg} border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex items-center gap-3 mb-3">
                    <panel.icon className={`w-6 h-6 ${panel.color}`} />
                    <h3 className="font-bold text-gray-900">{panel.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{panel.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">分析開始までの流れ</h2>
          <p className="text-gray-600 text-center mb-12">コンシェルジュを作成すれば、自動的に分析が開始されます</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                    <ChevronRight className="w-6 h-6 text-indigo-300" />
                  </div>
                )}
                <div className="w-20 h-20 mb-4 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs font-bold text-indigo-500 mb-1 tracking-widest">STEP {step.num}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/concierge/editor?new" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <BarChart3 className="w-5 h-5" />今すぐ始める
            </Link>
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
                    <span className="text-indigo-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">データでチャットボットを改善しよう</h2>
            <p className="text-indigo-100 mb-8 text-lg">コンシェルジュを作成すれば、分析機能が自動で利用可能になります。</p>
            <Link href="/concierge/editor?new" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <BarChart3 className="w-5 h-5" />コンシェルジュを作成する
            </Link>
            <p className="text-indigo-200 text-sm mt-4">プレミアムプランで全分析機能をご利用いただけます</p>
          </div>
        </section>
      </div>
    </>
  );
}
