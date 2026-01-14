# モニターユーザー管理機能 - 実装ドキュメント

## 概要
管理者が特定のユーザーに対して、有料プランの機能を期間限定で開放できる「モニターユーザー機能」の実装ドキュメントです。

## 実装された機能

### 1. データベーススキーマ (`supabase_monitor_users.sql`)

#### テーブル: `monitor_users`
モニター権限を管理するためのテーブル

**カラム構成:**
- `id`: UUID (主キー)
- `user_id`: UUID (対象ユーザー、NOT NULL)
- `admin_user_id`: UUID (付与した管理者、NOT NULL)
- `monitor_plan_type`: TEXT (付与プラン: lite, standard, pro, business, enterprise)
- `monitor_start_at`: TIMESTAMPTZ (開始日時、デフォルト: NOW())
- `monitor_expires_at`: TIMESTAMPTZ (終了日時、NOT NULL)
- `is_active`: BOOLEAN (計算フィールド - 現在有効かどうか)
- `notes`: TEXT (管理者メモ、任意)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ (自動更新トリガー付き)

**制約:**
- 1ユーザーにつき1つのモニター権限のみ (UNIQUE制約)
- RLS (Row Level Security) 有効化
- 管理者のみ全操作可能、ユーザーは自分の情報のみ閲覧可能

#### RPC関数

**`get_user_plan_with_monitor(check_user_id UUID)`**
- モニター権限を優先してユーザーのプラン情報を取得
- 返り値: プランTier、モニター情報、クレジット上限など
- ロジック: モニター権限 → 通常サブスク → 無料プラン

**`check_ai_credit_limit(check_user_id UUID, credit_type TEXT)`**
- モニター対応版のAIクレジット制限チェック
- モニターユーザーにも適用される

### 2. バックエンドロジック

#### `lib/subscription.ts` の拡張

**`SubscriptionStatus` インターフェース拡張:**
```typescript
{
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
  planType: 'monthly' | 'yearly' | 'none';
  planTier: PlanTier;
  // 新規追加
  isMonitor?: boolean;           // モニターユーザーかどうか
  monitorExpiresAt?: string;     // モニター有効期限
  monitorSource?: 'subscription' | 'monitor' | 'none'; // プラン取得元
}
```

**`getSubscriptionStatus(userId: string)` 関数の修正:**
1. まずモニター権限をチェック (有効期限内)
2. モニター権限がある場合はそれを優先
3. ない場合は通常のサブスクリプションをチェック
4. どちらもない場合は無料プラン

### 3. 管理画面API (`app/api/admin/monitor-users/route.ts`)

#### エンドポイント

**GET `/api/admin/monitor-users`**
- パラメータ:
  - `adminUserId`: 管理者のユーザーID (必須)
  - `showExpired`: 期限切れも表示 (オプション、デフォルト: false)
- レスポンス: モニターユーザー一覧 + ユーザー情報

**POST `/api/admin/monitor-users`**
- ボディ:
  ```json
  {
    "adminUserId": "管理者UUID",
    "userEmail": "対象ユーザーのEmail",
    "userId": "対象ユーザーのUUID (Emailと排他)",
    "monitorPlanType": "lite|standard|pro|business|enterprise",
    "durationDays": 30,
    "notes": "管理者メモ (任意)"
  }
  ```
- 動作:
  - 既存のモニター権限がある場合は更新
  - ない場合は新規追加

**DELETE `/api/admin/monitor-users`**
- パラメータ:
  - `adminUserId`: 管理者のユーザーID (必須)
  - `monitorId`: モニター権限のID (必須)
- 動作: モニター権限を強制削除

### 4. 管理画面UI (`components/shared/MonitorUsersManager.tsx`)

#### 機能
1. **モニター一覧表示**
   - 有効なモニターユーザーを表示
   - 期限切れも表示可能 (チェックボックス)
   - メールアドレスで検索

2. **モニター追加フォーム**
   - ユーザーのEmail入力
   - プラン選択 (Lite～Enterprise)
   - 有効期間 (1～365日)
   - 管理者メモ

3. **モニター削除**
   - 各モニターに削除ボタン
   - 確認ダイアログ表示

4. **統計表示**
   - 有効なモニター数
   - 7日以内に期限切れになるモニター数
   - 期限切れモニター数

5. **視覚的な警告**
   - 期限切れ: グレー表示
   - 7日以内に期限切れ: 黄色背景
   - 有効: 通常表示

### 5. ユーザーダッシュボード通知 (`components/shared/MonitorNoticeBanner.tsx`)

#### 表示内容
- モニター権限が付与されている場合のみ表示
- 現在のプラン名
- 有効期限
- 残り日数
- 期限切れ間近の警告 (7日以内)
- 継続利用の案内

