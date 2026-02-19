'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { questTemplate } from '@/constants/templates/salesletter/quest';

const demoSalesLetter: SalesLetter = {
  id: 'demo-quest',
  slug: 'demo-quest',
  title: 'QUESTの法則 デモ',
  content: questTemplate.content,
  settings: questTemplate.settings,
  template_id: 'quest',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
