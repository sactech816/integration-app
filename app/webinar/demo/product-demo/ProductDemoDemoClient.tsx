'use client';

import React from 'react';
import WebinarViewer from '@/components/webinar/WebinarViewer';
import { WebinarLP, generateBlockId } from '@/lib/types';

const demoLP: WebinarLP = {
  id: 'demo-product-demo',
  slug: 'demo-product-demo',
  title: 'プロダクトデモデモ',
  description: 'TaskFlow Pro - ライブデモウェビナー',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero_fullwidth',
      data: {
        headline: 'TaskFlow Pro のデモを\nライブでお見せします',
        subheadline: '導入を検討中の方向け・完全無料のデモウェビナー',
        ctaText: 'デモに参加する',
        ctaUrl: '#register',
        backgroundColor: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)',
      },
    },
    {
      id: generateBlockId(),
      type: 'youtube',
      data: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    },
    {
      id: generateBlockId(),
      type: 'agenda',
      data: {
        title: 'デモでお見せする内容',
        items: [
          { title: 'ダッシュボード概要', description: '直感的な管理画面でプロジェクトを一元管理' },
          { title: 'タスク管理のデモ', description: 'ドラッグ&ドロップで簡単タスク管理を実演' },
          { title: 'チーム連携機能', description: 'リアルタイム共同編集とコミュニケーション' },
          { title: '導入事例の紹介', description: '実際の企業3社の活用方法をご紹介' },
          { title: 'Q&Aセッション', description: 'ご質問にリアルタイムでお答えします' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: '株式会社テックブリッジ',
            role: 'IT企業（従業員50名）',
            comment: '導入後、プロジェクト管理の工数が40%削減。チーム間のコミュニケーションも劇的に改善しました。',
            imageUrl: '',
          },
          {
            id: generateBlockId(),
            name: '合同会社クリエイト',
            role: 'デザイン事務所（従業員12名）',
            comment: 'UIが直感的で、ITに詳しくないメンバーもすぐに使いこなせました。サポートも手厚いです。',
            imageUrl: '',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '料金プラン',
        text: '・ スタータープラン: 月額 ¥9,800（5名まで）\n・ ビジネスプラン: 月額 ¥29,800（20名まで）\n・ エンタープライズ: お問い合わせ（無制限）\n\n※ すべてのプランに14日間の無料トライアル付き',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'delayed_cta',
      data: {
        title: '',
        buttonText: '14日間の無料トライアルを始める',
        buttonUrl: '#',
        delaySeconds: 20,
        buttonColor: '#2563eb',
        buttonTextColor: '#ffffff',
        borderRadius: 'lg',
        shadow: 'xl',
        animation: 'shimmer',
        size: 'lg',
      },
    },
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: 'お問い合わせ・デモ申込',
        buttonText: '申し込む',
      },
    },
  ],
};

export default function ProductDemoDemoClient() {
  return <WebinarViewer lp={demoLP} />;
}
