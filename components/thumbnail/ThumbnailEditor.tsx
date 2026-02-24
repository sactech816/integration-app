'use client';

import React, { useState, useCallback, useRef } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Thumbnail, ThumbnailPlatform, ThumbnailGenerationMode, SVGTextElement } from '@/lib/types';
import {
  PLATFORM_CATEGORIES,
  STYLE_CATEGORIES,
  getTemplatesByPlatform,
  ThumbnailTemplate,
  ThumbnailStyleCategory,
} from '@/constants/templates/thumbnail';
import {
  Youtube, Instagram, Twitter, MessageCircle, Image as ImageIcon,
  Sparkles, Download, Save, Loader2,
  RefreshCw, Check, Crown, Lock, Type,
  ChevronUp, ChevronDown, Monitor, Palette, Settings,
  Edit3, Eye, Layers, FileImage,
} from 'lucide-react';
import AIEditChat from './AIEditChat';
import SVGTextOverlay, { SVGTextOverlayRef } from './SVGTextOverlay';
import TextEditPanel from './TextEditPanel';
import { downloadSVG, downloadPNG, exportAsPNG } from '@/lib/thumbnail/exportSvg';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

interface ThumbnailEditorProps {
  user: { id: string; email?: string } | null;
  editingThumbnail?: Thumbnail | null;
  setShowAuth: (show: boolean) => void;
  isPro?: boolean;
}

const platformIcons: Record<string, React.ElementType> = {
  Youtube, Instagram, Twitter, MessageCircle, Image: ImageIcon,
};

