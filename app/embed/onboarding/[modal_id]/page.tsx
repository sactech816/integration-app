import { createClient } from '@supabase/supabase-js';
import OnboardingModalPublicView from '@/components/onboarding/OnboardingModalPublicView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const revalidate = 300;

export default async function EmbedOnboardingPage({ params }: { params: Promise<{ modal_id: string }> }) {
  const { modal_id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('onboarding_modals')
    .select('*')
    .eq('slug', modal_id)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">モーダルが見つかりません</p>
      </div>
    );
  }

  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, background: 'transparent' }}>
        <OnboardingModalPublicView data={data} />
      </body>
    </html>
  );
}
