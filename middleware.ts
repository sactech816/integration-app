import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * KDL（Kindleダイレクトライト）のアクセス制限Middleware
 * 
 * /kindle 配下のページへのアクセスを制御し、
 * 未ログイン・未課金ユーザーを /kindle/lp にリダイレクトします。
 * 管理者と課金者のみアクセス可能です。
 */

// 管理者メールアドレス（環境変数から取得、カンマ区切り）
const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

// 未ログインでもアクセス可能なパス
const PUBLIC_PATHS = [
  '/kindle/lp',
  '/kindle/agency',
  '/kindle/guide',
  '/kindle/publish-guide',
  '/kindle/demo', // デモページ（閲覧専用）
];

// デモモード用のパス（クエリパラメータ付き）
const DEMO_PATH = '/kindle/new';

// 管理者バイパス用シークレットキー（環境変数から取得）
const ADMIN_BYPASS_KEY = process.env.KDL_ADMIN_BYPASS_KEY || 'kdl-admin-2026';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // デバッグログ
  console.log('[Middleware] pathname:', pathname);
  console.log('[Middleware] admin_key:', searchParams.get('admin_key'));

  // /kindle 配下以外は通過
  if (!pathname.startsWith('/kindle')) {
    return NextResponse.next();
  }

  // 公開パスはそのまま通過
  for (const publicPath of PUBLIC_PATHS) {
    if (pathname === publicPath || pathname.startsWith(publicPath + '/')) {
      return NextResponse.next();
    }
  }

  // デモモード（/kindle/new?mode=demo）は通過
  if (pathname === DEMO_PATH && searchParams.get('mode') === 'demo') {
    return NextResponse.next();
  }

  // 管理者バイパス（?admin_key=xxx）- セミナーなど緊急時用
  const adminKey = searchParams.get('admin_key');
  console.log('[Middleware] Checking admin_key:', adminKey, 'Expected:', ADMIN_BYPASS_KEY);
  if (adminKey === ADMIN_BYPASS_KEY) {
    console.log('[Middleware] Admin bypass activated!');
    return NextResponse.next();
  }

  // Supabaseの設定確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabaseが設定されていない場合は通過（開発環境用）
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Supabaseクライアントを作成
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();

  console.log('[Middleware] Session exists:', !!session);
  console.log('[Middleware] User email:', session?.user?.email);

  // 未ログインの場合はLPにリダイレクト
  if (!session) {
    console.log('[Middleware] No session, redirecting to LP');
    const redirectUrl = new URL('/kindle/lp', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 管理者チェック
  const adminEmails = getAdminEmails();
  const userEmail = session.user.email?.toLowerCase() || '';
  const isAdmin = adminEmails.includes(userEmail);

  console.log('[Middleware] Admin emails:', adminEmails);
  console.log('[Middleware] User email:', userEmail);
  console.log('[Middleware] Is admin:', isAdmin);

  // 管理者は常にアクセス可能
  if (isAdmin) {
    console.log('[Middleware] Admin access granted');
    return response;
  }

  // 課金者チェック（kdl_subscriptionsテーブルを確認）
  const { data: subscription } = await supabase
    .from('kdl_subscriptions')
    .select('status, current_period_end')
    .eq('user_id', session.user.id)
    .single();

  // 有効なサブスクリプションがあるかチェック
  const hasActiveSubscription = subscription && 
    subscription.status === 'active' &&
    new Date(subscription.current_period_end) > new Date();

  // 課金者はアクセス可能
  if (hasActiveSubscription) {
    return response;
  }

  // 未課金ユーザーはLPの料金セクションにリダイレクト
  const redirectUrl = new URL('/kindle/lp#pricing', request.url);
  return NextResponse.redirect(redirectUrl);
}

// Middlewareを適用するパスを指定
export const config = {
  matcher: [
    '/kindle',
    '/kindle/:path*',
  ],
};



