import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

// 管理者認証ヘルパー
async function authenticateAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const supabase = getServiceClient();
  if (!supabase) return { error: 'Database not configured', status: 500 };

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { error: 'Invalid token', status: 401 };

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    (email: string) => user.email?.toLowerCase() === email.toLowerCase()
  );
  if (!isAdmin) return { error: 'Admin access required', status: 403 };

  return { user, supabase };
}

// GET: 代理店一覧
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase } = auth;

    const { data: agencies, error } = await supabase
      .from('kdl_agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 各代理店のユーザー情報と割当ユーザー数を追加
    const enrichedAgencies = [];
    for (const agency of agencies || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(agency.user_id);
      const agencyEmail = userData?.user?.email || 'Unknown';

      const { count: assignedCount } = await supabase
        .from('kdl_agency_users')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', agency.id);

      // 割り当てられたユーザー一覧
      const { data: assignedUsers } = await supabase
        .from('kdl_agency_users')
        .select('id, user_id, assigned_at, note, status')
        .eq('agency_id', agency.id);

      const enrichedAssigned = [];
      for (const au of assignedUsers || []) {
        const { data: auData } = await supabase.auth.admin.getUserById(au.user_id);
        enrichedAssigned.push({
          ...au,
          user_email: auData?.user?.email || 'Unknown',
        });
      }

      enrichedAgencies.push({
        ...agency,
        agency_email: agencyEmail,
        assigned_count: assignedCount || 0,
        assigned_users: enrichedAssigned,
      });
    }

    return NextResponse.json({ agencies: enrichedAgencies });
  } catch (error: any) {
    console.error('Get agencies error:', error);
    return NextResponse.json({ error: 'Failed to get agencies' }, { status: 500 });
  }
}

// POST: 代理店登録・ユーザー割当
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user: adminUser, supabase } = auth;

    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      const { user_email, agency_name, agency_description, contact_email, contact_phone } = body;

      if (!user_email || !agency_name) {
        return NextResponse.json(
          { error: 'user_email and agency_name are required' },
          { status: 400 }
        );
      }

      // メールからユーザーを検索
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const targetUser = usersData?.users?.find(
        (u: any) => u.email?.toLowerCase() === user_email.toLowerCase()
      );

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found with this email' }, { status: 404 });
      }

      // 既に代理店として登録済みか確認
      const { data: existing } = await supabase
        .from('kdl_agencies')
        .select('id')
        .eq('user_id', targetUser.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'User is already registered as an agency' }, { status: 409 });
      }

      const { data: agency, error } = await supabase
        .from('kdl_agencies')
        .insert({
          user_id: targetUser.id,
          agency_name,
          agency_description: agency_description || null,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          status: 'active',
          created_by: adminUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ agency });

    } else if (action === 'assign-user') {
      const { agency_id, user_email, note } = body;

      if (!agency_id || !user_email) {
        return NextResponse.json(
          { error: 'agency_id and user_email are required' },
          { status: 400 }
        );
      }

      // メールからユーザーを検索
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const targetUser = usersData?.users?.find(
        (u: any) => u.email?.toLowerCase() === user_email.toLowerCase()
      );

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found with this email' }, { status: 404 });
      }

      // 既に別の代理店に割り当て済みか確認
      const { data: existingAssignment } = await supabase
        .from('kdl_agency_users')
        .select('id, agency_id')
        .eq('user_id', targetUser.id)
        .single();

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'User is already assigned to an agency' },
          { status: 409 }
        );
      }

      const { data: assignment, error } = await supabase
        .from('kdl_agency_users')
        .insert({
          agency_id,
          user_id: targetUser.id,
          assigned_by: adminUser.id,
          note: note || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ assignment });

    } else if (action === 'update-status') {
      const { agency_id, status } = body;

      if (!agency_id || !status) {
        return NextResponse.json(
          { error: 'agency_id and status are required' },
          { status: 400 }
        );
      }

      if (!['active', 'suspended', 'inactive'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const { error } = await supabase
        .from('kdl_agencies')
        .update({ status })
        .eq('id', agency_id);

      if (error) throw error;

      return NextResponse.json({ success: true });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin agency action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

// DELETE: 代理店削除・ユーザー割当解除
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!action || !id) {
      return NextResponse.json({ error: 'action and id are required' }, { status: 400 });
    }

    if (action === 'remove-agency') {
      const { error } = await supabase
        .from('kdl_agencies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });

    } else if (action === 'unassign-user') {
      const { error } = await supabase
        .from('kdl_agency_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin agency delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
