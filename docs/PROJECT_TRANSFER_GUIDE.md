# プロフィールLPメーカー - プロジェクト転用ガイド

このドキュメントは、プロフィールLPメーカーの全体構造を理解し、他プロジェクトに転用するための詳細ガイドです。

---

## 📋 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構造](#3-ディレクトリ構造)
4. [エディタ機能の実装詳細](#4-エディタ機能の実装詳細)
5. [アナリティクス機能の実装詳細](#5-アナリティクス機能の実装詳細)
6. [寄付・決済機能の実装詳細](#6-寄付決済機能の実装詳細)
7. [データベース設計](#7-データベース設計)
8. [転用時のチェックリスト](#8-転用時のチェックリスト)

---

## 1. プロジェクト概要

### サービスコンセプト
ノーコードで美しいプロフィールLP（ランディングページ）を作成できるWebアプリケーション。
SNSリンクまとめ以上の価値を提供し、個人事業主やフリーランス向けのプロフェッショナルなLP作成ツール。

### 主な機能
- **ブロックベースエディタ**: 12種類以上のコンテンツブロックで多様な表現
- **テンプレート機能**: 業種別のプロフェッショナルなテンプレート
- **アナリティクス**: 詳細なアクセス解析とユーザー行動分析
- **リード獲得**: メールアドレス収集機能
- **決済連携**: Stripe決済でPro機能開放（HTMLダウンロード、埋め込みコード）

---

## 2. 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.0.7 | フレームワーク（App Router） |
| React | 19.2.1 | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.x | スタイリング |
| Lucide React | 0.555.0 | アイコン |
| Recharts | 3.5.1 | グラフ表示 |
| qrcode.react | 4.2.0 | QRコード生成 |
| canvas-confetti | 1.9.4 | エフェクト |

### バックエンド
| 技術 | 用途 |
|------|------|
| Supabase (PostgreSQL) | データベース |
| Supabase Auth | 認証 |
| Supabase Storage | 画像ストレージ |
| Stripe | 決済 |
| OpenAI API | AI自動生成 |

---

## 3. ディレクトリ構造

```
profile-lp-maker/
├── app/                          # Next.js App Router
│   ├── actions/                  # ★ Server Actions
│   │   ├── analytics.ts         # アナリティクス処理
│   │   ├── leads.ts             # リード管理
│   │   ├── profiles.ts          # プロフィール保存
│   │   └── users.ts             # ユーザー管理
│   │
│   ├── api/                      # ★ API Routes
│   │   ├── analytics/route.ts   # アナリティクスAPI（sendBeacon用）
│   │   ├── checkout-profile/    # 決済セッション作成
│   │   ├── verify-profile/      # 決済検証
│   │   ├── upload-image/        # 画像アップロード
│   │   ├── generate-profile/    # AI生成
│   │   ├── search-images/       # 画像検索（Unsplash）
│   │   ├── export-users-csv/    # CSV出力
│   │   └── export-users-sheets/ # Googleスプレッドシート連携
│   │
│   ├── dashboard/                # ダッシュボード
│   │   ├── editor/
│   │   │   ├── [slug]/page.tsx  # 既存プロフィール編集
│   │   │   └── new/page.tsx     # 新規作成
│   │   └── page.tsx             # ダッシュボードトップ
│   │
│   ├── p/                        # 公開プロフィールページ
│   │   └── [slug]/page.tsx      # プロフィール表示
│   │
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.jsx                  # トップページ
│   ├── robots.ts                 # robots.txt生成
│   └── sitemap.ts                # sitemap.xml生成
│
├── components/                   # ★ Reactコンポーネント
│   ├── ProfileEditor.tsx        # エディタ本体（2777行）
│   ├── ProfileDashboard.jsx     # ダッシュボード
│   ├── BlockRenderer.tsx        # ブロックレンダリング
│   ├── ProfileViewTracker.tsx   # ビュートラッキング
│   ├── LinkClickTracker.tsx     # クリックトラッキング
│   ├── TrackingScripts.tsx      # 外部計測タグ（GTM/FB/LINE）
│   ├── AuthModal.jsx            # 認証モーダル
│   ├── Header.jsx               # ヘッダー
│   └── Footer.jsx               # フッター
│
├── lib/                          # ユーティリティ
│   ├── types.ts                 # TypeScript型定義
│   ├── supabase.js              # Supabaseクライアント
│   ├── supabase-server.ts       # サーバーサイドSupabase
│   ├── utils.js                 # ユーティリティ関数
│   ├── profileHtmlGenerator.ts  # HTML生成
│   └── constants.js             # 定数
│
├── constants/
│   └── templates.ts             # テンプレート定義
│
└── [SQLファイル群]               # データベース設定
    ├── supabase_analytics_setup.sql
    └── supabase_profile_purchases_setup.sql
```

---

## 4. エディタ機能の実装詳細

### 4.1 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `components/ProfileEditor.tsx` | エディタ本体（最重要・2777行） |
| `lib/types.ts` | ブロック型定義 |
| `app/actions/profiles.ts` | 保存処理（Server Action） |
| `constants/templates.ts` | テンプレート定義 |
| `components/BlockRenderer.tsx` | ブロック表示 |
| `app/dashboard/editor/[slug]/page.tsx` | 編集ページ |
| `app/dashboard/editor/new/page.tsx` | 新規作成ページ |

### 4.2 ブロックシステム

#### 型定義（`lib/types.ts`）

```typescript
// ブロックの基本構造
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
  | { id: string; type: 'google_map'; data: GoogleMapBlockData };

// 各ブロックのデータ型例
export type HeaderBlockData = {
  avatar: string;    // プロフィール画像URL
  name: string;      // 名前
  title: string;     // キャッチコピー
  category?: string; // カテゴリ
};

// 一意のIDを生成
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

#### 現在対応しているブロック一覧

| タイプ | 名称 | 用途 |
|--------|------|------|
| `header` | ヘッダー | プロフィール画像、名前、キャッチコピー |
| `text_card` | テキストカード | タイトル付きテキスト |
| `image` | 画像 | 画像とキャプション |
| `youtube` | YouTube | 動画埋め込み |
| `links` | リンク | SNSリンクボタン群 |
| `kindle` | Kindle | 書籍紹介カード |
| `lead_form` | リードフォーム | メールアドレス収集 |
| `line_card` | LINE登録 | LINE公式アカウント誘導 |
| `faq` | FAQ | よくある質問 |
| `pricing` | 料金表 | プラン・価格表示 |
| `testimonial` | お客様の声 | 推薦文・レビュー |
| `quiz` | クイズ | 診断クイズ埋め込み |
| `google_map` | Googleマップ | 地図埋め込み |

### 4.3 エディタの主要State

```typescript
// ProfileEditor.tsx 内のState
const [blocks, setBlocks] = useState<Block[]>(getDefaultContent());
const [theme, setTheme] = useState<{ gradient?: string; backgroundImage?: string }>({});
const [settings, setSettings] = useState<{ gtmId?: string; fbPixelId?: string; lineTagId?: string }>({});
const [analytics, setAnalytics] = useState({
  views: 0,
  clicks: 0,
  avgScrollDepth: 0,
  avgTimeSpent: 0,
  readRate: 0,
  clickRate: 0
});
const [featuredOnTop, setFeaturedOnTop] = useState(true);
```

### 4.4 エディタの主要関数

```typescript
// ブロック追加
const addBlock = (type: Block['type']) => {
  const newBlock = createBlockByType(type);
  setBlocks(prev => [...prev, newBlock]);
  setExpandedBlocks(prev => new Set([...prev, newBlock.id]));
};

// ブロック更新
const updateBlock = (blockId: string, updates: Partial<Block['data']>) => {
  setBlocks(prev => prev.map(block => {
    if (block.id === blockId) {
      return { ...block, data: { ...block.data, ...updates } } as Block;
    }
    return block;
  }));
};

// ブロック削除
const removeBlock = (blockId: string) => {
  if (!confirm('このブロックを削除しますか？')) return;
  setBlocks(prev => prev.filter(b => b.id !== blockId));
};

// ブロック移動
const moveBlock = (blockId: string, direction: 'up' | 'down') => {
  setBlocks(prev => {
    const index = prev.findIndex(b => b.id === blockId);
    if (index === -1) return prev;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= prev.length) return prev;
    const newBlocks = [...prev];
    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    return newBlocks;
  });
};

// 保存（Server Action経由）
const handleSave = async () => {
  setIsSaving(true);
  const result = await saveProfile({
    slug: savedSlug || generateSlug(name),
    content: blocks,
    settings: { ...settings, theme },
    userId: user?.id || null,
    featuredOnTop
  });
  if (result.error) {
    alert('保存に失敗しました');
  } else {
    alert('保存しました！');
  }
  setIsSaving(false);
};
```

### 4.5 画像アップロード

```typescript
// RLSを回避するためにAPIルート経由でアップロード
const uploadImageViaApi = async (file: File, prefix: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', uploadOwnerId);  // ユーザーIDでフォルダ分離
  formData.append('fileName', fileName);

  const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
  if (!res.ok) {
    throw new Error('アップロードに失敗しました');
  }
  const data = await res.json();
  return data.publicUrl;
};
```

### 4.6 新しいブロックを追加する方法

1. **型定義を追加**（`lib/types.ts`）
2. **エディタにブロック追加ボタンを追加**（`ProfileEditor.tsx`）
3. **編集UIを追加**（`ProfileEditor.tsx`内のrender部分）
4. **レンダラーに表示処理を追加**（`BlockRenderer.tsx`）

---

## 5. アナリティクス機能の実装詳細

### 5.1 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `components/ProfileViewTracker.tsx` | ビュー・スクロール・滞在時間トラッキング |
| `components/LinkClickTracker.tsx` | リンククリックトラッキング |
| `components/TrackingScripts.tsx` | 外部計測タグ（GTM/FB/LINE） |
| `app/actions/analytics.ts` | アナリティクスServer Action |
| `app/api/analytics/route.ts` | アナリティクスAPI（sendBeacon用） |
| `supabase_analytics_setup.sql` | データベーススキーマ |

### 5.2 トラッキングイベント種類

| イベント | 説明 | event_data |
|---------|------|------------|
| `view` | ページビュー | なし |
| `click` | リンククリック | `{ url: string }` |
| `scroll` | スクロール深度 | `{ scrollDepth: 25/50/75/100 }` |
| `time` | 滞在時間 | `{ timeSpent: number }` （秒） |
| `read` | 精読判定 | `{ readPercentage: number }` |

### 5.3 ProfileViewTracker実装

```typescript
// components/ProfileViewTracker.tsx

export function ProfileViewTracker({ profileId, contentType = 'profile' }) {
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  const viewTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!profileId || profileId === 'demo') return;

    // ★ ページビューを記録（初回のみ）
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      saveAnalytics(profileId, 'view', undefined, contentType);
    }

    // ★ スクロール深度を追跡
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);

      // 25%, 50%, 75%, 100%のマイルストーンを記録
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollDepth >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          saveAnalytics(profileId, 'scroll', { scrollDepth: milestone }, contentType);
        }
      });
    };

    // ★ 精読判定（50%以上スクロールで精読とみなす）
    const checkReadRate = () => {
      if (maxScrollRef.current >= 50) {
        saveAnalytics(profileId, 'read', { readPercentage: maxScrollRef.current }, contentType);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // ★ 定期的に滞在時間を記録（30秒ごと）
    const timeInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent >= 30) {
        saveAnalytics(profileId, 'time', { timeSpent }, contentType);
      }
    }, 30000);

    // ★ ページ離脱時に滞在時間を記録（sendBeacon使用）
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        const blob = new Blob(
          [JSON.stringify({ profileId, eventType: 'time', eventData: { timeSpent } })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/analytics', blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(timeInterval);
    };
  }, [profileId, contentType]);

  return null;
}
```

### 5.4 アナリティクス保存Server Action

```typescript
// app/actions/analytics.ts

