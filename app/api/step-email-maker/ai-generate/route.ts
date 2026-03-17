import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST: ステップメール本文 AI 生成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, purpose, keyword, stepNumber, totalSteps, sequenceName, currentContent } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!purpose || !keyword) {
      return NextResponse.json({ error: '目的とキーワードは必須です' }, { status: 400 });
    }

    const purposeLabels: Record<string, string> = {
      welcome: 'ウェルカムメール（初回挨拶・自己紹介）',
      value: '価値提供（ノウハウ・教育コンテンツ）',
      story: 'ストーリー（体験談・事例紹介）',
      engagement: 'エンゲージメント（質問・アンケート・交流）',
      offer: 'オファー（商品・サービスのご案内）',
      reminder: 'リマインダー（締め切り・フォローアップ）',
    };

    const purposeText = purposeLabels[purpose] || purpose;
    const stepInfo = stepNumber && totalSteps ? `（全${totalSteps}通中の${stepNumber}通目）` : '';
    const seqInfo = sequenceName ? `シーケンス名: ${sequenceName}` : '';

    const systemPrompt = `あなたはステップメール（自動配信メール）の専門コピーライターです。
日本語で、読者に寄り添った温かみのあるメール本文を作成してください。

ルール:
- HTMLメール形式で出力（<div>で囲む、インラインスタイル使用）
- max-width: 600px, font-family: 'Helvetica Neue', Arial, sans-serif
- 本文テキストは color:#374151, font-size:16px, line-height:1.8
- 見出しは color:#1e293b, font-size:24px
- CTAボタンがある場合: display:inline-block, padding:14px 32px, border-radius:8px, font-weight:600
- 読者が「このメールを読んでよかった」と思える内容にする
- 売り込みすぎず、価値提供を重視する
- 1通あたり300〜500文字程度
- {{送信者名}} プレースホルダーを使用可能`;

    const userPrompt = `以下の条件でステップメールの本文を1通分作成してください。

目的: ${purposeText}
キーワード・テーマ: ${keyword}
${seqInfo}
${stepInfo}
${currentContent ? `現在の内容（参考）:\n${currentContent.substring(0, 500)}` : ''}

HTMLメール本文のみを出力してください。説明は不要です。`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const result = textBlock?.text || '';

    // 件名も生成
    const subjectResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `以下のメール本文に最適な件名を3つ提案してください。各件名は30文字以内で、改行区切りで出力してください。件名のみ出力し、番号や説明は不要です。\n\n${result.substring(0, 1000)}`,
      }],
    });

    const subjectText = subjectResponse.content.find((b) => b.type === 'text')?.text || '';
    const subjectSuggestions = subjectText.split('\n').filter((s) => s.trim()).slice(0, 3);

    return NextResponse.json({ result, subjectSuggestions });
  } catch (error) {
    console.error('[Step Email AI Generate] Error:', error);
    return NextResponse.json({ error: 'AI生成に失敗しました' }, { status: 500 });
  }
}
