import { Metadata } from 'next';
import {
  PenTool,
  CheckCircle2,
  Sparkles,
  FileText,
  Globe,
  Zap,
  Target,
  LayoutTemplate,
  DollarSign,
} from 'lucide-react';
import AdLandingHeader from '@/components/lp/AdLandingHeader';

export const metadata: Metadata = {
  title: 'AIセールスライター｜売れる文章を5分で自動生成【無料】',
  description:
    '商品情報を入力するだけで、AIがプロ品質のセールスレターを自動生成。そのままWebページとして公開可能。コピーライター不要で売れる文章が完成。',
  keywords: [
    'セールスレター 書き方',
    'LP 文章 作成',
    'コピーライティング AI',
    '売れる文章',
    'セールスコピー 自動',
    'ランディングページ 文章',
  ],
  openGraph: {
    title: 'AIセールスライター｜売れる文章を5分で自動生成【無料】',
    description: '商品情報を入力するだけ。AIがプロ品質のセールスレターを自動生成。',
    type: 'website',
    url: 'https://makers.tokyo/lp/sales-writer',
    siteName: '集客メーカー',
  },
  alternates: {
    canonical: 'https://makers.tokyo/lp/sales-writer',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AIセールスライター',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AIがプロ品質のセールスレターを自動生成。そのままWebページとして公開可能。',
  url: 'https://makers.tokyo/lp/sales-writer',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
};

export default function SalesWriterAdLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <AdLandingHeader ctaText="セールスレターを作る" ctaHref="/salesletter/editor" themeColor="rose" />

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-rose-50 via-rose-50/50 to-white">
          <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              AI自動生成 — コピーライター不要
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              <span className="text-rose-600">売れる文章</span>、<br />
              もう悩まない。<br className="sm:hidden" />
              AIが書きます。
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              商品名を入力するだけ。プロ品質のセールスレターが<strong className="text-gray-800">5分</strong>で完成。
              <br className="hidden sm:block" />
              そのままWebページとして公開でき、すぐに集客を開始できます。
            </p>

            <a
              href="/salesletter/editor"
              className="inline-flex items-center gap-2 px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <PenTool className="w-5 h-5" />
              無料でセールスレターを作る
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />クレジットカード不要</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />5分で完成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />そのままLP公開可能</span>
            </div>
          </div>
        </section>

        {/* ── 課題共感 ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            こんなお悩みありませんか？
          </h2>
          <p className="text-gray-500 text-center mb-10">1つでも当てはまるなら、AIセールスライターが解決します</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              'LPの文章が書けなくて、いつまでも公開できない',
              'プロのコピーライターに依頼すると1本10万円以上かかる',
              'ChatGPTで書いたけど「それっぽい」だけで成果が出ない',
              '何をどんな順番で書けばいいか、構成が分からない',
            ].map((pain) => (
              <div
                key={pain}
                className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-5"
              >
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-sm font-bold">!</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3ステップ ── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
              たった3ステップでプロ品質の文章が完成
            </h2>
            <p className="text-gray-500 text-center mb-12">コピーライティングの知識は一切不要</p>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  num: '1',
                  icon: FileText,
                  title: '商品情報を入力',
                  desc: '商品名・ターゲット・特徴を入力。箇条書きでOK。AIが最適な構成に組み立てます。',
                },
                {
                  num: '2',
                  icon: Sparkles,
                  title: 'AIが文章を自動生成',
                  desc: 'プロのセールスライターと同じ構成で、ヘッドライン・本文・CTAまで一括生成。',
                },
                {
                  num: '3',
                  icon: Globe,
                  title: 'そのままLP公開',
                  desc: '生成したセールスレターをそのままWebページとして公開。URL共有ですぐ集客開始。',
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-4 bg-rose-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-rose-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 選ばれる理由 ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            ChatGPTとの3つの違い
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: LayoutTemplate,
                iconClass: 'text-rose-600',
                bgClass: 'bg-rose-100',
                title: 'プロ監修の\nLP構成テンプレート',
                desc: '「問題提起→共感→解決策→証拠→CTA」のプロの構成を自動適用。ChatGPTでは再現できない売れる流れを作ります。',
              },
              {
                icon: Globe,
                iconClass: 'text-blue-600',
                bgClass: 'bg-blue-100',
                title: '生成した文章が\nそのままWebページに',
                desc: 'ChatGPTはテキストが出るだけ。セールスライターは生成した文章がそのままLPとして公開でき、すぐに集客できます。',
              },
              {
                icon: DollarSign,
                iconClass: 'text-green-600',
                bgClass: 'bg-green-100',
                title: 'コピーライター依頼の\n1/100のコスト',
                desc: 'プロのコピーライターに依頼すれば1本10万円以上。AIセールスライターなら無料で何度でも作り直せます。',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`w-14 h-14 mb-4 ${item.bgClass} rounded-xl flex items-center justify-center mx-auto`}>
                  <item.icon className={`w-7 h-7 ${item.iconClass}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base whitespace-pre-line">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 py-8 border-t border-gray-100">
            {[
              { num: '5分', label: 'で文章完成' },
              { num: '0円', label: 'で始められる' },
              { num: '1/100', label: 'のコスト' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-rose-600">{stat.num}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 最終CTA ── */}
        <section className="max-w-4xl mx-auto px-4 py-16 pb-24">
          <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              売れる文章で、今すぐ集客を始めよう
            </h2>
            <p className="text-rose-100 mb-8 text-lg leading-relaxed">
              5分後には、プロ品質のセールスレターが完成しています。
            </p>
            <a
              href="/salesletter/editor"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <PenTool className="w-5 h-5" />
              無料でセールスレターを作る
            </a>
            <p className="text-rose-200 text-sm mt-4">クレジットカード不要 — 30秒で登録完了</p>
          </div>
        </section>

        <footer className="border-t border-gray-100 py-6">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <span>&copy; {new Date().getFullYear()} 集客メーカー</span>
            <div className="flex items-center gap-4">
              <a href="/terms" className="hover:text-gray-600 transition-colors">利用規約</a>
              <a href="/privacy" className="hover:text-gray-600 transition-colors">プライバシーポリシー</a>
              <a href="/legal" className="hover:text-gray-600 transition-colors">特定商取引法</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
