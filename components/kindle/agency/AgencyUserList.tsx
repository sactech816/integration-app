'use client';

import { useState, useEffect } from 'react';
import {
  Users, BookOpen, BarChart3, MessageSquare, Edit3,
  ChevronRight, Loader2, AlertCircle, ArrowUpDown, ChevronDown, ChevronUp
} from 'lucide-react';

interface AgencyUser {
  user_id: string;
  user_email: string;
  total_books: number;
  total_sections: number;
  completed_sections: number;
  progress_percentage: number;
  assigned_at: string;
  note?: string;
}

type SortKey = 'progress' | 'books' | 'email' | 'assigned';
type SortDir = 'asc' | 'desc';

interface AgencyUserListProps {
  agencyId: string;
  accessToken?: string;
  onSelectUser?: (userId: string) => void;
  onFeedback?: (userId: string, bookId?: string) => void;
  onMessage?: (userId: string) => void;
}

export default function AgencyUserList({
  agencyId,
  accessToken,
  onSelectUser,
  onFeedback,
  onMessage,
}: AgencyUserListProps) {
  const [users, setUsers] = useState<AgencyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('progress');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const response = await fetch('/api/kdl/agency/users', { headers });
        if (!response.ok) {
          throw new Error('ユーザー一覧の取得に失敗しました');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || 'ユーザー一覧の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [agencyId]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-orange-400';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-700';
    if (percentage >= 50) return 'text-amber-700';
    return 'text-orange-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'email' || key === 'assigned' ? 'asc' : 'desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'progress': return (a.progress_percentage - b.progress_percentage) * dir;
      case 'books': return (a.total_books - b.total_books) * dir;
      case 'email': return a.user_email.localeCompare(b.user_email) * dir;
      case 'assigned': return (new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime()) * dir;
      default: return 0;
    }
  });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-blue-500" />
      : <ChevronDown size={12} className="text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <Users className="text-gray-300 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-700 mb-2">担当ユーザーがいません</h3>
        <p className="text-gray-500">管理者からユーザーが割り当てられるとここに表示されます</p>
      </div>
    );
  }

  // 統計
  const avgProgress = Math.round(users.reduce((sum, u) => sum + u.progress_percentage, 0) / users.length);
  const totalBooks = users.reduce((sum, u) => sum + u.total_books, 0);
  const completedUsers = users.filter(u => u.progress_percentage >= 100).length;

  return (
    <div className="space-y-4">
      {/* サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users size={18} />
            <span className="text-sm font-medium">担当ユーザー</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <BookOpen size={18} />
            <span className="text-sm font-medium">総書籍数</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{totalBooks}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <BarChart3 size={18} />
            <span className="text-sm font-medium">平均進捗</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{avgProgress}%</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Edit3 size={18} />
            <span className="text-sm font-medium">完了ユーザー</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{completedUsers}</p>
        </div>
      </div>

      {/* 比較ビュー切り替え */}
      {users.length >= 2 && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showComparison
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={14} />
            {showComparison ? '一覧表示に戻す' : '進捗を比較'}
          </button>
        </div>
      )}

      {/* 進捗比較ビュー */}
      {showComparison && users.length >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* 比較グラフ */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">進捗比較</h3>
            <div className="space-y-3">
              {sortedUsers.map(user => (
                <div key={user.user_id} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 truncate text-xs text-gray-700 text-right">
                    {user.user_email.split('@')[0]}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                      <div
                        className={`h-5 rounded-full transition-all ${getProgressColor(user.progress_percentage)}`}
                        style={{ width: `${Math.min(user.progress_percentage, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-12 text-right ${getProgressTextColor(user.progress_percentage)}`}>
                      {user.progress_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 比較テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900">
                      ユーザー <SortIcon columnKey="email" />
                    </button>
                  </th>
                  <th className="text-center px-3 py-2.5">
                    <button onClick={() => handleSort('books')} className="flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 mx-auto">
                      書籍数 <SortIcon columnKey="books" />
                    </button>
                  </th>
                  <th className="text-center px-3 py-2.5">
                    <span className="text-gray-700 font-medium">節</span>
                  </th>
                  <th className="text-center px-3 py-2.5">
                    <button onClick={() => handleSort('progress')} className="flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 mx-auto">
                      進捗 <SortIcon columnKey="progress" />
                    </button>
                  </th>
                  <th className="text-center px-3 py-2.5">
                    <button onClick={() => handleSort('assigned')} className="flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 mx-auto">
                      割り当て日 <SortIcon columnKey="assigned" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(user => (
                  <tr key={user.user_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          {user.user_email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-900 truncate max-w-[180px]">{user.user_email}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-2.5 text-gray-700 font-medium">{user.total_books}</td>
                    <td className="text-center px-3 py-2.5 text-gray-600 text-xs">
                      {user.completed_sections}/{user.total_sections}
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <span className={`font-bold ${getProgressTextColor(user.progress_percentage)}`}>
                        {user.progress_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center px-3 py-2.5 text-gray-500 text-xs">{formatDate(user.assigned_at)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {onSelectUser && (
                          <button
                            onClick={() => onSelectUser(user.user_id)}
                            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                            title="進捗詳細"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ユーザーリスト（通常表示） */}
      {!showComparison && (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-sm">
                      {user.user_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.user_email}</p>
                      <p className="text-xs text-gray-500">
                        割り当て: {formatDate(user.assigned_at)}
                      </p>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{user.total_books}冊 · {user.completed_sections}/{user.total_sections}節完了</span>
                      <span className="font-bold">{user.progress_percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(user.progress_percentage)}`}
                        style={{ width: `${Math.min(user.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* メモ */}
                  {user.note && (
                    <p className="text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1">
                      📝 {user.note}
                    </p>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex items-center gap-2 ml-4">
                  {onMessage && (
                    <button
                      onClick={() => onMessage(user.user_id)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="メッセージ"
                    >
                      <MessageSquare size={18} />
                    </button>
                  )}
                  {onFeedback && (
                    <button
                      onClick={() => onFeedback(user.user_id)}
                      className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      title="添削"
                    >
                      <Edit3 size={18} />
                    </button>
                  )}
                  {onSelectUser && (
                    <button
                      onClick={() => onSelectUser(user.user_id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="詳細"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
