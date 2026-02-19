'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP } from '@/lib/types';
import { consultantTemplate } from '@/constants/templates/business/consultant';

const demoLP: BusinessLP = {
  id: 'demo-consultant',
  slug: 'demo-consultant',
  title: '経営コンサルティング｜ビジネス成長支援',
  description: 'コンサルタント・士業向けビジネスLP',
  settings: {
    theme: consultantTemplate.theme,
  },
  content: consultantTemplate.blocks,
};

export default function BusinessDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
