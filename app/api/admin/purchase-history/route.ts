import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    (email) => user.email?.toLowerCase() === email.toLowerCase()
  );
  if (!isAdmin) return null;

  return { user, supabase };
}

// 商品名マッピング
const PRODUCT_NAMES: Record<string, string> = {
  ai_pack_10: 'AI生成 10回パック',
  ai_pack_30: 'AI生成 30回パック',
  html_export: 'HTMLダウンロード',
  embed_code: '埋め込みコード発行',
  pdf_export: 'PDFダウンロード',
  copyright_hide: 'コピーライト非表示',
  csv_export: '回答データCSVエクスポート',
  analytics_month: 'アクセス解析（1ヶ月）',
  funnel_advanced: 'ファネル高機能',
  newsletter_extra_1000: 'メルマガ追加1,000通',
  footer_hide: 'フッター非表示',
  tool_unlock: 'ツール作成枠追加',
};

// BigFive テストタイプ別料金
const BIGFIVE_PDF_PRICES: Record<string, number> = {
  simple: 500,
  full: 1000,
  detailed: 2000,
};

type PurchaseRecord = {
  id: string;
  type: 'feature_purchase' | 'bigfive_pdf' | 'fortune_report' | 'point_purchase' | 'order_form' | 'subscription';
  purchasedAt: string;
  amount: number;
  productName: string;
  userId: string | null;
  userEmail: string | null;
  status: string;
  metadata?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { supabase } = auth;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '20', 10);
    const typeFilter = searchParams.get('type') || 'all';

    // 6テーブルを並列クエリ（typeFilterで必要なもののみ）
    const shouldFetch = (type: string) => typeFilter === 'all' || typeFilter === type;

    const [
      featureResult,
      bigfiveResult,
      fortuneResult,
      pointResult,
      orderFormResult,
      subscriptionResult,
    ] = await Promise.all([
      shouldFetch('feature_purchase')
        ? supabase.from('feature_purchases').select('id, user_id, product_id, price_paid, status, purchased_at, stripe_session_id').order('purchased_at', { ascending: false }).limit(500)
        : Promise.resolve({ data: [], error: null }),
      shouldFetch('bigfive_pdf')
        ? supabase.from('bigfive_results').select('id, user_id, test_type, pdf_purchased_at, created_at').eq('pdf_purchased', true).order('pdf_purchased_at', { ascending: false }).limit(500)
        : Promise.resolve({ data: [], error: null }),
      shouldFetch('fortune_report')
        ? supabase.from('fortune_results').select('id, user_id, report_purchased_at, created_at').eq('report_purchased', true).order('report_purchased_at', { ascending: false }).limit(500)
        : Promise.resolve({ data: [], error: null }),
      shouldFetch('point_purchase')
        ? supabase.from('point_transactions').select('id, user_id, amount, description, metadata, created_at').eq('type', 'purchase').order('created_at', { ascending: false }).limit(500)
        : Promise.resolve({ data: [], error: null }),
      shouldFetch('order_form')
        ? supabase.from('order_form_submissions').select('id, form_id, name, email, amount_paid, payment_provider, payment_reference, created_at').eq('payment_status', 'paid').order('created_at', { ascending: false }).limit(500)
        : Promise.resolve({ data: [], error: null }),
      shouldFetch('subscription')
        ? supabase.from('subscriptions').select('id, user_id, amount, plan_tier, plan_name, service, status, created_at').order('created_at', { ascending: false }).limit(500)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // 統合レコード構築
    const allRecords: PurchaseRecord[] = [];

    // feature_purchases
    for (const fp of featureResult.data || []) {
      allRecords.push({
        id: fp.id,
        type: 'feature_purchase',
        purchasedAt: fp.purchased_at,
        amount: fp.price_paid || 0,
        productName: PRODUCT_NAMES[fp.product_id] || fp.product_id,
        userId: fp.user_id,
        userEmail: null,
        status: fp.status || 'active',
        metadata: { stripe_session_id: fp.stripe_session_id, product_id: fp.product_id },
      });
    }

    // bigfive_results (pdf_purchased)
    for (const bf of bigfiveResult.data || []) {
      const price = BIGFIVE_PDF_PRICES[bf.test_type] || 500;
      allRecords.push({
        id: bf.id,
        type: 'bigfive_pdf',
        purchasedAt: bf.pdf_purchased_at || bf.created_at,
        amount: price,
        productName: `Big Five 診断PDF（${bf.test_type || 'simple'}）`,
        userId: bf.user_id || null,
        userEmail: null,
        status: 'active',
      });
    }

    // fortune_results (report_purchased)
    for (const fr of fortuneResult.data || []) {
      allRecords.push({
        id: fr.id,
        type: 'fortune_report',
        purchasedAt: fr.report_purchased_at || fr.created_at,
        amount: 500,
        productName: '生年月日診断プレミアムレポート',
        userId: fr.user_id || null,
        userEmail: null,
        status: 'active',
      });
    }

    // point_transactions (type = 'purchase')
    for (const pt of pointResult.data || []) {
      const meta = pt.metadata as Record<string, unknown> | null;
      allRecords.push({
        id: pt.id,
        type: 'point_purchase',
        purchasedAt: pt.created_at,
        amount: (meta?.amount_paid as number) || 0,
        productName: pt.description || 'ポイント購入',
        userId: pt.user_id,
        userEmail: null,
        status: 'active',
        metadata: meta || undefined,
      });
    }

    // order_form_submissions (payment_status = 'paid')
    for (const of_ of orderFormResult.data || []) {
      allRecords.push({
        id: of_.id,
        type: 'order_form',
        purchasedAt: of_.created_at,
        amount: of_.amount_paid || 0,
        productName: '申込フォーム決済',
        userId: null,
        userEmail: of_.email || null,
        status: 'paid',
        metadata: { name: of_.name, form_id: of_.form_id, payment_provider: of_.payment_provider },
      });
    }

    // subscriptions
    for (const sub of subscriptionResult.data || []) {
      const serviceName = sub.service === 'kdl' ? 'KDL' : '集客メーカー';
      allRecords.push({
        id: sub.id,
        type: 'subscription',
        purchasedAt: sub.created_at,
        amount: sub.amount || 0,
        productName: `${serviceName} ${sub.plan_name || sub.plan_tier}`,
        userId: sub.user_id,
        userEmail: null,
        status: sub.status || 'active',
      });
    }

    // 日付降順ソート
    allRecords.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    // サマリー計算
    const summary = {
      totalAmount: allRecords.reduce((sum, r) => sum + r.amount, 0),
      totalCount: allRecords.length,
      anonymousCount: allRecords.filter(r => !r.userId && !r.userEmail).length,
    };

    // ページネーション
    const totalCount = allRecords.length;
    const startIndex = (page - 1) * perPage;
    const pageRecords = allRecords.slice(startIndex, startIndex + perPage);

    // 現ページのuser_idからメールを解決
    const uniqueUserIds = [...new Set(
      pageRecords.map(r => r.userId).filter((id): id is string => id !== null)
    )];

    const emailMap: Record<string, string> = {};
    if (uniqueUserIds.length > 0) {
      const emailResults = await Promise.all(
        uniqueUserIds.map(async (uid) => {
          try {
            const { data } = await supabase.auth.admin.getUserById(uid);
            return { uid, email: data.user?.email || null };
          } catch {
            return { uid, email: null };
          }
        })
      );
      for (const result of emailResults) {
        if (result.email) {
          emailMap[result.uid] = result.email;
        }
      }
    }

    // メールをレコードに反映
    const purchases = pageRecords.map(r => ({
      ...r,
      userEmail: r.userEmail || (r.userId ? emailMap[r.userId] || null : null),
    }));

    return NextResponse.json({ purchases, totalCount, summary });
  } catch (error) {
    console.error('[Admin Purchase History API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