export async function saveAnalytics(
  profileId: string, 
  eventType: 'view' | 'click' | 'scroll' | 'time' | 'read', 
  eventData?: { url?: string; scrollDepth?: number; timeSpent?: number; readPercentage?: number; },
  contentType?: 'profile' | 'business'
) {
  // UUIDの形式チェック
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(profileId)) {
    return { error: 'Invalid profile ID format' };
  }

  const insertData = {
    profile_id: profileId,
    event_type: eventType,
    event_data: eventData || {},
    content_type: contentType || 'profile',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('analytics')
    .insert([insertData])
    .select();

  if (error) return { error: error.message };
  return { success: true, data };
}
```

### 5.5 アナリティクス取得・集計

```typescript
// app/actions/analytics.ts

export async function getAnalytics(profileId: string) {
  const { data: allEvents } = await supabase
    .from('analytics')
    .select('*')
    .eq('profile_id', profileId)
    .eq('content_type', 'profile');

  const views = allEvents?.filter(e => e.event_type === 'view') || [];
  const clicks = allEvents?.filter(e => e.event_type === 'click') || [];
  const scrolls = allEvents?.filter(e => e.event_type === 'scroll') || [];
  const times = allEvents?.filter(e => e.event_type === 'time') || [];
  const reads = allEvents?.filter(e => e.event_type === 'read') || [];

  // 平均スクロール深度
  const avgScrollDepth = calculateAverage(scrolls, 'scrollDepth');

  // 平均滞在時間（秒）
  const avgTimeSpent = calculateAverage(times, 'timeSpent');

  // 精読率（50%以上スクロールした割合）
  const readCount = reads.filter(e => e.event_data?.readPercentage >= 50).length;
  const readRate = views.length > 0 ? Math.round((readCount / views.length) * 100) : 0;

  // クリック率
  const clickRate = views.length > 0 ? Math.round((clicks.length / views.length) * 100) : 0;

  return {
    views: views.length,
    clicks: clicks.length,
    avgScrollDepth,
    avgTimeSpent,
    readRate,
    clickRate
  };
}
```

### 5.6 外部計測タグ（TrackingScripts）

```typescript
// components/TrackingScripts.tsx

