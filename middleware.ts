import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * KDL（Kindleダイレクトライト）のアクセス制限Middleware
 * 
 * /kindle 配下のページへのアクセスを制御し、
 * 未ログインユーザーを /kindle/lp にリダイレクトします。
 */

// 未ログインでもアクセス可能なパス
const PUBLIC_PATHS = [
  '/kindle/lp',
  '/kindle/agency',
  '/kindle/guide',
  '/kindle/publish-guide',
];

// デモモード用のパス（クエリパラメータ付き）
const DEMO_PATH = '/kindle/new';

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

  // 未ログインの場合はLPにリダイレクト
  if (!session) {
    const redirectUrl = new URL('/kindle/lp', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ログイン済みはそのまま通過
  return response;
}

// Middlewareを適用するパスを指定
export const config = {
  matcher: [
    '/kindle/:path*',
  ],
};


