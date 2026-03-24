'use client';

import { useState } from 'react';
import {
  Building2, Users, TrendingUp, Calendar, MapPin, Briefcase,
  Monitor, Wrench, ChevronRight, Loader2, Sparkles,
} from 'lucide-react';
import type { BusinessInfo } from '@/lib/subsidy/types';
import {
  INDUSTRY_OPTIONS,
  EMPLOYEE_COUNT_OPTIONS,
  ANNUAL_REVENUE_OPTIONS,
  YEARS_IN_BUSINESS_OPTIONS,
  CORPORATION_TYPE_OPTIONS,
  PREFECTURE_OPTIONS,
} from '@/lib/subsidy/types';

interface Props {
  onSubmit: (info: BusinessInfo) => void;
  loading: boolean;
}

export default function SubsidyDiagnosisForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<BusinessInfo>({
    industry: '',
    employeeCount: '',
    annualRevenue: '',
    yearsInBusiness: '',
    corporationType: '',
    prefecture: '',
    businessDescription: '',
    hasItPlan: false,
    hasEquipmentPlan: false,
    isSmallBusiness: false,
  });

  const [step, setStep] = useState(0);

  const updateField = <K extends keyof BusinessInfo>(key: K, value: BusinessInfo[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // 小規模事業者の自動判定
    const isSmall =
      (form.employeeCount === '1-5') ||
      (form.employeeCount === '6-20' && ['製造業', '建設業', '運輸業'].includes(form.industry));
    onSubmit({ ...form, isSmallBusiness: isSmall });
  };

  const isStep1Complete = form.industry && form.employeeCount && form.annualRevenue && form.corporationType;
  const isStep2Complete = form.yearsInBusiness && form.prefecture;
  const canSubmit = isStep1Complete && isStep2Complete && form.businessDescription.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Step 1: 基本情報 */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
        <button
          onClick={() => setStep(step === 0 ? -1 : 0)}
          className="w-full bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-teal-900">
            <Building2 className="text-teal-600" size={20} />
            基本情報
          </h2>
          <div className="flex items-center gap-2">
            {isStep1Complete && (
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">入力済み</span>
            )}
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${step === 0 ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {step === 0 && (
          <div className="p-6 space-y-5">
            {/* 業種 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Briefcase size={14} className="inline mr-1" />業種
              </label>
              <select
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">選択してください</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* 従業員数 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Users size={14} className="inline mr-1" />従業員数
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('employeeCount', opt.value)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.employeeCount === opt.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 売上規模 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <TrendingUp size={14} className="inline mr-1" />年間売上
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ANNUAL_REVENUE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('annualRevenue', opt.value)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.annualRevenue === opt.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 法人形態 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">法人形態</label>
              <select
                value={form.corporationType}
                onChange={(e) => updateField('corporationType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">選択してください</option>
                {CORPORATION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!isStep1Complete}
              className="w-full h-12 font-semibold text-white bg-teal-600 rounded-xl shadow-md hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              次へ <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Step 2: 詳細情報 */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
        <button
          onClick={() => setStep(step === 1 ? -1 : 1)}
          className="w-full bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-teal-900">
            <Calendar className="text-teal-600" size={20} />
            詳細情報
          </h2>
          <div className="flex items-center gap-2">
            {isStep2Complete && (
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">入力済み</span>
            )}
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${step === 1 ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {step === 1 && (
          <div className="p-6 space-y-5">
            {/* 事業年数 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">事業年数</label>
              <div className="grid grid-cols-2 gap-2">
                {YEARS_IN_BUSINESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('yearsInBusiness', opt.value)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.yearsInBusiness === opt.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 所在地 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <MapPin size={14} className="inline mr-1" />所在地
              </label>
              <select
                value={form.prefecture}
                onChange={(e) => updateField('prefecture', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">都道府県を選択</option>
                {PREFECTURE_OPTIONS.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            {/* IT導入・設備投資 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">今後の計画</label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-teal-300 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasItPlan}
                  onChange={(e) => updateField('hasItPlan', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-teal-600" />
                  <span className="text-sm text-gray-900">ITツール・ソフトウェアの導入を予定している</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-teal-300 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasEquipmentPlan}
                  onChange={(e) => updateField('hasEquipmentPlan', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-teal-600" />
                  <span className="text-sm text-gray-900">設備投資・機械導入を予定している</span>
                </div>
              </label>
            </div>

            {/* 事業概要 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">事業概要</label>
              <textarea
                value={form.businessDescription}
                onChange={(e) => updateField('businessDescription', e.target.value)}
                placeholder="事業の内容を簡単に教えてください（例：地域密着型の飲食店を3店舗経営。テイクアウトやデリバリーの拡大を検討中）"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  診断中...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  補助金を診断する
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
