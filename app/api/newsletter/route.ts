import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const audienceId = process.env.RESEND_AUDIENCE_ID;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!audienceId) {
      return NextResponse.json({ error: 'Audience ID未設定' }, { status: 500 });
    }

    // Resendの連絡先リスト(Contacts)に追加する処理
    const data = await resend.contacts.create({
      email: email,
      audienceId: audienceId,
      unsubscribed: false, // 最初は購読状態で登録
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
  }
}