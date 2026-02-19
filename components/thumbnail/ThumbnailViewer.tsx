'use client';

import React from 'react';
import { Download, Share2, ArrowLeft, Eye } from 'lucide-react';
import { Thumbnail } from '@/lib/types';

interface ThumbnailViewerProps {
  thumbnail: Thumbnail;
}

export default function ThumbnailViewer({ thumbnail }: ThumbnailViewerProps) {
  const handleDownload = async () => {
    if (!thumbnail.image_url) return;
    try {
      const response = await fetch(thumbnail.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${thumbnail.title || 'thumbnail'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('ダウンロードに失敗しました');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: thumbnail.title, url });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      alert('URLをコピーしました');
    }
  };

  const aspectRatio = thumbnail.aspect_ratio || '16:9';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ArrowLeft size={16} />
            戻る
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Eye size={14} />
            {thumbnail.views_count || 0} views
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* タイトル */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{thumbnail.title}</h1>
            {thumbnail.description && (
              <p className="text-gray-500 mt-1">{thumbnail.description}</p>
            )}
          </div>

          {/* 画像 */}
          {thumbnail.image_url && (
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div
                className="relative mx-auto overflow-hidden rounded-xl bg-gray-100"
                style={{
                  maxWidth: aspectRatio === '9:16' ? '320px' : '100%',
                  aspectRatio: aspectRatio.replace(':', '/'),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnail.image_url}
                  alt={thumbnail.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Download size={18} />
              ダウンロード
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-pink-300 transition-all"
            >
              <Share2 size={18} />
              シェア
            </button>
          </div>

          {/* メタ情報 */}
          <div className="text-center text-sm text-gray-400 space-y-1">
            <p>プラットフォーム: {thumbnail.platform} | アスペクト比: {aspectRatio}</p>
            <p>
              <a
                href="/thumbnail/editor"
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                サムネイルメーカーで自分も作成する →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
