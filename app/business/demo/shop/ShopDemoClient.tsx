'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// 店舗ビジネスデモ（参考: https://makers.tokyo/business/sUUid）
const demoLP: BusinessLP = {
  id: 'demo-shop',
  slug: 'demo-shop',
  title: '地域No.1整骨院｜スマイル整骨院',
  description: '腰痛・肩こり・スポーツ障害でお悩みの方へ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  },
  content: [
    // ヒーロー
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'つらい痛み、\n諦めていませんか？',
        subheadline: '根本から改善する施術で、健康な毎日を取り戻しましょう',
        ctaText: '今すぐ予約する',
        ctaUrl: '#contact',
        backgroundColor: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      },
    },
    // 問題提起
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: 'こんなお悩みありませんか？',
        subtitle: '一つでも当てはまる方はご相談ください',
        items: [
          {
            id: generateBlockId(),
            icon: '😰',
            title: '慢性的な腰痛',
            description: '長時間座っていると腰が痛くなる。朝起きた時の痛みがつらい…',
          },
          {
            id: generateBlockId(),
            icon: '😓',
            title: 'しつこい肩こり',
            description: 'デスクワークで肩がパンパン。頭痛やめまいまで起こる…',
          },
          {
            id: generateBlockId(),
            icon: '🤕',
            title: 'スポーツ障害',
            description: '運動後の痛み、古傷の再発。思いっきりプレーできない…',
          },
        ],
      },
    },
    // 特徴
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '選ばれる5つの理由',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '👨‍⚕️',
            title: '国家資格保有',
            description: '柔道整復師の国家資格を持つプロフェッショナルが施術します',
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '根本改善',
            description: '痛みの原因を徹底的に特定し、根本から改善するアプローチ',
          },
          {
            id: generateBlockId(),
            icon: '📊',
            title: '最新の機器',
            description: '最新の検査・治療機器を完備。科学的な施術で確実な効果を',
          },
          {
            id: generateBlockId(),
            icon: '⏰',
            title: '夜20時まで営業',
            description: '仕事帰りでも通いやすい営業時間。土日祝日も営業中',
          },
          {
            id: generateBlockId(),
            icon: '🚗',
            title: '駐車場完備',
            description: '無料駐車場あり。お車でのご来院も安心です',
          },
        ],
      },
    },
    // お客様の声
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: '田中様',
            role: '40代・会社員',
            comment: '10年以上悩んでいた腰痛が、3ヶ月の施術でほぼ完治しました。もっと早く来れば良かったです。',
          },
          {
            id: generateBlockId(),
            name: '佐藤様',
            role: '30代・主婦',
            comment: '肩こりと頭痛がひどくて薬に頼っていましたが、今は薬なしで過ごせています。感謝しています。',
          },
          {
            id: generateBlockId(),
            name: '山本様',
            role: '20代・学生',
            comment: 'スポーツ障害で悩んでいましたが、丁寧な施術とアドバイスで復帰できました！',
          },
        ],
      },
    },
    // 料金プラン
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: '初回体験',
            price: '¥3,980',
            features: [
              '通常8,000円 → 初回限定50%OFF',
              'カウンセリング',
              '施術（60分）',
              'アフターケア指導',
            ],
            isRecommended: true,
          },
          {
            id: generateBlockId(),
            title: '通常施術',
            price: '¥8,000',
            features: [
              '施術（60分）',
              '状態チェック',
              'ホームケアアドバイス',
            ],
            isRecommended: false,
          },
          {
            id: generateBlockId(),
            title: '回数券（5回）',
            price: '¥35,000',
            features: [
              '1回あたり7,000円',
              '3ヶ月有効',
              '予約優先',
              '特別アドバイス付き',
            ],
            isRecommended: false,
          },
        ],
      },
    },
    // FAQ
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '予約は必要ですか？',
            answer: '予約優先制となっております。お電話またはLINEでご予約ください。当日予約も可能です。',
          },
          {
            id: generateBlockId(),
            question: '保険は使えますか？',
            answer: '各種保険に対応しています。保険証をお持ちください。',
          },
          {
            id: generateBlockId(),
            question: '駐車場はありますか？',
            answer: 'はい、無料駐車場を5台分ご用意しております。',
          },
          {
            id: generateBlockId(),
            question: '何回くらい通えば良いですか？',
            answer: '症状により異なりますが、多くの方が5〜10回程度で改善を実感されています。',
          },
        ],
      },
    },
    // CTA
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '初回限定キャンペーン',
        description: '通常8,000円 → 初回3,980円（50%OFF）',
        buttonText: '今すぐ予約する',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      },
    },
    // 地図
    {
      id: generateBlockId(),
      type: 'google_map',
      data: {
        title: 'アクセス',
        description: '〇〇駅から徒歩5分。駐車場完備',
        address: '東京都渋谷区',
      },
    },
    // お問い合わせフォーム
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: 'ご予約・お問い合わせ',
        buttonText: '予約する',
      },
    },
  ],
};

export default function BusinessShopDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
