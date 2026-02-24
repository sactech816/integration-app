'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Globe, GlobeLock, RefreshCw, Copy, Check,
  Loader2, Edit3, X, Palette,
} from 'lucide-react';
import BookLPDisplay, { LP_THEMES, type ThemeKey, type BookLPData, type SectionVisibility } from './BookLPDisplay';
import BookLPSectionEditor from './BookLPSectionEditor';

// セクション定義
const SECTIONS = [
  { key: 'hero', label: 'Hero（メインビジュアル）', alwaysVisible: true },
  { key: 'pain_points', label: 'お悩み・課題' },
  { key: 'author_profile', label: '著者プロフィール' },
  { key: 'benefits', label: 'メリット・得られること' },
  { key: 'key_takeaways', label: 'キーテイクアウェイ' },
  { key: 'target_readers', label: 'ターゲット読者' },
  { key: 'transformation', label: 'Before / After' },
  { key: 'chapter_summaries', label: '目次・章の概要' },
  { key: 'social_proof', label: '読者レビュー' },
  { key: 'bonus', label: '特典・ボーナス' },
  { key: 'faq', label: 'よくある質問' },
  { key: 'closing_message', label: '著者メッセージ' },
  { key: 'cta', label: 'CTA（行動喚起）', alwaysVisible: true },
] as const;

interface BookLPPreviewProps {
  bookId: string;
  bookTitle: string;
  bookSubtitle?: string;
  lpData: BookLPData | null;
  lpStatus: 'draft' | 'published';
  isGenerating: boolean;
  themeColor?: ThemeKey;
  sectionVisibility?: SectionVisibility;
  coverImageUrl?: string;
  onGenerate: () => void;
  onPublishToggle: () => void;
  onUpdateField: (updates: Record<string, any>) => void;
  onClose: () => void;
}

