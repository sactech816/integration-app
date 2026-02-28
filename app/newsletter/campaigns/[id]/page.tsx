'use client';

import { use } from 'react';
import CampaignEditor from '@/components/newsletter/CampaignEditor';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CampaignEditor campaignId={id} />;
}
