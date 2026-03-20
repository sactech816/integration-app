'use client';

import SubBrandLPLayout from '@/components/home/SubBrandLPLayout';
import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { BookOpen, Image, Send, Lightbulb, PenTool, TrendingUp, FileText, Repeat } from 'lucide-react';

export default function KindlePageClient() {
  return (
    <SubBrandLPLayout personaId="kindle">
      <PersonaLPLayout
        skipAuthProvider
        badge="Kindle出版をしたい方へ"
        headline={
          <>
            書く・出す・売るを、<br />
            <span style={{ color: '#ec4899' }}>ぜんぶここで。</span>
          </>
        }
        headlinePlainText="書く・出す・売るを、ぜんぶここで。"
        subheadline="AIが執筆をサポートし、表紙も自動デザイン。プロフィールページとSNS投稿で販促もカバー。Kindle出版に必要なすべてが揃っています。"
        breadcrumbLabel="Kindle出版スタートキット"
        breadcrumbSlug="kindle"
        heroColor="#ec4899"
        heroBgGradient="linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)"
        empathyTitle="こんなことで悩んでいませんか？"
        empathyItems={[
          '本を出したいけど、何万文字も書けるか不安',
          '原稿はあるけど、表紙のデザインをどうすればいいか分からない',
          '出版したけど、まったく売れていない',
          'Kindleで権威付けしたいけど、何から始めればいいか分からない',
          '出版後のプロモーションの方法が分からない',
        ]}
        benefitTitle={
          <>
            <span style={{ color: '#ec4899' }}>AIが執筆パートナー</span>になる<br className="sm:hidden" />
            新しい出版体験
          </>
        }
        benefitDescription="構成づくりから執筆、表紙デザイン、販促まで。AIがあなたの出版を全面サポートします。"
        benefits={[
          {
            icon: PenTool,
            title: 'AIと一緒に書く',
            description: 'テーマを入力すれば、AIが構成・本文を自動生成。あなたの知識や経験をもとに、読まれる本に仕上げます。',
          },
          {
            icon: Image,
            title: 'プロ品質の表紙',
            description: 'Kindle表紙メーカーでAIがデザイン案を生成。売れる表紙のテンプレートも豊富に用意。',
          },
          {
            icon: TrendingUp,
            title: '出版後も売れ続ける',
            description: '著者プロフィールLP + SNS投稿メーカーで、出版後の販促も自動化。読者との接点を増やし続けます。',
          },
        ]}
        stepsTitle="出版完了までの3ステップ"
        stepsDescription="この流れで、あなただけの一冊が完成します。"
        steps={[
          {
            number: 1,
            title: 'AIと一緒に原稿を書く',
            description: 'テーマ・ターゲット読者を入力すると、AIが目次構成を提案。各章の本文もAIが下書き。あなたは加筆修正するだけで、1冊分の原稿が完成します。',
            toolName: 'Kindle出版メーカー',
            toolDescription: 'AI自動執筆＆EPUB出力',
            toolUrl: '/kindle',
            icon: BookOpen,
            color: '#ec4899',
          },
          {
            number: 2,
            title: '売れる表紙をデザインする',
            description: 'AIが複数の表紙デザイン案を生成。ジャンルに合ったテンプレートも選べます。キャッチコピーの配置もAIが最適化。',
            toolName: 'Kindle表紙メーカー',
            toolDescription: 'AIデザイン生成',
            toolUrl: '/kindle/cover/editor',
            icon: Image,
            color: '#f59e0b',
          },
          {
            number: 3,
            title: '著者ページ＆販促を準備する',
            description: '著者プロフィールLPで読者との信頼を構築。SNS投稿メーカーで出版告知の投稿を自動生成。セールスライターで販売ページの文章も作成できます。',
            toolName: 'プロフィールLP + SNS投稿',
            toolDescription: '販促ツール一式',
            toolUrl: '/profile',
            icon: Send,
            color: '#3b82f6',
          },
        ]}
        testimonial={{
          before: '本を出したいと3年間思い続けていたが、執筆が進まず挫折を繰り返していた。表紙はデザイナーに依頼するとお金がかかるし、自作では素人感が出てしまう。',
          after: 'AIの力を借りて1ヶ月で初出版を実現。表紙もプロ品質で「本出したんですね！」と周りから信頼度が一気にアップ。2冊目も制作中で、コンサル業の名刺代わりになっている。',
          persona: '40代男性・ITコンサルタント（権威付けで出版したかった）のイメージ',
        }}
        supportPack={{
          packName: 'Kindle出版サポートパック',
          packDescription: '初めての出版を成功させたい方へ。企画から販促までプロがサポートします。',
          personaSlug: 'kindle',
          includes: [
            { icon: Lightbulb, title: '出版企画サポート', description: 'テーマ選定・ターゲット設定・目次構成の相談' },
            { icon: FileText, title: '原稿レビュー', description: 'AI生成原稿の品質チェックと改善アドバイス' },
            { icon: Image, title: '表紙デザインサポート', description: '売れる表紙の方向性を一緒に検討' },
            { icon: Repeat, title: '30日間メールサポート', description: '出版後の販促・マーケティング相談' },
          ],
        }}
        freeFeatures={[
          'AI執筆でKindle原稿を生成',
          'Kindle表紙をAIでデザイン',
          '著者プロフィールLPを作成・公開',
          'SNS投稿文をAIで自動生成',
        ]}
        upgradeFeatures={[
          { text: 'セールスライターで販売ページ文章を自動作成', plan: 'Standard' },
          { text: 'サムネイルメーカーで販促画像を量産', plan: 'Standard' },
          { text: 'ステップメールで読者フォローを自動化', plan: 'Business' },
        ]}
        faqItems={[
          { question: '文章を書くのが苦手でも大丈夫ですか？', answer: 'はい、AIがテーマに沿った構成と本文を自動生成します。あなたは内容を確認・修正するだけ。専門知識や経験があれば、それをAIに伝えるだけで本になります。' },
          { question: '表紙デザインは無料で作れますか？', answer: 'はい、Kindle表紙メーカーは無料でご利用いただけます。AIが複数のデザイン案を生成し、気に入ったものを選んで調整できます。' },
          { question: '出版後のサポートはありますか？', answer: 'プロフィールLP・SNS投稿メーカー・セールスライターなど、出版後の販促に使えるツールもすべて利用可能です。' },
        ]}
        otherTypes={[
          { label: '起業準備', href: '/for/startup', color: '#f59e0b' },
          { label: 'コーチ・講師', href: '/for/coach', color: '#6366f1' },
          { label: '教室・サロン', href: '/for/school', color: '#10b981' },
          { label: 'コンテンツ販売', href: '/for/creator', color: '#8b5cf6' },
        ]}
      />
    </SubBrandLPLayout>
  );
}
