# ハイブリッドAIクレジット制限システム 実装ガイド

## 📋 概要

このドキュメントは、Kindle出版支援サービスに実装された「ハイブリッドAIクレジット制限システム」の完全ガイドです。

## 🎯 システム概要

従来の単一カウンター制限から、**Premium Credits（高品質AI枠）** と **Standard Credits（通常AI枠）** の2つのカウンターを持つハイブリッド制限方式に変更されました。

### プラン別クレジット定義

| プラン | Premium Credits | Standard Credits | 書籍作成数 |
|--------|----------------|------------------|-----------|
| **Lite** | 0回 | 20回 | 無制限 |
| **Standard** | 0回 | 30回 | 無制限 |
| **Pro** | 20回 | 80回（合計100回） | 無制限 |
| **Business** | 50回 | 無制限 | 無制限 |

### AIモデルマッピング

#### Quality Mode（高品質AI）
- **構成作成**: o3-mini
- **本文執筆**: Claude 3.5 Sonnet
- **プロバイダー**: OpenAI

#### Speed Mode（高速AI）
- **構成作成**: Gemini 2.0 Flash
- **本文執筆**: Gemini 2.0 Flash
- **プロバイダー**: Gemini

## 🗄️ データベース構造

### 1. マイグレーションファイル

```sql
-- ファイル: supabase_hybrid_ai_credits.sql
```

主な変更点:
- `subscriptions`テーブルに`premium_credits_daily`と`standard_credits_daily`を追加
- `ai_usage_logs`テーブルに`usage_type`（'premium'/'standard'）を追加
- RPC関数`check_ai_credit_limit`を追加
- RPC関数`log_ai_credit_usage`を追加

### 2. データベース適用方法

```bash
# Supabase CLIを使用する場合
supabase db reset
supabase db push

# または、Supabase Studioから直接SQLを実行
# https://supabase.com/dashboard → SQL Editor
```

## 📦 実装ファイル一覧

### バックエンド

| ファイル | 説明 |
|---------|------|
| `lib/subscription.ts` | プラン定義の更新、クレジット取得関数追加 |
| `lib/ai-usage.ts` | ハイブリッドクレジットチェック、使用量記録 |
| `lib/ai-provider.ts` | MODEL_CONFIG追加、モード別プロバイダー取得 |
| `lib/types.ts` | ハイブリッドクレジット関連の型定義 |
| `app/api/kdl/generate-section-v2/route.ts` | ハイブリッド対応APIエンドポイント（サンプル） |

### フロントエンド

| ファイル | 説明 |
|---------|------|
| `components/shared/AICreditDisplay.tsx` | 残クレジット表示コンポーネント |
| `components/shared/AIModeToggle.tsx` | AIモード切替スイッチ |

## 🔧 使用方法

### 1. バックエンドでの使用

#### クレジットチェック

```typescript
import { checkAICreditLimit } from '@/lib/ai-usage';

// Qualityモード（Premium Credits）のチェック
const qualityCheck = await checkAICreditLimit(userId, 'quality');

// Speedモード（Standard Credits）のチェック
const speedCheck = await checkAICreditLimit(userId, 'speed');

// レスポンス例
{
  isWithinLimit: true,
  premiumUsage: 5,
  standardUsage: 12,
  premiumLimit: 20,
  standardLimit: 80,
  canUsePremium: true,
  canUseStandard: true,
  remainingPremium: 15,
  remainingStandard: 68
}
```

#### AI使用量の記録

```typescript
import { logAIUsage } from '@/lib/ai-usage';

await logAIUsage({
  userId: 'user-id',
  actionType: 'generate_section',
  service: 'kdl',
  modelUsed: 'claude-3-5-sonnet-20240620',
  usageType: 'premium', // または 'standard'
  metadata: { book_id: 'book-123' },
});
```

#### プロバイダー取得

```typescript
import { getProviderForModeAndPhase } from '@/lib/ai-provider';

// Qualityモード、執筆フェーズ → Claude 3.5 Sonnet
const provider = getProviderForModeAndPhase('quality', 'writing');

const response = await provider.generate({
  messages: [
    { role: 'system', content: 'システムプロンプト' },
    { role: 'user', content: 'ユーザー入力' },
  ],
  temperature: 0.8,
});
```

