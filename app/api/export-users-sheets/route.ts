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
  console.log('[Export Sheets] API called at', new Date().toISOString());
  
  try {
    // 認証ヘッダーからトークンを取得
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Export Sheets] No authorization header');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[Export Sheets] Token received');
    
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
    console.log('[Export Sheets] Fetching users...');
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 10000
    });

    if (usersError) {
      console.error('[Export Sheets] Users fetch error:', usersError);
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }
    
    console.log('[Export Sheets] Users fetched:', users?.length || 0);

    // 各ユーザーのコンテンツ数を取得（最適化：並列取得）
    const [quizCountsResult, profileCountsResult, businessCountsResult] = await Promise.all([
      supabaseAdmin.from('quizzes').select('user_id'),
      supabaseAdmin.from('profiles').select('user_id'),
      supabaseAdmin.from('business_projects').select('user_id')
    ]);

    const quizCounts = quizCountsResult.data || [];
    const profileCounts = profileCountsResult.data || [];
    const businessCounts = businessCountsResult.data || [];

    // カウントを集計
    const userStats: Record<string, { quizzes: number; profiles: number; business: number }> = {};
    
    quizCounts.forEach(q => {
      if (q.user_id) {
        if (!userStats[q.user_id]) userStats[q.user_id] = { quizzes: 0, profiles: 0, business: 0 };
        userStats[q.user_id].quizzes++;
      }
    });
    
    profileCounts.forEach(p => {
      if (p.user_id) {
        if (!userStats[p.user_id]) userStats[p.user_id] = { quizzes: 0, profiles: 0, business: 0 };
        userStats[p.user_id].profiles++;
      }
    });
    
    businessCounts.forEach(b => {
      if (b.user_id) {
        if (!userStats[b.user_id]) userStats[b.user_id] = { quizzes: 0, profiles: 0, business: 0 };
        userStats[b.user_id].business++;
      }
    });

    // パートナーステータスを取得
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, is_partner, partner_since');
    
    const partnerMap: Record<string, { is_partner: boolean; partner_since: string | null }> = {};
    userRoles?.forEach(ur => {
      partnerMap[ur.user_id] = {
        is_partner: ur.is_partner || false,
        partner_since: ur.partner_since || null
      };
    });

    // 購入情報を取得（集計済み）
    const { data: purchaseStats } = await supabaseAdmin
      .from('purchases')
      .select('user_id, amount');
    
    const purchaseMap: Record<string, { count: number; total: number }> = {};
    purchaseStats?.forEach(p => {
      if (p.user_id) {
        if (!purchaseMap[p.user_id]) {
          purchaseMap[p.user_id] = { count: 0, total: 0 };
        }
        purchaseMap[p.user_id].count++;
        purchaseMap[p.user_id].total += p.amount || 0;
      }
    });

    // ユーザーIDリスト
    const userIds = users.map(u => u.id);

    // アナリティクスデータを取得（効率的な方法：コンテンツ→analyticsのマッピング）
    // まず、各ユーザーのコンテンツslugを取得
    const [quizDetails, profileDetails, businessDetails] = await Promise.all([
      supabaseAdmin.from('quizzes').select('slug, user_id').not('user_id', 'is', null),
      supabaseAdmin.from('profiles').select('slug, user_id').not('user_id', 'is', null),
      supabaseAdmin.from('business_projects').select('slug, user_id').not('user_id', 'is', null)
    ]);

    // コンテンツslug→user_idマップを作成
    const contentUserMap: Record<string, string> = {};
    quizDetails.data?.forEach(q => {
      if (q.user_id && q.slug) {
        contentUserMap[`quiz_${q.slug}`] = q.user_id;
      }
    });
    profileDetails.data?.forEach(p => {
      if (p.user_id && p.slug) {
        contentUserMap[`profile_${p.slug}`] = p.user_id;
      }
    });
    businessDetails.data?.forEach(b => {
      if (b.user_id && b.slug) {
        contentUserMap[`business_${b.slug}`] = b.user_id;
      }
    });

    const allContentKeys = Object.keys(contentUserMap);
    
    // アナリティクスを取得（content_idとcontent_typeでフィルタリング）
    const analyticsMap: Record<string, { views: number; clicks: number }> = {};
    userIds.forEach(userId => {
      analyticsMap[userId] = { views: 0, clicks: 0 };
    });

    if (allContentKeys.length > 0) {
      // アナリティクスを効率的に取得（最新30日分のみに制限して負荷を軽減）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // content_typeごとに分けて取得（より効率的）
      // 注意: 大量データの場合はパフォーマンス影響があるため、期間制限を推奨
      // 注: analyticsテーブルのカラム名を確認（content_id または profile_id）
      const analyticsPromises = [
        supabaseAdmin
          .from('analytics')
          .select('content_id, profile_id, content_type, event_type')
          .eq('content_type', 'quiz')
          .in('event_type', ['view', 'click'])
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabaseAdmin
          .from('analytics')
          .select('content_id, profile_id, content_type, event_type')
          .eq('content_type', 'profile')
          .in('event_type', ['view', 'click'])
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabaseAdmin
          .from('analytics')
          .select('content_id, profile_id, content_type, event_type')
          .eq('content_type', 'business')
          .in('event_type', ['view', 'click'])
          .gte('created_at', thirtyDaysAgo.toISOString())
      ];

      const [quizAnalytics, profileAnalytics, businessAnalytics] = await Promise.all(analyticsPromises);
      
      // 各コンテンツタイプのアナリティクスを集計
      const processAnalytics = (data: any[], contentType: string) => {
        data?.forEach(a => {
          // content_id または profile_id のどちらかを使用（DBスキーマに応じて）
          const contentId = a.content_id || a.profile_id;
          if (!contentId) return;
          
          const contentKey = `${contentType}_${contentId}`;
          const userId = contentUserMap[contentKey];
          if (userId && analyticsMap[userId]) {
            if (a.event_type === 'view') {
              analyticsMap[userId].views++;
            } else if (a.event_type === 'click') {
              analyticsMap[userId].clicks++;
            }
          }
        });
      };

      processAnalytics(quizAnalytics.data || [], 'quiz');
      processAnalytics(profileAnalytics.data || [], 'profile');
      processAnalytics(businessAnalytics.data || [], 'business');
      
      // デバッグ用ログ（本番環境では削除可）
      console.log('[Export] Analytics data:', {
        quizCount: quizAnalytics.data?.length || 0,
        profileCount: profileAnalytics.data?.length || 0,
        businessCount: businessAnalytics.data?.length || 0,
        contentKeysCount: allContentKeys.length,
        sampleContentKeys: allContentKeys.slice(0, 5),
        sampleAnalytics: {
          quiz: quizAnalytics.data?.slice(0, 3),
          profile: profileAnalytics.data?.slice(0, 3)
        }
      });
    } else {
      console.log('[Export] No content keys found for analytics');
    }

    // AI使用数を取得（analyticsテーブルから event_type = 'ai_generate'）
    const aiUsageMap: Record<string, { quiz: number; profile: number; business: number }> = {};
    userIds.forEach(userId => {
      aiUsageMap[userId] = { quiz: 0, profile: 0, business: 0 };
    });

    // AI生成イベントを取得（event_typeが'ai_generate'の場合、またはevent_dataにai_usageフラグがある場合）
    const { data: aiUsageData } = await supabaseAdmin
      .from('analytics')
      .select('content_id, profile_id, content_type, event_type')
      .eq('event_type', 'ai_generate')
      .limit(5000); // パフォーマンス考慮
    
    aiUsageData?.forEach(ai => {
      const contentId = ai.content_id || ai.profile_id;
      if (!contentId) return;
      
      const contentKey = `${ai.content_type}_${contentId}`;
      const userId = contentUserMap[contentKey];
      if (userId && aiUsageMap[userId]) {
        if (ai.content_type === 'quiz') {
          aiUsageMap[userId].quiz++;
        } else if (ai.content_type === 'profile') {
          aiUsageMap[userId].profile++;
        } else if (ai.content_type === 'business') {
          aiUsageMap[userId].business++;
        }
      }
    });

    // CSVヘッダー（CSVエクスポートと同一）
    const headers = [
      'ユーザーID',
      'メールアドレス',
      '電話番号',
      '作成日時',
      '最終ログイン',
      '診断クイズ数',
      'プロフィールLP数',
      'ビジネスLP数',
      '確認済み',
      'パートナーステータス',
      'パートナー登録日',
      '購入回数',
      '購入総額',
      '総閲覧数',
      '総クリック数',
      'AI使用数（クイズ）',
      'AI使用数（プロフィール）',
      'AI使用数（ビジネス）'
    ];

    // ユーザーデータを整形
    const userData = users.map(u => {
      const stats = userStats[u.id] || { quizzes: 0, profiles: 0, business: 0 };
      const partner = partnerMap[u.id] || { is_partner: false, partner_since: null };
      const purchases = purchaseMap[u.id] || { count: 0, total: 0 };
      const analytics = analyticsMap[u.id] || { views: 0, clicks: 0 };
      const aiUsage = aiUsageMap[u.id] || { quiz: 0, profile: 0, business: 0 };
      
      return {
        user_id: u.id,
        email: u.email || '',
        phone: u.phone || '',
        created_at: u.created_at ? new Date(u.created_at).toLocaleString('ja-JP') : '',
        last_sign_in_at: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('ja-JP') : '',
        confirmed_at: u.email_confirmed_at ? new Date(u.email_confirmed_at).toLocaleString('ja-JP') : '',
        // コンテンツ数（参考実装の形式に合わせる）
        quiz_count: stats.quizzes,
        profile_count: stats.profiles,
        business_count: stats.business,
        // パートナー情報
        is_partner: partner.is_partner ? 'はい' : 'いいえ',
        partner_since: partner.partner_since ? new Date(partner.partner_since).toLocaleString('ja-JP') : '',
        // 購入情報
        purchase_count: purchases.count,
        purchase_total: purchases.total,
        // アナリティクス
        total_views: analytics.views,
        total_clicks: analytics.clicks,
        // AI使用数
        ai_usage_quiz: aiUsage.quiz,
        ai_usage_profile: aiUsage.profile,
        ai_usage_business: aiUsage.business
      };
    });

    // 参考実装に合わせて、users配列（オブジェクト形式）のみを送信
    // Webhook側が期待する形式に合わせる
    console.log('[Export Sheets] Preparing webhook payload...');
    console.log('[Export Sheets] Data summary:', {
      url: webhookUrl ? 'configured' : 'missing',
      usersCount: userData.length,
      headersCount: headers.length,
      sampleUserKeys: userData[0] ? Object.keys(userData[0]) : []
    });

    // 参考実装の形式に合わせて送信（users配列とexported_atのみ）
    const payload = {
      users: userData, // オブジェクト配列形式
      exported_at: new Date().toISOString()
    };
    
    console.log('[Export Sheets] Payload structure:', {
      usersLength: payload.users?.length,
      firstUserSample: payload.users?.[0] ? {
        user_id: payload.users[0].user_id,
        email: payload.users[0].email,
        allKeys: Object.keys(payload.users[0]),
        sampleValues: {
          quiz_count: payload.users[0].quiz_count,
          profile_count: payload.users[0].profile_count,
          business_count: payload.users[0].business_count,
          purchase_count: payload.users[0].purchase_count,
          purchase_total: payload.users[0].purchase_total,
          total_views: payload.users[0].total_views,
          total_clicks: payload.users[0].total_clicks,
          is_partner: payload.users[0].is_partner
        }
      } : null
    });

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('[Export Sheets] Webhook response status:', webhookResponse.status);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('[Export Sheets] Webhook error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText
      });
      return NextResponse.json({ 
        error: 'Googleスプレッドシートへの送信に失敗しました',
        details: errorText
      }, { status: 500 });
    }

    const responseText = await webhookResponse.text();
    console.log('[Export Sheets] Webhook response:', {
      status: webhookResponse.status,
      statusText: webhookResponse.statusText,
      body: responseText.substring(0, 1000) // 最初の1000文字
    });
    
    // Webhook側が返す結果を確認（成功した場合）
    try {
      const webhookResult = JSON.parse(responseText);
      console.log('[Export Sheets] Webhook result:', webhookResult);
    } catch (e) {
      console.log('[Export Sheets] Webhook response is not JSON:', responseText);
    }

    return NextResponse.json({ 
      success: true,
      users_count: userData.length,
      message: `${userData.length}件のユーザー情報をGoogleスプレッドシートに送信しました`
    });

  } catch (error) {
    console.error('[Export Sheets] Unexpected error:', error);
    if (error instanceof Error) {
      console.error('[Export Sheets] Error message:', error.message);
      console.error('[Export Sheets] Error stack:', error.stack);
    }
    return NextResponse.json({ 
      error: 'Googleスプレッドシートへの送信に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}





















