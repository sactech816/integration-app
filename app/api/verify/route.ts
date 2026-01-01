import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) return null;
  
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * POST: 決済セッションを検証し、購入を記録
 * 元の診断クイズプロジェクト（quizId形式）と統合プロジェクト（contentId形式）の両方に対応
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // 両方の形式に対応: 元のquizId形式と新しいcontentId形式
    const { sessionId, userId, quizId, contentId, contentType } = await request.json();
    
    console.log('[Verify] Request:', { sessionId, userId, quizId, contentId, contentType });

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Stripeセッションを取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[Verify] Stripe session status:', session.payment_status);

    // 決済が完了しているか確認
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not completed',
        status: session.payment_status 
      });
    }

    // 既に処理済みかチェック
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .single();

      if (existing) {
        console.log('[Verify] Already recorded:', sessionId);
        return NextResponse.json({ 
          success: true, 
          already_processed: true,
          purchase_id: existing.id
        });
      }

      // content_id と content_type を決定
      // 優先順位: リクエストボディ > Stripeメタデータ > 旧形式(quizId)
      const finalContentId = contentId || session.metadata?.content_id || quizId?.toString() || '';
      const finalContentType = contentType || session.metadata?.content_type || 'quiz';
      const amount = session.amount_total || 0;

      console.log('[Verify] Final values:', { finalContentId, finalContentType, amount, userId });

      if (userId && finalContentId) {
        // 購入データを構築
        const purchaseData: Record<string, unknown> = {
          user_id: userId,
          content_id: finalContentId,
          content_type: finalContentType,
          stripe_session_id: sessionId,
          amount: amount,
          created_at: new Date().toISOString()
        };

        // quiz_idカラムにも保存（元のプロジェクトとの互換性のため）
        if (finalContentType === 'quiz' && !isNaN(parseInt(finalContentId))) {
          purchaseData.quiz_id = parseInt(finalContentId);
        }

        console.log('[Verify] Inserting purchase:', purchaseData);

        const { data: purchase, error } = await supabase
          .from('purchases')
          .insert([purchaseData])
          .select()
          .single();

        if (error) {
          console.error('[Verify] Insert error:', error);
          return NextResponse.json({ 
            success: true, 
            recorded: false,
            error: error.message
          });
        }

        console.log('[Verify] Purchase recorded:', purchase);

        return NextResponse.json({ 
          success: true, 
          recorded: true,
          purchase_id: purchase.id,
          content_id: finalContentId,
          content_type: finalContentType,
          amount: amount
        });
      }
    }

    // Supabaseがない場合も決済は成功
    return NextResponse.json({ 
      success: true, 
      recorded: false,
      content_id: session.metadata?.content_id,
      content_type: session.metadata?.content_type,
      amount: session.amount_total
    });

  } catch (error) {
    console.error('[Verify] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

/**
 * GET: 決済状態を確認
 */
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      content_id: session.metadata?.content_id,
      content_type: session.metadata?.content_type,
      amount: session.amount_total
    });

  } catch (error) {
    console.error('[Verify GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}










































































