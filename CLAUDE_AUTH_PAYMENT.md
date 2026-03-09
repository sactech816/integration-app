# 認証・決済システム実装指示書
## 集客メーカー (makers.tokyo) — Next.js App Router + Supabase Auth + Stripe

---

## 🎯 概要・目標

このドキュメントはClaude Codeへの実装指示書です。
既存のバイブコーディングで作成した認証・決済まわりを、**信頼性の高い標準フロー**で再実装します。

**方針:**
- セキュリティファースト（トークン漏洩・CSRF・Webhookの検証を確実に行う）
- Server Componentsを最大限活用し、クライアントサイドの認証状態管理を最小化
- Stripeのベストプラクティスに従い、決済状態はWebhookで管理する（フロントエンド依存しない）

---

## 📁 実装対象ファイル構成

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx           # ログインページ
│   ├── signup/
│   │   └── page.tsx           # サインアップページ
│   ├── callback/
│   │   └── route.ts           # Supabase OAuth コールバック
│   └── reset-password/
│       └── page.tsx           # パスワードリセット
├── (protected)/               # 認証必須ルートグループ
│   ├── layout.tsx             # 認証チェックLayout
│   ├── dashboard/
│   │   └── page.tsx
│   └── account/
│       └── page.tsx
├── api/
│   ├── stripe/
│   │   ├── checkout/
│   │   │   └── route.ts       # Checkoutセッション作成
│   │   ├── portal/
│   │   │   └── route.ts       # Customer Portal
│   │   └── webhook/
│   │       └── route.ts       # Stripe Webhook処理
│   └── auth/
│       └── confirm/
│           └── route.ts       # メール確認
lib/
├── supabase/
│   ├── client.ts              # ブラウザ用クライアント
│   ├── server.ts              # サーバー用クライアント
│   └── middleware.ts          # セッション更新ミドルウェア
├── stripe/
│   └── client.ts              # Stripe初期化
└── hooks/
    └── useUser.ts             # クライアント用ユーザーフック
middleware.ts                  # ルート保護ミドルウェア
```

---

## 🔐 STEP 1: Supabase Auth 実装

### 1-1. パッケージインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1-2. 環境変数 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # サーバーサイドのみ使用
```

### 1-3. Supabaseクライアント作成

**`lib/supabase/client.ts`** — ブラウザ用（Client Components）

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** — サーバー用（Server Components / Route Handlers）

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentからの呼び出し時はset不可（無視してOK）
          }
        },
      },
    }
  )
}
```

### 1-4. Middleware — セッション更新 + ルート保護

**`middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ⚠️ 重要: getUser()を必ず呼ぶ（セッション更新のため）
  const { data: { user } } = await supabase.auth.getUser()

  // 保護ルートへの未認証アクセスをリダイレクト
  const protectedPaths = ['/dashboard', '/account', '/quiz']
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーがauth系ページにアクセスした場合
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 1-5. Auth コールバック Route Handler

