'use client';

import React, { useState, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Thumbnail, ThumbnailPlatform } from '@/lib/types';
import {
  PLATFORM_CATEGORIES,
  STYLE_CATEGORIES,
  getTemplatesByPlatform,
  ThumbnailTemplate,
  ThumbnailStyleCategory,
} from '@/constants/templates/thumbnail';
import {
  Youtube, Instagram, Twitter, MessageCircle, Image as ImageIcon,
  ArrowLeft, ArrowRight, Sparkles, Download, Save, Loader2,
  RefreshCw, Check, ChevronRight, Crown, Lock, Type,
} from 'lucide-react';
import AIEditChat from './AIEditChat';

interface ThumbnailEditorProps {
  user: { id: string; email?: string } | null;
  editingThumbnail?: Thumbnail | null;
  setShowAuth: (show: boolean) => void;
  isPro?: boolean;
}

const platformIcons: Record<string, React.ElementType> = {
  Youtube, Instagram, Twitter, MessageCircle, Image: ImageIcon,
};

export default function ThumbnailEditor({ user, editingThumbnail, setShowAuth, isPro = false }: ThumbnailEditorProps) {
  // ステップ管理
  const [step, setStep] = useState(editingThumbnail ? 4 : 1);

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

  // Step 4: 生成結果
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(editingThumbnail?.image_url || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trialExceeded, setTrialExceeded] = useState(false);

  // 保存
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(editingThumbnail?.slug || null);

  // プラットフォーム別のテンプレートを取得
  const platformTemplates = getTemplatesByPlatform(selectedPlatform);
  const filteredTemplates = selectedStyle
    ? platformTemplates.filter(t => t.styleCategory === selectedStyle)
    : platformTemplates;

  // アスペクト比
  const currentAspectRatio = selectedTemplate?.aspectRatio ||
    PLATFORM_CATEGORIES.find(p => p.id === selectedPlatform)?.aspectRatio || '16:9';

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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedImageUrl(data.imageUrl);
        setStep(4);
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
  }, [title, subtitle, selectedTemplate, selectedColorTheme, selectedPlatform, currentAspectRatio, user, setShowAuth]);

  // 保存
  const handleSave = async () => {
    if (!supabase) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!generatedImageUrl) return;

    setIsSaving(true);
    try {
      const slug = savedSlug || generateSlug();
      const thumbnailData = {
        slug,
        title: title || '新規サムネイル',
        image_url: generatedImageUrl,
        platform: selectedPlatform,
        aspect_ratio: currentAspectRatio,
        template_id: selectedTemplate?.id || null,
        text_overlay: { title, subtitle, colorTheme: selectedColorTheme },
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
      alert('保存しました！');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '不明なエラー';
      alert('保存に失敗しました: ' + msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ダウンロード
  const handleDownload = async () => {
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

  // AI編集後の画像URL更新
  const handleImageEdited = (newImageUrl: string) => {
    setGeneratedImageUrl(newImageUrl);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                  : s < step
                    ? 'bg-pink-100 text-pink-600 cursor-pointer hover:bg-pink-200'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {s < step ? <Check size={14} /> : s}
            </button>
            {s < 4 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: プラットフォーム選択 */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">プラットフォームを選択</h2>
            <p className="text-gray-500 mt-1">サムネイルを使用するSNSを選んでください</p>
          </div>

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
                    setStep(2);
                  }}
                  className={`p-4 sm:p-6 rounded-2xl border-2 transition-all text-center hover:shadow-md ${
                    selectedPlatform === platform.id
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-pink-200'
                  }`}
                >
                  <Icon size={32} className="mx-auto mb-2 text-pink-500" />
                  <p className="font-bold text-gray-900 text-sm">{platform.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{platform.aspectRatio}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: テンプレート選択 */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">スタイルを選択</h2>
            <p className="text-gray-500 mt-1">サムネイルのデザインスタイルを選んでください</p>
          </div>

          {/* スタイルフィルター */}
          <div className="flex flex-wrap gap-2 justify-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setSelectedColorTheme(template.colorThemes[0]?.id || '');
                  setStep(3);
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
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
            <p className="text-center text-gray-400 py-8">
              このプラットフォーム×スタイルのテンプレートはまだありません
            </p>
          )}

          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mx-auto">
            <ArrowLeft size={16} /> プラットフォーム選択に戻る
          </button>
        </div>
      )}

      {/* Step 3: テキスト入力 + カラーテーマ */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">テキストを入力</h2>
            <p className="text-gray-500 mt-1">サムネイルに表示するテキストを入力してください</p>
          </div>

          {/* Pro/トライアルバナー */}
          {!isPro && !trialExceeded && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <Crown size={18} className="text-amber-500 shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-amber-700">無料トライアル</span>
                <span className="text-amber-600 ml-1">- 1回だけ無料でお試しできます（Pro機能）</span>
              </div>
            </div>
          )}

          {/* トライアル超過メッセージ */}
          {trialExceeded && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-5 text-center space-y-3">
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

          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
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

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> テンプレート選択に戻る
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !title.trim() || trialExceeded}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      )}

      {/* Step 4: プレビュー + AI編集 + 保存 */}
      {step === 4 && generatedImageUrl && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">サムネイル完成</h2>
            <p className="text-gray-500 mt-1">AI編集で修正したり、ダウンロードできます</p>
          </div>

          {/* プレビュー */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
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

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-pink-300 hover:bg-pink-50 transition-all"
            >
              <Download size={18} />
              ダウンロード
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? '保存中...' : '保存する'}
            </button>

            <button
              onClick={() => {
                setGeneratedImageUrl(null);
                setStep(3);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-pink-300 hover:bg-pink-50 transition-all"
            >
              <RefreshCw size={18} />
              作り直す
            </button>
          </div>

          {/* テキスト変更セクション */}
          <TextChangeSection
            imageUrl={generatedImageUrl}
            aspectRatio={currentAspectRatio}
            userId={user?.id}
            isPro={isPro}
            onImageEdited={handleImageEdited}
          />

          {/* AI編集チャット */}
          <AIEditChat
            imageUrl={generatedImageUrl}
            aspectRatio={currentAspectRatio}
            userId={user?.id}
            onImageEdited={handleImageEdited}
            isPro={isPro}
          />

          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mx-auto text-sm">
            <ArrowLeft size={14} /> 最初からやり直す
          </button>
        </div>
      )}

      {/* 生成中のフルスクリーンローダー */}
      {isGenerating && step === 3 && (
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
    </div>
  );
}

// テキスト変更セクション（Step 4内）
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
        <ChevronRight
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
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
