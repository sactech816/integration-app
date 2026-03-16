import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml, isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const EXPERIENCE_LABELS: Record<string, string> = {
  never: 'まだ使ったことがない',
  few_times: '数回使ったことがある',
  regularly: '日常的に使っている',
  paid_plan: '有料プランで活用中',
};

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
    const safeName = name.slice(0, 100);
    const safeOccupation = occupation.slice(0, 100);
    const safeMotivation = motivation.slice(0, 2000);

    const { error } = await supabase.from('supporter_applications').insert({
      user_id: user_id || null,
      name: safeName,
      email,
      phone: phone?.slice(0, 20) || null,
      occupation: safeOccupation,
      website_url: website_url?.slice(0, 500) || null,
      sns_urls: sns_urls?.slice(0, 1000) || null,
      experience,
      teaching_experience: teaching_experience?.slice(0, 2000) || null,
      motivation: safeMotivation,
      target_audience: target_audience?.slice(0, 200) || null,
      skills: skills || null,
      how_heard: how_heard || null,
    });

    if (error) {
      console.error('[Supporters Apply] DB insert error:', error);
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    // XSSエスケープ
    const escapedName = escapeHtml(safeName);
    const escapedEmail = escapeHtml(email);
    const escapedOccupation = escapeHtml(safeOccupation);
    const experienceLabel = EXPERIENCE_LABELS[experience] || experience;
    const escapedMotivation = escapeHtml(safeMotivation);
    const escapedTeaching = teaching_experience ? escapeHtml(teaching_experience.slice(0, 2000)) : '（未入力）';
    const escapedTarget = target_audience ? escapeHtml(target_audience.slice(0, 200)) : '（未入力）';
    const skillsDisplay = skills ? JSON.parse(skills).join('、') : '（未選択）';

    // 管理者宛メール送信
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: 'support@makers.tokyo',
        replyTo: email,
        subject: `【サポーターズ応募】${escapedName}様（${escapedOccupation}）`,
        html: `
          <h2>サポーターズ制度への応募がありました</h2>
          <hr />
          <p><strong>お名前:</strong> ${escapedName}</p>
          <p><strong>メール:</strong> ${escapedEmail}</p>
          <p><strong>電話番号:</strong> ${phone ? escapeHtml(phone) : '（未入力）'}</p>
          <p><strong>職業・肩書き:</strong> ${escapedOccupation}</p>
          <p><strong>Webサイト:</strong> ${website_url ? escapeHtml(website_url) : '（未入力）'}</p>
          <p><strong>SNS:</strong> ${sns_urls ? escapeHtml(sns_urls) : '（未入力）'}</p>
          <hr />
          <p><strong>集客メーカー利用経験:</strong> ${experienceLabel}</p>
          <p><strong>教える・コンサル経験:</strong></p>
          <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapedTeaching}</p>
          <p><strong>得意分野:</strong> ${skillsDisplay}</p>
          <hr />
          <p><strong>応募動機:</strong></p>
          <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapedMotivation}</p>
          <p><strong>サポート対象者:</strong> ${escapedTarget}</p>
          <hr />
          <p style="color: #9ca3af; font-size: 12px;">このメールは集客メーカーのサポーターズ応募フォームから送信されました。</p>
        `,
      });
    } catch (mailError) {
      console.warn('[Supporters Apply] Admin mail failed:', mailError);
    }

    // 応募者への自動返信メール
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: '【集客メーカー】サポーターズ制度へのご応募ありがとうございます',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #ca8a04, #eab308); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #fff; font-size: 20px; margin: 0;">サポーターズ制度へのご応募ありがとうございます</h1>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <p style="font-size: 15px; line-height: 1.8;">${escapedName} 様</p>
              <p style="font-size: 15px; line-height: 1.8;">
                この度は集客メーカー サポーターズ制度にご応募いただき、誠にありがとうございます。
              </p>
              <p style="font-size: 15px; line-height: 1.8;">
                以下の内容でお申し込みを受け付けました。<br />
                審査結果は<strong>3〜5営業日以内</strong>にメールでお知らせいたします。
              </p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;"><strong>職業・肩書き:</strong></p>
                <p style="margin: 0 0 16px; font-size: 15px;">${escapedOccupation}</p>
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;"><strong>利用経験:</strong></p>
                <p style="margin: 0 0 16px; font-size: 15px;">${experienceLabel}</p>
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;"><strong>応募動機:</strong></p>
                <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${escapedMotivation}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
                このメールは集客メーカー（makers.tokyo）のサポーターズ応募フォームから自動送信されています。<br />
                お心当たりのない場合は、このメールを無視していただいて問題ありません。
              </p>
            </div>
          </div>
        `,
      });
    } catch (autoReplyError) {
      console.warn('[Supporters Apply] Auto-reply failed:', autoReplyError);
    }

    return NextResponse.json({ success: true, message: '応募を受け付けました' });
  } catch (error) {
    console.error('[Supporters Apply] Error:', error);
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
  }
}