export function TrackingScripts({ settings }) {
  return (
    <>
      {/* Google Tag Manager */}
      {settings?.gtmId && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){...})(window,document,'script','dataLayer','${settings.gtmId}');`}
        </Script>
      )}

      {/* Facebook Pixel */}
      {settings?.fbPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`fbq('init', '${settings.fbPixelId}');fbq('track', 'PageView');`}
        </Script>
      )}

      {/* LINE Tag */}
      {settings?.lineTagId && (
        <Script id="line-tag" strategy="afterInteractive">
          {/* LINE Tag コード */}
        </Script>
      )}
    </>
  );
}
```

### 5.7 エディタ内でのアナリティクス表示

```typescript
// ProfileEditor.tsx 内

// アナリティクスデータを取得
useEffect(() => {
  const loadProfile = async () => {
    // ...プロフィール読み込み後
    if (data.id) {
      const analyticsData = await getAnalytics(data.id);
      setAnalytics(analyticsData);
    }
  };
  loadProfile();
}, [initialSlug]);

// 表示部分
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  <div className="text-center p-4 bg-blue-50 rounded-lg">
    <div className="text-2xl font-bold text-blue-600">{analytics.views}</div>
    <div className="text-sm text-gray-600">アクセス数</div>
  </div>
  <div className="text-center p-4 bg-green-50 rounded-lg">
    <div className="text-2xl font-bold text-green-600">{analytics.clicks}</div>
    <div className="text-sm text-gray-600">クリック数</div>
  </div>
  <div className="text-center p-4 bg-purple-50 rounded-lg">
    <div className="text-2xl font-bold text-purple-600">{analytics.clickRate}%</div>
    <div className="text-sm text-gray-600">クリック率</div>
  </div>
  {/* ... その他の指標 */}
</div>
```

---

## 6. 寄付・決済機能の実装詳細

### 6.1 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `app/api/checkout-profile/route.js` | Stripe決済セッション作成 |
| `app/api/verify-profile/route.js` | 決済検証・購入履歴記録 |
| `components/ProfileDashboard.jsx` | 購入処理UI |
| `supabase_profile_purchases_setup.sql` | 購入履歴テーブル |

### 6.2 決済フロー概要

```
1. ユーザーが「機能開放/寄付」ボタンをクリック
   ↓
2. 金額入力（500円〜50,000円）
   ↓
3. /api/checkout-profile にPOST
   ↓
4. Stripe Checkout Sessionを作成
   ↓
5. Stripeの決済ページにリダイレクト
   ↓
6. カード情報入力・決済
   ↓
7. 成功後、success_urlにリダイレクト
   （?payment=success&session_id=xxx&profile_id=xxx）
   ↓
8. /api/verify-profile で決済検証
   ↓
9. profile_purchasesテーブルに購入履歴を記録
   ↓
10. Pro機能（HTML・埋め込み）が開放
```

### 6.3 決済セッション作成API

```javascript
// app/api/checkout-profile/route.js

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { profileId, profileName, userId, email, price } = await req.json();
  
  // 価格チェック（500円〜100,000円）
  let finalPrice = parseInt(price);
  if (isNaN(finalPrice) || finalPrice < 500 || finalPrice > 100000) {
    finalPrice = 1000;
  }

  // オリジンを取得
  let origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

  // Stripe Checkout Session作成
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'jpy',
        product_data: {
          name: `HTMLデータ提供: ${profileName}`,
          description: 'このプロフィールLPのHTMLデータをダウンロードします（寄付・応援）',
        },
        unit_amount: finalPrice, 
      },
      quantity: 1,
    }],
    mode: 'payment',
    // ★ 重要: 成功時のリダイレクトURL
    success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&profile_id=${profileId}&page=dashboard`,
    cancel_url: `${origin}/?payment=cancel&page=dashboard`,
    metadata: {
      userId: userId,
      profileId: profileId,
    },
    customer_email: email,
  });

  return NextResponse.json({ url: session.url });
}
```

### 6.4 決済検証API

```javascript
// app/api/verify-profile/route.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ★ 管理者権限（Service Role）でSupabaseを操作
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← 重要！
);

