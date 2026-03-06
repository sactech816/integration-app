'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { WebinarLP, Block, generateBlockId } from '@/lib/types';
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
  Target,
  Youtube,
  Mail,
  Palette,
  ExternalLink,
  Trophy,
  Settings,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  UploadCloud,
  Shuffle,
  Timer,
  List,
  UserCircle,
  Star,
  Monitor,
  Smartphone,
  Layout,
  Lock,
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

interface WebinarEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  initialData?: WebinarLP | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

// ブロックタイプの定義 - ウェビナーLP専用 + 共通ブロック
const blockTypes = [
  // ウェビナーLP専用ブロック
  { type: 'hero', label: 'ヒーロー', icon: Zap, description: 'タイトル・サブタイトル', category: 'webinar', color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-500', hover: 'hover:bg-violet-100' } },
  { type: 'hero_fullwidth', label: 'フルワイドヒーロー', icon: Layout, description: 'インパクトのあるファーストビュー', category: 'webinar', color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-500', hover: 'hover:bg-violet-100' } },
  { type: 'youtube', label: 'YouTube', icon: Youtube, description: '動画埋め込み', category: 'webinar', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'speaker', label: '講師紹介', icon: UserCircle, description: '講師プロフィール', category: 'webinar', color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100' } },
  { type: 'agenda', label: 'アジェンダ', icon: List, description: '学べること・内容', category: 'webinar', color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', hover: 'hover:bg-blue-100' } },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: '開催日時タイマー', category: 'webinar', color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'cta_section', label: 'CTAセクション', icon: Target, description: 'コンバージョンポイント', category: 'webinar', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'delayed_cta', label: '時間制御CTA', icon: Timer, description: '遅延表示ボタン', category: 'webinar', color: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', hover: 'hover:bg-rose-100' } },
  // 共通ブロック
  { type: 'testimonial', label: '参加者の声', icon: MessageCircle, description: 'テスティモニアル', category: 'common', color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100' } },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'テキストカード', category: 'common', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション', category: 'common', color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問', category: 'common', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'lead_form', label: 'リードフォーム', icon: Mail, description: 'メール収集', category: 'common', color: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', hover: 'hover:bg-cyan-100' } },
];

// グラデーションプリセット（ダーク系デフォルト - ウェビナー向け）
const gradientPresets = [
  { name: 'ダーク', value: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)', animated: false },
  { name: 'パープル', value: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)', animated: true },
  { name: 'ネイビー', value: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)', animated: true },
  { name: 'ブラック', value: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)', animated: true },
  { name: 'グリーン', value: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)', animated: true },
  { name: 'サンセット', value: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animated: true },
  { name: 'ティール', value: 'linear-gradient(-45deg, #14b8a6, #0d9488, #0f766e, #0d9488)', animated: true },
  { name: 'ローズ', value: 'linear-gradient(-45deg, #9f1239, #be123c, #e11d48, #be123c)', animated: true },
];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// ランダム画像URL生成（Unsplash）
const getRandomImageUrl = (category: string = 'portrait') => {
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
  };
  const urls = categories[category] || categories.portrait;
  return urls[Math.floor(Math.random() * urls.length)];
};

