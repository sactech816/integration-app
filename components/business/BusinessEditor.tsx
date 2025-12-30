'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { BusinessLP, Block, generateBlockId } from '@/lib/types';
import { templates } from '@/constants/templates/business';
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
  Images
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';

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
  { type: 'header', label: 'ヘッダー', icon: Users, description: 'プロフィール画像・名前・肩書き', category: 'basic' },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'タイトル付きテキストカード', category: 'basic' },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション', category: 'basic' },
  { type: 'links', label: 'リンク集', icon: LinkIcon, description: 'SNSなどのリンクボタン', category: 'basic' },
  { type: 'youtube', label: 'YouTube', icon: Youtube, description: '動画埋め込み', category: 'basic' },
  // ビジネスLP専用ブロック
  { type: 'hero', label: 'ヒーロー', icon: Zap, description: 'ファーストビュー・メインビジュアル', category: 'business' },
  { type: 'hero_fullwidth', label: 'フルワイドヒーロー', icon: Layout, description: 'インパクトのあるファーストビュー', category: 'business' },
  { type: 'features', label: '特徴・ベネフィット', icon: Star, description: 'サービスの特徴を3列表示', category: 'business' },
  { type: 'problem_cards', label: '問題提起', icon: AlertTriangle, description: '顧客の悩みを可視化', category: 'business' },
  { type: 'two_column', label: '2カラム', icon: Columns, description: '画像とテキストの組み合わせ', category: 'business' },
  { type: 'cta_section', label: 'CTAセクション', icon: Target, description: 'コンバージョンポイント', category: 'business' },
  { type: 'dark_section', label: 'ダークセクション', icon: Layout, description: 'コントラストのあるセクション', category: 'business' },
  { type: 'case_study_cards', label: '事例紹介', icon: CheckSquare, description: '導入事例・実績紹介', category: 'business' },
  { type: 'bonus_section', label: '特典セクション', icon: Gift, description: '購入特典・無料プレゼント', category: 'business' },
  { type: 'checklist_section', label: 'チェックリスト', icon: List, description: '含まれるもの・条件一覧', category: 'business' },
  // 共通ブロック
  { type: 'testimonial', label: 'お客様の声', icon: MessageCircle, description: '推薦文・レビュー', category: 'common' },
  { type: 'pricing', label: '料金表', icon: DollarSign, description: 'プラン・価格表示', category: 'common' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問', category: 'common' },
  { type: 'lead_form', label: 'リードフォーム', icon: Mail, description: 'メールアドレス収集', category: 'common' },
  { type: 'line_card', label: 'LINE', icon: MessageCircle, description: 'LINE公式アカウント誘導', category: 'common' },
  { type: 'kindle', label: 'Kindle', icon: Book, description: '書籍紹介カード', category: 'common' },
  { type: 'google_map', label: 'Googleマップ', icon: MapPin, description: '地図埋め込み', category: 'common' },
  { type: 'quiz', label: '診断クイズ', icon: Brain, description: '診断クイズ埋め込み', category: 'common' },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: 'カウントダウンタイマー', category: 'common' },
  { type: 'gallery', label: 'ギャラリー', icon: Images, description: '複数画像スライドショー', category: 'common' },
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

// ランダム画像URL生成
const getRandomImageUrl = (category: string = 'business') => {
  const categories: Record<string, string[]> = {
    portrait: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
    ],
    business: [
      'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80',
    ],
  };
  const urls = categories[category] || categories.business;
  return urls[Math.floor(Math.random() * urls.length)];
};

