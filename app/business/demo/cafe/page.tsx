'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// カフェ・飲食店デモ（参考: https://makers.tokyo/business/wYV5n）
const demoLP: BusinessLP = {
  id: 'demo-cafe',
  slug: 'demo-cafe',
  title: 'カフェ ソレイユ｜自家焙煎コーヒーと手作りスイーツ',
  description: '心も体も温まる、くつろぎのカフェ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    },
  },
  content: [
    // ヒーロー
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'ゆったりとした時間を、\n美味しいコーヒーとともに',
        subheadline: '自家焙煎のコーヒーと手作りスイーツが自慢の小さなカフェです',
        ctaText: 'メニューを見る',
        ctaUrl: '#menu',
        backgroundColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },
    },
    // 問題提起
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: 'こんな時にぜひお越しください',
        subtitle: 'あなたの「ほっとする時間」をお手伝いします',
        items: [
          {
            id: generateBlockId(),
            icon: '☕',
            title: '美味しいコーヒーが飲みたい',
            description: '本格的な自家焙煎コーヒー。豆の選定から焙煎まで、こだわり抜いた一杯を',
          },
          {
            id: generateBlockId(),
            icon: '📚',
            title: '静かに過ごしたい',
            description: '落ち着いた雰囲気の店内。読書や作業に最適な空間です',
          },
          {
            id: generateBlockId(),
            icon: '🍰',
            title: '甘いものが食べたい',
            description: '毎日手作りの日替わりケーキ。地元食材を使った季節のスイーツ',
          },
        ],
      },
    },
    // 特徴
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '当店のこだわり',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '☕',
            title: '自家焙煎コーヒー',
            description: '新鮮な豆を店内で焙煎。香り高い本格コーヒーをお楽しみいただけます',
          },
          {
            id: generateBlockId(),
            icon: '🍰',
            title: '手作りスイーツ',
            description: '地元食材を使用した日替わりケーキ。季節ごとの旬の味をお届けします',
          },
          {
            id: generateBlockId(),
            icon: '🌿',
            title: '居心地の良い空間',
            description: 'ゆったりとしたソファ席。一人でもグループでもくつろげます',
          },
          {
            id: generateBlockId(),
            icon: '📶',
            title: 'Wi-Fi・電源完備',
            description: 'フリーWi-Fiと電源あり。作業や勉強にも最適な環境です',
          },
          {
            id: generateBlockId(),
            icon: '🌱',
            title: 'オーガニック素材',
            description: '可能な限り有機栽培の食材を使用。体に優しいメニューです',
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
            name: '山田様',
            role: '30代・フリーランス',
            comment: '作業するのに最適な環境です。コーヒーも美味しく、週3で通っています。',
          },
          {
            id: generateBlockId(),
            name: '鈴木様',
            role: '40代・主婦',
            comment: 'ケーキが絶品！友人とのおしゃべりに、いつも利用させていただいています。',
          },
          {
            id: generateBlockId(),
            name: '佐藤様',
            role: '20代・学生',
            comment: '落ち着いた雰囲気で勉強がはかどります。店主さんの人柄も素敵です。',
          },
        ],
      },
    },
    // メニュー（特徴として）
    {
      id: generateBlockId(),
      type: 'two_column',
      data: {
        layout: 'image-left',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
        title: '厳選メニュー',
        text: '【ドリンク】\nブレンドコーヒー...550円\nシングルオリジンコーヒー...650円\nカフェラテ...600円\n抹茶ラテ...650円\nハーブティー...550円\n\n【スイーツ】\n本日のケーキ...500円\nガトーショコラ...550円\nチーズケーキ...550円\nケーキセット...950円\n\n※全て税込価格です',
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
            question: '営業時間を教えてください',
            answer: '平日 10:00〜18:00、土日祝 10:00〜19:00です。定休日は火曜日です。',
          },
          {
            id: generateBlockId(),
            question: '予約は必要ですか？',
            answer: '予約は不要です。ただし、10名様以上のグループでご利用の場合は事前にご連絡ください。',
          },
          {
            id: generateBlockId(),
            question: '駐車場はありますか？',
            answer: '店舗前に2台分の駐車スペースがございます。',
          },
          {
            id: generateBlockId(),
            question: 'テイクアウトは可能ですか？',
            answer: 'はい、ドリンク・スイーツともにテイクアウト可能です。',
          },
        ],
      },
    },
    // CTA
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '営業時間',
        description: '平日 10:00〜18:00 / 土日祝 10:00〜19:00（定休日:火曜日）',
        buttonText: 'アクセス・お問い合わせ',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
      },
    },
    // 地図
    {
      id: generateBlockId(),
      type: 'google_map',
      data: {
        title: 'アクセス',
        description: '〇〇駅から徒歩3分',
        address: '東京都世田谷区',
      },
    },
    // お問い合わせ
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: 'お問い合わせ',
        buttonText: '送信する',
      },
    },
  ],
};

export default function BusinessCafeDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
