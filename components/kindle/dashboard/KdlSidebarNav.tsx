'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  Plus,
  Lightbulb,
  BookOpen,
  Rocket,
  GraduationCap,
  Bell,
  Users,
  BarChart3,
  MessageSquare,
  Edit3,
  Settings,
  LogOut,
  Cpu,
  Shield,
  LucideIcon,
  Megaphone,
  DollarSign,
  PieChart,
  UserCog,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Globe,
  Image as ImageIcon,
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

type KdlAdminMenuGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: KdlMenuItem[];
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
      id: 'discovery',
      label: 'ネタ発掘診断',
      icon: Lightbulb,
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    {
      id: 'book-lps',
      label: '書籍LP',
      icon: Globe,
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    {
      id: 'book-covers',
      label: '表紙作成',
      icon: ImageIcon,
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
      id: 'publish-guide', 
      label: '出版準備ガイド', 
      icon: Rocket, 
      section: 'main',
      roles: ['user', 'agency', 'admin'],
    },
    { 
      id: 'guidebook', 
      label: 'ガイドブック', 
      icon: GraduationCap, 
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

  // 管理者メニューグループ
  const adminGroups: KdlAdminMenuGroup[] = [
    {
      id: 'group-users',
      label: 'ユーザー管理',
      icon: Users,
      items: [
        { id: 'admin-users', label: 'ユーザー/購読者一覧', icon: Users, section: 'admin', roles: ['admin'] },
        { id: 'admin-monitors', label: 'モニター管理', icon: UserCog, section: 'admin', roles: ['admin'] },
        { id: 'admin-agency', label: '代理店管理', icon: Shield, section: 'admin', roles: ['admin'] },
      ],
    },
    {
      id: 'group-content',
      label: 'コンテンツ管理',
      icon: Megaphone,
      items: [
        { id: 'admin-announcements', label: 'お知らせ管理', icon: Megaphone, section: 'admin', roles: ['admin'] },
        { id: 'admin-guidebook', label: 'ガイドブック管理', icon: GraduationCap, section: 'admin', roles: ['admin'] },
      ],
    },
    {
      id: 'group-service',
      label: 'サービス設定',
      icon: Settings,
      items: [
        { id: 'admin-service', label: 'プラン・AI使用量', icon: PieChart, section: 'admin', roles: ['admin'] },
        { id: 'admin-ai-model', label: 'AIモデル設定', icon: Cpu, section: 'admin', roles: ['admin'] },
      ],
    },
    {
      id: 'group-business',
      label: 'ビジネス管理',
      icon: DollarSign,
      items: [
        { id: 'admin-affiliate', label: 'アフィリエイト管理', icon: DollarSign, section: 'admin', roles: ['admin'] },
      ],
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
  const settingsItems = filterByRole(menuItems.filter(item => item.section === 'settings'));
  const showAdminGroups = userRole === 'admin';

  // アクティブなアイテムが含まれるグループを特定して自動展開
  const activeGroupId = useMemo(() => {
    for (const group of adminGroups) {
      if (group.items.some(item => item.id === activeItem)) {
        return group.id;
      }
    }
    return null;
  }, [activeItem, adminGroups]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(activeGroupId ? [activeGroupId] : [])
  );

  // activeGroupIdが変わったら自動展開
  React.useEffect(() => {
    if (activeGroupId && !expandedGroups.has(activeGroupId)) {
      setExpandedGroups(prev => new Set([...prev, activeGroupId]));
    }
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const renderAdminGroup = (group: KdlAdminMenuGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasActiveItem = group.items.some(item => item.id === activeItem);
    const GroupIcon = group.icon;

    return (
      <div key={group.id}>
        <button
          onClick={() => toggleGroup(group.id)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm
            ${hasActiveItem ? 'text-purple-600 font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-amber-50'}
          `}
        >
          <GroupIcon size={14} className={hasActiveItem ? 'text-purple-500' : 'text-gray-400'} />
          <span className="flex-1">{group.label}</span>
          {isExpanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronRight size={14} className="text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-3 pl-2 border-l border-gray-200 space-y-0.5 mt-0.5">
            {group.items.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

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

      {/* 管理者メニュー（グループ化） */}
      {showAdminGroups && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            管理者機能
            <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">ADMIN</span>
          </h3>
          <div className="space-y-1">
            {renderMenuItem({ id: 'admin-overview', label: '管理概要', icon: LayoutDashboard, section: 'admin', roles: ['admin'] })}
            {adminGroups.map(renderAdminGroup)}
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