### 2. APIエンドポイントでの実装例

```typescript
// app/api/your-endpoint/route.ts
import { NextResponse } from 'next/server';
import { getProviderForModeAndPhase } from '@/lib/ai-provider';
import { checkAICreditLimit, logAIUsage } from '@/lib/ai-usage';
import { getSubscriptionStatus, getAICreditsForPlan } from '@/lib/subscription';
import type { AIMode } from '@/lib/types';

export async function POST(request: Request) {
  const { user_id, mode = 'speed' } = await request.json();

  // 1. プラン情報取得
  const subscription = await getSubscriptionStatus(user_id);
  const credits = getAICreditsForPlan(subscription.planTier);

  // 2. Premium権限チェック
  if (mode === 'quality' && !credits.hasPremiumAccess) {
    return NextResponse.json({ 
      error: '高品質AIはProプラン以上でご利用いただけます。',
      errorCode: 'PREMIUM_ACCESS_REQUIRED'
    }, { status: 403 });
  }

  // 3. クレジット残高チェック
  const usageCheck = await checkAICreditLimit(user_id, mode);
  
  if (!usageCheck.isWithinLimit) {
    // Premium枠切れ → Standard枠へのフォールバック提案
    if (mode === 'quality' && usageCheck.canUseStandard) {
      return NextResponse.json({ 
        error: '高品質AIの本日の使用上限に達しました。高速AIをお試しください。',
        suggestFallback: true
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: '本日のAI使用上限に達しました。'
    }, { status: 429 });
  }

  // 4. AIプロバイダー取得・実行
  const provider = getProviderForModeAndPhase(mode, 'writing');
  const response = await provider.generate({
    messages: [...],
  });

  // 5. 使用量記録
  await logAIUsage({
    userId: user_id,
    actionType: 'your_action',
    modelUsed: response.model,
    usageType: mode === 'quality' ? 'premium' : 'standard',
  });

  return NextResponse.json({ 
    content: response.content,
    remainingCredits: {
      premium: usageCheck.remainingPremium,
      standard: usageCheck.remainingStandard,
    }
  });
}
```

### 3. フロントエンドでの使用

#### クレジット表示

```tsx
import AICreditDisplay from '@/components/shared/AICreditDisplay';

export default function Dashboard({ user }) {
  return (
    <div>
      <h1>ダッシュボード</h1>
      
      {/* 通常モード */}
      <AICreditDisplay userId={user.id} />
      
      {/* コンパクトモード */}
      <AICreditDisplay userId={user.id} compact />
    </div>
  );
}
```

#### モード切替スイッチ

```tsx
import { useState } from 'react';
import AIModeToggle from '@/components/shared/AIModeToggle';

export default function Editor({ user }) {
  const [aiMode, setAiMode] = useState<'quality' | 'speed'>('speed');

  const handleGenerate = async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        mode: aiMode,
        // ...その他のパラメータ
      }),
    });

    const data = await response.json();
    
    // エラーハンドリング
    if (data.errorCode === 'PREMIUM_LIMIT_REACHED') {
      // Premium枠切れ → 自動的にspeedモードに切り替え
      setAiMode('speed');
      alert(data.error);
    }
  };

  return (
    <div>
      <AIModeToggle
        userId={user.id}
        currentMode={aiMode}
        onModeChange={setAiMode}
      />
      
      <button onClick={handleGenerate}>
        AI生成
      </button>
    </div>
  );
}
```

## 🔍 エラーハンドリング

### エラーコード一覧

| コード | 説明 | 対応方法 |
|-------|------|---------|
| `PREMIUM_ACCESS_REQUIRED` | Premium権限がない | プランアップグレードを促す |
| `PREMIUM_LIMIT_REACHED` | Premium枠切れ | Speedモードへのフォールバックを提案 |
| `DAILY_LIMIT_REACHED` | 全枠使い切り | 明日まで待つよう案内 |