export async function POST(req) {
  const { sessionId, profileId, userId } = await req.json();

  // 1. Stripeに問い合わせて、本当に支払い済みか確認
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  }

  // 2. 既に記録済みかチェック（重複防止）
  const { data: existing } = await supabaseAdmin
    .from('profile_purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .single();

  if (existing) {
    return NextResponse.json({ success: true, message: 'Already recorded' });
  }

  // 3. Supabaseに購入履歴を記録
  const { data, error } = await supabaseAdmin
    .from('profile_purchases')
    .insert([{
      user_id: userId,
      profile_id: profileId,
      stripe_session_id: sessionId,
      amount: session.amount_total
    }])
    .select();

  if (error) throw error;

  return NextResponse.json({ success: true, data });
}
```

### 6.5 フロントエンド：決済開始

```javascript
// ProfileDashboard.jsx 内

const handlePurchase = async (profile) => {
  // 金額入力ダイアログ
  const inputPrice = window.prompt(
    `「${getProfileName(profile)}」の機能を開放するための金額を入力してください。\n\n金額は500円以上、50,000円以下で設定できます。`, 
    "1000"
  );
  if (inputPrice === null) return;
  
  const price = parseInt(inputPrice, 10);
  if (isNaN(price) || price < 500 || price > 50000) {
    alert("金額は500円以上、50,000円以下の半角数字で入力してください。");
    return;
  }

  setProcessingId(profile.id);
  
  try {
    const res = await fetch('/api/checkout-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: profile.id,
        profileName: getProfileName(profile),
        userId: user.id,
        email: user.email,
        price: price 
      }),
    });
    
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;  // Stripeページにリダイレクト
    } else {
      throw new Error(data.error || '決済URLの取得に失敗しました');
    }
  } catch (e) {
    alert('エラー: ' + e.message);
    setProcessingId(null);
  }
};
```

### 6.6 フロントエンド：決済検証

```javascript
// ProfileDashboard.jsx 内

