'use client';

import React from 'react';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';
import { oldPasonaTemplate } from '@/constants/templates/salesletter/old-pasona';

const demoSalesLetter: SalesLetter = {
  id: 'demo-old-pasona',
  slug: 'demo-old-pasona',
  title: 'PASONAの法則（旧型）デモ',
  content: oldPasonaTemplate.content,
  settings: oldPasonaTemplate.settings,
  template_id: 'old-pasona',
};

export default function DemoPage() {
  return <SalesLetterViewer salesLetter={demoSalesLetter} />;
}
