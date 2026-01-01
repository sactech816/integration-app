import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// パターン定義
export const CHAPTER_PATTERNS = {
  basic: {
    id: 'basic',
    name: '基礎→応用→実践型',
    description: '基礎→応用→実践→差別化→未来展望',
    icon: '📚',
  },
  problem: {
    id: 'problem',
    name: '問題解決型',
    description: '問題提起→原因分析→解決法→事例→行動計画',
    icon: '🔍',
  },
  story: {
    id: 'story',
    name: 'ストーリー型',
    description: '過去→現在→未来／失敗→学び→成功',
    icon: '📖',
  },
  qa: {
    id: 'qa',
    name: 'Q&A型',
    description: '読者の疑問を章ごとに取り上げ回答する',
    icon: '❓',
  },
  workbook: {
    id: 'workbook',
    name: 'ワークブック型',
    description: '解説＋実践ワークを交互に配置',
    icon: '✏️',
  },
  original: {
    id: 'original',
    name: 'オリジナル構成',
    description: 'タイトル・ターゲットに最も合う独自構成',
    icon: '✨',
  },
} as const;

// レスポンスの型定義
interface Section {
  title: string;
}

interface Chapter {
  title: string;
  summary: string;
  sections: Section[];
}

interface GeneratedChapters {
  chapters: Chapter[];
  pattern: string;
  patternId: string;
  totalEstimatedWords: string;
}

interface RecommendedPattern {
  patternId: string;
  reason: string;
  score: number;
}

interface RecommendResponse {
  recommendations: RecommendedPattern[];
}

