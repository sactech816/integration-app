'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ツール種別の定義
export type ContentToolType =
  | 'quiz'           // 診断クイズ
  | 'profile'        // プロフィールLP
  | 'business'       // ビジネスLP
  | 'salesletter'    // セールスレター
  | 'survey'         // アンケート
  | 'booking'        // 予約・日程調整
  | 'attendance'     // 出欠表メーカー
  | 'gamification'   // ゲーミフィケーション（ガチャ、スロット、スクラッチ、福引き、スタンプラリー、ログインボーナス、ポイントクイズ）
  | 'webinar';       // ウェビナーLP

// ツール名のマッピング
const TOOL_NAMES: Record<ContentToolType, string> = {
  quiz: '診断クイズメーカー',
  profile: 'プロフィールメーカー',
  business: 'ビジネスLPメーカー',
  salesletter: 'セールスライター',
  survey: 'アンケートメーカー',
  booking: '予約メーカー',
  attendance: '出欠表メーカー',
  gamification: 'ゲーミフィケーションツール',
  webinar: 'ウェビナーLPメーカー',
};

// バリアント（背景色に応じた色調整）
export type ContentFooterVariant = 'light' | 'dark' | 'transparent';

interface ContentFooterProps {
  /** フッターを非表示にする（Proプラン特典） */
  hideFooter?: boolean;
  /** ツール種別 */
  toolType: ContentToolType;
  /** 背景に応じた色調整 */
  variant?: ContentFooterVariant;
  /** 追加のクラス名 */
  className?: string;
}

// useSearchParamsを使う内部コンポーネント（Next.js 16でSuspense必須のため分離）
function ContentFooterInner({
  hideFooter = false,
  toolType,
  variant = 'light',
  className = '',
}: ContentFooterProps) {
  const searchParams = useSearchParams();
  const isFunnel = searchParams.get('funnel') === 'true';

  if (hideFooter || isFunnel) {
    return null;
  }

  const toolName = TOOL_NAMES[toolType];

  const variantStyles = {
    light: {
      container: 'bg-gray-50 border-t border-gray-100',
      toolLink: 'text-gray-500 hover:text-gray-700',
      copyright: 'text-gray-400 hover:text-gray-600',
    },
    dark: {
      container: 'bg-gray-900 border-t border-gray-800',
      toolLink: 'text-gray-400 hover:text-gray-300',
      copyright: 'text-gray-500 hover:text-gray-400',
    },
    transparent: {
      container: '',
      toolLink: 'text-gray-400 hover:text-gray-600',
      copyright: 'text-gray-300 hover:text-gray-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <footer className={`py-6 text-center ${styles.container} ${className}`}>
      {/* 1行目: ツール名 */}
      <a
        href="https://makers.tokyo/tools"
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs font-medium transition-colors ${styles.toolLink}`}
      >
        {toolName}で作成しました
      </a>

      {/* 2行目: コピーライト */}
      <div className="mt-1">
        <a
          href="https://makers.tokyo/"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs transition-colors ${styles.copyright}`}
        >
          @2026 集客メーカー
        </a>
      </div>
    </footer>
  );
}

/**
 * ユーザー作成コンテンツ用の共通フッターコンポーネント
 *
 * 表示形式:
 * [ツール名]で作成しました  ← https://makers.tokyo/tools へリンク
 * @2026 集客メーカー        ← https://makers.tokyo/ へリンク
 */
const ContentFooter: React.FC<ContentFooterProps> = (props) => {
  return (
    <Suspense>
      <ContentFooterInner {...props} />
    </Suspense>
  );
};

export default ContentFooter;
