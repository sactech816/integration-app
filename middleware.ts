import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * KDL（Kindleダイレクトライト）のアクセス制限Middleware
 * 
 * /kindle 配下のページへのアクセスを制御し、
 * 未ログイン・未課金ユーザーを /kindle/lp にリダイレクトします。
 * 
 * アクセス制御の優先順位:
 * 1. 公開パス（/kindle/lp, /kindle/guide等）は認証不要
 * 2. admin_keyパラメータ（管理者専用バイパス）
 * 3. 管理者（環境変数で指定されたメールアドレス）
 * 4. モニターユーザー（monitor_usersテーブルで有効期限内）
 * 5. 課金ユーザー（kdl_subscriptionsテーブルで有効なサブスクリプション）
 * 6. 上記以外は /kindle/lp#pricing にリダイレクト
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
  '/kindle/demo',
];

// デモモード用のパス（クエリパラメータ付き）
const DEMO_PATH = '/kindle/new';

// 管理者バイパス用シークレットキー（環境変数から取得）
const ADMIN_BYPASS_KEY = process.env.KDL_ADMIN_BYPASS_KEY || 'kdl-admin-2026';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

  // 管理者バイパス（?admin_key=xxx）- 緊急時の管理者専用バイパスキー
  const adminKey = searchParams.get('admin_key');
  if (adminKey === ADMIN_BYPASS_KEY) {
    return NextResponse.next();
  }

  // Supabaseの設定確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabaseが設定されていない場合は通過（開発環境用）
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // デバッグ: Cookieの確認
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name).join(',');

  // Supabaseクライアントを作成
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
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

    // セッション情報を取得
    let user = null;
    let authMethod = 'none';
    
    // getUser()を最初に試す（トークン検証を行う、推奨方法）
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authUser) {
        user = authUser;
        authMethod = 'getUser';
      } else if (authError) {
        // getUser()がエラーの場合、getSession()をフォールバックとして試す
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          user = session.user;
          authMethod = 'getSession';
        }
      }
    } catch (authErr: any) {
      // 認証エラーの場合もgetSession()を試す
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          user = session.user;
          authMethod = 'getSession-fallback';
        }
      } catch (sessionErr) {
        // 両方失敗
      }
    }

    // 未ログインの場合はLPにリダイレクト
    if (!user) {
      const redirectUrl = new URL('/kindle/lp', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.headers.set('X-KDL-Debug', `no-user:method=${authMethod}`);
      redirectResponse.headers.set('X-KDL-Cookies', cookieNames.substring(0, 200));
      return redirectResponse;
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const userEmail = user.email?.toLowerCase() || '';
    const isAdmin = adminEmails.includes(userEmail);

    // 管理者は常にアクセス可能
    if (isAdmin) {
      response.headers.set('X-KDL-Debug', 'admin-access');
      return response;
    }

    // サービスロールキーを使用してRLSをバイパス（モニター・サブスク確認用）
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = serviceRoleKey 
      ? createClient(supabaseUrl, serviceRoleKey)
      : null;

    const now = new Date().toISOString();
    const supabaseForQuery = supabaseAdmin || supabase;
    
    // モニター権限チェック（monitor_usersテーブルを確認）
    const { data: monitorData, error: monitorError } = await supabaseForQuery
      .from('monitor_users')
      .select('monitor_expires_at, monitor_start_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // モニター権限が有効期限内かチェック
    const hasMonitorAccess = monitorData && 
      new Date(monitorData.monitor_start_at) <= new Date(now) &&
      new Date(monitorData.monitor_expires_at) > new Date(now);

    if (hasMonitorAccess) {
      response.headers.set('X-KDL-Debug', 'monitor-access');
      return response;
    }

    // 課金者チェック（kdl_subscriptionsテーブルを確認）
    const { data: subscription, error: subError } = await supabaseForQuery
      .from('kdl_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    // 有効なサブスクリプションがあるかチェック
    const hasActiveSubscription = subscription && 
      subscription.status === 'active' &&
      new Date(subscription.current_period_end) > new Date();

    // 課金者はアクセス可能
    if (hasActiveSubscription) {
      response.headers.set('X-KDL-Debug', 'subscription-access');
      return response;
    }

    // 未課金ユーザーはLPの料金セクションにリダイレクト
    const redirectUrl = new URL('/kindle/lp#pricing', request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set('X-KDL-Debug', `no-access:user=${user.id}:monitor=${!!monitorData}:sub=${!!subscription}:svckey=${!!serviceRoleKey}`);
    if (monitorError) {
      redirectResponse.headers.set('X-KDL-Monitor-Error', monitorError.message.substring(0, 100));
    }
    return redirectResponse;

  } catch (err: any) {
    // エラーが発生した場合はデバッグ情報付きでLPにリダイレクト
    const redirectUrl = new URL('/kindle/lp', request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set('X-KDL-Debug', `error:${err.message?.substring(0, 100) || 'unknown'}`);
    redirectResponse.headers.set('X-KDL-Cookies', cookieNames.substring(0, 200));
    return redirectResponse;
  }
}

// Middlewareを適用するパスを指定
export const config = {
  matcher: [
    '/kindle',
    '/kindle/:path*',
  ],
};
