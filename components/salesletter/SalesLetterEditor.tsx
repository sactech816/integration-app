'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Block, generateBlockId, SalesLetter, SalesLetterSettings } from '@/lib/types';
import { salesLetterTemplates, getTemplatesByCategory, templateGuides } from '@/constants/templates/salesletter';
import CustomColorPicker from '@/components/shared/CustomColorPicker';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import BlockRenderer from '@/components/shared/BlockRenderer';
import SalesTextEditor from './SalesTextEditor';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
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
  Timer,
  Youtube,
  MessageCircleQuestion,
  UploadCloud,
  FileText,
  Trophy,
  Share2,
  Lock,
  Star,
} from 'lucide-react';

// セールスレター用ブロックタイプ
const blockTypes = [
  { type: 'sales_headline', label: '見出し', icon: Type, description: 'セールス用見出しテキスト', color: 'bg-blue-50 border-blue-200' },
  { type: 'sales_paragraph', label: '本文', icon: FileText, description: 'リッチテキスト本文', color: 'bg-green-50 border-green-200' },
  { type: 'sales_image', label: '画像', icon: ImageIcon, description: '画像とキャプション', color: 'bg-purple-50 border-purple-200' },
  { type: 'sales_cta', label: 'CTAボタン', icon: MousePointer, description: '行動喚起ボタン', color: 'bg-red-50 border-red-200' },
  { type: 'sales_spacer', label: '余白', icon: ArrowDown, description: '縦方向のスペース', color: 'bg-gray-50 border-gray-200' },
  { type: 'sales_divider', label: '区切り線', icon: Shuffle, description: 'セクション区切り', color: 'bg-orange-50 border-orange-200' },
  { type: 'sales_countdown', label: 'タイマー', icon: Timer, description: 'カウントダウンタイマー', color: 'bg-pink-50 border-pink-200' },
  { type: 'sales_youtube', label: 'YouTube', icon: Youtube, description: 'YouTube動画埋め込み', color: 'bg-red-50 border-red-200' },
  { type: 'sales_faq', label: 'FAQ', icon: MessageCircleQuestion, description: 'よくある質問', color: 'bg-cyan-50 border-cyan-200' },
];

