'use client';

import React from 'react';
import { Crown, ArrowRight, Calendar, Target, Sparkles, Map } from 'lucide-react';
import { MasterReport, MONETIZE_FIELD_LABELS, MonetizeField } from '../types';

interface MasterReportSectionProps {
  report: MasterReport;
}

const FIELD_COLORS: Record<string, string> = {
  'Kindle出版': 'bg-violet-100 text-violet-700 border-violet-200',
  'オンライン講座': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'コンサル・コーチング': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'SNS発信': 'bg-pink-100 text-pink-700 border-pink-200',
  'デジタル商品': 'bg-amber-100 text-amber-700 border-amber-200',
};

const getFieldColor = (field: string) => {
  return FIELD_COLORS[field] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const MasterReportSection: React.FC<MasterReportSectionProps> = ({ report }) => {
  return (
    <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 rounded-2xl border-2 border-violet-200 shadow-lg p-6 mb-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">総括レポート</h2>
          <p className="text-xs text-gray-500">収益化ロードマップ・分野連携戦略</p>
        </div>
      </div>

      {/* エグゼクティブサマリー */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="font-bold text-gray-900 text-sm">エグゼクティブサマリー</h3>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{report.executiveSummary}</p>
      </div>

      {/* 推奨実行順序 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-4 h-4 text-violet-600" />
          <h3 className="font-bold text-gray-900 text-sm">推奨実行順序</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {report.recommendedOrder.map((field, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${getFieldColor(field)}`}>
                {i + 1}. {field}
              </span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-sm text-gray-600">{report.orderReason}</p>
      </div>

      {/* 分野間連携マップ */}
      {report.synergyMap && report.synergyMap.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-gray-900 text-sm">分野間連携戦略</h3>
          </div>
          <div className="space-y-3">
            {report.synergyMap.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getFieldColor(item.from)}`}>
                    {item.from}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getFieldColor(item.to)}`}>
                    {item.to}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 30日アクションプラン */}
      {report.thirtyDayPlan && report.thirtyDayPlan.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-gray-900 text-sm">30日アクションプラン</h3>
          </div>
          <div className="space-y-3">
            {report.thirtyDayPlan.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-16 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg px-2 py-1.5 text-center flex-shrink-0">
                  {step.week}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{step.action}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${getFieldColor(step.field)}`}>
                    {step.field}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 90日マイルストーン + 1年ビジョン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.ninetyDayMilestones && report.ninetyDayMilestones.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">90日マイルストーン</h3>
            <div className="space-y-2">
              {report.ninetyDayMilestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {(i + 1) * 30}
                  </span>
                  <p className="text-sm text-gray-700">{milestone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.yearlyVision && (
          <div className="bg-gradient-to-r from-violet-100 to-indigo-100 rounded-xl border border-violet-200 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-2">1年後のビジョン</h3>
            <p className="text-sm text-violet-800 leading-relaxed">{report.yearlyVision}</p>
          </div>
        )}
      </div>
    </div>
  );
};
