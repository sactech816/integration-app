import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const quizTitle = searchParams.get('quizTitle') || 'エンタメ診断';
  const resultTitle = searchParams.get('title') || '';
  const style = searchParams.get('style') || 'vibrant';

  const styles: Record<string, { primary: string; secondary: string; accent: string; textColor: string }> = {
    vibrant: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#f59e0b',
      textColor: '#ffffff',
    },
    cute: {
      primary: '#f9a8d4',
      secondary: '#c4b5fd',
      accent: '#fde68a',
      textColor: '#831843',
    },
    cool: {
      primary: '#1e1b4b',
      secondary: '#312e81',
      accent: '#06b6d4',
      textColor: '#ffffff',
    },
    pop: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#14b8a6',
      textColor: '#ffffff',
    },
  };

  const theme = styles[style] || styles.vibrant;

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
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          padding: '60px',
          position: 'relative',
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
            opacity: 0.15,
            backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '20px',
          }}
        >
          {/* 診断タイトル */}
          <div
            style={{
              fontSize: '28px',
              color: theme.textColor,
              opacity: 0.8,
              fontWeight: 600,
            }}
          >
            {quizTitle}
          </div>

          {resultTitle ? (
            <>
              {/* 結果ラベル */}
              <div
                style={{
                  fontSize: '24px',
                  color: theme.textColor,
                  opacity: 0.9,
                }}
              >
                わたしのタイプは...
              </div>

              {/* 結果タイトル */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 50px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: '52px',
                    fontWeight: 800,
                    color: theme.textColor,
                    lineHeight: 1.2,
                  }}
                >
                  {resultTitle}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: theme.textColor,
                lineHeight: 1.3,
              }}
            >
              あなたも診断してみよう！
            </div>
          )}

          {/* ブランド */}
          <div
            style={{
              fontSize: '18px',
              color: theme.textColor,
              opacity: 0.7,
              marginTop: '20px',
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
