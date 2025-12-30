# アナリティクス・決済システム詳細ガイド

このドキュメントでは、アナリティクストラッキングと決済（寄付）システムの実装を詳細に解説します。

## 目次

1. [アナリティクスシステム概要](#1-アナリティクスシステム概要)
2. [トラッキングイベント詳細](#2-トラッキングイベント詳細)
3. [ProfileViewTracker の実装](#3-profileviewtracker-の実装)
4. [クリックトラッキング](#4-クリックトラッキング)
5. [アナリティクスの集計と表示](#5-アナリティクスの集計と表示)
6. [決済システム概要](#6-決済システム概要)
7. [Stripe連携の実装](#7-stripe連携の実装)
8. [購入履歴と機能開放](#8-購入履歴と機能開放)
9. [セキュリティ考慮事項](#9-セキュリティ考慮事項)
10. [転用時のカスタマイズ](#10-転用時のカスタマイズ)

---

## 1. アナリティクスシステム概要

### アーキテクチャ

```
┌───────────────────────────────────────────────────────────────┐
│                      公開ページ (/b/[slug])                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ProfileViewTracker                                       │ │
│  │  - ページビュー記録                                        │ │
│  │  - スクロール深度追跡                                      │ │
│  │  - 滞在時間計測                                           │ │
│  │  - 精読率計算                                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  BlockRenderer (リンク・CTA)                               │ │
│  │  - クリックイベント追跡                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                    Server Actions                             │
│  ┌─────────────────┐    ┌─────────────────┐                  │
│  │  saveAnalytics  │    │ saveBusinessAnalytics │            │
│  │  (profile用)    │    │ (business用)    │                  │
│  └────────┬────────┘    └────────┬────────┘                  │
│           │                      │                            │
│           └──────────┬───────────┘                            │
│                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Supabase: analytics テーブル                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                   ダッシュボード / エディタ                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  getAnalytics / getBusinessAnalytics                     │ │
│  │  - 集計データ取得                                         │ │
│  │  - 統計表示                                               │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### データベーススキーマ

```sql
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,              -- UUIDまたはslug
  event_type TEXT NOT NULL 
    CHECK (event_type IN ('view', 'click', 'scroll', 'time', 'read')),
  event_data JSONB DEFAULT '{}',
  content_type TEXT DEFAULT 'profile',   -- 'profile' または 'business'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_analytics_profile_id ON analytics(profile_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX idx_analytics_content_type ON analytics(content_type);

-- RLSポリシー
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り・挿入可能（トラッキング用）
CREATE POLICY "Anyone can read analytics" ON analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);
```

---

## 2. トラッキングイベント詳細

### イベント一覧

| event_type | 説明 | event_data | トリガー |
|------------|------|------------|---------|
| `view` | ページビュー | `{}` | ページ読み込み時（1回のみ） |
| `click` | リンククリック | `{ url: string }` | リンク・ボタンクリック時 |
| `scroll` | スクロール到達 | `{ scrollDepth: number }` | 25/50/75/100%到達時 |
| `time` | 滞在時間 | `{ timeSpent: number }` | 30秒ごと + ページ離脱時 |
| `read` | 精読 | `{ readPercentage: number }` | 50%以上スクロール時（1回のみ） |

### event_data の詳細

```typescript
// view: 追加データなし
{ }

// click: クリックされたURL
{ url: "https://example.com/contact" }

// scroll: スクロール深度（パーセント）
{ scrollDepth: 25 }  // 25%, 50%, 75%, 100%

// time: 滞在時間（秒）
{ timeSpent: 120 }

// read: 精読率（最大スクロール深度）
{ readPercentage: 78 }
```

---

## 3. ProfileViewTracker の実装

### コンポーネント全体像

```typescript
// components/ProfileViewTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { saveAnalytics } from '@/app/actions/analytics';
import { saveBusinessAnalytics } from '@/app/actions/business';

export function ProfileViewTracker({ 
  profileId, 
  contentType = 'profile' 
}: { 
  profileId: string;
  contentType?: 'profile' | 'business';
}) {
  // 開始時刻の記録
  const startTimeRef = useRef<number>(Date.now());
  
  // 最大スクロール深度
  const maxScrollRef = useRef<number>(0);
  
  // 記録済みスクロールマイルストーン
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  
  // 精読記録済みフラグ
  const readTrackedRef = useRef<boolean>(false);
  
  // ビュー記録済みフラグ
  const viewTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // バリデーション
    if (!profileId || profileId === 'demo') return;

    // アナリティクス保存関数を選択
    const saveAnalyticsFunc = contentType === 'business' 
      ? saveBusinessAnalytics 
      : saveAnalytics;

    // 1. ページビュー記録（初回のみ）
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      saveAnalyticsFunc(profileId, 'view');
    }

    // 2. スクロール追跡
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 
        ? Math.round((scrollTop / scrollHeight) * 100) 
        : 0;
      
      // 最大値を更新
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);

      // マイルストーン記録（25%, 50%, 75%, 100%）
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollDepth >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          saveAnalyticsFunc(profileId, 'scroll', { scrollDepth: milestone });
        }
      });
    };

    // 3. 精読判定（50%以上スクロール）
    const checkReadRate = () => {
      if (!readTrackedRef.current && maxScrollRef.current >= 50) {
        readTrackedRef.current = true;
        saveAnalyticsFunc(profileId, 'read', { readPercentage: maxScrollRef.current });
      }
    };

    // イベントリスナー登録
    window.addEventListener('scroll', handleScroll);
    
    // 定期チェック（1秒ごと）
    const scrollInterval = setInterval(() => {
      handleScroll();
      checkReadRate();
    }, 1000);

    // 4. ページ離脱時の滞在時間記録
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        // sendBeacon APIで確実に送信
        navigator.sendBeacon('/api/analytics', JSON.stringify({
          profileId,
          eventType: 'time',
          eventData: { timeSpent },
          contentType
        }));
      }
    };

    // 5. 定期的な滞在時間記録（30秒ごと）
    const timeInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent >= 30) {
        saveAnalyticsFunc(profileId, 'time', { timeSpent });
      }
    }, 30000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // クリーンアップ
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(scrollInterval);
      clearInterval(timeInterval);
      
      // 最終データ記録
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 3) {
        saveAnalyticsFunc(profileId, 'time', { timeSpent });
      }
    };
  }, [profileId, contentType]);

  return null; // UIなしのトラッカー
}
```

### 使用例

```typescript
// app/b/[slug]/page.tsx
export default async function BusinessLPPage({ params }) {
  const { slug } = await params;
  const project = await getBusinessProject(slug);

  return (
    <>
      {/* トラッカー配置（UIなし） */}
      <ProfileViewTracker profileId={project.slug} contentType="business" />
      
      {/* ページコンテンツ */}
      <div>
        {project.content.map(block => (
          <BlockRenderer 
            key={block.id} 
            block={block} 
            profileId={project.slug} 
            contentType="business" 
          />
        ))}
      </div>
    </>
  );
}
```

---

## 4. クリックトラッキング

### BlockRenderer でのトラッキング

```typescript
// components/BlockRenderer.tsx

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

