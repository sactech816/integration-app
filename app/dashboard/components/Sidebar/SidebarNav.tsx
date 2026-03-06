'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  Settings,
  LogOut,
  Users,
  Bell,
  Star,
  LucideIcon,
  Shield,
  Cpu,
  Trash2,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Megaphone,
  Wrench,
  DollarSign,
  LayoutDashboard,
  MessageSquareHeart,
  Share2,
  Gamepad2,
} from 'lucide-react';
import { TOOL_ITEMS, TOOL_CATEGORIES } from './menuItems';

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
    onboarding: number;
    thumbnail: number;
    newsletter: number;
    step_email: number;
    order_form: number;
    funnel: number;
    webinar: number;
    sns_post: number;
    line: number;
  };
  onLogout: () => void;
  // KDLサブスクリプション状態
  hasKdlSubscription?: boolean;
  isKdlMonitor?: boolean;
  // 集客メーカーProプラン
  hasMakersProAccess?: boolean;
};

export default function SidebarNav({
  activeItem,
  onItemClick,
  isAdmin,
  contentCounts,
  onLogout,
  hasKdlSubscription = false,
  isKdlMonitor = false,
  hasMakersProAccess = false,
}: SidebarNavProps) {
  // KDLの状態判定（管理者は常にアクセス可能）
  const kdlDisabled = !hasKdlSubscription && !isAdmin;

  // KDLバッジの表示内容
  const getKdlBadge = () => {
    if (kdlDisabled) return '未加入';
    if (isKdlMonitor) return 'モニター';
    return undefined;
  };

  // コンテンツ数のマッピング
  const countMap: Record<string, number | undefined> = {
    quiz: contentCounts.quiz,
    profile: contentCounts.profile,
    business: contentCounts.business,
    salesletter: contentCounts.salesletter,
    booking: contentCounts.booking,
    attendance: contentCounts.attendance,
    survey: contentCounts.survey,
    'my-games': contentCounts.gamification,
    onboarding: contentCounts.onboarding,
    thumbnail: contentCounts.thumbnail,
    newsletter: contentCounts.newsletter,
    'step-email': contentCounts.step_email,
    'order-form': contentCounts.order_form,
    funnel: contentCounts.funnel,
    webinar: contentCounts.webinar,
    'sns-post': contentCounts.sns_post,
  };

  // ツールアイテムをMenuItemに変換
  const toolMenuItems: MenuItem[] = TOOL_ITEMS.map((tool) => {
    const item: MenuItem = {
      id: tool.id,
      label: tool.label,
      icon: tool.icon,
      section: 'main',
      badge: countMap[tool.id],
    };

    // サムネイルメーカーは全ユーザー利用可能（無料は1回お試し、Proは無制限）

    // 申し込みフォームは全ユーザー利用可能（無料ユーザーは手数料5%、Proは手数料0%）

    // Kindle の課金制限
    if (tool.id === 'kindle') {
      item.isDisabled = kdlDisabled;
      item.disabledBadge = getKdlBadge();
    }

    return item;
  });

  // カテゴリごとにグループ化
  const categoryGroups = useMemo(() => {
    return TOOL_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      items: toolMenuItems.filter((item) => {
        const toolDef = TOOL_ITEMS.find((t) => t.id === item.id);
        return toolDef?.category === cat.id;
      }),
    }));
  }, [toolMenuItems]);

  // 設定メニュー
  const settingsItems: MenuItem[] = [
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
        { id: 'admin-feedbacks', label: 'ご意見箱', icon: MessageSquareHeart, section: 'admin', adminOnly: true },
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

  // カテゴリごとのアイコン色
  const categoryIconColors: Record<string, { normal: string; active: string }> = {
    page: { normal: 'text-indigo-400', active: 'text-indigo-600' },
    quiz: { normal: 'text-emerald-400', active: 'text-emerald-600' },
    writing: { normal: 'text-amber-400', active: 'text-amber-600' },
    marketing: { normal: 'text-cyan-400', active: 'text-cyan-600' },
    monetization: { normal: 'text-purple-400', active: 'text-purple-600' },
  };

  // カテゴリごとのアクティブ時背景・テキスト色
  const categoryActiveStyles: Record<string, string> = {
    page: 'bg-indigo-50 text-indigo-700 font-bold',
    quiz: 'bg-emerald-50 text-emerald-700 font-bold',
    writing: 'bg-amber-50 text-amber-700 font-bold',
    marketing: 'bg-cyan-50 text-cyan-700 font-bold',
    monetization: 'bg-purple-50 text-purple-700 font-bold',
  };

  // カテゴリごとのバッジアクティブ色
  const categoryBadgeStyles: Record<string, string> = {
    page: 'bg-indigo-200 text-indigo-700',
    quiz: 'bg-emerald-200 text-emerald-700',
    writing: 'bg-amber-200 text-amber-700',
    marketing: 'bg-cyan-200 text-cyan-700',
    monetization: 'bg-purple-200 text-purple-700',
  };

  const renderMenuItem = (item: MenuItem, category?: string) => {
    // 管理者専用項目は管理者以外には表示しない
    if (item.adminOnly && !isAdmin) return null;

    const Icon = item.icon;
    const isActive = activeItem === item.id;
    const isDisabled = item.isDisabled;
    // 件数が0のコンテンツ系メニューはグレーアウト（ただしクリックは可能）
    const contentToolIds = ['quiz', 'profile', 'business', 'salesletter', 'booking', 'attendance', 'survey', 'onboarding', 'newsletter'];
    const hasNoContent = item.badge === 0 && contentToolIds.includes(item.id);

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
        return category && categoryActiveStyles[category]
          ? categoryActiveStyles[category]
          : 'bg-indigo-50 text-indigo-700 font-bold';
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
      const colors = category ? categoryIconColors[category] : null;
      if (isActive) {
        return colors?.active || 'text-indigo-600';
      }
      return colors?.normal || 'text-gray-500';
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
        <span className="flex-1 text-xs leading-tight">{item.label}</span>

        {/* ステータスバッジ（KDL未加入・モニターなど） */}
        {item.disabledBadge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            item.disabledBadge === 'モニター'
              ? 'bg-purple-100 text-purple-600'
              : item.disabledBadge === 'Pro'
                ? 'bg-pink-100 text-pink-600'
                : 'bg-gray-200 text-gray-500'
          }`}>
            {item.disabledBadge}
          </span>
        )}

        {/* コンテンツ件数バッジ */}
        {!item.disabledBadge && item.badge !== undefined && item.badge > 0 && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full font-bold
            ${isActive
              ? (category && categoryBadgeStyles[category] ? categoryBadgeStyles[category] : 'bg-indigo-200 text-indigo-700')
              : 'bg-gray-200 text-gray-600'}
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

  // アクティブなアイテムが含まれるカテゴリ/管理グループを特定
  const activeCategoryId = useMemo(() => {
    for (const group of categoryGroups) {
      if (group.items.some(item => item.id === activeItem)) {
        return group.id;
      }
    }
    return null;
  }, [activeItem, categoryGroups]);

  const activeAdminGroupId = useMemo(() => {
    for (const group of adminGroups) {
      if (group.items.some(item => item.id === activeItem)) {
        return group.id;
      }
    }
    return null;
  }, [activeItem, adminGroups]);

  // カテゴリグループ: デフォルトは全展開
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(TOOL_CATEGORIES.map(c => c.id))
  );

  // 管理者グループ
  const [expandedAdminGroups, setExpandedAdminGroups] = useState<Set<string>>(
    new Set(activeAdminGroupId ? [activeAdminGroupId] : [])
  );

  // activeAdminGroupIdが変わったら自動展開
  React.useEffect(() => {
    if (activeAdminGroupId && !expandedAdminGroups.has(activeAdminGroupId)) {
      setExpandedAdminGroups(prev => new Set([...prev, activeAdminGroupId]));
    }
  }, [activeAdminGroupId]);

  // activeCategoryIdが変わったら自動展開
  React.useEffect(() => {
    if (activeCategoryId && !expandedCategories.has(activeCategoryId)) {
      setExpandedCategories(prev => new Set([...prev, activeCategoryId]));
    }
  }, [activeCategoryId]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleAdminGroup = (groupId: string) => {
    setExpandedAdminGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // カテゴリヘッダーのアクティブ時テキスト色
  const categoryHeaderActiveText: Record<string, string> = {
    page: 'text-indigo-700 font-bold',
    quiz: 'text-emerald-700 font-bold',
    writing: 'text-amber-700 font-bold',
    marketing: 'text-cyan-700 font-bold',
    monetization: 'text-purple-700 font-bold',
  };

  const renderCategoryGroup = (group: { id: string; label: string; icon: LucideIcon; items: MenuItem[] }) => {
    const isExpanded = expandedCategories.has(group.id);
    const hasActiveItem = group.items.some(item => item.id === activeItem);
    const GroupIcon = group.icon;
    // カテゴリ内の合計件数
    const totalCount = group.items.reduce((sum, item) => sum + (item.badge || 0), 0);
    const headerActiveStyle = categoryHeaderActiveText[group.id] || 'text-indigo-700 font-bold';
    const headerIconActive = categoryIconColors[group.id]?.active || 'text-indigo-500';
    const headerIconNormal = categoryIconColors[group.id]?.normal || 'text-gray-400';

    return (
      <div key={group.id}>
        <button
          onClick={() => toggleCategory(group.id)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs
            ${hasActiveItem ? headerActiveStyle : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          <GroupIcon size={14} className={hasActiveItem ? headerIconActive : headerIconNormal} />
          <span className="flex-1">{group.label}</span>
          {totalCount > 0 && !isExpanded && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-bold">
              {totalCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronRight size={14} className="text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-3 pl-2 border-l border-gray-200 space-y-0.5 mt-0.5">
            {group.items.map(item => renderMenuItem(item, group.id))}
          </div>
        )}
      </div>
    );
  };

  const renderAdminGroup = (group: AdminMenuGroup) => {
    const isExpanded = expandedAdminGroups.has(group.id);
    const hasActiveItem = group.items.some(item => item.id === activeItem);
    const GroupIcon = group.icon;

    return (
      <div key={group.id}>
        <button
          onClick={() => toggleAdminGroup(group.id)}
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
            {group.items.map(item => renderMenuItem(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-6">
      {/* ダッシュボード・お知らせ */}
      <div>
        <div className="space-y-1">
          {renderMenuItem({ id: 'dashboard', label: 'ダッシュボード', icon: Home, section: 'main' })}
          {renderMenuItem({ id: 'announcements', label: 'お知らせ', icon: Bell, section: 'main' })}
        </div>
      </div>

      {/* メインメニュー（カテゴリ別グループ） */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          ツール
        </h3>
        <div className="space-y-1">
          {categoryGroups.map(renderCategoryGroup)}
        </div>
      </div>

      {/* 設定メニュー */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          設定
        </h3>
        <div className="space-y-1">
          {settingsItems.map(item => renderMenuItem(item))}
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
            {renderMenuItem({ id: 'admin-overview', label: '管理概要', icon: LayoutDashboard, section: 'admin', adminOnly: true })}
            {adminGroups.map(renderAdminGroup)}
          </div>
        </div>
      )}
    </nav>
  );
}
