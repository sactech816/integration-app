'use client';

import { useState } from 'react';
import { PERSONAS, PersonaId, PersonaDef, getDefaultToolIds } from '@/lib/persona-config';
import { TOOL_ITEMS } from '@/app/dashboard/components/Sidebar/menuItems';
import { Check, X, ChevronRight } from 'lucide-react';

type PersonaSelectorProps = {
  onSelect: (personaId: PersonaId) => Promise<void>;
  onSkip: () => Promise<void>;
};

const colorClasses: Record<string, { bg: string; border: string; text: string; hoverBorder: string; ring: string }> = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   hoverBorder: 'hover:border-amber-400',   ring: 'ring-amber-500' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  hoverBorder: 'hover:border-indigo-400',  ring: 'ring-indigo-500' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    hoverBorder: 'hover:border-pink-400',    ring: 'ring-pink-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hoverBorder: 'hover:border-emerald-400', ring: 'ring-emerald-500' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  hoverBorder: 'hover:border-purple-400',  ring: 'ring-purple-500' },
};

export default function PersonaSelector({ onSelect, onSkip }: PersonaSelectorProps) {
  const [selected, setSelected] = useState<PersonaId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await onSelect(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getToolLabels = (persona: PersonaDef): string[] => {
    const toolIds = getDefaultToolIds(persona.id);
    return toolIds
      .map((id) => TOOL_ITEMS.find((t) => t.id === id)?.label)
      .filter((label): label is string => !!label);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-4 sm:my-8 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[85vh]">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 rounded-t-2xl shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                あなたに合ったツールセットを選びましょう
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                選んだタイプに合わせて、おすすめのツールを表示します。あとから変更できます。
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all shrink-0"
              title="スキップ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ペルソナカード一覧 */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
          {PERSONAS.map((persona) => {
            const colors = colorClasses[persona.color] || colorClasses.indigo;
            const isSelected = selected === persona.id;
            const Icon = persona.icon;
            const toolLabels = getToolLabels(persona);

            return (
              <button
                key={persona.id}
                onClick={() => setSelected(persona.id)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? `${colors.bg} ${colors.border} ring-2 ${colors.ring} shadow-md`
                    : `bg-white border-gray-200 ${colors.hoverBorder} hover:shadow-sm`
                  }
                `}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0
                    ${isSelected ? colors.bg : 'bg-gray-50'}
                  `}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? colors.text : 'text-gray-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm sm:text-base font-bold ${isSelected ? colors.text : 'text-gray-900'}`}>
                        {persona.label}
                      </h3>
                      {isSelected && (
                        <Check className={`w-5 h-5 ${colors.text}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {persona.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {toolLabels.map((label) => (
                        <span
                          key={label}
                          className={`
                            text-xs px-2 py-0.5 rounded-full
                            ${isSelected ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-600'}
                          `}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* フッター */}
        <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              後で選ぶ（全ツール表示）
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected || isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white
                shadow-md transition-all duration-200
                ${selected
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? '設定中...' : 'このタイプで始める'}
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
