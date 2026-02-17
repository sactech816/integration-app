import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BookLPDisplay from '@/components/kindle/lp/BookLPDisplay';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { bookId: string };
}

export default async function BookLPPage({ params }: PageProps) {
  const { bookId } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    notFound();
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // LPデータ取得（公開済みのみ）
  const { data: lpData, error: lpError } = await supabase
    .from('kdl_book_lps')
    .select('*')
    .eq('book_id', bookId)
    .eq('status', 'published')
    .single();

  if (lpError || !lpData) {
    notFound();
  }

  // 書籍情報取得
  const { data: bookData } = await supabase
    .from('kdl_books')
    .select('title, subtitle')
    .eq('id', bookId)
    .single();

  const bookTitle = bookData?.title || '書籍タイトル';
  const bookSubtitle = bookData?.subtitle || undefined;

  return (
    <BookLPDisplay
      lpData={{
        hero: lpData.hero as any,
        pain_points: lpData.pain_points as any,
        benefits: lpData.benefits as any,
        chapter_summaries: lpData.chapter_summaries as any,
        faq: lpData.faq as any,
        cta: lpData.cta as any,
      }}
      bookTitle={bookTitle}
      bookSubtitle={bookSubtitle}
    />
  );
}
