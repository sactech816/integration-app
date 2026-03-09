import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * 統合 Middleware
 *
 * 1. 全ルートでセッション更新（Supabase Auth のトークンリフレッシュ）
 * 2. /kindle 配下のアクセス制御（既存ロジック維持）
 *
 * セッション更新はすべてのページリクエストで必要:
 * - Cookie に保存された JWT の有効期限を延長
 * - getUser() を呼ぶことでトークン検証 + リフレッシュが行われる
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
  '/kindle/book-lp',
  '/kindle/discovery',
  '/kindle/discovery/demo',
  '/kindle/free-trial',
  '/kindle/upgrade',
  '/kindle/optin',
];

// デモモード用のパス（クエリパラメータ付き）
const DEMO_PATH = '/kindle/new';

// 管理者バイパス用シークレットキー（環境変数から取得、デフォルト値なし）
const ADMIN_BYPASS_KEY = process.env.KDL_ADMIN_BYPASS_KEY;

/**
 * Supabase セッション更新用のクライアントを作成し、getUser() を呼ぶ
 * これにより Cookie 内のトークンが自動的にリフレッシュされる
 */
async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { response, user: null, supabase: null };

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser() でトークン検証 + リフレッシュ
  const { data: { user } } = await supabase.auth.getUser();

  return { response, user, supabase };
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ─── 1. 全ルート共通: セッション更新 ───
  const { response, user, supabase } = await updateSession(request);

  // /kindle 配下以外はセッション更新のみで通過
  if (!pathname.startsWith('/kindle')) {
    return response;
  }

  // ─── 2. /kindle 配下: アクセス制御 ───

  // 公開パスはそのまま通過
  for (const publicPath of PUBLIC_PATHS) {
    if (pathname === publicPath || pathname.startsWith(publicPath + '/')) {
      return response;
    }
  }

  // デモモード（/kindle/new?mode=demo）は通過
  if (pathname === DEMO_PATH && searchParams.get('mode') === 'demo') {
    return response;
  }

  // 管理者バイパス（?admin_key=xxx）
  const adminKey = searchParams.get('admin_key');
  if (ADMIN_BYPASS_KEY && adminKey === ADMIN_BYPASS_KEY) {
    return response;
  }

  // Supabase未設定の場合は通過（開発環境用）
  if (!supabase) {
    return response;
  }

  try {
    // 未ログインの場合はLPにリダイレクト
    if (!user) {
      return NextResponse.redirect(new URL('/kindle/lp', request.url));
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const userEmail = user.email?.toLowerCase() || '';
    const isAdmin = adminEmails.includes(userEmail);

    if (isAdmin) {
      return response;
    }

    // サービスロールキーを使用してRLSをバイパス（モニター・サブスク確認用）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : null;

    const now = new Date().toISOString();
    const supabaseForQuery = supabaseAdmin || supabase;

    // モニター権限チェック
    const { data: monitorData } = await supabaseForQuery
      .from('monitor_users')
      .select('monitor_expires_at, monitor_start_at, service')
      .eq('user_id', user.id)
      .eq('service', 'kdl')
      .maybeSingle();

    const hasMonitorAccess = monitorData &&
      new Date(monitorData.monitor_start_at) <= new Date(now) &&
      new Date(monitorData.monitor_expires_at) > new Date(now);

    if (hasMonitorAccess) {
      return response;
    }

    // 課金者チェック
    const { data: subscription } = await supabaseForQuery
      .from('kdl_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    const hasActiveSubscription = subscription &&
      subscription.status === 'active' &&
      new Date(subscription.current_period_end) > new Date();

    if (hasActiveSubscription) {
      return response;
    }

    // 代理店チェック
    const { data: agencyData } = await supabaseForQuery
      .from('kdl_agencies')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (agencyData) {
      return response;
    }

    // ログイン済みユーザーはフリープランとしてアクセス許可
    return response;

  } catch {
    return NextResponse.redirect(new URL('/kindle/lp', request.url));
  }
}

// 全ページでセッション更新を実行（静的ファイルを除外）
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
