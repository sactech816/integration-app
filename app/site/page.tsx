import { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe, Layout, FileText, Palette,
  CheckCircle2, ArrowRight, ChevronRight, Smartphone, Navigation,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'マイサイトメーカー（複数ページサイト作成ツール）| 集客メーカー',
  description:
    'お店・教室・フリーランスの複数ページサイトを無料で簡単作成。ナビゲーション自動生成・テンプレート付き・レスポンシブ対応。ブロック編集で本格的なビジネスサイトを数分で構築。',
  keywords: ['サイト作成', 'ホームページ作成', '複数ページ', 'ナビゲーション', '店舗サイト', 'フリーランス', '無料'],
  openGraph: {
    title: 'マイサイトメーカー | 集客メーカー',
    description: '複数ページのビジネスサイトを無料で作成。ナビゲーション自動生成・テンプレート付き・レスポンシブ対応。',
    type: 'website',
    url: 'https://makers.tokyo/site',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'マイサイトメーカー | 集客メーカー', description: '複数ページのビジネスサイトを無料作成。ナビゲーション自動生成・テンプレート付き。' },
  alternates: { canonical: 'https://makers.tokyo/site' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'マイサイトメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: '複数ページのビジネスサイトを簡単作成。ナビゲーション自動生成・テンプレート・ブロック編集で本格サイトを構築。',
      url: 'https://makers.tokyo/site',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'マイサイトメーカーではどのようなサイトが作れますか？', acceptedAnswer: { '@type': 'Answer', text: '店舗・教室・フリーランスなど、複数ページのビジネスサイトを作成できます。トップページ・サービス紹介・料金・アクセスなど、自由にページを追加してナビゲーションメニューが自動生成されます。' } },
        { '@type': 'Question', name: 'テンプレートはありますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。店舗向け・セミナー講師向け・フリーランス向け・白紙の4種類のテンプレートをご用意しています。テンプレートを選んでからカスタマイズすることで、すぐにサイトを完成させられます。' } },
        { '@type': 'Question', name: 'スマホ対応していますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。作成したサイトは自動的にスマートフォン・タブレット・PCに対応したレスポンシブデザインになります。ハンバーガーメニューも自動で表示されます。' } },
        { '@type': 'Question', name: '無料で使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。マイサイトメーカーの作成・公開は無料でご利用いただけます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'マイサイトメーカー', item: 'https://makers.tokyo/site' },
      ],
    },
  ],
};

const features = [
  { icon: FileText, iconClass: 'text-cyan-600', bgClass: 'bg-cyan-100', title: '複数ページ対応', desc: 'トップページ・サービス紹介・料金・アクセスなど、必要なページを自由に追加。ページの並び替えや表示・非表示も簡単に設定できます。' },
  { icon: Navigation, iconClass: 'text-teal-600', bgClass: 'bg-teal-100', title: 'ナビゲーション自動生成', desc: 'ページを追加するだけでナビゲーションメニューが自動生成。デスクトップではヘッダーメニュー、スマホではハンバーガーメニューに自動対応。' },
  { icon: Palette, iconClass: 'text-cyan-700', bgClass: 'bg-cyan-50', title: 'テンプレート＆ブロック編集', desc: '店舗・講師・フリーランス向けのテンプレートからスタート。15種類以上のブロックで自由にカスタマイズできます。' },
  { icon: Smartphone, iconClass: 'text-teal-700', bgClass: 'bg-teal-50', title: 'レスポンシブ対応', desc: 'PC・タブレット・スマートフォンすべてに自動最適化。どのデバイスからでも美しく表示されます。' },
];

const steps = [
  { num: '01', title: 'テンプレートを選択', desc: '店舗・講師・フリーランス・白紙の4種類から目的に合ったテンプレートを選択。ページ構成が自動でセットされます。', icon: Layout },
  { num: '02', title: 'ページを編集・追加', desc: '各ページのブロックを編集してコンテンツを作成。新しいページの追加や並び替えも自由自在。', icon: FileText },
  { num: '03', title: 'URLを共有してサイト公開', desc: '専用URLが発行されます。SNS・メール・名刺でシェアしてビジネスの集客に活用できます。', icon: Globe },
];

