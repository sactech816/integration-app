'use client';

import React from 'react';
import QuizPlayer from '@/components/quiz/QuizPlayer';

// 講師向け診断のサンプルデータ
const demoQuiz = {
  id: 0,
  slug: 'teacher-demo',
  title: 'あなたの講師タイプ診断',
  description: 'あなたの講師としての強みとスタイルを診断します！',
  category: '自己分析',
  color: '#3b82f6',
  mode: 'diagnosis' as const,
  layout: 'card' as const,
  questions: [
    {
      id: 'q1',
      text: '受講生との接し方で大切にしていることは？',
      options: [
        { text: '一人ひとりに寄り添った個別サポート', score: { A: 3, B: 0, C: 1, D: 0 } },
        { text: '論理的で分かりやすい説明', score: { A: 0, B: 3, C: 1, D: 1 } },
        { text: '楽しく盛り上げながら学ぶ雰囲気づくり', score: { A: 1, B: 0, C: 3, D: 1 } },
        { text: '実践的な課題で成長を促す', score: { A: 0, B: 1, C: 0, D: 3 } },
      ],
    },
    {
      id: 'q2',
      text: '講座の進め方で得意なのは？',
      options: [
        { text: '個別相談やカウンセリング', score: { A: 3, B: 0, C: 0, D: 1 } },
        { text: '体系的なカリキュラム設計と講義', score: { A: 0, B: 3, C: 0, D: 1 } },
        { text: 'ワークショップや参加型の学び', score: { A: 1, B: 0, C: 3, D: 1 } },
        { text: '実践課題とフィードバック', score: { A: 1, B: 1, C: 0, D: 3 } },
      ],
    },
    {
      id: 'q3',
      text: '受講生に提供したい最大の価値は？',
      options: [
        { text: '心の支えとなり、自信を持たせる', score: { A: 3, B: 0, C: 1, D: 0 } },
        { text: '確かな知識とスキルの習得', score: { A: 0, B: 3, C: 0, D: 1 } },
        { text: '学ぶ楽しさと新しい発見', score: { A: 1, B: 0, C: 3, D: 0 } },
        { text: '実践力と問題解決能力', score: { A: 0, B: 1, C: 0, D: 3 } },
      ],
    },
    {
      id: 'q4',
      text: 'あなたの講師としての強みは？',
      options: [
        { text: '共感力と傾聴力', score: { A: 3, B: 0, C: 1, D: 0 } },
        { text: '専門知識と説明力', score: { A: 0, B: 3, C: 0, D: 1 } },
        { text: 'コミュニケーション力と場づくり', score: { A: 1, B: 0, C: 3, D: 0 } },
        { text: '実践経験と的確なアドバイス', score: { A: 0, B: 1, C: 0, D: 3 } },
      ],
    },
  ],
  results: [
    {
      type: 'A',
      title: 'コーチ型講師',
      description: 'あなたは「コーチ型講師」です！一人ひとりに寄り添い、心の支えとなりながら成長をサポートすることが得意です。個別相談やカウンセリングを通じて、受講生の可能性を引き出すことができます。',
    },
    {
      type: 'B',
      title: 'ティーチャー型講師',
      description: 'あなたは「ティーチャー型講師」です！体系的な知識を分かりやすく伝えることが得意です。論理的で丁寧な説明により、受講生に確かなスキルを身につけてもらうことができます。',
    },
    {
      type: 'C',
      title: 'ファシリテーター型講師',
      description: 'あなたは「ファシリテーター型講師」です！参加型の学びの場を作り、楽しみながら学ぶ雰囲気を作ることが得意です。受講生同士の交流を促し、新しい発見を生み出すことができます。',
    },
    {
      type: 'D',
      title: 'トレーナー型講師',
      description: 'あなたは「トレーナー型講師」です！実践的な課題を通じて、受講生の問題解決能力を鍛えることが得意です。的確なフィードバックにより、実践力を高めることができます。',
    },
  ],
};

export default function TeacherDemoPage() {
  return <QuizPlayer quiz={demoQuiz} />;
}
