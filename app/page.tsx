import { Metadata } from 'next';
import {
  Sparkles,
  UserCircle,
  Building2,
  ArrowRight,
  Calendar,
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
  PartyPopper,
  Mail,
  GitBranch,
  Video,
  ClipboardCheck,
  ShoppingBag,
  Globe,
  Search,
  Tv,
  Compass,
} from 'lucide-react';

// Client Components
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import { AuthCTAButton, ScrollButton, WelcomeGuideButton } from '@/components/home/HomeClientButtons';
import StatsBar from '@/components/home/StatsBar';
import DiagnosisSection from '@/components/home/DiagnosisSection';
import RecipeTabSection from '@/components/home/RecipeTabSection';
import PricingSection from '@/components/home/PricingSection';
import PopularContents from '@/components/home/PopularContents';
import PersonaRoadmap from '@/components/home/PersonaRoadmap';
import ToolGuideBanner from '@/components/home/ToolGuideBanner';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '集客メーカー｜あなたのビジネスに最適な集客ツールをステップバイステップで',
  description: '起業準備、コーチ・コンサル、セミナー開催、コンテンツ販売、EC事業、SNS発信。あなたのステージに合わせて最適なツールをご案内。診断クイズ・LP・予約・メルマガなど30種以上が無料で使えます。',
  keywords: [
    '集客メーカー', '集客ツール', '起業ツール', 'ビジネスツール', '診断クイズ', '診断クイズ作成',
    'プロフィールLP', 'ランディングページ作成', 'LP作成ツール', 'LP作成無料',
    'AI自動生成', 'SNS集客', 'SEO対策', 'リード獲得', '無料ツール',
    'マーケティングツール', 'コンテンツマーケティング', 'セミナー集客', 'コーチ集客',
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: '集客メーカー｜あなたのビジネスに最適な集客ツールをステップバイステップで',
    description: 'あなたのステージに合わせて最適なツールをご案内。診断クイズ・LP・予約・メルマガなど30種以上が無料。',
    url: siteUrl,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('あなたに最適なツールをステップバイステップで')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '集客メーカー｜あなたのビジネスに最適な集客ツールをステップバイステップで',
    description: 'あなたのステージに合わせて最適なツールをご案内。30種以上が無料。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('あなたに最適なツールをステップバイステップで')}`],
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

// 構造化データ - FAQPage（SEO リッチリザルト対応）
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
        {/* ========== 1. Hero Section — ポジショニング明確化 ========== */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', opacity: 0.08 }}></div>
          <div className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ backgroundColor: '#ffedd5' }}></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-block py-1.5 px-5 rounded-full bg-white text-sm font-bold mb-6 tracking-wide border-2 shadow-sm" style={{ color: '#f97316', borderColor: '#f97316' }}>
              ぜーんぶ月額0円で使い放題
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }}>
              集客に必要なもの、<br />
              <span style={{ color: '#f97316' }}>ぜんぶここに。</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed" data-speakable>
              LP・診断クイズ・予約・メルマガ・HP・ファネル・リサーチ…<br className="hidden md:block" />
              <span className="font-bold" style={{ color: '#f97316' }}>30種以上のツール</span>が、ぜんぶ無料で使い放題。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <ScrollButton to="persona-roadmap" className="w-full sm:w-auto text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2" style={{ backgroundColor: '#f97316' }}>
                <Compass size={20} />自分に合うツールを見つける
              </ScrollButton>
              <a href="/portal" className="w-full sm:w-auto text-lg font-bold py-4 px-10 rounded-full shadow-sm transition transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-white border-2" style={{ color: '#5d4037', borderColor: '#ffedd5' }}>
                <LayoutGrid size={20} />みんなの作品を見る
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
              <AuthCTAButton className="hover:underline transition" style={{ color: '#f97316' }}>ログイン</AuthCTAButton>
              <span className="text-gray-300">|</span>
              <ScrollButton to="create-section-services" className="hover:underline transition" style={{ color: '#f97316' }}>全ツール一覧</ScrollButton>
              <span className="text-gray-300">|</span>
              <ScrollButton to="diagnosis" className="hover:underline transition" style={{ color: '#f97316' }}>無料診断</ScrollButton>
              <span className="text-gray-300">|</span>
              <WelcomeGuideButton className="hover:underline transition" style={{ color: '#f97316' }}>はじめてガイド</WelcomeGuideButton>
            </div>
          </div>
        </section>

        {/* ========== 2. Stats Bar ========== */}
        <StatsBar />

        {/* ========== 3. Marquee - Text Badges ========== */}
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

        {/* ========== 4. ペルソナ別ロードマップ（NEW: メインセクション） ========== */}
        <section id="persona-roadmap" className="py-20 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full mb-4 border border-orange-200">
                <Compass size={16} />
                <span className="font-bold text-sm">ステップバイステップガイド</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
                あなたはどのタイプ？
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                近いタイプを選ぶだけで、今やるべきことが明確に。<br className="hidden md:block" />
                ビジネスの成長に合わせた最適なツールをご案内します。
              </p>
            </div>
            <PersonaRoadmap />
          </div>
        </section>

        {/* ========== 5. Marquee - Tool Icons ========== */}
        <section className="py-4 overflow-hidden border-b" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)', borderColor: '#ffedd5' }}>
          <div className="relative">
            <div className="marquee-right inline-flex py-2">
              {[...Array(2)].flatMap((_, setIdx) =>
                [
                  // LP・ページ作成
                  { icon: UserCircle, text: 'プロフィール', color: 'text-indigo-500' },
                  { icon: Building2, text: 'LP', color: 'text-indigo-500' },
                  { icon: Video, text: 'ウェビナーLP', color: 'text-indigo-500' },
                  // 診断・クイズ
                  { icon: Sparkles, text: '診断クイズ', color: 'text-emerald-500' },
                  { icon: PartyPopper, text: 'エンタメ診断', color: 'text-emerald-500' },
                  // ライティング・制作
                  { icon: PenTool, text: 'セールスライター', color: 'text-amber-500' },
                  { icon: FileText, text: 'SNS投稿', color: 'text-amber-500' },
                  // 集客・イベント
                  { icon: Calendar, text: '予約', color: 'text-cyan-500' },
                  { icon: Users, text: '出欠表', color: 'text-cyan-500' },
                  { icon: Mail, text: 'メルマガ', color: 'text-cyan-500' },
                  { icon: GitBranch, text: 'ファネル', color: 'text-cyan-500' },
                  // 収益化・販売
                  { icon: ClipboardCheck, text: 'フォーム', color: 'text-purple-500' },
                  // ゲーミフィケーション
                  { icon: Gift, text: '福引き', color: 'text-pink-500' },
                  { icon: Gamepad2, text: 'ガチャ', color: 'text-purple-500' },
                  { icon: Star, text: 'スロット', color: 'text-yellow-500' },
                  { icon: Ticket, text: 'スクラッチ', color: 'text-cyan-500' },
                  { icon: Stamp, text: 'スタンプラリー', color: 'text-green-500' },
                  // リサーチ
                  { icon: BookOpen, text: 'Kindleリサーチ', color: 'text-orange-500' },
                  { icon: ShoppingBag, text: '楽天リサーチ', color: 'text-rose-500' },
                  { icon: Globe, text: 'Googleリサーチ', color: 'text-teal-500' },
                  { icon: Search, text: 'YouTubeリサーチ', color: 'text-red-500' },
                  { icon: Tv, text: 'ニコニコリサーチ', color: 'text-orange-500' },
                  { icon: Globe, text: 'Redditリサーチ', color: 'text-orange-600' },
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

        {/* ========== 6. Features - 3つの力 ========== */}
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

        {/* ========== 7. 全ツール一覧バナー + ガイドメーカー ========== */}
        <section id="create-section-services" className="py-16 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 全ツール一覧バナー */}
              <a
                href="/tools"
                className="group relative overflow-hidden rounded-3xl border-2 p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
                style={{ borderColor: '#f97316', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)' }}
              >
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: '#f97316' }} />
                <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: '#f97316' }} />
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full mb-4 shadow-sm">
                    <LayoutGrid size={16} style={{ color: '#f97316' }} />
                    <span className="text-xs font-bold" style={{ color: '#f97316' }}>30種以上のツール</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: '#5d4037' }}>
                    全ツール一覧
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    LP・診断・予約・メルマガ・ファネル・リサーチ…<br />
                    カテゴリ別に全ツールをチェック
                  </p>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm mt-4 group-hover:gap-3 transition-all" style={{ color: '#f97316' }}>
                  一覧を見る <ArrowRight size={16} />
                </div>
              </a>

              {/* 集客メーカーガイド（モーダル表示） */}
              <ToolGuideBanner />
            </div>
          </div>
        </section>

        {/* ========== 8. Diagnosis ========== */}
        <section id="diagnosis" className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>あなたに最適なツール診断</h2>
              <p className="text-gray-600">4つの質問に答えるだけで、あなたに最適なツールの組み合わせを提案します。</p>
            </div>
            <DiagnosisSection />
          </div>
        </section>

        {/* ========== 10. Recipe Tabs ========== */}
        <RecipeTabSection />

        {/* ========== 11. 3 Steps ========== */}
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

        {/* ========== 11. Pricing ========== */}
        <PricingSection />

        {/* ========== 13.5. 有料プラン Promo ========== */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-100 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full mb-4">
                  <Crown size={16} /><span className="font-bold text-sm">有料プラン</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: '#5d4037' }}>有料プランなら、もっとできる。</h3>
                <p className="text-gray-600 text-sm md:text-base">無料で始めて、ビジネスの成長に合わせてアップグレード。<br className="hidden md:block" />有料プランの機能で、集客を加速させましょう。</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Zap, label: 'AI利用', desc: 'AI機能で\nコンテンツ作成を加速' },
                  { icon: Gamepad2, label: 'ゲーミフィケーション', desc: 'ガチャ・福引き等\n全種類が使い放題' },
                  { icon: Target, label: 'フル機能解放', desc: 'ファネル・メルマガ等\n制限なく利用可能' },
                  { icon: Star, label: '今後の新機能', desc: '有料プランの\n新機能を優先提供' },
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
                  <Crown size={18} />有料プランの詳細を見る<ArrowRight size={18} />
                </a>
                <p className="text-xs text-gray-500 mt-3">月額¥1,980〜 ・ いつでも解約OK</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 14. FAQ ========== */}
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

        {/* ========== 15. Popular Contents ========== */}
        <PopularContents />

        {/* ========== 16. Final CTA ========== */}
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
              <ScrollButton to="persona-roadmap" className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white/10 text-white text-lg font-bold py-4 px-12 rounded-full transition transform hover:-translate-y-1">
                タイプ別ガイドを見る
              </ScrollButton>
            </div>
            <p className="text-sm text-orange-100">※ 登録は30秒で完了 / クレジットカード不要 / いつでも無料で使えます</p>
          </div>
        </section>

        {/* ========== 17. Support ========== */}
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
