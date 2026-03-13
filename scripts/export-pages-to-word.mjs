import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TableRow, TableCell, Table, WidthType, ShadingType } from 'docx';
import fs from 'fs';

// ===== ヘルパー =====
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, size: 32 })] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, size: 26 })] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true, size: 22 })] });
const p = (text) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text, size: 20 })] });
const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 20 })] });
const bold = (label, value) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, bold: true, size: 20 }), new TextRun({ text: value, size: 20 })] });
const hr = () => new Paragraph({ spacing: { before: 200, after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [new TextRun('')] });
const empty = () => new Paragraph({ children: [new TextRun('')] });

// ===== データ =====
const pages = [
  // --- トップページ ---
  {
    title: 'トップページ (makers.tokyo)',
    url: 'https://makers.tokyo/',
    sections: [
      {
        name: 'SEO メタデータ',
        items: [
          { label: 'title: ', value: '集客メーカー｜集客を"仕組み"にする。ひとりでも、ここまでできる。' },
          { label: 'description: ', value: 'あなたのビジネスタイプに合った集客の型を無料で。診断クイズ・LP・予約・メルマガなど、"知ってもらう"から"買ってもらう"までの流れをまるごとつくれます。' },
        ],
      },
      {
        name: '1. Hero',
        items: [
          { label: 'バッジ: ', value: 'ずっと無料 ・ クレカ登録なし ・ スマホで完結' },
          { label: 'H1: ', value: '集客を、"仕組み"にする。ひとりでも、ここまでできる。' },
          { label: 'サブ: ', value: '「知ってもらう」から「買ってもらう」まで。あなたのビジネスに合った集客の流れを、テンプレートを選ぶだけでつくれます。' },
          { label: 'CTA: ', value: 'あなたに合う集客の型を見つける → #flowchart' },
          { label: 'リンク: ', value: 'ログイン | 全ツール一覧 | みんなの作品 | はじめてガイド' },
        ],
      },
      {
        name: '2. 共感セクション',
        items: [
          { label: 'H2: ', value: 'こんなこと、感じていませんか？' },
        ],
        bullets: [
          'SNSを頑張っているのに、売上につながらない',
          'ホームページをつくりたいけど、何十万も払えない',
          '予約・申込の管理がバラバラで追いきれない',
          '良い商品があるのに、知ってもらえていない',
          '集客のために何をすればいいか分からない',
          'ツールが多すぎて、結局どれも使いこなせない',
        ],
        footer: '集客メーカーは、そのすべてを「仕組み」で解決します。',
      },
      {
        name: '3. フローチャート振り分け',
        items: [
          { label: 'H2: ', value: 'あなたに合った集客の型を見つけよう' },
          { label: 'サブ: ', value: '2つの質問に答えるだけ。あなたのビジネスにぴったりの集客ステップをご提案します。' },
        ],
        bullets: [
          'Q1: あなたの状況に近いのは？ → これから始める / ひとりでやっている / チーム・法人で運営 / 店舗・教室を持っている',
          'Q2: 一番実現したいことは？ → 認知を広げたい / 見込み客を集めたい / 売上を伸ばしたい / 業務を仕組み化したい',
          '結果: Q1×Q2の組み合わせで6つのペルソナページへ振り分け',
        ],
      },
      {
        name: '3.5. 既存HPお持ちの方向けバナー',
        items: [
          { label: 'テキスト: ', value: 'HPをつくって終わり、になっていませんか？' },
          { label: 'サブ: ', value: 'AIチャットボット＆ガイドを埋め込むだけで、動きのないサイトが24時間働く営業マンに。' },
          { label: 'リンク先: ', value: '/for/hp-activate' },
        ],
      },
      {
        name: '4. 3つの力 — なぜ集客メーカーなのか',
        items: [
          { label: 'H2: ', value: '「使えば、理想に近づける」3つの理由' },
          { label: 'サブ: ', value: '他にないから使うのではなく、使えば理想の世界に近づくから選ばれています。' },
        ],
        bullets: [
          '知ってもらえる — プロフィールLP / ビジネスLP / AI文章生成',
          'ファンになってもらえる — 診断クイズ / ガチャ / スタンプラリー 等（ここが違う！）',
          'スムーズにつながる — 予約 / 申込フォーム / メルマガ / ファネル',
        ],
      },
      {
        name: '5. 使い方3ステップ',
        items: [
          { label: 'H2: ', value: '使い方はシンプル' },
        ],
        bullets: [
          'Step 1: テンプレートを選ぶ',
          'Step 2: 文字と画像を変える',
          'Step 3: 公開してシェア',
        ],
      },
      {
        name: '6. FAQ（5問）',
        bullets: [
          'Q. 本当に無料で使えますか？→ はい、フリープランは永久無料。クレカ不要。',
          'Q. パソコンが苦手でも使えますか？→ テンプレートを選んで文字を変えるだけ。スマホからも編集可能。',
          'Q. 他のツールからの乗り換えは簡単？→ コピー＆ペーストで移行可能。',
          'Q. 商用利用は可能？→ もちろん。フリープラン・有料プランとも商用利用OK。',
          'Q. 作成したページはどこで公開？→ makers.tokyo/あなたのID で公開。',
        ],
      },
      {
        name: '7-10. その他セクション',
        bullets: [
          'PricingSection（料金プラン）',
          'PopularContents（人気の作品）',
          'Final CTA: 「あなたのビジネスを、もっと「楽しく」「楽に」。」',
          '開発支援: 「集客メーカーの開発を応援しませんか？」→ /donation',
        ],
      },
    ],
  },

  // --- ペルソナページ共通構造説明 ---
  {
    title: 'ペルソナLP 共通レイアウト（PersonaLPLayout）',
    url: '全6ペルソナページ共通',
    sections: [
      {
        name: 'セクション構成',
        bullets: [
          '1. Hero（バッジ + H1 + サブコピー + CTA「無料で始める」）',
          '2. 共感セクション（悩み5項目）',
          '3. ベネフィット（理想の世界 × 3カード）',
          '4. あなた専用の3ステップ（ツール紹介 + ツールページへのリンク）',
          '5. ビフォーアフター（BEFORE / AFTER + ペルソナ名）',
          '6. サポートパック（プロのサポート — ペルソナ別パック内容）★NEW',
          '7. 有料プラン誘導（フリープラン vs 有料プラン比較）',
          '8. FAQ（3問、構造化データ対応）',
          '9. CTA（「いつかやろう」を、今日にしませんか？）',
          '10. 他のビジネスタイプへのリンク（5件）',
        ],
      },
      {
        name: 'SEO/AEO対応',
        bullets: [
          '構造化データ: BreadcrumbList + FAQPage + HowTo',
          'data-speakable属性: H1, H2, description, testimonial等',
          'canonical URL設定済み',
          'OpenGraph + Twitter Card',
          'keywords: 「無料」×ツール名 の組み合わせ',
        ],
      },
    ],
  },

  // --- 1. Starter ---
  {
    title: '1. これから起業する方へ（/for/starter）',
    url: 'https://makers.tokyo/for/starter',
    sections: [
      {
        name: 'SEO メタデータ',
        items: [
          { label: 'title: ', value: 'これから起業する方へ｜無料の集客ツールで始める起業準備｜集客メーカー' },
          { label: 'description: ', value: '起業準備中・副業を始めたい方向け。プロフィールLP無料作成・診断クイズ無料作成・SNS投稿自動生成で「あなたを知ってもらう仕組み」をテンプレートから簡単作成。' },
        ],
      },
      {
        name: 'Hero',
        items: [
          { label: 'バッジ: ', value: 'これから起業・副業を始める方へ' },
          { label: 'H1: ', value: '何から始めればいいか、もう迷わない。' },
          { label: 'サブ: ', value: '起業の第一歩は「自分を知ってもらう仕組み」をつくること。テンプレートを選ぶだけで、今日からあなたのビジネスが動き出します。' },
          { label: 'カラー: ', value: '#f59e0b（アンバー）' },
        ],
      },
      {
        name: '共感（5項目）',
        bullets: [
          '起業したいけど、何から手をつければいいか分からない',
          'ホームページを作りたいけど、何十万も払う余裕がない',
          'SNSアカウントはあるけど、ビジネスにつながっていない',
          '自分のスキルや経験をどう見せればいいか分からない',
          '「まずは名刺代わりのWebページを」と思いつつ、手が止まっている',
        ],
      },
      {
        name: 'ベネフィット',
        items: [
          { label: 'H2: ', value: '「自分を知ってもらう」が今日からできる' },
          { label: 'サブ: ', value: '専門知識もデザインスキルも不要。あなたの想いをかたちにするテンプレートが揃っています。' },
        ],
        bullets: [
          'あなたの魅力が伝わる — プロフィールLPで想い・実績・サービスを1ページに',
          '「何者か」が一目で分かる — 診断クイズで「あなたは○○タイプ！」と接点づくり',
          '発信が「集客」に変わる — SNS投稿メーカーでAIが自動生成',
        ],
      },
      {
        name: '3ステップ',
        items: [
          { label: 'H2: ', value: 'あなた専用の「はじめの一歩」' },
        ],
        bullets: [
          'Step 1: プロフィールLP（/profile）— テンプレートから簡単作成',
          'Step 2: 診断クイズ（/quiz）— AIが質問・結果を自動生成',
          'Step 3: SNS投稿メーカー（/sns-post）— AI自動生成＆テンプレート',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: 'アメブロとInstagramで発信していたけど、サービス内容を伝えるページがなく、問い合わせはDMで月1件あるかないか。' },
          { label: 'AFTER: ', value: 'プロフィールLPをつくってSNSに貼ったら「サービス内容がよく分かった」と好評。診断クイズをシェアしたら友人経由で初めてのお客様が。月5件のお問い合わせが来るように。' },
          { label: 'ペルソナ: ', value: '30代女性・ヨガインストラクター（起業準備中）' },
        ],
      },
      {
        name: 'サポートパック: 起業スタートパック',
        bullets: [
          'ビジネスコンセプト整理 — ヒアリングであなたの強み・ターゲットを明確化',
          'プロフィールLP作成サポート — コンセプトを反映した自己紹介ページを一緒に作成',
          '初期集客プラン設計 — 診断クイズ + SNS投稿の初期設計をサポート',
          '30日間メールサポート — 運用開始後の疑問や改善相談に対応',
        ],
      },
      {
        name: '無料 vs 有料',
        bullets: [
          '【無料】プロフィールLP無制限 / 診断クイズAI生成 / SNS投稿AI生成 / アクセス解析',
          '【Standard〜】ビジネスLP / 予約フォーム / メルマガ',
        ],
      },
    ],
  },

  // --- 2. Freelance ---
  {
    title: '2. フリーランス・SNS発信者の方へ（/for/freelance）',
    url: 'https://makers.tokyo/for/freelance',
    sections: [
      {
        name: 'Hero',
        items: [
          { label: 'H1: ', value: 'フォロワーを、「お客様」に変える。' },
          { label: 'サブ: ', value: '毎日がんばって発信しているのに、売上につながらない。それは「仕組み」がないから。' },
          { label: 'カラー: ', value: '#3b82f6（ブルー）' },
        ],
      },
      {
        name: '共感（5項目）',
        bullets: [
          'フォロワーは増えているのに、売上が増えない',
          'DMで問い合わせが来ても、予約の日程調整が面倒',
          '「何をやっている人か」がフォロワーに伝わっていない',
          '投稿のネタ切れで、発信を続けるのがしんどい',
          'lit.linkやLinktreeを使っているけど、差別化できない',
        ],
      },
      {
        name: '3ステップ',
        bullets: [
          'Step 1: プロフィールLP（/profile）— lit.linkより伝わるページ',
          'Step 2: 診断クイズ（/quiz）— AIが質問・結果を自動生成',
          'Step 3: 予約フォーム（/booking）— 日程調整を自動化',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: 'Instagramフォロワー3,000人、月売上5万円。DM予約が面倒で取りこぼし。' },
          { label: 'AFTER: ', value: '月15件の予約が自動。売上は月25万円に。' },
          { label: 'ペルソナ: ', value: '20代女性・パーソナルスタイリスト（フリーランス）' },
        ],
      },
      {
        name: 'サポートパック: フリーランス集客パック',
        bullets: [
          'プロフィールLP作成サポート / SNS発信戦略 / 集客導線の設計 / 30日間メールサポート',
        ],
      },
    ],
  },

  // --- 3. Coach ---
  {
    title: '3. コーチ・コンサル・講師の方へ（/for/coach）',
    url: 'https://makers.tokyo/for/coach',
    sections: [
      {
        name: 'Hero',
        items: [
          { label: 'H1: ', value: '「実力」を正しく伝え、予約が自然に入る。' },
          { label: 'サブ: ', value: 'コーチ・コンサルの集客は「信頼」がすべて。あなたの専門性を可視化し、見込み客を育て、自然に予約につなげる仕組みを。' },
          { label: 'カラー: ', value: '#6366f1（インディゴ）' },
        ],
      },
      {
        name: '共感（5項目）',
        bullets: [
          'セッションの質には自信があるのに、新規が来ない',
          'セミナーから個別相談につながらない',
          '実績を見せたいけど、見せ方が分からない',
          'ステップメールのツールが高すぎる',
          'お客様の声をうまく活用できていない',
        ],
      },
      {
        name: '3ステップ',
        bullets: [
          'Step 1: ウェビナーLP（/webinar）— セミナー告知ページを簡単作成',
          'Step 2: ステップメール（/step-email）— 自動フォローアップ配信',
          'Step 3: 予約フォーム（/booking）— 24時間自動予約受付',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: '月2回セミナー、参加5〜8名、個別相談1〜2名。手動フォローが3日遅れに。' },
          { label: 'AFTER: ', value: '参加者平均15名。転換率40%。月8件の個別相談が安定。' },
          { label: 'ペルソナ: ', value: '40代男性・ビジネスコンサルタント（独立3年目）' },
        ],
      },
      {
        name: 'サポートパック: セミナー集客パック',
        bullets: [
          'ウェビナーLP初期設定代行 / ステップメール5通分シナリオ設計 / 予約導線の構築 / 30日間メールサポート',
        ],
      },
    ],
  },

  // --- 4. Creator ---
  {
    title: '4. コンテンツ販売者・Kindle著者の方へ（/for/creator）',
    url: 'https://makers.tokyo/for/creator',
    sections: [
      {
        name: 'Hero',
        items: [
          { label: 'H1: ', value: '良い商品があるのに、売れない理由は「導線」。' },
          { label: 'サブ: ', value: '見込み客との関係を育て、「欲しい」と思ったタイミングで届ける。商品が売れ続ける「仕組み」を。' },
          { label: 'カラー: ', value: '#ec4899（ピンク）' },
        ],
      },
      {
        name: '3ステップ',
        bullets: [
          'Step 1: セールスライター（/salesletter）— AIが売れる文章を自動生成',
          'Step 2: ファネル（/funnel）— 集客導線を一元管理',
          'Step 3: メルマガ（/newsletter）— 配信・リスト管理を簡単に',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: 'Kindle本3冊、累計500DL。オンライン講座の売上3万円。' },
          { label: 'AFTER: ', value: '診断クイズ→メルマガ登録→ステップメール→講座ローンチで初月30万円。' },
          { label: 'ペルソナ: ', value: '30代男性・オンライン講座クリエイター（副業）' },
        ],
      },
      {
        name: 'サポートパック: コンテンツ販売スタートパック',
        bullets: [
          '販売LP作成サポート / 診断クイズシナリオ設計 / ファネル設計コンサル / 30日間メールサポート',
        ],
      },
    ],
  },

  // --- 5. Shop ---
  {
    title: '5. 店舗・教室・サロンの方へ（/for/shop）',
    url: 'https://makers.tokyo/for/shop',
    sections: [
      {
        name: 'Hero',
        items: [
          { label: 'H1: ', value: 'リピーターが増え、口コミが自然に広がる。' },
          { label: 'サブ: ', value: '来店してくれたお客様が「また来たい」「友達にも教えたい」と思う体験をつくること。' },
          { label: 'カラー: ', value: '#10b981（エメラルド）' },
        ],
      },
      {
        name: '3ステップ',
        bullets: [
          'Step 1: 診断クイズ（/quiz）— AIが質問・結果を自動生成',
          'Step 2: ガチャ / スタンプラリー（/gamification）— 来店特典をゲーム化',
          'Step 3: 予約フォーム（/booking）— QRコードで即予約',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: '個人サロン2年目。リピート30%。クーポン目当てが多く月商30万円。' },
          { label: 'AFTER: ', value: 'ガチャ＆スタンプラリーでリピート率60%。口コミ新規も増え月商50万円突破。' },
          { label: 'ペルソナ: ', value: '30代女性・ネイルサロンオーナー（個人経営）' },
        ],
      },
      {
        name: 'サポートパック: 店舗集客パック',
        bullets: [
          'ホームページ作成サポート / 予約・来店促進の仕組み / Googleマップ・SNS連携アドバイス / 30日間メールサポート',
        ],
      },
    ],
  },

  // --- 6. Business ---
  {
    title: '6. 法人・チーム運営の方へ（/for/business）',
    url: 'https://makers.tokyo/for/business',
    sections: [
      {
        name: 'Hero',
        items: [
          { label: 'H1: ', value: 'マーケティング基盤を、ひとつにまとめる。' },
          { label: 'サブ: ', value: 'LP作成、リード獲得、アンケート、メール配信…バラバラのツールを行き来するのはもう終わり。' },
          { label: 'カラー: ', value: '#8b5cf6（パープル）' },
        ],
      },
      {
        name: '3ステップ',
        bullets: [
          'Step 1: ビジネスLP（/business）— テンプレートから即制作',
          'Step 2: アンケート / 申込フォーム（/survey）— ブランドに合ったフォーム',
          'Step 3: ステップメール（/step-email）— 自動メールシナリオ配信',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: 'Wix月2,000円 + Googleフォーム + Mailchimp月$30。年間15万円超。退職時引き継ぎ2ヶ月。' },
          { label: 'AFTER: ', value: 'ツール費用月額4,980円に統合。施策スピード3倍。テンプレートで担当者交代もスムーズ。' },
          { label: 'ペルソナ: ', value: '中小企業・マーケティング担当（従業員15名）' },
        ],
      },
      {
        name: 'サポートパック: 法人導入サポートパック',
        bullets: [
          '導入コンサルティング / LP・フォーム初期構築代行 / チーム運用マニュアル作成 / 60日間メール・チャットサポート',
        ],
      },
      {
        name: '有料プラン',
        bullets: [
          '【無料】ビジネスLP / アンケート・フォーム / 診断クイズ / アクセス解析',
          '【Standard〜】ステップメール / ファネル',
          '【Business〜】チーム管理・複数メンバー対応',
        ],
      },
    ],
  },

  // --- HP活性化 ---
  {
    title: '7. ホームページ活性化（/for/hp-activate）',
    url: 'https://makers.tokyo/for/hp-activate',
    sections: [
      {
        name: 'SEO メタデータ',
        items: [
          { label: 'title: ', value: 'ホームページ活性化｜AIチャットボット＆ガイドを既存HPに埋め込み｜集客メーカー' },
        ],
      },
      {
        name: 'Hero',
        items: [
          { label: 'バッジ: ', value: '既存HPをお持ちの法人・事業者の方へ' },
          { label: 'H1: ', value: 'HPをつくって終わり、になっていませんか？' },
          { label: 'サブ: ', value: 'せっかくのホームページに来た人が、何もせず帰っている。それ、コード1行で変えられます。' },
        ],
      },
      {
        name: '2つのソリューション',
        bullets: [
          'AIコンシェルジュ — 24時間365日AIチャット接客。FAQ自動学習。/concierge',
          'ガイドメーカー — ステップ形式で訪問者を案内。離脱防止。/onboarding',
        ],
      },
      {
        name: 'なぜ効果があるのか（3カード）',
        bullets: [
          '離脱を接客に変える — 閉じようとした瞬間にガイド表示',
          '24時間を稼働に変える — 深夜の問い合わせにもAI即答',
          'データで改善し続ける — よく聞かれる質問・離脱ポイントが可視化',
        ],
      },
      {
        name: '導入3ステップ',
        bullets: [
          'Step 1: コンシェルジュ/ガイドを作成する（5〜10分）',
          'Step 2: 埋め込みコードをコピーする（scriptタグ1行）',
          'Step 3: 既存HPのHTMLに貼り付ける（即日稼働）',
        ],
      },
      {
        name: '活用シーン',
        bullets: [
          'コーポレートサイト — AIが適切なページに案内',
          'サービスLP — ガイドで「自分ごと化」促進',
          'ECサイト — AIがおすすめ商品を提案',
          'SaaS — 初期設定をステップ案内',
        ],
      },
      {
        name: 'ビフォーアフター',
        items: [
          { label: 'BEFORE: ', value: '月間3,000PVで問い合わせ月2〜3件。リニューアル見積もり200万円。' },
          { label: 'AFTER: ', value: '営業時間外の問い合わせ月15件。フォーム到達率2.5倍。月額1,980円で運用。' },
          { label: 'ペルソナ: ', value: 'Web制作会社（従業員8名）' },
        ],
      },
    ],
  },

  // --- サポートページ ---
  {
    title: '8. サポートパック（/support）★NEW',
    url: 'https://makers.tokyo/support',
    sections: [
      {
        name: 'SEO メタデータ',
        items: [
          { label: 'title: ', value: 'サポートパック｜プロと一緒に集客の仕組みを構築｜集客メーカー' },
          { label: 'description: ', value: 'ひとりで悩まない。プロのサポートつきで、集客の仕組みを最短で構築。' },
        ],
      },
      {
        name: 'Hero',
        items: [
          { label: 'H1: ', value: 'ひとりで悩まない。プロと一緒に、最短で構築。' },
          { label: 'サブ: ', value: 'ツールは揃っている。でも「何から手をつければいいか分からない」—— そんなあなたに、プロが伴走しながら集客の仕組みを一緒につくります。' },
          { label: 'CTA: ', value: 'まずは無料で相談する → #inquiry' },
        ],
      },
      {
        name: 'こんな方におすすめ（5項目）',
        bullets: [
          'ツールは揃っているけど、使いこなせていない',
          '集客の仕組みをつくりたいけど、何から手をつけるか分からない',
          '自分でやるより、プロに見てもらいながら最短で成果を出したい',
          'LP・メール・予約の導線設計に自信がない',
          '一人で試行錯誤するのに疲れた',
        ],
      },
      {
        name: '6つのサポートパック',
        bullets: [
          'セミナー集客パック（コーチ・コンサル・講師向け）',
          'コンテンツ販売スタートパック（コンテンツ販売者・Kindle著者向け）',
          'フリーランス集客パック（フリーランス・SNS発信者向け）',
          '店舗集客パック（店舗・教室・サロン向け）',
          '起業スタートパック（これから起業・副業を始める方向け）',
          '法人導入サポートパック（法人・チーム運営向け）',
        ],
      },
      {
        name: 'サポートの流れ（4ステップ）',
        bullets: [
          'Step 1: 無料相談 — フォームからお問い合わせ',
          'Step 2: プラン提案 — ヒアリング内容をもとに最適な内容をご提案',
          'Step 3: 一緒に構築 — プロが伴走しながら仕組みを作成',
          'Step 4: 運用サポート — 30〜60日間のフォロー',
        ],
      },
      {
        name: '自力 vs サポートパック',
        bullets: [
          '自力: 調べるのに時間 / 不安なまま / 導線不明 / 数ヶ月かかる',
          'サポート: 迷わない / 成果が出やすい / 2〜4週間で完成 / 30日間のサポート',
        ],
      },
      {
        name: 'FAQ（5問）',
        bullets: [
          'Q. 料金は？→ ヒアリング後にお見積り。まずは無料相談。',
          'Q. どれくらいの期間？→ 2〜4週間で基本完成 + 30日(法人60日)サポート。',
          'Q. オンライン完結？→ Zoom + メールで完結。',
          'Q. ツール月額は別？→ ツールはフリープラン(¥0)のまま使える。有料は任意。',
          'Q. キャンセル可能？→ 構築開始前ならキャンセル可。',
        ],
      },
      {
        name: 'お問い合わせフォーム',
        bullets: [
          'お名前（必須） / メールアドレス（必須） / 関心のあるパック（選択） / 現在の状況（任意） / メッセージ（任意）',
          '送信先: /api/support-inquiry',
          'ペルソナLPからのリンク: /support?persona=xxx でパック自動選択',
        ],
      },
    ],
  },
];

