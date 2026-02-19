'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Loader2, X, Search, ChevronDown, ChevronRight, BarChart3, Crown } from 'lucide-react';
import UserDetailPanel from './UserDetailPanel';

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
  active_plans?: Array<{ service: string; plan_tier: string; plan_tier_label: string }>;
  is_monitor?: boolean;
  monitor_services?: string[];
  ai_monthly_usage?: number;
};

type UserManagerProps = {
  allUsers: UserWithRoles[];
  loadingUsers: boolean;
  userPage: number;
  setUserPage: React.Dispatch<React.SetStateAction<number>>;
  userTotalCount: number;
  userSearch: string;
  setUserSearch: React.Dispatch<React.SetStateAction<string>>;
  onFetchPage: (page: number, search?: string) => Promise<void>;
  editingUserId: string | null;
  setEditingUserId: React.Dispatch<React.SetStateAction<string | null>>;
  partnerNote: string;
  setPartnerNote: React.Dispatch<React.SetStateAction<string>>;
  awardingPoints: string | null;
  setAwardingPoints: React.Dispatch<React.SetStateAction<string | null>>;
  pointsToAward: number;
  setPointsToAward: React.Dispatch<React.SetStateAction<number>>;
  pointsReason: string;
  setPointsReason: React.Dispatch<React.SetStateAction<string>>;
  onTogglePartner: (userId: string, currentStatus: boolean, note?: string) => Promise<void>;
  onAwardPoints: (userId: string) => Promise<void>;
};

const USERS_PER_PAGE = 10;

const PLAN_COLORS: Record<string, string> = {
  lite: 'bg-blue-100 text-blue-700',
  standard: 'bg-green-100 text-green-700',
  pro: 'bg-purple-100 text-purple-700',
  business: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-red-100 text-red-700',
  initial_trial: 'bg-cyan-100 text-cyan-700',
  initial_standard: 'bg-green-100 text-green-700',
  initial_business: 'bg-amber-100 text-amber-700',
};

