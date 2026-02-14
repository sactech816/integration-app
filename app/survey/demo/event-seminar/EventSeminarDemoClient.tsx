'use client';

import React from 'react';
import SurveyPlayer from '@/components/survey/SurveyPlayer';

// イベント・セミナーアンケートデモ
const demoSurvey = {
  id: 2,
  slug: 'demo-event-seminar',
  title: 'イベント・セミナーアンケート',
  description: 'イベント参加者の満足度と改善点を収集',
  creator_email: 'demo@makers.tokyo',
  questions: [
    {
      id: 'q1',
      type: 'rating' as const,
      text: '本日のセミナー内容にどの程度満足していますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q2',
      type: 'rating' as const,
      text: '講師の説明は分かりやすかったですか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q3',
      type: 'choice' as const,
      text: 'セミナーで最も役立った内容は何ですか？',
      required: true,
      options: ['理論・概念の説明', '具体的な事例紹介', '実践ワーク', '質疑応答', 'その他'],
    },
    {
      id: 'q4',
      type: 'choice' as const,
      text: '今後、このようなセミナーがあれば参加したいですか？',
      required: true,
      options: ['ぜひ参加したい', '内容次第で参加したい', 'どちらとも言えない', 'あまり参加したくない', '参加しない'],
    },
    {
      id: 'q5',
      type: 'text' as const,
      text: '今後取り上げてほしいテーマや改善点があればお聞かせください',
      required: false,
    },
  ],
};

export default function SurveyEventSeminarDemoPage() {
  return <SurveyPlayer survey={demoSurvey} />;
}
