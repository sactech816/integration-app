import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import OrderFormViewer from '@/components/order-form/OrderFormViewer';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!supabase) {
    return { title: '申し込みフォーム' };
  }

  const { data: form } = await supabase
    .from('order_forms')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!form) {
    return { title: '申し込みフォームが見つかりません' };
  }

  return generateUGCMetadata({
    title: form.title,
    description: form.description || '',
    type: 'order-form',
    slug,
  });
}

export default async function PublicOrderFormPage({ params }: Props) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  let schemaScripts = null;
  if (supabase) {
    const { data: form } = await supabase
      .from('order_forms')
      .select('title, description, price, currency, created_at, updated_at')
      .eq('slug', slug)
      .single();

    if (form) {
      const productSchema = generateUGCSchema({
        schemaType: 'Product',
        name: form.title,
        description: form.description || `${form.title}の申し込みフォーム`,
        url: `${siteUrl}/order-form/${slug}`,
        datePublished: form.created_at,
        dateModified: form.updated_at,
        additionalProps: form.price > 0 ? {
          offers: {
            '@type': 'Offer',
            price: form.price,
            priceCurrency: (form.currency || 'jpy').toUpperCase(),
            availability: 'https://schema.org/InStock',
          },
        } : undefined,
      });

      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: '申し込みフォームメーカー', href: '/order-form' },
        { name: form.title },
      ], siteUrl);

      schemaScripts = (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        </>
      );
    }
  }

  return (
    <>
      {schemaScripts}
      <OrderFormViewer slug={slug} />
    </>
  );
}
