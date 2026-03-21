'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { ClipboardList, CalendarCheck, Trophy, FileText, GraduationCap, Users, Star, Repeat, MousePointerClick } from 'lucide-react';

export default function SchoolBizPageClient() {
  return (
    <SubBrandLPLayout personaId="school">
    <PersonaLPLayout
      skipAuthProvider
      badge="教室・スクールオーナーの方へ"
      headline={
        <>
          体験申込から入会まで、<br />
          <span style={{ color: '#0891b2' }}>自然な流れを構築。</span>
        </>
      }
      headlinePlainText="体験申込から入会まで、自然な流れを構築。"
      subheadline="教室・スクールの集客は「体験の質」と「継続の仕組み」がすべて。体験レッスンの申込受付から出欠管理、スタンプカードによる継続率UPまで、教室運営をまるごと仕組み化しませんか。"
      breadcrumbLabel="教室・スクールの方へ"
      breadcrumbSlug="school-biz"
      heroColor="#0891b2"
      heroBgGradient="linear-gradient(180deg, #ecfeff 0%, #cffafe 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '体験レッスンには来てくれるが、入会につながらない',
        '生徒の出欠管理が手作業で大変・漏れが出る',
        '一度入会しても数ヶ月で退会してしまう',
        '体験申込の受付をメールやLINEでやっていて手間がかかる',
        '「通い続けたい」と思ってもらう仕掛けが作れていない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#0891b2' }}>体験から継続まで</span>を<br className="sm:hidden" />
          仕組みでつなげる
        </>
      }
      benefitDescription="体験レッスンの第一印象から、入会後の「通い続けたい」気持ちまで。教室運営に必要な仕組みを無料で構築できます。"
      benefits={[
        {
          icon: GraduationCap,
          title: '体験のきっかけ作り',
          description: '申込フォームで体験レッスンの受付を24時間自動化。必要な情報を事前に収集できるので、当日のレッスン準備もスムーズになります。',
        },
        {
          icon: Users,
          title: '生徒管理の効率化',
          description: '出欠管理で生徒の出席状況をリアルタイムに把握。欠席が続いている生徒へのフォローも、データを見ながら的確に行えます。',
        },
        {
          icon: Star,
          title: '入会・継続の仕組み化',
          description: 'スタンプカード（ガミフィケーション）で「通うほど楽しい」仕掛けを導入。出席回数に応じた特典で、生徒のモチベーションと継続率がアップします。',
        },
      ]}

      stepsTitle="体験から「ずっと通いたい」と思われる流れ"
      stepsDescription="体験申込 → 出欠管理 → 継続の仕掛けという教室運営の流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: '体験レッスンの申込を受け付ける',
          description: '申込フォームで体験レッスンの受付を自動化。希望日時・経験レベル・お子様の年齢など、必要な情報を事前に収集。電話やメールでのやり取りが不要になり、24時間いつでも申込を受け付けられます。',
          toolName: '申込フォーム',
          toolDescription: '体験レッスン受付を自動化',
          toolUrl: '/order-form',
          icon: ClipboardList,
          color: '#0891b2',
        },
        {
          number: 2,
          title: '生徒の出欠をかんたん管理',
          description: '出欠管理で、各クラスの出席状況をリアルタイムに把握。生徒ごとの出席率や欠席パターンも一目で分かるので、フォローが必要な生徒にすぐ対応できます。紙の出席簿やExcel管理から卒業しましょう。',
          toolName: '出欠管理',
          toolDescription: '生徒の出席状況をリアルタイム把握',
          toolUrl: '/attendance',
          icon: CalendarCheck,
          color: '#10b981',
        },
        {
          number: 3,
          title: 'スタンプカードで継続率をUP',
          description: 'ガミフィケーション機能でデジタルスタンプカードを導入。「10回出席で次回レッスン無料」「皆勤賞で特別レッスンにご招待」など、通い続けるほど楽しくなる仕掛けで、退会率を大幅に下げられます。',
          toolName: 'ガミフィケーション',
          toolDescription: 'スタンプカードで継続率UP',
          toolUrl: '/gamification',
          icon: Trophy,
          color: '#f59e0b',
        },
      ]}

      supportPack={{
        packName: '教室集客パック',
        packDescription: '体験レッスン受付→出欠管理→継続の仕掛けまで、プロが一緒に構築します。',
        personaSlug: 'school-biz',
        includes: [
          { icon: FileText, title: '申込フォーム初期設定代行', description: '教室の内容をヒアリングし、体験申込に最適なフォームを作成サポート' },
          { icon: CalendarCheck, title: '出欠管理の設定サポート', description: 'クラス構成に合わせた出欠管理の初期設定をお手伝い' },
          { icon: MousePointerClick, title: 'スタンプカード設計', description: '教室に合った特典設計とガミフィケーション設定を一緒に構築' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '申込フォームで体験レッスン受付を自動化',
        '診断クイズをAIで自動生成',
        'アクセス解析で効果を確認',
        'プロフィールLPを無料で作成・公開',
      ]}
      upgradeFeatures={[
        { text: '出欠管理で生徒の出席状況をリアルタイム把握', plan: 'Standard' },
        { text: 'ガミフィケーションでスタンプカードを導入', plan: 'Standard' },
        { text: 'メルマガで生徒・保護者への一斉連絡', plan: 'Standard' },
      ]}

      testimonial={{
        before: '月に5〜6名が体験レッスンに来るものの、入会率は30%程度。出欠管理はExcelで手作業。生徒が3ヶ月で辞めてしまうことが多く、常に新規集客に追われていた。「通い続けたい」と思ってもらう仕掛けが必要だと感じていた。',
        after: '申込フォームで体験受付を自動化し、事前情報を収集することで体験レッスンの質が向上。入会率が60%に。出欠管理で欠席が続く生徒にすぐフォローできるようになり、スタンプカード導入後は平均継続期間が3ヶ月→8ヶ月に伸びた。',
        persona: '30代女性・料理教室オーナー（開業2年目）のイメージ',
      }}

      faqItems={[
        { question: '申込フォームは無料で使えますか？', answer: 'はい、申込フォームはフリープランで無料作成・公開できます。体験レッスンの受付に必要な項目を自由にカスタマイズできます。' },
        { question: 'スタンプカードはどのように生徒に配布しますか？', answer: 'デジタルスタンプカードなので、URLやQRコードで簡単に共有できます。生徒はスマートフォンからいつでもスタンプの状況を確認できます。' },
        { question: '複数のクラスを管理できますか？', answer: 'はい、クラスごとに出欠管理を分けて運用できます。曜日別・レベル別など、教室の運営スタイルに合わせて柔軟に設定可能です。' },
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
