import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

// 旧URL /salesletter/[slug] から新URL /s/[slug] へ永続リダイレクト
export default async function SalesLetterRedirectPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/s/${slug}`);
}
