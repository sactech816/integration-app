'use client';

import React from 'react';
import { SalesLetter } from '@/lib/types';
import ContentFooter from '@/components/shared/ContentFooter';
import BlockRenderer from '@/components/shared/BlockRenderer';

// 影のマッピング
const shadowMap: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// 角丸のマッピング
const radiusMap: Record<string, string> = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
};

interface SalesLetterViewerProps {
  salesLetter: SalesLetter;
}

export default function SalesLetterViewer({ salesLetter }: SalesLetterViewerProps) {
  const settings = salesLetter.settings;
  const bg = settings?.pageBackground;

  // 背景スタイル
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!bg || bg.type === 'none') return { backgroundColor: '#ffffff' };

    if (bg.type === 'image') {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }

    if (bg.type === 'gradient') {
      return {
        backgroundImage: bg.value,
        backgroundSize: bg.animated ? '400% 400%' : 'auto',
      };
    }

    return { backgroundColor: bg.value };
  };

  // コンテンツラッパーのスタイル
  const getContentWrapperStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      maxWidth: `${settings?.contentWidth || 800}${settings?.contentWidthUnit || 'px'}`,
    };

    // 枠線設定
    if (settings?.contentBorder?.enabled) {
      style.border = `${settings.contentBorder.width}px solid ${settings.contentBorder.color}`;
    }

    // 影設定
    if (settings?.contentShadow && settings.contentShadow !== 'none') {
      style.boxShadow = shadowMap[settings.contentShadow];
    }

    // 角丸設定
    if (settings?.contentBorderRadius && settings.contentBorderRadius !== 'none') {
      style.borderRadius = radiusMap[settings.contentBorderRadius];
      style.overflow = 'hidden'; // 角丸でコンテンツがはみ出ないように
    }

    // 枠線・影・角丸がある場合は背景色を追加
    if (settings?.contentBorder?.enabled || settings?.contentShadow !== 'none' || settings?.contentBorderRadius !== 'none') {
      style.backgroundColor = '#ffffff';
      style.padding = '2rem 1rem';
    }

    return style;
  };

  // 枠線・影・角丸の設定があるかどうか
  const hasContainerStyles = settings?.contentBorder?.enabled || 
    (settings?.contentShadow && settings.contentShadow !== 'none') || 
    (settings?.contentBorderRadius && settings.contentBorderRadius !== 'none');

  return (
    <>
      <div
        className={`min-h-screen py-8 px-4 ${bg?.animated ? 'animate-gradient-xy' : ''}`}
        style={getBackgroundStyle()}
      >
        <div
          className="mx-auto"
          style={getContentWrapperStyle()}
        >
          {/* 枠線・影がある場合は内部パディングを調整 */}
          <div className={hasContainerStyles ? '' : ''}>
            {salesLetter.content?.map(block => (
              <BlockRenderer
                key={block.id}
                block={block}
                variant="salesletter"
              />
            ))}

            {/* フッター */}
            <ContentFooter 
              toolType="salesletter" 
              variant="transparent" 
              hideFooter={settings?.hideFooter} 
            />
          </div>
        </div>
      </div>

      {/* アニメーションスタイル */}
      <style jsx global>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
      `}</style>
    </>
  );
}
