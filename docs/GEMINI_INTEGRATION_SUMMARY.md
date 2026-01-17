# Gemini API 統合実装 - 変更サマリー

## 📋 実装内容

OpenAI と Google Gemini の両方に対応した AI Provider システムを実装しました。

---

## 🎯 変更されたファイル

### 1. 新規作成

#### `lib/ai-provider.ts`
- **AIプロバイダーの抽象化レイヤー**
- OpenAI と Gemini を統一的に扱うインターフェース
- フェーズ別のモデル選択機能（planning/writing）
- 自動フォールバック機能

### 2. 更新されたファイル

#### KDL API Routes (すべて新しいプロバイダーシステムに移行)

1. **`app/api/kdl/generate-title/route.ts`** (タイトル生成)
   - Planning フェーズ → コスト効率重視
   - OpenAI: `gpt-4o-mini` / Gemini: `gemini-1.5-flash`

2. **`app/api/kdl/generate-subtitle/route.ts`** (サブタイトル生成)
   - Planning フェーズ → コスト効率重視
   - OpenAI: `gpt-4o-mini` / Gemini: `gemini-1.5-flash`

3. **`app/api/kdl/generate-target/route.ts`** (ターゲット設定)
   - Planning フェーズ → コスト効率重視
   - OpenAI: `gpt-4o-mini` / Gemini: `gemini-1.5-flash`

4. **`app/api/kdl/generate-chapters/route.ts`** (目次生成)
   - Planning フェーズ → コスト効率重視
   - OpenAI: `gpt-4o-mini` / Gemini: `gemini-1.5-flash`

5. **`app/api/kdl/generate-section/route.ts`** (本文執筆)
   - Writing フェーズ → 品質重視
   - OpenAI: `gpt-4o-2024-08-06` / Gemini: `gemini-1.5-pro`

### 3. ドキュメント

#### `AI_PROVIDER_SETUP.md`
- 完全なセットアップガイド
- コスト比較表
- トラブルシューティング
- 環境変数の説明

---

## 🚀 使い方

### OpenAI を使用する場合

`.env.local` に以下を追加：

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
AI_PROVIDER=openai
```

### Gemini を使用する場合

`.env.local` に以下を追加：

```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
AI_PROVIDER=gemini
```

### 両方を設定（推奨）

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
AI_PROVIDER=openai  # 優先プロバイダー
```

---

## 💰 コスト比較

### Planning フェーズ（構成・思考）

| プロバイダー | モデル | コスト (per 1M tokens) | 節約率 |
|--------------|--------|------------------------|--------|
| OpenAI | gpt-4o-mini | $0.15 | 94% 削減 |
| Gemini | gemini-1.5-flash | $0.075 | **97% 削減** |
| ~~以前~~ | ~~gpt-4o~~ | ~~$2.50~~ | ~~基準~~ |

### Writing フェーズ（本文執筆）

| プロバイダー | モデル | コスト (per 1M tokens) | 品質 |
|--------------|--------|------------------------|------|
| OpenAI | gpt-4o-2024-08-06 | $2.50 | ⭐⭐⭐⭐⭐ |
| Gemini | gemini-1.5-pro | $1.25 | ⭐⭐⭐⭐⭐ |

**結論:** Gemini は OpenAI の約半分のコストで同等の品質を提供します。

---

## 🎨 アーキテクチャ

### 抽象化レイヤーの構造

```typescript
// 共通インターフェース
interface AIProvider {
  generate(request: AIGenerateRequest): Promise<AIGenerateResponse>;
  isAvailable(): boolean;
  getProviderName(): string;
}

// 実装
class OpenAIProvider implements AIProvider { ... }
class GeminiProvider implements AIProvider { ... }

// ファクトリー関数
function createAIProvider(options?: { ... }): AIProvider
function getProviderForPhase(phase: 'planning' | 'writing'): AIProvider
```

### フェーズ別モデル選択

```typescript
export const AI_MODELS = {
  // 思考・構成フェーズ（コスト重視）
  planning: {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-1.5-flash',
  },
  // 文章生成フェーズ（品質重視）
  writing: {
    openai: 'gpt-4o-2024-08-06',
    gemini: 'gemini-1.5-pro',
  },
};
```

