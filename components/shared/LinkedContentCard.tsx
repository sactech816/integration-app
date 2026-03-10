'use client';

import {
  ExternalLink, X, Copy, Check,
  User, Building2, Megaphone, BookOpen, HelpCircle, Sparkles,
  PenTool, Image, MessageSquare, Calendar, Users, ClipboardList,
  Mail, GitBranch, FileText, Trophy, Link2, Globe,
} from 'lucide-react';
import { useState } from 'react';
import {
  LINKABLE_TOOL_MAP,
  getContentUrl,
  type ContentRef,
  type LinkableContentType,
} from '@/lib/content-links';

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

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50', gradient: 'from-emerald-400 to-teal-500' },
  amber:   { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50', gradient: 'from-amber-400 to-orange-500' },
  purple:  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50', gradient: 'from-purple-400 to-indigo-500' },
  lime:    { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', light: 'bg-lime-50', gradient: 'from-lime-400 to-green-500' },
  indigo:  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50', gradient: 'from-indigo-400 to-purple-500' },
  pink:    { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', light: 'bg-pink-50', gradient: 'from-pink-400 to-rose-500' },
  rose:    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50', gradient: 'from-rose-400 to-pink-500' },
  sky:     { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', light: 'bg-sky-50', gradient: 'from-sky-400 to-blue-500' },
  blue:    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50', gradient: 'from-blue-400 to-indigo-500' },
  orange:  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50', gradient: 'from-orange-400 to-red-500' },
  cyan:    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50', gradient: 'from-cyan-400 to-teal-500' },
  violet:  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50', gradient: 'from-violet-400 to-purple-500' },
  teal:    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50', gradient: 'from-teal-400 to-cyan-500' },
  fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50', gradient: 'from-fuchsia-400 to-pink-500' },
};

function getColors(type: LinkableContentType) {
  const tool = LINKABLE_TOOL_MAP[type];
  return COLOR_MAP[tool?.color || 'indigo'] || COLOR_MAP.indigo;
}

// ================================================================
// LinkedContentCard — リンク済みコンテンツの表示カード
// ================================================================
interface LinkedContentCardProps {
  contentRef: ContentRef;
  /** 削除ボタンを表示するか */
  onRemove?: () => void;
  /** カードサイズ */
  size?: 'sm' | 'md';
}

export default function LinkedContentCard({
  contentRef,
  onRemove,
  size = 'md',
}: LinkedContentCardProps) {
  const [copied, setCopied] = useState(false);

  const tool = LINKABLE_TOOL_MAP[contentRef.type];
  const colors = getColors(contentRef.type);
  const icon = tool ? ICON_MAP[tool.iconName] : <Link2 className="w-4 h-4" />;
  const url = getContentUrl(contentRef);

  const handleCopyUrl = async () => {
    const fullUrl = `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.border} ${colors.light}`}>
        <div className={`w-5 h-5 ${colors.bg} ${colors.text} rounded flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">
          {contentRef.label || contentRef.slug || contentRef.id.slice(0, 8)}
        </span>
        <span className={`text-[10px] font-semibold ${colors.text}`}>
          {tool?.label}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-0.5 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${colors.border} ${colors.light} transition-all`}>
      {/* カラーアイコン */}
      <div className={`w-10 h-10 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>

      {/* テキスト情報 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {contentRef.label || contentRef.slug || contentRef.id.slice(0, 8)}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
            {tool?.label || contentRef.type}
          </span>
          <span className="text-[10px] text-gray-400 truncate">{url}</span>
        </div>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={handleCopyUrl}
          className="p-2 rounded-lg hover:bg-white/80 transition-colors"
          title="URLをコピー"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-white/80 transition-colors"
          title="開く"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="リンクを解除"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}
