'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { aisasTemplate } from '@/constants/templates/salesletter/aisas';

const demoSalesLetter: SalesLetter = {
  id: 'demo-aisas',
  slug: 'demo-aisas',
  title: 'AISAS/AISCEAS デモ',
  content: aisasTemplate.content,
  settings: aisasTemplate.settings,
  template_id: 'aisas',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
