'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Site, SitePage, Block, generateBlockId } from '@/lib/types';
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
  Target,
  Youtube,
  Mail,
  ExternalLink,
  Settings,
  ArrowUp,
  ArrowDown,
  Globe,
  FileText,
  Home,
  Menu,
  LayoutGrid,
  Copy,
  Check,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Timer,
  Images,
  Link2,
  Layout,
  Sparkles,
  Trophy,
  Star,
  Lock,
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import { usePoints } from '@/lib/hooks/usePoints';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface SiteEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean | '' | undefined;
  initialData?: Site | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

// サイトで使用可能なブロックタイプ
const blockTypes = [
  { type: 'hero', label: 'ヒーロー', icon: Zap, description: 'メインビジュアル', color: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', hover: 'hover:bg-cyan-100' } },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'テキストカード', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション', color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'features', label: '特徴・強み', icon: LayoutGrid, description: '3〜4カラムの特徴紹介', color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', hover: 'hover:bg-blue-100' } },
  { type: 'youtube', label: '動画', icon: Youtube, description: 'YouTube / Vimeo', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'testimonial', label: 'お客様の声', icon: MessageCircle, description: 'テスティモニアル', color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100' } },
  { type: 'pricing', label: '料金表', icon: DollarSign, description: 'プラン比較', color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100' } },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'cta_section', label: 'CTAセクション', icon: Target, description: '行動喚起ボタン', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'google_map', label: 'Googleマップ', icon: MapPin, description: 'アクセス地図', color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', hover: 'hover:bg-green-100' } },
  { type: 'gallery', label: 'ギャラリー', icon: Images, description: '写真ギャラリー', color: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', icon: 'text-pink-500', hover: 'hover:bg-pink-100' } },
  { type: 'links', label: 'リンク集', icon: LinkIcon, description: 'リンクボタン一覧', color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' } },
  { type: 'lead_form', label: 'お問い合わせ', icon: Mail, description: 'フォーム', color: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', hover: 'hover:bg-cyan-100' } },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: 'タイマー', color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'linked_content', label: '関連コンテンツ', icon: Link2, description: '他ツールとの連携', color: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', hover: 'hover:bg-teal-100' } },
];

// テンプレート定義
const siteTemplates = [
  {
    id: 'store',
    name: '店舗サイト',
    description: 'メニュー・アクセス・予約が揃った店舗向け',
    icon: '🏪',
    gradient: 'from-neutral-800 to-neutral-950',
    bgLight: 'bg-neutral-50',
    textColor: 'text-neutral-700',
    borderColor: 'border-neutral-200',
    hoverBorder: 'hover:border-neutral-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'お店の名前', subheadline: 'キャッチコピーを入力してください', buttonText: '席を予約する', buttonUrl: '#contact' } },
        { id: generateBlockId(), type: 'text_card', data: { title: 'Our Philosophy', text: 'お店のコンセプトや想いをここに書きましょう。どんな体験を届けたいか、こだわりのポイントを伝えましょう。', align: 'center' } },
        { id: generateBlockId(), type: 'features', data: { title: 'What Makes Us Special', items: [{ icon: '✨', title: '特徴1', description: 'あなたのお店ならではの強みを記載' }, { icon: '🎯', title: '特徴2', description: 'こだわりのポイントを記載' }, { icon: '💎', title: '特徴3', description: '他店との違いを記載' }] } },
        { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      ] as unknown as Block[] },
      { slug: 'menu', title: 'メニュー', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Menu', text: 'サービスメニューやおすすめ商品をご紹介します。', align: 'center' } },
        { id: generateBlockId(), type: 'pricing', data: { title: 'メニュー', plans: [{ name: 'ベーシック', price: '¥3,000', features: ['基本サービス', '所要時間30分'], recommended: false }, { name: 'スタンダード', price: '¥5,000', features: ['基本+応用サービス', '所要時間60分', 'アフターケア付き'], recommended: true }] } },
      ] as unknown as Block[] },
      { slug: 'access', title: 'アクセス', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Access', text: '住所・営業時間・最寄り駅を記載してください。', align: 'left' } },
        { id: generateBlockId(), type: 'google_map', data: { address: '', embedUrl: '' } },
      ] as unknown as Block[] },
      { slug: 'contact', title: 'お問い合わせ', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Contact', text: 'ご予約・お問い合わせはお気軽にどうぞ。', align: 'center' } },
        { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせフォーム', buttonText: '送信する' } },
      ] as unknown as Block[] },
    ],
  },
  {
    id: 'instructor',
    name: '講師・コンサル',
    description: 'プロフィール・サービス・実績を紹介',
    icon: '👨‍🏫',
    gradient: 'from-zinc-800 to-zinc-950',
    bgLight: 'bg-zinc-50',
    textColor: 'text-zinc-700',
    borderColor: 'border-zinc-200',
    hoverBorder: 'hover:border-zinc-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'あなたの名前', subheadline: '肩書き — あなたの専門分野やミッションを一言で', buttonText: '無料相談を予約する', buttonUrl: '#contact' } },
        { id: generateBlockId(), type: 'text_card', data: { title: 'About', text: 'あなたの経歴・実績・想いを書きましょう。クライアントに信頼感を与える自己紹介がポイントです。', align: 'left' } },
        { id: generateBlockId(), type: 'youtube', data: { url: '' } },
        { id: generateBlockId(), type: 'testimonial', data: { title: 'Client Voice', items: [{ name: 'A様', role: '業種・役職', comment: '具体的な成果やエピソードを記載しましょう。', image: '' }] } },
      ] as unknown as Block[] },
      { slug: 'service', title: 'サービス', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Service', text: '提供しているサービスをご紹介します。', align: 'center' } },
        { id: generateBlockId(), type: 'features', data: { title: 'サービスの特長', items: [{ icon: '📚', title: 'セミナー・研修', description: '対象者と内容を記載' }, { icon: '💼', title: 'アドバイザリー', description: '支援内容と特長を記載' }, { icon: '📝', title: 'プロジェクト型支援', description: '期間やスコープを記載' }] } },
        { id: generateBlockId(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: 'Seminar', price: '¥15,000', features: ['セミナー時間', '資料付き', '質疑応答'], recommended: false }, { name: 'Advisory', price: '¥50,000/月', features: ['月2回面談', 'チャット相談無制限', '月次レポート作成'], recommended: true }] } },
      ] as unknown as Block[] },
      { slug: 'works', title: '実績', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Track Record', text: 'これまでの支援実績や活動をご紹介します。', align: 'center' } },
        { id: generateBlockId(), type: 'gallery', data: { items: [] } },
      ] as unknown as Block[] },
      { slug: 'contact', title: 'お問い合わせ', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Free Consultation', text: '初回無料相談を実施しています。お気軽にご連絡ください。', align: 'center' } },
        { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせ', buttonText: '無料相談を申し込む' } },
      ] as unknown as Block[] },
    ],
  },
  {
    id: 'freelance',
    name: 'フリーランス',
    description: 'ポートフォリオ・スキル・料金をまとめたサイト',
    icon: '💻',
    gradient: 'from-slate-800 to-slate-950',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'あなたの屋号 / 名前', subheadline: '専門分野 — あなたの価値を一言で伝えるキャッチコピー', buttonText: 'プロジェクトを相談する', buttonUrl: '#contact' } },
        { id: generateBlockId(), type: 'text_card', data: { title: 'About', text: 'あなたの経歴・スキル・大切にしていることを書きましょう。', align: 'left' } },
        { id: generateBlockId(), type: 'features', data: { title: 'Skills & Services', items: [{ icon: '🎨', title: 'スキル1', description: '得意な分野と具体的な対応内容' }, { icon: '💻', title: 'スキル2', description: '得意な分野と具体的な対応内容' }, { icon: '📱', title: 'スキル3', description: '得意な分野と具体的な対応内容' }] } },
        { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      ] as unknown as Block[] },
      { slug: 'works', title: '制作実績', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Selected Works', text: 'これまでに手がけたプロジェクトをご紹介します。', align: 'center' } },
        { id: generateBlockId(), type: 'gallery', data: { items: [] } },
      ] as unknown as Block[] },
      { slug: 'pricing', title: '料金', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Pricing', text: '目安の料金です。プロジェクト内容に応じてお見積りいたします。', align: 'center' } },
        { id: generateBlockId(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: 'Light', price: '¥100,000〜', features: ['LP / シングルページ', 'レスポンシブ対応', '納期：約2週間'], recommended: false }, { name: 'Standard', price: '¥300,000〜', features: ['複数ページサイト', 'デザインシステム構築', '公開後1ヶ月サポート'], recommended: true }] } },
      ] as unknown as Block[] },
      { slug: 'contact', title: 'お問い合わせ', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'Get in Touch', text: 'プロジェクトのご相談はお気軽にどうぞ。', align: 'center' } },
        { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせフォーム', buttonText: '相談する' } },
      ] as unknown as Block[] },
    ],
  },
  {
    id: 'blank',
    name: '白紙から作成',
    description: '自由にページ構成を設計',
    icon: '📄',
    gradient: 'from-gray-400 to-gray-600',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    hoverBorder: 'hover:border-gray-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'サイトタイトル', subheadline: 'サブタイトルを入力', buttonText: '', buttonUrl: '' } },
      ] as unknown as Block[] },
    ],
  },
];

