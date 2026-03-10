'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LinkableContentType, UserContentItem, ContentCategory } from '@/lib/content-links';

interface UseUserContentsOptions {
  userId: string | null;
  types?: LinkableContentType[];      // 特定タイプのみ取得
  category?: ContentCategory;          // カテゴリでフィルタ
  exclude?: LinkableContentType[];     // 除外するタイプ（自分自身のツール等）
  enabled?: boolean;                   // false なら自動取得しない
}

interface UseUserContentsReturn {
  contents: Record<string, UserContentItem[]>; // タイプ別
  allItems: UserContentItem[];                 // フラットリスト
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserContents({
  userId,
  types,
  category,
  exclude,
  enabled = true,
}: UseUserContentsOptions): UseUserContentsReturn {
  const [contents, setContents] = useState<Record<string, UserContentItem[]>>({});
  const [allItems, setAllItems] = useState<UserContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ userId });
      if (types?.length) params.set('types', types.join(','));
      if (category) params.set('category', category);
      if (exclude?.length) params.set('exclude', exclude.join(','));

      const res = await fetch(`/api/user-contents?${params.toString()}`);
      if (!res.ok) throw new Error('コンテンツの取得に失敗しました');

      const data = await res.json();
      setContents(data.contents || {});
      setAllItems(data.all || []);
    } catch (err: any) {
      console.error('[useUserContents]', err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [userId, types?.join(','), category, exclude?.join(',')]);

  useEffect(() => {
    if (enabled && userId) {
      fetchContents();
    }
  }, [enabled, userId, fetchContents]);

  return { contents, allItems, loading, error, refetch: fetchContents };
}
