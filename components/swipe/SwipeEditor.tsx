'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save, ExternalLink, Plus, Settings, ChevronDown, ChevronUp,
  Layers, Type, CreditCard, Eye, Pencil, LayoutTemplate,
  Image as ImageIcon, Smartphone, Monitor, Trophy, Loader2,
  GripVertical, ArrowUp, ArrowDown, Trash2, HelpCircle,
  Star, MessageCircle, MapPin, Timer, Youtube, Link as LinkIcon,
  Images, Layout,
} from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { SwipePage, SwipeCard, SwipeAspectRatio, SwipeSettings, SwipeCarouselSettings, Block } from '@/lib/types';
import SwipeCardEditor from './SwipeCardEditor';
import SwipeCarousel, { ASPECT_SIZES } from './SwipeCarousel';
import { swipeTemplates } from '@/constants/templates/swipe';
import { SWIPE_CATEGORIES } from '@/constants/templates/types';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import BlockRenderer from '@/components/shared/BlockRenderer';

// ブロックタイプ定義（ProfileEditor準拠：色・アイコン付き）
const blockTypes = [
  { type: 'text_card', label: 'テキスト', icon: Type, color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'image', label: '画像', icon: ImageIcon, color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'cta_section', label: 'CTAボタン', icon: ExternalLink, color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', hover: 'hover:bg-blue-100' } },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'pricing', label: '料金表', icon: CreditCard, color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'testimonial', label: 'お客様の声', icon: Star, color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100' } },
  { type: 'lead_form', label: 'リードフォーム', icon: Type, color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'line_card', label: 'LINE誘導', icon: MessageCircle, color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', hover: 'hover:bg-green-100' } },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'google_map', label: 'Googleマップ', icon: MapPin, color: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', hover: 'hover:bg-teal-100' } },
  { type: 'youtube', label: 'YouTube', icon: Youtube, color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'links', label: 'リンク集', icon: LinkIcon, color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', hover: 'hover:bg-green-100' } },
  { type: 'gallery', label: 'ギャラリー', icon: Images, color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
];

const DEFAULT_CAROUSEL_SETTINGS: SwipeCarouselSettings = {
  autoPlay: true,
  intervalSeconds: 5,
  pauseOnHover: true,
  showArrows: true,
  showIndicator: true,
  mobileDisplay: 'swipe',
};

const DEFAULT_SETTINGS: SwipeSettings = {
  carousel: DEFAULT_CAROUSEL_SETTINGS,
  payment: { paymentType: 'free' },
  showInPortal: true,
};

function generateBlockId() {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateCardId() {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = 'sw-';
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return slug;
}

function createDefaultBlock(type: string): Block {
  const id = generateBlockId();
  switch (type) {
    case 'text_card':
      return { id, type: 'text_card', data: { title: '', text: '', align: 'left' as const } };
    case 'image':
      return { id, type: 'image', data: { url: '' } };
    case 'cta_section':
      return { id, type: 'cta_section', data: { title: '今すぐ申し込む', description: '', buttonText: '申し込む', buttonUrl: '#' } };
    case 'faq':
      return { id, type: 'faq', data: { items: [{ id: generateBlockId(), question: '', answer: '' }] } };
    case 'pricing':
      return { id, type: 'pricing', data: { plans: [{ id: generateBlockId(), title: 'プラン名', price: '¥0', features: ['特徴1'], isRecommended: false }] } };
    case 'testimonial':
      return { id, type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '', role: '', comment: '' }] } };
    case 'lead_form':
      return { id, type: 'lead_form', data: { title: 'お問い合わせ', buttonText: '送信' } };
    case 'line_card':
      return { id, type: 'line_card', data: { title: 'LINE登録', description: '', url: '', buttonText: '友だち追加' } };
    case 'countdown':
      return { id, type: 'countdown', data: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString(), title: '残り時間' } };
    case 'google_map':
      return { id, type: 'google_map', data: { address: '' } };
    case 'youtube':
      return { id, type: 'youtube', data: { url: '' } };
    case 'links':
      return { id, type: 'links', data: { links: [{ label: '', url: '', style: '' }] } };
    case 'gallery':
      return { id, type: 'gallery', data: { items: [], title: 'ギャラリー' } };
    default:
      return { id, type: 'text_card', data: { title: '', text: '', align: 'left' as const } };
  }
}

