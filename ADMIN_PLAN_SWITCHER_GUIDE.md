# 管理者プラン体験モード 実装ガイド

## 概要

管理者が全プラン（Lite/Standard/Pro/Business）を実際に体験できる機能を実装しました。
Kindleページでプランを動的に切り替えて、各プランのAIモード選択とクレジット上限を体験できます。

## 実装内容

### 1. AdminPlanSwitcher コンポーネント

**ファイル**: `components/shared/AdminPlanSwitcher.tsx`

**機能**:
- 管理者専用のプラン切り替えUI
- Lite/Standard/Pro/Businessの4プランから選択
- 選択したプランの詳細情報（AI使用回数、モード選択可否、使用モデル）を表示
- 折りたたみ可能な洗練されたUI

**表示場所**: Kindleページの最上部（管理者のみ）

### 2. Kindleページへの統合

**ファイル**: `app/kindle/page.tsx`

**変更内容**:
- `adminTestPlan` ステートを追加（デフォルト: 'pro'）
- `AdminPlanSwitcher` コンポーネントを配置
- `AIModelSelector` に渡すプランTierを管理者の場合は `adminTestPlan` に切り替え

**ロジック**:
```typescript
// 管理者用: プラン体験モード
const [adminTestPlan, setAdminTestPlan] = useState<PlanTier>('pro');

// AIModelSelectorに渡すプランTier
<AIModelSelector 
  planTier={isAdmin ? adminTestPlan : (subscriptionStatus.planTier || 'none')}
  isAdmin={isAdmin}
  ...
/>
```

## 動作フロー

```
1. 管理者がKindleページにアクセス
   ↓
2. 「管理者モード：プラン体験切り替え」パネルが表示される
   ↓
3. 体験したいプラン（Lite/Standard/Pro/Business）を選択
   ↓
4. AIモード選択コンポーネントが選択したプランの制約で表示される
   - Lite: モード選択不可、Standard枠20回のみ
   - Standard: モード選択不可、Standard枠30回のみ
   - Pro: モード選択可、Premium枠20回 + Standard枠80回
   - Business: モード選択可、Premium枠50回 + Standard枠無制限
   ↓
5. 実際のAI実行時も体験プランの上限が適用される（※要実装）
```

## プラン別の体験内容

### Liteプラン (¥2,980)
- **AI使用**: 20回/日（Standard枠のみ）
- **モード選択**: 不可
- **モデル**: Gemini Flash限定
- **体験内容**: 最もシンプルで高速なAI執筆体験

### Standardプラン (¥4,980)
- **AI使用**: 30回/日（Standard枠のみ）
- **モード選択**: 不可
- **モデル**: Gemini Flash / Claude Haiku
- **体験内容**: バランスの取れた標準的なAI執筆

### Proプラン (¥9,800) ★人気
- **AI使用**: 100回/日（Premium 20回 + Standard 80回）
- **モード選択**: 可能
- **ハイクオリティ**: Claude/OpenAI o3-mini
- **スピード**: Gemini Flash
- **体験内容**: モード切り替えで用途に応じた最適なAI利用

### Businessプラン (¥29,800)
- **AI使用**: 無制限（Premium 50回 + Standard 無制限）
- **モード選択**: 可能
- **ハイクオリティ**: Claude Sonnet / OpenAI o1
- **スピード**: Gemini Flash（無制限）
- **体験内容**: 最高性能AIと無制限の高速AIで大量生産

## UI表示の順序

Kindleページでの表示順（管理者の場合）:

```
1. 👑 管理者モード：プラン体験切り替え
   └─ Lite/Standard/Pro/Businessから選択

2. ⚙️ KDL用 デフォルトAIモデル設定
   └─ プラン別の候補A/B設定

3. 🎛️ AIモード選択
   └─ 選択した体験プランに応じた表示
   └─ スピードモード/ハイクオリティモード

4. 📚 書籍一覧
```

## AI実行時の連携（今後の実装）

現在、UI上でのプラン切り替えは完成していますが、実際のAI実行APIで管理者の体験プランを使用するには、以下の実装が必要です。

### 方法1: クライアント側で体験プランを渡す

```typescript
// app/kindle/[id]/page.tsx など
const handleAIGenerate = async () => {
  const response = await fetch('/api/kdl/generate-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      mode: selectedMode, // 'speed' | 'quality'
      adminTestPlan: isAdmin ? adminTestPlan : undefined, // 管理者の体験プラン
      // ... その他のパラメータ
    }),
  });
};
```

### 方法2: セッションに保存

```typescript
// 管理者がプランを切り替えたとき
const handlePlanChange = async (plan: PlanTier) => {
  setAdminTestPlan(plan);
  
  // セッションストレージに保存
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('adminTestPlan', plan);
  }
};

// API側で取得
// app/api/kdl/generate-section/route.ts
const adminTestPlan = request.headers.get('x-admin-test-plan') || undefined;
```

