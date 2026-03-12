import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: 公開購読エンドポイント（読者が自分で登録）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    // レート制限
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { listId } = await params;
    const { email, name, source, metadata } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト存在チェック
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id, name, resend_audience_id')
      .eq('id', listId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    // Resend Contactsに追加
    if (list.resend_audience_id) {
      try {
        await resend.contacts.create({
          email,
          firstName: name || '',
          audienceId: list.resend_audience_id,
          unsubscribed: false,
        });
      } catch (err) {
        console.error('[Newsletter Subscribe] Resend contact create failed:', err);
      }
    }

    // DB upsert
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          list_id: listId,
          email,
          name: name || null,
          status: 'subscribed',
          source: source || 'subscribe_form',
          metadata: metadata || {},
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: 'list_id,email' }
      );

    if (error) {
      console.error('[Newsletter Subscribe] Error:', error);
      return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
    }

    // Big Fiveサンプルレポート登録時にウェルカムメールを送信
    if (source === 'bigfive_sample') {
      try {
        const sampleType = metadata?.sample_type || '';
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@makers.tokyo';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: '【Big Five 性格診断】サンプルレポートをお届けします',
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0 0 8px 0;">Big Five 性格診断</h1>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">makers.tokyo</p>
              </div>

              <p style="font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                ご登録ありがとうございます。<br/>
                ${sampleType ? `<strong>${sampleType}タイプ</strong>の` : ''}サンプルレポートは以下のリンクからいつでもご覧いただけます。
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${siteUrl}/api/bigfive/sample-pdf?type=${encodeURIComponent(sampleType || 'INTJ')}"
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 700;">
                  サンプルレポートを見る
                </a>
              </div>

              <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <h2 style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 0 0 12px 0;">🔬 あなた自身の性格を診断してみませんか？</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 16px 0;">
                  Big Five性格診断では、科学的に裏付けられた5つの性格特性を無料で分析できます。<br/>
                  簡易診断（10問・約2分）から本格診断（50問）、詳細診断（145問）まで、3つのコースをご用意しています。
                </p>
                <div style="text-align: center;">
                  <a href="${siteUrl}/bigfive"
                     style="display: inline-block; background: #1e3a8a; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;">
                    無料で診断を始める →
                  </a>
                </div>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
                このメールは ${email} 宛に送信されています。<br/>
                配信停止をご希望の場合は<a href="${siteUrl}/newsletter/unsubscribe?listId=${listId}&email=${encodeURIComponent(email)}" style="color: #6b7280;">こちら</a>から解除できます。
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        // メール送信失敗はログのみ（登録自体は成功扱い）
        console.error('[Newsletter Subscribe] Welcome email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, message: '登録が完了しました' });
  } catch (error) {
    console.error('[Newsletter Subscribe] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
