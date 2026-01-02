import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'プロフィールLPエディタ',
  description: 'SNSプロフィールに最適なリンクまとめページを作成。ブロック形式の直感的な編集で、おしゃれなプロフィールLPが簡単に作れます。LINE・YouTube埋め込みにも対応。',
  keywords: ['プロフィールLP作成', 'リンクまとめ', 'プロフィールサイト作成', 'lit.link代替', 'SNSプロフィール'],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/profile/editor`,
  },
  openGraph: {
    title: 'プロフィールLPエディタ | 集客メーカー',
    description: 'SNS向けリンクまとめページを簡単作成',
    type: 'website',
    url: `${siteUrl}/profile/editor`,
  },
};

export default function ProfileEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}




















