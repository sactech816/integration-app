'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import { ServiceType, Quiz, Profile, BusinessLP, Block } from '@/lib/types';
import { generateSlug } from '@/lib/utils';
import { getMultipleAnalytics } from '@/app/actions/analytics';
import { getUserPurchases, hasProAccess } from '@/app/actions/purchases';
import { ContentItem } from '../components/MainContent/ContentCard';

type AnalyticsData = {
  views: number;
  clicks: number;
  completions: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
};

type UseDashboardDataReturn = {
  user: { id: string; email?: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ id: string; email?: string } | null>>;
  isAdmin: boolean;
  isLoading: boolean;
  contents: ContentItem[];
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
    booking: number;
    survey: number;
    gamification: number;
  };
  totalViews: number;
  proAccessMap: Record<string, { hasAccess: boolean; reason?: string }>;
  purchases: string[];
  processingId: string | null;
  setProcessingId: React.Dispatch<React.SetStateAction<string | null>>;
  copiedId: string | null;
  setCopiedId: React.Dispatch<React.SetStateAction<string | null>>;
  fetchContents: (service: ServiceType) => Promise<void>;
  fetchPurchases: () => Promise<void>;
  fetchAllContentCounts: () => Promise<void>;
  handleEdit: (item: ContentItem) => void;
  handleView: (item: ContentItem) => void;
  handleCopyUrl: (item: ContentItem) => void;
  handleDelete: (item: ContentItem) => Promise<void>;
  handleDuplicate: (item: ContentItem) => Promise<void>;
  handleEmbed: (item: ContentItem, isUnlocked: boolean) => void;
  handleDownloadHtml: (item: ContentItem) => Promise<void>;
  handlePurchase: (item: ContentItem) => Promise<void>;
  handleLogout: () => Promise<void>;
};

// プロフィール名を取得
const getProfileName = (profile: Profile | BusinessLP): string => {
  if (!profile.content || !Array.isArray(profile.content)) {
    return (profile as BusinessLP).title || `プロフィール ${profile.slug}`;
  }
  const headerBlock = profile.content.find((b: Block) => b.type === 'header');
  if (headerBlock && headerBlock.type === 'header') {
    return headerBlock.data.name || (profile as BusinessLP).title || `プロフィール ${profile.slug}`;
  }
  return (profile as BusinessLP).title || `プロフィール ${profile.slug}`;
};

