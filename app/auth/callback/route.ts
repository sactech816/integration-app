import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * メール認証・パスワードリセットのコールバックハンドラー
 *
 * Supabaseからのリダイレクト（認証コード付き）を受け取り、
 * コードをセッションに交換した後、トップページにリダイレクトします。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = NextResponse.redirect(new URL('/', origin));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // パスワードリセットの場合はトップページにリダイレクト
      // （クライアント側でonAuthStateChangeがPASSWORD_RECOVERYイベントを検知し、パスワード変更モーダルを表示）
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/?password_reset=true', origin));
      }
      // メール認証成功 → トップページ（ログイン済み）
      return response;
    }
  }

  // コードがない or 交換失敗 → トップページにリダイレクト
  return NextResponse.redirect(new URL('/', origin));
}