### フォールバックフロー

```
1. ユーザーがQualityモードでリクエスト
   ↓
2. Premium枠チェック → 使い切っている
   ↓
3. Standard枠チェック → まだ余裕がある
   ↓
4. エラーレスポンス（suggestFallback: true）
   ↓
5. フロントエンド: 自動的にSpeedモードに切り替え
   ↓
6. ユーザーに通知「高速AIモードに切り替えました」
```

## 📊 アナリティクス

### 使用量の集計

```sql
-- 今日のPremium/Standard使用量（ユーザー別）
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE usage_type = 'premium') as premium_count,
  COUNT(*) FILTER (WHERE usage_type = 'standard') as standard_count
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE
GROUP BY user_id;

-- モデル別使用状況
SELECT 
  model_used,
  usage_type,
  COUNT(*) as usage_count
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY model_used, usage_type
ORDER BY usage_count DESC;
```

## 🧪 テスト

### 単体テスト例

```typescript
import { checkAICreditLimit } from '@/lib/ai-usage';
import { getAICreditsForPlan } from '@/lib/subscription';

describe('Hybrid AI Credit System', () => {
  test('Pro plan has premium access', () => {
    const credits = getAICreditsForPlan('pro');
    expect(credits.hasPremiumAccess).toBe(true);
    expect(credits.premium).toBe(20);
    expect(credits.standard).toBe(80);
  });

  test('Lite plan has no premium access', () => {
    const credits = getAICreditsForPlan('lite');
    expect(credits.hasPremiumAccess).toBe(false);
    expect(credits.premium).toBe(0);
    expect(credits.standard).toBe(20);
  });

  test('Premium limit check works', async () => {
    const result = await checkAICreditLimit('test-user', 'quality');
    expect(result).toHaveProperty('canUsePremium');
    expect(result).toHaveProperty('remainingPremium');
  });
});
```

## 🚀 デプロイチェックリスト

- [ ] データベースマイグレーション実行
- [ ] 環境変数設定確認（OPENAI_API_KEY, GEMINI_API_KEY）
- [ ] 既存ユーザーのプラン情報更新
- [ ] RPC関数の動作確認
- [ ] フロントエンドビルド・デプロイ
- [ ] 本番環境での動作確認

## 📝 今後の拡張案

### 1. 月次クレジット制限の追加

現在は日次制限のみですが、月次制限も追加可能です。

```sql
ALTER TABLE subscriptions 
ADD COLUMN premium_credits_monthly INTEGER DEFAULT -1,
ADD COLUMN standard_credits_monthly INTEGER DEFAULT -1;
```

### 2. クレジット購入機能

追加クレジットを購入できる機能。

```typescript
// 追加クレジット購入API
POST /api/credits/purchase
{
  "user_id": "...",
  "credit_type": "premium",
  "amount": 50
}
```

### 3. チーム共有クレジット

Enterpriseプラン向け、チーム全体でクレジットを共有する機能。

## 🆘 トラブルシューティング

### Q: Premium枠が表示されない

**A:** プラン情報を確認してください。

```sql
SELECT plan_tier, premium_credits_daily, standard_credits_daily
FROM subscriptions
WHERE user_id = 'your-user-id';
```

### Q: クレジットがリセットされない

**A:** RPC関数が正しくJSTタイムゾーンを使用しているか確認してください。

```sql
-- デバッグ用: 現在のタイムゾーン確認
SHOW timezone;

-- JST設定
SET timezone = 'Asia/Tokyo';
```

### Q: モード切替が効かない

**A:** フロントエンドのコンソールでエラーを確認してください。APIのレスポンスも確認。

```javascript
// ブラウザコンソール
localStorage.clear(); // キャッシュクリア
location.reload();
```

## 📞 サポート

問題が発生した場合:
1. このドキュメントのトラブルシューティングセクションを確認
2. ログを確認（Supabase Dashboard → Logs）
3. GitHubのIssueを作成

---

**最終更新日:** 2026-01-10  
**バージョン:** 1.0.0

