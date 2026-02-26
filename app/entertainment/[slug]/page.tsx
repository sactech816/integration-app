import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';
import EntertainmentPlayerWrapper from '@/components/entertainment/EntertainmentPlayerWrapper';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!supabase) return [];

  try {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('slug')
      .eq('quiz_type', 'entertainment')
      .eq('show_in_portal', true)
      .not('slug', 'is', null);

    return quizzes?.map((quiz) => ({ slug: quiz.slug })) || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!supabase) {
    return { title: 'エンタメ診断' };
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('title, description, image_url, entertainment_meta')
    .eq('slug', slug)
    .single();

  if (!quiz) {
    return { title: 'エンタメ診断が見つかりません' };
  }

  const ogImageUrl = `${siteUrl}/api/entertainment/og?quiz=${slug}&title=${encodeURIComponent(quiz.title)}`;

  return {
    title: `${quiz.title} | エンタメ診断メーカー`,
    description: quiz.description || '楽しいエンタメ診断に挑戦しよう！',
    openGraph: {
      title: quiz.title,
      description: quiz.description || '楽しいエンタメ診断に挑戦しよう！',
      url: `${siteUrl}/entertainment/${slug}`,
      images: [
        {
          url: quiz.image_url || ogImageUrl,
          width: 1200,
          height: 630,
          alt: quiz.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: quiz.title,
      description: quiz.description || '楽しいエンタメ診断に挑戦しよう！',
      images: [quiz.image_url || ogImageUrl],
    },
  };
}

export default async function EntertainmentPage({ params }: Props) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>設定エラー</p>
      </div>
    );
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エンタメ診断が見つかりません</h1>
          <p className="text-gray-600 mb-8">URLをご確認ください</p>
          <a href="/" className="text-pink-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  const canHideFooter = await shouldHideFooter(quiz.hideFooter, quiz.user_id);
  const quizWithPermission = { ...quiz, hideFooter: canHideFooter };

  const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
  const quizSchema = generateUGCSchema({
    schemaType: 'Quiz',
    name: quiz.title,
    description: quiz.description,
    url: `${siteUrl}/entertainment/${slug}`,
    datePublished: quiz.created_at,
    dateModified: quiz.updated_at,
    additionalProps: {
      educationalLevel: 'beginner',
      numberOfQuestions: questions?.length || 0,
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'エンタメ診断一覧', href: '/portal?tab=entertainment_quiz' },
      { name: quiz.title },
    ],
    siteUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <EntertainmentPlayerWrapper quiz={quizWithPermission} />
    </>
  );
}
