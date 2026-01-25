'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BookingMenu, BookingSlotWithAvailability, UpdateBookingMenuInput, CreateBookingSlotInput } from '@/types/booking';
import { 
  getBookingMenu, 
  updateBookingMenu, 
  getAvailableSlots, 
  createBookingSlots,
  deleteBookingSlot,
} from '@/app/actions/booking';
import { LocalSlot } from '@/components/booking/WeeklyCalendar';
import BookingEditor from '@/components/booking/BookingEditor';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';

export default function EditBookingMenuPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const menuId = params.menuId as string;
  const editKey = searchParams.get('key');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [menu, setMenu] = useState<BookingMenu | null>(null);
  const [slots, setSlots] = useState<BookingSlotWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email });
      }

      // メニューデータを取得
      const menuData = await getBookingMenu(menuId);
      if (!menuData) {
        router.push('/booking');
        return;
      }

      // 認証チェック: ユーザーIDまたは編集キー
      const isAuthorized = 
        (user && menuData.user_id === user.id) ||
        (editKey && menuData.edit_key === editKey);

      if (!isAuthorized) {
        alert('このメニューを編集する権限がありません');
        router.push('/booking');
        return;
      }

      setMenu(menuData);

      // 既存の枠データを取得（過去の枠も含める）
      const slotsData = await getAvailableSlots(menuId, {
        includeFullSlots: true, // 満席の枠も含める
        includePastSlots: true, // 過去の枠も含める（編集画面用）
      });
      
      if (slotsData && slotsData.length > 0) {
        setSlots(slotsData);
      }

      setLoading(false);
    };

    loadData();
  }, [router, menuId, editKey]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      router.push('/');
    } else {
      router.push(`/${page}`);
    }
  };

  const handleUpdate = async (
    menuData: UpdateBookingMenuInput,
    newSlots: LocalSlot[],
    deletedSlotIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!menu) {
      return { success: false, error: 'メニューが見つかりません' };
    }

    try {
      // 1. メニュー情報を更新
      const menuResult = await updateBookingMenu(
        menu.id, 
        user?.id || null, 
        menuData, 
        editKey || undefined
      );

      if (!menuResult.success) {
        return { success: false, error: 'error' in menuResult ? menuResult.error : 'メニューの更新に失敗しました' };
      }

      // 2. 削除された枠を削除
      for (const slotId of deletedSlotIds) {
        const deleteResult = await deleteBookingSlot(slotId, user?.id || null, editKey || undefined);
        if (!deleteResult.success) {
          console.error('Failed to delete slot:', slotId);
        }
      }

      // 3. 新規枠を追加
      if (newSlots.length > 0) {
        const slotInputs: CreateBookingSlotInput[] = newSlots.map((slot) => {
          const startTime = new Date(slot.date);
          startTime.setHours(slot.startHour, slot.startMinute, 0, 0);
          
          const endTime = new Date(slot.date);
          endTime.setHours(slot.endHour, slot.endMinute, 0, 0);

          return {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            max_capacity: 1,
          };
        });

        const slotsResult = await createBookingSlots(
          menu.id,
          user?.id || null,
          slotInputs,
          editKey || undefined
        );

        if (!slotsResult.success) {
          return { success: false, error: 'error' in slotsResult ? slotsResult.error : '枠の追加に失敗しました' };
        }
      }

      // 4. 最新の枠データを再取得（過去の枠も含める）
      const updatedSlotsData = await getAvailableSlots(menu.id, {
        includeFullSlots: true,
        includePastSlots: true,
      });
      
      if (updatedSlotsData) {
        setSlots(updatedSlotsData);
      }

      // メニューデータも更新
      if (menuResult.data) {
        setMenu(menuResult.data);
      }

      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: '更新中にエラーが発生しました' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">メニューが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        setUser={setUser}
        onNavigate={navigateTo}
      />

      {/* 戻るリンク */}
      <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
        <Link
          href="/dashboard?view=booking"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          ダッシュボードに戻る
        </Link>
      </div>

      {/* メインコンテンツ: BookingEditor */}
      <main className="flex-1">
        <BookingEditor
          userId={user?.id}
          mode="edit"
          existingMenu={menu}
          existingSlots={slots}
          editKey={editKey}
          onUpdate={handleUpdate}
          setShowAuth={setShowAuth}
        />
      </main>

      <Footer 
        setPage={navigateTo}
        onCreate={(service) => service && navigateTo(`${service}/editor`)}
        user={user}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}
