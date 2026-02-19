import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'サムネイルメーカー | AIでサムネイル画像を簡単作成 - 集客メーカー',
  description: 'YouTube、Instagram、X/Twitter用のサムネイル画像をAIが自動生成。テンプレートを選んでテキストを入力するだけ。生成後のAI編集機能でプロ級の仕上がりに。',
  keywords: ['サムネイル', 'サムネ', 'AI', '画像生成', 'YouTube', 'Instagram', 'Twitter', 'SNS', '集客メーカー'],
  openGraph: {
    title: 'サムネイルメーカー | AIでサムネイル画像を簡単作成',
    description: 'テンプレートを選んでテキストを入力するだけ。AIがプロ級のサムネイルを自動生成します。',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'サムネイルメーカー',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  description: 'AIを使ってYouTube・SNS向けサムネイル画像を自動生成するツール',
  featureList: [
    'AIによるサムネイル自動生成',
    'YouTube・Instagram・X対応',
    '生成後のAI編集機能',
    'テンプレートから簡単作成',
    'ワンクリックダウンロード',
  ],
};

export default function ThumbnailEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {children}
    </>
  );
}
