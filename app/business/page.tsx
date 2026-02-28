import { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2, Sparkles, LayoutTemplate, TrendingUp, SmartphoneIcon,
  CheckCircle2, ArrowRight, ChevronRight, FileText, Globe, MousePointerClick,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'LPメーカー（ランディングページ作成）| 集客メーカー',
  description:
    'AIを使ってランディングページ（LP）を無料で作成。AIがコピーを自動生成、申込みフォーム付きの高コンバージョンLPが最短10分で完成。整体院・コーチ・セミナー主催者に最適。',
  keywords: ['ランディングページ', 'LP作成', '集客', 'AI', '無料', 'コンバージョン', 'コーチング', 'セミナー', '整体'],
  openGraph: {
    title: 'LPメーカー（ランディングページ作成）| 集客メーカー',
    description: 'AIがコピーを自動生成。申込みフォーム付き高コンバージョンLPを最短10分で作成・公開。',
    type: 'website',
    url: 'https://makers.tokyo/business',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'LPメーカー | 集客メーカー', description: 'AIがコピーを自動生成。申込みフォーム付きLPを最短10分で作成。' },
  alternates: { canonical: 'https://makers.tokyo/business' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'LPメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AIを使ってランディングページを作成するツール。セールスコピーの自動生成、申込みフォーム付き、スマホ対応。',
      url: 'https://makers.tokyo/business',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'ランディングページはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'サービス名・特長・ターゲットなどを入力するだけで、AIがキャッチコピー・本文・CTAを自動生成します。セクション構成を確認・編集して公開するまで最短10分で完成します。' } },
        { '@type': 'Question', name: 'HTMLやCSSの知識がなくても作れますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。コーディング知識は一切不要です。テンプレートを選んで文章・画像を入れ替えるだけで、プロ品質のランディングページが完成します。' } },
        { '@type': 'Question', name: 'ランディングページとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'ランディングページ（LP）とは、広告やSNSからの流入を受け取り、申込み・購入・問い合わせなど特定のアクションに集中させるWebページです。通常のWebサイトと異なり、1つの目的に特化した縦長のページ構成が特徴です。' } },
        { '@type': 'Question', name: 'どんな業種に向いていますか？', acceptedAnswer: { '@type': 'Answer', text: '整体院・コーチング・セミナー・ワークショップ・オンライン講座・美容サービス・士業など、サービス・集客を必要とするあらゆる業種に対応します。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'LPメーカー', item: 'https://makers.tokyo/business' },
      ],
    },
  ],
};

const features = [
  { icon: Sparkles, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: 'AIがセールスコピーを自動生成', desc: 'サービス情報を入力するだけで、AIが訴求力の高いキャッチコピー・本文・CTAテキストを自動生成。コピーライティングの知識は不要です。' },
  { icon: LayoutTemplate, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: '実績・お客様の声セクション搭載', desc: '信頼性を高める実績・導入事例・お客様の声などのセクションをLPに追加。コンバージョン率向上に直結する要素を簡単に設置できます。' },
  { icon: MousePointerClick, iconClass: 'text-yellow-700', bgClass: 'bg-yellow-100', title: '申込みフォームと一体化', desc: '問い合わせ・資料請求・セミナー申込みなどのフォームをLPに直接埋め込み。外部フォームへの離脱なく、そのままリード獲得できます。' },
  { icon: SmartphoneIcon, iconClass: 'text-lime-600', bgClass: 'bg-lime-100', title: 'スマホ最適化デザイン', desc: 'SNS広告・Instagram・LINEからのアクセスに対応したモバイルファーストデザイン。どのデバイスでも美しく表示されます。' },
];

const steps = [
  { num: '01', title: 'サービス情報を入力', desc: 'サービス名・特長・ターゲット・強みなどを入力。AIが最適なコピーを提案します。', icon: FileText },
  { num: '02', title: 'セクション・コピーを編集', desc: 'AIが生成したLP構成を確認・カスタマイズ。画像・フォームも追加できます。', icon: LayoutTemplate },
  { num: '03', title: '公開して集客開始', desc: '専用URLをSNS・広告・QRコードで拡散。申込みが入り始めます。', icon: Globe },
];

const useCases = [
  { profession: '整体院・エステ・美容サロン', title: '体験コース申込みLP', desc: '「初回限定体験」などの特別オファーをLPで訴求し、体験予約を獲得。', emoji: '💆', badge: '新規顧客獲得に' },
  { profession: 'コーチ・カウンセラー', title: 'コーチングプログラムLP', desc: 'コーチングの価値・実績・プログラム内容を伝え、無料体験セッションへ誘導。', emoji: '🌟', badge: '体験申込みの増加に' },
  { profession: 'セミナー・ワークショップ主催', title: 'セミナー集客LP', desc: 'セミナーの魅力・登壇者・プログラムを伝え、参加申込みを促進。', emoji: '🎓', badge: '参加者募集に' },
  { profession: '講師・オンライン講座販売', title: '講座販売ページ', desc: 'コース内容・受講者の声・料金を整理して提示。購入へのハードルを下げる。', emoji: '💻', badge: '講座販売の促進に' },
];

const faqs = [
  { q: 'ランディングページはどのように作りますか？', a: 'サービス名・特長・ターゲットなどを入力するだけで、AIがキャッチコピー・本文・CTAを自動生成します。セクション構成を確認・編集して公開するまで最短10分で完成します。' },
  { q: 'HTMLやCSSの知識がなくても作れますか？', a: 'はい。コーディング知識は一切不要です。テンプレートを選んで文章・画像を入れ替えるだけで、プロ品質のランディングページが完成します。' },
  { q: 'ランディングページとは何ですか？', a: 'ランディングページ（LP）とは、広告やSNSからの流入を受け取り、申込み・購入・問い合わせなど特定のアクションに集中させるWebページです。通常のWebサイトと異なり、1つの目的に特化した縦長のページ構成が特徴です。' },
  { q: 'どんな業種に向いていますか？', a: '整体院・コーチング・セミナー・ワークショップ・オンライン講座・美容サービス・士業など、サービス・集客を必要とするあらゆる業種に対応します。' },
  { q: '無料で使えますか？', a: '基本的なLP作成・公開は無料でご利用いただけます。高度なカスタマイズやフォーム連携はPROプランでご利用いただけます。' },
];

export default function BusinessLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="business" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-6">
              <Building2 className="w-4 h-4" />
              サービス・集客を必要とするすべての方へ
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              コンバージョンする<br />
              <span className="text-amber-600">LPをAIと作る</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              AIがセールスコピーを自動生成。申込みフォーム付きの
              <br className="hidden sm:block" />
              本格ランディングページが最短10分で完成します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/business/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Building2 className="w-5 h-5" />
                無料でLPを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold text-lg rounded-xl border border-amber-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />最短10分で完成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />コーディング不要</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">LPメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">売れるLPに必要な要素がすべて揃っています。AIのサポートで誰でもプロ品質のLPを作れます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでLP完成</h2>
            <p className="text-gray-600 text-center mb-12">最短10分。コーディング知識は不要です</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-amber-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-amber-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-amber-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/business/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Building2 className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">サービス・集客が必要な事業者のLPを強力にサポートします</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-amber-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐLPを作ってみよう</h2>
            <p className="text-amber-100 mb-8 text-lg">無料で作成・公開できます。最短10分で集客LPが完成します。</p>
            <Link href="/business/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-amber-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Building2 className="w-5 h-5" />無料でLPを作る
            </Link>
            <p className="text-amber-200 text-sm mt-4">クレジットカード不要・いつでも編集可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
