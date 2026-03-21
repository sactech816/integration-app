'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { Building2, Mail, ClipboardList, FileText, Repeat, MousePointerClick, Users, TrendingUp, Megaphone } from 'lucide-react';

export default function FranchisePageClient() {
  return (
    <SubBrandLPLayout personaId="creator">
    <PersonaLPLayout
      skipAuthProvider
      badge="フランチャイズ本部の方へ"
      headline={
        <>
          加盟店募集を<br />
          <span style={{ color: '#0d9488' }}>「仕組み」にする。</span>
        </>
      }
      headlinePlainText="加盟店募集を「仕組み」にする。"
      subheadline="説明会の集客から加盟検討者の育成、申し込みまで。FC本部の加盟店募集を「属人的な営業」から「再現可能な仕組み」に変えませんか。"
      breadcrumbLabel="フランチャイズ本部の方へ"
      breadcrumbSlug="franchise"
      heroColor="#0d9488"
      heroBgGradient="linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        'FC説明会の集客が難しく、毎回参加者が集まらない',
        '資料請求からの加盟検討への転換率が低い',
        '加盟希望者へのフォローが手薄で、検討途中で離脱される',
        '説明会後の追客が属人的で、担当者によってバラつきがある',
        '加盟募集にかけられる広告予算が限られている',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#0d9488' }}>加盟店募集を仕組み化</span>して<br className="sm:hidden" />
          成約につなげる
        </>
      }
      benefitDescription="FC説明会の集客から検討者の育成、加盟申し込みまでを「仕組み」で回すことで、安定した加盟店獲得を実現します。"
      benefits={[
        {
          icon: Megaphone,
          title: '説明会への集客',
          description: 'ビジネスLPでFC説明会・募集ページを魅力的に作成。ブランドの強み・収益モデル・オーナーの声を伝え、説明会への参加を促進します。',
        },
        {
          icon: TrendingUp,
          title: '加盟検討者の育成',
          description: 'ステップメールで説明会参加者に自動フォロー。市場データ→成功事例→収益シミュレーション→個別相談と、段階的に加盟への意欲を高めます。',
        },
        {
          icon: Users,
          title: '申し込みの自動化',
          description: '加盟申し込みフォームとファネルで、検討者が「加盟したい」と思ったタイミングを逃さず受付。審査プロセスへスムーズにつなげます。',
        },
      ]}

      stepsTitle="加盟希望者が「このFCに加盟したい」と思う流れ"
      stepsDescription="説明会集客 → 検討者育成 → 加盟申し込みという流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: 'FC説明会・募集ページで集客する',
          description: 'ビジネスLPで、フランチャイズの魅力を伝える説明会募集ページを作成。「ブランドの強み」「収益モデル」「既存オーナーの声」「サポート体制」など、加盟を検討したくなる情報をテンプレートに沿って入力するだけ。',
          toolName: 'ビジネスLP',
          toolDescription: 'FC説明会・募集ページを簡単作成',
          toolUrl: '/business',
          icon: Building2,
          color: '#0d9488',
        },
        {
          number: 2,
          title: 'ステップメールで加盟検討者を育成する',
          description: '説明会参加者や資料請求者に自動でフォローアップメールを配信。「市場動向データ」→「成功オーナーインタビュー」→「収益シミュレーション」→「個別面談のご案内」と段階的に情報提供し、加盟への意欲を高めます。',
          toolName: 'ステップメール',
          toolDescription: '加盟検討者への情報提供を自動化',
          toolUrl: '/step-email',
          icon: Mail,
          color: '#10b981',
        },
        {
          number: 3,
          title: '申し込みフォーム・ファネルで加盟受付を自動化',
          description: '加盟意欲が高まったタイミングで、申し込みフォームからスムーズに加盟エントリーを受付。ファネルで説明会→個別面談→加盟申込の導線を一元管理し、検討者の離脱を防ぎます。',
          toolName: '申し込みフォーム',
          toolDescription: '加盟エントリーを24時間自動受付',
          toolUrl: '/order-form',
          icon: ClipboardList,
          color: '#f59e0b',
        },
      ]}

      supportPack={{
        packName: 'FC加盟店募集パック',
        packDescription: '説明会集客→検討者育成→加盟申込の流れを、プロが一緒に構築します。',
        personaSlug: 'franchise',
        includes: [
          { icon: FileText, title: 'FC募集LP初期設定代行', description: 'フランチャイズの強み・収益モデルをヒアリングし、最適なLP構成で作成をサポート' },
          { icon: Mail, title: 'ステップメール5通分のシナリオ設計', description: '説明会後のフォローアップメールの文面を一緒に作成' },
          { icon: MousePointerClick, title: '加盟申込導線の構築', description: '申し込みフォーム設定 + LP・メールからの導線を設計' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        'ビジネスLPでFC募集ページを無料作成・公開',
        'ステップメールで加盟検討者へのフォロー自動化',
        '診断クイズをAIで自動生成',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: '申し込みフォームで加盟エントリーの受付を自動化', plan: 'Standard' },
        { text: 'ファネルで説明会→面談→加盟申込の導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで加盟希望者リストに一斉配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: '月1回のFC説明会を開催していたが、参加者は毎回3〜5名。資料請求はあっても説明会に来ない人が大半で、フォローも営業担当が個別にメールを送る属人的なやり方。加盟成約は四半期に1〜2件がやっとだった。',
        after: 'ビジネスLPでFC説明会の募集ページを作り、ステップメールで自動フォローを開始。説明会参加者が平均12名に増加し、ステップメール経由の個別面談率が50%に。四半期の加盟成約が5件に増え、募集コストも大幅に削減できた。',
        persona: '50代男性・飲食フランチャイズ本部（加盟店30店舗）のイメージ',
      }}

      faqItems={[
        { question: 'FC募集ページは無料で作れますか？', answer: 'はい、ビジネスLPはフリープランで無料作成・公開できます。ブランド紹介・収益モデル・オーナーの声・申込ボタンなどのテンプレートが用意されています。' },
        { question: 'ステップメールは何通まで無料で送れますか？', answer: 'フリープランではステップメールのシナリオを1つ作成でき、基本的なフォローアップメールを自動送信できます。より多くのシナリオや配信数が必要な場合は有料プランをご検討ください。' },
        { question: '既存の加盟希望者リストを取り込めますか？', answer: 'はい、CSVファイルでメールリストをインポートできます。既存の加盟希望者リストをそのまま活用してステップメールを配信できます。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: '教室・スクール運営者', href: '/for/school', color: '#ec4899' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#10b981' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
