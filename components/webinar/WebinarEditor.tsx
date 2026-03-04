'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { WebinarLP, Block, generateBlockId } from '@/lib/types';
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
  ArrowUp,
  ArrowDown,
  Timer,
  List,
  UserCircle,
  Settings,
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

interface WebinarEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  initialData?: WebinarLP | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

const blockTypes = [
  { type: 'hero', label: 'ヒーロー', icon: Zap, description: 'タイトル・サブタイトル', category: 'webinar' },
  { type: 'youtube', label: 'YouTube', icon: Youtube, description: '動画埋め込み', category: 'webinar' },
  { type: 'speaker', label: '講師紹介', icon: UserCircle, description: '講師プロフィール', category: 'webinar' },
  { type: 'agenda', label: 'アジェンダ', icon: List, description: '学べること・内容', category: 'webinar' },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: '開催日時タイマー', category: 'webinar' },
  { type: 'cta_section', label: 'CTAボタン', icon: Target, description: '申し込みボタン', category: 'webinar' },
  { type: 'delayed_cta', label: '時間制御CTA', icon: Timer, description: '遅延表示ボタン', category: 'webinar' },
  { type: 'testimonial', label: '参加者の声', icon: MessageCircle, description: 'テスティモニアル', category: 'common' },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'テキストカード', category: 'common' },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション', category: 'common' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問', category: 'common' },
  { type: 'lead_form', label: 'リードフォーム', icon: Mail, description: 'メール収集', category: 'common' },
];

const gradientPresets = [
  { name: 'ダーク', value: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)', animated: false },
  { name: 'パープル', value: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)', animated: true },
  { name: 'ネイビー', value: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)', animated: true },
  { name: 'ブラック', value: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)', animated: true },
  { name: 'グリーン', value: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)', animated: true },
];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all";
const textareaClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none";

function getDefaultBlocks(): Block[] {
  return [
    { id: generateBlockId(), type: 'hero', data: { headline: 'ウェビナータイトル', subheadline: 'サブタイトルを入力してください', ctaText: '今すぐ申し込む', ctaUrl: '' } },
    { id: generateBlockId(), type: 'youtube', data: { url: '' } },
    { id: generateBlockId(), type: 'speaker', data: { name: '講師名', title: '肩書き', image: '', bio: '講師の紹介文を入力してください' } },
    { id: generateBlockId(), type: 'agenda', data: { title: 'このウェビナーで学べること', items: [{ title: '内容1', description: '' }, { title: '内容2', description: '' }, { title: '内容3', description: '' }] } },
    { id: generateBlockId(), type: 'cta_section', data: { title: '今すぐ参加する', description: '席に限りがございます。お早めにお申し込みください。', buttonText: '無料で参加する', buttonUrl: '' } },
  ];
}