**`app/(auth)/callback/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_error`)
}
```

### 1-6. ログインページ

**`app/(auth)/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh() // Server Componentのキャッシュをクリア
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div>
      {/* UIは既存デザインに合わせて実装 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
      <button onClick={handleGoogleLogin}>Googleでログイン</button>
    </div>
  )
}
```

### 1-7. 保護されたLayout

**`app/(protected)/layout.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

---

## 💳 STEP 2: Stripe 決済実装

### 2-1. パッケージインストール

```bash
npm install stripe @stripe/stripe-js
```

### 2-2. 環境変数追加

```env
STRIPE_SECRET_KEY=sk_live_...       # 本番: sk_live_ / テスト: sk_test_
STRIPE_WEBHOOK_SECRET=whsec_...     # Webhook署名シークレット
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2-3. Stripeクライアント初期化

**`lib/stripe/client.ts`**

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

### 2-4. Supabaseにサブスク情報カラムを追加

Supabase管理画面 > SQL Editorで実行:

```sql
-- ユーザープロフィールテーブル（既存の場合は ALTER TABLE で追加）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'free', -- 'free' | 'active' | 'past_due' | 'canceled'
  subscription_plan TEXT,                   -- 'starter' | 'pro' など
  subscription_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ユーザー作成時に自動でプロフィール作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2-5. Checkout セッション作成

**`app/api/stripe/checkout/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId } = await request.json()

  // 既存のStripe顧客IDを取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Stripe顧客がいない場合は作成
  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  })

  return NextResponse.json({ url: session.url })
}
```

### 2-6. Customer Portal（プラン変更・解約）

**`app/api/stripe/portal/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  })

  return NextResponse.json({ url: session.url })
}
```

### 2-7. Webhook処理 ⚠️ 最重要

**`app/api/stripe/webhook/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// ⚠️ Webhookは必ずService Role Keyで操作（RLSをバイパスするため）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ⚠️ Next.jsのbodyパーサーを無効化（署名検証に生のbodyが必要）
export const runtime = 'nodejs'

async function updateSubscription(customerId: string, subscription: Stripe.Subscription) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_plan: (subscription.items.data[0]?.price.metadata?.plan as string) ?? null,
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // イベント処理
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await updateSubscription(subscription.customer as string, subscription)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single()
      if (profile) {
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_plan: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
      }
      break
    }
    case 'invoice.payment_failed': {
      // 決済失敗メール送信などの処理
      console.log('Payment failed for:', event.data.object)
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
```

### 2-8. フロントエンドからCheckoutを呼び出す

```typescript
// 任意のClient Component内
async function handleSubscribe(priceId: string) {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  })
  const { url } = await res.json()
  if (url) window.location.href = url
}

// Customer Portal（プラン管理）
async function handlePortal() {
  const res = await fetch('/api/stripe/portal', { method: 'POST' })
  const { url } = await res.json()
  if (url) window.location.href = url
}
```

---

## 🧪 STEP 3: ローカルテスト手順

### Supabase Auth テスト
1. Supabase管理画面 > Authentication > Email Templates でリダイレクトURL設定
2. `http://localhost:3000/auth/callback` を許可URLに追加

### Stripe Webhook ローカルテスト

```bash
# Stripe CLIをインストール
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# ローカルにWebhookをフォワード
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 別ターミナルでテストイベント送信
stripe trigger customer.subscription.created
```

---

## ✅ セキュリティチェックリスト

Claude Codeで実装後、必ず以下を確認:

- [ ] `middleware.ts` で `supabase.auth.getUser()` を呼んでいる（`getSession()` は使わない）
- [ ] Webhook Route で `stripe.webhooks.constructEvent()` による署名検証を行っている
- [ ] Webhook Route で `SUPABASE_SERVICE_ROLE_KEY` を使ったAdminクライアントを使用
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が `NEXT_PUBLIC_` プレフィックスでない（クライアント露出禁止）
- [ ] 保護ルートの `layout.tsx` で `supabase.auth.getUser()` でサーバーサイド確認をしている
- [ ] Stripe の Price ID がフロントエンドで直接ハードコードされていてもOK（公開情報）
- [ ] `.env.local` が `.gitignore` に含まれている

---

## 📝 Claude Codeへの指示テンプレート

このファイルをプロジェクトルートに `CLAUDE_AUTH_PAYMENT.md` として配置し、以下のようにClaude Codeに指示してください:

```
@CLAUDE_AUTH_PAYMENT.md を読んで、このファイルの指示通りに
認証・決済システムを実装してください。

既存ファイルがある場合は削除せず、このドキュメントの実装に
合わせてリファクタリングしてください。

実装順序:
1. lib/supabase/ 以下のクライアントファイル
2. middleware.ts
3. app/(auth)/callback/route.ts
4. app/(protected)/layout.tsx
5. app/api/stripe/ 以下のRoute Handlers
6. Supabase SQLスキーマの適用確認
```
