import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';

// 動的レンダリングを強制（常に最新のデータを取得）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

// 静的パラメータ生成（SSG対応）
export async function generateStaticParams() {
  if (!supabase) {
    return [];
  }

  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('slug')
      .eq('featured_on_top', true)
      .not('slug', 'is', null);

    return profiles?.map((profile) => ({
      slug: profile.slug,
    })) || [];
  } catch (error) {
    console.error('Failed to generate static params for profiles:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!supabase) {
    return { title: 'プロフィール' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, content')
    .eq('slug', slug)
    .single();

  if (!profile) {
    return { title: 'プロフィールが見つかりません' };
  }

  const headerBlock = profile.content?.find((b: { type: string }) => b.type === 'header');
  const name = headerBlock?.data?.name || profile.nickname || 'プロフィール';
  const title = headerBlock?.data?.title || '';
  const avatar = headerBlock?.data?.avatar || null;

  // OGP画像: アバター画像があればそれを使用、なければ動的生成
  const ogImage = avatar || 
    `${siteUrl}/api/og?title=${encodeURIComponent(name)}&description=${encodeURIComponent(title)}&type=profile`;

  return {
    title: name,
    description: title,
    alternates: {
      canonical: `${siteUrl}/profile/${slug}`,
    },
    openGraph: {
      title: name,
      description: title,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: title,
      images: [ogImage],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>設定エラー</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">プロフィールが見つかりません</h1>
          <p className="text-gray-600 mb-8">URLをご確認ください</p>
          <a href="/" className="text-emerald-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  // 構造化データ - ProfilePage
  const headerBlock = profile.content?.find((b: { type: string }) => b.type === 'header');
  const name = headerBlock?.data?.name || profile.nickname || 'プロフィール';
  const title = headerBlock?.data?.title || '';
  const avatar = headerBlock?.data?.avatar || null;

  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: name,
    description: title,
    url: `${siteUrl}/profile/${slug}`,
    mainEntity: {
      '@type': 'Person',
      name: name,
      description: title,
      ...(avatar && { image: avatar }),
    },
  };

  // パンくずリスト構造化データ
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'プロフィール一覧', href: '/portal?tab=profile' },
      { name: name },
    ],
    siteUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProfileViewer profile={profile} />
    </>
  );
}
