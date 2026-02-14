'use client';

import React from 'react';
import QuizPlayer from '@/components/quiz/QuizPlayer';

// コンサル向け診断のサンプルデータ
const demoQuiz = {
  id: 0,
  slug: 'consultant-demo',
  title: 'あなたのコンサルティングスタイル診断',
  description: 'あなたのコンサルタントとしての強みと特徴を診断します！',
  category: 'ビジネス',
  color: '#8b5cf6',
  mode: 'diagnosis' as const,
  layout: 'grid' as 'card' | 'chat' | 'pop' | 'grid',
  questions: [
    {
      id: 'q1',
      text: 'クライアントの課題に対するアプローチは？',
      options: [
        { label: 'まずは徹底的に話を聞く', score: { A: 3, B: 0, C: 1, D: 0 } },
        { label: 'データ分析から課題を特定する', score: { A: 0, B: 3, C: 0, D: 1 } },
        { label: '具体的な行動計画を一緒に作る', score: { A: 1, B: 0, C: 3, D: 1 } },
        { label: 'ベストプラクティスを提示する', score: { A: 0, B: 1, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q2',
      text: 'あなたの専門分野は？',
      options: [
        { label: '組織開発・人材育成', score: { A: 3, B: 0, C: 1, D: 0 } },
        { label: '経営戦略・事業計画', score: { A: 0, B: 3, C: 0, D: 1 } },
        { label: 'マーケティング・集客支援', score: { A: 0, B: 1, C: 3, D: 1 } },
        { label: '業務改善・DX推進', score: { A: 0, B: 1, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q3',
      text: 'コンサルティングで最も重視することは？',
      options: [
        { label: 'クライアントとの信頼関係', score: { A: 3, B: 0, C: 1, D: 0 } },
        { label: '論理的で説得力のある提案', score: { A: 0, B: 3, C: 0, D: 1 } },
        { label: '実行可能で成果の出る施策', score: { A: 1, B: 0, C: 3, D: 1 } },
        { label: '業界の最新トレンドと知見', score: { A: 0, B: 1, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q4',
      text: '理想的なコンサルティングのゴールは？',
      options: [
        { label: 'クライアントが自走できるようになる', score: { A: 3, B: 0, C: 1, D: 0 } },
        { label: '明確な経営戦略が確立される', score: { A: 0, B: 3, C: 0, D: 1 } },
        { label: '売上・利益が目に見えて向上する', score: { A: 0, B: 1, C: 3, D: 0 } },
        { label: '業界をリードする仕組みができる', score: { A: 0, B: 1, C: 0, D: 3 } },
      ],
    },
  ],
  results: [
    {
      type: 'A',
      title: 'コーチング型コンサルタント',
      description: 'あなたは「コーチング型コンサルタント」です！クライアントとの信頼関係を大切にし、対話を通じて本質的な課題を引き出します。クライアントの自走力を高めることに強みがあります。',
    },
    {
      type: 'B',
      title: '戦略型コンサルタント',
      description: 'あなたは「戦略型コンサルタント」です！データ分析と論理的思考で、経営戦略や事業計画を構築することが得意です。説得力のある提案で経営層の意思決定を支援します。',
    },
    {
      type: 'C',
      title: '実行支援型コンサルタント',
      description: 'あなたは「実行支援型コンサルタント」です！具体的な施策立案と実行支援により、確実に成果を出すことが得意です。マーケティングや集客など、実践的な支援で売上向上に貢献します。',
    },
    {
      type: 'D',
      title: '専門特化型コンサルタント',
      description: 'あなたは「専門特化型コンサルタント」です！特定分野の深い知見と最新トレンドを活かし、業界をリードする仕組みづくりを支援します。DXや業務改善など、専門性の高いソリューションを提供します。',
    },
  ],
};

export default function ConsultantDemoPage() {
  return <QuizPlayer quiz={demoQuiz} />;
}
