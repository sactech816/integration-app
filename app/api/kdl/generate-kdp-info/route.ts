import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// レスポンスの型定義
interface KdpInfo {
  keywords: string[];
  description: string;
  categories: string[];
  catch_copy: string;
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

// テキストを指定文字数で切り詰める
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export async function POST(request: Request) {
  try {
    const { book_id } = await request.json();

    if (!book_id) {
      return NextResponse.json(
        { error: 'book_idを指定してください' },
        { status: 400 }
      );
    }

    // デモモード判定
    const useMockData = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_DATA === 'true';
    const isDemo = book_id.startsWith('demo-book-') || !supabaseUrl || !supabaseServiceKey;

    if (isDemo || useMockData) {
      // モックデータを返す
      const mockKdpInfo: KdpInfo = {
        keywords: [
          'Kindle出版',
          '電子書籍',
          '副業',
          '初心者向け',
          'AI執筆',
          'セルフパブリッシング',
          '印税収入'
        ],
        description: `<b>📚 今すぐ始められる！Kindle出版の完全ガイド</b>

<p>「本を出版したいけど、何から始めればいいかわからない...」</p>
<p>そんなあなたのために、この本では<b>ゼロからKindle出版を成功させる方法</b>を徹底解説します。</p>

<b>🎯 この本で得られること：</b>
<ul>
<li>Kindle出版の基礎から応用まで完全網羅</li>
<li>売れるタイトル・表紙の作り方</li>
<li>効果的なマーケティング戦略</li>
<li>継続的な印税収入を得る秘訣</li>
</ul>

<b>👤 こんな方におすすめ：</b>
<ul>
<li>副業として電子書籍出版を始めたい方</li>
<li>自分の知識やノウハウを本にしたい方</li>
<li>時間や場所に縛られない働き方を実現したい方</li>
</ul>

<p><b>今日から、あなたも著者デビューしませんか？</b></p>`,
        categories: [
          'ビジネス・経済 > 起業・開業',
          'コンピュータ・IT > 電子書籍'
        ],
        catch_copy: '「書く」を「稼ぐ」に変える、Kindle出版の教科書'
      };
      
      return NextResponse.json(mockKdpInfo);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. 本の情報を取得
    const { data: bookData, error: bookError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle, target_info')
      .eq('id', book_id)
      .single();

    if (bookError || !bookData) {
      return NextResponse.json(
        { error: '本が見つかりません' },
        { status: 404 }
      );
    }

    // 2. 章を取得
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('kdl_chapters')
      .select('id, title, summary, order_index')
      .eq('book_id', book_id)
      .order('order_index', { ascending: true });

    if (chaptersError) {
      throw new Error('章の取得に失敗しました: ' + chaptersError.message);
    }

    // 3. 節の内容を取得（はじめに・おわりに等の重要な部分を優先）
    const chapterIds = chaptersData?.map(ch => ch.id) || [];
    let sampleContent = '';

    if (chapterIds.length > 0) {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('kdl_sections')
        .select('chapter_id, title, content, order_index')
        .in('chapter_id', chapterIds)
        .order('order_index', { ascending: true });

      if (sectionsError) {
        console.warn('節の取得に失敗:', sectionsError.message);
      } else if (sectionsData && sectionsData.length > 0) {
        // 「はじめに」「おわりに」「まえがき」「あとがき」などを優先的に抽出
        const importantKeywords = ['はじめに', 'おわりに', 'まえがき', 'あとがき', '序章', '終章', 'プロローグ', 'エピローグ'];
        
        const importantSections = sectionsData.filter(sec => 
          importantKeywords.some(keyword => 
            sec.title?.includes(keyword) || 
            chaptersData?.find(ch => ch.id === sec.chapter_id)?.title?.includes(keyword)
          )
        );

        // 重要なセクションの内容を集める
        const importantContents = importantSections
          .filter(sec => sec.content && sec.content.trim())
          .map(sec => stripHtml(sec.content))
          .join('\n\n');

        // 重要セクションがなければ、コンテンツがある最初のいくつかの節を使用
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

        // 最大文字数を制限（トークン節約のため）
        sampleContent = truncateText(sampleContent, 4000);
      }
    }

    // 4. 目次を組み立て
    const tocText = chaptersData
      ?.map(ch => `${ch.title}${ch.summary ? ` - ${ch.summary}` : ''}`)
      .join('\n') || '';

    // 5. ターゲット情報を組み立て
    const targetInfo = bookData.target_info as any;
    let targetText = '';
    if (targetInfo) {
      targetText = `
ターゲット読者: ${targetInfo.profile || '不明'}
メリット: ${targetInfo.merits?.join('、') || ''}
ベネフィット: ${targetInfo.benefits?.join('、') || ''}
USP: ${targetInfo.usp || ''}`;
    }

    // 6. AIにKDP情報を生成させる
    const systemPrompt = `あなたはAmazon Kindleのマーケティングと出版に精通したプロフェッショナルです。
与えられた本の情報をもとに、KDP（Kindle Direct Publishing）に登録するための最適なメタデータを生成してください。

# 重要なポイント：
1. **キーワード（7個固定）**: Amazon検索で見つかりやすく、かつ競合が少ないキーワードを選定。ビッグキーワードと具体的なロングテールを組み合わせる。
2. **紹介文（description）**: HTMLタグを使って視覚的に魅力的に。箇条書き、太字、段落を効果的に使用。読者の悩みに共感し、本のベネフィットを明確に伝える。4000バイト以内。
3. **推奨カテゴリー**: Amazonで実際に存在する日本語カテゴリーを2つ提案。「親カテゴリー > 子カテゴリー」形式で。
4. **キャッチコピー**: 表紙やSNS告知で使える短いコピー。20〜40文字程度。

# 出力形式（JSON）:
{
  "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5", "キーワード6", "キーワード7"],
  "description": "HTMLタグ付きの紹介文",
  "categories": ["親カテゴリー1 > 子カテゴリー1", "親カテゴリー2 > 子カテゴリー2"],
  "catch_copy": "短いキャッチコピー"
}

必ずJSON形式で出力してください。`;

    const userPrompt = `以下の本についてKDP登録情報を生成してください。

【タイトル】
${bookData.title}
${bookData.subtitle ? `【サブタイトル】\n${bookData.subtitle}` : ''}

【目次】
${tocText}
${targetText ? `\n【ターゲット情報】${targetText}` : ''}
${sampleContent ? `\n【本文サンプル（抜粋）】\n${sampleContent}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    const result: KdpInfo = JSON.parse(content);

    // バリデーション
    if (!result.keywords || !Array.isArray(result.keywords) || result.keywords.length !== 7) {
      // キーワードが7個でない場合、調整
      if (result.keywords && Array.isArray(result.keywords)) {
        while (result.keywords.length < 7) {
          result.keywords.push('');
        }
        result.keywords = result.keywords.slice(0, 7);
      } else {
        result.keywords = ['', '', '', '', '', '', ''];
      }
    }

    if (!result.description) {
      result.description = '';
    }

    if (!result.categories || !Array.isArray(result.categories)) {
      result.categories = [];
    }

    if (!result.catch_copy) {
      result.catch_copy = '';
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Generate KDP info error:', error);
    return NextResponse.json(
      { error: 'KDP情報の生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

