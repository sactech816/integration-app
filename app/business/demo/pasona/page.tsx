'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// PASONA法則デモ（フル版）
// Problem → Affinity → Solution → Offer → Narrowing → Action
const demoLP: BusinessLP = {
  id: 'demo-pasona',
  slug: 'demo-pasona',
  title: 'その悩み、本当に解決できていますか？',
  description: 'PASONA法則に基づくビジネスLP - 問題提起から行動喚起まで',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
  },
  content: [
    // 【Problem】問題提起 - Hero
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'その悩み、本当に\n解決できていますか？',
        subheadline: '〇〇でお困りではありませんか？何度も同じ失敗を繰り返してしまう、時間とお金をかけても成果が出ない…このまま放置すると、さらに状況は悪化します。',
        ctaText: '詳しく見る',
        ctaUrl: '#problem',
        backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      },
    },
    // 【Problem】問題カード
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        sectionTitle: 'Problem',
        title: '多くの方が抱える深刻な問題',
        subtitle: '〇〇でお困りではありませんか？このまま放置すると、さらに状況は悪化します。今こそ、根本的な解決が必要です。',
        items: [
          {
            id: generateBlockId(),
            icon: '😰',
            title: '問題①',
            description: '〇〇がうまくいかず、いつも途中で挫折してしまう…',
          },
          {
            id: generateBlockId(),
            icon: '💸',
            title: '問題②',
            description: '△△に時間とお金を使っても、思ったような成果が出ない…',
          },
          {
            id: generateBlockId(),
            icon: '🤔',
            title: '問題③',
            description: '誰に相談すればいいかわからず、一人で悩み続けている…',
          },
        ],
      },
    },
    // 【Affinity】共感セクション
    {
      id: generateBlockId(),
      type: 'dark_section',
      data: {
        title: '私も同じ悩みを抱えていました',
        subtitle: 'Affinity',
        description: '実は、私自身も以前は同じような問題に悩まされていました。何度も失敗を繰り返し、「自分には無理なのかもしれない」と諦めかけたこともあります。\n\nしかし、ある方法に出会ってから、すべてが変わりました。今では〇〇を達成し、多くの方のサポートができるまでになりました。\n\nあなたの気持ち、痛いほどよくわかります。だからこそ、同じ悩みを持つあなたの力になりたいのです。',
        backgroundColor: '#1f2937',
        accentColor: '#8b5cf6',
      },
    },
    // 【Solution】解決策
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '問題を解決する3つの方法',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '💡',
            title: '解決策①：〇〇メソッド',
            description: '独自開発した〇〇メソッドで、根本原因から解決。再発を防ぎます。',
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '解決策②：個別カスタマイズ',
            description: 'あなたの状況に合わせた完全オーダーメイドの解決策をご提案します。',
          },
          {
            id: generateBlockId(),
            icon: '🤝',
            title: '解決策③：継続サポート',
            description: '一度きりではなく、成果が出るまで継続的にサポートします。',
          },
        ],
      },
    },
    // なぜこの方法で解決できるのか
    {
      id: generateBlockId(),
      type: 'checklist_section',
      data: {
        sectionTitle: 'Solution',
        title: 'なぜこの方法で解決できるのか？',
        items: [
          {
            id: generateBlockId(),
            title: '10年以上の実践で磨き上げた独自メソッド',
            description: '単なる対症療法ではありません',
          },
          {
            id: generateBlockId(),
            title: '1,000件以上の成功事例に基づく確実な方法',
            description: '実績に裏付けられた手法',
          },
          {
            id: generateBlockId(),
            title: '一人ひとりに寄り添う丁寧なサポート体制',
            description: '他では実現できない成果を出すことができます',
          },
        ],
        style: 'card',
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
            name: '佐藤様',
            role: '40代・会社員',
            comment: '長年悩んでいた問題が、たった3ヶ月で解決しました。もっと早く相談すればよかったです！',
          },
          {
            id: generateBlockId(),
            name: '田中様',
            role: '30代・経営者',
            comment: '他のサービスでは改善しなかった課題が、見事にクリアできました。投資以上のリターンがありました。',
          },
          {
            id: generateBlockId(),
            name: '鈴木様',
            role: '50代・フリーランス',
            comment: '親身になって相談に乗っていただき、安心してお任せできました。結果も期待以上です。',
          },
        ],
      },
    },
    // 【Offer】料金プラン
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: '初回相談',
            price: '¥11,000',
            features: [
              '60分の個別相談',
              '現状分析と課題整理',
              '解決策のご提案',
              '継続プランのご案内',
            ],
            isRecommended: false,
          },
          {
            id: generateBlockId(),
            title: '3ヶ月集中プログラム',
            price: '¥165,000',
            features: [
              '週1回の個別セッション',
              'いつでもチャット相談OK',
              '専用ワークシート・教材',
              '成果が出るまで徹底サポート',
              '【特典】フォローアップ1ヶ月無料',
            ],
            isRecommended: true,
          },
          {
            id: generateBlockId(),
            title: '継続サポート',
            price: '¥55,000/月',
            features: [
              '月2回のセッション',
              'チャットサポート',
              '定期的な進捗確認',
              'いつでも解約可能',
            ],
            isRecommended: false,
          },
        ],
      },
    },
    // 【Narrowing】絞り込み
    {
      id: generateBlockId(),
      type: 'dark_section',
      data: {
        title: 'ただし、誰でも受けられるわけではありません',
        subtitle: 'Narrowing',
        description: '質の高いサポートを提供するため、毎月の受付人数を限定しています。',
        bulletPoints: [
          '今月の残り枠：あと3名様',
          '申込締切：今月末まで',
          '次回募集：未定',
        ],
        backgroundColor: '#111827',
        accentColor: '#ef4444',
      },
    },
    // よくある質問
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '本当に効果がありますか？',
            answer: 'はい、これまで1,000件以上の成功事例があります。個々の状況に合わせたカスタマイズにより、高い成果を実現しています。',
          },
          {
            id: generateBlockId(),
            question: 'どのくらいの期間で成果が出ますか？',
            answer: '個人差はありますが、多くの方が3ヶ月以内に明確な変化を実感されています。早い方では1ヶ月で成果が出ることもあります。',
          },
          {
            id: generateBlockId(),
            question: '支払い方法は何がありますか？',
            answer: 'クレジットカード、銀行振込に対応しています。分割払いもご相談いただけます。',
          },
        ],
      },
    },
    // 【Action】行動喚起
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今すぐ無料相談を申し込む',
        description: '残り枠わずか。本気で解決したい方はお早めに。',
        buttonText: '無料相談に申し込む（残り3名）',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      },
    },
  ],
};

export default function BusinessPasonaDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
