import { Metadata } from 'next';
import Link from 'next/link';
import {
  MessageCircle, Users, Send, BarChart3,
  CheckCircle2, ArrowRight, ChevronRight, Settings, Layout,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'LINE配信（LINE公式アカウント連携）| 集客メーカー',
  description:
    'LINE公式アカウントと連携してメッセージ配信。リッチメニュー設定・ステップ配信・セグメント配信で顧客との関係を構築。',
  keywords: ['LINE配信', 'LINE公式アカウント', 'LINEマーケティング', 'リッチメニュー', 'ステップ配信', 'LINE連携'],
  openGraph: {
    title: 'LINE配信 | 集客メーカー',
    description: 'LINE公式アカウント連携でメッセージ配信。リッチメニュー・ステップ配信に対応。',
    type: 'website',
    url: 'https://makers.tokyo/line',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'LINE配信 | 集客メーカー', description: 'LINE連携でメッセージ配信を自動化。リッチメニュー・ステップ配信に対応。' },
  alternates: { canonical: 'https://makers.tokyo/line' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'LINE配信',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'LINE公式アカウントと連携してメッセージ配信。リッチメニュー・ステップ配信で顧客との関係を構築。',
      url: 'https://makers.tokyo/line',
      offers: { '@type': 'Offer', price: '3980', priceCurrency: 'JPY', description: 'PROプランで利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'LINE公式アカウントが必要ですか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、LINE公式アカウント（旧LINE@）が必要です。無料プランのアカウントでも連携可能です。' } },
        { '@type': 'Question', name: 'リッチメニューとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'LINEトーク画面下部に表示されるメニューです。タップするとWebページやクーポン、予約ページなどに遷移できます。' } },
        { '@type': 'Question', name: 'ステップ配信はできますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、友だち追加日を起点に段階的にメッセージを自動配信するステップ配信に対応しています。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'LINE配信', item: 'https://makers.tokyo/line' },
      ],
    },
  ],
};

const features = [
  { icon: MessageCircle, iconClass: 'text-green-600', bgClass: 'bg-green-100', title: 'メッセージ一斉配信', desc: 'LINE公式アカウントの友だち全員にメッセージを一斉配信。テキスト・画像・リッチメッセージに対応。' },
  { icon: Layout, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: 'リッチメニュー設定', desc: 'トーク画面下部のリッチメニューを簡単にカスタマイズ。予約・商品・クーポンへの導線を設置。' },
  { icon: Send, iconClass: 'text-teal-600', bgClass: 'bg-teal-100', title: 'ステップ配信', desc: '友だち追加日を起点に段階的にメッセージを自動配信。見込み客のナーチャリングを自動化。' },
  { icon: BarChart3, iconClass: 'text-green-700', bgClass: 'bg-green-50', title: '配信分析', desc: 'メッセージの開封率・クリック率を確認。効果的な配信内容の改善に活かせます。' },
];

const steps = [
  { num: '01', title: 'LINE公式アカウント連携', desc: 'LINE公式アカウントのAPIキーを設定して連携を完了。数分で設定できます。', icon: Settings },
  { num: '02', title: 'メッセージ・メニュー作成', desc: '配信するメッセージやリッチメニューを作成。テンプレートから選んで簡単に設定。', icon: MessageCircle },
  { num: '03', title: '配信スタート', desc: '一斉配信やステップ配信を開始。友だちへ自動でメッセージが届きます。', icon: Send },
];

const useCases = [
  { profession: '美容サロン・エステ', title: '予約リマインド&クーポン配信', desc: '来店予約のリマインドや、リピート促進クーポンをLINEで自動配信。来店率とリピート率を向上。', emoji: '💅', badge: 'リピート率の向上に' },
  { profession: '飲食店・カフェ', title: '新メニュー告知&スタンプラリー', desc: '新メニューやキャンペーン情報をLINEで告知。リッチメニューからスタンプラリーへの導線も設置。', emoji: '🍔', badge: '集客の自動化に' },
  { profession: 'オンライン講師', title: '講座案内&フォローアップ', desc: '新講座の案内や受講後のフォローアップをLINEで配信。メールより高い開封率で確実に届く。', emoji: '📚', badge: '高い開封率で確実に届く' },
  { profession: 'EC・ネットショップ', title: 'セール告知&発送通知', desc: 'セール情報や新商品入荷をLINEで告知。注文確認や発送通知もLINEで完結。', emoji: '🛒', badge: '購買率の向上に' },
];

const faqs = [
  { q: 'LINE公式アカウントが必要ですか？', a: 'はい、LINE公式アカウント（旧LINE@）が必要です。無料プランのアカウントでも連携可能です。' },
  { q: 'リッチメニューとは何ですか？', a: 'LINEトーク画面下部に表示されるメニューです。タップするとWebページやクーポン、予約ページなどに遷移できます。' },
  { q: 'ステップ配信はできますか？', a: 'はい、友だち追加日を起点に段階的にメッセージを自動配信するステップ配信に対応しています。' },
  { q: 'メッセージの配信数に制限はありますか？', a: 'LINE公式アカウント側の配信数制限に準じます。集客メーカー側での制限はありません。' },
  { q: '料金はいくらですか？', a: '有料プラン（月額1,980円〜）に含まれる機能です。メルマガ・ステップメール・診断クイズなど他の有料プラン機能もすべて利用可能です。' },
];

export default function LineLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
              <MessageCircle className="w-4 h-4" />
              PROプラン限定機能
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              LINEで顧客と<br />
              <span className="text-green-600">つながり続ける</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              LINE公式アカウントと連携して、
              <br className="hidden sm:block" />
              メッセージ配信・リッチメニュー・ステップ配信を一元管理。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/line/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <MessageCircle className="w-5 h-5" />
                LINE配信を始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-semibold text-lg rounded-xl border border-green-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />メッセージ配信</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />リッチメニュー</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />ステップ配信</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">LINE配信の特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">メールより高い開封率を誇るLINEで、確実にメッセージを届けます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでLINE配信</h2>
            <p className="text-gray-600 text-center mb-12">アカウント連携からメッセージ配信まで、シンプルな操作で完了</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-green-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-green-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-green-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/line/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <MessageCircle className="w-5 h-5" />LINE配信を始める（PROプラン）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">LINEの高い開封率を活かして、顧客との関係を深めましょう</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-green-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">LINEで集客を加速しよう</h2>
            <p className="text-green-100 mb-8 text-lg">PROプランに含まれる機能です。LINE公式アカウント連携で配信を簡単に始められます。</p>
            <Link href="/line/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-green-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <MessageCircle className="w-5 h-5" />LINE配信を始める
            </Link>
            <p className="text-green-200 text-sm mt-4">有料プラン（月額1,980円〜）で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
