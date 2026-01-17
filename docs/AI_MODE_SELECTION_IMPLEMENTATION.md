# AIモード選択機能 実装ガイド

## 📋 概要

管理者ページとユーザーページでAIモード（高品質/高速）を選択できるようにし、LPの料金説明を更新します。

## 🎯 実装タスク

### 1. グローバルAIモード設定コンポーネント作成

ダッシュボードやKindleエディター全体で使用するAIモードを設定・保存するコンポーネント。

**ファイル**: `components/shared/GlobalAIModeSelector.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AIModeToggle from './AIModeToggle';
import AICreditDisplay from './AICreditDisplay';
import type { AIMode } from '@/lib/types';

interface GlobalAIModeSelectorProps {
  userId: string;
  compact?: boolean;
}

export default function GlobalAIModeSelector({ userId, compact = false }: GlobalAIModeSelectorProps) {
  const [aiMode, setAiMode] = useState<AIMode>('speed');
  const [loading, setLoading] = useState(true);

  // ローカルストレージからモード設定を読み込み
  useEffect(() => {
    const saved = localStorage.getItem(`ai_mode_${userId}`);
    if (saved === 'quality' || saved === 'speed') {
      setAiMode(saved);
    }
    setLoading(false);
  }, [userId]);

  // モード変更時にローカルストレージに保存
  const handleModeChange = (mode: AIMode) => {
    setAiMode(mode);
    localStorage.setItem(`ai_mode_${userId}`, mode);
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <AICreditDisplay userId={userId} compact />
        <AIModeToggle
          userId={userId}
          currentMode={aiMode}
          onModeChange={handleModeChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AICreditDisplay userId={userId} />
      <AIModeToggle
        userId={userId}
        currentMode={aiMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
}
```

### 2. ダッシュボードへの追加

**ファイル**: `app/dashboard/page.tsx`

```typescript
// インポート追加
import GlobalAIModeSelector from '@/components/shared/GlobalAIModeSelector';

// ダッシュボード内の適切な場所（例: ヘッダー付近）に追加
{user?.id && (
  <div className="mb-6">
    <GlobalAIModeSelector userId={user.id} compact />
  </div>
)}
```

### 3. Kindleエディターへの統合

**ファイル**: `components/kindle/editor/EditorLayout.tsx`

AI生成機能を使用する箇所で、ローカルストレージからAIモードを読み取り、APIリクエストに含める。

```typescript
// AI生成関数内
const getAIMode = (): AIMode => {
  if (typeof window === 'undefined') return 'speed';
  const userId = // ユーザーIDを取得
  const saved = localStorage.getItem(`ai_mode_${userId}`);
  return (saved === 'quality' || saved === 'speed') ? saved : 'speed';
};

// API呼び出し時
const response = await fetch('/api/kdl/generate-section-v2/route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...otherParams,
    mode: getAIMode(),
  }),
});
```

### 4. ユーザーIDの取得

Kindleエディターでユーザー情報が必要なので、親コンポーネントから渡すか、Supabase Authから取得。

**ファイル**: `app/kindle/[id]/page.tsx`

```typescript
import { supabase } from '@/lib/supabase';

// コンポーネント内
const [user, setUser] = useState<any>(null);

useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
  getUser();
}, []);

// EditorLayoutに渡す
<EditorLayout
  {...props}
  userId={user?.id}
/>
```

### 5. LP（ホームページ）の料金説明修正

**ファイル**: `app/HomePageClient.tsx`

料金プランセクションを探して、ハイブリッドクレジットシステムの説明に更新。

```typescript
const pricingPlans = [
  {
    name: 'Lite',
    price: '2,980円',
    period: '/月',
    features: [
      '高速AI: 20回/日',
      'Premium枠: なし',
      '書籍作成: 無制限',
      'メールサポート',
    ],
  },
  {
    name: 'Standard',
    price: '4,980円',
    period: '/月',
    features: [
      '高速AI: 30回/日',
      'Premium枠: なし',
      '書籍作成: 無制限',
      'メール優先サポート',
    ],
  },
  {
    name: 'Pro',
    price: '9,800円',
    period: '/月',
    badge: '人気',
    features: [
      '高品質AI: 20回/日 ⚡',
      '高速AI: 80回/日 🚀',
      '合計100回/日',
      '書籍作成: 無制限',
      'チャットサポート',
      '新機能先行アクセス',
    ],
  },
  {
    name: 'Business',
    price: '29,800円',
    period: '/月',
    badge: '最強',
    features: [
      '高品質AI: 50回/日 ⚡',
      '高速AI: 無制限 🚀',
      '書籍作成: 無制限',
      'グループコンサル月1回',
      '優先サポート',
    ],
  },
];
```

### 6. API Credit Check エンドポイント作成

フロントエンドからクレジットチェックを行うためのAPI。

**ファイル**: `app/api/ai-credit-check/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { checkAICreditLimit } from '@/lib/ai-usage';
import { getSubscriptionStatus, getAICreditsForPlan } from '@/lib/subscription';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') as 'quality' | 'speed' || 'speed';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // プラン情報取得
    const subscription = await getSubscriptionStatus(userId);
    const credits = getAICreditsForPlan(subscription.planTier);

    // クレジットチェック
    const usageCheck = await checkAICreditLimit(userId, mode);

    return NextResponse.json({
      hasPremiumAccess: credits.hasPremiumAccess,
      canUsePremium: usageCheck.canUsePremium,
      canUseStandard: usageCheck.canUseStandard,
      remainingPremium: usageCheck.remainingPremium,
      remainingStandard: usageCheck.remainingStandard,
      planTier: subscription.planTier,
    });
  } catch (error: any) {
    console.error('AI credit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check AI credits' },
      { status: 500 }
    );
  }
}
```

## 📝 実装順序

1. ✅ `app/api/ai-credit-check/route.ts` 作成
2. ✅ `components/shared/GlobalAIModeSelector.tsx` 作成
3. ✅ `app/dashboard/page.tsx` にGlobalAIModeSelectorを追加
4. ✅ `app/kindle/[id]/page.tsx` でユーザーID取得してEditorLayoutに渡す
5. ✅ `components/kindle/editor/EditorLayout.tsx` でAIモード読み取り機能追加
6. ✅ `app/HomePageClient.tsx` の料金説明を更新

## 🧪 テスト項目

- [ ] ダッシュボードでAIモード切替が表示される
- [ ] モード切替が正常に動作する
- [ ] Premium枠がないプランではqualityモードが選択できない
- [ ] Premium枠使い切り後はspeedモードに自動切替される
- [ ] Kindleエディターで選択したモードが反映される
- [ ] LP料金説明が正しく表示される

## 🔍 トラブルシューティング

### Q: ダッシュボードでAIモード選択が表示されない

**A:** `user.id`が正しく取得できているか確認。

```typescript
console.log('User ID:', user?.id);
```

### Q: モード選択ができない

**A:** `AIModeToggle`コンポーネントの`disabled`プロパティを確認。

### Q: LP料金説明が更新されない

**A:** ブラウザのキャッシュをクリアして再読み込み。

---

**最終更新**: 2026-01-10

