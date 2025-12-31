'use server';

import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Block, ProfileSettings } from '@/lib/types';
import { generateSlug } from '@/lib/utils';

// ビジネスプロジェクトのアナリティクスを保存
// slugベースで保存（business_projectsのIDはBIGSERIALのため、slugを識別子として使用）
export async function saveBusinessAnalytics(
  slug: string, 
  eventType: 'view' | 'click' | 'scroll' | 'time' | 'read', 
  eventData?: { 
    url?: string; 
    scrollDepth?: number; 
    timeSpent?: number; 
    readPercentage?: number;
  }
) {
  if (!supabase) {
    console.error('[Business Analytics] Supabase not available');
    return { error: 'Database not available' };
  }

  // slugの形式チェック（空文字チェック）
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    console.error('[Business Analytics] Invalid slug:', slug);
    return { error: 'Invalid slug format' };
  }

  try {
    console.log('[Business Analytics] Saving:', { slug, eventType, eventData });
    
    // slugをprofile_idカラムに保存（TEXTとして扱う）
    // content_type='business'で区別
    const insertData = {
      profile_id: slug, // slugをprofile_idに格納（ビジネスLPはslugで識別）
      event_type: eventType,
      event_data: eventData || {},
      content_type: 'business', // ビジネスLPのアナリティクスとして記録
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('analytics')
      .insert([insertData])
      .select();

    if (error) {
      console.error('[Business Analytics] Save error:', error);
      return { error: error.message };
    }

    console.log('[Business Analytics] Saved successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('[Business Analytics] Exception:', error);
    return { error: error.message };
  }
}

// ビジネスプロジェクトのアナリティクスを取得
// slugベースで取得（business_projectsのIDはBIGSERIALのため、slugを識別子として使用）
export async function getBusinessAnalytics(slug: string) {
  if (!supabase) {
    console.error('[Business Analytics] Supabase not available');
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }

  try {
    console.log('[Business Analytics] Fetching for slug:', slug);
    
    // slugでビジネスLPのアナリティクスを取得
    const { data: allEvents, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('profile_id', slug) // slugをprofile_idカラムで検索
      .eq('content_type', 'business'); // ビジネスLPのデータのみ取得

    if (error) {
      console.error('[Business Analytics] Fetch error:', error);
      return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
    }

    const views = allEvents?.filter(e => e.event_type === 'view') || [];
    const clicks = allEvents?.filter(e => e.event_type === 'click') || [];
    const scrolls = allEvents?.filter(e => e.event_type === 'scroll') || [];
    const times = allEvents?.filter(e => e.event_type === 'time') || [];
    const reads = allEvents?.filter(e => e.event_type === 'read') || [];

    // 平均スクロール深度を計算
    const scrollDepths = scrolls
      .map(e => e.event_data?.scrollDepth || 0)
      .filter(d => d > 0);
    const avgScrollDepth = scrollDepths.length > 0
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0;

    // 平均滞在時間を計算（秒）
    const timeSpents = times
      .map(e => e.event_data?.timeSpent || 0)
      .filter(t => t > 0);
    const avgTimeSpent = timeSpents.length > 0
      ? Math.round(timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length)
      : 0;

    // 精読率を計算
    const readPercentages = reads
      .map(e => e.event_data?.readPercentage || 0)
      .filter(r => r > 0);
    const readCount = readPercentages.filter(r => r >= 50).length;
    const readRate = views.length > 0 ? Math.round((readCount / views.length) * 100) : 0;

    // クリック率を計算
    const clickRate = views.length > 0 ? Math.round((clicks.length / views.length) * 100) : 0;

    const result = {
      views: views.length,
      clicks: clicks.length,
      avgScrollDepth,
      avgTimeSpent,
      readRate,
      clickRate
    };

    console.log('[Business Analytics] Calculated result:', result);
    return result;
  } catch (error: any) {
    console.error('[Business Analytics] Fetch exception:', error);
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }
}

// ビジネスプロジェクトを保存
export async function saveBusinessProject({
  slug,
  nickname,
  content,
  settings,
  userId,
  featuredOnTop
}: {
  slug: string;
  nickname: string | null;
  content: Block[];
  settings: ProfileSettings;
  userId: string | null;
  featuredOnTop: boolean;
}) {
  // Server Actions用のSupabaseクライアントを作成（クッキーから認証情報を読み取る）
  const serverSupabase = await createServerSupabaseClient();
  
  if (!serverSupabase) {
    return { error: 'Database not available' };
  }

  try {
    console.log('[BusinessProject] Saving:', { slug, nickname, userId, blocksCount: content?.length });

    // 既存レコードをチェック（maybeSingleで0件の場合もエラーにならない）
    const { data: existing } = await serverSupabase
      .from('business_projects')
      .select('id, user_id, nickname')
      .eq('slug', slug)
      .maybeSingle();
    
    console.log('[BusinessProject] Existing record:', existing);

    let data;
    let error;

    if (existing) {
      // 更新の場合: アプリケーションレベルで権限チェック
      // （サーバー側でセッションが認識されないためRLSに依存できない）
      console.log('[BusinessProject] Updating existing project:', { 
        slug, 
        existingUserId: existing.user_id,
        clientUserId: userId 
      });
      
      // 権限チェック: 既存レコードのuser_idとクライアントから渡されたuserIdを比較
      // user_idがnullの場合（匿名作成）は誰でも更新可能
      if (existing.user_id && existing.user_id !== userId) {
        console.log('[BusinessProject] Permission denied: user_id mismatch');
        return { error: '更新権限がありません。このプロジェクトの所有者ではありません。' };
      }
      
      // nicknameの重複チェック（更新時）
      if (nickname && nickname !== existing.nickname) {
        const { data: duplicateCheck } = await serverSupabase
          .from('business_projects')
          .select('id')
          .eq('nickname', nickname)
          .neq('id', existing.id)
          .maybeSingle();
        
        if (duplicateCheck) {
          console.log('[BusinessProject] Nickname already exists:', nickname);
          return { error: 'このネームは既に使用されています。別のネームを選択してください。' };
        }
      }
      
      const updateResult = await serverSupabase
        .from('business_projects')
        .update({
          nickname: nickname || null,
          content,
          settings,
          featured_on_top: featuredOnTop,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug)
        .eq('id', existing.id) // IDでも絞り込み（より安全）
        .select();
      
      // 配列から最初の要素を取得
      data = updateResult.data?.[0] || null;
      error = updateResult.error;
      
      // 更新が失敗した場合のエラーハンドリング
      if (!error && !data) {
        error = { message: '更新に失敗しました。' } as any;
      }
    } else {
      // 新規作成の場合
      console.log('[BusinessProject] Creating new project:', { slug, userId });
      
      // nicknameの重複チェック（新規作成時）
      if (nickname) {
        const { data: duplicateCheck } = await serverSupabase
          .from('business_projects')
          .select('id')
          .eq('nickname', nickname)
          .maybeSingle();
        
        if (duplicateCheck) {
          console.log('[BusinessProject] Nickname already exists:', nickname);
          return { error: 'このネームは既に使用されています。別のネームを選択してください。' };
        }
      }
      
      const insertResult = await serverSupabase
        .from('business_projects')
        .insert({
          slug,
          nickname: nickname || null,
          content,
          settings,
          user_id: userId,
          featured_on_top: featuredOnTop,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      // 配列から最初の要素を取得
      data = insertResult.data?.[0] || null;
      error = insertResult.error;
    }

    console.log('[BusinessProject] Save result:', { 
      hasError: !!error, 
      errorMsg: error?.message,
      hasData: !!data,
      returnedSlug: data?.slug 
    });

    if (error) {
      console.error('[BusinessProject] Save error:', error);
      return { error: `保存に失敗しました: ${error.message}` };
    }

    if (!data) {
      console.error('[BusinessProject] No data returned after save');
      return { error: '保存に失敗しました: データが返されませんでした' };
    }

    console.log('[BusinessProject] Saved successfully:', { slug: data.slug, id: data.id });
    return { data };
  } catch (error: any) {
    console.error('[BusinessProject] Exception:', error);
    return { error: error.message };
  }
}

// ビジネスプロジェクトを削除
export async function deleteBusinessProject({
  slug,
  userId
}: {
  slug: string;
  userId: string;
}) {
  // Server Actions用のSupabaseクライアントを作成
  const serverSupabase = await createServerSupabaseClient();
  
  if (!serverSupabase) {
    return { error: 'Database not available' };
  }

  try {
    console.log('[BusinessProject] Deleting:', { slug, userId });

    // 既存レコードをチェック
    const { data: existing } = await serverSupabase
      .from('business_projects')
      .select('id, user_id')
      .eq('slug', slug)
      .maybeSingle();

    if (!existing) {
      return { error: 'プロジェクトが見つかりません。' };
    }

    // 権限チェック: 既存レコードのuser_idとクライアントから渡されたuserIdを比較
    if (existing.user_id && existing.user_id !== userId) {
      console.log('[BusinessProject] Delete permission denied: user_id mismatch');
      return { error: '削除権限がありません。このプロジェクトの所有者ではありません。' };
    }

    // 削除実行
    const { error } = await serverSupabase
      .from('business_projects')
      .delete()
      .eq('slug', slug)
      .eq('id', existing.id);

    if (error) {
      console.error('[BusinessProject] Delete error:', error);
      return { error: `削除に失敗しました: ${error.message}` };
    }

    console.log('[BusinessProject] Deleted successfully:', { slug });
    return { success: true };
  } catch (error: any) {
    console.error('[BusinessProject] Delete exception:', error);
    return { error: error.message };
  }
}
