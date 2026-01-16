import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || '集客メーカー';
  const description = searchParams.get('description') || '診断クイズ・プロフィールLP・ビジネスLPを簡単作成';
  const type = searchParams.get('type') || 'default';

  // タイプ別のカラー設定
  const colors: Record<string, { primary: string; secondary: string; accent: string }> = {
    quiz: {
      primary: '#6366f1',
      secondary: '#818cf8',
      accent: '#c7d2fe',
    },
    profile: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#a7f3d0',
    },
    business: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fde68a',
    },
    default: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#c4b5fd',
    },
  };

  const color = colors[type] || colors.default;

  // タイプ別のラベル
  const typeLabels: Record<string, string> = {
    quiz: '診断クイズメーカー',
    profile: 'プロフィールメーカー',
    business: 'ビジネスLPメーカー',
    default: '集客メーカー',
  };

  const typeLabel = typeLabels[type] || typeLabels.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          padding: '60px',
        }}
      >
        {/* 背景パターン */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* コンテンツ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {/* タイプラベル */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '24px',
              fontWeight: 600,
              padding: '12px 32px',
              borderRadius: '50px',
              marginBottom: '32px',
            }}
          >
            {typeLabel}
          </div>

          {/* タイトル */}
          <div
            style={{
              color: 'white',
              fontSize: title.length > 20 ? '48px' : '64px',
              fontWeight: 900,
              lineHeight: 1.2,
              maxWidth: '900px',
              marginBottom: '24px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            {title}
          </div>

          {/* 説明文 */}
          {description && (
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '28px',
                fontWeight: 500,
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {description.length > 60 ? description.substring(0, 60) + '...' : description}
            </div>
          )}
        </div>

        {/* フッター */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            makers.tokyo
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

























