import { Block, QuizQuestion, QuizResult } from '@/lib/types';

// ===========================================
// プロフィールLP / ビジネスLP用テンプレート型
// ===========================================
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: {
    gradient: string;
    backgroundImage?: string;
  };
  blocks: Block[];
}

// ===========================================
// 診断クイズ用テンプレート型
// ===========================================
export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  mode: 'diagnosis' | 'test' | 'fortune';
  questions: QuizQuestion[];
  results: QuizResult[];
}

// ===========================================
// テンプレートカテゴリ定義
// ===========================================

export const PROFILE_CATEGORIES = [
  { id: 'consultant', label: 'コンサル・士業' },
  { id: 'creator', label: 'クリエイター・アーティスト' },
  { id: 'marketer', label: 'マーケター・講師' },
  { id: 'author', label: '著者・出版' },
  { id: 'coach', label: 'コーチ・カウンセラー' },
  { id: 'store', label: '店舗・サロン' },
] as const;

export const BUSINESS_CATEGORIES = [
  { id: 'consultant', label: 'コンサル・士業' },
  { id: 'coaching', label: 'コーチ・講師' },
  { id: 'salon', label: 'サロン・美容' },
  { id: 'restaurant', label: '飲食店' },
  { id: 'clinic', label: '医療・整体' },
  { id: 'school', label: 'スクール・教室' },
] as const;

export const QUIZ_CATEGORIES = [
  { id: 'personality', label: '性格診断系' },
  { id: 'career', label: '適職・キャリア系' },
  { id: 'love', label: '恋愛・相性系' },
  { id: 'business', label: 'ビジネス・スキル系' },
  { id: 'health', label: '健康・ライフスタイル系' },
  { id: 'entertainment', label: 'エンタメ・占い系' },
] as const;













































































