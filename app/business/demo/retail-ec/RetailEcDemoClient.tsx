'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP } from '@/lib/types';
import { retailEcTemplate } from '@/constants/templates/business/retail-ec';

const demoLP: BusinessLP = {
  id: 'demo-retail-ec',
  slug: 'demo-retail-ec',
  title: 'ハンドメイドアクセサリー｜LUNA',
  description: '物販・EC向けビジネスLP',
  settings: {
    theme: retailEcTemplate.theme,
  },
  content: retailEcTemplate.blocks,
};

export default function BusinessDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
