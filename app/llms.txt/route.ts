import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export async function GET() {
  const content = `# 集客メーカー (Shukaku Maker)
> 診断クイズ・プロフィールLP・ビジネスLP・アンケート・ゲーミフィケーションツールをAIで簡単に作成できる無料の集客プラットフォームです。

## サービス概要
集客メーカーは、個人事業主・フリーランス・中小企業向けの無料マーケティングツールです。AIを活用してコンテンツを自動生成し、SEO対策済みのページを即座に公開できます。

## 主要サービス

### 診断クイズ作成
- URL: ${BASE_URL}/quiz/editor
- 性格診断・タイプ診断・心理テストをAIで自動生成
- SNSでシェアされやすい診断コンテンツを作成
- リード獲得フォーム付き
- デモ: ${BASE_URL}/quiz/demo

### プロフィールLP作成
- URL: ${BASE_URL}/profile/editor
- SNSリンクをまとめたプロフィールページを作成
- lit.link・linktree の代替サービス
- カスタマイズ可能なデザイン
- デモ: ${BASE_URL}/profile/demo

### ビジネスLP作成
- URL: ${BASE_URL}/business/editor
- 商品・サービス紹介のランディングページを作成
- PASONA・AIDMA・QUESTなどのマーケティングフレームワーク対応
- デモ: ${BASE_URL}/business/demo

### アンケート作成
- URL: ${BASE_URL}/survey/editor
- 顧客満足度調査・イベントアンケートを作成
- Googleフォームの代替
- リアルタイム集計・結果分析

### セールスレター作成
- URL: ${BASE_URL}/salesletter/editor
- 商品販売・告知用のセールスレターを作成
- AIによる文章生成支援

### 予約システム
- URL: ${BASE_URL}/booking
- オンライン予約受付・日程調整
- 無料で予約ページを公開

### ゲーミフィケーション
- URL: ${BASE_URL}/gamification
- ガチャ・福引き・スクラッチ・スロット・スタンプラリー
- 来店促進・リピート集客に活用

## ユーザーコンテンツポータル
- URL: ${BASE_URL}/portal
- ユーザーが公開した全コンテンツを閲覧可能
- カテゴリ別フィルタリング・人気ランキング

## よくある質問
- FAQ: ${BASE_URL}/faq

### 集客メーカーは無料ですか？
はい、基本機能はすべて無料でご利用いただけます。有料プランではブランディング削除、カスタムドメインなどの追加機能が利用可能です。

### どんなコンテンツが作れますか？
診断クイズ、プロフィールLP、ビジネスLP、アンケート、セールスレター、予約ページ、ゲーミフィケーション（ガチャ・福引き・スクラッチ等）が作成できます。

### AIで自動生成できますか？
はい、業種やターゲットを入力するだけで、AIがコンテンツを自動生成します。

### SEO対策はされていますか？
はい、すべてのページにメタタグ、構造化データ、OGP画像が自動設定されます。サイトマップやrobots.txtも自動生成されます。

## 料金プラン
- 料金ページ: ${BASE_URL}/pricing

## お問い合わせ
- 問い合わせ: ${BASE_URL}/contact

## 運営情報
- サイト名: 集客メーカー
- URL: ${BASE_URL}
- サービス開始: 2024年
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
