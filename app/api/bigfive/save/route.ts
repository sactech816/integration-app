import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const {
      testType,
      traits,
      mbtiCode,
      mbtiDimensions,
      discType,
      enneagramResult,
      facetScores,
      answers,
      durationSeconds,
    } = body;

    if (!testType || !traits) {
      return NextResponse.json({ error: '診断データが不足しています' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bigfive_results')
      .insert({
        user_id: user.id,
        test_type: testType,
        openness: traits.openness.percentage,
        conscientiousness: traits.conscientiousness.percentage,
        extraversion: traits.extraversion.percentage,
        agreeableness: traits.agreeableness.percentage,
        neuroticism: traits.neuroticism.percentage,
        facet_scores: facetScores || null,
        mbti_code: mbtiCode || null,
        mbti_dimensions: mbtiDimensions || null,
        disc_type: discType || null,
        enneagram_result: enneagramResult || null,
        answers: answers || null,
        duration_seconds: durationSeconds || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('BigFive save error:', error);
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    // サンプル申込者との遅延リンク（メール照合）
    if (user.email) {
      try {
        const serviceClient = getServiceClient();
        if (serviceClient) {
          await serviceClient
            .from('newsletter_subscribers')
            .update({ linked_user_id: user.id })
            .eq('email', user.email)
            .eq('source', 'bigfive_sample')
            .is('linked_user_id', null);
        }
      } catch (e) {
        console.error('BigFive email linking error:', e);
      }
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('BigFive save error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
