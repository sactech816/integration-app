# ダッシュボード仕様書

## 概要

ダッシュボード（マイページ）は、ユーザーが作成した診断クイズを管理し、アクセス解析やPro機能（HTMLダウンロード・埋め込み・リード取得）を利用するための主要ページです。管理者向けにはお知らせ管理機能も提供されます。

## 関連ファイル一覧

### フロントエンドファイル

1. **`app/dashboard/page.jsx`**
   - ダッシュボードページのエントリーポイント
   - `app/page.jsx`のAppコンポーネントをラッパーとして使用
   - ブラウザのリロードや直接URLアクセスに対応

2. **`components/Dashboard.jsx`**
   - ダッシュボードのメインコンポーネント（約969行）
   - すべてのダッシュボード機能を実装

3. **`app/page.jsx`**
   - メインのページコンポーネント
   - ダッシュボードコンポーネントを呼び出して表示（834-843行目）
   - ルーティング処理を含む

### APIファイル

4. **`app/api/checkout/route.js`**
   - Stripe決済セッション作成API
   - Pro機能開放のための決済処理
   - 成功時: `/?payment=success&session_id={CHECKOUT_SESSION_ID}&quiz_id={quizId}&redirect=dashboard`

5. **`app/api/verify/route.js`**
   - 決済検証API（POST）
   - Stripeのセッションを確認し、購入履歴を`purchases`テーブルに記録
   - サービスロールキーを使用してSupabaseにアクセス

### データベーススキーマ

6. **`supabase_purchases_schema.sql`**
   - `purchases`テーブルのスキーマ定義
   - 購入履歴を記録するテーブル

7. **`supabase_announcements_schema.sql`**
   - `announcements`テーブルのスキーマ定義
   - お知らせ管理用テーブル

### ユーティリティファイル

8. **`lib/htmlGenerator.js`**
   - HTMLダウンロード機能で使用
   - `generateQuizHTML()`関数を提供

9. **`lib/utils.js`**
   - `generateSlug()`関数（クイズ複製時に使用）
   - `calculateResult()`関数（診断結果計算）

10. **`lib/supabase.js`**
    - Supabaseクライアントの設定

11. **`lib/constants.js`**
    - 管理者メールアドレスなどの定数定義

### その他関連コンポーネント

12. **`components/Header.jsx`**
    - ダッシュボードへのナビゲーションボタンを含む

13. **`components/Footer.jsx`**
    - ダッシュボードへのリンクを含む

14. **`components/Portal.jsx`**
    - ダッシュボードへの遷移リンクを含む

## 主要機能仕様

### 1. ユーザー情報表示

- **表示内容:**
  - ユーザーのメールアドレス
  - 管理者バッジ（`isAdmin`がtrueの場合）
  - 作成したクイズ数
  - 総PV数（全クイズの閲覧数の合計）

- **実装箇所:** `components/Dashboard.jsx` 498-518行目

### 2. アクセス解析

#### 2.1 グラフ表示モード

- **データ:** 各クイズの閲覧数（views_count）、完了数（completions_count）、クリック数（clicks_count）
- **ライブラリ:** Recharts (`BarChart`コンポーネント)
- **実装箇所:** `components/Dashboard.jsx` 546-560行目

#### 2.2 テーブル表示モード

- **表示項目:**
  - タイトル
  - 閲覧数
  - 完了数
  - 完了率（%）
  - クリック数
  - CTR（%）

- **実装箇所:** `components/Dashboard.jsx` 562-592行目

#### 2.3 表示モード切り替え

- グラフ/テーブル表示をトグルボタンで切り替え
- **実装箇所:** `components/Dashboard.jsx` 539-542行目

### 3. クイズ管理

#### 3.1 クイズ一覧表示

- **ページネーション:** 1ページあたり9件（`QUIZZES_PER_PAGE = 9`）
- **表示順序:** 作成日の降順（最新が上）
- **管理者モード:** 管理者は全ユーザーのクイズを表示
- **一般ユーザー:** 自分のクイズのみ表示

- **実装箇所:**
  - クイズ取得: `components/Dashboard.jsx` 44-53行目
  - ページネーション: `components/Dashboard.jsx` 417-421行目
  - 一覧表示: `components/Dashboard.jsx` 863-951行目

#### 3.2 各クイズカードの表示項目

- クイズのサムネイル画像
- タイトル
- レイアウトタイプ（Chat/Card）
- リード収集機能の有無
- 閲覧数・クリック数
- クイズのURL（コピー可能）
- 操作ボタン（編集、複製、削除、埋め込み、リードダウンロード、HTMLダウンロード、機能開放/寄付）

