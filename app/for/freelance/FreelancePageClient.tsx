'use client';

import PersonaLPLayout from '@/components/home/PersonaLPLayout';
import { UserCircle, Sparkles, Calendar, Users, Zap, TrendingUp } from 'lucide-react';

export default function FreelancePageClient() {
  return (
    <PersonaLPLayout
      badge="フリーランス・SNS発信者の方へ"
      headline={
        <>
          フォロワーを、<br />
          <span style={{ color: '#3b82f6' }}>「お客様」に変える。</span>
        </>
      }
      subheadline="毎日がんばって発信しているのに、売上につながらない。それは「仕組み」がないから。フォロワーが自然にお客様に変わる流れを、今日からつくれます。"
      heroColor="#3b82f6"
      heroBgGradient="linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)"

      empathyTitle="こんなことで悩んでいませんか？"
      empathyItems={[
        'フォロワーは増えているのに、売上が増えない',
        'DMで問い合わせが来ても、予約の日程調整が面倒',
        '「何をやっている人か」がフォロワーに伝わっていない気がする',
        '投稿のネタ切れで、発信を続けるのがしんどい',
        'lit.linkやLinktreeを使っているけど、差別化できない',
      ]}

      benefitTitle={
        <>
          発信が<span style={{ color: '#3b82f6' }}>「集客」</span>に変わる<br className="sm:hidden" />
          3つの仕組み
        </>
      }
      benefitDescription="SNSの発信力をそのまま売上に変える。あなただけの集客ファネルを無料で構築できます。"
      benefits={[
        {
          icon: Users,
          title: '「何者か」が一目で伝わる',
          description: 'プロフィールLPで、あなたのサービス・実績・人柄を1ページに凝縮。lit.linkの代わりに、もっと伝わるページを。',
        },
        {
          icon: Zap,
          title: '興味を「行動」に変える',
          description: '「あなたのタイプ診断」で見込み客の興味を引き、結果画面からサービスページへ自然に誘導。楽しいから拡散もされます。',
        },
        {
          icon: TrendingUp,
          title: '予約が自動で入る',
          description: '予約フォームを設置すれば、DMでのやり取り不要。空き状況を見てそのまま予約完了。取りこぼしゼロに。',
        },
      ]}

      stepsTitle="フォロワーがお客様に変わる3ステップ"
      stepsDescription="この流れをつくるだけで、SNSの発信が「集客の仕組み」になります。"
      steps={[
        {
          number: 1,
          title: '「あなたのすべて」が伝わるページをつくる',
          description: 'サービス内容・料金・お客様の声・予約ボタンを1ページにまとめたプロフィールLP。SNSのプロフィール欄に貼るだけで、フォロワーがあなたのサービスを理解できます。',
          toolName: 'プロフィールLP',
          toolDescription: 'lit.linkより伝わるページ',
          icon: UserCircle,
          color: '#3b82f6',
        },
        {
          number: 2,
          title: '「思わずやりたくなる」診断で接点をつくる',
          description: '「あなたに合ったダイエット法は？」「あなたの強みタイプ診断」など、ターゲットが思わずシェアしたくなる診断クイズ。結果画面にあなたのサービスを自然に紹介できます。',
          toolName: '診断クイズ',
          toolDescription: 'AIが質問・結果を自動生成',
          icon: Sparkles,
          color: '#10b981',
        },
        {
          number: 3,
          title: '予約・申込を自動化する',
          description: '「いつ空いてますか？」のDMやり取りは卒業。カレンダー型の予約フォームで、見込み客がそのまま予約完了。あなたは承認するだけです。',
          toolName: '予約フォーム',
          toolDescription: '日程調整を自動化',
          icon: Calendar,
          color: '#f59e0b',
        },
      ]}

      testimonial={{
        before: 'Instagramのフォロワーは3,000人いるのに、月の売上は5万円程度。DMで予約のやり取りをするのが面倒で、返信が遅れてお客様を逃すことも。プロフィールのリンクはlit.linkだけど、サービス内容がうまく伝わっていなかった。',
        after: 'プロフィールLPに変えたら「サービスの全体像が分かりやすい」と好評。診断クイズがストーリーでシェアされて新規フォロワーが増え、予約フォームを設置したら月15件の予約が自動で入るように。売上は月25万円に。',
        persona: '20代女性・パーソナルスタイリスト（フリーランス）のイメージ',
      }}

      otherTypes={[
        { label: 'これから起業する方', href: '/for/starter', color: '#f59e0b' },
        { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
        { label: 'コンテンツ販売者', href: '/for/creator', color: '#ec4899' },
        { label: '店舗・教室・サロン', href: '/for/shop', color: '#10b981' },
        { label: '法人・チーム', href: '/for/business', color: '#8b5cf6' },
      ]}
    />
  );
}
