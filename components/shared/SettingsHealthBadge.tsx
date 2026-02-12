'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type HealthStatus = 'ok' | 'warning' | 'error' | 'loading';

type CheckResult = {
  status: HealthStatus;
  message: string;
  details?: string[];
};

type HealthData = {
  checks: {
    aiModels: CheckResult;
    planSettings: CheckResult;
    monitors: CheckResult;
  };
  checkedAt: string;
};

interface SettingsHealthBadgeProps {
  service?: string;
}

export default function SettingsHealthBadge({ service = 'kdl' }: SettingsHealthBadgeProps) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/admin/settings-health?service=${service}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [service]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <Loader2 size={14} className="animate-spin" />
        <span>チェック中...</span>
      </div>
    );
  }

  if (!data) return null;

  const checks = Object.entries(data.checks) as [string, CheckResult][];
  const overallStatus = checks.some(([, c]) => c.status === 'error')
    ? 'error'
    : checks.some(([, c]) => c.status === 'warning')
      ? 'warning'
      : 'ok';

  const statusConfig = {
    ok: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: '正常' },
    warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '要確認' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'エラー' },
  };

  const labelMap: Record<string, string> = {
    aiModels: 'AIモデル設定',
    planSettings: 'プラン設定',
    monitors: 'モニター',
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3"
      >
        <StatusIcon size={16} className={config.color} />
        <span className={`text-sm font-bold ${config.color}`}>設定ステータス: {config.label}</span>
        <span className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); fetchHealth(); }}
          className="text-gray-400 hover:text-gray-600"
          title="再チェック"
        >
          <RefreshCw size={14} />
        </button>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {checks.map(([key, check]) => {
            const itemConfig = statusConfig[check.status as keyof typeof statusConfig] || statusConfig.ok;
            const ItemIcon = itemConfig.icon;

            return (
              <div key={key} className="bg-white rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2">
                  <ItemIcon size={14} className={itemConfig.color} />
                  <span className="text-xs font-bold text-gray-700">{labelMap[key] || key}</span>
                  <span className="text-xs text-gray-500 flex-1">{check.message}</span>
                </div>
                {check.details && check.details.length > 0 && (
                  <div className="mt-1.5 ml-5 space-y-0.5">
                    {check.details.map((detail, i) => (
                      <div key={i} className="text-[11px] text-gray-500">{detail}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="text-[10px] text-gray-400 text-right">
            最終チェック: {new Date(data.checkedAt).toLocaleString('ja-JP')}
          </div>
        </div>
      )}
    </div>
  );
}
