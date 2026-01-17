# エラー修正完了レポート

## 発生したエラー

```
Runtime TypeError: Cannot read properties of undefined (reading 'presetA')
at AdminAISettings (components/shared/AdminAISettings.tsx:139:34)
```

## 原因

`admin_ai_settings`テーブルがデータベースに存在しないため、APIが不完全なレスポンスを返していました。具体的には:

1. **データベーステーブル未作成**: `supabase_admin_ai_settings.sql`マイグレーションが未実行
2. **APIエラーハンドリング不足**: テーブル不存在時の適切なフォールバック処理がない
3. **フロントエンドの堅牢性不足**: `presets`プロパティの存在チェックが不十分

## 実施した修正

### 1. API側の改善 (`app/api/admin/ai-settings/route.ts`)

✅ **テーブル不存在時のフォールバック処理を追加**:
```typescript
// テーブルが存在しない場合もプリセット情報は返す
if (error && error.code === '42P01') { // テーブルが存在しない
  console.warn('admin_ai_settings table does not exist...');
  return NextResponse.json({
    planTier,
    selectedPreset: 'presetB',
    presets: { /* プリセット情報 */ },
    requiresMigration: true, // マイグレーション必要フラグ
  });
}
```

**効果**:
- テーブルが無くてもアプリケーションがクラッシュしない
- プリセット情報（`PLAN_AI_PRESETS`）は常にフロントエンドに返される
- `requiresMigration`フラグでマイグレーション必要性を通知

### 2. フロントエンド側の改善 (`components/shared/AdminAISettings.tsx`)

✅ **データ存在チェックの強化**:
```typescript
const planData = settings[selectedPlan];

// データが存在しない、またはプリセットがない場合
if (!planData || !planData.presets) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <p>プラン設定を読み込めませんでした。データベースマイグレーションを実行してください。</p>
    </div>
  );
}
```

✅ **マイグレーション必要時の警告表示**:
```typescript
// マイグレーション必要な場合は警告
if (needsMigration) {
  alert('⚠️ データベースマイグレーションが必要です\n\n' +
        'Supabase Studioで以下のSQLファイルを実行してください:\n' +
        '- supabase_admin_ai_settings.sql');
}
```

✅ **各プランのロード失敗への対処**:
```typescript
for (const plan of plans) {
  try {
    const response = await fetch(`/api/admin/ai-settings?planTier=${plan}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch settings for ${plan}:`, response.status);
      continue; // 他のプランの読み込みを継続
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`API error for ${plan}:`, data.error);
      continue;
    }
    
    // ...
  } catch (error) {
    console.error(`Error loading settings for ${plan}:`, error);
  }
}
```

### 3. ユーザー向けガイド作成

✅ **`DATABASE_MIGRATION_GUIDE.md`作成**:
- Supabase Studioでのマイグレーション実行手順
- トラブルシューティングガイド
- データベーススキーマ確認コマンド

## 修正後の動作

### ✅ マイグレーション未実行の場合
1. アプリケーションは正常に起動
2. 「プラン別AIモデル設定」セクションが表示される
3. プリセットA/Bの情報が表示される（読み取り専用）
4. 警告アラートが表示:
   ```
   ⚠️ データベースマイグレーションが必要です
   
   Supabase Studioで以下のSQLファイルを実行してください:
   - supabase_admin_ai_settings.sql
   ```
5. 保存ボタンは機能しない（マイグレーション実行後に有効化）

### ✅ マイグレーション実行後
1. 警告アラートが表示されない
2. プリセットA/Bの選択が可能
3. 保存ボタンが機能
4. 選択した設定がデータベースに保存される

## 実行が必要なアクション（ユーザー側）

### 🔴 必須: データベースマイグレーション実行

Supabase Studioで以下のSQLファイルを実行してください:

1. **`supabase_hybrid_ai_credits.sql`** (まだ実行していない場合)
   - ハイブリッドAIクレジットシステムの基盤

2. **`supabase_admin_ai_settings.sql`** (新規)
   - プラン別AIモデル設定テーブル
   - 管理者用RPC関数

詳細手順は **`DATABASE_MIGRATION_GUIDE.md`** を参照してください。

### 🔵 オプション: UI統合作業

以下の統合作業は別途手動対応が必要です（ガイドドキュメントあり）:

1. **ユーザーダッシュボード** (`app/dashboard/page.tsx`)
   - グローバルAIモード選択コンポーネントの統合
   - ガイド: `AI_MODE_INTEGRATION_STATUS.md`

2. **Kindleエディタ** (`app/kindle/[id]/page.tsx`)
   - エディタ内でのモード切り替え機能
   - ガイド: `AI_MODE_SELECTION_IMPLEMENTATION.md`

3. **LPの料金説明更新** (`app/HomePageClient.tsx`)
   - プラン別のAIクレジット上限と機能説明

## テスト確認項目

### ✅ 現在のステータス

- [x] エラーが発生しない（マイグレーション未実行時）
- [x] プリセット情報が表示される
- [x] マイグレーション必要時に警告が表示される
- [x] APIがテーブル不存在時もクラッシュしない

### ⏳ マイグレーション実行後に確認すること

- [ ] 管理者として`/kindle`ページにアクセス
- [ ] 「プラン別AIモデル設定」セクションが表示される
- [ ] 各プラン（Lite/Standard/Pro/Business）のタブが表示される
- [ ] プリセットA/Bの情報が正しく表示される
- [ ] プリセットを選択して保存できる
- [ ] ページをリロードしても選択が保持される

## ファイル変更サマリー

| ファイル | 変更内容 |
|---------|---------|
| `app/api/admin/ai-settings/route.ts` | テーブル不存在時のフォールバック処理追加、`requiresMigration`フラグ追加 |
| `components/shared/AdminAISettings.tsx` | データ存在チェック強化、マイグレーション警告追加、エラーハンドリング改善 |
| `DATABASE_MIGRATION_GUIDE.md` | 新規作成 - マイグレーション実行ガイド |
| `ERROR_FIX_REPORT.md` | 新規作成 - このレポート |

## 技術的な詳細

### エラーコード `42P01`
PostgreSQLエラーコード`42P01`は「relation does not exist」を意味します。つまり、指定したテーブル（`admin_ai_settings`）が存在しないことを示します。

### `PLAN_AI_PRESETS`のハードコード戦略
APIは`PLAN_AI_PRESETS`（`lib/ai-provider.ts`で定義）を常にフォールバックとして使用します。これにより:
- データベース不具合時もプリセット情報は利用可能
- マイグレーション前でもUI表示は可能
- データベースは「選択されたプリセット」のみを保存

### RLS（Row Level Security）ポリシー
`admin_ai_settings`テーブルには以下のRLSポリシーが適用されます:
- **読み取り**: 全ユーザー可能（プラン別デフォルト設定のため）
- **更新/削除**: 管理者のみ（`user_roles`テーブルでチェック）

---

**作成日**: 2026-01-10  
**対応バージョン**: Next.js 16.1.1  
**ステータス**: ✅ 修正完了 / ⏳ マイグレーション実行待ち

