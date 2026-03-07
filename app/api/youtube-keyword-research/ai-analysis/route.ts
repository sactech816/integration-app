import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai-provider';
import type { YouTubeVideoData } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, results, analysisType } = body as {
      keyword: string;
      results: YouTubeVideoData[];
      analysisType: 'full' | 'tags' | 'keywords' | 'overseas' | 'persona' | 'title-pattern';
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

    } else if (analysisType === 'persona') {
      systemPrompt = 'あなたはYouTubeマーケティングとペルソナ分析の専門家です。動画データから視聴者ターゲット層を詳細に推定してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を詳細に分析・推定してください:

## メインターゲット層

### 基本属性
- 推定年齢層（メイン/サブ）
- 性別比率（推定）
- 推定職業・業種（具体的に3〜5つ）
- 推定年収レンジ
- 居住地域の傾向

### 心理属性
- このジャンルを見る主な目的（3〜5つ）
- 抱えている悩み・課題（具体的に5〜7つ）
- 達成したいゴール（3〜5つ）
- 障壁になっていること（3〜5つ）

### 視聴行動
- 視聴シチュエーション（いつ・どこで・何をしながら見るか）
- 他に見ていそうなジャンル・チャンネル
- 購買意欲の高い商品・サービス
- SNS利用傾向（YouTube以外）

## サブターゲット層（2〜3パターン）
各パターンについて簡潔に属性・目的・悩みを記載

## ペルソナ具体例（2名分）
- 名前（架空）、年齢、職業、家族構成
- 1日のタイムスケジュール（YouTube視聴タイミング含む）
- この検索キーワードに至った背景ストーリー

## ターゲットに刺さるコンテンツ戦略
- タイトルで使うべきキーワード・表現
- サムネイルで訴求すべきポイント
- 動画冒頭で引きつけるフック案（3つ）
- 概要欄に書くべきCTA`;

    } else if (analysisType === 'title-pattern') {
      systemPrompt = 'あなたはYouTubeタイトル最適化の専門家です。上位動画のタイトルを徹底分析し、バズるタイトルのパターンと具体的なテンプレートを提案してください。マークダウン形式で出力してください。';
      userPrompt = `キーワード「${keyword}」の上位動画データ:
${JSON.stringify(videoSummaries, null, 2)}

以下を詳細に分析してください:

## タイトルパターン分類

### 使用されている手法の頻度分析
- 数字を含むタイトルの割合と効果（再生倍率との相関）
- 疑問形タイトルの割合と効果
- 感嘆符・煽り表現の使用状況
- 括弧【】「」の使用パターン
- ネガティブ訴求 vs ポジティブ訴求の比率

### 文字数分析
- 上位動画の平均文字数
- 再生倍率300%超え動画の文字数傾向
- 推奨文字数レンジ

## 高パフォーマンスタイトルの共通点
再生倍率が高い動画のタイトルに共通する要素を5つ以上

## タイトルテンプレート（15パターン）

各テンプレートに以下を含める:
- パターン名（例: 「数字+ベネフィット型」）
- テンプレート構文（例: 「【○○】△△するだけで□□になる方法」）
- 「${keyword}」を使った具体的なタイトル例
- このパターンが効果的な理由
- 推定クリック率の評価（★1〜5）

カテゴリ別に整理:
1. 初心者向け（5パターン）
2. 中級者向け（5パターン）
3. バズ狙い（5パターン）

## NGタイトルパターン
避けるべきタイトルの特徴（3〜5つ）と理由

## A/Bテスト提案
同じ内容の動画で試すべきタイトルバリエーション（3セット）`;

    }

    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 4096,
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
