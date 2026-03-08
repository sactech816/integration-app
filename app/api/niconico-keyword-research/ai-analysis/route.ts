import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai-provider';
import type { NiconicoVideoData } from '../route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, results, analysisType } = body as {
      keyword: string;
      results: NiconicoVideoData[];
      analysisType: 'full' | 'tags' | 'keywords' | 'comment-culture' | 'persona' | 'title-pattern';
    };

    if (!keyword || !results || results.length === 0) {
      return NextResponse.json(
        { error: '分析するデータがありません' },
        { status: 400 }
      );
    }

    const provider = createAIProvider({
      preferProvider: 'gemini',
      model: 'gemini-2.5-flash',
    });

    const videoSummaries = results.slice(0, 20).map((v, i) => ({
      rank: i + 1,
      title: v.title,
      contentId: v.contentId,
      views: v.viewCounter,
      comments: v.commentCounter,
      mylists: v.mylistCounter,
      likes: v.likeCounter,
      commentRatio: v.commentRatio,
      engagementRate: v.engagementRate,
      tags: v.tags,
      startTime: v.startTime?.split('T')[0],
      lengthSeconds: v.lengthSeconds,
    }));

    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'full') {
      systemPrompt = `あなたはニコニコ動画マーケティングの専門家です。検索結果データを分析し、日本語で実用的なアドバイスを提供してください。
ニコニコ動画特有のカルチャー（コメント文化、タグ文化、マイリスト、ニコニ広告など）を踏まえた分析をしてください。
マークダウン形式で出力してください。各セクションは ## で始めてください。`;

      userPrompt = `キーワード「${keyword}」のニコニコ動画検索結果を分析してください。

検索結果データ:
${JSON.stringify(videoSummaries, null, 2)}

以下の項目を分析してレポートを作成してください:

## 市場概況
- このキーワードの競合状況（動画数の傾向、再生数の分布）
- 参入しやすさの評価
- ニコニコ動画での人気度

## バズっている動画の特徴
- コメント率（コメント数/再生数）が高い動画に共通するパターン
- マイリスト率が高い動画の特徴
- 動画の長さの傾向
- 投稿タイミング

## エンゲージメントが高い動画
- エンゲージメント率（コメント+マイリスト+いいね/再生数）が高い動画をリストアップ
- なぜ視聴者の反応が良いか分析

## 狙い目キーワード候補（10個）
- 検索結果のタイトル・タグから派生する関連キーワード
- 競合が少なそうなニッチキーワード

## おすすめタグ（20個）
- 上位動画の共通タグ + トレンドを踏まえた推奨タグ
- ニコニコ動画で検索されやすいタグ形式で

## 動画企画アイデア（5本）
- 各アイデアにタイトル案とサムネイルのテキスト案を含める
- ニコニコ動画で受けそうな要素（コメントで盛り上がる仕掛け等）を含める

## 改善ポイント
- ニコニコ動画で成功するための具体的なアドバイス3つ`;
    } else if (analysisType === 'tags') {
      systemPrompt = 'あなたはニコニコ動画のタグ戦略の専門家です。最適なタグを提案してください。ニコニコ動画ではタグ検索が主流であることを踏まえてください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を提案してください:

## メインタグ（30個）
上位動画の共通タグとトレンドを分析し、このジャンルに最適なタグを30個提案。
ニコニコ動画のタグ規約（1動画最大11個）を踏まえた優先順位付き。

## ニコニコ特有の定番タグ（10個）
このジャンルで使われるニコニコ特有のタグ（例: 「もっと評価されるべき」「才能の無駄遣い」等）

## タグ組み合わせ戦略
- 検索流入を狙うタグの選び方
- ランキング入りを狙うタグ戦略
- タグロック推奨タグとその理由

## 避けるべきタグ
- 使うと逆効果になるタグや注意点`;
    } else if (analysisType === 'keywords') {
      systemPrompt = 'あなたはニコニコ動画キーワード戦略の専門家です。ヒットしやすいキーワードを提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を分析・提案してください:

## ヒットキーワード分析
上位動画のタイトル・タグに頻出するキーワードパターンを分析

## 関連キーワード100選
「${keyword}」に関連する、ニコニコ動画で検索されそうなキーワードを100個提案。
カテゴリ別に整理（初心者向け、実況系、解説系、MAD系、技術系、ネタ系など）

## 穴場キーワード（20個）
競合が少ないが需要がありそうなニッチキーワード。
各キーワードに想定される検索意図も記載。

## タイトルテンプレート（10パターン）
再生数・コメント数が伸びやすいタイトルの型を提案。
「${keyword}」を使った具体的な例文付き。`;
    } else if (analysisType === 'comment-culture') {
      systemPrompt = 'あなたはニコニコ動画のコメント文化に精通した専門家です。コメント傾向を分析し、視聴者参加型のコンテンツ戦略を提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を分析・提案してください:

## コメント傾向分析
- コメント率（コメント数/再生数）の分布と特徴
- コメント率が高い動画の共通点
- このジャンルで予想されるコメントの種類（弾幕、ツッコミ、感想、質問等）

## 弾幕パターン分析
- このジャンルで起こりやすい弾幕コメントのパターン
- 弾幕が発生しやすい動画構成の特徴
- 視聴者が「コメントしたくなる」瞬間の作り方

## コメントアート・ニコニコ文化
- このジャンルで活用できるニコニコ特有の文化要素
- コメントアートが生まれやすい動画の特徴

## 視聴者参加型企画（5本）
- コメントで盛り上がる動画企画を具体的に提案
- 各企画のコメント促進ポイント
- 予想されるコメントの流れ

## コメント促進テクニック（10個）
- 動画内でコメントを促す具体的な方法
- タイミング、演出、問いかけ方のコツ

## ニコニ広告との相乗効果
- コメントが多い動画がニコニ広告で伸びる仕組み
- 広告効果を最大化するコメント戦略`;
    } else if (analysisType === 'persona') {
      systemPrompt = 'あなたはニコニコ動画の視聴者分析の専門家です。ターゲット層を分析してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を分析してください:

## メインターゲット層
- 推定年齢層・性別比率
- ニコニコ動画を利用する動機
- 他に視聴していそうなジャンル

## 視聴者の行動パターン
- 視聴時間帯の傾向
- マイリスト・コメント・いいねの使い分け
- プレミアム会員比率の推定

## 視聴者の悩み・ニーズ（10個）
- このキーワードで検索する人が抱える悩みや欲求
- 解決したい課題

## ペルソナ設計（3パターン）
- 各ペルソナの詳細プロフィール
- 動画視聴後に取る行動
- 響くメッセージングのポイント

## リーチ拡大戦略
- ターゲット層に効果的にリーチする方法
- ニコニコ動画内外での集客アプローチ`;
    } else if (analysisType === 'title-pattern') {
      systemPrompt = 'あなたはニコニコ動画のタイトル最適化の専門家です。バズるタイトルのパターンを分析してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を分析・提案してください:

## タイトルパターン分析
- 上位動画のタイトルに共通するパターン
- 文字数の傾向
- 使用頻度の高い記号・括弧

## バズるタイトルの法則（10パターン）
ニコニコ動画で再生数・コメントが伸びやすいタイトルの型:
- 各パターンの説明と効果
- 「${keyword}」を使った具体例

## ニコニコ特有のタイトル要素
- ニコニコ動画で効果的な表現（例: 「やってみた」「歌ってみた」「解説」等）
- シリーズ動画のナンバリング方法
- 【】の効果的な使い方

## NGタイトル例（5個）
- 避けるべきタイトルパターンとその理由

## タイトル改善提案
- 上位動画のタイトルをさらに改善する案`;
    }

    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 16384,
    });

    return NextResponse.json({
      analysis: response.content,
      model: response.model,
      provider: response.provider,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Niconico AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
