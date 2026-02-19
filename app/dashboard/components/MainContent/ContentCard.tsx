'use client';

import React, { useState } from 'react';
import {
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Play,
  Code,
  Lock,
  Download,
  Heart,
  Loader2,
  MessageCircle,
  Layout,
  Users,
  Sparkles,
  UserCircle,
  Building2,
  FileText,
  PenTool,
  Gamepad2,
  Calendar,
  Image,
} from 'lucide-react';
import { ServiceType, SERVICE_LABELS, Block } from '@/lib/types';

export type ContentItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  type: ServiceType;
  user_id?: string | null;
  views_count?: number;
  completions_count?: number;
  clicks_count?: number;
  layout?: string;
  collect_email?: boolean;
  color?: string;
  image_url?: string;
  content?: Block[];
  settings?: {
    theme?: {
      gradient?: string;
      backgroundImage?: string;
    };
  };
  readRate?: number;
  avgTimeSpent?: number;
  clickRate?: number;
};

type ContentCardProps = {
  item: ContentItem;
  isUnlocked: boolean;
  isAdmin: boolean;
  processingId: string | null;
  copiedId: string | null;
  onEdit: (item: ContentItem) => void;
  onDuplicate: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onView: (item: ContentItem) => void;
  onCopyUrl: (item: ContentItem) => void;
  onEmbed: (item: ContentItem, isUnlocked: boolean) => void;
  onDownloadHtml: (item: ContentItem) => void;
  onPurchase: (item: ContentItem) => void;
};

const getServiceIcon = (type: ServiceType) => {
  const icons: Record<ServiceType, React.ComponentType<{ size?: number; className?: string }>> = {
    quiz: Sparkles,
    profile: UserCircle,
    business: Building2,
    salesletter: PenTool,
    survey: FileText,
    gamification: Gamepad2,
    attendance: Users,
    booking: Calendar,
    onboarding: Sparkles,
    thumbnail: Image,
  };
  return icons[type] || Sparkles; // フォールバック
};

const getServiceColor = (type: ServiceType) => {
  const colors: Record<ServiceType, { bg: string; text: string; border: string; gradient: string }> = {
    quiz: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-purple-600' },
    profile: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-600' },
    business: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-600' },
    salesletter: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-500 to-pink-600' },
    survey: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', gradient: 'from-teal-500 to-cyan-600' },
    gamification: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-pink-600' },
    attendance: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-indigo-600' },
    booking: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-600' },
    onboarding: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-amber-600' },
    thumbnail: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-500 to-rose-600' },
  };
  return colors[type] || colors.quiz; // フォールバック
};

export default function ContentCard({
  item,
  isUnlocked,
  isAdmin,
  processingId,
  copiedId,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onCopyUrl,
  onEmbed,
  onDownloadHtml,
  onPurchase,
}: ContentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const colors = getServiceColor(item.type);
  const Icon = getServiceIcon(item.type);

  // サムネイル用のスタイル
  const thumbnailStyle: React.CSSProperties = {};
  if (item.settings?.theme?.backgroundImage) {
    thumbnailStyle.backgroundImage = `url(${item.settings.theme.backgroundImage})`;
    thumbnailStyle.backgroundSize = 'cover';
    thumbnailStyle.backgroundPosition = 'center';
  } else if (item.settings?.theme?.gradient) {
    thumbnailStyle.background = item.settings.theme.gradient;
  } else if (item.color) {
    thumbnailStyle.backgroundColor = item.color;
  }

  const defaultBgClass = !item.settings?.theme?.gradient && !item.settings?.theme?.backgroundImage && !item.color
    ? `bg-gradient-to-br ${colors.gradient}`
    : '';

  const handleDelete = () => {
    onDelete(item);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
      {/* サムネイル */}
      <div
        className={`h-32 w-full overflow-hidden relative ${defaultBgClass}`}
        style={Object.keys(thumbnailStyle).length > 0 ? thumbnailStyle : undefined}
      >
        {item.image_url && (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        )}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
          {item.type === 'quiz' ? (
            item.layout === 'chat' ? (
              <>
                <MessageCircle size={10} /> Chat
              </>
            ) : (
              <>
                <Layout size={10} /> Card
              </>
            )
          ) : (
            <>
              <Icon size={10} /> {SERVICE_LABELS[item.type]}
            </>
          )}
        </span>
        {item.collect_email && (
          <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
            <Users size={10} /> Leads
          </span>
        )}
      </div>

      {/* コンテンツ情報 */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 text-black">{item.title}</h3>
        <div className="flex gap-4 text-xs text-gray-500 font-bold mb-2">
          <span className="flex items-center gap-1">
            <Play size={12} /> {item.views_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <ExternalLink size={12} /> {item.clicks_count || 0}
          </span>
        </div>

        {/* URL表示とコピー */}
        <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${item.type}/${item.slug}`}
              readOnly
              className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
            />
            <button
              onClick={() => onCopyUrl(item)}
              className="text-indigo-600 hover:text-indigo-700 p-1"
            >
              {copiedId === item.id ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* 編集・複製ボタン */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Edit size={14} /> 編集
          </button>
          <button
            onClick={() => onDuplicate(item)}
            className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Copy size={14} /> 複製
          </button>
        </div>

        {/* 埋め込み・削除ボタン */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onEmbed(item, isUnlocked)}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
              isUnlocked
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUnlocked ? <Code size={14} /> : <Lock size={14} />} 埋め込み
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Trash2 size={14} /> 削除
          </button>
        </div>

        {/* プレビューボタン */}
        <button
          onClick={() => onView(item)}
          className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
        >
          <ExternalLink size={14} /> プレビュー
        </button>

        {/* Pro機能アンロック済み：HTMLダウンロードボタン */}
        {isUnlocked && (
          <button
            onClick={() => onDownloadHtml(item)}
            className="w-full mt-3 bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-indigo-600 flex items-center justify-center gap-1 transition-colors"
          >
            <Download size={14} /> HTMLダウンロード
          </button>
        )}

        {/* 未購入時：開発支援ボタン */}
        {!isUnlocked && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onPurchase(item)}
              disabled={processingId === item.id}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              {processingId === item.id ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Heart size={14} />
              )}
              Pro機能を開放（開発支援）
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              埋め込み機能などが利用可能に
            </p>
          </div>
        )}

        {/* 削除確認 */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-800 mb-3">
              「{item.title}」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs"
              >
                削除する
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
