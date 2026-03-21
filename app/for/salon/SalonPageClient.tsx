'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { Sparkles, Gift, CalendarCheck, Heart, Scissors, Star, MessageCircle, Repeat, MousePointerClick } from 'lucide-react';

export default function SalonPageClient() {
  return (
    <SubBrandLPLayout personaId="school">
    <PersonaLPLayout
      skipAuthProvider
      badge="サロン・美容室オーナーの方へ"
      headline={
        <>
          リピーターが増え、<br />
          <span style={{ color: '#db2777' }}>口コミが自然に広がる。</span>
        </>
      }
      headlinePlainText="リピーターが増え、口コミが自然に広がる。"
      subheadline="サロン経営は「リピート」と「口コミ」がすべて。お客様が楽しみながら通い続け、自然と周りに紹介してくれる仕組みをつくりませんか。"
      breadcrumbLabel="サロン・美容室の方へ"
      breadcrumbSlug="salon"
      heroColor="#db2777"
      heroBgGradient="linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '新規のお客様は来るのに、2回目以降のリピートにつながらない',
        'クーポンサイトに頼りきりで、広告費ばかりかかっている',
        'SNSを毎日更新しているのに、予約につながらない',
        '口コミを書いてほしいけど、お願いするのが気まずい',
        'スタッフの手が足りず、予約管理やDM送信に時間を取られている',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#db2777' }}>来店のきっかけ</span>から<br className="sm:hidden" />
          リピートまで仕組み化
        </>
      }
      benefitDescription="お客様が「また行きたい」と思う体験を仕組みで作ることで、無理なくリピーターが増え、口コミが広がります。"
      benefits={[
        {
          icon: Sparkles,
          title: '来店のきっかけを作る',
          description: '「あなたに合うヘアケア診断」「パーソナルカラー診断」など、お客様が楽しめる診断クイズをAIで簡単作成。SNSでシェアされ、新規来店のきっかけに。',
        },
        {
          icon: Gift,
          title: 'リピートが自然に増える',
          description: 'スタンプラリーやガチャなどのガミフィケーション機能で「次も行きたい」を演出。来店するたびにポイントが貯まり、特典がもらえる仕組みで再来店率アップ。',
        },
        {
          icon: CalendarCheck,
          title: '予約が24時間自動で入る',
          description: '予約フォームで空き状況の確認から予約完了まで自動化。営業時間外でも予約を受け付けられるので、お客様の「今すぐ予約したい」を逃しません。',
        },
      ]}

      stepsTitle="お客様が「また来たい」と思う流れ"
      stepsDescription="来店きっかけ → リピート促進 → 予約の自動化で、サロン集客の好循環を作ります。"
      steps={[
        {
          number: 1,
          title: '診断クイズで来店のきっかけを作る',
          description: '「あなたに合うヘアケア診断」「似合うネイルカラー診断」など、お客様が楽しめる診断をAIで簡単作成。結果画面にサロン情報と予約リンクを設置すれば、診断から来店への導線が完成。SNSでシェアされて新規集客にも。',
          toolName: '診断クイズ',
          toolDescription: '美容診断をAIで簡単作成',
          toolUrl: '/quiz',
          icon: Sparkles,
          color: '#db2777',
        },
        {
          number: 2,
          title: 'ガミフィケーションでリピートを促進する',
          description: 'スタンプラリー・来店ガチャ・ポイント特典など、お客様が楽しみながら通い続けられる仕組みを導入。「あと1回でスタンプが貯まる！」が次回来店の強力な動機に。紹介特典を組み合わせれば、口コミも自然に広がります。',
          toolName: 'ガミフィケーション',
          toolDescription: 'スタンプラリー・ガチャで再来店促進',
          toolUrl: '/gamification',
          icon: Gift,
          color: '#a855f7',
        },
        {
          number: 3,
          title: '予約フォームで24時間自動受付',
          description: 'メニュー選択→日時選択→予約確定がオンラインで完結。電話対応や手動の予約管理から解放され、施術に集中できます。リマインドメールの自動送信で無断キャンセルも防止。',
          toolName: '予約フォーム',
          toolDescription: '24時間自動予約受付',
          toolUrl: '/booking',
          icon: CalendarCheck,
          color: '#f59e0b',
        },
      ]}

      supportPack={{
        packName: 'サロン集客パック',
        packDescription: '診断クイズ→ガミフィケーション→予約フォームの流れを、プロが一緒に構築します。',
        personaSlug: 'salon',
        includes: [
          { icon: Sparkles, title: 'サロン向け診断クイズ作成サポート', description: 'あなたのサロンのメニューに合わせた診断クイズの企画・作成をお手伝い' },
          { icon: Gift, title: 'ガミフィケーション初期設定代行', description: 'スタンプラリー・ガチャの設定と特典設計をサポート' },
          { icon: MousePointerClick, title: '予約導線の構築', description: '予約フォーム設定 + 診断クイズ・SNSからの予約導線を設計' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '診断クイズをAIで無料作成・公開',
        'ガミフィケーション（スタンプラリー・ガチャ）で再来店促進',
        'プロフィールLPでサロン紹介ページを作成',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: '予約フォームで24時間自動予約受付', plan: 'Standard' },
        { text: 'ファネルで診断→予約の導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで既存顧客にキャンペーン情報を配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: '新規のお客様はクーポンサイト経由で月15名ほど来るが、リピート率は30%以下。毎月の広告費が5万円かかり、利益を圧迫していた。SNSも頑張っているが、フォロワーは増えても予約にはつながらず、何が正解か分からなくなっていた。',
        after: '「似合うネイルカラー診断」をInstagramのプロフィールに設置したら、月200人以上が診断を体験。診断結果からの予約が月10件以上に。さらにスタンプラリーを導入したらリピート率が65%に向上。クーポンサイトの広告費を半分に減らしても、売上は1.4倍になった。',
        persona: '30代女性・ネイルサロンオーナー（開業2年目）のイメージ',
      }}

      faqItems={[
        { question: '診断クイズは無料で作れますか？', answer: 'はい、診断クイズはフリープランで無料作成・公開できます。AIが質問と結果を自動生成するので、専門知識がなくても本格的な診断が作れます。' },
        { question: 'ガミフィケーション（スタンプラリー）は無料で使えますか？', answer: 'はい、ガミフィケーション機能はフリープランで利用可能です。スタンプラリーやガチャなど、お客様が楽しめる仕組みを無料で導入できます。' },
        { question: '既存の予約システムと併用できますか？', answer: '集客メーカーの予約フォームは独立したシステムとして利用できます。診断クイズやガミフィケーションからの導線として活用し、既存システムと使い分けることも可能です。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: '教室・スクール運営者', href: '/for/school', color: '#ec4899' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#10b981' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
