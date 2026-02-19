'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP } from '@/lib/types';
import { freelanceTemplate } from '@/constants/templates/business/freelance';

const demoLP: BusinessLP = {
  id: 'demo-freelance',
  slug: 'demo-freelance',
  title: 'Webデザイナー｜フリーランスポートフォリオ',
  description: 'フリーランス向けビジネスLP',
  settings: {
    theme: freelanceTemplate.theme,
  },
  content: freelanceTemplate.blocks,
};

export default function BusinessDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
