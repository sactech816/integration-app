'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { Home, Search, CalendarCheck, Building2, MapPin, FileText, Repeat, MousePointerClick } from 'lucide-react';

export default function RealestatePageClient() {
  return (
    <SubBrandLPLayout personaId="startup">
    <PersonaLPLayout
      skipAuthProvider
      badge="不動産・住宅会社の方へ"
      headline={
        <>
          物件の魅力を伝え、<br />
          <span style={{ color: '#b45309' }}>内見予約を獲得。</span>
        </>
      }
      headlinePlainText="物件の魅力を伝え、内見予約を獲得。"
      subheadline="ポータルサイトだけに頼らず、自社の強みと物件の魅力を「仕組み」で届ける。見込み客の興味を引き出し、内見予約につなげる集客導線をつくりませんか。"
      breadcrumbLabel="不動産・住宅会社の方へ"
      breadcrumbSlug="realestate"
      heroColor="#b45309"
      heroBgGradient="linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        'ポータルサイトに掲載費を払い続けているが、反響が減っている',
        '似たような物件が多く、自社の物件を差別化できない',
        '来店・内見予約がなかなか入らず、成約につながらない',
        '物件情報をSNSに投稿しても、問い合わせにつながらない',
        'お客様が本当に求めている条件を事前に把握できない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#b45309' }}>物件の魅力を可視化</span>して<br className="sm:hidden" />
          内見予約につなげる
        </>
      }
      benefitDescription="お客様の関心を引き出し、物件の魅力を正しく伝え、内見予約まで自然に誘導する仕組みをつくります。"
      benefits={[
        {
          icon: Search,
          title: '物件診断で興味喚起',
          description: '「あなたに合う住まいタイプ診断」で見込み客の関心をキャッチ。診断結果からおすすめ物件を自然にご案内し、問い合わせの第一歩をつくります。',
        },
        {
          icon: Building2,
          title: '物件の魅力を伝えるLP',
          description: 'ビジネスLPで物件の特徴・周辺環境・入居者の声を分かりやすく紹介。ポータルサイトでは伝えきれない「暮らしのイメージ」を届けます。',
        },
        {
          icon: CalendarCheck,
          title: '内見予約の自動化',
          description: '予約フォームで内見の申込みを24時間自動受付。お客様が「見てみたい」と思った瞬間を逃さず、スムーズに内見予約につなげます。',
        },
      ]}

      stepsTitle="見込み客が「この物件を見てみたい」と思う流れ"
      stepsDescription="興味喚起 → 物件紹介 → 内見予約という自然な流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: '診断クイズで理想の住まいタイプを発見',
          description: '「あなたに合う住まいタイプ診断」で、お客様のライフスタイルや希望条件を楽しく診断。結果に合わせておすすめエリアや物件タイプを提案し、自然に物件紹介ページへ誘導します。',
          toolName: '診断クイズ',
          toolDescription: 'あなたに合う住まいタイプ診断',
          toolUrl: '/quiz',
          icon: Search,
          color: '#b45309',
        },
        {
          number: 2,
          title: 'ビジネスLPで物件・会社の魅力を伝える',
          description: '物件の写真・間取り・周辺環境・入居者の声をまとめたLPを作成。「この会社なら安心」「この物件に住みたい」と思ってもらえるページが簡単につくれます。',
          toolName: 'ビジネスLP',
          toolDescription: '物件・会社紹介ページを作成',
          toolUrl: '/business',
          icon: Building2,
          color: '#d97706',
        },
        {
          number: 3,
          title: '予約フォームで内見予約を自動受付',
          description: '物件に興味を持ったお客様が、その場で内見日時を予約できる導線を設置。電話やメールのやり取りなしで、24時間いつでも内見予約を受け付けます。',
          toolName: '予約フォーム',
          toolDescription: '内見予約の自動受付',
          toolUrl: '/booking',
          icon: CalendarCheck,
          color: '#059669',
        },
      ]}

      supportPack={{
        packName: '不動産集客パック',
        packDescription: '物件診断→物件紹介LP→内見予約の流れを、プロが一緒に構築します。',
        personaSlug: 'realestate',
        includes: [
          { icon: Search, title: '物件診断クイズの設計・作成', description: 'ターゲットに合わせた住まい診断クイズの質問・結果を一緒に設計' },
          { icon: FileText, title: '物件紹介LP初期設定代行', description: '物件の強みをヒアリングし、最適なLP構成で作成をサポート' },
          { icon: MousePointerClick, title: '内見予約導線の構築', description: '予約フォーム設定 + LP・診断からの導線を設計' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '物件診断クイズをAIで自動生成',
        'ビジネスLPで物件・会社を紹介',
        '診断クイズで見込み客の興味を把握',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: '予約フォームで内見予約の受付を自動化', plan: 'Standard' },
        { text: 'ファネルで診断→LP→内見予約の導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで見込み客リストに新着物件を一斉配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: '大手ポータルサイトに月15万円の掲載費を払っていたが、問い合わせは月3〜5件。物件の魅力を十分に伝えきれず、内見予約に至るのは半分以下。自社サイトはあるが更新が追いつかず、ほぼ放置状態だった。',
        after: '住まいタイプ診断をSNSで拡散したところ、月200件以上の診断利用が発生。診断結果から物件紹介LPへの誘導率が35%、そこから内見予約フォームへの転換率が20%に。月14件の内見予約が安定して入るようになり、成約数も倍増した。',
        persona: '30代男性・地域密着型不動産会社（従業員5名）のイメージ',
      }}

      faqItems={[
        { question: '物件診断クイズは無料で作れますか？', answer: 'はい、診断クイズはフリープランで無料作成・公開できます。AIが質問と結果を自動生成するので、不動産の専門知識だけあれば簡単に作成できます。' },
        { question: 'ビジネスLPに物件写真を掲載できますか？', answer: 'はい、画像のアップロードに対応しています。物件の外観・内装・周辺環境など、写真を使って物件の魅力を視覚的に伝えられます。' },
        { question: '複数の物件ごとにページを作れますか？', answer: 'はい、物件ごとに個別のビジネスLPを作成できます。それぞれの物件の特徴に合わせた紹介ページを用意し、診断結果から最適な物件ページに誘導できます。' },
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
