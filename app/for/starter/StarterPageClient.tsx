'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { UserCircle, Sparkles, Share2, Heart, Lightbulb, Target } from 'lucide-react';

export default function StarterPageClient() {
  return (
    <PersonaLPLayout
      badge="これから起業・副業を始める方へ"
      headline={
        <>
          何から始めればいいか、<br />
          <span style={{ color: '#f59e0b' }}>もう迷わない。</span>
        </>
      }
      headlinePlainText="何から始めればいいか、もう迷わない。"
      subheadline="起業の第一歩は「自分を知ってもらう仕組み」をつくること。テンプレートを選ぶだけで、今日からあなたのビジネスが動き出します。"
      breadcrumbLabel="これから起業する方へ"
      breadcrumbSlug="starter"
      heroColor="#f59e0b"
      heroBgGradient="linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '起業したいけど、何から手をつければいいか分からない',
        'ホームページを作りたいけど、何十万も払う余裕がない',
        'SNSアカウントはあるけど、ビジネスにつながっていない',
        '自分のスキルや経験をどう見せればいいか分からない',
        '「まずは名刺代わりのWebページを」と思いつつ、手が止まっている',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#f59e0b' }}>「自分を知ってもらう」</span>が<br className="sm:hidden" />
          今日からできる
        </>
      }
      benefitDescription="専門知識もデザインスキルも不要。あなたの想いをかたちにするテンプレートが揃っています。"
      benefits={[
        {
          icon: Heart,
          title: 'あなたの魅力が伝わる',
          description: 'プロフィールLPで、あなたの想い・実績・サービスを1ページにまとめて発信。SNSのプロフィール欄に貼るだけ。',
        },
        {
          icon: Lightbulb,
          title: '「何者か」が一目で分かる',
          description: '診断クイズで「あなたは○○タイプ！」とお客様との接点をつくる。楽しいから自然にシェアされます。',
        },
        {
          icon: Target,
          title: '発信が「集客」に変わる',
          description: 'SNS投稿メーカーで、反応が取れる投稿をAIが自動生成。発信→興味→ページ訪問の流れが生まれます。',
        },
      ]}

      stepsTitle="あなた専用の「はじめの一歩」"
      stepsDescription="この3つを順番につくるだけで、集客の土台が完成します。"
      steps={[
        {
          number: 1,
          title: 'まず、自分を紹介できるページをつくる',
          description: 'テンプレートを選んで、名前・肩書き・サービス内容を入れるだけ。5分であなた専用のWebページが完成します。SNSのプロフィール欄に貼れば、名刺代わりに。',
          toolName: 'プロフィールLP',
          toolDescription: 'テンプレートから簡単作成',
          toolUrl: '/profile',
          icon: UserCircle,
          color: '#3b82f6',
        },
        {
          number: 2,
          title: '見込み客との接点をつくる',
          description: '「あなたの起業タイプ診断」「あなたに合った働き方は？」など、ターゲットが思わずやりたくなる診断クイズを作成。結果画面からあなたのサービスページへ自然に誘導できます。',
          toolName: '診断クイズ',
          toolDescription: 'AIが質問・結果を自動生成',
          toolUrl: '/quiz',
          icon: Sparkles,
          color: '#10b981',
        },
        {
          number: 3,
          title: 'SNSで拡散される投稿をつくる',
          description: 'あなたのビジネスに合わせて、反応が取れるSNS投稿文をAIが自動生成。投稿→プロフィールLP→サービスページという集客の流れが自然に生まれます。',
          toolName: 'SNS投稿メーカー',
          toolDescription: 'AI自動生成＆テンプレート',
          toolUrl: '/sns-post',
          icon: Share2,
          color: '#f59e0b',
        },
      ]}

      testimonial={{
        before: 'アメブロとInstagramで発信していたけど、サービス内容を伝えるページがなく、問い合わせはDMで月1件あるかないか。何から手をつければいいか分からず、半年が過ぎていた。',
        after: 'プロフィールLPをつくってSNSに貼ったら、「サービス内容がよく分かった」と言われるように。診断クイズをシェアしたら友人経由で初めてのお客様が。月5件のお問い合わせが来るようになった。',
        persona: '30代女性・ヨガインストラクター（起業準備中）のイメージ',
      }}

      freeFeatures={[
        'プロフィールLPを無制限に作成・公開',
        '診断クイズをAIで自動生成',
        'SNS投稿文をAIで自動生成',
        'アクセス解析でページの反応を確認',
      ]}
      upgradeFeatures={[
        { text: 'ビジネスLPで本格的なサービスページ作成', plan: 'Standard' },
        { text: '予約フォームで問い合わせを自動化', plan: 'Standard' },
        { text: 'メルマガで見込み客との関係を継続', plan: 'Standard' },
      ]}

      faqItems={[
        { question: '起業準備中でも使えますか？', answer: 'はい、まだ商品やサービスが決まっていなくても大丈夫です。まずはプロフィールLPであなたの想いを発信し、診断クイズで見込み客との接点をつくることから始められます。' },
        { question: 'プロフィールLPは無料で作れますか？', answer: 'はい、プロフィールLP・診断クイズ・SNS投稿メーカーはすべて無料で作成・公開できます。クレジットカード登録も不要です。' },
        { question: 'パソコンが苦手でも大丈夫ですか？', answer: 'テンプレートを選んでテキストを入力するだけなので、パソコンが苦手な方でも5分で完成します。スマホからも編集可能です。' },
      ]}

      otherTypes={[
        { label: 'フリーランス・SNS発信者', href: '/for/freelance', color: '#3b82f6' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#ec4899' },
        { label: '店舗・教室・サロン', href: '/for/shop', color: '#10b981' },
        { label: '法人・チーム', href: '/for/business', color: '#8b5cf6' },
      ]}
    />
  );
}
