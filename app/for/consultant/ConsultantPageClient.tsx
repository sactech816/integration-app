'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { Brain, GitBranch, Mail, Shield, Target, Users, FileText, Repeat, MousePointerClick } from 'lucide-react';

export default function ConsultantPageClient() {
  return (
    <SubBrandLPLayout personaId="coach">
    <PersonaLPLayout
      skipAuthProvider
      badge="コンサルタント・コーチの方へ"
      headline={
        <>
          専門性を伝え、<br />
          <span style={{ color: '#4f46e5' }}>相談予約が自然に入る。</span>
        </>
      }
      headlinePlainText="専門性を伝え、相談予約が自然に入る。"
      subheadline="コンサルタント・コーチの集客は「この人に頼みたい」と思わせる仕組みがすべて。診断クイズで見込み客の課題を可視化し、ファネルで体験から本契約へ自然に導きます。"
      breadcrumbLabel="コンサルタント・コーチの方へ"
      breadcrumbSlug="consultant"
      heroColor="#4f46e5"
      heroBgGradient="linear-gradient(180deg, #eef2ff 0%, #e0e7ff 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '実力はあるのに知名度が低く、見込み客に見つけてもらえない',
        '見込み客との接点が少なく、相談予約につながらない',
        '高額サービスの価値をうまく伝えられず、価格競争に巻き込まれる',
        'SNSで発信しているが「いいね」止まりで成約に結びつかない',
        'フォローアップが手動で、見込み客を取りこぼしている',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#4f46e5' }}>専門性を可視化</span>して<br className="sm:hidden" />
          成約につなげる
        </>
      }
      benefitDescription="あなたの専門知識を「仕組み」で伝えることで、見込み客が「この人にお願いしたい」と感じて行動します。"
      benefits={[
        {
          icon: Shield,
          title: '専門性の可視化',
          description: '診断クイズで見込み客の課題を明確にし、あなたの専門性を体感してもらえます。「この人は自分の悩みを分かっている」と信頼が一気に高まります。',
        },
        {
          icon: Target,
          title: '見込み客の育成',
          description: 'ファネルで「無料診断→体験セッション→本契約」の導線を構築。見込み客の温度感に合わせた最適なステップで、自然にサービスの価値を伝えます。',
        },
        {
          icon: Users,
          title: '成約の自動化',
          description: 'メルマガ・ステップメールで継続的に価値を届け、信頼を積み重ねます。相談予約が「お願いされる」形で入るようになり、セールス不要の状態を実現。',
        },
      ]}

      stepsTitle="見込み客が「この人にお願いしたい」と決める流れ"
      stepsDescription="課題の可視化 → 信頼の構築 → 自然な成約という流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: '診断クイズで見込み客の課題を可視化する',
          description: '「あなたのビジネス課題診断」「経営力チェック」など、見込み客が自分の課題を発見できる診断クイズをAIで自動生成。診断結果であなたの専門性を自然にアピールし、「相談してみたい」という気持ちを引き出します。',
          toolName: '診断クイズ',
          toolDescription: '見込み客の課題を可視化',
          toolUrl: '/quiz',
          icon: Brain,
          color: '#4f46e5',
        },
        {
          number: 2,
          title: 'ファネルで体験から本契約への導線を構築する',
          description: '「無料診断→個別相談→体験セッション→本契約」のステップを一つの導線にまとめます。各段階で最適な情報を提供し、見込み客が迷わず次のステップに進める仕組みを作ります。',
          toolName: 'ファネル',
          toolDescription: '体験→本契約の導線を構築',
          toolUrl: '/funnel',
          icon: GitBranch,
          color: '#10b981',
        },
        {
          number: 3,
          title: 'メルマガ・ステップメールで信頼を積み重ねる',
          description: '診断クイズの回答者やセミナー参加者に、自動でフォローアップメールを配信。「お役立ち情報」→「成功事例」→「個別相談のご案内」と段階的に信頼を構築し、成約率を高めます。',
          toolName: 'ステップメール',
          toolDescription: '自動フォローアップ配信',
          toolUrl: '/step-email',
          icon: Mail,
          color: '#f59e0b',
        },
      ]}

      supportPack={{
        packName: 'コンサル集客パック',
        packDescription: '診断クイズ→ファネル→ステップメールの流れを、プロが一緒に構築します。',
        personaSlug: 'consultant',
        includes: [
          { icon: Brain, title: '診断クイズの設計・初期設定代行', description: 'あなたの専門分野に合わせた診断クイズを一緒に設計・作成' },
          { icon: FileText, title: 'ファネル導線の構築サポート', description: '体験セッション→本契約への最適な導線をプロが設計' },
          { icon: MousePointerClick, title: 'ステップメールのシナリオ設計', description: 'フォローアップメール5通分の文面を一緒に作成' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '診断クイズをAIで自動生成・公開',
        'ステップメールでフォローアップ自動化',
        'プロフィールLPを無料で作成',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: 'ファネルで診断→体験→本契約の導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで見込み客リストに一斉配信', plan: 'Standard' },
        { text: '予約フォームで個別相談の受付を自動化', plan: 'Standard' },
      ]}

      testimonial={{
        before: '独立3年目の経営コンサルタント。実績はあるが、新規の見込み客との接点がSNSの発信だけ。月に1〜2件の問い合わせはあるものの、初回相談から成約に至るのは半分以下。フォローアップも手動で、忙しい時期は対応が遅れがちだった。',
        after: '診断クイズ「あなたの経営課題診断」を公開したところ、月50件以上の回答が集まるように。ファネルで体験セッションへの導線を整備し、ステップメールで自動フォローを始めたら、月8〜10件の個別相談が安定。成約率も60%に向上し、高額プランの受注も増えた。',
        persona: '40代男性・経営コンサルタント（独立3年目）のイメージ',
      }}

      faqItems={[
        { question: '診断クイズは無料で作れますか？', answer: 'はい、診断クイズはフリープランで無料作成・公開できます。AIが質問文や診断結果を自動生成するので、専門知識だけあれば簡単に作成できます。' },
        { question: 'ファネルの構築は難しくないですか？', answer: 'テンプレートに沿って各ステップのページを設定するだけなので、ITに詳しくない方でも直感的に操作できます。不安な場合はサポートパックもご利用いただけます。' },
        { question: '既存のメールリストを取り込めますか？', answer: 'はい、CSVファイルでメールリストをインポートできます。既存の見込み客リストをそのまま活用してステップメールを配信できます。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: 'Kindle出版で集客したい方', href: '/for/kindle', color: '#3b82f6' },
        { label: '教室・スクール運営者', href: '/for/school', color: '#ec4899' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#10b981' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
