# データベースマイグレーション実行ガイド

## 概要

プラン別AIモデル設定機能を有効化するには、以下のSQLマイグレーションファイルをSupabase Studioで実行する必要があります。

## 必要なマイグレーションファイル

### 1. ハイブリッドAIクレジットシステム
**ファイル**: `supabase_hybrid_ai_credits.sql`

**内容**:
- `subscriptions`テーブルに以下のカラムを追加:
  - `plan_tier`: プランTier（lite/standard/pro/business）
  - `premium_credits_daily`: 日次プレミアムクレジット上限
  - `standard_credits_daily`: 日次スタンダードクレジット上限
- `ai_usage_logs`テーブルに以下のカラムを追加:
  - `usage_type`: 使用タイプ（premium/standard）
- RPC関数:
  - `check_ai_credit_limit`: クレジット上限チェック
  - `log_ai_credit_usage`: 使用ログ記録

### 2. 管理者用AIモデル設定
**ファイル**: `supabase_admin_ai_settings.sql`

**内容**:
- `admin_ai_settings`テーブル作成:
  - プラン別のデフォルトAIモデルプリセット（A/B）を管理
  - 各プランのデフォルト設定を自動挿入
- RPC関数:
  - `get_ai_setting_for_plan`: プラン設定取得
  - `update_ai_setting`: 設定更新（管理者のみ）
- RLSポリシー:
  - 全ユーザー読み取り可能
  - 管理者のみ更新可能

## 実行手順

### Step 1: Supabase Studioにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択
3. 左サイドバーの **SQL Editor** をクリック

### Step 2: ハイブリッドAIクレジットシステムのマイグレーション実行

1. SQL Editorで **New query** をクリック
2. `supabase_hybrid_ai_credits.sql`の内容を全てコピー＆ペースト
3. **Run** ボタン（または `Ctrl+Enter` / `Cmd+Enter`）を押して実行
4. 成功メッセージを確認:
   ```
   Success. No rows returned
   ```

### Step 3: 管理者用AIモデル設定のマイグレーション実行

1. SQL Editorで再度 **New query** をクリック
2. **修正された** `supabase_admin_ai_settings.sql`の内容を全てコピー＆ペースト
   - ⚠️ 最新版を使用してください（`is_admin`カラム追加対応版）
3. **Run** ボタンを押して実行
4. 成功メッセージを確認

### Step 4: 自分を管理者に設定

マイグレーション完了後、自分のユーザーを管理者に設定する必要があります。

#### 4-1. 自分のユーザーIDを確認

SQL Editorで以下を実行:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

自分のメールアドレスに対応する`id`（UUID形式）をコピーします。

#### 4-2. 管理者フラグを設定

以下のクエリを実行（`あなたのユーザーID`を実際のIDに置き換える）:

```sql
SELECT set_admin_status('あなたのユーザーID'::UUID, true);
```

**例**:
```sql
SELECT set_admin_status('12345678-1234-1234-1234-123456789abc'::UUID, true);
```

成功すると`true`が返ります。

#### 4-3. 確認

```sql
SELECT user_id, is_admin, is_partner 
FROM user_roles 
WHERE user_id = 'あなたのユーザーID'::UUID;
```

`is_admin`が`true`になっていることを確認します。

### Step 5: 動作確認

1. アプリケーションをリロード
2. 管理者としてログイン
3. **KDL書籍管理ページ**にアクセス
4. 「プラン別AIモデル設定」セクションが表示されることを確認
5. 各プランのプリセットA/Bが表示されることを確認

## トラブルシューティング

### エラー: `column "role" does not exist`

**原因**: 旧バージョンの`supabase_admin_ai_settings.sql`を使用しています。

**対処法**:
1. **修正された最新版**の`supabase_admin_ai_settings.sql`を使用してください
2. 最新版では以下の対応済みです:
   - `user_roles`テーブルに`is_admin`カラムを自動追加
   - RLSポリシーを`is_admin`および`is_partner`に対応
3. 詳細は`ADMIN_FLAG_SETUP_GUIDE.md`を参照

### エラー: `column "plan_tier" does not exist`

**原因**: マイグレーションが途中で失敗した可能性があります。

**対処法**:
1. SQL Editorで以下のクエリを実行してテーブル状態を確認:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'subscriptions';
   ```
2. `plan_tier`カラムが存在しない場合、再度マイグレーションを実行
3. それでも失敗する場合、以下を実行してから再試行:
   ```sql
   ROLLBACK;
   ```

### エラー: `relation "admin_ai_settings" does not exist`

**原因**: `supabase_admin_ai_settings.sql`が未実行です。

**対処法**:
- Step 3を実行してください。

### 警告: 「マイグレーションが必要です」アラートが表示される

**原因**: `admin_ai_settings`テーブルが存在しません。

**対処法**:
- Step 3を実行してください。
- 実行後、ページをリロードしてアラートが消えることを確認。

### 設定が保存できない

**原因**: RPC関数が正しく作成されていない可能性があります。

**対処法**:
1. SQL Editorで関数の存在を確認:
   ```sql
   SELECT proname 
   FROM pg_proc 
   WHERE proname IN ('update_ai_setting', 'get_ai_setting_for_plan');
   ```
2. 関数が存在しない場合、再度マイグレーションを実行。

## データベーススキーマ確認コマンド

マイグレーション後、以下のクエリで正しく適用されたか確認できます:

```sql
-- 1. subscriptionsテーブルのカラム確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 2. admin_ai_settingsテーブルの確認
SELECT * FROM admin_ai_settings;

-- 3. RPC関数の確認
SELECT proname, prosrc
FROM pg_proc
WHERE proname LIKE '%ai%setting%';
```

## 既存データへの影響

### subscriptionsテーブル
- 既存のサブスクリプションレコードに対して、`plan_tier`が自動設定されます
- `premium_credits_daily`と`standard_credits_daily`がプランに応じて自動設定されます
- **データの損失はありません**

### admin_ai_settingsテーブル
- 新規テーブルのため、既存データへの影響はありません
- デフォルト設定（各プラン`presetB`選択）が自動挿入されます

## マイグレーション完了後の次のステップ

1. ✅ KDL書籍管理ページで「プラン別AIモデル設定」が表示される
2. ✅ 各プランのプリセットA/Bを選択できる
3. ✅ 保存ボタンが機能する
4. 📝 ユーザー向けダッシュボードにAIモード選択を統合（手動対応必要）
5. 📝 Kindleエディタページにモード選択を統合（手動対応必要）
6. 📝 LP（ランディングページ）の料金説明を更新（手動対応必要）

## サポート

マイグレーション実行で問題が発生した場合:
1. エラーメッセージ全文をコピー
2. 実行したSQLクエリを確認
3. データベースログ（Supabase Dashboard > Logs）を確認
4. 上記トラブルシューティングを参照

---

**最終更新**: 2026-01-10
**バージョン**: 1.0

