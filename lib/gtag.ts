// Google Analytics 4 (GA4) ユーティリティ関数

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

/**
 * 生成完了イベントを送信（要件1: コンバージョン計測）
 * @param toolType - 'quiz' | 'business' | 'profile'
 */
export const trackGenerateComplete = (toolType: 'quiz' | 'business' | 'profile') => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'generate_complete', {
    event_category: 'tool_usage',
    tool_type: toolType,
  });
};

/**
 * エラーイベントを送信（要件2: エラー計測）
 * @param errorMessage - エラーメッセージ
 */
export const trackGenerateError = (errorMessage: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'generate_error', {
    event_category: 'error',
    error_message: errorMessage,
  });
};

/**
 * User IDをGA4に設定（要件3: User ID紐付け）
 * ログイン時に呼び出し、ログアウト時はnullを渡す
 * @param userId - SupabaseのユーザーID（またはnull）
 */
export const setUserId = (userId: string | null) => {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_ID, {
    user_id: userId || undefined,
  });
};
