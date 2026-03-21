'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { Briefcase, Video, ClipboardList, Shield, Award, Zap, FileText, Mail, MousePointerClick, Repeat } from 'lucide-react';

export default function AgencyPageClient() {
  return (
    <SubBrandLPLayout personaId="creator">
    <PersonaLPLayout
      skipAuthProvider
      badge="制作会社・Web代理店の方へ"
      headline={
        <>
          実績とポートフォリオで<br />
          <span style={{ color: '#7c3aed' }}>案件が来る仕組み。</span>
        </>
      }
      headlinePlainText="実績とポートフォリオで案件が来る仕組み。"
      subheadline="制作会社・代理店の案件獲得は「実績の見せ方」で決まる。あなたのポートフォリオを最大限に活かし、問い合わせが自然に入る導線をつくりませんか。"
      breadcrumbLabel="制作会社・Web代理店の方へ"
      breadcrumbSlug="agency"
      heroColor="#7c3aed"
      heroBgGradient="linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '紹介頼みの案件獲得で、売上が安定しない',
        'ポートフォリオの見せ方に困っていて、実績が伝わらない',
        '提案資料を毎回ゼロから作り直している',
        '「いい仕事をしている」のに、新規の問い合わせが来ない',
        'セミナーや勉強会を開きたいが、告知の仕組みがない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#7c3aed' }}>実績の見える化</span>で<br className="sm:hidden" />
          案件獲得を加速
        </>
      }
      benefitDescription="あなたの制作実績・専門性・強みを「仕組み」で発信することで、見込み客が安心して問い合わせできます。"
      benefits={[
        {
          icon: Award,
          title: '実績の見える化',
          description: 'ビジネスLPで制作実績・クライアントの声・対応可能な領域を一覧化。「この会社に頼みたい」と思わせるポートフォリオページが5分で完成。',
        },
        {
          icon: Shield,
          title: 'セミナーで専門性アピール',
          description: 'ウェビナーLPで無料セミナーや勉強会を告知。「Webサイトリニューアルのポイント」「集客できるLP設計」など、専門知識を発信して信頼を獲得。',
        },
        {
          icon: Zap,
          title: '問い合わせの自動化',
          description: '見積り・相談の受付フォームを24時間稼働。案件の詳細を事前にヒアリングできるので、スムーズに商談へ進めます。',
        },
      ]}

      stepsTitle="見込み客が「この会社に頼みたい」と思う流れ"
      stepsDescription="実績紹介 → 専門性の発信 → 問い合わせ受付という流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: 'ポートフォリオ・実績紹介LPで信頼を獲得',
          description: 'ビジネスLPで制作実績・サービス内容・料金体系・クライアントの声を掲載。テンプレートに沿って入力するだけで、プロフェッショナルなポートフォリオページが完成します。',
          toolName: 'ビジネスLP',
          toolDescription: 'ポートフォリオ・実績紹介ページを簡単作成',
          toolUrl: '/business',
          icon: Briefcase,
          color: '#7c3aed',
        },
        {
          number: 2,
          title: '無料セミナーで専門性を発信する',
          description: 'ウェビナーLPで「Web集客セミナー」「サイトリニューアル勉強会」などを告知。参加者に価値を提供しながら、自社の専門性と実力をアピール。セミナー参加者は高確率で見込み客になります。',
          toolName: 'ウェビナーLP',
          toolDescription: '無料セミナー・勉強会の告知ページ',
          toolUrl: '/webinar',
          icon: Video,
          color: '#8b5cf6',
        },
        {
          number: 3,
          title: '見積り・相談の受付を自動化する',
          description: '申し込みフォームで見積り依頼や無料相談を24時間受付。案件の種類・予算・希望納期を事前にヒアリングできるので、初回の打ち合わせがスムーズに進みます。',
          toolName: '申し込みフォーム',
          toolDescription: '見積り・相談受付フォーム',
          toolUrl: '/order-form',
          icon: ClipboardList,
          color: '#a78bfa',
        },
      ]}

      supportPack={{
        packName: '案件獲得パック',
        packDescription: 'ポートフォリオLP→セミナー集客→問い合わせ受付の流れを、プロが一緒に構築します。',
        personaSlug: 'agency',
        includes: [
          { icon: FileText, title: 'ビジネスLP初期設定代行', description: '制作実績・サービス内容をヒアリングし、最適なポートフォリオ構成で作成をサポート' },
          { icon: Video, title: 'ウェビナーLP構成アドバイス', description: 'セミナーテーマの選定から告知ページの構成まで一緒に設計' },
          { icon: MousePointerClick, title: '問い合わせ導線の構築', description: '申し込みフォーム設定 + LP・セミナーからの導線を設計' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        'ビジネスLPでポートフォリオを無料公開',
        'ウェビナーLPでセミナー告知ページを作成',
        '診断クイズをAIで自動生成',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: '申し込みフォームで見積り・相談受付を自動化', plan: 'Standard' },
        { text: 'ファネルでセミナー→相談→受注の導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで見込み客リストに一斉配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: '紹介案件が中心で、月によって売上の波が大きかった。ポートフォリオサイトはあるが更新が面倒で2年前の実績のまま。提案書も毎回PowerPointで作り直しており、営業活動に時間がかかっていた。',
        after: 'ビジネスLPでポートフォリオを常に最新化し、月2回のWebセミナーを開始。参加者から直接問い合わせが入るようになり、月5〜8件の新規相談が安定。提案前に実績ページを共有するだけで信頼感が伝わり、成約率も向上した。',
        persona: '30代男性・Web制作会社代表（従業員3名）のイメージ',
      }}

      faqItems={[
        { question: 'ビジネスLPは無料で作れますか？', answer: 'はい、ビジネスLPはフリープランで無料作成・公開できます。制作実績・サービス内容・お客様の声などのセクションが用意されています。' },
        { question: 'ウェビナーLPでセミナー告知はできますか？', answer: 'はい、ウェビナーLPもフリープランで作成可能です。講師プロフィール・セミナー内容・申込ボタンなどを簡単に設定できます。' },
        { question: '見積りフォームのカスタマイズはできますか？', answer: '申し込みフォームでは、案件の種類・予算・納期など、御社に必要な項目を自由にカスタマイズできます。Standardプラン以上でご利用いただけます。' },
      ]}

      otherTypes={[
        { label: 'コーチ・コンサル・講師の方', href: '/for/coach', color: '#6366f1' },
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#10b981' },
        { label: 'Kindle出版で集客したい方', href: '/for/kindle', color: '#3b82f6' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
