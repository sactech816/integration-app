import { Metadata } from 'next';
import Link from 'next/link';
import {
  ClipboardList, Users, QrCode, Bell, CheckCircle2, ArrowRight, ChevronRight,
  Globe, FileText, BarChart3,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: '出欠メーカー（イベント出欠管理）| 集客メーカー',
  description:
    'イベント・セミナー・研修の出欠確認をオンライン化。出欠フォームを無料で作成、参加者リスト管理・リマインダー送信・QRコードチェックインに対応。幹事・イベント主催者に最適。',
  keywords: ['出欠確認', '出欠管理', 'イベント管理', 'RSVP', '無料', 'セミナー', '研修', '幹事', '参加者管理'],
  openGraph: {
    title: '出欠メーカー | 集客メーカー',
    description: 'イベントの出欠確認をオンライン化。出欠フォーム作成・参加者管理・QRチェックインに対応。',
    type: 'website',
    url: 'https://makers.tokyo/attendance',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: '出欠メーカー | 集客メーカー', description: 'イベントの出欠確認をオンライン化。参加者管理まで一括対応。' },
  alternates: { canonical: 'https://makers.tokyo/attendance' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '出欠メーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'イベント・セミナー・研修の出欠管理ツール。出欠フォーム作成・参加者リスト・リマインダー・QRチェックインに対応。',
      url: 'https://makers.tokyo/attendance',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: '出欠フォームはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'イベント名・日時・場所・定員などを入力するだけで出欠フォームが完成します。作成後はURLをシェアするだけで参加者が回答できます。' } },
        { '@type': 'Question', name: '参加者の出欠をリアルタイムで確認できますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。ダッシュボードで参加予定・不参加・未回答の人数をリアルタイムで確認できます。参加者のリストもCSVでダウンロードできます。' } },
        { '@type': 'Question', name: 'リマインダーを送れますか？', acceptedAnswer: { '@type': 'Answer', text: 'イベント前日などにリマインダーをメールで送信できます。未回答者への催促も可能です。' } },
        { '@type': 'Question', name: 'どんなイベントに使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'セミナー・勉強会・ワークショップ・社内研修・飲み会・スポーツイベントなど、参加者の出欠管理が必要なあらゆるイベントに対応します。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: '出欠メーカー', item: 'https://makers.tokyo/attendance' },
      ],
    },
  ],
};

const features = [
  { icon: ClipboardList, iconClass: 'text-cyan-600', bgClass: 'bg-cyan-100', title: 'かんたん出欠フォーム作成', desc: 'イベント情報を入力するだけで出欠フォームが完成。参加・不参加・補欠など細かい選択肢も設定できます。' },
  { icon: Users, iconClass: 'text-sky-600', bgClass: 'bg-sky-100', title: '参加者リストをリアルタイム管理', desc: '参加予定・不参加・未回答の人数をリアルタイムで把握。参加者名簿のダウンロードも可能です。' },
  { icon: Bell, iconClass: 'text-blue-600', bgClass: 'bg-blue-100', title: 'リマインダーを自動送信', desc: 'イベント前日や当日にリマインダーメールを自動送信。無断欠席の防止と参加率の向上に効果的です。' },
  { icon: QrCode, iconClass: 'text-cyan-700', bgClass: 'bg-cyan-50', title: 'QRコードでスムーズなチェックイン', desc: '参加者ごとのQRコードを発行。当日の受付をQRスキャンで効率化し、スタッフの負担を大幅に削減できます。' },
];

const steps = [
  { num: '01', title: 'イベント情報を入力', desc: 'イベント名・日時・場所・定員・参加費などを入力。出欠フォームが自動で作成されます。', icon: FileText },
  { num: '02', title: '参加者にURLをシェア', desc: '専用URLをメール・LINE・SNSで参加予定者に送信。スマホからかんたんに回答できます。', icon: Globe },
  { num: '03', title: '出欠状況をリアルタイム確認', desc: 'ダッシュボードで参加者数・未回答者を管理。当日はQRコードで受付を効率化。', icon: BarChart3 },
];

const useCases = [
  { profession: 'セミナー・勉強会主催', title: '参加申込みフォーム', desc: '定員管理・補欠登録・リマインダー送信まで一括管理。当日のQR受付もスムーズに。', emoji: '🎤', badge: '参加者管理の効率化に' },
  { profession: 'ワークショップ・講座', title: '出欠確認フォーム', desc: '複数回の講座の出欠を一元管理。欠席者へのフォロー連絡も簡単に。', emoji: '🖼️', badge: '講座運営の効率化に' },
  { profession: '社内研修・会議', title: '社内出欠管理システム', desc: '研修・会議の参加確認をオンライン化。出欠結果を人事・総務部門と共有。', emoji: '🏢', badge: '社内業務の効率化に' },
  { profession: '地域コミュニティ・サークル', title: 'イベント出欠フォーム', desc: '飲み会・スポーツイベントなどの出欠確認をLINEシェアで手軽に集める。', emoji: '🎉', badge: '幹事の手間削減に' },
];

const faqs = [
  { q: '出欠フォームはどのように作りますか？', a: 'イベント名・日時・場所・定員などを入力するだけで出欠フォームが完成します。作成後はURLをシェアするだけで参加者が回答できます。' },
  { q: '参加者の出欠をリアルタイムで確認できますか？', a: 'はい。ダッシュボードで参加予定・不参加・未回答の人数をリアルタイムで確認できます。参加者のリストもダウンロードできます。' },
  { q: 'リマインダーを送れますか？', a: 'イベント前日などにリマインダーをメールで送信できます。未回答者への催促も可能です。' },
  { q: 'どんなイベントに使えますか？', a: 'セミナー・勉強会・ワークショップ・社内研修・飲み会・スポーツイベントなど、参加者の出欠管理が必要なあらゆるイベントに対応します。' },
  { q: '無料で使えますか？', a: '基本的な出欠管理機能は無料でご利用いただけます。高度な機能はPROプランでご利用いただけます。' },
];

export default function AttendanceLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="attendance" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-cyan-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-6">
              <ClipboardList className="w-4 h-4" />
              セミナー・研修・イベント主催者向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              イベントの出欠管理を<br />
              <span className="text-cyan-600">かんたんオンライン化</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              出欠フォームを作成してURLをシェアするだけ。
              <br className="hidden sm:block" />
              参加者管理・リマインダー・当日のQR受付まで一括対応します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/attendance/new" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <ClipboardList className="w-5 h-5" />
                無料で出欠フォームを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 font-semibold text-lg rounded-xl border border-cyan-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />参加者リスト管理</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />QRコード受付対応</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">出欠メーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">出欠確認・参加者管理・当日受付まで、イベント運営に必要な機能がひとつに揃っています。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで出欠管理開始</h2>
            <p className="text-gray-600 text-center mb-12">数分でセットアップ。幹事・主催者の手間を大幅に削減</p>
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
              <Link href="/attendance/new" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <ClipboardList className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">出欠管理が必要なあらゆるイベント・研修・集まりに対応します</p>
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
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-cyan-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-cyan-600 to-sky-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐ出欠管理をオンライン化しよう</h2>
            <p className="text-cyan-100 mb-8 text-lg">無料で作成・運用できます。数分で出欠フォームが完成します。</p>
            <Link href="/attendance/new" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-cyan-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <ClipboardList className="w-5 h-5" />無料で出欠フォームを作る
            </Link>
            <p className="text-cyan-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
