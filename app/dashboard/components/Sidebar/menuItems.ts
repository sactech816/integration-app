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
  LucideIcon,
} from 'lucide-react';

export type ToolCategory = 'content' | 'marketing' | 'publishing' | 'monetization';

export type ToolCategoryDef = {
  id: ToolCategory;
  label: string;
  icon: LucideIcon;
};

export const TOOL_CATEGORIES: ToolCategoryDef[] = [
  { id: 'content', label: 'コンテンツ作成', icon: PenTool },
  { id: 'marketing', label: '集客・運営', icon: Megaphone },
  { id: 'publishing', label: '執筆・出版', icon: BookOpen },
  { id: 'monetization', label: '収益化', icon: DollarSign },
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
  // コンテンツ作成
  {
    id: 'quiz',
    label: '診断クイズメーカー',
    icon: Sparkles,
    description: '診断クイズ作成',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    href: '/quiz/editor',
    category: 'content',
  },
  {
    id: 'entertainment',
    label: 'エンタメ診断メーカー',
    icon: PartyPopper,
    description: 'エンタメ診断作成',
    color: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    href: '/entertainment/create',
    category: 'content',
  },
  {
    id: 'profile',
    label: 'プロフィールメーカー',
    icon: UserCircle,
    description: 'プロフィールLP',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    href: '/profile/editor',
    category: 'content',
  },
  {
    id: 'business',
    label: 'LPメーカー',
    icon: Building2,
    description: 'ビジネスLP作成',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    href: '/business/editor',
    category: 'content',
  },
  {
    id: 'salesletter',
    label: 'セールスライター',
    icon: FileText,
    description: 'セールスレター',
    color: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    href: '/salesletter/editor',
    category: 'content',
  },
  {
    id: 'onboarding',
    label: 'はじめかたメーカー',
    icon: MousePointerClick,
    description: 'はじめかたガイド',
    color: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
    href: '/onboarding/editor',
    category: 'content',
  },
  {
    id: 'thumbnail',
    label: 'サムネイルメーカー',
    icon: Image,
    description: 'AIサムネイル作成',
    color: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    href: '/thumbnail/editor',
    category: 'content',
  },

  // 集客・運営
  {
    id: 'booking',
    label: '予約メーカー',
    icon: Calendar,
    description: '予約ページ作成',
    color: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    href: '/booking/editor',
    category: 'marketing',
  },
  {
    id: 'attendance',
    label: '出欠メーカー',
    icon: Users,
    description: '出欠管理',
    color: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
    href: '/attendance/editor',
    category: 'marketing',
  },
  {
    id: 'survey',
    label: 'アンケートメーカー',
    icon: ClipboardList,
    description: 'アンケート作成',
    color: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
    href: '/survey/editor',
    category: 'marketing',
  },
  {
    id: 'newsletter',
    label: 'メルマガメーカー',
    icon: Mail,
    description: 'メルマガ配信',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    href: '/newsletter/dashboard',
    category: 'marketing',
  },

  // 執筆・出版
  {
    id: 'kindle',
    label: 'Kindle執筆 (KDL)',
    icon: BookOpen,
    description: 'AI書籍執筆',
    color: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    href: '/kindle',
    category: 'publishing',
  },
  {
    id: 'kindle-discovery',
    label: 'ネタ発掘診断',
    icon: Lightbulb,
    description: '執筆ネタ発掘',
    color: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    href: '/kindle/discovery',
    category: 'publishing',
  },

  // 収益化
  {
    id: 'order-form',
    label: '申し込みフォーム',
    icon: ClipboardCheck,
    description: '申し込み・決済フォーム',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    href: '/order-form/dashboard',
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
    id: 'affiliate',
    label: 'アフィリエイト',
    icon: Share2,
    description: '紹介プログラム',
    color: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    href: '/affiliate',
    category: 'monetization',
  },
  {
    id: 'marketplace-seller',
    label: 'スキルマーケット',
    icon: Store,
    description: 'スキル出品管理',
    color: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
    href: '/marketplace/seller',
    category: 'monetization',
  },
];
