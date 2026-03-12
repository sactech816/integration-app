/**
 * Fortune ファネルイベントトラッキング
 */

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  // ブラウザ環境のみ
  if (typeof window !== 'undefined') {
    sessionId = sessionStorage.getItem('fortune_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('fortune_session_id', sessionId);
    }
  }
  return sessionId || crypto.randomUUID();
}

export function trackFortuneEvent(
  eventType: 'page_view' | 'quiz_start' | 'quiz_complete' | 'report_purchase',
  metadata?: Record<string, any>
) {
  try {
    fetch('/api/fortune/funnel-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        sessionId: getSessionId(),
        metadata,
      }),
    }).catch(() => {
      // トラッキング失敗はサイレントに
    });
  } catch {
    // トラッキング失敗はサイレントに
  }
}