const useCases = [
  { profession: '店舗オーナー', title: 'お店の情報をまとめたサイト', desc: 'メニュー・営業時間・アクセス・Googleマップ・ギャラリーを1つのサイトにまとめて、お客様に必要な情報を届けられます。', emoji: '🏪', badge: '来店促進に' },
  { profession: 'セミナー講師', title: '講座・セミナーの紹介サイト', desc: '講師プロフィール・講座一覧・受講者の声・お申し込みフォームを掲載。信頼感のある講座紹介サイトを構築できます。', emoji: '👨‍🏫', badge: '受講生獲得に' },
  { profession: 'フリーランス', title: 'ポートフォリオ＆サービス紹介', desc: '実績紹介・サービス内容・料金プラン・お問い合わせフォームを掲載。クライアント獲得に最適なサイトを作成できます。', emoji: '💻', badge: '案件獲得に' },
  { profession: '教室・スクール', title: '教室の総合案内サイト', desc: 'クラス紹介・スケジュール・料金・講師紹介・体験申し込みをまとめて掲載。生徒募集に効果的なサイトを構築できます。', emoji: '🎓', badge: '生徒募集に' },
];

const faqs = [
  { q: 'マイサイトメーカーではどのようなサイトが作れますか？', a: '店舗・教室・フリーランスなど、複数ページのビジネスサイトを作成できます。トップページ・サービス紹介・料金・アクセスなど、自由にページを追加してナビゲーションメニューが自動生成されます。' },
  { q: 'テンプレートはありますか？', a: 'はい。店舗向け・セミナー講師向け・フリーランス向け・白紙の4種類のテンプレートをご用意しています。テンプレートを選んでからカスタマイズすることで、すぐにサイトを完成させられます。' },
  { q: '何ページまで追加できますか？', a: 'ページ数に制限はありません。必要なだけページを追加できます。ナビゲーションに表示するかどうかはページごとに設定できます。' },
  { q: 'スマホ対応していますか？', a: 'はい。作成したサイトは自動的にスマートフォン・タブレット・PCに対応したレスポンシブデザインになります。ハンバーガーメニューも自動で表示されます。' },
  { q: '無料で使えますか？', a: 'はい。マイサイトメーカーの作成・公開は無料でご利用いただけます。' },
];

export default function SiteLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="mini-site" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-cyan-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              複数ページ・ナビ自動生成・テンプレート搭載
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              お店・教室のサイトを<br />
              <span className="text-cyan-600">かんたんに作成</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              複数ページのビジネスサイトをブロック編集で簡単作成。
              <br className="hidden sm:block" />
              ナビゲーションメニューが自動生成され、スマホ対応も完璧です。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/site/editor?new=1" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Globe className="w-5 h-5" />
                無料でサイトを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 font-semibold text-lg rounded-xl border border-cyan-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />15種類以上のブロック</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />レスポンシブ対応</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">マイサイトメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">複数ページ対応＆ナビゲーション自動生成で、本格的なビジネスサイトを簡単に構築できます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでサイトを作成</h2>
            <p className="text-gray-600 text-center mb-12">テンプレートを選んでブロックを編集するだけ。数分で本格的なサイトが完成します</p>
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
              <Link href="/site/editor?new=1" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Globe className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">店舗・教室・フリーランスなど、さまざまなビジネスのサイト作成に活用されています</p>
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
          <div className="bg-gradient-to-br from-cyan-600 to-teal-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐマイサイトを作ってみよう</h2>
            <p className="text-cyan-100 mb-8 text-lg">無料で作成・公開できます。あなたのビジネスをオンラインで発信しましょう。</p>
            <Link href="/site/editor?new=1" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-cyan-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Globe className="w-5 h-5" />無料でサイトを作る
            </Link>
            <p className="text-cyan-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
