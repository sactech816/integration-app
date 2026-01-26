'use client';

import React, { useState } from 'react';
import { Trophy, BarChart2, Table, Lock, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ServiceType } from '@/lib/types';
import { ContentItem } from './ContentCard';

type AnalyticsSectionProps = {
  contents: ContentItem[];
  selectedService: ServiceType;
  isUnlocked?: boolean; // アナリティクス機能がアンロックされているか（有料会員/パートナー/管理者）
  onNavigate?: (path: string) => void; // KDL LPへの遷移用
};

export default function AnalyticsSection({ 
  contents, 
  selectedService, 
  isUnlocked = false,
  onNavigate 
}: AnalyticsSectionProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('table');

  // グラフデータ生成
  const graphData = contents.map((item) => ({
    name: item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title,
    views: item.views_count || 0,
    completions: item.completions_count || 0,
    clicks: item.clicks_count || 0,
  }));

  // ロック状態の表示（診断クイズ以外で無料ユーザーの場合）
  // 診断クイズはテーブルにカウンターがあるので常に表示可能
  const showLockedState = !isUnlocked && selectedService !== 'quiz';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <Trophy size={18} /> アクセス解析
          {showLockedState && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Lock size={10} /> Pro
            </span>
          )}
        </h3>
        {!showLockedState && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('graph')}
              className={`p-1.5 rounded ${
                viewMode === 'graph' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'
              }`}
            >
              <BarChart2 size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${
                viewMode === 'table' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Table size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ロック状態の表示 */}
      {showLockedState ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 max-w-md">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={32} className="text-amber-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">
              詳細アクセス解析
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              プロフィールLP・ビジネスLPの詳細なアクセス解析（閲覧数、クリック率、精読率、滞在時間など）は、有料プランでご利用いただけます。
            </p>
            <button
              onClick={() => onNavigate?.('/#create-section')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm flex items-center gap-2 mx-auto transition-all shadow-md"
            >
              <Sparkles size={16} />
              料金プランを見る
            </button>
          </div>
        </div>
      ) : contents.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          データがありません
        </div>
      ) : viewMode === 'graph' ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                height={50}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" name="閲覧数" fill="#6366f1" radius={[4, 4, 0, 0]} />
              {selectedService === 'quiz' && (
                <>
                  <Bar dataKey="completions" name="完了数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" name="クリック" fill="#10b981" radius={[4, 4, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 bg-gray-50">
                  {selectedService === 'quiz' ? 'タイトル' : 'プロフィール名'}
                </th>
                {selectedService !== 'quiz' && <th className="px-4 py-3 bg-gray-50">SLUG</th>}
                <th className="px-4 py-3 text-right bg-gray-50">アクセス数</th>
                <th className="px-4 py-3 text-right bg-gray-50">クリック数</th>
                <th className="px-4 py-3 text-right bg-gray-50">クリック率</th>
                {selectedService === 'quiz' && (
                  <>
                    <th className="px-4 py-3 text-right bg-gray-50">完了数</th>
                    <th className="px-4 py-3 text-right bg-gray-50">完了率</th>
                  </>
                )}
                {selectedService !== 'quiz' && (
                  <>
                    <th className="px-4 py-3 text-right bg-gray-50">精読率</th>
                    <th className="px-4 py-3 text-right bg-gray-50">滞在時間</th>
                  </>
                )}
                <th className="px-4 py-3 text-right bg-gray-50">作成日</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((item) => {
                const views = item.views_count || 0;
                const completions = item.completions_count || 0;
                const clicks = item.clicks_count || 0;
                const rate = views > 0 ? Math.round((completions / views) * 100) : 0;
                const ctr = views > 0 ? Math.round((clicks / views) * 100) : 0;
                const readRate = item.readRate || 0;
                const avgTime = item.avgTimeSpent || 0;
                const createdAt = item.created_at
                  ? new Date(item.created_at).toLocaleDateString('ja-JP')
                  : '-';

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">
                      {item.title}
                    </td>
                    {selectedService !== 'quiz' && (
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.slug}</td>
                    )}
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{views}</td>
                    <td className="px-4 py-3 text-right">{clicks}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-bold">{ctr}%</td>
                    {selectedService === 'quiz' && (
                      <>
                        <td className="px-4 py-3 text-right">{completions}</td>
                        <td className="px-4 py-3 text-right text-orange-600 font-bold">{rate}%</td>
                      </>
                    )}
                    {selectedService !== 'quiz' && (
                      <>
                        <td className="px-4 py-3 text-right text-orange-600 font-bold">
                          {readRate}%
                        </td>
                        <td className="px-4 py-3 text-right text-purple-600 font-bold">
                          {avgTime > 0 ? `${avgTime}秒` : '-'}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">{createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
