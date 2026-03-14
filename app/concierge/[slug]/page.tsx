import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ConciergeEmbedView from '@/components/concierge/embed/ConciergeEmbedView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const revalidate = 300;

async function getConciergeData(slug: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('concierge_configs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getConciergeData(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!data) {
    return { title: 'AIコンシェルジュ | 集客メーカー' };
  }

  return {
    title: `${data.name} | AIコンシェルジュ`,
    description: `${data.name} - AIコンシェルジュ by 集客メーカー`,
    openGraph: {
      title: data.name,
      description: `${data.name} - AIコンシェルジュ`,
      url: `${siteUrl}/concierge/${slug}`,
      type: 'website',
    },
  };
}

export default async function ConciergePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getConciergeData(slug);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">コンシェルジュが見つかりません</h1>
          <p className="text-gray-600">URLが正しいかご確認ください。</p>
          <a href="/" className="mt-4 inline-block text-teal-600 hover:underline font-bold">トップページに戻る</a>
        </div>
      </div>
    );
  }

  return <ConciergeEmbedView config={data} />;
}
