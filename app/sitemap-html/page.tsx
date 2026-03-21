import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Home,
  Sparkles,
  UserCircle,
  Building2,
  FileText,
  Calendar,
  ExternalLink,
  Layout,
  HelpCircle,
  PenTool,
  Megaphone,
  DollarSign,
  Video,
  MousePointerClick,
  Globe,
  Brain,
  PartyPopper,
  Star,
  Image,
  Send,
  BookOpen,
  Lightbulb,
  Users,
  ClipboardList,
  Mail,
  ListOrdered,
  GitBranch,
  MessageCircle,
  BarChart3,
  Search,
  ShoppingBag,
  Tv,
  ClipboardCheck,
  Gamepad2,
  Store,
  Share2,
  Bot,
  MessageSquare,
  Map,
  Info,
  Briefcase,
  BookMarked,
  LucideIcon,
  ArrowRight,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'サイトマップ｜集客メーカー',
  description:
    '集客メーカーの全ページへのリンク一覧。ツール紹介・新規作成ページ、業種別ガイド、公開コンテンツなど、すべてのページにアクセスできます。',
  alternates: {
    canonical: `${siteUrl}/sitemap-html`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ---- データ定義 ----

type SitemapLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

type ToolEntry = {
  label: string;
  description: string;
  icon: LucideIcon;
  introHref: string;
  createHref: string;
};

type ToolCategoryDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  tools: ToolEntry[];
};

const MAIN_PAGES: SitemapLink[] = [
  { label: 'トップページ', href: '/', icon: Home },
  { label: 'ツール一覧', href: '/tools', icon: Layout },
  { label: 'ポータル（作品一覧）', href: '/portal', icon: Globe },
  { label: '料金プラン', href: '/pricing', icon: DollarSign },
  { label: '使い方ガイド', href: '/howto', icon: BookMarked },
  { label: '効果的な活用法', href: '/effective-use', icon: Lightbulb },
  { label: 'よくある質問', href: '/faq', icon: HelpCircle },
  { label: 'お問い合わせ', href: '/contact', icon: Mail },
  { label: 'サポート', href: '/support', icon: Info },
  { label: '利用規約', href: '/legal', icon: FileText },
  { label: 'プライバシーポリシー', href: '/privacy', icon: FileText },
];

