/**
 * 単品購入済みチェック用フック
 * footer_hide / related_content_hide などのcontent-specific購入をチェック
 */
import { useState, useEffect, useCallback } from 'react';

interface FeaturePurchaseState {
  hasAccess: boolean;
  isLoading: boolean;
}

/**
 * 指定したfeature_productへのアクセス権を確認
 * @param userId ユーザーID
 * @param productId feature_products.id (例: 'footer_hide')
 * @param contentId コンテンツID（content-specific購入の場合）
 */
export function useFeaturePurchase(
  userId: string | null | undefined,
  productId: string,
  contentId: string | null | undefined
): FeaturePurchaseState & { refetch: () => void } {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccess = useCallback(async () => {
    if (!userId || !contentId) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ userId, productId, contentId });
      const res = await fetch(`/api/features/check?${params}`);
      const data = await res.json();
      setHasAccess(data.hasAccess || false);
    } catch {
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId, productId, contentId]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  return { hasAccess, isLoading, refetch: fetchAccess };
}

/**
 * 単品購入のStripe Checkoutへリダイレクト
 */
export async function purchaseFeature(params: {
  userId: string;
  productId: string;
  contentId?: string;
  contentType?: string;
}): Promise<string | null> {
  try {
    const res = await fetch('/api/features/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return data.url;
    }
    return null;
  } catch {
    return null;
  }
}
