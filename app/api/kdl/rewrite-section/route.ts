import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getProviderFromAdminSettings,
  generateWithFallback,
} from '@/lib/ai-provider';
import { getSubscriptionStatus } from '@/lib/subscription';
import { logAIUsage } from '@/lib/ai-usage';
import { checkKdlLimits } from '@/lib/kdl-usage-check';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 文体スタイル定義（rewrite-text/route.ts と同一）
type WritingStyleId = 'descriptive' | 'narrative' | 'dialogue' | 'qa' | 'workbook';

const STYLE_PROMPTS: Record<WritingStyleId, string> = {
  descriptive: `
＃リライトスタイル：説明文（PREP法）
- PREP法（結論→理由→具体例→まとめ）を基本骨格とする
- 論理的で分かりやすい説明を心がける
- 読者の疑問を想定し、自然に回答を組み込む`,

  narrative: `
＃リライトスタイル：物語形式
- ストーリーテリングで読者を引き込む
- 体験を軸に展開する
- 感情に訴える描写を交える`,

  dialogue: `
＃リライトスタイル：対話形式
- 2人の登場人物の会話で内容を表現する
- 先生と生徒などの設定を使う
- 会話は「」で囲み、地の文で状況説明を加える`,

  qa: `
＃リライトスタイル：Q&A形式
- Q:（質問）とA:（回答）の形式で記述する
- 読者がよく抱く質問を想定して構成する
- 回答は具体的で実用的な内容にする`,

  workbook: `
＃リライトスタイル：ワークブック形式
- 【解説】パートと【ワーク】パートを含める
- 読者が実際に手を動かせる内容にする
- チェックリストや問いかけを含める`,
};

const SYSTEM_PROMPT = `あなたは優秀な文章リライターです。
与えられた本の一節（セクション）を、指定されたスタイルで書き換えてください。

＃ルール：
- 元のテキストの意味・内容は維持してください
- 指定されたスタイルに合わせて表現方法を変えてください
- 出力はHTMLタグ（<p>、<h3>、<ul>、<li>、<strong>など）を使って構造化してください
- 文字数は元のテキストと同程度か、やや増える程度にしてください
- 本全体の文脈（タイトル、章の位置づけ）を考慮してください
- ※重要：\`\`\`html のようなコードブロック記法は絶対に使用しないでください`;

// AIレスポンスからコードブロック記法を除去する
function cleanAIResponse(content: string): string {
  let cleaned = content;
  cleaned = cleaned.replace(/^```(?:html)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    const {
      book_id,
      section_id,
      original_content,
      target_style,
      chapter_title,
      section_title,
      book_title,
    } = await request.json();

    if (!section_id || !original_content || !target_style) {
      return NextResponse.json(
        { error: 'section_id, original_content, target_style は必須です' },
        { status: 400 }
      );
    }

    if (!STYLE_PROMPTS[target_style as WritingStyleId]) {
      return NextResponse.json({ error: '無効な文体スタイルです' }, { status: 400 });
    }

    // デモモード
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    const isDemo = (book_id && book_id.startsWith('demo-book-')) || !supabaseUrl || !supabaseServiceKey;

    if (isDemo || useMockData) {
      return NextResponse.json({
        content: `<p>（${target_style}形式にリライト済み）</p>${original_content}`,
        model: 'mock',
      });
    }

    // ユーザー認証
    const cookieStore = await cookies();
    const authClient = createServerClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 使用量チェック
    const limits = await checkKdlLimits(user.id);
    if (!limits.writingAi.canUse) {
      return NextResponse.json(
        {
          error: limits.writingAi.message,
          code: 'WRITING_AI_LIMIT_EXCEEDED',
          used: limits.writingAi.used,
          limit: limits.writingAi.limit,
        },
        { status: 429 }
      );
    }

    // AIプロバイダー取得
    const subscriptionStatus = await getSubscriptionStatus(user.id);
    const planTier = subscriptionStatus?.planTier || 'none';

    const { provider, model, backupModel, backupProvider } =
      await getProviderFromAdminSettings('kdl', planTier, 'rewrite_bulk');

    // プロンプト構築
    const stylePrompt = STYLE_PROMPTS[target_style as WritingStyleId];
    const userMessage = `以下のセクションを指定されたスタイルにリライトしてください。

【書籍タイトル】${book_title || ''}
【章タイトル】${chapter_title || ''}
【節タイトル】${section_title || ''}

${stylePrompt}

【リライト対象テキスト】
${original_content}`;

    const aiResponse = await generateWithFallback(
      provider,
      backupProvider,
      {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
        maxTokens: 4000,
      },
      { service: 'kdl', phase: 'rewrite_bulk', model, backupModel }
    );

    const rewrittenContent = cleanAIResponse(aiResponse.content || '');

    if (!rewrittenContent) {
      throw new Error('AIからの応答が空です');
    }

    // セクション更新
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { error: updateError } = await supabase
      .from('kdl_sections')
      .update({ content: rewrittenContent })
      .eq('id', section_id);

    if (updateError) {
      console.warn('Section update failed:', updateError.message);
    }

    // 使用量ログ
    logAIUsage({
      userId: user.id,
      actionType: 'rewrite_bulk_section',
      service: 'kdl',
      modelUsed: aiResponse.model || model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
      metadata: { book_id, section_id, target_style },
    }).catch(console.error);

    return NextResponse.json({
      content: rewrittenContent,
      model: aiResponse.model || model,
    });
  } catch (error: any) {
    console.error('Rewrite section error:', error);
    return NextResponse.json(
      { error: 'セクションのリライトに失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
