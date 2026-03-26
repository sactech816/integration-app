import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { SurveyQuestion } from '@/lib/types';
import { escapeHtml, isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

// 送信元メールアドレス（Resendで認証済みのドメインを使用）
const FROM_EMAIL = 'Makers Support <support@makers.tokyo>';
// const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// サーバーサイドSupabaseクライアント
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    // レート制限（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const {
      survey_id,
      survey_title,
      creator_email,
      creator_name,
      respondent_name,
      respondent_email,
      answers,
      questions,
    } = await request.json();

    // 作成者メールのバリデーション
    if (!creator_email || !isValidEmail(creator_email)) {
      return NextResponse.json(
        { error: '作成者のメールアドレスが必要です' },
        { status: 400 }
      );
    }

    // DBからアンケート設定を取得（クライアント改ざん防止）
    const supabase = getSupabase();
    let nameMode: 'required' | 'optional' | 'hidden' = 'required';
    let emailMode: 'required' | 'optional' | 'hidden' = 'required';

    if (supabase && survey_id) {
      const { data: surveyData } = await supabase
        .from('surveys')
        .select('settings')
        .eq('id', survey_id)
        .single();

      if (surveyData?.settings) {
        nameMode = surveyData.settings.respondentNameMode || 'required';
        emailMode = surveyData.settings.respondentEmailMode || 'required';
      }
    }

    // 回答者メールのバリデーション（設定に応じて）
    const hasRespondentEmail = respondent_email && respondent_email.trim();
    if (emailMode === 'required' && (!hasRespondentEmail || !isValidEmail(respondent_email))) {
      return NextResponse.json(
        { error: '回答者のメールアドレスが必要です' },
        { status: 400 }
      );
    }
    // optional でメールが入力されている場合、形式チェック
    if (emailMode === 'optional' && hasRespondentEmail && !isValidEmail(respondent_email)) {
      return NextResponse.json(
        { error: 'メールアドレスの形式が正しくありません' },
        { status: 400 }
      );
    }

    // 回答者名のバリデーション
    const hasRespondentName = respondent_name && respondent_name.trim();
    if (nameMode === 'required' && !hasRespondentName) {
      return NextResponse.json(
        { error: '回答者のお名前が必要です' },
        { status: 400 }
      );
    }

    // 回答をDBに保存（投票機能用）
    if (supabase && survey_id) {
      try {
        await supabase.from('survey_responses').insert({
          survey_id: survey_id,
          answers: answers,
          respondent_email: hasRespondentEmail ? respondent_email : null,
          respondent_name: hasRespondentName ? respondent_name : null,
        });
      } catch (dbError) {
        console.error('回答保存エラー:', dbError);
        // DBエラーでもメール送信は続行
      }
    }

    // サニタイズ
    const safeSurveyTitle = escapeHtml(survey_title);
    const displayName = hasRespondentName ? escapeHtml(respondent_name) : '匿名';
    const displayEmail = hasRespondentEmail ? escapeHtml(respondent_email) : '未入力';
    const safeCreatorName = escapeHtml(creator_name);

    // 回答を見やすくフォーマット（内部でエスケープ済み）
    const formattedAnswers = formatAnswersForEmail(questions, answers);

    // 【1通目】作成者（管理者）への通知メール
    const respondentInfoHtml = [
      nameMode !== 'hidden' ? `<p style="margin: 0;"><strong>回答者:</strong> ${displayName} 様</p>` : '',
      emailMode !== 'hidden' ? `<p style="margin: 5px 0 0 0;"><strong>メール:</strong> ${displayEmail}</p>` : '',
    ].filter(Boolean).join('\n');

    await resend.emails.send({
      from: FROM_EMAIL,
      to: creator_email,
      subject: `【アンケート回答】${survey_title} - ${hasRespondentName ? respondent_name : '匿名'}様より`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .answer-block { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0d9488; }
            .question { font-weight: bold; color: #0d9488; margin-bottom: 8px; }
            .answer { color: #1f2937; font-size: 16px; }
            .respondent-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📋 アンケート回答通知</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${safeSurveyTitle}</p>
            </div>
            <div class="content">
              ${respondentInfoHtml ? `<div class="respondent-info">${respondentInfoHtml}</div>` : ''}

              <h2 style="color: #1f2937; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">回答内容</h2>

              ${formattedAnswers}

              <div class="footer">
                <p>このメールはアンケートシステムから自動送信されています。</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // 【2通目】回答者への確認メール（メールアドレスがある場合のみ）
    if (hasRespondentEmail && isValidEmail(respondent_email)) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: respondent_email,
        subject: `【回答完了】${survey_title} へのご回答ありがとうございます`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .thank-you { font-size: 18px; text-align: center; margin-bottom: 30px; }
              .answer-block { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #0d9488; }
              .question { font-weight: bold; color: #0d9488; margin-bottom: 5px; font-size: 14px; }
              .answer { color: #1f2937; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">✅ 回答完了</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">${safeSurveyTitle}</p>
              </div>
              <div class="content">
                <div class="thank-you">
                  <p><strong>${displayName}</strong> 様</p>
                  <p>アンケートへのご回答ありがとうございました。<br>以下の内容で受け付けました。</p>
                </div>

                <h3 style="color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">ご回答内容</h3>

                ${formattedAnswers}

                <div class="footer">
                  <p>このメールは自動送信されています。</p>
                  ${creator_name ? `<p>お問い合わせ: ${safeCreatorName}</p>` : ''}
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Survey email error:', error);
    return NextResponse.json(
      { error: 'メール送信に失敗しました' },
      { status: 500 }
    );
  }
}

// 回答をHTML形式にフォーマット
function formatAnswersForEmail(
  questions: SurveyQuestion[],
  answers: Record<string, string | number | string[]>
): string {
  return questions
    .map((q, index) => {
      const answer = answers[q.id];
      let displayAnswer: string;

      if (answer === undefined || answer === null || answer === '') {
        displayAnswer = '(未回答)';
      } else if (Array.isArray(answer)) {
        // 複数選択の場合
        displayAnswer = answer.length > 0
          ? answer.map(a => escapeHtml(a)).join('、')
          : '(未回答)';
      } else if (q.type === 'rating' && typeof answer === 'number') {
        // 評価式の場合は星で表示
        const maxRating = q.maxRating || 5;
        displayAnswer = `${'★'.repeat(answer)}${'☆'.repeat(maxRating - answer)} (${answer}/${maxRating})`;
      } else {
        displayAnswer = escapeHtml(String(answer));
      }

      return `
        <div class="answer-block">
          <div class="question">Q${index + 1}. ${escapeHtml(q.text)}</div>
          <div class="answer">${displayAnswer}</div>
        </div>
      `;
    })
    .join('');
}
