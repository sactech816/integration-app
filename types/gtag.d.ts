// Google Analytics 4 (gtag.js) の型定義

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  tool_type?: string;
  error_message?: string;
  [key: string]: unknown;
}

interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetIdOrEventName: string | Date,
    config?: GtagEventParams | { user_id?: string; [key: string]: unknown }
  ) => void;
  dataLayer: unknown[];
}
