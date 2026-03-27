'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save, ExternalLink, Plus, Settings, ChevronDown, ChevronUp,
  Layers, Type, CreditCard, Eye, Pencil, LayoutTemplate,
  Image as ImageIcon, Smartphone, Monitor, Trophy,
} from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { SwipePage, SwipeCard, SwipeAspectRatio, SwipeSettings, SwipeCarouselSettings, Block } from '@/lib/types';
import SwipeCardEditor from './SwipeCardEditor';
import SwipeCarousel, { ASPECT_SIZES } from './SwipeCarousel';
import { swipeTemplates } from '@/constants/templates/swipe';
import { SWIPE_CATEGORIES } from '@/constants/templates/types';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

// ブロック型のインポート（BlockRendererで使うブロックの作成用）
const AVAILABLE_BLOCKS = [
  { type: 'text_card', label: 'テキストカード', icon: Type },
  { type: 'image', label: '画像', icon: ImageIcon },
  { type: 'cta_section', label: 'CTAセクション', icon: ExternalLink },
  { type: 'faq', label: 'よくある質問', icon: Layers },
  { type: 'pricing', label: '料金表', icon: CreditCard },
  { type: 'testimonial', label: 'お客様の声', icon: Type },
  { type: 'lead_form', label: 'リードフォーム', icon: Type },
  { type: 'line_card', label: 'LINE誘導', icon: Type },
  { type: 'countdown', label: 'カウントダウン', icon: Type },
  { type: 'google_map', label: '地図', icon: Type },
  { type: 'youtube', label: '動画', icon: Type },
  { type: 'links', label: 'リンク集', icon: Type },
  { type: 'gallery', label: 'ギャラリー', icon: ImageIcon },
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

  // セクション開閉
  const [openSections, setOpenSections] = useState({
    template: !editId,
    cards: true,
    blocks: false,
    carousel: false,
    payment: false,
    advanced: false,
  });

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
      setOpenSections(prev => ({ ...prev, template: false, cards: true }));
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

    setOpenSections(prev => ({ ...prev, template: false, cards: true }));
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
  // セクション開閉ヘルパー
  // ==========================================
  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({ sectionKey, icon: Icon, title, badge, step, bgColor = 'bg-gray-50', hoverColor = 'hover:bg-gray-100', accentColor = 'bg-gray-200 text-gray-600' }: {
    sectionKey: keyof typeof openSections;
    icon: React.ElementType;
    title: string;
    badge?: string | number;
    step?: string;
    bgColor?: string;
    hoverColor?: string;
    accentColor?: string;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className={`w-full flex items-center justify-between px-4 py-3 ${bgColor} ${hoverColor} rounded-xl transition-colors`}
    >
      <div className="flex items-center gap-2">
        {step && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${accentColor}`}>{step}</span>}
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${accentColor}`}>{badge}</span>
        )}
      </div>
      {openSections[sectionKey] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );

  // ==========================================
  // 公開URL
  // ==========================================
  const publicUrl = swipePage.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/swipe/${swipePage.slug}`
    : null;

  // ==========================================
  // レンダリング
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">スワイプメーカー</h1>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> 公開URL
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {savedSlug && (
              <button
                onClick={() => setShowSuccessModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline">作成完了画面</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : existingId ? '更新して保存' : '保存して公開'}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 ${
            mobileTab === 'editor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <Pencil className="w-4 h-4" /> 編集
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 ${
            mobileTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <Eye className="w-4 h-4" /> プレビュー
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* 左パネル: エディタ */}
        <div className={`w-full lg:w-1/2 p-4 space-y-4 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          {/* タイトル */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ページタイトル</label>
            <input
              type="text"
              value={swipePage.title}
              onChange={(e) => setSwipePage(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="ページタイトルを入力"
            />
          </div>

          {/* テンプレート選択 */}
          <div>
            <SectionHeader sectionKey="template" icon={LayoutTemplate} title="テンプレート選択" step="STEP 1" bgColor="bg-purple-50" hoverColor="hover:bg-purple-100" accentColor="bg-purple-100 text-purple-600" />
            {openSections.template && (
              <div className="mt-3 grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                {swipeTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="flex flex-col items-start gap-2 p-3 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
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
            )}
          </div>

          {/* アスペクト比 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">カードサイズ（アスペクト比）</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ASPECT_SIZES) as SwipeAspectRatio[]).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setSwipePage(prev => ({ ...prev, aspect_ratio: ratio }))}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    swipePage.aspect_ratio === ratio
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{ratio}</div>
                  <div className="text-[10px] mt-0.5">{ASPECT_SIZES[ratio].width}×{ASPECT_SIZES[ratio].height}</div>
                </button>
              ))}
            </div>
          </div>

          {/* カード編集 */}
          <div>
            <SectionHeader sectionKey="cards" icon={Layers} title="スワイプカード" badge={swipePage.cards.length} step="STEP 2" bgColor="bg-blue-50" hoverColor="hover:bg-blue-100" accentColor="bg-blue-100 text-blue-600" />
            {openSections.cards && (
              <div className="mt-3 space-y-2">
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
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> カードを追加
                </button>
                {swipePage.cards.length >= 20 && (
                  <p className="text-xs text-amber-600 text-center">最大20枚まで追加できます</p>
                )}
              </div>
            )}
          </div>

          {/* LP部分ブロック */}
          <div>
            <SectionHeader sectionKey="blocks" icon={Type} title="LP部分（カード下）" badge={swipePage.content?.length || 0} step="STEP 3" bgColor="bg-green-50" hoverColor="hover:bg-green-100" accentColor="bg-green-100 text-green-600" />
            {openSections.blocks && (
              <div className="mt-3 space-y-3">
                {/* 既存ブロック一覧 */}
                {swipePage.content?.map((block, i) => (
                  <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {AVAILABLE_BLOCKS.find(b => b.type === block.type)?.label || block.type}
                        {(block.data as Record<string, unknown>)?.title && `: ${(block.data as Record<string, unknown>).title}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={i === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                        >▲</button>
                        <button
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={i === (swipePage.content?.length || 0) - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                        >▼</button>
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="p-1 text-red-400 hover:text-red-600 text-xs"
                        >✕</button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ブロック追加ボタン群 */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">ブロックを追加</p>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_BLOCKS.map(block => (
                      <button
                        key={block.type}
                        onClick={() => addBlock(block.type)}
                        className="flex flex-col items-center gap-1 p-2.5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs text-gray-600 hover:text-blue-600"
                      >
                        <block.icon className="w-4 h-4" />
                        <span>{block.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* カルーセル設定 */}
          <div>
            <SectionHeader sectionKey="carousel" icon={Settings} title="カルーセル設定" bgColor="bg-gray-100" hoverColor="hover:bg-gray-200" accentColor="bg-gray-200 text-gray-600" />
            {openSections.carousel && (
              <div className="mt-3 space-y-4 bg-white border border-gray-200 rounded-xl p-4">
                {/* 自動再生 */}
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">自動再生</span>
                  <input
                    type="checkbox"
                    checked={swipePage.settings.carousel.autoPlay}
                    onChange={(e) => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, carousel: { ...prev.settings.carousel, autoPlay: e.target.checked } },
                    }))}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                </label>

                {swipePage.settings.carousel.autoPlay && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">秒数</label>
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
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {sec}秒
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ホバー時一時停止 */}
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">ホバーで一時停止</span>
                  <input
                    type="checkbox"
                    checked={swipePage.settings.carousel.pauseOnHover}
                    onChange={(e) => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, carousel: { ...prev.settings.carousel, pauseOnHover: e.target.checked } },
                    }))}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                </label>

                {/* 矢印表示 */}
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">矢印ボタン表示</span>
                  <input
                    type="checkbox"
                    checked={swipePage.settings.carousel.showArrows}
                    onChange={(e) => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, carousel: { ...prev.settings.carousel, showArrows: e.target.checked } },
                    }))}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                </label>

                {/* ページインジケーター */}
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">ページインジケーター</span>
                  <input
                    type="checkbox"
                    checked={swipePage.settings.carousel.showIndicator}
                    onChange={(e) => setSwipePage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, carousel: { ...prev.settings.carousel, showIndicator: e.target.checked } },
                    }))}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                </label>

                {/* モバイル表示モード */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
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
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
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
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      全表示
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 決済設定 */}
          <div>
            <SectionHeader sectionKey="payment" icon={CreditCard} title="決済設定" bgColor="bg-gray-100" hoverColor="hover:bg-gray-200" accentColor="bg-gray-200 text-gray-600" />
            {openSections.payment && (
              <div className="mt-3 space-y-4 bg-white border border-gray-200 rounded-xl p-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">決済タイプ</label>
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
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">決済方法</label>
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
                          <label className="block text-xs font-medium text-gray-600 mb-1">価格（円）</label>
                          <input
                            type="number"
                            value={swipePage.settings.payment.price || ''}
                            onChange={(e) => setSwipePage(prev => ({
                              ...prev,
                              settings: { ...prev.settings, payment: { ...prev.settings.payment, price: parseInt(e.target.value) || 0 } },
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="例: 9800"
                            min={100}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stripe Price ID（任意）</label>
                          <input
                            type="text"
                            value={swipePage.settings.payment.stripePriceId || ''}
                            onChange={(e) => setSwipePage(prev => ({
                              ...prev,
                              settings: { ...prev.settings, payment: { ...prev.settings.payment, stripePriceId: e.target.value } },
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="price_xxxxx（既存のPrice IDを使用する場合）"
                          />
                        </div>
                      </>
                    )}

                    {swipePage.settings.payment.paymentProvider === 'external' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">決済URL</label>
                        <input
                          type="url"
                          value={swipePage.settings.payment.paymentUrl || ''}
                          onChange={(e) => setSwipePage(prev => ({
                            ...prev,
                            settings: { ...prev.settings, payment: { ...prev.settings.payment, paymentUrl: e.target.value } },
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">購入ボタンテキスト</label>
                      <input
                        type="text"
                        value={swipePage.settings.payment.ctaText || ''}
                        onChange={(e) => setSwipePage(prev => ({
                          ...prev,
                          settings: { ...prev.settings, payment: { ...prev.settings.payment, ctaText: e.target.value } },
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="購入する"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 保存ボタン（モバイル用sticky） */}
          <div className="sticky bottom-4 z-20 lg:hidden">
            <div className="bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 -mx-4 px-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? '保存中...' : existingId ? '更新して保存' : '保存して公開'}
              </button>
            </div>
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

            {/* LP部分プレビュー */}
            {swipePage.content && swipePage.content.length > 0 && (
              <div className="space-y-4 mt-6">
                <p className="text-xs text-gray-400 font-medium">▼ LP部分</p>
                {swipePage.content.map(block => (
                  <div key={block.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-700">
                      {AVAILABLE_BLOCKS.find(b => b.type === block.type)?.label || block.type}
                    </p>
                    {(block.data as Record<string, unknown>)?.title && (
                      <p className="text-xs text-gray-500 mt-1">{String((block.data as Record<string, unknown>).title)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 決済ボタンプレビュー */}
            {swipePage.settings.payment.paymentType === 'payment' && (
              <div className="mt-6">
                <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg text-center">
                  {swipePage.settings.payment.ctaText || '購入する'}
                  {swipePage.settings.payment.price ? ` - ¥${swipePage.settings.payment.price.toLocaleString()}` : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 完成モーダル */}
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedSlug}
        onClose={() => setShowSuccessModal(false)}
        title="スワイプページ"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/swipe/${savedSlug}`}
        contentTitle={`${swipePage.title}を作りました！`}
        theme="purple"
        userId={userId}
        contentId={savedId || undefined}
        contentType="swipe"
      />
    </div>
  );
}
