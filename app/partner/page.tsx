import { Metadata } from 'next';
import Link from 'next/link';
import {
  Handshake, TrendingUp, DollarSign, Users, Award, Mic,
  CheckCircle2, ArrowRight, ChevronRight, BarChart3, Shield,
  Sparkles, GraduationCap, Target, Presentation, Calendar,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'パートナープログラム | 集客メーカー',
  description:
    '起業家支援コンサルタント・コミュニティリーダー向けパートナープログラム。クライアントの集客を支援しながら、最大30%のストック報酬とセミナー共同開催で収益化。',
  keywords: ['パートナープログラム', '起業家支援', 'コンサルタント', 'コミュニティリーダー', '集客メーカー', '共同開催', 'セミナー', 'ストック報酬'],
  openGraph: {
    title: 'パートナープログラム | 集客メーカー',
    description: 'クライアントの集客を支援しながら、最大30%のストック報酬。セミナー共同開催で即時収益も。',
    type: 'website',
    url: 'https://makers.tokyo/partner',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'パートナープログラム | 集客メーカー', description: 'クライアントの集客を支援しながら収益化。' },
  alternates: { canonical: 'https://makers.tokyo/partner' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'パートナープログラム',
      description: '起業家支援コンサルタント・コミュニティリーダー向けパートナープログラム。',
      url: 'https://makers.tokyo/partner',
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'パートナープログラムとアフィリエイトの違いは？', acceptedAnswer: { '@type': 'Answer', text: 'アフィリエイトはリンクシェアによる紹介報酬（10%）のプログラムです。パートナープログラムはコンサルタントやリーダー向けに、より高い報酬率（30%）とセミナー共同開催の機会を提供します。' } },
        { '@type': 'Question', name: '認定パートナーの条件は？', acceptedAnswer: { '@type': 'Answer', text: '集客メーカーの有料プランをご利用中の方、または申請制の審査を通過した方が認定パートナーになれます。' } },
        { '@type': 'Question', name: 'セミナー共同開催とは？', acceptedAnswer: { '@type': 'Answer', text: 'パートナーのクライアントや集客ネットワーク向けに、集客メーカーの活用セミナーを共同で開催する仕組みです。参加費の50%がパートナーの収益になります。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'パートナープログラム', item: 'https://makers.tokyo/partner' },
      ],
    },
  ],
};

const partnerTiers = [
  {
    icon: Users,
    name: '紹介パートナー',
    badge: 'どなたでも',
    badgeColor: 'bg-gray-100 text-gray-600',
    borderColor: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    rate: '10%',
    rateLabel: 'ストック報酬',
    description: '紹介リンクをシェアして報酬を獲得。アフィリエイトプログラムと同じ仕組みで、誰でもすぐに始められます。',
    features: [
      '専用紹介リンクの発行',
      '有料プラン成約で10%の継続報酬',
      'リアルタイム成果ダッシュボード',
    ],
    condition: '集客メーカーの無料アカウントがあればOK',
  },
  {
    icon: Award,
    name: '認定パートナー',
    badge: 'おすすめ',
    badgeColor: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-300 ring-2 ring-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    rate: '30%',
    rateLabel: 'ストック報酬',
    description: 'コンサルタントやコミュニティリーダーに最適。クライアントに集客メーカーを推奨するだけで、成約額の30%が毎月継続的に入ります。',
    features: [
      '有料プラン成約で30%の継続報酬',
      'パートナー専用の紹介ページ',
      'クライアント管理ダッシュボード',
      'セミナー共同開催の権利',
    ],
    condition: '有料プランご利用中 or 審査制（申請フォームあり）',
    highlighted: true,
  },
  {
    icon: Mic,
    name: 'セミナーパートナー',
    badge: '共同開催',
    badgeColor: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    rate: '50%',
    rateLabel: 'セミナー収益',
    description: 'クライアント向けセミナーを共同開催。参加費の50%を受け取れるうえ、セミナー経由の有料契約は30%のストック報酬も発生します。',
    features: [
      'セミナー参加費の50%を即時受取',
      'セミナー経由の有料契約で30%ストック報酬',
      'セミナー資料・台本のテンプレート提供',
      '集客メーカースタッフが講師として参加',
    ],
    condition: '認定パートナーであること',
  },
];

