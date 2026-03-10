'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Users, Plus, Trash2, ChevronRight, Loader2, Crown,
  BarChart3, BookOpen, Play, Pause, Clock, CheckCircle2,
  ArrowRight, ArrowLeft, ListOrdered, Zap, Copy, ExternalLink,
  Link2, Pencil
} from 'lucide-react';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingModal from '@/components/shared/OnboardingModal';
import SubscriberList from '@/components/newsletter/SubscriberList';

interface NewsletterList {
  id: string;
  name: string;
  description: string | null;
  subscriber_count: number;
  created_at: string;
}

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  status: string;
  list_id: string;
  list_name: string;
  step_count: number;
  created_at: string;
}

interface StepEmailDashboardProps {
  userId: string;
  isProUser: boolean;
  planTier: 'guest' | 'free' | 'standard' | 'business' | 'premium';
  isAdmin?: boolean;
}

export default function StepEmailDashboard({ userId, isProUser, planTier, isAdmin = false }: StepEmailDashboardProps) {
  const router = useRouter();
  const [lists, setLists] = useState<NewsletterList[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyUsage, setMonthlyUsage] = useState<{ used: number; limit: number } | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [copiedListId, setCopiedListId] = useState<string | null>(null);

  const monthlyLimit = isAdmin ? -1 : planTier === 'premium' ? 5000 : planTier === 'business' ? 1000 : planTier === 'standard' ? 300 : planTier === 'free' ? 100 : 0;

  const { showOnboarding, setShowOnboarding } = useOnboarding(
    'step_email_dashboard_onboarding_dismissed'
  );

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchLists(),
        fetchSequences(),
        fetchUsage(),
      ]);
      setLoading(false);
    };
    init();
  }, [userId]);

  const fetchLists = async () => {
    const res = await fetch(`/api/newsletter-maker/lists?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setLists(data.lists || []);
    }
  };

  const fetchSequences = async () => {
    const res = await fetch(`/api/step-email-maker/sequences?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setSequences(data.sequences || []);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch(`/api/newsletter-maker/usage?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyUsage({ used: data.used || 0, limit: monthlyLimit });
      }
    } catch {
      setMonthlyUsage({ used: 0, limit: monthlyLimit });
    }
  };

  const handleDeleteSequence = async (seqId: string) => {
    if (!confirm('このシーケンスを削除しますか？関連するステップ・進捗データもすべて削除されます。')) return;
    const res = await fetch(`/api/step-email-maker/sequences/${seqId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setSequences((prev) => prev.filter((s) => s.id !== seqId));
    }
  };

  const getSubscribeUrl = (listId: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/newsletter/subscribe/${listId}` : '';

  const handleCopySubscribeUrl = (listId: string) => {
    const url = getSubscribeUrl(listId);
    navigator.clipboard.writeText(url);
    setCopiedListId(listId);
    setTimeout(() => setCopiedListId(null), 2000);
  };

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

  const isNewUser = lists.length === 0 && sequences.length === 0;

  useEffect(() => {
    if (!loading && isNewUser) {
      router.replace('/step-email/sequences/new');
    }
  }, [loading, isNewUser, router]);

  if (loading || isNewUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const usagePercent = monthlyUsage && monthlyLimit > 0
    ? Math.min(100, (monthlyUsage.used / monthlyLimit) * 100)
    : 0;

  const isUnlimitedPlan = isAdmin || monthlyLimit === -1;

  const activeCount = sequences.filter((s) => s.status === 'active').length;
  const totalSteps = sequences.reduce((sum, s) => sum + s.step_count, 0);
  const totalSubscribers = lists.reduce((sum, l) => sum + l.subscriber_count, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            <Play className="w-3 h-3" />配信中
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
            <Pause className="w-3 h-3" />一時停止
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
            下書き
          </span>
        );
    }
  };

  // Subscriber management sub-view
  if (selectedListId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button
            onClick={() => {
              setSelectedListId(null);
              fetchLists();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            ステップメールメーカーに戻る
          </button>
        </div>
        <SubscriberList listId={selectedListId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showOnboarding && (
        <OnboardingModal
          storageKey="step_email_dashboard_onboarding_dismissed"
          title="ステップメールメーカーの使い方"
          pages={[
            {
              subtitle: 'はじめかた 3ステップ',
              items: [
                {
                  icon: ListOrdered,
                  iconColor: 'teal',
                  title: 'ステップ1: シーケンスを作成',
                  description: '読者リストを選んで、ステップメールのシーケンス（シナリオ）を作成します。',
                },
                {
                  icon: Mail,
                  iconColor: 'blue',
                  title: 'ステップ2: メールを追加',
                  description: '登録直後、1日後、3日後...と送信タイミングを設定して、各ステップのメールを作成します。',
                },
                {
                  icon: Zap,
                  iconColor: 'green',
                  title: 'ステップ3: 有効化して自動配信',
                  description: 'シーケンスを有効化すると、読者の登録日に合わせて自動でメールが配信されます。',
                },
              ],
            },
            {
              subtitle: 'ステップメールとは',
              items: [
                {
                  icon: Clock,
                  iconColor: 'purple',
                  title: '自動配信のしくみ',
                  description: '読者がリストに登録された日を起点に、設定した日数後に自動でメールが届きます。毎日朝9時に配信チェックが行われます。',
                },
                {
                  icon: Users,
                  iconColor: 'amber',
                  title: 'メルマガとの違い',
                  description: 'メルマガは全員に同時配信。ステップメールは登録タイミングに合わせて個別配信。教育・フォローアップに最適です。',
                },
              ],
            },
          ]}
          gradientFrom="from-teal-500"
          gradientTo="to-cyan-600"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ステップメールメーカー</h1>
            <p className="text-gray-500 mt-1 text-sm">自動配信シーケンス管理</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors min-h-[44px]"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">使い方</span>
            </button>
            <Link
              href="/step-email/sequences/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              新しいシーケンス
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-teal-100 p-1.5 rounded-lg"><Crown className="w-4 h-4 text-teal-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">プラン</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{isAdmin ? '管理者' : isProUser ? 'PRO' : 'フリー'}</p>
            {!isProUser && !isAdmin && (
              <Link href="/pricing" className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
                アップグレード →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-teal-100 p-1.5 rounded-lg"><BarChart3 className="w-4 h-4 text-teal-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">今月の送信</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {monthlyUsage ? monthlyUsage.used : 0}<span className="text-sm font-normal text-gray-500"> / {isUnlimitedPlan ? '無制限' : `${monthlyLimit}通`}</span>
            </p>
            {!isUnlimitedPlan && monthlyLimit > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${usagePercent > 80 ? 'bg-amber-500' : 'bg-teal-500'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">メルマガと共有</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-blue-100 p-1.5 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">総読者数</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{totalSubscribers}<span className="text-sm font-normal text-gray-500">人</span></p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-green-100 p-1.5 rounded-lg"><Play className="w-4 h-4 text-green-600" /></span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">配信中</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{activeCount}<span className="text-sm font-normal text-gray-500">件</span></p>
          </div>
        </div>

        {/* Lists section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-teal-500 pl-3">
            読者リスト
            {lists.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({lists.length}件)</span>
            )}
          </h2>
          {lists.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">まだ読者リストがありません</p>
              <Link
                href="/newsletter/lists/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                最初のリストを作成
              </Link>
              <p className="text-xs text-gray-400 mt-3">メルマガメーカーと読者リストは共有されます</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {lists.map((list) => (
                <div key={list.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="flex items-center p-4 sm:p-5">
                    <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Mail className="w-5 h-5 text-teal-600" />
                    </div>
                    <button onClick={() => setSelectedListId(list.id)} className="flex-1 min-w-0 text-left">
                      <h3 className="font-bold text-gray-900 truncate">{list.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {list.subscriber_count}人
                        </span>
                        <span className="hidden sm:inline text-gray-400">
                          {formatRelativeDate(list.created_at)}
                        </span>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 ml-3">
                      <Link
                        href={`/step-email/sequences/new?listId=${list.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-teal-50 text-teal-700 font-semibold rounded-lg hover:bg-teal-100 transition-colors min-h-[44px]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">シーケンス作成</span>
                      </Link>
                      <button
                        onClick={() => setSelectedListId(list.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors min-h-[44px]"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">読者管理</span>
                      </button>
                    </div>
                  </div>
                  {/* Subscribe URL */}
                  <div className="px-4 sm:px-5 pb-3 pt-0">
                    <div className="flex items-center gap-2 bg-teal-50 rounded-lg px-3 py-2">
                      <Link2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-teal-600 flex-shrink-0">購読フォーム</span>
                      <input
                        type="text"
                        value={getSubscribeUrl(list.id)}
                        readOnly
                        className="flex-1 min-w-0 bg-transparent text-xs text-gray-600 truncate border-none outline-none p-0"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopySubscribeUrl(list.id); }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded transition-colors min-h-[32px]"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedListId === list.id ? 'コピー済み' : 'コピー'}
                      </button>
                      <a
                        href={getSubscribeUrl(list.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-teal-500 hover:text-teal-700 min-h-[32px] min-w-[32px] flex items-center justify-center"
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

        {/* Sequences section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-l-4 border-green-500 pl-3">
              シーケンス
              {sequences.length > 0 && (
                <span className="text-sm font-normal text-gray-500">({sequences.length}件)</span>
              )}
            </h2>
            {lists.length > 0 && (
              <Link
                href={`/step-email/sequences/new?listId=${lists[0].id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-teal-50 text-teal-700 font-semibold rounded-lg hover:bg-teal-100 transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                新しいシーケンス
              </Link>
            )}
          </div>
          {sequences.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <ListOrdered className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">まだシーケンスがありません</p>
              {lists.length > 0 && (
                <p className="text-sm text-gray-400">リストを選んで最初のステップメールを作成しましょう</p>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {sequences.map((seq) => (
                <Link
                  key={seq.id}
                  href={`/step-email/sequences/${seq.id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex items-center gap-4 group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    seq.status === 'active' ? 'bg-green-100' : seq.status === 'paused' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    {seq.status === 'active' ? (
                      <Play className="w-5 h-5 text-green-600" />
                    ) : seq.status === 'paused' ? (
                      <Pause className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ListOrdered className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{seq.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{seq.list_name}</span>
                      {getStatusBadge(seq.status)}
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {seq.step_count}通
                      </span>
                      <span className="hidden sm:inline text-gray-400">
                        {formatRelativeDate(seq.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSequence(seq.id); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* PRO upgrade banner */}
        {!isProUser && !isAdmin && sequences.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  PROプランでもっと活用
                </h3>
                <p className="text-teal-200 text-sm mt-1">
                  月1,000通まで配信（メルマガと合算）、リスト無制限
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all shadow-md min-h-[44px]"
              >
                プランを見る <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
