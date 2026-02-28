'use client';

import { use } from 'react';
import FunnelEditor from '@/components/funnel/FunnelEditor';

export default function EditFunnelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FunnelEditor funnelId={id} />;
}
