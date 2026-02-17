import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getProviderFromAdminSettings,
  generateWithFallback,
} from '@/lib/ai-provider';
import { getSubscriptionStatus } from '@/lib/subscription';
import { logAIUsage } from '@/lib/ai-usage';
import { checkKdlLimits } from '@/lib/kdl-usage-check';

// 分析結果の型
interface AnalyzedStructure {
  suggested_title: string;
  suggested_subtitle: string;
  chapters: Array<{
    title: string;
    summary: string;
    sections: Array<{
      title: string;
      content: string; // HTML構造化されたコンテンツ
    }>;
  }>;
}

const SYSTEM_PROMPT = `あなたは書籍の構造分析の専門家です。
与えられた原稿テキストを分析し、適切な章・節の構造をJSON形式で提案してください。

＃分析のポイント：
1. テキスト内の見出し、空行、テーマの変化を手がかりに章の境界を特定
2. 各章内でサブトピックを見つけて節に分割
3. 適切な章タイトル、節タイトルを付与
4. 各節には元テキストの該当部分をHTMLタグで構造化して含める
5. 章は3〜10章程度、各章に2〜5節を目安に分割

＃HTMLタグのルール：
- <p>で段落を囲む
- <h3>で小見出しを付ける（節内で必要な場合）
- <ul><li>でリストを表現
- <strong>で強調
- \`\`\`htmlのようなコードブロック記法は使用しない

＃出力形式（JSON）：
{
  "suggested_title": "分析から推測される書籍タイトル",
  "suggested_subtitle": "サブタイトルの提案",
  "chapters": [
    {
      "title": "章タイトル",
      "summary": "この章の要約（1〜2文）",
      "sections": [
        {
          "title": "節タイトル",
          "content": "<p>元テキストをHTMLに変換した内容</p>"
        }
      ]
    }
  ]
}

＃注意事項：
- 必ず有効なJSON形式で出力
- 元テキストの内容を省略せず、すべてをいずれかの節に含める
- 日本語で出力`;

// テキストを制限文字数に切り詰める
function truncateForAnalysis(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n... (以下省略)';
}

export async function POST(request: Request) {
  try {
    const { text, title } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'テキストが空です' }, { status: 400 });
    }

    // デモモード
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let userId = '';

    if (supabaseUrl && supabaseAnonKey && !useMockData) {
      const cookieStore = await cookies();
      const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: { getAll() { return cookieStore.getAll(); } },
      });
      const { data: { user } } = await authClient.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
      }
      userId = user.id;

      // 使用量チェック
      const limits = await checkKdlLimits(userId);
      if (!limits.outlineAi.canUse) {
        return NextResponse.json(
          {
            error: limits.outlineAi.message,
            code: 'OUTLINE_AI_LIMIT_EXCEEDED',
            used: limits.outlineAi.used,
            limit: limits.outlineAi.limit,
          },
          { status: 429 }
        );
      }
    }

    if (useMockData) {
      // モックデータ
      const paragraphs = text.split(/\n\n+/).filter((p: string) => p.trim().length > 0);
      const chapterSize = Math.max(3, Math.ceil(paragraphs.length / 3));
      const mockStructure: AnalyzedStructure = {
        suggested_title: title || '取り込み書籍',
        suggested_subtitle: '原稿から自動構造化',
        chapters: [],
      };

      for (let i = 0; i < 3; i++) {
        const chapterParagraphs = paragraphs.slice(i * chapterSize, (i + 1) * chapterSize);
        if (chapterParagraphs.length === 0) break;
        mockStructure.chapters.push({
          title: `第${i + 1}章`,
          summary: `章${i + 1}の内容です。`,
          sections: chapterParagraphs.map((p: string, j: number) => ({
            title: `セクション${j + 1}`,
            content: `<p>${p.replace(/\n/g, '</p><p>')}</p>`,
          })),
        });
      }

      return NextResponse.json({ structure: mockStructure, isDemo: true });
    }

    // AIプロバイダー取得
    const subscriptionStatus = userId ? await getSubscriptionStatus(userId) : null;
    const planTier = subscriptionStatus?.planTier || 'none';

    const { provider, model, backupModel, backupProvider } =
      await getProviderFromAdminSettings('kdl', planTier, 'import_analysis');

    // テキストを制限（Geminiは1Mコンテキストがあるが、コスト考慮で制限）
    const truncatedText = truncateForAnalysis(text, 50000);

    const userMessage = `以下の原稿テキストの構造を分析して、章・節に分割してください。
${title ? `\n【ユーザーが指定したタイトル】${title}\n` : ''}
【原稿テキスト】
${truncatedText}`;

    const aiResponse = await generateWithFallback(
      provider,
      backupProvider,
      {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        maxTokens: 8000,
        responseFormat: 'json',
      },
      { service: 'kdl', phase: 'import_analysis', model, backupModel }
    );

    const content = aiResponse.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    // JSONパース
    let structure: AnalyzedStructure;
    try {
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/i, '');
      cleanContent = cleanContent.replace(/\n?```\s*$/i, '');
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanContent = cleanContent.slice(firstBrace, lastBrace + 1);
      }
      structure = JSON.parse(cleanContent);
    } catch {
      console.error('JSON parse error. Raw content:', content.slice(0, 500));
      throw new Error('AIの応答をJSONとしてパースできませんでした');
    }

    // バリデーション
    if (!structure.chapters || !Array.isArray(structure.chapters) || structure.chapters.length === 0) {
      throw new Error('章の構造が生成されませんでした');
    }

    // 使用量ログ
    if (userId) {
      logAIUsage({
        userId,
        actionType: 'import_analyze_structure',
        service: 'kdl',
        modelUsed: aiResponse.model || model,
        inputTokens: aiResponse.usage?.inputTokens,
        outputTokens: aiResponse.usage?.outputTokens,
        metadata: { title, textLength: text.length },
      }).catch(console.error);
    }

    return NextResponse.json({
      structure,
      model: aiResponse.model || model,
    });
  } catch (error: any) {
    console.error('Analyze structure error:', error);
    return NextResponse.json(
      { error: '構造分析に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