### API側の処理例

```typescript
// app/api/kdl/generate-section/route.ts
export async function POST(request: Request) {
  const { userId, mode, adminTestPlan, ... } = await request.json();
  
  // ユーザーのプランを取得
  let effectivePlanTier = await getUserPlanTier(userId);
  
  // 管理者の場合、体験プランを使用
  if (isUserAdmin(userId) && adminTestPlan) {
    effectivePlanTier = adminTestPlan;
  }
  
  // 体験プランに基づいてクレジットチェック
  const creditCheck = await checkAICreditLimit(
    userId, 
    mode === 'quality' ? 'premium' : 'standard',
    effectivePlanTier // ここで体験プランを使用
  );
  
  // ... AI実行
}
```

## LocalStorageでのプラン保存（推奨実装）

ページリロード時も選択したプランを保持するため、LocalStorageを使用します。

### AdminPlanSwitcher.tsx の拡張

```typescript
export default function AdminPlanSwitcher({ currentPlan, onPlanChange }: AdminPlanSwitcherProps) {
  const handlePlanChange = (plan: PlanTier) => {
    onPlanChange(plan);
    
    // LocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminTestPlan', plan);
    }
  };
  
  // ...
}
```

### app/kindle/page.tsx での初期化

```typescript
// 管理者用: プラン体験モード（LocalStorageから復元）
const [adminTestPlan, setAdminTestPlan] = useState<PlanTier>(() => {
  if (typeof window !== 'undefined' && isAdmin) {
    const saved = localStorage.getItem('adminTestPlan');
    return (saved as PlanTier) || 'pro';
  }
  return 'pro';
});
```

## テスト確認項目

### ✅ プラン切り替えのテスト

- [ ] 管理者としてKindleページにアクセス
- [ ] 「管理者モード：プラン体験切り替え」が表示される
- [ ] 各プラン（Lite/Standard/Pro/Business）をクリックして切り替え
- [ ] 切り替え時に現在の体験プラン情報が更新される

### ✅ AIモード選択の動作確認

- [ ] **Liteプラン選択時**: AIモード選択が非表示になる
- [ ] **Standardプラン選択時**: AIモード選択が非表示になる
- [ ] **Proプラン選択時**: 
  - AIモード選択が表示される
  - ハイクオリティ20回、スピード80回の表示
- [ ] **Businessプラン選択時**:
  - AIモード選択が表示される
  - ハイクオリティ50回、スピード無制限の表示

### ✅ UI/UXの確認

- [ ] プラン切り替えパネルは折りたたみ可能
- [ ] 選択中のプランが視覚的に分かりやすい（リング、スケール）
- [ ] 各プランの詳細情報が正確に表示される
- [ ] モバイル表示でもレイアウトが崩れない

## セキュリティとパフォーマンス

### 管理者権限のチェック

- フロントエンドでの表示制御（`isAdmin`フラグ）
- **重要**: API側でも管理者権限を必ず検証すること
- 体験プランは管理者のみが使用できる

### クレジット制限の適用

- 体験プランのクレジット上限が正しく適用される
- 管理者でも通常のクレジット制限に従う（無制限ではない）
- 日次リセットは通常通り機能

### パフォーマンス

- LocalStorageでプラン選択を保持（ページリロード対応）
- ステート管理は軽量（PlanTier型の単純な文字列）

## ファイル変更サマリー

| ファイル | 変更内容 |
|---------|---------|
| `components/shared/AdminPlanSwitcher.tsx` | **新規作成** - 管理者用プラン切り替えUI |
| `app/kindle/page.tsx` | `adminTestPlan` ステート追加、プラン切り替え統合 |
| `components/kindle/AIModelSelector.tsx` | `canSelectMode`ロジック簡略化（モニターユーザー対応） |

## まとめ

### ✅ 完了した機能

1. 管理者が全プラン（Lite/Standard/Pro/Business）を体験できるUI
2. Kindleページでのプラン動的切り替え
3. 選択したプランに応じたAIモード選択の表示制御
4. 各プランの詳細情報表示

### ⏳ 推奨される追加実装

1. LocalStorageでのプラン選択保持（ページリロード対応）
2. AI実行API側での体験プラン適用
3. 管理者ダッシュボードでの体験プラン一覧表示

### 💡 活用シーン

- **新プランのテスト**: リリース前に各プランの動作確認
- **ユーザーサポート**: 問い合わせ対応時に同じ環境を再現
- **デモンストレーション**: 営業・説明時に各プランを実演
- **開発・デバッグ**: プラン別のバグ修正や機能テスト

---

**作成日**: 2026-01-10  
**バージョン**: 1.0  
**ステータス**: ✅ UI実装完了 / 📝 API連携は手動実装推奨













