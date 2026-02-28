'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, AlertCircle, ExternalLink, Loader2, LinkIcon,
} from 'lucide-react';

interface ConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  stripeAccountId?: string;
  platformFeePercent: number;
}

export default function StripeConnectStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/stripe-connect/status?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch Stripe Connect status:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleOnboarding = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/stripe-connect/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (e) {
      console.error('Onboarding error:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDashboard = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/stripe-connect/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error('Dashboard link error:', e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // 未接続
  if (!status?.connected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 mb-1">Stripe アカウント未接続</p>
            <p className="text-xs text-blue-700 mb-3">
              Stripeアカウントを接続すると、決済の売上があなたに直接入金されます（手数料{status?.platformFeePercent || 5}%）。
            </p>
            <button
              onClick={handleOnboarding}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all min-h-[44px]"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
              Stripeアカウントを接続
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 接続済みだが未完了
  if (!status.chargesEnabled || !status.detailsSubmitted) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 mb-1">Stripe 接続を完了してください</p>
            <p className="text-xs text-amber-700 mb-3">
              アカウント情報の入力が完了していません。決済を受け付けるには設定を完了してください。
            </p>
            <button
              onClick={handleOnboarding}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 shadow-md transition-all min-h-[44px]"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              設定を続ける
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 接続完了
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800 mb-1">Stripe 接続済み</p>
          <p className="text-xs text-green-700 mb-3">
            決済の売上はあなたのStripeアカウントに直接入金されます（手数料{status.platformFeePercent}%）。
          </p>
          <button
            onClick={handleDashboard}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-green-300 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50 disabled:opacity-50 shadow-sm transition-all min-h-[44px]"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Stripe ダッシュボード
          </button>
        </div>
      </div>
    </div>
  );
}
