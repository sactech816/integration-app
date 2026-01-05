import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// デフォルト価格（DBから取得できない場合）
const DEFAULT_PRICES = {
  monthly: 4980,
  yearly: 39800,
};

// サービスクライアント（読み取り用）
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * GET: KDL価格設定を取得
 */
export async function GET() {
  try {
    const supabase = getServiceClient();

    if (!supabase) {
      // Supabaseが利用不可の場合はデフォルト値を返す
      return NextResponse.json(DEFAULT_PRICES);
    }

    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'kdl_prices')
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_PRICES);
    }

    // value は JSON または文字列の可能性がある
    const prices = typeof data.value === 'string' 
      ? JSON.parse(data.value) 
      : data.value;

    return NextResponse.json({
      monthly: prices.monthly || DEFAULT_PRICES.monthly,
      yearly: prices.yearly || DEFAULT_PRICES.yearly,
    });
  } catch (error: any) {
    console.error('Get KDL prices error:', error);
    return NextResponse.json(DEFAULT_PRICES);
  }
}

