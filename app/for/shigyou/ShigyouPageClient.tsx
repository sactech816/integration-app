'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { ClipboardCheck, UserCircle, Mail, Scale, FileText, Repeat, MousePointerClick, Shield, BookOpen, Users } from 'lucide-react';

export default function ShigyouPageClient() {
  return (
    <SubBrandLPLayout personaId="startup">
    <PersonaLPLayout
      skipAuthProvider
      badge="士業（税理士・行政書士・社労士）の方へ"
      headline={
        <>
          専門性と信頼を「見える化」し、<br />
          <span style={{ color: '#1e40af' }}>相談が自然に届く仕組みへ。</span>
        </>
      }
      headlinePlainText="専門性と信頼を「見える化」し、相談が自然に届く仕組みへ。"
      subheadline="士業の集客は「この先生なら安心」と思ってもらうことがすべて。あなたの専門知識を可視化し、見込み客の不安を解消し、自然と相談予約につなげる仕組みをつくりませんか。"
      breadcrumbLabel="士業（税理士・行政書士・社労士）の方へ"
      breadcrumbSlug="shigyou"
      heroColor="#1e40af"
      heroBgGradient="linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '紹介以外の集客方法が分からず、新規の問い合わせが不安定',
        'ホームページはあるが、問い合わせがほとんど来ない',
        '専門知識はあるのに、他の事務所との違いを伝えきれない',
        'SNSやブログを更新する時間がなく、発信が続かない',
        '顧問先が高齢化しており、新しい顧客層を開拓したい',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#1e40af' }}>専門性を可視化</span>して<br className="sm:hidden" />
          相談予約につなげる
        </>
      }
      benefitDescription="あなたの専門分野・実績・解決事例を「仕組み」で伝えることで、見込み客が安心して相談に進めます。"
      benefits={[
        {
          icon: Shield,
          title: '専門性が「見える」',
          description: '診断クイズで見込み客の悩みを明確にし、「この先生は自分の問題を解決できる」と実感してもらえます。相続対策チェック、創業手続き診断など、専門分野に合わせた診断を簡単作成。',
        },
        {
          icon: BookOpen,
          title: '信頼が「育つ」',
          description: 'プロフィールLPであなたの経歴・資格・得意分野・解決事例を一箇所にまとめて公開。「顔が見える先生」として、初回相談のハードルを大幅に下げます。',
        },
        {
          icon: Users,
          title: '相談予約が「入る」',
          description: 'メルマガ・ステップメールで法改正情報や実務のポイントを定期配信。「困ったときに相談する先生」としてのポジションを確立し、相談が自然に届きます。',
        },
      ]}

      stepsTitle="見込み客が「この先生に相談しよう」と決める流れ"
      stepsDescription="診断で専門性を実感 → プロフィールで信頼を確認 → メールで関係を深めるという流れを仕組み化します。"
      steps={[
        {
          number: 1,
          title: '診断クイズで見込み客の悩みを明確にする',
          description: '「相続対策チェック診断」「会社設立の手続き診断」「助成金・補助金の受給可能性チェック」など、専門分野に特化した診断をAIで簡単作成。回答者は自分の課題を明確に認識し、「専門家に相談したい」と自然に感じます。',
          toolName: '診断クイズ',
          toolDescription: '専門分野の診断を簡単作成',
          toolUrl: '/quiz',
          icon: ClipboardCheck,
          color: '#1e40af',
        },
        {
          number: 2,
          title: 'プロフィールLPで専門家としての信頼を伝える',
          description: '資格・経歴・得意分野・解決事例・お客様の声を1ページにまとめたプロフィールLPを作成。診断結果ページからワンクリックで遷移でき、「この先生なら安心して任せられる」という確信を持ってもらえます。',
          toolName: 'プロフィールLP',
          toolDescription: '専門家としての信頼を可視化',
          toolUrl: '/profile',
          icon: UserCircle,
          color: '#059669',
        },
        {
          number: 3,
          title: 'メルマガで継続的に情報発信する',
          description: '法改正のお知らせ、実務のポイント解説、よくある質問への回答など、見込み客に役立つ情報を定期配信。「困ったときに最初に思い出す先生」というポジションを確立し、相談・依頼が自然に届くようになります。',
          toolName: 'メルマガ',
          toolDescription: '専門情報を定期配信',
          toolUrl: '/newsletter',
          icon: Mail,
          color: '#f59e0b',
        },
      ]}

      supportPack={{
        packName: '士業集客パック',
        packDescription: '診断クイズ→プロフィールLP→メルマガ配信の流れを、プロが一緒に構築します。',
        personaSlug: 'shigyou',
        includes: [
          { icon: ClipboardCheck, title: '専門分野の診断クイズ作成サポート', description: 'あなたの専門領域に合わせた診断設問をヒアリングし、最適な構成で作成' },
          { icon: UserCircle, title: 'プロフィールLP初期設定代行', description: '資格・経歴・得意分野・事例をヒアリングし、信頼感のあるLPを構築' },
          { icon: MousePointerClick, title: '相談予約への導線設計', description: '診断→プロフィール→相談予約の一連の導線を最適化' },
          { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        '診断クイズをAIで自動生成・公開',
        'プロフィールLPを無料で作成・公開',
        'ステップメールでフォローアップ自動化',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: 'メルマガで見込み客リストに一斉配信', plan: 'Standard' },
        { text: 'ファネルで診断→相談予約の導線を一元管理', plan: 'Standard' },
        { text: '予約フォームで相談受付を自動化', plan: 'Standard' },
      ]}

      testimonial={{
        before: '開業5年目、顧問先は紹介経由の12社のみ。ホームページは作ったが問い合わせは月1件あるかないか。「税理士 地域名」で検索しても上位に出ず、他の事務所との違いも伝えられていなかった。ブログを書こうにも本業が忙しく、3記事で挫折。',
        after: '「相続対策チェック診断」を作成しSNSで発信したところ、月50件以上の診断回答が。診断結果からプロフィールLPに誘導し、メルマガ登録も月15件に。3ヶ月後には月4〜5件の新規相談が安定して入るようになり、そのうち2件が顧問契約に発展。',
        persona: '40代男性・税理士（独立5年目・個人事務所）のイメージ',
      }}

      faqItems={[
        { question: '診断クイズは専門分野に合わせて作れますか？', answer: 'はい、AIが質問をもとに設問を自動生成します。相続・会社設立・労務管理・許認可など、あらゆる士業の専門分野に対応できます。生成後の編集も自由に行えます。' },
        { question: 'プロフィールLPは無料で作れますか？', answer: 'はい、プロフィールLPはフリープランで無料作成・公開できます。資格情報・経歴・得意分野・お客様の声などのテンプレートが用意されています。' },
        { question: '既存のホームページと併用できますか？', answer: 'はい、診断クイズやプロフィールLPのURLをホームページに貼るだけで連携できます。既存サイトを変更する必要はありません。' },
      ]}

      otherTypes={[
        { label: 'コーチ・コンサル・講師の方', href: '/for/coach', color: '#6366f1' },
        { label: 'これから起業する方', href: '/for/startup', color: '#f59e0b' },
        { label: '教室・スクール運営者', href: '/for/school', color: '#ec4899' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#10b981' },
      ]}
    />
    </SubBrandLPLayout>
  );
}
