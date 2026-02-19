import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import RelatedContent from '@/components/shared/RelatedContent';
import { SalesLetter } from '@/lib/types';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';

interface Props {
  params: Promise<{ slug: string }>;
}

// サーバー用Supabaseクライアント作成
async function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const supabase = await getSupabase();
  if (!supabase) return { title: 'エラー' };
  
  const { data } = await supabase
    .from('sales_letters')
    .select('title, settings')
    .eq('slug', slug)
    .single();

  if (!data) {
    return { title: 'ページが見つかりません' };
  }

  const title = data.title || 'セールスレター';

  return generateUGCMetadata({
    title,
    description: `${title}のページです。`,
    type: 'salesletter',
    slug,
  });
}

export default async function SalesLetterShortUrlPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getSupabase();
  if (!supabase) notFound();

  // データ取得
  const { data: salesLetter, error } = await supabase
    .from('sales_letters')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !salesLetter) {
    notFound();
  }

  // 作成者のプラン権限をチェックしてフッター非表示を決定
  const canHideFooter = await shouldHideFooter(
    salesLetter.settings?.hideFooter,
    salesLetter.user_id
  );
  const canHideRelated = await shouldHideFooter(
    salesLetter.settings?.hideRelatedContent,
    salesLetter.user_id
  );

  // 権限チェック結果を反映
  const salesLetterWithPermission = {
    ...salesLetter,
    settings: { ...salesLetter.settings, hideFooter: canHideFooter }
  } as SalesLetter;

  // 閲覧数インクリメント（非同期で実行）
  supabase.rpc('increment_sales_letter_views', { letter_slug: slug });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  // 構造化データ - Article
  const articleSchema = generateUGCSchema({
    schemaType: 'Article',
    name: salesLetter.title,
    description: `${salesLetter.title}のページです。`,
    url: `${siteUrl}/s/${slug}`,
    datePublished: salesLetter.created_at,
    dateModified: salesLetter.updated_at,
  });

  // パンくずリスト構造化データ
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'セールスレター', href: '/portal' },
      { name: salesLetter.title },
    ],
    siteUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SalesLetterViewer salesLetter={salesLetterWithPermission} />
      <RelatedContent contentType="salesletter" currentSlug={slug} hide={canHideRelated} />
    </>
  );
}
