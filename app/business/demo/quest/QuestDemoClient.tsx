'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// QUEST法則デモ（参考: https://makers.tokyo/business/3dQ8c）
// Qualify（絞り込み）→ Understand（理解）→ Educate（教育）→ Stimulate（刺激）→ Transition（行動）
const demoLP: BusinessLP = {
  id: 'demo-quest',
  slug: 'demo-quest',
  title: '英語コーチング｜ENGLISH MASTER',
  description: 'QUEST法則に基づくビジネスLP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  },
  content: [
    // ヒーロー
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: '3ヶ月で\nビジネス英語をマスター',
        subheadline: 'あなた専属のコーチが、英語学習を徹底サポート。挫折させません',
        ctaText: '無料カウンセリングを予約',
        ctaUrl: '#counseling',
        backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      },
    },
    // 【Qualify】絞り込み - こんな方におすすめ
    {
      id: generateBlockId(),
      type: 'checklist_section',
      data: {
        title: 'こんな方におすすめです',
        columns: 2,
        items: [
          { id: generateBlockId(), title: '英語学習に何度も挫折している', description: '' },
          { id: generateBlockId(), title: '仕事で英語が必要になった', description: '' },
          { id: generateBlockId(), title: '海外出張・駐在の予定がある', description: '' },
          { id: generateBlockId(), title: 'TOEICスコアを上げたい', description: '' },
          { id: generateBlockId(), title: '独学では限界を感じている', description: '' },
          { id: generateBlockId(), title: '短期間で確実に成果を出したい', description: '' },
        ],
      },
    },
    // 【Understand】理解 - 共感
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: '英語学習の「あるある」な悩み',
        subtitle: 'ENGLISH MASTERなら、すべて解決できます',
        items: [
          {
            id: generateBlockId(),
            icon: '😰',
            title: '続かない',
            description: '教材を買っても3日坊主。何から始めればいいかわからない…',
          },
          {
            id: generateBlockId(),
            icon: '😓',
            title: '成果が出ない',
            description: '勉強しているのにTOEICスコアが伸びない。会話力も上がらない…',
          },
          {
            id: generateBlockId(),
            icon: '🤔',
            title: '時間がない',
            description: '仕事が忙しくて勉強時間が取れない。効率的に学びたい…',
          },
        ],
      },
    },
    // 【Educate】教育 - プログラムの特徴
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: 'ENGLISH MASTERが選ばれる理由',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '👤',
            title: '専属コーチ',
            description: 'あなた専属のプロコーチが、目標達成まで伴走。学習プランを完全カスタマイズ',
          },
          {
            id: generateBlockId(),
            icon: '📊',
            title: '科学的メソッド',
            description: '第二言語習得理論に基づく学習法。効率的に英語力を伸ばします',
          },
          {
            id: generateBlockId(),
            icon: '💬',
            title: '毎日サポート',
            description: 'LINEで質問し放題。わからないことはすぐに解決できます',
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: 'ビジネス特化',
            description: 'ビジネスシーンで使える実践的な英語力を習得。会議・プレゼン・交渉もOK',
          },
          {
            id: generateBlockId(),
            icon: '⏰',
            title: '短期集中',
            description: '3ヶ月で結果を出すプログラム。多くの受講生がTOEIC200点UP',
          },
        ],
      },
    },
    // プログラム詳細
    {
      id: generateBlockId(),
      type: 'two_column',
      data: {
        layout: 'image-left',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop',
        title: 'プログラム内容',
        text: '【週1回のコーチングセッション】\n60分の個別セッションで、学習の進捗確認と課題解決\n\n【毎日の学習サポート】\nLINEでいつでも質問OK。24時間以内に返信します\n\n【カスタマイズ教材】\nあなたの業界・職種に合わせた教材を提供\n\n【実践トレーニング】\nビジネスシーンを想定したロールプレイで実践力を強化',
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
            role: '30代・IT企業勤務',
            comment: 'TOEICが600点から850点にアップ！海外出張も自信を持って行けるようになりました。',
          },
          {
            id: generateBlockId(),
            name: '佐藤様',
            role: '40代・商社勤務',
            comment: '英語の会議で発言できるように。コーチの的確なアドバイスで、学習の無駄がなくなりました。',
          },
          {
            id: generateBlockId(),
            name: '山本様',
            role: '20代・メーカー勤務',
            comment: '何度も挫折していましたが、今回は続けられています。毎日のサポートが心強いです。',
          },
        ],
      },
    },
    // 【Stimulate】刺激 - 限定オファー
    {
      id: generateBlockId(),
      type: 'dark_section',
      data: {
        title: '今なら特別キャンペーン実施中',
        subtitle: '先着10名様限定',
        bulletPoints: [
          '入会金50,000円 → 無料',
          '教材費30,000円 → 無料',
          '1ヶ月の延長サポート付き',
        ],
        description: '※キャンペーンは予告なく終了する場合があります',
        backgroundColor: '#111827',
        accentColor: '#ef4444',
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
            title: '3ヶ月プログラム',
            price: '¥198,000',
            features: [
              '週1回のコーチングセッション',
              '毎日のLINEサポート',
              'カスタマイズ教材',
              '実践トレーニング',
              '1ヶ月の延長サポート付き',
            ],
            isRecommended: true,
          },
          {
            id: generateBlockId(),
            title: '6ヶ月プログラム',
            price: '¥348,000',
            features: [
              '週1回のコーチングセッション',
              '毎日のLINEサポート',
              'カスタマイズ教材',
              '実践トレーニング',
              'TOEIC模試2回',
              '2ヶ月の延長サポート付き',
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
            question: '初心者でも大丈夫ですか？',
            answer: 'はい、TOEIC400点台の方から上級者まで対応しています。あなたのレベルに合わせた学習プランを作成します。',
          },
          {
            id: generateBlockId(),
            question: '1日どのくらい勉強すればいいですか？',
            answer: '1日1〜2時間を推奨していますが、忙しい方は30分からでもOK。効率的な学習法で成果を出します。',
          },
          {
            id: generateBlockId(),
            question: 'オンラインで完結しますか？',
            answer: 'はい、すべてオンラインで完結します。全国どこからでも受講可能です。',
          },
          {
            id: generateBlockId(),
            question: '返金保証はありますか？',
            answer: '30日間の全額返金保証があります。効果を実感できない場合は、理由を問わず全額返金いたします。',
          },
        ],
      },
    },
    // 【Transition】行動 - CTA
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今すぐ無料カウンセリングを予約',
        description: '先着10名様限定。入会金50,000円が無料に',
        buttonText: 'カウンセリングを予約する',
        buttonUrl: '#counseling',
        backgroundGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
    },
    // フォーム
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '無料カウンセリング予約',
        buttonText: '予約する',
      },
    },
  ],
};

export default function BusinessQuestDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
