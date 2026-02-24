import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkKdlLimits } from '@/lib/kdl-usage-check';
import {
  getProviderFromAdminSettings,
  generateWithFallback,
} from '@/lib/ai-provider';
import { getSubscriptionStatus } from '@/lib/subscription';
import { logAIUsage } from '@/lib/ai-usage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// LP構造データの型定義（PASONA フレームワーク対応）
interface BookLPData {
  hero: {
    catchcopy: string;
    subtitle: string;
    description: string;
  };
  pain_points: Array<{ title: string; description: string }>;
  author_profile: {
    name: string;
    credentials: string;
    story: string;
  };
  benefits: Array<{ title: string; description: string }>;
  key_takeaways: Array<{ number: number; title: string; description: string }>;
  target_readers: {
    heading: string;
    items: string[];
  };
  transformation: {
    before: string[];
    after: string[];
  };
  chapter_summaries: Array<{ chapter_title: string; summary: string }>;
  social_proof: Array<{ quote: string; reviewer_name: string; rating: number }>;
  bonus: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  closing_message: {
    title: string;
    message: string;
  };
  cta: {
    amazon_link: string;
    line_link: string;
    cta_text: string;
  };
}

// HTMLからテキストを抽出するヘルパー
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// モックLPデータ（デモ用）
function generateMockLPData(bookTitle: string, chapters: Array<{ title: string }>): BookLPData {
  return {
    hero: {
      catchcopy: `${bookTitle}で人生を変える一歩を踏み出そう`,
      subtitle: 'あなたの可能性を最大限に引き出す、実践的な一冊',
      description: 'この本を読めば、今まで見えなかった新しい世界が広がります。具体的なステップと実例で、あなたの夢を現実にする方法を徹底解説。',
    },
    pain_points: [
      { title: '何から始めればいいかわからない', description: '情報が多すぎて、最初の一歩が踏み出せない状態ではありませんか？この本が道しるべになります。' },
      { title: '時間がなくて学べない', description: '忙しい毎日の中でも、効率的に学べる方法をお伝えします。スキマ時間で実践可能です。' },
      { title: '続かない・挫折してしまう', description: 'モチベーション維持の仕組みと、小さな成功体験を積み重ねるメソッドを紹介しています。' },
    ],
    author_profile: {
      name: '著者名',
      credentials: '10年以上の実務経験を持つ専門家。多数の企業でコンサルティングを手がけてきた実績あり。',
      story: '私自身、かつては同じ悩みを抱えていました。何度も失敗を重ねる中で見つけた「本当に効果のある方法」を、この一冊に凝縮しました。',
    },
    benefits: [
      { title: '体系的な知識が身につく', description: '基礎から応用まで、段階的に理解を深められる構成です。' },
      { title: '即実践できるノウハウ', description: '読んだその日から使える具体的なテクニックを多数収録。' },
      { title: '成功事例から学べる', description: '実際の成功者の体験談とポイントを豊富に掲載。' },
      { title: '挫折しないロードマップ', description: 'ステップバイステップで進められるので、迷うことがありません。' },
      { title: '最新の情報を網羅', description: '最新のトレンドと手法を反映した、今すぐ使える情報です。' },
    ],
    key_takeaways: [
      { number: 1, title: '成功の3ステップ', description: '誰でも再現できるシンプルな3ステップで、確実に成果を出す方法を解説。' },
      { number: 2, title: '失敗しないための鉄則', description: '多くの人が陥りがちなミスとその回避法を具体例とともに紹介。' },
      { number: 3, title: '継続のための仕組み化', description: '意志力に頼らず、自然と続けられる仕組みの作り方を伝授。' },
    ],
    target_readers: {
      heading: 'この本はこんなあなたのための本です',
      items: [
        '何から始めればいいかわからず立ち止まっている方',
        '独学で挑戦したが思うような成果が出ていない方',
        '忙しい中でも効率的にスキルアップしたい方',
        '基礎からしっかり学び直したい方',
        '実践的なノウハウを求めている方',
      ],
    },
    transformation: {
      before: [
        '何から手をつけていいかわからない',
        '自己流で試してうまくいかない',
        '情報に振り回されて消耗している',
      ],
      after: [
        '明確なロードマップに沿って迷わず進める',
        '体系的な知識で確実に成果が出せる',
        '本当に必要な情報だけに集中できる',
      ],
    },
    chapter_summaries: chapters.slice(0, 8).map((ch) => ({
      chapter_title: ch.title,
      summary: `${ch.title}について、基本的な考え方から実践的な手法まで詳しく解説しています。`,
    })),
    social_proof: [
      { quote: '具体的な手順が書かれていて、読んだ翌日から実践できました。今までの悩みが嘘のように解消しました。', reviewer_name: 'T.K.さん（30代・会社員）', rating: 5 },
      { quote: '同じテーマの本を何冊も読みましたが、この本が一番わかりやすく実践的です。', reviewer_name: 'M.S.さん（40代・フリーランス）', rating: 5 },
      { quote: '著者の経験に基づいた内容なので説得力があります。何度も読み返しています。', reviewer_name: 'Y.A.さん（20代・学生）', rating: 4 },
    ],
    bonus: [
      { title: '実践チェックリスト', description: '本書の内容をすぐに行動に移せる、ステップバイステップのチェックリスト。' },
      { title: '重要ポイントまとめシート', description: '各章のエッセンスを1枚にまとめた、振り返り用のシート。' },
    ],
    faq: [
      { question: '初心者でも理解できますか？', answer: 'はい、専門用語には丁寧な解説を添えており、初めての方でも安心して読み進められます。' },
      { question: 'すぐに成果が出ますか？', answer: '個人差はありますが、本書のステップに沿って実践すれば、早い方で数週間で変化を実感いただけます。' },
      { question: '他の本との違いは何ですか？', answer: '机上の空論ではなく、実際の経験に基づいた実践的な内容に特化しています。すぐに行動に移せる点が最大の特徴です。' },
    ],
    closing_message: {
      title: '最後に、あなたへのメッセージ',
      message: 'この本を手に取ってくださったあなたは、すでに変わり始めています。あとは一歩踏み出すだけ。本書があなたの人生をより豊かにする一助となれば、著者としてこれほど嬉しいことはありません。',
    },
    cta: {
      amazon_link: '',
      line_link: '',
      cta_text: '今すぐ読み始める',
    },
  };
}

