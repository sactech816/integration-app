'use client';

import React from 'react';
import {
  Home,
  Sparkles,
  UserCircle,
  Building2,
  Calendar,
  ClipboardList,
  Gamepad2,
  BookOpen,
  Share2,
  Settings,
  LogOut,
  Users,
  Bell,
  Star,
  LucideIcon,
  Shield,
  Cpu,
  Trash2,
} from 'lucide-react';

export type MenuSection = 'main' | 'settings' | 'admin';
export type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  section: MenuSection;
  badge?: number;
  adminOnly?: boolean;
  onClick?: () => void;
  href?: string;
  // グレーアウト関連
  isDisabled?: boolean;
  disabledBadge?: string;
};

type SidebarNavProps = {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isAdmin: boolean;
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
    booking: number;
    survey: number;
    gamification: number;
  };
  onLogout: () => void;
  // KDLサブスクリプション状態
  hasKdlSubscription?: boolean;
};

export default function SidebarNav({
  activeItem,
  onItemClick,
  isAdmin,
  contentCounts,
  onLogout,
  hasKdlSubscription = false,
}: SidebarNavProps) {
  // KDLの状態判定（管理者は常にアクセス可能）
  const kdlDisabled = !hasKdlSubscription && !isAdmin;

  const menuItems: MenuItem[] = [
    // メインメニュー
    { id: 'dashboard', label: 'ダッシュボード', icon: Home, section: 'main' },
    { id: 'quiz', label: '診断クイズ', icon: Sparkles, section: 'main', badge: contentCounts.quiz },
    { id: 'profile', label: 'プロフィールLP', icon: UserCircle, section: 'main', badge: contentCounts.profile },
    { id: 'business', label: 'ビジネスLP', icon: Building2, section: 'main', badge: contentCounts.business },
    { id: 'booking', label: '予約・日程調整', icon: Calendar, section: 'main', badge: contentCounts.booking },
    { id: 'survey', label: 'アンケート（投票）', icon: ClipboardList, section: 'main', badge: contentCounts.survey },
    { id: 'my-games', label: 'ゲーム作成', icon: Gamepad2, section: 'main', badge: contentCounts.gamification },
    { 
      id: 'kindle', 
      label: 'Kindle執筆 (KDL)', 
      icon: BookOpen, 
      section: 'main',
      isDisabled: kdlDisabled,
      disabledBadge: kdlDisabled ? '未加入' : undefined,
    },
    { id: 'affiliate', label: 'アフィリエイト', icon: Share2, section: 'main' },
    
    // 設定メニュー
    { id: 'settings', label: 'アカウント設定', icon: Settings, section: 'settings' },
    { id: 'logout', label: 'ログアウト', icon: LogOut, section: 'settings', onClick: onLogout },
    
    // 管理者メニュー
    { id: 'admin-users', label: 'ユーザー管理', icon: Users, section: 'admin', adminOnly: true },
    { id: 'admin-announcements', label: 'お知らせ管理', icon: Bell, section: 'admin', adminOnly: true },
    { id: 'admin-monitor', label: 'モニター管理', icon: Shield, section: 'admin', adminOnly: true },
    { id: 'admin-service', label: 'サービス管理', icon: Settings, section: 'admin', adminOnly: true },
    { id: 'admin-ai-model', label: 'AIモデル選択', icon: Cpu, section: 'admin', adminOnly: true },
    { id: 'admin-affiliate', label: 'アフィリエイト管理', icon: Share2, section: 'admin', adminOnly: true },
    { id: 'admin-featured', label: 'ピックアップ管理', icon: Star, section: 'admin', adminOnly: true },
    { id: 'admin-gamification', label: 'ゲーミフィケーション管理', icon: Gamepad2, section: 'admin', adminOnly: true },
    { id: 'admin-cleanup', label: 'データクリーンアップ', icon: Trash2, section: 'admin', adminOnly: true },
  ];

  const renderMenuItem = (item: MenuItem) => {
    // 管理者専用項目は管理者以外には表示しない
    if (item.adminOnly && !isAdmin) return null;

    const Icon = item.icon;
    const isActive = activeItem === item.id;
    const isDisabled = item.isDisabled;
    // 件数が0のコンテンツ系メニューはグレーアウト（ただしクリックは可能）
    const hasNoContent = item.badge === 0 && ['quiz', 'profile', 'business', 'booking', 'survey'].includes(item.id);

    const handleClick = () => {
      if (item.onClick) {
        item.onClick();
      } else {
        onItemClick(item.id);
      }
    };

    // グレーアウト状態のスタイル
    const getButtonStyles = () => {
      if (isDisabled) {
        return 'text-gray-400 cursor-pointer hover:bg-gray-50 opacity-60';
      }
      if (isActive) {
        return 'bg-indigo-50 text-indigo-700 font-bold';
      }
      if (hasNoContent) {
        return 'text-gray-400 hover:bg-gray-100';
      }
      return 'text-gray-700 hover:bg-gray-100';
    };

    const getIconStyles = () => {
      if (isDisabled || hasNoContent) {
        return 'text-gray-300';
      }
      if (isActive) {
        return 'text-indigo-600';
      }
      return 'text-gray-500';
    };

    return (
      <button
        key={item.id}
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
          ${getButtonStyles()}
        `}
      >
        <Icon size={18} className={getIconStyles()} />
        <span className="flex-1 text-sm">{item.label}</span>
        
        {/* 無効化バッジ（KDL未加入など） */}
        {item.disabledBadge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-bold">
            {item.disabledBadge}
          </span>
        )}
        
        {/* コンテンツ件数バッジ */}
        {!item.disabledBadge && item.badge !== undefined && item.badge > 0 && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full font-bold
            ${isActive ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'}
          `}>
            {item.badge}
          </span>
        )}
        {!item.disabledBadge && item.badge === 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-bold">
            0
          </span>
        )}
      </button>
    );
  };

  const mainItems = menuItems.filter(item => item.section === 'main');
  const settingsItems = menuItems.filter(item => item.section === 'settings');
  const adminItems = menuItems.filter(item => item.section === 'admin');

  return (
    <nav className="flex-1 px-3 py-4 space-y-6">
      {/* メインメニュー */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          メイン
        </h3>
        <div className="space-y-1">
          {mainItems.map(renderMenuItem)}
        </div>
      </div>

      {/* 設定メニュー */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          設定
        </h3>
        <div className="space-y-1">
          {settingsItems.map(renderMenuItem)}
        </div>
      </div>

      {/* 管理者メニュー */}
      {isAdmin && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            管理者
            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px]">ADMIN</span>
          </h3>
          <div className="space-y-1">
            {adminItems.map(renderMenuItem)}
          </div>
        </div>
      )}
    </nav>
  );
}
