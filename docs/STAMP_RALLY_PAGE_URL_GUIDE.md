# スタンプラリーのページURL設定機能

## 概要

スタンプラリーキャンペーンで、特定のページを訪問したユーザーに自動的にスタンプを付与する機能の設定方法です。

## データベース構造

`gamification_campaigns`テーブルの`settings`カラム（JSONB）に以下の構造でページスタンプ情報を保存します:

```json
{
  "total_stamps": 10,
  "points_per_stamp": 1,
  "completion_bonus": 10,
  "stamp_ids": ["stamp_1", "stamp_2", ...],
  "page_stamps": [
    {
      "page_url": "/howto",
      "stamp_id": "stamp_1",
      "stamp_index": 0,
      "name": "使い方ページを見た"
    },
    {
      "page_url": "/effective-use",
      "stamp_id": "stamp_2",
      "stamp_index": 1,
      "name": "効果的な使い方を学んだ"
    }
  ]
}
```

## 使用方法

### 1. スタンプラリーキャンペーンを作成

ダッシュボードから「ゲーミフィケーション」セクションでスタンプラリーキャンペーンを作成します。

### 2. page_stamps設定を追加

Supabaseの管理画面、またはSQL直接実行で`settings`に`page_stamps`配列を追加:

```sql
UPDATE gamification_campaigns
SET settings = settings || jsonb_build_object(
  'page_stamps', jsonb_build_array(
    jsonb_build_object(
      'page_url', '/howto',
      'stamp_id', 'stamp_1',
      'stamp_index', 0,
      'name', '使い方ページを見た'
    ),
    jsonb_build_object(
      'page_url', '/effective-use',
      'stamp_id', 'stamp_2',
      'stamp_index', 1,
      'name', '効果的な使い方を学んだ'
    )
  )
)
WHERE id = 'キャンペーンID';
```

### 3. ページにスタンプトラッカーを統合済み

以下のページには既にスタンプトラッカーが統合されています:

- `/howto` - 使い方ページ
- `/effective-use` - 効果的な使い方ページ

新しいページに追加する場合は、以下のコンポーネントをインポートして使用:

```tsx
import PageStampTracker from '@/components/gamification/PageStampTracker';

// ページコンポーネント内で
<PageStampTracker pageUrl="/your-page" user={user} />
```

## 成果物作成後のスタンプ設定

### クイズ・プロフィール・ビジネスLPにスタンプを設定

各コンテンツ作成時に、「スタンプラリーと連携」オプションを追加することで、そのコンテンツを閲覧したユーザーにスタンプを付与できます。

#### 実装方法（将来の拡張）

1. **エディタにオプション追加**
   - クイズ/プロフィール/ビジネスLPエディタに「スタンプラリー連携」チェックボックスを追加
   - スタンプラリーキャンペーンを選択
   - スタンプIDを選択または自動生成

2. **公開ページにトラッカー埋め込み**
   - 保存時に成果物のメタデータにスタンプ情報を保存
   - 公開ページ表示時に`PageStampTracker`を自動的に埋め込み

3. **動的スタンプID**
   ```tsx
   <PageStampTracker 
     pageUrl={`/quiz/${quizId}`} 
     user={user}
   />
   ```

## 注意事項

- ページスタンプは同じキャンペーン内で一度しか取得できません
- ローカルストレージとデータベースの両方で重複チェックを行います
- 匿名ユーザーもセッションIDベースで取得可能です

## トラブルシューティング

### スタンプが付与されない場合

1. ブラウザのコンソールを開いて`[PageStampTracker]`ログを確認
2. キャンペーンが`active`状態か確認
3. `page_stamps`配列の`page_url`が正確か確認
4. `stamp_id`が`stamp_ids`配列に含まれているか確認

### 重複取得の問題

ローカルストレージをクリア:
```javascript
localStorage.removeItem('stamp_acquired_CAMPAIGN_ID_STAMP_ID');
```

## 今後の改善案

1. **スタンプラリーエディタのUI改善**
   - ページURL設定を管理画面から直接編集可能に
   - ドラッグ&ドロップでスタンプとURLを紐付け

2. **統計とトラッキング**
   - どのページが最も訪問されているか
   - スタンプ取得率の可視化

3. **高度な条件設定**
   - 滞在時間条件（5分以上閲覧）
   - スクロール率条件（80%以上閲覧）
   - 複数ページの組み合わせ条件