const TOOL_CATEGORIES: ToolCategoryDef[] = [
  {
    id: 'page',
    label: 'LP・ページ作成',
    icon: Layout,
    color: 'indigo',
    tools: [
      { label: 'プロフィールメーカー', description: 'プロフィールLPを作成', icon: UserCircle, introHref: '/profile', createHref: '/profile/editor' },
      { label: 'LPメーカー', description: 'ビジネスLPを作成', icon: Building2, introHref: '/business', createHref: '/business/editor' },
      { label: 'ウェビナーLPメーカー', description: 'ウェビナーLPを作成', icon: Video, introHref: '/webinar', createHref: '/webinar/editor' },
      { label: 'ガイドメーカー', description: 'ガイドページを作成', icon: MousePointerClick, introHref: '/onboarding', createHref: '/onboarding/editor' },
      { label: 'ホームページメーカー', description: '複数ページサイトを作成', icon: Globe, introHref: '/site', createHref: '/site/editor' },
      { label: 'セールスライター', description: 'セールスレターを作成', icon: FileText, introHref: '/salesletter', createHref: '/salesletter/editor' },
      { label: 'フォームメーカー', description: '申し込み・決済フォームを作成', icon: ClipboardCheck, introHref: '/order-form', createHref: '/order-form/new' },
    ],
  },
  {
    id: 'quiz',
    label: '診断・クイズ',
    icon: HelpCircle,
    color: 'emerald',
    tools: [
      { label: '診断クイズメーカー', description: '診断クイズを作成', icon: Sparkles, introHref: '/quiz', createHref: '/quiz/editor' },
      { label: 'エンタメ診断メーカー', description: 'エンタメ診断を作成', icon: PartyPopper, introHref: '/entertainment', createHref: '/entertainment/create' },
      { label: 'Big Five性格診断', description: '科学的な性格診断', icon: Brain, introHref: '/bigfive', createHref: '/bigfive' },
      { label: '生年月日占い', description: '九星気学・数秘術・四柱推命', icon: Star, introHref: '/fortune', createHref: '/fortune' },
    ],
  },
  {
    id: 'writing',
    label: 'ライティング・制作',
    icon: PenTool,
    color: 'amber',
    tools: [
      { label: 'サムネイルメーカー', description: 'AIサムネイル作成', icon: Image, introHref: '/thumbnail', createHref: '/thumbnail/editor' },
      { label: 'SNS投稿メーカー', description: 'SNS投稿を作成', icon: Send, introHref: '/sns-post', createHref: '/sns-post/editor' },
      { label: 'Kindle出版メーカー', description: 'AI書籍執筆', icon: BookOpen, introHref: '/kindle', createHref: '/kindle/new' },
      { label: 'Kindle表紙メーカー', description: 'AI表紙デザイン', icon: Image, introHref: '/kindle', createHref: '/kindle/cover/editor' },
      { label: 'ネタ発掘診断', description: '執筆ネタを発掘', icon: Lightbulb, introHref: '/kindle/discovery', createHref: '/kindle/discovery' },
      { label: 'Kindleキーワードリサーチ', description: 'Kindle出版キーワード分析', icon: BookOpen, introHref: '/kindle-keywords', createHref: '/kindle-keywords/editor' },
    ],
  },
  {
    id: 'marketing',
    label: '集客・イベント',
    icon: Megaphone,
    color: 'cyan',
    tools: [
      { label: '予約メーカー', description: '予約ページを作成', icon: Calendar, introHref: '/booking', createHref: '/booking/new' },
      { label: '出欠メーカー', description: '出欠管理ページを作成', icon: Users, introHref: '/attendance', createHref: '/attendance/editor' },
      { label: 'アンケートメーカー', description: 'アンケートを作成', icon: ClipboardList, introHref: '/survey', createHref: '/survey/editor' },
      { label: 'メルマガメーカー', description: 'メルマガ配信', icon: Mail, introHref: '/newsletter', createHref: '/newsletter/campaigns/new' },
      { label: 'ステップメールメーカー', description: 'ステップメール自動配信', icon: ListOrdered, introHref: '/step-email', createHref: '/step-email/sequences/new' },
      { label: 'ファネルメーカー', description: 'ファネル構築', icon: GitBranch, introHref: '/funnel', createHref: '/funnel/new' },
      { label: 'コンシェルジュメーカー', description: 'AIコンシェルジュ作成', icon: MessageSquare, introHref: '/concierge', createHref: '/concierge/editor' },
      { label: 'LINE公式連携', description: 'LINE公式アカウント連携', icon: MessageCircle, introHref: '/line', createHref: '/line' },
      { label: 'YouTube競合分析', description: 'YouTube動画の統計分析', icon: BarChart3, introHref: '/youtube-analysis', createHref: '/youtube-analysis/editor' },
      { label: 'YouTubeキーワードリサーチ', description: 'YouTube検索キーワード分析', icon: Search, introHref: '/youtube-keyword-research', createHref: '/youtube-keyword-research/editor' },
      { label: 'Googleキーワードリサーチ', description: 'Google検索キーワード分析', icon: Search, introHref: '/google-keyword-research', createHref: '/google-keyword-research/editor' },
      { label: '楽天市場リサーチ', description: '楽天商品キーワード分析', icon: ShoppingBag, introHref: '/rakuten-research', createHref: '/rakuten-research/editor' },
      { label: 'ニコニコリサーチ', description: 'ニコニコ動画キーワード分析', icon: Tv, introHref: '/niconico-keyword-research', createHref: '/niconico-keyword-research/editor' },
      { label: 'Redditリサーチ', description: 'Reddit投稿キーワード分析', icon: Globe, introHref: '/reddit-keyword-research', createHref: '/reddit-keyword-research/editor' },
    ],
  },
  {
    id: 'monetization',
    label: '収益化・販売',
    icon: DollarSign,
    color: 'purple',
    tools: [
      { label: 'ゲーミフィケーション', description: 'ゲーム型集客を作成', icon: Gamepad2, introHref: '/gamification', createHref: '/gamification/new' },
      { label: 'スキルマーケット', description: 'スキル出品・販売', icon: Store, introHref: '/marketplace', createHref: '/marketplace/seller' },
      { label: 'アフィリエイト', description: '紹介プログラム', icon: Share2, introHref: '/affiliate', createHref: '/affiliate' },
    ],
  },
];

type IndustryPage = { label: string; href: string };

