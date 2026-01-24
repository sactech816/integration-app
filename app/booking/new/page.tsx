'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreateBookingMenuInput, CreateBookingSlotInput } from '@/types/booking';
import { createBookingMenu, createBookingSlots } from '@/app/actions/booking';
import { LocalSlot } from '@/components/booking/WeeklyCalendar';
import BookingEditor from '@/components/booking/BookingEditor';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';

export default function NewBookingMenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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

  // 保存処理
  const handleSave = async (
    menuData: CreateBookingMenuInput,
    localSlots: LocalSlot[]
  ): Promise<{ success: boolean; menuId?: string; editKey?: string; error?: string }> => {
    try {
      // 1. メニューを作成
      const menuResult = await createBookingMenu(user?.id || null, menuData);
      
      if (!menuResult.success || !menuResult.data) {
        return { 
          success: false, 
          error: 'error' in menuResult ? menuResult.error : 'メニューの作成に失敗しました' 
        };
      }

      const menu = menuResult.data;

      // 2. 編集キーをローカルストレージに保存（非ログインユーザーの場合）
      if (!user && menu.edit_key) {
        const editKeys = JSON.parse(localStorage.getItem('booking_edit_keys') || '[]');
        editKeys.push({ 
          menuId: menu.id, 
          editKey: menu.edit_key, 
          createdAt: new Date().toISOString() 
        });
        localStorage.setItem('booking_edit_keys', JSON.stringify(editKeys));
      }

      // 3. 予約枠を作成
      if (localSlots.length > 0) {
        const slotsInput: CreateBookingSlotInput[] = localSlots.map((slot) => {
          const startTime = new Date(slot.date);
          startTime.setHours(slot.startHour, slot.startMinute, 0, 0);
          
          const endTime = new Date(slot.date);
          endTime.setHours(slot.endHour, slot.endMinute, 0, 0);
          
          return {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            max_capacity: 1, // デフォルト値
          };
        });

        const slotsResult = await createBookingSlots(
          menu.id, 
          user?.id || null, 
          slotsInput, 
          menu.edit_key || undefined
        );

        if (!slotsResult.success) {
          console.error('Slots creation failed:', slotsResult);
          // 枠の作成に失敗してもメニューは作成済みなので、成功として返す
        }
      }

      return {
        success: true,
        menuId: menu.id,
        editKey: menu.edit_key || undefined,
      };
    } catch (err) {
      console.error('Save error:', err);
      return { success: false, error: '保存中にエラーが発生しました' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          onSave={handleSave}
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
