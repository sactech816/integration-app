import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// 許可するパスのプレフィックス一覧
const ALLOWED_PREFIXES = ['/quiz/', '/profile/', '/business/', '/survey/', '/s/'];

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    // 許可されたパスプレフィックスかチェック
    const isAllowed = ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix));
    if (!isAllowed) {
      return NextResponse.json({ error: 'path not allowed' }, { status: 403 });
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  } catch {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
