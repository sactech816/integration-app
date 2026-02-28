import { Metadata } from 'next';
import Link from 'next/link';
import {
  Brain,
  Globe,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Target,
  FileText,
  Users,
  ChevronRight,
} from 'lucide-react';
import QuizLandingHeader from '@/components/quiz/QuizLandingHeader';

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: '診断クイズ作成ツール | 集客メーカー',
  description:
    '診断クイズを作成して集客・リード獲得を自動化。AIが質問・結果を自動生成、コンサルタント・コーチ・講師・士業に最適な無料の診断クイズ作成ツール。最短5分で作成・公開できます。',
  keywords: [
    '診断クイズ',
    '集客',
    'リードジェネレーション',
    'AI診断',
    '無料',
    'コンサルタント',
    'コーチ',
    '士業',
    '講師',
    '診断クイズ作成',
  ],
  openGraph: {
    title: '診断クイズ作成ツール | 集客メーカー',
    description:
      '診断クイズで集客を自動化。AIが設問・結果を自動生成、専門家の集客に最適なツール。最短5分で作成・公開。',
    type: 'website',
    url: 'https://makers.tokyo/quiz',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '診断クイズ作成ツール | 集客メーカー',
    description: '診断クイズで集客を自動化。AIが設問・結果を自動生成。最短5分で作成・公開。',
  },
  alternates: {
    canonical: 'https://makers.tokyo/quiz',
  },
};

// ─── 構造化データ（JSON-LD） ──────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '診断クイズメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        '診断クイズを作成してリード獲得・集客を自動化するツール。コンサルタント・コーチ・講師・士業向け。AIが設問・結果タイプを自動生成し、最短5分で診断クイズを作成・公開できます。',
      url: 'https://makers.tokyo/quiz',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'JPY',
        description: '基本プランは無料で利用可能',
      },
      featureList: [
        'AIによる診断クイズ自動生成',
        'カスタマイズ可能な結果ページ',
        '専用URLで公開・シェア',
        '回答データの分析',
        'スマートフォン対応',
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
          name: '診断クイズはどのように作りますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'テーマを入力するだけでAIが質問・結果タイプ・解説文を自動生成します。専門知識は不要で、最短5分で診断クイズが完成します。作成後はURLを共有するだけで公開できます。',
          },
        },
        {
          '@type': 'Question',
          name: '診断クイズで集客できますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'はい。診断クイズは高いエンゲージメント率を持つ集客ツールです。ユーザーは自分の診断結果を知りたいため最後まで回答する傾向があり、回答完了後の問い合わせ・資料請求・予約フォームへの誘導が自然な流れで行えます。',
          },
        },
        {
          '@type': 'Question',
          name: '診断クイズは無料で作れますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '基本的な診断クイズの作成・公開は無料でご利用いただけます。より高度な機能はPROプランでご利用いただけます。',
          },
        },
        {
          '@type': 'Question',
          name: '診断クイズはどんな業種・職種に向いていますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'コンサルタント・コーチ・講師・士業（税理士・社労士・FPなど）・整体師・美容師など、専門知識やサービスを提供するすべての方に向いています。「お客様の課題を可視化→専門家のサービスで解決」という自然な集客の流れを作れます。',
          },
        },
        {
          '@type': 'Question',
          name: 'スマートフォンでも診断に回答できますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '作成した診断クイズはスマートフォン・タブレット・PCすべてに対応したレスポンシブデザインで表示されます。SNSでシェアされた場合もどのデバイスからでも快適に回答できます。',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: '診断クイズ', item: 'https://makers.tokyo/quiz' },
      ],
    },
  ],
};

// ─── ページコンテンツデータ ────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
    title: 'AIが設問・結果を自動生成',
    desc: 'テーマを入力するだけで、AIが診断に最適な設問・結果タイプ・解説文をすべて自動生成。専門知識不要で最短5分で完成します。',
  },
  {
    icon: Target,
    iconClass: 'text-indigo-600',
    bgClass: 'bg-indigo-100',
    title: '次のアクションへ自然に誘導',
    desc: '結果ページに問い合わせ・資料請求・予約フォームへのCTAを設置。診断から集客まで一気通貫で完結します。',
  },
  {
    icon: Globe,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-100',
    title: '専用URLで簡単シェア',
    desc: '作成した診断は専用URLで即公開。SNS・ブログ・メルマガ・LINE公式アカウントなど、あらゆる場所からリンクできます。',
  },
  {
    icon: BarChart3,
    iconClass: 'text-sky-600',
    bgClass: 'bg-sky-100',
    title: '回答データを分析・活用',
    desc: '何人が回答し、どの結果タイプが多いかを把握。ターゲット顧客の傾向を理解してサービスや訴求を改善できます。',
  },
];