// --- セクションコンポーネント（QuizEditorと同一パターン） ---
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
  step,
  stepLabel,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {step && stepLabel && (
      <div className="px-5 py-2 bg-pink-50/50 border-b border-gray-200/50">
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          STEP {step}
        </span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-pink-100 text-pink-600' : 'bg-gray-200 text-gray-500'}`}>
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

export default function ThumbnailEditor({ user, editingThumbnail, setShowAuth, isPro = false }: ThumbnailEditorProps) {
  // セクション開閉状態
  const [openSections, setOpenSections] = useState({
    platform: !editingThumbnail,
    style: !!editingThumbnail,
    text: !!editingThumbnail,
    advanced: false,
  });

  // モバイル用タブ切り替え
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Step 1: プラットフォーム
  const [selectedPlatform, setSelectedPlatform] = useState<ThumbnailPlatform>(
    editingThumbnail?.platform || 'youtube'
  );

  // Step 2: テンプレート
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyleCategory | null>(null);

  // Step 3: テキスト + カラー
  const [title, setTitle] = useState(editingThumbnail?.text_overlay?.title || '');
  const [subtitle, setSubtitle] = useState(editingThumbnail?.text_overlay?.subtitle || '');
  const [selectedColorTheme, setSelectedColorTheme] = useState('');

  // 生成モード
  const [generationMode, setGenerationMode] = useState<ThumbnailGenerationMode>(
    editingThumbnail?.text_overlay?.mode || 'ai_text'
  );

  // 編集可能テキストモード用
  const svgOverlayRef = useRef<SVGTextOverlayRef>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    editingThumbnail?.text_overlay?.backgroundImageUrl || null
  );
  const [svgTextElements, setSvgTextElements] = useState<SVGTextElement[]>(
    editingThumbnail?.text_overlay?.svgTextElements || []
  );
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(null);

  // 生成結果
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(editingThumbnail?.image_url || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trialExceeded, setTrialExceeded] = useState(false);

  // 保存
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(editingThumbnail?.slug || null);

  // 作成完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedUrl, setCompletedUrl] = useState('');

  // プラットフォーム別のテンプレートを取得
  const platformTemplates = getTemplatesByPlatform(selectedPlatform);
  const filteredTemplates = selectedStyle
    ? platformTemplates.filter(t => t.styleCategory === selectedStyle)
    : platformTemplates;

  // アスペクト比
  const currentAspectRatio = selectedTemplate?.aspectRatio ||
    PLATFORM_CATEGORIES.find(p => p.id === selectedPlatform)?.aspectRatio || '16:9';

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // AI画像生成
  const handleGenerate = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/thumbnail/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate?.id,
          title,
          subtitle,
          colorThemeId: selectedColorTheme,
          platform: selectedPlatform,
          aspectRatio: currentAspectRatio,
          userId: user.id,
          mode: generationMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (generationMode === 'editable_text') {
          // 背景のみモード: SVGオーバーレイを初期化
          setBackgroundImageUrl(data.imageUrl);
          setGeneratedImageUrl(null);
          const defaultElements: SVGTextElement[] = [
            {
              id: `title-${Date.now()}`,
              text: title,
              x: 50, y: 45,
              fontSize: 64,
              fontFamily: 'Noto Sans JP',
              fontWeight: 900,
              color: '#FFFFFF',
              strokeColor: '#000000',
              strokeWidth: 4,
              textAlign: 'center',
            },
          ];
          if (subtitle) {
            defaultElements.push({
              id: `subtitle-${Date.now()}`,
              text: subtitle,
              x: 50, y: 65,
              fontSize: 36,
              fontFamily: 'Noto Sans JP',
              fontWeight: 700,
              color: '#FFFFFF',
              strokeColor: '#000000',
              strokeWidth: 3,
              textAlign: 'center',
            });
          }
          setSvgTextElements(defaultElements);
          setSelectedTextElementId(defaultElements[0].id);
        } else {
          // 通常モード
          setGeneratedImageUrl(data.imageUrl);
          setBackgroundImageUrl(null);
          setSvgTextElements([]);
        }
        // モバイルではプレビュータブに自動切り替え
        setMobileTab('preview');
      } else if (data.error === 'FREE_TRIAL_EXCEEDED') {
        setTrialExceeded(true);
        setError(null);
      } else {
        setError(data.message || data.error || '生成に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  }, [title, subtitle, selectedTemplate, selectedColorTheme, selectedPlatform, currentAspectRatio, user, setShowAuth, generationMode]);

  // 保存
  const handleSave = async () => {
    if (!supabase) return;
    if (!user) {
      setShowAuth(true);
      return;
    }

    // editable_textモードの場合は背景画像が必要、通常モードは生成画像が必要
    const hasContent = generationMode === 'editable_text' ? backgroundImageUrl : generatedImageUrl;
    if (!hasContent) return;

    setIsSaving(true);
    try {
      // editable_textモードの場合、SVGからPNGをレンダリングしてアップロード
      let imageUrlToSave = generatedImageUrl;
      if (generationMode === 'editable_text' && svgOverlayRef.current?.getSVGElement()) {
        const svgEl = svgOverlayRef.current.getSVGElement()!;
        const [w, h] = currentAspectRatio === '9:16' ? [1080, 1920] : currentAspectRatio === '1:1' ? [1080, 1080] : [1280, 720];
        const pngBlob = await exportAsPNG(svgEl, w, h);
        const filePath = `${user.id}/${Date.now()}_composed.png`;
        const { error: uploadErr } = await supabase.storage
          .from('thumbnail-images')
          .upload(filePath, pngBlob, { contentType: 'image/png' });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from('thumbnail-images')
          .getPublicUrl(filePath);
        imageUrlToSave = urlData.publicUrl;
      }

      const slug = savedSlug || generateSlug();
      const thumbnailData = {
        slug,
        title: title || '新規サムネイル',
        image_url: imageUrlToSave,
        platform: selectedPlatform,
        aspect_ratio: currentAspectRatio,
        template_id: selectedTemplate?.id || null,
        text_overlay: {
          title, subtitle, colorTheme: selectedColorTheme,
          mode: generationMode,
          ...(generationMode === 'editable_text' ? { svgTextElements, backgroundImageUrl } : {}),
        },
        user_id: user.id,
        status: 'published',
      };

      if (editingThumbnail) {
        const { error: updateError } = await supabase
          .from(TABLES.THUMBNAILS)
          .update(thumbnailData)
          .eq('id', editingThumbnail.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from(TABLES.THUMBNAILS)
          .insert([thumbnailData]);
        if (insertError) throw insertError;
      }

      setSavedSlug(slug);
      const publicUrl = `${window.location.origin}/thumbnail/${slug}`;
      setCompletedUrl(publicUrl);
      setShowCompleteModal(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '不明なエラー';
      alert('保存に失敗しました: ' + msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ダウンロード（通常モード: PNG直接 / 編集テキストモード: SVGまたはPNG）
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const handleDownload = async () => {
    if (generationMode === 'editable_text' && svgOverlayRef.current?.getSVGElement()) {
      // editable_textモードの場合はメニュー表示
      setShowDownloadMenu(!showDownloadMenu);
      return;
    }
    // 通常モード
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail_${title || 'image'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('ダウンロードに失敗しました');
    }
  };

  const handleDownloadSVG = async () => {
    const svgEl = svgOverlayRef.current?.getSVGElement();
    if (!svgEl) return;
    try {
      await downloadSVG(svgEl, `thumbnail_${title || 'image'}`);
    } catch {
      alert('SVGダウンロードに失敗しました');
    }
    setShowDownloadMenu(false);
  };

  const handleDownloadPNG = async () => {
    const svgEl = svgOverlayRef.current?.getSVGElement();
    if (!svgEl) return;
    try {
      const [w, h] = currentAspectRatio === '9:16' ? [1080, 1920] : currentAspectRatio === '1:1' ? [1080, 1080] : [1280, 720];
      await downloadPNG(svgEl, w, h, `thumbnail_${title || 'image'}`);
    } catch {
      alert('PNGダウンロードに失敗しました');
    }
    setShowDownloadMenu(false);
  };

  // AI編集後の画像URL更新
  const handleImageEdited = (newImageUrl: string) => {
    if (generationMode === 'editable_text') {
      setBackgroundImageUrl(newImageUrl);
    } else {
      setGeneratedImageUrl(newImageUrl);
    }
  };

  // SVGテキスト要素の操作
  const handleUpdateTextElement = (id: string, updates: Partial<SVGTextElement>) => {
    setSvgTextElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleAddTextElement = () => {
    const newElement: SVGTextElement = {
      id: `text-${Date.now()}`,
      text: '新しいテキスト',
      x: 50, y: 50,
      fontSize: 40,
      fontFamily: 'Noto Sans JP',
      fontWeight: 700,
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      textAlign: 'center',
    };
    setSvgTextElements(prev => [...prev, newElement]);
    setSelectedTextElementId(newElement.id);
  };

  const handleDeleteTextElement = (id: string) => {
    setSvgTextElements(prev => {
      const filtered = prev.filter(el => el.id !== id);
      if (selectedTextElementId === id) {
        setSelectedTextElementId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  // 表示すべきコンテンツがあるか
  const hasGeneratedContent = generationMode === 'editable_text' ? !!backgroundImageUrl : !!generatedImageUrl;

  // 選択中の情報サマリー
  const selectedPlatformLabel = PLATFORM_CATEGORIES.find(p => p.id === selectedPlatform)?.label || '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* ページタイトル */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editingThumbnail ? 'サムネイルを編集' : 'サムネイルを作成'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">AIでSNS用のサムネイルを自動生成できます</p>
      </div>

      {/* モバイル用タブ切り替え */}
      <div className="lg:hidden flex mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mobileTab === 'editor'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Edit3 size={16} />
          エディタ
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mobileTab === 'preview'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye size={16} />
          プレビュー
        </button>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左パネル: エディタ */}
        <div className={`${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Section 1: プラットフォーム選択 */}
          <Section
            title="プラットフォーム選択"
            icon={Monitor}
            isOpen={openSections.platform}
            onToggle={() => toggleSection('platform')}
            step={1}
            stepLabel="サムネイルを使うSNSを選択"
            badge={selectedPlatformLabel}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORM_CATEGORIES.map((platform) => {
                const Icon = platformIcons[platform.icon] || ImageIcon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setSelectedTemplate(null);
                      setSelectedStyle(null);
                      setOpenSections(prev => ({ ...prev, platform: false, style: true }));
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                      selectedPlatform === platform.id
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-200 bg-white hover:border-pink-200'
                    }`}
                  >
                    <Icon size={28} className="mx-auto mb-2 text-pink-500" />
                    <p className="font-bold text-gray-900 text-sm">{platform.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{platform.aspectRatio}</p>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Section 2: スタイル＆テンプレート */}
          <Section
            title="スタイル＆テンプレート"
            icon={Palette}
            isOpen={openSections.style}
            onToggle={() => toggleSection('style')}
            step={2}
            stepLabel="デザインスタイルを選択"
            badge={selectedTemplate?.name}
          >
            {/* スタイルフィルター */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedStyle(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !selectedStyle ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {STYLE_CATEGORIES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedStyle === style.id ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* テンプレートグリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedColorTheme(template.colorThemes[0]?.id || '');
                    setOpenSections(prev => ({ ...prev, style: false, text: true }));
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">
                このプラットフォーム×スタイルのテンプレートはまだありません
              </p>
            )}
          </Section>

          {/* Section 3: テキスト＆カラー */}
          <Section
            title="テキスト＆カラー"
            icon={Type}
            isOpen={openSections.text}
            onToggle={() => toggleSection('text')}
            step={3}
            stepLabel="テキストとカラーテーマを入力"
            badge={title ? `${title.slice(0, 10)}${title.length > 10 ? '...' : ''}` : undefined}
          >
            {/* Pro/トライアルバナー */}
            {!isPro && !trialExceeded && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                <Crown size={18} className="text-amber-500 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold text-amber-700">無料トライアル</span>
                  <span className="text-amber-600 ml-1">- 1回だけ無料でお試しできます（Pro機能）</span>
                </div>
              </div>
            )}

            {/* トライアル超過メッセージ */}
            {trialExceeded && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-5 text-center space-y-3 mb-4">
                <Lock size={24} className="text-pink-400 mx-auto" />
                <h3 className="font-bold text-gray-900">無料トライアルを使い切りました</h3>
                <p className="text-sm text-gray-600">
                  サムネイルメーカーはPro機能です。<br />
                  Proプランにアップグレードすると無制限にご利用いただけます。
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Crown size={16} />
                  Proプランを見る
                </a>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">メインテキスト *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 知らないと損する3つの秘密"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-lg text-gray-900 placeholder:text-gray-400"
                  maxLength={50}
                />
                <p className="text-xs text-gray-400 mt-1">{title.length}/50文字</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">サブテキスト（任意）</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="例: 今すぐチェック！"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-gray-900 placeholder:text-gray-400"
                  maxLength={30}
                />
              </div>

              {/* カラーテーマ */}
              {selectedTemplate && selectedTemplate.colorThemes.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">カラーテーマ</label>
                  <div className="flex flex-wrap gap-3">
                    {selectedTemplate.colorThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedColorTheme(theme.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          selectedColorTheme === theme.id
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {theme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 生成モード切り替え */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">生成モード</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGenerationMode('ai_text')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    generationMode === 'ai_text'
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                >
                  <FileImage size={18} className={generationMode === 'ai_text' ? 'text-pink-500' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">AI テキスト</p>
                    <p className="text-xs text-gray-500">画像に直接テキスト描画</p>
                  </div>
                </button>
                <button
                  onClick={() => setGenerationMode('editable_text')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    generationMode === 'editable_text'
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                >
                  <Layers size={18} className={generationMode === 'editable_text' ? 'text-pink-500' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">編集可能テキスト</p>
                    <p className="text-xs text-gray-500">生成後に文字を自由編集</p>
                  </div>
                </button>
              </div>
              {generationMode === 'editable_text' && (
                <p className="text-xs text-purple-600 mt-2 bg-purple-50 px-3 py-2 rounded-lg">
                  AIが背景画像のみを生成し、テキストは後から自由に編集（フォント・サイズ・色・位置）できます。SVG形式でのダウンロードも可能です。
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mt-4">{error}</div>
            )}

            {/* 生成ボタン */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !title.trim() || trialExceeded}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {!isPro ? 'お試し生成する（残り1回）' : 'AIで生成する'}
                  </>
                )}
              </button>
            </div>
          </Section>

          {/* Section 4: 詳細設定（将来拡張用） */}
          <Section
            title="詳細設定"
            icon={Settings}
            isOpen={openSections.advanced}
            onToggle={() => toggleSection('advanced')}
            step={4}
            stepLabel="追加オプション"
          >
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                現在利用可能な詳細設定はありません。<br />
                今後、解像度設定や出力形式の選択などが追加される予定です。
              </p>
            </div>
          </Section>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`${mobileTab === 'editor' ? 'hidden lg:block' : ''}`}>
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* プレビューヘッダー */}
            <div className="hidden lg:flex items-center gap-2 mb-2">
              <Eye size={16} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-700">プレビュー</span>
            </div>

            {/* プレビュー表示 */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {generationMode === 'editable_text' && backgroundImageUrl ? (
                /* 編集可能テキストモード: SVGオーバーレイ */
                <div className="p-4">
                  <div
                    className="relative mx-auto"
                    style={{ maxWidth: currentAspectRatio === '9:16' ? '320px' : '100%' }}
                  >
                    <SVGTextOverlay
                      ref={svgOverlayRef}
                      backgroundImageUrl={backgroundImageUrl}
                      aspectRatio={currentAspectRatio}
                      textElements={svgTextElements}
                      onTextElementsChange={setSvgTextElements}
                      selectedElementId={selectedTextElementId}
                      onSelectElement={setSelectedTextElementId}
                    />
                  </div>
                </div>
              ) : generatedImageUrl ? (
                /* 通常モード: 生成済み画像 */
                <div className="p-4">
                  <div
                    className="relative mx-auto overflow-hidden rounded-xl bg-gray-100"
                    style={{
                      maxWidth: currentAspectRatio === '9:16' ? '320px' : '100%',
                      aspectRatio: currentAspectRatio.replace(':', '/'),
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="生成されたサムネイル"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                /* プレースホルダー */
                <div className="p-6">
                  <div
                    className="relative mx-auto overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center"
                    style={{
                      maxWidth: currentAspectRatio === '9:16' ? '280px' : '100%',
                      aspectRatio: currentAspectRatio.replace(':', '/'),
                      minHeight: '200px',
                    }}
                  >
                    <ImageIcon size={48} className="text-gray-300 mb-3" />
                    <p className="text-sm font-bold text-gray-400 mb-1">プレビュー</p>
                    <p className="text-xs text-gray-400 text-center px-4">
                      設定を入力してAI生成ボタンを押すと<br />ここにサムネイルが表示されます
                    </p>

                    {/* 選択済み情報 */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {selectedPlatformLabel && (
                        <span className="text-xs bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full font-medium">
                          {selectedPlatformLabel}
                        </span>
                      )}
                      {selectedTemplate && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full font-medium">
                          {selectedTemplate.name}
                        </span>
                      )}
                      {title && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                          {title.length > 15 ? title.slice(0, 15) + '...' : title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* アクションボタン（生成後のみ表示） */}
              {hasGeneratedContent && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-2 relative">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm text-gray-700 hover:border-pink-300 hover:bg-pink-50 transition-all"
                    >
                      <Download size={16} />
                      ダウンロード
                    </button>

                    {/* SVG/PNGダウンロードメニュー（editable_textモード時） */}
                    {showDownloadMenu && generationMode === 'editable_text' && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 w-48">
                        <button
                          onClick={handleDownloadPNG}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 transition-colors rounded-t-xl"
                        >
                          <FileImage size={16} className="text-pink-500" />
                          PNG（画像）
                        </button>
                        <button
                          onClick={handleDownloadSVG}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors rounded-b-xl border-t border-gray-100"
                        >
                          <Layers size={16} className="text-purple-500" />
                          SVG（テキスト編集可能）
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? '保存中...' : '保存する'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setGeneratedImageUrl(null);
                      setBackgroundImageUrl(null);
                      setSvgTextElements([]);
                      setSelectedTextElementId(null);
                      setShowDownloadMenu(false);
                      setMobileTab('editor');
                      setOpenSections(prev => ({ ...prev, text: true }));
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    <RefreshCw size={14} />
                    作り直す
                  </button>
                </div>
              )}
            </div>

            {/* 編集可能テキストモード: テキスト編集パネル */}
            {generationMode === 'editable_text' && backgroundImageUrl && (
              <TextEditPanel
                textElements={svgTextElements}
                selectedElementId={selectedTextElementId}
                onUpdateElement={handleUpdateTextElement}
                onAddElement={handleAddTextElement}
                onDeleteElement={handleDeleteTextElement}
                onSelectElement={setSelectedTextElementId}
              />
            )}

            {/* AI編集セクション（生成後のみ表示） */}
            {hasGeneratedContent && (
              <>
                {/* テキスト変更セクション（通常モードのみ） */}
                {generationMode === 'ai_text' && generatedImageUrl && (
                  <TextChangeSection
                    imageUrl={generatedImageUrl}
                    aspectRatio={currentAspectRatio}
                    userId={user?.id}
                    isPro={isPro}
                    onImageEdited={handleImageEdited}
                  />
                )}

                {/* AI編集チャット（背景画像の編集にも使える） */}
                <AIEditChat
                  imageUrl={(generationMode === 'editable_text' ? backgroundImageUrl : generatedImageUrl) || ''}
                  aspectRatio={currentAspectRatio}
                  userId={user?.id}
                  onImageEdited={handleImageEdited}
                  isPro={isPro}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 生成中のフルスクリーンローダー */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Sparkles size={24} className="text-white animate-pulse" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">AIが画像を生成中...</h3>
            <p className="text-gray-500 text-sm mt-2">少々お待ちください（通常10-30秒）</p>
          </div>
        </div>
      )}

      {/* 作成完了モーダル */}
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="サムネイル"
        publicUrl={completedUrl}
        contentTitle={title ? `「${title}」のサムネイルを作りました！` : undefined}
        theme="rose"
        showQrCode={false}
      />
    </div>
  );
}

// テキスト変更セクション
function TextChangeSection({
  imageUrl,
  aspectRatio,
  userId,
  isPro,
  onImageEdited,
}: {
  imageUrl: string;
  aspectRatio: string;
  userId?: string;
  isPro: boolean;
  onImageEdited: (url: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = async () => {
    if (!newTitle.trim()) {
      setError('変更後のテキストを入力してください');
      return;
    }
    if (!isPro) {
      setError('テキスト変更はPro機能です');
      return;
    }

    setIsChanging(true);
    setError(null);

    try {
      const instruction = newSubtitle.trim()
        ? `画像内のすべてのテキストを以下に変更してください。デザインやレイアウトはそのまま維持してください。\nメインテキスト: "${newTitle}"\nサブテキスト: "${newSubtitle}"`
        : `画像内のメインテキストを "${newTitle}" に変更してください。デザインやレイアウト、その他の要素はそのまま維持してください。`;

      const res = await fetch('/api/thumbnail/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          editInstruction: instruction,
          aspectRatio,
          userId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onImageEdited(data.imageUrl);
        setNewTitle('');
        setNewSubtitle('');
        setIsOpen(false);
      } else {
        setError(data.message || data.error || 'テキスト変更に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Type size={16} className="text-purple-500" />
          <span className="font-bold text-gray-800 text-sm">テキストだけ変更</span>
          {!isPro && (
            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">Pro</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {!isPro ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-2">テキスト変更はPro機能です</p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-700"
              >
                <Crown size={14} />
                Proにアップグレード
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">新しいメインテキスト *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="変更後のテキストを入力"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">新しいサブテキスト（任意）</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="変更後のサブテキスト"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  maxLength={30}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs">{error}</div>
              )}

              <button
                onClick={handleTextChange}
                disabled={isChanging || !newTitle.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    テキスト変更中...
                  </>
                ) : (
                  <>
                    <Type size={16} />
                    テキストを変更する
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