const SYSTEM_PROMPT = `あなたは書籍販売に特化した一流のマーケティングコピーライターです。
PASONAフレームワーク（Problem→Affinity→Solution→Offer→Narrowing→Action）を用いて、
書籍の購買意欲を最大限に高める高コンバージョンLPをJSON形式で生成してください。

＃ PASONAフレームワークに基づくセクション設計：

【P - Problem（問題提起）】
1. hero.catchcopy: 20〜50文字。読者の理想の未来を描く感情的なキャッチコピー。「〜できる」「〜が変わる」等の変化を示唆
2. hero.subtitle: catchcopyを補足する1文。書籍の核心的価値を端的に伝える
3. hero.description: 2〜3文。書籍が解決する課題と、読後の変化を凝縮した紹介文
4. pain_points: 3〜5個。読者が「まさに自分のことだ」と感じる悩み。titleは「〜していませんか？」形式で自己認識を促す。descriptionで深く共感を示す

【A - Affinity（親近感・著者の信頼性）】
5. author_profile.name: 著者名（書籍内容から推測。不明なら「著者」）
6. author_profile.credentials: 1〜2文で専門性・実績を示す肩書き・経歴
7. author_profile.story: 2〜3文。著者がかつて読者と同じ悩みを持っていたことを示す共感ストーリー

【S - Solution（解決策）】
8. benefits: 5個。この書籍を読むことで得られる具体的な成果・変化。「〜できるようになる」等、読者視点で
9. key_takeaways: 3〜5個。numberは連番。書籍の核心的インサイト。titleはキャッチーに、descriptionで具体的に

【O - Offer（提供内容）】
10. chapter_summaries: 各章の要約。chapter_titleは章タイトル、summaryは読者が得られる価値を1〜2文で
11. bonus: 2〜3個。読者への特典（チェックリスト、ワークシート、まとめ資料等）。titleとdescriptionで魅力を伝える

【N - Narrowing（絞り込み）】
12. target_readers.heading: 「この本はこんなあなたのための本です」等の見出し
13. target_readers.items: 5〜7個の文字列配列。「〜な方」形式で具体的なターゲット像
14. transformation.before: 3〜5個。読む前の読者の状態（ネガティブ）
15. transformation.after: 3〜5個。beforeと対応する読後の変化（ポジティブ）。同じ順番で対比が明確になるように

【A - Action（行動喚起）】
16. social_proof: 3個。想定読者レビュー。quoteはリアルな感想文、reviewer_nameは「イニシャル＋属性」形式、ratingは4か5
17. faq: 3〜5個。購入をためらう読者の疑問に対し、不安を解消する回答
18. closing_message.title: 著者からの温かい締めくくりの見出し
19. closing_message.message: 2〜3文。読者の背中を押す著者メッセージ
20. cta.cta_text: 10〜20文字の行動を促すボタンテキスト

＃ 出力形式（JSON）：
{
  "hero": { "catchcopy": "...", "subtitle": "...", "description": "..." },
  "pain_points": [{ "title": "...", "description": "..." }],
  "author_profile": { "name": "...", "credentials": "...", "story": "..." },
  "benefits": [{ "title": "...", "description": "..." }],
  "key_takeaways": [{ "number": 1, "title": "...", "description": "..." }],
  "target_readers": { "heading": "...", "items": ["...", "..."] },
  "transformation": { "before": ["...", "..."], "after": ["...", "..."] },
  "chapter_summaries": [{ "chapter_title": "...", "summary": "..." }],
  "social_proof": [{ "quote": "...", "reviewer_name": "...", "rating": 5 }],
  "bonus": [{ "title": "...", "description": "..." }],
  "faq": [{ "question": "...", "answer": "..." }],
  "closing_message": { "title": "...", "message": "..." },
  "cta": { "cta_text": "..." }
}

＃ 注意事項：
- 日本語で出力すること
- 読者の感情に寄り添い、具体的なベネフィットを示すこと
- 誇大表現は避け、信頼感のあるトーンで書くこと
- 書籍の実際の内容に基づいたコピーを生成すること（内容と乖離しないこと）
- 必ず有効なJSON形式のみを出力すること（前後にテキストを含めないこと）`;

