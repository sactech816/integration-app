import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

// 対象コンテンツの設定
// userIdColumn: 所有者を示すカラム名
// idColumn: 主キーのカラム名
// idType: 主キーの型（uuid, integer, text）
// slugColumn: URLのslugで検索する際のカラム名
const CONTENT_TYPES = {
  profiles: {
    table: 'profiles',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    slugColumn: 'slug',
    label: 'プロフィール',
  },
  sales_letters: {
    table: 'sales_letters',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    slugColumn: 'slug',
    label: 'セールスレター',
  },
  quizzes: {
    table: 'quizzes',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'integer',
    slugColumn: 'slug',
    label: 'クイズ',
  },
  surveys: {
    table: 'surveys',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    slugColumn: 'slug',
    label: 'アンケート',
  },
  business_projects: {
    table: 'business_projects',
    userIdColumn: 'user_id',
    idColumn: 'id',
    idType: 'uuid',
    slugColumn: 'slug',
    label: 'ビジネスLP',
  },
  gamification_campaigns: {
    table: 'gamification_campaigns',
    userIdColumn: 'owner_id', // gamification_campaignsはowner_idを使用
    idColumn: 'id',
    idType: 'uuid',
    slugColumn: 'id', // URLでIDを直接使用
    label: 'ガチャ/スタンプ',
  },
} as const;

type ContentType = keyof typeof CONTENT_TYPES;

// URLパスからコンテンツタイプとslugを抽出
const URL_PATH_PATTERNS: { pattern: RegExp; contentType: ContentType }[] = [
  { pattern: /\/profile\/([^/?#]+)/, contentType: 'profiles' },
  { pattern: /\/s\/([^/?#]+)/, contentType: 'sales_letters' },
  { pattern: /\/quiz\/([^/?#]+)/, contentType: 'quizzes' },
  { pattern: /\/survey\/([^/?#]+)/, contentType: 'surveys' },
  { pattern: /\/business\/([^/?#]+)/, contentType: 'business_projects' },
  { pattern: /\/gacha\/([^/?#]+)/, contentType: 'gamification_campaigns' },
  { pattern: /\/stamp-rally\/([^/?#]+)/, contentType: 'gamification_campaigns' },
  { pattern: /\/stamp\/([^/?#]+)/, contentType: 'gamification_campaigns' },
];

function parseContentUrl(url: string): { contentType: ContentType; slug: string } | null {
  for (const { pattern, contentType } of URL_PATH_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return { contentType, slug: match[1] };
    }
  }
  return null;
}

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// 管理者認証の共通処理
async function authenticateAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getServiceClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: 'Database not configured' }, { status: 500 }) };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    (email) => user.email?.toLowerCase() === email.toLowerCase()
  );

  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }

  return { user, supabase };
}

// メールアドレスからユーザーを検索
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findUserByEmail(supabase: any, email: string) {
  // Supabase Admin APIでユーザー一覧を取得してフィルタ
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) return null;
    const found = users.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < perPage) break;
    page++;
  }
  return null;
}

// GET: 対象コンテンツの情報を取得（URL or contentType+slug/contentId対応）
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if ('error' in auth) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);

    // URLパラメータからコンテンツを特定
    const contentUrl = searchParams.get('contentUrl');
    let contentType: ContentType;
    let lookupColumn: string;
    let lookupValue: string;

    if (contentUrl) {
      // URLからコンテンツタイプとslugを解析
      const parsed = parseContentUrl(contentUrl);
      if (!parsed) {
        return NextResponse.json(
          { error: '対応していないURLです。profile, s, quiz, survey, business, gacha, stamp のURLを入力してください。' },
          { status: 400 }
        );
      }
      contentType = parsed.contentType;
      const config = CONTENT_TYPES[contentType];
      lookupColumn = config.slugColumn;
      lookupValue = parsed.slug;
    } else {
      // 従来のcontentType + contentId/slugでの検索
      contentType = searchParams.get('contentType') as ContentType;
      const contentId = searchParams.get('contentId');
      const slug = searchParams.get('slug');

      if (!contentType || !CONTENT_TYPES[contentType]) {
        return NextResponse.json(
          { error: 'Invalid content type', validTypes: Object.keys(CONTENT_TYPES) },
          { status: 400 }
        );
      }

      const config = CONTENT_TYPES[contentType];

      if (slug) {
        lookupColumn = config.slugColumn;
        lookupValue = slug;
      } else if (contentId) {
        lookupColumn = config.idColumn;
        lookupValue = contentId;
      } else {
        return NextResponse.json(
          { error: 'contentUrl, contentId, or slug is required' },
          { status: 400 }
        );
      }
    }

    const config = CONTENT_TYPES[contentType];

    // コンテンツを取得
    const { data: content, error: contentError } = await supabase
      .from(config.table)
      .select('*')
      .eq(lookupColumn, lookupValue)
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
      contentTypeId: contentType,
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

// POST: 所有権を移動（メールアドレス対応）
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if ('error' in auth) return auth.error;
    const { user, supabase } = auth;

    // リクエストボディを取得
    const body = await request.json();
    const { contentType, contentId, newOwnerId, newOwnerEmail, fromEmail } = body;

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

    // 移動先ユーザーの特定（メールアドレス or ユーザーID）
    let resolvedNewOwnerId = newOwnerId;

    if (!resolvedNewOwnerId && newOwnerEmail) {
      // メールアドレスからユーザーIDを検索
      const newOwnerUser = await findUserByEmail(supabase, newOwnerEmail);
      if (!newOwnerUser) {
        return NextResponse.json(
          { error: `移動先のメールアドレス「${newOwnerEmail}」に該当するユーザーが見つかりません` },
          { status: 404 }
        );
      }
      resolvedNewOwnerId = newOwnerUser.id;
    }

    if (!resolvedNewOwnerId) {
      return NextResponse.json(
        { error: 'newOwnerId or newOwnerEmail is required' },
        { status: 400 }
      );
    }

    const config = CONTENT_TYPES[contentType as ContentType];

    // 移動先ユーザーの存在確認
    const { data: newOwnerData, error: newOwnerError } = await supabase.auth.admin.getUserById(resolvedNewOwnerId);
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

    // 移動元メールアドレスの検証（指定された場合）
    if (fromEmail && previousOwnerId) {
      const { data: prevOwnerData } = await supabase.auth.admin.getUserById(previousOwnerId);
      if (prevOwnerData?.user?.email?.toLowerCase() !== fromEmail.toLowerCase()) {
        return NextResponse.json(
          { error: `移動元のメールアドレスが現在の所有者と一致しません。現在の所有者: ${prevOwnerData?.user?.email || '不明'}` },
          { status: 400 }
        );
      }
    }

    // slug重複チェック（sales_lettersの場合）
    if (contentType === 'sales_letters' && content.slug) {
      const { data: existingSlug } = await supabase
        .from('sales_letters')
        .select('id')
        .eq('user_id', resolvedNewOwnerId)
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
      .update({ [config.userIdColumn]: resolvedNewOwnerId })
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
          to_user_id: resolvedNewOwnerId,
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
