'use client';

import React from 'react';
import { BusinessLP } from '@/lib/types';
import { ViewTracker, trackClick } from '@/components/shared/ViewTracker';
import TrackingScripts from '@/components/shared/TrackingScripts';
import BlockRenderer from '@/components/shared/BlockRenderer';

interface BusinessViewerProps {
  lp: BusinessLP;
}

const BusinessViewer: React.FC<BusinessViewerProps> = ({ lp }) => {
  // リンククリックハンドラー（slugを使用してアナリティクスと統一）
  const handleLinkClick = (url: string) => {
    if (lp.slug) {
      trackClick(lp.slug, 'business', url);
    }
  };

  // テーマ設定から背景スタイルを生成
  const theme = lp.settings?.theme;
  const backgroundImage = theme?.backgroundImage;
  const gradient = theme?.gradient;
  
  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : gradient
    ? {
        background: gradient,
        backgroundSize: '400% 400%',
      }
    : {};

  // グラデーションアニメーションのクラス
  const animationClass = gradient && !backgroundImage ? 'animate-gradient-xy' : '';

  return (
    <>
      {/* アナリティクストラッカー（slugを使用）*/}
      {lp.slug && (
        <ViewTracker 
          contentId={lp.slug} 
          contentType="business"
          trackScroll={true}
          trackTime={true}
        />
      )}
      
      {/* 外部計測タグ */}
      <TrackingScripts settings={lp.settings?.tracking} />

      <div 
        className={`min-h-screen ${!backgroundImage && !gradient ? 'bg-gray-50' : ''} ${animationClass}`}
        style={backgroundStyle}
      >
        {lp.content?.map(block => (
          <BlockRenderer 
            key={block.id}
            block={block} 
            variant="business" 
            onLinkClick={handleLinkClick}
          />
        ))}

        {/* フッター */}
        <footer className="py-8 bg-gray-900 text-center">
          <a 
            href="https://www.makers.tokyo/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 text-xs hover:text-gray-400 transition-colors"
          >
            &copy; 2025 ビジネスLPメーカー
          </a>
        </footer>
      </div>
    </>
  );
};

export default BusinessViewer;








