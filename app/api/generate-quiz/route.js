import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt, mode = 'diagnosis', questionCount = 5, resultCount = 3 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'プロンプトが必要です' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 });
    }

    const modeDescription = {
      diagnosis: '性格診断・タイプ診断',
      test: '正解がある検定クイズ',
      fortune: '占い・運勢診断',
    };

    const systemPrompt = `あなたは診断クイズ作成の専門家です。
ユーザーのリクエストに基づいて、${modeDescription[mode] || modeDescription.diagnosis}を作成してください。

以下の形式でJSONを返してください：
{
  "title": "診断タイトル",
  "description": "診断の説明文",
  "questions": [
    {
      "id": "q1",
      "text": "質問文",
      "options": [
        { "text": "選択肢A", "score": { "A": 1, "B": 0, "C": 0 } },
        { "text": "選択肢B", "score": { "A": 0, "B": 1, "C": 0 } },
        { "text": "選択肢C", "score": { "A": 0, "B": 0, "C": 1 } }
      ]
    }
  ],
  "results": [
    {
      "type": "A",
      "title": "結果タイトル",
      "description": "結果の説明（150文字程度）"
    }
  ]
}

質問数: ${questionCount}問
結果パターン数: ${resultCount}個
各選択肢は3つ用意してください。`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のテーマで診断クイズを作成してください：\n${prompt}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI応答が空です');
    }

    const quiz = JSON.parse(content);

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { error: '診断クイズの生成に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
}
