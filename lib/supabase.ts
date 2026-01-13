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
} as const;
