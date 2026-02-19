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
  LucideIcon,
} from 'lucide-react';

export type ToolItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  color: { bg: string; text: string; border: string };
};

export const TOOL_ITEMS: ToolItem[] = [
  {
    id: 'quiz',
    label: '診断クイズメーカー',
    icon: Sparkles,
    description: '診断クイズ作成',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  },
  {
    id: 'profile',
    label: 'プロフィールメーカー',
    icon: UserCircle,
    description: 'プロフィールLP',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  },
  {
    id: 'business',
    label: 'LPメーカー',
    icon: Building2,
    description: 'ビジネスLP作成',
    color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  },
  {
    id: 'salesletter',
    label: 'セールスライター',
    icon: FileText,
    description: 'セールスレター',
    color: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  },
  {
    id: 'booking',
    label: '予約メーカー',
    icon: Calendar,
    description: '予約ページ作成',
    color: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  },
  {
    id: 'attendance',
    label: '出欠メーカー',
    icon: Users,
    description: '出欠管理',
    color: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  },
  {
    id: 'survey',
    label: 'アンケートメーカー',
    icon: ClipboardList,
    description: 'アンケート作成',
    color: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
  },
  {
    id: 'my-games',
    label: 'ゲーミフィケーション',
    icon: Gamepad2,
    description: 'ゲーム作成',
    color: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  },
  {
    id: 'thumbnail',
    label: 'サムネイルメーカー',
    icon: Image,
    description: 'AIサムネイル作成',
    color: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  },
  {
    id: 'kindle',
    label: 'Kindle執筆 (KDL)',
    icon: BookOpen,
    description: 'AI書籍執筆',
    color: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  },
  {
    id: 'kindle-discovery',
    label: 'ネタ発掘診断',
    icon: Lightbulb,
    description: '執筆ネタ発掘',
    color: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  },
  {
    id: 'affiliate',
    label: 'アフィリエイト',
    icon: Share2,
    description: '紹介プログラム',
    color: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  },
  {
    id: 'marketplace-seller',
    label: 'スキルマーケット',
    icon: Store,
    description: 'スキル出品管理',
    color: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  },
];
