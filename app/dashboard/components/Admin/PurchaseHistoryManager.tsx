'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Receipt, Loader2, RefreshCw, User, UserX, ChevronLeft, ChevronRight, Database, CreditCard } from 'lucide-react';

type PurchaseRecord = {
  id: string;
  type: 'feature_purchase' | 'bigfive_pdf' | 'fortune_report' | 'point_purchase' | 'order_form' | 'subscription' | 'donation';
  purchasedAt: string;
  amount: number;
  productName: string;
  userId: string | null;
  userEmail: string | null;
  status: string;
  metadata?: Record<string, unknown>;
};

type Summary = {
  totalAmount: number;
  totalCount: number;
  anonymousCount: number;
};

type FilterType = 'all' | 'feature_purchase' | 'bigfive_pdf' | 'fortune_report' | 'point_purchase' | 'order_form' | 'subscription' | 'donation';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  feature_purchase: { label: '単品購入', color: 'bg-purple-100 text-purple-700' },
  bigfive_pdf: { label: 'BigFive PDF', color: 'bg-indigo-100 text-indigo-700' },
  fortune_report: { label: '占いレポート', color: 'bg-pink-100 text-pink-700' },
  point_purchase: { label: 'ポイント購入', color: 'bg-amber-100 text-amber-700' },
  order_form: { label: '申込フォーム', color: 'bg-emerald-100 text-emerald-700' },
  subscription: { label: 'サブスク', color: 'bg-blue-100 text-blue-700' },
  donation: { label: '応援/寄付', color: 'bg-orange-100 text-orange-700' },
  unknown: { label: '不明', color: 'bg-gray-100 text-gray-500' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: '有効', color: 'bg-green-100 text-green-700' },
  paid: { label: '支払済', color: 'bg-green-100 text-green-700' },
  canceled: { label: 'キャンセル', color: 'bg-gray-100 text-gray-500' },
  expired: { label: '期限切れ', color: 'bg-gray-100 text-gray-500' },
  consumed: { label: '使用済み', color: 'bg-blue-100 text-blue-700' },
  refunded: { label: '返金済み', color: 'bg-red-100 text-red-700' },
  payment_failed: { label: '支払失敗', color: 'bg-red-100 text-red-700' },
};

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'feature_purchase', label: '単品購入' },
  { value: 'bigfive_pdf', label: 'BigFive PDF' },
  { value: 'fortune_report', label: '占いレポート' },
  { value: 'point_purchase', label: 'ポイント購入' },
  { value: 'order_form', label: '申込フォーム' },
  { value: 'subscription', label: 'サブスク' },
  { value: 'donation', label: '応援/寄付' },
];

type DataSource = 'db' | 'stripe';

const ITEMS_PER_PAGE = 20;

export default function PurchaseHistoryManager() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalAmount: 0, totalCount: 0, anonymousCount: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dataSource, setDataSource] = useState<DataSource>('stripe');

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchPurchases = useCallback(async (p: number, type: FilterType, source: DataSource) => {
    setLoading(true);
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) return;

      const params = new URLSearchParams({
        page: p.toString(),
        perPage: ITEMS_PER_PAGE.toString(),
        type,
        source,
      });

      const response = await fetch(`/api/admin/purchase-history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setPurchases(data.purchases || []);
      setTotalCount(data.totalCount || 0);
      setSummary(data.summary || { totalAmount: 0, totalCount: 0, anonymousCount: 0 });
    } catch (error) {
      console.error('Purchase history fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases(page, filterType, dataSource);
  }, [page, filterType, dataSource, fetchPurchases]);

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    setPage(1);
  };

  const handleSourceChange = (source: DataSource) => {
    setDataSource(source);
    setPage(1);
    setFilterType('all');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt size={20} className="text-emerald-600" />
            購入履歴
            <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* データソース切替 */}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => handleSourceChange('stripe')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${
                  dataSource === 'stripe'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={12} />
                Stripe
              </button>
              <button
                onClick={() => handleSourceChange('db')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${
                  dataSource === 'db'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Database size={12} />
                DB
              </button>
            </div>
            <button
              onClick={() => fetchPurchases(page, filterType, dataSource)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              更新
            </button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <div className="text-[10px] text-gray-500 font-bold uppercase">総売上額</div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">
            ¥{summary.totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <div className="text-[10px] text-gray-500 font-bold uppercase">総件数</div>
          <div className="text-lg font-bold text-gray-900 mt-0.5">
            {summary.totalCount.toLocaleString()}件
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <div className="text-[10px] text-gray-500 font-bold uppercase">匿名購入</div>
          <div className="text-lg font-bold text-orange-600 mt-0.5">
            {summary.anonymousCount.toLocaleString()}件
          </div>
        </div>
      </div>

      {/* タイプフィルター / Stripe説明 */}
      <div className="px-6 py-3 border-b border-gray-200">
        {dataSource === 'stripe' ? (
          <div className="flex items-center gap-2 text-xs text-indigo-600">
            <CreditCard size={14} />
            <span className="font-bold">Stripe直接取得</span>
            <span className="text-gray-500">— DB記録がなくても全決済が表示されます（直近100件）</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                  filterType === opt.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* テーブル */}
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="text-gray-500">購入履歴を読み込み中...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Receipt size={48} className="mx-auto mb-3 text-gray-300" />
          <p>購入履歴がありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">日時</th>
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">種別</th>
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">商品名</th>
                <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">金額</th>
                <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">ユーザー</th>
                <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((record) => {
                const typeConf = TYPE_CONFIG[record.type] || { label: record.type, color: 'bg-gray-100 text-gray-700' };
                const statusConf = STATUS_LABELS[record.status] || { label: record.status, color: 'bg-gray-100 text-gray-500' };

                return (
                  <tr key={`${record.type}-${record.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(record.purchasedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeConf.color}`}>
                        {typeConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {record.productName}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                      ¥{record.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {record.userEmail ? (
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-gray-400 shrink-0" />
                          <span className="text-gray-700 text-xs truncate max-w-[180px]">
                            {record.userEmail}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <UserX size={12} className="text-orange-400 shrink-0" />
                          <span className="text-orange-500 text-xs font-bold">匿名</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors shadow-sm ${
              page === 1 || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <ChevronLeft size={14} />
            前へ
          </button>
          <span className="text-gray-700 text-sm">
            <span className="font-bold text-emerald-600">{page}</span> / {totalPages} ページ
            <span className="text-gray-500 ml-2">(全{totalCount}件)</span>
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors shadow-sm ${
              page === totalPages || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            次へ
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
