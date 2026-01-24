/**
 * レート制限ユーティリティ
 * 
 * シンプルなメモリベースのレート制限実装
 * 本番環境では @upstash/ratelimit への移行を推奨
 * 
 * 注意: Vercel Serverless環境ではインスタンス間でメモリが共有されないため、
 * 高トラフィック環境では Upstash Redis を使用することを推奨
 */

// レート制限の設定
interface RateLimitConfig {
  // 許可するリクエスト数
  limit: number;
  // 時間枠（ミリ秒）
  windowMs: number;
}

// リクエスト記録
interface RequestRecord {
  count: number;
  resetTime: number;
}

// メモリストア（シンプルな実装）
const store = new Map<string, RequestRecord>();

// 定期的に古いエントリをクリーンアップ（メモリリーク防止）
const CLEANUP_INTERVAL = 60 * 1000; // 1分ごと
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, record] of store.entries()) {
    if (record.resetTime < now) {
      store.delete(key);
    }
  }
}

// プリセット設定
export const RATE_LIMIT_PRESETS = {
  // 認証系: 5回/分（ブルートフォース対策）
  auth: { limit: 5, windowMs: 60 * 1000 },
  // フォーム送信: 3回/分（スパム対策）
  form: { limit: 3, windowMs: 60 * 1000 },
  // API一般: 30回/分
  api: { limit: 30, windowMs: 60 * 1000 },
  // 厳格: 1回/分（パスワードリセットなど）
  strict: { limit: 1, windowMs: 60 * 1000 },
} as const;

/**
 * レート制限チェック
 * @param identifier ユーザー識別子（IPアドレス、ユーザーIDなど）
 * @param config レート制限設定
 * @returns { success: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.api
): { success: boolean; remaining: number; resetIn: number } {
  cleanup();
  
  const now = Date.now();
  const key = identifier;
  const record = store.get(key);
  
  // 新しいリクエスト or 時間枠がリセットされた
  if (!record || record.resetTime < now) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowMs,
    };
  }
  
  // 制限内
  if (record.count < config.limit) {
    record.count++;
    return {
      success: true,
      remaining: config.limit - record.count,
      resetIn: record.resetTime - now,
    };
  }
  
  // 制限超過
  return {
    success: false,
    remaining: 0,
    resetIn: record.resetTime - now,
  };
}

/**
 * リクエストからIPアドレスを取得
 * Vercel/Cloudflare環境対応
 */
export function getClientIP(request: Request): string {
  // Vercel
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Cloudflare
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Real IP header
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // フォールバック
  return 'unknown';
}

/**
 * レート制限レスポンスを生成
 */
export function createRateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({
      error: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(resetIn / 1000)),
      },
    }
  );
}

/**
 * レート制限ミドルウェア（API Route用）
 * 使用例:
 * ```
 * const rateLimitResult = await rateLimit(request, 'auth');
 * if (!rateLimitResult.success) {
 *   return createRateLimitResponse(rateLimitResult.resetIn);
 * }
 * ```
 */
export function rateLimit(
  request: Request,
  preset: keyof typeof RATE_LIMIT_PRESETS = 'api'
) {
  const ip = getClientIP(request);
  const endpoint = new URL(request.url).pathname;
  const identifier = `${ip}:${endpoint}`;
  
  return checkRateLimit(identifier, RATE_LIMIT_PRESETS[preset]);
}