// お客様の声用プリセット画像
const testimonialPresetImages = [
  { label: '男性A', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性B', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性A', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性B', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
];

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
  accentColor = 'bg-violet-100 text-violet-600'
}: {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
  headerBgColor?: string;
  headerHoverColor?: string;
  accentColor?: string;
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

// 入力コンポーネント
const Input = ({ label, val, onChange, ph, disabled = false }: { label: string; val: string; onChange: (v: string) => void; ph?: string; disabled?: boolean }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input
      className={`w-full border border-gray-300 p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-violet-500 outline-none bg-white placeholder-gray-400 transition-shadow ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      value={val || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={ph}
      disabled={disabled}
    />
  </div>
);

const Textarea = ({ label, val, onChange, rows = 3 }: { label: string; val: string; onChange: (v: string) => void; rows?: number }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      rows={rows}
      value={val || ''}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// 全幅表示対象ブロックの判定
const isFullWidthBlock = (block: Block): boolean => {
  if (block.type === 'hero_fullwidth') return true;
  if (block.type === 'hero' && block.data.isFullWidth) return true;
  if (block.type === 'cta_section' && block.data.isFullWidth) return true;
  if (block.type === 'testimonial' && block.data.isFullWidth) return true;
  return false;
};

const WebinarEditor: React.FC<WebinarEditorProps> = ({
  user,
  isAdmin,
  initialData,
  setPage,
  onBack,
  setShowAuth,
}) => {
  const { userPlan } = useUserPlan(user?.id);

  // 初期ブロック
  const initialBlocks: Block[] = [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'ウェビナータイトル',
        subheadline: 'サブタイトルを入力してください',
        ctaText: '今すぐ申し込む',
        ctaUrl: '',
        backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)',
      },
    },
    {
      id: generateBlockId(),
      type: 'youtube',
      data: { url: '' },
    },
    {
      id: generateBlockId(),
      type: 'speaker',
      data: { name: '講師名', title: '肩書き', image: '', bio: '講師の紹介文を入力してください' },
    },
    {
      id: generateBlockId(),
      type: 'agenda',
      data: {
        title: 'このウェビナーで学べること',
        items: [
          { title: '内容1', description: '' },
          { title: '内容2', description: '' },
          { title: '内容3', description: '' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今すぐ参加する',
        description: '席に限りがございます。お早めにお申し込みください。',
        buttonText: '無料で参加する',
        buttonUrl: '',
      },
    },
  ];

  const [lp, setLp] = useState<Partial<WebinarLP>>({
    title: '',
    description: '',
    content: initialBlocks,
    settings: {
      theme: {
        gradient: gradientPresets[0].value,
        animated: false,
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
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
  const pcIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [justSavedSlug, setJustSavedSlug] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // カスタムスラッグのバリデーション
  const validateCustomSlug = (slug: string): boolean => {
    if (!slug) {
      setSlugError('');
      return true;
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
    theme: true,
    blocks: true,
    advanced: false,
  });

  const resetPreview = () => setPreviewKey(k => k + 1);

  // iframeにプレビューデータを送信
  const sendPreviewData = useCallback(() => {
    const payload = {
      type: 'PREVIEW_DATA',
      payload: {
        title: lp.title || '',
        description: lp.description || '',
        content: lp.content || [],
        settings: lp.settings,
      },
    };
    if (pcIframeRef.current?.contentWindow) {
      pcIframeRef.current.contentWindow.postMessage(payload, '*');
    }
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

  // previewModeが変わった時は少し待ってからデータを送信
  useEffect(() => {
    const timer = setTimeout(() => sendPreviewData(), 100);
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
        theme: true,
        blocks: true,
        advanced: false,
      });
    }
  }, [initialData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    const existingId = initialData?.id || savedId;
    // 新規作成時のみカスタムスラッグをバリデーション（編集時は既存スラッグなのでスキップ）
    if (!existingId && customSlug && !validateCustomSlug(customSlug)) return;
    if (existingId && !user) {
      if (confirm('編集・更新にはログインが必要です。ログイン画面を開きますか？')) {
        setShowAuth(true);
      }
      return;
    }

    setIsSaving(true);
    try {
      const finalTitle = lp.title?.trim() || '無題のウェビナーLP';
      let result;

      if (existingId) {
        result = await supabase
          ?.from('webinar_lps')
          .update({
            content: lp.content,
            settings: {
              ...lp.settings,
              title: finalTitle,
              description: lp.description,
            },
            title: finalTitle,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId)
          .select()
          .single();

        if (result?.error) throw result.error;
      } else {
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          const newSlug = customSlug.trim() || generateSlug();
          result = await supabase
            ?.from('webinar_lps')
            .insert({
              content: lp.content,
              settings: {
                ...lp.settings,
                title: finalTitle,
                description: lp.description,
              },
              title: finalTitle,
              slug: newSlug,
              user_id: user?.id || null,
              status: 'published',
            })
            .select()
            .single();

          if (result?.error?.code === '23505' && result?.error?.message?.includes('slug') && !customSlug.trim()) {
            attempts++;
            continue;
          }
          break;
        }

        if (attempts >= maxAttempts) {
          throw new Error('ユニークなURLの生成に失敗しました。もう一度お試しください。');
        }

        if (result?.error) {
          if (result.error.code === '23505' && result.error.message?.includes('slug')) {
            throw new Error('このカスタムURLは既に使用されています。別のURLを指定してください。');
          }
          throw result.error;
        }
      }

      if (result?.data) {
        setSavedSlug(result.data.slug);
        setSavedId(result.data.id);
        setJustSavedSlug(result.data.slug);

        // ISRキャッシュを無効化
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/webinar/${result.data.slug}` }),
        }).catch(() => {});

        if (!initialData && !savedId) {
          setShowSuccessModal(true);
          if (!user) {
            try {
              const stored = JSON.parse(localStorage.getItem('guest_content') || '[]');
              stored.push({ table: 'webinar_lps', id: result.data.id });
              localStorage.setItem('guest_content', JSON.stringify(stored));
            } catch {}
          }
        } else {
          alert('保存しました！');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      alert(`保存中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    setLp(prev => {
      const content = prev.content || [];
      const heroIndex = content.findIndex(b => b.type === 'hero' || b.type === 'hero_fullwidth');
      let newContent;
      if (heroIndex === -1 || heroIndex < content.length - 1) {
        newContent = [...content, newBlock];
      } else {
        newContent = [...content.slice(0, heroIndex + 1), newBlock, ...content.slice(heroIndex + 1)];
      }
      return { ...prev, content: newContent };
    });
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id));
    setShowBlockSelector(false);
  };

  const removeBlock = (id: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setLp(prev => ({ ...prev, content: prev.content?.filter(b => b.id !== id) }));
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    setLp(prev => ({
      ...prev,
      content: prev.content?.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } as typeof b : b
      ),
    }));
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
  };

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert('データベースに接続されていません');
    if (file.size > MAX_IMAGE_SIZE) {
      alert('画像サイズが大きすぎます。最大2MBまで対応しています。');
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
  const handleRandomImage = (blockId: string, field: string, category: string = 'portrait') => {
    const randomUrl = getRandomImageUrl(category);
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
      case 'hero':
        return { id, type: 'hero', data: { headline: 'ウェビナータイトル', subheadline: 'サブタイトル', ctaText: '今すぐ申し込む', ctaUrl: '', backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' } };
      case 'hero_fullwidth':
        return { id, type: 'hero_fullwidth', data: { headline: 'あなたのビジネスを成功に導く', subheadline: 'サブタイトルを入力してください', ctaText: '今すぐ参加する', ctaUrl: '', backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' } };
      case 'youtube':
        return { id, type: 'youtube', data: { url: '' } };
      case 'speaker':
        return { id, type: 'speaker', data: { name: '', title: '', image: '', bio: '' } };
      case 'agenda':
        return { id, type: 'agenda', data: { title: '学べること', items: [{ title: '', description: '' }] } };
      case 'countdown':
        return { id, type: 'countdown', data: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '開催まで', expiredText: 'アーカイブ視聴可能', backgroundColor: '#7c3aed' } };
      case 'cta_section':
        return { id, type: 'cta_section', data: { title: '今すぐ参加する', description: 'お早めにお申し込みください', buttonText: '無料で参加する', buttonUrl: '', backgroundGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' } };
      case 'delayed_cta':
        return { id, type: 'delayed_cta', data: { title: '', buttonText: '今すぐ申し込む', buttonUrl: '', delaySeconds: 300, buttonColor: '#7c3aed', buttonTextColor: '#ffffff' } };
      case 'testimonial':
        return { id, type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] } };
      case 'text_card':
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
      case 'image':
        return { id, type: 'image', data: { url: '', caption: '' } };
      case 'faq':
        return { id, type: 'faq', data: { items: [{ id: generateBlockId(), question: '', answer: '' }] } };
      case 'lead_form':
        return { id, type: 'lead_form', data: { title: '無料で参加する', buttonText: '申し込む' } };
      default:
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
    }
  };

  // ブロックエディタのレンダリング
  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <Textarea label="メインキャッチコピー" val={block.data.headline || ''} onChange={v => updateBlock(block.id, { headline: v })} rows={2} />
            <Input label="サブテキスト" val={block.data.subheadline || ''} onChange={v => updateBlock(block.id, { subheadline: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.ctaText || ''} onChange={v => updateBlock(block.id, { ctaText: v })} ph="今すぐ申し込む" />
              <Input label="ボタンURL" val={block.data.ctaUrl || ''} onChange={v => updateBlock(block.id, { ctaUrl: v })} ph="#contact" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像（任意）</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.backgroundImage || ''} onChange={e => updateBlock(block.id, { backgroundImage: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'backgroundImage')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm">
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.backgroundImage && (
                <img src={block.data.backgroundImage} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />
              )}
              {block.data.backgroundImage && (
                <div className="mt-3">
                  <label className="text-sm font-bold text-gray-900 block mb-2">背景画像の透明度: {block.data.backgroundOpacity ?? 20}%</label>
                  <input type="range" min="0" max="100" step="5" value={block.data.backgroundOpacity ?? 20} onChange={e => updateBlock(block.id, { backgroundOpacity: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>透明</span><span>半透明</span><span>不透明</span></div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">見出し文字色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.headlineColor || '#ffffff'} onChange={e => updateBlock(block.id, { headlineColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.headlineColor || '#ffffff'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">サブテキスト文字色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.subheadlineColor || '#ffffff'} onChange={e => updateBlock(block.id, { subheadlineColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.subheadlineColor || '#ffffff'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={e => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-violet-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-violet-800">🖥️ 全幅表示（PC向け）</label>
            </div>
          </div>
        );

      case 'hero_fullwidth':
        return (
          <div className="space-y-4">
            <Textarea label="メインキャッチコピー" val={block.data.headline || ''} onChange={v => updateBlock(block.id, { headline: v })} rows={2} />
            <Input label="サブテキスト" val={block.data.subheadline || ''} onChange={v => updateBlock(block.id, { subheadline: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.ctaText || ''} onChange={v => updateBlock(block.id, { ctaText: v })} ph="今すぐ参加する" />
              <Input label="ボタンURL" val={block.data.ctaUrl || ''} onChange={v => updateBlock(block.id, { ctaUrl: v })} ph="#contact" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像（任意）</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.backgroundImage || ''} onChange={e => updateBlock(block.id, { backgroundImage: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'backgroundImage')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm">
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.backgroundImage && (
                <>
                  <img src={block.data.backgroundImage} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />
                  <div className="mt-3">
                    <label className="text-sm font-bold text-gray-900 block mb-2">背景画像の透明度: {block.data.backgroundOpacity ?? 40}%</label>
                    <input type="range" min="0" max="100" step="5" value={block.data.backgroundOpacity ?? 40} onChange={e => updateBlock(block.id, { backgroundOpacity: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>透明</span><span>半透明</span><span>不透明</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <Input label="YouTube URL" val={block.data.url || ''} onChange={v => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." />
            <p className="text-xs text-gray-500 -mt-2">YouTube動画のURLまたは埋め込みURLを入力</p>
          </div>
        );

      case 'speaker':
        return (
          <div className="space-y-4">
            <Input label="講師名" val={block.data.name || ''} onChange={v => updateBlock(block.id, { name: v })} ph="講師の名前" />
            <Input label="肩書き" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="株式会社〇〇 代表取締役" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.image || ''} onChange={e => updateBlock(block.id, { image: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'image')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'image', 'portrait')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm">
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.image && <img src={block.data.image} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
            </div>
            <Textarea label="紹介文" val={block.data.bio || ''} onChange={v => updateBlock(block.id, { bio: v })} rows={4} />
          </div>
        );

      case 'agenda':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="このウェビナーで学べること" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">項目</label>
              <div className="space-y-3">
                {(block.data.items || []).map((item: { title: string; description?: string }, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <input type="text" value={item.title} onChange={e => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateBlock(block.id, { items }); }} placeholder="タイトル" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                      <button onClick={() => { const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i); updateBlock(block.id, { items }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                    <input type="text" value={item.description || ''} onChange={e => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], description: e.target.value }; updateBlock(block.id, { items }); }} placeholder="説明（任意）" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                  </div>
                ))}
                <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { title: '', description: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm">
                  + 項目を追加
                </button>
              </div>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="開催まであと" />
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-900 block mb-2">開催日時</label>
              <input type="datetime-local" value={block.data.targetDate?.slice(0, 16) || ''} onChange={e => updateBlock(block.id, { targetDate: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            <Input label="期限切れ時テキスト" val={block.data.expiredText || ''} onChange={v => updateBlock(block.id, { expiredText: v })} ph="アーカイブ視聴可能" />
          </div>
        );

      case 'cta_section':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="今すぐ参加する" />
            <Textarea label="説明文" val={block.data.description || ''} onChange={v => updateBlock(block.id, { description: v })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="無料で参加する" />
              <Input label="ボタンURL" val={block.data.buttonUrl || ''} onChange={v => updateBlock(block.id, { buttonUrl: v })} ph="https://..." />
            </div>
            <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
              <input type="checkbox" id={`fullwidth-cta-${block.id}`} checked={block.data.isFullWidth || false} onChange={e => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-violet-600" />
              <label htmlFor={`fullwidth-cta-${block.id}`} className="text-sm font-medium text-violet-800">🖥️ 全幅表示（PC向け）</label>
            </div>
          </div>
        );

      case 'delayed_cta':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="特別なご案内" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="今すぐ申し込む" />
              <Input label="ボタンURL" val={block.data.buttonUrl || ''} onChange={v => updateBlock(block.id, { buttonUrl: v })} ph="https://..." />
            </div>
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-900 block mb-2">遅延時間（秒）</label>
              <input type="number" value={block.data.delaySeconds ?? 300} onChange={e => updateBlock(block.id, { delaySeconds: parseInt(e.target.value) || 0 })} min={0} className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">0 = 即時表示、300 = 5分後に表示</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">ボタン色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.buttonColor || '#7c3aed'} onChange={e => updateBlock(block.id, { buttonColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.buttonColor || '#7c3aed'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">文字色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.buttonTextColor || '#ffffff'} onChange={e => updateBlock(block.id, { buttonTextColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.buttonTextColor || '#ffffff'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            {(block.data.items || []).map((item: { id: string; name: string; role: string; comment: string; imageUrl?: string }, i: number) => (
              <div key={item.id || i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">参加者 {i + 1}</span>
                  <button onClick={() => { const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i); updateBlock(block.id, { items }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      UP
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, `testimonial-image-${i}`).then(() => {
                        // handled by updateBlock
                      })} disabled={isUploading} />
                    </label>
                    {testimonialPresetImages.map(preset => (
                      <button key={preset.label} onClick={() => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], imageUrl: preset.url }; updateBlock(block.id, { items }); }} className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-violet-400 transition-colors" title={preset.label}>
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button onClick={() => handleRandomImage(block.id, `testimonial-${i}`, 'portrait')} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs hover:bg-gray-200">
                      <Shuffle size={12} />
                    </button>
                  </div>
                  {item.imageUrl && <img src={item.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover mt-2" />}
                </div>
                <Input label="名前" val={item.name} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], name: v }; updateBlock(block.id, { items }); }} ph="参加者名" />
                <Input label="肩書き" val={item.role} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], role: v }; updateBlock(block.id, { items }); }} ph="会社名 / 職種" />
                <Textarea label="コメント" val={item.comment} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], comment: v }; updateBlock(block.id, { items }); }} rows={3} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm">
              + 参加者を追加
            </button>
          </div>
        );

      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="タイトル" />
            <Textarea label="テキスト" val={block.data.text || ''} onChange={v => updateBlock(block.id, { text: v })} rows={4} />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.url || ''} onChange={e => updateBlock(block.id, { url: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'url')} disabled={isUploading} />
                </label>
              </div>
              {block.data.url && <img src={block.data.url} alt="" className="w-full max-h-40 object-cover rounded-lg mt-2" />}
            </div>
            <Input label="キャプション" val={block.data.caption || ''} onChange={v => updateBlock(block.id, { caption: v })} ph="画像の説明" />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3">
            {(block.data.items || []).map((item: { id: string; question: string; answer: string }, i: number) => (
              <div key={item.id || i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Q{i + 1}</span>
                  <button onClick={() => { const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i); updateBlock(block.id, { items }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
                <Input label="質問" val={item.question} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], question: v }; updateBlock(block.id, { items }); }} ph="よくある質問" />
                <Textarea label="回答" val={item.answer} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], answer: v }; updateBlock(block.id, { items }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), question: '', answer: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm">
              + 質問を追加
            </button>
          </div>
        );

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="無料で参加する" />
            <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="申し込む" />
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">このブロックの編集フォームは準備中です</p>;
    }
  };

  // エディタ部分のレンダリング
  const renderEditor = () => (
    <div className="space-y-4 pb-32">
      {/* ステップ1: テーマ設定 */}
      <Section
        title="テーマ設定"
        icon={Palette}
        isOpen={openSections.theme}
        onToggle={() => toggleSection('theme')}
        step={1}
        stepLabel="タイトル・背景デザインを設定"
        headerBgColor="bg-violet-50"
        headerHoverColor="hover:bg-violet-100"
        accentColor="bg-violet-100 text-violet-600"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              label="LPタイトル"
              val={lp.title || ''}
              onChange={v => setLp(prev => ({ ...prev, title: v }))}
              ph="未入力の場合「無題のウェビナーLP」になります"
            />
            <Textarea
              label="説明文（SEO用）"
              val={lp.description || ''}
              onChange={v => setLp(prev => ({ ...prev, description: v }))}
              rows={2}
            />
          </div>

          {/* グラデーション選択 */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">背景グラデーション</label>
            <div className="grid grid-cols-4 gap-2">
              {gradientPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setLp(prev => ({ ...prev, settings: { ...prev.settings, theme: { gradient: preset.value, animated: preset.animated, backgroundImage: undefined } } }))}
                  className={`p-1 rounded-lg border-2 transition-all ${lp.settings?.theme?.gradient === preset.value ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <div className={`w-full h-12 rounded ${preset.animated ? 'animate-gradient-xy' : ''}`} style={{ background: preset.value, backgroundSize: '400% 400%' }} />
                  <span className="text-xs text-gray-600 block mt-1 text-center">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* カスタムカラー作成ボタン */}
            <div className="mt-4">
              <button
                onClick={() => setShowColorPicker(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Palette size={18} />
                カスタムカラーを作成
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ステップ2: ブロック編集 */}
      <Section
        title="ブロック"
        icon={Layout}
        isOpen={openSections.blocks}
        onToggle={() => toggleSection('blocks')}
        badge={`${lp.content?.length || 0}個`}
        step={2}
        stepLabel="コンテンツブロックを追加・編集"
        headerBgColor="bg-orange-50"
        headerHoverColor="hover:bg-orange-100"
        accentColor="bg-orange-100 text-orange-600"
      >
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

        {/* ブロック追加 */}
        <div className="relative mt-4">
          <button onClick={() => setShowBlockSelector(!showBlockSelector)} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 font-medium">
            <Plus size={20} />
            ブロックを追加
          </button>

          {showBlockSelector && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 max-h-80 overflow-y-auto">
              <p className="text-xs font-bold text-violet-600 mb-2">ウェビナーLP専用</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {blockTypes.filter(bt => bt.category === 'webinar').map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-200">
                    <bt.icon size={24} className="text-violet-600" />
                    <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-600 mb-2">共通ブロック</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {blockTypes.filter(bt => bt.category === 'common').map(bt => (
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

      {/* ステップ3: 高度な設定 */}
      <Section
        title="高度な設定"
        icon={Settings}
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
        step={3}
        stepLabel="各種オプションを設定（任意）"
        headerBgColor="bg-gray-100"
        headerHoverColor="hover:bg-gray-200"
        accentColor="bg-gray-200 text-gray-600"
      >
        <div className="space-y-4">
          {/* ポータル掲載 */}
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-violet-900 flex items-center gap-2 mb-1">
                  <Star size={18} className="text-violet-600" /> ポータルに掲載する
                </h4>
                <p className="text-xs text-violet-700">
                  ポータルに掲載することで、SEO対策として効果的となります。より多くの方にウェビナーを見てもらえます。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={lp.settings?.showInPortal === undefined ? true : lp.settings?.showInPortal} onChange={e => setLp(prev => ({ ...prev, settings: { ...prev.settings, showInPortal: e.target.checked } }))} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>

          {/* フッター非表示（Proプラン特典） */}
          <div className={`p-4 rounded-xl border ${userPlan.canHideCopyright ? 'bg-violet-50 border-violet-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${userPlan.canHideCopyright ? 'text-violet-900' : 'text-gray-500'}`}>
                  {userPlan.canHideCopyright ? <Eye size={18} className="text-violet-600" /> : <Lock size={18} className="text-gray-400" />}
                  フッターを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${userPlan.canHideCopyright ? 'bg-violet-500 text-white' : 'bg-gray-400 text-white'}`}>Pro</span>
                </h4>
                <p className={`text-xs ${userPlan.canHideCopyright ? 'text-violet-700' : 'text-gray-500'}`}>
                  コンテンツ下部のフッターを非表示にします。
                </p>
                {!userPlan.canHideCopyright && <p className="text-xs text-violet-600 mt-2 font-medium">※ Proプランにアップグレードすると利用可能になります</p>}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <input type="checkbox" className="sr-only peer" checked={userPlan.canHideCopyright && (lp.settings?.hideFooter || false)} onChange={e => { if (userPlan.canHideCopyright) setLp(prev => ({ ...prev, settings: { ...prev.settings, hideFooter: e.target.checked } })); }} disabled={!userPlan.canHideCopyright} />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${userPlan.canHideCopyright ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-violet-600' : 'bg-gray-300'}`}></div>
              </label>
            </div>
          </div>

          {/* 関連コンテンツ非表示（Proプラン特典） */}
          <div className={`p-4 rounded-xl border ${userPlan.canHideCopyright ? 'bg-violet-50 border-violet-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${userPlan.canHideCopyright ? 'text-violet-900' : 'text-gray-500'}`}>
                  {userPlan.canHideCopyright ? <Eye size={18} className="text-violet-600" /> : <Lock size={18} className="text-gray-400" />}
                  関連コンテンツを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${userPlan.canHideCopyright ? 'bg-violet-500 text-white' : 'bg-gray-400 text-white'}`}>Pro</span>
                </h4>
                <p className={`text-xs ${userPlan.canHideCopyright ? 'text-violet-700' : 'text-gray-500'}`}>
                  ページ下部の関連コンテンツセクションを非表示にします。
                </p>
                {!userPlan.canHideCopyright && <p className="text-xs text-violet-600 mt-2 font-medium">※ Proプランにアップグレードすると利用可能になります</p>}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <input type="checkbox" className="sr-only peer" checked={userPlan.canHideCopyright && (lp.settings?.hideRelatedContent || false)} onChange={e => { if (userPlan.canHideCopyright) setLp(prev => ({ ...prev, settings: { ...prev.settings, hideRelatedContent: e.target.checked } })); }} disabled={!userPlan.canHideCopyright} />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${userPlan.canHideCopyright ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-violet-600' : 'bg-gray-300'}`}></div>
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* カスタムURL */}
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">カスタムURL（任意）</label>
            <input
              className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-violet-500 outline-none bg-white placeholder-gray-400 transition-shadow ${slugError ? 'border-red-400' : 'border-gray-300'} ${initialData?.slug ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={customSlug}
              onChange={e => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setCustomSlug(val); validateCustomSlug(val); }}
              placeholder="my-webinar-page"
              disabled={!!initialData?.slug}
            />
            {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
            <p className="text-xs text-gray-500 mt-1">例: my-webinar, seminar-01<br />※英小文字、数字、ハイフンのみ（3〜20文字）。一度設定すると変更できません。</p>
            {customSlug && !slugError && (
              <p className="text-xs text-violet-600 mt-1">公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/webinar/{customSlug}</p>
            )}
          </div>

          <hr className="border-gray-200" />
          <Input label="Google Tag Manager ID" val={lp.settings?.gtmId || ''} onChange={v => setLp(prev => ({ ...prev, settings: { ...prev.settings, gtmId: v } }))} ph="GTM-XXXXXXX" />
          <Input label="Facebook Pixel ID" val={lp.settings?.fbPixelId || ''} onChange={v => setLp(prev => ({ ...prev, settings: { ...prev.settings, fbPixelId: v } }))} ph="1234567890" />
          <Input label="LINE Tag ID" val={lp.settings?.lineTagId || ''} onChange={v => setLp(prev => ({ ...prev, settings: { ...prev.settings, lineTagId: v } }))} ph="xxxxx-xxxxx" />
        </div>
      </Section>

      {/* 保存ボタン（下部） */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 transition-all shadow-md text-lg">
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {initialData?.id ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 shadow-md">
            ログイン / 新規登録
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 成功モーダル */}
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedSlug}
        onClose={() => setShowSuccessModal(false)}
        title="ウェビナーLP"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/webinar/${savedSlug}`}
        contentTitle={lp.title || 'ウェビナーLPを作成しました！'}
        theme="purple"
      />

      {/* ヘッダー */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'ウェビナーLP編集' : 'ウェビナーLP新規作成'}
          </h2>
        </div>
        <div className="flex gap-2">
          {justSavedSlug && (
            <button onClick={() => setShowSuccessModal(true)} className="hidden sm:flex bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-violet-700 hover:to-purple-700 shadow-md text-sm sm:text-base">
              <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {justSavedSlug && (
            <button onClick={() => window.open(`/webinar/${justSavedSlug}`, '_blank')} className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:bg-green-100 text-sm sm:text-base">
              <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          <button onClick={handleSave} disabled={isSaving} className="bg-violet-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-violet-700 shadow-md">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'edit' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <Edit3 size={18} /> 編集
          </button>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:text-gray-700'}`}>
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

        {/* 右側: リアルタイムプレビュー（iframe） */}
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
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button onClick={() => setPreviewMode('pc')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all ${previewMode === 'pc' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`} title="PC表示">
                  <Monitor size={14} /><span className="hidden xl:inline">PC</span>
                </button>
                <button onClick={() => setPreviewMode('mobile')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all ${previewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`} title="スマホ表示">
                  <Smartphone size={14} /><span className="hidden xl:inline">スマホ</span>
                </button>
              </div>
              <button onClick={resetPreview} className="text-gray-400 hover:text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-gray-700">
                <RefreshCw size={14} /><span className="hidden xl:inline">リセット</span>
              </button>
            </div>
          </div>
          {/* モバイル用ヘッダー */}
          <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <span className="text-white font-bold text-sm">プレビュー</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-800 rounded-lg p-0.5">
                <button onClick={() => setPreviewMode('pc')} className={`p-1.5 rounded transition-all ${previewMode === 'pc' ? 'bg-violet-600 text-white' : 'text-gray-400'}`} title="PC表示"><Monitor size={14} /></button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded transition-all ${previewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400'}`} title="スマホ表示"><Smartphone size={14} /></button>
              </div>
              <button onClick={resetPreview} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700"><RefreshCw size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-800">
            <div className={`w-full h-full bg-white ${previewMode === 'pc' ? '' : 'hidden'}`}>
              <iframe ref={pcIframeRef} src="/webinar/preview" className="w-full h-full border-0" title="PCプレビュー" key={`pc-${previewKey}`} />
            </div>
            <div className={`p-4 h-full flex items-center justify-center ${previewMode === 'mobile' ? '' : 'hidden'}`}>
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl" style={{ width: '390px' }}>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10 pointer-events-none" />
                <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '375px', height: '667px' }}>
                  <iframe ref={mobileIframeRef} src="/webinar/preview" className="w-full h-full border-0" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties} title="スマホプレビュー" key={`mobile-${previewKey}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>

      {/* カスタムカラーピッカーモーダル */}
      <CustomColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onApply={(value, isAnimated) => {
          setLp(prev => ({
            ...prev,
            settings: { ...prev.settings, theme: { gradient: value, animated: isAnimated ?? false, backgroundImage: undefined } },
          }));
        }}
        accentColor="emerald"
        userId={user?.id}
      />
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
      <div className={`w-full flex items-center justify-between p-4 cursor-pointer ${blockType?.color?.hover || 'hover:bg-gray-100'}`} onClick={handleToggle}>
        <div className="flex items-center gap-3 flex-1">
          <GripVertical size={18} className="text-gray-400" />
          <Icon size={18} className={blockType?.color?.icon || 'text-violet-600'} />
          <span className={`font-medium ${blockType?.color?.text || 'text-gray-700'}`}>
            {blockType?.label || block.type}
          </span>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
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

export default WebinarEditor;
