import { Metadata } from 'next';
import Link from 'next/link';
import {
  Gamepad2, Sparkles, Gift, TrendingUp, Users,
  CheckCircle2, ArrowRight, ChevronRight, Globe, Settings, Star,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'ゲーミフィケーション（集客キャンペーン）| 集客メーカー',
  description:
    'ガチャ・スクラッチ・スロット・スタンプラリー・ログインボーナスなどのゲーミフィケーションキャンペーンを無料で作成。EC・店舗・イベントの集客・顧客エンゲージメント向上に最適。',
  keywords: ['ゲーミフィケーション', 'ガチャ', 'スクラッチ', 'スタンプラリー', '集客キャンペーン', '無料', 'EC', '来店促進'],
  openGraph: {
    title: 'ゲーミフィケーション | 集客メーカー',
    description: 'ガチャ・スクラッチ・スタンプラリーなどの集客キャンペーンを無料で作成。顧客エンゲージメントを高める。',
    type: 'website',
    url: 'https://makers.tokyo/gamification',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'ゲーミフィケーション | 集客メーカー', description: 'ガチャ・スクラッチ・スタンプラリーなどで集客・顧客エンゲージメントを向上。' },
  alternates: { canonical: 'https://makers.tokyo/gamification' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'ゲーミフィケーション',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'ガチャ・スクラッチ・スロット・スタンプラリー・ログインボーナスなどの集客キャンペーン作成ツール。',
      url: 'https://makers.tokyo/gamification',
      featureList: ['ガチャキャンペーン', 'スクラッチカード', 'スロットゲーム', 'スタンプラリー', 'ログインボーナス'],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'ゲーミフィケーションとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'ゲーミフィケーションとは、ゲームの要素（達成感・報酬・競争など）をビジネスの集客や顧客エンゲージメントに取り入れる手法です。ガチャ・スクラッチ・スタンプラリーなどで顧客の参加意欲を高めます。' } },
        { '@type': 'Question', name: 'どんなゲームタイプを作れますか？', acceptedAnswer: { '@type': 'Answer', text: 'ガチャ（くじ）・スクラッチカード・スロットマシン・スタンプラリー・ログインボーナスの5種類から選べます。それぞれ景品・当選確率・期間を自由に設定できます。' } },
        { '@type': 'Question', name: 'どんな業種・目的に向いていますか？', acceptedAnswer: { '@type': 'Answer', text: 'ECサイトの購買促進・実店舗の来店促進・SNSフォロワー獲得・イベント集客・メルマガ登録促進など、幅広い業種・目的に活用できます。' } },
        { '@type': 'Question', name: '当選者への景品配布はどうしますか？', acceptedAnswer: { '@type': 'Answer', text: '当選者には自動でメール通知が送信されます。クーポンコード・割引コード・デジタルギフトなどをシステム内で設定・管理できます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'ゲーミフィケーション', item: 'https://makers.tokyo/gamification' },
      ],
    },
  ],
};

const gameTypes = [
  { name: 'ガチャ', emoji: '🎰', desc: 'くじ引き感覚で楽しめる抽選キャンペーン。商品・割引クーポンを景品に設定。' },
  { name: 'スクラッチ', emoji: '🃏', desc: 'スクラッチを削って当選を確認。来店・購入のインセンティブに最適。' },
  { name: 'スロット', emoji: '🎲', desc: 'スロットマシンで当選を演出。SNSでのシェア・拡散に効果的。' },
  { name: 'スタンプラリー', emoji: '📍', desc: '来店・購入・行動でスタンプを貯める。リピート促進に絶大な効果。' },
  { name: 'ログインボーナス', emoji: '🎁', desc: '毎日ログイン・アクセスで特典付与。継続的なエンゲージメントを実現。' },
];

const features = [
  { icon: Gamepad2, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: '5種類のゲームタイプ', desc: 'ガチャ・スクラッチ・スロット・スタンプラリー・ログインボーナスから目的に合ったゲームタイプを選択できます。' },
  { icon: Gift, iconClass: 'text-pink-600', bgClass: 'bg-pink-100', title: '景品・当選確率を自由設定', desc: 'クーポン・割引・デジタルギフトなど景品の種類・当選確率・上限数を細かく設定。キャンペーン期間も自由に管理できます。' },
  { icon: TrendingUp, iconClass: 'text-violet-600', bgClass: 'bg-violet-100', title: 'SNS拡散でバイラル効果', desc: '「当たった！」という体験はSNSでシェアしたくなるコンテンツ。ゲームの参加者が自然な口コミ拡散を生み出します。' },
  { icon: Users, iconClass: 'text-fuchsia-600', bgClass: 'bg-fuchsia-100', title: '参加データ・分析', desc: '参加者数・当選数・参加者の属性などをダッシュボードで把握。次回キャンペーンの改善に活かせます。' },
];

