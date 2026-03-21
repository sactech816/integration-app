'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import { PenTool, Image, Mail, ShoppingCart, TrendingUp, Repeat, Package, FileText, MousePointerClick } from 'lucide-react';

export default function EcPageClient() {
  return (
    <SubBrandLPLayout personaId="creator">
    <PersonaLPLayout
      skipAuthProvider
      badge="EC・物販・D2Cの方へ"
      headline={
        <>
          商品の魅力を伝え、<br />
          <span style={{ color: '#c026d3' }}>購入につなげる。</span>
        </>
      }
      headlinePlainText="商品の魅力を伝え、購入につなげる。"
      subheadline="ECの集客は「伝え方」がすべて。売れる商品説明文・目を引く商品画像・リピートを生むメルマガで、あなたの商品の魅力を最大限に引き出しませんか。"
      breadcrumbLabel="EC・物販・D2Cの方へ"
      breadcrumbSlug="ec"
      heroColor="#c026d3"
      heroBgGradient="linear-gradient(180deg, #fdf4ff 0%, #fae8ff 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '広告費が高騰していて、利益が圧迫されている',
        '商品ページの文章に自信がなく、魅力が伝わっていない気がする',
        'リピート購入が少なく、常に新規集客に追われている',
        '商品画像やバナーを作りたいが、デザインスキルがない',
        'メルマガを始めたいが、何を書けばいいか分からない',
      ]}

      benefitTitle={
        <>
          <span style={{ color: '#c026d3' }}>売れる仕組み</span>を<br className="sm:hidden" />
          無料でつくる
        </>
      }
      benefitDescription="商品の魅力を「言葉」と「ビジュアル」で正しく伝え、一度買ったお客様がリピーターになる仕組みを構築します。"
      benefits={[
        {
          icon: PenTool,
          title: '売れる文章をAIが生成',
          description: 'セールスライターで、商品の特徴・ベネフィット・お客様の声を入力するだけで、購買意欲を高める商品説明文が完成。プロのコピーライターに依頼する必要はありません。',
        },
        {
          icon: Image,
          title: '商品の魅力を視覚的に伝える',
          description: 'サムネイルメーカーで、商品画像やバナーを簡単作成。ECサイト・SNS・広告に使える画像が、デザインスキルなしで作れます。',
        },
        {
          icon: Repeat,
          title: 'リピーターをメルマガで育成',
          description: 'メルマガで購入者に新商品・セール・お役立ち情報を定期配信。一度きりの購入を、継続的なファンへと育てます。',
        },
      ]}

      stepsTitle="「また買いたい」と思われるショップになる流れ"
      stepsDescription="商品説明 → ビジュアル訴求 → リピート促進で、売上を安定させます。"
      steps={[
        {
          number: 1,
          title: '売れる商品説明文をAIで生成する',
          description: 'セールスライターに商品の特徴やターゲットを入力するだけで、購買意欲を高める商品説明文を自動生成。「この商品が欲しい」と思わせるコピーが、あなたの代わりに書き上がります。',
          toolName: 'セールスライター',
          toolDescription: '商品説明文をAIで自動生成',
          toolUrl: '/salesletter',
          icon: PenTool,
          color: '#c026d3',
        },
        {
          number: 2,
          title: '目を引く商品画像・バナーを作成する',
          description: 'サムネイルメーカーで、商品写真を活かしたバナーやSNS投稿用の画像を作成。ECサイト・Instagram・広告クリエイティブなど、あらゆる場面で使えるビジュアルが簡単に完成します。',
          toolName: 'サムネイル',
          toolDescription: '商品画像・バナーを簡単作成',
          toolUrl: '/thumbnail',
          icon: Image,
          color: '#ec4899',
        },
        {
          number: 3,
          title: 'メルマガでリピート購入を促進する',
          description: '購入者リストにメルマガを配信し、新商品の案内・限定セール・活用Tips などを定期的にお届け。お客様との接点を保ち、「また買いたい」と思ってもらえるショップへ。',
          toolName: 'メルマガ',
          toolDescription: 'リピート購入を促進する定期配信',
          toolUrl: '/newsletter',
          icon: Mail,
          color: '#10b981',
        },
      ]}

      supportPack={{
        packName: 'EC売上アップパック',
        packDescription: '商品説明文の作成→ビジュアル制作→メルマガ配信の流れを、プロが一緒に構築します。',
        personaSlug: 'ec',
        includes: [
          { icon: FileText, title: '商品説明文の初期作成サポート', description: '主力商品の説明文をヒアリングし、売れるコピーの作成をサポート' },
          { icon: Image, title: '商品バナー・サムネイル作成ガイド', description: 'ECサイトやSNSで効果的な画像の作り方をレクチャー' },
          { icon: MousePointerClick, title: 'メルマガ配信設計', description: '購入者フォローのメルマガシナリオを一緒に設計' },
          { icon: Package, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
        ],
      }}

      freeFeatures={[
        'セールスライターで商品説明文をAI生成',
        'サムネイルメーカーで商品画像・バナー作成',
        '診断クイズをAIで自動生成',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: 'メルマガで購入者リストに一斉配信', plan: 'Standard' },
        { text: 'ファネルで集客→購入→リピートの導線を一元管理', plan: 'Standard' },
        { text: 'ステップメールで購入後フォローを自動化', plan: 'Standard' },
      ]}

      testimonial={{
        before: 'ハンドメイドアクセサリーをECで販売していたが、商品説明は「素材：シルバー、サイズ：2cm」のようなスペック情報のみ。写真もスマホで撮ったままで、月の売上は3〜5万円。リピーターはほぼゼロで、毎月SNSで必死に新規を集めていた。',
        after: 'セールスライターで「つけるだけで横顔に自信が持てる」といった感情に訴える商品説明文を作成。サムネイルでInstagram映えする商品画像に刷新したら、転換率が2倍に。メルマガで新作情報や着用コーデを配信し始めたら、リピート率が35%に向上。月の売上は15万円を超えるようになった。',
        persona: '30代女性・ハンドメイドアクセサリー EC運営者のイメージ',
      }}

      faqItems={[
        { question: 'セールスライターは無料で使えますか？', answer: 'はい、セールスライターはフリープランで無料利用できます。商品の特徴やターゲットを入力するだけで、AIが購買意欲を高める商品説明文を自動生成します。' },
        { question: 'ECサイト以外でも使えますか？', answer: 'はい、作成した商品説明文やバナー画像は、ECサイトだけでなくSNS投稿・広告・チラシなど、あらゆる販促物に活用できます。' },
        { question: 'メルマガの配信数に制限はありますか？', answer: 'フリープランでは基本的なメルマガ機能をお使いいただけます。より多くの配信数やセグメント配信が必要な場合は有料プランをご検討ください。' },
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
