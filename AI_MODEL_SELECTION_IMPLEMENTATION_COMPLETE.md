# AIモデル選択機能 実装完了レポート

## 実装した機能

### 1. ユーザー向けAIモード選択コンポーネント

**ファイル**: `components/kindle/AIModelSelector.tsx`

**機能概要**:
- 管理者、課金ユーザー（Pro/Business以上）、モニターユーザー（Pro以上）が利用可能
- **スピードモード**と**ハイクオリティモード**の2つから選択
- 各モードの残りクレジット数をリアルタイム表示
- ハイクオリティモードのクレジット切れ時は自動で選択不可に

**表示内容**:
- **スピードモード**: 高速・コスパ重視（Gemini Flashなど）
- **ハイクオリティモード**: 高品質・論理重視（Claude/OpenAIなど）

**プラン別上限表示**:
- **Proプラン**: ハイクオリティ20回/日、スピード80回/日
- **Businessプラン**: ハイクオリティ50回/日、スピード無制限

### 2. 管理者用デフォルトAI設定

**ファイル**: `components/shared/AdminAISettings.tsx`

**配置場所**: KDLページ（`/kindle`）の最上部（管理者のみ表示）

**機能概要**:
- プラン別（Lite/Standard/Pro/Business）にデフォルトAIモデルプリセットを設定
- 「候補A」と「候補B」から選択
- 構成用と執筆用のモデルを個別に設定
- コスト情報を表示

**タイトル変更**:
- 旧: 「プラン別AIモデル設定」
- 新: 「KDL用 デフォルトAIモデル設定」
- 説明: 「Kindle執筆機能で使用するデフォルトAIモデルをプラン別に設定します（候補A/B）」

### 3. プラン上限の修正

**ファイル**: `lib/subscription.ts`

| プラン | 旧上限 | 新上限 | 詳細 |
|--------|--------|--------|------|
| Lite | 20回/日 | 20回/日（変更なし） | Standard枠のみ、Gemini Flash限定 |
| Standard | 50回/日 | **30回/日** | Standard枠30回（Haiku+Flash） |
| Pro | 100回/日 | 100回/日（内訳変更） | Premium枠20回 + Standard枠80回 |
| Business | 無制限 | 無制限（内訳変更） | Premium枠50回 + Standard枠無制限 |

### 4. KDLページへの統合

**ファイル**: `app/kindle/page.tsx`

**レイアウト順序**:
1. **管理者向け**: 「KDL用 デフォルトAIモデル設定」（最上部）
2. **全ユーザー**: AI使用量表示
3. **全ユーザー**: AIモード選択（Pro以上・管理者・モニターユーザー）
4. 書籍一覧

## 実装の詳細

### AIモード選択の動作フロー

```
1. ユーザーがKDLページにアクセス
   ↓
2. サブスクリプション情報を取得（planTier, isMonitor）
   ↓
3. AIModelSelectorコンポーネントがアクセス権限をチェック
   - 管理者: 無条件で表示
   - Pro/Business: 表示
   - モニターユーザー（Pro以上）: 表示
   - その他: 非表示
   ↓
4. ユーザーがモードを選択（スピード/ハイクオリティ）
   ↓
5. 選択されたモードがローカルステートで管理される
   ↓
6. AI実行時に選択されたモードに応じた処理を実行
```

### 権限チェックロジック

```typescript
const canSelectMode = 
  isAdmin || 
  planTier === 'pro' || 
  planTier === 'business' || 
  planTier === 'enterprise' || 
  (isMonitor && (planTier === 'pro' || planTier === 'business'));
```

### クレジット制限の仕組み

| モード | 使用クレジット | プラン別上限 |
|--------|----------------|--------------|
| スピード | Standard | Lite:20, Standard:30, Pro:80, Business:無制限 |
| ハイクオリティ | Premium | Lite:0, Standard:0, Pro:20, Business:50 |

## 利益保護の設計

