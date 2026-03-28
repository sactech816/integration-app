import { Metadata } from 'next';
import {
  Sparkles,
  Check,
  Gift,
  ArrowRight,
} from 'lucide-react';

// Client Components
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import { AuthCTAButton, WelcomeGuideButton } from '@/components/home/HomeClientButtons';
import FlowChartNav from '@/components/home/FlowChartNav';
import PricingSection from '@/components/home/PricingSection';
import IndustryNavSection from '@/components/home/IndustryNavSection';
import PopularToolsGrid from '@/components/home/PopularToolsGrid';
import FunnelStageShowcase from '@/components/home/FunnelStageShowcase';
import UseCaseMiniCards from '@/components/home/UseCaseMiniCards';
import GuestTrialSection from '@/components/home/GuestTrialSection';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '集客メーカー｜集客を"仕組み"にする。ひとりでも、ここまでできる。',
  description: 'あなたのビジネスタイプに合った集客の型を無料で。診断クイズ・LP・予約・メルマガなど、"知ってもらう"から"買ってもらう"までの流れをまるごとつくれます。',
  keywords: [
    '集客メーカー', '集客ツール', '起業ツール', 'ビジネスツール', '診断クイズ', '診断クイズ作成',
    'プロフィールLP', 'ランディングページ作成', 'LP作成ツール', 'LP作成無料',
    'AI自動生成', 'SNS集客', 'SEO対策', 'リード獲得', '無料ツール',
    'マーケティングツール', 'コンテンツマーケティング', 'セミナー集客', 'コーチ集客',
    '士業 集客', 'サロン 集客', 'クリニック 集客', 'フランチャイズ 集客',
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: '集客メーカー｜集客を"仕組み"にする',
    description: 'あなたのビジネスタイプに合った集客の型を無料で。"知ってもらう"から"買ってもらう"まで。',
    url: siteUrl,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('集客を"仕組み"にする')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '集客メーカー｜集客を"仕組み"にする',
    description: 'あなたのビジネスタイプに合った集客の型を無料で。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('集客を"仕組み"にする')}`],
  },
};

// ===== 構造化データ =====
const softwareAppSchema = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: '集客メーカー',
  description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成できる無料の集客ツール。SNS拡散・SEO対策で顧客を引き寄せるコンテンツを作成。',
  url: siteUrl, applicationCategory: 'WebApplication', operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  creator: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  featureList: ['診断クイズ作成', 'プロフィールLP作成', 'ビジネスLP作成', 'AI自動生成', 'SNSシェア機能', 'SEO対策', 'アクセス解析', '無料利用可能'],
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '100' },
};

const webAppSchema = {
  '@context': 'https://schema.org', '@type': 'WebApplication',
  name: '集客メーカー', url: siteUrl,
  description: '診断クイズ、プロフィールLP、ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速する無料ツール。',
  applicationCategory: 'BusinessApplication', browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0', operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', availability: 'https://schema.org/InStock' },
};

const serviceListSchema = {
  '@context': 'https://schema.org', '@type': 'ItemList',
  name: '集客メーカーのサービス一覧', description: '集客メーカーで作成できるコンテンツタイプ',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '診断クイズメーカー', description: '性格診断、適職診断、心理テスト、検定クイズ、占いなどをAIで自動生成', url: `${siteUrl}/quiz` },
    { '@type': 'ListItem', position: 2, name: 'プロフィールメーカー', description: 'SNSプロフィールに最適なリンクまとめページを作成。lit.link代替ツール', url: `${siteUrl}/profile` },
    { '@type': 'ListItem', position: 3, name: 'ビジネスLPメーカー', description: '商品・サービスのランディングページを無料で作成。CV最適化テンプレート搭載', url: `${siteUrl}/business` },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question', name: '本当に無料で使えますか？追加料金はかかりませんか？',
      acceptedAnswer: { '@type': 'Answer', text: 'はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。有料プランにアップグレードする際も、いつでも解約可能です。' },
    },
    {
      '@type': 'Question', name: 'パソコンが苦手でも使えますか？',
      acceptedAnswer: { '@type': 'Answer', text: '大丈夫です。テンプレートを選んで文字を変えるだけなので、パソコン操作に自信がない方でも直感的に使えます。スマホからでも編集可能です。' },
    },
    {
      '@type': 'Question', name: '他のツールからの乗り換えは簡単ですか？',
      acceptedAnswer: { '@type': 'Answer', text: 'はい、とても簡単です。既存のWebページやGoogleフォームの内容をコピー＆ペーストするだけで移行できます。' },
    },
    {
      '@type': 'Question', name: '商用利用は可能ですか？',
      acceptedAnswer: { '@type': 'Answer', text: 'もちろんです。フリープラン・有料プランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。' },
    },
    {
      '@type': 'Question', name: '作成したページは、どこで公開されますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'makers.tokyo/あなたのID というURLで公開されます。このリンクをSNSのプロフィール、名刺、チラシなどに掲載してご利用ください。' },
    },
  ],
};

