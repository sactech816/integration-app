/**
 * セキュリティユーティリティモジュール
 * 
 * 使用例:
 * import { escapeHtml, rateLimit, RATE_LIMIT_PRESETS } from '@/lib/security';
 */

export {
  escapeHtml,
  escapeHtmlObject,
  isValidEmail,
  isValidUrl,
  truncate,
  containsSuspiciousPattern,
  safeJsonStringify,
  sanitizeFilename,
} from './sanitize';

export {
  checkRateLimit,
  getClientIP,
  createRateLimitResponse,
  rateLimit,
  RATE_LIMIT_PRESETS,
} from './rate-limit';

export {
  verifyTurnstileToken,
  isTurnstileEnabled,
} from './turnstile';

export {
  verifyOrigin,
  createOriginErrorResponse,
  generateHmacSignature,
  verifyHmacSignature,
  generateTimedSignature,
  verifyTimedSignature,
} from './origin';
