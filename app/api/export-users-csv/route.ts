import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 管理者メールアドレスを取得
function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return emails.split(',').map(email => email.trim()).filter(email => email);
}

// Supabase Admin クライアント
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) return null;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // 認証ヘッダーからトークンを取得
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Supabaseクライアントでトークンを検証
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabaseが設定されていません' }, { status: 500 });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(email => 
      user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    // Supabase Admin APIでユーザー一覧を取得
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase Admin APIが設定されていません' }, { status: 500 });
    }

    // ユーザー情報を取得（auth.users テーブル）
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 10000 // 最大数を設定
    });

    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }

    // 各ユーザーのコンテンツ数を取得
    const userStats: Record<string, { quizzes: number; profiles: number; business: number }> = {};
    
    // クイズ数を取得
    const { data: quizCounts } = await supabaseAdmin
      .from('quizzes')
      .select('user_id');
    
    // プロフィール数を取得
    const { data: profileCounts } = await supabaseAdmin
      .from('profiles')
      .select('user_id');
    
    // ビジネスLP数を取得
    const { data: businessCounts } = await supabaseAdmin
      .from('business_projects')
      .select('user_id');

    // カウントを集計
    quizCounts?.forEach(q => {
      if (q.user_id) {
        if (!userStats[q.user_id]) userStats[q.user_id] = { quizzes: 0, profiles: 0, business: 0 };
        userStats[q.user_id].quizzes++;
      }
    });
    
    profileCounts?.forEach(p => {
      if (p.user_id) {
        if (!userStats[p.user_id]) userStats[p.user_id] = { quizzes: 0, profiles: 0, business: 0 };
        userStats[p.user_id].profiles++;
      }
    });
    
    businessCounts?.forEach(b => {
      if (b.user_id) {
        if (!userStats[b.user_id]) userStats[b.user_id] = { quizzes: 0, profiles: 0, business: 0 };
        userStats[b.user_id].business++;
      }
    });

    // CSVヘッダー
    const headers = [
      'ユーザーID',
      'メールアドレス',
      '電話番号',
      '作成日時',
      '最終ログイン',
      '診断クイズ数',
      'プロフィールLP数',
      'ビジネスLP数',
      '確認済み'
    ];

    // CSVボディ
    const rows = users.map(u => {
      const stats = userStats[u.id] || { quizzes: 0, profiles: 0, business: 0 };
      return [
        u.id,
        u.email || '',
        u.phone || '',
        u.created_at ? new Date(u.created_at).toLocaleString('ja-JP') : '',
        u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('ja-JP') : '',
        stats.quizzes.toString(),
        stats.profiles.toString(),
        stats.business.toString(),
        u.email_confirmed_at ? 'はい' : 'いいえ'
      ];
    });

    // CSV生成
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // BOM付きUTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // CSVレスポンス
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'CSVエクスポートに失敗しました' }, { status: 500 });
  }
}

















