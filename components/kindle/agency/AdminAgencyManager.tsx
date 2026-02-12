'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Loader2, AlertCircle, ChevronDown, ChevronRight,
  UserPlus, Trash2, Shield, Ban, CheckCircle, Building2, RefreshCw
} from 'lucide-react';

interface AssignedUser {
  user_id: string;
  user_email: string;
  assigned_at: string;
  note: string | null;
  status: string;
  id?: string;
}

interface Agency {
  id: string;
  user_id: string;
  agency_name: string;
  agency_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  agency_email: string;
  assigned_count: number;
  assigned_users: AssignedUser[];
}

interface AdminAgencyManagerProps {
  userId: string;
  accessToken: string;
}

export default function AdminAgencyManager({
  userId,
  accessToken,
}: AdminAgencyManagerProps) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

  // 代理店登録フォーム
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerDescription, setRegisterDescription] = useState('');
  const [registerContactEmail, setRegisterContactEmail] = useState('');
  const [registerContactPhone, setRegisterContactPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // ユーザー割当フォーム
  const [assignAgencyId, setAssignAgencyId] = useState<string | null>(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const fetchAgencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/agency', { headers: { 'Authorization': `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error('代理店一覧の取得に失敗しました');
      const data = await response.json();
      setAgencies(data.agencies || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  // メッセージ表示（3秒で消去）
  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  // 代理店登録
  const handleRegister = async () => {
    if (!registerEmail || !registerName) return;
    setIsRegistering(true);
    try {
      const response = await fetch('/api/admin/agency', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'register',
          user_email: registerEmail,
          agency_name: registerName,
          agency_description: registerDescription || undefined,
          contact_email: registerContactEmail || undefined,
          contact_phone: registerContactPhone || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '登録に失敗しました');
      showMessage('success', '代理店を登録しました');
      setShowRegisterForm(false);
      setRegisterEmail('');
      setRegisterName('');
      setRegisterDescription('');
      setRegisterContactEmail('');
      setRegisterContactPhone('');
      fetchAgencies();
    } catch (err: any) {
      showMessage('error', err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // ユーザー割当
  const handleAssignUser = async () => {
    if (!assignAgencyId || !assignEmail) return;
    setIsAssigning(true);
    try {
      const response = await fetch('/api/admin/agency', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'assign-user',
          agency_id: assignAgencyId,
          user_email: assignEmail,
          note: assignNote || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '割り当てに失敗しました');
      showMessage('success', 'ユーザーを割り当てました');
      setAssignAgencyId(null);
      setAssignEmail('');
      setAssignNote('');
      fetchAgencies();
    } catch (err: any) {
      showMessage('error', err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  // ステータス変更
  const handleUpdateStatus = async (agencyId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/agency', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update-status',
          agency_id: agencyId,
          status,
        }),
      });
      if (!response.ok) throw new Error('ステータス変更に失敗しました');
      showMessage('success', 'ステータスを変更しました');
      fetchAgencies();
    } catch (err: any) {
      showMessage('error', err.message);
    }
  };

  // 代理店削除
  const handleRemoveAgency = async (agencyId: string) => {
    if (!confirm('この代理店を削除しますか？関連する割り当てもすべて削除されます。')) return;
    try {
      const response = await fetch(
        `/api/admin/agency?action=remove-agency&id=${agencyId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('削除に失敗しました');
      showMessage('success', '代理店を削除しました');
      fetchAgencies();
    } catch (err: any) {
      showMessage('error', err.message);
    }
  };

  // ユーザー割当解除
  const handleUnassignUser = async (assignmentId: string) => {
    if (!confirm('この割り当てを解除しますか？')) return;
    try {
      const response = await fetch(
        `/api/admin/agency?action=unassign-user&id=${assignmentId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('割り当て解除に失敗しました');
      showMessage('success', '割り当てを解除しました');
      fetchAgencies();
    } catch (err: any) {
      showMessage('error', err.message);
    }
  };

  const toggleAgency = (agencyId: string) => {
    setExpandedAgencies(prev => {
      const next = new Set(prev);
      if (next.has(agencyId)) next.delete(agencyId);
      else next.add(agencyId);
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} />有効</span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Ban size={12} />停止</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">無効</span>;
      default:
        return null;
    }
  };

  // 統計
  const stats = {
    total: agencies.length,
    active: agencies.filter(a => a.status === 'active').length,
    totalAssigned: agencies.reduce((sum, a) => sum + a.assigned_count, 0),
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={22} />
              代理店管理
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>代理店 {stats.total}社</span>
              <span className="text-green-600">有効 {stats.active}社</span>
              <span className="text-blue-600">担当ユーザー {stats.totalAssigned}名</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAgencies}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
              title="更新"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              新規代理店登録
            </button>
          </div>
        </div>
      </div>

      {/* アクションメッセージ */}
      {actionMessage && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          actionMessage.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* 代理店登録フォーム */}
      {showRegisterForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">新規代理店登録</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザーメール <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="agency@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                代理店名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="代理店名"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
              <textarea
                value={registerDescription}
                onChange={(e) => setRegisterDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
                placeholder="代理店の説明"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">連絡先メール（任意）</label>
              <input
                type="email"
                value={registerContactEmail}
                onChange={(e) => setRegisterContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">連絡先電話（任意）</label>
              <input
                type="tel"
                value={registerContactPhone}
                onChange={(e) => setRegisterContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="090-XXXX-XXXX"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleRegister}
              disabled={isRegistering || !registerEmail || !registerName}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isRegistering || !registerEmail || !registerName
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {isRegistering ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              登録
            </button>
            <button
              onClick={() => setShowRegisterForm(false)}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 代理店一覧 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
          <p className="text-red-600">{error}</p>
        </div>
      ) : agencies.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Building2 className="text-gray-300 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-700 mb-2">代理店がまだ登録されていません</h3>
          <p className="text-gray-500">「新規代理店登録」から代理店を追加してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agencies.map(agency => (
            <div key={agency.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* 代理店ヘッダー */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => toggleAgency(agency.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Building2 size={18} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{agency.agency_name}</p>
                      {getStatusBadge(agency.status)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {agency.agency_email} | 担当: {agency.assigned_count}名 | 登録: {formatDate(agency.created_at)}
                    </p>
                  </div>
                  {expandedAgencies.has(agency.id) ? (
                    <ChevronDown size={18} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400 shrink-0" />
                  )}
                </button>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => setAssignAgencyId(assignAgencyId === agency.id ? null : agency.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="ユーザー割当"
                  >
                    <UserPlus size={16} />
                  </button>
                  {agency.status === 'active' ? (
                    <button
                      onClick={() => handleUpdateStatus(agency.id, 'suspended')}
                      className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      title="停止"
                    >
                      <Ban size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(agency.id, 'active')}
                      className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="有効化"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveAgency(agency.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* ユーザー割当フォーム */}
              {assignAgencyId === agency.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">ユーザーを割り当て</h4>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={assignEmail}
                        onChange={(e) => setAssignEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ユーザーのメールアドレス"
                      />
                    </div>
                    <div className="w-40">
                      <input
                        type="text"
                        value={assignNote}
                        onChange={(e) => setAssignNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="メモ（任意）"
                      />
                    </div>
                    <button
                      onClick={handleAssignUser}
                      disabled={isAssigning || !assignEmail}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 ${
                        isAssigning || !assignEmail
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isAssigning ? <Loader2 className="animate-spin" size={16} /> : '割り当て'}
                    </button>
                  </div>
                </div>
              )}

              {/* 割り当てユーザー一覧 */}
              {expandedAgencies.has(agency.id) && (
                <div className="border-t border-gray-100">
                  {agency.assigned_users.length === 0 ? (
                    <p className="text-gray-400 text-sm p-4">割り当てユーザーなし</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {agency.assigned_users.map(au => (
                        <div key={au.user_id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-xs">
                              {au.user_email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{au.user_email}</p>
                              <p className="text-xs text-gray-400">
                                割り当て: {formatDate(au.assigned_at)}
                                {au.note && ` | ${au.note}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => au.id && handleUnassignUser(au.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="割り当て解除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
