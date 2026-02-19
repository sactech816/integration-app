'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { beafTemplate } from '@/constants/templates/salesletter/beaf';

const demoSalesLetter: SalesLetter = {
  id: 'demo-beaf',
  slug: 'demo-beaf',
  title: 'BEAFの法則 デモ',
  content: beafTemplate.content,
  settings: beafTemplate.settings,
  template_id: 'beaf',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
