import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { thumbnailUrl } = await request.json();

    if (!thumbnailUrl || typeof thumbnailUrl !== 'string') {
      return NextResponse.json(
        { error: 'サムネイルURLが指定されていません' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI APIが設定されていません' },
        { status: 500 }
      );
    }

    // サムネイル画像をfetch → base64変換
    const imageResponse = await fetch(thumbnailUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'サムネイル画像の取得に失敗しました' },
        { status: 400 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const mediaType = contentType.startsWith('image/')
      ? contentType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      : 'image/jpeg';

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'このYouTubeサムネイル画像に表示されているテキスト（文字）をすべて抽出してください。テキストのみを箇条書きで出力してください。文字が見つからない場合は「テキストなし」と返してください。',
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    const extractedText = textContent ? textContent.text : 'テキストを抽出できませんでした';

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('Thumbnail OCR error:', error);
    return NextResponse.json(
      { error: 'サムネ文字解析に失敗しました' },
      { status: 500 }
    );
  }
}
