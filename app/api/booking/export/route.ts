import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用Supabaseクライアント
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// 日時フォーマット
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// CSVエスケープ
const escapeCSV = (value: string | null | undefined): string => {
  if (!value) return '';
  const str = String(value);
  // カンマ、改行、ダブルクォートを含む場合はエスケープ
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'データベースが設定されていません' }, { status: 500 });
  }

  // URLパラメータを取得
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const menuId = searchParams.get('menuId');

  if (!userId) {
    return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
  }

  try {
    // 予約データを取得
    let query = supabase
      .from('bookings')
      .select(`
        *,
        slot:booking_slots!inner(
          *,
          menu:booking_menus!inner(*)
        )
      `)
      .eq('slot.menu.user_id', userId)
      .order('created_at', { ascending: false });

    // 特定のメニューに絞る場合
    if (menuId) {
      query = query.eq('slot.menu_id', menuId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: '予約データの取得に失敗しました' }, { status: 500 });
    }

    // CSVヘッダー
    const headers = [
      '予約ID',
      'メニュー名',
      '予約日時',
      '終了日時',
      'お客様名',
      'メールアドレス',
      'コメント',
      'ステータス',
      '予約作成日',
    ];

    // CSVデータ行
    const rows = (bookings || []).map((booking: {
      id: string;
      guest_name?: string | null;
      guest_email?: string | null;
      guest_comment?: string | null;
      status: string;
      created_at?: string;
      slot?: {
        start_time?: string;
        end_time?: string;
        menu?: {
          title?: string;
        };
      };
    }) => {
      const status = booking.status === 'ok' ? '確定' : booking.status === 'cancelled' ? 'キャンセル' : '保留中';
      return [
        escapeCSV(booking.id),
        escapeCSV(booking.slot?.menu?.title),
        escapeCSV(booking.slot?.start_time ? formatDateTime(booking.slot.start_time) : ''),
        escapeCSV(booking.slot?.end_time ? formatDateTime(booking.slot.end_time) : ''),
        escapeCSV(booking.guest_name),
        escapeCSV(booking.guest_email),
        escapeCSV(booking.guest_comment),
        escapeCSV(status),
        escapeCSV(booking.created_at ? formatDateTime(booking.created_at) : ''),
      ];
    });

    // BOM付きUTF-8でCSVを生成（Excelで文字化けしないように）
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    // ファイル名
    const now = new Date();
    const fileName = `予約一覧_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.csv`;

    // レスポンス
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'エクスポートに失敗しました' }, { status: 500 });
  }
}