const INDUSTRY_PAGES: IndustryPage[] = [
  { label: 'コーチ・コンサル', href: '/for/coach' },
  { label: 'コンサルタント', href: '/for/consultant' },
  { label: 'クリエイター', href: '/for/creator' },
  { label: 'フリーランス', href: '/for/freelance' },
  { label: 'サロン・美容室', href: '/for/salon' },
  { label: '飲食店', href: '/for/restaurant' },
  { label: 'EC・ネットショップ', href: '/for/ec' },
  { label: 'スクール・教室', href: '/for/school' },
  { label: '教育ビジネス', href: '/for/school-biz' },
  { label: '代理店', href: '/for/agency' },
  { label: 'ビジネス全般', href: '/for/business' },
  { label: 'クリニック', href: '/for/clinic' },
  { label: 'フランチャイズ', href: '/for/franchise' },
  { label: '不動産', href: '/for/realestate' },
  { label: '店舗ビジネス', href: '/for/shop' },
  { label: '士業・開業', href: '/for/shigyou' },
  { label: 'Kindle出版', href: '/for/kindle' },
  { label: 'ホームページ活用', href: '/for/hp-activate' },
  { label: 'スタートアップ', href: '/for/startup' },
  { label: 'はじめての方', href: '/for/starter' },
];

const GUIDE_PAGES: SitemapLink[] = [
  { label: 'マーケティングガイド', href: '/guide/marketing' },
  { label: '収益化ガイド', href: '/guide/monetization' },
  { label: 'ページ作成ガイド', href: '/guide/page-creation' },
  { label: '診断クイズガイド', href: '/guide/quiz-diagnosis' },
  { label: 'ライティングガイド', href: '/guide/writing' },
  { label: 'Stripe Connect ガイド', href: '/guide/stripe-connect' },
];

