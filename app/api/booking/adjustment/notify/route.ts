import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Supabaseクライアント
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) return null;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// 日時フォーマット
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export async function POST(request: Request) {
  try {
    const { responseId, type } = await request.json();

    if (!responseId) {
      return NextResponse.json({ error: 'responseId is required' }, { status: 400 });
    }

    // 環境変数チェック
    if (!process.env.RESEND_API_KEY) {
      console.error('[Booking Adjustment Notify] RESEND_API_KEY is not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.warn('[Booking Adjustment Notify] RESEND_FROM_EMAIL is not set, using default onboarding@resend.dev');
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 回答情報を取得
    const { data: response, error: responseError } = await supabase
      .from('schedule_adjustment_responses')
      .select(`
        *,
        menu:booking_menus(*)
      `)
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    const menu = response.menu;
    if (!menu || menu.type !== 'adjustment') {
      return NextResponse.json({ error: 'Invalid menu type' }, { status: 400 });
    }

    if (!response.participant_email) {
      // メールアドレスがない場合は送信しない
      return NextResponse.json({ success: true, message: 'No email address provided' });
    }

    // 出欠表データを取得
    const { data: slots } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('menu_id', menu.id)
      .order('start_time', { ascending: true });

    const { data: allResponses } = await supabase
      .from('schedule_adjustment_responses')
      .select('*')
      .eq('menu_id', menu.id)
      .order('created_at', { ascending: true });

    // 最も参加者が多い日程を判定
    let bestSlotId: string | undefined;
    if (slots && slots.length > 0 && allResponses) {
      const slotCounts = slots.map(slot => {
        let availableCount = 0;
        allResponses.forEach(r => {
          const status = r.responses[slot.id];
          if (status === 'yes' || status === 'maybe') {
            availableCount++;
          }
        });
        return { slotId: slot.id, count: availableCount };
      });

      const bestSlot = slotCounts.reduce((best, current) => 
        current.count > best.count ? current : best,
        slotCounts[0]
      );
      bestSlotId = bestSlot?.slotId;
    }

    // メール本文（HTML）を生成
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">日程調整結果のお知らせ</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">
            ${response.participant_name}様<br><br>
            以下の日程調整に出欠を登録いただき、ありがとうございます。<br>
            現在の出欠状況をお知らせします。
          </p>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">${menu.title}</h2>
            ${menu.description ? `<p style="color: #6b7280; margin: 10px 0;">${menu.description}</p>` : ''}
          </div>

          ${slots && slots.length > 0 ? `
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; overflow-x: auto;">
              <h3 style="color: #1f2937; font-size: 16px; margin-top: 0; margin-bottom: 15px;">出欠表</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb; background: #f9fafb;">
                    <th style="text-align: left; padding: 10px; font-weight: bold; color: #374151;">参加者</th>
                    ${slots.map(slot => `
                      <th style="text-align: center; padding: 10px; font-weight: bold; color: #374151; border-left: 1px solid #e5e7eb; ${
                        bestSlotId === slot.id ? 'background: #dcfce7;' : ''
                      }">
                        <div>${formatDate(slot.start_time)}</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                          ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}
                        </div>
                        ${bestSlotId === slot.id ? '<div style="color: #16a34a; font-weight: bold; margin-top: 4px;">★ 候補</div>' : ''}
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${allResponses ? allResponses.map((participant: any) => `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px; font-weight: 500; color: #1f2937;">
                        ${participant.participant_name}
                      </td>
                      ${slots.map(slot => {
                        const status = participant.responses[slot.id];
                        let icon = '-';
                        let color = '#9ca3af';
                        if (status === 'yes') { icon = '○'; color = '#16a34a'; }
                        else if (status === 'no') { icon = '×'; color = '#dc2626'; }
                        else if (status === 'maybe') { icon = '△'; color = '#ca8a04'; }
                        return `
                          <td style="text-align: center; padding: 10px; border-left: 1px solid #e5e7eb; color: ${color}; font-size: 18px; font-weight: bold;">
                            ${icon}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('') : ''}
                </tbody>
              </table>
            </div>
          ` : ''}

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            出欠状況を変更したい場合は、再度日程調整ページにアクセスしてください。<br>
            調整結果のURL: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${menu.id}" style="color: #6366f1;">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${menu.id}</a>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            このメールは日程調整システムから自動送信されています。
          </p>
        </div>
      </div>
    `;

    // メール送信
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: response.participant_email,
      subject: `【日程調整結果】${menu.title}`,
      html: emailHtml,
    });

    console.log('[Booking Adjustment Notify] Email sent successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Booking Adjustment Notify] Error:', error);
    
    // より詳細なエラー情報をログ出力
    if (error instanceof Error) {
      console.error('[Booking Adjustment Notify] Error message:', error.message);
      console.error('[Booking Adjustment Notify] Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Failed to send notification',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

