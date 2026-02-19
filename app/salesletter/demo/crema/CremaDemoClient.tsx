'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { cremaTemplate } from '@/constants/templates/salesletter/crema';

const demoSalesLetter: SalesLetter = {
  id: 'demo-crema',
  slug: 'demo-crema',
  title: 'CREMAの法則 デモ',
  content: cremaTemplate.content,
  settings: cremaTemplate.settings,
  template_id: 'crema',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
