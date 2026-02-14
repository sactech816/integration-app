import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import QuizPlayerWrapper from '@/components/quiz/QuizPlayerWrapper';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';

// ISR: 5分キャッシュ + On-Demand Revalidation
export const revalidate = 300;

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
    return { title: '診断クイズが見つかりません' };
  }

  return generateUGCMetadata({
    title: quiz.title,
    description: quiz.description,
    type: 'quiz',
    slug,
    imageUrl: quiz.image_url,
  });
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

  // 作成者のプラン権限をチェックしてフッター非表示を決定
  const canHideFooter = await shouldHideFooter(quiz.hideFooter, quiz.user_id);
  const quizWithPermission = { ...quiz, hideFooter: canHideFooter };

  // 構造化データ - Quiz
  const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
  const quizSchema = generateUGCSchema({
    schemaType: 'Quiz',
    name: quiz.title,
    description: quiz.description,
    url: `${siteUrl}/quiz/${slug}`,
    datePublished: quiz.created_at,
    dateModified: quiz.updated_at,
    additionalProps: {
      educationalLevel: 'beginner',
      numberOfQuestions: questions?.length || 0,
    },
  });

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
      <QuizPlayerWrapper quiz={quizWithPermission} />
    </>
  );
}
