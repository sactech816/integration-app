'use client';

import React from 'react';
import { BusinessLP } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils';
import { getMultipleAnalytics } from '@/app/actions/analytics';
import { 
  Building2, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check,
  Calendar,
  BarChart2,
  Eye,
  MousePointerClick,
  Clock,
  BookOpen
} from 'lucide-react';

interface BusinessDashboardProps {
  lps: BusinessLP[];
  onEdit: (lp: BusinessLP) => void;
  onDelete: (id: string) => void;
  onView: (lp: BusinessLP) => void;
}

interface AnalyticsData {
  views: number;
  clicks: number;
  completions: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  lps,
  onEdit,
  onDelete,
  onView,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [analyticsMap, setAnalyticsMap] = React.useState<Record<string, AnalyticsData>>({});
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(true);

  // アナリティクスデータを取得
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      if (lps.length === 0) {
        setLoadingAnalytics(false);
        return;
      }

      try {
        const slugs = lps.map(lp => lp.slug).filter(Boolean) as string[];
        if (slugs.length === 0) {
          setLoadingAnalytics(false);
          return;
        }

        const results = await getMultipleAnalytics(slugs, 'business');
        
        // slug → analytics のマップを作成
        const map: Record<string, AnalyticsData> = {};
        results.forEach(result => {
          map[result.contentId] = result.analytics;
        });
        
        setAnalyticsMap(map);
      } catch (error) {
        console.error('[BusinessDashboard] Analytics fetch error:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [lps]);

  const handleCopyUrl = (lp: BusinessLP) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/business/${lp.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(lp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 統計サマリーの計算
  const totalViews = Object.values(analyticsMap).reduce((sum, a) => sum + a.views, 0);
  const totalClicks = Object.values(analyticsMap).reduce((sum, a) => sum + a.clicks, 0);
  const avgClickRate = lps.length > 0 
    ? Math.round(Object.values(analyticsMap).reduce((sum, a) => sum + a.clickRate, 0) / lps.length)
    : 0;

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
    <div className="space-y-6">
      {/* アナリティクスサマリー */}
      {!loadingAnalytics && totalViews > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">総アクセス数</p>
                <p className="text-2xl font-bold text-blue-900">{totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <MousePointerClick size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">総クリック数</p>
                <p className="text-2xl font-bold text-green-900">{totalClicks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <BarChart2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium">平均クリック率</p>
                <p className="text-2xl font-bold text-purple-900">{avgClickRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ビジネスLPリスト */}
      <div className="space-y-4">
      {lps.map((lp) => {
        const analytics = analyticsMap[lp.slug] || {
          views: 0,
          clicks: 0,
          completions: 0,
          avgScrollDepth: 0,
          avgTimeSpent: 0,
          readRate: 0,
          clickRate: 0
        };
        const hasAnalytics = analytics.views > 0;

        return (
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

                {/* アナリティクス情報 */}
                {hasAnalytics && !loadingAnalytics && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <div className="flex items-center gap-1 text-blue-600 mb-0.5">
                        <Eye size={12} />
                        <span className="text-[10px] font-medium">アクセス</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">{analytics.views}</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <div className="flex items-center gap-1 text-green-600 mb-0.5">
                        <MousePointerClick size={12} />
                        <span className="text-[10px] font-medium">クリック</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">{analytics.clicks}</p>
                    </div>
                    
                    {analytics.clickRate > 0 && (
                      <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                        <div className="flex items-center gap-1 text-purple-600 mb-0.5">
                          <BarChart2 size={12} />
                          <span className="text-[10px] font-medium">率</span>
                        </div>
                        <p className="text-lg font-bold text-purple-900">{analytics.clickRate}%</p>
                      </div>
                    )}
                    
                    {analytics.readRate > 0 && (
                      <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                        <div className="flex items-center gap-1 text-orange-600 mb-0.5">
                          <BookOpen size={12} />
                          <span className="text-[10px] font-medium">精読率</span>
                        </div>
                        <p className="text-lg font-bold text-orange-900">{analytics.readRate}%</p>
                      </div>
                    )}
                    
                    {analytics.avgTimeSpent > 0 && (
                      <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                        <div className="flex items-center gap-1 text-indigo-600 mb-0.5">
                          <Clock size={12} />
                          <span className="text-[10px] font-medium">滞在</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-900">{analytics.avgTimeSpent}秒</p>
                      </div>
                    )}
                  </div>
                )}
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
        );
      })}
      </div>
    </div>
  );
};

export default BusinessDashboard;
