import { Block } from '@/lib/types';

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
  // トップページ表示用のメタデータ
  icon?: string; // アイコン名（lucide-react）
  recommended?: boolean; // おすすめテンプレートかどうか
  order?: number; // 表示順序
}

// テンプレートカテゴリーの定義
export type TemplateCategory = 
  | 'コンサルタント・士業'
  | 'コーチ・講師'
  | '物販・EC'
  | '店舗ビジネス'
  | 'カフェ・飲食店'
  | 'フリーランス'
  | 'マーケティング法則';

// テンプレートIDの型定義
export type TemplateId = 
  | 'consultant'
  | 'coach'
  | 'retail-ec'
  | 'store'
  | 'cafe-restaurant'
  | 'freelance'
  | 'pasona'
  | 'aidoma'
  | 'quest';

