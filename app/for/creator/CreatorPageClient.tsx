'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { PenTool, GitBranch, Mail, Zap, TrendingUp, RefreshCw } from 'lucide-react';

export default function CreatorPageClient() {
  return (
    <PersonaLPLayout
      badge="コンテンツ販売者・Kindle著者の方へ"
      headline={
        <>
          良い商品があるのに、<br />
          <span style={{ color: '#ec4899' }}>売れない理由は「導線」。</span>
        </>
      }
      headlinePlainText="良い商品があるのに、売れない理由は「導線」。"
      subheadline="見込み客との関係を育て、「欲しい」と思ったタイミングで届ける。商品が売れ続ける「仕組み」をテンプレートから簡単に構築できます。"
      breadcrumbLabel="コンテンツ販売・Kindle著者の方へ"
      breadcrumbSlug="creator"
      heroColor="#ec4899"
      heroBgGradient="linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        '良い商品をつくったのに、思ったように売れない',
        'SNSで告知しても反応が薄く、販売のたびに疲弊する',
        '「売り込み」が苦手で、セールスレターを書くのがつらい',
        'メルマガをやりたいけど、何を書けばいいか分からない',
        '一度買ってくれた人に、次の商品を案内する仕組みがない',
      ]}

      benefitTitle={
        <>
          商品が<span style={{ color: '#ec4899' }}>「売れ続ける」</span><br className="sm:hidden" />
          仕組みをつくる
        </>
      }
      benefitDescription="売り込まなくても売れる。見込み客との関係を育て、自然に購入につながる流れを自動化します。"
      benefits={[
        {
          icon: Zap,
          title: '売れる文章をAIが書く',
          description: 'セールスライターが、あなたの商品の魅力を最大限に引き出すセールスレターを自動生成。「売り込み」ではなく「価値を伝える」文章に。',
        },
        {
          icon: TrendingUp,
          title: '見込み客を自動で育てる',
          description: 'ファネルで、認知→興味→検討→購入の流れを自動構築。一度つくれば、あなたが寝ている間も見込み客が育ちます。',
        },
        {
          icon: RefreshCw,
          title: 'リピーターが生まれる',
          description: 'メルマガで購入者との関係を維持。新商品のお知らせ、お役立ち情報の配信で、一度きりのお客様がファンに変わります。',
        },
      ]}

      stepsTitle="「つくって終わり」から「売れ続ける」へ"
      stepsDescription="商品をつくるだけでなく、売れる流れまでを仕組み化します。"
      steps={[
        {
          number: 1,
          title: '「欲しい！」と思わせるセールスページをつくる',
          description: '商品名・特徴・ターゲットを入力するだけで、AIが売れるセールスレターを自動生成。ヘッドライン、ベネフィット、お客様の声、CTA — プロのライターが書いたような構成が一瞬で完成します。',
          toolName: 'セールスライター',
          toolDescription: 'AIが売れる文章を自動生成',
          toolUrl: '/salesletter',
          icon: PenTool,
          color: '#ec4899',
        },
        {
          number: 2,
          title: '認知→購入の流れを自動化する',
          description: 'ファネルで「無料コンテンツ→メルマガ登録→ステップメール→商品案内」の導線を構築。見込み客が自然に購入に至る流れをつくれば、毎回SNSで告知する必要はありません。',
          toolName: 'ファネル',
          toolDescription: '集客導線を一元管理',
          toolUrl: '/funnel',
          icon: GitBranch,
          color: '#8b5cf6',
        },
        {
          number: 3,
          title: 'メルマガで関係を育て、次も売る',
          description: '購入者・見込み客リストに定期的にメルマガを配信。お役立ち情報で信頼を積み重ね、新商品のリリース時には「待ってました！」と言ってもらえる関係を。',
          toolName: 'メルマガ',
          toolDescription: '配信・リスト管理を簡単に',
          toolUrl: '/newsletter',
          icon: Mail,
          color: '#10b981',
        },
      ]}

      freeFeatures={[
        'セールスレターをAIで自動生成',
        'ファネルで集客導線を構築',
        '診断クイズで見込み客との接点づくり',
        'アクセス解析で効果を確認',
      ]}
      upgradeFeatures={[
        { text: 'メルマガで購入者リストに一斉配信', plan: 'Standard' },
        { text: 'ステップメールで自動フォローアップ', plan: 'Standard' },
        { text: '申込フォームでデジタル商品の販売', plan: 'Standard' },
      ]}

      testimonial={{
        before: 'Kindle本を3冊出版し、累計500ダウンロード。でも読者との接点はそこで途切れ、次の商品（オンライン講座）を出しても売上は3万円。SNSで告知しても「また宣伝か」と思われている気がして辛かった。',
        after: 'Kindle本の巻末に無料診断クイズのリンクを設置し、メルマガ登録につなげる導線を構築。ステップメールで信頼を育て、オンライン講座をローンチしたら初月で30万円の売上に。しかも、メルマガ読者が自発的にSNSでシェアしてくれるようになった。',
        persona: '30代男性・オンライン講座クリエイター（副業）のイメージ',
      }}

      faqItems={[
        { question: 'セールスレターをAIで作れますか？', answer: 'はい、商品名・特徴・ターゲットを入力するだけで、AIがプロのライターが書いたようなセールスレターを自動生成します。ヘッドライン・ベネフィット・CTA構成が含まれます。無料で作成できます。' },
        { question: 'ファネル構築は無料でできますか？', answer: 'はい、基本的なファネル（集客ページ→登録→メール配信→販売ページ）はフリープランで無料構築できます。より高度な分岐やA/Bテストには有料プランをご検討ください。' },
        { question: 'Kindle本からの集客に使えますか？', answer: 'はい、Kindle本の巻末に診断クイズやプロフィールLPのリンクを設置し、そこからメルマガ登録→ステップメール→商品案内という導線を構築できます。読者をファンに変える仕組みに最適です。' },
      ]}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/starter', color: '#f59e0b' },
        { label: 'フリーランス・SNS発信者', href: '/for/freelance', color: '#3b82f6' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: '店舗・教室・サロン', href: '/for/shop', color: '#10b981' },
        { label: '法人・チーム', href: '/for/business', color: '#8b5cf6' },
      ]}
    />
  );
}
