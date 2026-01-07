# AI Provider セットアップガイド

このアプリケーションは、OpenAI と Google Gemini の両方のAIプロバイダーに対応しています。

## 📋 目次

1. [概要](#概要)
2. [セットアップ手順](#セットアップ手順)
3. [環境変数の設定](#環境変数の設定)
4. [コスト比較](#コスト比較)
5. [モデル選択](#モデル選択)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### サポートされているプロバイダー

- **OpenAI** - GPT-4o, GPT-4o-mini
- **Google Gemini** - Gemini 1.5 Pro, Gemini 1.5 Flash

### フェーズ別の最適化

アプリケーションは、処理内容に応じて2つのフェーズで異なるモデルを使用します：

#### 1. Planning フェーズ（思考・構成）
- タイトル生成
- サブタイトル生成
- ターゲット設定
- 目次生成

**推奨モデル:**
- OpenAI: `gpt-4o-mini` (コスト効率重視)
- Gemini: `gemini-1.5-flash` (高速・低コスト)

#### 2. Writing フェーズ（文章生成）
- 本文執筆

**推奨モデル:**
- OpenAI: `gpt-4o-2024-08-06` (品質重視)
- Gemini: `gemini-1.5-pro` (高品質)

---

## セットアップ手順

### Option 1: OpenAI を使用する場合

1. **APIキーの取得**
   - [OpenAI Platform](https://platform.openai.com/api-keys) にアクセス
   - 新しいAPIキーを作成

2. **環境変数の設定**
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   AI_PROVIDER=openai
   ```

3. **完了！**
   - アプリケーションが自動的にOpenAIを使用します

### Option 2: Google Gemini を使用する場合

1. **APIキーの取得**
   - [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
   - 新しいAPIキーを作成

2. **環境変数の設定**
   ```bash
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
   AI_PROVIDER=gemini
   ```

3. **完了！**
   - アプリケーションが自動的にGeminiを使用します

### Option 3: 両方を設定（推奨）

両方のAPIキーを設定しておくと、片方が利用できない場合に自動的にフォールバックします。

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
AI_PROVIDER=openai  # 優先するプロバイダー
```

---

## 環境変数の設定

### 必須の環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `OPENAI_API_KEY` | OpenAI APIキー（OpenAI使用時） | `sk-proj-xxx...` |
| `GEMINI_API_KEY` | Gemini APIキー（Gemini使用時） | `AIzaSyxxx...` |

### オプションの環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `AI_PROVIDER` | 優先するプロバイダー | `openai` |
| `GEMINI_MODEL` | Geminiのモデル名（上級者向け） | `gemini-1.5-flash` |
| `USE_MOCK_DATA` | デモモード（APIなしでテスト） | `false` |

### .env ファイルの例

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# OpenAI を使用する場合
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
AI_PROVIDER=openai

# または Gemini を使用する場合
# GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
# AI_PROVIDER=gemini

# その他の設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## コスト比較

### OpenAI の料金（2025年1月現在）

| モデル | Input (per 1M tokens) | Output (per 1M tokens) | 用途 |
|--------|----------------------|------------------------|------|
| gpt-4o | $2.50 | $10.00 | 高品質な文章生成 |
| gpt-4o-mini | $0.15 | $0.60 | 構成・思考フェーズ |

### Google Gemini の料金（2025年1月現在）

| モデル | Input (per 1M tokens) | Output (per 1M tokens) | 用途 |
|--------|----------------------|------------------------|------|
| Gemini 1.5 Pro | $1.25 | $5.00 | 高品質な文章生成 |
| Gemini 1.5 Flash | $0.075 | $0.30 | 構成・思考フェーズ |

### コスト削減のポイント

1. **Planning フェーズは低コストモデル**
   - OpenAI: gpt-4o-mini（約 15分の1のコスト）
   - Gemini: gemini-1.5-flash（約 20分の1のコスト）

2. **Writing フェーズは高品質モデル**
   - 文章の品質が重要なため、コストよりも品質を優先

3. **Gemini は全体的に低コスト**
   - OpenAI の約半分のコスト
   - 日本語の品質も優秀

---

## モデル選択

### 推奨設定

```typescript
// lib/ai-provider.ts で自動的に設定されます
export const AI_MODELS = {
  planning: {
    openai: 'gpt-4o-mini',        // $0.15/1M tokens
    gemini: 'gemini-1.5-flash',   // $0.075/1M tokens
  },
  writing: {
    openai: 'gpt-4o-2024-08-06',  // $2.50/1M tokens
    gemini: 'gemini-1.5-pro',      // $1.25/1M tokens
  },
};
```

### カスタマイズ方法

特定のモデルを使いたい場合は、`lib/ai-provider.ts` を編集してください。

```typescript
// 例: すべてのフェーズでgpt-4o-miniを使用（最大限のコスト削減）
export const AI_MODELS = {
  planning: {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-1.5-flash',
  },
  writing: {
    openai: 'gpt-4o-mini',  // ← 変更
    gemini: 'gemini-1.5-flash',  // ← 変更
  },
};
```

---

## トラブルシューティング

### エラー: "No AI provider available"

**原因:** APIキーが設定されていません

**解決策:**
1. `.env.local` ファイルを確認
2. `OPENAI_API_KEY` または `GEMINI_API_KEY` を設定
3. サーバーを再起動

```bash
npm run dev
```

### エラー: "OpenAI returned empty response"

**原因:** 
- APIキーが無効
- クォータ（利用枠）を超過
- ネットワークエラー

**解決策:**
1. APIキーが正しいか確認
2. OpenAI の[利用状況ページ](https://platform.openai.com/usage)を確認
3. 別のプロバイダーを試す（Geminiなど）

### Gemini で日本語の品質が低い場合

**解決策:**
- `gemini-1.5-flash` から `gemini-1.5-pro` に変更
- プロンプトに「日本語で自然な表現を使用してください」を追加

### コストを最小限に抑えたい

**推奨設定:**

```bash
# .env.local
GEMINI_API_KEY=your_key_here
AI_PROVIDER=gemini
```

Gemini 1.5 Flash は OpenAI gpt-4o-mini よりもさらに低コストです。

### デモモード（APIなしでテスト）

開発中やデモ環境では、APIキーなしで動作させることができます：

```bash
USE_MOCK_DATA=true
```

この設定により、モックデータが返され、API料金が発生しません。

---

## まとめ

### 推奨構成

**本番環境（品質重視）:**
```bash
OPENAI_API_KEY=your_key
AI_PROVIDER=openai
```

**本番環境（コスト重視）:**
```bash
GEMINI_API_KEY=your_key
AI_PROVIDER=gemini
```

**開発環境:**
```bash
USE_MOCK_DATA=true
```

---

## サポート

問題が発生した場合は、以下をご確認ください：

1. [OpenAI APIドキュメント](https://platform.openai.com/docs)
2. [Google AI Studio](https://ai.google.dev/docs)
3. プロジェクトの GitHub Issues

---

**最終更新:** 2025年1月





















