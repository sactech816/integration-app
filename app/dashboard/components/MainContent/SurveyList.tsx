'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Trash2,
  BarChart2,
  CalendarDays,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Survey } from '@/lib/types';

type SurveyListProps = {
  userId: string;
  isAdmin: boolean;
};

export default function SurveyList({ userId, isAdmin }: SurveyListProps) {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const loadSurveys = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const query = isAdmin
          ? supabase.from('surveys').select('*').order('created_at', { ascending: false })
          : supabase.from('surveys').select('*').eq('user_id', userId).order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        setSurveys(data || []);
      } catch (error) {
        console.error('アンケート取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadSurveys();
    }
  }, [userId, isAdmin]);

  const handleCopyUrl = (slug: string, id: number) => {
    const url = `${window.location.origin}/survey/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) return;
    if (!supabase) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('surveys').delete().eq('id', id);
      if (error) throw error;
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-teal-600 pl-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-teal-600" />
          アンケート（投票）
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <button
          onClick={() => router.push('/survey/new')}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={16} /> 新規作成
        </button>
      </div>

      {/* アンケート一覧 */}
      {surveys.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだアンケートを作成していません</p>
          <button
            onClick={() => router.push('/survey/new')}
            className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold hover:bg-teal-700"
          >
            新規作成する
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* カードヘッダー */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full font-bold bg-white/20 text-white">
                    {survey.questions?.length || 0} 問
                  </span>
                  {survey.show_results_after_submission && (
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-purple-100 text-purple-700">
                      投票モード
                    </span>
                  )}
                </div>
              </div>

              {/* カードコンテンツ */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{survey.title}</h3>
                {survey.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{survey.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {survey.created_at ? new Date(survey.created_at).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>

                {/* URL表示とコピー */}
                <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/survey/${survey.slug}`}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(survey.slug, survey.id)}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                    >
                      {copiedId === survey.id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => router.push(`/survey/editor?id=${survey.slug}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit size={14} /> 編集
                  </button>
                  <button
                    onClick={() => window.open(`/survey/${survey.slug}`, '_blank')}
                    className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink size={14} /> プレビュー
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/survey/${survey.slug}/results`)}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <BarChart2 size={14} /> 結果を見る
                  </button>
                  <button
                    onClick={() => handleDelete(survey.id, survey.title)}
                    disabled={deletingId === survey.id}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {deletingId === survey.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
