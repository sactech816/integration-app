'use client';

import React from 'react';
import { SalesLetter } from '@/lib/types';
import ContentFooter from '@/components/shared/ContentFooter';
import BlockRenderer from '@/components/shared/BlockRenderer';

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

  return (
    <>
      <div
        className={`min-h-screen py-8 px-4 ${bg?.animated ? 'animate-gradient-xy' : ''}`}
        style={getBackgroundStyle()}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: `${settings?.contentWidth || 800}${settings?.contentWidthUnit || 'px'}`,
          }}
        >
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
