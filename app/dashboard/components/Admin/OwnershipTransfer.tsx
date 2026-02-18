'use client';

import { useState } from 'react';
import { ArrowRightLeft, Loader2, Search, AlertCircle, CheckCircle, Link, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// URLパスからコンテンツタイプを判定するパターン
const URL_PATH_PATTERNS = [
  { pattern: /\/profile\/([^/?#]+)/, label: 'プロフィール', icon: '👤' },
  { pattern: /\/s\/([^/?#]+)/, label: 'セールスレター/LP', icon: '📝' },
  { pattern: /\/quiz\/([^/?#]+)/, label: 'クイズ', icon: '❓' },
  { pattern: /\/survey\/([^/?#]+)/, label: 'アンケート', icon: '📊' },
  { pattern: /\/business\/([^/?#]+)/, label: 'ビジネスLP', icon: '🏢' },
  { pattern: /\/gacha\/([^/?#]+)/, label: 'ガチャ/スタンプ', icon: '🎮' },
  { pattern: /\/stamp-rally\/([^/?#]+)/, label: 'ガチャ/スタンプ', icon: '🎮' },
  { pattern: /\/stamp\/([^/?#]+)/, label: 'ガチャ/スタンプ', icon: '🎮' },
];

function detectContentTypeFromUrl(url: string): { label: string; icon: string; slug: string } | null {
  for (const { pattern, label, icon } of URL_PATH_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return { label, icon, slug: match[1] };
    }
  }
  return null;
}

type ContentInfo = {
  id: string;
  title?: string;
  slug?: string;
  nickname?: string;
  settings?: { title?: string };
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
  // 状態管理
  const [contentUrl, setContentUrl] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [contentInfo, setContentInfo] = useState<ContentInfo | null>(null);
  const [currentOwner, setCurrentOwner] = useState<OwnerInfo | null>(null);
  const [detectedType, setDetectedType] = useState<{ label: string; icon: string } | null>(null);
  const [contentTypeId, setContentTypeId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState(false);

  // URLの変更でリアルタイムにタイプ検出
  const handleUrlChange = (url: string) => {
    setContentUrl(url);
    setError(null);
    const detected = detectContentTypeFromUrl(url);
    setDetectedType(detected ? { label: detected.label, icon: detected.icon } : null);
    // URLが変わったらコンテンツ情報をリセット
    if (contentInfo) {
      setContentInfo(null);
      setCurrentOwner(null);
      setFromEmail('');
    }
  };

  // 移動先メールのサジェスト
  const toEmailSuggestions = toEmail && !confirmMode
    ? allUsers.filter((u) =>
        u.email.toLowerCase().includes(toEmail.toLowerCase()) &&
        u.email.toLowerCase() !== currentOwner?.email?.toLowerCase()
      ).slice(0, 5)
    : [];
  const [toEmailSelected, setToEmailSelected] = useState(false);

  // コンテンツ情報を取得
  const fetchContentInfo = async () => {
    if (!contentUrl.trim()) {
      setError('コンテンツのURLを入力してください');
      return;
    }

    const detected = detectContentTypeFromUrl(contentUrl);
    if (!detected) {
      setError('対応していないURLです。profile, s, quiz, survey, business, gacha, stamp のURLを入力してください。');
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
        `/api/admin/transfer-ownership?contentUrl=${encodeURIComponent(contentUrl)}`,
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
      setContentTypeId(data.contentTypeId);
      // 現在の所有者メールを自動セット
      if (data.currentOwner?.email) {
        setFromEmail(data.currentOwner.email);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('コンテンツの取得に失敗しました');
    } finally {
      setSearching(false);
    }
  };

  // 所有権を移動
  const transferOwnership = async () => {
    if (!contentInfo || !toEmail.trim()) {
      setError('移動先のメールアドレスを入力してください');
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
          contentType: contentTypeId,
          contentId: contentInfo.id,
          newOwnerEmail: toEmail.trim(),
          fromEmail: fromEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || '所有権の移動に失敗しました');
        return;
      }

      setSuccess(`所有権を ${toEmail} に移動しました`);
      setCurrentOwner({ id: data.newOwner.id, email: data.newOwner.email });
      setFromEmail(data.newOwner.email);
      setConfirmMode(false);
      setToEmail('');
      setToEmailSelected(false);
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
    if (content.settings?.title) return content.settings.title;
    if (content.nickname) return content.nickname;
    if (content.slug) return content.slug;
    return content.id;
  };

  // リセット
  const handleReset = () => {
    setContentInfo(null);
    setCurrentOwner(null);
    setContentUrl('');
    setFromEmail('');
    setToEmail('');
    setToEmailSelected(false);
    setDetectedType(null);
    setContentTypeId('');
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
          コンテンツURLとメールアドレスで所有者を変更します
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ステップ1: コンテンツURL入力 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <Link size={14} />
            1. コンテンツのURLを入力
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="例: https://makers.tokyo/profile/iyf2Q"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {/* 検出されたタイプ表示 */}
              {detectedType && !contentInfo && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {detectedType.icon} {detectedType.label}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={fetchContentInfo}
              disabled={searching || !contentUrl.trim() || !detectedType}
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
          <p className="text-xs text-gray-400 mt-1">
            対応: /profile/, /s/, /quiz/, /survey/, /business/, /gacha/, /stamp/, /stamp-rally/
          </p>
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
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              {detectedType && <span>{detectedType.icon}</span>}
              コンテンツ情報
              {detectedType && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {detectedType.label}
                </span>
              )}
            </h3>
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

        {/* ステップ2: メールアドレス入力 */}
        {contentInfo && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <Mail size={14} />
              2. 移動元・移動先のメールアドレスを入力
            </label>

            <div className="flex items-center gap-3">
              {/* 移動元メール */}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">移動元（現在の所有者）</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="移動元のメールアドレス"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <ArrowRight size={20} className="text-gray-400 flex-shrink-0 mt-5" />

              {/* 移動先メール */}
              <div className="flex-1 relative">
                <label className="block text-xs text-gray-500 mb-1">移動先（新しい所有者）</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => {
                    setToEmail(e.target.value);
                    setToEmailSelected(false);
                  }}
                  placeholder="移動先のメールアドレス"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {/* サジェスト */}
                {toEmailSuggestions.length > 0 && !toEmailSelected && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {toEmailSuggestions.map((user) => (
                      <button
                        key={user.user_id}
                        onClick={() => {
                          setToEmail(user.email);
                          setToEmailSelected(true);
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
            </div>
          </div>
        )}

        {/* 確認と実行 */}
        {contentInfo && toEmail.trim() && fromEmail.trim() && (
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
                <p className="font-bold text-amber-800 mb-2">確認</p>
                <div className="text-sm text-amber-700 mb-4 space-y-1">
                  <p>
                    <span className="text-amber-600">コンテンツ:</span>{' '}
                    <span className="font-bold">{getContentDisplayName(contentInfo)}</span>
                    {detectedType && <span className="ml-1 text-xs">({detectedType.label})</span>}
                  </p>
                  <p>
                    <span className="text-amber-600">移動元:</span>{' '}
                    <span className="font-bold">{fromEmail}</span>
                  </p>
                  <p>
                    <span className="text-amber-600">移動先:</span>{' '}
                    <span className="font-bold">{toEmail}</span>
                  </p>
                  <p className="text-xs text-amber-500 mt-2">この操作は取り消せません。</p>
                </div>
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