#### 3.3 クイズ操作機能

##### 編集
- `onEdit(quiz)`を呼び出してエディタページに遷移

##### 複製
- `handleDuplicate()`関数でクイズを複製
- 新しいslugを生成してデータベースに挿入
- **実装箇所:** `components/Dashboard.jsx` 284-309行目

##### 削除
- `handleDeleteWithRefresh()`関数で削除実行
- 削除後にクイズリストを再取得
- **実装箇所:** `components/Dashboard.jsx` 56-68行目

##### URLコピー
- クイズの公開URLをクリップボードにコピー
- 形式: `${window.location.origin}?id=${quiz.slug || quiz.id}`
- **実装箇所:** `components/Dashboard.jsx` 894-913行目

### 4. Pro機能（有料機能）

#### 4.1 機能開放の判定

- **アンロック条件:**
  - 購入済み（`purchases`テーブルに該当クイズの記録がある）
  - 管理者（`isAdmin === true`）

- **実装箇所:** `components/Dashboard.jsx` 866行目

#### 4.2 HTMLダウンロード

- **機能:** クイズを単独のHTMLファイルとしてダウンロード
- **実装:** `generateQuizHTML()`関数を使用
- **実装箇所:** `components/Dashboard.jsx` 246-257行目、935-937行目

#### 4.3 埋め込みコード生成

- **機能:** WordPressなどのサイトに埋め込むためのiframeコードを生成
- **形式:** `<iframe src="${url}" width="100%" height="600" ...></iframe>`
- **実装箇所:** `components/Dashboard.jsx` 259-265行目、920-922行目

#### 4.4 リード（メールアドレス）ダウンロード

- **機能:** `quiz_leads`テーブルからメールアドレスと登録日時をCSV形式でダウンロード
- **条件:** `quiz.collect_email === true`のクイズのみ
- **実装箇所:** `components/Dashboard.jsx` 267-282行目、924-928行目

#### 4.5 機能開放/寄付

- **機能:** Stripe決済によるPro機能の開放
- **金額範囲:** 10円〜100,000円（ユーザー入力）
- **処理フロー:**
  1. 金額入力プロンプト表示
  2. `/api/checkout`にPOSTリクエスト
  3. Stripe決済画面へリダイレクト
  4. 決済成功後、`/?payment=success&session_id=xxx&quiz_id=xxx`にリダイレクト
  5. `verifyPayment()`関数で決済検証
  6. `/api/verify`で購入履歴を記録
  7. 購入履歴を再取得して表示を更新

- **実装箇所:**
  - 決済開始: `components/Dashboard.jsx` 212-244行目
  - 決済検証: `components/Dashboard.jsx` 144-210行目

### 5. 決済検証フロー

#### 5.1 初期化時の処理

- URLパラメータ`payment=success&session_id=xxx&quiz_id=xxx`をチェック
- 決済成功パラメータがある場合、`verifyPayment()`を実行
- **実装箇所:** `components/Dashboard.jsx` 70-142行目

#### 5.2 決済検証の詳細

1. `/api/verify`にPOSTリクエスト
2. Stripeセッションのステータス確認
3. 重複チェック（既に記録済みか確認）
4. `purchases`テーブルに購入履歴を挿入
5. URLパラメータをクリア
6. 購入履歴を再取得
7. 成功メッセージ表示後、ダッシュボードにリロード

- **実装箇所:** `components/Dashboard.jsx` 144-210行目

### 6. 管理者機能（お知らせ管理）

#### 6.1 お知らせ一覧表示

- **ページネーション:** 1ページあたり5件（`ANNOUNCEMENTS_PER_PAGE = 5`）
- **表示項目:**
  - タイトル
  - サービス区分（全サービス/診断クイズ/プロフィールLP）
  - 状態（表示中/非表示）
  - 作成日（またはannouncement_date）
  - 操作（編集、削除）

- **実装箇所:** `components/Dashboard.jsx` 759-840行目

#### 6.2 お知らせ作成・編集

- **フォーム項目:**
  - タイトル（必須）
  - 内容（必須）
  - リンクURL（オプション）
  - リンクテキスト（オプション）
  - 表示日付（オプション、空欄の場合はcreated_atが使用される）
  - 表示/非表示（チェックボックス）
  - サービス区分（全サービス/診断クイズ/プロフィールLP）

