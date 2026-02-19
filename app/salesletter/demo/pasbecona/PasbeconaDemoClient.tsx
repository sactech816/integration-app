'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { pasbeconaTemplate } from '@/constants/templates/salesletter/pasbecona';

const demoSalesLetter: SalesLetter = {
  id: 'demo-pasbecona',
  slug: 'demo-pasbecona',
  title: 'PASBECONAの法則 デモ',
  content: pasbeconaTemplate.content,
  settings: pasbeconaTemplate.settings,
  template_id: 'pasbecona',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
