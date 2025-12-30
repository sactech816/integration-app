# ビジネスLPメーカー - プロジェクト転用ドキュメント

このドキュメントは、本プロジェクトの構造を理解し、他のプロジェクトに転用するための包括的なガイドです。

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構造](#3-ディレクトリ構造)
4. [データベース構造](#4-データベース構造)
5. [エディタシステム](#5-エディタシステム)
6. [ブロックシステム](#6-ブロックシステム)
7. [アナリティクスシステム](#7-アナリティクスシステム)
8. [決済・寄付システム](#8-決済寄付システム)
9. [認証システム](#9-認証システム)
10. [テンプレートシステム](#10-テンプレートシステム)
11. [API エンドポイント](#11-api-エンドポイント)
12. [環境変数](#12-環境変数)
13. [転用時のチェックリスト](#13-転用時のチェックリスト)

---

## 1. プロジェクト概要

ビジネスLPメーカーは、ノーコードでビジネス向けランディングページを作成できるWebアプリケーションです。

### 主な機能
- **ブロックベースエディタ**: ドラッグ&ドロップでLPを構築
- **リアルタイムプレビュー**: 編集中にプレビュー確認
- **テンプレート選択**: 業種別の豊富なテンプレート
- **アナリティクス**: ページビュー、クリック、スクロール深度などの計測
- **AI生成**: キャッチコピーや自己紹介文の自動生成
- **決済機能**: Stripe連携によるPro機能開放
- **QRコード生成**: 作成したLPのQRコード出力

---

## 2. 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **lucide-react** (アイコン)

### バックエンド
- **Next.js API Routes** / **Server Actions**
- **Supabase** (PostgreSQL + Auth + Storage)

### 外部サービス
- **Stripe**: 決済処理
- **Google Gemini**: AI生成（オプション）
- **Unsplash**: 画像検索（オプション）

---

## 3. ディレクトリ構造

```
bussiness-lp-maker/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── analytics.ts          # アナリティクス保存・取得
│   │   ├── business.ts           # ビジネスLP CRUD操作
│   │   ├── leads.ts              # リード獲得データ保存
│   │   └── users.ts              # ユーザー操作
│   ├── api/                      # API Routes
│   │   ├── business-checkout/    # Stripe決済開始
│   │   ├── business-verify/      # 決済検証
│   │   ├── upload-image/         # 画像アップロード
│   │   ├── generate-profile/     # AI生成
│   │   └── ...
│   ├── b/[slug]/                 # ビジネスLP公開ページ
│   │   ├── page.tsx              # LP表示
│   │   ├── layout.tsx            # テーマ適用レイアウト
│   │   └── flyer/page.tsx        # チラシ表示
│   ├── business/dashboard/       # ダッシュボード
│   │   ├── page.tsx              # LP一覧
│   │   └── editor/               # エディタ
│   │       ├── new/page.tsx      # 新規作成
│   │       └── [slug]/page.tsx   # 編集
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.jsx                  # トップページ
│   └── globals.css               # グローバルスタイル
├── components/                   # Reactコンポーネント
│   ├── BusinessLPEditor.tsx      # メインエディタ（★重要）
│   ├── BlockRenderer.tsx         # ブロックレンダラー（★重要）
│   ├── ProfileViewTracker.tsx    # アナリティクストラッカー
│   ├── LinkClickTracker.tsx      # クリックトラッカー
│   ├── TrackingScripts.tsx       # GTM/Pixel埋め込み
│   ├── AuthModal.jsx             # 認証モーダル
│   └── ...
├── constants/
│   └── templates/                # テンプレート定義
│       ├── types.ts              # 型定義
│       ├── index.ts              # エクスポート
│       ├── consultant.ts         # コンサルタント向け
│       └── ...
├── lib/                          # ユーティリティ
│   ├── types.ts                  # ブロック型定義（★重要）
│   ├── supabase.js               # Supabaseクライアント
│   ├── supabase-server.ts        # Server用クライアント
│   └── utils.js                  # ヘルパー関数
└── supabase_*.sql                # データベースセットアップSQL
```

---

## 4. データベース構造

### business_projects テーブル

```sql
CREATE TABLE business_projects (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- URL用スラッグ
  nickname TEXT UNIQUE,                 -- カスタムURL（任意）
  content JSONB NOT NULL DEFAULT '[]',  -- ブロックデータ
  settings JSONB DEFAULT '{}',          -- 設定（テーマ、計測タグ）
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  featured_on_top BOOLEAN DEFAULT true, -- トップ掲載フラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### analytics テーブル

```sql
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,              -- slug（UUIDまたはテキスト）
  event_type TEXT NOT NULL,              -- view, click, scroll, time, read
  event_data JSONB DEFAULT '{}',         -- url, scrollDepth, timeSpent等
  content_type TEXT DEFAULT 'profile',   -- profile または business
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### business_project_purchases テーブル（決済履歴）

```sql
CREATE TABLE business_project_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### leads テーブル（リード獲得）

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. エディタシステム

### 概要

エディタは `components/BusinessLPEditor.tsx` に実装されています（約3,900行）。

### 主要機能

#### 5.1 状態管理

```typescript
// ブロック配列
const [blocks, setBlocks] = useState<Block[]>(() => getDefaultContent());

// 保存済みスラッグ
const [savedSlug, setSavedSlug] = useState<string | null>(initialSlug || null);

// テーマ設定
const [theme, setTheme] = useState<{ gradient?: string; backgroundImage?: string }>({});

// アナリティクス
const [analytics, setAnalytics] = useState<{
  views: number;
  clicks: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
}>();

// 設定（計測タグ）
const [settings, setSettings] = useState<{
  gtmId?: string;
  fbPixelId?: string;
  lineTagId?: string;
}>();
```

#### 5.2 ブロック操作

```typescript
// ブロック追加
const addBlock = (type: Block['type']) => {
  const newBlock = { id: generateBlockId(), type, data: {...} };
  setBlocks(prev => [...prev, newBlock]);
};

// ブロック削除
const removeBlock = (blockId: string) => {
  setBlocks(prev => prev.filter(b => b.id !== blockId));
};

// ブロック移動
const moveBlock = (blockId: string, direction: 'up' | 'down') => {
  // インデックスを入れ替え
};

// ブロック更新
const updateBlock = (blockId: string, updates: Partial<Block['data']>) => {
  setBlocks(prev => prev.map(block => 
    block.id === blockId 
      ? { ...block, data: { ...block.data, ...updates } }
      : block
  ));
};
```

#### 5.3 保存処理

```typescript
const handleSave = async () => {
  const slugToUse = savedSlug || generateSlug();
  
  // Server Action経由で保存
  const result = await saveBusinessProject({
    slug: slugToUse,
    nickname: nicknameToSave || null,
    content: blocks,
    settings: { ...settings, theme },
    userId: user?.id || null,
    featuredOnTop
  });
};
```

#### 5.4 画像アップロード

```typescript
// RLS回避のためAPI経由でアップロード
const uploadImageViaApi = async (file: File, prefix: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', uploadOwnerId);
  formData.append('fileName', fileName);

  const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
  const data = await res.json();
  return data.publicUrl;
};
```

---

## 6. ブロックシステム

### 6.1 ブロック型定義 (`lib/types.ts`)

```typescript
// ブロックのUnion型
export type Block = 
  | { id: string; type: 'header'; data: HeaderBlockData }
  | { id: string; type: 'text_card'; data: TextCardBlockData }
  | { id: string; type: 'image'; data: ImageBlockData }
  | { id: string; type: 'youtube'; data: YouTubeBlockData }
  | { id: string; type: 'links'; data: LinksBlockData }
  | { id: string; type: 'kindle'; data: KindleBlockData }
  | { id: string; type: 'lead_form'; data: LeadFormBlockData }
  | { id: string; type: 'line_card'; data: LineCardBlockData }
  | { id: string; type: 'faq'; data: FAQBlockData }
  | { id: string; type: 'pricing'; data: PricingBlockData }
  | { id: string; type: 'testimonial'; data: TestimonialBlockData }
  | { id: string; type: 'quiz'; data: QuizBlockData }
  | { id: string; type: 'hero'; data: HeroBlockData }
  | { id: string; type: 'features'; data: FeaturesBlockData }
  | { id: string; type: 'cta_section'; data: CTASectionBlockData }
  | { id: string; type: 'two_column'; data: TwoColumnBlockData }
  | { id: string; type: 'hero_fullwidth'; data: HeroFullwidthBlockData }
  | { id: string; type: 'problem_cards'; data: ProblemCardsBlockData }
  | { id: string; type: 'dark_section'; data: DarkSectionBlockData }
  | { id: string; type: 'case_study_cards'; data: CaseStudyCardsBlockData }
  | { id: string; type: 'bonus_section'; data: BonusSectionBlockData }
  | { id: string; type: 'checklist_section'; data: ChecklistSectionBlockData }
  | { id: string; type: 'google_map'; data: GoogleMapBlockData };
```

### 6.2 ブロックデータ例

```typescript
// ヘッダーブロック
export type HeaderBlockData = {
  avatar: string;      // プロフィール画像URL
  name: string;        // 名前
  title: string;       // キャッチコピー
  category?: string;   // カテゴリ
};

// 特徴ブロック
export type FeaturesBlockData = {
  title?: string;
  items: FeatureItem[];
  columns: 2 | 3;
  isFullWidth?: boolean;
};

// FAQブロック
export type FAQBlockData = {
  items: { id: string; question: string; answer: string; }[];
};
```

### 6.3 ブロックレンダラー (`components/BlockRenderer.tsx`)

```typescript
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
      return <HeaderComponent {...block.data} />;
    case 'text_card':
      return <TextCardComponent {...block.data} />;
    case 'links':
      // クリックトラッキング付き
      return <LinksComponent 
        {...block.data} 
        onClick={() => saveAnalytics(profileId, 'click', { url })} 
      />;
    // ...他のブロック
  }
}
```

### 6.4 新しいブロックタイプの追加方法

1. **型定義を追加** (`lib/types.ts`)
```typescript
export type NewBlockData = {
  title: string;
  content: string;
};

// Block union型に追加
| { id: string; type: 'new_block'; data: NewBlockData }
```

2. **レンダラーを追加** (`components/BlockRenderer.tsx`)
```typescript
case 'new_block':
  return <NewBlockComponent block={block} />;
```

3. **エディタに追加フォームを実装** (`components/BusinessLPEditor.tsx`)
```typescript
// addBlock関数内
case 'new_block':
  return {
    id: generateBlockId(),
    type: 'new_block',
    data: { title: '', content: '' }
  };

// 編集フォーム
{block.type === 'new_block' && (
  <div>
    <Input label="タイトル" val={block.data.title} onChange={v => updateBlock(block.id, { title: v })} />
  </div>
)}
```

4. **ブロック追加ボタンに追加**
```typescript
<button onClick={() => addBlock('new_block')}>
  新ブロック
</button>
```

---

## 7. アナリティクスシステム

### 7.1 トラッキングの種類

| イベント | 説明 | event_data |
|---------|------|------------|
| `view` | ページビュー | なし |
| `click` | リンククリック | `{ url: string }` |
| `scroll` | スクロール到達 | `{ scrollDepth: 25|50|75|100 }` |
| `time` | 滞在時間 | `{ timeSpent: number }` |
| `read` | 精読（50%以上スクロール） | `{ readPercentage: number }` |

### 7.2 トラッカーコンポーネント (`components/ProfileViewTracker.tsx`)

```typescript
export function ProfileViewTracker({ 
  profileId, 
  contentType = 'profile' 
}: { 
  profileId: string;
  contentType?: 'profile' | 'business';
}) {
  useEffect(() => {
    // ページビュー記録
    saveAnalytics(profileId, 'view');
    
    // スクロール追跡
    const handleScroll = () => {
      const scrollDepth = calculateScrollDepth();
      // 25%, 50%, 75%, 100%でトラッキング
      if (scrollDepth >= milestone && !tracked.has(milestone)) {
        saveAnalytics(profileId, 'scroll', { scrollDepth: milestone });
      }
    };
    
    // 滞在時間（30秒ごと）
    const timeInterval = setInterval(() => {
      const timeSpent = (Date.now() - startTime) / 1000;
      saveAnalytics(profileId, 'time', { timeSpent });
    }, 30000);
    
    // ページ離脱時
    const handleUnload = () => {
      navigator.sendBeacon('/api/analytics', JSON.stringify({...}));
    };
  }, [profileId]);
}
```

### 7.3 Server Action (`app/actions/analytics.ts`)

```typescript
'use server';

export async function saveAnalytics(
  profileId: string,
  eventType: 'view' | 'click' | 'scroll' | 'time' | 'read',
  eventData?: { url?: string; scrollDepth?: number; timeSpent?: number; }
) {
  const { data, error } = await supabase
    .from('analytics')
    .insert([{
      profile_id: profileId,
      event_type: eventType,
      event_data: eventData || {},
      content_type: 'profile',
      created_at: new Date().toISOString()
    }]);
  
  return { success: !error, data };
}

export async function getAnalytics(profileId: string) {
  const { data: allEvents } = await supabase
    .from('analytics')
    .select('*')
    .eq('profile_id', profileId)
    .eq('content_type', 'profile');
  
  // 集計処理
  const views = allEvents?.filter(e => e.event_type === 'view').length || 0;
  const clicks = allEvents?.filter(e => e.event_type === 'click').length || 0;
  // ...
}
```

### 7.4 ビジネスLP用アナリティクス

```typescript
// profile_idにslugを格納（UUID形式ではない）
// content_type='business'で区別
export async function saveBusinessAnalytics(slug: string, eventType, eventData) {
  return supabase.from('analytics').insert([{
    profile_id: slug,  // slugを格納
    event_type: eventType,
    event_data: eventData,
    content_type: 'business',  // ビジネスLPとして記録
  }]);
}
```

---

## 8. 決済・寄付システム

### 8.1 決済フロー

```
ユーザー → 寄付ボタンクリック
    ↓
/api/business-checkout (Stripeセッション作成)
    ↓
Stripe Checkout画面
    ↓
決済完了 → success_url にリダイレクト
    ↓
/api/business-verify (決済検証 + DB記録)
    ↓
Pro機能開放
```

### 8.2 Checkoutエンドポイント (`app/api/business-checkout/route.js`)

```javascript
export async function POST(request) {
  const { projectId, projectName, userId, email, price } = await request.json();
  
  // Stripe Checkout Session作成
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'jpy',
        product_data: {
          name: `ビジネスLP Pro機能開放: ${projectName}`,
        },
        unit_amount: price,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${baseUrl}/business/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}`,
    cancel_url: `${baseUrl}/business/dashboard?payment=cancel`,
    metadata: { projectId, userId, projectName },
  });
  
  return NextResponse.json({ url: session.url });
}
```

### 8.3 決済検証エンドポイント (`app/api/business-verify/route.js`)

```javascript
export async function POST(request) {
  const { sessionId, projectId, userId } = await request.json();
  
  // Stripeセッション検証
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  }
  
  // 重複チェック
  const { data: existing } = await supabase
    .from('business_project_purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .single();
  
  if (existing) return NextResponse.json({ success: true });
  
  // 購入記録を保存
  await supabase.from('business_project_purchases').insert([{
    user_id: userId,
    project_id: projectId,
    stripe_session_id: sessionId,
    amount: session.amount_total,
  }]);
  
  return NextResponse.json({ success: true });
}
```

### 8.4 Pro機能の判定

```typescript
// ダッシュボードで購入履歴を確認
const { data: purchases } = await supabase
  .from('business_project_purchases')
  .select('project_id')
  .eq('user_id', user.id);

const purchasedProjectIds = purchases?.map(p => p.project_id) || [];
const isPro = purchasedProjectIds.includes(projectSlug);
```

---

## 9. 認証システム

### 9.1 Supabase Auth設定

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    }
  }
);
```

### 9.2 認証状態の監視

```javascript
// app/page.jsx
useEffect(() => {
  const { data: { session } } = await supabase.auth.getSession();
  setUser(session?.user || null);
  
  supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user || null);
    
    if (event === 'PASSWORD_RECOVERY') {
      setShowPasswordReset(true);
    }
  });
}, []);
```

### 9.3 管理者判定

```javascript
// lib/utils.js
export const isAdmin = (userId) => {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
  return adminIds.includes(userId);
};
```

---

## 10. テンプレートシステム

### 10.1 テンプレート型定義

```typescript
// constants/templates/types.ts
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: {
    gradient: string;
    backgroundImage?: string;
  };
  blocks: Block[];
  icon?: string;
  recommended?: boolean;
  order?: number;
}
```

### 10.2 テンプレート例

```typescript
// constants/templates/consultant.ts
export const consultantTemplate: Template = {
  id: 'consultant',
  name: 'コンサルタント・士業向け',
  description: '信頼感を重視した...',
  category: 'コンサルタント・士業',
  theme: {
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
  },
  blocks: [
    {
      id: 'header_1',
      type: 'header',
      data: {
        avatar: '',
        name: '山田 太郎',
        title: '中小企業の経営課題を解決する\n経営コンサルタント',
        category: 'business'
      }
    },
    // ...他のブロック
  ],
  recommended: true,
  order: 1,
};
```

### 10.3 テンプレート読み込み

```typescript
// エディタでのテンプレート適用
const applyTemplate = (template: Template) => {
  // ブロックIDを再生成
  const newBlocks = template.blocks.map(block => ({
    ...block,
    id: generateBlockId(),
    // ネストされたアイテムもID再生成
    data: processNestedIds(block.data)
  }));
  
  setBlocks(newBlocks);
  setTheme(template.theme);
};
```

---

## 11. API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/upload-image` | POST | 画像アップロード（Supabase Storage） |
| `/api/business-checkout` | POST | Stripe Checkout開始 |
| `/api/business-verify` | POST | 決済検証 + 購入記録 |
| `/api/generate-profile` | POST | AI生成（キャッチコピー等） |
| `/api/analytics` | POST | アナリティクス記録（sendBeacon用） |
| `/api/search-images` | GET | Unsplash画像検索 |

---

## 12. 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # サーバー側のみ

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# サイト
NEXT_PUBLIC_SITE_URL=https://lp.makers.tokyo

# 管理者
ADMIN_USER_IDS=uuid1,uuid2,uuid3

# AI生成（オプション）
GOOGLE_GEMINI_API_KEY=...

# 画像検索（オプション）
UNSPLASH_ACCESS_KEY=...
```

---

## 13. 転用時のチェックリスト

### 必須作業

- [ ] **環境変数の設定**
  - Supabase URL/Key
  - Stripe Key（決済使用時）
  - サイトURL
  - 管理者ID

- [ ] **データベースセットアップ**
  - `supabase_business_projects_setup.sql` 実行
  - `supabase_analytics_setup.sql` 実行
  - RLSポリシー確認

- [ ] **Supabase Storage設定**
  - `profile-uploads` バケット作成
  - 公開アクセス設定

### ブランディング変更

- [ ] サイト名・ロゴ変更
  - `components/LandingPage.jsx`
  - `components/Footer.jsx`
  - `app/layout.tsx`

- [ ] メタデータ更新
  - `app/b/[slug]/page.tsx` のメタデータ生成

- [ ] カラースキーム
  - `app/globals.css`
  - 各テンプレートのgradient

### 機能カスタマイズ

- [ ] **ブロックタイプの追加/削除**
  - `lib/types.ts` で型定義
  - `components/BlockRenderer.tsx` でレンダリング
  - `components/BusinessLPEditor.tsx` で編集UI

- [ ] **テンプレート追加**
  - `constants/templates/` に新規ファイル
  - `constants/templates/index.ts` でエクスポート

- [ ] **アナリティクスカスタマイズ**
  - 追跡イベントの追加/削除
  - ダッシュボード表示項目

### テスト項目

- [ ] ブロック追加/編集/削除
- [ ] 画像アップロード
- [ ] 保存・読み込み
- [ ] プレビュー表示
- [ ] 公開ページ表示
- [ ] アナリティクス記録
- [ ] 決済フロー（テストモード）
- [ ] 認証フロー

---

## 付録: コード例

### Server Action の作成例

```typescript
// app/actions/custom.ts
'use server';

import { supabase } from '@/lib/supabase';

export async function saveCustomData(id: string, data: any) {
  const { data: result, error } = await supabase
    .from('custom_table')
    .upsert({ id, ...data })
    .select()
    .single();
  
  if (error) return { error: error.message };
  return { data: result };
}
```

### 新規ページ追加例

```typescript
// app/custom/[id]/page.tsx
import { supabase } from '@/lib/supabase';

export default async function CustomPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const { data } = await supabase
    .from('custom_table')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!data) return notFound();
  
  return <div>{/* ページ内容 */}</div>;
}
```

---

*このドキュメントはプロジェクトの理解と転用を支援するために作成されました。*
*詳細なコードは各ファイルを直接参照してください。*

