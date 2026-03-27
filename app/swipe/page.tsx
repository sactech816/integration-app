import { Metadata } from 'next';
import Link from 'next/link';
import {
  Layers,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  CreditCard,
  ChevronRight,
  Users,
  Monitor,
} from 'lucide-react';
import SwipeLandingHeader from '@/components/swipe/SwipeLandingHeader';

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'スワイプメーカー【無料】カルーセルLP作成ツール | 集客メーカー',
  description:
    'スワイプ型カルーセルLP（ランディングページ）を無料で作成。画像カードをスワイプで見せて商品・サービスを魅力的にプレゼン。Stripe決済連携・テンプレート付き。最短5分で作成・公開。',
  keywords: [
    'スワイプ',
    'カルーセル',
    'LP',
    'ランディングページ',
    '無料',
    '作成ツール',
    '集客',
    'Stripe決済',
    '商品紹介',
    'サービス紹介',
  ],
  openGraph: {
    title: 'スワイプメーカー | カルーセルLP作成ツール',
    description:
      'スワイプ型カルーセルLPを無料で作成。画像カードで商品・サービスを魅力的にプレゼン。最短5分で作成・公開。',
    type: 'website',
    url: 'https://makers.tokyo/swipe',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スワイプメーカー | カルーセルLP作成ツール',
    description: 'スワイプ型カルーセルLPを無料で作成。最短5分で商品・サービス紹介ページが完成。',
  },
  alternates: {
    canonical: 'https://makers.tokyo/swipe',
  },
};

// ─── 構造化データ（JSON-LD） ──────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'スワイプメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'スワイプ型カルーセルLP（ランディングページ）を作成するツール。画像カードを横スワイプで見せて商品・サービスを魅力的にプレゼン。テンプレート・Stripe決済連携付き。',
      url: 'https://makers.tokyo/swipe',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'JPY',
        description: '基本プランは無料で利用可能',
      },
      featureList: [
        '画像カルーセル＋LP一体型ページ',
        '自動再生・スワイプ対応',
        'サムネイルメーカー連携',
        'Stripe決済統合',
        'テンプレート付き',
      ],
      provider: {
        '@type': 'Organization',
        name: '集客メーカー',
        url: 'https://makers.tokyo',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'スワイプメーカーとは何ですか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'スワイプメーカーは、画像カードを横スワイプで見せるカルーセル型LPを簡単に作成できるツールです。商品やサービスの紹介、ポートフォリオ、セミナー告知などに最適です。',
          },
        },
        {
          '@type': 'Question',
          name: 'スマートフォンでも見れますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'はい。スマートフォンではスワイプ操作、PCではカルーセル表示に自動対応します。どのデバイスでも最適な表示で閲覧できます。',
          },
        },
        {
          '@type': 'Question',
          name: '決済機能はありますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'はい。Stripe決済を統合でき、カルーセル下部に購入ボタンを設置できます。商品販売やサービス申込みに直接つなげられます。',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'スワイプメーカー', item: 'https://makers.tokyo/swipe' },
      ],
    },
  ],
};

// ─── ページコンテンツデータ ────────────────────────────────────────────────────
const features = [
  {
    icon: Layers,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-100',
    title: 'カルーセル＋LP一体型',
    desc: '画像カードのスワイプカルーセルと、その下のLP（テキスト・料金表・FAQ・CTA等）を1ページにまとめて公開。商品紹介からお申し込みまでを一気通貫で完結できます。',
  },
  {
    icon: Smartphone,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
    title: 'スマホ・PC自動対応',
    desc: 'スマートフォンではスワイプ操作、PCではカルーセル自動再生に対応。閲覧者のデバイスに合わせて最適な表示を自動切替します。',
  },
  {
    icon: ImageIcon,
    iconClass: 'text-pink-600',
    bgClass: 'bg-pink-100',
    title: 'サムネイルメーカー連携',
    desc: 'サムネイルメーカーで作成済みの画像をワンクリックでカードの背景に設定可能。もちろん画像アップロードやテキスト+背景のテンプレートモードも使えます。',
  },
  {
    icon: CreditCard,
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-100',
    title: 'Stripe決済連携',
    desc: 'LP下部に購入ボタンを設置し、Stripe Checkoutで決済を完結。デジタル商品・サービスの販売ページとしてそのまま使えます。',
  },
];

const steps = [
  {
    num: '01',
    title: 'テンプレートを選ぶ',
    desc: '商品紹介・セミナー・ポートフォリオなど、用途に合ったテンプレートを選択。カード＋LP部分が一括で設定されます。',
    icon: Palette,
  },
  {
    num: '02',
    title: 'カード＆LPを編集',
    desc: '画像のアップロードやテキスト入力、LP部分のブロック追加・編集をエディタで行います。',
    icon: Layers,
  },
  {
    num: '03',
    title: '公開して共有',
    desc: '専用URLで即公開。SNS・LINE・メルマガで共有するだけ。決済機能をONにすれば販売ページにもなります。',
    icon: Globe,
  },
];

