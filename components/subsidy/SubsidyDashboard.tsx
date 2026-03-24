'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileCheck, ExternalLink, Loader2, Trash2, Crown, Plus } from 'lucide-react';
import Link from 'next/link';
import type { SubsidyResult } from '@/lib/subsidy/types';
import { getMatchLabel } from '@/lib/subsidy/scoring';

export default function SubsidyDashboard() {
  const [results, setResults] = useState<SubsidyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) return;

      const { data, error } = await supabase
        .from('subsidy_results')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setResults(data as SubsidyResult[]);
      }
    } catch (e) {
      console.error('Subsidy dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この診断結果を削除しますか？')) return;
    await supabase.from('subsidy_results').delete().eq('id', id);
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck className="text-teal-600" size={22} />
          補助金診断履歴
        </h2>
        <Link
          href="/subsidy"
          className="h-10 px-4 font-semibold text-white bg-teal-600 rounded-xl shadow-md hover:bg-teal-700 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          新規診断
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileCheck className="text-gray-300 mx-auto mb-4" size={48} />
          <p className="text-gray-500 mb-4">まだ診断結果がありません</p>
          <Link
            href="/subsidy"
            className="inline-flex items-center gap-2 h-12 px-6 font-semibold text-white bg-teal-600 rounded-xl shadow-md hover:bg-teal-700 transition-all"
          >
            <FileCheck size={16} />
            補助金を診断する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const topMatch = result.matched_subsidies?.[0];
            const matchLabel = topMatch ? getMatchLabel(topMatch.score) : null;
            const date = new Date(result.created_at).toLocaleDateString('ja-JP');

            return (
              <div
                key={result.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {result.report_purchased && (
                        <Crown className="text-amber-500 shrink-0" size={14} />
                      )}
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {topMatch ? topMatch.name : '診断結果'}
                      </span>
                      {matchLabel && (
                        <span className={`text-xs font-medium ${matchLabel.color}`}>
                          適合度: {matchLabel.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {result.business_info?.industry} / {result.business_info?.employeeCount}人 / {result.business_info?.annualRevenue}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{date}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/subsidy/result/${result.id}`}
                      className="h-8 px-3 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-all flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      詳細
                    </Link>
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
