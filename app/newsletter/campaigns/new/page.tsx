'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignEditor from '@/components/newsletter/CampaignEditor';
import { Loader2 } from 'lucide-react';

function NewCampaignContent() {
  const searchParams = useSearchParams();
  const listId = searchParams.get('listId') || undefined;

  return <CampaignEditor defaultListId={listId} />;
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
      <NewCampaignContent />
    </Suspense>
  );
}
