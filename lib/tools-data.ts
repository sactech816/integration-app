import {
  Sparkles,
  UserCircle,
  Building2,
  Video,
  Globe,
  PartyPopper,
  Gift,
  Gamepad2,
  Star,
  Ticket,
  Stamp,
  Mail,
  PenTool,
  FileText,
  Calendar,
  GitBranch,
  ClipboardCheck,
  ClipboardList,
  BookOpen,
  Search,
  Tv,
  Image,
  Send,
  type LucideIcon,
} from 'lucide-react';

// ===== ファネルステージ型定義 =====
export type FunnelStageItem = {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  name: string;
  desc: string;
  href: string;
};

export type FunnelStage = {
  id: string;
  emoji: string;
  subtitle: string;
  description: string;
  gradient: string;
  tools: FunnelStageItem[];
};

// ===== 人気ツール型定義 =====
export type PopularTool = {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
  iconBg: string;
};

// ===== ファネル別ツール定義（ToolGuideModalから統合） =====
export const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: 'awareness',
    emoji: '👋',
    subtitle: '知ってもらう',
    description: 'まずは「あなたは何者？」を伝えるページを作りましょう',
    gradient: 'from-blue-500 to-indigo-600',
    tools: [
      { icon: UserCircle, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', name: 'プロフィールメーカー', desc: 'SNSリンクまとめ＆自己紹介ページ。lit.link代替に', href: '/profile' },
      { icon: Building2, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', name: 'LPメーカー', desc: '商品・サービスのランディングページを簡単作成', href: '/business' },
      { icon: Video, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: 'ウェビナーLPメーカー', desc: 'セミナー・イベントの告知ページを作成', href: '/webinar' },
      { icon: Globe, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', name: 'HPメーカー', desc: 'ビジネス用のホームページを手軽に作成', href: '/site' },
    ],
  },
  {
    id: 'collect',
    emoji: '🧲',
    subtitle: '集める',
    description: '興味を引くコンテンツで、見込み客を集めましょう',
    gradient: 'from-emerald-500 to-teal-600',
    tools: [
      { icon: Sparkles, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100', name: '診断クイズメーカー', desc: '性格診断・適職診断・検定クイズをAIで自動生成', href: '/quiz' },
      { icon: PartyPopper, iconColor: 'text-pink-600', iconBg: 'bg-pink-100', name: 'エンタメ診断メーカー', desc: 'バズる診断コンテンツでSNS拡散', href: '/entertainment' },
      { icon: Gift, iconColor: 'text-rose-600', iconBg: 'bg-rose-100', name: '福引きメーカー', desc: 'オンライン福引きでキャンペーン集客', href: '/gamification' },
      { icon: Gamepad2, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: 'ガチャメーカー', desc: 'ガチャ演出で楽しくエンゲージメント向上', href: '/gamification' },
      { icon: Star, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100', name: 'スロット・スクラッチ', desc: 'スロットやスクラッチカードで来店促進', href: '/gamification' },
      { icon: Stamp, iconColor: 'text-green-600', iconBg: 'bg-green-100', name: 'スタンプラリー', desc: 'デジタルスタンプラリーでリピーター獲得', href: '/gamification' },
    ],
  },
  {
    id: 'nurture',
    emoji: '💌',
    subtitle: '育てる',
    description: '見込み客との関係を深め、信頼を築きましょう',
    gradient: 'from-amber-500 to-orange-600',
    tools: [
      { icon: Mail, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-100', name: 'メルマガメーカー', desc: 'メールマガジンで定期的に情報発信', href: '/newsletter' },
      { icon: Mail, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', name: 'ステップメール', desc: '自動配信メールで見込み客を育成', href: '/step-email' },
      { icon: PenTool, iconColor: 'text-amber-600', iconBg: 'bg-amber-100', name: 'セールスライター', desc: 'AIが売れる文章を自動生成', href: '/salesletter' },
      { icon: FileText, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', name: 'SNS投稿メーカー', desc: 'SNS投稿文・キャプションをAIで作成', href: '/sns-post' },
    ],
  },
  {
    id: 'sell',
    emoji: '💰',
    subtitle: '売る・つなげる',
    description: '予約・申込み・決済をスムーズに。チャンスを逃さない仕組みを',
    gradient: 'from-rose-500 to-pink-600',
    tools: [
      { icon: Calendar, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-100', name: '予約メーカー', desc: '日程調整不要の予約受付システム', href: '/booking' },
      { icon: ClipboardCheck, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: '申し込みフォーム', desc: '決済付きの申し込みフォームを作成', href: '/order-form' },
      { icon: GitBranch, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', name: 'ファネルメーカー', desc: '集客→教育→販売の自動化フロー構築', href: '/funnel' },
      { icon: ClipboardList, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', name: '出欠メーカー', desc: 'イベント参加の出欠管理を簡単に', href: '/attendance' },
      { icon: FileText, iconColor: 'text-green-600', iconBg: 'bg-green-100', name: 'アンケートメーカー', desc: '顧客の声を集めてサービス改善', href: '/survey' },
    ],
  },
  {
    id: 'research',
    emoji: '🔍',
    subtitle: '調べる',
    description: '市場のニーズを調べて、売れる商品・コンテンツを見つけましょう',
    gradient: 'from-violet-500 to-purple-600',
    tools: [
      { icon: BookOpen, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', name: 'Kindleリサーチ', desc: 'Kindle市場の売れ筋・キーワードを分析', href: '/kindle' },
      { icon: Search, iconColor: 'text-red-600', iconBg: 'bg-red-100', name: 'YouTubeリサーチ', desc: 'YouTube市場の人気動画・キーワードを分析', href: '/youtube-research' },
      { icon: Globe, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', name: 'Googleリサーチ', desc: '検索トレンド・ニーズをリサーチ', href: '/google-research' },
      { icon: Tv, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', name: 'ニコニコリサーチ', desc: 'ニコニコ動画の人気コンテンツを調査', href: '/niconico-research' },
    ],
  },
];

// ===== 人気ツール（静的キュレーション） =====
export const POPULAR_TOOLS: PopularTool[] = [
  {
    name: '診断クイズメーカー',
    description: 'AIで性格診断・適職診断・検定クイズを自動生成。SNSでバズる診断を無料で作成',
    icon: Sparkles,
    href: '/quiz',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    name: 'プロフィールメーカー',
    description: 'SNSリンクまとめ＆自己紹介ページ。lit.link代替として無料で使える',
    icon: UserCircle,
    href: '/profile',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
  {
    name: 'LPメーカー',
    description: '商品・サービスのランディングページをテンプレートから簡単作成',
    icon: Building2,
    href: '/business',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    name: '予約メーカー',
    description: 'カレンダー連動の予約受付システム。Excel出力・通知機能付き',
    icon: Calendar,
    href: '/booking',
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
  },
  {
    name: 'サムネイルメーカー',
    description: 'YouTube・ブログ・Kindle用のサムネイル画像をAIで自動生成',
    icon: Image,
    href: '/thumbnail',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    name: 'メルマガメーカー',
    description: 'メールマガジンの作成・配信・読者管理を一元化',
    icon: Mail,
    href: '/newsletter',
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
  },
  {
    name: 'セールスライター',
    description: '売れるセールスレター・LP文章をAIが自動生成',
    icon: PenTool,
    href: '/salesletter',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    name: 'エンタメ診断メーカー',
    description: 'バズるエンタメ系診断コンテンツをAIで作成。SNS拡散に最適',
    icon: PartyPopper,
    href: '/entertainment/create',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
  },
];

// ===== 業種別おすすめツール組み合わせ =====
export type UseCaseSet = {
  persona: string;
  description: string;
  tools: string[];
  color: string;
  bgColor: string;
  href: string;
};

export const USE_CASE_SETS: UseCaseSet[] = [
  {
    persona: 'コーチ・コンサル',
    description: '専門性を見せて、相談予約につなげる',
    tools: ['プロフィールLP', '診断クイズ', 'メルマガ', '予約フォーム'],
    color: '#4f46e5',
    bgColor: '#e0e7ff',
    href: '/for/consultant',
  },
  {
    persona: 'サロン・美容',
    description: '来店きっかけを作り、リピーターを増やす',
    tools: ['予約フォーム', '診断クイズ', 'SNS投稿', 'スタンプラリー'],
    color: '#db2777',
    bgColor: '#fce7f3',
    href: '/for/salon',
  },
  {
    persona: 'EC・物販',
    description: '商品の魅力を伝えて、購入につなげる',
    tools: ['セールスライター', 'ビジネスLP', 'サムネイル', 'メルマガ'],
    color: '#c026d3',
    bgColor: '#fae8ff',
    href: '/for/ec',
  },
  {
    persona: 'セミナー講師',
    description: 'セミナー集客から受講後フォローまで自動化',
    tools: ['ウェビナーLP', '申し込みフォーム', 'ステップメール', 'アンケート'],
    color: '#0891b2',
    bgColor: '#cffafe',
    href: '/for/school-biz',
  },
];
