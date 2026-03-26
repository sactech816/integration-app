import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getMakersSubscriptionStatus, checkNewsletterSendLimit } from '@/lib/subscription';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: キャンペーンを一斉送信
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // キャンペーン取得
    const { data: campaign } = await supabase
      .from('newsletter_campaigns')
      .select('*, newsletter_lists(name, from_name, from_email, resend_audience_id)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'キャンペーンが見つかりません' }, { status: 404 });
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'このキャンペーンは既に送信済みです' }, { status: 400 });
    }

    if (!campaign.subject || !campaign.html_content) {
      return NextResponse.json({ error: '件名と本文は必須です' }, { status: 400 });
    }

    // 有効な読者一覧を取得
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('list_id', campaign.list_id)
      .eq('status', 'subscribed');

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: '有効な読者がいません' }, { status: 400 });
    }

    // 送信制限チェック
    const subStatus = await getMakersSubscriptionStatus(userId);
    const limitCheck = await checkNewsletterSendLimit(userId, subStatus.planTier, subscribers.length);
    if (!limitCheck.canSend) {
      return NextResponse.json({
        error: `月間送信上限に達しています（${limitCheck.used}/${limitCheck.limit}通使用済み、残り${limitCheck.remaining}通）。上位プランにアップグレードすると送信数を増やせます。`,
      }, { status: 403 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
    const rawFromName = campaign.newsletter_lists?.from_name || '集客メーカー';
    const rawFromEmail = campaign.newsletter_lists?.from_email || process.env.RESEND_FROM_EMAIL || 'noreply@makers.tokyo';
    const fromEmail = rawFromEmail.replace(/[^\x00-\x7F]/g, '').trim();
    const fromName = rawFromName.replace(/[<>]/g, '').trim();

    if (!fromEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      return NextResponse.json({
        error: `差出人メールアドレスが不正です。リスト設定を確認してください。`,
      }, { status: 400 });
    }

    const fromField = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    // 配信停止リンクを含むHTML
    const addUnsubscribeLink = (html: string, email: string) => {
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?listId=${campaign.list_id}&email=${encodeURIComponent(email)}`;
      return html + `<div style="text-align:center;margin-top:32px;padding:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;"><a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">配信停止はこちら</a></div>`;
    };

    // バッチ送信（Resend batch API、最大100通ずつ）
    let sentCount = 0;
    const batchSize = 100;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const emails = batch.map((sub) => {
        const emailPayload: { from: string; to: string[]; subject: string; html: string; text?: string } = {
          from: fromField,
          to: [sub.email],
          subject: campaign.subject,
          html: addUnsubscribeLink(campaign.html_content, sub.email),
        };
        if (campaign.text_content) {
          emailPayload.text = campaign.text_content;
        }
        return emailPayload;
      });

      try {
        const { data, error: batchError } = await resend.batch.send(emails);
        if (batchError) {
          console.error(`[Newsletter Send] Batch ${i} error:`, batchError);
        } else {
          sentCount += batch.length;
          console.log(`[Newsletter Send] Batch ${i} sent:`, data?.data?.length, 'emails');
        }
      } catch (err) {
        console.error(`[Newsletter Send] Batch ${i} failed:`, err);
      }
    }

    // キャンペーンのステータスを更新
    await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // 送信ログを記録（月間送信数カウント用）
    if (sentCount > 0) {
      const { error: logError } = await supabase
        .from('newsletter_send_logs')
        .insert({
          user_id: userId,
          campaign_id: id,
          sent_count: sentCount,
          sent_at: new Date().toISOString(),
        });

      if (logError) {
        console.error('[Newsletter Send] Failed to insert send log:', logError);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalSubscribers: subscribers.length,
    });
  } catch (error) {
    console.error('[Newsletter Send] Error:', error);
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
  }
}