// ---- カラーマップ ----
const COLOR_MAP: Record<string, { heading: string; link: string; bg: string; border: string }> = {
  indigo: { heading: 'text-indigo-700', link: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  emerald: { heading: 'text-emerald-700', link: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  amber: { heading: 'text-amber-700', link: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  cyan: { heading: 'text-cyan-700', link: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  purple: { heading: 'text-purple-700', link: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
};

// ---- コンポーネント ----

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-300 shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

export default async function HtmlSitemapPage() {
  // 公開コンテンツを取得
  let quizzes: { slug: string; title: string }[] = [];
  let surveys: { slug: string; title: string }[] = [];
  let profiles: { slug: string; nickname: string | null }[] = [];
  let businessLPs: { slug: string; settings: { title?: string } | null }[] = [];

  if (supabase) {
    try {
      const [quizzesData, surveysData, profilesData, businessData] = await Promise.all([
        supabase.from('quizzes').select('slug, title').eq('show_in_portal', true).not('slug', 'is', null).order('created_at', { ascending: false }).limit(30),
        supabase.from('surveys').select('slug, title').not('slug', 'is', null).order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('slug, nickname').eq('show_in_portal', true).not('slug', 'is', null).order('created_at', { ascending: false }).limit(20),
        supabase.from('business_projects').select('slug, settings').eq('show_in_portal', true).not('slug', 'is', null).order('created_at', { ascending: false }).limit(20),
      ]);

      quizzes = (quizzesData.data || []) as typeof quizzes;
      surveys = (surveysData.data || []) as typeof surveys;
      profiles = (profilesData.data || []) as typeof profiles;
      businessLPs = (businessData.data || []) as typeof businessLPs;
    } catch (error) {
      console.error('Failed to fetch sitemap data:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Map size={32} className="text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
              サイトマップ
            </h1>
          </div>
          <p className="text-gray-600">
            集客メーカーの全ページへのリンク一覧です。お探しのページをカテゴリから見つけられます。
          </p>
          {/* ページ内ナビ */}
          <nav className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { label: '主要ページ', id: 'main' },
              { label: 'ツール紹介', id: 'tools-intro' },
              { label: 'ツール新規作成', id: 'tools-create' },
              { label: '業種別ページ', id: 'industry' },
              { label: 'ガイド', id: 'guides' },
              { label: '公開コンテンツ', id: 'public-content' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* ===== 主要ページ ===== */}
        <section id="main">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home size={24} className="text-blue-600" />
            主要ページ
          </h2>
          <SectionCard>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MAIN_PAGES.map((page) => {
                const Icon = page.icon;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {Icon && <Icon size={16} className="shrink-0" />}
                      {page.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </section>

        {/* ===== ツール紹介ページ ===== */}
        <section id="tools-intro">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={24} className="text-blue-600" />
            ツール紹介ページ
          </h2>
          <p className="text-sm text-gray-500 mb-4">各ツールの機能や特徴を確認できるページです。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TOOL_CATEGORIES.map((cat) => {
              const colors = COLOR_MAP[cat.color];
              const CatIcon = cat.icon;
              return (
                <SectionCard key={cat.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`p-1.5 rounded-lg ${colors.bg}`}>
                      <CatIcon size={20} className={colors.heading} />
                    </span>
                    <h3 className={`text-lg font-bold ${colors.heading}`}>{cat.label}</h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <li key={tool.introHref}>
                          <Link
                            href={tool.introHref}
                            className={`flex items-center gap-2 ${colors.link} hover:underline transition-colors`}
                          >
                            <ToolIcon size={16} className="shrink-0" />
                            <span>{tool.label}</span>
                            <span className="text-xs text-gray-400 ml-auto hidden sm:inline">{tool.description}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </SectionCard>
              );
            })}
          </div>
        </section>

        {/* ===== ツール新規作成ページ ===== */}
        <section id="tools-create">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight size={24} className="text-blue-600" />
            ツール新規作成ページ
          </h2>
          <p className="text-sm text-gray-500 mb-4">各ツールの新規作成・エディタページへのリンクです（ログインが必要です）。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TOOL_CATEGORIES.map((cat) => {
              const colors = COLOR_MAP[cat.color];
              const CatIcon = cat.icon;
              return (
                <SectionCard key={cat.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`p-1.5 rounded-lg ${colors.bg}`}>
                      <CatIcon size={20} className={colors.heading} />
                    </span>
                    <h3 className={`text-lg font-bold ${colors.heading}`}>{cat.label}</h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <li key={tool.createHref}>
                          <Link
                            href={tool.createHref}
                            className={`flex items-center gap-2 ${colors.link} hover:underline transition-colors`}
                          >
                            <ToolIcon size={16} className="shrink-0" />
                            <span>{tool.label}を作成</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </SectionCard>
              );
            })}
          </div>
        </section>

        {/* ===== 業種別ページ ===== */}
        <section id="industry">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={24} className="text-blue-600" />
            業種別ページ
          </h2>
          <SectionCard>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INDUSTRY_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>

        {/* ===== ガイド ===== */}
        <section id="guides">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookMarked size={24} className="text-blue-600" />
            ガイド
          </h2>
          <SectionCard>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GUIDE_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>

        {/* ===== 公開コンテンツ ===== */}
        <section id="public-content">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={24} className="text-blue-600" />
            公開コンテンツ
          </h2>
          <p className="text-sm text-gray-500 mb-4">ユーザーが作成・公開しているコンテンツです。</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 診断クイズ */}
            {quizzes.length > 0 && (
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-purple-600" />
                  <h3 className="text-lg font-bold text-purple-700">診断クイズ</h3>
                </div>
                <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                  {quizzes.map((quiz) => (
                    <li key={quiz.slug}>
                      <Link
                        href={`/quiz/${quiz.slug}`}
                        className="text-purple-600 hover:underline flex items-center gap-2 text-sm"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {quiz.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/portal?tab=quiz"
                  className="text-purple-600 hover:underline text-sm font-bold mt-3 inline-flex items-center gap-1"
                >
                  すべての診断クイズを見る <ArrowRight size={14} />
                </Link>
              </SectionCard>
            )}

            {/* アンケート */}
            {surveys.length > 0 && (
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList size={20} className="text-teal-600" />
                  <h3 className="text-lg font-bold text-teal-700">アンケート</h3>
                </div>
                <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                  {surveys.map((survey) => (
                    <li key={survey.slug}>
                      <Link
                        href={`/survey/${survey.slug}`}
                        className="text-teal-600 hover:underline flex items-center gap-2 text-sm"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {survey.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* プロフィールLP */}
            {profiles.length > 0 && (
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-emerald-700">プロフィールLP</h3>
                </div>
                <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                  {profiles.map((profile) => (
                    <li key={profile.slug}>
                      <Link
                        href={`/profile/${profile.slug}`}
                        className="text-emerald-600 hover:underline flex items-center gap-2 text-sm"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {profile.nickname || 'プロフィール'}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/portal?tab=profile"
                  className="text-emerald-600 hover:underline text-sm font-bold mt-3 inline-flex items-center gap-1"
                >
                  すべてのプロフィールを見る <ArrowRight size={14} />
                </Link>
              </SectionCard>
            )}

            {/* ビジネスLP */}
            {businessLPs.length > 0 && (
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={20} className="text-amber-600" />
                  <h3 className="text-lg font-bold text-amber-700">ビジネスLP</h3>
                </div>
                <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                  {businessLPs.map((lp) => (
                    <li key={lp.slug}>
                      <Link
                        href={`/business/${lp.slug}`}
                        className="text-amber-600 hover:underline flex items-center gap-2 text-sm"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {lp.settings?.title || 'ビジネスLP'}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/portal?tab=business"
                  className="text-amber-600 hover:underline text-sm font-bold mt-3 inline-flex items-center gap-1"
                >
                  すべてのビジネスLPを見る <ArrowRight size={14} />
                </Link>
              </SectionCard>
            )}
          </div>
        </section>

        {/* フッター */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors"
          >
            <Home size={20} />
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
