/**
 * セキュリティ用サニタイズ・エスケープユーティリティ
 * XSS対策のためのHTML/JavaScript エスケープ関数
 */

/**
 * HTMLエスケープ
 * ユーザー入力をHTMLに埋め込む際に使用
 * 
 * @param str エスケープする文字列
 * @returns エスケープされた文字列
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str == null) return '';
  
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * 複数の値をまとめてHTMLエスケープ
 * 
 * @param obj オブジェクト
 * @returns エスケープされたオブジェクト
 */
export function escapeHtmlObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = escapeHtml(value);
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  
  return result;
}

/**
 * メールアドレスのバリデーション
 * 
 * @param email メールアドレス
 * @returns 有効な場合true
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322に基づいた基本的なバリデーション
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * URLのバリデーション
 * 
 * @param url URL文字列
 * @returns 有効なHTTP/HTTPS URLの場合true
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 入力文字列の長さ制限
 * 
 * @param str 入力文字列
 * @param maxLength 最大長
 * @returns 制限された文字列
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (str == null) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength);
}

/**
 * 危険な文字列パターンの検出
 * SQLインジェクション、XSSの疑いがある入力を検出
 * 
 * @param str 検査する文字列
 * @returns 危険なパターンが含まれる場合true
 */
export function containsSuspiciousPattern(str: string): boolean {
  if (!str) return false;
  
  const suspiciousPatterns = [
    // Script tags
    /<script\b/i,
    /<\/script>/i,
    // Event handlers
    /\bon\w+\s*=/i,
    // JavaScript protocol
    /javascript:/i,
    // Data protocol (can be used for XSS)
    /data:\s*text\/html/i,
    // SQL injection patterns
    /('\s*OR\s*'1'\s*=\s*'1)/i,
    /('\s*OR\s*1\s*=\s*1)/i,
    /(;\s*DROP\s+TABLE)/i,
    /(;\s*DELETE\s+FROM)/i,
    /(UNION\s+SELECT)/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(str));
}

/**
 * 安全なJSON文字列化
 * JSON-LDなどでHTMLに埋め込む際に使用
 * 
 * @param obj JSONオブジェクト
 * @returns エスケープされたJSON文字列
 */
export function safeJsonStringify(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * ファイル名のサニタイズ
 * パストラバーサル攻撃対策
 * 
 * @param filename ファイル名
 * @returns サニタイズされたファイル名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\:*?"<>|]/g, '_')
    .slice(0, 255);
}
