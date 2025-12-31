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

    // CSVボディ
    const rows = users.map(u => {
      const stats = userStats[u.id] || { quizzes: 0, profiles: 0, business: 0 };
      const partner = partnerMap[u.id] || { is_partner: false, partner_since: null };
      const purchases = purchaseMap[u.id] || { count: 0, total: 0 };
      const analytics = analyticsMap[u.id] || { views: 0, clicks: 0 };
      const aiUsage = aiUsageMap[u.id] || { quiz: 0, profile: 0, business: 0 };
      
      return [
        u.id,
        u.email || '',
        u.phone || '',
        u.created_at ? new Date(u.created_at).toLocaleString('ja-JP') : '',
        u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('ja-JP') : '',
        stats.quizzes.toString(),
        stats.profiles.toString(),
        stats.business.toString(),
        u.email_confirmed_at ? 'はい' : 'いいえ',
        partner.is_partner ? 'はい' : 'いいえ',
        partner.partner_since ? new Date(partner.partner_since).toLocaleString('ja-JP') : '',
        purchases.count.toString(),
        purchases.total.toString(),
        analytics.views.toString(),
        analytics.clicks.toString(),
        aiUsage.quiz.toString(),
        aiUsage.profile.toString(),
        aiUsage.business.toString()
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





















