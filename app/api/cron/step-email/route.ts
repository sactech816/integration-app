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
 * GET: ステップメール自動配信 Cron ジョブ
 * Vercel Cron で毎日朝9時（JST）に実行
 */
export async function GET(request: NextRequest) {
  try {
    // Cron認証（Vercel Cron Secret）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

    // 1. アクティブなシーケンスを全取得
    const { data: activeSequences, error: seqError } = await supabase
      .from('step_email_sequences')
      .select('*, newsletter_lists(name, from_name, from_email)')
      .eq('status', 'active');

    if (seqError || !activeSequences || activeSequences.length === 0) {
      return NextResponse.json({ message: 'No active sequences', sent: 0 });
    }

    let totalSent = 0;
    const errors: string[] = [];

    for (const sequence of activeSequences) {
      try {
        // 2. このシーケンスのステップを取得
        const { data: steps } = await supabase
          .from('step_email_steps')
          .select('*')
          .eq('sequence_id', sequence.id)
          .order('step_order', { ascending: true });

        if (!steps || steps.length === 0) continue;

        // 3. 送信対象の進捗を取得（active状態のもの）
        const { data: progressList } = await supabase
          .from('step_email_progress')
          .select('*, newsletter_subscribers(id, email, name, status)')
          .eq('sequence_id', sequence.id)
          .eq('status', 'active');

        if (!progressList || progressList.length === 0) continue;

        const now = new Date();

        // 4. 送信制限チェック
        const subStatus = await getMakersSubscriptionStatus(sequence.user_id);

        for (const progress of progressList) {
          try {
            const subscriber = progress.newsletter_subscribers;
            if (!subscriber || subscriber.status !== 'subscribed') {
              // 配信停止されている場合はprogressもpausedに
              await supabase
                .from('step_email_progress')
                .update({ status: 'paused' })
                .eq('id', progress.id);
              continue;
            }

            // 次に送るべきステップを取得
            const nextStep = steps.find((s: any) => s.step_order === progress.current_step);
            if (!nextStep) {
              // 全ステップ完了
              await supabase
                .from('step_email_progress')
                .update({ status: 'completed', completed_at: now.toISOString() })
                .eq('id', progress.id);
              continue;
            }

            // 送信タイミングチェック: started_at + delay_days <= now
            const startedAt = new Date(progress.started_at);
            const sendDate = new Date(startedAt);
            sendDate.setDate(sendDate.getDate() + nextStep.delay_days);

            if (now < sendDate) continue; // まだ送信時期ではない

            // 送信制限チェック
            const limitCheck = await checkNewsletterSendLimit(sequence.user_id, subStatus.planTier, 1);
            if (!limitCheck.canSend) {
              errors.push(`User ${sequence.user_id}: 月間送信上限`);
              continue;
            }

            // 5. メール送信
            const fromName = sequence.newsletter_lists?.from_name || '集客メーカー';
            const fromEmail = sequence.newsletter_lists?.from_email || process.env.RESEND_FROM_EMAIL || 'noreply@makers.tokyo';
            const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?listId=${sequence.list_id}&email=${encodeURIComponent(subscriber.email)}`;

            // トラッキング用パラメータ
            const trackParams = `sid=${sequence.id}&stepId=${nextStep.id}&sub=${subscriber.id}`;

            // リンクをクリックトラッキング経由に変換
            let trackedHtml = (nextStep.html_content || '').replace(
              /href="(https?:\/\/[^"]+)"/g,
              (_match: string, url: string) => {
                const trackUrl = `${siteUrl}/api/step-email-maker/track/click?${trackParams}&url=${encodeURIComponent(url)}`;
                return `href="${trackUrl}"`;
              }
            );

            // 開封トラッキングピクセルを追加
            const trackingPixel = `<img src="${siteUrl}/api/step-email-maker/track/open?${trackParams}" width="1" height="1" style="display:none;" alt="" />`;

            const htmlWithTracking = trackedHtml +
              trackingPixel +
              `<div style="text-align:center;margin-top:32px;padding:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;"><a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">配信停止はこちら</a></div>`;

            const emailPayload: { from: string; to: string[]; subject: string; html: string; text?: string } = {
              from: `${fromName} <${fromEmail}>`,
              to: [subscriber.email],
              subject: nextStep.subject,
              html: htmlWithTracking,
            };
            if (nextStep.text_content) {
              emailPayload.text = nextStep.text_content;
            }

            await resend.emails.send(emailPayload);
            totalSent++;

            // 6. 進捗更新
            const nextStepOrder = progress.current_step + 1;
            const isLastStep = !steps.find((s: any) => s.step_order === nextStepOrder);

            await supabase
              .from('step_email_progress')
              .update({
                current_step: nextStepOrder,
                last_sent_at: now.toISOString(),
                ...(isLastStep ? { status: 'completed', completed_at: now.toISOString() } : {}),
              })
              .eq('id', progress.id);

            // 7. 送信ログ記録（メルマガと共有の月間送信数）
            await supabase
              .from('newsletter_send_logs')
              .insert({
                user_id: sequence.user_id,
                campaign_id: null,
                sent_count: 1,
                sent_at: now.toISOString(),
              });
          } catch (err) {
            console.error(`[Step Email Cron] Error sending to ${progress.subscriber_id}:`, err);
            errors.push(`Subscriber ${progress.subscriber_id}: ${err}`);
          }
        }
      } catch (err) {
        console.error(`[Step Email Cron] Error processing sequence ${sequence.id}:`, err);
        errors.push(`Sequence ${sequence.id}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Step Email Cron] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
