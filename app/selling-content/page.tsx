import { Metadata } from 'next';
import SellingContentPageClient from './SellingContentPageClient';

export const metadata: Metadata = {
  title: '売れるコンテンツの作り方 | 集客メーカー',
  description: '思わず行動したくなる「売れるコンテンツ」の鉄板ロジック。ターゲット設定、キャッチコピー、CTA設計、心理トリガーを押さえた効果的なコンテンツの作り方を解説。',
  keywords: ['売れるコンテンツ', 'コピーライティング', 'CTA', 'マーケティング', '心理学', 'LP作成'],
  openGraph: {
    title: '売れるコンテンツの作り方 | 集客メーカー',
    description: '思わず行動したくなる「売れるコンテンツ」の鉄板ロジック。心理トリガーを押さえた効果的な作り方。',
    type: 'article',
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '売れるコンテンツの作り方 - 鉄板ロジック9選',
  description: '人が動く心理トリガーを押さえた、効果的なコンテンツの作り方を伝授',
  author: {
    '@type': 'Organization',
    name: '集客メーカー',
  },
  publisher: {
    '@type': 'Organization',
    name: '集客メーカー',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://example.com/selling-content',
  },
};

export default function SellingContentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SellingContentPageClient />
    </>
  );
}















