export default function WebinarEditor({ user, isAdmin, initialData, setPage, onBack, setShowAuth }: WebinarEditorProps) {
  const isEditing = !!initialData;
  const [blocks, setBlocks] = useState<Block[]>(initialData?.content || getDefaultBlocks());
  const [title, setTitle] = useState(initialData?.title || 'ウェビナーLP');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [settings, setSettings] = useState(initialData?.settings || {
    theme: { gradient: gradientPresets[0].value, animated: false },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showBlockPanel, setShowBlockPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // ブロック操作
  const addBlock = (type: string) => {
    const defaultData = getDefaultBlockData(type);
    const newBlock = { id: generateBlockId(), type, data: defaultData } as Block;
    setBlocks([...blocks, newBlock]);
    setExpandedBlock(newBlock.id);
    setShowBlockPanel(false);
  };

  const updateBlockData = (blockId: string, field: string, value: unknown) => {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      return { ...b, data: { ...b.data, [field]: value } } as Block;
    }));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (expandedBlock === blockId) setExpandedBlock(null);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // 画像アップロード
  const handleImageUpload = async (file: File, blockId: string, field: string) => {
    if (!supabase || !user) return;
    if (file.size > MAX_IMAGE_SIZE) {
      alert('画像サイズは2MB以下にしてください');
      return;
    }
    const ext = file.name.split('.').pop();
    const fileName = `webinar/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { alert('アップロードエラー: ' + error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    updateBlockData(blockId, field, publicUrl);
  };

  // 保存
  const handleSave = async () => {
    if (!user) { setShowAuth(true); return; }
    if (!supabase) return;
    setIsSaving(true);

    try {
      const saveSlug = slug || generateSlug();

      if (isEditing) {
        const { error } = await supabase
          .from('webinar_lps')
          .update({
            title,
            content: blocks,
            settings,
            updated_at: new Date().toISOString(),
          })
          .eq('slug', slug);

        if (error) throw error;
        alert('更新しました！');
      } else {
        const { error } = await supabase
          .from('webinar_lps')
          .insert({
            user_id: user.id,
            slug: saveSlug,
            title,
            content: blocks,
            settings,
            status: 'published',
          });

        if (error) throw error;
        setSlug(saveSlug);
        setShowCompleteModal(true);
      }
    } catch (error: any) {
      alert('保存エラー: ' + (error?.message || '不明なエラー'));
    } finally {
      setIsSaving(false);
    }
  };

  // ブロックタイプ別デフォルトデータ
  function getDefaultBlockData(type: string): Record<string, unknown> {
    switch (type) {
      case 'hero': return { headline: '', subheadline: '', ctaText: '今すぐ申し込む', ctaUrl: '' };
      case 'youtube': return { url: '' };
      case 'speaker': return { name: '', title: '', image: '', bio: '' };
      case 'agenda': return { title: '学べること', items: [{ title: '', description: '' }] };
      case 'countdown': return { title: '開催まで', targetDate: '', expiredText: 'アーカイブ視聴可能' };
      case 'cta_section': return { title: '', description: '', buttonText: '今すぐ申し込む', buttonUrl: '' };
      case 'delayed_cta': return { title: '', buttonText: '今すぐ申し込む', buttonUrl: '', delaySeconds: 300, buttonColor: '#7c3aed', buttonTextColor: '#ffffff' };
      case 'testimonial': return { items: [{ id: generateBlockId(), name: '', role: '', comment: '' }] };
      case 'text_card': return { title: '', text: '', align: 'left' };
      case 'image': return { url: '', alt: '', caption: '' };
      case 'faq': return { items: [{ id: generateBlockId(), question: '', answer: '' }] };
      case 'lead_form': return { title: '無料で参加する', buttonText: '申し込む' };
      default: return {};
    }
  }

  // テーマ背景スタイル
  const themeGradient = (settings as any)?.theme?.gradient;
  const previewBgStyle: React.CSSProperties = themeGradient
    ? { background: themeGradient, backgroundSize: '400% 400%' }
    : { backgroundColor: '#1e293b' };

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
    <div className="min-h-screen bg-gray-50">
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ウェビナーLPメーカー</h1>
              <p className="text-xs text-gray-500">{isEditing ? '編集中' : '新規作成'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/webinar/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <ExternalLink size={14} />
                公開URLを見る
              </a>
            )}
          </div>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-3 text-sm font-semibold text-center ${activeTab === 'editor' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500'}`}
          >
            <Edit3 size={16} className="inline mr-1" />
            編集
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-semibold text-center ${activeTab === 'preview' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500'}`}
          >
            <Eye size={16} className="inline mr-1" />
            プレビュー
          </button>
        </div>
      </div>

      <div className="flex">
        {/* エディタパネル */}
        <div className={`w-full lg:w-1/2 ${activeTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto p-4 pb-32 space-y-4">
            {/* タイトル */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <label className="text-sm font-bold text-gray-900 block mb-2">LPタイトル（管理用）</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ウェビナーのタイトル" className={inputClass} />
            </div>

            {/* テーマ設定 */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowThemeSettings(!showThemeSettings)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-violet-500" />
                  <span className="font-bold text-gray-900">テーマ設定</span>
                </div>
                {showThemeSettings ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {showThemeSettings && (
                <div className="p-5 pt-0 space-y-3">
                  <label className="text-sm font-bold text-gray-900 block">背景グラデーション</label>
                  <div className="grid grid-cols-5 gap-2">
                    {gradientPresets.map(p => (
                      <button
                        key={p.name}
                        onClick={() => setSettings({ ...settings, theme: { gradient: p.value, animated: p.animated } })}
                        className={`h-12 rounded-xl border-2 transition-all ${themeGradient === p.value ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200'}`}
                        style={{ background: p.value }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ブロック一覧 */}
            {blocks.map((block, index) => {
              const blockDef = blockTypes.find(bt => bt.type === block.type);
              const Icon = blockDef?.icon || Type;
              const isExpanded = expandedBlock === block.id;

              return (
                <div key={block.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* ブロックヘッダー */}
                  <div className="flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedBlock(isExpanded ? null : block.id)}>
                    <GripVertical size={16} className="text-gray-300" />
                    <Icon size={18} className="text-violet-500" />
                    <span className="font-semibold text-gray-900 flex-1">{blockDef?.label || block.type}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'up'); }} className="p-1 hover:bg-gray-100 rounded" disabled={index === 0}>
                        <ArrowUp size={14} className={index === 0 ? 'text-gray-200' : 'text-gray-400'} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'down'); }} className="p-1 hover:bg-gray-100 rounded" disabled={index === blocks.length - 1}>
                        <ArrowDown size={14} className={index === blocks.length - 1 ? 'text-gray-200' : 'text-gray-400'} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* ブロック編集フォーム */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-gray-100 space-y-4">
                      {renderBlockForm(block)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ブロック追加ボタン */}
            <button
              onClick={() => setShowBlockPanel(!showBlockPanel)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              ブロックを追加
            </button>

            {/* ブロック選択パネル */}
            {showBlockPanel && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                <h3 className="font-bold text-gray-900 mb-4">ブロックを選択</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {blockTypes.map(bt => {
                    const BIcon = bt.icon;
                    return (
                      <button
                        key={bt.type}
                        onClick={() => addBlock(bt.type)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors"
                      >
                        <BIcon size={20} className="text-violet-500" />
                        <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 保存ボタン */}
            <div className="sticky bottom-4 z-20">
              <div className="bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent pt-6 -mx-4 px-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  {isEditing ? '更新して保存' : '保存して公開'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* プレビューパネル */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] overflow-y-auto ${activeTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="min-h-full" style={previewBgStyle}>
            {blocks.map(block => (
              <BlockRenderer key={block.id} block={block} variant="business" />
            ))}
            {blocks.length === 0 && (
              <div className="flex items-center justify-center h-64 text-white/50">
                ブロックを追加してください
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 完成モーダル */}
      {showCompleteModal && slug && (
        <CreationCompleteModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          publicUrl={`${window.location.origin}/webinar/${slug}`}
          title="ウェビナーLP"
          contentTitle={title}
          theme="purple"
        />
      )}
    </div>
  );

  // ブロック編集フォームのレンダリング
  function renderBlockForm(block: Block) {
    switch (block.type) {
      case 'hero':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">見出し</label>
              <input type="text" value={block.data.headline || ''} onChange={e => updateBlockData(block.id, 'headline', e.target.value)} placeholder="ウェビナータイトル" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">サブ見出し</label>
              <input type="text" value={block.data.subheadline || ''} onChange={e => updateBlockData(block.id, 'subheadline', e.target.value)} placeholder="サブタイトル" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">CTAボタンテキスト</label>
              <input type="text" value={block.data.ctaText || ''} onChange={e => updateBlockData(block.id, 'ctaText', e.target.value)} placeholder="今すぐ申し込む" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">CTAボタンURL</label>
              <input type="url" value={block.data.ctaUrl || ''} onChange={e => updateBlockData(block.id, 'ctaUrl', e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], block.id, 'backgroundImage')} className="text-sm text-gray-500" />
              {block.data.backgroundImage && <img src={block.data.backgroundImage} alt="" className="mt-2 h-20 rounded-lg object-cover" />}
            </div>
          </>
        );

      case 'youtube':
        return (
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">YouTube URL</label>
            <input type="url" value={block.data.url || ''} onChange={e => updateBlockData(block.id, 'url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">YouTube動画のURLまたは埋め込みURLを入力</p>
          </div>
        );

      case 'speaker':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">講師名</label>
              <input type="text" value={block.data.name || ''} onChange={e => updateBlockData(block.id, 'name', e.target.value)} placeholder="講師の名前" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">肩書き</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="株式会社〇〇 代表取締役" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], block.id, 'image')} className="text-sm text-gray-500" />
              {block.data.image && <img src={block.data.image} alt="" className="mt-2 w-20 h-20 rounded-full object-cover" />}
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">紹介文</label>
              <textarea value={block.data.bio || ''} onChange={e => updateBlockData(block.id, 'bio', e.target.value)} placeholder="講師の経歴・実績を入力" rows={4} className={textareaClass} />
            </div>
          </>
        );

      case 'agenda':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">セクションタイトル</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="このウェビナーで学べること" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">項目</label>
              <div className="space-y-3">
                {(block.data.items || []).map((item: { title: string; description?: string }, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => {
                          const items = [...(block.data.items || [])];
                          items[i] = { ...items[i], title: e.target.value };
                          updateBlockData(block.id, 'items', items);
                        }}
                        placeholder="タイトル"
                        className={inputClass}
                      />
                      <button onClick={() => {
                        const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i);
                        updateBlockData(block.id, 'items', items);
                      }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={e => {
                        const items = [...(block.data.items || [])];
                        items[i] = { ...items[i], description: e.target.value };
                        updateBlockData(block.id, 'items', items);
                      }}
                      placeholder="説明（任意）"
                      className={inputClass}
                    />
                  </div>
                ))}
                <button
                  onClick={() => updateBlockData(block.id, 'items', [...(block.data.items || []), { title: '', description: '' }])}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm"
                >
                  + 項目を追加
                </button>
              </div>
            </div>
          </>
        );

      case 'countdown':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">タイトル</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="開催まであと" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">開催日時</label>
              <input type="datetime-local" value={block.data.targetDate?.slice(0, 16) || ''} onChange={e => updateBlockData(block.id, 'targetDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">期限切れ時テキスト</label>
              <input type="text" value={block.data.expiredText || ''} onChange={e => updateBlockData(block.id, 'expiredText', e.target.value)} placeholder="アーカイブ視聴可能" className={inputClass} />
            </div>
          </>
        );

      case 'cta_section':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">セクションタイトル</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="今すぐ参加する" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">説明文</label>
              <textarea value={block.data.description || ''} onChange={e => updateBlockData(block.id, 'description', e.target.value)} placeholder="説明文" rows={2} className={textareaClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">ボタンテキスト</label>
              <input type="text" value={block.data.buttonText || ''} onChange={e => updateBlockData(block.id, 'buttonText', e.target.value)} placeholder="無料で参加する" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">ボタンURL</label>
              <input type="url" value={block.data.buttonUrl || ''} onChange={e => updateBlockData(block.id, 'buttonUrl', e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </>
        );

      case 'delayed_cta':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">セクションタイトル</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="特別なご案内" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">ボタンテキスト</label>
              <input type="text" value={block.data.buttonText || ''} onChange={e => updateBlockData(block.id, 'buttonText', e.target.value)} placeholder="今すぐ申し込む" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">ボタンURL</label>
              <input type="url" value={block.data.buttonUrl || ''} onChange={e => updateBlockData(block.id, 'buttonUrl', e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">遅延時間（秒）</label>
              <input type="number" value={block.data.delaySeconds ?? 300} onChange={e => updateBlockData(block.id, 'delaySeconds', parseInt(e.target.value) || 0)} min={0} className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">0 = 即時表示、300 = 5分後に表示</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">ボタン色</label>
                <input type="color" value={block.data.buttonColor || '#7c3aed'} onChange={e => updateBlockData(block.id, 'buttonColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">文字色</label>
                <input type="color" value={block.data.buttonTextColor || '#ffffff'} onChange={e => updateBlockData(block.id, 'buttonTextColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
              </div>
            </div>
          </>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            {(block.data.items || []).map((item: { id: string; name: string; role: string; comment: string; imageUrl?: string }, i: number) => (
              <div key={item.id || i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">参加者 {i + 1}</span>
                  <button onClick={() => {
                    const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i);
                    updateBlockData(block.id, 'items', items);
                  }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
                <input type="text" value={item.name} onChange={e => {
                  const items = [...(block.data.items || [])];
                  items[i] = { ...items[i], name: e.target.value };
                  updateBlockData(block.id, 'items', items);
                }} placeholder="名前" className={inputClass} />
                <input type="text" value={item.role} onChange={e => {
                  const items = [...(block.data.items || [])];
                  items[i] = { ...items[i], role: e.target.value };
                  updateBlockData(block.id, 'items', items);
                }} placeholder="肩書き" className={inputClass} />
                <textarea value={item.comment} onChange={e => {
                  const items = [...(block.data.items || [])];
                  items[i] = { ...items[i], comment: e.target.value };
                  updateBlockData(block.id, 'items', items);
                }} placeholder="コメント" rows={3} className={textareaClass} />
              </div>
            ))}
            <button
              onClick={() => updateBlockData(block.id, 'items', [...(block.data.items || []), { id: generateBlockId(), name: '', role: '', comment: '' }])}
              className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm"
            >
              + 参加者を追加
            </button>
          </div>
        );

      case 'text_card':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">タイトル</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="タイトル" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">テキスト</label>
              <textarea value={block.data.text || ''} onChange={e => updateBlockData(block.id, 'text', e.target.value)} placeholder="テキストを入力" rows={4} className={textareaClass} />
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], block.id, 'url')} className="text-sm text-gray-500" />
              {block.data.url && <img src={block.data.url} alt="" className="mt-2 max-h-40 rounded-lg object-cover" />}
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">キャプション</label>
              <input type="text" value={block.data.caption || ''} onChange={e => updateBlockData(block.id, 'caption', e.target.value)} placeholder="画像の説明" className={inputClass} />
            </div>
          </>
        );

      case 'faq':
        return (
          <div className="space-y-3">
            {(block.data.items || []).map((item: { id: string; question: string; answer: string }, i: number) => (
              <div key={item.id || i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Q{i + 1}</span>
                  <button onClick={() => {
                    const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i);
                    updateBlockData(block.id, 'items', items);
                  }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
                <input type="text" value={item.question} onChange={e => {
                  const items = [...(block.data.items || [])];
                  items[i] = { ...items[i], question: e.target.value };
                  updateBlockData(block.id, 'items', items);
                }} placeholder="質問" className={inputClass} />
                <textarea value={item.answer} onChange={e => {
                  const items = [...(block.data.items || [])];
                  items[i] = { ...items[i], answer: e.target.value };
                  updateBlockData(block.id, 'items', items);
                }} placeholder="回答" rows={2} className={textareaClass} />
              </div>
            ))}
            <button
              onClick={() => updateBlockData(block.id, 'items', [...(block.data.items || []), { id: generateBlockId(), question: '', answer: '' }])}
              className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm"
            >
              + 質問を追加
            </button>
          </div>
        );

      case 'lead_form':
        return (
          <>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">タイトル</label>
              <input type="text" value={block.data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} placeholder="無料で参加する" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">ボタンテキスト</label>
              <input type="text" value={block.data.buttonText || ''} onChange={e => updateBlockData(block.id, 'buttonText', e.target.value)} placeholder="申し込む" className={inputClass} />
            </div>
          </>
        );

      default:
        return <p className="text-gray-500 text-sm">このブロックの編集フォームは準備中です</p>;
    }
  }
}
