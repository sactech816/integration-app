import { Metadata } from 'next';
import HowToPageClient from './HowToPageClient';

export const metadata: Metadata = {
  title: '使い方・機能一覧 | 集客メーカー',
  description: '集客メーカーの使い方ガイド。診断クイズ・プロフィールLP・ビジネスLPの作成方法、機能一覧、料金プランをご紹介します。AI自動生成で簡単にプロ品質のコンテンツが作れます。',
  keywords: ['集客メーカー', '使い方', '機能一覧', '診断クイズ作成', 'LP作成', 'AI自動生成'],
  openGraph: {
    title: '使い方・機能一覧 | 集客メーカー',
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。使い方ガイドと機能一覧。',
    type: 'website',
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '集客メーカーの使い方',
  description: '診断クイズ・プロフィールLP・ビジネスLPの作成方法をステップバイステップで解説',
  step: [
    {
      '@type': 'HowToStep',
      name: 'コンテンツタイプを選択',
      text: '診断クイズ、プロフィールLP、ビジネスLPから作成するコンテンツを選びます',
    },
    {
      '@type': 'HowToStep',
      name: 'AI自動生成またはテンプレート選択',
      text: 'テーマを入力してAI自動生成、またはテンプレートから選択して作成開始',
    },
    {
      '@type': 'HowToStep',
      name: 'カスタマイズ',
      text: 'エディタでデザイン、コンテンツ、CTAボタンなどをカスタマイズ',
    },
    {
      '@type': 'HowToStep',
      name: '公開・シェア',
      text: '保存するとURLが自動発行。SNSでシェアして集客開始',
    },
  ],
};

export default function HowToPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HowToPageClient />
    </>
  );
}















































