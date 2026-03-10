/**
 * 単品購入の有効性チェックAPI
 * GET /api/features/check?userId=xxx&productId=ai_pack_10&contentId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const contentId = searchParams.get('contentId');

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'userId and productId are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase.rpc('check_feature_access', {
      p_user_id: userId,
      p_product_id: productId,
      p_content_id: contentId || null,
    });

    if (error) {
      console.error('check_feature_access error:', error);
      return NextResponse.json({ hasAccess: false, error: error.message });
    }

    return NextResponse.json({
      hasAccess: data?.has_access || false,
      purchaseId: data?.purchase_id || null,
      remainingUses: data?.remaining_uses ?? null,
      expiresAt: data?.expires_at || null,
    });
  } catch (err: any) {
    console.error('Feature check error:', err);
    return NextResponse.json({ hasAccess: false, error: err.message }, { status: 500 });
  }
}
