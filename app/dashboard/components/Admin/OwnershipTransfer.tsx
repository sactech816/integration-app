'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Loader2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// コンテンツタイプの定義
const CONTENT_TYPES = [
  { id: 'profiles', label: 'プロフィール', icon: '👤' },
  { id: 'sales_letters', label: 'セールスレター/LP', icon: '📝' },
  { id: 'quizzes', label: 'クイズ', icon: '❓' },
  { id: 'surveys', label: 'アンケート', icon: '📊' },
  { id: 'business_projects', label: 'ビジネスLP', icon: '🏢' },
  { id: 'gamification_campaigns', label: 'ガチャ/スタンプ', icon: '🎮' },
] as const;

type ContentType = typeof CONTENT_TYPES[number]['id'];

type ContentInfo = {
  id: string;
  title?: string;
  slug?: string;
  nickname?: string;
  [key: string]: unknown;
};

type OwnerInfo = {
  id: string;
  email: string;
};

type UserWithRoles = {
  user_id: string;
  email: string;
  is_partner: boolean;
  partner_since: string | null;
  partner_note: string | null;
  user_created_at: string;
  total_purchases: number;
  total_donated: number;
  current_points?: number;
  total_accumulated_points?: number;
};

type OwnershipTransferProps = {
  allUsers: UserWithRoles[];
};

export default function OwnershipTransfer({ allUsers }: OwnershipTransferProps) {
  // supabase は lib/supabase からインポート済み
  
  // 状態管理
  const [contentType, setContentType] = useState<ContentType>('profiles');
  const [contentId, setContentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentInfo, setContentInfo] = useState<ContentInfo | null>(null);
  const [currentOwner, setCurrentOwner] = useState<OwnerInfo | null>(null);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState(false);

  // ユーザー検索結果
  const filteredUsers = searchQuery
    ? allUsers.filter((u) =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // コンテンツ情報を取得
  const fetchContentInfo = async () => {
    if (!contentId.trim()) {
      setError('コンテンツIDを入力してください');
      return;
    }

    setSearching(true);
    setError(null);
    setContentInfo(null);
    setCurrentOwner(null);

    try {
      if (!supabase) {
        setError('データベースが設定されていません');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('認証が必要です');
        return;
      }

      const response = await fetch(
        `/api/admin/transfer-ownership?contentType=${contentType}&contentId=${encodeURIComponent(contentId)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'コンテンツの取得に失敗しました');
        return;
      }

      setContentInfo(data.content);
      setCurrentOwner(data.currentOwner);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('コンテンツの取得に失敗しました');
    } finally {
      setSearching(false);
    }
  };

  // 所有権を移動
  const transferOwnership = async () => {
    if (!contentInfo || !newOwnerId) {
      setError('移動先ユーザーを選択してください');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!supabase) {
        setError('データベースが設定されていません');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('認証が必要です');
        return;
      }

      const response = await fetch('/api/admin/transfer-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          contentType,
          contentId: contentInfo.id,
          newOwnerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || '所有権の移動に失敗しました');
        return;
      }

      setSuccess(`所有権を ${newOwnerEmail} に移動しました`);
      setCurrentOwner({ id: newOwnerId, email: newOwnerEmail });
      setConfirmMode(false);
      setNewOwnerId('');
      setNewOwnerEmail('');
      setSearchQuery('');
    } catch (err) {
      console.error('Transfer error:', err);
      setError('所有権の移動に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コンテンツの表示名を取得
  const getContentDisplayName = (content: ContentInfo): string => {
    if (content.title) return content.title;
    if (content.nickname) return content.nickname;
    if (content.slug) return content.slug;
    return content.id;
  };

  // リセット
  const handleReset = () => {
    setContentInfo(null);
    setCurrentOwner(null);
    setContentId('');
    setNewOwnerId('');
    setNewOwnerEmail('');
    setSearchQuery('');
    setError(null);
    setSuccess(null);
    setConfirmMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowRightLeft size={20} className="text-blue-600" /> 所有権の移動
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">ADMIN</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          コンテンツの所有者を別のユーザーに変更します
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ステップ1: コンテンツタイプ選択 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            1. コンテンツタイプを選択
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setContentType(type.id);
                  handleReset();
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  contentType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="ml-2 text-sm font-medium text-gray-900">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ステップ2: コンテンツID入力 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            2. コンテンツIDを入力
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              placeholder="UUIDまたはID（例: 123e4567-e89b-12d3-a456-426614174000）"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={fetchContentInfo}
              disabled={searching || !contentId.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              検索
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">エラー</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 成功表示 */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800">完了</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* コンテンツ情報表示 */}
        {contentInfo && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">コンテンツ情報</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">タイトル/名前:</span>
                <p className="font-medium text-gray-900">{getContentDisplayName(contentInfo)}</p>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <p className="font-mono text-xs text-gray-700 break-all">{contentInfo.id}</p>
              </div>
              {contentInfo.slug && (
                <div>
                  <span className="text-gray-500">Slug:</span>
                  <p className="font-medium text-gray-900">{contentInfo.slug}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">現在の所有者:</span>
                <p className="font-medium text-gray-900">
                  {currentOwner ? currentOwner.email : <span className="text-gray-400">未設定</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ステップ3: 移動先ユーザー選択 */}
        {contentInfo && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              3. 移動先ユーザーを選択
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setNewOwnerId('');
                  setNewOwnerEmail('');
                }}
                placeholder="メールアドレスで検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              {/* 検索結果ドロップダウン */}
              {filteredUsers.length > 0 && !newOwnerId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => {
                        setNewOwnerId(user.user_id);
                        setNewOwnerEmail(user.email);
                        setSearchQuery(user.email);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 text-sm text-gray-900 border-b border-gray-100 last:border-b-0"
                    >
                      {user.email}
                      {user.is_partner && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          パートナー
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 選択されたユーザー表示 */}
            {newOwnerId && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-sm text-blue-700">選択中:</span>
                  <span className="ml-2 font-bold text-blue-900">{newOwnerEmail}</span>
                </div>
                <button
                  onClick={() => {
                    setNewOwnerId('');
                    setNewOwnerEmail('');
                    setSearchQuery('');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  変更
                </button>
              </div>
            )}
          </div>
        )}

        {/* 確認と実行 */}
        {contentInfo && newOwnerId && (
          <div className="border-t border-gray-200 pt-6">
            {!confirmMode ? (
              <button
                onClick={() => setConfirmMode(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                所有権を移動する
              </button>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-bold text-amber-800 mb-2">⚠️ 確認</p>
                <p className="text-sm text-amber-700 mb-4">
                  「{getContentDisplayName(contentInfo)}」の所有権を
                  <span className="font-bold"> {currentOwner?.email || '未設定'} </span>
                  から
                  <span className="font-bold"> {newOwnerEmail} </span>
                  に移動します。この操作は取り消せません。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={transferOwnership}
                    disabled={loading}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    実行する
                  </button>
                  <button
                    onClick={() => setConfirmMode(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* リセットボタン */}
        {contentInfo && (
          <button
            onClick={handleReset}
            className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            フォームをリセット
          </button>
        )}
      </div>
    </div>
  );
}
