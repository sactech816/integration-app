import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // フロントエンドから送られてくるデータを受け取る
    const { email, diagnosisType, score } = await request.json();

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // 本番運用時はここで設定した独自ドメインに変更します
      to: 'YOUR_EMAIL@gmail.com', // ★テスト中は「ご自身のメールアドレス」のみ受信可能です
      subject: '【診断結果】あなたの診断結果が届きました',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>診断完了のお知らせ</h1>
          <p>ご利用ありがとうございます。あなたの診断結果をお送りします。</p>
          <hr />
          <h2>結果: ${diagnosisType} タイプ</h2>
          <p><strong>スコア:</strong> ${score} 点</p>
          <p>この結果を活かして、次のステップへ進みましょう！</p>
          <hr />
          <p style="font-size: 12px; color: #888;">※このメールは自動送信されています。</p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 });
  }
}