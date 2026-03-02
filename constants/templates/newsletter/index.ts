/**
 * メルマガテンプレートプリセット
 * 基本5種 + 業種別3種
 */

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'industry';
  icon: string;
  header_html: string;
  body_html: string;
  footer_html: string;
}

// ========================================
// 共通パーツ
// ========================================

const DEFAULT_HEADER = `<div style="text-align:center;padding:24px 16px 16px;border-bottom:2px solid #7c3aed;">
  <h1 style="margin:0;font-size:20px;font-weight:bold;color:#1f2937;">{{ニュースレター名}}</h1>
</div>`;

const DEFAULT_FOOTER = `<div style="text-align:center;padding:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
  <p style="margin:0 0 8px;">このメールは {{送信者名}} からお届けしています。</p>
</div>`;

// ========================================
// 基本テンプレート 5種
// ========================================

const announcement: NewsletterTemplate = {
  id: 'announcement',
  name: 'お知らせ',
  description: 'シンプルな告知・お知らせメール',
  category: 'basic',
  icon: '📢',
  header_html: DEFAULT_HEADER,
  body_html: `<div style="padding:24px 16px;">
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#1f2937;">お知らせのタイトル</h2>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    いつもご利用いただきありがとうございます。<br>
    本日は重要なお知らせがございます。
  </p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    ここにお知らせの内容を記載してください。
  </p>
  <div style="text-align:center;margin:24px 0;">
    <a href="#" style="display:inline-block;padding:12px 32px;background-color:#7c3aed;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px;">詳しくはこちら</a>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

const sale: NewsletterTemplate = {
  id: 'sale',
  name: 'セール告知',
  description: '限定オファー・割引案内メール',
  category: 'basic',
  icon: '🏷️',
  header_html: `<div style="text-align:center;padding:24px 16px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#ffffff;">
  <h1 style="margin:0;font-size:24px;font-weight:bold;">🎉 期間限定セール開催中！</h1>
  <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">今だけの特別価格をお見逃しなく</p>
</div>`,
  body_html: `<div style="padding:24px 16px;">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="display:inline-block;padding:8px 20px;background-color:#fef3c7;color:#92400e;font-weight:bold;border-radius:20px;font-size:14px;">⏰ 〇月〇日まで</span>
  </div>
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#1f2937;text-align:center;">対象商品・サービス名</h2>
  <div style="text-align:center;margin:16px 0;">
    <span style="font-size:16px;color:#6b7280;text-decoration:line-through;">通常価格 ¥XX,XXX</span>
    <br>
    <span style="font-size:28px;font-weight:bold;color:#dc2626;">特別価格 ¥XX,XXX</span>
  </div>
  <p style="margin:16px 0;font-size:15px;line-height:1.8;color:#374151;text-align:center;">
    商品・サービスの魅力をここに記載してください。
  </p>
  <div style="text-align:center;margin:24px 0;">
    <a href="#" style="display:inline-block;padding:14px 40px;background-color:#dc2626;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;font-size:16px;">今すぐ申し込む</a>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

const column: NewsletterTemplate = {
  id: 'column',
  name: 'コラム/ブログ',
  description: '記事・コンテンツ配信メール',
  category: 'basic',
  icon: '📝',
  header_html: DEFAULT_HEADER,
  body_html: `<div style="padding:24px 16px;">
  <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">Vol.XX ── {{日付}}</p>
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#1f2937;">コラムのタイトル</h2>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    こんにちは。{{送信者名}}です。
  </p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    今回のテーマは「〇〇〇」についてです。<br>
    最近こんなことがありました…
  </p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    コラムの本文をここに記載してください。<br>
    読みやすい文章を心がけましょう。
  </p>
  <div style="padding:16px;background-color:#f3f4f6;border-radius:8px;margin:24px 0;">
    <p style="margin:0;font-size:14px;font-weight:bold;color:#374151;">💡 今日のポイント</p>
    <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
      ここに要約やポイントを記載
    </p>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

const event: NewsletterTemplate = {
  id: 'event',
  name: 'イベント案内',
  description: 'セミナー・ワークショップ告知メール',
  category: 'basic',
  icon: '🎤',
  header_html: DEFAULT_HEADER,
  body_html: `<div style="padding:24px 16px;">
  <h2 style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#1f2937;">イベント名</h2>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">〜 サブタイトル 〜</p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    イベントの概要・魅力をここに記載してください。
  </p>
  <div style="padding:20px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin:24px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;width:80px;vertical-align:top;">📅 日時</td><td style="padding:8px 0;color:#1f2937;font-weight:500;">20XX年〇月〇日（〇）XX:XX〜XX:XX</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">📍 場所</td><td style="padding:8px 0;color:#1f2937;font-weight:500;">オンライン（Zoom）/ 会場名</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">💰 参加費</td><td style="padding:8px 0;color:#1f2937;font-weight:500;">無料 / ¥X,XXX</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">👥 定員</td><td style="padding:8px 0;color:#1f2937;font-weight:500;">〇名（先着順）</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0;">
    <a href="#" style="display:inline-block;padding:14px 40px;background-color:#7c3aed;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;font-size:16px;">参加を申し込む</a>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

const welcome: NewsletterTemplate = {
  id: 'welcome',
  name: 'ウェルカムメール',
  description: '新規登録者向け挨拶メール',
  category: 'basic',
  icon: '👋',
  header_html: `<div style="text-align:center;padding:32px 16px;background-color:#f5f3ff;">
  <h1 style="margin:0;font-size:24px;font-weight:bold;color:#5b21b6;">ご登録ありがとうございます！</h1>
</div>`,
  body_html: `<div style="padding:24px 16px;">
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    はじめまして！{{送信者名}}です。<br>
    メルマガにご登録いただきありがとうございます。
  </p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    このメルマガでは、以下のような情報をお届けしていきます：
  </p>
  <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:2;color:#374151;">
    <li>お届けする内容1</li>
    <li>お届けする内容2</li>
    <li>お届けする内容3</li>
  </ul>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    配信頻度は〇〇（週1回など）を予定しています。<br>
    どうぞよろしくお願いいたします！
  </p>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

// ========================================
// 業種別テンプレート 3種
// ========================================

const school: NewsletterTemplate = {
  id: 'school',
  name: '教室/スクール向け',
  description: 'レッスン案内・生徒向けお知らせ',
  category: 'industry',
  icon: '🏫',
  header_html: DEFAULT_HEADER,
  body_html: `<div style="padding:24px 16px;">
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    こんにちは！{{送信者名}}です。<br>
    いつもレッスンにご参加いただきありがとうございます。
  </p>
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#1f2937;">📚 今月のレッスンスケジュール</h2>
  <div style="padding:16px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:0 0 24px;">
    <p style="margin:0;font-size:14px;line-height:1.8;color:#166534;">
      ・〇月〇日（〇）XX:XX〜 クラス名<br>
      ・〇月〇日（〇）XX:XX〜 クラス名<br>
      ・〇月〇日（〇）XX:XX〜 クラス名
    </p>
  </div>
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#1f2937;">✨ 生徒さんの声</h2>
  <div style="padding:16px;background-color:#f9fafb;border-left:4px solid #7c3aed;margin:0 0 24px;">
    <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;font-style:italic;">
      「ここに生徒さんの感想を記載」
    </p>
  </div>
  <div style="text-align:center;margin:24px 0;">
    <a href="#" style="display:inline-block;padding:12px 32px;background-color:#7c3aed;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px;">レッスンを予約する</a>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

const consulting: NewsletterTemplate = {
  id: 'consulting',
  name: 'コンサル向け',
  description: 'ノウハウ共有・事例紹介メール',
  category: 'industry',
  icon: '💼',
  header_html: DEFAULT_HEADER,
  body_html: `<div style="padding:24px 16px;">
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    こんにちは。{{送信者名}}です。
  </p>
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#1f2937;">【成功事例】タイトル</h2>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    今回は、〇〇業界のクライアント様の成功事例をご紹介します。
  </p>
  <div style="padding:20px;background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin:0 0 24px;">
    <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#1e40af;">📊 Before → After</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#1e3a5f;">
      ・売上：月〇万円 → 月〇万円（〇%アップ）<br>
      ・集客数：〇人 → 〇人<br>
      ・期間：〇ヶ月
    </p>
  </div>
  <h3 style="margin:0 0 12px;font-size:16px;font-weight:bold;color:#1f2937;">成功のポイント</h3>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
    1. ポイント1の説明<br>
    2. ポイント2の説明<br>
    3. ポイント3の説明
  </p>
  <div style="text-align:center;margin:24px 0;">
    <a href="#" style="display:inline-block;padding:12px 32px;background-color:#7c3aed;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px;">無料相談を予約する</a>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

const ecommerce: NewsletterTemplate = {
  id: 'ecommerce',
  name: 'EC/物販向け',
  description: '新商品・おすすめ紹介メール',
  category: 'industry',
  icon: '🛍️',
  header_html: DEFAULT_HEADER,
  body_html: `<div style="padding:24px 16px;">
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#1f2937;text-align:center;">🆕 新商品のお知らせ</h2>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#374151;text-align:center;">
    今週の新着アイテム・おすすめ商品をご紹介します。
  </p>
  <div style="padding:20px;border:1px solid #e5e7eb;border-radius:12px;margin:0 0 16px;">
    <h3 style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#1f2937;">商品名</h3>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#6b7280;">
      商品の特徴や魅力をここに記載してください。
    </p>
    <p style="margin:0;font-size:18px;font-weight:bold;color:#dc2626;">¥X,XXX（税込）</p>
  </div>
  <div style="padding:20px;border:1px solid #e5e7eb;border-radius:12px;margin:0 0 24px;">
    <h3 style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#1f2937;">商品名</h3>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#6b7280;">
      商品の特徴や魅力をここに記載してください。
    </p>
    <p style="margin:0;font-size:18px;font-weight:bold;color:#dc2626;">¥X,XXX（税込）</p>
  </div>
  <div style="text-align:center;margin:24px 0;">
    <a href="#" style="display:inline-block;padding:14px 40px;background-color:#7c3aed;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;font-size:16px;">商品一覧を見る</a>
  </div>
</div>`,
  footer_html: DEFAULT_FOOTER,
};

// ========================================
// エクスポート
// ========================================

export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  announcement,
  sale,
  column,
  event,
  welcome,
  school,
  consulting,
  ecommerce,
];

export function getTemplateById(id: string): NewsletterTemplate | undefined {
  return NEWSLETTER_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: 'basic' | 'industry'): NewsletterTemplate[] {
  return NEWSLETTER_TEMPLATES.filter((t) => t.category === category);
}
