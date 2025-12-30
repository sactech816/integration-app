'use client';

import React from 'react';
import { BusinessLP } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils';
import { 
  Building2, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check,
  Calendar 
} from 'lucide-react';

interface BusinessDashboardProps {
  lps: BusinessLP[];
  onEdit: (lp: BusinessLP) => void;
  onDelete: (id: string) => void;
  onView: (lp: BusinessLP) => void;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  lps,
  onEdit,
  onDelete,
  onView,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyUrl = (lp: BusinessLP) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/business/${lp.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(lp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (lps.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} className="text-amber-400" />
                    </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">ビジネスLPがありません</h3>
        <p className="text-gray-600">新しいビジネスLPを作成しましょう</p>
                </div>
    );
  }

  return (
    <div className="space-y-4">
      {lps.map((lp) => (
        <div 
          key={lp.id}
          className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 size={24} className="text-amber-600" />
                    </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {lp.title || `ビジネスLP ${lp.slug}`}
                                </h3>
              {lp.description && (
                <p className="text-sm text-gray-600 truncate">{lp.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {lp.created_at ? getRelativeTime(lp.created_at) : '日付不明'}
                </span>
                <span>{lp.content?.length || 0} ブロック</span>
                    </div>
                </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                            <button 
                onClick={() => onView(lp)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="プレビュー"
              >
                <ExternalLink size={18} />
                                        </button>
                                        <button
                onClick={() => handleCopyUrl(lp)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="URLをコピー"
              >
                {copiedId === lp.id ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
                                </button>
                                                        <button 
                onClick={() => onEdit(lp)}
                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                title="編集"
              >
                <Edit size={18} />
                                                    </button>
                                                    <button 
                onClick={() => onDelete(lp.id)}
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

export default BusinessDashboard;
