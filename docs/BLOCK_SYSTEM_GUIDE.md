# ブロックシステム詳細ガイド

このドキュメントでは、ビジネスLPメーカーのブロックシステムを詳細に解説します。

## 目次

1. [ブロックシステムの概要](#1-ブロックシステムの概要)
2. [ブロック型定義一覧](#2-ブロック型定義一覧)
3. [BlockRenderer コンポーネント](#3-blockrenderer-コンポーネント)
4. [エディタでのブロック操作](#4-エディタでのブロック操作)
5. [新しいブロックの追加方法](#5-新しいブロックの追加方法)
6. [ブロック間のデータ連携](#6-ブロック間のデータ連携)
7. [スタイリングガイドライン](#7-スタイリングガイドライン)

---

## 1. ブロックシステムの概要

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    BusinessLPEditor.tsx                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  blocks: Block[] (useState)                              ││
│  │  - 全ブロックの状態を管理                                  ││
│  │  - JSONBとしてSupabaseに保存                              ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│              ┌─────────────┴─────────────┐                  │
│              ▼                           ▼                  │
│  ┌───────────────────┐      ┌───────────────────┐          │
│  │   編集パネル        │      │   プレビュー       │          │
│  │   (左カラム)        │      │   (右カラム)       │          │
│  │                   │      │                   │          │
│  │   - 各ブロックの    │      │   BlockRenderer   │          │
│  │     編集フォーム    │      │   を使用して       │          │
│  │   - 追加/削除ボタン │      │   レンダリング     │          │
│  └───────────────────┘      └───────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

```
1. 初期ロード
   Supabase → content JSONB → migrateOldContent() → blocks state

2. 編集
   ユーザー入力 → updateBlock() → blocks state → プレビュー反映

3. 保存
   blocks state → saveBusinessProject() → Supabase content JSONB

4. 公開ページ表示
   Supabase → migrateOldContent() → BlockRenderer → HTML出力
```

---

## 2. ブロック型定義一覧

### 基本構造

すべてのブロックは以下の基本構造を持ちます：

```typescript
{
  id: string;      // 一意のID（generateBlockId()で生成）
  type: string;    // ブロックタイプ
  data: object;    // ブロック固有のデータ
}
```

### 各ブロックタイプの詳細

#### `header` - ヘッダー/プロフィールヘッダー

```typescript
type HeaderBlockData = {
  avatar: string;    // プロフィール画像URL（空文字可）
  name: string;      // 名前・会社名
  title: string;     // キャッチコピー（改行対応）
  category?: string; // カテゴリ（表示用）
};
```

**用途**: ページ上部のプロフィール表示
**特記**: avatarが空の場合、nameの頭文字でプレースホルダー表示

---

#### `text_card` - テキストカード

```typescript
type TextCardBlockData = {
  title: string;              // カードタイトル
  text: string;               // 本文（改行対応）
  align: 'left' | 'center';   // テキスト配置
};
```

**用途**: 自己紹介、サービス説明など
**特記**: `text`内の`\n`は`<br>`に変換される

---

#### `image` - 画像

```typescript
type ImageBlockData = {
  url: string;       // 画像URL
  alt?: string;      // 代替テキスト
  caption?: string;  // キャプション
};
```

**用途**: 写真、図表の表示
**特記**: 最大高さ制限あり（モバイル400px, PC 600px）

---

#### `youtube` - YouTube動画

```typescript
type YouTubeBlockData = {
  url: string;  // YouTube URL（様々な形式に対応）
};
```

**用途**: プロモーション動画、解説動画
**特記**: 以下の形式に対応
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

---

#### `links` - リンク集

```typescript
type LinksBlockData = {
  links: LinkItem[];
};

type LinkItem = {
  label: string;  // リンクテキスト
  url: string;    // URL
  style: string;  // スタイル（'orange', 'blue', 'green', 'purple', ''）
};
```

**用途**: SNSリンク、外部サイトへの誘導
**特記**: 
- クリック時にアナリティクスを記録
- LINE URLは自動で緑色スタイル適用
- アイコン自動判定（Twitter, Facebook, note等）

---

#### `kindle` - Kindle本紹介

```typescript
type KindleBlockData = {
  asin: string;        // ASINコードまたはAmazon URL
  imageUrl: string;    // 書籍カバー画像
  title: string;       // 書籍タイトル
  description: string; // 説明文
};
```

**用途**: 著書の紹介、アフィリエイト
**特記**: ASINは`/dp/XXXXXXXXXX`形式から自動抽出

---

#### `lead_form` - リード獲得フォーム

```typescript
type LeadFormBlockData = {
  title: string;       // フォームタイトル
  buttonText: string;  // 送信ボタンテキスト
};
```

**用途**: メルマガ登録、お問い合わせ
**特記**: 
- メールアドレスを`leads`テーブルに保存
- 送信後は感謝メッセージ表示

---

#### `line_card` - LINE登録カード

```typescript
type LineCardBlockData = {
  title: string;       // タイトル
  description: string; // 説明文
  url: string;         // LINE友だち追加URL
  buttonText: string;  // ボタンテキスト
  qrImageUrl?: string; // QRコード画像（オプション）
};
```

**用途**: LINE公式アカウントへの誘導
**特記**: 緑色の目立つデザイン

---

#### `faq` - よくある質問

```typescript
type FAQBlockData = {
  items: FAQItem[];
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};
```

**用途**: Q&A、疑問解消
**特記**: アコーディオン形式で展開/折りたたみ

---

#### `pricing` - 料金表

```typescript
type PricingBlockData = {
  plans: PricingPlan[];
};

type PricingPlan = {
  id: string;
  title: string;          // プラン名
  price: string;          // 価格（文字列で自由形式）
  features: string[];     // 特徴リスト
  isRecommended: boolean; // おすすめフラグ
};
```

**用途**: サービス料金の提示
**特記**: おすすめプランは黄色ハイライト

---

#### `testimonial` - お客様の声

```typescript
type TestimonialBlockData = {
  items: TestimonialItem[];
  isFullWidth?: boolean;
};

type TestimonialItem = {
  id: string;
  name: string;       // お客様名
  role: string;       // 肩書き
  comment: string;    // コメント
  imageUrl?: string;  // 写真（オプション）
};
```

**用途**: 社会的証明、信頼構築
**特記**: 画像がない場合は名前の頭文字でアバター生成

---

#### `quiz` - 診断クイズ埋め込み

```typescript
type QuizBlockData = {
  quizId?: string;   // クイズID
  quizSlug?: string; // クイズslug
  title?: string;    // カスタムタイトル
};
```

**用途**: 別サービス（診断クイズメーカー）との連携
**特記**: `quizzes`テーブルから動的に取得

---

#### `hero` - ヒーローセクション

```typescript
type HeroBlockData = {
  headline: string;         // メインコピー
  subheadline: string;      // サブコピー
  imageUrl?: string;        // 中央画像
  ctaText?: string;         // CTAボタンテキスト
  ctaUrl?: string;          // CTAボタンURL
  backgroundImage?: string; // 背景画像
  backgroundColor?: string; // 背景色/グラデーション
  isFullWidth?: boolean;    // 全幅表示
};
```

**用途**: ファーストビュー、アイキャッチ
**特記**: 
- 背景画像使用時は自動でオーバーレイ適用
- isFullWidth=trueでコンテナ幅を超えて表示

---

#### `features` - 特徴・ベネフィット

```typescript
type FeaturesBlockData = {
  title?: string;
  items: FeatureItem[];
  columns: 2 | 3;
  isFullWidth?: boolean;
};

type FeatureItem = {
  id: string;
  icon?: string;       // 絵文字またはアイコンURL
  title: string;
  description: string;
};
```

**用途**: サービスの特徴、選ばれる理由
**特記**: 2列または3列のグリッドレイアウト

---

#### `cta_section` - CTAセクション

```typescript
type CTASectionBlockData = {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  isFullWidth?: boolean;
};
```

**用途**: コンバージョンポイント、アクション誘導
**特記**: 背景色/グラデーションでインパクトを出す

---

#### `two_column` - 2カラムレイアウト

```typescript
type TwoColumnBlockData = {
  layout: 'image-left' | 'image-right';
  imageUrl: string;
  title: string;
  text: string;
  listItems?: string[];
};
```

**用途**: 画像とテキストの組み合わせ
**特記**: モバイルでは縦積み

---

#### `hero_fullwidth` - フルワイドヒーロー

```typescript
type HeroFullwidthBlockData = {
  headline: string;
  subheadline: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  backgroundColor?: string;
};
```

**用途**: インパクトのあるファーストビュー
**特記**: 常にフル幅で表示

---

#### `problem_cards` - 問題提起カード

```typescript
type ProblemCardsBlockData = {
  title?: string;
  subtitle?: string;
  items: {
    id: string;
    icon?: string;
    title: string;
    description: string;
    borderColor?: 'blue' | 'red' | 'green' | 'orange' | 'purple';
  }[];
  isFullWidth?: boolean;
};
```

**用途**: 顧客の悩みの可視化
**特記**: 左ボーダーのアクセントカラー

---

#### `dark_section` - ダークセクション

```typescript
type DarkSectionBlockData = {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  accentColor?: 'orange' | 'blue' | 'purple' | 'green';
  items: {
    id: string;
    title: string;
    description: string;
    icon?: string;
  }[];
  isFullWidth?: boolean;
};
```

**用途**: コントラストのあるセクション、重要なポイント
**特記**: ダーク背景で視覚的な区切り

---

#### `case_study_cards` - 事例紹介カード

```typescript
type CaseStudyCardsBlockData = {
  title?: string;
  items: {
    id: string;
    imageUrl: string;
    category: string;
    categoryColor?: 'pink' | 'cyan' | 'green' | 'orange' | 'purple';
    title: string;
    description: string;
  }[];
};
```

**用途**: 導入事例、実績紹介
**特記**: ホバー時のリフトアップアニメーション

---

#### `bonus_section` - 特典セクション

```typescript
type BonusSectionBlockData = {
  title: string;
  subtitle?: string;
  backgroundGradient?: string;
  items: {
    id: string;
    icon?: string;
    title: string;
    description: string;
  }[];
  qrImageUrl?: string;
  qrText?: string;
  ctaText?: string;
  ctaUrl?: string;
  isFullWidth?: boolean;
};
```

**用途**: 購入特典、無料プレゼント
**特記**: グラデーション背景で目立たせる

---

#### `checklist_section` - チェックリスト

```typescript
type ChecklistSectionBlockData = {
  title?: string;
  backgroundColor?: string;
  items: {
    id: string;
    icon?: string;
    title: string;
    description?: string;
  }[];
  columns?: 1 | 2;
  isFullWidth?: boolean;
};
```

**用途**: 含まれるもの、条件一覧
**特記**: 1列または2列表示

---

#### `google_map` - Googleマップ

```typescript
type GoogleMapBlockData = {
  address?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  title?: string;
  description?: string;
  showDirections?: boolean;
};
```

**用途**: 店舗・オフィスの所在地表示
**特記**: 
- APIキー不要（埋め込みマップ使用）
- 経路案内リンク生成可能

---

## 3. BlockRenderer コンポーネント

### 基本構造

```typescript
// components/BlockRenderer.tsx

export function BlockRenderer({ 
  block, 
  profileId, 
  contentType = 'profile' 
}: { 
  block: Block; 
  profileId?: string; 
  contentType?: 'profile' | 'business' 
}) {
  switch (block.type) {
    case 'header':
      return <HeaderSection block={block} />;
    
    case 'links':
      // アナリティクス付きリンク
      return <LinksSection 
        block={block} 
        profileId={profileId}
        contentType={contentType}
        onClickTrack={async (url) => {
          await saveAnalyticsForContentType(contentType, profileId, 'click', { url });
        }}
      />;
    
    case 'lead_form':
      // クライアントコンポーネント
      return <LeadFormBlock block={block} profileId={profileId} />;
    
    // ... 他のブロック
    
    default:
      return null;
  }
}
```

### アナリティクス連携

クリックトラッキングが必要なブロック：
- `links`
- `kindle`
- `line_card`
- `hero` (CTAボタン)
- `cta_section`
- `bonus_section` (CTAボタン)

```typescript
// アナリティクス保存のヘルパー関数
async function saveAnalyticsForContentType(
  contentType: 'profile' | 'business',
  profileIdOrSlug: string,
  eventType: 'view' | 'click' | 'scroll' | 'time' | 'read',
  eventData?: { url?: string; scrollDepth?: number; timeSpent?: number; }
) {
  if (contentType === 'business') {
    return saveBusinessAnalytics(profileIdOrSlug, eventType, eventData);
  } else {
    return saveAnalytics(profileIdOrSlug, eventType, eventData);
  }
}
```

---

## 4. エディタでのブロック操作

### ブロック追加 (addBlock)

```typescript
const addBlock = (type: Block['type']) => {
  const newBlock: Block = (() => {
    switch (type) {
      case 'header':
        return {
          id: generateBlockId(),
          type: 'header',
          data: { avatar: '', name: '', title: '', category: 'other' }
        };
      
      case 'features':
        return {
          id: generateBlockId(),
          type: 'features',
          data: { 
            title: '特徴・ベネフィット', 
            items: [
              { id: generateBlockId(), icon: '✓', title: '特徴1', description: '説明文' },
              { id: generateBlockId(), icon: '✓', title: '特徴2', description: '説明文' },
              { id: generateBlockId(), icon: '✓', title: '特徴3', description: '説明文' }
            ], 
            columns: 3 
          }
        };
      
      // ... 他のタイプ
    }
  })();
  
  setBlocks(prev => [...prev, newBlock]);
  setExpandedBlocks(prev => new Set([...prev, newBlock.id])); // 自動展開
};
```

### ブロック削除 (removeBlock)

```typescript
const removeBlock = (blockId: string) => {
  if (!confirm('このブロックを削除しますか？')) return;
  setBlocks(prev => prev.filter(b => b.id !== blockId));
  setSelectedBlockId(null);
};
```

### ブロック移動 (moveBlock)

```typescript
const moveBlock = (blockId: string, direction: 'up' | 'down') => {
  setBlocks(prev => {
    const index = prev.findIndex(b => b.id === blockId);
    if (index === -1) return prev;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= prev.length) return prev;
    
    // 不変性を保った入れ替え
    const newBlocks = [...prev];
    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    return newBlocks;
  });
};
```

### ブロック更新 (updateBlock)

```typescript
const updateBlock = (blockId: string, updates: Partial<Block['data']>) => {
  setBlocks(prev => prev.map(block => {
    if (block.id === blockId) {
      return {
        ...block,
        data: { ...block.data, ...updates }
      } as Block;
    }
    return block;
  }));
};
```

### 配列アイテム操作（FAQ, Pricing, Features等）

```typescript
// アイテム追加
const addItemToBlock = (blockId: string) => {
  setBlocks(prev => prev.map(block => {
    if (block.id === blockId) {
      const newItem = { id: generateBlockId() };
      
      if (block.type === 'faq') {
        return { 
          ...block, 
          data: { 
            ...block.data, 
            items: [...block.data.items, { ...newItem, question: '', answer: '' }] 
          }
        };
      }
      // ... 他のタイプ
    }
    return block;
  }));
};

// アイテム削除
const removeItemFromBlock = (blockId: string, itemIndex: number) => {
  setBlocks(prev => prev.map(block => {
    if (block.id === blockId && 'items' in block.data) {
      return {
        ...block,
        data: {
          ...block.data,
          items: block.data.items.filter((_, i) => i !== itemIndex)
        }
      };
    }
    return block;
  }));
};

// アイテム更新
const updateItemInBlock = (blockId: string, itemIndex: number, updates: any) => {
  setBlocks(prev => prev.map(block => {
    if (block.id === blockId && 'items' in block.data) {
      return {
        ...block,
        data: {
          ...block.data,
          items: block.data.items.map((item, i) => 
            i === itemIndex ? { ...item, ...updates } : item
          )
        }
      };
    }
    return block;
  }));
};
```

---

## 5. 新しいブロックの追加方法

### ステップ1: 型定義 (`lib/types.ts`)

```typescript
// 新しいブロックのデータ型を定義
export type CountdownBlockData = {
  targetDate: string;      // 終了日時
  title: string;           // タイトル
  description?: string;    // 説明文
  ctaText?: string;        // ボタンテキスト
  ctaUrl?: string;         // ボタンURL
};

// Block union型に追加
export type Block = 
  | { id: string; type: 'header'; data: HeaderBlockData }
  // ... 既存のブロック
  | { id: string; type: 'countdown'; data: CountdownBlockData };  // 追加
```

### ステップ2: レンダラー (`components/BlockRenderer.tsx`)

```typescript
// コンポーネント定義
function CountdownBlock({ 
  block, 
  profileId, 
  contentType 
}: { 
  block: Extract<Block, { type: 'countdown' }>; 
  profileId?: string;
  contentType?: 'profile' | 'business';
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(block.data.targetDate).getTime();
      const diff = target - now;
      
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [block.data.targetDate]);
  
  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold mb-4">{block.data.title}</h3>
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-red-500 text-white px-4 py-2 rounded">
            <span className="text-2xl font-bold">{timeLeft.days}</span>
            <span className="text-xs block">日</span>
          </div>
          {/* ... 時間、分、秒 */}
        </div>
        {block.data.ctaText && block.data.ctaUrl && (
          <a href={block.data.ctaUrl} className="btn-primary">
            {block.data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

// switch文に追加
export function BlockRenderer({ block, profileId, contentType }) {
  switch (block.type) {
    // ... 既存のケース
    
    case 'countdown':
      return <CountdownBlock block={block} profileId={profileId} contentType={contentType} />;
    
    default:
      return null;
  }
}
```

### ステップ3: エディタ (`components/BusinessLPEditor.tsx`)

#### addBlock関数に追加

```typescript
case 'countdown':
  return {
    id: generateBlockId(),
    type: 'countdown',
    data: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日後
      title: 'キャンペーン終了まで',
      description: '',
      ctaText: '',
      ctaUrl: ''
    }
  };
```

#### 編集フォームを追加

```typescript
{block.type === 'countdown' && (
  <div className="space-y-3">
    <Input 
      label="タイトル" 
      val={block.data.title} 
      onChange={v => updateBlock(block.id, { title: v })} 
    />
    <div className="mb-4">
      <label className="text-sm font-bold text-gray-900 block mb-2">終了日時</label>
      <input 
        type="datetime-local"
        className="w-full border border-gray-300 p-3 rounded-lg"
        value={block.data.targetDate?.slice(0, 16) || ''}
        onChange={e => updateBlock(block.id, { targetDate: new Date(e.target.value).toISOString() })}
      />
    </div>
    <Textarea 
      label="説明文" 
      val={block.data.description || ''} 
      onChange={v => updateBlock(block.id, { description: v })} 
    />
    <Input 
      label="ボタンテキスト" 
      val={block.data.ctaText || ''} 
      onChange={v => updateBlock(block.id, { ctaText: v })} 
    />
    <Input 
      label="ボタンURL" 
      val={block.data.ctaUrl || ''} 
      onChange={v => updateBlock(block.id, { ctaUrl: v })} 
    />
  </div>
)}
```

#### ブロック追加ボタンを追加

```typescript
<button 
  onClick={() => addBlock('countdown')}
  className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
>
  <Clock className="w-6 h-6 mb-1 text-gray-400 group-hover:text-indigo-500" />
  <span className="text-xs text-gray-600 group-hover:text-indigo-600 font-medium">カウントダウン</span>
</button>
```

### ステップ4: マイグレーション対応 (オプション)

既存データの後方互換性が必要な場合：

```typescript
// lib/types.ts の migrateOldContent 関数
export function migrateOldContent(oldContent: any): Block[] {
  // ... 既存のマイグレーション
  
  // 新ブロックのマイグレーション
  case 'countdown':
    return {
      id: oldBlock.id || generateBlockId(),
      type: 'countdown',
      data: {
        targetDate: oldBlock.data?.targetDate || new Date().toISOString(),
        title: oldBlock.data?.title || 'カウントダウン',
        // ... デフォルト値設定
      }
    };
}
```

---

## 6. ブロック間のデータ連携

### ヘッダー情報の参照

```typescript
// 他のブロックからヘッダー情報を参照
const headerBlock = blocks.find(b => b.type === 'header');
const profileName = headerBlock?.type === 'header' 
  ? headerBlock.data.name 
  : 'ビジネスLP';
```

### 共通設定の適用

```typescript
// テーマカラーの取得
const theme = settings?.theme;
const primaryColor = theme?.gradient?.match(/#[a-fA-F0-9]{6}/)?.[0] || '#667eea';
```

---

## 7. スタイリングガイドライン

### 共通クラス

```css
/* グラスモーフィズム */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* リンクボタン */
.link-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

/* フェードインアニメーション */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### レスポンシブ対応

```typescript
// モバイル優先のクラス設計
<div className="text-sm md:text-base lg:text-lg">
<div className="px-4 md:px-6 lg:px-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### フル幅ブロックの判定

```typescript
const isFullWidthBlock = 
  block.type === 'hero_fullwidth' || 
  (block.type === 'hero' && block.data.isFullWidth) ||
  (block.type === 'features' && block.data.isFullWidth) ||
  (block.type === 'cta_section' && block.data.isFullWidth) ||
  (block.type === 'dark_section' && block.data.isFullWidth);

// レイアウト適用
<div className={isFullWidthBlock ? 'w-full' : 'container mx-auto max-w-4xl px-4'}>
  <BlockRenderer block={block} />
</div>
```

---

*このドキュメントはブロックシステムの実装詳細を解説しています。*
*実際のコードは各ファイルを参照してください。*

