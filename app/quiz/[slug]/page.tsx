import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import QuizPlayerWrapper from '@/components/quiz/QuizPlayerWrapper';

interface Props {
  params: Promise<{ slug: string }>;
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  if (!supabase) {
    return {
      title: '診断クイズ',
    };
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!quiz) {
    return {
      title: '診断クイズが見つかりません',
    };
  }

  return {
    title: quiz.title,
    description: quiz.description,
    openGraph: {
      title: quiz.title,
      description: quiz.description,
    },
  };
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;

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

  return <QuizPlayerWrapper quiz={quiz} />;
}
