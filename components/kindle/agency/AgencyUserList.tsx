'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, BarChart3, MessageSquare, Edit3, 
  ChevronRight, Loader2, AlertCircle 
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          <p className="text-2xl font-bold text-amber-700">
            {users.reduce((sum, u) => sum + u.total_books, 0)}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <BarChart3 size={18} />
            <span className="text-sm font-medium">平均進捗</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {Math.round(users.reduce((sum, u) => sum + u.progress_percentage, 0) / users.length)}%
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Edit3 size={18} />
            <span className="text-sm font-medium">完了ユーザー</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {users.filter(u => u.progress_percentage >= 100).length}
          </p>
        </div>
      </div>

      {/* ユーザーリスト */}
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
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
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
    </div>
  );
}