const useCases = [
  {
    profession: '物販・EC',
    title: '商品紹介カルーセル',
    desc: '商品写真をスワイプで見せて、料金・特徴・購入ボタンまでを1ページに。Stripe決済で即販売開始。',
    emoji: '🛍️',
    badge: '商品販売ページに',
  },
  {
    profession: 'セミナー・講座主催',
    title: 'セミナー告知ページ',
    desc: 'セミナーの内容をカードで視覚的にプレゼン。講師プロフィール・参加者の声・申込みフォームまでワンストップ。',
    emoji: '🎓',
    badge: '集客・申込みの獲得に',
  },
  {
    profession: 'クリエイター・デザイナー',
    title: 'ポートフォリオ',
    desc: '作品をカード形式で一覧表示。お問い合わせフォームやSNSリンクも一緒に公開できる、名刺代わりのページ。',
    emoji: '🎨',
    badge: 'ポートフォリオ公開に',
  },
  {
    profession: '飲食店・サロン',
    title: 'メニュー紹介ページ',
    desc: 'メニュー写真をスワイプで紹介。店舗情報・地図・予約リンクもまとめて、SNS用リンクインバイオに最適。',
    emoji: '🍽️',
    badge: 'メニュー紹介・予約獲得に',
  },
];

const faqs = [
  {
    q: 'スワイプメーカーとは何ですか？',
    a: '画像カードを横スワイプで見せるカルーセルと、その下にLP（テキスト・料金表・FAQ・CTAなど）を配置した1ページ型のランディングページを作成できるツールです。',
  },
  {
    q: 'スマートフォンでも閲覧できますか？',
    a: 'はい。スマートフォンではスワイプ操作、PCではカルーセル自動再生に対応します。どのデバイスでも快適に閲覧できるレスポンシブデザインです。',
  },
  {
    q: '無料で使えますか？',
    a: '基本的なスワイプページの作成・公開は無料でご利用いただけます。テンプレートも無料で使用可能です。',
  },
  {
    q: '決済機能はどう使いますか？',
    a: 'エディタの「決済設定」から有料モードをONにし、Stripe Price IDまたは外部決済リンクを設定するだけ。LP下部に購入ボタンが自動表示されます。',
  },
  {
    q: 'カードの画像サイズは？',
    a: '9:16（縦長・Instagram Story向き）、1:1（正方形・Instagram投稿向き）、16:9（横長・YouTube向き）の3種類のアスペクト比から選べます。推奨サイズはそれぞれ 1080×1920、1080×1080、1920×1080 です。',
  },
];

// ─── ページ本体（Server Component） ───────────────────────────────────────────
export default function SwipeLandingPage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <SwipeLandingHeader />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-violet-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-6">
              <Layers className="w-4 h-4" />
              カルーセル型LP作成ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              スワイプで魅せる<br />
              <span className="text-violet-600">カルーセルLP</span>を作ろう
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              画像カードのスワイプカルーセル＋LP部分を1ページに統合。
              <br className="hidden sm:block" />
              商品紹介・セミナー告知・ポートフォリオに最適なページが最短5分で完成します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/swipe/editor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
              >
                <Layers className="w-5 h-5" />
                無料でスワイプLPを作る
              </Link>
              <Link
                href="/demos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-semibold text-lg rounded-xl border border-violet-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]"
              >
                デモを見る
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 安心ポイント */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />最短5分で完成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />テンプレート付き</span>
            </div>
          </div>
        </section>

        {/* ── 特徴セクション ────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            スワイプメーカーの特徴
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            カルーセル表示とLP部分を1ページにまとめた、新しい形のランディングページ作成ツールです。
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`w-12 h-12 mb-4 ${f.bgClass} rounded-xl flex items-center justify-center`}>
                  <f.icon className={`w-6 h-6 ${f.iconClass}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3ステップ ──────────────────────────────────────────────────── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
              たった3ステップで完成
            </h2>
            <p className="text-gray-600 text-center mb-12">最短5分。テンプレートを選んですぐ始められます</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-violet-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-violet-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/swipe/editor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
              >
                <Layers className="w-5 h-5" />
                今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* ── こんな方が使っています ────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            こんな方が使っています
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            商品紹介からポートフォリオまで、ビジュアル訴求が必要なあらゆるシーンに対応します
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.profession}
                className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-violet-600 mb-1 uppercase tracking-wide">
                      {uc.profession}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-base">「{uc.title}」</h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{uc.desc}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {uc.badge}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PC・スマホ表示の違い ──────────────────────────────────── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
              デバイスに合わせた最適表示
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              閲覧者のデバイスに応じてカルーセルの表示方法を自動で最適化します
            </p>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">スマートフォン</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  指でスワイプしてカードを切替。<br />
                  直感的な操作で画像を閲覧できます。<br />
                  「全表示」モードも選択可能。
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-2xl flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">PC</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  カルーセルで自動再生。<br />
                  矢印ボタンとインジケーターで操作。<br />
                  再生間隔はカスタマイズ可能。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── よくある質問（FAQ / AEO対策） ────────────────────────────── */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
              よくある質問
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <summary data-speakable="question" className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-violet-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 最終CTA ───────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              スワイプLPを作ってみよう
            </h2>
            <p className="text-violet-100 mb-8 text-lg">
              無料で作成・公開できます。テンプレートを選んで5分で最初のページが完成します。
            </p>
            <Link
              href="/swipe/editor"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-violet-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Layers className="w-5 h-5" />
              無料でスワイプLPを作る
            </Link>
            <p className="text-violet-200 text-sm mt-4">クレジットカード不要・いつでもキャンセル可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
