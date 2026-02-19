'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP } from '@/lib/types';
import { coachTemplate } from '@/constants/templates/business/coach';

const demoLP: BusinessLP = {
  id: 'demo-coach',
  slug: 'demo-coach',
  title: 'キャリアコーチング｜理想の人生を実現',
  description: 'コーチ・講師向けビジネスLP',
  settings: {
    theme: coachTemplate.theme,
  },
  content: coachTemplate.blocks,
};

export default function BusinessDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
