import {
  Sparkles,
  UserCircle,
  Building2,
  Calendar,
  ClipboardList,
  Gamepad2,
  BookOpen,
  Share2,
  FileText,
  Lightbulb,
  Store,
  Users,
  Image,
  MousePointerClick,
  PartyPopper,
  Mail,
  PenTool,
  Megaphone,
  DollarSign,
  ClipboardCheck,
  GitBranch,
  Video,
  Send,
  Layout,
  HelpCircle,
  ListOrdered,
  LucideIcon,
} from 'lucide-react';

export type ToolCategory = 'page' | 'quiz' | 'writing' | 'marketing' | 'monetization';

export type ToolCategoryDef = {
  id: ToolCategory;
  label: string;
  icon: LucideIcon;
};

export const TOOL_CATEGORIES: ToolCategoryDef[] = [
  { id: 'page', label: 'LP・ページ作成', icon: Layout },
  { id: 'quiz', label: '診断・クイズ', icon: HelpCircle },
  { id: 'writing', label: 'ライティング・制作', icon: PenTool },
  { id: 'marketing', label: '集客・イベント', icon: Megaphone },
  { id: 'monetization', label: '収益化・販売', icon: DollarSign },
];

export type ToolItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  color: { bg: string; text: string; border: string };
  href?: string;
  category: ToolCategory;
};

export const TOOL_ITEMS: ToolItem[] = [
  // LP・ページ作成
  {
    id: 'profile',
    label: 'プロフィールメーカー',
    icon: UserCircle,
    description: 'プロフィールLP',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    href: '/profile/editor',
    category: 'page',
  },
  {
    id: 'business',
    label: 'LPメーカー',
    icon: Building2,
    description: 'ビジネスLP作成',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    href: '/business/editor',
    category: 'page',
  },
  {
    id: 'webinar',
    label: 'ウェビナーLPメーカー',
    icon: Video,
    description: 'ウェビナーLP作成',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    href: '/webinar/editor',
    category: 'page',
  },
  {
    id: 'onboarding',
    label: 'はじめかたメーカー',
    icon: MousePointerClick,
    description: 'はじめかたガイド',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    href: '/onboarding/editor',
    category: 'page',
  },

  // 診断・クイズ
  {
    id: 'quiz',
    label: '診断クイズメーカー',
    icon: Sparkles,
    description: '診断クイズ作成',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    href: '/quiz/editor',
    category: 'quiz',
  },
  {
    id: 'entertainment',
    label: 'エンタメ診断メーカー',
    icon: PartyPopper,
    description: 'エンタメ診断作成',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    href: '/entertainment/create',
    category: 'quiz',
  },

  // ライティング・制作
  {
    id: 'salesletter',
    label: 'セールスライター',
    icon: FileText,
    description: 'セールスレター',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    href: '/salesletter/editor',
    category: 'writing',
  },
  {
    id: 'thumbnail',
    label: 'サムネイルメーカー',
    icon: Image,
    description: 'AIサムネイル作成',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    href: '/thumbnail/editor',
    category: 'writing',
  },
  {
    id: 'sns-post',
    label: 'SNS投稿メーカー',
    icon: Send,
    description: 'SNS投稿作成',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    href: '/sns-post/editor',
    category: 'writing',
  },
  {
    id: 'kindle',
    label: 'Kindle体験版',
    icon: BookOpen,
    description: 'AI書籍執筆',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    href: '/kindle/demo',
    category: 'writing',
  },
  {
    id: 'kindle-discovery',
    label: 'ネタ発掘診断',
    icon: Lightbulb,
    description: '執筆ネタ発掘',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    href: '/kindle/discovery/demo',
    category: 'writing',
  },

  // 集客・イベント
  {
    id: 'booking',
    label: '予約メーカー',
    icon: Calendar,
    description: '予約ページ作成',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/booking/new',
    category: 'marketing',
  },
  {
    id: 'attendance',
    label: '出欠メーカー',
    icon: Users,
    description: '出欠管理',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/attendance/editor',
    category: 'marketing',
  },
  {
    id: 'survey',
    label: 'アンケートメーカー',
    icon: ClipboardList,
    description: 'アンケート作成',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/survey/editor',
    category: 'marketing',
  },
  {
    id: 'newsletter',
    label: 'メルマガメーカー',
    icon: Mail,
    description: 'メルマガ配信',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/newsletter/campaigns/new',
    category: 'marketing',
  },
  {
    id: 'step-email',
    label: 'ステップメールメーカー',
    icon: ListOrdered,
    description: 'ステップメール自動配信',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/step-email/sequences/new',
    category: 'marketing',
  },
  {
    id: 'funnel',
    label: 'ファネルメーカー',
    icon: GitBranch,
    description: 'ファネル構築',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/funnel/new',
    category: 'marketing',
  },

  // 収益化・販売
  {
    id: 'order-form',
    label: '申し込みフォーム',
    icon: ClipboardCheck,
    description: '申し込み・決済フォーム',
    color: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    href: '/order-form/new',
    category: 'monetization',
  },
  {
    id: 'my-games',
    label: 'ゲーミフィケーション',
    icon: Gamepad2,
    description: 'ゲーム作成',
    color: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    href: '/gamification',
    category: 'monetization',
  },
  {
    id: 'marketplace-seller',
    label: 'スキルマーケット',
    icon: Store,
    description: 'スキル出品管理',
    color: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    href: '/marketplace/seller',
    category: 'monetization',
  },
  {
    id: 'affiliate',
    label: 'アフィリエイト',
    icon: Share2,
    description: '紹介プログラム',
    color: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    href: '/affiliate',
    category: 'monetization',
  },
];
