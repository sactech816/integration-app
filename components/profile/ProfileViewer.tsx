'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { ViewTracker, trackClick } from '@/components/shared/ViewTracker';
import TrackingScripts from '@/components/shared/TrackingScripts';
import BlockRenderer from '@/components/shared/BlockRenderer';

interface ProfileViewerProps {
  profile: Profile;
}

const ProfileViewer: React.FC<ProfileViewerProps> = ({ profile }) => {
  const theme = profile.settings?.theme;
  const backgroundImage = theme?.backgroundImage;
  const gradient = theme?.gradient || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
  const isAnimated = theme?.animated !== false; // デフォルトはアニメーション有効

  // 背景スタイルの決定
  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : { 
        background: gradient,
        backgroundSize: isAnimated ? '400% 400%' : 'auto',
      };

  // リンククリックハンドラー（idを使用してアナリティクスと統一）
  const handleLinkClick = (url: string) => {
    if (profile.id) {
      trackClick(profile.id, 'profile', url);
    }
  };

  return (
    <>
      {/* アナリティクストラッカー（idを使用）*/}
      {profile.id && (
        <ViewTracker 
          contentId={profile.id} 
          contentType="profile"
          trackScroll={true}
          trackTime={true}
        />
      )}
      
      {/* 外部計測タグ */}
      <TrackingScripts settings={profile.settings?.tracking} />

      <div 
        className={`min-h-screen py-8 px-4 ${!backgroundImage && isAnimated ? 'animate-gradient-xy' : ''}`}
        style={backgroundStyle}
      >
        <div className="max-w-md mx-auto">
          {profile.content?.map(block => (
            <BlockRenderer 
              key={block.id}
              block={block} 
              variant="profile" 
              onLinkClick={handleLinkClick}
            />
          ))}

          {/* フッター */}
          <div className="text-center py-8">
            <a 
              href="https://www.makers.tokyo/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 text-xs hover:text-white/80 transition-colors"
            >
              &copy; 2025 プロフィールメーカー
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileViewer;
