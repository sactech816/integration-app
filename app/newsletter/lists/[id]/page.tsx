'use client';

import { use } from 'react';
import SubscriberList from '@/components/newsletter/SubscriberList';

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <SubscriberList listId={id} />;
}
