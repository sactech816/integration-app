import { Metadata } from 'next';
import { ORDER_FORM_TEMPLATES } from '@/constants/templates/order-form';
import OrderFormDemoClient from './OrderFormDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return ORDER_FORM_TEMPLATES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const template = ORDER_FORM_TEMPLATES.find((t) => t.id === id);
  if (!template) return { title: 'Not Found' };

  const title = `${template.name}デモ`;
  const description = `${template.description}。集客メーカーの申し込みフォームテンプレートを体験できます。`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/order-form/demo/${id}` },
    openGraph: {
      title: `${title}｜集客メーカー`,
      description,
      url: `${siteUrl}/order-form/demo/${id}`,
      images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent(title)}&type=order-form`, width: 1200, height: 630 }],
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
  return <OrderFormDemoClient />;
}