export async function POST(request: Request) {
  try {
    const { book_id, amazon_link, line_link } = await request.json();

    if (!book_id) {
      return NextResponse.json({ error: 'book_idを指定してください' }, { status: 400 });
    }

    // デモモード判定
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    const isDemo = book_id.startsWith('demo-book-') || !supabaseUrl || !supabaseServiceKey;

    // 制限チェック
    let userId = '';
    if (!isDemo && !useMockData && supabaseUrl && supabaseServiceKey) {
      const supabaseForCheck = createClient(supabaseUrl, supabaseServiceKey);
      const { data: bookOwner } = await supabaseForCheck
        .from('kdl_books')
        .select('user_id')
        .eq('id', book_id)
        .single();

      if (bookOwner?.user_id) {
        userId = bookOwner.user_id;
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
    }

    if (isDemo || useMockData) {
      const mockData = generateMockLPData('サンプル書籍タイトル', [
        { title: '第1章 基礎を学ぶ' },
        { title: '第2章 実践テクニック' },
        { title: '第3章 応用と発展' },
      ]);
      return NextResponse.json({ lpData: mockData, isDemo: true });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. 書籍情報を取得
    const { data: bookData, error: bookError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle, target_info, user_id')
      .eq('id', book_id)
      .single();

    if (bookError || !bookData) {
      return NextResponse.json({ error: '本が見つかりません' }, { status: 404 });
    }

    // 2. 章を取得
    const { data: chaptersData } = await supabase
      .from('kdl_chapters')
      .select('id, title, summary, order_index')
      .eq('book_id', book_id)
      .order('order_index', { ascending: true });

    // 3. 節の内容を取得（サンプル抽出）
    const chapterIds = chaptersData?.map(ch => ch.id) || [];
    let sampleContent = '';

    if (chapterIds.length > 0) {
      const { data: sectionsData } = await supabase
        .from('kdl_sections')
        .select('chapter_id, title, content, order_index')
        .in('chapter_id', chapterIds)
        .order('order_index', { ascending: true });

      if (sectionsData && sectionsData.length > 0) {
        // 重要セクション優先
        const importantKeywords = ['はじめに', 'おわりに', 'まえがき', 'あとがき', '序章', '終章'];
        const importantSections = sectionsData.filter(sec =>
          importantKeywords.some(keyword =>
            sec.title?.includes(keyword) ||
            chaptersData?.find(ch => ch.id === sec.chapter_id)?.title?.includes(keyword)
          )
        );

        const importantContents = importantSections
          .filter(sec => sec.content && sec.content.trim())
          .map(sec => stripHtml(sec.content))
          .join('\n\n');

        if (importantContents.length < 500) {
          const otherContents = sectionsData
            .filter(sec => sec.content && sec.content.trim() && !importantSections.includes(sec))
            .slice(0, 5)
            .map(sec => stripHtml(sec.content))
            .join('\n\n');
          sampleContent = importantContents + '\n\n' + otherContents;
        } else {
          sampleContent = importantContents;
        }
        sampleContent = truncateText(sampleContent, 8000);
      }
    }

    // 4. 目次テキスト
    const tocText = chaptersData
      ?.map(ch => `${ch.title}${ch.summary ? ` - ${ch.summary}` : ''}`)
      .join('\n') || '';

    // 5. ターゲット情報
    const targetInfo = bookData.target_info as any;
    let targetText = '';
    if (targetInfo) {
      targetText = `\nターゲット読者: ${targetInfo.profile || '不明'}
メリット: ${targetInfo.merits?.join('、') || ''}
ベネフィット: ${targetInfo.benefits?.join('、') || ''}
USP: ${targetInfo.usp || ''}`;
    }

    // 6. ユーザーメッセージ
    const userPrompt = `以下の書籍のプロモーション用LPコンテンツを生成してください。

【タイトル】
${bookData.title}
${bookData.subtitle ? `【サブタイトル】\n${bookData.subtitle}` : ''}

【目次】
${tocText}
${targetText ? `\n【ターゲット情報】${targetText}` : ''}
${sampleContent ? `\n【本文抜粋】\n${sampleContent}` : ''}`;

    // 7. AIで生成
    const subscriptionStatus = await getSubscriptionStatus(bookData.user_id);
    const planTier = subscriptionStatus?.planTier || 'none';

    const { provider, model, backupModel, backupProvider } =
      await getProviderFromAdminSettings('kdl', planTier, 'lp_generation');

    const aiResponse = await generateWithFallback(
      provider,
      backupProvider,
      {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 6000,
        responseFormat: 'json',
      },
      { service: 'kdl', phase: 'lp_generation', model, backupModel }
    );

    const content = aiResponse.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    // JSONパース（AIの応答にはコードブロックや前後のテキストが含まれる場合がある）
    let lpData: BookLPData;
    try {
      let cleanContent = content.trim();
      // ```json ... ``` のラッパーを除去
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/i, '');
      cleanContent = cleanContent.replace(/\n?```\s*$/i, '');
      // 前後の非JSONテキストを除去（最初の { から最後の } まで抽出）
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanContent = cleanContent.slice(firstBrace, lastBrace + 1);
      }
      lpData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error. Raw content:', content.slice(0, 500));
      throw new Error('AIの応答をJSONとしてパースできませんでした');
    }

    // CTAにユーザー指定のリンクを追加
    if (!lpData.cta) lpData.cta = { amazon_link: '', line_link: '', cta_text: '今すぐ読む' };
    if (amazon_link) lpData.cta.amazon_link = amazon_link;
    if (line_link) lpData.cta.line_link = line_link;

    // 8. DBに保存（UPSERT）
    const { error: upsertError } = await supabase
      .from('kdl_book_lps')
      .upsert(
        {
          book_id,
          user_id: bookData.user_id,
          hero: lpData.hero,
          pain_points: lpData.pain_points,
          author_profile: lpData.author_profile || {},
          benefits: lpData.benefits,
          key_takeaways: lpData.key_takeaways || [],
          target_readers: lpData.target_readers || {},
          transformation: lpData.transformation || {},
          chapter_summaries: lpData.chapter_summaries,
          social_proof: lpData.social_proof || [],
          bonus: lpData.bonus || [],
          faq: lpData.faq,
          closing_message: lpData.closing_message || {},
          cta: lpData.cta,
          ai_model_used: model,
          status: 'draft',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'book_id' }
      );

    if (upsertError) {
      console.warn('LP保存に失敗:', upsertError.message);
    }

    // 9. 使用量ログ
    logAIUsage({
      userId: bookData.user_id,
      actionType: 'generate_book_lp',
      service: 'kdl',
      modelUsed: aiResponse.model || model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
      metadata: { book_id, book_title: bookData.title },
    }).catch(console.error);

    return NextResponse.json({ lpData, model: aiResponse.model || model });
  } catch (error: any) {
    console.error('Generate book LP error:', error);
    return NextResponse.json(
      { error: 'LP生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

// GET: 保存済みLPデータ取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const book_id = searchParams.get('book_id');

    if (!book_id) {
      return NextResponse.json({ error: 'book_idを指定してください' }, { status: 400 });
    }

    if (book_id.startsWith('demo-book-') || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'LPはまだ生成されていません', notGenerated: true }, { status: 404 });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { data, error } = await supabase
      .from('kdl_book_lps')
      .select('*')
      .eq('book_id', book_id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'LPはまだ生成されていません', notGenerated: true }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get book LP error:', error);
    return NextResponse.json(
      { error: 'LP情報の取得に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

// PUT: LP公開/非公開切替＆フィールド編集
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { book_id, ...fields } = body;

    if (!book_id) {
      return NextResponse.json({ error: 'book_idを指定してください' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allowedFields = [
      'status', 'hero', 'pain_points', 'author_profile', 'benefits',
      'key_takeaways', 'target_readers', 'transformation', 'chapter_summaries',
      'social_proof', 'bonus', 'faq', 'closing_message', 'cta',
      'theme_color', 'section_visibility', 'cover_image_url',
    ];

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates[key] = fields[key];
      }
    }
    if (fields.status === 'published') {
      updates.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('kdl_book_lps')
      .update(updates)
      .eq('book_id', book_id);

    if (error) {
      throw new Error('LP更新に失敗しました: ' + error.message);
    }

    return NextResponse.json({ success: true, message: 'LPを更新しました' });
  } catch (error: any) {
    console.error('Update book LP error:', error);
    return NextResponse.json(
      { error: 'LP更新に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
