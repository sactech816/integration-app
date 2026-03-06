import { Metadata } from 'next';
import { thumbnailTemplates } from '@/constants/templates/thumbnail';
import ThumbnailDemoClient from './ThumbnailDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return thumbnailTemplates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const template = thumbnailTemplates.find((t) => t.id === id);
  if (!template) return { title: 'Not Found' };

  const title = `${template.name}サムネイルテンプレートデモ`;
  const description = `${template.description}。集客メーカーのサムネイルテンプレートを体験できます。`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/thumbnail/demo/${id}` },
    openGraph: {
      title: `${title}｜集客メーカー`,
      description,
      url: `${siteUrl}/thumbnail/demo/${id}`,
      images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent(title)}&type=thumbnail`, width: 1200, height: 630 }],
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
  return <ThumbnailDemoClient />;
}
