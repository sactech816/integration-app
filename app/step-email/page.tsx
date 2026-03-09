import { Metadata } from 'next';
import Link from 'next/link';
import {
  ListOrdered, Mail, Clock, BarChart3,
  CheckCircle2, ArrowRight, ChevronRight, Settings, Users,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'ステップメール（自動メール配信）| 集客メーカー',
  description:
    'シナリオ設計からメール配信まで自動化。見込み客を段階的にナーチャリングして成約率をアップ。ステップメールで集客を自動化しましょう。',
  keywords: ['ステップメール', '自動メール配信', 'メールマーケティング', 'ナーチャリング', 'シナリオメール', 'メール自動化'],
  openGraph: {
    title: 'ステップメール | 集客メーカー',
    description: 'シナリオ設計からメール配信まで自動化。見込み客を段階的にナーチャリング。',
    type: 'website',
    url: 'https://makers.tokyo/step-email',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'ステップメール | 集客メーカー', description: 'メール配信を自動化。シナリオ設計でナーチャリング。' },
  alternates: { canonical: 'https://makers.tokyo/step-email' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'ステップメール',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'シナリオ設計からメール配信まで自動化するステップメールツール。見込み客を段階的にナーチャリング。',
      url: 'https://makers.tokyo/step-email',
      offers: { '@type': 'Offer', price: '3980', priceCurrency: 'JPY', description: 'PROプランで利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'ステップメールとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: '事前に設定したシナリオに沿って、登録日からの経過日数に応じて自動でメールを配信する仕組みです。見込み客の教育・ナーチャリングに最適です。' } },
        { '@type': 'Question', name: '何通まで設定できますか？', acceptedAnswer: { '@type': 'Answer', text: 'PROプランではステップ数に制限はありません。必要なだけシナリオを設計できます。' } },
        { '@type': 'Question', name: 'メルマガとの違いは？', acceptedAnswer: { '@type': 'Answer', text: 'メルマガは全読者に同じタイミングで一斉送信しますが、ステップメールは登録日を起点に個別のタイミングで自動配信されます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'ステップメール', item: 'https://makers.tokyo/step-email' },
      ],
    },
  ],
};

const features = [
  { icon: Settings, iconClass: 'text-cyan-600', bgClass: 'bg-cyan-100', title: 'シナリオ設計', desc: '登録日からの経過日数に応じてメールを自動配信。段階的に信頼関係を構築するシナリオを簡単に設計できます。' },
  { icon: Clock, iconClass: 'text-blue-600', bgClass: 'bg-blue-100', title: '自動配信', desc: '一度設定すれば、新規登録者に対して自動でメールが配信されます。手動での送信作業は不要です。' },
  { icon: Mail, iconClass: 'text-indigo-600', bgClass: 'bg-indigo-100', title: 'メール作成エディタ', desc: 'シンプルなエディタでメール本文を作成。各ステップのメール内容をプレビューしながら編集できます。' },
  { icon: BarChart3, iconClass: 'text-violet-600', bgClass: 'bg-violet-100', title: '配信実績管理', desc: 'ステップごとの配信状況を確認。シナリオ全体のパフォーマンスを把握して改善に活かせます。' },
];

const steps = [
  { num: '01', title: 'シナリオを作成', desc: 'ステップメールのシナリオ名を設定し、配信間隔と各ステップのメール内容を設計します。', icon: Settings },
  { num: '02', title: 'メールを作成', desc: '各ステップのメール件名・本文を作成。プレビューで確認してから保存。', icon: Mail },
  { num: '03', title: '自動配信スタート', desc: '登録者が追加されると、設定したスケジュールに従って自動でメールが配信されます。', icon: Clock },
];

const useCases = [
  { profession: 'コーチ・コンサルタント', title: '無料相談からの成約導線', desc: '無料相談に申し込んだ見込み客に対して、段階的にサービスの価値を伝えるメールを自動配信。成約率を向上。', emoji: '💼', badge: '成約率の向上に' },
  { profession: 'オンラインスクール', title: '体験レッスン後のフォロー', desc: '体験レッスン参加者に対して、受講のメリットや受講生の声を段階的に配信。入会率をアップ。', emoji: '📚', badge: '入会率の向上に' },
  { profession: 'EC・物販事業者', title: '購入後のリピート促進', desc: '初回購入者に対して、使い方のコツや関連商品の紹介を段階的に配信。リピート購入を促進。', emoji: '🛒', badge: 'リピート率の向上に' },
  { profession: 'セミナー講師', title: 'セミナー参加者の育成', desc: 'セミナー参加後に学びの復習や追加情報を段階的に配信。上位講座への申し込みにつなげる。', emoji: '🎤', badge: '上位商品への導線に' },
];

const faqs = [
  { q: 'ステップメールとは何ですか？', a: '事前に設定したシナリオに沿って、登録日からの経過日数に応じて自動でメールを配信する仕組みです。見込み客の教育・ナーチャリングに最適です。' },
  { q: '何通まで設定できますか？', a: 'PROプランではステップ数に制限はありません。必要なだけシナリオを設計できます。' },
  { q: 'メルマガとの違いは？', a: 'メルマガは全読者に同じタイミングで一斉送信しますが、ステップメールは登録日を起点に個別のタイミングで自動配信されます。' },
  { q: '配信を途中で止められますか？', a: 'はい、シナリオの一時停止や個別の読者への配信停止が可能です。' },
  { q: '料金はいくらですか？', a: 'PROプラン（月額3,980円）に含まれる機能です。メルマガ・診断クイズ・LP作成など他のPRO機能もすべて利用可能です。' },
];

export default function StepEmailLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="step-email" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-cyan-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-6">
              <ListOrdered className="w-4 h-4" />
              PROプラン限定機能
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              見込み客を自動で<br />
              <span className="text-cyan-600">ナーチャリング</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              シナリオ設計からメール配信まで自動化。
              <br className="hidden sm:block" />
              登録日を起点に段階的なメール配信で成約率をアップ。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/step-email/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <ListOrdered className="w-5 h-5" />
                ステップメールを作成する
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 font-semibold text-lg rounded-xl border border-cyan-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />シナリオ設計</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />自動配信</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />配信実績管理</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">ステップメールの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">一度設定するだけで、見込み客を自動でフォローアップ。手間なく成約率を向上させます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで自動配信</h2>
            <p className="text-gray-600 text-center mb-12">シナリオ作成から自動配信まで、シンプルな操作で完了</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-cyan-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-cyan-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/step-email/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <ListOrdered className="w-5 h-5" />ステップメールを作成する（PROプラン）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">見込み客の育成から成約までを自動化して、ビジネスを効率化</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-cyan-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-cyan-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">ステップメールで集客を自動化しよう</h2>
            <p className="text-cyan-100 mb-8 text-lg">PROプランに含まれる機能です。シナリオ設計から自動配信まで簡単に始められます。</p>
            <Link href="/step-email/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-cyan-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <ListOrdered className="w-5 h-5" />ステップメールを作成する
            </Link>
            <p className="text-cyan-200 text-sm mt-4">PROプラン（月額3,980円）で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
