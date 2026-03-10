'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Users, Send, Plus, Trash2, ChevronRight, Loader2, Crown,
  BarChart3, Sparkles, BookOpen, ListPlus, Pencil, ExternalLink,
  Layout, MousePointerClick, UserPlus, ArrowRight, ArrowLeft, Copy, Link2
} from 'lucide-react';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingModal from '@/components/shared/OnboardingModal';
import SubscriberList from '@/components/newsletter/SubscriberList';

interface NewsletterList {
  id: string;
  name: string;
  description: string | null;
  subscriber_count: number;
  campaign_count: number;
  created_at: string;
}

interface Campaign {
  id: string;
  subject: string;
  status: string;
  sent_at: string | null;
  sent_count: number;
  list_name: string;
  created_at: string;
}

interface NewsletterDashboardProps {
  userId: string;
  isProUser: boolean;
  planTier: 'guest' | 'free' | 'standard' | 'business' | 'premium';
  isAdmin?: boolean;
}

export default function NewsletterDashboard({ userId, isProUser, planTier, isAdmin = false }: NewsletterDashboardProps) {
  const router = useRouter();
  const [lists, setLists] = useState<NewsletterList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyUsage, setMonthlyUsage] = useState<{ used: number; limit: number } | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [copiedListId, setCopiedListId] = useState<string | null>(null);

  // 管理者は送信数・リスト数ともに無制限
  const monthlyLimit = isAdmin ? -1 : planTier === 'premium' ? 5000 : planTier === 'business' ? 1000 : planTier === 'standard' ? 300 : planTier === 'free' ? 100 : 0;
  const listLimit = isAdmin ? -1 : (planTier === 'business' || planTier === 'premium') ? -1 : planTier === 'standard' ? 3 : planTier === 'free' ? 1 : 0;

  // オンボーディング
  const { showOnboarding, setShowOnboarding } = useOnboarding(
    'newsletter_dashboard_onboarding_dismissed'
  );

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchLists(userId),
        fetchCampaigns(userId),
        fetchUsage(userId),
      ]);
      setLoading(false);
    };
    init();
  }, [userId]);

  const fetchLists = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/lists?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setLists(data.lists || []);
    }
  };

  const fetchCampaigns = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/campaigns?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    }
  };

  const fetchUsage = async (uid: string) => {
    try {
      const res = await fetch(`/api/newsletter-maker/usage?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyUsage({ used: data.used || 0, limit: monthlyLimit });
      }
    } catch {
      setMonthlyUsage({ used: 0, limit: monthlyLimit });
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!userId || !confirm('このリストを削除しますか？関連する読者・キャンペーンもすべて削除されます。')) return;
    const res = await fetch(`/api/newsletter-maker/lists/${listId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (userId) fetchCampaigns(userId);
    }
  };

  const canCreateList = listLimit === -1 || lists.length < listLimit;

  const getSubscribeUrl = (listId: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/newsletter/subscribe/${listId}` : '';

  const handleCopySubscribeUrl = (listId: string) => {
    const url = getSubscribeUrl(listId);
    navigator.clipboard.writeText(url);
    setCopiedListId(listId);
    setTimeout(() => setCopiedListId(null), 2000);
  };

  // 相対日時フォーマット
  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  // コンテンツ0件の場合は新規作成画面へリダイレクト
  const isNewUser = lists.length === 0 && campaigns.length === 0;

  useEffect(() => {
    if (!loading && isNewUser) {
      router.replace('/newsletter/lists/new');
    }
  }, [loading, isNewUser, router]);

  if (loading || isNewUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const usagePercent = monthlyUsage && monthlyLimit > 0
    ? Math.min(100, (monthlyUsage.used / monthlyLimit) * 100)
    : 0;

  const isUnlimitedPlan = isAdmin || monthlyLimit === -1;

  const totalSubscribers = lists.reduce((sum, l) => sum + l.subscriber_count, 0);
  const totalSent = campaigns.filter((c) => c.status === 'sent').length;
  const draftCount = campaigns.filter((c) => c.status === 'draft').length;

  // 読者管理サブビュー
  if (selectedListId) {
    const selectedList = lists.find(l => l.id === selectedListId);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button
            onClick={() => {
              setSelectedListId(null);
              // リスト情報を再取得（読者数が変わっている可能性）
              fetchLists(userId);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            メルマガメーカーに戻る
          </button>
        </div>
        <SubscriberList listId={selectedListId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* オンボーディングモーダル */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="newsletter_dashboard_onboarding_dismissed"
          title="メルマガメーカーの使い方"
          pages={[
            {
              subtitle: 'はじめかた 3ステップ',
              items: [
                {
                  icon: ListPlus,
                  iconColor: 'violet',
                  title: 'ステップ1: 読者リストを作成',
                  description: 'まず読者リストを作成します。リスト名や差出人情報を設定しましょう。',
                },
                {
                  icon: UserPlus,
                  iconColor: 'blue',
                  title: 'ステップ2: 読者を追加',
                  description: '手動追加、CSV一括インポート、購読フォームのURL共有など、複数の方法で読者を集められます。',
                },
                {
                  icon: Send,
                  iconColor: 'green',
                  title: 'ステップ3: キャンペーンを配信',
                  description: 'テンプレートを選んで本文を編集、プレビューで確認してから一斉送信できます。',
                },
              ],
            },
            {
              subtitle: '便利な機能',
              items: [
                {
                  icon: Layout,
                  iconColor: 'purple',
                  title: 'テンプレートで簡単作成',
                  description: '8種類のテンプレートから選ぶだけ。ヘッダー・本文・フッターが自動設定されます。',
                },
                {
                  icon: Sparkles,
                  iconColor: 'amber',
                  title: 'AIで本文を自動生成（PRO）',
                  description: '用途とキーワードを入力するだけで、AIがメール本文を自動作成します。',
                },
                {
                  icon: MousePointerClick,
                  iconColor: 'teal',
                  title: 'ビジュアル編集モード',
                  description: 'HTMLを直接編集せずに、見た目のまま文字を修正できます。',
                },
                {
                  icon: BookOpen,
                  iconColor: 'rose',
                  title: '他ツールから読者インポート',
                  description: '診断クイズやプロフィールLPなど、他の集客メーカーツールから読者を取り込めます。',
                },
              ],
            },
          ]}
          gradientFrom="from-violet-500"
          gradientTo="to-purple-600"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">メルマガメーカー</h1>
            <p className="text-gray-500 mt-1 text-sm">読者リスト管理・メルマガ配信</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors min-h-[44px]"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">使い方</span>
            </button>
            {canCreateList ? (
              <Link
                href="/newsletter/lists/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                新しいリスト
              </Link>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl">
                リスト上限（{listLimit}個）に達しています
              </div>
            )}
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {/* プラン */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-violet-100 p-1.5 rounded-lg"><Crown className="w-4 h-4 text-violet-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">プラン</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{isAdmin ? '管理者' : isProUser ? 'PRO' : 'フリー'}</p>
            {!isProUser && !isAdmin && (
              <Link href="/pricing" className="text-xs text-violet-600 hover:text-violet-800 font-semibold">
                アップグレード →
              </Link>
            )}
          </div>

          {/* 月間送信数 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-violet-100 p-1.5 rounded-lg"><BarChart3 className="w-4 h-4 text-violet-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">今月の送信</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {monthlyUsage ? monthlyUsage.used : 0}<span className="text-sm font-normal text-gray-500"> / {isUnlimitedPlan ? '無制限' : `${monthlyLimit}通`}</span>
            </p>
            {!isUnlimitedPlan && monthlyLimit > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${usagePercent > 80 ? 'bg-amber-500' : 'bg-violet-500'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </div>

          {/* 読者数 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-blue-100 p-1.5 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">総読者数</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{totalSubscribers}<span className="text-sm font-normal text-gray-500">人</span></p>
          </div>

          {/* 配信数 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-green-100 p-1.5 rounded-lg"><Send className="w-4 h-4 text-green-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">配信済み</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{totalSent}<span className="text-sm font-normal text-gray-500">件</span></p>
          </div>
        </div>

        {/* 初回ユーザー向けガイド */}
        {isNewUser && (
          <div className="mb-8 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">メルマガをはじめましょう</h2>
            <p className="text-gray-600 mb-6 text-sm">3つのステップでかんたんにメルマガ配信を始められます。</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-violet-100">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-violet-700 font-bold text-lg">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">読者リストを作成</h3>
                <p className="text-sm text-gray-600 mb-4">配信先の読者リストを作成します。</p>
                <Link
                  href="/newsletter/lists/new"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
                >
                  リストを作成 <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 opacity-60">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-gray-500 font-bold text-lg">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">読者を追加</h3>
                <p className="text-sm text-gray-600 mb-4">手動、CSV、購読フォームで読者を集めます。</p>
                <span className="text-sm text-gray-400">リスト作成後に利用可能</span>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 opacity-60">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-gray-500 font-bold text-lg">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">メルマガを配信</h3>
                <p className="text-sm text-gray-600 mb-4">テンプレートを選んで配信します。</p>
                <span className="text-sm text-gray-400">リスト作成後に利用可能</span>
              </div>
            </div>
          </div>
        )}

        {/* 読者リスト一覧 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-violet-500 pl-3">
            読者リスト
            {lists.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({lists.length}件)</span>
            )}
          </h2>
          {lists.length === 0 && !isNewUser ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">まだ読者リストがありません</p>
              {canCreateList && (
                <Link
                  href="/newsletter/lists/new"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  最初のリストを作成
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {lists.map((list) => (
                <div key={list.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="flex items-center p-4 sm:p-5">
                    {/* アイコン */}
                    <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Mail className="w-5 h-5 text-violet-600" />
                    </div>
                    {/* 情報 */}
                    <button onClick={() => setSelectedListId(list.id)} className="flex-1 min-w-0 text-left">
                      <h3 className="font-bold text-gray-900 truncate">{list.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {list.subscriber_count}人
                        </span>
                        <span className="flex items-center gap-1">
                          <Send className="w-3.5 h-3.5" />
                          {list.campaign_count}件
                        </span>
                        <span className="hidden sm:inline text-gray-400">
                          {formatRelativeDate(list.created_at)}
                        </span>
                      </div>
                    </button>
                    {/* アクション */}
                    <div className="flex items-center gap-1.5 ml-3">
                      <Link
                        href={`/newsletter/campaigns/new?listId=${list.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors min-h-[44px]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">配信作成</span>
                      </Link>
                      <button
                        onClick={() => setSelectedListId(list.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors min-h-[44px]"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">読者管理</span>
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* 公開購読フォームURL */}
                  <div className="px-4 sm:px-5 pb-3 pt-0">
                    <div className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2">
                      <Link2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-violet-600 flex-shrink-0">購読フォーム</span>
                      <input
                        type="text"
                        value={getSubscribeUrl(list.id)}
                        readOnly
                        className="flex-1 min-w-0 bg-transparent text-xs text-gray-600 truncate border-none outline-none p-0"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopySubscribeUrl(list.id); }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-100 rounded transition-colors min-h-[32px]"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedListId === list.id ? 'コピー済み' : 'コピー'}
                      </button>
                      <a
                        href={getSubscribeUrl(list.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-violet-500 hover:text-violet-700 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* キャンペーン一覧 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-l-4 border-green-500 pl-3">
              キャンペーン
              {campaigns.length > 0 && (
                <span className="text-sm font-normal text-gray-500">({campaigns.length}件)</span>
              )}
            </h2>
            {lists.length > 0 && (
              <Link
                href={`/newsletter/campaigns/new?listId=${lists[0].id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                新しいキャンペーン
              </Link>
            )}
          </div>
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">まだキャンペーンがありません</p>
              {lists.length > 0 && (
                <p className="text-sm text-gray-400">リストを選んで最初のメルマガを作成しましょう</p>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/newsletter/campaigns/${campaign.id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex items-center gap-4 group"
                >
                  {/* ステータスアイコン */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    campaign.status === 'sent'
                      ? 'bg-green-100'
                      : 'bg-amber-100'
                  }`}>
                    {campaign.status === 'sent' ? (
                      <Send className="w-5 h-5 text-green-600" />
                    ) : (
                      <Pencil className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors">{campaign.subject}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{campaign.list_name}</span>
                      {campaign.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          送信済み・{campaign.sent_count}通
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                          下書き
                        </span>
                      )}
                      <span className="hidden sm:inline text-gray-400">
                        {formatRelativeDate(campaign.sent_at || campaign.created_at)}
                      </span>
                    </div>
                  </div>
                  {/* 矢印 */}
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* PRO アップグレードバナー */}
        {!isProUser && !isAdmin && lists.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  PROプランでもっと活用
                </h3>
                <p className="text-violet-200 text-sm mt-1">
                  月1,000通まで配信、リスト無制限、AI本文生成など
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-semibold rounded-xl hover:bg-violet-50 transition-all shadow-md min-h-[44px]"
              >
                プランを見る <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
