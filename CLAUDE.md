# CLAUDE.md — 集客メーカー リポジトリ向け Claude Code 設定

## 目的 / ドメイン
- 「集客メーカー」— 診断クイズ・プロフィールLP・ビジネスLP・Kindle出版メーカーなどを統合した集客プラットフォーム
- 日本語ユーザー向けの教育・ビジネス支援 Web アプリケーション
- デプロイ先: Vercel（makers.tokyo）

## 技術スタック
- **フレームワーク**: Next.js 16 (App Router) / React 19 / TypeScript 5
- **スタイリング**: Tailwind CSS v4（ゼロコンフィグ、`@import "tailwindcss"` 方式）
- **DB / 認証**: Supabase（@supabase/ssr でCookieベース認証）
- **決済**: Stripe / UnivaPaycallback
- **AI**: Anthropic SDK / OpenAI SDK / Google GenAI
- **リッチテキスト**: Tiptap エディタ
- **メール**: Resend
- **その他**: Recharts（グラフ）、QRCode、Puppeteer（PDF生成）、Lucide React（アイコン）

## ディレクトリ構成
```
app/              — Next.js App Router ページ・API Routes
  api/            — Route Handlers（generate-quiz, kdl, stripe, etc.）
  kindle/         — Kindle出版メーカー機能
  quiz/           — 診断クイズ機能
  profile/        — プロフィールLP機能
  business/       — ビジネスLP機能
  dashboard/      — ダッシュボード
  gamification/   — ガミフィケーション機能
components/       — 機能別コンポーネント（kindle/, quiz/, shared/ 等）
lib/              — ユーティリティ、Supabaseクライアント、AI プロバイダ、ビジネスロジック
types/            — TypeScript 型定義
supabase/         — マイグレーション・設定
public/           — 静的ファイル
```

## コーディング規約
- TypeScript で記述（tsconfig: strict: false だが、型定義は積極的に活用）
- `any` 型の乱用禁止 — 適切な型を定義する
- パスエイリアス: `@/*` でプロジェクトルートを参照（例: `@/lib/supabase`）
- 命名規則: camelCase（関数/変数）、PascalCase（コンポーネント/型）
- コンポーネントファイル: PascalCase（例: `EditorLayout.tsx`）
- フォント: Noto Sans JP（日本語）、JetBrains Mono（コード）

## Tailwind CSS v4 ルール
- `tailwind.config.js` は作成しない（v4はゼロコンフィグ）
- `@tailwind` ディレクティブは使わない — `@import "tailwindcss"` を使用
- カスタムカラーは `globals.css` の `@theme inline` で定義
- 個別 CSS での色定義は避け、Tailwind ユーティリティクラスのみ使用
- 詳細: `.claude/tailwind_document.md` 参照

## デザインシステム（概要）
Apple HIG ベースのデザイン哲学。ブランドカラーは青（blue-500〜800）。

### 配色の要点
- プライマリ: blue-500（アクション）→ blue-600（ホバー）→ blue-700/800（テキスト）
- テキスト: gray-900（メイン）、gray-700（サブ）、gray-600（キャプション）
- 白背景のテキストは gray-700 以上、青テキストは blue-700 以上
- システムカラー: green-600（成功）、amber-600（警告）、red-600（エラー）

### コンポーネントの要点
- ボタン: 必ず影を付与、最小タッチターゲット 44px、font-semibold 以上
- カード: bg-white + border border-gray-300 + shadow-md + rounded-2xl
- 入力フィールド: border border-gray-300 + 最小高さ h-12 + **必ず `text-gray-900` を指定**
- placeholder: `placeholder:text-gray-400` を使用（gray-500 も可）
- トランジション: transition-all duration-200 ease-in-out

### 入力フィールドの文字色ルール（重要）
入力項目の文字が薄くなる問題が頻発するため、以下を厳守:
- input / textarea / select には必ず `text-gray-900` を明示的に指定する
- ブラウザのデフォルトや継承に頼らない（環境により薄い色になるため）
- placeholder には `placeholder:text-gray-400` を使用し、入力値との区別を明確にする
- 標準的な入力フィールドのクラス例:
  `className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"`
- 詳細: `.claude/design_system.md` 参照

