import { Metadata } from 'next';
import Link from 'next/link';
import {
  UserCircle, Sparkles, Globe, MessageSquare, Share2,
  CheckCircle2, ArrowRight, ChevronRight, Link2, Image,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'プロフィールメーカー | 集客メーカー',
  description:
    'プロフィールページを無料で作成。AIが自己紹介文を自動生成、SNSリンク・問い合わせフォームを一体化。フリーランサー・コーチ・コンサルタント・講師の個人ブランディングに最適。',
  keywords: ['プロフィールページ', '自己紹介ページ', '個人ページ', '集客', '無料作成', 'フリーランス', 'コーチ', 'コンサルタント'],
  openGraph: {
    title: 'プロフィールメーカー | 集客メーカー',
    description: 'AIがプロフィール文を自動生成。SNSリンク・問い合わせフォームを一体化した集客用プロフィールページを無料作成。',
    type: 'website',
    url: 'https://makers.tokyo/profile',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'プロフィールメーカー | 集客メーカー', description: 'AIがプロフィール文を自動生成。集客できる個人ページを無料作成。' },
  alternates: { canonical: 'https://makers.tokyo/profile' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'プロフィールメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: '個人・専門家向けプロフィールページ作成ツール。AIが自己紹介文を自動生成し、SNSリンク・問い合わせフォームを一体化。',
      url: 'https://makers.tokyo/profile',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'プロフィールページはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: '名前・職業・自己紹介などの情報を入力するだけで、AIが魅力的なプロフィール文を自動生成します。デザインを選んで公開するまで最短5分で完成します。' } },
        { '@type': 'Question', name: 'プロフィールページで集客できますか？', acceptedAnswer: { '@type': 'Answer', text: 'SNS各種のリンク集として使えるほか、問い合わせフォームや予約ボタンを設置することで、訪問者をお客様に転換する集客ページとして機能します。' } },
        { '@type': 'Question', name: '独自ドメインで使えますか？', acceptedAnswer: { '@type': 'Answer', text: '作成したプロフィールページは専用URLで公開されます。Instagramのプロフィールリンクや名刺のQRコードとしても活用できます。' } },
        { '@type': 'Question', name: 'どんな人に向いていますか？', acceptedAnswer: { '@type': 'Answer', text: 'フリーランサー・コーチ・コンサルタント・講師・士業など、個人でサービスを提供する方に最適です。オンライン上での自己紹介と集客を同時に実現します。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'プロフィールメーカー', item: 'https://makers.tokyo/profile' },
      ],
    },
  ],
};

const features = [
  { icon: Sparkles, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: 'AIが自己紹介文を自動生成', desc: '職業・強み・実績を入力するだけで、AIが魅力的な自己紹介文を自動生成。文章が苦手な方でもプロらしいプロフィールが完成します。' },
  { icon: Link2, iconClass: 'text-emerald-700', bgClass: 'bg-emerald-50', title: 'SNSリンクを一か所に集約', desc: 'X・Instagram・YouTube・LINEなど複数のSNSリンクをひとつのページにまとめ。名刺代わりにも使えます。' },
  { icon: MessageSquare, iconClass: 'text-teal-600', bgClass: 'bg-teal-100', title: '問い合わせ・予約を受け付ける', desc: 'プロフィールページに問い合わせフォームや予約ボタンを設置。閲覧者をそのままお客様に転換できます。' },
  { icon: Image, iconClass: 'text-green-600', bgClass: 'bg-green-100', title: 'スマホで美しく表示', desc: 'どのデバイスでも美しく表示されるレスポンシブデザイン。SNSからのアクセスも快適に閲覧できます。' },
];

const steps = [
  { num: '01', title: 'プロフィール情報を入力', desc: '名前・職業・自己紹介・強みなどを入力。AIが魅力的な文章に整えます。', icon: UserCircle },
  { num: '02', title: 'デザイン・リンクを設定', desc: 'テンプレートを選んでブランドカラーを設定。SNSリンクや連絡先も追加。', icon: Image },
  { num: '03', title: '公開・シェアして集客', desc: '専用URLをSNSのプロフィール欄や名刺のQRコードに設定して集客開始。', icon: Globe },
];

const useCases = [
  { profession: 'フリーランスデザイナー', title: 'ポートフォリオ＆連絡先ページ', desc: '作品集とSNSリンクを一か所に。クライアントへ仕事依頼の入口を提供。', emoji: '🎨', badge: '案件獲得の入口として' },
  { profession: 'コーチ・カウンセラー', title: 'セッション申込みページ', desc: 'コーチングの理念・実績・料金をまとめ、体験セッション申込みへ誘導。', emoji: '🌱', badge: '体験申込みの増加に' },
  { profession: 'コンサルタント', title: '実績・専門性アピールページ', desc: '経歴・得意分野・事例をコンパクトに紹介。問い合わせへの敷居を下げる。', emoji: '💼', badge: '信頼性の向上に' },
  { profession: '講師・セミナー主催者', title: '講座・セミナー案内ページ', desc: 'プロフィールから提供する講座一覧へシームレスに誘導。受講者の獲得に。', emoji: '📖', badge: '受講申込みの促進に' },
];

const faqs = [
  { q: 'プロフィールページはどのように作りますか？', a: '名前・職業・自己紹介などの情報を入力するだけで、AIが魅力的なプロフィール文を自動生成します。デザインを選んで公開するまで最短5分で完成します。' },
  { q: 'プロフィールページで集客できますか？', a: 'SNS各種のリンク集として使えるほか、問い合わせフォームや予約ボタンを設置することで、訪問者をお客様に転換する集客ページとして機能します。' },
  { q: 'Instagramのプロフィールリンクとして使えますか？', a: 'はい。専用URLをInstagram・X・LINEなどのプロフィール欄に設置することで、SNSから自分のサービスへ誘導できます。' },
  { q: 'どんな人に向いていますか？', a: 'フリーランサー・コーチ・コンサルタント・講師・士業など、個人でサービスを提供する方に最適です。オンライン上での自己紹介と集客を同時に実現します。' },
  { q: '無料で使えますか？', a: '基本的なプロフィールページの作成・公開は無料でご利用いただけます。より高度なカスタマイズはPROプランでご利用いただけます。' },
];

export default function ProfileLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="profile" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-emerald-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              <UserCircle className="w-4 h-4" />
              個人・フリーランス・専門家向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              あなたを伝える<br />
              <span className="text-emerald-600">プロフィールページ</span>を作る
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              AIが自己紹介文を自動生成。SNSリンク・問い合わせフォームを一体化した
              <br className="hidden sm:block" />
              集客できる個人ページを、最短5分で作成・公開できます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/profile/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <UserCircle className="w-5 h-5" />
                無料でプロフィールを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold text-lg rounded-xl border border-emerald-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />最短5分で完成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />SNSリンク集にも</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">プロフィールメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">自己紹介ページをただ作るだけでなく、集客・問い合わせにつながる仕組みが揃っています。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで完成</h2>
            <p className="text-gray-600 text-center mb-12">最短5分。文章が苦手でも大丈夫です</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-emerald-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-emerald-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/profile/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <UserCircle className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">個人・フリーランス・専門家のオンライン集客を強化します</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-emerald-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐプロフィールページを作ろう</h2>
            <p className="text-emerald-100 mb-8 text-lg">無料で作成・公開できます。最短5分でプロらしいページが完成します。</p>
            <Link href="/profile/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <UserCircle className="w-5 h-5" />無料でプロフィールを作る
            </Link>
            <p className="text-emerald-200 text-sm mt-4">クレジットカード不要・いつでも編集可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
