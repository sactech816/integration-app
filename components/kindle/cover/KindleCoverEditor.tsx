'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Briefcase,
  Heart,
  BookOpen,
  Feather,
  GraduationCap,
  UtensilsCrossed,
  Camera,
  Palette,
  Sparkles,
  Download,
  Loader2,
  RefreshCw,
  Crown,
  Lock,
  ChevronUp,
  ChevronDown,
  Edit3,
  Eye,
  Image as ImageIcon,
  Type,
  Settings,
  AlertCircle,
  FileImage,
  Layers,
  Upload,
  Ribbon,
} from 'lucide-react';
import {
  kindleCoverTemplates,
  getKindleCoverTemplatesByGenre,
  KINDLE_COVER_GENRES,
  type KindleCoverTemplate,
  type KindleCoverGenre,
} from '@/constants/templates/kindle-cover';
import { supabase, TABLES } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { SVGTextElement } from '@/lib/types';
import SVGTextOverlay, { SVGTextOverlayRef } from '@/components/thumbnail/SVGTextOverlay';
import TextEditPanel from '@/components/thumbnail/TextEditPanel';
import { exportAsPNG } from '@/lib/thumbnail/exportSvg';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import { usePointsWithLimitModal } from '@/lib/hooks/usePointsWithLimitModal';
import CreationLimitModal from '@/components/shared/CreationLimitModal';

// ジャンルアイコンマップ
const GENRE_ICONS: Record<KindleCoverGenre, React.ElementType> = {
  business: Briefcase,
  self_help: Heart,
  how_to: BookOpen,
  novel: Feather,
  education: GraduationCap,
  cooking_health: UtensilsCrossed,
  photo_travel: Camera,
  manga_illustration: Palette,
};

// --- セクションコンポーネント（ThumbnailEditorと統一パターン） ---
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
      <div className="px-5 py-2 bg-orange-50/50 border-b border-gray-200/50">
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
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
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

interface KindleCoverEditorProps {
  user: { id: string; email?: string } | null;
  setShowAuth: (show: boolean) => void;
  isPro?: boolean;
  // Kindle連携用（オプション）
  bookId?: string;
  bookTitle?: string;
  bookSubtitle?: string | null;
  onCoverGenerated?: (imageUrl: string) => void;
}