### 1. Liteプラン（¥2,980）
- **上限**: 20回/日（変更なし）
- **モデル**: Gemini Flash限定（$0.30〜$0.40/1M tokens）
- **原価**: 毎日フル利用で月間数百円
- **利益**: 安全に確保

### 2. Standardプラン（¥4,980）
- **上限**: 30回/日（50→30に減少）
- **モデル**: Gemini Flash + Claude Haiku（$0.40〜$1.25）
- **原価**: ヘビーユーザーでも利益圧迫を防ぐ
- **実用性**: 1日で2〜3冊分の作業可能

### 3. Proプラン（¥9,800）⚠️ 最重要
- **上限**: 
  - ハイクオリティモード: 20回/日
  - スピードモード: 80回/日
- **戦略**: 「合計100回使える」とアピールしつつ、高コストモデルの使用に蓋
- **使い分け**:
  - 構成作成・まえがき → ハイクオリティ
  - 大量の本文生成 → スピード
- **利益**: 原価爆発を防ぎつつ満足度を保つ

### 4. Businessプラン（¥29,800）
- **上限**:
  - ハイクオリティモード: 50回/日
  - スピードモード: 無制限
- **マーケティング**: 「無制限」の訴求力を維持
- **リスク管理**: 最高性能AI（o1/Sonnet）は50回制限
- **実用性**: 他社比で破格の条件

## ファイル変更サマリー

| ファイル | 変更内容 |
|---------|---------|
| `lib/subscription.ts` | Standard上限を50→30に修正、monthlyAILimitも更新 |
| `components/kindle/AIModelSelector.tsx` | 新規作成 - ユーザー向けモード選択UI |
| `components/shared/AdminAISettings.tsx` | タイトルと説明を「KDL用」に変更 |
| `app/kindle/page.tsx` | AIModelSelectorを統合、subscriptionStatus型拡張 |

## 次のステップ（手動対応必要）

### 1. ✅ データベースマイグレーション実行

以下のSQLファイルをSupabase Studioで実行してください:

1. `supabase_hybrid_ai_credits.sql`
2. `supabase_admin_ai_settings.sql`

詳細: `ADMIN_FLAG_SETUP_GUIDE.md`

### 2. ✅ 管理者フラグ設定

```sql
-- 自分のユーザーIDを確認
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- 管理者に設定
SELECT set_admin_status('あなたのユーザーID'::UUID, true);
```

### 3. 📝 AIモード選択機能の実際の実行処理との連携

現在、モード選択UIは完成していますが、実際のAI実行時にこのモードを使用する処理は、各AI実行エンドポイント（`/api/kdl/*`など）で個別に実装する必要があります。

**実装例**（参考）:

```typescript
// app/api/kdl/generate-section/route.ts
export async function POST(request: Request) {
  const { userId, mode, phase } = await request.json();
  
  // モードとフェーズに応じたAIプロバイダーを取得
  const provider = getProviderForModeAndPhase(
    userPlanTier,
    mode, // 'speed' | 'quality'
    phase // 'outline' | 'writing'
  );
  
  // クレジットチェック
  const usageType = mode === 'quality' ? 'premium' : 'standard';
  const creditCheck = await checkAICreditLimit(userId, usageType);
  
  if (!creditCheck.canUse) {
    return NextResponse.json({ error: 'Credit limit exceeded' }, { status: 429 });
  }
  
  // AI実行
  const result = await provider.generateCompletion(...);
  
  // 使用ログ記録
  await logAIUsage({ userId, usageType, ... });
  
  return NextResponse.json(result);
}
```

### 4. 📝 LP（ランディングページ）の料金説明更新

`app/HomePageClient.tsx`または料金ページで以下を明記してください:

#### Liteプラン（¥2,980/月）
```
✅ AI執筆サポート: 20回/日
✅ モデル: 高速AI（Gemini Flash）限定
✅ 書籍数無制限
✅ KDP形式エクスポート
✅ メールサポート
```

