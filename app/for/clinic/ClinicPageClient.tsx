'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { Stethoscope, UserCircle, CalendarCheck, ClipboardList, Heart, FileText, Repeat, MousePointerClick } from 'lucide-react';

export default function ClinicPageClient() {
  return (
    <SubBrandLPLayout personaId="startup">
    <PersonaLPLayout
      skipAuthProvider
      badge="クリニック・治療院の方へ"
      headline={
        <>
          患者さんの「不安」を<br />
          <span style={{ color: '#059669' }}>「安心」に変える。</span>
        </>
      }
      headlinePlainText="患者さんの「不安」を「安心」に変える。"
      subheadline="来院前の患者さんは不安でいっぱいです。症状チェックで来院のきっかけを作り、院の強みを分かりやすく伝え、スムーズに予約まで導く仕組みをつくりませんか。"
      breadcrumbLabel="クリニック・治療院の方へ"
      breadcrumbSlug="clinic"
      heroColor="#059669"
      heroBgGradient="linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '口コミサイトの評価に左右され、新規患者の数が安定しない',
        '初診の患者さんが定着せず、リピーターにつながらない',
        '院の専門性や治療方針を患者さんに伝えきれていない',
        'ホームページはあるが、予約や問い合わせにつながらない',
        '受付スタッフの電話対応に時間を取られ、診療に集中できない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#059669' }}>患者さんの不安を解消</span>して<br className="sm:hidden" />
          来院につなげる
        </>
      }
      benefitDescription="症状チェックで来院のきっかけを作り、院の強みを分かりやすく伝え、予約までの導線を自動化します。"
      benefits={[
        {
          icon: Stethoscope,
          title: '症状チェックで来院のきっかけを作る',
          description: '「あなたの症状チェック」診断クイズで、患者さんが自分の状態を把握。「一度相談してみよう」という来院のきっかけを自然に作ります。',
        },
        {
          icon: Heart,
          title: '院の強みを分かりやすく伝える',
          description: 'プロフィールLPで、院長の想い・治療方針・設備・スタッフ紹介を魅力的に掲載。「この院なら安心」と思ってもらえるページが簡単に作れます。',
        },
        {
          icon: CalendarCheck,
          title: '予約の受付を自動化する',
          description: '予約フォームで24時間いつでも予約受付。電話対応の負担を減らし、患者さんも「いつでも予約できる」安心感を得られます。',
        },
      ]}

      stepsTitle="患者さんが「ここに行きたい」と思う流れ"
      stepsDescription="症状チェック → 院の紹介 → 予約という流れで、患者さんの不安を一つずつ解消します。"
      steps={[
        {
          number: 1,
          title: '診断クイズ「あなたの症状チェック」',
          description: '「肩こりタイプ診断」「腰痛リスクチェック」など、患者さんの悩みに寄り添った診断クイズをAIで自動生成。結果画面で「当院ではこのような治療を行っています」と自然に来院を促せます。',
          toolName: '診断クイズ',
          toolDescription: '症状チェックをAIで自動生成',
          toolUrl: '/quiz',
          icon: ClipboardList,
          color: '#059669',
        },
        {
          number: 2,
          title: 'プロフィールLP（院の紹介・先生の紹介）',
          description: '院長の経歴・治療へのこだわり・院内の雰囲気・患者さんの声を一つのページにまとめて紹介。「どんな先生が診てくれるのか」「どんな院なのか」が一目で分かり、来院前の不安を解消します。',
          toolName: 'プロフィールLP',
          toolDescription: '院・先生の紹介ページを簡単作成',
          toolUrl: '/profile',
          icon: UserCircle,
          color: '#0891b2',
        },
        {
          number: 3,
          title: '予約フォームで来院予約を受け付ける',
          description: '診断結果やプロフィールLPから、ワンクリックで予約ページへ。カレンダーから希望日時を選ぶだけなので、患者さんの「今すぐ予約したい」を逃しません。電話が苦手な方にも安心です。',
          toolName: '予約フォーム',
          toolDescription: '24時間自動予約受付',
          toolUrl: '/booking',
          icon: CalendarCheck,
          color: '#f59e0b',
        },
      ]}

      supportPack={{
        packName: 'クリニック集客パック',
        packDescription: '症状チェック→院紹介→予約の流れを、プロが一緒に構築します。',
        personaSlug: 'clinic',
        includes: [
          { icon: ClipboardList, title: '症状チェック診断の作成サポート', description: 'あなたの院の専門分野に合わせた診断クイズを一緒に設計・作成' },
          { icon: FileText, title: 'プロフィールLP初期設定代行', description: '院の強み・先生の紹介を最適な構成でページ作成をサポート' },
          { icon: MousePointerClick, title: '予約導線の構築', description: '予約フォーム設定 + 診断・LPからの導線を設計' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '診断クイズ（症状チェック）をAIで自動生成',
        'プロフィールLPで院の紹介ページを作成・公開',
        'アクセス解析で効果を確認',
        'SNS投稿メーカーで告知文を作成',
      ]}
      upgradeFeatures={[
        { text: '予約フォームで来院予約の受付を自動化', plan: 'Standard' },
        { text: 'ファネルで症状チェック→予約の導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで既存患者さんへの定期配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: 'ホームページはあるものの、月の新規患者は10名前後。口コミサイトの評価に一喜一憂する日々。電話予約のみだったため、診療時間外の予約を取りこぼしていた。院の治療方針や強みをうまく伝えられず、「近いから」という理由で来る患者さんがほとんどだった。',
        after: '症状チェック診断をSNSで発信したところ、月30名以上が診断を受けるように。プロフィールLPで院長の想いや治療実績を伝えたことで、「先生の考えに共感した」という患者さんが増加。予約フォーム導入で電話対応が半減し、新規患者数は月25名に。リピート率も大幅に改善した。',
        persona: '50代男性・整骨院院長（開業8年目）のイメージ',
      }}

      faqItems={[
        { question: '症状チェック診断は無料で作れますか？', answer: 'はい、診断クイズはフリープランで無料作成・公開できます。AIがあなたの専門分野に合わせた質問と結果を自動生成するので、専門知識がなくても簡単に作成できます。' },
        { question: '医療広告ガイドラインに対応できますか？', answer: '作成したコンテンツの文面はご自身で確認・編集いただけます。テンプレートは一般的な表現を使用していますが、医療広告ガイドラインへの適合はご自身の責任でご確認ください。' },
        { question: '既存のホームページと併用できますか？', answer: 'はい、作成したページはそれぞれ独立したURLを持つため、既存のホームページからリンクを貼るだけで併用できます。ホームページのリニューアルは不要です。' },
      ]}

      otherTypes={[
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: '教室・スクール運営者', href: '/for/school', color: '#ec4899' },
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#10b981' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