#### 視覚的な特徴
- 通常時: 紫系のグラデーション
- 期限間近: 黄色/オレンジ系のグラデーション
- 閉じるボタン付き (セッション内で非表示)

## 使用方法

### 管理者側

1. **管理画面にモニター管理UIを追加**
   ```tsx
   import MonitorUsersManager from '@/components/shared/MonitorUsersManager';
   
   // KDL管理セクション内で使用
   <MonitorUsersManager 
     adminUserId={adminUser.id} 
     adminEmail={adminUser.email} 
   />
   ```

2. **モニターユーザーを追加**
   - 「モニター追加」ボタンをクリック
   - フォームに情報を入力
   - 「追加する」をクリック

3. **モニターユーザーを削除**
   - 一覧から対象ユーザーの「削除」ボタンをクリック
   - 確認ダイアログで「OK」

### ユーザー側

1. **ダッシュボードに通知バナーを追加**
   ```tsx
   import MonitorNoticeBanner from '@/components/shared/MonitorNoticeBanner';
   
   // ダッシュボードの上部で使用
   <MonitorNoticeBanner userId={user.id} />
   ```

2. **モニター権限の確認**
   - 自動的にバナーが表示される
   - プラン情報、有効期限、残り日数が確認できる

## データベースマイグレーション手順

1. **Supabase SQLエディタで実行**
   ```sql
   -- supabase_monitor_users.sql の内容を実行
   ```

2. **実行順序**
   - 既存のテーブル (`subscriptions`, `auth.users`, `user_roles`) が必要
   - `check_ai_credit_limit` と `get_user_plan_with_monitor` 関数を上書き

3. **確認**
   ```sql
   -- テーブル確認
   SELECT * FROM monitor_users LIMIT 10;
   
   -- RPC関数確認
   SELECT * FROM get_user_plan_with_monitor('ユーザーUUID');
   ```

## セキュリティ考慮事項

1. **RLS (Row Level Security)**
   - 管理者のみが全操作可能
   - ユーザーは自分の情報のみ閲覧可能

2. **API権限チェック**
   - 全エンドポイントで管理者権限を確認
   - `user_roles` テーブルで判定

3. **入力バリデーション**
   - プランタイプの制限 (CHECK制約)
   - 期間の制限 (1～365日)
   - Email形式の検証

## プラン判定の優先順位

```
1. モニター権限 (有効期限内)
   ↓ なし
2. 正規の有料サブスクリプション
   ↓ なし
3. 無料プラン (デフォルト)
```

## 注意事項

1. **1ユーザーにつき1つのモニター権限**
   - UNIQUE制約により、同時に複数のモニター権限は付与できない
   - 既存のモニター権限がある場合は更新される

2. **有効期限の自動判定**
   - `is_active` は計算フィールドで自動更新
   - バックエンドでも期限をチェック

3. **既存サブスクとの関係**
   - モニター権限が優先される
   - 正規サブスクがある場合でも、モニター権限が優先

4. **期限切れ後の動作**
   - 自動的に無料プランに戻る
   - データは保持される (削除されない)

## トラブルシューティング

### モニター権限が反映されない
- `get_user_plan_with_monitor` 関数が正しく実行されているか確認
- `monitor_expires_at` が未来日時になっているか確認
- キャッシュをクリアして再ログイン

### 管理画面でエラーが出る
- 管理者権限 (`user_roles` テーブル) を確認
- `SUPABASE_SERVICE_ROLE_KEY` の設定を確認

### 通知バナーが表示されない
- `getSubscriptionStatus` が正しく動作しているか確認
- ブラウザのコンソールでエラーをチェック

## 今後の拡張可能性

1. **モニター履歴の記録**
   - 過去のモニター権限を記録するテーブル

2. **自動延長機能**
   - 条件付きで自動延長

3. **通知機能**
   - 期限間近のメール通知
   - 期限切れ通知

4. **統計ダッシュボード**
   - モニターユーザーの利用状況
   - AI使用量の分析

5. **バルク操作**
   - CSV一括登録
   - 一括延長/削除

## ファイル構成まとめ

```
プロジェクトルート/
├── supabase_monitor_users.sql          # DBスキーマ
├── lib/
│   └── subscription.ts                 # プラン判定ロジック (拡張)
├── app/
│   └── api/
│       └── admin/
│           └── monitor-users/
│               └── route.ts            # 管理API
└── components/
    └── shared/
        ├── MonitorUsersManager.tsx     # 管理画面UI
        └── MonitorNoticeBanner.tsx     # ユーザー通知バナー
```

## まとめ

この実装により、管理者は柔軟にモニターユーザーを管理し、期間限定で有料プラン機能を開放できるようになりました。ユーザー側にも分かりやすい通知が表示され、透明性の高い運用が可能です。










