'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// AIDOMA法則デモ（参考: https://makers.tokyo/business/6G6xa）
// Attention（注目）→ Interest（興味）→ Desire（欲求）→ Memory（記憶）→ Action（行動）
const demoLP: BusinessLP = {
  id: 'demo-aidoma',
  slug: 'demo-aidoma',
  title: 'プロ仕様の動画編集ソフト｜VideoMaster Pro',
  description: 'AIDOMA法則に基づくビジネスLP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
  },
  content: [
    // 【Attention】注目 - ヒーロー
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'プロ級の動画を\n誰でも簡単に',
        subheadline: 'AI搭載の次世代動画編集ソフト。初心者でも30分で本格的な動画が完成',
        ctaText: '無料トライアルを始める',
        ctaUrl: '#trial',
        backgroundColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      },
    },
    // 【Interest】興味 - 問題提起
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: '動画編集でこんな悩みありませんか？',
        subtitle: 'VideoMaster Proなら、すべて解決できます',
        items: [
          {
            id: generateBlockId(),
            icon: '😰',
            title: '操作が難しくて挫折',
            description: '高機能ソフトは使いこなせない。マニュアルを読むだけで疲れる…',
          },
          {
            id: generateBlockId(),
            icon: '⏰',
            title: '編集に時間がかかりすぎる',
            description: '1本の動画に何時間もかかる。もっと効率的に作業したい…',
          },
          {
            id: generateBlockId(),
            icon: '💸',
            title: 'プロに頼むと高額',
            description: '外注すると数万円。でも自分でやるのは大変…',
          },
        ],
      },
    },
    // 【Desire】欲求 - 特徴とベネフィット
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: 'VideoMaster Proの特徴',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '🤖',
            title: 'AI自動編集',
            description: '面倒なカット編集やテロップ入れをAIが自動化。作業時間を1/3に短縮',
          },
          {
            id: generateBlockId(),
            icon: '🎨',
            title: '豊富なテンプレート',
            description: '1,000種類以上のプロ仕様テンプレート。ドラッグ&ドロップで完成',
          },
          {
            id: generateBlockId(),
            icon: '⚡',
            title: '高速レンダリング',
            description: 'GPU加速で書き出し速度が従来の3倍。4K動画もサクサク処理',
          },
          {
            id: generateBlockId(),
            icon: '🎵',
            title: '商用OKの素材',
            description: '著作権フリーの音楽・効果音が10万点以上。商用利用も安心',
          },
          {
            id: generateBlockId(),
            icon: '📱',
            title: 'SNS最適化',
            description: 'YouTube、Instagram、TikTok用に自動リサイズ&最適化',
          },
        ],
      },
    },
    // ビフォーアフター
    {
      id: generateBlockId(),
      type: 'two_column',
      data: {
        layout: 'image-left',
        imageUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=600&fit=crop',
        title: '編集時間を劇的に短縮',
        text: '【従来のソフト】\n・動画1本に3〜5時間\n・複雑な操作で挫折\n・高スペックPCが必要\n\n【VideoMaster Pro】\n・動画1本に30分〜1時間\n・直感的な操作で初心者でもOK\n・一般的なPCでサクサク動作\n\nAIのサポートで、編集経験ゼロでもプロ級の動画を作成できます',
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
            role: 'YouTuber',
            comment: '編集時間が1/3になりました。AIの自動カット機能が神すぎる！投稿頻度が上がって登録者も増えました。',
          },
          {
            id: generateBlockId(),
            name: '佐藤様',
            role: '企業マーケター',
            comment: '外注していた動画制作を内製化できました。年間200万円のコスト削減に成功！',
          },
          {
            id: generateBlockId(),
            name: '山本様',
            role: '動画編集初心者',
            comment: '初めての動画編集でしたが、30分でクオリティの高い動画が完成。テンプレートが本当に便利です。',
          },
        ],
      },
    },
    // 【Memory】記憶 - 料金プラン
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: '無料トライアル',
            price: '¥0',
            features: [
              '30日間無料',
              'すべての機能が使える',
              'クレジットカード不要',
              'いつでもキャンセルOK',
            ],
            isRecommended: false,
          },
          {
            id: generateBlockId(),
            title: 'プロプラン',
            price: '¥2,980/月',
            features: [
              'すべての機能使い放題',
              '商用利用OK',
              '無制限の書き出し',
              'プレミアムテンプレート',
              '優先サポート',
            ],
            isRecommended: true,
          },
          {
            id: generateBlockId(),
            title: 'ビジネスプラン',
            price: '¥9,800/月',
            features: [
              'チームで利用可能（5ユーザー）',
              'クラウドストレージ1TB',
              'チーム共有機能',
              '専任サポート担当',
              'カスタムテンプレート作成',
            ],
            isRecommended: false,
          },
        ],
      },
    },
    // 限定特典
    {
      id: generateBlockId(),
      type: 'dark_section',
      data: {
        title: '今なら特別特典付き',
        subtitle: '30日間無料トライアル登録で',
        bulletPoints: [
          '【特典1】動画編集マスターガイド（PDF 100ページ）',
          '【特典2】プロが使うショートカット一覧',
          '【特典3】限定オンラインセミナー参加権',
        ],
        backgroundColor: '#1f2937',
        accentColor: '#3b82f6',
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
            question: '初心者でも使えますか？',
            answer: 'はい、直感的な操作とAIサポートで、初心者の方でも30分程度で動画が作成できます。チュートリアル動画も充実しています。',
          },
          {
            id: generateBlockId(),
            question: 'どんなPCでも動きますか？',
            answer: 'Windows 10以降、macOS 10.15以降に対応。メモリ8GB以上を推奨しますが、一般的なPCであれば問題なく動作します。',
          },
          {
            id: generateBlockId(),
            question: '商用利用できますか？',
            answer: 'はい、プロプラン以上なら商用利用が可能です。YouTube、SNS、企業のプロモーション動画など自由にご利用いただけます。',
          },
          {
            id: generateBlockId(),
            question: '無料期間中に解約できますか？',
            answer: 'はい、30日間の無料期間中はいつでも解約可能です。解約後も料金は一切かかりません。',
          },
        ],
      },
    },
    // 【Action】行動 - CTA
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '30日間無料トライアル',
        description: 'すべての機能を無料でお試しいただけます。今すぐ始めましょう',
        buttonText: '無料で今すぐ始める',
        buttonUrl: '#trial',
        backgroundGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      },
    },
    // フォーム
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '無料トライアル登録',
        buttonText: '今すぐ始める',
      },
    },
  ],
};

export default function BusinessAidomaDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
