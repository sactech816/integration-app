'use client';

import React from 'react';
import QuizPlayer from '@/components/quiz/QuizPlayer';

// キンドル著者向け診断のサンプルデータ
const demoQuiz = {
  id: 0,
  slug: 'kindle-author-demo',
  title: 'あなたに最適なKindle出版ジャンル診断',
  description: '5つの質問に答えて、あなたに最適なKindle出版ジャンルを見つけましょう！',
  category: 'ビジネス',
  color: '#f59e0b',
  mode: 'diagnosis' as const,
  layout: 'card' as 'card' | 'chat' | 'pop' | 'grid',
  questions: [
    {
      id: 'q1',
      text: 'あなたが最も興味のある分野は？',
      options: [
        { label: 'ビジネス・マネジメント', score: { A: 3, B: 0, C: 1, D: 0 } },
        { label: '自己啓発・スキルアップ', score: { A: 1, B: 3, C: 0, D: 1 } },
        { label: 'ライフスタイル・趣味', score: { A: 0, B: 1, C: 3, D: 1 } },
        { label: 'フィクション・物語', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q2',
      text: 'あなたの経験や専門性は？',
      options: [
        { label: '経営者・起業家としての経験がある', score: { A: 3, B: 1, C: 0, D: 0 } },
        { label: '特定分野の専門知識・資格を持っている', score: { A: 1, B: 3, C: 1, D: 0 } },
        { label: '趣味や生活の中で深く学んできたことがある', score: { A: 0, B: 1, C: 3, D: 1 } },
        { label: '創作や物語を書くのが好き', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q3',
      text: 'どんな読者に届けたいですか？',
      options: [
        { label: 'ビジネスパーソン・経営者', score: { A: 3, B: 1, C: 0, D: 0 } },
        { label: '成長意欲の高い学習者', score: { A: 1, B: 3, C: 0, D: 0 } },
        { label: '日常を豊かにしたい一般読者', score: { A: 0, B: 1, C: 3, D: 1 } },
        { label: 'エンターテイメントを求める読者', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q4',
      text: '本を書く目的は？',
      options: [
        { label: 'ビジネスの集客・ブランディング', score: { A: 3, B: 0, C: 0, D: 0 } },
        { label: '知識や経験を人々に伝えたい', score: { A: 1, B: 3, C: 1, D: 0 } },
        { label: '自分の好きなことを発信したい', score: { A: 0, B: 1, C: 3, D: 1 } },
        { label: '物語を通じて人々を楽しませたい', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
    {
      id: 'q5',
      text: 'どのような書き方が向いていると思いますか？',
      options: [
        { label: '論理的で実践的なノウハウ', score: { A: 3, B: 1, C: 0, D: 0 } },
        { label: '体系的で分かりやすい解説', score: { A: 1, B: 3, C: 1, D: 0 } },
        { label: '体験談や具体例を交えた語り', score: { A: 0, B: 1, C: 3, D: 1 } },
        { label: '想像力豊かな創作', score: { A: 0, B: 0, C: 1, D: 3 } },
      ],
    },
  ],
  results: [
    {
      type: 'A',
      title: 'ビジネス・マネジメント書',
      description: 'あなたには、実践的なビジネス書・マネジメント書が最適です！経営者や起業家としての経験を、具体的なノウハウとして伝えることで、多くのビジネスパーソンの役に立つ本が書けるでしょう。集客やブランディングにも効果的です。',
    },
    {
      type: 'B',
      title: '自己啓発・スキルアップ書',
      description: 'あなたには、自己啓発書やスキルアップ本が最適です！あなたの専門知識や経験を、体系的で分かりやすく伝えることで、成長意欲の高い読者に大きな価値を提供できます。教育的な内容で読者の人生を変える本を書きましょう。',
    },
    {
      type: 'C',
      title: 'ライフスタイル・趣味本',
      description: 'あなたには、ライフスタイル本や趣味の本が最適です！あなたの経験や好きなことを、親しみやすく語ることで、日常を豊かにしたい読者に共感と価値を届けられます。実体験に基づいた説得力のある内容が魅力になるでしょう。',
    },
    {
      type: 'D',
      title: 'フィクション・小説',
      description: 'あなたには、フィクションや小説が最適です！想像力を活かして物語を創作することで、読者に感動やエンターテイメントを提供できます。独自の世界観やキャラクターで、読者を魅了する作品を書きましょう。',
    },
  ],
};

export default function KindleAuthorDemoPage() {
  return <QuizPlayer quiz={demoQuiz} />;
}
