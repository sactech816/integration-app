import { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarCheck, Clock, Bell, CheckCircle2, ArrowRight, ChevronRight,
  Globe, Settings, Smartphone,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: '予約メーカー（オンライン予約システム）| 集客メーカー',
  description:
    'オンライン予約システムを無料で導入。24時間受付・自動確認メール・時間枠管理に対応。美容室・コーチ・整体・コンサルタントなどのサービス業に最適な予約管理ツール。',
  keywords: ['オンライン予約', '予約システム', '無料', '24時間受付', '自動確認メール', '美容室', 'コーチ', '整体', '予約管理'],
  openGraph: {
    title: '予約メーカー | 集客メーカー',
    description: 'オンライン予約システムを無料導入。24時間受付・自動確認メール・時間枠管理に対応。',
    type: 'website',
    url: 'https://makers.tokyo/booking',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: '予約メーカー | 集客メーカー', description: 'オンライン予約を無料導入。24時間受付・自動確認メール対応。' },
  alternates: { canonical: 'https://makers.tokyo/booking' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '予約メーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'オンライン予約システム作成ツール。24時間受付・時間枠管理・自動確認メール対応。美容室・コーチ・整体・コンサルタント向け。',
      url: 'https://makers.tokyo/booking',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: '予約システムはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'メニュー名・価格・所要時間・受付可能な時間帯を設定するだけで予約ページが完成します。作成後はURLをシェアするだけでお客様がオンライン予約できます。' } },
        { '@type': 'Question', name: '予約が入ったら通知が来ますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。予約が入ると自動でメール通知が届きます。また、お客様にも予約確認メールが自動送信されます。' } },
        { '@type': 'Question', name: '既存のホームページに埋め込めますか？', acceptedAnswer: { '@type': 'Answer', text: '作成した予約ページは専用URLで公開されます。既存のホームページやSNSからリンクを貼ることで、お客様がオンライン予約できます。' } },
        { '@type': 'Question', name: 'どんな業種に向いていますか？', acceptedAnswer: { '@type': 'Answer', text: '美容室・エステ・整体・コーチング・コンサルティング・ヨガ教室・個人レッスンなど、時間単位でサービスを提供するあらゆる業種に対応します。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: '予約メーカー', item: 'https://makers.tokyo/booking' },
      ],
    },
  ],
};

const features = [
  { icon: Clock, iconClass: 'text-teal-600', bgClass: 'bg-teal-100', title: '24時間オンライン受付', desc: '電話対応不要。お客様が都合の良い時間に予約できます。深夜・早朝の予約も自動で受け付け、機会損失をゼロに。' },
  { icon: Settings, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: '時間枠・メニューを柔軟に設定', desc: '複数のメニュー・料金・所要時間・受付可能日時を細かく設定できます。定休日・臨時休業も簡単に管理。' },
  { icon: Bell, iconClass: 'text-green-600', bgClass: 'bg-green-100', title: '自動確認メール送信', desc: '予約完了・リマインダー・キャンセルの通知メールを自動送信。無断キャンセルの減少と顧客満足度の向上に貢献。' },
  { icon: Smartphone, iconClass: 'text-teal-700', bgClass: 'bg-teal-50', title: 'スマホからかんたん予約', desc: 'お客様はスマホから数タップで予約完了。アプリのインストール不要。LINE・Instagramからもスムーズに予約できます。' },
];

const steps = [
  { num: '01', title: 'メニューと時間枠を設定', desc: 'メニュー名・価格・所要時間・受付可能な日時を設定。複数メニューの登録も可能。', icon: Settings },
  { num: '02', title: '予約ページを公開', desc: '専用URLが発行されます。ホームページ・SNS・名刺のQRコードに設定して集客開始。', icon: Globe },
  { num: '03', title: '予約を受け取る', desc: 'お客様から予約が入ると自動通知。ダッシュボードで予約状況を一元管理できます。', icon: CalendarCheck },
];

const useCases = [
  { profession: '美容室・ネイルサロン', title: '施術メニュー予約', desc: 'カット・カラー・パーマなど複数のメニューをオンラインで受付。スタッフ別の予約管理も可能。', emoji: '✂️', badge: '新規予約の増加に' },
  { profession: 'コーチ・カウンセラー', title: 'セッション予約', desc: '個人コーチングやカウンセリングのセッション予約をオンライン化。空き時間を自動で管理。', emoji: '💬', badge: '予約管理の効率化に' },
  { profession: '整体・マッサージ', title: '施術予約システム', desc: '初回・回数券・定期コースなど、メニュー別の予約をオンラインで一括管理。', emoji: '🤲', badge: '顧客満足度の向上に' },
  { profession: 'コンサルタント・士業', title: '無料相談予約', desc: '初回無料相談や有料コンサルの予約窓口をオンライン化。問い合わせの手間を削減。', emoji: '📋', badge: '相談申込みの効率化に' },
];

const faqs = [
  { q: '予約システムはどのように作りますか？', a: 'メニュー名・価格・所要時間・受付可能な時間帯を設定するだけで予約ページが完成します。作成後はURLをシェアするだけでお客様がオンライン予約できます。' },
  { q: '予約が入ったら通知が来ますか？', a: 'はい。予約が入ると自動でメール通知が届きます。また、お客様にも予約確認メールが自動送信されます。' },
  { q: '既存のホームページに組み込めますか？', a: '作成した予約ページは専用URLで公開されます。既存のホームページやSNSからリンクを貼ることで、お客様がオンライン予約できます。' },
  { q: 'どんな業種に向いていますか？', a: '美容室・エステ・整体・コーチング・コンサルティング・ヨガ教室・個人レッスンなど、時間単位でサービスを提供するあらゆる業種に対応します。' },
  { q: '無料で使えますか？', a: '基本的な予約システムの作成・運用は無料でご利用いただけます。高度な機能はPROプランでご利用いただけます。' },
];

export default function BookingLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="booking" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-teal-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-6">
              <CalendarCheck className="w-4 h-4" />
              美容室・コーチ・整体・コンサルタント向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              24時間受付できる<br />
              <span className="text-teal-600">予約システムを無料で導入</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              電話対応不要。お客様がいつでもオンライン予約できる仕組みを
              <br className="hidden sm:block" />
              数分でセットアップ。自動確認メールで対応コストもゼロに。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking/new" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <CalendarCheck className="w-5 h-5" />
                無料で予約システムを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 font-semibold text-lg rounded-xl border border-teal-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />24時間受付・自動通知</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />電話対応不要</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />スマホから簡単予約</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">予約メーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">電話予約の手間をなくし、お客様も事業者も便利なオンライン予約システムを簡単に導入できます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで予約受付開始</h2>
            <p className="text-gray-600 text-center mb-12">数分でセットアップ完了。すぐに予約を受け付けられます</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-teal-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-teal-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/booking/new" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <CalendarCheck className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">時間単位でサービスを提供するすべての方の予約管理を効率化します</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-teal-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-teal-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐ予約システムを導入しよう</h2>
            <p className="text-teal-100 mb-8 text-lg">無料で作成・運用できます。数分で24時間受付できる予約ページが完成します。</p>
            <Link href="/booking/new" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <CalendarCheck className="w-5 h-5" />無料で予約システムを作る
            </Link>
            <p className="text-teal-200 text-sm mt-4">クレジットカード不要・すぐに受付開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
