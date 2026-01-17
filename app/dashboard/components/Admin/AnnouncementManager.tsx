'use client';

import React from 'react';
import { Bell, Plus, X } from 'lucide-react';
import Pagination from '../shared/Pagination';

type Announcement = {
  id: number;
  title: string;
  content: string;
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  announcement_date?: string;
  service_type: string;
  created_at: string;
};

type AnnouncementManagerProps = {
  announcements: Announcement[];
  showAnnouncementForm: boolean;
  setShowAnnouncementForm: React.Dispatch<React.SetStateAction<boolean>>;
  editingAnnouncement: Announcement | null;
  setEditingAnnouncement: React.Dispatch<React.SetStateAction<Announcement | null>>;
  announcementForm: {
    title: string;
    content: string;
    link_url: string;
    link_text: string;
    is_active: boolean;
    announcement_date: string;
    service_type: string;
  };
  setAnnouncementForm: React.Dispatch<React.SetStateAction<{
    title: string;
    content: string;
    link_url: string;
    link_text: string;
    is_active: boolean;
    announcement_date: string;
    service_type: string;
  }>>;
  announcementPage: number;
  setAnnouncementPage: React.Dispatch<React.SetStateAction<number>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: number) => Promise<void>;
};

const ANNOUNCEMENTS_PER_PAGE = 5;

export default function AnnouncementManager({
  announcements,
  showAnnouncementForm,
  setShowAnnouncementForm,
  editingAnnouncement,
  setEditingAnnouncement,
  announcementForm,
  setAnnouncementForm,
  announcementPage,
  setAnnouncementPage,
  onSubmit,
  onEdit,
  onDelete,
}: AnnouncementManagerProps) {
  const totalAnnouncementPages = Math.ceil(announcements.length / ANNOUNCEMENTS_PER_PAGE);
  const paginatedAnnouncements = announcements.slice(
    (announcementPage - 1) * ANNOUNCEMENTS_PER_PAGE,
    announcementPage * ANNOUNCEMENTS_PER_PAGE
  );

  const resetForm = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      content: '',
      link_url: '',
      link_text: '',
      is_active: true,
      announcement_date: '',
      service_type: 'all',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-4 flex items-center gap-2">
          <Bell size={20} className="text-red-600" /> お知らせ管理
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
        </h2>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setAnnouncementForm({
              title: '',
              content: '',
              link_url: '',
              link_text: '',
              is_active: true,
              announcement_date: '',
              service_type: 'all',
            });
            setShowAnnouncementForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={16} /> 新規作成
        </button>
      </div>

      {showAnnouncementForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">
              {editingAnnouncement ? 'お知らせを編集' : '新規お知らせを作成'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">タイトル *</label>
              <input
                type="text"
                required
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                placeholder="お知らせのタイトル"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">内容 *</label>
              <textarea
                required
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 h-32"
                placeholder="お知らせの内容"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">リンクURL（オプション）</label>
                <input
                  type="url"
                  value={announcementForm.link_url}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, link_url: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">リンクテキスト（オプション）</label>
                <input
                  type="text"
                  value={announcementForm.link_text}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, link_text: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                  placeholder="詳細はこちら"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">表示日付</label>
                <input
                  type="date"
                  value={announcementForm.announcement_date}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, announcement_date: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">空欄の場合は作成日時が表示されます</p>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={announcementForm.is_active}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
                  表示する
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">サービス区分</label>
              <select
                value={announcementForm.service_type}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, service_type: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
              >
                <option value="all">全サービス共通</option>
                <option value="quiz">診断クイズメーカー専用</option>
                <option value="profile">プロフィールLPメーカー専用</option>
                <option value="business">ビジネスLPメーカー専用</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                どのサービスでお知らせを表示するか選択してください
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingAnnouncement ? '更新する' : '作成する'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">お知らせがありません</div>
        ) : (
          <>
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
              全 {announcements.length} 件
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      タイトル
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      サービス区分
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      状態
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      作成日
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedAnnouncements.map((announcement) => (
                    <tr key={announcement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{announcement.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            announcement.service_type === 'all'
                              ? 'bg-blue-100 text-blue-700'
                              : announcement.service_type === 'quiz'
                              ? 'bg-purple-100 text-purple-700'
                              : announcement.service_type === 'profile'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {announcement.service_type === 'all'
                            ? '全サービス'
                            : announcement.service_type === 'quiz'
                            ? '診断クイズ'
                            : announcement.service_type === 'profile'
                            ? 'プロフィールLP'
                            : 'ビジネスLP'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            announcement.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {announcement.is_active ? '表示中' : '非表示'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {announcement.announcement_date
                          ? new Date(announcement.announcement_date).toLocaleDateString('ja-JP')
                          : new Date(announcement.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(announcement)}
                            className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => onDelete(announcement.id)}
                            className="text-red-600 hover:text-red-700 font-bold text-xs"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={announcementPage}
              totalPages={totalAnnouncementPages}
              onPageChange={setAnnouncementPage}
              label="お知らせ"
            />
          </>
        )}
      </div>
    </div>
  );
}
