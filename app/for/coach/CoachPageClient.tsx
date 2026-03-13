'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { Video, Mail, Calendar, Shield, BookOpen, Users } from 'lucide-react';

export default function CoachPageClient() {
  return (
    <PersonaLPLayout
      badge="コーチ・コンサル・講師の方へ"
      headline={
        <>
          「実力」を正しく伝え、<br />
          <span style={{ color: '#6366f1' }}>予約が自然に入る。</span>
        </>
      }
      headlinePlainText="「実力」を正しく伝え、予約が自然に入る。"
      subheadline="コーチ・コンサルの集客は「信頼」がすべて。あなたの専門性を可視化し、見込み客を育て、自然に予約につなげる仕組みをつくりませんか。"
      breadcrumbLabel="コーチ・コンサル・講師の方へ"
      breadcrumbSlug="coach"
      heroColor="#6366f1"
      heroBgGradient="linear-gradient(180deg, #eef2ff 0%, #e0e7ff 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        'セッションの質には自信があるのに、新規のお客様が来ない',
        'セミナーを開催しても、そこから個別相談につながらない',
        '「もっと実績を見せたい」けど、見せ方が分からない',
        'ステップメールを送りたいけど、ツールが高すぎる',
        'お客様の声をもらっても、うまく活用できていない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#6366f1' }}>信頼を可視化</span>して<br className="sm:hidden" />
          予約につなげる
        </>
      }
      benefitDescription="あなたの専門性・実績・人柄を「仕組み」で伝えることで、見込み客が安心して予約できます。"
      benefits={[
        {
          icon: Shield,
          title: '専門性が「見える」',
          description: 'ウェビナーLPで、あなたのセミナー・講座を魅力的に紹介。参加者が「この人に相談したい」と思えるページが5分で完成。',
        },
        {
          icon: BookOpen,
          title: '信頼が「育つ」',
          description: 'ステップメールで、セミナー参加後のフォローアップを自動化。お役立ち情報→事例紹介→個別相談のご案内と、自然な流れで信頼を積み重ねます。',
        },
        {
          icon: Users,
          title: '予約が「入る」',
          description: '個別相談・体験セッションの予約が24時間自動受付。「いつ空いてますか？」のやり取りは一切不要になります。',
        },
      ]}

      stepsTitle="見込み客が「この人にお願いしたい」と思う流れ"
      stepsDescription="セミナー集客 → 信頼構築 → 個別相談という王道の流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: 'セミナー・講座のLPで集客する',
          description: 'ウェビナーLPで、あなたのセミナーや無料相談会を告知。「講師プロフィール」「参加者の声」「こんな方におすすめ」など、参加を後押しする要素をテンプレートに沿って入力するだけ。',
          toolName: 'ウェビナーLP',
          toolDescription: 'セミナー告知ページを簡単作成',
          icon: Video,
          color: '#6366f1',
        },
        {
          number: 2,
          title: 'ステップメールで信頼を育てる',
          description: 'セミナー参加者に自動でフォローアップメールを送信。「お役立ち情報」→「成功事例」→「個別相談のご案内」と段階的に信頼を構築。あなたが寝ている間も、見込み客との関係が深まります。',
          toolName: 'ステップメール',
          toolDescription: '自動フォローアップ配信',
          icon: Mail,
          color: '#10b981',
        },
        {
          number: 3,
          title: '個別相談の予約を自動で受け付ける',
          description: '信頼が高まったタイミングで、ワンクリックで個別相談を予約できる導線を設置。カレンダーから空き日時を選ぶだけなので、見込み客の「今すぐ相談したい」を逃しません。',
          toolName: '予約フォーム',
          toolDescription: '24時間自動予約受付',
          icon: Calendar,
          color: '#f59e0b',
        },
      ]}

      testimonial={{
        before: '月2回のセミナーを開催していたが、参加者は毎回5〜8名。個別相談に進む人は1〜2名。フォローアップは手動でメールを送っていたが、忙しくて3日後になることも。もっと体系的にやりたいと思いつつ、ツールの費用が気になっていた。',
        after: 'ウェビナーLPでセミナー告知を一本化したら、参加者が平均15名に。ステップメールで自動フォローを始めたら、個別相談への転換率が40%に向上。月8件の個別相談が安定して入るようになり、成約率も上がった。',
        persona: '40代男性・ビジネスコンサルタント（独立3年目）のイメージ',
      }}

      faqItems={[
        { question: 'ウェビナーLPは無料で作れますか？', answer: 'はい、ウェビナーLPはフリープランで無料作成・公開できます。講師プロフィール・参加者の声・申込ボタンなどのテンプレートが用意されています。' },
        { question: 'ステップメールは何通まで無料で送れますか？', answer: 'フリープランではステップメールのシナリオを1つ作成でき、基本的なフォローアップメールを自動送信できます。より多くのシナリオや配信数が必要な場合は有料プランをご検討ください。' },
        { question: '既存のメールリストを取り込めますか？', answer: 'はい、CSVファイルでメールリストをインポートできます。既存の見込み客リストをそのまま活用してステップメールを配信できます。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/starter', color: '#f59e0b' },
        { label: 'フリーランス・SNS発信者', href: '/for/freelance', color: '#3b82f6' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#ec4899' },
        { label: '店舗・教室・サロン', href: '/for/shop', color: '#10b981' },
        { label: '法人・チーム', href: '/for/business', color: '#8b5cf6' },
      ]}
    />
  );
}
