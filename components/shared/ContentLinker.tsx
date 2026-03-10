'use client';

import { useState, useMemo } from 'react';
import {
  Link2, Search, X, Loader2, ExternalLink, ChevronDown,
  User, Building2, Megaphone, BookOpen, HelpCircle, Sparkles,
  PenTool, Image, MessageSquare, Calendar, Users, ClipboardList,
  Mail, GitBranch, FileText, Trophy, Globe,
} from 'lucide-react';
import {
  LINKABLE_TOOLS,
  LINKABLE_TOOL_MAP,
  CONTENT_CATEGORIES,
  getContentUrl,
  type LinkableContentType,
  type ContentCategory,
  type ContentRef,
  type UserContentItem,
} from '@/lib/content-links';

// アイコンマップ
const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  PenTool: <PenTool className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  GitBranch: <GitBranch className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Trophy: <Trophy className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
};

// タイプ別カラー
const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  amber:   { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  purple:  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50' },
  lime:    { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', light: 'bg-lime-50' },
  indigo:  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50' },
  pink:    { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', light: 'bg-pink-50' },
  rose:    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50' },
  sky:     { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', light: 'bg-sky-50' },
  blue:    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
  orange:  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  cyan:    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50' },
  violet:  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50' },
  teal:    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50' },
  fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50' },
};

function getColors(type: LinkableContentType) {
  const tool = LINKABLE_TOOL_MAP[type];
  return COLOR_MAP[tool?.color || 'indigo'] || COLOR_MAP.indigo;
}

// ================================================================
// ContentLinker — コンテンツ選択モーダル付きリンカー
// ================================================================
interface ContentLinkerProps {
  /** タイプ別に分けられたコンテンツ */
  contents: Record<string, UserContentItem[]>;
  /** 読み込み中かどうか */
  loading: boolean;
  /** 選択時のコールバック */
  onSelect: (ref: ContentRef) => void;
  /** 複数選択を許可するか */
  multiple?: boolean;
  /** 既に選択済みのリスト（重複防止） */
  selectedIds?: string[];
  /** 表示するカテゴリのフィルタ（省略で全カテゴリ） */
  filterCategories?: ContentCategory[];
  /** 表示するタイプのフィルタ（省略で全タイプ） */
  filterTypes?: LinkableContentType[];
  /** トリガーボタンのラベル */
  buttonLabel?: string;
  /** コンパクトモード（ボタンのみ表示） */
  compact?: boolean;
}

export default function ContentLinker({
  contents,
  loading,
  onSelect,
  multiple = false,
  selectedIds = [],
  filterCategories,
  filterTypes,
  buttonLabel = 'コンテンツをリンク',
  compact = false,
}: ContentLinkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all');

  // 表示するカテゴリを決定
  const visibleCategories = filterCategories
    ? CONTENT_CATEGORIES.filter((c) => filterCategories.includes(c.value))
    : CONTENT_CATEGORIES;

  // フィルタ済みアイテム
  const filteredItems = useMemo(() => {
    const items: UserContentItem[] = [];

    for (const [type, list] of Object.entries(contents)) {
      // タイプフィルタ
      if (filterTypes && !filterTypes.includes(type as LinkableContentType)) continue;

      // カテゴリフィルタ
      if (activeCategory !== 'all') {
        const tool = LINKABLE_TOOL_MAP[type as LinkableContentType];
        if (tool && tool.category !== activeCategory) continue;
      }

      for (const item of list) {
        // 選択済みを除外（multiple=false の場合）
        if (!multiple && selectedIds.includes(item.id)) continue;

        // テキスト検索
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!item.label.toLowerCase().includes(q) && !(item.slug || '').toLowerCase().includes(q)) {
            continue;
          }
        }
        items.push(item);
      }
    }

    return items;
  }, [contents, activeCategory, searchQuery, filterTypes, selectedIds, multiple]);

  const handleSelect = (item: UserContentItem) => {
    const ref: ContentRef = {
      type: item.type,
      id: item.id,
      slug: item.slug,
      label: item.label,
    };
    onSelect(ref);
    if (!multiple) setIsOpen(false);
  };

  // コンテンツが存在するタイプのみカテゴリとして表示
  const hasContentInCategory = (cat: ContentCategory) => {
    return LINKABLE_TOOLS
      .filter((t) => t.category === cat)
      .some((t) => (contents[t.type]?.length || 0) > 0);
  };

  return (
    <>
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 font-semibold transition-all shadow-sm hover:shadow-md ${
          compact
            ? 'px-3 py-2 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            : 'px-4 py-2.5 text-sm rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
        }`}
      >
        <Link2 className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {buttonLabel}
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />

          {/* モーダル本体 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">コンテンツをリンク</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 検索 */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="コンテンツを検索..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* カテゴリタブ */}
            <div className="px-5 py-2 border-b border-gray-100 flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  disabled={!hasContentInCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : hasContentInCategory(cat.value)
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* コンテンツリスト */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  読み込み中...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Link2 className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? '検索結果がありません' : 'リンクできるコンテンツがありません'}
                  </p>
                  <p className="text-xs mt-1">各ツールでコンテンツを作成すると、ここに表示されます</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredItems.map((item) => {
                    const tool = LINKABLE_TOOL_MAP[item.type];
                    const colors = getColors(item.type);
                    const icon = tool ? ICON_MAP[tool.iconName] : null;
                    const isSelected = selectedIds.includes(item.id);

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => handleSelect(item)}
                        disabled={isSelected}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : `border-gray-100 hover:${colors.border} hover:${colors.light} hover:shadow-sm cursor-pointer`
                        }`}
                      >
                        {/* アイコン */}
                        <div className={`w-9 h-9 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {icon || <Link2 className="w-4 h-4" />}
                        </div>

                        {/* テキスト */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                              {tool?.label || item.type}
                            </span>
                            {item.slug && (
                              <span className="text-[10px] text-gray-400 truncate">
                                /{item.slug}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 選択済み表示 or 矢印 */}
                        {isSelected ? (
                          <span className="text-xs text-gray-400 flex-shrink-0">リンク済</span>
                        ) : (
                          <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
