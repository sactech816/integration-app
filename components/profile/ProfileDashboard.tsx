'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils';
import { 
  UserCircle, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check,
  Calendar 
} from 'lucide-react';

interface ProfileDashboardProps {
  profiles: Profile[];
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
  onView: (profile: Profile) => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  profiles,
  onEdit,
  onDelete,
  onView,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyUrl = (profile: Profile) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/profile/${profile.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ヘッダーブロックから名前を取得
  const getProfileName = (profile: Profile): string => {
    const headerBlock = profile.content?.find(b => b.type === 'header');
    if (headerBlock && headerBlock.type === 'header') {
      return headerBlock.data.name || profile.nickname || `プロフィール ${profile.slug}`;
    }
    return profile.nickname || `プロフィール ${profile.slug}`;
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCircle size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">プロフィールLPがありません</h3>
        <p className="text-gray-600">新しいプロフィールLPを作成しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <div 
          key={profile.id}
          className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserCircle size={24} className="text-emerald-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {getProfileName(profile)}
              </h3>
              <p className="text-sm text-gray-600">/{profile.slug}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {profile.created_at ? getRelativeTime(profile.created_at) : '日付不明'}
                </span>
                <span>{profile.content?.length || 0} ブロック</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onView(profile)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="プレビュー"
              >
                <ExternalLink size={18} />
              </button>
              <button
                onClick={() => handleCopyUrl(profile)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="URLをコピー"
              >
                {copiedId === profile.id ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <button
                onClick={() => onEdit(profile)}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                title="編集"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(profile.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="削除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileDashboard;
