import { NextRequest, NextResponse } from 'next/server';

// 共有API /api/user-contents を内部呼び出しし、ファネル用のキー名に変換する
// ファネルは profile_lp / business_lp / order_form / sns_post 等のキー名を使用
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // 共有APIを内部呼び出し
  const baseUrl = req.nextUrl.origin;
  const res = await fetch(`${baseUrl}/api/user-contents?userId=${userId}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch contents' }, { status: 500 });
  }

  const data = await res.json();
  const contents: Record<string, any> = data.contents || {};

  // 共有APIのキー名 → ファネル用キー名に変換
  const keyMapping: Record<string, string> = {
    'profile': 'profile_lp',
    'business': 'business_lp',
    'order-form': 'order_form',
    'sns-post': 'sns_post',
  };

  const funnelContents: Record<string, any> = {};
  for (const [key, items] of Object.entries(contents)) {
    const funnelKey = keyMapping[key] || key;
    funnelContents[funnelKey] = items;
  }

  return NextResponse.json({ contents: funnelContents });
}
