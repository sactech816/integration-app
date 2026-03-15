import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    (email) => user.email?.toLowerCase() === email.toLowerCase()
  );
  if (!isAdmin) return null;

  return { user, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { supabase } = auth;
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('[Admin Inquiries API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ステータス更新（未読→既読→返信済み）
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { supabase } = auth;
    const { id, status, admin_note } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (admin_note !== undefined) updateData.admin_note = admin_note;

    const { error } = await supabase
      .from('contact_inquiries')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Inquiries API] Patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { supabase } = auth;
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Inquiries API] Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
