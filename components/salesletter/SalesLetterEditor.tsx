'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Block, generateBlockId, SalesLetter, SalesLetterSettings } from '@/lib/types';
import { salesLetterTemplates, getTemplatesByCategory, templateGuides } from '@/constants/templates/salesletter';
import CustomColorPicker from '@/components/shared/CustomColorPicker';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import BlockRenderer from '@/components/shared/BlockRenderer';
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
  Palette,
  ExternalLink,
  ArrowDown,
  Shuffle,
  Settings,
  HelpCircle,
  X,
  MousePointer,
  Monitor,
  Smartphone,
} from 'lucide-react';

// セールスレター用ブロックタイプ
const blockTypes = [
  { type: 'sales_headline', label: '見出し', icon: Type, description: 'セールス用見出しテキスト' },
  { type: 'sales_paragraph', label: '本文', icon: Type, description: 'リッチテキスト本文' },
  { type: 'sales_image', label: '画像', icon: ImageIcon, description: '画像とキャプション' },
  { type: 'sales_cta', label: 'CTAボタン', icon: MousePointer, description: '行動喚起ボタン' },
  { type: 'sales_spacer', label: '余白', icon: ArrowDown, description: '縦方向のスペース' },
  { type: 'sales_divider', label: '区切り線', icon: Shuffle, description: 'セクション区切り' },
];

// デフォルト設定
const defaultSettings: SalesLetterSettings = {
  contentWidth: 800,
  contentWidthUnit: 'px',
  pageBackground: {
    type: 'color',
    value: '#ffffff',
    opacity: 100,
    animated: false,
  },
  hideFooter: false,
};

// 幅プリセット
const widthPresets = [
  { label: '640px（コンパクト）', value: 640 },
  { label: '800px（標準）', value: 800 },
  { label: '960px（ワイド）', value: 960 },
  { label: '1024px（フルワイド）', value: 1024 },
];

interface SalesLetterEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  initialData?: SalesLetter | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