// リンクブロックでの使用例
case 'links':
  return (
    <section className="space-y-3 animate-fade-in">
      {block.data.links.map((link, index) => {
        const handleClick = async () => {
          if (profileId && profileId !== 'demo') {
            try {
              await saveAnalyticsForContentType(contentType, profileId, 'click', { 
                url: link.url 
              });
            } catch (error) {
              console.error('[LinkClick] Tracking error:', error);
            }
          }
        };

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="link-button"
          >
            {link.label}
          </a>
        );
      })}
    </section>
  );
```

### CTAボタンでのトラッキング

```typescript
// ヒーローセクションのCTAボタン
function HeroBlock({ block, profileId, contentType }) {
  const handleCtaClick = async () => {
    if (profileId && profileId !== 'demo' && block.data.ctaUrl) {
      try {
        await saveAnalyticsForContentType(contentType, profileId, 'click', { 
          url: block.data.ctaUrl 
        });
      } catch (error) {
        console.error('[HeroClick] Tracking error:', error);
      }
    }
  };

  return (
    <section>
      {/* ... ヘッドライン等 */}
      {block.data.ctaText && block.data.ctaUrl && (
        <a
          href={block.data.ctaUrl}
          onClick={handleCtaClick}
          className="btn-primary"
        >
          {block.data.ctaText}
        </a>
      )}
    </section>
  );
}
```

---

## 5. アナリティクスの集計と表示

### Server Action での集計

```typescript
// app/actions/analytics.ts
export async function getAnalytics(profileId: string) {
  if (!supabase) {
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }

  const { data: allEvents, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('profile_id', profileId)
    .eq('content_type', 'profile');

  if (error) {
    console.error('[Analytics] Fetch error:', error);
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }

  // イベントタイプ別に分類
  const views = allEvents?.filter(e => e.event_type === 'view') || [];
  const clicks = allEvents?.filter(e => e.event_type === 'click') || [];
  const scrolls = allEvents?.filter(e => e.event_type === 'scroll') || [];
  const times = allEvents?.filter(e => e.event_type === 'time') || [];
  const reads = allEvents?.filter(e => e.event_type === 'read') || [];

  // 平均スクロール深度
  const scrollDepths = scrolls
    .map(e => e.event_data?.scrollDepth || 0)
    .filter(d => d > 0);
  const avgScrollDepth = scrollDepths.length > 0
    ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
    : 0;

  // 平均滞在時間（秒）
  const timeSpents = times
    .map(e => e.event_data?.timeSpent || 0)
    .filter(t => t > 0);
  const avgTimeSpent = timeSpents.length > 0
    ? Math.round(timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length)
    : 0;

  // 精読率（50%以上スクロールした割合）
  const readPercentages = reads
    .map(e => e.event_data?.readPercentage || 0)
    .filter(r => r > 0);
  const readCount = readPercentages.filter(r => r >= 50).length;
  const readRate = views.length > 0 
    ? Math.round((readCount / views.length) * 100) 
    : 0;

  // クリック率
  const clickRate = views.length > 0 
    ? Math.round((clicks.length / views.length) * 100) 
    : 0;

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

### エディタでの表示

```typescript
// components/BusinessLPEditor.tsx
const [analytics, setAnalytics] = useState<{
  views: number;
  clicks: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
}>({ views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 });

// データロード時に取得
useEffect(() => {
  const loadProfile = async () => {
    if (!initialSlug) return;
    
    const { data } = await supabase
      .from('business_projects')
      .select('*')
      .eq('slug', initialSlug)
      .single();

    if (data?.slug) {
      // アナリティクス取得
      const analyticsData = await getBusinessAnalytics(data.slug);
      setAnalytics(analyticsData);
    }
  };
  loadProfile();
}, [initialSlug]);

// 表示UI
<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
  <div className="bg-indigo-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-indigo-600">{analytics.views}</div>
    <div className="text-xs text-gray-600">ページビュー</div>
  </div>
  <div className="bg-green-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-green-600">{analytics.clicks}</div>
    <div className="text-xs text-gray-600">クリック数</div>
  </div>
  <div className="bg-purple-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-purple-600">{analytics.avgScrollDepth}%</div>
    <div className="text-xs text-gray-600">平均スクロール</div>
  </div>
  <div className="bg-orange-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-orange-600">{analytics.avgTimeSpent}秒</div>
    <div className="text-xs text-gray-600">平均滞在時間</div>
  </div>
  <div className="bg-pink-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-pink-600">{analytics.readRate}%</div>
    <div className="text-xs text-gray-600">精読率</div>
  </div>
  <div className="bg-cyan-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-cyan-600">{analytics.clickRate}%</div>
    <div className="text-xs text-gray-600">クリック率</div>
  </div>
</div>
```

---

## 6. 決済システム概要

### 決済フロー全体像

```
┌─────────────────────────────────────────────────────────────────┐
│                         クライアント                              │
│                                                                  │
│  1. 寄付ボタンクリック                                            │
│     │                                                            │
│     ▼                                                            │
│  2. /api/business-checkout へ POST                               │
│     { projectId, projectName, userId, email, price }              │
│                                                                  │
└────────────────────────────────────────────────────────────────-─┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/business-checkout                        │
│                                                                  │
│  3. Stripe Checkout Session 作成                                 │
│     - 商品情報設定                                                │
│     - success_url / cancel_url 設定                              │
│     - metadata にプロジェクト情報付与                             │
│                                                                  │
│  4. Checkout URL を返却                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Stripe Checkout                              │
│                                                                  │
│  5. 決済フォーム表示                                               │
│  6. カード情報入力・決済実行                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
               ┌─────────────┴─────────────┐
               │                           │
               ▼                           ▼
         決済成功                       決済キャンセル
               │                           │
               ▼                           ▼
    success_url へリダイレクト      cancel_url へリダイレクト
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   /business/dashboard                            │
│                   ?payment=success&session_id=xxx                │
│                                                                  │
│  7. /api/business-verify へ POST                                 │
│     { sessionId, projectId, userId }                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/business-verify                          │
│                                                                  │
│  8. Stripe Session 検証                                          │
│     - payment_status === 'paid' 確認                             │
│                                                                  │
│  9. 重複チェック                                                  │
│     - 同一 session_id の購入履歴がないか                          │
│                                                                  │
│ 10. business_project_purchases に記録                             │
│     - user_id, project_id, stripe_session_id, amount              │
│                                                                  │
│ 11. 成功レスポンス                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Pro機能開放                                  │
│                                                                  │
│ 12. ダッシュボードで購入履歴を確認                                 │
│     - HTMLダウンロード可能                                        │
│     - 埋め込みコード取得可能                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Stripe連携の実装

### Checkout Session 作成

```javascript
// app/api/business-checkout/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request) {
  try {
    // 環境変数チェック
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      );
    }

    const { projectId, projectName, userId, email, price } = await request.json();

    // バリデーション
    if (!projectId || !projectName || !userId || !email || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 金額バリデーション（500円〜100,000円）
    if (price < 500 || price > 100000) {
      return NextResponse.json(
        { error: 'Price must be between 500 and 100,000 yen' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Checkout Session 作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `ビジネスLP Pro機能開放: ${projectName}`,
              description: 'HTMLダウンロード・埋め込みコード機能が利用可能になります',
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/business/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}`,
      cancel_url: `${baseUrl}/business/dashboard?payment=cancel`,
      customer_email: email,
      metadata: {
        projectId,
        userId,
        projectName,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### 決済検証

```javascript
// app/api/business-verify/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Supabase Admin（RLSバイパス）
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );
}

export async function POST(request) {
  try {
    const { sessionId, projectId, userId } = await request.json();

    // バリデーション
    if (!sessionId || !projectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Stripe Session 検証
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 重複チェック
    const { data: existingPurchase } = await supabase
      .from('business_project_purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingPurchase) {
      // 既に記録済み（冪等性確保）
      return NextResponse.json({ 
        success: true, 
        message: 'Purchase already recorded' 
      });
    }

    // 購入履歴を記録
    const { data: purchase, error } = await supabase
      .from('business_project_purchases')
      .insert([{
        user_id: userId,
        project_id: projectId,
        stripe_session_id: sessionId,
        amount: session.amount_total,
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record purchase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
```

---

## 8. 購入履歴と機能開放

### 購入履歴テーブル

```sql
CREATE TABLE business_project_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_purchases_user ON business_project_purchases(user_id);
CREATE INDEX idx_purchases_project ON business_project_purchases(project_id);
CREATE INDEX idx_purchases_session ON business_project_purchases(stripe_session_id);
```

### Pro機能の判定

```typescript
// ダッシュボードでの判定例
async function checkPurchaseStatus(userId: string, projectId: string) {
  const { data } = await supabase
    .from('business_project_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();
  
  return !!data;
}

// 使用例
const isPro = await checkPurchaseStatus(user.id, project.slug);

if (isPro) {
  // HTMLダウンロードボタン表示
  // 埋め込みコード表示
}
```

### クライアント側での決済開始

```typescript
// 寄付ボタンのハンドラー
const handleDonate = async (amount: number) => {
  if (!user) {
    setShowAuth(true);
    return;
  }

  try {
    const response = await fetch('/api/business-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: savedSlug,
        projectName: headerBlock?.data.name || 'ビジネスLP',
        userId: user.id,
        email: user.email,
        price: amount,
      }),
    });

    const data = await response.json();
    
    if (data.url) {
      // Stripe Checkoutへリダイレクト
      window.location.href = data.url;
    } else {
      throw new Error(data.error || '決済の開始に失敗しました');
    }
  } catch (error) {
    alert('決済エラー: ' + error.message);
  }
};
```

---

## 9. セキュリティ考慮事項

### アナリティクス

1. **デモページ除外**
   ```typescript
   if (profileId === 'demo') return;
   ```

2. **RLSポリシー**
   - 読み取り/挿入は誰でも可能（匿名ユーザーのトラッキングのため）
   - 削除はプロフィールオーナーのみ

3. **レートリミット**
   - 大量のイベント送信に対する保護を検討

### 決済

1. **サーバーサイド検証**
   - Stripe Session の payment_status を必ず確認
   
2. **重複防止**
   - stripe_session_id のユニーク制約
   - 検証時の重複チェック

3. **環境変数管理**
   - STRIPE_SECRET_KEY は絶対に公開しない
   - SUPABASE_SERVICE_ROLE_KEY もサーバーサイドのみ

4. **金額バリデーション**
   - サーバー側で金額範囲をチェック

---

## 10. 転用時のカスタマイズ

### アナリティクスのカスタマイズ

#### 新しいイベントタイプの追加

```typescript
// 型定義拡張
type EventType = 'view' | 'click' | 'scroll' | 'time' | 'read' | 'share' | 'download';

// Server Action 更新
export async function saveAnalytics(
  profileId: string,
  eventType: EventType,
  eventData?: { /* ... */ }
) {
  // CHECK制約も更新が必要
}

// SQL更新
ALTER TABLE analytics 
DROP CONSTRAINT analytics_event_type_check;

ALTER TABLE analytics 
ADD CONSTRAINT analytics_event_type_check 
CHECK (event_type IN ('view', 'click', 'scroll', 'time', 'read', 'share', 'download'));
```

#### 追加の集計指標

```typescript
// 例: シェア率の追加
export async function getAnalytics(profileId: string) {
  // ... 既存のコード

  const shares = allEvents?.filter(e => e.event_type === 'share') || [];
  const shareRate = views.length > 0 
    ? Math.round((shares.length / views.length) * 100) 
    : 0;

  return {
    // ... 既存の指標
    shareRate
  };
}
```

### 決済のカスタマイズ

#### 金額オプションの変更

```javascript
// 金額範囲の変更
if (price < 100 || price > 50000) {
  return NextResponse.json(
    { error: 'Price must be between 100 and 50,000 yen' },
    { status: 400 }
  );
}
```

#### 商品情報のカスタマイズ

```javascript
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'jpy',
      product_data: {
        name: `${projectName} プレミアムプラン`,
        description: 'すべての機能が利用可能になります',
        images: ['https://example.com/product-image.png'],
      },
      unit_amount: price,
    },
    quantity: 1,
  }],
  // ...
});
```

#### サブスクリプションへの変更

```javascript
// mode を 'subscription' に変更
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: 'price_XXXXX', // Stripe で事前に作成した Price ID
    quantity: 1,
  }],
  // ...
});
```

---

*このドキュメントはアナリティクスと決済システムの実装詳細を解説しています。*
*実際のコードは各ファイルを参照してください。*