#### Standardプラン（¥4,980/月）
```
✅ AI執筆サポート: 30回/日
✅ モデル: 標準AI+（Gemini Flash / Claude Haiku）
✅ 書籍数無制限
✅ KDP形式エクスポート
✅ メール優先サポート
```

#### Proプラン（¥9,800/月）★人気
```
✅ AI執筆サポート: 100回/日
  📌 ハイクオリティモード: 20回/日
  📌 スピードモード: 80回/日
✅ モデル: 高性能AI（Claude/OpenAI o3-mini）
✅ AIモード選択機能
✅ 書籍数無制限
✅ KDP形式エクスポート
✅ チャットサポート
✅ 新機能の先行アクセス
```

#### Businessプラン（¥29,800/月）
```
✅ AI執筆サポート: 無制限*
  📌 ハイクオリティモード: 50回/日
  📌 スピードモード: 無制限
✅ モデル: 最高性能AI（Claude Sonnet / OpenAI o1）
✅ AIモード選択機能
✅ 書籍数無制限
✅ KDP形式エクスポート
✅ グループコンサル（月1回）
✅ 優先サポート
✅ 新機能の先行アクセス

*高速・通常モード（Gemini Flash等）は使い放題。
 最高品質モード（o1/Sonnet）は1日50回まで。
```

## テスト確認項目

### ✅ 管理者として
- [ ] `/kindle`にアクセス
- [ ] 「KDL用 デフォルトAIモデル設定」が最上部に表示される
- [ ] プラン別（Lite/Standard/Pro/Business）のタブが表示される
- [ ] 各プランで候補A/Bを選択して保存できる
- [ ] AIモード選択も表示される（管理者は無条件で利用可能）

### ✅ Proプランユーザーとして
- [ ] `/kindle`にアクセス
- [ ] 「AIモード選択」が表示される
- [ ] スピードモード/ハイクオリティモードの切り替えが可能
- [ ] 残りクレジット数が正しく表示される（ハイクオリティ:20回、スピード:80回）
- [ ] ハイクオリティモードを20回使い切ると選択不可になる

### ✅ Standardプランユーザーとして
- [ ] `/kindle`にアクセス
- [ ] 「AIモード選択」は**表示されない**（Standard以下は選択不可）
- [ ] AI使用量表示のみ表示される

### ✅ モニターユーザー（Pro相当）として
- [ ] `/kindle`にアクセス
- [ ] 「AIモード選択」が表示される
- [ ] モード切り替えが可能

## セキュリティとパフォーマンス

### クレジット制限のサーバーサイド検証
- フロントエンドでの表示は参考情報
- 実際のAI実行時は必ず`checkAICreditLimit()`でサーバーサイド検証
- RPC関数`check_ai_credit_limit`でデータベースレベルでチェック

### 不正利用の防止
- 日次リセットはUTC 00:00に自動実行
- ユーザーによる手動リセットは不可
- APIリクエストは認証必須

## まとめ

### ✅ 完了した実装
1. ユーザー向けAIモード選択UI（スピード/ハイクオリティ）
2. 管理者用デフォルトAI設定のKDLページへの配置
3. プラン上限の修正（Standard: 50→30、Pro/Businessの内訳明確化）
4. KDLページへの統合

### ⏳ 手動対応が必要
1. データベースマイグレーション実行
2. 管理者フラグ設定
3. AI実行エンドポイントでのモード選択機能の実装
4. LP料金説明の更新

### 💰 利益保護の効果
- Liteプラン: Gemini Flash限定で原価安定
- Standardプラン: 50→30回で利益圧迫防止
- Proプラン: 高性能AIに20回キャップで原価爆発防止
- Businessプラン: 「無制限」訴求を維持しつつ最高性能AIは50回制限

---

**作成日**: 2026-01-10  
**バージョン**: 1.0  
**ステータス**: ✅ UI実装完了 / ⏳ バックエンド連携待ち














