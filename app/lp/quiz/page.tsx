import { Metadata } from 'next';
import {
  Brain,
  CheckCircle2,
  Sparkles,
  Share2,
  Mail,
  TrendingUp,
  FileText,
  Globe,
  Zap,
} from 'lucide-react';
import AdLandingHeader from '@/components/lp/AdLandingHeader';

export const metadata: Metadata = {
  title: '診断クイズを3分で作成｜AIが自動生成【無料】',
  description:
    'AIが診断クイズの質問・結果を自動生成。3分で本格的な診断クイズが完成し、SNSでシェアするだけで見込み客を自動収集。コンサルタント・コーチ・講師・士業の集客に。',
  keywords: [
    '診断クイズ 作成',
    '心理テスト メーカー',
    'クイズ 作り方',
    '集客 自動化',
    '診断コンテンツ',
    'リード獲得',
  ],
  openGraph: {
    title: '診断クイズを3分で作成｜AI自動生成【無料】',
    description: 'AIが質問・結果を自動生成。3分で見込み客を集める診断クイズが完成。',
    type: 'website',
    url: 'https://makers.tokyo/lp/quiz',
    siteName: '集客メーカー',
  },
  alternates: {
    canonical: 'https://makers.tokyo/lp/quiz',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '診断クイズメーカー',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AIが診断クイズの質問・結果を自動生成する無料ツール。SNSシェアで見込み客を自動収集。',
  url: 'https://makers.tokyo/lp/quiz',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
};

export default function QuizAdLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <AdLandingHeader ctaText="診断クイズを作る" ctaHref="/quiz/editor" themeColor="blue" />

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-blue-50 via-blue-50/50 to-white">
          <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              AIが自動生成 — 専門知識不要
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              あなたの見込み客、<br />
              <span className="text-blue-600">診断クイズ</span>で<br className="sm:hidden" />
              自動的に集まります
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              AIが質問・結果を自動生成。<strong className="text-gray-800">3分</strong>で本格的な診断クイズが完成。
              <br className="hidden sm:block" />
              SNSでシェアするだけで、24時間自動で見込み客を集め続けます。
            </p>

            <a
              href="/quiz/editor"
              className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Brain className="w-5 h-5" />
              無料で診断クイズを作る
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />クレジットカード不要</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />3分で完成</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />専門知識不要</span>
            </div>
          </div>
        </section>

        {/* ── 課題共感 ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            こんなお悩みありませんか？
          </h2>
          <p className="text-gray-500 text-center mb-10">1つでも当てはまるなら、診断クイズが解決します</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              'SNSで毎日発信しても、フォロワーが増えない',
              'LPを作ったけど、アクセスが集まらない',
              'メルマガの読者を増やしたいが方法が分からない',
              '広告費をかけずに集客したい',
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

        {/* ── 3ステップ解決策 ── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
              たった3ステップで集客開始
            </h2>
            <p className="text-gray-500 text-center mb-12">AIが面倒な作業をすべて自動化</p>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  num: '1',
                  icon: FileText,
                  title: 'テーマを入力',
                  desc: '「コンサル向けビジネス診断」などテーマを入力。AIが質問と結果を自動生成します。',
                },
                {
                  num: '2',
                  icon: Sparkles,
                  title: 'デザインを選ぶ',
                  desc: 'テンプレートから選ぶだけ。色・画像・テキストも自由にカスタマイズ可能。',
                },
                {
                  num: '3',
                  icon: Globe,
                  title: 'シェアして集客',
                  desc: 'URLをSNS・ブログ・メルマガで共有。回答者のメールアドレスを自動収集。',
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-4 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-blue-500 mb-1 tracking-widest">STEP {step.num}</div>
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
            選ばれる3つの理由
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                iconClass: 'text-amber-600',
                bgClass: 'bg-amber-100',
                title: 'AI自動生成で\n専門知識不要',
                desc: 'テーマを入力するだけ。AIが質問・結果・解説文をすべて自動で作成。コピーライティングのスキルは不要です。',
              },
              {
                icon: Share2,
                iconClass: 'text-blue-600',
                bgClass: 'bg-blue-100',
                title: 'SNSシェアで\n広告費¥0の集客',
                desc: '診断結果をシェアしたくなる設計。ユーザーが自発的に拡散し、広告費をかけずに見込み客が集まります。',
              },
              {
                icon: Mail,
                iconClass: 'text-green-600',
                bgClass: 'bg-green-100',
                title: 'メールアドレスを\n自動収集',
                desc: '回答時にメールアドレスを取得。そのままメルマガやステップメールで育成し、サービス申込みにつなげます。',
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

          {/* 数字の信頼性 */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 py-8 border-t border-gray-100">
            {[
              { num: '3分', label: 'で作成完了' },
              { num: '0円', label: 'で始められる' },
              { num: '24時間', label: '自動で集客' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-blue-600">{stat.num}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 最終CTA ── */}
        <section className="max-w-4xl mx-auto px-4 py-16 pb-24">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              今すぐ、あなたの診断クイズを作ろう
            </h2>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              3分後には、見込み客を集める診断クイズが完成しています。
            </p>
            <a
              href="/quiz/editor"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Brain className="w-5 h-5" />
              無料で診断クイズを作る
            </a>
            <p className="text-blue-200 text-sm mt-4">クレジットカード不要 — 30秒で登録完了</p>
          </div>
        </section>

        {/* ── 最小フッター ── */}
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
