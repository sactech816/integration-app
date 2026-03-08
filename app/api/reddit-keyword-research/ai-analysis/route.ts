import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai-provider';
import type { RedditPostData } from '../route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, results, analysisType } = body as {
      keyword: string;
      results: RedditPostData[];
      analysisType: 'full' | 'subreddit-strategy' | 'keywords' | 'content-ideas' | 'persona' | 'title-pattern';
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

    const postSummaries = results.slice(0, 20).map((p, i) => ({
      rank: i + 1,
      title: p.title,
      subreddit: 'r/' + p.subreddit,
      score: p.score,
      upvoteRatio: p.upvoteRatio,
      numComments: p.numComments,
      subredditSubscribers: p.subredditSubscribers,
      engagementRate: p.engagementRate,
      scorePerHour: p.scorePerHour,
      hoursAgo: p.hoursAgo,
      isSelf: p.isSelf,
      isVideo: p.isVideo,
      domain: p.domain,
      flair: p.linkFlairText,
      author: p.author,
    }));

    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'full') {
      systemPrompt = `あなたはRedditマーケティングの専門家です。検索結果データを分析し、日本語で実用的なアドバイスを提供してください。
Redditの文化（upvote/downvote、karma、subredditコミュニティ、自己宣伝ルール等）を踏まえた分析をしてください。
マークダウン形式で出力してください。各セクションは ## で始めてください。`;

      userPrompt = `キーワード「${keyword}」のReddit検索結果を分析してください。

検索結果データ:
${JSON.stringify(postSummaries, null, 2)}

以下の項目を分析してレポートを作成してください:

## 市場概況
- このキーワードのRedditでの注目度
- 投稿されているサブレディットの分布
- スコア・コメント数の傾向

## バズっている投稿の特徴
- 高スコアの投稿に共通するパターン（タイトル、投稿タイプ、時間帯）
- upvote ratioが高い投稿の特徴
- コメントが多い投稿の共通点

## エンゲージメントが高い投稿
- engagement rateが高い投稿をリストアップし、なぜバズったか分析
- スコア/時間（scorePerHour）が高い投稿の特徴

## 狙い目キーワード候補（10個）
- 検索結果のタイトルから派生する関連キーワード
- 競合が少なそうなニッチキーワード

## サブレディット戦略
- 最も活発なサブレディットとその特徴
- 各サブレディットの投稿ルール・文化の推測
- クロスポスト戦略

## 投稿企画アイデア（5本）
- 各アイデアにタイトル案と投稿タイプ（テキスト/リンク/画像）を含める
- Redditで受けそうな要素（AMA、discussion、guide等）を含める

## 改善ポイント
- Redditで成功するための具体的なアドバイス3つ
- 避けるべき行動（自己宣伝ルール等）`;
    } else if (analysisType === 'subreddit-strategy') {
      systemPrompt = 'あなたはRedditのサブレディット戦略の専門家です。最適なサブレディット選定と投稿戦略を提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位投稿データ:
${JSON.stringify(postSummaries, null, 2)}

以下を分析・提案してください:

## サブレディット分析
検索結果に登場するサブレディットを全て分析:
- 各サブレディットの規模（登録者数）
- 投稿のスコア・コメント数の傾向
- 推定される投稿ルールと文化

## ターゲットサブレディット TOP 10
このキーワードで投稿すべきサブレディットを優先順位付きで提案:
- 推定される受け入れられやすさ
- 投稿に最適なフォーマット（テキスト/リンク/画像）
- 投稿タイミングの推奨

## クロスポスト戦略
- 効果的なクロスポストの組み合わせ
- 各サブレディットでのタイトルカスタマイズ方法

## サブレディット発掘
- 検索結果には出ていないが関連しそうなサブレディット（20個）
- ニッチだが影響力のあるサブレディット

## 投稿スケジュール
- 曜日・時間帯別のおすすめ投稿タイミング
- 各サブレディットのピーク時間の推測

## 注意事項
- 各サブレディットで避けるべき行動
- BANされないための自己宣伝ルールの守り方`;
    } else if (analysisType === 'keywords') {
      systemPrompt = 'あなたはRedditキーワード戦略の専門家です。ヒットしやすいキーワードを提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位投稿データ:
${JSON.stringify(postSummaries, null, 2)}

以下を分析・提案してください:

## ヒットキーワード分析
上位投稿のタイトルに頻出するキーワードパターンを分析

## 関連キーワード100選
「${keyword}」に関連する、Redditで検索・投稿されそうなキーワードを100個提案。
カテゴリ別に整理（質問系、ディスカッション系、ハウツー系、比較系、レビュー系、ニュース系など）

## 穴場キーワード（20個）
競合が少ないが需要がありそうなニッチキーワード。
各キーワードに想定されるサブレディットと投稿フォーマット。

## タイトルテンプレート（10パターン）
スコアが伸びやすいタイトルの型を提案。
「${keyword}」を使った英語・日本語の具体的な例文付き。`;
    } else if (analysisType === 'content-ideas') {
      systemPrompt = 'あなたはRedditコンテンツ戦略の専門家です。Reddit向けの投稿企画を提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位投稿データ:
${JSON.stringify(postSummaries, null, 2)}

以下を提案してください:

## コンテンツタイプ別企画

### テキスト投稿（5本）
- ディスカッション、質問、ガイド、体験談などの企画
- タイトル案と本文の構成案

### リンク投稿（5本）
- ブログ記事、ツール紹介、ニュース共有などの企画
- 効果的なタイトルとドメイン選び

### AMA/Q&A企画（3本）
- 「Ask Me Anything」形式の企画案
- 専門性のアピール方法

### シリーズ投稿（3本）
- 定期的に投稿するシリーズ企画
- コミュニティに定着するための戦略

## 投稿フォーマットガイド
- 各サブレディットに最適な投稿の長さ
- マークダウンの効果的な使い方
- 画像・リンクの添え方

## エンゲージメント最大化テクニック
- コメント欄での返信戦略
- 最初のコメント（OP comment）の書き方
- upvoteを集めるタイミングのコツ`;
    } else if (analysisType === 'persona') {
      systemPrompt = 'あなたはRedditユーザー分析の専門家です。ターゲット層を分析してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位投稿データ:
${JSON.stringify(postSummaries, null, 2)}

以下を分析してください:

## Redditユーザー層分析
- このキーワードに興味を持つRedditユーザーの推定プロフィール
- 年齢層・職業・地域の推定
- Reddit利用歴の推定

## ユーザー行動パターン
- 投稿 vs 閲覧（lurker）の比率推定
- コメント・upvoteの傾向
- アクティブな時間帯

## ユーザーの悩み・ニーズ（10個）
- このキーワードでRedditを検索する人が抱える悩みや欲求
- 解決したい課題

## ペルソナ設計（3パターン）
- 各ペルソナの詳細プロフィール
- Redditでの行動パターン
- 響くメッセージングのポイント

## コミュニティ特性
- このトピックのRedditコミュニティの雰囲気
- 歓迎される投稿スタイル
- 避けるべきトーンや内容`;
    } else if (analysisType === 'title-pattern') {
      systemPrompt = 'あなたはRedditのタイトル最適化の専門家です。バズるタイトルのパターンを分析してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位投稿データ:
${JSON.stringify(postSummaries, null, 2)}

以下を分析・提案してください:

## タイトルパターン分析
- 上位投稿のタイトルに共通するパターン
- 文字数の傾向
- 質問形 vs 断言形の比率

## バズるタイトルの法則（10パターン）
Redditでスコアが伸びやすいタイトルの型:
- 各パターンの説明と効果
- 「${keyword}」を使った具体例（英語）
- 日本語での応用例

## 投稿タイプ別タイトル戦略
- テキスト投稿のタイトル
- リンク投稿のタイトル
- 画像/動画投稿のタイトル

## サブレディット別タイトル最適化
- 各サブレディットで好まれるタイトルスタイル
- フレア（flair）の効果的な使い方

## NGタイトル例（5個）
- 避けるべきタイトルパターンとその理由
- downvoteされやすいタイトルの特徴

## タイトル改善提案
- 上位投稿のタイトルをさらに改善する案`;
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
    console.error('Reddit AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
