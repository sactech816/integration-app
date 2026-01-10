# 管理者フラグ設定ガイド

## エラー修正内容

### 発生したエラー
```
Error: Failed to run sql query: ERROR: 42703: column "role" does not exist
```

### 原因
`user_roles`テーブルには`role`カラムが存在せず、`is_partner`カラムのみでした。

### 修正内容

✅ **`supabase_admin_ai_settings.sql`を更新しました**:

1. **`is_admin`カラムの追加**
   - `user_roles`テーブルに`is_admin BOOLEAN`カラムを自動追加
   - 既存データに影響なし（デフォルト`false`）

2. **RLSポリシーの修正**
   - `is_admin = true`または`is_partner = true`のユーザーが管理可能
   - 全ユーザーが読み取り可能（プラン設定の参照のため）

3. **管理者設定用ヘルパー関数の追加**
   - `set_admin_status(user_id, true/false)`関数を追加
   - Supabase Studioから簡単に管理者フラグを設定可能

## マイグレーション実行手順（修正版）

### Step 1: Supabase Studioにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択
3. 左サイドバーの **SQL Editor** をクリック

### Step 2: 修正されたSQLを実行

1. SQL Editorで **New query** をクリック
2. **修正された** `supabase_admin_ai_settings.sql` の内容を全てコピー＆ペースト
3. **Run** ボタン（または `Ctrl+Enter` / `Cmd+Enter`）を押して実行
4. 成功メッセージを確認:
   ```
   Success. No rows returned
   ```

### Step 3: 自分を管理者に設定

マイグレーション完了後、自分のユーザーIDを管理者に設定する必要があります。

#### 3-1. 自分のユーザーIDを確認

SQL Editorで以下を実行:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

自分のメールアドレスに対応する`id`をコピーします。

#### 3-2. 管理者フラグを設定

以下のクエリを実行（`あなたのユーザーID`を実際のIDに置き換える）:

```sql
SELECT set_admin_status('あなたのユーザーID'::UUID, true);
```

**例**:
```sql
SELECT set_admin_status('12345678-1234-1234-1234-123456789abc'::UUID, true);
```

成功すると`true`が返ります。

#### 3-3. 確認

```sql
SELECT user_id, is_admin, is_partner 
FROM user_roles 
WHERE user_id = 'あなたのユーザーID'::UUID;
```

`is_admin`が`true`になっていることを確認します。

### Step 4: アプリケーションで確認

1. アプリケーションをリロード
2. KDLページ（`/kindle`）にアクセス
3. 「プラン別AIモデル設定」セクションが表示されることを確認
4. プリセットA/Bを選択して保存できることを確認

## 権限の仕組み

### 管理者権限の種類

1. **`is_admin`**: システム全体の管理権限
   - AIモデル設定の変更
   - システム設定の管理
   - 今後の管理機能の追加

2. **`is_partner`**: パートナー権限
   - 既存のパートナー機能へのアクセス
   - 一部の管理機能（互換性のため）

### AIモデル設定の権限

`admin_ai_settings`テーブルへのアクセス:
- **読み取り**: 全ユーザー可能
- **更新・削除**: `is_admin = true`または`is_partner = true`のユーザーのみ

## トラブルシューティング

### エラー: `relation "user_roles" does not exist`

**原因**: `user_roles`テーブルがまだ作成されていません。

**対処法**:
1. `supabase_user_roles.sql`を先に実行してください
2. その後、`supabase_admin_ai_settings.sql`を実行

### エラー: `set_admin_status関数が見つからない`

**原因**: マイグレーションが完全に実行されていません。

**対処法**:
1. 再度`supabase_admin_ai_settings.sql`を実行
2. 関数が作成されたか確認:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'set_admin_status';
   ```

### 管理者に設定したのに権限がない

**原因**: アプリケーションのキャッシュまたはセッションの問題。

**対処法**:
1. ブラウザをリロード（`Ctrl+Shift+R` / `Cmd+Shift+R`）
2. ログアウト→ログイン
3. データベースで確認:
   ```sql
   SELECT * FROM user_roles WHERE user_id = auth.uid();
   ```

### 他のユーザーを管理者にしたい

同じ手順で`set_admin_status`関数を使用します:

```sql
-- ユーザーIDを確認
SELECT id, email FROM auth.users WHERE email = 'target@example.com';

-- 管理者に設定
SELECT set_admin_status('ユーザーID'::UUID, true);

-- 管理者権限を解除（必要な場合）
SELECT set_admin_status('ユーザーID'::UUID, false);
```

## セキュリティ上の注意

1. **管理者権限は慎重に付与してください**
   - AIモデル設定を変更すると、全ユーザーに影響します
   - 信頼できるユーザーにのみ付与してください

2. **定期的な監査**
   - 管理者一覧を確認:
     ```sql
     SELECT u.email, ur.is_admin, ur.is_partner, ur.updated_at
     FROM user_roles ur
     JOIN auth.users u ON ur.user_id = u.id
     WHERE is_admin = true OR is_partner = true;
     ```

3. **ログの確認**
   - `admin_ai_settings`テーブルの`updated_by`カラムで誰が変更したか追跡可能

## まとめ

✅ **修正完了した内容**:
- `user_roles`テーブルに`is_admin`カラムを追加
- RLSポリシーを`is_admin`および`is_partner`に対応
- 管理者設定用の`set_admin_status`関数を追加

✅ **実行が必要なアクション**:
1. 修正された`supabase_admin_ai_settings.sql`を実行
2. 自分のユーザーIDを確認
3. `set_admin_status`で自分を管理者に設定
4. アプリケーションで動作確認

---

**最終更新**: 2026-01-10  
**バージョン**: 1.1（エラー修正版）

