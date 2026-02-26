'use client';

import { Eye, ExternalLink, Pencil } from 'lucide-react';
import type { Quiz } from '@/lib/types';

interface EntertainmentPreviewProps {
  quiz: Quiz;
  onPublish: () => void;
  onEdit: () => void;
  isPublishing: boolean;
}

export default function EntertainmentPreview({
  quiz,
  onPublish,
  onEdit,
  isPublishing,
}: EntertainmentPreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden mx-4">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <Eye className="w-5 h-5" />
          <h3 className="font-bold">プレビュー</h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* タイトル */}
        <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
        <p className="text-sm text-gray-600">{quiz.description}</p>

        {/* 質問数・結果数 */}
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-semibold">
            {quiz.questions.length}問
          </span>
          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
            {quiz.results.length}タイプ
          </span>
        </div>

        {/* 結果一覧 */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">結果タイプ:</h4>
          <div className="grid grid-cols-2 gap-2">
            {quiz.results.map((result) => (
              <div
                key={result.type}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <p className="text-sm font-semibold text-gray-900">{result.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                  {result.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500
              text-white font-bold rounded-xl shadow-md hover:shadow-lg
              disabled:opacity-50 transition-all duration-200 min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4" />
            {isPublishing ? '公開中...' : '公開する'}
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300
              text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50
              transition-all duration-200 min-h-[44px]"
          >
            <Pencil className="w-4 h-4" />
            編集
          </button>
        </div>
      </div>
    </div>
  );
}
