import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    // レート制限チェック（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const body = await request.json();
    const { name, email, phone, occupation, website_url, sns_urls, experience, teaching_experience, motivation, target_audience, skills, how_heard, user_id } = body;

    // 必須フィールドバリデーション
    if (!name || !email || !occupation || !experience || !motivation) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 重複チェック（同一メールで pending の申請がないか）
    const { data: existing } = await supabase
      .from('supporter_applications')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '既に応募を受け付けています。審査結果をお待ちください。' }, { status: 409 });
    }

    // 応募データを保存
    const { error } = await supabase.from('supporter_applications').insert({
      user_id: user_id || null,
      name: name.slice(0, 100),
      email,
      phone: phone?.slice(0, 20) || null,
      occupation: occupation.slice(0, 100),
      website_url: website_url?.slice(0, 500) || null,
      sns_urls: sns_urls?.slice(0, 1000) || null,
      experience,
      teaching_experience: teaching_experience?.slice(0, 2000) || null,
      motivation: motivation.slice(0, 2000),
      target_audience: target_audience?.slice(0, 200) || null,
      skills: skills || null,
      how_heard: how_heard || null,
    });

    if (error) {
      console.error('[Supporters Apply] DB insert error:', error);
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '応募を受け付けました' });
  } catch (error) {
    console.error('[Supporters Apply] Error:', error);
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
  }
}
