# ダッシュボードのアクセス解析 - 仕様まとめ

## 概要

ビジネスLPダッシュボードのアクセス解析は、プロフィールLPと同じ`analytics`テーブルを使用しますが、データの識別方法が異なります。

## プロフィールLPとビジネスLPの違い

### データ識別方法

| 項目 | プロフィールLP | ビジネスLP |
|------|---------------|-----------|
| **識別子** | UUID形式の`profile_id` | slug（文字列）形式の`profile_id` |
| **content_type** | `'profile'` | `'business'` |
| **Server Actions** | `saveAnalytics()` / `getAnalytics()` | `saveBusinessAnalytics()` / `getBusinessAnalytics()` |
| **データベース** | 同じ`analytics`テーブル | 同じ`analytics`テーブル |

### 重要なポイント

✅ **同じテーブルを使用**: プロフィールLPとビジネスLPは同じ`analytics`テーブルに保存されます  
✅ **content_typeで区別**: `content_type`カラムで確実に区別されます  
✅ **同じコンポーネント**: `ProfileViewTracker`と`BlockRenderer`は両方で使用され、`contentType`プロパティで動作を切り替えます

## 関連ファイル一覧

### 1. Server Actions（データ保存・取得）

#### プロフィールLP用
- **ファイル**: `app/actions/analytics.ts`
- **関数**:
  - `saveAnalytics(profileId, eventType, eventData)` - アナリティクス保存
  - `getAnalytics(profileId)` - アナリティクス取得
- **特徴**:
  - `profile_id`はUUID形式を要求
  - `content_type='profile'`で保存

#### ビジネスLP用
- **ファイル**: `app/actions/business.ts`
- **関数**:
  - `saveBusinessAnalytics(slug, eventType, eventData)` - アナリティクス保存
  - `getBusinessAnalytics(slug)` - アナリティクス取得
- **特徴**:
  - `profile_id`にslug（文字列）を保存
  - `content_type='business'`で保存

### 2. トラッキングコンポーネント

#### ProfileViewTracker
- **ファイル**: `components/ProfileViewTracker.tsx`
- **役割**: ページビュー、スクロール深度、滞在時間、精読率をトラッキング
- **使用方法**:
  ```tsx
  // プロフィールLP
  <ProfileViewTracker profileId={uuid} contentType="profile" />
  
  // ビジネスLP
  <ProfileViewTracker profileId={slug} contentType="business" />
  ```
- **実装詳細**:
  - `contentType`プロパティに応じて`saveAnalytics`または`saveBusinessAnalytics`を呼び出し
  - イベントタイプ: `view`, `scroll`, `time`, `read`

#### BlockRenderer
- **ファイル**: `components/BlockRenderer.tsx`
- **役割**: ブロックコンポーネントのレンダリングとリンククリックのトラッキング
- **使用方法**:
  ```tsx
  // プロフィールLP
  <BlockRenderer block={block} profileId={uuid} contentType="profile" />
  
  // ビジネスLP
  <BlockRenderer block={block} profileId={slug} contentType="business" />
  ```
- **実装詳細**:
  - `saveAnalyticsForContentType()`ヘルパー関数で`contentType`に応じた関数を呼び出し
  - リンククリック時に`click`イベントを記録

### 3. ダッシュボード表示

#### BusinessDashboard
- **ファイル**: `components/BusinessDashboard.tsx`
- **役割**: ビジネスLP一覧とアナリティクス表示
- **実装詳細**:
  - 各プロジェクトの`slug`を使用して`getBusinessAnalytics(slug)`を呼び出し
  - 表示項目:
    - アクセス数（views）
    - クリック数（clicks）
    - クリック率（clickRate）
    - 精読率（readRate）
    - 平均滞在時間（avgTimeSpent）

### 4. ビジネスLPページ

#### ビジネスLP表示ページ
- **ファイル**: `app/b/[slug]/page.tsx`
- **実装詳細**:
  ```tsx
  <ProfileViewTracker profileId={project.slug} contentType="business" />
  <BlockRenderer block={block} profileId={project.slug} contentType="business" />
  ```
- **特徴**:
  - `project.slug`を`profileId`として使用
  - `contentType="business"`を指定

## データ構造

### analyticsテーブル

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY,
  profile_id TEXT NOT NULL,  -- プロフィールLP: UUID、ビジネスLP: slug
  event_type TEXT NOT NULL,  -- 'view', 'click', 'scroll', 'time', 'read'
  event_data JSONB DEFAULT '{}',
  content_type TEXT NOT NULL, -- 'profile' または 'business'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### イベントタイプ