const steps = [
  { num: '01', title: 'ゲームタイプと景品を設定', desc: 'ゲームの種類を選び、景品・当選確率・キャンペーン期間を設定します。', icon: Settings },
  { num: '02', title: 'デザインをカスタマイズ', desc: 'ブランドカラー・バナー画像・テキストを設定してオリジナルキャンペーンページを作成。', icon: Star },
  { num: '03', title: '公開してキャンペーン開始', desc: '専用URLをSNS・メルマガ・店頭QRコードでシェア。参加者が集まります。', icon: Globe },
];

const useCases = [
  { profession: 'ECサイト・オンラインショップ', title: '購買促進ガチャキャンペーン', desc: '購入者限定ガチャで次回使えるクーポンを配布。リピート購入と顧客ロイヤルティを向上。', emoji: '🛒', badge: 'リピート率の向上に' },
  { profession: '実店舗・飲食店・小売', title: '来店促進スタンプラリー', desc: '来店ごとにスタンプを貯めて特典をプレゼント。定期的な来店動機を作り常連客を育成。', emoji: '🏪', badge: '来店頻度の向上に' },
  { profession: 'SNSアカウント・コミュニティ', title: 'フォロワー獲得キャンペーン', desc: 'フォロー&シェアでスクラッチ参加権をプレゼント。ゲームの楽しさがフォロワー増加を後押し。', emoji: '📱', badge: 'フォロワー獲得に' },
  { profession: 'イベント・展示会', title: 'イベント来場者エンゲージメント', desc: '来場者にガチャやスクラッチを体験してもらい、ブランドへの印象付けと楽しい体験を提供。', emoji: '🎪', badge: 'ブランド体験の向上に' },
];

const faqs = [
  { q: 'ゲーミフィケーションとは何ですか？', a: 'ゲーミフィケーションとは、ゲームの要素（達成感・報酬・競争など）をビジネスの集客や顧客エンゲージメントに取り入れる手法です。ガチャ・スクラッチ・スタンプラリーなどで顧客の参加意欲を高めます。' },
  { q: 'どんなゲームタイプを作れますか？', a: 'ガチャ（くじ）・スクラッチカード・スロットマシン・スタンプラリー・ログインボーナスの5種類から選べます。それぞれ景品・当選確率・期間を自由に設定できます。' },
  { q: 'どんな業種・目的に向いていますか？', a: 'ECサイトの購買促進・実店舗の来店促進・SNSフォロワー獲得・イベント集客・メルマガ登録促進など、幅広い業種・目的に活用できます。' },
  { q: '当選者への景品配布はどうしますか？', a: '当選者には自動でメール通知が送信されます。クーポンコード・割引コード・デジタルギフトなどをシステム内で設定・管理できます。' },
  { q: '無料で使えますか？', a: '基本的なキャンペーン作成・実施は無料でご利用いただけます。高度な機能はPROプランでご利用いただけます。' },
];

export default function GamificationLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="gamification" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              <Gamepad2 className="w-4 h-4" />
              EC・店舗・イベント向け集客キャンペーン
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              ゲームで楽しく<br />
              <span className="text-purple-600">集客・リピートを仕掛ける</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              ガチャ・スクラッチ・スタンプラリーなどのゲーミフィケーションキャンペーンを
              <br className="hidden sm:block" />
              コーディング不要でかんたんに作成・公開できます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/gamification/new" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Gamepad2 className="w-5 h-5" />
                無料でキャンペーンを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold text-lg rounded-xl border border-purple-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />5種類のゲームタイプ</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />コーディング不要</span>
            </div>
          </div>
        </section>

        {/* Game Types */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">5種類のゲームで集客</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">目的・業種に合わせて最適なゲームタイプを選べます</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {gameTypes.map((g) => (
              <div key={g.name} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-center hover:shadow-md transition-shadow duration-200">
                <div className="text-3xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{g.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">ゲーミフィケーションの特長</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">ゲームの力で顧客との接点を増やし、エンゲージメントを継続的に高めます。</p>
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
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでキャンペーン開始</h2>
          <p className="text-gray-600 text-center mb-12">コーディング不要。数分でキャンペーンページが完成</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                    <ChevronRight className="w-6 h-6 text-purple-300" />
                  </div>
                )}
                <div className="w-20 h-20 mb-4 bg-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs font-bold text-purple-500 mb-1 tracking-widest">STEP {step.num}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/gamification/new" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Gamepad2 className="w-5 h-5" />今すぐ試してみる（無料）
            </Link>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">ゲームの力で顧客を引き付け、エンゲージメントを高めるすべての方に</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {useCases.map((uc) => (
                <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                  <span>{faq.q}</span>
                  <span className="text-purple-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐゲームキャンペーンを作ってみよう</h2>
            <p className="text-purple-100 mb-8 text-lg">無料で作成・公開できます。数分でキャンペーンページが完成します。</p>
            <Link href="/gamification/new" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-purple-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Gamepad2 className="w-5 h-5" />無料でキャンペーンを作る
            </Link>
            <p className="text-purple-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
