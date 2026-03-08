'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Save, ArrowLeft, Loader2, Monitor, Pencil,
  ChevronDown, ChevronUp, Settings, FileText, Paintbrush,
  LayoutTemplate, Sparkles, Type, Code, Eye, Mail, AlertTriangle,
  CheckCircle2, Users, X, SendHorizonal, Plus, UserPlus, UserMinus,
  Upload, FileUp, Link2, Trash2
} from 'lucide-react';
import { isValidEmail } from '@/lib/security/sanitize';
import { supabase } from '@/lib/supabase';
import { NEWSLETTER_TEMPLATES, type NewsletterTemplate } from '@/constants/templates/newsletter';

interface CampaignEditorProps {
  campaignId?: string;
  defaultListId?: string;
}

interface ListOption {
  id: string;
  name: string;
  header_html?: string;
  footer_html?: string;
}

// 折りたたみセクション（他エディタと統一パターン）
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
  step,
  stepLabel,
  headerBgColor = 'bg-gray-50',
  headerHoverColor = 'hover:bg-gray-100',
  accentColor = 'bg-violet-100 text-violet-600',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
  headerBgColor?: string;
  headerHoverColor?: string;
  accentColor?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          STEP {step}
        </span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button
      onClick={onToggle}
      className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? accentColor : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && (
      <div className="p-5 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// HTML⇔ビジュアル切替トグル
function ViewToggle({
  mode, onChange,
}: {
  mode: 'visual' | 'html';
  onChange: (mode: 'visual' | 'html') => void;
}) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 text-xs">
      <button
        onClick={() => onChange('visual')}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
          mode === 'visual' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Eye className="w-3 h-3" />ビジュアル
      </button>
      <button
        onClick={() => onChange('html')}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
          mode === 'html' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Code className="w-3 h-3" />HTML
      </button>
    </div>
  );
}