// フリー画像リスト
const curatedImages = [
  "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80",
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
  const [savedId, setSavedId] = useState<string | null>(initialData?.id || null); // 保存後のIDを保持
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'pc' | 'mobile'>('pc');
  const [previewKey, setPreviewKey] = useState(0);
  
  // カスタムslug管理
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  
  // ユーザープラン権限
  const { userPlan } = useUserPlan(user?.id);
  
  // セクション開閉状態
  const [isBasicSettingsOpen, setIsBasicSettingsOpen] = useState(true);
  
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
      case 'sales_countdown':
        data = {
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          title: '期間限定キャンペーン',
          expiredAction: 'text',
          expiredText: 'このキャンペーンは終了しました',
          backgroundColor: '#1f2937',
          textColor: '#ffffff',
          showDays: true,
          showHours: true,
          showMinutes: true,
          showSeconds: true,
        };
        break;
      case 'sales_youtube':
        data = {
          url: '',
          title: '',
          aspectRatio: '16:9',
          autoplay: false,
          muted: false,
        };
        break;
      case 'sales_faq':
        data = {
          items: [
            { id: generateBlockId(), question: '質問1を入力してください', answer: '回答1を入力してください' },
          ],
          style: 'accordion',
          backgroundColor: '#ffffff',
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

    // カスタムslugのバリデーション
    if (customSlug && !/^[a-z0-9-]{3,20}$/.test(customSlug)) {
      alert('カスタムURLの形式が正しくありません（英小文字、数字、ハイフンのみ、3〜20文字）');
      return;
    }

    setIsSaving(true);
    try {
      // initialData?.id または savedId があれば更新、なければ新規作成
      const existingId = initialData?.id || savedId;
      
      if (existingId) {
        // 更新（slugは変更しない）
        const payload = {
          user_id: user?.id || null,
          title,
          content: blocks,
          settings,
        };

        const result = await supabase
          .from('sales_letters')
          .update(payload)
          .eq('id', existingId)
          .select()
          .single();

        if (result.error) throw result.error;

        setCompletedSlug(result.data.slug);
        alert('保存しました！');
      } else {
        // 新規作成：カスタムslugまたは自動生成（リトライ付き）
        let attempts = 0;
        const maxAttempts = 5;
        let insertError: any = null;

        while (attempts < maxAttempts) {
          const newSlug = customSlug || generateSlug();
          const payload = {
            user_id: user?.id || null,
            title,
            slug: newSlug,
            content: blocks,
            settings,
          };

          const { data, error } = await supabase
            .from('sales_letters')
            .insert(payload)
            .select()
            .single();

          // slug重複エラー（23505）の場合はリトライ（カスタムslugの場合はリトライしない）
          if (error?.code === '23505' && error?.message?.includes('slug') && !customSlug) {
            attempts++;
            console.log(`Slug collision, retrying... (attempt ${attempts}/${maxAttempts})`);
            continue;
          }

          if (error) {
            insertError = error;
            break;
          }

          // 成功
          setSavedId(data.id);
          setSlug(data.slug);
          setCompletedSlug(data.slug);
          if (customSlug) setCustomSlug(''); // カスタムslugをクリア
          setShowCompleteModal(true);
          return;
        }

        // エラーハンドリング
        if (insertError) {
          throw insertError;
        }
        throw new Error('保存に失敗しました（リトライ上限到達）');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      // カスタムURL（slug）の重複エラーを分かりやすいメッセージに変換
      if (error.code === '23505' && error.message?.includes('slug')) {
        alert('このカスタムURLは既に使用されています。別のURLを指定してください。');
      } else {
        alert('保存に失敗しました: ' + (error.message || '不明なエラー'));
      }
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

  // 背景スタイル（外側用）
  const getOuterBackgroundStyle = (): React.CSSProperties => {
    const bg = settings.pageBackground;
    if (!bg || bg.type === 'none') return { backgroundColor: '#f3f4f6' };

    const scope = bg.scope || 'all';
    
    // 全体または外側のみの場合
    if (scope === 'all' || scope === 'outside') {
      // 背景画像が設定されている場合は画像優先
      if (bg.imageUrl) {
        return {
          backgroundImage: `url(${bg.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        };
      }
      if (bg.type === 'gradient') {
        return {
          backgroundImage: bg.value,
          backgroundSize: bg.animated ? '400% 400%' : 'auto',
        };
      }
      if (bg.type === 'color') {
        return { backgroundColor: bg.value };
      }
    }

    return { backgroundColor: '#f3f4f6' };
  };

  // 背景スタイル（内側用）
  const getInnerBackgroundStyle = (): React.CSSProperties => {
    const bg = settings.pageBackground;
    if (!bg || bg.type === 'none') return { backgroundColor: '#ffffff' };

    const scope = bg.scope || 'all';
    
    // 全体または内側のみの場合
    if (scope === 'all' || scope === 'inside') {
      // 背景画像が設定されている場合は画像優先
      if (bg.imageUrl) {
        return {
          backgroundImage: `url(${bg.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      if (bg.type === 'gradient') {
        return {
          backgroundImage: bg.value,
          backgroundSize: bg.animated ? '400% 400%' : 'auto',
        };
      }
      if (bg.type === 'color') {
        return { backgroundColor: bg.value };
      }
    }

    return { backgroundColor: '#ffffff' };
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
              {/* 作成完了画面ボタン（保存済みの場合のみ表示） */}
              {(savedId || initialData?.id) && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="hidden sm:flex bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-2 rounded-lg font-bold items-center gap-2 hover:from-rose-600 hover:to-pink-600 whitespace-nowrap transition-all shadow-md text-sm"
                >
                  <Trophy size={16} />
                  <span className="hidden md:inline">作成完了画面</span>
                  <span className="md:hidden">完了</span>
                </button>
              )}
              {/* 公開URLボタン（slugがある場合のみ表示） */}
              {(slug || initialData?.slug) && (
                <button
                  onClick={() => window.open(`${window.location.origin}/s/${slug || initialData?.slug}`, '_blank')}
                  className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg font-bold items-center gap-2 whitespace-nowrap text-sm"
                >
                  <Share2 size={16} />
                  <span className="hidden md:inline">公開URL</span>
                  <span className="md:hidden">URL</span>
                </button>
              )}
              {/* 保存ボタン */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 font-bold"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                <span className="hidden sm:inline">{savedId || initialData?.id ? '保存' : '保存して公開'}</span>
                <span className="sm:hidden">保存</span>
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
            {/* プロ向け説明文 */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-rose-700">
                ※文章を中心としたセールスレターを書くためのプロ向けツールです。
              </p>
            </div>

            {/* 基本設定（各種オプション・背景・幅設定） - 一番上に配置 */}
            <ContentSettingsPanel
              settings={settings}
              onUpdate={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
              onOpenColorPicker={() => setShowColorPicker(true)}
              userId={user?.id}
              userPlan={userPlan}
              isOpen={isBasicSettingsOpen}
              onToggle={() => setIsBasicSettingsOpen(prev => !prev)}
              customSlug={customSlug}
              setCustomSlug={setCustomSlug}
              slugError={slugError}
              setSlugError={setSlugError}
              isNewContent={!initialData?.slug && !slug}
            />

            {/* テンプレート選択リンク */}
            <div className="mb-4">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-rose-300 hover:bg-rose-50 transition-colors"
              >
                <FileText size={18} className="text-rose-500" />
                <span className="font-medium text-gray-700">テンプレートを選択</span>
              </button>
            </div>

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

            {/* 編集エリアのスクロールトップボタン */}
            {blocks.length > 3 && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-1 mb-4"
              >
                <ChevronUp size={16} /> 一番上へ戻る
              </button>
            )}

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
            <div
              className={`p-4 flex justify-center min-h-[400px] ${settings.pageBackground?.animated ? 'animate-gradient-xy' : ''}`}
              style={getOuterBackgroundStyle()}
            >
              <div
                ref={previewRef}
                key={previewKey}
                className={`shadow-lg rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                }`}
                style={getInnerBackgroundStyle()}
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

            {/* スクロールトップボタン */}
            <button
              onClick={() => {
                const previewContainer = document.querySelector('.lg\\:max-h-\\[calc\\(100vh-8rem\\)\\]');
                if (previewContainer) previewContainer.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="fixed bottom-4 right-4 lg:right-[calc(50%-2rem)] z-20 p-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
              title="一番上へ"
            >
              <ChevronUp size={24} />
            </button>
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
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${completedSlug}`}
        contentTitle={title}
        theme="rose"
        showSupport={true}
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
      <div className={`flex items-center justify-between px-4 py-2 border-b ${blockType?.color || 'bg-gray-50 border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <GripVertical className="text-gray-400 cursor-move" size={16} />
          <Icon size={16} className="text-gray-600" />
          <span className="text-sm font-bold text-gray-700">{blockType?.label}</span>
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
            <HeadlineBlockEditor
              data={block.data as any}
              onUpdate={onUpdate}
              userId={userId}
            />
          )}

          {block.type === 'sales_paragraph' && (
            <ParagraphBlockEditor
              data={block.data as any}
              onUpdate={onUpdate}
              userId={userId}
            />
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

          {block.type === 'sales_countdown' && (
            <>
              <input
                type="text"
                value={(block.data as any).title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                placeholder="タイトル（例: 期間限定キャンペーン）"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">終了日時</label>
                <input
                  type="datetime-local"
                  value={(block.data as any).targetDate?.slice(0, 16) || ''}
                  onChange={(e) => onUpdate({ targetDate: new Date(e.target.value).toISOString() })}
                  className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">期限切れ時の動作</label>
                <select
                  value={(block.data as any).expiredAction || 'text'}
                  onChange={(e) => onUpdate({ expiredAction: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="text">テキストを表示</option>
                  <option value="redirect">別ページへ移動</option>
                </select>
              </div>
              {(block.data as any).expiredAction === 'text' && (
                <input
                  type="text"
                  value={(block.data as any).expiredText || ''}
                  onChange={(e) => onUpdate({ expiredText: e.target.value })}
                  className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                  placeholder="期限切れ時のメッセージ"
                />
              )}
              {(block.data as any).expiredAction === 'redirect' && (
                <input
                  type="text"
                  value={(block.data as any).expiredUrl || ''}
                  onChange={(e) => onUpdate({ expiredUrl: e.target.value })}
                  className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                  placeholder="リダイレクト先URL"
                />
              )}
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">背景:</span>
                  <input
                    type="color"
                    value={(block.data as any).backgroundColor || '#1f2937'}
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

          {block.type === 'sales_youtube' && (
            <>
              <input
                type="text"
                value={(block.data as any).url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                placeholder="YouTube URL（例: https://www.youtube.com/watch?v=xxx）"
              />
              <input
                type="text"
                value={(block.data as any).title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
                placeholder="タイトル（任意）"
              />
              <div className="flex gap-2">
                <select
                  value={(block.data as any).aspectRatio || '16:9'}
                  onChange={(e) => onUpdate({ aspectRatio: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="16:9">16:9（横長）</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1（正方形）</option>
                </select>
              </div>
            </>
          )}

          {block.type === 'sales_faq' && (
            <FaqBlockEditor
              items={(block.data as any).items || []}
              onUpdate={(items) => onUpdate({ items })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// 見出しブロック編集コンポーネント
function HeadlineBlockEditor({
  data,
  onUpdate,
  userId,
}: {
  data: any;
  onUpdate: (updates: Record<string, unknown>) => void;
  userId?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('画像は2MB以下にしてください');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId || 'anonymous'}/${fileName}`;
      
      await supabase.storage.from('profile-uploads').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      
      onUpdate({ backgroundType: 'image', backgroundImage: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomImage = () => {
    const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
    onUpdate({ backgroundType: 'image', backgroundImage: selected });
  };

  return (
    <div className="space-y-3">
      {/* テキスト入力 */}
      <input
        type="text"
        value={data.text || ''}
        onChange={(e) => onUpdate({ text: e.target.value })}
        className="w-full text-lg font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        placeholder="見出しテキスト"
      />

      {/* 基本設定 */}
      <div className="flex flex-wrap gap-2">
        <select
          value={data.level || 'h2'}
          onChange={(e) => onUpdate({ level: e.target.value })}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
        </select>
        <select
          value={data.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value })}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
        >
          <option value="left">左寄せ</option>
          <option value="center">中央</option>
          <option value="right">右寄せ</option>
        </select>
        <input
          type="number"
          value={data.fontSize || 32}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
          placeholder="サイズ"
        />
        <span className="text-sm text-gray-500 self-center">px</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">文字:</span>
          <input
            type="color"
            value={data.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 背景設定 */}
      <div className="border-t border-gray-200 pt-3">
        <label className="block text-xs font-bold text-gray-700 mb-2">背景設定</label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <select
            value={data.backgroundType || 'none'}
            onChange={(e) => onUpdate({ backgroundType: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
          >
            <option value="none">なし</option>
            <option value="color">背景色</option>
            <option value="image">背景画像</option>
          </select>

          {data.backgroundType === 'color' && (
            <input
              type="color"
              value={data.backgroundColor || '#f3f4f6'}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer"
            />
          )}

          {(data.backgroundType === 'color' || data.backgroundType === 'image') && (
            <>
              <select
                value={data.backgroundWidth || 'content'}
                onChange={(e) => onUpdate({ backgroundWidth: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="full">全幅</option>
                <option value="content">コンテンツ幅</option>
                <option value="custom">カスタム幅</option>
              </select>
              {data.backgroundWidth === 'custom' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={data.customBackgroundWidth || 600}
                    onChange={(e) => onUpdate({ customBackgroundWidth: Number(e.target.value) })}
                    className="w-20 text-sm border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                    placeholder="幅"
                  />
                  <span className="text-xs text-gray-500">px</span>
                </div>
              )}
            </>
          )}
        </div>

        {data.backgroundType === 'image' && (
          <div className="flex gap-2 mb-2">
            <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs hover:bg-indigo-200 cursor-pointer border border-indigo-300">
              {isUploading ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />}
              <span>アップロード</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageUpload} disabled={isUploading} />
            </label>
            <button
              onClick={handleRandomImage}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 border border-gray-300"
            >
              <ImageIcon size={14} /> 自動
            </button>
          </div>
        )}

        {data.backgroundImage && data.backgroundType === 'image' && (
          <div className="relative mb-2">
            <img src={data.backgroundImage} alt="背景プレビュー" className="w-full h-16 object-cover rounded-lg" />
            <button
              onClick={() => onUpdate({ backgroundImage: undefined, backgroundType: 'none' })}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {(data.backgroundType === 'color' || data.backgroundType === 'image') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">透明度:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={data.backgroundOpacity ?? 100}
              onChange={(e) => onUpdate({ backgroundOpacity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">{data.backgroundOpacity ?? 100}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 本文ブロック編集コンポーネント
function ParagraphBlockEditor({
  data,
  onUpdate,
  userId,
}: {
  data: any;
  onUpdate: (updates: Record<string, unknown>) => void;
  userId?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('画像は2MB以下にしてください');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId || 'anonymous'}/${fileName}`;
      
      await supabase.storage.from('profile-uploads').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      
      onUpdate({ backgroundType: 'image', backgroundImage: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomImage = () => {
    const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
    onUpdate({ backgroundType: 'image', backgroundImage: selected });
  };

  return (
    <div className="space-y-3">
      {/* テキストエディタ */}
      <SalesTextEditor
        content={data.htmlContent || ''}
        onChange={(html) => onUpdate({ htmlContent: html })}
        placeholder="本文を入力してください..."
      />

      {/* 基本設定 */}
      <div className="flex flex-wrap gap-2">
        <select
          value={data.align || 'left'}
          onChange={(e) => onUpdate({ align: e.target.value })}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
        >
          <option value="left">左寄せ</option>
          <option value="center">中央</option>
          <option value="right">右寄せ</option>
        </select>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">文字サイズ:</span>
          <input
            type="number"
            value={data.defaultFontSize || 16}
            onChange={(e) => onUpdate({ defaultFontSize: Number(e.target.value) })}
            className="w-16 text-sm border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">文字:</span>
          <input
            type="color"
            value={data.defaultColor || '#374151'}
            onChange={(e) => onUpdate({ defaultColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 背景設定 */}
      <div className="border-t border-gray-200 pt-3">
        <label className="block text-xs font-bold text-gray-700 mb-2">背景設定</label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <select
            value={data.backgroundType || 'none'}
            onChange={(e) => onUpdate({ backgroundType: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
          >
            <option value="none">なし</option>
            <option value="color">背景色</option>
            <option value="image">背景画像</option>
          </select>

          {data.backgroundType === 'color' && (
            <input
              type="color"
              value={data.backgroundColor || '#f3f4f6'}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer"
            />
          )}

          {(data.backgroundType === 'color' || data.backgroundType === 'image') && (
            <>
              <select
                value={data.backgroundWidth || 'content'}
                onChange={(e) => onUpdate({ backgroundWidth: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="full">全幅</option>
                <option value="content">コンテンツ幅</option>
                <option value="custom">カスタム幅</option>
              </select>
              {data.backgroundWidth === 'custom' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={data.customBackgroundWidth || 600}
                    onChange={(e) => onUpdate({ customBackgroundWidth: Number(e.target.value) })}
                    className="w-20 text-sm border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:ring-2 focus:ring-rose-500"
                    placeholder="幅"
                  />
                  <span className="text-xs text-gray-500">px</span>
                </div>
              )}
            </>
          )}
        </div>

        {data.backgroundType === 'image' && (
          <div className="flex gap-2 mb-2">
            <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs hover:bg-indigo-200 cursor-pointer border border-indigo-300">
              {isUploading ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />}
              <span>アップロード</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageUpload} disabled={isUploading} />
            </label>
            <button
              onClick={handleRandomImage}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 border border-gray-300"
            >
              <ImageIcon size={14} /> 自動
            </button>
          </div>
        )}

        {data.backgroundImage && data.backgroundType === 'image' && (
          <div className="relative mb-2">
            <img src={data.backgroundImage} alt="背景プレビュー" className="w-full h-16 object-cover rounded-lg" />
            <button
              onClick={() => onUpdate({ backgroundImage: undefined, backgroundType: 'none' })}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {(data.backgroundType === 'color' || data.backgroundType === 'image') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">透明度:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={data.backgroundOpacity ?? 100}
              onChange={(e) => onUpdate({ backgroundOpacity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">{data.backgroundOpacity ?? 100}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// FAQブロック編集コンポーネント
function FaqBlockEditor({
  items,
  onUpdate,
}: {
  items: Array<{ id: string; question: string; answer: string }>;
  onUpdate: (items: Array<{ id: string; question: string; answer: string }>) => void;
}) {
  const addItem = () => {
    onUpdate([...items, { id: generateBlockId(), question: '', answer: '' }]);
  };

  const updateItem = (id: string, field: 'question' | 'answer', value: string) => {
    onUpdate(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      onUpdate(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 text-gray-400 hover:text-red-500"
              disabled={items.length <= 1}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <input
            type="text"
            value={item.question}
            onChange={(e) => updateItem(item.id, 'question', e.target.value)}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
            placeholder="質問を入力"
          />
          <textarea
            value={item.answer}
            onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 min-h-[60px]"
            placeholder="回答を入力"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-rose-300 hover:text-rose-500"
      >
        + 質問を追加
      </button>
    </div>
  );
}

// 影のマッピング
const shadowMap: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// 角丸のマッピング
const radiusMap: Record<string, string> = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
};

// コンテンツ設定パネル（左パネル内）
function ContentSettingsPanel({
  settings,
  onUpdate,
  onOpenColorPicker,
  userId,
  userPlan,
  isOpen,
  onToggle,
  customSlug,
  setCustomSlug,
  slugError,
  setSlugError,
  isNewContent,
}: {
  settings: SalesLetterSettings;
  onUpdate: (updates: Partial<SalesLetterSettings>) => void;
  onOpenColorPicker: () => void;
  userId?: string;
  userPlan: { canHideCopyright: boolean };
  isOpen: boolean;
  onToggle: () => void;
  customSlug: string;
  setCustomSlug: (val: string) => void;
  slugError: string;
  setSlugError: (val: string) => void;
  isNewContent: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('画像は2MB以下にしてください');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId || 'anonymous'}/${fileName}`;
      
      await supabase.storage.from('profile-uploads').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      
      onUpdate({
        pageBackground: {
          ...settings.pageBackground,
          type: 'image',
          value: urlData.publicUrl,
          imageUrl: urlData.publicUrl,
        } as any,
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomImage = () => {
    const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
    onUpdate({
      pageBackground: {
        ...settings.pageBackground,
        type: 'image',
        value: selected,
        imageUrl: selected,
      } as any,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* 開閉可能なヘッダー */}
      <button 
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-rose-500 hover:bg-rose-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-white" />
          <h3 className="text-sm font-bold text-white">基本設定（各種オプション・背景・幅設定）</h3>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-white" />
        ) : (
          <ChevronDown size={18} className="text-white" />
        )}
      </button>
      
      {/* 折りたたみコンテンツ */}
      {isOpen && (
        <div className="p-4">
          {/* カスタムURL設定（新規作成時のみ） */}
          {isNewContent && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="block text-xs font-bold text-gray-700 mb-2">カスタムURL（任意）</label>
              <input 
                className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none bg-white placeholder-gray-400 transition-shadow text-sm ${slugError ? 'border-red-400' : 'border-gray-300'}`}
                value={customSlug} 
                onChange={e => {
                  const val = e.target.value;
                  setCustomSlug(val);
                  if (val && !/^[a-z0-9-]{3,20}$/.test(val)) {
                    setSlugError('英小文字、数字、ハイフンのみ（3〜20文字）');
                  } else {
                    setSlugError('');
                  }
                }}
                placeholder="例: my-sales-page"
              />
              {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                ※空欄の場合は自動生成されます。一度設定すると変更できません。
              </p>
              {customSlug && !slugError && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/s/{customSlug}
                </p>
              )}
            </div>
          )}

          {/* ポータル掲載 */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-rose-900 flex items-center gap-2 mb-1 text-xs">
                <Star size={14} className="text-rose-600"/> ポータルに掲載する
              </h4>
              <p className="text-[10px] text-rose-700">
                ポータルに掲載することで、サービスの紹介およびSEO対策、AI対策として効果的となります。より多くの方にあなたのセールスレターを見てもらえます。
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.showInPortal === undefined ? true : settings.showInPortal} 
                onChange={e => onUpdate({ showInPortal: e.target.checked })} 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* コンテンツ幅 */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-2">コンテンツ幅</label>
        <select
          value={settings.contentWidth}
          onChange={(e) => onUpdate({ contentWidth: Number(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-rose-500"
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
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-rose-500"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>

      {/* 背景色 */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-2">背景色</label>
        <button
          onClick={onOpenColorPicker}
          className="w-full flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:border-rose-300"
        >
          <div
            className="w-8 h-8 rounded border border-gray-200"
            style={{ background: settings.pageBackground?.type !== 'image' ? (settings.pageBackground?.value || '#ffffff') : '#ffffff' }}
          />
          <span className="text-sm text-gray-700">背景色を選択</span>
        </button>
        <p className="text-xs text-gray-500 mt-1">※背景画像が設定されている場合は画像が優先されます</p>
      </div>

      {/* 背景画像 */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-2">背景画像（優先）</label>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-200 cursor-pointer border border-indigo-300">
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            <span>アップロード</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageUpload} disabled={isUploading} />
          </label>
          <button
            onClick={handleRandomImage}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300 border border-gray-300"
          >
            <ImageIcon size={16} /> 自動
          </button>
        </div>
        {settings.pageBackground?.imageUrl && (
          <div className="mt-2 relative">
            <img src={settings.pageBackground.imageUrl} alt="背景プレビュー" className="w-full h-20 object-cover rounded-lg" />
            <button
              onClick={() => onUpdate({ pageBackground: { ...settings.pageBackground, type: 'color', imageUrl: undefined } as any })}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 背景適用範囲 */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">背景の適用範囲</label>
        <select
          value={settings.pageBackground?.scope || 'all'}
          onChange={(e) => onUpdate({
            pageBackground: {
              ...settings.pageBackground,
              scope: e.target.value as 'all' | 'inside' | 'outside',
            } as any,
          })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">全体</option>
          <option value="inside">コンテンツ幅内のみ</option>
          <option value="outside">コンテンツ幅外のみ</option>
        </select>
      </div>

      {/* 枠線設定 */}
      <div className="mb-4 pt-4 border-t border-gray-200">
        <label className="block text-xs font-bold text-gray-700 mb-2">コンテンツ枠線</label>
        <div className="flex items-center gap-3 mb-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.contentBorder?.enabled || false}
              onChange={(e) => onUpdate({
                contentBorder: {
                  enabled: e.target.checked,
                  width: settings.contentBorder?.width || 1,
                  color: settings.contentBorder?.color || '#e5e7eb',
                },
              })}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
          <span className="text-xs text-gray-600">枠線を表示</span>
        </div>
        {settings.contentBorder?.enabled && (
          <div className="space-y-2 pl-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-12">太さ</label>
              <select
                value={settings.contentBorder?.width || 1}
                onChange={(e) => onUpdate({
                  contentBorder: {
                    ...settings.contentBorder!,
                    width: Number(e.target.value),
                  },
                })}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900"
              >
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={3}>3px</option>
                <option value={4}>4px</option>
                <option value={5}>5px</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-12">色</label>
              <input
                type="color"
                value={settings.contentBorder?.color || '#e5e7eb'}
                onChange={(e) => onUpdate({
                  contentBorder: {
                    ...settings.contentBorder!,
                    color: e.target.value,
                  },
                })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.contentBorder?.color || '#e5e7eb'}
                onChange={(e) => onUpdate({
                  contentBorder: {
                    ...settings.contentBorder!,
                    color: e.target.value,
                  },
                })}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* 影設定 */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-2">コンテンツ影</label>
        <select
          value={settings.contentShadow || 'none'}
          onChange={(e) => onUpdate({ contentShadow: e.target.value as 'none' | 'sm' | 'md' | 'lg' | 'xl' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-rose-500"
        >
          <option value="none">なし</option>
          <option value="sm">小</option>
          <option value="md">中</option>
          <option value="lg">大</option>
          <option value="xl">特大</option>
        </select>
      </div>

      {/* 角丸設定 */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-2">コンテンツ角丸</label>
        <select
          value={settings.contentBorderRadius || 'none'}
          onChange={(e) => onUpdate({ contentBorderRadius: e.target.value as 'none' | 'sm' | 'md' | 'lg' | 'xl' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-rose-500"
        >
          <option value="none">なし</option>
          <option value="sm">小</option>
          <option value="md">中</option>
          <option value="lg">大</option>
          <option value="xl">特大</option>
        </select>
      </div>

      {/* フッター非表示（Proプラン特典） */}
      <div className={`p-3 rounded-xl border mt-4 ${
        userPlan.canHideCopyright 
          ? 'bg-orange-50 border-orange-200' 
          : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={`font-bold flex items-center gap-2 mb-1 text-xs ${
              userPlan.canHideCopyright ? 'text-orange-900' : 'text-gray-500'
            }`}>
              {userPlan.canHideCopyright 
                ? <Eye size={14} className="text-orange-600"/> 
                : <Lock size={14} className="text-gray-400"/>
              }
              フッターを非表示にする
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                userPlan.canHideCopyright 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}>Pro</span>
            </h4>
            <p className={`text-[10px] ${userPlan.canHideCopyright ? 'text-orange-700' : 'text-gray-500'}`}>
              「セールスライターで作成しました」のフッターを非表示にします。
            </p>
            {!userPlan.canHideCopyright && (
              <p className="text-[10px] text-rose-600 mt-1 font-medium">
                ※ Proプランで利用可能
              </p>
            )}
          </div>
          <label className={`relative inline-flex items-center ml-2 flex-shrink-0 ${
            userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}>
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={userPlan.canHideCopyright && (settings.hideFooter || false)} 
              onChange={e => {
                if (userPlan.canHideCopyright) {
                  onUpdate({ hideFooter: e.target.checked });
                }
              }}
              disabled={!userPlan.canHideCopyright}
            />
            <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
              userPlan.canHideCopyright 
                ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-orange-600' 
                : 'bg-gray-300'
            }`}></div>
          </label>
        </div>
      </div>
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
