/**
 * KDL固有の設定
 * 将来の独立化時に、このファイルを環境変数や別の設定ファイルで管理できるようにする
 */

// プラン定義
export type KdlPlanTier = 'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';

export interface KdlPlanConfig {
  tier: KdlPlanTier;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    maxBooks: number | 'unlimited';
    aiRequestsDaily: number | 'unlimited';
    aiRequestsMonthly: number | 'unlimited';
    wordExport: boolean;
    kdpInfoGeneration: boolean;
    prioritySupport: boolean;
    agencyFeatures: boolean;
  };
}

export const KDL_PLANS: Record<KdlPlanTier, KdlPlanConfig> = {
  none: {
    tier: 'none',
    name: '無料',
    price: { monthly: 0, yearly: 0 },
    features: {
      maxBooks: 1,
      aiRequestsDaily: 3,
      aiRequestsMonthly: 10,
      wordExport: false,
      kdpInfoGeneration: false,
      prioritySupport: false,
      agencyFeatures: false,
    },
  },
  lite: {
    tier: 'lite',
    name: 'ライト',
    price: { monthly: 2980, yearly: 29800 },
    features: {
      maxBooks: 3,
      aiRequestsDaily: 20,
      aiRequestsMonthly: 300,
      wordExport: true,
      kdpInfoGeneration: true,
      prioritySupport: false,
      agencyFeatures: false,
    },
  },
  standard: {
    tier: 'standard',
    name: 'スタンダード',
    price: { monthly: 4980, yearly: 49800 },
    features: {
      maxBooks: 10,
      aiRequestsDaily: 50,
      aiRequestsMonthly: 500,
      wordExport: true,
      kdpInfoGeneration: true,
      prioritySupport: true,
      agencyFeatures: false,
    },
  },
  pro: {
    tier: 'pro',
    name: 'プロ',
    price: { monthly: 9800, yearly: 98000 },
    features: {
      maxBooks: 'unlimited',
      aiRequestsDaily: 100,
      aiRequestsMonthly: 1000,
      wordExport: true,
      kdpInfoGeneration: true,
      prioritySupport: true,
      agencyFeatures: false,
    },
  },
  business: {
    tier: 'business',
    name: 'ビジネス',
    price: { monthly: 29800, yearly: 298000 },
    features: {
      maxBooks: 'unlimited',
      aiRequestsDaily: 'unlimited',
      aiRequestsMonthly: 'unlimited',
      wordExport: true,
      kdpInfoGeneration: true,
      prioritySupport: true,
      agencyFeatures: true,
    },
  },
  enterprise: {
    tier: 'enterprise',
    name: 'エンタープライズ',
    price: { monthly: 0, yearly: 0 }, // カスタム
    features: {
      maxBooks: 'unlimited',
      aiRequestsDaily: 'unlimited',
      aiRequestsMonthly: 'unlimited',
      wordExport: true,
      kdpInfoGeneration: true,
      prioritySupport: true,
      agencyFeatures: true,
    },
  },
};

// 書籍ステータス
export type KdlBookStatus = 'draft' | 'writing' | 'completed' | 'published';

export const KDL_BOOK_STATUSES: Record<KdlBookStatus, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'amber' },
  writing: { label: '執筆中', color: 'blue' },
  completed: { label: '完成', color: 'green' },
  published: { label: '出版済み', color: 'purple' },
};

// ユーザーロール
export type KdlUserRole = 'user' | 'agency' | 'admin';

export const KDL_USER_ROLES: Record<KdlUserRole, { label: string; color: string }> = {
  user: { label: 'ユーザー', color: 'gray' },
  agency: { label: '代理店', color: 'blue' },
  admin: { label: '管理者', color: 'purple' },
};

// アプリケーション設定
export const KDL_CONFIG = {
  appName: 'Kindle出版メーカー',
  appNameShort: 'Kindle出版メーカー',
  appDescription: 'AIでKindle出版を簡単に',
  
  // URL設定（将来の独立化時に変更）
  baseUrl: process.env.NEXT_PUBLIC_KDL_BASE_URL || '/kindle',
  apiUrl: process.env.NEXT_PUBLIC_KDL_API_URL || '/api/kdl',
  
  // AI設定
  defaultAiModel: 'gemini-2.5-flash-lite',
  qualityAiModel: 'claude-3-5-sonnet-20241022',
  
  // 文字数制限
  minSectionLength: 100, // 完成判定の最小文字数
  
  // テーブルプレフィックス
  tablePrefix: 'kdl_',
} as const;

// 将来の独立化時に必要な抽象化
export interface KdlAuthAdapter {
  getCurrentUser: () => Promise<{ id: string; email?: string } | null>;
  signOut: () => Promise<void>;
  isAdmin: (email: string) => boolean;
}

export interface KdlDatabaseAdapter {
  getBooks: (userId: string) => Promise<any[]>;
  getBook: (bookId: string) => Promise<any | null>;
  createBook: (data: any) => Promise<any>;
  updateBook: (bookId: string, data: any) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
}
