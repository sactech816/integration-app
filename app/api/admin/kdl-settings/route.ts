import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// 設定を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // 全設定を取得
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value, description, updated_at')
      .in('key', ['kdl_prices', 'ai_daily_limit', 'ai_monthly_limit', 'ai_default_model']);

    if (error) {
      throw error;
    }

    // オブジェクト形式に変換
    const settings: Record<string, any> = {};
    data?.forEach((item) => {
      settings[item.key] = {
        value: item.value,
        description: item.description,
        updated_at: item.updated_at,
      };
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Get KDL settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// 設定を更新
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 }
      );
    }

    // 許可されたキーのみ更新可能
    const allowedKeys = ['kdl_prices', 'ai_daily_limit', 'ai_monthly_limit', 'ai_default_model'];
    if (!allowedKeys.includes(key)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }

    // 設定を更新
    const { error: updateError } = await supabase
      .from('system_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error('Update KDL settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}



