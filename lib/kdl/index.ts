/**
 * Kindle出版メーカー ライブラリ
 * 
 * このモジュールはKDL固有の機能を集約しています。
 * 将来的にKDLを独立したサービスとして分離する際に、
 * このディレクトリ配下のコードをベースに移行できます。
 */

// 設定
export * from './config';

// 認証
export * from './auth';

// 型定義の再エクスポート
export type {
  KdlPlanTier,
  KdlPlanConfig,
  KdlBookStatus,
  KdlUserRole,
  KdlAuthAdapter,
  KdlDatabaseAdapter,
} from './config';
