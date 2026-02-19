'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { sdsTemplate } from '@/constants/templates/salesletter/sds';

const demoSalesLetter: SalesLetter = {
  id: 'demo-sds',
  slug: 'demo-sds',
  title: 'SDS法 デモ',
  content: sdsTemplate.content,
  settings: sdsTemplate.settings,
  template_id: 'sds',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
