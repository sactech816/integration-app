import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabaseクライアントのインスタンス
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }) 
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
} as const;