export function useDashboardData(): UseDashboardDataReturn {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [contentCounts, setContentCounts] = useState({
    quiz: 0,
    profile: 0,
    business: 0,
    booking: 0,
    survey: 0,
    gamification: 0,
  });
  const [proAccessMap, setProAccessMap] = useState<Record<string, { hasAccess: boolean; reason?: string }>>({});
  const [purchases, setPurchases] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 管理者判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email
    ? adminEmails.some((email) => user.email?.toLowerCase() === email.toLowerCase())
    : false;

  // 総PV数計算
  const totalViews = contents.reduce((acc, item) => acc + (item.views_count || 0), 0);

  // 初期化
  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  // コンテンツ取得
  const fetchContents = useCallback(
    async (selectedService: ServiceType) => {
      if (!supabase || !user) return;

      setIsLoading(true);
      const allContents: ContentItem[] = [];

      try {
        // 診断クイズ取得
        if (selectedService === 'quiz') {
          const query = isAdmin
            ? supabase.from(TABLES.QUIZZES).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.QUIZZES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: quizzes } = await query;
          if (quizzes) {
            allContents.push(
              ...quizzes.map((q: Quiz) => ({
                ...q,
                id: String(q.id),
                title: q.title,
                type: 'quiz' as ServiceType,
                user_id: q.user_id,
                views_count: q.views_count || 0,
                completions_count: q.completions_count || 0,
                clicks_count: q.clicks_count || 0,
              }))
            );
          }
        }

        // プロフィールLP取得
        if (selectedService === 'profile') {
          const query = isAdmin
            ? supabase.from(TABLES.PROFILES).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.PROFILES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: profiles } = await query;
          if (profiles) {
            const profileIds = profiles.map((p: Profile) => p.id);
            const analyticsResults = await getMultipleAnalytics(profileIds, 'profile');
            const analyticsMapObj: Record<string, AnalyticsData> = {};
            analyticsResults.forEach((result) => {
              analyticsMapObj[result.contentId] = result.analytics;
            });

            allContents.push(
              ...profiles.map((p: Profile) => {
                const analytics = analyticsMapObj[p.id];
                return {
                  id: p.id,
                  slug: p.slug,
                  title: getProfileName(p),
                  created_at: p.created_at,
                  updated_at: p.updated_at,
                  type: 'profile' as ServiceType,
                  user_id: p.user_id,
                  content: p.content,
                  settings: p.settings,
                  views_count: analytics?.views || 0,
                  clicks_count: analytics?.clicks || 0,
                  readRate: analytics?.readRate || 0,
                  avgTimeSpent: analytics?.avgTimeSpent || 0,
                  clickRate: analytics?.clickRate || 0,
                };
              })
            );
          }
        }

        // ビジネスLP取得
        if (selectedService === 'business') {
          const query = isAdmin
            ? supabase.from(TABLES.BUSINESS_LPS).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.BUSINESS_LPS).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: businessLps } = await query;
          if (businessLps) {
            const businessSlugs = businessLps.map((b: BusinessLP) => b.slug);
            const analyticsResults = await getMultipleAnalytics(businessSlugs, 'business');
            const analyticsMapObj: Record<string, AnalyticsData> = {};
            analyticsResults.forEach((result) => {
              analyticsMapObj[result.contentId] = result.analytics;
            });

            allContents.push(
              ...businessLps.map((b: BusinessLP) => {
                const analytics = analyticsMapObj[b.slug];
                return {
                  id: b.id,
                  slug: b.slug,
                  title: getProfileName(b),
                  description: b.description,
                  created_at: b.created_at,
                  updated_at: b.updated_at,
                  type: 'business' as ServiceType,
                  user_id: b.user_id,
                  content: b.content,
                  settings: b.settings,
                  views_count: analytics?.views || 0,
                  clicks_count: analytics?.clicks || 0,
                  readRate: analytics?.readRate || 0,
                  avgTimeSpent: analytics?.avgTimeSpent || 0,
                  clickRate: analytics?.clickRate || 0,
                };
              })
            );
          }
        }

        // 作成日時でソート
        allContents.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setContents(allContents);

        // アクセス権を確認
        await fetchProAccessForContents(allContents);
      } catch (error) {
        console.error('Contents fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, isAdmin]
  );

  // Pro機能のアクセス権を確認
  const fetchProAccessForContents = useCallback(
    async (contentItems: ContentItem[]) => {
      if (!user) return;

      const accessMap: Record<string, { hasAccess: boolean; reason?: string }> = {};

      for (const item of contentItems) {
        try {
          const result = await hasProAccess(user.id, user.email, item.id, item.type, item.user_id || undefined);
          accessMap[item.id] = result;
        } catch (error) {
          console.error(`Check access for ${item.id}:`, error);
          accessMap[item.id] = { hasAccess: false };
        }
      }

      setProAccessMap(accessMap);
    },
    [user]
  );

  // 購入履歴を取得
  const fetchPurchases = useCallback(async () => {
    if (!user) return;
    try {
      const purchaseData = await getUserPurchases(user.id);
      setPurchases(purchaseData.map((p) => p.content_id));
    } catch (error) {
      console.error('Purchases fetch error:', error);
    }
  }, [user]);

  // すべてのコンテンツ数を取得
  const fetchAllContentCounts = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      // 診断クイズ数
      const quizQuery = isAdmin
        ? supabase.from(TABLES.QUIZZES).select('id', { count: 'exact', head: true })
        : supabase.from(TABLES.QUIZZES).select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: quizCount } = await quizQuery;

      // プロフィールLP数
      const profileQuery = isAdmin
        ? supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true })
        : supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: profileCount } = await profileQuery;

      // ビジネスLP数
      const businessQuery = isAdmin
        ? supabase.from(TABLES.BUSINESS_LPS).select('id', { count: 'exact', head: true })
        : supabase.from(TABLES.BUSINESS_LPS).select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: businessCount } = await businessQuery;

      setContentCounts({
        quiz: quizCount || 0,
        profile: profileCount || 0,
        business: businessCount || 0,
        booking: 0, // TODO: 予約機能のカウント
        survey: 0, // TODO: アンケート機能のカウント
        gamification: 0, // TODO: ゲーミフィケーションのカウント
      });
    } catch (error) {
      console.error('Content counts fetch error:', error);
    }
  }, [user, isAdmin]);

  // 編集
  const handleEdit = (item: ContentItem) => {
    window.location.href = `/${item.type}/editor?id=${item.slug}`;
  };

  // プレビュー
  const handleView = (item: ContentItem) => {
    window.open(`/${item.type}/${item.slug}`, '_blank');
  };

  // URLコピー
  const handleCopyUrl = (item: ContentItem) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${item.type}/${item.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 削除
  const handleDelete = async (item: ContentItem) => {
    if (!supabase) return;

    const tableMap = {
      quiz: TABLES.QUIZZES,
      profile: TABLES.PROFILES,
      business: TABLES.BUSINESS_LPS,
    };

    try {
      const { error } = await supabase
        .from(tableMap[item.type])
        .delete()
        .eq('id', item.type === 'quiz' ? parseInt(item.id) : item.id);

      if (error) throw error;

      setContents((prev) => prev.filter((c) => c.id !== item.id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  // 複製
  const handleDuplicate = async (item: ContentItem) => {
    if (!supabase || !user) return;
    if (!confirm(`「${item.title}」を複製しますか？`)) return;

    try {
      const newSlug = generateSlug();
      const tableMap = {
        quiz: TABLES.QUIZZES,
        profile: TABLES.PROFILES,
        business: TABLES.BUSINESS_LPS,
      };

      if (item.type === 'quiz') {
        const { data: originalQuiz } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('id', parseInt(item.id))
          .single();

        if (originalQuiz) {
          const { error } = await supabase.from(TABLES.QUIZZES).insert([
            {
              user_id: user.id,
              title: `${originalQuiz.title} のコピー`,
              description: originalQuiz.description,
              questions: originalQuiz.questions,
              results: originalQuiz.results,
              category: originalQuiz.category,
              mode: originalQuiz.mode,
              layout: originalQuiz.layout,
              color: originalQuiz.color,
              image_url: originalQuiz.image_url,
              collect_email: originalQuiz.collect_email,
              slug: newSlug,
            },
          ]);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from(tableMap[item.type]).insert([
          {
            user_id: user.id,
            content: item.content,
            slug: newSlug,
            settings: item.settings,
          },
        ]);
        if (error) throw error;
      }

      alert('複製しました！');
      // コンテンツを再取得
      await fetchContents(item.type);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('複製エラー: ' + errorMessage);
    }
  };

  // 埋め込みコード生成
  const handleEmbed = (item: ContentItem, isUnlocked: boolean) => {
    if (!isUnlocked) return alert('この機能を利用するには、開発支援（購入）によるロック解除が必要です。');
    const url = `${window.location.origin}/${item.type}/${item.slug}`;
    const code = `<iframe src="${url}" width="100%" height="600" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    navigator.clipboard.writeText(code);
    alert('埋め込みコードをコピーしました！\n\nWordPressなどの「カスタムHTML」ブロックに貼り付けてください。');
  };

  // HTMLダウンロード
  const handleDownloadHtml = async (item: ContentItem) => {
    try {
      const pageUrl = `${window.location.origin}/${item.type}/${item.slug}`;
      const response = await fetch(pageUrl);
      if (!response.ok) throw new Error('ページの取得に失敗しました');
      let html = await response.text();

      const baseUrl = window.location.origin;
      html = html.replace(/href="\//g, `href="${baseUrl}/`);
      html = html.replace(/src="\//g, `src="${baseUrl}/`);

      const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title || item.slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('HTMLをダウンロードしました！');
    } catch (error) {
      console.error('Download error:', error);
      alert('HTMLのダウンロードに失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    }
  };

  // 機能開放/開発支援
  const handlePurchase = async (item: ContentItem) => {
    const inputPrice = window.prompt(
      `「${item.title}」のPro機能を開放します。\n\n応援・開発支援金額を入力してください（100円〜100,000円）。`,
      '1000'
    );
    if (inputPrice === null) return;
    const price = parseInt(inputPrice, 10);
    if (isNaN(price) || price < 100 || price > 100000) {
      alert('金額は 100円以上、100,000円以下 の半角数字で入力してください。');
      return;
    }

    setProcessingId(item.id);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: item.id,
          contentType: item.type,
          amount: price,
          metadata: {
            contentTitle: item.title,
            userId: user?.id,
            email: user?.email,
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('決済URLの取得に失敗しました');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('エラー: ' + errorMessage);
      setProcessingId(null);
    }
  };

  // ログアウト
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/';
    }
  };

  return {
    user,
    setUser,
    isAdmin,
    isLoading,
    contents,
    contentCounts,
    totalViews,
    proAccessMap,
    purchases,
    processingId,
    setProcessingId,
    copiedId,
    setCopiedId,
    fetchContents,
    fetchPurchases,
    fetchAllContentCounts,
    handleEdit,
    handleView,
    handleCopyUrl,
    handleDelete,
    handleDuplicate,
    handleEmbed,
    handleDownloadHtml,
    handlePurchase,
    handleLogout,
  };
}