// ==========================================
// Section コンポーネント（ProfileEditor準拠）
// ==========================================
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
  accentColor = 'bg-emerald-100 text-emerald-600',
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
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
const Input = ({ label, val, onChange, ph }: { label: string; val: string; onChange: (v: string) => void; ph?: string }) => (
  <div>
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input
      type="text"
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
    />
  </div>
);

// ==========================================
// メインコンポーネント
// ==========================================
interface SwipeEditorProps {
  userId?: string;
  isAdmin?: boolean;
}

export default function SwipeEditor({ userId, isAdmin }: SwipeEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [swipePage, setSwipePage] = useState<SwipePage>({
    id: '',
    slug: '',
    title: '新規スワイプページ',
    cards: [],
    content: [],
    settings: DEFAULT_SETTINGS,
    aspect_ratio: '9:16',
    payment_type: 'free',
    status: 'draft',
  });

  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  // セクション開閉
  const [openSections, setOpenSections] = useState({
    template: !editId,
    cards: true,
    blocks: false,
    carousel: false,
    payment: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 編集時のデータ取得
  useEffect(() => {
    if (!editId || !supabase) return;
    (async () => {
      const { data, error } = await supabase
        .from(TABLES.SWIPE_PAGES)
        .select('*')
        .eq('id', editId)
        .single();
      if (error || !data) return;
      setSwipePage(data as SwipePage);
      setExistingId(data.id);
      setSavedSlug(data.slug);
      setSavedId(data.id);
      setOpenSections(prev => ({ ...prev, template: false, cards: true, blocks: true }));
    })();
  }, [editId]);

  // ==========================================
  // カード操作
  // ==========================================
  const addCard = useCallback(() => {
    const newCard: SwipeCard = {
      id: generateCardId(),
      type: 'image',
      sortOrder: swipePage.cards.length,
    };
    setSwipePage(prev => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
  }, [swipePage.cards.length]);

  const updateCard = useCallback((cardId: string, updates: Partial<SwipeCard>) => {
    setSwipePage(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
    }));
  }, []);

  const removeCard = useCallback((cardId: string) => {
    if (!confirm('このカードを削除しますか？')) return;
    setSwipePage(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== cardId),
    }));
  }, []);

  const moveCard = useCallback((index: number, direction: 'up' | 'down') => {
    setSwipePage(prev => {
      const cards = [...prev.cards];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= cards.length) return prev;
      [cards[index], cards[newIndex]] = [cards[newIndex], cards[index]];
      return { ...prev, cards };
    });
  }, []);

  // ==========================================
  // ブロック操作
  // ==========================================
  const addBlock = useCallback((type: string) => {
    const newBlock = createDefaultBlock(type);
    setSwipePage(prev => ({
      ...prev,
      content: [...(prev.content || []), newBlock],
    }));
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id));
    setShowBlockSelector(false);
  }, []);

  const removeBlock = useCallback((id: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setSwipePage(prev => ({
      ...prev,
      content: prev.content?.filter(b => b.id !== id),
    }));
  }, []);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setSwipePage(prev => {
      const content = [...(prev.content || [])];
      const index = content.findIndex(b => b.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= content.length) return prev;
      [content[index], content[newIndex]] = [content[newIndex], content[index]];
      return { ...prev, content };
    });
  }, []);

  const updateBlock = useCallback((id: string, data: Record<string, unknown>) => {
    setSwipePage(prev => ({
      ...prev,
      content: prev.content?.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } as Block : b
      ),
    }));
  }, []);

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${userId || 'guest'}/${Date.now()}_${blockId}.${ext}`;
      const { error } = await supabase.storage.from('swipe-images').upload(filePath, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('swipe-images').getPublicUrl(filePath);
      updateBlock(blockId, { [field]: data.publicUrl });
    } catch {
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // テンプレート適用
  // ==========================================
  const handleSelectTemplate = useCallback((templateId: string) => {
    const template = swipeTemplates.find(t => t.id === templateId);
    if (!template) return;

    if (swipePage.cards.length > 0 || (swipePage.content && swipePage.content.length > 0)) {
      if (!confirm(`「${template.name}」テンプレートを適用しますか？\n現在の内容は上書きされます。`)) return;
    }

    setSwipePage(prev => ({
      ...prev,
      title: template.name,
      aspect_ratio: template.aspectRatio,
      cards: template.cards.map((c, i) => ({
        id: generateCardId(),
        type: c.type,
        templateId: c.templateId,
        themeId: c.themeId,
        imageUrl: c.textOverlay?.backgroundImageUrl,
        textOverlay: c.textOverlay,
        sortOrder: i,
      })),
      content: template.blocks.map(b => ({ ...b, id: generateBlockId() })),
      settings: {
        ...prev.settings,
        carousel: {
          ...prev.settings.carousel,
          ...template.carouselSettings,
          pauseOnHover: true,
          showArrows: true,
          showIndicator: true,
        },
        theme: template.theme,
      },
    }));

    setOpenSections(prev => ({ ...prev, template: false, cards: true, blocks: true }));
    alert(`「${template.name}」テンプレートを適用しました`);
  }, [swipePage.cards.length, swipePage.content]);

  // ==========================================
  // 保存
  // ==========================================
  const handleSave = useCallback(async () => {
    if (!supabase) return alert('Supabaseが設定されていません');
    if (!userId) return alert('ログインしてください');

    setSaving(true);
    try {
      const saveData = {
        title: swipePage.title,
        description: swipePage.description,
        cards: swipePage.cards,
        content: swipePage.content || [],
        settings: swipePage.settings,
        aspect_ratio: swipePage.aspect_ratio,
        payment_type: swipePage.settings.payment.paymentType,
        payment_provider: swipePage.settings.payment.paymentProvider || null,
        price: swipePage.settings.payment.price || 0,
        stripe_price_id: swipePage.settings.payment.stripePriceId || null,
        payment_url: swipePage.settings.payment.paymentUrl || null,
        user_id: userId,
        status: 'published' as const,
      };

      if (existingId) {
        const { error } = await supabase
          .from(TABLES.SWIPE_PAGES)
          .update(saveData)
          .eq('id', existingId);
        if (error) throw error;
        alert('保存しました！');
      } else {
        let slug = generateSlug();
        for (let retry = 0; retry < 5; retry++) {
          const { data, error } = await supabase
            .from(TABLES.SWIPE_PAGES)
            .insert({ ...saveData, slug })
            .select('id, slug')
            .single();
          if (error?.code === '23505') {
            slug = generateSlug();
            continue;
          }
          if (error) throw error;
          setExistingId(data.id);
          setSavedId(data.id);
          setSavedSlug(data.slug);
          setSwipePage(prev => ({ ...prev, id: data.id, slug: data.slug }));
          setShowSuccessModal(true);
          router.replace(`/swipe/editor?id=${data.id}`);
          break;
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }, [swipePage, existingId, userId, router]);

  // ==========================================
  // ブロック編集レンダリング（ProfileEditor準拠）
  // ==========================================
  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル（任意）" val={(block.data as unknown as Record<string, string>).title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="見出しテキスト" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">テキスト</label>
              <textarea
                value={(block.data as unknown as Record<string, string>).text || ''}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                placeholder="テキストを入力してください..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[120px] resize-y"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">配置</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateBlock(block.id, { align: 'center' })}
                  className={`px-4 py-2 rounded-lg font-medium ${(block.data as unknown as Record<string, string>).align === 'center' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  中央
                </button>
                <button
                  onClick={() => updateBlock(block.id, { align: 'left' })}
                  className={`px-4 py-2 rounded-lg font-medium ${(block.data as unknown as Record<string, string>).align === 'left' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  左寄せ
                </button>
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
                  value={(block.data as unknown as Record<string, string>).url || ''}
                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'url')} disabled={isUploading} />
                </label>
              </div>
              {(block.data as unknown as Record<string, string>).url && (
                <img src={(block.data as unknown as Record<string, string>).url} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </div>
            <Input label="キャプション（任意）" val={(block.data as unknown as Record<string, string>).caption || ''} onChange={(v) => updateBlock(block.id, { caption: v })} ph="写真の説明" />
          </div>
        );

      case 'cta_section':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(block.data as unknown as Record<string, string>).title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="今すぐ申し込む" />
            <Input label="説明文" val={(block.data as unknown as Record<string, string>).description || ''} onChange={(v) => updateBlock(block.id, { description: v })} ph="限定特典付き" />
            <Input label="ボタンテキスト" val={(block.data as unknown as Record<string, string>).buttonText || ''} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="申し込む" />
            <Input label="ボタンURL" val={(block.data as unknown as Record<string, string>).buttonUrl || ''} onChange={(v) => updateBlock(block.id, { buttonUrl: v })} ph="https://..." />
          </div>
        );

      case 'faq': {
        const faqData = block.data as { items: Array<{ id: string; question: string; answer: string }> };
        return (
          <div className="space-y-4">
            {faqData.items?.map((item, i) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      const newItems = faqData.items.filter((_, idx) => idx !== i);
                      updateBlock(block.id, { items: newItems });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Input label={`質問 ${i + 1}`} val={item.question} onChange={(v) => {
                  const newItems = [...faqData.items];
                  newItems[i] = { ...newItems[i], question: v };
                  updateBlock(block.id, { items: newItems });
                }} ph="質問を入力" />
                <div className="mt-2">
                  <label className="text-sm font-bold text-gray-900 block mb-2">回答</label>
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const newItems = [...faqData.items];
                      newItems[i] = { ...newItems[i], answer: e.target.value };
                      updateBlock(block.id, { items: newItems });
                    }}
                    placeholder="回答を入力"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[80px] resize-y"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(faqData.items || []), { id: generateBlockId(), question: '', answer: '' }];
                updateBlock(block.id, { items: newItems });
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> 質問を追加
            </button>
          </div>
        );
      }

      case 'pricing': {
        const pricingData = block.data as { plans: Array<{ id: string; title: string; price: string; features: string[]; isRecommended: boolean }> };
        return (
          <div className="space-y-4">
            {pricingData.plans?.map((plan, i) => (
              <div key={plan.id} className="bg-gray-50 p-4 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      const newPlans = pricingData.plans.filter((_, idx) => idx !== i);
                      updateBlock(block.id, { plans: newPlans });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Input label="プラン名" val={plan.title} onChange={(v) => {
                  const newPlans = [...pricingData.plans];
                  newPlans[i] = { ...newPlans[i], title: v };
                  updateBlock(block.id, { plans: newPlans });
                }} ph="プラン名" />
                <div className="mt-2">
                  <Input label="価格" val={plan.price} onChange={(v) => {
                    const newPlans = [...pricingData.plans];
                    newPlans[i] = { ...newPlans[i], price: v };
                    updateBlock(block.id, { plans: newPlans });
                  }} ph="¥9,800" />
                </div>
                <div className="mt-2">
                  <label className="text-sm font-bold text-gray-900 block mb-2">特徴（1行ずつ）</label>
                  <textarea
                    value={plan.features.join('\n')}
                    onChange={(e) => {
                      const newPlans = [...pricingData.plans];
                      newPlans[i] = { ...newPlans[i], features: e.target.value.split('\n') };
                      updateBlock(block.id, { plans: newPlans });
                    }}
                    placeholder="特徴1&#10;特徴2&#10;特徴3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[80px] resize-y"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={plan.isRecommended}
                    onChange={(e) => {
                      const newPlans = [...pricingData.plans];
                      newPlans[i] = { ...newPlans[i], isRecommended: e.target.checked };
                      updateBlock(block.id, { plans: newPlans });
                    }}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="text-sm text-gray-700">おすすめプラン</span>
                </label>
              </div>
            ))}
            <button
              onClick={() => {
                const newPlans = [...(pricingData.plans || []), { id: generateBlockId(), title: '', price: '', features: [''], isRecommended: false }];
                updateBlock(block.id, { plans: newPlans });
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> プランを追加
            </button>
          </div>
        );
      }

      case 'testimonial': {
        const testData = block.data as { items: Array<{ id: string; name: string; role: string; comment: string }> };
        return (
          <div className="space-y-4">
            {testData.items?.map((item, i) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      const newItems = testData.items.filter((_, idx) => idx !== i);
                      updateBlock(block.id, { items: newItems });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Input label="名前" val={item.name} onChange={(v) => {
                  const newItems = [...testData.items];
                  newItems[i] = { ...newItems[i], name: v };
                  updateBlock(block.id, { items: newItems });
                }} ph="山田太郎" />
                <div className="mt-2">
                  <Input label="肩書き" val={item.role} onChange={(v) => {
                    const newItems = [...testData.items];
                    newItems[i] = { ...newItems[i], role: v };
                    updateBlock(block.id, { items: newItems });
                  }} ph="会社員" />
                </div>
                <div className="mt-2">
                  <label className="text-sm font-bold text-gray-900 block mb-2">コメント</label>
                  <textarea
                    value={item.comment}
                    onChange={(e) => {
                      const newItems = [...testData.items];
                      newItems[i] = { ...newItems[i], comment: e.target.value };
                      updateBlock(block.id, { items: newItems });
                    }}
                    placeholder="お客様の声を入力"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[80px] resize-y"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(testData.items || []), { id: generateBlockId(), name: '', role: '', comment: '' }];
                updateBlock(block.id, { items: newItems });
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> お客様の声を追加
            </button>
          </div>
        );
      }

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(block.data as unknown as Record<string, string>).title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="お問い合わせ" />
            <Input label="ボタンテキスト" val={(block.data as unknown as Record<string, string>).buttonText || ''} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="送信" />
          </div>
        );

      case 'line_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(block.data as unknown as Record<string, string>).title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="LINE登録" />
            <Input label="説明" val={(block.data as unknown as Record<string, string>).description || ''} onChange={(v) => updateBlock(block.id, { description: v })} ph="お気軽にご連絡ください" />
            <Input label="LINE URL" val={(block.data as unknown as Record<string, string>).url || ''} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://lin.ee/..." />
            <Input label="ボタンテキスト" val={(block.data as unknown as Record<string, string>).buttonText || ''} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="友だち追加" />
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={(block.data as unknown as Record<string, string>).title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="残り時間" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">終了日時</label>
              <input
                type="datetime-local"
                value={(block.data as unknown as Record<string, string>).targetDate?.slice(0, 16) || ''}
                onChange={(e) => updateBlock(block.id, { targetDate: new Date(e.target.value).toISOString() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        );

      case 'google_map':
        return (
          <div className="space-y-4">
            <Input label="住所" val={(block.data as unknown as Record<string, string>).address || ''} onChange={(v) => updateBlock(block.id, { address: v })} ph="東京都渋谷区..." />
            <Input label="埋め込みURL（任意）" val={(block.data as unknown as Record<string, string>).embedUrl || ''} onChange={(v) => updateBlock(block.id, { embedUrl: v })} ph="https://www.google.com/maps/embed?..." />
          </div>
        );

      case 'youtube':
        return (
          <Input label="YouTube URL" val={(block.data as unknown as Record<string, string>).url || ''} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." />
        );

      case 'links': {
        const linksData = block.data as { links: Array<{ label: string; url: string; style: string }> };
        return (
          <div className="space-y-4">
            {linksData.links?.map((link, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      const newLinks = linksData.links.filter((_, idx) => idx !== i);
                      updateBlock(block.id, { links: newLinks });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Input label="ラベル" val={link.label} onChange={(v) => {
                  const newLinks = [...linksData.links];
                  newLinks[i] = { ...newLinks[i], label: v };
                  updateBlock(block.id, { links: newLinks });
                }} ph="リンク名" />
                <div className="mt-2">
                  <Input label="URL" val={link.url} onChange={(v) => {
                    const newLinks = [...linksData.links];
                    newLinks[i] = { ...newLinks[i], url: v };
                    updateBlock(block.id, { links: newLinks });
                  }} ph="https://..." />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...(linksData.links || []), { label: '', url: '', style: '' }];
                updateBlock(block.id, { links: newLinks });
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> リンクを追加
            </button>
          </div>
        );
      }

      case 'gallery':
        return (
          <div className="space-y-4">
            <Input label="タイトル（任意）" val={(block.data as unknown as Record<string, string>).title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="ギャラリー" />
            <p className="text-sm text-gray-500">画像はプレビューから追加・管理できます</p>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">このブロックの編集機能は準備中です</p>;
    }
  };

  // ==========================================
  // 公開URL
  // ==========================================
  const publicUrl = (savedSlug || swipePage.slug)
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/swipe/${savedSlug || swipePage.slug}`
    : null;

  // ==========================================
  // レンダリング
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 成功モーダル */}
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedSlug}
        onClose={() => setShowSuccessModal(false)}
        title="スワイプページ"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/swipe/${savedSlug}`}
        contentTitle="スワイプページを作りました！"
        theme="purple"
        userId={userId}
        contentId={savedId || undefined}
        contentType="swipe"
      />

      {/* ヘッダー（ProfileEditor準拠） */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {existingId ? 'スワイプページ編集' : 'スワイプページ新規作成'}
          </h2>
        </div>
        <div className="flex gap-2">
          {savedSlug && (
            <>
              <button
                onClick={() => setShowSuccessModal(true)}
                className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-emerald-700 hover:to-teal-700 whitespace-nowrap transition-all shadow-md text-sm sm:text-base"
              >
                <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden md:inline">作成完了画面</span>
                <span className="md:hidden">完了</span>
              </button>
              <button
                onClick={() => {
                  if (publicUrl) {
                    navigator.clipboard.writeText(publicUrl);
                    alert('公開URLをコピーしました！');
                  }
                }}
                className="hidden sm:flex bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 text-sm sm:text-base"
              >
                <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden md:inline">公開URL</span>
                <span className="md:hidden">URL</span>
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-md transition-all whitespace-nowrap"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'editor'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Pencil size={18} /> 編集
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'preview'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex w-full">
        {/* 左パネル: エディタ */}
        <div className={`w-full lg:w-1/2 p-4 space-y-0 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>

          {/* タイトル */}
          <div className="mb-4">
            <Input label="ページタイトル" val={swipePage.title} onChange={(v) => setSwipePage(prev => ({ ...prev, title: v }))} ph="ページタイトルを入力" />
          </div>

          {/* ステップ1: テンプレート選択 */}
          <Section
            title="テンプレート選択"
            icon={LayoutTemplate}
            isOpen={openSections.template}
            onToggle={() => toggleSection('template')}
            step={1}
            stepLabel="テンプレートから始める"
            headerBgColor="bg-purple-50"
            headerHoverColor="hover:bg-purple-100"
            accentColor="bg-purple-100 text-purple-600"
          >
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              {swipeTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className="flex flex-col items-start gap-2 p-3 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ background: template.theme.gradient }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.cards.length}枚 / {template.blocks.length}ブロック</p>
                    </div>
                    {template.recommended && (
                      <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">おすすめ</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{template.description}</p>
                </button>
              ))}
            </div>

            {/* アスペクト比 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-sm font-bold text-gray-900 block mb-2">カードサイズ（アスペクト比）</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ASPECT_SIZES) as SwipeAspectRatio[]).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setSwipePage(prev => ({ ...prev, aspect_ratio: ratio }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      swipePage.aspect_ratio === ratio
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold">{ratio}</div>
                    <div className="text-[10px] mt-0.5">{ASPECT_SIZES[ratio].width}×{ASPECT_SIZES[ratio].height}</div>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* ステップ2: スワイプカード */}
          <Section
            title="スワイプカード"
            icon={Layers}
            isOpen={openSections.cards}
            onToggle={() => toggleSection('cards')}
            step={2}
            stepLabel="カードを追加・編集する"
            badge={`${swipePage.cards.length}枚`}
            headerBgColor="bg-blue-50"
            headerHoverColor="hover:bg-blue-100"
            accentColor="bg-blue-100 text-blue-600"
          >
            <div className="space-y-2">
              {swipePage.cards.map((card, i) => (
                <SwipeCardEditor
                  key={card.id}
                  card={card}
                  index={i}
                  aspectRatio={swipePage.aspect_ratio}
                  userId={userId}
                  onUpdate={updateCard}
                  onRemove={removeCard}
                  onMoveUp={() => moveCard(i, 'up')}
                  onMoveDown={() => moveCard(i, 'down')}
                  isFirst={i === 0}
                  isLast={i === swipePage.cards.length - 1}
                />
              ))}
              <button
                onClick={addCard}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} /> カードを追加
              </button>
              {swipePage.cards.length >= 20 && (
                <p className="text-xs text-amber-600 text-center">最大20枚まで追加できます</p>
              )}
            </div>
          </Section>

          {/* ステップ3: LP部分ブロック */}
          <Section
            title="LP部分（カード下）"
            icon={Layout}
            isOpen={openSections.blocks}
            onToggle={() => toggleSection('blocks')}
            step={3}
            stepLabel="LP部分のブロックを編集する"
            badge={`${swipePage.content?.length || 0}個`}
            headerBgColor="bg-green-50"
            headerHoverColor="hover:bg-green-100"
            accentColor="bg-green-100 text-green-600"
          >
            {/* ブロック一覧 */}
            <div className="space-y-3 min-h-[100px]">
              {(!swipePage.content || swipePage.content.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Layout size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ブロックがありません</p>
                  <p className="text-xs mt-1">下のボタンからブロックを追加してください</p>
                </div>
              )}
              {swipePage.content?.map((block, index) => {
                const blockType = blockTypes.find(bt => bt.type === block.type);
                const BlockIcon = blockType?.icon || Type;

                return (
                  <div key={block.id} className={`rounded-xl border overflow-hidden ${blockType?.color?.border || 'border-gray-200'} ${blockType?.color?.bg || 'bg-gray-50'}`}>
                    <div
                      className={`w-full flex items-center justify-between p-4 cursor-pointer ${blockType?.color?.hover || 'hover:bg-gray-100'}`}
                      onClick={() => setExpandedBlocks(prev => {
                        const next = new Set(prev);
                        if (next.has(block.id)) {
                          next.delete(block.id);
                        } else {
                          next.add(block.id);
                        }
                        return next;
                      })}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical size={18} className="text-gray-400" />
                        <BlockIcon size={18} className={blockType?.color?.icon || 'text-emerald-600'} />
                        <span className={`font-medium ${blockType?.color?.text || 'text-gray-700'}`}>
                          {blockType?.label || block.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === (swipePage.content?.length || 0) - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => setExpandedBlocks(prev => {
                            const next = new Set(prev);
                            if (next.has(block.id)) {
                              next.delete(block.id);
                            } else {
                              next.add(block.id);
                            }
                            return next;
                          })}
                          className="p-1 text-gray-400"
                        >
                          {expandedBlocks.has(block.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {expandedBlocks.has(block.id) && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        {renderBlockEditor(block)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ブロック追加（ProfileEditor準拠：ポップオーバー型） */}
            <div className="relative mt-4">
              <button
                onClick={() => setShowBlockSelector(!showBlockSelector)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium"
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
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-emerald-200"
                      >
                        <bt.icon size={24} className="text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">{bt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ステップ4: カルーセル設定 */}
          <Section
            title="カルーセル設定"
            icon={Settings}
            isOpen={openSections.carousel}
            onToggle={() => toggleSection('carousel')}
            headerBgColor="bg-gray-100"
            headerHoverColor="hover:bg-gray-200"
            accentColor="bg-gray-200 text-gray-600"
          >
            <div className="space-y-4">
              {/* 自動再生 */}
              <label className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">自動再生</span>
                <input
                  type="checkbox"
                  checked={swipePage.settings.carousel.autoPlay}
                  onChange={(e) => setSwipePage(prev => ({
                    ...prev,
                    settings: { ...prev.settings, carousel: { ...prev.settings.carousel, autoPlay: e.target.checked } },
                  }))}
                  className="w-5 h-5 rounded text-emerald-600"
                />
              </label>

              {swipePage.settings.carousel.autoPlay && (
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">秒数</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map(sec => (
                      <button
                        key={sec}
                        onClick={() => setSwipePage(prev => ({
                          ...prev,
                          settings: { ...prev.settings, carousel: { ...prev.settings.carousel, intervalSeconds: sec } },
                        }))}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          swipePage.settings.carousel.intervalSeconds === sec
                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {sec}秒
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">ホバーで一時停止</span>
                <input
                  type="checkbox"
                  checked={swipePage.settings.carousel.pauseOnHover}
                  onChange={(e) => setSwipePage(prev => ({
                    ...prev,
                    settings: { ...prev.settings, carousel: { ...prev.settings.carousel, pauseOnHover: e.target.checked } },
                  }))}
                  className="w-5 h-5 rounded text-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">矢印ボタン表示</span>
                <input
                  type="checkbox"
                  checked={swipePage.settings.carousel.showArrows}
                  onChange={(e) => setSwipePage(prev => ({
                    ...prev,
                    settings: { ...prev.settings, carousel: { ...prev.settings.carousel, showArrows: e.target.checked } },
                  }))}
                  className="w-5 h-5 rounded text-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">ページインジケーター</span>
                <input
                  type="checkbox"
                  checked={swipePage.settings.carousel.showIndicator}
                  onChange={(e) => setSwipePage(prev => ({
                    ...prev,
                    settings: { ...prev.settings, carousel: { ...prev.settings.carousel, showIndicator: e.target.checked } },
                  }))}
                  className="w-5 h-5 rounded text-emerald-600"
                />
              </label>

              {/* モバイル表示モード */}
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">
                  <Smartphone className="w-3.5 h-3.5 inline mr-1" />モバイル表示
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, carousel: { ...prev.settings.carousel, mobileDisplay: 'swipe' } },
                    }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      swipePage.settings.carousel.mobileDisplay === 'swipe'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    スワイプ
                  </button>
                  <button
                    onClick={() => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, carousel: { ...prev.settings.carousel, mobileDisplay: 'all' } },
                    }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      swipePage.settings.carousel.mobileDisplay === 'all'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    全表示
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* ステップ5: 決済設定 */}
          <Section
            title="決済設定"
            icon={CreditCard}
            isOpen={openSections.payment}
            onToggle={() => toggleSection('payment')}
            headerBgColor="bg-gray-100"
            headerHoverColor="hover:bg-gray-200"
            accentColor="bg-gray-200 text-gray-600"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">決済タイプ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, payment: { ...prev.settings.payment, paymentType: 'free' } },
                    }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      swipePage.settings.payment.paymentType === 'free'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    無料
                  </button>
                  <button
                    onClick={() => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, payment: { ...prev.settings.payment, paymentType: 'payment' } },
                    }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      swipePage.settings.payment.paymentType === 'payment'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    有料
                  </button>
                </div>
              </div>

              {swipePage.settings.payment.paymentType === 'payment' && (
                <>
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">決済方法</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSwipePage(prev => ({
                          ...prev,
                          settings: { ...prev.settings, payment: { ...prev.settings.payment, paymentProvider: 'stripe' } },
                        }))}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          swipePage.settings.payment.paymentProvider === 'stripe'
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        Stripe決済
                      </button>
                      <button
                        onClick={() => setSwipePage(prev => ({
                          ...prev,
                          settings: { ...prev.settings, payment: { ...prev.settings.payment, paymentProvider: 'external' } },
                        }))}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          swipePage.settings.payment.paymentProvider === 'external'
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        外部リンク
                      </button>
                    </div>
                  </div>

                  {swipePage.settings.payment.paymentProvider === 'stripe' && (
                    <>
                      <div>
                        <label className="text-sm font-bold text-gray-900 block mb-2">価格（円）</label>
                        <input
                          type="number"
                          value={swipePage.settings.payment.price || ''}
                          onChange={(e) => setSwipePage(prev => ({
                            ...prev,
                            settings: { ...prev.settings, payment: { ...prev.settings.payment, price: parseInt(e.target.value) || 0 } },
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="例: 9800"
                          min={100}
                        />
                      </div>
                      <Input
                        label="Stripe Price ID（任意）"
                        val={swipePage.settings.payment.stripePriceId || ''}
                        onChange={(v) => setSwipePage(prev => ({
                          ...prev,
                          settings: { ...prev.settings, payment: { ...prev.settings.payment, stripePriceId: v } },
                        }))}
                        ph="price_xxxxx"
                      />
                    </>
                  )}

                  {swipePage.settings.payment.paymentProvider === 'external' && (
                    <Input
                      label="決済URL"
                      val={swipePage.settings.payment.paymentUrl || ''}
                      onChange={(v) => setSwipePage(prev => ({
                        ...prev,
                        settings: { ...prev.settings, payment: { ...prev.settings.payment, paymentUrl: v } },
                      }))}
                      ph="https://..."
                    />
                  )}

                  <Input
                    label="購入ボタンテキスト"
                    val={swipePage.settings.payment.ctaText || ''}
                    onChange={(v) => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, payment: { ...prev.settings.payment, ctaText: v } },
                    }))}
                    ph="購入する"
                  />
                </>
              )}
            </div>
          </Section>

          {/* 保存ボタン（下部：ProfileEditor準拠） */}
          <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md text-lg"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              {existingId ? '更新して保存' : '保存して公開'}
            </button>
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] overflow-y-auto p-4 ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Eye className="w-3.5 h-3.5" /> プレビュー
              <span className="ml-auto text-gray-400">
                <Monitor className="w-3.5 h-3.5 inline mr-0.5" />PC: カルーセル表示
              </span>
            </div>

            {/* カルーセルプレビュー */}
            <SwipeCarousel
              cards={swipePage.cards}
              settings={swipePage.settings.carousel}
              aspectRatio={swipePage.aspect_ratio}
              isPreview
            />

            {/* LP部分プレビュー（BlockRenderer使用） */}
            {swipePage.content && swipePage.content.length > 0 && (
              <div className="mt-6 space-y-0">
                <p className="text-xs text-gray-400 font-medium mb-3">▼ LP部分</p>
                {swipePage.content.map(block => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    variant="profile"
                    isPreview
                  />
                ))}
              </div>
            )}

            {/* 決済ボタンプレビュー */}
            {swipePage.settings.payment.paymentType === 'payment' && (
              <div className="mt-6">
                <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg text-center">
                  {swipePage.settings.payment.ctaText || '購入する'}
                  {swipePage.settings.payment.price ? ` - ¥${swipePage.settings.payment.price.toLocaleString()}` : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
