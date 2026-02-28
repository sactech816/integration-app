'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Plus, UserMinus, Loader2, Copy, ExternalLink, Upload, X, FileUp, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/security/sanitize';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface ListDetail {
  id: string;
  name: string;
  description: string | null;
  from_name: string | null;
  from_email: string | null;
  resend_audience_id: string | null;
}

interface ImportSources {
  leads: { quiz: number; profile: number; business: number; total: number };
  orderForms: number;
}

export default function SubscriberList({ listId }: { listId: string }) {
  const [list, setList] = useState<ListDetail | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('subscribed');
  const [copied, setCopied] = useState(false);

  // インポート関連
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<'tools' | 'csv'>('tools');
  const [importSources, setImportSources] = useState<ImportSources | null>(null);
  const [importSourcesLoading, setImportSourcesLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [csvData, setCsvData] = useState<{ email: string; name?: string }[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await Promise.all([fetchList(user.id), fetchSubscribers(user.id, filter)]);
      }
      setLoading(false);
    };
    init();
  }, [listId]);

  useEffect(() => {
    if (userId) fetchSubscribers(userId, filter);
  }, [filter]);

  const fetchList = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/lists/${listId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setList(data.list);
    }
  };

  const fetchSubscribers = async (uid: string, statusFilter: string) => {
    const res = await fetch(`/api/newsletter-maker/lists/${listId}/subscribers?userId=${uid}&status=${statusFilter}`);
    if (res.ok) {
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    }
  };

  const handleAdd = async () => {
    if (!userId || !newEmail) return;
    if (!isValidEmail(newEmail)) {
      alert('有効なメールアドレスを入力してください');
      return;
    }
    setAdding(true);
    const res = await fetch(`/api/newsletter-maker/lists/${listId}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email: newEmail, name: newName || undefined }),
    });
    if (res.ok) {
      setNewEmail('');
      setNewName('');
      setShowAddForm(false);
      await fetchSubscribers(userId, filter);
    }
    setAdding(false);
  };

  const handleUnsubscribe = async (email: string) => {
    if (!userId || !confirm(`${email} の配信を停止しますか？`)) return;
    await fetch(`/api/newsletter-maker/lists/${listId}/subscribers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });
    await fetchSubscribers(userId, filter);
  };

  const subscribeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/newsletter/subscribe/${listId}`
    : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subscribeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // インポートモーダルを開く
  const openImportModal = async () => {
    setShowImportModal(true);
    setImportTab('tools');
    setImportResult(null);
    setCsvData([]);
    setCsvFileName('');
    setSelectedSources(new Set());
    if (userId) {
      setImportSourcesLoading(true);
      try {
        const res = await fetch(`/api/newsletter-maker/import-sources?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setImportSources(data);
        }
      } catch {}
      setImportSourcesLoading(false);
    }
  };

  // ツールからインポート
  const handleToolImport = async () => {
    if (!userId || selectedSources.size === 0) return;
    setImporting(true);
    setImportResult(null);
    let totalImported = 0;
    let totalSkipped = 0;

    for (const source of selectedSources) {
      let body: Record<string, unknown> = { userId };
      if (source === 'order_forms') {
        body = { ...body, source: 'order_forms' };
      } else {
        body = { ...body, source: 'leads', contentType: source };
      }

      try {
        const res = await fetch(`/api/newsletter-maker/lists/${listId}/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          totalImported += data.imported || 0;
          totalSkipped += data.skipped || 0;
        }
      } catch {}
    }

    setImportResult({ imported: totalImported, skipped: totalSkipped });
    setImporting(false);
    if (userId) fetchSubscribers(userId, filter);
  };

  // CSVパース
  const parseCsv = useCallback((text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const emailIdx = header.findIndex((h) => h === 'email' || h === 'メールアドレス' || h === 'mail');
    const nameIdx = header.findIndex((h) => h === 'name' || h === '名前' || h === '氏名');

    if (emailIdx === -1) return [];

    const result: { email: string; name?: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const email = cols[emailIdx];
      if (email && isValidEmail(email)) {
        result.push({
          email,
          name: nameIdx >= 0 ? cols[nameIdx] : undefined,
        });
      }
    }
    return result;
  }, []);

  // ファイル読み込み
  const handleFileSelect = (file: File) => {
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      setCsvData(parsed);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // ドラッグ＆ドロップ
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      handleFileSelect(file);
    }
  }, []);

  // CSVインポート
  const handleCsvImport = async () => {
    if (!userId || csvData.length === 0) return;
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch(`/api/newsletter-maker/lists/${listId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, source: 'csv', data: csvData }),
      });
      if (res.ok) {
        const data = await res.json();
        setImportResult({ imported: data.imported, skipped: data.skipped });
        if (userId) fetchSubscribers(userId, filter);
      }
    } catch {}
    setImporting(false);
  };

  // ソース選択トグル
  const toggleSource = (source: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">リストが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
        {list.description && <p className="text-gray-600 mt-1">{list.description}</p>}
      </div>

      {/* 公開購読URL */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-violet-700 mb-2">公開購読フォームURL</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={subscribeUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-white border border-violet-200 rounded-lg text-sm text-gray-900 truncate"
          />
          <button
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-1 px-3 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors min-h-[44px]"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'コピー済み' : 'コピー'}
          </button>
          <a
            href={subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-violet-600 hover:text-violet-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* フィルター・追加ボタン */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['subscribed', 'unsubscribed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
                filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'subscribed' ? '購読中' : f === 'unsubscribed' ? '停止済み' : 'すべて'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={openImportModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-violet-300 text-violet-700 font-semibold rounded-lg hover:bg-violet-50 transition-colors text-sm min-h-[44px]"
          >
            <Upload className="w-4 h-4" />
            インポート
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors text-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            読者を追加
          </button>
        </div>
      </div>

      {/* 手動追加フォーム */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="メールアドレス"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              placeholder="名前（任意）"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newEmail}
              className="px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px]"
            >
              {adding ? '追加中...' : '追加'}
            </button>
          </div>
        </div>
      )}

      {/* 読者一覧 */}
      {subscribers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === 'subscribed' ? 'まだ読者がいません' : '該当する読者がいません'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">メールアドレス</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">名前</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">ステータス</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">登録日</th>
                <th className="text-right px-5 py-3 text-sm font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-900 font-medium">{sub.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{sub.name || '-'}</td>
                  <td className="px-5 py-3">
                    {sub.status === 'subscribed' ? (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">購読中</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">停止済み</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(sub.subscribed_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {sub.status === 'subscribed' && (
                      <button
                        onClick={() => handleUnsubscribe(sub.email)}
                        className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors min-h-[44px]"
                      >
                        <UserMinus className="w-4 h-4" />
                        停止
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

      {/* インポートモーダル */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">購読者をインポート</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* タブ */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => { setImportTab('tools'); setImportResult(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  importTab === 'tools'
                    ? 'text-violet-600 border-b-2 border-violet-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ツールから取込
              </button>
              <button
                onClick={() => { setImportTab('csv'); setImportResult(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  importTab === 'csv'
                    ? 'text-violet-600 border-b-2 border-violet-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                CSVアップロード
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              {/* 結果表示 */}
              {importResult && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {importResult.imported}件をインポートしました
                    </p>
                    {importResult.skipped > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {importResult.skipped}件は重複のためスキップ
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ツールから取込タブ */}
              {importTab === 'tools' && (
                <div className="space-y-3">
                  {importSourcesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    </div>
                  ) : importSources ? (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        既存ツールのリードデータを購読者として取り込みます。
                      </p>

                      {/* 診断クイズ */}
                      <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        importSources.leads.quiz === 0 ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                        selectedSources.has('quiz') ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-200 bg-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedSources.has('quiz')}
                          onChange={() => toggleSource('quiz')}
                          disabled={importSources.leads.quiz === 0}
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">診断クイズのリード</span>
                          <span className="ml-2 text-sm text-gray-500">({importSources.leads.quiz}件)</span>
                        </div>
                      </label>

                      {/* プロフィールLP */}
                      <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        importSources.leads.profile === 0 ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                        selectedSources.has('profile') ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-200 bg-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedSources.has('profile')}
                          onChange={() => toggleSource('profile')}
                          disabled={importSources.leads.profile === 0}
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">プロフィールLPのリード</span>
                          <span className="ml-2 text-sm text-gray-500">({importSources.leads.profile}件)</span>
                        </div>
                      </label>

                      {/* ビジネスLP */}
                      <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        importSources.leads.business === 0 ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                        selectedSources.has('business') ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-200 bg-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedSources.has('business')}
                          onChange={() => toggleSource('business')}
                          disabled={importSources.leads.business === 0}
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">ビジネスLPのリード</span>
                          <span className="ml-2 text-sm text-gray-500">({importSources.leads.business}件)</span>
                        </div>
                      </label>

                      {/* 申し込みフォーム */}
                      <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        importSources.orderForms === 0 ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                        selectedSources.has('order_forms') ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-200 bg-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedSources.has('order_forms')}
                          onChange={() => toggleSource('order_forms')}
                          disabled={importSources.orderForms === 0}
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">申し込みフォームの送信者</span>
                          <span className="ml-2 text-sm text-gray-500">({importSources.orderForms}件)</span>
                        </div>
                      </label>

                      <button
                        onClick={handleToolImport}
                        disabled={importing || selectedSources.size === 0}
                        className="w-full mt-4 px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px]"
                      >
                        {importing ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />インポート中...
                          </span>
                        ) : (
                          'インポート実行'
                        )}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">データソースの取得に失敗しました</p>
                  )}
                </div>
              )}

              {/* CSVアップロードタブ */}
              {importTab === 'csv' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    CSVファイルから購読者を一括インポートします。<br />
                    <span className="text-gray-500">ヘッダー行に「email」または「メールアドレス」列が必要です。「name」または「名前」列があれば名前も取り込みます。</span>
                  </p>

                  {/* ドロップゾーン */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-violet-400 bg-violet-50'
                        : csvFileName
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-violet-300 hover:bg-violet-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                    {csvFileName ? (
                      <>
                        <FileUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-green-700">{csvFileName}</p>
                        <p className="text-xs text-green-600 mt-1">{csvData.length}件の有効なメールアドレスを検出</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-600">CSVファイルをドラッグ＆ドロップ</p>
                        <p className="text-xs text-gray-400 mt-1">またはクリックして選択</p>
                      </>
                    )}
                  </div>

                  {/* プレビュー */}
                  {csvData.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600">プレビュー（先頭5件）</p>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">メールアドレス</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">名前</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {csvData.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 text-gray-900">{row.email}</td>
                              <td className="px-4 py-2 text-gray-600">{row.name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 5 && (
                        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
                          ...他 {csvData.length - 5}件
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleCsvImport}
                    disabled={importing || csvData.length === 0}
                    className="w-full px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px]"
                  >
                    {importing ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />インポート中...
                      </span>
                    ) : (
                      `${csvData.length}件をインポート`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
