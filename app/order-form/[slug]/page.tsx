'use client';

import { use } from 'react';
import OrderFormViewer from '@/components/order-form/OrderFormViewer';

export default function PublicOrderFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <OrderFormViewer slug={slug} />;
}