const verifyPayment = async (sessionId, profileId) => {
  console.log('🔍 決済検証開始:', { sessionId, profileId });
  
  try {
    const res = await fetch('/api/verify-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, profileId, userId: user.id }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      console.log('✅ 決済検証成功！');
      
      // URLパラメータをクリア
      window.history.replaceState(null, '', window.location.pathname);
      
      // 購入履歴を再取得
      const { data: bought } = await supabase
        .from('profile_purchases')
        .select('profile_id')
        .eq('user_id', user.id);
      
      setPurchases(bought?.map(p => p.profile_id) || []);
      
      alert('購入ありがとうございます！機能が開放されました。');
    } else {
      alert('決済の確認に失敗しました');
    }
  } catch (e) {
    alert('エラーが発生しました: ' + e.message);
  }
};

// 初期化時のURLパラメータチェック
useEffect(() => {
  const init = async () => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');
    const profileId = params.get('profile_id');
    
    if (paymentStatus === 'success' && sessionId) {
      await verifyPayment(sessionId, profileId);
    }
    
    // 購入履歴を取得
    const { data: bought } = await supabase
      .from('profile_purchases')
      .select('profile_id')
      .eq('user_id', user.id);
    
    setPurchases(bought?.map(p => p.profile_id) || []);
  };
  
  if (user) init();
}, [user]);
```

### 6.7 Pro機能の開放判定

```javascript
// 購入済みかどうかを判定
const isPurchased = (profileId) => purchases.includes(profileId);

