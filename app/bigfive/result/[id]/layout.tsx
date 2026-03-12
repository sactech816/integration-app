import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  const defaults: Metadata = {
    title: 'Big Five 性格診断結果 | makers.tokyo',
    description: '科学的なBig Five理論に基づく性格診断の結果です。5つの性格特性と16パーソナリティタイプを分析しました。',
    openGraph: {
      title: 'Big Five 性格診断結果',
      description: '科学的なBig Five理論に基づく性格診断の結果を見てみましょう。',
      url: `${siteUrl}/bigfive/result/${id}`,
      siteName: 'makers.tokyo',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Big Five 性格診断結果',
      description: '科学的なBig Five理論に基づく性格診断。あなたも無料で試してみませんか？',
    },
  };

  try {
    const supabase = getServiceClient();
    if (!supabase) return defaults;

    const { data } = await supabase
      .from('bigfive_results')
      .select('mbti_code, openness, conscientiousness, extraversion, agreeableness, neuroticism, is_public, test_type')
      .eq('id', id)
      .single();

    if (!data || !data.is_public) return defaults;

    const mbti = data.mbti_code || '????';
    const testLabel = data.test_type === 'detailed' ? '詳細診断' : data.test_type === 'full' ? '本格診断' : '簡易診断';
    const title = `${mbti}タイプ — Big Five 性格診断結果`;
    const desc = `${testLabel}の結果: 開放性${data.openness}% / 誠実性${data.conscientiousness}% / 外向性${data.extraversion}% / 協調性${data.agreeableness}% / 神経症傾向${data.neuroticism}%。あなたも無料で診断してみませんか？`;

    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        url: `${siteUrl}/bigfive/result/${id}`,
        siteName: 'makers.tokyo',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
      },
    };
  } catch {
    return defaults;
  }
}

export default function BigFiveResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
