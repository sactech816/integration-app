# アナウンスページ 仕様書

## 📋 概要

診断クイズメーカーアプリケーションのお知らせ機能に関する完全な仕様書です。サービスタイプ別にお知らせを表示・管理できる機能を提供します。

---

## 📁 関連ファイル一覧

### フロントエンドコンポーネント

1. **`app/announcements/page.jsx`**
   - ルーティング用のラッパーコンポーネント
   - `/announcements` パスでアクセス可能
   - メインの `app/page.jsx` の `App` コンポーネントを使用

2. **`components/AnnouncementsPage.jsx`**
   - お知らせ一覧表示・管理のメインコンポーネント
   - 管理者向けの作成・編集・削除機能を含む
   - サービスタイプによるフィルタリング機能

3. **`components/AnnouncementBanner.jsx`**
   - ページ上部に表示されるバナーコンポーネント
   - 最新のお知らせを自動表示
   - ユーザーが閉じたバナーはローカルストレージに記録

### データベーススキーマ

4. **`supabase_announcements_schema.sql`**
   - お知らせテーブルの初期作成SQL
   - RLS（Row Level Security）ポリシー設定
   - インデックス作成

5. **`supabase_add_announcement_date_column.sql`**
   - `announcement_date` カラム追加用SQL
   - 表示用の日付を設定可能にする

6. **`supabase_add_service_type_column.sql`**
   - `service_type` カラム追加用SQL
   - サービスタイプによるフィルタリング機能を実現

### ドキュメント

7. **`ANNOUNCEMENTS_IMPLEMENTATION_SUMMARY.md`**
   - 実装完了サマリー
   - 使用方法、トラブルシューティング

---

## 🗄️ データベーススキーマ

### announcements テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 自動採番ID |
| `title` | TEXT | NOT NULL | お知らせのタイトル |
| `content` | TEXT | NOT NULL | お知らせの内容 |
| `link_url` | TEXT | NULL許可 | リンク先URL（オプション） |
| `link_text` | TEXT | NULL許可 | リンクテキスト（オプション） |
| `is_active` | BOOLEAN | DEFAULT true | 表示/非表示の切り替え |
| `announcement_date` | DATE | NULL許可 | 表示用の日付（空欄の場合はcreated_atが使用） |
| `service_type` | TEXT | DEFAULT 'all', CHECK制約 | サービス区分: 'all', 'quiz', 'profile' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時（自動更新） |

### インデックス

- `idx_announcements_active_created`: `(is_active, created_at DESC)` - アクティブなお知らせの高速取得
- `idx_announcements_service_type`: `(service_type)` - サービスタイプでのフィルタリング高速化

### RLSポリシー

1. **閲覧ポリシー**: 全ユーザーが `is_active = true` のお知らせを閲覧可能
2. **管理ポリシー**: 認証済みユーザーが作成・更新・削除可能（実際の管理者チェックはアプリケーション側で実装）

---

## 🎯 機能仕様

### 1. お知らせ一覧表示

#### 表示条件

**一般ユーザー:**
- `is_active = true` のお知らせのみ表示
- `service_type = 'quiz'` または `service_type = 'all'` のお知らせを表示
- 作成日時（または `announcement_date`）の降順で表示

**管理者:**
- すべてのお知らせを表示（非表示も含む）
- `service_type = 'quiz'` または `service_type = 'all'` のお知らせを表示
- サービス区分バッジが表示される

#### 表示項目

- タイトル
- 内容（改行対応）
- 日付（`announcement_date` があればそれを使用、なければ `created_at`）
- リンク（`link_url` が設定されている場合）
- サービス区分バッジ（管理者のみ）
- 非表示バッジ（管理者のみ、`is_active = false` の場合）

### 2. お知らせ作成・編集（管理者のみ）

#### 入力項目

| 項目 | 必須 | 型 | 説明 |
|-----|------|-----|------|
| タイトル | ✓ | TEXT | お知らせのタイトル |
| 内容 | ✓ | TEXT | お知らせの本文 |
| リンクURL | - | URL | 外部リンク先（オプション） |
| リンクテキスト | - | TEXT | リンクに表示するテキスト（オプション） |
| 表示日付 | - | DATE | 表示用の日付（空欄の場合は作成日時） |
| 表示する | - | BOOLEAN | チェックボックス（デフォルト: true） |
| サービス区分 | - | SELECT | 'all'（全サービス共通）/ 'quiz'（診断クイズ専用）/ 'profile'（プロフィールLP専用） |

#### バリデーション

- タイトル: 必須
- 内容: 必須
- リンクURL: URL形式（オプション）

### 3. お知らせ削除（管理者のみ）

- 確認ダイアログを表示
- 削除後、一覧を自動更新

### 4. バナー表示（AnnouncementBanner）

#### 表示条件

- 最新のアクティブなお知らせを1件取得
- `service_type = 'all'` または指定された `serviceType` と一致
- ユーザーが閉じたバナーは表示しない（ローカルストレージで管理）

#### 機能

- 「詳細を見る」ボタン: お知らせページに遷移
- 「閉じる」ボタン: バナーを非表示にし、ローカルストレージに記録

---

## 🔌 コンポーネントAPI

### AnnouncementsPage

