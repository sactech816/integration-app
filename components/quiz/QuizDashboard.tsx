'use client';

import React from 'react';
import { Quiz } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils';
import { 
  Sparkles, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check,
  BarChart3,
  Calendar 
} from 'lucide-react';

interface QuizDashboardProps {
  quizzes: Quiz[];
  onEdit: (quiz: Quiz) => void;
  onDelete: (id: number) => void;
  onView: (quiz: Quiz) => void;
}

const QuizDashboard: React.FC<QuizDashboardProps> = ({
  quizzes,
  onEdit,
  onDelete,
  onView,
}) => {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const handleCopyUrl = (quiz: Quiz) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/quiz/${quiz.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(quiz.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles size={32} className="text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">診断クイズがありません</h3>
        <p className="text-gray-600">新しい診断クイズを作成しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div 
          key={quiz.id}
          className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${quiz.color}20` }}
            >
              <Sparkles size={24} style={{ color: quiz.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{quiz.title}</h3>
              <p className="text-sm text-gray-600 truncate">{quiz.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {quiz.created_at ? getRelativeTime(quiz.created_at) : '日付不明'}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 size={12} />
                  {quiz.questions?.length || 0}問
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${quiz.color}20`, color: quiz.color }}
                >
                  {quiz.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onView(quiz)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="プレビュー"
              >
                <ExternalLink size={18} />
              </button>
              <button
                onClick={() => handleCopyUrl(quiz)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="URLをコピー"
              >
                {copiedId === quiz.id ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <button
                onClick={() => onEdit(quiz)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="編集"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(quiz.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="削除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizDashboard;