const faqs = [
  { q: 'Q. 本当に無料で使えますか？追加料金はかかりませんか？', a: 'はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。有料プランにアップグレードする際も、いつでも解約可能です。' },
  { q: 'Q. パソコンが苦手でも使えますか？', a: '大丈夫です。テンプレートを選んで文字を変えるだけなので、パソコン操作に自信がない方でも直感的に使えます。スマホからでも編集可能です。' },
  { q: 'Q. 他のツールからの乗り換えは簡単ですか？', a: 'はい、とても簡単です。既存のWebページやGoogleフォームの内容をコピー＆ペーストするだけで移行できます。' },
  { q: 'Q. 商用利用は可能ですか？', a: 'もちろんです。フリープラン・有料プランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。' },
  { q: 'Q. 作成したページは、どこで公開されますか？', a: 'makers.tokyo/あなたのID というURLで公開されます。このリンクをSNSのプロフィール、名刺、チラシなどに掲載してご利用ください。' },
];

export default function HomePage() {
  return (
    <>
      {/* 構造化データ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <HomeAuthProvider>
        {/* ========== 1. Hero — ベネフィット訴求 ========== */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
          {/* 背景装飾 */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.04 }} />
          <div className="absolute top-0 left-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ backgroundColor: '#ffedd5' }} />

          <div className="container mx-auto px-4 text-center relative z-10">
            {/* キャッチフレーズ */}
            <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/80 backdrop-blur text-sm font-bold mb-8 border border-orange-200 shadow-sm" style={{ color: '#f97316' }}>
              <Check size={16} />
              ずっと無料 ・ クレカ登録なし ・ スマホで完結
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }} data-speakable>
              集客を、<span style={{ color: '#f97316' }}>"仕組み"</span>にする。<br />
              <span className="text-2xl md:text-4xl lg:text-5xl">ひとりでも、ここまでできる。</span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed" data-speakable>
              「知ってもらう」から「買ってもらう」まで。<br className="hidden md:block" />
              あなたのビジネスに合った<span className="font-bold" style={{ color: '#f97316' }}>集客の流れ</span>を、<br className="hidden md:block" />
              テンプレートを選ぶだけでつくれます。
            </p>

            {/* メインCTA — 振り分けセクションへ */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="#flowchart"
                className="w-full sm:w-auto text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2"
                style={{ backgroundColor: '#f97316' }}
              >
                あなたに合う集客の型を見つける
                <ArrowRight size={20} />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <AuthCTAButton className="font-bold hover:underline transition" style={{ color: '#f97316' }}>ログイン</AuthCTAButton>
              <span className="text-gray-300">|</span>
              <a href="/tools" className="font-bold hover:underline transition" style={{ color: '#f97316' }}>全ツール一覧</a>
              <span className="text-gray-300">|</span>
              <a href="/portal" className="font-bold hover:underline transition" style={{ color: '#f97316' }}>みんなの作品</a>
              <span className="text-gray-300">|</span>
              <WelcomeGuideButton className="font-bold hover:underline transition" style={{ color: '#f97316' }}>はじめてガイド</WelcomeGuideButton>
            </div>
          </div>
        </section>

        {/* ========== 2. 人気ツール クイックスタート ========== */}
        <PopularToolsGrid />

        {/* ========== 2.5 ゲスト体験セクション ========== */}
        <GuestTrialSection />

        {/* ========== 3. 共感セクション — 課題の言語化 ========== */}
        <section className="py-16 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: '#5d4037' }}>
              こんなこと、感じていませんか？
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              {[
                'SNSを頑張っているのに、売上につながらない',
                'ホームページをつくりたいけど、何十万も払えない',
                '予約・申込の管理がバラバラで追いきれない',
                '良い商品があるのに、知ってもらえていない',
                '集客のために何をすればいいか分からない',
                'ツールが多すぎて、結局どれも使いこなせない',
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100"
                >
                  <span className="text-orange-400 mt-0.5 flex-shrink-0">●</span>
                  <span className="text-gray-700 text-sm font-medium leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <p className="text-lg font-bold" style={{ color: '#5d4037' }}>
                集客メーカーは、そのすべてを<span style={{ color: '#f97316' }}>「仕組み」</span>で解決します。
              </p>
            </div>
          </div>
        </section>

        {/* ========== 3. フローチャート振り分け ========== */}
        <section id="flowchart" className="py-20" style={{ backgroundColor: '#fffbf0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full mb-4 border border-orange-200">
                <Sparkles size={16} />
                <span className="font-bold text-sm">30秒で分かる</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
                あなたに合った集客の型を見つけよう
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                2つの質問に答えるだけ。あなたのビジネスにぴったりの<br className="hidden md:block" />
                集客ステップをご提案します。
              </p>
            </div>
            <FlowChartNav />
          </div>
        </section>

        {/* ========== 5. 活用事例ミニカード ========== */}
        <UseCaseMiniCards />

        {/* ========== 6. 業種別ナビ ========== */}
        <IndustryNavSection />

        {/* ========== 5. ホームページリバイバルプラン ========== */}
        <section className="py-12 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
          <div className="max-w-4xl mx-auto px-4">
            <a
              href="/for/hp-activate"
              className="group block relative overflow-hidden rounded-3xl border-2 border-emerald-200 p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)' }}
            >
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-emerald-500 opacity-10" />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full mb-3 shadow-sm text-emerald-600 text-xs font-bold border border-emerald-200">
                    既存HP・LPをお持ちの方へ
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-1" style={{ color: '#5d4037' }}>
                    ホームページ リバイバルプラン
                  </h3>
                  <p className="text-sm text-gray-600">
                    AIチャットボット＆ガイドを埋め込むだけで、動きのないサイトが<span className="font-bold text-emerald-600">24時間働く営業マン</span>に。
                  </p>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 group-hover:gap-3 transition-all flex-shrink-0">
                  詳しく見る <ArrowRight size={16} />
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ========== 8. ファネル別ツール紹介 ========== */}
        <FunnelStageShowcase />

        {/* ========== 7. Pricing ========== */}
        <PricingSection />

        {/* ========== 9. FAQ ========== */}
        <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4" style={{ color: '#5d4037' }}>よくある質問</h2>
              <p className="text-gray-600">不安や疑問を解消してから、始めましょう。</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-orange-50 bg-white">
                  <details className="group">
                    <summary data-speakable="question" className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                      <span>{faq.q}</span>
                      <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                    </summary>
                    <div data-speakable="answer" className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>{faq.a}</div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 10. Final CTA ========== */}
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#f97316' }}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white" data-speakable>
              あなたのビジネスを、<br />もっと「楽しく」「楽に」。
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-orange-100">
              「いつかやろう」を、今日にしませんか？<br />
              テンプレートを選ぶだけで、集客の仕組みが動き出します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <AuthCTAButton className="w-full sm:w-auto bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2" style={{ color: '#f97316' }}>
                <Sparkles size={20} />無料で始める
              </AuthCTAButton>
              <a href="#flowchart" className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white/10 text-white text-lg font-bold py-4 px-12 rounded-full transition transform hover:-translate-y-1">
                自分に合う型を見つける
              </a>
            </div>
            <p className="text-sm text-orange-100">※ 登録は30秒で完了 / クレジットカード不要 / いつでも無料で使えます</p>
          </div>
        </section>

        {/* ========== 11. 開発支援 ========== */}
        <section className="py-16" style={{ backgroundColor: '#fffbf0' }}>
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#5d4037' }}>
              集客メーカーの開発を応援しませんか？
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#8d6e63' }}>
              「便利だな」と感じていただけたら、<br className="sm:hidden" />
              開発を続けるための応援をいただけるととても励みになります。
            </p>
            <a
              href="/donation"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-2"
              style={{ color: '#f97316', borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}
            >
              <Gift size={18} />開発を応援する
            </a>
          </div>
        </section>
      </HomeAuthProvider>
    </>
  );
}
