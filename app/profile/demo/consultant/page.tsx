'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

// コンサルタント・士業デモ（8ブロック）
const demoProfile: Profile = {
  id: 'demo-consultant',
  slug: 'demo-consultant',
  nickname: 'コンサルタント・士業デモ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      animated: false,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        name: '田中 太郎',
        title: '経営コンサルタント / 中小企業診断士',
        category: 'business',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'ご挨拶',
        text: '中小企業の経営課題を解決し、持続的な成長をサポートする経営コンサルタントです。\n\n20年以上の実務経験と、100社以上の支援実績を活かし、実践的なアドバイスを提供いたします。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '専門分野',
        text: '【経営戦略立案】\n事業計画策定、市場分析、競争戦略\n\n【業務改善・生産性向上】\n業務プロセス見直し、コスト削減\n\n【組織開発】\n人事制度設計、チームビルディング',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '支援実績',
        text: '✅ 支援企業数：100社以上\n✅ 売上向上率：平均30%\n✅ 業務効率化：平均40%改善\n✅ 顧客満足度：98%',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '経歴・資格',
        text: '【経歴】\n・大手製造業にて20年間勤務\n・経営企画部長、事業部長を歴任\n・2015年に独立、コンサルティング開始\n\n【資格】\n・中小企業診断士\n・MBA（経営学修士）\n・プロジェクトマネージャー',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'お客様の声',
        text: '「的確なアドバイスで売上が1年で1.5倍になりました」\n- 製造業 A社長\n\n「組織改革により、社員のモチベーションが大きく向上しました」\n- サービス業 B社長',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'コンサルティングの流れ',
        text: '1. 無料相談（60分）\n2. 現状分析・課題抽出\n3. 改善提案書の作成\n4. 実行支援・モニタリング\n5. 成果の検証',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '📝 無料相談を申し込む', url: 'https://example.com/booking', style: 'primary' },
          { label: '📧 お問い合わせ', url: 'https://example.com/contact', style: '' },
          { label: '📄 資料請求', url: 'https://example.com/materials', style: '' },
        ],
      },
    },
  ],
};

export default function ProfileConsultantDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
