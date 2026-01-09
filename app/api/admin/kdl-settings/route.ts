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

// デフォルトのプラン定義（kdl_plan_definitionsテーブルがない場合のフォールバック）
const DEFAULT_PLAN_DEFINITIONS = {
  lite: {
    name: 'Lite',
    name_ja: 'ライト',
    monthly_price: 2980,
    yearly_price: 29800,
    daily_ai_limit: 20,
    monthly_ai_limit: 300,
    ai_model: 'gemini-flash',
  },
  standard: {
    name: 'Standard',
    name_ja: 'スタンダード',
    monthly_price: 4980,
    yearly_price: 49800,
    daily_ai_limit: 50,
    monthly_ai_limit: 500,
    ai_model: 'gpt-4o-mini',
  },
  pro: {
    name: 'Pro',
    name_ja: 'プロ',
    monthly_price: 9800,
    yearly_price: 98000,
    daily_ai_limit: 100,
    monthly_ai_limit: 1000,
    ai_model: 'gpt-4o-mini',
  },
  business: {
    name: 'Business',
    name_ja: 'ビジネス',
    monthly_price: 29800,
    yearly_price: 298000,
    daily_ai_limit: -1, // 無制限
    monthly_ai_limit: -1, // 無制限
    ai_model: 'gpt-4o',
  },
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

    // system_settingsから設定を取得
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value, description, updated_at')
      .in('key', ['kdl_prices', 'ai_daily_limit', 'ai_monthly_limit', 'ai_default_model']);

    // オブジェクト形式に変換
    const settings: Record<string, any> = {};
    if (!settingsError && settingsData) {
      settingsData.forEach((item) => {
        settings[item.key] = {
          value: item.value,
          description: item.description,
          updated_at: item.updated_at,
        };
      });
    }

    // kdl_plan_definitionsテーブルからプラン定義を取得
    let planDefinitions: Record<string, any> = {};
    const { data: planData, error: planError } = await supabase
      .from('kdl_plan_definitions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!planError && planData && planData.length > 0) {
      planData.forEach((plan) => {
        planDefinitions[plan.id] = plan;
      });
    } else {
      // テーブルがない場合はデフォルト値を使用
      planDefinitions = DEFAULT_PLAN_DEFINITIONS;
    }

    return NextResponse.json({
      settings,
      planDefinitions,
      hasPlanDefinitionsTable: !planError && planData && planData.length > 0,
    });
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
    const { type, key, value, planId, planData } = body;

    // プラン定義の更新
    if (type === 'plan_definition' && planId && planData) {
      const { error: updateError } = await supabase
        .from('kdl_plan_definitions')
        .update({
          monthly_price: planData.monthly_price,
          yearly_price: planData.yearly_price,
          daily_ai_limit: planData.daily_ai_limit,
          monthly_ai_limit: planData.monthly_ai_limit,
          ai_model: planData.ai_model,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (updateError) {
        // テーブルがない場合はsystem_settingsにフォールバック
        console.log('kdl_plan_definitions update failed, using system_settings');
        
        // 全プランの料金をsystem_settingsに保存
        await supabase
          .from('system_settings')
          .upsert({
            key: `kdl_plan_${planId}`,
            value: planData,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          });
      }

      return NextResponse.json({ success: true, planId, planData });
    }

    // 従来のsystem_settings更新
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 }
      );
    }

    // 許可されたキーのみ更新可能
    const allowedKeys = [
      'kdl_prices', 
      'ai_daily_limit', 
      'ai_monthly_limit', 
      'ai_default_model',
      'kdl_plan_lite',
      'kdl_plan_standard',
      'kdl_plan_pro',
      'kdl_plan_business',
    ];
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
