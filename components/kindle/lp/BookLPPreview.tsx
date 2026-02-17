'use client';

import React, { useState } from 'react';
import { Eye, Globe, GlobeLock, RefreshCw, Copy, Check, ExternalLink, Loader2, Edit3, X, Save } from 'lucide-react';
import BookLPDisplay from './BookLPDisplay';

interface BookLPData {
  hero: { catchcopy: string; subtitle: string; description: string };
  pain_points: Array<{ title: string; description: string }>;
  benefits: Array<{ title: string; description: string }>;
  chapter_summaries: Array<{ chapter_title: string; summary: string }>;
  faq: Array<{ question: string; answer: string }>;
  cta: { amazon_link: string; line_link: string; cta_text: string };
}

interface BookLPPreviewProps {
  bookId: string;
  bookTitle: string;
  bookSubtitle?: string;
  lpData: BookLPData | null;
  lpStatus: 'draft' | 'published';
  isGenerating: boolean;
  onGenerate: () => void;
  onPublishToggle: () => void;
  onUpdateField: (updates: Partial<BookLPData>) => void;
  onClose: () => void;
}

export default function BookLPPreview({
  bookId,
  bookTitle,
  bookSubtitle,
  lpData,
  lpStatus,
  isGenerating,
  onGenerate,
  onPublishToggle,
  onUpdateField,
  onClose,
}: BookLPPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [editingCta, setEditingCta] = useState(false);
  const [amazonLink, setAmazonLink] = useState(lpData?.cta?.amazon_link || '');
  const [lineLink, setLineLink] = useState(lpData?.cta?.line_link || '');

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/kindle/book-lp/${bookId}`
    : `/kindle/book-lp/${bookId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCta = () => {
    if (!lpData) return;
    onUpdateField({
      cta: { ...lpData.cta, amazon_link: amazonLink, line_link: lineLink },
    });
    setEditingCta(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">LP プレビュー</h2>
            {lpData && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  lpStatus === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {lpStatus === 'published' ? '公開中' : '下書き'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* 再生成 */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isGenerating ? '生成中...' : lpData ? '再生成' : 'LP生成'}
            </button>

            {lpData && (
              <>
                {/* 公開/非公開切替 */}
                <button
                  onClick={onPublishToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    lpStatus === 'published'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {lpStatus === 'published' ? (
                    <>
                      <GlobeLock size={14} />
                      非公開にする
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      公開する
                    </>
                  )}
                </button>

                {/* URLコピー */}
                {lpStatus === 'published' && (
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'コピー済み' : 'URLコピー'}
                  </button>
                )}

                {/* リンク編集 */}
                <button
                  onClick={() => setEditingCta(!editingCta)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                >
                  <Edit3 size={14} />
                  リンク設定
                </button>
              </>
            )}

            {/* 閉じる */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* CTA Link Editor */}
        {editingCta && lpData && (
          <div className="px-6 py-3 bg-purple-50 border-b border-purple-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[250px]">
              <label className="text-xs font-medium text-purple-700 whitespace-nowrap">Amazon URL:</label>
              <input
                type="url"
                value={amazonLink}
                onChange={(e) => setAmazonLink(e.target.value)}
                placeholder="https://www.amazon.co.jp/dp/..."
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[250px]">
              <label className="text-xs font-medium text-purple-700 whitespace-nowrap">LINE URL:</label>
              <input
                type="url"
                value={lineLink}
                onChange={(e) => setLineLink(e.target.value)}
                placeholder="https://line.me/..."
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <button
              onClick={handleSaveCta}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              <Save size={14} />
              保存
            </button>
          </div>
        )}

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto">
          {isGenerating && !lpData ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <Loader2 size={48} className="animate-spin text-orange-400" />
              <p className="text-gray-600 font-medium">LP を生成しています...</p>
              <p className="text-gray-400 text-sm">書籍の内容を分析し、最適なLPを作成中です</p>
            </div>
          ) : lpData ? (
            <div className="transform scale-[0.85] origin-top">
              <BookLPDisplay
                lpData={lpData}
                bookTitle={bookTitle}
                bookSubtitle={bookSubtitle}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
                <Eye size={32} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">LPがまだ生成されていません</h3>
              <p className="text-gray-500 text-sm max-w-md text-center">
                「LP生成」ボタンをクリックすると、書籍の内容を元にプロモーション用LPが自動生成されます。
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
  );
}
