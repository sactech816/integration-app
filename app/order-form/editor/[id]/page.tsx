'use client';

import { use } from 'react';
import OrderFormEditor from '@/components/order-form/OrderFormEditor';

export default function EditOrderFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderFormEditor formId={id} />;
}
