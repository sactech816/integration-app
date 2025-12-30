import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import BusinessViewer from '@/components/business/BusinessViewer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!supabase) {
    return { title: 'ビジネスLP' };
  }

  const { data: lp } = await supabase
    .from('business_projects')
    .select('settings')
    .eq('slug', slug)
    .single();

  if (!lp) {
    return { title: 'ページが見つかりません' };
  }

  const title = lp.settings?.title || 'ビジネスLP';
  const description = lp.settings?.description || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>設定エラー</p>
      </div>
    );
  }

  const { data: lp } = await supabase
    .from('business_projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!lp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ページが見つかりません</h1>
          <p className="text-gray-600 mb-8">URLをご確認ください</p>
          <a href="/" className="text-amber-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  // business_projectsのデータをBusinessLPの形式に変換
  // 後方互換性: themeが直接カラムにある場合とsettings内にある場合の両方をサポート
  const theme = lp.theme || lp.settings?.theme;
  
  const businessLP = {
    id: lp.id,
    slug: lp.slug,
    title: lp.settings?.title || 'ビジネスLP',
    description: lp.settings?.description || '',
    content: lp.content || [],
    settings: {
      ...lp.settings,
      theme: theme, // themeを確実に含める
    },
    user_id: lp.user_id,
    created_at: lp.created_at,
    updated_at: lp.updated_at,
  };

  return <BusinessViewer lp={businessLP} />;
}
