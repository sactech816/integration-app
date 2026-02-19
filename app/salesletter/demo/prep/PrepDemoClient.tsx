'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { prepTemplate } from '@/constants/templates/salesletter/prep';

const demoSalesLetter: SalesLetter = {
  id: 'demo-prep',
  slug: 'demo-prep',
  title: 'PREP法 デモ',
  content: prepTemplate.content,
  settings: prepTemplate.settings,
  template_id: 'prep',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
