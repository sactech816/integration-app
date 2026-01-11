'use client';

import React, { useEffect, useState } from 'react';
import { Block } from '@/lib/types';
import { BlockRenderer } from '@/components/shared/BlockRenderer';

interface PreviewData {
  title: string;
  description: string;
  content: Block[];
  settings?: {
    theme?: {
      gradient?: string;
      backgroundImage?: string;
    };
  };
}

// 全幅表示対象ブロックの判定
const isFullWidthBlock = (block: Block): boolean => {
  if (block.type === 'hero_fullwidth') return true;
  if (block.type === 'hero' && block.data.isFullWidth) return true;
  if (block.type === 'features' && block.data.isFullWidth) return true;
  if (block.type === 'cta_section' && block.data.isFullWidth) return true;
  if (block.type === 'testimonial' && block.data.isFullWidth) return true;
  if (block.type === 'dark_section' && block.data.isFullWidth) return true;
  if (block.type === 'problem_cards' && block.data.isFullWidth) return true;
  if (block.type === 'bonus_section' && block.data.isFullWidth) return true;
  if (block.type === 'checklist_section' && block.data.isFullWidth) return true;
  return false;
};

export default function BusinessPreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    // 親ウィンドウからメッセージを受信
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_DATA') {
        setPreviewData(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    // 親ウィンドウにready通知を送信
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-sm">プレビューを読み込み中...</div>
      </div>
    );
  }

  const theme = previewData.settings?.theme;
  const backgroundImage = theme?.backgroundImage;
  const gradient = theme?.gradient || 'linear-gradient(-45deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24)';

  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {
        backgroundImage: gradient,
        backgroundSize: '400% 400%',
      };

  return (
    <div 
      className={`min-h-screen ${!backgroundImage ? 'animate-gradient-xy' : ''}`}
      style={backgroundStyle}
    >
      {previewData.content?.map(block => {
        const fullWidth = isFullWidthBlock(block);
        return (
          <div 
            key={block.id}
            className={fullWidth ? 'w-full' : 'max-w-4xl mx-auto px-4 py-2'}
          >
            <BlockRenderer block={block} variant="business" />
          </div>
        );
      })}
      <div className="text-center py-8">
        <span className="text-white/60 text-xs">
          Powered by コンテンツメーカー
        </span>
      </div>
    </div>
  );
}





























































































