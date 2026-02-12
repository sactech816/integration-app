'use client';

import React, { useState, useMemo } from 'react';
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
  FileText,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Megaphone,
  Wrench,
  DollarSign,
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

type AdminMenuGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
};

type SidebarNavProps = {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isAdmin: boolean;
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
    salesletter: number;
    booking: number;
    attendance: number;
    survey: number;
    gamification: number;
  };
  onLogout: () => void;
  // KDLサブスクリプション状態
  hasKdlSubscription?: boolean;
  isKdlMonitor?: boolean;
};

export default function SidebarNav({
  activeItem,
  onItemClick,
  isAdmin,
  contentCounts,
  onLogout,
  hasKdlSubscription = false,
  isKdlMonitor = false,
}: SidebarNavProps) {
  // KDLの状態判定（管理者は常にアクセス可能）
  const kdlDisabled = !hasKdlSubscription && !isAdmin;
  
  // KDLバッジの表示内容
  const getKdlBadge = () => {
    if (kdlDisabled) return '未加入';
    if (isKdlMonitor) return 'モニター';
    return undefined;
  };

  const menuItems: MenuItem[] = [
    // メインメニュー
    { id: 'dashboard', label: 'ダッシュボード', icon: Home, section: 'main' },
    { id: 'quiz', label: '診断クイズメーカー', icon: Sparkles, section: 'main', badge: contentCounts.quiz },
    { id: 'profile', label: 'プロフィールメーカー', icon: UserCircle, section: 'main', badge: contentCounts.profile },
    { id: 'business', label: 'LPメーカー', icon: Building2, section: 'main', badge: contentCounts.business },
    { id: 'salesletter', label: 'セールスライター', icon: FileText, section: 'main', badge: contentCounts.salesletter },
    { id: 'booking', label: '予約メーカー', icon: Calendar, section: 'main', badge: contentCounts.booking },
    { id: 'attendance', label: '出欠メーカー', icon: Users, section: 'main', badge: contentCounts.attendance },
    { id: 'survey', label: 'アンケートメーカー', icon: ClipboardList, section: 'main', badge: contentCounts.survey },
    { id: 'my-games', label: 'ゲーミフィケーション', icon: Gamepad2, section: 'main', badge: contentCounts.gamification },
    { 
      id: 'kindle', 
      label: 'Kindle執筆 (KDL)', 
      icon: BookOpen, 
      section: 'main',
      isDisabled: kdlDisabled,
      disabledBadge: getKdlBadge(),
    },
    { id: 'affiliate', label: 'アフィリエイト', icon: Share2, section: 'main' },
    
    // 設定メニュー
    { id: 'settings', label: 'アカウント設定', icon: Settings, section: 'settings' },
    { id: 'logout', label: 'ログアウト', icon: LogOut, section: 'settings', onClick: onLogout },
    
  ];

  // 管理者メニューグループ
  const adminGroups: AdminMenuGroup[] = [
    {
      id: 'group-users',
      label: 'ユーザー管理',
      icon: Users,
      items: [
        { id: 'admin-users', label: 'ユーザー一覧', icon: Users, section: 'admin', adminOnly: true },
        { id: 'admin-monitor', label: 'モニター管理', icon: Shield, section: 'admin', adminOnly: true },
      ],
    },
    {
      id: 'group-content',
      label: 'コンテンツ管理',
      icon: Megaphone,
      items: [
        { id: 'admin-announcements', label: 'お知らせ管理', icon: Bell, section: 'admin', adminOnly: true },
        { id: 'admin-featured', label: 'ピックアップ管理', icon: Star, section: 'admin', adminOnly: true },
        { id: 'admin-gamification', label: 'ゲーミフィケーション', icon: Gamepad2, section: 'admin', adminOnly: true },
      ],
    },
    {
      id: 'group-service',
      label: 'サービス設定',
      icon: Settings,
      items: [
        { id: 'admin-service', label: 'プラン・AI使用量', icon: Settings, section: 'admin', adminOnly: true },
        { id: 'admin-ai-model', label: 'AIモデル・機能制限', icon: Cpu, section: 'admin', adminOnly: true },
      ],
    },
    {
      id: 'group-business',
      label: 'ビジネス管理',
      icon: DollarSign,
      items: [
        { id: 'admin-affiliate', label: 'アフィリエイト管理', icon: Share2, section: 'admin', adminOnly: true },
      ],
    },
    {
      id: 'group-maintenance',
      label: 'メンテナンス',
      icon: Wrench,
      items: [
        { id: 'admin-transfer', label: '所有権の移動', icon: ArrowRightLeft, section: 'admin', adminOnly: true },
        { id: 'admin-cleanup', label: 'データクリーンアップ', icon: Trash2, section: 'admin', adminOnly: true },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    // 管理者専用項目は管理者以外には表示しない
    if (item.adminOnly && !isAdmin) return null;

    const Icon = item.icon;
    const isActive = activeItem === item.id;
    const isDisabled = item.isDisabled;
    // 件数が0のコンテンツ系メニューはグレーアウト（ただしクリックは可能）
    const hasNoContent = item.badge === 0 && ['quiz', 'profile', 'business', 'salesletter', 'booking', 'attendance', 'survey'].includes(item.id);

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
        <span className="flex-1 text-[13px] leading-tight">{item.label}</span>
        
        {/* ステータスバッジ（KDL未加入・モニターなど） */}
        {item.disabledBadge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            item.disabledBadge === 'モニター' 
              ? 'bg-purple-100 text-purple-600' 
              : 'bg-gray-200 text-gray-500'
          }`}>
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

  const renderAdminGroup = (group: AdminMenuGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasActiveItem = group.items.some(item => item.id === activeItem);
    const GroupIcon = group.icon;

    return (
      <div key={group.id}>
        <button
          onClick={() => toggleGroup(group.id)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-[13px]
            ${hasActiveItem ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          <GroupIcon size={14} className={hasActiveItem ? 'text-red-500' : 'text-gray-400'} />
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

      {/* 管理者メニュー（グループ化） */}
      {isAdmin && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            管理者
            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px]">ADMIN</span>
          </h3>
          <div className="space-y-1">
            {adminGroups.map(renderAdminGroup)}
          </div>
        </div>
      )}
    </nav>
  );
}
