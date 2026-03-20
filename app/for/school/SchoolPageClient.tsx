'use client';

import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { Sparkles, Gamepad2, Calendar, Heart, Share2, RefreshCw, FileText, MapPin, Repeat } from 'lucide-react';

export default function SchoolPageClient() {
  return (
    <SubBrandLPLayout personaId="school">
    <PersonaLPLayout
      skipAuthProvider
      badge="店舗・教室・サロンの方へ"
      headline={
        <>
          リピーターが増え、<br />
          <span style={{ color: '#10b981' }}>口コミが自然に広がる。</span>
        </>
      }
      headlinePlainText="リピーターが増え、口コミが自然に広がる。"
      subheadline="来店してくれたお客様が「また来たい」「友達にも教えたい」と思う体験をつくること。それが、広告費ゼロでも集客できる最強の仕組みです。"
      breadcrumbLabel="店舗・教室・サロンの方へ"
      breadcrumbSlug="school"
      heroColor="#10b981"
      heroBgGradient="linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '新規のお客様は来るけど、リピーターが定着しない',
        'クーポンで集客しても、安いときだけ来る人が増えるだけ',
        'Googleマップの口コミが少なく、新規が増えにくい',
        'チラシやポスティングの効果が感じられなくなった',
        'お店の「ファン」をつくりたいけど、何をすればいいか分からない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#10b981' }}>「また来たい」</span>が<br className="sm:hidden" />
          自然に生まれる仕組み
        </>
      }
      benefitDescription="楽しい体験が口コミを生み、口コミが新しいお客様を連れてくる。その好循環をつくります。"
      benefits={[
        {
          icon: Heart,
          title: '来店が「楽しい」に変わる',
          description: '来店時にガチャやスタンプラリーで「お楽しみ」を提供。「今日は何が当たるかな？」が来店の理由になります。',
        },
        {
          icon: Share2,
          title: '口コミが自然に広がる',
          description: '「あなたの○○タイプ診断」を店頭やSNSで実施。結果をシェアしたくなる設計で、お客様が勝手に宣伝してくれます。',
        },
        {
          icon: RefreshCw,
          title: 'リピーターが定着する',
          description: 'スタンプラリーで「あと○回で特典！」のモチベーションを。予約フォームで「次回予約」をその場で完了。離脱を防ぎます。',
        },
      ]}

      stepsTitle="お客様が「ファン」に変わる3ステップ"
      stepsDescription="新規集客 → 来店体験 → リピート定着の流れを楽しく仕組み化。"
      steps={[
        {
          number: 1,
          title: '診断クイズで新規のお客様と接点をつくる',
          description: '「あなたにぴったりのメニュー診断」「あなたの肌タイプ診断」など、お客様が楽しみながらあなたのお店を知れる診断クイズを作成。SNSでシェアされて、新しいお客様が自然にやってきます。',
          toolName: '診断クイズ',
          toolDescription: 'AIが質問・結果を自動生成',
          toolUrl: '/quiz',
          icon: Sparkles,
          color: '#10b981',
        },
        {
          number: 2,
          title: 'ガチャ・スタンプラリーで来店を楽しくする',
          description: '来店時にQRコードを読み取ってガチャを回す、スタンプを貯めるなど、来店自体が楽しいイベントに。「今日は何が当たるかな？」がお客様の来店動機になり、リピート率が劇的に上がります。',
          toolName: 'ガチャ / スタンプラリー',
          toolDescription: '来店特典をゲーム化',
          toolUrl: '/gamification',
          icon: Gamepad2,
          color: '#ec4899',
        },
        {
          number: 3,
          title: '次回予約をその場で完了させる',
          description: '施術後・レッスン後に「次回のご予約はこちら」とQRコードを提示。カレンダーから空き日時を選ぶだけなので、お客様も楽。「帰ったら予約しよう」の「帰ったら忘れた」を防ぎます。',
          toolName: '予約フォーム',
          toolDescription: 'QRコードで即予約',
          toolUrl: '/booking',
          icon: Calendar,
          color: '#3b82f6',
        },
      ]}

      supportPack={{
        packName: '店舗集客パック',
        packDescription: 'お店の魅力を伝え、リピーターが増える仕組みをプロが一緒に構築します。',
        personaSlug: 'school',
        includes: [
          { icon: FileText, title: 'ホームページ作成サポート', description: '店舗情報・メニュー・アクセスを見やすく配置したページを作成' },
          { icon: Gamepad2, title: '予約・来店促進の仕組み', description: '予約フォーム設定 + クーポン診断クイズの設計' },
          { icon: MapPin, title: 'Googleマップ・SNS連携アドバイス', description: 'MEO対策の基本設定をサポート' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '診断クイズを無料で作成・公開',
        'プロフィールLPでお店の魅力を発信',
        'SNS投稿文をAIで自動生成',
        'アクセス解析で反応を確認',
      ]}
      upgradeFeatures={[
        { text: 'ガチャ・スタンプラリーでリピート促進', plan: 'Standard' },
        { text: '予約フォームで次回予約を自動化', plan: 'Standard' },
        { text: 'メルマガでお客様に定期配信', plan: 'Standard' },
      ]}

      testimonial={{
        before: '個人サロンを開業して2年。新規は月5名ほど来るが、リピートは30%程度。ホットペッパーのクーポン目当ての人が多く、定価で来てくれるお客様が増えず、月商は30万円前後で頭打ちだった。',
        after: '来店時のガチャ（次回使える割引やプレゼントが当たる）とスタンプラリーを導入。お客様が「今日ガチャで当たった！」とInstagramに投稿してくれるように。リピート率が60%に上がり、口コミ経由の新規も増えて月商50万円を突破。',
        persona: '30代女性・ネイルサロンオーナー（個人経営）のイメージ',
      }}

      faqItems={[
        { question: 'ガチャやスタンプラリーは無料で作れますか？', answer: 'ガチャ・スタンプラリーはStandard以上のプランで作成できます。まずは無料の診断クイズと予約フォームから始めて、効果を実感してからアップグレードするのがおすすめです。' },
        { question: '店舗にQRコードを置くだけで使えますか？', answer: 'はい、診断クイズ・ガチャ・予約フォームそれぞれにURLが発行されるので、QRコードを印刷して店頭に設置するだけで利用開始できます。' },
        { question: '複数店舗で使えますか？', answer: 'はい、1アカウントで複数の診断クイズやガチャを作成できるので、店舗ごとに異なるコンテンツを設置できます。チーム管理にはBusiness以上のプランがおすすめです。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: 'Kindle出版者', href: '/for/kindle', color: '#f97316' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#ec4899' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