```jsx
<AnnouncementsPage
  onBack={() => void}              // 戻るボタンのハンドラ
  isAdmin={boolean}                // 管理者フラグ
  setPage={(page: string) => void} // ページ遷移関数
  user={object | null}             // ユーザー情報
  onLogout={() => void}            // ログアウト関数
  setShowAuth={(show: boolean) => void} // 認証モーダル表示制御
  serviceType="quiz"               // サービスタイプ（デフォルト: 'quiz'）
/>
```

### AnnouncementBanner

```jsx
<AnnouncementBanner
  serviceType="quiz"                                    // サービスタイプ（デフォルト: 'quiz'）
  onNavigateToAnnouncements={() => void}                // お知らせページへの遷移関数（オプション）
/>
```

---

## 🛣️ ルーティング

### パス

- `/announcements`: お知らせページ

### 統合箇所

**`app/page.jsx`:**
- ルーティング設定に `/announcements` を追加
- `AnnouncementsPage` コンポーネントに `serviceType="quiz"` を指定

**`components/Header.jsx`:**
- ヘッダーメニューに「お知らせ」リンクを追加（Bellアイコン付き）

---

## 🎨 UI/UX仕様

### デザイン

- **カラースキーム**: インディゴ（indigo-600）をメインカラー
- **レイアウト**: 最大幅4xl、中央配置
- **レスポンシブ**: モバイル対応

### バナー

- **背景**: グラデーション（indigo-600 → purple-600）
- **テキスト**: 白色
- **アイコン**: Bell（lucide-react）
- **ボタン**: ホバー時に背景色が変化

### お知らせカード

- **背景**: 白色
- **ボーダー**: グレー（gray-200）
- **ホバー**: シャドウが表示される
- **管理者ボタン**: 右上に配置（編集・削除）

### フォーム

- **背景**: 白色、角丸（rounded-2xl）
- **入力フィールド**: グレー背景（gray-50）
- **ボタン**: インディゴ背景、ホバー時に色が濃くなる

---

## 🔐 セキュリティ

### アクセス制御

- **閲覧**: 全ユーザーがアクティブなお知らせを閲覧可能
- **作成・編集・削除**: 管理者のみ（アプリケーション側でチェック）

### データ保護

- RLS（Row Level Security）を有効化
- 認証済みユーザーのみが管理操作を実行可能

---

## 📊 データフロー

### お知らせ取得

```
ユーザーアクション
  ↓
AnnouncementsPage.fetchAnnouncements()
  ↓
Supabase Query
  - WHERE is_active = true (一般ユーザーの場合)
  - WHERE service_type IN ('all', 'quiz')
  - ORDER BY created_at DESC
  ↓
表示更新
```

### お知らせ作成・更新

```
管理者アクション（フォーム送信）
  ↓
AnnouncementsPage.handleAnnouncementSubmit()
  ↓
Supabase Insert/Update
  ↓
成功通知
  ↓
一覧再取得
```

### バナー表示

```
ページ読み込み
  ↓
AnnouncementBanner.fetchLatestAnnouncement()
  ↓
Supabase Query
  - WHERE is_active = true
  - WHERE service_type IN ('all', serviceType)
  - ORDER BY created_at DESC
  - LIMIT 1
  ↓
ローカルストレージチェック
  ↓
表示/非表示判定
```

---

## 🧪 テスト項目

### 機能テスト

- [ ] お知らせ一覧が正しく表示される
- [ ] サービスタイプでフィルタリングが機能する
- [ ] 管理者がお知らせを作成できる
- [ ] 管理者がお知らせを編集できる
- [ ] 管理者がお知らせを削除できる
- [ ] 一般ユーザーは非表示のお知らせを見られない
- [ ] バナーが正しく表示される
- [ ] バナーを閉じた後、再表示されない
- [ ] リンクが正しく動作する

### UIテスト

- [ ] レスポンシブデザインが機能する
- [ ] 管理者バッジが正しく表示される
- [ ] 日付が正しい形式で表示される
- [ ] フォームのバリデーションが機能する

### セキュリティテスト

- [ ] 一般ユーザーが管理操作を実行できない
- [ ] RLSポリシーが正しく機能する

---

## 🐛 既知の問題・制限事項

### 制限事項

1. **ローカルストレージ依存**: バナーの非表示状態はローカルストレージに保存されるため、ブラウザを変更すると再表示される
2. **管理者判定**: アプリケーション側で実装されているため、データベース側のRLSポリシーは緩い設定になっている

### 改善提案

1. バナーの非表示状態をサーバー側で管理する
2. より厳密なRLSポリシーの実装
3. お知らせのスケジュール機能（未来の日付で公開予約）

---

## 📝 変更履歴

### 2025年12月10日
- お知らせ機能の初期実装
- サービスタイプ機能の追加
- バナーコンポーネントの追加

---

## 🔗 関連ドキュメント

- `ANNOUNCEMENTS_IMPLEMENTATION_SUMMARY.md` - 実装サマリー
- `PROJECT_ARCHITECTURE_GUIDE.md` - プロジェクト全体のアーキテクチャ
- `PROJECT_REQUIREMENTS_AND_SPECIFICATIONS.md` - プロジェクト要件

---

**最終更新日**: 2025年1月27日
**バージョン**: 1.0.0

