'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, User, CreditCard, BarChart3, FileText, Shield, BookOpen, X } from 'lucide-react';

type UserDetail = {
  user: {
    id: string;
    email: string;
    createdAt: string;
    lastSignInAt: string | null;
    isPartner: boolean;
    partnerSince: string | null;
    partnerNote: string | null;
  };
  subscriptions: {
    makers: Array<{
      id: string;
      planTier: string;
      status: string;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      createdAt: string;
    }>;
    kdl: Array<{
      id: string;
      planTier: string;
      status: string;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      createdAt: string;
    }>;
  };
  monitors: Array<{
    id: string;
    service: string;
    planType: string;
    startAt: string;
    expiresAt: string;
    notes: string | null;
    isActive: boolean;
  }>;
  aiUsage: {
    daily: number;
    monthly: number;
    totalCostJpy: number;
    byModel: Array<{ model: string; count: number; cost: number }>;
    byAction: Array<{ action: string; count: number }>;
    byService: Array<{ service: string; count: number }>;
  };
  points: {
    current: number;
    accumulated: number;
  };
  content: {
    quizCount: number;
    profileCount: number;
    businessCount: number;
    salesLetterCount: number;
    kdlBooks: Array<{
      id: string;
      title: string;
      status: string;
      progress: number;
      createdAt: string;
      updatedAt: string;
    }>;
  };
};

type TabId = 'overview' | 'plans' | 'ai-usage' | 'content';

interface UserDetailPanelProps {
  userId: string;
  onClose: () => void;
}

export default function UserDetailPanel({ userId, onClose }: UserDetailPanelProps) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/user-detail?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch user detail');
      }

      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '概要', icon: <User size={14} /> },
    { id: 'plans', label: 'プラン', icon: <CreditCard size={14} /> },
    { id: 'ai-usage', label: 'AI使用量', icon: <BarChart3 size={14} /> },
    { id: 'content', label: 'コンテンツ', icon: <FileText size={14} /> },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatCost = (cost: number) => {
    return `¥${Math.round(cost).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-2">
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">詳細を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
        <p className="text-red-600 text-sm">エラー: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl mt-2 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <User size={16} className="text-indigo-600" />
          <span className="font-bold text-indigo-900 text-sm">{data.user.email}</span>
          {data.user.isPartner && (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">パートナー</span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="登録日" value={formatDate(data.user.createdAt)} />
            <StatCard label="最終ログイン" value={formatDate(data.user.lastSignInAt)} />
            <StatCard label="現在ポイント" value={`${data.points.current.toLocaleString()}pt`} highlight />
            <StatCard label="累計ポイント" value={`${data.points.accumulated.toLocaleString()}pt`} />
            <StatCard label="今日のAI使用" value={`${data.aiUsage.daily}回`} />
            <StatCard label="今月のAI使用" value={`${data.aiUsage.monthly}回`} />
            <StatCard label="AI費用(30日)" value={formatCost(data.aiUsage.totalCostJpy)} />
            <StatCard
              label="コンテンツ数"
              value={`${data.content.quizCount + data.content.profileCount + data.content.businessCount + data.content.salesLetterCount}件`}
            />
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            {/* Makersプラン */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Makers サブスクリプション</h4>
              {data.subscriptions.makers.length > 0 ? (
                <div className="space-y-1">
                  {data.subscriptions.makers.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 text-xs border">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.status === 'active' ? '有効' : sub.status}
                      </span>
                      <span className="font-bold">{sub.planTier}</span>
                      <span className="text-gray-400">
                        {formatDate(sub.currentPeriodStart)} ~ {formatDate(sub.currentPeriodEnd)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">サブスクリプションなし</p>
              )}
            </div>

            {/* KDLプラン */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">KDL サブスクリプション</h4>
              {data.subscriptions.kdl.length > 0 ? (
                <div className="space-y-1">
                  {data.subscriptions.kdl.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 text-xs border">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.status === 'active' ? '有効' : sub.status}
                      </span>
                      <span className="font-bold">{sub.planTier}</span>
                      <span className="text-gray-400">
                        {formatDate(sub.currentPeriodStart)} ~ {formatDate(sub.currentPeriodEnd)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">サブスクリプションなし</p>
              )}
            </div>

            {/* モニター状態 */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase flex items-center gap-1">
                <Shield size={12} /> モニター状態
              </h4>
              {data.monitors.length > 0 ? (
                <div className="space-y-1">
                  {data.monitors.map(mon => (
                    <div key={mon.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 text-xs border">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        mon.isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {mon.isActive ? '有効' : '期限切れ'}
                      </span>
                      <span className="font-bold">{mon.service}</span>
                      <span>{mon.planType}</span>
                      <span className="text-gray-400">~ {formatDate(mon.expiresAt)}</span>
                      {mon.notes && <span className="text-gray-400 truncate">{mon.notes}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">モニター設定なし</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-usage' && (
          <div className="space-y-4">
            {/* サマリー */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="今日" value={`${data.aiUsage.daily}回`} />
              <StatCard label="30日間" value={`${data.aiUsage.monthly}回`} />
              <StatCard label="費用" value={formatCost(data.aiUsage.totalCostJpy)} highlight />
            </div>

            {/* モデル別使用量 */}
            {data.aiUsage.byModel.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">モデル別</h4>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 py-2 text-left font-bold">モデル</th>
                        <th className="px-3 py-2 text-right font-bold">回数</th>
                        <th className="px-3 py-2 text-right font-bold">費用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.aiUsage.byModel.sort((a, b) => b.count - a.count).map(item => (
                        <tr key={item.model} className="border-b border-gray-50">
                          <td className="px-3 py-1.5 font-medium">{item.model}</td>
                          <td className="px-3 py-1.5 text-right">{item.count}</td>
                          <td className="px-3 py-1.5 text-right text-green-600">{formatCost(item.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* アクション別 */}
            {data.aiUsage.byAction.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">アクション別</h4>
                <div className="flex flex-wrap gap-2">
                  {data.aiUsage.byAction.sort((a, b) => b.count - a.count).map(item => (
                    <span key={item.action} className="bg-white border rounded-lg px-3 py-1.5 text-xs">
                      <span className="font-medium">{item.action}</span>
                      <span className="text-indigo-600 font-bold ml-1">{item.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* コンテンツ数 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="診断クイズ" value={`${data.content.quizCount}件`} />
              <StatCard label="プロフィール" value={`${data.content.profileCount}件`} />
              <StatCard label="LP" value={`${data.content.businessCount}件`} />
              <StatCard label="セールスレター" value={`${data.content.salesLetterCount}件`} />
            </div>

            {/* KDL書籍一覧 */}
            {data.content.kdlBooks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase flex items-center gap-1">
                  <BookOpen size={12} /> KDL 書籍
                </h4>
                <div className="space-y-1">
                  {data.content.kdlBooks.map(book => (
                    <div key={book.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 text-xs border">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        book.status === 'published' ? 'bg-green-100 text-green-700'
                          : book.status === 'draft' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {book.status}
                      </span>
                      <span className="font-medium flex-1 truncate">{book.title || '(無題)'}</span>
                      <span className="text-indigo-600 font-bold">{Math.round(book.progress || 0)}%</span>
                      <span className="text-gray-400">{formatDate(book.updatedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.content.kdlBooks.length === 0 && (
              <p className="text-xs text-gray-400">KDL書籍なし</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-lg border px-3 py-2">
      <div className="text-[10px] text-gray-500 font-bold uppercase">{label}</div>
      <div className={`text-sm font-bold mt-0.5 ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}
