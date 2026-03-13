/**
 * コンシェルジュ AI自動生成API
 * POST /api/concierge/ai-generate
 *
 * ビジネス説明やURL内容からナレッジ・FAQ・挨拶文を自動生成
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';

const SYSTEM_PROMPT = `あなたはAIコンシェルジュの設定アシスタントです。
ユーザーが提供するビジネスの説明やWebサイトの内容をもとに、AIチャットコンシェルジュの設定内容を生成してください。

必ず以下のJSON形式で回答してください（他のテキストは含めないでください）:
{
  "name": "コンシェルジュの名前（例: サポートくん、〇〇アシスタント）",
  "greeting": "最初の挨拶メッセージ（100文字以内、フレンドリーで温かみのある文）",
  "personality": "性格や口調の設定（80文字以内）",
  "knowledge_text": "ナレッジ（事業情報、サービス内容、料金、営業時間など。箇条書きで整理。200-500文字）",
  "faq_items": [
    {"question": "よくある質問1", "answer": "回答1"},
    {"question": "よくある質問2", "answer": "回答2"},
    ...3-5件
  ]
}

注意事項:
- 日本語で生成すること
- ビジネスの内容を正確に反映すること
- FAQは訪問者が実際に聞きそうな質問を3-5件生成
- ナレッジは箇条書きで構造化すること
- greeting は「ですます調」で温かみのある挨拶にすること
- personality は「ですます調」「フレンドリー」など話し方の指定を含めること`;

/** URLからテキストコンテンツを抽出 */
async function extractTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja-JP,ja;q=0.9',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`URL取得エラー: ${res.status}`);

  const html = await res.text();

  // HTMLタグを除去してテキストのみ抽出
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 最大5000文字に制限
  if (text.length > 5000) {
    text = text.substring(0, 5000) + '...';
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { businessDescription, sourceUrl, generateType = 'full' } = body;

    if (!businessDescription && !sourceUrl) {
      return NextResponse.json(
        { error: 'ビジネスの説明またはURLを入力してください' },
        { status: 400 }
      );
    }

    // URL からテキスト抽出
    let urlContent = '';
    if (sourceUrl) {
      try {
        urlContent = await extractTextFromUrl(sourceUrl);
      } catch (err: any) {
        return NextResponse.json(
          { error: `URLの読み込みに失敗しました: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // プロンプト構築
    let userPrompt = '';
    if (businessDescription) {
      userPrompt += `【ビジネスの説明】\n${businessDescription}\n\n`;
    }
    if (urlContent) {
      userPrompt += `【Webサイトの内容】\n${urlContent}\n\n`;
    }

    if (generateType === 'faq') {
      userPrompt += '上記の情報をもとに、FAQのみを5件生成してください。JSON形式でfaq_items配列のみ返してください。';
    } else if (generateType === 'knowledge') {
      userPrompt += '上記の情報をもとに、ナレッジテキストのみを生成してください。JSON形式でknowledge_textのみ返してください。';
    } else {
      userPrompt += '上記の情報をもとに、コンシェルジュの設定を生成してください。';
    }

    // AI生成
    const ai = createAIProvider({ preferProvider: 'anthropic', model: 'claude-haiku-4-5-20251001' });
    const result = await ai.generate({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    // AI使用量ログ
    await logAIUsage({
      userId: user.id,
      actionType: 'concierge-ai-generate',
      service: 'concierge',
      modelUsed: 'claude-haiku-4-5-20251001',
      inputTokens: result.usage?.inputTokens || 0,
      outputTokens: result.usage?.outputTokens || 0,
    });

    // JSON パース
    let generated;
    try {
      generated = JSON.parse(result.content);
    } catch {
      // JSON部分を抽出して再試行
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
      }
    }

    return NextResponse.json(generated);
  } catch (err: any) {
    console.error('AI generate error:', err);
    return NextResponse.json(
      { error: err.message || '生成に失敗しました' },
      { status: 500 }
    );
  }
}