// セクションコンポーネント（BusinessEditorと同じ構造）
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
  accentColor = 'bg-cyan-100 text-cyan-600'
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

// 入力コンポーネント（BusinessEditorと同じ構造、色のみcyan）
const Input = ({label, val, onChange, ph, disabled = false}: {label: string, val: string, onChange: (v: string) => void, ph?: string, disabled?: boolean}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input
      className={`w-full border border-gray-300 p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-cyan-500 outline-none bg-white placeholder-gray-400 transition-shadow ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      rows={rows}
      value={val || ''}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default function SiteEditor({ user, isAdmin, initialData, setPage, onBack, setShowAuth }: SiteEditorProps) {
  const { userPlan } = useUserPlan(user?.id);
  const isPro = userPlan?.isProUser ?? false;
  const { canAfford } = usePoints({ userId: user?.id, isPro });
  const { showOnboarding, setShowOnboarding } = useOnboarding('site_editor_onboarding_dismissed', { skip: !!initialData });

  // サイト基本情報
  const [site, setSite] = useState<Partial<Site>>({
    title: '',
    description: '',
    logo_url: '',
    settings: { navStyle: 'top', theme: { primaryColor: '#0891b2' } },
    status: 'draft',
  });

  // ページ管理
  const [pages, setPages] = useState<Partial<SitePage>[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [showBlockSelector, setShowBlockSelector] = useState(false);

  // UI状態
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [savedSlug, setSavedSlug] = useState('');
  const [justSavedSlug, setJustSavedSlug] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState({
    template: !initialData,
    siteSettings: true,
    pages: true,
    blocks: true,
    advanced: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(s => ({ ...s, [key]: !s[key] }));
  };

  // 初期データ読み込み
  useEffect(() => {
    if (initialData) {
      setSite({
        id: initialData.id,
        title: initialData.title,
        description: initialData.description,
        logo_url: initialData.logo_url,
        settings: initialData.settings || { navStyle: 'top', theme: { primaryColor: '#0891b2' } },
        status: initialData.status,
        slug: initialData.slug,
      });
      if (initialData.pages && initialData.pages.length > 0) {
        setPages(initialData.pages);
      }
      setSavedSlug(initialData.slug);
      setJustSavedSlug(initialData.slug);
    }
  }, [initialData]);

  // テンプレート選択
  const applyTemplate = (templateId: string) => {
    const template = siteTemplates.find(t => t.id === templateId);
    if (!template) return;

    const templatePages = template.pages.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      is_home: p.is_home,
      show_in_nav: true,
      content: p.content,
      sort_order: i,
    }));

    setPages(templatePages);
    if (template.id !== 'blank') {
      setSite(prev => ({ ...prev, title: template.name + 'サイト' }));
    }
    setOpenSections(s => ({ ...s, template: false, siteSettings: true, pages: true, blocks: true }));
    setActivePageIndex(0);
  };

  // 現在のページ
  const currentPage = pages[activePageIndex];

  // ブロック操作
  const updateBlock = useCallback((blockId: string, newData: Record<string, unknown>) => {
    setPages(prev => prev.map((page, i) => {
      if (i !== activePageIndex) return page;
      return {
        ...page,
        content: (page.content || []).map(block =>
          block.id === blockId ? { ...block, data: { ...(block as { data: Record<string, unknown> }).data, ...newData } } : block
        ) as Block[],
      };
    }));
    setPreviewKey(k => k + 1);
  }, [activePageIndex]);

  const createDefaultBlock = (type: string): Block => {
    const id = generateBlockId();
    switch (type) {
      case 'hero':
        return { id, type: 'hero', data: { headline: 'キャッチコピーを入力', subheadline: 'サブテキスト', ctaText: '詳しく見る', ctaUrl: '#', backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' } };
      case 'features':
        return { id, type: 'features', data: { title: '選ばれる3つの理由', columns: 3 as const, items: [{ id: generateBlockId(), icon: '🏆', title: '特徴1', description: '説明文' }, { id: generateBlockId(), icon: '🤝', title: '特徴2', description: '説明文' }, { id: generateBlockId(), icon: '📊', title: '特徴3', description: '説明文' }] } };
      case 'two_column':
        return { id, type: 'two_column', data: { layout: 'image-left' as const, imageUrl: '', title: 'タイトル', text: 'テキストを入力' } };
      case 'cta_section':
        return { id, type: 'cta_section', data: { title: '今すぐ始めましょう', description: 'お気軽にお問い合わせください', buttonText: 'お問い合わせ', buttonUrl: '#', backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } };
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
      case 'google_map':
        return { id, type: 'google_map', data: { address: '', title: '所在地', embedUrl: '', height: '400px' } };
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

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    setPages(prev => prev.map((page, i) => {
      if (i !== activePageIndex) return page;
      return { ...page, content: [...(page.content || []), newBlock] };
    }));
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]));
    setShowBlockSelector(false);
    setPreviewKey(k => k + 1);
  };

  const removeBlock = (blockId: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setPages(prev => prev.map((page, i) => {
      if (i !== activePageIndex) return page;
      return { ...page, content: (page.content || []).filter(b => b.id !== blockId) };
    }));
    setPreviewKey(k => k + 1);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setPages(prev => prev.map((page, i) => {
      if (i !== activePageIndex) return page;
      const blocks = [...(page.content || [])];
      const idx = blocks.findIndex(b => b.id === blockId);
      if (idx < 0) return page;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= blocks.length) return page;
      [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
      return { ...page, content: blocks };
    }));
    setPreviewKey(k => k + 1);
  };

  // ページ操作
  const addPage = () => {
    const newPage: Partial<SitePage> = {
      slug: `page-${Date.now()}`,
      title: '新しいページ',
      is_home: false,
      show_in_nav: true,
      content: [],
      sort_order: pages.length,
    };
    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length);
  };

  const removePage = (index: number) => {
    if (pages[index]?.is_home) {
      alert('トップページは削除できません');
      return;
    }
    if (!confirm(`「${pages[index]?.title}」を削除しますか？`)) return;
    setPages(prev => prev.filter((_, i) => i !== index));
    if (activePageIndex >= index && activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const updatePageMeta = (index: number, field: string, value: unknown) => {
    setPages(prev => prev.map((page, i) => {
      if (i !== index) return page;
      return { ...page, [field]: value };
    }));
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= pages.length) return;
    setPages(prev => {
      const arr = [...prev];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return arr.map((p, i) => ({ ...p, sort_order: i }));
    });
    setActivePageIndex(newIdx);
  };

  // 保存
  const handleSave = async () => {
    if (!supabase) return;
    if (!site.title?.trim()) {
      alert('サイト名を入力してください');
      return;
    }
    if (pages.length === 0) {
      alert('ページを1つ以上作成してください');
      return;
    }

    setIsSaving(true);
    try {
      const isNew = !site.id;
      const slug = site.slug || generateSlug();

      if (isNew && user && !isPro) {
        const affordable = await canAfford('site', 'save');
        if (!affordable) {
          alert('ポイントが不足しています');
          setIsSaving(false);
          return;
        }
      }

      if (isNew) {
        const { data: siteDataArr, error: siteError } = await supabase
          .from('sites')
          .insert({
            title: site.title,
            description: site.description || '',
            logo_url: site.logo_url || '',
            settings: site.settings || {},
            status: 'published',
            slug,
            user_id: user?.id,
          })
          .select();

        if (siteError) throw new Error(siteError.message || 'データベースエラー');
        const siteData = siteDataArr?.[0];
        if (!siteData) throw new Error('サイトデータの取得に失敗しました');

        const pageInserts = pages.map((p, i) => ({
          site_id: siteData.id,
          slug: p.slug || `page-${i}`,
          title: p.title || '無題のページ',
          description: p.description || '',
          content: p.content || [],
          sort_order: i,
          is_home: p.is_home || false,
          show_in_nav: p.show_in_nav !== false,
          icon: p.icon || '',
        }));

        const { error: pagesError } = await supabase
          .from('site_pages')
          .insert(pageInserts);

        if (pagesError) throw new Error(pagesError.message || 'ページ保存エラー');

        setSite(prev => ({ ...prev, id: siteData.id, slug }));
        setSavedSlug(slug);
        setJustSavedSlug(slug);
        setShowComplete(true);
        window.history.replaceState({}, '', `/site/editor?id=${slug}`);
      } else {
        const { error: siteError } = await supabase
          .from('sites')
          .update({
            title: site.title,
            description: site.description || '',
            logo_url: site.logo_url || '',
            settings: site.settings || {},
            status: 'published',
          })
          .eq('id', site.id);

        if (siteError) throw new Error(siteError.message || 'データベースエラー');

        await supabase.from('site_pages').delete().eq('site_id', site.id);

        const pageInserts = pages.map((p, i) => ({
          site_id: site.id,
          slug: p.slug || `page-${i}`,
          title: p.title || '無題のページ',
          description: p.description || '',
          content: p.content || [],
          sort_order: i,
          is_home: p.is_home || false,
          show_in_nav: p.show_in_nav !== false,
          icon: p.icon || '',
        }));

        const { error: pagesError } = await supabase
          .from('site_pages')
          .insert(pageInserts);

        if (pagesError) throw new Error(pagesError.message || 'ページ保存エラー');

        alert('更新しました');
      }

      try {
        await fetch(`/api/revalidate?path=/site/${slug}`);
      } catch {}

    } catch (err) {
      console.error('Save error:', err);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 公開URLコピー
  const copyUrl = () => {
    const url = `${window.location.origin}/site/${savedSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ブロックエディタ
  const renderBlockEditor = (block: Block) => {
    const data = (block as { data: Record<string, unknown> }).data || {};

    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <Input label="見出し" val={(data.headline as string) || ''} onChange={v => updateBlock(block.id, { headline: v })} ph="メインの見出し" />
            <Input label="サブ見出し" val={(data.subheadline as string) || ''} onChange={v => updateBlock(block.id, { subheadline: v })} ph="サブテキスト" />
            <Input label="ボタンテキスト" val={(data.buttonText as string) || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="例: 詳しく見る" />
            <Input label="ボタンリンク" val={(data.buttonUrl as string) || ''} onChange={v => updateBlock(block.id, { buttonUrl: v })} ph="https://..." />
            <Input label="背景画像URL" val={(data.backgroundImage as string) || ''} onChange={v => updateBlock(block.id, { backgroundImage: v })} ph="画像URLを入力" />
          </div>
        );

      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            <Textarea label="テキスト" val={(data.text as string) || ''} onChange={v => updateBlock(block.id, { text: v })} rows={5} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">配置</label>
              <select
                value={(data.align as string) || 'left'}
                onChange={e => updateBlock(block.id, { align: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
              >
                <option value="left">左寄せ</option>
                <option value="center">中央</option>
              </select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <Input label="画像URL" val={(data.url as string) || ''} onChange={v => updateBlock(block.id, { url: v })} ph="https://..." />
            <Input label="キャプション" val={(data.caption as string) || ''} onChange={v => updateBlock(block.id, { caption: v })} />
            <Input label="代替テキスト" val={(data.alt as string) || ''} onChange={v => updateBlock(block.id, { alt: v })} />
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            {((data.items as Array<{ icon: string; title: string; description: string }>) || []).map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">特徴 {idx + 1}</span>
                  <button onClick={() => {
                    const items = [...((data.items as Array<unknown>) || [])];
                    items.splice(idx, 1);
                    updateBlock(block.id, { items });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <Input label="アイコン" val={item.icon} onChange={v => {
                  const items = [...((data.items as Array<{ icon: string; title: string; description: string }>) || [])];
                  items[idx] = { ...items[idx], icon: v };
                  updateBlock(block.id, { items });
                }} ph="絵文字 例: ✨" />
                <Input label="タイトル" val={item.title} onChange={v => {
                  const items = [...((data.items as Array<{ icon: string; title: string; description: string }>) || [])];
                  items[idx] = { ...items[idx], title: v };
                  updateBlock(block.id, { items });
                }} />
                <Input label="説明" val={item.description} onChange={v => {
                  const items = [...((data.items as Array<{ icon: string; title: string; description: string }>) || [])];
                  items[idx] = { ...items[idx], description: v };
                  updateBlock(block.id, { items });
                }} />
              </div>
            ))}
            <button
              onClick={() => {
                const items = [...((data.items as Array<unknown>) || []), { icon: '⭐', title: '', description: '' }];
                updateBlock(block.id, { items });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
            >
              <Plus size={16} className="inline mr-1" /> 特徴を追加
            </button>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <Input label="動画URL" val={(data.url as string) || ''} onChange={v => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." />
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            {((data.items as Array<{ name: string; role: string; comment: string; image: string }>) || []).map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">お客様 {idx + 1}</span>
                  <button onClick={() => {
                    const items = [...((data.items as Array<unknown>) || [])];
                    items.splice(idx, 1);
                    updateBlock(block.id, { items });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <Input label="お名前" val={item.name} onChange={v => {
                  const items = [...((data.items as Array<{ name: string; role: string; comment: string; image: string }>) || [])];
                  items[idx] = { ...items[idx], name: v };
                  updateBlock(block.id, { items });
                }} />
                <Input label="肩書き" val={item.role} onChange={v => {
                  const items = [...((data.items as Array<{ name: string; role: string; comment: string; image: string }>) || [])];
                  items[idx] = { ...items[idx], role: v };
                  updateBlock(block.id, { items });
                }} />
                <Textarea label="コメント" val={item.comment} onChange={v => {
                  const items = [...((data.items as Array<{ name: string; role: string; comment: string; image: string }>) || [])];
                  items[idx] = { ...items[idx], comment: v };
                  updateBlock(block.id, { items });
                }} rows={3} />
              </div>
            ))}
            <button
              onClick={() => {
                const items = [...((data.items as Array<unknown>) || []), { name: '', role: '', comment: '', image: '' }];
                updateBlock(block.id, { items });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
            >
              <Plus size={16} className="inline mr-1" /> お客様の声を追加
            </button>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            {((data.plans as Array<{ name: string; price: string; features: string[]; recommended: boolean }>) || []).map((plan, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">プラン {idx + 1}</span>
                  <button onClick={() => {
                    const plans = [...((data.plans as Array<unknown>) || [])];
                    plans.splice(idx, 1);
                    updateBlock(block.id, { plans });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <Input label="プラン名" val={plan.name} onChange={v => {
                  const plans = [...((data.plans as Array<{ name: string; price: string; features: string[]; recommended: boolean }>) || [])];
                  plans[idx] = { ...plans[idx], name: v };
                  updateBlock(block.id, { plans });
                }} />
                <Input label="価格" val={plan.price} onChange={v => {
                  const plans = [...((data.plans as Array<{ name: string; price: string; features: string[]; recommended: boolean }>) || [])];
                  plans[idx] = { ...plans[idx], price: v };
                  updateBlock(block.id, { plans });
                }} />
                <Textarea label="特徴（1行に1つ）" val={(plan.features || []).join('\n')} onChange={v => {
                  const plans = [...((data.plans as Array<{ name: string; price: string; features: string[]; recommended: boolean }>) || [])];
                  plans[idx] = { ...plans[idx], features: v.split('\n').filter(Boolean) };
                  updateBlock(block.id, { plans });
                }} rows={4} />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={plan.recommended}
                    onChange={e => {
                      const plans = [...((data.plans as Array<{ name: string; price: string; features: string[]; recommended: boolean }>) || [])];
                      plans[idx] = { ...plans[idx], recommended: e.target.checked };
                      updateBlock(block.id, { plans });
                    }}
                    className="rounded border-gray-300 text-cyan-600"
                  />
                  おすすめプラン
                </label>
              </div>
            ))}
            <button
              onClick={() => {
                const plans = [...((data.plans as Array<unknown>) || []), { name: '', price: '', features: [], recommended: false }];
                updateBlock(block.id, { plans });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
            >
              <Plus size={16} className="inline mr-1" /> プランを追加
            </button>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            {((data.items as Array<{ question: string; answer: string }>) || []).map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Q{idx + 1}</span>
                  <button onClick={() => {
                    const items = [...((data.items as Array<unknown>) || [])];
                    items.splice(idx, 1);
                    updateBlock(block.id, { items });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <Input label="質問" val={item.question} onChange={v => {
                  const items = [...((data.items as Array<{ question: string; answer: string }>) || [])];
                  items[idx] = { ...items[idx], question: v };
                  updateBlock(block.id, { items });
                }} />
                <Textarea label="回答" val={item.answer} onChange={v => {
                  const items = [...((data.items as Array<{ question: string; answer: string }>) || [])];
                  items[idx] = { ...items[idx], answer: v };
                  updateBlock(block.id, { items });
                }} rows={3} />
              </div>
            ))}
            <button
              onClick={() => {
                const items = [...((data.items as Array<unknown>) || []), { question: '', answer: '' }];
                updateBlock(block.id, { items });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
            >
              <Plus size={16} className="inline mr-1" /> FAQを追加
            </button>
          </div>
        );

      case 'cta_section':
        return (
          <div className="space-y-4">
            <Input label="見出し" val={(data.headline as string) || ''} onChange={v => updateBlock(block.id, { headline: v })} />
            <Input label="説明文" val={(data.description as string) || ''} onChange={v => updateBlock(block.id, { description: v })} />
            <Input label="ボタンテキスト" val={(data.buttonText as string) || ''} onChange={v => updateBlock(block.id, { buttonText: v })} />
            <Input label="ボタンリンク" val={(data.buttonUrl as string) || ''} onChange={v => updateBlock(block.id, { buttonUrl: v })} />
          </div>
        );

      case 'google_map':
        return (
          <div className="space-y-4">
            <Input label="住所" val={(data.address as string) || ''} onChange={v => updateBlock(block.id, { address: v })} ph="東京都渋谷区..." />
            <Textarea label="Google Maps 埋め込みURL" val={(data.embedUrl as string) || ''} onChange={v => updateBlock(block.id, { embedUrl: v })} rows={2} />
            <p className="text-xs text-gray-500">Google Mapsで「共有」→「地図を埋め込む」からiframeのsrc URLを貼り付けてください</p>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            {((data.items as Array<{ url: string; caption: string }>) || []).map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">画像 {idx + 1}</span>
                  <button onClick={() => {
                    const items = [...((data.items as Array<unknown>) || [])];
                    items.splice(idx, 1);
                    updateBlock(block.id, { items });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <Input label="画像URL" val={item.url} onChange={v => {
                  const items = [...((data.items as Array<{ url: string; caption: string }>) || [])];
                  items[idx] = { ...items[idx], url: v };
                  updateBlock(block.id, { items });
                }} />
                <Input label="キャプション" val={item.caption} onChange={v => {
                  const items = [...((data.items as Array<{ url: string; caption: string }>) || [])];
                  items[idx] = { ...items[idx], caption: v };
                  updateBlock(block.id, { items });
                }} />
              </div>
            ))}
            <button
              onClick={() => {
                const items = [...((data.items as Array<unknown>) || []), { url: '', caption: '' }];
                updateBlock(block.id, { items });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
            >
              <Plus size={16} className="inline mr-1" /> 画像を追加
            </button>
          </div>
        );

      case 'links':
        return (
          <div className="space-y-4">
            {((data.links as Array<{ label: string; url: string }>) || []).map((link, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">リンク {idx + 1}</span>
                  <button onClick={() => {
                    const links = [...((data.links as Array<unknown>) || [])];
                    links.splice(idx, 1);
                    updateBlock(block.id, { links });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <Input label="ラベル" val={link.label} onChange={v => {
                  const links = [...((data.links as Array<{ label: string; url: string }>) || [])];
                  links[idx] = { ...links[idx], label: v };
                  updateBlock(block.id, { links });
                }} />
                <Input label="URL" val={link.url} onChange={v => {
                  const links = [...((data.links as Array<{ label: string; url: string }>) || [])];
                  links[idx] = { ...links[idx], url: v };
                  updateBlock(block.id, { links });
                }} />
              </div>
            ))}
            <button
              onClick={() => {
                const links = [...((data.links as Array<unknown>) || []), { label: '', url: '' }];
                updateBlock(block.id, { links });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
            >
              <Plus size={16} className="inline mr-1" /> リンクを追加
            </button>
          </div>
        );

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            <Input label="ボタンテキスト" val={(data.buttonText as string) || ''} onChange={v => updateBlock(block.id, { buttonText: v })} />
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(data.title as string) || ''} onChange={v => updateBlock(block.id, { title: v })} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">終了日時</label>
              <input
                type="datetime-local"
                value={(data.endDate as string) || ''}
                onChange={e => updateBlock(block.id, { endDate: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
              />
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">このブロックのエディタは準備中です</p>;
    }
  };

  // エディタ部分のレンダリング（BusinessEditorのrenderEditor()パターン）
  const renderEditor = () => (
    <div>
      {/* STEP 1: テンプレート選択 */}
      <Section
        title="テンプレート選択"
        icon={Sparkles}
        isOpen={openSections.template}
        onToggle={() => toggleSection('template')}
        step={1}
        stepLabel="テンプレートを選んでサイトの下書きを作成（任意）"
        headerBgColor="bg-purple-50"
        headerHoverColor="hover:bg-purple-100"
        accentColor="bg-purple-100 text-purple-600"
      >
        <div className="mb-4">
          <label className="text-sm font-bold text-gray-700 block mb-3">テンプレートから選択</label>
          <div className="grid grid-cols-2 gap-3">
          {siteTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => {
                if (pages.length > 0) {
                  const confirmed = confirm(`「${template.name}」テンプレートを適用しますか？\n現在のページ構成は上書きされます。`);
                  if (!confirmed) return;
                }
                applyTemplate(template.id);
              }}
              className={`group text-left p-4 rounded-xl border ${template.borderColor} ${template.bgLight} ${template.hoverBorder} hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm`}>
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold ${template.textColor} truncate`}>{template.name}</h4>
                  <p className="text-xs text-cyan-600 font-semibold">{template.pages.length}ページ</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
            </button>
          ))}
        </div>
        </div>
      </Section>

      {/* STEP 2: サイト設定 */}
      <Section
        title="サイト設定"
        icon={Settings}
        isOpen={openSections.siteSettings}
        onToggle={() => toggleSection('siteSettings')}
        step={2}
        stepLabel="サイトの基本情報を設定"
        headerBgColor="bg-blue-50"
        headerHoverColor="hover:bg-blue-100"
        accentColor="bg-blue-100 text-blue-600"
      >
        <Input label="サイト名" val={site.title || ''} onChange={v => setSite(s => ({ ...s, title: v }))} ph="サイトの名前" />
        <Input label="サイトの説明" val={site.description || ''} onChange={v => setSite(s => ({ ...s, description: v }))} ph="サイトの概要" />
        <Input label="ロゴURL" val={site.logo_url || ''} onChange={v => setSite(s => ({ ...s, logo_url: v }))} ph="https://..." />
        <div className="mb-4">
          <label className="text-sm font-bold text-gray-900 block mb-2">メインカラー</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={site.settings?.theme?.primaryColor || '#0891b2'}
              onChange={e => setSite(s => ({
                ...s,
                settings: { ...s.settings, theme: { ...s.settings?.theme, primaryColor: e.target.value } },
              }))}
              className="w-12 h-12 rounded-xl border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-500">{site.settings?.theme?.primaryColor || '#0891b2'}</span>
          </div>
        </div>
      </Section>

      {/* STEP 3: ページ管理 */}
      <Section
        title="ページ管理"
        icon={FileText}
        isOpen={openSections.pages}
        onToggle={() => toggleSection('pages')}
        badge={`${pages.length}ページ`}
        step={3}
        stepLabel="ページの追加・並び替え・設定"
        headerBgColor="bg-emerald-50"
        headerHoverColor="hover:bg-emerald-100"
        accentColor="bg-emerald-100 text-emerald-600"
      >
        <div className="space-y-3">
          {pages.map((page, index) => {
            const isActive = index === activePageIndex;
            const pageColor = page.is_home
              ? { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', hover: 'hover:bg-cyan-100' }
              : isActive
                ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100' }
                : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-400', hover: 'hover:bg-gray-100' };

            return (
              <div
                key={index}
                className={`rounded-xl border overflow-hidden ${isActive ? pageColor.border : 'border-gray-200'} ${isActive ? pageColor.bg : 'bg-gray-50'} cursor-pointer`}
                onClick={() => setActivePageIndex(index)}
              >
                <div
                  className={`w-full flex items-center justify-between p-4 ${isActive ? pageColor.hover : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GripVertical size={18} className="text-gray-400 flex-shrink-0" />
                    {page.is_home ? (
                      <Home size={18} className={`${pageColor.icon} flex-shrink-0`} />
                    ) : (
                      <FileText size={18} className={`${pageColor.icon} flex-shrink-0`} />
                    )}
                    <input
                      type="text"
                      value={page.title || ''}
                      onChange={e => { e.stopPropagation(); updatePageMeta(index, 'title', e.target.value); }}
                      onClick={e => { e.stopPropagation(); setActivePageIndex(index); }}
                      className={`flex-1 bg-transparent border-none font-medium focus:outline-none focus:ring-0 min-w-0 cursor-text ${isActive ? pageColor.text : 'text-gray-700'}`}
                      placeholder="ページ名"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => movePage(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => movePage(index, 'down')}
                      disabled={index === pages.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <label
                      className="p-1 cursor-pointer"
                      title={page.show_in_nav !== false ? 'ナビに表示中' : 'ナビ非表示'}
                    >
                      <input
                        type="checkbox"
                        checked={page.show_in_nav !== false}
                        onChange={e => updatePageMeta(index, 'show_in_nav', e.target.checked)}
                        className="sr-only"
                      />
                      <Menu size={16} className={page.show_in_nav !== false ? 'text-cyan-500' : 'text-gray-300'} />
                    </label>
                    {!page.is_home && (
                      <button
                        onClick={() => removePage(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={addPage}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-500 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2 font-medium mt-3"
        >
          <Plus size={20} /> ページを追加
        </button>
      </Section>

      {/* STEP 4: ブロック編集（BusinessEditorのSTEP3と同じパターン） */}
      {currentPage && (
        <Section
          title={`ブロック編集: ${currentPage.title || '無題'}`}
          icon={Layout}
          isOpen={openSections.blocks}
          onToggle={() => toggleSection('blocks')}
          badge={`${(currentPage.content || []).length}個`}
          step={4}
          stepLabel="コンテンツブロックを追加・編集"
          headerBgColor="bg-orange-50"
          headerHoverColor="hover:bg-orange-100"
          accentColor="bg-orange-100 text-orange-600"
        >
          {/* ブロック一覧 */}
          <div className="space-y-3 min-h-[100px]">
            {(!currentPage.content || currentPage.content.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Layout size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">ブロックがありません</p>
                <p className="text-xs mt-1">下のボタンからブロックを追加してください</p>
              </div>
            )}
            {(currentPage.content || []).map((block, index) => {
              const blockType = blockTypes.find(bt => bt.type === block.type);
              const BlockIcon = blockType?.icon || Type;

              return (
                <EditorBlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  totalBlocks={(currentPage.content || []).length}
                  blockType={blockType}
                  Icon={BlockIcon}
                  isExpanded={expandedBlocks.has(block.id)}
                  onToggle={() => {
                    setExpandedBlocks(prev => {
                      const next = new Set(prev);
                      if (next.has(block.id)) next.delete(block.id);
                      else next.add(block.id);
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

          {/* ブロック追加（BusinessEditorと同じUI） */}
          <div className="relative mt-4">
            <button
              onClick={() => setShowBlockSelector(!showBlockSelector)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-500 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              ブロックを追加
            </button>

            {showBlockSelector && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 max-h-80 overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {blockTypes.map(bt => (
                    <button
                      key={bt.type}
                      onClick={() => addBlock(bt.type)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-cyan-50 transition-colors border border-transparent hover:border-cyan-200"
                    >
                      <bt.icon size={24} className="text-cyan-600" />
                      <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* STEP 5: 高度な設定 */}
      <Section
        title="高度な設定"
        icon={Settings}
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
        step={5}
        stepLabel="各種オプションを設定（任意）"
        headerBgColor="bg-gray-100"
        headerHoverColor="hover:bg-gray-200"
        accentColor="bg-gray-200 text-gray-600"
      >
        <div className="space-y-4">
          {/* ポータル掲載 */}
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-cyan-900 flex items-center gap-2 mb-1">
                  <Star size={18} className="text-cyan-600"/> ポータルに掲載する
                </h4>
                <p className="text-xs text-cyan-700">
                  ポータルに掲載することで、サービスの紹介およびSEO対策、AI対策として効果的となります。より多くの方にあなたのマイサイトを見てもらえます。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={site.settings?.showInPortal === undefined ? true : site.settings?.showInPortal}
                  onChange={e => setSite(s => ({
                    ...s,
                    settings: { ...s.settings, showInPortal: e.target.checked }
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>

          {/* フッター非表示（Proプラン特典） */}
          <div className={`p-4 rounded-xl border ${
            userPlan?.canHideCopyright
              ? 'bg-orange-50 border-orange-200'
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${
                  userPlan?.canHideCopyright ? 'text-orange-900' : 'text-gray-500'
                }`}>
                  {userPlan?.canHideCopyright
                    ? <Eye size={18} className="text-orange-600"/>
                    : <Lock size={18} className="text-gray-400"/>
                  }
                  フッターを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    userPlan?.canHideCopyright
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>Pro</span>
                </h4>
                <p className={`text-xs ${userPlan?.canHideCopyright ? 'text-orange-700' : 'text-gray-500'}`}>
                  コンテンツ下部に表示される「ホームページメーカーで作成しました」のフッターを非表示にします。
                </p>
                {!userPlan?.canHideCopyright && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ※ Proプランにアップグレードすると利用可能になります
                  </p>
                )}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${
                userPlan?.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userPlan?.canHideCopyright && (site.settings?.hideFooter || false)}
                  onChange={e => {
                    if (userPlan?.canHideCopyright) {
                      setSite(s => ({
                        ...s,
                        settings: { ...s.settings, hideFooter: e.target.checked }
                      }));
                    }
                  }}
                  disabled={!userPlan?.canHideCopyright}
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  userPlan?.canHideCopyright
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
              className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-cyan-500 outline-none bg-white placeholder-gray-400 transition-shadow ${site.id ? 'bg-gray-100 cursor-not-allowed border-gray-300' : 'border-gray-300'}`}
              value={site.slug || ''}
              onChange={e => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setSite(s => ({ ...s, slug: val }));
              }}
              placeholder="my-site"
              disabled={!!site.id}
            />
            <p className="text-xs text-gray-500 mt-1">
              例: my-site, company-page<br/>
              ※英小文字、数字、ハイフンのみ。一度設定すると変更できません。
            </p>
            {site.slug && (
              <p className="text-xs text-cyan-600 mt-1">
                公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/site/{site.slug}
              </p>
            )}
          </div>

          <hr className="border-gray-200" />
          <Input
            label="Google Tag Manager ID"
            val={site.settings?.gtmId || ''}
            onChange={v => setSite(s => ({ ...s, settings: { ...s.settings, gtmId: v } }))}
            ph="GTM-XXXXXXX"
          />
          <Input
            label="Facebook Pixel ID"
            val={site.settings?.fbPixelId || ''}
            onChange={v => setSite(s => ({ ...s, settings: { ...s.settings, fbPixelId: v } }))}
            ph="1234567890"
          />
          <Input
            label="LINE Tag ID"
            val={site.settings?.lineTagId || ''}
            onChange={v => setSite(s => ({ ...s, settings: { ...s.settings, lineTagId: v } }))}
            ph="xxxxx-xxxxx"
          />
        </div>
      </Section>

      {/* 保存ボタン（下部）- BusinessEditorと同じ */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md text-lg"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {initialData?.id ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </div>
  );

  // プレビューレンダリング
  const renderPreview = () => {
    const navPages = pages.filter(p => p.show_in_nav !== false);
    const primaryColor = site.settings?.theme?.primaryColor || '#0891b2';

    return (
      <div className="bg-white min-h-full" key={previewKey}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                {site.logo_url && (
                  <img src={site.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                )}
                <span className="font-bold text-gray-900 text-sm">{site.title || 'サイト名'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                {navPages.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePageIndex(pages.indexOf(p) >= 0 ? pages.indexOf(p) : i)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                      pages.indexOf(p) === activePageIndex
                        ? 'text-white font-bold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={pages.indexOf(p) === activePageIndex ? { backgroundColor: primaryColor } : {}}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <div className="sm:hidden">
                <Menu size={20} className="text-gray-600" />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto">
          {(currentPage?.content || []).map((block, i) => (
            <div key={block.id || i}>
              <BlockRenderer block={block} variant="business" />
            </div>
          ))}
          {(!currentPage?.content || currentPage.content.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText size={48} className="mb-4" />
              <p>ブロックを追加してください</p>
            </div>
          )}
        </div>

        <footer className="border-t border-gray-200 mt-12 py-8 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} {site.title || 'サイト名'}</p>
        </footer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 完成モーダル */}
      <CreationCompleteModal
        isOpen={showComplete && !!savedSlug}
        onClose={() => setShowComplete(false)}
        title="ホームページメーカー"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/site/${savedSlug}`}
        contentTitle={site.title || 'ホームページを作りました！'}
        theme="teal"
        showSocialShare
        showQrCode
      />

      {/* ヘッダー（BusinessEditorと同じ構造） */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'ホームページ編集' : 'ホームページ新規作成'}
          </h2>
        </div>
        <div className="flex gap-2">
          {justSavedSlug && (
            <button
              onClick={() => setShowComplete(true)}
              className="hidden sm:flex bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-cyan-700 hover:to-teal-700 shadow-md text-sm sm:text-base"
            >
              <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {justSavedSlug && (
            <button
              onClick={() => window.open(`/site/${justSavedSlug}`, '_blank')}
              className="hidden sm:flex bg-cyan-50 border border-cyan-200 text-cyan-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:bg-cyan-100 text-sm sm:text-base"
            >
              <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-700 shadow-md"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー（BusinessEditorと同じ構造） */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${
              activeTab === 'edit'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 size={18} /> 編集
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${
              activeTab === 'preview'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ（BusinessEditorと同じ構造） */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto">
            {renderEditor()}
          </div>
        </div>

        {/* 右側: プレビュー */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* PC用プレビューヘッダー */}
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm font-medium">プレビュー</span>
            </div>
            <div className="bg-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300 truncate max-w-[200px]">
              {savedSlug ? `makers.tokyo/site/${savedSlug}` : 'makers.tokyo/site/...'}
            </div>
          </div>
          {/* プレビューコンテンツ */}
          <div className="flex-1 overflow-auto bg-white">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* はじめかたガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="site_editor_onboarding_dismissed"
          title="マイサイトエディタの使い方"
          pages={[
            {
              subtitle: 'エディタの基本',
              items: [
                { icon: Layout, iconColor: 'blue', title: '左 = セクション設定 / 右 = ライブプレビュー', description: '左側の折りたたみセクションで編集し、右側でリアルタイムプレビューを確認できます。PC/モバイル切替にも対応しています。' },
                { icon: Sparkles, iconColor: 'amber', title: 'テンプレートから始める', description: 'サイト専用テンプレートを選択すると、複数ページのサイト構成が自動配置されます。' },
                { icon: FileText, iconColor: 'emerald', title: '複数ページ対応', description: 'トップページに加え、メニュー・アクセス・お問い合わせなど複数ページを追加・管理できます。' },
              ],
            },
            {
              subtitle: 'ブロックの種類',
              items: [
                { icon: Zap, iconColor: 'blue', title: 'ヒーロー・ファーストビュー', description: '「ヒーロー」でインパクトのあるメインビジュアルを配置できます。' },
                { icon: Star, iconColor: 'amber', title: '特徴・ベネフィット', description: '「特徴」ブロックでサービスの強みを3列カードで表示できます。' },
                { icon: Target, iconColor: 'red', title: 'CTAセクション', description: '「CTAセクション」でコンバージョンポイントを配置。ボタンテキストやリンクを設定します。' },
                { icon: MessageCircle, iconColor: 'teal', title: 'お客様の声・FAQ', description: '「お客様の声」「FAQ」で信頼性を向上。「ギャラリー」で写真を一覧表示できます。' },
              ],
            },
            {
              subtitle: 'ページ管理と公開',
              items: [
                { icon: Globe, iconColor: 'cyan', title: 'ページ管理', description: 'STEP 3でページの追加・削除・並べ替えができます。各ページにナビゲーション表示の切替も可能です。' },
                { icon: Lock, iconColor: 'red', title: 'Pro機能', description: 'Proプランではフッター非表示など高度なカスタマイズが可能です。' },
                { icon: ExternalLink, iconColor: 'green', title: '公開と共有', description: '保存後URLをコピーして共有。ポータルにも掲載でき、SEO対策にもなります。' },
              ],
            },
          ]}
          gradientFrom="from-cyan-600"
          gradientTo="to-teal-600"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

// エディタ用ブロックアイテム（BusinessEditorと同じコンポーネント）
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
          <Icon size={18} className={blockType?.color?.icon || 'text-cyan-600'} />
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
