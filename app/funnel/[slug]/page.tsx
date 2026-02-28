import { redirect } from 'next/navigation';

/**
 * ファネルのエントリーページ — 最初のステップにリダイレクト
 */
export default async function FunnelEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/funnel/${slug}/0`);
}
