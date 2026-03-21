import { Metadata } from 'next';
import AgencyPageClient from './AgencyPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '制作会社・Web代理店の方へ｜実績で案件を獲得する無料ツール｜集客メーカー',
  description: '制作会社・Web代理店向け。ポートフォリオLP無料作成・セミナー集客・見積り受付フォームで「実績を見せて案件が来る仕組み」を構築。',
  keywords: [
    '制作会社 集客', 'Web制作 案件獲得', '代理店 集客',
    'ポートフォリオ LP 無料', '制作実績 見せ方', 'Web制作会社 営業',
    'セミナー集客 制作会社', '見積りフォーム 無料', '代理店 案件獲得',
    '集客メーカー', 'LP作成 無料', '制作会社 ブランディング',
  ],
  alternates: { canonical: `${siteUrl}/for/agency` },
  openGraph: {
    title: '制作会社・Web代理店の方へ｜実績で案件を獲得',
    description: 'ポートフォリオLP・セミナー集客・見積りフォームで実績を可視化し、案件獲得を自動化。',
    url: `${siteUrl}/for/agency`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('制作会社・Web代理店の方へ')}&description=${encodeURIComponent('実績で案件を獲得する無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '制作会社・Web代理店の方へ｜実績で案件を獲得',
    description: 'ポートフォリオLP・セミナー集客・見積りフォームを無料で。',
  },
};

export default function AgencyPage() {
  return <AgencyPageClient />;
}
