import { Metadata } from 'next';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Smartphone,
  Bell,
  Link2,
  Settings,
  Globe,
  Zap,
} from 'lucide-react';
import AdLandingHeader from '@/components/lp/AdLandingHeader';

export const metadata: Metadata = {
  title: '無料の予約システム｜5分で設置完了【予約メーカー】',
  description:
    '無料で使える予約システムを5分で設置。電話・メール対応を自動化し、24時間予約受付を実現。サロン・教室・コンサルタントに最適。',
  keywords: [
    '予約システム 無料',
    '予約フォーム 作成',
    'サロン 予約',
    '教室 予約管理',
    '予約ページ 作成',
    'オンライン予約',
  ],
  openGraph: {
    title: '無料の予約システム｜5分で設置完了',
    description: '無料の予約システムを5分で設置。電話対応から解放されます。',
    type: 'website',
    url: 'https://makers.tokyo/lp/booking',
    siteName: '集客メーカー',
  },
  alternates: {
    canonical: 'https://makers.tokyo/lp/booking',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '予約メーカー',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: '無料で使える予約システム。5分で設置完了、24時間自動予約受付。',
  url: 'https://makers.tokyo/lp/booking',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
};

export default function BookingAdLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <AdLandingHeader ctaText="予約ページを作る" ctaHref="/booking/new" themeColor="teal" />

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-teal-50 via-teal-50/50 to-white">
          <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              5分で設置完了 — 完全無料
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              予約管理、<br />
              まだ<span className="text-teal-600">手作業</span>ですか？
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              無料の予約システムを<strong className="text-gray-800">5分</strong>で設置。
              <br className="hidden sm:block" />
              電話・メール・LINEでの予約対応から解放されます。
            </p>

            <a
              href="/booking/new"
              className="inline-flex items-center gap-2 px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Calendar className="w-5 h-5" />
              無料で予約ページを作る
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />クレジットカード不要</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />5分で設置完了</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />24時間自動受付</span>
            </div>
          </div>
        </section>

        {/* ── 課題共感 ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            こんなお悩みありませんか？
          </h2>
          <p className="text-gray-500 text-center mb-10">1つでも当てはまるなら、予約メーカーが解決します</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              '電話やLINEでの予約対応に毎日時間を取られている',
              'ダブルブッキングが起きてお客様に迷惑をかけた',
              '予約システムの月額費用が高くて導入できない',
              '営業時間外の予約を取りこぼしている',
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
              たった3ステップで予約受付を開始
            </h2>
            <p className="text-gray-500 text-center mb-12">スマホだけで設定完了</p>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  num: '1',
                  icon: Settings,
                  title: 'メニューを設定',
                  desc: 'サービス名・所要時間・料金・空き時間を入力。テンプレートから選ぶだけで簡単。',
                },
                {
                  num: '2',
                  icon: Globe,
                  title: '予約ページを公開',
                  desc: '予約ページが自動生成。URLをWebサイト・SNS・LINE公式に設置するだけ。',
                },
                {
                  num: '3',
                  icon: Bell,
                  title: '自動で予約受付',
                  desc: '24時間自動で予約を受付。確認メールも自動送信。あなたは何もしなくてOK。',
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-4 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-teal-500 mb-1 tracking-widest">STEP {step.num}</div>
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
                title: '完全無料で\nすぐに始められる',
                desc: '初期費用・月額費用ともに0円。有料の予約システムに払っていたコストがなくなります。',
              },
              {
                icon: Link2,
                iconClass: 'text-teal-600',
                bgClass: 'bg-teal-100',
                title: 'LP・診断クイズと\nワンストップ連携',
                desc: '予約ページとLP・診断クイズを連携。「診断 → サービス紹介 → 予約」の導線を1つのツールで完結。',
              },
              {
                icon: Smartphone,
                iconClass: 'text-blue-600',
                bgClass: 'bg-blue-100',
                title: 'スマホだけで\n設定・管理できる',
                desc: 'PCがなくてもスマートフォンだけで予約ページの作成から予約管理までできます。',
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
              { num: '5分', label: 'で設置完了' },
              { num: '0円', label: '初期費用・月額' },
              { num: '24時間', label: '自動で予約受付' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-teal-600">{stat.num}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 最終CTA ── */}
        <section className="max-w-4xl mx-auto px-4 py-16 pb-24">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              電話・メール対応を今日からゼロに
            </h2>
            <p className="text-teal-100 mb-8 text-lg leading-relaxed">
              5分後には、24時間自動で予約を受け付ける予約ページが完成しています。
            </p>
            <a
              href="/booking/new"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Calendar className="w-5 h-5" />
              無料で予約ページを作る
            </a>
            <p className="text-teal-200 text-sm mt-4">クレジットカード不要 — 30秒で登録完了</p>
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