// 読者管理モーダル
function SubscriberManageModal({
  listId, userId, onClose, onCountChange,
}: {
  listId: string;
  userId: string;
  onClose: () => void;
  onCountChange: (count: number) => void;
}) {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; name: string | null; status: string; source: string | null; subscribed_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'list' | 'import'>('list');
  const [csvData, setCsvData] = useState<{ email: string; name?: string }[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; error?: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SOURCE_LABELS: Record<string, string> = {
    manual: '手動', csv: 'CSV', quiz: '診断クイズ', profile: 'プロフィール',
    business: 'ビジネスLP', booking: '予約メーカー', order_form: '申込フォーム',
    subscribe_form: '登録フォーム', registered_users: '登録ユーザー',
  };

  const fetchSubscribers = useCallback(async () => {
    const res = await fetch(`/api/newsletter-maker/lists/${listId}/subscribers?userId=${userId}&status=subscribed`);
    if (res.ok) {
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      onCountChange((data.subscribers || []).length);
    }
    setLoading(false);
  }, [listId, userId, onCountChange]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleAdd = async () => {
    if (!newEmail) return;
    if (!isValidEmail(newEmail)) { alert('有効なメールアドレスを入力してください'); return; }
    setAdding(true);
    const res = await fetch(`/api/newsletter-maker/lists/${listId}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email: newEmail, name: newName || undefined }),
    });
    if (res.ok) {
      setNewEmail('');
      setNewName('');
      await fetchSubscribers();
    }
    setAdding(false);
  };

  const handleUnsubscribe = async (email: string) => {
    if (!confirm(`${email} の配信を停止しますか？`)) return;
    await fetch(`/api/newsletter-maker/lists/${listId}/subscribers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });
    await fetchSubscribers();
  };

  // CSVパース
  const parseCsv = (text: string) => {
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
        result.push({ email, name: nameIdx >= 0 ? cols[nameIdx] : undefined });
      }
    }
    return result;
  };

  const handleFileSelect = (file: File) => {
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(parseCsv(text));
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleCsvImport = async () => {
    if (csvData.length === 0) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/newsletter-maker/lists/${listId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, source: 'csv', data: csvData }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ imported: data.imported, skipped: data.skipped });
        await fetchSubscribers();
      } else {
        setImportResult({ imported: 0, skipped: 0, error: data.error || 'インポートに失敗しました' });
      }
    } catch {
      setImportResult({ imported: 0, skipped: 0, error: 'ネットワークエラーが発生しました' });
    }
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            読者管理
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'list' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            読者一覧・追加
          </button>
          <button
            onClick={() => { setTab('import'); setImportResult(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'import' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            CSVインポート
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'list' && (
            <div className="space-y-4">
              {/* 手動追加フォーム */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-violet-500" />
                  読者を追加
                </p>
                <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="名前（任意）"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={adding || !newEmail}
                    className="px-5 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px] shadow-sm"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '追加'}
                  </button>
                </div>
              </div>

              {/* 読者一覧 */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">まだ読者がいません</p>
                  <p className="text-gray-400 text-xs mt-1">上のフォームから追加するか、CSVインポートを使ってください</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-600">購読中の読者（{subscribers.length}人）</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                    {subscribers.map((sub) => (
                      <div key={sub.id} className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{sub.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {sub.name && <span className="text-xs text-gray-500">{sub.name}</span>}
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                              {SOURCE_LABELS[sub.source || 'manual'] || sub.source || '手動'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnsubscribe(sub.email)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="配信停止"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'import' && (
            <div className="space-y-4">
              {/* 結果表示 */}
              {importResult && (
                <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                  importResult.error && importResult.imported === 0
                    ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    importResult.error && importResult.imported === 0 ? 'text-red-600' : 'text-green-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold ${
                      importResult.error && importResult.imported === 0 ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {importResult.imported}件をインポートしました
                    </p>
                    {importResult.skipped > 0 && (
                      <p className="text-xs text-green-600 mt-1">{importResult.skipped}件は重複のためスキップ</p>
                    )}
                    {importResult.error && (
                      <p className="text-xs text-red-600 mt-1">エラー: {importResult.error}</p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600">
                CSVファイルから購読者を一括インポートします。<br />
                <span className="text-gray-500">ヘッダー行に「email」または「メールアドレス」列が必要です。</span>
              </p>

              {/* ドロップゾーン */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFileSelect(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-violet-400 bg-violet-50'
                    : csvFileName ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }}
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
  );
}

// 送信確認モーダル
function SendConfirmModal({
  onConfirm, onCancel, sending, subscriberCount, subject, listName,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  sending: boolean;
  subscriberCount: number;
  subject: string;
  listName: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">一斉送信の確認</h2>
          <p className="text-sm text-gray-600 mb-6">
            送信後は編集できません。内容をよく確認してから送信してください。
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500">件名</p>
                <p className="text-sm text-gray-900 font-medium">{subject}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500">配信先</p>
                <p className="text-sm text-gray-900 font-medium">{listName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Send className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500">送信数</p>
                <p className="text-sm font-bold text-red-600">{subscriberCount}通</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all min-h-[44px] disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all min-h-[44px] flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />送信中...</>
            ) : (
              <><Send className="w-4 h-4" />送信する</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// テスト送信モーダル
function TestSendModal({
  onClose, campaignId, userId, userEmail,
}: {
  onClose: () => void;
  campaignId: string;
  userId: string;
  userEmail?: string;
}) {
  const [testEmail, setTestEmail] = useState(userEmail || '');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestSend = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/newsletter-maker/campaigns/${campaignId}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, testEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message || `${testEmail} にテストメールを送信しました` });
      } else {
        setTestResult({ success: false, message: data.error || 'テスト送信に失敗しました' });
      }
    } catch {
      setTestResult({ success: false, message: '通信エラーが発生しました' });
    }
    setTestSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <SendHorizonal className="w-5 h-5 text-blue-600" />
            テスト送信
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            指定したメールアドレスに1通だけテスト送信します。件名に「【テスト送信】」が付きます。
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">送信先メールアドレス</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleTestSend}
            disabled={testSending || !testEmail}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all min-h-[44px] flex items-center justify-center gap-2 shadow-md"
          >
            {testSending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />送信中...</>
            ) : (
              <><SendHorizonal className="w-4 h-4" />テスト送信する</>
            )}
          </button>

          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
              testResult.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// HTMLからプレーンテキストを抽出
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '・')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function CampaignEditor({ campaignId, defaultListId }: CampaignEditorProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [lists, setLists] = useState<ListOption[]>([]);
  const [listId, setListId] = useState(defaultListId || '');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentCount, setSentCount] = useState(0);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [subscriberCount, setSubscriberCount] = useState(0);

  // リスト新規作成
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListFromName, setNewListFromName] = useState('');
  const [newListFromEmail, setNewListFromEmail] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  // 読者管理モーダル
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);

  // CTAリンク（任意で複数追加可能）
  const [ctaLinks, setCtaLinks] = useState<{ label: string; url: string }[]>([]);

  // 保存完了
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(campaignId || null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // モーダル
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showTestSend, setShowTestSend] = useState(false);

  // 表示モード（HTML / ビジュアル）
  const [headerViewMode, setHeaderViewMode] = useState<'visual' | 'html'>('visual');
  const [bodyViewMode, setBodyViewMode] = useState<'visual' | 'html'>('visual');
  const [footerViewMode, setFooterViewMode] = useState<'visual' | 'html'>('visual');

  // AI 関連
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPurpose, setAiPurpose] = useState('announcement');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiResults, setAiResults] = useState<string[]>([]);

  // 件名候補
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);

  // contentEditable refs
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // セクション開閉
  const [openSections, setOpenSections] = useState({
    basic: true,
    template: !campaignId,
    header: false,
    body: !!campaignId,
    footer: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchLists(currentUser.id);
        if (campaignId) {
          await fetchCampaign(currentUser.id);
        }
      }
      setLoading(false);
    };
    init();
  }, [campaignId]);

  // リスト変更時にヘッダ/フッタをデフォルト適用 & 読者数取得
  useEffect(() => {
    const selectedList = lists.find((l) => l.id === listId);
    if (selectedList && !campaignId) {
      if (selectedList.header_html && !headerHtml) setHeaderHtml(selectedList.header_html);
      if (selectedList.footer_html && !footerHtml) setFooterHtml(selectedList.footer_html);
    }
    // 読者数取得
    if (listId && supabase) {
      supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('list_id', listId)
        .eq('status', 'subscribed')
        .then(({ count }) => {
          setSubscriberCount(count || 0);
        });
    }
  }, [listId, lists]);

  const fetchLists = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/lists?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setLists(data.lists || []);
      if (!listId && data.lists?.length > 0) {
        setListId(data.lists[0].id);
      }
    }
  };

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await fetch('/api/newsletter-maker/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newListName.trim(),
          description: newListDescription.trim() || undefined,
          fromName: newListFromName.trim() || undefined,
          fromEmail: newListFromEmail.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLists((prev) => [data.list, ...prev]);
        setListId(data.list.id);
        setNewListName('');
        setNewListDescription('');
        setNewListFromName('');
        setNewListFromEmail('');
        setShowNewList(false);
      } else {
        const err = await res.json();
        alert(err.error || 'リスト作成に失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました');
    }
    setCreatingList(false);
  };

  const fetchCampaign = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/campaigns/${campaignId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      const c = data.campaign;
      setListId(c.list_id);
      setSubject(c.subject);
      setPreviewText(c.preview_text || '');
      setHtmlContent(c.html_content || '');
      setStatus(c.status);
      setSentCount(c.sent_count || 0);
    }
  };

  // CTAリンクをHTMLに適用（URL + ラベル両方を置換）
  const applyCtaLinks = useCallback((html: string) => {
    if (ctaLinks.length === 0) return html;
    let linkIndex = 0;
    // href="#" を含む <a> タグ全体をマッチし、URLとラベルの両方を置換
    return html.replace(/<a\s([^>]*?)href="#"([^>]*?)>(.*?)<\/a>/g, (_match, before, after, text) => {
      if (linkIndex < ctaLinks.length) {
        const link = ctaLinks[linkIndex];
        linkIndex++;
        const newUrl = link.url || '#';
        const newLabel = link.label || text;
        return `<a ${before}href="${newUrl}"${after}>${newLabel}</a>`;
      }
      linkIndex++;
      return _match;
    });
  }, [ctaLinks]);

  const handleSave = async () => {
    if (!user || !subject || !listId) return;
    setSaving(true);
    const finalHtml = applyCtaLinks(getFullHtml());
    const textContent = htmlToPlainText(finalHtml);
    const body = { userId: user.id, listId, subject, previewText, htmlContent: finalHtml, textContent };
    if (savedCampaignId) {
      await fetch(`/api/newsletter-maker/campaigns/${savedCampaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      const res = await fetch('/api/newsletter-maker/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCampaignId(data.campaign.id);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        window.history.replaceState(null, '', `/newsletter/campaigns/${data.campaign.id}`);
      }
    }
    setSaving(false);
  };

  const handleSendConfirmed = async () => {
    if (!user || !savedCampaignId) return;
    setSending(true);
    // 保存してから送信
    const finalHtml = applyCtaLinks(getFullHtml());
    const textContent = htmlToPlainText(finalHtml);
    await fetch(`/api/newsletter-maker/campaigns/${savedCampaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, listId, subject, previewText, htmlContent: finalHtml, textContent }),
    });

    const res = await fetch(`/api/newsletter-maker/campaigns/${savedCampaignId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatus('sent');
      setSentCount(data.sentCount);
      setShowSendConfirm(false);
      alert(`${data.sentCount}通のメールを送信しました`);
    } else {
      const err = await res.json();
      setShowSendConfirm(false);
      alert(err.error || '送信に失敗しました');
    }
    setSending(false);
  };

  const textToHtml = (text: string) => {
    return text
      .split('\n\n')
      .map((para) => `<p style="margin:0 0 16px 0;line-height:1.8;color:#374151;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  };

  // ヘッダ + 本文 + フッタを結合したHTML
  const getFullHtml = () => {
    const body = htmlContent.startsWith('<') ? htmlContent : textToHtml(htmlContent);
    const parts = [headerHtml, body, footerHtml].filter(Boolean);
    return parts.join('\n');
  };

  // プレースホルダー変数をプレビュー用に置換
  const replacePlaceholders = useCallback((html: string) => {
    const listName = lists.find((l) => l.id === listId)?.name || 'ニュースレター';
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    const result = html
      .replace(/\{\{ニュースレター名\}\}/g, listName)
      .replace(/\{\{送信者名\}\}/g, listName)
      .replace(/\{\{日付\}\}/g, today);
    return applyCtaLinks(result);
  }, [lists, listId, applyCtaLinks]);

  // contentEditable → state 同期（onInput でリアルタイム更新）
  const handleHeaderInput = useCallback(() => {
    if (headerRef.current) setHeaderHtml(headerRef.current.innerHTML);
  }, []);
  const handleBodyInput = useCallback(() => {
    if (bodyRef.current) setHtmlContent(bodyRef.current.innerHTML);
  }, []);
  const handleFooterInput = useCallback(() => {
    if (footerRef.current) setFooterHtml(footerRef.current.innerHTML);
  }, []);

  // ビジュアルモード切替時にrefのinnerHTMLをセット
  useEffect(() => {
    if (headerRef.current && headerViewMode === 'visual' && headerHtml) {
      headerRef.current.innerHTML = headerHtml;
    }
  }, [headerViewMode]);

  useEffect(() => {
    if (bodyRef.current && bodyViewMode === 'visual') {
      bodyRef.current.innerHTML = htmlContent.startsWith('<')
        ? htmlContent
        : textToHtml(htmlContent);
    }
  }, [bodyViewMode]);

  useEffect(() => {
    if (footerRef.current && footerViewMode === 'visual' && footerHtml) {
      footerRef.current.innerHTML = footerHtml;
    }
  }, [footerViewMode]);

  // テンプレート適用（件名候補も設定）
  const applyTemplate = (template: NewsletterTemplate) => {
    if (htmlContent && !confirm('現在の内容をテンプレートで上書きしますか？')) return;
    setHeaderHtml(template.header_html);
    setHtmlContent(template.body_html);
    setFooterHtml(template.footer_html);
    setSubjectSuggestions(template.subject_suggestions || []);
    if (!subject && template.subject_suggestions?.length > 0) {
      setSubject(template.subject_suggestions[0]);
    }
    setOpenSections((prev) => ({ ...prev, template: false, body: true }));
  };

  // AI本文生成
  const handleAiGenerate = async () => {
    if (!user) return;
    setAiGenerating(true);
    setAiResults([]);
    try {
      const res = await fetch('/api/newsletter-maker/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'body',
          purpose: aiPurpose,
          keyword: aiKeyword,
          currentSubject: subject,
          currentContent: htmlContent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.results || []);
        if (!data.results?.length) {
          alert('生成結果が空でした。キーワードを変更してお試しください。');
        }
      } else {
        const err = await res.json();
        alert(err.error || 'AI生成に失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました。しばらくしてからお試しください。');
    }
    setAiGenerating(false);
  };

  const applyAiResult = (result: string) => {
    setHtmlContent(result);
    setShowAiModal(false);
    setAiResults([]);
    setOpenSections((prev) => ({ ...prev, body: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const isSent = status === 'sent';
  const currentListName = lists.find((l) => l.id === listId)?.name || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* エディタヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard?view=newsletter')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {isSent ? 'キャンペーン詳細' : savedCampaignId ? 'キャンペーン編集' : '新しいキャンペーン'}
          </h1>
          {isSent && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              送信済み（{sentCount}通）
            </span>
          )}
        </div>
        {!isSent && (
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-sm text-violet-600 font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />保存しました
              </span>
            )}
            {savedCampaignId && (
              <button
                onClick={() => {
                  // テスト送信前に保存
                  handleSave().then(() => setShowTestSend(true));
                }}
                disabled={saving || !subject || !htmlContent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all shadow-sm min-h-[44px]"
              >
                <SendHorizonal className="w-4 h-4" />
                <span className="hidden sm:inline">テスト送信</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !subject || !listId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
            {savedCampaignId && (
              <button
                onClick={() => setShowSendConfirm(true)}
                disabled={sending || !subject || !htmlContent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                {sending ? '送信中...' : '一斉送信'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[121px] z-30">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mobileTab === 'editor'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Pencil className="w-4 h-4" />編集
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mobileTab === 'preview'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor className="w-4 h-4" />プレビュー
        </button>
      </div>

      {/* 左右パネル */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル: 編集 */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto">
            {/* Section 1: 基本設定 */}
            <Section
              title="基本設定"
              icon={Settings}
              isOpen={openSections.basic}
              onToggle={() => toggleSection('basic')}
              step={1}
              stepLabel="配信先・件名を設定"
              headerBgColor="bg-blue-50"
              headerHoverColor="hover:bg-blue-100"
              accentColor="bg-blue-100 text-blue-600"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">配信先リスト</label>
                  {lists.length > 0 ? (
                    <select
                      value={listId}
                      onChange={(e) => setListId(e.target.value)}
                      disabled={isSent}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    >
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">リストがまだありません。下のボタンから作成してください。</p>
                  )}
                  {subscriberCount > 0 && (
                    <p className="mt-1.5 text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {subscriberCount}人の読者に配信されます
                    </p>
                  )}
                  {!isSent && (
                    <>
                      {/* 読者管理ボタン */}
                      {listId && (
                        <button
                          onClick={() => setShowSubscriberModal(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors min-h-[36px]"
                        >
                          <Users className="w-3.5 h-3.5" />
                          読者管理
                        </button>
                      )}

                      {/* リスト新規作成 */}
                      {showNewList ? (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
                              <Plus className="w-4 h-4" />新しいリストを作成
                            </p>
                            <button
                              onClick={() => { setShowNewList(false); setNewListName(''); setNewListDescription(''); setNewListFromName(''); setNewListFromEmail(''); }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="リスト名 *"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <input
                            type="text"
                            value={newListDescription}
                            onChange={(e) => setNewListDescription(e.target.value)}
                            placeholder="説明（任意・購読フォームに表示）"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={newListFromName}
                              onChange={(e) => setNewListFromName(e.target.value)}
                              placeholder="差出人名（任意）"
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <input
                              type="email"
                              value={newListFromEmail}
                              onChange={(e) => setNewListFromEmail(e.target.value)}
                              placeholder="差出人メール（任意）"
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <button
                            onClick={handleCreateList}
                            disabled={creatingList || !newListName.trim()}
                            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all min-h-[44px] shadow-sm flex items-center justify-center gap-2"
                          >
                            {creatingList ? <><Loader2 className="w-4 h-4 animate-spin" />作成中...</> : <><Plus className="w-4 h-4" />リストを作成</>}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewList(true)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />新しいリストを作成
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">件名 <span className="text-red-500">*</span></label>
                  {subjectSuggestions.length > 0 && !isSent && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1.5">件名候補を選択:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {subjectSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setSubject(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all min-h-[32px] ${
                              subject === s
                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSent}
                    placeholder="メールの件名を入力（テンプレート選択で自動入力されます）"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">プレビューテキスト（任意）</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    disabled={isSent}
                    placeholder="受信トレイに表示される短い説明文"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  />
                </div>
              </div>
            </Section>

            {/* Section 2: テンプレート選択 */}
            {!isSent && (
              <Section
                title="テンプレート"
                icon={LayoutTemplate}
                isOpen={openSections.template}
                onToggle={() => toggleSection('template')}
                badge={`${NEWSLETTER_TEMPLATES.length}種類`}
                step={2}
                stepLabel="テンプレートを選択"
                headerBgColor="bg-amber-50"
                headerHoverColor="hover:bg-amber-100"
                accentColor="bg-amber-100 text-amber-600"
              >
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">テンプレートを選択すると、件名・ヘッダー・本文・フッターが自動設定されます。</p>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">基本テンプレート</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NEWSLETTER_TEMPLATES.filter((t) => t.category === 'basic').map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-3 text-left border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all group"
                        >
                          <span className="text-xl mb-1 block">{template.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">{template.name}</span>
                          <span className="text-xs text-gray-500 block mt-0.5">{template.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">業種別テンプレート</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NEWSLETTER_TEMPLATES.filter((t) => t.category === 'industry').map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-3 text-left border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all group"
                        >
                          <span className="text-xl mb-1 block">{template.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">{template.name}</span>
                          <span className="text-xs text-gray-500 block mt-0.5">{template.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Section 3: ヘッダー */}
            <Section
              title="ヘッダー"
              icon={Type}
              isOpen={openSections.header}
              onToggle={() => toggleSection('header')}
              badge={headerHtml ? '設定済み' : undefined}
              step={3}
              stepLabel="メールヘッダーを編集"
              headerBgColor="bg-emerald-50"
              headerHoverColor="hover:bg-emerald-100"
              accentColor="bg-emerald-100 text-emerald-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">メール冒頭に表示されるヘッダー。</p>
                  <ViewToggle mode={headerViewMode} onChange={setHeaderViewMode} />
                </div>
                {headerViewMode === 'html' ? (
                  <textarea
                    value={headerHtml}
                    onChange={(e) => setHeaderHtml(e.target.value)}
                    disabled={isSent}
                    placeholder="ヘッダーHTML（任意）"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[80px]">
                    {headerHtml ? (
                      <div
                        ref={headerRef}
                        contentEditable={!isSent}
                        suppressContentEditableWarning
                        onInput={handleHeaderInput}
                        className="min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset rounded-xl"
                        dangerouslySetInnerHTML={{ __html: headerHtml }}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-400">ヘッダーが未設定です。テンプレートを選択すると自動設定されます。</p>
                    )}
                  </div>
                )}
              </div>
            </Section>

            {/* Section 4: 本文 */}
            <Section
              title="本文"
              icon={FileText}
              isOpen={openSections.body}
              onToggle={() => toggleSection('body')}
              step={4}
              stepLabel="メール本文を作成"
              headerBgColor="bg-violet-50"
              headerHoverColor="hover:bg-violet-100"
              accentColor="bg-violet-100 text-violet-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-gray-600">メール本文を編集してください。</p>
                  <div className="flex items-center gap-2">
                    {!isSent && (
                      <button
                        onClick={() => setShowAiModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />AIで下書き生成
                      </button>
                    )}
                    <ViewToggle mode={bodyViewMode} onChange={setBodyViewMode} />
                  </div>
                </div>
                {bodyViewMode === 'html' ? (
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    disabled={isSent}
                    placeholder={'メール本文のHTMLを入力してください。\nテンプレートを選択すると自動設定されます。'}
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[200px]">
                    {htmlContent ? (
                      <div
                        ref={bodyRef}
                        contentEditable={!isSent}
                        suppressContentEditableWarning
                        onInput={handleBodyInput}
                        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset rounded-xl"
                        dangerouslySetInnerHTML={{ __html: htmlContent.startsWith('<') ? htmlContent : textToHtml(htmlContent) }}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-400">本文が未入力です。テンプレートを選択するか、HTMLモードで直接入力してください。</p>
                    )}
                  </div>
                )}

                {/* CTAリンク設定 */}
                <div className="bg-violet-50/50 border border-violet-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-violet-500" />
                      ボタンリンク設定（任意）
                    </label>
                    {!isSent && ctaLinks.length === 0 && (
                      <button
                        onClick={() => setCtaLinks([...ctaLinks, { label: '', url: '' }])}
                        className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />リンクを追加
                      </button>
                    )}
                  </div>
                  {ctaLinks.length === 0 && (
                    <p className="text-xs text-gray-500">テンプレートのボタンにURLとラベルを設定できます。</p>
                  )}
                  {ctaLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...ctaLinks];
                          updated[index] = { ...updated[index], label: e.target.value };
                          setCtaLinks(updated);
                        }}
                        disabled={isSent}
                        placeholder="ラベル（例: 詳しくはこちら）"
                        className="w-1/3 px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...ctaLinks];
                          updated[index] = { ...updated[index], url: e.target.value };
                          setCtaLinks(updated);
                        }}
                        disabled={isSent}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      />
                      {!isSent && (
                        <button
                          onClick={() => setCtaLinks(ctaLinks.filter((_, i) => i !== index))}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isSent && ctaLinks.length > 0 && (
                    <button
                      onClick={() => setCtaLinks([...ctaLinks, { label: '', url: '' }])}
                      className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />リンクを追加
                    </button>
                  )}
                </div>
              </div>
            </Section>

            {/* Section 5: フッター */}
            <Section
              title="フッター"
              icon={Paintbrush}
              isOpen={openSections.footer}
              onToggle={() => toggleSection('footer')}
              badge={footerHtml ? '設定済み' : undefined}
              step={5}
              stepLabel="フッターを編集"
              headerBgColor="bg-rose-50"
              headerHoverColor="hover:bg-rose-100"
              accentColor="bg-rose-100 text-rose-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">メール末尾に表示されるフッター。</p>
                  <ViewToggle mode={footerViewMode} onChange={setFooterViewMode} />
                </div>
                {footerViewMode === 'html' ? (
                  <textarea
                    value={footerHtml}
                    onChange={(e) => setFooterHtml(e.target.value)}
                    disabled={isSent}
                    placeholder="フッターHTML（任意）"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[80px]">
                    {footerHtml ? (
                      <div
                        ref={footerRef}
                        contentEditable={!isSent}
                        suppressContentEditableWarning
                        onInput={handleFooterInput}
                        className="min-h-[80px] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-inset rounded-xl"
                        dangerouslySetInnerHTML={{ __html: footerHtml }}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-400">フッターが未設定です。テンプレートを選択すると自動設定されます。</p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[138px] lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          {/* ブラウザ風ヘッダー */}
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium font-mono">メールプレビュー</span>
          </div>
          {/* プレビューコンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* メールヘッダ風 */}
              <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                {subject ? (
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{subject}</h2>
                ) : (
                  <h2 className="text-lg font-bold text-gray-300 mb-1">件名を入力してください</h2>
                )}
                {previewText && (
                  <p className="text-sm text-gray-500">{previewText}</p>
                )}
              </div>
              {/* メール本文 */}
              <div className="p-0">
                {(headerHtml || htmlContent || footerHtml) ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: replacePlaceholders(getFullHtml()) }}
                  />
                ) : (
                  <p className="text-gray-300 text-center py-16">テンプレートを選択すると、ここにプレビューが表示されます</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右パネル用スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>

      {/* 読者管理モーダル */}
      {showSubscriberModal && listId && user && (
        <SubscriberManageModal
          listId={listId}
          userId={user.id}
          onClose={() => setShowSubscriberModal(false)}
          onCountChange={(count) => setSubscriberCount(count)}
        />
      )}

      {/* 送信確認モーダル */}
      {showSendConfirm && (
        <SendConfirmModal
          onConfirm={handleSendConfirmed}
          onCancel={() => setShowSendConfirm(false)}
          sending={sending}
          subscriberCount={subscriberCount}
          subject={subject}
          listName={currentListName}
        />
      )}

      {/* テスト送信モーダル */}
      {showTestSend && savedCampaignId && user && (
        <TestSendModal
          onClose={() => setShowTestSend(false)}
          campaignId={savedCampaignId}
          userId={user.id}
          userEmail={user.email}
        />
      )}

      {/* AI本文生成モーダル */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                AIで本文を生成
              </h2>
              <button
                onClick={() => { setShowAiModal(false); setAiResults([]); }}
                className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">用途とキーワードを入力すると、AIがメール本文のHTMLを生成します。（PROプラン限定）</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">用途</label>
                <select
                  value={aiPurpose}
                  onChange={(e) => setAiPurpose(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value="announcement">お知らせ</option>
                  <option value="sale">セール告知</option>
                  <option value="column">コラム/ブログ</option>
                  <option value="event">イベント案内</option>
                  <option value="welcome">ウェルカムメール</option>
                  <option value="follow_up">フォローアップ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">キーワード・補足情報</label>
                <textarea
                  value={aiKeyword}
                  onChange={(e) => setAiKeyword(e.target.value)}
                  placeholder="例：春のキャンペーン、新サービス開始、料理教室の生徒募集..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="w-full px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px] flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />生成中...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />本文を生成する</>
                )}
              </button>

              {/* AI生成結果 */}
              {aiResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">生成結果（クリックで適用）</p>
                  {aiResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => applyAiResult(result)}
                      className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
                    >
                      <div className="text-sm text-gray-700 line-clamp-4" dangerouslySetInnerHTML={{ __html: result }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
