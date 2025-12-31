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

export async function POST(request: NextRequest) {
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

    // Google Sheets Webhook URLを確認
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ 
        error: 'GOOGLE_SHEETS_WEBHOOK_URL が設定されていません' 
      }, { status: 500 });
    }

    // Supabase Admin APIでユーザー一覧を取得
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase Admin APIが設定されていません' }, { status: 500 });
    }

    // ユーザー情報を取得（auth.users テーブル）
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 10000
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

    // ユーザーデータを整形
    const userData = users.map(u => {
      const stats = userStats[u.id] || { quizzes: 0, profiles: 0, business: 0 };
      return {
        user_id: u.id,
        email: u.email || '',
        phone: u.phone || '',
        created_at: u.created_at || '',
        last_sign_in_at: u.last_sign_in_at || '',
        quizzes_count: stats.quizzes,
        profiles_count: stats.profiles,
        business_count: stats.business,
        email_confirmed: u.email_confirmed_at ? true : false
      };
    });

    // Google Sheets Webhookに送信
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        users_count: userData.length,
        users: userData
      })
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', errorText);
      return NextResponse.json({ 
        error: 'Googleスプレッドシートへの送信に失敗しました' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      users_count: userData.length,
      message: `${userData.length}件のユーザー情報をGoogleスプレッドシートに送信しました`
    });

  } catch (error) {
    console.error('Google Sheets export error:', error);
    return NextResponse.json({ error: 'Googleスプレッドシートへの送信に失敗しました' }, { status: 500 });
  }
}















