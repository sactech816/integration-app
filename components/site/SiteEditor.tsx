'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Smartphone,
  Monitor,
  Copy,
  Check,
  MapPin,
  DollarSign,
  Star,
  Link as LinkIcon,
  Book,
  Timer,
  Images,
  Brain,
  Link2,
  UserCircle,
  List,
  Lock,
  Layout,
  Sparkles,
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import { usePoints } from '@/lib/hooks/usePoints';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

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
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'お店の名前', subheadline: 'キャッチコピーを入力してください', buttonText: '予約する', buttonUrl: '#contact' } },
        { id: generateBlockId(), type: 'text_card', data: { title: 'コンセプト', text: 'お店のコンセプトや想いをここに書きましょう。', align: 'center' } },
        { id: generateBlockId(), type: 'features', data: { title: '当店の特徴', items: [{ icon: '✨', title: '特徴1', description: '説明文' }, { icon: '🎯', title: '特徴2', description: '説明文' }, { icon: '💎', title: '特徴3', description: '説明文' }] } },
      ] as unknown as Block[] },
      { slug: 'menu', title: 'メニュー', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'メニュー', text: 'サービスメニューを紹介しましょう。', align: 'center' } },
        { id: generateBlockId(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: 'ベーシック', price: '¥3,000', features: ['基本サービス', '所要時間30分'], recommended: false }, { name: 'スタンダード', price: '¥5,000', features: ['基本+応用', '所要時間60分', 'アフターケア付き'], recommended: true }] } },
      ] as unknown as Block[] },
      { slug: 'access', title: 'アクセス', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'アクセス', text: '住所やアクセス方法を記載してください。', align: 'left' } },
        { id: generateBlockId(), type: 'google_map', data: { address: '', embedUrl: '' } },
      ] as unknown as Block[] },
      { slug: 'contact', title: 'お問い合わせ', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'お問い合わせ', text: 'お気軽にご連絡ください。', align: 'center' } },
        { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせフォーム', buttonText: '送信する' } },
      ] as unknown as Block[] },
    ],
  },
  {
    id: 'instructor',
    name: '講師・コンサル',
    description: 'プロフィール・サービス・実績を紹介',
    icon: '👨‍🏫',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    hoverBorder: 'hover:border-violet-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'あなたの名前', subheadline: '肩書き・専門分野を入力', buttonText: '詳しく見る', buttonUrl: '#service' } },
        { id: generateBlockId(), type: 'text_card', data: { title: '自己紹介', text: 'あなたのプロフィールやメッセージを書きましょう。', align: 'left' } },
        { id: generateBlockId(), type: 'testimonial', data: { title: 'お客様の声', items: [{ name: 'A様', role: '会社員', comment: '素晴らしいセミナーでした。', image: '' }] } },
      ] as unknown as Block[] },
      { slug: 'service', title: 'サービス', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: 'サービス一覧', text: '提供しているサービスを紹介しましょう。', align: 'center' } },
        { id: generateBlockId(), type: 'features', data: { title: 'サービスの特徴', items: [{ icon: '📚', title: 'セミナー', description: '内容の説明' }, { icon: '💼', title: 'コンサルティング', description: '内容の説明' }, { icon: '📝', title: 'オンライン講座', description: '内容の説明' }] } },
        { id: generateBlockId(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: '単発セミナー', price: '¥5,000', features: ['2時間', '資料付き'], recommended: false }, { name: '継続コンサル', price: '¥30,000/月', features: ['月2回面談', 'チャット相談無制限', '専用資料作成'], recommended: true }] } },
      ] as unknown as Block[] },
      { slug: 'works', title: '実績', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: '実績・事例', text: 'これまでの活動実績を紹介しましょう。', align: 'center' } },
        { id: generateBlockId(), type: 'gallery', data: { items: [] } },
      ] as unknown as Block[] },
      { slug: 'contact', title: 'お問い合わせ', is_home: false, content: [
        { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせ', buttonText: '相談する' } },
      ] as unknown as Block[] },
    ],
  },
  {
    id: 'freelance',
    name: 'フリーランス',
    description: 'ポートフォリオ・スキル・料金をまとめたサイト',
    icon: '💻',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    pages: [
      { slug: 'home', title: 'トップ', is_home: true, content: [
        { id: generateBlockId(), type: 'hero', data: { headline: 'あなたの名前', subheadline: 'Web制作 / デザイン / etc.', buttonText: '仕事を依頼する', buttonUrl: '#contact' } },
        { id: generateBlockId(), type: 'features', data: { title: 'スキル', items: [{ icon: '🎨', title: 'デザイン', description: '得意な分野' }, { icon: '💻', title: '開発', description: '得意な分野' }, { icon: '📱', title: 'その他', description: '得意な分野' }] } },
      ] as unknown as Block[] },
      { slug: 'works', title: '制作実績', is_home: false, content: [
        { id: generateBlockId(), type: 'text_card', data: { title: '制作実績', text: 'これまでの制作物を紹介します。', align: 'center' } },
        { id: generateBlockId(), type: 'gallery', data: { items: [] } },
      ] as unknown as Block[] },
      { slug: 'pricing', title: '料金', is_home: false, content: [
        { id: generateBlockId(), type: 'pricing', data: { title: '料金目安', plans: [{ name: 'ライトプラン', price: '¥50,000〜', features: ['LP制作', 'レスポンシブ対応'], recommended: false }, { name: 'スタンダード', price: '¥150,000〜', features: ['複数ページ', 'CMS導入', '保守サポート'], recommended: true }] } },
      ] as unknown as Block[] },
      { slug: 'contact', title: 'お問い合わせ', is_home: false, content: [
        { id: generateBlockId(), type: 'lead_form', data: { title: 'お仕事のご相談', buttonText: '送信する' } },
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

// ヘルパー: Input
function Input({ label, val, onChange, ph, disabled }: { label: string; val: string; onChange: (v: string) => void; ph?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
      <input
        type="text"
        value={val}
        onChange={e => onChange(e.target.value)}
        placeholder={ph}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

// ヘルパー: Textarea
function Textarea({ label, val, onChange, rows }: { label: string; val: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
      <textarea
        value={val}
        onChange={e => onChange(e.target.value)}
        rows={rows || 3}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

// セクション折りたたみ
function Section({ title, icon: Icon, isOpen, onToggle, children, badge, step, stepLabel, headerBgColor, accentColor }: {
  title: string; icon: React.ElementType; isOpen: boolean; onToggle: () => void; children: React.ReactNode; badge?: string;
  step?: number; stepLabel?: string; headerBgColor?: string; accentColor?: string;
}) {
  const iconBg = isOpen ? (accentColor || 'bg-cyan-100 text-cyan-600') : 'bg-gray-200 text-gray-500';
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {step && stepLabel && (
        <div className={`px-5 py-2 text-xs font-bold ${headerBgColor || 'bg-gray-50'} text-gray-600 border-b border-gray-100`}>
          STEP {step}　{stepLabel}
        </div>
      )}
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${iconBg}`}>
            <Icon size={20} />
          </div>
          <span className="font-bold text-gray-900">{title}</span>
          {badge && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

export default function SiteEditor({ user, isAdmin, initialData, setPage, onBack, setShowAuth }: SiteEditorProps) {
  const { userPlan } = useUserPlan(user?.id);
  const isPro = userPlan?.planTier === 'pro';
  const { canAfford } = usePoints({ userId: user?.id, isPro });

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
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState(false);
  // セクション開閉
  const [openSections, setOpenSections] = useState({
    template: !initialData,
    siteSettings: true,
    pages: true,
    blocks: true,
    advanced: false,
  });

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

  const addBlock = (type: string) => {
    const newBlock = { id: generateBlockId(), type, data: {} } as Block;
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

      // ポイントチェック（新規のみ）
      if (isNew && user && !isPro) {
        const affordable = await canAfford('mini-site', 'save');
        if (!affordable) {
          alert('ポイントが不足しています');
          setIsSaving(false);
          return;
        }
      }

      if (isNew) {
        // サイト作成
        const { data: siteData, error: siteError } = await supabase
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
          .select()
          .single();

        if (siteError) throw siteError;

        // ページ一括作成
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

        if (pagesError) throw pagesError;

        setSite(prev => ({ ...prev, id: siteData.id, slug }));
        setSavedSlug(slug);
        setShowComplete(true);

        // URL更新
        window.history.replaceState({}, '', `/site/editor?id=${slug}`);
      } else {
        // サイト更新
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

        if (siteError) throw siteError;

        // 既存ページ削除→再作成（簡易的なアプローチ）
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

        if (pagesError) throw pagesError;

        alert('更新しました');
      }

      // キャッシュ無効化
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">このブロックのエディタは準備中です</p>;
    }
  };

  // プレビューレンダリング
  const renderPreview = () => {
    const navPages = pages.filter(p => p.show_in_nav !== false);
    const primaryColor = site.settings?.theme?.primaryColor || '#0891b2';

    return (
      <div className="bg-white min-h-full" key={previewKey}>
        {/* ナビゲーション */}
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

        {/* ページコンテンツ */}
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

        {/* フッター */}
        <footer className="border-t border-gray-200 mt-12 py-8 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {site.title || 'サイト名'}</p>
        </footer>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* エディタヘッダー */}
      <div className="w-full sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">マイサイトメーカー</h1>
              <p className="text-xs text-gray-500">{site.id ? '編集中' : '新規作成'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savedSlug && (
              <button
                onClick={copyUrl}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-all shadow-sm"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'コピー済み' : '公開URL'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {site.id ? '更新して保存' : '保存して公開'}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeTab === 'edit' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
          >
            <Edit3 size={16} className="inline mr-1" /> 編集
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeTab === 'preview' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
          >
            <Eye size={16} className="inline mr-1" /> プレビュー
          </button>
        </div>
      </div>

      {/* 左パネル: エディタ */}
      <div className={`w-full lg:w-1/2 overflow-y-auto pb-32 bg-gray-50 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">

          {/* テンプレート選択 */}
          <Section
            title="テンプレート選択"
            icon={Sparkles}
            isOpen={openSections.template}
            onToggle={() => setOpenSections(s => ({ ...s, template: !s.template }))}
            step={1}
            stepLabel="テンプレートを選んでサイトの下書きを作成"
            headerBgColor="bg-purple-50"
            accentColor="bg-purple-100 text-purple-600"
          >
            <p className="text-sm text-gray-600 mb-3">テンプレートを選ぶとページ構成が自動でセットされます</p>
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
          </Section>

          {/* サイト基本設定 */}
          <Section
            title="サイト設定"
            icon={Settings}
            isOpen={openSections.siteSettings}
            onToggle={() => setOpenSections(s => ({ ...s, siteSettings: !s.siteSettings }))}
            step={2}
            stepLabel="サイトの基本情報を設定"
            headerBgColor="bg-blue-50"
            accentColor="bg-blue-100 text-blue-600"
          >
            <Input label="サイト名" val={site.title || ''} onChange={v => setSite(s => ({ ...s, title: v }))} ph="サイトの名前" />
            <Input label="サイトの説明" val={site.description || ''} onChange={v => setSite(s => ({ ...s, description: v }))} ph="サイトの概要" />
            <Input label="ロゴURL" val={site.logo_url || ''} onChange={v => setSite(s => ({ ...s, logo_url: v }))} ph="https://..." />
            <div>
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

          {/* ページ管理 */}
          <Section
            title="ページ管理"
            icon={FileText}
            isOpen={openSections.pages}
            onToggle={() => setOpenSections(s => ({ ...s, pages: !s.pages }))}
            badge={`${pages.length}ページ`}
            step={3}
            stepLabel="ページの追加・並び替え・設定"
            headerBgColor="bg-emerald-50"
            accentColor="bg-emerald-100 text-emerald-600"
          >
            <div className="space-y-2">
              {pages.map((page, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                    index === activePageIndex
                      ? 'border-cyan-300 bg-cyan-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setActivePageIndex(index)}
                >
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                  {page.is_home ? (
                    <Home size={16} className="text-cyan-500 flex-shrink-0" />
                  ) : (
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                  <input
                    type="text"
                    value={page.title || ''}
                    onChange={e => { e.stopPropagation(); updatePageMeta(index, 'title', e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none focus:ring-0 min-w-0"
                    placeholder="ページ名"
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); movePage(index, 'up'); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ArrowUp size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); movePage(index, 'down'); }}
                      disabled={index === pages.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ArrowDown size={14} className="text-gray-500" />
                    </button>
                    <label
                      className="p-1 cursor-pointer"
                      title={page.show_in_nav !== false ? 'ナビに表示中' : 'ナビ非表示'}
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={page.show_in_nav !== false}
                        onChange={e => updatePageMeta(index, 'show_in_nav', e.target.checked)}
                        className="sr-only"
                      />
                      <Menu size={14} className={page.show_in_nav !== false ? 'text-cyan-500' : 'text-gray-300'} />
                    </label>
                    {!page.is_home && (
                      <button
                        onClick={e => { e.stopPropagation(); removePage(index); }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addPage}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 font-bold text-sm transition-all"
            >
              <Plus size={16} className="inline mr-1" /> ページを追加
            </button>
          </Section>

          {/* ブロック編集 */}
          {currentPage && (
            <Section
              title={`ブロック編集: ${currentPage.title || '無題'}`}
              icon={Layout}
              isOpen={openSections.blocks}
              onToggle={() => setOpenSections(s => ({ ...s, blocks: !s.blocks }))}
              badge={`${(currentPage.content || []).length}個`}
            >
              <div className="space-y-3">
                {(currentPage.content || []).map((block, blockIndex) => {
                  const blockDef = blockTypes.find(bt => bt.type === block.type);
                  const isExpanded = expandedBlocks.has(block.id);
                  const BlockIcon = blockDef?.icon || FileText;

                  return (
                    <div key={block.id} className={`rounded-xl border overflow-hidden transition-all ${blockDef?.color?.border || 'border-gray-200'}`}>
                      <button
                        onClick={() => {
                          setExpandedBlocks(prev => {
                            const next = new Set(prev);
                            if (next.has(block.id)) next.delete(block.id);
                            else next.add(block.id);
                            return next;
                          });
                        }}
                        className={`w-full flex items-center gap-2 p-3 ${blockDef?.color?.bg || 'bg-gray-50'} hover:opacity-80 transition-all`}
                      >
                        <GripVertical size={14} className="text-gray-300" />
                        <BlockIcon size={16} className={blockDef?.color?.icon || 'text-gray-500'} />
                        <span className={`text-sm font-bold flex-1 text-left ${blockDef?.color?.text || 'text-gray-700'}`}>
                          {blockDef?.label || block.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'up'); }} disabled={blockIndex === 0} className="p-1 hover:bg-white/50 rounded disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'down'); }} disabled={blockIndex === (currentPage.content || []).length - 1} className="p-1 hover:bg-white/50 rounded disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 hover:bg-red-100 rounded">
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="p-4 bg-white">
                          {renderBlockEditor(block)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ブロック追加ボタン */}
              <div className="relative">
                <button
                  onClick={() => setShowBlockSelector(!showBlockSelector)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 font-bold text-sm transition-all"
                >
                  <Plus size={16} className="inline mr-1" /> ブロックを追加
                </button>

                {showBlockSelector && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl z-20 p-4 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {blockTypes.map(bt => {
                        const BtIcon = bt.icon;
                        return (
                          <button
                            key={bt.type}
                            onClick={() => addBlock(bt.type)}
                            className={`flex items-center gap-2 p-3 rounded-xl border ${bt.color.border} ${bt.color.bg} ${bt.color.hover} transition-all text-left`}
                          >
                            <BtIcon size={16} className={bt.color.icon} />
                            <div>
                              <p className={`text-xs font-bold ${bt.color.text}`}>{bt.label}</p>
                              <p className="text-xs text-gray-500">{bt.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowBlockSelector(false)}
                      className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      閉じる
                    </button>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 詳細設定 */}
          <Section title="詳細設定" icon={Settings} isOpen={openSections.advanced} onToggle={() => setOpenSections(s => ({ ...s, advanced: !s.advanced }))}>
            <Input label="カスタムスラッグ" val={site.slug || ''} onChange={v => setSite(s => ({ ...s, slug: v }))} ph="my-site（英数字とハイフン）" disabled={!!site.id} />
            <Input label="GTM ID" val={site.settings?.gtmId || ''} onChange={v => setSite(s => ({ ...s, settings: { ...s.settings, gtmId: v } }))} ph="GTM-XXXXXXX" />
            <Input label="Facebook Pixel ID" val={site.settings?.fbPixelId || ''} onChange={v => setSite(s => ({ ...s, settings: { ...s.settings, fbPixelId: v } }))} ph="1234567890" />
            <Input label="LINE Tag ID" val={site.settings?.lineTagId || ''} onChange={v => setSite(s => ({ ...s, settings: { ...s.settings, lineTagId: v } }))} ph="xxxxxxxx-xxxx-xxxx-xxxx" />
          </Section>
        </div>

        {/* スティッキー保存ボタン */}
        <div className="sticky bottom-4 px-4 lg:max-w-2xl lg:mx-auto">
          <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-2xl p-4 border border-cyan-200 shadow-lg">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {site.id ? '更新して保存' : '保存して公開'}
            </button>
          </div>
        </div>
      </div>

      {/* 右パネル: プレビュー */}
      <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] overflow-y-auto bg-gray-800 ${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
        <div className="p-4">
          {/* ブラウザ風ヘッダー */}
          <div className="bg-gray-700 rounded-t-xl px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-gray-600 rounded-lg px-3 py-1 text-xs text-gray-300 truncate">
              {savedSlug ? `makers.tokyo/site/${savedSlug}` : 'makers.tokyo/site/...'}
            </div>
          </div>
          <div className="bg-white rounded-b-xl overflow-hidden">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* 完成モーダル */}
      <CreationCompleteModal
        isOpen={showComplete}
        onClose={() => setShowComplete(false)}
        title="マイサイト"
        publicUrl={`/site/${savedSlug}`}
        contentTitle={site.title}
        theme="teal"
        showSocialShare
        showQrCode
      />
    </div>
  );
}
