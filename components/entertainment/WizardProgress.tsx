'use client';

import { Check, Loader2 } from 'lucide-react';

export interface ProgressStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface WizardProgressProps {
  steps: ProgressStep[];
}

export default function WizardProgress({ steps }: WizardProgressProps) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 mx-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">診断を作成中...</h3>

      {/* プログレスバー */}
      <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ステップ一覧 */}
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : step.status === 'in_progress' ? (
                <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step.status === 'completed'
                  ? 'text-green-600'
                  : step.status === 'in_progress'
                    ? 'text-pink-600'
                    : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
