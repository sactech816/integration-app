import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import OnboardingModalPublicView from '@/components/onboarding/OnboardingModalPublicView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const revalidate = 300;

async function getModalData(slug: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('onboarding_modals')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getModalData(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!data) {
    return { title: 'オンボーディングモーダル | 集客メーカー' };
  }

  return {
    title: `${data.title} | オンボーディングモーダル`,
    description: data.description || `${data.title} - オンボーディングモーダル by 集客メーカー`,
    openGraph: {
      title: data.title,
      description: data.description || `${data.title} - オンボーディングモーダル`,
      url: `${siteUrl}/onboarding/${slug}`,
      type: 'website',
    },
  };
}

export default async function OnboardingPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getModalData(slug);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">モーダルが見つかりません</h1>
          <p className="text-gray-600">URLが正しいかご確認ください。</p>
          <a href="/" className="mt-4 inline-block text-amber-600 hover:underline font-bold">トップページに戻る</a>
        </div>
      </div>
    );
  }

  return <OnboardingModalPublicView data={data} />;
}
