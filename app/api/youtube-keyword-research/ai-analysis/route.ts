import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai-provider';
import type { YouTubeVideoData } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, results, analysisType } = body as {
      keyword: string;
      results: YouTubeVideoData[];
      analysisType: 'full' | 'tags' | 'keywords' | 'overseas';
    };

    if (!keyword || !results || results.length === 0) {
      return NextResponse.json(
        { error: '分析するデータがありません' },
        { status: 400 }
      );
    }

    // Gemini 2.5 Flash でコスト最適化
    const provider = createAIProvider({
      preferProvider: 'gemini',
      model: 'gemini-2.5-flash',
    });

    // 動画データを要約（トークン節約）
    const videoSummaries = results.slice(0, 20).map((v, i) => ({
      rank: i + 1,
      title: v.title,
      channel: v.channelTitle,
      views: v.viewCount,
      subscribers: v.subscriberCount,
      viewRatio: v.viewRatio,
      likes: v.likeCount,
      comments: v.commentCount,
      publishedAt: v.publishedAt.split('T')[0],
      tags: (v.tags || []).slice(0, 10),
      duration: v.duration,
    }));

    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'full') {
      systemPrompt = `あなたはYouTubeマーケティングの専門家です。検索結果データを分析し、日本語で実用的なアドバイスを提供してください。
マークダウン形式で出力してください。各セクションは ## で始めてください。`;

      userPrompt = `キーワード「${keyword}」のYouTube検索結果を分析してください。

検索結果データ:
${JSON.stringify(videoSummaries, null, 2)}

以下の項目を分析してレポートを作成してください:

## 市場概況
- このキーワードの競合状況（チャンネル規模の分布、再生数の傾向）
- 参入しやすさの評価

## バズっている動画の特徴
- 再生倍率が高い動画に共通するタイトル・構成パターン
- 動画の長さの傾向
- 投稿タイミング

## 再生倍率300%超えの動画
- 該当する動画をリストアップし、なぜバズったか分析

## 狙い目キーワード候補（10個）
- 検索結果のタイトル・タグから派生する関連キーワード
- 競合が少なそうなニッチキーワード

## おすすめチャンネルタグ（20個）
- 上位動画の共通タグ + トレンドを踏まえた推奨タグ
- そのままコピーして使える形式

## 動画企画アイデア（5本）
- 各アイデアにタイトル案とサムネイルのテキスト案を含める
- 再生倍率が高くなりそうな根拠も記載

## 改善ポイント
- この市場で成功するための具体的なアドバイス3つ`;
    } else if (analysisType === 'tags') {
      systemPrompt = 'あなたはYouTube SEOの専門家です。最適なチャンネルタグとハッシュタグを提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を提案してください:

## チャンネルタグ（30個）
上位動画の共通タグとトレンドを分析し、このジャンルに最適なタグを30個提案。コピペできる形式で。

## ハッシュタグ（15個）
動画説明文に使えるハッシュタグを15個。#付きで。

## タグ戦略アドバイス
- ビッグキーワードとロングテールの比率
- 避けるべきタグ
- 競合と差別化するためのタグ選定のコツ`;
    } else if (analysisType === 'keywords') {
      systemPrompt = 'あなたはYouTubeキーワード戦略の専門家です。ヒットしやすいキーワードを提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を分析・提案してください:

## ヒットキーワード分析
上位動画のタイトルに頻出するキーワードパターンを分析

## 関連キーワード100選
「${keyword}」に関連する、YouTube検索で使われそうなキーワードを100個提案。
カテゴリ別に整理（初心者向け、悩み系、ハウツー系、比較系、トレンド系など）

## 穴場キーワード（20個）
競合が少ないが需要がありそうなニッチキーワード。
各キーワードに想定される検索意図も記載。

## タイトルテンプレート（10パターン）
再生倍率が高くなりやすいタイトルの型を提案。
「${keyword}」を使った具体的な例文付き。`;
    } else if (analysisType === 'overseas') {
      systemPrompt = 'あなたはグローバルYouTubeトレンドの専門家です。海外のバズ動画を分析し、日本市場への応用を提案してください。マークダウン形式で出力してください。';
      userPrompt = `日本のキーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を分析・提案してください:

## 海外トレンド分析
「${keyword}」に相当する英語キーワードで、海外（主にアメリカ・イギリス）でバズっている動画の特徴や傾向を分析

## 海外バズ動画の企画パターン（10本）
海外で実際にバズっている（または過去にバズった）と推測される動画企画を具体的に提案
- 英語タイトル例
- 日本語に応用したタイトル案
- なぜバズったか（推測）

## 日本未上陸の企画アイデア（5本）
海外では人気だが日本ではまだ少ない動画フォーマットや企画
- 日本市場での成功確率の評価
- アレンジポイント

## グローバルトレンドキーワード（20個）
「${keyword}」ジャンルで世界的に伸びているサブテーマやキーワード

## 海外の成功チャンネルの特徴
このジャンルで成功している海外チャンネルの共通点（投稿頻度、サムネスタイル、動画長など）`;
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
    console.error('YouTube AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