// パターンごとのモックデータ
const getMockChapters = (patternId: string, title: string): GeneratedChapters => {
  const patterns: Record<string, GeneratedChapters> = {
    basic: {
      pattern: '基礎→応用→実践→差別化→未来展望',
      patternId: 'basic',
      totalEstimatedWords: '約4万文字',
      chapters: [
        { title: 'はじめに', summary: '本書の目的と全体像', sections: [{ title: '本書の目的と全体像' }, { title: '著者の実績と信頼性' }, { title: '対象読者と読むメリット' }] },
        { title: '第1章　基礎を理解する', summary: '成功に必要な基礎知識', sections: [{ title: '本章の概要' }, { title: '必須知識の整理' }, { title: '基本の考え方' }, { title: '本章のまとめ' }] },
        { title: '第2章　応用力を身につける', summary: '基礎を応用するテクニック', sections: [{ title: '本章の概要' }, { title: '応用のポイント' }, { title: '実践的なテクニック' }, { title: '本章のまとめ' }] },
        { title: '第3章　実践のステップ', summary: '具体的な行動ステップ', sections: [{ title: '本章の概要' }, { title: 'ステップ1：準備' }, { title: 'ステップ2：実行' }, { title: 'ステップ3：検証' }, { title: '本章のまとめ' }] },
        { title: '第4章　差別化戦略', summary: '競合との違いを作る', sections: [{ title: '本章の概要' }, { title: '差別化の重要性' }, { title: '独自のUSPを活かす' }, { title: '本章のまとめ' }] },
        { title: '第5章　未来への展望', summary: '今後の展望と行動計画', sections: [{ title: '本章の概要' }, { title: '今後の変化' }, { title: '次に取るべき行動' }, { title: '本章のまとめ' }] },
        { title: 'おわりに', summary: '読者への最終メッセージ', sections: [{ title: '最後に伝えたいこと' }, { title: 'カスタマーレビューのお願い' }, { title: '著者紹介' }] },
      ]
    },
    problem: {
      pattern: '問題提起→原因分析→解決法→事例→行動計画',
      patternId: 'problem',
      totalEstimatedWords: '約4万文字',
      chapters: [
        { title: 'はじめに', summary: '本書の目的と全体像', sections: [{ title: '本書の目的' }, { title: 'なぜこの本を書いたのか' }, { title: '読者が得られるもの' }] },
        { title: '第1章　問題提起', summary: '読者が直面する課題を明確に', sections: [{ title: '本章の概要' }, { title: 'あなたが直面している問題' }, { title: 'この問題を放置するとどうなるか' }, { title: '本章のまとめ' }] },
        { title: '第2章　原因分析', summary: 'なぜこの問題が起きるのか', sections: [{ title: '本章の概要' }, { title: '根本原因を探る' }, { title: 'よくある失敗パターン' }, { title: '本章のまとめ' }] },
        { title: '第3章　解決法', summary: '具体的な解決策の提示', sections: [{ title: '本章の概要' }, { title: '解決策1' }, { title: '解決策2' }, { title: '解決策3' }, { title: '本章のまとめ' }] },
        { title: '第4章　成功事例', summary: '実際の成功ケーススタディ', sections: [{ title: '本章の概要' }, { title: '事例1' }, { title: '事例2' }, { title: '成功のポイント' }, { title: '本章のまとめ' }] },
        { title: '第5章　行動計画', summary: '今日から始める具体的なアクション', sections: [{ title: '本章の概要' }, { title: '30日間アクションプラン' }, { title: 'チェックリスト' }, { title: '本章のまとめ' }] },
        { title: 'おわりに', summary: '読者への最終メッセージ', sections: [{ title: '最後に伝えたいこと' }, { title: '著者紹介' }] },
      ]
    },
    story: {
      pattern: 'ストーリー型（失敗→学び→成功）',
      patternId: 'story',
      totalEstimatedWords: '約3.5万文字',
      chapters: [
        { title: 'プロローグ', summary: '物語の始まり', sections: [{ title: '私がこの旅を始めた理由' }, { title: '当時の状況' }] },
        { title: '第1章　暗闘の時代', summary: '失敗と挫折の日々', sections: [{ title: '本章の概要' }, { title: '最初の壁' }, { title: '予想外の困難' }, { title: '本章のまとめ' }] },
        { title: '第2章　転機', summary: '変化のきっかけ', sections: [{ title: '本章の概要' }, { title: '気づきの瞬間' }, { title: '新しい視点' }, { title: '本章のまとめ' }] },
        { title: '第3章　学びと成長', summary: '失敗から得た教訓', sections: [{ title: '本章の概要' }, { title: '教訓1' }, { title: '教訓2' }, { title: '教訓3' }, { title: '本章のまとめ' }] },
        { title: '第4章　実践と成功', summary: '学びを活かした成功体験', sections: [{ title: '本章の概要' }, { title: '新しいアプローチ' }, { title: '成功への道のり' }, { title: '本章のまとめ' }] },
        { title: '第5章　あなたへのメッセージ', summary: '読者が同じ成功を得るために', sections: [{ title: '本章の概要' }, { title: '再現性のあるポイント' }, { title: '始めの一歩' }, { title: '本章のまとめ' }] },
        { title: 'エピローグ', summary: '未来への展望', sections: [{ title: 'その後の私' }, { title: 'あなたへの願い' }] },
      ]
    },
    qa: {
      pattern: 'Q&A型（読者の疑問に答える形式）',
      patternId: 'qa',
      totalEstimatedWords: '約4万文字',
      chapters: [
        { title: 'はじめに', summary: 'この本の使い方', sections: [{ title: '本書の目的' }, { title: '効果的な読み方' }] },
        { title: '第1章　基本的な疑問', summary: '初心者がまず知りたいこと', sections: [{ title: 'Q1. そもそも○○とは？' }, { title: 'Q2. なぜ今○○が重要なのか？' }, { title: 'Q3. 誰でもできるのか？' }] },
        { title: '第2章　始め方の疑問', summary: 'スタートアップの疑問解消', sections: [{ title: 'Q4. 何から始めればいい？' }, { title: 'Q5. 必要な準備は？' }, { title: 'Q6. どのくらい時間がかかる？' }] },
        { title: '第3章　実践の疑問', summary: '実践中によくある質問', sections: [{ title: 'Q7. うまくいかないときは？' }, { title: 'Q8. 継続のコツは？' }, { title: 'Q9. 効率を上げるには？' }] },
        { title: '第4章　上級者の疑問', summary: 'さらなるステップアップ', sections: [{ title: 'Q10. 次のレベルに行くには？' }, { title: 'Q11. 収益化するには？' }, { title: 'Q12. 差別化するには？' }] },
        { title: '第5章　トラブルシューティング', summary: 'よくある問題と解決策', sections: [{ title: 'Q13. ○○の場合は？' }, { title: 'Q14. △△のトラブル解決' }, { title: 'Q15. その他のFAQ' }] },
        { title: 'おわりに', summary: '最後のQ&A', sections: [{ title: '著者への質問' }, { title: '読者コミュニティの案内' }] },
      ]
    },
    workbook: {
      pattern: 'ワークブック型（解説＋実践ワーク）',
      patternId: 'workbook',
      totalEstimatedWords: '約5万文字',
      chapters: [
        { title: 'はじめに', summary: 'このワークブックの使い方', sections: [{ title: '本書の目的' }, { title: 'ワークの進め方' }, { title: '準備するもの' }] },
        { title: 'ユニット1　自己分析', summary: '現状を把握するワーク', sections: [{ title: '【解説】自己分析の重要性' }, { title: '【ワーク1】現状チェックシート' }, { title: '【ワーク2】強み発見ワーク' }, { title: '【振り返り】' }] },
        { title: 'ユニット2　目標設定', summary: 'ゴールを明確にするワーク', sections: [{ title: '【解説】効果的な目標設定' }, { title: '【ワーク3】ビジョンボード作成' }, { title: '【ワーク4】SMART目標設定' }, { title: '【振り返り】' }] },
        { title: 'ユニット3　計画立案', summary: 'アクションプランを作るワーク', sections: [{ title: '【解説】計画の立て方' }, { title: '【ワーク5】ロードマップ作成' }, { title: '【ワーク6】週間スケジュール' }, { title: '【振り返り】' }] },
        { title: 'ユニット4　実践', summary: '行動を起こすワーク', sections: [{ title: '【解説】行動の習慣化' }, { title: '【ワーク7】最初の一歩チャレンジ' }, { title: '【ワーク8】進捗トラッキング' }, { title: '【振り返り】' }] },
        { title: 'ユニット5　振り返りと改善', summary: 'PDCAを回すワーク', sections: [{ title: '【解説】振り返りの技術' }, { title: '【ワーク9】月間レビューシート' }, { title: '【ワーク10】改善プランニング' }, { title: '【振り返り】' }] },
        { title: '総まとめ', summary: '全体の振り返りと次のステップ', sections: [{ title: '【総合ワーク】成長の軌跡' }, { title: '次のチャレンジへ' }, { title: '著者紹介' }] },
      ]
    },
    original: {
      pattern: 'オリジナル構成',
      patternId: 'original',
      totalEstimatedWords: '約4万文字',
      chapters: [
        { title: 'はじめに', summary: '本書の目的と全体像', sections: [{ title: '本書の目的' }, { title: '読者へのメッセージ' }] },
        { title: '第1章　導入', summary: 'テーマへの導入', sections: [{ title: '本章の概要' }, { title: '背景と現状' }, { title: '本章のまとめ' }] },
        { title: '第2章　核心', summary: '最も重要なポイント', sections: [{ title: '本章の概要' }, { title: '核心となる考え方' }, { title: '実践のポイント' }, { title: '本章のまとめ' }] },
        { title: '第3章　応用', summary: 'さらなる展開', sections: [{ title: '本章の概要' }, { title: '応用パターン' }, { title: '事例紹介' }, { title: '本章のまとめ' }] },
        { title: '第4章　まとめ', summary: '全体の総括', sections: [{ title: '本章の概要' }, { title: '重要ポイントの振り返り' }, { title: '次のステップ' }, { title: '本章のまとめ' }] },
        { title: 'おわりに', summary: '読者への最終メッセージ', sections: [{ title: '最後に' }, { title: '著者紹介' }] },
      ]
    },
  };
  
  return patterns[patternId] || patterns.basic;
};

