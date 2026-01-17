# Kindle AI API 仕様書

このドキュメントでは、Kindle執筆機能（KDL）で使用されるAI APIの仕様、現在の設定、モデル変更方法について説明します。

## 📋 目次

1. [現在利用中のモデル](#現在利用中のモデル)
2. [関連ファイル一覧](#関連ファイル一覧)
3. [モデル変更方法](#モデル変更方法)
4. [Claude API対応状況](#claude-api対応状況)
5. [プラン別モデル設定](#プラン別モデル設定)

---

## 現在利用中のモデル

### 実装済みプロバイダー

#### 1. OpenAI
- **モデル**: `gpt-4o-mini`, `gpt-4o`, `o3-mini`, `o1`
- **環境変数**: `OPENAI_API_KEY`
- **パッケージ**: `openai` (v6.15.0)

#### 2. Google Gemini
- **モデル**: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`, `gemini-2.0-flash-lite`
- **環境変数**: `GEMINI_API_KEY`
- **パッケージ**: `@google/generative-ai` (v0.24.1)

### 設定されているが未実装のプロバイダー

#### 3. Anthropic Claude
- **設定上のモデル**: `claude-3-haiku-20240307`, `claude-3-5-sonnet-20240620`
- **現在の状態**: 設定は存在するが、実装は未完了（`openai`にフォールバック）
- **環境変数**: `ANTHROPIC_API_KEY`（設定例のみ）
- **パッケージ**: 未インストール（`@anthropic-ai/sdk`が必要）

---

## 関連ファイル一覧

### コアファイル

| ファイル | 説明 | 主要機能 |
|---------|------|---------|
| `lib/ai-provider.ts` | AIプロバイダー抽象化レイヤー | プロバイダー実装、モデル設定、ファクトリー関数 |
| `lib/ai-usage.ts` | AI使用量管理 | クレジット制限チェック、使用量ログ記録 |
| `lib/subscription.ts` | サブスクリプション管理 | プラン定義、AIモデルマッピング |

### UIコンポーネント

| ファイル | 説明 |
|---------|------|
| `components/kindle/AIModelSelector.tsx` | ユーザー向けモード選択UI（スピード/ハイクオリティ） |
| `components/shared/AdminAISettings.tsx` | 管理者向けデフォルトAI設定UI |
| `components/kindle/AIUsageDisplay.tsx` | AI使用量表示コンポーネント |

### APIエンドポイント

| エンドポイント | 説明 |
|--------------|------|
| `app/api/kdl/generate-section/route.ts` | 本文生成API |
| `app/api/kdl/generate-title/route.ts` | タイトル生成API |
| `app/api/kdl/generate-subtitle/route.ts` | サブタイトル生成API |
| `app/api/kdl/generate-target/route.ts` | ターゲット生成API |
| `app/api/kdl/generate-chapters/route.ts` | 目次生成API |
| `app/api/admin/ai-settings/route.ts` | 管理者AI設定API |

### 設定・ドキュメントファイル

| ファイル | 説明 |
|---------|------|
| `AI_PROVIDER_SETUP.md` | AIプロバイダーセットアップガイド |
| `ADMIN_AI_SETTINGS_GUIDE.md` | 管理者AI設定ガイド |
| `AI_MODEL_SELECTION_IMPLEMENTATION_COMPLETE.md` | AIモデル選択機能実装レポート |
| `supabase_admin_ai_settings.sql` | データベーススキーマ |

---

## モデル変更方法

### 1. プラン別プリセット設定を変更

**ファイル**: `lib/ai-provider.ts`

**設定箇所**: `PLAN_AI_PRESETS` 定数（224-309行目）

```typescript:lib/ai-provider.ts
export const PLAN_AI_PRESETS = {
  lite: {
    presetA: {
      name: 'コスト特化',
      outline: { model: 'gemini-2.0-flash-lite', provider: 'gemini' as const, cost: 0.30 },
      writing: { model: 'gemini-2.0-flash-lite', provider: 'gemini' as const, cost: 0.30 },
      description: 'Flash-Liteで最安値。速度重視の量産向け。',
    },
    presetB: {
      // ... 変更する場合はここを編集
    },
  },
  // ... 他のプランも同様
};
```

**変更例**:
```typescript
// StandardプランのpresetBの執筆モデルを変更する場合
standard: {
  presetB: {
    writing: { 
      model: 'gpt-4o-mini',  // ← ここを変更
      provider: 'openai' as const, 
      cost: 0.60 
    },
  },
}
```

### 2. ハイブリッドクレジット用モデル設定を変更

**ファイル**: `lib/ai-provider.ts`

**設定箇所**: `MODEL_CONFIG` 定数（316-327行目）

```typescript:lib/ai-provider.ts
export const MODEL_CONFIG = {
  quality: {
    outline: 'o3-mini',                      // ← 変更
    writing: 'claude-3-5-sonnet-20240620',  // ← 変更
    provider: 'openai' as const,
  },
  speed: {
    outline: 'gemini-2.0-flash-exp',        // ← 変更
    writing: 'gemini-2.0-flash-exp',        // ← 変更
    provider: 'gemini' as const,
  },
} as const;
```

### 3. レガシー用モデル設定を変更

**ファイル**: `lib/ai-provider.ts`

**設定箇所**: `AI_MODELS` 定数（208-219行目）

```typescript:lib/ai-provider.ts
export const AI_MODELS = {
  planning: {
    openai: 'gpt-4o-mini',        // ← 変更
    gemini: 'gemini-1.5-flash',   // ← 変更
  },
  writing: {
    openai: 'gpt-4o-2024-08-06',  // ← 変更
    gemini: 'gemini-1.5-pro',      // ← 変更
  },
} as const;
```

### 4. 環境変数による優先プロバイダー指定

**ファイル**: `.env.local`（環境変数）

```bash
# 優先プロバイダーを指定
AI_PROVIDER=openai  # または 'gemini'

# 各プロバイダーのAPIキー
OPENAI_API_KEY=sk-proj-xxxxx
GEMINI_API_KEY=AIzaSyxxxxx

# モデル名の上書き（オプション）
GEMINI_MODEL=gemini-1.5-flash
```

### 5. プラン別のデフォルトモデルを変更

**ファイル**: `lib/subscription.ts`

**設定箇所**: `PLAN_DEFINITIONS` 定数内の `aiModel` フィールド

```typescript:lib/subscription.ts
export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  lite: {
    aiModel: 'gemini-flash',  // ← 変更可能な値: 'gemini-flash' | 'gpt-4o-mini' | 'gpt-4o' | 'custom'
    aiModelDisplay: '標準AI',
    // ...
  },
  // ...
};
```

---

## Claude API対応状況

### 現在の状態

**⚠️ 注意**: Claude（Anthropic）のAPIは**設定上は定義されているが、実装は未完了**です。

### 設定されている箇所

1. **`lib/ai-provider.ts`** の `PLAN_AI_PRESETS` 定数
   - Standard, Pro, BusinessプランでClaudeモデルが設定されている
   - 例: `claude-3-haiku-20240307`, `claude-3-5-sonnet-20240620`

2. **フォールバック処理**
   - `getProviderForPlanAndPreset` 関数（342行目）で、`anthropic`プロバイダーは`openai`にフォールバック

```typescript:lib/ai-provider.ts
return createAIProvider({
  preferProvider: config.provider === 'anthropic' ? 'openai' : config.provider,  // ← フォールバック
  model: config.model,
});
```

### Claude APIを有効化する手順

#### ステップ1: パッケージのインストール

```bash
npm install @anthropic-ai/sdk
```

#### ステップ2: AnthropicProviderクラスの実装

**ファイル**: `lib/ai-provider.ts`

`GeminiProvider` クラスの後に追加:

```typescript
/**
 * Anthropic Provider
 */
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model: string = 'claude-3-haiku-20240307') {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    // System メッセージと User メッセージを分離
    const systemMessage = request.messages
      .filter((msg) => msg.role === 'system')
      .map((msg) => msg.content)
      .join('\n\n');

    const userMessages = request.messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => msg.content)
      .join('\n\n');

    const params: any = {
      model: this.model,
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: userMessages,
        },
      ],
    };

    // System メッセージがある場合は追加
    if (systemMessage) {
      params.system = systemMessage;
    }

    // JSON モードの設定
    if (request.responseFormat === 'json') {
      params.response_format = { type: 'json_object' };
    }

    const response = await this.client.messages.create(params);

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Anthropic returned non-text response');
    }

    return {
      content: content.text,
      model: this.model,
      provider: 'anthropic',
    };
  }

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  getProviderName(): string {
    return 'Anthropic';
  }
}
```

#### ステップ3: インポートの追加

```typescript
import Anthropic from '@anthropic-ai/sdk';
```

#### ステップ4: createAIProvider関数の更新

`createAIProvider` 関数（166-203行目）にAnthropic対応を追加:

```typescript
export function createAIProvider(options?: {
  preferProvider?: 'openai' | 'gemini' | 'anthropic';  // ← 'anthropic' を追加
  model?: string;
}): AIProvider {
  const preferProvider = options?.preferProvider || process.env.AI_PROVIDER || 'openai';

  // Anthropic を優先する場合
  if (preferProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY,
      options?.model || 'claude-3-haiku-20240307'
    );
  }

  // ... 既存のコード ...

  // フォールバック: Anthropic を試す
  if (process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY,
      options?.model || 'claude-3-haiku-20240307'
    );
  }

  throw new Error('No AI provider available. Please set OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY');
}
```

#### ステップ5: 型定義の更新

```typescript
// AIGenerateResponse の provider に 'anthropic' を追加
export interface AIGenerateResponse {
  content: string;
  model: string;
  provider: 'openai' | 'gemini' | 'anthropic';  // ← 'anthropic' を追加
}

