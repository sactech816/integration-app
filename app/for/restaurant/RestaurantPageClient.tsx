'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { CalendarCheck, Gift, ClipboardList, UtensilsCrossed, Repeat, Star, MessageSquare, Megaphone } from 'lucide-react';

export default function RestaurantPageClient() {
  return (
    <SubBrandLPLayout personaId="school">
    <PersonaLPLayout
      skipAuthProvider
      badge="飲食店・カフェオーナーの方へ"
      headline={
        <>
          来店のきっかけと<br />
          <span style={{ color: '#ea580c' }}>リピートを仕組み化。</span>
        </>
      }
      headlinePlainText="来店のきっかけとリピートを仕組み化。"
      subheadline="「料理には自信がある。でもお客様が来ない…」そんな悩みを解決。予約・来店・リピートの流れを仕組み化して、安定した集客を実現しませんか。"
      breadcrumbLabel="飲食店・カフェの方へ"
      breadcrumbSlug="restaurant"
      heroColor="#ea580c"
      heroBgGradient="linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        'グルメサイトの掲載料・手数料が高く、利益を圧迫している',
        '一度来てくれたお客様がリピーターとして定着しない',
        'SNSの更新が続かず、投稿が途切れがちになっている',
        'お客様の声や感想を集めたいが、方法が分からない',
        '予約の電話対応に手を取られ、調理や接客に集中できない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#ea580c' }}>来店促進</span>から<br className="sm:hidden" />
          リピートまで一気通貫
        </>
      }
      benefitDescription="予約の自動化・再来店の仕組み・お客様の声の収集を、すべて無料のツールで実現します。"
      benefits={[
        {
          icon: CalendarCheck,
          title: '来店のきっかけをつくる',
          description: '予約フォームで24時間自動受付。電話対応の手間をなくし、お客様が「行きたい」と思った瞬間を逃しません。SNSやチラシからワンタップで予約完了。',
        },
        {
          icon: Gift,
          title: 'リピートを仕組み化する',
          description: 'デジタルスタンプカードやガチャで「また来たい」を演出。来店ごとにスタンプが貯まり、特典と交換。紙のカードと違い、忘れる・なくす心配がありません。',
        },
        {
          icon: ClipboardList,
          title: '予約・顧客の声を自動収集',
          description: '来店後のアンケートで、お客様のリアルな感想を自動で収集。改善点の発見はもちろん、高評価の声はそのまま集客に活用できます。',
        },
      ]}

      stepsTitle="お客様が「また来たい」と思う流れ"
      stepsDescription="予約 → 来店体験 → フィードバックという流れを仕組み化し、リピーターを増やします。"
      steps={[
        {
          number: 1,
          title: '予約フォームで来店のきっかけをつくる',
          description: 'オンライン予約フォームを設置して、24時間いつでも予約を受付。営業時間外や忙しい時間帯でも予約を取りこぼしません。QRコードを店頭やチラシに掲載すれば、そこから直接予約できます。',
          toolName: '予約フォーム',
          toolDescription: '24時間オンライン予約受付',
          toolUrl: '/booking',
          icon: CalendarCheck,
          color: '#ea580c',
        },
        {
          number: 2,
          title: 'スタンプカード・ガチャで再来店を促す',
          description: 'デジタルスタンプカードで来店ポイントを付与。「あと1回で特典ゲット」の心理で再来店を促進。ガチャ機能で「当たり→次回ドリンク無料」など、ゲーム感覚で楽しめる仕掛けも。',
          toolName: 'ガミフィケーション',
          toolDescription: 'スタンプカード・ガチャ',
          toolUrl: '/gamification',
          icon: Gift,
          color: '#16a34a',
        },
        {
          number: 3,
          title: '来店後アンケートでフィードバックを集める',
          description: '会計時にQRコードを見せるだけで、お客様がスマホからアンケートに回答。料理・接客・雰囲気の評価を自動集計し、改善に活かせます。高評価の声はそのまま口コミとして活用可能。',
          toolName: 'アンケート',
          toolDescription: '来店後フィードバック収集',
          toolUrl: '/survey',
          icon: ClipboardList,
          color: '#2563eb',
        },
      ]}

      supportPack={{
        packName: '飲食店集客パック',
        packDescription: '予約受付→リピート促進→フィードバック収集の流れを、プロが一緒に構築します。',
        personaSlug: 'restaurant',
        includes: [
          { icon: CalendarCheck, title: '予約フォーム初期設定代行', description: 'メニューや席数に合わせた予約フォームを作成し、QRコードも発行' },
          { icon: Gift, title: 'スタンプカード・特典設計', description: 'お店のコンセプトに合ったスタンプカードと特典内容を一緒に設計' },
          { icon: ClipboardList, title: 'アンケート設問設計', description: '回答率が高まる設問構成で、来店後アンケートを作成' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        'アンケートを無料で作成・公開',
        '診断クイズをAIで自動生成',
        'ガミフィケーション（スタンプカード・ガチャ）を無料で作成',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: '予約フォームで24時間自動予約受付', plan: 'Standard' },
        { text: 'ファネルで予約→来店→リピートの導線を一元管理', plan: 'Standard' },
        { text: 'メルマガで常連客にキャンペーン情報を一斉配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: '駅から少し離れた立地のカフェで、グルメサイトに月3万円払っても新規は月10組程度。リピーターも「なんとなく」で来てくれる人頼みで、安定しなかった。紙のスタンプカードは忘れる人が多く、効果が見えなかった。',
        after: '予約フォームを設置してSNSから直接予約できるようにしたら、グルメサイトを解約しても新規が月20組に。デジタルスタンプカードでリピート率が35%→60%に向上。アンケートで「コーヒーの種類を増やしてほしい」という声をもらい、メニュー改善にも活かせている。',
        persona: '30代女性・カフェオーナー（開業2年目）のイメージ',
      }}

      faqItems={[
        { question: '予約フォームは無料で使えますか？', answer: '予約フォームはStandardプラン（月額1,980円）からご利用いただけます。アンケートやガミフィケーション（スタンプカード・ガチャ）はフリープランで無料作成・公開できます。' },
        { question: 'スタンプカードはお客様のスマホで使えますか？', answer: 'はい、お客様はアプリ不要でスマホのブラウザからスタンプカードを利用できます。QRコードを読み取るだけで、簡単にスタンプを貯められます。' },
        { question: 'アンケートの回答はどこで確認できますか？', answer: 'ダッシュボードからリアルタイムで回答結果を確認できます。グラフ表示で傾向を把握し、個別の回答内容も確認可能です。' },
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