export async function POST(request: Request) {
  try {
    const { title, subtitle, target, patternId, action, instruction } = await request.json();

    // おすすめパターンを取得するアクション
    if (action === 'recommend') {
      if (!title) {
        return NextResponse.json({ error: 'タイトルを入力してください' }, { status: 400 });
      }

      const useMockData = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        // モックのおすすめパターン
        const mockRecommendations: RecommendResponse = {
          recommendations: [
            { patternId: 'basic', reason: '体系的に学べる構成で、幅広い読者に適しています', score: 90 },
            { patternId: 'problem', reason: '読者の課題解決にフォーカスした構成で訴求力が高いです', score: 85 },
            { patternId: 'workbook', reason: '実践的なワークを含むことで読者の行動を促せます', score: 75 },
          ]
        };
        return NextResponse.json(mockRecommendations);
      }

      // AIによるおすすめパターン分析
      const recommendPrompt = `以下の本について、最適な章立てパターンを3つ推薦してください。

タイトル: ${title}
${subtitle ? `サブタイトル: ${subtitle}` : ''}
${target ? `ターゲット読者: ${target.profile}` : ''}

利用可能なパターン:
- basic: 基礎→応用→実践→差別化→未来展望
- problem: 問題提起→原因分析→解決法→事例→行動計画
- story: ストーリー型（過去→現在→未来／失敗→学び→成功）
- qa: Q&A型（読者の疑問を章ごとに取り上げ回答する）
- workbook: ワークブック型（解説＋実践ワークを交互に配置）
- original: オリジナル構成

必ずJSON形式で出力してください:
{
  "recommendations": [
    { "patternId": "パターンID", "reason": "推薦理由（50文字程度）", "score": 推薦度（1-100） },
    ...
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'system', content: 'あなたは出版マーケティングの専門家です。本の内容に最適な章立てパターンを分析してください。結果は必ずJSON形式で出力してください。' },
          { role: 'user', content: recommendPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('AIからの応答が空です');
      
      return NextResponse.json(JSON.parse(content));
    }

    // 目次生成アクション（デフォルト）
    if (!title) {
      return NextResponse.json({ error: 'タイトルを入力してください' }, { status: 400 });
    }

    const selectedPattern = patternId || 'basic';
    const useMockData = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      return NextResponse.json(getMockChapters(selectedPattern, title));
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 });
    }

    const patternDescriptions: Record<string, string> = {
      basic: '基礎→応用→実践→差別化→未来展望の流れで構成してください。基礎から段階的に学べる教科書的な構成です。',
      problem: '問題提起→原因分析→解決法→事例→行動計画の流れで構成してください。読者の課題を明確にし、解決へ導く構成です。',
      story: 'ストーリー型（過去→現在→未来、または失敗→学び→成功）で構成してください。著者の体験を軸にした感情に訴える構成です。',
      qa: 'Q&A型で構成してください。読者の疑問を章ごとに取り上げ、回答する形式です。各章は複数のQ&Aで構成してください。',
      workbook: 'ワークブック型で構成してください。【解説】パートと【ワーク】パートを交互に配置し、実践的な学びを促す構成です。',
      original: 'このタイトルとターゲットに最も合うオリジナルの構成を自由に設計してください。',
    };

    const systemPrompt = `＃目的：
確定した『タイトル』『サブタイトル』『ターゲットユーザ情報』を踏まえ、
指定されたパターンに沿ってAmazonで売れる本にふさわしい章立て（目次）を設計してください。

＃指定パターン：
${patternDescriptions[selectedPattern]}

＃条件：
- 日本語のみ
- 章数は4〜8章程度
- 各章の冒頭には「本章の概要」、末尾には「本章のまとめ」を追加（Q&A型・ワークブック型は適宜調整）
- トータル3万〜5万文字程度を想定
- 「はじめに」と「おわりに」を必ず含める
- 結果は必ずJSON形式で出力すること

＃出力形式（JSON）：
{
  "pattern": "使用したパターン名",
  "patternId": "${selectedPattern}",
  "totalEstimatedWords": "想定総文字数",
  "chapters": [
    {
      "title": "章のタイトル",
      "summary": "この章の概要（50文字程度）",
      "sections": [{ "title": "節のタイトル" }, ...]
    },
    ...
  ]
}${instruction ? `

# ユーザーからの追加修正要望:
${instruction}

上記のリクエストを反映して、再度案を作成してください。` : ''}`;

    let targetInfo = '';
    if (target) {
      targetInfo = `
ターゲットユーザ:
- プロフィール: ${target.profile}
- メリット: ${target.merits?.join('、') || ''}
- ベネフィット: ${target.benefits?.join('、') || ''}
- USP: ${target.usp || ''}`;
    }

    const userMessage = `以下の本について、${CHAPTER_PATTERNS[selectedPattern as keyof typeof CHAPTER_PATTERNS]?.name || '基礎→応用→実践型'}の目次をJSON形式で作成してください。

タイトル：${title}
${subtitle ? `サブタイトル：${subtitle}` : ''}
${targetInfo}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('AIからの応答が空です');

    const result: GeneratedChapters = JSON.parse(content);
    if (!result.chapters || !Array.isArray(result.chapters)) {
      throw new Error('不正な応答形式です');
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate chapters error:', error);
    return NextResponse.json(
      { error: '目次生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
