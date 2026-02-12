'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getAllUsersWithRoles, getAllUsersWithRolesPaginated, setPartnerStatus } from '@/app/actions/purchases';

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

type UseAdminDataReturn = {
  // ユーザー管理
  allUsers: UserWithRoles[];
  loadingUsers: boolean;
  userPage: number;
  setUserPage: React.Dispatch<React.SetStateAction<number>>;
  userTotalCount: number;
  userSearch: string;
  setUserSearch: React.Dispatch<React.SetStateAction<string>>;
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
  fetchAllUsers: () => Promise<void>;
  fetchUsersPage: (page: number, search?: string) => Promise<void>;
  handleTogglePartner: (userId: string, currentStatus: boolean, note?: string) => Promise<void>;
  handleAwardPoints: (userId: string) => Promise<void>;

  // お知らせ管理
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
  fetchAnnouncements: () => Promise<void>;
  handleAnnouncementSubmit: (e: React.FormEvent) => Promise<void>;
  handleEditAnnouncement: (announcement: Announcement) => void;
  handleDeleteAnnouncement: (id: number) => Promise<void>;

  // エクスポート
  exportingCsv: boolean;
  exportingSheets: boolean;
  handleExportCsv: () => Promise<void>;
  handleExportSheets: () => Promise<void>;
};

const USERS_PER_PAGE = 10;