// UI表示
{isPurchased(profile.id) ? (
  <>
    <button onClick={() => downloadHTML(profile)}>
      HTMLダウンロード
    </button>
    <button onClick={() => showEmbedCode(profile)}>
      埋め込みコード
    </button>
  </>
) : (
  <button onClick={() => handlePurchase(profile)}>
    機能開放 / 寄付
  </button>
)}
```

---

## 7. データベース設計

### 7.1 テーブル一覧

| テーブル名 | 用途 |
|-----------|------|
| `profiles` | プロフィールLPのデータ |
| `analytics` | アクセス解析データ |
| `leads` | リード（メールアドレス） |
| `profile_purchases` | 購入履歴 |
| `announcements` | お知らせ（オプション） |

### 7.2 profiles テーブル

```sql
-- プロフィールデータを保存
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nickname TEXT,  -- ユーザー設定のニックネーム（任意）
  content JSONB NOT NULL,  -- ブロックデータ（JSON配列）
  settings JSONB DEFAULT '{}',  -- 設定データ（計測タグ、テーマなど）
  user_id UUID REFERENCES auth.users(id),
  featured_on_top BOOLEAN DEFAULT true,  -- トップページ掲載フラグ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシー
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);

-- 認証済みユーザーは作成可能
CREATE POLICY "Authenticated users can create profiles" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみ更新可能
CREATE POLICY "Users can update their own profiles" ON profiles 
  FOR UPDATE USING (auth.uid() = user_id);

-- 作成者のみ削除可能
CREATE POLICY "Users can delete their own profiles" ON profiles 
  FOR DELETE USING (auth.uid() = user_id);
```

### 7.3 analytics テーブル

```sql
-- supabase_analytics_setup.sql

CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'scroll', 'time', 'read')),
  event_data JSONB DEFAULT '{}'::JSONB,
  content_type TEXT DEFAULT 'profile',  -- 'profile' または 'business'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_analytics_profile_id ON analytics(profile_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);

