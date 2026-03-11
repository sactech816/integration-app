'use client';

import { useState, useMemo } from 'react';
import {
  Users, Search, Filter, Loader2, UserX,
  MessageCircle, ChevronDown
} from 'lucide-react';
import type { LineFriend, LineSourceType } from '@/types/line';

interface LineFriendListProps {
  userId: string;
  friends: LineFriend[];
  onRefresh: () => Promise<void>;
}

const SOURCE_LABELS: Record<string, string> = {
  quiz: '診断クイズ',
  entertainment_quiz: 'エンタメ診断',
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
  salesletter: 'セールスレター',
  survey: 'アンケート',
  booking: '予約',
  attendance: '出欠',
  gamification: 'ゲーミフィケーション',
  onboarding: 'ガイドメーカー',
  newsletter: 'メルマガ',
  'order-form': '申し込みフォーム',
  funnel: 'ファネル',
  thumbnail: 'サムネイル',
  direct: '直接追加',
};

export default function LineFriendList({ userId, friends, onRefresh }: LineFriendListProps) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // ソース種別の集計
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    friends.forEach(f => {
      counts[f.source_type] = (counts[f.source_type] || 0) + 1;
    });
    return counts;
  }, [friends]);

  // フィルタリング
  const filtered = useMemo(() => {
    let result = friends;
    if (sourceFilter !== 'all') {
      result = result.filter(f => f.source_type === sourceFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.display_name?.toLowerCase().includes(q) ||
        f.line_user_id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [friends, sourceFilter, search]);

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">友だちリスト（{friends.length}人）</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          更新
        </button>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="名前やIDで検索..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="all">すべての流入経路</option>
            {Object.entries(sourceCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => (
                <option key={source} value={source}>
                  {SOURCE_LABELS[source] || source}（{count}）
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 流入経路チャート（簡易版） */}
      {Object.keys(sourceCounts).length > 1 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">流入経路の内訳</h4>
          <div className="space-y-2">
            {Object.entries(sourceCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => {
                const percentage = friends.length > 0 ? (count / friends.length) * 100 : 0;
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24 shrink-0">{SOURCE_LABELS[source] || source}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{count}人（{percentage.toFixed(0)}%）</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 友だちリスト */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {friends.length === 0
              ? 'まだ友だちがいません'
              : '条件に一致する友だちがいません'}
          </p>
          {friends.length === 0 && (
            <p className="text-sm text-gray-400 mt-1">
              クイズやLPに友だち追加ボタンを設置すると、ここに表示されます
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map(friend => (
              <div key={friend.id} className="flex items-center gap-4 px-5 py-4">
                {/* アバター */}
                {friend.picture_url ? (
                  <img
                    src={friend.picture_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {friend.display_name || 'LINE ユーザー'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                      {SOURCE_LABELS[friend.source_type] || friend.source_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {friend.followed_at
                        ? new Date(friend.followed_at).toLocaleDateString('ja-JP')
                        : ''}
                    </span>
                  </div>
                </div>

                {/* ステータス */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  friend.status === 'active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {friend.status === 'active' ? '有効' : 'ブロック/解除'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