| event_type | 説明 | event_data例 |
|------------|------|-------------|
| `view` | ページ閲覧 | `{}` |
| `click` | リンク/ボタンクリック | `{ url: "https://..." }` |
| `scroll` | スクロール深度 | `{ scrollDepth: 75 }` |
| `time` | 滞在時間 | `{ timeSpent: 120 }` (秒) |
| `read` | 精読率 | `{ readPercentage: 80 }` |

### 集計指標

`getBusinessAnalytics()`が返す値:

| 指標 | 説明 | 計算方法 |
|------|------|---------|
| `views` | 総閲覧数 | `event_type='view'`のカウント |
| `clicks` | 総クリック数 | `event_type='click'`のカウント |
| `avgScrollDepth` | 平均スクロール深度(%) | scrollDepthの平均 |
| `avgTimeSpent` | 平均滞在時間(秒) | timeSpentの平均 |
| `readRate` | 精読率(%) | readPercentage>=50のビュー比率 |
| `clickRate` | クリック率(%) | clicks / views * 100 |

## データ取得フロー

### ビジネスLPの場合

1. **ページ表示時** (`app/b/[slug]/page.tsx`)
   ```
   ProfileViewTracker → saveBusinessAnalytics(slug, 'view')
   ```

2. **スクロール時** (`ProfileViewTracker.tsx`)
   ```
   スクロールイベント → saveBusinessAnalytics(slug, 'scroll', { scrollDepth })
   ```

3. **リンククリック時** (`BlockRenderer.tsx`)
   ```
   クリックイベント → saveBusinessAnalytics(slug, 'click', { url })
   ```

4. **滞在時間記録** (`ProfileViewTracker.tsx`)
   ```
   30秒ごと / ページ離脱時 → saveBusinessAnalytics(slug, 'time', { timeSpent })
   ```

5. **ダッシュボード表示時** (`BusinessDashboard.tsx`)
   ```
   getBusinessAnalytics(slug) → 集計データを表示
   ```

### プロフィールLPの場合

1. **ページ表示時**
   ```
   ProfileViewTracker → saveAnalytics(uuid, 'view')
   ```

2. **ダッシュボード表示時**
   ```
   getAnalytics(uuid) → 集計データを表示
   ```

## クエリ例

### ビジネスLPのアナリティクス取得

```sql
-- 特定のビジネスLPのアナリティクス
SELECT * FROM analytics 
WHERE profile_id = 'my-business-lp-slug' 
AND content_type = 'business';

-- ビジネスLPの集計
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'view') as views,
  COUNT(*) FILTER (WHERE event_type = 'click') as clicks
FROM analytics 
WHERE profile_id = 'my-business-lp-slug' 
AND content_type = 'business';
```

### プロフィールLPのアナリティクス取得

```sql
-- 特定のプロフィールLPのアナリティクス
SELECT * FROM analytics 
WHERE profile_id = '550e8400-e29b-41d4-a716-446655440000' 
AND content_type = 'profile';
```

## 実装の違いまとめ

### 同じ点

✅ 同じ`analytics`テーブルを使用  
✅ 同じイベントタイプ（view, click, scroll, time, read）  
✅ 同じ集計指標（views, clicks, clickRate, readRate, avgTimeSpent）  
✅ 同じトラッキングコンポーネント（`ProfileViewTracker`, `BlockRenderer`）

### 異なる点

| 項目 | プロフィールLP | ビジネスLP |
|------|---------------|-----------|
| **識別子の形式** | UUID | slug（文字列） |
| **識別子の取得元** | `profiles.id` | `business_projects.slug` |
| **Server Actions** | `app/actions/analytics.ts` | `app/actions/business.ts` |
| **content_type** | `'profile'` | `'business'` |
| **UUID検証** | あり（`saveAnalytics`） | なし（`saveBusinessAnalytics`） |

## 注意事項

1. **content_typeの設定**: 必ず正しい`content_type`を指定する必要があります
2. **slugの一意性**: ビジネスLPのslugは`business_projects`テーブルでUNIQUE制約があります
3. **後方互換性**: 既存のプロフィールLPアナリティクスには影響しません
4. **データの混在**: 同じ`analytics`テーブルに保存されますが、`content_type`で確実に区別できます

## 関連ドキュメント

- `BUSINESS_ANALYTICS_SPEC.md` - ビジネスLPアナリティクス仕様書
- `ANALYTICS_SETUP.md` - アナリティクス機能セットアップガイド
- `ANALYTICS_DEBUG.md` - アナリティクス問題解決ガイド

