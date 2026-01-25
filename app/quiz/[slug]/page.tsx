import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import QuizPlayerWrapper from '@/components/quiz/QuizPlayerWrapper';
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
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('slug')
      .eq('show_in_portal', true)
      .not('slug', 'is', null);

    return quizzes?.map((quiz) => ({
      slug: quiz.slug,
    })) || [];
  } catch (error) {
    console.error('Failed to generate static params for quizzes:', error);
    return [];
  }
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  
  if (!supabase) {
    return {
      title: '診断クイズ',
    };
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('title, description, image_url')
    .eq('slug', slug)
    .single();

  if (!quiz) {
    return {
      title: '診断クイズが見つかりません',
    };
  }

  // OGP画像: コンテンツの画像があればそれを使用、なければ動的生成
  const ogImage = quiz.image_url || 
    `${siteUrl}/api/og?title=${encodeURIComponent(quiz.title)}&type=quiz`;

  return {
    title: quiz.title,
    description: quiz.description,
    alternates: {
      canonical: `${siteUrl}/quiz/${slug}`,
    },
    openGraph: {
      title: quiz.title,
      description: quiz.description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: quiz.title,
      description: quiz.description,
      images: [ogImage],
    },
  };
}

export default async function QuizPage({ params }: Props) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">診断クイズが見つかりません</h1>
          <p className="text-gray-600 mb-8">URLをご確認ください</p>
          <a href="/" className="text-indigo-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  // 構造化データ - Quiz
  const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: quiz.title,
    description: quiz.description,
    url: `${siteUrl}/quiz/${slug}`,
    educationalLevel: 'beginner',
    numberOfQuestions: questions?.length || 0,
    creator: {
      '@type': 'Organization',
      name: '集客メーカー',
      url: siteUrl,
    },
  };

  // パンくずリスト構造化データ
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: '診断クイズ一覧', href: '/portal?tab=quiz' },
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
      <QuizPlayerWrapper quiz={quiz} />
    </>
  );
}
