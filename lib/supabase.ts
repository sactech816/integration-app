import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabaseクライアントのインスタンス（@supabase/ssr使用でCookieベース認証）
// これにより、クライアントサイドとサーバーサイド（Middleware）で
// 同じセッション情報を共有できる
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

// Supabaseが設定されているかどうかを確認
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// データベーステーブル名の定数
export const TABLES = {
  QUIZZES: 'quizzes',
  PROFILES: 'profiles',
  BUSINESS_LPS: 'business_projects',
  ANNOUNCEMENTS: 'announcements',
  SURVEYS: 'surveys',
  GAMIFICATION_CAMPAIGNS: 'gamification_campaigns',
  ONBOARDING_MODALS: 'onboarding_modals',
  THUMBNAILS: 'thumbnails',
  WEBINAR_LPS: 'webinar_lps',
  SNS_POSTS: 'sns_posts',
  LINE_ACCOUNTS: 'line_accounts',
  LINE_FRIENDS: 'line_friends',
  LINE_MESSAGES: 'line_messages',
  LINE_SEND_LOGS: 'line_send_logs',
  SITES: 'sites',
  SITE_PAGES: 'site_pages',
  BIGFIVE_RESULTS: 'bigfive_results',
  FORTUNE_RESULTS: 'fortune_results',
  FORTUNE_CONTENTS: 'fortune_contents',
  CONCIERGE_MESSAGES: 'concierge_messages',
  CONCIERGE_CONFIGS: 'concierge_configs',
  CONCIERGE_VISITOR_MESSAGES: 'concierge_visitor_messages',
  TRIAL_SETTINGS: 'trial_settings',
  TRIAL_OFFERS: 'trial_offers',
  SUPPORTER_APPLICATIONS: 'supporter_applications',
  KINDLE_COVERS: 'kindle_covers',
  USER_PERSONA: 'user_persona',
  MONETIZE_DIAGNOSES: 'monetize_diagnoses',
  SUBSIDY_RESULTS: 'subsidy_results',
  SUBSIDY_MASTER: 'subsidy_master',
} as const;