// AIProvider インターフェースは変更不要
```

#### ステップ6: getProviderForPlanAndPreset関数の修正

```typescript
export function getProviderForPlanAndPreset(
  planTier: PlanTier,
  preset: 'presetA' | 'presetB',
  phase: 'outline' | 'writing'
): AIProvider {
  const planPresets = PLAN_AI_PRESETS[planTier];
  const selectedPreset = planPresets[preset];
  const config = selectedPreset[phase];

  return createAIProvider({
    preferProvider: config.provider,  // ← フォールバックを削除
    model: config.model,
  });
}
```

#### ステップ7: 環境変数の設定

`.env.local` に追加:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

#### ステップ8: getAIProviderForPlan関数の更新（オプション）

`lib/subscription.ts` の `getAIProviderForPlan` 関数も更新が必要な場合があります。

---

## プラン別モデル設定

### 現在の設定（`PLAN_AI_PRESETS`）

| プラン | プリセット | 構成（Outline） | 執筆（Writing） | コスト目安 |
|-------|-----------|----------------|----------------|-----------|
| **Lite** | A（コスト特化） | Gemini 2.0 Flash-Lite ($0.30) | Gemini 2.0 Flash-Lite ($0.30) | 最安値 |
| **Lite** | B（バランス）⭐ | Gemini 2.0 Flash ($0.40) | Gemini 2.0 Flash ($0.40) | バランス |
| **Standard** | A（利益重視） | Gemini 2.0 Flash ($0.40) | Claude 3 Haiku ($1.25) | 中間 |
| **Standard** | B（品質重視）⭐ | Claude 3 Haiku ($1.25) | Gemini 2.0 Flash ($0.40) | 品質重視 |
| **Pro** | A（論理重視）⭐ | o3-mini ($4.40) | o3-mini ($4.40) | 高品質 |
| **Pro** | B（情緒重視） | Claude 3.5 Sonnet ($15.00) | Claude 3 Haiku ($1.25) | 高コスト |
| **Business** | A（最高峰）⭐ | o1 ($60.00) | Claude 3.5 Sonnet ($15.00) | 最高品質 |
| **Business** | B（推論特化） | Claude 3.5 Sonnet ($15.00) | o1 ($60.00) | 推論重視 |

### ハイブリッドクレジット用設定（`MODEL_CONFIG`）

| モード | 構成（Outline） | 執筆（Writing） | プロバイダー |
|-------|----------------|----------------|------------|
| **quality** | o3-mini | Claude 3.5 Sonnet | OpenAI |
| **speed** | Gemini 2.0 Flash | Gemini 2.0 Flash | Gemini |

---

## モデル変更時の注意事項

### 1. コストへの影響

- **Claude 3.5 Sonnet**: $15/1M tokens（高コスト）
- **o1**: $60/1M tokens（非常に高コスト）
- **Claude 3 Haiku**: $1.25/1M tokens（中コスト）
- **o3-mini**: $4.40/1M tokens（高品質）
- **Gemini 2.0 Flash**: $0.40/1M tokens（低コスト）

### 2. プロバイダーの互換性

- モデル名はプロバイダー固有（例: `gpt-4o-mini` はOpenAIのみ）
- `provider` フィールドとモデル名の整合性を確認

### 3. APIキーの設定

- 変更するプロバイダーのAPIキーを環境変数に設定
- `.env.local` ファイルを更新後、サーバー再起動が必要

### 4. データベース設定

- 管理者設定（`admin_ai_settings`テーブル）は別途管理
- `lib/ai-provider.ts` の変更はデフォルト設定のみに影響

---

## 参考資料

- [AI Provider セットアップガイド](AI_PROVIDER_SETUP.md)
- [管理者AI設定ガイド](ADMIN_AI_SETTINGS_GUIDE.md)
- [AIモデル選択機能実装レポート](AI_MODEL_SELECTION_IMPLEMENTATION_COMPLETE.md)

---

**最終更新**: 2026-01-XX  
**ステータス**: Claude API実装は未完了（設定のみ定義済み）