### 禁止事項（デザイン）
- 薄すぎる色（コントラスト不足）、同色系の重複（青背景に青ボタン等）
- 影のないインタラクティブ要素
- 44px 未満のタッチターゲット

## Supabase パターン
- クライアント: `lib/supabase.ts`（@supabase/ssr の createBrowserClient）
- テーブル名定数: `TABLES` オブジェクト（`lib/supabase.ts` 内）
- サーバーサイド操作: Service Role Key で RLS バイパス
- 詳細: `.claude/supabase_document.md` 参照

## ダッシュボード ツール追加ルール
新しいツールをダッシュボードに追加する際は、以下のファイルを必ず更新すること:

1. **`app/dashboard/components/Sidebar/menuItems.ts`** — `TOOL_ITEMS` 配列にツールを追加（`category` 必須: `'page'` | `'quiz'` | `'writing'` | `'marketing'` | `'monetization'`）
2. **`app/dashboard/components/Sidebar/SidebarNav.tsx`** — `contentCounts` 型にツールのカウント用キーを追加
3. **`app/dashboard/components/Sidebar/index.tsx`** — `contentCounts` 型に同じキーを追加
4. **`app/dashboard/hooks/useDashboardData.ts`** — `contentCounts` の型・初期値・`fetchAllContentCounts` のクエリに追加
5. **`app/dashboard/components/MainContent/index.tsx`** — `ActiveView` 型にビュー名追加、コンテンツ表示の条件分岐追加、デフォルトビュー除外リストに追加
6. **`app/dashboard/page.tsx`** — URLパラメータのビューリストに追加（必要なら handleMenuItemClick にハンドラ追加）

### カテゴリ構成
- **LP・ページ作成** (`page`): プロフィール、LP、ウェビナーLP、ガイドメーカー、ホームページメーカー
- **診断・クイズ** (`quiz`): 診断クイズ、エンタメ診断
- **ライティング・制作** (`writing`): セールスライター、サムネイル、SNS投稿、Kindle体験版、ネタ発掘
- **集客・イベント** (`marketing`): 予約、出欠、アンケート、メルマガ、ファネル
- **収益化・販売** (`monetization`): 申し込みフォーム、ゲーミフィケーション、スキルマーケット、アフィリエイト

### ツール間連携（コンテンツリンク）
新しいツールが**公開URLを持つ**場合、ツール間連携システムへの追加を検討すること。
ユーザーに「他のツールとの相互リンク機能を追加しますか？」と確認する。

追加する場合の更新ファイル:
1. **`lib/content-links.ts`** — `LinkableContentType` に型追加、`LINKABLE_TOOLS` 配列にエントリ追加（手順コメント参照）
2. **`app/api/user-contents/route.ts`** — 該当テーブルのクエリを追加
3. **`components/shared/ContentLinker.tsx`** — `ICON_MAP` にアイコン追加
4. **`components/shared/LinkedContentCard.tsx`** — `ICON_MAP` にアイコン追加
5. **`app/api/funnel/user-contents/route.ts`** — キー名変換が必要なら `keyMapping` に追加

関連共有コンポーネント:
- `ContentLinker` — モーダル付きコンテンツ選択UI（カテゴリタブ・検索付き）
- `LinkedContentCard` — リンク済みコンテンツの表示カード（URLコピー・削除付き）
- `useUserContents` Hook — ユーザーのコンテンツ一括取得（`lib/hooks/useUserContents.ts`）

### Pro/課金制限がある場合
- `menuItems.ts` の `ToolItem` にはアクセス制限フラグを持たせない（サイドバー側で判定）
- `SidebarNav.tsx` で `isDisabled` / `disabledBadge` を設定
- `page.tsx` の `handleMenuItemClick` でアクセスチェック（リダイレクト or モーダル表示）

## 禁止事項 / 注意点
- `any` 型の乱用禁止
- 大きなファイルのインライン化は避ける
- 環境変数（APIキー等）をコードにハードコードしない
- `tailwind.config.js` を作成しない（v4 では不要）
- middleware.ts は Kindle アクセス制御を担当 — 変更時は影響範囲に注意

## 開発コマンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint 実行
```

## 更新ポリシー
- この CLAUDE.md はリポジトリと同じように変更・バージョン管理する
- AI が間違った動作をしたらここに反映し、次回以降に活かす
