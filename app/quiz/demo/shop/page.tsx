'use client';

import React from 'react';
import QuizPlayer from '@/components/quiz/QuizPlayer';

// 店舗向け診断のサンプルデータ
const demoQuiz = {
  id: 0,
  slug: 'shop-demo',
  title: 'あなたの店舗に最適な集客戦略診断',
  description: 'あなたの店舗にぴったりの集客方法を見つけましょう！',
  category: 'ビジネス',
  color: '#10b981',
  mode: 'diagnosis' as const,
  layout: 'card' as const,
  questions: [
    {
      id: 'q1',
      text: 'あなたの店舗の業種は？',
      options: [
        { text: '飲食店（カフェ・レストラン等）', score: { A: 3, B: 0, C: 1, D: 0 } },
        { text: '小売店（アパレル・雑貨等）', score: { A: 0, B: 3, C: 1, D: 0 } },
        { text: 'サービス業（美容・整体等）', score: { A: 1, B: 1, C: 3, D: 0 } },
        { text: '専門店（教室・スクール等）', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q2',
      text: '現在の主なお客様層は？',
      options: [
        { text: '地域の常連客が中心', score: { A: 3, B: 0, C: 1, D: 1 } },
        { text: '通りがかりの新規客が多い', score: { A: 0, B: 3, C: 0, D: 0 } },
        { text: '口コミや紹介で来店', score: { A: 1, B: 0, C: 3, D: 1 } },
        { text: '特定のニーズを持つ顧客', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q3',
      text: '集客で重視したいことは？',
      options: [
        { text: 'リピーター・常連客を増やしたい', score: { A: 3, B: 0, C: 1, D: 0 } },
        { text: '新規客を効率的に集めたい', score: { A: 0, B: 3, C: 0, D: 1 } },
        { text: 'ファンを作り、口コミを広げたい', score: { A: 1, B: 0, C: 3, D: 1 } },
        { text: '専門性を理解してくれる顧客を集めたい', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q4',
      text: 'SNSやWebの活用状況は？',
      options: [
        { text: 'あまり活用できていない', score: { A: 3, B: 1, C: 0, D: 0 } },
        { text: 'Instagram等で商品を発信している', score: { A: 0, B: 3, C: 1, D: 0 } },
        { text: 'SNSで積極的に交流している', score: { A: 1, B: 1, C: 3, D: 0 } },
        { text: 'ブログ等で専門情報を発信している', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
  ],
  results: [
    {
      type: 'A',
      title: '地域密着型集客',
      description: 'あなたの店舗には「地域密着型集客」が最適です！近隣住民との関係構築を重視し、チラシ配布、地域イベント参加、LINE公式アカウントなどで常連客を増やしましょう。ポイントカードやスタンプラリーも効果的です。',
    },
    {
      type: 'B',
      title: 'ビジュアル訴求型集客',
      description: 'あなたの店舗には「ビジュアル訴求型集客」が最適です！Instagram等のSNSで商品やメニューの魅力を視覚的に発信し、新規客を呼び込みましょう。Googleビジネスプロフィールの最適化も重要です。',
    },
    {
      type: 'C',
      title: 'コミュニティ型集客',
      description: 'あなたの店舗には「コミュニティ型集客」が最適です！SNSやイベントを通じて顧客とのつながりを深め、ファンコミュニティを形成しましょう。口コミが自然に広がる仕組みづくりが鍵です。',
    },
    {
      type: 'D',
      title: 'コンテンツ型集客',
      description: 'あなたの店舗には「コンテンツ型集客」が最適です！ブログやYouTubeで専門知識を発信し、あなたの専門性を理解した質の高い顧客を集めましょう。SEO対策も効果的です。',
    },
  ],
};

export default function ShopDemoPage() {
  return <QuizPlayer quiz={demoQuiz} />;
}
