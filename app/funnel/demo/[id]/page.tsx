import { Metadata } from 'next';
import { FUNNEL_TEMPLATES } from '@/constants/templates/funnel';
import FunnelDemoClient from './FunnelDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return FUNNEL_TEMPLATES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const template = FUNNEL_TEMPLATES.find((t) => t.id === id);
  if (!template) return { title: 'Not Found' };

  const title = `${template.name}デモ`;
  const description = `${template.description}。集客メーカーのファネルテンプレートを体験できます。`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/funnel/demo/${id}` },
    openGraph: {
      title: `${title}｜集客メーカー`,
      description,
      url: `${siteUrl}/funnel/demo/${id}`,
      images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent(title)}&type=funnel`, width: 1200, height: 630 }],
      locale: 'ja_JP',
      siteName: '集客メーカー',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title}｜集客メーカー`,
      description,
      creator: '@syukaku_maker',
    },
  };
}

export default function Page() {
  return <FunnelDemoClient />;
}