export default function SalesLetterEditor({
  user,
  isAdmin,
  initialData,
  setPage,
  onBack,
  setShowAuth,
}: SalesLetterEditorProps) {
  // 状態管理
  const [title, setTitle] = useState(initialData?.title || 'セールスレター');
  const [blocks, setBlocks] = useState<Block[]>(initialData?.content || []);
  const [settings, setSettings] = useState<SalesLetterSettings>(initialData?.settings || defaultSettings);
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'pc' | 'mobile'>('pc');
  const [previewKey, setPreviewKey] = useState(0);
  
  // モーダル状態
  const [showTemplateModal, setShowTemplateModal] = useState(!initialData);
  const [showGuideModal, setShowGuideModal] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedSlug, setCompletedSlug] = useState('');

  // Ref
  const previewRef = useRef<HTMLDivElement>(null);

  // プレビュー更新
  const updatePreview = useCallback(() => {
    setPreviewKey(prev => prev + 1);
  }, []);

  // ブロック操作
  const addBlock = (type: string) => {
    const id = generateBlockId();
    let data: Record<string, unknown>;

    switch (type) {
      case 'sales_headline':
        data = {
          text: '見出しテキスト',
          level: 'h2',
          align: 'center',
          fontSize: 32,
          color: '#1f2937',
          fontWeight: 'bold',
        };
        break;
      case 'sales_paragraph':
        data = {
          htmlContent: '<p>ここに本文を入力してください。</p>',
          align: 'left',
          defaultFontSize: 16,
          defaultColor: '#374151',
          lineHeight: 1.8,
        };
        break;
      case 'sales_image':
        data = {
          src: '',
          alt: '',
          caption: '',
          width: 'full',
          align: 'center',
          borderRadius: 'md',
          shadow: 'md',
        };
        break;
      case 'sales_cta':
        data = {
          text: '今すぐ申し込む',
          url: '#',
          size: 'lg',
          backgroundColor: '#ef4444',
          textColor: '#ffffff',
          borderRadius: 'lg',
          shadow: 'md',
          fullWidth: true,
          icon: 'arrow',
          iconPosition: 'right',
        };
        break;
      case 'sales_spacer':
        data = { height: 40, mobileHeight: 24 };
        break;
      case 'sales_divider':
        data = {
          variant: 'full',
          lineStyle: 'solid',
          lineColor: '#e5e7eb',
          lineWidth: 1,
          shortWidth: 30,
        };
        break;
      default:
        return;
    }

    const newBlock = { id, type, data } as Block;
    setBlocks(prev => [...prev, newBlock] as Block[]);
    setSelectedBlockId(id);
    updatePreview();
  };

  const updateBlockData = (blockId: string, updates: Record<string, unknown>) => {
    setBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, data: { ...block.data, ...updates } } : block
      ) as Block[]
    );
    updatePreview();
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    updatePreview();
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
    updatePreview();
  };

  // 保存処理
  const handleSave = async () => {
    if (!supabase) {
      alert('データベースに接続されていません');
      return;
    }

    setIsSaving(true);
    try {
      const newSlug = slug || generateSlug();

      const payload = {
        user_id: user?.id || null,
        title,
        slug: newSlug,
        content: blocks,
        settings,
      };

      let result;
      if (initialData?.id) {
        result = await supabase
          .from('sales_letters')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('sales_letters')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSlug(newSlug);
      setCompletedSlug(newSlug);
      setShowCompleteModal(true);
    } catch (error) {
      console.error('Save error:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // テンプレート選択
  const handleSelectTemplate = (templateId: string) => {
    if (!templateId) {
      // 白紙から始める
      setBlocks([]);
      setSettings(defaultSettings);
      setShowTemplateModal(false);
      return;
    }

    const template = salesLetterTemplates.find(t => t.id === templateId);
    if (template) {
      setTitle(template.name);
      setBlocks(template.content);
      setSettings(template.settings);
    }
    setShowTemplateModal(false);
  };

  // 選択中のブロック
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // 背景スタイル
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = settings.pageBackground;
    if (!bg || bg.type === 'none') return { backgroundColor: '#ffffff' };

    if (bg.type === 'gradient') {
      return {
        backgroundImage: bg.value,
        backgroundSize: bg.animated ? '400% 400%' : 'auto',
      };
    }

    return { backgroundColor: bg.value };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">戻る</span>
              </button>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-rose-500 rounded px-2 py-1"
                placeholder="タイトルを入力"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className={`p-2 rounded-lg transition-colors ${showSettingsPanel ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:bg-gray-100'}`}
                title="設定"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 font-bold"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* 左パネル: エディタ */}
          <div className="w-full lg:w-1/2 p-4">
            {/* ブロック追加 */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">ブロックを追加</h3>
              <div className="grid grid-cols-3 gap-2">
                {blockTypes.map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
                    title={description}
                  >
                    <Icon size={20} className="text-gray-600" />
                    <span className="text-xs text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ブロックリスト */}
            <div className="space-y-3">
              {blocks.map((block, index) => (
                <BlockEditorItem
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => setSelectedBlockId(block.id)}
                  onUpdate={(updates) => updateBlockData(block.id, updates)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, 'up')}
                  onMoveDown={() => moveBlock(block.id, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < blocks.length - 1}
                  userId={user?.id}
                />
              ))}

              {blocks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <Type className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">ブロックを追加してセールスレターを作成しましょう</p>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="mt-4 px-4 py-2 text-rose-500 border border-rose-300 rounded-lg hover:bg-rose-50"
                  >
                    テンプレートから始める
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右パネル: プレビュー */}
          <div className="w-full lg:w-1/2 bg-gray-200 min-h-screen lg:sticky lg:top-32 lg:max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* プレビューヘッダー */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode('pc')}
                  className={`p-2 rounded-lg ${previewMode === 'pc' ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="PCプレビュー"
                >
                  <Monitor size={18} />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="スマホプレビュー"
                >
                  <Smartphone size={18} />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {previewMode === 'pc' ? 'PC' : 'スマホ'}プレビュー
              </span>
            </div>

            {/* プレビュー表示 */}
            <div className="p-4 flex justify-center">
              <div
                ref={previewRef}
                key={previewKey}
                className={`bg-white shadow-lg rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                } ${settings.pageBackground?.animated ? 'animate-gradient-xy' : ''}`}
                style={getBackgroundStyle()}
              >
                <div
                  className="mx-auto py-8 px-4"
                  style={{
                    maxWidth: previewMode === 'mobile' ? '100%' : `${settings.contentWidth}${settings.contentWidthUnit}`,
                  }}
                >
                  {blocks.map(block => (
                    <BlockRenderer key={block.id} block={block} variant="salesletter" />
                  ))}
                  {blocks.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                      プレビューがここに表示されます
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 設定パネル */}
      {showSettingsPanel && (
        <SettingsPanel
          settings={settings}
          onUpdate={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
          onClose={() => setShowSettingsPanel(false)}
          onOpenColorPicker={() => setShowColorPicker(true)}
        />
      )}

      {/* カラーピッカー */}
      <CustomColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onApply={(value, isAnimated) => {
          setSettings(prev => ({
            ...prev,
            pageBackground: {
              type: value.startsWith('#') ? 'color' : 'gradient',
              value,
              opacity: 100,
              animated: isAnimated,
            },
          }));
          setShowColorPicker(false);
        }}
        userId={user?.id}
        accentColor="emerald"
      />

      {/* テンプレート選択モーダル */}
      {showTemplateModal && (
        <TemplateModal
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplateModal(false)}
          onShowGuide={(id) => setShowGuideModal(id)}
        />
      )}

      {/* ガイドモーダル */}
      {showGuideModal && (
        <GuideModal
          templateId={showGuideModal}
          onClose={() => setShowGuideModal(null)}
        />
      )}

      {/* 完了モーダル */}
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="セールスレター"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/salesletter/${completedSlug}`}
        contentTitle={title}
        theme="indigo"
        showSupport={false}
        customButtons={
          <div className="space-y-2">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              編集を続ける
            </button>
            <button
              onClick={() => setPage('dashboard?view=salesletter')}
              className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
            >
              ダッシュボードへ
            </button>
          </div>
        }
      />

      {/* アニメーションスタイル */}
      <style jsx global>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
      `}</style>
    </div>
  );
}

// ブロック編集アイテム
function BlockEditorItem({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  userId,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Record<string, unknown>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  userId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const blockType = blockTypes.find(t => t.type === block.type);
  const Icon = blockType?.icon || Type;

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId || 'anonymous'}/${fileName}`;
      
      await supabase.storage.from('profile-uploads').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      
      onUpdate({ src: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-rose-500' : ''
      }`}
      onClick={onSelect}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <GripVertical className="text-gray-400 cursor-move" size={16} />
          <Icon size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{blockType?.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if(confirm('このブロックを削除しますか？')) onDelete(); }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {block.type === 'sales_headline' && (
            <>
              <input
                type="text"
                value={(block.data as any).text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full text-lg font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="見出しテキスト"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={(block.data as any).level || 'h2'}
                  onChange={(e) => onUpdate({ level: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                </select>
                <select
                  value={(block.data as any).align || 'center'}
                  onChange={(e) => onUpdate({ align: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="left">左寄せ</option>
                  <option value="center">中央</option>
                  <option value="right">右寄せ</option>
                </select>
                <input
                  type="number"
                  value={(block.data as any).fontSize || 32}
                  onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                  className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                  placeholder="サイズ"
                />
                <span className="text-sm text-gray-500 self-center">px</span>
                <input
                  type="color"
                  value={(block.data as any).color || '#1f2937'}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
            </>
          )}

          {block.type === 'sales_paragraph' && (
            <>
              <textarea
                value={(block.data as any).htmlContent?.replace(/<[^>]*>/g, '') || ''}
                onChange={(e) => onUpdate({ htmlContent: `<p>${e.target.value}</p>` })}
                className="w-full min-h-[150px] text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="本文を入力..."
              />
              <div className="flex gap-2">
                <select
                  value={(block.data as any).align || 'left'}
                  onChange={(e) => onUpdate({ align: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="left">左寄せ</option>
                  <option value="center">中央</option>
                  <option value="right">右寄せ</option>
                </select>
                <input
                  type="number"
                  value={(block.data as any).defaultFontSize || 16}
                  onChange={(e) => onUpdate({ defaultFontSize: Number(e.target.value) })}
                  className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-sm text-gray-500 self-center">px</span>
              </div>
            </>
          )}

          {block.type === 'sales_image' && (
            <>
              {(block.data as any).src ? (
                <div className="relative">
                  <img src={(block.data as any).src} alt={(block.data as any).alt || ''} className="w-full rounded-lg" />
                  <button
                    onClick={() => onUpdate({ src: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400">
                  {uploading ? (
                    <Loader2 className="animate-spin text-rose-500" size={24} />
                  ) : (
                    <>
                      <ImageIcon className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-500">クリックして画像をアップロード</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <input
                type="text"
                value={(block.data as any).alt || ''}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                placeholder="代替テキスト（alt）"
              />
              <input
                type="text"
                value={(block.data as any).caption || ''}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                placeholder="キャプション（任意）"
              />
            </>
          )}

          {block.type === 'sales_cta' && (
            <>
              <input
                type="text"
                value={(block.data as any).text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full text-lg font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                placeholder="ボタンテキスト"
              />
              <input
                type="text"
                value={(block.data as any).url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                placeholder="リンクURL"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={(block.data as any).size || 'lg'}
                  onChange={(e) => onUpdate({ size: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="sm">小</option>
                  <option value="md">中</option>
                  <option value="lg">大</option>
                  <option value="xl">特大</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={(block.data as any).fullWidth || false}
                    onChange={(e) => onUpdate({ fullWidth: e.target.checked })}
                    className="rounded"
                  />
                  全幅
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">背景:</span>
                  <input
                    type="color"
                    value={(block.data as any).backgroundColor || '#ef4444'}
                    onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">文字:</span>
                  <input
                    type="color"
                    value={(block.data as any).textColor || '#ffffff'}
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {block.type === 'sales_spacer' && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600">高さ:</label>
              <input
                type="range"
                min="8"
                max="200"
                value={(block.data as any).height || 40}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-900 w-16">{(block.data as any).height || 40}px</span>
            </div>
          )}

          {block.type === 'sales_divider' && (
            <div className="flex flex-wrap gap-2">
              <select
                value={(block.data as any).variant || 'full'}
                onChange={(e) => onUpdate({ variant: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="full">全幅</option>
                <option value="short">短い</option>
                <option value="dots">ドット</option>
                <option value="wave">波線</option>
              </select>
              <select
                value={(block.data as any).lineStyle || 'solid'}
                onChange={(e) => onUpdate({ lineStyle: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="solid">実線</option>
                <option value="dashed">破線</option>
                <option value="dotted">点線</option>
              </select>
              <input
                type="color"
                value={(block.data as any).lineColor || '#e5e7eb'}
                onChange={(e) => onUpdate({ lineColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 設定パネル
function SettingsPanel({
  settings,
  onUpdate,
  onClose,
  onOpenColorPicker,
}: {
  settings: SalesLetterSettings;
  onUpdate: (updates: Partial<SalesLetterSettings>) => void;
  onClose: () => void;
  onOpenColorPicker: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">ページ設定</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* コンテンツ幅 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">コンテンツ幅</label>
          <select
            value={settings.contentWidth}
            onChange={(e) => onUpdate({ contentWidth: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
          >
            {widthPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>{preset.label}</option>
            ))}
          </select>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={settings.contentWidth}
              onChange={(e) => onUpdate({ contentWidth: Number(e.target.value) })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-gray-500">px</span>
          </div>
        </div>

        {/* 全体背景 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ページ背景</label>
          <button
            onClick={onOpenColorPicker}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:border-rose-300"
          >
            <div
              className="w-10 h-10 rounded-lg border border-gray-200"
              style={{ background: settings.pageBackground?.value || '#ffffff' }}
            />
            <span className="text-gray-700">背景色を選択</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// テンプレート選択モーダル
function TemplateModal({
  onSelect,
  onClose,
  onShowGuide,
}: {
  onSelect: (id: string) => void;
  onClose: () => void;
  onShowGuide: (id: string) => void;
}) {
  const categories = [
    { id: 'sales_letter', name: '王道のセールスレター型', description: 'LP・長い手紙向け' },
    { id: 'ec_catalog', name: 'EC・物販・カタログ型', description: '商品説明向け' },
    { id: 'blog_short', name: 'ブログ・短文構成型', description: '各セクション・コラム向け' },
    { id: 'marketing', name: 'マーケティング思考型', description: '構成案作成向け' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">テンプレートを選択</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {categories.map((category) => {
            const templates = getTemplatesByCategory(category.id);
            if (templates.length === 0) return null;

            return (
              <div key={category.id} className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{category.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-rose-300 cursor-pointer transition-colors"
                      onClick={() => onSelect(template.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{template.icon}</span>
                          <h4 className="font-bold text-gray-900">{template.name}</h4>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowGuide(template.id); }}
                          className="p-1 text-gray-400 hover:text-rose-500"
                          title="詳細を見る"
                        >
                          <HelpCircle size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* 白紙から始める */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onSelect('')}
              className="w-full py-3 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              白紙から始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ガイドモーダル
function GuideModal({
  templateId,
  onClose,
}: {
  templateId: string;
  onClose: () => void;
}) {
  const guide = templateGuides[templateId];
  const template = salesLetterTemplates.find(t => t.id === templateId);

  if (!guide || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* 概要 */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">概要</h3>
            <p className="text-gray-600">{guide.whatIs}</p>
          </div>

          {/* 構成 */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">構成</h3>
            <div className="space-y-2">
              {guide.structure.map((item, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.step}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* コツ */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">コツ</h3>
            <ul className="space-y-2">
              {guide.tips.map((tip, index) => (
                <li key={index} className="flex gap-2 text-gray-600">
                  <span className="text-rose-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 適した用途 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">適した用途</h3>
            <div className="flex flex-wrap gap-2">
              {guide.bestFor.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
