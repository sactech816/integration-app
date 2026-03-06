'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface LineAddFriendButtonProps {
  ownerId: string;
  sourceType: string;
  sourceId?: string;
}

interface LineAccountInfo {
  bot_basic_id: string | null;
  display_name: string | null;
  friend_add_message: string | null;
}

/**
 * 汎用LINE友だち追加ボタン
 * 各ツールの結果ページに1行追加するだけで使える:
 * <LineAddFriendButton ownerId="xxx" sourceType="quiz" sourceId="yyy" />
 *
 * - ownerIdのユーザーがLINE連携していなければ何も表示しない
 * - 連携済みの場合、友だち追加ボタンを表示
 */
export default function LineAddFriendButton({
  ownerId, sourceType, sourceId
}: LineAddFriendButtonProps) {
  const [accountInfo, setAccountInfo] = useState<LineAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch(`/api/line/account?userId=${ownerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.account?.is_active && data.account?.bot_basic_id) {
            setAccountInfo({
              bot_basic_id: data.account.bot_basic_id,
              display_name: data.account.display_name,
              friend_add_message: data.account.friend_add_message,
            });
          }
        }
      } catch {
        // LINE連携情報が取得できない場合は何も表示しない
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchAccount();
    } else {
      setLoading(false);
    }
  }, [ownerId]);

  // ローディング中 or LINE未連携の場合は何も表示しない
  if (loading || !accountInfo?.bot_basic_id) return null;

  // LINE友だち追加URL
  const lineAddUrl = `https://line.me/R/ti/p/${accountInfo.bot_basic_id}`;

  return (
    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-green-800">
            {accountInfo.display_name || 'LINE公式アカウント'}
          </p>
          {accountInfo.friend_add_message && (
            <p className="text-sm text-green-700">{accountInfo.friend_add_message}</p>
          )}
        </div>
      </div>
      <a
        href={lineAddUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#06C755] text-white rounded-xl font-bold text-base hover:bg-[#05b74d] transition-all shadow-md"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.82 1.5 5.32 3.84 6.96L5 22l4.48-2.42c.82.16 1.66.24 2.52.24 5.52 0 10-3.82 10-8.5S17.52 2 12 2zm0 15.5c-.74 0-1.47-.08-2.18-.24l-.46-.1-2.82 1.52.5-2.84-.38-.3C5.26 14.38 4 12.52 4 10.5 4 6.92 7.58 4 12 4s8 2.92 8 6.5-3.58 6.5-8 6.5z"/>
        </svg>
        LINE友だち追加
      </a>
    </div>
  );
}
