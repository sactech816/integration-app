'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { Building2, GitBranch, ClipboardCheck, Mail, BarChart3, Users, Settings } from 'lucide-react';

export default function BusinessPageClient() {
  return (
    <PersonaLPLayout
      badge="法人・チーム運営の方へ"
      headline={
        <>
          マーケティング基盤を、<br />
          <span style={{ color: '#8b5cf6' }}>ひとつにまとめる。</span>
        </>
      }
      headlinePlainText="マーケティング基盤を、ひとつにまとめる。"
      subheadline="LP作成、リード獲得、アンケート、メール配信…バラバラのツールを行き来するのはもう終わり。集客から成約まで、チームで使える統合プラットフォームを。"
      breadcrumbLabel="法人・チームの方へ"
      breadcrumbSlug="business"
      heroColor="#8b5cf6"
      heroBgGradient="linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        'LP作成・メール配信・フォーム…ツールごとに月額費用がかさむ',
        'マーケティング施策のデータが各ツールに散らばっている',
        '担当者が変わるたびに、ツールの使い方を教え直す必要がある',
        '「とりあえずGoogleフォーム」が定着してしまい、見た目がイマイチ',
        '顧客の声を集めたいが、アンケートの作成・集計が手間',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#8b5cf6' }}>一元管理</span>で<br className="sm:hidden" />
          チームの生産性が上がる
        </>
      }
      benefitDescription="ひとつのプラットフォームで、マーケティングに必要なすべてが揃います。"
      benefits={[
        {
          icon: BarChart3,
          title: 'ツール統合でコスト削減',
          description: 'LP作成・フォーム・メール配信・アンケート・ファネル管理がひとつに。複数ツールの月額費用を大幅に削減できます。',
        },
        {
          icon: Users,
          title: 'チームで簡単に使える',
          description: 'テンプレートベースなので、マーケティング専任でなくても運用可能。担当者の異動にも強い仕組みです。',
        },
        {
          icon: Settings,
          title: '施策を素早く回せる',
          description: 'キャンペーンLP → アンケート → ステップメール → 効果測定の流れを1日で構築。PDCAのスピードが圧倒的に上がります。',
        },
      ]}

      stepsTitle="法人のマーケティングを加速する3ステップ"
      stepsDescription="集客 → リード獲得 → ナーチャリングの流れを統合プラットフォームで。"
      steps={[
        {
          number: 1,
          title: 'キャンペーンLP・商品ページを素早くつくる',
          description: 'テンプレートを選んでテキストを入力するだけで、プロ品質のLPが完成。外注せずに社内でスピーディーに制作できるので、施策の立ち上げが圧倒的に速くなります。',
          toolName: 'ビジネスLP',
          toolDescription: 'テンプレートから即制作',
          toolUrl: '/business',
          icon: Building2,
          color: '#8b5cf6',
        },
        {
          number: 2,
          title: 'アンケート・フォームでリードを獲得する',
          description: '顧客アンケート、お問い合わせフォーム、資料請求フォームをテンプレートから作成。Googleフォームでは出せないブランド感を維持しながら、回答データを一元管理。',
          toolName: 'アンケート / 申込フォーム',
          toolDescription: 'ブランドに合ったフォーム',
          toolUrl: '/survey',
          icon: ClipboardCheck,
          color: '#10b981',
        },
        {
          number: 3,
          title: 'ステップメールで見込み客を育てる',
          description: '資料請求やアンケート回答者に自動でフォローアップメールを配信。「お役立ち情報→事例→商談のご案内」のシナリオを設定すれば、営業の負担を減らしながらリードを育てられます。',
          toolName: 'ステップメール',
          toolDescription: '自動メールシナリオ配信',
          toolUrl: '/step-email',
          icon: Mail,
          color: '#3b82f6',
        },
      ]}

      freeFeatures={[
        'ビジネスLPを無料で作成・公開',
        'アンケート・フォームを無制限に作成',
        '診断クイズでリード獲得',
        'アクセス解析でデータを一元管理',
      ]}
      upgradeFeatures={[
        { text: 'ステップメールで自動ナーチャリング', plan: 'Standard' },
        { text: 'ファネルで施策の導線を一元管理', plan: 'Standard' },
        { text: 'チーム管理・複数メンバー対応', plan: 'Business' },
      ]}

      testimonial={{
        before: 'LP作成はWixで月額2,000円、フォームはGoogleフォーム（デザインが微妙）、メール配信はMailchimpで月$30。データが各ツールに散らばり、マーケティング担当が退職したら引き継ぎに2ヶ月かかった。年間のツール費用は合計15万円超。',
        after: '集客メーカーに統合したら、ツール費用が月額4,980円に。テンプレートベースなので新しい担当者もすぐに使えた。LP公開→アンケート→ステップメールの流れが1日で構築でき、施策のスピードが3倍に。',
        persona: '中小企業・マーケティング担当（従業員15名）のイメージ',
      }}

      faqItems={[
        { question: '既存のWixやWordPressから移行できますか？', answer: 'はい、テキストや画像をコピー＆ペーストするだけで移行できます。特別な技術知識は不要で、テンプレートに沿って入力するだけです。' },
        { question: 'チームで共同利用できますか？', answer: 'はい、1アカウントで作成したコンテンツはチームで共有可能です。テンプレートベースなので、担当者が変わってもすぐに引き継げます。' },
        { question: '複数ツールの統合でどれくらいコスト削減できますか？', answer: 'LP作成（Wix等: 月2,000円〜）、フォーム（有料ツール: 月1,000円〜）、メール配信（Mailchimp等: 月3,000円〜）を一元化。Businessプラン月額4,980円で、年間10万円以上のコスト削減が可能です。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/starter', color: '#f59e0b' },
        { label: 'フリーランス・SNS発信者', href: '/for/freelance', color: '#3b82f6' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#ec4899' },
        { label: '店舗・教室・サロン', href: '/for/shop', color: '#10b981' },
      ]}
    />
  );
}
