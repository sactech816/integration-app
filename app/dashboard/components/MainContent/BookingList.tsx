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
  Users,
  Settings,
  CalendarDays,
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
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          予約・日程調整
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/booking/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={16} /> 新規作成
          </button>
          <button
            onClick={() => router.push('/booking/dashboard')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center gap-2"
          >
            <Settings size={16} /> 詳細管理
          </button>
        </div>
      </div>

      {/* メニュー一覧 */}
      {menus.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだ予約メニューを作成していません</p>
          <button
            onClick={() => router.push('/booking/new')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700"
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
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                <div className="flex items-center justify-between">
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
              <div className="p-4">
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

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/booking/edit/${menu.id}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit size={14} /> 編集
                  </button>
                  <button
                    onClick={() => window.open(`/booking/${menu.id}`, '_blank')}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink size={14} /> プレビュー
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 詳細管理への案内 */}
      {menus.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>💡 ヒント:</strong> 予約の確認・キャンセル、日程調整の出欠管理は
            <button
              onClick={() => router.push('/booking/dashboard')}
              className="underline font-bold hover:text-blue-800 ml-1"
            >
              詳細管理画面
            </button>
            で行えます。
          </p>
        </div>
      )}
    </div>
  );
}