- **実装箇所:**
  - フォーム表示: `components/Dashboard.jsx` 625-757行目
  - 送信処理: `components/Dashboard.jsx` 327-372行目
  - 編集処理: `components/Dashboard.jsx` 374-390行目

#### 6.3 お知らせ削除

- 確認ダイアログ後に削除
- **実装箇所:** `components/Dashboard.jsx` 392-407行目

#### 6.4 お知らせ取得

- 管理者の場合のみ、`fetchAnnouncements()`で取得
- **実装箇所:** `components/Dashboard.jsx` 312-325行目

### 7. その他機能

#### 7.1 寄付・サポートへのリンク

- ダッシュボードから寄付ページへのボタン
- **実装箇所:** `components/Dashboard.jsx` 521-532行目

#### 7.2 新規クイズ作成ボタン

- エディタページに遷移
- **実装箇所:** `components/Dashboard.jsx` 486-491行目

#### 7.3 ログアウト機能

- `onLogout()`コールバックを実行
- **実装箇所:** `components/Dashboard.jsx` 492行目

## データベーススキーマ

### purchasesテーブル

```sql
CREATE TABLE public.purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    stripe_session_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- **RLSポリシー:**
  - SELECT: ユーザーは自分の購入履歴のみ閲覧可能
  - INSERT: サービスロールキーでのみ挿入可能（`/api/verify`経由）

### announcementsテーブル

```sql
CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link_url TEXT,
    link_text TEXT,
    is_active BOOLEAN DEFAULT true,
    announcement_date DATE,
    service_type TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

- **RLSポリシー:**
  - SELECT: 全ユーザーが`is_active = true`のお知らせを閲覧可能
  - ALL: 認証済みユーザーが作成・更新・削除可能（管理者チェックはアプリケーション側で実装）

## プロパティとステート

### DashboardコンポーネントのProps

- `user`: 現在のユーザーオブジェクト
- `onEdit`: クイズ編集時のコールバック関数
- `onDelete`: クイズ削除時のコールバック関数
- `setPage`: ページ遷移用の関数
- `onLogout`: ログアウト時のコールバック関数
- `isAdmin`: 管理者権限の有無（boolean）

### 主要なステート

- `myQuizzes`: クイズ一覧
- `purchases`: 購入済みクイズIDの配列
- `loading`: ローディング状態
- `viewMode`: アクセス解析の表示モード（'graph' | 'table'）
- `processingId`: 決済処理中のクイズID
- `quizPage`: クイズ一覧の現在のページ番号
- `announcementPage`: お知らせ一覧の現在のページ番号
- `announcements`: お知らせ一覧（管理者のみ）
- `showAnnouncementForm`: お知らせフォームの表示状態
- `editingAnnouncement`: 編集中のお知らせオブジェクト
- `announcementForm`: お知らせフォームの入力値

## ページネーション

### 実装

- クイズ一覧: 1ページあたり9件
- お知らせ一覧: 1ページあたり5件
- カスタム`Pagination`コンポーネントを使用
- **実装箇所:** `components/Dashboard.jsx` 431-477行目

## 依存ライブラリ

- `lucide-react`: アイコン
- `recharts`: グラフ表示
- `@supabase/supabase-js`: データベースアクセス

## 注意事項

1. **決済検証のタイミング:**
   - ダッシュボード初期化時（`useEffect`内）でURLパラメータをチェック
   - ユーザー情報が取得されるまで待機する処理が含まれる

2. **管理者権限:**
   - `isAdmin`プロパティで制御
   - 管理者は全クイズを閲覧可能
   - 管理者は自動的にPro機能がアンロックされる

3. **購入履歴の取得:**
   - 初期化時と決済検証後に`purchases`テーブルから取得
   - クイズIDの配列として保持

4. **エラーハンドリング:**
   - 決済検証失敗時はアラートを表示
   - 購入履歴取得失敗時もエラーログを出力

5. **URLパラメータの処理:**
   - 決済成功後、`window.history.replaceState()`でURLパラメータをクリア

## 関連ドキュメント

- `PROJECT_ARCHITECTURE_GUIDE.md`: プロジェクト全体のアーキテクチャ
- `PAYMENT_FIX_SUMMARY.md`: 決済システムの修正履歴
- `ANNOUNCEMENTS_IMPLEMENTATION_SUMMARY.md`: お知らせ機能の実装詳細
- `DEVELOPMENT_CHALLENGES_AND_CRITICAL_FILES.md`: 開発上の課題と重要なファイル

