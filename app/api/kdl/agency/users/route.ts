import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 代理店チェック
    const { data: agency } = await supabase
      .from('kdl_agencies')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!agency) {
      return NextResponse.json({ error: 'Not an agency' }, { status: 403 });
    }

    // RPC関数で担当ユーザーの進捗を取得
    const { data: progress, error: rpcError } = await supabase
      .rpc('get_agency_user_progress', { p_agency_id: agency.id });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      // RPC関数が無い場合のフォールバック
      const { data: agencyUsers } = await supabase
        .from('kdl_agency_users')
        .select('user_id, assigned_at, note, status')
        .eq('agency_id', agency.id)
        .eq('status', 'active');

      if (!agencyUsers || agencyUsers.length === 0) {
        return NextResponse.json({ users: [] });
      }

      const users = [];
      for (const au of agencyUsers) {
        const { data: userData } = await supabase.auth.admin.getUserById(au.user_id);
        const userEmail = userData?.user?.email || 'Unknown';

        const { data: books } = await supabase
          .from('kdl_books')
          .select('id')
          .eq('user_id', au.user_id);

        const bookIds = (books || []).map(b => b.id);
        let totalSections = 0;
        let completedSections = 0;

        if (bookIds.length > 0) {
          const { data: sections } = await supabase
            .from('kdl_sections')
            .select('id, content')
            .in('book_id', bookIds);

          totalSections = (sections || []).length;
          completedSections = (sections || []).filter(
            s => s.content && s.content.length >= 100
          ).length;
        }

        users.push({
          user_id: au.user_id,
          user_email: userEmail,
          total_books: bookIds.length,
          total_sections: totalSections,
          completed_sections: completedSections,
          progress_percentage: totalSections > 0
            ? Math.round((completedSections / totalSections) * 1000) / 10
            : 0,
          assigned_at: au.assigned_at,
          note: au.note,
          status: au.status,
        });
      }

      return NextResponse.json({ users });
    }

    // RPCの結果に割り当てメタデータを追加
    const { data: assignments } = await supabase
      .from('kdl_agency_users')
      .select('user_id, assigned_at, note, status')
      .eq('agency_id', agency.id);

    const assignmentMap: Record<string, any> = {};
    (assignments || []).forEach(a => {
      assignmentMap[a.user_id] = a;
    });

    const users = (progress || []).map((p: any) => ({
      user_id: p.user_id,
      user_email: p.user_email,
      total_books: Number(p.total_books),
      total_sections: Number(p.total_sections),
      completed_sections: Number(p.completed_sections),
      progress_percentage: Number(p.progress_percentage),
      assigned_at: assignmentMap[p.user_id]?.assigned_at || null,
      note: assignmentMap[p.user_id]?.note || null,
      status: assignmentMap[p.user_id]?.status || 'active',
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Get agency users error:', error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}