const seminarExamples = [
  {
    icon: Presentation,
    title: '集客メーカー活用デモセミナー',
    description: '診断クイズ・LP・予約ページなどの作成をライブで実演。「こんなに簡単にできるの？」という驚きが成約に直結します。',
    role: '集客メーカースタッフが講師',
    duration: '60〜90分',
  },
  {
    icon: Target,
    title: '集客戦略 × ツール活用ワークショップ',
    description: 'パートナーが集客戦略を解説し、集客メーカーで実装する実践型セミナー。戦略とツールの両面でクライアントを支援。',
    role: 'パートナーが戦略解説 / 集客メーカーがツール説明',
    duration: '90〜120分',
  },
  {
    icon: GraduationCap,
    title: 'クライアント向けハンズオン勉強会',
    description: 'パートナーのクライアントが実際にツールを操作しながら学ぶ形式。その場でLP完成まで導き、即成果を体感してもらいます。',
    role: 'パートナーがファシリテーション / 集客メーカーがサポート',
    duration: '120分',
  },
];

const steps = [
  { num: '01', title: 'パートナー申請', desc: 'フォームからパートナー申請を送信。審査は通常3営業日以内に完了します。', icon: Shield },
  { num: '02', title: 'パートナー認定', desc: '認定後、専用ダッシュボードと高報酬率の紹介リンクが発行されます。', icon: Award },
  { num: '03', title: 'クライアントに紹介', desc: 'クライアントに集客メーカーを推奨。セミナー共同開催も申請できます。', icon: Users },
  { num: '04', title: '報酬を獲得', desc: '成約のたびに30%のストック報酬が毎月入り続けます。', icon: DollarSign },
];

const faqs = [
  { q: 'パートナープログラムとアフィリエイトの違いは？', a: 'アフィリエイトはリンクシェアによる10%報酬のプログラムで、どなたでも参加できます。パートナープログラムはコンサルタントやリーダー向けに、30%の高報酬率とセミナー共同開催の機会を提供する上位プログラムです。' },
  { q: '認定パートナーになるための条件は？', a: '集客メーカーの有料プラン（standard以上）をご利用中の方は自動的に申請資格があります。有料プランをご利用でない方も、申請フォームから審査を受けていただけます。' },
  { q: 'ストック報酬とは何ですか？', a: 'あなたの紹介で有料プランに加入したクライアントが課金を継続している間、毎月報酬が発生し続ける仕組みです。紹介が増えるほど安定した継続収入になります。' },
  { q: 'セミナーの共同開催はどのように進みますか？', a: 'パートナーが集客（参加者募集）を担当し、集客メーカーがセミナー資料の準備と当日の講師を担当します。開催形式や内容はご相談のうえ柔軟に対応します。' },
  { q: 'セミナーの参加者は自分のクライアント限定ですか？', a: 'クライアント限定でも、パートナーが集めた一般参加者でもOKです。パートナー経由の参加者であれば報酬対象になります。' },
  { q: '報酬はどのように受け取れますか？', a: '毎月の報酬は管理画面で確認でき、所定の金額に達した時点で振込申請が可能です。セミナー収益は開催後に精算します。' },
  { q: '途中で辞めることはできますか？', a: 'はい、いつでも解除可能です。ただし、解除後は新規紹介の報酬は発生しません。既存の紹介分のストック報酬は規約に基づきます。' },
];

