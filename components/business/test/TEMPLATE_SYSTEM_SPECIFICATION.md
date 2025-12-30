# テンプレートシステム仕様書

## 📋 目次
1. [概要](#概要)
2. [テンプレートの構造](#テンプレートの構造)
3. [テンプレートの種類](#テンプレートの種類)
4. [関連ファイル](#関連ファイル)
5. [実装詳細](#実装詳細)
6. [使用方法](#使用方法)
7. [テンプレートの追加方法](#テンプレートの追加方法)

---

## 概要

### テンプレートシステムとは
ユーザーが業種や目的に応じて、プロフェッショナルなビジネスLPを簡単に作成できるよう、あらかじめ設計されたレイアウトとコンテンツのセットを提供する機能です。

### 主な特徴
- **業種別最適化**: コンサルタント、コーチ、店舗、フリーランスなど、業種ごとに最適化されたレイアウト
- **マーケティング法則対応**: PASONA、AIDOMA、QUEST法則など、マーケティング理論に基づいたテンプレート
- **カスタマイズ可能**: テンプレート適用後も自由に編集可能
- **即座にプレビュー**: 選択したテンプレートをリアルタイムでプレビュー

### 対応サービス
- **ビジネスLP**: `/business/dashboard/editor`で使用
- **プロフィールLP**: 将来的に対応予定

---

## テンプレートの構造

### TypeScript型定義

```typescript
// constants/templates/types.ts

export interface Template {
  id: string;                    // テンプレートの一意なID
  name: string;                  // テンプレート名（表示用）
  description: string;           // テンプレートの説明
  category: string;              // カテゴリ名
  theme: {
    gradient: string;            // 背景グラデーション（CSS）
    backgroundImage?: string;    // 背景画像URL（オプション）
  };
  blocks: Block[];               // ブロックデータの配列
  icon?: string;                 // アイコン名（lucide-react）
  recommended?: boolean;         // おすすめテンプレートフラグ
  order?: number;                // 表示順序
}
```

### カテゴリー一覧

```typescript
export type TemplateCategory = 
  | 'コンサルタント・士業'
  | 'コーチ・講師'
  | '物販・EC'
  | '店舗ビジネス'
  | 'カフェ・飲食店'
  | 'フリーランス'
  | 'マーケティング法則';
```

### テンプレートID一覧

```typescript
export type TemplateId = 
  | 'consultant'        // コンサルタント・士業
  | 'coach'             // コーチ・講師
  | 'retail-ec'         // 物販・EC
  | 'store'             // 店舗ビジネス
  | 'cafe-restaurant'   // カフェ・飲食店
  | 'freelance'         // フリーランス
  | 'pasona'            // PASONA法則
  | 'aidoma'            // AIDOMA法則
  | 'quest';            // QUEST法則
```

---

## テンプレートの種類

### 1. 業種別テンプレート

#### コンサルタント・士業（consultant）
- **対象**: 経営コンサル、税理士、弁護士、社労士など
- **特徴**: 信頼性と実績を重視した構成
- **ブロック構成**:
  - ヘッダー（プロフィール）
  - キャッチコピー
  - 選ばれる3つの理由
  - お客様の声
  - 料金プラン（3段階）
  - FAQ
  - お問い合わせフォーム
- **カラー**: ネイビーブルー系（#1e3a5f）

#### コーチ・講師（coach）
- **対象**: ライフコーチ、ビジネスコーチ、セミナー講師
- **特徴**: 悩み共感から解決策提示
- **ブロック構成**:
  - ヘッダー
  - ヒーロー（全幅）
  - 問題提起カード
  - コーチングメソッド
  - お客様の声
  - 料金プラン
  - LINE登録カード
- **カラー**: パープル系（#7c3aed）

#### 物販・EC（retail-ec）
- **対象**: ネットショップ、ハンドメイド作家
- **特徴**: 商品の魅力を視覚的に訴求
- **ブロック構成**:
  - ヘッダー
  - メイン画像
  - コンセプト説明
  - こだわりポイント
  - お客様の声
  - リンク集（minne、Creemaなど）
  - FAQ
  - LINE登録（クーポン付き）
- **カラー**: ピンク系（#f472b6）

#### 店舗ビジネス（store）
- **対象**: 美容室、整体院、エステ、ジム
- **特徴**: メニュー・アクセス・予約導線を最適化
- **ブロック構成**:
  - ヘッダー
  - ヒーロー（全幅背景画像）
  - 店舗の特徴
  - 料金プラン（メニュー）
  - お客様の声
  - Googleマップ
  - FAQ
  - LINE予約カード
- **カラー**: グリーン系（#10b981）

#### カフェ・飲食店（cafe-restaurant）
- **対象**: カフェ、レストラン、居酒屋
- **特徴**: 雰囲気とメニューを魅力的に紹介
- **ブロック構成**:
  - ヘッダー
  - 店内画像
  - コンセプト
  - こだわりポイント
  - メニュー（料金表）
  - 料理画像
  - Googleマップ
  - SNSリンク
  - LINE登録
- **カラー**: ブラウン系（#92400e）

#### フリーランス（freelance）
- **対象**: デザイナー、エンジニア、ライター
- **特徴**: スキル・実績・料金を効果的にアピール
- **ブロック構成**:
  - ヘッダー
  - 自己紹介
  - ポートフォリオ画像
  - 提供サービス
  - お客様の声
  - 料金表
  - 制作の流れ
  - ポートフォリオリンク
  - お問い合わせフォーム
- **カラー**: ブルー系（#3b82f6）

---

### 2. マーケティング法則テンプレート

#### PASONA法則（pasona）
- **構成**: Problem → Affinity → Solution → Offer → Narrowing → Action
- **特徴**: 問題提起から解決策提示、限定性を持たせた行動喚起
- **ブロック構成**:
  1. 【Problem】問題提起
  2. 問題カード（3つ）
  3. 【Affinity】親近感（共感）
  4. 【Solution】解決策（3つの特徴）
  5. なぜ解決できるのか
  6. お客様の声
  7. 【Offer】料金プラン
  8. 【Narrowing】限定性（残り枠）
  9. FAQ
  10. 【Action】お問い合わせフォーム
- **カラー**: ピンク・レッド系（#ec4899）
- **推奨**: おすすめテンプレート

#### AIDOMA法則（aidoma）
- **構成**: Attention → Interest → Desire → Opportunity → Memory → Action
- **特徴**: 注目を集め、興味を引き、欲求を刺激
- **ブロック構成**:
  1. 【Attention】注目を集めるヘッダー
  2. ヒーロー（衝撃的なキャッチコピー）
  3. 【Interest】興味を引く問題提起
  4. イメージ画像
  5. 【Desire】5つのメリット
  6. 理想の未来
  7. お客様の声
  8. 【Opportunity】料金プラン
  9. 【Memory】FAQ（記憶に残す）
  10. 最後のメッセージ
  11. 【Action】お問い合わせフォーム
- **カラー**: オレンジ系（#f97316）
- **推奨**: おすすめテンプレート

#### QUEST法則（quest）
- **構成**: Qualify → Understand → Educate → Stimulate → Transition
- **特徴**: ターゲットを明確にし、理解と教育を経て購買意欲を高める
- **ブロック構成**:
  1. 【Qualify】ターゲット絞り込み
  2. 課題カード（3つ）
  3. 【Understand】理解（共感）
  4. 【Educate】教育（なぜ失敗するのか）
  5. 選ばれる理由（4つ）
  6. 成功プロセス
  7. お客様の声
  8. 【Stimulate】理想の未来
  9. 料金プラン
  10. FAQ
  11. 【Transition】変化への行動
  12. お問い合わせフォーム
- **カラー**: ティール系（#14b8a6）
- **推奨**: おすすめテンプレート

---

## 関連ファイル

### 1. テンプレート定義ファイル

```
constants/templates/
├── types.ts              # 型定義（Template, TemplateCategory, TemplateId）
├── index.ts              # 全テンプレートの集約・エクスポート
├── consultant.ts         # コンサルタント・士業テンプレート
├── coach.ts              # コーチ・講師テンプレート
├── retail-ec.ts          # 物販・ECテンプレート
├── store.ts              # 店舗ビジネステンプレート
├── cafe-restaurant.ts    # カフェ・飲食店テンプレート
├── freelance.ts          # フリーランステンプレート
├── pasona.ts             # PASONA法則テンプレート
├── aidoma.ts             # AIDOMA法則テンプレート
└── quest.ts              # QUEST法則テンプレート
```

#### `constants/templates.ts`（後方互換用）
```typescript
// 後方互換のための再エクスポート
// 新しいテンプレートは constants/templates/ ディレクトリから読み込まれます

export type { Template, TemplateCategory, TemplateId } from './templates/index';

export { 
  templates, 
  recommendedTemplates,
  getTemplateById,
  getTemplatesByCategory,
  consultantTemplate,
  coachTemplate,
  retailEcTemplate,
  storeTemplate,
  cafeRestaurantTemplate,
  freelanceTemplate,
} from './templates/index';
```

---

### 2. エディタコンポーネント

#### `components/BusinessLPEditor.tsx`（3897行）
テンプレート機能を実装しているメインコンポーネント

**主要な機能**:
- テンプレート選択モーダル表示
- テンプレート適用処理
- セッションストレージでのテンプレートID管理
- 新規作成時の自動読み込み

**テンプレート関連のState**:
```typescript
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [blocks, setBlocks] = useState<Block[]>([]);
const [theme, setTheme] = useState<{ gradient?: string; backgroundImage?: string }>({});
```

**テンプレート関連の主要関数**:
```typescript
// テンプレート自動読み込み（新規作成時）
useEffect(() => {
  if (!initialSlug) {
    const templateId = sessionStorage.getItem('selectedTemplateId');
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const newBlocks = template.blocks.map(block => ({
          ...block,
          id: generateBlockId()  // IDを再生成
        }));
        setBlocks(newBlocks);
        setTheme(template.theme);
        sessionStorage.removeItem('selectedTemplateId');
      }
    }
  }
}, []);

// テンプレート選択時の処理
const applyTemplate = (template: Template) => {
  if (blocks.length > 0 && !confirm('現在の入力内容は消えますがよろしいですか？')) {
    return;
  }
  
  const newBlocks = template.blocks.map(block => ({
    ...block,
    id: generateBlockId()
  }));
  
  setBlocks(newBlocks);
  setTheme(template.theme);
  setExpandedBlocks(new Set(newBlocks.map(b => b.id)));
  setShowTemplateModal(false);
  alert(`「${template.name}」テンプレートを読み込みました！`);
};
```

---

### 3. ダッシュボードコンポーネント

#### `components/BusinessDashboard.tsx`
テンプレート選択からエディタへの遷移を管理

**テンプレート選択フロー**:
```typescript
const handleTemplateSelect = (templateId: string) => {
  // セッションストレージにテンプレートIDを保存
  sessionStorage.setItem('selectedTemplateId', templateId);
  // 新規作成ページへ遷移
  router.push('/business/dashboard/editor/new');
};
```

---

### 4. 型定義ファイル

#### `lib/types.ts`
ブロックの型定義

```typescript
export type BlockType = 
  | 'header'
  | 'text_card'
  | 'image'
  | 'youtube'
  | 'links'
  | 'kindle'
  | 'lead_form'
  | 'line_card'
  | 'faq'
  | 'pricing'
  | 'testimonial'
  | 'quiz'
  | 'hero_fullwidth'
  | 'problem_cards'
  | 'features'
  | 'google_map';

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
```

---

### 5. データベーステーブル

#### `business_projects`テーブル
テンプレートから作成されたLPのデータを保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| slug | TEXT | URLスラッグ |
| nickname | TEXT | ニックネーム（オプション） |
| content | JSONB | **ブロックデータ（テンプレートのblocks）** |
| settings | JSONB | 設定データ |
| user_id | UUID | ユーザーID |
| featured_on_top | BOOLEAN | トップページ掲載 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**contentカラムの構造**:
```json
{
  "blocks": [
    {
      "id": "block_1234567890_abc123",
      "type": "header",
      "data": {
        "avatar": "https://...",
        "name": "田中 誠",
        "title": "中小企業診断士"
      }
    },
    // ... その他のブロック
  ],
  "theme": {
    "gradient": "linear-gradient(-45deg, #1e3a5f, ...)"
  }
}
```

---

## 実装詳細

### テンプレート適用のフロー

```
┌──────────────────────┐
│ 1. ダッシュボード      │
│    トップページ        │
└──────────┬───────────┘
           │
           │ テンプレートカードをクリック
           ↓
┌──────────────────────┐
│ 2. sessionStorageに   │
│    テンプレートIDを保存│
└──────────┬───────────┘
           │
           │ /business/dashboard/editor/new へ遷移
           ↓
┌──────────────────────┐
│ 3. エディタページ起動  │
│    (BusinessLPEditor) │
└──────────┬───────────┘
           │
           │ useEffect() 実行
           ↓
┌──────────────────────┐
│ 4. sessionStorageから │
│    テンプレートID取得  │
└──────────┬───────────┘
           │
           │ templates.find(t => t.id === templateId)
           ↓
┌──────────────────────┐
│ 5. テンプレート検索    │
└──────────┬───────────┘
           │
           │ テンプレートが見つかった場合
           ↓
┌──────────────────────┐
│ 6. ブロックIDを再生成  │
│    (generateBlockId)  │
└──────────┬───────────┘
           │
           │ template.blocks.map()
           ↓
┌──────────────────────┐
│ 7. Stateに設定        │
│    - setBlocks()     │
│    - setTheme()      │
└──────────┬───────────┘
           │
           │ プレビューに反映
           ↓
┌──────────────────────┐
│ 8. ユーザーが編集可能  │
└──────────────────────┘
```

---

### ブロックIDの再生成が必要な理由

テンプレートのブロックIDをそのまま使うと、以下の問題が発生します：
1. **複数のLPで同じIDが使われる**
2. **編集時の競合**
3. **データの整合性の問題**

そのため、テンプレート適用時に必ず新しいIDを生成します：

```typescript
const newBlocks = template.blocks.map(block => ({
  ...block,
  id: generateBlockId()  // 新しいIDを生成
}));
```

---

### テンプレートモーダルのUI

#### モーダルの表示条件
```typescript
{showTemplateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-6xl w-full">
      {/* テンプレート一覧 */}
    </div>
  </div>
)}
```

#### テンプレートカードのレイアウト
```typescript
<div className="grid md:grid-cols-4 gap-3">
  {templates.map((template) => (
    <div key={template.id} onClick={() => applyTemplate(template)}>
      {/* グラデーション背景 */}
      <div style={{ background: template.theme.gradient }} />
      
      {/* テンプレート情報 */}
      <div>
        <span className="badge">{template.category}</span>
        <h4>{template.name}</h4>
        <p>{template.description}</p>
        <div>{template.blocks.length}個のブロック</div>
      </div>
    </div>
  ))}
</div>
```

---

## 使用方法

### エンドユーザーの操作フロー

#### 方法1: ダッシュボードから選択
1. ビジネスLPダッシュボード（`/business/dashboard`）にアクセス
2. 「テンプレートから始める」セクションでテンプレートカードをクリック
3. 自動的にエディタが開き、テンプレートが適用される
4. 内容を編集して保存

#### 方法2: エディタ内で選択
1. エディタ（`/business/dashboard/editor/new`）にアクセス
2. 「テンプレートから始める」ボタンをクリック
3. テンプレート一覧モーダルから選択
4. テンプレートが適用される
5. 内容を編集して保存

---

### 開発者向け使用方法

#### テンプレートのインポート
```typescript
import { templates, Template } from '@/constants/templates';

// 全テンプレート取得
console.log(templates);  // Template[]

// 特定のテンプレート取得
import { consultantTemplate } from '@/constants/templates';
console.log(consultantTemplate);  // Template
```

#### テンプレートの検索
```typescript
import { getTemplateById, getTemplatesByCategory } from '@/constants/templates';

// IDで検索
const template = getTemplateById('consultant');

// カテゴリーで検索
const businessTemplates = getTemplatesByCategory('コンサルタント・士業');
```

#### おすすめテンプレートの取得
```typescript
import { recommendedTemplates } from '@/constants/templates';

// おすすめテンプレートのみ（recommended: true）
console.log(recommendedTemplates);
```

---

## テンプレートの追加方法

### 1. 新しいテンプレートファイルを作成

```typescript
// constants/templates/my-template.ts

import { generateBlockId } from '@/lib/types';
import { Template } from './types';

export const myTemplate: Template = {
  id: 'my-template',
  name: '私のテンプレート',
  description: 'テンプレートの説明',
  category: 'カスタム',
  icon: 'Sparkles',
  recommended: false,
  order: 10,
  theme: {
    gradient: 'linear-gradient(-45deg, #667eea, #764ba2)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/...',
        name: 'あなたの名前',
        title: 'キャッチコピー',
        category: 'business'
      }
    },
    // ... その他のブロック
  ]
};
```

---

### 2. index.tsに追加

```typescript
// constants/templates/index.ts

import { myTemplate } from './my-template';

export { myTemplate } from './my-template';

export const templates = [
  consultantTemplate,
  coachTemplate,
  // ... 既存のテンプレート
  myTemplate,  // 追加
].sort((a, b) => (a.order || 0) - (b.order || 0));
```

---

### 3. 型定義を更新（オプション）

```typescript
// constants/templates/types.ts

export type TemplateId = 
  | 'consultant'
  | 'coach'
  // ... 既存のID
  | 'my-template';  // 追加

export type TemplateCategory = 
  | 'コンサルタント・士業'
  | 'コーチ・講師'
  // ... 既存のカテゴリー
  | 'カスタム';  // 追加（必要に応じて）
```

---

### 4. テンプレートのテスト

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで確認
# 1. /business/dashboard にアクセス
# 2. テンプレート一覧に新しいテンプレートが表示されることを確認
# 3. テンプレートを選択して適用
# 4. プレビューで意図通りに表示されることを確認
```

---

## ベストプラクティス

### テンプレート設計のポイント

1. **ブロック数**: 7〜12個程度が最適
   - 多すぎるとユーザーが編集に迷う
   - 少なすぎると情報不足

2. **画像URL**: Unsplashなどの高品質な画像を使用
   ```typescript
   imageUrl: 'https://images.unsplash.com/photo-xxx?w=800&h=500&fit=crop'
   ```

3. **サンプルテキスト**: 具体的でリアルな内容を記載
   - 「〇〇」などのプレースホルダーは最小限に
   - ユーザーが置き換えやすい内容

4. **カラー統一**: グラデーションとブロック内のカラーを統一
   ```typescript
   theme: {
     gradient: 'linear-gradient(-45deg, #3b82f6, #2563eb)'
   }
   // → ブルー系なら、ボタンやアクセントもブルー系に
   ```

5. **ブロックの順序**: マーケティングフローに沿った順序
   - ヘッダー → 問題提起 → 解決策 → 実績 → 料金 → CTA

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. テンプレートが表示されない
- **原因**: `index.ts`でエクスポートされていない
- **解決**: `index.ts`の`templates`配列に追加

#### 2. テンプレート適用時にエラー
- **原因**: ブロックのデータ構造が不正
- **解決**: `Block`型に準拠しているか確認

#### 3. プレビューが崩れる
- **原因**: ブロックタイプが存在しない、またはデータが不足
- **解決**: `BlockRenderer.tsx`で対応しているブロックタイプか確認

#### 4. IDの重複エラー
- **原因**: `generateBlockId()`を使わずに固定IDを使用
- **解決**: 必ず`generateBlockId()`でIDを生成

---

## まとめ

### テンプレートシステムの利点
1. **ユーザー体験の向上**: 初心者でも簡単にプロフェッショナルなLPを作成
2. **時間短縮**: ゼロから作る必要がない
3. **ベストプラクティスの提供**: マーケティング理論に基づいた構成
4. **柔軟性**: テンプレート適用後も自由にカスタマイズ可能

### 今後の拡張予定
- [ ] プレビュー機能（テンプレート選択前に確認）
- [ ] テンプレートのお気に入り機能
- [ ] ユーザーがカスタムテンプレートを保存
- [ ] テンプレートマーケットプレイス（有料テンプレート販売）

---

## 関連ドキュメント
- [BUSINESS_LP_SETUP_GUIDE.md](./BUSINESS_LP_SETUP_GUIDE.md) - ビジネスLP全体のセットアップ
- [BLOCK_SYSTEM_GUIDE.md](./BLOCK_SYSTEM_GUIDE.md) - ブロックシステムの詳細
- [EDITOR_FILES_GUIDE.md](./EDITOR_FILES_GUIDE.md) - エディタの実装詳細
- [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md) - プロジェクト全体の仕様

---

**最終更新日**: 2024年12月30日

