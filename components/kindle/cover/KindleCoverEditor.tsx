'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

      setGeneratedImageUrl(data.imageUrl);
      onCoverGenerated?.(data.imageUrl);
      // モバイルではプレビュータブに自動切り替え
      setMobileTab('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  }, [title, subtitle, authorName, selectedTemplate, selectedColorThemeId, additionalPrompt, imageSize, user, setShowAuth, bookId, onCoverGenerated]);

  // ダウンロード
  const handleDownload = async () => {
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

  // 保存
  const handleSave = async () => {
    if (!supabase) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!generatedImageUrl) return;

    await consumeAndExecute('kindle_cover', 'save', async () => {
      setIsSaving(true);
      try {
        const slug = savedSlug || generateSlug();
        const coverData = {
          slug,
          title: title || '新規Kindle表紙',
          image_url: generatedImageUrl,
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
            .from('kindle_covers')
            .update(coverData)
            .eq('slug', savedSlug)
            .eq('user_id', user.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('kindle_covers')
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
              {generatedImageUrl ? (
                /* 生成済み画像 */
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
              {generatedImageUrl && (
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

            {/* Amazonプレビュー風 */}
            {generatedImageUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-500 mb-3">Amazonでの表示イメージ（参考）</p>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div
                    className="w-16 h-24 rounded overflow-hidden bg-gray-200 shrink-0 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="サムネイルプレビュー"
                      className="w-full h-full object-cover"
                    />
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