export default function UserManager({
  allUsers,
  loadingUsers,
  userPage,
  setUserPage,
  userTotalCount,
  userSearch,
  setUserSearch,
  onFetchPage,
  editingUserId,
  setEditingUserId,
  partnerNote,
  setPartnerNote,
  awardingPoints,
  setAwardingPoints,
  pointsToAward,
  setPointsToAward,
  pointsReason,
  setPointsReason,
  onTogglePartner,
  onAwardPoints,
}: UserManagerProps) {
  const totalUserPages = Math.ceil(userTotalCount / USERS_PER_PAGE);
  const [searchInput, setSearchInput] = useState(userSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // デボウンス付き検索
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== userSearch) {
        setUserSearch(searchInput);
        onFetchPage(1, searchInput);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const handlePageChange = (newPage: number) => {
    setUserPage(newPage);
    onFetchPage(newPage, userSearch);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-purple-600" /> ユーザー管理
            <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          </h2>
          <span className="text-sm text-gray-500">全{userTotalCount}件</span>
        </div>
        {/* 検索バー */}
        <div className="mt-3 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="メールアドレスで検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
          />
        </div>
      </div>

      {loadingUsers ? (
        <div className="p-8 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-purple-600 mb-3" />
          <p className="text-gray-500">ユーザー情報を読み込み中...</p>
        </div>
      ) : allUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Users size={48} className="mx-auto mb-3 text-gray-300" />
          <p>{userSearch ? '検索結果がありません' : 'ユーザーが見つかりません'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">メールアドレス</th>
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">プラン</th>
                <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">AI使用(月)</th>
                <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">ポイント</th>
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">登録日</th>
                <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">詳細</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((usr) => {
                const isEditing = editingUserId === usr.user_id;
                const isAwardingPointsToUser = awardingPoints === usr.user_id;
                return (
                  <React.Fragment key={usr.user_id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    {/* メールアドレス + パートナーバッジ */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedUserId(expandedUserId === usr.user_id ? null : usr.user_id)}
                        className="flex items-center gap-1.5 text-gray-900 font-medium hover:text-indigo-600 transition-colors text-left"
                      >
                        {expandedUserId === usr.user_id ? (
                          <ChevronDown size={14} className="text-indigo-500 shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        )}
                        <span>{usr.email}</span>
                      </button>
                      <div className="flex items-center gap-1.5 ml-5 mt-1">
                        {usr.is_partner && (
                          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            パートナー
                          </span>
                        )}
                        {usr.partner_note && (
                          <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{usr.partner_note}</span>
                        )}
                      </div>
                    </td>
                    {/* プラン */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(usr.active_plans || []).length > 0 ? (
                          (usr.active_plans || []).map((plan, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold ${PLAN_COLORS[plan.plan_tier] || 'bg-gray-100 text-gray-700'}`}>
                              {plan.service === 'kdl' ? 'KDL' : 'M'}: {plan.plan_tier_label}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                        {usr.is_monitor && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700">
                            モニター
                          </span>
                        )}
                      </div>
                    </td>
                    {/* AI使用量(月) */}
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${(usr.ai_monthly_usage || 0) > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                        {usr.ai_monthly_usage || 0}
                      </span>
                      <span className="text-gray-400 text-xs ml-0.5">回</span>
                    </td>
                    {/* ポイント */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-purple-600">
                        {usr.current_points?.toLocaleString() || 0}pt
                      </span>
                    </td>
                    {/* 登録日 */}
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(usr.user_created_at).toLocaleDateString('ja-JP')}
                    </td>
                    {/* 詳細ボタン */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setExpandedUserId(expandedUserId === usr.user_id ? null : usr.user_id)}
                        className="text-indigo-500 hover:text-indigo-700 transition-colors"
                      >
                        {expandedUserId === usr.user_id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </td>
                  </tr>
                  {/* 展開行: 詳細 + 操作 */}
                  {expandedUserId === usr.user_id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 bg-gray-50">
                        {/* 操作ボタン */}
                        <div className="flex items-center gap-2 mb-2 px-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="メモ（任意）"
                                value={partnerNote}
                                onChange={(e) => setPartnerNote(e.target.value)}
                                className="text-xs border border-gray-300 px-2 py-1 rounded bg-white text-gray-900 w-48"
                              />
                              <button
                                onClick={() => onTogglePartner(usr.user_id, usr.is_partner, partnerNote)}
                                className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700"
                              >
                                {usr.is_partner ? '解除' : '設定'}
                              </button>
                              <button
                                onClick={() => { setEditingUserId(null); setPartnerNote(''); }}
                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : isAwardingPointsToUser ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="ポイント数"
                                value={pointsToAward || ''}
                                onChange={(e) => setPointsToAward(Number(e.target.value))}
                                className="text-xs border border-purple-300 px-2 py-1 rounded bg-white text-gray-900 w-24"
                              />
                              <input
                                type="text"
                                placeholder="理由"
                                value={pointsReason}
                                onChange={(e) => setPointsReason(e.target.value)}
                                className="text-xs border border-purple-300 px-2 py-1 rounded bg-white text-gray-900 w-40"
                              />
                              <button
                                onClick={() => onAwardPoints(usr.user_id)}
                                disabled={pointsToAward === 0}
                                className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
                              >
                                付与
                              </button>
                              <button
                                onClick={() => { setAwardingPoints(null); setPointsToAward(0); setPointsReason(''); }}
                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingUserId(usr.user_id); setPartnerNote(usr.partner_note || ''); }}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                  usr.is_partner
                                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                              >
                                {usr.is_partner ? 'パートナー解除' : 'パートナー設定'}
                              </button>
                              <button
                                onClick={() => { setAwardingPoints(usr.user_id); setPointsToAward(0); setPointsReason('開発支援への感謝'); }}
                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors"
                              >
                                Pt付与
                              </button>
                              <span className="text-xs text-gray-400 ml-2">
                                累計: {usr.total_accumulated_points?.toLocaleString() || 0}pt / 支援額: ¥{usr.total_donated.toLocaleString()} / 購入: {usr.total_purchases}件
                              </span>
                            </>
                          )}
                        </div>
                        <UserDetailPanel
                          userId={usr.user_id}
                          onClose={() => setExpandedUserId(null)}
                        />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* サーバーサイドページネーションUI */}
          {totalUserPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handlePageChange(Math.max(1, userPage - 1))}
                disabled={userPage === 1 || loadingUsers}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${
                  userPage === 1 || loadingUsers
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                前へ
              </button>
              <span className="text-gray-700 text-sm">
                <span className="font-bold text-purple-600">{userPage}</span> / {totalUserPages} ページ
                <span className="text-gray-500 ml-2">(全{userTotalCount}件)</span>
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalUserPages, userPage + 1))}
                disabled={userPage === totalUserPages || loadingUsers}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${
                  userPage === totalUserPages || loadingUsers
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                次へ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