export default function KindleCoverEditor({
  user,
  setShowAuth,
  isPro = false,
  bookId,
  bookTitle,
  bookSubtitle,
  onCoverGenerated,
}: KindleCoverEditorProps) {
  const { consumeAndExecute, limitModalProps } = usePointsWithLimitModal({ userId: user?.id, isPro });

  // セクション開閉状態
  const [openSections, setOpenSections] = useState({
    genre: true,
    template: false,
    text: false,
    advanced: false,
  });

  // モバイル用タブ切り替え
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Step 1: ジャンル
  const [selectedGenre, setSelectedGenre] = useState<KindleCoverGenre>('business');

  // Step 2: テンプレート
  const [selectedTemplate, setSelectedTemplate] = useState<KindleCoverTemplate | null>(null);
  const [selectedColorThemeId, setSelectedColorThemeId] = useState<string>('');

  // Step 3: テキスト
  const [title, setTitle] = useState(bookTitle || '');
  const [subtitle, setSubtitle] = useState(bookSubtitle || '');
  const [authorName, setAuthorName] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  // Step 4: 詳細設定
  const [imageSize, setImageSize] = useState<'2K' | '4K'>('2K');

  // 帯（おび）
  const [obiEnabled, setObiEnabled] = useState(false);
  const [obiText, setObiText] = useState('');
  const [obiStyle, setObiStyle] = useState<'red' | 'gold' | 'blue' | 'green'>('red');

  // 生成モード
  const [generationMode, setGenerationMode] = useState<'ai_text' | 'editable_text'>('ai_text');

  // 編集可能テキストモード用
  const svgOverlayRef = useRef<SVGTextOverlayRef>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [svgTextElements, setSvgTextElements] = useState<SVGTextElement[]>([]);
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(null);

  // 生成結果
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trialExceeded, setTrialExceeded] = useState(false);
  const [limitError, setLimitError] = useState<{ message: string; usedCount: number; limit: number } | null>(null);

  // 保存
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  // 作成完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedUrl, setCompletedUrl] = useState('');

  // 初期テンプレート設定
  useEffect(() => {
    const templates = getKindleCoverTemplatesByGenre('business');
    if (templates.length > 0) {
      setSelectedTemplate(templates[0]);
      setSelectedColorThemeId(templates[0].colorThemes[0]?.id || '');
    }
  }, []);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ジャンル別テンプレート
  const genreTemplates = getKindleCoverTemplatesByGenre(selectedGenre);
  const selectedGenreLabel = KINDLE_COVER_GENRES.find(g => g.id === selectedGenre)?.label || '';

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
    setLimitError(null);

    try {
      const res = await fetch('/api/kdl/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate?.id,
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          authorName: authorName.trim() || undefined,
          colorThemeId: selectedColorThemeId || undefined,
          additionalPrompt: additionalPrompt.trim() || undefined,
          imageSize,
          userId: user.id,
          bookId: bookId || undefined,
          mode: generationMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'COVER_LIMIT_EXCEEDED') {
          setLimitError({
            message: data.message,
            usedCount: data.usedCount,
            limit: data.limit,
          });
          setTrialExceeded(true);
          return;
        }
        throw new Error(data.error || data.message || '生成に失敗しました');
      }

      if (generationMode === 'editable_text') {
        // 背景のみモード: SVGオーバーレイを初期化
        setBackgroundImageUrl(data.imageUrl);
        setGeneratedImageUrl(null);
        const defaultElements: SVGTextElement[] = [
          {
            id: `title-${Date.now()}`,
            text: title,
            x: 50, y: 40,
            fontSize: 72,
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
            x: 50, y: 55,
            fontSize: 36,
            fontFamily: 'Noto Sans JP',
            fontWeight: 700,
            color: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 3,
            textAlign: 'center',
          });
        }
        if (authorName) {
          defaultElements.push({
            id: `author-${Date.now()}`,
            text: authorName,
            x: 50, y: 88,
            fontSize: 28,
            fontFamily: 'Noto Sans JP',
            fontWeight: 400,
            color: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 2,
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

      onCoverGenerated?.(data.imageUrl);
      // モバイルではプレビュータブに自動切り替え
      setMobileTab('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  }, [title, subtitle, authorName, selectedTemplate, selectedColorThemeId, additionalPrompt, imageSize, user, setShowAuth, bookId, onCoverGenerated, generationMode]);

  // ダウンロード
  const handleDownload = async () => {
    // editable_textモード: SVGからPNGを生成
    if (generationMode === 'editable_text' && svgOverlayRef.current?.getSVGElement()) {
      try {
        const svgEl = svgOverlayRef.current.getSVGElement()!;
        const { exportAsPNG: exportPNG } = await import('@/lib/thumbnail/exportSvg');
        const pngBlob = await exportPNG(svgEl, 1080, 1920);
        const url = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kindle-cover-${title || 'image'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        setError('ダウンロードに失敗しました');
      }
      return;
    }

    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kindle-cover-${title || 'image'}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('ダウンロードに失敗しました');
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

  // 保存
  const handleSave = async () => {
    if (!supabase) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    const hasContent = generationMode === 'editable_text' ? backgroundImageUrl : generatedImageUrl;
    if (!hasContent) return;

    await consumeAndExecute('kindle_cover', 'save', async () => {
      setIsSaving(true);
      try {
        // editable_textモードの場合、SVGからPNGをレンダリングしてアップロード
        let imageUrlToSave = generatedImageUrl;
        if (generationMode === 'editable_text' && svgOverlayRef.current?.getSVGElement()) {
          const svgEl = svgOverlayRef.current.getSVGElement()!;
          const pngBlob = await exportAsPNG(svgEl, 1080, 1920);
          const filePath = `kindle-covers/${user.id}/${Date.now()}_composed.png`;
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
        const coverData = {
          slug,
          title: title || '新規Kindle表紙',
          image_url: imageUrlToSave,
          genre: selectedGenre,
          template_id: selectedTemplate?.id || null,
          color_theme_id: selectedColorThemeId || null,
          subtitle: subtitle || null,
          author_name: authorName || null,
          additional_prompt: additionalPrompt || null,
          image_size: imageSize,
          book_id: bookId || null,
          user_id: user.id,
          status: 'published',
        };

        if (savedSlug) {
          const { error: updateError } = await supabase
            .from(TABLES.KINDLE_COVERS)
            .update(coverData)
            .eq('slug', savedSlug)
            .eq('user_id', user.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from(TABLES.KINDLE_COVERS)
            .insert([coverData]);
          if (insertError) throw insertError;
        }

        setSavedSlug(slug);
        const publicUrl = `${window.location.origin}/kindle/cover/${slug}`;
        setCompletedUrl(publicUrl);
        setShowCompleteModal(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '不明なエラー';
        alert('保存に失敗しました: ' + msg);
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* ページタイトル */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Kindle 表紙を作成
        </h1>
        <p className="text-gray-500 text-sm mt-1">AIでプロ品質のKindle表紙を自動生成できます</p>
      </div>

      {/* モバイル用タブ切り替え */}
      <div className="lg:hidden flex mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mobileTab === 'editor'
              ? 'bg-white text-orange-600 shadow-sm'
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
              ? 'bg-white text-orange-600 shadow-sm'
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
          {/* Section 1: ジャンル選択 */}
          <Section
            title="ジャンル選択"
            icon={BookOpen}
            isOpen={openSections.genre}
            onToggle={() => toggleSection('genre')}
            step={1}
            stepLabel="書籍のジャンルを選択"
            badge={selectedGenreLabel}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {KINDLE_COVER_GENRES.map((genre) => {
                const Icon = GENRE_ICONS[genre.id];
                return (
                  <button
                    key={genre.id}
                    onClick={() => {
                      setSelectedGenre(genre.id);
                      const templates = getKindleCoverTemplatesByGenre(genre.id);
                      if (templates.length > 0) {
                        setSelectedTemplate(templates[0]);
                        setSelectedColorThemeId(templates[0].colorThemes[0]?.id || '');
                      }
                      setOpenSections(prev => ({ ...prev, genre: false, template: true }));
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                      selectedGenre === genre.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-1.5 text-orange-500" />
                    <p className="font-bold text-gray-900 text-xs">{genre.label}</p>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Section 2: テンプレート選択 */}
          <Section
            title="テンプレート選択"
            icon={Palette}
            isOpen={openSections.template}
            onToggle={() => toggleSection('template')}
            step={2}
            stepLabel="デザインテンプレートを選択"
            badge={selectedTemplate?.name}
          >
            {/* テンプレートグリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {genreTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedColorThemeId(template.colorThemes[0]?.id || '');
                    setOpenSections(prev => ({ ...prev, template: false, text: true }));
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shrink-0">
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

            {genreTemplates.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">
                このジャンルのテンプレートはまだありません
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
            stepLabel="タイトルとカラーテーマを入力"
            badge={title ? `${title.slice(0, 10)}${title.length > 10 ? '...' : ''}` : undefined}
          >
            {/* Pro/トライアルバナー */}
            {!isPro && !trialExceeded && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                <Crown size={18} className="text-amber-500 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold text-amber-700">無料トライアル</span>
                  <span className="text-amber-600 ml-1">- プラン別の回数制限内で生成できます</span>
                </div>
              </div>
            )}

            {/* トライアル超過メッセージ */}
            {trialExceeded && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 text-center space-y-3 mb-4">
                <Lock size={24} className="text-orange-400 mx-auto" />
                <h3 className="font-bold text-gray-900">生成上限に達しました</h3>
                <p className="text-sm text-gray-600">
                  プランをアップグレードすると上限が増えます。
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Crown size={16} />
                  プランを見る
                </a>
              </div>
            )}

            <div className="space-y-4">
              {/* タイトル */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">タイトル *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 人生を変える朝の習慣"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-lg text-gray-900 placeholder:text-gray-400"
                  maxLength={50}
                />
                <p className="text-xs text-gray-400 mt-1">{title.length}/50文字</p>
              </div>

              {/* サブタイトル */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">サブタイトル（任意）</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="例: 成功者が実践する7つのルーティン"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-gray-900 placeholder:text-gray-400"
                  maxLength={50}
                />
              </div>

              {/* 著者名 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">著者名（任意）</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="例: 山田太郎"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-gray-900 placeholder:text-gray-400"
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
                        onClick={() => setSelectedColorThemeId(theme.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          selectedColorThemeId === theme.id
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-200'
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

            {/* 追加指示 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-1">追加指示（任意）</label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="例: 和風テイスト、山のイラスト入り、明るい雰囲気で..."
              />
            </div>

            {/* 生成モード切り替え */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">生成モード</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGenerationMode('ai_text')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    generationMode === 'ai_text'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <FileImage size={18} className={generationMode === 'ai_text' ? 'text-orange-500' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">AI テキスト</p>
                    <p className="text-xs text-gray-500">画像に直接テキスト描画</p>
                  </div>
                </button>
                <button
                  onClick={() => setGenerationMode('editable_text')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    generationMode === 'editable_text'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <Layers size={18} className={generationMode === 'editable_text' ? 'text-orange-500' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">編集可能テキスト</p>
                    <p className="text-xs text-gray-500">生成後に文字を自由編集</p>
                  </div>
                </button>
              </div>
              {generationMode === 'editable_text' && (
                <p className="text-xs text-orange-600 mt-2 bg-orange-50 px-3 py-2 rounded-lg">
                  AIが背景画像のみを生成し、テキストは後から自由に編集（フォント・サイズ・色・位置）できます。
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mt-4">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* 制限エラー */}
            {limitError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4">
                <div className="flex items-start gap-2">
                  <Crown size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">{limitError.message}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      使用回数: {limitError.usedCount} / {limitError.limit}回
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 生成ボタン */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !title.trim() || trialExceeded}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    生成中...（約30秒）
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {generatedImageUrl ? '再生成する' : '表紙を生成する'}
                  </>
                )}
              </button>
            </div>
          </Section>

          {/* Section 4: 詳細設定 */}
          <Section
            title="詳細設定"
            icon={Settings}
            isOpen={openSections.advanced}
            onToggle={() => toggleSection('advanced')}
            step={4}
            stepLabel="画質などのオプション"
          >
            {/* 画像サイズ */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">画像サイズ</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setImageSize('2K')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    imageSize === '2K'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <ImageIcon size={18} className={imageSize === '2K' ? 'text-orange-500' : 'text-gray-400'} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">2K（標準）</p>
                    <p className="text-xs text-gray-500">1600×2560px</p>
                  </div>
                </button>
                <button
                  onClick={() => setImageSize('4K')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    imageSize === '4K'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <Crown size={18} className={imageSize === '4K' ? 'text-orange-500' : 'text-gray-400'} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">4K（高画質）</p>
                    <p className="text-xs text-gray-500">高解像度出力</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 帯（おび） */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Ribbon size={16} className="text-orange-500" />
                  帯（おび）を追加
                </label>
                <button
                  onClick={() => setObiEnabled(!obiEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${obiEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${obiEnabled ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {obiEnabled && (
                <div className="space-y-3">
                  {/* プリセット */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">ワンクリック帯テキスト</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Amazon1位！', '10万部突破！', '話題沸騰！', '限定公開', '期間限定価格', '著者累計100万部', 'ベストセラー', '推薦図書'].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setObiText(preset)}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                            obiText === preset
                              ? 'bg-orange-100 border-orange-300 text-orange-700 font-bold'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* カスタムテキスト */}
                  <div>
                    <input
                      type="text"
                      value={obiText}
                      onChange={(e) => setObiText(e.target.value)}
                      placeholder="帯テキストを入力..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      maxLength={30}
                    />
                  </div>

                  {/* 帯カラー */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">帯カラー</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'red' as const, label: '赤', bg: 'bg-red-600' },
                        { id: 'gold' as const, label: '金', bg: 'bg-amber-500' },
                        { id: 'blue' as const, label: '青', bg: 'bg-blue-700' },
                        { id: 'green' as const, label: '緑', bg: 'bg-emerald-600' },
                      ].map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setObiStyle(color.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all ${
                            obiStyle === color.id
                              ? 'border-orange-400 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${color.bg}`} />
                          <span className="text-xs font-medium text-gray-700">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 画像アップロード */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">背景画像をアップロード（任意）</label>
              <p className="text-xs text-gray-500 mb-3">
                自分の画像を背景に使い、テキストをオーバーレイできます。推奨: 1600×2560px（9:16）
              </p>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all">
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">画像を選択</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !user || !supabase) return;
                    try {
                      const filePath = `kindle-covers/${user.id}/${Date.now()}_upload.${file.name.split('.').pop()}`;
                      const { error: uploadErr } = await supabase.storage
                        .from('thumbnail-images')
                        .upload(filePath, file, { contentType: file.type });
                      if (uploadErr) throw uploadErr;
                      const { data: urlData } = supabase.storage
                        .from('thumbnail-images')
                        .getPublicUrl(filePath);
                      // アップロード画像を背景としてセット（editable_textモードに切り替え）
                      setGenerationMode('editable_text');
                      setBackgroundImageUrl(urlData.publicUrl);
                      setGeneratedImageUrl(null);
                      // テキスト要素を初期化
                      const defaultElements: SVGTextElement[] = [
                        {
                          id: `title-${Date.now()}`,
                          text: title || 'タイトル',
                          x: 50, y: 40,
                          fontSize: 72,
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
                          id: `subtitle-${Date.now() + 1}`,
                          text: subtitle,
                          x: 50, y: 55,
                          fontSize: 36,
                          fontFamily: 'Noto Sans JP',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          strokeColor: '#000000',
                          strokeWidth: 3,
                          textAlign: 'center',
                        });
                      }
                      if (authorName) {
                        defaultElements.push({
                          id: `author-${Date.now() + 2}`,
                          text: authorName,
                          x: 50, y: 88,
                          fontSize: 28,
                          fontFamily: 'Noto Sans JP',
                          fontWeight: 400,
                          color: '#FFFFFF',
                          strokeColor: '#000000',
                          strokeWidth: 2,
                          textAlign: 'center',
                        });
                      }
                      setSvgTextElements(defaultElements);
                      setSelectedTextElementId(defaultElements[0].id);
                      setMobileTab('preview');
                    } catch (err) {
                      setError('画像のアップロードに失敗しました');
                    }
                    // inputをリセット
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                KDP推奨サイズ: 1600×2560px（9:16）<br />
                Gemini 3 Pro Image で高品質な日本語テキスト描画
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
                    style={{ maxWidth: '320px' }}
                  >
                    <SVGTextOverlay
                      ref={svgOverlayRef}
                      backgroundImageUrl={backgroundImageUrl}
                      aspectRatio="9:16"
                      textElements={svgTextElements}
                      onTextElementsChange={setSvgTextElements}
                      selectedElementId={selectedTextElementId}
                      onSelectElement={setSelectedTextElementId}
                    />
                    {/* 帯オーバーレイ */}
                    {obiEnabled && obiText && (
                      <div
                        className="absolute left-0 right-0 bottom-[15%] flex items-center justify-center py-2 pointer-events-none"
                        style={{
                          backgroundColor: obiStyle === 'red' ? '#DC2626' : obiStyle === 'gold' ? '#D97706' : obiStyle === 'blue' ? '#1D4ED8' : '#059669',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        <span className="text-white font-black text-sm tracking-wider px-3 text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                          {obiText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : generatedImageUrl ? (
                /* 通常モード: 生成済み画像 */
                <div className="p-4">
                  <div
                    className="relative mx-auto overflow-hidden rounded-xl bg-gray-100"
                    style={{
                      maxWidth: '320px',
                      aspectRatio: '9/16',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="生成されたKindle表紙"
                      className="w-full h-full object-cover"
                    />
                    {/* 帯オーバーレイ */}
                    {obiEnabled && obiText && (
                      <div
                        className="absolute left-0 right-0 bottom-[15%] flex items-center justify-center py-2"
                        style={{
                          backgroundColor: obiStyle === 'red' ? '#DC2626' : obiStyle === 'gold' ? '#D97706' : obiStyle === 'blue' ? '#1D4ED8' : '#059669',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        <span className="text-white font-black text-sm tracking-wider px-3 text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                          {obiText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* プレースホルダー */
                <div className="p-6">
                  <div
                    className="relative mx-auto overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center"
                    style={{
                      maxWidth: '280px',
                      aspectRatio: '9/16',
                      minHeight: '400px',
                    }}
                  >
                    <ImageIcon size={48} className="text-gray-300 mb-3" />
                    <p className="text-sm font-bold text-gray-400 mb-1">プレビュー</p>
                    <p className="text-xs text-gray-400 text-center px-4">
                      設定を入力してAI生成ボタンを押すと<br />ここに表紙が表示されます
                    </p>

                    {/* 選択済み情報 */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {selectedGenreLabel && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                          {selectedGenreLabel}
                        </span>
                      )}
                      {selectedTemplate && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full font-medium">
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all"
                    >
                      <Download size={16} />
                      ダウンロード
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {isSaving ? '保存中...' : savedSlug ? '更新して保存' : '保存して公開'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setGeneratedImageUrl(null);
                      setBackgroundImageUrl(null);
                      setSvgTextElements([]);
                      setSelectedTextElementId(null);
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

            {/* Amazonプレビュー風 */}
            {hasGeneratedContent && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-500 mb-3">Amazonでの表示イメージ（参考）</p>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div
                    className="w-16 h-24 rounded overflow-hidden bg-gray-200 shrink-0 shadow-sm"
                  >
                    {generatedImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={generatedImageUrl}
                        alt="サムネイルプレビュー"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                        <Layers size={16} className="text-orange-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{title || 'タイトル未入力'}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{subtitle}</p>}
                    {authorName && <p className="text-xs text-blue-600 mt-1">{authorName}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">---</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Kindle版 (電子書籍)</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3Dモックアップ */}
            {hasGeneratedContent && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-500 mb-4">3Dモックアップ（SNS共有・LP用）</p>
                <div className="flex justify-center" style={{ perspective: '800px' }}>
                  <div
                    className="relative"
                    style={{
                      width: '160px',
                      height: '240px',
                      transformStyle: 'preserve-3d',
                      transform: 'rotateY(-25deg) rotateX(5deg)',
                    }}
                  >
                    {/* 表紙（前面） */}
                    <div
                      className="absolute inset-0 rounded-sm overflow-hidden"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: 'translateZ(8px)',
                        boxShadow: '4px 4px 20px rgba(0,0,0,0.3), 0 0 1px rgba(0,0,0,0.1)',
                      }}
                    >
                      {generatedImageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={generatedImageUrl}
                          alt="3Dモックアップ"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center">
                          <ImageIcon size={32} className="text-orange-300" />
                        </div>
                      )}
                      {/* 帯オーバーレイ（3D） */}
                      {obiEnabled && obiText && (
                        <div
                          className="absolute left-0 right-0 bottom-[15%] flex items-center justify-center py-1"
                          style={{
                            backgroundColor: obiStyle === 'red' ? '#DC2626' : obiStyle === 'gold' ? '#D97706' : obiStyle === 'blue' ? '#1D4ED8' : '#059669',
                          }}
                        >
                          <span className="text-white font-black text-[8px] tracking-wider px-1 text-center">
                            {obiText}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* 背表紙（側面） */}
                    <div
                      className="absolute top-0 h-full"
                      style={{
                        width: '16px',
                        left: '-8px',
                        background: 'linear-gradient(90deg, #d4d4d8, #e4e4e7, #d4d4d8)',
                        transform: 'rotateY(-90deg) translateZ(8px)',
                        transformOrigin: 'right center',
                      }}
                    />
                    {/* 底面の影 */}
                    <div
                      className="absolute -bottom-4 left-2 right-0"
                      style={{
                        height: '20px',
                        background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
                        transform: 'rotateX(90deg)',
                        transformOrigin: 'top center',
                      }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-4">
                  ※ イメージです。実際の書籍の見た目とは異なります
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 生成中のフルスクリーンローダー */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                <Sparkles size={24} className="text-white animate-pulse" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">AIが表紙をデザイン中...</h3>
            <p className="text-gray-500 text-sm mt-2">少々お待ちください（通常20-30秒）</p>
          </div>
        </div>
      )}

      {/* 作成完了モーダル */}
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Kindle表紙"
        publicUrl={completedUrl}
        contentTitle={title ? `「${title}」の表紙を作成しました！` : undefined}
        theme="amber"
        showQrCode={false}
      />
      <CreationLimitModal {...limitModalProps} />
    </div>
  );
}
