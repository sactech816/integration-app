import { Metadata } from 'next';
import {
  Sparkles,
  UserCircle,
  Building2,
  ArrowRight,
  Calendar,
  ClipboardList,
  Gamepad2,
  Check,
  TrendingUp,
  Zap,
  Target,
  LayoutGrid,
  Crown,
  Users,
  FileText,
  Gift,
  Star,
  Ticket,
  Stamp,
  PenTool,
  BookOpen,
} from 'lucide-react';

// Client Components
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import { AuthCTAButton, ScrollButton, WelcomeGuideButton } from '@/components/home/HomeClientButtons';
import HomeServiceSelector from '@/components/home/HomeServiceSelector';
import StatsBar from '@/components/home/StatsBar';
import DiagnosisSection from '@/components/home/DiagnosisSection';
import RecipeTabSection from '@/components/home/RecipeTabSection';
import PricingSection from '@/components/home/PricingSection';
import PopularContents from '@/components/home/PopularContents';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成。SNS拡散・SEO対策で集客を加速',
  description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策であなたのビジネスに顧客を引き寄せる集客ツール。無料で今すぐ始められます。',
  keywords: [
    '集客メーカー', '集客ツール', '診断クイズ', '診断クイズ作成', '診断コンテンツ',
    '性格診断作成', 'プロフィールLP', 'プロフィールサイト', 'リンクまとめ', 'ビジネスLP',
    'ランディングページ作成', 'LP作成ツール', 'LP作成無料', 'AI自動生成', 'AIツール',
    'SNS集客', 'SEO対策', 'リード獲得', '見込み客獲得', '無料ツール',
    'マーケティングツール', 'コンテンツマーケティング', 'lit.link代替',
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速。無料で今すぐ始められます。',
    url: siteUrl,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('診断クイズ・プロフィールLP・ビジネスLPを簡単作成')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('診断クイズ・プロフィールLP・ビジネスLPを簡単作成')}`],
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
    { '@type': 'ListItem', position: 1, name: '診断クイズメーカー', description: '性格診断、適職診断、心理テスト、検定クイズ、占いなどをAIで自動生成', url: `${siteUrl}/quiz/editor` },
    { '@type': 'ListItem', position: 2, name: 'プロフィールメーカー', description: 'SNSプロフィールに最適なリンクまとめページを作成。lit.link代替ツール', url: `${siteUrl}/profile/editor` },
    { '@type': 'ListItem', position: 3, name: 'ビジネスLPメーカー', description: '商品・サービスのランディングページを無料で作成。CV最適化テンプレート搭載', url: `${siteUrl}/business/editor` },
  ],
};

// 構造化データ - FAQPage（SEO リッチリザルト対応）
const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question', name: '本当に無料で使えますか？追加料金はかかりませんか？',
      acceptedAnswer: { '@type': 'Answer', text: 'はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。プロプランにアップグレードする際も、いつでも解約可能です。' },
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
      acceptedAnswer: { '@type': 'Answer', text: 'もちろんです。フリープラン・プロプランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。' },
    },
    {
      '@type': 'Question', name: '作成したページは、どこで公開されますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'makers.tokyo/あなたのID というURLで公開されます。このリンクをSNSのプロフィール、名刺、チラシなどに掲載してご利用ください。' },
    },
  ],
};

const faqs = [
  { q: 'Q. 本当に無料で使えますか？追加料金はかかりませんか？', a: 'はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。プロプランにアップグレードする際も、いつでも解約可能です。' },
  { q: 'Q. パソコンが苦手でも使えますか？', a: '大丈夫です。テンプレートを選んで文字を変えるだけなので、パソコン操作に自信がない方でも直感的に使えます。スマホからでも編集可能です。' },
  { q: 'Q. 他のツールからの乗り換えは簡単ですか？', a: 'はい、とても簡単です。既存のWebページやGoogleフォームの内容をコピー＆ペーストするだけで移行できます。' },
  { q: 'Q. 商用利用は可能ですか？', a: 'もちろんです。フリープラン・プロプランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。' },
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

      {/* CSS animations for marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scrollRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .marquee-left { animation: scrollLeft 30s linear infinite; }
        .marquee-left:hover { animation-play-state: paused; }
        .marquee-right { animation: scrollRight 40s linear infinite; }
        .marquee-right:hover { animation-play-state: paused; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}} />

      <HomeAuthProvider>
        {/* ========== 1. Hero Section (SSR) ========== */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', opacity: 0.08 }}></div>
          <div className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ backgroundColor: '#ffedd5' }}></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-block py-1.5 px-5 rounded-full bg-white text-sm font-bold mb-6 tracking-wide border-2 shadow-sm" style={{ color: '#f97316', borderColor: '#f97316' }}>
              パソコン苦手でも大丈夫！ ずっと0円
            </span>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }}>
              仕事に役立つ<br />集客ツールが<br />
              <span style={{ color: '#f97316' }}>無料で作り放題</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed" data-speakable>
              <span className="font-bold" style={{ color: '#f97316' }}>診断クイズ</span>、
              <span className="font-bold" style={{ color: '#f97316' }}>プロフィール</span>、
              <span className="font-bold" style={{ color: '#f97316' }}>ランディングページ</span>、<br />
              アンケート、予約システム、出欠確認、ゲーム、Kindle出版まで...。<br />
              あなたのアイデア次第で、使い方は無限大！
            </p>

            {/* CTA Buttons (Client) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <ScrollButton to="create-section-services" className="w-full sm:w-auto text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2" style={{ backgroundColor: '#f97316' }}>
                <Sparkles size={20} />今すぐ何か作る！
              </ScrollButton>
              <a href="/portal" className="w-full sm:w-auto text-lg font-bold py-4 px-10 rounded-full shadow-sm transition transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-white border-2" style={{ color: '#5d4037', borderColor: '#ffedd5' }}>
                <LayoutGrid size={20} />みんなの作品を見る
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
              <AuthCTAButton className="hover:underline transition" style={{ color: '#f97316' }}>ログイン</AuthCTAButton>
              <span className="text-gray-300">|</span>
              <ScrollButton to="create-section-services" className="hover:underline transition" style={{ color: '#f97316' }}>ツール一覧</ScrollButton>
              <span className="text-gray-300">|</span>
              <ScrollButton to="diagnosis" className="hover:underline transition" style={{ color: '#f97316' }}>無料診断</ScrollButton>
              <span className="text-gray-300">|</span>
              <WelcomeGuideButton className="hover:underline transition" style={{ color: '#f97316' }}>はじめてガイド</WelcomeGuideButton>
            </div>
          </div>
        </section>

        {/* ========== 2. Stats Bar (Client) ========== */}
        <StatsBar />

        {/* ========== 3. Marquee - Text Badges (SSR) ========== */}
        <section className="py-3 overflow-hidden border-b" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
          <div className="relative">
            <div className="marquee-left inline-flex py-2">
              {[...Array(2)].flatMap((_, setIdx) =>
                ['ずっと0円', 'テンプレート豊富', 'プログラミング不要', 'クレカ登録なし', '商用利用OK', 'スマホで完結', 'AI自動生成', 'SNS拡散設計'].map((text, i) => (
                  <div key={`${setIdx}-${i}`} className="flex-shrink-0 mx-4 flex items-center gap-2">
                    <Check size={16} style={{ color: '#f97316' }} />
                    <span className="font-bold text-sm whitespace-nowrap" style={{ color: '#5d4037' }}>{text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ========== 4. Marquee - Tool Icons (SSR) ========== */}
        <section className="py-4 overflow-hidden border-b" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)', borderColor: '#ffedd5' }}>
          <div className="relative">
            <div className="marquee-right inline-flex py-2">
              {[...Array(2)].flatMap((_, setIdx) =>
                [
                  { icon: Sparkles, text: '診断クイズ', color: 'text-pink-500' },
                  { icon: FileText, text: 'アンケート', color: 'text-teal-500' },
                  { icon: Users, text: '出欠表', color: 'text-purple-500' },
                  { icon: Calendar, text: '予約', color: 'text-blue-500' },
                  { icon: UserCircle, text: 'プロフィール', color: 'text-emerald-500' },
                  { icon: Building2, text: 'LP', color: 'text-amber-500' },
                  { icon: PenTool, text: 'セールスライター', color: 'text-rose-500' },
                  { icon: Gift, text: '福引き', color: 'text-pink-500' },
                  { icon: Gamepad2, text: 'ガチャ', color: 'text-purple-500' },
                  { icon: Star, text: 'スロット', color: 'text-yellow-500' },
                  { icon: Ticket, text: 'スクラッチ', color: 'text-cyan-500' },
                  { icon: Stamp, text: 'スタンプラリー', color: 'text-green-500' },
                  { icon: BookOpen, text: 'Kindle出版', color: 'text-orange-500' },
                ].map((tool, i) => (
                  <div key={`${setIdx}-${i}`} className="w-[160px] flex-shrink-0 bg-white border border-orange-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mx-2">
                    <div className={`${tool.color} mb-1`}><tool.icon size={28} /></div>
                    <h3 className="font-bold text-xs" style={{ color: '#5d4037' }}>{tool.text}</h3>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ========== 5. Tool Selection (SSR + Client ServiceSelector) ========== */}
        <section id="create-section-services" className="py-20 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>何を作りますか？</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">目的に合わせて最適なコンテンツタイプを選んでね！</p>
            </div>
            <HomeServiceSelector />
            <p className="text-center text-sm text-gray-500 mt-6">
              迷ったら、下にある「<ScrollButton to="diagnosis" className="font-bold hover:underline" style={{ color: '#f97316' }}>診断</ScrollButton>」を試してみてね
            </p>
          </div>
        </section>

        {/* ========== 6. Gallery (SSR) ========== */}
        <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>こんな素敵なページが作れちゃう</h2>
              <p className="text-gray-600">デザインのセンスはいりません！テンプレートを選ぶだけ。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:-translate-y-2 transition duration-300">
                <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: '#fce7f3' }}><span className="text-7xl">💅</span></div>
                <div className="p-6">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#ec4899', backgroundColor: '#fce7f3' }}>美容・サロン</span>
                  <h4 className="font-bold text-lg mt-3 mb-1" style={{ color: '#5d4037' }}>予約もできるページ</h4>
                  <p className="text-sm text-gray-500">おしゃれなサロンさんに人気！</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:-translate-y-2 transition duration-300">
                <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}><span className="text-7xl">👩‍🏫</span></div>
                <div className="p-6">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#2563eb', backgroundColor: '#dbeafe' }}>先生・コーチ</span>
                  <h4 className="font-bold text-lg mt-3 mb-1" style={{ color: '#5d4037' }}>信頼プロフィール</h4>
                  <p className="text-sm text-gray-500">経歴や実績をしっかりアピール</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:-translate-y-2 transition duration-300">
                <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: '#fef9c3' }}><span className="text-7xl">🍔</span></div>
                <div className="p-6">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#ca8a04', backgroundColor: '#fef9c3' }}>飲食・お店</span>
                  <h4 className="font-bold text-lg mt-3 mb-1" style={{ color: '#5d4037' }}>クーポン付き診断</h4>
                  <p className="text-sm text-gray-500">お客さんが楽しめる仕掛け！</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <a href="/portal" className="font-bold border-b-2 transition inline-flex items-center gap-2" style={{ color: '#f97316', borderColor: '#f97316' }}>
                もっと他のデザインを見る<ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* ========== 7. Diagnosis (Client) ========== */}
        <section id="diagnosis" className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>あなたに最適なツール診断</h2>
              <p className="text-gray-600">3つの質問に答えるだけで、今の課題を解決するツールセットを提案します。</p>
            </div>
            <DiagnosisSection />
          </div>
        </section>

        {/* ========== 8. Features - 3つの力 (SSR) ========== */}
        <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>ビジネスを加速させる「3つの力」</h2>
              <p className="text-gray-600">必要なのは「機能の多さ」ではなく「成果につながる流れ」です。</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-3xl border border-orange-50 hover:shadow-lg transition group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}><TrendingUp size={28} /></div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【集客】知ってもらう</h3>
                <p className="text-sm font-bold mb-4 tracking-wider" style={{ color: '#f97316' }}>プロフィール / LP / セールスライター</p>
                <p className="text-gray-600 text-sm">テンプレートを選ぶだけで、名刺代わりのWebページが完成。AIが売れる文章を自動生成。SNS拡散設計でオーガニックな集客を実現。</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border-2 shadow-lg transform md:-translate-y-4 relative group" style={{ borderColor: '#f97316' }}>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">差別化ポイント！</div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}><Gamepad2 size={28} /></div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【接客】ファンにする</h3>
                <p className="text-sm font-bold mb-4 tracking-wider" style={{ color: '#f97316' }}>診断クイズ / ガチャ / 福引き / スクラッチ等</p>
                <p className="text-gray-600 text-sm">「あなたは何タイプ？」診断クイズやガチャ、スタンプラリーなどの遊べるコンテンツで、お客様との距離を縮めます。</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-orange-50 hover:shadow-lg transition group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><Calendar size={28} /></div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【成約】スムーズに繋がる</h3>
                <p className="text-sm font-bold mb-4 tracking-wider" style={{ color: '#f97316' }}>予約 / アンケート / 出欠表</p>
                <p className="text-gray-600 text-sm">面倒な日程調整の往復メールは不要。予約受付から顧客の声の収集、イベントの出欠管理まで自動化し、チャンスを逃しません。</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 9. Recipe Tabs (Client) ========== */}
        <RecipeTabSection />

        {/* ========== 10. 3 Steps (SSR) ========== */}
        <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>使い方はシンプル</h2>
              <p className="text-gray-600">パソコンが苦手でも大丈夫。3ステップで完成します。</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#f97316' }}>1</div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>テンプレートを選ぶ</h3>
                  <p className="text-sm text-gray-600">業種や目的に合わせて、豊富なテンプレートから選択。デザインの知識は不要です。</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#ec4899' }}>2</div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>文字と画像を変える</h3>
                  <p className="text-sm text-gray-600">あなたのビジネス内容に合わせて、テキストや画像を差し替えるだけ。直感的に編集できます。</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#84cc16' }}>3</div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>公開してシェア</h3>
                  <p className="text-sm text-gray-600">あなた専用のURLが発行されます。SNSや名刺に載せて、すぐに集客スタート！</p>
                </div>
              </div>
              <div className="mt-12 text-center">
                <AuthCTAButton className="text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl transition transform hover:-translate-y-1 inline-flex items-center gap-2" style={{ backgroundColor: '#f97316' }}>
                  <Sparkles size={20} />無料で始める（30秒で登録完了）
                </AuthCTAButton>
                <p className="text-xs text-gray-500 mt-3">※ クレジットカード登録不要</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 11. Comparison Table (SSR) ========== */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#5d4037' }}>こんな「ツール迷子」になっていませんか？</h2>
                <p className="text-gray-600">あれもこれも契約して、管理画面を行き来する日々はもう終わりです。</p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg border-2 overflow-hidden" style={{ borderColor: '#ffedd5' }}>
                <div className="grid grid-cols-2 text-center">
                  <div className="p-6 border-b border-r" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}><h3 className="font-bold text-gray-500">これまでの運用</h3></div>
                  <div className="p-6 border-b text-white" style={{ backgroundColor: '#f97316', borderColor: '#ffedd5' }}><h3 className="font-bold">Makersの運用</h3></div>
                  <div className="p-8 border-b border-r flex flex-col items-center justify-center gap-2" style={{ borderColor: '#ffedd5' }}>
                    <ClipboardList size={40} className="text-gray-300" /><div className="font-bold text-gray-600">バラバラのツール</div><div className="text-xs text-gray-400">HP・予約・フォーム...<br />3つ以上の管理画面</div>
                  </div>
                  <div className="p-8 border-b flex flex-col items-center justify-center gap-2" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                    <Check size={40} style={{ color: '#f97316' }} /><div className="font-bold" style={{ color: '#5d4037' }}>これ1つで完結</div><div className="text-xs" style={{ color: '#f97316' }}>すべての機能が<br />ひとつの管理画面に</div>
                  </div>
                  <div className="p-8 border-r flex flex-col items-center justify-center gap-2" style={{ borderColor: '#ffedd5' }}>
                    <TrendingUp size={40} className="text-gray-300" /><div className="font-bold text-gray-600">月額 ¥10,000~</div><div className="text-xs text-gray-400">ツールの数だけ<br />コストがかさむ</div>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: '#fffbf0' }}>
                    <Sparkles size={40} style={{ color: '#f97316' }} /><div className="font-bold text-2xl" style={{ color: '#5d4037' }}>¥0</div><div className="text-xs" style={{ color: '#f97316' }}>ずっと無料<br />追加費用なし</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 12. Pricing (Client) ========== */}
        <PricingSection />

        {/* ========== 12.5. Pro Plan Promo (SSR) ========== */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-100 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full mb-4">
                  <Crown size={16} /><span className="font-bold text-sm">Pro Plan</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: '#5d4037' }}>プロプランなら、もっとできる。</h3>
                <p className="text-gray-600 text-sm md:text-base">無料で始めて、ビジネスの成長に合わせてアップグレード。<br className="hidden md:block" />プロプランだけの機能で、集客を加速させましょう。</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Zap, label: 'AI優先利用', desc: '待ち時間ゼロで\nAIをフル活用' },
                  { icon: TrendingUp, label: 'アクセス解析', desc: 'データで\n改善サイクル' },
                  { icon: Crown, label: 'セミナー参加', desc: '限定セミナーで\nノウハウ習得' },
                  { icon: Star, label: '今後の新機能', desc: 'Pro専用の\n新機能を優先提供' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-white/70 rounded-2xl">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <item.icon size={18} className="text-white" />
                    </div>
                    <div className="font-bold text-sm mb-1" style={{ color: '#5d4037' }}>{item.label}</div>
                    <div className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a href="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold px-8 py-4 rounded-2xl transition shadow-lg hover:-translate-y-1 transform text-sm">
                  <Crown size={18} />プロプランの全機能を見る<ArrowRight size={18} />
                </a>
                <p className="text-xs text-gray-500 mt-3">月額¥3,980 ・ いつでも解約OK</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 13. FAQ (SSR + JSON-LD) ========== */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>よくある質問</h2>
              <p className="text-gray-600">不安や疑問を解消してから、始めましょう。</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-orange-50 bg-white">
                  <details className="group">
                    <summary className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                      <span>{faq.q}</span>
                      <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                    </summary>
                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>{faq.a}</div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 14. Popular Contents (Client) ========== */}
        <PopularContents />

        {/* ========== 15. Final CTA (SSR + Client buttons) ========== */}
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#f97316' }}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white" data-speakable>
              あなたのビジネスを、<br />もっと「楽しく」「楽に」。
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-orange-100">
              集客メーカー (Makers) は、あなたの「やりたいこと」を実現するためのツールです。<br />まずは無料で試してみませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <AuthCTAButton className="w-full sm:w-auto bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2" style={{ color: '#f97316' }}>
                <Sparkles size={20} />無料で始める
              </AuthCTAButton>
              <ScrollButton to="diagnosis" className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white/10 text-white text-lg font-bold py-4 px-12 rounded-full transition transform hover:-translate-y-1">
                診断から始める
              </ScrollButton>
            </div>
            <p className="text-sm text-orange-100">※ 登録は30秒で完了 / クレジットカード不要 / いつでも無料で使えます</p>
          </div>
        </section>

        {/* ========== 16. Support (SSR) ========== */}
        <section className="py-16" style={{ backgroundColor: '#fffbf0' }}>
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <p className="text-sm mb-3" style={{ color: '#b08050' }}>ひとりで開発しています</p>
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#5d4037' }}>
              集客メーカーの開発を応援しませんか？
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#8d6e63' }}>
              集客メーカーは個人開発で運営しています。<br />
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