-- RLSポリシー
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り・挿入可能（匿名トラッキングのため）
CREATE POLICY "Anyone can read analytics" ON analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);
```

### 7.4 profile_purchases テーブル

```sql
-- supabase_profile_purchases_setup.sql

CREATE TABLE IF NOT EXISTS profile_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,  -- 重複防止
  amount INTEGER NOT NULL,  -- 金額（円）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_profile_purchases_user_id ON profile_purchases(user_id);
CREATE INDEX idx_profile_purchases_profile_id ON profile_purchases(profile_id);
CREATE INDEX idx_profile_purchases_stripe_session_id ON profile_purchases(stripe_session_id);

-- RLSポリシー
ALTER TABLE profile_purchases ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の購入履歴のみ閲覧可能
CREATE POLICY "Users can view their own purchases" ON profile_purchases 
  FOR SELECT USING (auth.uid() = user_id);

-- サービスロール（API）のみ挿入可能
CREATE POLICY "Service role can insert purchases" ON profile_purchases 
  FOR INSERT WITH CHECK (true);
```

---

## 8. 転用時のチェックリスト

### 8.1 必須環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # ← 決済検証に必須

# Stripe（決済機能を使用する場合）
STRIPE_SECRET_KEY=sk_test_... または sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... または pk_live_...

# サイトURL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# OpenAI（AI生成機能を使用する場合）
OPENAI_API_KEY=sk-...
```

### 8.2 データベースセットアップ

1. `supabase_analytics_setup.sql` を実行
2. `supabase_profile_purchases_setup.sql` を実行
3. Supabase Storageに `profile-uploads` バケットを作成

### 8.3 エディタ機能を転用する場合

- [ ] `components/ProfileEditor.tsx` をコピー
- [ ] `lib/types.ts` をコピー（ブロック型定義）
- [ ] `constants/templates.ts` をコピー（テンプレート）
- [ ] `components/BlockRenderer.tsx` をコピー
- [ ] `app/actions/profiles.ts` をコピー
- [ ] `app/api/upload-image/route.js` をコピー
- [ ] 必要に応じてブロックタイプをカスタマイズ

### 8.4 アナリティクス機能を転用する場合

- [ ] `components/ProfileViewTracker.tsx` をコピー
- [ ] `components/LinkClickTracker.tsx` をコピー
- [ ] `components/TrackingScripts.tsx` をコピー
- [ ] `app/actions/analytics.ts` をコピー
- [ ] `app/api/analytics/route.ts` をコピー
- [ ] `supabase_analytics_setup.sql` を実行
- [ ] `content_type` を必要に応じてカスタマイズ

### 8.5 決済機能を転用する場合

- [ ] `app/api/checkout-profile/route.js` をコピー
- [ ] `app/api/verify-profile/route.js` をコピー
- [ ] `supabase_profile_purchases_setup.sql` を実行
- [ ] Stripeアカウントを設定
- [ ] 環境変数を設定
- [ ] 商品名・説明文をカスタマイズ
- [ ] success_url・cancel_url をカスタマイズ
- [ ] テストモードで決済テスト

### 8.6 カスタマイズポイント

| 項目 | ファイル | 変更内容 |
|------|---------|---------|
| ブロックタイプ追加 | `lib/types.ts` | 新しい型定義を追加 |
| テンプレート追加 | `constants/templates.ts` | 新しいテンプレートを追加 |
| 商品名変更 | `app/api/checkout-profile/route.js` | `product_data.name` を変更 |
| 価格設定変更 | `app/api/checkout-profile/route.js` | 最低/最高金額を変更 |
| 計測イベント追加 | `app/actions/analytics.ts` | 新しいevent_typeを追加 |

---

## 補足資料

- `PAYMENT_SYSTEM_MIGRATION_GUIDE.md` - 決済システムの詳細な移植ガイド
- `EDITOR_FILES_GUIDE.md` - エディタファイルの詳細説明
- `ANALYTICS_SETUP.md` - アナリティクスのセットアップ手順
- `PROJECT_SPECIFICATION.md` - プロジェクト総合仕様書

---

最終更新日: 2024年12月27日

