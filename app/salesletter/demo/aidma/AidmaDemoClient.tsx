'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { aidmaTemplate } from '@/constants/templates/salesletter/aidma';

const demoSalesLetter: SalesLetter = {
  id: 'demo-aidma',
  slug: 'demo-aidma',
  title: 'AIDMA/AIDCAS デモ',
  content: aidmaTemplate.content,
  settings: aidmaTemplate.settings,
  template_id: 'aidma',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