### API ルートでの使用例

```typescript
// Before (直接 OpenAI を呼び出し)
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  response_format: { type: 'json_object' },
});

// After (抽象化レイヤー経由)
const provider = getProviderForPhase('planning');
const response = await provider.generate({
  messages: [...],
  responseFormat: 'json',
});
```

---

## ✅ テスト方法

### 1. OpenAI でテスト

```bash
# .env.local
OPENAI_API_KEY=your_key
AI_PROVIDER=openai
```

```bash
npm run dev
```

ブラウザで `http://localhost:3000/kindle/new` にアクセスして、タイトル生成をテスト。

### 2. Gemini でテスト

```bash
# .env.local
GEMINI_API_KEY=your_key
AI_PROVIDER=gemini
```

```bash
npm run dev
```

同様にタイトル生成をテスト。

### 3. デモモード（APIなし）

```bash
# .env.local
USE_MOCK_DATA=true
```

APIキーなしでモックデータを返すテスト。

---

## 🔧 カスタマイズ

### モデルを変更する

`lib/ai-provider.ts` を編集：

```typescript
export const AI_MODELS = {
  planning: {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-2.0-flash-exp',  // ← 新しいモデル
  },
  writing: {
    openai: 'gpt-4o',
    gemini: 'gemini-1.5-pro',
  },
};
```

### 特定のエンドポイントだけ変更する

例: タイトル生成だけ `gpt-4o` を使いたい場合

```typescript
// app/api/kdl/generate-title/route.ts
import { createAIProvider } from '@/lib/ai-provider';

// カスタムプロバイダーを作成
const provider = createAIProvider({
  preferProvider: 'openai',
  model: 'gpt-4o',  // 高品質モデルを指定
});
```

---

## 🐛 トラブルシューティング

### エラー: "No AI provider available"

**原因:** APIキーが設定されていません

**解決策:**
```bash
# いずれかを .env.local に追加
OPENAI_API_KEY=your_key
# または
GEMINI_API_KEY=your_key
```

サーバーを再起動：
```bash
npm run dev
```

### Gemini で JSON パースエラーが出る

**原因:** Gemini の JSON mode の動作が不安定な場合があります

**解決策:**
1. プロンプトに「必ずJSON形式で出力してください」を明示
2. OpenAI に切り替える
3. Gemini 1.5 Pro を試す

---

## 📊 実装の利点

### 1. コスト削減
- Planning フェーズで 94-97% のコスト削減
- Gemini 使用でさらに約 50% のコスト削減

### 2. 柔軟性
- プロバイダーを簡単に切り替え可能
- 環境変数だけで制御できる
- 新しいプロバイダーの追加が容易

### 3. 信頼性
- 自動フォールバック機能
- 片方のAPIが使えなくても継続稼働

### 4. 保守性
- 統一されたインターフェース
- API の変更に強い設計
- テストが容易

---

## 📝 今後の拡張案

### 1. Anthropic Claude の追加

```typescript
class AnthropicProvider implements AIProvider {
  async generate(request: AIGenerateRequest) {
    // Claude API の実装
  }
}
```

### 2. ローカル LLM の対応

```typescript
class LocalLLMProvider implements AIProvider {
  async generate(request: AIGenerateRequest) {
    // Ollama など
  }
}
```

### 3. キャッシュ機能

```typescript
class CachedAIProvider implements AIProvider {
  async generate(request: AIGenerateRequest) {
    // Redis などでキャッシュ
  }
}
```

---

## 🎉 まとめ

✅ OpenAI と Gemini の両方に対応  
✅ コストを最大 97% 削減（Planning フェーズ）  
✅ 品質を維持（Writing フェーズ）  
✅ 簡単に切り替え可能  
✅ 自動フォールバック  
✅ 拡張性の高い設計  

**詳細なセットアップ方法は `AI_PROVIDER_SETUP.md` をご覧ください。**

---

**作成日:** 2025年1月  
**バージョン:** 1.0.0

