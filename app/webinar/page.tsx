import { Metadata } from 'next';
import Link from 'next/link';
import {
  Video, Clock, MousePointerClick, Users,
  CheckCircle2, ArrowRight, ChevronRight, Globe, Layout, Timer,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'ウェビナーLPメーカー（ウェビナーLP作成ツール）| 集客メーカー',
  description:
    'ウェビナー・オンラインセミナー専用のランディングページを無料で作成。動画埋め込み・カウントダウンタイマー・時間制御CTA・講師紹介・リードフォーム搭載。高コンバージョンなウェビナーLPを数分で構築。',
  keywords: ['ウェビナー', 'ウェビナーLP', 'ランディングページ', 'オンラインセミナー', 'セミナー集客', 'LP作成', '無料'],
  openGraph: {
    title: 'ウェビナーLPメーカー | 集客メーカー',
    description: 'ウェビナー専用LPを無料で作成。動画埋め込み・カウントダウン・時間制御CTA搭載。高コンバージョンなLPを数分で構築。',
    type: 'website',
    url: 'https://makers.tokyo/webinar',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'ウェビナーLPメーカー | 集客メーカー', description: 'ウェビナー専用LPを無料作成。動画埋め込み・カウントダウン・時間制御CTA搭載。' },
  alternates: { canonical: 'https://makers.tokyo/webinar' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'ウェビナーLPメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'ウェビナー・オンラインセミナー専用ランディングページ作成ツール。動画埋め込み・カウントダウン・時間制御CTA・リードフォーム搭載。',
      url: 'https://makers.tokyo/webinar',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'ウェビナーLPはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'ブロックを追加していくだけで作成できます。ヒーロー・動画・講師紹介・アジェンダ・カウントダウン・CTA・参加者の声・FAQなど14種類のブロックを自由に組み合わせられます。' } },
        { '@type': 'Question', name: '動画を埋め込めますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。YouTubeの動画を埋め込めます。ウェビナーの録画やプロモーション動画を効果的に配置できます。' } },
        { '@type': 'Question', name: 'カウントダウンタイマーとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'ウェビナー開催日時までのカウントダウンをリアルタイムで表示するブロックです。参加者に緊急性を伝え、申し込みを促進します。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。ウェビナーLPの作成・公開は無料でご利用いただけます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'ウェビナーLPメーカー', item: 'https://makers.tokyo/webinar' },
      ],
    },
  ],
};

const features = [
  { icon: Video, iconClass: 'text-violet-600', bgClass: 'bg-violet-100', title: 'YouTube動画の埋め込み', desc: 'ウェビナーの録画やプロモーション動画をLPに直接埋め込み。視覚的に訴求力のあるページを作成できます。' },
  { icon: Timer, iconClass: 'text-indigo-600', bgClass: 'bg-indigo-100', title: 'カウントダウンタイマー', desc: 'ウェビナー開催日時までのカウントダウンをリアルタイム表示。緊急性を演出して参加申し込みを促進します。' },
  { icon: MousePointerClick, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: '時間制御CTA', desc: '指定した秒数後にCTAボタンを表示する機能。視聴者が十分な情報を得たタイミングでアクションを促せます。' },
  { icon: Users, iconClass: 'text-violet-700', bgClass: 'bg-violet-50', title: '講師紹介・参加者の声', desc: '講師のプロフィールや参加者のテスティモニアルを効果的に配置。信頼性と説得力を高めます。' },
];

const steps = [
  { num: '01', title: 'ブロックを追加してLPを構成', desc: 'ヒーロー・動画・講師紹介・アジェンダ・CTAなどのブロックを選んで追加。ドラッグで並べ替えも自由。', icon: Layout },
  { num: '02', title: 'デザインをカスタマイズ', desc: '8種類のグラデーションプリセットやカスタムカラーでデザインを調整。レスポンシブ対応で自動最適化。', icon: Globe },
  { num: '03', title: 'URLを共有して集客開始', desc: '専用URLを発行してSNS・メール・LINEでシェア。アクセス解析でパフォーマンスも確認できます。', icon: MousePointerClick },
];

const useCases = [
  { profession: 'コーチ・コンサルタント', title: '高単価サービスの説明会LP', desc: 'カウントダウン＋時間制御CTAで緊急性と説得力を両立。説明会の申し込み率を最大化します。', emoji: '🎯', badge: '成約率アップに' },
  { profession: 'オンライン講座・スクール', title: 'ウェビナー型セールスファネル', desc: '動画埋め込み＋リードフォームで見込み客を獲得。講師紹介＋参加者の声で信頼を構築します。', emoji: '🎓', badge: '受講生獲得に' },
  { profession: '企業のマーケティング担当', title: '製品デモ・セミナー集客', desc: 'アジェンダ＋講師紹介で専門性をアピール。FAQ＋テスティモニアルで参加障壁を低減します。', emoji: '🏢', badge: 'リード獲得に' },
  { profession: '著者・専門家', title: '出版記念・特別講演の告知', desc: 'フルワイドヒーロー＋動画でインパクトのある告知ページを作成。SNSからの流入を最大化します。', emoji: '📖', badge: '集客力アップに' },
];

const faqs = [
  { q: 'ウェビナーLPはどのように作りますか？', a: 'ブロックを追加していくだけで作成できます。ヒーロー・動画・講師紹介・アジェンダ・カウントダウン・CTA・参加者の声・FAQなど14種類のブロックを自由に組み合わせられます。' },
  { q: '動画を埋め込めますか？', a: 'はい。YouTubeの動画を埋め込めます。ウェビナーの録画やプロモーション動画を効果的に配置できます。' },
  { q: 'カウントダウンタイマーとは何ですか？', a: 'ウェビナー開催日時までのカウントダウンをリアルタイムで表示するブロックです。参加者に緊急性を伝え、申し込みを促進します。' },
  { q: '時間制御CTAとは何ですか？', a: '指定した秒数が経過した後にCTAボタンを表示する機能です。動画を視聴した後など、十分な情報を得たタイミングでアクションを促すことで、コンバージョン率を高めます。' },
  { q: '無料で使えますか？', a: 'はい。ウェビナーLPの作成・公開は無料でご利用いただけます。' },
];

export default function WebinarLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="webinar" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-violet-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-6">
              <Video className="w-4 h-4" />
              動画埋め込み・カウントダウン・時間制御CTA搭載
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              ウェビナー専用LPで<br />
              <span className="text-violet-600">参加者を最大化する</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              動画・カウントダウン・時間制御CTAなど、ウェビナーに特化したブロックで
              <br className="hidden sm:block" />
              高コンバージョンなランディングページを数分で作成できます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/webinar/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Video className="w-5 h-5" />
                無料でウェビナーLPを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-semibold text-lg rounded-xl border border-violet-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />14種類のブロック</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />レスポンシブ対応</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">ウェビナーLPメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">ウェビナー集客に特化した機能で、コンバージョン率の高いLPを構築できます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでウェビナーLPを作成</h2>
            <p className="text-gray-600 text-center mb-12">ブロックを選んで追加するだけ。数分で本格的なLPが完成します</p>
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
              <Link href="/webinar/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Video className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">ウェビナー・オンラインセミナーの集客に最適なLPを作成できます</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-violet-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-violet-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐウェビナーLPを作ってみよう</h2>
            <p className="text-violet-100 mb-8 text-lg">無料で作成・公開できます。ウェビナー集客を加速しましょう。</p>
            <Link href="/webinar/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-violet-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Video className="w-5 h-5" />無料でウェビナーLPを作る
            </Link>
            <p className="text-violet-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