export default function PartnerProgramPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-amber-50 via-orange-50/30 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-6">
              <Handshake className="w-4 h-4" />
              起業家支援コンサル・リーダー向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              クライアントの集客を支援して<br />
              <span className="text-amber-600">継続報酬を得る</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              集客メーカーのパートナープログラム。
              <br className="hidden sm:block" />
              クライアントに推奨するだけで<strong className="text-gray-900">成約額の最大30%</strong>が毎月入り続けます。
              <br className="hidden sm:block" />
              セミナー共同開催なら<strong className="text-gray-900">参加費の50%</strong>も。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#apply" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Handshake className="w-5 h-5" />
                パートナーに申請する
              </Link>
              <a href="#tiers" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold text-lg rounded-xl border border-amber-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                報酬プランを見る <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />審査制で信頼性が高い</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />最大30%のストック報酬</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />セミナー共同開催対応</span>
            </div>
          </div>
        </section>

        {/* Problem / Empathy */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんなお悩みはありませんか？</h2>
            <p className="text-gray-600 text-center mb-10">起業家支援に携わる方の共通課題</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'クライアントに「集客どうすれば」と聞かれるが、手軽に使えるツールを勧められない',
                'LP制作や診断クイズをクライアントの代わりに作る時間がない',
                'クライアントにツールを勧めても、自分には何のメリットもない',
                'セミナーネタが尽きてきた。新しいコンテンツで開催したい',
              ].map((pain) => (
                <div key={pain} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <span className="text-red-400 mt-0.5 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-semibold">
                <Sparkles className="w-5 h-5" />
                パートナープログラムなら、すべて解決できます
              </p>
            </div>
          </div>
        </section>

        {/* Partner Tiers */}
        <section id="tiers" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">3つのパートナータイプ</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">あなたの関わり方に合わせて、最適なパートナータイプをお選びいただけます。</p>
          <div className="grid lg:grid-cols-3 gap-6">
            {partnerTiers.map((tier) => (
              <div key={tier.name} className={`relative bg-white border ${tier.borderColor} rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">人気</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${tier.iconBg} rounded-xl flex items-center justify-center`}>
                    <tier.icon className={`w-6 h-6 ${tier.iconColor}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badgeColor}`}>{tier.badge}</span>
                    <h3 className="font-bold text-gray-900 text-lg mt-1">{tier.name}</h3>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.rate}</span>
                  <span className="text-sm text-gray-500">{tier.rateLabel}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{tier.description}</p>
                <ul className="space-y-2 mb-4 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700">条件:</span> {tier.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue Simulation */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50/50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">収益シミュレーション</h2>
            <p className="text-gray-600 text-center mb-10">認定パートナー + セミナー開催の場合</p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Seminar Revenue */}
              <div className="bg-white border border-amber-200 rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900">セミナー開催（1回）</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">参加者 10名 x ¥10,000</span>
                    <span className="font-bold text-gray-900">¥100,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">パートナー報酬（50%）</span>
                    <span className="font-bold text-amber-600 text-lg">¥50,000</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-1">セミナー1回の開催で即時収益</p>
                </div>
              </div>

              {/* Stock Revenue */}
              <div className="bg-white border border-blue-200 rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">ストック報酬（継続）</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">うち3名がbusiness契約（¥4,980/月）</span>
                    <span className="font-bold text-gray-900">¥14,940/月</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">パートナー報酬（30%）</span>
                    <span className="font-bold text-blue-600 text-lg">¥4,482/月</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-1">契約が続く限り毎月入り続ける収入</p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-white border-2 border-amber-300 rounded-2xl shadow-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">セミナー1回あたりのパートナー収益</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                <div>
                  <span className="text-sm text-gray-500">即時収益</span>
                  <p className="text-2xl font-extrabold text-amber-600">¥50,000</p>
                </div>
                <span className="text-2xl text-gray-300 hidden sm:block">+</span>
                <div>
                  <span className="text-sm text-gray-500">継続収益（月額）</span>
                  <p className="text-2xl font-extrabold text-blue-600">¥4,482/月〜</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">セミナーを月1回開催し、毎回3名が有料契約した場合 → 年間ストック報酬 <span className="font-bold text-gray-700">¥53,784〜</span>（積み上がります）</p>
            </div>
          </div>
        </section>

        {/* Seminar Examples */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">セミナー共同開催の例</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">開催内容はご相談のうえ柔軟に対応します。以下は代表的なパターンです。</p>
          <div className="grid md:grid-cols-3 gap-6">
            {seminarExamples.map((ex) => (
              <div key={ex.title} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <ex.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{ex.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{ex.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{ex.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>目安: {ex.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              上記以外にも、パートナーの専門分野に合わせたカスタム内容で開催可能です。
              <br />
              パートナーのクライアント向けはもちろん、一般参加者を集めてのセミナーも報酬対象です。
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">パートナーになるまでの流れ</h2>
            <p className="text-gray-600 text-center mb-12">申請から報酬獲得まで</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-amber-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 mb-1">STEP {step.num}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who is this for */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方に最適です</h2>
          <p className="text-gray-600 text-center mb-12">すでに起業家やビジネスオーナーを支援している方へ</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: '起業家支援コンサルタント', desc: 'クライアントの集客課題を解決するツールとして推奨。コンサルの付加価値もアップ。', emoji: '🎯' },
              { title: 'コミュニティリーダー', desc: 'メンバーにビジネスツールを提供しながら、コミュニティ運営の収益源にも。', emoji: '👥' },
              { title: 'ビジネスコーチ', desc: 'コーチングの一環としてツール活用を指導。クライアントの自走力を高めます。', emoji: '🏆' },
              { title: 'ビジネススクール講師', desc: '受講生にすぐ使える集客ツールを紹介。「学んで終わり」にしない実践環境を提供。', emoji: '📚' },
              { title: 'Web制作・マーケティング会社', desc: 'クライアントに自分で更新できるLP・クイズを提案。制作案件にプラスの付加価値。', emoji: '💻' },
              { title: '士業・経営コンサルタント', desc: '顧問先の集客支援に。本業と相乗効果のある新たな収益チャネルになります。', emoji: '📋' },
            ].map((persona) => (
              <div key={persona.title} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <span className="text-3xl mb-3 block">{persona.emoji}</span>
                <h3 className="font-bold text-gray-900 mb-2">{persona.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{persona.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison with regular affiliate */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">通常アフィリエイトとの比較</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 min-w-[140px]"></th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-500 min-w-[140px]">紹介パートナー</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-amber-600 min-w-[140px] bg-amber-50/50">認定パートナー</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-blue-600 min-w-[140px]">セミナーパートナー</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { label: 'ストック報酬率', values: ['10%', '30%', '30%'] },
                    { label: 'セミナー共同開催', values: ['-', '申請可', '参加費の50%'] },
                    { label: '専用紹介ページ', values: ['-', 'あり', 'あり'] },
                    { label: 'クライアント管理', values: ['-', 'ダッシュボード', 'ダッシュボード'] },
                    { label: '資料テンプレート', values: ['-', '-', '提供'] },
                    { label: '参加条件', values: ['誰でも', '有料プラン or 審査', '認定パートナー'] },
                  ].map((row, i) => (
                    <tr key={row.label} className={i < 5 ? 'border-b border-gray-100' : ''}>
                      <td className="px-4 py-3 font-semibold text-gray-700">{row.label}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{row.values[0]}</td>
                      <td className="px-4 py-3 text-center text-amber-700 font-semibold bg-amber-50/30">{row.values[1]}</td>
                      <td className="px-4 py-3 text-center text-blue-700 font-semibold">{row.values[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-200 rounded-2xl shadow-sm">
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none font-semibold text-gray-900 hover:text-amber-600 transition-colors min-h-[44px]">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="apply" className="bg-gradient-to-br from-amber-600 to-orange-700 py-16 text-white text-center scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4">
            <Handshake className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">パートナーとして一緒に<br className="sm:hidden" />クライアントを支援しませんか？</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              クライアントの成果を出しながら、あなたの収益も積み上がる。
              <br className="hidden sm:block" />
              まずはお気軽にご申請ください。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard?view=affiliate" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 min-h-[44px]">
                <Handshake className="w-5 h-5" />
                パートナーに申請する
              </Link>
              <a href="mailto:support@makers.tokyo?subject=パートナープログラムについて" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold text-lg rounded-xl border border-white/30 hover:bg-white/20 transition-all duration-200 min-h-[44px]">
                まずは相談する <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm opacity-70 mt-6">審査は通常3営業日以内に完了します</p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
