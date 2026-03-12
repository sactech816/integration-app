import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'Big Five 性格診断結果';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// レーダーチャート用の座標計算（5角形）
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function radarPoints(cx: number, cy: number, r: number, values: number[]): string {
  return values
    .map((v, i) => {
      const angle = (360 / 5) * i;
      const pt = polarToCartesian(cx, cy, (r * v) / 100, angle);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');
}

function gridPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const pt = polarToCartesian(cx, cy, r, (360 / 5) * i);
    return `${pt.x},${pt.y}`;
  }).join(' ');
}

const TRAIT_LABELS = ['開放性', '誠実性', '外向性', '協調性', '神経症傾向'];
const TRAIT_COLORS = ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let mbtiCode = '????';
  let testLabel = '性格診断';
  const scores = [50, 50, 50, 50, 50];
  let isPublic = false;

  try {
    const supabase = getServiceClient();
    if (supabase) {
      const { data } = await supabase
        .from('bigfive_results')
        .select('mbti_code, openness, conscientiousness, extraversion, agreeableness, neuroticism, is_public, test_type')
        .eq('id', id)
        .single();

      if (data) {
        isPublic = !!data.is_public;
        if (isPublic) {
          mbtiCode = data.mbti_code || '????';
          scores[0] = data.openness ?? 50;
          scores[1] = data.conscientiousness ?? 50;
          scores[2] = data.extraversion ?? 50;
          scores[3] = data.agreeableness ?? 50;
          scores[4] = data.neuroticism ?? 50;
          testLabel = data.test_type === 'detailed' ? '詳細診断' : data.test_type === 'full' ? '本格診断' : '簡易診断';
        }
      }
    }
  } catch {
    // fallback to defaults
  }

  // レーダーチャートの設定
  const cx = 210, cy = 210, maxR = 160;

  // グリッドの各レベル
  const gridLevels = [20, 40, 60, 80, 100];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b69 50%, #1a1a2e 100%)',
          padding: '40px',
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
            opacity: 0.05,
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* 左側：レーダーチャート */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '440px',
            flexShrink: 0,
          }}
        >
          <svg
            width="420"
            height="420"
            viewBox="0 0 420 420"
            style={{ overflow: 'visible' }}
          >
            {/* グリッド線 */}
            {gridLevels.map((level) => (
              <polygon
                key={level}
                points={gridPoints(cx, cy, (maxR * level) / 100)}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            ))}

            {/* 軸線 */}
            {Array.from({ length: 5 }, (_, i) => {
              const pt = polarToCartesian(cx, cy, maxR, (360 / 5) * i);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={pt.x}
                  y2={pt.y}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
              );
            })}

            {/* データ領域 */}
            {isPublic && (
              <>
                <polygon
                  points={radarPoints(cx, cy, maxR, scores)}
                  fill="rgba(99, 102, 241, 0.35)"
                  stroke="#818CF8"
                  strokeWidth="2.5"
                />
                {/* データ点 */}
                {scores.map((v, i) => {
                  const pt = polarToCartesian(cx, cy, (maxR * v) / 100, (360 / 5) * i);
                  return (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill={TRAIT_COLORS[i]}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </>
            )}

            {/* ラベル */}
            {TRAIT_LABELS.map((label, i) => {
              const pt = polarToCartesian(cx, cy, maxR + 36, (360 / 5) * i);
              return (
                <text
                  key={i}
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={TRAIT_COLORS[i]}
                  fontSize="18"
                  fontWeight="700"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* 右側：テキスト情報 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingLeft: '20px',
          }}
        >
          {/* バッジ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.3)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                color: '#C4B5FD',
                fontSize: '18px',
                fontWeight: 600,
                padding: '6px 20px',
                borderRadius: '50px',
              }}
            >
              Big Five {testLabel}
            </div>
          </div>

          {/* MBTIコード */}
          <div
            style={{
              color: 'white',
              fontSize: '80px',
              fontWeight: 900,
              letterSpacing: '6px',
              marginBottom: '12px',
              textShadow: '0 4px 30px rgba(139, 92, 246, 0.5)',
            }}
          >
            {isPublic ? mbtiCode : '????'}
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '22px',
              fontWeight: 500,
              marginBottom: '32px',
            }}
          >
            16パーソナリティタイプ
          </div>

          {/* スコアバー */}
          {isPublic && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%',
                maxWidth: '520px',
              }}
            >
              {TRAIT_LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      color: TRAIT_COLORS[i],
                      fontSize: '16px',
                      fontWeight: 700,
                      width: '100px',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: '18px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '9px',
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        width: `${scores[i]}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${TRAIT_COLORS[i]}88, ${TRAIT_COLORS[i]})`,
                        borderRadius: '9px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '16px',
                      fontWeight: 700,
                      width: '48px',
                      flexShrink: 0,
                    }}
                  >
                    {scores[i]}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isPublic && (
            <div
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '24px',
                fontWeight: 500,
              }}
            >
              科学的な性格分析を無料で体験
            </div>
          )}
        </div>

        {/* フッター */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            makers.tokyo/bigfive
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
