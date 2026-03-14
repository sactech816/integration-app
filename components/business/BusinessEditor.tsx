'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { BusinessLP, Block, generateBlockId } from '@/lib/types';
import { templates } from '@/constants/templates/business';
import CustomColorPicker from '@/components/shared/CustomColorPicker';
import {
  Save,
  Eye,
  Edit3,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Zap,
  MessageCircle,
  HelpCircle,
  DollarSign,
  Layout,
  Users,
  Columns,
  MapPin,
  Wand2,
  Sparkles,
  Link as LinkIcon,
  Youtube,
  Book,
  Mail,
  Star,
  Palette,
  ExternalLink,
  Copy,
  Trophy,
  Settings,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  UploadCloud,
  Shuffle,
  Target,
  List,
  Gift,
  CheckSquare,
  AlertTriangle,
  Monitor,
  Smartphone,
  Brain,
  Timer,
  Images,
  CheckCircle,
  Lock,
  Link2,
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import { usePoints } from '@/lib/hooks/usePoints';
import { useUserContents } from '@/lib/hooks/useUserContents';
import ContentLinker from '@/components/shared/ContentLinker';
import LinkedContentCard from '@/components/shared/LinkedContentCard';
import type { ContentRef } from '@/lib/content-links';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { trackGenerateComplete, trackGenerateError } from '@/lib/gtag';

interface BusinessEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  initialData?: BusinessLP | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

// ブロックタイプの定義 - プロフィールLP + ビジネスLP固有ブロック
const blockTypes = [
  // 基本ブロック
  { type: 'header', label: 'ヘッダー', icon: Users, description: 'プロフィール画像・名前・肩書き', category: 'basic', color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', hover: 'hover:bg-blue-100' } },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'タイトル付きテキストカード', category: 'basic', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション', category: 'basic', color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'links', label: 'リンク集', icon: LinkIcon, description: 'SNSなどのリンクボタン', category: 'basic', color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', hover: 'hover:bg-green-100' } },
  { type: 'youtube', label: 'YouTube', icon: Youtube, description: '動画埋め込み', category: 'basic', color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  // ビジネスLP専用ブロック
  { type: 'hero', label: 'ヒーロー', icon: Zap, description: 'ファーストビュー・メインビジュアル', category: 'business', color: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', hover: 'hover:bg-rose-100' } },
  { type: 'hero_fullwidth', label: 'フルワイドヒーロー', icon: Layout, description: 'インパクトのあるファーストビュー', category: 'business', color: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', hover: 'hover:bg-rose-100' } },
  { type: 'features', label: '特徴・ベネフィット', icon: Star, description: 'サービスの特徴を3列表示', category: 'business', color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' } },
  { type: 'problem_cards', label: '問題提起', icon: AlertTriangle, description: '顧客の悩みを可視化', category: 'business', color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' } },
  { type: 'two_column', label: '2カラム', icon: Columns, description: '画像とテキストの組み合わせ', category: 'business', color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' } },
  { type: 'cta_section', label: 'CTAセクション', icon: Target, description: 'コンバージョンポイント', category: 'business', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'dark_section', label: 'ダークセクション', icon: Layout, description: 'コントラストのあるセクション', category: 'business', color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' } },
  { type: 'case_study_cards', label: '事例紹介', icon: CheckSquare, description: '導入事例・実績紹介', category: 'business', color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' } },
  { type: 'bonus_section', label: '特典セクション', icon: Gift, description: '購入特典・無料プレゼント', category: 'business', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'checklist_section', label: 'チェックリスト', icon: List, description: '含まれるもの・条件一覧', category: 'business', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  // 共通ブロック
  { type: 'testimonial', label: 'お客様の声', icon: MessageCircle, description: '推薦文・レビュー', category: 'common', color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100' } },
  { type: 'pricing', label: '料金表', icon: DollarSign, description: 'プラン・価格表示', category: 'common', color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問', category: 'common', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'lead_form', label: 'リードフォーム', icon: Mail, description: 'メールアドレス収集', category: 'common', color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'line_card', label: 'LINE', icon: MessageCircle, description: 'LINE公式アカウント誘導', category: 'common', color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', hover: 'hover:bg-green-100' } },
  { type: 'kindle', label: 'Kindle', icon: Book, description: '書籍紹介カード', category: 'common', color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100' } },
  { type: 'google_map', label: 'Googleマップ', icon: MapPin, description: '地図埋め込み', category: 'common', color: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', hover: 'hover:bg-teal-100' } },
  { type: 'quiz', label: '診断クイズ', icon: Brain, description: '診断クイズ埋め込み', category: 'common', color: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', hover: 'hover:bg-teal-100' } },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: 'カウントダウンタイマー', category: 'common', color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'gallery', label: 'ギャラリー', icon: Images, description: '複数画像スライドショー', category: 'common', color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'linked_content', label: '関連コンテンツ', icon: Link2, description: '他のツールへのリンク', category: 'common', color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', hover: 'hover:bg-blue-100' } },
];

// グラデーションプリセット
const gradientPresets = [
  { name: 'ネイビー', value: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)', animated: true },
  { name: 'パープル', value: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)', animated: true },
  { name: 'オレンジ', value: 'linear-gradient(-45deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24)', animated: true },
  { name: 'グリーン', value: 'linear-gradient(-45deg, #10b981, #059669, #047857, #059669)', animated: true },
  { name: 'サンセット', value: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animated: true },
  { name: 'ティール', value: 'linear-gradient(-45deg, #14b8a6, #0d9488, #0f766e, #0d9488)', animated: true },
  { name: 'ピンク', value: 'linear-gradient(-45deg, #f472b6, #ec4899, #db2777, #ec4899)', animated: true },
  { name: 'ダーク', value: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)', animated: false },
];

// 画像アップロードサイズ制限（2MB）
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// リンクスタイルオプション
const linkStyleOptions = [
  { value: '', label: 'デフォルト（白）' },
  { value: 'orange', label: 'オレンジ' },
  { value: 'blue', label: 'ブルー' },
  { value: 'green', label: 'グリーン' },
  { value: 'purple', label: 'パープル' },
  { value: 'line', label: 'LINE緑' },
];

// ランダム画像URL生成（Unsplash）
const getRandomImageUrl = (category: string = 'business') => {
  const categories: Record<string, string[]> = {
    portrait: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    ],
    business: [
      'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80',
    ],
    general: [
      'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80',
    ],
    book: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
    ],
  };
  const urls = categories[category] || categories.general;
  return urls[Math.floor(Math.random() * urls.length)];
};

// お客様の声用プリセット画像
const testimonialPresetImages = [
  { label: '男性A', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性B', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性C', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性A', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性B', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性C', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
];

// アイコンプリセット（カテゴリ別）
const iconPresets = {
  features: {
    label: '特徴・メリット',
    icons: ['🏆', '🤝', '📊', '💡', '✨', '🎯', '🚀', '⭐', '💪', '🔥', '✓', '💎', '🌟', '📈', '🎁', '🛡️', '⚡', '🔑', '💼', '🌈']
  },
  problems: {
    label: 'お悩み・課題',
    icons: ['😰', '😓', '🤔', '😢', '💭', '❓', '😟', '😩', '⚠️', '💔', '😥', '😤', '🤷', '😔', '💦', '❌', '😵', '🆘', '😫', '🥺']
  },
  bonus: {
    label: '特典・プレゼント',
    icons: ['🎁', '📚', '🎉', '✨', '💝', '🏅', '🎊', '💰', '📖', '🎬', '📝', '🎮', '🎵', '📱', '💻', '🎨', '📦', '🌸', '👑', '🍀']
  },
  check: {
    label: 'チェック・確認',
    icons: ['✓', '✔️', '☑️', '👍', '👌', '💯', '⭕', '🔵', '🟢', '✅']
  },
  general: {
    label: 'その他',
    icons: ['📌', '💬', '🗓️', '📞', '✉️', '🔔', '⏰', '📍', '🏠', '💳', '🎓', '🏋️', '🍽️', '☕', '🧘', '💼', '🌍', '🎤', '📸', '🛒']
  }
};

// アイコンピッカーコンポーネント
const IconPicker = ({ 
  value, 
  onChange, 
  category = 'features' 
}: { 
  value: string; 
  onChange: (icon: string) => void; 
  category?: 'features' | 'problems' | 'bonus' | 'check' | 'general';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof iconPresets>(category);
  
  return (
    <div className="relative">
      <label className="text-sm font-bold text-gray-900 block mb-2">アイコン</label>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 text-xl border border-gray-300 rounded-lg bg-white hover:border-amber-500 flex items-center justify-center transition-colors flex-shrink-0"
        >
          {value || '?'}
        </button>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="絵文字"
          className="w-16 min-w-0 px-2 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm"
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-72">
          {/* カテゴリタブ */}
          <div className="flex flex-wrap gap-1 mb-3 border-b border-gray-100 pb-2">
            {Object.entries(iconPresets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key as keyof typeof iconPresets)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  activeCategory === key 
                    ? 'bg-amber-100 text-amber-700 font-bold' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* アイコングリッド */}
          <div className="grid grid-cols-8 gap-1">
            {iconPresets[activeCategory].icons.map((icon, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(icon);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 text-lg rounded hover:bg-amber-50 flex items-center justify-center transition-colors ${
                  value === icon ? 'bg-amber-100 ring-2 ring-amber-400' : ''
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 py-1"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

// セクションコンポーネント
const Section = ({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children,
  badge,
  step,
  stepLabel,
  headerBgColor = 'bg-gray-50',
  headerHoverColor = 'hover:bg-gray-100',
  accentColor = 'bg-amber-100 text-amber-600'
}: { 
  title: string, 
  icon: React.ComponentType<{ size?: number }>, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode,
  badge?: string,
  step?: number,
  stepLabel?: string,
  headerBgColor?: string,
  headerHoverColor?: string,
  accentColor?: string
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {/* ステップ見出し */}
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          STEP {step}
        </span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button 
      onClick={onToggle}
      className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? accentColor : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && (
      <div className="p-5 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// 入力コンポーネント
const Input = ({label, val, onChange, ph, disabled = false}: {label: string, val: string, onChange: (v: string) => void, ph?: string, disabled?: boolean}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input 
      className={`w-full border border-gray-300 p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-amber-500 outline-none bg-white placeholder-gray-400 transition-shadow ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      value={val || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={ph}
      disabled={disabled}
    />
  </div>
);

const Textarea = ({label, val, onChange, rows = 3}: {label: string, val: string, onChange: (v: string) => void, rows?: number}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea 
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
      rows={rows} 
      value={val || ''} 
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// 全幅表示対象ブロックの判定
const isFullWidthBlock = (block: Block): boolean => {
  // hero_fullwidth は常に全幅
  if (block.type === 'hero_fullwidth') return true;
  
  // isFullWidthプロパティを持つブロック
  if (block.type === 'hero' && block.data.isFullWidth) return true;
  if (block.type === 'features' && block.data.isFullWidth) return true;
  if (block.type === 'cta_section' && block.data.isFullWidth) return true;
  if (block.type === 'testimonial' && block.data.isFullWidth) return true;
  if (block.type === 'dark_section' && block.data.isFullWidth) return true;
  if (block.type === 'problem_cards' && block.data.isFullWidth) return true;
  if (block.type === 'bonus_section' && block.data.isFullWidth) return true;
  if (block.type === 'checklist_section' && block.data.isFullWidth) return true;
  
  return false;
};

// プレビューコンポーネント
const BusinessPreview = ({ lp }: { lp: BusinessLP }) => {
  const theme = lp.settings?.theme;
  const backgroundImage = theme?.backgroundImage;
  const gradient = theme?.gradient || 'linear-gradient(-45deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24)';
  const isAnimated = theme?.animated !== false; // デフォルトはアニメーション有効
  
  // 単色かグラデーションかを判定（#で始まる場合は単色）
  const isSolidColor = gradient.startsWith('#');

  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : isSolidColor
    ? {
        backgroundColor: gradient,
      }
    : {
        backgroundImage: gradient,
        backgroundSize: isAnimated ? '400% 400%' : 'auto',
      };

  return (
    <div 
      className={`min-h-screen ${!backgroundImage && !isSolidColor && isAnimated ? 'animate-gradient-xy' : ''}`}
      style={backgroundStyle}
    >
      {lp.content?.map(block => {
        const fullWidth = isFullWidthBlock(block);
        return (
          <div 
            key={block.id}
            className={fullWidth ? 'w-full' : 'max-w-4xl mx-auto px-4 py-2'}
          >
            <BlockRenderer block={block} variant="business" />
          </div>
        );
      })}
      <div className="text-center py-8">
        <span className="text-white/60 text-xs">
          Powered by コンテンツメーカー
        </span>
      </div>
    </div>
  );
};

const BusinessEditor: React.FC<BusinessEditorProps> = ({
  user,
  isAdmin,
  initialData,
  setPage,
  onBack,
  setShowAuth,
}) => {
  // ユーザープラン権限を取得
  const { userPlan, isLoading: isPlanLoading } = useUserPlan(user?.id);
  const { consumeAndExecute } = usePoints({ userId: user?.id, isPro: userPlan.isProUser });
  // ツール間連携: ユーザーのコンテンツ一覧を取得
  const { contents: userContents, loading: contentsLoading } = useUserContents({ userId: user?.id || null, exclude: ['business'] });
  // はじめかたガイド
  const { showOnboarding, setShowOnboarding } = useOnboarding('business_editor_onboarding_dismissed', { skip: !!initialData });

  // 初期ブロック
  const initialBlocks: Block[] = [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'ビジネスの成長を加速させる',
        subheadline: 'サブテキストを入力してください',
        ctaText: '詳しく見る',
        ctaUrl: '#',
        backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '選ばれる3つの理由',
        items: [
          { id: generateBlockId(), icon: '🏆', title: '特徴1', description: '説明文を入力してください' },
          { id: generateBlockId(), icon: '🤝', title: '特徴2', description: '説明文を入力してください' },
          { id: generateBlockId(), icon: '📊', title: '特徴3', description: '説明文を入力してください' },
        ],
        columns: 3,
      },
    },
  ];

  const [lp, setLp] = useState<Partial<BusinessLP>>({
    title: '',
    description: '',
    content: initialBlocks,
    settings: {
      theme: {
        gradient: 'linear-gradient(-45deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24)',
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
    new Set(initialBlocks[0]?.id ? [initialBlocks[0].id] : [])
  );
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<'pc' | 'mobile'>('pc');
  const pcIframeRef = React.useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = React.useRef<HTMLIFrameElement>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [justSavedSlug, setJustSavedSlug] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // カスタムスラッグのバリデーション
  const validateCustomSlug = (slug: string): boolean => {
    if (!slug) {
      setSlugError('');
      return true; // 空は許可（自動生成される）
    }
    const regex = /^[a-z0-9-]{3,20}$/;
    if (!regex.test(slug)) {
      setSlugError('英小文字、数字、ハイフンのみ（3〜20文字）');
      return false;
    }
    setSlugError('');
    return true;
  };

  // セクションの開閉状態
  const [openSections, setOpenSections] = useState({
    template: true,
    theme: false,
    blocks: true,
    advanced: false
  });

  const resetPreview = () => setPreviewKey(k => k + 1);

  // iframeにプレビューデータを送信（両方のiframeに送信）
  const sendPreviewData = React.useCallback(() => {
    const payload = {
      type: 'PREVIEW_DATA',
      payload: {
        title: lp.title || '',
        description: lp.description || '',
        content: lp.content || [],
        settings: lp.settings,
      }
    };
    // PC用iframe
    if (pcIframeRef.current?.contentWindow) {
      pcIframeRef.current.contentWindow.postMessage(payload, '*');
    }
    // モバイル用iframe
    if (mobileIframeRef.current?.contentWindow) {
      mobileIframeRef.current.contentWindow.postMessage(payload, '*');
    }
  }, [lp]);

  // iframeがreadyになったらデータを送信
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_READY') {
        sendPreviewData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendPreviewData]);

  // lpが変更されたらiframeにデータを送信
  useEffect(() => {
    sendPreviewData();
  }, [lp, sendPreviewData]);

  // previewModeが変わった時は少し待ってからデータを送信（表示が切り替わった直後にデータを同期）
  useEffect(() => {
    const timer = setTimeout(() => {
      sendPreviewData();
    }, 100);
    return () => clearTimeout(timer);
  }, [previewMode, sendPreviewData]);

  useEffect(() => {
    if (initialData) {
      setLp(initialData);
      setSavedSlug(initialData.slug);
      setSavedId(initialData.id);
      setCustomSlug(initialData.slug || '');
      setJustSavedSlug(initialData.slug);
      setOpenSections({
        template: false,
        theme: true,
        blocks: true,
        advanced: false
      });
    }
  }, [initialData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (lp.content && lp.content.length > 0) {
        const confirmed = confirm(`「${template.name}」テンプレートを適用しますか？\n現在の内容は上書きされます。`);
        if (!confirmed) return;
      }
      
      setLp(prev => ({
        ...prev,
        content: template.blocks.map(block => ({
          ...block,
          id: generateBlockId(),
        })),
        settings: {
          ...prev.settings,
          theme: template.theme,
        },
      }));
      setOpenSections({ template: false, theme: true, blocks: true, advanced: false });
      // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
      alert(`✨「${template.name}」テンプレートを適用しました！`);
    }
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) {
      alert('ビジネス内容を入力してください');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt }),
      });

      if (!response.ok) throw new Error('生成に失敗しました');

      const data = await response.json();
      
      setLp(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        content: data.content?.map((block: Block) => ({
          ...block,
          id: generateBlockId(),
        })) || prev.content,
      }));

      setGeneratePrompt('');
      // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
      trackGenerateComplete('business');
      alert('AI生成が完了しました！');
    } catch (error) {
      console.error('Generate error:', error);
      trackGenerateError(error instanceof Error ? error.message : '生成エラー');
      alert('AI生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    // 既存コンテンツの更新はログインが必要
    const existingId = initialData?.id || savedId;

    // カスタムスラッグのバリデーション（新規作成時のみ。既存データのslugは確定済みなのでスキップ）
    if (!existingId && customSlug && !validateCustomSlug(customSlug)) {
      return;
    }
    if (existingId && !user) {
      if (confirm('編集・更新にはログインが必要です。ログイン画面を開きますか？')) {
        setShowAuth(true);
      }
      return;
    }

    await consumeAndExecute('business', 'save', async () => {
      setIsSaving(true);
      try {
        // タイトルが未入力の場合はデフォルト名を使用
        const finalTitle = lp.title?.trim() || '無題のビジネスLP';

        let result;
        const existingId = initialData?.id || savedId;

        if (existingId) {
          // 更新の場合：既存のslugを維持（slugは変更しない）
          const updatePayload = {
            content: lp.content,
            settings: {
              ...lp.settings,
              title: finalTitle,
              description: lp.description,
            },
          };

          const updateResult = await supabase
            ?.from('business_projects')
            .update(updatePayload)
            .eq('id', existingId);

          if (updateResult?.error) {
            console.error('Business LP update error:', updateResult.error);
            throw new Error(updateResult.error.message || 'データベースエラー');
          }

          // 更新成功 - 既存のslug/idを維持
          const currentSlug = initialData?.slug || savedSlug;
          if (currentSlug) {
            setJustSavedSlug(currentSlug);
            // ISRキャッシュを無効化
            fetch('/api/revalidate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: `/business/${currentSlug}` }),
            }).catch(() => {});
          }
          alert('保存しました！');
          return;
        } else {
          // 新規作成の場合：ユニークなslugを生成（リトライ付き）
          let attempts = 0;
          const maxAttempts = 5;

          while (attempts < maxAttempts) {
            const newSlug = customSlug.trim() || generateSlug();
            const insertPayload = {
              content: lp.content,
              settings: {
                ...lp.settings,
                title: finalTitle,
                description: lp.description,
              },
              slug: newSlug,
              user_id: user?.id || null,
            };

            result = await supabase
              ?.from('business_projects')
              .insert(insertPayload)
              .select();

            // slug重複エラー（23505）の場合はリトライ（カスタムslugの場合はリトライしない）
            if (result?.error?.code === '23505' && result?.error?.message?.includes('slug') && !customSlug.trim()) {
              attempts++;
              console.log(`Slug collision, retrying... (attempt ${attempts}/${maxAttempts})`);
              continue;
            }

            // その他のエラーまたは成功の場合はループを抜ける
            break;
          }

          if (attempts >= maxAttempts) {
            throw new Error('ユニークなURLの生成に失敗しました。もう一度お試しください。');
          }

          if (result?.error) {
            console.error('Business LP save error:', result.error);
            // カスタムURL（slug）の重複エラーを分かりやすいメッセージに変換
            if (result.error.code === '23505' && result.error.message?.includes('slug')) {
              throw new Error('このカスタムURLは既に使用されています。別のURLを指定してください。');
            }
            throw new Error(result.error.message || 'データベースエラー');
          }
        }

        const savedData = result?.data?.[0];
        if (!savedData) {
          throw new Error('保存に失敗しました。ページを再読み込みしてもう一度お試しください。');
        }

        setSavedSlug(savedData.slug);
        setSavedId(savedData.id);
        setJustSavedSlug(savedData.slug);

        // ISRキャッシュを無効化
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/business/${savedData.slug}` }),
        }).catch(() => {});

        if (!initialData && !savedId) {
          // 完全な新規作成の場合のみ成功モーダルを表示
          setShowSuccessModal(true);

          // ゲスト作成の場合、ログイン時に引き継ぐためlocalStorageに保存
          if (!user) {
            try {
              const stored = JSON.parse(localStorage.getItem('guest_content') || '[]');
              stored.push({ table: 'business_projects', id: savedData.id });
              localStorage.setItem('guest_content', JSON.stringify(stored));
            } catch {}
          }
        } else {
          alert('保存しました！');
        }
      } catch (error) {
        console.error('Save error:', error);
        const errorMessage = error instanceof Error ? error.message : '不明なエラー';
        alert(`保存中にエラーが発生しました: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
    }, existingId?.toString());
  };

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    setLp(prev => {
      const content = prev.content || [];
      // heroまたはhero_fullwidthブロックのインデックスを検索
      const heroIndex = content.findIndex(b => b.type === 'hero' || b.type === 'hero_fullwidth');
      
      let newContent;
      if (heroIndex === -1) {
        // タイトルブロックが存在しない場合は最後に追加
        newContent = [...content, newBlock];
      } else if (heroIndex === content.length - 1) {
        // タイトルブロックが最後の要素の場合のみ、タイトルブロックの直後に挿入
        newContent = [
          ...content.slice(0, heroIndex + 1),
          newBlock,
          ...content.slice(heroIndex + 1)
        ];
      } else {
        // それ以外は最後に追加
        newContent = [...content, newBlock];
      }
      
      return {
        ...prev,
        content: newContent,
      };
    });
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id));
    setShowBlockSelector(false);
    // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
  };

  const removeBlock = (id: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setLp(prev => ({
      ...prev,
      content: prev.content?.filter(b => b.id !== id),
    }));
    // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    setLp(prev => ({
      ...prev,
      content: prev.content?.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } as typeof b : b
      ),
    }));
    // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setLp(prev => {
      const content = [...(prev.content || [])];
      const index = content.findIndex(b => b.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= content.length) return prev;
      const [movedBlock] = content.splice(index, 1);
      content.splice(newIndex, 0, movedBlock);
      return { ...prev, content };
    });
    // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
  };

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert("データベースに接続されていません");

    if (file.size > MAX_IMAGE_SIZE) {
      alert(`画像サイズが大きすぎます。最大2MBまで対応しています。`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user?.id || 'anonymous'}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      updateBlock(blockId, { [field]: data.publicUrl });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      // RLSエラーの場合はログインを促すメッセージに変換
      if (message.includes('row-level security policy')) {
        alert('画像をアップロードするにはログインが必要です。');
      } else {
        alert('アップロードエラー: ' + message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ランダム画像設定
  const handleRandomImage = (blockId: string, field: string, category: string = 'business') => {
    const randomUrl = getRandomImageUrl(category);
    
    // testimonialの場合は特別処理（field形式: testimonial-0, testimonial-1...）
    if (field.startsWith('testimonial-')) {
      const index = parseInt(field.split('-')[1]);
      const block = lp.content?.find(b => b.id === blockId);
      if (block && block.type === 'testimonial') {
        const newItems = [...(block.data.items || [])];
        if (newItems[index]) {
          newItems[index] = { ...newItems[index], imageUrl: randomUrl };
          updateBlock(blockId, { items: newItems });
        }
      }
    } else {
      updateBlock(blockId, { [field]: randomUrl });
    }
  };

  const createDefaultBlock = (type: string): Block => {
    const id = generateBlockId();
    switch (type) {
      case 'header':
        return { id, type: 'header', data: { avatar: '', name: '', title: '', category: 'business' } };
      case 'hero':
        return { 
          id, 
          type: 'hero', 
          data: { 
            headline: 'キャッチコピーを入力', 
            subheadline: 'サブテキスト', 
            ctaText: '詳しく見る', 
            ctaUrl: '#',
            backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' 
          } 
        };
      case 'hero_fullwidth':
        return { 
          id, 
          type: 'hero_fullwidth', 
          data: { 
            headline: 'あなたのビジネスを成功に導く', 
            subheadline: 'サブテキストを入力してください',
            ctaText: '今すぐ始める', 
            ctaUrl: '#',
            backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' 
          } 
        };
      case 'features':
        return { 
          id, 
          type: 'features', 
          data: { 
            title: '選ばれる3つの理由', 
            columns: 3 as const, 
            items: [
              { id: generateBlockId(), icon: '🏆', title: '特徴1', description: '説明文' },
              { id: generateBlockId(), icon: '🤝', title: '特徴2', description: '説明文' },
              { id: generateBlockId(), icon: '📊', title: '特徴3', description: '説明文' }
            ] 
          } 
        };
      case 'problem_cards':
        return {
          id,
          type: 'problem_cards',
          data: {
            title: 'こんなお悩みありませんか？',
            subtitle: '',
            items: [
              { id: generateBlockId(), icon: '😰', title: '悩み1', description: '説明文', borderColor: 'blue' },
              { id: generateBlockId(), icon: '😓', title: '悩み2', description: '説明文', borderColor: 'red' },
              { id: generateBlockId(), icon: '🤔', title: '悩み3', description: '説明文', borderColor: 'orange' }
            ]
          } 
        };
      case 'two_column':
        return { 
          id, 
          type: 'two_column', 
          data: { 
            layout: 'image-left' as const, 
            imageUrl: '', 
            title: 'タイトル', 
            text: 'テキストを入力' 
          } 
        };
      case 'cta_section':
        return { 
          id, 
          type: 'cta_section', 
          data: { 
            title: '今すぐ始めましょう', 
            description: 'お気軽にお問い合わせください', 
            buttonText: 'お問い合わせ', 
            buttonUrl: '#',
            backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          } 
        };
      case 'dark_section':
        return {
          id,
          type: 'dark_section',
          data: {
            title: 'セクションタイトル',
            subtitle: 'サブタイトル',
            items: [
              { id: generateBlockId(), icon: '✓', title: 'ポイント1', description: '説明文' },
              { id: generateBlockId(), icon: '✓', title: 'ポイント2', description: '説明文' },
              { id: generateBlockId(), icon: '✓', title: 'ポイント3', description: '説明文' }
            ],
            accentColor: 'orange'
          }
        };
      case 'case_study_cards':
        return {
          id,
          type: 'case_study_cards',
          data: {
            title: '導入事例',
            items: [
              { id: generateBlockId(), imageUrl: '', category: 'カテゴリ', title: '事例タイトル', description: '説明文', categoryColor: 'blue' }
            ]
          }
        };
      case 'bonus_section':
        return {
          id,
          type: 'bonus_section',
          data: {
            title: '今なら特典つき！',
            subtitle: '',
            items: [
              { id: generateBlockId(), icon: '🎁', title: '特典1', description: '説明文' },
              { id: generateBlockId(), icon: '📚', title: '特典2', description: '説明文' }
            ],
            backgroundGradient: 'linear-gradient(to right, #10b981, #3b82f6)'
          }
        };
      case 'checklist_section':
        return {
          id,
          type: 'checklist_section',
          data: {
            title: 'サービス内容',
            items: [
              { id: generateBlockId(), icon: '✓', title: '項目1', description: '' },
              { id: generateBlockId(), icon: '✓', title: '項目2', description: '' },
              { id: generateBlockId(), icon: '✓', title: '項目3', description: '' }
            ],
            columns: 2
          } 
        };
      case 'text_card':
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
      case 'image':
        return { id, type: 'image', data: { url: '', caption: '' } };
      case 'youtube':
        return { id, type: 'youtube', data: { url: '' } };
      case 'links':
        return { id, type: 'links', data: { links: [{ label: '', url: '', style: '' }] } };
      case 'testimonial':
        return { id, type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] } };
      case 'pricing':
        return { id, type: 'pricing', data: { plans: [{ id: generateBlockId(), title: '', price: '', features: [], isRecommended: false }] } };
      case 'faq':
        return { id, type: 'faq', data: { items: [{ id: generateBlockId(), question: '', answer: '' }] } };
      case 'lead_form':
        return { id, type: 'lead_form', data: { title: '無料相談・お問い合わせ', buttonText: '送信する' } };
      case 'line_card':
        return { id, type: 'line_card', data: { title: '', description: '', url: '', buttonText: 'LINE登録' } };
      case 'kindle':
        return { id, type: 'kindle', data: { asin: '', imageUrl: '', title: '', description: '' } };
      case 'google_map':
        return { id, type: 'google_map', data: { address: '', title: '所在地', embedUrl: '', height: '400px' } };
      case 'quiz':
        return { id, type: 'quiz', data: { quizId: '', quizSlug: '', title: '' } };
      case 'countdown':
        return { id, type: 'countdown', data: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '期間限定キャンペーン', expiredText: 'キャンペーンは終了しました', backgroundColor: '#ef4444' } };
      case 'gallery':
        return { id, type: 'gallery', data: { items: [], columns: 3 as const, showCaptions: true, title: 'ギャラリー' } };
      case 'linked_content':
        return { id, type: 'linked_content', data: { title: '関連コンテンツ', items: [], layout: 'list' } };
      default:
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
    }
  };

  // プレビュー用のLPデータを生成
  const previewLP: BusinessLP = {
    id: 'preview',
    slug: 'preview',
    title: lp.title || 'ビジネスLP',
    description: lp.description || '',
    content: lp.content || [],
    settings: lp.settings,
  };

  // ブロックエディタのレンダリング
  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.data.avatar || ''}
                  onChange={(e) => updateBlock(block.id, { avatar: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'avatar')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'avatar', 'portrait')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.avatar && (
                <img src={block.data.avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />
              )}
            </div>
            <Input label="名前" val={block.data.name || ''} onChange={(v) => updateBlock(block.id, { name: v })} ph="山田 太郎" />
            <Input label="肩書き・キャッチコピー" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="代表取締役 / コンサルタント" />
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <Textarea label="メインキャッチコピー" val={block.data.headline || ''} onChange={(v) => updateBlock(block.id, { headline: v })} rows={2} />
            <Input label="サブテキスト" val={block.data.subheadline || ''} onChange={(v) => updateBlock(block.id, { subheadline: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.ctaText || ''} onChange={(v) => updateBlock(block.id, { ctaText: v })} ph="詳しく見る" />
              <Input label="ボタンURL" val={block.data.ctaUrl || ''} onChange={(v) => updateBlock(block.id, { ctaUrl: v })} ph="#contact" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像（任意）</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.backgroundImage || ''} onChange={(e) => updateBlock(block.id, { backgroundImage: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'backgroundImage')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.backgroundImage && (
                <img src={block.data.backgroundImage} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />
              )}
              {block.data.backgroundImage && (
                <div className="mt-3">
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    背景画像の透明度: {block.data.backgroundOpacity ?? 20}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={block.data.backgroundOpacity ?? 20}
                    onChange={(e) => updateBlock(block.id, { backgroundOpacity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>透明</span>
                    <span>半透明</span>
                    <span>不透明</span>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">見出し文字色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.data.headlineColor || '#ffffff'}
                    onChange={(e) => updateBlock(block.id, { headlineColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-xs text-gray-500">{block.data.headlineColor || '#ffffff'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">サブテキスト文字色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.data.subheadlineColor || '#ffffff'}
                    onChange={(e) => updateBlock(block.id, { subheadlineColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-xs text-gray-500">{block.data.subheadlineColor || '#ffffff'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`headline-bold-${block.id}`}
                checked={block.data.headlineBold !== false}
                onChange={(e) => updateBlock(block.id, { headlineBold: e.target.checked })}
                className="w-4 h-4 text-amber-600"
              />
              <label htmlFor={`headline-bold-${block.id}`} className="text-sm font-medium text-gray-700">
                見出しを太字にする
              </label>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
          </div>
        );

      case 'hero_fullwidth':
        return (
          <div className="space-y-4">
            <Textarea label="メインキャッチコピー" val={block.data.headline || ''} onChange={(v) => updateBlock(block.id, { headline: v })} rows={2} />
            <Input label="サブテキスト" val={block.data.subheadline || ''} onChange={(v) => updateBlock(block.id, { subheadline: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.ctaText || ''} onChange={(v) => updateBlock(block.id, { ctaText: v })} ph="詳しく見る" />
              <Input label="ボタンURL" val={block.data.ctaUrl || ''} onChange={(v) => updateBlock(block.id, { ctaUrl: v })} ph="#contact" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像（任意）</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.backgroundImage || ''} onChange={(e) => updateBlock(block.id, { backgroundImage: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'backgroundImage')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.backgroundImage && (
                <img src={block.data.backgroundImage} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />
              )}
              {block.data.backgroundImage && (
                <div className="mt-3">
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    背景画像の透明度: {block.data.backgroundOpacity ?? 40}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={block.data.backgroundOpacity ?? 40}
                    onChange={(e) => updateBlock(block.id, { backgroundOpacity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>透明</span>
                    <span>半透明</span>
                    <span>不透明</span>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">見出し文字色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.data.headlineColor || '#ffffff'}
                    onChange={(e) => updateBlock(block.id, { headlineColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-xs text-gray-500">{block.data.headlineColor || '#ffffff'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">サブテキスト文字色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.data.subheadlineColor || '#ffffff'}
                    onChange={(e) => updateBlock(block.id, { subheadlineColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-xs text-gray-500">{block.data.subheadlineColor || '#ffffff'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`headline-bold-fw-${block.id}`}
                checked={block.data.headlineBold !== false}
                onChange={(e) => updateBlock(block.id, { headlineBold: e.target.checked })}
                className="w-4 h-4 text-amber-600"
              />
              <label htmlFor={`headline-bold-fw-${block.id}`} className="text-sm font-medium text-gray-700">
                見出しを太字にする
              </label>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">※ このブロックは常に全幅で表示されます</p>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="選ばれる3つの理由" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">列数</label>
              <div className="flex gap-2">
                {[2, 3].map(col => (
                  <button key={col} onClick={() => updateBlock(block.id, { columns: col })} className={`px-4 py-2 rounded-lg font-medium ${block.data.columns === col ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{col}列</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; icon?: string; title: string; description: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <IconPicker 
                    value={item.icon || ''} 
                    onChange={(v) => { const newItems = [...block.data.items]; newItems[i].icon = v; updateBlock(block.id, { items: newItems }); }} 
                    category="features"
                  />
                  <div className="col-span-2"><Input label="タイトル" val={item.title} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].title = v; updateBlock(block.id, { items: newItems }); }} ph="特徴名" /></div>
                </div>
                <Textarea label="説明" val={item.description} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), icon: '🏆', title: '', description: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 特徴を追加</button>
          </div>
        );

      case 'problem_cards':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="こんなお悩みありませんか？" />
            <Input label="サブタイトル（任意）" val={block.data.subtitle || ''} onChange={(v) => updateBlock(block.id, { subtitle: v })} />
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; icon?: string; title: string; description: string; borderColor?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <IconPicker 
                    value={item.icon || ''} 
                    onChange={(v) => { const newItems = [...block.data.items]; newItems[i].icon = v; updateBlock(block.id, { items: newItems }); }} 
                    category="problems"
                  />
                  <div className="col-span-2"><Input label="タイトル" val={item.title} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].title = v; updateBlock(block.id, { items: newItems }); }} /></div>
                </div>
                <Textarea label="説明" val={item.description} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), icon: '😰', title: '', description: '', borderColor: 'blue' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 悩みを追加</button>
          </div>
        );

      case 'cta_section':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="今すぐ始めましょう" />
            <Textarea label="説明文" val={block.data.description || ''} onChange={(v) => updateBlock(block.id, { description: v })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="お問い合わせ" />
              <Input label="ボタンURL" val={block.data.buttonUrl || ''} onChange={(v) => updateBlock(block.id, { buttonUrl: v })} ph="#contact" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
          </div>
        );

      case 'two_column':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">レイアウト</label>
              <div className="flex gap-2">
                <button onClick={() => updateBlock(block.id, { layout: 'image-left' })} className={`px-4 py-2 rounded-lg font-medium ${block.data.layout === 'image-left' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>画像左</button>
                <button onClick={() => updateBlock(block.id, { layout: 'image-right' })} className={`px-4 py-2 rounded-lg font-medium ${block.data.layout === 'image-right' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>画像右</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.imageUrl || ''} onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'imageUrl')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'imageUrl', 'business')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.imageUrl && (
                <img src={block.data.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </div>
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} />
            <Textarea label="テキスト" val={block.data.text || ''} onChange={(v) => updateBlock(block.id, { text: v })} rows={3} />
          </div>
        );

      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル（任意）" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} />
            <Textarea label="テキスト" val={block.data.text || ''} onChange={(v) => updateBlock(block.id, { text: v })} rows={4} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">配置</label>
              <div className="flex gap-2">
                <button onClick={() => updateBlock(block.id, { align: 'center' })} className={`px-4 py-2 rounded-lg font-medium ${block.data.align === 'center' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>中央</button>
                <button onClick={() => updateBlock(block.id, { align: 'left' })} className={`px-4 py-2 rounded-lg font-medium ${block.data.align === 'left' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>左寄せ</button>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.data.url || ''}
                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'url')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'url', 'general')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.url && (
                <img src={block.data.url} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </div>
            <Input label="キャプション（任意）" val={block.data.caption || ''} onChange={(v) => updateBlock(block.id, { caption: v })} ph="写真の説明" />
          </div>
        );

      case 'youtube':
        return <Input label="YouTube URL" val={block.data.url || ''} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." />;

      case 'links':
        return (
          <div className="space-y-4">
            {block.data.links?.map((link: { label: string; url: string; style?: string }, i: number) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg relative">
                <button
                  onClick={() => {
                    const newLinks = block.data.links.filter((_: unknown, idx: number) => idx !== i);
                    updateBlock(block.id, { links: newLinks });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <Input label="ラベル" val={link.label} onChange={(v) => {
                  const newLinks = [...block.data.links];
                  newLinks[i].label = v;
                  updateBlock(block.id, { links: newLinks });
                }} ph="ホームページ" />
                <Input label="URL" val={link.url} onChange={(v) => {
                  const newLinks = [...block.data.links];
                  newLinks[i].url = v;
                  updateBlock(block.id, { links: newLinks });
                }} ph="https://..." />
                
                {/* スタイル選択 */}
                <div className="mt-3">
                  <label className="text-xs font-bold text-gray-600 block mb-2">ボタンスタイル</label>
                  <div className="flex flex-wrap gap-2">
                    {linkStyleOptions.map((option) => {
                      const isSelected = (link.style || '') === option.value;
                      const stylePreview: Record<string, string> = {
                        '': 'bg-white border-gray-200',
                        'orange': 'bg-orange-500 text-white',
                        'blue': 'bg-blue-500 text-white',
                        'green': 'bg-green-500 text-white',
                        'purple': 'bg-purple-500 text-white',
                        'line': 'bg-[#06C755] text-white',
                      };
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const newLinks = [...block.data.links];
                            newLinks[i].style = option.value;
                            updateBlock(block.id, { links: newLinks });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${stylePreview[option.value]} ${isSelected ? 'ring-2 ring-amber-400 border-amber-500' : 'border-transparent'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...(block.data.links || []), { label: '', url: '', style: '' }];
                updateBlock(block.id, { links: newLinks });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium"
            >
              + リンクを追加
            </button>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; name: string; role: string; comment: string; imageUrl?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button
                  onClick={() => {
                    if ((block.data.items?.length || 0) <= 1) return alert('最低1つのお客様の声が必要です');
                    const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id);
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="font-bold text-amber-600 mb-2 text-sm">お客様 {i + 1}</div>
                
                {/* 画像プレビュー */}
                {item.imageUrl && (
                  <div className="mb-3 flex justify-center">
                    <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                  </div>
                )}
                
                {/* プリセット画像選択 */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-600 block mb-2">プロフィール画像</label>
                  <div className="flex gap-2 flex-wrap items-center mb-2">
                    {testimonialPresetImages.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          const newItems = [...block.data.items];
                          newItems[i].imageUrl = preset.url;
                          updateBlock(block.id, { items: newItems });
                        }}
                        className={`p-0.5 rounded-full border-2 transition-all ${item.imageUrl === preset.url ? 'border-amber-500' : 'border-gray-200 hover:border-amber-300'}`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-full object-cover" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleRandomImage(block.id, `testimonial-${i}`, 'portrait')}
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-amber-400 transition-colors"
                      title="ランダム"
                    >
                      <Shuffle size={14} className="text-gray-400" />
                    </button>
                  </div>
                  {/* アップロードボタン */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg cursor-pointer transition-colors">
                    <UploadCloud size={14} />
                    <span>アップロード</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > MAX_IMAGE_SIZE) {
                          alert(`画像サイズが大きすぎます。最大2MBまで対応しています。`);
                          return;
                        }
                        // ファイルをアップロード
                        const uploadTestimonialImage = async () => {
                          if (!supabase) return;
                          setIsUploading(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                            const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                            const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                            if (uploadError) throw uploadError;
                            const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                            const newItems = [...block.data.items];
                            newItems[i].imageUrl = data.publicUrl;
                            updateBlock(block.id, { items: newItems });
                          } catch (err) {
                            const message = err instanceof Error ? err.message : '不明なエラー';
                            if (message.includes('row-level security policy')) {
                              alert('画像をアップロードするにはログインが必要です。');
                            } else {
                              alert('アップロードに失敗しました');
                            }
                          } finally {
                            setIsUploading(false);
                          }
                        };
                        uploadTestimonialImage();
                      }}
                    />
                  </label>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={item.imageUrl || ''}
                    onChange={(e) => {
                      const newItems = [...block.data.items];
                      newItems[i].imageUrl = e.target.value;
                      updateBlock(block.id, { items: newItems });
                    }}
                    placeholder="または画像URLを入力"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
                <Input label="お名前" val={item.name} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].name = v; updateBlock(block.id, { items: newItems }); }} ph="田中 花子" />
                <Input label="肩書き" val={item.role} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].role = v; updateBlock(block.id, { items: newItems }); }} ph="30代・会社員" />
                <Textarea label="コメント" val={item.comment} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].comment = v; updateBlock(block.id, { items: newItems }); }} />
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(block.data.items || []), { id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }];
                updateBlock(block.id, { items: newItems });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium"
            >
              + お客様の声を追加
            </button>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            {block.data.plans?.map((plan: { id: string; title: string; price: string; features: string[]; isRecommended: boolean }, i: number) => (
              <div key={plan.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newPlans = block.data.plans.filter((p: { id: string }) => p.id !== plan.id); updateBlock(block.id, { plans: newPlans }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-amber-600">プラン {i + 1}</span>
                  <label className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={plan.isRecommended} onChange={(e) => { const newPlans = [...block.data.plans]; newPlans[i].isRecommended = e.target.checked; updateBlock(block.id, { plans: newPlans }); }} />
                    おすすめ
                  </label>
                </div>
                <Input label="プラン名" val={plan.title} onChange={(v) => { const newPlans = [...block.data.plans]; newPlans[i].title = v; updateBlock(block.id, { plans: newPlans }); }} ph="ベーシック" />
                <Input label="価格" val={plan.price} onChange={(v) => { const newPlans = [...block.data.plans]; newPlans[i].price = v; updateBlock(block.id, { plans: newPlans }); }} ph="¥5,000/月" />
                <Textarea label="特徴（1行に1つ）" val={plan.features.join('\n')} onChange={(v) => { const newPlans = [...block.data.plans]; newPlans[i].features = v.split('\n').filter(f => f.trim()); updateBlock(block.id, { plans: newPlans }); }} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { plans: [...(block.data.plans || []), { id: generateBlockId(), title: '', price: '', features: [], isRecommended: false }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ プランを追加</button>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            {block.data.items?.map((item: { id: string; question: string; answer: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="font-bold text-amber-600 mb-2 text-sm">Q{i + 1}</div>
                <Input label="質問" val={item.question} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].question = v; updateBlock(block.id, { items: newItems }); }} ph="よくある質問" />
                <Textarea label="回答" val={item.answer} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].answer = v; updateBlock(block.id, { items: newItems }); }} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), question: '', answer: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ FAQを追加</button>
          </div>
        );

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="無料相談・お問い合わせ" />
            <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="送信する" />
            
            {/* メール送信設定 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={block.data.sendEmail || false}
                  onChange={(e) => updateBlock(block.id, { sendEmail: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-bold text-gray-700">メール送信を有効化</label>
              </div>
              
              {block.data.sendEmail && (
                <div className="space-y-4 pl-6 border-l-2 border-amber-200">
                  <Input 
                    label="管理者通知先メール" 
                    val={block.data.adminEmail || ''} 
                    onChange={(v) => updateBlock(block.id, { adminEmail: v })} 
                    ph="admin@example.com（空欄で環境変数を使用）" 
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.data.showName || false}
                      onChange={(e) => updateBlock(block.id, { showName: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-xs text-gray-600">名前入力欄を表示</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.data.showMessage || false}
                      onChange={(e) => updateBlock(block.id, { showMessage: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-xs text-gray-600">メッセージ入力欄を表示</label>
                  </div>
                  <p className="text-xs text-gray-500">
                    ✉️ 登録時にユーザーへ自動返信メール、管理者へ通知メールが送信されます
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'line_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="公式LINE登録で特典GET!" />
            <Textarea label="説明" val={block.data.description || ''} onChange={(v) => updateBlock(block.id, { description: v })} />
            <Input label="LINE URL" val={block.data.url || ''} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://lin.ee/..." />
            <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="LINEで登録する" />
          </div>
        );

      case 'kindle':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">書籍画像</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.data.imageUrl || ''}
                  onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'imageUrl')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'imageUrl', 'book')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.imageUrl && (
                <img src={block.data.imageUrl} alt="Preview" className="w-24 h-36 object-cover rounded-lg mt-2" />
              )}
            </div>
            <Input label="書籍タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="書籍タイトル" />
            <Textarea label="説明" val={block.data.description || ''} onChange={(v) => updateBlock(block.id, { description: v })} />
            <Input label="ASIN（Amazon商品コード）" val={block.data.asin || ''} onChange={(v) => updateBlock(block.id, { asin: v })} ph="B08XXXXXXX" />
          </div>
        );

      case 'google_map':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="所在地" />
            <Input label="住所" val={block.data.address || ''} onChange={(v) => updateBlock(block.id, { address: v })} ph="東京都渋谷区..." />
            <Textarea label="埋め込みURL" val={block.data.embedUrl || ''} onChange={(v) => updateBlock(block.id, { embedUrl: v })} />
            <p className="text-xs text-gray-500">Googleマップ→共有→地図を埋め込む→HTMLをコピーして、src=&quot;...&quot;の部分を貼り付けてください</p>
          </div>
        );

      case 'dark_section':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} />
            <Input label="サブタイトル" val={block.data.subtitle || ''} onChange={(v) => updateBlock(block.id, { subtitle: v })} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景色</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'ダーク', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
                  { label: 'ネイビー', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
                  { label: 'パープル', value: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)' },
                  { label: 'グリーン', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => updateBlock(block.id, { backgroundColor: preset.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${block.data.backgroundColor === preset.value ? 'ring-2 ring-offset-1 ring-amber-500' : ''}`}
                    style={{ background: preset.value }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; icon?: string; title: string; description: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="mb-3">
                  <IconPicker 
                    value={item.icon || ''} 
                    onChange={(v) => { const newItems = [...block.data.items]; newItems[i].icon = v; updateBlock(block.id, { items: newItems }); }} 
                    category="check"
                  />
                </div>
                <Input label="タイトル" val={item.title} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].title = v; updateBlock(block.id, { items: newItems }); }} />
                <Textarea label="説明" val={item.description} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), icon: '✓', title: '', description: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 項目を追加</button>
          </div>
        );

      case 'bonus_section':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="今なら特典つき！" />
            <Input label="サブタイトル" val={block.data.subtitle || ''} onChange={(v) => updateBlock(block.id, { subtitle: v })} />
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; icon?: string; title: string; description: string; value?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="mb-3">
                  <IconPicker
                    value={item.icon || ''}
                    onChange={(v) => { const newItems = [...block.data.items]; newItems[i].icon = v; updateBlock(block.id, { items: newItems }); }}
                    category="bonus"
                  />
                </div>
                <Input label="タイトル" val={item.title} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].title = v; updateBlock(block.id, { items: newItems }); }} />
                <Textarea label="説明" val={item.description} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} rows={2} />
                <Input label="通常価格（任意）" val={item.value || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].value = v; updateBlock(block.id, { items: newItems }); }} ph="¥10,000" />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), icon: '🎁', title: '', description: '', value: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 特典を追加</button>
            <Input label="特典の総額（任意）" val={block.data.totalValue || ''} onChange={(v) => updateBlock(block.id, { totalValue: v })} ph="¥50,000" />
          </div>
        );

      case 'checklist_section':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">列数</label>
              <div className="flex gap-2">
                {[1, 2].map(col => (
                  <button key={col} onClick={() => updateBlock(block.id, { columns: col })} className={`px-4 py-2 rounded-lg font-medium ${block.data.columns === col ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{col}列</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; icon?: string; title: string; description?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <IconPicker 
                    value={item.icon || ''} 
                    onChange={(v) => { const newItems = [...block.data.items]; newItems[i].icon = v; updateBlock(block.id, { items: newItems }); }} 
                    category="check"
                  />
                  <div className="col-span-2"><Input label="タイトル" val={item.title} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].title = v; updateBlock(block.id, { items: newItems }); }} /></div>
                </div>
                <Input label="説明（任意）" val={item.description || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), icon: '✓', title: '', description: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 項目を追加</button>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <Input label="タイトル（任意）" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="あなたにぴったりの診断" />
            <Input label="診断クイズID" val={block.data.quizId || ''} onChange={(v) => updateBlock(block.id, { quizId: v })} ph="クイズのIDを入力" />
            <Input label="または診断クイズSlug" val={block.data.quizSlug || ''} onChange={(v) => updateBlock(block.id, { quizSlug: v })} ph="クイズのSlugを入力" />
            <p className="text-xs text-gray-500">※ IDまたはSlugのいずれかを指定してください。作成済みの診断クイズを埋め込みます。</p>
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="期間限定キャンペーン" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">終了日時</label>
              <input
                type="datetime-local"
                value={block.data.targetDate?.slice(0, 16) || ''}
                onChange={(e) => updateBlock(block.id, { targetDate: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
              />
            </div>
            <Input label="終了後テキスト" val={block.data.expiredText || ''} onChange={(v) => updateBlock(block.id, { expiredText: v })} ph="キャンペーンは終了しました" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景色</label>
              <div className="flex gap-2">
                {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateBlock(block.id, { backgroundColor: color })}
                    className={`w-8 h-8 rounded-lg ${block.data.backgroundColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'case_study_cards':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="導入事例" />
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={(e) => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-amber-800">🖥️ 全幅表示（PC向け）</label>
            </div>
            {block.data.items?.map((item: { id: string; imageUrl?: string; category?: string; title: string; description: string; categoryColor?: string; beforeText?: string; afterText?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-900 block mb-2">事例画像</label>
                  <div className="flex gap-2">
                    <input type="text" value={item.imageUrl || ''} onChange={(e) => { const newItems = [...block.data.items]; newItems[i].imageUrl = e.target.value; updateBlock(block.id, { items: newItems }); }} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                    <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                      <UploadCloud size={14} />
                      <span className="hidden sm:inline">UP</span>
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !supabase) return;
                        if (file.size > MAX_IMAGE_SIZE) { alert('画像サイズが大きすぎます。最大2MBまで対応しています。'); return; }
                        const fileExt = file.name.split('.').pop();
                        const fileName = `casestudy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                        const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                        const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                        if (uploadError) {
                          if (uploadError.message.includes('row-level security policy')) {
                            alert('画像をアップロードするにはログインが必要です。');
                          } else {
                            alert('アップロードエラー: ' + uploadError.message);
                          }
                          return;
                        }
                        const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                        const newItems = [...block.data.items]; newItems[i].imageUrl = data.publicUrl; updateBlock(block.id, { items: newItems });
                      }} />
                    </label>
                    <button
                      onClick={() => { const newItems = [...block.data.items]; newItems[i].imageUrl = getRandomImageUrl('business'); updateBlock(block.id, { items: newItems }); }}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                    >
                      <Shuffle size={14} />
                      <span className="hidden sm:inline">自動</span>
                    </button>
                  </div>
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-32 rounded-lg object-cover mt-2" />}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Input label="カテゴリ" val={item.category || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].category = v; updateBlock(block.id, { items: newItems }); }} ph="業種・業態" />
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">カテゴリ色</label>
                    <div className="flex gap-1">
                      {['blue', 'green', 'orange', 'purple', 'red'].map((color) => (
                        <button
                          key={color}
                          onClick={() => { const newItems = [...block.data.items]; newItems[i].categoryColor = color; updateBlock(block.id, { items: newItems }); }}
                          className={`w-6 h-6 rounded ${item.categoryColor === color ? 'ring-2 ring-offset-1 ring-gray-900' : ''}`}
                          style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'orange' ? '#f59e0b' : color === 'purple' ? '#8b5cf6' : '#ef4444' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Input label="事例タイトル" val={item.title} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].title = v; updateBlock(block.id, { items: newItems }); }} ph="〇〇株式会社様" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Before（任意）" val={item.beforeText || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].beforeText = v; updateBlock(block.id, { items: newItems }); }} ph="導入前の課題" />
                  <Input label="After（任意）" val={item.afterText || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].afterText = v; updateBlock(block.id, { items: newItems }); }} ph="導入後の成果" />
                </div>
                <Textarea label="説明・成果" val={item.description} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), imageUrl: '', category: 'カテゴリ', title: '', description: '', categoryColor: 'blue', beforeText: '', afterText: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 事例を追加</button>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <Input label="タイトル（任意）" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="ギャラリー" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">列数</label>
              <div className="flex gap-2">
                {[2, 3, 4].map(col => (
                  <button key={col} onClick={() => updateBlock(block.id, { columns: col })} className={`px-4 py-2 rounded-lg font-medium ${block.data.columns === col ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{col}列</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id={`showcaptions-${block.id}`} checked={block.data.showCaptions || false} onChange={(e) => updateBlock(block.id, { showCaptions: e.target.checked })} className="w-4 h-4 text-amber-600" />
              <label htmlFor={`showcaptions-${block.id}`} className="text-sm text-gray-700">キャプションを表示</label>
            </div>
            {block.data.items?.map((item: { id: string; imageUrl: string; caption?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">画像 {i + 1}</span>
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={item.imageUrl || ''} onChange={(e) => { const newItems = [...block.data.items]; newItems[i].imageUrl = e.target.value; updateBlock(block.id, { items: newItems }); }} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                  <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 text-sm">
                    <UploadCloud size={14} />
                    <span className="hidden sm:inline">UP</span>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !supabase) return;
                      if (file.size > MAX_IMAGE_SIZE) { alert('画像サイズが大きすぎます。最大2MBまで対応しています。'); return; }
                      const fileExt = file.name.split('.').pop();
                      const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                      const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                      if (uploadError) {
                        if (uploadError.message.includes('row-level security policy')) {
                          alert('画像をアップロードするにはログインが必要です。');
                        } else {
                          alert('アップロードエラー: ' + uploadError.message);
                        }
                        return;
                      }
                      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                      const newItems = [...block.data.items]; newItems[i].imageUrl = data.publicUrl; updateBlock(block.id, { items: newItems });
                    }} />
                  </label>
                  <button
                    onClick={() => { const newItems = [...block.data.items]; newItems[i].imageUrl = getRandomImageUrl('gallery'); updateBlock(block.id, { items: newItems }); }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                  >
                    <Shuffle size={14} />
                    <span className="hidden sm:inline">自動</span>
                  </button>
                </div>
                <Input label="キャプション（任意）" val={item.caption || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].caption = v; updateBlock(block.id, { items: newItems }); }} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), imageUrl: '', caption: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 画像を追加</button>
          </div>
        );

      case 'linked_content':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="関連コンテンツ" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">レイアウト</label>
              <div className="flex gap-2">
                {[{ value: 'list', label: 'リスト' }, { value: 'grid', label: 'グリッド' }].map((opt) => (
                  <button key={opt.value} onClick={() => updateBlock(block.id, { layout: opt.value })} className={`px-4 py-2 rounded-lg font-medium ${block.data.layout === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">リンク済みコンテンツ</label>
              <div className="space-y-2 mb-3">
                {(block.data.items || []).map((item: any, i: number) => (
                  <LinkedContentCard
                    key={`${item.type}-${item.id}`}
                    contentRef={item as ContentRef}
                    size="sm"
                    onRemove={() => {
                      const newItems = [...(block.data.items || [])];
                      newItems.splice(i, 1);
                      updateBlock(block.id, { items: newItems });
                    }}
                  />
                ))}
              </div>
              <ContentLinker
                contents={userContents}
                loading={contentsLoading}
                onSelect={(ref) => {
                  const newItems = [...(block.data.items || []), ref];
                  updateBlock(block.id, { items: newItems });
                }}
                selectedIds={(block.data.items || []).map((item: any) => item.id)}
                multiple
                compact
              />
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">このブロックタイプの編集はまだサポートされていません</p>;
    }
  };

  // エディター本体のレンダリング
  const renderEditor = () => (
    <div className="space-y-4">
      {/* ステップ1: テンプレート・AI生成セクション */}
      <Section
        title="テンプレート・AI生成"
        icon={Sparkles}
        isOpen={openSections.template}
        onToggle={() => toggleSection('template')}
        step={1}
        stepLabel="テンプレートやAIでLPの下書きを作成（任意）"
        headerBgColor="bg-purple-50"
        headerHoverColor="hover:bg-purple-100"
        accentColor="bg-purple-100 text-purple-600"
      >
        {/* テンプレート選択 */}
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-700 block mb-3">テンプレートから選択</label>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:border-amber-500 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: template.theme.gradient }}
                />
                <div className="text-left flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 block truncate">{template.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 font-semibold">{template.blocks.length}ブロック</span>
                    {template.recommended && <span className="text-xs text-amber-600">おすすめ</span>}
                  </div>
        </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI生成 */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <label className="text-sm font-bold text-amber-700 block mb-2 flex items-center gap-2">
            <Wand2 size={16} /> AIで自動生成
          </label>
          <textarea 
            className="w-full border-2 border-amber-200 p-3 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
            rows={2} 
            placeholder="例: 法人向けWeb制作サービス、パーソナルトレーニングジム..." 
            value={generatePrompt}
            onChange={e => setGeneratePrompt(e.target.value)} 
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !generatePrompt} 
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> 生成中...</> : <><Sparkles size={18} /> AIで自動生成する</>}
          </button>
        </div>
      </Section>

      {/* ステップ2: テーマ設定 */}
      <Section
        title="テーマ設定"
        icon={Palette}
        isOpen={openSections.theme}
        onToggle={() => toggleSection('theme')}
        step={2}
        stepLabel="タイトル・背景デザインを設定"
        headerBgColor="bg-blue-50"
        headerHoverColor="hover:bg-blue-100"
        accentColor="bg-blue-100 text-blue-600"
      >
        <div className="space-y-6">
      {/* 基本設定 */}
        <div className="space-y-4">
            <Input 
              label="LPタイトル" 
              val={lp.title || ''} 
              onChange={(v) => setLp(prev => ({ ...prev, title: v }))} 
              ph="未入力の場合「無題のビジネスLP」になります" 
            />
            <Textarea 
              label="説明文（SEO用）" 
              val={lp.description || ''} 
              onChange={(v) => setLp(prev => ({ ...prev, description: v }))} 
              rows={2} 
            />
          </div>

          {/* グラデーション選択 */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">背景グラデーション</label>
            <div className="grid grid-cols-4 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setLp(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        theme: { 
                          gradient: preset.value, 
                          backgroundImage: undefined,
                        },
                      },
                    }));
                    // プレビューはpostMessageで自動更新されるため、resetPreviewは不要
                  }}
                  className={`p-1 rounded-lg border-2 transition-all ${
                    lp.settings?.theme?.gradient === preset.value 
                      ? 'border-amber-500 ring-2 ring-amber-200' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div 
                    className={`w-full h-12 rounded ${preset.animated ? 'animate-gradient-xy' : ''}`}
                    style={{ background: preset.value, backgroundSize: '400% 400%' }}
                  />
                  <span className="text-xs text-gray-600 block mt-1 text-center">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* カスタムカラー作成ボタン */}
            <div className="mt-4">
              <button
                onClick={() => setShowColorPicker(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Palette size={18} />
                カスタムカラーを作成
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ステップ3: ブロック編集セクション */}
      <Section
        title="ブロック"
        icon={Layout}
        isOpen={openSections.blocks}
        onToggle={() => toggleSection('blocks')}
        badge={`${lp.content?.length || 0}個`}
        step={3}
        stepLabel="コンテンツブロックを追加・編集"
        headerBgColor="bg-orange-50"
        headerHoverColor="hover:bg-orange-100"
        accentColor="bg-orange-100 text-orange-600"
      >
      {/* ブロック一覧 */}
        <div className="space-y-3 min-h-[100px]">
          {(!lp.content || lp.content.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Layout size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">ブロックがありません</p>
              <p className="text-xs mt-1">下のボタンからブロックを追加してください</p>
            </div>
          )}
          {lp.content?.map((block, index) => {
          const blockType = blockTypes.find(bt => bt.type === block.type);
          const Icon = blockType?.icon || Type;

          return (
              <EditorBlockItem
                key={block.id}
                block={block}
                index={index}
                totalBlocks={lp.content?.length || 0}
                blockType={blockType}
                Icon={Icon}
                isExpanded={expandedBlocks.has(block.id)}
                onToggle={() => {
                  setExpandedBlocks(prev => {
                    const next = new Set(prev);
                    if (next.has(block.id)) {
                      next.delete(block.id);
                    } else {
                      next.add(block.id);
                    }
                    return next;
                  });
                }}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                onRemove={() => removeBlock(block.id)}
                renderBlockEditor={renderBlockEditor}
              />
          );
        })}
      </div>

      {/* ブロック追加 */}
        <div className="relative mt-4">
        <button
          onClick={() => setShowBlockSelector(!showBlockSelector)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          ブロックを追加
        </button>

        {showBlockSelector && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 max-h-80 overflow-y-auto">
              {/* ビジネスLP専用ブロック */}
              <p className="text-xs font-bold text-amber-600 mb-2">ビジネスLP専用</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {blockTypes.filter(bt => bt.category === 'business').map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200">
                  <bt.icon size={24} className="text-amber-600" />
                    <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                  </button>
                ))}
              </div>
              {/* 共通ブロック */}
              <p className="text-xs font-bold text-gray-600 mb-2">共通ブロック</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {blockTypes.filter(bt => bt.category === 'common' || bt.category === 'basic').map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <bt.icon size={24} className="text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </Section>

      {/* ステップ4: 高度な設定 */}
      <Section
        title="高度な設定"
        icon={Settings}
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
        step={4}
        stepLabel="各種オプションを設定（任意）"
        headerBgColor="bg-gray-100"
        headerHoverColor="hover:bg-gray-200"
        accentColor="bg-gray-200 text-gray-600"
      >
        <div className="space-y-4">
          {/* ポータル掲載 */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-1">
                  <Star size={18} className="text-amber-600"/> ポータルに掲載する
                </h4>
                <p className="text-xs text-amber-700">
                  ポータルに掲載することで、サービスの紹介およびSEO対策、AI対策として効果的となります。より多くの方にあなたのビジネスLPを見てもらえます。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={lp.settings?.showInPortal === undefined ? true : lp.settings?.showInPortal} 
                  onChange={e => setLp(prev => ({
                    ...prev,
                    settings: { ...prev.settings, showInPortal: e.target.checked }
                  }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* フッター非表示（Proプラン特典） */}
          <div className={`p-4 rounded-xl border ${
            userPlan.canHideCopyright 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${
                  userPlan.canHideCopyright ? 'text-orange-900' : 'text-gray-500'
                }`}>
                  {userPlan.canHideCopyright 
                    ? <Eye size={18} className="text-orange-600"/> 
                    : <Lock size={18} className="text-gray-400"/>
                  }
                  フッターを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    userPlan.canHideCopyright 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>Pro</span>
                </h4>
                <p className={`text-xs ${userPlan.canHideCopyright ? 'text-orange-700' : 'text-gray-500'}`}>
                  コンテンツ下部に表示される「ビジネスLPメーカーで作成しました」のフッターを非表示にします。
                </p>
                {!userPlan.canHideCopyright && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ※ ビジネスプラン以上で利用可能になります
                  </p>
                )}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${
                userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userPlan.canHideCopyright && (lp.settings?.hideFooter || false)} 
                  onChange={e => {
                    if (userPlan.canHideCopyright) {
                      setLp(prev => ({
                        ...prev,
                        settings: { ...prev.settings, hideFooter: e.target.checked }
                      }));
                    }
                  }}
                  disabled={!userPlan.canHideCopyright}
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  userPlan.canHideCopyright 
                    ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-orange-600' 
                    : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
          </div>

          {/* 関連コンテンツ非表示（Proプラン特典） */}
          <div className={`p-4 rounded-xl border ${
            userPlan.canHideCopyright
              ? 'bg-orange-50 border-orange-200'
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${
                  userPlan.canHideCopyright ? 'text-orange-900' : 'text-gray-500'
                }`}>
                  {userPlan.canHideCopyright
                    ? <Eye size={18} className="text-orange-600"/>
                    : <Lock size={18} className="text-gray-400"/>
                  }
                  関連コンテンツを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    userPlan.canHideCopyright
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>Pro</span>
                </h4>
                <p className={`text-xs ${userPlan.canHideCopyright ? 'text-orange-700' : 'text-gray-500'}`}>
                  ページ下部の「他のビジネスLPもチェック」セクションを非表示にします。
                </p>
                {!userPlan.canHideCopyright && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ※ ビジネスプラン以上で利用可能になります
                  </p>
                )}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${
                userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userPlan.canHideCopyright && (lp.settings?.hideRelatedContent || false)}
                  onChange={e => {
                    if (userPlan.canHideCopyright) {
                      setLp(prev => ({
                        ...prev,
                        settings: { ...prev.settings, hideRelatedContent: e.target.checked }
                      }));
                    }
                  }}
                  disabled={!userPlan.canHideCopyright}
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  userPlan.canHideCopyright
                    ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-orange-600'
                    : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* カスタムURL */}
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">
              カスタムURL（任意）
            </label>
            <input 
              className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-amber-500 outline-none bg-white placeholder-gray-400 transition-shadow ${slugError ? 'border-red-400' : 'border-gray-300'} ${initialData?.slug ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={customSlug} 
              onChange={e => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setCustomSlug(val);
                validateCustomSlug(val);
              }} 
              placeholder="my-business-page"
              disabled={!!initialData?.slug}
            />
            {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
            <p className="text-xs text-gray-500 mt-1">
              例: my-business, landing-page-01<br/>
              ※英小文字、数字、ハイフンのみ（3〜20文字）。一度設定すると変更できません。
            </p>
            {customSlug && !slugError && (
              <p className="text-xs text-amber-600 mt-1">
                公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/business/{customSlug}
              </p>
            )}
          </div>

          <hr className="border-gray-200" />
          <Input 
            label="Google Tag Manager ID" 
            val={lp.settings?.gtmId || ''} 
            onChange={(v) => setLp(prev => ({ ...prev, settings: { ...prev.settings, gtmId: v } }))} 
            ph="GTM-XXXXXXX" 
          />
          <Input 
            label="Facebook Pixel ID" 
            val={lp.settings?.fbPixelId || ''} 
            onChange={(v) => setLp(prev => ({ ...prev, settings: { ...prev.settings, fbPixelId: v } }))} 
            ph="1234567890" 
          />
          <Input 
            label="LINE Tag ID" 
            val={lp.settings?.lineTagId || ''} 
            onChange={(v) => setLp(prev => ({ ...prev, settings: { ...prev.settings, lineTagId: v } }))} 
            ph="xxxxx-xxxxx" 
          />
        </div>
      </Section>

      {/* 保存ボタン（下部） */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-amber-700 hover:to-orange-700 transition-all shadow-md text-lg"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} 
          {initialData?.id ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </div>
  );

  // プレビューのレンダリング（iframeを使用するため現在は未使用）
  const renderPreview = () => (
    <div className="h-full overflow-auto">
      <BusinessPreview lp={previewLP} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 成功モーダル */}
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedSlug}
        onClose={() => setShowSuccessModal(false)}
        title="ビジネスLP"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/business/${savedSlug}`}
        contentTitle={lp.title || 'ビジネスLPを作成しました！'}
        theme="amber"
      />

      {/* ヘッダー - 共通ヘッダー(64px)の下に配置 */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'ビジネスLP編集' : 'ビジネスLP新規作成'}
          </h2>
        </div>
        <div className="flex gap-2">
          {/* 保存後に表示：作成完了画面ボタン */}
          {justSavedSlug && (
            <button 
              onClick={() => setShowSuccessModal(true)} 
              className="hidden sm:flex bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-amber-700 hover:to-orange-700 shadow-md text-sm sm:text-base"
            >
              <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {/* 保存後に表示：公開URLボタン */}
          {justSavedSlug && (
            <button 
              onClick={() => {
                window.open(`/business/${justSavedSlug}`, '_blank');
              }} 
              className="hidden sm:flex bg-amber-50 border border-amber-200 text-amber-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:bg-amber-100 text-sm sm:text-base"
            >
              <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-700 shadow-md"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー - 共通ヘッダー(64px) + エディターヘッダー(57px) = 121pxの下に配置 */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${
              activeTab === 'edit' 
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 size={18} /> 編集
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${
              activeTab === 'preview' 
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto">
            {renderEditor()}
          </div>
        </div>

        {/* 右側: リアルタイムプレビュー */}
        {/* PC: position:fixedで右半分に固定（トップヘッダー64px + エディタヘッダー分 = 138px下にオフセット） */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* PC用ヘッダー */}
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">プレビュー</span>
            </div>
            <div className="flex items-center gap-2">
              {/* PC/スマホ切り替え */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button 
                  onClick={() => setPreviewMode('pc')} 
                  className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all ${
                    previewMode === 'pc' 
                      ? 'bg-amber-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="PC表示"
                >
                  <Monitor size={14} />
                  <span className="hidden xl:inline">PC</span>
                </button>
                <button 
                  onClick={() => setPreviewMode('mobile')} 
                  className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all ${
                    previewMode === 'mobile' 
                      ? 'bg-amber-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="スマホ表示"
                >
                  <Smartphone size={14} />
                  <span className="hidden xl:inline">スマホ</span>
                </button>
              </div>
              <button onClick={resetPreview} className="text-gray-400 hover:text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-gray-700">
                <RefreshCw size={14} /> 
                <span className="hidden xl:inline">リセット</span>
              </button>
            </div>
          </div>
          {/* モバイル用ヘッダー */}
          <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <span className="text-white font-bold text-sm">プレビュー</span>
            <div className="flex items-center gap-2">
              {/* PC/スマホ切り替え */}
              <div className="flex bg-gray-800 rounded-lg p-0.5">
                <button 
                  onClick={() => setPreviewMode('pc')} 
                  className={`p-1.5 rounded transition-all ${
                    previewMode === 'pc' 
                      ? 'bg-amber-600 text-white' 
                      : 'text-gray-400'
                  }`}
                  title="PC表示"
                >
                  <Monitor size={14} />
                </button>
                <button 
                  onClick={() => setPreviewMode('mobile')} 
                  className={`p-1.5 rounded transition-all ${
                    previewMode === 'mobile' 
                      ? 'bg-amber-600 text-white' 
                      : 'text-gray-400'
                  }`}
                  title="スマホ表示"
                >
                  <Smartphone size={14} />
                </button>
              </div>
              <button onClick={resetPreview} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-800">
            {/* PC表示: iframeを全幅で表示 - 常にレンダリングしてスクロール位置を維持 */}
            <div className={`w-full h-full bg-white ${previewMode === 'pc' ? '' : 'hidden'}`}>
              <iframe
                ref={pcIframeRef}
                src="/business/preview"
                className="w-full h-full border-0"
                title="PCプレビュー"
              />
            </div>
            {/* スマホ表示: iframeを使用して正確なレスポンシブを再現 - 常にレンダリングしてスクロール位置を維持 */}
            <div className={`p-4 h-full flex items-center justify-center ${previewMode === 'mobile' ? '' : 'hidden'}`}>
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl" style={{ width: '390px' }}>
                {/* iPhone風フレーム */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10 pointer-events-none" />
                <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '375px', height: '667px' }}>
                  <iframe
                    ref={mobileIframeRef}
                    src="/business/preview"
                    className="w-full h-full border-0"
                    style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                    title="スマホプレビュー"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* PC用：右側のfixed領域分のスペーサー（背景色を左側と揃える） */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
        </div>

        {/* カスタムカラーピッカーモーダル */}
        <CustomColorPicker
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          onApply={(value, isAnimated) => {
            setLp(prev => ({
              ...prev,
              settings: {
                ...prev.settings,
                theme: {
                  gradient: value,
                  animated: isAnimated ?? false,
                  backgroundImage: undefined,
                },
              },
            }));
          }}
          accentColor="amber"
          userId={user?.id}
        />

        {/* はじめかたガイド */}
        {showOnboarding && (
          <OnboardingModal
            storageKey="business_editor_onboarding_dismissed"
            title="ビジネスLPエディタの使い方"
            pages={[
              {
                subtitle: 'エディタの基本',
                items: [
                  { icon: Layout, iconColor: 'blue', title: '左 = セクション設定 / 右 = ライブプレビュー', description: '左側の折りたたみセクションで編集し、右側でリアルタイムプレビューを確認できます。PC/モバイル切替にも対応しています。' },
                  { icon: Sparkles, iconColor: 'amber', title: 'テンプレートから始める', description: 'ビジネスLP専用テンプレートを選択すると、ブロック構成とデザインが自動配置されます。' },
                  { icon: Wand2, iconColor: 'purple', title: 'AI一括生成', description: '業種やサービス内容を入力するだけで、AIがLP全体を自動生成します（クレジット消費）。' },
                ],
              },
              {
                subtitle: 'ブロックの種類',
                items: [
                  { icon: Zap, iconColor: 'blue', title: 'ヒーロー・ファーストビュー', description: '「ヒーロー」「フルワイドヒーロー」でインパクトのあるメインビジュアルを配置できます。' },
                  { icon: Star, iconColor: 'amber', title: '特徴・ベネフィット', description: '「特徴」ブロックでサービスの強みを3列カードで表示。「問題提起」で顧客の悩みを可視化します。' },
                  { icon: Target, iconColor: 'red', title: 'CTAセクション', description: '「CTAセクション」でコンバージョンポイントを配置。ボタンテキストやリンクを設定します。' },
                  { icon: Users, iconColor: 'teal', title: '事例・お客様の声', description: '「事例紹介」「お客様の声」で信頼性を向上。「チェックリスト」で含まれるものを一覧表示できます。' },
                ],
              },
              {
                subtitle: 'デザインと公開',
                items: [
                  { icon: Palette, iconColor: 'purple', title: 'テーマ・カラー設定', description: '「テーマ設定」セクションで背景グラデーションやカラーパレットを変更できます。8種類のプリセットから選べます。' },
                  { icon: Lock, iconColor: 'red', title: 'AI利用の残り回数', description: 'AI機能はクレジットを消費します。残り回数はプラン情報で確認でき、毎日リセットされます。' },
                  { icon: ExternalLink, iconColor: 'green', title: '公開と共有', description: '保存後URLをコピーして共有。ポータルにも掲載でき、SEO対策にもなります。' },
                ],
              },
            ]}
            gradientFrom="from-blue-600"
            gradientTo="to-indigo-600"
            onDismiss={() => setShowOnboarding(false)}
          />
        )}
        </div>
      );
};

// エディタ用ブロックアイテム（展開時にスクロール）
function EditorBlockItem({
  block,
  index,
  totalBlocks,
  blockType,
  Icon,
  isExpanded,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  renderBlockEditor,
}: {
  block: Block;
  index: number;
  totalBlocks: number;
  blockType: { label: string; type: string; color?: { bg: string; border: string; text: string; icon: string; hover: string } } | undefined;
  Icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  renderBlockEditor: (block: Block) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    const wasCollapsed = !isExpanded;
    onToggle();
    if (wasCollapsed && ref.current) {
      setTimeout(() => {
        const el = ref.current;
        if (!el) return;
        // overflow-y-auto のスクロールコンテナを探す
        let scrollParent = el.parentElement;
        while (scrollParent && getComputedStyle(scrollParent).overflowY !== 'auto') {
          scrollParent = scrollParent.parentElement;
        }
        if (scrollParent) {
          const elRect = el.getBoundingClientRect();
          const containerRect = scrollParent.getBoundingClientRect();
          const offset = elRect.top - containerRect.top + scrollParent.scrollTop - 12;
          scrollParent.scrollTo({ top: offset, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [isExpanded, onToggle]);

  return (
    <div ref={ref} className={`rounded-xl border overflow-hidden ${blockType?.color?.border || 'border-gray-200'} ${blockType?.color?.bg || 'bg-gray-50'}`}>
      <div
        className={`w-full flex items-center justify-between p-4 cursor-pointer ${blockType?.color?.hover || 'hover:bg-gray-100'}`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          <GripVertical size={18} className="text-gray-400" />
          <Icon size={18} className={blockType?.color?.icon || 'text-amber-600'} />
          <span className={`font-medium ${blockType?.color?.text || 'text-gray-700'}`}>
            {blockType?.label || block.type}
          </span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onMoveUp} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp size={16} /></button>
          <button onClick={onMoveDown} disabled={index === totalBlocks - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown size={16} /></button>
          <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
          <button onClick={handleToggle} className="p-1 text-gray-400">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {renderBlockEditor(block)}
        </div>
      )}
    </div>
  );
}

export default BusinessEditor;
