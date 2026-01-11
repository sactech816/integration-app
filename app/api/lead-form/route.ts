import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// 送信元メールアドレス
const FROM_EMAIL = 'Makers Support <support@makers.tokyo>';

// サーバーサイドSupabaseクライアント
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const {
      content_id,
      content_type,
      content_title,
      email,
      name,
      message,
      admin_email,
    } = await request.json();

    // バリデーション
    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    // メールバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // リードをDBに保存
    const supabase = getSupabase();
    if (supabase && content_id && content_id !== 'demo') {
      try {
        await supabase.from('leads').insert({
          content_id: content_id,
          content_type: content_type || 'profile',
          email: email,
          name: name || null,
          message: message || null,
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('リード保存エラー:', dbError);
        // DBエラーでもメール送信は続行
      }
    }

    // 管理者通知先メール
    const notifyEmail = admin_email || process.env.ADMIN_EMAIL || process.env.YOUR_EMAIL;

    // 【1通目】ユーザーへの自動返信メール
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '【Makers】ご登録ありがとうございます',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">✉️ ご登録ありがとうございます</h1>
              </div>
              <div class="content">
                <p>${name ? `${name} 様` : 'お客様'}</p>
                <p>LPからのご登録を受け付けました。</p>
                <p>ご登録いただきありがとうございます。<br>担当者より追ってご連絡させていただきます。</p>
                <div class="footer">
                  <p>このメールは自動送信されています。</p>
                  <p>&copy; 2025 Makers</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('ユーザー返信メールエラー:', emailError);
    }

    // 【2通目】管理者への通知メール
    if (notifyEmail) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: notifyEmail,
          subject: `【LP通知】新規リード獲得${content_title ? ` - ${content_title}` : ''}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
                .info-block { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
                .label { font-weight: bold; color: #10b981; margin-bottom: 5px; font-size: 14px; }
                .value { color: #1f2937; font-size: 16px; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">🎉 新規リード獲得</h1>
                  ${content_title ? `<p style="margin: 10px 0 0 0; opacity: 0.9;">${content_title}</p>` : ''}
                </div>
                <div class="content">
                  <div class="info-block">
                    <div class="label">メールアドレス</div>
                    <div class="value">${email}</div>
                  </div>
                  ${name ? `
                  <div class="info-block">
                    <div class="label">お名前</div>
                    <div class="value">${name}</div>
                  </div>
                  ` : ''}
                  ${message ? `
                  <div class="info-block">
                    <div class="label">メッセージ</div>
                    <div class="value">${message}</div>
                  </div>
                  ` : ''}
                  <div class="info-block">
                    <div class="label">登録日時</div>
                    <div class="value">${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
                  </div>
                  <div class="footer">
                    <p>このメールはLPシステムから自動送信されています。</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error('管理者通知メールエラー:', emailError);
      }
    }

    // 【3】Resend Audienceへの追加（オプション）
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        await resend.contacts.create({
          audienceId: audienceId,
          email: email,
          firstName: name || undefined,
          unsubscribed: false,
        });
      } catch (audienceError) {
        console.error('Audience追加エラー:', audienceError);
        // Audienceエラーは無視して続行
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead form error:', error);
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    );
  }
}














