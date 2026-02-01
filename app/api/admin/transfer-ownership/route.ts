import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

// 対象コンテンツの設定
// userIdColumn: 所有者を示すカラム名
// idColumn: 主キーのカラム名
// idType: 主キーの型（uuid, integer, text）
const CONTENT_TYPES = {
  profiles: {
    table: 'profiles',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    label: 'プロフィール',
  },
  sales_letters: {
    table: 'sales_letters',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    label: 'セールスレター',
  },
  quizzes: {
    table: 'quizzes',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'integer',
    label: 'クイズ',
  },
  surveys: {
    table: 'surveys',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    label: 'アンケート',
  },
  business_projects: {
    table: 'business_projects',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    label: 'ビジネスLP',
  },
  gamification_campaigns: {
    table: 'gamification_campaigns',
    userIdColumn: 'owner_id', // gamification_campaignsはowner_idを使用
    idColumn: 'id',
    idType: 'uuid',
    label: 'ガチャ/スタンプ',
  },
} as const;

type ContentType = keyof typeof CONTENT_TYPES;

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// GET: 対象コンテンツの情報を取得
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType') as ContentType;
    const contentId = searchParams.get('contentId');

    if (!contentType || !CONTENT_TYPES[contentType]) {
      return NextResponse.json(
        { error: 'Invalid content type', validTypes: Object.keys(CONTENT_TYPES) },
        { status: 400 }
      );
    }

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
    }

    const config = CONTENT_TYPES[contentType];

    // コンテンツを取得
    const { data: content, error: contentError } = await supabase
      .from(config.table)
      .select('*')
      .eq(config.idColumn, contentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found', details: contentError?.message },
        { status: 404 }
      );
    }

    // 現在の所有者情報を取得
    const currentOwnerId = content[config.userIdColumn];
    let ownerInfo = null;

    if (currentOwnerId) {
      const { data: ownerData } = await supabase.auth.admin.getUserById(currentOwnerId);
      if (ownerData?.user) {
        ownerInfo = {
          id: ownerData.user.id,
          email: ownerData.user.email,
        };
      }
    }

    return NextResponse.json({
      content,
      currentOwner: ownerInfo,
      contentType: config.label,
    });

  } catch (error: unknown) {
    console.error('Get content error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get content', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: 所有権を移動
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // リクエストボディを取得
    const { contentType, contentId, newOwnerId } = await request.json();

    if (!contentType || !CONTENT_TYPES[contentType as ContentType]) {
      return NextResponse.json(
        { error: 'Invalid content type', validTypes: Object.keys(CONTENT_TYPES) },
        { status: 400 }
      );
    }

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
    }

    if (!newOwnerId) {
      return NextResponse.json(
        { error: 'newOwnerId is required' },
        { status: 400 }
      );
    }

    const config = CONTENT_TYPES[contentType as ContentType];

    // 移動先ユーザーの存在確認
    const { data: newOwnerData, error: newOwnerError } = await supabase.auth.admin.getUserById(newOwnerId);
    if (newOwnerError || !newOwnerData?.user) {
      return NextResponse.json(
        { error: 'New owner not found', details: newOwnerError?.message },
        { status: 404 }
      );
    }

    // 対象コンテンツの存在確認
    const { data: content, error: contentError } = await supabase
      .from(config.table)
      .select('*')
      .eq(config.idColumn, contentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found', details: contentError?.message },
        { status: 404 }
      );
    }

    const previousOwnerId = content[config.userIdColumn];

    // slug重複チェック（sales_lettersの場合）
    if (contentType === 'sales_letters' && content.slug) {
      const { data: existingSlug } = await supabase
        .from('sales_letters')
        .select('id')
        .eq('user_id', newOwnerId)
        .eq('slug', content.slug)
        .single();

      if (existingSlug) {
        return NextResponse.json(
          { 
            error: 'Slug conflict', 
            details: `移動先ユーザーは既に同じslug「${content.slug}」を持っています。先にslugを変更してください。` 
          },
          { status: 409 }
        );
      }
    }

    // 所有権を更新
    const { error: updateError } = await supabase
      .from(config.table)
      .update({ [config.userIdColumn]: newOwnerId })
      .eq(config.idColumn, contentId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to transfer ownership', details: updateError.message },
        { status: 500 }
      );
    }

    // 監査ログを記録（テーブルが存在する場合のみ）
    try {
      await supabase
        .from('content_ownership_logs')
        .insert({
          content_type: contentType,
          content_id: String(contentId),
          from_user_id: previousOwnerId,
          to_user_id: newOwnerId,
          transferred_by: user.id,
        });
    } catch {
      // ログテーブルが存在しない場合は無視（オプション機能）
      console.log('Ownership log table not found, skipping audit log');
    }

    // 結果を返す
    return NextResponse.json({
      success: true,
      message: `${config.label}の所有権を移動しました`,
      contentId,
      previousOwner: previousOwnerId,
      newOwner: {
        id: newOwnerData.user.id,
        email: newOwnerData.user.email,
      },
      transferredBy: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error: unknown) {
    console.error('Transfer ownership error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to transfer ownership', details: errorMessage },
      { status: 500 }
    );
  }
}
