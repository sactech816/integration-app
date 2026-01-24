/**
 * Origin/Referer 検証ユーティリティ
 * 
 * 認証なしAPIへの不正アクセスを防ぐための検証
 */

/**
 * 許可されたOriginのリスト
 * 環境変数から取得、または本番ドメインを使用
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  
  // デフォルトの許可Origin
  const origins = [
    'https://makers.tokyo',
    'https://www.makers.tokyo',
  ];
  
  // Vercelプレビューデプロイメント
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.push(`https://${vercelUrl}`);
  }
  
  // 開発環境
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:3000');
  }
  
  return origins;
}

/**
 * リクエストのOriginを検証
 * 
 * @param request リクエストオブジェクト
 * @returns 許可されたOriginからのリクエストの場合true
 */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  const allowedOrigins = getAllowedOrigins();
  
  // Originヘッダーがある場合はそれを検証
  if (origin) {
    return allowedOrigins.some(allowed => origin === allowed);
  }
  
  // Originがない場合はRefererを検証（sendBeacon等）
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;
      return allowedOrigins.some(allowed => refererOrigin === allowed);
    } catch {
      return false;
    }
  }
  
  // 両方ない場合は拒否（サーバー間通信は別途認証が必要）
  return false;
}

/**
 * Origin検証に失敗した場合のレスポンス
 */
export function createOriginErrorResponse() {
  return new Response(
    JSON.stringify({ error: 'Forbidden: Invalid origin' }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * HMAC署名の生成（署名付きリクエスト用）
 * 
 * @param data 署名するデータ
 * @param secret シークレットキー
 * @returns 署名文字列
 */
export async function generateHmacSignature(
  data: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  
  // Base64エンコード
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * HMAC署名の検証
 * 
 * @param data 署名されたデータ
 * @param signature 検証する署名
 * @param secret シークレットキー
 * @returns 署名が有効な場合true
 */
export async function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const expectedSignature = await generateHmacSignature(data, secret);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * タイムスタンプ付き署名の生成
 * リプレイ攻撃対策
 * 
 * @param data 署名するデータ
 * @param secret シークレットキー
 * @returns { signature, timestamp }
 */
export async function generateTimedSignature(
  data: string,
  secret: string
): Promise<{ signature: string; timestamp: number }> {
  const timestamp = Date.now();
  const dataWithTimestamp = `${data}:${timestamp}`;
  const signature = await generateHmacSignature(dataWithTimestamp, secret);
  return { signature, timestamp };
}

/**
 * タイムスタンプ付き署名の検証
 * 
 * @param data 署名されたデータ
 * @param signature 検証する署名
 * @param timestamp タイムスタンプ
 * @param secret シークレットキー
 * @param maxAgeMs 許容する最大経過時間（ミリ秒）
 * @returns 署名が有効な場合true
 */
export async function verifyTimedSignature(
  data: string,
  signature: string,
  timestamp: number,
  secret: string,
  maxAgeMs: number = 5 * 60 * 1000 // デフォルト5分
): Promise<boolean> {
  // タイムスタンプの有効期限チェック
  const now = Date.now();
  if (now - timestamp > maxAgeMs) {
    return false;
  }
  
  const dataWithTimestamp = `${data}:${timestamp}`;
  return verifyHmacSignature(dataWithTimestamp, signature, secret);
}