// ===== ドキュメント生成 =====
const children = [];

// タイトルページ
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2000, after: 400 }, children: [new TextRun({ text: '集客メーカー', bold: true, size: 48 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'トップページ & ペルソナLP & サポートページ', size: 28, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'コンテンツ一覧（Word書き出し）', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: `作成日: 2026年3月13日`, size: 20, color: '666666' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'https://makers.tokyo', size: 20, color: '666666' })] }),
  hr(),
  empty(),
);

// 目次
children.push(h1('目次'));
pages.forEach((page, i) => {
  children.push(p(`${page.title}`));
});
children.push(hr());

// 各ページ
pages.forEach((page) => {
  children.push(h1(page.title));
  if (page.url) {
    children.push(bold('URL: ', page.url));
  }
  children.push(empty());

  page.sections.forEach((section) => {
    children.push(h2(section.name));
    if (section.items) {
      section.items.forEach((item) => {
        children.push(bold(item.label, item.value));
      });
    }
    if (section.bullets) {
      section.bullets.forEach((b) => {
        children.push(bullet(b));
      });
    }
    if (section.footer) {
      children.push(p(section.footer));
    }
    children.push(empty());
  });

  children.push(hr());
});

const doc = new Document({
  sections: [{ children }],
  styles: {
    default: {
      document: {
        run: { font: 'Yu Gothic', size: 20 },
      },
    },
  },
});

const buffer = await Packer.toBuffer(doc);
const outputPath = 'd:/obsidian/integration-app/集客メーカー_ページコンテンツ一覧.docx';
fs.writeFileSync(outputPath, buffer);
console.log(`Word document saved: ${outputPath}`);
