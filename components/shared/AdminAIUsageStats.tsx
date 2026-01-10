'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Cpu, 
  DollarSign, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Zap,
  FileText,
  Edit3,
  RefreshCw
} from 'lucide-react';

// モデル別使用統計の型
interface ModelUsageStats {
  gemini: number;
  openai: number;
  claude: number;
  unknown: number;
}

// アクション別使用統計の型
interface ActionUsageStats {
  generate_title: number;
  generate_toc: number;
  generate_chapters: number;
  generate_section: number;
  rewrite: number;
  other: number;
}

// モデル別コスト統計の型
interface ModelCostStats {
  gemini: number;
  openai: number;
  claude: number;
}

// 詳細使用統計の型
interface DetailedUsageStats {
  byModel: ModelUsageStats;
  byAction: ActionUsageStats;
  byModelCost: ModelCostStats;
  actionModelBreakdown: Record<string, ModelUsageStats>;
}

// 全体統計の型
interface GlobalStats {
  modelUsageStats: ModelUsageStats;
  actionUsageStats: ActionUsageStats;
  modelCostStats: ModelCostStats;
}

interface AdminAIUsageStatsProps {
  stats: GlobalStats;
}

// プロバイダーの表示設定
const PROVIDER_CONFIG = {
  gemini: {
    name: 'Gemini',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  openai: {
    name: 'OpenAI',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  claude: {
    name: 'Claude',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
};

// アクションタイプの表示設定
const ACTION_CONFIG: Record<string, { name: string; icon: React.ReactNode }> = {
  generate_title: { name: 'タイトル', icon: <FileText size={14} /> },
  generate_toc: { name: '目次', icon: <BarChart3 size={14} /> },
  generate_chapters: { name: '目次', icon: <BarChart3 size={14} /> },
  generate_section: { name: '執筆', icon: <Edit3 size={14} /> },
  rewrite: { name: '書き直し', icon: <RefreshCw size={14} /> },
  other: { name: 'その他', icon: <Sparkles size={14} /> },
};

export default function AdminAIUsageStats({ stats }: AdminAIUsageStatsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalUsage = 
    (stats.modelUsageStats?.gemini || 0) + 
    (stats.modelUsageStats?.openai || 0) + 
    (stats.modelUsageStats?.claude || 0);

  const totalCost = 
    (stats.modelCostStats?.gemini || 0) + 
    (stats.modelCostStats?.openai || 0) + 
    (stats.modelCostStats?.claude || 0);

  // 使用割合を計算
  const getPercentage = (value: number) => {
    if (totalUsage === 0) return 0;
    return Math.round((value / totalUsage) * 100);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Cpu size={20} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">AIモデル使用状況（今月）</h3>
            <p className="text-sm text-gray-500">
              総使用回数: {totalUsage}回 / 推定コスト: ¥{totalCost.toLocaleString()}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      {/* コンテンツ */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* プロバイダー別統計 */}
          <div>
            <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              プロバイダー別使用回数
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['gemini', 'openai', 'claude'] as const).map((provider) => {
                const config = PROVIDER_CONFIG[provider];
                const count = stats.modelUsageStats?.[provider] || 0;
                const cost = stats.modelCostStats?.[provider] || 0;
                const percentage = getPercentage(count);

                return (
                  <div
                    key={provider}
                    className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold ${config.textColor}`}>
                        {config.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.color} text-white`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mb-1">
                      {count.toLocaleString()}回
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign size={14} />
                      <span>¥{cost.toLocaleString()}</span>
                    </div>
                    {/* プログレスバー */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${config.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* アクション別統計 */}
          <div>
            <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" />
              アクション別使用回数
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(ACTION_CONFIG).map(([key, config]) => {
                // generate_tocとgenerate_chaptersは合算
                let count = 0;
                if (key === 'generate_toc') {
                  count = (stats.actionUsageStats?.generate_toc || 0) + 
                          (stats.actionUsageStats?.generate_chapters || 0);
                } else if (key === 'generate_chapters') {
                  return null; // generate_tocに合算済みなのでスキップ
                } else {
                  count = stats.actionUsageStats?.[key as keyof ActionUsageStats] || 0;
                }

                return (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                      {config.icon}
                      <span className="text-xs font-medium">{config.name}</span>
                    </div>
                    <div className="text-lg font-black text-gray-900">
                      {count.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* コスト内訳 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
              <DollarSign size={16} />
              コスト内訳（今月）
            </h4>
            <div className="flex flex-wrap gap-4">
              {(['gemini', 'openai', 'claude'] as const).map((provider) => {
                const config = PROVIDER_CONFIG[provider];
                const cost = stats.modelCostStats?.[provider] || 0;
                const costPercentage = totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0;

                return (
                  <div key={provider} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-sm text-gray-700">
                      {config.name}: <span className="font-bold">¥{cost.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">({costPercentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ユーザー別詳細統計コンポーネント（テーブル行の展開用）
interface UserAIUsageDetailProps {
  detailedStats: DetailedUsageStats;
}

export function UserAIUsageDetail({ detailedStats }: UserAIUsageDetailProps) {
  if (!detailedStats) {
    return <span className="text-gray-400 text-xs">データなし</span>;
  }

  const { byModel, byAction, actionModelBreakdown } = detailedStats;

  return (
    <div className="bg-gray-50 rounded-lg p-3 mt-2 text-xs space-y-2">
      {/* モデル別サマリー */}
      <div className="flex flex-wrap gap-2">
        {(['gemini', 'openai', 'claude'] as const).map((provider) => {
          const count = byModel?.[provider] || 0;
          if (count === 0) return null;
          const config = PROVIDER_CONFIG[provider];
          return (
            <span
              key={provider}
              className={`${config.bgColor} ${config.textColor} px-2 py-0.5 rounded-full font-medium`}
            >
              {config.name}: {count}
            </span>
          );
        })}
      </div>

      {/* アクション×モデル内訳 */}
      <div className="space-y-1">
        {Object.entries(actionModelBreakdown || {}).map(([action, models]) => {
          const actionConfig = ACTION_CONFIG[action] || ACTION_CONFIG.other;
          const modelEntries = Object.entries(models as ModelUsageStats)
            .filter(([key, count]) => count > 0 && key !== 'unknown');
          
          if (modelEntries.length === 0) return null;

          return (
            <div key={action} className="flex items-center gap-2 text-gray-600">
              <span className="flex items-center gap-1">
                {actionConfig.icon}
                {actionConfig.name}:
              </span>
              {modelEntries.map(([provider, count]) => {
                const config = PROVIDER_CONFIG[provider as keyof typeof PROVIDER_CONFIG];
                if (!config) return null;
                return (
                  <span key={provider} className={`${config.textColor} font-medium`}>
                    {config.name}({count})
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// モデル内訳ボタンコンポーネント
interface ModelBreakdownButtonProps {
  detailedStats: DetailedUsageStats;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ModelBreakdownButton({ 
  detailedStats, 
  isExpanded, 
  onToggle 
}: ModelBreakdownButtonProps) {
  if (!detailedStats) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  const { byModel } = detailedStats;
  const hasData = (byModel?.gemini || 0) + (byModel?.openai || 0) + (byModel?.claude || 0) > 0;

  if (!hasData) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
    >
      詳細
      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  );
}

