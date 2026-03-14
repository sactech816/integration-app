import { createClient } from '@supabase/supabase-js';
import ConciergeEmbedView from '@/components/concierge/embed/ConciergeEmbedView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const revalidate = 300;

export default async function EmbedConciergePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('concierge_configs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">コンシェルジュが見つかりません</p>
      </div>
    );
  }

  return <ConciergeEmbedView config={data} />;
}
