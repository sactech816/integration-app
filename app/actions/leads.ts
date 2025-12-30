'use server';

import { createClient } from '@supabase/supabase-js';
import { ContentType } from './analytics';

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) return null;
  
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// リードデータの型定義
export interface Lead {
  id?: string;
  content_id: string;
  content_type: ContentType;
  email: string;
  name?: string;
  phone?: string;
  message?: string;
  result_type?: string;  // クイズの結果タイプ
  created_at?: string;
}

/**
 * リードを保存
 */
export async function saveLead(
  contentId: string,
  contentType: ContentType,
  email: string,
  additionalData?: {
    name?: string;
    phone?: string;
    message?: string;
    resultType?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      console.warn('[Leads] Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }

    // デモは保存しない
    if (contentId === 'demo' || !contentId) {
      return { success: true };
    }

    // メールバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const { error } = await supabase
      .from('leads')
      .insert([{
        content_id: contentId,
        content_type: contentType,
        email,
        name: additionalData?.name || null,
        phone: additionalData?.phone || null,
        message: additionalData?.message || null,
        result_type: additionalData?.resultType || null,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('[Leads] Insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Leads] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * 特定のコンテンツのリードを取得
 */
export async function getLeads(
  contentId: string,
  contentType: ContentType
): Promise<Lead[]> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Leads] Fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Leads] Unexpected error:', error);
    return [];
  }
}

/**
 * ユーザーの全リードを取得
 */
export async function getAllLeadsByUser(
  userId: string,
  contentType?: ContentType
): Promise<{
  leads: Lead[];
  contentIds: string[];
}> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { leads: [], contentIds: [] };
    }

    // まずユーザーのコンテンツIDを取得
    let contentIds: string[] = [];
    
    if (!contentType || contentType === 'quiz') {
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('slug')
        .eq('user_id', userId);
      contentIds = [...contentIds, ...(quizzes?.map(q => q.slug) || [])];
    }
    
    if (!contentType || contentType === 'profile') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('slug')
        .eq('user_id', userId);
      contentIds = [...contentIds, ...(profiles?.map(p => p.slug) || [])];
    }
    
    if (!contentType || contentType === 'business') {
      const { data: businessLps } = await supabase
        .from('business_lps')
        .select('slug')
        .eq('user_id', userId);
      contentIds = [...contentIds, ...(businessLps?.map(b => b.slug) || [])];
    }

    if (contentIds.length === 0) {
      return { leads: [], contentIds: [] };
    }

    // リードを取得
    let query = supabase
      .from('leads')
      .select('*')
      .in('content_id', contentIds)
      .order('created_at', { ascending: false });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Leads] Fetch error:', error);
      return { leads: [], contentIds: [] };
    }

    return { 
      leads: data || [],
      contentIds 
    };
  } catch (error) {
    console.error('[Leads] Unexpected error:', error);
    return { leads: [], contentIds: [] };
  }
}

/**
 * リードをCSV形式で出力
 */
export async function exportLeadsAsCsv(
  contentId: string,
  contentType: ContentType
): Promise<{ csv: string; count: number }> {
  const leads = await getLeads(contentId, contentType);
  
  if (leads.length === 0) {
    return { csv: '', count: 0 };
  }

  // CSVヘッダー
  const headers = ['メールアドレス', '名前', '電話番号', 'メッセージ', '結果タイプ', '登録日時'];
  
  // CSVボディ
  const rows = leads.map(lead => [
    lead.email,
    lead.name || '',
    lead.phone || '',
    lead.message?.replace(/"/g, '""') || '',
    lead.result_type || '',
    lead.created_at ? new Date(lead.created_at).toLocaleString('ja-JP') : ''
  ]);

  // CSV生成
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // BOM付きUTF-8
  const bom = '\uFEFF';
  
  return { 
    csv: bom + csvContent, 
    count: leads.length 
  };
}






