const steps = [
  {
    num: '01',
    title: 'テーマを決める',
    desc: '「コンサルタント向けビジネス課題診断」など、診断のテーマと対象者を入力するだけ。',
    icon: FileText,
  },
  {
    num: '02',
    title: '設問・結果を編集',
    desc: 'AIが自動生成した設問と結果タイプを確認・編集。ブランドカラーや画像も設定できます。',
    icon: Brain,
  },
  {
    num: '03',
    title: '公開して集客開始',
    desc: '専用URLをSNS・ブログ・メルマガで共有。集客が24時間365日、自動で動き続けます。',
    icon: Globe,
  },
];

const useCases = [
  {
    profession: 'コンサルタント',
    title: 'ビジネス課題診断',
    desc: '「あなたのビジネスの弱点は？」で課題を可視化し、結果ページから無料相談へ自然に誘導。',
    emoji: '📊',
    badge: '相談申込みの獲得に',
  },
  {
    profession: 'コーチ・カウンセラー',
    title: 'ライフスタイル診断',
    desc: '「あなたのコーチング向き度は？」で自己分析を促し、体験セッション申込みへ誘導。',
    emoji: '🌱',
    badge: '体験セッション獲得に',
  },
  {
    profession: '講師・セミナー主催',
    title: '学習スタイル診断',
    desc: '「あなたの学習タイプは？」で受講者のニーズを把握し、最適な講座を提案・申込みへ誘導。',
    emoji: '📚',
    badge: '受講申込みのCV率向上に',
  },
  {
    profession: '士業（税理士・FP・社労士）',
    title: '節税・リスクチェック診断',
    desc: '「節税できているかチェック！」でリスクを可視化し、無料相談へ自然な流れを作る。',
    emoji: '⚖️',
    badge: '無料相談の問い合わせ獲得に',
  },
];

const faqs = [
  {
    q: '診断クイズはどのように作りますか？',
    a: 'テーマを入力するだけでAIが質問・結果タイプ・解説文を自動生成します。専門知識は不要で、最短5分で診断クイズが完成します。作成後はURLを共有するだけで公開できます。',
  },
  {
    q: '診断クイズで集客できますか？',
    a: 'はい。診断クイズは高いエンゲージメント率を持つ集客ツールです。ユーザーは自分の結果を知りたいため最後まで回答する傾向があり、回答完了後の問い合わせ・資料請求・予約フォームへの誘導が自然な流れで行えます。',
  },
  {
    q: '診断クイズは無料で作れますか？',
    a: '基本的な診断クイズの作成・公開は無料でご利用いただけます。より高度な機能はPROプランでご利用いただけます。',
  },
  {
    q: 'どんな業種・職種に向いていますか？',
    a: 'コンサルタント・コーチ・講師・士業（税理士・社労士・FPなど）・整体師・美容師など、専門知識やサービスを提供するすべての方に向いています。「お客様の課題を可視化→専門家のサービスで解決」という自然な集客の流れを作れます。',
  },
  {
    q: 'スマートフォンでも回答できますか？',
    a: '作成した診断クイズはスマートフォン・タブレット・PCすべてに対応したレスポンシブデザインで表示されます。SNSでシェアされた場合もどのデバイスからでも快適に回答できます。',
  },
];

// ─── ページ本体（Server Component） ───────────────────────────────────────────
export default function QuizLandingPage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* ヘッダー（Client Component） */}
        <QuizLandingHeader />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Users className="w-4 h-4" />
              専門家・士業・コーチの集客ツール
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              診断クイズで<br />
              <span className="text-blue-600">集客を自動化</span>する
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              AIが設問・結果を自動生成。作成した診断クイズを公開するだけで、
              <br className="hidden sm:block" />
              24時間365日あなたの代わりに見込み顧客を集め続けます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quiz/editor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
              >
                <Brain className="w-5 h-5" />
                無料で診断クイズを作る
              </Link>
              <Link
                href="/demos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl border border-blue-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]"
              >
                デモを見る
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 安心ポイント */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />最短5分で完成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />専門知識不要</span>
            </div>
          </div>
        </section>

        {/* ── なぜ診断クイズが集客に強いのか ──────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            診断クイズが集客に強い理由
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            「自分のことを知りたい」という本能的な欲求を活かした集客ツール。
            高いエンゲージメントと、回答後の自然なアクション誘導が特長です。
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
            <p className="text-gray-600 text-center mb-12">最短5分。専門知識は不要です</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {/* ステップ間の矢印（デスクトップのみ） */}
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-blue-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-blue-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/quiz/editor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
              >
                <Brain className="w-5 h-5" />
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
            専門家・士業・コーチなど、サービスを提供するすべての方の集客に活用できます
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
                    <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
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

        {/* ── よくある質問（FAQ / AEO対策） ────────────────────────────── */}
        <section className="bg-gray-50 py-16">
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
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-blue-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 最終CTA ───────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              今すぐ診断クイズを作ってみよう
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              無料で作成・公開できます。登録から5分で最初の診断クイズが完成します。
            </p>
            <Link
              href="/quiz/editor"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Brain className="w-5 h-5" />
              無料で診断クイズを作る
            </Link>
            <p className="text-blue-200 text-sm mt-4">クレジットカード不要・いつでもキャンセル可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
