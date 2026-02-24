'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Briefcase,
  Heart,
  BookOpen,
  Feather,
  GraduationCap,
  Palette,
  Sparkles,
  AlertCircle,
  Crown,
} from 'lucide-react';
import {
  kindleCoverTemplates,
  getKindleCoverTemplatesByGenre,
  KINDLE_COVER_GENRES,
  type KindleCoverTemplate,
  type KindleCoverGenre,
} from '@/constants/templates/kindle-cover';

const GENRE_ICONS: Record<KindleCoverGenre, React.ReactNode> = {
  business: <Briefcase size={16} />,
  self_help: <Heart size={16} />,
  how_to: <BookOpen size={16} />,
  novel: <Feather size={16} />,
  education: <GraduationCap size={16} />,
};

interface KindleCoverGeneratorProps {
  bookId: string;
  bookTitle: string;
  bookSubtitle?: string | null;
  userId: string;
  onClose: () => void;
  onCoverGenerated?: (imageUrl: string) => void;
}

export default function KindleCoverGenerator({
  bookId,
  bookTitle,
  bookSubtitle,
  userId,
  onClose,
  onCoverGenerated,
}: KindleCoverGeneratorProps) {
  // フォーム状態
  const [title, setTitle] = useState(bookTitle);
  const [subtitle, setSubtitle] = useState(bookSubtitle || '');
  const [authorName, setAuthorName] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'2K' | '4K'>('2K');

  // テンプレート選択状態
  const [selectedGenre, setSelectedGenre] = useState<KindleCoverGenre>('business');
  const [selectedTemplate, setSelectedTemplate] = useState<KindleCoverTemplate | null>(null);
  const [selectedColorThemeId, setSelectedColorThemeId] = useState<string>('');

  // 生成状態
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<{ message: string; usedCount: number; limit: number } | null>(null);

  // ジャンル変更時にテンプレートリセット
  useEffect(() => {
    const templates = getKindleCoverTemplatesByGenre(selectedGenre);
    if (templates.length > 0) {
      setSelectedTemplate(templates[0]);
      setSelectedColorThemeId(templates[0].colorThemes[0]?.id || '');
    }
  }, [selectedGenre]);

  // 初期テンプレート設定
  useEffect(() => {
    const templates = getKindleCoverTemplatesByGenre('business');
    if (templates.length > 0) {
      setSelectedTemplate(templates[0]);
      setSelectedColorThemeId(templates[0].colorThemes[0]?.id || '');
    }
  }, []);

  const handleGenerate = async () => {
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
          userId,
          bookId,
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
          return;
        }
        throw new Error(data.error || data.message || '生成に失敗しました');
      }

      setGeneratedImageUrl(data.imageUrl);
      onCoverGenerated?.(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kindle-cover-${bookId}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('ダウンロードに失敗しました');
    }
  };

  const genreTemplates = getKindleCoverTemplatesByGenre(selectedGenre);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ImageIcon size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">Kindle 表紙作成</h2>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Gemini 3 Pro Image
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex">
          {/* Left: 設定パネル */}
          <div className="w-1/2 border-r border-gray-200 p-6 space-y-5 overflow-y-auto">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="書籍のタイトル"
              />
            </div>

            {/* サブタイトル */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">サブタイトル</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="サブタイトル（任意）"
              />
            </div>

            {/* 著者名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">著者名</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="著者名（任意）"
              />
            </div>

            {/* ジャンル選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ジャンル</label>
              <div className="flex flex-wrap gap-2">
                {KINDLE_COVER_GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selectedGenre === genre.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {GENRE_ICONS[genre.id]}
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* テンプレート選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">テンプレート</label>
              <div className="space-y-2">
                {genreTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setSelectedColorThemeId(tmpl.colorThemes[0]?.id || '');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition ${
                      selectedTemplate?.id === tmpl.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800">{tmpl.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tmpl.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* カラーテーマ */}
            {selectedTemplate && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Palette size={14} className="inline mr-1" />
                  カラーテーマ
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.colorThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedColorThemeId(theme.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                        selectedColorThemeId === theme.id
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 画像サイズ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">画像サイズ</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImageSize('2K')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    imageSize === '2K'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  2K（標準）
                </button>
                <button
                  onClick={() => setImageSize('4K')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    imageSize === '4K'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Crown size={14} />
                  4K（高画質）
                </button>
              </div>
            </div>

            {/* 追加指示 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                追加指示（任意）
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none resize-none"
                placeholder="例: 和風テイスト、山のイラスト入り、明るい雰囲気で..."
              />
            </div>

            {/* 生成ボタン */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !title.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  表紙を生成中...（約30秒）
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {generatedImageUrl ? '再生成する' : '表紙を生成する'}
                </>
              )}
            </button>
          </div>

          {/* Right: プレビュー */}
          <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-gray-50">
            {/* エラー表示 */}
            {error && (
              <div className="w-full mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 制限エラー表示 */}
            {limitError && (
              <div className="w-full mb-4 px-4 py-4 bg-amber-50 border border-amber-200 rounded-lg">
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

            {/* 生成中 */}
            {isGenerating && (
              <div className="flex flex-col items-center gap-4 text-gray-500">
                <div className="w-48 h-72 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
                <p className="text-sm">AIが表紙をデザインしています...</p>
              </div>
            )}

            {/* 生成結果 */}
            {!isGenerating && generatedImageUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img
                    src={generatedImageUrl}
                    alt="生成された表紙"
                    className="max-h-[60vh] rounded-lg shadow-xl border border-gray-200"
                    style={{ aspectRatio: '9/16', objectFit: 'cover' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <Download size={14} />
                    ダウンロード
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    <RefreshCw size={14} />
                    再生成
                  </button>
                </div>
              </div>
            )}

            {/* 未生成 */}
            {!isGenerating && !generatedImageUrl && !error && !limitError && (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-48 h-72 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                  <ImageIcon size={32} className="text-gray-300" />
                  <p className="text-xs text-gray-400 text-center px-4">
                    左のパネルで設定して<br />「表紙を生成する」を押してください
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    KDP推奨サイズ: 1600×2560px（9:16）
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Gemini 3 Pro Image で高品質な日本語テキスト描画
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
