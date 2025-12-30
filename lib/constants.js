// ===========================================
// 統合アプリケーション 定数
// ===========================================

// 管理者メールアドレス（環境変数から取得、カンマ区切りで複数設定可能）
export const getAdminEmails = () => {
  const emails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return emails.split(',').map(email => email.trim()).filter(email => email);
};

// サイト情報
export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'コンテンツメーカー',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  description: '診断クイズ・プロフィールLP・ビジネスLPを簡単に作成・公開できる統合プラットフォーム',
};

// サービス別設定
export const SERVICES = {
  quiz: {
    id: 'quiz',
    name: '診断クイズ',
    description: 'AIで診断・検定・占いを簡単作成',
    color: 'indigo',
    icon: 'Sparkles',
    path: '/quiz',
  },
  profile: {
    id: 'profile',
    name: 'プロフィールLP',
    description: 'リンクまとめページを簡単作成',
    color: 'emerald',
    icon: 'User',
    path: '/profile',
  },
  business: {
    id: 'business',
    name: 'ビジネスLP',
    description: 'ビジネス向けLPを簡単作成',
    color: 'amber',
    icon: 'Building2',
    path: '/business',
  },
};

// 価格設定
export const PRICING = {
  quiz: {
    free: {
      name: '無料プラン',
      price: 0,
      features: ['無制限の診断作成', '基本的な分析機能'],
    },
    pro: {
      name: 'Proプラン',
      price: 980,
      features: ['無制限の診断作成', '詳細な分析機能', 'カスタムドメイン対応'],
    },
  },
  profile: {
    free: {
      name: '無料プラン',
      price: 0,
      features: ['1つのプロフィールLP', '基本テンプレート'],
    },
    pro: {
      name: 'Proプラン',
      price: 500,
      features: ['無制限のプロフィールLP', 'プレミアムテンプレート', 'カスタムドメイン対応'],
    },
  },
  business: {
    free: {
      name: '無料プラン',
      price: 0,
      features: ['1つのビジネスLP', '基本テンプレート'],
    },
    pro: {
      name: 'Proプラン',
      price: 980,
      features: ['無制限のビジネスLP', 'AI Flyer機能', 'プレミアムテンプレート'],
    },
  },
};

// Google Analytics ID
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
