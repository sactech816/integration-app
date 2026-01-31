'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Clock,
  CalendarDays,
  Trash2,
  Code,
  Lock,
  Heart,
} from 'lucide-react';
import { BookingMenu } from '@/types/booking';
import { getBookingMenus } from '@/app/actions/booking';

type BookingListProps = {
  userId: string;
  isAdmin: boolean;
};

export default function BookingList({ userId, isAdmin }: BookingListProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<BookingMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      try {
        const data = await getBookingMenus(userId);
        setMenus(data);
      } catch (error) {
        console.error('予約メニュー取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadMenus();
    }
  }, [userId]);

  const handleCopyUrl = (menuId: string) => {
    const url = `${window.location.origin}/booking/${menuId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(menuId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (menuId: string) => {
    // TODO: 削除APIを実装
    setDeletingId(menuId);
    try {
      // 現在は削除機能未実装のためメッセージを表示
      alert('削除機能は現在準備中です');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (menu: BookingMenu) => {
    // TODO: 複製APIを実装
    alert('複製機能は現在準備中です');
  };

  const getMenuTypeLabel = (type: string) => {
    return type === 'adjustment' ? '日程調整' : '予約受付';
  };

  const getMenuTypeColor = (type: string) => {
    return type === 'adjustment'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          予約メーカー
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <button
          onClick={() => router.push('/booking/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} /> 新規作成
        </button>
      </div>

      {/* メニュー一覧 */}
      {menus.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだ予約メニューを作成していません</p>
          <button
            onClick={() => router.push('/booking/new')}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700"
          >
            新規作成する
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* カードヘッダー */}
              <div className={`h-32 ${menu.type === 'adjustment' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                <div className="p-4 flex items-start justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${getMenuTypeColor(menu.type)}`}>
                    {getMenuTypeLabel(menu.type)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {menu.is_active ? '公開中' : '非公開'}
                  </span>
                </div>
              </div>

              {/* カードコンテンツ */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{menu.title}</h3>
                {menu.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{menu.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {menu.duration_min}分
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {menu.created_at ? new Date(menu.created_at).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>

                {/* URL表示とコピー */}
                <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${menu.id}`}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(menu.id)}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                    >
                      {copiedId === menu.id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 編集・複製ボタン */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => router.push(`/booking/edit/${menu.id}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit size={14} /> 編集
                  </button>
                  <button
                    onClick={() => handleDuplicate(menu)}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Copy size={14} /> 複製
                  </button>
                </div>

                {/* 埋め込み・削除ボタン */}
                <div className="flex gap-2 mb-3">
                  <button
                    className="flex-1 bg-gray-100 text-gray-400 cursor-not-allowed py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    disabled
                  >
                    <Lock size={14} /> 埋め込み
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(menu.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 size={14} /> 削除
                  </button>
                </div>

                {/* プレビューボタン */}
                <button
                  onClick={() => window.open(`/booking/${menu.id}`, '_blank')}
                  className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
                >
                  <ExternalLink size={14} /> プレビュー
                </button>

                {/* Pro機能アンロック */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <Heart size={14} />
                    Pro機能を開放（開発支援）
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
                    埋め込み機能などが利用可能に
                  </p>
                </div>

                {/* 削除確認 */}
                {showDeleteConfirm === menu.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-800 mb-3">
                      「{menu.title}」を削除しますか？この操作は取り消せません。
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(menu.id)}
                        disabled={deletingId === menu.id}
                        className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50"
                      >
                        {deletingId === menu.id ? (
                          <Loader2 size={14} className="animate-spin mx-auto" />
                        ) : (
                          '削除する'
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
