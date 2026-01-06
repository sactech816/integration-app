import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // 独自ドメイン設定済なら変更
      to: 'YOUR_EMAIL@gmail.com', // ★ご自身のメールアドレスへ
      subject: `【お問い合わせ】${subject} (${name}様)`,
      html: `
        <p>ウェブサイトからのお問い合わせがありました。</p>
        <hr />
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メール:</strong> ${email}</p>
        <p><strong>件名:</strong> ${subject}</p>
        <p><strong>内容:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '送信失敗' }, { status: 500 });
  }
}