// お客様の声用プリセット画像
const testimonialPresetImages = [
  { label: '男性A', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性B', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性A', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性B', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-10 text-xl border border-gray-300 rounded-lg bg-white hover:border-amber-500 flex items-center justify-center transition-colors"
        >
          {value || '選択'}
        </button>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="絵文字を入力"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm"
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
  badge
}: { 
  title: string, 
  icon: React.ComponentType<{ size?: number }>, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode,
  badge?: string
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    <button 
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{badge}</span>
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

  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {
        backgroundImage: gradient,
        backgroundSize: '400% 400%',
      };

  return (
    <div 
      className={`min-h-screen ${!backgroundImage ? 'animate-gradient-xy' : ''}`}
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
  const [expandedBlock, setExpandedBlock] = useState<string | null>(initialBlocks[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<'pc' | 'mobile'>('pc');
  const pcIframeRef = React.useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = React.useRef<HTMLIFrameElement>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [justSavedSlug, setJustSavedSlug] = useState<string | null>(null);

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
      alert('AI生成が完了しました！');
    } catch (error) {
      console.error('Generate error:', error);
      alert('AI生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setIsSaving(true);
    try {
      // カスタムURL or 既存 or 自動生成
      const newSlug = customSlug.trim() || savedSlug || generateSlug();
      
      // タイトルが未入力の場合はデフォルト名を使用
      const finalTitle = lp.title?.trim() || '無題のビジネスLP';
      
      // business_projectsテーブルの構造に合わせる
      // title, descriptionはsettingsに含める
      const payload = {
        content: lp.content,
        settings: {
          ...lp.settings,
          title: finalTitle,
          description: lp.description,
        },
        slug: newSlug,
      };

      let result;
      if (initialData?.id) {
        result = await supabase
          ?.from('business_projects')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single();
      } else {
        result = await supabase
          ?.from('business_projects')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
      }

      if (result?.error) {
        console.error('Business LP save error:', result.error);
        throw result.error;
      }

      if (result?.data) {
        setSavedSlug(result.data.slug);
        setJustSavedSlug(result.data.slug);
        if (!initialData) {
          setShowSuccessModal(true);
        } else {
          alert('保存しました！');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    setLp(prev => ({
      ...prev,
      content: [...(prev.content || []), newBlock],
    }));
    setExpandedBlock(newBlock.id);
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
      alert('アップロードエラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsUploading(false);
    }
  };

  // ランダム画像設定
  const handleRandomImage = (blockId: string, field: string, category: string = 'business') => {
    const randomUrl = getRandomImageUrl(category);
    updateBlock(blockId, { [field]: randomUrl });
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
        return { id, type: 'google_map', data: { address: '', title: '所在地', showDirections: true } };
      case 'quiz':
        return { id, type: 'quiz', data: { quizId: '', quizSlug: '', title: '' } };
      case 'countdown':
        return { id, type: 'countdown', data: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '期間限定キャンペーン', expiredText: 'キャンペーンは終了しました', backgroundColor: '#ef4444' } };
      case 'gallery':
        return { id, type: 'gallery', data: { items: [], columns: 3 as const, showCaptions: true, title: 'ギャラリー' } };
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
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'avatar')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'avatar', 'portrait')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                  <Shuffle size={14} />
                </button>
          </div>
            </div>
            <Input label="名前" val={block.data.name || ''} onChange={(v) => updateBlock(block.id, { name: v })} ph="山田 太郎" />
            <Input label="肩書き" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="代表取締役 / コンサルタント" />
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
                <button onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Shuffle size={14} /></button>
              </div>
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
                <button onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Shuffle size={14} /></button>
              </div>
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
                <button onClick={() => handleRandomImage(block.id, 'imageUrl', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Shuffle size={14} /></button>
              </div>
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
                <input type="text" value={block.data.url || ''} onChange={(e) => updateBlock(block.id, { url: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center">
                  <UploadCloud size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'url')} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'url', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Shuffle size={14} /></button>
              </div>
            </div>
            <Input label="キャプション（任意）" val={block.data.caption || ''} onChange={(v) => updateBlock(block.id, { caption: v })} />
          </div>
        );

      case 'youtube':
        return <Input label="YouTube URL" val={block.data.url || ''} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." />;

      case 'links':
        return (
          <div className="space-y-4">
            {block.data.links?.map((link: { label: string; url: string; style?: string }, i: number) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newLinks = block.data.links.filter((_: unknown, idx: number) => idx !== i); updateBlock(block.id, { links: newLinks }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <Input label="ラベル" val={link.label} onChange={(v) => { const newLinks = [...block.data.links]; newLinks[i].label = v; updateBlock(block.id, { links: newLinks }); }} ph="ホームページ" />
                <Input label="URL" val={link.url} onChange={(v) => { const newLinks = [...block.data.links]; newLinks[i].url = v; updateBlock(block.id, { links: newLinks }); }} ph="https://..." />
                <div className="mt-2">
                  <label className="text-xs font-bold text-gray-600 block mb-2">ボタンスタイル</label>
                  <div className="flex flex-wrap gap-2">
                    {linkStyleOptions.map((opt) => (
                      <button key={opt.value} onClick={() => { const newLinks = [...block.data.links]; newLinks[i].style = opt.value; updateBlock(block.id, { links: newLinks }); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 ${(link.style || '') === opt.value ? 'ring-2 ring-amber-400 border-amber-500' : 'border-gray-200'}`}>{opt.label}</button>
            ))}
          </div>
                </div>
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { links: [...(block.data.links || []), { label: '', url: '', style: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ リンクを追加</button>
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
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-600 block mb-2">プロフィール画像</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {testimonialPresetImages.map((preset) => (
                      <button key={preset.label} onClick={() => { const newItems = [...block.data.items]; newItems[i].imageUrl = preset.url; updateBlock(block.id, { items: newItems }); }} className={`p-0.5 rounded-full border-2 ${item.imageUrl === preset.url ? 'border-amber-500' : 'border-gray-200'}`}>
                        <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="お名前" val={item.name} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].name = v; updateBlock(block.id, { items: newItems }); }} ph="田中 花子" />
                <Input label="肩書き" val={item.role} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].role = v; updateBlock(block.id, { items: newItems }); }} ph="30代・会社員" />
                <Textarea label="コメント" val={item.comment} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].comment = v; updateBlock(block.id, { items: newItems }); }} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ お客様の声を追加</button>
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

      case 'google_map':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="所在地" />
            <Input label="住所" val={block.data.address || ''} onChange={(v) => updateBlock(block.id, { address: v })} ph="東京都渋谷区..." />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={block.data.showDirections || false} onChange={(e) => updateBlock(block.id, { showDirections: e.target.checked })} />
              <label className="text-sm text-gray-700">経路案内ボタンを表示</label>
            </div>
          </div>
        );

      case 'dark_section':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} />
            <Input label="サブタイトル" val={block.data.subtitle || ''} onChange={(v) => updateBlock(block.id, { subtitle: v })} />
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
            {block.data.items?.map((item: { id: string; icon?: string; title: string; description: string }, i: number) => (
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
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), icon: '🎁', title: '', description: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 特典を追加</button>
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
            {block.data.items?.map((item: { id: string; imageUrl?: string; category?: string; title: string; description: string; categoryColor?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => { const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id); updateBlock(block.id, { items: newItems }); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-900 block mb-2">事例画像</label>
                  <div className="flex gap-2">
                    <input type="text" value={item.imageUrl || ''} onChange={(e) => { const newItems = [...block.data.items]; newItems[i].imageUrl = e.target.value; updateBlock(block.id, { items: newItems }); }} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                    <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center">
                      <UploadCloud size={14} />
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !supabase) return;
                        if (file.size > MAX_IMAGE_SIZE) { alert('画像サイズが大きすぎます。最大2MBまで対応しています。'); return; }
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                        const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                        const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                        if (uploadError) { alert('アップロードエラー: ' + uploadError.message); return; }
                        const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                        const newItems = [...block.data.items]; newItems[i].imageUrl = data.publicUrl; updateBlock(block.id, { items: newItems });
                      }} />
                    </label>
                    <button onClick={() => { const newItems = [...block.data.items]; newItems[i].imageUrl = getRandomImageUrl('business'); updateBlock(block.id, { items: newItems }); }} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Shuffle size={14} /></button>
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
                <Textarea label="説明・成果" val={item.description} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].description = v; updateBlock(block.id, { items: newItems }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), imageUrl: '', category: 'カテゴリ', title: '', description: '', categoryColor: 'blue' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 事例を追加</button>
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
                  <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 cursor-pointer flex items-center">
                    <UploadCloud size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !supabase) return;
                      if (file.size > MAX_IMAGE_SIZE) { alert('画像サイズが大きすぎます。最大2MBまで対応しています。'); return; }
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                      const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                      if (uploadError) { alert('アップロードエラー: ' + uploadError.message); return; }
                      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                      const newItems = [...block.data.items]; newItems[i].imageUrl = data.publicUrl; updateBlock(block.id, { items: newItems });
                    }} />
                  </label>
                  <button onClick={() => { const newItems = [...block.data.items]; newItems[i].imageUrl = getRandomImageUrl('business'); updateBlock(block.id, { items: newItems }); }} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Shuffle size={14} /></button>
                </div>
                <Input label="キャプション（任意）" val={item.caption || ''} onChange={(v) => { const newItems = [...block.data.items]; newItems[i].caption = v; updateBlock(block.id, { items: newItems }); }} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), imageUrl: '', caption: '' }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 font-medium">+ 画像を追加</button>
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">このブロックタイプの編集はまだサポートされていません</p>;
    }
  };

  // エディター本体のレンダリング
  const renderEditor = () => (
    <div className="space-y-4">
      {/* テンプレート・AI生成セクション */}
      <Section
        title="テンプレート・AI生成"
        icon={Sparkles}
        isOpen={openSections.template}
        onToggle={() => toggleSection('template')}
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
                  {template.recommended && <span className="text-xs text-amber-600">おすすめ</span>}
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

      {/* テーマ設定 */}
      <Section
        title="テーマ設定"
        icon={Palette}
        isOpen={openSections.theme}
        onToggle={() => toggleSection('theme')}
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
        </div>
      </div>
      </Section>

      {/* ブロック編集セクション */}
      <Section
        title="ブロック"
        icon={Layout}
        isOpen={openSections.blocks}
        onToggle={() => toggleSection('blocks')}
        badge={`${lp.content?.length || 0}個`}
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
              <div key={block.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
              >
                  <div className="flex items-center gap-3 flex-1">
                  <GripVertical size={18} className="text-gray-400" />
                  <Icon size={18} className="text-amber-600" />
                  <span className="font-medium text-gray-700">
                    {blockType?.label || block.type}
                  </span>
                </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => moveBlock(block.id, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button onClick={() => moveBlock(block.id, 'down')} disabled={index === (lp.content?.length || 0) - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown size={16} /></button>
                    <button onClick={() => removeBlock(block.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    <button onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)} className="p-1 text-gray-400">
                  {expandedBlock === block.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
                  </div>
                </div>

              {expandedBlock === block.id && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {renderBlockEditor(block)}
                </div>
              )}
            </div>
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

      {/* 高度な設定 */}
      <Section
        title="高度な設定"
        icon={Settings}
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
      >
        <div className="space-y-4">
          {/* カスタムURL */}
          <div>
            <Input 
              label="カスタムURL（任意）" 
              val={customSlug} 
              onChange={(v) => setCustomSlug(v.replace(/[^a-zA-Z0-9-_]/g, ''))} 
              ph="my-business-page" 
            />
            <p className="text-xs text-gray-500 mt-1">
              ※ 英数字とハイフン、アンダースコアのみ使用可能。空欄の場合は自動生成されます。
            </p>
            {customSlug && (
              <p className="text-xs text-amber-600 mt-1">
                公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/business/{customSlug}
              </p>
            )}
          </div>
          
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
      {showSuccessModal && savedSlug && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-6 flex justify-between items-center z-10 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Trophy size={24} /> ビジネスLPを作成しました！
                </h3>
                <p className="text-sm text-amber-100 mt-1">公開URLをコピーしてシェアできます</p>
              </div>
              <button onClick={() => setShowSuccessModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 1. 公開URL */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/business/${savedSlug}`}
                    readOnly
                    className="flex-1 text-xs bg-white border border-amber-300 p-2 rounded-lg text-gray-900 font-bold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/business/${savedSlug}`);
                      alert('URLをコピーしました！');
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-700"
                  >
                    <Copy size={16} className="inline mr-1" /> コピー
                  </button>
                </div>
              </div>

              {/* 2. アクセスボタン */}
              <button
                onClick={() => {
                  window.open(`/business/${savedSlug}`, '_blank');
                }}
                className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                <ExternalLink size={20} /> ビジネスLPにアクセス
              </button>

              {/* 3. SNSでシェア */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-3 text-center">SNSでシェア</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/business/${savedSlug}`;
                      const text = encodeURIComponent(lp.title || 'ビジネスLP');
                      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800"
                  >
                    𝕏 ポスト
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/business/${savedSlug}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/business/${savedSlug}`;
                      const text = encodeURIComponent(lp.title || 'ビジネスLP');
                      window.open(`https://line.me/R/msg/text/?${text}%0A${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600"
                  >
                    LINE
                  </button>
                </div>
              </div>

              {/* 4. QRコード表示・保存 */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-gray-700 mb-3">QRコード</p>
                <div className="inline-block bg-white p-3 rounded-lg border border-gray-200 mb-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/business/${savedSlug}`)}`}
                    alt="QRコード"
                    className="w-36 h-36"
                  />
                </div>
                <div>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/business/${savedSlug}`)}&format=png`}
                    download={`business-lp-${savedSlug}-qr.png`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300"
                  >
                    <ImageIcon size={16} /> QRコードを保存
                  </a>
                </div>
              </div>

              {/* 5. 寄付エリア */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm font-bold text-amber-700 mb-2 text-center">💝 開発を応援する</p>
                <p className="text-xs text-gray-600 text-center mb-3">
                  サービスを気に入っていただけたら、開発継続のためのサポートをお願いします
                </p>
                <div className="flex justify-center gap-2">
                  <a
                    href="https://buy.stripe.com/test_xxx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700"
                  >
                    ☕ コーヒー1杯分
                  </a>
                  <a
                    href="https://buy.stripe.com/test_yyy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold text-sm hover:from-amber-700 hover:to-orange-700"
                  >
                    🍰 ランチ1回分
                  </a>
                </div>
              </div>

              {/* 6. 閉じる */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー - 共通ヘッダー(64px)の下に配置 */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'ビジネスLP編集' : '新規作成'}
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
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
                <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '375px', height: '667px' }}>
                  <iframe
                    ref={mobileIframeRef}
                    src="/business/preview"
                    className="w-full h-full border-0"
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
        </div>
      );
};

export default BusinessEditor;
