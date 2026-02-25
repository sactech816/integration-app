import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BookLPDisplay from '@/components/kindle/lp/BookLPDisplay';
import type { ThemeKey } from '@/components/kindle/lp/BookLPDisplay';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { bookId: string };
  searchParams: { preview?: string };
}

async function getLPData(bookId: string, allowDraft: boolean = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let query = supabase
    .from('kdl_book_lps')
    .select('*')
    .eq('book_id', bookId);

  // プレビューモードでなければ公開済みのみ表示
  if (!allowDraft) {
    query = query.eq('status', 'published');
  }

  const { data: lpData } = await query.single();

  if (!lpData) return null;

  const { data: bookData } = await supabase
    .from('kdl_books')
    .select('title, subtitle')
    .eq('id', bookId)
    .single();

  return { lpData, bookData };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const isPreview = searchParams?.preview === 'true';
  const result = await getLPData(params.bookId, isPreview);
  if (!result) return { title: '書籍LP' };

  const { lpData, bookData } = result;
  const hero = lpData.hero as any;
  const title = hero?.catchcopy || bookData?.title || '書籍LP';
  const description = hero?.description || bookData?.subtitle || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BookLPPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams?.preview === 'true';
  const result = await getLPData(params.bookId, isPreview);
  if (!result) notFound();

  const { lpData, bookData } = result;
  const bookTitle = bookData?.title || '書籍タイトル';
  const bookSubtitle = bookData?.subtitle || undefined;

  return (
    <BookLPDisplay
      lpData={{
        hero: lpData.hero as any,
        pain_points: lpData.pain_points as any,
        author_profile: lpData.author_profile as any,
        benefits: lpData.benefits as any,
        key_takeaways: lpData.key_takeaways as any,
        target_readers: lpData.target_readers as any,
        transformation: lpData.transformation as any,
        chapter_summaries: lpData.chapter_summaries as any,
        social_proof: lpData.social_proof as any,
        bonus: lpData.bonus as any,
        faq: lpData.faq as any,
        closing_message: lpData.closing_message as any,
        cta: lpData.cta as any,
      }}
      bookTitle={bookTitle}
      bookSubtitle={bookSubtitle}
      themeColor={(lpData.theme_color as ThemeKey) || 'orange'}
      sectionVisibility={(lpData.section_visibility as any) || {}}
      coverImageUrl={lpData.cover_image_url || undefined}
    />
  );
}
