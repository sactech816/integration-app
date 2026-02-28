import { createClient } from '@supabase/supabase-js';
import SubscribeForm from '@/components/newsletter/SubscribeForm';

async function getListName(listId: string): Promise<string | undefined> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return undefined;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('newsletter_lists')
    .select('name')
    .eq('id', listId)
    .single();

  return data?.name || undefined;
}

export default async function SubscribePage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  const listName = await getListName(listId);

  return <SubscribeForm listId={listId} listName={listName} />;
}