export function useAdminData(isAdmin: boolean): UseAdminDataReturn {
  // ユーザー管理
  const [allUsers, setAllUsers] = useState<UserWithRoles[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [partnerNote, setPartnerNote] = useState('');
  const [awardingPoints, setAwardingPoints] = useState<string | null>(null);
  const [pointsToAward, setPointsToAward] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState<string>('');

  // お知らせ管理
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    link_url: '',
    link_text: '',
    is_active: true,
    announcement_date: '',
    service_type: 'all',
  });
  const [announcementPage, setAnnouncementPage] = useState(1);

  // エクスポート
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingSheets, setExportingSheets] = useState(false);

  // ユーザー一覧を取得
  const fetchAllUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const result = await getAllUsersWithRoles();
      if (result.error) {
        console.error('Fetch users error:', result.error);
        alert('ユーザー一覧の取得に失敗しました: ' + result.error);
      } else {
        // ユーザーごとのポイント残高を取得
        const usersWithPoints = await Promise.all(
          result.users.map(async (user) => {
            try {
              const { data: pointData } = await supabase!.rpc('get_user_point_balance', {
                p_user_id: user.user_id,
                p_session_id: null,
              });

              return {
                ...user,
                current_points: pointData?.[0]?.current_points || 0,
                total_accumulated_points: pointData?.[0]?.total_accumulated_points || 0,
              };
            } catch (error) {
              console.error('Point balance fetch error for user:', user.user_id, error);
              return {
                ...user,
                current_points: 0,
                total_accumulated_points: 0,
              };
            }
          })
        );

        setAllUsers(usersWithPoints);
        setUserPage(1);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      alert('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  // ページネーション対応ユーザー取得（ポイント残高含む）
  const fetchUsersPage = useCallback(async (page: number, search?: string) => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const result = await getAllUsersWithRolesPaginated(page, USERS_PER_PAGE, search);
      if (result.error) {
        console.error('Fetch paginated users error:', result.error);
        alert('ユーザー一覧の取得に失敗しました: ' + result.error);
      } else {
        setAllUsers(result.users);
        setUserTotalCount(result.totalCount);
        setUserPage(page);
      }
    } catch (error) {
      console.error('Fetch paginated users error:', error);
      alert('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  // パートナーステータスを切り替え
  const handleTogglePartner = useCallback(
    async (userId: string, currentStatus: boolean, note: string = '') => {
      if (!isAdmin) return;

      const newStatus = !currentStatus;
      const confirmMessage = newStatus
        ? 'このユーザーを応援パートナーに設定しますか？\n設定すると、このユーザーが作成した全コンテンツでPro機能が利用可能になります。'
        : 'このユーザーの応援パートナー設定を解除しますか？';

      if (!confirm(confirmMessage)) return;

      try {
        const result = await setPartnerStatus(userId, newStatus, note || undefined);
        if (result.success) {
          alert(newStatus ? 'パートナーに設定しました' : 'パートナー設定を解除しました');
          await fetchAllUsers();
          setEditingUserId(null);
          setPartnerNote('');
        } else {
          alert('エラー: ' + (result.error || '不明なエラー'));
        }
      } catch (error) {
        console.error('Toggle partner error:', error);
        alert('パートナー設定の変更に失敗しました');
      }
    },
    [isAdmin, fetchAllUsers]
  );

  // ポイント付与処理
  const handleAwardPoints = useCallback(
    async (userId: string) => {
      if (!supabase || pointsToAward === 0) {
        alert('付与するポイント数を入力してください');
        return;
      }

      if (!confirm(`${pointsToAward}ポイントを付与しますか？`)) return;

      setAwardingPoints(userId);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) throw new Error('認証トークンがありません');

        const response = await fetch('/api/admin/award-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            points: pointsToAward,
            reason: pointsReason || '開発支援への感謝',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'ポイント付与に失敗しました');
        }

        const result = await response.json();
        alert(result.message || 'ポイントを付与しました');

        await fetchAllUsers();

        setAwardingPoints(null);
        setPointsToAward(0);
        setPointsReason('');
      } catch (error) {
        console.error('Award points error:', error);
        alert('ポイント付与エラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
      } finally {
        setAwardingPoints(null);
      }
    },
    [pointsToAward, pointsReason, fetchAllUsers]
  );

  // お知らせを取得
  const fetchAnnouncements = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (e) {
      console.error('お知らせの取得エラー:', e);
    }
  }, [isAdmin]);

  // お知らせ送信
  const handleAnnouncementSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase || !isAdmin) return;

      try {
        const payload = {
          title: announcementForm.title,
          content: announcementForm.content,
          link_url: announcementForm.link_url || null,
          link_text: announcementForm.link_text || null,
          is_active: announcementForm.is_active,
          announcement_date: announcementForm.announcement_date || null,
          service_type: announcementForm.service_type || 'all',
        };

        if (editingAnnouncement) {
          const { error } = await supabase.from('announcements').update(payload).eq('id', editingAnnouncement.id);
          if (error) throw error;
          alert('お知らせを更新しました');
        } else {
          const { error } = await supabase.from('announcements').insert([payload]);
          if (error) throw error;
          alert('お知らせを作成しました');
        }

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
        await fetchAnnouncements();
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '不明なエラー';
        alert('エラー: ' + errorMessage);
      }
    },
    [isAdmin, announcementForm, editingAnnouncement, fetchAnnouncements]
  );

  // お知らせ編集
  const handleEditAnnouncement = useCallback((announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    const displayDate = announcement.announcement_date
      ? new Date(announcement.announcement_date).toISOString().split('T')[0]
      : announcement.created_at
      ? new Date(announcement.created_at).toISOString().split('T')[0]
      : '';
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      link_url: announcement.link_url || '',
      link_text: announcement.link_text || '',
      is_active: announcement.is_active,
      announcement_date: displayDate,
      service_type: announcement.service_type || 'all',
    });
    setShowAnnouncementForm(true);
  }, []);

  // お知らせ削除
  const handleDeleteAnnouncement = useCallback(
    async (id: number) => {
      if (!confirm('本当に削除しますか？')) return;
      if (!supabase || !isAdmin) return;

      try {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        alert('削除しました');
        await fetchAnnouncements();
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '不明なエラー';
        alert('削除エラー: ' + errorMessage);
      }
    },
    [isAdmin, fetchAnnouncements]
  );

  // CSVエクスポート
  const handleExportCsv = useCallback(async () => {
    if (!confirm('全ユーザー情報をCSVでダウンロードしますか？')) return;
    setExportingCsv(true);

    try {
      if (!supabase) throw new Error('Supabaseが設定されていません');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('認証トークンが取得できません');
      }

      const response = await fetch('/api/export-users-csv', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'CSVエクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('CSVファイルをダウンロードしました！');
    } catch (error) {
      console.error('CSV export error:', error);
      alert('CSVエクスポートエラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setExportingCsv(false);
    }
  }, []);

  // Googleスプレッドシートエクスポート
  const handleExportSheets = useCallback(async () => {
    if (!confirm('全ユーザー情報をGoogleスプレッドシートに送信しますか？')) return;
    setExportingSheets(true);

    try {
      if (!supabase) {
        throw new Error('Supabaseが設定されていません');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('認証トークンが取得できません');
      }

      const response = await fetch('/api/export-users-sheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || 'Googleスプレッドシートへの送信に失敗しました');
      }

      const result = await response.json();
      alert(`Googleスプレッドシートに${result.users_count}件のユーザー情報を送信しました！`);
    } catch (error) {
      console.error('Google Sheets export error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      alert('Googleスプレッドシートエクスポートエラー: ' + errorMessage);
    } finally {
      setExportingSheets(false);
    }
  }, []);

  return {
    // ユーザー管理
    allUsers,
    loadingUsers,
    userPage,
    setUserPage,
    userTotalCount,
    userSearch,
    setUserSearch,
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
    fetchAllUsers,
    fetchUsersPage,
    handleTogglePartner,
    handleAwardPoints,

    // お知らせ管理
    announcements,
    showAnnouncementForm,
    setShowAnnouncementForm,
    editingAnnouncement,
    setEditingAnnouncement,
    announcementForm,
    setAnnouncementForm,
    announcementPage,
    setAnnouncementPage,
    fetchAnnouncements,
    handleAnnouncementSubmit,
    handleEditAnnouncement,
    handleDeleteAnnouncement,

    // エクスポート
    exportingCsv,
    exportingSheets,
    handleExportCsv,
    handleExportSheets,
  };
}
