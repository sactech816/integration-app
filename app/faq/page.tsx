import { Metadata } from 'next';
import FaqPageClient from './FaqPageClient';

export const metadata: Metadata = {
  title: 'よくある質問 | 集客メーカー',
  description: '集客メーカーに関するよくある質問と回答。料金、機能、使い方、Pro機能、SEO対策などについてお答えします。',
  keywords: ['集客メーカー', 'FAQ', 'よくある質問', '料金', '無料', 'Pro機能'],
  openGraph: {
    title: 'よくある質問 | 集客メーカー',
    description: '集客メーカーのFAQ。料金、機能、使い方などよくある質問にお答えします。',
    type: 'website',
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '無料で使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、診断クイズ・プロフィールLP・ビジネスLPの作成・公開の基本機能はすべて無料でご利用いただけます。AI自動生成、テンプレート、プレビュー、アクセス解析など、すべて無料です。',
      },
    },
    {
      '@type': 'Question',
      name: '商用利用は可能ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '可能です。作成したコンテンツは、ご自身のビジネス（SNS拡散、集客、リード獲得、サービス紹介）で自由にご活用ください。',
      },
    },
    {
      '@type': 'Question',
      name: 'Pro機能（開発支援）とは？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'コンテンツごとに任意の金額（500円〜）を開発支援いただくことで、「HTMLダウンロード」「埋め込みコード発行」「収集したメールアドレスのCSVダウンロード」機能が開放されます。',
      },
    },
    {
      '@type': 'Question',
      name: 'SEO対策はされていますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、構造化データ、メタタグ、適切なタイトル設定など、基本的なSEO対策は実装済みです。AI検索（ChatGPT等）からの流入も考慮した設計になっています。',
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqPageClient />
    </>
  );
}
















































