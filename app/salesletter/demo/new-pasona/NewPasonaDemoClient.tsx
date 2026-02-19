'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { newPasonaTemplate } from '@/constants/templates/salesletter/new-pasona';

const demoSalesLetter: SalesLetter = {
  id: 'demo-new-pasona',
  slug: 'demo-new-pasona',
  title: '新PASONAの法則 デモ',
  content: newPasonaTemplate.content,
  settings: newPasonaTemplate.settings,
  template_id: 'new-pasona',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
