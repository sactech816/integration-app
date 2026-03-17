export interface StepEmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'welcome' | 'education' | 'sales';
  icon: string;
  steps: {
    delay_days: number;
    subject: string;
    html_content: string;
  }[];
}

export const STEP_EMAIL_TEMPLATES: StepEmailTemplate[] = [
  // --- ウェルカム系 ---
  {
    id: 'welcome-3step',
    name: 'ウェルカム3通',
    description: '登録直後〜2日後の基本挨拶',
    category: 'welcome',
    icon: '👋',
    steps: [
      {
        delay_days: 0,
        subject: 'ご登録ありがとうございます！',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">ご登録ありがとうございます！</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">{{送信者名}}にご登録いただきありがとうございます。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">これから役立つ情報をお届けしていきますので、楽しみにしていてください。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;">まずは簡単に自己紹介させてください。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに自己紹介を記入してください。</p>
</div>`,
      },
      {
        delay_days: 1,
        subject: '最初にお伝えしたい大切なこと',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">最初にお伝えしたい大切なこと</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">今日は、私がなぜこの活動をしているのか、その想いをお伝えします。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにストーリーや想いを記入してください。</p>
</div>`,
      },
      {
        delay_days: 2,
        subject: 'お役立ち情報のご紹介',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">すぐに使えるお役立ち情報</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">今日は、すぐに実践できる具体的なノウハウをお伝えします。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに具体的なノウハウを記入してください。</p>
<a href="#" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">詳しくはこちら</a>
</div>`,
      },
    ],
  },
  {
    id: 'welcome-5step',
    name: 'ウェルカム5通',
    description: '1週間かけて信頼構築',
    category: 'welcome',
    icon: '🤝',
    steps: [
      {
        delay_days: 0,
        subject: 'ようこそ！まずはお礼とご案内',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">ようこそ！ご登録ありがとうございます</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">{{送信者名}}にご登録いただきありがとうございます。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">これから5通のメールで、あなたに役立つ情報をお届けします。</p>
<div style="background:#f0f9ff;border-radius:12px;padding:20px;margin:20px 0;">
<p style="font-size:14px;color:#1e40af;font-weight:600;margin-bottom:8px;">📬 配信スケジュール</p>
<p style="font-size:14px;color:#374151;line-height:1.6;">1通目: 今日（ご挨拶）<br/>2通目: 明日（私の想い）<br/>3通目: 3日後（基礎知識）<br/>4通目: 5日後（実践テクニック）<br/>5通目: 7日後（特別なご案内）</p>
</div>
</div>`,
      },
      {
        delay_days: 1,
        subject: '私がこの活動を始めた理由',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">なぜこの活動を始めたのか</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;">今日は、私がなぜこの活動をしているのか、お話しさせてください。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにストーリーを記入してください。</p>
</div>`,
      },
      {
        delay_days: 3,
        subject: 'まず知っておきたい基礎知識',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">押さえておきたい基礎知識</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;">今日は基礎をしっかりお伝えします。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに基礎知識を記入してください。</p>
</div>`,
      },
      {
        delay_days: 5,
        subject: '実践テクニック〜すぐに使えるコツ',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">今日から使える実践テクニック</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;">実際に私が成果を出したテクニックをご紹介します。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに実践テクニックを記入してください。</p>
</div>`,
      },
      {
        delay_days: 7,
        subject: '特別なご案内があります',
        html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">最後に、特別なご案内</h1>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">5日間お付き合いいただきありがとうございました。</p>
<p style="font-size:16px;line-height:1.8;color:#374151;">最後に、あなたに特別なご案内があります。</p>
<p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにオファーを記入してください。</p>
<a href="#" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">詳しくはこちら</a>
</div>`,
      },
    ],
  },

  // --- 教育系 ---
  {
    id: 'education-7day',
    name: '7日間講座',
    description: '毎日1通の無料講座形式',
    category: 'education',
    icon: '📚',
    steps: [
      { delay_days: 0, subject: '【1日目】講座スタート！全体像をお伝えします', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 1 / 7</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">{{送信者名}}の7日間講座へようこそ！</p><p style="font-size:16px;line-height:1.8;color:#374151;">まずは全体像をお伝えします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに1日目の内容を記入してください。</p></div>` },
      { delay_days: 1, subject: '【2日目】基礎を固めましょう', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 2 / 7</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;">こんにちは。2日目は基礎について学びます。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに2日目の内容を記入してください。</p></div>` },
      { delay_days: 2, subject: '【3日目】よくある間違いと対策', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 3 / 7</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;">3日目は多くの人がやりがちな間違いについてです。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに3日目の内容を記入してください。</p></div>` },
      { delay_days: 3, subject: '【4日目】実践ワーク', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 4 / 7</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;">折り返し地点です！今日は実践してみましょう。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに4日目の内容を記入してください。</p></div>` },
      { delay_days: 4, subject: '【5日目】応用テクニック', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 5 / 7</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;">5日目は応用テクニックをお伝えします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに5日目の内容を記入してください。</p></div>` },
      { delay_days: 5, subject: '【6日目】成功事例の紹介', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 6 / 7</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;">6日目は実際の成功事例をご紹介します。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに6日目の内容を記入してください。</p></div>` },
      { delay_days: 6, subject: '【最終日】まとめと次のステップ', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;"><p style="font-size:12px;opacity:0.8;margin-bottom:4px;">7日間無料講座</p><h1 style="font-size:22px;margin:0;">Day 7 / 7 🎉</h1></div><p style="font-size:16px;line-height:1.8;color:#374151;">7日間お疲れさまでした！最後にまとめと次のステップをお伝えします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに最終日の内容を記入してください。</p><a href="#" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">次のステップはこちら</a></div>` },
    ],
  },

  // --- セールス系 ---
  {
    id: 'sales-funnel',
    name: 'セールスファネル',
    description: '価値提供→オファーの5通構成',
    category: 'sales',
    icon: '🎯',
    steps: [
      { delay_days: 0, subject: 'プレゼントをお届けします', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">プレゼントをお届けします！</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">{{送信者名}}にご登録いただきありがとうございます。</p><p style="font-size:16px;line-height:1.8;color:#374151;">お約束のプレゼントをお届けします。</p><a href="#" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">プレゼントを受け取る</a></div>` },
      { delay_days: 1, subject: 'プレゼントはご覧いただけましたか？', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">プレゼントはご覧いただけましたか？</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">昨日お送りしたプレゼントはいかがでしたか？</p><p style="font-size:16px;line-height:1.8;color:#374151;">今日は、さらに踏み込んだ内容をお伝えします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに追加の価値提供を記入してください。</p></div>` },
      { delay_days: 3, subject: '多くの方が抱える悩みとその解決法', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">こんなお悩みはありませんか？</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">多くの方から「〇〇で悩んでいます」というお声をいただきます。</p><p style="font-size:16px;line-height:1.8;color:#374151;">今日はその解決法をお伝えします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに課題提起と解決法を記入してください。</p></div>` },
      { delay_days: 5, subject: '成果を出された方のお声をご紹介', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">実際に成果を出された方のお声</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">今日は、実際に成果を出された方の声をご紹介します。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにお客様の声・事例を記入してください。</p></div>` },
      { delay_days: 7, subject: '【期間限定】特別なご案内', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">特別なご案内</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">1週間にわたりお読みいただき、ありがとうございました。</p><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">最後に、メール読者様限定の特別なご案内があります。</p><p style="font-size:14px;color:#6b7280;margin-top:16px;">ここにオファー内容を記入してください。</p><a href="#" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">今すぐ詳細を見る</a><p style="font-size:13px;color:#9ca3af;margin-top:12px;">※ このご案内は期間限定です</p></div>` },
    ],
  },
  {
    id: 'launch-sequence',
    name: 'ローンチ告知',
    description: '新商品・サービスの告知用4通',
    category: 'sales',
    icon: '🚀',
    steps: [
      { delay_days: 0, subject: '【予告】新しいお知らせがあります', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">大切なお知らせの予告</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">こんにちは。{{送信者名}}です。</p><p style="font-size:16px;line-height:1.8;color:#374151;">近日中に、とても大切なお知らせがあります。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにティーザー内容を記入してください。</p></div>` },
      { delay_days: 2, subject: '【公開】お待たせしました！', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">ついに公開です！</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">お待たせしました。準備が整いましたのでご案内いたします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにサービス紹介を記入してください。</p><a href="#" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">詳細はこちら</a></div>` },
      { delay_days: 4, subject: 'よくいただくご質問にお答えします', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">Q&A: よくいただくご質問</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">前回のご案内について、いくつかご質問をいただきましたので、お答えします。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここにFAQを記入してください。</p></div>` },
      { delay_days: 6, subject: '【最終案内】まもなく締め切りです', html_content: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;"><div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;"><p style="font-size:14px;color:#dc2626;font-weight:600;">⏰ まもなく締め切りです</p></div><h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">最終のご案内です</h1><p style="font-size:16px;line-height:1.8;color:#374151;margin-bottom:16px;">これが最後のご案内になります。</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">ここに最終案内を記入してください。</p><a href="#" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">お申し込みはこちら</a></div>` },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'welcome' as const, label: 'ウェルカム', icon: '👋' },
  { id: 'education' as const, label: '教育・講座', icon: '📚' },
  { id: 'sales' as const, label: 'セールス', icon: '🎯' },
];
