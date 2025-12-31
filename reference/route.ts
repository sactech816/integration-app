import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const googleWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    if (!googleWebhookUrl) {
      return NextResponse.json({ 
        error: 'Google Sheets Webhook URL not configured. Please set GOOGLE_SHEETS_WEBHOOK_URL in environment variables.' 
      }, { status: 500 });
    }

    // サービスロールクライアントを作成（管理者権限）
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // リクエストヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // トークンを検証してユーザー情報を取得
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 全ユーザー情報を取得
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // LPプロフィール数を集計
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, id');
    
    const profileCounts: Record<string, number> = {};
    if (profiles) {
      profiles.forEach(profile => {
        profileCounts[profile.user_id] = (profileCounts[profile.user_id] || 0) + 1;
      });
    }

    // 診断クイズ数を集計
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('user_id, id');
    
    const quizCounts: Record<string, number> = {};
    if (quizzes) {
      quizzes.forEach(quiz => {
        quizCounts[quiz.user_id] = (quizCounts[quiz.user_id] || 0) + 1;
      });
    }

    // LPプロフィール購入履歴を集計
    const { data: profilePurchases, error: profilePurchasesError } = await supabaseAdmin
      .from('profile_purchases')
      .select('user_id, id');
    
    const profilePurchaseCounts: Record<string, number> = {};
    if (profilePurchases) {
      profilePurchases.forEach(purchase => {
        profilePurchaseCounts[purchase.user_id] = (profilePurchaseCounts[purchase.user_id] || 0) + 1;
      });
    }

    // 診断クイズ購入履歴を集計
    const { data: quizPurchases, error: quizPurchasesError } = await supabaseAdmin
      .from('purchases')
      .select('user_id, id');
    
    const quizPurchaseCounts: Record<string, number> = {};
    if (quizPurchases) {
      quizPurchases.forEach(purchase => {
        quizPurchaseCounts[purchase.user_id] = (quizPurchaseCounts[purchase.user_id] || 0) + 1;
      });
    }

    // データを整形
    const usersData = users.map(user => ({
      user_id: user.id,
      email: user.email || '',
      created_at: user.created_at ? new Date(user.created_at).toLocaleString('ja-JP') : '',
      last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '',
      confirmed_at: user.confirmed_at ? new Date(user.confirmed_at).toLocaleString('ja-JP') : '',
      quiz_count: quizCounts[user.id] || 0,
      quiz_purchase_count: quizPurchaseCounts[user.id] || 0,
      profile_count: profileCounts[user.id] || 0,
      profile_purchase_count: profilePurchaseCounts[user.id] || 0
    }));

    // Google Apps Script Webhookにデータを送信
    const webhookResponse = await fetch(googleWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        users: usersData,
        exported_at: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Google Sheets webhook error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to send data to Google Sheets',
        details: errorText
      }, { status: 500 });
    }

    const result = await webhookResponse.json();

    return NextResponse.json({ 
      success: true, 
      message: 'Data exported to Google Sheets successfully',
      users_count: usersData.length,
      result
    });

  } catch (error: any) {
    console.error('Export to Google Sheets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