export default function BookLPPreview({
  bookId,
  bookTitle,
  bookSubtitle,
  lpData,
  lpStatus,
  isGenerating,
  themeColor: initialTheme = 'orange',
  sectionVisibility: initialVisibility = {},
  coverImageUrl,
  onGenerate,
  onPublishToggle,
  onUpdateField,
  onClose,
}: BookLPPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState<ThemeKey>(initialTheme);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(initialVisibility);
  const [localLpData, setLocalLpData] = useState<BookLPData | null>(lpData);

  useEffect(() => {
    setLocalLpData(lpData);
  }, [lpData]);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/kindle/book-lp/${bookId}`
    : `/kindle/book-lp/${bookId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeChange = (newTheme: ThemeKey) => {
    setThemeColor(newTheme);
    onUpdateField({ theme_color: newTheme });
  };

  const handleToggleVisibility = (sectionKey: string) => {
    const updated = { ...sectionVisibility, [sectionKey]: sectionVisibility[sectionKey] === false ? true : false };
    // hero と cta は常に表示
    if (sectionKey === 'hero' || sectionKey === 'cta') return;
    setSectionVisibility(updated);
    onUpdateField({ section_visibility: updated });
  };

  const handleSectionEdit = (sectionKey: string, data: any) => {
    // ローカルデータを即時更新
    if (localLpData) {
      setLocalLpData({ ...localLpData, [sectionKey]: data });
    }
    // APIに保存
    onUpdateField({ [sectionKey]: data });
    setEditingSection(null);
  };

  const getSectionData = (key: string) => {
    if (!localLpData) return null;
    return (localLpData as any)[key];
  };

  const hasSectionData = (key: string): boolean => {
    const data = getSectionData(key);
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return !!data;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl mx-4">

        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">LP エディター</h2>
            {localLpData && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                lpStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {lpStatus === 'published' ? '公開中' : '下書き'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {isGenerating ? '生成中...' : localLpData ? '再生成' : 'LP生成'}
            </button>

            {localLpData && (
              <>
                <button
                  onClick={onPublishToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    lpStatus === 'published'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {lpStatus === 'published' ? (
                    <><GlobeLock size={14} /> 非公開にする</>
                  ) : (
                    <><Globe size={14} /> 公開する</>
                  )}
                </button>

                {lpStatus === 'published' && (
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'コピー済み' : 'URLコピー'}
                  </button>
                )}
              </>
            )}

            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="flex-1 flex overflow-hidden">

          {/* ===== Left Panel: Controls ===== */}
          {localLpData && (
            <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-gray-50">
              {/* Theme Picker */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={14} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase">テーマカラー</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(LP_THEMES) as ThemeKey[]).map((key) => {
                    const colors: Record<string, string> = {
                      orange: 'bg-gradient-to-br from-orange-400 to-amber-400',
                      navy: 'bg-gradient-to-br from-blue-600 to-indigo-600',
                      purple: 'bg-gradient-to-br from-purple-500 to-fuchsia-500',
                      green: 'bg-gradient-to-br from-emerald-500 to-teal-500',
                      red: 'bg-gradient-to-br from-red-500 to-rose-500',
                    };
                    return (
                      <button
                        key={key}
                        onClick={() => handleThemeChange(key)}
                        className={`w-8 h-8 rounded-full ${colors[key]} transition-all ${
                          themeColor === key
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                        title={LP_THEMES[key].name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Section List */}
              <div className="p-4">
                <span className="text-xs font-bold text-gray-700 uppercase mb-3 block">セクション管理</span>
                <div className="space-y-1">
                  {SECTIONS.map((section) => {
                    const isActive = sectionVisibility[section.key] !== false;
                    const hasData = hasSectionData(section.key);
                    return (
                      <div
                        key={section.key}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition ${
                          editingSection === section.key ? 'bg-orange-100 border border-orange-200' : 'hover:bg-gray-100'
                        }`}
                      >
                        {/* Visibility toggle */}
                        {'alwaysVisible' in section && section.alwaysVisible ? (
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <Eye size={12} className="text-gray-300" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleVisibility(section.key)}
                            className={`w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition ${
                              isActive ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'
                            }`}
                          >
                            {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                          </button>
                        )}

                        {/* Label */}
                        <span className={`flex-1 truncate ${!isActive ? 'text-gray-400 line-through' : hasData ? 'text-gray-700' : 'text-gray-400'}`}>
                          {section.label}
                        </span>

                        {/* Edit button */}
                        <button
                          onClick={() => setEditingSection(editingSection === section.key ? null : section.key)}
                          className={`p-1 rounded transition flex-shrink-0 ${
                            editingSection === section.key
                              ? 'text-orange-600 bg-orange-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== Right Panel: Preview or Editor ===== */}
          <div className="flex-1 overflow-y-auto">
            {isGenerating && !localLpData ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 size={48} className="animate-spin text-orange-400" />
                <p className="text-gray-600 font-medium">LP を生成しています...</p>
                <p className="text-gray-400 text-sm">書籍の内容を分析し、最適なLPを作成中です</p>
              </div>
            ) : localLpData ? (
              editingSection ? (
                <BookLPSectionEditor
                  sectionKey={editingSection}
                  sectionLabel={SECTIONS.find(s => s.key === editingSection)?.label || editingSection}
                  sectionData={getSectionData(editingSection)}
                  onSave={handleSectionEdit}
                  onCancel={() => setEditingSection(null)}
                />
              ) : (
                <div className="transform scale-[0.8] origin-top">
                  <BookLPDisplay
                    lpData={localLpData}
                    bookTitle={bookTitle}
                    bookSubtitle={bookSubtitle}
                    themeColor={themeColor}
                    sectionVisibility={sectionVisibility}
                    coverImageUrl={coverImageUrl}
                  />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
                  <Eye size={32} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">LPがまだ生成されていません</h3>
                <p className="text-gray-500 text-sm max-w-md text-center">
                  「LP生成」ボタンをクリックすると、書籍の内容を元にセールス力のあるLPが自動生成されます。
                </p>
                <button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="mt-2 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition"
                >
                  <RefreshCw size={18} />
                  LP を生成する
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
