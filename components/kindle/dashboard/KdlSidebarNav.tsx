'use client';

import React from 'react';
import {
  Home,
  Plus,
  BookOpen,
  FileText,
  Rocket,
  GraduationCap,
  Bell,
  Users,
  BarChart3,
  MessageSquare,
  Edit3,
  Settings,
  LogOut,
  CreditCard,
  Cpu,
  Shield,
  LucideIcon,
} from 'lucide-react';

export type KdlUserRole = 'user' | 'agency' | 'admin';
export type KdlMenuSection = 'main' | 'agency' | 'admin' | 'settings';

export type KdlMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  section: KdlMenuSection;
  badge?: number;
  roles: KdlUserRole[]; // このメニューを表示するロール
  onClick?: () => void;
};

type KdlSidebarNavProps = {
  userRole: KdlUserRole;
  activeItem: string;
  onItemClick: (itemId: string) => void;
  onLogout: () => void;
  bookCount?: number;
  assignedUserCount?: number;
};

export default function KdlSidebarNav({
  userRole,
  activeItem,
  onItemClick,
  onLogout,
  bookCount = 0,
  assignedUserCount = 0,
}: KdlSidebarNavProps) {
  const menuItems: KdlMenuItem[] = [
    // ユーザー向けメニュー（全員表示）
    { 
      id: 'dashboard', 
      label: 'ダッシュボード', 
      icon: Home, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'new-book', 
      label: '新規作成', 
      icon: Plus, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'my-books', 
      label: 'マイブック', 
      icon: BookOpen, 
      section: 'main',
      badge: bookCount,
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'guide', 
      label: 'ガイド・マニュアル', 
      icon: FileText, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'education', 
      label: '教育コンテンツ', 
      icon: GraduationCap, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'publish-guide', 
      label: '出版準備ガイド', 
      icon: Rocket, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'announcements', 
      label: 'お知らせ', 
      icon: Bell, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },

    // 代理店向けメニュー
    { 
      id: 'agency-users', 
      label: '担当ユーザー一覧', 
      icon: Users, 
      section: 'agency',
      badge: assignedUserCount,
      roles: ['agency', 'admin'],
    },
    { 
      id: 'agency-progress', 
      label: '進捗管理', 
      icon: BarChart3, 
      section: 'agency',
      roles: ['agency', 'admin'],
    },
    { 
      id: 'agency-feedback', 
      label: '添削・フィードバック', 
      icon: Edit3, 
      section: 'agency',
      roles: ['agency', 'admin'],
    },
    { 
      id: 'agency-messages', 
      label: 'メッセージ', 
      icon: MessageSquare, 
      section: 'agency',
      roles: ['agency', 'admin'],
    },

    // 管理者向けメニュー
    { 
      id: 'admin-users', 
      label: '全ユーザー管理', 
      icon: Users, 
      section: 'admin',
      roles: ['admin'],
    },
    { 
      id: 'admin-agencies', 
      label: '代理店管理', 
      icon: Shield, 
      section: 'admin',
      roles: ['admin'],
    },
    { 
      id: 'admin-subscriptions', 
      label: 'サブスクリプション管理', 
      icon: CreditCard, 
      section: 'admin',
      roles: ['admin'],
    },
    { 
      id: 'admin-ai-settings', 
      label: 'AI設定', 
      icon: Cpu, 
      section: 'admin',
      roles: ['admin'],
    },
    { 
      id: 'admin-system', 
      label: 'システム設定', 
      icon: Settings, 
      section: 'admin',
      roles: ['admin'],
    },

    // 設定メニュー（全員表示）
    { 
      id: 'settings', 
      label: 'アカウント設定', 
      icon: Settings, 
      section: 'settings',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'logout', 
      label: 'ログアウト', 
      icon: LogOut, 
      section: 'settings',
      roles: ['user', 'agency', 'admin'],
      onClick: onLogout,
    },
  ];

  // ロールに基づいてメニュー項目をフィルタリング
  const filterByRole = (items: KdlMenuItem[]) => {
    return items.filter(item => item.roles.includes(userRole));
  };

  const renderMenuItem = (item: KdlMenuItem) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;

    const handleClick = () => {
      if (item.onClick) {
        item.onClick();
      } else {
        onItemClick(item.id);
      }
    };

    return (
      <button
        key={item.id}
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
          ${isActive 
            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-bold' 
            : 'text-gray-700 hover:bg-amber-50'
          }
        `}
      >
        <Icon 
          size={18} 
          className={isActive ? 'text-amber-600' : 'text-gray-500'} 
        />
        <span className="flex-1 text-sm">{item.label}</span>
        
        {/* バッジ */}
        {item.badge !== undefined && item.badge > 0 && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full font-bold
            ${isActive ? 'bg-amber-200 text-amber-700' : 'bg-gray-200 text-gray-600'}
          `}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const mainItems = filterByRole(menuItems.filter(item => item.section === 'main'));
  const agencyItems = filterByRole(menuItems.filter(item => item.section === 'agency'));
  const adminItems = filterByRole(menuItems.filter(item => item.section === 'admin'));
  const settingsItems = filterByRole(menuItems.filter(item => item.section === 'settings'));

  return (
    <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
      {/* メインメニュー */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          メイン
        </h3>
        <div className="space-y-1">
          {mainItems.map(renderMenuItem)}
        </div>
      </div>

      {/* 代理店メニュー */}
      {agencyItems.length > 0 && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            代理店機能
            <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">AGENCY</span>
          </h3>
          <div className="space-y-1">
            {agencyItems.map(renderMenuItem)}
          </div>
        </div>
      )}

      {/* 管理者メニュー */}
      {adminItems.length > 0 && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            管理者機能
            <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">ADMIN</span>
          </h3>
          <div className="space-y-1">
            {adminItems.map(renderMenuItem)}
          </div>
        </div>
      )}

      {/* 設定メニュー */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          設定
        </h3>
        <div className="space-y-1">
          {settingsItems.map(renderMenuItem)}
        </div>
      </div>
    </nav>
  );
}
